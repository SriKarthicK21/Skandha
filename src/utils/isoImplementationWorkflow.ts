import {
  Tenant,
  RiskRecord,
  ControlItem,
  EvidenceRecord,
  InternalAuditPlan,
  FindingCAPARecord,
  GeneratedDocument,
  CompanyRegistrationProfile,
  CompanyComplianceProfile,
  DiscoveryQuestionnaireSection,
  DepartmentSurveyRecord,
  ImplementationPlanItem,
  IsoWorkflowStage,
  ApplicableImplementationArea
} from '../types';

export interface NextActionRecommendation {
  title: string;
  owner: string;
  status: 'Pending' | 'In Progress' | 'Blocked' | 'Action Required';
  requiredBefore: string;
  targetModuleId: string;
  blockers: string[];
  stageNumber: number;
  stageName: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  description: string;
}

/**
 * 24-Stage Workflow Definition for ISO/IEC 27001:2022 Implementation
 */
export const ISO_WORKFLOW_STAGES_METADATA: Array<{
  stageNumber: number;
  id: string;
  name: string;
  category: IsoWorkflowStage['category'];
  defaultOwner: string;
  targetModuleId: string;
  prerequisiteStageIds: string[];
}> = [
  { stageNumber: 1, id: 'company_registration', name: 'Company Registration', category: 'Foundation', defaultOwner: 'Company Admin / Legal', targetModuleId: 'onboarding_survey', prerequisiteStageIds: [] },
  { stageNumber: 2, id: 'organization_discovery', name: 'Organization Discovery', category: 'Foundation', defaultOwner: 'Chief Information Security Officer (CISO)', targetModuleId: 'business_discovery', prerequisiteStageIds: ['company_registration'] },
  { stageNumber: 3, id: 'registration_requirements', name: 'Registration Requirements', category: 'Foundation', defaultOwner: 'ISMS Lead Architect', targetModuleId: 'requirements', prerequisiteStageIds: ['organization_discovery'] },
  { stageNumber: 4, id: 'discovery_questionnaire', name: 'Discovery Questionnaire', category: 'Foundation', defaultOwner: 'Compliance Team', targetModuleId: 'discovery_questionnaire', prerequisiteStageIds: ['registration_requirements'] },
  { stageNumber: 5, id: 'department_survey', name: 'Department Survey', category: 'Foundation', defaultOwner: 'Department Heads', targetModuleId: 'department_surveys', prerequisiteStageIds: ['discovery_questionnaire'] },
  { stageNumber: 6, id: 'tech_asset_discovery', name: 'Technology & Asset Discovery', category: 'Context & Scope', defaultOwner: 'IT Infrastructure Head', targetModuleId: 'assets', prerequisiteStageIds: ['department_survey'] },
  { stageNumber: 7, id: 'regulatory_contractual', name: 'Regulatory & Contractual Obligations', category: 'Context & Scope', defaultOwner: 'General Counsel / DPO', targetModuleId: 'stakeholder_obligations', prerequisiteStageIds: ['tech_asset_discovery'] },
  { stageNumber: 8, id: 'isms_scope', name: 'ISMS Scope Definition', category: 'Context & Scope', defaultOwner: 'Executive Steering Committee', targetModuleId: 'org_scope', prerequisiteStageIds: ['regulatory_contractual'] },
  { stageNumber: 9, id: 'gap_assessment', name: 'Gap Assessment', category: 'Context & Scope', defaultOwner: 'Implementation Consultant', targetModuleId: 'gap_assessment', prerequisiteStageIds: ['isms_scope'] },
  { stageNumber: 10, id: 'implementation_plan', name: 'Implementation Plan', category: 'Context & Scope', defaultOwner: 'ISMS Project Manager', targetModuleId: 'tasks', prerequisiteStageIds: ['gap_assessment'] },
  { stageNumber: 11, id: 'risk_assessment', name: 'Risk Assessment', category: 'Risk & Controls', defaultOwner: 'Risk Manager', targetModuleId: 'risk_assessment', prerequisiteStageIds: ['implementation_plan', 'tech_asset_discovery'] },
  { stageNumber: 12, id: 'risk_treatment', name: 'Risk Treatment', category: 'Risk & Controls', defaultOwner: 'Control Owners / CISO', targetModuleId: 'risk_simulator', prerequisiteStageIds: ['risk_assessment'] },
  { stageNumber: 13, id: 'soa', name: 'Statement of Applicability (SoA)', category: 'Risk & Controls', defaultOwner: 'ISMS Lead Architect', targetModuleId: 'statement_of_applicability', prerequisiteStageIds: ['risk_treatment'] },
  { stageNumber: 14, id: 'policies_procedures', name: 'Policies & Procedures', category: 'Implementation & Evidence', defaultOwner: 'Policy Approvers & CISO', targetModuleId: 'policies', prerequisiteStageIds: ['soa'] },
  { stageNumber: 15, id: 'control_implementation', name: 'Control Implementation', category: 'Implementation & Evidence', defaultOwner: 'SecOps & IT Teams', targetModuleId: 'iso27001_workbench', prerequisiteStageIds: ['policies_procedures'] },
  { stageNumber: 16, id: 'evidence', name: 'Evidence Management', category: 'Implementation & Evidence', defaultOwner: 'Evidence Reviewers', targetModuleId: 'evidence_centre', prerequisiteStageIds: ['control_implementation'] },
  { stageNumber: 17, id: 'awareness', name: 'Awareness & Training', category: 'Implementation & Evidence', defaultOwner: 'HR & People Operations', targetModuleId: 'standards_academy', prerequisiteStageIds: ['policies_procedures'] },
  { stageNumber: 18, id: 'monitoring', name: 'Monitoring & Telemetry', category: 'Assurance & Audit', defaultOwner: 'SecOps & Telemetry Team', targetModuleId: 'iso27001_dashboard', prerequisiteStageIds: ['control_implementation'] },
  { stageNumber: 19, id: 'internal_audit', name: 'Internal Audit', category: 'Assurance & Audit', defaultOwner: 'Lead Internal Auditor', targetModuleId: 'internal_audit', prerequisiteStageIds: ['evidence', 'control_implementation', 'monitoring'] },
  { stageNumber: 20, id: 'management_review', name: 'Management Review', category: 'Assurance & Audit', defaultOwner: 'Executive Leadership Board', targetModuleId: 'management_review', prerequisiteStageIds: ['internal_audit'] },
  { stageNumber: 21, id: 'capa', name: 'Corrective Action (CAPA)', category: 'Assurance & Audit', defaultOwner: 'Remediation Owners', targetModuleId: 'findings_capa', prerequisiteStageIds: ['internal_audit'] },
  { stageNumber: 22, id: 'cert_readiness', name: 'Certification Readiness', category: 'Assurance & Audit', defaultOwner: 'Lead Implementation Consultant', targetModuleId: 'stage_gate_verifier', prerequisiteStageIds: ['management_review', 'capa'] },
  { stageNumber: 23, id: 'certification', name: 'Certification', category: 'Assurance & Audit', defaultOwner: 'Certification Body Auditor', targetModuleId: 'readiness_cert', prerequisiteStageIds: ['cert_readiness'] },
  { stageNumber: 24, id: 'continual_monitoring', name: 'Continual Monitoring', category: 'Continual Improvement', defaultOwner: 'CISO / Continuous Compliance Team', targetModuleId: 'continuous_compliance', prerequisiteStageIds: ['certification'] }
];

/**
 * Evaluates real-time state across 24 stages and produces dynamic progress and status
 */
