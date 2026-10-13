// Formal TÜV Documentation Standard: Standard Operating Procedure (SOP) Engine
// Conforms strictly to ISO/IEC 27001:2022 Clause 8.1, ISO 19011:2018 audit specifications,
// and TÜV SÜD / BSI accreditation requirements for Level 3 operational documentation.
// Enforces:
// 1. Process Triggers (Operational, Temporal, and Anomaly thresholds)
// 2. Numbered Execution Steps (Granular sequential actions with toolchain commands)
// 3. Dual-Control Verification Gates (Four-Eyes Principle / Zero Self-Approval)
// 4. Explicit Output Artifact Definitions (Canonical naming, WORM storage, SHA-256 seals)

import {
  SopProcessTrigger,
  SopNumberedExecutionStep,
  SopDualControlVerificationGate,
  SopOutputArtifact,
  FormalTuvSopStructure,
  GeneratedDocument
} from '../../types';
import { PolicyTemplateContext } from './types';
import { generateDeterministicSha256 } from './auditorVerificationHelper';

/**
 * Builds formal TÜV Standard SOP data for standard catalog templates or dynamically for any custom procedure.
 */
export function getFormalTuvSopStructure(
  docCode: string,
  ctx: Partial<PolicyTemplateContext> & { companyName: string }
): FormalTuvSopStructure {
  const code = docCode.toUpperCase().trim();
  const companyClean = ctx.companyName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase();
  const year = new Date().getFullYear();

  switch (code) {
    case 'SOP-INC-12':
      return {
        sopCode: 'SOP-INC-12',
        sopTitle: 'Incident Management & Data Breach Escalation Standard Operating Procedure',
        tuvAuditStandard: 'TÜV SÜD / ISO/IEC 27001:2022 Clause 8.1 & Annex A.5.24 - A.5.28',
        fourEyesPrincipleEnforced: true,
        processTriggers: [
          {
            triggerId: 'TRG-INC-01',
            triggerName: 'Automated SIEM/EDR Sev-1 Critical Intrusion or Ransomware Alert',
            category: 'AUTOMATED_ALERT',
            detectionSystem: `${ctx.cloudProvider} GuardDuty / CrowdStrike Falcon / Splunk SIEM`,
            initiatingRole: 'Tier 2 SOC Analyst / CSIRT On-Call Lead',
            slaToInitiate: '<= 15 Minutes',
            entryCondition: 'Active lateral movement, unapproved ransomware encryption pattern, or production credential stuffing breach.',
            escalationIfMissed: 'Automated PagerDuty escalation to CISO and Head of Infrastructure within 20 minutes.'
          },
          {
            triggerId: 'TRG-INC-02',
            triggerName: 'Confirmed Unauthorized Access to Customer PII / Production Datastore',
            category: 'CRITICAL_INCIDENT',
            detectionSystem: 'Database Audit Logs / DLP Gateway Alert / WAF Exfiltration Telemetry',
            initiatingRole: 'Lead Security Engineer / Data Protection Officer (DPO)',
            slaToInitiate: '<= 30 Minutes',
            entryCondition: 'Confirmed egress of >= 50 customer records or unauthorized read access on production S3/RDS datastores.',
            escalationIfMissed: 'Direct SMS and voice call to CISO and Legal Counsel within 45 minutes.'
          },
          {
            triggerId: 'TRG-INC-03',
            triggerName: 'Statutory Regulatory Breach Clock Activation (GDPR Art 33 / MAS Notice 655)',
            category: 'STATUTORY_NOTIFICATION',
            detectionSystem: 'CSIRT Triage Finding / Legal Counsel Incident Dossier',
            initiatingRole: 'Chief Information Security Officer (CISO) & Legal Counsel',
            slaToInitiate: '<= 1 Hour from Confirmation',
            entryCondition: 'Confirmation of breach involving personal data or severe technology service disruption.',
            escalationIfMissed: 'Executive Board Emergency Session convened immediately.'
          },
          {
            triggerId: 'TRG-INC-04',
            triggerName: 'Annual Simulated Cyber Crisis & Tabletop Exercise Trigger',
            category: 'SCHEDULED_CADENCE',
            detectionSystem: 'ISMS Annual Audit Calendar / Skanda GRC Scheduler',
            initiatingRole: 'Information Security Manager / External Lead Auditor',
            slaToInitiate: 'Annually (Q3 Schedule)',
            entryCondition: 'Execution of simulated multi-vector ransomware and cloud account takeover exercise.',
            escalationIfMissed: 'Automatic Nonconformity logged in CAPA module.'
          }
        ],
        numberedExecutionSteps: [
          {
            stepNumber: '1.0',
            phase: 'Triage & Declaration',
            stepTitle: 'Incident Ingestion, Severity Scoring & War Room Activation',
            responsibleRole: 'CSIRT Incident Commander',
            actionSummary: 'Validate telemetry, assign severity tier (Sev-1 to Sev-4), and establish dedicated encrypted bridge.',
            detailedInstructions: [
              'Review incoming telemetry from SIEM/EDR and execute initial log correlation in CloudWatch / Splunk.',
              'Assess impact against the 4-tier matrix: if >50% users affected or data exfiltration suspected, declare Sev-1.',
              'Provision isolated Slack incident channel (#inc-2026-sev1) and launch Google Meet / Zoom dedicated bridge.',
              'Silence public status page updates until approved by CISO & Communications Lead.'
            ],
            timeframeSla: '<= 15 Minutes',
            toolchainOrConsole: 'PagerDuty / Slack Enterprise / Splunk / AWS CloudTrail',
            inputDependencies: ['Incoming SIEM Alert Payload', 'On-Call Roster Verification'],
            dualControlGateId: 'GATE-DC-01'
          },
          {
            stepNumber: '2.0',
            phase: 'Containment & Isolation',
            stepTitle: 'Host Quarantining, Token Revocation & Perimeter Hardening',
            responsibleRole: 'Cloud SecOps Engineer',
            actionSummary: 'Sever compromised node network connectivity and revoke active IAM sessions immediately.',
            detailedInstructions: [
              `Execute automated host quarantine via ${ctx.mdmProvider} or cloud security group isolation.`,
              `Detach EC2/Compute instance from production VPC and assign quarantine security group (sg-quarantine-deny-all).`,
              `Trigger global identity revocation: revoke all active sessions in ${ctx.identityProvider} for suspect users.`,
              'Rotate compromised database master credentials and invalidate all STS session tokens via AWS CLI.'
            ],
            timeframeSla: '<= 30 Minutes',
            toolchainOrConsole: 'AWS CLI / Okta Workforce Identity / CrowdStrike Console',
            inputDependencies: ['Step 1.0 Severity Declaration', 'Suspect Asset / Identity Inventory'],
            failureContingency: 'If API calls fail due to permission lock, execute root account emergency break-glass procedure.'
          },
          {
            stepNumber: '3.0',
            phase: 'Forensic Acquisition',
            stepTitle: 'Volatile Memory Capture, Disk Imaging & Chain of Custody Preservation',
            responsibleRole: 'Digital Forensics Specialist',
            actionSummary: 'Capture bit-stream forensic images and volatile memory dumps before resetting state.',
            detailedInstructions: [
              'Execute volatile memory dump via LiME or AWS EC2 memory capture tooling to preserve process table and encryption keys.',
              'Create point-in-time EBS snapshot of all attached block volumes using AWS CLI with tag: ForensicHold=true.',
              'Calculate SHA-256 cryptographic digest of all captured memory and disk images immediately upon acquisition.',
              'Record physical/logical chain of custody in the Skanda Forensic Custody Registry with cryptographic timestamp.'
            ],
            timeframeSla: '<= 2 Hours',
            toolchainOrConsole: 'AWS CLI ec2 create-snapshot / LiME / sha256sum utility',
            inputDependencies: ['Step 2.0 Host Isolation'],
            dualControlGateId: 'GATE-DC-02'
          },
          {
            stepNumber: '4.0',
            phase: 'Eradication & Remediation',
            stepTitle: 'Malware Removal, Persistence Elimination & Pipeline Patching',
            responsibleRole: 'DevOps & SRE Lead',
            actionSummary: 'Rebuild compromised workloads from hardened golden images and patch root vulnerability.',
            detailedInstructions: [
              'Identify attack vector and root cause vulnerability using static and dynamic artifact analysis.',
              `Rebuild affected services from scratch using clean Infrastructure-as-Code (Terraform) pipelines in ${ctx.scmProvider}.`,
              'Deploy patch through emergency CI/CD release pipeline with mandatory SAST/DAST verification.',
              'Re-scan rebuilt infrastructure using vulnerability scanner prior to traffic re-admission.'
            ],
            timeframeSla: '<= 4 Hours',
            toolchainOrConsole: `${ctx.scmProvider} CI/CD / Terraform / Snyk Vulnerability Scanner`,
            inputDependencies: ['Step 3.0 Forensic Preservation Complete'],
            dualControlGateId: 'GATE-DC-03'
          },
          {
            stepNumber: '5.0',
            phase: 'Recovery & Validation',
            stepTitle: 'Staged Traffic Restoration, Smoke Testing & Canary Verification',
            responsibleRole: 'Head of Infrastructure & QA Lead',
            actionSummary: 'Gradually restore customer traffic while monitoring high-frequency anomaly telemetry.',
            detailedInstructions: [
              'Restore routing to 10% canary traffic pool and monitor 5xx error rates and egress bandwidth for 30 minutes.',
              'Execute comprehensive API synthetic test suites to confirm full business workflow functionality.',
              'Gradually scale traffic from 10% to 50% and 100% over a 2-hour window.',
              'Maintain active 24/7 SOC heightened observation mode for minimum 72 hours post-restoration.'
            ],
            timeframeSla: '<= 2 Hours',
            toolchainOrConsole: 'Route 53 Weighted Routing / Datadog APM / CloudWatch Metrics',
            inputDependencies: ['Step 4.0 Eradication Certified'],
            dualControlGateId: 'GATE-DC-04'
          },
          {
            stepNumber: '6.0',
            phase: 'Post-Mortem & CAPA',
            stepTitle: '5-Whys Root Cause Analysis, Executive Report & CAPA Ticket Creation',
            responsibleRole: 'CSIRT Lead & Quality Assurance Officer',
            actionSummary: 'Conduct blameless post-mortem, determine root cause, and log binding preventative actions.',
            detailedInstructions: [
              'Convene mandatory post-incident review meeting with all incident participants within 5 business days.',
              'Execute structured 5-Whys root cause analysis to identify governance, architecture, or policy gaps.',
              'Draft formal Incident Closure Dossier including timeline, impact metrics, and cost calculation.',
              'Register corrective and preventive action (CAPA) tickets in Skanda GRC with hard 30-day remediation deadlines.'
            ],
            timeframeSla: '<= 5 Business Days',
            toolchainOrConsole: 'Skanda GRC CAPA Module / Jira Enterprise / Confluence',
            inputDependencies: ['Step 5.0 Recovery Complete', 'Forensic Timeline Finalized']
          }
        ],
        dualControlVerificationGates: [
          {
            gateId: 'GATE-DC-01',
            gateTitle: 'Sev-1 Declaration & Emergency Production Containment Gate',
            precedingStep: 'Step 1.0 & Step 2.0',
            primaryVerifierRole: 'CSIRT Incident Commander',
            secondaryVerifierRole: 'CISO / Designated Security Director',
            verificationCriteria: [
              'Active threat indicators verified across at least 2 independent telemetry sources.',
              'Customer data impact assessed; potential exfiltration probability determined.',
              'Production service impact communicated to Executive Leadership prior to broad isolation.'
            ],
            enforcementMechanism: 'Hardware FIDO2 MFA Token + PagerDuty Incident Dual-Signoff + Jira Security Lock',
            auditEvidenceProduced: 'Timestamped dual-approval log record in immutable SIEM WORM index with signer credentials.',
            zeroBypassRule: 'Self-approval is programmatically blocked in PagerDuty; emergency exception requires verbal code from CEO.'
          },
          {
            gateId: 'GATE-DC-02',
            gateTitle: 'Digital Forensics Chain of Custody & Cryptographic Hashing Gate',
            precedingStep: 'Step 3.0',
            primaryVerifierRole: 'Lead Forensics Investigator',
            secondaryVerifierRole: 'Head of Legal / Compliance Officer',
            verificationCriteria: [
              'SHA-256 hash calculated immediately on snapshot creation prior to any forensic mounting.',
              'Bit-stream copy stored in isolated write-once-read-many (WORM) AWS S3 Compliance Vault.',
              'Chain of custody log signed by both technical examiner and legal witness.'
            ],
            enforcementMechanism: 'GPG Key Pair Dual-Signature on Manifest + AWS S3 Object Lock in Compliance Mode',
            auditEvidenceProduced: 'Cryptographic manifest file signed with dual GPG keys and registered in Skanda Evidence Locker.',
            zeroBypassRule: 'No forensic evidence may be analyzed without pre-registered SHA-256 baseline; unhashed evidence is legally void.'
          },
          {
            gateId: 'GATE-DC-03',
            gateTitle: 'Production Service Traffic Re-Admission Gate',
            precedingStep: 'Step 4.0 & Step 5.0',
            primaryVerifierRole: 'Head of Infrastructure',
            secondaryVerifierRole: 'Chief Information Security Officer (CISO)',
            verificationCriteria: [
              'Zero unpatched High or Critical CVEs remaining on newly provisioned cluster.',
              'Synthetic end-to-end integration tests passing 100% in staging environment.',
              'Rollback snapshot and immutable standby database confirmed healthy and synced.'
            ],
            enforcementMechanism: 'GitHub Enterprise Environment Protection Rule requiring 2 distinct org approvals + Okta MFA',
            auditEvidenceProduced: 'GitHub deployment event record signed with commit GPG key and CISO digital sign-off token.',
            zeroBypassRule: 'Bypassing production deployment rules is physically disabled via GitHub Enterprise repo rulesets.'
          }
        ],
        outputArtifacts: [
          {
            artifactId: 'ART-INC-01',
            artifactTitle: 'Formal Incident Triage & Operational Runbook Execution Log',
            canonicalFileNaming: `${companyClean}_INCIDENT_${year}_\${INCIDENT_ID}_EXECUTION_LOG.json`,
            generatingStep: 'Step 1.0 & Step 2.0',
            custodianRole: 'CSIRT Operations Lead',
            storageTarget: 'AWS S3 WORM Compliance Vault (s3://skanda-audit-evidence/incidents/)',
            retentionPeriodSla: '7 Years (MAS Notice 655 & ISO 27001 Clause 7.5 Mandate)',
            cryptographicIntegritySeal: 'SHA-256 Hash with AWS KMS Asymmetric Digital Signature',
            auditorInspectionMethod: 'ISO 19011:2018 §B.3 Sampling of JSON event streams with checksum verification.'
          },
          {
            artifactId: 'ART-INC-02',
            artifactTitle: 'Forensic Chain of Custody & SHA-256 Image Attestation Certificate',
            canonicalFileNaming: `${companyClean}_FORENSIC_CUSTODY_${year}_\${INCIDENT_ID}_ATTESTATION.pdf`,
            generatingStep: 'Step 3.0',
            custodianRole: 'Lead Forensics Investigator',
            storageTarget: 'Skanda GRC Immutable Evidence Registry',
            retentionPeriodSla: '7 Years (Statutory Evidence Mandate)',
            cryptographicIntegritySeal: 'SHA-256 Digest Seal with Dual-Officer GPG Public Keys',
            auditorInspectionMethod: 'Auditor cross-examines raw S3 snapshot ETag vs documented SHA-256 digest in registry.'
          },
          {
            artifactId: 'ART-INC-03',
            artifactTitle: 'Executive 5-Whys Post-Mortem & CAPA Corrective Action Dossier',
            canonicalFileNaming: `${companyClean}_INCIDENT_POSTMORTEM_${year}_\${INCIDENT_ID}_APPROVED.pdf`,
            generatingStep: 'Step 6.0',
            custodianRole: 'CISO & Quality Assurance Lead',
            storageTarget: 'Skanda GRC Policy & Incident Dossier Vault',
            retentionPeriodSla: '7 Years',
            cryptographicIntegritySeal: 'SHA-256 Digital Certificate signed by CISO & CEO',
            auditorInspectionMethod: 'Auditor inspects signed PDF, verifies root cause linkage, and checks CAPA 30-day ticket closure.'
          }
        ]
      };

    case 'SOP-CHG-15':
      return {
        sopCode: 'SOP-CHG-15',
        sopTitle: 'Change & Release Management Standard Operating Procedure',
        tuvAuditStandard: 'TÜV SÜD / ISO/IEC 27001:2022 Clause 8.1, Annex A.8.32 & SOC 2 CC8.1',
        fourEyesPrincipleEnforced: true,
        processTriggers: [
          {
            triggerId: 'TRG-CHG-01',
            triggerName: 'Bi-Weekly Scheduled Normal Production Release Window',
            category: 'SCHEDULED_CADENCE',
            detectionSystem: 'Jira Service Management Release Calendar',
            initiatingRole: 'Release Engineering Lead',
            slaToInitiate: '<= 48 Hours before CAB Review',
            entryCondition: 'Feature branch merged to release candidate branch with passing integration tests.',
            escalationIfMissed: 'Release automatically deferred to next fortnightly sprint cycle.'
          },
          {
            triggerId: 'TRG-CHG-02',
            triggerName: 'Emergency Security Hotfix / Zero-Day Vulnerability Patch',
            category: 'CRITICAL_INCIDENT',
            detectionSystem: 'Vulnerability Scanner Alert / SecOps Emergency Advisory',
            initiatingRole: 'Security Operations Lead & Lead Developer',
            slaToInitiate: '<= 30 Minutes from Patch Availability',
            entryCondition: 'Actively exploited CVSS >= 8.5 vulnerability or critical production outage restoration.',
            escalationIfMissed: 'Automated P1 incident escalation to VP Engineering and CISO.'
          },
          {
            triggerId: 'TRG-CHG-03',
            triggerName: 'Production Cloud Infrastructure (IaC) Architecture Modification',
            category: 'SERVICE_REQUEST',
            detectionSystem: 'Terraform Plan Drift Detection / GitHub Pull Request',
            initiatingRole: 'Cloud Solutions Architect',
            slaToInitiate: '<= 72 Hours before execution',
            entryCondition: 'Modification of VPC peering, security groups, KMS policies, or database sizing.',
            escalationIfMissed: 'Terraform Cloud plan automatically times out and locks branch.'
          }
        ],
        numberedExecutionSteps: [
          {
            stepNumber: '1.0',
            phase: 'Request for Change (RFC) Creation',
            stepTitle: 'Change Request Documentation & Risk Impact Tiering',
            responsibleRole: 'Change Requester / Engineering Author',
            actionSummary: 'Document business justification, technical delta, rollback runbook, and impact scope.',
            detailedInstructions: [
              'Open formal Request for Change (RFC) ticket in Jira Service Management specifying Change Category.',
              'Document explicit technical change plan, targeted services, and affected customer APIs.',
              'Attach step-by-step automated rollback procedure with verification script and maximum rollback time.',
              'Execute pre-flight dependency check to ensure no conflicting change tickets are scheduled.'
            ],
            timeframeSla: 'Minimum 48 Hours prior to scheduled deployment',
            toolchainOrConsole: 'Jira Service Management / Confluence Architecture Portal',
            inputDependencies: ['Target Git Commit Hash', 'Architecture Review Approval'],
            dualControlGateId: 'GATE-DC-01'
          },
          {
            stepNumber: '2.0',
            phase: 'Automated CI/CD Validation',
            stepTitle: 'Automated Unit, Integration, SAST, DAST & Dependency Gates',
            responsibleRole: 'Automated CI/CD Pipeline Agent',
            actionSummary: 'Execute comprehensive automated test suite and security vulnerability gating.',
            detailedInstructions: [
              'Trigger automated build and execute 100% of unit and regression tests (mandatory 85% code coverage).',
              `Execute automated SAST scan using Snyk/SonarQube; zero Critical or High vulnerabilities allowed.`,
              'Run software composition analysis (SCA) against all third-party npm and container dependencies.',
              'Publish automated test report and cryptographic build provenance manifest (SLSA Level 3).'
            ],
            timeframeSla: '<= 30 Minutes',
            toolchainOrConsole: `${ctx.scmProvider} Actions / Snyk / Trivy Container Scanner`,
            inputDependencies: ['Step 1.0 RFC Approved'],
            failureContingency: 'Any test failure or security policy violation immediately aborts pipeline.'
          },
          {
            stepNumber: '3.0',
            phase: 'CAB Evaluation & Authorization',
            stepTitle: 'Change Advisory Board Formal Review & Peer Sign-off',
            responsibleRole: 'CAB Chair & Peer Reviewer',
            actionSummary: 'Inspect automated test results, rollback readiness, and approve release execution.',
            detailedInstructions: [
              'Conduct independent code review in SCM; reviewer must not be the author of the pull request.',
              'Inspect test evidence and verify that rollback script has been tested in staging within past 7 days.',
              'Review operational schedule to verify absence of black-out windows or concurrent high-risk activities.',
              'Affix formal digital approval signatures in Jira CAB review panel.'
            ],
            timeframeSla: '<= 24 Hours prior to window',
            toolchainOrConsole: 'Jira CAB Panel / GitHub Pull Request Protection',
            inputDependencies: ['Step 2.0 CI/CD 100% Green'],
            dualControlGateId: 'GATE-DC-02'
          },
          {
            stepNumber: '4.0',
            phase: 'Canary Deployment & Smoke Testing',
            stepTitle: 'Blue/Green Staged Deployment & Automated Health Check',
            responsibleRole: 'Release Engineer & SRE',
            actionSummary: 'Execute zero-downtime deployment with continuous error rate monitoring.',
            detailedInstructions: [
              'Deploy release to Green cluster; execute automated health-check API calls to ensure zero error response.',
              'Shift 10% of production traffic to Green cluster via AWS Route 53 / Envoy service mesh.',
              'Continuously evaluate latency, p99 response times, and 5xx error rates for 15 minutes.',
              'If metrics remain within nominal baseline (<0.01% error rate), shift remaining 90% traffic to Green.'
            ],
            timeframeSla: '<= 45 Minutes',
            toolchainOrConsole: 'Kubernetes ArgoCD / AWS Route 53 / Datadog APM',
            inputDependencies: ['Step 3.0 Dual-Control Gate Passed'],
            dualControlGateId: 'GATE-DC-03'
          },
          {
            stepNumber: '5.0',
            phase: 'Post-Implementation Verification (PIR)',
            stepTitle: 'Closure Attestation & Configuration Baseline Ledger Update',
            responsibleRole: 'Lead SRE & QA Lead',
            actionSummary: 'Verify post-release stability, capture final evidence artifacts, and close change ticket.',
            detailedInstructions: [
              'Execute post-deployment synthetic end-to-end user transaction flows.',
              'Capture telemetry screenshot and APM dashboard snapshot proving 2 hours of post-release stability.',
              'Update configuration item (CI) baseline in the CMDB register with new release version tag.',
              'Close Jira RFC ticket with status: IMPLEMENTED_SUCCESSFUL.'
            ],
            timeframeSla: '<= 4 Hours post-release',
            toolchainOrConsole: 'Skanda CMDB / Jira Service Management / Datadog',
            inputDependencies: ['Step 4.0 100% Traffic Shift Complete']
          }
        ],
        dualControlVerificationGates: [
          {
            gateId: 'GATE-DC-01',
            gateTitle: 'Four-Eyes Principle Independent Code Approval Gate',
            precedingStep: 'Step 1.0',
            primaryVerifierRole: 'Code Author / Change Requester',
            secondaryVerifierRole: 'Principal Peer Reviewer (Independent Engineer)',
            verificationCriteria: [
              'Code changes reviewed line-by-line; compliance with secure coding guidelines verified.',
              'Unit test assertions validate edge cases, authentication boundaries, and input validation.',
              'Author and reviewer are distinct authenticated identities in corporate directory.'
            ],
            enforcementMechanism: 'GitHub Enterprise Branch Protection Rule: minimum 1 peer approval required, self-approval disabled.',
            auditEvidenceProduced: 'GitHub pull request approval event with commit SHA and cryptographic reviewer identity signature.',
            zeroBypassRule: 'Branch protection bypass is disabled for all users including organization administrators.'
          },
          {
            gateId: 'GATE-DC-02',
            gateTitle: 'CAB Executive Release Authorization Gate',
            precedingStep: 'Step 3.0',
            primaryVerifierRole: 'Release Engineering Manager',
            secondaryVerifierRole: 'CAB Chair / CISO Delegate',
            verificationCriteria: [
              'All automated CI/CD and SAST security scans 100% passing with zero unapproved exceptions.',
              'Rollback runbook tested and validated in staging environment.',
              'No conflicting production changes scheduled in the target maintenance window.'
            ],
            enforcementMechanism: 'Jira Service Management Workflow State Guard requiring dual cryptographic signatures.',
            auditEvidenceProduced: 'Jira CAB Approval Record with timestamped dual signatures and cryptographic review hash.',
            zeroBypassRule: 'Emergency changes bypass CAB only upon dual verbal/written sign-off by VP Engineering and CISO.'
          },
          {
            gateId: 'GATE-DC-03',
            gateTitle: 'Production Deployment Execution Gate',
            precedingStep: 'Step 4.0',
            primaryVerifierRole: 'DevOps Release Engineer',
            secondaryVerifierRole: 'On-Duty SRE / Security Operations Lead',
            verificationCriteria: [
              'Pre-deployment health check on secondary region and database replicas green.',
              'Customer communication dispatched if maintenance window includes visible degradation.',
              'Both engineers actively present on deployment bridge with active telemetry monitors.'
            ],
            enforcementMechanism: 'ArgoCD Multi-Party Promotion Gate with hardware-backed MFA challenge.',
            auditEvidenceProduced: 'ArgoCD sync audit log entry recording dual operator session tokens.',
            zeroBypassRule: 'Single-operator direct deployment to production cluster is blocked by Kubernetes RBAC.'
          }
        ],
        outputArtifacts: [
          {
            artifactId: 'ART-CHG-01',
            artifactTitle: 'CAB Approved Request for Change (RFC) Record with Signatures',
            canonicalFileNaming: `${companyClean}_RFC_${year}_\${RFC_ID}_CAB_APPROVAL.pdf`,
            generatingStep: 'Step 1.0 & Step 3.0',
            custodianRole: 'CAB Secretariat / Release Manager',
            storageTarget: 'Jira Enterprise Cloud & AWS S3 Compliance Bucket',
            retentionPeriodSla: '7 Years (SOC 2 CC8.1 & ISO 27001 Clause 7.5)',
            cryptographicIntegritySeal: 'SHA-256 Digest with Jira Cryptographic Audit Trail',
            auditorInspectionMethod: 'ISO 19011:2018 §B.3 Sampling of 25 production releases cross-examined with Git commits.'
          },
          {
            artifactId: 'ART-CHG-02',
            artifactTitle: 'Automated CI/CD Build Provenance & Security Scan Report',
            canonicalFileNaming: `${companyClean}_BUILD_PROVENANCE_\${GIT_COMMIT}_SLSA3.json`,
            generatingStep: 'Step 2.0',
            custodianRole: 'DevSecOps Architect',
            storageTarget: 'Artifact Registry & S3 WORM Compliance Locker',
            retentionPeriodSla: '7 Years',
            cryptographicIntegritySeal: 'Cosign Cryptographic Signature with OIDC Identity',
            auditorInspectionMethod: 'Auditor inspects automated Cosign signature and verifies zero Critical CVEs.'
          },
          {
            artifactId: 'ART-CHG-03',
            artifactTitle: 'Post-Implementation Review (PIR) & Canary Telemetry Dossier',
            canonicalFileNaming: `${companyClean}_PIR_REPORT_${year}_\${RFC_ID}_STABILITY.pdf`,
            generatingStep: 'Step 5.0',
            custodianRole: 'Lead SRE',
            storageTarget: 'Skanda GRC Operations Evidence Repository',
            retentionPeriodSla: '7 Years',
            cryptographicIntegritySeal: 'SHA-256 Digest Seal with Lead SRE Digital Signature',
            auditorInspectionMethod: 'Auditor inspects post-release stability metrics and verifies absence of customer rollback incidents.'
          }
        ]
      };

    case 'SOP-BKP-14':
      return {
        sopCode: 'SOP-BKP-14',
        sopTitle: 'Backup, Snapshot & Recovery Verification Standard Operating Procedure',
        tuvAuditStandard: 'TÜV SÜD / ISO/IEC 27001:2022 Clause 8.1 & Annex A.8.13',
        fourEyesPrincipleEnforced: true,
        processTriggers: [
          {
            triggerId: 'TRG-BKP-01',
            triggerName: 'Automated Daily Continuous Database & Persistent Disk Backup Cadence',
            category: 'SCHEDULED_CADENCE',
            detectionSystem: `${ctx.cloudProvider} Backup Vault / Automated Cron Daemon`,
            initiatingRole: 'Automated Cloud Backup Service',
            slaToInitiate: 'Daily at 02:00 UTC Continuous',
            entryCondition: 'Scheduled cron execution time reached across production RDS and document buckets.',
            escalationIfMissed: 'Alert fired to SecOps if snapshot fails to initiate within 30 minutes.'
          },
          {
            triggerId: 'TRG-BKP-02',
            triggerName: 'Mandatory Quarterly Restoration Drill Calendar Trigger',
            category: 'SCHEDULED_CADENCE',
            detectionSystem: 'Skanda GRC Compliance Cadence Engine',
            initiatingRole: 'Lead Database Administrator & Quality Auditor',
            slaToInitiate: 'Quarterly (First Monday of Jan, Apr, Jul, Oct)',
            entryCondition: 'Start of calendar quarter requiring formal test restoration of sampled production snapshot.',
            escalationIfMissed: 'Overdue compliance alert to CISO after 14 calendar days.'
          },
          {
            triggerId: 'TRG-BKP-03',
            triggerName: 'Backup Replication Failure or Cross-Region Sync Lag Alert',
            category: 'AUTOMATED_ALERT',
            detectionSystem: 'CloudWatch Metric Alarm: BackupReplicationLag > 15m',
            initiatingRole: 'On-Call SRE',
            slaToInitiate: '<= 1 Hour',
            entryCondition: 'Cross-region snapshot replication delay exceeds RPO threshold of 15 minutes.',
            escalationIfMissed: 'Sev-2 incident declared automatically in PagerDuty.'
          }
        ],
        numberedExecutionSteps: [
          {
            stepNumber: '1.0',
            phase: 'Automated Snapshot & KMS Encryption',
            stepTitle: 'Snapshot Initiation, Volume Quiescing & AES-256 Key Binding',
            responsibleRole: 'Automated Backup Engine',
            actionSummary: 'Execute point-in-time snapshot with AES-256 cloud customer managed key (CMK).',
            detailedInstructions: [
              `Initiate automated snapshot of production PostgreSQL instances via ${ctx.cloudProvider} Backup.`,
              'Verify volume is quiesced to ensure relational transaction consistency.',
              'Encrypt snapshot payload with dedicated AWS KMS customer managed key (alias/backup-master-key).',
              'Tag snapshot with standardized metadata: Environment=Production, Retention=35D, Classification=Restricted.'
            ],
            timeframeSla: '<= 45 Minutes',
            toolchainOrConsole: 'AWS Backup / AWS KMS Console',
            inputDependencies: ['Production RDS Active', 'KMS Key Policy Active']
          },
          {
            stepNumber: '2.0',
            phase: 'Cross-Region Replication & WORM Lock',
            stepTitle: 'Geographic Replication & Immutable WORM Compliance Lock',
            responsibleRole: 'Cloud Backup Service',
            actionSummary: 'Replicate snapshot to secondary disaster recovery region with immutable object lock.',
            detailedInstructions: [
              'Replicate encrypted snapshot from primary region to disaster recovery secondary region.',
              'Apply AWS S3 Object Lock / Backup Vault Lock in Compliance Mode (WORM).',
              'Validate that deletion and retention period decrease actions are cryptographically disabled.',
              'Record snapshot ARN, replication timestamp, and source checksum in the Backup Ledger.'
            ],
            timeframeSla: '<= 2 Hours post-snapshot',
            toolchainOrConsole: 'AWS S3 Glacier Vault / CloudTrail',
            inputDependencies: ['Step 1.0 Snapshot Complete'],
            dualControlGateId: 'GATE-DC-01'
          },
          {
            stepNumber: '3.0',
            phase: 'Quarterly Restoration Isolation',
            stepTitle: 'Provisioning Isolated Staging Sandbox for Restoration Drill',
            responsibleRole: 'Lead Database Administrator',
            actionSummary: 'Provision completely isolated sandbox VPC with zero network ingress/egress to production.',
            detailedInstructions: [
              'Deploy temporary ephemeral VPC in secondary cloud region using standard Terraform sandbox module.',
              'Verify routing tables have zero routes to corporate network or production VPCs.',
              'Select random snapshot from previous 30 days pursuant to ISO 19011:2018 sampling methodology.',
              'Attach synthetic test credentials for restoration verification team.'
            ],
            timeframeSla: '<= 1 Hour',
            toolchainOrConsole: 'Terraform / AWS VPC Console',
            inputDependencies: ['Quarterly Drill Scheduled', 'Random Snapshot Selected']
          },
          {
            stepNumber: '4.0',
            phase: 'Snapshot Restoration & Integrity Testing',
            stepTitle: 'Instance Launch, Schema Validation & Row Checksum Verification',
            responsibleRole: 'Database Administrator & QA Engineer',
            actionSummary: 'Restore snapshot to new test instance and execute comprehensive data integrity scripts.',
            detailedInstructions: [
              'Restore database snapshot onto new RDS db.m6i.xlarge test instance.',
              'Record total elapsed restoration time (must verify RTO <= 2 Hours SLA).',
              'Execute automated schema check, index validation, and foreign key integrity audit scripts.',
              'Compare table row counts and hash checksums of critical tables against source backup manifest.'
            ],
            timeframeSla: '<= 2 Hours',
            toolchainOrConsole: 'pg_dump / psql CLI / Python Integrity Script',
            inputDependencies: ['Step 3.0 Isolated Sandbox Ready'],
            dualControlGateId: 'GATE-DC-02'
          },
          {
            stepNumber: '5.0',
            phase: 'Attestation & Sandbox Decommissioning',
            stepTitle: 'Dossier Generation, Executive Attestation & Cryptographic Teardown',
            responsibleRole: 'DBA Lead & CISO Delegate',
            actionSummary: 'Generate formal restoration drill certificate, sign attestation, and tear down sandbox.',
            detailedInstructions: [
              'Compile formal Backup Restoration Drill Report including RTO/RPO metrics and checksum results.',
              'Obtain dual sign-off from DBA Lead and CISO certifying successful recovery verification.',
              'Destroy temporary restored database instance and ephemeral VPC using terraform destroy.',
              'Archive signed drill report in Skanda GRC repository for annual lead auditor inspection.'
            ],
            timeframeSla: '<= 24 Hours post-drill',
            toolchainOrConsole: 'Terraform destroy / Skanda GRC Evidence Module',
            inputDependencies: ['Step 4.0 Checksum Verification 100% Match']
          }
        ],
        dualControlVerificationGates: [
          {
            gateId: 'GATE-DC-01',
            gateTitle: 'Backup Retention Policy Modification & Deletion Prevention Gate',
            precedingStep: 'Step 2.0',
            primaryVerifierRole: 'Lead Infrastructure Engineer',
            secondaryVerifierRole: 'Chief Information Security Officer (CISO)',
            verificationCriteria: [
              'WORM Compliance Mode active; retention period cannot be reduced by any user.',
              'Multi-Factor Authentication (MFA) Delete hardware token physically verified.',
              'Any policy change request verified against legal/contractual retention mandates.'
            ],
            enforcementMechanism: 'AWS Organization SCP preventing deletion + Hardware FIDO2 Security Key required for KMS key policy updates.',
            auditEvidenceProduced: 'AWS CloudTrail immutable record of IAM policy evaluation and KMS key state change.',
            zeroBypassRule: 'Self-approval and root-account single sign-off are strictly prohibited by AWS Service Control Policies.'
          },
          {
            gateId: 'GATE-DC-02',
            gateTitle: 'Quarterly Restoration Drill Integrity Attestation Gate',
            precedingStep: 'Step 4.0',
            primaryVerifierRole: 'Executing Database Administrator',
            secondaryVerifierRole: 'Lead Information Security Auditor / CISO',
            verificationCriteria: [
              'Actual restoration duration verified within documented RTO <= 2 Hours SLA.',
              'Zero database corruption or missing foreign keys identified.',
              'Table row count parity verified within 100% match of source backup manifest.'
            ],
            enforcementMechanism: 'Skanda GRC Audit Gate requiring dual digital signatures and cryptographic checksum hash.',
            auditEvidenceProduced: 'Signed PDF restoration attestation certificate with embedded SHA-256 seal.',
            zeroBypassRule: 'A restoration drill report signed by only one individual is categorized as a Major Nonconformity.'
          }
        ],
        outputArtifacts: [
          {
            artifactId: 'ART-BKP-01',
            artifactTitle: 'Quarterly Backup Restoration Drill Verification Attestation Certificate',
            canonicalFileNaming: `${companyClean}_BACKUP_RESTORE_DRILL_${year}_Q\${QUARTER}.pdf`,
            generatingStep: 'Step 4.0 & Step 5.0',
            custodianRole: 'Lead Database Administrator',
            storageTarget: 'AWS S3 WORM Compliance Bucket (s3://skanda-audit-evidence/backups/)',
            retentionPeriodSla: '7 Years (ISO 27001 Clause 7.5 & Annex A.8.13)',
            cryptographicIntegritySeal: 'SHA-256 Digest with Dual-Officer Digital Signatures',
            auditorInspectionMethod: 'ISO 19011:2018 §B.3 Inspection of quarterly drill certificates and test database logs.'
          },
          {
            artifactId: 'ART-BKP-02',
            artifactTitle: 'Continuous Backup & KMS Encryption Telemetry Ledger',
            canonicalFileNaming: `${companyClean}_BACKUP_SNAPSHOT_LEDGER_${year}_\${MONTH}.json`,
            generatingStep: 'Step 1.0 & Step 2.0',
            custodianRole: 'DevOps & Infrastructure Architect',
            storageTarget: 'CloudTrail S3 Archive & Skanda Evidence Registry',
            retentionPeriodSla: '7 Years',
            cryptographicIntegritySeal: 'SHA-256 Digest Seal with AWS CloudTrail Integrity Validation',
            auditorInspectionMethod: 'Auditor verifies AWS CloudTrail digest validation to ensure zero missing daily snapshots.'
          }
        ]
      };

    default:
      // Dynamically generate formal TÜV SOP structure for any other procedure or policy
      return generateDynamicTuvSopStructure(docCode, ctx);
  }
}

