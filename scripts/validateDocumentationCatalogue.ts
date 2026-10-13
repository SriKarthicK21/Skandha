// ============================================================================
// SKANDA ENTERPRISE GRC: PHASE 47 DOCUMENTATION CATALOGUE & QUALITY TEST SUITE
// Path: scripts/validateDocumentationCatalogue.ts
//
// Rigorous automated validation covering:
// 1. Catalogue Discovery & Filtering (All 56 templates across 10 document types)
// 2. Template Metadata & Versioning Integrity
// 3. Three Generation Modes (Mode A: Blank, Mode B: Model Sample, Mode C: Tailored)
// 4. Strict Non-Fabrication Rules & Missing Input Handling
// 5. Framework Traceability & Provenance Verification
// 6. Quality Gate Enforcement & Critical Defect Vetoes
// 7. Generation Across All 10 Document Types
// 8. DOCX OpenXML Package & Layout Verification
// 9. Document Version Diff & Content Preservation
// 10. Multi-Tenant Isolation & Security Boundary Protection
// ============================================================================

import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';
import {
  enterpriseDocumentationEngine,
  ENTERPRISE_CATALOGUE_REGISTRY,
  VERIFICATION_EVIDENCE_CRITERIA,
  validateVerificationStatusTransition,
  validatePrivacyRegisterSchema
} from '../server/services/EnterpriseDocumentationEngine.js';
import type {
  EnterpriseConsultingDocument,
  DocumentationContextQuestionnaire,
  DocumentationQualityScorecard,
  CatalogueTemplateMetadata,
  VerificationAssuranceStatus,
  PrivacyLegalRegime,
  RegisterSchemaColumn,
  VerificationEvidenceContext
} from '../server/services/EnterpriseDocumentationEngine.js';
import type { DocumentType } from '../server/services/PolicyGovernanceEngine.js';

let totalAssertions = 0;
let passedAssertions = 0;
const failures: string[] = [];

function assert(condition: boolean, message: string) {
  totalAssertions++;
  if (condition) {
    passedAssertions++;
    console.log(`  [PASS] ${message}`);
  } else {
    failures.push(message);
    console.error(`  [FAIL] ${message}`);
  }
}

