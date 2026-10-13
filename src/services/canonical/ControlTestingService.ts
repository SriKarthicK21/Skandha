import {
  GlobalControlDefinition,
  TenantControlImplementation,
  ControlTest,
  ControlTestResult,
  ControlEffectivenessStatus
} from '../../types/canonicalGrcTypes';

/**
 * SKANDA Control Definition, Implementation & Testing Service
 * Decouples canonical control definitions from tenant operational implementations.
 * Provides first-class control testing workflows and 5-state effectiveness evaluation.
 */
export class ControlTestingService {
  private globalDefinitions: Map<string, GlobalControlDefinition> = new Map();
  private tenantImplementations: Map<string, TenantControlImplementation> = new Map();
  private controlTests: Map<string, ControlTest> = new Map();

  constructor() {
    this.initializeDefinitions();
    this.initializeTenantImplementations();
    this.initializeControlTests();
  }

  private initializeDefinitions() {
    const defs: GlobalControlDefinition[] = [
      {
        id: 'CTRL-DEF-001',
        code: 'CTRL-001',
        title: 'Phishing-Resistant Multi-Factor Authentication (MFA)',
        description: 'Mandatory enforcement of FIDO2 WebAuthn or push MFA across all workforce identity endpoints and production consoles.',
        category: 'ACCESS_CONTROL',
        type: 'PREVENTIVE',
        standardTestingProcedure: 'Sample 50 active user logins and test automated challenge-response mechanism.',
        defaultTestingFrequency: 'CONTINUOUS',
        frameworkMappings: [
          { frameworkCode: 'ISO_27001_2022', requirementCode: 'A.5.15', mappingType: 'DIRECT_SATISFACTION' },
          { frameworkCode: 'SOC_2_TYPE_2', requirementCode: 'SOC2-CC6.1', mappingType: 'DIRECT_SATISFACTION' },
          { frameworkCode: 'MAS_TRM_2021', requirementCode: 'MAS-TRM-8.1', mappingType: 'PARTIAL_CONTRIBUTION' }
        ]
      },
      {
        id: 'CTRL-DEF-088',
        code: 'CTRL-088',
        title: 'Privileged Access Management (PAM) & Just-In-Time Escalation',
        description: 'Enforce ephemeral 4-hour elevation grants, session recording, and automated credential rotation for all superuser roles.',
        category: 'ACCESS_CONTROL',
        type: 'PREVENTIVE',
        standardTestingProcedure: 'Inspect 30 days of PAM vault logs for approval tickets and verify auto-revocation upon expiration.',
        defaultTestingFrequency: 'QUARTERLY',
        frameworkMappings: [
          { frameworkCode: 'ISO_27001_2022', requirementCode: 'A.5.15', mappingType: 'DIRECT_SATISFACTION' },
          { frameworkCode: 'NIST_CSF_2_0', requirementCode: 'NIST-PR.AA-01', mappingType: 'DIRECT_SATISFACTION' }
        ]
      },
      {
        id: 'CTRL-DEF-024',
        code: 'CTRL-024',
        title: 'KMS Automated Cryptographic Key Rotation & AES-256 Baseline',
        description: 'Enforce automated 90-day key rotation on all customer-managed KMS keys and mandatory AES-256/GCM encryption at rest.',
        category: 'CRYPTOGRAPHY',
        type: 'PREVENTIVE',
        standardTestingProcedure: 'Inspect AWS KMS API configuration and confirm automated rotation status flag is True on all master keys.',
        defaultTestingFrequency: 'CONTINUOUS',
        frameworkMappings: [
          { frameworkCode: 'ISO_27001_2022', requirementCode: 'A.8.24', mappingType: 'DIRECT_SATISFACTION' },
          { frameworkCode: 'MAS_TRM_2021', requirementCode: 'MAS-TRM-11.2', mappingType: 'DIRECT_SATISFACTION' }
        ]
      },
      {
        id: 'CTRL-DEF-019',
        code: 'CTRL-019',
        title: 'Continuous Container & Dependency Vulnerability Remediation (SCA/CI)',
        description: 'Mandatory automated Trivy/Snyk scanning in CI/CD pipelines with zero tolerance for unresolved Critical CVEs > 14 days.',
        category: 'INFRASTRUCTURE',
        type: 'DETECTIVE',
        standardTestingProcedure: 'Query vulnerability management API telemetry across 100% production container image digests.',
        defaultTestingFrequency: 'CONTINUOUS',
        frameworkMappings: [
          { frameworkCode: 'ISO_27001_2022', requirementCode: 'A.8.8', mappingType: 'DIRECT_SATISFACTION' },
          { frameworkCode: 'SOC_2_TYPE_2', requirementCode: 'SOC2-CC7.1', mappingType: 'DIRECT_SATISFACTION' }
        ]
      },
      {
        id: 'CTRL-DEF-042',
        code: 'CTRL-042',
        title: 'Data Encryption in Transit & TLS 1.3 Strict Enforcement',
        description: 'Enforce TLS 1.3 on all external and internal API ingress routes and disable deprecated cipher suites.',
        category: 'INFRASTRUCTURE',
        type: 'PREVENTIVE',
        standardTestingProcedure: 'Run automated SSL Labs scanner and inspect ALB/CloudFront ingress listener configurations.',
        defaultTestingFrequency: 'MONTHLY',
        frameworkMappings: [
          { frameworkCode: 'ISO_27001_2022', requirementCode: 'A.8.24', mappingType: 'DIRECT_SATISFACTION' }
        ]
      },
      {
        id: 'CTRL-DEF-077',
        code: 'CTRL-077',
        title: 'Third-Party SaaS Security Assessment & SOC 2 Verification',
        description: 'Mandatory annual SOC 2 Type 2 report review and financial solvency check for all Tier-1 critical vendors.',
        category: 'THIRD_PARTY',
        type: 'DETECTIVE',
        standardTestingProcedure: 'Sample 10 Tier-1 vendor records and verify active SOC 2 Type 2 bridge letters and DPA executions.',
        defaultTestingFrequency: 'ANNUAL',
        frameworkMappings: [
          { frameworkCode: 'MAS_TRM_2021', requirementCode: 'MAS-TRM-10.1', mappingType: 'DIRECT_SATISFACTION' }
        ]
      },
      {
        id: 'CTRL-DEF-095',
        code: 'CTRL-095',
        title: 'AI Model Safety, Algorithmic Bias & Red-Teaming Evaluation',
        description: 'Mandatory red-teaming, prompt injection defense testing, and fairness evaluation for all deployed LLM models.',
        category: 'AI_SAFETY',
        type: 'DETECTIVE',
        standardTestingProcedure: 'Run automated red-team test suites against production AI endpoints and inspect model cards.',
        defaultTestingFrequency: 'MONTHLY',
        frameworkMappings: [
          { frameworkCode: 'ISO_42001_2023', requirementCode: 'A.6.2', mappingType: 'DIRECT_SATISFACTION' }
        ]
      }
    ];

    defs.forEach(d => this.globalDefinitions.set(d.code, d));
  }

