import { LiveTranscriptSegment, TranscriptEntity, IdentifiedEntityType } from '../types/meetingScheduler';

export interface MeetingLiveTranscriptPack {
  meetingId: string;
  meetingCode: string;
  initialSegments: LiveTranscriptSegment[];
  initialEntities: TranscriptEntity[];
  queuedLiveStreamSegments: Array<{
    speaker: string;
    speakerRole: 'Interviewer / Lead Auditor' | 'Auditee / Stakeholder' | 'Observer';
    text: string;
    extractedEntities: Array<{
      name: string;
      type: IdentifiedEntityType;
      confidence: number;
      contextSnippet: string;
      associatedControlOrClause?: string;
      riskSeverity?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    }>;
  }>;
}

export const DEFAULT_TRANSCRIPT_PACKS: Record<string, MeetingLiveTranscriptPack> = {
  mtg_001: {
    meetingId: 'mtg_001',
    meetingCode: 'MTG-ISO-2026-001',
    initialEntities: [
      {
        id: 'ent_app_github',
        name: 'GitHub Enterprise',
        type: 'Application',
        mentionCount: 3,
        firstMentionTimestamp: '00:32',
        segmentId: 'seg_001_2',
        contextSnippet: 'Core microservices and CI/CD pipelines built via GitHub Enterprise with branch rules and automated SAST scans.',
        confidence: 0.99,
        associatedControlOrClause: 'ISO 27001:2022 A.8.25 Secure Coding',
        status: 'Mapped to Asset Inventory'
      },
      {
        id: 'ent_app_terraform',
        name: 'Terraform Cloud',
        type: 'Application',
        mentionCount: 2,
        firstMentionTimestamp: '00:32',
        segmentId: 'seg_001_2',
        contextSnippet: 'Infrastructure as Code deployment execution managed strictly through Terraform Cloud with immutable states.',
        confidence: 0.97,
        associatedControlOrClause: 'ISO 27001:2022 A.8.31 Separation of Dev/Prod',
        status: 'Extracted'
      },
      {
        id: 'ent_asset_aws_vpc',
        name: 'AWS Singapore Production VPC',
        type: 'Asset',
        mentionCount: 4,
        firstMentionTimestamp: '00:32',
        segmentId: 'seg_001_2',
        contextSnippet: 'Primary production Virtual Private Cloud hosting financial services microservices in AWS ap-southeast-1 region.',
        confidence: 0.98,
        associatedControlOrClause: 'ISO 27001:2022 A.8.20 Network Security',
        status: 'Mapped to Asset Inventory'
      },
      {
        id: 'ent_app_vault',
        name: 'HashiCorp Vault Enterprise',
        type: 'Application',
        mentionCount: 2,
        firstMentionTimestamp: '01:48',
        segmentId: 'seg_001_4',
        contextSnippet: 'Centralized enterprise secret engine handling automated credential issuance and dynamic certificate rotation.',
        confidence: 0.99,
        associatedControlOrClause: 'ISO 27001:2022 A.8.24 Cryptography',
        status: 'Mapped to Asset Inventory'
      },
      {
        id: 'ent_app_secrets_mgr',
        name: 'AWS Secrets Manager',
        type: 'Application',
        mentionCount: 2,
        firstMentionTimestamp: '01:48',
        segmentId: 'seg_001_4',
        contextSnippet: 'Cloud native key-value storage with KMS envelope encryption used for runtime microservice credentials.',
        confidence: 0.98,
        associatedControlOrClause: 'ISO 27001:2022 A.8.24 Cryptography',
        status: 'Extracted'
      },
      {
        id: 'ent_asset_postgres_prod',
        name: 'Production PostgreSQL Cluster (RDS Aurora)',
        type: 'Asset',
        mentionCount: 3,
        firstMentionTimestamp: '01:48',
        segmentId: 'seg_001_4',
        contextSnippet: 'Multi-AZ Aurora PostgreSQL cluster storing relational financial transactions and tenant metadata.',
        confidence: 0.99,
        associatedControlOrClause: 'ISO 27001:2022 A.8.10 Information Deletion',
        status: 'Mapped to Asset Inventory'
      },
      {
        id: 'ent_asset_redis_cluster',
        name: 'Redis Cache Cluster',
        type: 'Asset',
        mentionCount: 1,
        firstMentionTimestamp: '01:48',
        segmentId: 'seg_001_4',
        contextSnippet: 'In-memory ElastiCache cluster with encryption in-transit and at-rest for session state management.',
        confidence: 0.96,
        associatedControlOrClause: 'ISO 27001:2022 A.8.24 Cryptography',
        status: 'Extracted'
      },
      {
        id: 'ent_asset_aws_scp',
        name: 'AWS Organizations SCP Boundary',
        type: 'Asset',
        mentionCount: 1,
        firstMentionTimestamp: '03:18',
        segmentId: 'seg_001_6',
        contextSnippet: 'Service Control Policies enforcing hard tenancy isolation and blocking write privileges in production accounts.',
        confidence: 0.95,
        associatedControlOrClause: 'ISO 27001:2022 A.8.31 Separation of Dev/Prod',
        status: 'Extracted'
      },
      {
        id: 'ent_risk_bastion_timeout',
        name: 'Excessive Bastion Privilege Drift (48h Timeout)',
        type: 'Risk',
        mentionCount: 2,
        firstMentionTimestamp: '03:18',
        segmentId: 'seg_001_6',
        contextSnippet: 'Emergency troubleshooting bastion SSH keys maintained a 48-hour expiration instead of the mandated 4-hour max SLA.',
        confidence: 0.96,
        riskSeverity: 'HIGH',
        associatedControlOrClause: 'ISO 27001:2022 A.8.31 Separation of Dev/Prod',
        status: 'Mapped to Risk Register'
      },
      {
        id: 'ent_ctrl_iso_a831',
        name: 'ISO 27001:2022 Annex A.8.31',
        type: 'Control',
        mentionCount: 2,
        firstMentionTimestamp: '03:18',
        segmentId: 'seg_001_6',
        contextSnippet: 'Separation of development, testing, and production environments across network, IAM, and deployment pipelines.',
        confidence: 0.99,
        associatedControlOrClause: 'Annex A.8.31',
        status: 'Verified'
      },
      {
        id: 'ent_app_aws_ecr',
        name: 'AWS Elastic Container Registry (ECR)',
        type: 'Application',
        mentionCount: 1,
        firstMentionTimestamp: '04:42',
        segmentId: 'seg_001_8',
        contextSnippet: 'Immutable private container registry configured with immutable image tags and automated push scan triggers.',
        confidence: 0.97,
        associatedControlOrClause: 'ISO 27001:2022 A.8.28 Code Security',
        status: 'Extracted'
      },
      {
        id: 'ent_app_snyk',
        name: 'Snyk Container & SAST',
        type: 'Application',
        mentionCount: 2,
        firstMentionTimestamp: '04:42',
        segmentId: 'seg_001_8',
        contextSnippet: 'Automated vulnerability scanner blocking PR merges if CVSS score >= 7.0 or unpatched base vulnerabilities exist.',
        confidence: 0.99,
        associatedControlOrClause: 'ISO 27001:2022 A.8.28 Code Security',
        status: 'Mapped to Asset Inventory'
      },
      {
        id: 'ent_risk_cve_2026_4912',
        name: 'Unpatched Container Layer CVE-2026-4912',
        type: 'Risk',
        mentionCount: 1,
        firstMentionTimestamp: '04:42',
        segmentId: 'seg_001_8',
        contextSnippet: 'High-severity OpenSSL buffer overflow vulnerability identified in base Alpine container image requiring patch.',
        confidence: 0.98,
        riskSeverity: 'CRITICAL',
        associatedControlOrClause: 'ISO 27001:2022 A.8.8 Management of Technical Vulnerabilities',
        status: 'Mapped to Risk Register'
      },
      {
        id: 'ent_asset_customer_pii',
        name: 'Customer PII Database (AWS Aurora)',
        type: 'Asset',
        mentionCount: 2,
        firstMentionTimestamp: '06:05',
        segmentId: 'seg_001_10',
        contextSnippet: 'Primary database containing customer identity records, encrypted with KMS CMK and subjected to daily snapshots.',
        confidence: 0.99,
        associatedControlOrClause: 'ISO 27001:2022 A.8.11 & A.8.24',
        status: 'Mapped to Asset Inventory'
      },
      {
        id: 'ent_risk_unencrypted_s3',
        name: 'Unencrypted S3 Staging Bucket (ETL Migration)',
        type: 'Risk',
        mentionCount: 1,
        firstMentionTimestamp: '06:05',
        segmentId: 'seg_001_10',
        contextSnippet: 'Staging S3 bucket created for database migration lacked default KMS CMK bucket encryption policy.',
        confidence: 0.97,
        riskSeverity: 'HIGH',
        associatedControlOrClause: 'ISO 27001:2022 A.8.24 Cryptography',
        status: 'Mapped to Risk Register'
      },
      {
        id: 'ent_app_jira',
        name: 'Jira Service Desk',
        type: 'Application',
        mentionCount: 1,
        firstMentionTimestamp: '06:05',
        segmentId: 'seg_001_10',
        contextSnippet: 'Enterprise ticketing system used to log security risks, incident SLAs, and CAPA remediation tasks.',
        confidence: 0.95,
        associatedControlOrClause: 'ISO 27001:2022 A.5.15 Access Control',
        status: 'Extracted'
      },
      {
        id: 'ent_ctrl_mas_11_2',
        name: 'MAS TRM 11.2 Software Development',
        type: 'Control',
        mentionCount: 1,
        firstMentionTimestamp: '06:40',
        segmentId: 'seg_001_11',
        contextSnippet: 'Mandatory MAS regulatory requirements for secure coding standards, independent code reviews, and artifact validation.',
        confidence: 0.96,
        associatedControlOrClause: 'MAS TRM Notice 644 Clause 11.2',
        status: 'Verified'
      }
    ],
    initialSegments: [
      {
        id: 'seg_001_1',
        timestamp: '00:08',
        seconds: 8,
        speaker: 'Alexander Ward',
        speakerRole: 'Interviewer / Lead Auditor',
        text: 'Good morning Michael. We are conducting the formal ISO/IEC 27001:2022 Annex A.8.25 and A.8.31 operational controls walkthrough. Before we proceed, I would like to verify that you have reviewed the Clause 7.5 confidentiality terms and consent to automated AI audio transcription.',
        entityIds: []
      },
      {
        id: 'seg_001_2',
        timestamp: '00:32',
        seconds: 32,
        speaker: 'Michael Chen',
        speakerRole: 'Auditee / Stakeholder',
        text: 'Good morning Alexander. Yes, consent is formally recorded and timestamped in our portal. To start our architecture review, our core microservices are built via GitHub Enterprise and deployed through Terraform Cloud targeting our primary AWS Singapore Production VPC.',
        entityIds: ['ent_app_github', 'ent_app_terraform', 'ent_asset_aws_vpc']
      },
      {
        id: 'seg_001_3',
        timestamp: '01:15',
        seconds: 75,
        speaker: 'Alexander Ward',
        speakerRole: 'Interviewer / Lead Auditor',
        text: 'Excellent. Under Annex A.8.24 and A.8.31, how are production secrets, database credentials, and third-party API tokens isolated from development engineers?',
        entityIds: []
      },
      {
        id: 'seg_001_4',
        timestamp: '01:48',
        seconds: 108,
        speaker: 'Michael Chen',
        speakerRole: 'Auditee / Stakeholder',
        text: 'Developers have zero static production credentials. All microservice tokens are dynamically issued by HashiCorp Vault Enterprise and AWS Secrets Manager with KMS envelope encryption. Microservices connect to our Production PostgreSQL Cluster (RDS Aurora) and Redis Cache Cluster using short-lived STS tokens.',
        entityIds: ['ent_app_vault', 'ent_app_secrets_mgr', 'ent_asset_postgres_prod', 'ent_asset_redis_cluster']
      },
      {
        id: 'seg_001_5',
        timestamp: '02:40',
        seconds: 160,
        speaker: 'Alexander Ward',
        speakerRole: 'Interviewer / Lead Auditor',
        text: 'Under Annex A.8.31, how do you enforce separation between development and production environments, and how do you monitor for accidental access drift?',
        entityIds: []
      },
      {
        id: 'seg_001_6',
        timestamp: '03:18',
        seconds: 198,
        speaker: 'Michael Chen',
        speakerRole: 'Auditee / Stakeholder',
        text: 'We enforce AWS Organizations SCP Boundary policies that block any direct human console access. However, during our last quarterly vulnerability review, we identified an Excessive Bastion Privilege Drift (48h Timeout) where an emergency troubleshooting bastion host had session timeouts configured for 48 hours instead of 4 hours. We are updating the Terraform configuration under ISO 27001:2022 Annex A.8.31 to fix this.',
        entityIds: ['ent_asset_aws_scp', 'ent_risk_bastion_timeout', 'ent_ctrl_iso_a831']
      },
      {
        id: 'seg_001_7',
        timestamp: '04:05',
        seconds: 245,
        speaker: 'Alexander Ward',
        speakerRole: 'Interviewer / Lead Auditor',
        text: 'Let us examine container security and artifact signing. How do you ensure base container images do not contain critical unpatched vulnerabilities before shipping to production?',
        entityIds: []
      },
      {
        id: 'seg_001_8',
        timestamp: '04:42',
        seconds: 282,
        speaker: 'Michael Chen',
        speakerRole: 'Auditee / Stakeholder',
        text: 'Every Docker container image is pushed to AWS Elastic Container Registry (ECR) and automatically scanned using Snyk Container & SAST and Aqua Trivy. If any Critical CVE, such as Unpatched Container Layer CVE-2026-4912, is detected in the image layer, the GitHub Actions gate blocks deployment promotion immediately.',
        entityIds: ['ent_app_aws_ecr', 'ent_app_snyk', 'ent_risk_cve_2026_4912']
      },
      {
        id: 'seg_001_9',
        timestamp: '05:25',
        seconds: 325,
        speaker: 'Alexander Ward',
        speakerRole: 'Interviewer / Lead Auditor',
        text: 'How are production database backup snapshots secured, and what is your tested RTO for disaster recovery?',
        entityIds: []
      },
      {
        id: 'seg_001_10',
        timestamp: '06:05',
        seconds: 365,
        speaker: 'Michael Chen',
        speakerRole: 'Auditee / Stakeholder',
        text: 'Automated snapshots of our Customer PII Database (AWS Aurora) are replicated cross-region to Tokyo with RTO of 45 minutes. However, last week our scanner flagged an Unencrypted S3 Staging Bucket (ETL Migration) that lacked default SSE-KMS, currently tracked as RSK-OPS-2026-042 in Jira Service Desk.',
        entityIds: ['ent_asset_customer_pii', 'ent_risk_unencrypted_s3', 'ent_app_jira']
      },
      {
        id: 'seg_001_11',
        timestamp: '06:40',
        seconds: 400,
        speaker: 'Alexander Ward',
        speakerRole: 'Interviewer / Lead Auditor',
        text: 'Thank you Michael. I will log these findings and cross-reference them against your Annex A.8 and MAS TRM 11.2 Software Development requirements. The evidence provided conforms with ISO 19011 sampling criteria.',
        entityIds: ['ent_ctrl_mas_11_2']
      }
    ],
    queuedLiveStreamSegments: [
      {
        speaker: 'Michael Chen',
        speakerRole: 'Auditee / Stakeholder',
        text: 'In addition, our Datadog APM monitors all API endpoints for anomalous latency and error spikes, feeding security alerts into our PagerDuty Incident Response rotation.',
        extractedEntities: [
          {
            name: 'Datadog APM',
            type: 'Application',
            confidence: 0.98,
            contextSnippet: 'APM telemetry and synthetic monitors alerting on anomalous traffic surges.',
            associatedControlOrClause: 'ISO 27001:2022 A.8.16 Monitoring Activities'
          },
          {
            name: 'PagerDuty Incident Response',
            type: 'Application',
            confidence: 0.99,
            contextSnippet: '24/7 on-call escalation paging system integrated with Slack security channels.',
            associatedControlOrClause: 'ISO 27001:2022 A.5.24 Information Security Incident Management'
          },
          {
            name: 'Production API Gateway Endpoints',
            type: 'Asset',
            confidence: 0.97,
            contextSnippet: 'Kong Gateway ingress proxies handling public customer TLS termination.',
            associatedControlOrClause: 'ISO 27001:2022 A.8.20 Network Security'
          }
        ]
      },
      {
        speaker: 'Alexander Ward',
        speakerRole: 'Interviewer / Lead Auditor',
        text: 'Does your DevOps team perform automated configuration drift monitoring for cloud infrastructure?',
        extractedEntities: []
      },
      {
        speaker: 'Michael Chen',
        speakerRole: 'Auditee / Stakeholder',
        text: 'Yes, we run AWS Config and Prisma Cloud CSPM to detect unauthorized security group changes. Last month we caught a Public Elastic IP Allocation Drift on a dev bastion and revoked it within 12 minutes.',
        extractedEntities: [
          {
            name: 'AWS Config',
            type: 'Application',
            confidence: 0.98,
            contextSnippet: 'Automated compliance rule evaluations running on all CloudTrail resource events.',
            associatedControlOrClause: 'ISO 27001:2022 A.8.9 Configuration Management'
          },
          {
            name: 'Prisma Cloud CSPM',
            type: 'Application',
            confidence: 0.97,
            contextSnippet: 'Cloud Security Posture Management engine evaluating CIS AWS Foundations Benchmark.',
            associatedControlOrClause: 'ISO 27001:2022 A.8.8 Management of Technical Vulnerabilities'
          },
          {
            name: 'Public Elastic IP Allocation Drift',
            type: 'Risk',
            confidence: 0.96,
            riskSeverity: 'MEDIUM',
            contextSnippet: 'Transient public IPv4 address assigned to non-DMZ subnet, creating exposure window.',
            associatedControlOrClause: 'ISO 27001:2022 A.8.20 Network Security'
          }
        ]
      },
      {
        speaker: 'Alexander Ward',
        speakerRole: 'Interviewer / Lead Auditor',
        text: 'Thank you Michael. I am marking this control walkthrough as Conforming with 2 tracked remediation actions in the CAPA register.',
        extractedEntities: [
          {
            name: 'ISO 27001 Clause 8.1 Operational Planning',
            type: 'Control',
            confidence: 0.99,
            contextSnippet: 'Operational control planning and evidence verification signed off.',
            associatedControlOrClause: 'Clause 8.1'
          }
        ]
      }
    ]
  },
  mtg_004: {
    meetingId: 'mtg_004',
    meetingCode: 'MTG-ISO-2026-004',
    initialEntities: [
      {
        id: 'ent_app_databricks',
        name: 'Databricks ML Platform',
        type: 'Application',
        mentionCount: 2,
        firstMentionTimestamp: '00:40',
        segmentId: 'seg_004_2',
        contextSnippet: 'Core AI training and feature store platform hosting foundation model fine-tuning runs.',
        confidence: 0.99,
        associatedControlOrClause: 'ISO 42001:2023 A.8.2 AI System Lifecycle',
        status: 'Mapped to Asset Inventory'
      },
      {
        id: 'ent_asset_pinecone',
        name: 'Pinecone Enterprise Vector DB',
        type: 'Asset',
        mentionCount: 2,
        firstMentionTimestamp: '00:40',
        segmentId: 'seg_004_2',
        contextSnippet: 'Vector database storing enterprise embeddings with namespace-level tenant isolation.',
        confidence: 0.98,
        associatedControlOrClause: 'ISO 42001:2023 A.9.2 Data Quality for Training',
        status: 'Mapped to Asset Inventory'
      },
      {
        id: 'ent_risk_prompt_injection',
        name: 'Indirect Prompt Injection Vulnerability',
        type: 'Risk',
        mentionCount: 2,
        firstMentionTimestamp: '01:50',
        segmentId: 'seg_004_4',
        contextSnippet: 'Untrusted user input in uploaded PDF contracts could hijack LLM summarizer context.',
        confidence: 0.98,
        riskSeverity: 'CRITICAL',
        associatedControlOrClause: 'ISO 42001:2023 A.6.2 AI System Impact Assessment',
        status: 'Mapped to Risk Register'
      },
      {
        id: 'ent_app_langsmith',
        name: 'LangSmith LLM Observability',
        type: 'Application',
        mentionCount: 1,
        firstMentionTimestamp: '02:30',
        segmentId: 'seg_004_5',
        contextSnippet: 'Real-time trace evaluation and toxicity scoring on LLM generation outputs.',
        confidence: 0.97,
        associatedControlOrClause: 'ISO 42001:2023 A.10.3 Human Oversight',
        status: 'Extracted'
      },
      {
        id: 'ent_ctrl_iso42_a62',
        name: 'ISO 42001 Annex A.6.2 AI Impact Assessment',
        type: 'Control',
        mentionCount: 2,
        firstMentionTimestamp: '01:50',
        segmentId: 'seg_004_4',
        contextSnippet: 'Mandatory documentation of potential societal, organizational, and fairness impacts of AI systems.',
        confidence: 0.99,
        associatedControlOrClause: 'A.6.2',
        status: 'Verified'
      }
    ],
    initialSegments: [
      {
        id: 'seg_004_1',
        timestamp: '00:10',
        seconds: 10,
        speaker: 'Alexander Ward',
        speakerRole: 'Interviewer / Lead Auditor',
        text: 'Good morning Dr. Rostova. Today we are conducting the ISO/IEC 42001:2023 AIMS Scoping & AI Risk Discovery session for machine learning systems.',
        entityIds: []
      },
      {
        id: 'seg_004_2',
        timestamp: '00:40',
        seconds: 40,
        speaker: 'Dr. Elena Rostova',
        speakerRole: 'Auditee / Stakeholder',
        text: 'Welcome Alexander. Our AI systems operate primarily on Databricks ML Platform and ingest embeddings into our Pinecone Enterprise Vector DB for RAG semantic search.',
        entityIds: ['ent_app_databricks', 'ent_asset_pinecone']
      },
      {
        id: 'seg_004_3',
        timestamp: '01:15',
        seconds: 75,
        speaker: 'Alexander Ward',
        speakerRole: 'Interviewer / Lead Auditor',
        text: 'What major AI risks have you uncovered during algorithmic impact evaluations under ISO 42001 Clause 6.1.2?',
        entityIds: []
      },
      {
        id: 'seg_004_4',
        timestamp: '01:50',
        seconds: 110,
        speaker: 'Dr. Elena Rostova',
        speakerRole: 'Auditee / Stakeholder',
        text: 'Our highest rated threat is Indirect Prompt Injection Vulnerability in user-uploaded documents, which we have evaluated under ISO 42001 Annex A.6.2 AI Impact Assessment with automated guardrails.',
        entityIds: ['ent_risk_prompt_injection', 'ent_ctrl_iso42_a62']
      },
      {
        id: 'seg_004_5',
        timestamp: '02:30',
        seconds: 150,
        speaker: 'Dr. Elena Rostova',
        speakerRole: 'Auditee / Stakeholder',
        text: 'We route all responses through LangSmith LLM Observability to compute toxicity, hallucination rates, and prevent data leakage before returning answers to the user.',
        entityIds: ['ent_app_langsmith']
      }
    ],
    queuedLiveStreamSegments: [
      {
        speaker: 'Alexander Ward',
        speakerRole: 'Interviewer / Lead Auditor',
        text: 'How do you verify provenance and copyright clearance for third-party foundation models?',
        extractedEntities: []
      },
      {
        speaker: 'Dr. Elena Rostova',
        speakerRole: 'Auditee / Stakeholder',
        text: 'We maintain model provenance manifests in Hugging Face Enterprise and enforce automated license checks against our internal AI Ethics Policy.',
        extractedEntities: [
          {
            name: 'Hugging Face Enterprise Hub',
            type: 'Application',
            confidence: 0.98,
            contextSnippet: 'Curated model registry tracking SHA-256 weight hashes and training datasheets.',
            associatedControlOrClause: 'ISO 42001:2023 A.7.2 AI System Resources'
          },
          {
            name: 'AI Model Weight Lineage Manifest',
            type: 'Asset',
            confidence: 0.97,
            contextSnippet: 'Cryptographically signed audit manifest verifying baseline weights.',
            associatedControlOrClause: 'ISO 42001:2023 A.8.4 Data Lineage'
          }
        ]
      }
    ]
  }
};

