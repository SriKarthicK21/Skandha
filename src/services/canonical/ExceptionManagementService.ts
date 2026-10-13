/**
 * SKANDA EXCEPTION MANAGEMENT SERVICE
 * Path: src/services/canonical/ExceptionManagementService.ts
 * 
 * Manages time-bound policy & control deviations:
 * - Compensating control evaluation
 * - Review and expiration date tracking
 * - Integration with Next Best Action & Command Centre
 * - Full audit trail
 */

import { CanonicalException, ExceptionStatus } from '../../types/canonicalGrcTypes';
import { controlTestingService } from './ControlTestingService';

class ExceptionManagementService {
  private exceptions: Map<string, CanonicalException> = new Map();

  constructor() {
    this.seedCanonicalExceptions();
  }

  private seedCanonicalExceptions() {
    const canonicalSeeds: CanonicalException[] = [
      {
        id: 'EXC-2026-088',
        tenantId: 'tenant-acme-corp',
        exceptionCode: 'EXC-2026-088',
        title: 'Legacy Batch SFTP Bastion MFA Exemption',
        businessJustification: 'Core clearing batch automation runs on legacy AS400 mainframe which cannot complete interactive WebAuthn biometric challenges.',
        relatedControlId: 'CTRL-088',
        relatedRequirementCode: 'A.5.15',
        affectedAssetIds: ['ASSET-AS400-01', 'ASSET-SFTP-GW'],
        inherentRiskScore: 16, // High
        compensatingControls: 'Hardened VPN gateway with source-IP whitelisting, hourly session rotation, 100% video-recorded bastion session audit logs, and automated anomaly detection.',
        residualRiskScore: 6, // Low-Medium
        requestedBy: 'Karthik Rao (Fintech Operations)',
        department: 'Payment Clearing & Settlement',
        requestedDate: '2026-06-15T09:00:00Z',
        approvedBy: 'Marcus Vance (CISO)',
        approvalDate: '2026-06-20T14:30:00Z',
        expiryDate: '2026-10-15T00:00:00Z', // Approaching expiry!
        reviewDate: '2026-10-01T00:00:00Z',
        status: 'APPROVED',
        supportingEvidenceIds: ['EV-2026-088-ARCH', 'EV-2026-088-NET'],
        isApproachingExpiry: true,
        hasExpired: false,
        remediationPlanUponExpiry: 'Migrate to mTLS certificate-based API connector scheduled for Q4 2026 release.'
      },
      {
        id: 'EXC-2026-042',
        tenantId: 'tenant-acme-corp',
        exceptionCode: 'EXC-2026-042',
        title: 'Legacy Analytics S3 Bucket Unencrypted In-Transit Archive',
        businessJustification: 'Read-only archival data ingested from decommissioned 2021 platform.',
        relatedControlId: 'CTRL-042',
        relatedRequirementCode: 'A.8.24',
        affectedAssetIds: ['ASSET-S3-ARCHIVE-09'],
        inherentRiskScore: 12,
        compensatingControls: 'Server-side KMS encryption at rest, private VPC endpoint only, no public internet gateway route.',
        residualRiskScore: 4,
        requestedBy: 'David Rossi (Data Eng)',
        department: 'Data Analytics',
        requestedDate: '2026-01-10T10:00:00Z',
        approvedBy: 'Marcus Vance (CISO)',
        approvalDate: '2026-01-15T16:00:00Z',
        expiryDate: '2026-09-01T00:00:00Z', // Expired!
        reviewDate: '2026-08-15T00:00:00Z',
        status: 'EXPIRED',
        supportingEvidenceIds: ['EV-2026-042-S3'],
        isApproachingExpiry: false,
        hasExpired: true,
        remediationPlanUponExpiry: 'Re-encrypt S3 bucket objects with AWS KMS CMK and force bucket policy deny on non-SSL.'
      },
      {
        id: 'EXC-2026-095',
        tenantId: 'tenant-acme-corp',
        exceptionCode: 'EXC-2026-095',
        title: 'Sandbox LLM Model Evaluation Without Full Model Card Sign-off',
        businessJustification: 'Internal non-production evaluation of open-source Llama-3-70B model on synthetic test dataset.',
        relatedControlId: 'CTRL-095',
        relatedRequirementCode: 'A.6.2',
        affectedAssetIds: ['ASSET-AI-SANDBOX-01'],
        inherentRiskScore: 8,
        compensatingControls: 'Completely air-gapped VPC sandbox with zero customer data access and 30-day auto-destroy TTL.',
        residualRiskScore: 2,
        requestedBy: 'Dr. Elena Vance',
        department: 'AI Research & Innovation',
        requestedDate: '2026-09-25T11:00:00Z',
        approvedBy: 'Sarah Chen (GRC Lead)',
        approvalDate: '2026-09-28T15:00:00Z',
        expiryDate: '2026-11-30T00:00:00Z',
        reviewDate: '2026-11-15T00:00:00Z',
        status: 'APPROVED',
        supportingEvidenceIds: ['EV-2026-095-SANDBOX'],
        isApproachingExpiry: false,
        hasExpired: false,
        remediationPlanUponExpiry: 'Perform formal ISO 42001 risk assessment prior to any production deployment consideration.'
      }
    ];

    canonicalSeeds.forEach(item => this.exceptions.set(item.id, item));
    this.refreshExpiryStates();
  }

