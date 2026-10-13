// Skanda GRC — Compliance Heatmap Component
// Visualizes regulatory control maturity levels (CMMI Levels 1-5) across business departments,
// using a color-coded grid matrix to highlight high-risk non-compliance areas.
// Supports multi-framework pivots (Unified, ISO 27001, MAS TRM, ISO 27701, Composite Scorecard),
// interactive maturity distribution filtering, high-risk spotlighting, priority escalation hotspots,
// crosshair row/col tracking, and forensic inspection drill-downs.

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence, type Variants } from 'motion/react';
import {
  Grid,
  LayoutGrid,
  Layers,
  Building,
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Filter,
  Search,
  Download,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  Minus,
  AlertOctagon,
  Sparkles,
  Info,
  Sliders,
  Flame,
  Zap,
  Shield,
  ArrowLeft,
  Users,
  Eye,
  EyeOff,
  Activity,
  ShieldAlert,
  BarChart3,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronUp,
  PanelRight,
  Maximize2
} from 'lucide-react';
import {
  HeatmapCellData,
  HeatmapStatus,
  RiskSeverityLevel,
  HEATMAP_DEPARTMENTS,
  HEATMAP_ISO_CLAUSES,
  HEATMAP_MAS_MODULES,
  HEATMAP_PIMS_CLAUSES,
  ISOClauseInherentRisk,
  ComplianceHeatmapService
} from '../../services/complianceHeatmapService';
import { calculateControlRiskTrend } from '../../services/d3ComplianceHeatmapData';
import { ComplianceOverlayService } from '../../services/complianceOverlayService';
import { ComplianceHeatmapDetailModal } from '../dashboard/ComplianceHeatmapDetailModal';
import { ComplianceHeatmapSidebar } from './ComplianceHeatmapSidebar';
import { MaturitySparkline } from './MaturitySparkline';
import { CMMILegend } from './CMMILegend';
import { RiskCategoryLegend, RiskCategoryDistribution } from './RiskCategoryLegend';
import { RemediationPriorityQueue } from './RemediationPriorityQueue';
import { ISOInherentRiskConfigModal } from '../dashboard/ISOInherentRiskConfigModal';
import { useGRC } from '../../context/GRCContext';
import { useToast } from '../common/ToastContainer';
import { safeConfirm } from '../../utils/safeConfirm';

export interface ComplianceHeatmapProps {
  onNavigateModule?: (moduleId: string) => void;
  initialDimension?: HeatmapDimensionMode;
  initialFramework?: string;
  initialDepartment?: string;
  filterFramework?: string;
  filterDepartment?: string;
  initialControlFilter?: 'ALL' | 'HIGH_RISK' | 'URGENT_REMEDIATION';
  onFrameworkChange?: (framework: string) => void;
  onDepartmentChange?: (deptId: string) => void;
  onControlFilterChange?: (filter: 'ALL' | 'HIGH_RISK' | 'URGENT_REMEDIATION') => void;
  onSwitchViewMode?: (mode: 'executive' | 'operational' | 'heatmap') => void;
  hideBreadcrumb?: boolean;
}

export type HeatmapDimensionMode =
  | 'tri_dimensional'
  | 'dept_vs_iso'
  | 'dept_vs_mas'
  | 'dept_vs_pims'
  | 'department_composite'
  | 'grid_tiles';

export const mapFrameworkToDimension = (fw?: string): HeatmapDimensionMode | undefined => {
  if (!fw) return undefined;
  const normalized = fw.toLowerCase().replace(/[\s\-_/]/g, '');
  if (normalized.includes('iso27001') || normalized.includes('isms') || normalized === 'iso') return 'dept_vs_iso';
  if (normalized.includes('mas') || normalized.includes('trm')) return 'dept_vs_mas';
  if (normalized.includes('27701') || normalized.includes('pims') || normalized.includes('privacy') || normalized.includes('dpdp')) return 'dept_vs_pims';
  if (normalized.includes('composite') || normalized.includes('scorecard')) return 'department_composite';
  if (normalized.includes('grid') || normalized.includes('tile')) return 'grid_tiles';
  if (normalized.includes('all') || normalized.includes('tri') || normalized.includes('unified')) return 'tri_dimensional';
  return undefined;
};

export const mapDimensionToFramework = (dim: HeatmapDimensionMode): string => {
  switch (dim) {
    case 'dept_vs_iso': return 'iso27001';
    case 'dept_vs_mas': return 'mas_trm';
    case 'dept_vs_pims': return 'iso27701';
    case 'department_composite': return 'composite';
    case 'grid_tiles': return 'grid_tiles';
    case 'tri_dimensional':
    default:
      return 'all';
  }
};

export type MatrixViewMode = 'maturity' | 'score' | 'risk';

export interface MaturityTierInfo {
  tier: 1 | 2 | 3 | 4 | 5;
  label: string;
  shortLabel: string;
  badgeLabel: string;
  description: string;
  range: string;
  colorName: string;
  badgeClass: string;
  cellBgLight: string;
  cellBgDark: string;
  borderClass: string;
  textClass: string;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'MINIMAL';
}

export const MATURITY_TIERS: Record<number, MaturityTierInfo> = {
  1: {
    tier: 1,
    label: 'Level 1: Initial / Ad-hoc',
    shortLabel: 'L1 Initial',
    badgeLabel: 'L1 Initial',
    description: 'Ad-hoc, undocumented processes with critical non-compliance gaps and high exposure.',
    range: '0 - 39%',
    colorName: 'Rose/Red',
    badgeClass: 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/40',
    cellBgLight: 'bg-rose-50/90 text-rose-950 border-rose-300 hover:bg-rose-100 shadow-xs',
    cellBgDark: 'bg-rose-950/70 text-rose-200 border-rose-500/60 hover:bg-rose-900/80 shadow-rose-950/40',
    borderClass: 'border-rose-500',
    textClass: 'text-rose-600 dark:text-rose-400',
    riskLevel: 'CRITICAL'
  },
  2: {
    tier: 2,
    label: 'Level 2: Developing / Repeatable',
    shortLabel: 'L2 Developing',
    badgeLabel: 'L2 Developing',
    description: 'Partially documented controls; inconsistent evidence; significant compliance gaps.',
    range: '40 - 59%',
    colorName: 'Orange',
    badgeClass: 'bg-orange-500/20 text-orange-700 dark:text-orange-300 border border-orange-500/40',
    cellBgLight: 'bg-orange-50/90 text-orange-950 border-orange-300 hover:bg-orange-100 shadow-xs',
    cellBgDark: 'bg-orange-950/60 text-orange-200 border-orange-500/50 hover:bg-orange-900/75 shadow-orange-950/40',
    borderClass: 'border-orange-500',
    textClass: 'text-orange-600 dark:text-orange-400',
    riskLevel: 'HIGH'
  },
  3: {
    tier: 3,
    label: 'Level 3: Defined / Standardized',
    shortLabel: 'L3 Defined',
    badgeLabel: 'L3 Defined',
    description: 'Documented policies and formal controls across departments; moderate audit risk.',
    range: '60 - 74%',
    colorName: 'Amber',
    badgeClass: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40',
    cellBgLight: 'bg-amber-50/90 text-amber-950 border-amber-300 hover:bg-amber-100 shadow-xs',
    cellBgDark: 'bg-amber-950/50 text-amber-200 border-amber-500/40 hover:bg-amber-900/65 shadow-amber-950/40',
    borderClass: 'border-amber-500',
    textClass: 'text-amber-600 dark:text-amber-400',
    riskLevel: 'MEDIUM'
  },
  4: {
    tier: 4,
    label: 'Level 4: Managed & Measured',
    shortLabel: 'L4 Managed',
    badgeLabel: 'L4 Managed',
    description: 'Quantitatively monitored controls with telemetry validation; audit-ready state.',
    range: '75 - 89%',
    colorName: 'Emerald',
    badgeClass: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40',
    cellBgLight: 'bg-emerald-50/90 text-emerald-950 border-emerald-300 hover:bg-emerald-100 shadow-xs',
    cellBgDark: 'bg-emerald-950/50 text-emerald-200 border-emerald-500/40 hover:bg-emerald-900/65 shadow-emerald-950/40',
    borderClass: 'border-emerald-500',
    textClass: 'text-emerald-600 dark:text-emerald-400',
    riskLevel: 'LOW'
  },
  5: {
    tier: 5,
    label: 'Level 5: Optimized / Continuous',
    shortLabel: 'L5 Optimized',
    badgeLabel: 'L5 Optimized',
    description: 'Automated continuous assurance, self-healing controls, and proactive mitigation.',
    range: '90 - 100%',
    colorName: 'Indigo',
    badgeClass: 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/40',
    cellBgLight: 'bg-indigo-50/90 text-indigo-950 border-indigo-300 hover:bg-indigo-100 shadow-xs',
    cellBgDark: 'bg-indigo-950/60 text-indigo-200 border-indigo-500/50 hover:bg-indigo-900/75 shadow-indigo-950/40',
    borderClass: 'border-indigo-500',
    textClass: 'text-indigo-600 dark:text-indigo-400',
    riskLevel: 'MINIMAL'
  }
};

export const getCellMaturityTier = (score: number): MaturityTierInfo => {
  if (score >= 90) return MATURITY_TIERS[5];
  if (score >= 75) return MATURITY_TIERS[4];
  if (score >= 60) return MATURITY_TIERS[3];
  if (score >= 40) return MATURITY_TIERS[2];
  return MATURITY_TIERS[1];
};

// Representative columns for Unified Multi-Matrix view
const TRI_ISO_COLUMNS = [
  { code: 'Clause 4', shortTitle: 'Cl. 4 Context', title: 'Context of Organization & ISMS Scope' },
  { code: 'Clause 5', shortTitle: 'Cl. 5 Leadership', title: 'Leadership, Commitment & Policy' },
  { code: 'Clause 6', shortTitle: 'Cl. 6 Planning', title: 'Planning, Risk Assessment & Treatment' },
  { code: 'Clause 8', shortTitle: 'Cl. 8 Operations', title: 'Operation & Control Execution' },
  { code: 'Annex A.5', shortTitle: 'A.5 Org Controls', title: 'Organizational Controls' },
  { code: 'Annex A.6', shortTitle: 'A.6 People', title: 'People Controls' },
  { code: 'Annex A.8', shortTitle: 'A.8 Tech Controls', title: 'Technological Controls' }
];

const TRI_MAS_COLUMNS = [
  { code: 'DOM-03', shortTitle: '3.0 Governance', title: 'Technology Risk Governance' },
  { code: 'DOM-04', shortTitle: '4.0 Risk Framework', title: 'Technology Risk Management Framework' },
  { code: 'DOM-06', shortTitle: '6.0 Access Control', title: 'Access Control & Privileged Identity' },
  { code: 'DOM-08', shortTitle: '8.0 Cyber Threat', title: 'Cyber Threat Intelligence & Defense' },
  { code: 'DOM-10', shortTitle: '10.0 Incident Mgmt', title: 'IT Incident Management & Forensics' },
  { code: 'DOM-14', shortTitle: '14.0 Cloud/Outsourcing', title: 'Cloud Computing & Third-Party Outsourcing' }
];

/**
 * Layout spring physics transition for ComplianceHeatmap grid tiles using framer-motion.
 * Ensures that when filter states change, the grid tiles reposition themselves smoothly
 * rather than snapping to their new locations.
 */
export const heatmapTileLayoutTransition = {
  type: 'spring' as const,
  stiffness: 350,
  damping: 28,
  mass: 0.8
};

/**
 * Staggered animation entrance variants for ComplianceHeatmap grid tiles using framer-motion.
 * Defines initial, animate, and exit states that trigger a smooth opacity and scale transition.
 */
export const heatmapTileVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.8,
  },
  animate: (index: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 380,
      damping: 26,
      mass: 0.75,
      delay: Math.min((typeof index === 'number' ? index : 0) * 0.008, 0.25),
      opacity: {
        duration: 0.22,
        ease: 'easeOut',
      },
    },
  }),
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: {
      duration: 0.18,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export const heatmapGridContainerVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.012,
      delayChildren: 0.02,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.008,
      staggerDirection: -1,
    },
  },
};

