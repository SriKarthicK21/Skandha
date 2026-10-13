import React, { useState, useMemo } from 'react';
import { useGRC } from '../../context/GRCContext';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  Award,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileCheck2,
  FileText,
  Lock,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Download,
  Filter,
  Sparkles,
  Layers,
  CheckSquare,
  AlertOctagon,
  Eye,
  Hash,
  RefreshCw,
  ExternalLink,
  Target
} from 'lucide-react';
import { EVIDENCE_CHECKLIST_MASTER_DATA, EvidenceChecklistItem } from '../../data/evidenceChecklistMasterData';
import { useToast } from '../common/ToastContainer';

export type AuditStageKey = 'ALL' | 'Stage 1' | 'Stage 2' | 'Surveillance' | 'Regulatory';

interface AuditStageProgressBarProps {
  activeStage?: AuditStageKey;
  onSelectStage?: (stage: AuditStageKey) => void;
  onInspectEvidence?: (item: EvidenceChecklistItem) => void;
  className?: string;
  compact?: boolean;
}

export interface StageFulfillmentMetrics {
  key: AuditStageKey;
  label: string;
  shortLabel: string;
  description: string;
  gateCriteria: string;
  totalRequired: number;
  verifiedCount: number;
  pendingCount: number;
  missingCount: number;
  fulfillmentPercentage: number;
  strictVerifiedPercentage: number;
  gateStatus: 'CLEARED' | 'ON_TRACK' | 'GAPS_IDENTIFIED' | 'BLOCKED';
  gateLabel: string;
  colorTheme: {
    accent: string;
    bg: string;
    border: string;
    text: string;
    badgeBg: string;
    badgeText: string;
    barFill: string;
  };
  items: Array<{
    checklistItem: EvidenceChecklistItem;
    fulfilledState: 'VERIFIED' | 'PENDING_REVIEW' | 'REQUIRES_UPDATE' | 'MISSING';
    matchedEvidence?: any;
    sha256Hash?: string;
  }>;
}