export function calculateWorkflowStages(
  tenant: Tenant | null,
  risks: RiskRecord[],
  controls: ControlItem[],
  evidence: EvidenceRecord[],
  audits: InternalAuditPlan[],
  findings: FindingCAPARecord[],
  generatedDocs: GeneratedDocument[]
): IsoWorkflowStage[] {
  if (!tenant) return [];

  const regProfile = tenant.companyRegistrationProfile;
  const questionnaires = tenant.discoveryQuestionnaires || [];
  const deptSurveys = tenant.departmentSurveys || [];
  const planItems = tenant.implementationPlan || [];

  // Metrics
  const isRegistered = Boolean(regProfile?.organization?.legalName || tenant.name);
  const totalQuestions = questionnaires.reduce((sum, sec) => sum + sec.questions.length, 0);
  const answeredQuestions = questionnaires.reduce(
    (sum, sec) => sum + sec.questions.filter(q => q.status !== 'Unanswered').length,
    0
  );
  const questionnairePct = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;

  const totalDeptSurveys = deptSurveys.length;
  const completedDeptSurveys = deptSurveys.filter(d => d.surveyStatus === 'COMPLETED').length;
  const deptSurveyPct = totalDeptSurveys > 0 ? Math.round((completedDeptSurveys / totalDeptSurveys) * 100) : 0;

  const hasAssets = Boolean(regProfile?.technology?.cloudProviders?.length || regProfile?.technology?.criticalApplications?.length);
  const isScopeLocked = Boolean(tenant.soaBaselineLocked);

  const applicableControls = controls.filter(c => c.applicable);
  const implementedControls = controls.filter(
    c => c.applicable && (c.implementationStatus === 'Implemented' || c.implementationStatus === 'Monitored' || c.implementationStatus === 'Audited')
  );
  const controlImplementationPct = applicableControls.length > 0 ? Math.round((implementedControls.length / applicableControls.length) * 100) : 0;

  const assessedRisks = risks.filter(r => r.tenantId === tenant.id);
  const treatedRisks = assessedRisks.filter(r => r.status === 'Residual Monitored' || r.status === 'Treatment in Progress' || r.status === 'Closed');
  const riskAssessmentPct = assessedRisks.length > 0 ? Math.min(100, Math.round((assessedRisks.length / 5) * 100)) : 0;
  const riskTreatmentPct = assessedRisks.length > 0 ? Math.round((treatedRisks.length / assessedRisks.length) * 100) : 0;

  const verifiedEvidence = evidence.filter(e => e.tenantId === tenant.id && e.status === 'Verified');
  const evidencePct = applicableControls.length > 0 ? Math.min(100, Math.round((verifiedEvidence.length / applicableControls.length) * 100)) : 0;

  const completedAudits = audits.filter(a => a.tenantId === tenant.id && (a.status === 'Fieldwork Completed' || a.status === 'Report Issued' || a.status === 'Closed'));
  const openMajorNCs = findings.filter(f => f.tenantId === tenant.id && f.severity === 'Major Non-Conformity' && f.status !== 'Closed Verified');
  const openMinorNCs = findings.filter(f => f.tenantId === tenant.id && f.severity === 'Minor Non-Conformity' && f.status !== 'Closed Verified');

  const approvedDocs = generatedDocs.filter(d => d.status === 'APPROVED' || d.status === 'PUBLISHED');
  const docPct = generatedDocs.length > 0 ? Math.round((approvedDocs.length / generatedDocs.length) * 100) : (tenant.onboardingPhase >= 4 ? 100 : 0);

  const stages: IsoWorkflowStage[] = ISO_WORKFLOW_STAGES_METADATA.map(meta => {
    let status: IsoWorkflowStage['status'] = 'LOCKED';
    let completionPct = 0;
    const blockers: string[] = [];
    let nextRecommendedAction = '';

    switch (meta.id) {
      case 'company_registration':
        completionPct = isRegistered ? 100 : 25;
        status = isRegistered ? 'COMPLETED' : 'IN_PROGRESS';
        nextRecommendedAction = isRegistered ? 'Organization profile registered' : 'Complete legal entity and corporate details';
        break;

      case 'organization_discovery':
        completionPct = regProfile?.technology ? 100 : (isRegistered ? 50 : 0);
        status = completionPct === 100 ? 'COMPLETED' : isRegistered ? 'IN_PROGRESS' : 'LOCKED';
        if (!isRegistered) blockers.push('Company registration must be completed');
        nextRecommendedAction = completionPct === 100 ? 'Discovery profile active' : 'Complete Business Services & Technology discovery';
        break;

      case 'registration_requirements':
        completionPct = tenant.companyComplianceProfile ? 100 : (regProfile?.technology ? 75 : 0);
        status = completionPct === 100 ? 'COMPLETED' : regProfile?.technology ? 'IN_PROGRESS' : 'LOCKED';
        if (!regProfile?.technology) blockers.push('Organization technology discovery pending');
        nextRecommendedAction = completionPct === 100 ? 'Compliance profile generated' : 'Review compliance requirements & triggered workbenches';
        break;

      case 'discovery_questionnaire':
        completionPct = questionnairePct;
        status = questionnairePct >= 90 ? 'COMPLETED' : questionnairePct > 0 ? 'IN_PROGRESS' : (tenant.companyComplianceProfile ? 'AVAILABLE' : 'LOCKED');
        if (questionnairePct < 90) blockers.push(`${totalQuestions - answeredQuestions} discovery questions pending responses`);
        nextRecommendedAction = questionnairePct >= 90 ? 'Questionnaire completed' : 'Answer remaining discovery questions in Governance & IT';
        break;

      case 'department_survey':
        completionPct = deptSurveyPct;
        status = deptSurveyPct === 100 ? 'COMPLETED' : deptSurveyPct > 0 ? 'IN_PROGRESS' : (questionnairePct >= 50 ? 'AVAILABLE' : 'LOCKED');
        if (deptSurveyPct < 100) blockers.push(`${totalDeptSurveys - completedDeptSurveys} departments have not completed domain survey`);
        nextRecommendedAction = deptSurveyPct === 100 ? 'All department surveys signed off' : 'Complete HR and IT department surveys';
        break;

      case 'tech_asset_discovery':
        completionPct = hasAssets ? 100 : 40;
        status = hasAssets ? 'COMPLETED' : (deptSurveyPct >= 50 ? 'AVAILABLE' : 'LOCKED');
        nextRecommendedAction = hasAssets ? 'Asset inventory mapped' : 'Import infrastructure, cloud repositories, and endpoints';
        break;

      case 'regulatory_contractual':
        completionPct = tenant.businessScope?.interestedParties?.length ? 100 : 30;
        status = completionPct === 100 ? 'COMPLETED' : (hasAssets ? 'AVAILABLE' : 'LOCKED');
        nextRecommendedAction = completionPct === 100 ? 'Clause 4.2 register completed' : 'Document statutory regulations and client DPA requirements';
        break;

      case 'isms_scope':
        completionPct = isScopeLocked ? 100 : 50;
        status = isScopeLocked ? 'COMPLETED' : (completionPct > 0 ? 'IN_PROGRESS' : 'LOCKED');
        if (!isScopeLocked) blockers.push('Scope boundary statement and SoA baseline not cryptographically locked');
        nextRecommendedAction = isScopeLocked ? 'Scope & SoA baseline locked' : 'Finalize Clause 4.3 boundaries and lock SoA baseline';
        break;

      case 'gap_assessment':
        completionPct = tenant.onboardingPhase >= 3 ? 100 : 45;
        status = completionPct === 100 ? 'COMPLETED' : (isScopeLocked ? 'AVAILABLE' : 'LOCKED');
        nextRecommendedAction = completionPct === 100 ? 'Baseline gap analysis completed' : 'Perform baseline evaluation against 93 Annex A controls';
        break;

      case 'implementation_plan':
        completionPct = planItems.length > 0 ? Math.round((planItems.filter(p => p.status === 'COMPLETED').length / planItems.length) * 100) : (tenant.onboardingPhase >= 4 ? 75 : 30);
        status = completionPct >= 80 ? 'COMPLETED' : (completionPct > 0 ? 'IN_PROGRESS' : 'LOCKED');
        nextRecommendedAction = completionPct >= 80 ? 'Milestones on schedule' : 'Assign owners and target dates to implementation tasks';
        break;

      case 'risk_assessment':
        completionPct = riskAssessmentPct;
        status = riskAssessmentPct >= 80 ? 'COMPLETED' : riskAssessmentPct > 0 ? 'IN_PROGRESS' : (isScopeLocked ? 'AVAILABLE' : 'LOCKED');
        if (assessedRisks.length < 5) blockers.push('Minimum 5 core risks must be assessed across discovered assets');
        nextRecommendedAction = riskAssessmentPct >= 80 ? 'Risk register evaluated' : 'Assess likelihood and impact for key information assets';
        break;

      case 'risk_treatment':
        completionPct = riskTreatmentPct;
        status = riskTreatmentPct >= 80 ? 'COMPLETED' : riskTreatmentPct > 0 ? 'IN_PROGRESS' : (riskAssessmentPct >= 80 ? 'AVAILABLE' : 'LOCKED');
        if (riskTreatmentPct < 80) blockers.push('Unmitigated high risks lack treatment plan or executive sign-off');
        nextRecommendedAction = riskTreatmentPct >= 80 ? 'Risk treatments active' : 'Define mitigation controls and assign treatment owners';
        break;

      case 'soa':
        completionPct = isScopeLocked && applicableControls.length > 0 ? 100 : 60;
        status = completionPct === 100 ? 'COMPLETED' : (riskTreatmentPct > 0 ? 'AVAILABLE' : 'LOCKED');
        nextRecommendedAction = completionPct === 100 ? 'SoA approved and locked' : 'Provide mandatory justifications for all excluded controls';
        break;

      case 'policies_procedures':
        completionPct = docPct;
        status = docPct >= 90 ? 'COMPLETED' : docPct > 0 ? 'IN_PROGRESS' : (completionPct > 0 ? 'AVAILABLE' : 'LOCKED');
        nextRecommendedAction = docPct >= 90 ? 'Core policies published' : 'Review and ratify generated ISMS policies (Information Security, Access, BCP)';
        break;

      case 'control_implementation':
        completionPct = controlImplementationPct;
        status = controlImplementationPct >= 75 ? 'COMPLETED' : controlImplementationPct > 0 ? 'IN_PROGRESS' : 'LOCKED';
        if (controlImplementationPct < 75) blockers.push(`${applicableControls.length - implementedControls.length} controls pending implementation`);
        nextRecommendedAction = controlImplementationPct >= 75 ? 'Technical controls in place' : 'Implement operational controls in Technological and Organizational themes';
        break;

      case 'evidence':
        completionPct = evidencePct;
        status = evidencePct >= 60 ? 'COMPLETED' : evidencePct > 0 ? 'IN_PROGRESS' : 'LOCKED';
        if (evidencePct < 60) blockers.push('Evidence required for high-risk controls before audit readiness');
        nextRecommendedAction = evidencePct >= 60 ? 'Evidence repository populated' : 'Upload verification artifacts and complete four-eyes review';
        break;

      case 'awareness':
        completionPct = tenant.mou?.executed ? 100 : 50;
        status = completionPct === 100 ? 'COMPLETED' : (docPct > 0 ? 'AVAILABLE' : 'LOCKED');
        nextRecommendedAction = completionPct === 100 ? 'Security awareness completed' : 'Roll out annual ISO 27001 awareness and policy acknowledgement';
        break;

      case 'monitoring':
        completionPct = controlImplementationPct >= 50 ? 80 : 30;
        status = completionPct >= 80 ? 'COMPLETED' : 'IN_PROGRESS';
        nextRecommendedAction = completionPct >= 80 ? 'Telemetry and logging operational' : 'Configure continuous monitoring and security log review';
        break;

      case 'internal_audit':
        completionPct = completedAudits.length > 0 ? 100 : (audits.length > 0 ? 50 : 0);
        status = completionPct === 100 ? 'COMPLETED' : audits.length > 0 ? 'IN_PROGRESS' : (evidencePct >= 50 ? 'AVAILABLE' : 'LOCKED');
        if (completedAudits.length === 0) blockers.push('ISO Clause 9.2 Internal Audit has not been completed');
        nextRecommendedAction = completionPct === 100 ? 'Internal audit report issued' : 'Schedule and conduct internal audit across in-scope clauses';
        break;

      case 'management_review':
        completionPct = completedAudits.length > 0 ? 80 : 0;
        status = completionPct >= 80 ? 'COMPLETED' : (completedAudits.length > 0 ? 'AVAILABLE' : 'LOCKED');
        if (completedAudits.length === 0) blockers.push('Management Review requires completed Internal Audit inputs (Clause 9.3)');
        nextRecommendedAction = completionPct >= 80 ? 'Management review minutes recorded' : 'Convene senior leadership meeting to review ISMS performance';
        break;

      case 'capa':
        completionPct = openMajorNCs.length === 0 ? (openMinorNCs.length === 0 ? 100 : 75) : 30;
        status = completionPct === 100 ? 'COMPLETED' : (completedAudits.length > 0 ? 'IN_PROGRESS' : 'LOCKED');
        if (openMajorNCs.length > 0) blockers.push(`${openMajorNCs.length} Major Non-Conformities require root cause (5 Whys) and closure`);
        nextRecommendedAction = openMajorNCs.length > 0 ? 'Remediate and close open Major Non-Conformities' : 'Verify CAPA effectiveness with independent re-test';
        break;

      case 'cert_readiness':
        completionPct = (completedAudits.length > 0 && openMajorNCs.length === 0 && controlImplementationPct >= 80) ? 90 : 35;
        status = completionPct >= 90 ? 'COMPLETED' : (completedAudits.length > 0 ? 'AVAILABLE' : 'LOCKED');
        if (completedAudits.length === 0 || openMajorNCs.length > 0) blockers.push('Cannot proceed to Certification without clean Internal Audit and closed Major NCs');
        nextRecommendedAction = completionPct >= 90 ? 'Ready for Stage 1 audit' : 'Review Stage 1 checklist and confirm readiness gate criteria';
        break;

      case 'certification':
        completionPct = tenant.mou?.executed && controlImplementationPct >= 80 ? 100 : 20;
        status = completionPct === 100 ? 'COMPLETED' : (completionPct > 50 ? 'IN_PROGRESS' : 'LOCKED');
        nextRecommendedAction = completionPct === 100 ? 'Accredited certificate active' : 'Coordinate fieldwork with accredited Certification Body';
        break;

      case 'continual_monitoring':
        completionPct = tenant.mou?.executed ? 100 : 0;
        status = completionPct === 100 ? 'COMPLETED' : 'LOCKED';
        nextRecommendedAction = 'Surveillance radar active: tracking evidence expiry, risk delta, and control reviews';
        break;
    }

    const stageDescriptions: Record<string, { description: string; deliverables: string[]; isoClauses: string[] }> = {
      company_registration: {
        description: 'Register the legal entity, registered address, operational footprint, and baseline organizational parameters.',
        deliverables: ['Company Registration Profile', 'Operational Footprint Schema'],
        isoClauses: ['Clause 4.1', 'Clause 4.2']
      },
      organization_discovery: {
        description: 'Comprehensive discovery of business services, critical technology stacks, sensitive data types, and third-party vendors.',
        deliverables: ['Company Compliance Profile', 'System Architecture Diagram'],
        isoClauses: ['Clause 4.1', 'Clause 4.3']
      },
      registration_requirements: {
        description: 'Synthesize organizational discovery into a structured requirement baseline and governance matrix.',
        deliverables: ['ISMS Requirements Matrix', 'Governance Allocation Map'],
        isoClauses: ['Clause 4.2', 'Clause 5.3']
      },
      discovery_questionnaire: {
        description: 'Execute deep-dive multi-domain discovery across Context, Leadership, Planning, and Operations.',
        deliverables: ['Completed Discovery Questionnaires', 'Domain Baseline Scores'],
        isoClauses: ['Clause 4', 'Clause 5', 'Clause 6']
      },
      department_survey: {
        description: 'Distribute structured Annex A security questionnaires to departmental leads (IT, HR, Engineering, Legal).',
        deliverables: ['Departmental Survey Responses', 'Cross-Functional Control Gap Insights'],
        isoClauses: ['Clause 7.2', 'Clause 7.3', 'Annex A.5']
      },
      tech_asset_discovery: {
        description: 'Inventory and classify critical information assets, cloud databases, endpoints, and server infrastructure.',
        deliverables: ['Information Asset Register', 'Asset Classification Matrix'],
        isoClauses: ['Annex A.5.9', 'Annex A.5.10']
      },
      regulatory_contractual: {
        description: 'Document and track interested parties, regulatory requirements, privacy laws, and contractual obligations.',
        deliverables: ['Stakeholder Requirements Register', 'Legal & Regulatory Compliance Inventory'],
        isoClauses: ['Clause 4.2', 'Annex A.5.31', 'Annex A.5.34']
      },
      isms_scope: {
        description: 'Formally define the boundaries, physical and logical locations, interfaces, and exclusions of the ISMS.',
        deliverables: ['ISMS Scope Statement Document', 'Boundaries & Exclusions Register'],
        isoClauses: ['Clause 4.3', 'Clause 4.4']
      },
      gap_assessment: {
        description: 'Benchmark existing organizational controls against ISO/IEC 27001:2022 clauses and 93 Annex A controls.',
        deliverables: ['Comprehensive Gap Analysis Report', 'Readiness Scorecard'],
        isoClauses: ['Clause 4 to 10', 'Annex A.5 to A.8']
      },
      implementation_plan: {
        description: 'Generate calibrated work packages, task owners, target completion milestones, and resource assignments.',
        deliverables: ['ISMS Implementation Master Plan', 'Resource Allocation Schedule'],
        isoClauses: ['Clause 6.2']
      },
      risk_assessment: {
        description: 'Conduct threat, vulnerability, likelihood, and impact risk assessments on prioritized assets.',
        deliverables: ['Information Security Risk Assessment Register', 'Threat & Vulnerability Scoring'],
        isoClauses: ['Clause 6.1.2', 'Clause 8.2']
      },
      risk_treatment: {
        description: 'Formulate Risk Treatment Plans (RTP) with selected controls, treatment strategies, and residual risk approvals.',
        deliverables: ['Risk Treatment Plan (RTP)', 'Residual Risk Acceptance Records'],
        isoClauses: ['Clause 6.1.3', 'Clause 8.3']
      },
      soa: {
        description: 'Evaluate applicability for all 93 Annex A controls with detailed inclusion/exclusion justifications.',
        deliverables: ['Statement of Applicability (SoA) Document', 'Control Justification Matrix'],
        isoClauses: ['Clause 6.1.3 d)']
      },
      policies_procedures: {
        description: 'Author, review, approve, and publish mandatory ISMS policies, standards, and standard operating procedures.',
        deliverables: ['Information Security Policy Set', 'Standard Operating Procedures (SOPs)'],
        isoClauses: ['Clause 5.2', 'Clause 7.5', 'Annex A.5.1']
      },
      control_implementation: {
        description: 'Implement technical, organizational, physical, and people controls across operational systems.',
        deliverables: ['Technical Control Configurations', 'Operational Verification Artifacts'],
        isoClauses: ['Clause 8.1', 'Annex A.5 to A.8']
      },
      evidence: {
        description: 'Collect, validate, verify, and cross-reference cryptographically tracked audit evidence.',
        deliverables: ['Centralized Evidence Repository', 'Control Evidence Mappings'],
        isoClauses: ['Clause 7.5.3', 'Clause 9.1']
      },
      awareness: {
        description: 'Deliver security awareness training, phishing simulations, and competence verification.',
        deliverables: ['Security Training Records', 'Competence Assessment Logs'],
        isoClauses: ['Clause 7.2', 'Clause 7.3', 'Annex A.6.3']
      },
      monitoring: {
        description: 'Establish telemetry, security logging, SIEM alerts, and key performance indicators (KPIs).',
        deliverables: ['Security Monitoring Metrics', 'Telemetry Dashboard Reports'],
        isoClauses: ['Clause 9.1', 'Annex A.8.15', 'Annex A.8.16']
      },
      internal_audit: {
        description: 'Conduct formal independent internal audits covering all clauses, controls, and operational processes.',
        deliverables: ['Internal Audit Plan & Schedule', 'Internal Audit Final Report'],
        isoClauses: ['Clause 9.2']
      },
      management_review: {
        description: 'Convene executive management review meeting with agenda, audit results, risk status, and decisions.',
        deliverables: ['Management Review Meeting Minutes', 'Executive Decisions & Resource Action Items'],
        isoClauses: ['Clause 9.3']
      },
      capa: {
        description: 'Perform 5-Whys root cause analysis and track Corrective and Preventive Actions (CAPA) to verified closure.',
        deliverables: ['CAPA Remediation Register', 'Root Cause Analysis Records'],
        isoClauses: ['Clause 10.1', 'Clause 10.2']
      },
      cert_readiness: {
        description: 'Stage-gate audit readiness verification, documentation completeness check, and mock audit review.',
        deliverables: ['Certification Readiness Report', 'Executive Sign-Off Charter'],
        isoClauses: ['Clause 4 to 10']
      },
      certification: {
        description: 'Undergo Stage 1 (Documentation Review) and Stage 2 (Implementation Audit) with accredited Certification Body.',
        deliverables: ['Stage 1 & Stage 2 Audit Reports', 'ISO/IEC 27001:2022 Certificate of Registration'],
        isoClauses: ['Accredited Certification']
      },
      continual_monitoring: {
        description: 'Continuous compliance tracking, quarterly surveillance prep, annual risk reassessments, and ongoing improvement.',
        deliverables: ['Surveillance Audit Schedules', 'Continual Improvement Log'],
        isoClauses: ['Clause 10.2']
      }
    };

    const details = stageDescriptions[meta.id] || {
      description: `${meta.name} execution and governance verification.`,
      deliverables: ['Operational Evidence', 'Approved Documentation'],
      isoClauses: ['Clause 4 to 10']
    };

    return {
      stageNumber: meta.stageNumber,
      id: meta.id,
      name: meta.name,
      category: meta.category,
      status,
      completionPct,
      blockers,
      owner: meta.defaultOwner,
      nextRecommendedAction,
      targetModuleId: meta.targetModuleId,
      requiredEvidenceCount: applicableControls.length,
      completedEvidenceCount: verifiedEvidence.length,
      prerequisiteStageIds: meta.prerequisiteStageIds,
      description: details.description,
      deliverables: details.deliverables,
      isoClauses: details.isoClauses
    };
  });

  return stages;
}

