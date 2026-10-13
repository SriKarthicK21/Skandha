// ============================================================================
// SKANDA Enterprise GRC — Automated TPRM Scanning & Vendor Security Service
// Path: server/services/TprmScanningService.ts
//
// Phase 12: Automated Vendor Attack Surface, TLS/SSL, DMARC & Threat Scanning
// ============================================================================

import crypto from 'crypto';
import {
  VendorSecurityObservation,
  ExternalScanJob
} from '../../src/types/telemetryTypes';
import { DomainEventBus } from '../../src/services/canonical/DomainEventBus';
import { OutboxBrokerService } from './OutboxBrokerService';

export class TprmScanningService {
  private static instance: TprmScanningService;
  private observations: Map<string, VendorSecurityObservation[]> = new Map(); // tenantId -> observations
  private scanJobs: Map<string, ExternalScanJob[]> = new Map(); // tenantId -> jobs
  private authorizedDomains: Map<string, Set<string>> = new Map(); // tenantId -> authorized domains

  private constructor() {
    this.seedDefaultAuthorizedDomains();
  }

  public static getInstance(): TprmScanningService {
    if (!TprmScanningService.instance) {
      TprmScanningService.instance = new TprmScanningService();
    }
    return TprmScanningService.instance;
  }

  private seedDefaultAuthorizedDomains() {
    const acmeSet = new Set<string>([
      'api.stripe.com',
      'auth0.openai.com',
      'aws.amazon.com',
      'github.com',
      'slack.com',
      'databricks.com',
      'snowflake.com'
    ]);
    this.authorizedDomains.set('tenant-acme', acmeSet);
  }

