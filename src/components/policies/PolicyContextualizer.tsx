import React, { useState, useMemo } from 'react';
import { useGRC } from '../../context/GRCContext';
import {
  Sparkles,
  Server,
  Tag,
  Plus,
  Check,
  Copy,
  Download,
  Eye,
  Sliders,
  ShieldCheck,
  Clock,
  Mail,
  User,
  Phone,
  Layers,
  Database,
  Lock,
  GitBranch,
  Terminal,
  FileText,
  Building2,
  AlertTriangle,
  RefreshCw,
  X,
  ExternalLink,
  ChevronRight,
  Info,
  Trash2,
  CheckCircle,
  GripVertical,
  Network,
  ArrowRightLeft,
  Link2,
  Unlink2,
  Search,
  Filter,
  HardDrive,
  CheckCircle2,
  Activity,
  Cpu,
  FileCheck,
  ArrowRight,
  ShieldAlert,
  SlidersHorizontal,
  ChevronDown,
  Globe,
  Languages
} from 'lucide-react';
import {
  InfrastructureTag,
  PolicyClauseItem,
  PolicyMetadataConfig,
  PolicyInfrastructureMapping
} from '../../types';
import { exportPolicyPDF } from '../../utils/policyPdfExporter';
import { PolicyLanguageSwitcher } from './PolicyLanguageSwitcher';
import {
  SUPPORTED_LANGUAGES,
  getTranslatedClause,
  getTranslatedClausesList,
  getTranslatedPolicyDocument
} from '../../utils/policyTranslator';

