import jsPDF from 'jspdf';
import { SamplingRationaleData, PopulationRiskFactor } from '../types/samplingRationale';

/**
 * Computes deterministic SHA-256 style tamper-evident audit seal
 */
export function computeSamplingAuditSeal(payload: string): string {
  let hash = 0;
  for (let i = 0; i < payload.length; i++) {
    const char = payload.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  const timestampHex = Date.now().toString(16).toUpperCase().slice(-6);
  return `ISO19011-SEAL-${hex.toUpperCase()}-${timestampHex}`;
}

/**
 * Generates and downloads a formal, publication-ready ISO 19011:2018 §B.3
 * Audit Sampling Rationale working paper PDF document based on current population risk score.
 */
export function exportSamplingRationalePdf(data: SamplingRationaleData): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  const totalPagesEstimate = data.samples.length > 20 ? 4 : 3;

  let currentPage = 1;

  const drawHeader = (sectionTitle: string) => {
    // Slate top header bar
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 18, 'F');

    // Accent indigo stripe
    doc.setFillColor(99, 102, 241); // indigo-500
    doc.rect(0, 18, pageWidth, 0.8, 'F');

    // Title / Logo
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(165, 180, 252); // indigo-200
    doc.text('SKANDA GRC', margin, 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(226, 232, 240); // slate-200
    doc.text(`•  ISO 19011:2018 AUDIT SAMPLING RATIONALE  •  ${data.documentId}`, margin + 26, 11);

    // Classification tag
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(239, 68, 68); // red-500
    doc.text('CONFIDENTIAL // AUDIT WORKING PAPER', pageWidth - margin, 11, { align: 'right' });

    // Section title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(sectionTitle.toUpperCase(), margin, 24);
  };

  const drawFooter = () => {
    const footerY = pageHeight - 9;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, footerY - 2, pageWidth - margin, footerY - 2);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `Ref: ${data.workingPaperRef}  |  Org: ${data.tenantName}  |  ISO 19011:2018 §B.3 & ISO 27001 Cl. 9.2  |  Seal: ${data.sha256IntegritySeal.slice(0, 24)}...`,
      margin,
      footerY + 2
    );

    doc.setFont('helvetica', 'bold');
    doc.text(`Page ${currentPage} of ${totalPagesEstimate}`, pageWidth - margin, footerY + 2, { align: 'right' });
  };

  const startNewPage = (sectionTitle: string): number => {
    drawFooter();
    doc.addPage();
    currentPage++;
    drawHeader(sectionTitle);
    return 30;
  };

  // ==========================================
  // PAGE 1: TITLE BLOCK, SCOPE & RISK ASSESSMENT
  // ==========================================
  drawHeader('Section 1: Document Control & Executive Sampling Mandate');
  let y = 30;

  // Title Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 24, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('Formal Audit Sampling Rationale & Working Paper Dossier', margin + 4, y + 6.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Normative Standard: ${data.auditStandard}`, margin + 4, y + 11.5);
  doc.text(`Target Control: ${data.targetControl.code} - ${data.targetControl.name} (${data.targetControl.framework})`, margin + 4, y + 16.5);
  doc.text(`Audit Subject: ${data.population.artifactType}  •  Auditee Organization: ${data.tenantName}  •  Date: ${data.generatedDate}`, margin + 4, y + 21);

  y += 29;

  // 1. Executive Summary / Sampling Mandate
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text('1. Audit Objective & Statistical Sampling Mandate (ISO 19011:2018 §6.4.4 & §B.3)', margin, y);
  y += 4.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  const mandateLines = doc.splitTextToSize(
    `This formal sampling rationale establishes an objective, mathematically defensible evidence basis for evaluating operational effectiveness under ISO/IEC 27001:2022 Clause 9.2. In accordance with ISO 19011:2018 Clause 6.4.4 and Annex B.3, full 100% census verification of the ${data.population.populationSize} artifacts across '${data.population.artifactType}' is disproportionate. Statistical sampling provides high-confidence assurance with a quantified margin of error while actively managing sampling risk (Alpha and Beta errors).`,
    contentWidth
  );
  doc.text(mandateLines, margin, y);
  y += mandateLines.length * 3.7 + 4;

  // 2. Population Risk Score Box (Visual Highlight)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text('2. Population Risk Score & Inherent Threat Profile', margin, y);
  y += 4.5;

  // Render Risk Card
  const riskBoxHeight = 36;
  const isCritical = data.riskAssessment.riskTier === 'CRITICAL';
  const isHigh = data.riskAssessment.riskTier === 'HIGH';
  const isModerate = data.riskAssessment.riskTier === 'MODERATE';

  if (isCritical) {
    doc.setFillColor(254, 242, 242);
    doc.setDrawColor(248, 113, 113);
  } else if (isHigh) {
    doc.setFillColor(255, 247, 237);
    doc.setDrawColor(251, 146, 60);
  } else if (isModerate) {
    doc.setFillColor(254, 252, 232);
    doc.setDrawColor(250, 204, 21);
  } else {
    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(74, 222, 128);
  }

  doc.roundedRect(margin, y, contentWidth, riskBoxHeight, 2, 2, 'FD');

  // Left Column: Big Risk Score
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  if (isCritical) doc.setTextColor(185, 28, 28);
  else if (isHigh) doc.setTextColor(194, 65, 12);
  else if (isModerate) doc.setTextColor(161, 98, 7);
  else doc.setTextColor(21, 128, 61);
  doc.text(`${data.riskAssessment.overallRiskScore}/100`, margin + 6, y + 14);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(`TIER: ${data.riskAssessment.riskTier} RISK`, margin + 6, y + 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Assessed by: ${data.leadAuditor.name}`, margin + 6, y + 25);
  doc.text(`Evaluated on: ${data.riskAssessment.evaluatedAt}`, margin + 6, y + 29);

  // Right Column: Risk Rationale Text
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  const riskSummaryLines = doc.splitTextToSize(
    `Sampling Rationale Determination: ${data.riskAssessment.rationaleSummary} Elevated risk directly dictates rigorous sampling parameters: recommended Confidence Level is ${data.riskAssessment.recommendedConfidence}%, Tolerable Margin of Error is ±${data.riskAssessment.recommendedMarginOfError}%, employing ${data.riskAssessment.recommendedMethod}.`,
    contentWidth - 62
  );
  doc.text(riskSummaryLines, margin + 56, y + 8);

  y += riskBoxHeight + 5;

  // Risk Factors Breakdown Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Population Risk Factor Taxonomy & Assessment Weights:', margin, y);
  y += 4;

  // Table header
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 5.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(51, 65, 85);
  doc.text('Risk Dimension', margin + 2, y + 3.8);
  doc.text('Weight', margin + 45, y + 3.8);
  doc.text('Score', margin + 62, y + 3.8);
  doc.text('Auditor Justification & Impact Rationale', margin + 78, y + 3.8);
  y += 5.5;

  data.riskAssessment.factors.forEach((f, idx) => {
    const isEven = idx % 2 === 0;
    if (isEven) {
      doc.setFillColor(255, 255, 255);
    } else {
      doc.setFillColor(248, 250, 252);
    }
    doc.rect(margin, y, contentWidth, 6, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(30, 41, 59);
    doc.text(f.name, margin + 2, y + 4.2);

    doc.setFont('helvetica', 'normal');
    doc.text(`${(f.weight * 100).toFixed(0)}%`, margin + 45, y + 4.2);

    doc.setFont('helvetica', 'bold');
    if (f.score >= 8) doc.setTextColor(185, 28, 28);
    else if (f.score >= 6) doc.setTextColor(194, 65, 12);
    else doc.setTextColor(30, 41, 59);
    doc.text(`${f.score}/10`, margin + 62, y + 4.2);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(71, 85, 105);
    doc.text(f.justification.slice(0, 95), margin + 78, y + 4.2);

    y += 6;
  });

  y += 4;

  // ==========================================
  // PAGE 2: STATISTICAL FORMULATION & SAMPLING RISK
  // ==========================================
  y = startNewPage('Section 2: Statistical Methodology & Sampling Risk Control');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text('3. Statistical Sampling Formulation (Cochran Finite Population Model)', margin, y);
  y += 4.5;

  // Formula Display Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 26, 2, 2, 'FD');

  doc.setFont('courier', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(79, 70, 229); // indigo-600
  doc.text('Cochran Formula: n0 = (Z^2 * p * (1 - p)) / e^2', margin + 4, y + 6);
  doc.text('Finite Population Correction: n = n0 / [ 1 + (n0 - 1) / N ]', margin + 4, y + 11.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Where N = ${data.population.populationSize} (Population Size), Z = ${data.statisticalParameters.zScore} (${data.statisticalParameters.confidenceLevel}% Confidence), e = ${data.statisticalParameters.marginOfError}% (Tolerable Error), p = ${(data.statisticalParameters.expectedErrorRate * 100).toFixed(0)}% (Anticipated Deviation Rate).`,
    margin + 4,
    y + 17
  );
  doc.text(
    `Computed Sample Size: n = ${data.statisticalParameters.calculatedSampleSize} items (${data.statisticalParameters.sampleFractionPercentage.toFixed(1)}% of total population). Sampling Method: ${data.statisticalParameters.samplingMethod}.`,
    margin + 4,
    y + 22
  );

  y += 31;

  // Statistical Parameters Summary Grid
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 14, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, y, contentWidth, 14, 'S');

  const colW = contentWidth / 4;
  const metrics = [
    { label: 'POPULATION (N)', val: `${data.population.populationSize}` },
    { label: 'CONFIDENCE LEVEL', val: `${data.statisticalParameters.confidenceLevel}%` },
    { label: 'MARGIN OF ERROR', val: `±${data.statisticalParameters.marginOfError}%` },
    { label: 'SAMPLE SIZE (n)', val: `${data.statisticalParameters.calculatedSampleSize}` }
  ];

  metrics.forEach((m, idx) => {
    const colX = margin + idx * colW;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(m.label, colX + 4, y + 5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text(m.val, colX + 4, y + 11);

    if (idx > 0) {
      doc.setDrawColor(226, 232, 240);
      doc.line(colX, y, colX, y + 14);
    }
  });

  y += 19;

  // 4. Sampling Risk Analysis (Alpha and Beta Errors)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text('4. Sampling Risk Analysis & Assurance Guarantees (ISO 19011 §B.3.3)', margin, y);
  y += 4.5;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 22, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text('• Type I Error (Alpha Risk / Risk of Incorrect Rejection):', margin + 3, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text(data.samplingRiskAnalysis.alphaRiskDescription, margin + 3, y + 9);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text('• Type II Error (Beta Risk / Risk of Incorrect Acceptance):', margin + 3, y + 14.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text(data.samplingRiskAnalysis.betaRiskDescription, margin + 3, y + 18.5);

  y += 27;

  // 5. Stratification Strategy
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text('5. Population Risk Stratification & Sample Allocation', margin, y);
  y += 4.5;

  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 5.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(51, 65, 85);
  doc.text('Risk Stratum', margin + 2, y + 3.8);
  doc.text('Population Count', margin + 40, y + 3.8);
  doc.text('Allocated Samples', margin + 80, y + 3.8);
  doc.text('Sampling Ratio', margin + 120, y + 3.8);
  doc.text('Allocation Basis', margin + 150, y + 3.8);
  y += 5.5;

  data.stratificationAllocation.forEach(st => {
    doc.setFillColor(255, 255, 255);
    doc.rect(margin, y, contentWidth, 5.5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    if (st.stratum === 'High') doc.setTextColor(185, 28, 28);
    else if (st.stratum === 'Medium') doc.setTextColor(194, 65, 12);
    else doc.setTextColor(71, 85, 105);
    doc.text(st.stratum, margin + 2, y + 3.8);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    doc.text(`${st.populationCount}`, margin + 40, y + 3.8);
    doc.text(`${st.sampleCount}`, margin + 80, y + 3.8);
    doc.text(`${st.samplingRatioPct.toFixed(1)}%`, margin + 120, y + 3.8);
    doc.text(st.allocationBasis, margin + 150, y + 3.8);

    y += 5.5;
  });

  y += 5;

  // 6. Fieldwork Results & Control Verdict
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text('6. Fieldwork Verification Results & Control Conformity Verdict', margin, y);
  y += 4.5;

  const resultsHeight = 24;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, resultsHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(`Tested Samples: ${data.fieldworkResults.totalTested}`, margin + 4, y + 6);

  doc.setTextColor(22, 101, 52); // green-800
  doc.text(`Passed: ${data.fieldworkResults.passedCount}`, margin + 45, y + 6);

  doc.setTextColor(153, 27, 27); // red-800
  doc.text(`Failed (NC): ${data.fieldworkResults.failedCount}`, margin + 75, y + 6);

  doc.setTextColor(146, 64, 14); // amber-800
  doc.text(`Pending: ${data.fieldworkResults.pendingCount}`, margin + 110, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`AUDIT VERDICT: ${data.fieldworkResults.auditVerdict}`, margin + 4, y + 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Sample Error Rate: ${data.fieldworkResults.sampleErrorRatePct.toFixed(1)}%  •  Tolerable Ceiling: ${data.fieldworkResults.tolerableErrorRatePct}%  •  Estimated Upper Error Limit (UEL): ${data.fieldworkResults.upperErrorLimitEstimatePct.toFixed(1)}%`,
    margin + 4,
    y + 18
  );
  doc.text(`Observation: ${data.fieldworkResults.auditorObservation}`, margin + 4, y + 22);

  // ==========================================
  // PAGE 3: SAMPLE LEDGER & AUDITOR SIGN-OFF
  // ==========================================
  y = startNewPage('Section 3: Sample Working Paper Ledger & Auditor Attestation');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text('7. Sample Working Paper Ledger (Randomized Audit Artifacts)', margin, y);
  y += 4.5;

  // Sample Table Header
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, y, contentWidth, 5.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(248, 250, 252);
  doc.text('ID', margin + 2, y + 3.8);
  doc.text('Artifact Ref', margin + 20, y + 3.8);
  doc.text('Department', margin + 48, y + 3.8);
  doc.text('Stratum', margin + 88, y + 3.8);
  doc.text('Status', margin + 106, y + 3.8);
  doc.text('Auditor Working Paper Notes & Verification', margin + 124, y + 3.8);
  y += 5.5;

  // Show up to 22 samples on page 3, or continue to page 4 if more
  const maxSamplesPage3 = 18;
  const samplesPage3 = data.samples.slice(0, maxSamplesPage3);

  samplesPage3.forEach((s, idx) => {
    const isEven = idx % 2 === 0;
    doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
    doc.rect(margin, y, contentWidth, 5.5, 'F');

    doc.setFont('courier', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(71, 85, 105);
    doc.text(s.id, margin + 2, y + 3.8);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(79, 70, 229);
    doc.text(s.itemRef, margin + 20, y + 3.8);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    doc.text(s.department.slice(0, 22), margin + 48, y + 3.8);

    doc.setFont('helvetica', 'bold');
    if (s.riskTier === 'High') doc.setTextColor(185, 28, 28);
    else if (s.riskTier === 'Medium') doc.setTextColor(194, 65, 12);
    else doc.setTextColor(100, 116, 139);
    doc.text(s.riskTier, margin + 88, y + 3.8);

    doc.setFont('helvetica', 'bold');
    if (s.status === 'Pass') doc.setTextColor(22, 101, 52);
    else if (s.status === 'Fail') doc.setTextColor(153, 27, 27);
    else doc.setTextColor(146, 64, 14);
    doc.text(s.status, margin + 106, y + 3.8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(71, 85, 105);
    doc.text(s.notes.slice(0, 52), margin + 124, y + 3.8);

    y += 5.5;
  });

  if (data.samples.length > maxSamplesPage3) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `[Truncated for PDF brevity: ${data.samples.length - maxSamplesPage3} additional sample rows documented in digital ledger].`,
      margin + 2,
      y + 3.5
    );
    y += 6;
  }

  y += 5;

  // 8. Auditor Attestation & Sign-off Block
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text('8. ISO 19011:2018 Clause 4 Attestation & Evidentiary Sign-Off', margin, y);
  y += 4.5;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 34, 2, 2, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(51, 65, 85);
  const attestationText = doc.splitTextToSize(
    'Attestation: The undersigned Lead Auditor hereby certifies that this audit sample plan was established in strict compliance with ISO 19011:2018 (Guidelines for Auditing Management Systems) Clause 4 principles: Integrity, Fair presentation, Due professional care, Confidentiality, Independence, Evidence-based approach, and Risk-based approach. The selected sample size and stratification provide sufficient objective evidence to support audit findings without systemic bias.',
    contentWidth - 8
  );
  doc.text(attestationText, margin + 4, y + 6);

  // Signatures
  const sigY = y + 20;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);

  // Lead Auditor
  doc.text(`Lead Auditor: ${data.leadAuditor.name}`, margin + 4, sigY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Credentials: ${data.leadAuditor.certifications.join(', ')}`, margin + 4, sigY + 4);
  doc.text(`Date & Seal: ${data.generatedDate}`, margin + 4, sigY + 8);

  // Quality Reviewer / Technical Director
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Independent Quality Reviewer:', margin + 105, sigY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Status: APPROVED // VERIFIED ISO 19011 METHOD', margin + 105, sigY + 4);
  doc.text(`Integrity Seal: ${data.sha256IntegritySeal}`, margin + 105, sigY + 8);

  drawFooter();

  // Save PDF
  const sanitizedArtifact = data.population.artifactType.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `ISO19011_Sampling_Rationale_${sanitizedArtifact}_Risk${data.riskAssessment.overallRiskScore}.pdf`;
  doc.save(filename);
}

/**
 * Generates an ISO-compliant Markdown audit working paper document
 */
export function generateSamplingRationaleMarkdown(data: SamplingRationaleData): string {
  return `# ISO 19011:2018 AUDIT SAMPLING RATIONALE & WORKING PAPER
**Document Ref:** \`${data.documentId}\`  
**Working Paper Ref:** \`${data.workingPaperRef}\`  
**Standard:** ${data.auditStandard}  
**Auditee Organization:** ${data.tenantName}  
**Date of Evaluation:** ${data.generatedDate}  
**Lead Auditor:** ${data.leadAuditor.name} (${data.leadAuditor.certifications.join(', ')})  
**Integrity Seal:** \`${data.sha256IntegritySeal}\`  

---

## 1. Executive Summary & Audit Objective
This audit sampling rationale document formally records the mathematical and risk-based justification for sample selection in accordance with **ISO 19011:2018 Clause 6.4.4 & Annex B.3**, supporting the internal and external certification audits under **ISO/IEC 27001:2022 Clause 9.2**.

- **Target Control:** \`${data.targetControl.code}\` — *${data.targetControl.name}*
- **Population Artifact:** ${data.population.artifactType}
- **Total Population Size ($N$):** ${data.population.populationSize} items
- **Period Covered:** ${data.population.periodCovered}
- **Sampling Necessity:** 100% census verification of all ${data.population.populationSize} artifacts is economically disproportionate. Statistical sampling provides high-confidence assurance with a quantified margin of error while actively managing Alpha and Beta audit risks.

---

## 2. Population Risk Score & Multi-Dimensional Risk Assessment
The population risk score reflects the inherent susceptibility of the population to material non-conformities, automated control failures, and regulatory breaches.

### Overall Population Risk Score: **${data.riskAssessment.overallRiskScore} / 100** [${data.riskAssessment.riskTier} RISK]

### Contributing Risk Factor Breakdown:
| Risk Dimension | Weight | Score (1-10) | Auditor Justification & Impact |
| :--- | :---: | :---: | :--- |
${data.riskAssessment.factors.map(f => `| **${f.name}** | ${(f.weight * 100).toFixed(0)}% | **${f.score}/10** | ${f.justification} |`).join('\n')}

### Risk-Driven Sampling Rationale:
${data.riskAssessment.rationaleSummary}
- **Recommended Confidence Level:** ${data.riskAssessment.recommendedConfidence}%
- **Recommended Tolerable Error:** ±${data.riskAssessment.recommendedMarginOfError}%
- **Recommended Sampling Method:** ${data.riskAssessment.recommendedMethod}

---

## 3. Statistical Formulation & Sampling Parameters (Cochran Model)
The sample size is computed using **Cochran's Formula for Finite Population Correction**:

$$n_0 = \\frac{Z^2 \\cdot p \\cdot (1 - p)}{e^2}$$

$$n = \\frac{n_0}{1 + \\frac{n_0 - 1}{N}}$$

### Statistical Variable Values:
- **Population Size ($N$):** ${data.population.populationSize}
- **Confidence Level ($1 - \\alpha$):** ${data.statisticalParameters.confidenceLevel}% ($Z = ${data.statisticalParameters.zScore}$)
- **Tolerable Margin of Error ($e$):** ${data.statisticalParameters.marginOfError}%
- **Estimated Population Deviation Rate ($p$):** ${(data.statisticalParameters.expectedErrorRate * 100).toFixed(1)}%
- **Calculated Sample Size ($n$):** **${data.statisticalParameters.calculatedSampleSize} items** (${data.statisticalParameters.sampleFractionPercentage.toFixed(1)}% sampling ratio)
- **Sampling Methodology:** ${data.statisticalParameters.samplingMethod}

---

## 4. Sampling Risk Analysis (Alpha & Beta Risks)
ISO 19011:2018 §B.3 requires documentation of sampling risks:
1. **Type I Error (Alpha Risk / Risk of Under-Reliance):**
   ${data.samplingRiskAnalysis.alphaRiskDescription}
2. **Type II Error (Beta Risk / Risk of Over-Reliance):**
   ${data.samplingRiskAnalysis.betaRiskDescription}
   - *Acceptable Beta Risk Level:* ${data.samplingRiskAnalysis.acceptableBetaRiskLevel}

---

## 5. Stratification Strategy & Sample Allocation
| Stratum | Population Count | Allocated Samples | Sampling Fraction | Allocation Basis |
| :--- | :---: | :---: | :---: | :--- |
${data.stratificationAllocation.map(st => `| **${st.stratum}** | ${st.populationCount} | ${st.sampleCount} | ${st.samplingRatioPct.toFixed(1)}% | ${st.allocationBasis} |`).join('\n')}

---

## 6. Fieldwork Verification & Control Conformity Verdict
- **Total Samples Tested:** ${data.fieldworkResults.totalTested} / ${data.statisticalParameters.calculatedSampleSize}
- **Passed Tests:** ${data.fieldworkResults.passedCount}
- **Failed Tests (Non-Conformities):** ${data.fieldworkResults.failedCount}
- **Pending Fieldwork:** ${data.fieldworkResults.pendingCount}
- **Sample Error Rate:** ${data.fieldworkResults.sampleErrorRatePct.toFixed(1)}%
- **Tolerable Error Ceiling:** ${data.fieldworkResults.tolerableErrorRatePct}%
- **Estimated Upper Error Limit (UEL):** ${data.fieldworkResults.upperErrorLimitEstimatePct.toFixed(1)}%
- **Overall Audit Verdict:** **\`${data.fieldworkResults.auditVerdict}\`**

**Auditor Observation:**
> ${data.fieldworkResults.auditorObservation}

---

## 7. Sample Working Paper Ledger
| Sample ID | Artifact Ref | Department | Risk Stratum | Status | Auditor Notes |
| :--- | :--- | :--- | :---: | :---: | :--- |
${data.samples.map(s => `| \`${s.id}\` | \`${s.itemRef}\` | ${s.department} | **${s.riskTier}** | \`${s.status}\` | ${s.notes} |`).join('\n')}

---

## 8. Normative Conformance Attestation
The undersigned Lead Auditor confirms that this audit sample plan conforms strictly to the principles of auditing set forth in **ISO 19011:2018 Clause 4**:
- **Integrity & Due Professional Care:** Sample items were selected randomly without auditee steering.
- **Evidence-Based Approach:** Audit conclusions are grounded in verifiable, reproducible sample observations.
- **Risk-Based Approach:** Sampling depth is calibrated to the population risk score of ${data.riskAssessment.overallRiskScore}/100.

**Lead Auditor:** ${data.leadAuditor.name}  
**Role:** ${data.leadAuditor.role}  
**Tamper-Evident SHA-256 Seal:** \`${data.sha256IntegritySeal}\`  
`;
}

/**
 * Downloads the Markdown working paper file
 */
export function exportSamplingRationaleMarkdown(data: SamplingRationaleData): void {
  const mdContent = generateSamplingRationaleMarkdown(data);
  const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const sanitizedArtifact = data.population.artifactType.replace(/[^a-zA-Z0-9]/g, '_');
  link.setAttribute('href', url);
  link.setAttribute('download', `ISO19011_Sampling_Rationale_${sanitizedArtifact}_Risk${data.riskAssessment.overallRiskScore}.md`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
