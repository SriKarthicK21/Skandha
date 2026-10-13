// ============================================================================
// Skanda Continuous Controls Monitoring (CCM) & Automated Drift Engine Service
// ============================================================================

export type ControlComplianceStatus = 
  | 'CONFORMING' 
  | 'DRIFT_DETECTED' 
  | 'GRACE_PERIOD' 
  | 'NON_CONFORMITY_TRIGGERED' 
  | 'REMEDIATED';

export interface MonitoredControl {
  id: string;
  controlCode: string;
  title: string;
  standard: 'ISO 27001' | 'MAS TRM' | 'SOC 2';
  domain: string;
  provider: 'AWS' | 'GitHub' | 'Okta' | 'CrowdStrike' | 'Cloudflare' | 'Datadog';
  status: ControlComplianceStatus;
  statusMessage: string;
  lastEvaluatedAt: string;
  driftStartedAt?: string;
  gracePeriodMinutes: number;
  gracePeriodExpiresAt?: string;
  assignedOwner: string;
  remediationActionKey: string;
  remediationActionLabel: string;
  targetResource: string;
  autoCapaFindingId?: string;
  consecutivePassCount: number;
}

export interface DriftTimelineEntry {
  id: string;
  controlCode: string;
  controlTitle: string;
  driftStartedAt: string;
  remediatedAt?: string;
  durationMinutes?: number;
  triggerSource: string;
  triggerEvent: string;
  remediationType: 'AUTOMATED_SELF_HEALING' | 'MANUAL_DISPATCH' | 'AUTO_CAPA_ESCALATION';
  remediationSummary: string;
  remediatedBy: string;
  proofHash: string;
  status: 'RESOLVED' | 'ACTIVE_DRIFT' | 'CAPA_ESCALATED';
}

export type TelemetryHealthBadge = 'FRESH' | 'STALE' | 'DEAD';

export interface ProviderFreshnessSla {
  id: string;
  provider: string;
  category: string;
  telemetryType: string;
  slaIntervalHours: number;
  lastHeartbeat: string;
  elapsedMinutes: number;
  healthBadge: TelemetryHealthBadge;
  status: 'FRESH' | 'STALE_WARNING' | 'HEARTBEAT_DEAD';
  uptimePercent30d: number;
  totalSamplesCollected: number;
  auditStandardRef: string;
  lastProbeLatencyMs?: number;
}

export interface DecayingEvidenceRecord {
  id: string;
  title: string;
  controlCode: string;
  provider: string;
  harvestedDate: string;
  retentionWindowDays: number;
  daysRemaining: number;
  healthBadge: TelemetryHealthBadge;
  status: 'VALID' | 'DECAY_WARNING' | 'DEPRECIATED';
  decayActionRequired: string;
  proofHash?: string;
  fileFormat?: string;
  auditorVerificationProcedure?: string;
}

export function computeProviderHealthBadge(elapsedMinutes: number, slaIntervalHours: number): TelemetryHealthBadge {
  const slaMinutes = slaIntervalHours * 60;
  if (elapsedMinutes <= slaMinutes) return 'FRESH';
  if (elapsedMinutes <= slaMinutes * 2.5) return 'STALE';
  return 'DEAD';
}

export function computeEvidenceHealthBadge(daysRemaining: number): TelemetryHealthBadge {
  if (daysRemaining > 30) return 'FRESH';
  if (daysRemaining > 0) return 'STALE';
  return 'DEAD';
}

export interface CryptoLedgerBlock {
  blockHeight: number;
  prevBlockHash: string;
  eventHash: string;
  merkleRoot: string;
  timestamp: string;
  eventId: string;
  source: string;
  eventType: string;
  signature: string;
  auditSeal: string;
}

export interface CorrelatedIncident {
  incidentId: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  confidence: 'HIGH' | 'MEDIUM';
  mitreTactics: string[];
  mitreTechniques: string[];
  sourcesInvolved: string[];
  eventsLinkedCount: number;
  killChainNarrative: string;
  riskDelta: number;
  rootCauseSummary: string;
  auditorDefenseNote: string;
  recommendedMitigation: string;
}

export interface DeduplicatedCluster {
  clusterId: string;
  representativeEvent: string;
  totalMergedCount: number;
  sources: string[];
  noiseReductionPct: number;
  complianceAssertion: string;
}

