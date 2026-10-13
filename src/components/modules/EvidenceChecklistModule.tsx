import React, { useState, useMemo } from 'react';
import { useGRC } from '../../context/GRCContext';
import { PageContainer } from '../layout/PageContainer';
import {
  EVIDENCE_CHECKLIST_MASTER_DATA,
  DEPARTMENT_DEFINITIONS,
  EvidenceChecklistItem,
  DepartmentDefinition,
  DepartmentCode,
  ISO19011_SAMPLE_SIZE_GUIDELINES
} from '../../data/evidenceChecklistMasterData';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileCheck2,
  SlidersHorizontal,
  Search,
  Download,
  ShieldCheck,
  Sparkles,
  Building2,
  Users2,
  Layers,
  HelpCircle,
  Calculator,
  ChevronRight,
  Eye,
  FileText,
  Briefcase,
  Award,
  AlertOctagon,
  ArrowRight,
  Check,
  X,
  ExternalLink,
  Info,
  Calendar,
  Zap,
  Lock,
  Cpu,
  RefreshCw,
  FolderPlus,
  Scale,
  Brain,
  ShieldAlert,
  Users,
  Truck,
  Building,
  Laptop,
  MessageSquare,
  BookOpen,
  Filter,
  CheckSquare,
  FileSpreadsheet
} from 'lucide-react';
import { DepartmentAuditChecklistHub } from '../audit/DepartmentAuditChecklistHub';

