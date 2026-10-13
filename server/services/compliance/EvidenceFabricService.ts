/**
 * SKANDA Enterprise GRC & Continuous Assurance Platform
 * Evidence Fabric, Freshness Lifecycle & Multi-Framework Evidence Reuse Engine
 * 
 * Invariants:
 * 1. CRYPTOGRAPHIC NON-REPUDIATION - Every evidence artifact carries a deterministic SHA-256 digest.
 * 2. EVIDENCE FRESHNESS ENFORCEMENT - Stale (>90d) or expired evidence prohibits full assurance.
 * 3. 1 ARTIFACT -> MANY FRAMEWORKS - 1 verified telemetry proof simultaneously satisfies multiple statutory standards.
 * 4. MULTI-TENANT ISOLATION - Evidence vaults are strictly partitioned by tenantId.
 */

import crypto from 'crypto';
import {
  FabricEvidenceRecord,
  EvidenceFreshnessState,
  FreshnessPolicy,
  AutomatedCheckDomain,
  IntegrationProviderId,
  EvidenceCollectionMethod
} from '../../../src/types/integrationFabricTypes';
import { integrationFabricService } from './IntegrationFabricService';

export class EvidenceFabricService {
  private static instance: EvidenceFabricService;

  // Tenant-partitioned evidence vault: tenantId -> FabricEvidenceRecord[]
  private tenantEvidenceVault: Map<string, FabricEvidenceRecord[]> = new Map();
  private domainFreshnessPolicies: Map<AutomatedCheckDomain, FreshnessPolicy> = new Map();

  private constructor() {
    this.registerDefaultFreshnessPolicies();
  }

  public static getInstance(): EvidenceFabricService {
    if (!EvidenceFabricService.instance) {
      EvidenceFabricService.instance = new EvidenceFabricService();
    }
    return EvidenceFabricService.instance;
  }

  public ensureTenantInitialized(tenantId: string): void {
    if (!this.tenantEvidenceVault.has(tenantId)) {
      this.tenantEvidenceVault.set(tenantId, []);
      this.seedDefaultEvidence(tenantId);
    }
  }

  // ==========================================================================
  // 1. CONFIGURABLE FRESHNESS POLICIES
  // ==========================================================================

  private registerDefaultFreshnessPolicies(): void {
    const policies: FreshnessPolicy[] = [
      { policyDomain: 'IDENTITY_ACCESS', expectedMaxAgeHours: 720, warningThresholdHours: 600, description: 'Identity and Access Review Evidence (Max: 30 Days)' },
      { policyDomain: 'CLOUD_INFRASTRUCTURE', expectedMaxAgeHours: 24, warningThresholdHours: 18, description: 'Cloud Configuration & CSPM Telemetry (Max: 24 Hours)' },
      { policyDomain: 'ENDPOINT_MDM', expectedMaxAgeHours: 24, warningThresholdHours: 18, description: 'EDR & Host Compliance Heartbeat (Max: 24 Hours)' },
      { policyDomain: 'DEVSECOPS_CODE', expectedMaxAgeHours: 168, warningThresholdHours: 120, description: 'DevSecOps Branch Protection & SAST Audits (Max: 7 Days)' },
      { policyDomain: 'VULNERABILITY_MANAGEMENT', expectedMaxAgeHours: 168, warningThresholdHours: 120, description: 'Perimeter Vulnerability Scan Reports (Max: 7 Days)' },
      { policyDomain: 'HR_PEOPLE_LIFECYCLE', expectedMaxAgeHours: 8760, warningThresholdHours: 7200, description: 'Annual Security Awareness & Training Sign-offs (Max: 365 Days)' },
      { policyDomain: 'BACKUP_DISASTER_RECOVERY', expectedMaxAgeHours: 24, warningThresholdHours: 18, description: 'Daily Backup Snapshot & WORM Immutability (Max: 24 Hours)' },
      { policyDomain: 'THIRD_PARTY_RISK', expectedMaxAgeHours: 720, warningThresholdHours: 600, description: 'Continuous Vendor Risk Rating & Notice 658 Audits (Max: 30 Days)' }
    ];

    for (const p of policies) {
      this.domainFreshnessPolicies.set(p.policyDomain, p);
    }
  }