// Heuristic keyword / regex entity extractor for any custom speech or ad-hoc transcripts
export function extractEntitiesFromTranscriptText(
  text: string,
  segmentId: string,
  timestamp: string
): TranscriptEntity[] {
  const extracted: TranscriptEntity[] = [];

  const patterns: Array<{
    regex: RegExp;
    nameExtractor: (match: RegExpMatchArray) => string;
    type: IdentifiedEntityType;
    associatedControlOrClause?: string;
    riskSeverity?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  }> = [
    // Applications
    { regex: /\b(github(?:\s+enterprise)?)\b/i, nameExtractor: () => 'GitHub Enterprise', type: 'Application', associatedControlOrClause: 'ISO 27001 A.8.25' },
    { regex: /\b(terraform(?:\s+cloud)?)\b/i, nameExtractor: () => 'Terraform Cloud', type: 'Application', associatedControlOrClause: 'ISO 27001 A.8.31' },
    { regex: /\b(hashicorp\s+vault|vault\s+enterprise)\b/i, nameExtractor: () => 'HashiCorp Vault Enterprise', type: 'Application', associatedControlOrClause: 'ISO 27001 A.8.24' },
    { regex: /\b(aws\s+secrets\s+manager)\b/i, nameExtractor: () => 'AWS Secrets Manager', type: 'Application', associatedControlOrClause: 'ISO 27001 A.8.24' },
    { regex: /\b(datadog(?:\s+apm)?)\b/i, nameExtractor: () => 'Datadog APM', type: 'Application', associatedControlOrClause: 'ISO 27001 A.8.16' },
    { regex: /\b(snyk(?:\s+container)?)\b/i, nameExtractor: () => 'Snyk Container & SAST', type: 'Application', associatedControlOrClause: 'ISO 27001 A.8.28' },
    { regex: /\b(jira(?:\s+service\s+desk)?)\b/i, nameExtractor: () => 'Jira Service Desk', type: 'Application', associatedControlOrClause: 'ISO 27001 A.5.15' },
    { regex: /\b(okta(?:\s+identity)?)\b/i, nameExtractor: () => 'Okta Identity Cloud', type: 'Application', associatedControlOrClause: 'ISO 27001 A.5.15' },
    { regex: /\b(knowbe4)\b/i, nameExtractor: () => 'KnowBe4 Security LMS', type: 'Application', associatedControlOrClause: 'ISO 27001 A.6.3' },
    { regex: /\b(workday(?:\s+hris)?)\b/i, nameExtractor: () => 'Workday HRIS', type: 'Application', associatedControlOrClause: 'ISO 27001 A.6.1' },
    { regex: /\b(databricks(?:\s+ml)?)\b/i, nameExtractor: () => 'Databricks ML Platform', type: 'Application', associatedControlOrClause: 'ISO 42001 A.8.2' },
    { regex: /\b(langsmith)\b/i, nameExtractor: () => 'LangSmith LLM Observability', type: 'Application', associatedControlOrClause: 'ISO 42001 A.10.3' },
    { regex: /\b(pagerduty)\b/i, nameExtractor: () => 'PagerDuty Incident Response', type: 'Application', associatedControlOrClause: 'ISO 27001 A.5.24' },
    { regex: /\b(prisma\s+cloud)\b/i, nameExtractor: () => 'Prisma Cloud CSPM', type: 'Application', associatedControlOrClause: 'ISO 27001 A.8.8' },
    { regex: /\b(aws\s+config)\b/i, nameExtractor: () => 'AWS Config', type: 'Application', associatedControlOrClause: 'ISO 27001 A.8.9' },
    { regex: /\b(aws\s+ecr|elastic\s+container\s+registry)\b/i, nameExtractor: () => 'AWS Elastic Container Registry (ECR)', type: 'Application', associatedControlOrClause: 'ISO 27001 A.8.28' },

    // Assets
    { regex: /\b(aws(?:\s+singapore)?\s+production\s+vpc|production\s+vpc)\b/i, nameExtractor: () => 'AWS Singapore Production VPC', type: 'Asset', associatedControlOrClause: 'ISO 27001 A.8.20' },
    { regex: /\b(production\s+postgresql(?:\s+cluster)?|rds\s+aurora)\b/i, nameExtractor: () => 'Production PostgreSQL Cluster (RDS Aurora)', type: 'Asset', associatedControlOrClause: 'ISO 27001 A.8.10' },
    { regex: /\b(redis(?:\s+cache)?(?:\s+cluster)?)\b/i, nameExtractor: () => 'Redis Cache Cluster', type: 'Asset', associatedControlOrClause: 'ISO 27001 A.8.24' },
    { regex: /\b(customer\s+pii\s+database)\b/i, nameExtractor: () => 'Customer PII Database (AWS Aurora)', type: 'Asset', associatedControlOrClause: 'ISO 27001 A.8.11' },
    { regex: /\b(pinecone(?:\s+vector\s+db)?)\b/i, nameExtractor: () => 'Pinecone Enterprise Vector DB', type: 'Asset', associatedControlOrClause: 'ISO 42001 A.9.2' },
    { regex: /\b(aws\s+organizations\s+scp)\b/i, nameExtractor: () => 'AWS Organizations SCP Boundary', type: 'Asset', associatedControlOrClause: 'ISO 27001 A.8.31' },
    { regex: /\b(api\s+gateway\s+endpoints?)\b/i, nameExtractor: () => 'Production API Gateway Endpoints', type: 'Asset', associatedControlOrClause: 'ISO 27001 A.8.20' },

    // Risks
    { regex: /\b(excessive\s+bastion\s+privilege\s+drift|bastion\s+timeout)\b/i, nameExtractor: () => 'Excessive Bastion Privilege Drift (48h Timeout)', type: 'Risk', riskSeverity: 'HIGH', associatedControlOrClause: 'ISO 27001 A.8.31' },
    { regex: /\b(unencrypted\s+s3(?:\s+staging)?\s+bucket)\b/i, nameExtractor: () => 'Unencrypted S3 Staging Bucket (ETL Migration)', type: 'Risk', riskSeverity: 'HIGH', associatedControlOrClause: 'ISO 27001 A.8.24' },
    { regex: /\b(cve-[\d-]+|unpatched\s+container\s+layer)\b/i, nameExtractor: (m) => `Unpatched Vulnerability (${m[0].toUpperCase()})`, type: 'Risk', riskSeverity: 'CRITICAL', associatedControlOrClause: 'ISO 27001 A.8.8' },
    { regex: /\b(indirect\s+prompt\s+injection|prompt\s+injection)\b/i, nameExtractor: () => 'Indirect Prompt Injection Vulnerability', type: 'Risk', riskSeverity: 'CRITICAL', associatedControlOrClause: 'ISO 42001 A.6.2' },
    { regex: /\b(public\s+elastic\s+ip\s+allocation|public\s+ip\s+drift)\b/i, nameExtractor: () => 'Public Elastic IP Allocation Drift', type: 'Risk', riskSeverity: 'MEDIUM', associatedControlOrClause: 'ISO 27001 A.8.20' },
    { regex: /\b(deprovisioning\s+sla\s+delay|stale\s+credentials?)\b/i, nameExtractor: () => 'Deprovisioning SLA Delay Risk', type: 'Risk', riskSeverity: 'HIGH', associatedControlOrClause: 'ISO 27001 A.6.5' },

    // Controls
    { regex: /\b(iso\s*27001(?::2022)?\s+annex\s+a\.8\.31|annex\s+a\.8\.31)\b/i, nameExtractor: () => 'ISO 27001:2022 Annex A.8.31 Separation of Dev/Prod', type: 'Control', associatedControlOrClause: 'Annex A.8.31' },
    { regex: /\b(iso\s*27001(?::2022)?\s+annex\s+a\.8\.25|annex\s+a\.8\.25)\b/i, nameExtractor: () => 'ISO 27001:2022 Annex A.8.25 Secure Coding', type: 'Control', associatedControlOrClause: 'Annex A.8.25' },
    { regex: /\b(iso\s*27001(?::2022)?\s+annex\s+a\.8\.24|annex\s+a\.8\.24)\b/i, nameExtractor: () => 'ISO 27001:2022 Annex A.8.24 Cryptography', type: 'Control', associatedControlOrClause: 'Annex A.8.24' },
    { regex: /\b(mas\s+trm\s+11\.2|mas\s+notice\s+644)\b/i, nameExtractor: () => 'MAS TRM 11.2 Software Development', type: 'Control', associatedControlOrClause: 'MAS TRM 11.2' },
    { regex: /\b(iso\s*42001(?::2023)?\s+annex\s+a\.6\.2|annex\s+a\.6\.2)\b/i, nameExtractor: () => 'ISO 42001 Annex A.6.2 AI Impact Assessment', type: 'Control', associatedControlOrClause: 'Annex A.6.2' },
    { regex: /\b(iso\s*27001\s+clause\s+8\.1|clause\s+8\.1)\b/i, nameExtractor: () => 'ISO 27001 Clause 8.1 Operational Planning', type: 'Control', associatedControlOrClause: 'Clause 8.1' }
  ];

  patterns.forEach((pat, idx) => {
    const match = text.match(pat.regex);
    if (match) {
      const name = pat.nameExtractor(match);
      // Avoid duplicate names in same extraction
      if (!extracted.some(e => e.name.toLowerCase() === name.toLowerCase())) {
        extracted.push({
          id: `ent_dyn_${Date.now()}_${idx}`,
          name,
          type: pat.type,
          mentionCount: 1,
          firstMentionTimestamp: timestamp,
          segmentId,
          contextSnippet: text.length > 130 ? text.slice(0, 130) + '...' : text,
          confidence: 0.96 + Math.round(Math.random() * 3) / 100,
          associatedControlOrClause: pat.associatedControlOrClause,
          riskSeverity: pat.riskSeverity,
          status: pat.type === 'Risk' ? 'Mapped to Risk Register' : pat.type === 'Asset' ? 'Mapped to Asset Inventory' : 'Extracted'
        });
      }
    }
  });

  return extracted;
}
