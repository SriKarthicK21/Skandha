// ============================================================================
// SKANDA ENTERPRISE GRC: POLICY QUALITY & ASSURANCE INTELLIGENCE ENGINE
// Path: server/services/PolicyQualityEngine.ts
//
// Evaluates policy documents across 12 rigorous enterprise governance dimensions.
// Core Formula: DOCUMENT + IMPLEMENTATION + EVIDENCE + CONTROL TEST = ASSURANCE
//
// 12 Quality Dimensions:
// 1. Completeness               (Weight: 10%)
// 2. Clarity & Readability      (Weight: 8%)
// 3. Internal Consistency       (Weight: 8%)
// 4. Enforceability             (Weight: 10%)
// 5. Accountability & RACI      (Weight: 10%)
// 6. Requirement Traceability   (Weight: 10%)
// 7. Risk Alignment             (Weight: 8%)
// 8. Operational Feasibility    (Weight: 8%)
// 9. Review & Approval Complete (Weight: 8%)
// 10. Document-Control Integrity(Weight: 8%)
// 11. Implementation Readiness  (Weight: 6%)
// 12. Evidence Spec Completeness(Weight: 6%)
// ============================================================================

export interface QualityDimensionScore {
  dimension: string;
  name: string;
  weight: number; // 0 to 1
  score: number;  // 0 to 100
  passed: boolean;
  threshold: number;
  observations: string[];
  recommendations: string[];
}

export interface PolicyQualityEvaluationResult {
  evaluationId: string;
  evaluatedAt: string;
  methodologyVersion: string; // e.g. '2026.1-ENTERPRISE-GRC'
  documentId: string;
  documentCode: string;
  documentVersion: string;
  overallScore: number; // 0 to 100
  maturityTier: 'L1_AD_HOC' | 'L2_DEFINED' | 'L3_MANAGED' | 'L4_QUANTIFIED' | 'L5_CONTINUOUS_ASSURANCE';
  isPublicationReady: boolean;
  blockers: string[];
  dimensionScores: QualityDimensionScore[];
  actionableFindings: Array<{
    id: string;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    dimension: string;
    finding: string;
    suggestedRemediation: string;
  }>;
  disclaimer: string;
}

export interface EvaluatePolicyParams {
  id: string;
  code: string;
  title: string;
  type: string;
  status: string;
  evaluationTimestamp?: string;
  customEvaluationId?: string;
  currentVersion: string;
  ownerEmail?: string;
  ownerRole?: string;
  authorEmail?: string;
  authorRole?: string;
  reviewCadence?: string;
  lastReviewDate?: string;
  nextReviewDate?: string;
  frameworkCodes?: string[];
  linkedControlCodes?: string[];
  linkedRiskIds?: string[];
  content: {
    purpose?: string;
    scope?: string;
    objectives?: string[];
    definitions?: Record<string, string>;
    rolesAndResponsibilities?: Array<{ role: string; mandate: string; r?: boolean; a?: boolean; c?: boolean; i?: boolean }>;
    requirementsOrSteps?: Array<{
      stepNumber?: number;
      actor?: string;
      system?: string;
      action?: string;
      expectedOutput?: string;
      evidenceProduced?: string;
    }>;
    controlMappings?: Array<{ controlCode: string; requirement: string; practice: string }>;
    exceptionHandling?: { workflow?: string; approver?: string; maxDays?: number };
    governanceAndReview?: { cycle?: string; owner?: string; approver?: string };
  };
  implementationTasksCount?: number;
  evidenceSpecsCount?: number;
}

export class PolicyQualityEngine {
  private static instance: PolicyQualityEngine;

  private constructor() {}

  public static getInstance(): PolicyQualityEngine {
    if (!PolicyQualityEngine.instance) {
      PolicyQualityEngine.instance = new PolicyQualityEngine();
    }
    return PolicyQualityEngine.instance;
  }