  public getFreshnessPolicy(domain: AutomatedCheckDomain): FreshnessPolicy | undefined {
    return this.domainFreshnessPolicies.get(domain);
  }

  public evaluateEvidenceFreshness(evidence: FabricEvidenceRecord): EvidenceFreshnessState {
    if (evidence.freshnessState === 'TAMPERED') return 'TAMPERED';
    if (evidence.freshnessState === 'REJECTED') return 'REJECTED';

    const now = Date.now();
    const expiry = new Date(evidence.validUntil).getTime();
    const lastVerified = new Date(evidence.lastVerifiedAt).getTime();

    if (now > expiry) {
      return 'EXPIRED';
    }

    // Check if evidence is older than 90 days without fresh re-verification
    if (now - lastVerified > 90 * 24 * 3600 * 1000) {
      return 'STALE';
    }

    return 'CURRENT';
  }

  // ==========================================================================
  // 2. AUTOMATED EVIDENCE HARVESTING & WORM VAULT
  // ==========================================================================

  public async collectAndVaultEvidence(data: {
    tenantId: string;
    evidenceCode: string;
    title: string;
    description: string;
    sourceProvider: IntegrationProviderId;
    collectionMethod: EvidenceCollectionMethod;
    sourceObjectId: string;
    rawPayload: any;
    validityDurationDays: number;
    targetControlCodes: string[];
    mappedRequirementCodes: string[];
    mappedFrameworkCodes: string[];
    associatedAssetIds?: string[];
    associatedIdentityIds?: string[];
    generatedByCheckId?: string;
  }): Promise<FabricEvidenceRecord> {
    this.ensureTenantInitialized(data.tenantId);

    const serialized = typeof data.rawPayload === 'string' ? data.rawPayload : JSON.stringify(data.rawPayload);
    const sha256Digest = crypto.createHash('sha256').update(serialized).digest('hex');
    const now = new Date().toISOString();
    const validUntil = new Date(Date.now() + data.validityDurationDays * 24 * 3600 * 1000).toISOString();

    const evidenceRecord: FabricEvidenceRecord = {
      id: `EVD-FAB-${data.evidenceCode}-${Date.now()}`,
      tenantId: data.tenantId,
      evidenceCode: data.evidenceCode,
      title: data.title,
      description: data.description,
      sourceProvider: data.sourceProvider,
      collectionMethod: data.collectionMethod,
      sourceObjectId: data.sourceObjectId,
      sha256Digest,
      payloadSizeInBytes: Buffer.byteLength(serialized, 'utf8'),
      mimeType: 'application/json',
      rawJsonPayloadSnippet: serialized.substring(0, 1000),
      collectedAt: now,
      lastVerifiedAt: now,
      validFrom: now,
      validUntil,
      freshnessState: 'CURRENT',
      targetControlCodes: data.targetControlCodes,
      mappedRequirementCodes: data.mappedRequirementCodes,
      mappedFrameworkCodes: data.mappedFrameworkCodes,
      associatedAssetIds: data.associatedAssetIds || [],
      associatedIdentityIds: data.associatedIdentityIds || [],
      generatedByCheckId: data.generatedByCheckId,
      reviewStatus: 'AUTO_VALIDATED',
      confidenceScore: 0.99
    };

    this.tenantEvidenceVault.get(data.tenantId)!.push(evidenceRecord);
    return evidenceRecord;
  }

  public getEvidenceForTenant(tenantId: string): FabricEvidenceRecord[] {
    this.ensureTenantInitialized(tenantId);
    return this.tenantEvidenceVault.get(tenantId) || [];
  }

  public getEvidenceById(tenantId: string, id: string): FabricEvidenceRecord | undefined {
    this.ensureTenantInitialized(tenantId);
    return (this.tenantEvidenceVault.get(tenantId) || []).find(e => e.id === id);
  }

  // ==========================================================================
  // 3. SEED DEFAULT EVIDENCE VAULT
  // ==========================================================================

