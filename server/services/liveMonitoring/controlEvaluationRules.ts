// ============================================================================
// SKANDA LIVE MONITORING: DETERMINISTIC CONTROL EVALUATION RULES
// Path: server/services/liveMonitoring/controlEvaluationRules.ts
//
// Compliance decisions are made here, deterministically, from observed facts
// and a versioned rule. AI may explain or recommend, but never decides.
//
// Status semantics (identical to src/types/liveMonitoringTypes.ts):
//   COMPLIANT            the rule evaluated true against current observed facts
//   NON_COMPLIANT        the rule evaluated false against current observed facts
//   PARTIALLY_COMPLIANT  the requirement is met for part of the required scope
//   UNKNOWN              the state cannot be established (missing/unreadable data)
//   NOT_APPLICABLE       the applicability engine excluded this control
//   NOT_EVALUATED        no evaluation has been attempted
//   STALE                the last successful observation is older than policy
//
// Hard rules: missing data is UNKNOWN, never COMPLIANT; an unreachable provider
// is a monitoring failure, never a control failure; an inapplicable control is
// never reported as a failure; a non-point-in-time rule cannot be satisfied by
// a single observation without reconciliation.
// ============================================================================

import {
  ControlComplianceStatus,
  ControlMonitoringState,
  EvaluationOperator,
  EvaluationRuleDefinition,
  MonitoringFreshness,
  SecuritySignal
} from '../../../src/types/liveMonitoringTypes';

// ---------------------------------------------------------------------------
// RULE REGISTRY (versioned; changing a rule requires a version bump)
// ---------------------------------------------------------------------------

