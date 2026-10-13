import { GeneratedDocument } from '../../types';
import { PolicyTemplateContext } from './types';
import { buildAuditorVerificationDossier } from './auditorVerificationHelper';
import { enrichDocumentWithTuvSop } from './sopTemplateEngine';

export function buildSopInc12(ctx: PolicyTemplateContext): GeneratedDocument {
  const { companyName, framework, cloudProvider, cisoName, effectiveDate, defaultControlStatements, defaultRevisionHistory } = ctx;

  const auditorDossier = buildAuditorVerificationDossier({
    docCode: 'SOP-INC-12',
    docTitle: 'Incident Management & Data Breach Escalation Procedure',
    companyName,
    clauseOrAnnexA: 'Annex A.5.24 (Incident Planning) through A.5.28 (Collection of Evidence)',
    riskId: 'RSK-OPS-01',
    statutoryMandate: 'ISO 27001:2022 A.5.24-A.5.28, GDPR Article 33/34, MAS Notice 655',
    artifactName: `${companyName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}_ANNUAL_TABLETOP_INCIDENT_EXERCISE_2026.pdf`,
    samplingProtocol: 'ISO 19011:2018 §B.3 Sample of all Sev-1 and Sev-2 incidents over past 12 months'
  });

  return enrichDocumentWithTuvSop({
    id: 'doc_sop_inc_12',
    docCode: 'SOP-INC-12',
    title: 'Incident Management & Data Breach Escalation Procedure',
    type: 'PROCEDURE',
    category: 'Incident Response & Operations',
    version: '1.0',
    status: 'APPROVED',
    owner: cisoName,
    approver: 'Executive Board / CISO',
    effectiveDate,
    reviewCycle: 'Annual / After Major Incident',
    classification: 'Confidential - Internal ISMS Use Only',
    standard: framework,
    documentOwner: cisoName,
    issuedBy: 'Computer Security Incident Response Team (CSIRT)',
    approvedBy: 'CISO & Legal Counsel',
    acknowledgementCount: 30,
    lastModified: new Date().toISOString(),
    documentControlStatements: defaultControlStatements,
    revisionHistory: defaultRevisionHistory,
    tableOfContents: [
      { title: 'Document Control & Revision Record', pageNo: 2, level: 1 },
      { title: 'Table of Contents', pageNo: 3, level: 1 },
      { title: '1. Purpose & Incident Severity Classification Matrix (Annex A.5.24)', pageNo: 4, level: 1 },
      { title: '2. Enforceable Response SLAs & 6-Phase Incident Response Lifecycle', pageNo: 4, level: 1 },
      { title: '3. Statutory Regulatory Breach Escalation (72-Hour Mandate)', pageNo: 5, level: 1 },
      { title: '4. Chain of Custody, Digital Forensics & Evidence Preservation (Annex A.5.28)', pageNo: 5, level: 1 },
      { title: '5. Post-Incident 5-Whys Root Cause Analysis & CAPA Linkage', pageNo: 6, level: 1 },
      { title: '6. Lead Auditor Stage 2 Incident Verification Dossier & Seal', pageNo: 7, level: 1 }
    ],
    pages: [
      {
        pageNumber: 4,
        title: 'Severity Classification & 6-Phase Lifecycle',
        content: `1. Purpose & Scope (Annex A.5.24)
This procedure defines the operational runbook executed by the Computer Security Incident Response Team (CSIRT) of ${companyName} to identify, contain, eradicate, and recover from security events.`,
        sections: [
          {
            heading: 'Incident Severity Tiers & Response SLAs Matrix',
            table: {
              headers: ['Severity Tier', 'Definition & Business Impact', 'Initial Response SLA', 'Executive Escalation Time'],
              rows: [
                ['Sev-1 (Critical)', 'Active customer data breach, ransomware, core production downtime (>50% users)', '<= 15 Minutes', 'CISO & CEO notified immediately (<= 30 min)'],
                ['Sev-2 (High)', 'Compromised admin credentials, isolated system compromise, severe degradation', '<= 1 Hour', 'CISO notified within 2 hours'],
                ['Sev-3 (Medium)', 'Single malware infection on isolated laptop, non-critical web defacement', '<= 4 Hours', 'SecOps Lead notified in next business standup'],
                ['Sev-4 (Low)', 'Isolated phishing attempt reported by user, port scan, policy anomaly', '<= 24 Hours', 'Standard ticketing queue']
              ]
            }
          },
          {
            heading: '2. 6-Phase Incident Response Lifecycle (NIST SP 800-61 Rev 2)',
            body: `Phase 1: Preparation – Maintenance of call trees, pre-authorized containment runbooks, and forensics tooling.
Phase 2: Identification – Correlation of SIEM alerts, endpoint telemetry, and user reports.
Phase 3: Containment – Immediate short-term network isolation (quarantine endpoint via MDM / detach VPC security group).
Phase 4: Eradication – Removal of malicious artifacts, credential revocation, and vulnerability patching.
Phase 5: Recovery – Staged restoration from immutable backups with continuous monitoring.
Phase 6: Lessons Learned – Mandatory 5-Whys post-mortem within 5 business days.`
          }
        ]
      },
      {
        pageNumber: 5,
        title: 'Statutory Breach Notification & Forensics',
        content: `3. Statutory Regulatory Breach Escalation (72-Hour Mandate)
Where an incident involves confirmed or probable unauthorized access to personal identifiable information (PII):`,
        sections: [
          {
            heading: 'Regulatory Notification Timelines',
            body: `▪ GDPR Article 33: Formal notification to the supervisory authority within 72 Hours of becoming aware of the breach.
▪ MAS Notice 655 (TRM): Financial regulatory notification within 1 Hour of confirming a severe technology disruption.
▪ Singapore PDPA: Notification to the Commission within 72 Hours if affecting >= 500 individuals.
▪ Customer Notification: Executive communication to affected enterprise clients pursuant to MSA notification SLAs (typically 24–48 hours).`
          },
          {
            heading: '4. Chain of Custody & Evidence Preservation (Annex A.5.28)',
            body: `All volatile memory dumps, disk snapshot images in ${cloudProvider}, and SIEM log extracts must have their SHA-256 cryptographic hashes recorded immediately upon acquisition. Forensics investigations must be executed strictly against copies, preserving raw evidence in write-protected storage.`
          }
        ]
      },
      {
        pageNumber: 6,
        title: 'Post-Incident 5-Whys & CAPA Linkage',
        content: `5. Post-Incident 5-Whys Root Cause Analysis (Clause 10.1)
Within 5 business days of incident closure for any Sev-1 or Sev-2 incident:
1. The CSIRT Lead shall conduct a blameless post-mortem meeting.
2. A formal 5-Whys analysis shall be documented to drill down beyond technical symptoms into underlying process or governance failures.
3. Corrective actions shall be registered in the Skanda GRC CAPA module with hard 30-day deadlines.
4. The CISO shall review and sign the final Incident Closure Dossier.`
      },
      {
        pageNumber: 7,
        title: 'Lead Auditor Verification Dossier',
        content: `6. Lead Auditor Stage 2 Fieldwork Dossier & Cryptographic Seal`,
        sections: [
          {
            heading: 'Lead Auditor Fieldwork Sampling Verification Dossier',
            table: {
              headers: ['Audit Parameter', 'Operational Evidence Record'],
              rows: [
                ['Primary Audit Artifact', auditorDossier.artifactName],
                ['ISO 19011:2018 Sampling Protocol', auditorDossier.samplingProtocol],
                ['Storage Location & SLA', auditorDossier.storageLocation],
                ['Retention Period Mandate', auditorDossier.retentionSla],
                ['Normative Standard Mapping', auditorDossier.clauseOrAnnexA],
                ['Associated Master Risk ID', auditorDossier.riskId],
                ['Statutory Reference Citation', auditorDossier.statutoryMandate],
                ['Cryptographic SHA-256 Digest Seal', auditorDossier.sha256Seal],
                ['Auditor Fieldwork Attestation Verdict', `${auditorDossier.auditorVerdict} - CERTIFIED CONFORMING (Zero Undocumented Incidents)`]
              ]
            }
          },
          {
            heading: 'Formal Sign-off',
            body: `Approved by Chief Information Security Officer (${cisoName}). Effective Date: ${effectiveDate}.`
          }
        ]
      }
    ],
    content: `# ${companyName} - Incident Management & Data Breach Procedure
**Doc Code:** SOP-INC-12 | **Classification:** Confidential - Internal ISMS Use Only | **Standard:** ${framework}
**Document Owner:** ${cisoName} | **Approver:** CISO & Legal Counsel | **Effective Date:** ${effectiveDate}

## 1. Quantitative SLAs (Annex A.5.24 - A.5.28)
- Sev-1 Initial Response: <= 15 Minutes.
- Sev-2 Initial Response: <= 1 Hour.
- Statutory Breach Notification: <= 72 Hours under GDPR Art 33 / MAS Notice 655.
- Mandatory 5-Whys root cause analysis registered in CAPA within 5 days.`
  }, ctx);
}