// Initial Monitored Controls Baseline
export const INITIAL_MONITORED_CONTROLS: MonitoredControl[] = [
  {
    id: 'ctrl-mon-01',
    controlCode: 'A.5.15',
    title: 'S3 Bucket Public Access Block & Object Permissions',
    standard: 'ISO 27001',
    domain: 'Access Control',
    provider: 'AWS',
    status: 'DRIFT_DETECTED',
    statusMessage: 'Bucket "apex-financial-transcripts-prod" ACL updated to AllUsers:READ. Public access block disabled.',
    lastEvaluatedAt: new Date(Date.now() - 15 * 60000).toISOString(),
    driftStartedAt: new Date(Date.now() - 15 * 60000).toISOString(),
    gracePeriodMinutes: 120,
    gracePeriodExpiresAt: new Date(Date.now() + 105 * 60000).toISOString(),
    assignedOwner: 'Cloud Infrastructure SecOps (Sarah Chen)',
    remediationActionKey: 'ACTION_ROLLBACK_S3_PERMISSIONS',
    remediationActionLabel: 'Revert S3 Public Access & Apply OAC Policy',
    targetResource: 'apex-financial-transcripts-prod',
    consecutivePassCount: 142
  },
  {
    id: 'ctrl-mon-02',
    controlCode: 'MAS-10.1',
    title: 'Privileged Access Multi-Factor Authentication Enforcement',
    standard: 'MAS TRM',
    domain: 'Identity & Access Control (Notice 644)',
    provider: 'Okta',
    status: 'DRIFT_DETECTED',
    statusMessage: 'WebAuthn factor removed from privileged admin account: root-admin@acme.com',
    lastEvaluatedAt: new Date(Date.now() - 32 * 60000).toISOString(),
    driftStartedAt: new Date(Date.now() - 32 * 60000).toISOString(),
    gracePeriodMinutes: 60,
    gracePeriodExpiresAt: new Date(Date.now() + 28 * 60000).toISOString(),
    assignedOwner: 'IAM Security Operations (Rajesh Patel)',
    remediationActionKey: 'ACTION_RE_ENFORCE_MFA',
    remediationActionLabel: 'Re-enforce FIDO2 Factor & Terminate Active Sessions',
    targetResource: 'root-admin@acme.com',
    consecutivePassCount: 380
  },
  {
    id: 'ctrl-mon-03',
    controlCode: 'A.8.8',
    title: 'Vulnerability Remediation & High CVSS Containment SLA',
    standard: 'ISO 27001',
    domain: 'Technological Controls',
    provider: 'CrowdStrike',
    status: 'CONFORMING',
    statusMessage: 'Zero uncontained Critical CVSS > 9.0 vulnerabilities across container fleet.',
    lastEvaluatedAt: new Date(Date.now() - 4 * 60000).toISOString(),
    gracePeriodMinutes: 1440,
    assignedOwner: 'Application Security Lead (Alex Wong)',
    remediationActionKey: 'ACTION_QUARANTINE_EC2',
    remediationActionLabel: 'Network Quarantine Host & Trigger Forensics',
    targetResource: 'host-pgw-02',
    consecutivePassCount: 890
  },
  {
    id: 'ctrl-mon-04',
    controlCode: 'A.8.28',
    title: 'CI/CD Branch Protection & Dual Approval Gate',
    standard: 'ISO 27001',
    domain: 'Secure Coding & Development',
    provider: 'GitHub',
    status: 'CONFORMING',
    statusMessage: 'Branch rules active: 2 required reviews, signed commits enforced on main.',
    lastEvaluatedAt: new Date(Date.now() - 12 * 60000).toISOString(),
    gracePeriodMinutes: 240,
    assignedOwner: 'DevSecOps Lead (Elena Rostova)',
    remediationActionKey: 'ACTION_MERGE_BRANCH_PROTECTION',
    remediationActionLabel: 'Enforce Mandatory Branch Protection Rules',
    targetResource: 'phoenix-banking-core/main',
    consecutivePassCount: 1240
  },
  {
    id: 'ctrl-mon-05',
    controlCode: 'A.8.20',
    title: 'Network Security Perimeter & Ingress Port Lockdown',
    standard: 'ISO 27001',
    domain: 'Network Security',
    provider: 'Cloudflare',
    status: 'CONFORMING',
    statusMessage: 'Edge WAF actively filtering; 0 unmanaged open administrative ports (22/3389).',
    lastEvaluatedAt: new Date(Date.now() - 2 * 60000).toISOString(),
    gracePeriodMinutes: 60,
    assignedOwner: 'Network Security Engineering (David Kim)',
    remediationActionKey: 'ACTION_REVOKE_UNAUTHORIZED_INGRESS',
    remediationActionLabel: 'Revoke Ingress Security Group & Block IP Range',
    targetResource: 'sg-public-ingress-alb',
    consecutivePassCount: 2190
  },
  {
    id: 'ctrl-mon-06',
    controlCode: 'A.8.24',
    title: 'KMS Key Cryptographic Auto-Rotation (365-Day Cycle)',
    standard: 'ISO 27001',
    domain: 'Cryptography',
    provider: 'AWS',
    status: 'CONFORMING',
    statusMessage: 'All customer master keys (CMKs) scheduled for annual rotation.',
    lastEvaluatedAt: new Date(Date.now() - 80 * 60000).toISOString(),
    gracePeriodMinutes: 10080,
    assignedOwner: 'Cloud Cryptography Lead (Marcus Vance)',
    remediationActionKey: 'ACTION_ROTATE_COMPROMISED_CREDENTIAL',
    remediationActionLabel: 'Rotate KMS Key & Re-encrypt Data Keys',
    targetResource: 'arn:aws:kms:ap-southeast-1:cmk-banking-core',
    consecutivePassCount: 450
  }
];

// Initial Drift Timeline Log
export const INITIAL_DRIFT_TIMELINE: DriftTimelineEntry[] = [
  {
    id: 'dt-entry-01',
    controlCode: 'A.5.15',
    controlTitle: 'S3 Bucket Public Access Block',
    driftStartedAt: new Date(Date.now() - 15 * 60000).toISOString(),
    triggerSource: 'AWS CloudTrail',
    triggerEvent: 's3:PutBucketAcl:PublicReadGranted',
    remediationType: 'MANUAL_DISPATCH',
    remediationSummary: 'Pending self-healing dispatch or grace period expiration.',
    remediatedBy: 'Awaiting Operator Approval',
    proofHash: '0x8f2c...4a19',
    status: 'ACTIVE_DRIFT'
  },
  {
    id: 'dt-entry-02',
    controlCode: 'MAS-10.1',
    controlTitle: 'Privileged Access Multi-Factor Authentication',
    driftStartedAt: new Date(Date.now() - 32 * 60000).toISOString(),
    triggerSource: 'Okta Identity Cloud',
    triggerEvent: 'user.mfa.factor.deactivate',
    remediationType: 'AUTO_CAPA_ESCALATION',
    remediationSummary: 'Grace period countdown running. Auto-CAPA finding queued for creation.',
    remediatedBy: 'CCM Grace Period Watchdog',
    proofHash: '0x3c99...e271',
    status: 'ACTIVE_DRIFT'
  },
  {
    id: 'dt-entry-03',
    controlCode: 'A.8.20',
    controlTitle: 'Network Security Perimeter',
    driftStartedAt: new Date(Date.now() - 180 * 60000).toISOString(),
    remediatedAt: new Date(Date.now() - 176 * 60000).toISOString(),
    durationMinutes: 4,
    triggerSource: 'AWS GuardDuty',
    triggerEvent: 'Recon:EC2/PortscanDetected',
    remediationType: 'AUTOMATED_SELF_HEALING',
    remediationSummary: 'Cloudflare WAF dynamically blacklisted attacker ASN and closed staging SG rule.',
    remediatedBy: 'Skanda Self-Healing Engine (Auto-Remediated)',
    proofHash: '0x99a1...10b4',
    status: 'RESOLVED'
  },
  {
    id: 'dt-entry-04',
    controlCode: 'A.8.28',
    controlTitle: 'CI/CD Branch Protection',
    driftStartedAt: new Date(Date.now() - 720 * 60000).toISOString(),
    remediatedAt: new Date(Date.now() - 712 * 60000).toISOString(),
    durationMinutes: 8,
    triggerSource: 'GitHub Webhook',
    triggerEvent: 'branch_protection_rule.deleted',
    remediationType: 'AUTOMATED_SELF_HEALING',
    remediationSummary: 'GitHub API REST call reapplied required code reviews and signed commit enforcement.',
    remediatedBy: 'DevSecOps Self-Healing Webhook',
    proofHash: '0x14d0...bc78',
    status: 'RESOLVED'
  }
];

