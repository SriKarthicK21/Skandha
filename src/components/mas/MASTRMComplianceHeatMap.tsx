import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  Treemap,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ReferenceLine,
  CartesianGrid
} from 'recharts';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Flame,
  ArrowRight,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Filter,
  BarChart2,
  Grid,
  Info,
  CheckCircle2,
  XCircle,
  Eye,
  Layers,
  ArrowUpRight,
  RefreshCw,
  Search,
  X,
  Plus,
  Unlink,
  Link as LinkIcon,
  Activity,
  Sliders
} from 'lucide-react';
import { useGRC } from '../../context/GRCContext';
import { FrameworkDomain, MASRequirementAssessmentRecord } from '../../types/regulatoryTypes';
import { RiskRecord, MASDomainExposureMetrics, MASRiskExposureTier } from '../../types';
import { RiskEngine } from '../../services/RiskEngine';
import { MAS_TRM_REQUIREMENTS_2021 } from '../../data/masTRMRequirements2021';

export type HeatmapMetricType = 'compliance' | 'exposure' | 'risk_weighted';

// Executive luxury color grading mapping based on compliance score & supervisory risk
const getComplianceColor = (score: number) => {
  if (score >= 85) {
    return {
      fill: 'url(#grad-compliant)',
      fallbackFill: '#065f46',
      stroke: 'rgba(52, 211, 153, 0.35)',
      strokeHover: '#34d399',
      bg: 'bg-emerald-950/60',
      text: 'text-emerald-300',
      accentText: '#6ee7b7',
      border: 'border-emerald-500/30',
      pillBg: '#022c22',
      badgeBg: 'rgba(6, 78, 59, 0.45)',
      badgeBorder: 'rgba(52, 211, 153, 0.35)',
      badgeText: '#a7f3d0',
      label: 'Optimal / Compliant',
      barGradient: 'from-emerald-600 to-teal-400'
    };
  }
  if (score >= 70) {
    return {
      fill: 'url(#grad-moderate)',
      fallbackFill: '#92400e',
      stroke: 'rgba(245, 158, 11, 0.4)',
      strokeHover: '#fbbf24',
      bg: 'bg-amber-950/60',
      text: 'text-amber-300',
      accentText: '#fcd34d',
      border: 'border-amber-500/30',
      pillBg: '#451a03',
      badgeBg: 'rgba(120, 53, 15, 0.45)',
      badgeBorder: 'rgba(245, 158, 11, 0.35)',
      badgeText: '#fde68a',
      label: 'Supervisory Gap Watch',
      barGradient: 'from-amber-600 to-yellow-400'
    };
  }
  return {
    fill: 'url(#grad-weak)',
    fallbackFill: '#9f1239',
    stroke: 'rgba(244, 63, 94, 0.45)',
    strokeHover: '#fda4af',
    bg: 'bg-rose-950/70',
    text: 'text-rose-300',
    accentText: '#fca5a5',
    border: 'border-rose-500/40',
    pillBg: '#4c0519',
    badgeBg: 'rgba(159, 18, 57, 0.45)',
    badgeBorder: 'rgba(244, 63, 94, 0.4)',
    badgeText: '#fecdd3',
    label: 'High Statutory Risk',
    barGradient: 'from-rose-600 to-red-400'
  };
};

// Executive color grading for Technology Risk Exposure Metrics (Higher = Greater Exposure)
const getExposureColor = (exposureScore: number) => {
  if (exposureScore >= 70) {
    return {
      fill: 'url(#grad-weak)',
      fallbackFill: '#881337',
      stroke: 'rgba(244, 63, 94, 0.7)',
      strokeHover: '#f43f5e',
      bg: 'bg-rose-950/80',
      text: 'text-rose-300',
      accentText: '#fda4af',
      border: 'border-rose-500/60',
      pillBg: '#4c0519',
      badgeBg: 'rgba(159, 18, 57, 0.6)',
      badgeBorder: 'rgba(244, 63, 94, 0.6)',
      badgeText: '#ffe4e6',
      label: 'Critical Exposure (Immediate Remediation)',
      tier: 'CRITICAL_EXPOSURE',
      barGradient: 'from-rose-600 to-red-500'
    };
  }
  if (exposureScore >= 45) {
    return {
      fill: 'url(#grad-moderate)',
      fallbackFill: '#9a3412',
      stroke: 'rgba(249, 115, 22, 0.6)',
      strokeHover: '#fb923c',
      bg: 'bg-orange-950/80',
      text: 'text-orange-300',
      accentText: '#fdba74',
      border: 'border-orange-500/50',
      pillBg: '#431407',
      badgeBg: 'rgba(154, 52, 18, 0.55)',
      badgeBorder: 'rgba(249, 115, 22, 0.5)',
      badgeText: '#ffedd5',
      label: 'High Exposure (Notice / Priority Watch)',
      tier: 'HIGH_EXPOSURE',
      barGradient: 'from-orange-600 to-amber-500'
    };
  }
  if (exposureScore >= 20) {
    return {
      fill: 'url(#grad-moderate)',
      fallbackFill: '#854d0e',
      stroke: 'rgba(234, 179, 8, 0.5)',
      strokeHover: '#facc15',
      bg: 'bg-amber-950/60',
      text: 'text-amber-300',
      accentText: '#fde047',
      border: 'border-amber-500/40',
      pillBg: '#451a03',
      badgeBg: 'rgba(133, 77, 14, 0.45)',
      badgeBorder: 'rgba(234, 179, 8, 0.4)',
      badgeText: '#fef08a',
      label: 'Medium Exposure (Mitigation Active)',
      tier: 'MEDIUM_EXPOSURE',
      barGradient: 'from-amber-600 to-yellow-500'
    };
  }
  return {
    fill: 'url(#grad-compliant)',
    fallbackFill: '#064e3b',
    stroke: 'rgba(16, 185, 129, 0.4)',
    strokeHover: '#34d399',
    bg: 'bg-emerald-950/50',
    text: 'text-emerald-300',
    accentText: '#6ee7b7',
    border: 'border-emerald-500/30',
    pillBg: '#022c22',
    badgeBg: 'rgba(6, 78, 59, 0.4)',
    badgeBorder: 'rgba(16, 185, 129, 0.35)',
    badgeText: '#a7f3d0',
    label: 'Controlled / Low Exposure',
    tier: 'LOW_EXPOSURE',
    barGradient: 'from-emerald-600 to-teal-500'
  };
};