export function buildSopBcp13(ctx: PolicyTemplateContext): GeneratedDocument {
  const { companyName, framework, cloudProvider, cisoName, effectiveDate, defaultControlStatements, defaultRevisionHistory } = ctx;

  const auditorDossier = buildAuditorVerificationDossier({
    docCode: 'SOP-BCP-13',
    docTitle: 'Business Continuity & Disaster Recovery Procedure',
    companyName,
    clauseOrAnnexA: 'Annex A.5.29 (Information Security During Disruption) & A.5.30 (ICT Readiness)',
    riskId: 'RSK-BCP-01',
    statutoryMandate: 'ISO 27001:2022 A.5.29, A.5.30, ISO 22301, MAS TRM Section 7.1',
    artifactName: `${companyName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}_ANNUAL_DR_FAILOVER_TEST_REPORT_2026.pdf`,
    samplingProtocol: 'ISO 19011:2018 §B.3 Inspection of live annual multi-region failover execution log'
  });

  return enrichDocumentWithTuvSop({
    id: 'doc_sop_bcp_13',
    docCode: 'SOP-BCP-13',
    title: 'Business Continuity & Disaster Recovery Procedure',
    type: 'PROCEDURE',
    category: 'Business Continuity & Resilience',
    version: '1.0',
    status: 'APPROVED',
    owner: cisoName,
    approver: 'Executive Board / CISO',
    effectiveDate,
    reviewCycle: 'Annual',
    classification: 'Confidential - Internal ISMS Use Only',
    standard: framework,
    documentOwner: cisoName,
    issuedBy: 'Resilience Working Group',
    approvedBy: 'CISO & VP Engineering',
    acknowledgementCount: 20,
    lastModified: new Date().toISOString(),
    documentControlStatements: defaultControlStatements,
    revisionHistory: defaultRevisionHistory,
    tableOfContents: [
      { title: 'Document Control & Revision Record', pageNo: 2, level: 1 },
      { title: 'Table of Contents', pageNo: 3, level: 1 },
      { title: '1. Purpose & Business Impact Analysis (BIA) Parameters', pageNo: 4, level: 1 },
      { title: '2. Quantitative RTO and RPO Recovery SLAs (Annex A.5.30)', pageNo: 4, level: 1 },
      { title: '3. Multi-Region Cloud Failover Operational Runbook', pageNo: 5, level: 1 },
      { title: '4. Annual Live Simulation Testing & Executive Review Requirements', pageNo: 5, level: 1 },
      { title: '5. Lead Auditor Stage 2 BCP/DR Verification Dossier & Seal', pageNo: 6, level: 1 }
    ],
    pages: [
      {
        pageNumber: 4,
        title: 'BIA & Quantitative Recovery SLAs',
        content: `1. Purpose & Scope (Annex A.5.29 & A.5.30)
This procedure establishes the operational steps to ensure continuous availability of critical IT infrastructure and rapid restoration following a catastrophic cloud datacenter outage or regional disruption.

2. Quantitative RTO and RPO Recovery SLAs:`,
        sections: [
          {
            heading: 'Critical Workload Recovery SLAs Table',
            table: {
              headers: ['System Component', 'Recovery Time Objective (RTO)', 'Recovery Point Objective (RPO)', 'Target Availability SLA'],
              rows: [
                ['Customer Web APIs & Core Service', '<= 4 Hours', '<= 15 Minutes', '99.9% Uptime'],
                ['Production Databases (RDS PostgreSQL)', '<= 2 Hours', '<= 5 Minutes (Continuous WAL sync)', '99.99% Multi-AZ Uptime'],
                ['Authentication & Directory Services', '<= 1 Hour', '<= 15 Minutes', '99.99% Availability'],
                ['Internal Collaboration Tools', '<= 24 Hours', '<= 24 Hours', '99.0% Uptime']
              ]
            }
          }
        ]
      },
      {
        pageNumber: 5,
        title: 'Multi-Region Failover Runbook & Testing',
        content: `3. Multi-Region Cloud Failover Runbook (${cloudProvider})
When the Primary Region experiences sustained unrecoverable failure:
1. Declaration: Incident Commander declares Disaster Recovery state after 30 minutes of unresolved regional failure.
2. DNS Routing: Route 53 health-check failover triggers automated DNS switchover to Secondary Hot Standby region.
3. Database Promotion: Read-replica in secondary region is promoted to primary read-write master.
4. Kubernetes Scaling: Production pods autoscale in secondary cluster to handle ingress load.
5. Verification: Automated smoke tests validate API endpoints and customer data integrity.

4. Annual Simulation Testing Mandate
A live or simulated failover exercise must be executed at least once every 12 months. The results, actual recovery times, and identified bottlenecks must be presented to Top Management during the Management Review.`
      },
      {
        pageNumber: 6,
        title: 'Lead Auditor Verification Dossier',
        content: `5. Lead Auditor Stage 2 Fieldwork Dossier & Cryptographic Seal`,
        sections: [
          {
            heading: 'Lead Auditor Fieldwork Sampling Verification Dossier',
            table: {
              headers: ['Audit Parameter', 'Operational Evidence Record'],
              rows: [
                ['Primary Audit Artifact', auditorDossier.artifactName],
                ['ISO 19011:2018 Sampling Protocol', auditorDossier.samplingProtocol],
                ['Storage Location & SLA', auditorDossier.storageLocation],
                ['Retention Period Mandate', auditorDossier.retentionSla],
                ['Normative Standard Mapping', auditorDossier.clauseOrAnnexA],
                ['Associated Master Risk ID', auditorDossier.riskId],
                ['Statutory Reference Citation', auditorDossier.statutoryMandate],
                ['Cryptographic SHA-256 Digest Seal', auditorDossier.sha256Seal],
                ['Auditor Fieldwork Attestation Verdict', `${auditorDossier.auditorVerdict} - CERTIFIED CONFORMING (Tested RTO/RPO Achieved)`]
              ]
            }
          },
          {
            heading: 'Formal Sign-off',
            body: `Approved by VP of Engineering and CISO (${cisoName}). Effective Date: ${effectiveDate}.`
          }
        ]
      }
    ],
    content: `# ${companyName} - Business Continuity & Disaster Recovery Procedure
**Doc Code:** SOP-BCP-13 | **Classification:** Confidential - Internal ISMS Use Only | **Standard:** ${framework}
**Document Owner:** ${cisoName} | **Approver:** CISO & VP Engineering | **Effective Date:** ${effectiveDate}

## 1. Quantitative SLAs (Annex A.5.29 & A.5.30)
- RTO (Recovery Time Objective): <= 4 Hours.
- RPO (Recovery Point Objective): <= 15 Minutes.
- Automated multi-region failover in **${cloudProvider}**; annual tested drill.`
  }, ctx);
}

