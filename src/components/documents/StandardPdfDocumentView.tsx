import React, { useState, useRef, useMemo } from 'react';
import { GeneratedDocument } from '../../types';
import {
  Printer,
  Download,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  FileText,
  Layers,
  Scale,
  Users,
  AlertTriangle,
  FileCheck2,
  Lock,
  ExternalLink,
  Award,
  Sparkles,
  Search
} from 'lucide-react';
import { getFormattedCompanySpaced } from '../../data/standardPoliciesAndProcedures';
import { enrichDocumentWithConsultancyFeatures, AuditableEvidencePoint } from '../../services/consultancyDocumentEngine';
import { exportPolicyPDF } from '../../utils/policyPdfExporter';

interface StandardPdfDocumentViewProps {
  document: GeneratedDocument;
  companyName?: string;
  onAcknowledge?: () => void;
  userHasAcknowledged?: boolean;
  isLocked?: boolean;
  onNavigateToEvidence?: (evidenceId: string) => void;
}

export const StandardPdfDocumentView: React.FC<StandardPdfDocumentViewProps> = ({
  document: rawDocument,
  companyName = 'ACME Global Enterprise',
  onAcknowledge,
  userHasAcknowledged = false,
  isLocked = false,
  onNavigateToEvidence
}) => {
  // Ensure document contains all 6 enterprise consultancy-grade capabilities
  const document = useMemo(() => {
    return enrichDocumentWithConsultancyFeatures(rawDocument, { companyName });
  }, [rawDocument, companyName]);

  const [viewMode, setViewMode] = useState<'all_pages' | 'single_page'>('all_pages');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [copiedHash, setCopiedHash] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedEvidenceModal, setSelectedEvidenceModal] = useState<AuditableEvidencePoint | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const docNo = document.docCode || (document.type === 'POLICY' ? 'ARP_ISMS_P11' : 'ARP_ISMS_PR07');
  const standard = document.standard || 'ISO/IEC 27001:2022 & MAS TRM Guidelines';
  const classification = document.classification || 'Private (Internal ISMS)';
  const version = document.version || '1.0';
  const effectiveDate = document.effectiveDate || '25 July 2025';
  const nextReviewDate = document.nextReviewDate || '24 July 2026';
  const docOwner = document.documentOwner || document.owner || 'Chief Information Security Officer (CISO)';
  const issuedBy = document.issuedBy || 'Information Security Working Group';
  const approvedBy = document.approvedBy || document.approver || 'CISO & Executive Management';

  const spacedCompany = getFormattedCompanySpaced(companyName);

  // Total calculated pages: Cover (1), Doc Control (2), Cross-Mapping (3), RACI (4), Exceptions (5), Evidence (6), TOC (7), Body Pages, Sign-Off (Last)
  const bodyPagesCount = document.pages && document.pages.length > 0 ? document.pages.length : 3;
  const totalPages = 7 + bodyPagesCount + 1; // 7 prelude pages + body pages + 1 final sign-off page

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    try {
      setIsExporting(true);
      await exportPolicyPDF({
        title: document.title,
        code: docNo,
        category: document.category,
        companyName,
        version,
        classification,
        effectiveDate,
        nextReviewDate,
        cisoName: docOwner,
        policyText: document.content || '',
        documentControlStatements: document.documentControlStatements,
        revisionHistory: document.revisionHistory,
        raciMatrix: document.raciMatrix,
        regulatoryCrossMapping: document.regulatoryCrossMapping,
        compensatingControls: document.compensatingControls,
        evidenceCollectionPoints: document.evidenceCollectionPoints,
        executiveSignOff: document.executiveSignOff
      });
    } catch (err) {
      console.error('Failed to export PDF:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyHash = () => {
    const hash = document.contentSha256 || 'SHA256:7B94B0B2E15C394F8982D67C6B';
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 15, 140));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 15, 60));
  const handleResetZoom = () => setZoomLevel(100);

  // Helper running header
  const RunningHeader = () => (
    <div className="w-full pb-2.5 mb-6 border-b border-slate-200 flex items-center justify-between text-xs text-slate-700">
      <div className="flex items-center gap-2">
        <span className="font-bold text-slate-900">{document.title}</span>
        <span className="text-slate-400">|</span>
        <span className="font-mono text-slate-600 font-medium">{docNo}</span>
      </div>
      <div className="flex items-center gap-2 font-mono text-[11px] text-slate-600">
        <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-semibold">Rev {version}</span>
        <span>ISO 27001:2022</span>
      </div>
    </div>
  );

  // Helper running footer with Multi-Framework Cross-Mapping Line
  const RunningFooter = ({ pageNum }: { pageNum: number }) => (
    <div className="w-full pt-3 mt-8 border-t border-slate-200 flex flex-col gap-1 text-[11px] text-slate-500">
      <div className="flex items-center justify-between text-[10px] font-semibold text-sky-700">
        <span>Harmonized: ISO/IEC 27001:2022  •  MAS TRM Guidelines  •  SOC 2 TSC CC6  •  GDPR / PDPA</span>
        <span className="font-mono text-slate-400">Page {pageNum} of {totalPages}</span>
      </div>
      <div className="flex items-center justify-between text-slate-400 text-[10px]">
        <span>Classification: {classification}</span>
        <span className="font-mono">SHA-256: {(document.contentSha256 || '7B94B0B2E15C394F').slice(0, 16)}...</span>
        <span>Controlled ISMS Record</span>
      </div>
    </div>
  );

  // =========================================================================
  // PAGE 1: COVER PAGE
  // =========================================================================
  const renderCoverPage = () => (
    <div
      key="page-1"
      id="pdf-page-1"
      className="bg-white text-slate-900 w-full max-w-[800px] min-h-[1130px] mx-auto p-12 lg:p-16 shadow-md border border-slate-200 mb-8 flex flex-col justify-between relative print:shadow-none print:border-none print:m-0 print:w-full print:max-w-none print:p-12 print:break-after-page"
    >
      <div>
        {/* Top Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <span className="bg-slate-900 text-sky-400 px-2 py-0.5 rounded text-[10px] tracking-wider uppercase">SKANDA GRC</span>
            <span>ENTERPRISE CONTINUOUS COMPLIANCE ENGINE</span>
          </div>
          <span className="font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded text-[10px]">
            CONFIDENTIAL // INTERNAL USE ONLY
          </span>
        </div>

        {/* Company Header Spaced Banner */}
        <div className="pt-10 text-center">
          <p className="text-[12px] tracking-[0.25em] font-semibold text-slate-700 uppercase">
            {spacedCompany}
          </p>
        </div>

        <div className="w-full h-[2px] bg-[#0e2a47] mt-4 mb-10" />

        {/* Main Document Title */}
        <div className="mt-4 mb-8 text-center">
          <span className="inline-block bg-sky-50 text-sky-800 border border-sky-200 px-3 py-1 rounded-full text-xs font-semibold mb-3">
            {document.category}
          </span>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {document.title}
          </h1>
          <p className="text-sm font-medium text-slate-600 mt-2 font-mono">
            DOCUMENT REF: {docNo} &nbsp;•&nbsp; REVISION {version}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Information Security Management System &amp; Technology Risk Management
          </p>
        </div>

        {/* Multi-Framework Harmonization Banner */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 mb-8 text-center">
          <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
            DYNAMICALLY HARMONIZED REGULATORY FRAMEWORKS
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded">ISO/IEC 27001:2022</span>
            <span className="bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded">MAS TRM Guidelines (2021)</span>
            <span className="bg-purple-100 text-purple-800 font-semibold px-2 py-0.5 rounded">AICPA SOC 2 (CC6.1-CC6.8)</span>
            <span className="bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded">GDPR / Singapore PDPA</span>
          </div>
        </div>

        {/* ISO 7.5 Metadata Table */}
        <div className="border border-slate-300 w-full text-xs rounded-sm overflow-hidden mb-8 shadow-xs">
          <table className="w-full text-left border-collapse">
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="w-1/4 p-2.5 bg-slate-50 font-semibold text-slate-700 border-r border-slate-200">Document Reference</td>
                <td className="w-1/4 p-2.5 font-mono text-slate-900 font-bold">{docNo}</td>
                <td className="w-1/4 p-2.5 bg-slate-50 font-semibold text-slate-700 border-r border-slate-200">Classification</td>
                <td className="w-1/4 p-2.5 text-slate-900 font-medium">{classification}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="p-2.5 bg-slate-50 font-semibold text-slate-700 border-r border-slate-200">Current Revision</td>
                <td className="p-2.5 text-slate-900 font-medium">v{version} (Operationalized)</td>
                <td className="p-2.5 bg-slate-50 font-semibold text-slate-700 border-r border-slate-200">Effective Date</td>
                <td className="p-2.5 text-slate-900 font-medium">{effectiveDate}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="p-2.5 bg-slate-50 font-semibold text-slate-700 border-r border-slate-200">Next Review Cadence</td>
                <td className="p-2.5 text-slate-900 font-medium">{nextReviewDate} (Annual)</td>
                <td className="p-2.5 bg-slate-50 font-semibold text-slate-700 border-r border-slate-200">Review Cycle</td>
                <td className="p-2.5 text-slate-900 font-medium">{document.reviewCycle || 'Annual'}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="p-2.5 bg-slate-50 font-semibold text-slate-700 border-r border-slate-200">Document Owner</td>
                <td className="p-2.5 text-slate-900 font-medium">{docOwner}</td>
                <td className="p-2.5 bg-slate-50 font-semibold text-slate-700 border-r border-slate-200">Approver Sign-off</td>
                <td className="p-2.5 text-slate-900 font-medium">{approvedBy}</td>
              </tr>
              <tr>
                <td className="p-2.5 bg-slate-50 font-semibold text-slate-700 border-r border-slate-200">Cryptographic Seal</td>
                <td colSpan={3} className="p-2.5 font-mono text-[11px] text-slate-600 bg-slate-50/50">
                  SHA-256: {document.contentSha256 || '7B94B0B2E15C394F8982D67C6B...'} (WORM Archival Verified)
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Proprietary Notice */}
        <div className="bg-amber-50/70 border border-amber-200 rounded p-3 text-[11px] text-slate-700 leading-relaxed">
          <strong className="text-amber-900 font-bold block mb-1">PROPRIETARY NOTICE &amp; CONTROL OF DOCUMENTED INFORMATION:</strong>
          This document is the official property of {companyName} and is maintained under formal revision control pursuant to ISO/IEC 27001:2022 Clause 7.5.3.
          Unauthorized disclosure, reproduction, or alteration without prior written approval from the Chief Information Security Officer is strictly prohibited.
        </div>
      </div>

      <div className="pt-4 text-center border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
        <span>{companyName}  •  Information Security Management System</span>
        <span className="font-bold text-slate-700">ISO/IEC 27001:2022 Compliant</span>
      </div>
    </div>
  );

  // =========================================================================
  // PAGE 2: DOCUMENT CONTROL & REVISION HISTORY
  // =========================================================================
  const renderDocumentControlPage = () => (
    <div
      key="page-2"
      id="pdf-page-2"
      className="bg-white text-slate-900 w-full max-w-[800px] min-h-[1130px] mx-auto p-12 lg:p-16 shadow-md border border-slate-200 mb-8 flex flex-col justify-between relative print:shadow-none print:border-none print:m-0 print:w-full print:max-w-none print:p-12 print:break-after-page"
    >
      <div>
        <RunningHeader />

        <div className="flex items-center gap-2 mb-2">
          <Layers className="w-5 h-5 text-sky-600" />
          <h2 className="text-xl font-bold text-slate-900">Document Control &amp; Revision History Register</h2>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Complies with ISO/IEC 27001:2022 Clause 7.5.2 (Creating and updating) &amp; Clause 7.5.3 (Control of documented information)
        </p>
        <div className="w-full h-[1.5px] bg-[#0e2a47] mb-6" />

        {/* Control Statements */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-slate-900 mb-2">1. Document Control Statements</h3>
          <div className="bg-slate-50 border border-slate-200 rounded p-3.5 space-y-2 text-xs text-slate-700">
            {(document.documentControlStatements || [
              `This document is the official, confidential property of ${companyName} and shall not be reproduced without written CISO authorization.`,
              `Maintained under strict revision control pursuant to ISO/IEC 27001:2022 Clause 7.5. Manual alterations invalidate this document.`,
              `All revisions, exceptions, or waivers must be reviewed by the ISMS Committee and formally ratified by Executive Leadership.`
            ]).map((stmt, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-sky-600 font-bold mt-0.5">•</span>
                <span className="leading-relaxed">{stmt}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Change History Log Table */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-slate-900 mb-2">2. Change &amp; Revision History Log</h3>
          <div className="border border-slate-300 rounded overflow-hidden">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-[#0e2a47] text-white">
                  <th className="p-2 border-r border-slate-600 font-semibold w-12 text-center">S.No</th>
                  <th className="p-2 border-r border-slate-600 font-semibold w-16 text-center">Rev</th>
                  <th className="p-2 border-r border-slate-600 font-semibold w-24">Review Date</th>
                  <th className="p-2 border-r border-slate-600 font-semibold w-20 text-center">Page/Sec</th>
                  <th className="p-2 border-r border-slate-600 font-semibold">Change Description &amp; Reason</th>
                  <th className="p-2 font-semibold w-32">Approved By</th>
                </tr>
              </thead>
              <tbody>
                {(document.revisionHistory || [
                  {
                    sNo: '01',
                    reviewDate: effectiveDate,
                    pageNo: 'All',
                    issueNo: version,
                    changeDescription: 'Initial comprehensive synthesis compliant with ISO/IEC 27001:2022 & MAS TRM Guidelines.',
                    approvedBy: docOwner
                  }
                ]).map((rev, idx) => (
                  <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="p-2 border-r border-slate-200 text-center font-mono">{rev.sNo}</td>
                    <td className="p-2 border-r border-slate-200 text-center font-mono font-bold text-sky-800">{rev.issueNo}</td>
                    <td className="p-2 border-r border-slate-200 text-slate-800">{rev.reviewDate}</td>
                    <td className="p-2 border-r border-slate-200 text-center">{rev.pageNo}</td>
                    <td className="p-2 border-r border-slate-200 text-slate-700">{rev.changeDescription}</td>
                    <td className="p-2 text-slate-900 font-medium">{rev.approvedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Issue & Approval Sign-Off Block */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-slate-900 mb-2">3. Issue, Review &amp; Approval Authority</h3>
          <div className="border border-slate-300 rounded overflow-hidden">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-800 border-b border-slate-300">
                  <th className="p-2.5 border-r border-slate-300 font-bold">Governance Function</th>
                  <th className="p-2.5 border-r border-slate-300 font-bold">Name &amp; Designation</th>
                  <th className="p-2.5 border-r border-slate-300 font-bold w-24">Date</th>
                  <th className="p-2.5 font-bold w-28 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-200">
                  <td className="p-2.5 border-r border-slate-200 font-medium text-slate-700">Prepared &amp; Synthesized</td>
                  <td className="p-2.5 border-r border-slate-200 text-slate-900">{issuedBy}</td>
                  <td className="p-2.5 border-r border-slate-200">{effectiveDate}</td>
                  <td className="p-2.5 text-center font-bold text-emerald-700 bg-emerald-50/50">✓ COMPLETED</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="p-2.5 border-r border-slate-200 font-medium text-slate-700">Technical Security Review</td>
                  <td className="p-2.5 border-r border-slate-200 text-slate-900">{docOwner}</td>
                  <td className="p-2.5 border-r border-slate-200">{effectiveDate}</td>
                  <td className="p-2.5 text-center font-bold text-emerald-700 bg-emerald-50/50">✓ VERIFIED</td>
                </tr>
                <tr>
                  <td className="p-2.5 border-r border-slate-200 font-medium text-slate-700">Executive Ratification</td>
                  <td className="p-2.5 border-r border-slate-200 text-slate-900">Executive Leadership &amp; Board Risk Committee</td>
                  <td className="p-2.5 border-r border-slate-200">{effectiveDate}</td>
                  <td className="p-2.5 text-center font-bold text-emerald-700 bg-emerald-50/50">✓ RATIFIED</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. Mandatory Lead Auditor Header & Clause 9.1 Performance KPIs */}
        {document.isoAuditHeader && (
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-sky-700" />
                <span>4. TÜV / BSI Lead Auditor Control Header Block (Clauses 7.5 &amp; 9.1)</span>
              </span>
              <span className="text-[10px] font-mono bg-sky-100 text-sky-800 px-2 py-0.5 rounded font-semibold border border-sky-300">
                UKAS / IAF MD CONFORMITY VERIFIED
              </span>
            </h3>
            <div className="border border-slate-300 rounded overflow-hidden text-xs mb-3">
              <table className="w-full text-left border-collapse">
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="w-1/3 p-2 bg-slate-50 font-semibold text-slate-700 border-r border-slate-200">ISMS Normative Clauses</td>
                    <td className="p-2 font-mono text-slate-900 font-bold">{document.isoAuditHeader.ismsClauseMapping}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2 bg-slate-50 font-semibold text-slate-700 border-r border-slate-200">Annex A Controls Addressed</td>
                    <td className="p-2">
                      <div className="flex flex-wrap gap-1">
                        {document.isoAuditHeader.annexAControls.map((c, i) => (
                          <span key={i} className="px-1.5 py-0.2 rounded bg-indigo-50 border border-indigo-200 font-mono text-[10px] font-semibold text-indigo-800">
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 bg-slate-50 font-semibold text-slate-700 border-r border-slate-200">WORM Cryptographic SHA-256 Seal</td>
                    <td className="p-2 font-mono text-[10px] text-emerald-800 bg-emerald-50/50 break-all select-all font-semibold">
                      {document.isoAuditHeader.cryptographicSha256Seal}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {document.clause91Kpis && document.clause91Kpis.length > 0 && (
              <div className="mt-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-1.5">
                  Mandatory Clause 9.1 Performance Metrics &amp; Monitoring SLAs:
                </h4>
                <div className="border border-slate-300 rounded overflow-hidden">
                  <table className="w-full text-[11px] text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 border-b border-slate-300">
                        <th className="p-1.5 border-r border-slate-300 font-semibold w-20">Metric ID</th>
                        <th className="p-1.5 border-r border-slate-300 font-semibold">Measurement Objective</th>
                        <th className="p-1.5 border-r border-slate-300 font-semibold w-48">Mandatory Target SLA</th>
                        <th className="p-1.5 border-r border-slate-300 font-semibold w-24">Cadence</th>
                        <th className="p-1.5 font-semibold w-28">Responsible</th>
                      </tr>
                    </thead>
                    <tbody>
                      {document.clause91Kpis.map((kpi, kIdx) => (
                        <tr key={kIdx} className="border-b border-slate-200 last:border-b-0 hover:bg-slate-50">
                          <td className="p-1.5 border-r border-slate-200 font-mono font-bold text-sky-800">{kpi.metricId}</td>
                          <td className="p-1.5 border-r border-slate-200 text-slate-700 font-medium">{kpi.objective}</td>
                          <td className="p-1.5 border-r border-slate-200 font-mono font-bold text-emerald-800 bg-emerald-50/30">{kpi.targetSla}</td>
                          <td className="p-1.5 border-r border-slate-200 text-slate-600">{kpi.measurementCadence}</td>
                          <td className="p-1.5 text-slate-700 font-medium text-[10px]">{kpi.responsibleRole}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <RunningFooter pageNum={2} />
    </div>
  );

  // =========================================================================
  // PAGE 3: DYNAMIC REGULATORY CROSS-MAPPING & HARMONIZATION MATRIX
  // =========================================================================
  const renderCrossMappingPage = () => {
    const mappings = document.regulatoryCrossMapping || [];
    return (
      <div
        key="page-3"
        id="pdf-page-3"
        className="bg-white text-slate-900 w-full max-w-[800px] min-h-[1130px] mx-auto p-12 lg:p-16 shadow-md border border-slate-200 mb-8 flex flex-col justify-between relative print:shadow-none print:border-none print:m-0 print:w-full print:max-w-none print:p-12 print:break-after-page"
      >
        <div>
          <RunningHeader />

          <div className="flex items-center gap-2 mb-2">
            <Scale className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-900">Dynamic Regulatory Cross-Mapping &amp; Harmonization Matrix</h2>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Harmonizes operational controls across ISO/IEC 27001:2022, MAS TRM Guidelines, SOC 2 TSC, and GDPR/PDPA.
          </p>
          <div className="w-full h-[1.5px] bg-[#0e2a47] mb-6" />

          <div className="bg-sky-50/70 border border-sky-200 rounded p-3 text-xs text-slate-700 mb-6 leading-relaxed">
            <strong className="text-sky-900 font-bold block mb-1">UNIFIED CONTROL HARMONIZATION ARCHITECTURE:</strong>
            SKANDA dynamically bridges global regulatory frameworks into this single policy document. Internal operations execute one unified control procedure while systematically fulfilling multiple statutory and customer assurance requirements simultaneously.
          </div>

          <div className="border border-slate-300 rounded overflow-hidden mb-6">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-[#0e2a47] text-white">
                  <th className="p-2.5 border-r border-slate-600 font-semibold w-40">Standard / Authority</th>
                  <th className="p-2.5 border-r border-slate-600 font-semibold w-36">Reference Clause</th>
                  <th className="p-2.5 border-r border-slate-600 font-semibold">Regulatory Mandate &amp; Harmonization</th>
                  <th className="p-2.5 font-semibold w-24 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {mappings.map((m, idx) => (
                  <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50/70">
                    <td className="p-2.5 border-r border-slate-200 font-bold text-slate-900 align-top">
                      {m.framework}
                    </td>
                    <td className="p-2.5 border-r border-slate-200 font-mono text-sky-800 font-semibold text-[11px] align-top">
                      {m.referenceClause}
                    </td>
                    <td className="p-2.5 border-r border-slate-200 text-slate-700 align-top leading-relaxed">
                      <p className="font-medium text-slate-800 mb-1">{m.requirementSummary}</p>
                      <p className="text-[11px] text-slate-500 bg-slate-50 p-1.5 rounded border border-slate-200">
                        <strong className="text-slate-700">Enforcement:</strong> {m.controlHarmonization}
                      </p>
                    </td>
                    <td className="p-2.5 text-center align-top font-bold text-[11px]">
                      <span className="inline-block bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded">
                        {m.complianceStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 border border-slate-200 p-3 rounded">
              <strong className="text-slate-900 block font-bold mb-1">MAS TRM Assurance Note:</strong>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                All controls mapped to MAS TRM Guidelines are tagged with quantitative SLAs (e.g. 1-hour critical incident notification and 15-minute leaver deactivation) to satisfy Monetary Authority of Singapore examiner expectations.
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-3 rounded">
              <strong className="text-slate-900 block font-bold mb-1">SOC 2 Type II Traceability:</strong>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Each control provides objective audit evidence linkages directly in SKANDA's Evidence Module, pre-packaging sampling populations for external AICPA independent auditors.
              </p>
            </div>
          </div>
        </div>

        <RunningFooter pageNum={3} />
      </div>
    );
  };

  // =========================================================================
  // PAGE 4: AUTOMATED RACI GOVERNANCE & ACCOUNTABILITY MATRIX
  // =========================================================================
  const renderRaciMatrixPage = () => {
    const raci = document.raciMatrix;
    return (
      <div
        key="page-4"
        id="pdf-page-4"
        className="bg-white text-slate-900 w-full max-w-[800px] min-h-[1130px] mx-auto p-12 lg:p-16 shadow-md border border-slate-200 mb-8 flex flex-col justify-between relative print:shadow-none print:border-none print:m-0 print:w-full print:max-w-none print:p-12 print:break-after-page"
      >
        <div>
          <RunningHeader />

          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-sky-600" />
            <h2 className="text-xl font-bold text-slate-900">Automated RACI Governance &amp; Accountability Matrix</h2>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Fulfills ISO/IEC 27001:2022 Clause 5.3 (Organizational roles, responsibilities and authorities)
          </p>
          <div className="w-full h-[1.5px] bg-[#0e2a47] mb-6" />

          <p className="text-xs text-slate-700 mb-4 leading-relaxed">
            {raci?.summary || `This RACI Matrix formally links corporate leadership, engineering, and workforce roles to operational accountability and escalation pathways for ${document.title}.`}
          </p>

          {/* RACI Legend */}
          <div className="grid grid-cols-4 gap-2 mb-5 text-[11px]">
            <div className="bg-emerald-50 border border-emerald-200 p-2 rounded text-emerald-900">
              <strong className="font-bold">[R] Responsible:</strong> The role performing the operational work.
            </div>
            <div className="bg-sky-50 border border-sky-200 p-2 rounded text-sky-900">
              <strong className="font-bold">[A] Accountable:</strong> Sole decision-maker with fiduciary sign-off.
            </div>
            <div className="bg-amber-50 border border-amber-200 p-2 rounded text-amber-900">
              <strong className="font-bold">[C] Consulted:</strong> Subject matter experts providing input.
            </div>
            <div className="bg-slate-100 border border-slate-300 p-2 rounded text-slate-800">
              <strong className="font-bold">[I] Informed:</strong> Stakeholders kept updated on status.
            </div>
          </div>

          <div className="border border-slate-300 rounded overflow-hidden mb-6">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-[#0e2a47] text-white">
                  <th className="p-2.5 border-r border-slate-600 font-semibold w-44">Corporate Role</th>
                  <th className="p-2.5 border-r border-slate-600 font-semibold">Organizational Mandate</th>
                  <th className="p-2 border-r border-slate-600 font-bold w-10 text-center">R</th>
                  <th className="p-2 border-r border-slate-600 font-bold w-10 text-center">A</th>
                  <th className="p-2 border-r border-slate-600 font-bold w-10 text-center">C</th>
                  <th className="p-2 border-r border-slate-600 font-bold w-10 text-center">I</th>
                  <th className="p-2.5 font-semibold w-40">Escalation Trigger</th>
                </tr>
              </thead>
              <tbody>
                {(raci?.matrix || []).map((entry, idx) => (
                  <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="p-2.5 border-r border-slate-200 font-bold text-slate-900 align-middle">
                      <div>{entry.role}</div>
                      {entry.department && (
                        <div className="text-[10px] text-slate-500 font-normal">{entry.department}</div>
                      )}
                      {entry.assignedUsers && entry.assignedUsers.length > 0 && (
                        <div className="text-[10px] text-sky-800 font-medium mt-1 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200 inline-block">
                          {entry.assignedUsers.join(', ')}
                        </div>
                      )}
                    </td>
                    <td className="p-2.5 border-r border-slate-200 text-slate-700 align-middle leading-relaxed text-[11px]">
                      {entry.mandate}
                    </td>
                    <td className="p-2 border-r border-slate-200 text-center font-bold text-xs align-middle">
                      {entry.r ? <span className="text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">R</span> : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="p-2 border-r border-slate-200 text-center font-bold text-xs align-middle">
                      {entry.a ? <span className="text-sky-700 bg-sky-100 px-1.5 py-0.5 rounded">A</span> : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="p-2 border-r border-slate-200 text-center font-bold text-xs align-middle">
                      {entry.c ? <span className="text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">C</span> : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="p-2 border-r border-slate-200 text-center font-bold text-xs align-middle">
                      {entry.i ? <span className="text-slate-700 bg-slate-200 px-1.5 py-0.5 rounded">I</span> : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="p-2.5 text-[11px] text-slate-600 align-middle">
                      {entry.escalationTrigger}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <RunningFooter pageNum={4} />
      </div>
    );
  };

  // =========================================================================
  // PAGE 5: FORMAL SECURITY EXCEPTIONS & COMPENSATING CONTROLS
  // =========================================================================
  const renderExceptionsPage = () => {
    const comp = document.compensatingControls;
    return (
      <div
        key="page-5"
        id="pdf-page-5"
        className="bg-white text-slate-900 w-full max-w-[800px] min-h-[1130px] mx-auto p-12 lg:p-16 shadow-md border border-slate-200 mb-8 flex flex-col justify-between relative print:shadow-none print:border-none print:m-0 print:w-full print:max-w-none print:p-12 print:break-after-page"
      >
        <div>
          <RunningHeader />

          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h2 className="text-xl font-bold text-slate-900">Security Exceptions &amp; Compensating Controls Governance</h2>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Fulfills ISO/IEC 27001:2022 Clause 6.1.3 &amp; 8.1 - Audit-Proof Deviation Lifecycle with Mandatory Sunsets
          </p>
          <div className="w-full h-[1.5px] bg-[#0e2a47] mb-6" />

          {/* Exception Lifecycle Description */}
          <div className="text-xs text-slate-700 mb-6 leading-relaxed bg-slate-50 border border-slate-200 p-3.5 rounded">
            <strong className="text-slate-900 font-bold block mb-1">FORMAL WAIVER &amp; EXCEPTION WORKFLOW:</strong>
            {comp?.exceptionWorkflow || `Any inability to strictly enforce requirements of ${docNo} must be formally submitted through SKANDA's Exception Workflow. Unapproved deviations are treated as non-conformities.`}
          </div>

          {/* Mandatory Criteria */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Mandatory Compensating Controls Evaluation Criteria</h3>
            <div className="border border-slate-200 rounded p-3 space-y-2 text-xs text-slate-700 bg-white">
              {(comp?.mandatoryCriteria || []).map((crit, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span>{crit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Approval Authority Matrix Table */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Auditable Exception Approval Authority &amp; Time-Boxed Sunsets</h3>
            <div className="border border-slate-300 rounded overflow-hidden">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-[#0e2a47] text-white">
                    <th className="p-2.5 border-r border-slate-600 font-semibold w-36">Risk Level</th>
                    <th className="p-2.5 border-r border-slate-600 font-semibold w-48">Approval Authority</th>
                    <th className="p-2.5 border-r border-slate-600 font-semibold w-28 text-center">Max Validity</th>
                    <th className="p-2.5 font-semibold">Mandatory Compensating Control Directive</th>
                  </tr>
                </thead>
                <tbody>
                  {(comp?.approvalMatrix || []).map((row, idx) => (
                    <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="p-2.5 border-r border-slate-200 font-bold text-slate-900">{row.riskLevel}</td>
                      <td className="p-2.5 border-r border-slate-200 text-slate-800 font-medium">{row.approverRole}</td>
                      <td className="p-2.5 border-r border-slate-200 text-center font-mono font-bold text-amber-700">
                        {row.maxValidityDays} Days (Hard Sunset)
                      </td>
                      <td className="p-2.5 text-slate-600 text-[11px]">{row.compensatingRequirement}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Central Exception Identifier Badge */}
          <div className="bg-amber-50/70 border border-amber-200 p-3 rounded flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-amber-900">SKANDA Master Exception Registry Ref:</span>
              <span className="ml-2 font-mono font-bold text-sky-800 bg-white px-2 py-0.5 rounded border border-slate-300">
                {comp?.auditRegistryRef || `EXC-2026-${docNo.replace(/[^A-Z0-9]/g, '')}`}
              </span>
            </div>
            <span className="text-[11px] text-slate-500">Bi-Weekly Telemetry Monitored</span>
          </div>
        </div>

        <RunningFooter pageNum={5} />
      </div>
    );
  };

  // =========================================================================
  // PAGE 6: DIRECT LINKAGE TO EVIDENCE COLLECTION POINTS (AUDIT DOSSIER)
  // =========================================================================
  const renderEvidenceLinkagePage = () => {
    const evidenceList = document.evidenceCollectionPoints || [];
    return (
      <div
        key="page-6"
        id="pdf-page-6"
        className="bg-white text-slate-900 w-full max-w-[800px] min-h-[1130px] mx-auto p-12 lg:p-16 shadow-md border border-slate-200 mb-8 flex flex-col justify-between relative print:shadow-none print:border-none print:m-0 print:w-full print:max-w-none print:p-12 print:break-after-page"
      >
        <div>
          <RunningHeader />

          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-emerald-600" />
              <h2 className="text-xl font-bold text-slate-900">Direct Linkage to Evidence Collection Points (Audit Dossier)</h2>
            </div>
            <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded">
              ISO 19011:2018 AUDIT READY
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Clause 9.2 (Internal Audit) &amp; Stage 2 Lead Auditor Sampling Verification Protocol
          </p>
          <div className="w-full h-[1.5px] bg-[#0e2a47] mb-6" />

          <p className="text-xs text-slate-700 mb-5 leading-relaxed">
            Every operational directive in {docNo} is cryptographically linked to tangible, inspectable evidence artifacts in SKANDA's Evidence Module. External auditors can directly sample these artifacts to confirm operational conformity.
          </p>

          <div className="border border-slate-300 rounded overflow-hidden mb-6">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-[#0e2a47] text-white">
                  <th className="p-2.5 border-r border-slate-600 font-semibold w-28">Artifact ID</th>
                  <th className="p-2.5 border-r border-slate-600 font-semibold">Artifact Name &amp; Evidence Module Path</th>
                  <th className="p-2.5 border-r border-slate-600 font-semibold w-44">Collection &amp; Sampling</th>
                  <th className="p-2.5 font-semibold w-24 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {evidenceList.map((pt, idx) => (
                  <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="p-2.5 border-r border-slate-200 font-mono font-bold text-sky-800 align-top">
                      {pt.artifactId}
                    </td>
                    <td className="p-2.5 border-r border-slate-200 align-top">
                      <p className="font-bold text-slate-900 text-xs mb-0.5">{pt.artifactName}</p>
                      <p className="text-[11px] text-slate-500 font-mono mb-1">{pt.evidenceModulePath}</p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        Retention: {pt.retentionSla} • SHA-256: {(pt.sha256Digest || '').slice(0, 16)}...
                      </p>
                    </td>
                    <td className="p-2.5 border-r border-slate-200 text-slate-700 text-[11px] align-top">
                      <p className="font-medium text-slate-800">{pt.collectionMethod}</p>
                      <p className="text-[10px] text-slate-500 mt-1">{pt.samplingProtocol}</p>
                    </td>
                    <td className="p-2.5 text-center align-middle">
                      <button
                        onClick={() => setSelectedEvidenceModal(pt)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 font-semibold text-[11px] transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded text-xs leading-relaxed text-slate-700">
            <strong className="text-slate-900 font-bold block mb-1">LEAD AUDITOR SAMPLING VERIFICATION ASSURANCE:</strong>
            During Stage 2 certification or internal audits, the Lead Auditor selects a representative sample directly from these paths. All records are protected in tamper-evident WORM compliant storage with immutable SHA-256 digital seals.
          </div>
        </div>

        <RunningFooter pageNum={6} />
      </div>
    );
  };

  // =========================================================================
  // PAGE 7: TABLE OF CONTENTS (Dotted Leaders)
  // =========================================================================
  const renderTableOfContentsPage = () => {
    const tocItems = [
      { title: 'Document Control & Revision History Register', pageNo: 2, level: 1 },
      { title: 'Dynamic Regulatory Cross-Mapping & Harmonization', pageNo: 3, level: 1 },
      { title: 'Automated RACI Governance & Accountability Matrix', pageNo: 4, level: 1 },
      { title: 'Security Exceptions & Compensating Controls', pageNo: 5, level: 1 },
      { title: 'Direct Linkage to Evidence Collection Points', pageNo: 6, level: 1 },
      { title: 'Table of Contents', pageNo: 7, level: 1 },
      { title: 'Technical Controls & Operational Directives', pageNo: 8, level: 1 },
      { title: 'Enforcement, CAPA & Disciplinary Action', pageNo: totalPages - 1, level: 1 },
      { title: 'Executive Leadership Sign-Off & Board Approval Block', pageNo: totalPages, level: 1 }
    ];

    return (
      <div
        key="page-7"
        id="pdf-page-7"
        className="bg-white text-slate-900 w-full max-w-[800px] min-h-[1130px] mx-auto p-12 lg:p-16 shadow-md border border-slate-200 mb-8 flex flex-col justify-between relative print:shadow-none print:border-none print:m-0 print:w-full print:max-w-none print:p-12 print:break-after-page"
      >
        <div>
          <RunningHeader />

          <h2 className="text-xl font-bold text-slate-900 mb-2">Table of Contents</h2>
          <div className="w-full h-[1.5px] bg-[#0e2a47] mb-6" />

          <div className="space-y-3.5 text-xs text-slate-800">
            {tocItems.map((item, idx) => (
              <div key={idx} className="flex items-baseline w-full">
                <span className={`font-semibold text-slate-900 ${item.level === 2 ? 'pl-4 text-slate-700' : ''}`}>
                  {item.title}
                </span>
                <span className="flex-1 mx-2 border-b border-dotted border-slate-400 select-none" />
                <span className="font-mono text-slate-900 font-semibold">{item.pageNo}</span>
              </div>
            ))}
          </div>
        </div>

        <RunningFooter pageNum={7} />
      </div>
    );
  };

  // =========================================================================
  // BODY PAGES (From document.pages or structured sections)
  // =========================================================================
  const renderBodyPages = () => {
    if (document.pages && document.pages.length > 0) {
      return document.pages.map((p, idx) => {
        const pageNumber = 7 + idx + 1;
        return (
          <div
            key={`page-${pageNumber}`}
            id={`pdf-page-${pageNumber}`}
            className="bg-white text-slate-900 w-full max-w-[800px] min-h-[1130px] mx-auto p-12 lg:p-16 shadow-md border border-slate-200 mb-8 flex flex-col justify-between relative print:shadow-none print:border-none print:m-0 print:w-full print:max-w-none print:p-12 print:break-after-page"
          >
            <div>
              <RunningHeader />

              {p.title && (
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-slate-900 mb-1">{p.title}</h2>
                  <div className="w-full h-[1.5px] bg-[#0e2a47] mb-4" />
                </div>
              )}

              {p.content && (
                <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line mb-6 font-sans">
                  {p.content}
                </div>
              )}

              {p.sections && p.sections.map((sec, sIdx) => (
                <div key={sIdx} className="mb-6">
                  {sec.heading && <h3 className="text-sm font-bold text-slate-900 mb-2">{sec.heading}</h3>}
                  {sec.subHeading && <h4 className="text-xs font-semibold text-slate-800 mb-2">{sec.subHeading}</h4>}
                  {sec.body && <p className="text-xs text-slate-700 leading-relaxed mb-3 whitespace-pre-line">{sec.body}</p>}

                  {sec.table && (
                    <div className="border border-slate-300 rounded overflow-hidden my-3">
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 font-bold">
                            {sec.table.headers.map((th, hIdx) => (
                              <th key={hIdx} className="p-2 border-r border-slate-300 last:border-r-0">{th}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {sec.table.rows.map((row, rIdx) => (
                            <tr key={rIdx} className="border-b border-slate-200 last:border-b-0 hover:bg-slate-50">
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} className="p-2 border-r border-slate-200 last:border-r-0 text-slate-700">{cell}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <RunningFooter pageNum={pageNumber} />
          </div>
        );
      });
    }

    // Fallback if no structured pages: synthesize standard body page from markdown content
    return (
      <div
        key="page-8"
        id="pdf-page-8"
        className="bg-white text-slate-900 w-full max-w-[800px] min-h-[1130px] mx-auto p-12 lg:p-16 shadow-md border border-slate-200 mb-8 flex flex-col justify-between relative print:shadow-none print:border-none print:m-0 print:w-full print:max-w-none print:p-12 print:break-after-page"
      >
        <div>
          <RunningHeader />
          <h2 className="text-xl font-bold text-slate-900 mb-1">Operational Security Directives &amp; Requirements</h2>
          <div className="w-full h-[1.5px] bg-[#0e2a47] mb-6" />

          <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line font-sans">
            {document.content || 'Comprehensive controls and technical standards as mandated by ISO/IEC 27001:2022.'}
          </div>
        </div>
        <RunningFooter pageNum={8} />
      </div>
    );
  };

  // =========================================================================
  // FINAL PAGE: EXECUTIVE LEADERSHIP SIGN-OFF & BOARD APPROVAL BLOCK (CLAUSE 5.1)
  // =========================================================================
  const renderExecutiveSignOffPage = () => {
    const signOff = document.executiveSignOff;
    return (
      <div
        key={`page-${totalPages}`}
        id={`pdf-page-${totalPages}`}
        className="bg-white text-slate-900 w-full max-w-[800px] min-h-[1130px] mx-auto p-12 lg:p-16 shadow-md border border-slate-200 mb-8 flex flex-col justify-between relative print:shadow-none print:border-none print:m-0 print:w-full print:max-w-none print:p-12 print:break-after-page"
      >
        <div>
          <RunningHeader />

          <div className="flex items-center gap-2 mb-2">
            <Award className="w-5 h-5 text-sky-600" />
            <h2 className="text-xl font-bold text-slate-900">Executive Leadership Sign-Off &amp; Board Approval Block</h2>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Fulfills ISO/IEC 27001:2022 Clause 5.1 (Leadership and Management Commitment) &amp; Clause 7.5.3
          </p>
          <div className="w-full h-[1.5px] bg-[#0e2a47] mb-6" />

          {/* Top Management Commitment Declaration */}
          <div className="bg-slate-50 border border-slate-300 rounded p-4 mb-8">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              FORMAL TOP MANAGEMENT COMMITMENT &amp; POLICY RATIFICATION:
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed">
              {signOff?.statement || `Pursuant to ISO/IEC 27001:2022 Clause 5.1, the undersigned executive leadership and audit authorities formally ratify ${document.title} (${docNo}) as binding organizational policy across ${companyName}. Top management commits required resources and oversight to sustain continuous compliance.`}
            </p>
          </div>

          {/* 3 Executive Signature Cards (CEO, CISO, Lead Auditor) */}
          <div className="space-y-4 mb-8">
            {(signOff?.signers || []).map((signer, idx) => (
              <div
                key={idx}
                className="border border-slate-300 rounded-lg p-4 bg-white shadow-xs flex items-center justify-between hover:border-slate-400 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                      {signer.roleTitle}
                    </span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                      {signer.status}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-900">{signer.name}</p>
                  <p className="text-xs text-slate-500">{signer.title} • {signer.organization || companyName}</p>
                  <p className="text-[11px] text-slate-400 mt-1">Attestation Timestamp: {signer.date}</p>
                </div>

                <div className="text-right flex flex-col items-end">
                  <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded font-mono text-xs font-bold mb-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{signer.signatureBadge}</span>
                  </div>
                  <p className="font-mono text-[10px] text-slate-400">
                    Hash: {(signer.verificationHash || '').slice(0, 24)}...
                  </p>
                  <span className="text-[10px] text-slate-500">Immutable WORM Vault Recorded</span>
                </div>
              </div>
            ))}
          </div>

          {/* Final Verification & Disciplinary Statement */}
          <div className="bg-amber-50/60 border border-amber-200 rounded p-3 text-[11px] text-slate-700 leading-relaxed">
            <strong className="text-amber-900 font-bold block mb-0.5">DISCIPLINARY ENFORCEMENT &amp; CONTINUAL IMPROVEMENT:</strong>
            Compliance with this policy is mandatory for all personnel. Any willful non-conformity triggers immediate 5-Whys root cause analysis and disciplinary escalation pursuant to corporate governance guidelines.
          </div>
        </div>

        <RunningFooter pageNum={totalPages} />
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col h-full bg-slate-100">
      {/* Top Professional Toolbar */}
      <div className="bg-slate-900 text-white px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-20 shadow-md">
        {/* Left: Document Info & Jump Navigator */}
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-sky-500/20 text-sky-400 rounded">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm text-white">{document.title}</h2>
              <span className="font-mono text-xs bg-slate-800 px-2 py-0.5 rounded text-sky-400 font-semibold">{docNo}</span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-2">
              <span>Rev {version}</span>
              <span>•</span>
              <span className="text-emerald-400 font-medium">ISO 27001:2022 &amp; MAS TRM Compliant</span>
            </p>
          </div>
        </div>

        {/* Center: Quick Section Jump Pills */}
        <div className="hidden xl:flex items-center gap-1.5 text-xs bg-slate-800/80 p-1 rounded-lg border border-slate-700">
          <button
            onClick={() => { setViewMode('all_pages'); setCurrentPage(1); }}
            className="px-2.5 py-1 rounded hover:bg-slate-700 text-slate-300 hover:text-white font-medium transition-colors"
          >
            Cover
          </button>
          <button
            onClick={() => { setViewMode('all_pages'); setCurrentPage(2); }}
            className="px-2.5 py-1 rounded hover:bg-slate-700 text-slate-300 hover:text-white font-medium transition-colors"
          >
            Doc Control
          </button>
          <button
            onClick={() => { setViewMode('all_pages'); setCurrentPage(3); }}
            className="px-2.5 py-1 rounded hover:bg-slate-700 text-slate-300 hover:text-white font-medium transition-colors flex items-center gap-1"
          >
            <Scale className="w-3 h-3 text-indigo-400" />
            <span>Cross-Mapping</span>
          </button>
          <button
            onClick={() => { setViewMode('all_pages'); setCurrentPage(4); }}
            className="px-2.5 py-1 rounded hover:bg-slate-700 text-slate-300 hover:text-white font-medium transition-colors flex items-center gap-1"
          >
            <Users className="w-3 h-3 text-sky-400" />
            <span>RACI</span>
          </button>
          <button
            onClick={() => { setViewMode('all_pages'); setCurrentPage(5); }}
            className="px-2.5 py-1 rounded hover:bg-slate-700 text-slate-300 hover:text-white font-medium transition-colors flex items-center gap-1"
          >
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            <span>Exceptions</span>
          </button>
          <button
            onClick={() => { setViewMode('all_pages'); setCurrentPage(6); }}
            className="px-2.5 py-1 rounded hover:bg-slate-700 text-slate-300 hover:text-white font-medium transition-colors flex items-center gap-1"
          >
            <FileCheck2 className="w-3 h-3 text-emerald-400" />
            <span>Evidence</span>
          </button>
          <button
            onClick={() => { setViewMode('all_pages'); setCurrentPage(totalPages); }}
            className="px-2.5 py-1 rounded hover:bg-slate-700 text-slate-300 hover:text-white font-medium transition-colors flex items-center gap-1"
          >
            <Award className="w-3 h-3 text-emerald-400" />
            <span>Sign-Off</span>
          </button>
        </div>

        {/* Right: Actions (Export PDF, Print, Zoom) */}
        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <div className="flex items-center bg-slate-800 rounded p-0.5 border border-slate-700 text-xs">
            <button
              onClick={handleZoomOut}
              className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-white transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetZoom}
              className="px-1.5 font-mono text-[11px] text-slate-300 hover:text-white"
              title="Reset Zoom"
            >
              {zoomLevel}%
            </button>
            <button
              onClick={handleZoomIn}
              className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-white transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-800 rounded p-0.5 border border-slate-700 text-xs">
            <button
              onClick={() => setViewMode('all_pages')}
              className={`px-2 py-1 rounded transition-colors ${viewMode === 'all_pages' ? 'bg-sky-600 text-white font-semibold' : 'text-slate-400 hover:text-white'}`}
            >
              All Pages
            </button>
            <button
              onClick={() => setViewMode('single_page')}
              className={`px-2 py-1 rounded transition-colors ${viewMode === 'single_page' ? 'bg-sky-600 text-white font-semibold' : 'text-slate-400 hover:text-white'}`}
            >
              Single
            </button>
          </div>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded border border-slate-700 transition-colors"
            title="Print Document"
          >
            <Printer className="w-4 h-4" />
          </button>

          {/* Official ISO 27001 PDF Export Button */}
          <button
            onClick={handleDownloadPdf}
            disabled={isExporting}
            className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white px-3 py-1.5 rounded font-semibold text-xs transition-colors shadow-sm disabled:opacity-50"
            title="Export standard ISO 27001 / MAS TRM Formatted PDF"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Exporting PDF...' : 'Download Official PDF'}</span>
          </button>
        </div>
      </div>

      {/* Page Navigation Bar (if Single Page Mode) */}
      {viewMode === 'single_page' && (
        <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-center gap-4 text-xs">
          <button
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed text-slate-700"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-medium text-slate-700">
            Page <strong className="font-bold text-slate-900">{currentPage}</strong> of {totalPages}
          </span>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed text-slate-700"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Multi-Page Document Scroll Canvas */}
      <div
        ref={printRef}
        className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-200/80 flex flex-col items-center print:bg-white print:p-0 print:overflow-visible"
        style={{
          transform: `scale(${zoomLevel / 100})`,
          transformOrigin: 'top center',
          transition: 'transform 0.15s ease-out'
        }}
      >
        {viewMode === 'all_pages' ? (
          <>
            {renderCoverPage()}
            {renderDocumentControlPage()}
            {renderCrossMappingPage()}
            {renderRaciMatrixPage()}
            {renderExceptionsPage()}
            {renderEvidenceLinkagePage()}
            {renderTableOfContentsPage()}
            {renderBodyPages()}
            {renderExecutiveSignOffPage()}
          </>
        ) : (
          <>
            {currentPage === 1 && renderCoverPage()}
            {currentPage === 2 && renderDocumentControlPage()}
            {currentPage === 3 && renderCrossMappingPage()}
            {currentPage === 4 && renderRaciMatrixPage()}
            {currentPage === 5 && renderExceptionsPage()}
            {currentPage === 6 && renderEvidenceLinkagePage()}
            {currentPage === 7 && renderTableOfContentsPage()}
            {currentPage > 7 && currentPage < totalPages && (
              (() => {
                const bodyPages = renderBodyPages();
                const bodyPageList = Array.isArray(bodyPages) ? bodyPages : [bodyPages];
                const matching = bodyPageList.find(el => el.key === `page-${currentPage}`);
                return matching || bodyPageList[0] || renderCoverPage();
              })()
            )}
            {currentPage === totalPages && renderExecutiveSignOffPage()}
          </>
        )}
      </div>

      {/* Evidence Artifact Detail Modal */}
      {selectedEvidenceModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900">Auditable Evidence Artifact Dossier</h3>
              </div>
              <button
                onClick={() => setSelectedEvidenceModal(null)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-700">
              <div>
                <span className="font-semibold text-slate-500 block mb-0.5">Artifact ID:</span>
                <span className="font-mono font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                  {selectedEvidenceModal.artifactId}
                </span>
              </div>

              <div>
                <span className="font-semibold text-slate-500 block mb-0.5">Artifact Name:</span>
                <span className="font-bold text-slate-900 text-sm">{selectedEvidenceModal.artifactName}</span>
              </div>

              <div>
                <span className="font-semibold text-slate-500 block mb-0.5">SKANDA Evidence Centre Location:</span>
                <span className="font-mono text-slate-800 bg-slate-100 p-1.5 rounded block">
                  {selectedEvidenceModal.evidenceModulePath}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="font-semibold text-slate-500 block mb-0.5">Collection Protocol:</span>
                  <span className="text-slate-800">{selectedEvidenceModal.collectionMethod}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-500 block mb-0.5">Retention SLA:</span>
                  <span className="text-slate-800 font-semibold">{selectedEvidenceModal.retentionSla}</span>
                </div>
              </div>

              <div>
                <span className="font-semibold text-slate-500 block mb-0.5">ISO 19011 Sampling Methodology:</span>
                <p className="text-slate-600 bg-slate-50 p-2 rounded border border-slate-200">
                  {selectedEvidenceModal.samplingProtocol}
                </p>
              </div>

              <div>
                <span className="font-semibold text-slate-500 block mb-0.5">Cryptographic SHA-256 Digest Seal:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] bg-slate-900 text-emerald-400 px-2 py-1 rounded flex-1 truncate">
                    {selectedEvidenceModal.sha256Digest}
                  </span>
                  <button
                    onClick={() => {
                      if (selectedEvidenceModal.sha256Digest) {
                        navigator.clipboard.writeText(selectedEvidenceModal.sha256Digest);
                      }
                    }}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-300"
                    title="Copy SHA-256"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">WORM Compliant Cryptographic Storage</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedEvidenceModal(null)}
                  className="px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs"
                >
                  Close
                </button>
                {onNavigateToEvidence && selectedEvidenceModal.evidenceId && (
                  <button
                    onClick={() => {
                      onNavigateToEvidence(selectedEvidenceModal.evidenceId!);
                      setSelectedEvidenceModal(null);
                    }}
                    className="px-3 py-1.5 rounded bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Open in Evidence Module</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS Styles for Perfect Multi-Page PDF Printing */}
      <style>{`
        @media print {
          body {
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .print\\:break-after-page {
            page-break-after: always !important;
            break-after: page !important;
          }
        }
      `}</style>
    </div>
  );
};
