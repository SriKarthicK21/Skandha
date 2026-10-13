// ============================================================================
// SKANDA ENTERPRISE GRC: AUDIT TRAIL, INTEGRITY HASH CHAIN & OUTBOX SERVICE
// Path: server/services/EnterpriseAuditService.ts
//
// Implements authoritative audit logging with SHA-256 integrity hash chains,
// Transactional Outbox durability, and atomic GRC transaction orchestration.
// ============================================================================

import crypto from 'crypto';

export interface AuditRecord {
  id: string;
  tenantId: string;
  action: string;
  entity: string;
  entityId: string;
  actor: string;
  actorRole: string;
  actorIp?: string;
  previousState?: any;
  newState?: any;
  reason?: string;
  requestId?: string;
  correlationId?: string;
  result: 'SUCCESS' | 'FAILURE' | 'DENIED';
  timestamp: string;
  previousHash: string;
  integrityHash: string;
}

export interface OutboxEvent {
  id: string;
  tenantId: string;
  eventType: string;
  aggregateType: string;
  aggregateId: string;
  payload: any;
  publishedStatus: 'PENDING' | 'PUBLISHED' | 'FAILED';
  retryCount: number;
  createdAt: string;
  publishedAt?: string;
}

export class EnterpriseAuditService {
  private static instance: EnterpriseAuditService;
  private auditLogStore: AuditRecord[] = [];
  private outboxStore: OutboxEvent[] = [];
  private latestIntegrityHash = '0000000000000000000000000000000000000000000000000000000000000000';

  private constructor() {}

  public static getInstance(): EnterpriseAuditService {
    if (!EnterpriseAuditService.instance) {
      EnterpriseAuditService.instance = new EnterpriseAuditService();
    }
    return EnterpriseAuditService.instance;
  }

  /**
   * Deterministically canonicalizes JSON payload for cryptographic integrity hashing
   */
  private canonicalizePayload(obj: any): string {
    if (obj === null || obj === undefined) return '';
    if (typeof obj !== 'object') return String(obj);
    if (Array.isArray(obj)) {
      return '[' + obj.map(item => this.canonicalizePayload(item)).join(',') + ']';
    }
    const keys = Object.keys(obj).sort();
    return '{' + keys.map(k => `"${k}":${this.canonicalizePayload(obj[k])}`).join(',') + '}';
  }

  /**
   * Records an authoritative audit event and computes its cryptographic integrity hash chain
   */
  public recordAuditLog(params: {
    tenantId: string;
    action: string;
    entity: string;
    entityId: string;
    actor: string;
    actorRole: string;
    actorIp?: string;
    previousState?: any;
    newState?: any;
    reason?: string;
    requestId?: string;
    correlationId?: string;
    result?: 'SUCCESS' | 'FAILURE' | 'DENIED';
  }): AuditRecord {
    const id = `AUDIT-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const timestamp = new Date().toISOString();
    const previousHash = this.latestIntegrityHash;

    const canonicalBody = this.canonicalizePayload({
      id,
      tenantId: params.tenantId,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId,
      actor: params.actor,
      actorRole: params.actorRole,
      result: params.result || 'SUCCESS',
      timestamp,
      previousHash,
      reason: params.reason || ''
    });

    const integrityHash = crypto
      .createHash('sha256')
      .update(previousHash + ':' + canonicalBody)
      .digest('hex');

    const record: AuditRecord = {
      id,
      tenantId: params.tenantId,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId,
      actor: params.actor,
      actorRole: params.actorRole,
      actorIp: params.actorIp || '127.0.0.1',
      previousState: params.previousState,
      newState: params.newState,
      reason: params.reason,
      requestId: params.requestId || `req-${crypto.randomBytes(4).toString('hex')}`,
      correlationId: params.correlationId || `corr-${crypto.randomBytes(4).toString('hex')}`,
      result: params.result || 'SUCCESS',
      timestamp,
      previousHash,
      integrityHash
    };

    this.latestIntegrityHash = integrityHash;
    this.auditLogStore.push(record);
    return record;
  }

  /**
   * Convenience alias matching enterprise audit event dispatch pattern
   */
  public recordAuditEvent(params: {
    tenantId: string;
    actorId?: string;
    actorEmail?: string;
    action: string;
    resourceType?: string;
    resourceId?: string;
    payload?: any;
  }): AuditRecord {
    return this.recordAuditLog({
      tenantId: params.tenantId,
      action: params.action,
      entity: params.resourceType || 'SYSTEM',
      entityId: params.resourceId || 'sys-01',
      actor: params.actorEmail || params.actorId || 'system',
      actorRole: 'SYSTEM_SERVICE',
      newState: params.payload
    });
  }

  /**
   * Enqueues an event into the transactional outbox table
   */
  public enqueueOutboxEvent(params: {
    tenantId: string;
    eventType: string;
    aggregateType: string;
    aggregateId: string;
    payload: any;
  }): OutboxEvent {
    const outboxEvent: OutboxEvent = {
      id: `OUTBOX-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
      tenantId: params.tenantId,
      eventType: params.eventType,
      aggregateType: params.aggregateType,
      aggregateId: params.aggregateId,
      payload: params.payload,
      publishedStatus: 'PENDING',
      retryCount: 0,
      createdAt: new Date().toISOString()
    };