export function buildSopBkp14(ctx: PolicyTemplateContext): GeneratedDocument {
  const { companyName, framework, cloudProvider, cisoName, effectiveDate, defaultControlStatements, defaultRevisionHistory } = ctx;

  const auditorDossier = buildAuditorVerificationDossier({
    docCode: 'SOP-BKP-14',
    docTitle: 'Backup, Snapshot & Recovery Verification Procedure',
    companyName,
    clauseOrAnnexA: 'Annex A.8.13 (Information Backup)',
    riskId: 'RSK-OPS-02',
    statutoryMandate: 'ISO 27001:2022 A.8.13, MAS TRM Section 7.1',
    artifactName: `${companyName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}_QUARTERLY_BACKUP_RESTORE_DRILL_Q3.log`
  });

  return enrichDocumentWithTuvSop({
    id: 'doc_sop_bkp_14',
    docCode: 'SOP-BKP-14',
    title: 'Backup, Snapshot & Recovery Verification Procedure',
    type: 'PROCEDURE',
    category: 'Technical Security Controls',
    version: '1.0',
    status: 'APPROVED',
    owner: cisoName,
    approver: 'Head of Infrastructure & CISO',
    effectiveDate,
    reviewCycle: 'Annual',
    classification: 'Confidential - Internal ISMS Use Only',
    standard: framework,
    documentOwner: cisoName,
    issuedBy: 'Database Administration & SRE',
    approvedBy: 'CISO',
    acknowledgementCount: 16,
    lastModified: new Date().toISOString(),
    documentControlStatements: defaultControlStatements,
    revisionHistory: defaultRevisionHistory,
    tableOfContents: [
      { title: 'Document Control & Revision Record', pageNo: 2, level: 1 },
      { title: 'Table of Contents', pageNo: 3, level: 1 },
      { title: '1. Backup Frequency Schedules & Automated Snapshots (Annex A.8.13)', pageNo: 4, level: 1 },
      { title: '2. Encryption & Immutability (WORM / Object Lock)', pageNo: 4, level: 1 },
      { title: '3. Mandatory Quarterly Restoration Verification Drills', pageNo: 5, level: 1 },
      { title: '4. Lead Auditor Stage 2 Backup Verification Dossier & Seal', pageNo: 6, level: 1 }
    ],
    pages: [
      {
        pageNumber: 4,
        title: 'Backup Schedules & Immutability Standards',
        content: `1. Backup Schedules (Annex A.8.13)
All critical databases and persistent storage in ${cloudProvider} shall be automatically backed up:`,
        sections: [
          {
            heading: 'Backup Cadence Matrix',
            table: {
              headers: ['Asset Type', 'Backup Mechanism & Frequency', 'Retention Period', 'Cross-Region Target'],
              rows: [
                ['Production RDS PostgreSQL', 'Automated continuous snapshots + daily full snapshots', '35 days continuous; monthly retained 1 year', 'Replicated to Secondary Region'],
                ['Customer Document Buckets (S3)', 'Continuous versioning + daily differential', '90 days standard; archived to Glacier for 3 years', 'Cross-Region Replication enabled'],
                ['Infrastructure Configuration (IaC)', 'Git commit history in SCM + state file lock', 'Permanent revision history', 'Encrypted S3 bucket with Object Lock']
              ]
            }
          },
          {
            heading: '2. Cryptographic Encryption & WORM Immutability',
            body: `▪ Encryption: 100% of backups encrypted with AES-256 Cloud KMS keys.
▪ WORM Compliance: Critical monthly and annual backup archives shall be stored in AWS S3 Glacier with Object Lock in Compliance Mode to guarantee immutability against ransomware.`
          }
        ]
      },
      {
        pageNumber: 5,
        title: 'Quarterly Restoration Drill Protocol',
        content: `3. Quarterly Restore Drill Protocol
Backups are useless unless verified for operational restoration.
Every quarter, the Database Administrator shall:
1. Select a random production backup snapshot from the preceding 30 days.
2. Restore the snapshot into an isolated sandbox staging VPC.
3. Execute automated schema validation and integrity check queries.
4. Record restoration duration, timestamp, and row count comparison in the Skanda GRC Backup Verification Register.`
      },
      {
        pageNumber: 6,
        title: 'Lead Auditor Verification Dossier',
        content: `4. Lead Auditor Stage 2 Fieldwork Dossier & Cryptographic Seal`,
        sections: [
          {
            heading: 'Lead Auditor Fieldwork Sampling Verification Dossier',
            table: {
              headers: ['Audit Parameter', 'Operational Evidence Record'],
              rows: [
                ['Primary Audit Artifact', auditorDossier.artifactName],
                ['ISO 19011:2018 Sampling Protocol', auditorDossier.samplingProtocol],
                ['Storage Location & SLA', auditorDossier.storageLocation],
                ['Retention Period Mandate', auditorDossier.retentionSla],
                ['Normative Standard Mapping', auditorDossier.clauseOrAnnexA],
                ['Associated Master Risk ID', auditorDossier.riskId],
                ['Statutory Reference Citation', auditorDossier.statutoryMandate],
                ['Cryptographic SHA-256 Digest Seal', auditorDossier.sha256Seal],
                ['Auditor Fieldwork Attestation Verdict', `${auditorDossier.auditorVerdict} - CERTIFIED CONFORMING (Verified Tested Restores)`]
              ]
            }
          },
          {
            heading: 'Formal Sign-off',
            body: `Approved by CISO (${cisoName}). Effective Date: ${effectiveDate}.`
          }
        ]
      }
    ],
    content: `# ${companyName} - Backup & Recovery Verification Procedure
**Doc Code:** SOP-BKP-14 | **Classification:** Confidential - Internal ISMS Use Only | **Standard:** ${framework}
**Document Owner:** ${cisoName} | **Approver:** CISO | **Effective Date:** ${effectiveDate}

## 1. Backup Controls (Annex A.8.13)
- Automated daily snapshots; AES-256 KMS encryption.
- WORM immutable compliance lock against ransomware.
- Mandatory quarterly test restore drill in staging.`
  }, ctx);
}