/**
 * Returns dynamic next recommended action derived from actual workflow state
 */
export function getDynamicNextAction(
  tenant: Tenant | null,
  risks: RiskRecord[],
  controls: ControlItem[],
  evidence: EvidenceRecord[],
  audits: InternalAuditPlan[],
  findings: FindingCAPARecord[],
  generatedDocs: GeneratedDocument[]
): NextActionRecommendation {
  if (!tenant) {
    return {
      title: 'Initialize Organization Registration',
      owner: 'Company Admin / CISO',
      status: 'Action Required',
      requiredBefore: 'Organization Discovery & Compliance Profiling',
      targetModuleId: 'onboarding_survey',
      blockers: ['No active tenant profile initialized'],
      stageNumber: 1,
      stageName: 'Company Registration',
      priority: 'CRITICAL',
      description: 'Register the corporate legal entity, operational size, and industry profile to initiate ISO 27001 implementation.'
    };
  }

  const stages = calculateWorkflowStages(tenant, risks, controls, evidence, audits, findings, generatedDocs);

  // Find the first stage that is IN_PROGRESS or AVAILABLE or has critical blockers
  const activeStage = stages.find(s => s.status === 'IN_PROGRESS' || s.status === 'AVAILABLE') || stages[0];

  // Specific high-priority overrides based on actual compliance gaps
  const openMajorNC = findings.find(f => f.tenantId === tenant.id && f.severity === 'Major Non-Conformity' && f.status !== 'Closed Verified');
  if (openMajorNC) {
    return {
      title: `Resolve Major Non-Conformity: ${openMajorNC.findingCode}`,
      owner: openMajorNC.capaPlan?.owner || 'Assigned Owner',
      status: 'Action Required',
      requiredBefore: 'Certification Readiness Gate & Audit Sign-Off',
      targetModuleId: 'findings_capa',
      blockers: [`Major Non-Conformity ${openMajorNC.findingCode} must have 5-Whys root cause analysis and validated closure.`],
      stageNumber: 21,
      stageName: 'Corrective Action (CAPA)',
      priority: 'CRITICAL',
      description: openMajorNC.title
    };
  }

  if (activeStage.id === 'discovery_questionnaire') {
    return {
      title: 'Complete Discovery Questionnaire (Governance & IT)',
      owner: 'ISMS Lead / IT Security Officer',
      status: 'In Progress',
      requiredBefore: 'Department Survey + Risk Assessment',
      targetModuleId: 'discovery_questionnaire',
      blockers: activeStage.blockers,
      stageNumber: 4,
      stageName: 'Discovery Questionnaire',
      priority: 'HIGH',
      description: 'Answer required discovery questions across Governance, IT, and Cybersecurity to calibrate the ISMS implementation scope.'
    };
  }

  if (activeStage.id === 'tech_asset_discovery') {
    return {
      title: 'Complete IT Infrastructure Discovery',
      owner: 'IT Head',
      status: 'Pending',
      requiredBefore: 'Asset Register + Risk Assessment',
      targetModuleId: 'assets',
      blockers: activeStage.blockers,
      stageNumber: 6,
      stageName: 'Technology & Asset Discovery',
      priority: 'HIGH',
      description: 'Document cloud providers, servers, databases, endpoints, and critical applications in the asset inventory.'
    };
  }

  if (activeStage.id === 'risk_assessment') {
    return {
      title: 'Conduct Asset & Information Security Risk Assessment',
      owner: 'Risk Manager',
      status: 'Pending',
      requiredBefore: 'Risk Treatment Plan + Statement of Applicability',
      targetModuleId: 'risk_assessment',
      blockers: activeStage.blockers,
      stageNumber: 11,
      stageName: 'Risk Assessment',
      priority: 'HIGH',
      description: 'Evaluate threats and vulnerabilities for all identified information assets to determine inherent risk scores.'
    };
  }

  if (activeStage.id === 'soa') {
    return {
      title: 'Lock Statement of Applicability Baseline',
      owner: 'ISMS Lead Architect',
      status: 'In Progress',
      requiredBefore: 'Policy Generation & Control Implementation',
      targetModuleId: 'statement_of_applicability',
      blockers: activeStage.blockers,
      stageNumber: 13,
      stageName: 'Statement of Applicability (SoA)',
      priority: 'HIGH',
      description: 'Verify applicability of all 93 Annex A controls and provide mandatory justifications for any exclusions.'
    };
  }

  if (activeStage.id === 'internal_audit') {
    return {
      title: 'Schedule & Execute Clause 9.2 Internal Audit',
      owner: 'Lead Internal Auditor',
      status: 'Action Required',
      requiredBefore: 'Management Review + Certification Readiness',
      targetModuleId: 'internal_audit',
      blockers: activeStage.blockers,
      stageNumber: 19,
      stageName: 'Internal Audit',
      priority: 'CRITICAL',
      description: 'Audit policies, procedures, and Annex A controls across in-scope departments to generate objective compliance findings.'
    };
  }

  return {
    title: activeStage.nextRecommendedAction || `Advance ${activeStage.name}`,
    owner: activeStage.owner,
    status: activeStage.status === 'IN_PROGRESS' ? 'In Progress' : 'Action Required',
    requiredBefore: `Stage ${activeStage.stageNumber + 1}`,
    targetModuleId: activeStage.targetModuleId,
    blockers: activeStage.blockers,
    stageNumber: activeStage.stageNumber,
    stageName: activeStage.name,
    priority: activeStage.blockers.length > 0 ? 'HIGH' : 'MEDIUM',
    description: `Complete required deliverables for ${activeStage.name} to maintain scheduled certification velocity.`
  };
}

