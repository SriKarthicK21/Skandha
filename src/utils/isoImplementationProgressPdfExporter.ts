import jsPDF from 'jspdf';
import { IsoWorkflowStage } from '../types';

export interface ExportProgressSummaryPdfOptions {
  tenantName: string;
  stages: IsoWorkflowStage[];
  overallProgress?: number;
}

/**
 * Generates and downloads an executive PDF progress summary report of all 20 ISO implementation stages,
 * highlighting completed gates, identified blockers, deliverables, and current percentage status.
 */
export async function exportIsoImplementationProgressPDF({
  tenantName,
  stages,
  overallProgress
}: ExportProgressSummaryPdfOptions): Promise<void> {
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
  const dateStr = now.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const timeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
  const docId = `SKD-ISO27001-STG20-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

  // Filter and sort the 20 implementation stages
  const core20Stages = stages
    .filter(s => s.stageNumber <= 20)
    .sort((a, b) => a.stageNumber - b.stageNumber);

  // Compute key statistics
  const totalStages = 20;
  const completedStages = core20Stages.filter(s => s.status === 'COMPLETED').length;
  const inProgressStages = core20Stages.filter(s => s.status === 'IN_PROGRESS').length;
  const blockedStages = core20Stages.filter(
    s => s.blockers && s.blockers.length > 0 && s.status !== 'COMPLETED'
  ).length;
  const lockedStages = core20Stages.filter(s => s.status === 'LOCKED' || s.status === 'AVAILABLE').length;

  const computedOverallProgress = overallProgress !== undefined
    ? overallProgress
    : Math.round(core20Stages.reduce((acc, s) => acc + s.completionPct, 0) / (core20Stages.length || 1));

  // Header template
  const addHeader = (pageNum: number, totalPages: number) => {
    // Top banner
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 16, 'F');

    // Brand title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(56, 189, 248); // sky-400
    doc.text('SKANDA GRC', margin, 10.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(203, 213, 225); // slate-300
    doc.text('•  ISO/IEC 27001:2022 Implementation Journey (20 Stages Progress Summary)', margin + 26, 10.5);

    // Confidentiality pill
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(248, 113, 113); // red-400
    doc.text('CONFIDENTIAL // EXECUTIVE AUDIT SUMMARY', pageWidth - margin, 10.5, { align: 'right' });

    // Thin accent bar
    doc.setFillColor(14, 165, 233); // sky-500
    doc.rect(0, 15.5, pageWidth, 0.8, 'F');
  };

  // Footer template
  const addFooter = (pageNum: number, totalPages: number) => {
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(`Doc Ref: ${docId} | Organization: ${tenantName} | Generated: ${dateStr} ${timeStr}`, margin, pageHeight - 7);
    doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - margin, pageHeight - 7, { align: 'right' });
  };

  // Helper to ensure enough space on page, adding page if needed
  let y = 23;
  const checkPageBreak = (neededSpace: number) => {
    if (y + neededSpace > pageHeight - 18) {
      doc.addPage();
      y = 23;
    }
  };

  // ================= PAGE 1: EXECUTIVE SUMMARY =================
  // Title Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 22, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('20-Stage ISO 27001:2022 Implementation Progress Report', margin + 4, y + 7.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Organization: ${tenantName}   •   Standard: ISO/IEC 27001:2022 ISMS   •   Generated: ${dateStr} at ${timeStr}`,
    margin + 4,
    y + 13
  );
  doc.text(
    'Comprehensive stage-gating audit trail covering prerequisite authorization, mandatory deliverables, operational evidence, and designated SPOC sign-offs.',
    margin + 4,
    y + 18
  );

  y += 26;

  // Executive Metric Cards (4 Tiles)
  const tileWidth = (contentWidth - 9) / 4;
  const tileHeight = 18;

  // Tile 1: Overall Progress
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, tileWidth, tileHeight, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(14, 165, 233); // sky-500
  doc.text(`${computedOverallProgress}%`, margin + 4, y + 7.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Total Progress Status', margin + 4, y + 12);
  doc.text(`${completedStages} of 20 Certified`, margin + 4, y + 15.5);

  // Tile 2: Completed Stages
  const tile2X = margin + tileWidth + 3;
  doc.setFillColor(236, 253, 245); // emerald-50
  doc.setDrawColor(167, 243, 208);
  doc.roundedRect(tile2X, y, tileWidth, tileHeight, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(16, 185, 129); // emerald-500
  doc.text(`${completedStages}`, tile2X + 4, y + 7.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(5, 150, 105);
  doc.text('Stages Completed', tile2X + 4, y + 12);
  doc.text('Gates 100% Cleared', tile2X + 4, y + 15.5);

  // Tile 3: In Progress Stages
  const tile3X = tile2X + tileWidth + 3;
  doc.setFillColor(240, 249, 255); // sky-50
  doc.setDrawColor(186, 230, 253);
  doc.roundedRect(tile3X, y, tileWidth, tileHeight, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(2, 132, 199); // sky-600
  doc.text(`${inProgressStages}`, tile3X + 4, y + 7.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(3, 105, 161);
  doc.text('Stages In Progress', tile3X + 4, y + 12);
  doc.text('Active Execution', tile3X + 4, y + 15.5);

  // Tile 4: Identified Blockers
  const tile4X = tile3X + tileWidth + 3;
  doc.setFillColor(254, 242, 242); // rose-50
  doc.setDrawColor(254, 205, 205);
  doc.roundedRect(tile4X, y, tileWidth, tileHeight, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(225, 29, 72); // rose-600
  doc.text(`${blockedStages}`, tile4X + 4, y + 7.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(190, 18, 60);
  doc.text('Stages with Blockers', tile4X + 4, y + 12);
  doc.text('Prerequisites Pending', tile4X + 4, y + 15.5);

  y += tileHeight + 4;

  // Visual Progress Bar
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 3, 'F');
  doc.setFillColor(16, 185, 129); // emerald-500
  doc.rect(margin, y, (contentWidth * Math.min(computedOverallProgress, 100)) / 100, 3, 'F');

  y += 7;

  // Section Header: Detailed 20 Stages Breakdown
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('DETAILED AUDIT BREAKDOWN OF ALL 20 IMPLEMENTATION STAGES', margin + 3, y + 4.2);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(186, 230, 253);
  doc.text('Status • Percentage • Completed Gates • Identified Blockers • SPOC', pageWidth - margin - 3, y + 4.2, { align: 'right' });

  y += 8;

  // Iterate over all 20 stages
  core20Stages.forEach((stage) => {
    // Stage requires approx 26-32mm of vertical space
    checkPageBreak(30);

    const isCompleted = stage.status === 'COMPLETED';
    const isInProgress = stage.status === 'IN_PROGRESS';
    const hasBlockers = stage.blockers && stage.blockers.length > 0 && !isCompleted;

    // Background container for stage card
    doc.setFillColor(isCompleted ? 250 : 255, isCompleted ? 253 : 255, isCompleted ? 250 : 255);
    doc.setDrawColor(isCompleted ? 167 : hasBlockers ? 254 : 226, isCompleted ? 243 : hasBlockers ? 205 : 232, isCompleted ? 208 : hasBlockers ? 205 : 240);
    doc.roundedRect(margin, y, contentWidth, 27, 1.5, 1.5, 'FD');

    // Stage Top Strip
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`Stage ${stage.stageNumber}: ${stage.name}`, margin + 3, y + 5);

    // Phase Badge
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(`[Phase: ${stage.category}]`, margin + 70, y + 5);

    // Status Pill
    if (isCompleted) {
      doc.setFillColor(16, 185, 129);
      doc.roundedRect(pageWidth - margin - 38, y + 1.5, 35, 4.5, 1, 1, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.text('COMPLETED (100%)', pageWidth - margin - 20.5, y + 4.8, { align: 'center' });
    } else if (hasBlockers) {
      doc.setFillColor(225, 29, 72);
      doc.roundedRect(pageWidth - margin - 38, y + 1.5, 35, 4.5, 1, 1, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.text(`BLOCKED (${stage.completionPct}%)`, pageWidth - margin - 20.5, y + 4.8, { align: 'center' });
    } else if (isInProgress) {
      doc.setFillColor(2, 132, 199);
      doc.roundedRect(pageWidth - margin - 38, y + 1.5, 35, 4.5, 1, 1, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.text(`IN PROGRESS (${stage.completionPct}%)`, pageWidth - margin - 20.5, y + 4.8, { align: 'center' });
    } else {
      doc.setFillColor(148, 163, 184);
      doc.roundedRect(pageWidth - margin - 38, y + 1.5, 35, 4.5, 1, 1, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.text(`PENDING (0%)`, pageWidth - margin - 20.5, y + 4.8, { align: 'center' });
    }

    // Mini Progress Bar
    doc.setFillColor(226, 232, 240);
    doc.rect(margin + 3, y + 7, contentWidth - 6, 1.2, 'F');
    doc.setFillColor(isCompleted ? 16 : 14, isCompleted ? 185 : 165, isCompleted ? 129 : 233);
    doc.rect(margin + 3, y + 7, ((contentWidth - 6) * stage.completionPct) / 100, 1.2, 'F');

    // Stage Metadata (Owner + ISO Clauses)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(71, 85, 105);
    const clausesText = stage.isoClauses?.join(', ') || 'Annex A Controls';
    doc.text(`SPOC / Owner: ${stage.owner}   •   Mapped ISO Clauses: ${clausesText}`, margin + 3, y + 11.5);

    // Section 1: Stage Gating Criteria (4 Gates Highlight)
    // Gate 1: Upstream Prerequisite Authorization
    // Gate 2: Mandatory Deliverables Baseline
    // Gate 3: Operational Evidence Test
    // Gate 4: Designated SPOC Sign-Off
    const gate1Passed = isCompleted || (stage.status !== 'LOCKED' && !hasBlockers);
    const gate2Passed = isCompleted || stage.completionPct >= 60;
    const gate3Passed = isCompleted || stage.completedEvidenceCount > 0;
    const gate4Passed = isCompleted;

    const completedGatesCount = [gate1Passed, gate2Passed, gate3Passed, gate4Passed].filter(Boolean).length;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`Completed Gates (${completedGatesCount}/4):`, margin + 3, y + 16);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    // Render the 4 gates inline
    const g1Text = `[${gate1Passed ? '✓' : '✗'}] Prerequisite Auth`;
    const g2Text = `[${gate2Passed ? '✓' : '✗'}] Deliverables Ratification`;
    const g3Text = `[${gate3Passed ? '✓' : '✗'}] Operational Evidence`;
    const g4Text = `[${gate4Passed ? '✓' : '✗'}] SPOC Sign-off`;

    doc.setTextColor(gate1Passed ? 16 : 225, gate1Passed ? 185 : 29, gate1Passed ? 129 : 72);
    doc.text(g1Text, margin + 35, y + 16);
    doc.setTextColor(gate2Passed ? 16 : 225, gate2Passed ? 185 : 29, gate2Passed ? 129 : 72);
    doc.text(g2Text, margin + 70, y + 16);
    doc.setTextColor(gate3Passed ? 16 : 225, gate3Passed ? 185 : 29, gate3Passed ? 129 : 72);
    doc.text(g3Text, margin + 112, y + 16);
    doc.setTextColor(gate4Passed ? 16 : 225, gate4Passed ? 185 : 29, gate4Passed ? 129 : 72);
    doc.text(g4Text, margin + 148, y + 16);

    // Section 2: Identified Blockers
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(hasBlockers ? 225 : 71, hasBlockers ? 29 : 85, hasBlockers ? 72 : 105);
    doc.text('Identified Blockers:', margin + 3, y + 21);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    if (stage.blockers && stage.blockers.length > 0) {
      doc.setTextColor(190, 18, 60);
      const blockerSnippet = stage.blockers.slice(0, 2).join('; ');
      doc.text(blockerSnippet.length > 130 ? blockerSnippet.substring(0, 127) + '...' : blockerSnippet, margin + 30, y + 21);
    } else if (isCompleted) {
      doc.setTextColor(5, 150, 105);
      doc.text('All gating criteria satisfied. No upstream or operational blockers.', margin + 30, y + 21);
    } else {
      doc.setTextColor(100, 116, 139);
      doc.text('No active blockers identified. Ready for continued sequential execution.', margin + 30, y + 21);
    }

    // Section 3: Deliverables Summary
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(71, 85, 105);
    doc.text('Deliverables Baseline:', margin + 3, y + 25);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(100, 116, 139);
    const deliverablesText = stage.deliverables?.slice(0, 3).join(', ') || 'Formal documentation & evidence records';
    doc.text(
      deliverablesText.length > 130 ? deliverablesText.substring(0, 127) + '...' : deliverablesText,
      margin + 30,
      y + 25
    );

    y += 29;
  });

  // Final Governance & Sign-Off Verification Block
  checkPageBreak(38);
  y += 2;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 34, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('ISMS Implementation Certification & Auditor Sign-Off Block', margin + 4, y + 5.5);

  const signWidth = (contentWidth - 12) / 3;
  const signY = y + 9;

  // Sign Box 1: CISO
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Chief Information Security Officer (CISO)', margin + 4, signY);
  doc.line(margin + 4, signY + 11, margin + 4 + signWidth - 4, signY + 11);
  doc.setFontSize(6);
  doc.setTextColor(148, 163, 184);
  doc.text('Verified Digital Progress Record', margin + 4, signY + 15.5);

  // Sign Box 2: Lead Auditor
  const sign2X = margin + 4 + signWidth + 2;
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Lead Internal Auditor / Compliance Lead', sign2X, signY);
  doc.line(sign2X, signY + 11, sign2X + signWidth - 4, signY + 11);
  doc.setFontSize(6);
  doc.setTextColor(148, 163, 184);
  doc.text('Stage Gate Readiness Verification Seal', sign2X, signY + 15.5);

  // Sign Box 3: Verification Seal
  const sign3X = margin + 4 + (signWidth + 2) * 2;
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(sign3X, signY - 2, signWidth - 4, 20, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(56, 189, 248);
  doc.text('SKANDA GRC INTEGRITY', sign3X + 3, signY + 3.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.5);
  doc.setTextColor(203, 213, 225);
  doc.text('20-Stage Implementation Audit Trail', sign3X + 3, signY + 8);
  doc.text(`Ref: ${docId.slice(-8)}`, sign3X + 3, signY + 12);
  doc.setTextColor(52, 211, 153);
  doc.text(`STATUS: ${completedStages >= 20 ? 'CERTIFIED' : 'ACTIVE IN-FLIGHT'}`, sign3X + 3, signY + 16);

  // Apply Headers & Footers to all generated pages
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    addHeader(p, totalPages);
    addFooter(p, totalPages);
  }

  // Save the PDF
  const sanitizedTenant = (tenantName || 'Tenant').replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = `${sanitizedTenant}_ISO27001_20Stage_Implementation_Progress_Summary_${now.toISOString().slice(0, 10)}.pdf`;
  doc.save(fileName);
}