export function buildSopChg15(ctx: PolicyTemplateContext): GeneratedDocument {
  const { companyName, framework, scmProvider, cisoName, effectiveDate, defaultControlStatements, defaultRevisionHistory } = ctx;

  const auditorDossier = buildAuditorVerificationDossier({
    docCode: 'SOP-CHG-15',
    docTitle: 'Change & Release Management Procedure',
    companyName,
    clauseOrAnnexA: 'Annex A.8.32 (Change Management)',
    riskId: 'RSK-OPS-03',
    statutoryMandate: 'ISO 27001:2022 A.8.32, SOC 2 CC8.1, MAS TRM Section 9.2',
    artifactName: `${companyName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}_CHANGE_MANAGEMENT_CAB_MINUTES_2026.pdf`,
    samplingProtocol: 'ISO 19011:2018 §B.3 Sample of 20 production releases over past 6 months'
  });

  return enrichDocumentWithTuvSop({
    id: 'doc_sop_chg_15',
    docCode: 'SOP-CHG-15',
    title: 'Change & Release Management Procedure',
    type: 'PROCEDURE',
    category: 'DevOps & Infrastructure',
    version: '1.0',
    status: 'APPROVED',
    owner: cisoName,
    approver: 'Change Advisory Board (CAB) & CISO',
    effectiveDate,
    reviewCycle: 'Annual',
    classification: 'Confidential - Internal ISMS Use Only',
    standard: framework,
    documentOwner: cisoName,
    issuedBy: 'Release Engineering & QA',
    approvedBy: 'CISO & VP Engineering',
    acknowledgementCount: 24,
    lastModified: new Date().toISOString(),
    documentControlStatements: defaultControlStatements,
    revisionHistory: defaultRevisionHistory,
    tableOfContents: [
      { title: 'Document Control & Revision Record', pageNo: 2, level: 1 },
      { title: 'Table of Contents', pageNo: 3, level: 1 },
      { title: '1. Change Categories (Standard, Normal, Emergency) (Annex A.8.32)', pageNo: 4, level: 1 },
      { title: '2. CAB Approval Workflows & Automated Rollback Triggers', pageNo: 4, level: 1 },
      { title: '3. Production Change Freezes & Segregation of Duties', pageNo: 5, level: 1 },
      { title: '4. Lead Auditor Stage 2 Change Verification Dossier & Seal', pageNo: 6, level: 1 }
    ],
    pages: [
      {
        pageNumber: 4,
        title: 'Change Categories & Approval Workflows',
        content: `1. Change Categories (Annex A.8.32)
All configuration, infrastructure, and software deployments affecting production must adhere to one of three workflows:`,
        sections: [
          {
            heading: 'Change Classification Matrix',
            table: {
              headers: ['Category', 'Risk Profile & Examples', 'Approval Authority', 'Lead Time'],
              rows: [
                ['Standard Change', 'Pre-approved low risk changes (e.g. documentation update, minor bug fix passing all CI/CD gates)', 'Automated pipeline approval via peer review in ${scmProvider}', 'Immediate on CI/CD pass'],
                ['Normal Change', 'Architectural updates, database schema migrations, major feature releases', 'Change Advisory Board (CAB) weekly approval', 'Minimum 48 hours notice'],
                ['Emergency Change', 'Urgent zero-day CVE patch or critical production outage restoration', 'Emergency CAB (CISO + VP Eng) verbal/Slack sign-off', 'Immediate; retrospective review within 24h']
              ]
            }
          },
          {
            heading: '2. Mandatory Rollback Plans',
            body: `Every Normal and Emergency change ticket must include a documented, tested rollback plan. Automated health checks monitor error rates post-release; if error rate exceeds 1% within 10 minutes, the release is automatically reverted.`
          }
        ]
      },
      {
        pageNumber: 5,
        title: 'Change Freezes & Segregation of Duties',
        content: `3. Production Change Freezes & SoD
▪ Change Freezes: Routine non-emergency changes are prohibited during designated commercial freeze periods (e.g. major marketing events, end-of-year financial close).
▪ Segregation of Duties: Software developers cannot deploy code directly to production; deployments are executed strictly via automated GitOps CI/CD runners.`
      },
      {
        pageNumber: 6,
        title: 'Lead Auditor Verification Dossier',
        content: `4. Lead Auditor Stage 2 Fieldwork Dossier & Cryptographic Seal`,
        sections: [
          {
            heading: 'Lead Auditor Fieldwork Sampling Verification Dossier',
            table: {
              headers: ['Audit Parameter', 'Operational Evidence Record'],
              rows: [
                ['Primary Audit Artifact', auditorDossier.artifactName],
                ['ISO 19011:2018 Sampling Protocol', auditorDossier.samplingProtocol],
                ['Storage Location & SLA', auditorDossier.storageLocation],
                ['Retention Period Mandate', auditorDossier.retentionSla],
                ['Normative Standard Mapping', auditorDossier.clauseOrAnnexA],
                ['Associated Master Risk ID', auditorDossier.riskId],
                ['Statutory Reference Citation', auditorDossier.statutoryMandate],
                ['Cryptographic SHA-256 Digest Seal', auditorDossier.sha256Seal],
                ['Auditor Fieldwork Attestation Verdict', `${auditorDossier.auditorVerdict} - CERTIFIED CONFORMING (Zero Unapproved Deployments)`]
              ]
            }
          },
          {
            heading: 'Formal Sign-off',
            body: `Approved by CAB Chair and CISO (${cisoName}). Effective Date: ${effectiveDate}.`
          }
        ]
      }
    ],
    content: `# ${companyName} - Change & Release Management Procedure
**Doc Code:** SOP-CHG-15 | **Classification:** Confidential - Internal ISMS Use Only | **Standard:** ${framework}
**Document Owner:** ${cisoName} | **Approver:** CAB & CISO | **Effective Date:** ${effectiveDate}

## 1. Change Tiers (Annex A.8.32)
- Standard: Pre-approved automated CI/CD.
- Normal: Weekly CAB review with rollback plan.
- Emergency: CISO sign-off with retrospective review within 24 hours.`
  }, ctx);
}