  // ==========================================================================
  // EXPIRATION ENGINE
  // ==========================================================================

  public refreshExpiryStates(): void {
    const now = new Date();
    const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000;

    this.exceptions.forEach(exc => {
      const expiry = new Date(exc.expiryDate);
      const timeDiff = expiry.getTime() - now.getTime();

      if (timeDiff <= 0 && exc.status === 'APPROVED') {
        exc.status = 'EXPIRED';
        exc.hasExpired = true;
        exc.isApproachingExpiry = false;
      } else if (timeDiff > 0 && timeDiff <= fourteenDaysMs && exc.status === 'APPROVED') {
        exc.isApproachingExpiry = true;
        exc.hasExpired = false;
      } else if (timeDiff > fourteenDaysMs) {
        exc.isApproachingExpiry = false;
        exc.hasExpired = false;
      }
    });
  }

  // ==========================================================================
  // QUERY METHODS
  // ==========================================================================

  public getAllExceptions(): CanonicalException[] {
    this.refreshExpiryStates();
    return Array.from(this.exceptions.values());
  }

  public getExceptionById(id: string): CanonicalException | undefined {
    this.refreshExpiryStates();
    return this.exceptions.get(id);
  }

  public getActiveExceptions(): CanonicalException[] {
    this.refreshExpiryStates();
    return Array.from(this.exceptions.values()).filter(e => e.status === 'APPROVED' || e.status === 'UNDER_REVIEW');
  }

  public getExpiredExceptions(): CanonicalException[] {
    this.refreshExpiryStates();
    return Array.from(this.exceptions.values()).filter(e => e.hasExpired || e.status === 'EXPIRED');
  }

  public getExceptionsApproachingExpiry(): CanonicalException[] {
    this.refreshExpiryStates();
    return Array.from(this.exceptions.values()).filter(e => e.isApproachingExpiry);
  }

  public getExceptionsByControlCode(controlCode: string): CanonicalException[] {
    return Array.from(this.exceptions.values()).filter(e => e.relatedControlId === controlCode);
  }

  // ==========================================================================
  // MUTATIONS & APPROVALS
  // ==========================================================================

  public createException(input: Omit<CanonicalException, 'id' | 'isApproachingExpiry' | 'hasExpired'>): CanonicalException {
    const id = `EXC-${new Date().getFullYear()}-${String(this.exceptions.size + 1).padStart(3, '0')}`;
    const newExc: CanonicalException = {
      ...input,
      id,
      isApproachingExpiry: false,
      hasExpired: false
    };

    this.exceptions.set(id, newExc);
    this.refreshExpiryStates();

    // Attach to control implementation
    controlTestingService.linkExceptionToImplementation(input.relatedControlId, id);

    return newExc;
  }

  public updateStatus(id: string, newStatus: ExceptionStatus, actor: string, approverComment?: string): CanonicalException {
    const exc = this.exceptions.get(id);
    if (!exc) throw new Error(`Exception ${id} not found`);

    exc.status = newStatus;
    if (newStatus === 'APPROVED') {
      exc.approvedBy = actor;
      exc.approvalDate = new Date().toISOString();
      controlTestingService.linkExceptionToImplementation(exc.relatedControlId, exc.id);
    }

    this.refreshExpiryStates();
    return exc;
  }

  public approveException(id: string, approver: string): CanonicalException {
    return this.updateStatus(id, 'APPROVED', approver);
  }
}

export const exceptionManagementService = new ExceptionManagementService();
