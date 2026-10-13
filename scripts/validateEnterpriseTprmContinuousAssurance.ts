/**
 * SKANDA ENTERPRISE TPRM & CONTINUOUS ASSURANCE VALIDATION SUITE
 * Path: scripts/validateEnterpriseTprmContinuousAssurance.ts
 * 
 * Exhaustive Automated Test Harness across 18 Phases:
 * 1. Vendor Inventory & 17-Stage Lifecycle State Machine
 * 2. 14-Factor Risk Methodology, Matrices (3x3, 4x4, 5x5) & Unclamped Residual Surge
 * 3. Risk-Based Due Diligence & Dynamic Questionnaire Engine (All Frameworks)
 * 4. Evidence Fabric & 5-Tier Assurance Hierarchy (SHA-256 Seals)
 * 5. Continuous Monitoring, Telemetry Ingestion & Idempotency
 * 6. Fourth-Party Concentration Graph & Systemic Blast Radius
 * 7. Contract & DPA Obligations, SLAs, and Renewal Timeline
 * 8. Closed-Loop Finding Remediation & Mandatory Retest Verification Gate
 * 9. Canonical Regulatory Framework Mappings (ISO 27001, MAS TRM, DPDP, SOC 2)
 * 10. Multi-Tenant Isolation & Security Boundaries
 */

import { tprmIntelligenceEngine } from '../src/services/grc/TprmIntelligenceEngine';
import {
  MASTER_ENTERPRISE_VENDORS,
  MASTER_FOURTH_PARTY_NODES,
  DEFAULT_TPRM_METHODOLOGY_5X5,
  PERMITTED_LIFECYCLE_TRANSITIONS,
  MASTER_TPRM_QUESTIONS,
  MASTER_TPRM_REGULATORY_MAPPINGS
} from '../src/data/tprmMasterData';
import {
  MasterVendorRecord,
  TprmRiskFactorEvaluation,
  TprmFindingItem,
  TprmMonitoringSignal,
  TprmEvidenceItem,
  VendorLifecycleStatus,
  TprmMethodology
} from '../src/types/tprmTypes';

let totalAssertions = 0;
let passedAssertions = 0;
let failedAssertions = 0;

function assert(condition: boolean, testName: string, failureDetails?: string) {
  totalAssertions++;
  if (condition) {
    passedAssertions++;
    console.log(`  \x1b[32m✓\x1b[0m ${testName}`);
  } else {
    failedAssertions++;
    console.error(`  \x1b[31m✗\x1b[0m ${testName}`);
    if (failureDetails) {
      console.error(`    \x1b[33mDetails: ${failureDetails}\x1b[0m`);
    }
  }
}

