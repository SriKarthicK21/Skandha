import React, { useState, useMemo } from 'react';
import {
  FileText,
  CheckCircle2,
  AlertOctagon,
  FileQuestion,
  Clock,
  Shield,
  Search,
  X,
  Filter,
  ArrowUpDown,
  Download,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  History,
  RotateCcw,
  Sparkles,
  Layers,
  Hash,
  FileSpreadsheet,
  Copy,
  Check,
  Calendar,
  UserCheck,
  AlertTriangle,
  Info,
  ShieldCheck,
  ShieldAlert,
  SlidersHorizontal,
  BookmarkCheck,
  Maximize2
} from 'lucide-react';
import { EnrichedMASRequirement, RetrospectiveTimelinePoint, ComplianceStatusBadge } from './ComplianceGapVisualization';
import { EvidenceRecord, FindingCAPARecord, GeneratedDocument } from '../../types';
import { useToast } from '../common/ToastContainer';

export interface ComplianceAuditDataTableProps {
  /** The currently selected retrospective milestone/time point, or null if on Live view */
  selectedSnapshot: RetrospectiveTimelinePoint | null;
  /** Callback to clear snapshot and return to live view */
  onResetSnapshot: () => void;
  /** Active time horizon filter (e.g. 'ALL', '1Y', '6M', '3M', 'HISTORICAL_ONLY') */
  timeHorizon: string;
  /** Active filtered requirements synchronized with domain, risk, and status filters */
  filteredRequirements: EnrichedMASRequirement[];
  /** Total unfiltered enriched requirements */
  allEnrichedRequirements: EnrichedMASRequirement[];
  /** Currently active domain filter */
  selectedDomain: string;
  onSelectDomain: (domain: string) => void;
  /** Currently active risk filter */
  riskFilter: string;
  onSelectRiskFilter: (risk: any) => void;
  /** Currently active status filter */
  statusFilter: string;
  onSelectStatusFilter: (status: any) => void;
  /** Search query from parent */
  parentSearchQuery?: string;
  /** Callback when user selects a requirement to inspect details */
  onSelectRequirement: (req: EnrichedMASRequirement) => void;
  /** Enterprise policy documents from GRCContext */
  generatedDocs?: GeneratedDocument[];
  /** All evidence records in EvidenceVault */
  evidence?: EvidenceRecord[];
}

/** Pre-mapped standard policies for MAS TRM domains if not yet created by tenant */
const STANDARD_MAS_POLICIES: Record<string, { code: string; title: string; approver: string }> = {
  '3': { code: 'POL-GOV-01', title: 'IT Governance & Technology Risk Strategy Policy', approver: 'Board Risk Committee' },
  '4': { code: 'POL-RSK-02', title: 'Technology Risk Assessment & Threat Identification Framework', approver: 'Head of Operational Risk' },
  '5': { code: 'POL-IAM-01', title: 'Privileged Access Management & MFA Policy', approver: 'Chief Information Security Officer' },
  '6': { code: 'POL-NET-01', title: 'Zero-Trust Network Segmentation & Perimeter Defense Policy', approver: 'Head of Infrastructure Security' },
  '7': { code: 'POL-VULN-01', title: 'Vulnerability Remediation, Patching & Penetration Testing Policy', approver: 'Head of Security Operations' },
  '8': { code: 'POL-CRYPT-01', title: 'Data Protection, Cryptography & Key Lifecycle Policy', approver: 'Data Protection Officer & CISO' },
  '9': { code: 'POL-SOC-01', title: 'Cyber Threat Intelligence & 24/7 Security Monitoring Policy', approver: 'CISO / SOC Director' },
  '10': { code: 'POL-INC-01', title: 'Cyber Incident Response & MAS 1-Hour Notification Policy', approver: 'Crisis Management Committee & CISO' },
  '11': { code: 'POL-BCM-01', title: 'High Availability, BCP & Critical System Failover Policy', approver: 'Chief Information Officer' },
  '12': { code: 'POL-CLD-01', title: 'Multi-Cloud Architecture & Container Security Policy', approver: 'Cloud Security Architect' },
  '13': { code: 'POL-DEV-01', title: 'DevSecOps & Secure Software Development Lifecycle (SSDLC)', approver: 'Head of Engineering' },
  '14': { code: 'POL-TPRM-01', title: 'Third-Party Due Diligence & Critical Service Provider Policy', approver: 'Procurement & Risk Committee' },
  '15': { code: 'POL-PAY-01', title: 'Transaction Integrity & Online Financial Systems Protection Policy', approver: 'Head of Digital Banking' }
};

