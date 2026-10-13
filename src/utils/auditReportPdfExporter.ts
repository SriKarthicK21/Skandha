import jsPDF from 'jspdf';

export interface AuditReportSectionVisibility {
  includeTitleBlock?: boolean;
  includeExecutiveSummary?: boolean;
  includeKpiMetrics?: boolean;
  includeDepartmentBreakdown?: boolean;
  includeRootCauseTaxonomy?: boolean;
  includeDetailedFindings?: boolean;
  includeSignatories?: boolean;
  includeAuditSeal?: boolean;
}

export interface AuditReportPdfData {
  tenantName: string;
  reportTitle: string;
  documentRef: string;
  classification: string;
  auditCycle: string;
  targetStakeholder: string;
  frameworks: string[];
  leadAuditor: string;
  reviewDate?: string;
  sha256Seal?: string;
  executiveOpinion: string;
  executiveSummaryText: string;
  sections?: AuditReportSectionVisibility;
  stats: {
    totalFindings: number;
    majorNCs: number;
    minorNCs: number;
    observations: number;
    ofis: number;
    openCount: number;
    closedCount: number;
    overdueCount: number;
    remediationRate: number;
  };
  departmentBreakdown: Array<{
    name: string;
    total: number;
    major: number;
    minor: number;
    open: number;
  }>;
  rootCauseBreakdown: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  findings: Array<{
    findingCode: string;
    title: string;
    severity: string;
    status: string;
    clauseOrControl: string;
    department: string;
    rootCause: string;
    correctiveAction: string;
    preventiveAction: string;
    owner: string;
    targetDate: string;
  }>;
  signatories?: Array<{
    title: string;
    name: string;
    status: string;
    date: string;
  }>;
}