/**
 * Requirement Engine: Analyzes registration data and generates tailored Company Compliance Profile
 */
export function generateCompanyComplianceProfile(
  tenantId: string,
  regData: CompanyRegistrationProfile
): CompanyComplianceProfile {
  const areas: ApplicableImplementationArea[] = [];
  const workbenches: string[] = ['iso27001_workbench', 'statement_of_applicability', 'org_scope', 'policies'];

  const isCloudUsed = (regData.technology.cloudProviders?.length || 0) > 0;
  const isPersonalDataHandled = Boolean(regData.data.personalData || regData.data.customerData);
  const isMultiLocation = (regData.organization.locations?.length || 1) > 1;
  const isLargeHeadcount = regData.organization.employeeCount > 100;
  const usesThirdParties = (regData.thirdParties.vendorsCount || 0) > 0 || (regData.thirdParties.cloudProviders?.length || 0) > 0;
  const developsSoftware = (regData.technology.criticalApplications?.length || 0) > 0 || Boolean(regData.data.sourceCode);

  if (isCloudUsed) {
    areas.push({
      areaId: 'area_cloud_sec',
      name: 'Cloud Security & Virtual Infrastructure Governance',
      rationale: `Selected cloud providers: ${regData.technology.cloudProviders.join(', ')}. Requires technical controls for cloud service configuration, segregation, and identity management.`,
      mandatoryAnnexAControls: ['A.5.23', 'A.8.10', 'A.8.11', 'A.8.20', 'A.8.22', 'A.8.24'],
      mandatoryClauses: ['Clause 8.1'],
      triggeredBy: 'Cloud Providers',
      priority: 'CRITICAL'
    });
    workbenches.push('assets', 'risk_assessment');
  }

  if (isPersonalDataHandled) {
    areas.push({
      areaId: 'area_privacy_pims',
      name: 'Data Privacy & Personal Data Safeguards (ISO 27701 / DPDP / GDPR)',
      rationale: 'Organization processes customer or employee personal data. Mandatory data classification, masking, and privacy by design required.',
      mandatoryAnnexAControls: ['A.5.34', 'A.8.11', 'A.8.12', 'A.8.24'],
      mandatoryClauses: ['Clause 4.2', 'Clause 7.5'],
      triggeredBy: 'Personal / Customer Data',
      priority: 'CRITICAL'
    });
    workbenches.push('data_information', 'iso27701_soa');
  }

  if (isMultiLocation) {
    areas.push({
      areaId: 'area_physical_sec',
      name: 'Physical Security & Multi-Location Perimeter Protection',
      rationale: `Operating across ${regData.organization.locations.length} locations. Requires physical entry controls, secure areas, and clear desk/screen standards.`,
      mandatoryAnnexAControls: ['A.7.1', 'A.7.2', 'A.7.3', 'A.7.4', 'A.7.7', 'A.7.8', 'A.7.14'],
      mandatoryClauses: ['Clause 4.3'],
      triggeredBy: 'Multiple Locations',
      priority: 'HIGH'
    });
  }

  if (isLargeHeadcount) {
    areas.push({
      areaId: 'area_hr_sec',
      name: 'Enhanced Human Resource Security & Security Culture',
      rationale: `Staff count of ${regData.organization.employeeCount} personnel. Requires formal background verification, onboarding/offboarding workflows, and mandatory awareness training.`,
      mandatoryAnnexAControls: ['A.6.1', 'A.6.2', 'A.6.3', 'A.6.4', 'A.6.5', 'A.6.6', 'A.6.7', 'A.6.8'],
      mandatoryClauses: ['Clause 7.2', 'Clause 7.3'],
      triggeredBy: 'Large Employee Population (>100)',
      priority: 'HIGH'
    });
    workbenches.push('departments', 'standards_academy');
  }

  if (usesThirdParties) {
    areas.push({
      areaId: 'area_supplier_sec',
      name: 'Supplier Relationship Security & Third-Party Risk Management',
      rationale: `Organization engages with ${regData.thirdParties.vendorsCount || 'external'} vendors and managed service providers. Requires security in supplier contracts and periodic compliance reviews.`,
      mandatoryAnnexAControls: ['A.5.19', 'A.5.20', 'A.5.21', 'A.5.22', 'A.8.30'],
      mandatoryClauses: ['Clause 8.1'],
      triggeredBy: 'Third-Party Vendors / MSPs',
      priority: 'HIGH'
    });
    workbenches.push('vendors');
  }

  if (developsSoftware) {
    areas.push({
      areaId: 'area_secure_dev',
      name: 'Secure Development Lifecycle & DevOps Governance',
      rationale: 'Organization develops proprietary software or operates critical applications. Requires secure coding standards, automated vulnerability scanning, and environment separation.',
      mandatoryAnnexAControls: ['A.8.25', 'A.8.26', 'A.8.27', 'A.8.28', 'A.8.29', 'A.8.31', 'A.8.32', 'A.8.34'],
      mandatoryClauses: ['Clause 8.1'],
      triggeredBy: 'Source Code & Critical Applications',
      priority: 'HIGH'
    });
  }

  return {
    profileId: `prof_${Date.now()}`,
    tenantId,
    generatedAt: new Date().toISOString(),
    industry: regData.organization.industry,
    employeeCount: regData.organization.employeeCount,
    locationsCount: regData.organization.locations.length || 1,
    primaryCloud: regData.technology.cloudProviders[0] || 'Private Cloud / On-Premise',
    handlesPersonalData: isPersonalDataHandled,
    handlesCustomerData: Boolean(regData.data.customerData),
    usesThirdParties,
    existingIsoCertified: Boolean(regData.existingCompliance.frameworks?.includes('ISO 27001')),
    applicableImplementationAreas: areas,
    triggeredWorkbenches: Array.from(new Set(workbenches)),
    physicalSecurityRequired: isMultiLocation,
    privacyPimsRequired: isPersonalDataHandled,
    cloudSecurityRequired: isCloudUsed,
    devSecOpsRequired: developsSoftware,
    supplierSecurityRequired: usesThirdParties,
    enhancedHrRequired: isLargeHeadcount,
    summaryExecutiveNarrative: `Tailored ISO 27001:2022 implementation profile calibrated for a ${regData.organization.businessType || 'technology'} enterprise with ${regData.organization.employeeCount} employees across ${regData.organization.locations.length || 1} locations. Automatically activated ${areas.length} specialized governance areas with ${workbenches.length} tailored control workbenches.`
  };
}