export const CONTROL_EVALUATION_RULES: EvaluationRuleDefinition[] = [
  // ------------------------------- GITHUB ---------------------------------
  {
    id: 'RULE-GH-MFA-ENFORCEMENT',
    version: '1.0.0',
    name: 'GitHub organization enforces two-factor authentication',
    description:
      'Every member of the GitHub organization must have two-factor authentication enabled and enforced by the organization.',
    appliesToSignalType: 'REPOSITORY_MFA_ENFORCEMENT',
    controlId: 'CTRL-ISO-A5.17-GH',
    controlCode: 'A.5.17',
    frameworkCodes: ['ISO27001:2022', 'SOC2'],
    factPath: 'observedState',
    operator: 'IS_TRUE',
    expectedCondition: 'Organization-level two-factor authentication requirement is enabled.',
    failureExplanation: 'The GitHub organization does not require two-factor authentication for all members.',
    remediationGuidance:
      'Enable the organization two-factor authentication requirement, then require affected members to enrol before their next sign-in.',
    failureSeverity: 'HIGH',
    pointInTimeObservation: false,
    slaDays: 7
  },
  {
    id: 'RULE-GH-BRANCH-PROTECTION',
    version: '1.0.0',
    name: 'Default branch is protected with review enforcement',
    description:
      'The default branch of an in-scope repository must be protected, require at least one approving review, and dismiss stale approvals.',
    appliesToSignalType: 'REPOSITORY_BRANCH_PROTECTION',
    controlId: 'CTRL-ISO-A8.32-CHANGE',
    controlCode: 'A.8.32',
    frameworkCodes: ['ISO27001:2022', 'SOC2'],
    factPath: 'observedState',
    operator: 'CONTAINS_ALL',
    expected: ['PROTECTED', 'REQUIRED_REVIEW_1', 'DISMISS_STALE_APPROVALS'],
    expectedCondition:
      'Protection enabled, at least one required approving review, and stale approvals dismissed on the default branch.',
    failureExplanation: 'Default branch protection does not enforce the required review controls.',
    remediationGuidance:
      'Enable branch protection on the default branch with a minimum of one approving review and stale-approval dismissal.',
    failureSeverity: 'HIGH',
    pointInTimeObservation: false
  },
  {
    id: 'RULE-GH-SECRET-SCANNING',
    version: '1.0.0',
    name: 'Secret scanning and push protection are enabled',
    description: 'Committed credentials must be detected by secret scanning with push protection blocking new secrets.',
    appliesToSignalType: 'REPOSITORY_SECRET_SCANNING',
    controlId: 'CTRL-ISO-A8.28-SECDEV',
    controlCode: 'A.8.28',
    frameworkCodes: ['ISO27001:2022', 'SOC2'],
    factPath: 'observedState',
    operator: 'CONTAINS_ALL',
    expected: ['SECRET_SCANNING_ENABLED', 'PUSH_PROTECTION_ENABLED'],
    expectedCondition: 'Secret scanning enabled and push protection enabled.',
    failureExplanation: 'Secret scanning or push protection is disabled for the repository.',
    remediationGuidance: 'Enable secret scanning and push protection in the repository security settings.',
    failureSeverity: 'MEDIUM',
    pointInTimeObservation: false
  },
  {
    id: 'RULE-GH-CODE-OWNERSHIP',
    version: '1.0.0',
    name: 'Code ownership is defined and enforced',
    description: 'An in-scope repository must define code owners and require code owner review.',
    appliesToSignalType: 'REPOSITORY_CODE_OWNERSHIP',
    controlId: 'CTRL-ISO-A8.32-OWNERSHIP',
    controlCode: 'A.8.32',
    frameworkCodes: ['ISO27001:2022'],
    factPath: 'observedState',
    operator: 'CONTAINS_ALL',
    expected: ['CODEOWNERS_PRESENT', 'CODEOWNER_REVIEW_REQUIRED'],
    expectedCondition: 'A CODEOWNERS file exists and code owner review is required.',
    failureExplanation: 'Code ownership is missing or not enforced.',
    remediationGuidance: 'Add a CODEOWNERS file and enable "Require review from Code Owners" on the default branch.',
    failureSeverity: 'MEDIUM',
    pointInTimeObservation: false
  },
  {
    id: 'RULE-GH-VULNERABILITY-ALERTS',
    version: '1.0.0',
    name: 'Dependency vulnerability alerts are enabled',
    description: 'Dependabot or equivalent vulnerability alerting must be enabled for in-scope repositories.',
    appliesToSignalType: 'VULNERABILITY_FINDING',
    controlId: 'CTRL-ISO-A8.8-VULN',
    controlCode: 'A.8.8',
    frameworkCodes: ['ISO27001:2022', 'SOC2'],
    factPath: 'observedState',
    operator: 'IS_NOT_EMPTY',
    expectedCondition: 'Vulnerability alerts are configured and reporting current state.',
    failureExplanation: 'No vulnerability alerting configuration was observed for the repository.',
    remediationGuidance: 'Enable dependency vulnerability alerts and configure a triage owner.',
    failureSeverity: 'MEDIUM',
    pointInTimeObservation: false
  },

  // --------------------------- IDENTITY PROVIDERS -------------------------
  {
    id: 'RULE-IDP-MFA-ENFORCEMENT',
    version: '1.0.0',
    name: 'Multi-factor authentication is enforced for all users',
    description: 'Every in-scope identity must have MFA enforced by policy, not merely registered.',
    appliesToSignalType: 'IDENTITY_MFA_STATE',
    controlId: 'CTRL-ISO-A8.5-AUTH',
    controlCode: 'A.8.5',
    frameworkCodes: ['ISO27001:2022', 'SOC2', 'MAS-TRM'],
    factPath: 'observedState',
    operator: 'IS_TRUE',
    expectedCondition: 'MFA enforcement is enabled for the identity population in scope.',
    failureExplanation: 'MFA enforcement is disabled, so passwords alone can authenticate.',
    remediationGuidance: 'Enable the conditional-access or authentication policy that enforces MFA.',
    failureSeverity: 'CRITICAL',
    pointInTimeObservation: false,
    slaDays: 1
  },
  {
    id: 'RULE-IDP-PRIVILEGED-ROLES',
    version: '1.0.0',
    name: 'Privileged role assignments are bounded',
    description: 'Standing privileged role assignments must stay within the approved ceiling; extra grants are non-compliant.',
    appliesToSignalType: 'IDENTITY_PRIVILEGED_ROLE_GRANT',
    controlId: 'CTRL-ISO-A8.2-PRIV',
    controlCode: 'A.8.2',
    frameworkCodes: ['ISO27001:2022', 'MAS-TRM'],
    factPath: 'observedState',
    operator: 'LESS_OR_EQUAL',
    expected: 2,
    expectedCondition: 'No more than 2 standing privileged role assignments per identity.',
    failureExplanation: 'Standing privileged role assignments exceed the approved ceiling.',
    remediationGuidance: 'Move excess assignments to just-in-time elevation and record the approval.',
    failureSeverity: 'HIGH',
    pointInTimeObservation: false
  },
  {
    id: 'RULE-IDP-STALE-ACCOUNTS',
    version: '1.0.0',
    name: 'Dormant identities are disabled',
    description: 'Accounts with no successful sign-in for the dormancy window must be disabled.',
    appliesToSignalType: 'IDENTITY_STALE_ACCOUNT',
    controlId: 'CTRL-ISO-A5.18-LIFECYCLE',
    controlCode: 'A.5.18',
    frameworkCodes: ['ISO27001:2022'],
    factPath: 'observedState',
    operator: 'IS_FALSE',
    expectedCondition: 'The identity is not dormant (sign-in activity within the configured window).',
    failureExplanation: 'A dormant identity remains enabled.',
    remediationGuidance: 'Disable or remove the dormant account after owner confirmation.',
    failureSeverity: 'MEDIUM',
    pointInTimeObservation: true,
    slaDays: 30
  },

  // ------------------------------- CLOUD ----------------------------------
  {
    id: 'RULE-CLOUD-STORAGE-ENCRYPTION',
    version: '1.0.0',
    name: 'Storage is encrypted at rest',
    description: 'In-scope object storage must have encryption at rest enabled.',
    appliesToSignalType: 'CLOUD_STORAGE_ENCRYPTION',
    controlId: 'CTRL-ISO-A8.24-CRYPTO',
    controlCode: 'A.8.24',
    frameworkCodes: ['ISO27001:2022', 'MAS-TRM'],
    factPath: 'observedState',
    operator: 'IS_TRUE',
    expectedCondition: 'Server-side encryption is enabled for the storage resource.',
    failureExplanation: 'The storage resource does not have encryption at rest enabled.',
    remediationGuidance: 'Enable default encryption on the bucket/container and verify with a re-collection.',
    failureSeverity: 'HIGH',
    pointInTimeObservation: false
  },
  {
    id: 'RULE-CLOUD-PUBLIC-EXPOSURE',
    version: '1.0.0',
    name: 'Storage is not publicly accessible',
    description: 'In-scope storage must not permit anonymous public access.',
    appliesToSignalType: 'CLOUD_PUBLIC_EXPOSURE',
    controlId: 'CTRL-ISO-A8.20-NETWORK',
    controlCode: 'A.8.20',
    frameworkCodes: ['ISO27001:2022', 'SOC2'],
    factPath: 'observedState',
    operator: 'IS_FALSE',
    expectedCondition: 'Public/anonymous access is disabled.',
    failureExplanation: 'The storage resource permits public access.',
    remediationGuidance: 'Apply the public-access block and review data exposure.',
    failureSeverity: 'CRITICAL',
    pointInTimeObservation: false
  }
];

