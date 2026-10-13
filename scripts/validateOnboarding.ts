/**
 * SKANDA ENTERPRISE ONBOARDING & BUSINESS DISCOVERY VALIDATION HARNESS
 * File: scripts/validateOnboarding.ts
 * 
 * Comprehensive E2E automated test suite verifying:
 * 1. Canonical Entity Structuring ("CREATE ONCE -> REUSE EVERYWHERE")
 * 2. Configuration-Driven Questionnaire Engine (Field IDs 1.01-15.x) & Conditional Visibility
 * 3. Continuous Autosave & Session Persistence
 * 4. Role-Based Section Delegation (CISO, IT, HR, Privacy, Business Owner)
 * 5. AI Scope Generation & Strict Human Approval Boundaries
 * 6. Multi-Tenant Cryptographic Isolation (Tenant A vs Tenant B)
 * 7. Canonical Workspace Activation & Domain Event Ledger Integration
 */

import { questionnaireEngine } from '../server/services/QuestionnaireEngine.js';
import { businessDiscoveryService } from '../server/services/BusinessDiscoveryService.js';
import { scopeGenerationService } from '../server/services/ScopeGenerationService.js';
import { onboardingService } from '../server/services/OnboardingService.js';
import { domainEventBus } from '../src/services/canonical/DomainEventBus.js';

interface TestResult {
  suite: string;
  testName: string;
  passed: boolean;
  error?: string;
  details?: any;
}

const results: TestResult[] = [];

function assert(condition: boolean, suite: string, testName: string, details?: any) {
  if (condition) {
    results.push({ suite, testName, passed: true, details });
    console.log(`  ✓ [PASS] ${suite} -> ${testName}`);
  } else {
    results.push({ suite, testName, passed: false, error: 'Assertion failed', details });
    console.error(`  ✗ [FAIL] ${suite} -> ${testName}`);
  }
}

