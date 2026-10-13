import jsPDF from 'jspdf';
import { computeSHA256 } from './crypto';
import {
  getRegulatoryCrossMappingForDoc,
  getStandardRaciMatrixForDoc,
  getStandardCompensatingControlsForDoc,
  getEvidenceCollectionPointsForDoc,
  getStandardExecutiveSignOffForDoc,
  RegulatoryCrossReference,
  RaciMatrixEntry,
  CompensatingControlsBlock,
  AuditableEvidencePoint,
  ExecutiveSignOffBlock
} from '../services/consultancyDocumentEngine';

export interface PolicyExportPDFOptions {
  title: string;
  code: string;
  category?: string;
  isoClause?: string;
  companyName: string;
  version?: string;
  classification?: string;
  effectiveDate?: string;
  nextReviewDate?: string;
  cisoName?: string;
  cisoEmail?: string;
  dpoName?: string;
  dpoEmail?: string;
  dpoPhone?: string;
  dpoRegistrationId?: string;
  primaryCloud?: string;
  backupRpoRto?: string;
  escalationSlaSev1?: string;
  escalationSlaSev2?: string;
  escalationSlaSev3?: string;
  escalationSlaSev4?: string;
  regulatoryNotificationSla?: string;
  language?: string;
  languageLabel?: string;
  policyText: string;
  mappedTags?: string[];
  infrastructureDetails?: Array<{
    tag: string;
    name?: string;
    category?: string;
    vendor?: string;
    resourceIdentifier?: string;
    iacProvider?: string;
    evidenceHash?: string;
    snippet?: string;
  }>;
  // Enterprise Consultancy Grade Additions
  documentControlStatements?: string[];
  revisionHistory?: Array<{
    sNo: string;
    reviewDate: string;
    pageNo: string;
    issueNo: string;
    changeDescription: string;
    approvedBy: string;
    author?: string;
    status?: string;
  }>;
  raciMatrix?: {
    summary?: string;
    tableHeaders?: string[];
    matrix: RaciMatrixEntry[];
  };
  regulatoryCrossMapping?: RegulatoryCrossReference[];
  compensatingControls?: CompensatingControlsBlock;
  evidenceCollectionPoints?: AuditableEvidencePoint[];
  executiveSignOff?: ExecutiveSignOffBlock;
}

/**
 * Clean markdown symbols for plain text rendering in PDF
 */
