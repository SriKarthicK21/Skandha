import React, { useState, useMemo, useEffect } from 'react';
import { FindingCAPARecord, ArchivedAuditReport } from '../../types';
import {
  FileText,
  Download,
  SlidersHorizontal,
  Check,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  ShieldCheck,
  Building,
  Users,
  Search,
  Filter,
  Eye,
  EyeOff,
  Printer,
  Copy,
  FolderArchive,
  BookmarkCheck,
  RotateCcw,
  Sparkles,
  Award,
  Lock,
  ChevronRight,
  ChevronDown,
  Layers,
  FileSpreadsheet,
  CheckSquare,
  Square,
  ArrowLeft,
  Settings2,
  Calendar,
  Briefcase
} from 'lucide-react';
import { exportAuditReportPDF, AuditReportPdfData, AuditReportSectionVisibility } from '../../utils/auditReportPdfExporter';
import { computeSHA256, fallbackHash } from '../../utils/crypto';
import { useToast } from '../common/ToastContainer';

interface AuditReportInteractivePreviewPaneProps {
  tenantId: string;
  tenantName: string;
  currentRole: string;
  currentUserName: string;
  findings: FindingCAPARecord[];
  defaultAuditCycle?: string;
  signatories?: Array<{
    title: string;
    name: string;
    status: string;
    date: string;
  }>;
  onClose: () => void;
  onSaveToArchive?: (report: ArchivedAuditReport) => void;
}

