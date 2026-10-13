// Skanda Enterprise — Logo Match Lifecycle & Audit Transition Engine
// Governs the 15-stage lifecycle state machine with permission checking,
// immutable audit event logging, mandatory rationale documentation, and analyst overrides.

import {
  LogoMatch,
  LogoMatchLifecycleStatus,
  LogoMatchLifecycleEvent,
  LogoRiskLevel,
  LogoInvestigationCase
} from '../../types/logoMonitoring';

export interface StatusTransitionResult {
  success: boolean;
  error?: string;
  updatedMatch?: LogoMatch;
  newEvent?: LogoMatchLifecycleEvent;
}

export class LogoLifecycleService {
  /**
   * Permitted transition paths for the 15-stage state machine
   */
  private static readonly ALLOWED_TRANSITIONS: Record<LogoMatchLifecycleStatus, LogoMatchLifecycleStatus[]> = {
    DISCOVERED: ['PENDING_ANALYSIS', 'ANALYZED', 'FALSE_POSITIVE', 'ARCHIVED'],
    PENDING_ANALYSIS: ['ANALYZED', 'POTENTIAL_MATCH', 'SUSPECTED_IMPERSONATION', 'FALSE_POSITIVE', 'ARCHIVED'],
    ANALYZED: ['POTENTIAL_MATCH', 'SUSPECTED_IMPERSONATION', 'FALSE_POSITIVE', 'RESOLVED', 'ARCHIVED'],
    POTENTIAL_MATCH: ['SUSPECTED_IMPERSONATION', 'UNDER_INVESTIGATION', 'CONFIRMED_UNAUTHORIZED_USE', 'FALSE_POSITIVE', 'RESOLVED', 'ARCHIVED'],
    SUSPECTED_IMPERSONATION: ['UNDER_INVESTIGATION', 'CONFIRMED_UNAUTHORIZED_USE', 'CONFIRMED_PHISHING', 'FALSE_POSITIVE', 'TAKEDOWN_REQUESTED', 'ARCHIVED'],
    CONFIRMED_UNAUTHORIZED_USE: ['UNDER_INVESTIGATION', 'TAKEDOWN_REQUESTED', 'RESOLVED', 'REOPENED', 'ARCHIVED'],
    CONFIRMED_PHISHING: ['UNDER_INVESTIGATION', 'TAKEDOWN_REQUESTED', 'TAKEDOWN_IN_PROGRESS', 'RESOLVED', 'REOPENED', 'ARCHIVED'],
    FALSE_POSITIVE: ['REOPENED', 'ARCHIVED', 'POTENTIAL_MATCH'],
    UNDER_INVESTIGATION: ['CONFIRMED_UNAUTHORIZED_USE', 'CONFIRMED_PHISHING', 'TAKEDOWN_REQUESTED', 'FALSE_POSITIVE', 'RESOLVED', 'ARCHIVED'],
    TAKEDOWN_REQUESTED: ['TAKEDOWN_IN_PROGRESS', 'REMOVED', 'RESOLVED', 'UNDER_INVESTIGATION', 'ARCHIVED'],
    TAKEDOWN_IN_PROGRESS: ['REMOVED', 'RESOLVED', 'TAKEDOWN_REQUESTED', 'UNDER_INVESTIGATION', 'ARCHIVED'],
    REMOVED: ['RESOLVED', 'REOPENED', 'ARCHIVED'],
    RESOLVED: ['REOPENED', 'ARCHIVED'],
    REOPENED: ['UNDER_INVESTIGATION', 'TAKEDOWN_REQUESTED', 'CONFIRMED_PHISHING', 'FALSE_POSITIVE'],
    ARCHIVED: ['REOPENED']
  };

  /**
   * Evaluates if a proposed status transition is permitted
   */
  public static canTransition(currentStatus: LogoMatchLifecycleStatus, targetStatus: LogoMatchLifecycleStatus): boolean {
    if (currentStatus === targetStatus) return true;
    const allowed = this.ALLOWED_TRANSITIONS[currentStatus] || [];
    return allowed.includes(targetStatus);
  }

  /**
   * Applies an audited status transition to a LogoMatch record
   */
  public static transitionStatus(
    match: LogoMatch,
    targetStatus: LogoMatchLifecycleStatus,
    actor: string,
    actorRole: string,
    reason: string,
    comments?: string
  ): StatusTransitionResult {
    if (!this.canTransition(match.status, targetStatus)) {
      return {
        success: false,
        error: `Illegal state transition from "${match.status}" to "${targetStatus}". Permitted next states: ${(this.ALLOWED_TRANSITIONS[match.status] || []).join(', ')}.`
      };
    }

    if (!reason || reason.trim().length < 5) {
      return {
        success: false,
        error: 'A clear operational reason (at least 5 characters) is required for compliance audit logging.'
      };
    }

    const event: LogoMatchLifecycleEvent = {
      id: `evt_lgo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      fromStatus: match.status,
      toStatus: targetStatus,
      actor,
      actorRole,
      timestamp: new Date().toISOString(),
      reason: reason.trim(),
      comments: comments?.trim()
    };

    const updatedMatch: LogoMatch = {
      ...match,
      status: targetStatus,
      updatedAt: new Date().toISOString(),
      history: [event, ...match.history]
    };

    return {
      success: true,
      updatedMatch,
      newEvent: event
    };
  }

  /**
   * Applies an explainable analyst override to the calculated risk level
   */
  public static overrideRiskScore(
    match: LogoMatch,
    newLevel: LogoRiskLevel,
    actor: string,
    overrideReason: string
  ): LogoMatch {
    const prevLevel = match.riskAssessment.riskLevel;

    return {
      ...match,
      riskAssessment: {
        ...match.riskAssessment,
        riskLevel: newLevel,
        analystOverride: {
          overriddenBy: actor,
          previousLevel: prevLevel,
          newLevel,
          overrideReason,
          overriddenAt: new Date().toISOString()
        }
      },
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Creates an investigation case linked to a LogoMatch
   */
  public static createInvestigationCase(
    match: LogoMatch,
    assignedTo: string,
    summary: string
  ): LogoInvestigationCase {
    const caseNum = `CASE-LGO-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();
    return {
      id: `case_${Date.now()}`,
      tenantId: match.tenantId,
      caseNumber: caseNum,
      logoMatchId: match.id,
      title: `Investigation: ${match.targetDomain} impersonating ${match.brandAssetName}`,
      priority: match.riskAssessment.riskLevel === 'CRITICAL' ? 'CRITICAL' : match.riskAssessment.riskLevel === 'HIGH' ? 'HIGH' : 'MEDIUM',
      status: 'OPEN',
      assignedTo,
      summary,
      associatedDomain: match.targetDomain,
      createdAt: now,
      updatedAt: now
    };
  }
}