  private initializeTenantImplementations() {
    const impls: TenantControlImplementation[] = [
      {
        id: 'CTRL-001-ACME-PROD',
        tenantId: 'tenant-acme-corp',
        controlDefinitionId: 'CTRL-DEF-001',
        controlCode: 'CTRL-001',
        title: 'ACME Enterprise FIDO2 WebAuthn & Okta Adaptive MFA',
        owner: 'Sarah Chen (Director of IAM)',
        technicalCustodian: 'Alex Kumar (Lead Cloud SecOps)',
        businessUnitId: 'bu-cloud-fintech',
        scopeAssets: ['asset-okta-prod', 'asset-aws-sso', 'asset-github-ent'],
        implementationStatus: 'IMPLEMENTED',
        implementationDetails: 'Enforced via Okta Adaptive Access with hardware security keys (YubiKey 5C) for 100% of corporate and engineering staff.',
        operatingEnvironment: 'PRODUCTION',
        effectivenessRating: 'EFFECTIVE',
        testingFrequency: 'CONTINUOUS',
        lastTestedAt: '2026-09-30T10:00:00.000Z',
        nextTestDueDate: '2026-10-30',
        linkedEvidenceIds: ['EV-2026-001'],
        linkedRiskIds: ['RSK-001'],
        linkedPolicyIds: ['POL-IAM-01'],
        linkedFindingIds: [],
        updatedAt: '2026-09-30T10:00:00.000Z'
      },
      {
        id: 'CTRL-088-ACME-PROD',
        tenantId: 'tenant-acme-corp',
        controlDefinitionId: 'CTRL-DEF-088',
        controlCode: 'CTRL-088',
        title: 'ACME Teleport JIT Cloud Bastion & PAM Vault',
        owner: 'Sarah Chen (Director of IAM)',
        technicalCustodian: 'Alex Kumar (Lead Cloud SecOps)',
        businessUnitId: 'bu-cloud-fintech',
        scopeAssets: ['asset-teleport-cluster', 'asset-aws-root-vault'],
        implementationStatus: 'IMPLEMENTED',
        implementationDetails: 'Teleport Enterprise certificate-based JIT access with 4-hour max session TTL and full dual-authorization for prod database access.',
        operatingEnvironment: 'CLOUD_INGRESS',
        effectivenessRating: 'EFFECTIVE',
        testingFrequency: 'QUARTERLY',
        lastTestedAt: '2026-09-18T10:30:00.000Z',
        nextTestDueDate: '2026-12-18',
        activeExceptionId: 'EXC-2026-088',
        linkedEvidenceIds: ['EV-2026-001'],
        linkedRiskIds: ['RSK-014'],
        linkedPolicyIds: ['POL-IAM-01'],
        linkedFindingIds: [],
        updatedAt: '2026-09-18T10:30:00.000Z'
      },
      {
        id: 'CTRL-024-ACME-PROD',
        tenantId: 'tenant-acme-corp',
        controlDefinitionId: 'CTRL-DEF-024',
        controlCode: 'CTRL-024',
        title: 'ACME Multi-Region AWS KMS Key Hierarchy & Rotation',
        owner: 'David Rossi (DevSecOps Lead)',
        technicalCustodian: 'Cloud Infrastructure SecOps',
        businessUnitId: 'bu-cloud-fintech',
        scopeAssets: ['asset-aws-kms-primary', 'asset-aurora-db-kms'],
        implementationStatus: 'IMPLEMENTED',
        implementationDetails: 'Customer managed CMKs configured in ap-southeast-1 and us-east-1 with automated 365-day rotation and strict IAM separation.',
        operatingEnvironment: 'GLOBAL',
        effectivenessRating: 'EFFECTIVE',
        testingFrequency: 'CONTINUOUS',
        lastTestedAt: '2026-09-28T14:30:00.000Z',
        nextTestDueDate: '2026-10-28',
        linkedEvidenceIds: ['EV-2026-002'],
        linkedRiskIds: [],
        linkedPolicyIds: ['POL-CRYPTO-01'],
        linkedFindingIds: [],
        updatedAt: '2026-09-28T14:30:00.000Z'
      },
      {
        id: 'CTRL-019-ACME-PROD',
        tenantId: 'tenant-acme-corp',
        controlDefinitionId: 'CTRL-DEF-019',
        controlCode: 'CTRL-019',
        title: 'ACME GitHub Actions Trivy & Wiz Container Guard',
        owner: 'David Rossi (DevSecOps Lead)',
        technicalCustodian: 'DevSecOps Team',
        businessUnitId: 'bu-cloud-fintech',
        scopeAssets: ['asset-github-ci', 'asset-wiz-runtime'],
        implementationStatus: 'IMPLEMENTED',
        implementationDetails: 'Automated blocking gates in pull requests. Images with Critical CVEs fail Docker image publishing.',
        operatingEnvironment: 'PRODUCTION',
        effectivenessRating: 'EFFECTIVE',
        testingFrequency: 'CONTINUOUS',
        lastTestedAt: '2026-09-28T09:00:00.000Z',
        nextTestDueDate: '2026-10-28',
        linkedEvidenceIds: ['EV-2026-003'],
        linkedRiskIds: [],
        linkedPolicyIds: ['POL-DEVSEC-01'],
        linkedFindingIds: [],
        updatedAt: '2026-09-28T09:00:00.000Z'
      },
      {
        id: 'CTRL-042-ACME-PROD',
        tenantId: 'tenant-acme-corp',
        controlDefinitionId: 'CTRL-DEF-042',
        controlCode: 'CTRL-042',
        title: 'ACME Edge CloudFront & ALB TLS 1.3 Strict Ingress',
        owner: 'Alex Kumar (Lead Cloud SecOps)',
        technicalCustodian: 'Cloud Infrastructure SecOps',
        businessUnitId: 'bu-cloud-fintech',
        scopeAssets: ['asset-aws-alb', 'asset-s3-archive-09'],
        implementationStatus: 'PARTIALLY_IMPLEMENTED',
        implementationDetails: 'TLS 1.3 enforced on public API endpoints. 2 legacy S3 archival storage buckets have exception EXC-2026-042 pending remediation.',
        operatingEnvironment: 'PRODUCTION',
        effectivenessRating: 'PARTIALLY_EFFECTIVE',
        testingFrequency: 'MONTHLY',
        lastTestedAt: '2026-09-20T14:15:00.000Z',
        nextTestDueDate: '2026-10-20',
        activeExceptionId: 'EXC-2026-042',
        linkedEvidenceIds: ['EV-2026-002'],
        linkedRiskIds: ['RSK-003'],
        linkedPolicyIds: ['POL-CRYPTO-01'],
        linkedFindingIds: ['FND-003'],
        updatedAt: '2026-09-20T14:15:00.000Z'
      },
      {
        id: 'CTRL-077-ACME-FIN',
        tenantId: 'tenant-acme-corp',
        controlDefinitionId: 'CTRL-DEF-077',
        controlCode: 'CTRL-077',
        title: 'ACME Vendor Risk Management & SaaS Audit Verification',
        owner: 'Karthik Rao (Vendor Risk Lead)',
        technicalCustodian: 'Procurement Security',
        businessUnitId: 'bu-core-banking',
        scopeAssets: ['asset-vendor-registry'],
        implementationStatus: 'IMPLEMENTED',
        implementationDetails: 'Annual SOC 2 Type 2 evaluation workflow for all Tier-1 critical vendors with automated contract expiration tracking.',
        operatingEnvironment: 'CORPORATE',
        effectivenessRating: 'EFFECTIVE',
        testingFrequency: 'ANNUAL',
        lastTestedAt: '2026-09-29T11:45:00.000Z',
        nextTestDueDate: '2027-09-29',
        linkedEvidenceIds: ['EV-2026-004'],
        linkedRiskIds: ['RSK-008'],
        linkedPolicyIds: ['POL-TPRM-01'],
        linkedFindingIds: [],
        updatedAt: '2026-09-29T11:45:00.000Z'
      },
      {
        id: 'CTRL-095-ACME-AI',
        tenantId: 'tenant-acme-corp',
        controlDefinitionId: 'CTRL-DEF-095',
        controlCode: 'CTRL-095',
        title: 'ACME LLM Model Governance, Guardrails & Red-Teaming',
        owner: 'Dr. Elena Vance (Head of AI Safety)',
        technicalCustodian: 'AI Research & Platform SecOps',
        businessUnitId: 'bu-ai-research',
        scopeAssets: ['asset-llm-credit-scorer', 'asset-ai-sandbox-01'],
        implementationStatus: 'IMPLEMENTED',
        implementationDetails: 'OWASP LLM Top 10 automated red-teaming test harness and prompt injection filters deployed via NeMo guardrails.',
        operatingEnvironment: 'PRODUCTION',
        effectivenessRating: 'EFFECTIVE',
        testingFrequency: 'MONTHLY',
        lastTestedAt: '2026-09-30T16:20:00.000Z',
        nextTestDueDate: '2026-10-30',
        activeExceptionId: 'EXC-2026-095',
        linkedEvidenceIds: ['EV-2026-005'],
        linkedRiskIds: ['RSK-012'],
        linkedPolicyIds: ['POL-AI-01'],
        linkedFindingIds: [],
        updatedAt: '2026-09-30T16:20:00.000Z'
      }
    ];

    impls.forEach(i => this.tenantImplementations.set(i.controlCode, i));
  }

