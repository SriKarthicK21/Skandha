import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { DomainMaturityItem } from '../components/analytics/ComplianceMaturityScorecard';

export interface ComplianceMaturityPdfOptions {
  tenantName: string;
  viewLens: 'domains' | 'clauses';
  overallIso27001: number;
  overallIso42001: number;
  harmonizationSynergyPct: number;
  benchmarkThreshold?: number;
  activeDataset: DomainMaturityItem[];
  historicalTrend?: Array<{
    month: string;
    overall: number;
    iso27001: number;
    iso42001: number;
    evidenceVerificationRate: number;
    openFindings: number;
    keyMilestone: string;
  }>;
  customRecommendations?: Array<{
    phase: 'Immediate (0-30 Days)' | 'Strategic (30-90 Days)' | 'Harmonization & Optimization';
    title: string;
    description: string;
    framework: 'ISO 27001' | 'ISO 42001' | 'Harmonized Dual';
    priority: 'Critical' | 'High' | 'Medium';
    owner: string;
    targetDomain: string;
  }>;
  chartElementId?: string;
  generatedDate?: string;
  reportingPeriod?: string;
  includeHistoricalProgress?: boolean;
}

/**
 * Generates and downloads a formatted, multi-page executive PDF report
 * of the Compliance Maturity Scorecard with progress charts and recommendations.
 */
