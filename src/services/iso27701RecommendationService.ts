import { ISO27701Control } from '../data/iso27701MasterData';

export interface PIMSRemediationStep {
  stepNumber: number;
  phase: string;
  action: string;
  technicalDetail: string;
  deliverable: string;
}

export interface PIMSImprovementRecommendation {
  controlCode: string;
  title: string;
  annex: string;
  clauseRef: string;
  roleType: 'CONTROLLER' | 'PROCESSOR';
  currentGapAnalysis: string;
  remediationRoadmap: PIMSRemediationStep[];
  targetEvidenceArtifacts: string[];
  compensatingControls: string[];
  auditorDefensibilityScript: string;
  recommendedJustification: string;
  estimatedEffort: 'Low (1-2 weeks)' | 'Medium (3-4 weeks)' | 'High (6-8 weeks)';
  priorityScore: 'Critical' | 'High' | 'Medium';
  regulatoryImpact: {
    gdprAlignment: string;
    dpdpAlignment: string;
    iso27001Link: string;
  };
}

export interface PIMSRecommendationsResponse {
  success: boolean;
  isAI: boolean;
  model: string;
  timestamp: string;
  recommendations: PIMSImprovementRecommendation[];
}

/**
 * Deterministic Statutory PIMS Remediation Generator (Fallback)
 */