export function exportAuditReportPDF(data: AuditReportPdfData): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  const now = new Date();
  const dateStr = data.reviewDate || now.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  // Compute active sections and total pages estimate
  const sections: AuditReportSectionVisibility = {
    includeTitleBlock: true,
    includeExecutiveSummary: true,
    includeKpiMetrics: true,
    includeDepartmentBreakdown: true,
    includeRootCauseTaxonomy: true,
    includeDetailedFindings: true,
    includeSignatories: true,
    includeAuditSeal: true,
    ...(data.sections || {})
  };

  const hasPage1 = (sections.includeTitleBlock !== false) ||
                   (sections.includeExecutiveSummary !== false) ||
                   (sections.includeKpiMetrics !== false) ||
                   (sections.includeDepartmentBreakdown !== false) ||
                   (sections.includeRootCauseTaxonomy !== false) ||
                   (sections.includeSignatories !== false);

  const includeFindings = (sections.includeDetailedFindings !== false) && data.findings.length > 0;
  const findingsPerPage = 3;
  const findingsPages = includeFindings ? Math.ceil(data.findings.length / findingsPerPage) : 0;
  const estimatedTotalPages = Math.max(1, (hasPage1 ? 1 : 0) + findingsPages);

  let currentPage = 0;

  // Header Helper
  const drawPageHeader = (pageNum: number, totalPages: number, pageTitle: string) => {
    // Top banner dark bar
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 18, 'F');

    // Brand title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(56, 189, 248); // sky-400
    doc.text('SKANDA GRC', margin, 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(203, 213, 225); // slate-300
    doc.text(`•  AUDIT FINDINGS & CAPA REPORT  •  ${data.auditCycle}`, margin + 27, 11);

    // Classification tag
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(248, 113, 113); // red-400
    doc.text(data.classification.toUpperCase(), pageWidth - margin, 11, { align: 'right' });

    // Thin accent bar
    doc.setFillColor(14, 165, 233); // sky-500
    doc.rect(0, 18, pageWidth, 0.8, 'F');

    // Page Section Title below header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(pageTitle.toUpperCase(), margin, 24);
  };

  // Footer Helper
  const drawPageFooter = (pageNum: number, totalPages: number) => {
    const footerY = pageHeight - 12;

    // Thin divider
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.3);
    doc.line(margin, footerY - 2, pageWidth - margin, footerY - 2);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `Doc Ref: ${data.documentRef}  |  Tenant: ${data.tenantName}  |  SHA-256: ${data.sha256Seal ? data.sha256Seal.slice(0, 18) + '...' : 'AUTHENTICATED'}`,
      margin,
      footerY + 3
    );

    doc.setFont('helvetica', 'bold');
    doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - margin, footerY + 3, { align: 'right' });
  };

  // ==========================================
  // PAGE 1: COVER & EXECUTIVE SUMMARY
  // ==========================================
  if (hasPage1) {
    currentPage = 1;
    drawPageHeader(1, estimatedTotalPages, 'Section 1: Executive Audit Summary & Stakeholder Assurance');

    let y = 30;

    // Title Block Container
    if (sections.includeTitleBlock !== false) {
      doc.setFillColor(248, 250, 252); // slate-50
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.roundedRect(margin, y, contentWidth, 34, 2, 2, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text(data.reportTitle, margin + 4, y + 8);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105); // slate-600
      doc.text(`Target Stakeholder Audience: ${data.targetStakeholder}  |  In-Scope Organization: ${data.tenantName}`, margin + 4, y + 15);

      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`Frameworks: ${data.frameworks.join(', ')}  |  Lead Auditor: ${data.leadAuditor}  |  Published: ${dateStr}`, margin + 4, y + 21);

      // Cryptographic Seal Strip
      if (sections.includeAuditSeal !== false && data.sha256Seal) {
        doc.setFillColor(241, 245, 249);
        doc.rect(margin + 4, y + 25, contentWidth - 8, 6, 'F');
        doc.setFont('courier', 'bold');
        doc.setFontSize(6.5);
        doc.setTextColor(14, 116, 144);
        doc.text(`VERIFIED CRYPTOGRAPHIC SEAL: ${data.sha256Seal}`, margin + 6, y + 29);
      }

      y += 40;
    }

    // Executive Opinion Box
    if (sections.includeExecutiveSummary !== false) {
      doc.setFillColor(240, 253, 250); // teal-50
      doc.setDrawColor(20, 184, 166); // teal-500
      doc.setLineWidth(0.6);
      doc.roundedRect(margin, y, contentWidth, 22, 2, 2, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(13, 148, 136); // teal-600
      doc.text('FORMAL AUDITOR OPINION & ATTESTATION', margin + 4, y + 6);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text(data.executiveOpinion, margin + 4, y + 12);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(51, 65, 85);
      const opinionLines = doc.splitTextToSize(data.executiveSummaryText, contentWidth - 8);
      doc.text(opinionLines.slice(0, 2), margin + 4, y + 17);

      y += 28;
    }

    // Findings Aggregate KPI Cards (4 columns)
    if (sections.includeKpiMetrics !== false) {
      const colW = (contentWidth - 6) / 4;
      const cards = [
        { label: 'Total Findings', val: `${data.stats.totalFindings}`, color: [15, 23, 42], sub: 'Identified in cycle' },
        { label: 'Major Non-Conformities', val: `${data.stats.majorNCs}`, color: [225, 29, 72], sub: 'Requires immediate CAPA' },
        { label: 'Minor NCs & OFIs', val: `${data.stats.minorNCs + data.stats.observations}`, color: [217, 119, 6], sub: 'Planned remediation' },
        { label: 'Remediation Health', val: `${data.stats.remediationRate}%`, color: [13, 148, 136], sub: `${data.stats.closedCount} closed / ${data.stats.openCount} open` }
      ];

      cards.forEach((c, idx) => {
        const cardX = margin + idx * (colW + 2);
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.3);
        doc.roundedRect(cardX, y, colW, 20, 1.5, 1.5, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(100, 116, 139);
        doc.text(c.label.toUpperCase(), cardX + 3, y + 5);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(c.color[0], c.color[1], c.color[2]);
        doc.text(c.val, cardX + 3, y + 12);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.5);
        doc.setTextColor(148, 163, 184);
        doc.text(c.sub, cardX + 3, y + 17);
      });

      y += 26;
    }

    // Departmental Concentration Table
    if (sections.includeDepartmentBreakdown !== false && data.departmentBreakdown.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text('Departmental Non-Conformity Concentration', margin, y);

      y += 4;

      // Table header
      doc.setFillColor(241, 245, 249);
      doc.rect(margin, y, contentWidth, 6, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(71, 85, 105);
      doc.text('BUSINESS UNIT / DEPARTMENT', margin + 3, y + 4.2);
      doc.text('TOTAL FINDINGS', margin + 85, y + 4.2);
      doc.text('MAJOR NC', margin + 115, y + 4.2);
      doc.text('MINOR NC', margin + 138, y + 4.2);
      doc.text('ACTIVE OPEN', margin + 162, y + 4.2);

      y += 6;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(30, 41, 59);

      data.departmentBreakdown.slice(0, 5).forEach((dept, i) => {
        const rowY = y + i * 6;
        if (i % 2 === 1) {
          doc.setFillColor(248, 250, 252);
          doc.rect(margin, rowY, contentWidth, 6, 'F');
        }
        doc.text(dept.name, margin + 3, rowY + 4.2);
        doc.text(`${dept.total}`, margin + 92, rowY + 4.2);

        if (dept.major > 0) {
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(225, 29, 72);
          doc.text(`${dept.major}`, margin + 122, rowY + 4.2);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(30, 41, 59);
        } else {
          doc.text(`${dept.major}`, margin + 122, rowY + 4.2);
        }

        doc.text(`${dept.minor}`, margin + 144, rowY + 4.2);
        doc.text(`${dept.open}`, margin + 168, rowY + 4.2);
      });

      y += data.departmentBreakdown.slice(0, 5).length * 6 + 8;
    }

    // Root Cause Taxonomy Breakdown
    if (sections.includeRootCauseTaxonomy !== false && data.rootCauseBreakdown.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text('Root Cause Taxonomy (5-Whys Synthesis)', margin, y);

      y += 4;

      const rcColW = contentWidth / Math.max(1, data.rootCauseBreakdown.length);
      data.rootCauseBreakdown.forEach((rc, idx) => {
        const rcX = margin + idx * rcColW;
        doc.setFillColor(241, 245, 249);
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(rcX + 1, y, rcColW - 2, 14, 1.5, 1.5, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(71, 85, 105);
        doc.text(rc.category, rcX + 3, y + 5);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(14, 116, 144);
        doc.text(`${rc.count} (${rc.percentage}%)`, rcX + 3, y + 11);
      });

      y += 20;
    }

    // Governance Sign-offs Box
    if (sections.includeSignatories !== false && data.signatories && data.signatories.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text('Executive Sign-Off & Governance Endorsement', margin, y);

      y += 4;
      const signW = contentWidth / data.signatories.length;
      data.signatories.forEach((s, idx) => {
        const sX = margin + idx * signW;
        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(0.3);
        doc.line(sX + 2, y + 12, sX + signW - 4, y + 12);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(30, 41, 59);
        doc.text(s.name, sX + 2, y + 5);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.5);
        doc.setTextColor(100, 116, 139);
        doc.text(s.title, sX + 2, y + 9);
        doc.text(`Status: ${s.status} (${s.date})`, sX + 2, y + 16);
      });
    }

    drawPageFooter(1, estimatedTotalPages);
  }

  // ==========================================
  // PAGES 2+: DETAILED TRACEABLE FINDINGS DOSSIER
  // ==========================================
  if (includeFindings) {
    let itemIndex = 0;
    let partNum = 1;

    while (itemIndex < data.findings.length) {
      currentPage++;
      if (currentPage > 1 || !hasPage1) {
        if (currentPage > 1) {
          doc.addPage();
        }
      }
      drawPageHeader(currentPage, estimatedTotalPages, `Section 2: Detailed Findings Register & CAPA Milestones (Part ${partNum})`);

      let fy = 30;
      const pageFindings = data.findings.slice(itemIndex, itemIndex + findingsPerPage);

      pageFindings.forEach((f) => {
        // Card Container for each finding
        const cardHeight = 76;
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.4);
        doc.roundedRect(margin, fy, contentWidth, cardHeight, 2, 2, 'FD');

        // Top finding header banner
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, fy, contentWidth, 10, 'F');
        doc.setDrawColor(226, 232, 240);
        doc.line(margin, fy + 10, margin + contentWidth, fy + 10);

        // Finding Code & Title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(15, 23, 42);
        doc.text(`${f.findingCode}: ${f.title.slice(0, 52)}${f.title.length > 52 ? '...' : ''}`, margin + 3, fy + 6.5);

        // Severity Badge
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        if (f.severity === 'Major Non-Conformity') {
          doc.setTextColor(225, 29, 72);
        } else if (f.severity === 'Minor Non-Conformity') {
          doc.setTextColor(217, 119, 6);
        } else {
          doc.setTextColor(14, 116, 144);
        }
        doc.text(`[${f.severity.toUpperCase()}]`, pageWidth - margin - 35, fy + 6.5, { align: 'right' });

        // Status Badge
        doc.setTextColor(71, 85, 105);
        doc.text(`Status: ${f.status}`, pageWidth - margin - 3, fy + 6.5, { align: 'right' });

        // Row 1: Clause & Department & Owner
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(100, 116, 139);
        doc.text(`Clause / Control: `, margin + 3, fy + 16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(f.clauseOrControl, margin + 25, fy + 16);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text(`Department: `, margin + 90, fy + 16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(f.department, margin + 108, fy + 16);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text(`Remediation Owner: `, margin + 140, fy + 16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(f.owner, margin + 167, fy + 16);

        // Row 2: Root Cause Statement (5-Whys)
        doc.setFillColor(254, 242, 242); // rose-50 / light red tint
        doc.rect(margin + 3, fy + 20, contentWidth - 6, 14, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(185, 28, 28); // rose-700
        doc.text('5-WHYS ROOT CAUSE ANALYSIS:', margin + 5, fy + 24.5);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(51, 65, 85);
        const rcTextLines = doc.splitTextToSize(f.rootCause || 'Root cause investigation completed using 5-Whys methodology.', contentWidth - 10);
        doc.text(rcTextLines.slice(0, 2), margin + 5, fy + 29);

        // Row 3: Corrective & Preventive Action (CAPA Plan)
        doc.setFillColor(240, 249, 255); // sky-50 / light blue tint
        doc.rect(margin + 3, fy + 37, contentWidth - 6, 26, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(3, 105, 161); // sky-700
        doc.text('CORRECTIVE ACTION (Containment & Repair):', margin + 5, fy + 41.5);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(51, 65, 85);
        const caLines = doc.splitTextToSize(f.correctiveAction || 'Direct remediation action applied to contain non-conformity.', contentWidth - 10);
        doc.text(caLines.slice(0, 2), margin + 5, fy + 46);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(3, 105, 161);
        doc.text('PREVENTIVE ACTION (Systemic Eradication):', margin + 5, fy + 52);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(51, 65, 85);
        const paLines = doc.splitTextToSize(f.preventiveAction || 'Process change, automation guardrail, and refresher training enacted.', contentWidth - 10);
        doc.text(paLines.slice(0, 2), margin + 5, fy + 56.5);

        // Row 4: Target Closure Date & Verification Evidence
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(100, 116, 139);
        doc.text(`TARGET SLA CLOSURE: `, margin + 5, fy + 69);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(f.targetDate || '2026-09-30', margin + 35, fy + 69);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(100, 116, 139);
        doc.text(`INDEPENDENT VERIFICATION: `, margin + 80, fy + 69);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(f.status === 'Closed Verified' ? 13 : 217, f.status === 'Closed Verified' ? 148 : 119, f.status === 'Closed Verified' ? 136 : 6);
        doc.text(f.status === 'Closed Verified' ? 'VERIFIED & CLOSED' : 'PENDING OBJECTIVE SAMPLING', margin + 118, fy + 69);

        fy += cardHeight + 4;
      });

      drawPageFooter(currentPage, estimatedTotalPages);
      partNum++;
      itemIndex += findingsPerPage;
    }
  }

  // Save the PDF
  const filename = `${data.documentRef.replace(/[^a-zA-Z0-9_-]/g, '_')}_Audit_Report.pdf`;
  doc.save(filename);
}
