// ============================================================================
// SKANDA ENTERPRISE GRC: REGULATORY CHANGE IMPACT & GOVERNANCE REVIEW SERVICE
// Path: server/services/PolicyRegulatoryImpactService.ts
//
// Assesses upstream regulatory amendments (ISO 27001:2022, DPDP, GDPR, MAS TRM)
// and maps impact to downstream policies, controls, procedures, and evidence specs.
// Crucial Rule: NEVER automatically rewrite or republish approved documents;
// route proposed deltas to human governance workflows.
// ============================================================================

import { enterpriseAuditService } from './EnterpriseAuditService.js';
import { domainEventBus } from '../../src/services/canonical/DomainEventBus.js';

export interface RegulatoryChangeEvent {
  eventId: string;
  sourceRegulatoryBody: string; // e.g. "ISO/IEC", "MeitY (India DPDP)", "Monetary Authority of Singapore (MAS)", "EU EDPB"
  frameworkCode: string; // e.g. "ISO_27001_2022", "DPDP_2023", "MAS_TRM_2021"
  affectedClauseOrSection: string; // e.g. "Control A.8.24 Use of Cryptography", "Section 6 Consent Notice"
  changeDescription: string;
  effectiveDate: string;
  urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM';
}

export interface PolicyImpactAssessment {
  assessmentId: string;
  assessedAt: string;
  tenantId: string;
  changeEvent: RegulatoryChangeEvent;
  impactedDocuments: Array<{
    documentId: string;
    documentCode: string;
    documentTitle: string;
    currentVersion: string;
    ownerEmail: string;
    ownerRole: string;
    impactSeverity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
    affectedSections: string[];
    governanceActionRequired: string;
    reviewTaskId: string;
  }>;
  impactedControls: string[];
  governanceRecommendation: string;
}

export interface GovernanceReviewTask {
  taskId: string;
  tenantId: string;
  documentId: string;
  documentCode: string;
  triggerType: 'REGULATORY_CHANGE' | 'SCHEDULED_CADENCE' | 'INCIDENT_OCCURRED' | 'CONTROL_TEST_FAILED' | 'AUDIT_FINDING';
  triggerSource: string;
  responsibleOwner: string;
  dueDate: string;
  relevantEvidenceSpecs: string[];
  proposedChanges: string[];
  approvalRequirements: string[];
  status: 'PENDING_REVIEW' | 'IN_PROGRESS' | 'REVISION_SUBMITTED' | 'CLOSED_NO_CHANGE';
  closureDecision?: string;
  closedAt?: string;
}

export class PolicyRegulatoryImpactService {
  private static instance: PolicyRegulatoryImpactService;
  private reviewTasks: Map<string, GovernanceReviewTask> = new Map();

  private constructor() {}

  public static getInstance(): PolicyRegulatoryImpactService {
    if (!PolicyRegulatoryImpactService.instance) {
      PolicyRegulatoryImpactService.instance = new PolicyRegulatoryImpactService();
    }
    return PolicyRegulatoryImpactService.instance;
  }