export function getRule(ruleId: string): EvaluationRuleDefinition | null {
  return CONTROL_EVALUATION_RULES.find(rule => rule.id === ruleId) || null;
}

export function getRulesForSignalType(signalType: SecuritySignal['signalType']): EvaluationRuleDefinition[] {
  return CONTROL_EVALUATION_RULES.filter(rule => rule.appliesToSignalType === signalType);
}

export function getRuleForControl(controlId: string): EvaluationRuleDefinition | null {
  return CONTROL_EVALUATION_RULES.find(rule => rule.controlId === controlId) || null;
}

// ---------------------------------------------------------------------------
// EVALUATION
// ---------------------------------------------------------------------------

export interface RuleEvaluation {
  ruleId: string;
  ruleVersion: string;
  controlId: string;
  controlCode: string;
  result: ControlComplianceStatus;
  observedFacts: Record<string, unknown>;
  expectedCondition: string;
  actualCondition: string;
  reason: string;
  failureExplanation?: string;
  remediationGuidance?: string;
}

function readFact(signal: SecuritySignal, factPath: string): unknown {
  if (factPath === 'observedState' || factPath === '$') return signal.observedState;
  if (factPath.startsWith('observedState.')) {
    const key = factPath.slice('observedState.'.length);
    const state = signal.observedState;
    if (state && typeof state === 'object' && !Array.isArray(state)) {
      return (state as Record<string, unknown>)[key];
    }
    return undefined;
  }
  return undefined;
}