  private initializeControlTests() {
    const tests: ControlTest[] = [
      {
        id: 'TEST-2026-Q3-088',
        tenantId: 'tenant-acme-corp',
        controlImplementationId: 'CTRL-088-ACME-PROD',
        controlCode: 'CTRL-088',
        testTitle: 'Q3 2026 Privileged Access Management Effectiveness Fieldwork',
        testObjective: 'Validate that 100% of privileged sessions required just-in-time approval tickets and MFA.',
        testProcedure: 'Sampled 45 privileged sessions from Teleport audit log; verified ticket IDs and 4-hour timeout enforcement.',
        testType: 'HYBRID_SAMPLE',
        tester: 'Sarah Chen (Director IAM)',
        testerRole: 'FIRST_LINE_OPS',
        populationSize: 120,
        sampleSize: 45,
        samplingMethod: 'RANDOM',
        testingPeriod: { startDate: '2026-07-01', endDate: '2026-09-18' },
        testResult: 'PASS',
        effectiveness: 'EFFECTIVE',
        deficienciesIdentified: [],
        exceptionsNotedCount: 0,
        evidenceIds: ['EV-2026-001'],
        findingsGeneratedIds: [],
        performedAt: '2026-09-18T10:30:00.000Z',
        approvedBy: 'Dr. Marcus Vance (CISO)',
        approvedAt: '2026-09-20T14:00:00.000Z',
        status: 'SIGNED_OFF'
      },
      {
        id: 'TEST-2026-Q3-042',
        tenantId: 'tenant-acme-corp',
        controlImplementationId: 'CTRL-042-ACME-PROD',
        controlCode: 'CTRL-042',
        testTitle: 'Q3 2026 In-Transit & At-Rest Cryptography Inspection',
        testObjective: 'Verify TLS 1.3 enforcement and KMS key rotation across storage endpoints.',
        testProcedure: 'Port scan and SSL handshake evaluation of 30 S3 buckets and RDS clusters.',
        testType: 'AUTOMATED_TELEMETRY',
        tester: 'David Rossi (DevSecOps)',
        testerRole: 'FIRST_LINE_OPS',
        populationSize: 85,
        sampleSize: 30,
        samplingMethod: 'STRATIFIED',
        testingPeriod: { startDate: '2026-07-01', endDate: '2026-09-20' },
        testResult: 'PARTIAL',
        effectiveness: 'PARTIALLY_EFFECTIVE',
        deficienciesIdentified: ['2 legacy archival buckets accept non-TLS 1.3 connections.'],
        exceptionsNotedCount: 2,
        evidenceIds: ['EV-2026-002'],
        findingsGeneratedIds: ['FND-003'],
        performedAt: '2026-09-20T14:15:00.000Z',
        approvedBy: 'Sarah Chen',
        approvedAt: '2026-09-22T09:00:00.000Z',
        status: 'SIGNED_OFF'
      },
      {
        id: 'TEST-2026-Q3-095',
        tenantId: 'tenant-acme-corp',
        controlImplementationId: 'CTRL-095-ACME-AI',
        controlCode: 'CTRL-095',
        testTitle: 'Q3 2026 AI Red-Teaming & Prompt Injection Safety Assessment',
        testObjective: 'Evaluate LLM guardrail efficacy against OWASP LLM01 prompt injection attacks.',
        testProcedure: 'Executed 250 adversarial test prompt injections against credit scoring model endpoint.',
        testType: 'AUTOMATED_TELEMETRY',
        tester: 'Dr. Elena Vance (Lead AI Auditor)',
        testerRole: 'SECOND_LINE_RISK',
        populationSize: 250,
        sampleSize: 250,
        samplingMethod: '100_PERCENT_TELEMETRY',
        testingPeriod: { startDate: '2026-09-01', endDate: '2026-09-30' },
        testResult: 'PASS',
        effectiveness: 'EFFECTIVE',
        deficienciesIdentified: [],
        exceptionsNotedCount: 0,
        evidenceIds: ['EV-2026-005'],
        findingsGeneratedIds: [],
        performedAt: '2026-09-30T16:20:00.000Z',
        approvedBy: 'Dr. Aris Thorne (Chief AI Officer)',
        approvedAt: '2026-10-01T11:00:00.000Z',
        status: 'SIGNED_OFF'
      }
    ];

    tests.forEach(t => this.controlTests.set(t.id, t));
  }

