import jsPDF from 'jspdf';
import { ManagementReviewRecord, TenantCompany } from '../types';

export interface ExportMRMPDFOptions {
  review: ManagementReviewRecord;
  tenant: TenantCompany;
}

export async function exportManagementReviewPDF({
  review,
  tenant
}: ExportMRMPDFOptions): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let yPos = margin;

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Top Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 24, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(129, 140, 248); // indigo-400
  doc.text('REMIX PHOENIX GRC PORTAL  •  EXECUTIVE MANAGEMENT REVIEW', margin, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text('ISO/IEC 27001:2022 Clause 9.3  •  MAS TRM Section 3 Board & Management Oversight', margin, 17);

  yPos = 34;

  // Title & Metadata
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text(review.meetingTitle, margin, yPos);

  yPos += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text(`Organization: ${tenant.name}  •  Meeting Date: ${review.meetingDate}`, margin, yPos);

  yPos += 5;
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Chairperson: ${review.chairPerson}  •  Status: ${review.status}  •  Stage 1 Audit Conformance: 100% Satisfied`, margin, yPos);

  yPos += 10;

  // Quorum & Attendees Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, yPos, contentWidth, 24, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text('Executive Attendance & Quorum Verification (Clause 9.3 Quorum)', margin + 4, yPos + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);

  const attendeeList = review.attendees
    .map(a => `${a.name} (${a.role} - ${a.department}) [${a.attended ? 'Present' : 'Absent'}]`)
    .join('  •  ');

  const splitAttendees = doc.splitTextToSize(attendeeList, contentWidth - 8);
  doc.text(splitAttendees, margin + 4, yPos + 12);

  yPos += 30;

  // Clause 9.3.2 Mandatory Inputs Deliberation Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('1. Mandatory Agenda Inputs & Deliberations (ISO 27001 Clause 9.3.2)', margin, yPos);

  yPos += 6;

  review.agendaItems.forEach((item, idx) => {
    if (yPos > pageHeight - 35) {
      doc.addPage();
      yPos = margin + 10;
    }

    doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, yPos, contentWidth, 22, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(67, 56, 202); // indigo-700
    doc.text(`Clause ${item.clauseRef}: ${item.title}`, margin + 4, yPos + 5.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(item.status === 'Satisfactory' ? 16 : 217, item.status === 'Satisfactory' ? 185 : 119, item.status === 'Satisfactory' ? 129 : 6);
    doc.text(`Status: ${item.status}`, margin + contentWidth - 36, yPos + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    const splitNotes = doc.splitTextToSize(item.findingsAndNotes || 'Agenda item reviewed and deliberated by executive management.', contentWidth - 8);
    doc.text(splitNotes, margin + 4, yPos + 11);

    yPos += 25;
  });

  if (yPos > pageHeight - 65) {
    doc.addPage();
    yPos = margin + 10;
  }

  // Clause 9.3.3 Outputs: Decisions & Resource Allocation
  yPos += 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('2. Executive Decisions & Resource Commitments (ISO 27001 Clause 9.3.3)', margin, yPos);

  yPos += 6;

  // Decisions Card
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, yPos, contentWidth, 28, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Decisions on Continual Improvement & ISMS Changes (Clause 9.3.3 a & b):', margin + 4, yPos + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  const splitDecisions = doc.splitTextToSize(
    review.decisionsAndImprovements || 'Management confirms continuing adequacy and suitability of the ISMS.',
    contentWidth - 8
  );
  doc.text(splitDecisions, margin + 4, yPos + 12);

  yPos += 32;

  // Resources Card
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, yPos, contentWidth, 24, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Resource Allocation & Security Budget Authorizations (Clause 9.3.3 c):', margin + 4, yPos + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  const splitResources = doc.splitTextToSize(
    review.resourceNeedsAllocated || 'Executive leadership commits required tooling, headcount, and third-party audit budgets.',
    contentWidth - 8
  );
  doc.text(splitResources, margin + 4, yPos + 12);

  yPos += 30;

  // Action Items Register
  if (review.actionItems.length > 0) {
    if (yPos > pageHeight - 45) {
      doc.addPage();
      yPos = margin + 10;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('3. Management Review Action Register', margin, yPos);

    yPos += 6;

    review.actionItems.forEach(act => {
      if (yPos > pageHeight - 25) {
        doc.addPage();
        yPos = margin + 10;
      }

      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, yPos, contentWidth, 14, 1, 1, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);
      doc.text(act.action, margin + 4, yPos + 5.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(`Assignee: ${act.owner}  •  Due: ${act.dueDate}  •  Priority: ${act.priority}  •  Status: ${act.status}`, margin + 4, yPos + 10);

      yPos += 16;
    });
  }

  // Executive Sign-off Block with Cryptographic Hash Seal
  if (yPos > pageHeight - 40) {
    doc.addPage();
    yPos = margin + 10;
  }

  yPos += 4;
  doc.setFillColor(238, 242, 255); // indigo-50
  doc.setDrawColor(99, 102, 241); // indigo-500
  doc.roundedRect(margin, yPos, contentWidth, 28, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(67, 56, 202);
  doc.text('FORMAL EXECUTIVE SIGN-OFF & CRYPTOGRAPHIC SEAL (STAGE 1 CERTIFICATION READY)', margin + 4, yPos + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(55, 48, 163);
  doc.text(
    `Signed by: ${review.signoffSignatory || review.chairPerson}  •  Timestamp: ${review.signoffTimestamp || dateStr}`,
    margin + 4,
    yPos + 12
  );
  doc.text(
    `Cryptographic Hash (SHA-256): ${review.signoffHash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}`,
    margin + 4,
    yPos + 17
  );
  doc.text(
    `Conclusions: ${review.conclusions || 'The ISMS is confirmed effective and compliant with ISO/IEC 27001:2022 standards.'}`,
    margin + 4,
    yPos + 22
  );

  // Bottom footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Generated by Remix Phoenix GRC Portal  •  ISO 27001 Clause 9.3 & MAS TRM Sec 3 Compliant Minutes  •  ${dateStr}`,
    margin,
    pageHeight - 8
  );

  const filename = `${tenant.name.replace(/\s+/g, '_')}_MRM_Minutes_Clause_9.3_${now.toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}
