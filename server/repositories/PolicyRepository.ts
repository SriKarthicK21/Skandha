// ============================================================================
// SKANDA ENTERPRISE GRC: POLICY PERSISTENCE REPOSITORY & DATA STORE
// Path: server/repositories/PolicyRepository.ts
//
// Relational PostgreSQL database provider with durable atomic JSON fallback for dev/test.
// In NODE_ENV=production: Managed PostgreSQL is mandatory; fails fast if unavailable.
// Guarantees persistence of policy documents, versions, approvals, and acknowledgements
// across application restarts.
// ============================================================================

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import pg from 'pg';
import {
  GovernanceDocument,
  DocumentVersionRecord,
  ApprovalMatrixRule,
  AcknowledgementCampaign,
  AcknowledgementEvidenceRecord,
  ImplementationPlan,
  ExpectedEvidenceSpec
} from '../services/PolicyGovernanceEngine.js';
import { GovernanceReviewTask } from '../services/PolicyRegulatoryImpactService.js';
import { postgresConnectionManager, EnterpriseDatabaseUnavailableFatalError } from '../services/PostgresConnectionManager.js';

export interface IPolicyDataStore {
  // Document Register
  getDocuments(tenantId: string): Promise<GovernanceDocument[]>;
  getDocumentById(tenantId: string, id: string): Promise<GovernanceDocument | null>;
  saveDocument(doc: GovernanceDocument): Promise<GovernanceDocument>;
  deleteDocument(tenantId: string, id: string): Promise<boolean>;

  // Versions
  saveVersion(tenantId: string, documentId: string, record: DocumentVersionRecord): Promise<void>;
  getVersions(tenantId: string, documentId: string): Promise<DocumentVersionRecord[]>;

  // Approval Matrix Rules
  getApprovalRules(tenantId: string): Promise<ApprovalMatrixRule[]>;
  saveApprovalRule(rule: ApprovalMatrixRule): Promise<void>;

  // Acknowledgement Campaigns & Records
  saveCampaign(campaign: AcknowledgementCampaign): Promise<void>;
  getCampaignById(tenantId: string, campaignId: string): Promise<AcknowledgementCampaign | null>;
  getCampaigns(tenantId: string): Promise<AcknowledgementCampaign[]>;
  saveAcknowledgementRecord(record: AcknowledgementEvidenceRecord): Promise<void>;
  getAcknowledgementRecords(campaignId: string): Promise<AcknowledgementEvidenceRecord[]>;

  // Implementation Plans
  saveImplementationPlan(plan: ImplementationPlan): Promise<void>;
  getImplementationPlan(tenantId: string, planId: string): Promise<ImplementationPlan | null>;

  // Expected Evidence Specs
  saveExpectedEvidenceSpecs(tenantId: string, documentId: string, specs: ExpectedEvidenceSpec[]): Promise<void>;
  getExpectedEvidenceSpecs(tenantId: string, documentId: string): Promise<ExpectedEvidenceSpec[]>;

  // Review Tasks
  saveReviewTask(task: GovernanceReviewTask): Promise<void>;
  getReviewTasks(tenantId: string): Promise<GovernanceReviewTask[]>;
}

// ----------------------------------------------------------------------------
// DURABLE JSON REPOSITORY IMPLEMENTATION (CONCURRENCY-SAFE ATOMIC FILE STORAGE)
// ----------------------------------------------------------------------------
export class DurableJsonPolicyRepository implements IPolicyDataStore {
  private filePath: string;

  constructor(customPath?: string) {
    this.filePath = customPath || path.join(process.cwd(), 'data', 'policy_governance_store.json');
    this.ensureFileExists();
  }

