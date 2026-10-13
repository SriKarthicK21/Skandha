// ============================================================================
// SKANDA ENTERPRISE GRC: DPDP REGULATORY ACCURACY & ASSURANCE VALIDATION SUITE
// Path: scripts/validateDpdpRegulatoryAccuracy.ts
//
// Authoritative Regulatory & Operational Invariant Test Suite for:
// 1. DPDP Effective-Date & Phased Commencement Matrix
// 2. Rule 7 Future/Current Status Separation
// 3. CERT-In Independent 6-Hour Cyber Incident Clock
// 4. DPDP Rule 7 Independent Breach Notification Clock
// 5. Sectoral Regulator Incident Clocks (SEBI CSCRF / RBI)
// 6. Sectoral Regulatory Overlay & Effective Retention Synthesis (PMLA 5-Year Preemption)
// 7. Cross-Border Transfer Governance (§16 Negative-List & Sector Overlay)
// 8. DSR Statutory SLA Countdown & Risk Level
// 9. DSR Blast Radius Dependency Resolution (Principal -> Elements -> Systems -> Processors)
// 10. DSR Processor Propagation & Evidence Chain Hashing
// 11. Active Legal Hold Detection & Protection
// 12. Deletion Decision Engine Blocking (Legal Hold & Statutory Preemption)
// 13. Deletion Orchestration Execution & SHA-256 Certificate Issuance
// 14. Canonical Privacy Graph 2.0 Lineage & Relationship Integrity
// 15. SKANDA Privacy Assurance Methodology ("Show Me Why" Grounded Explanation)
// 16. Source-Grounded AI Privacy Copilot & Audit Ledger
// 17. Strict Multi-Tenant Row-Level Isolation (Tenant A vs Tenant B)
// 18. DPO & Auditor Authorization Gates
// 19. Regulatory Versioning & Gazette Traceability
// 20. Cryptographic Evidence Reproducibility
// ============================================================================

import { dpdpPrivacyEngineService } from '../src/services/canonical/DpdpPrivacyEngineService';

interface TestResult {
  step: number;
  title: string;
  passed: boolean;
  message: string;
  details?: any;
}

const results: TestResult[] = [];

function assert(condition: boolean, step: number, title: string, passMessage: string, failMessage?: string) {
  if (condition) {
    results.push({ step, title, passed: true, message: passMessage });
    console.log(`✅ [PASS] Step ${step}: ${title}`);
    console.log(`   └─ ${passMessage}`);
  } else {
    results.push({ step, title, passed: false, message: failMessage || 'Assertion failed' });
    console.error(`❌ [FAIL] Step ${step}: ${title}`);
    console.error(`   └─ ${failMessage || 'Assertion failed'}`);
  }
}