/**
 * Generates the 14-Section Comprehensive Discovery Questionnaire
 */
export function generateDefaultDiscoveryQuestionnaires(): DiscoveryQuestionnaireSection[] {
  return [
    {
      sectionKey: 'governance',
      title: 'ISMS Governance & Leadership',
      description: 'Management commitment, security leadership, role assignments, and steering committee cadence.',
      iconName: 'Building',
      questions: [
        {
          id: 'q_gov_1',
          sectionKey: 'governance',
          question: 'Has executive management formally designated an Information Security Officer or CISO?',
          guidance: 'ISO/IEC 27001:2022 Clause 5.3 requires defined roles and responsibilities for information security.',
          isoClauseMapping: 'Clause 5.3',
          annexAControlMapping: 'A.5.2',
          responseType: 'choice',
          status: 'Yes',
          textResponse: 'CISO formally appointed with direct reporting line to CEO.',
          evidenceFileName: 'CISO_Appointment_Charter.pdf'
        },
        {
          id: 'q_gov_2',
          sectionKey: 'governance',
          question: 'Does the organization maintain an Information Security Policy approved by executive leadership?',
          guidance: 'ISO/IEC 27001:2022 Clause 5.2 requires a top-level security policy aligned with business objectives.',
          isoClauseMapping: 'Clause 5.2',
          annexAControlMapping: 'A.5.1',
          responseType: 'choice',
          status: 'Partially',
          textResponse: 'Draft policy exists; awaiting formal board approval in next quarterly cycle.'
        },
        {
          id: 'q_gov_3',
          sectionKey: 'governance',
          question: 'Is there a scheduled Information Security Steering Committee meeting cadence?',
          guidance: 'Regular reviews ensure ongoing suitability, adequacy, and effectiveness of the ISMS (Clause 9.3).',
          isoClauseMapping: 'Clause 9.3',
          annexAControlMapping: 'A.5.4',
          responseType: 'choice',
          status: 'Yes',
          textResponse: 'Monthly ISMS review meetings held on the third Thursday of each month.'
        }
      ]
    },
    {
      sectionKey: 'hr',
      title: 'Human Resource Security',
      description: 'Screening, employment terms, NDA execution, onboarding, and disciplinary processes.',
      iconName: 'Users',
      questions: [
        {
          id: 'q_hr_1',
          sectionKey: 'hr',
          question: 'Are background verification checks conducted for all candidates prior to formal onboarding?',
          guidance: 'Control A.6.1 requires proportional background verification checks on all candidates.',
          isoClauseMapping: 'Clause 7.2',
          annexAControlMapping: 'A.6.1',
          responseType: 'choice',
          status: 'Yes',
          textResponse: 'Third-party background checks executed for 100% of employees.'
        },
        {
          id: 'q_hr_2',
          sectionKey: 'hr',
          question: 'Do all employees and contractors execute formal Non-Disclosure Agreements (NDAs)?',
          guidance: 'Control A.6.6 requires confidentiality or non-disclosure agreements reflecting organizational security needs.',
          isoClauseMapping: 'Clause 7.2',
          annexAControlMapping: 'A.6.6',
          responseType: 'choice',
          status: 'Yes',
          textResponse: 'Executed digitally via DocuSign as part of day-one onboarding package.'
        },
        {
          id: 'q_hr_3',
          sectionKey: 'hr',
          question: 'Is access immediately revoked upon employee termination or role change?',
          guidance: 'Control A.6.5 requires systematic return of assets and revocation of all access rights.',
          isoClauseMapping: 'Clause 7.2',
          annexAControlMapping: 'A.6.5',
          responseType: 'choice',
          status: 'Partially',
          textResponse: 'IdP SSO access revoked instantly; manual SaaS account audit takes up to 24 hours.'
        }
      ]
    },
    {
      sectionKey: 'it',
      title: 'IT Infrastructure & Identity Governance',
      description: 'IAM, password standards, MFA enforcement, device encryption, and endpoint security.',
      iconName: 'Server',
      questions: [
        {
          id: 'q_it_1',
          sectionKey: 'it',
          question: 'Is Multi-Factor Authentication (MFA) strictly enforced across all corporate systems?',
          guidance: 'Control A.8.5 requires secure authentication technologies such as MFA for privileged and user access.',
          isoClauseMapping: 'Clause 8.1',
          annexAControlMapping: 'A.8.5',
          responseType: 'choice',
          status: 'Yes',
          textResponse: 'FIDO2 / WebAuthn and Okta Verify enforced for 100% of internal accounts.'
        },
        {
          id: 'q_it_2',
          sectionKey: 'it',
          question: 'Are all corporate endpoints encrypted at rest (FileVault / BitLocker)?',
          guidance: 'Control A.8.1 requires user endpoint device security including full-disk encryption.',
          isoClauseMapping: 'Clause 8.1',
          annexAControlMapping: 'A.8.1',
          responseType: 'choice',
          status: 'Yes',
          textResponse: 'MDM enforces FileVault (macOS) and BitLocker (Windows) before allowing network access.'
        },
        {
          id: 'q_it_3',
          sectionKey: 'it',
          question: 'Are regular system backups executed and tested for restoration viability?',
          guidance: 'Control A.8.13 requires backup copies of information and testing of restoration procedures.',
          isoClauseMapping: 'Clause 8.1',
          annexAControlMapping: 'A.8.13',
          responseType: 'choice',
          status: 'Partially',
          textResponse: 'Automated daily snapshots active; restoration drill conducted bi-annually.'
        }
      ]
    },
    {
      sectionKey: 'cybersecurity',
      title: 'Cybersecurity & Threat Management',
      description: 'Vulnerability scanning, penetration testing, endpoint detection (EDR), and incident response.',
      iconName: 'Shield',
      questions: [
        {
          id: 'q_cyb_1',
          sectionKey: 'cybersecurity',
          question: 'Are automated vulnerability scans executed on infrastructure and container images?',
          guidance: 'Control A.8.8 requires management of technical vulnerabilities.',
          isoClauseMapping: 'Clause 8.1',
          annexAControlMapping: 'A.8.8',
          responseType: 'choice',
          status: 'Yes',
          textResponse: 'Tenable and Snyk run weekly automated vulnerability assessments.'
        },
        {
          id: 'q_cyb_2',
          sectionKey: 'cybersecurity',
          question: 'Does the organization maintain a tested 24/7 Security Incident Response Plan?',
          guidance: 'Control A.5.24 - A.5.28 require comprehensive incident management planning and reporting.',
          isoClauseMapping: 'Clause 8.1',
          annexAControlMapping: 'A.5.24',
          responseType: 'choice',
          status: 'Yes',
          textResponse: 'Formal Incident Response Policy with P1 escalation SLA under 15 minutes.'
        }
      ]
    },
    {
      sectionKey: 'cloud',
      title: 'Cloud Security & Virtual Architecture',
      description: 'Cloud configuration, IAM least privilege, container isolation, and public access blocks.',
      iconName: 'Cloud',
      questions: [
        {
          id: 'q_cld_1',
          sectionKey: 'cloud',
          question: 'Are public access blocks strictly enforced on all cloud object storage buckets (S3 / Blob)?',
          guidance: 'Control A.5.23 & A.8.24 requires cloud service security and secure configuration.',
          isoClauseMapping: 'Clause 8.1',
          annexAControlMapping: 'A.5.23',
          responseType: 'choice',
          status: 'Yes',
          textResponse: 'AWS Organization SCP and Azure Policy prevent public bucket creation.'
        },
        {
          id: 'q_cld_2',
          sectionKey: 'cloud',
          question: 'Are cryptographic keys rotated and managed via Hardware Security Modules or Cloud KMS?',
          guidance: 'Control A.8.24 requires proper key management throughout their lifecycle.',
          isoClauseMapping: 'Clause 8.1',
          annexAControlMapping: 'A.8.24',
          responseType: 'choice',
          status: 'Yes',
          textResponse: 'KMS managed keys with annual automatic rotation.'
        }
      ]
    },
    {
      sectionKey: 'facilities',
      title: 'Physical & Environmental Security',
      description: 'Access badges, CCTV surveillance, visitor logs, clean desk, and equipment disposal.',
      iconName: 'Building',
      questions: [
        {
          id: 'q_fac_1',
          sectionKey: 'facilities',
          question: 'Are physical security perimeters and electronic keycard badges in place for corporate facilities?',
          guidance: 'Control A.7.1 - A.7.2 require physical security perimeters and physical entry controls.',
          isoClauseMapping: 'Clause 8.1',
          annexAControlMapping: 'A.7.1',
          responseType: 'choice',
          status: 'Yes',
          textResponse: 'RFID badges with audit logging at all facility entryways.'
        },
        {
          id: 'q_fac_2',
          sectionKey: 'facilities',
          question: 'Is a Clean Desk and Clean Screen policy enforced across work locations?',
          guidance: 'Control A.7.7 requires clear desk and clear screen policies to prevent unauthorized observation.',
          isoClauseMapping: 'Clause 8.1',
          annexAControlMapping: 'A.7.7',
          responseType: 'choice',
          status: 'Partially',
          textResponse: 'Policy exists and enforced during evening office floor sweeps.'
        }
      ]
    },
    {
      sectionKey: 'data_privacy',
      title: 'Data Privacy & PII Governance',
      description: 'Records of processing, privacy notices, consent tracking, data retention, and cross-border transfers.',
      iconName: 'Lock',
      questions: [
        {
          id: 'q_prv_1',
          sectionKey: 'data_privacy',
          question: 'Does the organization maintain an up-to-date Record of Processing Activities (RoPA)?',
          guidance: 'Control A.5.34 requires privacy and protection of personally identifiable information (PII).',
          isoClauseMapping: 'Clause 4.2',
          annexAControlMapping: 'A.5.34',
          responseType: 'choice',
          status: 'Yes',
          textResponse: 'RoPA maintained in Skanda Data Inventory module.'
        },
        {
          id: 'q_prv_2',
          sectionKey: 'data_privacy',
          question: 'Are data retention periods defined and automated deletion/purge mechanisms operational?',
          guidance: 'Control A.8.10 requires information deletion when no longer required.',
          isoClauseMapping: 'Clause 8.1',
          annexAControlMapping: 'A.8.10',
          responseType: 'choice',
          status: 'Partially',
          textResponse: 'Retention schedule documented; automated purge active on logging stores.'
        }
      ]
    },
    {
      sectionKey: 'vendor_management',
      title: 'Supplier & Vendor Relationship Security',
      description: 'Vendor classification, due diligence questionnaires, right-to-audit clauses, and annual reviews.',
      iconName: 'Truck',
      questions: [
        {
          id: 'q_vnd_1',
          sectionKey: 'vendor_management',
          question: 'Are all third-party vendors subjected to security due diligence before contracting?',
          guidance: 'Control A.5.19 & A.5.20 require addressing security within supplier agreements.',
          isoClauseMapping: 'Clause 8.1',
          annexAControlMapping: 'A.5.19',
          responseType: 'choice',
          status: 'Yes',
          textResponse: 'Vendors required to supply ISO 27001 or SOC 2 Type II reports.'
        }
      ]
    },
    {
      sectionKey: 'business_continuity',
      title: 'Business Continuity & Disaster Recovery',
      description: 'Business impact analysis, recovery time objectives (RTO), backup sites, and crisis drills.',
      iconName: 'Activity',
      questions: [
        {
          id: 'q_bcp_1',
          sectionKey: 'business_continuity',
          question: 'Are Recovery Time Objectives (RTO) and Recovery Point Objectives (RPO) formally documented?',
          guidance: 'Control A.5.29 & A.5.30 require information security continuity and ICT readiness.',
          isoClauseMapping: 'Clause 8.1',
          annexAControlMapping: 'A.5.29',
          responseType: 'choice',
          status: 'Yes',
          textResponse: 'RTO <= 4 hours, RPO <= 1 hour for critical customer-facing services.'
        }
      ]
    },
    {
      sectionKey: 'engineering',
      title: 'Secure Engineering & SDLC',
      description: 'Secure coding guidelines, peer code reviews, SAST/DAST testing, and branch protection.',
      iconName: 'Cpu',
      questions: [
        {
          id: 'q_eng_1',
          sectionKey: 'engineering',
          question: 'Are peer code reviews and automated SAST scans mandatory before merging pull requests?',
          guidance: 'Control A.8.25 - A.8.28 require secure engineering principles and testing.',
          isoClauseMapping: 'Clause 8.1',
          annexAControlMapping: 'A.8.28',
          responseType: 'choice',
          status: 'Yes',
          textResponse: 'GitHub branch protection requires 2 senior approvals and green CI security tests.'
        }
      ]
    },
    {
      sectionKey: 'devops',
      title: 'DevOps & Pipeline Security',
      description: 'CI/CD pipeline security, secret scanning, container hardening, and environment separation.',
      iconName: 'Layers',
      questions: [
        {
          id: 'q_dvo_1',
          sectionKey: 'devops',
          question: 'Is production data strictly prohibited in staging, testing, and development environments?',
          guidance: 'Control A.8.31 requires separation of development, test, and production environments.',
          isoClauseMapping: 'Clause 8.1',
          annexAControlMapping: 'A.8.31',
          responseType: 'choice',
          status: 'Yes',
          textResponse: 'Synthesized mock data utilized exclusively in non-production environments.'
        }
      ]
    },
    {
      sectionKey: 'finance',
      title: 'Finance & Fraud Prevention',
      description: 'Dual-control for wire transfers, segregation of duties, and financial ledger auditability.',
      iconName: 'CreditCard',
      questions: [
        {
          id: 'q_fin_1',
          sectionKey: 'finance',
          question: 'Is dual-authorization enforced for high-value financial transfers and invoice approvals?',
          guidance: 'Control A.5.3 requires segregation of duties to reduce risk of fraud or error.',
          isoClauseMapping: 'Clause 5.3',
          annexAControlMapping: 'A.5.3',
          responseType: 'choice',
          status: 'Yes',
          textResponse: 'Treasury system enforces dual-sign-off above $10,000 threshold.'
        }
      ]
    },
    {
      sectionKey: 'legal',
      title: 'Legal & Regulatory Compliance',
      description: 'Contractual reviews, intellectual property registers, and statutory reporting obligations.',
      iconName: 'Scale',
      questions: [
        {
          id: 'q_leg_1',
          sectionKey: 'legal',
          question: 'Does the legal team maintain a register of all applicable statutory and regulatory requirements?',
          guidance: 'Control A.5.31 requires identifying and maintaining compliance with legal and contractual requirements.',
          isoClauseMapping: 'Clause 4.2',
          annexAControlMapping: 'A.5.31',
          responseType: 'choice',
          status: 'Yes',
          textResponse: 'Statutory register updated quarterly with external legal counsel.'
        }
      ]
    },
    {
      sectionKey: 'procurement',
      title: 'Procurement & Asset Acquisition',
      description: 'Authorized hardware purchasing, software license compliance, and vendor onboarding.',
      iconName: 'ShoppingBag',
      questions: [
        {
          id: 'q_pro_1',
          sectionKey: 'procurement',
          question: 'Are all hardware and software acquisitions routed through an approved procurement workflow?',
          guidance: 'Control A.5.9 requires an inventory of information and other associated assets.',
          isoClauseMapping: 'Clause 8.1',
          annexAControlMapping: 'A.5.9',
          responseType: 'choice',
          status: 'Yes',
          textResponse: 'All technology purchasing governed via Coupa procurement gateway.'
        }
      ]
    }
  ];
}