// Initial Heartbeat SLA Matrix
export const INITIAL_FRESHNESS_SLAS: ProviderFreshnessSla[] = [
  {
    id: 'sla-guardduty',
    provider: 'AWS GuardDuty',
    category: 'Cloud Threat Detection',
    telemetryType: 'Real-time DNS & API Probes',
    slaIntervalHours: 1,
    lastHeartbeat: new Date(Date.now() - 18 * 60000).toISOString(),
    elapsedMinutes: 18,
    healthBadge: 'FRESH',
    status: 'FRESH',
    uptimePercent30d: 99.98,
    totalSamplesCollected: 720,
    lastProbeLatencyMs: 24,
    auditStandardRef: 'ISO 27001 A.8.16 & MAS TRM Sec 13.0'
  },
  {
    id: 'sla-crowdstrike',
    provider: 'CrowdStrike Falcon',
    category: 'Endpoint Detection & Response (EDR)',
    telemetryType: 'Host Agent Status & Vulnerability Probes',
    slaIntervalHours: 4,
    lastHeartbeat: new Date(Date.now() - 45 * 60000).toISOString(),
    elapsedMinutes: 45,
    healthBadge: 'FRESH',
    status: 'FRESH',
    uptimePercent30d: 99.95,
    totalSamplesCollected: 180,
    lastProbeLatencyMs: 38,
    auditStandardRef: 'ISO 27001 A.8.8 & MAS Notice 644'
  },
  {
    id: 'sla-okta',
    provider: 'Okta Identity Cloud',
    category: 'Identity Provider & SCIM',
    telemetryType: 'MFA & Session State Audit Stream',
    slaIntervalHours: 6,
    lastHeartbeat: new Date(Date.now() - 140 * 60000).toISOString(),
    elapsedMinutes: 140,
    healthBadge: 'FRESH',
    status: 'FRESH',
    uptimePercent30d: 99.99,
    totalSamplesCollected: 120,
    lastProbeLatencyMs: 19,
    auditStandardRef: 'ISO 27001 A.5.15 & MAS TRM Sec 10.1'
  },
  {
    id: 'sla-github',
    provider: 'GitHub Actions / CodeQL',
    category: 'CI/CD & Source Code Security',
    telemetryType: 'Pull Request Gates & SAST Webhooks',
    slaIntervalHours: 24,
    lastHeartbeat: new Date(Date.now() - 65 * 60000).toISOString(),
    elapsedMinutes: 65,
    healthBadge: 'FRESH',
    status: 'FRESH',
    uptimePercent30d: 100.0,
    totalSamplesCollected: 48,
    lastProbeLatencyMs: 42,
    auditStandardRef: 'ISO 27001 A.8.28 & MAS TRM Sec 8.3'
  },
  {
    id: 'sla-cloudflare',
    provider: 'Cloudflare Edge WAF',
    category: 'Perimeter DDoS & Bot Management',
    telemetryType: 'Firewall Analytics & Log Push',
    slaIntervalHours: 2,
    lastHeartbeat: new Date(Date.now() - 185 * 60000).toISOString(), // 3 hours ago -> SLA is 2 hours (STALE)
    elapsedMinutes: 185,
    healthBadge: 'STALE',
    status: 'STALE_WARNING',
    uptimePercent30d: 98.40,
    totalSamplesCollected: 360,
    lastProbeLatencyMs: 140,
    auditStandardRef: 'ISO 27001 A.8.20 & MAS TRM Sec 9.0'
  },
  {
    id: 'sla-vault',
    provider: 'HashiCorp Vault Enterprise',
    category: 'Secrets & PKI Engine',
    telemetryType: 'Token Lease Renewal & Secret Access Log',
    slaIntervalHours: 8,
    lastHeartbeat: new Date(Date.now() - 680 * 60000).toISOString(), // 11 hours ago -> SLA is 8 hours (STALE)
    elapsedMinutes: 680,
    healthBadge: 'STALE',
    status: 'STALE_WARNING',
    uptimePercent30d: 97.90,
    totalSamplesCollected: 90,
    lastProbeLatencyMs: 210,
    auditStandardRef: 'ISO 27001 A.8.24 & MAS TRM Sec 11.2'
  },
  {
    id: 'sla-datadog',
    provider: 'Datadog SIEM & Ingress',
    category: 'Kubernetes Ingress Log Collector',
    telemetryType: 'HTTP 4xx/5xx Edge Anomaly Stream',
    slaIntervalHours: 2,
    lastHeartbeat: new Date(Date.now() - 1480 * 60000).toISOString(), // 24 hours ago -> SLA is 2 hours (DEAD)
    elapsedMinutes: 1480,
    healthBadge: 'DEAD',
    status: 'HEARTBEAT_DEAD',
    uptimePercent30d: 91.20,
    totalSamplesCollected: 24,
    lastProbeLatencyMs: 0,
    auditStandardRef: 'ISO 27001 A.8.16 & MAS TRM Sec 13.0'
  },
  {
    id: 'sla-kms',
    provider: 'AWS Key Management Service',
    category: 'Cryptographic Key Infrastructure',
    telemetryType: 'Key Rotation & HSM Audit Trail',
    slaIntervalHours: 168, // 7 days
    lastHeartbeat: new Date(Date.now() - 80 * 60000).toISOString(),
    elapsedMinutes: 80,
    healthBadge: 'FRESH',
    status: 'FRESH',
    uptimePercent30d: 100.0,
    totalSamplesCollected: 12,
    lastProbeLatencyMs: 28,
    auditStandardRef: 'ISO 27001 A.8.24 & MAS TRM Sec 11.0'
  }
];