/**
 * Dynamically synthesizes a complete TÜV-standard SOP structure for any policy or procedure code.
 */
function generateDynamicTuvSopStructure(
  docCode: string,
  ctx: Partial<PolicyTemplateContext> & { companyName: string }
): FormalTuvSopStructure {
  const code = docCode.toUpperCase().trim();
  const companyClean = ctx.companyName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase();
  const year = new Date().getFullYear();

  return {
    sopCode: code,
    sopTitle: `${code} Standard Operating Procedure (Work Instruction)`,
    tuvAuditStandard: 'TÜV SÜD / ISO/IEC 27001:2022 Clause 8.1 & ISO 19011:2018 §B.3',
    fourEyesPrincipleEnforced: true,
    processTriggers: [
      {
        triggerId: `TRG-${code.replace(/[^a-zA-Z0-9]/g, '')}-01`,
        triggerName: 'Operational Event & Baseline Exception Trigger',
        category: 'AUTOMATED_ALERT',
        detectionSystem: `${ctx.cloudProvider} Telemetry / SIEM / Skanda GRC Continuous Monitor`,
        initiatingRole: 'Designated Operational Custodian / SecOps Lead',
        slaToInitiate: '<= 30 Minutes',
        entryCondition: `Operational telemetry or ticket indicates requirement for formal execution of ${code}.`,
        escalationIfMissed: 'Automated notification to CISO if procedure is unacknowledged within 1 hour.'
      },
      {
        triggerId: `TRG-${code.replace(/[^a-zA-Z0-9]/g, '')}-02`,
        triggerName: 'Scheduled Governance & Compliance Review Cadence',
        category: 'SCHEDULED_CADENCE',
        detectionSystem: 'Skanda GRC Annual ISMS Calendar Scheduler',
        initiatingRole: 'Compliance Officer & ISMS Working Group',
        slaToInitiate: 'Annual / Bi-Annual Cycle',
        entryCondition: 'Mandatory periodic operational effectiveness sampling and control verification.',
        escalationIfMissed: 'Overdue audit finding automatically logged in CAPA module.'
      },
      {
        triggerId: `TRG-${code.replace(/[^a-zA-Z0-9]/g, '')}-03`,
        triggerName: 'Regulatory, Legal or Contractual Audit Notice',
        category: 'STATUTORY_NOTIFICATION',
        detectionSystem: 'External Audit Notification / Regulatory Filing Notice',
        initiatingRole: 'Chief Information Security Officer (CISO) & Legal Counsel',
        slaToInitiate: '<= 24 Hours from Notice',
        entryCondition: 'Formal receipt of external audit scope from accredited certification body (TÜV / BSI).',
        escalationIfMissed: 'Executive Board briefing convened within 48 hours.'
      }
    ],
    numberedExecutionSteps: [
      {
        stepNumber: '1.0',
        phase: 'Intake & Requirement Validation',
        stepTitle: 'Operational Intake, Authorization & Scope Verification',
        responsibleRole: 'Operational Custodian',
        actionSummary: `Verify operational prerequisites, valid authorization ticket, and scope applicability under ${code}.`,
        detailedInstructions: [
          'Confirm operational request has been formally logged in Jira Service Management with clear business rationale.',
          'Verify that all requesting personnel possess active authenticated identity in corporate IdP.',
          'Review applicable policy constraints and baseline security parameters before proceeding.'
        ],
        timeframeSla: '<= 1 Hour',
        toolchainOrConsole: 'Jira Service Management / Identity Provider Console',
        inputDependencies: ['Authorized Request Ticket', 'Requester Identity Verification'],
        dualControlGateId: 'GATE-DC-01'
      },
      {
        stepNumber: '2.0',
        phase: 'Technical Execution',
        stepTitle: 'Procedural Implementation & Guardrail Application',
        responsibleRole: 'Lead Systems Specialist / SecOps Engineer',
        actionSummary: 'Execute standardized procedural tasks following hardened configurations and baseline parameters.',
        detailedInstructions: [
          'Execute procedural technical workflow in staging or production using approved tooling and scripts.',
          'Apply least privilege permissions; ensure all configuration modifications adhere to approved templates.',
          'Capture step-by-step console outputs and CLI logs with timestamped session verification.'
        ],
        timeframeSla: '<= 2 Hours',
        toolchainOrConsole: `${ctx.cloudProvider} Console / CLI / Skanda Management Workbench`,
        inputDependencies: ['Step 1.0 Authorization Passed'],
        dualControlGateId: 'GATE-DC-02'
      },
      {
        stepNumber: '3.0',
        phase: 'Verification & Quality Check',
        stepTitle: 'Independent Verification, Testing & Evidence Collection',
        responsibleRole: 'Independent Quality Reviewer',
        actionSummary: 'Execute independent quality check and verify that all security baselines remain unbroken.',
        detailedInstructions: [
          'Verify execution output against expected criteria and quantitative SLA baselines.',
          'Confirm that no undocumented exceptions or security regressions have been introduced.',
          'Collect verifiable operational evidence artifacts and compile into standardized submission dossier.'
        ],
        timeframeSla: '<= 1 Hour post-execution',
        toolchainOrConsole: 'Automated Test Harness / Skanda GRC Verification Suite',
        inputDependencies: ['Step 2.0 Execution Complete']
      },
      {
        stepNumber: '4.0',
        phase: 'Closure & Record Archival',
        stepTitle: 'Cryptographic Hashing, Record Registration & Formal Closure',
        responsibleRole: 'CISO Delegate & Document Controller',
        actionSummary: 'Calculate SHA-256 digest of resulting artifacts, register in evidence repository, and close ticket.',
        detailedInstructions: [
          'Calculate SHA-256 hash of all generated documentation and evidence output files.',
          'Upload artifacts to WORM-compliant storage with statutory retention tags.',
          'Update procedure execution log in Skanda GRC and notify all stakeholders of successful completion.'
        ],
        timeframeSla: '<= 24 Hours',
        toolchainOrConsole: 'Skanda Evidence Locker / AWS S3 WORM Vault',
        inputDependencies: ['Step 3.0 Verification Certified']
      }
    ],
    dualControlVerificationGates: [
      {
        gateId: 'GATE-DC-01',
        gateTitle: 'Pre-Execution Operational Authorization Gate (Four-Eyes Principle)',
        precedingStep: 'Step 1.0',
        primaryVerifierRole: 'Operational Requester / Systems Engineer',
        secondaryVerifierRole: 'Designated Approving Manager / CISO Delegate',
        verificationCriteria: [
          'Business justification verified against approved ISMS objectives.',
          'Risk assessment completed if action involves elevated privileges or production configuration changes.',
          'Both parties are distinct verified identities in the corporate identity system.'
        ],
        enforcementMechanism: 'Skanda Digital Signature Workflow with Hardware-backed FIDO2 challenge.',
        auditEvidenceProduced: 'Timestamped dual-approval log record with cryptographic public key signatures.',
        zeroBypassRule: 'Self-authorization is strictly prohibited; any attempted bypass triggers immediate SOC alert.'
      },
      {
        gateId: 'GATE-DC-02',
        gateTitle: 'Post-Execution Technical Verification & Closure Gate',
        precedingStep: 'Step 2.0 & Step 3.0',
        primaryVerifierRole: 'Executing Specialist',
        secondaryVerifierRole: 'Independent Auditor / Security Operations Lead',
        verificationCriteria: [
          'All procedural steps executed to completion with zero undocumented anomalies.',
          'Evidence artifacts generated and cryptographic SHA-256 digest validated.',
          'Operational status confirmed conforming with ISO/IEC 27001:2022 standards.'
        ],
        enforcementMechanism: 'Immutable Jira / Skanda GRC Ticket State Lock requiring dual digital signatures.',
        auditEvidenceProduced: 'Signed Attestation Certificate registered in immutable audit ledger.',
        zeroBypassRule: 'Single-party closure is programmatically rejected by the workflow engine.'
      }
    ],
    outputArtifacts: [
      {
        artifactId: `ART-${code.replace(/[^a-zA-Z0-9]/g, '')}-01`,
        artifactTitle: `${code} Operational Execution & Verification Dossier`,
        canonicalFileNaming: `${companyClean}_${code.replace(/[^a-zA-Z0-9]/g, '_')}_${year}_\${EXEC_ID}_EVIDENCE.pdf`,
        generatingStep: 'Step 3.0 & Step 4.0',
        custodianRole: 'Lead Operational Specialist & CISO Delegate',
        storageTarget: 'AWS S3 WORM Compliance Bucket (s3://skanda-audit-evidence/sops/)',
        retentionPeriodSla: '7 Years (ISO 27001 Clause 7.5 & Statutory Requirement)',
        cryptographicIntegritySeal: 'SHA-256 Digest Seal with Dual-Signer Verification Token',
        auditorInspectionMethod: 'ISO 19011:2018 §B.3 Inspection of random sample with cryptographic checksum verification.'
      },
      {
        artifactId: `ART-${code.replace(/[^a-zA-Z0-9]/g, '')}-02`,
        artifactTitle: `${code} Dual-Control Verification Sign-off Attestation`,
        canonicalFileNaming: `${companyClean}_${code.replace(/[^a-zA-Z0-9]/g, '_')}_DUAL_CONTROL_SIGN_${year}.json`,
        generatingStep: 'Step 1.0 & Step 4.0',
        custodianRole: 'Quality Assurance & Compliance Lead',
        storageTarget: 'Skanda GRC Immutable Audit Ledger',
        retentionPeriodSla: '7 Years',
        cryptographicIntegritySeal: 'SHA-256 Digest with Multi-Party Public Key Signatures',
        auditorInspectionMethod: 'Auditor validates public key signatures against corporate PKI ledger.'
      }
    ]
  };
}