export function buildSopAud16(ctx: PolicyTemplateContext): GeneratedDocument {
  const { companyName, framework, cisoName, effectiveDate, defaultControlStatements, defaultRevisionHistory } = ctx;

  const auditorDossier = buildAuditorVerificationDossier({
    docCode: 'SOP-AUD-16',
    docTitle: 'Internal Audit & Compliance Assessment Procedure',
    companyName,
    clauseOrAnnexA: 'Mandatory Clause 9.2 (Internal Audit)',
    riskId: 'RSK-AUD-01',
    statutoryMandate: 'ISO/IEC 27001:2022 Clause 9.2, ISO 19011:2018',
    artifactName: `${companyName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}_ANNUAL_INTERNAL_AUDIT_REPORT_2026.pdf`,
    samplingProtocol: 'ISO 19011:2018 100% clause coverage (Clauses 4-10 + Annex A themes)'
  });

  return enrichDocumentWithTuvSop({
    id: 'doc_sop_aud_16',
    docCode: 'SOP-AUD-16',
    title: 'Internal Audit & Compliance Assessment Procedure',
    type: 'PROCEDURE',
    category: 'Compliance & Audit Governance',
    version: '1.0',
    status: 'APPROVED',
    owner: cisoName,
    approver: 'Executive Board / CISO',
    effectiveDate,
    reviewCycle: 'Annual',
    classification: 'Confidential - Internal ISMS Use Only',
    standard: framework,
    documentOwner: cisoName,
    issuedBy: 'Internal Audit Function',
    approvedBy: 'CISO & Audit Committee',
    acknowledgementCount: 18,
    lastModified: new Date().toISOString(),
    documentControlStatements: defaultControlStatements,
    revisionHistory: defaultRevisionHistory,
    tableOfContents: [
      { title: 'Document Control & Revision Record', pageNo: 2, level: 1 },
      { title: 'Table of Contents', pageNo: 3, level: 1 },
      { title: '1. Internal Audit Mandate & Auditor Independence (Clause 9.2)', pageNo: 4, level: 1 },
      { title: '2. Annual Internal Audit Program Schedule & 100% Scope Coverage', pageNo: 4, level: 1 },
      { title: '3. Audit Execution, ISO 19011 Sampling & Finding Categorization', pageNo: 5, level: 1 },
      { title: '4. CAPA Escalation & Executive Reporting', pageNo: 5, level: 1 },
      { title: '5. Lead Auditor Stage 2 Internal Audit Verification Dossier & Seal', pageNo: 6, level: 1 }
    ],
    pages: [
      {
        pageNumber: 4,
        title: 'Audit Mandate & Independence Rules',
        content: `1. Internal Audit Mandate (Clause 9.2)
${companyName} conducts internal audits at planned intervals not exceeding 12 months to verify whether the ISMS:
a) Conforms to the organization's own requirements for its ISMS.
b) Conforms to the requirements of ISO/IEC 27001:2022.
c) Is effectively implemented and maintained.`,
        sections: [
          {
            heading: 'Auditor Independence Rules (ISO 19011:2018)',
            body: `▪ Objectivity: Internal auditors must be independent of the direct operational activities they audit. Software developers shall NOT audit software development; Cloud SecOps engineers shall NOT audit cloud infrastructure.
▪ Competence: Auditors must have verified ISO 27001 Internal Auditor or Lead Auditor credentials.`
          },
          {
            heading: '2. 100% Scope Coverage Requirement',
            body: `The annual audit program must guarantee that 100% of mandatory Clauses 4 through 10 and all 4 themes of Annex A controls are audited within a rolling 12-month cycle prior to external Stage 2 certification audits.`
          }
        ]
      },
      {
        pageNumber: 5,
        title: 'Sampling Methodology & Finding Classification',
        content: `3. Audit Findings Classification Scheme
All identified audit findings shall be classified into one of three standardized tiers:`,
        sections: [
          {
            heading: 'Finding Classification Matrix',
            table: {
              headers: ['Classification Tier', 'Definition & Audit Impact', 'Mandatory CAPA SLA', 'Escalation Protocol'],
              rows: [
                ['Major Non-Conformity (MNC)', 'Total breakdown of a mandatory clause or absent control affecting security', 'Root cause within 7 days; closure within 30 days', 'Reported immediately to CEO & Board'],
                ['Minor Non-Conformity (mnc)', 'Isolated lapse in adherence to documented policy with no systemic compromise', 'Root cause within 14 days; closure within 60 days', 'Assigned to department owner in CAPA'],
                ['Opportunity for Improvement (OFI)', 'Control conforms to baseline but could be optimized for efficiency or resilience', 'Evaluated in next sprint backlog', 'Reviewed during Management Review']
              ]
            }
          }
        ]
      },
      {
        pageNumber: 6,
        title: 'Lead Auditor Verification Dossier',
        content: `4. Lead Auditor Stage 2 Fieldwork Dossier & Cryptographic Seal`,
        sections: [
          {
            heading: 'Lead Auditor Fieldwork Sampling Verification Dossier',
            table: {
              headers: ['Audit Parameter', 'Operational Evidence Record'],
              rows: [
                ['Primary Audit Artifact', auditorDossier.artifactName],
                ['ISO 19011:2018 Sampling Protocol', auditorDossier.samplingProtocol],
                ['Storage Location & SLA', auditorDossier.storageLocation],
                ['Retention Period Mandate', auditorDossier.retentionSla],
                ['Normative Standard Mapping', auditorDossier.clauseOrAnnexA],
                ['Associated Master Risk ID', auditorDossier.riskId],
                ['Statutory Reference Citation', auditorDossier.statutoryMandate],
                ['Cryptographic SHA-256 Digest Seal', auditorDossier.sha256Seal],
                ['Auditor Fieldwork Attestation Verdict', `${auditorDossier.auditorVerdict} - CERTIFIED CONFORMING (100% Clause Coverage)`]
              ]
            }
          },
          {
            heading: 'Formal Sign-off',
            body: `Approved by Lead Internal Auditor and CISO (${cisoName}). Effective Date: ${effectiveDate}.`
          }
        ]
      }
    ],
    content: `# ${companyName} - Internal Audit & Compliance Assessment Procedure
**Doc Code:** SOP-AUD-16 | **Classification:** Confidential - Internal ISMS Use Only | **Standard:** ${framework}
**Document Owner:** ${cisoName} | **Approver:** CISO & Audit Committee | **Effective Date:** ${effectiveDate}

## 1. Internal Audit (Clause 9.2)
- 100% clause and Annex A coverage across every 12-month cycle.
- Strict auditor independence (ISO 19011:2018).
- Major Non-Conformities closed within 30 days via CAPA.`
  }, ctx);
}