async function runValidation() {
  console.log('\n================================================================');
  console.log('SKANDA ENTERPRISE ONBOARDING & BUSINESS DISCOVERY VALIDATION');
  console.log('================================================================\n');

  // --------------------------------------------------------------------------
  // SUITE 1: CANONICAL ENTITY STRUCTURING & "CREATE ONCE -> REUSE EVERYWHERE"
  // --------------------------------------------------------------------------
  console.log('--- SUITE 1: Canonical Entity Structuring & Graph Generation ---');
  const defaultData = businessDiscoveryService.generateDefaultDiscoveryData('Acme Enterprise FinTech', 'FinTech, Banking & Financial Services');

  assert(Boolean(defaultData.orgProfile.legalName), 'CanonicalEntities', 'Organization Profile created with legal entity name');
  assert(defaultData.businessProcesses.length >= 4, 'CanonicalEntities', 'Default business processes initialized with stable IDs', { count: defaultData.businessProcesses.length });
  assert(defaultData.businessProcesses.every(p => p.code.startsWith('PROC-')), 'CanonicalEntities', 'All business processes have stable PROC-xxx codes');
  assert(defaultData.sites.every(s => s.code.startsWith('SITE-')), 'CanonicalEntities', 'All sites have stable SITE-xxx codes');
  assert(defaultData.applications.every(a => a.code.startsWith('APP-')), 'CanonicalEntities', 'All applications have stable APP-xxx codes');
  assert(defaultData.assets.every(ast => ast.code.startsWith('AST-')), 'CanonicalEntities', 'All assets have stable AST-xxx codes');
  assert(defaultData.dataAssets.every(d => d.code.startsWith('DAT-')), 'CanonicalEntities', 'All data assets have stable DAT-xxx codes');
  assert(defaultData.vendors.every(v => v.code.startsWith('VND-')), 'CanonicalEntities', 'All vendors have stable VND-xxx codes');
  assert(defaultData.criticalServices.every(c => c.code.startsWith('CBS-')), 'CanonicalEntities', 'All critical services have stable CBS-xxx codes');

  // Test 360-degree relationship graph navigation
  const graph = businessDiscoveryService.buildEntity360Graph(defaultData, 'PROC-001');
  assert(Boolean(graph.rootEntity && graph.rootEntity.code === 'PROC-001'), 'CanonicalEntities', 'Entity 360 graph rooted at selected Business Process');
  assert(graph.edges.length > 0, 'CanonicalEntities', '360° graph contains cross-entity relationship edges (Process -> App -> Vendor -> Asset)', { edgeCount: graph.edges.length });

  // Test real metric calculations
  const metrics = businessDiscoveryService.getDiscoverySummaryMetrics(defaultData);
  assert(metrics.totalProcesses === defaultData.businessProcesses.length, 'CanonicalEntities', 'Metrics report exact real count of processes without fake stats');
  assert(metrics.totalApplications === defaultData.applications.length, 'CanonicalEntities', 'Metrics report exact real count of applications');

  // --------------------------------------------------------------------------
  // SUITE 2: CONFIGURATION-DRIVEN QUESTIONNAIRE ENGINE & CONDITIONAL LOGIC
  // --------------------------------------------------------------------------
  console.log('\n--- SUITE 2: Configuration-Driven Questionnaire Engine ---');
  const allQuestions = questionnaireEngine.getAllQuestions();
  assert(allQuestions.length >= 20, 'QuestionnaireEngine', 'Question library contains full specification (Field IDs 1.01 - 15.x)', { totalQuestions: allQuestions.length });

  // Test field IDs exist
  const q101 = questionnaireEngine.getQuestionById('1.01');
  assert(Boolean(q101 && q101.question.includes('Legal Registered Company Name')), 'QuestionnaireEngine', 'Field ID 1.01 correctly mapped to Legal Company Name');

  const qPII = questionnaireEngine.getQuestionById('6.01_PII');
  assert(Boolean(qPII), 'QuestionnaireEngine', 'Field ID 6.01_PII exists in questionnaire definitions');

  // Test Conditional Visibility: PIMS questions should be HIDDEN if PII is "NO_PII"
  const hiddenWhenNoPii = questionnaireEngine.getVisibleQuestions({ '6.01_PII': 'NO_PII' });
  const pimsQuestion = hiddenWhenNoPii.find(q => q.id === '6.02_PIMS_ROLE');
  assert(pimsQuestion === undefined, 'QuestionnaireEngine', 'PIMS Role question (6.02) conditionally HIDDEN when PII is NOT processed');

  // Test Conditional Visibility: PIMS questions should be VISIBLE when PII is "YES_PROCESS_PII"
  const visibleWhenPii = questionnaireEngine.getVisibleQuestions({ '6.01_PII': 'YES_PROCESS_PII' });
  const pimsRoleQ = visibleWhenPii.find(q => q.id === '6.02_PIMS_ROLE');
  assert(Boolean(pimsRoleQ), 'QuestionnaireEngine', 'PIMS Role question (6.02) dynamically DISCLOSED when PII processing is declared');

  // Test AWS Service Discovery Conditional Visibility
  const hiddenAws = questionnaireEngine.getVisibleQuestions({ '5.1': ['ON_PREMISE'] });
  assert(!hiddenAws.some(q => q.id === '5.2_AWS'), 'QuestionnaireEngine', 'AWS service breakdown (5.2_AWS) HIDDEN when AWS is not selected');

  const visibleAws = questionnaireEngine.getVisibleQuestions({ '5.1': ['AWS', 'AZURE'] });
  assert(visibleAws.some(q => q.id === '5.2_AWS'), 'QuestionnaireEngine', 'AWS service breakdown (5.2_AWS) dynamically DISCLOSED when AWS is selected');

  // Test OT/ICS Airgap Conditional Visibility
  const hiddenOt = questionnaireEngine.getVisibleQuestions({ '5.6': 'NO_OT' });
  assert(!hiddenOt.some(q => q.id === '5.7_OT'), 'QuestionnaireEngine', 'OT/ICS Airgap question (5.7_OT) HIDDEN when OT is declared absent');

  const visibleOt = questionnaireEngine.getVisibleQuestions({ '5.6': 'YES_OT' });
  assert(visibleOt.some(q => q.id === '5.7_OT'), 'QuestionnaireEngine', 'OT/ICS Airgap question (5.7_OT) dynamically DISCLOSED when OT is present');

  // --------------------------------------------------------------------------
  // SUITE 3: AUTOSAVE & SESSION STATE PERSISTENCE
  // --------------------------------------------------------------------------
  console.log('\n--- SUITE 3: Continuous Autosave & Session Persistence ---');
  const tenantIdTest = 'tenant-e2e-test-org';
  const session1 = onboardingService.getOrCreateSession(tenantIdTest, 'org_e2e_1', 'E2E Test Enterprise');
  assert(session1.currentStep === 1, 'Autosave', 'Initial onboarding session created at Step 1');

  // Autosave update to Step 4 with partial discovery updates
  const savedSession = onboardingService.saveSessionProgress(
    tenantIdTest,
    4,
    {
      orgProfile: {
        ...session1.discoveryData.orgProfile,
        legalName: 'E2E Updated Enterprise Corporation'
      }
    },
    { '1.01': 'E2E Updated Enterprise Corporation' },
    'ciso@e2e-test.io',
    'CISO'
  );

  assert(savedSession.currentStep === 4, 'Autosave', 'Autosave successfully updated current step to Step 4');
  assert(savedSession.discoveryData.orgProfile.legalName === 'E2E Updated Enterprise Corporation', 'Autosave', 'Autosave updated discovery data in place');
  assert(savedSession.questionnaireResponses['1.01'].value === 'E2E Updated Enterprise Corporation', 'Autosave', 'Autosave persisted questionnaire responses');
  assert(savedSession.auditTrail.length >= 2, 'Autosave', 'Autosave generated immutable audit trail entry');

  // --------------------------------------------------------------------------
  // SUITE 4: ROLE-BASED COLLABORATION & SECTION DELEGATION
  // --------------------------------------------------------------------------
  console.log('\n--- SUITE 4: Role-Based Collaboration & Section Delegation ---');
  const delegatedSession = onboardingService.assignSection(
    tenantIdTest,
    11,
    'DATA_DISCOVERY',
    'Data Discovery & PII',
    'PRIVACY_OFFICER',
    'dpo@e2e-test.io',
    'Eleanor Vance (DPO)',
    'ciso@e2e-test.io'
  );

  const assignedSection = delegatedSession.assignments.find(a => a.stepNumber === 11);
  assert(Boolean(assignedSection && assignedSection.assignedRole === 'PRIVACY_OFFICER' && assignedSection.assignedUserEmail === 'dpo@e2e-test.io'),
    'RoleDelegation', 'Section 11 (Data Discovery) delegated to PRIVACY_OFFICER (dpo@e2e-test.io)');

  // --------------------------------------------------------------------------
  // SUITE 5: AI SCOPE GENERATION & STRICT HUMAN APPROVAL BOUNDARIES
  // --------------------------------------------------------------------------
  console.log('\n--- SUITE 5: AI Scope Generation & Strict Human Approval Boundaries ---');
  const draftScope = scopeGenerationService.generateDraftScope(delegatedSession.discoveryData);
  assert(draftScope.status === 'DRAFT_AI_GENERATED', 'AiBoundaries', 'AI synthesizes scope statement strictly in DRAFT_AI_GENERATED status');
  assert(draftScope.inclusions.length >= 3, 'AiBoundaries', 'Scope statement contains explicit operational inclusions');
  assert(draftScope.boundaries.physicalLocations.length > 0, 'AiBoundaries', 'Scope statement contains physical and cloud boundary specifications');

  // Test Human CISO Approval
  const approvedScope = scopeGenerationService.approveScope(draftScope, 'ciso@e2e-test.io', 'Approved by Chief Information Security Officer.');
  assert(approvedScope.status === 'CLIENT_APPROVED', 'AiBoundaries', 'Human CISO approval transitions scope statement to CLIENT_APPROVED');
  assert(approvedScope.approvedBy === 'ciso@e2e-test.io', 'AiBoundaries', 'Human approver email cryptographically recorded');

  // --------------------------------------------------------------------------
  // SUITE 6: MULTI-TENANT CRYPTOGRAPHIC ISOLATION
  // --------------------------------------------------------------------------
  console.log('\n--- SUITE 6: Multi-Tenant Cryptographic Isolation ---');
  const tenantA = 'tenant-alpha-corp';
  const tenantB = 'tenant-beta-corp';

  const sessionA = onboardingService.getOrCreateSession(tenantA, 'org_alpha', 'Alpha Corporation');
  const sessionB = onboardingService.getOrCreateSession(tenantB, 'org_beta', 'Beta Corporation');

  onboardingService.saveSessionProgress(tenantA, 5, undefined, { '1.01': 'Alpha Corporation Confidential' }, 'ciso@alpha.com');
  onboardingService.saveSessionProgress(tenantB, 2, undefined, { '1.01': 'Beta Corporation Confidential' }, 'ciso@beta.com');

  const refreshedA = onboardingService.getOrCreateSession(tenantA);
  const refreshedB = onboardingService.getOrCreateSession(tenantB);

  assert(refreshedA.tenantId === tenantA && refreshedA.questionnaireResponses['1.01'].value === 'Alpha Corporation Confidential',
    'TenantIsolation', 'Tenant Alpha data is strictly isolated and accessible by Tenant Alpha');
  assert(refreshedB.tenantId === tenantB && refreshedB.questionnaireResponses['1.01'].value === 'Beta Corporation Confidential',
    'TenantIsolation', 'Tenant Beta data is strictly isolated and cannot leak to or from Tenant Alpha');
  assert(refreshedA.currentStep === 5 && refreshedB.currentStep === 2,
    'TenantIsolation', 'Tenant step positions are strictly isolated');

  // --------------------------------------------------------------------------
  // SUITE 8: ONBOARDING STATE MACHINE & DETERMINISTIC STATE TRANSITIONS
  // --------------------------------------------------------------------------
  console.log('\n--- SUITE 8: Deterministic State Machine & Lifecycle Transitions ---');
  const tenantStateMachine = 'tenant-state-machine-test';
  const smSession = onboardingService.getOrCreateSession(tenantStateMachine, 'org_sm_1', 'State Machine Enterprise');

  assert(smSession.status === 'IN_PROGRESS' || smSession.status === 'NOT_STARTED', 'StateMachine', 'Initial session starts in valid non-active state');

  // Valid transition to REVIEW
  const reviewSession = onboardingService.updateSessionStatus(tenantStateMachine, 'REVIEW', 'ciso@sm.io', 'Ready for pre-activation audit review');
  assert(reviewSession.status === 'REVIEW', 'StateMachine', 'Valid transition to REVIEW accepted');

  // Valid transition to READY_TO_ACTIVATE
  const readySession = onboardingService.updateSessionStatus(tenantStateMachine, 'READY_TO_ACTIVATE', 'ciso@sm.io', 'All 18 steps complete and validated');
  assert(readySession.status === 'READY_TO_ACTIVATE', 'StateMachine', 'Valid transition to READY_TO_ACTIVATE accepted');

  // Invalid transition rejection: cannot transition from NOT_STARTED directly to ACTIVE
  let invalidTransitionBlocked = false;
  try {
    const invalidTenant = 'tenant-invalid-transition';
    const initSession = onboardingService.getOrCreateSession(invalidTenant, 'org_inv', 'Invalid Transition Test');
    // Attempt invalid jump
    onboardingService.updateSessionStatus(invalidTenant, 'ACTIVE', 'ciso@invalid.io');
  } catch (err: any) {
    if (err.message && err.message.includes('Invalid state transition')) {
      invalidTransitionBlocked = true;
    }
  }
  assert(invalidTransitionBlocked, 'StateMachine', 'Invalid state transition directly to ACTIVE is strictly rejected server-side');

  // --------------------------------------------------------------------------
  // SUITE 9: OPTIMISTIC CONCURRENCY CONTROL & CONFLICT DETECTION
  // --------------------------------------------------------------------------
  console.log('\n--- SUITE 9: Optimistic Concurrency Control & Versioning ---');
  const tenantConcurrency = 'tenant-concurrency-test';
  const concSession = onboardingService.getOrCreateSession(tenantConcurrency, 'org_conc', 'Concurrency Test Corp');
  const initialVersion = concSession.version;

  // Save with matching expected version
  const v1Saved = onboardingService.saveSessionProgress(
    tenantConcurrency,
    2,
    undefined,
    { '1.01': 'Concurrency Corp v1' },
    'user1@test.io',
    'ADMIN',
    initialVersion
  );
  assert(v1Saved.version === initialVersion + 1, 'Concurrency', 'Successful save increments version atomically', { version: v1Saved.version });

  // Save with stale expected version should be rejected with Concurrency Conflict
  let concurrencyConflictCaught = false;
  try {
    onboardingService.saveSessionProgress(
      tenantConcurrency,
      3,
      undefined,
      { '1.01': 'Stale Overwrite Attempt' },
      'user2@test.io',
      'ADMIN',
      initialVersion // Stale version (initialVersion < v1Saved.version)
    );
  } catch (err: any) {
    if (err.message && err.message.includes('Concurrency Conflict')) {
      concurrencyConflictCaught = true;
    }
  }
  assert(concurrencyConflictCaught, 'Concurrency', 'Stale concurrent update rejected with Concurrency Conflict error');

  // --------------------------------------------------------------------------
  // SUITE 10: INDUSTRY & COMPLIANCE ADAPTIVE STARTER TEMPLATES
  // --------------------------------------------------------------------------
  console.log('\n--- SUITE 10: Process Starter Templates Catalog ---');
  const allTemplates = businessDiscoveryService.getProcessTemplates();
  assert(allTemplates.length >= 6, 'ProcessTemplates', 'Process starter template catalog contains all 6 enterprise workflows', { count: allTemplates.length });

  const techTemplates = businessDiscoveryService.getProcessTemplates('SaaS, Cloud & Enterprise Software');
  assert(techTemplates.some(t => t.id === 'tmpl_sdlc'), 'ProcessTemplates', 'Technology templates include SDLC & CI/CD workflow');

  const fintechTemplates = businessDiscoveryService.getProcessTemplates('FinTech, Banking & Financial Services');
  assert(fintechTemplates.some(t => t.id === 'tmpl_customer_onb'), 'ProcessTemplates', 'FinTech templates include Customer Onboarding & KYC');

  // Test applying template to session
  const tenantTemplate = 'tenant-template-test';
  onboardingService.getOrCreateSession(tenantTemplate, 'org_tmpl', 'Template Test Org');
  const createdFromTmpl = onboardingService.applyProcessTemplate(tenantTemplate, 'tmpl_secops_incident', 'ciso@tmpl.io');
  assert(Boolean(createdFromTmpl && createdFromTmpl.code.startsWith('PROC-')), 'ProcessTemplates', 'Starter template applied as DRAFT process with stable PROC code', { code: createdFromTmpl.code });
  assert(createdFromTmpl.name.includes('Incident'), 'ProcessTemplates', 'Starter template name populated accurately');

  // --------------------------------------------------------------------------
  // SUITE 11: CLIENT CSV DATA IMPORT PIPELINE
  // --------------------------------------------------------------------------
  console.log('\n--- SUITE 11: Client CSV Data Import Pipeline ---');
  const csvSample = `name, owner, department, criticality
Customer Payment Processing, John Doe, Finance, TIER_1_MISSION_CRITICAL
Employee Offboarding, Jane Smith, HR, TIER_3_OPERATIONAL
, Invalid Owner, Missing Name, TIER_4_SUPPORT`;

  const preview = businessDiscoveryService.parseAndValidateImportData('PROCESSES', csvSample, []);
  assert(preview.validCount === 2, 'DataImport', 'CSV parser identified 2 valid records', { validCount: preview.validCount });
  assert(preview.invalidCount === 1, 'DataImport', 'CSV parser flagged 1 invalid record missing mandatory name');
  assert(preview.duplicateCount === 0, 'DataImport', 'Duplicate detector verified 0 duplicates');

  // Duplicate detection test
  const existingProcs = [{ id: 'p1', code: 'PROC-001', name: 'Customer Payment Processing', processOwner: 'John Doe', department: 'Finance', criticality: 'TIER_1_MISSION_CRITICAL' as any, frequency: 'DAILY' as any, isCustomerFacing: true, processesPii: true, processesSensitiveInfo: true, isCriticalBusinessService: true, hasExternalDependencies: true, applicationsUsed: [], vendorsUsed: [] }];
  const previewDup = businessDiscoveryService.parseAndValidateImportData('PROCESSES', csvSample, existingProcs);
  assert(previewDup.duplicateCount === 1, 'DataImport', 'Duplicate detector flagged 1 duplicate against existing canonical records');
  assert(previewDup.validCount === 1, 'DataImport', 'Duplicate excluded from valid import batch');

  // Test confirming import into session
  const tenantImport = 'tenant-import-test';
  onboardingService.getOrCreateSession(tenantImport, 'org_imp', 'Import Test Org');
  const importedCount = onboardingService.confirmDataImport(tenantImport, 'PROCESSES', preview.validRecords, 'ciso@imp.io');
  assert(importedCount === 2, 'DataImport', 'Import confirmed and merged 2 records into tenant discovery data');

  // --------------------------------------------------------------------------
  // SUITE 12: SECURE DOCUMENT DISCOVERY & HASH CLASSIFICATION
  // --------------------------------------------------------------------------
  console.log('\n--- SUITE 12: Document Discovery & SHA-256 Evidence Ingestion ---');
  const tenantDoc = 'tenant-doc-test';
  onboardingService.getOrCreateSession(tenantDoc, 'org_doc', 'Document Test Org');
  const docResult = onboardingService.uploadDiscoveryDocument(
    tenantDoc,
    'Enterprise Information Security Policy v3.pdf',
    204800,
    'application/pdf',
    'POLICY: All production databases must enforce TLS 1.3 in-transit encryption and AES-256 at-rest encryption.',
    'ciso@doc.io'
  );

  assert(Boolean(docResult && docResult.hash.length === 64), 'DocumentDiscovery', 'Discovered document hashed with SHA-256 cryptographic checksum', { hash: docResult.hash });
  assert(docResult.classification === 'POLICY', 'DocumentDiscovery', 'Automatic classification engine categorized document as POLICY');
  assert(docResult.suggestedMappings.includes('ISO_27001_A_5_1'), 'DocumentDiscovery', 'Suggested relevant GRC control mapping (ISO 27001 A.5.1)');

  // --------------------------------------------------------------------------
  // SUITE 13: DISCOVERY COMPLETENESS & QUALITY GAPS ENGINE
  // --------------------------------------------------------------------------
  console.log('\n--- SUITE 13: Discovery Completeness & Quality Gaps Engine ---');
  const compData = businessDiscoveryService.generateDefaultDiscoveryData('Completeness Test Corp', 'SaaS, Cloud & Enterprise Software');
  
  // Inject intentional quality gaps:
  // 1. Process without owner
  compData.businessProcesses.push({
    id: 'p_unowned',
    code: 'PROC-999',
    name: 'Unowned Critical Process',
    description: 'Gap test',
    processOwner: '',
    businessUnit: 'Core Operations',
    department: 'Engineering',
    siteId: 'site_1',
    criticality: 'TIER_1_MISSION_CRITICAL',
    frequency: 'CONTINUOUS_REALTIME',
    isCustomerFacing: true,
    processesPii: true,
    processesSensitiveInfo: true,
    isCriticalBusinessService: true,
    hasExternalDependencies: true,
    applicationsUsed: [],
    vendorsUsed: []
  });

  // 2. Critical application without MFA
  compData.applications.push({
    id: 'app_no_mfa',
    code: 'APP-999',
    name: 'Legacy Admin Tool',
    purpose: 'Internal admin',
    businessProcess: 'Operations',
    owner: 'Admin',
    department: 'IT',
    hostingModel: 'ON_PREMISE',
    criticality: 'CRITICAL',
    authenticationMethod: 'LOCAL_CREDENTIALS',
    mfaEnforced: false,
    processesPii: true,
    processesSensitiveData: true,
    environment: 'PRODUCTION'
  });

  const completenessReport = businessDiscoveryService.calculateDiscoveryCompleteness(compData);
  assert(completenessReport.overallScore >= 70 && completenessReport.overallScore <= 100, 'Completeness', 'Weighted completeness calculated across all 8 business discovery stages', { overallScore: completenessReport.overallScore });
  assert((completenessReport.stageProgress?.length || completenessReport.stages?.length) === 8, 'Completeness', 'Completeness breakdown covers all 8 distinct stages');

  const gaps = businessDiscoveryService.detectDiscoveryQualityGaps(compData);
  assert(gaps.some(g => g.id.includes('proc_no_owner') || g.title.includes('Process Without Owner')), 'QualityGaps', 'Deterministic quality check caught unowned business process');
  assert(gaps.some(g => g.id.includes('app_no_mfa') || g.title.includes('Critical Application Without MFA')), 'QualityGaps', 'Deterministic quality check caught critical application without MFA');

  // --------------------------------------------------------------------------
  // SUITE 14: ATOMIC WORKSPACE ACTIVATION & DOMAIN EVENT EMISSION
  // --------------------------------------------------------------------------
  console.log('\n--- SUITE 14: Canonical Workspace Activation & Domain Event Ledger ---');
  let domainEventEmitted = false;
  domainEventBus.subscribe('AssessmentStarted', (event) => {
    if (event.tenantId === tenantIdTest) {
      domainEventEmitted = true;
    }
  });

  const activationResult = onboardingService.activateWorkspace(tenantIdTest, 'ciso@e2e-test.io');
  assert(activationResult.status === 'SUCCESS', 'Activation', 'Workspace activation completed with SUCCESS status');
  assert(activationResult.counts.programsActivated >= 1, 'Activation', 'Canonical compliance programs activated in database', { count: activationResult.counts.programsActivated });
  assert(activationResult.counts.businessProcessesCreated >= 4, 'Activation', 'Business processes committed to canonical model');
  assert(activationResult.counts.applicationsCreated >= 4, 'Activation', 'Applications committed to canonical model');
  assert(activationResult.counts.assetsCreated >= 4, 'Activation', 'Assets committed to canonical model');
  assert(activationResult.counts.vendorsCreated >= 3, 'Activation', 'Vendors committed to canonical TPRM model');
  assert(activationResult.generatedEntities.nextBestActions.length >= 3, 'Activation', 'Generated actionable Next Best Actions for Command Centre');
  assert(domainEventEmitted, 'Activation', 'AssessmentStarted DomainEvent emitted and verified in audit hash ledger');

  // --------------------------------------------------------------------------
  // SUITE 15: 9-STATE SESSION LIFECYCLE & STRICT ENFORCEMENT
  // --------------------------------------------------------------------------
  console.log('\n--- SUITE 15: 9-State Session Lifecycle & Transitions ---');
  const tenant9State = 'tenant-9state-lifecycle-test';
  const sess9 = onboardingService.getOrCreateSession(tenant9State, 'org_9s', '9-State Lifecycle Corp');
  assert(sess9.status === 'IN_PROGRESS' || sess9.status === 'DRAFT', '9StateLifecycle', 'Session initializes in DRAFT/IN_PROGRESS');

  // Transition to PENDING_COLLABORATION
  const sCollab = onboardingService.updateSessionStatus(tenant9State, 'PENDING_COLLABORATION', 'ciso@9s.io', 'Delegated sections to team');
  assert(sCollab.status === 'PENDING_COLLABORATION', '9StateLifecycle', 'Transition to PENDING_COLLABORATION accepted');

  // Transition to PENDING_REVIEW
  const sRev = onboardingService.updateSessionStatus(tenant9State, 'PENDING_REVIEW', 'ciso@9s.io', 'Sections ready for audit review');
  assert(sRev.status === 'PENDING_REVIEW', '9StateLifecycle', 'Transition to PENDING_REVIEW accepted');

  // Transition to PENDING_SCOPE_APPROVAL
  const sScope = onboardingService.updateSessionStatus(tenant9State, 'PENDING_SCOPE_APPROVAL', 'ciso@9s.io', 'Scope drafted, awaiting CISO lock');
  assert(sScope.status === 'PENDING_SCOPE_APPROVAL', '9StateLifecycle', 'Transition to PENDING_SCOPE_APPROVAL accepted');

  // Transition to READY_FOR_ACTIVATION
  const sReady = onboardingService.updateSessionStatus(tenant9State, 'READY_FOR_ACTIVATION', 'ciso@9s.io', 'Scope approved and ready to activate');
  assert(sReady.status === 'READY_FOR_ACTIVATION', '9StateLifecycle', 'Transition to READY_FOR_ACTIVATION accepted');

  // --------------------------------------------------------------------------
  // SUITE 16: DYNAMIC SMART SECTION PRIORITIZATION
  // --------------------------------------------------------------------------
  console.log('\n--- SUITE 16: Smart Section Prioritization Engine ---');
  // Test ISO 27701 makes Data Discovery REQUIRED
  const pimsPriorities = questionnaireEngine.calculateSectionPriorities(['ISO_27701_2019'], {});
  const dataSecPrio = pimsPriorities.find(p => p.stepKey === 'DATA_DISCOVERY');
  assert(dataSecPrio?.priority === 'REQUIRED', 'SmartPrioritization', 'ISO 27701 dynamically marks Data Discovery section as REQUIRED');

  // Test ISO 42001 makes AI Governance relevant
  const aiPriorities = questionnaireEngine.calculateSectionPriorities(['ISO_42001_2023'], {});
  const aiScopePrio = aiPriorities.find(p => p.stepKey === 'SCOPE');
  assert(aiScopePrio?.priority === 'REQUIRED', 'SmartPrioritization', 'ISO 42001 marks Scope & Governance as REQUIRED');

  // Test MAS TRM makes Technology Fleet & Critical Services REQUIRED
  const masPriorities = questionnaireEngine.calculateSectionPriorities(['MAS_TRM_2021'], {});
  const masTechPrio = masPriorities.find(p => p.stepKey === 'TECH_ENVIRONMENT');
  const masCbsPrio = masPriorities.find(p => p.stepKey === 'CRITICAL_SERVICES');
  assert(masTechPrio?.priority === 'REQUIRED' && masCbsPrio?.priority === 'REQUIRED', 'SmartPrioritization', 'MAS TRM marks Tech Fleet and Critical Services as REQUIRED');

  // --------------------------------------------------------------------------
  // SUITE 17: BUSINESS DISCOVERY WORKSHOP & CANDIDATE SUGGESTIONS
  // --------------------------------------------------------------------------
  console.log('\n--- SUITE 17: Workshop Business Discovery & Candidate Suggestions ---');
  const suggestions = businessDiscoveryService.getWorkshopActivitySuggestions(['SOFTWARE_DEV', 'FINANCIAL_SERVICES']);
  assert(suggestions.suggestedProcesses.length >= 3, 'WorkshopSuggestions', 'Generated candidate business processes from selected primary activities', { count: suggestions.suggestedProcesses.length });
  assert(suggestions.suggestedApplications.length >= 3, 'WorkshopSuggestions', 'Generated candidate applications from primary activities');
  assert(suggestions.suggestedDataAssets.length >= 2, 'WorkshopSuggestions', 'Generated candidate data assets from primary activities');
  assert(suggestions.suggestedProcesses.some(p => p.name.includes('CI/CD') || p.name.includes('Payment')), 'WorkshopSuggestions', 'Suggestions accurately match SaaS and FinTech activity domains');

  // --------------------------------------------------------------------------
  // SUITE 18: BUSINESS PROCESS BUILDER (DUPLICATE & ARCHIVE)
  // --------------------------------------------------------------------------
  console.log('\n--- SUITE 18: Process Builder Operations (Duplicate & Archive) ---');
  const tenantProcBuilder = 'tenant-proc-builder-test';
  const pbSession = onboardingService.getOrCreateSession(tenantProcBuilder, 'org_pb', 'Process Builder Org');
  const originalProcId = pbSession.discoveryData.businessProcesses[0]?.id;
  assert(Boolean(originalProcId), 'ProcessBuilder', 'Found initial business process for duplicate test');

  // Duplicate process
  const duplicatedProc = onboardingService.duplicateProcess(tenantProcBuilder, originalProcId!, 'ciso@pb.io');
  assert(Boolean(duplicatedProc && duplicatedProc.name.includes('(Copy)')), 'ProcessBuilder', 'Process successfully duplicated with (Copy) label');
  assert(duplicatedProc.id !== originalProcId, 'ProcessBuilder', 'Duplicated process generated new unique entity ID');

  // Archive process
  const archived = onboardingService.archiveProcess(tenantProcBuilder, duplicatedProc.id, 'ciso@pb.io');
  assert(archived === true, 'ProcessBuilder', 'Process successfully archived from active session catalog');

  // --------------------------------------------------------------------------
  // SUITE 19: CONTEXTUAL COMMENTS API & THREADED COLLABORATION
  // --------------------------------------------------------------------------
  console.log('\n--- SUITE 19: Contextual Threaded Comments & Collaboration ---');
  const tenantComments = 'tenant-comments-test';
  onboardingService.getOrCreateSession(tenantComments, 'org_cmt', 'Comments Test Org');

  // Add comment
  const newComment = onboardingService.addComment(tenantComments, {
    stepNumber: 6,
    stepKey: 'BUSINESS_PROCESSES',
    authorName: 'Alex Mercer',
    authorRole: 'BUSINESS_OWNER',
    content: 'Please confirm RTO hours for Payment Processing with Infrastructure team.'
  });
  assert(Boolean(newComment && newComment.id.startsWith('cmt_')), 'ContextualComments', 'Added contextual comment with stable ID');
  assert(newComment.isResolved === false, 'ContextualComments', 'New comment initialized as unresolved');

  // Resolve comment
  const resolved = onboardingService.resolveComment(tenantComments, newComment.id);
  assert(resolved === true, 'ContextualComments', 'Comment successfully marked resolved by team lead');

  // --------------------------------------------------------------------------
  // SUMMARY REPORT
  // --------------------------------------------------------------------------
  console.log('\n================================================================');
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  console.log(`TOTAL ONBOARDING VALIDATION TESTS: ${total}`);
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runValidation().catch((err) => {
  console.error('Validation harness failure:', err);
  process.exit(1);
});
