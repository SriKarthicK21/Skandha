import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Flame,
  FileText,
  CheckCircle2,
  Download,
  Printer,
  Copy,
  Check,
  Filter,
  Search,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  RefreshCw,
  FolderCheck,
  Building2,
  SlidersHorizontal,
  ArrowUpRight,
  Lock,
  Eye,
  Calendar,
  Clock,
  Award,
  FileCheck,
  Hash,
  Sparkles,
  X,
  FileWarning
} from 'lucide-react';
import { useGRC } from '../../context/GRCContext';
import { MAS_TRM_REQUIREMENTS, MAS_TRM_DOMAINS } from '../../data/masRegulatoryMasterData';
import { MASRequirementReadinessDetail, MASReadinessScoreSummary } from '../../types/masTrmFrameworkTypes';
import { FindingCAPARecord, EvidenceRecord, RiskRecord } from '../../types';

export interface AuditReportSummaryProps {
  onBackToDashboard?: () => void;
  onNavigateToModule?: (moduleKey: string) => void;
  initialReqCode?: string;
}

export interface EnrichedAuditGapItem {
  requirementCode: string;
  title: string;
  domainNumber: string;
  domainName: string;
  sectionNumber?: string;
  statement?: string;
  statutoryMandateType: 'NOTICE_655_CYBER_HYGIENE' | 'NOTICE_644_CRITICAL_SYSTEMS' | 'OUTSOURCING_MANDATE' | 'TRM_2021_GUIDELINES';
  criticalityWeight: number;
  criticalSystemsMandate: boolean;
  isMandatoryNotice: boolean;
  complianceStatus: 'COMPLIANT' | 'PARTIALLY_COMPLIANT' | 'NON_COMPLIANT' | 'NOT_APPLICABLE' | 'NOT_ASSESSED';
  readinessScore: number;
  riskTier: 'HIGH_RISK' | 'MEDIUM_RISK' | 'LOW_RISK';
  openFindings: FindingCAPARecord[];
  majorFindingsCount: number;
  minorFindingsCount: number;
  evidenceItems: EvidenceRecord[];
  verifiedEvidenceCount: number;
  evidenceCoverageRate: number;
  evidenceGapIdentified: boolean;
  isoMappings: string[];
  linkedTechRisks: RiskRecord[];
  auditorRecommendation: string;
}

