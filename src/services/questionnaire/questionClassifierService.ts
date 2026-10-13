// ============================================================================
// SKANDA QUESTIONNAIRE INTELLIGENCE: QUESTION & REQUIREMENT CLASSIFIER
// Path: src/services/questionnaire/questionClassifierService.ts
//
// Determines the security requirement actually being asked, regardless of the
// wording a customer used. Produces:
//  - primary/secondary categories
//  - normalized interpretation and underlying requirement
//  - framework + control mappings REUSED from the canonical control library
//  - multi-part detection with one answerable claim per distinct requirement
//  - clarification / specialist-approval flags
//
// Classification is deterministic and rule-based. Never claims certainty:
// `classificationConfidence` is an explicit heuristic estimate.
// ============================================================================

import {
  AnswerableClaim,
  ExtractedQuestion,
  QuestionCategory,
  QuestionResponseType,
  RequirementAnalysis
} from '../../types/questionnaireIntelligenceTypes.js';
import { controlTestingService } from '../canonical/ControlTestingService.js';
import { normalizeForMatching, normalizeText } from './ooxml/xmlUtils.js';

interface CategoryRule {
  category: QuestionCategory;
  keywords: RegExp;
  /** Canonical control categories that satisfy this question domain. */
  controlCategories: string[];
  specialistRole: string;
  evidenceKinds: string[];
}