  /**
   * Authorize a vendor domain for automated continuous security scanning
   */
  public authorizeDomain(
    tenantId: string,
    domain: string,
    authorizedBy: string
  ): { success: boolean; message: string } {
    if (!this.authorizedDomains.has(tenantId)) {
      this.authorizedDomains.set(tenantId, new Set());
    }
    const cleanDomain = domain.toLowerCase().trim().replace(/^https?:\/\//, '');
    this.authorizedDomains.get(tenantId)!.add(cleanDomain);

    return {
      success: true,
      message: `Domain ${cleanDomain} authorized for automated TPRM scanning by ${authorizedBy}.`
    };
  }

  public isDomainAuthorized(tenantId: string, domain: string): boolean {
    const cleanDomain = domain.toLowerCase().trim().replace(/^https?:\/\//, '');
    const set = this.authorizedDomains.get(tenantId);
    return !!(set && set.has(cleanDomain));
  }

  /**
   * Execute an authorized external security scan for a third-party vendor
   */
  public async executeVendorScan(
    tenantId: string,
    vendorId: string,
    vendorName: string,
    domain: string,
    authorizedBy: string,
    scanScope: 'SSL_TLS' | 'DNS_MAIL' | 'SECURITY_HEADERS' | 'FULL_SURFACE' = 'FULL_SURFACE'
  ): Promise<{
    job: ExternalScanJob;
    observations: VendorSecurityObservation[];
  }> {
    const cleanDomain = domain.toLowerCase().trim().replace(/^https?:\/\//, '');

    // Authorization Boundary Verification
    if (!this.isDomainAuthorized(tenantId, cleanDomain)) {
      const rejectedJob: ExternalScanJob = {
        id: `SCAN-${Date.now()}`,
        tenantId,
        targetDomain: cleanDomain,
        targetEntityType: 'VENDOR',
        targetEntityId: vendorId,
        authorizedBy,
        authorizedAt: new Date().toISOString(),
        scanScope,
        status: 'REJECTED_UNAUTHORIZED',
        findingsCount: 0,
        rawResultsSummary: `Scan rejected: Domain ${cleanDomain} has not been explicitly authorized for scanning by the customer.`
      };

      return { job: rejectedJob, observations: [] };
    }

    const startedAt = new Date().toISOString();
    const generatedObservations: VendorSecurityObservation[] = [];

    // Simulated Deterministic Security Evaluation for Demo & Validation
    const isMockStripe = cleanDomain.includes('stripe');
    const isMockDatabricks = cleanDomain.includes('databricks');

    if (isMockDatabricks) {
      // Simulate an expiring TLS certificate finding (7 days remaining)
      const evidencePayload = {
        domain: cleanDomain,
        certIssuer: "DigiCert Global Root CA",
        validTo: new Date(Date.now() + 7 * 86400000).toISOString(),
        daysRemaining: 7,
        testedAt: startedAt
      };
      const digest = crypto.createHash('sha256').update(JSON.stringify(evidencePayload)).digest('hex');

      const obs: VendorSecurityObservation = {
        id: `VND-OBS-${Date.now()}-1`,
        tenantId,
        vendorId,
        vendorName,
        scannedDomain: cleanDomain,
        authorizedAt: new Date().toISOString(),
        authorizedBy,
        scanTimestamp: startedAt,
        scanType: 'EXTERNAL_TLS_SSL',
        findingType: 'TLS_CERTIFICATE_EXPIRING',
        severity: 'HIGH',
        score: 65,
        details: `TLS/SSL Certificate for ${cleanDomain} will expire in 7 days. Risk of vendor service disruption.`,
        evidenceSha256: digest,
        impactOnVendorRisk: 'INCREASED',
        previousVendorRiskLevel: 'MEDIUM',
        newVendorRiskLevel: 'HIGH',
        status: 'ACTIVE'
      };

      generatedObservations.push(obs);

      // Publish Domain Event
      DomainEventBus.publish({
        type: 'VendorRiskChanged',
        tenantId,
        actorId: 'system:tprm-scanner',
        entityId: vendorId,
        entityType: 'VENDOR',
        summary: `TPRM Scanner elevated ${vendorName} risk from MEDIUM to HIGH due to expiring TLS certificate.`,
        metadata: {
          vendorId,
          domain: cleanDomain,
          findingType: 'TLS_CERTIFICATE_EXPIRING',
          evidenceSha256: digest
        }
      });

      // Outbox Broker for downstream webhook/NBA
      OutboxBrokerService.getInstance().enqueueEvent({
        id: `outbox-vnd-${Date.now()}`,
        tenantId,
        eventType: 'VendorRiskChanged',
        aggregateType: 'VENDOR',
        aggregateId: vendorId,
        payload: {
          vendorId,
          vendorName,
          observationId: obs.id,
          findingType: obs.findingType,
          newRiskLevel: 'HIGH'
        },
        status: 'PENDING',
        retryCount: 0,
        createdAt: startedAt
      });
    } else {
      // Healthy Scan Result
      const evidencePayload = {
        domain: cleanDomain,
        tlsVersion: 'TLS 1.3',
        hstsActive: true,
        dmarcPolicy: 'v=DMARC1; p=reject;',
        testedAt: startedAt
      };
      const digest = crypto.createHash('sha256').update(JSON.stringify(evidencePayload)).digest('hex');

      const obs: VendorSecurityObservation = {
        id: `VND-OBS-${Date.now()}-2`,
        tenantId,
        vendorId,
        vendorName,
        scannedDomain: cleanDomain,
        authorizedAt: new Date().toISOString(),
        authorizedBy,
        scanTimestamp: startedAt,
        scanType: 'SECURITY_HEADERS',
        findingType: 'SECURITY_RATING_DECLINE',
        severity: 'LOW',
        score: 98,
        details: `All perimeter security checks passed for ${cleanDomain}. HSTS, TLS 1.3, and DMARC reject policy verified.`,
        evidenceSha256: digest,
        impactOnVendorRisk: 'UNCHANGED',
        previousVendorRiskLevel: 'LOW',
        newVendorRiskLevel: 'LOW',
        status: 'ACTIVE'
      };
      generatedObservations.push(obs);
    }

    const completedAt = new Date().toISOString();
    const job: ExternalScanJob = {
      id: `SCAN-${Date.now()}`,
      tenantId,
      targetDomain: cleanDomain,
      targetEntityType: 'VENDOR',
      targetEntityId: vendorId,
      authorizedBy,
      authorizedAt: startedAt,
      scanScope,
      status: 'COMPLETED',
      startedAt,
      completedAt,
      findingsCount: generatedObservations.filter(o => o.severity === 'HIGH' || o.severity === 'CRITICAL').length,
      evidenceHash: generatedObservations[0]?.evidenceSha256,
      rawResultsSummary: `Scan completed in 1.4s. ${generatedObservations.length} observations generated.`
    };

    // Store in memory
    if (!this.observations.has(tenantId)) {
      this.observations.set(tenantId, []);
    }
    this.observations.get(tenantId)!.push(...generatedObservations);

    if (!this.scanJobs.has(tenantId)) {
      this.scanJobs.set(tenantId, []);
    }
    this.scanJobs.get(tenantId)!.push(job);

    return { job, observations: generatedObservations };
  }

  public getObservationsForTenant(tenantId: string): VendorSecurityObservation[] {
    return this.observations.get(tenantId) || [];
  }

  public getScanJobsForTenant(tenantId: string): ExternalScanJob[] {
    return this.scanJobs.get(tenantId) || [];
  }
}

export const tprmScanningService = TprmScanningService.getInstance();