// Evidence Decay Initial Records
export const INITIAL_DECAYING_EVIDENCE: DecayingEvidenceRecord[] = [
  {
    id: 'dec-ev-01',
    title: 'Quarterly External Vulnerability & Penetration Test Report',
    controlCode: 'A.8.8',
    provider: 'CrowdStrike / Mandiant',
    harvestedDate: new Date(Date.now() - 78 * 86400000).toISOString(),
    retentionWindowDays: 90,
    daysRemaining: 12,
    healthBadge: 'STALE',
    status: 'DECAY_WARNING',
    decayActionRequired: 'Evidence aging past 78 days. Trigger Q2 automated red-team test before 12-day decay deadline.',
    proofHash: '0x7e8b91c4d284...a9f1',
    fileFormat: 'PDF Signed Report (SHA-256)',
    auditorVerificationProcedure: 'Inspect third-party CREST-accredited pentest certificate and verify remediated CVE findings.'
  },
  {
    id: 'dec-ev-02',
    title: 'AWS IAM Privileged Role & Access Key Quarterly Review',
    controlCode: 'A.5.15',
    provider: 'AWS IAM / Okta',
    harvestedDate: new Date(Date.now() - 94 * 86400000).toISOString(),
    retentionWindowDays: 90,
    daysRemaining: -4,
    healthBadge: 'DEAD',
    status: 'DEPRECIATED',
    decayActionRequired: 'EVIDENCE EXPIRED: Retention window exceeded by 4 days. Non-conformity triggered under SOC 2 CC6.3.',
    proofHash: '0x3a4f89d12c40...b7e2',
    fileFormat: 'JSON Access Matrix (Immutable WORM)',
    auditorVerificationProcedure: 'Verify CISO and IT Director signed quarterly approval of all IAM role assignments.'
  },
  {
    id: 'dec-ev-03',
    title: 'Production Database TLS 1.3 & AES-256 Encryption Attestation',
    controlCode: 'A.8.24',
    provider: 'AWS KMS / RDS',
    harvestedDate: new Date(Date.now() - 25 * 86400000).toISOString(),
    retentionWindowDays: 180,
    daysRemaining: 155,
    healthBadge: 'FRESH',
    status: 'VALID',
    decayActionRequired: 'Current evidence fully conforming. 155 days remaining in SOC 2 Type II audit cycle.',
    proofHash: '0x99c2d48a101f...ff24',
    fileFormat: 'AWS Config Cipher Enforcement Certificate',
    auditorVerificationProcedure: 'Inspect automated cipher suite policy blocking SSLv3, TLS 1.0, and TLS 1.1.'
  },
  {
    id: 'dec-ev-04',
    title: 'Disaster Recovery & Data Replication Failover Test Log',
    controlCode: 'A.8.14',
    provider: 'Cloud Infrastructure SecOps',
    harvestedDate: new Date(Date.now() - 165 * 86400000).toISOString(),
    retentionWindowDays: 180,
    daysRemaining: 15,
    healthBadge: 'STALE',
    status: 'DECAY_WARNING',
    decayActionRequired: 'Semi-annual DR drill window closing in 15 days. Execute cross-region database failover.',
    proofHash: '0x12c4a99f3b55...82d1',
    fileFormat: 'RTO/RPO Simulation Log (ISO 22301)',
    auditorVerificationProcedure: 'Validate demonstrated RTO < 4 hours and RPO < 1 hour in accordance with MAS Notice 655.'
  },
  {
    id: 'dec-ev-05',
    title: 'Annual Staff Security Awareness & Anti-Phishing Training Roster',
    controlCode: 'A.6.3',
    provider: 'KnowBe4 / HRMS',
    harvestedDate: new Date(Date.now() - 40 * 86400000).toISOString(),
    retentionWindowDays: 365,
    daysRemaining: 325,
    healthBadge: 'FRESH',
    status: 'VALID',
    decayActionRequired: '98.6% completion rate achieved. No remediation required.',
    proofHash: '0x4d5e6f7a8b9c...0123',
    fileFormat: 'HRMS Completion Ledger (CSV/PDF)',
    auditorVerificationProcedure: 'Sample 25 new hires and verify mandatory 30-day compliance training completion.'
  },
  {
    id: 'dec-ev-06',
    title: 'Critical Third-Party Cloud Vendor SOC 2 Assessment',
    controlCode: 'A.5.21',
    provider: 'Vendor Risk Management',
    harvestedDate: new Date(Date.now() - 385 * 86400000).toISOString(),
    retentionWindowDays: 365,
    daysRemaining: -20,
    healthBadge: 'DEAD',
    status: 'DEPRECIATED',
    decayActionRequired: 'EVIDENCE EXPIRED: Vendor SOC 2 Type II report is > 12 months old. Non-conformity under ISO 27001 A.5.21.',
    proofHash: '0x8a9b0c1d2e3f...4567',
    fileFormat: 'Third-Party Independent Auditor Report',
    auditorVerificationProcedure: 'Review vendor bridge letter and collect latest annual AICPA SOC 2 Type II attestation.'
  }
];

// Helper: Calculate remaining time in HH:MM:SS
export function formatRemainingTime(expiresAt?: string): string {
  if (!expiresAt) return 'N/A';
  const diffMs = new Date(expiresAt).getTime() - Date.now();
  if (diffMs <= 0) return 'EXPIRED (AUTO-CAPA TRIGGERED)';

  const totalSecs = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSecs / 3600);
  const minutes = Math.floor((totalSecs % 3600) / 60);
  const seconds = totalSecs % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Helper: Evaluate whether an incoming event triggers a drift