/** Weighted keyword taxonomy. Ordered only for readability; scoring decides. */
const CATEGORY_RULES: CategoryRule[] = [
  {
    category: 'ENCRYPTION',
    keywords:
      /\b(encrypt(?:ed|ion)?|at rest|in transit|tls|ssl|aes|ciphers?|cryptograph(?:y|ic)|crypto)\b/i,
    controlCategories: ['CRYPTOGRAPHY', 'INFRASTRUCTURE'],
    specialistRole: 'SECURITY_ARCHITECT',
    evidenceKinds: ['Encryption standard', 'Key/configuration evidence', 'Database configuration export']
  },
  {
    category: 'KEY_MANAGEMENT',
    keywords: /\b(key (?:management|rotation|ceremony)|kms|hsm|key custodian|cryptoperiod)\b/i,
    controlCategories: ['CRYPTOGRAPHY'],
    specialistRole: 'SECURITY_ARCHITECT',
    evidenceKinds: ['Key management procedure', 'KMS rotation configuration evidence']
  },
  {
    category: 'IDENTITY_AND_ACCESS_MANAGEMENT',
    keywords:
      /\b(access control|user access|provision(?:ing|ed)?|deprovision|least privilege|user account|authentication|single sign[- ]on|sso|password|joiner|leaver|access review|access request|account review)\b/i,
    controlCategories: ['ACCESS_CONTROL'],
    specialistRole: 'IAM_LEAD',
    evidenceKinds: ['Access control policy', 'Access review records', 'IdP configuration export']
  },
  {
    category: 'PRIVILEGED_ACCESS',
    keywords:
      /\b(privileged|admin(?:istrator)? account|root account|elevat(?:e|ion)|just[- ]in[- ]time|pam|superuser|break[- ]glass|sudo)\b/i,
    controlCategories: ['ACCESS_CONTROL'],
    specialistRole: 'IAM_LEAD',
    evidenceKinds: ['PAM procedure', 'Privileged session records', 'Elevation approval logs']
  },
  {
    category: 'NETWORK_SECURITY',
    keywords:
      /\b(firewall|network segmentation|dmz|vpc|subnet|ids|ips|intrusion|port|vpn|network diagram|egress|ingress|zero trust)\b/i,
    controlCategories: ['NETWORK', 'INFRASTRUCTURE'],
    specialistRole: 'NETWORK_SECURITY_LEAD',
    evidenceKinds: ['Network architecture diagram', 'Firewall rule export', 'Segmentation evidence']
  },
  {
    category: 'CLOUD_SECURITY',
    keywords:
      /\b(cloud|aws|azure|gcp|kubernetes|container|serverless|iac|terraform|cspm|cloud posture|multi[- ]tenant|region)\b/i,
    controlCategories: ['INFRASTRUCTURE'],
    specialistRole: 'CLOUD_SECURITY_ARCHITECT',
    evidenceKinds: ['Cloud architecture description', 'CSPM posture export', 'Baseline configuration evidence']
  },
  {
    category: 'VULNERABILITY_MANAGEMENT',
    keywords:
      /\b(vulnerabilit(?:y|ies)|cve|patch(?:ing|es)?|penetration test|pentest|scan(?:ning)?|remediat(?:e|ion) window|security testing|sast|dast|sca)\b/i,
    controlCategories: ['INFRASTRUCTURE', 'SECURE_DEVELOPMENT'],
    specialistRole: 'VULNERABILITY_MANAGEMENT_LEAD',
    evidenceKinds: ['Vulnerability management procedure', 'Scan results', 'Penetration test report']
  },
  {
    category: 'INCIDENT_RESPONSE',
    keywords:
      /\b(incident (?:response|management)|breach|notif(?:y|ication)|detect(?:ion)? and respond|escalation|ir plan|forensic|containment)\b/i,
    controlCategories: ['INCIDENT_MANAGEMENT', 'OPERATIONS'],
    specialistRole: 'INCIDENT_RESPONSE_MANAGER',
    evidenceKinds: ['Incident response plan', 'Incident register', 'Post-incident review records']
  },
  {
    category: 'BUSINESS_CONTINUITY',
    keywords: /\b(business continuity|bcp|business impact analysis|bia|continuity plan|critical service|downtime tolerance)\b/i,
    controlCategories: ['RESILIENCE'],
    specialistRole: 'BUSINESS_CONTINUITY_COORDINATOR',
    evidenceKinds: ['Business continuity plan', 'BIA record', 'Continuity exercise report']
  },
  {
    category: 'DISASTER_RECOVERY',
    keywords: /\b(disaster recovery|dr plan|backup|restore|rto|rpo|redundan(?:t|cy)|failover|replication|multi[- ]az)\b/i,
    controlCategories: ['RESILIENCE', 'OPERATIONS'],
    specialistRole: 'BUSINESS_CONTINUITY_COORDINATOR',
    evidenceKinds: ['Disaster recovery plan', 'Backup configuration', 'Restore test evidence']
  },
  {
    category: 'DATA_PROTECTION',
    keywords:
      /\b(data classification|data (?:protection|security|handling|loss|minimi[sz]ation)|dlp|sensitive data|confidential data|pii handling|data flow|data map)\b/i,
    controlCategories: ['DATA_PROTECTION', 'PRIVACY'],
    specialistRole: 'DATA_PROTECTION_OFFICER',
    evidenceKinds: ['Data classification policy', 'Data flow diagram', 'DLP configuration']
  },
  {
    category: 'PRIVACY',
    keywords:
      /\b(privacy|gdpr|dpdp|personal data|data subject|consent|dsar|privacy notice|data processing agreement|dpa|controller|processor|sub[- ]processor|pims|27701)\b/i,
    controlCategories: ['PRIVACY'],
    specialistRole: 'PRIVACY_OFFICER',
    evidenceKinds: ['Privacy policy', 'DPIA record', 'Data processing agreement']
  },
  {
    category: 'DATA_RETENTION',
    keywords: /\b(retention|retain|record keeping|storage limitation|legal hold)\b/i,
    controlCategories: ['DATA_PROTECTION', 'PRIVACY'],
    specialistRole: 'PRIVACY_OFFICER',
    evidenceKinds: ['Retention schedule', 'Retention configuration evidence']
  },
  {
    category: 'DATA_DELETION',
    keywords: /\b(deletion|deletion on termination|secure erasure|crypto[- ]?shred|right to erasure|sanitiz(?:e|ation)|destroy(?:ed)? data)\b/i,
    controlCategories: ['DATA_PROTECTION'],
    specialistRole: 'PRIVACY_OFFICER',
    evidenceKinds: ['Data deletion procedure', 'Deletion confirmation artefact']
  },
  {
    category: 'SECURE_DEVELOPMENT',
    keywords:
      /\b(secure development|sdlc|code review|change management|segregation of (?:duties|environments)|ci\/cd|pipeline|build|release management|developer training)\b/i,
    controlCategories: ['SECURE_DEVELOPMENT'],
    specialistRole: 'ENGINEERING_SECURITY_LEAD',
    evidenceKinds: ['SDLC policy', 'Change management records', 'Code review evidence']
  },
  {
    category: 'LOGGING_AND_MONITORING',
    keywords:
      /\b(log(?:ging|s)?|monitor(?:ing)?|siem|audit trail|alert(?:ing)?|retention of logs|tamper[- ]evident|soc|24x7|24\/7)\b/i,
    controlCategories: ['OPERATIONS', 'MONITORING'],
    specialistRole: 'SOC_MANAGER',
    evidenceKinds: ['Logging and monitoring procedure', 'SIEM configuration', 'Log retention evidence']
  },
  {
    category: 'ASSET_MANAGEMENT',
    keywords: /\b(asset (?:management|inventory|register)|hardware inventory|software inventory|cmdb|endpoint inventory)\b/i,
    controlCategories: ['ASSET_MANAGEMENT', 'OPERATIONS'],
    specialistRole: 'IT_ASSET_MANAGER',
    evidenceKinds: ['Asset inventory export', 'Asset management procedure']
  },
  {
    category: 'THIRD_PARTY_RISK',
    keywords:
      /\b(third[- ]part(?:y|ies)|vendor|supplier|subprocessor|outsourc|supply chain|due diligence|managed service)\b/i,
    controlCategories: ['SUPPLIER', 'THIRD_PARTY'],
    specialistRole: 'VENDOR_MANAGEMENT_LEAD',
    evidenceKinds: ['Third-party risk procedure', 'Vendor assessment records']
  },
  {
    category: 'PHYSICAL_SECURITY',
    keywords: /\b(physical security|data cent(?:er|re)|facility|badge|cctv|visitor|locked cabinet|secure area|premises)\b/i,
    controlCategories: ['PHYSICAL'],
    specialistRole: 'FACILITIES_SECURITY_MANAGER',
    evidenceKinds: ['Physical security policy', 'Data centre attestation', 'Colocation certificate']
  },
  {
    category: 'HUMAN_RESOURCES_SECURITY',
    keywords:
      /\b(background (?:check|verification)|employee screening|onboarding|termination|awareness training|security training|acceptable use|nda|disciplinary|confidentiality agreement)\b/i,
    controlCategories: ['PEOPLE', 'HUMAN_RESOURCES'],
    specialistRole: 'HR_SECURITY_MANAGER',
    evidenceKinds: ['HR security policy', 'Training completion records', 'Screening records']
  },
  {
    category: 'AI_GOVERNANCE',
    keywords:
      /\b(artificial intelligence|ai\/ml|\bai\b|machine learning|llm|model (?:governance|training|risk)|iso 42001|generative|algorithmic|training data|prompt injection)\b/i,
    controlCategories: ['AI_GOVERNANCE'],
    specialistRole: 'AI_GOVERNANCE_LEAD',
    evidenceKinds: ['AI governance policy', 'Model card / register', 'AI risk assessment']
  },
  {
    category: 'REGULATORY_COMPLIANCE',
    keywords:
      /\b(regulat(?:ory|ion)|statut(?:ory|e)|compliance with law|mas trm|rbi|hipaa|sox|pci[- ]?dss|legal requirement|jurisdiction|data residency law)\b/i,
    controlCategories: ['GOVERNANCE'],
    specialistRole: 'COMPLIANCE_MANAGER',
    evidenceKinds: ['Regulatory obligation register', 'Compliance mapping', 'Legal review record']
  },
  {
    category: 'CERTIFICATIONS',
    keywords:
      /\b(certifi(?:ed|cation|ate)|iso 27001|iso 27701|soc ?2|soc ?2 type ?ii|attestation|audit report|attest|accredit)\b/i,
    controlCategories: ['GOVERNANCE'],
    specialistRole: 'COMPLIANCE_MANAGER',
    evidenceKinds: ['Certificate', 'SOC 2 report', 'Audit report']
  },
  {
    category: 'INFORMATION_SECURITY',
    keywords:
      /\b(information security (?:policy|program|management)|isms|security governance|security policy|security awareness|risk assessment|security organisation|ciso)\b/i,
    controlCategories: ['GOVERNANCE', 'OPERATIONS'],
    specialistRole: 'CISO',
    evidenceKinds: ['Information security policy', 'Risk assessment record']
  },
  {
    category: 'ORGANIZATIONAL_INFORMATION',
    keywords:
      /\b(company name|legal entity|headquarter|address|number of employees|revenue|contact|point of contact|ownership|incorporat|registration number|website)\b/i,
    controlCategories: [],
    specialistRole: 'COMPLIANCE_MANAGER',
    evidenceKinds: ['Approved organizational fact']
  }
];