/**
 * A fact counts as observed when the provider returned a value at all.
 *
 * Deliberately NOT treated as missing data:
 *   - an empty condition list, which is a real observation meaning "none of the
 *     required conditions are present" (a control failure, not an unknown);
 *   - an empty string, which operators such as IS_EMPTY / IS_NOT_EMPTY handle.
 *
 * Only null/undefined mean the provider did not tell us anything, and only then
 * may the outcome be UNKNOWN.
 */
function hasUsableFact(value: unknown): boolean {
  return value !== null && value !== undefined;
}

function applyOperator(rule: EvaluationRuleDefinition, fact: unknown): { satisfied: boolean; partial: boolean; actual: string } {
  const expected = rule.expected;

  switch (rule.operator) {
    case 'IS_TRUE':
      return { satisfied: fact === true, partial: false, actual: `observed ${JSON.stringify(fact)}` };
    case 'IS_FALSE':
      return { satisfied: fact === false, partial: false, actual: `observed ${JSON.stringify(fact)}` };
    case 'EQUALS':
      return { satisfied: fact === expected, partial: false, actual: `observed ${JSON.stringify(fact)}` };
    case 'NOT_EQUALS':
      return { satisfied: fact !== expected, partial: false, actual: `observed ${JSON.stringify(fact)}` };
    case 'GREATER_OR_EQUAL': {
      const value = Number(fact);
      const target = Number(expected);
      return {
        satisfied: Number.isFinite(value) && Number.isFinite(target) && value >= target,
        partial: false,
        actual: `observed ${JSON.stringify(fact)}`
      };
    }
    case 'LESS_OR_EQUAL': {
      const value = Number(fact);
      const target = Number(expected);
      return {
        satisfied: Number.isFinite(value) && Number.isFinite(target) && value <= target,
        partial: false,
        actual: `observed ${JSON.stringify(fact)} (ceiling ${target})`
      };
    }
    case 'CONTAINS_ALL': {
      const observedList = Array.isArray(fact) ? fact.map(String) : [];
      const required = Array.isArray(expected) ? expected.map(String) : [];
      const present = required.filter(item => observedList.includes(item));
      const satisfied = present.length === required.length;
      const partial = !satisfied && present.length > 0;
      return {
        satisfied,
        partial,
        actual: `${present.length}/${required.length} required conditions observed (${present.join(', ') || 'none'})`
      };
    }
    case 'CONTAINS_ANY': {
      const observedList = Array.isArray(fact) ? fact.map(String) : [];
      const required = Array.isArray(expected) ? expected.map(String) : [];
      const present = required.filter(item => observedList.includes(item));
      return { satisfied: present.length > 0, partial: false, actual: `observed ${present.join(', ') || 'none'}` };
    }
    case 'IS_NOT_EMPTY': {
      const satisfied = Array.isArray(fact) ? fact.length > 0 : hasUsableFact(fact);
      return { satisfied, partial: false, actual: Array.isArray(fact) ? `${fact.length} item(s)` : `observed ${JSON.stringify(fact)}` };
    }
    case 'IS_EMPTY': {
      const empty = Array.isArray(fact) ? fact.length === 0 : !hasUsableFact(fact);
      return { satisfied: empty, partial: false, actual: `observed ${JSON.stringify(fact)}` };
    }
    case 'WITHIN_SLA_DAYS': {
      const days = Number(fact);
      const limit = Number(expected);
      return {
        satisfied: Number.isFinite(days) && Number.isFinite(limit) && days <= limit,
        partial: false,
        actual: `age ${JSON.stringify(fact)} days against policy ${limit} days`
      };
    }
    default:
      return { satisfied: false, partial: false, actual: 'unsupported operator' };
  }
}

