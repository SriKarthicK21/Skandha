/**
 * SKANDA UNIVERSAL WORKFLOW ENGINE
 * Path: src/services/canonical/WorkflowService.ts
 * 
 * Centralized lifecycle and state machine engine shared across:
 * - Risk Treatment
 * - CAPA Remediation
 * - Evidence Verification
 * - Policy Approval
 * - SoA Sign-off
 * - Exception Approval
 * - Control Test Sign-off
 * - Audit Finding Closure
 * - Vendor Assessment
 */

import { WorkflowTask, WorkflowState, WorkflowEntityType } from '../../types/canonicalGrcTypes';

class UniversalWorkflowService {
  private tasks: Map<string, WorkflowTask> = new Map();

  constructor() {
    this.seedCanonicalTasks();
  }

  private seedCanonicalTasks() {
    const canonicalSeeds: WorkflowTask[] = [
      {
        id: 'WF-TSK-101',
        tenantId: 'tenant-acme-corp',
        entityType: 'CONTROL_TEST_SIGN_OFF',
        entityId: 'TEST-2026-Q3-088',
        entityCode: 'TEST-2026-Q3-088',
        title: 'Review and Sign-off Q3 IAM PAM Control Effectiveness Test',
        description: 'Verify 100% WebAuthn MFA sampling evidence and approve formal test report for ISO 27001 / SOC 2 auditor packet.',
        assignee: 'Sarah Chen',
        assigneeRole: 'Director of IAM',
        approver: 'Marcus Vance (CISO)',
        reviewer: 'Elena Vance (Internal Audit)',
        priority: 'HIGH',
        state: 'PENDING_APPROVAL',
        dueDate: '2026-10-10T17:00:00Z',
        slaHoursRemaining: 72,
        isEscalated: false,
        auditTrail: [
          {
            timestamp: '2026-09-18T10:30:00Z',
            actor: 'David Rossi',
            action: 'TASK_CREATED',
            comment: 'Initiated formal control testing workflow following Q3 sampling completion.',
            previousState: 'DRAFT',
            newState: 'ASSIGNED'
          },
          {
            timestamp: '2026-09-20T14:00:00Z',
            actor: 'Sarah Chen',
            action: 'SUBMIT_FOR_APPROVAL',
            comment: 'Completed fieldwork. Sample of 45 admin sessions verified with zero nonconformities.',
            previousState: 'IN_PROGRESS',
            newState: 'PENDING_APPROVAL'
          }
        ],
        createdAt: '2026-09-18T10:30:00Z',
        updatedAt: '2026-09-20T14:00:00Z'
      },
      {
        id: 'WF-TSK-102',
        tenantId: 'tenant-acme-corp',
        entityType: 'CAPA_REMEDIATION',
        entityId: 'CAPA-003',
        entityCode: 'CAPA-003',
        title: 'Remediate S3 Bucket Logging & TLS 1.3 Strict Enforcement',
        description: 'Update Terraform cloud infrastructure templates to enforce TLS 1.3 minimum cipher suites across all public edge distributions.',
        assignee: 'Alex Kumar',
        assigneeRole: 'Cloud SecOps Lead',
        approver: 'Sarah Chen (Director of IAM)',
        priority: 'CRITICAL',
        state: 'IN_PROGRESS',
        dueDate: '2026-10-08T18:00:00Z',
        slaHoursRemaining: 48,
        isEscalated: false,
        auditTrail: [
          {
            timestamp: '2026-09-25T08:00:00Z',
            actor: 'System (Audit Engine)',
            action: 'AUTO_GENERATED_FROM_FINDING',
            comment: 'Triggered automatically from Audit Finding FND-2026-042.',
            previousState: 'DRAFT',
            newState: 'ASSIGNED'
          }
        ],
        createdAt: '2026-09-25T08:00:00Z',
        updatedAt: '2026-09-25T08:00:00Z'
      },
      {
        id: 'WF-TSK-103',
        tenantId: 'tenant-acme-corp',
        entityType: 'EXCEPTION_APPROVAL',
        entityId: 'EXC-2026-088',
        entityCode: 'EXC-2026-088',
        title: 'Review Exception Request: Legacy SFTP Bastion MFA Bypass',
        description: 'Finance batch processing mainframe requires IP-whitelisting + dual-custody audit logging in lieu of interactive WebAuthn.',
        assignee: 'Marcus Vance',
        assigneeRole: 'Chief Information Security Officer',
        approver: 'Marcus Vance',
        reviewer: 'Sarah Chen',
        priority: 'HIGH',
        state: 'PENDING_APPROVAL',
        dueDate: '2026-10-06T12:00:00Z',
        slaHoursRemaining: 24,
        isEscalated: true,
        auditTrail: [
          {
            timestamp: '2026-09-28T11:00:00Z',
            actor: 'Karthik Rao (Finance Sec)',
            action: 'EXCEPTION_SUBMITTED',
            comment: 'Submitted business justification and compensating control architecture document.',
            previousState: 'DRAFT',
            newState: 'PENDING_APPROVAL'
          }
        ],
        createdAt: '2026-09-28T11:00:00Z',
        updatedAt: '2026-09-29T16:00:00Z'
      },
      {
        id: 'WF-TSK-104',
        tenantId: 'tenant-acme-corp',
        entityType: 'EVIDENCE_VERIFICATION',
        entityId: 'EV-2026-004',
        entityCode: 'EV-2026-004',
        title: 'Verify Vendor SOC 2 Type 2 Report for Tier-1 Fintech Provider',
        description: 'Confirm no bridge letters needed and validate subservice organization carve-outs against internal requirements.',
        assignee: 'Karthik Rao',
        assigneeRole: 'Vendor Risk Lead',
        approver: 'Marcus Vance',
        priority: 'MEDIUM',
        state: 'ASSIGNED',
        dueDate: '2026-10-15T17:00:00Z',
        slaHoursRemaining: 180,
        isEscalated: false,
        auditTrail: [
          {
            timestamp: '2026-09-29T11:45:00Z',
            actor: 'Smart Evidence Ingestion',
            action: 'EVIDENCE_CLASSIFIED',
            comment: 'Uploaded vendor artifact classified with 94% confidence.',
            previousState: 'DRAFT',
            newState: 'ASSIGNED'
          }
        ],
        createdAt: '2026-09-29T11:45:00Z',
        updatedAt: '2026-09-29T11:45:00Z'
      },
      {
        id: 'WF-TSK-105',
        tenantId: 'tenant-acme-corp',
        entityType: 'SOA_SIGN_OFF',
        entityId: 'SOA-ISO27001-2026',
        entityCode: 'SOA-2026',
        title: 'Executive Sign-off of ISO 27001:2022 Statement of Applicability',
        description: 'Formal sign-off by CISO and Head of Legal on the 93 Annex A control applicability justifications.',
        assignee: 'Marcus Vance',
        assigneeRole: 'Chief Information Security Officer',
        approver: 'Board Risk Committee',
        priority: 'CRITICAL',
        state: 'PENDING_APPROVAL',
        dueDate: '2026-10-12T17:00:00Z',
        slaHoursRemaining: 96,
        isEscalated: false,
        auditTrail: [
          {
            timestamp: '2026-09-15T09:00:00Z',
            actor: 'GRC Compliance Lead',
            action: 'SOA_VERSION_FROZEN',
            comment: 'All 93 controls reviewed and marked with business justifications.',
            previousState: 'IN_PROGRESS',
            newState: 'PENDING_APPROVAL'
          }
        ],
        createdAt: '2026-09-15T09:00:00Z',
        updatedAt: '2026-09-25T14:30:00Z'
      }
    ];

    canonicalSeeds.forEach(t => this.tasks.set(t.id, t));
  }