/**
 * Formats formal TÜV SOP structure into markdown for Confluence, Git, or audit workpapers.
 */
export function formatTuvSopToMarkdown(sop: FormalTuvSopStructure, companyName: string): string {
  return `## Formal TÜV Standard Operating Procedure (SOP) Specification
**Standard:** ${sop.tuvAuditStandard}
**Four-Eyes Principle:** ${sop.fourEyesPrincipleEnforced ? 'ENFORCED (Zero Self-Approval Mandate)' : 'OPTIONAL'}

---

### 1. Process Triggers Matrix
The following operational, scheduled, or threshold triggers mandate the execution of this procedure:

| Trigger ID | Trigger Name & Category | Detection System | Initiating Role | Response SLA | Entry Condition Threshold |
|:---|:---|:---|:---|:---:|:---|
${sop.processTriggers
  .map(
    t =>
      `| **${t.triggerId}** | ${t.triggerName} \`[${t.category}]\` | ${t.detectionSystem} | ${t.initiatingRole} | \`${t.slaToInitiate}\` | ${t.entryCondition} |`
  )
  .join('\n')}

---

### 2. Numbered Execution Steps Runbook
All actions must be executed sequentially pursuant to the operational runbook below:

${sop.numberedExecutionSteps
  .map(
    s => `#### Step ${s.stepNumber}: ${s.stepTitle}
- **Phase:** \`${s.phase}\` | **Responsible Role:** **${s.responsibleRole}** | **Timeframe SLA:** \`${s.timeframeSla}\`
- **Toolchain / Console:** ${s.toolchainOrConsole}
- **Prerequisites / Input Dependencies:** ${s.inputDependencies.join(', ')}
${s.dualControlGateId ? `- **Dual-Control Gate:** \`[${s.dualControlGateId}]\` *(Requires secondary verifier approval)*` : ''}
- **Action Summary:** ${s.actionSummary}
- **Operational Guidelines & CLI Commands:**
${s.detailedInstructions.map(inst => `  1. ${inst}`).join('\n')}
${s.failureContingency ? `- **Contingency / Rollback:** *${s.failureContingency}*` : ''}
`
  )
  .join('\n---\n\n')}

---

### 3. Dual-Control Verification Gates (Four-Eyes Principle)
Under TÜV accreditation standards, critical transitions require verified dual authorization with zero tolerance for self-approval:

| Gate ID | Verification Gate Title | Preceding Step | Primary Verifier | Secondary Verifier | Enforcement Mechanism |
|:---|:---|:---:|:---|:---|:---|
${sop.dualControlVerificationGates
  .map(
    g =>
      `| **${g.gateId}** | ${g.gateTitle} | \`${g.precedingStep}\` | **${g.primaryVerifierRole}** | **${g.secondaryVerifierRole}** | ${g.enforcementMechanism} |`
  )
  .join('\n')}