  // ==========================================================================
  // QUERY METHODS
  // ==========================================================================

  public getAllControlDefinitions(): GlobalControlDefinition[] {
    return Array.from(this.globalDefinitions.values());
  }

  public getControlDefinitionByCode(code: string): GlobalControlDefinition | undefined {
    return this.globalDefinitions.get(code);
  }

  public getAllImplementations(): TenantControlImplementation[] {
    return Array.from(this.tenantImplementations.values());
  }

  public getImplementationByCode(code: string): TenantControlImplementation | undefined {
    return this.tenantImplementations.get(code);
  }

  public getAllTests(): ControlTest[] {
    return Array.from(this.controlTests.values());
  }

  public getTestById(id: string): ControlTest | undefined {
    return this.controlTests.get(id);
  }

  public getTestsForControl(controlCode: string): ControlTest[] {
    return Array.from(this.controlTests.values()).filter(t => t.controlCode === controlCode);
  }

  // ==========================================================================
  // 5-STATE CONTROL POSTURE CALCULATION (Real Lineage)
  // ==========================================================================

  public getControlTestingPosture() {
    const impls = this.getAllImplementations();
    const tests = this.getAllTests();

    const implemented = impls.filter(i => i.implementationStatus === 'IMPLEMENTED');
    const tested = impls.filter(i => i.lastTestedAt !== undefined);
    const effective = impls.filter(i => i.effectivenessRating === 'EFFECTIVE');
    const partiallyEffective = impls.filter(i => i.effectivenessRating === 'PARTIALLY_EFFECTIVE');
    const deficient = impls.filter(i => i.effectivenessRating === 'DEFICIENT');
    const untested = impls.filter(i => i.effectivenessRating === 'NOT_TESTED');

    return {
      totalDefinitions: this.globalDefinitions.size,
      totalImplemented: impls.length,
      testedCount: tested.length,
      effectiveCount: effective.length,
      partiallyEffectiveCount: partiallyEffective.length,
      deficientCount: deficient.length,
      untestedCount: untested.length,
      testingCoveragePercent: Math.round((tested.length / Math.max(1, impls.length)) * 100),
      effectivenessPercent: Math.round((effective.length / Math.max(1, impls.length)) * 100),
      totalTestsExecuted: tests.length,
      passedTestsCount: tests.filter(t => t.testResult === 'PASS').length,
      partialTestsCount: tests.filter(t => t.testResult === 'PARTIAL').length,
      failedTestsCount: tests.filter(t => t.testResult === 'FAIL').length
    };
  }