export function generateLocalPIMSRecommendation(ctrl: ISO27701Control): PIMSImprovementRecommendation {
  const isController = ctrl.roleType === 'CONTROLLER';
  const code = ctrl.controlCode;

  // Specific tailored roadmaps for known controls
  if (code === 'A.7.2.7') {
    return {
      controlCode: 'A.7.2.7',
      title: 'Joint PII controllers',
      annex: 'Annex A',
      clauseRef: 'ISO 27701:2019 §7.2.7',
      roleType: 'CONTROLLER',
      currentGapAnalysis:
        'The current justification notes that co-branded partner agreements are undergoing annual legal refresh. A Stage 1/2 lead auditor will issue a Minor Non-Conformity (MNC) if joint controller arrangements lack an executed, transparent Article 26 / §7.2.7 allocation matrix designating the primary point of contact for PII principals and reciprocal indemnities.',
      remediationRoadmap: [
        {
          stepNumber: 1,
          phase: 'Legal & Governance Allocation',
          action: 'Codify Bilateral Joint Controller Addendum (JCA)',
          technicalDetail:
            'Draft formal Joint Controller Agreement defining respective responsibilities for DSAR fulfillment, privacy notice delivery, and security breach notification within 72 hours.',
          deliverable: 'Executed Joint Controller Agreement (JCA v2026.1) signed by General Counsel'
        },
        {
          stepNumber: 2,
          phase: 'Technical Architecture & Routing',
          action: 'Configure Unified DSAR Intake & Ticket Dispatch',
          technicalDetail:
            'Configure API webhook sync between Apex GRC Portal and the co-branding partner ticketing gateway to route customer data deletion and access requests without data loss.',
          deliverable: 'Jira Service Management / Zendesk Cross-Tenant DSAR Dispatch Protocol'
        },
        {
          stepNumber: 3,
          phase: 'Auditor Verification & Mock Audit',
          action: 'Conduct End-to-End Joint Incident Simulation',
          technicalDetail:
            'Perform tabletop simulation with partner legal and privacy teams testing notice to PII principals under ISO 27701 §7.2.7 and GDPR Article 26(2).',
          deliverable: 'Joint Incident & Breach Drill Execution Record signed by both DPOs'
        }
      ],
      targetEvidenceArtifacts: [
        'Executed Joint Controller Agreement (JCA) with Liability Matrix',
        'Customer-Facing Transparency Notice (§7.2.7 / Art. 26(2) Essence Summary)',
        'Bi-Directional DSAR Dispatch SLA & Integration Architecture',
        'Annual Joint Privacy Governance Meeting Minutes'
      ],
      compensatingControls: [
        'Interim SLA Memo requiring manual notification of DSAR requests within 48 hours.',
        'Escrowed contact point published on website privacy portal for joint cardholder inquiries.'
      ],
      auditorDefensibilityScript:
        '"Apex operates joint controllership in strict accordance with ISO 27701:2019 Clause 7.2.7 and GDPR Article 26. Our bilateral JCA delineates responsibilities, establishes Apex as the primary DSAR contact for retail cardholders, and mandates automated webhook synchronization for subject rights."',
      recommendedJustification:
        'Fully implemented under ISO 27701:2019 §7.2.7. Apex and co-branded credit card partners maintain an executed Joint Controller Agreement (JCA v2026.1) delineating respective roles, designated primary points of contact for PII principals, and mutual incident notification SLAs. Automated webhook routing synchronizes DSAR requests across partner boundaries with zero data lag.',
      estimatedEffort: 'Medium (3-4 weeks)',
      priorityScore: 'High',
      regulatoryImpact: {
        gdprAlignment: 'GDPR Article 26 (Joint Controllers)',
        dpdpAlignment: 'DPDP Act 2023 Section 8 (General Obligations of Data Fiduciary)',
        iso27001Link: 'ISO 27001:2022 A.5.19 & A.5.20 (Supplier Relationships)'
      }
    };
  }

  if (code === 'A.7.3.6') {
    return {
      controlCode: 'A.7.3.6',
      title: 'PII controllers obligations to inform third parties',
      annex: 'Annex A',
      clauseRef: 'ISO 27701:2019 §7.3.6',
      roleType: 'CONTROLLER',
      currentGapAnalysis:
        'Currently, downstream notification of customer rectifications and erasures is automated for primary cloud datastores, but still relies on manual ticketing for legacy credit scoring partners. This creates compliance drift under ISO 27701 §7.3.6 and GDPR Article 19.',
      remediationRoadmap: [
        {
          stepNumber: 1,
          phase: 'Kafka & Event-Driven Cascade',
          action: 'Extend Real-Time Erasure Event Bus to Legacy Vendors',
          technicalDetail:
            'Deploy secure REST outbound webhook adapter with mTLS and HMAC verification to push PII erasure tokens to the legacy credit scoring vendor API upon DSAR completion.',
          deliverable: 'Kafka Outbound Topic `privacy.principal.erasure.v1` with Dead Letter Queue'
        },
        {
          stepNumber: 2,
          phase: 'Contractual & DPA Amendment',
          action: 'Mandate Automated 24-Hour Purge Confirmation Receipts',
          technicalDetail:
            'Incorporate statutory requirement in Vendor DPA requiring cryptographic API receipt confirming third-party data purge within 24 hours of notification.',
          deliverable: 'Executed DPA Schedule B (Automated Downstream Rectification Protocol)'
        },
        {
          stepNumber: 3,
          phase: 'Auditor Reconciliation Ledger',
          action: 'Generate Continuous Downstream Purge Audit Ledger',
          technicalDetail:
            'Build automated reporting query in GRC database matching customer deletion requests against downstream third-party acknowledgment timestamps.',
          deliverable: 'Downstream Propagation Audit Ledger with 100% reconciliation rate'
        }
      ],
      targetEvidenceArtifacts: [
        'Event Bus Architecture Diagram (Kafka PII Rectification / Deletion Cascade)',
        'Vendor Outbound API Integration Specs with HMAC Tokenization',
        'Sample 20-Record Downstream Purge Acknowledgment Audit Receipt',
        'Standard Operating Procedure: Downstream PII Rectification & Purge Cascade'
      ],
      compensatingControls: [
        'Weekly automated reconciliation report flagging any unacknowledged manual credit bureau tickets.',
        'Pre-configured Zendesk macro with automated escalation to Vendor Manager at T+48 hours.'
      ],
      auditorDefensibilityScript:
        '"Under ISO 27701 Clause 7.3.6 and GDPR Art. 19, Apex propagates all PII rectification and erasure requests to downstream processors. Primary datastores receive real-time Kafka event broadcasts, while legacy scoring partners are integrated via automated secure webhooks with cryptographic acknowledgment logs."',
      recommendedJustification:
        'Fully implemented under ISO 27701:2019 §7.3.6. Automated event cascade broadcasts customer rectification, erasure, and restriction requests across all internal datastores and third-party subprocessors via Kafka event stream and authenticated webhook APIs. All downstream recipients provide automated cryptographic purge receipts logged in the PIMS compliance ledger.',
      estimatedEffort: 'Low (1-2 weeks)',
      priorityScore: 'Critical',
      regulatoryImpact: {
        gdprAlignment: 'GDPR Article 19 (Notification obligation regarding rectification/erasure)',
        dpdpAlignment: 'DPDP Act 2023 Section 12(3) (Right to correction and erasure of personal data)',
        iso27001Link: 'ISO 27001:2022 A.8.12 (Data leakage prevention) & A.5.20'
      }
    };
  }

  // Generic tailored fallback based on control characteristics
  const mappedIso = ctrl.mappedIso27001Controls.length > 0 ? ctrl.mappedIso27001Controls.join(', ') : 'A.5.1';
  const mappedGdpr = ctrl.mappedGdprArticles.length > 0 ? ctrl.mappedGdprArticles.join(', ') : 'Art. 5';
  const mappedDpdp = ctrl.mappedDpdpSections.length > 0 ? ctrl.mappedDpdpSections.join(', ') : 'Sec 8';

  return {
    controlCode: ctrl.controlCode,
    title: ctrl.title,
    annex: ctrl.annex,
    clauseRef: ctrl.clauseRef,
    roleType: ctrl.roleType,
    currentGapAnalysis: `The control "${ctrl.title}" is currently marked as Partially Implemented. The current justification (${ctrl.justification.slice(0, 100)}...) demonstrates partial coverage but leaves residual exposure for ISO 27701 certification auditors who require verifiable technical and operational evidence for ${ctrl.objective.slice(0, 120)}.`,
    remediationRoadmap: [
      {
        stepNumber: 1,
        phase: 'Policy & Procedural Codification',
        action: `Formalize Standard Operating Procedure for ${ctrl.shortTitle || ctrl.title}`,
        technicalDetail: `Document end-to-end technical procedures aligned with ${ctrl.clauseRef} and assign ${ctrl.responsibleLead} as primary operational custodian.`,
        deliverable: `PIMS SOP-PIMS-${ctrl.controlCode.replace('.', '_')} approved by DPO`
      },
      {
        stepNumber: 2,
        phase: 'Technical Implementation & Controls Enforcement',
        action: `Implement Automated Controls & Verification Gateways`,
        technicalDetail: `Configure technical safeguards in cloud infrastructure and application databases to enforce ${ctrl.guidanceSummary.slice(0, 140)}.`,
        deliverable: 'System Configuration Baseline & Automated Health Check Script'
      },
      {
        stepNumber: 3,
        phase: 'Auditor Verification & Workpaper Creation',
        action: 'Assemble Conforming Audit Evidence Dossier',
        technicalDetail: `Conduct internal compliance audit sampling at least 15 production records testing ${ctrl.auditorTestProcedure.slice(0, 130)}.`,
        deliverable: 'PIMS Internal Audit Workpaper & Lead Auditor Sign-Off Memo'
      }
    ],
    targetEvidenceArtifacts: [
      ...ctrl.suggestedEvidenceTypes,
      `Operational Procedure Document for ${ctrl.shortTitle}`,
      'Sample Audit Trail Ledger with Timestamps & Cryptographic Hashes'
    ],
    compensatingControls: [
      `Interim supervisory review conducted bi-weekly by ${ctrl.responsibleLead}.`,
      'Automated alerting triggered upon any exception or unmonitored processing event.'
    ],
    auditorDefensibilityScript: `"Apex has operationalized ${ctrl.controlCode} (${ctrl.title}) through formalized standard operating procedures and technical controls in accordance with ${ctrl.clauseRef}. Continuous telemetry confirms full alignment with ISO 27001 (${mappedIso}) and applicable privacy statutory baselines."`,
    recommendedJustification: `Fully implemented in accordance with ${ctrl.clauseRef}. ${isController ? 'As a PII Controller' : 'As a PII Processor'}, Apex has deployed verified technical and operational controls satisfying the objective: ${ctrl.objective}. All processing workflows have been validated via internal audit sampling with documented SOPs, immutable logs, and executive oversight.`,
    estimatedEffort: 'Medium (3-4 weeks)',
    priorityScore: 'High',
    regulatoryImpact: {
      gdprAlignment: `GDPR ${mappedGdpr}`,
      dpdpAlignment: `DPDP Act 2023 ${mappedDpdp}`,
      iso27001Link: `ISO 27001:2022 ${mappedIso}`
    }
  };
}

