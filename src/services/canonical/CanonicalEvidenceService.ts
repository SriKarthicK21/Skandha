/**
 * SKANDA CANONICAL EVIDENCE SERVICE
 * Path: src/services/canonical/CanonicalEvidenceService.ts
 * 
 * Enterprise Traceability Chain:
 * Evidence -> Evidence Assertion -> Control Test -> Control Implementation -> Control Definition -> Requirement -> Framework -> Compliance Program
 */

import { EvidenceAssertion } from '../../types/canonicalGrcTypes';
import { SmartEvidenceItem } from '../../types/grcCoreTypes';
import { controlTestingService } from './ControlTestingService';
import { complianceProgramService } from './ComplianceProgramService';

export interface FullEvidenceTraceabilityChain {
  evidence: SmartEvidenceItem;
  assertion: EvidenceAssertion;
  controlTest?: {
    id: string;
    result: string;
    effectiveness: string;
    performedAt: string;
    tester: string;
  };
  controlImplementation: {
    id: string;
    code: string;
    title: string;
    owner: string;
    status: string;
    effectiveness: string;
  };
  controlDefinition?: {
    id: string;
    code: string;
    category: string;
    type: string;
  };
  requirement: {
    code: string;
    title: string;
    frameworkCode: string;
  };
  framework: {
    code: string;
    name: string;
    version: string;
  };
  complianceProgram?: {
    id: string;
    code: string;
    name: string;
  };
}

export class CanonicalEvidenceService {
  private assertions: Map<string, EvidenceAssertion> = new Map();

  constructor() {
    this.seedCanonicalAssertions();
  }

  private seedCanonicalAssertions() {
    const canonicalSeeds: EvidenceAssertion[] = [
      {
        id: 'ASSERT-2026-001',
        tenantId: 'tenant-acme-corp',
        evidenceId: 'EV-2026-001',
        evidenceCode: 'EV-2026-001',
        controlImplementationId: 'CTRL-088-ACME-PROD',
        controlCode: 'CTRL-088',
        controlTestId: 'TEST-2026-Q3-088',
        requirementCode: 'A.5.15',
        frameworkCode: 'ISO_27001_2022',
        complianceProgramId: 'PROG-SEC-01',
        assertionStatement: 'Proves 100% MFA WebAuthn & Okta adaptive access enforcement across all AWS admin roles for Q3 testing period.',
        assertionStatus: 'VERIFIED_VALID',
        assertedBy: 'Sarah Chen (Director IAM)',
        assertedAt: '2026-09-18T10:30:00Z'
      },
      {
        id: 'ASSERT-2026-002',
        tenantId: 'tenant-acme-corp',
        evidenceId: 'EV-2026-002',
        evidenceCode: 'EV-2026-002',
        controlImplementationId: 'CTRL-042-ACME-PROD',
        controlCode: 'CTRL-042',
        controlTestId: 'TEST-2026-Q3-042',
        requirementCode: 'A.8.24',
        frameworkCode: 'ISO_27001_2022',
        complianceProgramId: 'PROG-SEC-01',
        assertionStatement: 'Verifies AES-256-GCM and TLS 1.3 encryption across all RDS clusters and S3 storage volumes.',
        assertionStatus: 'VERIFIED_VALID',
        assertedBy: 'David Rossi (DevSecOps)',
        assertedAt: '2026-09-20T14:15:00Z'
      },
      {
        id: 'ASSERT-2026-003',
        tenantId: 'tenant-acme-corp',
        evidenceId: 'EV-2026-003',
        evidenceCode: 'EV-2026-003',
        controlImplementationId: 'CTRL-019-ACME-PROD',
        controlCode: 'CTRL-019',
        controlTestId: 'TEST-2026-Q3-019',
        requirementCode: 'A.8.8',
        frameworkCode: 'ISO_27001_2022',
        complianceProgramId: 'PROG-SEC-01',
        assertionStatement: 'Weekly automated Qualys and Wiz container image scan telemetry covering 100% production workloads.',
        assertionStatus: 'VERIFIED_VALID',
        assertedBy: 'SecOps Telemetry Engine',
        assertedAt: '2026-09-28T09:00:00Z'
      },
      {
        id: 'ASSERT-2026-004',
        tenantId: 'tenant-acme-corp',
        evidenceId: 'EV-2026-004',
        evidenceCode: 'EV-2026-004',
        controlImplementationId: 'CTRL-077-ACME-FIN',
        controlCode: 'CTRL-077',
        controlTestId: 'TEST-2026-Q3-077',
        requirementCode: 'TRM-10.1',
        frameworkCode: 'MAS_TRM_2024',
        complianceProgramId: 'PROG-TRM-01',
        assertionStatement: 'Quarterly SOC 2 Type 2 & ISO 27001 review and penetration test assessment reports for all Tier-1 fintech SaaS vendors.',
        assertionStatus: 'PENDING_AUDITOR_SAMPLE',
        assertedBy: 'Karthik Rao (Vendor Risk Lead)',
        assertedAt: '2026-09-29T11:45:00Z'
      },
      {
        id: 'ASSERT-2026-005',
        tenantId: 'tenant-acme-corp',
        evidenceId: 'EV-2026-005',
        evidenceCode: 'EV-2026-005',
        controlImplementationId: 'CTRL-095-ACME-AI',
        controlCode: 'CTRL-095',
        controlTestId: 'TEST-2026-Q3-095',
        requirementCode: 'A.6.2',
        frameworkCode: 'ISO_42001_2023',
        complianceProgramId: 'PROG-AI-01',
        assertionStatement: 'Comprehensive algorithmic bias evaluation and automated red-teaming report for customer credit scoring LLM model.',
        assertionStatus: 'VERIFIED_VALID',
        assertedBy: 'Dr. Elena Vance (Head of AI Safety)',
        assertedAt: '2026-09-30T16:20:00Z'
      }
    ];

    canonicalSeeds.forEach(item => this.assertions.set(item.id, item));
  }