const SPECIALIST_APPROVAL_CATEGORIES: QuestionCategory[] = [
  'REGULATORY_COMPLIANCE',
  'CERTIFICATIONS',
  'PRIVACY',
  'AI_GOVERNANCE'
];

export type MaterialClaimClass = 'SECURITY' | 'PRIVACY' | 'REGULATORY' | 'CERTIFICATION' | 'CONTRACTUAL' | 'GENERAL';

const CONTRACTUAL_PATTERN = /\b(indemnif|liabilit|insurance|indemnity|sla|service level|remedy|warrant|contractual|governing law)\b/i;

export function classifyMaterialClaim(categories: QuestionCategory[], text: string): MaterialClaimClass {
  if (CONTRACTUAL_PATTERN.test(text)) return 'CONTRACTUAL';
  if (categories.includes('CERTIFICATIONS')) return 'CERTIFICATION';
  if (categories.includes('REGULATORY_COMPLIANCE')) return 'REGULATORY';
  if (categories.includes('PRIVACY') || categories.includes('DATA_PROTECTION') || categories.includes('DATA_RETENTION') || categories.includes('DATA_DELETION')) {
    return 'PRIVACY';
  }
  const securityCategories: QuestionCategory[] = [
    'INFORMATION_SECURITY',
    'IDENTITY_AND_ACCESS_MANAGEMENT',
    'PRIVILEGED_ACCESS',
    'NETWORK_SECURITY',
    'CLOUD_SECURITY',
    'VULNERABILITY_MANAGEMENT',
    'INCIDENT_RESPONSE',
    'ENCRYPTION',
    'KEY_MANAGEMENT',
    'LOGGING_AND_MONITORING',
    'SECURE_DEVELOPMENT',
    'ASSET_MANAGEMENT',
    'THIRD_PARTY_RISK',
    'PHYSICAL_SECURITY',
    'HUMAN_RESOURCES_SECURITY',
    'BUSINESS_CONTINUITY',
    'DISASTER_RECOVERY'
  ];
  if (categories.some(c => securityCategories.includes(c))) return 'SECURITY';
  return 'GENERAL';
}