/**
 * Evaluates one rule against one signal. Deterministic: the same rule version
 * and the same observed facts always produce the same result.
 */
export function evaluateRuleAgainstSignal(rule: EvaluationRuleDefinition, signal: SecuritySignal): RuleEvaluation {
  const fact = readFact(signal, rule.factPath);
  const base = {
    ruleId: rule.id,
    ruleVersion: rule.version,
    controlId: rule.controlId,
    controlCode: rule.controlCode,
    expectedCondition: rule.expectedCondition
  };

  // Missing data must never be reported as compliance.
  if (!hasUsableFact(fact)) {
    return {
      ...base,
      result: 'UNKNOWN',
      observedFacts: { [rule.factPath]: fact ?? null },
      actualCondition: 'no observed value',
      reason:
        'The provider did not return a usable value for the required fact, so the control state cannot be established. ' +
        'Absence of data is recorded as UNKNOWN, never as compliance.'
    };
  }

  if (rule.operator === 'WITHIN_SLA_DAYS' && rule.slaDays === undefined) {
    return {
      ...base,
      result: 'UNKNOWN',
      observedFacts: { [rule.factPath]: fact },
      actualCondition: 'SLA policy not configured',
      reason: 'This rule requires an organization-configured target and none is configured, so no verdict is asserted.'
    };
  }

  const { satisfied, partial, actual } = applyOperator(rule, fact);

  if (satisfied) {
    return {
      ...base,
      result: 'COMPLIANT',
      observedFacts: { [rule.factPath]: fact },
      actualCondition: actual,
      reason: `Rule ${rule.id}@${rule.version} evaluated true against the observed facts.`
    };
  }

  if (partial) {
    return {
      ...base,
      result: 'PARTIALLY_COMPLIANT',
      observedFacts: { [rule.factPath]: fact },
      actualCondition: actual,
      reason: `Only part of the required condition set is satisfied: ${actual}.`,
      failureExplanation: rule.failureExplanation,
      remediationGuidance: rule.remediationGuidance
    };
  }

  return {
    ...base,
    result: 'NON_COMPLIANT',
    observedFacts: { [rule.factPath]: fact },
    actualCondition: actual,
    reason: `Rule ${rule.id}@${rule.version} evaluated false: ${rule.expectedCondition} (${actual}).`,
    failureExplanation: rule.failureExplanation,
    remediationGuidance: rule.remediationGuidance
  };
}

/** Evaluation result when the control's applicability engine excluded it. */
export function buildNotApplicableEvaluation(rule: EvaluationRuleDefinition, reason: string): RuleEvaluation {
  return {
    ruleId: rule.id,
    ruleVersion: rule.version,
    controlId: rule.controlId,
    controlCode: rule.controlCode,
    result: 'NOT_APPLICABLE',
    observedFacts: {},
    expectedCondition: rule.expectedCondition,
    actualCondition: 'not applicable',
    reason
  };
}

// ---------------------------------------------------------------------------
// FRESHNESS POLICY
// ---------------------------------------------------------------------------

/**
 * Freshness is judged per control against its own monitoring policy. Stale data
 * is never presented as current compliance: the presentation rule forces the
 * UI to show the last known state separately, or UNKNOWN when nothing exists.
 */