#### Detailed Gate Pass Criteria & Zero-Bypass Rules:
${sop.dualControlVerificationGates
  .map(
    g => `##### ${g.gateId}: ${g.gateTitle}
- **Primary Verifier:** ${g.primaryVerifierRole}
- **Secondary Verifier:** ${g.secondaryVerifierRole}
- **Verification Checklist:**
${g.verificationCriteria.map(crit => `  - [x] ${crit}`).join('\n')}
- **Audit Evidence Produced:** ${g.auditEvidenceProduced}
- **Zero-Bypass Mandate:** *${g.zeroBypassRule}*
`
  )
  .join('\n')}

---

### 4. Explicit Output Artifact Definitions & Evidence Ledger
Every execution of this SOP produces immutable, auditable artifacts archived for lead auditor inspection:

| Artifact ID | Artifact Title | Canonical File Naming Standard | Custodian Role | Storage Target & SLA | Integrity Seal |
|:---|:---|:---|:---|:---|:---|
${sop.outputArtifacts
  .map(
    a =>
      `| **${a.artifactId}** | ${a.artifactTitle} | \`${a.canonicalFileNaming}\` | ${a.custodianRole} | ${a.storageTarget} (${a.retentionPeriodSla}) | \`${a.cryptographicIntegritySeal}\` |`
  )
  .join('\n')}