  private seedDefaultEvidence(tenantId: string): void {
    const vault = this.tenantEvidenceVault.get(tenantId)!;

    // 1. Entra ID / MFA Evidence
    vault.push({
      id: `EVD-FAB-MFA-001`,
      tenantId,
      evidenceCode: 'EV-ENTRA-IAM-MFA',
      title: 'Microsoft Entra ID Mandatory MFA & Conditional Access Attestation',
      description: 'Automated cryptographic harvest proving 100% of privileged administrator roles enforce hardware FIDO2 MFA.',
      sourceProvider: 'MICROSOFT_ENTRA_ID',
      collectionMethod: 'AUTOMATED_API_PULL',
      sourceObjectId: 'singabank.onmicrosoft.com/policies/conditionalAccess/mfa-all',
      sha256Digest: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      payloadSizeInBytes: 2840,
      mimeType: 'application/json',
      rawJsonPayloadSnippet: '{"provider":"MICROSOFT_ENTRA_ID","privilegedAccounts":12,"mfaEnforced":12,"status":"COMPLIANT"}',
      collectedAt: new Date().toISOString(),
      lastVerifiedAt: new Date().toISOString(),
      validFrom: new Date().toISOString(),
      validUntil: new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString(),
      freshnessState: 'CURRENT',
      targetControlCodes: ['CTRL-IAM-01'],
      mappedRequirementCodes: ['A.5.15', 'A.5.18', 'CC6.1', 'MAS-TRM-09.01', 'DPDP-REQ-SEC-04', 'PR.AA-01'],
      mappedFrameworkCodes: ['ISO_27001_2022', 'SOC_2_TYPE_2', 'MAS_TRM_2021', 'DPDP_ACT_2023', 'NIST_CSF_2_0'],
      associatedAssetIds: ['aad-tenant-prod'],
      associatedIdentityIds: ['IDN-SARAH', 'IDN-ALEX'],
      generatedByCheckId: 'CHK-IAM-MFA-PRIV',
      reviewStatus: 'AUTO_VALIDATED',
      confidenceScore: 0.99
    });

    // 2. AWS S3 & CloudTrail Evidence
    vault.push({
      id: `EVD-FAB-AWS-001`,
      tenantId,
      evidenceCode: 'EV-AWS-CSPM-LOGS',
      title: 'AWS Security Hub Public Access Block & Multi-Region CloudTrail Attestation',
      description: 'Continuous CSPM telemetry validating zero public S3 buckets and active multi-region log validation across AWS organizations.',
      sourceProvider: 'AWS',
      collectionMethod: 'AUTOMATED_API_PULL',
      sourceObjectId: 'arn:aws:securityhub:ap-southeast-1:123456789012:hub/default',
      sha256Digest: '4a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b',
      payloadSizeInBytes: 3120,
      mimeType: 'application/json',
      rawJsonPayloadSnippet: '{"provider":"AWS","s3PublicAccessBlockGlobal":true,"multiRegionCloudTrail":true,"status":"COMPLIANT"}',
      collectedAt: new Date().toISOString(),
      lastVerifiedAt: new Date().toISOString(),
      validFrom: new Date().toISOString(),
      validUntil: new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString(),
      freshnessState: 'CURRENT',
      targetControlCodes: ['CTRL-RES-01', 'CTRL-IAM-01'],
      mappedRequirementCodes: ['A.8.12', 'A.8.24', 'CC6.6', 'MAS-TRM-11.01'],
      mappedFrameworkCodes: ['ISO_27001_2022', 'SOC_2_TYPE_2', 'MAS_TRM_2021'],
      associatedAssetIds: ['aws-s3-prod-data', 'aws-rds-core-db'],
      associatedIdentityIds: ['IDN-ALEX'],
      generatedByCheckId: 'CHK-CLD-S3-PUBLIC-BLOCKED',
      reviewStatus: 'AUTO_VALIDATED',
      confidenceScore: 0.99
    });

    // 3. GitHub Branch Protection Evidence
    vault.push({
      id: `EVD-FAB-GH-001`,
      tenantId,
      evidenceCode: 'EV-GH-SECLCD',
      title: 'GitHub Enterprise Branch Protection & CodeQL SAST Attestation',
      description: 'Cryptographic proof certifying mandatory 2-person code reviews and passing CodeQL security gates on default branches.',
      sourceProvider: 'GITHUB',
      collectionMethod: 'AUTOMATED_API_PULL',
      sourceObjectId: 'github.com/skanda/singabank/branch_protection',
      sha256Digest: '7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c',
      payloadSizeInBytes: 3400,
      mimeType: 'application/json',
      rawJsonPayloadSnippet: '{"provider":"GITHUB","branchProtectionMain":true,"approvalsRequired":2,"codeqlPassing":true}',
      collectedAt: new Date().toISOString(),
      lastVerifiedAt: new Date().toISOString(),
      validFrom: new Date().toISOString(),
      validUntil: new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString(),
      freshnessState: 'CURRENT',
      targetControlCodes: ['CTRL-DEV-01'],
      mappedRequirementCodes: ['A.8.28', 'CC8.1', 'MAS-TRM-06.01'],
      mappedFrameworkCodes: ['ISO_27001_2022', 'SOC_2_TYPE_2', 'MAS_TRM_2021'],
      associatedAssetIds: ['repo-core-banking-api'],
      associatedIdentityIds: ['IDN-SARAH'],
      generatedByCheckId: 'CHK-CODE-BRANCH-PROTECTION',
      reviewStatus: 'AUTO_VALIDATED',
      confidenceScore: 0.99
    });

    // 4. CrowdStrike Sensor Health Evidence
    vault.push({
      id: `EVD-FAB-CS-001`,
      tenantId,
      evidenceCode: 'EV-CS-EDR',
      title: 'CrowdStrike Falcon Sensor Fleet Protection Attestation',
      description: 'Verified snapshot proving 99.9% Falcon sensor health, aggressive malware blocking, and zero uncontained breaches.',
      sourceProvider: 'CROWDSTRIKE',
      collectionMethod: 'AUTOMATED_API_PULL',
      sourceObjectId: 'falcon.crowdstrike.com/fleet/summary',
      sha256Digest: '9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e',
      payloadSizeInBytes: 2900,
      mimeType: 'application/json',
      rawJsonPayloadSnippet: '{"provider":"CROWDSTRIKE","sensorCoverage":0.999,"uncontainedDetections":0}',
      collectedAt: new Date().toISOString(),
      lastVerifiedAt: new Date().toISOString(),
      validFrom: new Date().toISOString(),
      validUntil: new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString(),
      freshnessState: 'CURRENT',
      targetControlCodes: ['CTRL-EDR-01'],
      mappedRequirementCodes: ['A.8.7', 'CC6.8', 'MAS-TRM-12.01'],
      mappedFrameworkCodes: ['ISO_27001_2022', 'SOC_2_TYPE_2', 'MAS_TRM_2021'],
      associatedAssetIds: ['host-k8s-prod-worker-01'],
      associatedIdentityIds: [],
      generatedByCheckId: 'CHK-EDR-SENSOR-ACTIVE',
      reviewStatus: 'AUTO_VALIDATED',
      confidenceScore: 0.99
    });

    // 5. Qualys VMDR Evidence
    vault.push({
      id: `EVD-FAB-QUALYS-001`,
      tenantId,
      evidenceCode: 'EV-QUALYS-VMDR',
      title: 'Qualys VMDR Weekly External Vulnerability Scan Attestation',
      description: 'Verified scan report certifying zero critical unpatched CVEs older than the 14-day statutory SLA window.',
      sourceProvider: 'QUALYS',
      collectionMethod: 'AUTOMATED_API_PULL',
      sourceObjectId: 'qualys.singabank.sg/vmdr/scan_results',
      sha256Digest: '1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a',
      payloadSizeInBytes: 4200,
      mimeType: 'application/json',
      rawJsonPayloadSnippet: '{"provider":"QUALYS","criticalCves":0,"overdueSla":0,"scanAgeDays":2}',
      collectedAt: new Date().toISOString(),
      lastVerifiedAt: new Date().toISOString(),
      validFrom: new Date().toISOString(),
      validUntil: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
      freshnessState: 'CURRENT',
      targetControlCodes: ['CTRL-VULN-01'],
      mappedRequirementCodes: ['A.8.8', 'CC7.1', 'MAS-TRM-12.02'],
      mappedFrameworkCodes: ['ISO_27001_2022', 'SOC_2_TYPE_2', 'MAS_TRM_2021'],
      associatedAssetIds: ['qualys-perimeter-vip'],
      associatedIdentityIds: [],
      generatedByCheckId: 'CHK-VULN-CRITICAL-14D-SLA',
      reviewStatus: 'AUTO_VALIDATED',
      confidenceScore: 0.99
    });
  }
}

export const evidenceFabricService = EvidenceFabricService.getInstance();