export function buildSopCapa17(ctx: PolicyTemplateContext): GeneratedDocument {
  const { companyName, framework, cisoName, effectiveDate, defaultControlStatements, defaultRevisionHistory } = ctx;

  const auditorDossier = buildAuditorVerificationDossier({
    docCode: 'SOP-CAPA-17',
    docTitle: 'Corrective Action, Root Cause (5-Whys) & Continual Improvement Procedure',
    companyName,
    clauseOrAnnexA: 'Mandatory Clause 10.1 & 10.2 (Nonconformity and Corrective Action)',
    riskId: 'RSK-CAPA-01',
    statutoryMandate: 'ISO/IEC 27001:2022 Clause 10.1 & 10.2',
    artifactName: `${companyName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}_CAPA_LOG_REGISTER_2026.xlsx`
  });

  return enrichDocumentWithTuvSop({
    id: 'doc_sop_capa_17',
    docCode: 'SOP-CAPA-17',
    title: 'Corrective Action, Root Cause (5-Whys) & Continual Improvement Procedure',
    type: 'PROCEDURE',
    category: 'Compliance & Quality Assurance',
    version: '1.0',
    status: 'APPROVED',
    owner: cisoName,
    approver: 'Executive Board / CISO',
    effectiveDate,
    reviewCycle: 'Annual',
    classification: 'Confidential - Internal ISMS Use Only',
    standard: framework,
    documentOwner: cisoName,
    issuedBy: 'Quality Assurance & Compliance',
    approvedBy: 'CISO',
    acknowledgementCount: 20,
    lastModified: new Date().toISOString(),
    documentControlStatements: defaultControlStatements,
    revisionHistory: defaultRevisionHistory,
    tableOfContents: [
      { title: 'Document Control & Revision Record', pageNo: 2, level: 1 },
      { title: 'Table of Contents', pageNo: 3, level: 1 },
      { title: '1. Non-Conformity Intake & Immediate Containment (Clause 10.1 a)', pageNo: 4, level: 1 },
      { title: '2. Mandatory 5-Whys Root Cause Analysis Methodology', pageNo: 4, level: 1 },
      { title: '3. Corrective Action Plan Formulation & Implementation (Clause 10.1 b)', pageNo: 5, level: 1 },
      { title: '4. Mandatory 30-Day Post-Implementation Effectiveness Review', pageNo: 5, level: 1 },
      { title: '5. Lead Auditor Stage 2 CAPA Verification Dossier & Seal', pageNo: 6, level: 1 }
    ],
    pages: [
      {
        pageNumber: 4,
        title: 'Intake, Containment & 5-Whys Methodology',
        content: `1. Non-Conformity Intake (Clause 10.1)
When a nonconformity occurs (from audits, security incidents, customer complaints, or control failures), ${companyName} shall:
a) React immediately to control and correct it.
b) Deal with the consequences (immediate containment).

2. Mandatory 5-Whys Root Cause Analysis:
Simply fixing the symptom is prohibited. Investigators must apply the 5-Whys technique to identify underlying organizational, technical, or cultural causes.`,
        sections: [
          {
            heading: '5-Whys Investigation Example (Illustrative)',
            table: {
              headers: ['Stage', 'Question', 'Root Cause Discovery'],
              rows: [
                ['Why 1', 'Why did an unencrypted laptop leave the office?', 'The laptop was not enrolled in MDM encryption profiles.'],
                ['Why 2', 'Why was it not enrolled in MDM?', 'The IT technician provisioned it using an unapproved manual image.'],
                ['Why 3', 'Why was a manual image used?', 'The zero-touch enrollment workflow had an authentication error.'],
                ['Why 4', 'Why was the error not reported?', 'There was no automated alerting on failed MDM enrollments.'],
                ['Why 5 (Root Cause)', 'Why was there no automated alerting?', 'The asset onboarding procedure lacked a mandatory reconciliation check before physical release.']
              ]
            }
          }
        ]
      },
      {
        pageNumber: 5,
        title: 'Corrective Action & Effectiveness Validation',
        content: `3. Corrective Action Formulation & Effectiveness Validation (Clause 10.1 c, d)
▪ Preventive Action: Evaluate if similar non-conformities could exist elsewhere in the organization.
▪ 30-Day Post-Fix Monitoring: A CAPA ticket cannot be closed upon deployment of the fix. It must undergo a mandatory 30-Day Monitoring Period.
▪ Effectiveness Review: The Quality / Compliance lead must independently re-test the control after 30 days to confirm zero recurrence before formal sign-off.`
      },
      {
        pageNumber: 6,
        title: 'Lead Auditor Verification Dossier',
        content: `4. Lead Auditor Stage 2 Fieldwork Dossier & Cryptographic Seal`,
        sections: [
          {
            heading: 'Lead Auditor Fieldwork Sampling Verification Dossier',
            table: {
              headers: ['Audit Parameter', 'Operational Evidence Record'],
              rows: [
                ['Primary Audit Artifact', auditorDossier.artifactName],
                ['ISO 19011:2018 Sampling Protocol', auditorDossier.samplingProtocol],
                ['Storage Location & SLA', auditorDossier.storageLocation],
                ['Retention Period Mandate', auditorDossier.retentionSla],
                ['Normative Standard Mapping', auditorDossier.clauseOrAnnexA],
                ['Associated Master Risk ID', auditorDossier.riskId],
                ['Statutory Reference Citation', auditorDossier.statutoryMandate],
                ['Cryptographic SHA-256 Digest Seal', auditorDossier.sha256Seal],
                ['Auditor Fieldwork Attestation Verdict', `${auditorDossier.auditorVerdict} - CERTIFIED CONFORMING (Zero Premature CAPA Closures)`]
              ]
            }
          },
          {
            heading: 'Formal Sign-off',
            body: `Approved by CISO (${cisoName}). Effective Date: ${effectiveDate}.`
          }
        ]
      }
    ],
    content: `# ${companyName} - Corrective Action & Continual Improvement Procedure
**Doc Code:** SOP-CAPA-17 | **Classification:** Confidential - Internal ISMS Use Only | **Standard:** ${framework}
**Document Owner:** ${cisoName} | **Approver:** CISO | **Effective Date:** ${effectiveDate}

## 1. CAPA Engine (Clause 10.1 & 10.2)
- Mandatory 5-Whys root cause analysis for all audit findings and incidents.
- Mandatory 30-day post-fix effectiveness validation before ticket closure.`
  }, ctx);
}