  private ensureFileExists(): void {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(this.filePath)) {
      const initial = {
        documents: [],
        versions: [],
        approvalRules: [],
        campaigns: [],
        acknowledgements: [],
        implementationPlans: [],
        evidenceSpecs: [],
        reviewTasks: []
      };
      fs.writeFileSync(this.filePath, JSON.stringify(initial, null, 2), 'utf8');
    }
  }

  private readStore(): any {
    this.ensureFileExists();
    try {
      const raw = fs.readFileSync(this.filePath, 'utf8');
      return JSON.parse(raw);
    } catch {
      return {
        documents: [],
        versions: [],
        approvalRules: [],
        campaigns: [],
        acknowledgements: [],
        implementationPlans: [],
        evidenceSpecs: [],
        reviewTasks: []
      };
    }
  }

  private writeStore(data: any): void {
    const tmp = `${this.filePath}.${Date.now()}.${crypto.randomBytes(3).toString('hex')}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tmp, this.filePath);
  }

  public async getDocuments(tenantId: string): Promise<GovernanceDocument[]> {
    const store = this.readStore();
    return (store.documents || []).filter((d: GovernanceDocument) => d.tenantId === tenantId);
  }

  public async getDocumentById(tenantId: string, id: string): Promise<GovernanceDocument | null> {
    const store = this.readStore();
    return (store.documents || []).find((d: GovernanceDocument) => d.tenantId === tenantId && d.id === id) || null;
  }

  public async saveDocument(doc: GovernanceDocument): Promise<GovernanceDocument> {
    const store = this.readStore();
    const docs: GovernanceDocument[] = store.documents || [];
    const idx = docs.findIndex(d => d.tenantId === doc.tenantId && d.id === doc.id);
    if (idx >= 0) {
      docs[idx] = { ...docs[idx], ...doc, updatedAt: new Date().toISOString() };
    } else {
      docs.push({ ...doc, updatedAt: new Date().toISOString() });
    }
    store.documents = docs;
    this.writeStore(store);
    return doc;
  }

  public async deleteDocument(tenantId: string, id: string): Promise<boolean> {
    const store = this.readStore();
    const beforeLen = (store.documents || []).length;
    store.documents = (store.documents || []).filter((d: GovernanceDocument) => !(d.tenantId === tenantId && d.id === id));
    this.writeStore(store);
    return store.documents.length < beforeLen;
  }

  public async saveVersion(tenantId: string, documentId: string, record: DocumentVersionRecord): Promise<void> {
    const store = this.readStore();
    const versions = store.versions || [];
    const existing = versions.find((v: any) => v.tenantId === tenantId && v.documentId === documentId && v.version === record.version);
    if (!existing) {
      versions.push({ tenantId, documentId, ...record });
      store.versions = versions;
      this.writeStore(store);
    }
  }

  public async getVersions(tenantId: string, documentId: string): Promise<DocumentVersionRecord[]> {
    const store = this.readStore();
    return (store.versions || [])
      .filter((v: any) => v.tenantId === tenantId && v.documentId === documentId)
      .map(({ tenantId: _t, documentId: _d, ...rec }: any) => rec as DocumentVersionRecord);
  }

  public async getApprovalRules(tenantId: string): Promise<ApprovalMatrixRule[]> {
    const store = this.readStore();
    return (store.approvalRules || []).filter((r: ApprovalMatrixRule) => r.tenantId === tenantId);
  }

  public async saveApprovalRule(rule: ApprovalMatrixRule): Promise<void> {
    const store = this.readStore();
    const rules: ApprovalMatrixRule[] = store.approvalRules || [];
    const idx = rules.findIndex(r => r.tenantId === rule.tenantId && r.id === rule.id);
    if (idx >= 0) rules[idx] = rule;
    else rules.push(rule);
    store.approvalRules = rules;
    this.writeStore(store);
  }

  public async saveCampaign(campaign: AcknowledgementCampaign): Promise<void> {
    const store = this.readStore();
    const camps: AcknowledgementCampaign[] = store.campaigns || [];
    const idx = camps.findIndex(c => c.tenantId === campaign.tenantId && c.id === campaign.id);
    if (idx >= 0) camps[idx] = campaign;
    else camps.push(campaign);
    store.campaigns = camps;
    this.writeStore(store);
  }

  public async getCampaignById(tenantId: string, campaignId: string): Promise<AcknowledgementCampaign | null> {
    const store = this.readStore();
    return (store.campaigns || []).find((c: AcknowledgementCampaign) => c.tenantId === tenantId && c.id === campaignId) || null;
  }

  public async getCampaigns(tenantId: string): Promise<AcknowledgementCampaign[]> {
    const store = this.readStore();
    return (store.campaigns || []).filter((c: AcknowledgementCampaign) => c.tenantId === tenantId);
  }

  public async saveAcknowledgementRecord(record: AcknowledgementEvidenceRecord): Promise<void> {
    const store = this.readStore();
    const acks: AcknowledgementEvidenceRecord[] = store.acknowledgements || [];
    const existing = acks.find(a => a.campaignId === record.campaignId && a.userEmail.toLowerCase() === record.userEmail.toLowerCase());
    if (!existing) {
      acks.push(record);
      store.acknowledgements = acks;
      this.writeStore(store);
    }
  }

  public async getAcknowledgementRecords(campaignId: string): Promise<AcknowledgementEvidenceRecord[]> {
    const store = this.readStore();
    return (store.acknowledgements || []).filter((a: AcknowledgementEvidenceRecord) => a.campaignId === campaignId);
  }

  public async saveImplementationPlan(plan: ImplementationPlan): Promise<void> {
    const store = this.readStore();
    const plans: ImplementationPlan[] = store.implementationPlans || [];
    const idx = plans.findIndex(p => p.tenantId === plan.tenantId && p.id === plan.id);
    if (idx >= 0) plans[idx] = plan;
    else plans.push(plan);
    store.implementationPlans = plans;
    this.writeStore(store);
  }

  public async getImplementationPlan(tenantId: string, planId: string): Promise<ImplementationPlan | null> {
    const store = this.readStore();
    return (store.implementationPlans || []).find((p: ImplementationPlan) => p.tenantId === tenantId && p.id === planId) || null;
  }

  public async saveExpectedEvidenceSpecs(tenantId: string, documentId: string, specs: ExpectedEvidenceSpec[]): Promise<void> {
    const store = this.readStore();
    const allSpecs: any[] = (store.evidenceSpecs || []).filter((s: any) => !(s.tenantId === tenantId && s.documentId === documentId));
    allSpecs.push(...specs);
    store.evidenceSpecs = allSpecs;
    this.writeStore(store);
  }

  public async getExpectedEvidenceSpecs(tenantId: string, documentId: string): Promise<ExpectedEvidenceSpec[]> {
    const store = this.readStore();
    return (store.evidenceSpecs || []).filter((s: any) => s.tenantId === tenantId && s.documentId === documentId);
  }

  public async saveReviewTask(task: GovernanceReviewTask): Promise<void> {
    const store = this.readStore();
    const tasks: GovernanceReviewTask[] = store.reviewTasks || [];
    const idx = tasks.findIndex(t => t.tenantId === task.tenantId && t.taskId === task.taskId);
    if (idx >= 0) tasks[idx] = task;
    else tasks.push(task);
    store.reviewTasks = tasks;
    this.writeStore(store);
  }

  public async getReviewTasks(tenantId: string): Promise<GovernanceReviewTask[]> {
    const store = this.readStore();
    return (store.reviewTasks || []).filter((t: GovernanceReviewTask) => t.tenantId === tenantId);
  }
}

// ----------------------------------------------------------------------------
// POSTGRESQL ENTERPRISE REPOSITORY (REAL RELATIONAL PERSISTENCE WITH RLS)
// ----------------------------------------------------------------------------
export class PostgresPolicyRepository implements IPolicyDataStore {
  private pool: pg.Pool;

  constructor(customConfig?: pg.PoolConfig) {
    this.pool = new pg.Pool(customConfig || {
      host: process.env.PGHOST || 'localhost',
      port: parseInt(process.env.PGPORT || '5432', 10),
      user: process.env.PGUSER || 'skanda_app_user',
      password: process.env.PGPASSWORD || 'skanda_app_pass_2026',
      database: process.env.PGDATABASE || 'skanda_policy_staging_p46',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000
    });
  }

  public getPool(): pg.Pool {
    return this.pool;
  }

  public async close(): Promise<void> {
    await this.pool.end();
  }

  /**
   * Executes a callback within a transaction where the tenant context is strictly set
   * and guaranteed to be reset before releasing the connection back to the pool.
   */
  public async withTenantClient<T>(tenantId: string, fn: (client: pg.PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      // Set session context for RLS enforcement
      await client.query("SELECT set_config('app.current_tenant_id', $1, true);", [tenantId]);
      const result = await fn(client);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      try {
        await client.query("SELECT set_config('app.current_tenant_id', '', false);");
      } catch {}
      client.release();
    }
  }

  private mapRowToDocument(row: any, versions: DocumentVersionRecord[] = []): GovernanceDocument {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      code: row.code,
      title: row.title,
      type: row.type,
      departmentId: row.department_id,
      departmentName: row.department_name,
      processId: row.process_id,
      processName: row.process_name,
      frameworkCodes: Array.isArray(row.framework_codes) ? row.framework_codes : (typeof row.framework_codes === 'string' ? JSON.parse(row.framework_codes) : []),
      currentVersion: row.current_version,
      status: row.status,
      ownerEmail: row.owner_email,
      ownerRole: row.owner_role,
      authorEmail: row.author_email,
      authorRole: row.author_role,
      reviewCadence: row.review_cadence,
      lastReviewDate: row.last_review_date ? new Date(row.last_review_date).toISOString() : undefined,
      nextReviewDate: row.next_review_date ? new Date(row.next_review_date).toISOString() : new Date().toISOString(),
      reviewStatus: row.review_status,
      effectiveDate: row.effective_date ? new Date(row.effective_date).toISOString() : undefined,
      content: typeof row.content === 'string' ? JSON.parse(row.content) : (row.content || {}),
      versions,
      linkedControlCodes: Array.isArray(row.linked_control_codes) ? row.linked_control_codes : (typeof row.linked_control_codes === 'string' ? JSON.parse(row.linked_control_codes) : []),
      linkedRiskIds: Array.isArray(row.linked_risk_ids) ? row.linked_risk_ids : (typeof row.linked_risk_ids === 'string' ? JSON.parse(row.linked_risk_ids) : []),
      mandatoryAcknowledgement: row.mandatory_acknowledgement ?? true,
      acknowledgementCampaignId: row.acknowledgement_campaign_id,
      acknowledgementRate: row.acknowledgement_rate ?? 0,
      implementationPlanId: row.implementation_plan_id,
      implementationScore: row.implementation_score ?? 0,
      sha256Digest: row.sha256_digest,
      createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
      updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString()
    };
  }

  public async getDocuments(tenantId: string): Promise<GovernanceDocument[]> {
    return this.withTenantClient(tenantId, async (client) => {
      const docsRes = await client.query(
        `SELECT * FROM policy_documents WHERE tenant_id = $1::uuid AND deleted_at IS NULL ORDER BY created_at DESC;`,
        [tenantId]
      );
      const docs: GovernanceDocument[] = [];
      for (const row of docsRes.rows) {
        const verRes = await client.query(
          `SELECT * FROM policy_versions WHERE tenant_id = $1::uuid AND document_id = $2 ORDER BY created_at ASC;`,
          [tenantId, row.id]
        );
        const versions: DocumentVersionRecord[] = verRes.rows.map(v => ({
          version: v.version,
          changeSummary: v.change_summary,
          changedSections: Array.isArray(v.changed_sections) ? v.changed_sections : JSON.parse(v.changed_sections || '[]'),
          reasonForChange: v.reason_for_change,
          authorEmail: v.author_email,
          authorRole: v.author_role,
          reviewedBy: v.reviewed_by,
          reviewedAt: v.reviewed_at ? new Date(v.reviewed_at).toISOString() : undefined,
          approvedBy: v.approved_by,
          approvedAt: v.approved_at ? new Date(v.approved_at).toISOString() : undefined,
          publishedAt: v.published_at ? new Date(v.published_at).toISOString() : undefined,
          sha256Digest: v.sha256_digest,
          effectiveDate: v.effective_date ? new Date(v.effective_date).toISOString() : undefined
        }));
        docs.push(this.mapRowToDocument(row, versions));
      }
      return docs;
    });
  }

  public async getDocumentById(tenantId: string, id: string): Promise<GovernanceDocument | null> {
    return this.withTenantClient(tenantId, async (client) => {
      const docsRes = await client.query(
        `SELECT * FROM policy_documents WHERE tenant_id = $1::uuid AND id = $2 AND deleted_at IS NULL;`,
        [tenantId, id]
      );
      if (docsRes.rows.length === 0) return null;
      const row = docsRes.rows[0];
      const verRes = await client.query(
        `SELECT * FROM policy_versions WHERE tenant_id = $1::uuid AND document_id = $2 ORDER BY created_at ASC;`,
        [tenantId, id]
      );
      const versions: DocumentVersionRecord[] = verRes.rows.map(v => ({
        version: v.version,
        changeSummary: v.change_summary,
        changedSections: Array.isArray(v.changed_sections) ? v.changed_sections : JSON.parse(v.changed_sections || '[]'),
        reasonForChange: v.reason_for_change,
        authorEmail: v.author_email,
        authorRole: v.author_role,
        reviewedBy: v.reviewed_by,
        reviewedAt: v.reviewed_at ? new Date(v.reviewed_at).toISOString() : undefined,
        approvedBy: v.approved_by,
        approvedAt: v.approved_at ? new Date(v.approved_at).toISOString() : undefined,
        publishedAt: v.published_at ? new Date(v.published_at).toISOString() : undefined,
        sha256Digest: v.sha256_digest,
        effectiveDate: v.effective_date ? new Date(v.effective_date).toISOString() : undefined
      }));
      return this.mapRowToDocument(row, versions);
    });
  }

  public async saveDocument(doc: GovernanceDocument): Promise<GovernanceDocument> {
    return this.withTenantClient(doc.tenantId, async (client) => {
      await client.query(
        `INSERT INTO policy_documents (
          id, tenant_id, code, title, type, department_id, department_name,
          process_id, process_name, framework_codes, current_version, status,
          owner_email, owner_role, author_email, author_role, review_cadence,
          last_review_date, next_review_date, review_status, effective_date,
          content, linked_control_codes, linked_risk_ids, mandatory_acknowledgement,
          acknowledgement_campaign_id, acknowledgement_rate, implementation_plan_id,
          implementation_score, sha256_digest, created_at, updated_at
        ) VALUES (
          $1, $2::uuid, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
          $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32
        ) ON CONFLICT (tenant_id, code) DO UPDATE SET
          title = EXCLUDED.title,
          type = EXCLUDED.type,
          current_version = EXCLUDED.current_version,
          status = EXCLUDED.status,
          owner_email = EXCLUDED.owner_email,
          owner_role = EXCLUDED.owner_role,
          author_email = EXCLUDED.author_email,
          author_role = EXCLUDED.author_role,
          review_cadence = EXCLUDED.review_cadence,
          last_review_date = EXCLUDED.last_review_date,
          next_review_date = EXCLUDED.next_review_date,
          review_status = EXCLUDED.review_status,
          effective_date = EXCLUDED.effective_date,
          content = EXCLUDED.content,
          linked_control_codes = EXCLUDED.linked_control_codes,
          linked_risk_ids = EXCLUDED.linked_risk_ids,
          acknowledgement_campaign_id = EXCLUDED.acknowledgement_campaign_id,
          acknowledgement_rate = EXCLUDED.acknowledgement_rate,
          implementation_plan_id = EXCLUDED.implementation_plan_id,
          implementation_score = EXCLUDED.implementation_score,
          sha256_digest = EXCLUDED.sha256_digest,
          updated_at = NOW();`,
        [
          doc.id,
          doc.tenantId,
          doc.code,
          doc.title,
          doc.type,
          doc.departmentId || null,
          doc.departmentName || null,
          doc.processId || null,
          doc.processName || null,
          JSON.stringify(doc.frameworkCodes || []),
          doc.currentVersion,
          doc.status,
          doc.ownerEmail,
          doc.ownerRole,
          doc.authorEmail,
          doc.authorRole,
          doc.reviewCadence,
          doc.lastReviewDate ? new Date(doc.lastReviewDate) : null,
          doc.nextReviewDate ? new Date(doc.nextReviewDate) : new Date(),
          doc.reviewStatus,
          doc.effectiveDate ? new Date(doc.effectiveDate) : null,
          JSON.stringify(doc.content),
          JSON.stringify(doc.linkedControlCodes || []),
          JSON.stringify(doc.linkedRiskIds || []),
          doc.mandatoryAcknowledgement,
          doc.acknowledgementCampaignId || null,
          doc.acknowledgementRate || 0,
          doc.implementationPlanId || null,
          doc.implementationScore || 0,
          doc.sha256Digest,
          doc.createdAt ? new Date(doc.createdAt) : new Date(),
          new Date()
        ]
      );

      // Save versions if present
      if (doc.versions && doc.versions.length > 0) {
        for (const ver of doc.versions) {
          await client.query(
            `INSERT INTO policy_versions (
              id, tenant_id, document_id, version, change_summary, changed_sections,
              reason_for_change, author_email, author_role, reviewed_by, reviewed_at,
              approved_by, approved_at, published_at, sha256_digest, effective_date,
              canonical_content, created_at
            ) VALUES (
              $1, $2::uuid, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW()
            ) ON CONFLICT (document_id, version) DO NOTHING;`,
            [
              `VER-${doc.id}-${ver.version}`,
              doc.tenantId,
              doc.id,
              ver.version,
              ver.changeSummary || 'Version record',
              JSON.stringify(ver.changedSections || []),
              ver.reasonForChange || 'Scheduled revision',
              ver.authorEmail || doc.authorEmail,
              ver.authorRole || doc.authorRole,
              ver.reviewedBy || null,
              ver.reviewedAt ? new Date(ver.reviewedAt) : null,
              ver.approvedBy || null,
              ver.approvedAt ? new Date(ver.approvedAt) : null,
              ver.publishedAt ? new Date(ver.publishedAt) : null,
              ver.sha256Digest || doc.sha256Digest,
              ver.effectiveDate ? new Date(ver.effectiveDate) : null,
              JSON.stringify(doc.content)
            ]
          );
        }
      }

      return doc;
    });
  }

  public async deleteDocument(tenantId: string, id: string): Promise<boolean> {
    return this.withTenantClient(tenantId, async (client) => {
      const res = await client.query(
        `UPDATE policy_documents SET deleted_at = NOW() WHERE tenant_id = $1::uuid AND id = $2;`,
        [tenantId, id]
      );
      return (res.rowCount || 0) > 0;
    });
  }

  public async saveVersion(tenantId: string, documentId: string, record: DocumentVersionRecord): Promise<void> {
    return this.withTenantClient(tenantId, async (client) => {
      await client.query(
        `INSERT INTO policy_versions (
          id, tenant_id, document_id, version, change_summary, changed_sections,
          reason_for_change, author_email, author_role, reviewed_by, reviewed_at,
          approved_by, approved_at, published_at, sha256_digest, effective_date,
          canonical_content, created_at
        ) VALUES (
          $1, $2::uuid, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW()
        ) ON CONFLICT (document_id, version) DO NOTHING;`,
        [
          `VER-${documentId}-${record.version}`,
          tenantId,
          documentId,
          record.version,
          record.changeSummary || 'Version record',
          JSON.stringify(record.changedSections || []),
          record.reasonForChange || 'Revision',
          record.authorEmail,
          record.authorRole,
          record.reviewedBy || null,
          record.reviewedAt ? new Date(record.reviewedAt) : null,
          record.approvedBy || null,
          record.approvedAt ? new Date(record.approvedAt) : null,
          record.publishedAt ? new Date(record.publishedAt) : null,
          record.sha256Digest,
          record.effectiveDate ? new Date(record.effectiveDate) : null,
          JSON.stringify({})
        ]
      );
    });
  }

  public async getVersions(tenantId: string, documentId: string): Promise<DocumentVersionRecord[]> {
    return this.withTenantClient(tenantId, async (client) => {
      const res = await client.query(
        `SELECT * FROM policy_versions WHERE tenant_id = $1::uuid AND document_id = $2 ORDER BY created_at ASC;`,
        [tenantId, documentId]
      );
      return res.rows.map(v => ({
        version: v.version,
        changeSummary: v.change_summary,
        changedSections: Array.isArray(v.changed_sections) ? v.changed_sections : JSON.parse(v.changed_sections || '[]'),
        reasonForChange: v.reason_for_change,
        authorEmail: v.author_email,
        authorRole: v.author_role,
        reviewedBy: v.reviewed_by,
        reviewedAt: v.reviewed_at ? new Date(v.reviewed_at).toISOString() : undefined,
        approvedBy: v.approved_by,
        approvedAt: v.approved_at ? new Date(v.approved_at).toISOString() : undefined,
        publishedAt: v.published_at ? new Date(v.published_at).toISOString() : undefined,
        sha256Digest: v.sha256_digest,
        effectiveDate: v.effective_date ? new Date(v.effective_date).toISOString() : undefined
      }));
    });
  }

  public async getApprovalRules(tenantId: string): Promise<ApprovalMatrixRule[]> {
    return this.withTenantClient(tenantId, async (client) => {
      const res = await client.query(
        `SELECT * FROM policy_approval_rules WHERE tenant_id = $1::uuid;`,
        [tenantId]
      );
      return res.rows.map(r => ({
        id: r.id,
        tenantId: r.tenant_id,
        documentType: r.document_type,
        departmentDomain: r.department_domain,
        authorizedApproverRole: r.authorized_approver_role,
        authorizedApproverEmail: r.authorized_approver_email,
        escalationApproverRole: r.escalation_approver_role
      }));
    });
  }

  public async saveApprovalRule(rule: ApprovalMatrixRule): Promise<void> {
    return this.withTenantClient(rule.tenantId, async (client) => {
      await client.query(
        `INSERT INTO policy_approval_rules (
          id, tenant_id, document_type, department_domain, authorized_approver_role,
          authorized_approver_email, escalation_approver_role
        ) VALUES ($1, $2::uuid, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO UPDATE SET
          authorized_approver_role = EXCLUDED.authorized_approver_role,
          authorized_approver_email = EXCLUDED.authorized_approver_email,
          escalation_approver_role = EXCLUDED.escalation_approver_role;`,
        [
          rule.id,
          rule.tenantId,
          rule.documentType,
          rule.departmentDomain,
          rule.authorizedApproverRole,
          rule.authorizedApproverEmail || null,
          rule.escalationApproverRole || null
        ]
      );
    });
  }

  public async saveCampaign(campaign: AcknowledgementCampaign): Promise<void> {
    return this.withTenantClient(campaign.tenantId, async (client) => {
      await client.query(
        `INSERT INTO policy_acknowledgement_campaigns (
          id, tenant_id, document_id, document_code, document_title, document_version,
          target_scope, target_department_id, target_role, due_date, total_required,
          sent_count, viewed_count, acknowledged_count, overdue_count, exempted_count, status
        ) VALUES ($1, $2::uuid, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        ON CONFLICT (id) DO UPDATE SET
          acknowledged_count = EXCLUDED.acknowledged_count,
          status = EXCLUDED.status;`,
        [
          campaign.id,
          campaign.tenantId,
          campaign.documentId,
          campaign.documentCode,
          campaign.documentTitle,
          campaign.documentVersion,
          campaign.targetScope,
          campaign.targetDepartmentId || null,
          campaign.targetRole || null,
          new Date(campaign.dueDate),
          campaign.totalRequired,
          campaign.sentCount,
          campaign.viewedCount,
          campaign.acknowledgedCount,
          campaign.overdueCount,
          campaign.exemptedCount,
          campaign.status
        ]
      );
    });
  }

  public async getCampaignById(tenantId: string, campaignId: string): Promise<AcknowledgementCampaign | null> {
    return this.withTenantClient(tenantId, async (client) => {
      const res = await client.query(
        `SELECT * FROM policy_acknowledgement_campaigns WHERE tenant_id = $1::uuid AND id = $2;`,
        [tenantId, campaignId]
      );
      if (res.rows.length === 0) return null;
      const c = res.rows[0];
      return {
        id: c.id,
        tenantId: c.tenant_id,
        documentId: c.document_id,
        documentCode: c.document_code,
        documentTitle: c.document_title,
        documentVersion: c.document_version,
        targetScope: c.target_scope,
        targetDepartmentId: c.target_department_id,
        targetRole: c.target_role,
        dueDate: new Date(c.due_date).toISOString(),
        totalRequired: c.total_required,
        sentCount: c.sent_count,
        viewedCount: c.viewed_count,
        acknowledgedCount: c.acknowledged_count,
        overdueCount: c.overdue_count,
        exemptedCount: c.exempted_count,
        status: c.status,
        createdAt: new Date(c.created_at).toISOString()
      };
    });
  }

  public async getCampaigns(tenantId: string): Promise<AcknowledgementCampaign[]> {
    return this.withTenantClient(tenantId, async (client) => {
      const res = await client.query(
        `SELECT * FROM policy_acknowledgement_campaigns WHERE tenant_id = $1::uuid;`,
        [tenantId]
      );
      return res.rows.map(c => ({
        id: c.id,
        tenantId: c.tenant_id,
        documentId: c.document_id,
        documentCode: c.document_code,
        documentTitle: c.document_title,
        documentVersion: c.document_version,
        targetScope: c.target_scope,
        targetDepartmentId: c.target_department_id,
        targetRole: c.target_role,
        dueDate: new Date(c.due_date).toISOString(),
        totalRequired: c.total_required,
        sentCount: c.sent_count,
        viewedCount: c.viewed_count,
        acknowledgedCount: c.acknowledged_count,
        overdueCount: c.overdue_count,
        exemptedCount: c.exempted_count,
        status: c.status,
        createdAt: new Date(c.created_at).toISOString()
      }));
    });
  }

  public async saveAcknowledgementRecord(record: AcknowledgementEvidenceRecord): Promise<void> {
    return this.withTenantClient(record.tenantId, async (client) => {
      await client.query(
        `INSERT INTO policy_acknowledgement_records (
          id, tenant_id, campaign_id, document_id, document_version, user_email,
          user_name, user_role, department, status, acknowledged_at, method,
          ip_address, audit_signature
        ) VALUES ($1, $2::uuid, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        ON CONFLICT (campaign_id, user_email) DO NOTHING;`,
        [
          record.id,
          record.tenantId,
          record.campaignId,
          record.documentId,
          record.documentVersion,
          record.userEmail,
          record.userName,
          record.userRole,
          record.department,
          record.status,
          new Date(record.acknowledgedAt),
          record.method,
          record.ipAddress || null,
          record.auditSignature
        ]
      );
    });
  }

  public async getAcknowledgementRecords(campaignId: string, tenantId?: string): Promise<AcknowledgementEvidenceRecord[]> {
    if (tenantId) {
      return this.withTenantClient(tenantId, async (client) => {
        const res = await client.query(
          `SELECT * FROM policy_acknowledgement_records WHERE campaign_id = $1 AND tenant_id = $2::uuid;`,
          [campaignId, tenantId]
        );
        return res.rows.map(r => ({
          id: r.id,
          tenantId: r.tenant_id,
          campaignId: r.campaign_id,
          documentId: r.document_id,
          documentVersion: r.document_version,
          userEmail: r.user_email,
          userName: r.user_name,
          userRole: r.user_role,
          department: r.department,
          status: r.status,
          acknowledgedAt: new Date(r.acknowledged_at).toISOString(),
          method: r.method,
          ipAddress: r.ip_address,
          auditSignature: r.audit_signature
        }));
      });
    }

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN;');
      await client.query("SELECT set_config('app.is_platform_admin', 'true', true);");
      const res = await client.query(
        `SELECT * FROM policy_acknowledgement_records WHERE campaign_id = $1;`,
        [campaignId]
      );
      await client.query('COMMIT;');
      return res.rows.map(r => ({
        id: r.id,
        tenantId: r.tenant_id,
        campaignId: r.campaign_id,
        documentId: r.document_id,
        documentVersion: r.document_version,
        userEmail: r.user_email,
        userName: r.user_name,
        userRole: r.user_role,
        department: r.department,
        status: r.status,
        acknowledgedAt: new Date(r.acknowledged_at).toISOString(),
        method: r.method,
        ipAddress: r.ip_address,
        auditSignature: r.audit_signature
      }));
    } catch (err) {
      await client.query('ROLLBACK;').catch(() => {});
      throw err;
    } finally {
      try {
        await client.query("RESET app.current_tenant_id;");
        await client.query("RESET app.is_platform_admin;");
      } catch {}
      client.release();
    }
  }

  public async saveImplementationPlan(plan: ImplementationPlan): Promise<void> {
    return this.withTenantClient(plan.tenantId, async (client) => {
      await client.query(
        `INSERT INTO policy_implementation_plans (
          id, tenant_id, document_id, document_code, document_title, overall_score, tasks, status
        ) VALUES ($1, $2::uuid, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (id) DO UPDATE SET
          overall_score = EXCLUDED.overall_score,
          tasks = EXCLUDED.tasks,
          status = EXCLUDED.status,
          updated_at = NOW();`,
        [
          plan.id,
          plan.tenantId,
          plan.documentId,
          plan.documentCode,
          plan.documentTitle,
          plan.overallScore,
          JSON.stringify(plan.tasks || []),
          plan.status
        ]
      );
    });
  }

  public async getImplementationPlan(tenantId: string, planId: string): Promise<ImplementationPlan | null> {
    return this.withTenantClient(tenantId, async (client) => {
      const res = await client.query(
        `SELECT * FROM policy_implementation_plans WHERE tenant_id = $1::uuid AND id = $2;`,
        [tenantId, planId]
      );
      if (res.rows.length === 0) return null;
      const p = res.rows[0];
      return {
        id: p.id,
        tenantId: p.tenant_id,
        documentId: p.document_id,
        documentCode: p.document_code,
        documentTitle: p.document_title,
        overallScore: p.overall_score,
        tasks: Array.isArray(p.tasks) ? p.tasks : JSON.parse(p.tasks || '[]'),
        status: p.status,
        createdAt: new Date(p.created_at).toISOString(),
        updatedAt: p.updated_at ? new Date(p.updated_at).toISOString() : new Date(p.created_at).toISOString()
      };
    });
  }

  public async saveExpectedEvidenceSpecs(tenantId: string, documentId: string, specs: ExpectedEvidenceSpec[]): Promise<void> {
    return this.withTenantClient(tenantId, async (client) => {
      await client.query(
        `DELETE FROM policy_expected_evidence_specs WHERE tenant_id = $1::uuid AND document_id = $2;`,
        [tenantId, documentId]
      );
      for (const s of specs) {
        await client.query(
          `INSERT INTO policy_expected_evidence_specs (
            id, tenant_id, document_id, control_code, evidence_title, owner_role,
            owner_email, generation_cadence, retention_days, harvest_method, current_availability
          ) VALUES ($1, $2::uuid, $3, $4, $5, $6, $7, $8, $9, $10, $11);`,
          [
            s.id,
            tenantId,
            documentId,
            s.controlCode,
            s.evidenceTitle,
            s.ownerRole,
            s.ownerEmail,
            s.generationCadence,
            s.retentionDays,
            s.harvestMethod,
            s.currentAvailability
          ]
        );
      }
    });
  }

  public async getExpectedEvidenceSpecs(tenantId: string, documentId: string): Promise<ExpectedEvidenceSpec[]> {
    return this.withTenantClient(tenantId, async (client) => {
      const res = await client.query(
        `SELECT * FROM policy_expected_evidence_specs WHERE tenant_id = $1::uuid AND document_id = $2;`,
        [tenantId, documentId]
      );
      return res.rows.map(s => ({
        id: s.id,
        tenantId: s.tenant_id,
        documentId: s.document_id,
        controlCode: s.control_code,
        evidenceTitle: s.evidence_title,
        ownerRole: s.owner_role,
        ownerEmail: s.owner_email,
        generationCadence: s.generation_cadence,
        retentionDays: s.retention_days,
        harvestMethod: s.harvest_method,
        currentAvailability: s.current_availability,
        lastHarvestedAt: s.last_harvested_at ? new Date(s.last_harvested_at).toISOString() : undefined
      }));
    });
  }

  public async saveReviewTask(task: GovernanceReviewTask): Promise<void> {
    return this.withTenantClient(task.tenantId, async (client) => {
      await client.query(
        `INSERT INTO policy_governance_review_tasks (
          id, tenant_id, document_id, document_code, trigger_type, trigger_source,
          responsible_owner, due_date, relevant_evidence_specs, proposed_changes,
          approval_requirements, status
        ) VALUES ($1, $2::uuid, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status;`,
        [
          task.taskId,
          task.tenantId,
          task.documentId,
          task.documentCode,
          task.triggerType,
          task.triggerSource,
          task.responsibleOwner,
          new Date(task.dueDate),
          JSON.stringify(task.relevantEvidenceSpecs || []),
          JSON.stringify(task.proposedChanges || []),
          JSON.stringify(task.approvalRequirements || []),
          task.status
        ]
      );
    });
  }

  public async getReviewTasks(tenantId: string): Promise<GovernanceReviewTask[]> {
    return this.withTenantClient(tenantId, async (client) => {
      const res = await client.query(
        `SELECT * FROM policy_governance_review_tasks WHERE tenant_id = $1::uuid;`,
        [tenantId]
      );
      return res.rows.map(t => ({
        taskId: t.id,
        tenantId: t.tenant_id,
        documentId: t.document_id,
        documentCode: t.document_code,
        triggerType: t.trigger_type,
        triggerSource: t.trigger_source,
        responsibleOwner: t.responsible_owner,
        dueDate: new Date(t.due_date).toISOString(),
        relevantEvidenceSpecs: Array.isArray(t.relevant_evidence_specs) ? t.relevant_evidence_specs : JSON.parse(t.relevant_evidence_specs || '[]'),
        proposedChanges: Array.isArray(t.proposed_changes) ? t.proposed_changes : JSON.parse(t.proposed_changes || '[]'),
        approvalRequirements: Array.isArray(t.approval_requirements) ? t.approval_requirements : JSON.parse(t.approval_requirements || '[]'),
        status: t.status
      }));
    });
  }
}

// ----------------------------------------------------------------------------
// POSTGRESQL / ENTERPRISE HYBRID DATA STORE MANAGER
// ----------------------------------------------------------------------------
export class PolicyRepository implements IPolicyDataStore {
  private static instance: PolicyRepository;
  // Constructed on first use, never at import time. Some client workspaces
  // import the policy engines (which import this repository), and constructing
  // the durable JSON store touches Node-only modules such as `path`, which
  // threw while the browser entry module was evaluating and blanked the app.
  private durableFallback?: DurableJsonPolicyRepository;
  private postgresRepo?: PostgresPolicyRepository;
  private activeProvider: 'POSTGRES' | 'DURABLE_JSON' = 'DURABLE_JSON';

  private constructor() {}

  private get durableStore(): DurableJsonPolicyRepository {
    if (!this.durableFallback) {
      this.durableFallback = new DurableJsonPolicyRepository();
    }
    return this.durableFallback;
  }

  public static getInstance(): PolicyRepository {
    if (!PolicyRepository.instance) {
      PolicyRepository.instance = new PolicyRepository();
    }
    return PolicyRepository.instance;
  }

  public getPostgresRepository(): PostgresPolicyRepository {
    if (!this.postgresRepo) {
      this.postgresRepo = new PostgresPolicyRepository();
    }
    return this.postgresRepo;
  }

  public setStorageProvider(mode: 'POSTGRES' | 'DURABLE_JSON'): void {
    if (mode === 'POSTGRES') {
      if (!this.postgresRepo) {
        this.postgresRepo = new PostgresPolicyRepository();
      }
    }
    this.activeProvider = mode;
  }

  public getStorageProvider(): 'POSTGRES' | 'DURABLE_JSON' {
    return this.activeProvider;
  }

  private assertPersistenceMode(): void {
    if (postgresConnectionManager.isProductionEnvironment()) {
      const health = postgresConnectionManager.evaluateConnectivity('production');
      if (health.status !== 'HEALTHY') {
        throw new EnterpriseDatabaseUnavailableFatalError(
          `Production database access denied: Managed PostgreSQL with 005_enterprise_policy_governance migration required. ${health.errorMessage || 'Database unavailable'}`
        );
      }
      this.activeProvider = 'POSTGRES';
    }
  }

  private getActiveStore(): IPolicyDataStore {
    this.assertPersistenceMode();
    if (this.activeProvider === 'POSTGRES') {
      return this.getPostgresRepository();
    }
    return this.durableStore;
  }

  public async getDocuments(tenantId: string): Promise<GovernanceDocument[]> {
    return this.getActiveStore().getDocuments(tenantId);
  }

  public async getDocumentById(tenantId: string, id: string): Promise<GovernanceDocument | null> {
    return this.getActiveStore().getDocumentById(tenantId, id);
  }

  public async saveDocument(doc: GovernanceDocument): Promise<GovernanceDocument> {
    const store = this.getActiveStore();
    const saved = await store.saveDocument(doc);
    // In dev/test when running in Postgres mode, also mirror to durable fallback for offline recovery
    if (this.activeProvider === 'POSTGRES') {
      this.durableStore.saveDocument(doc).catch(() => {});
    }
    return saved;
  }

  public async deleteDocument(tenantId: string, id: string): Promise<boolean> {
    return this.getActiveStore().deleteDocument(tenantId, id);
  }

  public async saveVersion(tenantId: string, documentId: string, record: DocumentVersionRecord): Promise<void> {
    return this.getActiveStore().saveVersion(tenantId, documentId, record);
  }

  public async getVersions(tenantId: string, documentId: string): Promise<DocumentVersionRecord[]> {
    return this.getActiveStore().getVersions(tenantId, documentId);
  }

  public async getApprovalRules(tenantId: string): Promise<ApprovalMatrixRule[]> {
    return this.getActiveStore().getApprovalRules(tenantId);
  }

  public async saveApprovalRule(rule: ApprovalMatrixRule): Promise<void> {
    return this.getActiveStore().saveApprovalRule(rule);
  }

  public async saveCampaign(campaign: AcknowledgementCampaign): Promise<void> {
    return this.getActiveStore().saveCampaign(campaign);
  }

  public async getCampaignById(tenantId: string, campaignId: string): Promise<AcknowledgementCampaign | null> {
    return this.getActiveStore().getCampaignById(tenantId, campaignId);
  }

  public async getCampaigns(tenantId: string): Promise<AcknowledgementCampaign[]> {
    return this.getActiveStore().getCampaigns(tenantId);
  }

  public async saveAcknowledgementRecord(record: AcknowledgementEvidenceRecord): Promise<void> {
    return this.getActiveStore().saveAcknowledgementRecord(record);
  }

  public async getAcknowledgementRecords(campaignId: string): Promise<AcknowledgementEvidenceRecord[]> {
    return this.getActiveStore().getAcknowledgementRecords(campaignId);
  }

  public async saveImplementationPlan(plan: ImplementationPlan): Promise<void> {
    return this.getActiveStore().saveImplementationPlan(plan);
  }

  public async getImplementationPlan(tenantId: string, planId: string): Promise<ImplementationPlan | null> {
    return this.getActiveStore().getImplementationPlan(tenantId, planId);
  }

  public async saveExpectedEvidenceSpecs(tenantId: string, documentId: string, specs: ExpectedEvidenceSpec[]): Promise<void> {
    return this.getActiveStore().saveExpectedEvidenceSpecs(tenantId, documentId, specs);
  }

  public async getExpectedEvidenceSpecs(tenantId: string, documentId: string): Promise<ExpectedEvidenceSpec[]> {
    return this.getActiveStore().getExpectedEvidenceSpecs(tenantId, documentId);
  }

  public async saveReviewTask(task: GovernanceReviewTask): Promise<void> {
    return this.getActiveStore().saveReviewTask(task);
  }

  public async getReviewTasks(tenantId: string): Promise<GovernanceReviewTask[]> {
    return this.getActiveStore().getReviewTasks(tenantId);
  }
}

export const policyRepository = PolicyRepository.getInstance();