interface DomainHeatMapItem {
  [key: string]: any;
  name: string;
  shortName: string;
  domainNumber: string;
  size: number;
  score: number; // Compliance score (0-100)
  exposureScore: number; // MAS Technology Risk Exposure Score (0-100)
  riskWeightedScore: number; // Net Posture = Compliance - Exposure Penalty (0-100)
  effectiveScore: number; // Currently rendered metric score
  criticality: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  totalReqs: number;
  compliantCount: number;
  partialCount: number;
  nonCompliantCount: number;
  gapCount: number;
  sampleFailedTotal: number;
  requirements: MASRequirementAssessmentRecord[];
  weakRequirements: MASRequirementAssessmentRecord[];
  exposureMetrics: MASDomainExposureMetrics;
  mappedRisks: RiskRecord[];
}

export const MASTRMComplianceHeatMap: React.FC = () => {
  const {
    masDomains,
    masAssessments,
    risks,
    masEnterpriseRiskProfile,
    mapRiskToMasRequirement,
    unmapRiskFromMasRequirement,
    calculateMASComplianceScore,
    setActiveModule,
    currentTenantId
  } = useGRC();

  const [metricType, setMetricType] = useState<HeatmapMetricType>('exposure');
  const [viewMode, setViewMode] = useState<'treemap' | 'barchart' | 'grid'>('treemap');
  const [filterMode, setFilterMode] = useState<'ALL' | 'WEAK' | 'CRITICAL' | 'HIGH_EXPOSURE'>('ALL');
  const [selectedDomainNumber, setSelectedDomainNumber] = useState<string | null>('8.0'); // default to 8.0 IAM
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [inspectorTab, setInspectorTab] = useState<'tech_risks' | 'weak_points'>('tech_risks');

  // Mapping drawer/selection state for mapping risk directly from heatmap
  const [selectedRiskToMap, setSelectedRiskToMap] = useState<string>('');
  const [selectedReqToMap, setSelectedReqToMap] = useState<string>('');
  const [mappingSuccessMessage, setMappingSuccessMessage] = useState<string | null>(null);

  const complianceMetrics = calculateMASComplianceScore();
  const tenantRisks = useMemo(() => risks.filter(r => r.tenantId === currentTenantId), [risks, currentTenantId]);

  // Prepare comprehensive domain-level heat map data integrating RiskEngine exposure metrics
  const domainDataList: DomainHeatMapItem[] = useMemo(() => {
    return masDomains.map((dom) => {
      const domScore = complianceMetrics.domainBreakdown[dom.domainNumber] ?? 80;
      const domReqs = masAssessments.filter(
        a => a.domainNumber === dom.domainNumber && a.applicabilityStatus === 'APPLICABLE'
      );
      
      const compliantCount = domReqs.filter(r => r.complianceStatus === 'COMPLIANT').length;
      const partialCount = domReqs.filter(r => r.complianceStatus === 'PARTIALLY_COMPLIANT').length;
      const nonCompliantCount = domReqs.filter(r => r.complianceStatus === 'NON_COMPLIANT').length;
      const weakRequirements = domReqs.filter(r => r.complianceStatus !== 'COMPLIANT');
      const gapCount = weakRequirements.length;
      const sampleFailedTotal = domReqs.reduce((sum, r) => sum + (r.testedSamplesFailedCount || 0), 0);

      // Compute MAS Domain Exposure Metrics via RiskEngine
      const exposureMetrics = RiskEngine.calculateDomainExposureMetrics(dom.domainNumber, tenantRisks);
      const exposureScore = exposureMetrics.domainExposureIndex;

      // Compute Risk-Weighted Score
      const riskWeightedScore = RiskEngine.computeRiskWeightedComplianceScore(
        domScore,
        masEnterpriseRiskProfile,
        dom.domainNumber
      ).adjustedScore;

      // Determine effective score for the active metric
      const effectiveScore = metricType === 'compliance'
        ? domScore
        : metricType === 'exposure'
        ? exposureScore
        : riskWeightedScore;

      // Map risks specifically related to this domain
      const mappedRisks = tenantRisks.filter(r => exposureMetrics.uniqueRiskCodes.includes(r.riskCode));

      // Treemap weight: Higher exposure or gaps increase tile prominence
      const baseWeight = dom.weightPercentage || 6;
      const size = Math.max(35, baseWeight * 10 + (exposureScore * 0.4) + (gapCount * 8));

      return {
        name: `${dom.domainNumber} ${dom.shortName || dom.name}`,
        shortName: dom.shortName || dom.name,
        domainNumber: dom.domainNumber,
        size,
        score: domScore,
        exposureScore,
        riskWeightedScore,
        effectiveScore,
        criticality: dom.criticality,
        totalReqs: domReqs.length || dom.totalRequirements,
        compliantCount,
        partialCount,
        nonCompliantCount,
        gapCount,
        sampleFailedTotal,
        requirements: domReqs,
        weakRequirements,
        exposureMetrics,
        mappedRisks
      };
    });
  }, [masDomains, masAssessments, complianceMetrics, tenantRisks, masEnterpriseRiskProfile, metricType]);

  // Filtered dataset for charts
  const filteredData = useMemo(() => {
    let list = [...domainDataList];
    if (filterMode === 'WEAK') {
      list = list.filter(d => d.score < 85 || d.gapCount > 0);
    } else if (filterMode === 'CRITICAL') {
      list = list.filter(d => d.criticality === 'CRITICAL');
    } else if (filterMode === 'HIGH_EXPOSURE') {
      list = list.filter(d => d.exposureScore >= 45);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(d => 
        d.name.toLowerCase().includes(q) || 
        d.domainNumber.toLowerCase().includes(q) ||
        d.shortName.toLowerCase().includes(q) ||
        d.mappedRisks.some(r => r.riskCode.toLowerCase().includes(q) || r.title.toLowerCase().includes(q))
      );
    }

    return list;
  }, [domainDataList, filterMode, searchTerm]);

  // Currently selected domain for deep drill-down inspector
  const activeDomain = useMemo(() => {
    if (!selectedDomainNumber) return domainDataList[0] || null;
    return domainDataList.find(d => d.domainNumber === selectedDomainNumber) || domainDataList[0] || null;
  }, [domainDataList, selectedDomainNumber]);

  // Available requirements in active domain for mapping
  const activeDomainRequirements = useMemo(() => {
    if (!activeDomain) return [];
    return MAS_TRM_REQUIREMENTS_2021.filter(r => r.domainNumber === activeDomain.domainNumber);
  }, [activeDomain]);

  // Unmapped or other technology risks available to map
  const availableRisksToMap = useMemo(() => {
    if (!activeDomain) return [];
    const activeRiskCodes = new Set(activeDomain.mappedRisks.map(r => r.riskCode));
    return tenantRisks.filter(r => !activeRiskCodes.has(r.riskCode));
  }, [activeDomain, tenantRisks]);

  // Summary KPIs across domains
  const weakDomainsCount = domainDataList.filter(d => d.score < 85).length;
  const criticalExposureCount = domainDataList.filter(d => d.exposureScore >= 70).length;
  const highExposureCount = domainDataList.filter(d => d.exposureScore >= 45 && d.exposureScore < 70).length;
  const totalMappedTechRisks = masEnterpriseRiskProfile.mappedToMasCount;

  // Handles adding a mapping directly from the inspector
  const handleCreateMapping = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRiskToMap || !selectedReqToMap) return;

    mapRiskToMasRequirement(selectedRiskToMap, selectedReqToMap);
    const mappedRisk = tenantRisks.find(r => r.id === selectedRiskToMap);
    const mappedReq = MAS_TRM_REQUIREMENTS_2021.find(r => r.id === selectedReqToMap);

    setMappingSuccessMessage(`Successfully mapped ${mappedRisk?.riskCode || 'Risk'} to ${mappedReq?.requirementCode || selectedReqToMap}!`);
    setTimeout(() => setMappingSuccessMessage(null), 4000);

    setSelectedRiskToMap('');
  };

  const handleUnmapRisk = (riskId: string, reqId: string) => {
    unmapRiskFromMasRequirement(riskId, reqId);
  };

  // Helper color picker depending on active metric mode
  const getItemColor = (item: DomainHeatMapItem) => {
    if (metricType === 'exposure') {
      return getExposureColor(item.exposureScore);
    }
    if (metricType === 'risk_weighted') {
      return getComplianceColor(item.riskWeightedScore);
    }
    return getComplianceColor(item.score);
  };

  // Custom Treemap Content Renderer - Executive Luxury Micro-Card Design
  const renderCustomTreemapNode = (props: any) => {
    const { x, y, width, height, domainNumber } = props;

    if (!width || !height || width < 45 || height < 32) {
      return null;
    }

    const item = domainDataList.find(d => d.domainNumber === domainNumber);
    if (!item) return null;

    const isSelected = selectedDomainNumber === domainNumber;
    const color = getItemColor(item);

    // Padding & dimensions
    const pad = 2.5;
    const innerWidth = Math.max(0, width - pad * 2);
    const innerHeight = Math.max(0, height - pad * 2);

    const isCompact = width < 85 || height < 60;
    const isMini = width < 65 || height < 45;

    return (
      <g
        transform={`translate(${x + pad}, ${y + pad})`}
        style={{ cursor: 'pointer' }}
        onClick={() => setSelectedDomainNumber(domainNumber)}
      >
        {/* Background Card */}
        <rect
          width={innerWidth}
          height={innerHeight}
          rx={8}
          ry={8}
          fill={color.fallbackFill}
          stroke={isSelected ? '#818cf8' : color.stroke}
          strokeWidth={isSelected ? 2.5 : 1}
          style={{
            filter: isSelected ? 'drop-shadow(0 0 10px rgba(99, 102, 241, 0.6))' : 'none',
            transition: 'all 0.2s ease-in-out'
          }}
        />

        {/* Diagonal stripes overlay for critical criticality */}
        {item.criticality === 'CRITICAL' && (
          <rect
            width={innerWidth}
            height={innerHeight}
            rx={8}
            ry={8}
            fill="url(#pattern-stripes)"
            opacity={0.12}
            pointerEvents="none"
          />
        )}

        {/* Text Content */}
        {!isMini && (
          <g>
            {/* Domain Number Badge */}
            <text
              x={8}
              y={16}
              fill="#ffffff"
              fontSize={isCompact ? 10 : 12}
              fontWeight="bold"
              fontFamily="monospace"
            >
              {item.domainNumber}
            </text>

            {/* Metric Score Badge */}
            <text
              x={innerWidth - 8}
              y={16}
              fill={color.accentText}
              fontSize={isCompact ? 10 : 12}
              fontWeight="bold"
              textAnchor="end"
              fontFamily="monospace"
            >
              {metricType === 'exposure' ? `${item.exposureScore} Exp` : `${item.effectiveScore}%`}
            </text>

            {/* Domain Short Title */}
            {!isCompact && (
              <text
                x={8}
                y={34}
                fill="#f8fafc"
                fontSize={11}
                fontWeight="600"
                style={{
                  maxWidth: innerWidth - 16,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {item.shortName.length > (innerWidth / 7.5)
                  ? `${item.shortName.slice(0, Math.floor(innerWidth / 7.5))}...`
                  : item.shortName}
              </text>
            )}

            {/* Bottom Status / Mapped Risks Sub-Badge */}
            {innerHeight > 65 && (
              <g transform={`translate(8, ${innerHeight - 16})`}>
                <text
                  x={0}
                  y={0}
                  fill={item.mappedRisks.length > 0 ? '#fdba74' : '#94a3b8'}
                  fontSize={9}
                  fontWeight="600"
                >
                  {item.mappedRisks.length > 0
                    ? `⚠ ${item.mappedRisks.length} Tech Risk${item.mappedRisks.length > 1 ? 's' : ''}`
                    : `${item.totalReqs} Controls`}
                </text>
              </g>
            )}
          </g>
        )}

        {/* Mini Tile fallback */}
        {isMini && (
          <text
            x={innerWidth / 2}
            y={innerHeight / 2 + 4}
            fill="#ffffff"
            fontSize={10}
            fontWeight="bold"
            textAnchor="middle"
            fontFamily="monospace"
          >
            {item.domainNumber}
          </text>
        )}
      </g>
    );
  };

  return (
    <div className="space-y-6">
      {/* SVG Pattern & Gradient Definitions */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="grad-compliant" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#064e3b" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#022c22" stopOpacity="0.95" />
          </linearGradient>
          <linearGradient id="grad-moderate" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#78350f" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#451a03" stopOpacity="0.95" />
          </linearGradient>
          <linearGradient id="grad-weak" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#881337" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#4c0519" stopOpacity="0.95" />
          </linearGradient>
          <pattern id="pattern-stripes" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="8" stroke="#ffffff" strokeWidth="2" />
          </pattern>
        </defs>
      </svg>

      {/* Main Container Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden backdrop-blur-md">
        {/* Header Ribbon with Metric Dimension Switcher */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800/90">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800/90 text-slate-200 border border-slate-700/80 flex items-center gap-1.5 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  MAS TRM Guidelines 2021/2026 &bull; Multi-Framework Risk Engine
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  14 Operational Domains &bull; Notice 644 / Notice 655
                </span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                MAS Technology Risk Heatmap &amp; Exposure Engine
              </h2>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                Aggregates active enterprise Technology Risks with statutory MAS TRM requirement IDs to compute supervisory exposure indices, gap densities, and residual risk tiers.
              </p>
            </div>

            {/* Executive Quick Exposure KPI Group */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="px-3.5 py-2 rounded-xl bg-gradient-to-br from-indigo-950/70 to-slate-950 border border-indigo-500/30 text-xs shadow-xs">
                <span className="text-indigo-300 font-bold text-sm block leading-tight font-mono">
                  {totalMappedTechRisks} / {tenantRisks.length}
                </span>
                <span className="text-[10px] text-slate-400">Tech Risks Mapped</span>
              </div>

              <div className="px-3.5 py-2 rounded-xl bg-gradient-to-br from-orange-950/70 to-slate-950 border border-orange-500/30 text-xs shadow-xs">
                <span className="text-orange-300 font-bold text-sm block leading-tight font-mono">
                  {masEnterpriseRiskProfile.overallExposureScore} / 100
                </span>
                <span className="text-[10px] text-slate-400">Enterprise Exposure Index</span>
              </div>

              <div className="px-3.5 py-2 rounded-xl bg-gradient-to-br from-rose-950/70 to-slate-950 border border-rose-500/30 text-xs shadow-xs">
                <span className="text-rose-300 font-bold text-sm block leading-tight font-mono">
                  {criticalExposureCount + highExposureCount} Domains
                </span>
                <span className="text-[10px] text-slate-400">Elevated Exposure</span>
              </div>
            </div>
          </div>

          {/* Metric Dimension & Visualization Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-5 pt-4 border-t border-slate-800/80">
            {/* Metric Mode Selector */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5 mr-1">
                <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                Heatmap Metric:
              </span>
              <button
                onClick={() => setMetricType('exposure')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  metricType === 'exposure'
                    ? 'bg-gradient-to-r from-orange-600 to-rose-600 text-white shadow-md shadow-orange-950/50 border border-orange-400/40'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
                title="Technology Risk Exposure Index (0-100) mapped from active Technology Risks"
              >
                <Flame className="w-3.5 h-3.5 text-amber-300" />
                Technology Risk Exposure
              </button>
              <button
                onClick={() => setMetricType('compliance')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  metricType === 'compliance'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950/50 border border-emerald-400/40'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
                title="Supervisory Compliance Score (%) based on audit checklists and tested samples"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                Compliance Audit %
              </button>
              <button
                onClick={() => setMetricType('risk_weighted')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  metricType === 'risk_weighted'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-950/50 border border-indigo-400/40'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
                title="Risk-Weighted Net Posture: Compliance score haircut by active Technology Risk exposure"
              >
                <Activity className="w-3.5 h-3.5 text-purple-300" />
                Risk-Weighted Posture
              </button>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center gap-2">
              <div className="bg-slate-950/90 p-1 rounded-xl border border-slate-800 flex items-center gap-1 shadow-inner">
                <button
                  onClick={() => setViewMode('treemap')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === 'treemap'
                      ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Interactive Recharts Treemap Heatmap"
                >
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  Treemap Heatmap
                </button>
                <button
                  onClick={() => setViewMode('barchart')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === 'barchart'
                      ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Ranked Recharts Horizontal Bar Chart"
                >
                  <BarChart2 className="w-3.5 h-3.5 text-indigo-400" />
                  Ranked Horizon
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Bento Grid Matrix View"
                >
                  <Grid className="w-3.5 h-3.5 text-indigo-400" />
                  Matrix Grid
                </button>
              </div>
            </div>
          </div>

          {/* Quick Filter Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-3 border-t border-slate-800/60">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                <Filter className="w-3 h-3 text-slate-500" />
                Filter:
              </span>
              <button
                onClick={() => setFilterMode('ALL')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filterMode === 'ALL'
                    ? 'bg-slate-800 text-white border border-slate-600'
                    : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                All 14 Domains ({domainDataList.length})
              </button>
              <button
                onClick={() => setFilterMode('HIGH_EXPOSURE')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  filterMode === 'HIGH_EXPOSURE'
                    ? 'bg-orange-950 text-orange-200 border border-orange-500/60'
                    : 'bg-slate-900/80 text-slate-400 hover:text-orange-300 border border-transparent'
                }`}
              >
                <Flame className="w-3 h-3 text-orange-400" />
                High Exposure ({criticalExposureCount + highExposureCount})
              </button>
              <button
                onClick={() => setFilterMode('WEAK')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  filterMode === 'WEAK'
                    ? 'bg-amber-950 text-amber-200 border border-amber-500/60'
                    : 'bg-slate-900/80 text-slate-400 hover:text-amber-300 border border-transparent'
                }`}
              >
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                Audit Gaps ({weakDomainsCount})
              </button>
              <button
                onClick={() => setFilterMode('CRITICAL')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  filterMode === 'CRITICAL'
                    ? 'bg-rose-950 text-rose-200 border border-rose-500/60'
                    : 'bg-slate-900/80 text-slate-400 hover:text-rose-300 border border-transparent'
                }`}
              >
                <Flame className="w-3 h-3 text-rose-400" />
                Critical Systems ({domainDataList.filter(d => d.criticality === 'CRITICAL').length})
              </button>
            </div>

            {/* Quick Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search domain or risk code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-48 sm:w-56"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Heat Map & Drill-Down Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Left/Main Column: Recharts Visualization Stage */}
          <div className="lg:col-span-8 p-5 sm:p-6 space-y-4 border-b lg:border-b-0 lg:border-r border-slate-800/90">
            {/* Dynamic Legend based on Metric */}
            <div className="flex items-center justify-between text-xs bg-slate-950/90 p-3.5 rounded-xl border border-slate-800 shadow-sm flex-wrap gap-3">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  {metricType === 'exposure' ? 'MAS Exposure Tiers:' : 'Compliance Posture:'}
                </span>

                {metricType === 'exposure' ? (
                  <>
                    <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-rose-950/70 border border-rose-500/40 text-rose-300 text-[11px] font-medium">
                      <span className="w-2 h-2 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
                      <span>&ge;70 Critical Exposure</span>
                    </div>
                    <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-orange-950/70 border border-orange-500/40 text-orange-300 text-[11px] font-medium">
                      <span className="w-2 h-2 rounded-full bg-orange-400 shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
                      <span>45 - 69 High Exposure</span>
                    </div>
                    <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-amber-950/60 border border-amber-500/30 text-amber-300 text-[11px] font-medium">
                      <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(234,179,8,0.8)]" />
                      <span>20 - 44 Medium Exposure</span>
                    </div>
                    <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-[11px] font-medium">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                      <span>&lt;20 Controlled</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-[11px] font-medium">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                      <span>&ge; 85% Optimal</span>
                    </div>
                    <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-amber-950/60 border border-amber-500/30 text-amber-300 text-[11px] font-medium">
                      <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                      <span>70% - 84% Watchlist</span>
                    </div>
                    <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-rose-950/60 border border-rose-500/35 text-rose-300 text-[11px] font-medium">
                      <span className="w-2 h-2 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
                      <span>&lt; 70% Statutory Risk</span>
                    </div>
                  </>
                )}
              </div>

              <span className="text-slate-400 text-[11px]">
                Active: <strong className="text-white">Domain {activeDomain?.domainNumber || 'N/A'}</strong>
              </span>
            </div>

            {/* Notification of Mapping Operation */}
            {mappingSuccessMessage && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-xs text-emerald-200 flex items-center justify-between animate-fadeIn">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  {mappingSuccessMessage}
                </span>
                <button onClick={() => setMappingSuccessMessage(null)} className="text-emerald-400 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* VIEW 1: Interactive Recharts Treemap */}
            {viewMode === 'treemap' && (
              <div className="bg-slate-950 rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-2xl h-[470px]">
                <ResponsiveContainer width="100%" height="100%">
                  <Treemap
                    data={filteredData}
                    dataKey="size"
                    aspectRatio={4 / 3}
                    stroke="#0f172a"
                    content={renderCustomTreemapNode}
                  >
                    <Tooltip
                      content={({ payload }) => {
                        if (!payload || !payload.length) return null;
                        const item = payload[0].payload as DomainHeatMapItem;
                        const color = getItemColor(item);
                        return (
                          <div className="bg-slate-950/95 border border-slate-700 p-3.5 rounded-xl shadow-2xl text-xs space-y-1.5 backdrop-blur-md">
                            <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-1.5">
                              <span className="font-mono text-indigo-400 font-bold">
                                Domain {item.domainNumber}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${color.bg} ${color.text} border ${color.border}`}>
                                {metricType === 'exposure' ? `${item.exposureScore} Exposure` : `${item.effectiveScore}%`}
                              </span>
                            </div>
                            <div className="text-white font-bold">{item.shortName}</div>
                            <div className="text-slate-300 text-[11px] grid grid-cols-2 gap-2 pt-1 font-mono">
                              <div>Compliance: <strong className="text-white">{item.score}%</strong></div>
                              <div>Tech Exposure: <strong className="text-orange-300">{item.exposureScore}/100</strong></div>
                              <div>Mapped Risks: <strong className="text-amber-300">{item.mappedRisks.length}</strong></div>
                              <div>Statutory Gaps: <strong className="text-rose-300">{item.gapCount}</strong></div>
                            </div>
                            <div className="text-slate-400 text-[10px] pt-1 border-t border-slate-800/80">
                              Click tile to inspect mapped Technology Risks &amp; statutory requirements.
                            </div>
                          </div>
                        );
                      }}
                    />
                  </Treemap>
                </ResponsiveContainer>
              </div>
            )}

            {/* VIEW 2: Ranked Horizon Bar Chart */}
            {viewMode === 'barchart' && (
              <div className="bg-gradient-to-b from-slate-950 via-slate-900/60 to-slate-950 rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-2xl h-[470px]">
                <div className="flex justify-between items-center text-xs text-slate-400 mb-2 px-2">
                  <span className="font-medium">MAS TRM Domain (3.0 - 17.0)</span>
                  <span className="text-indigo-400 font-medium">
                    {metricType === 'exposure' ? 'Ranked by Technology Risk Exposure (0-100)' : 'Ranked by Compliance %'}
                  </span>
                </div>
                <ResponsiveContainer width="100%" height="92%">
                  <BarChart
                    layout="vertical"
                    data={[...filteredData].sort((a, b) => 
                      metricType === 'exposure' ? b.exposureScore - a.exposureScore : a.score - b.score
                    )}
                    margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                    <XAxis
                      type="number"
                      domain={[0, 100]}
                      unit={metricType === 'exposure' ? '' : '%'}
                      tick={{ fill: '#94a3b8', fontSize: 10 }}
                      stroke="#334155"
                    />
                    <YAxis
                      dataKey="domainNumber"
                      type="category"
                      tick={{ fill: '#e2e8f0', fontSize: 11, fontWeight: 'bold', fontFamily: 'monospace' }}
                      stroke="#334155"
                    />
                    <Tooltip
                      content={({ payload }) => {
                        if (!payload || !payload.length) return null;
                        const item = payload[0].payload as DomainHeatMapItem;
                        const color = getItemColor(item);
                        return (
                          <div className="bg-slate-950 border border-slate-700 p-3 rounded-xl shadow-2xl text-xs space-y-1">
                            <span className="font-mono text-indigo-400 font-bold">{item.domainNumber} {item.shortName}</span>
                            <div className="text-white font-bold">
                              {metricType === 'exposure' ? `Risk Exposure: ${item.exposureScore}/100` : `Compliance: ${item.score}%`}
                            </div>
                            <div className={color.text}>{color.label}</div>
                            <div className="text-slate-400 text-[10px]">
                              {item.mappedRisks.length} mapped risk(s) &bull; {item.gapCount} gap(s)
                            </div>
                          </div>
                        );
                      }}
                    />
                    {metricType === 'exposure' ? (
                      <ReferenceLine
                        x={45}
                        stroke="#f97316"
                        strokeDasharray="4 4"
                        label={{ value: 'High Exposure (45+)', position: 'top', fill: '#f97316', fontSize: 10 }}
                      />
                    ) : (
                      <ReferenceLine
                        x={85}
                        stroke="#10b981"
                        strokeDasharray="4 4"
                        label={{ value: 'MAS 85% Target', position: 'top', fill: '#10b981', fontSize: 10 }}
                      />
                    )}
                    <Bar
                      dataKey={metricType === 'exposure' ? 'exposureScore' : 'effectiveScore'}
                      radius={[0, 6, 6, 0]}
                      onClick={(entry: any) => setSelectedDomainNumber(entry?.domainNumber || entry?.payload?.domainNumber)}
                    >
                      {filteredData.map((entry) => {
                        const col = getItemColor(entry);
                        return (
                          <Cell
                            key={`bar-${entry.domainNumber}`}
                            fill={col.fallbackFill}
                            stroke={selectedDomainNumber === entry.domainNumber ? '#818cf8' : col.stroke}
                            strokeWidth={selectedDomainNumber === entry.domainNumber ? 2 : 1}
                            style={{ cursor: 'pointer' }}
                          />
                        );
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* VIEW 3: Bento Matrix Grid View */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[470px] overflow-y-auto pr-1">
                {filteredData.map(item => {
                  const color = getItemColor(item);
                  const isSelected = selectedDomainNumber === item.domainNumber;

                  return (
                    <div
                      key={item.domainNumber}
                      onClick={() => setSelectedDomainNumber(item.domainNumber)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between text-xs space-y-2 relative overflow-hidden ${
                        isSelected
                          ? 'bg-slate-800/95 border-indigo-500 shadow-xl ring-1 ring-indigo-500/40'
                          : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-indigo-300 text-xs">
                          {item.domainNumber}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${color.bg} ${color.text} border ${color.border}`}>
                          {metricType === 'exposure' ? `${item.exposureScore} Exp` : `${item.effectiveScore}%`}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-semibold text-white text-xs leading-snug line-clamp-2">
                          {item.shortName}
                        </h4>
                        <span className="text-[10px] text-slate-400 block pt-0.5">
                          {item.totalReqs} Controls &bull; {item.mappedRisks.length} Tech Risks
                        </span>
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                        <span className={item.exposureScore >= 45 ? 'text-orange-400 font-semibold' : 'text-emerald-400'}>
                          {item.exposureMetrics.exposureTier.replace(/_/g, ' ')}
                        </span>
                        {item.criticality === 'CRITICAL' && (
                          <span className="px-1.5 py-0.5 rounded bg-rose-950/80 text-rose-300 text-[9px] font-mono font-bold border border-rose-800/50">
                            CRIT
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Quick Explanatory Footer */}
            <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
              <span>
                Risk Engine calculates exposure based on mapped Technology Risks, Notice 644/655 statutory weighting &amp; treatment statuses.
              </span>
              <button
                onClick={() => setActiveModule('mas_checklist')}
                className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 cursor-pointer transition-colors"
              >
                Open 14-Domain Checklist
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Right Column: Deep-Dive Weak Area & Technology Risk Mapping Inspector */}
          <div className="lg:col-span-4 p-5 sm:p-6 bg-slate-950/50 space-y-4">
            {activeDomain ? (
              <>
                {/* Selected Domain Header Banner */}
                <div className="space-y-2 pb-3.5 border-b border-slate-800/90">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-200 font-mono text-xs font-bold border border-slate-700">
                      Domain {activeDomain.domainNumber}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getItemColor(activeDomain).bg} ${getItemColor(activeDomain).text} border ${getItemColor(activeDomain).border}`}>
                      {metricType === 'exposure'
                        ? `${activeDomain.exposureScore} / 100 Exposure`
                        : `${activeDomain.score}% Compliance`}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white leading-tight">
                    {activeDomain.name}
                  </h3>

                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Criticality: <strong className="text-amber-300">{activeDomain.criticality}</strong></span>
                    <span>Mapped Risks: <strong className="text-orange-300 font-mono">{activeDomain.mappedRisks.length}</strong></span>
                  </div>

                  {/* Exposure & Compliance Dual KPI Metric Strip */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px]">
                      <span className="text-slate-400 block text-[10px]">Exposure Tier</span>
                      <strong className={activeDomain.exposureScore >= 45 ? 'text-rose-300 font-bold' : 'text-emerald-300 font-bold'}>
                        {activeDomain.exposureMetrics.exposureTier.replace(/_/g, ' ')}
                      </strong>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px]">
                      <span className="text-slate-400 block text-[10px]">Residual Inherent Spread</span>
                      <strong className="text-white font-mono">
                        Res: {activeDomain.exposureMetrics.avgResidualScore} / Max: {activeDomain.exposureMetrics.maxInherentScore}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Sub-Tab Switcher: Technology Risks vs Supervisory Gaps */}
                <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800">
                  <button
                    onClick={() => setInspectorTab('tech_risks')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      inspectorTab === 'tech_risks'
                        ? 'bg-slate-800 text-orange-300 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5" />
                    Mapped Tech Risks ({activeDomain.mappedRisks.length})
                  </button>
                  <button
                    onClick={() => setInspectorTab('weak_points')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      inspectorTab === 'weak_points'
                        ? 'bg-slate-800 text-amber-300 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Audit Gaps ({activeDomain.weakRequirements.length})
                  </button>
                </div>

                {/* TAB 1: Mapped Technology Risks & Fast Mapping Controls */}
                {inspectorTab === 'tech_risks' && (
                  <div className="space-y-3">
                    {/* Fast Risk Mapping Dropdown Form */}
                    <form onSubmit={handleCreateMapping} className="p-3 bg-slate-900/90 border border-indigo-900/40 rounded-xl space-y-2.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-indigo-300">
                        <span className="flex items-center gap-1">
                          <LinkIcon className="w-3 h-3 text-indigo-400" />
                          Map Existing Tech Risk to Domain {activeDomain.domainNumber}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-400 block">1. Select Technology Risk</label>
                        <select
                          value={selectedRiskToMap}
                          onChange={(e) => setSelectedRiskToMap(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                        >
                          <option value="">-- Choose Technology Risk --</option>
                          {availableRisksToMap.map(r => (
                            <option key={r.id} value={r.id}>
                              {r.riskCode} - {r.title.slice(0, 42)}... (Inherent: {r.inherentScore})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-400 block">2. Target MAS TRM Requirement ID</label>
                        <select
                          value={selectedReqToMap}
                          onChange={(e) => setSelectedReqToMap(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                        >
                          <option value="">-- Choose MAS Requirement ID --</option>
                          {activeDomainRequirements.map(req => (
                            <option key={req.id} value={req.id}>
                              {req.requirementCode}: {req.title.slice(0, 36)}... {req.criticalSystemsMandate ? '[Notice 644]' : ''}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        type="submit"
                        disabled={!selectedRiskToMap || !selectedReqToMap}
                        className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-indigo-950/40"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Map Risk &amp; Recalculate Heatmap Exposure
                      </button>
                    </form>

                    {/* Mapped Risks List */}
                    <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                      {activeDomain.mappedRisks.length === 0 ? (
                        <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl text-center space-y-1">
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto" />
                          <p className="text-xs font-semibold text-slate-300">No Active Risks Mapped</p>
                          <p className="text-[11px] text-slate-500">
                            Use the selector above to link existing technology risks to Domain {activeDomain.domainNumber}.
                          </p>
                        </div>
                      ) : (
                        activeDomain.mappedRisks.map(rsk => {
                          const mappedReqs = (rsk.frameworkMappings?.masTrmRequirementIds || []).filter(id => 
                            activeDomainRequirements.some(req => req.id === id || req.requirementCode === id)
                          );

                          return (
                            <div
                              key={rsk.id}
                              className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2 text-xs hover:border-slate-700 transition-colors"
                            >
                              <div className="flex items-start justify-between gap-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-sky-300 font-mono font-bold text-[10px] border border-slate-700">
                                    {rsk.riskCode}
                                  </span>
                                  <span className="px-1.5 py-0.5 rounded bg-slate-950 text-slate-300 text-[10px]">
                                    {rsk.category}
                                  </span>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  rsk.residualScore >= 9 ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                }`}>
                                  Residual: {rsk.residualScore}
                                </span>
                              </div>

                              <h4 className="font-semibold text-white text-xs leading-snug">
                                {rsk.title}
                              </h4>

                              {/* Mapped Requirement ID Badges with Unmap control */}
                              <div className="space-y-1 pt-1 border-t border-slate-800/80">
                                <span className="text-[10px] text-slate-400 block font-medium">Mapped MAS Requirements:</span>
                                <div className="flex flex-wrap gap-1">
                                  {mappedReqs.map(reqId => (
                                    <span
                                      key={reqId}
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono text-[10px]"
                                    >
                                      <span>{reqId}</span>
                                      <button
                                        type="button"
                                        onClick={() => handleUnmapRisk(rsk.id, reqId)}
                                        className="text-slate-400 hover:text-rose-400 cursor-pointer"
                                        title={`Unmap from ${reqId}`}
                                      >
                                        <X className="w-2.5 h-2.5" />
                                      </button>
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 2: Supervisory Weak Points & Statutory Gaps */}
                {inspectorTab === 'weak_points' && (
                  <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                    {activeDomain.weakRequirements.length === 0 ? (
                      <div className="p-4 bg-emerald-950/20 border border-emerald-800/40 rounded-xl text-center space-y-1.5">
                        <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
                        <p className="text-xs font-bold text-emerald-300">All Requirements Met</p>
                        <p className="text-[11px] text-slate-400">
                          Zero statutory non-conformities identified in Domain {activeDomain.domainNumber}.
                        </p>
                      </div>
                    ) : (
                      activeDomain.weakRequirements.map(req => (
                        <div
                          key={req.id}
                          className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1.5 text-xs hover:border-slate-700 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-1">
                            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono font-bold text-[10px] border border-slate-700">
                              {req.requirementCode}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-amber-950/60 text-amber-300 text-[10px] font-semibold border border-amber-800/40">
                              {req.complianceStatus.replace(/_/g, ' ')}
                            </span>
                          </div>

                          <h4 className="font-semibold text-white text-xs leading-snug">
                            {req.requirementTitle}
                          </h4>

                          {req.identifiedGaps && (
                            <div className="p-2 bg-slate-950 rounded-lg text-[11px] text-amber-200 border border-amber-900/30">
                              <strong className="text-amber-400">Gap:</strong> {req.identifiedGaps}
                            </div>
                          )}

                          {req.testedSamplesFailedCount > 0 && (
                            <div className="text-[10px] text-rose-300 flex items-center gap-1">
                              <span>Sample Exception:</span>
                              <strong>{req.testedSamplesFailedCount} of {req.testedSamplesCount} tested items failed</strong>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Action Hub for this Domain */}
                <div className="pt-3 border-t border-slate-800/90 space-y-2">
                  <button
                    onClick={() => setActiveModule('mas_assessment_workbench')}
                    className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-indigo-950/60 cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Drill Down into Assessment Workbench
                  </button>

                  <button
                    onClick={() => setActiveModule('risk_map')}
                    className="w-full py-2 px-3 rounded-xl bg-slate-800/90 hover:bg-slate-750 text-slate-200 font-medium text-xs flex items-center justify-center gap-1.5 transition-all border border-slate-700 cursor-pointer"
                  >
                    <Flame className="w-3.5 h-3.5 text-orange-400" />
                    Open Enterprise Risk Heatmap Matrix
                  </button>
                </div>
              </>
            ) : (
              <div className="py-16 text-center text-slate-400 text-xs">
                Select a domain on the heat map to inspect mapped Technology Risks.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