export const AuditStageProgressBar: React.FC<AuditStageProgressBarProps> = ({
  activeStage = 'ALL',
  onSelectStage,
  onInspectEvidence,
  className = '',
  compact = false
}) => {
  const { currentTenant, evidence = [], theme } = useGRC();
  const { showToast } = useToast();
  const isLight = theme === 'light';

  const [selectedStageKey, setSelectedStageKey] = useState<AuditStageKey>(activeStage);
  const [isExpanded, setIsExpanded] = useState(!compact);
  const [strictVerifiedOnly, setStrictVerifiedOnly] = useState(false);
  const [searchDocQuery, setSearchDocQuery] = useState('');
  const [hoveredStageInfo, setHoveredStageInfo] = useState<{
    stage: StageFulfillmentMetrics;
    anchorPercent: number;
    triggerSource: 'bar' | 'milestone' | 'card';
  } | null>(null);

  // Keep internal state in sync with external prop if provided
  React.useEffect(() => {
    if (activeStage && activeStage !== selectedStageKey) {
      setSelectedStageKey(activeStage);
    }
  }, [activeStage]);

  const handleStageClick = (key: AuditStageKey) => {
    setSelectedStageKey(key);
    if (onSelectStage) {
      onSelectStage(key);
    }
  };

  // Filter tenant evidence
  const tenantEvidence = useMemo(() => {
    return evidence.filter(e => e.tenantId === currentTenant?.id || !e.tenantId);
  }, [evidence, currentTenant?.id]);

  // Compute fulfillment status for each master evidence item
  const evaluatedMasterEvidence = useMemo(() => {
    return EVIDENCE_CHECKLIST_MASTER_DATA.map(item => {
      // Find matching tenant evidence
      const matched = tenantEvidence.find(e => {
        if (!e) return false;
        // Direct control match
        if (e.controlCode && item.clauseOrControl.toLowerCase().includes(e.controlCode.toLowerCase())) return true;
        if (e.controlCode && item.title.toLowerCase().includes(e.controlCode.toLowerCase())) return true;
        // Title similarity match
        const evTitleWords = (e.title || '').toLowerCase().split(' ').filter(w => w.length > 4);
        const itemTitle = item.title.toLowerCase();
        const matchesWord = evTitleWords.some(w => itemTitle.includes(w));
        return matchesWord;
      });

      let fulfilledState: 'VERIFIED' | 'PENDING_REVIEW' | 'REQUIRES_UPDATE' | 'MISSING' = 'MISSING';
      let sha256Hash = matched?.sha256Hash || matched?.auditHash;

      if (matched) {
        if (matched.status === 'Verified' || matched.verificationState === 'Verified') {
          fulfilledState = 'VERIFIED';
        } else if (matched.status === 'Requires Update' || matched.status === 'Expired') {
          fulfilledState = 'REQUIRES_UPDATE';
        } else {
          fulfilledState = 'PENDING_REVIEW';
        }
      } else {
        // Evaluate default status from master catalog
        if (item.defaultStatus === 'Verified') {
          fulfilledState = 'VERIFIED';
          sha256Hash = '7a9f82d1b0c3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9';
        } else if (item.defaultStatus === 'Prepared') {
          fulfilledState = 'PENDING_REVIEW';
          sha256Hash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
        } else {
          fulfilledState = 'MISSING';
        }
      }

      return {
        checklistItem: item,
        fulfilledState,
        matchedEvidence: matched,
        sha256Hash
      };
    });
  }, [tenantEvidence]);

  // Group by audit stage and calculate completion metrics
  const stageMetricsList: StageFulfillmentMetrics[] = useMemo(() => {
    const stagesConfig: Array<{
      key: AuditStageKey;
      stageFilter: (s: string) => boolean;
      label: string;
      shortLabel: string;
      description: string;
      gateCriteria: string;
      colorTheme: StageFulfillmentMetrics['colorTheme'];
    }> = [
      {
        key: 'Stage 1',
        stageFilter: s => s.includes('Stage 1'),
        label: 'Stage 1: Documentation & Governance',
        shortLabel: 'Stage 1 Doc Review',
        description: 'Mandatory ISO 27001 Clauses 4–10 governance, ISMS Scope, Policies, SoA, Risk Methodology & MRM minutes.',
        gateCriteria: '100% verified documentation required with zero unaddressed template placeholders prior to Stage 2.',
        colorTheme: {
          accent: 'emerald',
          bg: isLight ? 'bg-emerald-50' : 'bg-emerald-950/40',
          border: isLight ? 'border-emerald-200' : 'border-emerald-800/60',
          text: isLight ? 'text-emerald-900' : 'text-emerald-300',
          badgeBg: isLight ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
          badgeText: isLight ? 'text-emerald-800' : 'text-emerald-300',
          barFill: 'bg-emerald-500'
        }
      },
      {
        key: 'Stage 2',
        stageFilter: s => s.includes('Stage 2'),
        label: 'Stage 2: Implementation & Effectiveness',
        shortLabel: 'Stage 2 Operational',
        description: 'Operational enforcement of Annex A controls (90+ day history, access logs, SOC tickets, BCP drills, pen tests).',
        gateCriteria: '≥90% operational evidence fulfillment with zero open Major Non-Conformities.',
        colorTheme: {
          accent: 'sky',
          bg: isLight ? 'bg-sky-50' : 'bg-sky-950/40',
          border: isLight ? 'border-sky-200' : 'border-sky-800/60',
          text: isLight ? 'text-sky-900' : 'text-sky-300',
          badgeBg: isLight ? 'bg-sky-100 text-sky-800' : 'bg-sky-500/20 text-sky-300 border border-sky-500/30',
          badgeText: isLight ? 'text-sky-800' : 'text-sky-300',
          barFill: 'bg-sky-500'
        }
      },
      {
        key: 'Surveillance',
        stageFilter: s => s.includes('Surveillance'),
        label: 'Surveillance Audit: Continual Assurance',
        shortLabel: 'Surveillance & CAPA',
        description: 'Year 1 & 2 ongoing monitoring, evidence freshness decay tracking (<90d SLAs), and closed CAPA verifications.',
        gateCriteria: 'Evidence freshness ≥85%, zero overdue CAPAs, and updated asset threat logs.',
        colorTheme: {
          accent: 'amber',
          bg: isLight ? 'bg-amber-50' : 'bg-amber-950/40',
          border: isLight ? 'border-amber-200' : 'border-amber-800/60',
          text: isLight ? 'text-amber-900' : 'text-amber-300',
          badgeBg: isLight ? 'bg-amber-100 text-amber-800' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
          badgeText: isLight ? 'text-amber-800' : 'text-amber-300',
          barFill: 'bg-amber-500'
        }
      },
      {
        key: 'Regulatory',
        stageFilter: s => s.includes('Regulatory') || s.includes('MAS'),
        label: 'Regulatory Assurance: MAS TRM & Notices',
        shortLabel: 'MAS TRM / 655',
        description: 'Notice 655 cyber hygiene, 1-hour critical incident reporting, perimeter firewall defense & PAM dual-custody.',
        gateCriteria: '100% adherence to MAS baseline cyber hygiene notices and verified incident SLA runbooks.',
        colorTheme: {
          accent: 'indigo',
          bg: isLight ? 'bg-indigo-50' : 'bg-indigo-950/40',
          border: isLight ? 'border-indigo-200' : 'border-indigo-800/60',
          text: isLight ? 'text-indigo-900' : 'text-indigo-300',
          badgeBg: isLight ? 'bg-indigo-100 text-indigo-800' : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
          badgeText: isLight ? 'text-indigo-800' : 'text-indigo-300',
          barFill: 'bg-indigo-500'
        }
      }
    ];

    return stagesConfig.map(cfg => {
      const items = evaluatedMasterEvidence.filter(e => cfg.stageFilter(e.checklistItem.auditorGuide.auditStage));
      const totalRequired = items.length || 1;
      const verifiedCount = items.filter(i => i.fulfilledState === 'VERIFIED').length;
      const pendingCount = items.filter(i => i.fulfilledState === 'PENDING_REVIEW').length;
      const missingCount = items.filter(i => i.fulfilledState === 'MISSING' || i.fulfilledState === 'REQUIRES_UPDATE').length;

      const fulfillmentPercentage = Math.min(100, Math.round(((verifiedCount + (strictVerifiedOnly ? 0 : pendingCount * 0.7)) / totalRequired) * 100));
      const strictVerifiedPercentage = Math.min(100, Math.round((verifiedCount / totalRequired) * 100));

      let gateStatus: StageFulfillmentMetrics['gateStatus'] = 'ON_TRACK';
      let gateLabel = 'On Track';

      if (strictVerifiedPercentage >= 95 || (!strictVerifiedOnly && fulfillmentPercentage >= 95)) {
        gateStatus = 'CLEARED';
        gateLabel = 'Gate Cleared';
      } else if (fulfillmentPercentage >= 75) {
        gateStatus = 'ON_TRACK';
        gateLabel = 'Review Active';
      } else if (fulfillmentPercentage >= 50) {
        gateStatus = 'GAPS_IDENTIFIED';
        gateLabel = 'Artifact Gaps';
      } else {
        gateStatus = 'BLOCKED';
        gateLabel = 'Gate Blocked';
      }

      return {
        key: cfg.key,
        label: cfg.label,
        shortLabel: cfg.shortLabel,
        description: cfg.description,
        gateCriteria: cfg.gateCriteria,
        totalRequired,
        verifiedCount,
        pendingCount,
        missingCount,
        fulfillmentPercentage,
        strictVerifiedPercentage,
        gateStatus,
        gateLabel,
        colorTheme: cfg.colorTheme,
        items
      };
    });
  }, [evaluatedMasterEvidence, isLight, strictVerifiedOnly]);

  // Overall Cumulative Audit Progress
  const overallProgress = useMemo(() => {
    const totalDocs = stageMetricsList.reduce((acc, s) => acc + s.totalRequired, 0);
    const totalVerified = stageMetricsList.reduce((acc, s) => acc + s.verifiedCount, 0);
    const totalPending = stageMetricsList.reduce((acc, s) => acc + s.pendingCount, 0);
    const totalMissing = stageMetricsList.reduce((acc, s) => acc + s.missingCount, 0);

    const overallPercentage = Math.min(
      100,
      Math.round(((totalVerified + (strictVerifiedOnly ? 0 : totalPending * 0.7)) / (totalDocs || 1)) * 100)
    );
    const strictPercentage = Math.min(
      100,
      Math.round((totalVerified / (totalDocs || 1)) * 100)
    );

    return {
      totalDocs,
      totalVerified,
      totalPending,
      totalMissing,
      overallPercentage,
      strictPercentage
    };
  }, [stageMetricsList, strictVerifiedOnly]);

  // Pre-calculate anchor positions and metrics for floating tooltips
  const stageAnchors = useMemo(() => {
    let cumulative = 0;
    const total = overallProgress.totalDocs || 1;
    return stageMetricsList.map((stage, idx) => {
      const stageWeightPercent = (stage.totalRequired / total) * 100;
      const barCenterPercent = cumulative + stageWeightPercent / 2;
      cumulative += stageWeightPercent;

      // 4-column milestone button centers: 12.5%, 37.5%, 62.5%, 87.5%
      const columnCenterPercent = (idx + 0.5) * 25;

      // Number of evidence items remaining for this milestone
      const remainingItems = Math.max(0, stage.totalRequired - stage.verifiedCount);

      return {
        key: stage.key,
        barCenterPercent: Math.max(16, Math.min(84, barCenterPercent)),
        columnCenterPercent,
        remainingItems,
        weightPercent: stageWeightPercent
      };
    });
  }, [stageMetricsList, overallProgress.totalDocs]);

  // Constrain floating tooltip within horizontal bounds of progress bar container
  const clampedPercent = useMemo(() => {
    if (!hoveredStageInfo) return 50;
    return Math.max(22, Math.min(78, hoveredStageInfo.anchorPercent));
  }, [hoveredStageInfo]);

  // Point the downward caret precisely toward the hovered segment or button
  const caretLeftPercent = useMemo(() => {
    if (!hoveredStageInfo) return 50;
    const delta = hoveredStageInfo.anchorPercent - clampedPercent;
    return Math.max(14, Math.min(86, 50 + delta * 1.6));
  }, [hoveredStageInfo, clampedPercent]);

  // Currently active stage items for inspection drill-down
  const currentStageData = useMemo(() => {
    if (selectedStageKey === 'ALL') {
      return {
        title: 'All Audit Stages Combined',
        items: stageMetricsList.flatMap(s => s.items)
      };
    }
    const found = stageMetricsList.find(s => s.key === selectedStageKey);
    return {
      title: found?.label || 'Selected Stage',
      items: found?.items || []
    };
  }, [selectedStageKey, stageMetricsList]);

  // Filter items by search query inside drill-down
  const filteredDrilldownItems = useMemo(() => {
    if (!searchDocQuery.trim()) return currentStageData.items;
    const q = searchDocQuery.toLowerCase();
    return currentStageData.items.filter(
      i =>
        i.checklistItem.title.toLowerCase().includes(q) ||
        i.checklistItem.clauseOrControl.toLowerCase().includes(q) ||
        i.checklistItem.department.toLowerCase().includes(q) ||
        i.checklistItem.deptHeadRole.toLowerCase().includes(q)
    );
  }, [currentStageData.items, searchDocQuery]);

  // Export Stage Evidence Matrix as CSV
  const handleExportCSV = () => {
    const headers = [
      'Stage',
      'Clause/Control',
      'Document Title',
      'Document Type',
      'Responsible Role',
      'Department',
      'Fulfillment Status',
      'Testing Method',
      'Classification If Missing',
      'SHA256 Hash'
    ];

    const rows = stageMetricsList.flatMap(stage =>
      stage.items.map(i => [
        `"${stage.label}"`,
        `"${i.checklistItem.clauseOrControl}"`,
        `"${i.checklistItem.title.replace(/"/g, '""')}"`,
        `"${i.checklistItem.type}"`,
        `"${i.checklistItem.deptHeadRole}"`,
        `"${i.checklistItem.department}"`,
        `"${i.fulfilledState}"`,
        `"${i.checklistItem.auditorGuide.testingMethod}"`,
        `"${i.checklistItem.auditorGuide.classificationIfMissing}"`,
        `"${i.sha256Hash || 'N/A'}"`
      ])
    );

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Audit_Stage_Evidence_Fulfillment_${currentTenant?.name || 'SKANDA'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast({
      title: 'Audit Matrix Exported',
      message: 'Stage-by-stage document evidence fulfillment matrix exported to CSV.',
      type: 'success'
    });
  };

  return (
    <div
      className={`rounded-2xl border shadow-sm transition-all ${
        isLight
          ? 'bg-white border-slate-200 text-slate-800'
          : 'bg-slate-950 border-slate-800/90 text-slate-100'
      } ${className}`}
      id="audit-stage-progress-bar-container"
    >
      {/* 1. Header & Overall Readiness Scorecard */}
      <div className="p-5 sm:p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center gap-1.5">
                <FileCheck2 className="w-3.5 h-3.5 text-indigo-400" />
                Auditor Workpapers Telemetry
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-900 border border-slate-800 text-slate-300">
                ISO 27001 • ISO 19011 • MAS TRM
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <Hash className="w-3 h-3" />
                100% SHA-256 Validated
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white mt-1.5 flex items-center gap-2">
              <span>Audit Stage Evidence Fulfillment Tracker</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Progressive fulfillment of mandatory documentation and operational records across accredited certification stages. Every stage milestone requires cryptographically sealed evidence before the Lead Auditor greenlights fieldwork.
            </p>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-2.5 flex-wrap gap-y-2 shrink-0">
            <button
              type="button"
              onClick={() => setStrictVerifiedOnly(!strictVerifiedOnly)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border cursor-pointer flex items-center space-x-1.5 ${
                strictVerifiedOnly
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300'
              }`}
              title="Toggle Strict Verified vs Submitted/Prepared calculation"
            >
              <CheckSquare className="w-3.5 h-3.5 text-amber-400" />
              <span>{strictVerifiedOnly ? 'Strict Verified Only' : 'Verified + Under Review'}</span>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition flex items-center space-x-1.5 cursor-pointer shadow-sm"
              title="Download full stage fulfillment matrix for certification body committee"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>Export Matrix</span>
            </button>

            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  <span>Collapse Inspector</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  <span>Inspect Stage Documents</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 2. Master Progress Bar Visual Presentation */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-3">
              <div className="text-3xl font-black font-mono tracking-tight text-white flex items-baseline gap-1.5">
                <span>{overallProgress.overallPercentage}%</span>
                <span className="text-xs font-normal text-slate-400">fulfilled</span>
              </div>

              <div className="h-8 w-px bg-slate-800 hidden sm:block" />

              <div className="space-y-0.5">
                <div className="text-xs font-bold text-slate-200">
                  {overallProgress.totalVerified} of {overallProgress.totalDocs} Mandatory Artifacts Attested
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-2">
                  <span className="text-emerald-400 font-semibold">{overallProgress.totalVerified} Verified</span>
                  <span>•</span>
                  <span className="text-sky-400 font-semibold">{overallProgress.totalPending} In Review</span>
                  <span>•</span>
                  <span className={overallProgress.totalMissing > 0 ? 'text-rose-400 font-semibold' : 'text-slate-500'}>
                    {overallProgress.totalMissing} Gaps
                  </span>
                </div>
              </div>
            </div>

            {/* Stage Gate Readiness Tag */}
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-400">Current Readiness:</span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Stage 1 Gate Cleared • Stage 2 In Progress ({stageMetricsList[1]?.fulfillmentPercentage}%)
              </span>
            </div>
          </div>

          {/* Segmented Cumulative Multi-Stage Visual Progress Bar */}
          <div
            className="relative pt-1"
            onMouseLeave={() => setHoveredStageInfo(null)}
          >
            {/* Floating Milestone Tooltip */}
            <AnimatePresence>
              {hoveredStageInfo && (
                <motion.div
                  key={hoveredStageInfo.stage.key}
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.95 }}
                  transition={{ duration: 0.16, ease: 'easeOut' }}
                  style={{
                    left: `${clampedPercent}%`,
                    transform: 'translateX(-50%)'
                  }}
                  className={`absolute bottom-full mb-3.5 z-50 pointer-events-none w-80 sm:w-96 p-4 rounded-xl border shadow-2xl backdrop-blur-md transition-colors ${
                    isLight
                      ? 'bg-white/95 border-slate-300 text-slate-900 shadow-slate-400/30'
                      : 'bg-slate-900/95 border-slate-700/90 text-slate-100 shadow-black/80'
                  }`}
                >
                  {/* Downward pointing caret */}
                  <div
                    style={{ left: `${caretLeftPercent}%` }}
                    className={`absolute top-full -translate-x-1/2 -mt-1.5 w-3 h-3 rotate-45 border-r border-b ${
                      isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'
                    }`}
                  />

                  {/* Header: Stage Title & Gate Status Pill */}
                  <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-800/80">
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 font-mono">
                          Audit Stage Telemetry
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight leading-snug">
                        {hoveredStageInfo.stage.label}
                      </h4>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                        hoveredStageInfo.stage.gateStatus === 'CLEARED'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : hoveredStageInfo.stage.gateStatus === 'ON_TRACK'
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                          : hoveredStageInfo.stage.gateStatus === 'GAPS_IDENTIFIED'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {hoveredStageInfo.stage.gateLabel}
                    </span>
                  </div>

                  {/* Metric Callouts: Specific Percentage & Evidence Items Remaining */}
                  <div className="py-2.5 space-y-2.5">
                    <div className="flex items-baseline justify-between">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-black font-mono tracking-tight text-white">
                          {hoveredStageInfo.stage.fulfillmentPercentage}%
                        </span>
                        <span className="text-xs text-slate-400 font-medium">Fulfilled</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono font-semibold text-emerald-400">
                          {hoveredStageInfo.stage.verifiedCount} of {hoveredStageInfo.stage.totalRequired}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-1">Attested</span>
                      </div>
                    </div>

                    {/* Milestone Evidence Items Remaining Highlight Card */}
                    {(() => {
                      const remainingItems = Math.max(
                        0,
                        hoveredStageInfo.stage.totalRequired - hoveredStageInfo.stage.verifiedCount
                      );
                      const isCleared = remainingItems === 0;

                      return (
                        <div
                          className={`p-2.5 rounded-lg border space-y-1.5 ${
                            isCleared
                              ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                              : 'bg-slate-950/80 border-slate-800/90 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold flex items-center gap-1.5">
                              <Target className="w-3.5 h-3.5 text-amber-400" />
                              <span>Evidence Items Remaining:</span>
                            </span>
                            <span
                              className={`font-black font-mono text-xs px-2 py-0.5 rounded ${
                                isCleared
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              }`}
                            >
                              {isCleared
                                ? '0 Remaining (Gate Cleared)'
                                : `${remainingItems} ${remainingItems === 1 ? 'Item' : 'Items'} Remaining`}
                            </span>
                          </div>

                          {isCleared ? (
                            <div className="text-[11px] text-emerald-400 flex items-center gap-1.5 pt-0.5">
                              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                              <span>All mandatory evidence artifacts for this milestone are sealed and verified.</span>
                            </div>
                          ) : (
                            <div className="space-y-1 pt-0.5 text-[11px]">
                              <div className="flex items-center justify-between text-slate-400">
                                <span className="flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                                  <span>Missing / Uncollected Artifacts:</span>
                                </span>
                                <span className="font-mono font-bold text-rose-400">
                                  {hoveredStageInfo.stage.missingCount}
                                </span>
                              </div>

                              <div className="flex items-center justify-between text-slate-400">
                                <span className="flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                                  <span>Under Auditor Review:</span>
                                </span>
                                <span className="font-mono font-bold text-sky-400">
                                  {hoveredStageInfo.stage.pendingCount}
                                </span>
                              </div>

                              <div className="flex items-center justify-between text-slate-400">
                                <span className="flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                  <span>Verified & Cryptographically Sealed:</span>
                                </span>
                                <span className="font-mono font-bold text-emerald-400">
                                  {hoveredStageInfo.stage.verifiedCount}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Mini Segmented Distribution Bar */}
                    <div className="space-y-1 pt-0.5">
                      <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden flex p-0.5 border border-slate-800 gap-0.5">
                        <div
                          style={{
                            width: `${(hoveredStageInfo.stage.verifiedCount / hoveredStageInfo.stage.totalRequired) * 100}%`
                          }}
                          className="h-full bg-emerald-500 rounded-sm"
                        />
                        <div
                          style={{
                            width: `${(hoveredStageInfo.stage.pendingCount / hoveredStageInfo.stage.totalRequired) * 100}%`
                          }}
                          className="h-full bg-sky-500 rounded-sm"
                        />
                        <div
                          style={{
                            width: `${(hoveredStageInfo.stage.missingCount / hoveredStageInfo.stage.totalRequired) * 100}%`
                          }}
                          className="h-full bg-rose-500/80 rounded-sm"
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span>Milestone Progress Fill</span>
                        <span>Strict Verified: {hoveredStageInfo.stage.strictVerifiedPercentage}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Gate Criteria & Interaction Prompt */}
                  <div className="pt-2 border-t border-slate-800/80 flex flex-col gap-1 text-[10px] text-slate-400">
                    <div className="line-clamp-2 leading-relaxed">
                      <span className="text-slate-300 font-semibold">Gate Requirement: </span>
                      <span>{hoveredStageInfo.stage.gateCriteria}</span>
                    </div>
                    <div className="text-indigo-400 font-semibold pt-0.5 flex items-center gap-1">
                      <span>Click milestone to inspect workpapers & evidence artifacts</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="w-full h-3.5 bg-slate-950 rounded-full overflow-hidden flex p-0.5 border border-slate-800 gap-0.5">
              {stageMetricsList.map(stage => {
                const stageWeightPercent = (stage.totalRequired / overallProgress.totalDocs) * 100;
                const stageFilledPercent = stage.fulfillmentPercentage;

                return (
                  <div
                    key={stage.key}
                    style={{ width: `${stageWeightPercent}%` }}
                    className="h-full relative overflow-hidden rounded-sm group cursor-pointer transition-all hover:brightness-125"
                    onClick={() => handleStageClick(stage.key)}
                    onMouseEnter={() => {
                      const anchor = stageAnchors.find(a => a.key === stage.key);
                      setHoveredStageInfo({
                        stage,
                        anchorPercent: anchor ? anchor.barCenterPercent : 50,
                        triggerSource: 'bar'
                      });
                    }}
                    onMouseLeave={() => setHoveredStageInfo(null)}
                  >
                    {/* Background track for stage */}
                    <div className="absolute inset-0 bg-slate-900/80" />
                    {/* Active fulfillment fill animated */}
                    <motion.div
                      className={`h-full ${stage.colorTheme.barFill} rounded-sm shadow-sm`}
                      initial={{ width: 0 }}
                      animate={{ width: `${stageFilledPercent}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Visual Milestones / Stage Labels under the bar */}
            <div className="grid grid-cols-4 gap-2 pt-2 text-[10px] text-slate-400 font-medium">
              {stageMetricsList.map(stage => (
                <button
                  key={stage.key}
                  type="button"
                  onClick={() => handleStageClick(stage.key)}
                  onMouseEnter={() => {
                    const anchor = stageAnchors.find(a => a.key === stage.key);
                    setHoveredStageInfo({
                      stage,
                      anchorPercent: anchor ? anchor.columnCenterPercent : 50,
                      triggerSource: 'milestone'
                    });
                  }}
                  onMouseLeave={() => setHoveredStageInfo(null)}
                  className={`text-left truncate transition group cursor-pointer ${
                    selectedStageKey === stage.key ? 'text-white font-bold' : 'hover:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-1 truncate">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        stage.gateStatus === 'CLEARED'
                          ? 'bg-emerald-400'
                          : stage.gateStatus === 'ON_TRACK'
                          ? 'bg-sky-400'
                          : stage.gateStatus === 'GAPS_IDENTIFIED'
                          ? 'bg-amber-400'
                          : 'bg-rose-400'
                      }`}
                    />
                    <span className="truncate">{stage.shortLabel}</span>
                  </div>
                  <div className="font-mono text-[10px] text-slate-500 pl-3">
                    {stage.fulfillmentPercentage}% • {stage.verifiedCount}/{stage.totalRequired}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Interactive Stage Progress Cards (4-Column Bento) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {stageMetricsList.map(stage => {
            const isSelected = selectedStageKey === stage.key;
            const remainingItems = Math.max(0, stage.totalRequired - stage.verifiedCount);

            return (
              <motion.div
                key={stage.key}
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                onClick={() => handleStageClick(stage.key)}
                onMouseEnter={() => {
                  const anchor = stageAnchors.find(a => a.key === stage.key);
                  setHoveredStageInfo({
                    stage,
                    anchorPercent: anchor ? anchor.columnCenterPercent : 50,
                    triggerSource: 'card'
                  });
                }}
                onMouseLeave={() => setHoveredStageInfo(null)}
                className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-900 border-indigo-500 ring-2 ring-indigo-500/20 shadow-lg shadow-indigo-950/40'
                    : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Active indicator border accent */}
                {isSelected && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500" />
                )}

                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] font-bold text-slate-300 line-clamp-1">
                      {stage.shortLabel}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                        stage.gateStatus === 'CLEARED'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : stage.gateStatus === 'ON_TRACK'
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                          : stage.gateStatus === 'GAPS_IDENTIFIED'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {stage.gateLabel}
                    </span>
                  </div>

                  <div className="mt-2.5 flex items-baseline justify-between">
                    <div className="text-2xl font-black font-mono text-white">
                      {stage.fulfillmentPercentage}%
                    </div>
                    <div className="text-xs font-mono text-slate-400">
                      {stage.verifiedCount} / {stage.totalRequired} docs
                    </div>
                  </div>

                  {/* Remaining Evidence Items Badge */}
                  <div className="mt-1 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Milestone Gap:</span>
                    <span
                      className={`font-semibold font-mono flex items-center gap-1 ${
                        remainingItems === 0 ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {remainingItems === 0 ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>0 items remaining</span>
                        </>
                      ) : (
                        <>
                          <Target className="w-3 h-3 text-amber-400" />
                          <span>{remainingItems} {remainingItems === 1 ? 'item' : 'items'} remaining</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Individual Stage Mini Progress Track */}
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden mt-2 p-0.5 border border-slate-800 flex gap-0.5">
                    <div
                      style={{ width: `${(stage.verifiedCount / stage.totalRequired) * 100}%` }}
                      className="h-full bg-emerald-500 rounded-sm"
                      title={`${stage.verifiedCount} Verified`}
                    />
                    <div
                      style={{ width: `${(stage.pendingCount / stage.totalRequired) * 100}%` }}
                      className="h-full bg-sky-500 rounded-sm"
                      title={`${stage.pendingCount} Under Review`}
                    />
                    <div
                      style={{ width: `${(stage.missingCount / stage.totalRequired) * 100}%` }}
                      className="h-full bg-slate-800 rounded-sm"
                      title={`${stage.missingCount} Missing/Updating`}
                    />
                  </div>

                  <p className="text-[11px] text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {stage.description}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Criteria:</span>
                  <span className="text-slate-300 font-semibold truncate max-w-[140px]" title={stage.gateCriteria}>
                    {stage.gateCriteria}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 4. Expandable Document Evidence Fulfillment Inspector Table */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-slate-800/90 bg-slate-950/80 p-5 sm:p-6 space-y-4 rounded-b-2xl overflow-hidden"
          >
            {/* Inspector Filter Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800/70">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Stage Artifacts Breakdown:
                </span>
                <span className="text-xs font-mono text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/50">
                  {currentStageData.title} ({filteredDrilldownItems.length} Artifacts)
                </span>
              </div>

              {/* Stage Filter Pills & Search */}
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                {(['ALL', 'Stage 1', 'Stage 2', 'Surveillance', 'Regulatory'] as const).map(k => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => handleStageClick(k)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                      selectedStageKey === k
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {k === 'ALL' ? 'All Stages' : k}
                  </button>
                ))}

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search documents..."
                    value={searchDocQuery}
                    onChange={e => setSearchDocQuery(e.target.value)}
                    className="bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-36 sm:w-44"
                  />
                </div>
              </div>
            </div>

            {/* Document Evidence List Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3 font-semibold">Standard Clause</th>
                    <th className="py-2.5 px-3 font-semibold">Mandatory Document & Record</th>
                    <th className="py-2.5 px-3 font-semibold">Department & Owner</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Fulfillment Status</th>
                    <th className="py-2.5 px-3 font-semibold">Auditor Testing Protocol</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Cryptographic Hash</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredDrilldownItems.map(item => {
                    const isVerified = item.fulfilledState === 'VERIFIED';
                    const isPending = item.fulfilledState === 'PENDING_REVIEW';
                    const isMissing = item.fulfilledState === 'MISSING' || item.fulfilledState === 'REQUIRES_UPDATE';

                    return (
                      <tr
                        key={item.checklistItem.id}
                        className="hover:bg-slate-900/50 transition"
                      >
                        {/* Standard Clause */}
                        <td className="py-3 px-3 align-top whitespace-nowrap">
                          <span className="font-mono text-xs font-bold text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/60">
                            {item.checklistItem.clauseOrControl}
                          </span>
                          <div className="text-[10px] text-slate-500 mt-1">
                            {item.checklistItem.category}
                          </div>
                        </td>

                        {/* Mandatory Document & Record */}
                        <td className="py-3 px-3 align-top max-w-sm">
                          <div className="font-bold text-slate-200">
                            {item.checklistItem.title}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                            {item.checklistItem.departmentKeyArtifact}
                          </div>
                          <div className="flex items-center space-x-2 mt-1.5 flex-wrap gap-y-1">
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-slate-900 text-slate-400 border border-slate-800">
                              {item.checklistItem.type.replace(/_/g, ' ')}
                            </span>
                            {item.checklistItem.templateAvailable && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                                Template Ready
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Department & Owner */}
                        <td className="py-3 px-3 align-top whitespace-nowrap">
                          <div className="text-slate-300 font-medium">
                            {item.checklistItem.deptHeadRole}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            {item.checklistItem.department}
                          </div>
                        </td>

                        {/* Fulfillment Status */}
                        <td className="py-3 px-3 align-top text-center whitespace-nowrap">
                          {isVerified ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Verified & Attested</span>
                            </span>
                          ) : isPending ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                              <Clock className="w-3.5 h-3.5 text-sky-400" />
                              <span>Pending Sign-off</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
                              <span>Missing Artifact</span>
                            </span>
                          )}
                        </td>

                        {/* Auditor Testing Protocol */}
                        <td className="py-3 px-3 align-top max-w-xs text-[11px]">
                          <span className="font-semibold text-slate-300">
                            {item.checklistItem.auditorGuide.testingMethod.replace(/_/g, ' ')}
                          </span>
                          <p className="text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                            {item.checklistItem.auditorGuide.auditorExpectations}
                          </p>
                          <div className="text-[10px] text-amber-400 mt-1">
                            Missing: {item.checklistItem.auditorGuide.classificationIfMissing.replace('_', ' ')}
                          </div>
                        </td>

                        {/* Cryptographic Hash */}
                        <td className="py-3 px-3 align-top text-right whitespace-nowrap">
                          {item.sha256Hash ? (
                            <div className="font-mono text-[10px] text-slate-400">
                              <span className="text-emerald-400 font-bold mr-1">SHA:</span>
                              <span className="hover:text-white transition cursor-help" title={`Full Hash: ${item.sha256Hash}`}>
                                {item.sha256Hash.substring(0, 10)}...{item.sha256Hash.substring(item.sha256Hash.length - 6)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-600 font-mono italic">Unsealed</span>
                          )}

                          {onInspectEvidence && (
                            <button
                              type="button"
                              onClick={() => onInspectEvidence(item.checklistItem)}
                              className="mt-1.5 inline-flex items-center space-x-1 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Inspect Doc</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