export const AuditReportInteractivePreviewPane: React.FC<AuditReportInteractivePreviewPaneProps> = ({
  tenantId,
  tenantName,
  currentRole,
  currentUserName,
  findings,
  defaultAuditCycle = 'FY2026 Annual ISO & TRM Program',
  signatories: initialSignatories,
  onClose,
  onSaveToArchive
}) => {
  const { showToast } = useToast();

  // 1. Report Metadata & Customization State
  const [reportTitle, setReportTitle] = useState(
    `${tenantName} Internal Audit & Non-Conformity Findings Report`
  );
  const [auditCycle, setAuditCycle] = useState(defaultAuditCycle);
  const [classification, setClassification] = useState('CONFIDENTIAL // INTERNAL AUDIT & BOARD ONLY');
  const [documentRef, setDocumentRef] = useState(
    `SKD-AUD-RPT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [stakeholderView, setStakeholderView] = useState<'board' | 'ciso' | 'owners' | 'auditor'>('board');
  const [leadAuditor, setLeadAuditor] = useState(
    initialSignatories?.[0]?.name || 'Eleanor Vance, CISA, ISO 27001 LA'
  );

  // 2. Section Visibility Flags
  const [sections, setSections] = useState<AuditReportSectionVisibility>({
    includeTitleBlock: true,
    includeExecutiveSummary: true,
    includeKpiMetrics: true,
    includeDepartmentBreakdown: true,
    includeRootCauseTaxonomy: true,
    includeDetailedFindings: true,
    includeSignatories: true,
    includeAuditSeal: true
  });

  // 3. Audit Criteria & Framework Filters
  const [selectedFrameworks, setSelectedFrameworks] = useState<string[]>([
    'ISO/IEC 27001:2022',
    'MAS TRM Guidelines',
    'DPDP Act 2023',
    'ISO/IEC 42001:2023'
  ]);
  const [selectedSeverities, setSelectedSeverities] = useState<string[]>([
    'Major Non-Conformity',
    'Minor Non-Conformity',
    'Observation',
    'Opportunity for Improvement'
  ]);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'CLOSED'>('ALL');
  const [findingSearchQuery, setFindingSearchQuery] = useState('');

  // 4. Granular Finding Inclusion State (IDs of findings included)
  const [includedFindingIds, setIncludedFindingIds] = useState<Set<string>>(
    () => new Set(findings.map(f => f.id))
  );

  // 5. Preview Display Controls
  const [zoomScale, setZoomScale] = useState<number>(100); // 75, 100, 125
  const [activePreviewPage, setActivePreviewPage] = useState<number>(1);
  const [previewViewMode, setPreviewViewMode] = useState<'continuous' | 'paginated'>('continuous');
  const [isExporting, setIsExporting] = useState(false);
  const [hasCopiedMarkdown, setHasCopiedMarkdown] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState<'sections' | 'criteria' | 'findings' | 'metadata'>('sections');

  // Signatories list
  const activeSignatories = useMemo(() => {
    return initialSignatories || [
      {
        title: 'Lead Internal Auditor',
        name: leadAuditor,
        status: 'Signed & Certified',
        date: new Date().toISOString().split('T')[0]
      },
      {
        title: 'Chief Information Security Officer (CISO)',
        name: 'Marcus Brody, CISSP, CISM',
        status: 'Reviewed & Accepted',
        date: new Date().toISOString().split('T')[0]
      },
      {
        title: 'Chief Risk Officer (CRO)',
        name: 'Helena Sterling, CRMA',
        status: 'Governance Concurrence',
        date: new Date().toISOString().split('T')[0]
      },
      {
        title: 'Executive Board Representative',
        name: `${tenantName} Audit Committee`,
        status: 'Acknowledged',
        date: new Date().toISOString().split('T')[0]
      }
    ];
  }, [initialSignatories, leadAuditor, tenantName]);

  // Toggle individual section
  const toggleSection = (key: keyof AuditReportSectionVisibility) => {
    setSections(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Preset Configurations
  const applyPreset = (preset: 'executive' | 'technical' | 'full' | 'governance') => {
    if (preset === 'executive') {
      setSections({
        includeTitleBlock: true,
        includeExecutiveSummary: true,
        includeKpiMetrics: true,
        includeDepartmentBreakdown: true,
        includeRootCauseTaxonomy: false,
        includeDetailedFindings: false,
        includeSignatories: true,
        includeAuditSeal: true
      });
      setStakeholderView('board');
      showToast({ title: 'Preset Applied', message: 'Executive Brief configuration loaded.', type: 'info' });
    } else if (preset === 'technical') {
      setSections({
        includeTitleBlock: true,
        includeExecutiveSummary: false,
        includeKpiMetrics: true,
        includeDepartmentBreakdown: true,
        includeRootCauseTaxonomy: true,
        includeDetailedFindings: true,
        includeSignatories: false,
        includeAuditSeal: true
      });
      setStakeholderView('owners');
      showToast({ title: 'Preset Applied', message: 'Technical Remediation Dossier loaded.', type: 'info' });
    } else if (preset === 'governance') {
      setSections({
        includeTitleBlock: true,
        includeExecutiveSummary: true,
        includeKpiMetrics: true,
        includeDepartmentBreakdown: false,
        includeRootCauseTaxonomy: false,
        includeDetailedFindings: false,
        includeSignatories: true,
        includeAuditSeal: true
      });
      setStakeholderView('ciso');
      showToast({ title: 'Preset Applied', message: 'Governance Sign-Off Summary loaded.', type: 'info' });
    } else {
      setSections({
        includeTitleBlock: true,
        includeExecutiveSummary: true,
        includeKpiMetrics: true,
        includeDepartmentBreakdown: true,
        includeRootCauseTaxonomy: true,
        includeDetailedFindings: true,
        includeSignatories: true,
        includeAuditSeal: true
      });
      showToast({ title: 'Preset Applied', message: 'Full Comprehensive Audit Dossier loaded.', type: 'info' });
    }
  };

  // Toggle Framework in Criteria filter
  const toggleFrameworkCriteria = (fw: string) => {
    setSelectedFrameworks(prev => {
      const exists = prev.includes(fw);
      const next = exists ? prev.filter(item => item !== fw) : [...prev, fw];
      return next.length === 0 ? [fw] : next;
    });
  };

  // Toggle Severity in Criteria filter
  const toggleSeverityCriteria = (sev: string) => {
    setSelectedSeverities(prev => {
      const exists = prev.includes(sev);
      const next = exists ? prev.filter(item => item !== sev) : [...prev, sev];
      return next.length === 0 ? [sev] : next;
    });
  };

  // Toggle individual finding inclusion
  const toggleFindingInclusion = (id: string) => {
    setIncludedFindingIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Bulk finding inclusion controls
  const selectAllFindings = () => {
    setIncludedFindingIds(new Set(findings.map(f => f.id)));
  };

  const deselectAllFindings = () => {
    setIncludedFindingIds(new Set());
  };

  const selectOnlyMajorNCs = () => {
    const majors = findings.filter(f => f.severity === 'Major Non-Conformity').map(f => f.id);
    setIncludedFindingIds(new Set(majors));
  };

  const selectOnlyOpenFindings = () => {
    const open = findings.filter(f => f.status !== 'Closed Verified').map(f => f.id);
    setIncludedFindingIds(new Set(open));
  };

  // All Candidate Findings filtered by Criteria (Framework, Severity, Status, Search)
  const candidateFindings = useMemo(() => {
    return findings.filter(f => {
      const matchesSearch =
        f.title.toLowerCase().includes(findingSearchQuery.toLowerCase()) ||
        f.findingCode.toLowerCase().includes(findingSearchQuery.toLowerCase()) ||
        (f.clauseOrControl && f.clauseOrControl.toLowerCase().includes(findingSearchQuery.toLowerCase())) ||
        (f.department && f.department.toLowerCase().includes(findingSearchQuery.toLowerCase()));

      const matchesSeverity = selectedSeverities.includes(f.severity);

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'OPEN' && f.status !== 'Closed Verified') ||
        (statusFilter === 'CLOSED' && f.status === 'Closed Verified');

      // Criteria framework matching
      const matchesFramework = selectedFrameworks.some(fw => {
        if (fw.includes('27001') && (f.clauseOrControl.includes('A.') || f.clauseOrControl.includes('Clause') || f.clauseOrControl.includes('ISO'))) return true;
        if (fw.includes('TRM') && (f.clauseOrControl.includes('TRM') || f.clauseOrControl.includes('MAS'))) return true;
        if (fw.includes('42001') && (f.clauseOrControl.includes('42001') || f.clauseOrControl.includes('AI'))) return true;
        if (fw.includes('DPDP') && (f.clauseOrControl.includes('DPDP') || f.clauseOrControl.includes('Privacy') || f.clauseOrControl.includes('Data'))) return true;
        return true;
      });

      return matchesSearch && matchesSeverity && matchesStatus && matchesFramework;
    });
  }, [findings, findingSearchQuery, selectedSeverities, statusFilter, selectedFrameworks]);

  // Actual findings included in finalized document
  const finalIncludedFindings = useMemo(() => {
    return findings.filter(f => includedFindingIds.has(f.id));
  }, [findings, includedFindingIds]);

  // Recomputed Dynamic Stats for the Customized Report
  const dynamicStats = useMemo(() => {
    const total = finalIncludedFindings.length;
    const major = finalIncludedFindings.filter(f => f.severity === 'Major Non-Conformity').length;
    const minor = finalIncludedFindings.filter(f => f.severity === 'Minor Non-Conformity').length;
    const obs = finalIncludedFindings.filter(f => f.severity === 'Observation').length;
    const ofi = finalIncludedFindings.filter(f => f.severity === 'Opportunity for Improvement').length;
    const closed = finalIncludedFindings.filter(f => f.status === 'Closed Verified').length;
    const open = total - closed;
    const overdue = finalIncludedFindings.filter(f => {
      if (f.status === 'Closed Verified') return false;
      if (!f.capaPlan?.targetDate) return false;
      return new Date(f.capaPlan.targetDate) < new Date('2026-09-13');
    }).length;
    const remRate = total > 0 ? Math.round((closed / total) * 100) : 100;

    return {
      totalFindings: total,
      majorNCs: major,
      minorNCs: minor,
      observations: obs,
      ofis: ofi,
      openCount: open,
      closedCount: closed,
      overdueCount: overdue,
      remediationRate: remRate
    };
  }, [finalIncludedFindings]);

  // Recomputed Department Breakdown for Included Findings
  const dynamicDepartmentBreakdown = useMemo(() => {
    const map: Record<string, { total: number; major: number; minor: number; open: number }> = {};

    finalIncludedFindings.forEach(f => {
      const dept = f.department || 'General IT Operations';
      if (!map[dept]) {
        map[dept] = { total: 0, major: 0, minor: 0, open: 0 };
      }
      map[dept].total += 1;
      if (f.severity === 'Major Non-Conformity') map[dept].major += 1;
      if (f.severity === 'Minor Non-Conformity') map[dept].minor += 1;
      if (f.status !== 'Closed Verified') map[dept].open += 1;
    });

    return Object.entries(map)
      .map(([name, counts]) => ({ name, ...counts }))
      .sort((a, b) => b.total - a.total);
  }, [finalIncludedFindings]);

  // Recomputed Root Cause Breakdown
  const dynamicRootCauseBreakdown = useMemo(() => {
    const categories = [
      { category: 'Technical Controls Deficit', count: 0, percentage: 0 },
      { category: 'Process & Procedural Gaps', count: 0, percentage: 0 },
      { category: 'People & Competency Training', count: 0, percentage: 0 },
      { category: 'Vendor / Third-Party Assurance', count: 0, percentage: 0 }
    ];

    const total = finalIncludedFindings.length;
    if (total === 0) return categories;

    finalIncludedFindings.forEach(f => {
      const rcText = (f.rootCauseAnalysis?.rootCauseStatement || '').toLowerCase();
      if (rcText.includes('process') || rcText.includes('procedure') || rcText.includes('cadence')) {
        categories[1].count += 1;
      } else if (rcText.includes('training') || rcText.includes('human') || rcText.includes('awareness')) {
        categories[2].count += 1;
      } else if (rcText.includes('vendor') || rcText.includes('supplier') || rcText.includes('contract')) {
        categories[3].count += 1;
      } else {
        categories[0].count += 1;
      }
    });

    categories.forEach(c => {
      c.percentage = Math.round((c.count / total) * 100);
    });

    return categories;
  }, [finalIncludedFindings]);

  // Dynamic Cryptographic SHA-256 Seal calculated synchronously & asynchronously
  const [cryptographicSeal, setCryptographicSeal] = useState<string>('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');

  useEffect(() => {
    const payload = JSON.stringify({
      tenantId,
      documentRef,
      reportTitle,
      auditCycle,
      sections,
      includedFindingCodes: finalIncludedFindings.map(f => f.findingCode),
      stats: dynamicStats,
      timestamp: '2026-09-13T08:00:00Z'
    });

    computeSHA256(payload).then(hash => {
      setCryptographicSeal(hash);
    }).catch(() => {
      setCryptographicSeal(fallbackHash(payload));
    });
  }, [tenantId, documentRef, reportTitle, auditCycle, sections, finalIncludedFindings, dynamicStats]);

  // Page Count Estimation
  const hasPage1 =
    sections.includeTitleBlock !== false ||
    sections.includeExecutiveSummary !== false ||
    sections.includeKpiMetrics !== false ||
    sections.includeDepartmentBreakdown !== false ||
    sections.includeRootCauseTaxonomy !== false ||
    sections.includeSignatories !== false;

  const findingsPerPage = 3;
  const findingsPages =
    sections.includeDetailedFindings !== false && finalIncludedFindings.length > 0
      ? Math.ceil(finalIncludedFindings.length / findingsPerPage)
      : 0;

  const estimatedTotalPages = Math.max(1, (hasPage1 ? 1 : 0) + findingsPages);

  // Executive Opinion Statement
  const executiveOpinion = useMemo(() => {
    if (dynamicStats.majorNCs > 0) {
      return 'QUALIFIED ASSURANCE — MATERIAL NON-CONFORMITIES REQUIRE SYSTEMIC CAPA CLOSURE';
    }
    if (dynamicStats.minorNCs > 0) {
      return 'SATISFACTORY ASSURANCE WITH MINOR PROCEDURAL GAPS';
    }
    return 'SUBSTANTIAL & UNQUALIFIED ASSURANCE — CONTROLS OPERATING EFFECTIVELY';
  }, [dynamicStats]);

  const executiveSummaryText = useMemo(() => {
    return `Based on independent, objective sampling and evidence inspection conducted across ${selectedFrameworks.join(
      ', '
    )}, the audit team has evaluated ${dynamicStats.totalFindings} findings. Corrective and preventive action plans (CAPA) have achieved a ${
      dynamicStats.remediationRate
    }% resolution health rating. Senior leadership must oversee immediate containment of identified non-conformities prior to external regulatory attestation.`;
  }, [selectedFrameworks, dynamicStats]);

  // Finalize and Export PDF
  const handleFinalizePDF = () => {
    setIsExporting(true);
    try {
      const pdfData: AuditReportPdfData = {
        tenantName,
        reportTitle,
        documentRef,
        classification,
        auditCycle,
        targetStakeholder:
          stakeholderView === 'board'
            ? 'Board of Directors & Audit Committee'
            : stakeholderView === 'ciso'
            ? 'CISO & Executive Leadership Team'
            : stakeholderView === 'owners'
            ? 'Department Remediation Owners & Process Leads'
            : 'Comprehensive Audit Working Papers (Full Dossier)',
        frameworks: selectedFrameworks,
        leadAuditor,
        reviewDate: new Date().toISOString().split('T')[0],
        sha256Seal: sections.includeAuditSeal ? cryptographicSeal : undefined,
        executiveOpinion,
        executiveSummaryText,
        sections,
        stats: dynamicStats,
        departmentBreakdown: dynamicDepartmentBreakdown,
        rootCauseBreakdown: dynamicRootCauseBreakdown,
        findings: finalIncludedFindings.map(f => ({
          findingCode: f.findingCode,
          title: f.title,
          severity: f.severity,
          status: f.status,
          clauseOrControl: f.clauseOrControl,
          department: f.department,
          rootCause: f.rootCauseAnalysis?.rootCauseStatement || '5-Whys root cause verified.',
          correctiveAction: f.capaPlan?.correctiveAction || 'Remediation plan enacted.',
          preventiveAction: f.capaPlan?.preventiveAction || 'Preventive control guardrail instituted.',
          owner: f.capaPlan?.owner || 'Remediation Lead',
          targetDate: f.capaPlan?.targetDate || '2026-09-30'
        })),
        signatories: sections.includeSignatories ? activeSignatories : undefined
      };

      exportAuditReportPDF(pdfData);

      showToast({
        title: 'Customized PDF Finalized & Exported',
        message: `Successfully generated ${documentRef}.pdf with ${finalIncludedFindings.length} findings across ${estimatedTotalPages} page(s).`,
        type: 'success'
      });
    } catch (err) {
      console.error('Failed to export customized PDF:', err);
      showToast({
        title: 'Export Failed',
        message: 'Could not render finalized PDF. Please check settings.',
        type: 'error'
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Save Customized Snapshot to Archive
  const handleSaveToArchive = () => {
    if (!onSaveToArchive) {
      showToast({ title: 'Archive Vault', message: 'Archive callback is not wired.', type: 'info' });
      return;
    }

    const newArchivedReport: ArchivedAuditReport = {
      id: `arch_${Date.now()}`,
      tenantId,
      reportRef: documentRef,
      title: reportTitle,
      auditCycle,
      targetStakeholder:
        stakeholderView === 'board'
          ? 'Board of Directors & Audit Committee'
          : stakeholderView === 'ciso'
          ? 'CISO & Executive Leadership Team'
          : stakeholderView === 'owners'
          ? 'Department Remediation Owners & Process Leads'
          : 'Comprehensive Audit Working Papers (Full Dossier)',
      frameworks: selectedFrameworks,
      generatedDate: new Date().toISOString().split('T')[0],
      leadAuditor,
      classification,
      status: 'Published',
      pinned: false,
      sha256Seal: cryptographicSeal,
      executiveOpinion,
      executiveSummaryText,
      stats: dynamicStats,
      departmentBreakdown: dynamicDepartmentBreakdown,
      rootCauseBreakdown: dynamicRootCauseBreakdown,
      findings: finalIncludedFindings.map(f => ({
        findingCode: f.findingCode,
        title: f.title,
        severity: f.severity,
        status: f.status,
        clauseOrControl: f.clauseOrControl,
        department: f.department,
        rootCause: f.rootCauseAnalysis?.rootCauseStatement || 'Root cause identified.',
        correctiveAction: f.capaPlan?.correctiveAction || 'Corrective action implemented.',
        preventiveAction: f.capaPlan?.preventiveAction || 'Preventive action established.',
        owner: f.capaPlan?.owner || 'Owner',
        targetDate: f.capaPlan?.targetDate || '2026-09-30'
      })),
      signatories: activeSignatories
    };

    onSaveToArchive(newArchivedReport);
    showToast({
      title: 'Snapshot Archived',
      message: `Report ${documentRef} sealed and recorded in Audit Report Archive vault.`,
      type: 'success'
    });
  };

  // Copy Markdown
  const handleCopyMarkdown = () => {
    const lines = [
      `# ${reportTitle}`,
      `**Document Ref:** \`${documentRef}\`  `,
      `**Audit Cycle:** ${auditCycle}  `,
      `**Audience:** ${stakeholderView.toUpperCase()}  `,
      `**Lead Auditor:** ${leadAuditor}  `,
      `**Cryptographic Seal:** \`${cryptographicSeal}\`  `,
      '',
      `## Executive Opinion Attestation`,
      `> **${executiveOpinion}**`,
      '',
      executiveSummaryText,
      '',
      `## Key Assurance Metrics`,
      `- **Total Findings In Scope:** ${dynamicStats.totalFindings}`,
      `- **Major Non-Conformities:** ${dynamicStats.majorNCs}`,
      `- **Minor NCs & OFIs:** ${dynamicStats.minorNCs + dynamicStats.observations}`,
      `- **CAPA Resolution Rate:** ${dynamicStats.remediationRate}% (${dynamicStats.closedCount} closed / ${dynamicStats.openCount} open)`
    ];

    if (sections.includeDetailedFindings && finalIncludedFindings.length > 0) {
      lines.push('', '## Detailed Traceable Findings Register');
      finalIncludedFindings.forEach(f => {
        lines.push(
          `### [${f.severity.toUpperCase()}] ${f.findingCode}: ${f.title}`,
          `- **Clause / Control:** ${f.clauseOrControl}`,
          `- **Department:** ${f.department}`,
          `- **Status:** ${f.status}`,
          `- **5-Whys Root Cause:** ${f.rootCauseAnalysis?.rootCauseStatement || 'N/A'}`,
          `- **Corrective Action:** ${f.capaPlan?.correctiveAction || 'N/A'}`,
          `- **Preventive Action:** ${f.capaPlan?.preventiveAction || 'N/A'}`,
          `- **Remediation Owner:** ${f.capaPlan?.owner || 'N/A'} (SLA: ${f.capaPlan?.targetDate || 'N/A'})`,
          ''
        );
      });
    }

    navigator.clipboard.writeText(lines.join('\n'));
    setHasCopiedMarkdown(true);
    setTimeout(() => setHasCopiedMarkdown(false), 2500);
    showToast({ title: 'Markdown Copied', message: 'Customized audit dossier copied to clipboard.', type: 'info' });
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
      'Root Cause',
      'Corrective Action',
      'Preventive Action',
      'Remediation Owner',
      'Target Date'
    ];

    const rows = finalIncludedFindings.map(f => [
      `"${f.findingCode}"`,
      `"${f.title.replace(/"/g, '""')}"`,
      `"${f.severity}"`,
      `"${f.status}"`,
      `"${f.clauseOrControl}"`,
      `"${f.department}"`,
      `"${(f.rootCauseAnalysis?.rootCauseStatement || '').replace(/"/g, '""')}"`,
      `"${(f.capaPlan?.correctiveAction || '').replace(/"/g, '""')}"`,
      `"${(f.capaPlan?.preventiveAction || '').replace(/"/g, '""')}"`,
      `"${f.capaPlan?.owner || ''}"`,
      `"${f.capaPlan?.targetDate || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${documentRef}_Customized_Findings.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast({ title: 'CSV Downloaded', message: `Exported ${finalIncludedFindings.length} findings to CSV.`, type: 'success' });
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Top Banner Navigation Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 shadow-md">
        <div className="flex items-center space-x-3">
          <button
            onClick={onClose}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition cursor-pointer"
            id="btn-preview-back-to-generator"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Generator</span>
          </button>

          <div className="h-6 w-px bg-slate-800" />

          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800 flex items-center space-x-1">
                <SlidersHorizontal className="w-3 h-3 mr-1 inline" />
                Interactive Report Customizer & Preview
              </span>
              <span className="text-xs font-mono text-slate-400 font-bold">{documentRef}</span>
            </div>
            <h2 className="text-base font-bold text-white tracking-tight mt-0.5">
              Customize Report Sections, Audit Criteria & Layout
            </h2>
          </div>
        </div>

        {/* Live Scope Metrics Badge & Finalize Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Live In-Scope Badge */}
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
            <span className="text-slate-400">Scope:</span>
            <span className="font-bold text-emerald-400">{finalIncludedFindings.length}</span>
            <span className="text-slate-500">/ {findings.length} findings</span>
            <span className="text-slate-600">•</span>
            <span className="text-sky-400 font-mono font-semibold">~{estimatedTotalPages} PDF pg</span>
          </div>

          {/* Export Customized PDF */}
          <button
            onClick={handleFinalizePDF}
            disabled={isExporting}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-950/40 transition cursor-pointer disabled:opacity-50"
            id="btn-finalize-custom-pdf"
          >
            <Download className={`w-4 h-4 ${isExporting ? 'animate-bounce' : ''}`} />
            <span>{isExporting ? 'Generating PDF...' : 'Finalize & Export PDF'}</span>
          </button>

          {/* Archive Snapshot */}
          <button
            onClick={handleSaveToArchive}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition cursor-pointer"
            title="Cryptographically anchor and store customized snapshot into the archive"
            id="btn-preview-save-archive"
          >
            <BookmarkCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden md:inline">Save to Archive</span>
          </button>

          {/* Copy Markdown */}
          <button
            onClick={handleCopyMarkdown}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition cursor-pointer"
            title="Copy customized markdown dossier"
          >
            {hasCopiedMarkdown ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span className="hidden md:inline">{hasCopiedMarkdown ? 'Copied' : 'Markdown'}</span>
          </button>

          {/* CSV */}
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition cursor-pointer"
            title="Download CSV of included findings"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">CSV</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout: Left Control Column + Right Interactive Document Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: Customizer Controls (Sections, Criteria, Findings, Metadata) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4">
          {/* Quick Presets Bar */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Executive Report Presets</span>
              </span>
              <span className="text-[10px] text-slate-500">1-Click Tailoring</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              <button
                onClick={() => applyPreset('executive')}
                className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-sky-950/60 hover:border-sky-700/60 text-slate-300 hover:text-sky-300 border border-slate-700/80 text-[11px] font-semibold transition cursor-pointer text-center"
              >
                Executive
              </button>
              <button
                onClick={() => applyPreset('technical')}
                className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-emerald-950/60 hover:border-emerald-700/60 text-slate-300 hover:text-emerald-300 border border-slate-700/80 text-[11px] font-semibold transition cursor-pointer text-center"
              >
                CAPA Only
              </button>
              <button
                onClick={() => applyPreset('governance')}
                className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-indigo-950/60 hover:border-indigo-700/60 text-slate-300 hover:text-indigo-300 border border-slate-700/80 text-[11px] font-semibold transition cursor-pointer text-center"
              >
                Governance
              </button>
              <button
                onClick={() => applyPreset('full')}
                className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-purple-950/60 hover:border-purple-700/60 text-slate-300 hover:text-purple-300 border border-slate-700/80 text-[11px] font-semibold transition cursor-pointer text-center"
              >
                Full Dossier
              </button>
            </div>
          </div>

          {/* Sub-Navigation Tabs inside the Customizer */}
          <div className="flex items-center space-x-1 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <button
              onClick={() => setActiveSettingsTab('sections')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-center transition cursor-pointer ${
                activeSettingsTab === 'sections'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sections ({Object.values(sections).filter(Boolean).length}/8)
            </button>
            <button
              onClick={() => setActiveSettingsTab('criteria')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-center transition cursor-pointer ${
                activeSettingsTab === 'criteria'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Audit Criteria
            </button>
            <button
              onClick={() => setActiveSettingsTab('findings')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-center transition cursor-pointer ${
                activeSettingsTab === 'findings'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Findings ({finalIncludedFindings.length})
            </button>
            <button
              onClick={() => setActiveSettingsTab('metadata')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-center transition cursor-pointer ${
                activeSettingsTab === 'metadata'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Metadata
            </button>
          </div>

          {/* TAB 1: SECTION VISIBILITY TOGGLES */}
          {activeSettingsTab === 'sections' && (
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Report Section Toggles</h3>
                  <p className="text-[11px] text-slate-400">Toggle visibility of specific findings & summary sections</p>
                </div>
                <button
                  onClick={() =>
                    setSections({
                      includeTitleBlock: true,
                      includeExecutiveSummary: true,
                      includeKpiMetrics: true,
                      includeDepartmentBreakdown: true,
                      includeRootCauseTaxonomy: true,
                      includeDetailedFindings: true,
                      includeSignatories: true,
                      includeAuditSeal: true
                    })
                  }
                  className="text-[10px] text-sky-400 hover:text-sky-300 font-semibold cursor-pointer"
                >
                  Enable All
                </button>
              </div>

              <div className="space-y-2">
                {/* 1. Executive Summary */}
                <div
                  onClick={() => toggleSection('includeExecutiveSummary')}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition cursor-pointer ${
                    sections.includeExecutiveSummary
                      ? 'bg-sky-950/20 border-sky-800/80 text-white'
                      : 'bg-slate-950/40 border-slate-800/60 text-slate-400 opacity-60'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <ShieldCheck className={`w-4 h-4 ${sections.includeExecutiveSummary ? 'text-sky-400' : 'text-slate-500'}`} />
                    <div>
                      <div className="text-xs font-semibold">Executive Opinion & Attestation</div>
                      <div className="text-[10.5px] text-slate-400">Formal audit conclusion & executive scope</div>
                    </div>
                  </div>
                  {sections.includeExecutiveSummary ? (
                    <Eye className="w-4 h-4 text-sky-400" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-slate-500" />
                  )}
                </div>

                {/* 2. KPI Scorecard */}
                <div
                  onClick={() => toggleSection('includeKpiMetrics')}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition cursor-pointer ${
                    sections.includeKpiMetrics
                      ? 'bg-sky-950/20 border-sky-800/80 text-white'
                      : 'bg-slate-950/40 border-slate-800/60 text-slate-400 opacity-60'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Award className={`w-4 h-4 ${sections.includeKpiMetrics ? 'text-sky-400' : 'text-slate-500'}`} />
                    <div>
                      <div className="text-xs font-semibold">Key Assurance KPI Metrics</div>
                      <div className="text-[10.5px] text-slate-400">Total findings, major NCs, and resolution health rate</div>
                    </div>
                  </div>
                  {sections.includeKpiMetrics ? (
                    <Eye className="w-4 h-4 text-sky-400" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-slate-500" />
                  )}
                </div>

                {/* 3. Departmental Concentration */}
                <div
                  onClick={() => toggleSection('includeDepartmentBreakdown')}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition cursor-pointer ${
                    sections.includeDepartmentBreakdown
                      ? 'bg-sky-950/20 border-sky-800/80 text-white'
                      : 'bg-slate-950/40 border-slate-800/60 text-slate-400 opacity-60'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Building className={`w-4 h-4 ${sections.includeDepartmentBreakdown ? 'text-sky-400' : 'text-slate-500'}`} />
                    <div>
                      <div className="text-xs font-semibold">Departmental Risk Concentration</div>
                      <div className="text-[10.5px] text-slate-400">Non-conformity breakdown by business unit</div>
                    </div>
                  </div>
                  {sections.includeDepartmentBreakdown ? (
                    <Eye className="w-4 h-4 text-sky-400" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-slate-500" />
                  )}
                </div>

                {/* 4. Root Cause Taxonomy (5-Whys) */}
                <div
                  onClick={() => toggleSection('includeRootCauseTaxonomy')}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition cursor-pointer ${
                    sections.includeRootCauseTaxonomy
                      ? 'bg-sky-950/20 border-sky-800/80 text-white'
                      : 'bg-slate-950/40 border-slate-800/60 text-slate-400 opacity-60'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Layers className={`w-4 h-4 ${sections.includeRootCauseTaxonomy ? 'text-sky-400' : 'text-slate-500'}`} />
                    <div>
                      <div className="text-xs font-semibold">5-Whys Root Cause Taxonomy</div>
                      <div className="text-[10.5px] text-slate-400">Technical, procedural, training, and vendor failure synthesis</div>
                    </div>
                  </div>
                  {sections.includeRootCauseTaxonomy ? (
                    <Eye className="w-4 h-4 text-sky-400" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-slate-500" />
                  )}
                </div>

                {/* 5. Detailed Findings Register */}
                <div
                  onClick={() => toggleSection('includeDetailedFindings')}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition cursor-pointer ${
                    sections.includeDetailedFindings
                      ? 'bg-sky-950/20 border-sky-800/80 text-white'
                      : 'bg-slate-950/40 border-slate-800/60 text-slate-400 opacity-60'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <FileText className={`w-4 h-4 ${sections.includeDetailedFindings ? 'text-sky-400' : 'text-slate-500'}`} />
                    <div>
                      <div className="text-xs font-semibold">Detailed Findings Register & CAPA</div>
                      <div className="text-[10.5px] text-slate-400">Full traceable non-conformity cards (Pages 2+)</div>
                    </div>
                  </div>
                  {sections.includeDetailedFindings ? (
                    <Eye className="w-4 h-4 text-sky-400" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-slate-500" />
                  )}
                </div>

                {/* 6. Signatories & Endorsements */}
                <div
                  onClick={() => toggleSection('includeSignatories')}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition cursor-pointer ${
                    sections.includeSignatories
                      ? 'bg-sky-950/20 border-sky-800/80 text-white'
                      : 'bg-slate-950/40 border-slate-800/60 text-slate-400 opacity-60'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Users className={`w-4 h-4 ${sections.includeSignatories ? 'text-sky-400' : 'text-slate-500'}`} />
                    <div>
                      <div className="text-xs font-semibold">Executive Governance Sign-Offs</div>
                      <div className="text-[10.5px] text-slate-400">Lead Auditor, CISO, CRO, and Board signatures</div>
                    </div>
                  </div>
                  {sections.includeSignatories ? (
                    <Eye className="w-4 h-4 text-sky-400" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-slate-500" />
                  )}
                </div>

                {/* 7. Cryptographic Seal */}
                <div
                  onClick={() => toggleSection('includeAuditSeal')}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition cursor-pointer ${
                    sections.includeAuditSeal
                      ? 'bg-sky-950/20 border-sky-800/80 text-white'
                      : 'bg-slate-950/40 border-slate-800/60 text-slate-400 opacity-60'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Lock className={`w-4 h-4 ${sections.includeAuditSeal ? 'text-sky-400' : 'text-slate-500'}`} />
                    <div>
                      <div className="text-xs font-semibold">Cryptographic SHA-256 Audit Seal</div>
                      <div className="text-[10.5px] text-slate-400">Verifiable tamper-evident digest strip</div>
                    </div>
                  </div>
                  {sections.includeAuditSeal ? (
                    <Eye className="w-4 h-4 text-sky-400" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-slate-500" />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AUDIT CRITERIA & FRAMEWORK FILTERS */}
          {activeSettingsTab === 'criteria' && (
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm space-y-4">
              <div className="border-b border-slate-800 pb-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Audit Criteria Filters</h3>
                <p className="text-[11px] text-slate-400">Filter candidate findings by framework, severity, and lifecycle</p>
              </div>

              {/* Audit Frameworks */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Audit Criteria Frameworks
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'ISO/IEC 27001:2022',
                    'MAS TRM Guidelines',
                    'DPDP Act 2023',
                    'ISO/IEC 42001:2023'
                  ].map(fw => {
                    const isSelected = selectedFrameworks.includes(fw);
                    return (
                      <button
                        key={fw}
                        onClick={() => toggleFrameworkCriteria(fw)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                          isSelected
                            ? 'bg-sky-600/30 border-sky-500 text-sky-200'
                            : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {isSelected ? <Check className="w-3 h-3 inline mr-1 text-sky-400" /> : null}
                        {fw}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Severity Criteria */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Finding Severity Filter
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { label: 'Major Non-Conformity', color: 'rose' },
                    { label: 'Minor Non-Conformity', color: 'amber' },
                    { label: 'Observation', color: 'sky' },
                    { label: 'Opportunity for Improvement', color: 'emerald' }
                  ].map(item => {
                    const isSelected = selectedSeverities.includes(item.label);
                    return (
                      <button
                        key={item.label}
                        onClick={() => toggleSeverityCriteria(item.label)}
                        className={`p-2 rounded-lg text-left text-xs font-semibold border transition cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-slate-800 border-slate-600 text-white'
                            : 'bg-slate-950/40 border-slate-800/80 text-slate-500 opacity-60'
                        }`}
                      >
                        <span className="truncate mr-1">{item.label}</span>
                        {isSelected ? (
                          <CheckSquare className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        ) : (
                          <Square className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Lifecycle Status Filter
                </label>
                <div className="grid grid-cols-3 gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setStatusFilter('ALL')}
                    className={`py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                      statusFilter === 'ALL' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    All Statuses
                  </button>
                  <button
                    onClick={() => setStatusFilter('OPEN')}
                    className={`py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                      statusFilter === 'OPEN' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Open Only
                  </button>
                  <button
                    onClick={() => setStatusFilter('CLOSED')}
                    className={`py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                      statusFilter === 'CLOSED' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Closed Only
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-400">Matching Candidate Findings:</span>
                <span className="font-bold text-sky-400">{candidateFindings.length}</span>
              </div>
            </div>
          )}

          {/* TAB 3: GRANULAR FINDINGS SELECTION CHECKLIST */}
          {activeSettingsTab === 'findings' && (
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Granular Findings Inclusion</h3>
                  <p className="text-[11px] text-slate-400">
                    {finalIncludedFindings.length} of {findings.length} findings selected for report
                  </p>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={selectAllFindings}
                    className="text-[10.5px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                  >
                    Select All
                  </button>
                  <button
                    onClick={deselectAllFindings}
                    className="text-[10.5px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Search filter in checklist */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter findings by code, clause, or title..."
                  value={findingSearchQuery}
                  onChange={e => setFindingSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Quick Filter Buttons */}
              <div className="flex items-center space-x-1 overflow-x-auto pb-1 text-[10.5px]">
                <button
                  onClick={selectOnlyMajorNCs}
                  className="px-2 py-0.5 rounded bg-rose-950/40 text-rose-300 border border-rose-900/60 hover:bg-rose-900/40 transition cursor-pointer whitespace-nowrap"
                >
                  Only Major NCs
                </button>
                <button
                  onClick={selectOnlyOpenFindings}
                  className="px-2 py-0.5 rounded bg-amber-950/40 text-amber-300 border border-amber-900/60 hover:bg-amber-900/40 transition cursor-pointer whitespace-nowrap"
                >
                  Only Active Open
                </button>
              </div>

              {/* Findings Checklist Container */}
              <div className="space-y-1.5 max-h-[340px] overflow-y-auto pr-1">
                {candidateFindings.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500 bg-slate-950/40 rounded-xl">
                    No findings match the current criteria filter.
                  </div>
                ) : (
                  candidateFindings.map(f => {
                    const isIncluded = includedFindingIds.has(f.id);
                    return (
                      <div
                        key={f.id}
                        onClick={() => toggleFindingInclusion(f.id)}
                        className={`p-2.5 rounded-xl border transition cursor-pointer flex items-start space-x-2.5 ${
                          isIncluded
                            ? 'bg-slate-800/80 border-slate-700 text-white'
                            : 'bg-slate-950/50 border-slate-800/80 text-slate-500 opacity-60'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isIncluded}
                          onChange={() => {}} // Handled by parent div
                          className="mt-0.5 rounded border-slate-700 text-sky-600 focus:ring-sky-500 cursor-pointer"
                        />

                        <div className="flex-1 min-w-0 space-y-0.5">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-mono text-[11px] font-bold text-sky-400">{f.findingCode}</span>
                            <span
                              className={`text-[9.5px] font-semibold px-1.5 py-0.2 rounded border ${
                                f.severity === 'Major Non-Conformity'
                                  ? 'bg-rose-950/80 text-rose-300 border-rose-800'
                                  : f.severity === 'Minor Non-Conformity'
                                  ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                                  : 'bg-sky-950/80 text-sky-300 border-sky-800'
                              }`}
                            >
                              {f.severity === 'Major Non-Conformity' ? 'MAJOR' : f.severity === 'Minor Non-Conformity' ? 'MINOR' : 'OBS'}
                            </span>
                          </div>

                          <div className="text-xs font-semibold text-slate-200 truncate">{f.title}</div>

                          <div className="flex items-center space-x-2 text-[10px] text-slate-400">
                            <span>{f.clauseOrControl}</span>
                            <span>•</span>
                            <span className="truncate">{f.department}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 4: REPORT METADATA CUSTOMIZER */}
          {activeSettingsTab === 'metadata' && (
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm space-y-3">
              <div className="border-b border-slate-800 pb-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Report Metadata & Lens</h3>
                <p className="text-[11px] text-slate-400">Fine-tune title, cycle, classification and audience</p>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-300">Target Stakeholder Lens</label>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  <button
                    onClick={() => setStakeholderView('board')}
                    className={`p-2 rounded-lg text-left font-semibold border transition cursor-pointer ${
                      stakeholderView === 'board'
                        ? 'bg-sky-600 text-white border-sky-500'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    Board & Audit Comm.
                  </button>
                  <button
                    onClick={() => setStakeholderView('ciso')}
                    className={`p-2 rounded-lg text-left font-semibold border transition cursor-pointer ${
                      stakeholderView === 'ciso'
                        ? 'bg-sky-600 text-white border-sky-500'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    CISO & Leadership
                  </button>
                  <button
                    onClick={() => setStakeholderView('owners')}
                    className={`p-2 rounded-lg text-left font-semibold border transition cursor-pointer ${
                      stakeholderView === 'owners'
                        ? 'bg-sky-600 text-white border-sky-500'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    Remediation Owners
                  </button>
                  <button
                    onClick={() => setStakeholderView('auditor')}
                    className={`p-2 rounded-lg text-left font-semibold border transition cursor-pointer ${
                      stakeholderView === 'auditor'
                        ? 'bg-sky-600 text-white border-sky-500'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    Full Working Papers
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300">Custom Report Title</label>
                <input
                  type="text"
                  value={reportTitle}
                  onChange={e => setReportTitle(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300">Audit Program Cycle</label>
                <input
                  type="text"
                  value={auditCycle}
                  onChange={e => setAuditCycle(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300">Lead Auditor Endorsement</label>
                <input
                  type="text"
                  value={leadAuditor}
                  onChange={e => setLeadAuditor(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300">Classification Tag</label>
                <select
                  value={classification}
                  onChange={e => setClassification(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                >
                  <option value="CONFIDENTIAL // INTERNAL AUDIT & BOARD ONLY">CONFIDENTIAL // INTERNAL AUDIT</option>
                  <option value="RESTRICTED // EXECUTIVE LEADERSHIP ONLY">RESTRICTED // EXECUTIVE LEADERSHIP</option>
                  <option value="STRICTLY CONFIDENTIAL // AUDIT COMMITTEE">STRICTLY CONFIDENTIAL // AUDIT COMMITTEE</option>
                  <option value="INTERNAL COMPLIANCE USE ONLY">INTERNAL COMPLIANCE USE ONLY</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: Live Interactive Document Preview (A4 Page Stationery)       */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          {/* Document Preview Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
            <div className="flex items-center space-x-2">
              <span className="text-slate-400 font-semibold flex items-center space-x-1">
                <Eye className="w-3.5 h-3.5 text-sky-400" />
                <span>Live Document Preview</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                {sections.includeDetailedFindings ? `${estimatedTotalPages} Pages` : '1 Page (Executive Only)'}
              </span>
            </div>

            {/* View Mode & Zoom controls */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px]">
                <button
                  onClick={() => setPreviewViewMode('continuous')}
                  className={`px-2 py-0.5 rounded font-medium transition cursor-pointer ${
                    previewViewMode === 'continuous' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Continuous
                </button>
                <button
                  onClick={() => setPreviewViewMode('paginated')}
                  className={`px-2 py-0.5 rounded font-medium transition cursor-pointer ${
                    previewViewMode === 'paginated' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  By Page
                </button>
              </div>

              {previewViewMode === 'paginated' && (
                <div className="flex items-center space-x-1">
                  {Array.from({ length: estimatedTotalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => setActivePreviewPage(p)}
                      className={`w-6 h-6 rounded text-xs font-bold transition cursor-pointer ${
                        activePreviewPage === p
                          ? 'bg-sky-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}

              {/* Zoom toggle */}
              <div className="flex items-center space-x-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px]">
                <button
                  onClick={() => setZoomScale(75)}
                  className={`px-1.5 py-0.5 rounded ${zoomScale === 75 ? 'bg-slate-800 text-sky-400 font-bold' : 'text-slate-500'}`}
                >
                  75%
                </button>
                <button
                  onClick={() => setZoomScale(100)}
                  className={`px-1.5 py-0.5 rounded ${zoomScale === 100 ? 'bg-slate-800 text-sky-400 font-bold' : 'text-slate-500'}`}
                >
                  100%
                </button>
              </div>
            </div>
          </div>

          {/* Realistic A4 Document Preview Canvas */}
          <div
            className={`bg-slate-950 p-3 sm:p-6 rounded-2xl border border-slate-800 shadow-2xl max-h-[800px] overflow-y-auto space-y-6 ${
              zoomScale === 75 ? 'scale-95 origin-top' : ''
            }`}
          >
            {/* =================================================================== */}
            {/* DOCUMENT PAGE 1: COVER & EXECUTIVE ASSURANCE                        */}
            {/* =================================================================== */}
            {(previewViewMode === 'continuous' || activePreviewPage === 1) && hasPage1 && (
              <div className="bg-white text-slate-900 rounded-lg shadow-xl p-6 sm:p-8 space-y-5 border border-slate-200 min-h-[720px] relative">
                {/* Page 1 Header Banner */}
                <div className="border-b-2 border-sky-500 pb-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-slate-900 tracking-tight text-sm">SKANDA GRC</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-600 font-medium">AUDIT FINDINGS & CAPA REPORT</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500 font-mono text-[10px]">{auditCycle}</span>
                  </div>
                  <span className="font-bold text-[10px] text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    {classification}
                  </span>
                </div>

                {/* Section Title */}
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  SECTION 1: EXECUTIVE AUDIT SUMMARY & ASSURANCE
                </div>

                {/* Title Container */}
                {sections.includeTitleBlock && (
                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2 relative group">
                    <div className="flex items-center justify-between">
                      <h1 className="text-lg font-bold text-slate-900 tracking-tight">{reportTitle}</h1>
                      <span className="text-[10.5px] font-mono font-semibold text-slate-500">{documentRef}</span>
                    </div>

                    <div className="text-xs text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
                      <span>
                        Target Audience: <strong className="text-slate-800">{stakeholderView.toUpperCase()}</strong>
                      </span>
                      <span>
                        Organization: <strong className="text-slate-800">{tenantName}</strong>
                      </span>
                      <span>
                        Lead Auditor: <strong className="text-slate-800">{leadAuditor}</strong>
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center space-x-2">
                      <span>Frameworks: {selectedFrameworks.join(', ')}</span>
                      <span>•</span>
                      <span>Published: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>

                    {/* Cryptographic Seal Strip inside title */}
                    {sections.includeAuditSeal && (
                      <div className="mt-2 pt-2 border-t border-slate-200 flex items-center space-x-2 font-mono text-[9px] text-cyan-800 bg-cyan-50/60 px-2 py-1 rounded border border-cyan-200">
                        <Lock className="w-3 h-3 text-cyan-700 shrink-0" />
                        <span className="truncate">VERIFIED CRYPTOGRAPHIC SEAL: {cryptographicSeal}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Executive Opinion Attestation Box */}
                {sections.includeExecutiveSummary && (
                  <div className="p-4 rounded-lg bg-teal-50/80 border-l-4 border-teal-600 shadow-sm space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider">
                        FORMAL AUDITOR OPINION & ATTESTATION
                      </span>
                      <span className="text-[10px] font-bold text-teal-700 bg-teal-100/80 px-2 py-0.5 rounded">
                        INDEPENDENT ASSURANCE
                      </span>
                    </div>
                    <div className="text-sm font-bold text-slate-900">{executiveOpinion}</div>
                    <p className="text-xs text-slate-700 leading-relaxed">{executiveSummaryText}</p>
                  </div>
                )}

                {/* Key Assurance KPI Cards */}
                {sections.includeKpiMetrics && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="text-[10px] font-bold text-slate-500 uppercase">Total Findings</div>
                      <div className="text-xl font-bold text-slate-900 mt-0.5">{dynamicStats.totalFindings}</div>
                      <div className="text-[10px] text-slate-500">In-scope items</div>
                    </div>

                    <div className="p-3 rounded-lg bg-rose-50/50 border border-rose-200">
                      <div className="text-[10px] font-bold text-rose-600 uppercase">Major NCs</div>
                      <div className="text-xl font-bold text-rose-700 mt-0.5">{dynamicStats.majorNCs}</div>
                      <div className="text-[10px] text-rose-600">Immediate CAPA</div>
                    </div>

                    <div className="p-3 rounded-lg bg-amber-50/50 border border-amber-200">
                      <div className="text-[10px] font-bold text-amber-600 uppercase">Minor NCs & Obs</div>
                      <div className="text-xl font-bold text-amber-700 mt-0.5">
                        {dynamicStats.minorNCs + dynamicStats.observations}
                      </div>
                      <div className="text-[10px] text-amber-600">Planned closure</div>
                    </div>

                    <div className="p-3 rounded-lg bg-teal-50/50 border border-teal-200">
                      <div className="text-[10px] font-bold text-teal-700 uppercase">Remediation Health</div>
                      <div className="text-xl font-bold text-teal-800 mt-0.5">{dynamicStats.remediationRate}%</div>
                      <div className="text-[10px] text-teal-700">
                        {dynamicStats.closedCount} closed / {dynamicStats.openCount} open
                      </div>
                    </div>
                  </div>
                )}

                {/* Departmental Concentration */}
                {sections.includeDepartmentBreakdown && dynamicDepartmentBreakdown.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-xs font-bold text-slate-900">
                      Departmental Non-Conformity Concentration
                    </div>
                    <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                      <table className="w-full text-left">
                        <thead className="bg-slate-100 text-[10px] font-bold text-slate-600 uppercase">
                          <tr>
                            <th className="py-1.5 px-3">Business Unit / Department</th>
                            <th className="py-1.5 px-3 text-center">Total Findings</th>
                            <th className="py-1.5 px-3 text-center">Major NC</th>
                            <th className="py-1.5 px-3 text-center">Minor NC</th>
                            <th className="py-1.5 px-3 text-center">Active Open</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-[11px]">
                          {dynamicDepartmentBreakdown.slice(0, 4).map(d => (
                            <tr key={d.name} className="hover:bg-slate-50">
                              <td className="py-1.5 px-3 font-semibold text-slate-800">{d.name}</td>
                              <td className="py-1.5 px-3 text-center font-bold">{d.total}</td>
                              <td className="py-1.5 px-3 text-center text-rose-600 font-bold">{d.major}</td>
                              <td className="py-1.5 px-3 text-center text-amber-600">{d.minor}</td>
                              <td className="py-1.5 px-3 text-center text-slate-600 font-semibold">{d.open}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Root Cause Taxonomy */}
                {sections.includeRootCauseTaxonomy && dynamicRootCauseBreakdown.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-xs font-bold text-slate-900">Root Cause Taxonomy (5-Whys Synthesis)</div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {dynamicRootCauseBreakdown.map(rc => (
                        <div key={rc.category} className="p-2 rounded bg-slate-50 border border-slate-200 text-xs">
                          <div className="text-[10px] text-slate-600 font-semibold truncate">{rc.category}</div>
                          <div className="text-sm font-bold text-cyan-800 mt-0.5">
                            {rc.count} ({rc.percentage}%)
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Signatories & Endorsements */}
                {sections.includeSignatories && activeSignatories.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <div className="text-xs font-bold text-slate-900">Executive Sign-Off & Governance Endorsement</div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      {activeSignatories.map(s => (
                        <div key={s.title} className="p-2 rounded bg-slate-50 border border-slate-200 space-y-0.5">
                          <div className="text-[10px] font-bold text-slate-700 truncate">{s.name}</div>
                          <div className="text-[9px] text-slate-500 truncate">{s.title}</div>
                          <div className="text-[9px] text-teal-700 font-semibold">
                            ✓ {s.status} ({s.date})
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Page 1 Footer */}
                <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>
                    Doc Ref: {documentRef} | Tenant: {tenantName}
                  </span>
                  <span>Page 1 of {estimatedTotalPages}</span>
                </div>
              </div>
            )}

            {/* =================================================================== */}
            {/* DOCUMENT PAGES 2+: DETAILED FINDINGS REGISTER (PAGINATED CHUNKS)     */}
            {/* =================================================================== */}
            {sections.includeDetailedFindings ? (
              finalIncludedFindings.length === 0 ? (
                <div className="bg-white text-slate-900 rounded-lg p-8 border border-slate-200 text-center space-y-2">
                  <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
                  <div className="text-sm font-bold text-slate-800">No Findings Included in Report</div>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    All candidate findings have been excluded via filters or checklist toggles. Toggle at least one finding in the left customizer panel to view the findings register.
                  </p>
                  <button
                    onClick={selectAllFindings}
                    className="px-3 py-1.5 rounded-lg bg-sky-600 text-white font-bold text-xs cursor-pointer hover:bg-sky-500"
                  >
                    Include All Findings
                  </button>
                </div>
              ) : (
                // Render findings in chunks of 3 per simulated page
                Array.from({ length: findingsPages }, (_, chunkIndex) => {
                  const pageNum = (hasPage1 ? 1 : 0) + chunkIndex + 1;
                  if (previewViewMode === 'paginated' && activePreviewPage !== pageNum) {
                    return null;
                  }
                  const chunkFindings = finalIncludedFindings.slice(
                    chunkIndex * findingsPerPage,
                    chunkIndex * findingsPerPage + findingsPerPage
                  );

                  return (
                    <div
                      key={chunkIndex}
                      className="bg-white text-slate-900 rounded-lg shadow-xl p-6 sm:p-8 space-y-4 border border-slate-200 min-h-[720px] relative"
                    >
                      {/* Page Header */}
                      <div className="border-b-2 border-sky-500 pb-2 flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2">
                          <span className="font-extrabold text-slate-900 tracking-tight text-sm">SKANDA GRC</span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-600 font-medium">AUDIT FINDINGS & CAPA REPORT</span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-500 font-mono text-[10px]">
                            Section 2: Detailed Findings Register
                          </span>
                        </div>
                        <span className="font-bold text-[10px] text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          {classification}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        <span>DETAILED NON-CONFORMITY FINDINGS & CORRECTIVE ACTION (PART {chunkIndex + 1})</span>
                        <span>
                          Findings {chunkIndex * findingsPerPage + 1} to{' '}
                          {Math.min((chunkIndex + 1) * findingsPerPage, finalIncludedFindings.length)} of{' '}
                          {finalIncludedFindings.length}
                        </span>
                      </div>

                      {/* Finding Cards */}
                      <div className="space-y-4">
                        {chunkFindings.map(f => {
                          return (
                            <div
                              key={f.id}
                              className="rounded-lg border border-slate-200 overflow-hidden shadow-sm bg-white"
                            >
                              {/* Card Header */}
                              <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center space-x-2">
                                  <span className="font-mono text-xs font-bold text-slate-900">{f.findingCode}</span>
                                  <span className="text-slate-400">•</span>
                                  <span className="text-xs font-bold text-slate-800 truncate max-w-md">{f.title}</span>
                                </div>

                                <div className="flex items-center space-x-2">
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                      f.severity === 'Major Non-Conformity'
                                        ? 'bg-rose-100 text-rose-700 border border-rose-300'
                                        : f.severity === 'Minor Non-Conformity'
                                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                        : 'bg-sky-100 text-sky-800 border border-sky-300'
                                    }`}
                                  >
                                    {f.severity}
                                  </span>

                                  {/* Inline Exclude / Include button */}
                                  <button
                                    onClick={() => toggleFindingInclusion(f.id)}
                                    className="text-[10px] px-2 py-0.5 rounded bg-white hover:bg-slate-100 text-slate-600 border border-slate-300 font-semibold cursor-pointer"
                                    title="Click to toggle inclusion of this finding in the finalized report"
                                  >
                                    Exclude ✕
                                  </button>
                                </div>
                              </div>

                              {/* Card Body */}
                              <div className="p-3.5 space-y-2.5 text-xs">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-600 bg-slate-50/60 p-2 rounded border border-slate-100">
                                  <div>
                                    <span className="text-slate-400 block text-[10px] font-bold">CLAUSE / CONTROL</span>
                                    <span className="font-semibold text-slate-800">{f.clauseOrControl}</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-400 block text-[10px] font-bold">DEPARTMENT</span>
                                    <span className="font-semibold text-slate-800">{f.department}</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-400 block text-[10px] font-bold">REMEDIATION OWNER</span>
                                    <span className="font-semibold text-slate-800">{f.capaPlan?.owner || 'Remediation Lead'}</span>
                                  </div>
                                </div>

                                {/* 5-Whys Root Cause Statement */}
                                <div className="p-2 rounded bg-rose-50/70 border border-rose-100 text-slate-800 text-[11px] space-y-0.5">
                                  <div className="text-[10px] font-bold text-rose-700 uppercase">
                                    5-WHYS ROOT CAUSE ANALYSIS:
                                  </div>
                                  <p className="leading-snug">
                                    {f.rootCauseAnalysis?.rootCauseStatement ||
                                      'Investigation verified absence of enforced configuration baselines and recurring control testing.'}
                                  </p>
                                </div>

                                {/* CAPA Plan */}
                                <div className="p-2.5 rounded bg-sky-50/70 border border-sky-100 space-y-1.5 text-[11px] text-slate-800">
                                  <div>
                                    <span className="text-[10px] font-bold text-sky-800 block">
                                      CORRECTIVE ACTION (Containment & Repair):
                                    </span>
                                    <span>
                                      {f.capaPlan?.correctiveAction || 'Enacted emergency configuration remediation.'}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-[10px] font-bold text-sky-800 block">
                                      PREVENTIVE ACTION (Systemic Eradication):
                                    </span>
                                    <span>
                                      {f.capaPlan?.preventiveAction || 'Instituted automated CI/CD policy gates and team training.'}
                                    </span>
                                  </div>
                                </div>

                                {/* SLA & Verification */}
                                <div className="flex items-center justify-between text-[10px] pt-1 text-slate-500">
                                  <span>
                                    Target SLA Closure:{' '}
                                    <strong className="text-slate-700">{f.capaPlan?.targetDate || '2026-09-30'}</strong>
                                  </span>
                                  <span
                                    className={`font-bold ${
                                      f.status === 'Closed Verified' ? 'text-teal-700' : 'text-amber-700'
                                    }`}
                                  >
                                    Verification: {f.status === 'Closed Verified' ? 'VERIFIED & CLOSED' : 'PENDING OBJECTIVE SAMPLING'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Page Footer */}
                      <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <span>
                          Doc Ref: {documentRef} | Tenant: {tenantName}
                        </span>
                        <span>
                          Page {pageNum} of {estimatedTotalPages}
                        </span>
                      </div>
                    </div>
                  );
                })
              )
            ) : (
              /* Detailed Findings Omitted Placeholder */
              <div className="bg-slate-900 text-slate-300 rounded-lg p-6 border border-slate-800 text-center space-y-2">
                <FileText className="w-7 h-7 text-slate-500 mx-auto" />
                <div className="text-xs font-bold text-slate-200">
                  Detailed Findings Register Section Omitted
                </div>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                  The Detailed Findings section has been toggled off. The generated PDF will consist exclusively of Section 1 (Executive Summary & Governance).
                </p>
                <button
                  onClick={() => toggleSection('includeDetailedFindings')}
                  className="px-3 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs cursor-pointer"
                >
                  Enable Detailed Findings
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