export function evaluateEventForDrift(event: any, currentControls: MonitoredControl[]): {
  updatedControls: MonitoredControl[];
  newDriftEntries: DriftTimelineEntry[];
} {
  const updatedControls = [...currentControls];
  const newDriftEntries: DriftTimelineEntry[] = [];
  const eventType = (event.eventType || '').toLowerCase();
  const summary = (event.summary || '').toLowerCase();

  // Rule 1: S3 Public Bucket
  if (eventType.includes('putbucketacl') || summary.includes('s3 bucket') || summary.includes('allusers:read')) {
    const idx = updatedControls.findIndex(c => c.controlCode === 'A.5.15');
    if (idx !== -1 && updatedControls[idx].status !== 'DRIFT_DETECTED') {
      const now = new Date().toISOString();
      const expiresAt = new Date(Date.now() + 120 * 60000).toISOString();
      updatedControls[idx] = {
        ...updatedControls[idx],
        status: 'DRIFT_DETECTED',
        statusMessage: event.summary || 'S3 Bucket policy public access detected.',
        driftStartedAt: now,
        gracePeriodExpiresAt: expiresAt,
        consecutivePassCount: 0
      };
      newDriftEntries.push({
        id: `dt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        controlCode: 'A.5.15',
        controlTitle: updatedControls[idx].title,
        driftStartedAt: now,
        triggerSource: event.source || 'AWS CloudTrail',
        triggerEvent: event.eventType || 's3:PutBucketAcl',
        remediationType: 'MANUAL_DISPATCH',
        remediationSummary: 'Unapproved public access block disabling. Initiated 120-minute grace timer.',
        remediatedBy: 'Awaiting Operator / Self-Healing',
        proofHash: `0x${Math.random().toString(16).slice(2, 10)}...`,
        status: 'ACTIVE_DRIFT'
      });
    }
  }

  // Rule 2: Okta MFA Deactivated
  if (eventType.includes('mfa.factor.deactivate') || summary.includes('webauthn factor removed') || summary.includes('mfa removed')) {
    const idx = updatedControls.findIndex(c => c.controlCode === 'MAS-10.1');
    if (idx !== -1 && updatedControls[idx].status !== 'DRIFT_DETECTED') {
      const now = new Date().toISOString();
      const expiresAt = new Date(Date.now() + 60 * 60000).toISOString();
      updatedControls[idx] = {
        ...updatedControls[idx],
        status: 'DRIFT_DETECTED',
        statusMessage: event.summary || 'Admin account MFA factor removed.',
        driftStartedAt: now,
        gracePeriodExpiresAt: expiresAt,
        consecutivePassCount: 0
      };
      newDriftEntries.push({
        id: `dt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        controlCode: 'MAS-10.1',
        controlTitle: updatedControls[idx].title,
        driftStartedAt: now,
        triggerSource: event.source || 'Okta Identity Cloud',
        triggerEvent: event.eventType || 'user.mfa.factor.deactivate',
        remediationType: 'AUTO_CAPA_ESCALATION',
        remediationSummary: 'Privileged identity dropped FIDO2 factor. Grace timer active.',
        remediatedBy: 'Awaiting Operator / Self-Healing',
        proofHash: `0x${Math.random().toString(16).slice(2, 10)}...`,
        status: 'ACTIVE_DRIFT'
      });
    }
  }

  // Rule 3: Critical CVE on Host
  if (eventType.includes('criticalrce') || summary.includes('cve-2026') || (event.severity === 'CRITICAL' && event.source.includes('CrowdStrike'))) {
    const idx = updatedControls.findIndex(c => c.controlCode === 'A.8.8');
    if (idx !== -1 && updatedControls[idx].status !== 'DRIFT_DETECTED') {
      const now = new Date().toISOString();
      const expiresAt = new Date(Date.now() + 180 * 60000).toISOString();
      updatedControls[idx] = {
        ...updatedControls[idx],
        status: 'DRIFT_DETECTED',
        statusMessage: event.summary || 'Critical unpatched RCE detected on workload host.',
        driftStartedAt: now,
        gracePeriodExpiresAt: expiresAt,
        consecutivePassCount: 0
      };
      newDriftEntries.push({
        id: `dt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        controlCode: 'A.8.8',
        controlTitle: updatedControls[idx].title,
        driftStartedAt: now,
        triggerSource: event.source || 'CrowdStrike Falcon',
        triggerEvent: event.eventType || 'HostVulnerability:CriticalRCE',
        remediationType: 'MANUAL_DISPATCH',
        remediationSummary: 'CVSS 9.8 remote code execution vulnerability detected on payment-gateway.',
        remediatedBy: 'Awaiting Host Quarantine',
        proofHash: `0x${Math.random().toString(16).slice(2, 10)}...`,
        status: 'ACTIVE_DRIFT'
      });
    }
  }

  return { updatedControls, newDriftEntries };
}

// ---------------------------------------------------------------------------
// 30-Day Historical Evidence Health & Recurring Staleness Pattern Definitions
// ---------------------------------------------------------------------------

export interface DailyEvidenceHealthPoint {
  day: string;
  dateLabel: string;
  overallHealthScore: number; // 0 - 100%
  freshCount: number;
  staleCount: number;
  deadCount: number;
  // Specific control health trajectories (0 = Dead, 50 = Stale, 100 = Fresh)
  a8_8_vuln: number;
  a5_15_iam: number;
  a8_14_dr: number;
  a5_21_vendor: number;
  a8_24_crypto: number;
  stalenessAnomaly?: string;
  recurringPatternTag?: string;
}

export interface RecurringStalenessPattern {
  controlCode: string;
  controlTitle: string;
  provider: string;
  stalenessDays30d: number;
  recurrenceCycle: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  rootCausePattern: string;
  recommendedPreventiveAction: string;
  trendDirection: 'DEGRADING' | 'RECOVERING' | 'CYCLICAL';
  evidenceId: string;
}

export const RECURRING_STALENESS_PATTERNS: RecurringStalenessPattern[] = [
  {
    controlCode: 'A.5.15',
    controlTitle: 'IAM Privileged Role & Access Key Review',
    provider: 'AWS IAM / Okta',
    stalenessDays30d: 19,
    recurrenceCycle: 'Every 21–30 Days (Quarterly Boundary)',
    severity: 'CRITICAL',
    rootCausePattern: 'Manual spreadsheet access approvals by department leads consistently exceed the 90-day retention window by 4–8 days.',
    recommendedPreventiveAction: 'Deploy automated Okta SCIM re-certification workflows with auto-escalation webhooks triggered 14 days prior to retention expiry.',
    trendDirection: 'DEGRADING',
    evidenceId: 'dec-ev-02'
  },
  {
    controlCode: 'A.8.8',
    controlTitle: 'Vulnerability Remediation & Pentest Reports',
    provider: 'CrowdStrike / Mandiant',
    stalenessDays30d: 14,
    recurrenceCycle: 'Bi-Weekly Sprint Cadence',
    severity: 'HIGH',
    rootCausePattern: 'Evidence repeatedly degrades to STALE (12 days remaining) between release cycles when sprint tickets defer verification scans.',
    recommendedPreventiveAction: 'Trigger daily differential vulnerability scans via CrowdStrike API and auto-anchor verified clean scans in the Evidence Vault.',
    trendDirection: 'CYCLICAL',
    evidenceId: 'dec-ev-01'
  },
  {
    controlCode: 'A.5.21',
    controlTitle: 'Critical Third-Party Cloud Vendor SOC 2 Review',
    provider: 'Vendor Risk Management',
    stalenessDays30d: 22,
    recurrenceCycle: 'Annual Renewal Lag (>365d)',
    severity: 'HIGH',
    rootCausePattern: 'Third-party SaaS vendors delay issuing updated SOC 2 Type II reports or bridge letters, leaving evidence in DEAD state for 20+ days.',
    recommendedPreventiveAction: 'Automate vendor procurement notification webhooks 60 days prior to audit cycle cutoff with mandatory vendor contract SLAs.',
    trendDirection: 'DEGRADING',
    evidenceId: 'dec-ev-06'
  },
  {
    controlCode: 'A.8.14',
    controlTitle: 'Disaster Recovery & Data Replication Failover Test',
    provider: 'Cloud Infrastructure SecOps',
    stalenessDays30d: 8,
    recurrenceCycle: 'Semi-Annual Cliff (Days 165–180)',
    severity: 'MEDIUM',
    rootCausePattern: 'High operational overhead of cross-region DB failovers results in deferring drill logs until the final 15 days of the retention SLA.',
    recommendedPreventiveAction: 'Implement non-disruptive automated sandbox failover testing on an automated 60-day recurring cron pipeline.',
    trendDirection: 'CYCLICAL',
    evidenceId: 'dec-ev-04'
  }
];

// Generate 30 days of historical evidence health data showing recurring staleness patterns
export const HISTORICAL_30D_EVIDENCE_HEALTH: DailyEvidenceHealthPoint[] = [
  { day: 'Day -29', dateLabel: 'Aug 10', overallHealthScore: 92, freshCount: 5, staleCount: 1, deadCount: 0, a8_8_vuln: 100, a5_15_iam: 100, a8_14_dr: 90, a5_21_vendor: 60, a8_24_crypto: 100 },
  { day: 'Day -28', dateLabel: 'Aug 11', overallHealthScore: 92, freshCount: 5, staleCount: 1, deadCount: 0, a8_8_vuln: 100, a5_15_iam: 100, a8_14_dr: 90, a5_21_vendor: 60, a8_24_crypto: 100 },
  { day: 'Day -27', dateLabel: 'Aug 12', overallHealthScore: 90, freshCount: 5, staleCount: 1, deadCount: 0, a8_8_vuln: 95, a5_15_iam: 100, a8_14_dr: 85, a5_21_vendor: 55, a8_24_crypto: 100 },
  { day: 'Day -26', dateLabel: 'Aug 13', overallHealthScore: 88, freshCount: 5, staleCount: 1, deadCount: 0, a8_8_vuln: 90, a5_15_iam: 95, a8_14_dr: 85, a5_21_vendor: 50, a8_24_crypto: 100 },
  { day: 'Day -25', dateLabel: 'Aug 14', overallHealthScore: 85, freshCount: 4, staleCount: 2, deadCount: 0, a8_8_vuln: 70, a5_15_iam: 90, a8_14_dr: 85, a5_21_vendor: 45, a8_24_crypto: 100, stalenessAnomaly: 'A.8.8 Vuln Scan crossed into Stale window (<30d)', recurringPatternTag: 'A.8.8 Sprint Staleness' },
  { day: 'Day -24', dateLabel: 'Aug 15', overallHealthScore: 81, freshCount: 4, staleCount: 2, deadCount: 0, a8_8_vuln: 55, a5_15_iam: 85, a8_14_dr: 80, a5_21_vendor: 40, a8_24_crypto: 100 },
  { day: 'Day -23', dateLabel: 'Aug 16', overallHealthScore: 78, freshCount: 4, staleCount: 2, deadCount: 0, a8_8_vuln: 45, a5_15_iam: 80, a8_14_dr: 80, a5_21_vendor: 35, a8_24_crypto: 100 },
  { day: 'Day -22', dateLabel: 'Aug 17', overallHealthScore: 89, freshCount: 5, staleCount: 1, deadCount: 0, a8_8_vuln: 100, a5_15_iam: 80, a8_14_dr: 80, a5_21_vendor: 35, a8_24_crypto: 100, stalenessAnomaly: 'A.8.8 Pentest Re-Harvested (+100% Freshness reset)' },
  { day: 'Day -21', dateLabel: 'Aug 18', overallHealthScore: 86, freshCount: 5, staleCount: 1, deadCount: 0, a8_8_vuln: 100, a5_15_iam: 70, a8_14_dr: 80, a5_21_vendor: 30, a8_24_crypto: 100 },
  { day: 'Day -20', dateLabel: 'Aug 19', overallHealthScore: 82, freshCount: 4, staleCount: 2, deadCount: 0, a8_8_vuln: 95, a5_15_iam: 55, a8_14_dr: 80, a5_21_vendor: 25, a8_24_crypto: 100, stalenessAnomaly: 'A.5.15 IAM Review Stale Warning triggered' },
  { day: 'Day -19', dateLabel: 'Aug 20', overallHealthScore: 79, freshCount: 4, staleCount: 2, deadCount: 0, a8_8_vuln: 95, a5_15_iam: 40, a8_14_dr: 75, a5_21_vendor: 20, a8_24_crypto: 100 },
  { day: 'Day -18', dateLabel: 'Aug 21', overallHealthScore: 70, freshCount: 3, staleCount: 2, deadCount: 1, a8_8_vuln: 90, a5_15_iam: 0, a8_14_dr: 75, a5_21_vendor: 15, a8_24_crypto: 100, stalenessAnomaly: 'A.5.15 IAM Review Expired (DEAD non-conformity)', recurringPatternTag: 'A.5.15 Quarter Boundary Breach' },
  { day: 'Day -17', dateLabel: 'Aug 22', overallHealthScore: 68, freshCount: 3, staleCount: 2, deadCount: 1, a8_8_vuln: 90, a5_15_iam: 0, a8_14_dr: 75, a5_21_vendor: 10, a8_24_crypto: 100 },
  { day: 'Day -16', dateLabel: 'Aug 23', overallHealthScore: 68, freshCount: 3, staleCount: 2, deadCount: 1, a8_8_vuln: 90, a5_15_iam: 0, a8_14_dr: 75, a5_21_vendor: 10, a8_24_crypto: 100 },
  { day: 'Day -15', dateLabel: 'Aug 24', overallHealthScore: 85, freshCount: 4, staleCount: 2, deadCount: 0, a8_8_vuln: 90, a5_15_iam: 90, a8_14_dr: 70, a5_21_vendor: 10, a8_24_crypto: 100, stalenessAnomaly: 'A.5.15 Interim IAM Review Re-Signed by CISO' },
  { day: 'Day -14', dateLabel: 'Aug 25', overallHealthScore: 84, freshCount: 4, staleCount: 2, deadCount: 0, a8_8_vuln: 85, a5_15_iam: 85, a8_14_dr: 70, a5_21_vendor: 5, a8_24_crypto: 100 },
  { day: 'Day -13', dateLabel: 'Aug 26', overallHealthScore: 75, freshCount: 3, staleCount: 2, deadCount: 1, a8_8_vuln: 85, a5_15_iam: 80, a8_14_dr: 70, a5_21_vendor: 0, a8_24_crypto: 100, stalenessAnomaly: 'A.5.21 Vendor SOC 2 passed 365 days (DEAD)', recurringPatternTag: 'A.5.21 Vendor Lag' },
  { day: 'Day -12', dateLabel: 'Aug 27', overallHealthScore: 73, freshCount: 3, staleCount: 2, deadCount: 1, a8_8_vuln: 80, a5_15_iam: 75, a8_14_dr: 65, a5_21_vendor: 0, a8_24_crypto: 100 },
  { day: 'Day -11', dateLabel: 'Aug 28', overallHealthScore: 71, freshCount: 3, staleCount: 2, deadCount: 1, a8_8_vuln: 65, a5_15_iam: 70, a8_14_dr: 65, a5_21_vendor: 0, a8_24_crypto: 100 },
  { day: 'Day -10', dateLabel: 'Aug 29', overallHealthScore: 68, freshCount: 2, staleCount: 3, deadCount: 1, a8_8_vuln: 50, a5_15_iam: 60, a8_14_dr: 50, a5_21_vendor: 0, a8_24_crypto: 100, stalenessAnomaly: 'A.8.8 Vuln & A.8.14 DR entered STALE warning concurrently', recurringPatternTag: 'A.8.8 Sprint Staleness' },
  { day: 'Day -9', dateLabel: 'Aug 30', overallHealthScore: 67, freshCount: 2, staleCount: 3, deadCount: 1, a8_8_vuln: 45, a5_15_iam: 55, a8_14_dr: 50, a5_21_vendor: 0, a8_24_crypto: 100 },
  { day: 'Day -8', dateLabel: 'Aug 31', overallHealthScore: 65, freshCount: 2, staleCount: 3, deadCount: 1, a8_8_vuln: 45, a5_15_iam: 40, a8_14_dr: 45, a5_21_vendor: 0, a8_24_crypto: 100 },
  { day: 'Day -7', dateLabel: 'Sep 01', overallHealthScore: 63, freshCount: 2, staleCount: 3, deadCount: 1, a8_8_vuln: 40, a5_15_iam: 35, a8_14_dr: 45, a5_21_vendor: 0, a8_24_crypto: 100 },
  { day: 'Day -6', dateLabel: 'Sep 02', overallHealthScore: 60, freshCount: 2, staleCount: 3, deadCount: 1, a8_8_vuln: 40, a5_15_iam: 25, a8_14_dr: 40, a5_21_vendor: 0, a8_24_crypto: 100 },
  { day: 'Day -5', dateLabel: 'Sep 03', overallHealthScore: 56, freshCount: 2, staleCount: 2, deadCount: 2, a8_8_vuln: 35, a5_15_iam: 0, a8_14_dr: 40, a5_21_vendor: 0, a8_24_crypto: 100, stalenessAnomaly: 'A.5.15 IAM Review lapsed into DEAD again (Day 90+ expired)', recurringPatternTag: 'A.5.15 Recurrent Non-Conformity' },
  { day: 'Day -4', dateLabel: 'Sep 04', overallHealthScore: 56, freshCount: 2, staleCount: 2, deadCount: 2, a8_8_vuln: 35, a5_15_iam: 0, a8_14_dr: 40, a5_21_vendor: 0, a8_24_crypto: 100 },
  { day: 'Day -3', dateLabel: 'Sep 05', overallHealthScore: 58, freshCount: 2, staleCount: 2, deadCount: 2, a8_8_vuln: 40, a5_15_iam: 0, a8_14_dr: 40, a5_21_vendor: 0, a8_24_crypto: 100 },
  { day: 'Day -2', dateLabel: 'Sep 06', overallHealthScore: 61, freshCount: 2, staleCount: 2, deadCount: 2, a8_8_vuln: 45, a5_15_iam: 0, a8_14_dr: 35, a5_21_vendor: 0, a8_24_crypto: 100 },
  { day: 'Day -1', dateLabel: 'Sep 07', overallHealthScore: 63, freshCount: 2, staleCount: 2, deadCount: 2, a8_8_vuln: 45, a5_15_iam: 0, a8_14_dr: 35, a5_21_vendor: 0, a8_24_crypto: 100 },
  { day: 'Today', dateLabel: 'Sep 08', overallHealthScore: 67, freshCount: 2, staleCount: 2, deadCount: 2, a8_8_vuln: 50, a5_15_iam: 0, a8_14_dr: 35, a5_21_vendor: 0, a8_24_crypto: 100, stalenessAnomaly: 'Live State: 2 FRESH, 2 STALE (A.8.8, A.8.14), 2 DEAD (A.5.15, A.5.21)' }
];

// ---------------------------------------------------------------------------
// Telemetry Heartbeat Alert Triage Interfaces & Initial Seed
// ---------------------------------------------------------------------------

export type TriageState = 'ACTIVE' | 'ACKNOWLEDGED' | 'SILENCED' | 'ESCALATED';

export interface HeartbeatTriageAlert {
  id: string;
  providerId: string;
  providerName: string;
  controlCode: string;
  controlTitle: string;
  category: string;
  elapsedMinutes: number;
  slaMinutes: number;
  healthBadge: TelemetryHealthBadge;
  triageState: TriageState;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  triggeredAt: string;
  slaBreachRatio: string;
  auditStandardRef: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  acknowledgeNote?: string;
  silencedBy?: string;
  silencedUntil?: string;
  silenceReason?: string;
  silenceDurationHours?: number;
  escalatedTo?: string;
  escalatedAt?: string;
  escalationTicketRef?: string;
  escalationNote?: string;
  proofHash?: string;
}

export const INITIAL_TRIAGE_ALERTS: HeartbeatTriageAlert[] = [
  {
    id: 'trg-datadog-dead',
    providerId: 'sla-datadog',
    providerName: 'Datadog SIEM & Ingress',
    controlCode: 'A.8.16',
    controlTitle: 'Continuous Logging & Ingress Anomaly Telemetry',
    category: 'Kubernetes Ingress Log Collector',
    elapsedMinutes: 1480,
    slaMinutes: 120,
    healthBadge: 'DEAD',
    triageState: 'ACTIVE',
    severity: 'CRITICAL',
    triggeredAt: new Date(Date.now() - 1240 * 60000).toISOString(),
    slaBreachRatio: '12.3x SLA interval',
    auditStandardRef: 'ISO 27001 A.8.16 & MAS TRM Sec 13.0',
    proofHash: '0x4e8a...110b'
  },
  {
    id: 'trg-cloudflare-stale',
    providerId: 'sla-cloudflare',
    providerName: 'Cloudflare Edge WAF',
    controlCode: 'A.8.20',
    controlTitle: 'Network Security Perimeter & DDoS Telemetry',
    category: 'Perimeter DDoS & Bot Management',
    elapsedMinutes: 185,
    slaMinutes: 120,
    healthBadge: 'STALE',
    triageState: 'ACTIVE',
    severity: 'HIGH',
    triggeredAt: new Date(Date.now() - 65 * 60000).toISOString(),
    slaBreachRatio: '1.54x SLA interval',
    auditStandardRef: 'ISO 27001 A.8.20 & MAS TRM Sec 9.0',
    proofHash: '0x99a1...2c81'
  },
  {
    id: 'trg-vault-stale',
    providerId: 'sla-vault',
    providerName: 'HashiCorp Vault Enterprise',
    controlCode: 'A.8.24',
    controlTitle: 'Secrets & PKI Token Lease Audit Trail',
    category: 'Secrets & PKI Engine',
    elapsedMinutes: 680,
    slaMinutes: 480,
    healthBadge: 'STALE',
    triageState: 'ACKNOWLEDGED',
    severity: 'HIGH',
    triggeredAt: new Date(Date.now() - 200 * 60000).toISOString(),
    slaBreachRatio: '1.41x SLA interval',
    auditStandardRef: 'ISO 27001 A.8.24 & MAS TRM Sec 11.2',
    acknowledgedBy: 'Alex Chen (SecOps Lead)',
    acknowledgedAt: new Date(Date.now() - 45 * 60000).toISOString(),
    acknowledgeNote: 'Vault cluster node failover in progress. Telemetry daemon re-syncing raft log.',
    proofHash: '0x12c4...77d3'
  },
  {
    id: 'trg-okta-warning',
    providerId: 'sla-okta',
    providerName: 'Okta Identity Cloud',
    controlCode: 'A.5.15',
    controlTitle: 'Privileged Access & MFA Heartbeat Stream',
    category: 'Identity Provider & SCIM',
    elapsedMinutes: 140,
    slaMinutes: 360,
    healthBadge: 'FRESH',
    triageState: 'SILENCED',
    severity: 'MEDIUM',
    triggeredAt: new Date(Date.now() - 140 * 60000).toISOString(),
    slaBreachRatio: '0.38x SLA interval',
    auditStandardRef: 'ISO 27001 A.5.15 & MAS TRM Sec 10.1',
    silencedBy: 'Sarah Jenkins (Compliance Manager)',
    silencedUntil: new Date(Date.now() + 4 * 3600000).toISOString(),
    silenceReason: 'Scheduled maintenance window: Okta Org tenant migration',
    silenceDurationHours: 4,
    proofHash: '0x7e8b...99a0'
  }
];