export const EvidenceChecklistModule: React.FC = () => {
  const { currentTenant, evidence, setActiveModule } = useGRC();

  // Navigation Mode: Standards View vs Department View vs Comprehensive Auditor Checklists
  const [viewMode, setViewMode] = useState<'STANDARDS' | 'DEPARTMENTS' | 'AUDITOR_CHECKLISTS'>('AUDITOR_CHECKLISTS');

  // Selected Department for Department-Wise View (or 'ALL')
  const [selectedDeptCode, setSelectedDeptCode] = useState<DepartmentCode | 'ALL'>('DEPT_ENG_DEVOPS');

  // Dual Lens State: Implementer vs Auditor
  const [activeLens, setActiveLens] = useState<'IMPLEMENTER' | 'AUDITOR'>('IMPLEMENTER');
  
  // Filter States
  const [selectedFramework, setSelectedFramework] = useState<string>('ALL');
  const [selectedStage, setSelectedStage] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Local checklist status state (persisted in-memory for live interactions)
  const [itemStatuses, setItemStatuses] = useState<Record<string, 'Prepared' | 'In Progress' | 'Missing' | 'Verified'>>(() => {
    const initial: Record<string, 'Prepared' | 'In Progress' | 'Missing' | 'Verified'> = {};
    EVIDENCE_CHECKLIST_MASTER_DATA.forEach(item => {
      initial[item.id] = item.defaultStatus;
    });
    return initial;
  });

  // Selected item modal / drawer
  const [selectedItem, setSelectedItem] = useState<EvidenceChecklistItem | null>(null);

  // Department Briefing Sheet Modal State
  const [briefingDept, setBriefingDept] = useState<DepartmentDefinition | null>(null);

  // ISO 19011 Sampling Calculator State
  const [showSamplingCalc, setShowSamplingCalc] = useState<boolean>(false);
  const [populationCount, setPopulationCount] = useState<number>(120);
  const [confidenceLevel, setConfidenceLevel] = useState<'90%' | '95%' | '99%'>('95%');

  // Mock Interview Simulator State
  const [showInterviewSim, setShowInterviewSim] = useState<boolean>(false);
  const [interviewDept, setInterviewDept] = useState<DepartmentCode>('DEPT_ENG_DEVOPS');
  const [interviewQuestionIndex, setInterviewQuestionIndex] = useState<number>(0);
  const [userInterviewAnswer, setUserInterviewAnswer] = useState<string>('');
  const [showModelAnswer, setShowModelAnswer] = useState<boolean>(false);

  // Update Status handler
  const handleStatusChange = (id: string, newStatus: 'Prepared' | 'In Progress' | 'Missing' | 'Verified') => {
    setItemStatuses(prev => ({ ...prev, [id]: newStatus }));
  };

  // Helper to render Department Icon
  const renderDeptIcon = (iconName: string, className = 'w-5 h-5') => {
    switch (iconName) {
      case 'Cpu': return <Cpu className={className} />;
      case 'Brain': return <Brain className={className} />;
      case 'ShieldAlert': return <ShieldAlert className={className} />;
      case 'Users': return <Users className={className} />;
      case 'Scale': return <Scale className={className} />;
      case 'Truck': return <Truck className={className} />;
      case 'Building': return <Building className={className} />;
      case 'Laptop': return <Laptop className={className} />;
      default: return <Briefcase className={className} />;
    }
  };

  // Filtered Checklist items
  const filteredItems = useMemo(() => {
    return EVIDENCE_CHECKLIST_MASTER_DATA.filter(item => {
      // Department Filter (if in DEPARTMENTS view mode and not 'ALL')
      if (viewMode === 'DEPARTMENTS' && selectedDeptCode !== 'ALL') {
        if (item.departmentCode !== selectedDeptCode) return false;
      }

      // Framework Filter
      if (selectedFramework !== 'ALL' && item.frameworkCode !== selectedFramework) {
        return false;
      }
      // Stage Filter
      if (selectedStage !== 'ALL') {
        if (selectedStage === 'STAGE_1' && !item.auditorGuide.auditStage.includes('Stage 1')) return false;
        if (selectedStage === 'STAGE_2' && !item.auditorGuide.auditStage.includes('Stage 2')) return false;
        if (selectedStage === 'MAS_INSPECTION' && !item.auditorGuide.auditStage.includes('MAS')) return false;
      }
      // Status Filter
      const currentStatus = itemStatuses[item.id] || item.defaultStatus;
      if (selectedStatus !== 'ALL' && currentStatus !== selectedStatus) {
        return false;
      }
      // Search Term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(term);
        const matchesClause = item.clauseOrControl.toLowerCase().includes(term);
        const matchesCategory = item.category.toLowerCase().includes(term);
        const matchesDept = item.department.toLowerCase().includes(term);
        const matchesWhat = item.implementerGuide.whatToPrepare.toLowerCase().includes(term);
        const matchesAuditor = item.auditorGuide.auditorExpectations.toLowerCase().includes(term);
        return matchesTitle || matchesClause || matchesCategory || matchesDept || matchesWhat || matchesAuditor;
      }
      return true;
    });
  }, [viewMode, selectedDeptCode, selectedFramework, selectedStage, selectedStatus, searchTerm, itemStatuses]);

  // Overall & Department-wise Readiness Metrics
  const deptMetrics = useMemo(() => {
    const stats: Record<DepartmentCode, { total: number; prepared: number; inProgress: number; missing: number; verified: number; prepTimeHours: number }> = {
      DEPT_ENG_DEVOPS: { total: 0, prepared: 0, inProgress: 0, missing: 0, verified: 0, prepTimeHours: 0 },
      DEPT_AI_DATA: { total: 0, prepared: 0, inProgress: 0, missing: 0, verified: 0, prepTimeHours: 0 },
      DEPT_INFOSEC_SOC: { total: 0, prepared: 0, inProgress: 0, missing: 0, verified: 0, prepTimeHours: 0 },
      DEPT_HR_PEOPLE: { total: 0, prepared: 0, inProgress: 0, missing: 0, verified: 0, prepTimeHours: 0 },
      DEPT_LEGAL_PRIVACY: { total: 0, prepared: 0, inProgress: 0, missing: 0, verified: 0, prepTimeHours: 0 },
      DEPT_PROCUREMENT_VRM: { total: 0, prepared: 0, inProgress: 0, missing: 0, verified: 0, prepTimeHours: 0 },
      DEPT_EXEC_BOARD: { total: 0, prepared: 0, inProgress: 0, missing: 0, verified: 0, prepTimeHours: 0 },
      DEPT_IT_OPS: { total: 0, prepared: 0, inProgress: 0, missing: 0, verified: 0, prepTimeHours: 0 }
    };

    let grandTotal = 0;
    let grandPrepared = 0;
    let grandVerified = 0;
    let grandMissing = 0;
    let grandInProgress = 0;
    let grandPrepTime = 0;

    EVIDENCE_CHECKLIST_MASTER_DATA.forEach(item => {
      const code = item.departmentCode;
      const status = itemStatuses[item.id] || item.defaultStatus;

      grandTotal++;
      if (stats[code]) {
        stats[code].total++;
        if (status === 'Prepared') {
          stats[code].prepared++;
          grandPrepared++;
        } else if (status === 'Verified') {
          stats[code].verified++;
          grandVerified++;
        } else if (status === 'In Progress') {
          stats[code].inProgress++;
          stats[code].prepTimeHours += item.estimatedPrepTimeHours * 0.5;
          grandInProgress++;
          grandPrepTime += item.estimatedPrepTimeHours * 0.5;
        } else if (status === 'Missing') {
          stats[code].missing++;
          stats[code].prepTimeHours += item.estimatedPrepTimeHours;
          grandMissing++;
          grandPrepTime += item.estimatedPrepTimeHours;
        }
      }
    });

    const grandReadiness = grandTotal > 0 ? Math.round(((grandPrepared + grandVerified) / grandTotal) * 100) : 0;

    return {
      stats,
      grandTotal,
      grandPrepared,
      grandVerified,
      grandMissing,
      grandInProgress,
      grandPrepTime: Math.round(grandPrepTime),
      grandReadiness
    };
  }, [itemStatuses]);

  // Current active department object (if in dept view and specific dept selected)
  const currentDeptDefinition = useMemo(() => {
    if (selectedDeptCode === 'ALL') return null;
    return DEPARTMENT_DEFINITIONS.find(d => d.code === selectedDeptCode) || null;
  }, [selectedDeptCode]);

  // ISO 19011 Sample Size Calculation result
  const calculatedSampleSize = useMemo(() => {
    const guideline = ISO19011_SAMPLE_SIZE_GUIDELINES.find(
      g => populationCount >= g.populationMin && populationCount <= g.populationMax
    );
    if (!guideline) return '100% (Census)';
    
    // Multiplier for confidence level
    const baseSample = guideline.sampleSize;
    if (confidenceLevel === '99%') return `${baseSample} (+25% Rigor Check)`;
    if (confidenceLevel === '90%') return `${baseSample} (Lower Risk Threshold)`;
    return baseSample;
  }, [populationCount, confidenceLevel]);

  // Export Department PBC Checklist (CSV)
  const handleExportPBC = (deptCodeFilter?: DepartmentCode | 'ALL') => {
    const targetDept = deptCodeFilter || selectedDeptCode;
    const itemsToExport = targetDept === 'ALL' 
      ? EVIDENCE_CHECKLIST_MASTER_DATA 
      : EVIDENCE_CHECKLIST_MASTER_DATA.filter(i => i.departmentCode === targetDept);

    const headers = [
      'Evidence ID',
      'Department',
      'Responsible Role',
      'Framework',
      'Clause / Control',
      'Evidence Title',
      'Status',
      'Priority',
      'What to Prepare (Chief Implementer)',
      'Recommended Format',
      'Cadence',
      'Auditor Testing Method',
      'Audit Stage',
      'Auditor Expectations',
      'Non-Conformity Trigger If Missing'
    ];

    const rows = itemsToExport.map(item => [
      item.id,
      `"${item.department}"`,
      `"${item.deptHeadRole}"`,
      `"${item.framework}"`,
      `"${item.clauseOrControl}"`,
      `"${item.title.replace(/"/g, '""')}"`,
      itemStatuses[item.id] || item.defaultStatus,
      item.priority,
      `"${item.implementerGuide.whatToPrepare.replace(/"/g, '""')}"`,
      `"${item.implementerGuide.recommendedFormat.replace(/"/g, '""')}"`,
      `"${item.implementerGuide.collectionCadence}"`,
      item.auditorGuide.testingMethod,
      `"${item.auditorGuide.auditStage}"`,
      `"${item.auditorGuide.auditorExpectations.replace(/"/g, '""')}"`,
      `"${item.auditorGuide.redFlagsAndNCReasons.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const filename = targetDept === 'ALL' 
      ? `Enterprise_Master_Evidence_Checklist_${currentTenant.name.replace(/\s+/g, '_')}.csv`
      : `Dept_Evidence_Checklist_${targetDept}_${currentTenant.name.replace(/\s+/g, '_')}.csv`;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Department Interview questions
  const activeInterviewDept = useMemo(() => {
    return DEPARTMENT_DEFINITIONS.find(d => d.code === interviewDept) || DEPARTMENT_DEFINITIONS[0];
  }, [interviewDept]);

  const currentQA = activeInterviewDept.sampleInterviewQA[interviewQuestionIndex] || activeInterviewDept.sampleInterviewQA[0];

  return (
    <PageContainer id="evidence-checklist-module">
      {/* Module Header & View Mode Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/20 to-sky-500/20 border border-indigo-500/30 text-indigo-400">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  Evidence Master Checklist
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-sky-500/20 to-purple-500/20 text-sky-300 border border-sky-500/30">
                  Dual-Lens & Dept Suite
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-0.5">
                Authoritative Chief ISO Implementer Preparation Protocols & Lead Auditor Inspection Criteria
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Tools */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* ISO 19011 Sampling Calculator Button */}
          <button
            id="btn-sampling-calc"
            onClick={() => setShowSamplingCalc(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs font-medium text-slate-300 transition-colors"
          >
            <Calculator className="w-4 h-4 text-sky-400" />
            <span>ISO 19011 Sample Calculator</span>
          </button>

          {/* Mock Interview Simulator Button */}
          <button
            id="btn-interview-sim"
            onClick={() => {
              setInterviewDept(selectedDeptCode !== 'ALL' ? selectedDeptCode : 'DEPT_ENG_DEVOPS');
              setShowInterviewSim(true);
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-950/40 hover:bg-purple-900/40 border border-purple-800/40 hover:border-purple-700/50 text-xs font-medium text-purple-300 transition-colors"
          >
            <MessageSquare className="w-4 h-4 text-purple-400" />
            <span>Dept Interview Simulator</span>
          </button>

          {/* Export PBC Checklist */}
          <button
            id="btn-export-pbc"
            onClick={() => handleExportPBC(viewMode === 'DEPARTMENTS' ? selectedDeptCode : 'ALL')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-lg shadow-sky-600/20 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export PBC Checklist (CSV)</span>
          </button>
        </div>
      </div>

      {/* Top Architecture Toggle: Standards/Clauses View vs Department-Wise View */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-900/70 p-3 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800 w-full md:w-auto">
          <button
            id="tab-view-auditor-checklists"
            onClick={() => setViewMode('AUDITOR_CHECKLISTS')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'AUDITOR_CHECKLISTS'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>External Auditor Checklist (All 20+ Depts)</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-400/20 text-emerald-200 font-mono">
              Big 4 Ready
            </span>
          </button>

          <button
            id="tab-view-dept"
            onClick={() => setViewMode('DEPARTMENTS')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'DEPARTMENTS'
                ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Department Evidence Cards</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-sky-400/20 text-sky-200">
              8 Core
            </span>
          </button>

          <button
            id="tab-view-standards"
            onClick={() => setViewMode('STANDARDS')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'STANDARDS'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Framework Clauses</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-purple-400/20 text-purple-200">
              ISO / MAS
            </span>
          </button>
        </div>

        {/* Dual Lens Switcher: Chief Implementer vs Chief Lead Auditor */}
        <div className="flex items-center gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
          <button
            id="lens-implementer"
            onClick={() => setActiveLens('IMPLEMENTER')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeLens === 'IMPLEMENTER'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Chief Implementer Lens</span>
            <span className="hidden sm:inline text-[10px] opacity-75 font-normal">(Prep & Packaging)</span>
          </button>

          <button
            id="lens-auditor"
            onClick={() => setActiveLens('AUDITOR')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeLens === 'AUDITOR'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Chief Lead Auditor Lens</span>
            <span className="hidden sm:inline text-[10px] opacity-75 font-normal">(Testing & Scrutiny)</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: COMPREHENSIVE 20-DEPARTMENT EXTERNAL AUDITOR CHECKLIST HUB */}
      {viewMode === 'AUDITOR_CHECKLISTS' && (
        <DepartmentAuditChecklistHub />
      )}

      {/* DEPARTMENT-WISE HUB VIEW */}
      {viewMode === 'DEPARTMENTS' && (
        <div className="space-y-6">
          {/* Department Readiness Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {DEPARTMENT_DEFINITIONS.map(dept => {
              const stats = deptMetrics.stats[dept.code];
              const readiness = stats.total > 0 ? Math.round(((stats.prepared + stats.verified) / stats.total) * 100) : 0;
              const isSelected = selectedDeptCode === dept.code;

              return (
                <div
                  key={dept.code}
                  id={`dept-card-${dept.code}`}
                  onClick={() => setSelectedDeptCode(dept.code)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                    isSelected
                      ? `bg-slate-900 border-2 ${dept.borderColor} ring-1 ring-${dept.color.replace('text-', '')}`
                      : 'bg-slate-900/60 hover:bg-slate-900/90 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  {/* Top Row: Icon + Scrutiny Badge */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className={`p-2.5 rounded-xl border ${dept.accentBg} ${dept.color}`}>
                      {renderDeptIcon(dept.iconName, 'w-5 h-5')}
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${dept.badgeColor}`}>
                      {readiness}% Ready
                    </span>
                  </div>

                  {/* Department Name & Head */}
                  <h3 className="font-bold text-white text-sm group-hover:text-sky-300 transition-colors">
                    {dept.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                    {dept.headTitle}
                  </p>

                  {/* Progress Bar */}
                  <div className="mt-3 space-y-1">
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          readiness >= 90 ? 'bg-emerald-500' : readiness >= 60 ? 'bg-sky-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${readiness}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>{stats.prepared + stats.verified}/{stats.total} Artifacts</span>
                      <span>{stats.missing > 0 ? `${stats.missing} Missing` : 'All Set'}</span>
                    </div>
                  </div>

                  {/* Quick Action Button */}
                  <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
                    <span className="text-[11px] font-medium text-slate-400">
                      Est. {Math.round(stats.prepTimeHours)}h prep
                    </span>
                    <span className={`text-[11px] font-semibold flex items-center gap-1 ${dept.color}`}>
                      {isSelected ? 'Viewing Package' : 'Open Package'}
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Department Header Banner & Toolkit */}
          {currentDeptDefinition && (
            <div className={`p-5 rounded-2xl border ${currentDeptDefinition.accentBg} ${currentDeptDefinition.borderColor} bg-slate-900/90 relative`}>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className={`p-3 rounded-xl border ${currentDeptDefinition.accentBg} ${currentDeptDefinition.color}`}>
                    {renderDeptIcon(currentDeptDefinition.iconName, 'w-6 h-6')}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-lg font-bold text-white">
                        {currentDeptDefinition.name} Evidence & Audit Dossier
                      </h2>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${currentDeptDefinition.badgeColor}`}>
                        Accountable: {currentDeptDefinition.headTitle}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 max-w-3xl">
                      {currentDeptDefinition.description}
                    </p>
                  </div>
                </div>

                {/* Department Action Pack Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    id="btn-dept-briefing"
                    onClick={() => setBriefingDept(currentDeptDefinition)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/40 border border-indigo-500/40 text-indigo-200 text-xs font-semibold transition-all"
                  >
                    <BookOpen className="w-4 h-4 text-indigo-400" />
                    <span>Audit Day Briefing Sheet</span>
                  </button>

                  <button
                    id="btn-dept-interview"
                    onClick={() => {
                      setInterviewDept(currentDeptDefinition.code);
                      setInterviewQuestionIndex(0);
                      setShowInterviewSim(true);
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-600/30 hover:bg-purple-600/40 border border-purple-500/40 text-purple-200 text-xs font-semibold transition-all"
                  >
                    <MessageSquare className="w-4 h-4 text-purple-400" />
                    <span>Cross-Examine Lead</span>
                  </button>

                  <button
                    id="btn-dept-export-csv"
                    onClick={() => handleExportPBC(currentDeptDefinition.code)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    <span>Export Dept PBC</span>
                  </button>
                </div>
              </div>

              {/* Department Focus & Key Auditor Scrutiny Areas Banner */}
              <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5" /> Core Implementation Deliverables
                  </span>
                  <ul className="space-y-1 text-slate-300">
                    {currentDeptDefinition.focusAreas.slice(0, 3).map((fa, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-sky-400 mt-0.5">•</span>
                        <span>{fa}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> Lead Auditor Live Demonstration Requests
                  </span>
                  <ul className="space-y-1 text-slate-300">
                    {currentDeptDefinition.liveDemonstrationArtifacts.slice(0, 3).map((art, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-rose-400 mt-0.5">•</span>
                        <span>{art}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filter & Search Bar & Items List (For DEPARTMENTS and STANDARDS modes) */}
      {viewMode !== 'AUDITOR_CHECKLISTS' && (
        <>
          <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search evidence artifacts, clauses, requirements, department roles, or testing methods..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Framework Filter */}
            <select
              value={selectedFramework}
              onChange={(e) => setSelectedFramework(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:border-sky-500"
            >
              <option value="ALL">All Frameworks</option>
              <option value="ISO_27001">ISO 27001:2022 (ISMS)</option>
              <option value="ISO_42001">ISO 42001:2023 (AIMS)</option>
              <option value="MAS_TRM">MAS TRM Guidelines</option>
            </select>

            {/* Stage Filter */}
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:border-sky-500"
            >
              <option value="ALL">All Audit Stages</option>
              <option value="STAGE_1">Stage 1 (Docs Review)</option>
              <option value="STAGE_2">Stage 2 (Implementation)</option>
              <option value="MAS_INSPECTION">MAS Inspection</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:border-sky-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="Prepared">Prepared</option>
              <option value="Verified">Verified</option>
              <option value="In Progress">In Progress</option>
              <option value="Missing">Missing</option>
            </select>
          </div>
        </div>

        {/* Results Counter & Lens State Notification */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
          <div className="flex items-center gap-2">
            <span>Showing <strong className="text-white">{filteredItems.length}</strong> evidence requirements</span>
            {viewMode === 'DEPARTMENTS' && selectedDeptCode !== 'ALL' && (
              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                Department: {currentDeptDefinition?.name}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${activeLens === 'IMPLEMENTER' ? 'bg-sky-400' : 'bg-purple-400'}`} />
              Active Lens: <strong className="text-slate-200">{activeLens === 'IMPLEMENTER' ? 'Chief ISO Implementer' : 'Chief Lead Auditor'}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* EVIDENCE CHECKLIST ITEMS LISTING */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400 space-y-3">
            <Info className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="text-sm font-medium">No evidence items match the selected filter criteria.</p>
            <button
              onClick={() => {
                setSelectedFramework('ALL');
                setSelectedStage('ALL');
                setSelectedStatus('ALL');
                setSearchTerm('');
              }}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredItems.map(item => {
            const currentStatus = itemStatuses[item.id] || item.defaultStatus;
            const isStage1Critical = item.priority === 'CRITICAL_STAGE_1';
            const dept = DEPARTMENT_DEFINITIONS.find(d => d.code === item.departmentCode);

            return (
              <div
                key={item.id}
                id={`evidence-item-${item.id}`}
                className={`p-5 rounded-2xl border transition-all ${
                  isStage1Critical && currentStatus === 'Missing'
                    ? 'bg-rose-950/20 border-rose-900/40'
                    : 'bg-slate-900/70 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Header Row: Framework Badge + Clause + Priority + Status Dropdown */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/60">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-800 text-slate-200 border border-slate-700">
                      {item.framework}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-mono text-sky-300 bg-sky-950/50 border border-sky-800/50">
                      {item.clauseOrControl}
                    </span>
                    <span className="text-xs text-slate-400">• {item.category}</span>
                    {dept && (
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium border ${dept.badgeColor}`}>
                        {dept.shortName}
                      </span>
                    )}
                  </div>

                  {/* Status Changer & Prep Time */}
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {item.estimatedPrepTimeHours}h prep
                    </span>

                    {/* Status Pill / Selector */}
                    <select
                      value={currentStatus}
                      onChange={(e) => handleStatusChange(item.id, e.target.value as any)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold border focus:outline-none ${
                        currentStatus === 'Prepared'
                          ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                          : currentStatus === 'Verified'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : currentStatus === 'In Progress'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      }`}
                    >
                      <option value="Prepared" className="bg-slate-900 text-sky-300">Prepared</option>
                      <option value="Verified" className="bg-slate-900 text-emerald-300">Verified (Audit Ready)</option>
                      <option value="In Progress" className="bg-slate-900 text-amber-300">In Progress</option>
                      <option value="Missing" className="bg-slate-900 text-rose-300">Missing (Gap)</option>
                    </select>
                  </div>
                </div>

                {/* Title & Key Artifact Info */}
                <div className="mt-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-base font-bold text-white hover:text-sky-300 cursor-pointer transition-colors" onClick={() => setSelectedItem(item)}>
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Responsible Role: <strong className="text-slate-200">{item.implementerGuide.responsibleRole}</strong>
                      </p>
                    </div>
                    <button
                      id={`btn-view-details-${item.id}`}
                      onClick={() => setSelectedItem(item)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1.5 shrink-0 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 text-sky-400" />
                      <span>Deep Inspection</span>
                    </button>
                  </div>
                </div>

                {/* DUAL LENS VIEW CONTAINER */}
                <div className="mt-4">
                  {activeLens === 'IMPLEMENTER' ? (
                    // CHIEF IMPLEMENTER PERSPECTIVE
                    <div className="p-4 rounded-xl bg-slate-950/70 border border-sky-900/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5 uppercase tracking-wide">
                          <FileText className="w-4 h-4 text-sky-400" />
                          Implementer Packaging Directive
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          Cadence: <strong className="text-slate-300">{item.implementerGuide.collectionCadence}</strong> | Format: <strong className="text-slate-300">{item.implementerGuide.recommendedFormat}</strong>
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {item.implementerGuide.whatToPrepare}
                      </p>

                      {/* Mandatory Sections & Packaging Tip */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-900 text-xs">
                        <div>
                          <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                            Compulsory Clauses / Sections to Include:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {item.implementerGuide.mandatorySections.map((sec, sIdx) => (
                              <span key={sIdx} className="px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 text-[10px] border border-slate-800">
                                {sec}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="p-2.5 rounded-lg bg-sky-950/30 border border-sky-900/40 text-[11px] text-sky-300">
                          <strong className="block text-sky-200 mb-0.5">Packaging Tip:</strong>
                          {item.implementerGuide.packagingTip}
                        </div>
                      </div>
                    </div>
                  ) : (
                    // CHIEF LEAD AUDITOR PERSPECTIVE
                    <div className="p-4 rounded-xl bg-slate-950/70 border border-purple-900/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5 uppercase tracking-wide">
                          <ShieldCheck className="w-4 h-4 text-purple-400" />
                          Auditor Inspection Protocol ({item.auditorGuide.auditStage})
                        </span>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/40">
                          Testing Method: {item.auditorGuide.testingMethod}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {item.auditorGuide.auditorExpectations}
                      </p>

                      {/* Sample Size & Non-Conformity Red Flags */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-900 text-xs">
                        <div>
                          <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                            ISO 19011 Sample Size Expectation:
                          </span>
                          <span className="text-xs text-purple-300 font-medium">
                            {item.auditorGuide.minimumSampleSize}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-900/40 text-[11px] text-rose-300">
                          <strong className="block text-rose-200 mb-0.5">
                            Non-Conformity Trigger ({item.auditorGuide.classificationIfMissing}):
                          </strong>
                          {item.auditorGuide.redFlagsAndNCReasons}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  )}

      {/* MODAL 1: DEEP INSPECTION DRAWER / MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 my-8 shadow-2xl relative">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-slate-800 text-slate-200">
                    {selectedItem.framework}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-xs font-mono text-sky-400 bg-sky-950 border border-sky-800">
                    {selectedItem.clauseOrControl}
                  </span>
                  <span className="text-xs text-slate-400">{selectedItem.category}</span>
                </div>
                <h3 className="text-xl font-bold text-white mt-1.5">
                  {selectedItem.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Department Mapping Card */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 block">Department Ownership:</span>
                <strong className="text-white text-sm">{selectedItem.department}</strong>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block">Accountable Role:</span>
                <strong className="text-sky-300">{selectedItem.deptHeadRole}</strong>
              </div>
            </div>

            {/* Side-by-Side Dual Lens Inspection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Implementer Card */}
              <div className="p-4 rounded-xl bg-sky-950/20 border border-sky-800/40 space-y-3">
                <div className="flex items-center gap-2 text-sky-400 font-bold text-xs uppercase tracking-wider">
                  <FileText className="w-4 h-4" /> Chief Implementer Blueprint
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedItem.implementerGuide.whatToPrepare}
                </p>
                <div className="space-y-1.5 text-xs">
                  <strong className="text-sky-300 block text-[11px]">Compulsory Sections:</strong>
                  <ul className="list-disc list-inside text-slate-300 space-y-0.5 text-[11px]">
                    {selectedItem.implementerGuide.mandatorySections.map((sec, i) => (
                      <li key={i}>{sec}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-2.5 rounded-lg bg-sky-950/50 border border-sky-900/50 text-[11px] text-sky-300">
                  <strong>Common Trap to Avoid:</strong> {selectedItem.implementerGuide.commonMistakesToAvoid}
                </div>
              </div>

              {/* Lead Auditor Card */}
              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-800/40 space-y-3">
                <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" /> Lead Auditor Testing Protocol
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedItem.auditorGuide.auditorExpectations}
                </p>
                <div className="space-y-1.5 text-xs">
                  <strong className="text-purple-300 block text-[11px]">Mandatory Interview Questions:</strong>
                  <ul className="space-y-1 text-slate-300 text-[11px]">
                    {selectedItem.auditorGuide.auditInterviewQuestions.map((q, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-purple-400">?</span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-2.5 rounded-lg bg-rose-950/50 border border-rose-900/50 text-[11px] text-rose-300">
                  <strong>Non-Conformity Trigger:</strong> {selectedItem.auditorGuide.redFlagsAndNCReasons}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Current Status:</span>
                <select
                  value={itemStatuses[selectedItem.id] || selectedItem.defaultStatus}
                  onChange={(e) => handleStatusChange(selectedItem.id, e.target.value as any)}
                  className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-semibold"
                >
                  <option value="Prepared">Prepared</option>
                  <option value="Verified">Verified</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Missing">Missing</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedItem(null);
                    setActiveModule('evidence_centre');
                  }}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium"
                >
                  Go to Evidence Center
                </button>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: DEPARTMENT AUDIT DAY BRIEFING SHEET */}
      {briefingDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 my-8 shadow-2xl relative">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl border ${briefingDept.accentBg} ${briefingDept.color}`}>
                  {renderDeptIcon(briefingDept.iconName, 'w-6 h-6')}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {briefingDept.name} — Audit Day Briefing Pack
                  </h3>
                  <p className="text-xs text-slate-400">
                    Mandatory briefing for <strong className="text-slate-200">{briefingDept.headTitle}</strong> before entering the live audit interview
                  </p>
                </div>
              </div>
              <button
                onClick={() => setBriefingDept(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Briefing Checklist 3 Pillars */}
            <div className="space-y-4 text-xs">
              {/* Pillar 1: What the Auditor will Ask */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" /> 1. Expected Lead Auditor Examination Questions
                </span>
                <ul className="space-y-1.5 text-slate-300">
                  {briefingDept.keyAuditorInterviewTopics.map((topic, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-purple-400 font-bold">Q{idx + 1}:</span>
                      <span>{topic}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pillar 2: Live Demonstration Screens */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-bold text-sky-400 uppercase tracking-wider flex items-center gap-2">
                  <Laptop className="w-4 h-4" /> 2. Live Screen Demonstration & Terminal Shares
                </span>
                <p className="text-slate-400">
                  Have these exact console tabs opened and authenticated on your screen prior to the audit session:
                </p>
                <ul className="space-y-1.5 text-slate-300">
                  {briefingDept.liveDemonstrationArtifacts.map((art, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 mt-0.5 shrink-0" />
                      <span>{art}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pillar 3: Top 3 Traps to Avoid */}
              <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/40 space-y-2">
                <span className="font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
                  <AlertOctagon className="w-4 h-4" /> 3. Top Audit Traps & Red Flags to Avoid
                </span>
                <ul className="space-y-1.5 text-rose-200">
                  {briefingDept.topAuditTrapsToAvoid.map((trap, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-rose-400 font-bold">⚠️</span>
                      <span>{trap}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs">
              <button
                onClick={() => handleExportPBC(briefingDept.code)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium"
              >
                <Download className="w-4 h-4 text-sky-400" />
                <span>Export Department PBC List</span>
              </button>

              <button
                onClick={() => setBriefingDept(null)}
                className="px-5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold"
              >
                Close Briefing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: DEPARTMENT MOCK AUDIT INTERVIEW SIMULATOR */}
      {showInterviewSim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 my-8 shadow-2xl relative">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Lead Auditor Cross-Examination Simulator
                  </span>
                  <span className="text-xs text-slate-400">
                    Department: <strong className="text-slate-200">{activeInterviewDept.name}</strong>
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mt-1">
                  Interview Practice: {currentQA.targetRole}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowInterviewSim(false);
                  setShowModelAnswer(false);
                  setUserInterviewAnswer('');
                }}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Department Selection inside Simulator */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800/60">
              <span className="text-xs text-slate-400 whitespace-nowrap">Select Role to Test:</span>
              {DEPARTMENT_DEFINITIONS.map(d => (
                <button
                  key={d.code}
                  onClick={() => {
                    setInterviewDept(d.code);
                    setInterviewQuestionIndex(0);
                    setShowModelAnswer(false);
                    setUserInterviewAnswer('');
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    interviewDept === d.code
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {d.shortName}
                </button>
              ))}
            </div>

            {/* The Auditor's Question */}
            <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-800/50 space-y-2">
              <span className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-400" /> Lead Auditor Question
              </span>
              <p className="text-sm font-semibold text-white">
                "{currentQA.question}"
              </p>
            </div>

            {/* User Answer Field */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">
                Your Response (How would you answer the auditor?):
              </label>
              <textarea
                rows={3}
                value={userInterviewAnswer}
                onChange={(e) => setUserInterviewAnswer(e.target.value)}
                placeholder="Type your answer here, referring to specific policies, tools, and evidence files..."
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Toggle Model Answer / Audit Trap */}
            <div className="space-y-3">
              <button
                onClick={() => setShowModelAnswer(!showModelAnswer)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>{showModelAnswer ? 'Hide Expert Auditor Analysis' : 'Show Lead Auditor Model Answer & Traps'}</span>
              </button>

              {showModelAnswer && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40 space-y-1.5 text-xs">
                    <span className="font-bold text-emerald-300 uppercase tracking-wider block">
                      ✅ Lead Auditor Model Answer
                    </span>
                    <p className="text-slate-300 leading-relaxed">
                      {currentQA.modelAnswer}
                    </p>
                    <div className="pt-2 text-[11px] text-emerald-400">
                      <strong>Required Supporting Artifact:</strong> {currentQA.requiredArtifacts}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-800/40 space-y-1.5 text-xs">
                    <span className="font-bold text-rose-300 uppercase tracking-wider block">
                      ❌ Common Audit Trap (Triggers Non-Conformity)
                    </span>
                    <p className="text-rose-200 leading-relaxed">
                      "{currentQA.auditTrapAnswer}"
                    </p>
                    <div className="pt-2 text-[11px] text-rose-400">
                      <strong>Why It Fails:</strong> Demonstrates lack of automated enforcement or absence of segregation of duties.
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs">
              <div className="text-slate-400">
                Question {interviewQuestionIndex + 1} of {activeInterviewDept.sampleInterviewQA.length}
              </div>

              <div className="flex items-center gap-2">
                {interviewQuestionIndex > 0 && (
                  <button
                    onClick={() => {
                      setInterviewQuestionIndex(interviewQuestionIndex - 1);
                      setShowModelAnswer(false);
                      setUserInterviewAnswer('');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    Previous
                  </button>
                )}
                {interviewQuestionIndex < activeInterviewDept.sampleInterviewQA.length - 1 && (
                  <button
                    onClick={() => {
                      setInterviewQuestionIndex(interviewQuestionIndex + 1);
                      setShowModelAnswer(false);
                      setUserInterviewAnswer('');
                    }}
                    className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold"
                  >
                    Next Question
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: ISO 19011 SAMPLING CALCULATOR */}
      {showSamplingCalc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 my-8 shadow-2xl relative">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
                  <Calculator className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    ISO 19011 Statistical Audit Sampling Calculator
                  </h3>
                  <p className="text-xs text-slate-400">
                    Calculates required sample sizes for Stage 2 audits and surveillance testing
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSamplingCalc(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Inputs */}
            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">
                  Total Population Count (e.g. Total Change Tickets, Employees, Backup Jobs):
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000000"
                  value={populationCount}
                  onChange={(e) => setPopulationCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">
                  Audit Confidence Level:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['90%', '95%', '99%'] as const).map(lvl => (
                    <button
                      key={lvl}
                      onClick={() => setConfidenceLevel(lvl)}
                      className={`py-2 rounded-xl font-bold transition-all ${
                        confidenceLevel === lvl
                          ? 'bg-sky-600 text-white shadow-md'
                          : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      {lvl} Confidence
                    </button>
                  ))}
                </div>
              </div>

              {/* Result Box */}
              <div className="p-4 rounded-xl bg-sky-950/40 border border-sky-800/60 text-center space-y-1">
                <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider">
                  Mandatory Lead Auditor Sample Size:
                </span>
                <div className="text-2xl font-black text-white font-mono">
                  {calculatedSampleSize}
                </div>
                <p className="text-[11px] text-slate-300 pt-1">
                  Based on ISO 19011:2018 sampling rules for population size of <strong>{populationCount}</strong>
                </p>
              </div>

              {/* Reference Table */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="font-semibold text-slate-400 block text-[11px]">
                  Standard ISO 19011 Population Tier Matrix:
                </span>
                <div className="space-y-1 max-h-40 overflow-y-auto text-[11px]">
                  {ISO19011_SAMPLE_SIZE_GUIDELINES.map((guide, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/60">
                      <span className="text-slate-300">{guide.populationMin} - {guide.populationMax > 100000 ? '100,000+' : guide.populationMax} items</span>
                      <strong className="text-sky-300 font-mono">{guide.sampleSize}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowSamplingCalc(false)}
                className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold"
              >
                Close Calculator
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};
