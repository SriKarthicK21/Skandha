import React, { useState, useMemo } from 'react';
import {
  GraduationCap,
  ShieldCheck,
  Award,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  ArrowRight,
  Search,
  Filter,
  Download,
  Copy,
  Check,
  Clock,
  HelpCircle,
  Users,
  Scale,
  FileText,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Sparkles,
  Building,
  Layers,
  Terminal,
  FileCheck2,
  Compass,
  CheckSquare
} from 'lucide-react';
import {
  DepartmentRoleGapProfile,
  DPDP_DEPARTMENT_ROLE_GAP_PROFILES,
  getOverallGapMetrics,
  exportGapAnalysisDossierMarkdown,
  StandardsRecommendedCourse
} from '../../data/dpdpTrainingGapData';
import { useToast } from '../common/ToastContainer';
import { useGRC } from '../../context/GRCContext';
import { StandardsKnowledgeService } from '../../services/standardsKnowledgeService';

export const DPDPTrainingGapAnalyzer: React.FC = () => {
  const { showToast } = useToast();
  const { setActiveModule } = useGRC();

  // State
  const [roleProfiles, setRoleProfiles] = useState<DepartmentRoleGapProfile[]>(DPDP_DEPARTMENT_ROLE_GAP_PROFILES);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedRoleId, setExpandedRoleId] = useState<string | null>('role-devops-01');
  const [copiedDossier, setCopiedDossier] = useState(false);

  // Modal for Standards Course Deep Dive
  const [activeCourseModal, setActiveCourseModal] = useState<StandardsRecommendedCourse | null>(null);

  // Diagnostic Quiz State (Keyed by roleId)
  const [quizAnswers, setQuizAnswers] = useState<Record<string, Record<number, number>>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<Record<string, boolean>>({});

  // Departments list
  const departmentsList = useMemo(() => {
    const list = Array.from(new Set(roleProfiles.map(p => p.department)));
    return ['All', ...list];
  }, [roleProfiles]);

  // Overall Calculated Metrics
  const metrics = useMemo(() => {
    return getOverallGapMetrics(roleProfiles);
  }, [roleProfiles]);

  // Filtered Profiles
  const filteredProfiles = useMemo(() => {
    return roleProfiles.filter(profile => {
      // Department filter
      if (selectedDepartment !== 'All' && profile.department !== selectedDepartment) {
        return false;
      }
      // Severity filter
      if (selectedSeverity !== 'All') {
        if (selectedSeverity === 'REMEDIATED') {
          const hasRemediated = profile.identifiedGaps.some(g => g.status === 'REMEDIATED');
          if (!hasRemediated) return false;
        } else {
          const hasSeverity = profile.identifiedGaps.some(g => g.severity === selectedSeverity && g.status !== 'REMEDIATED');
          if (!hasSeverity) return false;
        }
      }
      // Search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim();
        const matchesRole = profile.roleTitle.toLowerCase().includes(q);
        const matchesDept = profile.department.toLowerCase().includes(q);
        const matchesClause = profile.statutoryClauseRefs.some(c => c.toLowerCase().includes(q));
        const matchesData = profile.dataTypesHandled.some(d => d.toLowerCase().includes(q));
        const matchesStandards = profile.recommendedStandardsModules.some(
          m => m.courseTitle.toLowerCase().includes(q) || m.standardCode.toLowerCase().includes(q)
        );
        return matchesRole || matchesDept || matchesClause || matchesData || matchesStandards;
      }
      return true;
    });
  }, [roleProfiles, selectedDepartment, selectedSeverity, searchQuery]);

  // Mark Gap Remediation
  const handleToggleGapStatus = (roleId: string, gapId: string) => {
    setRoleProfiles(prev =>
      prev.map(role => {
        if (role.id !== roleId) return role;
        return {
          ...role,
          identifiedGaps: role.identifiedGaps.map(gap => {
            if (gap.id !== gapId) return gap;
            const newStatus = gap.status === 'REMEDIATED' ? 'UNADDRESSED' : 'REMEDIATED';
            const newProficiency = newStatus === 'REMEDIATED' ? gap.targetProficiency : Math.max(30, gap.currentProficiency - 25);
            return {
              ...gap,
              status: newStatus,
              currentProficiency: newProficiency
            };
          })
        };
      })
    );
    showToast({
      title: 'Gap Status Updated',
      description: 'Role compliance score and statutory awareness metrics updated.',
      type: 'success'
    });
  };

  // Assign Team Training Track
  const handleAssignTrainingTrack = (roleTitle: string, courseTitle: string) => {
    showToast({
      title: 'Training Track Assigned',
      description: `Enrolled personnel in "${roleTitle}" into standards training module: "${courseTitle}".`,
      type: 'success'
    });
  };

  // Diagnostic Quiz Handlers
  const handleAnswerQuestion = (roleId: string, questionId: number, optIdx: number) => {
    setQuizAnswers(prev => ({
      ...prev,
      [roleId]: {
        ...(prev[roleId] || {}),
        [questionId]: optIdx
      }
    }));
  };

  const handleSubmitQuiz = (roleId: string, role: DepartmentRoleGapProfile) => {
    setQuizSubmitted(prev => ({ ...prev, [roleId]: true }));
    
    // Evaluate score
    const roleAnswers = quizAnswers[roleId] || {};
    let correctCount = 0;
    role.quickDiagnosticQuestions.forEach(q => {
      if (roleAnswers[q.id] === q.correctIndex) {
        correctCount++;
      }
    });

    const quizScorePct = role.quickDiagnosticQuestions.length > 0
      ? Math.round((correctCount / role.quickDiagnosticQuestions.length) * 100)
      : 0;

    // Dynamically boost proficiency if scored well
    if (quizScorePct >= 50) {
      setRoleProfiles(prev =>
        prev.map(p => {
          if (p.id !== roleId) return p;
          return {
            ...p,
            identifiedGaps: p.identifiedGaps.map(g => ({
              ...g,
              currentProficiency: Math.min(100, Math.round(g.currentProficiency * 0.5 + quizScorePct * 0.5))
            }))
          };
        })
      );
      showToast({
        title: `Diagnostic Completed: ${quizScorePct}%`,
        description: `Proficiency scores boosted for ${role.roleTitle} based on verified statutory comprehension.`,
        type: 'success'
      });
    } else {
      showToast({
        title: `Diagnostic Score: ${quizScorePct}%`,
        description: 'Identified statutory awareness deficiency. Remediate with recommended standards modules.',
        type: 'warning'
      });
    }
  };

  // Copy Markdown Dossier
  const handleCopyDossier = () => {
    const md = exportGapAnalysisDossierMarkdown(roleProfiles);
    navigator.clipboard.writeText(md);
    setCopiedDossier(true);
    showToast({
      title: 'Statutory Gap Dossier Copied',
      description: 'Audit-ready markdown dossier copied to clipboard.',
      type: 'success'
    });
    setTimeout(() => setCopiedDossier(false), 2500);
  };

  // Download Markdown File
  const handleDownloadDossier = () => {
    const md = exportGapAnalysisDossierMarkdown(roleProfiles);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `DPDPA_Statutory_Training_Gap_Dossier_${new Date().toISOString().split('T')[0]}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast({
      title: 'Dossier Downloaded',
      description: 'Statutory gap analysis file downloaded successfully.',
      type: 'info'
    });
  };

  // Navigate to Standards Training Hub
  const handleJumpToStandardsHub = (standardId?: string) => {
    setActiveModule('standards_academy');
    showToast({
      title: 'Navigating to Standards Training Hub',
      description: standardId ? `Opening ${standardId.toUpperCase()} curriculum.` : 'Opening Standards Training Hub.',
      type: 'info'
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                DPDPA 2023 Statutory Cross-Reference Engine
              </span>
              <span className="text-xs text-slate-400 font-medium">MeitY & DPBI Statutory Alignment</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-900/60 text-indigo-300 border border-indigo-700/50">
                Global Standards Integration
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span>Departmental Training Gap Analyzer</span>
              <GraduationCap className="w-7 h-7 text-amber-400 shrink-0" />
            </h2>

            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              Cross-references employee departmental roles against statutory obligations under the Digital Personal Data Protection Act (DPDPA 2023). Pinpoints operational compliance deficiencies, evaluates Section 33 regulatory fine exposures, and maps precise, lead-auditor-backed remediation modules from the <strong>Global Standards Training Hub</strong> (ISO 27001, EU GDPR, ISO 27701, DORA & IMS).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleCopyDossier}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 border border-slate-700 transition-all cursor-pointer"
            >
              {copiedDossier ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-300" />}
              <span>{copiedDossier ? 'Copied Dossier!' : 'Copy Dossier (MD)'}</span>
            </button>

            <button
              onClick={handleDownloadDossier}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 border border-slate-700 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Download Audit</span>
            </button>

            <button
              onClick={() => handleJumpToStandardsHub()}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Launch Standards Hub</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Executive KPI Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-6 mt-6 border-t border-slate-800/80">
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              Covered Roles
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono text-white">{metrics.totalRolesAssessed}</span>
              <span className="text-[10px] text-slate-500">({metrics.totalHeadcount} staff)</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Awareness Index
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className={`text-xl font-bold font-mono ${metrics.overallReadinessScore >= 75 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {metrics.overallReadinessScore}%
              </span>
              <span className="text-[10px] text-slate-500">Target: ≥90%</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
              <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
              Critical Gaps
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono text-rose-400">{metrics.criticalGapsCount}</span>
              <span className="text-[10px] text-rose-400/80 font-bold animate-pulse">Action Required</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              High-Risk Gaps
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono text-amber-400">{metrics.highGapsCount}</span>
              <span className="text-[10px] text-slate-500">In Triage</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Remediated Gaps
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono text-emerald-400">{metrics.remediatedGapsCount}</span>
              <span className="text-[10px] text-slate-500">Certified</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-amber-400" />
              Sec 33 Max Fine Risk
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-lg font-bold font-mono text-rose-300">₹250 Cr</span>
              <span className="text-[10px] text-slate-500">Statutory Ceiling</span>
            </div>
          </div>
        </div>
      </div>

      {/* Department Readiness Heatmap & Overview Matrix */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Departmental Statutory Awareness Heatmap
            </h3>
          </div>
          <span className="text-xs text-slate-400">Click any department to filter role profiles below</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {roleProfiles.map(role => {
            const avgProficiency = role.identifiedGaps.length > 0
              ? Math.round(role.identifiedGaps.reduce((sum, g) => sum + g.currentProficiency, 0) / role.identifiedGaps.length)
              : 0;

            const isSelected = selectedDepartment === role.department;
            const hasCritical = role.identifiedGaps.some(g => g.severity === 'CRITICAL' && g.status !== 'REMEDIATED');

            return (
              <button
                key={role.id}
                onClick={() => setSelectedDepartment(isSelected ? 'All' : role.department)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                  isSelected
                    ? 'bg-indigo-950/60 border-indigo-500 shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500/50'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {role.departmentCategory}
                    </span>
                    <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                      {role.department}
                    </h4>
                  </div>
                  {hasCritical ? (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-950 text-rose-300 border border-rose-800 shrink-0">
                      CRITICAL
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                      {role.riskExposureLevel}
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                <div className="mt-3 space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">Statutory Proficiency</span>
                    <span className={`font-mono font-bold ${avgProficiency >= 75 ? 'text-emerald-400' : avgProficiency >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                      {avgProficiency}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        avgProficiency >= 75 ? 'bg-emerald-500' : avgProficiency >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${avgProficiency}%` }}
                    />
                  </div>
                </div>

                <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400">
                  <span>{role.headcount} Personnel</span>
                  <span className="text-amber-400/90 font-medium">
                    {role.recommendedStandardsModules.length} Standards Modules
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Department Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-indigo-400" />
              Dept:
            </span>
            <select
              value={selectedDepartment}
              onChange={e => setSelectedDepartment(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-slate-200 focus:outline-none focus:border-amber-500"
            >
              {departmentsList.map(dept => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Severity Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Gap Severity:</span>
            <select
              value={selectedSeverity}
              onChange={e => setSelectedSeverity(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="All">All Severities</option>
              <option value="CRITICAL">Critical Severity</option>
              <option value="HIGH">High Severity</option>
              <option value="MEDIUM">Medium Severity</option>
              <option value="REMEDIATED">Remediated Only</option>
            </select>
          </div>

          {(selectedDepartment !== 'All' || selectedSeverity !== 'All' || searchQuery !== '') && (
            <button
              onClick={() => {
                setSelectedDepartment('All');
                setSelectedSeverity('All');
                setSearchQuery('');
              }}
              className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px] sm:min-w-[300px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search role, clause (e.g. 8(5)), data type, ISO 27001..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Role Profiles List */}
      <div className="space-y-4">
        {filteredProfiles.length === 0 ? (
          <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3">
            <AlertOctagon className="w-10 h-10 text-slate-600 mx-auto" />
            <h4 className="text-base font-bold text-white">No Matching Role Profiles Found</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              No department roles match the active filter or search query. Reset your criteria to view the complete organizational matrix.
            </p>
            <button
              onClick={() => {
                setSelectedDepartment('All');
                setSelectedSeverity('All');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          filteredProfiles.map(profile => {
            const isExpanded = expandedRoleId === profile.id;
            const avgProficiency = profile.identifiedGaps.length > 0
              ? Math.round(profile.identifiedGaps.reduce((sum, g) => sum + g.currentProficiency, 0) / profile.identifiedGaps.length)
              : 0;

            const isQuizSubmitted = !!quizSubmitted[profile.id];
            const currentAnswers = quizAnswers[profile.id] || {};

            return (
              <div
                key={profile.id}
                className="rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden transition-all"
              >
                {/* Role Header Accordion Toggle */}
                <div
                  onClick={() => setExpandedRoleId(isExpanded ? null : profile.id)}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-850/60 transition-colors"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                        {profile.department}
                      </span>
                      {profile.riskExposureLevel === 'CRITICAL' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-950 text-rose-300 border border-rose-800 flex items-center gap-1">
                          <AlertOctagon className="w-3 h-3 text-rose-400" />
                          CRITICAL RISK
                        </span>
                      ) : profile.riskExposureLevel === 'HIGH' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-amber-400" />
                          HIGH RISK
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-950 text-indigo-300 border border-indigo-800">
                          MEDIUM RISK
                        </span>
                      )}
                      <span className="text-xs text-slate-400 font-medium">
                        Headcount: <strong>{profile.headcount}</strong> personnel
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <span>{profile.roleTitle}</span>
                    </h3>

                    {/* Handled Data badges */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-slate-400 font-medium mr-1">Data Handled:</span>
                      {profile.dataTypesHandled.map((d, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md text-[10px] bg-slate-950 text-slate-300 border border-slate-800"
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    {/* Proficiency Metric Box */}
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400">Statutory Proficiency</div>
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-20 sm:w-28 h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              avgProficiency >= 75 ? 'bg-emerald-500' : avgProficiency >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${avgProficiency}%` }}
                          />
                        </div>
                        <span className={`text-sm font-bold font-mono ${avgProficiency >= 75 ? 'text-emerald-400' : avgProficiency >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                          {avgProficiency}%
                        </span>
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-800/80 text-slate-400">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Role Details */}
                {isExpanded && (
                  <div className="p-5 border-t border-slate-800/80 bg-slate-950/40 space-y-6">
                    {/* Statutory Obligations vs Penalties Grid */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Scale className="w-4 h-4 text-amber-400" />
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                          DPDPA 2023 Statutory Awareness Requirements
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {profile.statutoryRequirements.map((req, idx) => (
                          <div
                            key={idx}
                            className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 relative flex flex-col justify-between"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-indigo-950 text-indigo-300 border border-indigo-800">
                                  {req.clause}
                                </span>
                                <span className="text-[10px] font-bold text-rose-400">
                                  {req.penaltyExposure}
                                </span>
                              </div>
                              <div className="text-xs font-bold text-slate-100">{req.ruleName}</div>
                              <p className="text-[11px] text-slate-300 leading-relaxed">
                                {req.statutoryObligation}
                              </p>
                            </div>

                            <div className="pt-2 mt-2 border-t border-slate-800/80 text-[10px] text-slate-400">
                              <strong className="text-slate-300">Consequence:</strong> {req.consequenceOfFailure}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Identified Operational Gaps */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-rose-400" />
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                            Identified Departmental Awareness & Operational Gaps
                          </h4>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          Click checkbox to toggle remediation status
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {profile.identifiedGaps.map(gap => (
                          <div
                            key={gap.id}
                            className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                              gap.status === 'REMEDIATED'
                                ? 'bg-emerald-950/20 border-emerald-800/40 text-slate-300'
                                : gap.severity === 'CRITICAL'
                                ? 'bg-rose-950/20 border-rose-800/50 text-slate-200'
                                : 'bg-slate-900 border-slate-800 text-slate-200'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <button
                                onClick={() => handleToggleGapStatus(profile.id, gap.id)}
                                className={`mt-0.5 p-1 rounded-md transition-colors cursor-pointer ${
                                  gap.status === 'REMEDIATED'
                                    ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                                    : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                                }`}
                              >
                                {gap.status === 'REMEDIATED' ? (
                                  <CheckSquare className="w-4 h-4" />
                                ) : (
                                  <div className="w-4 h-4 rounded-sm border border-slate-500" />
                                )}
                              </button>

                              <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                      gap.severity === 'CRITICAL'
                                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                        : gap.severity === 'HIGH'
                                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                        : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                                    }`}
                                  >
                                    {gap.severity}
                                  </span>

                                  <h5 className="text-xs font-bold text-white">{gap.gapTitle}</h5>

                                  {gap.status === 'REMEDIATED' && (
                                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700 flex items-center gap-1">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                      Remediated & Certified
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-300">{gap.description}</p>
                              </div>
                            </div>

                            {/* Proficiency & Quick Action */}
                            <div className="flex items-center gap-4 shrink-0 sm:self-center pl-7 sm:pl-0">
                              <div className="text-right">
                                <div className="text-[10px] text-slate-400">Readiness</div>
                                <div className="text-xs font-bold font-mono text-amber-300">
                                  {gap.currentProficiency}%{' '}
                                  <span className="text-[10px] text-slate-500 font-normal">
                                    / {gap.targetProficiency}%
                                  </span>
                                </div>
                              </div>

                              <button
                                onClick={() => handleToggleGapStatus(profile.id, gap.id)}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                                  gap.status === 'REMEDIATED'
                                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
                                }`}
                              >
                                {gap.status === 'REMEDIATED' ? 'Reopen Gap' : 'Mark Remediated'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Standards Training Hub Module Recommendations */}
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-indigo-950/30 border border-indigo-800/50 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-amber-400" />
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                            Recommended Remediation Modules From Global Standards Hub
                          </h4>
                        </div>
                        <button
                          onClick={() => handleJumpToStandardsHub()}
                          className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <span>Explore All Standards</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {profile.recommendedStandardsModules.map(mod => (
                          <div
                            key={mod.id}
                            className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3 flex flex-col justify-between hover:border-amber-500/40 transition-all shadow-md"
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                  {mod.standardCode}
                                </span>
                                <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-slate-500" />
                                  {mod.durationMinutes} mins • {mod.level}
                                </span>
                              </div>

                              <h5 className="text-xs font-bold text-white hover:text-amber-300 transition-colors">
                                {mod.courseTitle}
                              </h5>

                              <p className="text-[11px] text-slate-300 leading-relaxed">
                                {mod.curriculumSummary}
                              </p>

                              <div className="space-y-1 pt-1">
                                <div className="text-[10px] text-indigo-300 font-semibold flex items-center gap-1">
                                  <FileText className="w-3 h-3" />
                                  Matched Policy Template: {mod.standardsTemplateMatch || mod.standardsTemplateMatch}
                                </div>

                                <div className="text-[10px] text-amber-300/90 italic bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                                  <span className="font-bold text-amber-400 not-italic">Auditor Defense Inquest: </span>
                                  "{mod.auditorDefenseFocus}"
                                </div>
                              </div>
                            </div>

                            <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                              <button
                                onClick={() => setActiveCourseModal(mod)}
                                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                              >
                                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                                <span>Inspect Syllabus</span>
                              </button>

                              <button
                                onClick={() => handleAssignTrainingTrack(profile.roleTitle, mod.courseTitle)}
                                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer"
                              >
                                <Award className="w-3.5 h-3.5" />
                                <span>Assign Course</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Interactive Role Statutory Diagnostic Check */}
                    {profile.quickDiagnosticQuestions && profile.quickDiagnosticQuestions.length > 0 && (
                      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <HelpCircle className="w-4 h-4 text-indigo-400" />
                            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                              Interactive Role Knowledge Diagnostic ({profile.quickDiagnosticQuestions.length} Questions)
                            </h4>
                          </div>
                          {isQuizSubmitted && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                              Diagnostic Completed
                            </span>
                          )}
                        </div>

                        <div className="space-y-4">
                          {profile.quickDiagnosticQuestions.map(q => {
                            const selectedOption = currentAnswers[q.id];
                            const isCorrect = selectedOption === q.correctIndex;

                            return (
                              <div
                                key={q.id}
                                className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <span className="text-xs font-bold text-white">
                                    Q{q.id}: {q.question}
                                  </span>
                                  <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-800 text-amber-300 border border-slate-700 shrink-0">
                                    {q.statutoryBasis}
                                  </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {q.options.map((opt, optIdx) => {
                                    const isThisSelected = selectedOption === optIdx;
                                    let btnStyle = 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800';

                                    if (isQuizSubmitted) {
                                      if (optIdx === q.correctIndex) {
                                        btnStyle = 'bg-emerald-950/80 border-emerald-600 text-emerald-200 font-bold';
                                      } else if (isThisSelected && !isCorrect) {
                                        btnStyle = 'bg-rose-950/80 border-rose-600 text-rose-200';
                                      }
                                    } else if (isThisSelected) {
                                      btnStyle = 'bg-indigo-900/60 border-indigo-500 text-white font-bold';
                                    }

                                    return (
                                      <button
                                        key={optIdx}
                                        disabled={isQuizSubmitted}
                                        onClick={() => handleAnswerQuestion(profile.id, q.id, optIdx)}
                                        className={`p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer ${btnStyle}`}
                                      >
                                        <div className="flex items-center gap-2">
                                          <div className={`w-4 h-4 rounded-full border text-[9px] flex items-center justify-center font-bold shrink-0 ${
                                            isThisSelected ? 'border-amber-400 bg-amber-400 text-slate-950' : 'border-slate-600 text-slate-400'
                                          }`}>
                                            {String.fromCharCode(65 + optIdx)}
                                          </div>
                                          <span>{opt}</span>
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>

                                {isQuizSubmitted && (
                                  <div className={`p-2.5 rounded-lg border text-xs leading-relaxed ${
                                    isCorrect ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300' : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
                                  }`}>
                                    <div className="font-bold mb-0.5">
                                      {isCorrect ? 'Correct Statutory Rationale:' : 'Incorrect Answer:'}
                                    </div>
                                    <p>{q.explanation}</p>
                                  </div>
                                )}
                              </div>
                            );
                          })}

                          {!isQuizSubmitted && (
                            <button
                              onClick={() => handleSubmitQuiz(profile.id, profile)}
                              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/20 cursor-pointer"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Submit Diagnostic & Recalculate Proficiency</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Department Staff Roster Drilldown */}
                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-slate-400" />
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                            Sample Staff Roster & Enrolled Training Tracks
                          </h4>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          Showing sample staff under {profile.roleTitle}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {profile.sampleEmployees.map(emp => (
                          <div
                            key={emp.id}
                            className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-indigo-900 text-indigo-200 text-xs font-bold flex items-center justify-center">
                                  {emp.avatarInitials}
                                </div>
                                <div>
                                  <div className="text-xs font-bold text-white">{emp.name}</div>
                                  <div className="text-[10px] text-slate-500">{emp.email}</div>
                                </div>
                              </div>
                              <span
                                className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                  emp.status === 'CERTIFIED'
                                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                    : emp.status === 'ENROLLED'
                                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                                }`}
                              >
                                {emp.status === 'CERTIFIED' ? 'Certified' : emp.status === 'ENROLLED' ? 'In Progress' : 'Pending'}
                              </span>
                            </div>

                            <div className="text-[10px] text-slate-400 truncate">
                              <strong>Course:</strong> {emp.assignedCourse}
                            </div>

                            <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-800/80">
                              <span className="text-slate-500">Last Assessed: {emp.lastAssessed}</span>
                              <span className="font-mono font-bold text-amber-400">{emp.score}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Standards Course Detailed Syllabus Modal */}
      {activeCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {activeCourseModal.standardCode}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {activeCourseModal.standardName}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">
                  {activeCourseModal.courseTitle}
                </h3>
              </div>
              <button
                onClick={() => setActiveCourseModal(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">
                  Curriculum Overview & Learning Objectives
                </div>
                <p className="leading-relaxed text-slate-300">
                  {activeCourseModal.curriculumSummary}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-[11px] font-bold text-amber-400">Duration & Difficulty</div>
                  <div className="text-white font-medium">
                    {activeCourseModal.durationMinutes} Minutes • {activeCourseModal.level}
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    Clause Alignment: {activeCourseModal.clauseRef}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-[11px] font-bold text-emerald-400">Matched Policy Template</div>
                  <div className="text-white font-medium truncate">
                    {activeCourseModal.standardsTemplateMatch || activeCourseModal.standardsTemplateMatch}
                  </div>
                  <div className="text-slate-400 text-[11px]">Includes customizable doc template</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">
                  Deliverables & Proof of Competence
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  {activeCourseModal.deliverablesCovered.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/60 text-amber-200 space-y-1">
                <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                  Lead Auditor Defense Question
                </div>
                <p className="italic leading-relaxed">
                  "{activeCourseModal.auditorDefenseFocus}"
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                onClick={() => setActiveCourseModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setActiveCourseModal(null);
                  handleJumpToStandardsHub(activeCourseModal.standardId);
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>Open in Standards Training Hub</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
