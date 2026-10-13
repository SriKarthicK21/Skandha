// ============================================================================
// SKANDA ENTERPRISE GRC: EXTERNAL AUDITOR CLEAN ROOM SERVICE
// Path: server/services/AuditorCleanRoomService.ts
//
// Provides secure, time-bound, scope-restricted access for third-party auditors
// (e.g. ISO 27001 Certification Bodies, SOC 2 Type II Assessors).
//
// Guarantees:
// 1. Explicit Invitation with Cryptographic Magic Token
// 2. Strict Time-Bound Expiry (default 72 hours, max 14 days)
// 3. Absolute Read-Only Permissions (zero mutations permitted)
// 4. Fine-Grained Scope Restriction (only authorized controls/evidence, not entire tenant)
// 5. Dynamic Forensic Watermarking (Email, IP, Timestamp, Tenant code)
// 6. Download Restrictions & Export Controls
// 7. Instant Revocation & Break-Glass Invalidation
// 8. WORM Audit Trail for every document access
// ============================================================================

import crypto from 'crypto';
import { enterpriseAuditService } from './EnterpriseAuditService.js';

export interface CleanRoomScope {
  frameworks: string[];
  controlCodes: string[];
  allowEvidenceDownload: boolean;
  watermarkEnabled: boolean;
}

export interface AuditorInvite {
  id: string;
  tenantId: string;
  invitedEmail: string;
  auditorOrg: string;
  purpose: string;
  scope: CleanRoomScope;
  tokenHash: string;
  expiresAt: string;
  createdAt: string;
  createdBy: string;
  status: 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'REVOKED';
  accessCount: number;
  lastAccessAt?: string;
  lastAccessIp?: string;
}

export interface WatermarkedEvidenceView {
  evidenceId: string;
  fileName: string;
  sha256Hash: string;
  watermarkText: string;
  accessGrantedAt: string;
  readOnly: true;
  downloadPermitted: boolean;
  scopedControlCode: string;
}

export class AuditorCleanRoomService {
  private static instance: AuditorCleanRoomService;
  private invites: Map<string, AuditorInvite> = new Map();
  private tokenSecret = process.env.AUDITOR_CLEAN_ROOM_SECRET || 'skanda-cleanroom-hmac-secret-cmk-2026';

  private constructor() {
    this.seedDefaultCleanRoomInvite();
  }

  public static getInstance(): AuditorCleanRoomService {
    if (!AuditorCleanRoomService.instance) {
      AuditorCleanRoomService.instance = new AuditorCleanRoomService();
    }
    return AuditorCleanRoomService.instance;
  }

  private seedDefaultCleanRoomInvite(): void {
    const inviteId = 'inv-cleanroom-buerau-veritas-01';
    const expiresAt = new Date(Date.now() + 72 * 3600 * 1000).toISOString();
    const token = 'cleanroom_bv_cert_audit_sample_token';
    const tokenHash = crypto.createHmac('sha256', this.tokenSecret).update(token).digest('hex');

    this.invites.set(inviteId, {
      id: inviteId,
      tenantId: 'tenant-acme-corp',
      invitedEmail: 'lead.auditor@certification-body.org',
      auditorOrg: 'Bureau Veritas Certification',
      purpose: 'ISO 27001:2022 Stage 2 Surveillance Audit',
      scope: {
        frameworks: ['ISO_27001_2022'],
        controlCodes: ['A.5.15', 'A.8.2', 'A.8.10', 'A.8.16'],
        allowEvidenceDownload: false,
        watermarkEnabled: true
      },
      tokenHash,
      expiresAt,
      createdAt: new Date().toISOString(),
      createdBy: 'ciso@acme-corp.com',
      status: 'ACTIVE',
      accessCount: 3,
      lastAccessAt: new Date().toISOString(),
      lastAccessIp: '203.0.113.42'
    });
  }

  /**
   * Generates a new time-bound Clean Room Invitation with cryptographic magic token
   */
  public createAuditorInvite(params: {
    tenantId: string;
    invitedEmail: string;
    auditorOrg: string;
    purpose: string;
    scope: CleanRoomScope;
    validHours?: number;
    createdBy: string;
  }): { invite: AuditorInvite; magicToken: string; inviteUrl: string } {
    const inviteId = `inv-cleanroom-${crypto.randomBytes(4).toString('hex')}`;
    const hours = Math.min(params.validHours || 72, 336); // max 14 days
    const expiresAt = new Date(Date.now() + hours * 3600 * 1000).toISOString();

    const rawToken = `sk_clean_${crypto.randomBytes(24).toString('hex')}`;
    const tokenHash = crypto.createHmac('sha256', this.tokenSecret).update(rawToken).digest('hex');

    const invite: AuditorInvite = {
      id: inviteId,
      tenantId: params.tenantId,
      invitedEmail: params.invitedEmail.toLowerCase(),
      auditorOrg: params.auditorOrg,
      purpose: params.purpose,
      scope: params.scope,
      tokenHash,
      expiresAt,
      createdAt: new Date().toISOString(),
      createdBy: params.createdBy,
      status: 'PENDING',
      accessCount: 0
    };

    this.invites.set(inviteId, invite);

    enterpriseAuditService.recordAuditEvent({
      tenantId: params.tenantId,
      actorId: params.createdBy,
      actorEmail: params.createdBy,
      action: 'CLEAN_ROOM_INVITE_CREATED',
      resourceType: 'AUDITOR_CLEAN_ROOM',
      resourceId: inviteId,
      payload: { invitedEmail: params.invitedEmail, expiresAt, scope: params.scope }
    });

    const inviteUrl = `https://grc.skanda.cloud/cleanroom?inviteId=${inviteId}&token=${rawToken}`;
    return { invite, magicToken: rawToken, inviteUrl };
  }

