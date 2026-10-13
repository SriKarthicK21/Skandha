import React, { useState, useMemo } from 'react';
import { useGRC } from '../../context/GRCContext';
import { PageContainer } from '../layout/PageContainer';
import {
  ShieldCheck,
  Lock,
  Download,
  Printer,
  Filter,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  FileText,
  Building,
  Key,
  Users,
  Cpu,
  Layers,
  Sparkles,
  Check,
  ChevronDown,
  ExternalLink,
  ShieldAlert,
  RefreshCw,
  Zap,
  SlidersHorizontal,
  ArrowRight,
  Shield,
  AlertTriangle,
  FileDown,
  Info,
  Eye,
  Tag,
  CheckSquare,
  Calendar,
  Award
} from 'lucide-react';
import { ControlItem, RiskRecord } from '../../types';
import { analyzeSoARiskAlignment } from '../../services/soaRiskSyncService';
import { SoASyncVerifierModal } from './SoASyncVerifierModal';
import { exportStatementOfApplicabilityPDF } from '../../utils/soaBaselineExporter';
import {
  ISO27001_2022_93_MASTER,
  ISO27001Control2022Meta,
  getSoAThemeSummary
} from '../../data/iso27001_2022_masterControls';
import { INITIAL_INTERNAL_AUDITS, INITIAL_FINDINGS } from '../../data/initialData';
import { SoAJustificationWorkflowModal } from '../soa/SoAJustificationWorkflowModal';
import { SoADocumentPreviewModal } from '../soa/SoADocumentPreviewModal';
import { SoAArtifactMappingModal } from '../soa/SoAArtifactMappingModal';
import { SoAControlRemediationDrawer } from '../soa/SoAControlRemediationDrawer';
import { ControlPerformanceDashboard } from '../soa/ControlPerformanceDashboard';
import { ISO27001ReadinessRoadmapCard } from '../soa/ISO27001ReadinessRoadmapCard';
import { ISO27001ReadinessScorecard } from '../soa/ISO27001ReadinessScorecard';
import { getControlPerformanceStatus } from '../../utils/soaPerformanceHelper';
import {
  calculateControlArtifactReadiness,
  getMappedPoliciesForControl,
  getMappedEvidenceForControl
} from '../../utils/soaArtifactMappingHelper';
import { Paperclip, Link2, GitCompare } from 'lucide-react';
import { SoAVersionDiffModal } from '../soa/SoAVersionDiffModal';