// Default built-in infrastructure tags library enriched with concrete environment architecture telemetry
export const DEFAULT_INFRASTRUCTURE_TAGS: InfrastructureTag[] = [
  {
    id: 'tag-aws-iam',
    tag: 'AWS-IAM',
    name: 'AWS Identity and Access Management',
    category: 'Identity & Access',
    vendor: 'AWS',
    color: 'amber',
    description: 'Cloud IAM SSO, role-based delegation, temporary STS tokens, and conditional policies.',
    resourceIdentifier: 'arn:aws:iam::884920194812:role/ProductionSecOpsRole',
    driftStatus: 'COMPLIANT',
    iacProvider: 'Terraform v1.8 (aws_iam_role)',
    telemetryStream: 'AWS CloudTrail -> Datadog SIEM',
    evidenceHash: 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    technicalEnforcementSnippet: `• AWS-IAM Architecture Enforcement:
  - Centralized authentication is delegated exclusively to AWS IAM Identity Center (SSO) backed by FIDO2 WebAuthn MFA.
  - Long-lived IAM programmatic access keys are strictly prohibited; developers and CI/CD pipelines assume temporary IAM roles via AWS STS with max duration of 60 minutes.
  - All IAM role assumption policies enforce 'aws:MultiFactorAuthPresent: true' and IP-range CIDR whitelisting.
  - AWS Root Account credentials are locked in a dual-custody hardware safe with active CloudTrail alarm triggers on login.`
  },
  {
    id: 'tag-azure-blob',
    tag: 'Azure-Blob-Storage',
    name: 'Azure Blob Storage & Data Lake',
    category: 'Storage & Databases',
    vendor: 'Azure',
    color: 'sky',
    description: 'Azure blob containers with SSE, private endpoints, immutable policies, and TLS 1.3.',
    resourceIdentifier: 'https://apexproddataeu.blob.core.windows.net',
    driftStatus: 'COMPLIANT',
    iacProvider: 'Azure Bicep / Terraform azurerm',
    telemetryStream: 'Azure Monitor Diagnostic Settings',
    evidenceHash: 'sha256:4a5b6c7d8e9f0123456789abcdef0123456789abcdef0123456789abcdef0123',
    technicalEnforcementSnippet: `• Azure-Blob-Storage Technical Protection:
  - Anonymous public read access is disabled tenant-wide via Azure Policy definition 'storage-disallow-public-access'.
  - Server-Side Encryption (SSE) is enforced with Customer-Managed Keys (CMK) hosted in Azure Key Vault with Soft Delete and Purge Protection enabled.
  - Data transfer requires TLS 1.3 minimum cipher suites with Secure Transfer Required enabled across all storage accounts.
  - Ingress traffic is restricted to Azure Private Endpoints inside dedicated Virtual Networks (VNet).`
  },
  {
    id: 'tag-aws-s3',
    tag: 'AWS-S3',
    name: 'Amazon Simple Storage Service (S3)',
    category: 'Storage & Databases',
    vendor: 'AWS',
    color: 'emerald',
    description: 'S3 Buckets with S3 Block Public Access, Object Lock, and KMS-CMK encryption.',
    resourceIdentifier: 's3://apex-internal-immutable-audit-records',
    driftStatus: 'COMPLIANT',
    iacProvider: 'Terraform (aws_s3_bucket_policy)',
    telemetryStream: 'S3 Server Access Logs + CloudTrail',
    evidenceHash: 'sha256:9f8e7d6c5b4a3210fedcba9876543210fedcba9876543210fedcba9876543210',
    technicalEnforcementSnippet: `• AWS-S3 Security & Cryptographic Baseline:
  - Account-level 'S3 Block Public Access' is enforced via AWS Organizations Service Control Policy (SCP).
  - Dual-layer server-side encryption is mandated using AWS KMS keys ('aws:kms') with automated annual key rotation.
  - S3 Object Lock in Compliance Mode with Write-Once-Read-Many (WORM) retention is enforced on security log archive buckets.
  - S3 Bucket Ownership Controls are locked to 'BucketOwnerEnforced' to disable legacy ACLs.`
  },
  {
    id: 'tag-k8s-eks',
    tag: 'Kubernetes-EKS',
    name: 'Amazon Elastic Kubernetes Service',
    category: 'Compute & Containers',
    vendor: 'AWS',
    color: 'indigo',
    description: 'Container orchestration running restricted Pod Security Standards and secrets CSI driver.',
    resourceIdentifier: 'arn:aws:eks:us-east-1:884920194812:cluster/apex-k8s-prod-cluster',
    driftStatus: 'COMPLIANT',
    iacProvider: 'EKS Blueprints / ArgoCD',
    telemetryStream: 'FluentBit DaemonSet -> CloudWatch',
    evidenceHash: 'sha256:3a4b5c6d7e8f901234567890abcdef1234567890abcdef1234567890abcdef12',
    technicalEnforcementSnippet: `• Kubernetes-EKS Cluster Hardening:
  - Pod Security Admission (PSA) enforces the 'restricted' baseline profile; containers running as root (UID 0) or with privileged escalation are rejected by admission webhooks.
  - Default Kubernetes namespace network policies deny all cross-pod ingress and egress unless explicitly declared.
  - Workload identities use IAM Roles for Service Accounts (IRSA) with OIDC federation to eliminate static secrets inside container images.
  - Cluster secrets are injected directly into memory using the AWS Secrets Store CSI Driver.`
  },
  {
    id: 'tag-github-actions',
    tag: 'GitHub-Actions',
    name: 'GitHub Enterprise & Actions CI/CD',
    category: 'CI/CD & DevOps',
    vendor: 'Multi-Cloud',
    color: 'purple',
    description: 'Source code management, branch protection rulesets, CODEOWNERS, and automated secret scanning.',
    resourceIdentifier: 'github.com/apex-corp-org/* (Repo Rulesets)',
    driftStatus: 'COMPLIANT',
    iacProvider: 'GitHub Terraform Provider',
    telemetryStream: 'GitHub Audit Log Streaming API',
    evidenceHash: 'sha256:1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    technicalEnforcementSnippet: `• GitHub-Actions CI/CD & Branch Security:
  - Production branches require GitHub Rulesets with at least 2 approving peer reviews from designated CODEOWNERS.
  - Automated Pre-Receive Secret Scanning with Push Protection is active; commits containing secrets or API tokens are blocked at git-push time.
  - CI/CD build runners utilize Ephemeral GitHub-Hosted Runners running in isolated ephemeral virtual machines.
  - All commits must carry cryptographic GPG or SSH commit signatures verified by GitHub Enterprise.`
  },
  {
    id: 'tag-aws-kms',
    tag: 'AWS-KMS',
    name: 'AWS Key Management Service (KMS)',
    category: 'Cryptography & Keys',
    vendor: 'AWS',
    color: 'rose',
    description: 'Hardware security module (HSM) backed FIPS 140-2 Level 3 key management with annual rotation.',
    resourceIdentifier: 'arn:aws:kms:us-east-1:884920194812:key/mrk-84920a1e-842f-45b0-8182',
    driftStatus: 'COMPLIANT',
    iacProvider: 'Terraform aws_kms_key (CMK)',
    telemetryStream: 'CloudTrail KMS Event Log Stream',
    evidenceHash: 'sha256:5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f',
    technicalEnforcementSnippet: `• AWS-KMS Cryptographic Governance:
  - Cryptographic keys must be Customer-Managed Keys (CMK) configured in AWS KMS with 256-bit AES-GCM encryption.
  - Automated annual key rotation is enabled across all CMKs with key deletion subject to a mandatory 30-day pending window.
  - KMS key policies enforce least-privilege administrative access distinct from cryptographic encryption/decryption principals.`
  },
  {
    id: 'tag-okta-sso',
    tag: 'Okta-SSO',
    name: 'Okta Identity Engine',
    category: 'Identity & Access',
    vendor: 'Okta',
    color: 'blue',
    description: 'Centralized enterprise IdP with Adaptive Risk MFA, session timeouts, and device trust.',
    resourceIdentifier: 'apex-technologies.okta.com (Tenant ID: okta_eu_prod_01)',
    driftStatus: 'COMPLIANT',
    iacProvider: 'Okta Terraform Provider v4.2',
    telemetryStream: 'Okta System Log API Webhook',
    evidenceHash: 'sha256:8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c',
    technicalEnforcementSnippet: `• Okta-SSO Workforce Identity Controls:
  - Centralized workforce single sign-on is enforced via Okta Identity Engine with Adaptive MFA evaluating IP risk, geovelocity, and device management status.
  - Phishing-resistant FIDO2/WebAuthn authenticators (e.g. YubiKey, Touch ID) are mandatory for all production administrators.
  - Maximum idle session timeout is locked to 15 minutes for administrative portals and 8 hours for standard applications.`
  },
  {
    id: 'tag-crowdstrike',
    tag: 'CrowdStrike-Falcon',
    name: 'CrowdStrike Falcon Endpoint Security',
    category: 'Endpoint & SIEM',
    vendor: 'Multi-Cloud',
    color: 'red',
    description: 'Next-gen EDR, real-time behavioral prevention, USB storage lockdown, and zero-day isolation.',
    resourceIdentifier: 'CID: 8849-FALCON-PROD-AGENT-GRP-01',
    driftStatus: 'COMPLIANT',
    iacProvider: 'Ansible + Intune MDM Config',
    telemetryStream: 'CrowdStrike Streaming Event API',
    evidenceHash: 'sha256:9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d',
    technicalEnforcementSnippet: `• CrowdStrike-Falcon Endpoint Defense:
  - Next-Generation Antivirus (NGAV) and Endpoint Detection & Response (EDR) sensors are deployed to 100% of managed corporate laptops and cloud VMs.
  - USB Device Control blocks read/write access to unapproved external mass storage devices.
  - Host isolation is automatically triggered upon detection of active credential dumping or unauthorized network reconnaissance.`
  },
  {
    id: 'tag-datadog-siem',
    tag: 'Datadog-SIEM',
    name: 'Datadog Cloud SIEM & Log Pipeline',
    category: 'Endpoint & SIEM',
    vendor: 'Multi-Cloud',
    color: 'teal',
    description: 'Real-time log aggregation, CloudTrail ingestion, security signals, and 365-day cold archive.',
    resourceIdentifier: 'Datadog US1 / Cloud SIEM Org ID: 104928',
    driftStatus: 'COMPLIANT',
    iacProvider: 'Datadog Terraform Provider',
    telemetryStream: 'Unified Agent + CloudWatch Kinesis Forwarder',
    evidenceHash: 'sha256:0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e',
    technicalEnforcementSnippet: `• Datadog-SIEM Audit Logging & Alerting:
  - CloudTrail, VPC Flow Logs, Okta System Logs, and Kubernetes audit logs are streamed to Datadog in real time with 365-day immutable WORM retention.
  - Automated detection rules trigger immediate high-priority PagerDuty alerts to the SecOps On-Call rotation upon detection of unauthorized privilege escalations.`
  }
];

// Structured Clauses for each policy supporting bidirectional contextual mapping
export const POLICY_CLAUSES_REGISTRY: Record<string, PolicyClauseItem[]> = {
  'pol-access-control': [
    {
      id: 'pol-access-control-c1',
      policyId: 'pol-access-control',
      sectionNumber: '§1.1',
      title: 'Least Privilege Access Governance & Role Delegation',
      requirementText: 'Access privileges across production environments must be granted strictly based on verified business need, with temporary role delegations replacing standing administrative credentials.',
      isoReference: 'ISO/IEC 27001:2022 A.5.15 & A.5.18',
      frameworks: ['ISO 27001', 'SOC 2 CC6.1', 'NIST CSF PR.AC-4'],
      enforcementObjective: 'Eliminate permanent root keys; verify role assumption is governed by IAM session policies and approval tickets.',
      defaultTags: ['AWS-IAM']
    },
    {
      id: 'pol-access-control-c2',
      policyId: 'pol-access-control',
      sectionNumber: '§1.2',
      title: 'Mandatory Multi-Factor Authentication & Phishing Resistance',
      requirementText: 'Every human user accessing corporate consoles, code repositories, or production networks must authenticate with phishing-resistant hardware FIDO2 or biometric MFA.',
      isoReference: 'ISO/IEC 27001:2022 A.8.5',
      frameworks: ['ISO 27001', 'SOC 2 CC6.1', 'CIS Control 6.3'],
      enforcementObjective: 'Adaptive MFA enforcement based on device health, IP geovelocity, and FIDO2 WebAuthn keys.',
      defaultTags: ['Okta-SSO', 'AWS-IAM']
    },
    {
      id: 'pol-access-control-c3',
      policyId: 'pol-access-control',
      sectionNumber: '§2.1',
      title: 'Workload Identity & Ephemeral Session Tokens',
      requirementText: 'Microservices, serverless workloads, and CI/CD pipelines must assume ephemeral IAM roles via OIDC federation rather than storing long-lived static API secrets in source control or containers.',
      isoReference: 'ISO/IEC 27001:2022 A.8.2 & A.8.31',
      frameworks: ['ISO 27001', 'SOC 2 CC6.2', 'NIST 800-53 AC-3'],
      enforcementObjective: 'Zero static API secrets stored in code; dynamic short-lived STS tokens with 60-minute maximum lifespan.',
      defaultTags: ['AWS-IAM', 'Kubernetes-EKS']
    },
    {
      id: 'pol-access-control-c4',
      policyId: 'pol-access-control',
      sectionNumber: '§3.1',
      title: 'Privileged Access Logging & Rapid Session Invalidation',
      requirementText: 'All privileged administrative sessions and role assumptions must generate immutable audit events and support immediate emergency revocation upon suspected compromise.',
      isoReference: 'ISO/IEC 27001:2022 A.8.16 & A.5.24',
      frameworks: ['ISO 27001', 'SOC 2 CC7.2', 'GDPR Art. 32'],
      enforcementObjective: 'Instant administrative session kill-switch with CloudTrail / Okta System Log ingestion.',
      defaultTags: ['Okta-SSO', 'Datadog-SIEM']
    }
  ],
  'pol-data-protection': [
    {
      id: 'pol-data-protection-c1',
      policyId: 'pol-data-protection',
      sectionNumber: '§1.1',
      title: 'Storage Bucket Isolation & Public Access Blacklist',
      requirementText: 'All cloud object storage buckets and blob containers hosting customer or telemetry data must have account-level Public Access Blocks enabled with ingress restricted to private endpoints.',
      isoReference: 'ISO/IEC 27001:2022 A.8.10 & A.8.20',
      frameworks: ['ISO 27001', 'SOC 2 CC6.6', 'CIS AWS 2.1.4'],
      enforcementObjective: 'Prevent anonymous Internet traversal; enforce private VNet and VPC endpoint routing.',
      defaultTags: ['AWS-S3', 'Azure-Blob-Storage']
    },
    {
      id: 'pol-data-protection-c2',
      policyId: 'pol-data-protection',
      sectionNumber: '§2.1',
      title: 'Envelope Cryptography with Customer-Managed Keys (CMK)',
      requirementText: 'Data stored at rest must be encrypted using dual-layer AES-256 or ChaCha20-Poly1305 with Customer-Managed Keys hosted in dedicated HSMs featuring automated annual key rotation.',
      isoReference: 'ISO/IEC 27001:2022 A.8.24',
      frameworks: ['ISO 27001', 'SOC 2 CC6.7', 'FIPS 140-2 Level 3'],
      enforcementObjective: 'Auditable cryptographic key custody separated from cloud provider defaults with mandatory rotation logs.',
      defaultTags: ['AWS-KMS', 'Azure-Blob-Storage']
    },
    {
      id: 'pol-data-protection-c3',
      policyId: 'pol-data-protection',
      sectionNumber: '§3.1',
      title: 'Immutable Compliance WORM Storage & Anti-Ransomware Hold',
      requirementText: 'Security audit logs, database snapshots, and forensic images must be preserved using Write-Once-Read-Many (WORM) Object Lock retention that cannot be overridden even by root credentials.',
      isoReference: 'ISO/IEC 27001:2022 A.8.11 & A.8.14',
      frameworks: ['ISO 27001', 'SOC 2 CC7.4', 'SEC Rule 17a-4'],
      enforcementObjective: 'Cryptographic immutability against ransomware wipes and rogue admin deletions for 365 days.',
      defaultTags: ['AWS-S3', 'Datadog-SIEM']
    }
  ],
  'pol-incident-response': [
    {
      id: 'pol-incident-response-c1',
      policyId: 'pol-incident-response',
      sectionNumber: '§1.1',
      title: 'Continuous Control Plane Telemetry & SIEM Log Ingestion',
      requirementText: 'Every corporate workstation, server, cloud account, and identity provider must stream raw telemetry into a unified SIEM with automated behavioral anomaly detection.',
      isoReference: 'ISO/IEC 27001:2022 A.8.16 & A.5.24',
      frameworks: ['ISO 27001', 'SOC 2 CC7.2', 'NIST CSF DE.AE-1'],
      enforcementObjective: 'Real-time alert dispatch to 24/7 SecOps PagerDuty with 365-day cold archive retention.',
      defaultTags: ['Datadog-SIEM', 'CrowdStrike-Falcon']
    },
    {
      id: 'pol-incident-response-c2',
      policyId: 'pol-incident-response',
      sectionNumber: '§2.1',
      title: 'Automated Endpoint Quarantine & Malicious Session Revocation',
      requirementText: 'Upon detection of unauthorized credential dumping, lateral movement, or malware beacons, the affected host or account must be quarantined immediately to contain blast radius.',
      isoReference: 'ISO/IEC 27001:2022 A.5.25 & A.5.26',
      frameworks: ['ISO 27001', 'SOC 2 CC7.3', 'MITRE ATT&CK TA0040'],
      enforcementObjective: 'Sub-60-second automatic endpoint network severance and active Okta session token invalidation.',
      defaultTags: ['CrowdStrike-Falcon', 'Okta-SSO']
    },
    {
      id: 'pol-incident-response-c3',
      policyId: 'pol-incident-response',
      sectionNumber: '§3.1',
      title: 'Data Breach Escalation SLA & Supervisory Authority Notice',
      requirementText: 'Confirmed compromises involving personal data must trigger the emergency breach bridge and statutory notification to the designated DPO and competent Supervisory Authority.',
      isoReference: 'ISO/IEC 27001:2022 A.5.28',
      frameworks: ['ISO 27001', 'GDPR Art. 33', 'NIS2 Directive'],
      enforcementObjective: 'Strict SLA compliance: CISO triage within 15 minutes, formal regulatory notice within 72 hours.',
      defaultTags: ['Datadog-SIEM', 'Okta-SSO']
    }
  ],
  'pol-sdlc-cicd': [
    {
      id: 'pol-sdlc-cicd-c1',
      policyId: 'pol-sdlc-cicd',
      sectionNumber: '§1.1',
      title: 'Immutable Branch Protection & Mandatory Peer Reviews',
      requirementText: 'Direct git pushes to main or release branches are blocked. Merging requires at least 2 independent approving reviews from designated CODEOWNERS and passing status checks.',
      isoReference: 'ISO/IEC 27001:2022 A.8.25 & A.8.32',
      frameworks: ['ISO 27001', 'SOC 2 CC8.1', 'SLSA Level 3'],
      enforcementObjective: 'Enforce branch protection rulesets, dismissal of stale reviews, and admin restriction bypass locks.',
      defaultTags: ['GitHub-Actions']
    },
    {
      id: 'pol-sdlc-cicd-c2',
      policyId: 'pol-sdlc-cicd',
      sectionNumber: '§2.1',
      title: 'Pod Security Standards & Container Admission Webhooks',
      requirementText: 'Containerized workloads running on production orchestrators must adhere strictly to the Restricted Pod Security Standard, disallowing root execution (UID 0) and host namespaces.',
      isoReference: 'ISO/IEC 27001:2022 A.8.26 & A.8.31',
      frameworks: ['ISO 27001', 'CIS Kubernetes 5.2', 'SOC 2 CC6.6'],
      enforcementObjective: 'Automated cluster admission webhooks rejecting privileged containers and mounting read-only root filesystems.',
      defaultTags: ['Kubernetes-EKS', 'AWS-IAM']
    },
    {
      id: 'pol-sdlc-cicd-c3',
      policyId: 'pol-sdlc-cicd',
      sectionNumber: '§3.1',
      title: 'Pre-Commit Secret Scanning & Cryptographic Commit Attestation',
      requirementText: 'Automated push protection must reject commits containing secrets or high-entropy credentials, while all git commits must carry cryptographic GPG or SSH signatures.',
      isoReference: 'ISO/IEC 27001:2022 A.8.28 & A.8.30',
      frameworks: ['ISO 27001', 'SOC 2 CC7.1', 'NIST SSDF PO.3'],
      enforcementObjective: 'Block API keys at git push time; verify cryptographic developer identities prior to CI execution.',
      defaultTags: ['GitHub-Actions', 'AWS-KMS']
    }
  ]
};

// Document templates with placeholder tokens
export interface ContextualPolicyTemplate {
  id: string;
  code: string;
  title: string;
  category: string;
  isoClause: string;
  defaultTags: string[];
  templateText: string;
}

export const CONTEXTUAL_POLICY_TEMPLATES: ContextualPolicyTemplate[] = [
  {
    id: 'pol-access-control',
    code: 'ISMS-POL-01',
    title: 'Access Control & Identity Architecture Policy',
    category: 'Identity & Access',
    isoClause: 'ISO 27001:2022 A.5.15 - A.5.18, A.8.2',
    defaultTags: ['AWS-IAM', 'Okta-SSO'],
    templateText: `# {{COMPANY_NAME}}
## Information Security Management System (ISMS)
### Policy Document: {{POLICY_TITLE}} ({{POLICY_CODE}})
**ISO/IEC 27001:2022 Reference:** {{ISO_CLAUSE}}
**Version:** 2.4 | **Classification:** Internal Confidential
**Effective Date:** {{CURRENT_DATE}} | **Review Cycle:** Annual or Event-Triggered

---

### 1. Executive Mandate & Purpose
This policy establishes mandatory identity governance, authentication, and access authorization standards for {{COMPANY_NAME}}. In accordance with ISO 27001:2022 Clause 5.2 and Controls A.5.15 through A.5.18, access to company information assets is granted strictly on a verified need-to-know basis and revoked immediately upon role termination.

Executive oversight and policy enforcement are governed by:
- **Chief Information Security Officer:** {{CISO_NAME}} ({{CISO_EMAIL}})
- **Data Protection Officer:** {{DPO_NAME}} ({{DPO_EMAIL}} | Phone: {{DPO_PHONE}} | Registration: {{DPO_REG_ID}})

---

### 2. Concrete Infrastructure Architecture & Technical Mappings
This policy is operationalized and enforced across the following production infrastructure components:
**Mapped Infrastructure Tags:** {{MAPPED_INFRASTRUCTURE_TAGS}}

#### 2.1 Technical Enforcement Specifications:
{{INFRASTRUCTURE_TECHNICAL_ENFORCEMENT}}

---

### 3. Escalation SLAs & Access Breach Protocol
Any suspected unauthorized access attempt, privilege escalation, or compromised credential must be escalated immediately according to the following SLAs:
- **Severity 1 (Critical Compromise / Active Intrusion):** Acknowledgment within **{{ESCALATION_SLA_SEV1}}**. Escalation to {{CISO_NAME}} and Security On-Call.
- **Severity 2 (High Risk / Unauthorized Role Assumption):** Remediation initiated within **{{ESCALATION_SLA_SEV2}}**.
- **Severity 3 (Medium / Stale Inactive Account):** Deactivation within **{{ESCALATION_SLA_SEV3}}**.
- **Severity 4 (Low / Informational Access Request):** Resolution within **{{ESCALATION_SLA_SEV4}}**.
- **Regulatory Authority Notification:** Where personal data is breached, notification to the relevant Supervisory Authority shall occur within **{{REGULATORY_NOTIFICATION_SLA}}** under the supervision of {{DPO_NAME}}.

---

### 4. Continuous Review & Auditor Verification
This policy is verified by automated Policy-as-Code drift probes every 24 hours. Evidence artifacts including access review sign-offs, SSO authentication logs, and IAM condition matrices are retained for 365 days.`
  },
  {
    id: 'pol-data-protection',
    code: 'ISMS-POL-02',
    title: 'Data Protection, Cryptography & Storage Security Policy',
    category: 'Storage & Encryption',
    isoClause: 'ISO 27001:2022 A.8.10, A.8.11, A.8.12, A.8.24',
    defaultTags: ['Azure-Blob-Storage', 'AWS-S3', 'AWS-KMS'],
    templateText: `# {{COMPANY_NAME}}
## Information Security Management System (ISMS)
### Policy Document: {{POLICY_TITLE}} ({{POLICY_CODE}})
**ISO/IEC 27001:2022 Reference:** {{ISO_CLAUSE}}
**Version:** 2.1 | **Classification:** Internal Confidential
**Effective Date:** {{CURRENT_DATE}} | **Review Cycle:** Annual or Event-Triggered

---

### 1. Scope & Objective
This policy defines the cryptographic baselines, encryption-at-rest requirements, and data storage protections across all environments managed by {{COMPANY_NAME}}. In compliance with ISO 27001:2022 Control A.8.24 (Use of Cryptography) and Control A.8.10 (Information Deletion), unencrypted storage of sensitive customer or proprietary data is strictly prohibited.

Designated Governance Lead:
- **Data Protection Officer (DPO):** {{DPO_NAME}} ({{DPO_EMAIL}} | Tel: {{DPO_PHONE}})
- **Primary Cloud Environment:** {{PRIMARY_CLOUD}}
- **Backup Strategy:** {{BACKUP_RPO_RTO}}

---

### 2. Operational Infrastructure Mappings
The technical mandates in this policy are implemented directly via the following infrastructure components:
**Mapped Infrastructure Tags:** {{MAPPED_INFRASTRUCTURE_TAGS}}

#### 2.1 Technical Enforcement Specifications:
{{INFRASTRUCTURE_TECHNICAL_ENFORCEMENT}}

---

### 3. Incident Escalation SLAs & Data Leakage Protocol
In the event of unencrypted data exposure, bucket misconfiguration, or key compromise:
- **Severity 1 (Public Exposure of Sensitive/Customer Data):** Response within **{{ESCALATION_SLA_SEV1}}**; immediate bucket isolation and key revocation.
- **Severity 2 (Internal Key Exposure / CMK Drift):** Containment within **{{ESCALATION_SLA_SEV2}}**.
- **Supervisory Authority & Customer Notification:** In compliance with GDPR Article 33 and ISO 27001 A.5.24, {{DPO_NAME}} shall notify the lead Supervisory Authority within **{{REGULATORY_NOTIFICATION_SLA}}** of confirmed breach awareness.`
  },
  {
    id: 'pol-incident-response',
    code: 'ISMS-POL-03',
    title: 'Security Incident Management & Escalation SLA Policy',
    category: 'Incident Management',
    isoClause: 'ISO 27001:2022 A.5.24 - A.5.28',
    defaultTags: ['Datadog-SIEM', 'CrowdStrike-Falcon', 'Okta-SSO'],
    templateText: `# {{COMPANY_NAME}}
## Information Security Management System (ISMS)
### Policy Document: {{POLICY_TITLE}} ({{POLICY_CODE}})
**ISO/IEC 27001:2022 Reference:** {{ISO_CLAUSE}}
**Version:** 3.0 | **Classification:** Internal Confidential
**Effective Date:** {{CURRENT_DATE}} | **Review Cycle:** Semi-Annual / Incident Post-Mortem

---

### 1. Incident Management Framework
{{COMPANY_NAME}} maintains a formalized Computer Security Incident Response Plan (CSIRP) aligned with ISO/IEC 27001:2022 Control A.5.24 (Information Security Incident Management Planning and Preparation). All security events must be recorded, categorized, and escalated according to rigorous contractual and regulatory timeframes.

Governance Incident Commanders:
- **Incident Escalation Commander / CISO:** {{CISO_NAME}} ({{CISO_EMAIL}})
- **Data Protection & Privacy Lead:** {{DPO_NAME}} ({{DPO_EMAIL}} | Hotline: {{DPO_PHONE}})

---

### 2. Detection & Containment Infrastructure
Telemetry probes, alerts, and isolation capabilities are driven by the following infrastructure integrations:
**Mapped Infrastructure Tags:** {{MAPPED_INFRASTRUCTURE_TAGS}}

#### 2.1 Technical Enforcement Specifications:
{{INFRASTRUCTURE_TECHNICAL_ENFORCEMENT}}

---

### 3. Mandatory Incident Escalation Timelines (SLAs)
All personnel, contractors, and automated detection agents must adhere strictly to these escalation SLAs:
- **Severity 1 (Critical - Active Ransomware, Data Exfiltration, Service Disruption):** Initial triage and executive bridge established within **{{ESCALATION_SLA_SEV1}}**.
- **Severity 2 (High - Malicious Code Execution on Critical Assets, Credential Theft):** Response and containment initiated within **{{ESCALATION_SLA_SEV2}}**.
- **Severity 3 (Medium - Phishing attempt, suspicious login, vulnerability with no active exploit):** Investigation within **{{ESCALATION_SLA_SEV3}}**.
- **Severity 4 (Low - Minor misconfiguration, policy advisory):** Remediated within **{{ESCALATION_SLA_SEV4}}**.
- **Regulatory & Data Subject Notification SLA:** Formal disclosure to regulatory bodies and affected data subjects must occur within **{{REGULATORY_NOTIFICATION_SLA}}** following confirmation by {{DPO_NAME}} and legal counsel.`
  },
  {
    id: 'pol-sdlc-cicd',
    code: 'ISMS-POL-04',
    title: 'Secure Software Development Lifecycle & CI/CD Guardrails Policy',
    category: 'Application Security',
    isoClause: 'ISO 27001:2022 A.8.25 - A.8.32',
    defaultTags: ['GitHub-Actions', 'Kubernetes-EKS', 'AWS-IAM'],
    templateText: `# {{COMPANY_NAME}}
## Information Security Management System (ISMS)
### Policy Document: {{POLICY_TITLE}} ({{POLICY_CODE}})
**ISO/IEC 27001:2022 Reference:** {{ISO_CLAUSE}}
**Version:** 1.8 | **Classification:** Internal Confidential
**Effective Date:** {{CURRENT_DATE}} | **Review Cycle:** Annual or Major Architecture Shift

---

### 1. Purpose & SDLC Standards
This policy specifies the software engineering security baseline for all code repositories, deployment pipelines, and workload orchestrators at {{COMPANY_NAME}}. In compliance with ISO 27001:2022 Control A.8.25 (Secure Development Life Cycle) and A.8.32 (Change Management), all code changes undergo automated vulnerability scanning, mandatory peer review, and continuous testing prior to production release.

SDLC Executive Approvers:
- **Lead Security Architect / CISO:** {{CISO_NAME}} ({{CISO_EMAIL}})
- **Compliance & Privacy Reviewer:** {{DPO_NAME}} ({{DPO_EMAIL}})

---

### 2. Infrastructure Deployment & Pipeline Mappings
Enforcement is baked directly into the developer workflow through the following tools:
**Mapped Infrastructure Tags:** {{MAPPED_INFRASTRUCTURE_TAGS}}

#### 2.1 Technical Enforcement Specifications:
{{INFRASTRUCTURE_TECHNICAL_ENFORCEMENT}}

---

### 3. Vulnerability Remediation SLAs
Software vulnerabilities identified via SAST, DAST, or dependency scanning must be resolved per the following SLAs:
- **Critical Vulnerability (CVSS 9.0 - 10.0):** Patch deployed within **{{ESCALATION_SLA_SEV1}}** or 24 hours.
- **High Vulnerability (CVSS 7.0 - 8.9):** Patch deployed within **{{ESCALATION_SLA_SEV2}}** or 7 business days.
- **Medium Vulnerability (CVSS 4.0 - 6.9):** Addressed within **{{ESCALATION_SLA_SEV3}}** or 30 days.
- **Low Vulnerability (CVSS 0.1 - 3.9):** Addressed within **{{ESCALATION_SLA_SEV4}}** or next release cycle.`
  }
];

export interface PolicyContextualizerProps {
  initialViewMode?: 'contextual_mapping' | 'resolved' | 'template' | 'side_by_side' | 'mappings';
}

export const PolicyContextualizer: React.FC<PolicyContextualizerProps> = ({
  initialViewMode = 'contextual_mapping'
}) => {
  const { currentTenant, updateDocument, addDocument, logAuditEvent } = useGRC();

  // Active Infrastructure Tags (default library + custom)
  const [tags, setTags] = useState<InfrastructureTag[]>(DEFAULT_INFRASTRUCTURE_TAGS);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Active Policy Selection
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(CONTEXTUAL_POLICY_TEMPLATES[0].id);

  // Policy Mappings (Policy ID -> Tag Names)
  const [mappings, setMappings] = useState<Record<string, string[]>>({
    'pol-access-control': ['AWS-IAM', 'Okta-SSO', 'Kubernetes-EKS', 'Datadog-SIEM'],
    'pol-data-protection': ['Azure-Blob-Storage', 'AWS-S3', 'AWS-KMS', 'Datadog-SIEM'],
    'pol-incident-response': ['Datadog-SIEM', 'CrowdStrike-Falcon', 'Okta-SSO'],
    'pol-sdlc-cicd': ['GitHub-Actions', 'Kubernetes-EKS', 'AWS-IAM', 'AWS-KMS']
  });

  // Clause-level mappings (clauseId -> array of service tags) for granular bidirectional drag & drop
  const [clauseMappings, setClauseMappings] = useState<Record<string, string[]>>(() => {
    const init: Record<string, string[]> = {};
    Object.values(POLICY_CLAUSES_REGISTRY).forEach(clauseList => {
      clauseList.forEach(c => {
        init[c.id] = [...c.defaultTags];
      });
    });
    return init;
  });

  // Drag and drop interaction state
  const [draggedTag, setDraggedTag] = useState<string | null>(null);
  const [dragOverClauseId, setDragOverClauseId] = useState<string | null>(null);
  const [activeDropSuccessMessage, setActiveDropSuccessMessage] = useState<string | null>(null);

  // Bidirectional inspection & highlighting state
  const [inspectedServiceTag, setInspectedServiceTag] = useState<string | null>(null);
  const [highlightedClauseIds, setHighlightedClauseIds] = useState<string[]>([]);
  const [architectureSearchQuery, setArchitectureSearchQuery] = useState('');
  const [architectureCategoryFilter, setArchitectureCategoryFilter] = useState('All');

  // Dynamic Metadata Configuration (DPO names, SLAs, etc.)
  const [metadata, setMetadata] = useState<PolicyMetadataConfig>({
    dpoName: 'Dr. Sarah Lin, CIPP/E, CIPM',
    dpoEmail: 'dpo@apexsystems.internal',
    dpoPhone: '+1 (800) 555-DATA',
    dpoRegistrationId: 'DPO-REG-84920-EU',
    cisoName: 'Marcus Vance, CISO',
    cisoEmail: 'ciso@apexsystems.internal',
    escalationSlaSev1: '15 Minutes (24/7/365 On-Call Hotline)',
    escalationSlaSev2: '1 Hour',
    escalationSlaSev3: '24 Hours',
    escalationSlaSev4: '72 Hours',
    regulatoryNotificationSla: '72 Hours to Lead Supervisory Authority',
    companyName: currentTenant?.name || 'Apex Technologies Corp.',
    primaryCloud: 'AWS (us-east-1, eu-west-1) & Azure (West Europe)',
    backupRpoRto: 'RPO: 1 Hour | RTO: 4 Hours (Immutable Warm Standby)'
  });

  // View mode for the document previewer
  const [viewMode, setViewMode] = useState<'contextual_mapping' | 'resolved' | 'template' | 'side_by_side' | 'mappings'>(initialViewMode);
  const [activeMetadataTab, setActiveMetadataTab] = useState<'dpo' | 'slas' | 'org'>('dpo');

  // Quick tag definition input state
  const [quickTagInput, setQuickTagInput] = useState('');

  // Custom Tag Creation Modal
  const [showAddTagModal, setShowAddTagModal] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagVendor, setNewTagVendor] = useState<InfrastructureTag['vendor']>('AWS');
  const [newTagCategory, setNewTagCategory] = useState<InfrastructureTag['category']>('Storage & Databases');
  const [newTagDesc, setNewTagDesc] = useState('');
  const [newTagSnippet, setNewTagSnippet] = useState('');

  // Notifications & Feedback
  const [copied, setCopied] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfExportSuccess, setPdfExportSuccess] = useState<string | null>(null);

  // Language Localization & Distributed Teams (ISO 27001 Clause 7.5.3)
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [isBilingualView, setIsBilingualView] = useState<boolean>(false);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [translationSuccessMessage, setTranslationSuccessMessage] = useState<string | null>(null);

  const handleLanguageChange = (newLang: string) => {
    setIsTranslating(true);
    setSelectedLanguage(newLang);
    setTimeout(() => {
      setIsTranslating(false);
      const langObj = SUPPORTED_LANGUAGES.find(l => l.code === newLang);
      if (newLang !== 'en' && langObj) {
        setTranslationSuccessMessage(`Auto-translated ISO clauses into ${langObj.name} (${langObj.nativeName})`);
        setTimeout(() => setTranslationSuccessMessage(null), 4000);
      }
    }, 200);
  };

  // Active policy template
  const activeTemplate = useMemo(() => {
    return (
      CONTEXTUAL_POLICY_TEMPLATES.find(t => t.id === selectedTemplateId) ||
      CONTEXTUAL_POLICY_TEMPLATES[0]
    );
  }, [selectedTemplateId]);

  // Current tags mapped to the active policy
  const activePolicyTags = useMemo(() => {
    return mappings[activeTemplate.id] || [];
  }, [mappings, activeTemplate.id]);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set(tags.map(t => t.category));
    return ['All', ...Array.from(set)];
  }, [tags]);

  // Filtered tags by category
  const filteredTags = useMemo(() => {
    if (selectedCategory === 'All') return tags;
    return tags.filter(t => t.category === selectedCategory);
  }, [tags, selectedCategory]);

  // Toggle tag mapping for current policy
  const handleToggleTag = (tagStr: string) => {
    setMappings(prev => {
      const current = prev[activeTemplate.id] || [];
      const updated = current.includes(tagStr)
        ? current.filter(t => t !== tagStr)
        : [...current, tagStr];
      return {
        ...prev,
        [activeTemplate.id]: updated
      };
    });
  };

  // Quick define and map new infrastructure tag
  const handleQuickAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTagInput.trim()) return;
    const tagCode = quickTagInput.trim().toUpperCase().replace(/\s+/g, '-');
    const existing = tags.find(t => t.tag.toLowerCase() === tagCode.toLowerCase());
    if (existing) {
      if (!activePolicyTags.includes(existing.tag)) {
        handleToggleTag(existing.tag);
      }
      setQuickTagInput('');
      return;
    }
    const derivedVendor: InfrastructureTag['vendor'] =
      tagCode.includes('AWS') ? 'AWS' :
      tagCode.includes('AZURE') ? 'Azure' :
      tagCode.includes('GCP') ? 'GCP' :
      tagCode.includes('OKTA') ? 'Okta' : 'Multi-Cloud';

    const newTag: InfrastructureTag = {
      id: `tag-${Date.now()}`,
      tag: tagCode,
      name: quickTagInput.trim(),
      category: 'Storage & Databases',
      vendor: derivedVendor,
      color: 'indigo',
      description: `User-defined infrastructure tag for ${tagCode}`,
      technicalEnforcementSnippet: `• ${tagCode} Security Baseline & Technical Enforcement:
  - Technical safeguards require automated drift monitoring for ${tagCode} against approved CIS / ISO baselines.
  - Cryptographic controls mandate customer-managed keys (AES-256) and TLS 1.3 encryption in-transit.
  - Access permissions adhere to strict Principle of Least Privilege (PoLP) with role-based IAM delegations.`,
      isCustom: true
    };
    setTags(prev => [newTag, ...prev]);
    // auto-map to current policy
    setMappings(prev => ({
      ...prev,
      [activeTemplate.id]: [...(prev[activeTemplate.id] || []), tagCode]
    }));
    setQuickTagInput('');
  };

  // Delete user-defined tag
  const handleDeleteTag = (tagId: string, tagCode: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTags(prev => prev.filter(t => t.id !== tagId));
    setMappings(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(pId => {
        updated[pId] = updated[pId].filter(t => t !== tagCode);
      });
      return updated;
    });
  };

  // Active policy clauses from registry (raw master + translated)
  const rawActivePolicyClauses = useMemo(() => {
    return POLICY_CLAUSES_REGISTRY[activeTemplate.id] || [];
  }, [activeTemplate.id]);

  const activePolicyClauses = useMemo(() => {
    if (selectedLanguage === 'en') return rawActivePolicyClauses;
    return getTranslatedClausesList(rawActivePolicyClauses, selectedLanguage);
  }, [rawActivePolicyClauses, selectedLanguage]);

  // Filtered architecture services for the right panel palette
  const filteredArchitectureServices = useMemo(() => {
    let list = tags;
    if (architectureCategoryFilter !== 'All') {
      list = list.filter(t => t.category === architectureCategoryFilter);
    }
    if (architectureSearchQuery.trim()) {
      const q = architectureSearchQuery.toLowerCase();
      list = list.filter(
        t =>
          t.tag.toLowerCase().includes(q) ||
          t.name.toLowerCase().includes(q) ||
          t.vendor.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          (t.resourceIdentifier && t.resourceIdentifier.toLowerCase().includes(q))
      );
    }
    return list;
  }, [tags, architectureCategoryFilter, architectureSearchQuery]);

  // Granular mapping statistics for coverage calculations
  const mappingStats = useMemo(() => {
    const totalClauses = activePolicyClauses.length;
    if (totalClauses === 0) return { totalClauses: 0, coveredClauses: 0, percent: 100, totalServices: 0 };
    const coveredClauses = activePolicyClauses.filter(c => (clauseMappings[c.id] || []).length > 0).length;
    const allUniqueServices = new Set<string>();
    activePolicyClauses.forEach(c => {
      (clauseMappings[c.id] || []).forEach(t => allUniqueServices.add(t));
    });
    return {
      totalClauses,
      coveredClauses,
      percent: Math.round((coveredClauses / totalClauses) * 100),
      totalServices: allUniqueServices.size
    };
  }, [activePolicyClauses, clauseMappings]);

  // Link service to clause with bidirectional sync to policy level
  const linkServiceToClause = (clauseId: string, serviceTag: string) => {
    setClauseMappings(prev => {
      const existing = prev[clauseId] || [];
      if (existing.includes(serviceTag)) return prev;
      return {
        ...prev,
        [clauseId]: [...existing, serviceTag]
      };
    });

    // Also ensure the service is mapped to the policy document as a whole
    setMappings(prev => {
      const current = prev[activeTemplate.id] || [];
      if (current.includes(serviceTag)) return prev;
      return {
        ...prev,
        [activeTemplate.id]: [...current, serviceTag]
      };
    });

    logAuditEvent(
      'UPDATE',
      `Linked infrastructure service ${serviceTag} to clause ${clauseId} in ${activeTemplate.code}.`,
      'PASS'
    );

    setActiveDropSuccessMessage(`Linked ${serviceTag} to clause!`);
    setTimeout(() => setActiveDropSuccessMessage(null), 3000);
  };

  // Unlink service from clause
  const unlinkServiceFromClause = (clauseId: string, serviceTag: string) => {
    setClauseMappings(prev => {
      const existing = prev[clauseId] || [];
      return {
        ...prev,
        [clauseId]: existing.filter(t => t !== serviceTag)
      };
    });

    // Check if this tag is still used by any other clause in this policy
    setTimeout(() => {
      setMappings(prev => {
        const currentClauses = POLICY_CLAUSES_REGISTRY[activeTemplate.id] || [];
        const stillUsed = currentClauses.some(c => {
          const list = c.id === clauseId 
            ? (clauseMappings[clauseId] || []).filter(t => t !== serviceTag)
            : (clauseMappings[c.id] || []);
          return list.includes(serviceTag);
        });
        if (!stillUsed) {
          return {
            ...prev,
            [activeTemplate.id]: (prev[activeTemplate.id] || []).filter(t => t !== serviceTag)
          };
        }
        return prev;
      });
    }, 50);

    logAuditEvent(
      'UPDATE',
      `Unlinked infrastructure service ${serviceTag} from clause ${clauseId} in ${activeTemplate.code}.`,
      'PASS'
    );
  };

  // Drag and drop event handlers
  const handleDragStart = (e: React.DragEvent, serviceTag: string) => {
    e.dataTransfer.setData('text/plain', serviceTag);
    e.dataTransfer.effectAllowed = 'copy';
    setDraggedTag(serviceTag);
  };

  const handleDragEnd = () => {
    setDraggedTag(null);
    setDragOverClauseId(null);
  };

  const handleDragOverClause = (e: React.DragEvent, clauseId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (dragOverClauseId !== clauseId) {
      setDragOverClauseId(clauseId);
    }
  };

  const handleDragLeaveClause = (e: React.DragEvent, clauseId: string) => {
    e.preventDefault();
    if (dragOverClauseId === clauseId) {
      setDragOverClauseId(null);
    }
  };

  const handleDropOnClause = (e: React.DragEvent, clauseId: string) => {
    e.preventDefault();
    const serviceTag = e.dataTransfer.getData('text/plain') || draggedTag;
    if (serviceTag) {
      linkServiceToClause(clauseId, serviceTag);
    }
    setDraggedTag(null);
    setDragOverClauseId(null);
  };

  // Highlight clauses linked to a service (bidirectional link from architecture -> policy)
  const handleHighlightServiceClauses = (serviceTag: string) => {
    const currentClauses = POLICY_CLAUSES_REGISTRY[activeTemplate.id] || [];
    const linkedClauseIds = currentClauses
      .filter(c => (clauseMappings[c.id] || []).includes(serviceTag))
      .map(c => c.id);
    setHighlightedClauseIds(linkedClauseIds);
    setTimeout(() => {
      setHighlightedClauseIds([]);
    }, 4500);
  };

  // Auto-map best practices for the active policy
  const handleAutoMapBestPractices = () => {
    const currentClauses = POLICY_CLAUSES_REGISTRY[activeTemplate.id] || [];
    const updatedClauseMappings = { ...clauseMappings };
    const allTags = new Set(mappings[activeTemplate.id] || []);

    currentClauses.forEach(c => {
      updatedClauseMappings[c.id] = Array.from(new Set([...(updatedClauseMappings[c.id] || []), ...c.defaultTags]));
      c.defaultTags.forEach(t => allTags.add(t));
    });

    setClauseMappings(updatedClauseMappings);
    setMappings(prev => ({
      ...prev,
      [activeTemplate.id]: Array.from(allTags)
    }));

    setActiveDropSuccessMessage(`Auto-mapped cloud architecture services across all clauses in ${activeTemplate.code}!`);
    setTimeout(() => setActiveDropSuccessMessage(null), 3000);
  };

  // Reset mappings to defaults
  const handleResetClauseMappings = () => {
    const currentClauses = POLICY_CLAUSES_REGISTRY[activeTemplate.id] || [];
    const updatedClauseMappings = { ...clauseMappings };
    currentClauses.forEach(c => {
      updatedClauseMappings[c.id] = [...c.defaultTags];
    });
    setClauseMappings(updatedClauseMappings);
    setMappings(prev => ({
      ...prev,
      [activeTemplate.id]: [...activeTemplate.defaultTags]
    }));
    setActiveDropSuccessMessage('Reset clause mappings to default architecture!');
    setTimeout(() => setActiveDropSuccessMessage(null), 3000);
  };

  // Export Traceability Matrix (Markdown/JSON)
  const handleExportTraceabilityMatrix = () => {
    const currentClauses = POLICY_CLAUSES_REGISTRY[activeTemplate.id] || [];
    let report = `# ISO 27001 Traceability Matrix: ${activeTemplate.code} - ${activeTemplate.title}\n`;
    report += `**Organization:** ${metadata.companyName} | **Lead DPO:** ${metadata.dpoName}\n`;
    report += `**Generated:** ${new Date().toISOString()}\n\n`;
    report += `| Clause Section | Clause Title | ISO 27001:2022 Reference | Enforced Infrastructure Services | Architecture Telemetry / IaC | Status |\n`;
    report += `|---|---|---|---|---|---|\n`;
    currentClauses.forEach(c => {
      const linked = clauseMappings[c.id] || [];
      const linkedTags = linked.map(t => {
        const found = tags.find(x => x.tag === t);
        return found ? `${found.tag} (${found.vendor})` : t;
      });
      const servicesStr = linkedTags.length > 0 ? linkedTags.join(', ') : 'None (Shelfware Risk)';
      report += `| ${c.sectionNumber} | ${c.title} | ${c.isoReference} | ${servicesStr} | Real-Time Telemetry & IaC Bound | COMPLIANT |\n`;
    });
    navigator.clipboard.writeText(report);
    setActiveDropSuccessMessage('Traceability Matrix copied to clipboard!');
    setTimeout(() => setActiveDropSuccessMessage(null), 3000);
  };

  // Compile technical enforcement snippet from all mapped tags
  const compiledTechnicalSnippet = useMemo(() => {
    if (activePolicyTags.length === 0) {
      return `*(No specific infrastructure tags mapped yet. Select infrastructure tags on the left to inject automated cloud controls)*`;
    }
    return activePolicyTags
      .map(tagStr => {
        const tagObj = tags.find(t => t.tag === tagStr);
        return tagObj ? tagObj.technicalEnforcementSnippet : `• ${tagStr}: Custom technical controls active.`;
      })
      .join('\n\n');
  }, [activePolicyTags, tags]);

  // Inject metadata and mapped infrastructure into the policy template
  const resolvedDocumentContent = useMemo(() => {
    let content = activeTemplate.templateText;

    const dpoContactBlock = `• Designated Data Protection Officer (DPO): ${metadata.dpoName}
  - Official Email: ${metadata.dpoEmail}
  - 24/7 Escalation Hotline: ${metadata.dpoPhone}
  - Regulatory Registration ID: ${metadata.dpoRegistrationId}`;

    const slaMatrixTable = `| Incident Severity | Threshold & Impact | Mandatory Escalation SLA | Designated Response Lead |
|---|---|---|---|
| Severity 1 (Critical) | Active breach, data exfiltration, ransomware | ${metadata.escalationSlaSev1} | CISO (${metadata.cisoName}) & On-Call SecOps |
| Severity 2 (High) | Unauthorized role assumption, unencrypted cloud bucket | ${metadata.escalationSlaSev2} | Security Lead |
| Severity 3 (Medium) | Stale IAM account, missing MFA compliance | ${metadata.escalationSlaSev3} | Identity Admin |
| Severity 4 (Low) | Informational anomaly, policy inquiry | ${metadata.escalationSlaSev4} | Service Desk |
| Regulatory Authority | GDPR Art. 33 / ISO 27001 A.5.24 Breach Notice | ${metadata.regulatoryNotificationSla} | DPO (${metadata.dpoName}) |`;

    const replacements: Record<string, string> = {
      '{{COMPANY_NAME}}': metadata.companyName,
      '{{POLICY_TITLE}}': activeTemplate.title,
      '{{POLICY_CODE}}': activeTemplate.code,
      '{{ISO_CLAUSE}}': activeTemplate.isoClause,
      '{{CURRENT_DATE}}': new Date().toISOString().split('T')[0],
      '{{DPO_NAME}}': metadata.dpoName,
      '{{DPO_EMAIL}}': metadata.dpoEmail,
      '{{DPO_PHONE}}': metadata.dpoPhone,
      '{{DPO_REG_ID}}': metadata.dpoRegistrationId,
      '{{DPO_CONTACT_INFO}}': dpoContactBlock,
      '{{DPO_CONTACT_BLOCK}}': dpoContactBlock,
      '{{CISO_NAME}}': metadata.cisoName,
      '{{CISO_EMAIL}}': metadata.cisoEmail,
      '{{PRIMARY_CLOUD}}': metadata.primaryCloud,
      '{{BACKUP_RPO_RTO}}': metadata.backupRpoRto,
      '{{ESCALATION_SLA_SEV1}}': metadata.escalationSlaSev1,
      '{{ESCALATION_SLA_SEV2}}': metadata.escalationSlaSev2,
      '{{ESCALATION_SLA_SEV3}}': metadata.escalationSlaSev3,
      '{{ESCALATION_SLA_SEV4}}': metadata.escalationSlaSev4,
      '{{REGULATORY_NOTIFICATION_SLA}}': metadata.regulatoryNotificationSla,
      '{{ESCALATION_SLAS}}': slaMatrixTable,
      '{{ESCALATION_SLA_TABLE}}': slaMatrixTable,
      '{{INFRASTRUCTURE_TAGS}}':
        activePolicyTags.length > 0 ? activePolicyTags.join(', ') : 'None Specified',
      '{{MAPPED_INFRASTRUCTURE_TAGS}}':
        activePolicyTags.length > 0 ? activePolicyTags.join(', ') : 'None Specified',
      '{{INFRASTRUCTURE_TECHNICAL_ENFORCEMENT}}': compiledTechnicalSnippet
    };

    Object.entries(replacements).forEach(([token, val]) => {
      content = content.split(token).join(val);
    });

    if (selectedLanguage !== 'en') {
      content = getTranslatedPolicyDocument(content, activeTemplate.id, selectedLanguage, {
        companyName: metadata.companyName,
        dpoName: metadata.dpoName,
        cisoName: metadata.cisoName
      });
    }

    return content;
  }, [activeTemplate, metadata, activePolicyTags, compiledTechnicalSnippet, selectedLanguage]);

  // Comprehensive list of placeholder mappings for the inspector matrix
  const placeholderMappingsList = useMemo(() => {
    return [
      {
        token: '{{MAPPED_INFRASTRUCTURE_TAGS}}',
        category: 'Infrastructure Tags',
        source: `${activePolicyTags.length} Defined Cloud Tags (e.g. AWS-IAM, Azure-Blob-Storage)`,
        injectedPreview: activePolicyTags.length > 0 ? activePolicyTags.join(', ') : '*(None Mapped)*',
        isResolved: activePolicyTags.length > 0
      },
      {
        token: '{{INFRASTRUCTURE_TECHNICAL_ENFORCEMENT}}',
        category: 'Infrastructure Tags',
        source: 'Compiled Cloud Guardrails from Mapped Tags',
        injectedPreview: activePolicyTags.length > 0 ? `${activePolicyTags.length} Concrete Technical Clauses` : '*(Default Placeholder)*',
        isResolved: activePolicyTags.length > 0
      },
      {
        token: '{{DPO_NAME}}',
        category: 'DPO Contact Info',
        source: 'Dynamic Field: DPO Full Legal Name',
        injectedPreview: metadata.dpoName,
        isResolved: Boolean(metadata.dpoName)
      },
      {
        token: '{{DPO_EMAIL}}',
        category: 'DPO Contact Info',
        source: 'Dynamic Field: DPO Official Email',
        injectedPreview: metadata.dpoEmail,
        isResolved: Boolean(metadata.dpoEmail)
      },
      {
        token: '{{DPO_PHONE}}',
        category: 'DPO Contact Info',
        source: 'Dynamic Field: DPO 24/7 Hotline',
        injectedPreview: metadata.dpoPhone,
        isResolved: Boolean(metadata.dpoPhone)
      },
      {
        token: '{{DPO_REG_ID}}',
        category: 'DPO Contact Info',
        source: 'Dynamic Field: Regulatory Registration ID',
        injectedPreview: metadata.dpoRegistrationId,
        isResolved: Boolean(metadata.dpoRegistrationId)
      },
      {
        token: '{{DPO_CONTACT_INFO}}',
        category: 'DPO Contact Info',
        source: 'Composite Formatted DPO Directives Block',
        injectedPreview: `${metadata.dpoName} (${metadata.dpoEmail})`,
        isResolved: true
      },
      {
        token: '{{ESCALATION_SLA_SEV1}}',
        category: 'Escalation SLAs',
        source: 'Severity 1 Critical Breach SLA',
        injectedPreview: metadata.escalationSlaSev1,
        isResolved: Boolean(metadata.escalationSlaSev1)
      },
      {
        token: '{{ESCALATION_SLA_SEV2}}',
        category: 'Escalation SLAs',
        source: 'Severity 2 High Severity SLA',
        injectedPreview: metadata.escalationSlaSev2,
        isResolved: Boolean(metadata.escalationSlaSev2)
      },
      {
        token: '{{ESCALATION_SLA_SEV3}}',
        category: 'Escalation SLAs',
        source: 'Severity 3 Medium Incident SLA',
        injectedPreview: metadata.escalationSlaSev3,
        isResolved: Boolean(metadata.escalationSlaSev3)
      },
      {
        token: '{{ESCALATION_SLA_SEV4}}',
        category: 'Escalation SLAs',
        source: 'Severity 4 Low Anomaly SLA',
        injectedPreview: metadata.escalationSlaSev4,
        isResolved: Boolean(metadata.escalationSlaSev4)
      },
      {
        token: '{{REGULATORY_NOTIFICATION_SLA}}',
        category: 'Escalation SLAs',
        source: 'Supervisory Authority Notification Window',
        injectedPreview: metadata.regulatoryNotificationSla,
        isResolved: Boolean(metadata.regulatoryNotificationSla)
      },
      {
        token: '{{ESCALATION_SLA_TABLE}}',
        category: 'Escalation SLAs',
        source: 'Structured Markdown Incident Response SLA Matrix',
        injectedPreview: '5-Tier Severity Escalation Table',
        isResolved: true
      },
      {
        token: '{{COMPANY_NAME}}',
        category: 'Organization',
        source: 'Tenant Legal Entity',
        injectedPreview: metadata.companyName,
        isResolved: Boolean(metadata.companyName)
      },
      {
        token: '{{PRIMARY_CLOUD}}',
        category: 'Organization',
        source: 'Target Deployment Cloud & Regions',
        injectedPreview: metadata.primaryCloud,
        isResolved: Boolean(metadata.primaryCloud)
      }
    ];
  }, [activePolicyTags, metadata]);

  // Count detected vs resolved variables
  const placeholderStats = useMemo(() => {
    const rawTokens = activeTemplate.templateText.match(/\{\{[A-Z0-9_]+\}\}/g) || [];
    const uniqueTokens = Array.from(new Set(rawTokens));
    return {
      totalPlaceholders: uniqueTokens.length,
      resolvedCount: uniqueTokens.length,
      isFullyContextualized: activePolicyTags.length > 0
    };
  }, [activeTemplate, activePolicyTags]);

  // Handle Copy
  const handleCopy = () => {
    navigator.clipboard.writeText(resolvedDocumentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle Download Markdown
  const handleDownload = () => {
    const langSuffix = selectedLanguage !== 'en' ? `_${selectedLanguage.toUpperCase()}` : '';
    const blob = new Blob([resolvedDocumentContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${activeTemplate.code}_Contextualized_${activeTemplate.title.replace(/\s+/g, '_')}${langSuffix}.md`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Handle Export to PDF formatted with company branding and ISO standard headings
  const handleExportPDF = async () => {
    try {
      setIsExportingPdf(true);
      const mappedInfraDetails = activePolicyTags.map(tStr => {
        const tObj = tags.find(t => t.tag === tStr);
        return {
          tag: tStr,
          name: tObj?.name,
          category: tObj?.category,
          vendor: tObj?.vendor,
          resourceIdentifier: tObj?.resourceIdentifier,
          iacProvider: tObj?.iacProvider,
          evidenceHash: tObj?.evidenceHash,
          snippet: tObj?.technicalEnforcementSnippet
        };
      });

      const selectedLangObj = SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage);
      const fileName = await exportPolicyPDF({
        title: activeTemplate.title,
        code: activeTemplate.code,
        category: activeTemplate.category,
        isoClause: activeTemplate.isoClause,
        companyName: metadata.companyName || currentTenant?.name || 'Apex Technologies Corp.',
        version: '2.4',
        classification: 'Confidential (Internal Proprietary)',
        effectiveDate: new Date().toISOString().split('T')[0],
        language: selectedLanguage,
        languageLabel: selectedLangObj ? `${selectedLangObj.nativeName} (${selectedLangObj.name})` : undefined,
        cisoName: metadata.cisoName,
        cisoEmail: metadata.cisoEmail,
        dpoName: metadata.dpoName,
        dpoEmail: metadata.dpoEmail,
        dpoPhone: metadata.dpoPhone,
        dpoRegistrationId: metadata.dpoRegistrationId,
        primaryCloud: metadata.primaryCloud,
        backupRpoRto: metadata.backupRpoRto,
        escalationSlaSev1: metadata.escalationSlaSev1,
        escalationSlaSev2: metadata.escalationSlaSev2,
        escalationSlaSev3: metadata.escalationSlaSev3,
        escalationSlaSev4: metadata.escalationSlaSev4,
        regulatoryNotificationSla: metadata.regulatoryNotificationSla,
        policyText: resolvedDocumentContent,
        mappedTags: activePolicyTags,
        infrastructureDetails: mappedInfraDetails
      });

      logAuditEvent(
        'EXPORT',
        `Exported ISO/IEC 27001:2022 compliant PDF with enterprise branding for ${activeTemplate.code} (${fileName}).`,
        'PASS'
      );

      setPdfExportSuccess(`Exported ${fileName}`);
      setTimeout(() => setPdfExportSuccess(null), 4000);
    } catch (err) {
      console.error('Failed to export policy PDF:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Handle Save / Inject into Policy Suite
  const handleApplyToPolicySuite = () => {
    setIsApplying(true);
    setTimeout(() => {
      // Find or create matching document in GRCContext
      const existingDoc = currentTenant?.generatedDocs?.find(
        d => d.id === activeTemplate.id || d.title.includes(activeTemplate.title)
      );

      if (existingDoc) {
        updateDocument(existingDoc.id, {
          content: resolvedDocumentContent,
          lastModified: new Date().toISOString()
        });
      } else {
        addDocument({
          docCode: activeTemplate.code,
          title: activeTemplate.title,
          type: 'POLICY',
          category: activeTemplate.category,
          version: '2.0',
          status: 'DRAFT',
          owner: metadata.cisoName,
          approver: metadata.dpoName,
          effectiveDate: new Date().toISOString().split('T')[0],
          reviewCycle: 'Annual',
          content: resolvedDocumentContent
        });
      }

      logAuditEvent(
        'UPDATE',
        `Policy Contextualizer mapped tags [${activePolicyTags.join(', ')}] and injected DPO (${metadata.dpoName}) & SLAs into ${activeTemplate.code}.`,
        'PASS'
      );

      setIsApplying(false);
      setAppliedSuccess(true);
      setTimeout(() => setAppliedSuccess(false), 3500);
    }, 700);
  };

  // Handle Create Custom Tag
  const handleCreateCustomTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    const formattedTag = newTagName.trim().toUpperCase().replace(/\s+/g, '-');
    const newTag: InfrastructureTag = {
      id: `custom-tag-${Date.now()}`,
      tag: formattedTag,
      name: newTagName.trim(),
      category: newTagCategory,
      vendor: newTagVendor,
      color: 'indigo',
      description: newTagDesc || `Custom organizational infrastructure tag for ${newTagName}`,
      technicalEnforcementSnippet:
        newTagSnippet || `• ${formattedTag} Technical Enforcement:\n  - Automated policy standards enforced across ${newTagName}.`,
      isCustom: true
    };

    setTags(prev => [newTag, ...prev]);
    // Automatically map this new tag to the current policy
    setMappings(prev => ({
      ...prev,
      [activeTemplate.id]: [...(prev[activeTemplate.id] || []), formattedTag]
    }));

    // Reset modal form
    setNewTagName('');
    setNewTagDesc('');
    setNewTagSnippet('');
    setShowAddTagModal(false);
  };

  return (
    <div className="space-y-6 text-slate-800">
      {/* Top Banner: Policy Contextualizer Purpose & Metrics */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded bg-indigo-100/70 border border-indigo-200 text-indigo-800 font-bold text-[10px] tracking-wider uppercase">
                  Pillar 1 Operationalizer
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Dynamic Tag-to-Policy Mapping & Variable Synthesis
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                Policy Contextualizer Studio
              </h2>
              <p className="text-xs text-slate-600 max-w-3xl leading-relaxed mt-0.5">
                Eliminate generic boilerplate shelfware. Map real infrastructure components (such as{' '}
                <code className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px] font-semibold">AWS-IAM</code> or{' '}
                <code className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px] font-semibold">Azure-Blob-Storage</code>)
                to any policy document, and automatically inject live compliance metadata like <strong>DPO details</strong> and <strong>incident escalation SLAs</strong> directly into auditor-grade templates.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Language Switcher for Distributed Global Teams */}
            <PolicyLanguageSwitcher
              currentLanguage={selectedLanguage}
              onLanguageChange={handleLanguageChange}
              isBilingual={isBilingualView}
              onToggleBilingual={setIsBilingualView}
              isLoading={isTranslating}
            />

            <button
              onClick={handleApplyToPolicySuite}
              disabled={isApplying}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isApplying ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Injecting Context...</span>
                </>
              ) : appliedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Injected into Policy Suite!</span>
                </>
              ) : (
                <>
                  <Layers className="w-3.5 h-3.5" />
                  <span>Inject into Policy Suite</span>
                </>
              )}
            </button>
            <button
              onClick={handleDownload}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-semibold transition flex items-center space-x-1 cursor-pointer"
              title="Download Markdown Document"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export .md</span>
            </button>
            <button
              id="btn-export-pdf-top"
              onClick={handleExportPDF}
              disabled={isExportingPdf}
              className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-xs cursor-pointer disabled:opacity-50"
              title="Export to PDF with ISO standard headings and company branding"
            >
              {isExportingPdf ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Formatting PDF...</span>
                </>
              ) : pdfExportSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>PDF Exported!</span>
                </>
              ) : (
                <>
                  <FileText className="w-3.5 h-3.5" />
                  <span>Export to PDF</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Translation Notification Toast */}
        {translationSuccessMessage && (
          <div className="mt-3 p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs flex items-center justify-between animate-in fade-in slide-in-from-top-1">
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-blue-600" />
              <span className="font-semibold">{translationSuccessMessage}</span>
            </div>
            <span className="text-[10px] font-mono bg-blue-200/60 text-blue-900 px-2 py-0.5 rounded-full font-bold">
              ISO 27001 Clause 7.5.3 Ready
            </span>
          </div>
        )}

        {/* Live Contextualization Status Counters */}
        <div className="pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
              {activePolicyTags.length}
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-medium uppercase">Mapped Infra Tags</div>
              <div className="font-bold text-slate-800">
                {activePolicyTags.length > 0 ? `${activePolicyTags.length} Active Cloud Tags` : '0 (Select Below)'}
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
              {placeholderStats.resolvedCount}
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-medium uppercase">Variables Injected</div>
              <div className="font-bold text-slate-800">
                {placeholderStats.totalPlaceholders} Live Tokens Synced
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">
              <User className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-medium uppercase">Active DPO</div>
              <div className="font-bold text-slate-800 truncate max-w-[140px]" title={metadata.dpoName}>
                {metadata.dpoName}
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-medium uppercase">Sev-1 Escalation SLA</div>
              <div className="font-bold text-slate-800 truncate max-w-[140px]" title={metadata.escalationSlaSev1}>
                {metadata.escalationSlaSev1}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Studio View Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">View Mode:</span>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setViewMode('contextual_mapping')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center space-x-1.5 ${
                viewMode === 'contextual_mapping'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Contextual Mapping (Drag & Drop)</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-emerald-800/40 text-emerald-100 ml-0.5">
                {mappingStats.percent}% Grounded
              </span>
            </button>

            <button
              onClick={() => setViewMode('resolved')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center space-x-1.5 ${
                viewMode === 'resolved'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Contextualized Policy Document</span>
            </button>

            <button
              onClick={() => setViewMode('template')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center space-x-1.5 ${
                viewMode === 'template'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Raw Tokens</span>
            </button>

            <button
              onClick={() => setViewMode('side_by_side')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center space-x-1.5 ${
                viewMode === 'side_by_side'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Side-by-Side</span>
            </button>

            <button
              onClick={() => setViewMode('mappings')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center space-x-1.5 ${
                viewMode === 'mappings'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Placeholder Matrix</span>
            </button>
          </div>
        </div>

        {/* Quick policy selector dropdown */}
        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-semibold text-slate-500">Active Document:</span>
          <select
            value={selectedTemplateId}
            onChange={(e) => setSelectedTemplateId(e.target.value)}
            className="text-xs font-bold text-indigo-900 bg-indigo-50 border border-indigo-200 rounded-xl px-2.5 py-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {CONTEXTUAL_POLICY_TEMPLATES.map(tpl => (
              <option key={tpl.id} value={tpl.id}>
                {tpl.code}: {tpl.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* VIEW MODE 1: Dedicated Contextual Mapping Workspace (Drag & Drop Bidirectional Link) */}
      {viewMode === 'contextual_mapping' && (
        <div className="space-y-4">
          {/* Policy Selector Pills Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {CONTEXTUAL_POLICY_TEMPLATES.map(tpl => {
              const isSelected = tpl.id === selectedTemplateId;
              const clauses = POLICY_CLAUSES_REGISTRY[tpl.id] || [];
              const mappedClausesCount = clauses.filter(c => (clauseMappings[c.id] || []).length > 0).length;
              const covPct = clauses.length > 0 ? Math.round((mappedClausesCount / clauses.length) * 100) : 100;

              return (
                <button
                  key={tpl.id}
                  onClick={() => setSelectedTemplateId(tpl.id)}
                  className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-indigo-50/90 border-indigo-300 ring-2 ring-indigo-400 shadow-2xs font-semibold'
                      : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-800">
                        {tpl.code}
                      </span>
                      <span className="text-[10px] text-slate-500 truncate">{tpl.isoClause}</span>
                    </div>
                    <div className="text-xs font-bold text-slate-900 truncate mt-1">{tpl.title}</div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                      covPct === 100
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : covPct > 0
                        ? 'bg-sky-50 text-sky-700 border-sky-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {covPct}% Grounded
                    </span>
                    <div className="text-[9px] text-slate-500 mt-0.5">{clauses.length} Clauses</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Contextual Mapping Header & Control Strip */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white border border-slate-700/80 shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {activeTemplate.code}
                  </span>
                  <h4 className="text-sm font-bold text-white tracking-wide">
                    Bidirectional Contextual Mapping: {activeTemplate.title}
                  </h4>
                </div>
                <p className="text-xs text-slate-300">
                  Drag infrastructure services from the right panel and drop onto clauses below to ground governance mandates in verifiable cloud telemetry.
                </p>
              </div>

              {/* Stats & Quick Actions */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="hidden sm:flex items-center space-x-2 bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
                  <span className="text-slate-400">Clause Coverage:</span>
                  <span className="font-bold text-emerald-400 font-mono">{mappingStats.percent}%</span>
                  <span className="text-slate-500">({mappingStats.coveredClauses}/{mappingStats.totalClauses} Clauses Grounded)</span>
                </div>

                <button
                  onClick={handleAutoMapBestPractices}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer shadow-xs"
                  title="Automatically link recommended cloud architecture services to each clause based on ISO control requirements"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Auto-Map Best Practices</span>
                </button>

                <button
                  onClick={handleExportTraceabilityMatrix}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
                  title="Copy markdown traceability matrix mapping Clauses to Cloud Services and IaC"
                >
                  <Copy className="w-3.5 h-3.5 text-sky-400" />
                  <span>Export Traceability Matrix</span>
                </button>

                <PolicyLanguageSwitcher
                  currentLanguage={selectedLanguage}
                  onLanguageChange={handleLanguageChange}
                  isBilingual={isBilingualView}
                  onToggleBilingual={setIsBilingualView}
                  isLoading={isTranslating}
                  compact={true}
                />

                <button
                  id="btn-export-pdf-mapping"
                  onClick={handleExportPDF}
                  disabled={isExportingPdf}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer shadow-xs disabled:opacity-50"
                  title="Export to PDF with ISO standard headings and company branding"
                >
                  {isExportingPdf ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Generating PDF...</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-3.5 h-3.5" />
                      <span>Export to PDF</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleResetClauseMappings}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                  title="Reset clause mappings"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Feedback toast banner */}
            {activeDropSuccessMessage && (
              <div className="mt-3 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between animate-in fade-in slide-in-from-top-1">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-medium">{activeDropSuccessMessage}</span>
                </div>
                <button
                  onClick={() => setActiveDropSuccessMessage(null)}
                  className="text-emerald-300 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Split Dual Workspace: Clauses Drop Canvas on Left (7 cols), Environment Architecture on Right (5 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Column: Policy Clauses Drop Target Canvas (7 cols on lg) */}
            <div className="lg:col-span-7 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Policy Clauses & Target Drop Zones ({activePolicyClauses.length} Clauses)
                  </h5>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">
                  {mappingStats.totalServices} Unique Infrastructure Services Enforcing
                </span>
              </div>

              {/* Clauses Cards List */}
              <div className="space-y-3.5">
                {activePolicyClauses.map(clause => {
                  const mappedTagNames = clauseMappings[clause.id] || [];
                  const isOver = dragOverClauseId === clause.id;
                  const isHighlighted = highlightedClauseIds.includes(clause.id);

                  return (
                    <div
                      key={clause.id}
                      className={`rounded-2xl border transition-all duration-200 p-4 space-y-3 ${
                        isOver
                          ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-400 shadow-md scale-[1.01]'
                          : isHighlighted
                          ? 'bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-400 shadow-md'
                          : 'bg-white border-slate-200/90 shadow-2xs hover:border-slate-300'
                      }`}
                    >
                      {/* Clause Header */}
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-0.5 rounded-md font-mono text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                              Section {clause.sectionNumber}
                            </span>
                            <h6 className="text-xs font-bold text-slate-900 leading-tight">
                              {clause.title}
                            </h6>
                            {selectedLanguage !== 'en' && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold flex items-center space-x-1">
                                <Globe className="w-2.5 h-2.5" />
                                <span>{selectedLanguage.toUpperCase()}</span>
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                            <span className="text-[10px] font-semibold font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              {clause.isoReference}
                            </span>
                            {clause.frameworks.map(fw => (
                              <span key={fw} className="text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                                {fw}
                              </span>
                            ))}
                          </div>
                        </div>

                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          mappedTagNames.length > 0
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {mappedTagNames.length > 0 ? `${mappedTagNames.length} Services Linked` : 'Ungrounded (Shelfware Risk)'}
                        </span>
                      </div>

                      {/* Requirement Text */}
                      <div className="space-y-2">
                        <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/60 p-2.5 rounded-xl border border-slate-100">
                          {clause.requirementText}
                        </p>

                        {/* Bilingual mode side-by-side verification */}
                        {isBilingualView && selectedLanguage !== 'en' && rawActivePolicyClauses.find(c => c.id === clause.id) && (
                          <div className="p-2.5 rounded-xl bg-slate-100/90 border border-slate-200/90 text-xs text-slate-600 space-y-1">
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
                              <Globe className="w-3 h-3 text-slate-400" />
                              <span>English Master Clause (ISO 27001 Baseline):</span>
                            </div>
                            <p className="text-[11px] text-slate-700 italic leading-relaxed">
                              {rawActivePolicyClauses.find(c => c.id === clause.id)?.requirementText}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Enforcement Objective Callout */}
                      <div className="text-[11px] text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200/60 flex items-start space-x-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                        <span><strong className="text-slate-700">Audit Proof Expectation:</strong> {clause.enforcementObjective}</span>
                      </div>

                      {/* Drag & Drop Target Zone */}
                      <div
                        onDragOver={(e) => handleDragOverClause(e, clause.id)}
                        onDragLeave={(e) => handleDragLeaveClause(e, clause.id)}
                        onDrop={(e) => handleDropOnClause(e, clause.id)}
                        className={`p-3 rounded-xl border-2 border-dashed transition-all ${
                          isOver
                            ? 'border-emerald-500 bg-emerald-100/50'
                            : 'border-slate-300/80 bg-slate-50/50 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700">
                            <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Bound Infrastructure Services:</span>
                          </div>
                          <span className="text-[11px] text-slate-400">
                            {isOver ? '✨ Drop service now to link' : 'Drag service here or use quick selector'}
                          </span>
                        </div>

                        {/* Mapped Service Chips */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          {mappedTagNames.length > 0 ? (
                            mappedTagNames.map(tagStr => {
                              const tagObj = tags.find(t => t.tag === tagStr);
                              return (
                                <div
                                  key={tagStr}
                                  className="group inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-white border border-slate-300 shadow-2xs text-xs font-medium text-slate-800 hover:border-emerald-400 transition"
                                >
                                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                  <span className="font-mono font-bold text-[11px] text-slate-900">{tagStr}</span>
                                  {tagObj && (
                                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1 py-0.2 rounded ml-1">
                                      {tagObj.vendor}
                                    </span>
                                  )}
                                  <button
                                    onClick={() => setInspectedServiceTag(tagStr)}
                                    title="Inspect Architecture Telemetry & IaC"
                                    className="p-0.5 text-slate-400 hover:text-indigo-600 cursor-pointer transition ml-1"
                                  >
                                    <Eye className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => unlinkServiceFromClause(clause.id, tagStr)}
                                    title={`Unlink ${tagStr} from this clause`}
                                    className="p-0.5 text-slate-400 hover:text-red-600 cursor-pointer transition"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              );
                            })
                          ) : (
                            <div className="w-full py-2.5 text-center text-xs text-amber-700 bg-amber-50/50 rounded-lg border border-amber-200/60 font-medium">
                              ⚠️ No infrastructure services bound to this clause. Drag a service card from the right panel to ground it!
                            </div>
                          )}

                          {/* Quick-Select Dropdown Alternative */}
                          <div className="relative inline-block">
                            <select
                              value=""
                              onChange={(e) => {
                                if (e.target.value) {
                                  linkServiceToClause(clause.id, e.target.value);
                                  e.target.value = '';
                                }
                              }}
                              className="text-[11px] font-semibold text-slate-600 bg-white hover:bg-slate-100 border border-slate-300 px-2 py-1 rounded-lg cursor-pointer transition"
                            >
                              <option value="" disabled>+ Quick Link Service...</option>
                              {tags
                                .filter(t => !mappedTagNames.includes(t.tag))
                                .map(t => (
                                  <option key={t.id} value={t.tag}>
                                    {t.tag} ({t.vendor} - {t.name})
                                  </option>
                                ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Live Synthesized Technical Enforcement Clause Box */}
                      {mappedTagNames.length > 0 && (
                        <div className="p-3 rounded-xl bg-slate-900 text-slate-200 text-[11px] font-mono leading-relaxed space-y-1 border border-slate-800">
                          <div className="flex items-center justify-between text-slate-400 pb-1 border-b border-slate-800 text-[10px]">
                            <span className="font-bold flex items-center space-x-1 text-emerald-400">
                              <Terminal className="w-3 h-3" />
                              <span>SYNTHESIZED TECHNICAL ENFORCEMENT CLAUSE:</span>
                            </span>
                            <span className="text-slate-500">Live Contextualized</span>
                          </div>
                          <div className="whitespace-pre-wrap pt-1 text-slate-300">
                            {mappedTagNames.map(tagStr => {
                              const tagObj = tags.find(t => t.tag === tagStr);
                              return tagObj ? tagObj.technicalEnforcementSnippet : `• ${tagStr}: Custom technical safeguards enforce ${clause.title}.`;
                            }).join('\n')}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Underlying Environment Architecture (5 cols on lg) */}
            <div className="lg:col-span-5 space-y-3 sticky top-4">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3.5">
                {/* Architecture Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Network className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900">Environment Architecture</h5>
                      <p className="text-[10px] text-slate-500 font-medium">Underlying Cloud & SaaS Infrastructure</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Telemetry Active</span>
                  </span>
                </div>

                {/* Drag Tip */}
                <div className="p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-200/80 text-[11px] text-indigo-900 flex items-start space-x-2">
                  <GripVertical className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <div>
                    <strong>Drag-and-Drop:</strong> Drag any service card below and drop it onto any policy clause on the left to create a bidirectional link.
                  </div>
                </div>

                {/* Search & Category Filter */}
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      value={architectureSearchQuery}
                      onChange={(e) => setArchitectureSearchQuery(e.target.value)}
                      placeholder="Filter services (e.g. IAM, S3, SIEM)..."
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition"
                    />
                  </div>

                  {/* Category Pills */}
                  <div className="flex flex-wrap gap-1">
                    {['All', 'Identity & Access', 'Storage & Databases', 'Compute & Containers', 'CI/CD & DevOps', 'Cryptography & Keys', 'Endpoint & SIEM'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setArchitectureCategoryFilter(cat)}
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-md transition cursor-pointer ${
                          architectureCategoryFilter === cat
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Draggable Services List */}
                <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
                  {filteredArchitectureServices.map(service => {
                    // Calculate how many clauses in current policy are linked to this service
                    const linkedClausesInCurrentPolicy = activePolicyClauses.filter(
                      c => (clauseMappings[c.id] || []).includes(service.tag)
                    );
                    const isCurrentlyDragged = draggedTag === service.tag;

                    return (
                      <div
                        key={service.id}
                        draggable={true}
                        onDragStart={(e) => handleDragStart(e, service.tag)}
                        onDragEnd={handleDragEnd}
                        className={`group p-3 rounded-xl border transition-all cursor-grab active:cursor-grabbing ${
                          isCurrentlyDragged
                            ? 'opacity-40 scale-95 border-emerald-400 bg-emerald-50'
                            : linkedClausesInCurrentPolicy.length > 0
                            ? 'bg-white border-emerald-200 shadow-2xs hover:border-emerald-400 hover:shadow-xs'
                            : 'bg-white border-slate-200 shadow-2xs hover:border-slate-300 hover:shadow-xs'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1.5">
                          <div className="flex items-center space-x-2">
                            <GripVertical className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 shrink-0" />
                            <div>
                              <div className="flex items-center space-x-1.5">
                                <span className="font-mono text-xs font-bold text-slate-900">{service.tag}</span>
                                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                                  service.vendor === 'AWS' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                                  service.vendor === 'Azure' ? 'bg-sky-50 text-sky-800 border-sky-200' :
                                  service.vendor === 'Okta' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                                  'bg-purple-50 text-purple-800 border-purple-200'
                                }`}>
                                  {service.vendor}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-600 line-clamp-1">{service.name}</p>
                            </div>
                          </div>

                          <span className="text-[9px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
                            {service.category}
                          </span>
                        </div>

                        {/* Concrete Resource Identifier & IaC info */}
                        <div className="mt-2 text-[10px] font-mono text-slate-500 bg-slate-50 p-1.5 rounded-lg border border-slate-100 space-y-0.5">
                          <div className="truncate flex items-center space-x-1">
                            <Cpu className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{service.resourceIdentifier || 'In-scope resource'}</span>
                          </div>
                          <div className="flex items-center justify-between text-[9px] text-slate-400">
                            <span>IaC: {service.iacProvider}</span>
                            <span className="text-emerald-600 font-bold">Drift: 0 (Compliant)</span>
                          </div>
                        </div>

                        {/* Bidirectional Link Controls */}
                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            {linkedClausesInCurrentPolicy.length > 0 ? (
                              <button
                                onClick={() => handleHighlightServiceClauses(service.tag)}
                                className="text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 flex items-center space-x-1 transition cursor-pointer"
                                title="Highlight clauses enforced by this service"
                              >
                                <Link2 className="w-3 h-3 text-emerald-600" />
                                <span>Enforcing {linkedClausesInCurrentPolicy.length} Clauses</span>
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">Unmapped in this policy</span>
                            )}
                          </div>

                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => setInspectedServiceTag(service.tag)}
                              className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded border border-indigo-200 transition cursor-pointer flex items-center space-x-1"
                              title="Inspect Architecture Details & Cryptographic Evidence"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Inspect</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: Document Contextualizer & Variable Matrix (5 Cols + 7 Cols) */}
      {viewMode !== 'contextual_mapping' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Controls, Tag Mapping, and Metadata (5 Columns) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Section A: Policy Document Selector */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>Target Policy Document</span>
              </span>
              <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                {CONTEXTUAL_POLICY_TEMPLATES.length} Available
              </span>
            </div>

            <div className="space-y-1.5">
              {CONTEXTUAL_POLICY_TEMPLATES.map(tpl => {
                const isSelected = tpl.id === selectedTemplateId;
                const mappedCount = (mappings[tpl.id] || []).length;
                return (
                  <button
                    key={tpl.id}
                    onClick={() => setSelectedTemplateId(tpl.id)}
                    className={`w-full text-left p-2.5 rounded-xl transition flex items-center justify-between border cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50/80 border-indigo-300 text-indigo-950 shadow-2xs font-semibold'
                        : 'bg-slate-50/50 hover:bg-slate-100 border-slate-200/80 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div
                        className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-mono font-bold ${
                          isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {tpl.code.split('-')[2] || '01'}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate">{tpl.title}</div>
                        <div className="text-[10px] text-slate-500 truncate">{tpl.isoClause}</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                          mappedCount > 0
                            ? 'bg-emerald-100 text-emerald-800 font-bold'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {mappedCount} Tags
                      </span>
                      <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section B: Infrastructure Tags Mapping Matrix */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                  <Tag className="w-4 h-4 text-emerald-600" />
                  <span>Infrastructure Tags Definition & Mapping</span>
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Define architecture tags (e.g. <strong>AWS-IAM</strong>, <strong>Azure-Blob-Storage</strong>) and map them to <strong>{activeTemplate.code}</strong>.
                </p>
              </div>

              <div className="flex items-center space-x-1.5">
                <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {tags.length} Defined
                </span>
                <button
                  onClick={() => setShowAddTagModal(true)}
                  className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-[11px] font-bold transition flex items-center space-x-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Custom Tag</span>
                </button>
              </div>
            </div>

            {/* Quick Inline Tag Definition Bar */}
            <form onSubmit={handleQuickAddTag} className="flex items-center gap-1.5 p-1.5 rounded-xl bg-slate-50 border border-slate-200 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition">
              <Tag className="w-4 h-4 text-slate-400 shrink-0 ml-1.5" />
              <input
                type="text"
                value={quickTagInput}
                onChange={e => setQuickTagInput(e.target.value)}
                placeholder="Define new tag (e.g. AWS-IAM, Azure-Blob-Storage, GCP-KMS)..."
                className="flex-1 bg-transparent text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!quickTagInput.trim()}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-[11px] font-bold transition flex items-center space-x-1 cursor-pointer shadow-2xs"
              >
                <Plus className="w-3 h-3" />
                <span>Define & Map</span>
              </button>
            </form>

            {/* Category Filter Pills */}
            <div className="flex items-center space-x-1 overflow-x-auto pb-1 text-[11px]">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2 py-0.5 rounded-lg whitespace-nowrap transition cursor-pointer font-medium ${
                    selectedCategory === cat
                      ? 'bg-slate-900 text-white shadow-2xs font-semibold'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Active Tags Chips Summary */}
            {activePolicyTags.length > 0 ? (
              <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-emerald-900 font-bold">
                  <span>Currently Mapped to {activeTemplate.code}:</span>
                  <span className="text-[10px] text-emerald-700 font-normal">Click tag to unmap</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {activePolicyTags.map(tagStr => {
                    return (
                      <span
                        key={tagStr}
                        onClick={() => handleToggleTag(tagStr)}
                        className="px-2 py-0.5 rounded-md bg-emerald-700 text-white text-[11px] font-mono font-bold flex items-center space-x-1 cursor-pointer hover:bg-emerald-800 transition"
                      >
                        <span>{tagStr}</span>
                        <X className="w-3 h-3 text-emerald-200 hover:text-white" />
                      </span>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  No infrastructure tags mapped to this policy yet. Select infrastructure below to ground this document in concrete cloud configurations.
                </p>
              </div>
            )}

            {/* Tags Library Grid */}
            <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-1">
              {filteredTags.map(t => {
                const isMapped = activePolicyTags.includes(t.tag);
                return (
                  <div
                    key={t.id}
                    onClick={() => handleToggleTag(t.tag)}
                    className={`p-2.5 rounded-xl border transition cursor-pointer flex items-start justify-between space-x-2 ${
                      isMapped
                        ? 'bg-emerald-50/50 border-emerald-300 shadow-2xs'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`font-mono text-xs font-bold px-1.5 py-0.2 rounded ${
                            isMapped ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-800 border border-slate-200'
                          }`}
                        >
                          {t.tag}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium px-1.5 py-0.2 rounded bg-slate-100">
                          {t.vendor}
                        </span>
                        {t.isCustom && (
                          <span className="text-[10px] text-indigo-700 font-bold px-1.5 py-0.2 rounded bg-indigo-50 border border-indigo-200">
                            Custom
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-semibold text-slate-800">{t.name}</div>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{t.description}</p>
                    </div>

                    <div className="shrink-0 flex items-center space-x-1.5 mt-1">
                      {t.isCustom && (
                        <button
                          type="button"
                          onClick={(e) => handleDeleteTag(t.id, t.tag, e)}
                          title="Delete custom defined tag"
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center border transition ${
                          isMapped
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-slate-300 bg-white text-transparent hover:border-slate-400'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section C: Live Metadata Injection Inputs (DPO, SLAs, Org) */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                <Sliders className="w-4 h-4 text-purple-600" />
                <span>Live Metadata Injection Values</span>
              </span>

              {/* Subtabs for Metadata: DPO, SLAs, Org */}
              <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg text-[10px]">
                <button
                  onClick={() => setActiveMetadataTab('dpo')}
                  className={`px-2 py-0.5 rounded-md font-semibold transition cursor-pointer ${
                    activeMetadataTab === 'dpo' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  DPO Details
                </button>
                <button
                  onClick={() => setActiveMetadataTab('slas')}
                  className={`px-2 py-0.5 rounded-md font-semibold transition cursor-pointer ${
                    activeMetadataTab === 'slas' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Escalation SLAs
                </button>
                <button
                  onClick={() => setActiveMetadataTab('org')}
                  className={`px-2 py-0.5 rounded-md font-semibold transition cursor-pointer ${
                    activeMetadataTab === 'org' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Organization & Cloud
                </button>
              </div>
            </div>

            {/* TAB 1: DPO Details */}
            {activeMetadataTab === 'dpo' && (
              <div className="space-y-3 pt-1">
                {/* DPO Quick Presets */}
                <div className="flex items-center space-x-1.5 pb-1 border-b border-slate-100">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Presets:</span>
                  <button
                    type="button"
                    onClick={() => setMetadata(prev => ({
                      ...prev,
                      dpoName: 'Dr. Evelyn Vance, CIPP/E, CIPM',
                      dpoEmail: 'dpo@enterprise-cloud.io',
                      dpoPhone: '+1 (800) 555-0199 (24/7 Priority)',
                      dpoRegistrationId: 'DPO-EU-GDPR-2026-88412'
                    }))}
                    className="text-[10px] px-2 py-0.5 rounded bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 cursor-pointer font-medium transition"
                  >
                    EU CIPP/E Lead DPO
                  </button>
                  <button
                    type="button"
                    onClick={() => setMetadata(prev => ({
                      ...prev,
                      dpoName: 'Marcus Sterling, Privacy & Legal Director',
                      dpoEmail: 'privacy-lead@corp-security.com',
                      dpoPhone: '+44 20 7946 0991',
                      dpoRegistrationId: 'ICO-UK-REG-449102'
                    }))}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 cursor-pointer font-medium transition"
                  >
                    UK ICO Privacy Lead
                  </button>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 flex items-center space-x-1">
                    <User className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Data Protection Officer (DPO) Name & Credentials</span>
                  </label>
                  <input
                    type="text"
                    value={metadata.dpoName}
                    onChange={e => setMetadata(prev => ({ ...prev, dpoName: e.target.value }))}
                    className="mt-1 w-full text-xs font-medium px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g. Dr. Sarah Lin, CIPP/E, CIPM"
                  />
                  <div className="text-[10px] text-slate-400 mt-0.5">Injects into token: {'{{DPO_NAME}}'}</div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 flex items-center space-x-1">
                      <Mail className="w-3.5 h-3.5 text-indigo-500" />
                      <span>DPO Email</span>
                    </label>
                    <input
                      type="email"
                      value={metadata.dpoEmail}
                      onChange={e => setMetadata(prev => ({ ...prev, dpoEmail: e.target.value }))}
                      className="mt-1 w-full text-xs font-medium px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 flex items-center space-x-1">
                      <Phone className="w-3.5 h-3.5 text-indigo-500" />
                      <span>DPO Escalation Hotline</span>
                    </label>
                    <input
                      type="text"
                      value={metadata.dpoPhone}
                      onChange={e => setMetadata(prev => ({ ...prev, dpoPhone: e.target.value }))}
                      className="mt-1 w-full text-xs font-medium px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                    <span>DPO Regulatory Registration ID</span>
                  </label>
                  <input
                    type="text"
                    value={metadata.dpoRegistrationId}
                    onChange={e => setMetadata(prev => ({ ...prev, dpoRegistrationId: e.target.value }))}
                    className="mt-1 w-full text-xs font-medium px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-1 focus:ring-indigo-500"
                    placeholder="e.g. DPO-REG-84920-EU"
                  />
                </div>
              </div>
            )}

            {/* TAB 2: Escalation SLAs */}
            {activeMetadataTab === 'slas' && (
              <div className="space-y-3 pt-1">
                {/* SLAs Quick Presets */}
                <div className="flex items-center space-x-1.5 pb-1 border-b border-slate-100">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Presets:</span>
                  <button
                    type="button"
                    onClick={() => setMetadata(prev => ({
                      ...prev,
                      escalationSlaSev1: '15 Minutes (24/7 Critical Bridge)',
                      escalationSlaSev2: '1 Hour (Engineering Escalation)',
                      escalationSlaSev3: '8 Hours (Same-Day Triage)',
                      escalationSlaSev4: '24 Hours (Next Business Day)',
                      regulatoryNotificationSla: '72 Hours (Mandatory GDPR Art. 33 / ISO 27001 Notice)'
                    }))}
                    className="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 cursor-pointer font-medium transition"
                  >
                    High-Criticality (15-min)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMetadata(prev => ({
                      ...prev,
                      escalationSlaSev1: '30 Minutes (SecOps PagerDuty Alert)',
                      escalationSlaSev2: '2 Hours (Security Lead)',
                      escalationSlaSev3: '24 Hours (Workday SLA)',
                      escalationSlaSev4: '72 Hours (Standard Support)',
                      regulatoryNotificationSla: '72 Hours to Lead Supervisory Authority'
                    }))}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 cursor-pointer font-medium transition"
                  >
                    Cloud SaaS (30-min)
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-rose-700 flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-rose-600" />
                      <span>Sev-1 Critical SLA</span>
                    </label>
                    <input
                      type="text"
                      value={metadata.escalationSlaSev1}
                      onChange={e => setMetadata(prev => ({ ...prev, escalationSlaSev1: e.target.value }))}
                      className="mt-1 w-full text-xs font-medium px-2.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50/50 text-slate-900 focus:ring-1 focus:ring-rose-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-amber-700 flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-amber-600" />
                      <span>Sev-2 High SLA</span>
                    </label>
                    <input
                      type="text"
                      value={metadata.escalationSlaSev2}
                      onChange={e => setMetadata(prev => ({ ...prev, escalationSlaSev2: e.target.value }))}
                      className="mt-1 w-full text-xs font-medium px-2.5 py-1.5 rounded-lg border border-amber-200 bg-amber-50/50 text-slate-900 focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-sky-700 flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-sky-600" />
                      <span>Sev-3 Medium SLA</span>
                    </label>
                    <input
                      type="text"
                      value={metadata.escalationSlaSev3}
                      onChange={e => setMetadata(prev => ({ ...prev, escalationSlaSev3: e.target.value }))}
                      className="mt-1 w-full text-xs font-medium px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-slate-600" />
                      <span>Sev-4 Low SLA</span>
                    </label>
                    <input
                      type="text"
                      value={metadata.escalationSlaSev4}
                      onChange={e => setMetadata(prev => ({ ...prev, escalationSlaSev4: e.target.value }))}
                      className="mt-1 w-full text-xs font-medium px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-purple-700 flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                    <span>Regulatory Supervisory Authority Notification SLA</span>
                  </label>
                  <input
                    type="text"
                    value={metadata.regulatoryNotificationSla}
                    onChange={e => setMetadata(prev => ({ ...prev, regulatoryNotificationSla: e.target.value }))}
                    className="mt-1 w-full text-xs font-medium px-2.5 py-1.5 rounded-lg border border-purple-200 bg-purple-50/50 text-slate-900 focus:ring-1 focus:ring-purple-500"
                  />
                  <div className="text-[10px] text-slate-500 mt-0.5">GDPR Article 33 & ISO 27001 Control A.5.24 compliance</div>
                </div>
              </div>
            )}

            {/* TAB 3: Organization & Cloud */}
            {activeMetadataTab === 'org' && (
              <div className="space-y-3 pt-1">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 flex items-center space-x-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Company Legal Entity</span>
                  </label>
                  <input
                    type="text"
                    value={metadata.companyName}
                    onChange={e => setMetadata(prev => ({ ...prev, companyName: e.target.value }))}
                    className="mt-1 w-full text-xs font-medium px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700">CISO / SecOps Lead</label>
                    <input
                      type="text"
                      value={metadata.cisoName}
                      onChange={e => setMetadata(prev => ({ ...prev, cisoName: e.target.value }))}
                      className="mt-1 w-full text-xs font-medium px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700">CISO Email</label>
                    <input
                      type="email"
                      value={metadata.cisoEmail}
                      onChange={e => setMetadata(prev => ({ ...prev, cisoEmail: e.target.value }))}
                      className="mt-1 w-full text-xs font-medium px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 flex items-center space-x-1">
                    <Server className="w-3.5 h-3.5 text-slate-500" />
                    <span>Primary Cloud Providers & Regions</span>
                  </label>
                  <input
                    type="text"
                    value={metadata.primaryCloud}
                    onChange={e => setMetadata(prev => ({ ...prev, primaryCloud: e.target.value }))}
                    className="mt-1 w-full text-xs font-medium px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 flex items-center space-x-1">
                    <Database className="w-3.5 h-3.5 text-slate-500" />
                    <span>Backup RPO & RTO SLA</span>
                  </label>
                  <input
                    type="text"
                    value={metadata.backupRpoRto}
                    onChange={e => setMetadata(prev => ({ ...prev, backupRpoRto: e.target.value }))}
                    className="mt-1 w-full text-xs font-medium px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Live Contextualized Document Previewer (7 Columns) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-700">
                    {activeTemplate.code}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">{activeTemplate.title}</h3>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Live Preview with real-time tag injection and metadata replacement
                </div>
              </div>

              {/* View Mode Switcher */}
              <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-xl text-xs shrink-0">
                <button
                  onClick={() => setViewMode('contextual_mapping')}
                  className="px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer flex items-center space-x-1 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Contextual Mapping</span>
                </button>
                <button
                  onClick={() => setViewMode('resolved')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer flex items-center space-x-1 ${
                    viewMode === 'resolved' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Contextualized</span>
                </button>
                <button
                  onClick={() => setViewMode('template')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer flex items-center space-x-1 ${
                    viewMode === 'template' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5 text-amber-600" />
                  <span>Raw Tokens</span>
                </button>
                <button
                  onClick={() => setViewMode('side_by_side')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer flex items-center space-x-1 ${
                    viewMode === 'side_by_side' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Side-by-Side</span>
                </button>
                <button
                  onClick={() => setViewMode('mappings')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer flex items-center space-x-1 ${
                    viewMode === 'mappings' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5 text-purple-600" />
                  <span>Placeholder Matrix</span>
                </button>
              </div>
            </div>

            {/* Document Render Area */}
            {viewMode === 'resolved' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/80">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>
                      Active Grounding: <strong>{activePolicyTags.length} Cloud Tags</strong> | DPO: <strong>{metadata.dpoName}</strong>
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <PolicyLanguageSwitcher
                      currentLanguage={selectedLanguage}
                      onLanguageChange={handleLanguageChange}
                      isBilingual={isBilingualView}
                      onToggleBilingual={setIsBilingualView}
                      isLoading={isTranslating}
                      compact={true}
                    />

                    <button
                      id="btn-export-pdf-resolved"
                      onClick={handleExportPDF}
                      disabled={isExportingPdf}
                      className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center space-x-1.5 cursor-pointer text-xs shadow-2xs transition disabled:opacity-50"
                      title="Export to PDF with branding and proper ISO standard headings"
                    >
                      {isExportingPdf ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Generating PDF...</span>
                        </>
                      ) : pdfExportSuccess ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-white" />
                          <span>PDF Exported!</span>
                        </>
                      ) : (
                        <>
                          <FileText className="w-3.5 h-3.5" />
                          <span>Export to PDF</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleDownload}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold flex items-center space-x-1 cursor-pointer text-xs transition"
                      title="Export Markdown Document"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>.md</span>
                    </button>
                    <button
                      onClick={handleCopy}
                      className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-semibold flex items-center space-x-1 cursor-pointer text-xs transition"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Text</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Localized Banner for Distributed Global Teams */}
                {selectedLanguage !== 'en' && (
                  <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/90 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs text-blue-900 shadow-2xs">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                        <Globe className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-bold">
                          {SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage)?.nativeName} ({SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage)?.name})
                        </span>
                        <span className="text-slate-600 ml-1.5 text-[11px]">
                          — Auto-translated ISO governance document for distributed team compliance under ISO/IEC 27001 Clause 7.5.3.
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleLanguageChange('en')}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 border border-blue-200 text-blue-700 text-[11px] font-semibold transition cursor-pointer shadow-2xs shrink-0"
                    >
                      Revert to English Master
                    </button>
                  </div>
                )}

                <div className="p-5 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs leading-relaxed max-h-[520px] overflow-y-auto border border-slate-800 whitespace-pre-wrap selection:bg-indigo-600">
                  {resolvedDocumentContent}
                </div>
              </div>
            )}

            {viewMode === 'template' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                  <div className="flex items-center space-x-2 text-amber-900">
                    <Info className="w-4 h-4 text-amber-600" />
                    <span>Displaying raw unpopulated template tokens ({'{{TOKEN_NAME}}'}).</span>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-slate-900 text-amber-300 font-mono text-xs leading-relaxed max-h-[520px] overflow-y-auto border border-slate-800 whitespace-pre-wrap selection:bg-amber-600">
                  {activeTemplate.templateText}
                </div>
              </div>
            )}

            {viewMode === 'side_by_side' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* Left: Template Placeholders */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                    1. Template Placeholders (Shelfware Prevention)
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-900 text-amber-300 font-mono text-[11px] leading-relaxed max-h-[480px] overflow-y-auto border border-slate-800 whitespace-pre-wrap">
                    {activeTemplate.templateText}
                  </div>
                </div>

                {/* Right: Resolved Reality */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                    <div className="flex items-center space-x-1.5">
                      <span>2. Injected Reality ({selectedLanguage !== 'en' ? `${selectedLanguage.toUpperCase()} Translated` : 'Auditor-Grade Operational'} Document)</span>
                      {selectedLanguage !== 'en' && (
                        <span className="px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800 text-[10px] font-mono">
                          {SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage)?.nativeName}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={handleExportPDF}
                      disabled={isExportingPdf}
                      className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-700 text-white font-semibold flex items-center space-x-1 cursor-pointer text-[10px] transition disabled:opacity-50"
                      title="Export to PDF with ISO standard headings"
                    >
                      <FileText className="w-3 h-3" />
                      <span>PDF</span>
                    </button>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950 text-emerald-300 font-mono text-[11px] leading-relaxed max-h-[480px] overflow-y-auto border border-slate-800 whitespace-pre-wrap">
                    {resolvedDocumentContent}
                  </div>
                </div>
              </div>
            )}

            {viewMode === 'mappings' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-600 bg-purple-50/70 px-3 py-2 rounded-xl border border-purple-200">
                  <div className="flex items-center space-x-2">
                    <Sliders className="w-4 h-4 text-purple-700" />
                    <span className="font-medium">
                      <strong>Policy-as-Code Placeholder Mappings Matrix</strong>: Dynamic tokens injected into <strong>{activeTemplate.code}</strong>.
                    </span>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white text-purple-800 font-bold border border-purple-200">
                    {placeholderMappingsList.length} Tokens Tracked
                  </span>
                </div>

                <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-2xs">
                  <div className="max-h-[480px] overflow-y-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50/80 text-[11px] font-bold text-slate-600 uppercase border-b border-slate-200">
                          <th className="py-2.5 px-3">Placeholder Token</th>
                          <th className="py-2.5 px-3">Domain / Category</th>
                          <th className="py-2.5 px-3">Dynamic Source</th>
                          <th className="py-2.5 px-3">Live Injected Value</th>
                          <th className="py-2.5 px-3 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {placeholderMappingsList.map(item => (
                          <tr key={item.token} className="hover:bg-slate-50/60 transition">
                            <td className="py-2.5 px-3 font-mono text-[11px] font-bold text-slate-900">
                              <span className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded border border-slate-200">
                                {item.token}
                              </span>
                            </td>
                            <td className="py-2.5 px-3">
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                item.category === 'Infrastructure Tags'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : item.category === 'DPO Contact Info'
                                  ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                  : item.category === 'Escalation SLAs'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-slate-100 text-slate-700 border border-slate-200'
                              }`}>
                                {item.category}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                              {item.source}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-[11px] text-slate-800 max-w-[200px] truncate" title={item.injectedPreview}>
                              {item.injectedPreview}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              {item.isResolved ? (
                                <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                  <CheckCircle className="w-3 h-3" />
                                  <span>Injected</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                  <AlertTriangle className="w-3 h-3" />
                                  <span>Unset</span>
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mapped Enforcement Summary Box */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                <Terminal className="w-4 h-4 text-sky-600" />
                <span>Enforcement Clauses Injected via Active Infrastructure Tags</span>
              </span>
              <span className="text-xs font-mono text-slate-500">{activePolicyTags.length} Clause Blocks</span>
            </div>

            {activePolicyTags.length > 0 ? (
              <div className="space-y-2">
                {activePolicyTags.map(tagStr => {
                  const tagObj = tags.find(t => t.tag === tagStr);
                  if (!tagObj) return null;
                  return (
                    <div key={tagObj.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span>{tagObj.tag}</span>
                          <span className="text-slate-400 font-normal">({tagObj.name})</span>
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {tagObj.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-mono whitespace-pre-wrap pl-3.5 border-l-2 border-emerald-400">
                        {tagObj.technicalEnforcementSnippet}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                Map tags from the left column to automatically synthesize technical infrastructure clauses into this policy.
              </div>
            )}
          </div>
        </div>
      </div>
      )}

      {/* Modal: Architecture Node Deep Dive & Bidirectional Traceability */}
      {inspectedServiceTag && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            {(() => {
              const service = tags.find(t => t.tag === inspectedServiceTag);
              if (!service) return null;

              // Find all clauses across all policies linked to this service
              const allLinkedClauses: { policyId: string; policyTitle: string; clause: PolicyClauseItem }[] = [];
              Object.entries(POLICY_CLAUSES_REGISTRY).forEach(([pId, cList]) => {
                const pTemplate = CONTEXTUAL_POLICY_TEMPLATES.find(t => t.id === pId);
                cList.forEach(c => {
                  const mList = clauseMappings[c.id] || [];
                  if (mList.includes(service.tag)) {
                    allLinkedClauses.push({
                      policyId: pId,
                      policyTitle: pTemplate ? pTemplate.title : pId,
                      clause: c
                    });
                  }
                });
              });

              return (
                <>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-mono font-bold text-sm shadow-xs">
                        <Network className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-bold text-slate-900">{service.tag}</h3>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                            {service.vendor}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">{service.name}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setInspectedServiceTag(null)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Telemetry & Architecture Specifications */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Resource Identifier</span>
                      <p className="font-mono font-semibold text-slate-900 text-[11px] break-all">
                        {service.resourceIdentifier || 'arn:aws:security::production-resource'}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">IaC Provisioning Engine</span>
                      <p className="font-mono font-semibold text-slate-900 text-[11px]">
                        {service.iacProvider || 'Terraform v1.8 (Policy as Code)'}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Real-Time Telemetry Pipeline</span>
                      <p className="font-mono font-semibold text-slate-900 text-[11px]">
                        {service.telemetryStream || 'CloudTrail Streaming -> Datadog SIEM'}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Drift Detection Status</span>
                      <div className="flex items-center space-x-1.5 pt-0.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="font-bold text-emerald-700 font-mono text-[11px]">100% COMPLIANT (0 Drift)</span>
                      </div>
                    </div>
                  </div>

                  {/* Cryptographic Evidence Hash */}
                  <div className="p-2.5 rounded-xl bg-slate-950 text-slate-300 font-mono text-[10px] space-y-1 border border-slate-800">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>CRYPTOGRAPHIC AUDIT EVIDENCE HASH:</span>
                      <span className="text-emerald-400">Verified Immutable</span>
                    </div>
                    <div className="text-emerald-300 break-all select-all">
                      {service.evidenceHash || 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069'}
                    </div>
                  </div>

                  {/* Technical Enforcement Code Block */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Enforced Cloud Guardrail Specification:</label>
                    <div className="p-3 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto border border-slate-800">
                      {service.technicalEnforcementSnippet}
                    </div>
                  </div>

                  {/* Bidirectional Traceability: All Governed Clauses across ISMS */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                        <ArrowRightLeft className="w-4 h-4 text-emerald-600" />
                        <span>ISMS Governance Traceability ({allLinkedClauses.length} Clauses Enforced)</span>
                      </span>
                      <span className="text-[10px] text-slate-500">Bidirectional Cloud Link</span>
                    </div>

                    {allLinkedClauses.length > 0 ? (
                      <div className="space-y-1.5 max-h-44 overflow-y-auto">
                        {allLinkedClauses.map(({ policyId, policyTitle, clause }) => (
                          <div
                            key={clause.id}
                            className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2 hover:bg-indigo-50/50 hover:border-indigo-200 transition"
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center space-x-2">
                                <span className="font-mono text-[10px] font-bold text-slate-700 bg-white px-1.5 py-0.2 rounded border border-slate-200">
                                  Section {clause.sectionNumber}
                                </span>
                                <span className="text-xs font-bold text-slate-900">{clause.title}</span>
                              </div>
                              <p className="text-[10px] text-slate-500 font-medium">
                                Policy: {policyTitle} | {clause.isoReference}
                              </p>
                            </div>

                            <button
                              onClick={() => {
                                setSelectedTemplateId(policyId);
                                setInspectedServiceTag(null);
                                setViewMode('contextual_mapping');
                                handleHighlightServiceClauses(service.tag);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold transition cursor-pointer shrink-0 flex items-center space-x-1"
                            >
                              <span>Jump to Clause</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                        This service is not yet mapped to any policy clauses in the ISMS.
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end pt-2 border-t border-slate-100">
                    <button
                      onClick={() => setInspectedServiceTag(null)}
                      className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
                    >
                      Close Inspector
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Modal: Add Custom Infrastructure Tag */}
      {showAddTagModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Add Custom Infrastructure Tag</h3>
                  <p className="text-xs text-slate-500">
                    Define an internal system (e.g., Snowflake, Kafka, Cloudflare) and its technical enforcement baseline.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddTagModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomTag} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700">Tag Identifier (Code)</label>
                <input
                  type="text"
                  required
                  value={newTagName}
                  onChange={e => setNewTagName(e.target.value)}
                  placeholder="e.g. GCP-Cloud-Storage or Snowflake-DW"
                  className="mt-1 w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Vendor / Ecosystem</label>
                  <select
                    value={newTagVendor}
                    onChange={e => setNewTagVendor(e.target.value as InfrastructureTag['vendor'])}
                    className="mt-1 w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900"
                  >
                    <option value="AWS">AWS</option>
                    <option value="Azure">Azure</option>
                    <option value="GCP">GCP</option>
                    <option value="Okta">Okta</option>
                    <option value="Multi-Cloud">Multi-Cloud</option>
                    <option value="Custom">Custom / In-House</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">Architecture Category</label>
                  <select
                    value={newTagCategory}
                    onChange={e => setNewTagCategory(e.target.value as InfrastructureTag['category'])}
                    className="mt-1 w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900"
                  >
                    <option value="Identity & Access">Identity & Access</option>
                    <option value="Storage & Databases">Storage & Databases</option>
                    <option value="Compute & Containers">Compute & Containers</option>
                    <option value="CI/CD & DevOps">CI/CD & DevOps</option>
                    <option value="Cryptography & Keys">Cryptography & Keys</option>
                    <option value="Endpoint & SIEM">Endpoint & SIEM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Description</label>
                <input
                  type="text"
                  value={newTagDesc}
                  onChange={e => setNewTagDesc(e.target.value)}
                  placeholder="e.g. Object storage buckets hosting production analytical snapshots"
                  className="mt-1 w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">
                  Technical Enforcement Snippet (Injected into Policy)
                </label>
                <textarea
                  rows={3}
                  value={newTagSnippet}
                  onChange={e => setNewTagSnippet(e.target.value)}
                  placeholder="• TECHNICAL ENFORCEMENT: Enforces TLS 1.3, IAM KMS encryption, and blocks public internet ingress..."
                  className="mt-1 w-full text-xs font-mono px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddTagModal(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Create & Map Tag
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
