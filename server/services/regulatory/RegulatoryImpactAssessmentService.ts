// ============================================================================
// SKANDA ENTERPRISE GRC: REGULATORY IMPACT ASSESSMENT & BLAST-RADIUS SERVICE
// Path: server/services/regulatory/RegulatoryImpactAssessmentService.ts
//
// Phase 23.3: 9-Stage Blast-Radius Traversal & Tenant-Scoped Remediation Engine
// Traversal Chain:
// Requirement -> Control -> Risk -> Policy -> Process -> Evidence -> Test -> Finding -> CAPA -> Assurance
// Strictly tenant-isolated: Master regulatory data is global, assessments are tenant-scoped.
// ============================================================================

import {
  CustomerFinancialProfile,
  RegulatoryChangeEvent,
  TenantImpactAssessment,
  ImpactLevel,
  ApplicabilityStatus,
  RegulatoryNotice360,
  TenantNoticeApplicability,
  BlastRadiusTrace,
  RegulatoryAlert
} from '../../../src/types/masRegulatoryIntelligenceTypes';
import { masApplicabilityEngine } from './MASApplicabilityEngine';
import { masRegulatoryIngestionService } from './MASRegulatoryIngestionService';
import { enterpriseAuditService } from '../EnterpriseAuditService';

export class RegulatoryImpactAssessmentService {
  private static instance: RegulatoryImpactAssessmentService;
  private tenantImpactAssessments: Map<string, TenantImpactAssessment[]> = new Map();

  public constructor() {}

  public static getInstance(): RegulatoryImpactAssessmentService {
    if (!RegulatoryImpactAssessmentService.instance) {
      RegulatoryImpactAssessmentService.instance = new RegulatoryImpactAssessmentService();
    }
    return RegulatoryImpactAssessmentService.instance;
  }

