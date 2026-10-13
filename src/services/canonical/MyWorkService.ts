/**
 * SKANDA MY WORK SERVICE
 * Path: src/services/canonical/MyWorkService.ts
 * 
 * Aggregates personal operational responsibilities across all GRC domains:
 * - My Workflow Tasks
 * - My Control Implementations
 * - My Scheduled Tests
 * - My Owned Risks
 * - My Pending Evidence
 * - My Assigned CAPAs
 * - My Pending Approvals
 * - My Exceptions
 * - My Audits in Scope
 */

import { MyWorkQueue } from '../../types/canonicalGrcTypes';
import { universalWorkflowService } from './WorkflowService';
import { controlTestingService } from './ControlTestingService';
import { exceptionManagementService } from './ExceptionManagementService';

class MyWorkService {
  /**
   * Aggregate complete personal operational queue for a specific user
   */
  public getMyWorkQueue(userName: string = 'Sarah Chen', tenantId: string = 'tenant-acme-corp'): MyWorkQueue {
    const userSearch = userName.toLowerCase();

    // 1. Workflow Tasks assigned to user
    const tasks = universalWorkflowService.getTasksByAssignee(userName);

    // 2. Pending Approvals where user is designated approver or reviewer
    const pendingApprovals = universalWorkflowService.getPendingApprovalsForUser(userName);

    // 3. Control Implementations owned by user
    const assignedControls = controlTestingService.getAllImplementations().filter(impl => 
      impl.owner.toLowerCase().includes(userSearch) || impl.technicalCustodian.toLowerCase().includes(userSearch)
    );

    // 4. Scheduled Control Tests where user is tester
    const scheduledControlTests = controlTestingService.getAllTests().filter(test => 
      test.tester.toLowerCase().includes(userSearch)
    );

    // 5. Active Exceptions owned or requested by user
    const activeExceptions = exceptionManagementService.getAllExceptions().filter(exc => 
      exc.requestedBy.toLowerCase().includes(userSearch) || exc.approvedBy?.toLowerCase().includes(userSearch)
    );

    // 6. Connected Risks owned by user
    const ownedRisks = [
      {
        id: 'RSK-001',
        code: 'RSK-001',
        title: 'Privileged Credential Escalation in Multi-Cloud AWS Ingress',
        score: 16,
        level: 'HIGH',
        dueDate: '2026-11-15T00:00:00Z'
      },
      {
        id: 'RSK-014',
        code: 'RSK-014',
        title: 'Unenforced MFA on Legacy Core Banking SFTP Interface',
        score: 12,
        level: 'MEDIUM_HIGH',
        dueDate: '2026-10-30T00:00:00Z'
      }
    ];

    // 7. Evidence items pending upload/refresh
    const pendingEvidenceUploads = [
      {
        id: 'REQ-EV-088',
        controlCode: 'CTRL-088',
        requirementTitle: 'Q4 2026 MFA WebAuthn Enforcement Log Dump',
        dueDate: '2026-11-01T17:00:00Z'
      },
      {
        id: 'REQ-EV-019',
        controlCode: 'CTRL-019',
        requirementTitle: 'Monthly Container Vulnerability Remediation Telemetry',
        dueDate: '2026-10-15T17:00:00Z'
      }
    ];

    // 8. Assigned CAPAs
    const assignedCapas = [
      {
        id: 'CAPA-003',
        code: 'CAPA-003',
        title: 'Enforce TLS 1.3 Minimum Cipher Suites on S3 Buckets',
        priority: 'CRITICAL',
        dueDate: '2026-10-08T18:00:00Z',
        status: 'IN_PROGRESS'
      },
      {
        id: 'CAPA-012',
        code: 'CAPA-012',
        title: 'Update AI Model Card Documentation for Credit Scoring Engine',
        priority: 'MEDIUM',
        dueDate: '2026-10-25T17:00:00Z',
        status: 'ASSIGNED'
      }
    ];

    // 9. Audits in scope
    const auditsInScope = [
      {
        id: 'AUD-2026-001',
        code: 'AUD-2026-001',
        title: 'Annual ISO 27001:2022 Stage 2 Surveillance Audit',
        role: 'Control Owner / Lead Interviewee',
        startDate: '2026-11-10T09:00:00Z',
        endDate: '2026-11-14T17:00:00Z'
      },
      {
        id: 'AUD-2026-002',
        code: 'AUD-2026-002',
        title: 'SOC 2 Type 2 Trust Services Criteria Fieldwork',
        role: 'IAM Evidence Custodian',
        startDate: '2026-11-20T09:00:00Z',
        endDate: '2026-11-28T17:00:00Z'
      }
    ];

    return {
      userId: 'usr-sarah-chen',
      userName,
      tenantId,
      tasks,
      assignedControls,
      scheduledControlTests,
      ownedRisks,
      pendingEvidenceUploads,
      assignedCapas,
      pendingApprovals,
      activeExceptions,
      auditsInScope
    };
  }
}

export const myWorkService = new MyWorkService();