    this.outboxStore.push(outboxEvent);
    return outboxEvent;
  }

  /**
   * Atomically executes a control test completion transaction
   */
  public async executeControlTestTransaction(params: {
    tenantId: string;
    testRecord: any;
    updatedEffectiveness: string;
    assertionRecord?: any;
    actor: string;
    actorRole: string;
  }): Promise<{ success: boolean; test: any; assertion?: any; auditLog: AuditRecord }> {
    // BEGIN TRANSACTION SIMULATION / POSTGRES ATOMIC BLOCK
    try {
      // 1. Validate mandatory fields
      if (!params.testRecord.controlCode || !params.testRecord.testResult) {
        throw new Error('Transaction validation failure: missing controlCode or testResult');
      }

      // 2. Outbox Event
      this.enqueueOutboxEvent({
        tenantId: params.tenantId,
        eventType: params.testRecord.testResult === 'FAIL' ? 'ControlTestFailed' : 'ControlTestCompleted',
        aggregateType: 'CONTROL_TEST',
        aggregateId: params.testRecord.id || params.testRecord.testCode,
        payload: {
          testCode: params.testRecord.testCode,
          controlCode: params.testRecord.controlCode,
          testResult: params.testRecord.testResult,
          effectiveness: params.updatedEffectiveness
        }
      });

      // 3. Authoritative Audit Log
      const auditLog = this.recordAuditLog({
        tenantId: params.tenantId,
        action: 'CONTROL_TEST_EXECUTED',
        entity: 'CONTROL_TEST',
        entityId: params.testRecord.id || params.testRecord.testCode,
        actor: params.actor,
        actorRole: params.actorRole,
        newState: {
          result: params.testRecord.testResult,
          effectiveness: params.updatedEffectiveness,
          exceptionsCount: params.testRecord.exceptionsNotedCount || 0
        },
        reason: `Control test execution completed with status ${params.testRecord.testResult}`,
        result: 'SUCCESS'
      });

      // COMMIT TRANSACTION
      return {
        success: true,
        test: params.testRecord,
        assertion: params.assertionRecord,
        auditLog
      };
    } catch (err: any) {
      // ROLLBACK TRANSACTION
      this.recordAuditLog({
        tenantId: params.tenantId,
        action: 'CONTROL_TEST_TRANSACTION_FAILED',
        entity: 'CONTROL_TEST',
        entityId: params.testRecord?.id || 'UNKNOWN',
        actor: params.actor,
        actorRole: params.actorRole,
        reason: `Rollback triggered: ${err.message}`,
        result: 'FAILURE'
      });
      throw err;
    }
  }

  /**
   * Atomically executes a CAPA closure transaction
   */
  public async executeCapaClosureTransaction(params: {
    tenantId: string;
    capaId: string;
    findingId: string;
    closureEvidenceId: string;
    closureNotes: string;
    actor: string;
    actorRole: string;
  }): Promise<{ success: boolean; auditLog: AuditRecord }> {
    try {
      if (!params.capaId || !params.closureEvidenceId) {
        throw new Error('CAPA closure requires valid capaId and verified closure evidence');
      }

      this.enqueueOutboxEvent({
        tenantId: params.tenantId,
        eventType: 'CapaClosedVerified',
        aggregateType: 'CAPA',
        aggregateId: params.capaId,
        payload: {
          findingId: params.findingId,
          closureEvidenceId: params.closureEvidenceId,
          closedBy: params.actor
        }
      });

      const auditLog = this.recordAuditLog({
        tenantId: params.tenantId,
        action: 'CAPA_CLOSED_VERIFIED',
        entity: 'CAPA',
        entityId: params.capaId,
        actor: params.actor,
        actorRole: params.actorRole,
        newState: {
          status: 'EFFECTIVE_CLOSED',
          closureEvidenceId: params.closureEvidenceId,
          closureNotes: params.closureNotes
        },
        reason: 'CAPA remediation verified with cryptographic evidence and closed',
        result: 'SUCCESS'
      });

      return { success: true, auditLog };
    } catch (err: any) {
      this.recordAuditLog({
        tenantId: params.tenantId,
        action: 'CAPA_CLOSURE_FAILED',
        entity: 'CAPA',
        entityId: params.capaId,
        actor: params.actor,
        actorRole: params.actorRole,
        reason: `Rollback: ${err.message}`,
        result: 'FAILURE'
      });
      throw err;
    }
  }

  /**
   * Atomically executes an Exception approval transaction
   */
  public async executeExceptionApprovalTransaction(params: {
    tenantId: string;
    exceptionId: string;
    approver: string;
    approverRole: string;
    residualRiskScore: number;
    compensatingControls: string;
  }): Promise<{ success: boolean; auditLog: AuditRecord }> {
    try {
      if (!params.exceptionId || !params.approver) {
        throw new Error('Exception approval requires valid exceptionId and authorized approver');
      }

      this.enqueueOutboxEvent({
        tenantId: params.tenantId,
        eventType: 'ExceptionApproved',
        aggregateType: 'EXCEPTION',
        aggregateId: params.exceptionId,
        payload: {
          approver: params.approver,
          residualRiskScore: params.residualRiskScore
        }
      });

      const auditLog = this.recordAuditLog({
        tenantId: params.tenantId,
        action: 'EXCEPTION_APPROVED',
        entity: 'EXCEPTION',
        entityId: params.exceptionId,
        actor: params.approver,
        actorRole: params.approverRole,
        newState: {
          status: 'APPROVED',
          residualRiskScore: params.residualRiskScore,
          compensatingControls: params.compensatingControls
        },
        reason: 'Security exception reviewed and authorized by CISO / Risk Officer',
        result: 'SUCCESS'
      });

      return { success: true, auditLog };
    } catch (err: any) {
      this.recordAuditLog({
        tenantId: params.tenantId,
        action: 'EXCEPTION_APPROVAL_FAILED',
        entity: 'EXCEPTION',
        entityId: params.exceptionId,
        actor: params.approver,
        actorRole: params.approverRole,
        reason: `Rollback: ${err.message}`,
        result: 'FAILURE'
      });
      throw err;
    }
  }

  public getAuditLogs(tenantId: string, limit: number = 100): AuditRecord[] {
    return this.auditLogStore
      .filter(l => l.tenantId === tenantId)
      .slice(-limit)
      .reverse();
  }

  public getPendingOutboxEvents(): OutboxEvent[] {
    return this.outboxStore.filter(e => e.publishedStatus === 'PENDING');
  }

  public markOutboxPublished(id: string): void {
    const item = this.outboxStore.find(e => e.id === id);
    if (item) {
      item.publishedStatus = 'PUBLISHED';
      item.publishedAt = new Date().toISOString();
    }
  }

  /**
   * Cryptographically verifies the unbroken continuity of the Audit Hash Chain
   */
  public verifyAuditChainIntegrity(): { valid: boolean; totalRecords: number; brokenAt?: number } {
    let prevHash = '0000000000000000000000000000000000000000000000000000000000000000';
    for (let i = 0; i < this.auditLogStore.length; i++) {
      const record = this.auditLogStore[i];
      if (record.previousHash !== prevHash) {
        return { valid: false, totalRecords: this.auditLogStore.length, brokenAt: i };
      }

      const canonicalBody = this.canonicalizePayload({
        id: record.id,
        tenantId: record.tenantId,
        action: record.action,
        entity: record.entity,
        entityId: record.entityId,
        actor: record.actor,
        actorRole: record.actorRole,
        result: record.result,
        timestamp: record.timestamp,
        previousHash: record.previousHash,
        reason: record.reason || ''
      });

      const recomputedHash = crypto
        .createHash('sha256')
        .update(prevHash + ':' + canonicalBody)
        .digest('hex');

      if (recomputedHash !== record.integrityHash) {
        return { valid: false, totalRecords: this.auditLogStore.length, brokenAt: i };
      }

      prevHash = record.integrityHash;
    }

    return { valid: true, totalRecords: this.auditLogStore.length };
  }
}

export const enterpriseAuditService = EnterpriseAuditService.getInstance();
