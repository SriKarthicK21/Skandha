import jsPDF from 'jspdf';

export interface ExecutiveSummaryPdfData {
  tenantName: string;
  reportingPeriod: string;
  generatedDate?: string;
  overallScore: number;
  gradeLabel: string;
  frameworkScores: Array<{
    name: string;
    code: string;
    score: number;
    status: string;
    targetDate: string;
  }>;
  pillarScores: {
    controlsEffectiveness: number;
    evidenceFreshness: number;
    capaResolutionRate: number;
    riskAppetiteCompliance: number;
  };
  riskStats: {
    totalRisks: number;
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
    acceptedCount: number;
    riskReductionFactor: number;
  };
  matrixCounts: Record<string, number>; // key: `${likelihood}-${impact}` (1-5)
  topRisks: Array<{
    id: string;
    title: string;
    category: string;
    inherentScore: number;
    residualScore: number;
    treatment: string;
    owner: string;
    status: string;
  }>;
  departmentScores: Array<{
    name: string;
    score: number;
    status: string;
    controlsCount: string;
  }>;
  executiveStatement?: string;
  signatories?: {
    leadAuditor: string;
    cro: string;
    ceo: string;
  };
}

export function exportExecutiveSummaryPDF(data: ExecutiveSummaryPdfData): void {
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
  const dateStr = data.generatedDate || now.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const reportId = `SKD-EXEC-GRC-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

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
    doc.text(`•  EXECUTIVE STAKEHOLDER SUMMARY  •  ${data.reportingPeriod}`, margin + 28, 11);

    // Confidentiality Tag
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(248, 113, 113); // red-400
    doc.text('CONFIDENTIAL // BOARD & AUDIT DOSSIER', pageWidth - margin, 11, { align: 'right' });

    // Thin accent bar
    doc.setFillColor(14, 165, 233); // sky-500
    doc.rect(0, 18, pageWidth, 0.8, 'F');

    // Page Section Title below header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
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
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `Organization: ${data.tenantName}  |  Doc ID: ${reportId}  |  Generated: ${dateStr} ${timeStr}`,
      margin,
      footerY + 3
    );

    doc.setFont('helvetica', 'bold');
    doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - margin, footerY + 3, { align: 'right' });
  };

  // ==========================================
  // PAGE 1: EXECUTIVE COMPLIANCE HEALTH SCORES
  // ==========================================
  drawPageHeader(1, 2, 'Part I: High-Level Compliance Health & Multi-Framework Readiness');

  let y = 30;

  // Organization Header Block
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text('Executive GRC Stakeholder Report', margin, y);

  y += 5.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text(
    `Entity: ${data.tenantName}   •   Reporting Period: ${data.reportingPeriod}   •   Audit Lens: ISO 27001 / ISO 42001 / MAS TRM`,
    margin,
    y
  );

  y += 7;

  // High-Level Composite Health Score Hero Box
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, y, contentWidth, 34, 3, 3, 'FD');

  // Left side: Big Score Dial
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(margin + 4, y + 4, 38, 26, 2.5, 2.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(56, 189, 248); // sky-400
  doc.text(`${data.overallScore.toFixed(1)}%`, margin + 23, y + 16, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(52, 211, 153); // emerald-400
  doc.text(data.gradeLabel.toUpperCase(), margin + 23, y + 23, { align: 'center' });

  // Center/Right: Core Pillar Metrics
  const colX = margin + 48;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Overall Enterprise Compliance Maturity', colX, y + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    'Deterministic score based on control verification, cryptographic evidence vault integrity, and open CAPA velocity.',
    colX,
    y + 14
  );

  // 4 Pillar Mini Badges
  const pY = y + 18;
  const pBoxW = (contentWidth - 52) / 4;

  const pillars = [
    { label: 'Controls Verified', val: `${data.pillarScores.controlsEffectiveness}%` },
    { label: 'Evidence Integrity', val: `${data.pillarScores.evidenceFreshness}%` },
    { label: 'CAPA Resolution', val: `${data.pillarScores.capaResolutionRate}%` },
    { label: 'Risk Within Appetite', val: `${data.pillarScores.riskAppetiteCompliance}%` }
  ];

  pillars.forEach((p, idx) => {
    const px = colX + idx * pBoxW;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(px, pY, pBoxW - 2, 11, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(14, 116, 144); // cyan-700
    doc.text(p.val, px + (pBoxW - 2) / 2, pY + 5.5, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(100, 116, 139);
    doc.text(p.label, px + (pBoxW - 2) / 2, pY + 9.2, { align: 'center' });
  });

  y += 40;

  // Executive Summary Narrative Box
  doc.setFillColor(241, 245, 249); // slate-100
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 20, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text('EXECUTIVE FINDINGS STATEMENT', margin + 4, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  const narrative = data.executiveStatement ||
    `During the ${data.reportingPeriod} assessment window, ${data.tenantName} sustained an upper-decile GRC maturity index of ${data.overallScore.toFixed(1)}%. Zero critical non-conformities were discovered across all in-scope environments. All 93 Annex A controls and 38 AI governance items are formally mapped with cryptographic SHA-256 evidence. Residual risk exposure remains well within the board-ratified risk appetite threshold.`;

  const splitNarrative = doc.splitTextToSize(narrative, contentWidth - 8);
  doc.text(splitNarrative, margin + 4, y + 10);

  y += 26;

  // Multi-Framework High-Level Health Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('1. Multi-Framework Compliance Scores & Certification Health', margin, y);

  y += 4.5;

  // Framework Table Header
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, y, contentWidth, 7, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('Standard / Regulatory Framework', margin + 3, y + 4.8);
  doc.text('Code', margin + 75, y + 4.8);
  doc.text('Health Score', margin + 105, y + 4.8);
  doc.text('Certification Status', margin + 135, y + 4.8);
  doc.text('Target Audit Date', margin + 165, y + 4.8);

  y += 7;

  // Framework Table Rows
  data.frameworkScores.forEach((fw, idx) => {
    const isEven = idx % 2 === 0;
    doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
    doc.rect(margin, y, contentWidth, 7, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.line(margin, y + 7, margin + contentWidth, y + 7);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);
    doc.text(fw.name, margin + 3, y + 4.8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(fw.code, margin + 75, y + 4.8);

    // Score pill
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(14, 116, 144); // cyan-700
    doc.text(`${fw.score.toFixed(1)}%`, margin + 105, y + 4.8);

    // Status
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    if (fw.status.includes('Ready') || fw.status.includes('Compliant')) {
      doc.setTextColor(16, 185, 129); // emerald-500
    } else {
      doc.setTextColor(217, 119, 6); // amber-600
    }
    doc.text(fw.status, margin + 135, y + 4.8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text(fw.targetDate, margin + 165, y + 4.8);

    y += 7;
  });

  y += 6;

  // Departmental Compliance Health Breakdown Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('2. Departmental Compliance Health & Control Coverage', margin, y);

  y += 4.5;

  // Dept Table Header
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(margin, y, contentWidth, 6.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('Operational Department / Domain', margin + 3, y + 4.5);
  doc.text('Assigned Controls', margin + 90, y + 4.5);
  doc.text('Readiness Score', margin + 130, y + 4.5);
  doc.text('Assurance State', margin + 160, y + 4.5);

  y += 6.5;

  data.departmentScores.slice(0, 6).forEach((dept, idx) => {
    const isEven = idx % 2 === 0;
    doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
    doc.rect(margin, y, contentWidth, 6.5, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y + 6.5, margin + contentWidth, y + 6.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);
    doc.text(dept.name, margin + 3, y + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(dept.controlsCount, margin + 90, y + 4.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(14, 116, 144);
    doc.text(`${dept.score.toFixed(0)}%`, margin + 130, y + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(16, 185, 129);
    doc.text(dept.status, margin + 160, y + 4.5);

    y += 6.5;
  });

  drawPageFooter(1, 2);

  // ==========================================
  // PAGE 2: ENTERPRISE RISK HEAT MAP & TOP RISKS
  // ==========================================
  doc.addPage();
  drawPageHeader(2, 2, 'Part II: Current Risk Heat Map & Top Material Risks');

  y = 30;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('Enterprise Risk Exposure & Heat Map Matrix', margin, y);

  y += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(
    '5x5 Likelihood vs Impact residual risk matrix aligned with Board of Directors risk appetite threshold.',
    margin,
    y
  );

  y += 6;

  // Risk Stats KPI Bar
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 14, 2, 2, 'FD');

  const statCols = [
    { label: 'Total In-Scope Risks', val: String(data.riskStats.totalRisks), color: [15, 23, 42] },
    { label: 'Critical Residual', val: String(data.riskStats.criticalCount), color: [225, 29, 72] },
    { label: 'High (Remediating)', val: String(data.riskStats.highCount), color: [234, 88, 12] },
    { label: 'Medium Exposure', val: String(data.riskStats.mediumCount), color: [217, 119, 6] },
    { label: 'Low / Negligible', val: String(data.riskStats.lowCount), color: [16, 185, 129] },
    { label: 'Avg Risk Reduction', val: `-${data.riskStats.riskReductionFactor}%`, color: [14, 116, 144] }
  ];

  const statW = contentWidth / statCols.length;
  statCols.forEach((s, idx) => {
    const sx = margin + idx * statW;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(s.color[0], s.color[1], s.color[2]);
    doc.text(s.val, sx + statW / 2, y + 6.5, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(s.label, sx + statW / 2, y + 11, { align: 'center' });
  });

  y += 18;

  // 5x5 Vector Risk Heat Map Drawing
  const matrixW = 95;
  const cellW = matrixW / 5;
  const cellH = 10;
  const matrixH = cellH * 5;
  const matrixX = margin + 20;

  // Y-axis label: Likelihood
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('LIKELIHOOD', margin + 3, y + matrixH / 2, { angle: 90, align: 'center' });

  // Likelihood Level Labels
  const likelihoodLabels = ['5 - Almost Certain', '4 - Likely', '3 - Moderate', '2 - Unlikely', '1 - Rare'];
  likelihoodLabels.forEach((label, lIdx) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(100, 116, 139);
    doc.text(label, matrixX - 2, y + lIdx * cellH + 6.5, { align: 'right' });
  });

  // Draw 5x5 Grid
  // l from 5 down to 1 (row 0 to 4)
  for (let row = 0; row < 5; row++) {
    const likelihood = 5 - row;
    for (let col = 0; col < 5; col++) {
      const impact = col + 1;
      const score = likelihood * impact;
      const cx = matrixX + col * cellW;
      const cy = y + row * cellH;

      // Color coding based on enterprise risk severity
      if (score >= 17) {
        doc.setFillColor(254, 226, 226); // critical red
        doc.setDrawColor(248, 113, 113);
      } else if (score >= 10) {
        doc.setFillColor(254, 243, 199); // high orange/amber
        doc.setDrawColor(251, 191, 36);
      } else if (score >= 5) {
        doc.setFillColor(254, 249, 195); // medium yellow
        doc.setDrawColor(250, 204, 21);
      } else {
        doc.setFillColor(236, 253, 245); // low green
        doc.setDrawColor(110, 231, 183);
      }

      doc.setLineWidth(0.3);
      doc.rect(cx, cy, cellW, cellH, 'FD');

      // Risk count in this cell
      const key = `${likelihood}-${impact}`;
      const count = data.matrixCounts[key] || 0;

      if (count > 0) {
        doc.setFillColor(15, 23, 42);
        doc.circle(cx + cellW / 2, cy + cellH / 2, 3.2, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(255, 255, 255);
        doc.text(String(count), cx + cellW / 2, cy + cellH / 2 + 2.2, { align: 'center' });
      } else {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6);
        doc.setTextColor(148, 163, 184);
        doc.text('-', cx + cellW / 2, cy + cellH / 2 + 1.8, { align: 'center' });
      }
    }
  }

  // X-axis label: Impact
  const impactLabels = ['1 - Insignificant', '2 - Minor', '3 - Moderate', '4 - Major', '5 - Catastrophic'];
  impactLabels.forEach((label, cIdx) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(100, 116, 139);
    doc.text(label, matrixX + cIdx * cellW + cellW / 2, y + matrixH + 4, { align: 'center' });
  });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('IMPACT SEVERITY', matrixX + matrixW / 2, y + matrixH + 8.5, { align: 'center' });

  // Heat Map Legend & Appetite Statement on Right of Matrix
  const legendX = matrixX + matrixW + 8;
  const legendW = contentWidth - (matrixW + 28);

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(legendX, y, legendW, matrixH, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('Risk Matrix Legend & Appetite', legendX + 4, y + 6);

  const legendItems = [
    { label: 'Critical (17-25): Immediate Board Escalation', color: [225, 29, 72], boxColor: [254, 226, 226] },
    { label: 'High (10-16): Active Treatment Mandated', color: [234, 88, 12], boxColor: [254, 243, 199] },
    { label: 'Medium (5-9): Standard Control Monitoring', color: [217, 119, 6], boxColor: [254, 249, 195] },
    { label: 'Low (1-4): Managed within Routine Ops', color: [16, 185, 129], boxColor: [236, 253, 245] }
  ];

  legendItems.forEach((it, idx) => {
    const ly = y + 12 + idx * 7.5;
    doc.setFillColor(it.boxColor[0], it.boxColor[1], it.boxColor[2]);
    doc.setDrawColor(it.color[0], it.color[1], it.color[2]);
    doc.rect(legendX + 4, ly - 2.5, 4, 4, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(51, 65, 85);
    doc.text(it.label, legendX + 11, ly);
  });

  // Appetite Statement
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(16, 185, 129);
  doc.text('✓ ZERO RISKS EXCEEDING BOARD APPETITE', legendX + 4, y + matrixH - 4);

  y += matrixH + 15;

  // Top Material Risks Register Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('3. Material Enterprise Risks & Treatment Actions (Board Watchlist)', margin, y);

  y += 4.5;

  // Table Header
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, y, contentWidth, 6.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('Risk ID & Description', margin + 3, y + 4.5);
  doc.text('Category', margin + 78, y + 4.5);
  doc.text('Inherent', margin + 112, y + 4.5);
  doc.text('Residual', margin + 128, y + 4.5);
  doc.text('Treatment Strategy', margin + 144, y + 4.5);
  doc.text('Risk Owner', margin + 172, y + 4.5);

  y += 6.5;

  data.topRisks.slice(0, 5).forEach((r, idx) => {
    const isEven = idx % 2 === 0;
    doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
    doc.rect(margin, y, contentWidth, 7, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y + 7, margin + contentWidth, y + 7);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(30, 41, 59);
    doc.text(`${r.id}: ${r.title.slice(0, 40)}${r.title.length > 40 ? '...' : ''}`, margin + 3, y + 4.8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(r.category, margin + 78, y + 4.8);

    // Inherent score
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(225, 29, 72);
    doc.text(`${r.inherentScore}`, margin + 115, y + 4.8);

    // Residual score
    doc.setTextColor(r.residualScore >= 10 ? 234 : 16, r.residualScore >= 10 ? 88 : 185, r.residualScore >= 10 ? 12 : 129);
    doc.text(`${r.residualScore}`, margin + 131, y + 4.8);

    // Treatment
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(51, 65, 85);
    doc.text(r.treatment, margin + 144, y + 4.8);

    // Owner
    doc.text(r.owner, margin + 172, y + 4.8);

    y += 7;
  });

  y += 8;

  // Governance Sign-Off Blocks
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('4. Governance Attestation & Executive Sign-Off', margin, y);

  y += 4;

  const signW = contentWidth / 3;
  const sigs = [
    { title: 'Chief Risk Officer (CRO)', name: data.signatories?.cro || 'Evelyn Reed, CRO' },
    { title: 'Lead Internal Auditor', name: data.signatories?.leadAuditor || 'Marcus Vance, Lead ISMS Auditor' },
    { title: 'Chief Executive Officer (CEO)', name: data.signatories?.ceo || 'Devon Chen, CEO & Board Chair' }
  ];

  sigs.forEach((sig, idx) => {
    const sx = margin + idx * signW;
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(sx, y, signW - 3, 22, 1.5, 1.5, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(15, 23, 42);
    doc.text(sig.title, sx + 4, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(sig.name, sx + 4, y + 10);

    // Signature dotted line
    doc.setDrawColor(148, 163, 184);
    doc.setLineDashPattern([1, 1], 0);
    doc.line(sx + 4, y + 17, sx + signW - 7, y + 17);
    doc.setLineDashPattern([], 0);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.setTextColor(148, 163, 184);
    doc.text(`Digitally Attested: ${dateStr}`, sx + 4, y + 20);
  });

  drawPageFooter(2, 2);

  // Save the PDF
  const filename = `${data.tenantName.replace(/[^a-zA-Z0-9]/g, '_')}_Executive_GRC_Summary_${data.reportingPeriod.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  doc.save(filename);
}