  public assessRegulatoryChangeImpact(params: {
    tenantId: string;
    changeEvent: RegulatoryChangeEvent;
    documents: Array<{
      id: string;
      code: string;
      title: string;
      frameworkCodes: string[];
      currentVersion: string;
      ownerEmail: string;
      ownerRole: string;
      linkedControlCodes?: string[];
      status: string;
    }>;
  }): PolicyImpactAssessment {
    const assessmentId = `REG-IMP-${Date.now()}`;
    const assessedAt = new Date().toISOString();
    const impactedDocs: PolicyImpactAssessment['impactedDocuments'] = [];
    const impactedControlsSet = new Set<string>();

    for (const doc of params.documents) {
      const isFrameworkMatch = doc.frameworkCodes.some(
        f => f.toLowerCase().includes(params.changeEvent.frameworkCode.toLowerCase()) ||
             params.changeEvent.frameworkCode.toLowerCase().includes(f.toLowerCase())
      );

      if (isFrameworkMatch && doc.status !== 'ARCHIVED' && doc.status !== 'WITHDRAWN') {
        const taskId = `GOV-TSK-REV-${Date.now()}-${doc.code}`;
        const dueDate = new Date(Date.now() + 30 * 86400000).toISOString();

        impactedDocs.push({
          documentId: doc.id,
          documentCode: doc.code,
          documentTitle: doc.title,
          currentVersion: doc.currentVersion,
          ownerEmail: doc.ownerEmail,
          ownerRole: doc.ownerRole,
          impactSeverity: params.changeEvent.urgency,
          affectedSections: ['Requirements & Controls Mappings', 'Mandatory Operational Practices'],
          governanceActionRequired: `Execute formal governance review of ${doc.code} to incorporate ${params.changeEvent.sourceRegulatoryBody} ${params.changeEvent.affectedClauseOrSection} update.`,
          reviewTaskId: taskId
        });

        if (doc.linkedControlCodes) {
          doc.linkedControlCodes.forEach(c => impactedControlsSet.add(c));
        }

        // Register Governance Review Task
        const reviewTask: GovernanceReviewTask = {
          taskId,
          tenantId: params.tenantId,
          documentId: doc.id,
          documentCode: doc.code,
          triggerType: 'REGULATORY_CHANGE',
          triggerSource: `${params.changeEvent.sourceRegulatoryBody} ${params.changeEvent.affectedClauseOrSection}`,
          responsibleOwner: doc.ownerEmail,
          dueDate,
          relevantEvidenceSpecs: [`${doc.code} Compliance Evidence`, 'Updated Control Artifacts'],
          proposedChanges: [
            `Incorporate amended regulatory language for ${params.changeEvent.affectedClauseOrSection}.`,
            'Update downstream expected evidence collection intervals where required.'
          ],
          approvalRequirements: ['Policy Owner Review', 'Compliance Lead Sign-off', 'CISO Approval'],
          status: 'PENDING_REVIEW'
        };
        this.reviewTasks.set(taskId, reviewTask);

        // Audit Trail
        enterpriseAuditService.recordAuditLog({
          tenantId: params.tenantId,
          action: 'REGULATORY_IMPACT_REVIEW_SCHEDULED',
          actor: 'SYSTEM_REGULATORY_WATCHDOG',
          actorRole: 'REGULATORY_INTELLIGENCE',
          entity: 'GovernanceDocument',
          entityId: doc.id,
          reason: `Document ${doc.code} flagged as IMPACTED_BY_CHANGE due to ${params.changeEvent.sourceRegulatoryBody} amendment.`
        });

        domainEventBus.publish({
          id: `evt-${Date.now()}`,
          tenantId: params.tenantId,
          eventType: 'DocumentImpactedByRegulatoryChange',
          aggregateType: 'GovernanceDocument',
          aggregateId: doc.id,
          payload: { docId: doc.id, code: doc.code, changeEvent: params.changeEvent },
          timestamp: assessedAt,
          correlationId: `corr-${assessmentId}`
        });
      }
    }

    return {
      assessmentId,
      assessedAt,
      tenantId: params.tenantId,
      changeEvent: params.changeEvent,
      impactedDocuments: impactedDocs,
      impactedControls: Array.from(impactedControlsSet),
      governanceRecommendation: `Created ${impactedDocs.length} formal governance review task(s). Existing approved policies remain legally and operationally active while human reviewers evaluate proposed amendments.`
    };
  }

  public getReviewTasks(tenantId: string): GovernanceReviewTask[] {
    return Array.from(this.reviewTasks.values()).filter(t => t.tenantId === tenantId);
  }

  public completeReviewTask(params: {
    taskId: string;
    closureDecision: string;
    actorEmail: string;
  }): GovernanceReviewTask {
    const task = this.reviewTasks.get(params.taskId);
    if (!task) throw new Error(`Review task ${params.taskId} not found.`);

    task.status = 'CLOSED_NO_CHANGE';
    task.closureDecision = params.closureDecision;
    task.closedAt = new Date().toISOString();

    enterpriseAuditService.recordAuditLog({
      tenantId: task.tenantId,
      action: 'GOVERNANCE_REVIEW_TASK_COMPLETED',
      actor: params.actorEmail,
      actorRole: 'POLICY_OWNER',
      entity: 'GovernanceReviewTask',
      entityId: task.taskId,
      reason: `Review completed for ${task.documentCode}: ${params.closureDecision}`
    });

    return task;
  }
}

export const policyRegulatoryImpactService = PolicyRegulatoryImpactService.getInstance();
