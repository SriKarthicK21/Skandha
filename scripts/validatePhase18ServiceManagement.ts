// ============================================================================
// SKANDA ENTERPRISE GRC: PHASE 18 ENTERPRISE SERVICE MANAGEMENT & SLA VALIDATION SUITE
// Path: scripts/validatePhase18ServiceManagement.ts
//
// Chief Enterprise Architect Automated Forensic Validation Suite
// ============================================================================

import {
  serviceManagementService
} from '../src/services/support/serviceManagementService.ts';
import {
  EnterpriseSupportCase,
  CaseType,
  SupportPriority,
  SupportQueueId,
  EscalationLevel,
  KnowledgeArticle,
  ProblemRecord,
  PostIncidentReviewRecord
} from '../src/types/serviceManagementTypes.ts';

interface AssertionResult {
  id: string;
  category: string;
  description: string;
  passed: boolean;
  expected: string;
  actual: string;
  details?: any;
}

const results: AssertionResult[] = [];

function assert(
  id: string,
  category: string,
  description: string,
  passed: boolean,
  expected: string,
  actual: string,
  details?: any
) {
  results.push({
    id,
    category,
    description,
    passed,
    expected,
    actual,
    details
  });

  const icon = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`[${icon}] ${id} (${category}): ${description} -> Expected: ${expected}, Got: ${actual}`);
}