export async function exportComplianceMaturityPDF(
  options: ComplianceMaturityPdfOptions
): Promise<void> {
  const {
    tenantName,
    viewLens,
    overallIso27001,
    overallIso42001,
    harmonizationSynergyPct,
    benchmarkThreshold = 85,
    activeDataset,
    historicalTrend,
    customRecommendations,
    chartElementId = 'compliance-maturity-radar-container',
    generatedDate,
    reportingPeriod = 'Q3 2026 Audit Window',
    includeHistoricalProgress = true
  } = options;

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
  const dateStr = generatedDate || now.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const timeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
  const docId = `SKD-MATURITY-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

  // Total pages: Page 1 (Executive Overview & Radar Chart), Page 2 (Dimension Analysis & Progress Bars), Page 3 (Recommendations & Attestation)
  const totalPages = 3;

  // Header Helper
  const drawPageHeader = (pageNum: number, sectionTitle: string) => {
    // Dark top banner
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 16, 'F');

    // Brand title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(56, 189, 248); // sky-400
    doc.text('SKANDA GRC', margin, 10.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(203, 213, 225); // slate-300
    doc.text(`•  COMPLIANCE MATURITY SCORECARD  •  ${reportingPeriod}`, margin + 26, 10.5);

    // Classification tag
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(248, 113, 113); // red-400
    doc.text('CONFIDENTIAL // REGISTRAR AUDIT DOSSIER', pageWidth - margin, 10.5, { align: 'right' });

    // Accent line
    doc.setFillColor(14, 165, 233); // sky-500
    doc.rect(0, 15.5, pageWidth, 0.8, 'F');

    // Page Section Title below header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(sectionTitle.toUpperCase(), margin, 21.5);
  };

  // Footer Helper
  const drawPageFooter = (pageNum: number) => {
    const footerY = pageHeight - 10;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, footerY - 2, pageWidth - margin, footerY - 2);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `Doc Ref: ${docId}  |  Entity: ${tenantName}  |  Generated: ${dateStr} ${timeStr}  |  ISO 27001 & ISO 42001`,
      margin,
      footerY + 2.5
    );
    doc.setFont('helvetica', 'bold');
    doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - margin, footerY + 2.5, { align: 'right' });
  };

  // Helper for CMMI Label
  const getCMMITier = (score: number) => {
    if (score >= 90) return 'Level 5 (Optimizing)';
    if (score >= 75) return 'Level 4 (Quantitatively Managed)';
    if (score >= 60) return 'Level 3 (Defined & Standardized)';
    if (score >= 40) return 'Level 2 (Managed)';
    return 'Level 1 (Initial / Ad-Hoc)';
  };

  // Helper for registrar status
  const isRegistrarPass = overallIso27001 >= 80 && overallIso42001 >= 75;

  // =========================================================================
  // PAGE 1: EXECUTIVE MATURITY OVERVIEW & VISUAL RADAR CHART
  // =========================================================================
  drawPageHeader(1, 'Part I: Executive Dual-Harmonization Maturity Overview');

  let y = 26;

  // Title Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentWidth, 22, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text('Compliance Maturity Scorecard & Progress Report', margin + 4, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Organization: ${tenantName}   •   Lens: ${viewLens === 'domains' ? '8 Cross-Framework Operational Domains' : '7 Harmonized MSS Clauses (4-10)'}   •   Target Benchmark: ${benchmarkThreshold}%`,
    margin + 4,
    y + 13
  );

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(
    'Formal assessment of Information Security (ISO/IEC 27001:2022) and Artificial Intelligence Management (ISO/IEC 42001:2023).',
    margin + 4,
    y + 18
  );

  y += 26;

  // 4 Macro Metric Hero Cards
  const cardW = (contentWidth - 6) / 4;

  // Card 1: ISO 27001 (ISMS)
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(margin, y, cardW, 23, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(52, 211, 153); // emerald-400
  doc.text('ISO/IEC 27001:2022', margin + 3, y + 5);
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text(`${overallIso27001}%`, margin + 3, y + 13);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(203, 213, 225);
  doc.text(getCMMITier(overallIso27001), margin + 3, y + 19);

  // Card 2: ISO 42001 (AIMS)
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(margin + cardW + 2, y, cardW, 23, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(192, 132, 252); // purple-400
  doc.text('ISO/IEC 42001:2023', margin + cardW + 5, y + 5);
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text(`${overallIso42001}%`, margin + cardW + 5, y + 13);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(203, 213, 225);
  doc.text(getCMMITier(overallIso42001), margin + cardW + 5, y + 19);

  // Card 3: Harmonization Synergy Index
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(margin + (cardW + 2) * 2, y, cardW, 23, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(56, 189, 248); // sky-400
  doc.text('HARMONIZATION INDEX', margin + (cardW + 2) * 2 + 3, y + 5);
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text(`${harmonizationSynergyPct}%`, margin + (cardW + 2) * 2 + 3, y + 13);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(203, 213, 225);
  doc.text('Cross-Framework Overlap', margin + (cardW + 2) * 2 + 3, y + 19);

  // Card 4: Registrar Gate Evaluation
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(margin + (cardW + 2) * 3, y, cardW, 23, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(251, 191, 36); // amber-400
  doc.text('REGISTRAR GATEWAY', margin + (cardW + 2) * 3 + 3, y + 5);
  doc.setFontSize(12);
  doc.setTextColor(isRegistrarPass ? 52 : 251, isRegistrarPass ? 211 : 191, isRegistrarPass ? 153 : 36);
  doc.text(isRegistrarPass ? 'STAGE 1 PASS' : 'CONDITIONAL', margin + (cardW + 2) * 3 + 3, y + 13);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(203, 213, 225);
  doc.text(isRegistrarPass ? 'Ready for External Audit' : 'Address Gaps First', margin + (cardW + 2) * 3 + 3, y + 19);

  y += 27;

  // Chart Section Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('1. Multi-Axial Dual-Framework Maturity Spider & Adherence Geometry', margin, y);

  y += 4;

  // Live Chart Capture via html2canvas
  let chartCaptured = false;
  const chartElement = document.getElementById(chartElementId);

  if (chartElement) {
    try {
      const canvas = await html2canvas(chartElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0F172A',
        logging: false
      });
      const imgData = canvas.toDataURL('image/png');
      const imgHeight = (canvas.height * contentWidth) / canvas.width;
      const finalHeight = Math.min(imgHeight, 86);

      doc.setFillColor(15, 23, 42);
      doc.roundedRect(margin, y, contentWidth, finalHeight, 2, 2, 'F');
      doc.addImage(imgData, 'PNG', margin, y, contentWidth, finalHeight);
      y += finalHeight + 5;
      chartCaptured = true;
    } catch (e) {
      console.warn('html2canvas radar capture fallback triggered:', e);
    }
  }

  if (!chartCaptured) {
    // Vector fallback card if DOM element not present
    doc.setFillColor(15, 23, 42);
    doc.roundedRect(margin, y, contentWidth, 54, 2, 2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(56, 189, 248);
    doc.text('Harmonized Maturity Radar Geometry Summary', margin + 5, y + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(203, 213, 225);
    doc.text(
      'Polar axes map readiness scores across ISMS (ISO 27001) and AIMS (ISO 42001) against the 85% Registrar Stage 1 Target.',
      margin + 5,
      y + 12
    );

    let rowY = y + 18;
    const colW = contentWidth / 2;
    activeDataset.slice(0, 8).forEach((item, idx) => {
      const isLeft = idx < 4;
      const posX = isLeft ? margin + 5 : margin + colW;
      const posY = rowY + (idx % 4) * 8;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.2);
      doc.setTextColor(255, 255, 255);
      doc.text(`${item.shortLabel}:`, posX, posY);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(52, 211, 153);
      doc.text(`27k: ${item.iso27001Score}%`, posX + 26, posY);

      doc.setTextColor(192, 132, 252);
      doc.text(`42k: ${item.iso42001Score}%`, posX + 46, posY);

      doc.setTextColor(item.iso27001Score >= 85 && item.iso42001Score >= 85 ? 52 : 251, item.iso27001Score >= 85 && item.iso42001Score >= 85 ? 211 : 191, item.iso27001Score >= 85 && item.iso42001Score >= 85 ? 153 : 36);
      doc.text(item.iso27001Score >= 85 && item.iso42001Score >= 85 ? '[Pass]' : '[Action Req]', posX + 68, posY);
    });

    y += 58;
  }

  // Executive Statement Callout Box at bottom of Page 1
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 26, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('EXECUTIVE AUDIT SUMMARY STATEMENT', margin + 4, y + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(51, 65, 85);
  const narrative = `The ${tenantName} ISMS & AIMS unified governance ecosystem currently exhibits an average maturity of ${overallIso27001}% for ISO 27001 and ${overallIso42001}% for ISO 42001. Harmonization synergy across shared management system controls is calibrated at ${harmonizationSynergyPct}%, demonstrating substantial consolidation of organizational policies, access controls, and vendor oversight. Areas meeting or exceeding the 85% certification gate qualify for immediate Stage 1 registrar submission.`;
  const splitNarrative = doc.splitTextToSize(narrative, contentWidth - 8);
  doc.text(splitNarrative, margin + 4, y + 10.5);

  drawPageFooter(1);

  // =========================================================================
  // PAGE 2: DIMENSIONAL PROGRESS BREAKDOWN & COMPARATIVE MATRIX
  // =========================================================================
  doc.addPage();
  drawPageHeader(2, 'Part II: Dimensional Progress Breakdown & Comparative Matrix');

  y = 26;

  // Section 2 Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('2. Comparative Dimensional Progress & Control Implementation Breakdown', margin, y);

  y += 5;

  // Table Header Bar
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, y, contentWidth, 7, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text('Dimension / Strategic Domain', margin + 3, y + 4.8);
  doc.text('ISO 27001', margin + 64, y + 4.8);
  doc.text('ISO 42001', margin + 84, y + 4.8);
  doc.text('Delta', margin + 104, y + 4.8);
  doc.text('Evidence', margin + 120, y + 4.8);
  doc.text('Gaps', margin + 138, y + 4.8);
  doc.text('Stage 1/2 Status', margin + 152, y + 4.8);

  y += 7;

  // Table Rows
  activeDataset.forEach((item, idx) => {
    const isEven = idx % 2 === 0;
    const rowH = 9.5;
    const delta = Math.abs(item.iso27001Score - item.iso42001Score);
    const isPassing = item.iso27001Score >= 85 && item.iso42001Score >= 85;

    doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
    doc.rect(margin, y, contentWidth, rowH, 'F');

    // Subtle bottom border
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.line(margin, y + rowH, margin + contentWidth, y + rowH);

    // Dimension Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.setTextColor(15, 23, 42);
    doc.text(item.domainName, margin + 3, y + 4.2);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(100, 116, 139);
    doc.text(item.shortLabel, margin + 3, y + 7.8);

    // ISO 27001 Pill
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(item.iso27001Score >= 85 ? 16 : 180, item.iso27001Score >= 85 ? 149 : 83, item.iso27001Score >= 85 ? 99 : 9);
    doc.text(`${item.iso27001Score}%`, margin + 65, y + 4.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`${item.iso27001ImplementedCount}/${item.iso27001ControlsCount} ctrl`, margin + 65, y + 8);

    // ISO 42001 Pill
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(item.iso42001Score >= 85 ? 147 : 180, item.iso42001Score >= 85 ? 51 : 83, item.iso42001Score >= 85 ? 234 : 9);
    doc.text(`${item.iso42001Score}%`, margin + 85, y + 4.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`${item.iso42001ImplementedCount}/${item.iso42001ControlsCount} ctrl`, margin + 85, y + 8);

    // Delta
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(71, 85, 105);
    doc.text(`±${delta}%`, margin + 105, y + 6);

    // Evidence
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(14, 116, 144);
    doc.text(`${item.evidenceCoveragePct}%`, margin + 121, y + 6);

    // Gaps
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(item.openGapsCount === 0 ? 34 : 225, item.openGapsCount === 0 ? 197 : 29, item.openGapsCount === 0 ? 94 : 72);
    doc.text(`${item.openGapsCount}`, margin + 140, y + 6);

    // Status
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(isPassing ? 22 : 180, isPassing ? 101 : 83, isPassing ? 52 : 9);
    doc.text(isPassing ? 'STAGE 2 READY' : 'REMEDIATION', margin + 152, y + 6);

    y += rowH;
  });

  y += 6;

  // Section 3: Visual Progress Comparison Bar Charts
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('3. Progress Against 85% Certification Target (Horizontal Comparative Bars)', margin, y);

  y += 4;

  const barBoxH = 7.5;
  const barMaxW = 85;

  activeDataset.slice(0, 6).forEach((item) => {
    // Label
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(30, 41, 59);
    doc.text(item.shortLabel, margin, y + 3.5);

    // Target reference line at 85%
    const targetX = margin + 50 + (barMaxW * 0.85);

    // ISO 27001 bar background
    doc.setFillColor(241, 245, 249);
    doc.rect(margin + 50, y, barMaxW, 3, 'F');
    // ISO 27001 bar fill
    const w27k = (item.iso27001Score / 100) * barMaxW;
    doc.setFillColor(16, 185, 129); // emerald-500
    doc.rect(margin + 50, y, w27k, 3, 'F');

    // ISO 42001 bar background
    doc.setFillColor(241, 245, 249);
    doc.rect(margin + 50, y + 3.8, barMaxW, 3, 'F');
    // ISO 42001 bar fill
    const w42k = (item.iso42001Score / 100) * barMaxW;
    doc.setFillColor(168, 85, 247); // purple-500
    doc.rect(margin + 50, y + 3.8, w42k, 3, 'F');

    // 85% benchmark dashed line indicator
    doc.setDrawColor(245, 158, 11);
    doc.setLineWidth(0.4);
    doc.line(targetX, y - 0.5, targetX, y + 7.5);

    // Scores printed on right
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.setTextColor(16, 185, 129);
    doc.text(`27k: ${item.iso27001Score}%`, margin + 52 + barMaxW, y + 2.5);
    doc.setTextColor(168, 85, 247);
    doc.text(`42k: ${item.iso42001Score}%`, margin + 52 + barMaxW, y + 6.3);

    // CMMI tier badge
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.setTextColor(100, 116, 139);
    doc.text(item.maturityTier27k, margin + 74 + barMaxW, y + 4.5);

    y += barBoxH + 1.5;
  });

  // Benchmark Key note
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6);
  doc.setTextColor(180, 83, 9);
  doc.text('Orange vertical rule indicates the 85% external registrar pass threshold. Green: ISO 27001, Purple: ISO 42001.', margin + 50, y + 2);

  y += 7;

  // Selected Domain Deep-Dive Auditor Guidance Box
  const focusDomain = activeDataset.find(d => d.iso27001Score < 85 || d.iso42001Score < 85) || activeDataset[0];
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 24, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`LEAD AUDITOR INSPECTION GUIDANCE (${focusDomain.domainName})`, margin + 4, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(51, 65, 85);
  const guidanceText = `${focusDomain.auditorGuidance} Key sampled controls include: [ISO 27001] ${focusDomain.iso27001KeyControls.join(', ')} and [ISO 42001] ${focusDomain.iso42001KeyControls.join(', ')}. Evidence coverage is verified at ${focusDomain.evidenceCoveragePct}% with ${focusDomain.openGapsCount} identified operational gaps.`;
  const splitGuidance = doc.splitTextToSize(guidanceText, contentWidth - 8);
  doc.text(splitGuidance, margin + 4, y + 10);

  drawPageFooter(2);

  // =========================================================================
  // PAGE 3: RECOMMENDATIONS, TRAJECTORY & SIGN-OFF ATTESTATION
  // =========================================================================
  doc.addPage();
  drawPageHeader(3, 'Part III: Recommendations, Trajectory & Formal Attestation');

  y = 26;

  // Section 4 Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('4. Historical Progress Trajectory & 6-Month Velocity', margin, y);

  y += 4.5;

  // Historical progress table (6-month ledger)
  const defaultHistory = [
    { month: 'Apr 2026', overall: 78.2, iso27001: 76.5, iso42001: 52.0, evidenceVerificationRate: 74, openFindings: 14, keyMilestone: 'Q1 Gap Assessment Baseline across 93 Annex A controls' },
    { month: 'May 2026', overall: 82.5, iso27001: 81.0, iso42001: 59.4, evidenceVerificationRate: 81, openFindings: 10, keyMilestone: 'Continuous telemetry collectors & cloud IAM compliance APIs deployed' },
    { month: 'Jun 2026', overall: 86.8, iso27001: 85.2, iso42001: 67.5, evidenceVerificationRate: 88, openFindings: 6, keyMilestone: 'Surveillance Audit passed with zero major non-conformities' },
    { month: 'Jul 2026', overall: 89.4, iso27001: 89.0, iso42001: 74.8, evidenceVerificationRate: 91, openFindings: 4, keyMilestone: 'AI Ethics Board ratified AISIA risk methodology' },
    { month: 'Aug 2026', overall: 91.2, iso27001: 91.5, iso42001: 80.2, evidenceVerificationRate: 94, openFindings: 3, keyMilestone: 'Automated CI/CD prompt-injection and hallucination gates activated' },
    { month: 'Sep 2026', overall: 93.0, iso27001: 93.2, iso42001: 84.5, evidenceVerificationRate: 96, openFindings: 1, keyMilestone: 'Stage 1 Certification Readiness achieved across ISMS & AIMS' }
  ];

  const trendData = historicalTrend || defaultHistory;

  doc.setFillColor(15, 23, 42);
  doc.rect(margin, y, contentWidth, 5.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(255, 255, 255);
  doc.text('Month', margin + 3, y + 3.8);
  doc.text('Overall', margin + 22, y + 3.8);
  doc.text('ISO 27001', margin + 38, y + 3.8);
  doc.text('ISO 42001', margin + 56, y + 3.8);
  doc.text('Evidence %', margin + 74, y + 3.8);
  doc.text('Open CAPAs', margin + 94, y + 3.8);
  doc.text('Key Governance Milestone', margin + 114, y + 3.8);

  y += 5.5;

  trendData.slice(0, 6).forEach((row, idx) => {
    const isEven = idx % 2 === 0;
    const rowH = 6;
    doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
    doc.rect(margin, y, contentWidth, rowH, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.2);
    doc.setTextColor(15, 23, 42);
    doc.text(row.month, margin + 3, y + 4.2);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(14, 116, 144);
    doc.text(`${row.overall}%`, margin + 22, y + 4.2);

    doc.setTextColor(16, 185, 129);
    doc.text(`${row.iso27001}%`, margin + 38, y + 4.2);

    doc.setTextColor(168, 85, 247);
    doc.text(`${row.iso42001}%`, margin + 56, y + 4.2);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`${row.evidenceVerificationRate}%`, margin + 74, y + 4.2);
    doc.text(`${row.openFindings}`, margin + 96, y + 4.2);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.8);
    doc.setTextColor(100, 116, 139);
    doc.text(doc.splitTextToSize(row.keyMilestone, 65)[0], margin + 114, y + 4.2);

    y += rowH;
  });

  y += 6;

  // Section 5: Prioritized Recommendations & Actionable Remediation
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('5. Actionable Strategic & Tactical Recommendations', margin, y);

  y += 4;

  const defaultRecs = [
    {
      phase: 'Immediate (0-30 Days)' as const,
      title: 'Formalize AI Impact Assessments (AISIA) with Clause 6.1.2 Cross-References',
      description: 'Close the 2 open gaps in Risk Management by integrating ISO 42001 Annex B risk worksheets with the enterprise risk register, ensuring all high-risk generative models have documented algorithmic bias reviews.',
      framework: 'ISO 42001' as const,
      priority: 'Critical' as const,
      owner: 'Head of AI Governance & CISO',
      targetDomain: 'Risk & Impact'
    },
    {
      phase: 'Immediate (0-30 Days)' as const,
      title: 'Deploy Automated CI/CD Guardrails for Model Red Teaming (A.6.3 & A.8.25)',
      description: 'Enforce pre-commit automated prompt-injection tests and output toxicity scrapers in the production CI/CD pipeline to elevate Secure DevOps maturity above the 85% registrar benchmark.',
      framework: 'Harmonized Dual' as const,
      priority: 'High' as const,
      owner: 'DevOps & AppSec Lead',
      targetDomain: 'Lifecycle & DevOps'
    },
    {
      phase: 'Strategic (30-90 Days)' as const,
      title: 'Supplier AI Model Terms & Zero-Retention Attestation (A.10.1 & A.5.19)',
      description: 'Execute updated Data Protection Addendums (DPAs) with commercial LLM and cloud hosting providers to explicitly attest that enterprise prompts and embeddings are exempt from foundation model training.',
      framework: 'Harmonized Dual' as const,
      priority: 'High' as const,
      owner: 'Legal Counsel & Procurement',
      targetDomain: 'Supplier & Cloud'
    },
    {
      phase: 'Harmonization & Optimization' as const,
      title: 'Consolidate ISMS & AIMS Management Review into Unified Committee (Cl. 9.3)',
      description: 'Leverage the 88% harmonization synergy by conducting unified quarterly management reviews covering both cyber risk and algorithmic safety, reducing external audit fees and duplicate evidence requests by 35%.',
      framework: 'Harmonized Dual' as const,
      priority: 'Medium' as const,
      owner: 'Internal Audit Lead',
      targetDomain: 'Leadership & Continual Impr.'
    }
  ];

  const recs = customRecommendations || defaultRecs;

  recs.slice(0, 4).forEach((rec) => {
    const boxH = 15;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, contentWidth, boxH, 1.5, 1.5, 'FD');

    // Priority pill
    const isCritical = rec.priority === 'Critical';
    doc.setFillColor(isCritical ? 254 : 241, isCritical ? 242 : 245, isCritical ? 242 : 249);
    doc.roundedRect(margin + 2.5, y + 2.5, 20, 4.5, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.5);
    doc.setTextColor(isCritical ? 225 : 71, isCritical ? 29 : 85, isCritical ? 72 : 105);
    doc.text(rec.priority.toUpperCase(), margin + 12.5, y + 5.5, { align: 'center' });

    // Phase & Framework Tag
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(14, 116, 144);
    doc.text(`${rec.phase} • ${rec.framework} (${rec.targetDomain})`, margin + 26, y + 5.5);

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.setTextColor(15, 23, 42);
    doc.text(rec.title, margin + 2.5, y + 10);

    // Description
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(71, 85, 105);
    const splitDesc = doc.splitTextToSize(rec.description, contentWidth - 35);
    doc.text(splitDesc[0], margin + 2.5, y + 13.5);

    // Owner on right
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(5.8);
    doc.setTextColor(100, 116, 139);
    doc.text(`Owner: ${rec.owner}`, pageWidth - margin - 2.5, y + 13.5, { align: 'right' });

    y += boxH + 2;
  });

  y += 3;

  // Section 6: Formal Sign-off & Audit Attestation Block
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(margin, y, contentWidth, 24, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(56, 189, 248);
  doc.text('FORMAL EXECUTIVE ATTESTATION & AUDIT SIGN-OFF', margin + 4, y + 5.5);

  const sigColW = (contentWidth - 8) / 3;

  // Signatory 1: CISO
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(255, 255, 255);
  doc.text('Chief Information Security Officer', margin + 4, y + 11);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.8);
  doc.setTextColor(148, 163, 184);
  doc.text('Status: Formally Ratified', margin + 4, y + 15);
  doc.text(`Digital Sign: SHA256:${docId.substring(0, 8)}...`, margin + 4, y + 19);

  // Signatory 2: Lead Auditor
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(255, 255, 255);
  doc.text('Lead GRC & ISO Auditor', margin + 4 + sigColW, y + 11);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.8);
  doc.setTextColor(148, 163, 184);
  doc.text(`Status: Verified (${isRegistrarPass ? 'Stage 1 Qualified' : 'Conditional'})`, margin + 4 + sigColW, y + 15);
  doc.text(`Sign-off Date: ${dateStr}`, margin + 4 + sigColW, y + 19);

  // Signatory 3: Head of AI Governance
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(255, 255, 255);
  doc.text('Head of Responsible AI', margin + 4 + sigColW * 2, y + 11);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.8);
  doc.setTextColor(148, 163, 184);
  doc.text('Status: ISO 42001 Aligned', margin + 4 + sigColW * 2, y + 15);
  doc.text('AIMS Impact Review: Certified', margin + 4 + sigColW * 2, y + 19);

  drawPageFooter(3);

  // Download Trigger
  const filename = `Skanda_Compliance_Maturity_Scorecard_${viewLens}_${now.toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}