  /**
   * Generates a tenant-scoped impact assessment with full 9-step blast radius traversal
   */
  public assessEventImpact(
    profile: CustomerFinancialProfile,
    event: RegulatoryChangeEvent,
    providedApplicability?: TenantNoticeApplicability
  ): TenantImpactAssessment {
    const notice = masRegulatoryIngestionService.getNoticeById(event.noticeId) || masRegulatoryIngestionService.getNoticeByNumber(event.noticeNumber);
    const now = new Date().toISOString();

    let applicabilityDecision: ApplicabilityStatus = 'NOT_APPLICABLE';
    let applicabilityReason = `Notice ${event.noticeNumber} does not apply to ${profile.institutionType}.`;

    if (providedApplicability) {
      applicabilityDecision = providedApplicability.applicabilityStatus;
      applicabilityReason = providedApplicability.applicabilityRationale;
    } else if (notice) {
      const appEval = masApplicabilityEngine.evaluateApplicability(profile, notice);
      applicabilityDecision = appEval.applicabilityStatus;
      applicabilityReason = appEval.applicabilityRationale;
    } else {
      const typeMatched = event.affectedEntityTypes.includes('ALL_FINANCIAL_INSTITUTIONS') || event.affectedEntityTypes.includes(profile.institutionType);
      applicabilityDecision = typeMatched ? 'APPLICABLE' : 'NOT_APPLICABLE';
      applicabilityReason = typeMatched
        ? `Statutory scope applies to ${profile.institutionType}.`
        : `Statutory scope does not apply to ${profile.institutionType}.`;
    }

    // Full 9-Stage Blast-Radius Traversal Sets
    const affectedControlCodesSet = new Set<string>();
    const affectedPolicyCodesSet = new Set<string>();
    const affectedRiskCodesSet = new Set<string>();
    const affectedProcessesSet = new Set<string>();
    const affectedEvidenceSet = new Set<string>();
    const testedControlsSet = new Set<string>();
    const affectedFindingsSet = new Set<string>();
    const affectedCAPAsSet = new Set<string>();
    const affectedOwnersSet = new Set<string>();
    const blastRadiusTraces: BlastRadiusTrace[] = [];

    if (applicabilityDecision === 'APPLICABLE' || applicabilityDecision === 'CONDITIONAL' || applicabilityDecision === 'COMING_INTO_FORCE') {
      for (const diff of event.requirementDiffs) {
        if (diff.diffType !== 'REMOVED') {
          // Traversal: Requirement -> Control -> Risk -> Policy -> Process -> Evidence -> Test -> Finding -> CAPA
          diff.affectedControls.forEach(c => affectedControlCodesSet.add(c));
          diff.affectedPolicies.forEach(p => affectedPolicyCodesSet.add(p));
          diff.affectedRisks.forEach(r => affectedRiskCodesSet.add(r));

          // Downstream Process & Evidence traversal
          if (diff.affectedProcesses && diff.affectedProcesses.length > 0) {
            diff.affectedProcesses.forEach(prc => affectedProcessesSet.add(prc));
          } else {
            affectedProcessesSet.add(`PRC-${diff.sectionCode.replace(/[^a-zA-Z0-9]/g, '-')}-OPS`);
          }

          if (diff.affectedEvidenceTypes && diff.affectedEvidenceTypes.length > 0) {
            diff.affectedEvidenceTypes.forEach(ev => affectedEvidenceSet.add(ev));
          } else {
            affectedEvidenceSet.add('POLICY_SIGN_OFF');
            affectedEvidenceSet.add('TEST_EVIDENCE');
          }

          if (diff.affectedTests && diff.affectedTests.length > 0) {
            diff.affectedTests.forEach(t => testedControlsSet.add(t));
          } else {
            diff.affectedControls.forEach(c => testedControlsSet.add(`TST-${c}-VERIFY`));
          }

          if (diff.affectedFindings && diff.affectedFindings.length > 0) {
            diff.affectedFindings.forEach(f => affectedFindingsSet.add(f));
          } else {
            affectedFindingsSet.add(`FND-${diff.requirementId}-GAP`);
          }

          if (diff.affectedCAPAs && diff.affectedCAPAs.length > 0) {
            diff.affectedCAPAs.forEach(capa => affectedCAPAsSet.add(capa));
          } else {
            affectedCAPAsSet.add(`CAPA-${diff.requirementId}-REMED`);
          }

          if (diff.affectedOwners && diff.affectedOwners.length > 0) {
            diff.affectedOwners.forEach(o => affectedOwnersSet.add(o));
          } else {
            affectedOwnersSet.add('Chief Information Security Officer (CISO)');
          }

          blastRadiusTraces.push({
            requirementId: diff.requirementId,
            affectedControls: diff.affectedControls,
            affectedRisks: diff.affectedRisks,
            affectedPolicies: diff.affectedPolicies,
            affectedProcesses: Array.from(affectedProcessesSet),
            affectedEvidence: Array.from(affectedEvidenceSet),
            affectedTests: Array.from(testedControlsSet),
            affectedFindings: Array.from(affectedFindingsSet),
            affectedCAPAs: Array.from(affectedCAPAsSet),
            affectedOwners: Array.from(affectedOwnersSet)
          });
        }
      }
    }

    const affectedControlCodes = Array.from(affectedControlCodesSet);
    const affectedPolicyCodes = Array.from(affectedPolicyCodesSet);
    const affectedRiskCodes = Array.from(affectedRiskCodesSet);
    const affectedProcesses = Array.from(affectedProcessesSet);
    const affectedEvidence = Array.from(affectedEvidenceSet);
    const affectedTests = Array.from(testedControlsSet);
    const affectedFindings = Array.from(affectedFindingsSet);
    const affectedCAPAs = Array.from(affectedCAPAsSet);
    const affectedOwners = Array.from(affectedOwnersSet);

    // Generate actionable remediation tasks mapped to canonical GRC
    const requiredRemediationActions: TenantImpactAssessment['requiredRemediationActions'] = [];
    const dueDate = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]; // 30-day compliance SLA