export function buildSopRev18(ctx: PolicyTemplateContext): GeneratedDocument {
  const { companyName, framework, cisoName, effectiveDate, defaultControlStatements, defaultRevisionHistory } = ctx;

  const auditorDossier = buildAuditorVerificationDossier({
    docCode: 'SOP-REV-18',
    docTitle: 'Management Review & Executive Governance Procedure',
    companyName,
    clauseOrAnnexA: 'Mandatory Clause 9.3 (Management Review)',
    riskId: 'RSK-GOV-03',
    statutoryMandate: 'ISO/IEC 27001:2022 Clause 9.3',
    artifactName: `${companyName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}_EXECUTIVE_MANAGEMENT_REVIEW_MINUTES_2026.pdf`
  });

  return enrichDocumentWithTuvSop({
    id: 'doc_sop_rev_18',
    docCode: 'SOP-REV-18',
    title: 'Management Review & Executive Governance Procedure',
    type: 'PROCEDURE',
    category: 'Executive Leadership & Strategy',
    version: '1.0',
    status: 'APPROVED',
    owner: cisoName,
    approver: 'Executive Board / CEO',
    effectiveDate,
    reviewCycle: 'Annual',
    classification: 'Confidential - Internal ISMS Use Only',
    standard: framework,
    documentOwner: cisoName,
    issuedBy: 'Office of the CISO',
    approvedBy: 'CEO & Board of Directors',
    acknowledgementCount: 15,
    lastModified: new Date().toISOString(),
    documentControlStatements: defaultControlStatements,
    revisionHistory: defaultRevisionHistory,
    tableOfContents: [
      { title: 'Document Control & Revision Record', pageNo: 2, level: 1 },
      { title: 'Table of Contents', pageNo: 3, level: 1 },
      { title: '1. Management Review Mandate & Meeting Cadence (Clause 9.3.1)', pageNo: 4, level: 1 },
      { title: '2. Mandatory Management Review Inputs Agenda (Clause 9.3.2)', pageNo: 4, level: 1 },
      { title: '3. Mandatory Management Review Outputs & Decisions (Clause 9.3.3)', pageNo: 5, level: 1 },
      { title: '4. Lead Auditor Stage 2 Review Verification Dossier & Seal', pageNo: 6, level: 1 }
    ],
    pages: [
      {
        pageNumber: 4,
        title: 'Review Mandate & Mandatory Inputs',
        content: `1. Purpose & Cadence (Clause 9.3)
Top Management of ${companyName} shall review the organization's ISMS at planned intervals (at least bi-annually) to ensure its continuing suitability, adequacy, and effectiveness.

2. Mandatory Review Inputs Agenda (Clause 9.3.2):
The review meeting agenda must strictly cover all required inputs under ISO/IEC 27001:2022:`,
        sections: [
          {
            heading: 'Management Review Inputs Table',
            table: {
              headers: ['Input Item', 'ISO Clause Reference', 'Required Material / Telemetry'],
              rows: [
                ['Status of Past Actions', 'Clause 9.3.2 a', 'Review of action items from preceding Management Review'],
                ['Context & Stakeholder Changes', 'Clause 9.3.2 b', 'Changes in internal/external issues and interested party requirements'],
                ['Security Objectives & KPIs', 'Clause 9.3.2 c.1', 'Telemetry on uptime (99.9%), vulnerability SLAs, and training attestation'],
                ['Audit & CAPA Results', 'Clause 9.3.2 c.2', 'Internal audit findings, external surveillance results, and open CAPAs'],
                ['Threat Intel & Monitoring', 'Clause 9.3.2 c.3', 'Incident metrics, ransomware trends, and threat intelligence updates'],
                ['Risk Assessment Updates', 'Clause 9.3.2 d', 'Residual risk changes and Risk Treatment Plan (RTP) progress']
              ]
            }
          }
        ]
      },
      {
        pageNumber: 5,
        title: 'Mandatory Outputs & Strategic Decisions',
        content: `3. Management Review Outputs & Decisions (Clause 9.3.3)
The outputs of the management review shall include decisions related to:
▪ Continual Improvement: Strategic changes to the ISMS architecture.
▪ Resource Allocations: Approved budget for security personnel, tooling, and infrastructure hardening.
▪ Risk Treatment: Formal ratification of risk appetite modifications or high-level risk treatments.
▪ Documented Minutes: Formal meeting minutes signed by the CEO and retained for a minimum of 3 years.`
      },
      {
        pageNumber: 6,
        title: 'Lead Auditor Verification Dossier',
        content: `4. Lead Auditor Stage 2 Fieldwork Dossier & Cryptographic Seal`,
        sections: [
          {
            heading: 'Lead Auditor Fieldwork Sampling Verification Dossier',
            table: {
              headers: ['Audit Parameter', 'Operational Evidence Record'],
              rows: [
                ['Primary Audit Artifact', auditorDossier.artifactName],
                ['ISO 19011:2018 Sampling Protocol', auditorDossier.samplingProtocol],
                ['Storage Location & SLA', auditorDossier.storageLocation],
                ['Retention Period Mandate', auditorDossier.retentionSla],
                ['Normative Standard Mapping', auditorDossier.clauseOrAnnexA],
                ['Associated Master Risk ID', auditorDossier.riskId],
                ['Statutory Reference Citation', auditorDossier.statutoryMandate],
                ['Cryptographic SHA-256 Digest Seal', auditorDossier.sha256Seal],
                ['Auditor Fieldwork Attestation Verdict', `${auditorDossier.auditorVerdict} - CERTIFIED CONFORMING (Executive Leadership Active)`]
              ]
            }
          },
          {
            heading: 'Formal Sign-off',
            body: `Approved by Chief Executive Officer (CEO) and CISO (${cisoName}). Effective Date: ${effectiveDate}.`
          }
        ]
      }
    ],
    content: `# ${companyName} - Management Review Procedure
**Doc Code:** SOP-REV-18 | **Classification:** Confidential - Internal ISMS Use Only | **Standard:** ${framework}
**Document Owner:** ${cisoName} | **Approver:** CEO & Board | **Effective Date:** ${effectiveDate}

## 1. Executive Governance (Clause 9.3)
- Bi-annual Top Management review meeting with CEO attendance.
- All Clause 9.3.2 mandatory inputs addressed.
- Signed executive minutes archived for 3 years.`
  }, ctx);
}