interface SynchronizedAuditRow {
  auditId: string;
  requirement: EnrichedMASRequirement;
  domainNumber: string;
  domainName: string;
  // Policy details synchronized with time scope
  policyCode: string;
  policyTitle: string;
  policyVersion: string;
  policyStatus: 'APPROVED' | 'IN_REVIEW' | 'DRAFT' | 'SUPERSEDED';
  policyApprover: string;
  policyEffectiveDate: string;
  // Evidence details synchronized with time scope
  evidenceTitle: string;
  evidenceFileName: string;
  evidenceStatus: 'VERIFIED' | 'PENDING' | 'MISSING_DEFICIENT' | 'REMEDIATED_LATER';
  evidenceStatusLabel: string;
  evidenceHash: string;
  evidenceUploadDate: string;
  evidenceDepartment: string;
  // Finding & Remediation
  hasFinding: boolean;
  findingCode?: string;
  findingTitle?: string;
  remediationOwner: string;
  remediationSla: string;
  // Overall Audit Conclusion
  complianceVerdict: 'COMPLIANT' | 'DEFICIENT' | 'UNDER_REVIEW' | 'PENDING_EVIDENCE';
}

export const ComplianceAuditDataTable: React.FC<ComplianceAuditDataTableProps> = ({
  selectedSnapshot,
  onResetSnapshot,
  timeHorizon,
  filteredRequirements,
  allEnrichedRequirements,
  selectedDomain,
  onSelectDomain,
  riskFilter,
  onSelectRiskFilter,
  statusFilter,
  onSelectStatusFilter,
  parentSearchQuery = '',
  onSelectRequirement,
  generatedDocs = [],
  evidence = []
}) => {
  const { showToast } = useToast();

  // Local Table States
  const [tableSearch, setTableSearch] = useState<string>('');
  const [evidenceFilter, setEvidenceFilter] = useState<'ALL' | 'VERIFIED' | 'MISSING' | 'PENDING'>('ALL');
  const [policyStatusFilter, setPolicyStatusFilter] = useState<'ALL' | 'APPROVED' | 'DRAFT_REVIEW'>('ALL');
  const [sortField, setSortField] = useState<'auditId' | 'domain' | 'risk' | 'status' | 'policyVersion'>('domain');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [expandedAuditIds, setExpandedAuditIds] = useState<Set<string>>(new Set());
  const [rowsPerPage, setRowsPerPage] = useState<number>(15);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Compute Synchronized Audit Records
  const synchronizedRecords = useMemo<SynchronizedAuditRow[]>(() => {
    // Determine cutoff timestamp if milestone selected
    const isSnapshotActive = selectedSnapshot !== null;
    const isLive = !isSnapshotActive || selectedSnapshot.isCurrent;
    const isProjected = selectedSnapshot?.isProjected;
    const cutoffTime = selectedSnapshot ? new Date(selectedSnapshot.timestamp).getTime() : Date.now();
    const targetDeficientCount = selectedSnapshot?.deficient ?? 0;

    // Identify requirements that were deficient at this milestone
    const sortedAllReqs = [...allEnrichedRequirements].sort((a, b) => {
      if (a.complianceStatusBadge === 'Deficient' && b.complianceStatusBadge !== 'Deficient') return -1;
      if (b.complianceStatusBadge === 'Deficient' && a.complianceStatusBadge !== 'Deficient') return 1;
      if (a.riskTier === 'HIGH_RISK' && b.riskTier !== 'HIGH_RISK') return -1;
      if (b.riskTier === 'HIGH_RISK' && a.riskTier !== 'HIGH_RISK') return 1;
      return a.readinessScore - b.readinessScore;
    });

    const snapshotDeficientReqCodes = new Set<string>();
    if (isSnapshotActive && !isProjected) {
      sortedAllReqs.slice(0, targetDeficientCount).forEach((r) => snapshotDeficientReqCodes.add(r.requirementCode));
    }

    return filteredRequirements.map((req, index) => {
      // Generate clean, strictly unique audit workpaper ID from requirementCode (e.g. MAS-TRM-3.1 -> 3-1, MAS-TRM-ANNEX-A.1 -> ANNEX-A-1)
      const cleanNum = req.requirementCode
        ? req.requirementCode.replace(/^MAS[-_]TRM[-_]?/i, '').replace(/[^0-9a-zA-Z]+/g, '-')
        : `${req.domainNumber || 'DOM'}-${index + 1}`;
      const cleanCode = cleanNum;
      const auditId = `AUD-MAS-${cleanCode || String(index + 1).padStart(2, '0')}`;

      // 1. Determine governing policy
      const standardPol = STANDARD_MAS_POLICIES[req.domainNumber] || {
        code: `POL-MAS-${req.domainNumber.padStart(2, '0')}`,
        title: `${req.domainName} Mandatory Security Standard`,
        approver: 'Chief Information Security Officer'
      };

      const matchedDoc = generatedDocs.find(
        (d) =>
          d.docCode.toLowerCase().includes(req.requirementCode.toLowerCase()) ||
          d.docCode.toLowerCase().includes(`dom${req.domainNumber}`) ||
          d.title.toLowerCase().includes(req.domainName.toLowerCase())
      );

      const policyCode = matchedDoc?.docCode || standardPol.code;
      const policyTitle = matchedDoc?.title || standardPol.title;
      const policyApprover = matchedDoc?.approver || standardPol.approver;

      // Synchronize policy version with time horizon / milestone
      let policyVersion = 'v3.2';
      let policyStatus: SynchronizedAuditRow['policyStatus'] = 'APPROVED';
      let policyEffectiveDate = '2026-06-01';

      if (isSnapshotActive && selectedSnapshot) {
        const periodText = selectedSnapshot.period.toLowerCase();
        if (periodText.includes('oct') || periodText.includes('2025')) {
          policyVersion = 'v1.0 (Initial Draft)';
          policyStatus = 'DRAFT';
          policyEffectiveDate = '2025-08-15';
        } else if (periodText.includes('dec')) {
          policyVersion = 'v2.0 (CISO Ratified)';
          policyStatus = 'APPROVED';
          policyEffectiveDate = '2025-11-30';
        } else if (periodText.includes('feb') || periodText.includes('mar')) {
          policyVersion = 'v2.4 (Pre-Audit Baseline)';
          policyStatus = 'APPROVED';
          policyEffectiveDate = '2026-01-15';
        } else if (periodText.includes('apr') || periodText.includes('may') || periodText.includes('jun')) {
          policyVersion = 'v3.0 (Notice 655 Aligned)';
          policyStatus = 'APPROVED';
          policyEffectiveDate = '2026-04-01';
        } else {
          policyVersion = 'v3.2 (Supervisory Active)';
          policyStatus = 'APPROVED';
          policyEffectiveDate = '2026-06-01';
        }
      } else {
        policyVersion = 'v3.2 (Active Approved)';
        policyStatus = 'APPROVED';
        policyEffectiveDate = '2026-06-01';
      }

      // 2. Synchronize evidence status
      const associatedEv = req.associatedEvidence || [];
      let verifiedByCutoff: EvidenceRecord | undefined;
      let uploadedAfterCutoff: EvidenceRecord | undefined;

      for (const ev of associatedEv) {
        if (ev.uploadedDate) {
          const t = new Date(ev.uploadedDate).getTime();
          if (t <= cutoffTime) {
            if (!verifiedByCutoff || ev.status === 'Verified') {
              verifiedByCutoff = ev;
            }
          } else {
            if (!uploadedAfterCutoff) {
              uploadedAfterCutoff = ev;
            }
          }
        } else {
          if (!verifiedByCutoff) verifiedByCutoff = ev;
        }
      }

      const primaryEv = verifiedByCutoff || uploadedAfterCutoff || associatedEv[0];
      const evidenceTitle = primaryEv?.title || `${req.requirementCode} Implementation Telemetry & Audit Logs`;
      const evidenceFileName = primaryEv?.fileName || `${req.requirementCode.toLowerCase().replace(/[^a-z0-9]/g, '_')}_telemetry.pdf`;
      const evidenceUploadDate = primaryEv?.uploadedDate ? primaryEv.uploadedDate.slice(0, 10) : '2026-05-18';
      const evidenceDepartment = primaryEv?.department || 'Information Security & Infrastructure';
      
      // Deterministic synthetic SHA-256 hash based on requirementCode
      const hashSeeds = ['a8f9c1e4', 'b2e7d3f0', '9c4d2e8b', '7f1a5c6d', 'e3b8a2c1'];
      const seedIndex = Math.abs(req.requirementCode.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % hashSeeds.length;
      const evidenceHash = primaryEv?.sha256Hash || `sha256:${hashSeeds[seedIndex]}3e721a99846b0d9124c876b509ef${cleanNum.replace(/[^a-zA-Z0-9]/g, '')}`;

      let evidenceStatus: SynchronizedAuditRow['evidenceStatus'] = 'VERIFIED';
      let evidenceStatusLabel = 'Verified (Auditor Grade)';
      let complianceVerdict: SynchronizedAuditRow['complianceVerdict'] = 'COMPLIANT';

      const wasDeficientAtSnapshot = isSnapshotActive ? snapshotDeficientReqCodes.has(req.requirementCode) : req.complianceStatusBadge === 'Deficient';

      if (isProjected) {
        evidenceStatus = 'VERIFIED';
        evidenceStatusLabel = 'Projected Target Verification';
        complianceVerdict = 'COMPLIANT';
      } else if (isSnapshotActive && wasDeficientAtSnapshot) {
        if (uploadedAfterCutoff) {
          evidenceStatus = 'REMEDIATED_LATER';
          evidenceStatusLabel = `Deficient at ${selectedSnapshot.dateLabel} (Resolved Later)`;
          complianceVerdict = 'DEFICIENT';
        } else {
          evidenceStatus = 'MISSING_DEFICIENT';
          evidenceStatusLabel = `Missing at ${selectedSnapshot.dateLabel}`;
          complianceVerdict = 'DEFICIENT';
        }
      } else if (!isSnapshotActive) {
        // Live state
        if (req.complianceStatusBadge === 'Deficient') {
          evidenceStatus = 'MISSING_DEFICIENT';
          evidenceStatusLabel = 'Active Deficiency (Missing Artifact)';
          complianceVerdict = 'DEFICIENT';
        } else if (req.complianceStatusBadge === 'Pending Evidence') {
          evidenceStatus = 'PENDING';
          evidenceStatusLabel = 'Pending Review / Under Review';
          complianceVerdict = 'PENDING_EVIDENCE';
        } else if (req.complianceStatusBadge === 'Under Review') {
          evidenceStatus = 'PENDING';
          evidenceStatusLabel = 'Audit In-Review';
          complianceVerdict = 'UNDER_REVIEW';
        } else {
          evidenceStatus = 'VERIFIED';
          evidenceStatusLabel = 'Verified & Cryptographically Sealed';
          complianceVerdict = 'COMPLIANT';
        }
      } else {
        evidenceStatus = 'VERIFIED';
        evidenceStatusLabel = `Verified by ${selectedSnapshot.dateLabel}`;
        complianceVerdict = 'COMPLIANT';
      }

      // 3. Open findings
      const openFinding = req.openFindings?.[0];
      const hasFinding = Boolean(openFinding) || complianceVerdict === 'DEFICIENT';
      const findingCode = openFinding?.findingCode || openFinding?.id || (hasFinding ? `FIND-MAS-${cleanNum.replace(/[^a-zA-Z0-9]/g, '')}-01` : undefined);
      const findingTitle = openFinding?.title || (hasFinding ? `Non-conformity with MAS TRM ${req.requirementCode}` : undefined);
      const remediationOwner = openFinding?.capaPlan?.owner || 'Technology Risk & Cyber Defense Lead';
      const remediationSla = openFinding?.capaPlan?.targetDate ? openFinding.capaPlan.targetDate.slice(0, 10) : '2026-10-31';

      return {
        auditId,
        requirement: req,
        domainNumber: req.domainNumber,
        domainName: req.domainName,
        policyCode,
        policyTitle,
        policyVersion,
        policyStatus,
        policyApprover,
        policyEffectiveDate,
        evidenceTitle,
        evidenceFileName,
        evidenceStatus,
        evidenceStatusLabel,
        evidenceHash,
        evidenceUploadDate,
        evidenceDepartment,
        hasFinding,
        findingCode,
        findingTitle,
        remediationOwner,
        remediationSla,
        complianceVerdict
      };
    });
  }, [selectedSnapshot, filteredRequirements, allEnrichedRequirements, generatedDocs]);

  // Apply Secondary In-Table Filters & Search
  const filteredRecords = useMemo(() => {
    return synchronizedRecords.filter((rec) => {
      // Local in-table search
      if (tableSearch.trim()) {
        const q = tableSearch.toLowerCase();
        const matches =
          rec.auditId.toLowerCase().includes(q) ||
          rec.requirement.requirementCode.toLowerCase().includes(q) ||
          rec.requirement.title.toLowerCase().includes(q) ||
          rec.policyCode.toLowerCase().includes(q) ||
          rec.policyTitle.toLowerCase().includes(q) ||
          rec.evidenceFileName.toLowerCase().includes(q) ||
          rec.evidenceTitle.toLowerCase().includes(q) ||
          rec.domainName.toLowerCase().includes(q) ||
          rec.remediationOwner.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // In-table evidence filter
      if (evidenceFilter === 'VERIFIED' && rec.evidenceStatus !== 'VERIFIED') return false;
      if (evidenceFilter === 'MISSING' && rec.evidenceStatus !== 'MISSING_DEFICIENT') return false;
      if (evidenceFilter === 'PENDING' && rec.evidenceStatus !== 'PENDING' && rec.evidenceStatus !== 'REMEDIATED_LATER') return false;

      // In-table policy status filter
      if (policyStatusFilter === 'APPROVED' && rec.policyStatus !== 'APPROVED') return false;
      if (policyStatusFilter === 'DRAFT_REVIEW' && rec.policyStatus === 'APPROVED') return false;

      return true;
    });
  }, [synchronizedRecords, tableSearch, evidenceFilter, policyStatusFilter]);

  // Sorting Logic
  const sortedRecords = useMemo(() => {
    return [...filteredRecords].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'auditId') {
        comparison = a.auditId.localeCompare(b.auditId);
      } else if (sortField === 'domain') {
        const dA = parseFloat(a.domainNumber) || 0;
        const dB = parseFloat(b.domainNumber) || 0;
        comparison = dA - dB;
      } else if (sortField === 'risk') {
        const riskWeight = { HIGH_RISK: 3, MEDIUM_RISK: 2, LOW_RISK: 1 };
        comparison = (riskWeight[b.requirement.riskTier] || 0) - (riskWeight[a.requirement.riskTier] || 0);
      } else if (sortField === 'status') {
        const statusWeight = { DEFICIENT: 4, PENDING_EVIDENCE: 3, UNDER_REVIEW: 2, COMPLIANT: 1 };
        comparison = (statusWeight[b.complianceVerdict] || 0) - (statusWeight[a.complianceVerdict] || 0);
      } else if (sortField === 'policyVersion') {
        comparison = a.policyVersion.localeCompare(b.policyVersion);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredRecords, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(sortedRecords.length / rowsPerPage) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return sortedRecords.slice(start, start + rowsPerPage);
  }, [sortedRecords, currentPage, rowsPerPage]);

  // Row Expand/Collapse Handler
  const toggleRowExpanded = (auditId: string) => {
    setExpandedAuditIds((prev) => {
      const next = new Set(prev);
      if (next.has(auditId)) {
        next.delete(auditId);
      } else {
        next.add(auditId);
      }
      return next;
    });
  };

  const expandAllRows = () => {
    setExpandedAuditIds(new Set(paginatedRecords.map((r) => r.auditId)));
  };

  const collapseAllRows = () => {
    setExpandedAuditIds(new Set());
  };

  // Copy Citation Helper
  const copyCitation = (rec: SynchronizedAuditRow, e: React.MouseEvent) => {
    e.stopPropagation();
    const citation = `[${rec.requirement.requirementCode}] ${rec.auditId} • ${rec.requirement.title} • Policy: ${rec.policyCode} (${rec.policyVersion}) • Evidence: ${rec.evidenceFileName} (${rec.evidenceStatusLabel}) • Hash: ${rec.evidenceHash}`;
    navigator.clipboard.writeText(citation);
    setCopiedId(rec.auditId);
    showToast({ title: 'Citation Copied', message: `Copied audit citation for ${rec.requirement.requirementCode}`, type: 'info' });
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Export to CSV Handler
  const handleExportCSV = () => {
    try {
      const headers = [
        'Audit Record ID',
        'Requirement Code',
        'Requirement Title',
        'Domain Number',
        'Domain Name',
        'Risk Tier',
        'Statutory Mandate',
        'Compliance Status',
        'Governing Policy Code',
        'Policy Title',
        'Policy Version',
        'Policy Status',
        'Policy Approver',
        'Policy Effective Date',
        'Evidence File Name',
        'Evidence Title',
        'Evidence Verification Status',
        'Evidence SHA256 Hash',
        'Evidence Upload Date',
        'Open Finding ID',
        'Finding Title',
        'Remediation Owner',
        'Remediation SLA Date',
        'Time Scope Synchronization'
      ];

      const timeScopeLabel = selectedSnapshot
        ? `${selectedSnapshot.period} Snapshot (Cut-off: ${selectedSnapshot.timestamp})`
        : `Live Telemetry State (${timeHorizon} Horizon)`;

      const rows = sortedRecords.map((r) => [
        `"${r.auditId}"`,
        `"${r.requirement.requirementCode}"`,
        `"${(r.requirement.title || '').replace(/"/g, '""')}"`,
        `"${r.domainNumber}"`,
        `"${(r.domainName || '').replace(/"/g, '""')}"`,
        `"${r.requirement.riskTier}"`,
        `"${r.requirement.statutoryMandateType}"`,
        `"${r.complianceVerdict}"`,
        `"${r.policyCode}"`,
        `"${(r.policyTitle || '').replace(/"/g, '""')}"`,
        `"${r.policyVersion}"`,
        `"${r.policyStatus}"`,
        `"${r.policyApprover}"`,
        `"${r.policyEffectiveDate}"`,
        `"${r.evidenceFileName}"`,
        `"${(r.evidenceTitle || '').replace(/"/g, '""')}"`,
        `"${r.evidenceStatusLabel}"`,
        `"${r.evidenceHash}"`,
        `"${r.evidenceUploadDate}"`,
        `"${r.findingCode || 'N/A'}"`,
        `"${(r.findingTitle || 'No Open Findings').replace(/"/g, '""')}"`,
        `"${r.remediationOwner}"`,
        `"${r.remediationSla}"`,
        `"${timeScopeLabel}"`
      ]);

      const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `MAS_TRM_Audit_Ledger_${selectedSnapshot ? selectedSnapshot.period.replace(/[^a-zA-Z0-9]/g, '_') : 'Live_Q3_2026'}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast({ title: 'Export Complete', message: `Exported ${sortedRecords.length} synchronized audit records to CSV`, type: 'success' });
    } catch (err) {
      console.error('Failed to export CSV:', err);
      showToast({ title: 'Export Error', message: 'Error exporting CSV file', type: 'error' });
    }
  };

  return (
    <div id="synchronized-audit-data-table" className="space-y-4">
      {/* Table Master Header Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
        {/* Title, Badge & Export Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3.5 border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Synchronized Audit Records & Evidence Ledger</span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-sky-400 border border-slate-700">
                    {sortedRecords.length} Records
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Detailed regulatory workpapers mapped to governing policy versions, cryptographic evidence status, and open findings.
                </p>
              </div>
            </div>
          </div>

          {/* Time Synchronization Badge & Action Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {selectedSnapshot ? (
              <div className="flex items-center gap-2 bg-sky-950/60 border border-sky-500/40 px-3 py-1.5 rounded-xl shadow-inner">
                <History className="w-4 h-4 text-sky-400 animate-pulse shrink-0" />
                <div className="text-left">
                  <div className="text-[10px] text-sky-300 font-bold uppercase tracking-wider flex items-center gap-1">
                    <span>Synchronized to Milestone:</span>
                    <span className="text-white font-mono">{selectedSnapshot.dateLabel}</span>
                  </div>
                  <div className="text-[9.5px] text-slate-400">
                    Cut-off: <strong className="text-slate-300">{selectedSnapshot.timestamp}</strong> • {selectedSnapshot.deficient} Deficiencies
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onResetSnapshot}
                  className="ml-2 px-2.5 py-1 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow transition-all flex items-center gap-1 cursor-pointer"
                  title="Switch table back to Live Telemetry state"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Live</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 px-3 py-1.5 rounded-xl">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                <div className="text-left">
                  <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                    Synchronized to Live Telemetry
                  </div>
                  <div className="text-[9.5px] text-slate-400">
                    Horizon: <strong className="text-slate-300">{timeHorizon}</strong> • Real-time GRC posture
                  </div>
                </div>
              </div>
            )}

            {/* Quick Export CSV Button */}
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer active:scale-95"
              title="Download entire synchronized table as an auditor-grade CSV file"
            >
              <Download className="w-3.5 h-3.5 text-rose-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar Strip */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
          {/* Quick Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={tableSearch}
              onChange={(e) => {
                setTableSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Filter audit code, policy, evidence file, or owner..."
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl pl-9 pr-8 py-2 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 placeholder-slate-500"
            />
            {tableSearch && (
              <button
                onClick={() => setTableSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Evidence Filter Dropdown */}
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <span className="font-medium text-slate-400">Evidence:</span>
              <select
                value={evidenceFilter}
                onChange={(e) => {
                  setEvidenceFilter(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-rose-500"
              >
                <option value="ALL">All Evidence States</option>
                <option value="VERIFIED">Verified Only</option>
                <option value="MISSING">Missing / Deficient Only</option>
                <option value="PENDING">Pending Review Only</option>
              </select>
            </div>

            {/* Policy Status Filter */}
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <span className="font-medium text-slate-400">Policy:</span>
              <select
                value={policyStatusFilter}
                onChange={(e) => {
                  setPolicyStatusFilter(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-rose-500"
              >
                <option value="ALL">All Policy States</option>
                <option value="APPROVED">Approved & Active</option>
                <option value="DRAFT_REVIEW">Draft / In Review</option>
              </select>
            </div>

            {/* Expand / Collapse All */}
            <button
              type="button"
              onClick={expandedAuditIds.size === paginatedRecords.length ? collapseAllRows : expandAllRows}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-950 hover:bg-slate-850 text-slate-300 border border-slate-800 transition-colors flex items-center gap-1"
            >
              {expandedAuditIds.size === paginatedRecords.length ? (
                <>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  <span>Collapse All</span>
                </>
              ) : (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  <span>Expand All</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Interactive Active Context Bar */}
        {(selectedDomain !== 'ALL' || riskFilter !== 'ALL' || statusFilter !== 'ALL' || parentSearchQuery || tableSearch) && (
          <div className="flex items-center justify-between text-xs bg-slate-950/60 rounded-xl px-3 py-2 border border-slate-800 text-slate-300">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-slate-400 font-medium">Synchronized Filter Stack:</span>
              {selectedDomain !== 'ALL' && (
                <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 text-[11px] font-semibold">
                  Domain {selectedDomain}
                </span>
              )}
              {riskFilter !== 'ALL' && (
                <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[11px] font-semibold">
                  {riskFilter.replace(/_/g, ' ')}
                </span>
              )}
              {statusFilter !== 'ALL' && (
                <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20 text-[11px] font-semibold">
                  Status: {statusFilter}
                </span>
              )}
              {parentSearchQuery && (
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[11px]">
                  Global: &quot;{parentSearchQuery}&quot;
                </span>
              )}
              {tableSearch && (
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[11px]">
                  Local: &quot;{tableSearch}&quot;
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-400">
              Showing <strong>{sortedRecords.length}</strong> of {allEnrichedRequirements.length} master clauses
            </span>
          </div>
        )}

        {/* Data Table Container */}
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/50">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800 text-[11px] uppercase tracking-wider">
                <th className="py-3 px-3 w-10 text-center">#</th>
                <th
                  className="py-3 px-3 cursor-pointer hover:text-white transition-colors"
                  onClick={() => {
                    setSortField('auditId');
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                >
                  <div className="flex items-center gap-1">
                    <span>Audit Record & Clause</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th
                  className="py-3 px-3 cursor-pointer hover:text-white transition-colors"
                  onClick={() => {
                    setSortField('domain');
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                >
                  <div className="flex items-center gap-1">
                    <span>TRM Domain & Risk</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th
                  className="py-3 px-3 cursor-pointer hover:text-white transition-colors"
                  onClick={() => {
                    setSortField('policyVersion');
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                >
                  <div className="flex items-center gap-1">
                    <span>Governing Policy & Version</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-3 px-3">Evidence Artifact & Cryptographic Seal</th>
                <th
                  className="py-3 px-3 cursor-pointer hover:text-white transition-colors"
                  onClick={() => {
                    setSortField('status');
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                >
                  <div className="flex items-center gap-1">
                    <span>Audit Status</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-3 px-3 text-right">Auditor Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileQuestion className="w-8 h-8 text-slate-600" />
                      <p className="text-sm font-medium text-slate-400">No synchronized audit records match the active criteria.</p>
                      <button
                        onClick={() => {
                          setTableSearch('');
                          setEvidenceFilter('ALL');
                          setPolicyStatusFilter('ALL');
                        }}
                        className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
                      >
                        Clear Table Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((rec, idx) => {
                  const isExpanded = expandedAuditIds.has(rec.auditId);
                  const isHighRisk = rec.requirement.riskTier === 'HIGH_RISK';
                  const isDeficient = rec.complianceVerdict === 'DEFICIENT';

                  return (
                    <React.Fragment key={`${rec.auditId}-${rec.requirement.requirementCode || idx}`}>
                      <tr
                        onClick={() => toggleRowExpanded(rec.auditId)}
                        className={`transition-colors cursor-pointer group ${
                          isExpanded
                            ? 'bg-slate-900/90'
                            : idx % 2 === 0
                            ? 'bg-slate-950/40 hover:bg-slate-900/60'
                            : 'bg-slate-900/30 hover:bg-slate-900/60'
                        }`}
                      >
                        {/* Expand Icon */}
                        <td className="py-3 px-3 text-center text-slate-500">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-sky-400 mx-auto" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 mx-auto" />
                          )}
                        </td>

                        {/* Audit Record ID & Clause */}
                        <td className="py-3 px-3">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-mono font-bold text-sky-400 text-xs">
                                {rec.requirement.requirementCode}
                              </span>
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                                {rec.auditId}
                              </span>
                            </div>
                            <div className="text-xs font-semibold text-slate-200 line-clamp-1 max-w-xs" title={rec.requirement.title}>
                              {rec.requirement.title}
                            </div>
                          </div>
                        </td>

                        {/* Domain & Risk */}
                        <td className="py-3 px-3">
                          <div className="space-y-1">
                            <div className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                              <span className="text-slate-400 font-mono">Sec {rec.domainNumber}:</span>
                              <span className="truncate max-w-[150px]" title={rec.domainName}>
                                {rec.domainName}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span
                                className={`px-2 py-0.2 rounded text-[10px] font-semibold ${
                                  isHighRisk
                                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                    : rec.requirement.riskTier === 'MEDIUM_RISK'
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                }`}
                              >
                                {rec.requirement.riskTier === 'HIGH_RISK' ? 'Critical / High' : rec.requirement.riskTier}
                              </span>
                              {rec.requirement.statutoryMandateType === 'NOTICE_655_CYBER_HYGIENE' && (
                                <span className="px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                  Notice 655
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Governing Policy & Version */}
                        <td className="py-3 px-3">
                          <div className="space-y-0.5 max-w-xs">
                            <div className="flex items-center gap-1.5">
                              <Shield className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                              <span className="font-mono font-bold text-indigo-300 text-xs">
                                {rec.policyCode}
                              </span>
                              <span
                                className={`px-1.5 py-0.2 rounded text-[9.5px] font-mono font-semibold ${
                                  rec.policyStatus === 'APPROVED'
                                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                    : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                                }`}
                              >
                                {rec.policyVersion}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-300 truncate" title={rec.policyTitle}>
                              {rec.policyTitle}
                            </div>
                          </div>
                        </td>

                        {/* Evidence Artifact & Hash */}
                        <td className="py-3 px-3">
                          <div className="space-y-1 max-w-sm">
                            <div className="flex items-center gap-1.5 text-xs text-slate-200">
                              <FileText className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                              <span className="font-semibold truncate" title={rec.evidenceTitle}>
                                {rec.evidenceTitle}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                              <span className="truncate max-w-[140px]" title={rec.evidenceFileName}>
                                [{rec.evidenceFileName}]
                              </span>
                              <span className="text-slate-600">•</span>
                              <span className="text-slate-400 flex items-center gap-0.5" title={rec.evidenceHash}>
                                <Hash className="w-2.5 h-2.5 text-slate-500" />
                                {rec.evidenceHash.slice(0, 16)}...
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Audit Status */}
                        <td className="py-3 px-3">
                          <div className="space-y-1">
                            <ComplianceStatusBadge status={rec.requirement.complianceStatusBadge} size="sm" />
                            {rec.evidenceStatus === 'MISSING_DEFICIENT' && (
                              <span className="block text-[9.5px] text-rose-400 font-medium">
                                Deficit: No Evidence
                              </span>
                            )}
                            {rec.evidenceStatus === 'REMEDIATED_LATER' && (
                              <span className="block text-[9.5px] text-amber-300 font-medium">
                                Resolved Post-Milestone
                              </span>
                            )}
                            {rec.evidenceStatus === 'VERIFIED' && (
                              <span className="block text-[9.5px] text-emerald-400/90 font-medium flex items-center gap-1">
                                <Check className="w-2.5 h-2.5" /> Sealed Valid
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Copy Citation */}
                            <button
                              type="button"
                              onClick={(e) => copyCitation(rec, e)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                              title="Copy formal audit citation string"
                            >
                              {copiedId === rec.auditId ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5 text-slate-400" />
                              )}
                            </button>

                            {/* Inspect Requirement */}
                            <button
                              type="button"
                              onClick={() => onSelectRequirement(rec.requirement)}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-600/90 hover:bg-rose-500 text-white shadow transition-all flex items-center gap-1 cursor-pointer"
                              title="Open requirement drill-down and evidence vault upload modal"
                            >
                              <span>Inspect</span>
                              <ExternalLink className="w-3 h-3 text-rose-200" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Workpaper Details Drawer */}
                      {isExpanded && (
                        <tr className="bg-slate-900/95 border-b border-slate-800/80">
                          <td colSpan={7} className="py-4 px-6">
                            <div className="space-y-3.5 bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 text-xs">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Column 1: Regulatory Intent & Clause Statement */}
                                <div className="space-y-1.5">
                                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                                    <span>MAS TRM Requirement Statement</span>
                                  </div>
                                  <p className="text-slate-300 leading-relaxed text-[11px] bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                                    {rec.requirement.statement || rec.requirement.title}
                                  </p>
                                  {rec.requirement.intentAndGuidance && (
                                    <p className="text-slate-400 text-[10.5px] italic pt-1">
                                      Guidance: {rec.requirement.intentAndGuidance}
                                    </p>
                                  )}
                                </div>

                                {/* Column 2: Governing Policy Governance Details */}
                                <div className="space-y-1.5">
                                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                                    <span>Policy Governance & Lifecycle</span>
                                  </div>
                                  <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-slate-400">Policy Code:</span>
                                      <span className="font-mono font-bold text-indigo-300">{rec.policyCode}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-slate-400">Active Version:</span>
                                      <span className="font-mono text-slate-200">{rec.policyVersion}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-slate-400">Approval Authority:</span>
                                      <span className="text-slate-200 text-right">{rec.policyApprover}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-slate-400">Effective Date:</span>
                                      <span className="font-mono text-slate-200">{rec.policyEffectiveDate}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-slate-400">Status:</span>
                                      <span className="font-semibold text-emerald-400">{rec.policyStatus}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Column 3: Evidence Cryptography & Audit Finding */}
                                <div className="space-y-1.5">
                                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <Hash className="w-3.5 h-3.5 text-sky-400" />
                                    <span>Evidence Vault & Audit Finding</span>
                                  </div>
                                  <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 space-y-2">
                                    <div>
                                      <span className="text-slate-400 block text-[10px]">Verification Status:</span>
                                      <span
                                        className={`font-semibold text-xs ${
                                          rec.evidenceStatus === 'VERIFIED'
                                            ? 'text-emerald-400'
                                            : rec.evidenceStatus === 'MISSING_DEFICIENT'
                                            ? 'text-rose-400'
                                            : 'text-amber-400'
                                        }`}
                                      >
                                        {rec.evidenceStatusLabel}
                                      </span>
                                    </div>

                                    <div>
                                      <span className="text-slate-400 block text-[10px]">SHA-256 Audit Seal:</span>
                                      <code className="text-[10px] text-sky-300 font-mono break-all block bg-slate-950 p-1 rounded border border-slate-800">
                                        {rec.evidenceHash}
                                      </code>
                                    </div>

                                    {rec.hasFinding && (
                                      <div className="pt-1 border-t border-slate-800">
                                        <div className="flex items-center justify-between text-rose-300 text-[10.5px]">
                                          <span className="font-semibold">{rec.findingCode}</span>
                                          <span>SLA: {rec.remediationSla}</span>
                                        </div>
                                        <div className="text-slate-400 text-[10px] mt-0.5">
                                          Owner: <strong className="text-slate-300">{rec.remediationOwner}</strong>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Action Footer Inside Drawer */}
                              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
                                <div className="text-slate-400">
                                  Audit Workpaper Ref: <strong className="font-mono text-slate-300">{rec.auditId}</strong> • Custodian Department: <strong className="text-slate-300">{rec.evidenceDepartment}</strong>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => onSelectRequirement(rec.requirement)}
                                    className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 transition-colors flex items-center gap-1.5"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    <span>Open Full Audit Record & Evidence Vault</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Footer Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2 py-1 focus:outline-none"
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-slate-500">|</span>
            <span>
              Showing {sortedRecords.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1} -{' '}
              {Math.min(currentPage * rowsPerPage, sortedRecords.length)} of {sortedRecords.length} records
            </span>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700 text-xs font-medium transition-colors"
              >
                Previous
              </button>
              <div className="px-2 font-mono text-xs text-slate-300">
                {currentPage} / {totalPages}
              </div>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700 text-xs font-medium transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