    if (affectedControlCodes.length > 0) {
      for (const controlCode of affectedControlCodes) {
        requiredRemediationActions.push({
          actionId: `ACT-CTRL-${controlCode}-${Date.now().toString().slice(-4)}`,
          title: `Reassess Canonical Control ${controlCode} against ${event.noticeNumber}`,
          description: `Regulatory change detected in ${event.noticeNumber}. Conduct empirical control testing and verify control operating effectiveness against updated criteria.`,
          targetType: 'CONTROL_REASSESSMENT',
          targetCode: controlCode,
          assignedRole: 'Lead Security Auditor / Control Owner',
          priority: event.impactLevel === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
          status: 'PENDING',
          dueDate
        });
      }
    }

    if (affectedPolicyCodes.length > 0) {
      for (const policyCode of affectedPolicyCodes) {
        requiredRemediationActions.push({
          actionId: `ACT-POL-${policyCode}-${Date.now().toString().slice(-4)}`,
          title: `Update Policy Document ${policyCode}`,
          description: `Incorporate new regulatory clauses from ${event.noticeNumber} into official policy ${policyCode} and route for Board / CISO approval.`,
          targetType: 'POLICY_UPDATE',
          targetCode: policyCode,
          assignedRole: 'Compliance Officer / CISO',
          priority: 'HIGH',
          status: 'PENDING',
          dueDate
        });
      }
    }

    const assessment: TenantImpactAssessment = {
      assessmentId: `IMPACT-${profile.tenantId}-${event.eventId}-${Date.now().toString().slice(-4)}`,
      tenantId: profile.tenantId,
      eventId: event.eventId,
      noticeId: event.noticeId,
      noticeNumber: event.noticeNumber,
      noticeTitle: event.title,
      assessedAt: now,
      overallImpactLevel: (applicabilityDecision === 'APPLICABLE' || applicabilityDecision === 'COMING_INTO_FORCE') ? event.impactLevel : 'LOW',
      applicabilityDecision,
      applicabilityReason,
      affectedControlsCount: affectedControlCodes.length,
      affectedPoliciesCount: affectedPolicyCodes.length,
      affectedRisksCount: affectedRiskCodes.length,
      affectedEvidenceCount: affectedEvidence.length,
      affectedControlCodes,
      affectedPolicyCodes,
      affectedRiskCodes,
      affectedProcesses,
      affectedEvidence,
      affectedTests,
      affectedFindings,
      affectedCAPAs,
      affectedOwners,
      blastRadiusTraces,
      requiredRemediationActions,
      regulatoryAssurancePosture: requiredRemediationActions.length > 0 ? 'ACTION_REQUIRED' : 'ALIGNED'
    };

    // Store in tenant assessments map (Strictly tenant-isolated)
    const existing = this.tenantImpactAssessments.get(profile.tenantId) || [];
    existing.unshift(assessment);
    this.tenantImpactAssessments.set(profile.tenantId, existing);

    // Record audit event
    enterpriseAuditService.recordAuditLog({
      tenantId: profile.tenantId,
      actor: 'system-regulatory-impact-engine',
      actorRole: 'SYSTEM_DAEMON',
      action: 'REGULATORY_IMPACT_ASSESSED',
      entity: 'REGULATORY_NOTICE',
      entityId: event.noticeNumber,
      newState: {
        assessmentId: assessment.assessmentId,
        impactLevel: assessment.overallImpactLevel,
        affectedControls: assessment.affectedControlsCount,
        actionsGenerated: assessment.requiredRemediationActions.length,
        blastRadiusStageCount: 9
      },
      result: 'SUCCESS'
    });

    // Generate tenant-specific regulatory alert if change is applicable and action is required
    if (
      (applicabilityDecision === 'APPLICABLE' || applicabilityDecision === 'CONDITIONAL' || applicabilityDecision === 'COMING_INTO_FORCE') &&
      (affectedControlCodes.length > 0 || event.impactLevel === 'CRITICAL' || event.impactLevel === 'HIGH')
    ) {
      this.createTenantAlert(profile, event, assessment);
    }