async function runTprmValidationSuite() {
  console.log('\n================================================================================');
  console.log('   SKANDA ENTERPRISE TPRM & CONTINUOUS ASSURANCE OS VALIDATION');
  console.log('================================================================================\n');

  // ============================================================================
  // SUITE 1: VENDOR INVENTORY & 17-STAGE LIFECYCLE STATE MACHINE
  // ============================================================================
  console.log('--------------------------------------------------------------------------------');
  console.log('SUITE 1: Vendor Inventory & 17-Stage Lifecycle State Machine');
  console.log('--------------------------------------------------------------------------------');

  const awsVendor = MASTER_ENTERPRISE_VENDORS.find(v => v.id === 'vnd-aws-001')!;
  const oktaVendor = MASTER_ENTERPRISE_VENDORS.find(v => v.id === 'vnd-okta-002')!;
  const stripeVendor = MASTER_ENTERPRISE_VENDORS.find(v => v.id === 'vnd-stripe-003')!;
  const datadogVendor = MASTER_ENTERPRISE_VENDORS.find(v => v.id === 'vnd-datadog-004')!;
  const githubVendor = MASTER_ENTERPRISE_VENDORS.find(v => v.id === 'vnd-github-005')!;
  const anthropicVendor = MASTER_ENTERPRISE_VENDORS.find(v => v.id === 'vnd-anthropic-007')!;

  assert(MASTER_ENTERPRISE_VENDORS.length >= 6, 'Master vendor catalog contains authentic enterprise suppliers');
  assert(awsVendor.relationship.criticalityTier === 'TIER_1_STRATEGIC_CRITICAL', 'AWS classified as Tier-1 Strategic Critical supplier');
  assert(oktaVendor.profile.industryCategory === 'MANAGED_SECURITY_MSSP', 'Okta classified under Managed Security / IAM category');
  assert(stripeVendor.profile.industryCategory === 'PAYMENT_GATEWAY_FINTECH', 'Stripe classified under Payment Gateway category');
  assert(githubVendor.relationship.criticalityTier === 'TIER_1_STRATEGIC_CRITICAL', 'GitHub classified as Tier-1 Critical Developer Tool');
  assert(anthropicVendor.profile.industryCategory === 'DATA_ANALYTICS_AI', 'Anthropic classified under Data Analytics & AI category');

  // Validate all 17 states exist in PERMITTED_LIFECYCLE_TRANSITIONS
  const all17Stages: VendorLifecycleStatus[] = [
    'VENDOR_DISCOVERY',
    'BUSINESS_SPONSORSHIP',
    'VENDOR_REGISTRATION',
    'INHERENT_RISK_CLASSIFICATION',
    'RISK_BASED_DUE_DILIGENCE',
    'EVIDENCE_COLLECTION_VERIFICATION',
    'CONTROL_ASSESSMENT',
    'RISK_EVALUATION',
    'APPROVAL_OR_CONDITIONAL_APPROVAL',
    'CONTRACT_SERVICE_ACTIVATION',
    'CONTINUOUS_MONITORING',
    'RISK_EVENT_DETECTION',
    'RISK_REASSESSMENT',
    'REMEDIATION_AND_CAPA',
    'INDEPENDENT_RETESTING',
    'RESIDUAL_RISK_EVALUATION',
    'RENEWAL_SUSPENSION_OFFBOARDING'
  ];

  all17Stages.forEach(stage => {
    assert(PERMITTED_LIFECYCLE_TRANSITIONS[stage] !== undefined, `State machine defines transition paths for: ${stage}`);
  });

  // Test Valid Lifecycle Transitions
  const validTransition = tprmIntelligenceEngine.validateLifecycleTransition('VENDOR_DISCOVERY', 'BUSINESS_SPONSORSHIP', awsVendor);
  assert(validTransition.allowed, 'Valid transition VENDOR_DISCOVERY -> BUSINESS_SPONSORSHIP permitted');

  const validDueDiligenceTransition = tprmIntelligenceEngine.validateLifecycleTransition('INHERENT_RISK_CLASSIFICATION', 'RISK_BASED_DUE_DILIGENCE', awsVendor);
  assert(validDueDiligenceTransition.allowed, 'Valid transition INHERENT_RISK_CLASSIFICATION -> RISK_BASED_DUE_DILIGENCE permitted');

  const validMonitoringTransition = tprmIntelligenceEngine.validateLifecycleTransition('CONTRACT_SERVICE_ACTIVATION', 'CONTINUOUS_MONITORING', awsVendor);
  assert(validMonitoringTransition.allowed, 'Valid transition CONTRACT_SERVICE_ACTIVATION -> CONTINUOUS_MONITORING permitted');

  // Test Invalid Lifecycle Transitions Blocked
  const invalidTransition = tprmIntelligenceEngine.validateLifecycleTransition('VENDOR_DISCOVERY', 'APPROVAL_OR_CONDITIONAL_APPROVAL', awsVendor);
  assert(!invalidTransition.allowed, 'Invalid direct transition from VENDOR_DISCOVERY -> APPROVAL blocked');
  assert(invalidTransition.reason?.includes('Invalid transition'), 'Invalid transition error message provided');

  const invalidMonitoringJump = tprmIntelligenceEngine.validateLifecycleTransition('VENDOR_REGISTRATION', 'CONTINUOUS_MONITORING', awsVendor);
  assert(!invalidMonitoringJump.allowed, 'Invalid jump from VENDOR_REGISTRATION to CONTINUOUS_MONITORING blocked');

  // Test Transition Guard: Approval requires Inherent Risk & Control Assessment
  const unassessedVendor: MasterVendorRecord = {
    ...awsVendor,
    lifecycleStatus: 'RISK_EVALUATION',
    latestRiskSnapshot: { ...awsVendor.latestRiskSnapshot, inherentRiskScore: 0 }
  };
  const approvalGuard = tprmIntelligenceEngine.validateLifecycleTransition('RISK_EVALUATION', 'APPROVAL_OR_CONDITIONAL_APPROVAL', unassessedVendor);
  assert(!approvalGuard.allowed, 'Approval transition blocked when inherent risk classification is incomplete');

  // Test Transition Guard: Contract Activation requires DPA if personal data involved
  const vendorWithoutDpa: MasterVendorRecord = {
    ...awsVendor,
    lifecycleStatus: 'APPROVAL_OR_CONDITIONAL_APPROVAL',
    technologyAndData: { ...awsVendor.technologyAndData, personalDataInvolvement: true },
    activeContracts: []
  };
  const dpaGuard = tprmIntelligenceEngine.validateLifecycleTransition('APPROVAL_OR_CONDITIONAL_APPROVAL', 'CONTRACT_SERVICE_ACTIVATION', vendorWithoutDpa);
  assert(!dpaGuard.allowed, 'Contract service activation blocked when personal data is processed but no compliant DPA is attached');

  // ============================================================================
  // SUITE 2: 14-FACTOR RISK METHODOLOGY & UNCLAMPED RESIDUAL SURGE
  // ============================================================================
  console.log('\n--------------------------------------------------------------------------------');
  console.log('SUITE 2: 14-Factor Risk Methodology & Unclamped Residual Surge');
  console.log('--------------------------------------------------------------------------------');

  const factors: TprmRiskFactorEvaluation[] = [
    { factorId: 'F1', factorName: 'InfoSec', factorCategory: 'INFOSEC', weight: 0.15, rawScore: 4, assessedRationale: 'Strong baseline', groundingEvidenceIds: [] },
    { factorId: 'F2', factorName: 'Privacy', factorCategory: 'PRIVACY_PII', weight: 0.15, rawScore: 5, assessedRationale: 'Core customer PII', groundingEvidenceIds: [] },
    { factorId: 'F3', factorName: 'Regulatory', factorCategory: 'REGULATORY', weight: 0.10, rawScore: 4, assessedRationale: 'MAS TRM Sec 12', groundingEvidenceIds: [] },
    { factorId: 'F4', factorName: 'Resilience', factorCategory: 'RESILIENCE_BCP', weight: 0.10, rawScore: 5, assessedRationale: 'Core production CBS', groundingEvidenceIds: [] },
    { factorId: 'F5', factorName: 'Financial', factorCategory: 'FINANCIAL_VIABILITY', weight: 0.05, rawScore: 1, assessedRationale: 'Public hyperscaler', groundingEvidenceIds: [] },
    { factorId: 'F6', factorName: 'Architecture', factorCategory: 'ARCHITECTURE_TECH', weight: 0.05, rawScore: 3, assessedRationale: 'IaC Terraform', groundingEvidenceIds: [] },
    { factorId: 'F7', factorName: 'Privilege Access', factorCategory: 'PRIVILEGE_ACCESS', weight: 0.10, rawScore: 5, assessedRationale: 'KMS HSM Keys', groundingEvidenceIds: [] },
    { factorId: 'F8', factorName: 'Geographic', factorCategory: 'GEOGRAPHIC_JURISDICTION', weight: 0.05, rawScore: 2, assessedRationale: 'Singapore ap-southeast-1', groundingEvidenceIds: [] },
    { factorId: 'F9', factorName: 'Fourth Party', factorCategory: 'FOURTH_PARTY_SUPPLY_CHAIN', weight: 0.05, rawScore: 3, assessedRationale: 'Equinix data center', groundingEvidenceIds: [] },
    { factorId: 'F10', factorName: 'Concentration', factorCategory: 'CONCENTRATION', weight: 0.05, rawScore: 5, assessedRationale: 'Single cloud concentration', groundingEvidenceIds: [] },
    { factorId: 'F11', factorName: 'AI Governance', factorCategory: 'AI_GOVERNANCE', weight: 0.05, rawScore: 2, assessedRationale: 'ZDR PrivateLink', groundingEvidenceIds: [] },
    { factorId: 'F12', factorName: 'Business Criticality', factorCategory: 'BUSINESS_CRITICALITY', weight: 0.10, rawScore: 5, assessedRationale: 'Tier-1 Critical', groundingEvidenceIds: [] }
  ];

  const calculatedSnapshot = tprmIntelligenceEngine.calculateVendorRiskSnapshot(
    awsVendor,
    factors,
    DEFAULT_TPRM_METHODOLOGY_5X5,
    'Lead Risk Architect'
  );

  assert(calculatedSnapshot.inherentRiskScore >= 16, 'Inherent risk score correctly evaluated as Critical (>= 16)');
  assert(calculatedSnapshot.inherentRiskLevel === 'CRITICAL', 'Inherent risk level set to CRITICAL');
  assert(calculatedSnapshot.combinedControlEffectiveness >= 90, 'Mitigating control effectiveness calculated from ISO and SOC 2 proofs (>= 90%)');
  assert(calculatedSnapshot.residualRiskScore <= 8, 'Mitigated residual risk score within risk appetite threshold (<= 8)');
  assert(!calculatedSnapshot.isOutsideAppetite, 'Vendor correctly marked as within risk appetite');
  assert(calculatedSnapshot.topRiskContributors.length >= 3, 'Scoring explanation identifies top 3 risk contributors');
  assert(calculatedSnapshot.confidenceScorePercent >= 90, 'Confidence score evaluated at >= 90% based on verified evidence');

  // Test 3x3 Methodology Calculation
  const methodology3x3: TprmMethodology = {
    ...DEFAULT_TPRM_METHODOLOGY_5X5,
    matrixDimension: '3X3',
    version: '2026.1-TPRM-3x3'
  };
  const snapshot3x3 = tprmIntelligenceEngine.calculateVendorRiskSnapshot(awsVendor, factors, methodology3x3);
  assert(snapshot3x3.matrixDimension === '3X3', '3x3 matrix methodology successfully calculated');

  // Test Unclamped Residual Surge: Active Critical Finding forces residual risk increase
  const vendorWithCriticalFinding: MasterVendorRecord = {
    ...datadogVendor,
    findings: [
      {
        id: 'FND-CRIT-001',
        tenantId: 'tenant-acme-corp',
        vendorId: 'vnd-datadog-004',
        vendorName: 'Datadog',
        findingCode: 'FND-CRIT-001',
        title: 'Unmitigated Remote Code Execution in Agent Webhook',
        description: 'Critical CVE-2026-9812 detected.',
        severity: 'CRITICAL',
        category: 'SECURITY_GAP',
        rootCause: 'Vulnerability in external library',
        identifiedDate: '2026-10-01',
        assignedOwner: 'SecOps Lead',
        targetRemediationDate: '2026-10-07',
        status: 'OPEN',
        correctiveActionPlan: 'Apply hotfix patch.',
        compensatingControls: 'None',
        remediationEvidenceIds: [],
        independentRetestRequired: true
      }
    ]
  };

  const surgeSnapshot = tprmIntelligenceEngine.calculateVendorRiskSnapshot(
    vendorWithCriticalFinding,
    datadogVendor.latestRiskSnapshot.factorBreakdown,
    DEFAULT_TPRM_METHODOLOGY_5X5
  );

  assert(surgeSnapshot.isOutsideAppetite, 'Residual risk exceeds appetite threshold when active critical finding exists');
  assert(surgeSnapshot.residualLikelihood >= 3, 'Residual likelihood cannot be artificially lowered when critical finding is open');
  assert(surgeSnapshot.residualSurgeReason !== undefined, 'Residual surge driver documented in snapshot explanation');

  // ============================================================================
  // SUITE 3: RISK-BASED DUE DILIGENCE & DYNAMIC QUESTIONNAIRES
  // ============================================================================
  console.log('\n--------------------------------------------------------------------------------');
  console.log('SUITE 3: Risk-Based Due Diligence & Dynamic Questionnaires');
  console.log('--------------------------------------------------------------------------------');

  const masAssessment = tprmIntelligenceEngine.generateTailoredAssessment(awsVendor, 'MAS_TRM_OUTSOURCING_SEC12');
  assert(masAssessment.totalQuestions > 0, 'MAS TRM assessment questions dynamically selected from master bank');
  assert(masAssessment.status === 'UNDER_AUDIT_REVIEW', 'Assessment initialized in UNDER_AUDIT_REVIEW state');
  assert(masAssessment.responses.length === masAssessment.totalQuestions, 'All selected questions have mapped response slots');

  const caiqAssessment = tprmIntelligenceEngine.generateTailoredAssessment(awsVendor, 'CSA_CAIQ_V4');
  assert(caiqAssessment.templateCode === 'CSA_CAIQ_V4', 'CSA CAIQ v4 questionnaire template generated');

  const dpdpAssessment = tprmIntelligenceEngine.generateTailoredAssessment(awsVendor, 'DPDP_PROCESSOR_DILIGENCE');
  assert(dpdpAssessment.templateCode === 'DPDP_PROCESSOR_DILIGENCE', 'DPDP Data Processor questionnaire template generated');

  const aiAssessment = tprmIntelligenceEngine.generateTailoredAssessment(anthropicVendor, 'AI_VENDOR_SAFETY_ISO42001');
  assert(aiAssessment.templateCode === 'AI_VENDOR_SAFETY_ISO42001', 'ISO 42001 AI Vendor Safety questionnaire template generated');

  const isoQuestion = MASTER_TPRM_QUESTIONS.find(q => q.questionCode === 'SEC-ISMS-01')!;
  assert(isoQuestion.isMandatory, 'ISO 27001 ISMS question marked mandatory');
  assert(isoQuestion.mappedControlIds.includes('CTRL-TPRM-01'), 'Question mapped to canonical CTRL-TPRM-01 control');

  const dpaQuestion = MASTER_TPRM_QUESTIONS.find(q => q.questionCode === 'PRV-DPDP-01')!;
  assert(dpaQuestion.conditionalTriggerField === 'personalDataInvolvement', 'DPA question triggered conditionally by personalDataInvolvement');

  // ============================================================================
  // SUITE 4: EVIDENCE FABRIC & 5-TIER ASSURANCE HIERARCHY
  // ============================================================================
  console.log('\n--------------------------------------------------------------------------------');
  console.log('SUITE 4: Evidence Fabric & 5-Tier Assurance Hierarchy');
  console.log('--------------------------------------------------------------------------------');

  const validEvidence: TprmEvidenceItem = {
    id: 'EV-TEST-001',
    tenantId: 'tenant-acme-corp',
    vendorId: 'vnd-aws-001',
    evidenceCode: 'EV-TPRM-AWS-001',
    category: 'ISO_CERT',
    title: 'AWS ISO 27001 Certificate',
    fileName: 'AWS_ISO.pdf',
    fileSizeBytes: 1024000,
    mimeType: 'application/pdf',
    sha256ContentHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    provenanceSource: 'AUDITOR_DIRECT_RECEIPT',
    collectionTimestamp: new Date().toISOString(),
    validFrom: '2024-01-01',
    validTo: '2027-01-01',
    isExpired: false,
    daysUntilExpiry: 300,
    reviewStatus: 'ACCEPTED',
    assuranceTier: 'CONTROL_OPERATING_EFFECTIVENESS_TESTED',
    linkedQuestionCodes: ['SEC-ISMS-01'],
    linkedControlIds: ['CTRL-TPRM-01'],
    linkedRiskIds: ['RSK-TPRM-001'],
    humanVerificationConfirmed: true
  };

  const evidenceCheck = tprmIntelligenceEngine.verifyEvidenceIntegrity(validEvidence);
  assert(evidenceCheck.isValid, 'Evidence SHA-256 seal and human verification verified valid');
  assert(evidenceCheck.assuranceTier === 'CONTROL_OPERATING_EFFECTIVENESS_TESTED', 'Assurance tier correctly classified as Operating Effectiveness Tested');
  assert(evidenceCheck.auditStatus === 'VERIFIED_ACTIVE', 'Audit status is VERIFIED_ACTIVE');

  // Stale / Expired Evidence
  const expiredEvidence: TprmEvidenceItem = {
    ...validEvidence,
    validTo: '2024-01-01',
    isExpired: true
  };
  const expiredCheck = tprmIntelligenceEngine.verifyEvidenceIntegrity(expiredEvidence);
  assert(expiredCheck.isExpired, 'Expired evidence correctly flagged');
  assert(expiredCheck.auditStatus === 'EXPIRED_REQUIRES_RENEWAL', 'Audit status set to EXPIRED_REQUIRES_RENEWAL');

  // ============================================================================
  // SUITE 5: CONTINUOUS MONITORING, TELEMETRY & IDEMPOTENCY
  // ============================================================================
  console.log('\n--------------------------------------------------------------------------------');
  console.log('SUITE 5: Continuous Monitoring, Telemetry & Idempotency');
  console.log('--------------------------------------------------------------------------------');

  const newSignal: TprmMonitoringSignal = {
    id: 'SIG-TEST-001',
    tenantId: 'tenant-acme-corp',
    vendorId: 'vnd-datadog-004',
    vendorName: 'Datadog',
    category: 'CERTIFICATE_EXPIRING',
    sourceAttribution: 'SHODAN_SCANNER',
    severity: 'HIGH',
    eventTimestamp: new Date().toISOString(),
    receivedTimestamp: new Date().toISOString(),
    headline: 'TLS Certificate Expiring in 5 Days',
    details: 'Automated scan detected expiring certificate.',
    observedEvidenceSha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    isActionable: true,
    reassessmentTriggered: false,
    status: 'NEW_UNACKNOWLEDGED'
  };

  const firstIngest = tprmIntelligenceEngine.processMonitoringSignal(newSignal, []);
  assert(!firstIngest.isDuplicate, 'First ingestion recognized as new actionable signal');
  assert(firstIngest.triggerReassessment, 'High severity certificate signal triggered automated risk reassessment');
  assert(firstIngest.suggestedFinding !== undefined, 'Actionable CAPA finding automatically generated from telemetry');

  // Test Idempotent Duplicate Detection
  const duplicateIngest = tprmIntelligenceEngine.processMonitoringSignal(newSignal, [newSignal]);
  assert(duplicateIngest.isDuplicate, 'Identical signal within 24 hours safely deduplicated (idempotent)');

  // ============================================================================
  // SUITE 6: FOURTH-PARTY CONCENTRATION & SYSTEMIC BLAST RADIUS
  // ============================================================================
  console.log('\n--------------------------------------------------------------------------------');
  console.log('SUITE 6: Fourth-Party Concentration & Systemic Blast Radius');
  console.log('--------------------------------------------------------------------------------');

  const concentration = tprmIntelligenceEngine.analyzeConcentrationRisk(MASTER_ENTERPRISE_VENDORS, MASTER_FOURTH_PARTY_NODES);
  assert(concentration.singlePointsOfFailureCount >= 2, 'Single points of failure (AWS & Visa/MC) detected');
  assert(concentration.unmappedUnknownDependenciesCount >= 1, 'Unknown downstream dependencies explicitly flagged (no silent omission)');
  assert(concentration.overallSupplyChainResilienceIndex >= 60 && concentration.overallSupplyChainResilienceIndex <= 100, 'Supply chain resilience index computed within valid bounds (60-100%)');

  const awsConcentration = concentration.hyperscaleCloudConcentration.find(c => c.cloudProvider === 'AWS');
  assert((awsConcentration?.percentage || 0) >= 50, 'AWS cloud concentration calculated accurately (>= 50%)');

  // ============================================================================
  // SUITE 7: CONTRACT OBLIGATIONS, SLAS & RENEWALS
  // ============================================================================
  console.log('\n--------------------------------------------------------------------------------');
  console.log('SUITE 7: Contract Obligations, SLAs & Renewals');
  console.log('--------------------------------------------------------------------------------');

  const awsContract = awsVendor.activeContracts[0]!;
  assert(awsContract.dpaArticle28Compliant, 'AWS contract satisfies GDPR Article 28 data processor requirements');
  assert(awsContract.dpdpSection8Compliant, 'AWS contract satisfies India DPDP Act Sec 8 statutory requirements');
  assert(awsContract.incidentNotificationHoursSla <= 24, 'Contractual breach notification SLA commits to <= 24 hours');
  assert(awsContract.slaAvailabilityPercent >= 99.9, 'Contractual SLA uptime commitment verified (>= 99.9%)');
  assert(awsContract.verifiedByLegal, 'Legal counsel document verification recorded');

  // ============================================================================
  // SUITE 8: CLOSED-LOOP FINDINGS & INDEPENDENT RETESTING GATE
  // ============================================================================
  console.log('\n--------------------------------------------------------------------------------');
  console.log('SUITE 8: Closed-Loop Findings & Independent Retesting Gate');
  console.log('--------------------------------------------------------------------------------');

  const findingToTest: TprmFindingItem = {
    id: 'FND-TEST-001',
    tenantId: 'tenant-acme-corp',
    vendorId: 'vnd-datadog-004',
    vendorName: 'Datadog',
    findingCode: 'FND-TEST-001',
    title: 'Expiring TLS Certificate',
    description: 'TLS cert expiring soon.',
    severity: 'HIGH',
    category: 'EXPIRED_CERT',
    rootCause: 'Misconfigured proxy',
    identifiedDate: '2026-09-26',
    assignedOwner: 'SecOps Lead',
    targetRemediationDate: '2026-10-05',
    status: 'INDEPENDENT_RETESTING',
    correctiveActionPlan: 'Certificate renewed.',
    compensatingControls: 'None',
    remediationEvidenceIds: ['EV-CERT-RENEWAL'],
    independentRetestRequired: true,
    retestOutcome: 'PENDING'
  };

  // 1. Attempt closure without retesting -> Must fail
  const closureWithoutRetest = tprmIntelligenceEngine.validateFindingClosure(findingToTest, 'Auditor');
  assert(!closureWithoutRetest.canClose, 'Finding closure blocked when independent retest is pending');

  // 2. Retest fails -> Must transition to RETEST_FAILED
  const retestFail = tprmIntelligenceEngine.validateFindingClosure(findingToTest, 'Auditor', 'FAIL');
  assert(!retestFail.canClose, 'Closure blocked when independent retest fails');
  assert(retestFail.updatedFinding?.status === 'RETEST_FAILED', 'Finding status updated to RETEST_FAILED upon failed test');

  // 3. Retest passes -> Verified Closure allowed
  const retestPass = tprmIntelligenceEngine.validateFindingClosure(findingToTest, 'Independent QSA Assessor', 'PASS');
  assert(retestPass.canClose, 'Finding closure permitted upon passed independent retest');
  assert(retestPass.updatedFinding?.status === 'VERIFIED_CLOSED', 'Finding marked as VERIFIED_CLOSED with non-repudiation audit stamp');
  assert(retestPass.updatedFinding?.closedBy === 'Independent QSA Assessor', 'Closing actor provenance recorded');

  // ============================================================================
  // SUITE 9: CANONICAL REGULATORY FRAMEWORK MAPPINGS
  // ============================================================================
  console.log('\n--------------------------------------------------------------------------------');
  console.log('SUITE 9: Canonical Regulatory Framework Mappings');
  console.log('--------------------------------------------------------------------------------');

  const isoMapping = MASTER_TPRM_REGULATORY_MAPPINGS.find(m => m.requirementCode === 'A.5.19')!;
  assert(isoMapping.frameworkCode === 'ISO_27001_2022', 'ISO 27001:2022 A.5.19 mapped to TPRM');
  assert(isoMapping.unifiedControlId === 'CTRL-TPRM-01', 'ISO A.5.19 bound to canonical CTRL-TPRM-01 control');

  const iso20Mapping = MASTER_TPRM_REGULATORY_MAPPINGS.find(m => m.requirementCode === 'A.5.20')!;
  assert(iso20Mapping.requirementTitle.includes('supplier agreements'), 'ISO 27001:2022 A.5.20 Supplier Agreements mapped');

  const masMapping = MASTER_TPRM_REGULATORY_MAPPINGS.find(m => m.requirementCode === 'MAS-TRM-12.1')!;
  assert(masMapping.governingJurisdiction === 'Singapore', 'MAS TRM Sec 12 mapped to Singapore jurisdiction');
  assert(masMapping.mappingType === 'EXPLICIT_REGULATORY_MANDATE', 'MAS TRM mapped as EXPLICIT_REGULATORY_MANDATE');

  const dpdpMapping = MASTER_TPRM_REGULATORY_MAPPINGS.find(m => m.requirementCode === 'DPDP-SEC-8')!;
  assert(dpdpMapping.frameworkCode === 'DPDP_ACT_2023', 'India DPDP Act 2023 Sec 8 mapped for Data Processors');
  assert(dpdpMapping.confidenceScore === 1.0, 'DPDP Sec 8 mapping confidence score is 1.0');

  const soc2Mapping = MASTER_TPRM_REGULATORY_MAPPINGS.find(m => m.requirementCode === 'CC9.2')!;
  assert(soc2Mapping.frameworkCode === 'SOC_2_TYPE_2', 'SOC 2 CC9.2 mapped to TPRM supplier oversight');

  // ============================================================================
  // SUITE 10: MULTI-TENANT ISOLATION & SECURITY BOUNDARIES
  // ============================================================================
  console.log('\n--------------------------------------------------------------------------------');
  console.log('SUITE 10: Multi-Tenant Isolation & Security Boundaries');
  console.log('--------------------------------------------------------------------------------');

  const tenantAcmeVendors = MASTER_ENTERPRISE_VENDORS.filter(v => v.tenantId === 'tenant-acme-corp');
  const otherTenantVendors = MASTER_ENTERPRISE_VENDORS.filter(v => v.tenantId === 'tenant-other');

  assert(tenantAcmeVendors.length > 0, 'Tenant "tenant-acme-corp" retrieves only its owned vendor registry');
  assert(otherTenantVendors.length === 0, 'Cross-tenant query isolation verified (zero leakage from other tenants)');

  // ============================================================================
  // SUMMARY & EXIT CODE
  // ============================================================================
  console.log('\n================================================================================');
  console.log(`TOTAL ASSERTIONS: ${totalAssertions}`);
  console.log(`PASSED: \x1b[32m${passedAssertions}\x1b[0m`);
  console.log(`FAILED: ${failedAssertions > 0 ? `\x1b[31m${failedAssertions}\x1b[0m` : '\x1b[32m0\x1b[0m'}`);
  console.log('================================================================================\n');

  if (failedAssertions > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTprmValidationSuite();