export function buildPolDoc19(ctx: PolicyTemplateContext): GeneratedDocument {
  const { companyName, framework, cisoName, effectiveDate, defaultControlStatements, defaultRevisionHistory } = ctx;

  const auditorDossier = buildAuditorVerificationDossier({
    docCode: 'POL-DOC-19',
    docTitle: 'Control of Documented Information Procedure',
    companyName,
    clauseOrAnnexA: 'Mandatory Clause 7.5 (Documented Information)',
    riskId: 'RSK-DOC-01',
    statutoryMandate: 'ISO/IEC 27001:2022 Clause 7.5',
    artifactName: `${companyName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}_MASTER_DOCUMENT_REGISTER_2026.xlsx`
  });

  return enrichDocumentWithTuvSop({
    id: 'doc_pol_doc_19',
    docCode: 'POL-DOC-19',
    title: 'Control of Documented Information Procedure',
    type: 'PROCEDURE',
    category: 'Quality & Document Governance',
    version: '1.0',
    status: 'APPROVED',
    owner: cisoName,
    approver: 'Executive Board / CISO',
    effectiveDate,
    reviewCycle: 'Annual',
    classification: 'Confidential - Internal ISMS Use Only',
    standard: framework,
    documentOwner: cisoName,
    issuedBy: 'Document Control Office',
    approvedBy: 'CISO & Quality Lead',
    acknowledgementCount: 22,
    lastModified: new Date().toISOString(),
    documentControlStatements: defaultControlStatements,
    revisionHistory: defaultRevisionHistory,
    tableOfContents: [
      { title: 'Document Control & Revision Record', pageNo: 2, level: 1 },
      { title: 'Table of Contents', pageNo: 3, level: 1 },
      { title: '1. Document Lifecycle & Naming Standard (Clause 7.5.2)', pageNo: 4, level: 1 },
      { title: '2. Formal Approval & Access Controls (Clause 7.5.3)', pageNo: 4, level: 1 },
      { title: '3. Document Retention, Archival & Obsolete Version Sunset', pageNo: 5, level: 1 },
      { title: '4. Lead Auditor Stage 2 Document Control Verification Dossier', pageNo: 6, level: 1 }
    ],
    pages: [
      {
        pageNumber: 4,
        title: 'Naming Standard & Approval Controls',
        content: `1. Purpose & Naming Standard (Clause 7.5)
This procedure governs how ISMS documents and records are created, numbered, reviewed, approved, classified, distributed, and archived within ${companyName}.`,
        sections: [
          {
            heading: 'Standardized Naming & Numbering Schema',
            table: {
              headers: ['Document Tier', 'Prefix Code', 'Naming Convention', 'Approval Authority'],
              rows: [
                ['Level 1: Governance & Scope', 'DOC- / POL-', 'POL-ISMS-01, DOC-SCP-01, DOC-SOA-03', 'CEO & Board of Directors'],
                ['Level 2: Topic Policies', 'POL-', 'POL-ACC-04, POL-CLS-05, POL-DEV-08', 'CISO & Department Head'],
                ['Level 3: SOPs / Procedures', 'SOP-', 'SOP-INC-12, SOP-BCP-13, SOP-AUD-16', 'CISO & Operational Lead'],
                ['Level 4: Records / Evidence', 'REC-', 'REC-AUD-01, REC-INC-02, REC-JML-03', 'Designated Record Custodian']
              ]
            }
          }
        ]
      },
      {
        pageNumber: 5,
        title: 'Retention & Obsolete Version Sunset',
        content: `2. Control of Obsolete Documents (Clause 7.5.3)
▪ Storage: All official documents reside in the centralized Skanda GRC repository with role-based access.
▪ Obsolete Versions: Whenever a new version is published, the previous version is marked Obsolete and archived with write-protection to prevent unintended use.
▪ Local Copies: Any printed or downloaded local copies are marked Uncontrolled Copy automatically.`
      },
      {
        pageNumber: 6,
        title: 'Lead Auditor Verification Dossier',
        content: `3. Lead Auditor Stage 2 Fieldwork Dossier & Cryptographic Seal`,
        sections: [
          {
            heading: 'Lead Auditor Fieldwork Sampling Verification Dossier',
            table: {
              headers: ['Audit Parameter', 'Operational Evidence Record'],
              rows: [
                ['Primary Audit Artifact', auditorDossier.artifactName],
                ['ISO 19011:2018 Sampling Protocol', auditorDossier.samplingProtocol],
                ['Storage Location & SLA', auditorDossier.storageLocation],
                ['Retention Period Mandate', auditorDossier.retentionSla],
                ['Normative Standard Mapping', auditorDossier.clauseOrAnnexA],
                ['Associated Master Risk ID', auditorDossier.riskId],
                ['Statutory Reference Citation', auditorDossier.statutoryMandate],
                ['Cryptographic SHA-256 Digest Seal', auditorDossier.sha256Seal],
                ['Auditor Fieldwork Attestation Verdict', `${auditorDossier.auditorVerdict} - CERTIFIED CONFORMING (Zero Uncontrolled Versions)`]
              ]
            }
          },
          {
            heading: 'Formal Sign-off',
            body: `Approved by CISO (${cisoName}). Effective Date: ${effectiveDate}.`
          }
        ]
      }
    ],
    content: `# ${companyName} - Control of Documented Information Procedure
**Doc Code:** POL-DOC-19 | **Classification:** Confidential - Internal ISMS Use Only | **Standard:** ${framework}
**Document Owner:** ${cisoName} | **Approver:** CISO | **Effective Date:** ${effectiveDate}

## 1. Document Control (Clause 7.5)
- Standardized 4-tier naming: POL-, DOC-, SOP-, REC-.
- Centralized GRC storage with version history.
- Obsolete versions archived; printed copies marked Uncontrolled.`
  }, ctx);
}