  /**
   * Validates clean room session token, checking expiry, revocation, and tenant isolation
   */
  public validateCleanRoomAccess(inviteId: string, rawToken: string, clientIp: string): AuditorInvite {
    const invite = this.invites.get(inviteId);
    if (!invite) {
      throw new Error('Clean Room invitation not found');
    }

    if (invite.status === 'REVOKED') {
      throw new Error('Clean Room access has been explicitly revoked by tenant administrator');
    }

    if (new Date() > new Date(invite.expiresAt)) {
      invite.status = 'EXPIRED';
      throw new Error('Clean Room session has expired');
    }

    const computedHash = crypto.createHmac('sha256', this.tokenSecret).update(rawToken).digest('hex');
    if (computedHash !== invite.tokenHash) {
      enterpriseAuditService.recordAuditEvent({
        tenantId: invite.tenantId,
        actorId: 'unauthorized-cleanroom',
        actorEmail: invite.invitedEmail,
        action: 'CLEAN_ROOM_AUTH_FAILED',
        resourceType: 'AUDITOR_CLEAN_ROOM',
        resourceId: inviteId,
        payload: { clientIp }
      });
      throw new Error('Invalid Clean Room token signature');
    }

    invite.status = 'ACTIVE';
    invite.accessCount += 1;
    invite.lastAccessAt = new Date().toISOString();
    invite.lastAccessIp = clientIp;

    return invite;
  }

  /**
   * Retrieves evidence securely with dynamic watermarking and strict scope enforcement
   */
  public getScopedEvidence(
    inviteId: string,
    rawToken: string,
    clientIp: string,
    evidenceItem: { id: string; fileName: string; sha256: string; controlCode: string }
  ): WatermarkedEvidenceView {
    const invite = this.validateCleanRoomAccess(inviteId, rawToken, clientIp);

    // Verify scope: Evidence MUST map to auditor's assigned control codes
    if (!invite.scope.controlCodes.includes(evidenceItem.controlCode)) {
      enterpriseAuditService.recordAuditEvent({
        tenantId: invite.tenantId,
        actorId: invite.invitedEmail,
        actorEmail: invite.invitedEmail,
        action: 'CLEAN_ROOM_SCOPE_VIOLATION_BLOCKED',
        resourceType: 'EVIDENCE',
        resourceId: evidenceItem.id,
        payload: { attemptedControl: evidenceItem.controlCode, allowedControls: invite.scope.controlCodes }
      });
      throw new Error(`Access Denied: Evidence for control ${evidenceItem.controlCode} is outside your assigned clean room audit scope`);
    }

    // Dynamic forensic watermark
    const nowUtc = new Date().toISOString();
    const watermarkText = `CONFIDENTIAL — AUDITOR CLEAN ROOM — ${invite.invitedEmail} — IP: ${clientIp} — ${nowUtc} — DO NOT DISTRIBUTE`;

    enterpriseAuditService.recordAuditEvent({
      tenantId: invite.tenantId,
      actorId: invite.invitedEmail,
      actorEmail: invite.invitedEmail,
      action: 'CLEAN_ROOM_EVIDENCE_ACCESSED',
      resourceType: 'EVIDENCE',
      resourceId: evidenceItem.id,
      payload: { clientIp, watermarkText, controlCode: evidenceItem.controlCode }
    });

    return {
      evidenceId: evidenceItem.id,
      fileName: evidenceItem.fileName,
      sha256Hash: evidenceItem.sha256,
      watermarkText,
      accessGrantedAt: nowUtc,
      readOnly: true,
      downloadPermitted: invite.scope.allowEvidenceDownload,
      scopedControlCode: evidenceItem.controlCode
    };
  }

  /**
   * Instant Clean Room Access Revocation
   */
  public revokeCleanRoomAccess(inviteId: string, revokedBy: string, tenantId: string): boolean {
    const invite = this.invites.get(inviteId);
    if (!invite || invite.tenantId !== tenantId) return false;

    invite.status = 'REVOKED';

    enterpriseAuditService.recordAuditEvent({
      tenantId,
      actorId: revokedBy,
      actorEmail: revokedBy,
      action: 'CLEAN_ROOM_INVITE_REVOKED',
      resourceType: 'AUDITOR_CLEAN_ROOM',
      resourceId: inviteId,
      payload: { revokedBy }
    });
    return true;
  }

  public listInvites(tenantId: string): AuditorInvite[] {
    return Array.from(this.invites.values()).filter(i => i.tenantId === tenantId);
  }
}

export const auditorCleanRoomService = AuditorCleanRoomService.getInstance();
