import { dpdpPrivacyEngineService } from '../src/services/canonical/DpdpPrivacyEngineService';
import {
  DpdpPersonalDataElement,
  DpdpProcessingActivity,
  DpdpConsentRecord,
  DpdpRightRequest,
  DpdpRetentionRule,
  DpdpProcessorProfile,
  DpdpPrivacyIncident,
  DpdpSdfAssessment
} from '../src/types/dpdpPlatformTypes';

interface TestResult {
  step: number;
  name: string;
  passed: boolean;
  details: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, step: number, name: string, details: string) {
  results.push({
    step,
    name,
    passed: !!condition,
    details
  });
  if (!condition) {
    console.error(`❌ [FAIL] Step ${step}: ${name} - ${details}`);
  } else {
    console.log(`✅ [PASS] Step ${step}: ${name}`);
  }
}

async function runEnterpriseDpdpValidation() {
  console.log('================================================================');
  console.log('SKANDA ENTERPRISE DPDP PRIVACY PLATFORM VALIDATION SUITE');
  console.log('Baseline: DPDP Act 2023 & DPDP Rules 2025 (Notified 13-Nov-2025)');
  console.log('================================================================\n');

  const tenantA = 'tenant_skanda';
  const tenantB = 'tenant_apex';

  // 1. Regulatory Library Versioning & Phased Commencement
  const reqs = dpdpPrivacyEngineService.getRegulatoryRequirements();
  assert(
    reqs.length >= 6 && reqs.every((r) => r.commencementStatus && r.effectiveDate),
    1,
    'Regulatory Content Model & Phased Timeline',
    `Found ${reqs.length} statutory requirements with official commencement dates and applicability states.`
  );

  // 2. Personal Data Creation & Lineage
  const newElementPayload = {
    name: 'Aadhaar Tokenized Number',
    category: 'IDENTITY_CONTACT' as const,
    dataType: 'STRING' as const,
    dataPrincipalCategory: 'CUSTOMER_USER' as const,
    isSensitivePersonalData: true,
    isChildrenData: false,
    collectionSource: 'DIGILOCKER_GATEWAY',
    processingSystems: ['AWS RDS Postgres', 'Cold Vault'],
    storageLocations: ['AWS ap-south-1 (Mumbai)'],
    processingActivityIds: ['act-02'],
    purposeIds: ['purp-02'],
    recipientProcessors: ['proc-03'],
    retentionRuleId: 'ret-02',
    deletionMechanism: 'CRYPTO_SHRED' as const,
    securityControls: ['AES-256', 'KMS Envelope'],
    noticeId: 'not-01',
    consentRequired: true,
    lawfulBasis: 'LEGITIMATE_USES_LEGAL_OBLIGATION' as const,
    riskRating: 'HIGH' as const,
    owner: 'Chief Privacy Officer',
    classification: 'RESTRICTED' as const,
    discoveryStatus: 'VERIFIED_ACTIVE' as const,
    evidenceId: 'ev_aadhaar_vault_sha256',
    dataLineage: {
      source: 'DigiLocker',
      flowStages: ['API Gateway', 'HSM Tokenizer', 'Vault DB'],
      destination: 'Vault Encrypted Partition',
      encryptionActive: true
    }
  };
  const createdElement = dpdpPrivacyEngineService.addPersonalDataElement(tenantA, newElementPayload);
  const fetchedElement = dpdpPrivacyEngineService.getPersonalDataElementById(tenantA, createdElement.id);
  assert(
    fetchedElement !== undefined && fetchedElement.isSensitivePersonalData === true,
    2,
    'Personal Data Inventory Creation & Lineage Invariant',
    `Personal data element ${fetchedElement?.id} stored with encryption metadata and lineage.`
  );

  // 3. Processing Activity (RoPA) Registration
  const ropas = dpdpPrivacyEngineService.getProcessingActivities(tenantA);
  const kycRopa = ropas.find((r) => r.id === 'act-02');
  assert(
    kycRopa !== undefined &&
      kycRopa.applicableBasis === 'LEGITIMATE_USES_LEGAL_OBLIGATION' &&
      kycRopa.processorIds.length > 0,
    3,
    'Processing Activity Register (RoPA) & Lawful Grounds',
    `RoPA ${kycRopa?.id} mapped with statutory ground and processors.`
  );

  // 4. Purpose Governance & Anomaly Detection
  const anomalies = dpdpPrivacyEngineService.detectPurposeAnomalies(tenantA);
  assert(
    anomalies !== undefined && typeof anomalies.totalAnomaliesCount === 'number',
    4,
    'Purpose Governance Anomaly & Review Signal Engine',
    `Detected ${anomalies.totalAnomaliesCount} governance review signals across orphaned elements and notice linkages.`
  );

  // 5. Privacy Notice Studio (Multilingual 22 Languages & Plain Language)
  const notices = dpdpPrivacyEngineService.getPrivacyNotices(tenantA);
  const custNotice = notices.find((n) => n.id === 'not-01');
  assert(
    custNotice !== undefined &&
      custNotice.supportedLanguages.includes('hi') &&
      custNotice.readabilityScore.fleschReadingEase >= 70,
    5,
    'Privacy Notice Studio & Multilingual Plain Language',
    `Notice ${custNotice?.id} supports Eighth Schedule languages with readability score ${custNotice?.readabilityScore.fleschReadingEase}.`
  );

  // 6. Consent Lifecycle & Withdrawal Cascade Simulation
  const withdrawalCascade = dpdpPrivacyEngineService.recordConsentWithdrawal(
    tenantA,
    'cst-001',
    'User opted out via privacy portal.'
  );
  assert(
    withdrawalCascade.success === true &&
      withdrawalCascade.downstreamSystemsNotified.length > 0,
    6,
    'Consent Management & Withdrawal Cascade Simulator',
    `Withdrawal cascade enforced across ${withdrawalCascade.downstreamSystemsNotified.length} downstream processing engines.`
  );

  // 7. Data Principal Rights (DSR) Intake & 9-Stage Tracking
  const dsrs = dpdpPrivacyEngineService.getRightRequests(tenantA);
  assert(
    dsrs.length >= 2 && dsrs.some((d) => d.status === 'EXECUTION_IN_PROGRESS'),
    7,
    'Data Principal Rights Center & 9-Stage Workflow Engine',
    `Active DSR requests mapped with SLA deadlines and identity tokens.`
  );

  // 8. DSR Correction Workflow Intake
  const newDsr = dpdpPrivacyEngineService.createRightRequest(tenantA, {
    requestType: 'RIGHT_TO_CORRECTION',
    dataPrincipalName: 'Sanjay Verma',
    dataPrincipalEmail: 'sanjay.verma@example.com',
    verificationMethod: 'DIGILOCKER_OTP'
  });
  const fetchedCorr = dpdpPrivacyEngineService.getRightRequestById(tenantA, newDsr.id);
  assert(
    fetchedCorr !== undefined && fetchedCorr.requestType === 'RIGHT_TO_CORRECTION',
    8,
    'DSR Right to Correction Execution Pipeline',
    `DSR correction request ${fetchedCorr?.id} initialized and tracked.`
  );

  // 9. DSR Negative Test: Closure Blocked Without Evidence
  const invalidClosureAttempt = dpdpPrivacyEngineService.advanceRightRequestStatus(
    tenantA,
    newDsr.id,
    'CLOSED_FULFILLED',
    'Attempting close without evidence'
  );
  assert(
    invalidClosureAttempt.success === false &&
      invalidClosureAttempt.error?.includes('CANNOT_CLOSE_WITHOUT_EVIDENCE'),
    9,
    'Negative Test: DSR Completion Blocked Without Verification Evidence',
    `Strict invariant enforced: ${invalidClosureAttempt.error}`
  );

  // 10. DSR Successful Closure With Attached Evidence
  const validClosure = dpdpPrivacyEngineService.advanceRightRequestStatus(
    tenantA,
    newDsr.id,
    'CLOSED_FULFILLED',
    'Closed with audit verification evidence',
    'ev_dsr_correction_proof_hash_991'
  );
  assert(
    validClosure.success === true && validClosure.request?.status === 'CLOSED_FULFILLED',
    10,
    'DSR Fulfillment Gate Clearance With Immutable Evidence Hash',
    `DSR transitioned to CLOSED_FULFILLED upon evidence submission.`
  );

  // 11. Retention Schedules & Policy Mapping
  const retentionRules = dpdpPrivacyEngineService.getRetentionRules(tenantA);
  assert(
    retentionRules.length >= 2 &&
      retentionRules.some((r) => r.triggerEvent === 'ACCOUNT_CLOSURE'),
    11,
    'Retention & Deletion Engine Schedules',
    `Found ${retentionRules.length} retention schedules mapped to purposes.`
  );

  // 12. Active Legal Hold Detection
  const legalHoldRule = retentionRules.find((r) => r.hasActiveLegalHold);
  assert(
    legalHoldRule !== undefined,
    12,
    'Active Legal Hold Detection',
    `Identified legal hold rule ${legalHoldRule?.id} with hold reference: ${legalHoldRule?.legalHoldReference}`
  );

  // 13. Negative Test: Cryptographic Deletion Blocked by Active Legal Hold
  const blockedDeletion = dpdpPrivacyEngineService.executeDeletionJob(
    tenantA,
    'del-job-102'
  );
  assert(
    blockedDeletion.success === false &&
      blockedDeletion.error?.includes('DELETION_BLOCKED_BY_LEGAL_HOLD'),
    13,
    'Negative Test: Cryptographic Deletion Blocked by Active Legal Hold',
    `Strict invariant enforced: Automated purge blocked due to active judicial hold.`
  );

  // 14. Successful Deletion on Unheld Schedule
  const executedPurge = dpdpPrivacyEngineService.executeDeletionJob(
    tenantA,
    'del-job-101'
  );
  assert(
    executedPurge.success === true && !!executedPurge.proofHash,
    14,
    'Cryptographic Deletion Execution & Audit Certificate Issuance',
    `Purge completed with cryptographic SHA-256 destruction proof: ${executedPurge.proofHash?.substring(0, 16)}...`
  );

  // 15. Processor Privacy 360 & Risk Scoring
  const processors = dpdpPrivacyEngineService.getProcessors(tenantA);
  assert(
    processors.length >= 2 &&
      processors.every((p) => p.dpaSigned !== undefined && p.riskScore !== undefined),
    15,
    'Processor Privacy 360 Registry & DPA Tracking',
    `Evaluated ${processors.length} third-party processors with risk scores.`
  );

  // 16. Sub-Processor Cascade Governance
  const cloudProcessor = processors.find((p) => p.id === 'proc-01');
  assert(
    cloudProcessor !== undefined && cloudProcessor.subProcessors.length > 0,
    16,
    'Sub-Processor Downstream Flow & Back-to-Back DPA Verification',
    `Processor ${cloudProcessor?.name} contains ${cloudProcessor?.subProcessors.length} tier-2 sub-processors.`
  );

  // 17. Privacy Breach / Incident Management (6-Hour Window)
  const incidents = dpdpPrivacyEngineService.getPrivacyIncidents(tenantA);
  const testIncident = incidents[0];
  assert(
    testIncident !== undefined &&
      testIncident.rootCauseAnalysis.length > 0 &&
      testIncident.containmentEvidenceIds.length > 0,
    17,
    'Privacy Incident Operations & 6-Hour Containment Forensics',
    `Incident ${testIncident?.id} tracked with containment proof and CAPA record.`
  );

  // 18. Significant Data Fiduciary (SDF) 6-Factor Assessment
  const sdf = dpdpPrivacyEngineService.getSdfAssessment(tenantA);
  assert(
    sdf !== undefined &&
      sdf.statutoryObligationsActive.residentDpoAppointed === true &&
      sdf.dpoName.includes('Rajeshwar'),
    18,
    'Significant Data Fiduciary (SDF) Governance & Resident DPO',
    `SDF evaluation verified resident DPO: ${sdf?.dpoName}.`
  );

  // 19. Privacy Assurance Engine ("Show Me Why")
  const assuranceProof = dpdpPrivacyEngineService.explainPrivacyRequirementAssurance(
    tenantA,
    'DPDP-REQ-SEC-05'
  );
  assert(
    assuranceProof !== undefined &&
      assuranceProof.evidencePoints.length >= 4 &&
      assuranceProof.evaluatedStatus === 'EFFECTIVE',
    19,
    'Privacy Assurance Engine ("Show Me Why" Grounded Proof)',
    `Assurance proof for ${assuranceProof?.requirement.id} validated ${assuranceProof?.evidencePoints.length} evidence links.`
  );

  // 20. DPDP Entity 360 Graph Resolution
  const entity360 = dpdpPrivacyEngineService.resolveDpdpEntity360(tenantA, 'pde-01');
  assert(
    entity360 !== undefined &&
      entity360.linkedActivities.length > 0 &&
      entity360.linkedNotices.length > 0,
    20,
    'DPDP Entity 360 Full Canonical Graph Connectivity',
    `Resolved 360 graph for ${entity360?.entityType}: connected to ${entity360?.linkedActivities.length} RoPA activities.`
  );

  // 21. Real-Time Privacy Monitoring Signals
  const signals = dpdpPrivacyEngineService.getPrivacySignals(tenantA);
  assert(
    signals.length >= 2 && signals.every((s) => s.signalType && s.recommendedAction),
    21,
    'Real-Time Privacy Signals (Explainable, Non-Automated Legal Determinations)',
    `Generated ${signals.length} real-time privacy review signals.`
  );

  // 22. Regulatory Change Intelligence Monitor
  const regChanges = dpdpPrivacyEngineService.getRegulatoryChanges();
  assert(
    regChanges.length >= 1 && regChanges.some((rc) => rc.gazetteReference.includes('G.S.R.')),
    22,
    'Regulatory Change Intelligence & Gazette Impact Assessment',
    `Loaded ${regChanges.length} authoritative MeitY Gazette changes with impacted controls.`
  );

  // 23. AI Privacy Copilot Source Grounding & Validation Banner
  const copilotQuery = 'What personal data do we process for authentication?';
  const copilotAnswer = dpdpPrivacyEngineService.askPrivacyCopilot(tenantA, copilotQuery);
  assert(
    copilotAnswer.citedRecordIds.length > 0 &&
      copilotAnswer.disclaimer === 'AI-GENERATED // HUMAN VALIDATION REQUIRED',
    23,
    'AI Privacy Copilot Source Grounding & Human Validation Invariant',
    `Copilot response grounded in ${copilotAnswer.citedRecordIds.length} canonical records with disclaimer: ${copilotAnswer.disclaimer}.`
  );

  // 24. Multi-Tenant Isolation Test (Tenant A vs Tenant B)
  const elementsTenantA = dpdpPrivacyEngineService.getPersonalDataInventory(tenantA);
  const elementsTenantB = dpdpPrivacyEngineService.getPersonalDataInventory(tenantB);

  // Insert unique element into Tenant B
  const elementTenantB = dpdpPrivacyEngineService.addPersonalDataElement(tenantB, {
    name: 'Apex Wealth High-Net-Worth Portfolio',
    category: 'FINANCIAL_TRANSACTIONAL',
    dataType: 'ENCRYPTED_BLOB',
    dataPrincipalCategory: 'CUSTOMER_USER',
    isSensitivePersonalData: true,
    isChildrenData: false,
    collectionSource: 'Private Wealth Terminal',
    processingSystems: ['Apex Private Vault'],
    storageLocations: ['AWS ap-south-1 (Mumbai)'],
    processingActivityIds: [],
    purposeIds: [],
    recipientProcessors: [],
    retentionRuleId: 'ret-02',
    deletionMechanism: 'CRYPTO_SHRED',
    securityControls: ['HSM Key'],
    noticeId: 'not-01',
    consentRequired: true,
    lawfulBasis: 'CONSENT',
    riskRating: 'CRITICAL',
    owner: 'Apex CPO',
    classification: 'RESTRICTED',
    discoveryStatus: 'VERIFIED_ACTIVE',
    evidenceId: 'ev_apex_sec_01',
    dataLineage: {
      source: 'Wealth Terminal',
      flowStages: ['HSM Tokenizer', 'Isolated DB'],
      destination: 'Encrypted Wealth Partition',
      encryptionActive: true
    }
  });

  const leakCheckInTenantA = dpdpPrivacyEngineService.getPersonalDataElementById(
    tenantA,
    elementTenantB.id
  );
  const verifyInTenantB = dpdpPrivacyEngineService.getPersonalDataElementById(
    tenantB,
    elementTenantB.id
  );

  assert(
    leakCheckInTenantA === undefined && verifyInTenantB !== undefined,
    24,
    'Multi-Tenant Isolation Invariant: Zero Cross-Tenant Data Leakage',
    `Tenant B secret element strictly isolated from Tenant A query context.`
  );

  // 25. Multi-Tenant DSR & Consent Isolation
  const dsrsTenantA = dpdpPrivacyEngineService.getRightRequests(tenantA);
  const dsrsTenantB = dpdpPrivacyEngineService.getRightRequests(tenantB);
  assert(
    dsrsTenantA.every((d) => d.tenantId === tenantA) &&
      dsrsTenantB.every((d) => d.tenantId === tenantB),
    25,
    'Multi-Tenant DSR & Consent Boundary Verification',
    `Tenant A (${dsrsTenantA.length} DSRs) and Tenant B (${dsrsTenantB.length} DSRs) completely partitioned.`
  );

  // 26. Dynamic Privacy Posture Score Calculation
  const postureA = dpdpPrivacyEngineService.getTenantPostureSummary(tenantA);
  assert(
    postureA.overallComplianceScore > 0 &&
      postureA.totalPersonalDataElements > 0 &&
      postureA.dsrSlaAdherencePct === 100,
    26,
    'Dynamic Privacy Posture Score Synthesis',
    `Calculated posture score: ${postureA.overallComplianceScore}/100 with ${postureA.totalPersonalDataElements} elements.`
  );

  // 27. Cross-Border Jurisdictional Compliance
  const crossBorderProcessors = processors.filter((p) => p.processingLocations.some((loc) => !loc.includes('India')));
  assert(
    crossBorderProcessors.length > 0 &&
      crossBorderProcessors.every((p) => p.dpaSigned === true),
    27,
    'Cross-Border Data Transfer Safeguards (§16 Governance)',
    `Verified cross-border processors have executed statutory DPA agreements.`
  );

  // 28. Minor / Children Data Protections (§9 Invariant)
  const minorReq = reqs.find((r) => r.id === 'DPDP-REQ-SEC-09');
  assert(
    minorReq !== undefined && minorReq.mappedControlCodes.includes('DPDP-CTRL-07'),
    28,
    'Children & Minor Verifiable Parental Consent Infrastructure (§9)',
    `Section 9 data principal categorization and tracking active.`
  );

  // 29. Plain Language Notice Readability & DPO Approval
  const verifiedNotice = dpdpPrivacyEngineService.getPrivacyNoticeById(tenantA, 'not-01');
  assert(
    verifiedNotice !== undefined &&
      verifiedNotice.versionHistory.length > 0 &&
      verifiedNotice.versionHistory[0].approvedByDpo.includes('DPO'),
    29,
    'Privacy Notice DPO Approval & Publication Audit Trail',
    `Notice signed off by DPO with hash ${verifiedNotice?.versionHistory[0].contentHash.substring(0, 16)}...`
  );

  // 30. Full Immutable Audit Trail Verification
  const finalElements = dpdpPrivacyEngineService.getPersonalDataInventory(tenantA);
  assert(
    finalElements.length >= 4 &&
      finalElements.every((e) => e.evidenceId && e.lastVerifiedAt),
    30,
    'End-to-End Cryptographic Evidence & Audit Trail Traceability',
    `All ${finalElements.length} inventory elements backed by verifiable evidence artifact references.`
  );

  // Summary
  console.log('\n================================================================');
  console.log('VALIDATION EXECUTION SUMMARY');
  console.log('================================================================');
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;
  console.log(`Total Validation Steps : ${results.length}`);
  console.log(`Passed                 : ${passedCount}`);
  console.log(`Failed                 : ${failedCount}`);
  console.log(`Assurance Level        : ${((passedCount / results.length) * 100).toFixed(1)}%`);

  if (failedCount > 0) {
    console.error('\n❌ VALIDATION FAILED — Review failed steps above.');
    process.exit(1);
  } else {
    console.log('\n🎉 ALL 30/30 ENTERPRISE DPDP VALIDATION STEPS PASSED SUCCESSFULLY!');
  }
}

runEnterpriseDpdpValidation().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