  // ==========================================================================
  // MUTATIONS & LINKAGES
  // ==========================================================================

  public recordTestResult(input: Omit<ControlTest, 'id' | 'performedAt'>): ControlTest {
    const id = `TEST-${new Date().getFullYear()}-Q${Math.floor(new Date().getMonth() / 3) + 1}-${input.controlCode.replace('CTRL-', '')}-${Date.now().toString().slice(-4)}`;
    const now = new Date().toISOString();

    const newTest: ControlTest = {
      ...input,
      id,
      performedAt: now
    };

    this.controlTests.set(id, newTest);

    // Update operational implementation effectiveness
    const impl = this.tenantImplementations.get(input.controlCode);
    if (impl) {
      impl.effectivenessRating = input.effectiveness;
      impl.lastTestedAt = now;
      impl.updatedAt = now;
    }

    return newTest;
  }

  public linkEvidenceToImplementation(controlCode: string, evidenceId: string) {
    const impl = this.tenantImplementations.get(controlCode);
    if (impl && !impl.linkedEvidenceIds.includes(evidenceId)) {
      impl.linkedEvidenceIds.push(evidenceId);
    }
  }

  public linkExceptionToImplementation(controlCode: string, exceptionId: string) {
    const impl = this.tenantImplementations.get(controlCode);
    if (impl) {
      impl.activeExceptionId = exceptionId;
    }
  }
}

export const controlTestingService = new ControlTestingService();