/** Categories whose answers are material and therefore require human review. */
export const MATERIAL_REVIEW_REQUIRED_CLASSES: MaterialClaimClass[] = [
  'SECURITY',
  'PRIVACY',
  'REGULATORY',
  'CERTIFICATION',
  'CONTRACTUAL'
];

/** Splits a question into independently answerable claims. */
export function splitIntoClaims(text: string): string[] {
  const value = normalizeText(text);
  if (value.length === 0) return [];

  // Explicit enumerations: 1) ... 2) ... or a) ... b) ...
  const enumerated = value.split(/(?=\b(?:[0-9]{1,2}|[a-h])[).]\s)/);
  if (enumerated.length > 1 && enumerated.slice(1).every(part => /^([0-9]{1,2}|[a-h])[).]\s/.test(part))) {
    return enumerated.map(p => normalizeText(p)).filter(Boolean);
  }

  // Semicolon-separated compound requirements.
  if (/;\s+\S/.test(value)) {
    const parts = value
      .split(/;\s+/)
      .map(p => normalizeText(p))
      .filter(p => p.split(' ').length >= 3);
    if (parts.length > 1) return parts;
  }

  // Conjunction between two independent clauses.
  const conjunction = value.split(
    /\s+(?:and|&)\s+(?=(?:do|does|is|are|have|has|can|will|must|shall|you|your|the organization|all|any|whether)\b)/i
  );
  if (conjunction.length > 1) {
    const parts = conjunction.map(p => normalizeText(p)).filter(p => p.split(' ').length >= 4);
    if (parts.length > 1) return parts;
  }

  return [value];
}

function scoreCategories(text: string): Array<{ category: QuestionCategory; score: number }> {
  const scores: Array<{ category: QuestionCategory; score: number }> = [];
  for (const rule of CATEGORY_RULES) {
    const matches = text.match(new RegExp(rule.keywords.source, 'gi'));
    if (!matches) continue;
    // Distinct matched terms weigh more than repeated hits of one word.
    const distinct = new Set(matches.map(m => m.toLowerCase()));
    const score = distinct.size * 10 + Math.min(matches.length, 5);
    scores.push({ category: rule.category, score });
  }
  return scores.sort((a, b) => b.score - a.score);
}

function ruleFor(category: QuestionCategory): CategoryRule | undefined {
  return CATEGORY_RULES.find(r => r.category === category);
}

/**
 * Builds a stable knowledge key so semantically equivalent questions can share
 * an approved answer while each keeps its own original wording and mapping.
 */
export function buildKnowledgeKey(text: string, category: QuestionCategory): string {
  const normalized = normalizeForMatching(text);
  return `${category}::${normalized}`;
}