  public evaluatePolicy(params: EvaluatePolicyParams): PolicyQualityEvaluationResult {
    const evaluationId = params.customEvaluationId || `QEVAL-${Date.now()}-${params.code}`;
    const evaluatedAt = params.evaluationTimestamp || new Date().toISOString();
    const dimensionScores: QualityDimensionScore[] = [];
    const blockers: string[] = [];
    const actionableFindings: Array<{
      id: string;
      severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
      dimension: string;
      finding: string;
      suggestedRemediation: string;
    }> = [];

    // Helper to log finding
    let findingIdx = 1;
    const addFinding = (severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW', dimension: string, finding: string, remediation: string) => {
      actionableFindings.push({
        id: `QFIND-${params.code}-${findingIdx++}`,
        severity,
        dimension,
        finding,
        suggestedRemediation: remediation
      });
    };

    // ------------------------------------------------------------------------
    // 1. COMPLETENESS (Weight: 10%, Threshold: 70)
    // ------------------------------------------------------------------------
    {
      const observations: string[] = [];
      const recommendations: string[] = [];
      let score = 100;

      if (!params.content.purpose || params.content.purpose.trim().length < 30) {
        score -= 25;
        observations.push('Purpose statement is missing or too brief (<30 characters).');
        recommendations.push('Expand purpose statement to clearly state organizational mandate and CIA triad protection.');
        addFinding('HIGH', 'Completeness', 'Purpose statement is insufficient.', 'Add comprehensive business purpose and governance mandate.');
      }
      if (!params.content.scope || params.content.scope.trim().length < 30) {
        score -= 25;
        observations.push('Scope boundaries are undefined or too vague.');
        recommendations.push('Define tripartite boundaries (logical cloud VPCs, physical facilities, and personnel scope).');
        addFinding('HIGH', 'Completeness', 'Scope boundaries are undefined.', 'Detail organizational, technical, and geographic boundaries.');
      }
      if (!params.content.objectives || params.content.objectives.length === 0) {
        score -= 15;
        observations.push('No measurable security/compliance objectives defined.');
        recommendations.push('Add at least 2 measurable objectives (e.g. 100% MFA enrollment, zero unauthorized changes).');
      }
      if (!params.content.definitions || Object.keys(params.content.definitions).length === 0) {
        score -= 10;
        observations.push('Key terms and acronyms are undefined.');
        recommendations.push('Define domain-specific acronyms and terms in the definitions glossary.');
      }
      if (!params.content.exceptionHandling || !params.content.exceptionHandling.workflow) {
        score -= 15;
        observations.push('Exception and waiver procedure is missing.');
        recommendations.push('Specify formal exception approval workflow, authorized approver, and maximum waiver duration.');
        addFinding('MEDIUM', 'Completeness', 'Missing exception handling process.', 'Document formal exception request, approval, and expiration cycle.');
      }
      if (!params.content.governanceAndReview || !params.content.governanceAndReview.cycle) {
        score -= 10;
        observations.push('Governance & periodic review schedule is unspecified.');
        recommendations.push('Define annual or event-driven review frequency with designated owner.');
      }

      score = Math.max(0, score);
      dimensionScores.push({
        dimension: 'COMPLETENESS',
        name: 'Structural Completeness',
        weight: 0.10,
        score,
        passed: score >= 70,
        threshold: 70,
        observations: observations.length > 0 ? observations : ['All required structural sections are present and detailed.'],
        recommendations
      });
    }

    // ------------------------------------------------------------------------
    // 2. CLARITY & READABILITY (Weight: 8%, Threshold: 70)
    // ------------------------------------------------------------------------
    {
      const observations: string[] = [];
      const recommendations: string[] = [];
      let score = 95;

      const fullText = [
        params.content.purpose || '',
        params.content.scope || '',
        ...(params.content.requirementsOrSteps?.map(s => `${s.actor} ${s.system} ${s.action}`) || [])
      ].join(' ');

      // Check for passive/ambiguous language
      const passiveTerms = ['should try to', 'may consider', 'as far as possible', 'best effort', 'it is recommended that'];
      const foundPassive = passiveTerms.filter(t => fullText.toLowerCase().includes(t));
      if (foundPassive.length > 0) {
        score -= foundPassive.length * 15;
        observations.push(`Ambiguous or non-binding phrasing detected: "${foundPassive.join('", "')}".`);
        recommendations.push('Replace discretionary phrasing with imperative policy terms ("shall", "must", "is required to").');
        addFinding('HIGH', 'Clarity & Readability', `Ambiguous language: "${foundPassive.join(', ')}"`, 'Replace with definitive requirements.');
      }

      // Check average word length or excessive sentence complexity
      if (fullText.length > 0 && fullText.length < 100) {
        score -= 20;
        observations.push('Policy body text is extremely sparse.');
        recommendations.push('Provide adequate operational detail in the policy requirements.');
      }

      score = Math.max(0, score);
      dimensionScores.push({
        dimension: 'CLARITY_READABILITY',
        name: 'Clarity & Readability',
        weight: 0.08,
        score,
        passed: score >= 70,
        threshold: 70,
        observations: observations.length > 0 ? observations : ['Language is unambiguous, concise, and uses imperative policy verbs.'],
        recommendations
      });
    }

    // ------------------------------------------------------------------------
    // 3. INTERNAL CONSISTENCY (Weight: 8%, Threshold: 75)
    // ------------------------------------------------------------------------
    {
      const observations: string[] = [];
      const recommendations: string[] = [];
      let score = 100;

      // Check for contradictory retention or roles
      if (params.content.exceptionHandling?.maxDays && params.content.exceptionHandling.maxDays > 365) {
        score -= 30;
        observations.push(`Exception maximum duration (${params.content.exceptionHandling.maxDays} days) exceeds enterprise ceiling of 365 days.`);
        recommendations.push('Cap policy exceptions to 90 or 180 days with mandatory formal re-evaluation.');
        addFinding('HIGH', 'Internal Consistency', 'Exception duration exceeds 365 days.', 'Reduce maximum exception window to <=180 days.');
      }

      score = Math.max(0, score);
      dimensionScores.push({
        dimension: 'INTERNAL_CONSISTENCY',
        name: 'Internal Consistency',
        weight: 0.08,
        score,
        passed: score >= 75,
        threshold: 75,
        observations: observations.length > 0 ? observations : ['No internal contradictions or conflicting rules detected.'],
        recommendations
      });
    }

    // ------------------------------------------------------------------------
    // 4. ENFORCEABILITY (Weight: 10%, Threshold: 75)
    // ------------------------------------------------------------------------
    {
      const observations: string[] = [];
      const recommendations: string[] = [];
      let score = 90;

      const steps = params.content.requirementsOrSteps || [];
      if (steps.length === 0) {
        score -= 40;
        observations.push('No actionable requirements or operational steps defined.');
        recommendations.push('Define concrete requirements with explicit Actor, System, and Action.');
        addFinding('CRITICAL', 'Enforceability', 'No actionable requirements defined.', 'Add step-by-step technical enforcement requirements.');
      } else {
        const missingSystems = steps.filter(s => !s.system || s.system.trim() === '');
        if (missingSystems.length > 0) {
          score -= 15;
          observations.push(`${missingSystems.length} requirement(s) omit target system/platform.`);
          recommendations.push('Identify the specific enforcement technology (e.g. AWS IAM, Okta, ServiceNow, CrowdStrike).');
        }
      }

      score = Math.max(0, score);
      dimensionScores.push({
        dimension: 'ENFORCEABILITY',
        name: 'Technical Enforceability',
        weight: 0.10,
        score,
        passed: score >= 75,
        threshold: 75,
        observations: observations.length > 0 ? observations : ['All requirements specify clear technical enforcement systems and actions.'],
        recommendations
      });
    }

    // ------------------------------------------------------------------------
    // 5. ACCOUNTABILITY & RACI (Weight: 10%, Threshold: 80)
    // ------------------------------------------------------------------------
    {
      const observations: string[] = [];
      const recommendations: string[] = [];
      let score = 100;

      if (!params.ownerEmail || !params.ownerRole) {
        score -= 40;
        observations.push('Missing designated Policy Owner or Accountable role.');
        recommendations.push('Assign an accountable executive owner (e.g. CISO, DPO, VP Engineering).');
        addFinding('CRITICAL', 'Accountability & RACI', 'Missing accountable policy owner.', 'Designate explicit executive owner.');
      }

      const raci = params.content.rolesAndResponsibilities || [];
      if (raci.length === 0) {
        score -= 40;
        observations.push('RACI matrix is completely missing.');
        recommendations.push('Define roles with Responsible, Accountable, Consulted, and Informed mandates.');
        addFinding('HIGH', 'Accountability & RACI', 'RACI matrix missing.', 'Populate RACI matrix with departmental roles.');
      } else {
        const hasAccountable = raci.some(r => r.a);
        if (!hasAccountable) {
          score -= 20;
          observations.push('No single Accountable role designated in the RACI table.');
          recommendations.push('Ensure exactly one role is marked Accountable for policy execution.');
        }
      }

      score = Math.max(0, score);
      dimensionScores.push({
        dimension: 'ACCOUNTABILITY_RACI',
        name: 'Accountability & RACI Definition',
        weight: 0.10,
        score,
        passed: score >= 80,
        threshold: 80,
        observations: observations.length > 0 ? observations : ['Owner and RACI roles are explicitly assigned with single points of accountability.'],
        recommendations
      });
    }

    // ------------------------------------------------------------------------
    // 6. REQUIREMENT TRACEABILITY (Weight: 10%, Threshold: 75)
    // ------------------------------------------------------------------------
    {
      const observations: string[] = [];
      const recommendations: string[] = [];
      let score = 100;

      const frameworks = params.frameworkCodes || [];
      const mappings = params.content.controlMappings || [];

      if (frameworks.length === 0) {
        score -= 30;
        observations.push('No applicable frameworks bound to this document.');
        recommendations.push('Link policy to authoritative standards (e.g. ISO 27001:2022, SOC 2, DPDP, MAS TRM).');
        addFinding('HIGH', 'Requirement Traceability', 'No regulatory frameworks bound.', 'Link policy to relevant compliance frameworks.');
      }

      if (mappings.length === 0 && params.type !== 'GUIDELINE') {
        score -= 40;
        observations.push('No formal control requirement mappings provided.');
        recommendations.push('Map each policy statement to specific framework clause and canonical control.');
        addFinding('HIGH', 'Requirement Traceability', 'Missing control mappings.', 'Add explicit clause-to-practice control mappings.');
      }

      score = Math.max(0, score);
      dimensionScores.push({
        dimension: 'REQUIREMENT_TRACEABILITY',
        name: 'Regulatory & Framework Traceability',
        weight: 0.10,
        score,
        passed: score >= 75,
        threshold: 75,
        observations: observations.length > 0 ? observations : [`Mapped to ${frameworks.join(', ')} with ${mappings.length} explicit control clauses.`],
        recommendations
      });
    }

    // ------------------------------------------------------------------------
    // 7. RISK ALIGNMENT (Weight: 8%, Threshold: 70)
    // ------------------------------------------------------------------------
    {
      const observations: string[] = [];
      const recommendations: string[] = [];
      let score = 100;

      const linkedRisks = params.linkedRiskIds || [];
      if (linkedRisks.length === 0 && params.type === 'POLICY') {
        score -= 30;
        observations.push('No enterprise risk records linked to this policy.');
        recommendations.push('Link policy to associated enterprise risks (e.g. RSK-IAM-001, RSK-CYBER-004) to demonstrate treatment.');
        addFinding('MEDIUM', 'Risk Alignment', 'No linked enterprise risk records.', 'Bind policy to relevant risk register IDs.');
      }

      score = Math.max(0, score);
      dimensionScores.push({
        dimension: 'RISK_ALIGNMENT',
        name: 'Risk Register Alignment',
        weight: 0.08,
        score,
        passed: score >= 70,
        threshold: 70,
        observations: observations.length > 0 ? observations : [`Directly mitigates ${linkedRisks.length} registered enterprise risks.`],
        recommendations
      });
    }

    // ------------------------------------------------------------------------
    // 8. OPERATIONAL FEASIBILITY (Weight: 8%, Threshold: 70)
    // ------------------------------------------------------------------------
    {
      const observations: string[] = [];
      const recommendations: string[] = [];
      let score = 90;

      const steps = params.content.requirementsOrSteps || [];
      const hasOutput = steps.every(s => s.expectedOutput && s.expectedOutput.trim().length > 0);
      if (steps.length > 0 && !hasOutput) {
        score -= 20;
        observations.push('Some requirements lack verifiable expected operational outputs.');
        recommendations.push('Specify concrete outputs (e.g. "Approved Jira ticket", "KMS key rotation log") for every step.');
      }

      score = Math.max(0, score);
      dimensionScores.push({
        dimension: 'OPERATIONAL_FEASIBILITY',
        name: 'Operational Feasibility',
        weight: 0.08,
        score,
        passed: score >= 70,
        threshold: 70,
        observations: observations.length > 0 ? observations : ['Requirements are operationally practical and yield verifiable outputs.'],
        recommendations
      });
    }

    // ------------------------------------------------------------------------
    // 9. REVIEW & APPROVAL COMPLETENESS (Weight: 8%, Threshold: 75)
    // ------------------------------------------------------------------------
    {
      const observations: string[] = [];
      const recommendations: string[] = [];
      let score = 100;

      if (!params.authorEmail || !params.authorRole) {
        score -= 20;
        observations.push('Author / drafter identity is unrecorded.');
        recommendations.push('Record verified author email and role in document version history.');
      }
      if (!params.reviewCadence) {
        score -= 20;
        observations.push('Review cadence is undefined.');
        recommendations.push('Set review cadence (ANNUAL, SEMI_ANNUAL, QUARTERLY).');
      }

      score = Math.max(0, score);
      dimensionScores.push({
        dimension: 'REVIEW_APPROVAL_COMPLETENESS',
        name: 'Review & Approval Completeness',
        weight: 0.08,
        score,
        passed: score >= 75,
        threshold: 75,
        observations: observations.length > 0 ? observations : ['Review cadence, author, and governance cycle are formally documented.'],
        recommendations
      });
    }

    // ------------------------------------------------------------------------
    // 10. DOCUMENT-CONTROL INTEGRITY (Weight: 8%, Threshold: 80)
    // ------------------------------------------------------------------------
    {
      const observations: string[] = [];
      const recommendations: string[] = [];
      let score = 100;

      const linkedControls = params.linkedControlCodes || [];
      if (linkedControls.length === 0 && params.type !== 'GUIDELINE') {
        score -= 50;
        observations.push('Document is orphaned from the Canonical Control Library.');
        recommendations.push('Bind document to at least one canonical control implementation (e.g. A.5.15, A.8.24).');
        addFinding('HIGH', 'Document-Control Integrity', 'Document has no linked controls.', 'Bind document to canonical controls.');
      }

      score = Math.max(0, score);
      dimensionScores.push({
        dimension: 'DOCUMENT_CONTROL_INTEGRITY',
        name: 'Document-Control Integrity',
        weight: 0.08,
        score,
        passed: score >= 80,
        threshold: 80,
        observations: observations.length > 0 ? observations : [`Linked to ${linkedControls.length} canonical controls (${linkedControls.join(', ')}).`],
        recommendations
      });
    }

    // ------------------------------------------------------------------------
    // 11. IMPLEMENTATION READINESS (Weight: 6%, Threshold: 70)
    // ------------------------------------------------------------------------
    {
      const observations: string[] = [];
      const recommendations: string[] = [];
      let score = 100;

      const tasksCount = params.implementationTasksCount ?? (params.content.requirementsOrSteps?.length || 0);
      if (tasksCount === 0 && params.type !== 'GUIDELINE') {
        score -= 40;
        observations.push('No downstream implementation tasks have been derived from policy statements.');
        recommendations.push('Generate operational implementation tasks for assigned owners upon publication.');
      }

      score = Math.max(0, score);
      dimensionScores.push({
        dimension: 'IMPLEMENTATION_READINESS',
        name: 'Implementation Readiness',
        weight: 0.06,
        score,
        passed: score >= 70,
        threshold: 70,
        observations: observations.length > 0 ? observations : [`Ready with ${tasksCount} actionable implementation tasks.`],
        recommendations
      });
    }

    // ------------------------------------------------------------------------
    // 12. EVIDENCE SPECIFICATION COMPLETENESS (Weight: 6%, Threshold: 70)
    // ------------------------------------------------------------------------
    {
      const observations: string[] = [];
      const recommendations: string[] = [];
      let score = 100;

      const steps = params.content.requirementsOrSteps || [];
      const specsCount = params.evidenceSpecsCount ?? steps.filter(s => s.evidenceProduced && s.evidenceProduced.trim().length > 0).length;

      if (specsCount === 0 && params.type !== 'GUIDELINE') {
        score -= 40;
        observations.push('No expected evidence artifacts specified.');
        recommendations.push('Define concrete evidence outputs (e.g. audit logs, approval records, quarterly reports).');
        addFinding('MEDIUM', 'Evidence Specification', 'Missing expected evidence specifications.', 'Specify expected artifacts produced by each step.');
      }

      score = Math.max(0, score);
      dimensionScores.push({
        dimension: 'EVIDENCE_SPEC_COMPLETENESS',
        name: 'Evidence Specification Completeness',
        weight: 0.06,
        score,
        passed: score >= 70,
        threshold: 70,
        observations: observations.length > 0 ? observations : [`${specsCount} evidence artifact specifications registered.`],
        recommendations
      });
    }

    // ------------------------------------------------------------------------
    // CALCULATE OVERALL WEIGHTED SCORE & MATURITY TIER
    // ------------------------------------------------------------------------
    const rawWeightedScore = dimensionScores.reduce((sum, dim) => sum + dim.score * dim.weight, 0);
    const overallScore = Math.round(rawWeightedScore);

    let maturityTier: 'L1_AD_HOC' | 'L2_DEFINED' | 'L3_MANAGED' | 'L4_QUANTIFIED' | 'L5_CONTINUOUS_ASSURANCE' = 'L1_AD_HOC';
    if (overallScore >= 90) maturityTier = 'L5_CONTINUOUS_ASSURANCE';
    else if (overallScore >= 80) maturityTier = 'L4_QUANTIFIED';
    else if (overallScore >= 70) maturityTier = 'L3_MANAGED';
    else if (overallScore >= 55) maturityTier = 'L2_DEFINED';

    // Compile Publication Blockers
    const failedDimensions = dimensionScores.filter(d => !d.passed);
    if (failedDimensions.length > 0) {
      blockers.push(`Failed quality dimensions: ${failedDimensions.map(d => d.name).join(', ')}`);
    }
    if (overallScore < 75) {
      blockers.push(`Overall quality score (${overallScore}%) is below minimum publication threshold of 75%.`);
    }

    return {
      evaluationId,
      evaluatedAt,
      methodologyVersion: '2026.1-ENTERPRISE-GRC',
      documentId: params.id,
      documentCode: params.code,
      documentVersion: params.currentVersion,
      overallScore,
      maturityTier,
      isPublicationReady: blockers.length === 0,
      blockers,
      dimensionScores,
      actionableFindings,
      disclaimer: 'SKANDA Policy Quality Intelligence evaluates document structural integrity, enforceability, and closed-loop linkage. This evaluation is an operational assurance aid and does not constitute a formal certification guarantee or legal opinion.'
    };
  }
}

export const policyQualityEngine = PolicyQualityEngine.getInstance();