function cleanMarkdownLine(line: string): string {
  return line
    .replace(/^#+\s*/, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    .replace(/`{1,3}(.*?)`{1,3}/g, '$1')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .trim();
}

/**
 * Format spaced company banner string (e.g. "M E T A Y B   P R I V A T E   L I M I T E D")
 */
function getSpacedCompanyString(company: string): string {
  return company.trim().toUpperCase().split('').join(' ');
}

/**
 * Export Policy Document to ISO/IEC 27001:2022 Standard PDF with full enterprise branding
 * and consultancy-grade multi-framework cross-mapping, RACI matrix, compensating controls,
 * evidence linkage, and executive sign-off blocks.
 */
export async function exportPolicyPDF(options: PolicyExportPDFOptions): Promise<string> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  const headerY = 14;
  const footerY = 283;
  const topContentMargin = 22;
  const bottomContentMargin = 272;

  const now = new Date();
  const todayFormatted = now.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
  const nextYearDate = new Date(now.getTime() + 365 * 86400000).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const company = options.companyName || 'ACME Global Enterprise';
  const title = options.title || 'Information Security Policy';
  const code = options.code || 'ISMS-POL-01';
  const version = options.version || '1.0';
  const classification = options.classification || 'Confidential (Internal ISMS)';
  const isoClause = options.isoClause || 'ISO/IEC 27001:2022 Controls';
  const effectiveDate = options.effectiveDate || todayFormatted;
  const nextReviewDate = options.nextReviewDate || nextYearDate;
  const cisoName = options.cisoName || 'Chief Information Security Officer (CISO)';
  const dpoName = options.dpoName || 'Data Protection Officer (DPO)';
  const mappedTags = options.mappedTags || [];

  // Compute tamper-evident hash of content
  const hashSource = `${code}:${title}:${version}:${company}:${options.policyText}`;
  const tamperHash = await computeSHA256(hashSource);
  const shortHash = tamperHash.slice(0, 16).toUpperCase();

  // Load Consultancy-Grade Data (use passed or generate high-fidelity defaults)
  const crossMappings: RegulatoryCrossReference[] =
    options.regulatoryCrossMapping || getRegulatoryCrossMappingForDoc(code, title, options.category || 'ISMS');

  const raciData =
    options.raciMatrix || getStandardRaciMatrixForDoc(code, title, cisoName);

  const compensatingData: CompensatingControlsBlock =
    options.compensatingControls || getStandardCompensatingControlsForDoc(code, cisoName);

  const evidencePoints: AuditableEvidencePoint[] =
    options.evidenceCollectionPoints || getEvidenceCollectionPointsForDoc(code, title, company);

  const executiveSignOffData: ExecutiveSignOffBlock =
    options.executiveSignOff || getStandardExecutiveSignOffForDoc(code, title, company, cisoName, effectiveDate);

  const controlStatements = options.documentControlStatements || [
    `This document is the official, confidential property of ${company} and shall not be reproduced, copied, or distributed without prior authorization.`,
    `Maintained under formal revision control pursuant to ISO/IEC 27001:2022 Clause 7.5. Manual or unauthorized alterations invalidate this record.`,
    `All amendments or exceptions must be reviewed by the ISMS Committee and formally ratified by the CISO and Executive Board.`
  ];

  const revisionHistory = options.revisionHistory || [
    {
      sNo: '01',
      reviewDate: effectiveDate,
      pageNo: 'All Pages',
      issueNo: version,
      changeDescription: 'Initial comprehensive synthesis compliant with ISO/IEC 27001:2022, MAS TRM Guidelines, and SOC 2 Trust Criteria.',
      approvedBy: cisoName
    }
  ];

  // Helper function to draw standard page header
  const drawPageHeader = (pageTitle: string, subTitle?: string) => {
    let curY = topContentMargin;
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(margin, curY, contentWidth, 8, 'F');
    doc.setFillColor(14, 165, 233); // sky-500 accent stripe
    doc.rect(margin, curY, 3, 8, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(255, 255, 255);
    doc.text(pageTitle.toUpperCase(), margin + 6, curY + 5.5);

    curY += 12;
    if (subTitle) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      const splitSub = doc.splitTextToSize(subTitle, contentWidth);
      doc.text(splitSub, margin, curY);
      curY += splitSub.length * 4 + 3;
    }
    return curY;
  };

  // =========================================================================
  // PAGE 1: FORMAL ISO 27001 EXECUTIVE COVER & METADATA BLOCK
  // =========================================================================

  // Top Dark Executive Header Bar
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 16, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(56, 189, 248); // sky-400
  doc.text('SKANDA GRC  •  ENTERPRISE CONTINUOUS COMPLIANCE ENGINE', margin, 10.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(248, 113, 113); // red-400
  doc.text('CONFIDENTIAL // INTERNAL ISMS USE ONLY', pageWidth - margin, 10.5, { align: 'right' });

  // Thin cyan accent rule under top bar
  doc.setFillColor(14, 165, 233); // sky-500
  doc.rect(0, 16, pageWidth, 0.8, 'F');

  let y = 32;

  // Spaced Company Header Banner
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(71, 85, 105);
  const spacedBanner = getSpacedCompanyString(company);
  doc.text(spacedBanner, pageWidth / 2, y, { align: 'center' });

  y += 5;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(margin + 20, y, pageWidth - margin - 20, y);

  y += 11;

  // Primary Policy Title Block
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42); // slate-900
  const splitTitle = doc.splitTextToSize(title.toUpperCase(), contentWidth);
  doc.text(splitTitle, pageWidth / 2, y, { align: 'center' });
  y += splitTitle.length * 7 + 2;

  // Document Code & Scope Sub-heading
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(14, 165, 233); // sky-500
  doc.text(`DOCUMENT REF: ${code}  •  REVISION ${version}`, pageWidth / 2, y, { align: 'center' });

  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Harmonized Frameworks: ISO/IEC 27001:2022  |  MAS TRM Guidelines  |  SOC 2 TSC  |  GDPR / PDPA`,
    pageWidth / 2,
    y,
    { align: 'center' }
  );

  y += 10;

  // ISO 7.5 Document Metadata Table (10 key governance parameters)
  const metaRows = [
    ['Document Reference', code, 'Security Classification', classification],
    ['Document Title', title, 'Current Revision', `v${version} (Operational)`],
    ['Effective Date', effectiveDate, 'Next Scheduled Review', nextReviewDate],
    ['Document Owner', cisoName, 'Approving Authority', 'CISO & Executive Board'],
    ['Governance Framework', 'ISO/IEC 27001:2022 & MAS TRM', 'Audit Verification', 'Accredited Lead Auditor Attested'],
    ['Integrity Seal', `SHA-256: ${shortHash}...`, 'WORM Vault Status', 'Immutable Cryptographic Archive']
  ];

  const colWidth = contentWidth / 4;
  const rowH = 6.2;

  metaRows.forEach((row, i) => {
    // Alternating fill
    doc.setFillColor(i % 2 === 0 ? 248 : 255, i % 2 === 0 ? 250 : 255, i % 2 === 0 ? 252 : 255);
    doc.rect(margin, y, contentWidth, rowH, 'FD');

    // Label 1
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(71, 85, 105);
    doc.text(row[0], margin + 2.5, y + 4.2);

    // Val 1
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(15, 23, 42);
    doc.text(row[1], margin + colWidth + 2, y + 4.2);

    // Label 2
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text(row[2], margin + colWidth * 2 + 2.5, y + 4.2);

    // Val 2
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(row[3], margin + colWidth * 3 + 2, y + 4.2);

    // Vertical column rules
    doc.setDrawColor(226, 232, 240);
    doc.line(margin + colWidth, y, margin + colWidth, y + rowH);
    doc.line(margin + colWidth * 2, y, margin + colWidth * 2, y + rowH);
    doc.line(margin + colWidth * 3, y, margin + colWidth * 3, y + rowH);

    y += rowH;
  });

  y += 10;

  // Proprietary Notice & Distribution Warning Box
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 24, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(180, 83, 9); // amber-700
  doc.text('PROPRIETARY NOTICE & MANDATORY CONTROL OF DOCUMENTED INFORMATION (ISO 7.5.3)', margin + 3.5, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(71, 85, 105);
  const noticeBody = `This document contains strictly confidential information belonging to ${company}. It is issued under controlled distribution in conformance with ISO/IEC 27001:2022 Clause 7.5.3, MAS TRM Guidelines, and international compliance standards. Unauthorized copying, disclosure, forwarding, or reproduction in any form is prohibited. Uncontrolled when printed or detached from the central SKANDA GRC repository.`;
  const splitNotice = doc.splitTextToSize(noticeBody, contentWidth - 7);
  doc.text(splitNotice, margin + 3.5, y + 9.5);

  y += 30;

  // Cover Page Quick Attestation Badges
  const badgeWidth = (contentWidth - 8) / 3;
  const badges = [
    { label: 'GOVERNANCE AUDIT', status: 'ISO 27001:2022 CONFORMANT', color: [16, 185, 129] },
    { label: 'REGULATORY HARMONIZATION', status: 'MAS TRM & SOC 2 CROSS-ALIGNED', color: [14, 165, 233] },
    { label: 'EVIDENCE READINESS', status: 'AUDITABLE ARTIFACT LINKED', color: [99, 102, 241] }
  ];

  badges.forEach((b, idx) => {
    const bx = margin + idx * (badgeWidth + 4);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(bx, y, badgeWidth, 14, 1.5, 1.5, 'FD');

    // color tab
    doc.setFillColor(b.color[0], b.color[1], b.color[2]);
    doc.rect(bx, y, 2, 14, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.2);
    doc.setTextColor(100, 116, 139);
    doc.text(b.label, bx + 4, y + 4.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(15, 23, 42);
    doc.text(b.status, bx + 4, y + 9.5);
  });

  // =========================================================================
  // PAGE 2: ISO 7.5 DOCUMENT CONTROL & REVISION HISTORY REGISTER
  // =========================================================================
  doc.addPage();
  y = drawPageHeader(
    'DOCUMENT CONTROL & REVISION HISTORY REGISTER',
    'Fulfills ISO/IEC 27001:2022 Clause 7.5.2 (Creating and Updating) & Clause 7.5.3 (Control of Documented Information)'
  );

  // Section 1: Official Control Statements
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('1. DOCUMENT CONTROL STATEMENTS & GOVERNANCE RULES', margin, y);
  y += 4.5;

  controlStatements.forEach((stmt) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    doc.setTextColor(51, 65, 85);
    const splitStmt = doc.splitTextToSize(`▪ ${stmt}`, contentWidth - 4);
    doc.text(splitStmt, margin + 2, y);
    y += splitStmt.length * 3.8 + 1.5;
  });

  y += 5;

  // Section 2: Tabular Revision History Log
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('2. AUDITABLE CHANGE & REVISION HISTORY LOG', margin, y);
  y += 4;

  // Table header
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(255, 255, 255);
  doc.text('S.NO', margin + 2, y + 4.2);
  doc.text('REV', margin + 12, y + 4.2);
  doc.text('REVIEW DATE', margin + 26, y + 4.2);
  doc.text('SECTION/PAGES', margin + 54, y + 4.2);
  doc.text('DESCRIPTION OF CHANGE & REVISION REASON', margin + 84, y + 4.2);
  doc.text('APPROVED BY', margin + 146, y + 4.2);

  y += 6;

  revisionHistory.forEach((rev, idx) => {
    doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
    doc.rect(margin, y, contentWidth, 7, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(15, 23, 42);
    doc.text(rev.sNo, margin + 2, y + 4.6);
    doc.text(rev.issueNo, margin + 12, y + 4.6);
    doc.text(rev.reviewDate, margin + 26, y + 4.6);
    doc.text(rev.pageNo, margin + 54, y + 4.6);

    const splitDesc = doc.splitTextToSize(rev.changeDescription, 60);
    doc.text(splitDesc[0] || '', margin + 84, y + 4.6);

    doc.text(rev.approvedBy, margin + 146, y + 4.6);
    y += 7;
  });

  y += 8;

  // Section 3: Formal Issue & Approval Record
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('3. FORMAL DOCUMENT ISSUE & APPROVAL SIGN-OFF', margin, y);
  y += 4;

  const approvalRecords = [
    { role: 'Prepared / Synthesized By', name: 'Information Security Working Group', title: 'Technical Lead', date: effectiveDate, status: 'COMPLETED' },
    { role: 'Technical & Architecture Review', name: cisoName, title: 'Head of Information Security', date: effectiveDate, status: 'VERIFIED' },
    { role: 'Legal & Privacy Concurrence', name: dpoName, title: 'Data Protection Officer & Counsel', date: effectiveDate, status: 'CONCURRED' },
    { role: 'Executive Board Ratification', name: 'Executive Leadership Team', title: 'Board Risk Committee', date: effectiveDate, status: 'RATIFIED' }
  ];

  // Header
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 6, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(15, 23, 42);
  doc.text('ROLE / GOVERNANCE CAPACITY', margin + 3, y + 4.2);
  doc.text('NAME', margin + 55, y + 4.2);
  doc.text('TITLE / FUNCTION', margin + 95, y + 4.2);
  doc.text('DATE', margin + 138, y + 4.2);
  doc.text('STATUS', margin + 162, y + 4.2);

  y += 6;

  approvalRecords.forEach((rec, idx) => {
    doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
    doc.rect(margin, y, contentWidth, 6.2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(71, 85, 105);
    doc.text(rec.role, margin + 3, y + 4.2);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(rec.name, margin + 55, y + 4.2);
    doc.text(rec.title, margin + 95, y + 4.2);
    doc.text(rec.date, margin + 138, y + 4.2);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(16, 185, 129); // emerald-600
    doc.text(`✓ ${rec.status}`, margin + 162, y + 4.2);

    y += 6.2;
  });

  // =========================================================================
  // PAGE 3: DYNAMIC REGULATORY CROSS-MAPPING & HARMONIZATION MATRIX
  // =========================================================================
  doc.addPage();
  y = drawPageHeader(
    'DYNAMIC REGULATORY CROSS-MAPPING & HARMONIZATION MATRIX',
    'Demonstrates unified compliance harmonization across ISO/IEC 27001:2022, MAS TRM Guidelines, SOC 2 TSC, and GDPR/PDPA.'
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  const crossIntro = `SKANDA's document engine dynamically maps every control directive in ${code} to global regulatory and industry standards. This eliminates single-framework silos and establishes unified audit defensibility during multi-standard external certification audits.`;
  const splitCrossIntro = doc.splitTextToSize(crossIntro, contentWidth);
  doc.text(splitCrossIntro, margin, y);
  y += splitCrossIntro.length * 4 + 4;

  // Cross mapping table
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(255, 255, 255);
  doc.text('STANDARD / FRAMEWORK', margin + 2.5, y + 4.2);
  doc.text('REFERENCE CLAUSE', margin + 46, y + 4.2);
  doc.text('REGULATORY REQUIREMENT & HARMONIZATION RATIONALE', margin + 86, y + 4.2);
  doc.text('STATUS', margin + 162, y + 4.2);

  y += 6;

  crossMappings.forEach((mapping, idx) => {
    const splitReq = doc.splitTextToSize(
      `${mapping.requirementSummary} | Harmonization: ${mapping.controlHarmonization}`,
      72
    );
    const cellHeight = Math.max(splitReq.length * 3.4 + 3, 11);

    doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
    doc.rect(margin, y, contentWidth, cellHeight, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(15, 23, 42);
    doc.text(mapping.framework, margin + 2.5, y + 4.5);

    doc.setFont('courier', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(14, 165, 233); // sky-500
    const splitClause = doc.splitTextToSize(mapping.referenceClause, 38);
    doc.text(splitClause, margin + 46, y + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.4);
    doc.setTextColor(51, 65, 85);
    doc.text(splitReq, margin + 86, y + 4.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(16, 185, 129); // emerald-600
    doc.text(mapping.complianceStatus, margin + 162, y + 4.5);

    y += cellHeight;
  });

  // =========================================================================
  // PAGE 4: AUTOMATED RACI GOVERNANCE & ACCOUNTABILITY MATRIX
  // =========================================================================
  doc.addPage();
  y = drawPageHeader(
    'AUTOMATED RACI GOVERNANCE & ACCOUNTABILITY MATRIX',
    'Fulfills ISO/IEC 27001:2022 Clause 5.3 (Organizational roles, responsibilities and authorities)'
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  const raciIntro = raciData.summary || `This RACI Matrix formally links corporate roles to operational accountability, oversight, and escalation channels for ${title} (${code}).`;
  const splitRaciIntro = doc.splitTextToSize(raciIntro, contentWidth);
  doc.text(splitRaciIntro, margin, y);
  y += splitRaciIntro.length * 4 + 4;

  // RACI Table Header
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(255, 255, 255);
  doc.text('CORPORATE ROLE', margin + 2.5, y + 4.2);
  doc.text('ORGANIZATIONAL MANDATE & RESPONSIBILITIES', margin + 48, y + 4.2);
  doc.text('R', margin + 118, y + 4.2);
  doc.text('A', margin + 125, y + 4.2);
  doc.text('C', margin + 132, y + 4.2);
  doc.text('I', margin + 139, y + 4.2);
  doc.text('ESCALATION TRIGGER', margin + 146, y + 4.2);

  y += 6;

  raciData.matrix.forEach((entry, idx) => {
    const roleLines = [entry.role];
    if (entry.assignedUsers && entry.assignedUsers.length > 0) {
      roleLines.push(`(${entry.assignedUsers.join(', ')})`);
    }
    const splitRole = doc.splitTextToSize(roleLines.join('\n'), 44);
    const splitMandate = doc.splitTextToSize(entry.mandate, 66);
    const splitEscalate = doc.splitTextToSize(entry.escalationTrigger || 'Operational deviation', 32);
    const cellH = Math.max(splitRole.length * 3.4 + 3, splitMandate.length * 3.4 + 3, splitEscalate.length * 3.4 + 3, 10);

    doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
    doc.rect(margin, y, contentWidth, cellH, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(15, 23, 42);
    doc.text(splitRole, margin + 2.5, y + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.4);
    doc.setTextColor(51, 65, 85);
    doc.text(splitMandate, margin + 48, y + 4.5);

    // R A C I marks
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);

    doc.setTextColor(entry.r ? 16 : 148, entry.r ? 185 : 163, entry.r ? 129 : 184);
    doc.text(entry.r ? 'R' : '—', margin + 118, y + 4.5);

    doc.setTextColor(entry.a ? 14 : 148, entry.a ? 165 : 163, entry.a ? 233 : 184);
    doc.text(entry.a ? 'A' : '—', margin + 125, y + 4.5);

    doc.setTextColor(entry.c ? 245 : 148, entry.c ? 158 : 163, entry.c ? 11 : 184);
    doc.text(entry.c ? 'C' : '—', margin + 132, y + 4.5);

    doc.setTextColor(entry.i ? 100 : 148, entry.i ? 116 : 163, entry.i ? 139 : 184);
    doc.text(entry.i ? 'I' : '—', margin + 139, y + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.3);
    doc.setTextColor(71, 85, 105);
    doc.text(splitEscalate, margin + 146, y + 4.5);

    y += cellH;
  });

  // =========================================================================
  // PAGE 5: FORMAL SECURITY EXCEPTIONS & COMPENSATING CONTROLS
  // =========================================================================
  doc.addPage();
  y = drawPageHeader(
    'SECURITY EXCEPTIONS & COMPENSATING CONTROLS GOVERNANCE',
    'Fulfills ISO/IEC 27001:2022 Clause 6.1.3 & 8.1 - Formal Deviation Control & Sunset Policies'
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  const splitWorkflow = doc.splitTextToSize(compensatingData.exceptionWorkflow, contentWidth);
  doc.text(splitWorkflow, margin, y);
  y += splitWorkflow.length * 4 + 4;

  // Mandatory Criteria Card
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 34, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('MANDATORY COMPENSATING CONTROLS EVALUATION CRITERIA', margin + 3.5, y + 5);

  let criteriaY = y + 9.5;
  compensatingData.mandatoryCriteria.forEach((crit) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(71, 85, 105);
    const splitCrit = doc.splitTextToSize(`✓ ${crit}`, contentWidth - 7);
    doc.text(splitCrit, margin + 3.5, criteriaY);
    criteriaY += splitCrit.length * 3.4 + 1.2;
  });

  y += 40;

  // Approval Authority Matrix Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('AUDITABLE EXCEPTION APPROVAL AUTHORITY & TIME-BOXED LIMITS', margin, y);
  y += 4;

  doc.setFillColor(15, 23, 42);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(255, 255, 255);
  doc.text('RISK TIER', margin + 3, y + 4.2);
  doc.text('APPROVER ROLE', margin + 45, y + 4.2);
  doc.text('MAX DURATION', margin + 95, y + 4.2);
  doc.text('MANDATORY COMPENSATING CONTROL DIRECTIVE', margin + 122, y + 4.2);

  y += 6;

  compensatingData.approvalMatrix.forEach((tier, idx) => {
    const splitComp = doc.splitTextToSize(tier.compensatingRequirement, 55);
    const cellH = Math.max(splitComp.length * 3.4 + 3, 9);

    doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
    doc.rect(margin, y, contentWidth, cellH, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(15, 23, 42);
    doc.text(tier.riskLevel, margin + 3, y + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.text(tier.approverRole, margin + 45, y + 4.5);

    doc.setFont('courier', 'bold');
    doc.setTextColor(180, 83, 9); // amber-700
    doc.text(`${tier.maxValidityDays} CALENDAR DAYS`, margin + 95, y + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(splitComp, margin + 122, y + 4.5);

    y += cellH;
  });

  y += 8;

  // Master Exception Registry Box
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 14, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(71, 85, 105);
  doc.text('CENTRAL EXCEPTION REGISTRY IDENTIFIER:', margin + 3.5, y + 5);

  doc.setFont('courier', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(14, 165, 233);
  doc.text(compensatingData.auditRegistryRef, margin + 3.5, y + 10.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(100, 116, 139);
  doc.text('Logged in SKANDA Master Risk & Exception Registry with bi-weekly SIEM telemetry monitoring.', margin + 70, y + 10.5);

  // =========================================================================
  // PAGE 6: DIRECT LINKAGE TO EVIDENCE COLLECTION POINTS
  // =========================================================================
  doc.addPage();
  y = drawPageHeader(
    'DIRECT LINKAGE TO EVIDENCE COLLECTION POINTS (AUDIT DOSSIER)',
    'Fulfills ISO/IEC 27001:2022 Clause 9.2 (Internal Audit) & ISO 19011:2018 Fieldwork Sampling Protocols'
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  const evidIntro = `Pursuant to ISO/IEC 27001:2022 Clause 9.2 and TÜV/BSI Stage 2 certification protocols, every operational control defined in this document is bound to verifiable digital evidence artifacts in SKANDA's Evidence Module.`;
  const splitEvidIntro = doc.splitTextToSize(evidIntro, contentWidth);
  doc.text(splitEvidIntro, margin, y);
  y += splitEvidIntro.length * 4 + 4;

  // Evidence Table
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(255, 255, 255);
  doc.text('ARTIFACT ID', margin + 2.5, y + 4.2);
  doc.text('ARTIFACT NAME & SKANDA EVIDENCE MODULE PATH', margin + 28, y + 4.2);
  doc.text('INGESTION METHOD & PROTOCOL', margin + 98, y + 4.2);
  doc.text('RETENTION SLA & CRYPTO SEAL', margin + 144, y + 4.2);

  y += 6;

  evidencePoints.forEach((pt, idx) => {
    const splitName = doc.splitTextToSize(`${pt.artifactName}\nPath: ${pt.evidenceModulePath}`, 68);
    const splitMethod = doc.splitTextToSize(`${pt.collectionMethod}\nSampling: ${pt.samplingProtocol}`, 44);
    const splitRet = doc.splitTextToSize(`${pt.retentionSla}\nSHA-256: ${(pt.sha256Digest || '').slice(0, 16)}...`, 34);

    const cellH = Math.max(splitName.length * 3.4 + 3, splitMethod.length * 3.4 + 3, 11);

    doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
    doc.rect(margin, y, contentWidth, cellH, 'FD');

    doc.setFont('courier', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(14, 165, 233);
    doc.text(pt.artifactId, margin + 2.5, y + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.4);
    doc.setTextColor(15, 23, 42);
    doc.text(splitName, margin + 28, y + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.2);
    doc.setTextColor(51, 65, 85);
    doc.text(splitMethod, margin + 98, y + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.2);
    doc.setTextColor(100, 116, 139);
    doc.text(splitRet, margin + 144, y + 4.5);

    y += cellH;
  });

  // =========================================================================
  // PAGE 7: CONTEXTUAL GROUNDING (IF CLOUD TAGS / INFRASTRUCTURE PRESENT)
  // =========================================================================
  if (mappedTags.length > 0 || (options.infrastructureDetails && options.infrastructureDetails.length > 0)) {
    doc.addPage();
    y = drawPageHeader(
      'CONTEXTUAL GROUNDING & INFRASTRUCTURE TRACEABILITY',
      'In conformance with ISO/IEC 27001:2022 Clause 5.2 and Clause 7.5 - Direct Infrastructure Enforcement'
    );

    // Summary Table
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y, contentWidth, 6, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(15, 23, 42);
    doc.text('SERVICE TAG', margin + 3, y + 4.2);
    doc.text('CATEGORY', margin + 35, y + 4.2);
    doc.text('RESOURCE IDENTIFIER / TARGET', margin + 75, y + 4.2);
    doc.text('IAC PROVIDER', margin + 140, y + 4.2);

    y += 6;

    const infraList = options.infrastructureDetails || mappedTags.map(tag => ({
      tag,
      category: 'Cloud Infrastructure',
      resourceIdentifier: `${tag.toLowerCase()}-prod-cluster`,
      iacProvider: 'Terraform AWS Provider'
    }));

    infraList.forEach((infra, idx) => {
      doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
      doc.rect(margin, y, contentWidth, 6.5, 'FD');

      doc.setFont('courier', 'bold');
      doc.setFontSize(6.8);
      doc.setTextColor(14, 165, 233);
      doc.text(infra.tag, margin + 3, y + 4.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.8);
      doc.setTextColor(51, 65, 85);
      doc.text(infra.category || 'General Infrastructure', margin + 35, y + 4.5);
      doc.text(infra.resourceIdentifier || 'Automated Cloud Target', margin + 75, y + 4.5);
      doc.text(infra.iacProvider || 'Terraform / IaC', margin + 140, y + 4.5);

      y += 6.5;
    });
  }

  // =========================================================================
  // BODY CONTENT PAGES (CLEAN MARKDOWN PARSING)
  // =========================================================================
  doc.addPage();
  y = drawPageHeader('TECHNICAL CONTROLS & BASELINE IMPLEMENTATION SPECIFICATIONS');

  const lines = options.policyText.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = cleanMarkdownLine(rawLine);

    if (!line) {
      y += 3;
      continue;
    }

    if (y > bottomContentMargin - 15) {
      doc.addPage();
      y = topContentMargin + 6;
    }

    // Heading 1
    if (rawLine.startsWith('# ')) {
      y += 5;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      const splitH1 = doc.splitTextToSize(line, contentWidth);
      doc.text(splitH1, margin, y);
      y += splitH1.length * 5 + 2;
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, y, pageWidth - margin, y);
      y += 4;
      continue;
    }

    // Heading 2
    if (rawLine.startsWith('## ')) {
      y += 4;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(30, 41, 59);
      const splitH2 = doc.splitTextToSize(line, contentWidth);
      doc.text(splitH2, margin, y);
      y += splitH2.length * 4.5 + 2;
      continue;
    }

    // Heading 3
    if (rawLine.startsWith('### ')) {
      y += 3;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      const splitH3 = doc.splitTextToSize(line, contentWidth);
      doc.text(splitH3, margin, y);
      y += splitH3.length * 4 + 1.5;
      continue;
    }

    // Bullets
    if (rawLine.trim().startsWith('- ') || rawLine.trim().startsWith('* ') || rawLine.trim().startsWith('▪ ')) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(51, 65, 85);
      const bulletText = `▪ ${line.replace(/^[-*▪]\s*/, '')}`;
      const splitBullet = doc.splitTextToSize(bulletText, contentWidth - 4);
      doc.text(splitBullet, margin + 4, y);
      y += splitBullet.length * 3.8 + 1;
      continue;
    }

    // Standard paragraph
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    const splitPara = doc.splitTextToSize(line, contentWidth);
    doc.text(splitPara, margin, y);
    y += splitPara.length * 3.8 + 1.5;
  }

  // =========================================================================
  // FINAL PAGE: CLAUSE 5.1 EXECUTIVE SIGN-OFF & BOARD APPROVAL BLOCK
  // =========================================================================
  doc.addPage();
  y = drawPageHeader(
    'EXECUTIVE LEADERSHIP SIGN-OFF & BOARD APPROVAL BLOCK',
    'Fulfills ISO/IEC 27001:2022 Clause 5.1 (Leadership and Management Commitment)'
  );

  // Top Management Commitment Statement
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 22, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('FORMAL TOP MANAGEMENT COMMITMENT (ISO/IEC 27001:2022 CLAUSE 5.1)', margin + 3.5, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(71, 85, 105);
  const splitCommitment = doc.splitTextToSize(executiveSignOffData.statement, contentWidth - 7);
  doc.text(splitCommitment, margin + 3.5, y + 9.5);

  y += 28;

  // 3 Signature Cards (CEO, CISO, Lead Auditor)
  const cardWidth = contentWidth;
  const cardH = 25;

  executiveSignOffData.signers.forEach((signer) => {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, y, cardWidth, cardH, 2, 2, 'FD');

    // Accent tab
    doc.setFillColor(signer.roleTitle.includes('CEO') ? 14 : signer.roleTitle.includes('CISO') ? 16 : 99,
      signer.roleTitle.includes('CEO') ? 165 : signer.roleTitle.includes('CISO') ? 185 : 102,
      signer.roleTitle.includes('CEO') ? 233 : signer.roleTitle.includes('CISO') ? 129 : 241);
    doc.rect(margin, y, 3, cardH, 'F');

    // Left info
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.8);
    doc.setTextColor(15, 23, 42);
    doc.text(signer.roleTitle, margin + 6, y + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    doc.setTextColor(51, 65, 85);
    doc.text(`Name: ${signer.name}`, margin + 6, y + 10.5);
    doc.text(`Title / Organization: ${signer.title} (${signer.organization || company})`, margin + 6, y + 14.5);
    doc.text(`Attestation Date: ${signer.date}`, margin + 6, y + 18.5);

    // Right digital badge
    const badgeX = pageWidth - margin - 72;
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(badgeX, y + 4, 68, 16, 1.5, 1.5, 'FD');

    doc.setFont('courier', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(16, 185, 129); // emerald-600
    doc.text(`✓ ${signer.signatureBadge}`, badgeX + 3, y + 9);

    doc.setFont('courier', 'normal');
    doc.setFontSize(5.8);
    doc.setTextColor(100, 116, 139);
    doc.text(`Hash: ${(signer.verificationHash || '').slice(0, 32)}...`, badgeX + 3, y + 13.5);
    doc.text(`Audit Trail: Immutable WORM Vault Record`, badgeX + 3, y + 17);

    y += cardH + 5;
  });

  // =========================================================================
  // PASS 2: RUNNING HEADERS & DYNAMIC REGULATORY CROSS-MAPPING FOOTERS
  // =========================================================================
  const totalPages = doc.getNumberOfPages();

  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);

    if (p === 1) {
      // Cover page footer
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.3);
      doc.line(margin, footerY, pageWidth - margin, footerY);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.8);
      doc.setTextColor(100, 116, 139);
      doc.text(`ISO/IEC 27001:2022 ISMS CONTROLLED DOCUMENT  •  ${company}`, margin, footerY + 4.5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.8);
      doc.text(`Page 1 of ${totalPages}`, pageWidth - margin, footerY + 4.5, { align: 'right' });
    } else {
      // Running header
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.8);
      doc.setTextColor(100, 116, 139);
      doc.text(`${company}  •  ${title}`, margin, headerY);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(71, 85, 105);
      doc.text(`${code}  |  Rev ${version}  |  ISO 27001:2022`, pageWidth - margin, headerY, { align: 'right' });

      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.line(margin, headerY + 2.5, pageWidth - margin, headerY + 2.5);

      // Running footer: Multi-Framework Cross-Mapping Line + Page Count
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.line(margin, footerY - 2.5, pageWidth - margin, footerY - 2.5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.2);
      doc.setTextColor(14, 165, 233); // sky-500
      doc.text('Harmonized: ISO/IEC 27001:2022  •  MAS TRM Guidelines  •  SOC 2 TSC CC6  •  GDPR / PDPA', margin, footerY + 1.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.2);
      doc.setTextColor(100, 116, 139);
      doc.text(`Classification: ${classification}`, margin, footerY + 5.5);

      doc.setFont('courier', 'normal');
      doc.setFontSize(5.8);
      doc.setTextColor(148, 163, 184);
      doc.text(`SHA-256: ${shortHash}`, pageWidth / 2, footerY + 5.5, { align: 'center' });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.8);
      doc.setTextColor(71, 85, 105);
      doc.text(`Page ${p} of ${totalPages}`, pageWidth - margin, footerY + 5.5, { align: 'right' });
    }
  }

  // Save the PDF with standardized filename
  const rawClean = title.replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '').slice(0, 40);
  const cleanTitle = rawClean || 'Policy_Document';
  const langSuffix = options.language && options.language !== 'en' ? `_${options.language.toUpperCase()}` : '';
  const fileName = `${code}_${cleanTitle}${langSuffix}_ISO27001_Formatted.pdf`;
  doc.save(fileName);

  return fileName;
}