  // ==========================================================================
  // QUERY METHODS
  // ==========================================================================

  public getAllTasks(): WorkflowTask[] {
    return Array.from(this.tasks.values());
  }

  public getTaskById(id: string): WorkflowTask | undefined {
    return this.tasks.get(id);
  }

  public getTasksByAssignee(assigneeName: string): WorkflowTask[] {
    const search = assigneeName.toLowerCase();
    return Array.from(this.tasks.values()).filter(t => 
      t.assignee.toLowerCase().includes(search)
    );
  }

  public getPendingApprovalsForUser(approverName: string): WorkflowTask[] {
    const search = approverName.toLowerCase();
    return Array.from(this.tasks.values()).filter(t => 
      t.state === 'PENDING_APPROVAL' && 
      (t.approver?.toLowerCase().includes(search) || t.reviewer?.toLowerCase().includes(search))
    );
  }

  public getTasksByEntity(entityType: WorkflowEntityType, entityId: string): WorkflowTask[] {
    return Array.from(this.tasks.values()).filter(t => 
      t.entityType === entityType && (t.entityId === entityId || t.entityCode === entityId)
    );
  }

  public getOverdueTasks(): WorkflowTask[] {
    const now = new Date();
    return Array.from(this.tasks.values()).filter(t => 
      new Date(t.dueDate) < now && t.state !== 'CLOSED' && t.state !== 'APPROVED'
    );
  }

  // ==========================================================================
  // STATE TRANSITIONS & MUTATIONS
  // ==========================================================================

  public createTask(input: Omit<WorkflowTask, 'id' | 'createdAt' | 'updatedAt' | 'auditTrail' | 'slaHoursRemaining' | 'isEscalated'>): WorkflowTask {
    const id = `WF-TSK-${String(this.tasks.size + 101)}`;
    const now = new Date();
    const due = new Date(input.dueDate);
    const slaHoursRemaining = Math.max(0, Math.round((due.getTime() - now.getTime()) / (1000 * 60 * 60)));

    const newTask: WorkflowTask = {
      ...input,
      id,
      slaHoursRemaining,
      isEscalated: false,
      auditTrail: [
        {
          timestamp: now.toISOString(),
          actor: 'System / Workflow Engine',
          action: 'TASK_CREATED',
          comment: `Task created for ${input.entityType} (${input.entityCode})`,
          previousState: 'DRAFT',
          newState: input.state
        }
      ],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };

    this.tasks.set(id, newTask);
    return newTask;
  }

  public transitionState(taskId: string, newState: WorkflowState, actor: string, comment?: string): WorkflowTask {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error(`Workflow Task ${taskId} not found`);

    const prevState = task.state;
    task.state = newState;
    task.updatedAt = new Date().toISOString();

    task.auditTrail.push({
      timestamp: new Date().toISOString(),
      actor,
      action: `STATE_TRANSITION_${newState}`,
      comment,
      previousState: prevState,
      newState
    });

    return task;
  }

  public approveTask(taskId: string, approver: string, comment?: string): WorkflowTask {
    return this.transitionState(taskId, 'APPROVED', approver, comment || 'Approved in compliance workflow.');
  }

  public rejectTask(taskId: string, reviewer: string, reason: string): WorkflowTask {
    return this.transitionState(taskId, 'REJECTED', reviewer, `Rejected: ${reason}`);
  }

  public escalateTask(taskId: string, actor: string, reason: string): WorkflowTask {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error(`Workflow Task ${taskId} not found`);

    task.isEscalated = true;
    return this.transitionState(taskId, 'ESCALATED', actor, `Escalated: ${reason}`);
  }
}

export const universalWorkflowService = new UniversalWorkflowService();
