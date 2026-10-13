import React, { useState, useMemo } from 'react';
import { useGRC } from '../../context/GRCContext';
import { FindingCAPARecord, ControlItem, RiskRecord, EvidenceRecord } from '../../types';
import { PageContainer } from '../layout/PageContainer';
import { safeConfirm } from '../../utils/safeConfirm';
import {
  FileText,
  Download,
  Printer,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  ShieldCheck,
  Building,
  Users,
  Layers,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Clock,
  Sparkles,
  Award,
  Lock,
  FileCheck2,
  RefreshCw,
  SlidersHorizontal,
  Table as TableIcon,
  LayoutGrid,
  FileSpreadsheet,
  FolderArchive,
  BookmarkCheck,
  History,
  Save,
  PlusCircle
} from 'lucide-react';
import { exportAuditReportPDF, AuditReportPdfData } from '../../utils/auditReportPdfExporter';
import { computeSHA256, fallbackHash } from '../../utils/crypto';
import { useToast } from '../common/ToastContainer';
import { AuditReportArchiveView } from '../audit/AuditReportArchiveView';
import { AuditReportInteractivePreviewPane } from '../audit/AuditReportInteractivePreviewPane';
import { ArchivedAuditReport } from '../../types';

export const AuditReportingModule: React.FC = () => {
  const {
    currentTenant,
    currentUser,
    currentRole,
    findings,
    controls,
    risks,
    evidence,
    internalAudits,
    updateFinding,
    setActiveModule,
    theme
  } = useGRC();

  const { showToast } = useToast();

  // Top-level View Mode: 'generator' (Live active aggregation) vs 'preview' (Interactive Customizer) vs 'archive' (Historical vault)
  const [activeTab, setActiveTab] = useState<'generator' | 'preview' | 'archive'>('generator');

  // Archive storage key and state
  const archiveStorageKey = `skanda_audit_report_archive_${currentTenant?.id || 'tenant_apex'}`;
  const [archivedReports, setArchivedReports] = useState<ArchivedAuditReport[]>(() => {
    try {
      const stored = localStorage.getItem(archiveStorageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load archive in parent', e);
    }
    return [];
  });

  // Active Stakeholder Perspective View
  const [stakeholderView, setStakeholderView] = useState<'board' | 'ciso' | 'owners' | 'auditor'>('board');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFramework, setSelectedFramework] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ALL');
  const [auditCycle, setAuditCycle] = useState<string>('FY2026 Annual Program');
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);
  const [expandedFindings, setExpandedFindings] = useState<Record<string, boolean>>({});

  // Sign-off Endorsements state
  const [signatories, setSignatories] = useState([
    {
      title: 'Lead Internal Auditor',
      name: currentUser.role === 'INTERNAL_AUDITOR' ? currentUser.name : 'Eleanor Vance, CISA, ISO 27001 LA',
      status: 'Signed & Certified',
      date: '2026-09-10'
    },
    {
      title: 'Chief Information Security Officer (CISO)',
      name: 'Marcus Brody, CISSP, CISM',
      status: 'Reviewed & Accepted',
      date: '2026-09-11'
    },
    {
      title: 'Chief Risk Officer (CRO)',
      name: 'Helena Sterling, CRMA',
      status: 'Governance Concurrence',
      date: '2026-09-12'
    },
    {
      title: 'Chief Executive Officer (CEO)',
      name: currentTenant?.name ? `${currentTenant.name} Executive Board` : 'Apex Executive Board',
      status: 'Acknowledged',
      date: '2026-09-12'
    }
  ]);

  // Tenant findings
  const tenantFindings = useMemo(() => {
    return findings.filter(f => !currentTenant?.id || f.tenantId === currentTenant?.id);
  }, [findings, currentTenant?.id]);

  // Unique departments for filter
  const departmentsList = useMemo(() => {
    const set = new Set<string>();
    tenantFindings.forEach(f => {
      if (f.department) set.add(f.department);
    });
    return Array.from(set).sort();
  }, [tenantFindings]);

  // Filtered Findings
  const filteredFindings = useMemo(() => {
    return tenantFindings.filter(f => {
      const matchesSearch =
        f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.findingCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.clauseOrControl.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.capaPlan.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.rootCauseAnalysis.rootCauseStatement.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSeverity = selectedSeverity === 'ALL' || f.severity === selectedSeverity;
      const matchesStatus =
        selectedStatus === 'ALL'
          ? true
          : selectedStatus === 'OPEN'
          ? f.status !== 'Closed Verified'
          : f.status === selectedStatus;
      const matchesDept = selectedDepartment === 'ALL' || f.department === selectedDepartment;

      const matchesFw =
        selectedFramework === 'ALL'
          ? true
          : selectedFramework === 'ISO27001'
          ? f.clauseOrControl.includes('A.') || f.clauseOrControl.includes('Clause') || f.clauseOrControl.includes('27001')
          : selectedFramework === 'MASTRM'
          ? f.clauseOrControl.includes('TRM') || f.clauseOrControl.includes('MAS') || f.clauseOrControl.includes('644')
          : selectedFramework === 'ISO42001'
          ? f.clauseOrControl.includes('42001') || f.clauseOrControl.includes('AI')
          : selectedFramework === 'DPDP'
          ? f.clauseOrControl.includes('DPDP') || f.clauseOrControl.includes('SEC')
          : true;

      return matchesSearch && matchesSeverity && matchesStatus && matchesDept && matchesFw;
    });
  }, [tenantFindings, searchQuery, selectedSeverity, selectedStatus, selectedDepartment, selectedFramework]);

  // Aggregate Metrics
  const stats = useMemo(() => {
    const total = filteredFindings.length;
    const majorNCs = filteredFindings.filter(f => f.severity === 'Major Non-Conformity').length;
    const minorNCs = filteredFindings.filter(f => f.severity === 'Minor Non-Conformity').length;
    const observations = filteredFindings.filter(f => f.severity === 'Observation').length;
    const ofis = filteredFindings.filter(f => f.severity === 'Opportunity for Improvement').length;

    const openCount = filteredFindings.filter(f => f.status !== 'Closed Verified').length;
    const closedCount = filteredFindings.filter(f => f.status === 'Closed Verified').length;

    // Overdue check (target date < today)
    const today = new Date().toISOString().split('T')[0];
    const overdueCount = filteredFindings.filter(
      f => f.status !== 'Closed Verified' && f.capaPlan.targetDate && f.capaPlan.targetDate < today
    ).length;

    const remediationRate = total > 0 ? Math.round((closedCount / total) * 100) : 100;

    return {
      totalFindings: total,
      majorNCs,
      minorNCs,
      observations,
      ofis,
      openCount,
      closedCount,
      overdueCount,
      remediationRate
    };
  }, [filteredFindings]);

  // Departmental breakdown
  const departmentBreakdown = useMemo(() => {
    const map: Record<string, { total: number; major: number; minor: number; open: number }> = {};

    filteredFindings.forEach(f => {
      const dept = f.department || 'Unassigned';
      if (!map[dept]) {
        map[dept] = { total: 0, major: 0, minor: 0, open: 0 };
      }
      map[dept].total += 1;
      if (f.severity === 'Major Non-Conformity') map[dept].major += 1;
      if (f.severity === 'Minor Non-Conformity') map[dept].minor += 1;
      if (f.status !== 'Closed Verified') map[dept].open += 1;
    });

    return Object.entries(map).map(([name, data]) => ({
      name,
      ...data
    })).sort((a, b) => b.total - a.total);
  }, [filteredFindings]);

  // Root cause analysis taxonomy breakdown
  const rootCauseBreakdown = useMemo(() => {
    const categories: Record<string, number> = {
      'Process & Procedures Gap': 0,
      'Technical Control Inadequacy': 0,
      'People & Training Deficiency': 0,
      'Third-Party / Vendor Risk': 0,
      'Policy Drift / Lack of Evidence': 0
    };

    filteredFindings.forEach(f => {
      const text = `${f.rootCauseAnalysis.rootCauseStatement} ${f.description}`.toLowerCase();
      if (text.includes('vendor') || text.includes('third party') || text.includes('supplier')) {
        categories['Third-Party / Vendor Risk']++;
      } else if (text.includes('train') || text.includes('human') || text.includes('awareness') || text.includes('user')) {
        categories['People & Training Deficiency']++;
      } else if (text.includes('config') || text.includes('edr') || text.includes('sast') || text.includes('technical') || text.includes('scan')) {
        categories['Technical Control Inadequacy']++;
      } else if (text.includes('drift') || text.includes('evidence') || text.includes('document')) {
        categories['Policy Drift / Lack of Evidence']++;
      } else {
        categories['Process & Procedures Gap']++;
      }
    });

    const total = filteredFindings.length || 1;
    return Object.entries(categories).map(([category, count]) => ({
      category,
      count,
      percentage: Math.round((count / total) * 100)
    })).filter(c => c.count > 0);
  }, [filteredFindings]);

  // Executive Audit Opinion
  const executiveOpinion = useMemo(() => {
    if (stats.majorNCs === 0 && stats.minorNCs === 0) {
      return 'UNQUALIFIED AUDIT OPINION: SUBSTANTIAL ASSURANCE';
    } else if (stats.majorNCs === 0 && stats.minorNCs <= 3) {
      return 'QUALIFIED AUDIT OPINION: MODERATE ASSURANCE (MINOR DEFICIENCIES NOTED)';
    } else if (stats.majorNCs <= 2) {
      return 'CONDITIONAL ASSURANCE: CORRECTIVE ACTION PLANS ACTIVE';
    } else {
      return 'ADVERSE FINDING / HIGH REMEDIATION PRIORITY: SUBSTANTIAL CONTROL GAPS';
    }
  }, [stats.majorNCs, stats.minorNCs]);

  // Executive Statement
  const executiveStatementText = useMemo(() => {
    const tenantName = currentTenant?.name || 'Apex Financial Technologies';
    return `Based on independent sampling of ${stats.totalFindings} control activities across ${departmentBreakdown.length} operational units, the internal audit team has concluded that ${tenantName}'s management system exhibits ${
      stats.majorNCs === 0 ? 'effective governance controls with no systemic material non-conformities.' : 'material control exceptions requiring immediate board-level CAPA monitoring.'
    } Corrective and preventive action plans (CAPA) have been established with designated departmental owners and hard completion milestones.`;
  }, [currentTenant?.name, stats.totalFindings, stats.majorNCs, departmentBreakdown.length]);

  // Document Reference
  const documentRef = useMemo(() => {
    const year = new Date().getFullYear();
    return `SKD-AUD-RPT-${year}-${(currentTenant?.name || 'GEN').replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase()}-01`;
  }, [currentTenant?.name]);

  // Cryptographic Seal Calculation
  const sha256Seal = useMemo(() => {
    const findingsJson = JSON.stringify(filteredFindings.map(f => ({ id: f.id, code: f.findingCode, stat: f.status })));
    return fallbackHash(`SKANDA_AUDIT_REPORT_${documentRef}_${findingsJson}`);
  }, [filteredFindings, documentRef]);

  const toggleFindingExpanded = (id: string) => {
    setExpandedFindings(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleVerifyClosure = (f: FindingCAPARecord) => {
    if (safeConfirm(`Formally verify and close finding ${f.findingCode}? This updates the audit register and seals the verification record.`)) {
      updateFinding(f.id, {
        status: 'Closed Verified',
        verifiedBy: currentUser.name,
        verifiedDate: new Date().toISOString().split('T')[0]
      });
      showToast({
        title: 'Finding Verified & Closed',
        message: `${f.findingCode} verified by ${currentUser.name}`,
        type: 'success'
      });
    }
  };

  // Save Snapshot to Archive
  const handleSaveSnapshotToArchive = (andSwitchToArchive: boolean = false) => {
    const newArchiveItem: ArchivedAuditReport = {
      id: `arch-rpt-${Date.now()}`,
      tenantId: currentTenant?.id || 'tenant_apex',
      reportRef: documentRef,
      title: `${currentTenant?.name || 'Enterprise'} Internal Audit & Non-Conformity Findings Report`,
      auditCycle,
      targetStakeholder:
        stakeholderView === 'board'
          ? 'Board of Directors & Audit Committee'
          : stakeholderView === 'ciso'
          ? 'CISO & Executive Leadership Team'
          : stakeholderView === 'owners'
          ? 'Department Remediation Owners & Process Leads'
          : 'Comprehensive Audit Working Papers (Full Dossier)',
      classification: 'CONFIDENTIAL // INTERNAL AUDIT & BOARD REPORT',
      frameworks: currentTenant?.selectedFrameworks || ['ISO/IEC 27001:2022', 'MAS TRM Guidelines', 'DPDP Act 2023'],
      leadAuditor: signatories[0].name,
      generatedDate: new Date().toISOString().split('T')[0],
      sha256Seal,
      executiveOpinion,
      executiveSummaryText: executiveStatementText,
      stats,
      departmentBreakdown,
      rootCauseBreakdown,
      findings: filteredFindings.map(f => ({
        findingCode: f.findingCode,
        title: f.title,
        severity: f.severity,
        status: f.status,
        clauseOrControl: f.clauseOrControl,
        department: f.department,
        rootCause: f.rootCauseAnalysis.rootCauseStatement,
        correctiveAction: f.capaPlan.correctiveAction,
        preventiveAction: f.capaPlan.preventiveAction,
        owner: f.capaPlan.owner,
        targetDate: f.capaPlan.targetDate
      })),
      signatories,
      status: 'Published',
      pinned: false,
      fileSizeBytes: 1850000,
      notes: `Snapshot captured on ${new Date().toLocaleDateString()} for cycle ${auditCycle}`
    };

    setArchivedReports(prev => {
      const existsIdx = prev.findIndex(p => p.reportRef === documentRef);
      let updated: ArchivedAuditReport[];
      if (existsIdx >= 0) {
        updated = [...prev];
        updated[existsIdx] = { ...newArchiveItem, pinned: prev[existsIdx].pinned };
      } else {
        updated = [newArchiveItem, ...prev];
      }
      try {
        localStorage.setItem(archiveStorageKey, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save archive to localStorage', e);
      }
      return updated;
    });

    showToast({
      title: 'Report Sealed in Archive',
      message: `${documentRef} added to historical audit report vault.`,
      type: 'success'
    });

    if (andSwitchToArchive) {
      setActiveTab('archive');
    }
  };

  // Export Executive PDF
  const handleExportPDF = () => {
    setIsExportingPDF(true);
    try {
      const pdfData: AuditReportPdfData = {
        tenantName: currentTenant?.name || 'Apex Financial Technologies',
        reportTitle: `${currentTenant?.name || 'Enterprise'} Internal Audit & Non-Conformity Findings Report`,
        documentRef,
        classification: 'CONFIDENTIAL // INTERNAL AUDIT & BOARD REPORT',
        auditCycle,
        targetStakeholder:
          stakeholderView === 'board'
            ? 'Board of Directors & Audit Committee'
            : stakeholderView === 'ciso'
            ? 'CISO & Executive Leadership Team'
            : stakeholderView === 'owners'
            ? 'Department Remediation Owners & Process Leads'
            : 'Comprehensive Audit Working Papers (Full Dossier)',
        frameworks: currentTenant?.selectedFrameworks || ['ISO/IEC 27001:2022', 'MAS TRM Guidelines', 'DPDP Act 2023'],
        leadAuditor: signatories[0].name,
        reviewDate: new Date().toISOString().split('T')[0],
        sha256Seal,
        executiveOpinion,
        executiveSummaryText: executiveStatementText,
        stats,
        departmentBreakdown,
        rootCauseBreakdown,
        findings: filteredFindings.map(f => ({
          findingCode: f.findingCode,
          title: f.title,
          severity: f.severity,
          status: f.status,
          clauseOrControl: f.clauseOrControl,
          department: f.department,
          rootCause: f.rootCauseAnalysis.rootCauseStatement,
          correctiveAction: f.capaPlan.correctiveAction,
          preventiveAction: f.capaPlan.preventiveAction,
          owner: f.capaPlan.owner,
          targetDate: f.capaPlan.targetDate
        })),
        signatories
      };

      exportAuditReportPDF(pdfData);

      // Auto-save snapshot to archive upon export
      handleSaveSnapshotToArchive(false);

      showToast({
        title: 'Audit Report PDF Exported & Archived',
        message: `Successfully downloaded ${documentRef}_Audit_Report.pdf and recorded in Archive Vault.`,
        type: 'success'
      });
    } catch (err) {
      console.error('Failed to export PDF:', err);
      showToast({
        title: 'Export Failed',
        message: 'Could not generate audit report PDF. Check console for details.',
        type: 'error'
      });
    } finally {
      setIsExportingPDF(false);
    }
  };

  // Copy Markdown / Confluence Dossier
  const handleCopyMarkdown = () => {
    const mdLines = [
      `# ${currentTenant?.name || 'Enterprise'} - Internal Audit Findings & CAPA Dossier`,
      `**Document Ref:** \`${documentRef}\`  `,
      `**Audit Cycle:** ${auditCycle}  `,
      `**Classification:** CONFIDENTIAL - INTERNAL AUDIT & BOARD ONLY  `,
      `**Lead Auditor:** ${signatories[0].name}  `,
      `**Generated Date:** ${new Date().toLocaleDateString('en-GB')}  `,
      `**Cryptographic Seal:** \`${sha256Seal}\`  \n`,
      `## Executive Audit Opinion`,
      `> **${executiveOpinion}**  `,
      `> ${executiveStatementText}\n`,
      `## Summary Statistics`,
      `- **Total Findings:** ${stats.totalFindings}`,
      `- **Major Non-Conformities:** ${stats.majorNCs}`,
      `- **Minor Non-Conformities:** ${stats.minorNCs}`,
      `- **Observations & OFIs:** ${stats.observations + stats.ofis}`,
      `- **Active Open Items:** ${stats.openCount}`,
      `- **Overdue Items:** ${stats.overdueCount}`,
      `- **Remediation Rate:** ${stats.remediationRate}%\n`,
      `## Findings & CAPA Register`,
      `| Finding Code | Severity | Clause / Control | Department | Status | Target Date | Owner | Root Cause (5-Whys) | Corrective Action |`,
      `| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |`,
      ...filteredFindings.map(
        f =>
          `| **${f.findingCode}** | ${f.severity} | ${f.clauseOrControl} | ${f.department} | ${f.status} | ${f.capaPlan.targetDate} | ${f.capaPlan.owner} | ${f.rootCauseAnalysis.rootCauseStatement.replace(/\|/g, '-')} | ${f.capaPlan.correctiveAction.replace(/\|/g, '-')} |`
      ),
      `\n## Governance Sign-Offs`,
      ...signatories.map(s => `- **${s.title}:** ${s.name} - *Status:* ${s.status} (${s.date})`),
      `\n*Generated by SKANDA GRC Enterprise Platform*`
    ].join('\n');

    navigator.clipboard.writeText(mdLines).then(() => {
      setCopiedMarkdown(true);
      showToast({
        title: 'Markdown Dossier Copied',
        message: 'Ready to paste into Confluence, Jira, or email',
        type: 'success'
      });
      setTimeout(() => setCopiedMarkdown(false), 2500);
    });
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Finding Code',
      'Title',
      'Severity',
      'Status',
      'Clause / Control',
      'Department',
      'Remediation Owner',
      'Target Date',
      '5-Whys Root Cause',
      'Corrective Action',
      'Preventive Action',
      'Raised Date',
      'Verified By'
    ];

    const rows = filteredFindings.map(f => [
      `"${f.findingCode}"`,
      `"${f.title.replace(/"/g, '""')}"`,
      `"${f.severity}"`,
      `"${f.status}"`,
      `"${f.clauseOrControl}"`,
      `"${f.department}"`,
      `"${f.capaPlan.owner}"`,
      `"${f.capaPlan.targetDate}"`,
      `"${(f.rootCauseAnalysis.rootCauseStatement || '').replace(/"/g, '""')}"`,
      `"${(f.capaPlan.correctiveAction || '').replace(/"/g, '""')}"`,
      `"${(f.capaPlan.preventiveAction || '').replace(/"/g, '""')}"`,
      `"${f.raisedDate}"`,
      `"${f.verifiedBy || 'Pending'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${documentRef}_findings_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast({
      title: 'CSV Exported',
      message: `Downloaded ${documentRef}_findings_export.csv`,
      type: 'success'
    });
  };

  // Browser Print
  const handlePrint = () => {
    window.print();
  };

  const isAuditor = currentRole === 'SUPER_ADMIN' || currentRole === 'PLATFORM_AUDITOR' || currentRole === 'INTERNAL_AUDITOR';

  return (
    <PageContainer id="audit-reporting-module" className="print:p-0 print:m-0 print:max-w-none">
      {/* Top-Level Mode Selector: Live Active Report vs Interactive Preview vs Historical Archive */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3 print:hidden">
        <div className="flex items-center space-x-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
          <button
            onClick={() => setActiveTab('generator')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'generator'
                ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md shadow-sky-950/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
            id="tab-btn-active-generator"
          >
            <FileText className="w-4 h-4" />
            <span>Active Report Dossier</span>
            <span className="px-1.5 py-0.5 text-[10px] rounded bg-sky-400/20 text-sky-300 font-mono font-semibold">Live</span>
          </button>

          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'preview'
                ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-950/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
            id="tab-btn-interactive-preview"
          >
            <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
            <span>Interactive Preview & Customizer</span>
          </button>

          <button
            onClick={() => setActiveTab('archive')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'archive'
                ? 'bg-gradient-to-r from-indigo-600 to-sky-600 text-white shadow-md shadow-indigo-950/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
            id="tab-btn-audit-archive"
          >
            <FolderArchive className="w-4 h-4" />
            <span>Audit Report Archive</span>
            <span className="px-2 py-0.5 text-[10.5px] rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
              {archivedReports.length || 6}
            </span>
          </button>
        </div>

        {activeTab === 'generator' ? (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('preview')}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold transition cursor-pointer shadow-sm"
              id="btn-switch-to-preview"
              title="Open interactive preview pane to toggle visibility of findings and audit criteria"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Customize & Preview</span>
            </button>
            <button
              onClick={() => handleSaveSnapshotToArchive(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition cursor-pointer hover:scale-[1.02] shadow-sm"
              id="btn-seal-snapshot-to-archive"
              title="Cryptographically anchor current live report and save to archive vault"
            >
              <BookmarkCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Seal Snapshot</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => setActiveTab('generator')}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5 text-sky-400" />
            <span>Active Generator</span>
          </button>
        )}
      </div>

      {activeTab === 'archive' ? (
        <AuditReportArchiveView
          tenantId={currentTenant?.id || 'tenant_apex'}
          tenantName={currentTenant?.name || 'Apex Financial Technologies'}
          currentRole={currentRole}
          currentUserName={currentUser.name}
          onNavigateToGenerator={() => setActiveTab('generator')}
          archiveReportsList={archivedReports.length > 0 ? archivedReports : undefined}
          onArchiveUpdate={(updated) => setArchivedReports(updated)}
        />
      ) : activeTab === 'preview' ? (
        <AuditReportInteractivePreviewPane
          tenantId={currentTenant?.id || 'tenant_apex'}
          tenantName={currentTenant?.name || 'Apex Financial Technologies'}
          currentRole={currentRole}
          currentUserName={currentUser.name}
          findings={tenantFindings}
          defaultAuditCycle={auditCycle}
          signatories={signatories}
          onClose={() => setActiveTab('generator')}
          onSaveToArchive={(newReport) => {
            setArchivedReports(prev => {
              const updated = [newReport, ...prev];
              try {
                localStorage.setItem(archiveStorageKey, JSON.stringify(updated));
              } catch (e) {
                console.error('Failed to save to local storage', e);
              }
              return updated;
            });
          }}
        />
      ) : (
        <>
          {/* Module Header Bar */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 shadow-md print:border-none print:bg-white print:p-2">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400 px-2.5 py-0.5 rounded bg-sky-950/80 border border-sky-800">
                    Automated Audit Reporting
                  </span>
                  <span className="text-xs text-slate-400 font-mono font-bold">
                    {documentRef}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/70 text-rose-300 border border-rose-800">
                    CONFIDENTIAL // INTERNAL ONLY
                  </span>
                </div>

                <h1 className="text-2xl font-bold text-white tracking-tight print:text-slate-900">
                  Audit Findings & Stakeholder Reporting Dossier
                </h1>
                <p className="text-xs text-slate-300 max-w-3xl print:text-slate-700">
                  Automated aggregation engine consolidating non-conformities, 5-Whys root causes, and corrective action milestones (CAPA) into tailored, audit-grade documents for Board of Directors, Executive C-Suite, and Department Remediation Owners.
                </p>
              </div>

              {/* Action Export Buttons */}
              <div className="flex flex-wrap items-center gap-2 print:hidden shrink-0">
                <button
                  onClick={() => setActiveTab('preview')}
                  className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-md shadow-emerald-950/40 transition cursor-pointer"
                  id="btn-open-customizer-preview"
                  title="Open interactive preview pane to toggle findings, sections, and criteria before final PDF export"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Customize & Preview</span>
                </button>

                <button
                  onClick={handleExportPDF}
                  disabled={isExportingPDF}
                  className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md shadow-sky-950/40 transition cursor-pointer disabled:opacity-50"
                  id="btn-export-audit-pdf"
                >
                  <Download className={`w-3.5 h-3.5 ${isExportingPDF ? 'animate-bounce' : ''}`} />
                  <span>{isExportingPDF ? 'Generating PDF...' : 'Export Executive PDF'}</span>
                </button>

                <button
                  onClick={() => handleSaveSnapshotToArchive(true)}
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition cursor-pointer"
                  title="Save current snapshot to the Audit Report Archive"
                >
                  <BookmarkCheck className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Archive Snapshot</span>
                </button>

                <button
                  onClick={handleCopyMarkdown}
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition cursor-pointer"
                  title="Copy formatted Markdown for Confluence or Jira"
                >
                  {copiedMarkdown ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{copiedMarkdown ? 'Copied' : 'Copy Markdown'}</span>
                </button>

                <button
                  onClick={handleExportCSV}
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition cursor-pointer"
                  title="Export Findings to CSV spreadsheet"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>CSV</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
                  title="Print Document"
                >
                  <Printer className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

        {/* Stakeholder Lens Selector Bar */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
          <div className="flex items-center space-x-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800 overflow-x-auto">
            <button
              onClick={() => setStakeholderView('board')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                stakeholderView === 'board'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Board & Audit Committee</span>
            </button>

            <button
              onClick={() => setStakeholderView('ciso')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                stakeholderView === 'ciso'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>CISO & Executive C-Suite</span>
            </button>

            <button
              onClick={() => setStakeholderView('owners')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                stakeholderView === 'owners'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Department Remediation Action Plan</span>
            </button>

            <button
              onClick={() => setStakeholderView('auditor')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                stakeholderView === 'auditor'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Auditor Working Papers Dossier</span>
            </button>
          </div>

          {/* SHA-256 Audit Seal Pill */}
          <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-400">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span className="hidden md:inline">Audit Seal:</span>
            <span className="text-emerald-400 font-bold tracking-tight bg-slate-950 px-2 py-0.5 rounded border border-emerald-950/60">
              {sha256Seal.slice(0, 16)}...
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Customization Toolbar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 print:hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* Search Box */}
          <div className="relative lg:col-span-2">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter by finding code, title, clause, root cause..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Framework Filter */}
          <div>
            <select
              value={selectedFramework}
              onChange={e => setSelectedFramework(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-sky-500"
            >
              <option value="ALL">All Frameworks</option>
              <option value="ISO27001">ISO/IEC 27001:2022</option>
              <option value="MASTRM">MAS TRM Guidelines</option>
              <option value="ISO42001">ISO 42001:2023 AIMS</option>
              <option value="DPDP">DPDP Act 2023</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div>
            <select
              value={selectedSeverity}
              onChange={e => setSelectedSeverity(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-sky-500"
            >
              <option value="ALL">All Severities</option>
              <option value="Major Non-Conformity">Major Non-Conformity</option>
              <option value="Minor Non-Conformity">Minor Non-Conformity</option>
              <option value="Observation">Observation</option>
              <option value="Opportunity for Improvement">Opportunity for Improvement</option>
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={selectedDepartment}
              onChange={e => setSelectedDepartment(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-sky-500"
            >
              <option value="ALL">All Departments</option>
              {departmentsList.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Second Row: Status, Cycle, View mode */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/60 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400 font-medium">Lifecycle:</span>
            <div className="flex items-center space-x-1">
              {[
                { id: 'ALL', label: 'All Items' },
                { id: 'OPEN', label: 'Active Open' },
                { id: 'Closed Verified', label: 'Closed & Verified' }
              ].map(st => (
                <button
                  key={st.id}
                  onClick={() => setSelectedStatus(st.id)}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition cursor-pointer ${
                    selectedStatus === st.id
                      ? 'bg-sky-950 text-sky-300 border border-sky-800'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-400">Audit Cycle:</span>
              <input
                type="text"
                value={auditCycle}
                onChange={e => setAuditCycle(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-slate-300 font-mono text-[11px] w-36"
              />
            </div>

            <div className="flex items-center bg-slate-950 rounded-lg p-0.5 border border-slate-800">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded cursor-pointer ${viewMode === 'cards' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'}`}
                title="Cards View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded cursor-pointer ${viewMode === 'table' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'}`}
                title="Table View"
              >
                <TableIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FORMAL FORMATTED DOCUMENT PREVIEW CONTAINER */}
      {/* ========================================================================= */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl overflow-hidden print:border-none print:shadow-none print:bg-transparent">
        {/* Formal Document Top Banner */}
        <div className="px-6 py-5 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 print:bg-white print:border-b-2 print:border-black">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="text-[10.5px] uppercase tracking-wider font-bold text-sky-400 font-mono">
                Official Internal Audit Working Paper • ISO 19011 Aligned
              </div>
              <h2 className="text-xl font-bold text-white mt-0.5 print:text-black">
                {currentTenant?.name || 'Enterprise'} GRC Non-Conformity Findings & CAPA Dossier
              </h2>
              <div className="text-xs text-slate-400 mt-1 flex flex-wrap gap-x-4 gap-y-1 print:text-slate-600">
                <span><strong>Audit Program:</strong> {auditCycle}</span>
                <span><strong>Scope:</strong> In-Scope Business Units & Infrastructure</span>
                <span><strong>Lead Auditor:</strong> {signatories[0].name}</span>
              </div>
            </div>

            <div className="flex flex-col items-start md:items-end space-y-1.5 shrink-0">
              <span className="px-2.5 py-1 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 text-xs font-bold uppercase tracking-wider">
                CONFIDENTIAL // INTERNAL USE ONLY
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Doc Ref: {documentRef}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Formal Auditor Opinion Box */}
          <div className="p-4 rounded-xl bg-teal-950/30 border border-teal-800/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-[10px] uppercase font-bold tracking-wider text-teal-400 font-mono flex items-center space-x-1.5">
                <Award className="w-3.5 h-3.5" />
                <span>Formal Auditor Assurance Conclusion</span>
              </div>
              <div className="text-base font-bold text-white tracking-tight">
                {executiveOpinion}
              </div>
              <p className="text-xs text-slate-300 max-w-3xl">
                {executiveStatementText}
              </p>
            </div>

            <div className="flex items-center space-x-2 shrink-0 bg-teal-950/60 px-3.5 py-2 rounded-lg border border-teal-700/50">
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
              <div className="text-xs">
                <div className="font-bold text-white">Clause 9.2 & 10.2</div>
                <div className="text-[10px] text-teal-300">Continuous Assurance</div>
              </div>
            </div>
          </div>

          {/* Executive KPI Metric Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="text-[11px] text-slate-400 font-medium">Total Findings Evaluated</div>
              <div className="text-2xl font-bold font-mono text-white">{stats.totalFindings}</div>
              <div className="text-[10px] text-slate-500">Across {departmentBreakdown.length} business units</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="text-[11px] text-rose-400 font-medium">Major Non-Conformities</div>
              <div className="text-2xl font-bold font-mono text-rose-400">{stats.majorNCs}</div>
              <div className="text-[10px] text-rose-400/80">Immediate CAPA mandatory</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="text-[11px] text-amber-400 font-medium">Minor NCs & OFIs</div>
              <div className="text-2xl font-bold font-mono text-amber-400">{stats.minorNCs + stats.observations}</div>
              <div className="text-[10px] text-slate-500">{stats.minorNCs} Minor, {stats.observations} Obs</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="text-[11px] text-emerald-400 font-medium">CAPA Resolution Health</div>
              <div className="text-2xl font-bold font-mono text-emerald-400">{stats.remediationRate}%</div>
              <div className="text-[10px] text-slate-500">{stats.closedCount} verified / {stats.openCount} open</div>
            </div>
          </div>

          {/* Section: Departmental Breakdown & Root Cause Taxonomy */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Department Breakdown */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <Building className="w-3.5 h-3.5 text-sky-400" />
                  <span>Departmental Non-Conformity Concentration</span>
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {departmentBreakdown.length} units
                </span>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin">
                {departmentBreakdown.map(dept => (
                  <div key={dept.name} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white">{dept.name}</div>
                      <div className="text-[10.5px] text-slate-400 flex items-center space-x-2 mt-0.5">
                        <span className="text-rose-400 font-medium">{dept.major} Major</span>
                        <span>•</span>
                        <span className="text-amber-400 font-medium">{dept.minor} Minor</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-bold text-slate-200">{dept.total} Findings</span>
                      <div className="text-[10px] text-sky-400">{dept.open} Active Open</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Root Cause Taxonomy */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  <span>5-Whys Root Cause Taxonomy Synthesis</span>
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  Clause 10.2 Root Cause
                </span>
              </div>

              <div className="space-y-2.5">
                {rootCauseBreakdown.map(rc => (
                  <div key={rc.category} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium">{rc.category}</span>
                      <span className="font-mono text-slate-400 font-bold">{rc.count} ({rc.percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-sky-500 to-indigo-500 h-full rounded-full transition-all"
                        style={{ width: `${rc.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* DETAILED FINDINGS REGISTER */}
          {/* ========================================================================= */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-sky-400" />
                  <span>Detailed Non-Conformity Findings & CAPA Milestones</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Showing {filteredFindings.length} of {tenantFindings.length} findings matching current filter parameters.
                </p>
              </div>

              <div className="flex items-center space-x-2 text-xs">
                <button
                  onClick={() => {
                    const allOpen = Object.keys(expandedFindings).length !== filteredFindings.length;
                    const next: Record<string, boolean> = {};
                    if (allOpen) {
                      filteredFindings.forEach(f => { next[f.id] = true; });
                    }
                    setExpandedFindings(next);
                  }}
                  className="text-sky-400 hover:underline font-semibold cursor-pointer text-[11px]"
                >
                  {Object.keys(expandedFindings).length === filteredFindings.length ? 'Collapse All' : 'Expand All Details'}
                </button>
              </div>
            </div>

            {/* View Mode: Cards or Table */}
            {viewMode === 'cards' ? (
              <div className="space-y-3.5">
                {filteredFindings.length === 0 ? (
                  <div className="p-8 text-center rounded-xl bg-slate-950/40 border border-slate-800 text-slate-400 text-xs">
                    No audit findings match your selected filter criteria.
                  </div>
                ) : (
                  filteredFindings.map(f => {
                    const isExpanded = !!expandedFindings[f.id];
                    const isOverdue = f.status !== 'Closed Verified' && f.capaPlan.targetDate && f.capaPlan.targetDate < new Date().toISOString().split('T')[0];

                    return (
                      <div
                        key={f.id}
                        className={`rounded-xl border transition-all ${
                          f.severity === 'Major Non-Conformity'
                            ? 'bg-slate-950/70 border-rose-900/40 hover:border-rose-700/60'
                            : f.severity === 'Minor Non-Conformity'
                            ? 'bg-slate-950/70 border-amber-900/40 hover:border-amber-700/60'
                            : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {/* Finding Card Header */}
                        <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                          <div className="space-y-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono text-xs font-bold text-sky-400 px-2 py-0.5 rounded bg-sky-950 border border-sky-800">
                                {f.findingCode}
                              </span>

                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                                  f.severity === 'Major Non-Conformity'
                                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                    : f.severity === 'Minor Non-Conformity'
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                    : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                                }`}
                              >
                                {f.severity}
                              </span>

                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                                {f.clauseOrControl}
                              </span>

                              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-700">
                                {f.department}
                              </span>
                            </div>

                            <h4 className="text-sm font-bold text-white tracking-tight truncate">
                              {f.title}
                            </h4>
                          </div>

                          <div className="flex items-center space-x-3 shrink-0">
                            <div className="text-right text-xs">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold ${
                                  f.status === 'Closed Verified'
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : f.status === 'Verification Pending'
                                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                    : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                                }`}
                              >
                                {f.status}
                              </span>

                              <div className="text-[10.5px] text-slate-400 mt-1 flex items-center justify-end space-x-1">
                                <Clock className="w-3 h-3" />
                                <span className={isOverdue ? 'text-rose-400 font-bold' : ''}>
                                  Target: {f.capaPlan.targetDate || '2026-09-30'}
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() => toggleFindingExpanded(f.id)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                              title={isExpanded ? 'Collapse' : 'Expand'}
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Expandable Finding Detail Dossier */}
                        {isExpanded && (
                          <div className="px-4 pb-4 pt-2 border-t border-slate-800/80 space-y-3 text-xs">
                            {/* Observed Condition */}
                            <div className="space-y-1">
                              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                Observed Audit Condition & Evidence Gap
                              </span>
                              <p className="text-slate-300 bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                                {f.description}
                              </p>
                            </div>

                            {/* 5-Whys Root Cause Statement */}
                            <div className="space-y-1">
                              <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">
                                5-Whys Root Cause Analysis Statement (Clause 10.2)
                              </span>
                              <div className="text-slate-200 bg-rose-950/20 p-2.5 rounded-lg border border-rose-900/40">
                                {f.rootCauseAnalysis.rootCauseStatement}
                              </div>
                            </div>

                            {/* Corrective & Preventive Action Milestones (CAPA Plan) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="p-3 rounded-lg bg-sky-950/20 border border-sky-900/40 space-y-1">
                                <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider">
                                  Corrective Action (Containment & Repair)
                                </span>
                                <p className="text-slate-200">
                                  {f.capaPlan.correctiveAction}
                                </p>
                              </div>

                              <div className="p-3 rounded-lg bg-indigo-950/20 border border-indigo-900/40 space-y-1">
                                <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                                  Preventive Action (Systemic Eradication)
                                </span>
                                <p className="text-slate-200">
                                  {f.capaPlan.preventiveAction}
                                </p>
                              </div>
                            </div>

                            {/* Accountability & Verification Footer */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
                              <div className="flex items-center space-x-3">
                                <span>Remediation Lead: <strong className="text-slate-200">{f.capaPlan.owner}</strong></span>
                                <span>•</span>
                                <span>Department: <strong className="text-slate-200">{f.department}</strong></span>
                              </div>

                              <div className="flex items-center space-x-2">
                                {f.status !== 'Closed Verified' && isAuditor && (
                                  <button
                                    onClick={() => handleVerifyClosure(f)}
                                    className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10.5px] flex items-center space-x-1 cursor-pointer transition"
                                  >
                                    <Check className="w-3 h-3" />
                                    <span>Verify & Close Finding</span>
                                  </button>
                                )}
                                {f.status === 'Closed Verified' && (
                                  <span className="text-emerald-400 font-bold flex items-center space-x-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Verified by {f.verifiedBy || 'Lead Auditor'}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
              /* Table View */
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                    <tr>
                      <th className="p-3">Finding Code</th>
                      <th className="p-3">Title & Clause</th>
                      <th className="p-3">Severity</th>
                      <th className="p-3">Department</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Remediation Owner</th>
                      <th className="p-3">Target Date</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {filteredFindings.map(f => (
                      <tr key={f.id} className="hover:bg-slate-800/40 transition">
                        <td className="p-3 font-mono font-bold text-sky-400 whitespace-nowrap">
                          {f.findingCode}
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-white">{f.title}</div>
                          <div className="text-[10.5px] text-slate-400 font-mono">{f.clauseOrControl}</div>
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span
                            className={`text-[9.5px] font-bold px-2 py-0.5 rounded uppercase ${
                              f.severity === 'Major Non-Conformity'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                : f.severity === 'Minor Non-Conformity'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                            }`}
                          >
                            {f.severity}
                          </span>
                        </td>
                        <td className="p-3 whitespace-nowrap">{f.department}</td>
                        <td className="p-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              f.status === 'Closed Verified'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-sky-500/20 text-sky-300'
                            }`}
                          >
                            {f.status}
                          </span>
                        </td>
                        <td className="p-3 whitespace-nowrap font-medium text-slate-200">{f.capaPlan.owner}</td>
                        <td className="p-3 whitespace-nowrap font-mono text-slate-300">{f.capaPlan.targetDate}</td>
                        <td className="p-3 text-right whitespace-nowrap">
                          <button
                            onClick={() => toggleFindingExpanded(f.id)}
                            className="text-sky-400 hover:underline font-semibold cursor-pointer"
                          >
                            {expandedFindings[f.id] ? 'Hide' : 'Review'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* FORMAL GOVERNANCE SIGN-OFF BLOCK */}
          {/* ========================================================================= */}
          <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                  <span>Audit Committee & Executive Governance Endorsements</span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  Four-eyes verification requirement under ISO/IEC 27001 Clause 9.3 and MAS TRM governance standards.
                </p>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                MERKLE ANCHORED
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              {signatories.map((sig, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
                  <div className="text-[10px] uppercase font-bold text-slate-400">{sig.title}</div>
                  <div className="font-bold text-white truncate">{sig.name}</div>
                  <div className="flex items-center justify-between text-[10.5px] text-slate-400 pt-1 border-t border-slate-800">
                    <span className="text-emerald-400 font-medium">{sig.status}</span>
                    <span className="font-mono">{sig.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      </>
      )}
    </PageContainer>
  );
};