/**
 * Generates tailored department surveys based on in-scope departments
 */
export function generateDefaultDepartmentSurveys(): DepartmentSurveyRecord[] {
  return [
    {
      deptId: 'dept_hr',
      deptName: 'Human Resources',
      headOfDept: 'VP of People Operations',
      headcount: 14,
      surveyStatus: 'COMPLETED',
      completedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      questions: [
        { id: 'sq_hr_1', question: 'Are pre-employment background screening files maintained securely?', requirementCode: 'HR-01', annexAControlRef: 'A.6.1', status: 'Yes', notes: 'Verified in HRIS system' },
        { id: 'sq_hr_2', question: 'Is the disciplinary process formally documented for security breaches?', requirementCode: 'HR-02', annexAControlRef: 'A.6.4', status: 'Yes', notes: 'Included in Employee Handbook' },
        { id: 'sq_hr_3', question: 'Are asset handover checklists completed on the day of departure?', requirementCode: 'HR-03', annexAControlRef: 'A.6.5', status: 'Yes', notes: 'Signed checklist uploaded to personnel file' }
      ]
    },
    {
      deptId: 'dept_it',
      deptName: 'Information Technology',
      headOfDept: 'Director of IT Operations',
      headcount: 32,
      surveyStatus: 'COMPLETED',
      completedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      questions: [
        { id: 'sq_it_1', question: 'Are quarterly user access reviews executed for all privileged accounts?', requirementCode: 'IT-01', annexAControlRef: 'A.5.15', status: 'Yes', notes: 'Access review ledger maintained in Okta' },
        { id: 'sq_it_2', question: 'Are security patches applied within 14 days for critical vulnerabilities?', requirementCode: 'IT-02', annexAControlRef: 'A.8.8', status: 'Yes', notes: 'Patch management policy active' },
        { id: 'sq_it_3', question: 'Are network firewalls configured with a default-deny ingress rule?', requirementCode: 'IT-03', annexAControlRef: 'A.8.20', status: 'Yes', notes: 'Palo Alto firewalls audited monthly' }
      ]
    },
    {
      deptId: 'dept_eng',
      deptName: 'Engineering & Product',
      headOfDept: 'Chief Technology Officer',
      headcount: 78,
      surveyStatus: 'IN_PROGRESS',
      questions: [
        { id: 'sq_eng_1', question: 'Are automated SAST checks blocking build pipelines on critical CVEs?', requirementCode: 'ENG-01', annexAControlRef: 'A.8.28', status: 'Yes', notes: 'Snyk integrated into GitHub Actions' },
        { id: 'sq_eng_2', question: 'Are API endpoints protected by rate limiting and authentication tokens?', requirementCode: 'ENG-02', annexAControlRef: 'A.8.26', status: 'Partially', notes: 'Core APIs protected; legacy internal APIs under refactoring' },
        { id: 'sq_eng_3', question: 'Is synthetic test data used instead of production PII for staging?', requirementCode: 'ENG-03', annexAControlRef: 'A.8.31', status: 'Yes', notes: 'Data masking scripts active' }
      ]
    },
    {
      deptId: 'dept_legal',
      deptName: 'Legal & Compliance',
      headOfDept: 'General Counsel',
      headcount: 6,
      surveyStatus: 'COMPLETED',
      completedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      questions: [
        { id: 'sq_leg_1', question: 'Are Data Processing Agreements (DPAs) attached to all customer enterprise contracts?', requirementCode: 'LEG-01', annexAControlRef: 'A.5.31', status: 'Yes', notes: 'Standard DPA template enforced' },
        { id: 'sq_leg_2', question: 'Is an intellectual property and copyright register maintained for all proprietary code?', requirementCode: 'LEG-02', annexAControlRef: 'A.5.32', status: 'Yes', notes: 'Registered with trademark and patent offices' }
      ]
    },
    {
      deptId: 'dept_fac',
      deptName: 'Facilities & Real Estate',
      headOfDept: 'Head of Facilities',
      headcount: 8,
      surveyStatus: 'COMPLETED',
      completedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      questions: [
        { id: 'sq_fac_1', question: 'Are physical visitor logs maintained and retained for at least 90 days?', requirementCode: 'FAC-01', annexAControlRef: 'A.7.2', status: 'Yes', notes: 'Digital visitor check-in system active' },
        { id: 'sq_fac_2', question: 'Are server rooms and network closets locked with biometric/badge access?', requirementCode: 'FAC-02', annexAControlRef: 'A.7.3', status: 'Yes', notes: 'Biometric fingerprint reader logs archived' }
      ]
    }
  ];
}