export function computeFreshness(state: Pick<
  ControlMonitoringState,
  'lastSuccessfulCollectionAt' | 'lastSourceObservationAt' | 'lastEvaluatedAt' | 'expectedCollectionIntervalSeconds' | 'freshnessThresholdSeconds'
>, now: Date = new Date()): MonitoringFreshness {
  const reference = state.lastSuccessfulCollectionAt || state.lastSourceObservationAt;
  const thresholdSeconds = state.freshnessThresholdSeconds || state.expectedCollectionIntervalSeconds * 2 || 3600;

  if (!reference) {
    return {
      lastSuccessfulCollectionAt: state.lastSuccessfulCollectionAt,
      lastSourceObservationAt: state.lastSourceObservationAt,
      lastEvaluatedAt: state.lastEvaluatedAt,
      expectedCollectionIntervalSeconds: state.expectedCollectionIntervalSeconds,
      freshnessThresholdSeconds: thresholdSeconds,
      isStale: true,
      presentationRule: 'UNKNOWN_NO_DATA'
    };
  }

  const ageSeconds = Math.max(0, Math.floor((now.getTime() - Date.parse(reference)) / 1000));
  const isStale = ageSeconds > thresholdSeconds;

  return {
    lastSuccessfulCollectionAt: state.lastSuccessfulCollectionAt,
    lastSourceObservationAt: state.lastSourceObservationAt,
    lastEvaluatedAt: state.lastEvaluatedAt,
    expectedCollectionIntervalSeconds: state.expectedCollectionIntervalSeconds,
    freshnessThresholdSeconds: thresholdSeconds,
    ageSeconds,
    isStale,
    presentationRule: isStale ? 'STALE_SHOW_LAST_KNOWN' : 'CURRENT'
  };
}

/**
 * Applies the freshness policy to a stored status without losing the last known
 * verdict (retained in lastKnownStatus for separate display).
 */
export function applyFreshnessPolicy(
  status: ControlComplianceStatus,
  freshness: MonitoringFreshness
): ControlComplianceStatus {
  if (freshness.presentationRule === 'UNKNOWN_NO_DATA') return 'UNKNOWN';
  if (freshness.isStale && status !== 'NOT_APPLICABLE' && status !== 'UNKNOWN' && status !== 'STALE') return 'STALE';
  return status;
}

// ---------------------------------------------------------------------------
// TRANSITION SEMANTICS
// ---------------------------------------------------------------------------

export type TransitionClassification =
  | 'DRIFT_INTRODUCED'
  | 'RECOVERED'
  | 'DEGRADED'
  | 'STATE_UNKNOWN'
  | 'NO_CHANGE'
  | 'FIRST_OBSERVATION';

/**
 * Classifies a state change. Only meaningful changes create findings or
 * notifications, which is what prevents alert storms from repeated polling.
 */
export function classifyTransition(
  previousStatus: ControlComplianceStatus | null,
  newStatus: ControlComplianceStatus
): TransitionClassification {
  if (previousStatus === null || previousStatus === 'NOT_EVALUATED') return 'FIRST_OBSERVATION';
  if (previousStatus === newStatus) return 'NO_CHANGE';

  const failing: ControlComplianceStatus[] = ['NON_COMPLIANT', 'PARTIALLY_COMPLIANT'];
  const passing: ControlComplianceStatus[] = ['COMPLIANT'];
  const unknown: ControlComplianceStatus[] = ['UNKNOWN', 'STALE'];

  if (passing.includes(previousStatus) && failing.includes(newStatus)) return 'DRIFT_INTRODUCED';
  if (failing.includes(previousStatus) && passing.includes(newStatus)) return 'RECOVERED';
  if (failing.includes(previousStatus) && failing.includes(newStatus)) return 'DEGRADED';
  if (passing.includes(previousStatus) && unknown.includes(newStatus)) return 'STATE_UNKNOWN';
  if (failing.includes(previousStatus) && unknown.includes(newStatus)) return 'STATE_UNKNOWN';
  if (unknown.includes(previousStatus) && passing.includes(newStatus)) return 'RECOVERED';
  if (unknown.includes(previousStatus) && failing.includes(newStatus)) return 'DRIFT_INTRODUCED';
  return 'NO_CHANGE';
}
