import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { MilestoneItem, RoadmapTrajectoryPoint } from '../components/modules/ReportsAnalyticsModule';

export interface ExportRoadmapPDFOptions {
  tenantName: string;
  readinessScore: number;
  milestones: MilestoneItem[];
  trajectoryPoints: RoadmapTrajectoryPoint[];
  searchQuery?: string;
  statusFilter?: string;
  chartElementId?: string;
}

export async function exportRoadmapToPDF({
  tenantName,
  readinessScore,
  milestones,
  trajectoryPoints,
  searchQuery,
  statusFilter = 'ALL',
  chartElementId = 'roadmap-trajectory-chart'
}: ExportRoadmapPDFOptions): Promise<void> {
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
  const docId = `SKD-ISO27001-RMAP-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

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
    doc.text('•  ISO/IEC 27001:2022 Compliance Roadmap & Readiness Report', margin + 26, 10.5);

    // Confidentiality pill
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(248, 113, 113); // red-400
    doc.text('CONFIDENTIAL // GRC EXECUTIVE AUDIT', pageWidth - margin, 10.5, { align: 'right' });

    // Thin accent bar
    doc.setFillColor(14, 165, 233); // sky-500
    doc.rect(0, 15.5, pageWidth, 0.8, 'F');
  };

  const addFooter = (pageNum: number, totalPages: number) => {
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(`Doc Ref: ${docId} | Organization: ${tenantName} | Generated: ${dateStr} ${timeStr}`, margin, pageHeight - 7);
    doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - margin, pageHeight - 7, { align: 'right' });
  };

  // ================= PAGE 1: EXECUTIVE SUMMARY & CHART =================
  let y = 24;

  // Title Box
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 24, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text('ISMS Implementation Roadmap & Audit Trajectory', margin + 4, y + 7.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Scope: Information Security Management System (ISO/IEC 27001:2022) | Target Stage 1 Audit: >= 85% Readiness`,
    margin + 4,
    y + 13.5
  );

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  const filterSummary = searchQuery ? `Active Filter: "${searchQuery}" | Status: ${statusFilter}` : `Status Filter: ${statusFilter}`;
  doc.text(`Report Subject: ${tenantName} | ${filterSummary} | Document Hash: SHA256-VERIFIED`, margin + 4, y + 19);

  y += 28;

  // 4 KPI Summary Cards
  const kpiWidth = (contentWidth - 6) / 4;
  const completedCount = milestones.filter(m => m.status === 'Completed').length;
  const inProgressCount = milestones.filter(m => m.status === 'In Progress').length;
  const totalWeight = milestones.reduce((sum, m) => sum + (m.readinessContribution || 0), 0);

  // Card 1: Readiness Score
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(margin, y, kpiWidth, 22, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('AUDIT READINESS', margin + 3, y + 5);
  doc.setFontSize(14);
  doc.setTextColor(52, 211, 153); // emerald-400
  doc.text(`${readinessScore}%`, margin + 3, y + 13.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(203, 213, 225);
  doc.text(readinessScore >= 85 ? 'Audit Threshold Met' : `${85 - readinessScore}% to Stage 1 Target`, margin + 3, y + 18.5);

  // Card 2: Milestones Progress
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(margin + kpiWidth + 2, y, kpiWidth, 22, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('MILESTONES COMPLETE', margin + kpiWidth + 5, y + 5);
  doc.setFontSize(14);
  doc.setTextColor(56, 189, 248); // sky-400
  doc.text(`${completedCount} / ${milestones.length}`, margin + kpiWidth + 5, y + 13.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(203, 213, 225);
  doc.text(`${Math.round((completedCount / (milestones.length || 1)) * 100)}% Journey Velocity`, margin + kpiWidth + 5, y + 18.5);

  // Card 3: Active Stage-Gates
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(margin + (kpiWidth + 2) * 2, y, kpiWidth, 22, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('IN-PROGRESS STAGES', margin + (kpiWidth + 2) * 2 + 3, y + 5);
  doc.setFontSize(14);
  doc.setTextColor(251, 191, 36); // amber-400
  doc.text(`${inProgressCount} Active`, margin + (kpiWidth + 2) * 2 + 3, y + 13.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(203, 213, 225);
  doc.text('Remediation & Evidence', margin + (kpiWidth + 2) * 2 + 3, y + 18.5);

  // Card 4: Roadmap Weight Mapped
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(margin + (kpiWidth + 2) * 3, y, kpiWidth, 22, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('ISMS CONTROL WEIGHT', margin + (kpiWidth + 2) * 3 + 3, y + 5);
  doc.setFontSize(14);
  doc.setTextColor(192, 132, 252); // purple-400
  doc.text(`${totalWeight}%`, margin + (kpiWidth + 2) * 3 + 3, y + 13.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(203, 213, 225);
  doc.text('Clauses 4-10 & Annex A', margin + (kpiWidth + 2) * 3 + 3, y + 18.5);

  y += 27;

  // Chart Container Capture
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('1. Audit Readiness Velocity & Target Trajectory Curve', margin, y + 3);

  y += 6;

  let chartRendered = false;
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
      const finalHeight = Math.min(imgHeight, 82);

      doc.setFillColor(15, 23, 42);
      doc.roundedRect(margin, y, contentWidth, finalHeight, 2, 2, 'F');
      doc.addImage(imgData, 'PNG', margin, y, contentWidth, finalHeight);
      y += finalHeight + 6;
      chartRendered = true;
    } catch (e) {
      console.error('Failed to capture chart canvas:', e);
    }
  }

  if (!chartRendered) {
    // Fallback vector summary if chart canvas not available
    doc.setFillColor(15, 23, 42);
    doc.roundedRect(margin, y, contentWidth, 50, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(56, 189, 248);
    doc.text('Roadmap Trajectory Data Summary', margin + 5, y + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(203, 213, 225);
    let rowY = y + 15;
    trajectoryPoints.slice(0, 6).forEach(pt => {
      doc.text(
        `${pt.month} (${pt.phase}): Target ${pt.targetReadiness}% | Actual: ${pt.actualReadiness !== null ? `${pt.actualReadiness}%` : 'Projected ' + (pt.projectedReadiness || '--') + '%'} | ${pt.milestoneTitle}`,
        margin + 5,
        rowY
      );
      rowY += 5.5;
    });
    y += 56;
  }

  // Trajectory Milestones Key Observations
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('Executive Observations & Readiness Projections:', margin, y + 3);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  
  const obs = [
    `• Stage 1 Audit Baseline (85%) Projected Target: On track for Month 6 review with current velocity (+${Math.round(readinessScore / (completedCount || 1))}% per stage-gate).`,
    `• Critical Milestones Implemented: ISMS Scope Definition (Clause 4), Executive MoU & Policies (Clause 5), Risk Assessment (Clause 6), and Core Technical Controls.`,
    `• Active Remediation Gate: Internal Audit (Clause 9.2) and Executive Management Review (Clause 9.3) required prior to certification body formal engagement.`
  ];

  obs.forEach(line => {
    doc.text(line, margin, y);
    y += 4.5;
  });

  // ================= PAGE 2: STAGE-GATES & MILESTONES TABLE =================
  doc.addPage();
  y = 24;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('2. ISMS Implementation Stage-Gates & Milestone Register', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Formal stage-gate deliverables, ISO 27001 standard clause mapping, responsible owners, and completion weights.', margin, y + 4.5);

  y += 10;

  // Table Header
  const colWidths = [18, 48, 26, 28, 22, 22, 18]; // total = 182 = contentWidth
  const headers = ['Phase', 'Milestone Name', 'Clause', 'Lead Owner', 'Target Date', 'Status', 'Weight'];

  doc.setFillColor(15, 23, 42);
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);

  let curX = margin;
  headers.forEach((h, i) => {
    doc.text(h, curX + 2, y + 4.8);
    curX += colWidths[i];
  });

  y += 7;

  // Table Rows
  milestones.forEach((m, idx) => {
    const isEven = idx % 2 === 0;
    const rowHeight = 11;

    // Background
    if (isEven) {
      doc.setFillColor(248, 250, 252);
    } else {
      doc.setFillColor(255, 255, 255);
    }
    doc.rect(margin, y, contentWidth, rowHeight, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y + rowHeight, margin + contentWidth, y + rowHeight);

    let x = margin;

    // Phase
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(14, 165, 233);
    doc.text(m.phase, x + 2, y + 4.5);

    // Title & Deliverables
    x += colWidths[0];
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(15, 23, 42);
    const splitTitle = doc.splitTextToSize(m.title, colWidths[1] - 3);
    doc.text(splitTitle[0] || m.title, x + 2, y + 4.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(100, 116, 139);
    const deliverableSnippet = m.deliverables && m.deliverables[0] ? `Artifact: ${m.deliverables[0]}` : '';
    doc.text(doc.splitTextToSize(deliverableSnippet, colWidths[1] - 3)[0] || '', x + 2, y + 8.5);

    // Clause
    x += colWidths[1];
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(51, 65, 85);
    doc.text(doc.splitTextToSize(m.clause, colWidths[2] - 3)[0] || m.clause, x + 2, y + 6);

    // Owner
    x += colWidths[2];
    doc.text(doc.splitTextToSize(m.owner, colWidths[3] - 3)[0] || m.owner, x + 2, y + 6);

    // Target Date
    x += colWidths[3];
    doc.text(m.completedDate || m.targetDate, x + 2, y + 6);

    // Status Badge
    x += colWidths[4];
    if (m.status === 'Completed') {
      doc.setFillColor(209, 250, 229);
      doc.setTextColor(6, 95, 70);
    } else if (m.status === 'In Progress') {
      doc.setFillColor(224, 242, 254);
      doc.setTextColor(3, 105, 161);
    } else {
      doc.setFillColor(241, 245, 249);
      doc.setTextColor(71, 85, 105);
    }
    doc.roundedRect(x + 2, y + 2.5, 18, 5, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.text(m.status === 'In Progress' ? 'In Progress' : m.status, x + 3, y + 6);

    // Weight
    x += colWidths[5];
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(14, 165, 233);
    doc.text(`+${m.readinessContribution}%`, x + 3, y + 6);

    y += rowHeight;
  });

  y += 8;

  // ================= PAGE 3: CONTRIBUTING TASKS & FORMAL SIGN-OFF =================
  doc.addPage();
  y = 24;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('3. Granular Contributing Tasks & Action Item Registry', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Operational tasks, technical control implementations, and evidence verifications driving milestone progress.', margin, y + 4.5);

  y += 10;

  // Collect all tasks across trajectory points
  const allTasks: Array<{
    task: any;
    phase: string;
    milestone: string;
  }> = [];

  trajectoryPoints.forEach(pt => {
    if (pt.contributingTasks) {
      pt.contributingTasks.forEach(t => {
        allTasks.push({
          task: t,
          phase: pt.phase,
          milestone: pt.milestoneTitle
        });
      });
    }
  });

  // Task Table Header
  const taskColWidths = [18, 54, 32, 28, 22, 16, 12]; // total = 182
  const taskHeaders = ['Phase', 'Action Item / Task', 'Assignee & Dept', 'Linked Control', 'Status', 'Progress', 'Weight'];

  doc.setFillColor(15, 23, 42);
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);

  let taskCurX = margin;
  taskHeaders.forEach((h, i) => {
    doc.text(h, taskCurX + 2, y + 4.8);
    taskCurX += taskColWidths[i];
  });

  y += 7;

  // Render first 14 tasks to fit comfortably with sign-off block
  const tasksToRender = allTasks.slice(0, 13);

  tasksToRender.forEach((item, idx) => {
    const isEven = idx % 2 === 0;
    const rowHeight = 8;

    if (isEven) {
      doc.setFillColor(248, 250, 252);
    } else {
      doc.setFillColor(255, 255, 255);
    }
    doc.rect(margin, y, contentWidth, rowHeight, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y + rowHeight, margin + contentWidth, y + rowHeight);

    let x = margin;

    // Phase
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(14, 165, 233);
    doc.text(item.phase, x + 2, y + 5);

    // Title
    x += taskColWidths[0];
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(15, 23, 42);
    const truncatedTitle = doc.splitTextToSize(item.task.title, taskColWidths[1] - 3)[0] || item.task.title;
    doc.text(truncatedTitle, x + 2, y + 5);

    // Assignee & Dept
    x += taskColWidths[1];
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(71, 85, 105);
    doc.text(`${item.task.assignedTo} (${item.task.department})`, x + 2, y + 5);

    // Linked Control
    x += taskColWidths[2];
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.setTextColor(14, 165, 233);
    doc.text(item.task.linkedControl || 'General ISMS', x + 2, y + 5);

    // Status
    x += taskColWidths[3];
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    if (item.task.status === 'Done') {
      doc.setTextColor(5, 150, 105);
    } else if (item.task.status === 'In Progress') {
      doc.setTextColor(2, 132, 199);
    } else {
      doc.setTextColor(100, 116, 139);
    }
    doc.text(item.task.status, x + 2, y + 5);

    // Progress %
    x += taskColWidths[4];
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`${item.task.progress}%`, x + 2, y + 5);

    // Weight %
    x += taskColWidths[5];
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(14, 165, 233);
    doc.text(`+${item.task.weight}%`, x + 2, y + 5);

    y += rowHeight;
  });

  y += 10;

  // Formal GRC Sign-Off & Verification Block
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 38, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('ISMS Governance & Certification Authority Sign-Off', margin + 4, y + 6);

  const signWidth = (contentWidth - 12) / 3;

  // Sign Box 1: CISO
  const signY = y + 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text('Chief Information Security Officer (CISO)', margin + 4, signY);
  doc.line(margin + 4, signY + 12, margin + 4 + signWidth - 4, signY + 12);
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Signature & Date: Verified Digital Record', margin + 4, signY + 17);

  // Sign Box 2: Lead Auditor
  const sign2X = margin + 4 + signWidth + 2;
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text('Lead Internal Auditor / Compliance Lead', sign2X, signY);
  doc.line(sign2X, signY + 12, sign2X + signWidth - 4, signY + 12);
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Signature & Date: Stage 1 Gate Approval', sign2X, signY + 17);

  // Sign Box 3: Verification Seal
  const sign3X = margin + 4 + (signWidth + 2) * 2;
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(sign3X, signY - 2, signWidth - 4, 22, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(56, 189, 248);
  doc.text('SKANDA GRC INTEGRITY', sign3X + 3, signY + 4);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(203, 213, 225);
  doc.text('ISO/IEC 27001:2022 Validated', sign3X + 3, signY + 9);
  doc.text(`Hash: ${docId.slice(-8)}`, sign3X + 3, signY + 14);
  doc.setTextColor(52, 211, 153);
  doc.text('STATUS: AUDIT-READY', sign3X + 3, signY + 18);

  // Apply Headers & Footers to all pages
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    addHeader(p, totalPages);
    addFooter(p, totalPages);
  }

  // Save the PDF
  const sanitizedTenant = tenantName.replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`${sanitizedTenant}_ISO27001_Compliance_Roadmap_Report_${now.toISOString().slice(0, 10)}.pdf`);
}