/** Jaccard similarity of normalized token sets. */
export function textSimilarity(a: string, b: string): number {
  const tokensA = new Set(normalizeForMatching(a).split(' ').filter(t => t.length > 2));
  const tokensB = new Set(normalizeForMatching(b).split(' ').filter(t => t.length > 2));
  if (tokensA.size === 0 || tokensB.size === 0) return 0;
  let intersection = 0;
  for (const token of tokensA) {
    if (tokensB.has(token)) intersection++;
  }
  const union = tokensA.size + tokensB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

export class QuestionClassifierService {
  /**
   * Classifies one extracted question into a RequirementAnalysis.
   * Never invents framework mappings: mappings are derived from the canonical
   * control library that actually exists in the tenant's SKANDA instance.
   */
  public classify(params: {
    tenantId: string;
    questionnaireId: string;
    question: ExtractedQuestion;
  }): RequirementAnalysis {
    const { question } = params;
    const text = normalizeText(question.originalText);
    const haystack = `${text} ${question.instructions || ''} ${question.evidenceRequirement || ''}`;

    const scored = scoreCategories(haystack);
    const primaryCategory: QuestionCategory = scored.length > 0 ? scored[0].category : 'ORGANIZATIONAL_INFORMATION';
    const threshold = scored.length > 0 ? Math.max(8, scored[0].score * 0.45) : 0;
    const secondaryCategories = scored
      .slice(1)
      .filter(s => s.score >= threshold)
      .slice(0, 3)
      .map(s => s.category);

    const primaryRule = ruleFor(primaryCategory);
    const relevantControlCategories = new Set<string>();
    for (const cat of [primaryCategory, ...secondaryCategories]) {
      const rule = ruleFor(cat);
      if (rule) rule.controlCategories.forEach(c => relevantControlCategories.add(c));
    }

    // Reuse the canonical control library for real control + framework mapping.
    const allDefinitions = controlTestingService.getAllControlDefinitions();
    const matchedDefinitions = allDefinitions.filter(def =>
      relevantControlCategories.has(String(def.category).toUpperCase())
    );

    const frameworkMap = new Map<string, { frameworkCode: string; requirementCode: string; label: string }>();
    for (const def of matchedDefinitions) {
      for (const mapping of def.frameworkMappings || []) {
        const key = `${mapping.frameworkCode}::${mapping.requirementCode}`;
        if (!frameworkMap.has(key)) {
          frameworkMap.set(key, {
            frameworkCode: mapping.frameworkCode,
            requirementCode: mapping.requirementCode,
            label: `${mapping.frameworkCode} ${mapping.requirementCode} (${mapping.mappingType})`
          });
        }
      }
    }

    // Cap the control list so a question never claims more than a reviewable set.
    const relevantControlCodes = matchedDefinitions.slice(0, 6).map(d => d.code);

    const claimTexts = splitIntoClaims(text);
    const isMultiPart = claimTexts.length > 1;
    const claims: AnswerableClaim[] = claimTexts.map((claimText, index) => {
      const claimScores = scoreCategories(claimText);
      const claimCategory = claimScores.length > 0 ? claimScores[0].category : primaryCategory;
      const claimRule = ruleFor(claimCategory);
      return {
        claimId: `${question.id}-C${index + 1}`,
        claimText,
        category: claimCategory,
        requiresOwnerConfirmation:
          claimCategory === 'ORGANIZATIONAL_INFORMATION' || claimCategory === 'REGULATORY_COMPLIANCE',
        specialistRole: claimRule?.specialistRole
      };
    });

    const normalizedInterpretation = this.normalizeInterpretation(text, primaryCategory);
    const expectedResponseType: QuestionResponseType = question.responseType;
    const specialistApprovalRequired = SPECIALIST_APPROVAL_CATEGORIES.includes(primaryCategory);
    const clarificationNeeded = this.needsClarification(text, primaryCategory, isMultiPart);

    let classificationConfidence = 55;
    if (scored.length > 0) classificationConfidence += Math.min(25, scored[0].score);
    if (isMultiPart) classificationConfidence -= 5;
    if (clarificationNeeded) classificationConfidence -= 15;
    if (!question.questionIdentifier) classificationConfidence -= 3;
    if (question.confidenceBand === 'LOW' || question.confidenceBand === 'UNREADABLE') classificationConfidence -= 15;
    classificationConfidence = Math.max(0, Math.min(100, classificationConfidence));

    const requiredEvidenceKinds = new Set<string>();
    for (const cat of [primaryCategory, ...secondaryCategories]) {
      ruleFor(cat)?.evidenceKinds.forEach(k => requiredEvidenceKinds.add(k));
    }
    if (question.evidenceRequirement) requiredEvidenceKinds.add(question.evidenceRequirement);

    return {
      id: `${question.id}-REQ`,
      questionnaireId: params.questionnaireId,
      questionId: question.id,
      tenantId: params.tenantId,
      originalWording: question.originalText,
      normalizedInterpretation,
      primaryCategory,
      secondaryCategories,
      underlyingRequirement: this.derivedRequirement(text, primaryCategory),
      expectedResponseType,
      frameworkMappings: Array.from(frameworkMap.values()).slice(0, 10),
      relevantControlCodes,
      requiredEvidenceKinds: Array.from(requiredEvidenceKinds),
      applicabilityConditions: this.applicabilityConditions(haystack),
      isMultiPart,
      claims,
      clarificationNeeded,
      clarificationReason: clarificationNeeded
        ? 'The wording is ambiguous or references context that is not present in the questionnaire; confirm the intended requirement with the requester or an internal specialist.'
        : undefined,
      specialistApprovalRequired,
      specialistRole: specialistApprovalRequired ? primaryRule?.specialistRole : undefined,
      classificationConfidence,
      classificationMethod:
        'Deterministic keyword taxonomy scoring against 25 security/privacy domains, cross-referenced with the tenant canonical control library for framework mappings. Score is a heuristic estimate, not a probability.',
      knowledgeKey: buildKnowledgeKey(normalizedInterpretation, primaryCategory)
    };
  }

  public classifyAll(params: {
    tenantId: string;
    questionnaireId: string;
    questions: ExtractedQuestion[];
  }): RequirementAnalysis[] {
    return params.questions.map(question =>
      this.classify({ tenantId: params.tenantId, questionnaireId: params.questionnaireId, question })
    );
  }

  /** Default reviewer role for a requirement, used for routing. */
  public requiredReviewerRole(analysis: RequirementAnalysis): string {
    if (analysis.specialistRole) return analysis.specialistRole;
    return ruleFor(analysis.primaryCategory)?.specialistRole || 'CONTROL_OWNER';
  }

  private normalizeInterpretation(text: string, category: QuestionCategory): string {
    const stripped = text
      .replace(/^[^A-Za-z0-9]+/, '')
      .replace(/\s+/g, ' ')
      .trim();
    return `Requirement: ${this.derivedRequirement(stripped, category)}`;
  }

  private derivedRequirement(text: string, category: QuestionCategory): string {
    const objective = text
      .replace(/\?+\s*$/, '')
      .replace(/^\s*(?:do|does|did|is|are|has|have|can|will)\s+(?:you|your|the\s+organization|the\s+company|your\s+organization)\s+/i, '')
      .replace(/^\s*(?:please\s+)?(?:describe|explain|list|provide|outline|summari[sz]e|state|confirm|indicate)\s+/i, '')
      .trim();
    const prefix = category.replace(/_/g, ' ').toLowerCase();
    return `${prefix}: ${objective || text}`;
  }

  private applicabilityConditions(haystack: string): string[] {
    const conditions: string[] = [];
    if (/\b(if applicable|where applicable|as applicable|if any|if relevant)\b/i.test(haystack)) {
      conditions.push('The question itself is conditioned by "if applicable" wording.');
    }
    if (/\b(production|prod\b)/i.test(haystack)) conditions.push('Scoped to production environments.');
    if (/\b(third[- ]part(?:y|ies)|vendor|subprocessor)\b/i.test(haystack)) {
      conditions.push('Applies to third-party / subprocessor relationships.');
    }
    if (/\b(all|100%|every|entire)\b/i.test(haystack)) {
      conditions.push('The question asserts universal coverage ("all/every"); evidence must cover the full population.');
    }
    return conditions;
  }

  private needsClarification(text: string, category: QuestionCategory, isMultiPart: boolean): boolean {
    if (text.length < 12) return true;
    if (category === 'ORGANIZATIONAL_INFORMATION' && /\b(they|them|it|that|those)\b/i.test(text)) return true;
    if (/^\s*(?:and|or|also)\b/i.test(text)) return true;
    if (isMultiPart && text.split(' ').length > 60) return true;
    return false;
  }
}

export const questionClassifierService = new QuestionClassifierService();
