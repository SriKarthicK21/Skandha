// Authoritative Master Data for MAS TRM Section 15 Supervisory Inspection Dossiers
// Formatted according to MAS Technology Risk Supervision Department (TRSD) Inspection Protocols

export interface MASDossierArtifact {
  id: string;
  title: string;
  category: 'POLICY' | 'SOP' | 'EVIDENCE_POOL' | 'AUDIT_CAPA' | 'STATUTORY_CROSSWALK';
  documentNumber: string;
  version: string;
  effectiveDate: string;
  boardApprovalDate: string;
  boardMinuteRef: string;
  classification: 'RESTRICTED - AUDIT DEFENSE' | 'CONFIDENTIAL' | 'STRICTLY CONFIDENTIAL';
  owner: string;
  reviewCycle: string;
  executiveSummary: string;
  masCitations: string[];
  content: {
    policyStatements?: string[];
    sopSteps?: Array<{ step: number; name: string; role: string; verificationCriteria: string }>;
    sampleEvidence?: Array<{
      sampleId: string;
      artifactName: string;
      systemSource: string;
      timestamp: string;
      hashSHA256: string;
      status: 'VERIFIED' | 'ACCEPTABLE' | 'EXCEPTION_REMEDIATED';
      auditorNotes: string;
    }>;
    auditFindings?: Array<{
      findingId: string;
      title: string;
      severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
      auditDate: string;
      leadAuditor: string;
      observation: string;
      rootCause: string;
      managementResponse: string;
      capaDueDate: string;
      status: 'OPEN_IN_PROGRESS' | 'RE_TESTED_CLOSED';
    }>;
  };
}

export interface MASDomainDossier {
  domainId: string;
  domainNumber: string;
  domainName: string;
  masGuidelineRef: string;
  inspectionQuestionnaireId: string;
  leadSupervisoryObjective: string;
  policy: MASDossierArtifact;
  sop: MASDossierArtifact;
  evidencePool: MASDossierArtifact;
  auditCapa: MASDossierArtifact;
}

