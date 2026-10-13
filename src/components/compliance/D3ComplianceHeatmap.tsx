// Skanda GRC — D3 Compliance Heatmap Component
// High-fidelity D3.js matrix visualization of adherence across departments and ISO controls,
// prominently highlighting areas requiring urgent remediation.

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import {
  Grid,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Filter,
  Search,
  Download,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Flame,
  Sparkles,
  ChevronRight,
  X,
  User,
  Clock,
  ExternalLink,
  SlidersHorizontal,
  RefreshCw,
  FileCheck2,
  ShieldAlert,
  ArrowUpRight,
  TrendingDown,
  Layers,
  Building
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  AdherenceHeatmapCell,
  ISOThemeType,
  AdherenceStatus,
  UrgencyLevel,
  D3ComplianceHeatmapService,
  D3_HEATMAP_DEPARTMENTS,
  D3_PRIORITY_ISO_CONTROLS,
  D3_MANDATORY_CLAUSES,
  ISOControlItem,
  DepartmentNode,
  calculateControlRiskTrend
} from '../../services/d3ComplianceHeatmapData';
import { ISO27001_2022_93_MASTER } from '../../data/iso27001_2022_masterControls';
import { useToast } from '../common/ToastContainer';
import { ComplianceHeatmapDetailModal } from '../dashboard/ComplianceHeatmapDetailModal';
import { HeatmapCellData, HeatmapStatus } from '../../services/complianceHeatmapService';

export interface D3ComplianceHeatmapProps {
  initialDepartment?: string;
  initialTheme?: string;
  initialControlFilter?: 'ALL' | 'HIGH_RISK' | 'URGENT_REMEDIATION';
  onControlFilterChange?: (filter: 'ALL' | 'HIGH_RISK' | 'URGENT_REMEDIATION') => void;
  onNavigateToRemediation?: (cell: AdherenceHeatmapCell) => void;
  hideHeaderCard?: boolean;
}