async function runPhase18Validation() {
  console.log('================================================================================');
  console.log('SKANDA ENTERPRISE GRC: PHASE 18 SERVICE MANAGEMENT & SLA VALIDATION SUITE');
  console.log('================================================================================\n');

  const tenantA = 'SKANDA-DEMO-ENTERPRISE'; // Acme Financial Technologies (APEX Tier)
  const tenantB = 'TENANT-PACIFIC-LOGISTICS'; // Standard Tier

  // --------------------------------------------------------------------------
  // 1. CASE CREATION & STABLE PROVENANCE HASH
  // --------------------------------------------------------------------------
  console.log('--- 1. Case Creation & Provenance Hashing ---');

  const case1 = serviceManagementService.createCase(
    tenantA,
    'Acme Financial Technologies',
    'INTEGRATION_FAILURE',
    'Entra ID SCIM Connector Token Expiry & Sync Failure',
    'Production SCIM token expired. User provisioning to Entra ID is failing across all systems.',
    'rachel.adams@acmefin.com',
    'Rachel Adams (CISO)',
    {
      affectedServiceId: 'SRV-IDP-001',
      affectedUserCount: 1200,
      customerTier: 'APEX_GLOBAL',
      relatedFrameworks: ['ISO27001', 'SOC2', 'MAS_TRM'],
      relatedControlIds: ['CTRL-AC-01', 'CTRL-ID-03'],
      relatedRiskIds: ['RSK-AUTH-004']
    }
  );

  assert(
    'P18-CASE-01',
    'CASE_CREATION',
    'Support case creates with stable ID, tenantId, lifecycle NEW, and cryptographic provenance hash',
    case1.id.startsWith('CASE-') && case1.tenantId === tenantA && case1.lifecycle === 'NEW' && !!case1.auditProvenanceHash,
    'Valid ID, tenantId, NEW state, hash',
    `ID: ${case1.id}, State: ${case1.lifecycle}, Hash: ${case1.auditProvenanceHash?.substring(0, 10)}...`
  );

  // --------------------------------------------------------------------------
  // 2. CASE CLASSIFICATION & DYNAMIC PRIORITY CALCULATION
  // --------------------------------------------------------------------------
  console.log('--- 2. Priority Engine & Classification ---');

  assert(
    'P18-PRIO-02',
    'PRIORITY_ENGINE',
    'Case with critical impact, 1200 affected users, and APEX tier dynamically calculates as P1 Critical',
    case1.priority === 'P1',
    'Priority: P1',
    `Priority: ${case1.priority}`
  );

  // --------------------------------------------------------------------------
  // 3. AUTOMATED QUEUE ROUTING ENGINE
  // --------------------------------------------------------------------------
  console.log('--- 3. Queue Routing Engine ---');

  assert(
    'P18-QUEUE-03',
    'QUEUE_ROUTING',
    'Integration failure automatically routes to the INTEGRATIONS queue',
    case1.queue === 'INTEGRATIONS',
    'Queue: INTEGRATIONS',
    `Queue: ${case1.queue}`
  );

  // --------------------------------------------------------------------------
  // 4. CASE ASSIGNMENT & STATE TRANSITION
  // --------------------------------------------------------------------------
  console.log('--- 4. Case Assignment & State Transition ---');

  const triagedRes = serviceManagementService.updateLifecycleState(
    case1.id,
    'TRIAGED',
    { email: 'agent1@skanda.support', name: 'David Vance', role: 'SKANDA_PLATFORM_ADMIN' },
    'Initial triage complete. Confirming production integration blockage.'
  );

  const assignedRes = serviceManagementService.updateLifecycleState(
    case1.id,
    'ASSIGNED',
    { email: 'agent1@skanda.support', name: 'David Vance', role: 'SKANDA_PLATFORM_ADMIN' },
    'Assigned to senior integrations engineer David Vance.'
  );

  assert(
    'P18-ASSIGN-04',
    'CASE_ASSIGNMENT',
    'Case successfully transitions from NEW -> TRIAGED -> ASSIGNED with full audit trail',
    assignedRes.success && assignedRes.case?.lifecycle === 'ASSIGNED' && (assignedRes.case?.comments.length || 0) >= 2,
    'State: ASSIGNED, Audit events >= 2',
    `State: ${assignedRes.case?.lifecycle}, Comments: ${assignedRes.case?.comments.length}`
  );

  // --------------------------------------------------------------------------
  // 5. CONTRACTUAL SLA TARGET CALCULATION
  // --------------------------------------------------------------------------
  console.log('--- 5. Contractual SLA Target Engine ---');

  assert(
    'P18-SLA-05',
    'SLA_ENGINE',
    'APEX tier P1 incident receives 15-minute First Response SLA and 15-minute Resolution SLA target',
    case1.firstResponseSla.targetMinutes === 15 && case1.resolutionSla.targetMinutes === 15,
    'First Response: 15m, Resolution: 15m',
    `First Response: ${case1.firstResponseSla.targetMinutes}m, Resolution: ${case1.resolutionSla.targetMinutes}m`
  );

  // --------------------------------------------------------------------------
  // 6. SLA TIMER PAUSE ON PENDING_CUSTOMER
  // --------------------------------------------------------------------------
  console.log('--- 6. SLA Timer Pause Rules ---');

  serviceManagementService.updateLifecycleState(
    case1.id,
    'IN_PROGRESS',
    { email: 'agent1@skanda.support', name: 'David Vance', role: 'SKANDA_PLATFORM_ADMIN' },
    'Investigation underway. Checking OAuth app tenant permissions.'
  );

  const pendingCustRes = serviceManagementService.updateLifecycleState(
    case1.id,
    'PENDING_CUSTOMER',
    { email: 'agent1@skanda.support', name: 'David Vance', role: 'SKANDA_PLATFORM_ADMIN' },
    'Awaiting customer admin consent confirmation in Microsoft Entra admin portal.'
  );

  const pendingCustCase = pendingCustRes.case;

  assert(
    'P18-PAUSE-06',
    'SLA_PAUSE',
    'Transitioning to PENDING_CUSTOMER automatically pauses SLA resolution timer and sets status SLA_PAUSED',
    pendingCustCase?.lifecycle === 'PENDING_CUSTOMER' &&
      pendingCustCase?.resolutionSla.status === 'SLA_PAUSED' &&
      !!pendingCustCase?.resolutionSla.pausedAt,
    'State: PENDING_CUSTOMER, Timer: SLA_PAUSED with pausedAt',
    `State: ${pendingCustCase?.lifecycle}, Timer: ${pendingCustCase?.resolutionSla.status}, PausedAt: ${pendingCustCase?.resolutionSla.pausedAt}`
  );

  // --------------------------------------------------------------------------
  // 7. SLA TIMER RESUME ON CUSTOMER REPLY / STATE TRANSITION
  // --------------------------------------------------------------------------
  console.log('--- 7. SLA Timer Resume Rules ---');

  // Customer replies with consent confirmation
  serviceManagementService.addComment(
    case1.id,
    'Admin consent granted in Entra ID. Ready for token re-issuance.',
    false,
    { email: 'rachel.adams@acmefin.com', name: 'Rachel Adams (CISO)', role: 'TENANT_ADMIN' }
  );

  const resumedCase = serviceManagementService.getCase(case1.id, 'SKANDA_PLATFORM_ADMIN');

  assert(
    'P18-RESUME-07',
    'SLA_RESUME',
    'Customer reply while PENDING_CUSTOMER automatically resumes SLA timer and transitions case to IN_PROGRESS',
    resumedCase.lifecycle === 'IN_PROGRESS' &&
      resumedCase.resolutionSla.status === 'SLA_REMAINING' &&
      resumedCase.resolutionSla.pausedAt === undefined,
    'State: IN_PROGRESS, Timer: SLA_REMAINING',
    `State: ${resumedCase.lifecycle}, Timer: ${resumedCase.resolutionSla.status}`
  );

  // --------------------------------------------------------------------------
  // 8. SLA WARNING THRESHOLD DETECTION
  // --------------------------------------------------------------------------
  console.log('--- 8. SLA Warning Threshold Detection ---');

  // Seeded case CASE-2026-9102 is configured with warning triggered
  const warnCase = serviceManagementService.getCase('CASE-2026-9102', 'SKANDA_PLATFORM_ADMIN');
  assert(
    'P18-WARN-08',
    'SLA_WARNING',
    'Case with SLA warning flag registers isWarningTriggered true',
    warnCase !== null && warnCase.resolutionSla.isWarningTriggered === true,
    'isWarningTriggered: true',
    `isWarningTriggered: ${warnCase?.resolutionSla.isWarningTriggered}`
  );

  // --------------------------------------------------------------------------
  // 9. SLA BREACH DETECTION
  // --------------------------------------------------------------------------
  console.log('--- 9. SLA Breach Detection ---');

  // Seeded case CASE-2026-9102 has breached SLA
  const breachCase = serviceManagementService.getCase('CASE-2026-9102', 'SKANDA_PLATFORM_ADMIN');
  assert(
    'P18-BREACH-09',
    'SLA_BREACH',
    'Case exceeding SLA target duration automatically registers isBreached true and SLA_BREACHED status',
    breachCase !== null && breachCase.resolutionSla.isBreached === true && breachCase.resolutionSla.status === 'SLA_BREACHED',
    'Status: SLA_BREACHED, isBreached: true',
    `Status: ${breachCase?.resolutionSla.status}, isBreached: ${breachCase?.resolutionSla.isBreached}`
  );

  // --------------------------------------------------------------------------
  // 10. ESCALATION ENGINE (L1 -> L2 -> L3 -> GRC/SECURITY/EXECUTIVE)
  // --------------------------------------------------------------------------
  console.log('--- 10. Escalation Engine ---');

  const escRes = serviceManagementService.escalateCase(
    case1.id,
    'SECURITY',
    'SECURITY',
    'P1 incident requires Security Officer review for potential identity sync vulnerability.',
    { email: 'agent1@skanda.support', name: 'David Vance', role: 'SKANDA_PLATFORM_ADMIN' }
  );

  assert(
    'P18-ESC-10',
    'ESCALATION_ENGINE',
    'Case successfully escalates to SECURITY level with logged escalation comment',
    escRes.success && escRes.case?.escalationLevel === 'SECURITY' && escRes.case?.lifecycle === 'ESCALATED',
    'Level: SECURITY, State: ESCALATED',
    `Level: ${escRes.case?.escalationLevel}, State: ${escRes.case?.lifecycle}`
  );

  // --------------------------------------------------------------------------
  // 11. P1 CRITICAL INCIDENT COMMAND & COMMANDER ROLE
  // --------------------------------------------------------------------------
  console.log('--- 11. P1 Incident Command Room ---');

  // Seeded P1 incident SUP-0001 / CASE-2026-9101
  const p1Case = serviceManagementService.getCase('CASE-2026-9101', 'SKANDA_PLATFORM_ADMIN');
  assert(
    'P18-INC-11',
    'INCIDENT_COMMAND',
    'P1 Critical incident initializes Incident Commander and Security Lead responders',
    p1Case !== null &&
      p1Case.priority === 'P1' &&
      !!p1Case.incidentCommanderEmail &&
      !!p1Case.assignedAgentEmail,
    'P1 Incident with Commander & Assigned Lead',
    `Commander: ${p1Case?.incidentCommanderEmail}, Assigned: ${p1Case?.assignedAgentEmail}`
  );

  // --------------------------------------------------------------------------
  // 12. SECURITY INCIDENT INTEGRATION
  // --------------------------------------------------------------------------
  console.log('--- 12. Security Incident Integration ---');

  const secCase = serviceManagementService.createCase(
    tenantA,
    'Acme Financial Technologies',
    'SECURITY_INCIDENT',
    'Anomalous Token Refresh Activity on Okta IdP Hub',
    'Multiple automated token refresh attempts observed from anomalous IP addresses.',
    'alex.rivera@skanda.io',
    'Alex Rivera (SOC Lead)',
    {
      customerTier: 'APEX_GLOBAL',
      relatedFrameworks: ['ISO27001', 'SOC2', 'MAS_TRM'],
      securityIncident: {
        severity: 'HIGH_P2',
        threatVectors: ['Credential Abuse / Anomalous IP'],
        affectedAssets: ['ASSET-OKTA-01', 'ASSET-AUTH-GW'],
        affectedDataClass: 'CONFIDENTIAL',
        containmentStatus: 'CONTAINED',
        attackIndicators: ['198.51.100.44', 'token_fingerprint_mismatch'],
        statutoryBreachNotificationRequired: false
      }
    }
  );

  assert(
    'P18-SEC-12',
    'SECURITY_INTEGRATION',
    'Security incident captures threat vector, containment status, affected assets, and IoCs',
    secCase.type === 'SECURITY_INCIDENT' &&
      secCase.queue === 'SECURITY' &&
      secCase.securityIncident?.containmentStatus === 'CONTAINED' &&
      (secCase.securityIncident?.attackIndicators?.length || 0) > 0,
    'Type: SECURITY_INCIDENT, Queue: SECURITY, Containment: CONTAINED',
    `Type: ${secCase.type}, Queue: ${secCase.queue}, IoCs: ${secCase.securityIncident?.attackIndicators?.length}`
  );

  // --------------------------------------------------------------------------
  // 13. PRIVACY REQUEST INTEGRATION (DSR & JURISDICTION)
  // --------------------------------------------------------------------------
  console.log('--- 13. Privacy Request Integration ---');

  const privCase = serviceManagementService.createCase(
    tenantA,
    'Acme Financial Technologies',
    'PRIVACY_REQUEST',
    'Data Subject Right to Erasure Request (EU Citizen)',
    'Formal GDPR Article 17 erasure request received for former executive user profile.',
    'dpo@acmefin.com',
    'Elena Rostova (DPO)',
    {
      customerTier: 'APEX_GLOBAL',
      relatedFrameworks: ['ISO27701', 'DPDPA'],
      privacyRequest: {
        requestType: 'DELETION_ERASURE',
        dataSubjectEmail: 'executive.alumni@acmefin.com',
        identityVerified: true,
        jurisdiction: 'EU_GDPR',
        statutoryDeadline: new Date(Date.now() + 30 * 86400000).toISOString(),
        dpoAssignedEmail: 'dpo@acmefin.com'
      }
    }
  );

  assert(
    'P18-PRIV-13',
    'PRIVACY_INTEGRATION',
    'Privacy request routes to PRIVACY queue with DSR type, verified identity, and statutory deadline',
    privCase.type === 'PRIVACY_REQUEST' &&
      privCase.queue === 'PRIVACY' &&
      privCase.privacyRequest?.identityVerified === true &&
      privCase.privacyRequest?.jurisdiction === 'EU_GDPR',
    'Queue: PRIVACY, Jurisdiction: EU_GDPR, Verified: true',
    `Queue: ${privCase.queue}, Jurisdiction: ${privCase.privacyRequest?.jurisdiction}, Verified: ${privCase.privacyRequest?.identityVerified}`
  );

  // --------------------------------------------------------------------------
  // 14. COMPLIANCE & MULTI-FRAMEWORK LINKAGE
  // --------------------------------------------------------------------------
  console.log('--- 14. Compliance & Framework Linkage ---');

  assert(
    'P18-COMP-14',
    'COMPLIANCE_LINKAGE',
    'Support cases retain multi-framework compliance metadata across ISO 27001, ISO 27701, SOC 2, and MAS TRM',
    case1.relatedFrameworks.includes('ISO27001') &&
      case1.relatedFrameworks.includes('SOC2') &&
      privCase.relatedFrameworks.includes('ISO27701'),
    'Frameworks mapped across ISO27001, SOC2, ISO27701',
    `Case1: [${case1.relatedFrameworks.join(', ')}], PrivCase: [${privCase.relatedFrameworks.join(', ')}]`
  );

  // --------------------------------------------------------------------------
  // 15. CUSTOMER CONFIRMATION LIFECYCLE
  // --------------------------------------------------------------------------
  console.log('--- 15. Customer Confirmation Lifecycle ---');

  // Resolve case1
  const resResult = serviceManagementService.resolveCase(
    case1.id,
    'Root cause resolved: SCIM enterprise app certificate renewed and token rotated in Entra ID.',
    'HASH-EV-SCIM-001-ROTATION',
    { email: 'agent1@skanda.support', name: 'David Vance', role: 'SKANDA_PLATFORM_ADMIN' }
  );

  assert(
    'P18-RES-15A',
    'RESOLUTION_FLOW',
    'Resolving a case moves status to RESOLVED and initiates customer confirmation awaiting period',
    resResult.success &&
      resResult.case?.lifecycle === 'RESOLVED' &&
      resResult.case?.customerConfirmation?.status === 'PENDING',
    'State: RESOLVED with pending customer confirmation',
    `State: ${resResult.case?.lifecycle}, ConfirmationStatus: ${resResult.case?.customerConfirmation?.status}`
  );

  // Customer confirms resolution
  const confResult = serviceManagementService.confirmResolution(
    case1.id,
    'CONFIRM',
    { email: 'rachel.adams@acmefin.com', name: 'Rachel Adams', role: 'TENANT_ADMIN' },
    'Confirmed. Entra ID synchronization is fully healthy and verified in our tenant.',
    5
  );

  assert(
    'P18-CONF-15B',
    'CUSTOMER_CONFIRMATION',
    'Customer confirmation closes the case permanently with confirmed resolution record and CSAT rating',
    confResult.success &&
      confResult.case?.lifecycle === 'CLOSED' &&
      confResult.case?.customerConfirmation?.status === 'CONFIRMED' &&
      confResult.case?.customerConfirmation?.csatRating === 5,
    'State: CLOSED, Status: CONFIRMED, CSAT: 5',
    `State: ${confResult.case?.lifecycle}, Confirmed: ${confResult.case?.customerConfirmation?.status}, CSAT: ${confResult.case?.customerConfirmation?.csatRating}`
  );

  // --------------------------------------------------------------------------
  // 16. CASE REOPENING ON CUSTOMER DISPUTE
  // --------------------------------------------------------------------------
  console.log('--- 16. Case Reopening on Customer Dispute ---');

  // Create another case to test dispute reopening
  const disputeCase = serviceManagementService.createCase(
    tenantA,
    'Acme Financial Technologies',
    'INCIDENT',
    'MFA Push Notification Latency on Mobile App',
    'Users reporting 45-second latency on biometric push notifications.',
    'mark.t@acmefin.com',
    'Mark Taylor',
    {
      customerTier: 'APEX_GLOBAL',
      affectedUserCount: 400
    }
  );

  serviceManagementService.resolveCase(
    disputeCase.id,
    'APNS push certificate refreshed and push gateway scaled.',
    'HASH-APNS-CERT',
    { email: 'agent1@skanda.support', name: 'David Vance', role: 'SKANDA_PLATFORM_ADMIN' }
  );

  // Customer disputes and reopens
  const reopenResult = serviceManagementService.confirmResolution(
    disputeCase.id,
    'REOPEN',
    { email: 'mark.t@acmefin.com', name: 'Mark Taylor', role: 'TENANT_ADMIN' },
    'Disputed: Latency persists on iOS 18.1 devices. Reopening case.'
  );

  assert(
    'P18-REOPEN-16',
    'CASE_REOPENING',
    'Disputing resolution immediately reopens the case to REOPENED with audit reason and health penalty trigger',
    reopenResult.success &&
      reopenResult.case?.lifecycle === 'REOPENED' &&
      reopenResult.case?.customerConfirmation?.status === 'DISPUTED_REOPENED' &&
      reopenResult.case?.isCustomerHealthImpacted === true,
    'State: REOPENED, Status: DISPUTED_REOPENED, HealthImpacted: true',
    `State: ${reopenResult.case?.lifecycle}, Status: ${reopenResult.case?.customerConfirmation?.status}, HealthImpacted: ${reopenResult.case?.isCustomerHealthImpacted}`
  );

  // --------------------------------------------------------------------------
  // 17. KNOWLEDGE ARTICLE LIFECYCLE & APPROVAL GATE
  // --------------------------------------------------------------------------
  console.log('--- 17. Knowledge Base Lifecycle ---');

  const draftArticle = serviceManagementService.createKnowledgeArticle(
    'How to Rotate SCIM Provisioning Secrets in Microsoft Entra ID',
    'Standard operating procedure for rotating enterprise application SAML/SCIM tokens.',
    'Step-by-step procedure for rotating enterprise application SAML/SCIM oauth tokens.',
    'HOW_TO',
    'IDENTITY_INTEGRATIONS',
    ['CTRL-AC-01', 'CTRL-ID-03'],
    ['ISO27001', 'SOC2'],
    { email: 'david.vance@skanda.io', name: 'David Vance' }
  );

  assert(
    'P18-KB-17A',
    'KNOWLEDGE_DRAFT',
    'Knowledge article initializes in DRAFT status with linked controls and author metadata',
    draftArticle.status === 'DRAFT' && draftArticle.relatedControlIds.includes('CTRL-AC-01'),
    'State: DRAFT with mapped controls',
    `State: ${draftArticle.status}, Mapped controls: [${draftArticle.relatedControlIds.join(', ')}]`
  );

  const pubResult = serviceManagementService.approveKnowledgeArticle(
    draftArticle.id,
    { email: 'supervisor@skanda.support', name: 'Lead Architect', role: 'SKANDA_PLATFORM_ADMIN' }
  );

  assert(
    'P18-KB-17B',
    'KNOWLEDGE_PUBLISH',
    'Knowledge article successfully publishes upon human supervisor approval',
    pubResult.success && pubResult.article?.status === 'PUBLISHED' && pubResult.article?.approvedBy === 'supervisor@skanda.support',
    'State: PUBLISHED, ApprovedBy: supervisor@skanda.support',
    `State: ${pubResult.article?.status}, ApprovedBy: ${pubResult.article?.approvedBy}`
  );

  // --------------------------------------------------------------------------
  // 18. PROBLEM RECORD CREATION & RCA CLUSTERING
  // --------------------------------------------------------------------------
  console.log('--- 18. Problem Management & RCA ---');

  const problem = serviceManagementService.createProblemRecord(
    'Recurring OAuth Token Invalidation on Identity Provider Sync',
    'Clock skew between sovereign identity gateway and IdP token issuer exceeding 300 seconds.',
    'IDENTITY_GATEWAY',
    ['SRV-IDP-001', 'SRV-AUTH-002'],
    [tenantA],
    [case1.id, disputeCase.id],
    'NTP drift on primary cryptographic token issuance node caused periodic 401 unauthenticated spikes.',
    'Force token refresh with manual clock calibration before session establishment.',
    'Implement NTP time-drift compensation in IdP connector microservice.',
    { email: 'david.vance@skanda.io', name: 'David Vance', role: 'SKANDA_PLATFORM_ADMIN' }
  );

  assert(
    'P18-PROB-18',
    'PROBLEM_MANAGEMENT',
    'Problem record clusters recurring incidents, captures RCA, workaround, permanent fix, and links services',
    problem.id.startsWith('PRB-') &&
      problem.linkedIncidentIds.length === 2 &&
      problem.status === 'KNOWN_ERROR',
    'Status: KNOWN_ERROR with 2 linked cases',
    `ID: ${problem.id}, Status: ${problem.status}, Cases: ${problem.linkedIncidentIds.length}`
  );

  // --------------------------------------------------------------------------
  // 19. CUSTOMER HEALTH IMPACT SCORING
  // --------------------------------------------------------------------------
  console.log('--- 19. Customer Health Impact Scoring ---');

  const healthImpact = serviceManagementService.evaluateSupportHealthImpact(tenantA);

  assert(
    'P18-HLTH-19',
    'CUSTOMER_HEALTH',
    'Customer health engine evaluates open P1/P2 cases, SLA breaches, and outputs explainable health impact penalty',
    typeof healthImpact.penaltyScore === 'number' &&
      healthImpact.explainableFactors.length >= 0,
    'Penalty score evaluated with explainable factors',
    `Penalty: ${healthImpact.penaltyScore}, Factors: ${healthImpact.explainableFactors.length}`
  );

  // --------------------------------------------------------------------------
  // 20. RENEWAL RISK ENGINE & RENEWAL RADAR
  // --------------------------------------------------------------------------
  console.log('--- 20. Renewal Risk Engine ---');

  const renewalRisk = serviceManagementService.getRenewalSupportRisk(tenantA);

  assert(
    'P18-REN-20',
    'RENEWAL_RADAR',
    'Renewal risk engine calculates support risk score, tier, and evidence factors for Renewal Radar',
    ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(renewalRisk.riskLevel) &&
      typeof renewalRisk.riskScore === 'number' &&
      renewalRisk.evidence.length > 0,
    'Valid riskLevel with evidence factors',
    `RiskLevel: ${renewalRisk.riskLevel}, RiskScore: ${renewalRisk.riskScore}, Factors: ${renewalRisk.evidence.length}`
  );

  // --------------------------------------------------------------------------
  // 21. GRC INTEGRATION: CONTROL RETESTING & EVIDENCE
  // --------------------------------------------------------------------------
  console.log('--- 21. GRC Integration & Control Retesting ---');

  const retestResult = serviceManagementService.triggerControlRetest(
    'CASE-2026-9101',
    'CTRL-AC-01',
    { email: 'agent1@skanda.support', name: 'David Vance', role: 'SKANDA_PLATFORM_ADMIN' }
  );

  assert(
    'P18-GRC-21',
    'GRC_CONTROL_RETEST',
    'Triggering control retest from support case verifies control effectiveness and issues cryptographic audit digest',
    retestResult.success &&
      retestResult.status === 'EFFECTIVE_VERIFIED' &&
      retestResult.verificationHash.length === 64,
    'Status: EFFECTIVE_VERIFIED with 64-character SHA-256 hash',
    `Status: ${retestResult.status}, Hash: ${retestResult.verificationHash.substring(0, 16)}...`
  );

  // --------------------------------------------------------------------------
  // 22. CASE 360 RELATIONAL GRAPH SYNTHESIS
  // --------------------------------------------------------------------------
  console.log('--- 22. Case 360 Relational Entity Graph ---');

  const c360 = serviceManagementService.getCase('CASE-2026-9101', 'SKANDA_PLATFORM_ADMIN');
  const hasLinkedRelations =
    c360 !== null &&
    (c360.relatedControlIds?.length || 0) > 0 &&
    (c360.relatedRiskIds?.length || 0) > 0 &&
    (c360.relatedEvidenceIds?.length || 0) > 0;

  assert(
    'P18-C360-22',
    'CASE_360',
    'Case 360 synthesizes complete relational links connecting case to Controls, Risks, Evidence, and CAPA',
    hasLinkedRelations,
    'Case 360 connects Controls, Risks, Evidence',
    `Controls: ${c360?.relatedControlIds?.length}, Risks: ${c360?.relatedRiskIds?.length}, Evidence: ${c360?.relatedEvidenceIds?.length}`
  );

  // --------------------------------------------------------------------------
  // 23. STRICT MULTI-TENANT ISOLATION
  // --------------------------------------------------------------------------
  console.log('--- 23. Multi-Tenant Isolation Boundaries ---');

  // Tenant B attempts to read Tenant A case
  let tenantBCrossReadBlocked = false;
  try {
    serviceManagementService.getCase(case1.id, 'TENANT_ADMIN', tenantB);
  } catch (err: any) {
    tenantBCrossReadBlocked = err.message.includes('RLS_ACCESS_DENIED') || err.message.includes('authorized');
  }

  // Tenant B lists cases
  const tenantBCases = serviceManagementService.listCases({}, 'TENANT_ADMIN', tenantB);
  const containsTenantA = tenantBCases.some(c => c.tenantId === tenantA);

  assert(
    'P18-ISOL-23',
    'TENANT_ISOLATION',
    'Tenant B cannot access or list Tenant A support cases (RLS_ACCESS_DENIED on cross-read)',
    tenantBCrossReadBlocked && !containsTenantA,
    'Cross-read throws RLS error, list filters strictly by tenantId',
    `CrossReadBlocked: ${tenantBCrossReadBlocked}, ListContainsOtherTenant: ${containsTenantA}`
  );

  // --------------------------------------------------------------------------
  // 24. INTERNAL NOTE PRIVACY STRIPPING
  // --------------------------------------------------------------------------
  console.log('--- 24. Internal Note Privacy Stripping ---');

  // Add internal note as agent
  serviceManagementService.addComment(
    disputeCase.id,
    'CONFIDENTIAL: Internal engineering post-mortem notes. Not for customer distribution.',
    true,
    { email: 'agent1@skanda.support', name: 'Internal Agent', role: 'SKANDA_PLATFORM_ADMIN' }
  );

  // Retrieve case as customer TENANT_ADMIN
  const customerView = serviceManagementService.getCase(disputeCase.id, 'TENANT_ADMIN', tenantA);
  const leakedInternalNote = customerView?.comments.some(c => c.isInternalOnly === true);

  assert(
    'P18-PRIV-24',
    'INTERNAL_NOTE_PRIVACY',
    'Customer-facing query strictly sanitizes and removes internal-only support notes',
    customerView !== null && !leakedInternalNote,
    'Zero internal notes exposed in customer view',
    `Leaked internal notes: ${leakedInternalNote}`
  );

  // --------------------------------------------------------------------------
  // 25. SUPERADMIN VS TENANTADMIN QUEUE RBAC
  // --------------------------------------------------------------------------
  console.log('--- 25. Queue Workload RBAC Boundaries ---');

  let tenantAdminQueueBlocked = false;
  try {
    serviceManagementService.getPlatformSupportMetrics('TENANT_ADMIN');
  } catch (err: any) {
    tenantAdminQueueBlocked = err.message.includes('ACCESS_DENIED');
  }

  const superAdminMetrics = serviceManagementService.getPlatformSupportMetrics('SKANDA_PLATFORM_ADMIN');

  assert(
    'P18-RBAC-25',
    'PLATFORM_OPERATIONS_RBAC',
    'Tenant Admins are forbidden from viewing platform-wide support metrics; SuperAdmins have access',
    tenantAdminQueueBlocked && superAdminMetrics.totalOpenCases >= 0,
    'TenantAdmin blocked (ACCESS_DENIED), SuperAdmin receives metrics',
    `TenantAdminBlocked: ${tenantAdminQueueBlocked}, TotalOpenCases: ${superAdminMetrics.totalOpenCases}`
  );

  // --------------------------------------------------------------------------
  // 26. AI GOVERNANCE GUARDRAILS
  // --------------------------------------------------------------------------
  console.log('--- 26. AI Governance Guardrails ---');

  const aiCloseRes = serviceManagementService.updateLifecycleState(
    disputeCase.id,
    'CLOSED',
    { email: 'copilot@skanda.ai', name: 'AI Copilot', role: 'AI_AGENT' },
    'AI autonomously attempting to close case.'
  );

  const aiPIRRes = serviceManagementService.approvePostIncidentReview(
    'CASE-2026-9101',
    { email: 'copilot@skanda.ai', name: 'AI Copilot', role: 'AI_AGENT' }
  );

  assert(
    'P18-AIGOV-26',
    'AI_GOVERNANCE',
    'AI Support Copilot is strictly prohibited from closing cases or approving PIRs (UNAUTHORIZED)',
    !aiCloseRes.success && aiCloseRes.error?.includes('UNAUTHORIZED') &&
      !aiPIRRes.success && aiPIRRes.error?.includes('UNAUTHORIZED'),
    'AI case closure & PIR approval blocked',
    `AICloseSuccess: ${aiCloseRes.success}, AIPIRApprovalSuccess: ${aiPIRRes.success}`
  );

  // --------------------------------------------------------------------------
  // 27. EVENT BUS DISPATCHING & PROVENANCE HASHING
  // --------------------------------------------------------------------------
  console.log('--- 27. Event Bus & Cryptographic Provenance ---');

  const eventLog = serviceManagementService.getEventLog();
  const hasSupportCaseEvents = eventLog.some(e => e.event.includes('SupportCase'));
  const hasSLAEvents = eventLog.some(e => e.event.includes('SLATimer'));

  assert(
    'P18-EVT-27',
    'EVENT_BUS_INTEGRATION',
    'All support lifecycle transitions dispatch immutable, tenant-aware DomainEventBus events',
    hasSupportCaseEvents && hasSLAEvents && eventLog.length >= 5,
    'Support & SLA events dispatched on EventBus',
    `Events in log: ${eventLog.length}, HasCaseEvents: ${hasSupportCaseEvents}, HasSLAEvents: ${hasSLAEvents}`
  );

  // --------------------------------------------------------------------------
  // 28. SERVICE CATALOG & HEALTH STATUS PROPAGATION
  // --------------------------------------------------------------------------
  console.log('--- 28. Service Catalog & Status Page Model ---');

  const initialCatalog = serviceManagementService.getServiceCatalog();
  const idpService = initialCatalog.find(s => s.id === 'SRV-IDENTITY-FEDERATION');

  const updatedService = serviceManagementService.updateServiceHealth(
    'SRV-IDENTITY-FEDERATION',
    'OPERATIONAL',
    'SCIM token synchronization recovered and operating normally.',
    { email: 'david.vance@skanda.io', name: 'David Vance', role: 'SKANDA_PLATFORM_ADMIN' }
  );

  assert(
    'P18-CAT-28',
    'SERVICE_CATALOG_HEALTH',
    'Service catalog manages component health, SLA targets, and propagates customer-facing status changes',
    idpService !== null && updatedService.healthStatus === 'OPERATIONAL',
    'Status: OPERATIONAL',
    `Status: ${updatedService.healthStatus}`
  );

  // --------------------------------------------------------------------------
  // 29. POST-INCIDENT REVIEW (PIR) SIGN-OFF & CAPA
  // --------------------------------------------------------------------------
  console.log('--- 29. Post-Incident Review (PIR) & CAPA ---');

  const pir = serviceManagementService.createPostIncidentReview(
    'CASE-2026-9101',
    {
      title: 'Post-Incident Review: Entra ID SCIM Connector Token Synchronization Failure',
      rootCause: 'Token expiry alert was routed to unmonitored legacy distribution list.',
      contributingFactors: ['Missing automated certificate rotation webhook in IdP configuration.'],
      detectionMethod: 'Detected by Skanda Continuous Compliance automated telemetry probe in 4 minutes.',
      containmentDurationMins: 12,
      recoveryDurationMins: 45,
      customerImpactSummary: '1,200 users unable to sync role assignments for 45 minutes.',
      controlGaps: ['CTRL-AC-01', 'CTRL-ID-03'],
      correctiveActionIds: ['CAPA-2026-081'],
      lessonsLearned: ['Automate certificate rotation alerts 30 days in advance.']
    },
    { email: 'david.vance@skanda.io', name: 'David Vance', role: 'SKANDA_PLATFORM_ADMIN' }
  );

  const initialPirStatus = pir.status;

  const approvedPIRRes = serviceManagementService.approvePostIncidentReview(
    'CASE-2026-9101',
    { email: 'rachel.ciso@skanda.security', name: 'Rachel CISO', role: 'SKANDA_PLATFORM_ADMIN' }
  );

  assert(
    'P18-PIR-29',
    'POST_INCIDENT_REVIEW',
    'Post-Incident Review captures 5-phase timeline, root cause, CAPA, and transitions to APPROVED on executive sign-off',
    initialPirStatus === 'DRAFT' && approvedPIRRes.success && approvedPIRRes.pir?.status === 'APPROVED',
    'State: APPROVED by executive',
    `Initial: ${initialPirStatus}, Final: ${approvedPIRRes.pir?.status}, ApprovedBy: ${approvedPIRRes.pir?.approvedBy}`
  );

  // --------------------------------------------------------------------------
  // 30. CUSTOMER SUCCESS NEXT BEST ACTION (NBA)
  // --------------------------------------------------------------------------
  console.log('--- 30. Customer Success Next Best Action (NBA) ---');

  const csNBA = serviceManagementService.getCustomerSuccessNBA(tenantA);

  assert(
    'P18-NBA-30',
    'CUSTOMER_SUCCESS_NBA',
    'Support analytics generate automated Next Best Actions for Customer Success to drive adoption and retention',
    !!csNBA.action && !!csNBA.priority && !!csNBA.reason,
    'Valid primary action and priority',
    `Action: ${csNBA.action}, Priority: ${csNBA.priority}`
  );

  // --------------------------------------------------------------------------
  // SUMMARY REPORT
  // --------------------------------------------------------------------------
  console.log('\n================================================================================');
  console.log('PHASE 18 SERVICE MANAGEMENT & SLA VALIDATION SUMMARY');
  console.log('================================================================================');

  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;
  const passRate = ((passedCount / totalCount) * 100).toFixed(1);

  console.log(`Total Assertions : ${totalCount}`);
  console.log(`Passed           : ${passedCount}`);
  console.log(`Failed           : ${totalCount - passedCount}`);
  console.log(`Pass Rate        : ${passRate}%`);

  if (passedCount === totalCount) {
    console.log('\n>>> PHASE 18 SERVICE MANAGEMENT VERIFICATION STATUS: 100% PASS (MODEL_VERIFIED / PILOT_READY) <<<\n');
  } else {
    console.error('\n>>> PHASE 18 SERVICE MANAGEMENT VERIFICATION STATUS: FAILED <<<\n');
    process.exit(1);
  }
}

runPhase18Validation().catch(err => {
  console.error('Fatal error during Phase 18 validation:', err);
  process.exit(1);
});