export const MAS_SUPERVISORY_DOSSIERS: Record<string, MASDomainDossier> = {
  'MAS-DOM-09': {
    domainId: 'MAS-DOM-09',
    domainNumber: '9.0',
    domainName: 'Access Control and Privileged Account Security',
    masGuidelineRef: 'MAS TRM Guidelines Section 9.1 - 9.3 & Notice 655 Requirement 1',
    inspectionQuestionnaireId: 'MAS-INSPECT-Q-AC-09',
    leadSupervisoryObjective: 'Verify that privileged accounts are strictly governed, standing root privileges are eliminated, MFA is enforced for all administrators, and regular access recertifications occur quarterly.',
    policy: {
      id: 'POL-MAS-09',
      title: 'Enterprise Access Control & Privileged Access Management Policy',
      category: 'POLICY',
      documentNumber: 'POL-SEC-2026-09',
      version: 'v3.2',
      effectiveDate: '2026-01-15',
      boardApprovalDate: '2026-02-10',
      boardMinuteRef: 'BRC-2026-MIN-02.4',
      classification: 'CONFIDENTIAL',
      owner: 'Chief Information Security Officer (CISO)',
      reviewCycle: 'Annual (Mandatory BRC Re-affirmation)',
      executiveSummary: 'Defines enterprise requirements for identification, authentication, authorization, zero standing privileges, multi-factor authentication (MFA), and quarterly user access reviews across all Tier-1 infrastructure and banking applications.',
      masCitations: [
        'MAS TRM Guidelines 9.1.1 (Principles of least privilege and need-to-know)',
        'MAS TRM Guidelines 9.2.1 (Privileged account governance and session logging)',
        'MAS Notice 655 Paragraph 3(1)(a) (Mandatory MFA for administrative accounts)'
      ],
      content: {
        policyStatements: [
          'All administrative and privileged access must enforce phishing-resistant Multi-Factor Authentication (FIDO2 / Hardware Token) prior to session initiation.',
          'Zero Standing Privileges (ZSP) principle: Permanent domain administrator, root, or cloud Owner roles are strictly prohibited in production environments.',
          'Just-In-Time (JIT) access grants must not exceed a maximum duration of 4 hours and require documented business justification and ticket linkage.',
          'Formal user access reviews (UAR) must be conducted at least quarterly for all critical systems, and semi-annually for standard systems.',
          'Privileged sessions on Critical Information Systems (CIS) must be cryptographically recorded, time-stamped, and indexed for independent audit inspection.'
        ]
      }
    },
    sop: {
      id: 'SOP-MAS-09',
      title: 'Standard Operating Procedure: Privileged Credential Vaulting & JIT Access Granting',
      category: 'SOP',
      documentNumber: 'SOP-SEC-2026-09-01',
      version: 'v2.4',
      effectiveDate: '2026-01-20',
      boardApprovalDate: '2026-02-10',
      boardMinuteRef: 'BRC-2026-MIN-02.4',
      classification: 'CONFIDENTIAL',
      owner: 'Head of Cyber Operations & IAM Lead',
      reviewCycle: 'Semi-Annual',
      executiveSummary: 'Step-by-step procedural workflow for privileged access requests, dual-authorization approval, automated ephemeral credential dispensing, and session termination.',
      masCitations: ['MAS TRM Guidelines 9.2.2', 'MAS TRM Guidelines 9.2.3'],
      content: {
        sopSteps: [
          {
            step: 1,
            name: 'Access Request Initiation',
            role: 'DevOps / SRE Engineer',
            verificationCriteria: 'Engineer submits request via PAM portal referencing approved Jira/ServiceNow ticket ID with defined window.'
          },
          {
            step: 2,
            name: 'Dual-Authorization ("Four-Eyes") Verification',
            role: 'Infra Lead / Duty Security Manager',
            verificationCriteria: 'Secondary approver verifies change window validity, CAB approval status, and approves via push-MFA.'
          },
          {
            step: 3,
            name: 'Automated Ephemeral Credential Injection',
            role: 'Enterprise PAM Vault',
            verificationCriteria: 'Vault injects short-lived certificate (TTL 120 mins). Master root password rotated automatically after disconnect.'
          },
          {
            step: 4,
            name: 'Cryptographic Session Archival',
            role: 'SOC Log Collector',
            verificationCriteria: 'Video and keystroke logs streamed to WORM-compliant cloud storage with SHA-256 integrity hash verification.'
          }
        ]
      }
    },
    evidencePool: {
      id: 'EV-POOL-MAS-09',
      title: 'Statutory Evidence Pool: Access Control Verification Artifacts',
      category: 'EVIDENCE_POOL',
      documentNumber: 'EVD-PACK-2026-Q3-09',
      version: 'v1.0',
      effectiveDate: '2026-09-15',
      boardApprovalDate: '2026-09-20',
      boardMinuteRef: 'BRC-2026-MIN-09.2',
      classification: 'RESTRICTED - AUDIT DEFENSE',
      owner: 'GRC Compliance & Audit Defense Lead',
      reviewCycle: 'Quarterly',
      executiveSummary: 'Curated pool of verifiable artifacts demonstrating real operational compliance with privileged access, quarterly UAR, and termination revocation.',
      masCitations: ['MAS TRM Guidelines 9.1.5', 'MAS TRM Guidelines 9.2.4'],
      content: {
        sampleEvidence: [
          {
            sampleId: 'EVD-AC-2026-01',
            artifactName: 'Q2 2026 Privileged User Access Recertification Sign-off Pack',
            systemSource: 'SailPoint / Okta Identity Governance',
            timestamp: '2026-06-30T16:00:00Z',
            hashSHA256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
            status: 'VERIFIED',
            auditorNotes: '100% of 142 privileged entitlements reviewed and approved by business unit heads. 4 dormant accounts revoked.'
          },
          {
            sampleId: 'EVD-AC-2026-02',
            artifactName: 'Core Banking Production Database Firecall Session Log & Keystroke Audit',
            systemSource: 'CyberArk Privileged Session Manager',
            timestamp: '2026-08-14T02:15:33Z',
            hashSHA256: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
            status: 'VERIFIED',
            auditorNotes: 'Emergency schema index addition under INC-2026-0914. Dual approval recorded and session expired at 118 mins.'
          },
          {
            sampleId: 'EVD-AC-2026-03',
            artifactName: '24-Hour Leaver Deprovisioning Audit Reconciliation Report',
            systemSource: 'Workday HRMS vs Active Directory / AWS IAM',
            timestamp: '2026-08-31T23:59:00Z',
            hashSHA256: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
            status: 'VERIFIED',
            auditorNotes: '12 departed employees in August 2026. All accounts terminated in <= 4.2 hours of HR effective departure timestamp.'
          }
        ]
      }
    },
    auditCapa: {
      id: 'AUD-MAS-09',
      title: 'Internal IT Audit Report & Remediation Ledger (Access Control)',
      category: 'AUDIT_CAPA',
      documentNumber: 'IAR-2026-SEC-03',
      version: 'Final Published',
      effectiveDate: '2026-07-15',
      boardApprovalDate: '2026-08-12',
      boardMinuteRef: 'BRC-2026-MIN-08.1',
      classification: 'CONFIDENTIAL',
      owner: 'Head of Internal IT Audit (CISA)',
      reviewCycle: 'Semi-Annual',
      executiveSummary: 'Internal audit evaluation of privileged credential management, cloud IAM roles, and multi-factor authentication adherence.',
      masCitations: ['MAS TRM Guidelines 15.1.1', 'MAS TRM Guidelines 9.2.1'],
      content: {
        auditFindings: [
          {
            findingId: 'FIND-AC-2026-01',
            title: 'Absence of Automated Inactivity Timeout on Non-Prod Kubernetes Dashboard',
            severity: 'MEDIUM',
            auditDate: '2026-07-01',
            leadAuditor: 'Grace Tan (CISA, Lead IT Auditor)',
            observation: 'Testing revealed staging cluster dashboard session tokens remained valid for 72 hours without active re-authentication.',
            rootCause: 'Default helm chart configuration values were not overridden in non-production Terraform variables.',
            managementResponse: 'Configured token expiration to 60 minutes across all staging and testing clusters via unified ConfigMap.',
            capaDueDate: '2026-08-15',
            status: 'RE_TESTED_CLOSED'
          }
        ]
      }
    }
  },
  'MAS-DOM-08': {
    domainId: 'MAS-DOM-08',
    domainNumber: '8.0',
    domainName: 'IT Resilience, BCM and Critical Systems Availability',
    masGuidelineRef: 'MAS TRM Guidelines Section 8.1 - 8.5 & Notice 644 Availability Limit',
    inspectionQuestionnaireId: 'MAS-INSPECT-Q-RES-08',
    leadSupervisoryObjective: 'Verify that Critical Information Systems (CIS) maintain unscheduled downtime < 4 hours per rolling 12 months, RTO <= 4h, RPO <= 1h, and annual live disaster recovery cutovers are verified.',
    policy: {
      id: 'POL-MAS-08',
      title: 'IT Business Continuity Management & Resilience Policy',
      category: 'POLICY',
      documentNumber: 'POL-BCM-2026-08',
      version: 'v4.0',
      effectiveDate: '2026-01-10',
      boardApprovalDate: '2026-02-10',
      boardMinuteRef: 'BRC-2026-MIN-02.3',
      classification: 'CONFIDENTIAL',
      owner: 'Chief Technology Officer & Head of BCM',
      reviewCycle: 'Annual',
      executiveSummary: 'Defines availability architecture, maximum unscheduled downtime thresholds, disaster recovery objectives (RTO <= 4h, RPO <= 1h), and mandatory live test schedules.',
      masCitations: [
        'MAS TRM Guidelines 8.1.1 (Elimination of Single Points of Failure)',
        'MAS TRM Guidelines 8.2.1 (System recoverability within 4-hour RTO and 1-hour RPO)',
        'MAS Notice 644 (Maximum 4 hours unscheduled downtime per rolling 12 months)'
      ],
      content: {
        policyStatements: [
          'All Critical Information Systems (CIS) must be engineered with high availability and active-active or hot-standby redundancy to eliminate Single Points of Failure (SPoF).',
          'Unscheduled downtime for any CIS must not exceed 4 hours in any rolling 12-month period, subject to statutory Notice 644 reporting.',
          'Disaster Recovery (DR) testing for all CIS must be conducted at least annually under realistic production traffic cutover conditions.',
          'Data backup must follow the 3-2-1 rule with immutable, air-gapped, or WORM copies stored in an independent secondary geographical availability zone.'
        ]
      }
    },
    sop: {
      id: 'SOP-MAS-08',
      title: 'Standard Operating Procedure: Disaster Recovery Live Cutover & Failback Protocol',
      category: 'SOP',
      documentNumber: 'SOP-BCM-2026-08-01',
      version: 'v3.1',
      effectiveDate: '2026-02-01',
      boardApprovalDate: '2026-02-10',
      boardMinuteRef: 'BRC-2026-MIN-02.3',
      classification: 'CONFIDENTIAL',
      owner: 'Head of Infrastructure & Site Reliability Engineering (SRE)',
      reviewCycle: 'Annual',
      executiveSummary: 'Detailed runbook for triggering DNS failover, database replica promotion, transaction checksum validation, and rollback verification.',
      masCitations: ['MAS TRM Guidelines 8.3.1', 'MAS TRM Guidelines 8.3.2'],
      content: {
        sopSteps: [
          {
            step: 1,
            name: 'Disaster Declaration & Command Bridge Activation',
            role: 'Incident Commander / CTO',
            verificationCriteria: 'Formal declaration within 15 minutes of primary DC loss; all response leads present on encrypted war-room.'
          },
          {
            step: 2,
            name: 'Database Failover & Replication Consistency Check',
            role: 'Lead Database Administrator',
            verificationCriteria: 'Secondary replica promoted to primary; transaction log gap confirmed <= 1 minute (verifying RPO <= 1h).'
          },
          {
            step: 3,
            name: 'Global Traffic Rerouting (Anycast / Route53)',
            role: 'Cloud Network Engineer',
            verificationCriteria: 'DNS TTL flushed; ingress traffic redirected to Secondary Availability Zone; synthetic health checks 100% green.'
          },
          {
            step: 4,
            name: 'Business Verification & Stop-Watch Sign-off',
            role: 'Independent Business Witness / Audit Observer',
            verificationCriteria: 'Mock payment and deposit transactions completed successfully. Elapsed cutover time officially stamped <= 4 hours.'
          }
        ]
      }
    },
    evidencePool: {
      id: 'EV-POOL-MAS-08',
      title: 'Statutory Evidence Pool: IT Resilience & Disaster Recovery Verification',
      category: 'EVIDENCE_POOL',
      documentNumber: 'EVD-PACK-2026-Q3-08',
      version: 'v1.0',
      effectiveDate: '2026-08-20',
      boardApprovalDate: '2026-09-10',
      boardMinuteRef: 'BRC-2026-MIN-09.1',
      classification: 'RESTRICTED - AUDIT DEFENSE',
      owner: 'Head of SRE & BCM',
      reviewCycle: 'Semi-Annual',
      executiveSummary: 'Verifiable test execution records, stop-watch logs, data checksum reports, and rolling downtime ledgers.',
      masCitations: ['MAS TRM Guidelines 8.3.3', 'MAS Notice 644'],
      content: {
        sampleEvidence: [
          {
            sampleId: 'EVD-RES-2026-01',
            artifactName: 'Annual Live Production DR Cutover Test Report (Core Banking)',
            systemSource: 'Datadog & CloudWatch DR Telemetry Suite',
            timestamp: '2026-07-22T04:30:00Z',
            hashSHA256: '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae',
            status: 'VERIFIED',
            auditorNotes: 'Actual measured RTO: 34 minutes (Threshold <= 240 mins). Actual measured RPO: 0 seconds (Synchronous replication). Independent audit observer signed off.'
          },
          {
            sampleId: 'EVD-RES-2026-02',
            artifactName: 'Rolling 12-Month Cumulative CIS Unscheduled Downtime Ledger',
            systemSource: 'PagerDuty & ServiceNow Outage Ledger',
            timestamp: '2026-09-01T00:00:00Z',
            hashSHA256: 'fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa',
            status: 'VERIFIED',
            auditorNotes: 'Core Banking: 18 mins / 240 mins (92.5% safety buffer). Fast Gateway: 0 mins. No statutory breach under Notice 644.'
          },
          {
            sampleId: 'EVD-RES-2026-03',
            artifactName: 'Air-Gapped Immutable Backup Restoration Verification Log',
            systemSource: 'AWS Backup Vault Lock / Veeam Immutable Storage',
            timestamp: '2026-08-10T11:20:00Z',
            hashSHA256: 'd4735e3a265e16eee03f59718b9b5d03019c07d8b6c51f90da3a666eec13ab35',
            status: 'VERIFIED',
            auditorNotes: 'Full restore of 8.4 TB customer transactional database to isolated sandbox completed in 2 hours 15 minutes.'
          }
        ]
      }
    },
    auditCapa: {
      id: 'AUD-MAS-08',
      title: 'Internal IT Audit Report & Remediation Ledger (IT Resilience)',
      category: 'AUDIT_CAPA',
      documentNumber: 'IAR-2026-BCM-01',
      version: 'Final Published',
      effectiveDate: '2026-08-01',
      boardApprovalDate: '2026-08-12',
      boardMinuteRef: 'BRC-2026-MIN-08.1',
      classification: 'CONFIDENTIAL',
      owner: 'Lead IT Resilience Auditor (CISA)',
      reviewCycle: 'Annual',
      executiveSummary: 'Comprehensive assessment of DR cutover procedures, power redundancy at secondary data facility, and recovery SLA validation.',
      masCitations: ['MAS TRM Guidelines 8.5.1', 'MAS TRM Guidelines 15.1.1'],
      content: {
        auditFindings: [
          {
            findingId: 'FIND-RES-2026-01',
            title: 'Secondary Data Center Fuel Contract SLA Clarification',
            severity: 'LOW',
            auditDate: '2026-07-28',
            leadAuditor: 'Kenzo Murata (CRISC, Lead Disaster Recovery Auditor)',
            observation: 'Secondary data center diesel generator SLA guaranteed fuel replenishment within 8 hours; MAS guidance recommends continuous runtime guarantee of at least 48 hours on-site.',
            rootCause: 'Vendor contract amendment was pending annual procurement renegotiation.',
            managementResponse: 'Executed supplemental SLA rider with facility provider guaranteeing 72 hours of on-site reserved fuel reserves.',
            capaDueDate: '2026-09-30',
            status: 'RE_TESTED_CLOSED'
          }
        ]
      }
    }
  },
  'MAS-DOM-12': {
    domainId: 'MAS-DOM-12',
    domainNumber: '12.0',
    domainName: 'Cyber Security Operations & 24/7 Threat Telemetry',
    masGuidelineRef: 'MAS TRM Guidelines Section 12.1 - 12.4',
    inspectionQuestionnaireId: 'MAS-INSPECT-Q-CYBER-12',
    leadSupervisoryObjective: 'Verify 24/7 Security Operations Centre (SOC) monitoring capabilities, threat intelligence integration with FS-ISAC, automated log retention for at least 12 months, and tested Cyber Incident Response Plans.',
    policy: {
      id: 'POL-MAS-12',
      title: 'Cyber Security Operations & Threat Monitoring Policy',
      category: 'POLICY',
      documentNumber: 'POL-SOC-2026-12',
      version: 'v3.0',
      effectiveDate: '2026-01-10',
      boardApprovalDate: '2026-02-10',
      boardMinuteRef: 'BRC-2026-MIN-02.5',
      classification: 'CONFIDENTIAL',
      owner: 'Head of Cyber Operations & SOC Director',
      reviewCycle: 'Annual',
      executiveSummary: 'Mandates 24/7 real-time monitoring of all perimeter gateways, server infrastructure, and privileged accounts with automated threat correlation and 12-month log retention.',
      masCitations: [
        'MAS TRM Guidelines 12.1.1 (Continuous Cyber Threat Intelligence & Sharing)',
        'MAS TRM Guidelines 12.2.1 (24/7 Security Operations Centre monitoring)',
        'MAS TRM Guidelines 12.3.1 (Centralized audit log retention for at least 12 months)'
      ],
      content: {
        policyStatements: [
          'Security telemetry must be ingested into the centralized SIEM/XDR platform 24 hours a day, 7 days a week, with dedicated Tier-1/Tier-2 analyst coverage.',
          'All security events, authentication attempts, privilege escalations, and system modifications must be retained in an immutable state for a minimum of 12 months (online for 90 days).',
          'Cyber threat intelligence feeds, including Financial Services Information Sharing and Analysis Center (FS-ISAC), must be integrated into threat hunting rules within 24 hours of dissemination.',
          'A Cyber Incident Response Plan (CIRP) must be tested at least annually via tabletop exercises and adversarial simulations.'
        ]
      }
    },
    sop: {
      id: 'SOP-MAS-12',
      title: 'Standard Operating Procedure: High-Severity Cyber Alert Triage & Containment',
      category: 'SOP',
      documentNumber: 'SOP-SOC-2026-12-01',
      version: 'v2.1',
      effectiveDate: '2026-02-15',
      boardApprovalDate: '2026-02-10',
      boardMinuteRef: 'BRC-2026-MIN-02.5',
      classification: 'CONFIDENTIAL',
      owner: 'Lead SOC Incident Handler',
      reviewCycle: 'Semi-Annual',
      executiveSummary: 'Standardized operational procedures for Tier-1 alert qualification, Tier-2 deep investigation, automated host isolation, and forensic memory acquisition.',
      masCitations: ['MAS TRM Guidelines 12.4.1', 'MAS Notice 644'],
      content: {
        sopSteps: [
          {
            step: 1,
            name: 'Alert Detection & Enrichment',
            role: 'Tier-1 SOC Analyst',
            verificationCriteria: 'Alert triaged within 15 minutes of SIEM correlation; automated enrichment with virus total / IP reputation completed.'
          },
          {
            step: 2,
            name: 'Host Isolation & Containment Action',
            role: 'Tier-2 Threat Hunter / EDR Administrator',
            verificationCriteria: 'Endpoint isolated via EDR agent within 30 minutes; network connections severed while preserving forensic telemetry.'
          },
          {
            step: 3,
            name: 'Forensic Triage & Chain-of-Custody Capture',
            role: 'Digital Forensics Specialist',
            verificationCriteria: 'Volatile RAM acquired and raw disk image hashed (SHA-256) prior to remediation re-imaging.'
          },
          {
            step: 4,
            name: 'Notice 644 Incident Notification Evaluation',
            role: 'CISO / Regulatory Compliance Officer',
            verificationCriteria: 'Assess against Notice 644 criteria: if severe/systemic, trigger 1-hour statutory notification clock to MAS.'
          }
        ]
      }
    },
    evidencePool: {
      id: 'EV-POOL-MAS-12',
      title: 'Statutory Evidence Pool: SOC Operations & SIEM Telemetry Verification',
      category: 'EVIDENCE_POOL',
      documentNumber: 'EVD-PACK-2026-Q3-12',
      version: 'v1.0',
      effectiveDate: '2026-09-01',
      boardApprovalDate: '2026-09-10',
      boardMinuteRef: 'BRC-2026-MIN-09.3',
      classification: 'RESTRICTED - AUDIT DEFENSE',
      owner: 'SOC Operations Lead',
      reviewCycle: 'Quarterly',
      executiveSummary: 'Evidence artifacts demonstrating continuous log capture, 24/7 SOC roster compliance, and threat intelligence ingestion.',
      masCitations: ['MAS TRM Guidelines 12.2.2', 'MAS TRM Guidelines 12.3.2'],
      content: {
        sampleEvidence: [
          {
            sampleId: 'EVD-SOC-2026-01',
            artifactName: 'SIEM Log Ingestion Retention & WORM Compliance Audit Certificate',
            systemSource: 'Splunk Enterprise Security / AWS S3 Object Lock',
            timestamp: '2026-08-15T00:00:00Z',
            hashSHA256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
            status: 'VERIFIED',
            auditorNotes: '365-day immutable retention enforced via S3 Object Lock in Compliance Mode. Verified tamper resistance.'
          },
          {
            sampleId: 'EVD-SOC-2026-02',
            artifactName: 'FS-ISAC Threat Advisory Ingestion & YARA Rule Deployment Audit Log',
            systemSource: 'MISP Threat Sharing Platform & CrowdStrike Falcon',
            timestamp: '2026-08-05T14:22:10Z',
            hashSHA256: 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb',
            status: 'VERIFIED',
            auditorNotes: 'Threat bulletin TLP:AMBER ingested and automated blocking rule pushed across 840 production endpoints in 18 minutes.'
          }
        ]
      }
    },
    auditCapa: {
      id: 'AUD-MAS-12',
      title: 'Internal IT Audit Report & Remediation Ledger (SOC & Incident Response)',
      category: 'AUDIT_CAPA',
      documentNumber: 'IAR-2026-SOC-02',
      version: 'Final Published',
      effectiveDate: '2026-07-20',
      boardApprovalDate: '2026-08-12',
      boardMinuteRef: 'BRC-2026-MIN-08.1',
      classification: 'CONFIDENTIAL',
      owner: 'Cyber Audit Specialist (CISSP, CISA)',
      reviewCycle: 'Annual',
      executiveSummary: 'Audit assessment of SOC mean-time-to-detect (MTTD), mean-time-to-respond (MTTR), and cyber tabletop exercise effectiveness.',
      masCitations: ['MAS TRM Guidelines 12.4.2'],
      content: {
        auditFindings: [
          {
            findingId: 'FIND-SOC-2026-01',
            title: 'Annual Cyber Tabletop Exercise Documentation Minor Gap',
            severity: 'LOW',
            auditDate: '2026-07-10',
            leadAuditor: 'Grace Tan (CISA)',
            observation: 'The June 2026 ransomware simulation was successfully executed, but post-exercise action item ownership had not been formally recorded in Jira.',
            rootCause: 'Administrative oversight following the crisis simulation debrief.',
            managementResponse: 'Created dedicated Jira CAPA project with 5 action items assigned to specific owners with 60-day deadlines.',
            capaDueDate: '2026-08-10',
            status: 'RE_TESTED_CLOSED'
          }
        ]
      }
    }
  }
};