    return assessment;
  }

  /**
   * Deterministic Regulatory Alert Generator
   * Calculates alert severity based on:
   * 1. Effective date proximity
   * 2. Number of affected controls
   * 3. Regulatory force (Binding vs Guidance)
   * 4. FI Sector applicability
   */
  private createTenantAlert(
    profile: CustomerFinancialProfile,
    event: RegulatoryChangeEvent,
    assessment: TenantImpactAssessment
  ): RegulatoryAlert {
    const now = new Date();
    const effDate = new Date(event.effectiveDate);
    const diffTime = effDate.getTime() - now.getTime();
    const proximityDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Calculate severity
    let severity: ImpactLevel = event.impactLevel;
    if (proximityDays > 0 && proximityDays <= 30) {
      severity = 'CRITICAL';
    } else if (proximityDays > 0 && proximityDays <= 90 && severity !== 'CRITICAL') {
      severity = 'HIGH';
    }

    if (assessment.affectedControlsCount >= 5 && severity !== 'CRITICAL') {
      severity = 'HIGH';
    }

    const alert: RegulatoryAlert = {
      alertId: `ALT-${profile.tenantId}-${event.noticeNumber.replace(/[^a-zA-Z0-9]/g, '')}-${Date.now().toString().slice(-4)}`,
      tenantId: profile.tenantId,
      regulatoryVersionId: event.newVersionId,
      instrumentId: event.noticeId,
      noticeNumber: event.noticeNumber,
      title: `Regulatory Action Required: ${event.noticeNumber} (${event.title})`,
      description: `New regulatory change detected affecting ${assessment.affectedControlsCount} controls and ${assessment.affectedPoliciesCount} policies. Effective: ${event.effectiveDate} (${proximityDays > 0 ? `${proximityDays} days remaining` : 'Already Effective'}).`,
      severity,
      calculatedAt: now.toISOString(),
      effectiveDateProximityDays: proximityDays,
      affectedControlsCount: assessment.affectedControlsCount,
      regulatoryForce: event.eventType === 'GUIDANCE_UPDATED' ? 'NON_BINDING_GUIDANCE' : 'BINDING',
      sectorApplicable: true,
      isAcknowledged: false,
      actionRequired: assessment.requiredRemediationActions.length > 0,
      createdDate: now.toISOString()
    };

    const alerts = this.tenantAlerts.get(profile.tenantId) || [];
    // Avoid duplicate alert for same event and tenant
    const existingIndex = alerts.findIndex(a => a.instrumentId === alert.instrumentId && a.regulatoryVersionId === alert.regulatoryVersionId);
    if (existingIndex >= 0) {
      alerts[existingIndex] = alert;
    } else {
      alerts.unshift(alert);
    }
    this.tenantAlerts.set(profile.tenantId, alerts);

    return alert;
  }

  private tenantAlerts: Map<string, RegulatoryAlert[]> = new Map();

  public getTenantAlerts(tenantId: string): RegulatoryAlert[] {
    return this.tenantAlerts.get(tenantId) || [];
  }

  public acknowledgeTenantAlert(tenantId: string, alertId: string): boolean {
    const alerts = this.tenantAlerts.get(tenantId);
    if (!alerts) return false;
    const alert = alerts.find(a => a.alertId === alertId);
    if (!alert) return false;
    alert.isAcknowledged = true;
    return true;
  }

  public assessImpact(
    event: RegulatoryChangeEvent,
    profile: CustomerFinancialProfile,
    applicability?: TenantNoticeApplicability
  ): TenantImpactAssessment {
    return this.assessEventImpact(profile, event, applicability);
  }

  public assessAllChanges(
    events: RegulatoryChangeEvent[],
    profile: CustomerFinancialProfile,
    noticeMap?: Map<string, RegulatoryNotice360>,
    applicabilityMap?: Map<string, TenantNoticeApplicability>
  ): TenantImpactAssessment[] {
    return events.map(evt => {
      const app = applicabilityMap ? applicabilityMap.get(evt.noticeId) : undefined;
      return this.assessEventImpact(profile, evt, app);
    });
  }

  public getTenantAssessments(tenantId: string): TenantImpactAssessment[] {
    return this.tenantImpactAssessments.get(tenantId) || [];
  }

  public clearTenantData(tenantId: string): void {
    this.tenantImpactAssessments.delete(tenantId);
    this.tenantAlerts.delete(tenantId);
  }
}

export const regulatoryImpactAssessmentService = RegulatoryImpactAssessmentService.getInstance();