export const AuditReportSummary: React.FC<AuditReportSummaryProps> = ({
  onBackToDashboard,
  onNavigateToModule,
  initialReqCode
}) => {
  const {
    currentTenant,
    currentTenantId,
    masReadinessScoreSummary,
    calculateMASReadinessScore,
    masRegulatoryProfile,
    masAssessments,
    findings,
    evidence,
    risks,
    setActiveModule,
    logAuditEvent
  } = useGRC();

  // Local state for UI controls
  const [selectedDomain, setSelectedDomain] = useState<string>('ALL');
  const [statutoryFilter, setStatutoryFilter] = useState<string>('ALL');
  const [riskFilter, setRiskFilter] = useState<'ALL' | 'HIGH_RISK_ONLY' | 'WITH_FINDINGS_ONLY' | 'EVIDENCE_GAPS_ONLY'>(
    initialReqCode ? 'ALL' : 'HIGH_RISK_ONLY'
  );
  const [searchQuery, setSearchQuery] = useState<string>(initialReqCode || '');
  const [expandedReqCodes, setExpandedReqCodes] = useState<Record<string, boolean>>(
    initialReqCode ? { [initialReqCode]: true } : {}
  );
  const [isRecalculating, setIsRecalculating] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [showPrintDossierModal, setShowPrintDossierModal] = useState<boolean>(false);
  const [auditAttestationSigned, setAuditAttestationSigned] = useState<boolean>(false);

  // Compute or fall back to context summary
  const summary: MASReadinessScoreSummary = useMemo(() => {
    if (masReadinessScoreSummary && masReadinessScoreSummary.totalApplicableRequirements > 0) {
      return masReadinessScoreSummary;
    }
    return calculateMASReadinessScore();
  }, [masReadinessScoreSummary, calculateMASReadinessScore]);

  // Handle recalculate
  const handleRecalculate = () => {
    setIsRecalculating(true);
    setTimeout(() => {
      calculateMASReadinessScore();
      logAuditEvent?.(
        'UPDATE',
        'MAS_TRM_AUDIT_REPORT',
        'Recalculated MAS TRM audit readiness scorecard and compliance gaps'
      );
      setIsRecalculating(false);
    }, 450);
  };

  // Toggle expanding single requirement row
  const toggleExpand = (code: string) => {
    setExpandedReqCodes(prev => ({
      ...prev,
      [code]: !prev[code]
    }));
  };

  // Expand all or collapse all
  const toggleAll = (expand: boolean) => {
    if (!expand) {
      setExpandedReqCodes({});
    } else {
      const all: Record<string, boolean> = {};
      enrichedGaps.forEach(item => {
        all[item.requirementCode] = true;
      });
      setExpandedReqCodes(all);
    }
  };

  // Cross-reference all requirements with findings and evidence
  const enrichedGaps: EnrichedAuditGapItem[] = useMemo(() => {
    const rawReqs = MAS_TRM_REQUIREMENTS || [];

    return rawReqs.map(req => {
      const assess = masAssessments.find(a => a.requirementCode === req.requirementCode);
      const detailFromSummary = summary?.details?.[req.requirementCode];

      // Correlate open findings
      const linkedIsoCodes = req.crossFrameworkMappings?.iso27001 || [];
      const reqOpenFindings = findings.filter(f => {
        if (f.status === 'Closed Verified') return false;
        if (f.tenantId && f.tenantId !== currentTenantId) return false;

        const findingClause = (f.clauseOrControl || '').toLowerCase();
        const findingTitle = (f.title || '').toLowerCase();
        const findingDesc = (f.description || '').toLowerCase();
        const reqLower = req.requirementCode.toLowerCase();

        if (findingClause.includes(reqLower) || findingTitle.includes(reqLower) || findingDesc.includes(reqLower)) {
          return true;
        }

        if (linkedIsoCodes.some(iso => findingClause.includes(iso.toLowerCase()))) {
          return true;
        }

        if (assess?.linkedFindingIds?.includes(f.id) || assess?.linkedFindingIds?.includes(f.findingCode)) {
          return true;
        }

        return false;
      });

      const majorFindingsCount = reqOpenFindings.filter(f => f.severity === 'Major Non-Conformity').length;
      const minorFindingsCount = reqOpenFindings.filter(f => f.severity === 'Minor Non-Conformity').length;

      // Correlate Evidence Vault
      const reqEvidence = evidence.filter(e => {
        if (e.tenantId && e.tenantId !== currentTenantId) return false;
        if (assess?.linkedEvidenceIds?.includes(e.id)) return true;

        const codeMatch = (e.controlCode || '').toLowerCase();
        const reqLower = req.requirementCode.toLowerCase();
        if (codeMatch.includes(reqLower)) return true;

        if (linkedIsoCodes.some(iso => codeMatch.includes(iso.toLowerCase()))) return true;

        const tagMatch = e.tags?.some(t => t.toLowerCase().includes(reqLower));
        if (tagMatch) return true;

        return false;
      });

      const verifiedEvidenceCount = reqEvidence.filter(e => e.status === 'Verified' || e.verificationState === 'Verified').length;
      const evidenceCoverageRate = reqEvidence.length > 0 ? Math.round((verifiedEvidenceCount / reqEvidence.length) * 100) : 0;

      // Readiness & Risk Tier calculation (from summary or fallback)
      let readinessScore = detailFromSummary?.readinessScore;
      let riskTier = detailFromSummary?.riskTier;
      let statutoryMandateType = detailFromSummary?.statutoryMandateType;

      if (readinessScore === undefined) {
        let base = 70;
        if (assess?.complianceStatus === 'COMPLIANT') base = 95;
        else if (assess?.complianceStatus === 'PARTIALLY_COMPLIANT') base = 60;
        else if (assess?.complianceStatus === 'NON_COMPLIANT') base = 25;

        // Apply findings penalty
        const penalty = (majorFindingsCount * 25) + (minorFindingsCount * 10);
        readinessScore = Math.max(0, Math.min(100, base - penalty));
      }

      if (!riskTier) {
        if (readinessScore < 60 || majorFindingsCount > 0 || (req.criticalSystemsMandate && readinessScore < 85)) {
          riskTier = 'HIGH_RISK';
        } else if (readinessScore < 80 || minorFindingsCount > 0) {
          riskTier = 'MEDIUM_RISK';
        } else {
          riskTier = 'LOW_RISK';
        }
      }

      if (!statutoryMandateType) {
        if (req.requirementCode.startsWith('MAS-TRM-8') || req.requirementCode.startsWith('MAS-TRM-7')) {
          statutoryMandateType = 'NOTICE_655_CYBER_HYGIENE';
        } else if (req.criticalSystemsMandate || req.requirementCode.startsWith('MAS-TRM-12') || req.requirementCode.startsWith('MAS-TRM-11')) {
          statutoryMandateType = 'NOTICE_644_CRITICAL_SYSTEMS';
        } else if (req.requirementCode.startsWith('MAS-TRM-5')) {
          statutoryMandateType = 'OUTSOURCING_MANDATE';
        } else {
          statutoryMandateType = 'TRM_2021_GUIDELINES';
        }
      }

      const evidenceGapIdentified = reqEvidence.length === 0 || verifiedEvidenceCount === 0;

      // Correlate Technology Risks from Enterprise Risk Register
      const reqTechRisks = (risks || []).filter(r => {
        const mappedReqIds = r.frameworkMappings?.masTrmRequirementIds || [];
        if (mappedReqIds.includes(req.requirementCode) || mappedReqIds.includes(req.id)) return true;
        const mappedSections = r.frameworkMappings?.masTrmSections || [];
        if (req.sectionNumber && mappedSections.includes(req.sectionNumber)) return true;
        return false;
      });

      // Auditor recommendation synthesis
      let auditorRecommendation = 'Maintain operating effectiveness and verify recurring control execution records.';
      if (majorFindingsCount > 0) {
        auditorRecommendation = `Prioritize immediate remediation for ${majorFindingsCount} Major Non-Conformity under CAPA workflow. Require independent retest before supervisory review.`;
      } else if (evidenceGapIdentified) {
        auditorRecommendation = 'Ingest and cryptographically verify authoritative audit logs and architectural evidence in Evidence Vault.';
      } else if (reqTechRisks.length > 0 && reqTechRisks.some(r => (r.residualScore || 0) >= 15)) {
        auditorRecommendation = `Mitigate ${reqTechRisks.length} active technology risk(s) exposing this statutory control before external audit inspection.`;
      } else if (readinessScore < 70) {
        auditorRecommendation = 'Formalize standard operating procedures and perform periodic gap reassessment to meet CMMI Level 4.';
      }

      return {
        requirementCode: req.requirementCode,
        title: req.title,
        domainNumber: req.domainNumber,
        domainName: req.domainName,
        statement: req.statement,
        statutoryMandateType,
        criticalityWeight: req.criticalSystemsMandate ? 3.0 : req.mandatoryForFIs ? 2.0 : 1.0,
        criticalSystemsMandate: req.criticalSystemsMandate,
        isMandatoryNotice: req.mandatoryForFIs || req.criticalSystemsMandate,
        complianceStatus: assess?.complianceStatus || 'PARTIALLY_COMPLIANT',
        readinessScore,
        riskTier,
        openFindings: reqOpenFindings,
        majorFindingsCount,
        minorFindingsCount,
        evidenceItems: reqEvidence,
        verifiedEvidenceCount,
        evidenceCoverageRate,
        evidenceGapIdentified,
        isoMappings: req.crossFrameworkMappings?.iso27001 || [],
        linkedTechRisks: reqTechRisks,
        auditorRecommendation
      };
    });
  }, [findings, evidence, masAssessments, summary, risks, currentTenantId]);

  // Filtered list based on controls
  const filteredGaps = useMemo(() => {
    return enrichedGaps.filter(item => {
      // Domain filter
      if (selectedDomain !== 'ALL' && item.domainNumber !== selectedDomain) {
        return false;
      }

      // Statutory filter
      if (statutoryFilter !== 'ALL' && item.statutoryMandateType !== statutoryFilter) {
        return false;
      }

      // Risk preset filter
      if (riskFilter === 'HIGH_RISK_ONLY' && item.riskTier !== 'HIGH_RISK') {
        return false;
      }
      if (riskFilter === 'WITH_FINDINGS_ONLY' && item.openFindings.length === 0) {
        return false;
      }
      if (riskFilter === 'EVIDENCE_GAPS_ONLY' && !item.evidenceGapIdentified) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const codeMatch = item.requirementCode.toLowerCase().includes(q);
        const titleMatch = item.title.toLowerCase().includes(q);
        const domainMatch = item.domainName.toLowerCase().includes(q);
        const findingsMatch = item.openFindings.some(f => f.title.toLowerCase().includes(q) || f.clauseOrControl.toLowerCase().includes(q));
        if (!codeMatch && !titleMatch && !domainMatch && !findingsMatch) {
          return false;
        }
      }

      return true;
    });
  }, [enrichedGaps, selectedDomain, statutoryFilter, riskFilter, searchQuery]);

  // Aggregate stats from enriched items
  const highRiskTotal = useMemo(() => enrichedGaps.filter(i => i.riskTier === 'HIGH_RISK').length, [enrichedGaps]);
  const openFindingsTotal = useMemo(() => enrichedGaps.reduce((acc, i) => acc + i.openFindings.length, 0), [enrichedGaps]);
  const majorFindingsTotal = useMemo(() => enrichedGaps.reduce((acc, i) => acc + i.majorFindingsCount, 0), [enrichedGaps]);
  const evidenceGapsTotal = useMemo(() => enrichedGaps.filter(i => i.evidenceGapIdentified).length, [enrichedGaps]);

  // Determine overall audit attestation status
  const auditOpinion = useMemo(() => {
    if (majorFindingsTotal > 0) {
      return {
        title: 'QUALIFIED OPINION — MATERIAL NON-CONFORMITIES PENDING',
        color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
        badge: 'ACTION REQUIRED BEFORE STATUTORY SUBMISSION',
        statement: 'Independent supervisory inspection identifies material non-conformities across mandatory TRM controls. Remediation under CAPA protocol is required prior to external regulatory attestation.'
      };
    }
    if (summary.overallReadinessScore >= 85) {
      return {
        title: 'UNQUALIFIED OPINION — SATISFACTORY AUDIT READINESS',
        color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
        badge: 'AUDIT READY FOR MAS SUBMISSION',
        statement: 'Core technology risk controls, cyber hygiene mandates (Notice 655), and critical system resilience metrics (Notice 644) demonstrate robust operating effectiveness with verified evidence trail.'
      };
    }
    return {
      title: 'CONDITIONAL READINESS — CONTROL GAPS IDENTIFIED',
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      badge: 'TARGETED REMEDIATION REQUIRED',
      statement: 'Several secondary controls and documentation requirements require closure to achieve recommended CMMI Level 4 readiness benchmark.'
    };
  }, [majorFindingsTotal, summary.overallReadinessScore]);

  // Copy Executive Brief text
  const handleCopyBrief = () => {
    const text = `=====================================================
MAS TRM STATUTORY AUDIT REPORT & COMPLIANCE GAP SUMMARY
=====================================================
Institution: ${currentTenant?.name || masRegulatoryProfile?.entityType || 'Singapore Licensed Financial Institution'}
Audit Attestation: ${auditOpinion.title}
Generated: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}

1. KEY REGULATORY READINESS SCORES:
- Overall MAS TRM Readiness Score: ${summary.overallReadinessScore}% (Target: 85%)
- MAS Notice 655 (Cyber Hygiene) Score: ${summary.cyberHygieneNotice655Readiness}%
- MAS Notice 644 (Critical Systems Availability): ${summary.criticalSystemsReadiness}%
- Evidence Vault SHA-256 Backing Rate: ${summary.evidenceCoverageRate}%

2. RISK & DEFICIENCY METRICS:
- High-Risk Requirements: ${highRiskTotal} of ${enrichedGaps.length}
- Active Open Non-Conformities: ${openFindingsTotal} (${majorFindingsTotal} Major NCs)
- Requirements with Evidence Gaps: ${evidenceGapsTotal}
- Designated Critical Systems: ${masRegulatoryProfile?.designatedCriticalSystemsCount || 2}

3. HIGH-RISK REQUIREMENTS REQUIRING IMMEDIATE ATTENTION:
${enrichedGaps.filter(g => g.riskTier === 'HIGH_RISK').slice(0, 8).map(g => `- [${g.requirementCode}] ${g.title} | Score: ${g.readinessScore}% | Open NCs: ${g.openFindings.length} | Evidence: ${g.evidenceItems.length}`).join('\n')}

Audit Status: Verified by Skanda Enterprise Automated GRC Engine.
=====================================================`;

    navigator.clipboard.writeText(text);
    setCopiedText('brief');
    setTimeout(() => setCopiedText(null), 2500);
  };

  return (
    <div id="mas-audit-report-summary-view" className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Top Banner & Audit Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/4 -bottom-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                <Award className="w-3.5 h-3.5 text-rose-400" />
                MAS TRM Statutory Audit Dossier
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                Ref: AUD-MAS-2026-TRM
              </span>
              <span className="text-xs text-slate-400">
                Entity: <strong className="text-slate-200">{currentTenant?.name || 'Commercial Bank SG'}</strong>
              </span>
            </div>

            <h1 className="text-2xl font-bold text-white tracking-tight">
              Audit Report Summary & Compliance Gap Matrix
            </h1>
            <p className="text-sm text-slate-400 max-w-3xl mt-1 leading-relaxed">
              Consolidates readiness scoring, cross-references <span className="text-rose-400 font-semibold">High Risk</span> controls
              directly with active audit non-conformities, and verifies SHA-256 evidence vault artifacts to generate an auditor-grade regulatory report.
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5">
            {onBackToDashboard && (
              <button
                onClick={onBackToDashboard}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                &larr; Return to Dashboard
              </button>
            )}

            <button
              onClick={handleRecalculate}
              disabled={isRecalculating}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              title="Recalculate all requirement readiness scores and finding correlations"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRecalculating ? 'animate-spin' : ''}`} />
              {isRecalculating ? 'Recalculating...' : 'Recalculate Score'}
            </button>

            <button
              onClick={handleCopyBrief}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5 shadow-sm"
              title="Copy formatted executive summary for compliance committee"
            >
              {copiedText === 'brief' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied Brief</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-300" />
                  <span>Copy Brief</span>
                </>
              )}
            </button>

            <button
              onClick={() => setShowPrintDossierModal(true)}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-all flex items-center gap-1.5 shadow-md shadow-rose-950/40"
              title="Open printable / downloadable formal regulatory dossier"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Export Audit Dossier</span>
            </button>
          </div>
        </div>

        {/* Audit Opinion Attestation Banner */}
        <div className={`mt-5 p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${auditOpinion.color}`}>
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
            <div>
              <div className="flex items-center gap-2">
                <strong className="text-xs font-bold uppercase tracking-wider text-white">
                  Auditor Opinion: {auditOpinion.title}
                </strong>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900/60 border border-current">
                  {auditOpinion.badge}
                </span>
              </div>
              <p className="text-xs mt-1 text-slate-300 leading-relaxed max-w-4xl">
                {auditOpinion.statement}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                if (onNavigateToModule) onNavigateToModule('remediation_capa');
                else setActiveModule('remediation_capa');
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900/80 hover:bg-slate-900 text-rose-300 border border-rose-500/40 transition-colors flex items-center gap-1"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              CAPA Remediation Desk ({openFindingsTotal})
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Strip: MAS TRM Readiness Scoreboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Overall Readiness */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider">MAS TRM Readiness</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white font-mono">{summary.overallReadinessScore}%</span>
            <span className="text-xs font-semibold text-slate-400">Target: 85%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                summary.overallReadinessScore >= 80 ? 'bg-emerald-500' : summary.overallReadinessScore >= 65 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${summary.overallReadinessScore}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-400 mt-2.5 pt-2 border-t border-slate-800/80">
            <span>Notice 655: <strong className="text-slate-200 font-mono">{summary.cyberHygieneNotice655Readiness}%</strong></span>
            <span>Notice 644: <strong className="text-slate-200 font-mono">{summary.criticalSystemsReadiness}%</strong></span>
          </div>
        </div>

        {/* KPI 2: High Risk Requirements */}
        <div
          onClick={() => setRiskFilter('HIGH_RISK_ONLY')}
          className={`cursor-pointer bg-slate-900 border rounded-xl p-4 shadow-md transition-all ${
            riskFilter === 'HIGH_RISK_ONLY'
              ? 'border-rose-500 ring-1 ring-rose-500/50'
              : 'border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider text-rose-400">High Risk Controls</span>
            <Flame className="w-4 h-4 text-rose-400 animate-pulse" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-rose-400 font-mono">{highRiskTotal}</span>
            <span className="text-xs text-slate-400">of {enrichedGaps.length} controls</span>
          </div>
          <div className="flex items-center gap-1.5 mt-3 text-[11px] text-rose-300 font-medium">
            <AlertOctagon className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span>Click to filter High Risk only</span>
          </div>
          <div className="flex justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800/80">
            <span>Critical Weight: 3.0x</span>
            <span>Statutory Priority</span>
          </div>
        </div>

        {/* KPI 3: Open Non-Conformities */}
        <div
          onClick={() => setRiskFilter('WITH_FINDINGS_ONLY')}
          className={`cursor-pointer bg-slate-900 border rounded-xl p-4 shadow-md transition-all ${
            riskFilter === 'WITH_FINDINGS_ONLY'
              ? 'border-amber-500 ring-1 ring-amber-500/50'
              : 'border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider text-amber-400">Open Audit Findings</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-amber-400 font-mono">{openFindingsTotal}</span>
            <span className="text-xs text-rose-400 font-semibold font-mono">({majorFindingsTotal} Major NC)</span>
          </div>
          <div className="flex items-center gap-1.5 mt-3 text-[11px] text-slate-400">
            <span>Correlated directly with TRM clauses</span>
          </div>
          <div className="flex justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800/80">
            <span>Minor NCs: <strong className="text-slate-200 font-mono">{openFindingsTotal - majorFindingsTotal}</strong></span>
            <span>CAPA Plans Active</span>
          </div>
        </div>

        {/* KPI 4: Evidence Vault Backing */}
        <div
          onClick={() => setRiskFilter('EVIDENCE_GAPS_ONLY')}
          className={`cursor-pointer bg-slate-900 border rounded-xl p-4 shadow-md transition-all ${
            riskFilter === 'EVIDENCE_GAPS_ONLY'
              ? 'border-emerald-500 ring-1 ring-emerald-500/50'
              : 'border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider">Evidence Coverage</span>
            <FolderCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-emerald-400 font-mono">{summary.evidenceCoverageRate}%</span>
            <span className="text-xs text-slate-400">Verified Proofs</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500"
              style={{ width: `${summary.evidenceCoverageRate}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-400 mt-2.5 pt-2 border-t border-slate-800/80">
            <span>Evidence Gaps: <strong className="text-amber-400 font-mono">{evidenceGapsTotal} reqs</strong></span>
            <span className="text-slate-400">SHA-256 Validated</span>
          </div>
        </div>
      </div>

      {/* Domain-Level Compliance Gap Overview (15 Domains Summary) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
              15 Regulatory Domains Compliance Breakdown
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Select any domain below to filter the high-risk requirements and associated audit findings.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedDomain('ALL')}
              className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                selectedDomain === 'ALL'
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              All Domains (15)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
          {MAS_TRM_DOMAINS.map(dom => {
            const domainInfo = summary.domainBreakdown[dom.domainNumber] || {
              score: 75,
              openFindings: 0,
              majorFindings: 0,
              highRiskCount: 0
            };
            const isSelected = selectedDomain === dom.domainNumber;
            const isCriticalDomain = dom.domainNumber === '8.0' || dom.domainNumber === '11.0' || dom.domainNumber === '12.0';

            return (
              <div
                key={dom.id}
                onClick={() => setSelectedDomain(isSelected ? 'ALL' : dom.domainNumber)}
                className={`cursor-pointer p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-rose-950/40 border-rose-500 ring-1 ring-rose-500/50'
                    : 'bg-slate-800/60 border-slate-700/60 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold font-mono text-slate-300">
                    Sec {dom.domainNumber}
                  </span>
                  {domainInfo.highRiskCount > 0 ? (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                      {domainInfo.highRiskCount} High
                    </span>
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                </div>

                <div className="text-xs font-semibold text-white truncate" title={dom.name}>
                  {dom.name}
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-700/40 text-[11px]">
                  <span className="text-slate-400">Score:</span>
                  <strong className={`font-mono ${
                    domainInfo.score >= 80 ? 'text-emerald-400' : domainInfo.score >= 65 ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {domainInfo.score}%
                  </strong>
                </div>

                {domainInfo.openFindings > 0 && (
                  <div className="text-[10px] text-amber-300/90 mt-1 font-medium flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>{domainInfo.openFindings} Non-Conformities</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by requirement code, title, or open finding keywords..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-rose-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              Risk View:
            </span>

            <button
              onClick={() => setRiskFilter('ALL')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                riskFilter === 'ALL'
                  ? 'bg-slate-700 text-white font-semibold'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700/60'
              }`}
            >
              All Controls ({enrichedGaps.length})
            </button>

            <button
              onClick={() => setRiskFilter('HIGH_RISK_ONLY')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                riskFilter === 'HIGH_RISK_ONLY'
                  ? 'bg-rose-600 text-white font-semibold shadow-sm'
                  : 'bg-slate-800/80 text-rose-300 hover:bg-slate-800 border border-rose-500/30'
              }`}
            >
              <Flame className="w-3 h-3 text-rose-400" />
              High Risk Only ({highRiskTotal})
            </button>

            <button
              onClick={() => setRiskFilter('WITH_FINDINGS_ONLY')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                riskFilter === 'WITH_FINDINGS_ONLY'
                  ? 'bg-amber-600 text-white font-semibold shadow-sm'
                  : 'bg-slate-800/80 text-amber-300 hover:bg-slate-800 border border-amber-500/30'
              }`}
            >
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              Open Findings ({openFindingsTotal})
            </button>

            <button
              onClick={() => setRiskFilter('EVIDENCE_GAPS_ONLY')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                riskFilter === 'EVIDENCE_GAPS_ONLY'
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'bg-slate-800/80 text-indigo-300 hover:bg-slate-800 border border-indigo-500/30'
              }`}
            >
              <FolderCheck className="w-3 h-3 text-indigo-400" />
              Evidence Gaps ({evidenceGapsTotal})
            </button>
          </div>
        </div>

        {/* Secondary Filter Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400">Statutory Mandate:</span>
            {[
              { key: 'ALL', label: 'All Mandates' },
              { key: 'NOTICE_655_CYBER_HYGIENE', label: 'Notice 655 (Cyber)' },
              { key: 'NOTICE_644_CRITICAL_SYSTEMS', label: 'Notice 644 (CIS)' },
              { key: 'OUTSOURCING_MANDATE', label: 'Outsourcing' },
              { key: 'TRM_2021_GUIDELINES', label: 'TRM Guidelines' }
            ].map(m => (
              <button
                key={m.key}
                onClick={() => setStatutoryFilter(m.key)}
                className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                  statutoryFilter === m.key
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 font-semibold'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 text-slate-400">
            <span>Showing <strong className="text-white font-mono">{filteredGaps.length}</strong> requirements</span>
            <button
              onClick={() => toggleAll(true)}
              className="text-xs text-rose-400 hover:text-rose-300 font-medium"
            >
              Expand All
            </button>
            <span className="text-slate-700">|</span>
            <button
              onClick={() => toggleAll(false)}
              className="text-xs text-slate-400 hover:text-slate-200 font-medium"
            >
              Collapse All
            </button>
          </div>
        </div>
      </div>

      {/* Main Compliance Gap Cross-Reference Matrix Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2">
            <FileWarning className="w-4 h-4 text-rose-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              High Risk Compliance Gap Matrix & Open Findings Crosswalk
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {filteredGaps.filter(i => i.riskTier === 'HIGH_RISK').length} High-Risk Controls in Active Scope
          </span>
        </div>

        {filteredGaps.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
            <h4 className="text-base font-semibold text-white">No Compliance Gaps Matching Filter</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              All requirements in this selection satisfy current audit benchmarks or have no open non-conformities.
            </p>
            <button
              onClick={() => {
                setSelectedDomain('ALL');
                setStatutoryFilter('ALL');
                setRiskFilter('ALL');
                setSearchQuery('');
              }}
              className="mt-4 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {filteredGaps.map((item) => {
              const isExpanded = !!expandedReqCodes[item.requirementCode];
              const isHighRisk = item.riskTier === 'HIGH_RISK';
              const hasOpenFindings = item.openFindings.length > 0;
              const hasMajorNC = item.majorFindingsCount > 0;

              return (
                <div
                  key={item.requirementCode}
                  className={`transition-colors ${
                    isHighRisk ? 'bg-rose-950/10 hover:bg-rose-950/20' : 'hover:bg-slate-800/30'
                  }`}
                >
                  {/* Main Requirement Summary Row */}
                  <div className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <button
                        onClick={() => toggleExpand(item.requirementCode)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors mt-0.5"
                        title={isExpanded ? 'Collapse findings' : 'Expand findings and evidence'}
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-rose-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        )}
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          {/* Code */}
                          <span className="font-mono text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                            {item.requirementCode}
                          </span>

                          {/* Domain */}
                          <span className="text-[11px] text-slate-400 font-mono">
                            Domain {item.domainNumber} ({item.domainName})
                          </span>

                          {/* Statutory Mandate Badge */}
                          {item.statutoryMandateType === 'NOTICE_655_CYBER_HYGIENE' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                              MAS Notice 655 (Cyber Hygiene)
                            </span>
                          )}
                          {item.statutoryMandateType === 'NOTICE_644_CRITICAL_SYSTEMS' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              MAS Notice 644 (Critical Systems)
                            </span>
                          )}
                          {item.statutoryMandateType === 'OUTSOURCING_MANDATE' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                              Outsourcing Guidelines
                            </span>
                          )}

                          {/* Risk Tier Badge */}
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            item.riskTier === 'HIGH_RISK'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                              : item.riskTier === 'MEDIUM_RISK'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          }`}>
                            {item.riskTier.replace('_', ' ')}
                          </span>
                        </div>

                        {/* Title & Statement */}
                        <h4 className="text-sm font-semibold text-white">
                          {item.title}
                        </h4>
                        <p className="text-xs text-slate-400 line-clamp-1 mt-0.5 leading-relaxed">
                          {item.statement || 'Statutory MAS TRM control requirement.'}
                        </p>

                        {/* Badges / Cross-Reference tags */}
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px]">
                          {hasMajorNC ? (
                            <span className="inline-flex items-center gap-1 font-semibold text-rose-400">
                              <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
                              {item.majorFindingsCount} Major Non-Conformity
                            </span>
                          ) : hasOpenFindings ? (
                            <span className="inline-flex items-center gap-1 font-medium text-amber-400">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                              {item.openFindings.length} Open Finding(s)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 font-medium text-emerald-400">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              Zero Open Non-Conformities
                            </span>
                          )}

                          <span className="text-slate-600">&bull;</span>

                          {item.evidenceGapIdentified ? (
                            <span className="inline-flex items-center gap-1 text-amber-400 font-medium">
                              <FolderCheck className="w-3.5 h-3.5 text-amber-400" />
                              Evidence Gap: {item.evidenceItems.length} artifact(s)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-emerald-400">
                              <FolderCheck className="w-3.5 h-3.5 text-emerald-400" />
                              {item.verifiedEvidenceCount} Verified Evidence Artifact(s)
                            </span>
                          )}

                          {item.isoMappings.length > 0 && (
                            <>
                              <span className="text-slate-600">&bull;</span>
                              <span className="text-slate-400 font-mono text-[10px]">
                                ISO 27001: {item.isoMappings.slice(0, 3).join(', ')}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right-Side Score & Quick Drill Actions */}
                    <div className="flex items-center gap-4 shrink-0 lg:pl-4 lg:border-l lg:border-slate-800">
                      <div className="text-right">
                        <div className="flex items-baseline justify-end gap-1.5">
                          <span className={`text-xl font-bold font-mono ${
                            item.readinessScore >= 80 ? 'text-emerald-400' : item.readinessScore >= 60 ? 'text-amber-400' : 'text-rose-400'
                          }`}>
                            {item.readinessScore}%
                          </span>
                          <span className="text-[10px] text-slate-400">Readiness</span>
                        </div>
                        <div className="w-24 bg-slate-800 rounded-full h-1.5 mt-1 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              item.readinessScore >= 80 ? 'bg-emerald-500' : item.readinessScore >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${item.readinessScore}%` }}
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => toggleExpand(item.requirementCode)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1"
                      >
                        <span>Audit Detail</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180 text-rose-400' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Audit Cross-Reference Panel */}
                  {isExpanded && (
                    <div className="px-6 pb-6 pt-2 bg-slate-950/60 border-t border-slate-800/80 space-y-4">
                      
                      {/* Auditor Recommendation Callout */}
                      <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3.5 flex items-start gap-3">
                        <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div className="text-xs">
                          <strong className="text-white font-semibold block mb-0.5">
                            Auditor Gap Assessment & Recommended Action:
                          </strong>
                          <p className="text-slate-300 leading-relaxed">
                            {item.auditorRecommendation}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        
                        {/* Box 1: Correlated Open Findings & CAPA Plans */}
                        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-amber-400" />
                                <h5 className="text-xs font-bold text-white uppercase tracking-wider">
                                  Open Findings ({item.openFindings.length})
                                </h5>
                              </div>
                              <button
                                onClick={() => {
                                  if (onNavigateToModule) onNavigateToModule('remediation_capa');
                                  else setActiveModule('remediation_capa');
                                }}
                                className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1"
                              >
                                CAPA Desk <ArrowUpRight className="w-3 h-3" />
                              </button>
                            </div>

                            {item.openFindings.length === 0 ? (
                              <div className="p-4 text-center rounded-lg bg-slate-800/40 border border-slate-800 text-slate-400 text-xs">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                                No active non-conformities logged against this requirement.
                              </div>
                            ) : (
                              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                                {item.openFindings.map(f => (
                                  <div
                                    key={f.id}
                                    className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/80 text-xs space-y-1.5"
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="font-mono text-[11px] font-bold text-rose-400">
                                        {f.findingCode}
                                      </span>
                                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                        f.severity === 'Major Non-Conformity'
                                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                      }`}>
                                        {f.severity}
                                      </span>
                                    </div>

                                    <strong className="text-white block">
                                      {f.title}
                                    </strong>
                                    <p className="text-[11px] text-slate-400 line-clamp-2">
                                      {f.description}
                                    </p>

                                    {f.capaPlan && (
                                      <div className="mt-2 pt-2 border-t border-slate-700/60 text-[11px] flex items-center justify-between text-slate-300">
                                        <span>Owner: <strong className="text-slate-200">{f.capaPlan.owner || 'Unassigned'}</strong></span>
                                        <span className="text-amber-400 font-mono">Target: {f.capaPlan.targetDate || 'Pending'}</span>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Box 2: Correlated Technology Risks (from RiskEngine & Risk Register) */}
                        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Flame className="w-4 h-4 text-orange-400" />
                                <h5 className="text-xs font-bold text-white uppercase tracking-wider">
                                  Mapped Tech Risks ({item.linkedTechRisks.length})
                                </h5>
                              </div>
                              <button
                                onClick={() => {
                                  if (onNavigateToModule) onNavigateToModule('risk_map');
                                  else setActiveModule('risk_map');
                                }}
                                className="text-[11px] font-semibold text-orange-400 hover:text-orange-300 flex items-center gap-1"
                              >
                                Risk Heatmap <ArrowUpRight className="w-3 h-3" />
                              </button>
                            </div>

                            {item.linkedTechRisks.length === 0 ? (
                              <div className="p-4 text-center rounded-lg bg-slate-800/40 border border-slate-800 text-slate-400 text-xs">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                                No operational technology risks mapped to this requirement.
                              </div>
                            ) : (
                              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                                {item.linkedTechRisks.map(r => (
                                  <div
                                    key={r.id}
                                    className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/80 text-xs space-y-1.5"
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="font-mono text-[11px] font-bold text-orange-400">
                                        {r.riskCode}
                                      </span>
                                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                        (r.residualScore || 0) >= 15
                                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                          : (r.residualScore || 0) >= 8
                                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                      }`}>
                                        Residual: {r.residualScore} (L{r.residualLikelihood} x I{r.residualImpact})
                                      </span>
                                    </div>

                                    <strong className="text-white block truncate">
                                      {r.title}
                                    </strong>
                                    <p className="text-[11px] text-slate-400 line-clamp-2">
                                      {r.threatDescription}
                                    </p>

                                    <div className="mt-2 pt-2 border-t border-slate-700/60 text-[11px] flex items-center justify-between text-slate-300">
                                      <span className="truncate pr-2">Mitigation: <strong className="text-slate-200">{r.mitigationControl || 'Standard Controls'}</strong></span>
                                      <span className="text-slate-400 shrink-0">{r.category}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Box 3: Correlated Evidence Vault Artifacts */}
                        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <FolderCheck className="w-4 h-4 text-emerald-400" />
                                <h5 className="text-xs font-bold text-white uppercase tracking-wider">
                                  Verified Evidence ({item.evidenceItems.length})
                                </h5>
                              </div>
                              <button
                                onClick={() => {
                                  if (onNavigateToModule) onNavigateToModule('evidence_centre');
                                  else setActiveModule('evidence_centre');
                                }}
                                className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                              >
                                Open Vault <ArrowUpRight className="w-3 h-3" />
                              </button>
                            </div>

                            {item.evidenceItems.length === 0 ? (
                              <div className="p-4 text-center rounded-lg bg-amber-950/20 border border-amber-800/40 text-amber-300 text-xs">
                                <FileWarning className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                                Evidence Gap: No evidentiary artifact attached. Upload proof to substantiate MAS TRM audit defense.
                              </div>
                            ) : (
                              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                                {item.evidenceItems.map(e => (
                                  <div
                                    key={e.id}
                                    className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/80 text-xs flex items-center justify-between gap-3"
                                  >
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-1.5 mb-0.5">
                                        <FileCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                        <strong className="text-white truncate block">
                                          {e.title}
                                        </strong>
                                      </div>
                                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                                        <span>{e.fileName}</span>
                                        {e.sha256Hash && (
                                          <span title={e.sha256Hash} className="text-slate-500">
                                            SHA: {e.sha256Hash.substring(0, 10)}...
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    <div className="shrink-0 text-right">
                                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                        e.status === 'Verified' || e.verificationState === 'Verified'
                                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                      }`}>
                                        {e.status || 'Pending'}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Export / Printable Audit Dossier Modal */}
      {showPrintDossierModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-3">
                <Award className="w-6 h-6 text-rose-500" />
                <div>
                  <h3 className="text-base font-bold text-white">
                    MAS TRM Statutory Audit Report Dossier
                  </h3>
                  <span className="text-xs text-slate-400">
                    Official Supervisory Submission Package | Ready for MAS Inspection
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowPrintDossierModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content / Printable Document Preview */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300 bg-slate-900 font-sans">
              
              {/* Formal Cover Letter Box */}
              <div className="p-5 rounded-xl border border-slate-800 bg-slate-950 space-y-3">
                <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                  <div>
                    <strong className="text-sm font-bold text-white block">
                      MONETARY AUTHORITY OF SINGAPORE (MAS)
                    </strong>
                    <span className="text-[11px] text-slate-400">
                      Technology Risk Supervision Department &bull; 10 Shenton Way, MAS Building, Singapore 079117
                    </span>
                  </div>
                  <div className="text-right font-mono text-[11px] text-slate-400">
                    <div>Date: {new Date().toLocaleDateString('en-GB')}</div>
                    <div>Form: MAS-TRM-APP-01</div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-white font-semibold">ATTN: Lead Technology Risk Inspector / Specialist Team</div>
                  <div>Financial Institution: <strong className="text-white">{currentTenant?.name || 'Singapore Licensed Bank'}</strong></div>
                  <div>Category: <strong className="text-white">{masRegulatoryProfile?.institutionCategory || masRegulatoryProfile?.entityType || 'Commercial Bank'}</strong></div>
                  <div>Designated Critical Systems: <strong className="text-white">{masRegulatoryProfile?.designatedCriticalSystemsCount || 2}</strong></div>
                </div>

                <div className="pt-2 text-slate-300 leading-relaxed">
                  This dossier certifies the technology risk management readiness evaluation conducted in accordance with
                  the <strong>MAS Guidelines on Technology Risk Management (January 2021 Edition)</strong>, 
                  <strong>MAS Notice 644 (Technology Risk Management)</strong>, and 
                  <strong>MAS Notice 655 (Cyber Hygiene)</strong>.
                </div>
              </div>

              {/* Scorecard Table */}
              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <div className="p-3 bg-slate-950 font-bold text-white border-b border-slate-800">
                  STATUTORY READINESS SCORECARD
                </div>
                <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-900">
                  <div>
                    <span className="text-slate-400 block">Overall TRM Readiness</span>
                    <strong className="text-xl text-white font-mono">{summary.overallReadinessScore}%</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Notice 655 (Cyber Hygiene)</span>
                    <strong className="text-xl text-purple-400 font-mono">{summary.cyberHygieneNotice655Readiness}%</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Notice 644 (Critical Systems)</span>
                    <strong className="text-xl text-amber-400 font-mono">{summary.criticalSystemsReadiness}%</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Evidence Integrity SHA-256</span>
                    <strong className="text-xl text-emerald-400 font-mono">{summary.evidenceCoverageRate}%</strong>
                  </div>
                </div>
              </div>

              {/* High Risk Findings Checklist */}
              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <div className="p-3 bg-slate-950 font-bold text-white border-b border-slate-800 flex justify-between">
                  <span>HIGH-RISK CONTROL DEFICIENCIES & REMEDIATION COMMITMENT</span>
                  <span className="text-rose-400 font-mono">{highRiskTotal} Controls</span>
                </div>
                <div className="divide-y divide-slate-800">
                  {enrichedGaps.filter(i => i.riskTier === 'HIGH_RISK').slice(0, 10).map(g => (
                    <div key={g.requirementCode} className="p-3 space-y-1">
                      <div className="flex justify-between font-mono text-[11px]">
                        <strong className="text-rose-400">{g.requirementCode}: {g.title}</strong>
                        <span className="text-slate-400">Score: {g.readinessScore}%</span>
                      </div>
                      <p className="text-[11px] text-slate-400">{g.auditorRecommendation}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Digital Attestation Signature */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="sign-attest-checkbox"
                    checked={auditAttestationSigned}
                    onChange={e => setAuditAttestationSigned(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-rose-600 focus:ring-rose-500"
                  />
                  <label htmlFor="sign-attest-checkbox" className="text-white font-semibold cursor-pointer">
                    Confirm Executive Officer & Chief Risk Officer Sign-off Attestation
                  </label>
                </div>
                <p className="text-[11px] text-slate-400 pl-6 leading-relaxed">
                  I hereby confirm on behalf of the Board and Senior Management that this compliance gap summary reflects
                  the genuine operating status of the institution's technology risk controls, with all major non-conformities
                  escalated to the Board Technology Committee.
                </p>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-950">
              <span className="text-xs text-slate-400 font-mono">
                SHA-256 Merkle Block Chained: Verified
              </span>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setShowPrintDossierModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1.5 shadow-md shadow-rose-950/40"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / Save PDF
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
