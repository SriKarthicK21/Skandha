import { UnifiedControl } from '../../types/grcCoreTypes';

/**
 * SKANDA Unified Control Library
 * Centralized, reusable controls that exist independently from compliance frameworks.
 * Implements "Create Once, Comply with Many" architecture.
 */
export class UnifiedControlLibrary {
  private static controls: Map<string, UnifiedControl> = new Map();

  static {
    this.initializeControls();
  }

  private static initializeControls() {
    const controlsList: UnifiedControl[] = [
      {
        id: 'CTRL-IAM-01',
        code: 'CTRL-IAM-01',
        title: 'Multi-Factor Authentication (MFA) & Single Sign-On (SSO)',
        description: 'Mandatory enforcement of phishing-resistant MFA (FIDO2/WebAuthn or TOTP) for all workforce users accessing corporate identity providers, cloud consoles, and production systems.',
        category: 'ACCESS_CONTROL',
        type: 'PREVENTIVE',
        nature: 'AUTOMATED',
        implementationStatus: 'IMPLEMENTED',
        operatingEffectiveness: 'EFFECTIVE',
        owner: 'Director of Identity & Access Management (IAM)',
        frequency: 'CONTINUOUS',
        frameworkMappings: [
          { frameworkCode: 'ISO_27001_2022', requirementCode: 'A.5.15', relationshipType: 'DIRECT_SATISFACTION' },
          { frameworkCode: 'SOC_2_TYPE_2', requirementCode: 'SOC2-CC6.1', relationshipType: 'DIRECT_SATISFACTION' },
          { frameworkCode: 'NIST_CSF_2_0', requirementCode: 'NIST-PR.AA-01', relationshipType: 'DIRECT_SATISFACTION' },
          { frameworkCode: 'MAS_TRM_2021', requirementCode: 'MAS-TRM-8.1', relationshipType: 'PARTIAL_CONTRIBUTION' }
        ],
        linkedEvidenceIds: ['EV-2026-001', 'EV-2026-009'],
        linkedRiskIds: ['RSK-001', 'RSK-014'],
        linkedAssetIds: ['ast-okta-idp', 'ast-aws-sso-root'],
        linkedPolicyIds: ['POL-SEC-002'],
        lastTestedAt: '2026-09-28T10:00:00.000Z',
        nextTestDueDate: '2026-10-28T10:00:00.000Z',
        telemetrySource: 'Okta System Logs & AWS IAM Telemetry Ingestion'
      },

      {
        id: 'CTRL-IAM-02',
        code: 'CTRL-IAM-02',
        title: 'Quarterly Privileged Access & Entitlement Reviews',
        description: 'Formal quarterly recertification of privileged credentials, cloud administrative roles, and database superuser privileges with automated revocation of unapproved access.',
        category: 'ACCESS_CONTROL',
        type: 'DETECTIVE',
        nature: 'HYBRID',
        implementationStatus: 'IMPLEMENTED',
        operatingEffectiveness: 'EFFECTIVE',
        owner: 'SecOps Access Governance Lead',
        frequency: 'QUARTERLY',
        frameworkMappings: [
          { frameworkCode: 'ISO_27001_2022', requirementCode: 'A.5.15', relationshipType: 'DIRECT_SATISFACTION' },
          { frameworkCode: 'SOC_2_TYPE_2', requirementCode: 'SOC2-CC6.1', relationshipType: 'DIRECT_SATISFACTION' },
          { frameworkCode: 'NIST_CSF_2_0', requirementCode: 'NIST-PR.AA-01', relationshipType: 'DIRECT_SATISFACTION' }
        ],
        linkedEvidenceIds: ['EV-2026-002'],
        linkedRiskIds: ['RSK-001'],
        linkedAssetIds: ['ast-aws-prod-iam', 'ast-prod-db-postgres'],
        linkedPolicyIds: ['POL-SEC-002'],
        lastTestedAt: '2026-07-15T14:30:00.000Z',
        nextTestDueDate: '2026-10-15T14:30:00.000Z'
      },

      {
        id: 'CTRL-CRY-01',
        code: 'CTRL-CRY-01',
        title: 'Cryptographic Protection of Data at Rest & In Transit',
        description: 'Enforce AES-256 encryption at rest for all databases, block storage, and object stores, alongside TLS 1.3 encryption with strict cipher suites for all network ingress/egress.',
        category: 'CRYPTOGRAPHY',
        type: 'PREVENTIVE',
        nature: 'AUTOMATED',
        implementationStatus: 'IMPLEMENTED',
        operatingEffectiveness: 'EFFECTIVE',
        owner: 'Cloud Infrastructure Security Architect',
        frequency: 'CONTINUOUS',
        frameworkMappings: [
          { frameworkCode: 'ISO_27001_2022', requirementCode: 'A.8.24', relationshipType: 'DIRECT_SATISFACTION' },
          { frameworkCode: 'PCI_DSS_V4_0', requirementCode: 'PCI-DSS-3.5', relationshipType: 'DIRECT_SATISFACTION' },
          { frameworkCode: 'DPDP_ACT_2023', requirementCode: 'DPDP-SEC-8.4', relationshipType: 'DIRECT_SATISFACTION' },
          { frameworkCode: 'SOC_2_TYPE_2', requirementCode: 'SOC2-CC6.1', relationshipType: 'PARTIAL_CONTRIBUTION' }
        ],
        linkedEvidenceIds: ['EV-2026-003', 'EV-2026-012'],
        linkedRiskIds: ['RSK-004', 'RSK-008'],
        linkedAssetIds: ['ast-aws-s3-prod', 'ast-prod-rds-cluster'],
        linkedPolicyIds: ['POL-SEC-004'],
        lastTestedAt: '2026-10-01T08:00:00.000Z',
        telemetrySource: 'AWS Config Rules (s3-bucket-ssl-requests-only & rds-storage-encrypted)'
      },

      {
        id: 'CTRL-DLP-01',
        code: 'CTRL-DLP-01',
        title: 'Data Loss Prevention & Egress Monitoring',
        description: 'Real-time endpoint and network DLP monitoring to detect, alert, and block unauthorized exfiltration of customer PII, confidential source code, and cryptographic secrets.',
        category: 'PRIVACY',
        type: 'DETECTIVE',
        nature: 'AUTOMATED',
        implementationStatus: 'IMPLEMENTED',
        operatingEffectiveness: 'EFFECTIVE',
        owner: 'Data Protection Officer (DPO) & SOC Manager',
        frequency: 'CONTINUOUS',
        frameworkMappings: [
          { frameworkCode: 'ISO_27001_2022', requirementCode: 'A.8.12', relationshipType: 'DIRECT_SATISFACTION' },
          { frameworkCode: 'DPDP_ACT_2023', requirementCode: 'DPDP-SEC-8.4', relationshipType: 'DIRECT_SATISFACTION' },
          { frameworkCode: 'PCI_DSS_V4_0', requirementCode: 'PCI-DSS-3.5', relationshipType: 'PARTIAL_CONTRIBUTION' }
        ],
        linkedEvidenceIds: ['EV-2026-004'],
        linkedRiskIds: ['RSK-004', 'RSK-014'],
        linkedAssetIds: ['ast-corp-endpoints', 'ast-cloud-egress-gateway'],
        linkedPolicyIds: ['POL-PRV-001'],
        lastTestedAt: '2026-09-30T16:00:00.000Z',
        telemetrySource: 'CrowdStrike Falcon DLP & Cloudflare Egress Proxy'
      },

      {
        id: 'CTRL-VULN-01',
        code: 'CTRL-VULN-01',
        title: 'Continuous Vulnerability Management & Patching SLA',
        description: 'Automated weekly vulnerability scanning across all cloud infrastructure, container registries, and external IP ranges, with strict remediation SLAs (Critical: 48h, High: 7d).',
        category: 'INFRASTRUCTURE',
        type: 'CORRECTIVE',
        nature: 'AUTOMATED',
        implementationStatus: 'IMPLEMENTED',
        operatingEffectiveness: 'EFFECTIVE',
        owner: 'SecOps Vulnerability Management Lead',
        frequency: 'WEEKLY',
        frameworkMappings: [
          { frameworkCode: 'SOC_2_TYPE_2', requirementCode: 'SOC2-CC7.1', relationshipType: 'DIRECT_SATISFACTION' },
          { frameworkCode: 'MAS_TRM_2021', requirementCode: 'MAS-TRM-8.1', relationshipType: 'DIRECT_SATISFACTION' },
          { frameworkCode: 'ISO_27001_2022', requirementCode: 'A.8.12', relationshipType: 'PARTIAL_CONTRIBUTION' }
        ],
        linkedEvidenceIds: ['EV-2026-005', 'EV-2026-015'],
        linkedRiskIds: ['RSK-002', 'RSK-007'],
        linkedAssetIds: ['ast-eks-cluster-prod', 'ast-public-alb-ingress'],
        linkedPolicyIds: ['POL-SEC-003'],
        lastTestedAt: '2026-10-02T02:00:00.000Z',
        telemetrySource: 'Trivy + AWS Inspector v2 Ingestion'
      },

      {
        id: 'CTRL-TPRM-01',
        code: 'CTRL-TPRM-01',
        title: 'Third-Party Vendor Due Diligence & Continuous Security Rating',
        description: 'Comprehensive pre-contract security assessment, SOC 2/ISO 27001 certification verification, and continuous external security posture rating for all Tier 1 & Tier 2 suppliers.',
        category: 'THIRD_PARTY',
        type: 'PREVENTIVE',
        nature: 'HYBRID',
        implementationStatus: 'IMPLEMENTED',
        operatingEffectiveness: 'EFFECTIVE',
        owner: 'Head of Vendor Governance & Risk',
        frequency: 'ANNUAL',
        frameworkMappings: [
          { frameworkCode: 'ISO_27001_2022', requirementCode: 'A.5.23', relationshipType: 'DIRECT_SATISFACTION' },
          { frameworkCode: 'NIST_CSF_2_0', requirementCode: 'NIST-GV.SC-01', relationshipType: 'DIRECT_SATISFACTION' }
        ],
        linkedEvidenceIds: ['EV-2026-006'],
        linkedRiskIds: ['RSK-005'],
        linkedAssetIds: ['ast-vendor-portal'],
        linkedPolicyIds: ['POL-GOV-003'],
        lastTestedAt: '2026-08-10T11:00:00.000Z'
      },

      {
        id: 'CTRL-AI-01',
        code: 'CTRL-AI-01',
        title: 'AI Algorithmic Impact Assessment & Red-Teaming Guardrails',
        description: 'Mandatory pre-deployment AI ethics, bias, safety, and hallucination evaluation for all machine learning models and Generative AI systems with automated prompt guardrails.',
        category: 'AI_SAFETY',
        type: 'PREVENTIVE',
        nature: 'HYBRID',
        implementationStatus: 'IMPLEMENTED',
        operatingEffectiveness: 'EFFECTIVE',
        owner: 'Chief AI Ethics & Governance Officer',
        frequency: 'QUARTERLY',
        frameworkMappings: [
          { frameworkCode: 'ISO_42001_2023', requirementCode: 'ISO-42001-B.5.2', relationshipType: 'DIRECT_SATISFACTION' }
        ],
        linkedEvidenceIds: ['EV-2026-007'],
        linkedRiskIds: ['RSK-011'],
        linkedAssetIds: ['ast-ai-rag-pipeline', 'ast-gemini-llm-proxy'],
        linkedPolicyIds: ['POL-AI-001'],
        lastTestedAt: '2026-09-15T09:00:00.000Z'
      },

      {
        id: 'CTRL-BCP-01',
        code: 'CTRL-BCP-01',
        title: 'Business Impact Analysis (BIA) & Disaster Recovery Testing',
        description: 'Annual enterprise BIA to establish RTO/RPO limits for all Tier 1 mission-critical processes, backed by automated multi-region failover and database restoration drills.',
        category: 'BUSINESS_CONTINUITY',
        type: 'CORRECTIVE',
        nature: 'HYBRID',
        implementationStatus: 'IMPLEMENTED',
        operatingEffectiveness: 'EFFECTIVE',
        owner: 'Director of Business Resilience & Disaster Recovery',
        frequency: 'ANNUAL',
        frameworkMappings: [
          { frameworkCode: 'ISO_22301_2019', requirementCode: 'ISO-22301-8.2.2', relationshipType: 'DIRECT_SATISFACTION' }
        ],
        linkedEvidenceIds: ['EV-2026-008'],
        linkedRiskIds: ['RSK-006'],
        linkedAssetIds: ['ast-dr-singapore-secondary', 'ast-rds-aurora-global'],
        linkedPolicyIds: ['POL-BCP-001'],
        lastTestedAt: '2026-06-20T15:00:00.000Z'
      },

      {
        id: 'CTRL-INC-01',
        code: 'CTRL-INC-01',
        title: '24/7 Security Incident Response & 1-Hour Regulatory Notification',
        description: 'Continuous 24/7 SOC incident triage runbooks with automated SLA escalations to meet MAS 1-hour and DPDP statutory notification requirements upon confirmed breach.',
        category: 'INCIDENT_RESPONSE',
        type: 'CORRECTIVE',
        nature: 'HYBRID',
        implementationStatus: 'IMPLEMENTED',
        operatingEffectiveness: 'EFFECTIVE',
        owner: 'CISO / SOC Incident Commander',
        frequency: 'CONTINUOUS',
        frameworkMappings: [
          { frameworkCode: 'MAS_TRM_2021', requirementCode: 'MAS-TRM-13.1', relationshipType: 'DIRECT_SATISFACTION' },
          { frameworkCode: 'ISO_27001_2022', requirementCode: 'A.5.1', relationshipType: 'PARTIAL_CONTRIBUTION' }
        ],
        linkedEvidenceIds: ['EV-2026-010'],
        linkedRiskIds: ['RSK-003'],
        linkedAssetIds: ['ast-soc-siem-datadog', 'ast-pagerduty-oncall'],
        linkedPolicyIds: ['POL-SEC-005'],
        lastTestedAt: '2026-09-01T12:00:00.000Z'
      }
    ];

    controlsList.forEach(ctrl => this.controls.set(ctrl.id, ctrl));
  }

  public static getAllControls(): UnifiedControl[] {
    return Array.from(this.controls.values());
  }

  public static getControlById(id: string): UnifiedControl | undefined {
    return this.controls.get(id);
  }

  public static getControlsForFramework(frameworkCode: string): UnifiedControl[] {
    return Array.from(this.controls.values()).filter(c => 
      c.frameworkMappings.some(m => m.frameworkCode === frameworkCode)
    );
  }

  public static getControlsForRequirement(requirementCode: string): UnifiedControl[] {
    return Array.from(this.controls.values()).filter(c =>
      c.frameworkMappings.some(m => m.requirementCode === requirementCode)
    );
  }
}