  // ==========================================================================
  // QUERY & ACCESS
  // ==========================================================================

  public getAllAssertions(): EvidenceAssertion[] {
    return Array.from(this.assertions.values());
  }

  public getAssertionById(id: string): EvidenceAssertion | undefined {
    return this.assertions.get(id);
  }

  public getAssertionsByEvidenceId(evidenceId: string): EvidenceAssertion[] {
    return Array.from(this.assertions.values()).filter(a => a.evidenceId === evidenceId || a.evidenceCode === evidenceId);
  }

  public getAssertionsByControlCode(controlCode: string): EvidenceAssertion[] {
    return Array.from(this.assertions.values()).filter(a => a.controlCode === controlCode);
  }

  public getAssertionsByProgramId(programId: string): EvidenceAssertion[] {
    return Array.from(this.assertions.values()).filter(a => a.complianceProgramId === programId);
  }

  // ==========================================================================
  // FULL END-TO-END TRACEABILITY RESOLVER
  // ==========================================================================

  public getTraceabilityChain(evidenceAssertionId: string): FullEvidenceTraceabilityChain | null {
    const assertion = this.assertions.get(evidenceAssertionId) ||
                      Array.from(this.assertions.values()).find(a => a.evidenceId === evidenceAssertionId || a.evidenceCode === evidenceAssertionId);
    if (!assertion) return null;

    const controlImpl = controlTestingService.getImplementationByCode(assertion.controlCode);
    const globalDef = controlTestingService.getControlDefinitionByCode(assertion.controlCode);
    const controlTest = assertion.controlTestId ? controlTestingService.getTestById(assertion.controlTestId) : undefined;
    const program = complianceProgramService.getProgramById(assertion.complianceProgramId);

    // Synthetic or mock evidence metadata item for end-to-end lineage representation
    const mockEvidence: SmartEvidenceItem = {
      id: assertion.evidenceId,
      tenantId: assertion.tenantId,
      evidenceCode: assertion.evidenceCode,
      name: `${assertion.controlCode} Operational Verification Artifact`,
      fileName: `${assertion.evidenceCode}.pdf`,
      fileSizeBytes: 2450000,
      fileType: 'application/pdf',
      sourceType: 'AUTOMATED_TELEMETRY',
      owner: assertion.assertedBy,
      createdAt: assertion.assertedAt,
      validUntil: '2027-09-18T00:00:00Z',
      isExpired: false,
      sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      verificationStatus: assertion.assertionStatus === 'VERIFIED_VALID' ? 'VERIFIED' : 'PENDING_REVIEW',
      verifiedBy: assertion.assertedBy,
      verifiedAt: assertion.assertedAt,
      aiClassification: {
        suggestedCategory: 'Identity & Access Management',
        confidenceScore: 0.96,
        extractedMetadata: { standard: 'FIDO2 WebAuthn', period: 'Q3 2026' },
        ocrSnippet: assertion.assertionStatement,
        confirmedByHuman: true
      },
      mappedControlIds: [assertion.controlCode],
      mappedRequirementCodes: [assertion.requirementCode],
      mappedFrameworkCodes: [assertion.frameworkCode],
      mappedAuditIds: ['AUD-2026-001'],
      mappedCapaIds: []
    };

    return {
      evidence: mockEvidence,
      assertion,
      controlTest: controlTest ? {
        id: controlTest.id,
        result: controlTest.testResult,
        effectiveness: controlTest.effectiveness,
        performedAt: controlTest.performedAt,
        tester: controlTest.tester
      } : undefined,
      controlImplementation: {
        id: controlImpl?.id || assertion.controlImplementationId,
        code: assertion.controlCode,
        title: controlImpl?.title || globalDef?.title || assertion.controlCode,
        owner: controlImpl?.owner || 'IAM Team',
        status: controlImpl?.implementationStatus || 'IMPLEMENTED',
        effectiveness: controlImpl?.effectivenessRating || 'EFFECTIVE'
      },
      controlDefinition: globalDef ? {
        id: globalDef.id,
        code: globalDef.code,
        category: globalDef.category,
        type: globalDef.type
      } : undefined,
      requirement: {
        code: assertion.requirementCode,
        title: `Requirement ${assertion.requirementCode} (${assertion.frameworkCode})`,
        frameworkCode: assertion.frameworkCode
      },
      framework: {
        code: assertion.frameworkCode,
        name: assertion.frameworkCode.replace(/_/g, ' '),
        version: '2022/2024'
      },
      complianceProgram: program ? {
        id: program.id,
        code: program.code,
        name: program.name
      } : undefined
    };
  }

  // ==========================================================================
  // MUTATIONS & LIFECYCLE
  // ==========================================================================

  public createAssertion(input: Omit<EvidenceAssertion, 'id' | 'assertedAt'>): EvidenceAssertion {
    const id = `ASSERT-${new Date().getFullYear()}-${String(this.assertions.size + 1).padStart(3, '0')}`;
    const newAssertion: EvidenceAssertion = {
      ...input,
      id,
      assertedAt: new Date().toISOString()
    };

    this.assertions.set(id, newAssertion);

    // Link into control implementation
    controlTestingService.linkEvidenceToImplementation(input.controlCode, input.evidenceId);

    return newAssertion;
  }

  public updateAssertionStatus(id: string, status: EvidenceAssertion['assertionStatus']): EvidenceAssertion {
    const assertion = this.assertions.get(id);
    if (!assertion) throw new Error(`Evidence Assertion ${id} not found`);

    const updated = { ...assertion, assertionStatus: status };
    this.assertions.set(id, updated);
    return updated;
  }
}

export const canonicalEvidenceService = new CanonicalEvidenceService();