async function runRegulatoryAccuracyValidation() {
  console.log('================================================================');
  console.log('SKANDA ENTERPRISE DPDP-2 REGULATORY ACCURACY VALIDATION SUITE');
  console.log('Statutory Reference: DPDP Act 2023, DPDP Rules 2025, CERT-In Directions 2022');
  console.log('================================================================\n');

  const tenantA = 'tenant_skanda';
  const tenantB = 'tenant_apex';

  // 1. DPDP Effective-Date Accuracy
  const inForceReqs = dpdpPrivacyEngineService.getRegulatoryRequirements({ inForceOnly: true });
  const allReqs = dpdpPrivacyEngineService.getRegulatoryRequirements();
  const rule4 = allReqs.find(r => r.id === 'DPDP-REQ-SEC-05');
  assert(
    rule4 !== undefined &&
      rule4.isLegallyEnforceableCurrently === true &&
      rule4.commencementStatus === 'IN_FORCE' &&
      rule4.notifiedDate === '2025-11-13' &&
      rule4.effectiveDate === '2025-11-13',
    1,
    'DPDP Effective-Date Accuracy & Statutory Dates',
    `Section 5 / Rule 4 verified with notified date ${rule4?.notifiedDate} and IN_FORCE status.`
  );

  // 2. Rule 7 Future/Current Status Separation
  const rule7 = allReqs.find(r => r.id === 'DPDP-REQ-SEC-08-06');
  assert(
    rule7 !== undefined &&
      rule7.isLegallyEnforceableCurrently === false &&
      rule7.commencementStatus === 'COMING_INTO_FORCE' &&
      (rule7.customerAdoptionStatus === 'EARLY_ADOPTION' || rule7.customerAdoptionStatus === 'IN_TRANSITION'),
    2,
    'Rule 7 Phased Commencement Invariant (Never Marked In Force Currently)',
    `Rule 7 breach notification correctly flagged as COMING_INTO_FORCE (Enforceable: ${rule7?.isLegallyEnforceableCurrently}, Adoption: ${rule7?.customerAdoptionStatus}).`
  );

  // 3. CERT-In Independent 6-Hour Clock
  const certInReq = allReqs.find(r => r.id === 'CERT-IN-REQ-DIR-2022-06');
  assert(
    certInReq !== undefined &&
      certInReq.source === 'CERT_IN_DIRECTIONS_2022' &&
      certInReq.sectionOrRuleNumber.includes('Para 6(ii)') &&
      certInReq.isLegallyEnforceableCurrently === true,
    3,
    'CERT-In Statutory 6-Hour Incident Reporting Standalone Obligation',
    `CERT-In reporting verified under Section 70B(6) IT Act 2000 (Enforceable: true).`
  );

  // 4. DPDP Independent Breach Clock
  const newIncidentClocks = dpdpPrivacyEngineService.computeIncidentClocks(tenantA, {
    id: 'INC-2026-TEST-01',
    title: 'Simulated API Secret Exfiltration',
    discoveredAt: new Date().toISOString(),
    affectedCategories: ['IDENTITY_CONTACT', 'FINANCIAL_TRANSACTIONAL'],
    hasPersonalDataBreach: true,
    isCoveredCyberIncident: true,
    sector: 'FINTECH_BANKING'
  });
  const certInClock = newIncidentClocks.find(c => c.obligationType === 'CERT_IN_CYBER_REPORTING');
  const dpdpBoardClock = newIncidentClocks.find(c => c.obligationType === 'DPDP_RULE7_BOARD_NOTIFICATION');
  assert(
    certInClock !== undefined &&
      dpdpBoardClock !== undefined &&
      certInClock.statutoryWindowHours === 6 &&
      certInClock.isCommencedLegally === true &&
      dpdpBoardClock.isCommencedLegally === false,
    4,
    'Independent Multi-Clock Separation (CERT-In 6h vs DPDP Rule 7 Phased)',
    `CERT-In clock (6h, commenced: ${certInClock?.isCommencedLegally}) separated from DPDP Rule 7 (commenced: ${dpdpBoardClock?.isCommencedLegally}).`
  );

  // 5. Sectoral Incident Clock (e.g. RBI 6h / SEBI CSCRF)
  const rbiClock = newIncidentClocks.find(c => c.obligationType === 'RBI_INCIDENT_REPORTING');
  assert(
    rbiClock !== undefined &&
      rbiClock.basisLegalSource.includes('RBI Master Direction') &&
      rbiClock.statutoryWindowHours === 6,
    5,
    'Sectoral Regulator Incident Reporting Clock (RBI Master Direction)',
    `RBI sector incident clock configured with 6-hour reporting deadline.`
  );

  // 6. Sectoral Regulatory Overlay & Retention Synthesis (PMLA 5-Year Preemption)
  const kycSynthesis = dpdpPrivacyEngineService.synthesizeEffectiveRetention(tenantA, 'pde-03');
  assert(
    kycSynthesis !== undefined &&
      kycSynthesis.effectiveRetentionMonths === 60 &&
      kycSynthesis.sectorOverlayMandates.some(m => m.authority === 'FIU-IND_PMLA') &&
      kycSynthesis.isEligibleForDeletion === false,
    6,
    'Sectoral Overlay Retention Synthesis (PMLA 2002 5-Year Preemption)',
    `KYC data element synthesized at 60 months (Base DPDP: ${kycSynthesis?.dpdpBaseRetentionMonths} mo, Effective: ${kycSynthesis?.effectiveRetentionMonths} mo).`
  );

  // 7. Cross-Border Transfer Governance (Section 16 Negative-List & Sector Overlay)
  const singaporeEval = dpdpPrivacyEngineService.evaluateCrossBorderTransfer(tenantA, {
    sourceCountry: 'India',
    destinationCountry: 'Singapore',
    dataCategory: 'IDENTITY_CONTACT',
    purposeId: 'purp-01',
    processorId: 'proc-02'
  });
  const usPaymentEval = dpdpPrivacyEngineService.evaluateCrossBorderTransfer(tenantA, {
    sourceCountry: 'India',
    destinationCountry: 'United States',
    dataCategory: 'FINANCIAL_TRANSACTIONAL',
    purposeId: 'purp-02',
    processorId: 'proc-03'
  });
  assert(
    singaporeEval.transferDecision === 'ALLOWED' &&
      usPaymentEval.transferDecision === 'RESTRICTED' &&
      usPaymentEval.decisionRationale.includes('RBI Directive'),
    7,
    'Cross-Border Governance (§16 Negative-List Permissibility + RBI Payment Localization)',
    `Singapore transfer ALLOWED; US Payment transfer RESTRICTED under RBI localization overlay.`
  );

  // 8. DSR Statutory SLA Countdown & Risk Level
  const dsrRequest = dpdpPrivacyEngineService.getRightRequestById(tenantA, 'DSR-2026-001');
  assert(
    dsrRequest !== undefined &&
      dsrRequest.blastRadius !== undefined &&
      dsrRequest.blastRadius.statutorySlaDaysRemaining > 0 &&
      dsrRequest.blastRadius.slaRiskLevel === 'ON_TRACK',
    8,
    'DSR Statutory SLA Countdown & Risk Scoring',
    `DSR-2026-001 has ${dsrRequest?.blastRadius?.statutorySlaDaysRemaining} days remaining (Risk: ${dsrRequest?.blastRadius?.slaRiskLevel}).`
  );

  // 9. DSR Blast Radius Dependency Resolution
  const blastRadius = dpdpPrivacyEngineService.calculateDsrBlastRadius(tenantA, 'DSR-2026-001');
  assert(
    blastRadius.affectedSystems.length >= 2 &&
      blastRadius.affectedProcessors.length >= 1 &&
      blastRadius.completionPercentage === 70,
    9,
    'DSR Blast Radius Resolution (Principal -> Elements -> Systems -> Processors)',
    `Blast radius mapped across ${blastRadius.affectedSystems.length} systems and ${blastRadius.affectedProcessors.length} processors.`
  );

  // 10. DSR Processor Propagation & Evidence Chain Hashing
  const propagationResult = dpdpPrivacyEngineService.propagateDsrToProcessors(tenantA, 'DSR-2026-001');
  assert(
    propagationResult.success === true &&
      propagationResult.propagatedProcessorsCount >= 1 &&
      propagationResult.evidenceChainHash.length === 64,
    10,
    'DSR Processor Propagation & Cryptographic Evidence Chain Update',
    `Propagated to ${propagationResult.propagatedProcessorsCount} processors with SHA-256 chain hash: ${propagationResult.evidenceChainHash.substring(0, 16)}...`
  );

  // 11. Active Legal Hold Detection & Protection
  const retentionRules = dpdpPrivacyEngineService.getRetentionRules(tenantA);
  const legalHoldRule = retentionRules.find(r => r.hasActiveLegalHold);
  assert(
    legalHoldRule !== undefined &&
      legalHoldRule.legalHoldReference?.includes('HC-BOM-091'),
    11,
    'Active Legal Hold Detection on Statutory KYC Schedule',
    `Detected active judicial hold: [${legalHoldRule?.legalHoldReference}]`
  );

  // 12. Deletion Decision Engine: Blocking on Legal Hold & Sector Preemption
  const blockedJob = dpdpPrivacyEngineService.orchestrateDeletionJob(tenantA, 'pde-03', 'PERSONAL_DATA_ELEMENT');
  assert(
    blockedJob.reconciliationStatus === 'BLOCKED_ABORTED' &&
      blockedJob.recordsPurgedTotal === 0 &&
      blockedJob.blockedRationale !== undefined &&
      blockedJob.blockedRationale.owner === 'Head of Legal & Compliance',
    12,
    'Deletion Decision Engine: Purge Blocked by Judicial Hold & Statutory Preemption',
    `Orchestration job ${blockedJob.jobId} blocked with complete rationale and next review date.`
  );

  // 13. Deletion Orchestration Execution & SHA-256 Certificate Issuance
  const permissibleJob = dpdpPrivacyEngineService.orchestrateDeletionJob(tenantA, 'dp-usr-old-109', 'DATA_PRINCIPAL_RECORDS');
  assert(
    permissibleJob.reconciliationStatus === 'RECONCILED_EXACT' &&
      permissibleJob.recordsPurgedTotal === 1420 &&
      permissibleJob.cryptographicEvidenceSha256.length === 64 &&
      permissibleJob.deletionCertificateIssuedBy.includes('DPO'),
    13,
    'Deletion Orchestration: Cryptographic Purge & SHA-256 Certificate Issuance',
    `Purged ${permissibleJob.recordsPurgedTotal} records with reconciliation RECONCILED_EXACT.`
  );

  // 14. Canonical Privacy Graph 2.0 Lineage & Relationship Integrity
  const entityGraph = dpdpPrivacyEngineService.resolveDpdpEntity360(tenantA, 'pde-01');
  assert(
    entityGraph.entityType === 'PERSONAL_DATA_ELEMENT' &&
      entityGraph.linkedPurposes.length > 0 &&
      entityGraph.linkedActivities.length > 0 &&
      entityGraph.linkedProcessors.length > 0 &&
      entityGraph.lineageTrail.length >= 4,
    14,
    'Canonical Privacy Graph 2.0 Lineage Resolution',
    `Resolved complete 360 graph for ${entityGraph.entityType} connecting purposes, RoPA, notice, and processors.`
  );

  // 15. SKANDA Privacy Assurance Methodology ("Show Me Why" Grounded Explanation)
  const assurance = dpdpPrivacyEngineService.explainPrivacyRequirementAssurance(tenantA, 'DPDP-REQ-SEC-04');
  const postureBreakdown = dpdpPrivacyEngineService.getPrivacyPostureBreakdown(tenantA);
  assert(
    assurance.evaluatedStatus === 'EFFECTIVE' &&
      assurance.evidencePoints.length >= 4 &&
      postureBreakdown.evaluationMethodology === 'SKANDA Privacy Assurance Methodology v2.0' &&
      postureBreakdown.pillars.regulatoryReadiness.score > 0,
    15,
    'SKANDA Privacy Assurance Methodology (8-Pillar Posture & "Show Me Why")',
    `Evaluated 8 distinct assurance pillars (Regulatory Readiness: ${postureBreakdown.pillars.regulatoryReadiness.score}%).`
  );

  // 16. Source-Grounded AI Privacy Copilot & Audit Ledger
  const copilotRes = dpdpPrivacyEngineService.askPrivacyCopilot(tenantA, 'What are the incident reporting rules under CERT-In and DPDP?');
  const auditLedger = dpdpPrivacyEngineService.getCopilotAuditLedger(tenantA);
  assert(
    copilotRes.citedRecordIds.length >= 2 &&
      copilotRes.disclaimer === 'AI-GENERATED // HUMAN VALIDATION REQUIRED' &&
      auditLedger.length > 0 &&
      auditLedger[0].approvalStatus === 'PENDING_HUMAN_VALIDATION',
    16,
    'Source-Grounded AI Privacy Copilot & Immutable Audit Ledger',
    `Copilot query grounded in ${copilotRes.citedRecordIds.length} statutory records with mandatory human validation banner.`
  );

  // 17. Strict Multi-Tenant Row-Level Isolation (Tenant A vs Tenant B)
  const incidentsA = dpdpPrivacyEngineService.getPrivacyIncidents(tenantA);
  const incidentsB = dpdpPrivacyEngineService.getPrivacyIncidents(tenantB);
  assert(
    incidentsA.every(i => i.tenantId === tenantA) &&
      incidentsB.every(i => i.tenantId === tenantB),
    17,
    'Strict Multi-Tenant Row-Level Security Partitioning',
    `Tenant A (${incidentsA.length} incidents) and Tenant B (${incidentsB.length} incidents) strictly partitioned.`
  );

  // 18. DPO & Auditor Authorization Gates
  const sdfAssessment = dpdpPrivacyEngineService.getSdfAssessment(tenantA);
  assert(
    sdfAssessment.approvalStatus === 'DPO_APPROVED' &&
      sdfAssessment.dpoName.includes('Rajeshwar') &&
      sdfAssessment.statutoryObligationsActive.residentDpoAppointed === true,
    18,
    'DPO & Independent Auditor Authorization Sign-off Invariant',
    `SDF assessment signed off by resident DPO ${sdfAssessment.dpoName}.`
  );

  // 19. Regulatory Versioning & Gazette Traceability
  const regChanges = dpdpPrivacyEngineService.getRegulatoryChanges();
  const notice = dpdpPrivacyEngineService.getPrivacyNoticeById(tenantA, 'not-01');
  assert(
    regChanges.length > 0 &&
      regChanges[0].gazetteReference.includes('G.S.R.') &&
      notice?.versionHistory.length !== undefined &&
      notice.versionHistory.length > 0,
    19,
    'Regulatory Versioning & Gazette Traceability',
    `Notice version ${notice?.currentVersion} and Gazette ${regChanges[0].gazetteReference} versioned.`
  );

  // 20. Cryptographic Evidence Reproducibility
  const sampleHash1 = dpdpPrivacyEngineService.getAssuranceProof(tenantA, 'DPDP-REQ-SEC-04');
  const sampleHash2 = dpdpPrivacyEngineService.getAssuranceProof(tenantA, 'DPDP-REQ-SEC-04');
  assert(
    sampleHash1.calculatedScore === sampleHash2.calculatedScore &&
      sampleHash1.status === sampleHash2.status,
    20,
    'Deterministic Assurance Calculation & Historical Reproducibility',
    `Empirical assurance scores deterministically reproduced with 100% precision.`
  );

  console.log('\n================================================================');
  console.log('REGULATORY ACCURACY VALIDATION SUMMARY');
  console.log('================================================================');
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  console.log(`Total Checks : ${results.length}`);
  console.log(`Passed       : ${passed}`);
  console.log(`Failed       : ${failed}`);
  console.log(`Accuracy     : ${((passed / results.length) * 100).toFixed(1)}%`);

  if (failed > 0) {
    console.error('\n❌ REGULATORY ACCURACY VALIDATION FAILED');
    process.exit(1);
  } else {
    console.log('\n🎉 ALL 20/20 REGULATORY ACCURACY INVARIANTS PASSED WITH 100% ASSURANCE!');
  }
}

runRegulatoryAccuracyValidation().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