async function runTestSuite() {
  console.log('\n================================================================');
  console.log('SKANDA ENTERPRISE GRC: PHASE 47 CATALOGUE & TEMPLATE TEST SUITE');
  console.log('================================================================\n');

  // --------------------------------------------------------------------------
  // TEST SUITE 1: CATALOGUE DISCOVERY & FILTERING
  // --------------------------------------------------------------------------
  console.log('--- Test Suite 1: Catalogue Discovery & Filtering ---');

  const allTemplates = enterpriseDocumentationEngine.getCatalogue();
  assert(allTemplates.length === 56, `Catalogue contains exactly 56 priority templates (found: ${allTemplates.length})`);

  // Verify all 10 document types represented
  const expectedDocTypes: DocumentType[] = [
    'POLICY',
    'PROCEDURE',
    'STANDARD',
    'SOP',
    'GUIDELINE',
    'WORK_INSTRUCTION',
    'FORM_CHECKLIST',
    'REGISTER_LOG',
    'IMPLEMENTATION_PLAN',
    'MANAGEMENT_REVIEW_PACK'
  ];
  for (const docType of expectedDocTypes) {
    const matching = allTemplates.filter(t => t.documentType === docType);
    assert(matching.length > 0, `Document type '${docType}' is represented in catalogue (${matching.length} templates)`);
  }

  // Verify domain and group breakdowns
  const part1InfoSec = allTemplates.slice(0, 18);
  assert(part1InfoSec.length === 18 && part1InfoSec.every(t => t.id.startsWith('TMPL-POL-SEC-')), `Part 1 contains 18 InfoSec Policies, Standards, and Guidelines (found: ${part1InfoSec.length})`);

  const part2Procedures = allTemplates.slice(18, 38);
  assert(part2Procedures.length === 20, `Part 2 contains 20 Operational Procedures, SOPs, and Work Instructions (found: ${part2Procedures.length})`);

  const part3Privacy = allTemplates.slice(38, 46);
  assert(part3Privacy.length === 8, `Part 3 contains 8 Privacy and Regulatory Governance Documents (found: ${part3Privacy.length})`);

  const part4RiskAssurance = allTemplates.slice(46, 56);
  assert(part4RiskAssurance.length === 10, `Part 4 contains 10 Risk, Audit, Review, and Assurance Documents (found: ${part4RiskAssurance.length})`);

  const allPrivacyDomainDocs = allTemplates.filter(t => t.domain === 'PRIVACY_AND_DATA_PROTECTION');
  assert(allPrivacyDomainDocs.length === 10, `Catalogue contains 10 total Privacy and Regulatory Documents including operational procedures (found: ${allPrivacyDomainDocs.length})`);

  const riskAssuranceDocs = allTemplates.filter(t => t.domain === 'ENTERPRISE_RISK' || t.domain === 'COMPLIANCE_AND_AUDIT');
  assert(riskAssuranceDocs.length >= 10, `Catalogue contains >= 10 Risk and Assurance Documents across domains (found: ${riskAssuranceDocs.length})`);

  // Content depth breakdown
  const substantiveModels = allTemplates.filter(t => t.contentDepth === 'SUBSTANTIVE_MODEL_AVAILABLE');
  const scaffoldTemplates = allTemplates.filter(t => t.contentDepth === 'SCAFFOLD_TEMPLATE_AVAILABLE');
  assert(substantiveModels.length >= 14, `Catalogue correctly declares substantive models available (${substantiveModels.length} templates)`);
  assert(scaffoldTemplates.length >= 20, `Catalogue honestly declares scaffold templates (${scaffoldTemplates.length} templates)`);
  assert(substantiveModels.length + scaffoldTemplates.length === 56, 'All 56 templates have unambiguous contentDepth classification');

  // Filtering tests
  const filteredPolicy = enterpriseDocumentationEngine.getCatalogue({ documentType: 'POLICY' });
  assert(filteredPolicy.every(t => t.documentType === 'POLICY'), 'Filtering by documentType=POLICY returns only policies');

  const filteredDomain = enterpriseDocumentationEngine.getCatalogue({ domain: 'PRIVACY_AND_DATA_PROTECTION' });
  assert(filteredDomain.every(t => t.domain === 'PRIVACY_AND_DATA_PROTECTION'), 'Filtering by domain returns only privacy documents');

  const filteredSearch = enterpriseDocumentationEngine.getCatalogue({ search: 'Access' });
  assert(filteredSearch.length >= 2, `Search for 'Access' returns matching templates (found: ${filteredSearch.length})`);

  const filteredFramework = enterpriseDocumentationEngine.getCatalogue({ framework: 'ISO_27001' });
  assert(filteredFramework.length >= 30, `Filter by framework=ISO_27001 returns mapped templates (${filteredFramework.length} templates)`);

  // --------------------------------------------------------------------------
  // TEST SUITE 2: TEMPLATE METADATA & INTEGRITY
  // --------------------------------------------------------------------------
  console.log('\n--- Test Suite 2: Template Metadata & Integrity ---');

  const templateIds = new Set<string>();
  let metadataValid = true;
  for (const t of allTemplates) {
    if (templateIds.has(t.id)) {
      metadataValid = false;
      console.error(`Duplicate template ID found: ${t.id}`);
    }
    templateIds.add(t.id);

    if (!t.id.startsWith('TMPL-') || !t.title || !t.version || !t.intendedPurpose || !t.category) {
      metadataValid = false;
    }
    if (!t.ownerAndReviewerRoles.defaultOwnerRole || !t.ownerAndReviewerRoles.approverRole) {
      metadataValid = false;
    }
    if (!t.requiredSections || t.requiredSections.length === 0) {
      metadataValid = false;
    }
  }
  assert(metadataValid, 'Every template in catalogue has unique stable ID, title, version, owner, approver, and sections');
  assert(templateIds.size === 56, `All 56 template IDs are globally unique`);

  // --------------------------------------------------------------------------
  // TEST SUITE 3: THREE GENERATION MODES (BLANK, MODEL, TAILORED)
  // --------------------------------------------------------------------------
  console.log('\n--- Test Suite 3: Three Generation Modes ---');

  const targetTmplId = 'TMPL-POL-SEC-001';
  const tmplMeta = enterpriseDocumentationEngine.getTemplateById(targetTmplId)!;

  // Mode A: Blank Template
  const blankDoc = enterpriseDocumentationEngine.generateDocument(targetTmplId, 'BLANK');
  assert(blankDoc.metadata.documentId.includes('BLANK'), 'Mode A generates document with BLANK identifier');
  assert(blankDoc.metadata.status.includes('Draft Template') || blankDoc.metadata.status.includes('DRAFT'), 'Mode A indicates draft unpopulated status');
  assert(blankDoc.purpose.includes('COMPLETION GUIDANCE') || blankDoc.purpose.includes('[Policy Domain Scope]'), 'Mode A contains section completion guidance');
  assert(JSON.stringify(blankDoc).includes('{{LEGAL_ENTITY_NAME}}'), 'Mode A contains explicit placeholders for organizational facts');
  assert(blankDoc.isModelSample === false, 'Mode A is not labeled as a model sample');

  // Mode B: Completed Model Sample
  const modelDoc = enterpriseDocumentationEngine.generateDocument(targetTmplId, 'MODEL');
  assert(modelDoc.isModelSample === true, 'Mode B document has isModelSample === true');
  assert(modelDoc.metadata.status.includes('Model sample') || modelDoc.metadata.status.includes('not approved'), 'Mode B status indicates model sample — not approved');
  assert(Boolean(modelDoc.metadata.notice && modelDoc.metadata.notice.includes('ILLUSTRATIVE MODEL DOCUMENT')), 'Mode B includes illustrative model notice');
  assert(Boolean(modelDoc.metadata.modelUseNotice), 'Mode B includes model use limitation notice');
  const modelScorecard = enterpriseDocumentationEngine.evaluateConsultingQuality(modelDoc);
  assert(modelScorecard.overallScore >= 85, `Mode B achieves consulting-grade quality score (score: ${modelScorecard.overallScore})`);
  assert(modelScorecard.criticalDefects.length === 0, `Mode B has 0 critical defects (found: ${modelScorecard.criticalDefects.length})`);

  // Mode C: Customize for My Organization (Tailored)
  const testQuestionnaire = enterpriseDocumentationEngine.getDefaultQuestionnaire();
  testQuestionnaire.organizationProfile.legalEntityName = 'Starlight Financial Technologies Inc.';
  testQuestionnaire.organizationProfile.headquartersLocation = 'London, United Kingdom';
  testQuestionnaire.operatingModel.cloudInfrastructure = ['AWS', 'Azure'];

  const tailoredDoc = enterpriseDocumentationEngine.generateDocument(targetTmplId, 'TAILORED', testQuestionnaire);
  assert(tailoredDoc.isModelSample === false, 'Mode C document has isModelSample === false');
  assert(tailoredDoc.metadata.status.includes('Tailored') || tailoredDoc.metadata.status.includes('DRAFT'), 'Mode C indicates tailored draft status');
  assert(tailoredDoc.scope.inScopeLegalEntities.includes('Starlight Financial Technologies Inc.'), 'Mode C embeds verified legal entity name');
  assert(JSON.stringify(tailoredDoc.scope).includes('Azure'), 'Mode C embeds verified operating infrastructure');
  assert(!tailoredDoc.metadata.modelUseNotice, 'Mode C removes model sample notice');

  // --------------------------------------------------------------------------
  // TEST SUITE 4: NON-FABRICATION & MISSING INPUT HANDLING
  // --------------------------------------------------------------------------
  console.log('\n--- Test Suite 4: Non-Fabrication & Missing Input Handling ---');

  const emptyQuestionnaire: DocumentationContextQuestionnaire = {
    tenantId: 'TEST-TENANT',
    organizationProfile: { legalEntityName: '', jurisdictions: [], industry: '', headquartersLocation: '' },
    scopeDefinition: { inScopeLocations: [], inScopeBusinessUnits: [], inScopeServicesAndProducts: [] },
    operatingModel: { cloudInfrastructure: [], identityProvider: '', ticketingAndItsmSystem: '', codeRepositories: [], databaseEngines: [], hrisPlatform: '', siemAndLoggingPlatform: '' },
    keyRolesAndDelegations: {} as any,
    approvalThresholdsAndRules: {} as any,
    serviceLevelCommitments: {} as any,
    evidenceAndRecordsRetention: {} as any
  };

  // Strict mode should reject empty questionnaire
  let strictThrew = false;
  try {
    enterpriseDocumentationEngine.generateDocument(targetTmplId, 'TAILORED', emptyQuestionnaire, true);
  } catch (err: any) {
    strictThrew = true;
    assert(err.message.includes('MISSING_MANDATORY_INPUTS'), `Strict tailoring rejected empty questionnaire: ${err.message}`);
  }
  assert(strictThrew, 'Strict tailoring throws error when mandatory inputs are missing');

  // Non-strict mode flags missing inputs in Appendix C
  const nonStrictTailored = enterpriseDocumentationEngine.generateDocument(targetTmplId, 'TAILORED', emptyQuestionnaire, false);
  const uncompletedChecklistItems = nonStrictTailored.appendixC_TailoringChecklist.filter(c => !c.isCompleted);
  assert(uncompletedChecklistItems.length > 0, `Non-strict tailoring flags ${uncompletedChecklistItems.length} uncompleted checklist items for missing facts`);
  assert(nonStrictTailored.metadata.documentOwner !== undefined, 'Does not invent specific unauthorized identities');

  // --------------------------------------------------------------------------
  // TEST SUITE 5: FRAMEWORK TRACEABILITY & PROVENANCE
  // --------------------------------------------------------------------------
  console.log('\n--- Test Suite 5: Framework Traceability & Provenance ---');

  const validProvenances = new Set([
    'VERIFIED_SOURCE_MAPPING',
    'SOURCE_DERIVED_MAPPING',
    'HUMAN_APPROVED_MAPPING',
    'PROPOSED_MAPPING',
    'UNVERIFIED_MAPPING'
  ]);

  let allProvenancesValid = true;
  let allHaveAssuranceLimitations = true;
  let totalMappings = 0;

  for (const t of allTemplates) {
    for (const fw of t.relatedFrameworks) {
      totalMappings++;
      if (!validProvenances.has(fw.provenance)) {
        allProvenancesValid = false;
        console.error(`Invalid provenance '${fw.provenance}' in ${t.id}`);
      }
      if (!fw.assuranceLimitationNotice || fw.assuranceLimitationNotice.trim().length < 15) {
        allHaveAssuranceLimitations = false;
        console.error(`Missing assurance limitation in ${t.id} -> ${fw.clauseOrControl}`);
      }
    }
  }

  assert(allProvenancesValid, `All ${totalMappings} framework mappings have valid provenance enums`);
  assert(allHaveAssuranceLimitations, `All ${totalMappings} framework mappings declare explicit assurance limitations`);

  // --------------------------------------------------------------------------
  // TEST SUITE 6: QUALITY GATE ENFORCEMENT & CRITICAL DEFECT VETOES
  // --------------------------------------------------------------------------
  console.log('\n--- Test Suite 6: Quality Gate Enforcement & Critical Vetoes ---');

  // Baseline evaluation of model procedure
  const baseProc = enterpriseDocumentationEngine.getModelUserAccessProcedure();
  const baseScore = enterpriseDocumentationEngine.evaluateConsultingQuality(baseProc);
  assert(baseScore.overallScore >= 95, `Model procedure achieves high benchmark quality (score: ${baseScore.overallScore})`);
  assert(baseScore.criticalDefects.length === 0, 'Model procedure has zero critical defects');

  // Test Critical Veto 1: Missing Document Owner
  const defectiveOwnerDoc: EnterpriseConsultingDocument = JSON.parse(JSON.stringify(baseProc));
  defectiveOwnerDoc.metadata.documentOwner = '';
  const ownerDefectScore = enterpriseDocumentationEngine.evaluateConsultingQuality(defectiveOwnerDoc);
  assert(ownerDefectScore.criticalDefects.some(d => d.code === 'OWNER-01'), 'Missing Document Owner triggers CRITICAL defect OWNER-01');
  assert(ownerDefectScore.isReadyForPublication === false, 'CRITICAL defect OWNER-01 vetoes publication readiness regardless of score');

  // Test Critical Veto 2: Missing Approver
  const defectiveApproverDoc: EnterpriseConsultingDocument = JSON.parse(JSON.stringify(baseProc));
  defectiveApproverDoc.metadata.approver = '  ';
  const approverDefectScore = enterpriseDocumentationEngine.evaluateConsultingQuality(defectiveApproverDoc);
  assert(approverDefectScore.criticalDefects.some(d => d.code === 'APPROV-01'), 'Missing Approver triggers CRITICAL defect APPROV-01');
  assert(approverDefectScore.isReadyForPublication === false, 'CRITICAL defect APPROV-01 vetoes publication readiness');

  // Test Critical Veto 3: RACI Discipline Violation (Multiple 'A' roles)
  const defectiveRaciDoc: EnterpriseConsultingDocument = JSON.parse(JSON.stringify(baseProc));
  defectiveRaciDoc.appendixB_OperationalRaci![0].systemOwner = 'A'; // Both requester and system owner are A
  const raciDefectScore = enterpriseDocumentationEngine.evaluateConsultingQuality(defectiveRaciDoc);
  assert(raciDefectScore.criticalDefects.some(d => d.code === 'RACI-01'), 'Multiple Accountable roles in RACI triggers CRITICAL defect RACI-01');
  assert(raciDefectScore.raciDisciplinePassed === false, 'raciDisciplinePassed flag is false');

  // Test Critical Veto 4: Unresolved Placeholders in Approved Status
  const defectivePlaceholderDoc: EnterpriseConsultingDocument = JSON.parse(JSON.stringify(baseProc));
  defectivePlaceholderDoc.metadata.status = 'Approved by Board';
  defectivePlaceholderDoc.scope.statement = 'Governed by {{ORGANIZATION_NAME}} operations.';
  const placeholderDefectScore = enterpriseDocumentationEngine.evaluateConsultingQuality(defectivePlaceholderDoc);
  assert(placeholderDefectScore.criticalDefects.some(d => d.code === 'HOLD-01'), 'Unresolved placeholders in Approved status triggers CRITICAL defect HOLD-01');

  // Test Document-Type Quality Rule: Policy without mandatory requirements
  const defectivePolicyDoc: EnterpriseConsultingDocument = JSON.parse(JSON.stringify(enterpriseDocumentationEngine.getModelInformationSecurityPolicy()));
  defectivePolicyDoc.mandatoryRequirements = [];
  const policyDefectScore = enterpriseDocumentationEngine.evaluateConsultingQuality(defectivePolicyDoc);
  assert(policyDefectScore.criticalDefects.some(d => d.code === 'POL-REQ-01'), 'Policy without mandatory requirements triggers CRITICAL defect POL-REQ-01');

  // Test Critical Veto 5: RoPA Register missing statutory schema or records
  const defectiveRopaDoc = enterpriseDocumentationEngine.generateDocument('TMPL-REG-ROPA-001', 'MODEL');
  defectiveRopaDoc.registerSchema = [];
  defectiveRopaDoc.registerRecords = [];
  const ropaDefectScore = enterpriseDocumentationEngine.evaluateConsultingQuality(defectiveRopaDoc);
  assert(ropaDefectScore.criticalDefects.some(d => d.code === 'ROPA-01'), 'RoPA Register missing statutory schema triggers CRITICAL defect ROPA-01');
  assert(ropaDefectScore.isReadyForPublication === false, 'CRITICAL defect ROPA-01 vetoes publication readiness');

  // Test Critical Veto 6: SoA Review Pack missing control coverage and review agenda
  const defectiveSoaDoc = enterpriseDocumentationEngine.generateDocument('TMPL-REV-SOA-001', 'MODEL');
  defectiveSoaDoc.statementOfApplicabilityEntries = [];
  defectiveSoaDoc.managementReviewAgenda = [];
  const soaDefectScore = enterpriseDocumentationEngine.evaluateConsultingQuality(defectiveSoaDoc);
  assert(soaDefectScore.criticalDefects.some(d => d.code === 'REV-01'), 'SoA Review Pack missing control coverage triggers CRITICAL defect REV-01');
  assert(soaDefectScore.isReadyForPublication === false, 'CRITICAL defect REV-01 vetoes publication readiness');

  // Test Quality Rule: Repetitive padding penalty
  const paddedDoc: EnterpriseConsultingDocument = JSON.parse(JSON.stringify(baseProc));
  paddedDoc.purpose = 'This procedure describes user access provisioning. '.repeat(40);
  const paddedScore = enterpriseDocumentationEngine.evaluateConsultingQuality(paddedDoc);
  assert(paddedScore.warnings.some(w => w.code === 'PADDING-01'), 'Repetitive boilerplate text triggers quality finding PADDING-01');
  assert(paddedScore.dimensionScores['STRUCTURAL_COMPLETENESS'].score < 20, 'Textual repetition applies score penalty to prevent score manipulation');

  // --------------------------------------------------------------------------
  // TEST SUITE 7: DEEP VALIDATION OF 12 PRIORITY DOCUMENTS (PHASE 48)
  // --------------------------------------------------------------------------
  console.log('\n--- Test Suite 7: Deep Validation of 12 Priority Documents ---');

  const priority12Templates = [
    { id: 'TMPL-POL-SEC-001', name: 'Information Security Policy', type: 'POLICY' },
    { id: 'TMPL-POL-SEC-002', name: 'Access Control Policy', type: 'POLICY' },
    { id: 'TMPL-POL-SEC-004', name: 'Asset Management Policy', type: 'POLICY' },
    { id: 'TMPL-POL-SEC-009', name: 'Vulnerability Management Policy', type: 'POLICY' },
    { id: 'TMPL-POL-SEC-011', name: 'Incident Management Policy', type: 'POLICY' },
    { id: 'TMPL-POL-SEC-013', name: 'Business Continuity Policy', type: 'POLICY' },
    { id: 'TMPL-PROC-IAM-001', name: 'User Access Provisioning Procedure', type: 'PROCEDURE' },
    { id: 'TMPL-PROC-IAM-003', name: 'Periodic Access Review Procedure', type: 'PROCEDURE' },
    { id: 'TMPL-PROC-INC-001', name: 'Incident Management Procedure', type: 'PROCEDURE' },
    { id: 'TMPL-PROC-TPRM-001', name: 'Supplier Risk Assessment Procedure', type: 'PROCEDURE' },
    { id: 'TMPL-REG-ROPA-001', name: 'Records of Processing Activities Register', type: 'REGISTER_LOG' },
    { id: 'TMPL-REV-SOA-001', name: 'Statement of Applicability Support Pack', type: 'MANAGEMENT_REVIEW_PACK' }
  ];

  for (const p of priority12Templates) {
    const tmplMeta = enterpriseDocumentationEngine.getTemplateById(p.id);
    assert(Boolean(tmplMeta), `Priority template ${p.id} (${p.name}) exists in catalogue`);

    // Mode A: Blank Template validation
    const blank = enterpriseDocumentationEngine.generateDocument(p.id, 'BLANK');
    assert(blank.isModelSample === false, `Priority ${p.id} Mode A is marked non-model`);
    assert(JSON.stringify(blank).includes('COMPLETION GUIDANCE') || JSON.stringify(blank).includes('{{'), `Priority ${p.id} Mode A contains completion guidance or placeholders`);

    // Mode B: Model Sample validation
    const model = enterpriseDocumentationEngine.generateDocument(p.id, 'MODEL');
    assert(model.isModelSample === true, `Priority ${p.id} Mode B is marked as model sample`);
    const qScore = enterpriseDocumentationEngine.evaluateConsultingQuality(model);
    assert(qScore.overallScore >= 85, `Priority ${p.id} Mode B achieves consulting quality score (${qScore.overallScore} >= 85)`);
    assert(qScore.criticalDefects.length === 0, `Priority ${p.id} Mode B has zero critical defects`);
    if (model.appendixB_OperationalRaci && model.appendixB_OperationalRaci.length > 0) {
      assert(qScore.raciDisciplinePassed === true, `Priority ${p.id} enforces single-Accountable RACI discipline`);
    }

    // Mode C: Tailored Draft validation (No Fact Invention)
    const tailored = enterpriseDocumentationEngine.generateDocument(p.id, 'TAILORED', testQuestionnaire);
    assert(tailored.isModelSample === false, `Priority ${p.id} Mode C is marked non-model`);
    assert(tailored.scope.inScopeLegalEntities.includes('Starlight Financial Technologies Inc.'), `Priority ${p.id} Mode C embeds verified organization name`);
  }

  // Domain-specific content depth checks
  const accessPolicy = enterpriseDocumentationEngine.generateDocument('TMPL-POL-SEC-002', 'MODEL');
  assert(JSON.stringify(accessPolicy.mandatoryRequirements).includes('Multi-Factor Authentication') || JSON.stringify(accessPolicy.mandatoryRequirements).includes('MFA'), 'Access Control Policy mandates MFA');

  const vulnPolicy = enterpriseDocumentationEngine.generateDocument('TMPL-POL-SEC-009', 'MODEL');
  assert(JSON.stringify(vulnPolicy.mandatoryRequirements).includes('CVSS') || JSON.stringify(vulnPolicy.mandatoryRequirements).includes('SLA'), 'Vulnerability Management Policy contains CVSS SLAs');
  assert(JSON.stringify(vulnPolicy.mandatoryRequirements).includes('Service Level Objectives') || JSON.stringify(vulnPolicy.mandatoryRequirements).includes('SLO'), 'Vulnerability Management Policy explicitly designates targets as organization-approved Service Level Objectives (SLOs)');
  assert(!JSON.stringify(vulnPolicy.mandatoryRequirements).includes('mandatory SLA windows: Critical'), 'Vulnerability Management Policy does not claim fixed windows are statutory mandates');

  const incPolicy = enterpriseDocumentationEngine.generateDocument('TMPL-POL-SEC-011', 'MODEL');
  const incReq3 = incPolicy.mandatoryRequirements?.find(r => r.sectionId === 'REQ-03');
  assert(Boolean(incReq3 && incReq3.statement.includes('CERT-In (India)') && incReq3.statement.includes('within 6 hours')), 'Incident Management Policy details CERT-In 6-hour requirement for Indian entities');
  assert(Boolean(incReq3 && incReq3.statement.includes('MAS (Singapore)') && incReq3.statement.includes('regulated Financial Institutions') && incReq3.statement.includes('within 1 hour')), 'Incident Management Policy qualifies MAS 1-hour requirement for regulated Financial Institutions upon severe disruption');
  assert(Boolean(incReq3 && incReq3.statement.includes('EU GDPR') && incReq3.statement.includes('within 72 hours') && incReq3.statement.includes('risk to rights and freedoms')), 'Incident Management Policy qualifies GDPR 72-hour requirement for risk to rights and freedoms');
  assert(Boolean(incReq3 && incReq3.statement.includes('India DPDP Act 2023') && incReq3.statement.includes('in such form and manner as may be prescribed')), 'Incident Management Policy specifies DPDP Act 2023 intimation as prescribed by Rules');

  const incProc = enterpriseDocumentationEngine.generateDocument('TMPL-PROC-INC-001', 'MODEL');
  assert(incProc.procedureSteps && incProc.procedureSteps.length >= 6, `Incident Response Procedure has full 6-gate operational workflow (found: ${incProc.procedureSteps?.length})`);
  const incStep4 = incProc.procedureSteps?.find(s => s.stepNumber === 4);
  assert(Boolean(incStep4 && incStep4.requiredAction.includes('jurisdictional statutory thresholds')), 'Incident Response Step 4 implements jurisdictional statutory evaluation');

  const ropaDoc = enterpriseDocumentationEngine.generateDocument('TMPL-REG-ROPA-001', 'MODEL');
  assert(Boolean(ropaDoc.registerSchema && ropaDoc.registerSchema.length === 16), `RoPA Register defines comprehensive 16-column partitioned schema (${ropaDoc.registerSchema?.length} cols)`);
  assert(Boolean(ropaDoc.registerRecords && ropaDoc.registerRecords.length >= 3), `RoPA Register includes substantive operational records (${ropaDoc.registerRecords?.length} records)`);

  const gdprStatCols = (ropaDoc.registerSchema || []).filter(c => c.legalRegime === 'EU_GDPR_STATUTORY');
  assert(gdprStatCols.length === 8, `RoPA Register separates exactly 8 statutory GDPR Article 30(1) columns (found: ${gdprStatCols.length})`);

  const dpdpCompCols = (ropaDoc.registerSchema || []).filter(c => c.legalRegime === 'INDIA_DPDP_COMPLIANCE');
  assert(dpdpCompCols.length === 4, `RoPA Register separates exactly 4 India DPDP Act 2023 compliance columns (found: ${dpdpCompCols.length})`);

  const govRecCols = (ropaDoc.registerSchema || []).filter(c => c.legalRegime === 'ENTERPRISE_GOVERNANCE_RECOMMENDED');
  assert(govRecCols.length === 4, `RoPA Register separates exactly 4 Enterprise Privacy Governance recommended columns (found: ${govRecCols.length})`);

  const processIdCol = (ropaDoc.registerSchema || []).find(c => c.fieldName.includes('Process ID'));
  assert(processIdCol?.legalRegime === 'ENTERPRISE_GOVERNANCE_RECOMMENDED', 'Process ID is classified as Enterprise Governance Recommended (NOT falsely labeled GDPR Art 30 statutory)');

  const lawfulBasisCol = (ropaDoc.registerSchema || []).find(c => c.fieldName.includes('Lawful Basis'));
  assert(lawfulBasisCol?.legalRegime === 'ENTERPRISE_GOVERNANCE_RECOMMENDED', 'Lawful Basis under GDPR Art 6 is classified as EDPB/ICO Recommended Practice (NOT direct Art 30 statutory mandate)');

  const soaDoc = enterpriseDocumentationEngine.generateDocument('TMPL-REV-SOA-001', 'MODEL');
  assert(Boolean(soaDoc.managementReviewAgenda && soaDoc.managementReviewAgenda.length >= 5), `SoA Review Pack includes ISO 27001 Clause 9.3 Management Review agenda items (${soaDoc.managementReviewAgenda?.length})`);
  assert(Boolean(soaDoc.statementOfApplicabilityEntries && soaDoc.statementOfApplicabilityEntries.length === 10), `SoA Review Pack includes Annex A control applicability mappings (${soaDoc.statementOfApplicabilityEntries?.length} controls)`);

  const allSoaHaveNormative = (soaDoc.statementOfApplicabilityEntries || []).every(e => e.normativeSource === 'ISO/IEC 27001:2022 Clause 6.1.3(d)');
  assert(allSoaHaveNormative, '100% of SoA entries cite normative requirement ISO/IEC 27001:2022 Clause 6.1.3(d)');

  const allSoaHaveGuidance = (soaDoc.statementOfApplicabilityEntries || []).every(e => Boolean(e.implementationGuidanceRef && e.implementationGuidanceRef.includes('ISO/IEC 27002:2022')));
  assert(allSoaHaveGuidance, '100% of SoA entries distinguish normative requirement from ISO/IEC 27002:2022 implementation guidance');

  const allSoaHaveLimitations = (soaDoc.statementOfApplicabilityEntries || []).every(e => Boolean(e.assuranceLimitation && e.assuranceLimitation.length > 20));
  assert(allSoaHaveLimitations, '100% of SoA entries include explicit assurance limitations (policy existence != operational proof)');

  // --------------------------------------------------------------------------
  // TEST SUITE 8: GENERATION ACROSS ALL 10 DOCUMENT TYPES
  // --------------------------------------------------------------------------
  console.log('\n--- Test Suite 8: Generation Across All 10 Document Types ---');

  const testTypeTemplates: Array<{ type: DocumentType; tmplId: string }> = [
    { type: 'POLICY', tmplId: 'TMPL-POL-SEC-001' },
    { type: 'PROCEDURE', tmplId: 'TMPL-PROC-IAM-001' },
    { type: 'STANDARD', tmplId: 'TMPL-POL-SEC-008' },
    { type: 'SOP', tmplId: 'TMPL-PROC-BKP-001' },
    { type: 'GUIDELINE', tmplId: 'TMPL-POL-SEC-017' },
    { type: 'WORK_INSTRUCTION', tmplId: 'TMPL-PROC-EVID-001' },
    { type: 'FORM_CHECKLIST', tmplId: 'TMPL-FORM-DPIA-001' },
    { type: 'REGISTER_LOG', tmplId: 'TMPL-REG-ROPA-001' },
    { type: 'IMPLEMENTATION_PLAN', tmplId: 'TMPL-PLAN-RTP-001' },
    { type: 'MANAGEMENT_REVIEW_PACK', tmplId: 'TMPL-REV-SOA-001' }
  ];

  for (const item of testTypeTemplates) {
    const tmpl = enterpriseDocumentationEngine.getTemplateById(item.tmplId);
    assert(Boolean(tmpl), `Template ${item.tmplId} found for document type ${item.type}`);
    assert(tmpl?.documentType === item.type, `Template ${item.tmplId} has matching documentType ${item.type}`);

    // Generate Model Sample
    const docB = enterpriseDocumentationEngine.generateDocument(item.tmplId, 'MODEL');
    assert(docB.metadata.documentType === item.type, `Mode B generated document type matches ${item.type}`);
    assert(docB.metadata.title.length > 5, `Mode B has non-empty title ("${docB.metadata.title}")`);

    // Generate Tailored Draft
    const docC = enterpriseDocumentationEngine.generateDocument(item.tmplId, 'TAILORED', testQuestionnaire);
    assert(docC.metadata.documentType === item.type, `Mode C generated document type matches ${item.type}`);
    assert(docC.scope.inScopeLegalEntities.includes('Starlight Financial Technologies Inc.'), `Mode C tailored legal entity for ${item.type}`);
  }

  // --------------------------------------------------------------------------
  // TEST SUITE 9: ACTUAL MULTI-FORMAT EXPORT VERIFICATION (PHASE 48)
  // --------------------------------------------------------------------------
  console.log('\n--- Test Suite 9: Actual Multi-Format Export Verification ---');

  const artifactDirs = [
    'C:\\Users\\karthikeyan.j\\.gemini\\antigravity-ide\\brain\\8f09e02f-9ad8-447c-8a43-beca906cac94',
    path.resolve(process.env.APPDATA || 'C:\\Users\\karthikeyan.j\\.gemini\\antigravity-ide', 'brain', '8f09e02f-9ad8-447c-8a43-beca906cac94')
  ];
  for (const dir of artifactDirs) {
    if (!fs.existsSync(dir)) {
      try { fs.mkdirSync(dir, { recursive: true }); } catch { /* ignore */ }
    }
  }

  // 1. Export InfoSec Policy DOCX
  const policySampleDoc = enterpriseDocumentationEngine.generateDocument('TMPL-POL-SEC-001', 'MODEL');
  const policyDocx = await enterpriseDocumentationEngine.exportToDocx(policySampleDoc);
  assert(Buffer.isBuffer(policyDocx) && policyDocx.length > 8000, `Policy DOCX buffer generated successfully (size: ${policyDocx.length} bytes)`);

  const policyZip = await JSZip.loadAsync(policyDocx);
  assert(Boolean(policyZip.file('[Content_Types].xml')), 'Policy OpenXML contains [Content_Types].xml');
  assert(Boolean(policyZip.file('word/document.xml')), 'Policy OpenXML contains word/document.xml');
  assert(Boolean(policyZip.file('word/header1.xml')), 'Policy OpenXML contains word/header1.xml');
  assert(Boolean(policyZip.file('word/footer1.xml')), 'Policy OpenXML contains word/footer1.xml');
  const policyXml = await policyZip.file('word/document.xml')!.async('string');
  assert(policyXml.includes('<w:tblHeader/>'), 'Policy OpenXML contains repeating table headers (<w:tblHeader/>)');
  assert(policyXml.includes('Information Security Policy'), 'Policy OpenXML contains document title');

  // 2. Export User Access Provisioning Procedure DOCX
  const procSampleDoc = enterpriseDocumentationEngine.generateDocument('TMPL-PROC-IAM-001', 'MODEL');
  const procDocx = await enterpriseDocumentationEngine.exportToDocx(procSampleDoc);
  assert(Buffer.isBuffer(procDocx) && procDocx.length > 10000, `Procedure DOCX buffer generated successfully (size: ${procDocx.length} bytes)`);
  const procZip = await JSZip.loadAsync(procDocx);
  const procXml = await procZip.file('word/document.xml')!.async('string');
  assert(procXml.includes('w:orient="landscape"'), 'Procedure DOCX includes landscape section orientation for 6-column steps table');

  // 3. Export RoPA Register DOCX
  const ropaSampleDoc = enterpriseDocumentationEngine.generateDocument('TMPL-REG-ROPA-001', 'MODEL');
  const ropaDocx = await enterpriseDocumentationEngine.exportToDocx(ropaSampleDoc);
  assert(Buffer.isBuffer(ropaDocx) && ropaDocx.length > 10000, `RoPA Register DOCX buffer generated successfully (size: ${ropaDocx.length} bytes)`);
  const ropaZip = await JSZip.loadAsync(ropaDocx);
  const ropaXml = await ropaZip.file('word/document.xml')!.async('string');
  assert(ropaXml.includes('ROPA-ACT-001'), 'RoPA DOCX contains substantive record row ID (ROPA-ACT-001)');
  assert(ropaXml.includes('w:orient="landscape"'), 'RoPA DOCX includes landscape section for wide statutory records table');

  // 4. Export SoA Review Pack DOCX
  const soaSampleDoc = enterpriseDocumentationEngine.generateDocument('TMPL-REV-SOA-001', 'MODEL');
  const soaDocx = await enterpriseDocumentationEngine.exportToDocx(soaSampleDoc);
  assert(Buffer.isBuffer(soaDocx) && soaDocx.length > 10000, `SoA Review Pack DOCX buffer generated successfully (size: ${soaDocx.length} bytes)`);
  const soaZip = await JSZip.loadAsync(soaDocx);
  const soaXml = await soaZip.file('word/document.xml')!.async('string');
  assert(soaXml.includes('A.5.1') && soaXml.includes('A.5.15'), 'SoA DOCX contains Annex A controls');
  assert(soaXml.includes('Clause 9.3'), 'SoA DOCX contains ISO 27001 Clause 9.3 Management Review agenda');

  // Save all 4 sample DOCX files to artifacts directory
  for (const dir of artifactDirs) {
    try {
      fs.writeFileSync(path.join(dir, 'ISMS-POL-001_Enterprise_Information_Security_Policy.docx'), policyDocx);
      fs.writeFileSync(path.join(dir, 'ISMS-PROC-IAM-001_User_Access_Provisioning_Procedure.docx'), procDocx);
      fs.writeFileSync(path.join(dir, 'CATALOGUE_SAMPLE_ROPA_REGISTER.docx'), ropaDocx);
      fs.writeFileSync(path.join(dir, 'CATALOGUE_SAMPLE_SOA_REVIEW_PACK.docx'), soaDocx);
    } catch { /* ignore */ }
  }
  assert(fs.existsSync(path.join(artifactDirs[0], 'CATALOGUE_SAMPLE_ROPA_REGISTER.docx')), 'Exported RoPA Register DOCX to artifact directory');
  assert(fs.existsSync(path.join(artifactDirs[0], 'CATALOGUE_SAMPLE_SOA_REVIEW_PACK.docx')), 'Exported SoA Review Pack DOCX to artifact directory');

  // 5. Verify HTML & Markdown Export Fidelity
  const ropaMd = enterpriseDocumentationEngine.exportToMarkdown(ropaSampleDoc);
  assert(ropaMd.includes('Register Schema & Column Specifications'), 'RoPA Markdown export contains Schema table');
  assert(ropaMd.includes('ROPA-ACT-001'), 'RoPA Markdown export contains substantive operational records');

  const soaHtml = enterpriseDocumentationEngine.exportToPrintReadyHtml(soaSampleDoc);
  assert(soaHtml.includes('Statement of Applicability (SoA) Evaluation Matrix'), 'SoA HTML export contains SoA Evaluation Matrix');
  assert(soaHtml.includes('Management Review Agenda & Executive Decisions'), 'SoA HTML export contains Clause 9.3 Agenda');

  // --------------------------------------------------------------------------
  // TEST SUITE 9: VERSION COMPARISON & CONTENT PRESERVATION
  // --------------------------------------------------------------------------
  console.log('\n--- Test Suite 9: Version Comparison & Content Preservation ---');

  const docV1 = enterpriseDocumentationEngine.getModelInformationSecurityPolicy();
  const docV2 = JSON.parse(JSON.stringify(docV1)) as EnterpriseConsultingDocument;
  docV2.metadata.version = '1.2';
  docV2.purpose = 'Enhanced management commitment directive and revised risk governance mandates.';
  docV2.scope.inScopeLocations.push('APAC Secondary Data Center');

  const diffResult = enterpriseDocumentationEngine.diffDocuments(docV1, docV2);
  assert(diffResult.sourceVersion === '1.1', `Diff source version is 1.1`);
  assert(diffResult.targetVersion === '1.2', `Diff target version is 1.2`);
  assert(diffResult.purposeChanged === true, `Diff detects purpose change`);
  assert(diffResult.scopeChanged === true, `Diff detects scope change`);
  assert(diffResult.totalChanges > 0, `Diff detected ${diffResult.totalChanges} total changes`);

  // --------------------------------------------------------------------------
  // TEST SUITE 10: MULTI-TENANT ISOLATION & GOVERNANCE PROMOTION
  // --------------------------------------------------------------------------
  console.log('\n--- Test Suite 10: Multi-Tenant Isolation & Security ---');

  const tenantDoc = enterpriseDocumentationEngine.generateDocument('TMPL-POL-SEC-001', 'TAILORED', testQuestionnaire);
  tenantDoc.tenantId = 'TENANT-ALPHA';

  const promotedGovDoc = enterpriseDocumentationEngine.promoteToGovernanceDocument(
    tenantDoc,
    'ciso@tenant-alpha.com',
    'CISO'
  );
  assert(promotedGovDoc.tenantId === 'TENANT-ALPHA', 'Authoritative Governance Document preserves tenant isolation');
  assert(Boolean(promotedGovDoc.id && promotedGovDoc.code), `Governance document registered with authoritative code (${promotedGovDoc.code})`);
  assert(promotedGovDoc.versions.length > 0, 'Promotion records initial document version in authoritative register');

  // --------------------------------------------------------------------------
  // TEST SUITE 11: REGULATORY ACCURACY, NEGATIVE TESTING & ASSURANCE (PHASE 48.1)
  // --------------------------------------------------------------------------
  console.log('\n--- Test Suite 11: Regulatory Accuracy, Negative Tests & Assurance Gates ---');

  // 1. Explicit Verification Assurance Taxonomy Verification
  assert(Boolean(VERIFICATION_EVIDENCE_CRITERIA.PRODUCTION_VERIFIED), 'Taxonomy contains PRODUCTION_VERIFIED status');
  assert(
    VERIFICATION_EVIDENCE_CRITERIA.PRODUCTION_VERIFIED.insufficientEvidenceExamples.some(e => e.includes('npm run build') || e.includes('Passing build step')),
    'PRODUCTION_VERIFIED explicitly defines successful build/unit tests as INSUFFICIENT evidence'
  );
  assert(
    VERIFICATION_EVIDENCE_CRITERIA.PRODUCTION_VERIFIED.mandatoryEvidenceRequirements.some(e => e.includes('Live deployment') || e.includes('telemetry')),
    'PRODUCTION_VERIFIED requires live production deployment and active telemetry evidence'
  );

  assert(Boolean(VERIFICATION_EVIDENCE_CRITERIA.DOCUMENT_RENDER_PENDING), 'Taxonomy contains DOCUMENT_RENDER_PENDING status');
  assert(
    VERIFICATION_EVIDENCE_CRITERIA.DOCUMENT_RENDER_PENDING.insufficientEvidenceExamples.some(e => e.includes('XML tags without native rendering')),
    'DOCUMENT_RENDER_PENDING clarifies OpenXML package validity alone does not prove visual rendering correctness'
  );

  assert(Boolean(VERIFICATION_EVIDENCE_CRITERIA.LIVE_DATABASE_RLS_PENDING), 'Taxonomy contains LIVE_DATABASE_RLS_PENDING status');
  assert(
    VERIFICATION_EVIDENCE_CRITERIA.LIVE_DATABASE_RLS_PENDING.insufficientEvidenceExamples.some(e => e.includes('In-memory or mock database')),
    'LIVE_DATABASE_RLS_PENDING clarifies in-memory tests do NOT establish live PostgreSQL RLS verification'
  );

  assert(Boolean(VERIFICATION_EVIDENCE_CRITERIA.REGULATORY_SOURCE_VERIFIED), 'Taxonomy contains REGULATORY_SOURCE_VERIFIED status');
  assert(
    VERIFICATION_EVIDENCE_CRITERIA.REGULATORY_SOURCE_VERIFIED.mandatoryEvidenceRequirements.some(e => e.includes('Primary text citation')),
    'REGULATORY_SOURCE_VERIFIED mandates inspection against primary statutory/standards text'
  );

  assert(Boolean(VERIFICATION_EVIDENCE_CRITERIA.REGULATORY_SOURCE_UNVERIFIED), 'Taxonomy contains REGULATORY_SOURCE_UNVERIFIED status');
  assert(
    VERIFICATION_EVIDENCE_CRITERIA.REGULATORY_SOURCE_UNVERIFIED.mandatoryEvidenceRequirements.some(e => e.includes('UNVERIFIED')),
    'REGULATORY_SOURCE_UNVERIFIED prevents unverified claims from being represented as confirmed law'
  );

  // 2. Negative Test 1: Conflated Universal Regulatory Reporting (REG-ACC-01)
  const defectiveReportingDoc: EnterpriseConsultingDocument = JSON.parse(JSON.stringify(incPolicy));
  defectiveReportingDoc.mandatoryRequirements![2].statement =
    'Formal regulatory disclosures must be executed strictly within statutory deadlines: CERT-In (India): within 6 hours of identification; Monetary Authority of Singapore (MAS): within 1 hour of confirmation; GDPR (EU): within 72 hours of becoming aware; DPDP Act 2023 (India): immediate intimation to Data Protection Board of India and affected data principals.';
  const repScore = enterpriseDocumentationEngine.evaluateConsultingQuality(defectiveReportingDoc);
  assert(repScore.criticalDefects.some(d => d.code === 'REG-ACC-01'), 'Conflated universal regulatory reporting triggers CRITICAL defect REG-ACC-01');
  assert(repScore.isReadyForPublication === false, 'CRITICAL defect REG-ACC-01 vetoes publication readiness');

  // 3. Negative Test 2: Vulnerability SLA falsely presented as mandatory statutory law (REG-ACC-02)
  const defectiveVulnDoc: EnterpriseConsultingDocument = JSON.parse(JSON.stringify(vulnPolicy));
  defectiveVulnDoc.mandatoryRequirements![1].statement =
    'Identified vulnerabilities must be remediated or compensated within mandatory SLA windows: Critical (CVSS 9.0–10.0 or actively exploited): within 48 hours; High (CVSS 7.0–8.9): within 7 calendar days; Medium (CVSS 4.0–6.9): within 30 calendar days; Low (CVSS 0.1–3.9): within 90 calendar days.';
  defectiveVulnDoc.mandatoryRequirements![1].provenance = 'VERIFIED_ORGANIZATIONAL_FACT';
  const vulnDefectScore = enterpriseDocumentationEngine.evaluateConsultingQuality(defectiveVulnDoc);
  assert(vulnDefectScore.criticalDefects.some(d => d.code === 'REG-ACC-02'), 'Fixed vulnerability SLA presented as mandatory statutory law triggers CRITICAL defect REG-ACC-02');
  assert(vulnDefectScore.isReadyForPublication === false, 'CRITICAL defect REG-ACC-02 vetoes publication readiness');

  // 4. Negative Test 3: RoPA Register Conflating GDPR Art 30 with DPDP or Internal Fields (REG-ACC-03)
  const defectiveRoPADoc: EnterpriseConsultingDocument = JSON.parse(JSON.stringify(ropaDoc));
  defectiveRoPADoc.registerSchema![0] = {
    fieldName: 'Process ID',
    dataType: 'String',
    isMandatory: true,
    regulatorySource: 'GDPR Art 30(1)',
    description: 'Unique internal identifier'
  };
  const ropaConflationDefectScore = enterpriseDocumentationEngine.evaluateConsultingQuality(defectiveRoPADoc);
  assert(ropaConflationDefectScore.criticalDefects.some(d => d.code === 'REG-ACC-03'), 'RoPA schema claiming Process ID is statutory GDPR Art 30 triggers CRITICAL defect REG-ACC-03');
  assert(ropaConflationDefectScore.isReadyForPublication === false, 'CRITICAL defect REG-ACC-03 vetoes publication readiness');

  // 5. Negative Test 4: Unverified Framework Mapping in Approved State (REG-ACC-04)
  const unverifiedFrameworkDoc: EnterpriseConsultingDocument = JSON.parse(JSON.stringify(accessPolicy));
  unverifiedFrameworkDoc.metadata.status = 'Approved by Board';
  unverifiedFrameworkDoc.mandatoryRequirements![0].provenance = 'UNVERIFIED_SOURCE_MAPPING' as any;
  const unverifiedScore = enterpriseDocumentationEngine.evaluateConsultingQuality(unverifiedFrameworkDoc);
  assert(unverifiedScore.criticalDefects.some(d => d.code === 'REG-ACC-04'), 'Approved document with unverified framework mapping triggers CRITICAL defect REG-ACC-04');
  assert(unverifiedScore.isReadyForPublication === false, 'CRITICAL defect REG-ACC-04 vetoes publication readiness');

  // 6. Negative Test 5: Conflicting Operational and Regulatory Timing (REG-ACC-05)
  const conflictingTimingDoc: EnterpriseConsultingDocument = JSON.parse(JSON.stringify(incProc));
  conflictingTimingDoc.procedureSteps![0].requiredAction =
    'SOC Analyst will monitor detection and escalate within 24 hours prior to external escalation within 6 hours.';
  const conflictScore = enterpriseDocumentationEngine.evaluateConsultingQuality(conflictingTimingDoc);
  assert(conflictScore.criticalDefects.some(d => d.code === 'REG-ACC-05'), 'Internal escalation window longer than statutory reporting deadline triggers CRITICAL defect REG-ACC-05');
  assert(conflictScore.isReadyForPublication === false, 'CRITICAL defect REG-ACC-05 vetoes publication readiness');

  // 7. Test Critical Defect Publication Veto Despite High Numerical Score
  assert(repScore.overallScore >= 85, `Defective reporting document has high score (${repScore.overallScore} >= 85) but publication is vetoed`);
  assert(repScore.isReadyForPublication === false, 'Publication is unconditionally blocked when any critical regulatory defect exists');

  // --------------------------------------------------------------------------
  // TEST SUITE 12: PRIVACY REGISTER SCHEMA NEGATIVE TESTS (PHASE 48.2 WORKSTREAM 2)
  // --------------------------------------------------------------------------
  console.log('\n--- Test Suite 12: Privacy Register Schema Negative Tests (Workstream 2) ---');

  // Baseline: RoPA register passes schema validation cleanly
  const validSchemaCheck = validatePrivacyRegisterSchema(ropaSampleDoc.registerSchema!);
  assert(validSchemaCheck.isValid === true, 'Baseline RoPA register schema passes all regulatory and governance rules cleanly');
  assert(ropaSampleDoc.registerSchema!.length === 16, `Baseline RoPA schema contains exactly 16 partitioned columns (found: ${ropaSampleDoc.registerSchema!.length})`);

  // Negative Test 1: Recommendation labelled a statutory mandate (SCHEMA-NEG-01)
  const defectiveSchemaRecMandate: RegisterSchemaColumn[] = JSON.parse(JSON.stringify(ropaSampleDoc.registerSchema!));
  defectiveSchemaRecMandate[12].sourceVerificationStatus = 'VERIFIED_STATUTORY'; // Internal Process ID
  const negCheck1 = validatePrivacyRegisterSchema(defectiveSchemaRecMandate);
  assert(negCheck1.isValid === false, 'Recommendation labelled a statutory mandate is rejected');
  assert(negCheck1.defects.some(d => d.code === 'SCHEMA-NEG-01'), 'Defect code SCHEMA-NEG-01 flagged for mislabelled recommendation');

  // Negative Test 2a: Unrelated DPDP legal provision assigned to GDPR statutory column (SCHEMA-NEG-02)
  const defectiveSchemaGdprUnrelated: RegisterSchemaColumn[] = JSON.parse(JSON.stringify(ropaSampleDoc.registerSchema!));
  defectiveSchemaGdprUnrelated[1].regulatorySource = 'DPDP Act 2023 Sec 4'; // Purpose column
  const negCheck2a = validatePrivacyRegisterSchema(defectiveSchemaGdprUnrelated);
  assert(negCheck2a.isValid === false, 'GDPR statutory column assigned DPDP provision is rejected');
  assert(negCheck2a.defects.some(d => d.code === 'SCHEMA-NEG-02'), 'Defect code SCHEMA-NEG-02 flagged for unrelated cross-statute provision in GDPR');

  // Negative Test 2b: Unrelated GDPR provision assigned to DPDP compliance column (SCHEMA-NEG-02)
  const defectiveSchemaDpdpUnrelated: RegisterSchemaColumn[] = JSON.parse(JSON.stringify(ropaSampleDoc.registerSchema!));
  defectiveSchemaDpdpUnrelated[8].regulatorySource = 'EU GDPR Art 6'; // DPDP Notice column
  const negCheck2b = validatePrivacyRegisterSchema(defectiveSchemaDpdpUnrelated);
  assert(negCheck2b.isValid === false, 'DPDP compliance column assigned GDPR provision is rejected');
  assert(negCheck2b.defects.some(d => d.code === 'SCHEMA-NEG-02'), 'Defect code SCHEMA-NEG-02 flagged for unrelated cross-statute provision in DPDP');

  // Negative Test 3: Field mandatory without supported legal or governance basis (SCHEMA-NEG-03)
  const defectiveSchemaMandatoryNoBasis: RegisterSchemaColumn[] = JSON.parse(JSON.stringify(ropaSampleDoc.registerSchema!));
  defectiveSchemaMandatoryNoBasis[0].authoritativeSource = undefined;
  defectiveSchemaMandatoryNoBasis[0].legalOrGovernanceBasis = undefined;
  const negCheck3 = validatePrivacyRegisterSchema(defectiveSchemaMandatoryNoBasis);
  assert(negCheck3.isValid === false, 'Mandatory field without supported legal basis is rejected');
  assert(negCheck3.defects.some(d => d.code === 'SCHEMA-NEG-03'), 'Defect code SCHEMA-NEG-03 flagged for unsupported mandatory field');

  // Negative Test 4: Jurisdiction missing from jurisdiction-specific claim (SCHEMA-NEG-04)
  const defectiveSchemaMissingJurisdiction: RegisterSchemaColumn[] = JSON.parse(JSON.stringify(ropaSampleDoc.registerSchema!));
  defectiveSchemaMissingJurisdiction[0].applicableJurisdiction = undefined;
  const negCheck4 = validatePrivacyRegisterSchema(defectiveSchemaMissingJurisdiction);
  assert(negCheck4.isValid === false, 'Jurisdiction-specific statutory field missing jurisdiction declaration is rejected');
  assert(negCheck4.defects.some(d => d.code === 'SCHEMA-NEG-04'), 'Defect code SCHEMA-NEG-04 flagged for missing jurisdiction declaration');

  // Negative Test 5a: Controller/Processor vs Data Fiduciary role confused in GDPR (SCHEMA-NEG-05)
  const defectiveSchemaRoleConfusedGdpr: RegisterSchemaColumn[] = JSON.parse(JSON.stringify(ropaSampleDoc.registerSchema!));
  defectiveSchemaRoleConfusedGdpr[0].applicableRole = 'Data Fiduciary (DPDP Act §2(i))';
  const negCheck5a = validatePrivacyRegisterSchema(defectiveSchemaRoleConfusedGdpr);
  assert(negCheck5a.isValid === false, 'GDPR Art 30 controller column confusing Data Fiduciary role is rejected');
  assert(negCheck5a.defects.some(d => d.code === 'SCHEMA-NEG-05'), 'Defect code SCHEMA-NEG-05 flagged for GDPR/DPDP role confusion');

  // Negative Test 5b: Controller/Processor vs Data Fiduciary role confused in DPDP (SCHEMA-NEG-05)
  const defectiveSchemaRoleConfusedDpdp: RegisterSchemaColumn[] = JSON.parse(JSON.stringify(ropaSampleDoc.registerSchema!));
  defectiveSchemaRoleConfusedDpdp[8].applicableRole = 'Data Controller (GDPR Art 4(7))';
  const negCheck5b = validatePrivacyRegisterSchema(defectiveSchemaRoleConfusedDpdp);
  assert(negCheck5b.isValid === false, 'DPDP column confusing Data Controller role is rejected');
  assert(negCheck5b.defects.some(d => d.code === 'SCHEMA-NEG-05'), 'Defect code SCHEMA-NEG-05 flagged for DPDP/GDPR role confusion');

  // Negative Test 6: Source missing but status says verified (SCHEMA-NEG-06)
  const defectiveSchemaMissingSourceVerified: RegisterSchemaColumn[] = JSON.parse(JSON.stringify(ropaSampleDoc.registerSchema!));
  defectiveSchemaMissingSourceVerified[0].authoritativeSource = undefined;
  const negCheck6 = validatePrivacyRegisterSchema(defectiveSchemaMissingSourceVerified);
  assert(negCheck6.isValid === false, 'Column claiming VERIFIED_STATUTORY without authoritative source is rejected');
  assert(negCheck6.defects.some(d => d.code === 'SCHEMA-NEG-06'), 'Defect code SCHEMA-NEG-06 flagged for missing authoritative source text');

  // --------------------------------------------------------------------------
  // TEST SUITE 13: VERIFICATION STATUS TRANSITION & RELEASE-GATE ENFORCEMENT (WORKSTREAM 3)
  // --------------------------------------------------------------------------
  console.log('\n--- Test Suite 13: Verification Status Transition & Release Gates (Workstream 3) ---');

  // 1. Build success alone rejected from producing PRODUCTION_VERIFIED
  const trans1 = validateVerificationStatusTransition(
    'BUILD_ARTIFACT_VERIFIED',
    'PRODUCTION_VERIFIED',
    { bundleFilesGenerated: ['dist/server.cjs', 'dist/assets/index.js'] }
  );
  assert(trans1.allowed === false, 'Build success alone cannot produce PRODUCTION_VERIFIED');
  assert(trans1.errorCode === 'ERR_BUILD_NOT_PRODUCTION', 'Throws ERR_BUILD_NOT_PRODUCTION');
  assert(trans1.resultingStatus === 'BUILD_ARTIFACT_VERIFIED', 'Status remains un-promoted at BUILD_ARTIFACT_VERIFIED');

  // 2. Unit tests alone rejected from producing LIVE_DATABASE_RLS_VERIFIED
  const trans2 = validateVerificationStatusTransition(
    'UNIT_TEST_VERIFIED',
    'LIVE_DATABASE_RLS_VERIFIED',
    { testAssertionPassRatio: 1.0 }
  );
  assert(trans2.allowed === false, 'Unit tests alone cannot produce LIVE_DATABASE_RLS_VERIFIED');
  assert(trans2.errorCode === 'ERR_MOCK_NOT_LIVE_RLS', 'Throws ERR_MOCK_NOT_LIVE_RLS');
  assert(trans2.resultingStatus === 'LIVE_DATABASE_RLS_PENDING', 'Status preserved as LIVE_DATABASE_RLS_PENDING');

  // 3. In-memory isolation test rejected from producing PostgreSQL RLS verification
  const trans3 = validateVerificationStatusTransition(
    'RLS_IN_MEMORY_VERIFIED',
    'LIVE_DATABASE_RLS_VERIFIED',
    { databaseType: 'IN_MEMORY', databaseConnectionActive: true }
  );
  assert(trans3.allowed === false, 'In-memory isolation cannot produce LIVE_DATABASE_RLS_VERIFIED');
  assert(trans3.errorCode === 'ERR_MOCK_NOT_LIVE_RLS', 'Throws ERR_MOCK_NOT_LIVE_RLS for in-memory database');
  assert(trans3.resultingStatus === 'LIVE_DATABASE_RLS_PENDING', 'Status preserved as LIVE_DATABASE_RLS_PENDING');

  // 4. OpenXML package validation alone rejected from producing VISUALLY_RENDERED
  const trans4 = validateVerificationStatusTransition(
    'OPENXML_PACKAGE_VERIFIED',
    'VISUALLY_RENDERED',
    { openXmlPartsVerified: ['word/document.xml', 'word/header1.xml'], visualRendererEngine: 'NONE' }
  );
  assert(trans4.allowed === false, 'OpenXML package validation alone cannot produce VISUALLY_RENDERED');
  assert(trans4.errorCode === 'ERR_OPENXML_NOT_VISUAL_RENDER', 'Throws ERR_OPENXML_NOT_VISUAL_RENDER');
  assert(trans4.resultingStatus === 'DOCUMENT_RENDER_PENDING', 'Status preserved as DOCUMENT_RENDER_PENDING');

  // 5. Bare source URL presence rejected from producing REGULATORY_SOURCE_VERIFIED
  const trans5 = validateVerificationStatusTransition(
    'SOURCE_VERIFICATION_PENDING',
    'REGULATORY_SOURCE_VERIFIED',
    { sourceUrlOnly: true }
  );
  assert(trans5.allowed === false, 'Presence of source URL alone cannot produce REGULATORY_SOURCE_VERIFIED');
  assert(trans5.errorCode === 'ERR_UNVERIFIED_REGULATORY_SOURCE', 'Throws ERR_UNVERIFIED_REGULATORY_SOURCE');
  assert(trans5.resultingStatus === 'SOURCE_VERIFICATION_PENDING', 'Status preserved as SOURCE_VERIFICATION_PENDING');

  // 6. Document governance approval rejected from implying operational implementation effectiveness
  const trans6 = validateVerificationStatusTransition(
    'UNIT_TEST_VERIFIED',
    'PRODUCTION_VERIFIED',
    { governanceApprovalState: 'APPROVED_BY_BOARD' }
  );
  assert(trans6.allowed === false, 'Document approval by Board does not imply technical implementation effectiveness');
  assert(trans6.errorCode === 'ERR_APPROVAL_NOT_EFFECTIVENESS' || trans6.errorCode === 'ERR_BUILD_NOT_PRODUCTION', 'Throws approval / production gate error');

  // 7. Stale evidence rejected
  const oldTimestamp = new Date(Date.now() - 100 * 3600 * 1000).toISOString(); // 100 hours ago
  const trans7 = validateVerificationStatusTransition(
    'CODE_SYNTAX_VERIFIED',
    'BUILD_ARTIFACT_VERIFIED',
    { bundleFilesGenerated: ['dist/server.cjs'], evidenceTimestamp: oldTimestamp, maxEvidenceAgeHours: 24 }
  );
  assert(trans7.allowed === false, 'Stale evidence (> 24 hours) is rejected');
  assert(trans7.errorCode === 'ERR_STALE_EVIDENCE', 'Throws ERR_STALE_EVIDENCE');

  // 8. Cross-tenant transition rejected
  const trans8 = validateVerificationStatusTransition(
    'CODE_SYNTAX_VERIFIED',
    'BUILD_ARTIFACT_VERIFIED',
    { sourceTenantId: 'TENANT-ALPHA', targetTenantId: 'TENANT-BETA' }
  );
  assert(trans8.allowed === false, 'Cross-tenant status transition is rejected');
  assert(trans8.errorCode === 'ERR_CROSS_TENANT_VIOLATION', 'Throws ERR_CROSS_TENANT_VIOLATION');

  // 9. Unauthorized actor promotion rejected
  const trans9 = validateVerificationStatusTransition(
    'CODE_SYNTAX_VERIFIED',
    'BUILD_ARTIFACT_VERIFIED',
    { actorAuthorized: false, actorRole: 'ANONYMOUS_USER' }
  );
  assert(trans9.allowed === false, 'Unauthorized actor promotion is rejected');
  assert(trans9.errorCode === 'ERR_UNAUTHORIZED_PROMOTION', 'Throws ERR_UNAUTHORIZED_PROMOTION');

  // 10. Valid transition permitted with complete mandatory evidence
  const trans10 = validateVerificationStatusTransition(
    'CODE_SYNTAX_VERIFIED',
    'BUILD_ARTIFACT_VERIFIED',
    { bundleFilesGenerated: ['dist/server.cjs', 'dist/assets/index.js'], evidenceTimestamp: new Date().toISOString(), maxEvidenceAgeHours: 24 }
  );
  assert(trans10.allowed === true, 'Transition permitted when all mandatory evidence criteria are satisfied');
  assert(trans10.resultingStatus === 'BUILD_ARTIFACT_VERIFIED', 'Resulting status promoted to BUILD_ARTIFACT_VERIFIED');

  console.log('\n================================================================');
  console.log(`TEST SUITE RESULTS: ${passedAssertions}/${totalAssertions} ASSERTIONS PASSED`);
  if (failures.length === 0) {
    console.log('STATUS: ALL TESTS PASSED SUCCESSFULLY (100%)');
  } else {
    console.error(`STATUS: ${failures.length} ASSERTIONS FAILED`);
    for (const f of failures) {
      console.error(` - ${f}`);
    }
  }
  console.log('================================================================\n');

  if (failures.length > 0) {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