#### Auditor Inspection Methodology:
${sop.outputArtifacts
  .map(
    a => `- **${a.artifactId} (${a.artifactTitle}):** ${a.auditorInspectionMethod}`
  )
  .join('\n')}
`;
}

/**
 * Enriches a GeneratedDocument with formal TÜV SOP pages, table of contents, and sopStructure.
 */
export function enrichDocumentWithTuvSop(
  doc: GeneratedDocument,
  ctx: PolicyTemplateContext
): GeneratedDocument {
  const sop = getFormalTuvSopStructure(doc.docCode, ctx);
  const existingPages = doc.pages ? [...doc.pages] : [];
  const startPage = (existingPages.length || 3) + 1;

  // Build formal pages for TÜV SOP structure
  const sopPages: GeneratedDocument['pages'] = [
    {
      pageNumber: startPage,
      title: 'TÜV SOP Specification: Process Triggers & Numbered Execution Steps',
      content: `Standard: ${sop.tuvAuditStandard}\nFour-Eyes Principle: ${sop.fourEyesPrincipleEnforced ? 'ENFORCED (Zero Self-Approval)' : 'OPTIONAL'}`,
      sections: [
        {
          heading: '1. Process Triggers Matrix (ISO/IEC 27001:2022 Clause 8.1)',
          table: {
            headers: ['Trigger ID', 'Trigger Name & Category', 'Detection System', 'Initiating Role', 'SLA', 'Entry Condition Threshold'],
            rows: sop.processTriggers.map(t => [
              t.triggerId,
              `${t.triggerName} [${t.category}]`,
              t.detectionSystem,
              t.initiatingRole,
              t.slaToInitiate,
              t.entryCondition
            ])
          }
        },
        {
          heading: '2. Numbered Execution Steps (Granular Runbook)',
          table: {
            headers: ['Step No.', 'Phase & Title', 'Responsible Role', 'Timeframe SLA', 'Toolchain / Console', 'Dual-Control Gate'],
            rows: sop.numberedExecutionSteps.map(s => [
              `Step ${s.stepNumber}`,
              `[${s.phase}] ${s.stepTitle}`,
              s.responsibleRole,
              s.timeframeSla,
              s.toolchainOrConsole,
              s.dualControlGateId ? `GATE: ${s.dualControlGateId}` : 'Single Operator'
            ])
          }
        }
      ]
    },
    {
      pageNumber: startPage + 1,
      title: 'TÜV SOP Specification: Dual-Control Verification Gates & Output Artifacts',
      content: 'Independent verification gates enforcing the Four-Eyes Principle and auditable output artifact definitions.',
      sections: [
        {
          heading: '3. Dual-Control Verification Gates (Four-Eyes Principle)',
          table: {
            headers: ['Gate ID', 'Gate Title', 'Primary Verifier', 'Secondary Verifier', 'Enforcement Mechanism', 'Zero-Bypass Rule'],
            rows: sop.dualControlVerificationGates.map(g => [
              g.gateId,
              g.gateTitle,
              g.primaryVerifierRole,
              g.secondaryVerifierRole,
              g.enforcementMechanism,
              g.zeroBypassRule
            ])
          }
        },
        {
          heading: '4. Output Artifacts Definitions & Evidence Storage Ledger',
          table: {
            headers: ['Artifact ID', 'Artifact Title', 'Canonical Naming Standard', 'Storage Target & Retention', 'Auditor Verification Method'],
            rows: sop.outputArtifacts.map(a => [
              a.artifactId,
              a.artifactTitle,
              a.canonicalFileNaming,
              `${a.storageTarget} (${a.retentionPeriodSla})`,
              a.auditorInspectionMethod
            ])
          }
        }
      ]
    }
  ];

  const sopMarkdown = formatTuvSopToMarkdown(sop, ctx.companyName);

  return {
    ...doc,
    sopStructure: sop,
    content: `${doc.content || ''}\n\n---\n\n${sopMarkdown}`,
    tableOfContents: [
      ...(doc.tableOfContents || []),
      {
        title: 'TÜV SOP Specification: Process Triggers & Runbook Steps',
        pageNo: startPage,
        level: 1
      },
      {
        title: 'TÜV SOP Specification: Dual-Control Gates & Output Artifacts',
        pageNo: startPage + 1,
        level: 1
      }
    ],
    pages: [...existingPages, ...sopPages]
  };
}