export const D3ComplianceHeatmap: React.FC<D3ComplianceHeatmapProps> = ({
  initialDepartment,
  initialTheme,
  initialControlFilter = 'ALL',
  onControlFilterChange,
  onNavigateToRemediation,
  hideHeaderCard = false
}) => {
  const { showToast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Core Data State
  const [cells, setCells] = useState<AdherenceHeatmapCell[]>(() =>
    D3ComplianceHeatmapService.getAllCells()
  );
  const [selectedCell, setSelectedCell] = useState<AdherenceHeatmapCell | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Accessibility: Keyboard Navigation & Screen Reader Live Announcements
  const [focusedCellCoord, setFocusedCellCoord] = useState<{ row: number; col: number } | null>(null);
  const [screenReaderAnnouncement, setScreenReaderAnnouncement] = useState<string>('');
  const [assertiveAnnouncement, setAssertiveAnnouncement] = useState<string>('');

  const announceToScreenReader = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (priority === 'assertive') {
      setAssertiveAnnouncement('');
      setTimeout(() => {
        setAssertiveAnnouncement(message);
      }, 20);
    } else {
      setScreenReaderAnnouncement('');
      setTimeout(() => {
        setScreenReaderAnnouncement(message);
      }, 20);
    }
  }, []);

  // Map AdherenceHeatmapCell to full HeatmapCellData for inspection modal with evidence & history
  const modalCellData: HeatmapCellData | null = useMemo(() => {
    if (!selectedCell) return null;
    const isCompliant = selectedCell.adherenceScore >= 85;
    const isInProgress = selectedCell.adherenceScore >= 50 && selectedCell.adherenceScore < 85;
    const status: HeatmapStatus = isCompliant ? 'COMPLIANT' : isInProgress ? 'IN_PROGRESS' : 'NON_COMPLIANT';

    return {
      id: selectedCell.id,
      departmentId: selectedCell.departmentId,
      departmentName: selectedCell.departmentName,
      dimensionType: 'ISO_27001',
      targetCode: selectedCell.controlCode,
      targetTitle: selectedCell.controlTitle,
      score: selectedCell.adherenceScore,
      status,
      riskLevel: selectedCell.inherentRisk,
      controlsImplemented: isCompliant ? 1 : 0,
      controlsInProgress: isInProgress ? 1 : 0,
      controlsNonCompliant: status === 'NON_COMPLIANT' ? 1 : 0,
      controlsTotal: 1,
      openFindingsCount: selectedCell.openFindingsCount || (selectedCell.isUrgentRemediation ? 1 : 0),
      openRisksCount: selectedCell.isUrgentRemediation ? 1 : 0,
      topFindings: [],
      controlOwner: selectedCell.assignedLead || 'Department Lead',
      auditorSignoff: isCompliant,
      lastAssessedAt: selectedCell.lastAssessedAt || new Date().toISOString().split('T')[0],
      previousAssessedAt: '2026-07-15',
      previousScore: Math.max(15, selectedCell.adherenceScore - 8),
      scoreDelta: 8,
      trend: 'UP',
      complianceNotes: selectedCell.auditorNotes || selectedCell.urgentReason || 'Surveillance evaluation completed.',
      historicalScores: [
        Math.max(15, selectedCell.adherenceScore - 30),
        Math.max(25, selectedCell.adherenceScore - 20),
        Math.max(40, selectedCell.adherenceScore - 12),
        Math.max(50, selectedCell.adherenceScore - 6),
        selectedCell.adherenceScore
      ],
      keyControls: [
        {
          code: selectedCell.controlCode,
          title: selectedCell.controlTitle,
          status,
          assignedLead: selectedCell.assignedLead,
          mandatory: true,
          remediationSlaDays: selectedCell.isUrgentRemediation ? 7 : 30,
          nonComplianceReason: selectedCell.urgentReason || undefined,
          evidenceRef: `DOC-VERIFIED-${selectedCell.controlCode.replace(/[^a-zA-Z0-9]/g, '')}`
        }
      ],
      evidenceArtifacts: [
        {
          id: `EVD-${selectedCell.controlCode.replace(/[^a-zA-Z0-9]/g, '')}-1`,
          name: `${selectedCell.controlCode} Policy Enforcement Workpaper`,
          type: 'Audit Workpaper',
          verifiedAt: selectedCell.lastAssessedAt,
          sha256Digest: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
        },
        {
          id: `EVD-${selectedCell.controlCode.replace(/[^a-zA-Z0-9]/g, '')}-2`,
          name: `${selectedCell.controlCode} Automated SIEM / Telemetry Attestation`,
          type: 'Telemetry Log',
          verifiedAt: selectedCell.lastAssessedAt,
          sha256Digest: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069'
        }
      ],
      outstandingTasks: selectedCell.isUrgentRemediation
        ? [
            {
              id: `TASK-${selectedCell.id}-1`,
              title: selectedCell.capaAction || `Execute remediation for ${selectedCell.controlCode} deficiency`,
              description: selectedCell.urgentReason || 'Corrective action plan assigned.',
              status: 'PENDING',
              priority: 'CRITICAL',
              assignee: selectedCell.assignedLead,
              dueDate: selectedCell.targetRemediationDate || '2026-10-15',
              relatedControlCode: selectedCell.controlCode,
              capaRef: selectedCell.capaTicketId || 'CAPA-2026-004',
              daysOutstanding: selectedCell.overdueDays || 0
            }
          ]
        : []
    };
  }, [selectedCell]);

  // Filters & View Controls
  const [selectedDepartment, setSelectedDepartment] = useState<string>(initialDepartment || 'ALL');
  const [selectedTheme, setSelectedTheme] = useState<string>(initialTheme || 'ALL');
  const [controlFilterMode, setControlFilterMode] = useState<'ALL' | 'HIGH_RISK' | 'URGENT_REMEDIATION'>(
    initialControlFilter
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [urgentOnly, setUrgentOnly] = useState<boolean>(false);
  const [controlScope, setControlScope] = useState<'PRIORITY' | 'ALL_ANNEX_A' | 'CLAUSES'>('PRIORITY');
  const [sortBy, setSortBy] = useState<'URGENT_FIRST' | 'LOWEST_ADHERENCE' | 'DEPT_NAME'>('URGENT_FIRST');
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Sync external initialControlFilter prop
  useEffect(() => {
    if (initialControlFilter && initialControlFilter !== controlFilterMode) {
      setControlFilterMode(initialControlFilter);
    }
  }, [initialControlFilter]);

  const handleControlFilterChange = (mode: 'ALL' | 'HIGH_RISK' | 'URGENT_REMEDIATION') => {
    setControlFilterMode(mode);
    onControlFilterChange?.(mode);
    if (mode === 'URGENT_REMEDIATION') {
      setUrgentOnly(true);
    } else {
      setUrgentOnly(false);
    }
  };

  // Editable Drawer State
  const [editScore, setEditScore] = useState<number>(0);
  const [editNotes, setEditNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // When drawer opens for a selected cell, sync form state
  useEffect(() => {
    if (selectedCell) {
      setEditScore(selectedCell.adherenceScore);
      setEditNotes(selectedCell.auditorNotes || '');
    }
  }, [selectedCell]);

  // Sync initial department filter if changed externally
  useEffect(() => {
    if (initialDepartment) {
      setSelectedDepartment(initialDepartment);
    }
  }, [initialDepartment]);

  // Compute Active Controls list based on controlScope
  const activeControls = useMemo<ISOControlItem[]>(() => {
    if (controlScope === 'CLAUSES') {
      return D3_MANDATORY_CLAUSES;
    }
    if (controlScope === 'ALL_ANNEX_A') {
      // Map all 93 controls from master
      return ISO27001_2022_93_MASTER.map(m => ({
        code: m.controlCode,
        title: m.title,
        shortTitle: `${m.controlCode} ${m.title.slice(0, 18)}...`,
        theme: m.theme as ISOThemeType,
        inherentRisk: (m.defaultMaturity <= 2 ? 'CRITICAL' : m.defaultMaturity === 3 ? 'HIGH' : 'MEDIUM') as any,
        isPriority: m.defaultMaturity <= 3,
        description: m.description,
        evidenceRequirements: m.evidenceRequirements,
        verificationProcedure: m.auditorVerificationProcedure
      }));
    }
    // Default: 24 priority controls
    return D3_PRIORITY_ISO_CONTROLS;
  }, [controlScope]);

  // Filter and sort departments
  const activeDepartments = useMemo<DepartmentNode[]>(() => {
    let depts = [...D3_HEATMAP_DEPARTMENTS];

    if (selectedDepartment !== 'ALL') {
      depts = depts.filter(d => d.id === selectedDepartment);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      depts = depts.filter(d =>
        d.name.toLowerCase().includes(q) ||
        d.head.toLowerCase().includes(q)
      );
    }

    // Sort departments
    if (sortBy === 'URGENT_FIRST') {
      depts.sort((a, b) => {
        const urgentA = cells.filter(c => c.departmentId === a.id && c.isUrgentRemediation).length;
        const urgentB = cells.filter(c => c.departmentId === b.id && c.isUrgentRemediation).length;
        if (urgentB !== urgentA) return urgentB - urgentA;
        return a.name.localeCompare(b.name);
      });
    } else if (sortBy === 'LOWEST_ADHERENCE') {
      depts.sort((a, b) => {
        const avgA = d3.mean(cells.filter(c => c.departmentId === a.id), c => c.adherenceScore) || 0;
        const avgB = d3.mean(cells.filter(c => c.departmentId === b.id), c => c.adherenceScore) || 0;
        return avgA - avgB;
      });
    } else {
      depts.sort((a, b) => a.name.localeCompare(b.name));
    }

    return depts;
  }, [selectedDepartment, searchQuery, sortBy, cells]);

  // Control counts for filter options
  const highRiskControlsCount = useMemo(() => {
    return activeControls.filter(c => {
      const ctrlCells = cells.filter(cell => cell.controlCode === c.code);
      return c.inherentRisk === 'CRITICAL' || c.inherentRisk === 'HIGH' || ctrlCells.some(cell => cell.adherenceScore < 60);
    }).length;
  }, [activeControls, cells]);

  const urgentControlsCount = useMemo(() => {
    return activeControls.filter(c => cells.some(cell => cell.controlCode === c.code && cell.isUrgentRemediation)).length;
  }, [activeControls, cells]);

  // Filter controls by theme, search query, and risk/urgency mode
  const filteredControls = useMemo<ISOControlItem[]>(() => {
    let list = [...activeControls];

    // Filter by Risk & Urgency: 'ALL' | 'HIGH_RISK' | 'URGENT_REMEDIATION'
    if (controlFilterMode === 'HIGH_RISK') {
      list = list.filter(c => {
        const ctrlCells = cells.filter(cell => cell.controlCode === c.code);
        const hasCriticalInherent = c.inherentRisk === 'CRITICAL' || c.inherentRisk === 'HIGH';
        const hasLowAdherence = ctrlCells.some(cell => cell.adherenceScore < 60 || cell.inherentRisk === 'CRITICAL' || cell.inherentRisk === 'HIGH');
        return hasCriticalInherent || hasLowAdherence;
      });
    } else if (controlFilterMode === 'URGENT_REMEDIATION') {
      list = list.filter(c => {
        return cells.some(cell => cell.controlCode === c.code && cell.isUrgentRemediation);
      });
    }

    if (selectedTheme !== 'ALL') {
      list = list.filter(c => c.theme === selectedTheme);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(c =>
        c.code.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q)
      );
    }

    return list;
  }, [activeControls, controlFilterMode, selectedTheme, searchQuery, cells]);

  // Metrics summary
  const metrics = useMemo(() => D3ComplianceHeatmapService.calculateMetrics(cells), [cells]);

  // Urgent remediation items list for immediate actioning banner
  const urgentRemediationCells = useMemo(() => {
    return cells
      .filter(c => c.isUrgentRemediation)
      .sort((a, b) => (b.overdueDays || 0) - (a.overdueDays || 0));
  }, [cells]);

  // Cell Status Updates & Direct Keyboard Actions
  const handleUpdateCellStatus = useCallback((cellId: string, newStatus: AdherenceStatus, newScore: number) => {
    const updatedList = D3ComplianceHeatmapService.updateCell(cellId, {
      status: newStatus,
      adherenceScore: newScore,
      isUrgentRemediation: newStatus === 'COMPLIANT' ? false : undefined
    });
    setCells([...updatedList]);
    const target = updatedList.find(c => c.id === cellId);
    if (target) {
      if (selectedCell?.id === cellId) {
        setSelectedCell(target);
      }
      announceToScreenReader(
        `Status updated: Control ${target.controlCode} in ${target.departmentName} is now ${target.status.replace(/_/g, ' ')} with ${target.adherenceScore}% adherence.`,
        'assertive'
      );
      showToast({
        title: 'Status Updated',
        message: `${target.controlCode} marked ${target.status.replace(/_/g, ' ')} (${target.adherenceScore}%)`,
        type: 'info'
      });
    }
  }, [selectedCell, announceToScreenReader, showToast]);

  const handleToggleUrgentRemediation = useCallback((cellId: string) => {
    const current = cells.find(c => c.id === cellId);
    if (!current) return;
    const nextUrgent = !current.isUrgentRemediation;
    const updatedList = D3ComplianceHeatmapService.updateCell(cellId, {
      isUrgentRemediation: nextUrgent,
      urgencyLevel: nextUrgent ? 'HIGH_URGENCY' : 'NONE'
    });
    setCells([...updatedList]);
    const target = updatedList.find(c => c.id === cellId);
    if (target) {
      if (selectedCell?.id === cellId) {
        setSelectedCell(target);
      }
      const message = nextUrgent
        ? `Status updated: Control ${target.controlCode} in ${target.departmentName} flagged for Urgent Remediation.`
        : `Status updated: Urgent remediation cleared for Control ${target.controlCode} in ${target.departmentName}.`;
      announceToScreenReader(message, 'assertive');
      showToast({
        title: nextUrgent ? 'Urgent Remediation Flagged' : 'Urgent Remediation Cleared',
        message: `${target.controlCode} (${target.departmentName})`,
        type: nextUrgent ? 'warning' : 'success'
      });
    }
  }, [cells, selectedCell, announceToScreenReader, showToast]);

  const updateCellStatusRef = useRef(handleUpdateCellStatus);
  updateCellStatusRef.current = handleUpdateCellStatus;

  const toggleUrgentRef = useRef(handleToggleUrgentRemediation);
  toggleUrgentRef.current = handleToggleUrgentRemediation;

  // Main D3 Rendering Effect
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const containerWidth = container.clientWidth || 980;

    // Calculate dimensions
    const leftMargin = 220; // Space for department names
    const topMargin = 110;  // Space for angled ISO control labels
    const rightMargin = 40;
    const bottomMargin = 40;

    const minCellWidth = controlScope === 'ALL_ANNEX_A' ? 24 : 38;
    const calculatedWidth = Math.max(
      containerWidth,
      leftMargin + filteredControls.length * minCellWidth + rightMargin
    );
    const cellHeight = Math.max(34, Math.min(48, 360 / Math.max(1, activeDepartments.length)));
    const calculatedHeight = topMargin + activeDepartments.length * cellHeight + bottomMargin;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg
      .attr('width', calculatedWidth * zoomLevel)
      .attr('height', calculatedHeight * zoomLevel)
      .attr('viewBox', `0 0 ${calculatedWidth} ${calculatedHeight}`)
      .attr('class', 'select-none font-sans overflow-visible transition-all duration-200 outline-none')
      .attr('role', 'grid')
      .attr('aria-label', 'ISO 27001 Departmental Regulatory Compliance and Adherence Heatmap')
      .attr('aria-rowcount', activeDepartments.length + 1)
      .attr('aria-colcount', filteredControls.length)
      .attr('aria-describedby', 'd3-heatmap-keyboard-instructions')
      .attr('tabindex', 0);

    svg.on('focus', (e: FocusEvent) => {
      if (e.target === svg.node()) {
        const targetCoord = focusedCellCoord || { row: 0, col: 0 };
        const firstCell = svg.select<SVGGElement>(`[data-row="${targetCoord.row}"][data-col="${targetCoord.col}"]`).node();
        firstCell?.focus();
      }
    });

    // Defs for D3 Glow & Patterns
    const defs = svg.append('defs');

    // Urgent remediation pulsing red glow
    const urgentGlow = defs.append('filter')
      .attr('id', 'urgent-remediation-glow')
      .attr('x', '-30%')
      .attr('y', '-30%')
      .attr('width', '160%')
      .attr('height', '160%');
    urgentGlow.append('feGaussianBlur')
      .attr('stdDeviation', '3.5')
      .attr('result', 'coloredBlur');
    const feMerge = urgentGlow.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Hatch pattern for Not Applicable cells
    const naPattern = defs.append('pattern')
      .attr('id', 'na-hatch-pattern')
      .attr('width', '6')
      .attr('height', '6')
      .attr('patternTransform', 'rotate(45 0 0)')
      .attr('patternUnits', 'userSpaceOnUse');
    naPattern.append('line')
      .attr('x1', '0')
      .attr('y1', '0')
      .attr('x2', '0')
      .attr('y2', '6')
      .attr('stroke', '#94A3B8')
      .attr('stroke-width', '1.5')
      .attr('opacity', '0.5');

    // Scales
    const xScale = d3.scaleBand<string>()
      .domain(filteredControls.map(c => c.code))
      .range([leftMargin, calculatedWidth - rightMargin])
      .padding(0.1);

    const yScale = d3.scaleBand<string>()
      .domain(activeDepartments.map(d => d.id))
      .range([topMargin, calculatedHeight - bottomMargin])
      .padding(0.12);

    // Root Group
    const rootG = svg.append('g').attr('class', 'heatmap-root');

    // Theme header indicator background strips
    const themeColorMap: Record<string, string> = {
      Organizational: '#3B82F6', // Blue
      People: '#8B5CF6',         // Purple
      Physical: '#F59E0B',       // Amber
      Technological: '#0284C7',  // Sky
      'Mandatory Clause': '#10B981' // Emerald
    };

    // Render Column Headers (ISO Controls)
    const colHeaders = rootG.append('g')
      .attr('class', 'column-headers')
      .attr('role', 'row')
      .attr('aria-rowindex', 1)
      .attr('aria-label', 'Controls column header row');

    filteredControls.forEach((ctrl, colIndex) => {
      const x = (xScale(ctrl.code) || 0) + xScale.bandwidth() / 2;
      const colG = colHeaders.append('g')
        .attr('transform', `translate(${x}, ${topMargin - 12})`)
        .attr('class', `col-header col-header-${ctrl.code.replace(/[^a-zA-Z0-9]/g, '_')} cursor-pointer`)
        .attr('role', 'columnheader')
        .attr('aria-colindex', colIndex + 1)
        .attr('aria-label', `Control ${ctrl.code}: ${ctrl.title}, Theme ${ctrl.theme}, Inherent Risk ${ctrl.inherentRisk}`)
        .on('click', () => {
          setSelectedTheme(ctrl.theme);
        });

      // Small theme colored badge dot
      colG.append('circle')
        .attr('cx', 0)
        .attr('cy', -4)
        .attr('r', 3)
        .attr('fill', themeColorMap[ctrl.theme] || '#64748B');

      // Angled text label
      colG.append('text')
        .attr('transform', 'rotate(-45)')
        .attr('x', 6)
        .attr('y', 0)
        .attr('text-anchor', 'start')
        .attr('class', 'text-[11px] font-mono font-semibold fill-slate-700 dark:fill-slate-300 hover:fill-indigo-600 dark:hover:fill-indigo-400')
        .text(ctrl.code);
    });

    // Render Row Headers (Departments)
    const rowHeaders = rootG.append('g')
      .attr('class', 'row-headers')
      .attr('role', 'presentation');

    activeDepartments.forEach((dept, rowIndex) => {
      const y = (yScale(dept.id) || 0) + yScale.bandwidth() / 2;
      const deptUrgentCount = cells.filter(c => c.departmentId === dept.id && c.isUrgentRemediation).length;

      const rowG = rowHeaders.append('g')
        .attr('transform', `translate(${leftMargin - 14}, ${y})`)
        .attr('class', `row-header row-header-${dept.id} cursor-pointer`)
        .attr('role', 'rowheader')
        .attr('aria-rowindex', rowIndex + 2)
        .attr('aria-label', `${dept.name} department row. Department Head: ${dept.head}.${deptUrgentCount > 0 ? ` ${deptUrgentCount} urgent remediation issues.` : ''}`)
        .on('click', () => {
          setSelectedDepartment(dept.id);
        });

      // Department Name
      rowG.append('text')
        .attr('x', 0)
        .attr('y', -3)
        .attr('text-anchor', 'end')
        .attr('class', 'text-xs font-semibold fill-slate-900 dark:fill-slate-100 hover:fill-indigo-600')
        .text(dept.shortName || dept.name);

      // Sub-line: Lead & urgent alert count
      const subG = rowG.append('text')
        .attr('x', 0)
        .attr('y', 11)
        .attr('text-anchor', 'end')
        .attr('class', 'text-[10px] font-sans fill-slate-500 dark:fill-slate-400');

      if (deptUrgentCount > 0) {
        subG.text(`${deptUrgentCount} Urgent`);
        subG.attr('class', 'text-[10px] font-semibold font-mono fill-rose-600 dark:fill-rose-400');
      } else {
        subG.text(`${dept.head.split(' ')[0]}`);
      }
    });

    // Color Interpolator function
    const getCellColor = (score: number, status: AdherenceStatus) => {
      if (status === 'NOT_APPLICABLE') return '#E2E8F0';
      if (score >= 85) return '#059669'; // Emerald-600 (WCAG AA Compliant)
      if (score >= 50) return '#D97706'; // Amber-600
      return '#DC2626';                  // Rose/Red-600 (Non-compliant / Urgent)
    };

    // Render Heatmap Cells
    const cellsG = rootG.append('g')
      .attr('class', 'heatmap-cells')
      .attr('role', 'rowgroup');

    activeDepartments.forEach((dept, rowIndex) => {
      const rowG = cellsG.append('g')
        .attr('class', `heatmap-row heatmap-row-${dept.id}`)
        .attr('role', 'row')
        .attr('aria-rowindex', rowIndex + 2)
        .attr('aria-label', `${dept.name} department adherence row`);

      filteredControls.forEach((ctrl, colIndex) => {
        // Find cell data or generate fallback
        const cell = cells.find(c => c.departmentId === dept.id && c.controlCode === ctrl.code) || {
          id: `cell-${dept.id}-${ctrl.code}`,
          departmentId: dept.id,
          departmentName: dept.name,
          departmentHead: dept.head,
          controlCode: ctrl.code,
          controlTitle: ctrl.title,
          theme: ctrl.theme,
          adherenceScore: 78,
          cmmiLevel: 3,
          status: 'IN_PROGRESS' as AdherenceStatus,
          inherentRisk: ctrl.inherentRisk,
          isUrgentRemediation: false,
          urgencyLevel: 'NONE' as UrgencyLevel,
          openFindingsCount: 0,
          assignedLead: dept.head,
          evidenceStatus: 'VERIFIED' as const,
          lastAssessedAt: '2026-09-24'
        };

        const x = xScale(ctrl.code);
        const y = yScale(dept.id);
        if (x === undefined || y === undefined) return;

        const cellW = xScale.bandwidth();
        const cellH = yScale.bandwidth();

        // Check dimming when urgentOnly is toggled
        const isDimmed = urgentOnly && !cell.isUrgentRemediation;

        const isCurrentFocus = focusedCellCoord
          ? focusedCellCoord.row === rowIndex && focusedCellCoord.col === colIndex
          : rowIndex === 0 && colIndex === 0;

        const urgentNotice = cell.isUrgentRemediation ? ', Requires Urgent Remediation' : '';
        const cellAriaLabel = `Control ${ctrl.code}: ${ctrl.title}. Department: ${dept.name}. Current Adherence: ${cell.adherenceScore}%, Status: ${cell.status.replace(/_/g, ' ')}, Inherent Risk: ${ctrl.inherentRisk}${urgentNotice}. Row ${rowIndex + 1} of ${activeDepartments.length}, Column ${colIndex + 1} of ${filteredControls.length}.`;

        const cellG = rowG.append('g')
          .attr('transform', `translate(${x}, ${y})`)
          .attr('class', `cell-group cell-group-${dept.id}-${ctrl.code.replace(/[^a-zA-Z0-9]/g, '_')}`)
          .attr('role', 'gridcell')
          .attr('tabindex', isCurrentFocus ? 0 : -1)
          .attr('aria-rowindex', rowIndex + 2)
          .attr('aria-colindex', colIndex + 1)
          .attr('aria-label', cellAriaLabel)
          .attr('aria-selected', selectedCell?.id === cell.id ? 'true' : 'false')
          .attr('aria-roledescription', 'compliance control cell')
          .attr('aria-description', `Adherence: ${cell.adherenceScore}%, Status: ${cell.status.replace(/_/g, ' ')}. Press Enter or Space to open inspection modal. Press C for Compliant, I for In Progress, N for Non-Compliant, U to toggle urgent.`)
          .attr('aria-keyshortcuts', 'ArrowUp ArrowDown ArrowLeft ArrowRight Enter Space Home End c i n u')
          .attr('data-row', rowIndex)
          .attr('data-col', colIndex)
          .attr('data-cell-id', cell.id)
          .attr('data-control-code', ctrl.code)
          .attr('data-department-id', dept.id)
          .style('opacity', isDimmed ? 0.15 : 1)
          .style('cursor', 'pointer')
          .style('outline', 'none');

        // Main cell rectangle
        const rect = cellG.append('rect')
          .attr('width', cellW)
          .attr('height', cellH)
          .attr('rx', 4)
          .attr('ry', 4)
          .attr('fill', getCellColor(cell.adherenceScore, cell.status))
          .attr('stroke', cell.isUrgentRemediation ? '#EF4444' : 'rgba(255,255,255,0.15)')
          .attr('stroke-width', cell.isUrgentRemediation ? 2.5 : 1)
          .attr('class', 'transition-all duration-150');

        // High-contrast focus ring for WCAG 2.4.11 / keyboard accessibility
        const focusRing = cellG.append('rect')
          .attr('class', 'cell-focus-ring pointer-events-none')
          .attr('x', -2.5)
          .attr('y', -2.5)
          .attr('width', cellW + 5)
          .attr('height', cellH + 5)
          .attr('rx', 6)
          .attr('ry', 6)
          .attr('fill', 'none')
          .attr('stroke', '#6366F1')
          .attr('stroke-width', 3)
          .style('display', isCurrentFocus && focusedCellCoord ? 'block' : 'none');

        // If urgent, apply filter and animated pulse ring
        if (cell.isUrgentRemediation) {
          rect.attr('filter', 'url(#urgent-remediation-glow)');

          // Warning badge icon in top-right of cell
          if (cellW >= 24) {
            cellG.append('circle')
              .attr('cx', cellW - 6)
              .attr('cy', 6)
              .attr('r', 4.5)
              .attr('fill', '#991B1B')
              .attr('stroke', '#FEE2E2')
              .attr('stroke-width', 1);

            cellG.append('text')
              .attr('x', cellW - 6)
              .attr('y', 9)
              .attr('text-anchor', 'middle')
              .attr('class', 'text-[8px] font-black fill-white pointer-events-none')
              .text('!');
          }
        }

        // Numeric text label inside cell if wide enough
        if (cellW >= 28) {
          cellG.append('text')
            .attr('x', cellW / 2)
            .attr('y', cellH / 2 + 4)
            .attr('text-anchor', 'middle')
            .attr('class', 'text-[11px] font-mono font-bold fill-white pointer-events-none drop-shadow-xs')
            .text(`${cell.adherenceScore}%`);
        }

        // Tooltip rendering helper with support for mouse and keyboard coordinates
        const updateTooltip = (event?: MouseEvent, customCoords?: { x: number; y: number }) => {
          if (!tooltipRef.current || !containerRef.current) return;
          const tooltip = tooltipRef.current;
          tooltip.style.display = 'block';

          const statusColor =
            cell.status === 'COMPLIANT'
              ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
              : cell.status === 'IN_PROGRESS'
              ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30'
              : 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30';

          const riskTrend = calculateControlRiskTrend(cell);

          const trendArrowIcon =
            riskTrend.direction === 'INCREASED'
              ? `<svg class="w-3.5 h-3.5 shrink-0 text-rose-600 dark:text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>`
              : riskTrend.direction === 'DECREASED'
              ? `<svg class="w-3.5 h-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12l7 7 7-7"/></svg>`
              : `<svg class="w-3.5 h-3.5 shrink-0 text-slate-500 dark:text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg>`;

          const trendCompactBadge =
            riskTrend.direction === 'INCREASED'
              ? `<span class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30">
                  <span class="text-rose-600 dark:text-rose-400 font-black">&uarr;</span> Risk Increased
                </span>`
              : riskTrend.direction === 'DECREASED'
              ? `<span class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                  <span class="text-emerald-600 dark:text-emerald-400 font-black">&darr;</span> Risk Decreased
                </span>`
              : `<span class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-500/15 text-slate-700 dark:text-slate-300 border border-slate-500/30">
                  <span class="text-slate-500">&rarr;</span> Risk Stable
                </span>`;

          const tooltipHtml = `
            <div class="p-3.5 space-y-2 text-xs" data-testid="d3-heatmap-cell-tooltip" role="tooltip">
              <div class="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-2">
                <div>
                  <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Control ID: ${ctrl.code} · ${ctrl.theme}
                  </span>
                  <h4 class="text-sm font-bold text-slate-900 dark:text-white leading-tight mt-0.5">
                    ${ctrl.title}
                  </h4>
                </div>
                <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  cell.status === 'COMPLIANT'
                    ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                    : cell.status === 'IN_PROGRESS'
                    ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                    : 'bg-rose-500/20 text-rose-700 dark:text-rose-300'
                }">
                  ${cell.adherenceScore}% Adherence
                </span>
              </div>

              <div class="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                <div>
                  <span class="text-slate-400 block text-[10px]">Department:</span>
                  <strong class="text-slate-900 dark:text-white">${dept.name}</strong>
                </div>
                <div>
                  <span class="text-slate-400 block text-[10px]">Current Status:</span>
                  <span class="inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${statusColor}">
                    ${cell.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-300 pt-1">
                <div>
                  <span class="text-slate-400 block text-[10px]">Inherent Risk:</span>
                  <div class="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <strong class="text-slate-900 dark:text-white font-mono">${ctrl.inherentRisk}</strong>
                    ${trendCompactBadge}
                  </div>
                </div>
                <div>
                  <span class="text-slate-400 block text-[10px]">CMMI Maturity:</span>
                  <strong class="text-slate-900 dark:text-white mt-0.5 block">Level ${cell.cmmiLevel} / 5</strong>
                </div>
              </div>

              <!-- Dedicated Risk Trend Callout -->
              <div class="p-2 rounded-lg border flex items-center justify-between gap-2 mt-1 ${riskTrend.badgeClass}" data-testid="tooltip-risk-trend-indicator">
                <div class="flex items-center gap-1.5 min-w-0">
                  ${trendArrowIcon}
                  <div class="min-w-0">
                    <span class="text-[9px] uppercase font-bold tracking-wider block opacity-75">
                      Since Prior Audit Cycle
                    </span>
                    <span class="font-bold text-[11px] truncate block">
                      ${riskTrend.label}
                    </span>
                  </div>
                </div>
                <div class="text-right shrink-0">
                  <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/70 dark:bg-slate-900/70 font-semibold border border-current/20 block">
                    ${riskTrend.scoreDelta >= 0 ? `+${riskTrend.scoreDelta}%` : `${riskTrend.scoreDelta}%`}
                  </span>
                  <span class="text-[9px] opacity-70 block mt-0.5">adherence shift</span>
                </div>
              </div>

              ${
                cell.isUrgentRemediation
                  ? `
                <div class="mt-2 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-800/80 text-rose-900 dark:text-rose-200 space-y-1">
                  <div class="flex items-center gap-1.5 font-bold text-rose-700 dark:text-rose-300 text-[11px]">
                    <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2zm0 3.8L20.2 19H3.8L12 5.8zM11 10h2v4h-2v-4zm0 6h2v2h-2v-2z"/></svg>
                    <span>URGENT REMEDIATION REQUIRED</span>
                  </div>
                  <p class="text-[11px] leading-relaxed text-rose-800 dark:text-rose-300">
                    ${cell.urgentReason || 'Critical non-compliance detected. SLA breached.'}
                  </p>
                  <div class="flex items-center justify-between text-[10px] pt-1 font-mono text-rose-700 dark:text-rose-400 border-t border-rose-200/60 dark:border-rose-900/60">
                    <span>SLA: ${cell.slaStatus || 'BREACHED'}</span>
                    <span>Overdue: ${cell.overdueDays || 0} days</span>
                    <span>CAPA: ${cell.capaTicketId || 'PENDING'}</span>
                  </div>
                </div>
                `
                  : ''
              }

              <div class="pt-1.5 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100 dark:border-slate-800">
                <span>Owner: ${cell.assignedLead}</span>
                <span class="text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1">
                  Click or press Enter to inspect detailed history &amp; evidence &rarr;
                </span>
              </div>
            </div>
          `;

          tooltip.innerHTML = tooltipHtml;

          // Position tooltip relative to container
          const bounds = containerRef.current.getBoundingClientRect();
          let mouseX = 0;
          let mouseY = 0;

          if (customCoords) {
            mouseX = customCoords.x;
            mouseY = customCoords.y;
          } else if (event) {
            mouseX = event.clientX - bounds.left;
            mouseY = event.clientY - bounds.top;
          }

          let tooltipX = mouseX + 16;
          let tooltipY = mouseY - 10;

          if (tooltipX + 340 > bounds.width) {
            tooltipX = mouseX - 350;
          }
          if (tooltipY + 260 > bounds.height) {
            tooltipY = mouseY - 240;
          }

          tooltip.style.left = `${Math.max(10, tooltipX)}px`;
          tooltip.style.top = `${Math.max(10, tooltipY)}px`;
        };

        // Focus Event (Keyboard Navigation)
        cellG.on('focus', () => {
          setFocusedCellCoord({ row: rowIndex, col: colIndex });

          // Update roving tabindexes
          svg.selectAll('.cell-group').attr('tabindex', -1);
          cellG.attr('tabindex', 0);

          // Update visual focus rings
          svg.selectAll('.cell-focus-ring').style('display', 'none');
          focusRing.style('display', 'block');

          // Highlight crosshairs
          svg.selectAll('.row-header').style('opacity', 0.4);
          svg.selectAll(`.row-header-${dept.id}`).style('opacity', 1).style('font-weight', 'bold');

          svg.selectAll('.col-header').style('opacity', 0.4);
          svg.selectAll(`.col-header-${ctrl.code.replace(/[^a-zA-Z0-9]/g, '_')}`).style('opacity', 1).style('font-weight', 'bold');

          svg.selectAll('.cell-group').style('opacity', 0.3);
          cellG.style('opacity', 1);

          // Update tooltip at cell center
          updateTooltip(undefined, { x: x + cellW / 2, y: y + cellH / 2 });

          // Announce to Screen Readers via ARIA live region
          announceToScreenReader(
            `Focused: Control ${ctrl.code} ${ctrl.title}, Department ${dept.name}, Status ${cell.status.replace(/_/g, ' ')}, Adherence ${cell.adherenceScore}%, Inherent Risk ${ctrl.inherentRisk}.${cell.isUrgentRemediation ? ' Urgent remediation required.' : ''} Row ${rowIndex + 1} of ${activeDepartments.length}, Column ${colIndex + 1} of ${filteredControls.length}. Press Enter or Space to open inspection modal.`
          );
        });

        cellG.on('blur', () => {
          focusRing.style('display', 'none');
          svg.selectAll('.row-header').style('opacity', 1).style('font-weight', 'normal');
          svg.selectAll('.col-header').style('opacity', 1).style('font-weight', 'normal');
          svg.selectAll('.cell-group').style('opacity', isDimmed ? 0.15 : 1);

          if (tooltipRef.current) {
            tooltipRef.current.style.display = 'none';
          }
        });

        // Keydown Handler for Arrow Keys & Actions
        cellG.on('keydown', (event: KeyboardEvent) => {
          let nextRow = rowIndex;
          let nextCol = colIndex;
          let isHandled = false;

          switch (event.key) {
            case 'ArrowRight':
              nextCol = Math.min(filteredControls.length - 1, colIndex + 1);
              isHandled = true;
              break;
            case 'ArrowLeft':
              nextCol = Math.max(0, colIndex - 1);
              isHandled = true;
              break;
            case 'ArrowDown':
              nextRow = Math.min(activeDepartments.length - 1, rowIndex + 1);
              isHandled = true;
              break;
            case 'ArrowUp':
              nextRow = Math.max(0, rowIndex - 1);
              isHandled = true;
              break;
            case 'Home':
              nextCol = 0;
              isHandled = true;
              break;
            case 'End':
              nextCol = filteredControls.length - 1;
              isHandled = true;
              break;
            case 'PageUp':
              nextRow = 0;
              isHandled = true;
              break;
            case 'PageDown':
              nextRow = activeDepartments.length - 1;
              isHandled = true;
              break;
            case 'Enter':
            case ' ':
              event.preventDefault();
              setSelectedCell(cell);
              setIsModalOpen(true);
              announceToScreenReader(
                `Opening forensic inspection modal for Control ${ctrl.code} in ${dept.name}. Displays detailed history and specific evidence logs.`,
                'assertive'
              );
              isHandled = true;
              break;
            case 'c':
            case 'C':
              event.preventDefault();
              updateCellStatusRef.current(cell.id, 'COMPLIANT', 90);
              isHandled = true;
              break;
            case 'i':
            case 'I':
              event.preventDefault();
              updateCellStatusRef.current(cell.id, 'IN_PROGRESS', 65);
              isHandled = true;
              break;
            case 'n':
            case 'N':
              event.preventDefault();
              updateCellStatusRef.current(cell.id, 'NON_COMPLIANT', 35);
              isHandled = true;
              break;
            case 'u':
            case 'U':
              event.preventDefault();
              toggleUrgentRef.current(cell.id);
              isHandled = true;
              break;
            case '+':
            case '=': {
              event.preventDefault();
              const newScore = Math.min(100, cell.adherenceScore + 5);
              const newStatus = newScore >= 85 ? 'COMPLIANT' : newScore >= 50 ? 'IN_PROGRESS' : 'NON_COMPLIANT';
              updateCellStatusRef.current(cell.id, newStatus, newScore);
              isHandled = true;
              break;
            }
            case '-':
            case '_': {
              event.preventDefault();
              const newScore = Math.max(0, cell.adherenceScore - 5);
              const newStatus = newScore >= 85 ? 'COMPLIANT' : newScore >= 50 ? 'IN_PROGRESS' : 'NON_COMPLIANT';
              updateCellStatusRef.current(cell.id, newStatus, newScore);
              isHandled = true;
              break;
            }
            case 'd':
            case 'D':
              event.preventDefault();
              setSelectedCell(cell);
              setDrawerOpen(prev => !prev);
              announceToScreenReader(
                `Side remediation drawer toggled for Control ${ctrl.code} in ${dept.name}.`,
                'polite'
              );
              isHandled = true;
              break;
            default:
              break;
          }

          if (isHandled) {
            event.preventDefault();
            if (nextRow !== rowIndex || nextCol !== colIndex) {
              const targetSelection = svg.select<SVGGElement>(`[data-row="${nextRow}"][data-col="${nextCol}"]`);
              const targetNode = targetSelection.node();
              if (targetNode) {
                setFocusedCellCoord({ row: nextRow, col: nextCol });
                targetNode.focus();

                // Auto-scroll container if cell is out of view (horizontal and vertical)
                if (containerRef.current) {
                  const cont = containerRef.current;
                  const cellB = targetNode.getBoundingClientRect();
                  const contB = cont.getBoundingClientRect();
                  if (cellB.left < contB.left) {
                    cont.scrollLeft -= (contB.left - cellB.left + 40);
                  } else if (cellB.right > contB.right) {
                    cont.scrollLeft += (cellB.right - contB.right + 40);
                  }
                  if (cellB.top < contB.top) {
                    cont.scrollTop -= (contB.top - cellB.top + 40);
                  } else if (cellB.bottom > contB.bottom) {
                    cont.scrollTop += (cellB.bottom - contB.bottom + 40);
                  }
                }
              }
            } else if (['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(event.key)) {
              announceToScreenReader(
                `Grid boundary reached. Row ${rowIndex + 1} of ${activeDepartments.length}, Column ${colIndex + 1} of ${filteredControls.length}.`,
                'polite'
              );
            }
          }
        });

        // Mouse Events
        cellG.on('mouseenter', (event: MouseEvent) => {
          setFocusedCellCoord({ row: rowIndex, col: colIndex });

          // Highlight crosshairs
          svg.selectAll('.row-header').style('opacity', 0.4);
          svg.selectAll(`.row-header-${dept.id}`).style('opacity', 1).style('font-weight', 'bold');

          svg.selectAll('.col-header').style('opacity', 0.4);
          svg.selectAll(`.col-header-${ctrl.code.replace(/[^a-zA-Z0-9]/g, '_')}`).style('opacity', 1).style('font-weight', 'bold');

          svg.selectAll('.cell-group').style('opacity', 0.3);
          cellG.style('opacity', 1);

          updateTooltip(event);
        });

        cellG.on('mousemove', (event: MouseEvent) => {
          updateTooltip(event);
        });

        cellG.on('mouseleave', () => {
          // Reset highlights
          svg.selectAll('.row-header').style('opacity', 1).style('font-weight', 'normal');
          svg.selectAll('.col-header').style('opacity', 1).style('font-weight', 'normal');
          svg.selectAll('.cell-group').style('opacity', isDimmed ? 0.15 : 1);

          if (tooltipRef.current) {
            tooltipRef.current.style.display = 'none';
          }
        });

        // Click Handler -> Focus cell and open modal
        cellG.on('click', () => {
          cellG.node()?.focus();
          setSelectedCell(cell);
          setIsModalOpen(true);
        });
      });
    });

    // Retain focus on active cell if container currently has keyboard focus
    if (focusedCellCoord) {
      const activeCellNode = svg.select<SVGGElement>(
        `[data-row="${focusedCellCoord.row}"][data-col="${focusedCellCoord.col}"]`
      ).node();
      if (
        activeCellNode &&
        document.activeElement &&
        containerRef.current?.contains(document.activeElement)
      ) {
        activeCellNode.focus();
      }
    }
  }, [
    activeDepartments,
    filteredControls,
    cells,
    controlScope,
    urgentOnly,
    zoomLevel
  ]);

  // Handle Quick Focus on Urgent Area from Banner
  const handleFocusUrgentCell = useCallback((urgentCell: AdherenceHeatmapCell) => {
    setSelectedCell(urgentCell);
    setDrawerOpen(true);
    showToast({
      title: 'Urgent Remediation Focus',
      message: `Focused on ${urgentCell.controlCode} (${urgentCell.departmentName})`,
      type: 'info'
    });
  }, [showToast]);

  // Handle Save Remediation
  const handleSaveRemediation = () => {
    if (!selectedCell) return;
    setIsSubmitting(true);

    try {
      const updatedList = D3ComplianceHeatmapService.updateCell(selectedCell.id, {
        adherenceScore: editScore,
        auditorNotes: editNotes,
        isUrgentRemediation: editScore < 75 ? selectedCell.isUrgentRemediation : false
      });

      setCells([...updatedList]);
      const updatedCurrent = updatedList.find(c => c.id === selectedCell.id);
      if (updatedCurrent) {
        setSelectedCell(updatedCurrent);
      }

      showToast({
        title: 'Remediation Updated',
        message: `${selectedCell.controlCode} adherence updated to ${editScore}%`,
        type: 'success'
      });

      announceToScreenReader(
        `Status updated for Control ${selectedCell.controlCode} in ${selectedCell.departmentName}: adherence changed to ${editScore}%.`,
        'assertive'
      );

      if (editScore >= 80 && selectedCell.isUrgentRemediation) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });
        showToast({
          title: 'Urgent Remediation Resolved',
          message: `Control ${selectedCell.controlCode} marked compliant`,
          type: 'success'
        });
      }
    } catch (e) {
      showToast({
        title: 'Update Failed',
        message: 'Failed to update remediation status',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Resolve Urgent CAPA
  const handleQuickResolve = () => {
    if (!selectedCell) return;
    setEditScore(88);
    const updatedList = D3ComplianceHeatmapService.updateCell(selectedCell.id, {
      adherenceScore: 88,
      status: 'COMPLIANT',
      isUrgentRemediation: false,
      urgencyLevel: 'NONE',
      auditorNotes: `Audit Non-Conformity CAPA verified and closed on ${new Date().toISOString().split('T')[0]}. Evidence reviewed and found effective.`
    });
    setCells([...updatedList]);
    setSelectedCell(updatedList.find(c => c.id === selectedCell.id) || null);
    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.5 }
    });
    showToast({
      title: 'CAPA Closed',
      message: `${selectedCell.controlCode} marked Compliant (88%)`,
      type: 'success'
    });
    announceToScreenReader(
      `Status updated: Control ${selectedCell.controlCode} in ${selectedCell.departmentName} marked Compliant with 88% adherence. Urgent remediation resolved.`,
      'assertive'
    );
  };

  // Export CSV
  const handleExportCSV = () => {
    const csv = D3ComplianceHeatmapService.exportToCSV(cells);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Skanda_ISO27001_Compliance_Heatmap_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast({
      title: 'Export Generated',
      message: 'Compliance Heatmap CSV downloaded successfully',
      type: 'success'
    });
  };

  // Reset Baseline
  const handleResetBaseline = () => {
    const reset = D3ComplianceHeatmapService.resetBaseline();
    setCells([...reset]);
    showToast({
      title: 'Baseline Reset',
      message: 'Compliance Heatmap baseline successfully reset to audit standards',
      type: 'info'
    });
  };

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      {!hideHeaderCard && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-2xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400">
                  <Grid className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Compliance Adherence Heatmap
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Interactive D3 visualization tracking adherence across departments and ISO 27001 controls with instant urgent remediation spotlight.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Metrics Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80">
                <span className="text-[10px] text-slate-400 font-medium block">Adherence Rate</span>
                <span className="text-base font-bold font-mono text-slate-900 dark:text-white">
                  {metrics.averageAdherence}%
                </span>
                <span className="text-[10px] text-slate-500 ml-1">Avg Score</span>
              </div>

              <div className="p-2.5 rounded-lg bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/60">
                <span className="text-[10px] text-rose-600 dark:text-rose-400 font-medium block">
                  Urgent Remediation
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-bold font-mono text-rose-700 dark:text-rose-300">
                    {metrics.urgentRemediationCount}
                  </span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-700 dark:text-rose-300">
                    Critical
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80">
                <span className="text-[10px] text-slate-400 font-medium block">CMMI Maturity</span>
                <span className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  L{metrics.averageCmmiLevel}
                </span>
                <span className="text-[10px] text-slate-500 ml-1">Managed</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80">
                <span className="text-[10px] text-slate-400 font-medium block">SLA Breaches</span>
                <span className="text-base font-bold font-mono text-amber-600 dark:text-amber-400">
                  {metrics.slaBreachedCount}
                </span>
                <span className="text-[10px] text-slate-500 ml-1">Overdue</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Urgent Remediation Alert & Quick Action Ribbon */}
      {urgentRemediationCells.length > 0 && (
        <div className="rounded-xl border border-rose-300/80 dark:border-rose-900/80 bg-rose-50/70 dark:bg-rose-950/40 p-3.5 shadow-2xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-lg bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300 shrink-0">
                <Flame className="w-4 h-4 animate-pulse" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs sm:text-sm font-bold text-rose-900 dark:text-rose-100">
                    {urgentRemediationCells.length} Areas Require Urgent Remediation
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-800 dark:text-rose-200">
                    SLA Breached
                  </span>
                </div>
                <p className="text-[11px] text-rose-700 dark:text-rose-300 mt-0.5">
                  Critical compliance deficits directly threaten upcoming ISO 27001 Stage 2 certification readiness. Click an item to inspect:
                </p>
              </div>
            </div>

            {/* Urgent Items Fast-Jump Buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {urgentRemediationCells.slice(0, 4).map(u => (
                <button
                  key={u.id}
                  onClick={() => handleFocusUrgentCell(u)}
                  className="px-2 py-1 rounded-md text-[11px] font-mono font-bold bg-white dark:bg-slate-900 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/80 hover:bg-rose-100/60 dark:hover:bg-rose-900/40 transition cursor-pointer flex items-center gap-1 shadow-2xs"
                  title={`${u.departmentName} - ${u.controlTitle}`}
                >
                  <span>{u.controlCode}</span>
                  <span className="text-[10px] font-sans font-normal text-rose-500">
                    ({u.departmentName.split(' ')[0]})
                  </span>
                </button>
              ))}
              {urgentRemediationCells.length > 4 && (
                <button
                  onClick={() => setUrgentOnly(!urgentOnly)}
                  className="px-2 py-1 rounded-md text-[11px] font-bold text-rose-800 dark:text-rose-200 hover:underline cursor-pointer"
                >
                  +{urgentRemediationCells.length - 4} more
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Interactive Toolbar & Filters */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-4 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Left: Search & Granularity */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search controls, departments..."
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none focus:ring-1 focus:ring-indigo-500 w-44 sm:w-56"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Scope / Granularity Switcher */}
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs">
              <button
                onClick={() => setControlScope('PRIORITY')}
                className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                  controlScope === 'PRIORITY'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Priority 24 Controls
              </button>
              <button
                onClick={() => setControlScope('ALL_ANNEX_A')}
                className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                  controlScope === 'ALL_ANNEX_A'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                All 93 Controls
              </button>
              <button
                onClick={() => setControlScope('CLAUSES')}
                className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                  controlScope === 'CLAUSES'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Clauses 4–10
              </button>
            </div>
          </div>

          {/* Right: Controls Filter Dropdown, Urgent Spotlight & Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Control Filter Dropdown: All Controls vs High Risk vs Requires Urgent Remediation */}
            <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 pl-1.5 pr-0.5 uppercase tracking-wider flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                <span>Controls:</span>
              </span>
              <select
                id="compliance-heatmap-control-risk-filter"
                value={controlFilterMode}
                onChange={e => handleControlFilterChange(e.target.value as 'ALL' | 'HIGH_RISK' | 'URGENT_REMEDIATION')}
                className="px-2.5 py-1 text-xs font-semibold rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer shadow-2xs"
                title="Toggle between viewing all controls or only those marked 'High Risk' or 'Requires Urgent Remediation'"
              >
                <option value="ALL">All Controls ({activeControls.length})</option>
                <option value="HIGH_RISK">High Risk ({highRiskControlsCount})</option>
                <option value="URGENT_REMEDIATION">Requires Urgent Remediation ({urgentControlsCount})</option>
              </select>
            </div>

            {/* Reset Filter shortcut when active */}
            {controlFilterMode !== 'ALL' && (
              <button
                onClick={() => handleControlFilterChange('ALL')}
                className="px-2 py-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer flex items-center gap-1"
                title="Reset control filter to All Controls"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset to All</span>
              </button>
            )}

            {/* Urgent Remediation Spotlight Button */}
            <button
              onClick={() => handleControlFilterChange(controlFilterMode === 'URGENT_REMEDIATION' ? 'ALL' : 'URGENT_REMEDIATION')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                controlFilterMode === 'URGENT_REMEDIATION'
                  ? 'bg-rose-600 text-white hover:bg-rose-700 ring-2 ring-rose-400'
                  : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 hover:bg-rose-100'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{controlFilterMode === 'URGENT_REMEDIATION' ? 'Show All Controls' : `Urgent Only (${urgentControlsCount})`}</span>
            </button>

            {/* Department Filter */}
            <select
              value={selectedDepartment}
              onChange={e => setSelectedDepartment(e.target.value)}
              className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none"
            >
              <option value="ALL">All Departments</option>
              {D3_HEATMAP_DEPARTMENTS.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            {/* Theme Filter */}
            <select
              value={selectedTheme}
              onChange={e => setSelectedTheme(e.target.value)}
              className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none"
            >
              <option value="ALL">All ISO Themes</option>
              <option value="Organizational">A.5 Organizational</option>
              <option value="People">A.6 People</option>
              <option value="Physical">A.7 Physical</option>
              <option value="Technological">A.8 Technological</option>
              <option value="Mandatory Clause">Clauses 4–10</option>
            </select>

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none"
            >
              <option value="URGENT_FIRST">Sort: Urgent Overdue First</option>
              <option value="LOWEST_ADHERENCE">Sort: Lowest Adherence First</option>
              <option value="DEPT_NAME">Sort: Department Name</option>
            </select>

            {/* Zoom Controls */}
            <div className="flex items-center gap-0.5 border border-slate-200 dark:border-slate-700 rounded-lg p-0.5 bg-slate-50 dark:bg-slate-800">
              <button
                onClick={() => setZoomLevel(prev => Math.max(0.7, prev - 0.1))}
                className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-mono px-1 text-slate-400">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel(prev => Math.min(1.4, prev + 0.1))}
                className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Export CSV */}
            <button
              onClick={handleExportCSV}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer"
              title="Export CSV Adherence Report"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Reset */}
            <button
              onClick={handleResetBaseline}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer"
              title="Reset Baseline"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Screen Reader Live Announcer for Heatmap Cell Navigation and Status Updates */}
      <div
        id="d3-compliance-heatmap-live-announcer"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        data-testid="screen-reader-live-announcer"
      >
        {screenReaderAnnouncement}
      </div>

      {/* Screen Reader Assertive Live Announcer for Immediate Cell Status Changes & Alerts */}
      <div
        id="d3-compliance-heatmap-assertive-announcer"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
        data-testid="screen-reader-assertive-announcer"
      >
        {assertiveAnnouncement}
      </div>

      <p id="d3-heatmap-keyboard-instructions" className="sr-only">
        Regulatory compliance matrix grid. Use Arrow Keys (Left, Right, Up, Down) to navigate between departments and controls. Press Enter or Space to open the forensic inspection modal with detailed history and evidence logs. Press Home or End to navigate to the start or end of a row. Press C to mark Compliant, I for In Progress, N for Non-Compliant, or U to toggle Urgent Remediation flag. Status changes are announced immediately via screen reader.
      </p>

      {/* Keyboard Navigation Helper & Shortcut Bar */}
      <div
        className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800"
        data-testid="heatmap-keyboard-navigation-bar"
      >
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-bold text-slate-700 dark:text-slate-200">Keyboard Controls:</span>
          <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-[10px] font-mono font-bold shadow-2xs">← ↑ ↓ →</kbd>
          <span>Move</span>
          <span className="text-slate-300 dark:text-slate-600">·</span>
          <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-[10px] font-mono font-bold shadow-2xs">Enter</kbd>
          <span>/</span>
          <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-[10px] font-mono font-bold shadow-2xs">Space</kbd>
          <span>History &amp; Evidence</span>
          <span className="text-slate-300 dark:text-slate-600">·</span>
          <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-[10px] font-mono font-bold shadow-2xs">C</kbd>
          <span>Compliant</span>
          <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-[10px] font-mono font-bold shadow-2xs">I</kbd>
          <span>In Progress</span>
          <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-[10px] font-mono font-bold shadow-2xs">N</kbd>
          <span>Non-Compliant</span>
          <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-[10px] font-mono font-bold shadow-2xs">U</kbd>
          <span>Urgent</span>
          <span className="text-slate-300 dark:text-slate-600">·</span>
          <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-[10px] font-mono font-bold shadow-2xs">Home</kbd>
          <span>/</span>
          <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-[10px] font-mono font-bold shadow-2xs">End</kbd>
          <span>Start/End</span>
        </div>
        {focusedCellCoord && (
          <span className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">
            Active: Row {focusedCellCoord.row + 1} of {activeDepartments.length}, Col {focusedCellCoord.col + 1} of {filteredControls.length}
          </span>
        )}
      </div>

      {/* D3 Heatmap Canvas Container */}
      <div
        ref={containerRef}
        className="relative rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs overflow-x-auto min-h-[440px]"
      >
        <svg ref={svgRef} className="block mx-auto" />

        {/* Floating Tooltip Element */}
        <div
          ref={tooltipRef}
          className="absolute z-50 pointer-events-none hidden max-w-sm rounded-xl border border-slate-200/90 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-xl transition-all duration-75"
        />
      </div>

      {/* Heatmap Legend */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          {/* Adherence scale */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              Adherence Scale:
            </span>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-rose-600"></span>
              <span className="text-slate-700 dark:text-slate-300 font-medium">Non-Compliant (&lt;50%)</span>
            </div>
            <span className="text-slate-300">·</span>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-amber-500"></span>
              <span className="text-slate-700 dark:text-slate-300 font-medium">In Progress (50–84%)</span>
            </div>
            <span className="text-slate-300">·</span>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-emerald-600"></span>
              <span className="text-slate-700 dark:text-slate-300 font-medium">Compliant (85–100%)</span>
            </div>
          </div>

          {/* Urgent Remediation Visual Highlight Marker */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping"></span>
              <span className="font-bold font-mono text-[11px]">! Red Glow</span>
              <span className="text-[10px]">= Urgent Remediation Required</span>
            </div>
          </div>
        </div>
      </div>

      {/* Remediation & Adherence Deep-Dive Side Drawer */}
      {drawerOpen && selectedCell && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
                    {selectedCell.controlCode}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {selectedCell.theme}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1 leading-snug">
                  {selectedCell.controlTitle}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Assigned Department:{' '}
                  <strong className="text-slate-900 dark:text-white">
                    {selectedCell.departmentName}
                  </strong>
                </p>
              </div>

              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
              {/* Urgent Callout Banner if urgent */}
              {selectedCell.isUrgentRemediation ? (
                <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-bold text-xs text-rose-700 dark:text-rose-300">
                      <AlertOctagon className="w-4 h-4" />
                      CRITICAL REMEDIATION MANDATE
                    </span>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-600 text-white">
                      {selectedCell.slaStatus || 'BREACHED'}
                    </span>
                  </div>

                  <p className="text-xs leading-relaxed text-rose-800 dark:text-rose-200">
                    {selectedCell.urgentReason ||
                      'Automated non-compliance identified during Stage 1 audit readiness verification.'}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-rose-200 dark:border-rose-900">
                    <div>
                      <span className="text-[10px] text-rose-600 dark:text-rose-400 block">
                        Days Overdue:
                      </span>
                      <strong className="font-mono text-sm">{selectedCell.overdueDays} Days</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-rose-600 dark:text-rose-400 block">
                        CAPA Ticket:
                      </span>
                      <strong className="font-mono text-sm">{selectedCell.capaTicketId || 'CAPA-2026-PENDING'}</strong>
                    </div>
                  </div>

                  {selectedCell.capaAction && (
                    <div className="text-xs pt-1">
                      <span className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold block">
                        Corrective Action Plan:
                      </span>
                      <p className="text-[11px] font-mono bg-white/70 dark:bg-slate-900/60 p-2 rounded border border-rose-200 dark:border-rose-800 mt-1">
                        {selectedCell.capaAction}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={handleQuickResolve}
                    className="w-full py-2 px-3 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify CAPA & Mark Remediated (88%)</span>
                  </button>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 flex items-center gap-2 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Control adherence is on track. Ongoing surveillance monitoring active.
                  </span>
                </div>
              )}

              {/* Adherence Score Adjuster */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/50 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 dark:text-white">
                    Adherence Score
                  </label>
                  <span className="text-base font-bold font-mono text-indigo-600 dark:text-indigo-400">
                    {editScore}%
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={editScore}
                  onChange={e => setEditScore(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />

                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>0% Non-Compliant</span>
                  <span>50% In Progress</span>
                  <span>85% Compliant</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Audit Details */}
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-slate-900 dark:text-white">
                  Audit Verification Context
                </h4>
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2 text-[11px] text-slate-600 dark:text-slate-300">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Lead Auditor Procedure:</span>
                    <p className="mt-0.5 leading-relaxed">
                      Sample operational test workpapers and verify automated policy enforcement controls in CI/CD and IAM.
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px]">
                    <span>Evidence Integrity: <strong className="text-slate-900 dark:text-white">{selectedCell.evidenceStatus}</strong></span>
                    <span>Last Audit: <strong className="text-slate-900 dark:text-white">{selectedCell.lastAssessedAt}</strong></span>
                  </div>
                </div>
              </div>

              {/* Auditor Notes Textarea */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-900 dark:text-white">
                  Auditor Workpaper Notes & Justification
                </label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={e => setEditNotes(e.target.value)}
                  placeholder="Record auditor inspection observations, non-conformity findings, or remediation sign-off notes..."
                  className="w-full p-2.5 text-xs rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDrawerOpen(false);
                    setIsModalOpen(true);
                  }}
                  className="px-3 py-2 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 cursor-pointer flex items-center gap-1.5"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Inspect Audit History &amp; Evidence</span>
                </button>
              </div>

              <button
                onClick={handleSaveRemediation}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <FileCheck2 className="w-3.5 h-3.5" />
                )}
                <span>Save Remediation</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Forensic Inspection Modal: Displays Detailed History & Specific Evidence Logs */}
      <ComplianceHeatmapDetailModal
        isOpen={isModalOpen}
        cell={modalCellData}
        onClose={() => setIsModalOpen(false)}
        onCellUpdated={(updated: HeatmapCellData) => {
          setCells(prev =>
            prev.map(c =>
              c.id === updated.id
                ? {
                    ...c,
                    adherenceScore: updated.score,
                    status: updated.status as any,
                    inherentRisk: updated.riskLevel as any,
                    auditorNotes: updated.complianceNotes
                  }
                : c
            )
          );
          announceToScreenReader(
            `Status updated for Control ${updated.targetCode} in ${updated.departmentName}: now ${updated.status} with ${updated.score}% adherence.`,
            'assertive'
          );
        }}
      />
    </div>
  );
};