/**
 * Fetch AI-Generated Improvement Recommendations for Partially Implemented Controls
 */
export async function fetchPIMSImprovementRecommendations(
  controls: ISO27701Control[],
  tenantName: string = 'Enterprise Scope'
): Promise<PIMSRecommendationsResponse> {
  const partiallyImplemented = controls.filter(c => c.implementationStatus === 'Partially Implemented');

  if (partiallyImplemented.length === 0) {
    return {
      success: true,
      isAI: false,
      model: 'Deterministic PIMS Statutory Engine',
      timestamp: new Date().toISOString(),
      recommendations: []
    };
  }

  try {
    const payload = {
      tenantName,
      controls: partiallyImplemented.map(c => ({
        id: c.id,
        controlCode: c.controlCode,
        title: c.title,
        annex: c.annex,
        clauseRef: c.clauseRef,
        roleType: c.roleType,
        domainCode: c.domainCode,
        domainTitle: c.domainTitle,
        objective: c.objective,
        guidanceSummary: c.guidanceSummary,
        auditorTestProcedure: c.auditorTestProcedure,
        suggestedEvidenceTypes: c.suggestedEvidenceTypes,
        justification: c.justification,
        responsibleLead: c.responsibleLead,
        mappedIso27001Controls: c.mappedIso27001Controls,
        mappedGdprArticles: c.mappedGdprArticles,
        mappedDpdpSections: c.mappedDpdpSections
      }))
    };

    const response = await fetch('/api/iso27701/improvement-recommendations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }

    const data = await response.json();
    if (data && data.success && Array.isArray(data.recommendations) && data.recommendations.length > 0) {
      return data;
    }

    // Fallback if data structure is unexpected
    throw new Error('Invalid recommendation payload from server');
  } catch (err) {
    console.warn('Could not retrieve recommendations via Gemini API, using statutory PIMS engine fallback:', err);
    return {
      success: true,
      isAI: false,
      model: 'Deterministic ISO 27701 Statutory Engine (Local Fallback)',
      timestamp: new Date().toISOString(),
      recommendations: partiallyImplemented.map(c => generateLocalPIMSRecommendation(c))
    };
  }
}