export const ComplianceHeatmap: React.FC<ComplianceHeatmapProps> = ({
  onNavigateModule,
  initialDimension = 'tri_dimensional',
  initialFramework,
  initialDepartment,
  filterFramework,
  filterDepartment,
  initialControlFilter = 'ALL',
  onFrameworkChange,
  onDepartmentChange,
  onControlFilterChange,
  onSwitchViewMode,
  hideBreadcrumb = false
}) => {
  const { theme, logAuditEvent, setActiveModule } = useGRC();
  const { showToast } = useToast();

  const handleNavigate = (modId: string) => {
    if (modId === 'command_center' && onSwitchViewMode) {
      onSwitchViewMode('operational');
    }
    if (onNavigateModule) {
      onNavigateModule(modId);
    } else {
      setActiveModule(modId);
    }
  };

  // State
  const [controlFilterMode, setControlFilterMode] = useState<'ALL' | 'HIGH_RISK' | 'URGENT_REMEDIATION'>(
    initialControlFilter
  );

  useEffect(() => {
    if (initialControlFilter && initialControlFilter !== controlFilterMode) {
      setControlFilterMode(initialControlFilter);
    }
  }, [initialControlFilter]);
  const [dimensionMode, setDimensionMode] = useState<HeatmapDimensionMode>(() => {
    if (filterFramework) {
      const mapped = mapFrameworkToDimension(filterFramework);
      if (mapped) return mapped;
    }
    if (initialFramework) {
      const mapped = mapFrameworkToDimension(initialFramework);
      if (mapped) return mapped;
    }
    return initialDimension;
  });
  const [viewMode, setViewMode] = useState<MatrixViewMode>('maturity');
  const [cells, setCells] = useState<HeatmapCellData[]>(() => ComplianceHeatmapService.getAllCells());
  const [selectedCell, setSelectedCell] = useState<HeatmapCellData | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [detailViewMode, setDetailViewMode] = useState<'sidebar' | 'modal'>('modal');
  const [trendDisplayMode, setTrendDisplayMode] = useState<'both' | 'sparkline' | 'arrow'>('both');
  const [hoveredCell, setHoveredCell] = useState<{ deptId: string; targetCode: string } | null>(null);
  const [hoveredTooltip, setHoveredTooltip] = useState<{
    cell: HeatmapCellData;
    deptName: string;
    clientX: number;
    clientY: number;
  } | null>(null);

  // High-Risk & Maturity Controls
  const [spotlightHighRisk, setSpotlightHighRisk] = useState<boolean>(false);
  const [maturityTierFilter, setMaturityTierFilter] = useState<'ALL' | 1 | 2 | 3 | 4 | 5>('ALL');
  const [deptSortBy, setDeptSortBy] = useState<'lowest_maturity' | 'highest_maturity' | 'name' | 'open_findings'>('lowest_maturity');
  const [isHotspotsExpanded, setIsHotspotsExpanded] = useState<boolean>(true);

  // Hover detection helpers for row and column highlighting
  const isColHovered = (colCode: string) => hoveredCell?.targetCode === colCode;
  const isRowHovered = (deptId: string) => hoveredCell?.deptId === deptId;

  // Inherent Risk State
  const [isInherentRiskWeighted, setIsInherentRiskWeighted] = useState<boolean>(true);
  const [isRiskConfigModalOpen, setIsRiskConfigModalOpen] = useState<boolean>(false);
  const [inherentRisks, setInherentRisks] = useState<Record<string, ISOClauseInherentRisk>>(() =>
    ComplianceHeatmapService.getISOInherentRisks()
  );

  // Filters
  const [statusFilter, setStatusFilter] = useState<'ALL' | HeatmapStatus>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string>(() => {
    return filterDepartment || initialDepartment || 'ALL';
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isComplianceOverlayActive, setIsComplianceOverlayActive] = useState<boolean>(false);
  const [screenReaderAnnouncement, setScreenReaderAnnouncement] = useState<string>('');

  // Synchronize when filterFramework prop changes from parent
  useEffect(() => {
    if (filterFramework !== undefined) {
      const mapped = mapFrameworkToDimension(filterFramework);
      if (mapped && mapped !== dimensionMode) {
        setDimensionMode(mapped);
      }
    }
  }, [filterFramework]);

  // Synchronize when filterDepartment prop changes from parent
  useEffect(() => {
    if (filterDepartment !== undefined && filterDepartment !== departmentFilter) {
      setDepartmentFilter(filterDepartment);
    }
  }, [filterDepartment]);

  const handleDimensionChange = (newDim: HeatmapDimensionMode) => {
    setDimensionMode(newDim);
    onFrameworkChange?.(mapDimensionToFramework(newDim));
  };

  const handleDepartmentChange = (newDept: string) => {
    setDepartmentFilter(newDept);
    onDepartmentChange?.(newDept);
  };

  // Dynamic Risk Category Legend & Filtering State (Critical, High, Medium, Low)
  const [selectedRiskCategories, setSelectedRiskCategories] = useState<RiskSeverityLevel[]>([
    'CRITICAL',
    'HIGH',
    'MEDIUM',
    'LOW'
  ]);
  const [riskFilterDisplayMode, setRiskFilterDisplayMode] = useState<'dim' | 'hide'>('dim');

  // Unique composite filter state key that triggers staggered grid re-entrance whenever any filter updates
  const filterKey = useMemo(() => {
    return [
      dimensionMode,
      viewMode,
      maturityTierFilter,
      selectedRiskCategories.slice().sort().join(','),
      riskFilterDisplayMode,
      statusFilter,
      departmentFilter,
      searchQuery.trim().toLowerCase(),
      spotlightHighRisk ? 'spotlight' : 'normal',
      deptSortBy,
    ].join('|');
  }, [
    dimensionMode,
    viewMode,
    maturityTierFilter,
    selectedRiskCategories,
    riskFilterDisplayMode,
    statusFilter,
    departmentFilter,
    searchQuery,
    spotlightHighRisk,
    deptSortBy,
  ]);

  const handleToggleRiskCategory = (category: RiskSeverityLevel) => {
    setSelectedRiskCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  const handleSelectAllRiskCategories = () => {
    setSelectedRiskCategories(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']);
  };

  const handleIsolateRiskCategory = (category: RiskSeverityLevel) => {
    setSelectedRiskCategories([category]);
  };

  const handleSetRiskCategories = (categories: RiskSeverityLevel[]) => {
    setSelectedRiskCategories(categories);
  };

  // Check if any non-default filters or sorting are active
  const hasActiveFilters = useMemo(() => {
    return (
      maturityTierFilter !== 'ALL' ||
      selectedRiskCategories.length !== 4 ||
      statusFilter !== 'ALL' ||
      departmentFilter !== 'ALL' ||
      searchQuery.trim() !== '' ||
      spotlightHighRisk ||
      isComplianceOverlayActive ||
      deptSortBy !== 'lowest_maturity' ||
      riskFilterDisplayMode !== 'dim'
    );
  }, [
    maturityTierFilter,
    selectedRiskCategories,
    statusFilter,
    departmentFilter,
    searchQuery,
    spotlightHighRisk,
    isComplianceOverlayActive,
    deptSortBy,
    riskFilterDisplayMode
  ]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (maturityTierFilter !== 'ALL') count++;
    if (selectedRiskCategories.length !== 4) count++;
    if (statusFilter !== 'ALL') count++;
    if (departmentFilter !== 'ALL') count++;
    if (searchQuery.trim() !== '') count++;
    if (spotlightHighRisk) count++;
    if (isComplianceOverlayActive) count++;
    if (deptSortBy !== 'lowest_maturity') count++;
    if (riskFilterDisplayMode !== 'dim') count++;
    return count;
  }, [
    maturityTierFilter,
    selectedRiskCategories,
    statusFilter,
    departmentFilter,
    searchQuery,
    spotlightHighRisk,
    isComplianceOverlayActive,
    deptSortBy,
    riskFilterDisplayMode
  ]);

  // Reset all active filter states to default, triggering smooth transition back to full dataset view
  const handleClearFilters = () => {
    setMaturityTierFilter('ALL');
    setSelectedRiskCategories(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']);
    setStatusFilter('ALL');
    setDepartmentFilter('ALL');
    setDimensionMode('tri_dimensional');
    onFrameworkChange?.('all');
    onDepartmentChange?.('ALL');
    setSearchQuery('');
    setSpotlightHighRisk(false);
    setIsComplianceOverlayActive(false);
    setDeptSortBy('lowest_maturity');
    setRiskFilterDisplayMode('dim');
    setHoveredCell(null);
    setSelectedCell(null);

    showToast({
      title: 'Filters Cleared',
      message: 'All active filters reset. Showing full compliance heatmap dataset.',
      type: 'info'
    });
  };

  // Department Risk Concentration breakdown
  const departmentRiskConcentration = useMemo(() => {
    return HEATMAP_DEPARTMENTS.map(dept => {
      const deptCells = cells.filter(c => c.departmentId === dept.id);
      const totalCells = deptCells.length || 1;
      const nonCompliant = deptCells.filter(c => c.status === 'NON_COMPLIANT' || c.score < 50).length;
      const inProgress = deptCells.filter(c => c.status === 'IN_PROGRESS' && c.score >= 50 && c.score < 85).length;
      const compliant = deptCells.filter(c => c.status === 'COMPLIANT' && c.score >= 85).length;
      const avgScore = Math.round(deptCells.reduce((sum, c) => sum + c.score, 0) / totalCells);
      const openFindings = deptCells.reduce((sum, c) => sum + (c.openFindingsCount || 0), 0);
      const openRisks = deptCells.reduce((sum, c) => sum + (c.openRisksCount || 0), 0);

      // Raw risk calculation
      const rawRiskIndex =
        nonCompliant * 4 +
        inProgress * 1.5 +
        openFindings * 1.2 +
        (dept.criticalSystemsCount || 1) * 1.5;
      const normalizedRiskScore = Math.min(98, Math.max(12, Math.round(rawRiskIndex * 2.2)));

      let riskTier: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
      if (avgScore < 60 || nonCompliant >= 4) {
        riskTier = 'CRITICAL';
      } else if (avgScore < 75 || nonCompliant >= 2) {
        riskTier = 'HIGH';
      } else if (avgScore < 88) {
        riskTier = 'MEDIUM';
      } else {
        riskTier = 'LOW';
      }

      const avgTier = getCellMaturityTier(avgScore);

      // Compute department aggregate historical scores across 5 audit cycles
      const historicalScores = [0, 1, 2, 3, 4].map(idx => {
        const cycleScores = deptCells.map(c => c.historicalScores?.[idx] ?? c.score);
        return Math.round(cycleScores.reduce((sum, s) => sum + s, 0) / (cycleScores.length || 1));
      });
      const previousAvg = historicalScores[3] ?? avgScore;
      const scoreDelta = avgScore - previousAvg;
      const trend: 'UP' | 'DOWN' | 'STABLE' = scoreDelta > 0 ? 'UP' : scoreDelta < 0 ? 'DOWN' : 'STABLE';

      return {
        ...dept,
        avgScore,
        avgMaturityTier: avgTier,
        nonCompliant,
        inProgress,
        compliant,
        openFindings,
        openRisks,
        riskTier,
        riskConcentrationScore: normalizedRiskScore,
        historicalScores,
        scoreDelta,
        trend
      };
    });
  }, [cells]);

  // Sorted Departments based on user preference
  const sortedDepartments = useMemo(() => {
    const list = [...HEATMAP_DEPARTMENTS];
    return list.sort((a, b) => {
      const aData = departmentRiskConcentration.find(d => d.id === a.id);
      const bData = departmentRiskConcentration.find(d => d.id === b.id);
      if (!aData || !bData) return 0;
      if (deptSortBy === 'lowest_maturity') {
        return aData.avgScore - bData.avgScore; // Lowest score first = highest risk
      }
      if (deptSortBy === 'highest_maturity') {
        return bData.avgScore - aData.avgScore; // Highest first
      }
      if (deptSortBy === 'open_findings') {
        return bData.openFindings - aData.openFindings;
      }
      return a.name.localeCompare(b.name);
    });
  }, [departmentRiskConcentration, deptSortBy]);

  // Overall metrics
  const metrics = useMemo(() => {
    const relevantCells =
      dimensionMode === 'dept_vs_iso'
        ? cells.filter(c => c.dimensionType === 'ISO_27001')
        : dimensionMode === 'dept_vs_mas'
        ? cells.filter(c => c.dimensionType === 'MAS_TRM')
        : dimensionMode === 'dept_vs_pims'
        ? cells.filter(c => c.dimensionType === 'ISO_27701')
        : cells;
    return ComplianceHeatmapService.calculateMetrics(relevantCells);
  }, [cells, dimensionMode]);

  // Maturity distribution metrics
  const maturityDistribution = useMemo(() => {
    const relevantCells = cells;
    const total = relevantCells.length || 1;
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let scoreSum = 0;
    relevantCells.forEach(c => {
      const tier = getCellMaturityTier(c.score).tier;
      counts[tier] = (counts[tier] || 0) + 1;
      scoreSum += c.score;
    });
    const avgScore = Math.round(scoreSum / total);
    const avgMaturity = (
      Object.entries(counts).reduce((acc, [tier, cnt]) => acc + Number(tier) * cnt, 0) / total
    ).toFixed(1);

    return {
      total,
      counts,
      avgScore,
      avgMaturity,
      l1Pct: Math.round((counts[1] / total) * 100),
      l2Pct: Math.round((counts[2] / total) * 100),
      l3Pct: Math.round((counts[3] / total) * 100),
      l4Pct: Math.round((counts[4] / total) * 100),
      l5Pct: Math.round((counts[5] / total) * 100)
    };
  }, [cells]);

  // Priority Non-Compliance Escalation Hotspots (Critical Level 1 & Level 2 Areas)
  const priorityNonComplianceHotspots = useMemo(() => {
    return cells
      .filter(c => c.status === 'NON_COMPLIANT' || c.score < 60)
      .map(c => {
        const tier = getCellMaturityTier(c.score);
        const ncReason =
          c.keyControls?.find(k => k.status === 'NON_COMPLIANT')?.nonComplianceReason ||
          (c.score < 40
            ? 'Critical operational gap: mandatory controls missing audit-grade verification evidence.'
            : 'Developing maturity: partial controls implemented without automated audit telemetry.');
        return {
          cell: c,
          tier,
          score: c.score,
          deptName: c.departmentName,
          targetCode: c.targetCode,
          targetTitle: c.targetTitle,
          findingsCount: c.openFindingsCount || c.topFindings?.length || 1,
          lead: c.controlOwner || 'Assigned Lead',
          ncReason
        };
      })
      .sort((a, b) => a.score - b.score)
      .slice(0, 4);
  }, [cells]);

  // Dynamic Risk Category distribution metrics
  const riskDistribution = useMemo<RiskCategoryDistribution>(() => {
    const relevantCells =
      dimensionMode === 'dept_vs_iso'
        ? cells.filter(c => c.dimensionType === 'ISO_27001')
        : dimensionMode === 'dept_vs_mas'
        ? cells.filter(c => c.dimensionType === 'MAS_TRM')
        : dimensionMode === 'dept_vs_pims'
        ? cells.filter(c => c.dimensionType === 'ISO_27701')
        : cells;

    const total = relevantCells.length || 1;
    const counts: Record<RiskSeverityLevel, number> = {
      CRITICAL: 0,
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0
    };
    const openFindings: Record<RiskSeverityLevel, number> = {
      CRITICAL: 0,
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0
    };
    const scoreSums: Record<RiskSeverityLevel, number> = {
      CRITICAL: 0,
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0
    };

    relevantCells.forEach(cell => {
      const level: RiskSeverityLevel = cell.riskLevel || 'MEDIUM';
      counts[level] = (counts[level] || 0) + 1;
      openFindings[level] =
        (openFindings[level] || 0) + (cell.openFindingsCount || cell.topFindings?.length || 0);
      scoreSums[level] = (scoreSums[level] || 0) + cell.score;
    });

    const percentages: Record<RiskSeverityLevel, number> = {
      CRITICAL: Math.round(((counts.CRITICAL || 0) / total) * 100),
      HIGH: Math.round(((counts.HIGH || 0) / total) * 100),
      MEDIUM: Math.round(((counts.MEDIUM || 0) / total) * 100),
      LOW: Math.round(((counts.LOW || 0) / total) * 100)
    };

    const avgScores: Record<RiskSeverityLevel, number> = {
      CRITICAL: counts.CRITICAL ? Math.round(scoreSums.CRITICAL / counts.CRITICAL) : 0,
      HIGH: counts.HIGH ? Math.round(scoreSums.HIGH / counts.HIGH) : 0,
      MEDIUM: counts.MEDIUM ? Math.round(scoreSums.MEDIUM / counts.MEDIUM) : 0,
      LOW: counts.LOW ? Math.round(scoreSums.LOW / counts.LOW) : 0
    };

    return {
      total,
      counts,
      percentages,
      openFindings,
      avgScores
    };
  }, [cells, dimensionMode]);

  // Filtered cells based on criteria
  const activeCells = useMemo(() => {
    let list = cells;
    if (dimensionMode === 'dept_vs_iso') {
      list = cells.filter(c => c.dimensionType === 'ISO_27001');
    } else if (dimensionMode === 'dept_vs_mas') {
      list = cells.filter(c => c.dimensionType === 'MAS_TRM');
    } else if (dimensionMode === 'dept_vs_pims') {
      list = cells.filter(c => c.dimensionType === 'ISO_27701');
    }

    if (departmentFilter !== 'ALL') {
      list = list.filter(c => c.departmentId === departmentFilter);
    }

    if (statusFilter !== 'ALL') {
      list = list.filter(c => c.status === statusFilter);
    }

    if (maturityTierFilter !== 'ALL') {
      list = list.filter(c => getCellMaturityTier(c.score).tier === maturityTierFilter);
    }

    if (selectedRiskCategories.length < 4) {
      list = list.filter(c => selectedRiskCategories.includes(c.riskLevel));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        c =>
          c.departmentName.toLowerCase().includes(q) ||
          c.targetCode.toLowerCase().includes(q) ||
          c.targetTitle.toLowerCase().includes(q)
      );
    }

    if (deptSortBy === 'lowest_maturity') {
      return [...list].sort((a, b) => a.score - b.score);
    } else if (deptSortBy === 'highest_maturity') {
      return [...list].sort((a, b) => b.score - a.score);
    } else if (deptSortBy === 'open_findings') {
      return [...list].sort((a, b) => (b.openFindingsCount || 0) - (a.openFindingsCount || 0));
    } else if (deptSortBy === 'name') {
      return [...list].sort((a, b) => a.departmentName.localeCompare(b.departmentName) || a.targetCode.localeCompare(b.targetCode));
    }

    return list;
  }, [cells, dimensionMode, departmentFilter, statusFilter, maturityTierFilter, selectedRiskCategories, searchQuery, deptSortBy]);

  // Handle cell click: opens detail modal displaying detailed history and specific evidence logs
  const handleCellClick = (cell: HeatmapCellData) => {
    setSelectedCell(cell);
    setIsDetailModalOpen(true);
    logAuditEvent(
      'ACCESS',
      'Compliance Heatmap',
      `Inspected compliance maturity node ${cell.departmentName} × ${cell.targetCode} (Maturity ${getCellMaturityTier(cell.score).shortLabel}, ${cell.score}% ${cell.status}) in forensic inspection modal.`
    );
  };

  // Open full modal from sidebar
  const handleOpenModalFromSidebar = (cell: HeatmapCellData) => {
    setIsSidebarOpen(false);
    setSelectedCell(cell);
    setIsDetailModalOpen(true);
  };

  // Handle cell updated
  const handleCellUpdated = (updated: HeatmapCellData) => {
    setCells(prev => prev.map(c => (c.id === updated.id ? updated : c)));
    setScreenReaderAnnouncement(
      `Status updated for Control ${updated.targetCode} in ${updated.departmentName}: now ${updated.status.replace(/_/g, ' ')} with ${updated.score}% adherence.`
    );
  };

  // Export CSV
  const handleExportCSV = () => {
    const title =
      dimensionMode === 'dept_vs_iso'
        ? 'ISO 27001 Clause'
        : dimensionMode === 'dept_vs_pims'
        ? 'ISO 27701 PIMS Clause'
        : 'MAS TRM Module';
    const csv = ComplianceHeatmapService.exportToCSV(activeCells, title);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Skanda_Compliance_Maturity_Heatmap_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast({
      title: 'Matrix Exported',
      message: 'Departmental regulatory maturity and risk concentration matrix exported to CSV',
      type: 'success'
    });
  };

  // Reset baseline
  const handleResetBaseline = () => {
    if (safeConfirm('Reset all compliance heatmap cell scores and statuses back to baseline?')) {
      const reset = ComplianceHeatmapService.resetBaseline();
      setCells(reset);
      showToast({
        title: 'Baseline Reset',
        message: 'Compliance heatmap returned to initial baseline',
        type: 'info'
      });
    }
  };

  // Cell Color & Visual Intensity
  const getCellBgClass = (score: number, status: HeatmapStatus, targetCode?: string) => {
    const tier = getCellMaturityTier(score);
    if (!targetCode || !isInherentRiskWeighted) {
      if (status === 'NOT_APPLICABLE') {
        return theme === 'light'
          ? 'bg-slate-100 text-slate-400 border-slate-200'
          : 'bg-slate-900/40 text-slate-500 border-slate-800';
      }
      return theme === 'light' ? tier.cellBgLight : tier.cellBgDark;
    }

    const intensity = ComplianceHeatmapService.calculateInherentRiskIntensity(
      score,
      status,
      targetCode,
      isInherentRiskWeighted,
      theme
    );
    return intensity.bgClass;
  };

  // Cell display data (supports raw risk vs compliance maturity overlay)
  const getCellDisplayData = (cell: HeatmapCellData) => {
    const effectiveTheme: 'light' | 'dark' = theme === 'light' ? 'light' : 'dark';
    const tier = getCellMaturityTier(cell.score);
    if (!isComplianceOverlayActive) {
      const label = cell.status.replace('_', ' ');
      return {
        score: cell.score,
        tier,
        bgClass: getCellBgClass(cell.score, cell.status, cell.targetCode),
        subLabel: label,
        statusLabel: label,
        tooltip: `${cell.departmentName} - ${cell.targetCode}: ${tier.label} (${cell.score}%) • ${label}`,
        isOverlay: false,
        variance: 0,
        domainBenchmark: 0
      };
    }
    const overlay = ComplianceOverlayService.calculateOverlayScore(cell, effectiveTheme);
    const overlayTier = getCellMaturityTier(overlay.maturityScore);
    return {
      score: overlay.maturityScore,
      tier: overlayTier,
      bgClass: overlay.bgClass,
      subLabel: overlay.maturityLevel,
      statusLabel: overlay.maturityLevel,
      tooltip: `Compliance Maturity: ${overlay.maturityScore}% (${overlay.maturityLevel}) vs Raw Risk: ${cell.score}% [Benchmark: ${overlay.domainBenchmark}%]`,
      isOverlay: true,
      variance: overlay.variance,
      domainBenchmark: overlay.domainBenchmark
    };
  };

  // Trend Arrow rendering
  const renderCellTrendArrow = (cell: HeatmapCellData) => {
    const trend =
      cell.trend ||
      (cell.scoreDelta && cell.scoreDelta > 0
        ? 'UP'
        : cell.scoreDelta && cell.scoreDelta < 0
        ? 'DOWN'
        : 'STABLE');
    const delta = cell.scoreDelta ?? (cell.previousScore !== undefined ? cell.score - cell.previousScore : 0);

    if (trend === 'UP') {
      return (
        <span
          className="inline-flex items-center text-emerald-500 font-bold shrink-0"
          title={`Improved +${Math.abs(delta)}% from prior audit`}
        >
          <ArrowUp className="w-2.5 h-2.5 stroke-[3]" />
        </span>
      );
    } else if (trend === 'DOWN') {
      return (
        <span
          className="inline-flex items-center text-rose-500 font-bold shrink-0"
          title={`Regressed -${Math.abs(delta)}% from prior audit`}
        >
          <ArrowDown className="w-2.5 h-2.5 stroke-[3]" />
        </span>
      );
    }
    return (
      <span className="inline-flex items-center text-slate-400 opacity-60 shrink-0" title="Stable score">
        <Minus className="w-2.5 h-2.5 stroke-[2.5]" />
      </span>
    );
  };

  // Cell Content Renderer based on active View Mode
  const renderCellContent = (cell: HeatmapCellData, cellDisplay: ReturnType<typeof getCellDisplayData>, isHighRisk: boolean) => {
    const showSparkline = trendDisplayMode === 'both' || trendDisplayMode === 'sparkline';
    const showArrow = trendDisplayMode === 'both' || trendDisplayMode === 'arrow';

    if (viewMode === 'maturity') {
      return (
        <div className="flex flex-col items-center justify-center space-y-0.5 w-full">
          <div className="flex items-center space-x-1">
            <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-extrabold ${cellDisplay.tier.badgeClass}`}>
              {cellDisplay.tier.shortLabel}
            </span>
            <MaturitySparkline
              scores={cell.historicalScores}
              currentScore={cell.score}
              previousScore={cell.previousScore}
              scoreDelta={cell.scoreDelta}
              trend={cell.trend}
              showSparkline={showSparkline}
              showArrow={showArrow}
              size="xs"
            />
          </div>
          <div className="flex items-center space-x-1 text-[10px] font-mono font-semibold">
            <span>{cellDisplay.score}%</span>
            {isHighRisk && (
              <span className="text-rose-500 font-bold" title="High Risk Non-Compliance Area">
                ⚠️
              </span>
            )}
          </div>
        </div>
      );
    }

    if (viewMode === 'score') {
      return (
        <div className="flex flex-col items-center justify-center space-y-0.5 w-full">
          <div className="flex items-center space-x-1">
            <span className="font-mono text-xs sm:text-sm font-extrabold">{cellDisplay.score}%</span>
            <MaturitySparkline
              scores={cell.historicalScores}
              currentScore={cell.score}
              previousScore={cell.previousScore}
              scoreDelta={cell.scoreDelta}
              trend={cell.trend}
              showSparkline={showSparkline}
              showArrow={showArrow}
              size="xs"
            />
          </div>
          <span className="text-[8px] sm:text-[9px] font-normal uppercase tracking-wider opacity-85 truncate max-w-full">
            {cellDisplay.statusLabel}
          </span>
        </div>
      );
    }

    // Residual Risk Mode
    return (
      <div className="flex flex-col items-center justify-center space-y-0.5 w-full">
        <div className="flex items-center space-x-1">
          <span
            className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
              cell.riskLevel === 'CRITICAL'
                ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30'
                : cell.riskLevel === 'HIGH'
                ? 'bg-orange-500/20 text-orange-500 border border-orange-500/30'
                : cell.riskLevel === 'MEDIUM'
                ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
            }`}
          >
            {cell.riskLevel}
          </span>
          <MaturitySparkline
            scores={cell.historicalScores}
            currentScore={cell.score}
            previousScore={cell.previousScore}
            scoreDelta={cell.scoreDelta}
            trend={cell.trend}
            showSparkline={showSparkline}
            showArrow={showArrow}
            size="xs"
          />
        </div>
        <span className="font-mono text-[9px] opacity-80">{cellDisplay.score}% score</span>
      </div>
    );
  };

  // Unified helper to evaluate cell spotlight & dimming states based on Spotlight High-Risk, CMMI Maturity Tier, and Risk Category filters
  const checkCellSpotlightState = (cell: HeatmapCellData) => {
    const isHighRisk = cell.score < 60 || cell.status === 'NON_COMPLIANT';
    const cellTier = getCellMaturityTier(cell.score).tier;
    const isTierMatch = maturityTierFilter === 'ALL' || cellTier === maturityTierFilter;
    const isRiskCategoryMatch = selectedRiskCategories.includes(cell.riskLevel);

    const isDimmed =
      (spotlightHighRisk && !isHighRisk) ||
      (maturityTierFilter !== 'ALL' && !isTierMatch) ||
      !isRiskCategoryMatch;

    const isSpotlighted =
      (spotlightHighRisk && isHighRisk) ||
      (maturityTierFilter !== 'ALL' && isTierMatch) ||
      (selectedRiskCategories.length === 1 && isRiskCategoryMatch);

    let spotlightRingClass = '';
    if (isSpotlighted) {
      if (spotlightHighRisk && isHighRisk) {
        spotlightRingClass =
          'ring-2 ring-rose-500 ring-offset-1 dark:ring-offset-slate-900 shadow-lg shadow-rose-500/40 animate-pulse scale-105 z-20';
      } else if (selectedRiskCategories.length === 1 && isRiskCategoryMatch) {
        switch (cell.riskLevel) {
          case 'CRITICAL':
            spotlightRingClass =
              'ring-2 ring-rose-500 ring-offset-1 dark:ring-offset-slate-900 shadow-lg shadow-rose-500/40 scale-105 z-20';
            break;
          case 'HIGH':
            spotlightRingClass =
              'ring-2 ring-orange-500 ring-offset-1 dark:ring-offset-slate-900 shadow-lg shadow-orange-500/40 scale-105 z-20';
            break;
          case 'MEDIUM':
            spotlightRingClass =
              'ring-2 ring-amber-500 ring-offset-1 dark:ring-offset-slate-900 shadow-lg shadow-amber-500/40 scale-105 z-20';
            break;
          case 'LOW':
            spotlightRingClass =
              'ring-2 ring-emerald-500 ring-offset-1 dark:ring-offset-slate-900 shadow-lg shadow-emerald-500/40 scale-105 z-20';
            break;
        }
      } else if (maturityTierFilter !== 'ALL') {
        switch (cellTier) {
          case 1:
            spotlightRingClass =
              'ring-2 ring-rose-500 ring-offset-1 dark:ring-offset-slate-900 shadow-lg shadow-rose-500/40 scale-105 z-20';
            break;
          case 2:
            spotlightRingClass =
              'ring-2 ring-orange-500 ring-offset-1 dark:ring-offset-slate-900 shadow-lg shadow-orange-500/40 scale-105 z-20';
            break;
          case 3:
            spotlightRingClass =
              'ring-2 ring-amber-500 ring-offset-1 dark:ring-offset-slate-900 shadow-lg shadow-amber-500/40 scale-105 z-20';
            break;
          case 4:
            spotlightRingClass =
              'ring-2 ring-emerald-500 ring-offset-1 dark:ring-offset-slate-900 shadow-lg shadow-emerald-500/40 scale-105 z-20';
            break;
          case 5:
            spotlightRingClass =
              'ring-2 ring-indigo-500 ring-offset-1 dark:ring-offset-slate-900 shadow-lg shadow-indigo-500/40 scale-105 z-20';
            break;
          default:
            spotlightRingClass =
              'ring-2 ring-indigo-500 ring-offset-1 dark:ring-offset-slate-900 shadow-lg scale-105 z-20';
        }
      }
    }

    return { isHighRisk, isDimmed, isSpotlighted, spotlightRingClass, cellTier, isRiskCategoryMatch };
  };

  // Matrix cell renderer supporting spotlighting, risk category dimming/hiding, hover navigation, and staggered filter entrance
  const renderHeatmapMatrixCell = (
    cell: HeatmapCellData,
    colKey: string,
    isRowActive: boolean,
    isColActive: boolean,
    deptId: string,
    staggerIndex: number = 0
  ) => {
    const cellDisplay = getCellDisplayData(cell);
    const { isHighRisk, isDimmed, isSpotlighted, spotlightRingClass, isRiskCategoryMatch } =
      checkCellSpotlightState(cell);
    const isHovered = hoveredCell?.deptId === deptId && hoveredCell?.targetCode === cell.targetCode;
    const isInSameRow = isRowActive && !isHovered;
    const isInSameCol = isColActive && !isHovered;

    // When risk display mode is 'hide' and the category is not active, render an interactive placeholder slot
    if (riskFilterDisplayMode === 'hide' && !isRiskCategoryMatch) {
      return (
        <td key={colKey} className="py-3 px-4 text-center align-middle relative overflow-visible">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={`hidden-${cell.id}`}
              layout
              variants={heatmapTileVariants}
              custom={staggerIndex}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{
                layout: heatmapTileLayoutTransition,
                opacity: { duration: 0.2 },
                scale: { duration: 0.2 }
              }}
              onClick={() => handleCellClick(cell)}
              onMouseEnter={(e: React.MouseEvent) => {
                setHoveredCell({ deptId, targetCode: cell.targetCode });
                const deptObj = HEATMAP_DEPARTMENTS.find(d => d.id === deptId);
                setHoveredTooltip({
                  cell,
                  deptName: cell.departmentName || deptObj?.name || deptId,
                  clientX: e.clientX,
                  clientY: e.clientY
                });
              }}
              onMouseMove={(e: React.MouseEvent) => {
                setHoveredTooltip(prev => prev ? { ...prev, clientX: e.clientX, clientY: e.clientY } : null);
              }}
              onMouseLeave={() => {
                setHoveredCell(null);
                setHoveredTooltip(null);
              }}
              className={`w-full py-2 px-1.5 rounded-xl border border-dashed text-xs flex flex-col items-center justify-center space-y-0.5 hover:opacity-85 transition-all cursor-pointer ${
                theme === 'light'
                  ? 'bg-slate-100/60 border-slate-300 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700'
                  : 'bg-slate-900/40 border-slate-800 text-slate-500 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
              title={`Hidden category: ${cell.riskLevel} (${cellDisplay.score}%). Click to re-enable ${cell.riskLevel} in heatmap.`}
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span className="text-[9px] font-mono font-bold uppercase">{cell.riskLevel.slice(0, 4)}</span>
            </motion.div>
          </AnimatePresence>
        </td>
      );
    }

    return (
      <td key={colKey} className="py-3 px-4 text-center align-middle relative overflow-visible">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.button
            key={`tile-${cell.id}`}
            layout
            variants={heatmapTileVariants}
            custom={staggerIndex}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{
              layout: heatmapTileLayoutTransition,
              opacity: { duration: 0.2 },
              scale: { duration: 0.2 }
            }}
            onClick={() => handleCellClick(cell)}
            onMouseEnter={(e: React.MouseEvent) => {
              setHoveredCell({ deptId, targetCode: cell.targetCode });
              const deptObj = HEATMAP_DEPARTMENTS.find(d => d.id === deptId);
              setHoveredTooltip({
                cell,
                deptName: cell.departmentName || deptObj?.name || deptId,
                clientX: e.clientX,
                clientY: e.clientY
              });
            }}
            onMouseMove={(e: React.MouseEvent) => {
              setHoveredTooltip(prev => prev ? { ...prev, clientX: e.clientX, clientY: e.clientY } : null);
            }}
            onMouseLeave={() => {
              setHoveredCell(null);
              setHoveredTooltip(null);
            }}
            whileHover={{
              scale: 1.07,
              y: -2,
              transition: { type: 'spring', stiffness: 450, damping: 25 }
            }}
            whileTap={{
              scale: 0.96,
              transition: { type: 'spring', stiffness: 500, damping: 20 }
            }}
            aria-label={`Control ${cell.targetCode}: ${cell.targetTitle}, Department: ${cell.departmentName}, Adherence: ${cellDisplay.score}%, Status: ${cell.status.replace(/_/g, ' ')}, Risk: ${cell.riskLevel}`}
            className={`w-full py-2 px-1.5 rounded-xl border text-xs font-bold transition-all duration-300 ease-out cursor-pointer flex flex-col items-center justify-center space-y-0.5 relative ${cellDisplay.bgClass} ${
              isSpotlighted
                ? spotlightRingClass
                : !isRiskCategoryMatch
                ? 'opacity-20 grayscale brightness-75 contrast-50 hover:opacity-100 hover:grayscale-0 hover:brightness-100 hover:contrast-100 border-dashed'
                : isDimmed
                ? 'opacity-35 contrast-75 hover:opacity-100 hover:contrast-100'
                : isHovered
                ? 'z-30 shadow-xl ring-2 ring-indigo-500 dark:ring-indigo-400 brightness-110'
                : isInSameRow || isInSameCol
                ? 'ring-1 ring-indigo-400/30 dark:ring-indigo-500/30'
                : ''
            }`}
            title={
              !isRiskCategoryMatch
                ? `[Filtered Category: ${cell.riskLevel}] • ` + cellDisplay.tooltip
                : cellDisplay.tooltip
            }
          >
            {renderCellContent(cell, cellDisplay, isHighRisk)}
          </motion.button>
        </AnimatePresence>
      </td>
    );
  };

  return (
    <div id="compliance-heatmap-module" className="compliance-heatmap space-y-6 animate-in fade-in duration-200 w-full max-w-full pb-12">
      {/* 1. Breadcrumb & Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {!hideBreadcrumb ? (
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <button
              onClick={() => handleNavigate('command_center')}
              className={`hover:underline flex items-center space-x-1 cursor-pointer ${
                theme === 'light' ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              <span>Command Center</span>
            </button>
            <span>/</span>
            <span className="text-slate-500">Risk & Governance</span>
            <span>/</span>
            <span className={`font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
              Compliance Heatmap
            </span>
          </div>
        ) : (
          <div className="flex items-center space-x-2 text-xs">
            <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
              HEATMAP ENGINE
            </span>
            <span className="text-slate-400 text-xs">
              {dimensionMode === 'dept_vs_iso'
                ? 'ISO/IEC 27001:2022 ISMS Controls'
                : dimensionMode === 'dept_vs_mas'
                ? 'MAS TRM Guidelines 2021 Singapore'
                : dimensionMode === 'dept_vs_pims'
                ? 'ISO/IEC 27701:2019 Privacy (PIMS)'
                : dimensionMode === 'department_composite'
                ? 'Departmental Composite Scorecard'
                : dimensionMode === 'grid_tiles'
                ? 'Interactive Grid Matrix'
                : 'Unified Cross-Framework (ISO 27001 + MAS TRM)'}
            </span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {/* Controls Risk & Urgency Filter Dropdown */}
          <div className="flex items-center space-x-1.5 border border-slate-200 dark:border-slate-800 rounded-xl p-0.5 bg-slate-100/70 dark:bg-slate-900/70 text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-2 pr-0.5 flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-amber-500" />
              <span>Controls:</span>
            </span>
            <select
              id="compliance-heatmap-header-control-filter"
              value={controlFilterMode}
              onChange={e => {
                const val = e.target.value as 'ALL' | 'HIGH_RISK' | 'URGENT_REMEDIATION';
                setControlFilterMode(val);
                onControlFilterChange?.(val);
                if (val === 'HIGH_RISK') {
                  setSpotlightHighRisk(true);
                } else if (val === 'URGENT_REMEDIATION') {
                  setSpotlightHighRisk(true);
                  setStatusFilter('NON_COMPLIANT');
                } else {
                  setSpotlightHighRisk(false);
                  setStatusFilter('ALL');
                }
              }}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-0 outline-none shadow-xs cursor-pointer"
              title="Toggle between viewing all controls or only those marked 'High Risk' or 'Requires Urgent Remediation'"
            >
              <option value="ALL">All Controls</option>
              <option value="HIGH_RISK">High Risk</option>
              <option value="URGENT_REMEDIATION">Requires Urgent Remediation</option>
            </select>
          </div>

          {/* Inspection View Mode Selector */}
          <div className="flex items-center space-x-1 border border-slate-200 dark:border-slate-800 rounded-xl p-0.5 bg-slate-100/70 dark:bg-slate-900/70 text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-2 pr-1 hidden sm:inline">
              Detail View:
            </span>
            <button
              onClick={() => setDetailViewMode('sidebar')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center space-x-1 ${
                detailViewMode === 'sidebar'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Clicking CMMI cells opens right sidebar detail view with underlying controls"
            >
              <PanelRight className="w-3.5 h-3.5" />
              <span>Sidebar</span>
            </button>
            <button
              onClick={() => setDetailViewMode('modal')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center space-x-1 ${
                detailViewMode === 'modal'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Clicking CMMI cells opens centered forensic inspection modal"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Modal</span>
            </button>
          </div>

          {/* Trend Display Mode Selector */}
          <div className="flex items-center space-x-1 border border-slate-200 dark:border-slate-800 rounded-xl p-0.5 bg-slate-100/70 dark:bg-slate-900/70 text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-2 pr-1 hidden sm:inline">
              Trends:
            </span>
            <button
              onClick={() => setTrendDisplayMode('both')}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center space-x-1 ${
                trendDisplayMode === 'both'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Display both micro sparkline charts and trend arrows next to CMMI maturity scores"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Both</span>
            </button>
            <button
              onClick={() => setTrendDisplayMode('sparkline')}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center space-x-1 ${
                trendDisplayMode === 'sparkline'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Display micro sparkline charts only next to CMMI maturity scores"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Sparkline</span>
            </button>
            <button
              onClick={() => setTrendDisplayMode('arrow')}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center space-x-1 ${
                trendDisplayMode === 'arrow'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Display directional trend arrows only next to CMMI maturity scores"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span>Arrow</span>
            </button>
          </div>

          <button
            onClick={() => setIsRiskConfigModalOpen(true)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
              theme === 'light'
                ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 shadow-xs'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
            }`}
            title="Configure Inherent Risk multipliers and threat weighting"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-500" />
            <span>Threat Weights</span>
          </button>

          <button
            onClick={handleExportCSV}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
              theme === 'light'
                ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 shadow-xs'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
            }`}
            title="Export full matrix to CSV"
          >
            <Download className="w-3.5 h-3.5 text-indigo-500" />
            <span>Export CSV</span>
          </button>

          {/* Clear Filters Button */}
          <button
            onClick={handleClearFilters}
            className={`compliance-heatmap-clear-filters-btn px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
              hasActiveFilters
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-700 shadow-sm ring-2 ring-indigo-500/30 font-bold'
                : theme === 'light'
                ? 'bg-white hover:bg-slate-50 text-slate-600 border-slate-300 shadow-xs'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
            }`}
            title="Reset all active filter states to default and smoothly return to full dataset view"
            id="btn-clear-heatmap-filters"
            data-testid="compliance-heatmap-clear-filters"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${hasActiveFilters ? 'text-white' : 'text-slate-400'}`} />
            <span>Clear Filters</span>
            {hasActiveFilters && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-white/25 text-white">
                {activeFiltersCount}
              </span>
            )}
          </button>

          <button
            onClick={handleResetBaseline}
            className={`p-1.5 rounded-xl border text-slate-400 hover:text-slate-200 transition-all cursor-pointer ${
              theme === 'light' ? 'border-slate-300 bg-white hover:bg-slate-100' : 'border-slate-800 bg-slate-900'
            }`}
            title="Reset to initial baseline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Hero Header with Control Maturity & Risk Concentration Overview */}
      <div className={`p-6 rounded-2xl border shadow-xl relative overflow-hidden transition-colors ${
        theme === 'light'
          ? 'bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/20 border-slate-200 shadow-slate-200/50'
          : 'bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border-slate-800'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center space-x-2.5 flex-wrap gap-y-2">
              <span className={`p-2 rounded-xl border ${
                theme === 'light'
                  ? 'bg-indigo-100 text-indigo-700 border-indigo-200'
                  : 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
              }`}>
                <Grid className="w-5 h-5" />
              </span>
              <h1 className={`text-xl sm:text-2xl font-extrabold tracking-tight ${
                theme === 'light' ? 'text-slate-900' : 'text-white'
              }`}>
                Departmental Regulatory Control Maturity &amp; Risk Heatmap
              </h1>
              <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                theme === 'light'
                  ? 'bg-indigo-100 text-indigo-800 border-indigo-200'
                  : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
              }`}>
                CMMI Levels 1-5 Matrix
              </span>
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  id="btn-header-hero-clear-filters"
                  data-testid="compliance-heatmap-hero-clear-filters"
                  className="compliance-heatmap-clear-filters-btn inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/30 ring-2 ring-indigo-400/40 transition-all cursor-pointer animate-in fade-in"
                  title="Clear all active filters and smoothly return to full dataset view"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-white" />
                  <span>Clear Filters</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white">
                    {activeFiltersCount}
                  </span>
                </button>
              )}
            </div>
            <p className={`text-xs sm:text-sm leading-relaxed ${
              theme === 'light' ? 'text-slate-600' : 'text-slate-400'
            }`}>
              Interactive multi-dimensional matrix visualizing regulatory control maturity levels (CMMI Levels 1-5) across
              business departments, ISO 27001:2022 clauses, and MAS TRM technology domains. Color-coded grid highlights
              high-risk non-compliance zones and residual exposure hot-spots.
            </p>
          </div>

          {/* Color-Coded 5-Tier Maturity Level Legend Toolbar */}
          <div className={`p-3.5 sm:p-4 rounded-xl border flex flex-col gap-2 shrink-0 ${
            theme === 'light' ? 'bg-white/90 border-slate-200 shadow-xs' : 'bg-slate-950/80 border-slate-800'
          }`}>
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center space-x-1.5">
                <span className={`text-[11px] font-bold uppercase tracking-wider ${
                  theme === 'light' ? 'text-slate-700' : 'text-slate-400'
                }`}>
                  CMMI Maturity Levels:
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Org Avg: Level {maturityDistribution.avgMaturity} / 5.0
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {hasActiveFilters && (
                  <button
                    onClick={handleClearFilters}
                    className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer flex items-center space-x-1"
                    title="Reset all active filter states to default"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                    <span>Clear Filters</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    document.getElementById('cmmi-maturity-legend')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer flex items-center space-x-1"
                  title="Jump down to comprehensive CMMI Levels 1-5 explanation and audit criteria"
                >
                  <span>Detailed Legend &darr;</span>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-[11px] font-medium" role="toolbar" aria-label="Maturity tier filters">
              <button
                onClick={() => setMaturityTierFilter(prev => prev === 1 ? 'ALL' : 1)}
                className={`flex items-center space-x-1 px-2 py-1 rounded-md border text-rose-600 dark:text-rose-300 transition-all cursor-pointer ${
                  maturityTierFilter === 1
                    ? 'bg-rose-500/25 border-rose-500 ring-2 ring-rose-500/50 shadow-xs font-bold'
                    : 'bg-rose-500/10 border-rose-500/30 hover:bg-rose-500/20'
                }`}
                title="Filter / spotlight Level 1 Initial (<40%)"
                aria-pressed={maturityTierFilter === 1}
              >
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <span>L1 Initial (&lt;40%)</span>
              </button>
              <button
                onClick={() => setMaturityTierFilter(prev => prev === 2 ? 'ALL' : 2)}
                className={`flex items-center space-x-1 px-2 py-1 rounded-md border text-orange-600 dark:text-orange-300 transition-all cursor-pointer ${
                  maturityTierFilter === 2
                    ? 'bg-orange-500/25 border-orange-500 ring-2 ring-orange-500/50 shadow-xs font-bold'
                    : 'bg-orange-500/10 border-orange-500/30 hover:bg-orange-500/20'
                }`}
                title="Filter / spotlight Level 2 Developing (40-59%)"
                aria-pressed={maturityTierFilter === 2}
              >
                <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                <span>L2 Developing (40-59%)</span>
              </button>
              <button
                onClick={() => setMaturityTierFilter(prev => prev === 3 ? 'ALL' : 3)}
                className={`flex items-center space-x-1 px-2 py-1 rounded-md border text-amber-600 dark:text-amber-300 transition-all cursor-pointer ${
                  maturityTierFilter === 3
                    ? 'bg-amber-500/25 border-amber-500 ring-2 ring-amber-500/50 shadow-xs font-bold'
                    : 'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20'
                }`}
                title="Filter / spotlight Level 3 Defined (60-74%)"
                aria-pressed={maturityTierFilter === 3}
              >
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>L3 Defined (60-74%)</span>
              </button>
              <button
                onClick={() => setMaturityTierFilter(prev => prev === 4 ? 'ALL' : 4)}
                className={`flex items-center space-x-1 px-2 py-1 rounded-md border text-emerald-600 dark:text-emerald-300 transition-all cursor-pointer ${
                  maturityTierFilter === 4
                    ? 'bg-emerald-500/25 border-emerald-500 ring-2 ring-emerald-500/50 shadow-xs font-bold'
                    : 'bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20'
                }`}
                title="Filter / spotlight Level 4 Managed (75-89%)"
                aria-pressed={maturityTierFilter === 4}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>L4 Managed (75-89%)</span>
              </button>
              <button
                onClick={() => setMaturityTierFilter(prev => prev === 5 ? 'ALL' : 5)}
                className={`flex items-center space-x-1 px-2 py-1 rounded-md border text-indigo-600 dark:text-indigo-300 transition-all cursor-pointer ${
                  maturityTierFilter === 5
                    ? 'bg-indigo-500/25 border-indigo-500 ring-2 ring-indigo-500/50 shadow-xs font-bold'
                    : 'bg-indigo-500/10 border-indigo-500/30 hover:bg-indigo-500/20'
                }`}
                title="Filter / spotlight Level 5 Optimized (90-100%)"
                aria-pressed={maturityTierFilter === 5}
              >
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                <span>L5 Optimized (90-100%)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-6 pt-5 border-t border-slate-200/60 dark:border-slate-800/80">
          <div className={`p-3.5 rounded-xl border ${
            theme === 'light' ? 'bg-white/90 border-slate-200' : 'bg-slate-900/60 border-slate-800'
          }`}>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Overall Maturity Score</span>
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
            </div>
            <div className="mt-1 flex items-baseline space-x-2">
              <span className={`text-2xl font-extrabold ${
                metrics.averageScore >= 85
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : metrics.averageScore >= 70
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}>
                {metrics.averageScore}%
              </span>
              <span className="text-[11px] font-semibold text-emerald-500 flex items-center">
                <ArrowUp className="w-2.5 h-2.5 mr-0.5" /> +3.2%
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              CMMI Level {maturityDistribution.avgMaturity} across 8 business units
            </span>
          </div>

          <div className={`p-3.5 rounded-xl border ${
            theme === 'light' ? 'bg-white/90 border-slate-200' : 'bg-slate-900/60 border-slate-800'
          }`}>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>High-Risk Non-Compliance Hotspots</span>
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            </div>
            <div className="mt-1 flex items-baseline space-x-2">
              <span className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
                {metrics.nonCompliantCount}
              </span>
              <span className="text-[11px] text-slate-400">intersections</span>
            </div>
            <span className="text-[10px] text-rose-500 dark:text-rose-400 font-medium block mt-0.5">
              Level 1 &amp; 2 critical gaps requiring escalation
            </span>
          </div>

          <div className={`p-3.5 rounded-xl border ${
            theme === 'light' ? 'bg-white/90 border-slate-200' : 'bg-slate-900/60 border-slate-800'
          }`}>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Developing / In-Progress</span>
              <Clock className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div className="mt-1 flex items-baseline space-x-2">
              <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
                {metrics.inProgressCount}
              </span>
              <span className="text-[11px] text-slate-400">cells</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">Level 3 standardized controls</span>
          </div>

          <div className={`p-3.5 rounded-xl border ${
            theme === 'light' ? 'bg-white/90 border-slate-200' : 'bg-slate-900/60 border-slate-800'
          }`}>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Fully Managed &amp; Verified</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <div className="mt-1 flex items-baseline space-x-2">
              <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {metrics.compliantCount}
              </span>
              <span className="text-[11px] text-slate-400">
                cells ({Math.round((metrics.compliantCount / (metrics.totalNodes || 1)) * 100)}%)
              </span>
            </div>
            <span className="text-[10px] text-emerald-500 font-medium block mt-0.5">
              Level 4 &amp; 5 audit-ready evidence attached
            </span>
          </div>
        </div>

        {/* Interactive Maturity Distribution Bar */}
        <div className="mt-5 pt-4 border-t border-slate-200/60 dark:border-slate-800/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-3.5 h-3.5 text-indigo-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Maturity Distribution Across Evaluated Controls
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] text-slate-400">Click a tier to filter matrix:</span>
              {maturityTierFilter !== 'ALL' && (
                <button
                  onClick={() => setMaturityTierFilter('ALL')}
                  className="text-[11px] font-bold text-indigo-500 hover:underline cursor-pointer"
                >
                  Reset Filter (Show All)
                </button>
              )}
            </div>
          </div>

          <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded-full flex overflow-hidden shadow-inner">
            <button
              onClick={() => setMaturityTierFilter(1)}
              style={{ width: `${maturityDistribution.l1Pct}%` }}
              className="bg-rose-500 hover:bg-rose-600 transition-colors cursor-pointer relative group"
              title={`Level 1 Initial: ${maturityDistribution.counts[1]} cells (${maturityDistribution.l1Pct}%)`}
            />
            <button
              onClick={() => setMaturityTierFilter(2)}
              style={{ width: `${maturityDistribution.l2Pct}%` }}
              className="bg-orange-500 hover:bg-orange-600 transition-colors cursor-pointer relative group"
              title={`Level 2 Developing: ${maturityDistribution.counts[2]} cells (${maturityDistribution.l2Pct}%)`}
            />
            <button
              onClick={() => setMaturityTierFilter(3)}
              style={{ width: `${maturityDistribution.l3Pct}%` }}
              className="bg-amber-500 hover:bg-amber-600 transition-colors cursor-pointer relative group"
              title={`Level 3 Defined: ${maturityDistribution.counts[3]} cells (${maturityDistribution.l3Pct}%)`}
            />
            <button
              onClick={() => setMaturityTierFilter(4)}
              style={{ width: `${maturityDistribution.l4Pct}%` }}
              className="bg-emerald-500 hover:bg-emerald-600 transition-colors cursor-pointer relative group"
              title={`Level 4 Managed: ${maturityDistribution.counts[4]} cells (${maturityDistribution.l4Pct}%)`}
            />
            <button
              onClick={() => setMaturityTierFilter(5)}
              style={{ width: `${maturityDistribution.l5Pct}%` }}
              className="bg-indigo-500 hover:bg-indigo-600 transition-colors cursor-pointer relative group"
              title={`Level 5 Optimized: ${maturityDistribution.counts[5]} cells (${maturityDistribution.l5Pct}%)`}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 mt-2 text-[11px]">
            <button
              onClick={() => setMaturityTierFilter(prev => (prev === 1 ? 'ALL' : 1))}
              className={`flex items-center space-x-1.5 px-2 py-0.5 rounded cursor-pointer transition-all ${
                maturityTierFilter === 1
                  ? 'ring-2 ring-rose-500 bg-rose-500/20 font-bold'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span className="text-rose-500 font-semibold">L1 Initial: {maturityDistribution.counts[1]} ({maturityDistribution.l1Pct}%)</span>
            </button>

            <button
              onClick={() => setMaturityTierFilter(prev => (prev === 2 ? 'ALL' : 2))}
              className={`flex items-center space-x-1.5 px-2 py-0.5 rounded cursor-pointer transition-all ${
                maturityTierFilter === 2
                  ? 'ring-2 ring-orange-500 bg-orange-500/20 font-bold'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              <span className="text-orange-500 font-semibold">L2 Developing: {maturityDistribution.counts[2]} ({maturityDistribution.l2Pct}%)</span>
            </button>

            <button
              onClick={() => setMaturityTierFilter(prev => (prev === 3 ? 'ALL' : 3))}
              className={`flex items-center space-x-1.5 px-2 py-0.5 rounded cursor-pointer transition-all ${
                maturityTierFilter === 3
                  ? 'ring-2 ring-amber-500 bg-amber-500/20 font-bold'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-amber-500 font-semibold">L3 Defined: {maturityDistribution.counts[3]} ({maturityDistribution.l3Pct}%)</span>
            </button>

            <button
              onClick={() => setMaturityTierFilter(prev => (prev === 4 ? 'ALL' : 4))}
              className={`flex items-center space-x-1.5 px-2 py-0.5 rounded cursor-pointer transition-all ${
                maturityTierFilter === 4
                  ? 'ring-2 ring-emerald-500 bg-emerald-500/20 font-bold'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-emerald-500 font-semibold">L4 Managed: {maturityDistribution.counts[4]} ({maturityDistribution.l4Pct}%)</span>
            </button>

            <button
              onClick={() => setMaturityTierFilter(prev => (prev === 5 ? 'ALL' : 5))}
              className={`flex items-center space-x-1.5 px-2 py-0.5 rounded cursor-pointer transition-all ${
                maturityTierFilter === 5
                  ? 'ring-2 ring-indigo-500 bg-indigo-500/20 font-bold'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <span className="text-indigo-500 font-semibold">L5 Optimized: {maturityDistribution.counts[5]} ({maturityDistribution.l5Pct}%)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Priority Non-Compliance Escalation Hotspots Radar */}
      <div className={`p-4 sm:p-5 rounded-2xl border shadow-xl transition-colors ${
        theme === 'light' ? 'bg-white border-rose-200 shadow-rose-100/50' : 'bg-slate-900 border-rose-900/40 shadow-rose-950/20'
      }`}>
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2.5">
            <span className="p-1.5 rounded-lg bg-rose-500/15 text-rose-500 border border-rose-500/30">
              <Flame className="w-4 h-4 animate-pulse" />
            </span>
            <div>
              <h2 className={`text-sm sm:text-base font-bold flex items-center space-x-2 ${
                theme === 'light' ? 'text-slate-900' : 'text-white'
              }`}>
                <span>High-Risk Non-Compliance Escalation Hotspots</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-500 border border-rose-500/30 font-mono">
                  {priorityNonComplianceHotspots.length} Critical
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Departmental intersections operating below regulatory threshold (Level 1 &amp; Level 2). Immediate remediation focus.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSpotlightHighRisk(prev => !prev)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                spotlightHighRisk
                  ? 'bg-rose-500 text-white border-rose-600 shadow-md ring-2 ring-rose-500/40'
                  : theme === 'light'
                  ? 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'
                  : 'bg-rose-950/40 text-rose-300 border-rose-700/50 hover:bg-rose-900/60'
              }`}
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>Spotlight High-Risk in Matrix: {spotlightHighRisk ? 'ON' : 'OFF'}</span>
            </button>
            <button
              onClick={() => setIsHotspotsExpanded(prev => !prev)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer"
              title={isHotspotsExpanded ? 'Collapse hotspots' : 'Expand hotspots'}
            >
              {isHotspotsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {isHotspotsExpanded && (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
            <AnimatePresence mode="popLayout" initial={false}>
              {priorityNonComplianceHotspots.map((spot, idx) => (
                <motion.div
                  key={`hotspot-${spot.cell.id}`}
                  layout
                  variants={heatmapTileVariants}
                  custom={idx}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{
                    layout: heatmapTileLayoutTransition,
                    opacity: { duration: 0.2 },
                    scale: { duration: 0.2 }
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                    theme === 'light'
                      ? 'bg-rose-50/60 border-rose-200 hover:border-rose-300 shadow-xs'
                      : 'bg-rose-950/30 border-rose-900/50 hover:border-rose-700/60'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
                        {spot.deptName}
                      </span>
                      <div className="flex items-center space-x-1">
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${spot.tier.badgeClass}`}>
                          {spot.tier.shortLabel} ({spot.score}%)
                        </span>
                        <MaturitySparkline
                          scores={spot.cell.historicalScores}
                          currentScore={spot.cell.score}
                          previousScore={spot.cell.previousScore}
                          scoreDelta={spot.cell.scoreDelta}
                          trend={spot.cell.trend}
                          size="xs"
                          showSparkline={true}
                          showArrow={true}
                        />
                      </div>
                    </div>
                    <div className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center space-x-1">
                      <AlertTriangle className="w-3 h-3 shrink-0" />
                      <span className="truncate">{spot.targetCode} &bull; {spot.targetTitle}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                      {spot.ncReason}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-rose-200/60 dark:border-rose-900/40 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-500">
                      {spot.findingsCount} Open CAPA Findings
                    </span>
                    <button
                      onClick={() => handleCellClick(spot.cell)}
                      className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold cursor-pointer transition-colors flex items-center space-x-1 shadow-xs"
                    >
                      <span>Remediate</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* 3b. Remediation Priority Queue for Immediate Action Planning */}
      <RemediationPriorityQueue
        theme={theme}
        cells={cells}
        onSelectCell={handleCellClick}
        onCellUpdated={handleCellUpdated}
        defaultCategoryFilter={controlFilterMode}
      />

      {/* 4. Controls, View Modes & Matrix Toolbar */}
      <div className={`p-4 rounded-2xl border shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
        theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
      }`}>
        {/* Left Side: Framework Pivot Tabs */}
        <div className={`flex flex-wrap items-center p-1 rounded-xl border text-xs font-semibold ${
          theme === 'light' ? 'bg-slate-100 border-slate-300' : 'bg-slate-950 border-slate-800'
        }`}>
          <button
            onClick={() => handleDimensionChange('tri_dimensional')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer ${
              dimensionMode === 'tri_dimensional'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm ring-1 ring-indigo-400/40'
                : theme === 'light'
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Grid className="w-3.5 h-3.5 text-amber-300" />
            <span>Unified Multi-Matrix</span>
          </button>

          <button
            onClick={() => handleDimensionChange('dept_vs_iso')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer ${
              dimensionMode === 'dept_vs_iso'
                ? 'bg-indigo-600 text-white shadow-sm'
                : theme === 'light'
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Dept × ISO 27001</span>
          </button>

          <button
            onClick={() => handleDimensionChange('dept_vs_mas')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer ${
              dimensionMode === 'dept_vs_mas'
                ? 'bg-indigo-600 text-white shadow-sm'
                : theme === 'light'
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Dept × MAS TRM</span>
          </button>

          <button
            onClick={() => handleDimensionChange('dept_vs_pims')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer ${
              dimensionMode === 'dept_vs_pims'
                ? 'bg-emerald-600 text-white shadow-sm'
                : theme === 'light'
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            <span>Dept × ISO 27701</span>
          </button>

          <button
            onClick={() => handleDimensionChange('department_composite')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer ${
              dimensionMode === 'department_composite'
                ? 'bg-indigo-600 text-white shadow-sm'
                : theme === 'light'
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Composite Scorecard</span>
          </button>

          <button
            onClick={() => handleDimensionChange('grid_tiles')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer ${
              dimensionMode === 'grid_tiles'
                ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-sm ring-1 ring-indigo-400/40 font-bold'
                : theme === 'light'
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Display evaluated controls as an auto-repositioning, responsive interactive grid of tiles"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-cyan-300" />
            <span>Interactive Grid Tiles</span>
          </button>
        </div>

        {/* Right Side: View Mode Switcher, Sorting & Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Matrix Cell View Mode Switcher */}
          <div className={`flex items-center p-1 rounded-xl border text-xs font-medium ${
            theme === 'light' ? 'bg-slate-100 border-slate-300' : 'bg-slate-950 border-slate-800'
          }`}>
            <button
              onClick={() => setViewMode('maturity')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                viewMode === 'maturity'
                  ? 'bg-indigo-600 text-white font-bold shadow-xs'
                  : theme === 'light'
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Display CMMI Maturity Level (L1 - L5) badges inside cells"
            >
              Maturity (L1-L5)
            </button>
            <button
              onClick={() => setViewMode('score')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                viewMode === 'score'
                  ? 'bg-indigo-600 text-white font-bold shadow-xs'
                  : theme === 'light'
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Display percentage compliance score inside cells"
            >
              Score (%)
            </button>
            <button
              onClick={() => setViewMode('risk')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                viewMode === 'risk'
                  ? 'bg-indigo-600 text-white font-bold shadow-xs'
                  : theme === 'light'
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Display residual risk severity tier inside cells"
            >
              Risk Tier
            </button>
          </div>

          {/* Department Sort Selector */}
          <select
            value={deptSortBy}
            onChange={e => setDeptSortBy(e.target.value as any)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-medium cursor-pointer ${
              theme === 'light'
                ? 'bg-white border-slate-300 text-slate-800'
                : 'bg-slate-950 border-slate-800 text-slate-200'
            }`}
            title="Sort department rows"
          >
            <option value="lowest_maturity">Sort: Lowest Maturity (High-Risk First)</option>
            <option value="highest_maturity">Sort: Highest Maturity First</option>
            <option value="open_findings">Sort: Most Open Findings</option>
            <option value="name">Sort: Alphabetical (A-Z)</option>
          </select>

          {/* Framework Filter Dropdown */}
          <select
            id="heatmap-toolbar-framework-select"
            value={dimensionMode}
            onChange={e => handleDimensionChange(e.target.value as HeatmapDimensionMode)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-medium cursor-pointer ${
              theme === 'light'
                ? 'bg-white border-slate-300 text-slate-800'
                : 'bg-slate-950 border-slate-800 text-slate-200'
            }`}
            title="Filter Heatmap by Regulatory Compliance Framework"
          >
            <option value="tri_dimensional">Framework: All (Unified Multi-Matrix)</option>
            <option value="dept_vs_iso">Framework: ISO/IEC 27001 ISMS</option>
            <option value="dept_vs_mas">Framework: MAS TRM 2021</option>
            <option value="dept_vs_pims">Framework: ISO 27701 Privacy</option>
            <option value="department_composite">Framework: Composite Scorecard</option>
            <option value="grid_tiles">Framework: Interactive Grid Matrix</option>
          </select>

          {/* Department Filter Dropdown */}
          <select
            id="heatmap-toolbar-department-select"
            value={departmentFilter}
            onChange={e => handleDepartmentChange(e.target.value)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-medium cursor-pointer ${
              theme === 'light'
                ? 'bg-white border-slate-300 text-slate-800'
                : 'bg-slate-950 border-slate-800 text-slate-200'
            }`}
            title="Filter Heatmap by Business Department"
          >
            <option value="ALL">Dept: All Departments</option>
            {HEATMAP_DEPARTMENTS.map(d => (
              <option key={d.id} value={d.id}>
                Dept: {d.name}
              </option>
            ))}
          </select>

          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search matrix..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className={`pl-8 pr-3 py-1.5 rounded-xl border text-xs outline-none transition-all w-36 sm:w-44 ${
                theme === 'light'
                  ? 'bg-white border-slate-300 text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                  : 'bg-slate-950 border-slate-800 text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
              }`}
            />
          </div>

          {/* Quick Clear Filters indicator */}
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              id="btn-toolbar-clear-filters"
              className="compliance-heatmap-clear-filters-btn px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center space-x-1 text-indigo-600 dark:text-indigo-400 border-indigo-300 dark:border-indigo-800 bg-indigo-50/70 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-all cursor-pointer shrink-0"
              title="Reset all active filters and return to full dataset view"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* 4b. Dynamic Interactive Risk Category Filter Legend Bar */}
      <RiskCategoryLegend
        theme={theme}
        selectedCategories={selectedRiskCategories}
        onToggleCategory={handleToggleRiskCategory}
        onSelectAllCategories={handleSelectAllRiskCategories}
        onIsolateCategory={handleIsolateRiskCategory}
        onSetCategories={handleSetRiskCategories}
        filterDisplayMode={riskFilterDisplayMode}
        onToggleDisplayMode={setRiskFilterDisplayMode}
        distribution={riskDistribution}
        totalIntersections={activeCells.length}
        compactBarOnly={true}
      />

      {/* 5. Main Heatmap Matrix Canvas */}
      <div className={`border rounded-2xl shadow-xl overflow-hidden transition-colors ${
        theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="overflow-x-auto scrollbar-thin">
          {/* Dimension Mode 1: Unified Tri-Matrix */}
          {dimensionMode === 'tri_dimensional' && (
            <table className="w-full text-left border-collapse min-w-[1100px]">
              <thead>
                <tr className={theme === 'light' ? 'bg-slate-100 border-b border-slate-200' : 'bg-slate-950 border-b border-slate-800'}>
                  <th className="py-3 px-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-52 sticky left-0 z-20 bg-inherit">
                    Department Unit
                  </th>
                  {/* ISO Columns */}
                  <th colSpan={TRI_ISO_COLUMNS.length} className="py-3 px-4 text-center text-[11px] font-bold text-indigo-500 border-l border-r border-slate-200 dark:border-slate-800 bg-indigo-500/5">
                    ISO/IEC 27001:2022 ISMS Regulatory Controls
                  </th>
                  {/* MAS Columns */}
                  <th colSpan={TRI_MAS_COLUMNS.length} className="py-3 px-4 text-center text-[11px] font-bold text-emerald-500 bg-emerald-500/5">
                    MAS TRM 2021 Singapore Technology Domains
                  </th>
                </tr>
                <tr className={theme === 'light' ? 'bg-slate-50 border-b border-slate-200 text-slate-700' : 'bg-slate-900/90 border-b border-slate-800 text-slate-300'}>
                  <th className="py-3 px-4 text-left text-[11px] font-semibold sticky left-0 z-20 bg-inherit">
                    Maturity Ranking
                  </th>
                  {TRI_ISO_COLUMNS.map(col => {
                    const isColActive = isColHovered(col.code);
                    return (
                      <th
                        key={col.code}
                        className={`py-3 px-4 text-center text-[11px] font-semibold min-w-[105px] transition-all duration-200 ${
                          isColActive
                            ? theme === 'light'
                              ? 'bg-indigo-100/90 text-indigo-950 font-bold border-b-2 border-indigo-600 shadow-sm ring-1 ring-indigo-400/40'
                              : 'bg-indigo-950/90 text-indigo-100 font-bold border-b-2 border-indigo-400 shadow-md shadow-indigo-950/60 ring-1 ring-indigo-500/50'
                            : ''
                        }`}
                        title={col.title}
                      >
                        <span className={`block truncate transition-colors duration-150 ${isColActive ? 'text-indigo-600 dark:text-indigo-300 font-bold' : ''}`}>
                          {col.shortTitle}
                        </span>
                        <span className={`text-[9px] font-mono block transition-colors duration-150 ${isColActive ? 'text-indigo-500 dark:text-indigo-400 font-bold' : 'text-slate-400'}`}>
                          {col.code}
                        </span>
                      </th>
                    );
                  })}
                  {TRI_MAS_COLUMNS.map(col => {
                    const isColActive = isColHovered(col.code);
                    return (
                      <th
                        key={col.code}
                        className={`py-3 px-4 text-center text-[11px] font-semibold min-w-[105px] transition-all duration-200 ${
                          isColActive
                            ? theme === 'light'
                              ? 'bg-emerald-100/90 text-emerald-950 font-bold border-b-2 border-emerald-600 shadow-sm ring-1 ring-emerald-400/40'
                              : 'bg-emerald-950/90 text-emerald-100 font-bold border-b-2 border-emerald-400 shadow-md shadow-emerald-950/60 ring-1 ring-emerald-500/50'
                            : ''
                        }`}
                        title={col.title}
                      >
                        <span className={`block truncate transition-colors duration-150 ${isColActive ? 'text-emerald-600 dark:text-emerald-300 font-bold' : ''}`}>
                          {col.shortTitle}
                        </span>
                        <span className={`text-[9px] font-mono block transition-colors duration-150 ${isColActive ? 'text-emerald-500 dark:text-emerald-400 font-bold' : 'text-slate-400'}`}>
                          {col.code}
                        </span>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                <AnimatePresence initial={false}>
                  {sortedDepartments.filter(d => departmentFilter === 'ALL' || d.id === departmentFilter).map((dept, deptIdx) => {
                    const isRowActive = isRowHovered(dept.id);
                    const deptRisk = departmentRiskConcentration.find(dr => dr.id === dept.id);
                    return (
                      <motion.tr
                        key={dept.id}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10, transition: { duration: 0.18 } }}
                        transition={{ layout: heatmapTileLayoutTransition, opacity: { duration: 0.2 } }}
                        className={`transition-colors duration-150 ${
                          isRowActive
                            ? theme === 'light'
                              ? 'bg-indigo-50/40'
                              : 'bg-indigo-950/25'
                            : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
                        }`}
                      >
                        {/* Department Lead Column */}
                        <td className={`py-3 px-4 text-left align-middle sticky left-0 z-20 font-medium text-xs border-r transition-all duration-200 ${
                          isRowActive
                            ? theme === 'light'
                              ? 'bg-indigo-50/95 border-r-2 border-indigo-600 shadow-sm ring-1 ring-inset ring-indigo-400/40'
                              : 'bg-slate-900 border-r-2 border-indigo-400 shadow-md shadow-indigo-950/60 ring-1 ring-inset ring-indigo-500/50'
                            : theme === 'light'
                            ? 'bg-white border-slate-200'
                            : 'bg-slate-900 border-slate-800'
                        }`}>
                          <div className="flex items-center space-x-2.5">
                            <span
                              className={`w-2.5 h-2.5 rounded-full shrink-0 transition-transform duration-200 ${
                                isRowActive ? 'scale-125 ring-2 ring-indigo-400 ring-offset-1' : ''
                              }`}
                              style={{ backgroundColor: dept.avatarColor }}
                            />
                            <div className="min-w-0">
                              <div className="flex items-center space-x-1.5">
                                <span className={`font-bold block truncate transition-colors duration-150 ${
                                  isRowActive
                                    ? 'text-indigo-600 dark:text-indigo-300 font-extrabold'
                                    : theme === 'light' ? 'text-slate-900' : 'text-white'
                                }`}>
                                  {dept.name}
                                </span>
                                {deptRisk && (
                                  <span className={`text-[9px] font-mono font-bold px-1 rounded ${deptRisk.avgMaturityTier.badgeClass}`}>
                                    {deptRisk.avgMaturityTier.shortLabel}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center space-x-1.5 mt-0.5">
                                <span className="text-[10px] text-slate-400 truncate block">
                                  Lead: {dept.head} &bull; {deptRisk?.avgScore}% avg
                                </span>
                                {deptRisk && (
                                  <MaturitySparkline
                                    scores={deptRisk.historicalScores}
                                    currentScore={deptRisk.avgScore}
                                    trend={deptRisk.trend}
                                    scoreDelta={deptRisk.scoreDelta}
                                    size="xs"
                                    showSparkline={true}
                                    showArrow={true}
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* ISO Cells */}
                        {TRI_ISO_COLUMNS.map((col, colIdx) => {
                          const cell = cells.find(
                            c => c.departmentId === dept.id && c.dimensionType === 'ISO_27001' && c.targetCode === col.code
                          );
                          if (!cell) {
                            return (
                              <td key={col.code} className="py-3 px-4 text-center align-middle text-xs text-slate-400">
                                -
                              </td>
                            );
                          }
                          const staggerIndex = (deptIdx * 2) + colIdx;
                          return renderHeatmapMatrixCell(cell, col.code, isRowActive, isColHovered(col.code), dept.id, staggerIndex);
                        })}

                        {/* MAS Cells */}
                        {TRI_MAS_COLUMNS.map((col, colIdx) => {
                          const cell = cells.find(
                            c => c.departmentId === dept.id && c.dimensionType === 'MAS_TRM' && c.targetCode === col.code
                          );
                          if (!cell) {
                            return (
                              <td key={col.code} className="py-3 px-4 text-center align-middle text-xs text-slate-400">
                                -
                              </td>
                            );
                          }
                          const staggerIndex = (deptIdx * 2) + TRI_ISO_COLUMNS.length + colIdx;
                          return renderHeatmapMatrixCell(cell, col.code, isRowActive, isColHovered(col.code), dept.id, staggerIndex);
                        })}
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          )}

          {/* Dimension Mode 2: Dept vs ISO 27001 */}
          {dimensionMode === 'dept_vs_iso' && (
            <table className="w-full text-left border-collapse min-w-[1200px]">
              <thead>
                <tr className={theme === 'light' ? 'bg-slate-100 border-b border-slate-200' : 'bg-slate-950 border-b border-slate-800'}>
                  <th className="py-3 px-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-52 sticky left-0 z-20 bg-inherit">
                    Department
                  </th>
                  {HEATMAP_ISO_CLAUSES.map(col => {
                    const isColActive = isColHovered(col.clauseCode);
                    return (
                      <th
                        key={col.clauseCode}
                        className={`py-3 px-4 text-center text-[11px] font-semibold min-w-[95px] transition-all duration-200 ${
                          isColActive
                            ? theme === 'light'
                              ? 'bg-indigo-100/90 text-indigo-950 font-bold border-b-2 border-indigo-600 shadow-sm ring-1 ring-indigo-400/40'
                              : 'bg-indigo-950/90 text-indigo-100 font-bold border-b-2 border-indigo-400 shadow-md shadow-indigo-950/60 ring-1 ring-indigo-500/50'
                            : ''
                        }`}
                        title={col.title}
                      >
                        <span className={`block truncate transition-colors duration-150 ${isColActive ? 'text-indigo-600 dark:text-indigo-300 font-bold' : ''}`}>
                          {col.shortTitle}
                        </span>
                        <span className={`text-[9px] font-mono block transition-colors duration-150 ${isColActive ? 'text-indigo-500 dark:text-indigo-400 font-bold' : 'text-slate-400'}`}>
                          {col.clauseCode}
                        </span>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                <AnimatePresence initial={false}>
                  {sortedDepartments.filter(d => departmentFilter === 'ALL' || d.id === departmentFilter).map((dept, deptIdx) => {
                    const isRowActive = isRowHovered(dept.id);
                    const deptRisk = departmentRiskConcentration.find(dr => dr.id === dept.id);
                    return (
                      <motion.tr
                        key={dept.id}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10, transition: { duration: 0.18 } }}
                        transition={{ layout: heatmapTileLayoutTransition, opacity: { duration: 0.2 } }}
                        className={`transition-colors duration-150 ${
                          isRowActive
                            ? theme === 'light'
                              ? 'bg-indigo-50/40'
                              : 'bg-indigo-950/25'
                            : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
                        }`}
                      >
                        <td className={`py-3 px-4 text-left align-middle sticky left-0 z-20 font-medium text-xs border-r transition-all duration-200 ${
                          isRowActive
                            ? theme === 'light'
                              ? 'bg-indigo-50/95 border-r-2 border-indigo-600 shadow-sm ring-1 ring-inset ring-indigo-400/40'
                              : 'bg-slate-900 border-r-2 border-indigo-400 shadow-md shadow-indigo-950/60 ring-1 ring-inset ring-indigo-500/50'
                            : theme === 'light'
                            ? 'bg-white border-slate-200'
                            : 'bg-slate-900 border-slate-800'
                        }`}>
                          <div className="flex items-center space-x-2">
                            <span
                              className={`w-2.5 h-2.5 rounded-full shrink-0 transition-transform duration-200 ${
                                isRowActive ? 'scale-125 ring-2 ring-indigo-400 ring-offset-1' : ''
                              }`}
                              style={{ backgroundColor: dept.avatarColor }}
                            />
                            <div className="min-w-0">
                              <span className={`font-bold truncate block transition-colors duration-150 ${
                                isRowActive
                                  ? 'text-indigo-600 dark:text-indigo-300 font-extrabold'
                                  : theme === 'light' ? 'text-slate-900' : 'text-white'
                              }`}>
                                {dept.name}
                              </span>
                              <div className="flex items-center space-x-1.5 mt-0.5">
                                <span className="text-[10px] text-slate-400">Avg: {deptRisk?.avgScore}%</span>
                                {deptRisk && (
                                  <MaturitySparkline
                                    scores={deptRisk.historicalScores}
                                    currentScore={deptRisk.avgScore}
                                    trend={deptRisk.trend}
                                    scoreDelta={deptRisk.scoreDelta}
                                    size="xs"
                                    showSparkline={true}
                                    showArrow={true}
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        {HEATMAP_ISO_CLAUSES.map((col, colIdx) => {
                          const cell = cells.find(
                            c => c.departmentId === dept.id && c.dimensionType === 'ISO_27001' && c.targetCode === col.clauseCode
                          );
                          if (!cell) return <td key={col.clauseCode} className="py-3 px-4 text-center align-middle text-xs text-slate-400">-</td>;
                          const staggerIndex = (deptIdx * 2) + colIdx;
                          return renderHeatmapMatrixCell(cell, col.clauseCode, isRowActive, isColHovered(col.clauseCode), dept.id, staggerIndex);
                        })}
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          )}

          {/* Dimension Mode 3: Dept vs MAS TRM */}
          {dimensionMode === 'dept_vs_mas' && (
            <table className="w-full text-left border-collapse min-w-[1200px]">
              <thead>
                <tr className={theme === 'light' ? 'bg-slate-100 border-b border-slate-200' : 'bg-slate-950 border-b border-slate-800'}>
                  <th className="py-3 px-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-52 sticky left-0 z-20 bg-inherit">
                    Department
                  </th>
                  {HEATMAP_MAS_MODULES.map(col => {
                    const isColActive = isColHovered(col.domainNumber);
                    return (
                      <th
                        key={col.domainNumber}
                        className={`py-3 px-4 text-center text-[11px] font-semibold min-w-[95px] transition-all duration-200 ${
                          isColActive
                            ? theme === 'light'
                              ? 'bg-emerald-100/90 text-emerald-950 font-bold border-b-2 border-emerald-600 shadow-sm ring-1 ring-emerald-400/40'
                              : 'bg-emerald-950/90 text-emerald-100 font-bold border-b-2 border-emerald-400 shadow-md shadow-emerald-950/60 ring-1 ring-emerald-500/50'
                            : ''
                        }`}
                        title={col.title}
                      >
                        <span className={`block truncate transition-colors duration-150 ${isColActive ? 'text-emerald-600 dark:text-emerald-300 font-bold' : ''}`}>
                          {col.shortTitle}
                        </span>
                        <span className={`text-[9px] font-mono block transition-colors duration-150 ${isColActive ? 'text-emerald-500 dark:text-emerald-400 font-bold' : 'text-slate-400'}`}>
                          {col.domainNumber}
                        </span>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                <AnimatePresence initial={false}>
                  {sortedDepartments.filter(d => departmentFilter === 'ALL' || d.id === departmentFilter).map((dept, deptIdx) => {
                    const isRowActive = isRowHovered(dept.id);
                    const deptRisk = departmentRiskConcentration.find(dr => dr.id === dept.id);
                    return (
                      <motion.tr
                        key={dept.id}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10, transition: { duration: 0.18 } }}
                        transition={{ layout: heatmapTileLayoutTransition, opacity: { duration: 0.2 } }}
                        className={`transition-colors duration-150 ${
                          isRowActive
                            ? theme === 'light'
                              ? 'bg-emerald-50/40'
                              : 'bg-emerald-950/25'
                            : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
                        }`}
                      >
                        <td className={`py-3 px-4 text-left align-middle sticky left-0 z-20 font-medium text-xs border-r transition-all duration-200 ${
                          isRowActive
                            ? theme === 'light'
                              ? 'bg-emerald-50/95 border-r-2 border-emerald-600 shadow-sm ring-1 ring-inset ring-emerald-400/40'
                              : 'bg-slate-900 border-r-2 border-emerald-400 shadow-md shadow-emerald-950/60 ring-1 ring-inset ring-emerald-500/50'
                            : theme === 'light'
                            ? 'bg-white border-slate-200'
                            : 'bg-slate-900 border-slate-800'
                        }`}>
                          <div className="flex items-center space-x-2">
                            <span
                              className={`w-2.5 h-2.5 rounded-full shrink-0 transition-transform duration-200 ${
                                isRowActive ? 'scale-125 ring-2 ring-emerald-400 ring-offset-1' : ''
                              }`}
                              style={{ backgroundColor: dept.avatarColor }}
                            />
                            <div className="min-w-0">
                              <span className={`font-bold truncate block transition-colors duration-150 ${
                                isRowActive
                                  ? 'text-emerald-600 dark:text-emerald-300 font-extrabold'
                                  : theme === 'light' ? 'text-slate-900' : 'text-white'
                              }`}>
                                {dept.name}
                              </span>
                              <div className="flex items-center space-x-1.5 mt-0.5">
                                <span className="text-[10px] text-slate-400">Avg: {deptRisk?.avgScore}%</span>
                                {deptRisk && (
                                  <MaturitySparkline
                                    scores={deptRisk.historicalScores}
                                    currentScore={deptRisk.avgScore}
                                    trend={deptRisk.trend}
                                    scoreDelta={deptRisk.scoreDelta}
                                    size="xs"
                                    showSparkline={true}
                                    showArrow={true}
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        {HEATMAP_MAS_MODULES.map((col, colIdx) => {
                          const cell = cells.find(
                            c => c.departmentId === dept.id && c.dimensionType === 'MAS_TRM' && c.targetCode === col.domainNumber
                          );
                          if (!cell) return <td key={col.domainNumber} className="py-3 px-4 text-center align-middle text-xs text-slate-400">-</td>;
                          const staggerIndex = (deptIdx * 2) + colIdx;
                          return renderHeatmapMatrixCell(cell, col.domainNumber, isRowActive, isColHovered(col.domainNumber), dept.id, staggerIndex);
                        })}
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          )}

          {/* Dimension Mode 4: Dept vs ISO 27701 PIMS */}
          {dimensionMode === 'dept_vs_pims' && (
            <table className="w-full text-left border-collapse min-w-[1200px]">
              <thead>
                <tr className={theme === 'light' ? 'bg-slate-100 border-b border-slate-200' : 'bg-slate-950 border-b border-slate-800'}>
                  <th className="py-3 px-4 text-left text-xs font-bold uppercase tracking-wider sticky left-0 z-20 bg-inherit min-w-[200px] border-r border-slate-200 dark:border-slate-800">
                    Department
                  </th>
                  {HEATMAP_PIMS_CLAUSES.map(col => {
                    const isHovered = isColHovered(col.clauseCode);
                    return (
                      <th
                        key={col.id}
                        className={`py-3 px-4 text-center text-xs font-semibold min-w-[110px] transition-all duration-200 ${
                          isHovered
                            ? 'bg-emerald-100/80 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-300 ring-2 ring-emerald-500 shadow-md scale-105 z-10'
                            : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <div className="flex flex-col items-center">
                          <span className={`font-mono text-xs font-extrabold ${isHovered ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-900 dark:text-white'}`}>
                            {col.clauseCode}
                          </span>
                          <span className="text-[10px] font-normal truncate max-w-[100px]" title={col.title}>
                            {col.shortTitle}
                          </span>
                          <span className="mt-0.5 text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono">
                            {col.roleType === 'CONTROLLER' ? 'Annex A' : col.roleType === 'PROCESSOR' ? 'Annex B' : 'PIMS Core'}
                          </span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                <AnimatePresence initial={false}>
                  {sortedDepartments.filter(d => departmentFilter === 'ALL' || d.id === departmentFilter).map((dept, deptIdx) => {
                    const deptCells = cells.filter(
                      c => c.departmentId === dept.id && c.dimensionType === 'ISO_27701'
                    );
                    const isRowActive = isRowHovered(dept.id);
                    const deptRisk = departmentRiskConcentration.find(dr => dr.id === dept.id);

                    return (
                      <motion.tr
                        key={dept.id}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10, transition: { duration: 0.18 } }}
                        transition={{ layout: heatmapTileLayoutTransition, opacity: { duration: 0.2 } }}
                        className={`transition-colors duration-150 ${
                          isRowActive
                            ? 'bg-emerald-50/70 dark:bg-emerald-950/30'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-900/40'
                        }`}
                      >
                        <td className={`py-3 px-4 text-left align-middle sticky left-0 z-10 border-r transition-all duration-200 ${
                          isRowActive
                            ? 'bg-emerald-100/90 dark:bg-slate-900 border-r-2 border-emerald-500 shadow-md ring-1 ring-emerald-500/50'
                            : theme === 'light'
                            ? 'bg-white border-slate-200'
                            : 'bg-slate-900 border-slate-800'
                        }`}>
                          <div className="flex items-center space-x-2">
                            <span
                              className={`w-2.5 h-2.5 rounded-full transition-transform duration-200 ${
                                isRowActive ? 'scale-125 ring-2 ring-emerald-500' : ''
                              }`}
                              style={{ backgroundColor: dept.avatarColor }}
                            />
                            <div>
                              <span className={`font-bold block text-xs transition-colors duration-150 ${
                                isRowActive ? 'text-emerald-700 dark:text-emerald-400 font-extrabold' : 'text-slate-900 dark:text-slate-200'
                              }`}>
                                {dept.name}
                              </span>
                              <div className="flex items-center space-x-1.5 mt-0.5">
                                <span className="text-[10px] text-slate-400">Head: {dept.head} &bull; {deptRisk?.avgScore}%</span>
                                {deptRisk && (
                                  <MaturitySparkline
                                    scores={deptRisk.historicalScores}
                                    currentScore={deptRisk.avgScore}
                                    trend={deptRisk.trend}
                                  scoreDelta={deptRisk.scoreDelta}
                                  size="xs"
                                  showSparkline={true}
                                  showArrow={true}
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {HEATMAP_PIMS_CLAUSES.map((col, colIdx) => {
                        const cell = deptCells.find(c => c.targetCode === col.clauseCode);
                        if (!cell) return <td key={col.id} className="py-3 px-4 text-center align-middle text-xs text-slate-400">-</td>;
                        const staggerIndex = (deptIdx * 2) + colIdx;
                        return renderHeatmapMatrixCell(cell, col.clauseCode, isRowActive, isColHovered(col.clauseCode), dept.id, staggerIndex);
                      })}
                    </motion.tr>
                  );
                })}
                </AnimatePresence>
              </tbody>
            </table>
          )}

          {/* Dimension Mode 5: Department Composite Scorecard */}
          {dimensionMode === 'department_composite' && (
            <div className="p-6 space-y-4">
              <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout" initial={false}>
                  {sortedDepartments
                    .filter(dept => {
                      if (departmentFilter !== 'ALL' && dept.id !== departmentFilter) return false;
                      const dRisk = departmentRiskConcentration.find(dr => dr.id === dept.id);
                      if (!dRisk) return false;
                      const isRiskMatch = selectedRiskCategories.includes(dRisk.riskTier as any);
                      if (!isRiskMatch && riskFilterDisplayMode === 'hide') return false;
                      if (searchQuery.trim()) {
                        const q = searchQuery.toLowerCase();
                        return dept.name.toLowerCase().includes(q) || dept.head.toLowerCase().includes(q);
                      }
                      return true;
                    })
                    .map((dept, deptIdx) => {
                      const dRisk = departmentRiskConcentration.find(dr => dr.id === dept.id);
                      if (!dRisk) return null;

                      const isRiskMatch = selectedRiskCategories.includes(dRisk.riskTier as any);
                      const isDimmed = !isRiskMatch && riskFilterDisplayMode === 'dim';

                      const statusClass =
                        dRisk.riskTier === 'CRITICAL'
                          ? 'status-lagging'
                          : dRisk.riskTier === 'HIGH' || dRisk.riskTier === 'MEDIUM'
                          ? 'status-attention'
                          : 'status-compliant';

                      return (
                        <motion.div
                          key={`scorecard-${dept.id}`}
                          layout
                          variants={heatmapTileVariants}
                          custom={deptIdx}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          transition={{
                            layout: heatmapTileLayoutTransition,
                            opacity: { duration: 0.2 },
                            scale: { duration: 0.2 }
                          }}
                          whileHover={{ y: -2, scale: 1.015, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => {
                            const deptCell =
                              cells.find(c => c.departmentId === dept.id && (c.status === 'NON_COMPLIANT' || c.status === 'IN_PROGRESS')) ||
                              cells.find(c => c.departmentId === dept.id);
                            if (deptCell) handleCellClick(deptCell);
                          }}
                          className={`dept-card-interactive ${statusClass} p-4 rounded-xl border cursor-pointer select-none transition-all duration-150 ${
                            isDimmed ? 'opacity-30 contrast-75' : ''
                          } ${
                            theme === 'light' ? 'bg-slate-50/80 border-slate-200 hover:bg-white' : 'bg-slate-950/80 border-slate-800 hover:bg-slate-900/90'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2.5">
                              <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: dept.avatarColor }} />
                              <div>
                                <div className="flex items-center space-x-2">
                                  <h4 className={`text-sm font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                                    {dept.name}
                                  </h4>
                                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${dRisk.avgMaturityTier.badgeClass}`}>
                                    {dRisk.avgMaturityTier.shortLabel}
                                  </span>
                                </div>
                                <span className="text-[11px] text-slate-400">Head: {dept.head} &bull; {dept.headcount} personnel</span>
                              </div>
                            </div>
                            <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                              dRisk.riskTier === 'CRITICAL'
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                : dRisk.riskTier === 'HIGH'
                                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                                : dRisk.riskTier === 'MEDIUM'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            }`}>
                              {dRisk.riskTier} RISK
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 text-center">
                            <div>
                              <span className="text-[10px] text-slate-400 block">Avg Compliance</span>
                              <div className="flex items-center justify-center space-x-1.5 mt-0.5">
                                <span className={`text-base font-extrabold font-mono ${
                                  dRisk.avgScore >= 85 ? 'text-emerald-500' : dRisk.avgScore >= 70 ? 'text-amber-500' : 'text-rose-500'
                                }`}>
                                  {dRisk.avgScore}%
                                </span>
                                <MaturitySparkline
                                  scores={dRisk.historicalScores}
                                  currentScore={dRisk.avgScore}
                                  trend={dRisk.trend}
                                  scoreDelta={dRisk.scoreDelta}
                                  size="sm"
                                  showSparkline={true}
                                  showArrow={true}
                                />
                              </div>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block">Non-Compliant</span>
                              <span className="text-base font-extrabold font-mono text-rose-500">
                                {dRisk.nonCompliant}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block">Open Findings</span>
                              <span className="text-base font-extrabold font-mono text-amber-500">
                                {dRisk.openFindings}
                              </span>
                            </div>
                          </div>

                          <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-xs">
                            <span className="text-slate-400">Risk Concentration Score:</span>
                            <span className="font-mono font-bold text-indigo-400">{dRisk.riskConcentrationScore}/100</span>
                          </div>
                        </motion.div>
                      );
                    })}
                </AnimatePresence>
              </motion.div>
            </div>
          )}

          {/* Dimension Mode 6: Interactive Reflowing Grid Tiles */}
          {dimensionMode === 'grid_tiles' && (
            <div className="p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center space-x-2.5">
                  <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                    <LayoutGrid className="w-4 h-4" />
                  </span>
                  <div>
                    <span className={`text-xs font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                      Evaluated Control Nodes Grid
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Grid tiles automatically animate and reposition with smooth spring physics when filters change
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                    {activeCells.length} / {cells.length} Active Tiles
                  </span>
                </div>
              </div>

              {activeCells.length === 0 ? (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="py-16 text-center flex flex-col items-center justify-center space-y-3"
                >
                  <AlertOctagon className="w-10 h-10 text-amber-500/80" />
                  <h4 className={`text-base font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                    No Controls Match Current Filter Criteria
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
                    No evaluated compliance controls match your selected maturity tier, risk category, or search filters.
                  </p>
                  <button
                    onClick={handleClearFilters}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 shadow-sm"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Clear Active Filters</span>
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  layout
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 min-h-[200px]"
                >
                  <AnimatePresence mode="popLayout" initial={false}>
                    {activeCells.map((cell, idx) => {
                      const cellDisplay = getCellDisplayData(cell);
                      const { isHighRisk, isDimmed, isSpotlighted, spotlightRingClass, isRiskCategoryMatch } =
                        checkCellSpotlightState(cell);
                      const isHovered =
                        hoveredCell?.deptId === cell.departmentId && hoveredCell?.targetCode === cell.targetCode;

                      return (
                        <motion.div
                          key={`grid-tile-${cell.id}`}
                          layout
                          variants={heatmapTileVariants}
                          custom={idx}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          transition={{
                            layout: heatmapTileLayoutTransition,
                            opacity: { duration: 0.2 },
                            scale: { duration: 0.2 }
                          }}
                          whileHover={{
                            scale: 1.04,
                            y: -2,
                            transition: { type: 'spring', stiffness: 450, damping: 25 }
                          }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => handleCellClick(cell)}
                          onMouseEnter={(e: React.MouseEvent) => {
                            setHoveredCell({ deptId: cell.departmentId, targetCode: cell.targetCode });
                            setHoveredTooltip({
                              cell,
                              deptName: cell.departmentName,
                              clientX: e.clientX,
                              clientY: e.clientY
                            });
                          }}
                          onMouseMove={(e: React.MouseEvent) => {
                            setHoveredTooltip(prev => prev ? { ...prev, clientX: e.clientX, clientY: e.clientY } : null);
                          }}
                          onMouseLeave={() => {
                            setHoveredCell(null);
                            setHoveredTooltip(null);
                          }}
                          className={`p-3 rounded-xl border text-xs font-medium cursor-pointer transition-colors shadow-xs relative flex flex-col justify-between select-none min-h-[140px] ${cellDisplay.bgClass} ${
                            isSpotlighted
                              ? spotlightRingClass
                              : !isRiskCategoryMatch
                              ? 'opacity-20 grayscale brightness-75 contrast-50 hover:opacity-100 hover:grayscale-0 border-dashed'
                              : isDimmed
                              ? 'opacity-35 contrast-75 hover:opacity-100 hover:contrast-100'
                              : isHovered
                              ? 'z-30 shadow-xl ring-2 ring-indigo-500 dark:ring-indigo-400 brightness-110'
                              : ''
                          }`}
                          title={`${cell.departmentName} • ${cell.targetCode}: ${cell.targetTitle} (${cellDisplay.tier.label}, ${cellDisplay.score}%)`}
                        >
                          <div>
                            {/* Department Header */}
                            <div className="flex items-center justify-between gap-1 mb-1.5">
                              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate block">
                                {cell.departmentName}
                              </span>
                              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-black/10 dark:bg-white/10 shrink-0">
                                {cell.dimensionType === 'ISO_27001'
                                  ? 'ISO'
                                  : cell.dimensionType === 'MAS_TRM'
                                  ? 'MAS'
                                  : 'PIMS'}
                              </span>
                            </div>

                            {/* Target Code & Title */}
                            <div className="font-mono font-extrabold text-xs tracking-tight text-slate-900 dark:text-white truncate">
                              {cell.targetCode}
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5" title={cell.targetTitle}>
                              {cell.targetTitle}
                            </div>
                          </div>

                          {/* Middle: Score & Level */}
                          <div className="my-2 pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${cellDisplay.tier.badgeClass}`}>
                              {cellDisplay.tier.shortLabel}
                            </span>
                            <div className="flex items-center space-x-1 font-mono font-extrabold text-xs">
                              <span>{cellDisplay.score}%</span>
                              <MaturitySparkline
                                scores={cell.historicalScores}
                                currentScore={cell.score}
                                previousScore={cell.previousScore}
                                scoreDelta={cell.scoreDelta}
                                trend={cell.trend}
                                size="xs"
                                showSparkline={trendDisplayMode !== 'arrow'}
                                showArrow={trendDisplayMode !== 'sparkline'}
                              />
                            </div>
                          </div>

                          {/* Footer: Risk Level & Open Findings */}
                          <div className="flex items-center justify-between text-[9px] font-mono pt-1 border-t border-black/5 dark:border-white/5">
                            <span
                              className={`px-1 rounded font-bold ${
                                cell.riskLevel === 'CRITICAL'
                                  ? 'text-rose-600 dark:text-rose-400'
                                  : cell.riskLevel === 'HIGH'
                                  ? 'text-orange-600 dark:text-orange-400'
                                  : cell.riskLevel === 'MEDIUM'
                                  ? 'text-amber-600 dark:text-amber-400'
                                  : 'text-emerald-600 dark:text-emerald-400'
                              }`}
                            >
                              {cell.riskLevel}
                            </span>
                            {(cell.openFindingsCount || 0) > 0 ? (
                              <span className="text-rose-600 dark:text-rose-400 font-bold">
                                {cell.openFindingsCount} NC
                              </span>
                            ) : (
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                PASS
                              </span>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Comprehensive Legends Section: Risk Categories & CMMI Maturity Levels */}
      <div className="space-y-4">
        <RiskCategoryLegend
          theme={theme}
          selectedCategories={selectedRiskCategories}
          onToggleCategory={handleToggleRiskCategory}
          onSelectAllCategories={handleSelectAllRiskCategories}
          onIsolateCategory={handleIsolateRiskCategory}
          onSetCategories={handleSetRiskCategories}
          filterDisplayMode={riskFilterDisplayMode}
          onToggleDisplayMode={setRiskFilterDisplayMode}
          distribution={riskDistribution}
          totalIntersections={activeCells.length}
          compactBarOnly={false}
        />

        {/* Comprehensive CMMI Levels 1-5 Maturity Legend */}
        <CMMILegend
          theme={theme}
          activeTierFilter={maturityTierFilter}
          onSelectTierFilter={setMaturityTierFilter}
          maturityDistribution={maturityDistribution}
          totalIntersections={activeCells.length}
        />
      </div>

      {/* Hover-based floating tooltip for grid cell chart elements */}
      {hoveredTooltip && (
        <div
          role="tooltip"
          id="compliance-heatmap-cell-hover-tooltip"
          data-testid="compliance-heatmap-hover-tooltip"
          className={`fixed z-50 pointer-events-none transition-all duration-75 shadow-2xl rounded-xl border p-3.5 backdrop-blur-md text-xs w-80 space-y-2.5 animate-in fade-in zoom-in-95 duration-100 ${
            theme === 'light'
              ? 'bg-white/95 border-slate-200 text-slate-800 shadow-slate-300/60'
              : 'bg-slate-900/95 border-slate-700/80 text-slate-100 shadow-black/80'
          }`}
          style={{
            left: `${Math.min(typeof window !== 'undefined' ? window.innerWidth - 340 : 600, Math.max(16, hoveredTooltip.clientX + 16))}px`,
            top: `${Math.min(typeof window !== 'undefined' ? window.innerHeight - 250 : 400, Math.max(16, hoveredTooltip.clientY - 12))}px`
          }}
        >
          {/* Header with Control ID and Status Badge */}
          <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  Control ID: {hoveredTooltip.cell.targetCode}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {hoveredTooltip.cell.dimensionType.replace(/_/g, ' ')}
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug mt-1 line-clamp-2">
                {hoveredTooltip.cell.targetTitle}
              </h4>
            </div>
            <div className="shrink-0 text-right">
              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                hoveredTooltip.cell.status === 'COMPLIANT'
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                  : hoveredTooltip.cell.status === 'IN_PROGRESS'
                  ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                  : hoveredTooltip.cell.status === 'NOT_APPLICABLE'
                  ? 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border border-slate-500/30'
                  : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30'
              }`}>
                {hoveredTooltip.cell.score}%
              </span>
            </div>
          </div>

          {/* Department and Current Status Grid */}
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Department:</span>
              <strong className="text-slate-900 dark:text-white font-medium truncate block">
                {hoveredTooltip.deptName}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Current Status:</span>
              <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                hoveredTooltip.cell.status === 'COMPLIANT'
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                  : hoveredTooltip.cell.status === 'IN_PROGRESS'
                  ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                  : hoveredTooltip.cell.status === 'NOT_APPLICABLE'
                  ? 'bg-slate-500/20 text-slate-600 dark:text-slate-400'
                  : 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
              }`}>
                {hoveredTooltip.cell.status.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          {/* Secondary Stats: Risk Level, Trend & CMMI Maturity */}
          {(() => {
            const riskTrend = calculateControlRiskTrend(hoveredTooltip.cell);
            return (
              <>
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1.5 border-t border-slate-100 dark:border-slate-800/80">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Risk Severity:</span>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <span className={`font-mono font-bold text-[10px] ${
                        hoveredTooltip.cell.riskLevel === 'CRITICAL' ? 'text-rose-600 dark:text-rose-400' :
                        hoveredTooltip.cell.riskLevel === 'HIGH' ? 'text-orange-600 dark:text-orange-400' :
                        hoveredTooltip.cell.riskLevel === 'MEDIUM' ? 'text-amber-600 dark:text-amber-400' :
                        'text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {hoveredTooltip.cell.riskLevel}
                      </span>
                      <span className={`inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded border ${riskTrend.badgeClass}`}>
                        {riskTrend.direction === 'INCREASED' ? (
                          <ArrowUp className="w-2.5 h-2.5" />
                        ) : riskTrend.direction === 'DECREASED' ? (
                          <ArrowDown className="w-2.5 h-2.5" />
                        ) : (
                          <Minus className="w-2.5 h-2.5" />
                        )}
                        <span>{riskTrend.direction === 'INCREASED' ? 'Increased' : riskTrend.direction === 'DECREASED' ? 'Decreased' : 'Stable'}</span>
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">CMMI Maturity:</span>
                    <span className="text-slate-800 dark:text-slate-200 font-semibold text-[10px] mt-0.5 block">
                      {getCellMaturityTier(hoveredTooltip.cell.score).shortLabel}
                    </span>
                  </div>
                </div>

                {/* Audit Cycle Risk Trend Callout */}
                <div className={`p-2 rounded-lg border flex items-center justify-between gap-2 mt-1.5 ${riskTrend.badgeClass}`} data-testid="compliance-tooltip-risk-trend">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {riskTrend.direction === 'INCREASED' ? (
                      <ArrowUp className="w-3.5 h-3.5 shrink-0 text-rose-600 dark:text-rose-400" />
                    ) : riskTrend.direction === 'DECREASED' ? (
                      <ArrowDown className="w-3.5 h-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Minus className="w-3.5 h-3.5 shrink-0 text-slate-500 dark:text-slate-400" />
                    )}
                    <div className="min-w-0">
                      <span className="text-[9px] uppercase font-bold tracking-wider block opacity-75">
                        Since Prior Audit Cycle
                      </span>
                      <span className="font-bold text-[11px] truncate block">
                        {riskTrend.label}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/70 dark:bg-slate-900/70 font-semibold border border-current/20 block">
                      {riskTrend.scoreDelta >= 0 ? `+${riskTrend.scoreDelta}%` : `${riskTrend.scoreDelta}%`}
                    </span>
                    <span className="text-[9px] opacity-70 block mt-0.5">adherence shift</span>
                  </div>
                </div>
              </>
            );
          })()}

          {/* Footer prompt */}
          <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100 dark:border-slate-800">
            <span>Controls: {hoveredTooltip.cell.controlsImplemented}/{hoveredTooltip.cell.controlsTotal} Implemented</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
              Click to inspect &rarr;
            </span>
          </div>
        </div>
      )}

      {/* Forensic Inspection Modal */}
      <ComplianceHeatmapDetailModal
        isOpen={isDetailModalOpen}
        cell={selectedCell}
        complianceOverlayActive={isComplianceOverlayActive}
        onClose={() => setIsDetailModalOpen(false)}
        onCellUpdated={handleCellUpdated}
        onNavigateModule={handleNavigate}
      />

      {/* CMMI Maturity Level & Underlying Controls Sidebar View */}
      <ComplianceHeatmapSidebar
        isOpen={isSidebarOpen}
        cell={selectedCell}
        onClose={() => setIsSidebarOpen(false)}
        onCellUpdated={handleCellUpdated}
        onOpenFullModal={handleOpenModalFromSidebar}
        onNavigateModule={handleNavigate}
        complianceOverlayActive={isComplianceOverlayActive}
      />

      {/* Inherent Risk Config Modal */}
      <ISOInherentRiskConfigModal
        isOpen={isRiskConfigModalOpen}
        onClose={() => setIsRiskConfigModalOpen(false)}
        onSaved={updated => {
          setInherentRisks(updated);
          showToast({
            title: 'Threat Weights Saved',
            message: 'Inherent risk weightings updated across compliance heatmap',
            type: 'success'
          });
        }}
      />

      {/* Screen Reader Live Announcer */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        data-testid="compliance-heatmap-live-announcer"
      >
        {screenReaderAnnouncement}
      </div>
    </div>
  );
};

export default ComplianceHeatmap;