/**
 * Generates an actionable ISO Implementation Plan
 */
export function generateDefaultImplementationPlan(): ImplementationPlanItem[] {
  return [
    {
      id: 'plan_1',
      phaseNumber: 1,
      phaseTitle: 'Phase 1: Foundation & ISMS Context',
      activityTitle: 'Corporate Registration & Scoping',
      taskTitle: 'Define and Document Clause 4.3 ISMS Boundary Statement',
      owner: 'CISO / Legal',
      department: 'Compliance',
      dueDate: '2026-10-15',
      requirementCode: 'REQ-ISO-4.3',
      isoClause: 'Clause 4.3',
      annexAControl: 'N/A (ISMS Clause)',
      evidenceRequirement: 'ISMS Scope Statement signed by Executive Sponsor',
      status: 'COMPLETED',
      completionNotes: 'Scope boundary statement approved and baseline locked',
      priority: 'CRITICAL'
    },
    {
      id: 'plan_2',
      phaseNumber: 1,
      phaseTitle: 'Phase 1: Foundation & ISMS Context',
      activityTitle: 'Stakeholder & Legal Identification',
      taskTitle: 'Establish Interested Parties and Contractual Obligations Matrix',
      owner: 'General Counsel',
      department: 'Legal',
      dueDate: '2026-10-20',
      requirementCode: 'REQ-ISO-4.2',
      isoClause: 'Clause 4.2',
      annexAControl: 'A.5.31',
      evidenceRequirement: 'Clause 4.2 Stakeholder Register',
      status: 'COMPLETED',
      completionNotes: 'Interested parties matrix completed in Skanda',
      priority: 'HIGH'
    },
    {
      id: 'plan_3',
      phaseNumber: 2,
      phaseTitle: 'Phase 2: Risk Assessment & SoA',
      activityTitle: 'Asset Discovery & Evaluation',
      taskTitle: 'Populate Information Asset Register with Owners and Criticality',
      owner: 'IT Operations Head',
      department: 'IT',
      dueDate: '2026-10-30',
      requirementCode: 'REQ-ISO-A.5.9',
      isoClause: 'Clause 8.1',
      annexAControl: 'A.5.9',
      evidenceRequirement: 'Approved Asset Inventory with C-I-A Classifications',
      status: 'COMPLETED',
      priority: 'CRITICAL'
    },
    {
      id: 'plan_4',
      phaseNumber: 2,
      phaseTitle: 'Phase 2: Risk Assessment & SoA',
      activityTitle: 'Information Security Risk Assessment',
      taskTitle: 'Execute Clause 6.1.2 Risk Assessment across Discovered Assets',
      owner: 'Risk Manager',
      department: 'Risk & Governance',
      dueDate: '2026-11-15',
      requirementCode: 'REQ-ISO-6.1.2',
      isoClause: 'Clause 6.1.2',
      annexAControl: 'N/A (ISMS Clause)',
      evidenceRequirement: 'Information Security Risk Register with Inherent Scores',
      status: 'COMPLETED',
      completionNotes: 'Evaluated risks across asset inventory',
      priority: 'CRITICAL'
    },
    {
      id: 'plan_5',
      phaseNumber: 2,
      phaseTitle: 'Phase 2: Risk Assessment & SoA',
      activityTitle: 'Statement of Applicability (SoA)',
      taskTitle: 'Formulate Statement of Applicability with Mandatory Justifications',
      owner: 'ISMS Lead Architect',
      department: 'Compliance',
      dueDate: '2026-11-25',
      requirementCode: 'REQ-ISO-6.1.3d',
      isoClause: 'Clause 6.1.3(d)',
      annexAControl: 'All 93 Annex A Controls',
      evidenceRequirement: 'Statement of Applicability document with cryptographic hash',
      status: 'COMPLETED',
      priority: 'CRITICAL'
    },
    {
      id: 'plan_6',
      phaseNumber: 3,
      phaseTitle: 'Phase 3: Policies & Control Implementation',
      activityTitle: 'Policy Ratification',
      taskTitle: 'Ratify Core Information Security, Access Control, and BCP Policies',
      owner: 'CISO',
      department: 'Executive Leadership',
      dueDate: '2026-12-10',
      requirementCode: 'REQ-ISO-5.2',
      isoClause: 'Clause 5.2',
      annexAControl: 'A.5.1',
      evidenceRequirement: 'Signed Policy Pack in Skanda Document Repository',
      status: 'COMPLETED',
      priority: 'CRITICAL'
    },
    {
      id: 'plan_7',
      phaseNumber: 3,
      phaseTitle: 'Phase 3: Policies & Control Implementation',
      activityTitle: 'Technical Controls Operationalization',
      taskTitle: 'Enforce MFA and Endpoint Disk Encryption across All Corporate Devices',
      owner: 'SecOps Lead',
      department: 'IT & Security',
      dueDate: '2026-12-20',
      requirementCode: 'REQ-ISO-A.8.1',
      isoClause: 'Clause 8.1',
      annexAControl: 'A.8.1',
      evidenceRequirement: 'MDM compliance report showing 100% FileVault/BitLocker encryption',
      status: 'IN_PROGRESS',
      priority: 'HIGH'
    },
    {
      id: 'plan_8',
      phaseNumber: 4,
      phaseTitle: 'Phase 4: Evidence & Assurance',
      activityTitle: 'Evidence Harvesting & Verification',
      taskTitle: 'Collect and Verify Implementation Evidence for Annex A.8 Technological Controls',
      owner: 'Evidence Reviewers',
      department: 'Security Operations',
      dueDate: '2027-01-15',
      requirementCode: 'REQ-ISO-A.8.8',
      isoClause: 'Clause 8.1',
      annexAControl: 'A.8.8',
      evidenceRequirement: 'Vulnerability scan reports and patch deployment logs',
      status: 'IN_PROGRESS',
      priority: 'HIGH'
    },
    {
      id: 'plan_9',
      phaseNumber: 4,
      phaseTitle: 'Phase 4: Evidence & Assurance',
      activityTitle: 'Internal Audit Program',
      taskTitle: 'Conduct Comprehensive Clause 9.2 Internal Audit across In-Scope Departments',
      owner: 'Lead Internal Auditor',
      department: 'Internal Audit',
      dueDate: '2027-01-30',
      requirementCode: 'REQ-ISO-9.2',
      isoClause: 'Clause 9.2',
      annexAControl: 'N/A (ISMS Clause)',
      evidenceRequirement: 'Formal Internal Audit Report with Working Papers',
      status: 'IN_PROGRESS',
      priority: 'CRITICAL'
    },
    {
      id: 'plan_10',
      phaseNumber: 5,
      phaseTitle: 'Phase 5: Management Review & Certification',
      activityTitle: 'Management Review Meeting',
      taskTitle: 'Convene Clause 9.3 Executive Management Review Meeting',
      owner: 'Executive Board / CEO',
      department: 'Executive Office',
      dueDate: '2027-02-15',
      requirementCode: 'REQ-ISO-9.3',
      isoClause: 'Clause 9.3',
      annexAControl: 'N/A (ISMS Clause)',
      evidenceRequirement: 'Management Review Minutes and Decision Sign-Offs',
      status: 'NOT_STARTED',
      priority: 'CRITICAL'
    },
    {
      id: 'plan_11',
      phaseNumber: 5,
      phaseTitle: 'Phase 5: Management Review & Certification',
      activityTitle: 'Certification Audit',
      taskTitle: 'Execute Stage 1 & Stage 2 Certification Audit with Accredited Registrar',
      owner: 'Lead Consultant / CISO',
      department: 'Compliance',
      dueDate: '2027-03-01',
      requirementCode: 'REQ-ISO-CERT',
      isoClause: 'Clauses 4-10 & Annex A',
      annexAControl: 'All Controls',
      evidenceRequirement: 'Certification Body Audit Dossier and Certificate of Conformity',
      status: 'NOT_STARTED',
      priority: 'CRITICAL'
    }
  ];
}