export const StatementOfApplicabilityModule: React.FC = () => {
  const {
    currentTenant,
    controls,
    risks,
    generatedDocs,
    evidence,
    uploadEvidence,
    updateControl,
    lockSoABaseline,
    currentRole,
    setActiveModule,
    syncRiskRegisterAndSoA,
    logAuditEvent,
    soaVerifierReport,
    soaVerificationIssues,
    simulateOutdatedSoARisk
  } = useGRC();

  const [selectedFramework, setSelectedFramework] = useState<string>('ISO_27001');
  const [selectedTheme, setSelectedTheme] = useState<string>('All');
  const [applicabilityFilter, setApplicabilityFilter] = useState<'All' | 'Applicable' | 'Excluded'>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [riskMappingFilter, setRiskMappingFilter] = useState<'All' | 'WithRisks' | 'NoRisks'>('All');
  const [artifactFilter, setArtifactFilter] = useState<'All' | 'AuditReady' | 'MissingPolicy' | 'MissingEvidence' | 'NoArtifacts'>('All');
  const [showNew2022Only, setShowNew2022Only] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Selected control for the formal justification workflow modal
  const [workflowControl, setWorkflowControl] = useState<ControlItem | null>(null);

  // Selected control for the detailed compliance remediation & notes side-drawer
  const [remediationControl, setRemediationControl] = useState<ControlItem | null>(null);

  // Selected control for the dedicated artifact mapping modal
  const [mappingModalControl, setMappingModalControl] = useState<ControlItem | null>(null);

  // Document Preview modal state
  const [showDocumentPreview, setShowDocumentPreview] = useState<boolean>(false);

  // Baseline Locking state
  const [isLocking, setIsLocking] = useState<boolean>(false);
  const [lockSuccess, setLockSuccess] = useState<boolean>(false);

  // Dynamic Sync state
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncReport, setSyncReport] = useState<{ changesCount: number; changeLog: string[] } | null>(null);
  const [showSyncModal, setShowSyncModal] = useState<boolean>(false);

  // SoA Sync Verifier Modal state
  const [showVerifierModal, setShowVerifierModal] = useState<boolean>(false);

  // ISO 27001 Certification Readiness Scorecard toggle
  const [showReadinessScorecard, setShowReadinessScorecard] = useState<boolean>(true);

  // SoA Version Diff & Cryptographic Sign-Off Modal state
  const [showVersionDiffModal, setShowVersionDiffModal] = useState<boolean>(false);

  const isAuditorOrAdmin =
    currentRole === 'SUPER_ADMIN' || currentRole === 'COMPANY_ADMIN' || currentRole === 'PLATFORM_AUDITOR';

  // Tenant risks
  const tenantRisks = useMemo(
    () => risks.filter(r => r.tenantId === currentTenant?.id),
    [risks, currentTenant?.id]
  );

  // Alignment Analysis (ISO 27001 Cl. 6.1.2 & 6.1.3)
  const alignmentReport = useMemo(
    () => analyzeSoARiskAlignment(tenantRisks, controls),
    [tenantRisks, controls]
  );

  // Scoped Controls: For ISO_27001, strictly isolate the 93 ISO 27001:2022 controls
  const frameworkScopedControls = useMemo(() => {
    return controls.filter(c => {
      if (selectedFramework === 'All') return true;
      if (selectedFramework === 'ISO_27001') {
        return (!c.framework || c.framework.includes('27001')) && !c.framework?.includes('42001');
      }
      if (selectedFramework === 'ISO_42001') {
        return c.framework?.includes('42001');
      }
      return true;
    });
  }, [controls, selectedFramework]);

  // Statistics
  const totalControls = frameworkScopedControls.length;
  const applicableControls = frameworkScopedControls.filter(c => c.applicable);
  const excludedControls = frameworkScopedControls.filter(c => !c.applicable);
  const implementedControls = frameworkScopedControls.filter(
    c =>
      c.applicable &&
      (c.implementationStatus === 'Implemented' ||
        c.implementationStatus === 'Monitored' ||
        c.implementationStatus === 'Audited')
  );
  const implementationPercentage =
    applicableControls.length > 0
      ? Math.round((implementedControls.length / applicableControls.length) * 100)
      : 0;

  // 3-Part Exclusion Defense Analysis (ISO 27001 Cl. 6.1.3(d))
  const exclusionDefenseStats = useMemo(() => {
    let completeCount = 0;
    excludedControls.forEach(ctrl => {
      const scope = ctrl.scopeBoundaryCitation || (ctrl.justification?.match(/\[(?:Cl\.\s*4\.3\s*Scope|Scope(?:\s*Boundary)?):\s*([^\]]+)\]/i)?.[1]);
      const risk = ctrl.riskAssessmentCitation || (ctrl.justification?.match(/\[(?:Cl\.\s*6\.1\.2\s*Risk|Risk(?:\s*Ref|\s*Assessment)?):\s*([^\]]+)\]/i)?.[1]);
      const comp = ctrl.compensatingControlRef || (ctrl.justification?.match(/\[(?:Compensating(?:\s*Control)?):\s*([^\]]+)\]/i)?.[1]);
      if (scope?.trim() && risk?.trim() && comp?.trim()) {
        completeCount++;
      }
    });
    const rate = excludedControls.length > 0 ? Math.round((completeCount / excludedControls.length) * 100) : 100;
    return {
      total: excludedControls.length,
      completeCount,
      incompleteCount: excludedControls.length - completeCount,
      rate
    };
  }, [excludedControls]);

  // 4 Themes Analysis (Organizational A.5, People A.6, Physical A.7, Technological A.8)
  const themesOverview = useMemo(() => {
    const definitions = [
      { key: 'Organizational', clause: 'Annex A.5', countExpected: 37, icon: Building, color: 'indigo' },
      { key: 'People', clause: 'Annex A.6', countExpected: 8, icon: Users, color: 'sky' },
      { key: 'Physical', clause: 'Annex A.7', countExpected: 14, icon: Shield, color: 'emerald' },
      { key: 'Technological', clause: 'Annex A.8', countExpected: 34, icon: Cpu, color: 'purple' }
    ];

    return definitions.map(def => {
      const themeControls = frameworkScopedControls.filter(c => c.category === def.key);
      const appCount = themeControls.filter(c => c.applicable).length;
      const excCount = themeControls.filter(c => !c.applicable).length;
      const impCount = themeControls.filter(
        c =>
          c.applicable &&
          (c.implementationStatus === 'Implemented' ||
            c.implementationStatus === 'Audited' ||
            c.implementationStatus === 'Monitored')
      ).length;
      const rate = appCount > 0 ? Math.round((impCount / appCount) * 100) : 0;

      return {
        ...def,
        total: themeControls.length,
        applicable: appCount,
        excluded: excCount,
        implemented: impCount,
        rate
      };
    });
  }, [frameworkScopedControls]);

  // Filtered Controls
  const filteredControls = frameworkScopedControls.filter(c => {
    const matchesTheme =
      selectedTheme === 'All' || c.category.toLowerCase().includes(selectedTheme.toLowerCase());
    const matchesApplicability =
      applicabilityFilter === 'All' ||
      (applicabilityFilter === 'Applicable' && c.applicable) ||
      (applicabilityFilter === 'Excluded' && !c.applicable);
    const perfStatus = getControlPerformanceStatus(c.implementationStatus);
    const matchesStatus =
      statusFilter === 'All' ||
      c.implementationStatus === statusFilter ||
      (statusFilter === 'Implemented' && perfStatus === 'Implemented') ||
      (statusFilter === 'Partially Implemented' && perfStatus === 'Partially Implemented') ||
      (statusFilter === 'Planned' && perfStatus === 'Planned');
    const matchesRiskMapping =
      riskMappingFilter === 'All' ||
      (riskMappingFilter === 'WithRisks' && (c.mappedRiskCodes?.length || 0) > 0) ||
      (riskMappingFilter === 'NoRisks' && (!c.mappedRiskCodes || c.mappedRiskCodes.length === 0));

    // 2022 New Controls filter
    const meta = ISO27001_2022_93_MASTER.find(m => m.controlCode === c.controlCode);
    const matchesNew2022 = !showNew2022Only || (meta?.isNewIn2022 === true);

    const matchesSearch =
      c.controlCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.justification || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.responsibleDepartment || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (meta?.iso2013Mapping || '').toLowerCase().includes(searchTerm.toLowerCase());

    return (
      matchesTheme &&
      matchesApplicability &&
      matchesStatus &&
      matchesRiskMapping &&
      matchesNew2022 &&
      matchesSearch
    );
  });

  const handleOpenWorkflowModal = (ctrl: ControlItem) => {
    setWorkflowControl(ctrl);
  };

  const handleOpenRemediationDrawer = (ctrl: ControlItem) => {
    setRemediationControl(ctrl);
  };

  const handleSaveRemediationPlan = (controlId: string, updated: Partial<ControlItem>) => {
    updateControl(controlId, updated);
    const ctrl = controls.find(c => c.id === controlId);
    logAuditEvent(
      'UPDATE',
      'Statement of Applicability',
      `Updated compliance remediation plan for ${ctrl?.controlCode || controlId} (${ctrl?.title || ''}): Owner=${updated.remediationOwner || 'N/A'}, Deadline=${updated.targetDate || 'N/A'}, Status=${updated.implementationStatus}`
    );
    setRemediationControl(null);
  };

  const handleSaveWorkflowEdit = (updated: Partial<ControlItem>) => {
    if (!workflowControl) return;
    updateControl(workflowControl.id, updated);
    logAuditEvent(
      'UPDATE',
      'Statement of Applicability',
      `Updated SoA justification for ${workflowControl.controlCode} (${workflowControl.title}): ${
        updated.applicable ? 'Applicable' : 'Excluded'
      } - ${updated.implementationStatus}`
    );
    setWorkflowControl(null);
  };

  const handleUpdateControlStatus = (controlId: string, newStatus: ControlItem['implementationStatus']) => {
    updateControl(controlId, { implementationStatus: newStatus });
    const ctrl = controls.find(c => c.id === controlId);
    logAuditEvent(
      'UPDATE',
      'Statement of Applicability',
      `Updated implementation status for ${ctrl?.controlCode || controlId} (${ctrl?.title || ''}) to ${newStatus}`
    );
  };

  const handleLockBaseline = async () => {
    if (!currentTenant) return;
    setIsLocking(true);
    await lockSoABaseline(currentTenant.id);
    setIsLocking(false);
    setLockSuccess(true);
    setTimeout(() => setLockSuccess(false), 4000);
  };

  // Dynamic Sync
  const handlePerformSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      const res = syncRiskRegisterAndSoA();
      setSyncReport(res);
      setIsSyncing(false);
    }, 400);
  };

  const [isExportingPDF, setIsExportingPDF] = useState<boolean>(false);

  const handleExportPDF = async () => {
    if (!currentTenant) return;
    setIsExportingPDF(true);
    try {
      await exportStatementOfApplicabilityPDF({
        controls,
        tenant: currentTenant,
        baselineVersion: 'v2.4 (2026 Audit Baseline)',
        sha256Digest: currentTenant.soaBaselineHash,
        approvalDate: currentTenant.soaBaselineTimestamp
          ? new Date(currentTenant.soaBaselineTimestamp).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0]
      });
      logAuditEvent(
        'EXPORT',
        'Statement of Applicability',
        `Exported formal ISO/IEC 27001:2022 Statement of Applicability (SoA) 93-Control Audit PDF for ${currentTenant.name}`
      );
    } catch (err) {
      console.error('Failed to export SoA PDF:', err);
    } finally {
      setIsExportingPDF(false);
    }
  };

  const exportCSV = () => {
    const headers = [
      'Control Code',
      'Theme / Category',
      'Title',
      'Applicability (Clause 6.1.3 d)',
      'Implementation Status',
      'Mapped Active Risks',
      'Formal Justification',
      'Responsible Department',
      'Owner',
      'ISO 27001:2013 Crosswalk',
      'Framework'
    ];
    const rows = frameworkScopedControls.map(c => {
      const meta = ISO27001_2022_93_MASTER.find(m => m.controlCode === c.controlCode);
      return [
        `"${c.controlCode}"`,
        `"${c.category}"`,
        `"${c.title.replace(/"/g, '""')}"`,
        c.applicable ? 'Applicable (In-Scope)' : 'Excluded (Defensible Rationale)',
        `"${c.implementationStatus}"`,
        `"${(c.mappedRiskCodes || []).join('; ')}"`,
        `"${(c.justification || '').replace(/"/g, '""')}"`,
        `"${c.responsibleDepartment}"`,
        `"${c.remediationOwner || 'Information Security'}"`,
        `"${meta?.iso2013Mapping || 'Direct'}"`,
        `"${c.framework || 'ISO/IEC 27001:2022'}"`
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `SKANDA_SoA_Statement_of_Applicability_${(currentTenant?.name || 'Enterprise').replace(/\s+/g, '_')}_ISO27001_2022.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <PageContainer id="soa-module">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 px-2.5 py-0.5 rounded bg-indigo-950 border border-indigo-800 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                ISO/IEC 27001:2022 Clause 6.1.3 d
              </span>
              <span className="text-xs text-slate-400">
                Mandatory Certification Artifact • Continuous Risk Register Harmonization
              </span>
            </div>
            <h1 className="text-xl font-bold text-white mt-1.5 flex items-center gap-2">
              Statement of Applicability (SoA) Hub
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Authoritative central hub for all 93 Annex A controls across Organizational, People, Physical, and Technological
              themes. Supports formal inclusion/exclusion workflows, risk alignment verification, cryptographic baseline locking, and official auditor-ready PDF generation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setShowReadinessScorecard(prev => !prev)}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
                showReadinessScorecard
                  ? 'bg-indigo-950 text-indigo-300 border border-indigo-700'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
              title="Toggle ISO 27001 Certification Readiness Scorecard"
            >
              <Award className="w-3.5 h-3.5 text-indigo-400" />
              <span>{showReadinessScorecard ? 'Hide Scorecard' : 'Readiness Scorecard'}</span>
            </button>

            <button
              onClick={() => setShowDocumentPreview(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition shadow-sm"
              title="Inspect formal multi-page document layout with management sign-offs"
            >
              <Eye className="w-3.5 h-3.5 text-indigo-400" />
              <span>Preview Formal SoA</span>
            </button>

            <button
              onClick={() => setShowVersionDiffModal(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition shadow-sm"
              title="Compare SoA versions (v1.0 vs v2.0) and inspect digital signatures"
            >
              <GitCompare className="w-3.5 h-3.5 text-indigo-400" />
              <span>Version Diff & Sign-Off</span>
            </button>

            <button
              onClick={handleExportPDF}
              disabled={isExportingPDF}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-md shadow-indigo-600/20 disabled:opacity-50"
              title="Export formal ISO/IEC 27001:2022 Statement of Applicability Audit PDF with cryptographic hash"
            >
              <FileDown className={`w-3.5 h-3.5 ${isExportingPDF ? 'animate-bounce' : ''}`} />
              <span>{isExportingPDF ? 'Generating Audit PDF...' : 'Export SoA PDF'}</span>
            </button>

            <button
              onClick={exportCSV}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition shadow-sm"
              title="Export Statement of Applicability as CSV"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>Export CSV</span>
            </button>

            {isAuditorOrAdmin && (
              <button
                onClick={handleLockBaseline}
                disabled={isLocking || currentTenant?.soaBaselineLocked}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-md ${
                  currentTenant?.soaBaselineLocked
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800 cursor-default'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-950/50'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>
                  {isLocking
                    ? 'Computing Hash...'
                    : currentTenant?.soaBaselineLocked
                    ? 'Baseline Locked'
                    : 'Lock SoA Baseline'}
                </span>
              </button>
            )}
          </div>
        </div>

        {currentTenant?.soaBaselineLocked && (
          <div className="mt-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center space-x-2 text-slate-300">
              <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                SoA Baseline is cryptographically locked for audit. Locked on{' '}
                <strong className="text-white">
                  {new Date(currentTenant.soaBaselineTimestamp || '').toLocaleDateString()}
                </strong>
                .
              </span>
            </div>
            <span className="font-mono text-[10px] text-slate-400 truncate max-w-xs">
              SHA-256: {currentTenant.soaBaselineHash}
            </span>
          </div>
        )}

        {lockSuccess && (
          <div className="mt-3 p-3 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-700 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>SoA Baseline successfully computed and cryptographically locked for audit!</span>
          </div>
        )}
      </div>

      {/* ISO 27001 CERTIFICATION READINESS SCORECARD (Aggregates Clauses 4-10 & Annex A Controls) */}
      {showReadinessScorecard && (
        <ISO27001ReadinessScorecard
          controls={frameworkScopedControls}
          evidence={evidence}
          internalAudits={INITIAL_INTERNAL_AUDITS}
          findings={INITIAL_FINDINGS}
          onSelectThemeFilter={(themeCode) => {
            if (themeCode === 'theme_5') setSelectedTheme('Theme 5');
            else if (themeCode === 'theme_6') setSelectedTheme('Theme 6');
            else if (themeCode === 'theme_7') setSelectedTheme('Theme 7');
            else if (themeCode === 'theme_8') setSelectedTheme('Theme 8');
          }}
          onOpenRemediationDrawer={handleOpenRemediationDrawer}
          onNavigateToClauses={() => setActiveModule('iso27001_clauses')}
        />
      )}

      {/* ISO 27001 CERTIFICATION READINESS ROADMAP (5-Step Execution Card) */}
      <ISO27001ReadinessRoadmapCard
        controls={frameworkScopedControls}
        onOpenRemediationDrawer={handleOpenRemediationDrawer}
        onFilterStatus={setStatusFilter}
        onLockBaseline={handleLockBaseline}
        onExportPDF={handleExportPDF}
        isBaselineLocked={!!currentTenant?.soaBaselineLocked}
        baselineHash={currentTenant?.soaBaselineHash}
      />

      {/* CONTROL PERFORMANCE DASHBOARD (Visualizing Implementation Status of 93 ISO 27001:2022 Controls) */}
      <ControlPerformanceDashboard
        controls={frameworkScopedControls}
        activeStatusFilter={statusFilter}
        onSelectStatusFilter={setStatusFilter}
        onOpenWorkflowModal={handleOpenWorkflowModal}
        onOpenRemediationDrawer={handleOpenRemediationDrawer}
        onUpdateControlStatus={handleUpdateControlStatus}
      />

      {/* 4 THEMES INTERACTIVE COMMAND CARDS */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>ISO/IEC 27001:2022 Annex A Themes (Click Theme to Filter)</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Active Filter: <strong className="text-white">{selectedTheme === 'All' ? 'All 93 Controls' : `${selectedTheme} Controls`}</strong>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {themesOverview.map(t => {
            const Icon = t.icon;
            const isSelected = selectedTheme === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setSelectedTheme(isSelected ? 'All' : t.key)}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'bg-indigo-950/60 border-indigo-500 shadow-lg shadow-indigo-950/40 ring-1 ring-indigo-500'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                    {t.clause}
                  </span>
                  <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <div className="text-sm font-bold text-white mb-1">{t.key}</div>

                <div className="flex items-baseline justify-between text-xs mb-2">
                  <span className="text-slate-400">
                    <strong className="text-white text-base">{t.total}</strong> controls
                  </span>
                  <span className="text-emerald-400 font-bold font-mono">{t.rate}% implemented</span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-950 rounded-full h-1.5 mb-2 overflow-hidden border border-slate-800">
                  <div
                    className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${t.rate}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                  <span className="text-emerald-400">{t.applicable} in-scope</span>
                  <span className="text-amber-400">{t.excluded} excluded</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* STATEMENT OF APPLICABILITY (SoA) SYNC VERIFIER (ISO 27001 Cl. 6.1.3 d) */}
      <div
        className={`p-6 rounded-2xl border shadow-md space-y-4 transition-all ${
          soaVerifierReport.outdatedCount > 0
            ? 'bg-gradient-to-r from-slate-900 via-amber-950/25 to-slate-900 border-amber-800/80 shadow-amber-950/20'
            : 'bg-slate-900 border-slate-800'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold flex items-center gap-1.5 ${
                  soaVerifierReport.outdatedCount > 0
                    ? 'bg-amber-950 text-amber-300 border border-amber-700'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                }`}
              >
                {soaVerifierReport.outdatedCount > 0 ? (
                  <>
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    {soaVerifierReport.outdatedCount} Outdated Exclusion(s) Detected
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    100% Exclusions Verified & Defensible
                  </>
                )}
              </span>
              <span className="text-xs text-slate-400">
                Continuous Justification Integrity Monitor (ISO 27001 Cl. 6.1.3 d)
              </span>
            </div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              SoA Sync Verifier: Exclusion Justification Engine
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl">
              Monitors new risks identified in the Risk Register. If an excluded Annex A control is contradicted by a newly identified threat, or relied upon as mitigation, the Verifier notifies you that the exclusion rationale is outdated and facilitates one-click reconciliation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowVerifierModal(true)}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-amber-600/20 transition-all"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Open SoA Sync Verifier ({soaVerifierReport.outdatedCount})</span>
            </button>
            <button
              onClick={() => {
                simulateOutdatedSoARisk();
                setShowVerifierModal(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-900/60 font-semibold text-xs flex items-center space-x-1.5 transition-all"
              title="Add a test risk to demonstrate outdated justification detection"
            >
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              <span>Simulate Risk Trigger</span>
            </button>
          </div>
        </div>

        {soaVerifierReport.outdatedCount > 0 && (
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-amber-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-amber-200">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Action Required:</strong> Justifications for excluded controls{' '}
                <span className="font-mono font-bold text-white">
                  {soaVerificationIssues.map(i => i.controlCode).join(', ')}
                </span>{' '}
                are outdated based on active risks. Click to inspect auditor evidence and reconcile.
              </span>
            </div>
            <button
              onClick={() => setShowVerifierModal(true)}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2 shrink-0"
            >
              Review Discrepancies →
            </button>
          </div>
        )}
      </div>

      {/* DYNAMIC SOA & RISK REGISTER SYNC ENGINE BANNER */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-indigo-950 text-indigo-400 border border-indigo-800 flex items-center space-x-1">
                <Zap className="w-3 h-3 mr-1" />
                Clause 6.1.2 & 6.1.3 Engine
              </span>
              <span className="text-xs text-slate-400">
                Automated SoA & Risk Register Dynamic Harmonization
              </span>
            </div>
            <h2 className="text-base font-bold text-white">
              Live Bi-Directional Risk Register & SoA Alignment
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl">
              Eliminates manual double-entry. Automatically ensures that every risk treatment option links to verified
              Annex A controls, and flags any conflicting exclusions or orphaned high-severity risks.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePerformSync}
              disabled={isSyncing}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Reconciling Registers...' : 'Run Dynamic SoA & Risk Sync'}</span>
            </button>
            <button
              onClick={() => setShowSyncModal(true)}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold"
            >
              Inspection Report
            </button>
          </div>
        </div>

        {/* Sync Status Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700">
            <div className="text-[10px] uppercase font-bold text-slate-400">Risk-SoA Alignment Index</div>
            <div className="text-2xl font-bold text-emerald-400 mt-0.5">
              {alignmentReport.alignmentPercentage}%
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Continuous conformance</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700">
            <div className="text-[10px] uppercase font-bold text-slate-400">Active Risks Mapped</div>
            <div className="text-2xl font-bold text-white mt-0.5">{tenantRisks.length}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">From Clause 6.1.2 assessment</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700">
            <div className="text-[10px] uppercase font-bold text-slate-400">Mitigating Controls Mapped</div>
            <div className="text-2xl font-bold text-indigo-400 mt-0.5">
              {alignmentReport.mappedControlsCount}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Safeguards actively treating risks</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700">
            <div className="text-[10px] uppercase font-bold text-slate-400">Detected Conflicts / Gaps</div>
            <div
              className={`text-2xl font-bold mt-0.5 ${
                alignmentReport.conflicts.length > 0 ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              {alignmentReport.conflicts.length}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {alignmentReport.conflicts.length === 0 ? 'Zero discrepancies' : 'Auto-remediable with Sync'}
            </div>
          </div>
        </div>

        {/* Sync Success Feedback */}
        {syncReport && (
          <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-200 text-xs space-y-1 animate-fadeIn">
            <div className="font-bold flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>
                Dynamic Reconciliation Complete: {syncReport.changesCount} record(s) harmonized between Risk Register &
                SoA.
              </span>
            </div>
            {syncReport.changeLog.length > 0 && (
              <ul className="list-disc list-inside text-[11px] text-emerald-300/90 pt-1 space-y-0.5">
                {syncReport.changeLog.slice(0, 3).map((log, lIdx) => (
                  <li key={lIdx}>{log}</li>
                ))}
                {syncReport.changeLog.length > 3 && (
                  <li>...and {syncReport.changeLog.length - 3} more updates.</li>
                )}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">Total Annex A Controls</div>
          <div className="text-2xl font-black text-white">{totalControls}</div>
          <div className="text-[11px] text-slate-400">ISO/IEC 27001:2022 Catalogue</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">Applicable (In-Scope)</div>
          <div className="text-2xl font-black text-emerald-400">{applicableControls.length}</div>
          <div className="text-[11px] text-slate-400">Active ISMS Safeguards</div>
        </div>

        <button
          type="button"
          onClick={() => setApplicabilityFilter(applicabilityFilter === 'Excluded' ? 'All' : 'Excluded')}
          className={`p-4 rounded-2xl border text-left transition ${
            applicabilityFilter === 'Excluded'
              ? 'bg-amber-950/50 border-amber-500 ring-1 ring-amber-500'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
          title="Click to toggle filter for all Excluded controls"
        >
          <div className="flex items-center justify-between">
            <div className="text-[10px] uppercase font-bold text-slate-400">Justified Exclusions</div>
            <span
              className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border ${
                exclusionDefenseStats.incompleteCount === 0
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                  : 'bg-amber-950/80 text-amber-300 border-amber-800'
              }`}
            >
              {exclusionDefenseStats.rate}% 3-Part Defense
            </span>
          </div>
          <div className="text-2xl font-black text-amber-400 mt-1">{excludedControls.length}</div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/80 mt-1">
            <span>{exclusionDefenseStats.completeCount}/{excludedControls.length} audit-defensible</span>
            <span className="text-amber-400 font-bold text-[10px]">Filter →</span>
          </div>
        </button>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">Implementation Rate</div>
          <div className="text-2xl font-black text-indigo-400">{implementationPercentage}%</div>
          <div className="text-[11px] text-slate-400">
            {implementedControls.length} of {applicableControls.length} Implemented
          </div>
        </div>
      </div>

      {/* Framework Selector Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => {
            setSelectedFramework('ISO_27001');
            setSelectedTheme('All');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition ${
            selectedFramework === 'ISO_27001'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/50'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>ISO/IEC 27001:2022 ISMS (93 Controls)</span>
        </button>
        <button
          onClick={() => {
            setSelectedFramework('ISO_42001');
            setSelectedTheme('All');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition ${
            selectedFramework === 'ISO_42001'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/50'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>ISO/IEC 42001:2023 AIMS (38 Controls)</span>
        </button>
        <button
          onClick={() => {
            setSelectedFramework('All');
            setSelectedTheme('All');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition ${
            selectedFramework === 'All'
              ? 'bg-slate-700 text-white'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>All Scoped Frameworks</span>
        </button>
      </div>

      {/* Filters and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col lg:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search code, title, justification, or 2013 crosswalk..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* Theme Quick Pills */}
          <div className="flex items-center space-x-1 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs overflow-x-auto">
            {['All', 'Organizational', 'People', 'Physical', 'Technological'].map(theme => (
              <button
                key={theme}
                onClick={() => setSelectedTheme(theme)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  selectedTheme === theme ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {theme}
              </button>
            ))}
          </div>

          {/* 11 New 2022 Controls Toggle */}
          <button
            type="button"
            onClick={() => setShowNew2022Only(!showNew2022Only)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center space-x-1.5 transition ${
              showNew2022Only
                ? 'bg-purple-950 text-purple-300 border-purple-700 shadow-md shadow-purple-950/40'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Toggle filter for the 11 new controls introduced in ISO 27001:2022"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>11 New 2022 Controls</span>
          </button>

          {/* Applicability Filter */}
          <select
            value={applicabilityFilter}
            onChange={e => setApplicabilityFilter(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Scopes</option>
            <option value="Applicable">Applicable Only</option>
            <option value="Excluded">Excluded Only</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Statuses</option>
            <option value="Implemented">Implemented (Operational / Audited)</option>
            <option value="Partially Implemented">Partially Implemented (In Progress)</option>
            <option value="Planned">Planned (Not Started / Roadmapped)</option>
            <option value="In Progress">In Progress Only</option>
            <option value="Not Started">Not Started Only</option>
            <option value="Monitored">Monitored Only</option>
            <option value="Audited">Audited Only</option>
          </select>

          {/* Risk Mapping Filter */}
          <select
            value={riskMappingFilter}
            onChange={e => setRiskMappingFilter(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Risk Links</option>
            <option value="WithRisks">Mapped to Active Risks</option>
            <option value="NoRisks">No Direct Risks</option>
          </select>
        </div>
      </div>

      {/* Controls Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              <tr>
                <th className="p-3.5 pl-5">Code</th>
                <th className="p-3.5">Annex A Control Title & Theme</th>
                <th className="p-3.5 text-center">Applicable</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Linked Risks (Cl. 6.1.2)</th>
                <th className="p-3.5">Justification for Inclusion / Exclusion</th>
                <th className="p-3.5">Department & Owner</th>
                <th className="p-3.5 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredControls.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 text-xs">
                    No controls match your active filter criteria. Try resetting filters.
                  </td>
                </tr>
              ) : (
                filteredControls.map(ctrl => {
                  const mappedRisks = ctrl.mappedRiskCodes || [];
                  const outdatedIssue = soaVerificationIssues.find(i => i.controlCode === ctrl.controlCode);
                  const meta = ISO27001_2022_93_MASTER.find(m => m.controlCode === ctrl.controlCode);

                  return (
                    <tr key={ctrl.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5 pl-5 font-mono font-bold text-indigo-400">
                        {ctrl.controlCode}
                      </td>

                      <td className="p-3.5">
                        <div className="font-bold text-white max-w-xs truncate" title={ctrl.title}>
                          {ctrl.title}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 flex flex-wrap items-center gap-1.5">
                          <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                            {ctrl.category}
                          </span>
                          {meta?.isNewIn2022 && (
                            <span className="px-1.5 py-0.2 rounded bg-purple-950/80 text-purple-300 border border-purple-800 font-semibold flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5 text-purple-400" />
                              NEW 2022
                            </span>
                          )}
                          {meta?.iso2013Mapping && (
                            <span className="text-[9px] text-slate-500 font-mono" title={`2013 Legacy: ${meta.iso2013Mapping}`}>
                              Prev: {meta.iso2013Mapping}
                            </span>
                          )}
                          {outdatedIssue && (
                            <button
                              onClick={() => setShowVerifierModal(true)}
                              className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1 hover:bg-amber-900 transition"
                              title={outdatedIssue.invalidationReason}
                            >
                              <AlertTriangle className="w-3 h-3 text-amber-400" />
                              Outdated Justification
                            </button>
                          )}
                        </div>
                      </td>

                      <td className="p-3.5 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            ctrl.applicable
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          }`}
                        >
                          {ctrl.applicable ? 'In-Scope' : 'Excluded'}
                        </span>
                      </td>

                      <td className="p-3.5">
                        {(() => {
                          const perf = getControlPerformanceStatus(ctrl.implementationStatus);
                          const isImp = perf === 'Implemented';
                          const isPartial = perf === 'Partially Implemented';
                          return (
                            <button
                              type="button"
                              onClick={() => {
                                // Cycle status: Implemented -> Partially Implemented -> Planned -> Implemented
                                const nextStatus: ControlItem['implementationStatus'] =
                                  isImp ? 'In Progress' : isPartial ? 'Not Started' : 'Implemented';
                                handleUpdateControlStatus(ctrl.id, nextStatus);
                              }}
                              title="Click to cycle status (Implemented → Partially Implemented → Planned)"
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border transition hover:opacity-80 ${
                                isImp
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                  : isPartial
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                  : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                              }`}
                            >
                              {ctrl.implementationStatus === 'In Progress'
                                ? 'Partially Implemented'
                                : ctrl.implementationStatus === 'Not Started'
                                ? 'Planned'
                                : ctrl.implementationStatus}
                            </button>
                          );
                        })()}
                      </td>

                      {/* Linked Risks Column */}
                      <td className="p-3.5">
                        {mappedRisks.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {mappedRisks.map(rCode => (
                              <span
                                key={rCode}
                                className="px-1.5 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800 font-mono text-[10px] font-bold"
                              >
                                {rCode}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500 italic">Baseline control</span>
                        )}
                      </td>

                      <td className="p-3.5 max-w-sm">
                        {outdatedIssue && (
                          <div className="text-[10px] font-bold text-amber-400 mb-1.5 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                            <span>Invalidated by {outdatedIssue.triggeringRisk.riskCode}</span>
                          </div>
                        )}
                        {!ctrl.applicable ? (
                          <div className="space-y-1.5">
                            {(() => {
                              const scope = ctrl.scopeBoundaryCitation || (ctrl.justification?.match(/\[(?:Cl\.\s*4\.3\s*Scope|Scope(?:\s*Boundary)?):\s*([^\]]+)\]/i)?.[1]);
                              const risk = ctrl.riskAssessmentCitation || (ctrl.justification?.match(/\[(?:Cl\.\s*6\.1\.2\s*Risk|Risk(?:\s*Ref|\s*Assessment)?):\s*([^\]]+)\]/i)?.[1]);
                              const comp = ctrl.compensatingControlRef || (ctrl.justification?.match(/\[(?:Compensating(?:\s*Control)?):\s*([^\]]+)\]/i)?.[1]);
                              const isComplete = Boolean(scope?.trim() && risk?.trim() && comp?.trim());

                              let cleanNarrative = ctrl.justification || '';
                              if (scope || risk || comp) {
                                cleanNarrative = cleanNarrative
                                  .replace(/\[(?:Cl\.\s*4\.3\s*Scope|Scope(?:\s*Boundary)?):\s*[^\]]+\]/gi, '')
                                  .replace(/\[(?:Cl\.\s*6\.1\.2\s*Risk|Risk(?:\s*Ref|\s*Assessment)?):\s*[^\]]+\]/gi, '')
                                  .replace(/\[(?:Compensating(?:\s*Control)?):\s*[^\]]+\]/gi, '')
                                  .replace(/^\s*[-—–]+\s*/, '')
                                  .trim();
                              }

                              return (
                                <>
                                  <div className="flex items-center gap-1.5">
                                    <span
                                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${
                                        isComplete
                                          ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                                          : 'bg-rose-950/60 text-rose-300 border-rose-800'
                                      }`}
                                    >
                                      {isComplete ? (
                                        <>
                                          <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                                          <span>Cl. 6.1.3(d) 3-Part Defense Verified</span>
                                        </>
                                      ) : (
                                        <>
                                          <AlertCircle className="w-3 h-3 text-rose-400 shrink-0" />
                                          <span>Incomplete 3-Part Defense</span>
                                        </>
                                      )}
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-1 gap-1 text-[10px] font-mono">
                                    <div className="flex items-start gap-1 text-slate-300">
                                      <span className="text-indigo-400 font-bold shrink-0">1. Scope:</span>
                                      <span className="text-slate-300 truncate" title={scope || 'Missing'}>
                                        {scope || <span className="text-rose-400 font-sans">Missing Cl. 4.3 Citation</span>}
                                      </span>
                                    </div>
                                    <div className="flex items-start gap-1 text-slate-300">
                                      <span className="text-indigo-400 font-bold shrink-0">2. Risk:</span>
                                      <span className="text-slate-300 truncate" title={risk || 'Missing'}>
                                        {risk || <span className="text-rose-400 font-sans">Missing Cl. 6.1.2 Reference</span>}
                                      </span>
                                    </div>
                                    <div className="flex items-start gap-1 text-slate-300">
                                      <span className="text-indigo-400 font-bold shrink-0">3. Comp:</span>
                                      <span className="text-slate-300 truncate" title={comp || 'Missing'}>
                                        {comp || <span className="text-rose-400 font-sans">Missing Compensating Link</span>}
                                      </span>
                                    </div>
                                  </div>

                                  {cleanNarrative && (
                                    <div className="text-[11px] text-slate-400 line-clamp-1 italic" title={cleanNarrative}>
                                      "{cleanNarrative}"
                                    </div>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        ) : (
                          <div
                            className={`text-[11px] line-clamp-2 ${
                              outdatedIssue ? 'text-amber-200/90 font-medium' : 'text-slate-300'
                            }`}
                            title={ctrl.justification}
                          >
                            {ctrl.justification || 'No formal justification recorded.'}
                          </div>
                        )}
                      </td>

                      <td className="p-3.5 text-slate-400 text-[11px]">
                        <div className="text-white font-medium">
                          {ctrl.remediationOwner || ctrl.responsibleDepartment}
                        </div>
                        {ctrl.remediationOwner && (
                          <div className="text-[10px] text-slate-400">
                            {ctrl.responsibleDepartment}
                          </div>
                        )}
                        {ctrl.targetDate && (
                          <div className="text-[10px] text-amber-400/90 font-mono flex items-center gap-1 mt-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            <span>Due: {ctrl.targetDate}</span>
                          </div>
                        )}
                        {ctrl.implementationNotes && (
                          <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5" title={ctrl.implementationNotes}>
                            <FileText className="w-2.5 h-2.5 shrink-0" />
                            <span className="truncate max-w-[130px]">Notes logged</span>
                          </div>
                        )}
                      </td>

                      <td className="p-3.5 pr-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenRemediationDrawer(ctrl)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 hover:text-white border border-indigo-800 font-semibold text-[11px] transition inline-flex items-center gap-1"
                            title="Open Compliance Remediation Planning, Notes & Owner Drawer"
                          >
                            <Calendar className="w-3 h-3 text-indigo-400" />
                            <span>Remediate</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenWorkflowModal(ctrl)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-[11px] transition"
                            title="Edit Justification & Scope"
                          >
                            Justify
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Compliance Remediation & Implementation Notes Side-Drawer */}
      <SoAControlRemediationDrawer
        isOpen={Boolean(remediationControl)}
        onClose={() => setRemediationControl(null)}
        control={remediationControl}
        activeRisks={tenantRisks}
        onSave={handleSaveRemediationPlan}
      />

      {/* Formal Inclusion / Exclusion Workflow Modal */}
      <SoAJustificationWorkflowModal
        isOpen={Boolean(workflowControl)}
        onClose={() => setWorkflowControl(null)}
        control={workflowControl}
        activeRisks={tenantRisks}
        onSave={handleSaveWorkflowEdit}
      />

      {/* Formal SoA Document Preview Modal */}
      <SoADocumentPreviewModal
        isOpen={showDocumentPreview}
        onClose={() => setShowDocumentPreview(false)}
        controls={controls}
        tenant={currentTenant}
        onExportPDF={handleExportPDF}
        onExportCSV={exportCSV}
        isExportingPDF={isExportingPDF}
      />

      {/* Sync Details Modal */}
      {showSyncModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-2xl p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Risk-to-SoA Dynamic Harmonization Report</span>
              </h3>
              <button
                onClick={() => setShowSyncModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                Close
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700">
                <div className="font-bold text-white">Conformance with ISO/IEC 27001:2022</div>
                <div className="text-slate-300 mt-1">
                  Clause 6.1.2 mandates information security risk assessment, and Clause 6.1.3 mandates risk treatment
                  producing a Statement of Applicability. The sync engine continuously reconciles the two to prevent
                  orphan risks and unaccounted safeguards.
                </div>
              </div>

              <div>
                <h4 className="font-bold text-white mb-2">
                  Detected Gaps & Discrepancies ({alignmentReport.conflicts.length})
                </h4>
                {alignmentReport.conflicts.length === 0 ? (
                  <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-800/60 text-emerald-300 flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>All active risks and SoA controls are in 100% synchronization.</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {alignmentReport.conflicts.map((conf, cIdx) => (
                      <div
                        key={cIdx}
                        className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-300 space-y-1"
                      >
                        <div className="font-bold flex items-center justify-between">
                          <span>{conf.type}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-900 font-mono">
                            {conf.riskCode || conf.controlCode}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-300">{conf.description}</div>
                        <div className="text-[10px] text-amber-400">
                          Recommended Action: {conf.suggestedResolution}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-bold text-white mb-2">Current Active Risk Mappings ({tenantRisks.length})</h4>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {tenantRisks.map(r => (
                    <div
                      key={r.id}
                      className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-[11px]"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-amber-400">{r.riskCode}</span>
                        <span className="text-white truncate max-w-xs">{r.title}</span>
                      </div>
                      <div className="text-indigo-400 font-mono text-[10px]">
                        {r.mitigationControl || 'No control'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => {
                  setShowSyncModal(false);
                  handlePerformSync();
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center space-x-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Run Reconciliation Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Statement of Applicability (SoA) Sync Verifier Modal */}
      <SoASyncVerifierModal isOpen={showVerifierModal} onClose={() => setShowVerifierModal(false)} />

      {/* SoA Version Diffing & Cryptographic Sign-Off Modal */}
      <SoAVersionDiffModal isOpen={showVersionDiffModal} onClose={() => setShowVersionDiffModal(false)} />
    </PageContainer>
  );
};
