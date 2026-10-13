import { GeneratedDocument } from '../../types';
import { PolicyTemplateContext } from './types';
import { buildAuditorVerificationDossier } from './auditorVerificationHelper';
import { buildAuditorGradePolAcc04 } from '../isoAuditorMasterEngine';

export function buildPolAcc04(ctx: PolicyTemplateContext): GeneratedDocument {
  return buildAuditorGradePolAcc04(ctx);
}

export function buildPolCls05(ctx: PolicyTemplateContext): GeneratedDocument {
  const { companyName, framework, cloudProvider, cisoName, effectiveDate, defaultControlStatements, defaultRevisionHistory } = ctx;

  const auditorDossier = buildAuditorVerificationDossier({
    docCode: 'POL-CLS-05',
    docTitle: 'Data Classification, Handling & Cryptographic Protection Policy',
    companyName,
    clauseOrAnnexA: 'Annex A.5.12 (Classification), A.5.13 (Labelling), A.8.11 (Data Masking), A.8.24 (Cryptography)',
    riskId: 'RSK-DAT-01',
    statutoryMandate: 'ISO 27001:2022 A.5.12, GDPR Article 32, SG PDPA, MAS TRM 4.1',
    artifactName: `${companyName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}_DATA_CLASSIFICATION_INVENTORY_2026.json`
  });

  return {
    id: 'doc_pol_cls_05',
    docCode: 'POL-CLS-05',
    title: 'Data Classification, Handling & Cryptographic Protection Policy',
    type: 'POLICY',
    category: 'Data Governance & Privacy',
    version: '1.0',
    status: 'APPROVED',
    owner: cisoName,
    approver: 'Executive Board / CISO',
    effectiveDate,
    reviewCycle: 'Annual',
    classification: 'Confidential - Internal ISMS Use Only',
    standard: framework,
    documentOwner: cisoName,
    issuedBy: 'Data Governance Committee',
    approvedBy: 'CISO & Legal Counsel',
    acknowledgementCount: 30,
    lastModified: new Date().toISOString(),
    documentControlStatements: defaultControlStatements,
    revisionHistory: defaultRevisionHistory,
    tableOfContents: [
      { title: 'Document Control & Revision Record', pageNo: 2, level: 1 },
      { title: 'Table of Contents', pageNo: 3, level: 1 },
      { title: '1. Data Classification Taxonomy (Annex A.5.12)', pageNo: 4, level: 1 },
      { title: '2. Handling, Labelling & Transmission Rules', pageNo: 4, level: 1 },
      { title: '3. Cryptographic Protection & Encryption Standards (Annex A.8.24)', pageNo: 5, level: 1 },
      { title: '4. Data Masking & Anonymization in Non-Prod (Annex A.8.11)', pageNo: 5, level: 1 },
      { title: '5. Retention & Certified Cryptographic Disposal (NIST 800-88)', pageNo: 6, level: 1 },
      { title: '6. Lead Auditor Stage 2 Data Protection Verification Dossier', pageNo: 7, level: 1 }
    ],
    pages: [
      {
        pageNumber: 4,
        title: 'Data Classification Taxonomy & Handling',
        content: `1. Data Classification Taxonomy (Annex A.5.12)
All organizational and customer data processed by ${companyName} must be classified under one of four distinct tiers:`,
        sections: [
          {
            heading: '4-Tier Classification Matrix',
            table: {
              headers: ['Classification Tier', 'Description & Examples', 'Storage & Encryption Mandate', 'Access Control Level'],
              rows: [
                ['Secret / Restricted', 'Customer payment credentials, master encryption keys, passwords, live database backups', 'AES-256 KMS with strict hardware HSM; TLS 1.3 in transit', 'Strict need-to-know; JIT elevation only; zero standing access'],
                ['Confidential', 'Customer PII, proprietary source code, commercial contracts, financial records', 'AES-256 encrypted at rest; TLS 1.3 in transit', 'Authenticated employees with explicit business need'],
                ['Internal', 'Internal company wikis, architectural diagrams, general Slack channels', 'Standard cloud storage encryption', 'All authenticated company staff'],
                ['Public', 'Marketing materials, published whitepapers, public press releases', 'Public web servers / CDN', 'Unrestricted public access']
              ]
            }
          }
        ]
      },
      {
        pageNumber: 5,
        title: 'Cryptographic Protection & Data Masking',
        content: `2. Cryptographic Protection Standards (Annex A.8.24)
Unencrypted storage or transmission of Confidential or Secret data is strictly prohibited across all ${cloudProvider} environments.`,
        sections: [
          {
            heading: 'Mandatory Technical Encryption Guardrails',
            body: `▪ Encryption at Rest: Enforced using AES-256 via Cloud KMS with customer-managed keys (CMK) and automated 365-day rotation.
▪ Encryption in Transit: Enforced using TLS 1.3 across all external endpoints and internal service-to-service microsegmentation. Legacy SSL, TLS 1.0, and TLS 1.1 are disabled at the load balancer.
▪ Data Masking & Non-Prod Hygiene (Annex A.8.11): Production customer PII shall NEVER be copied to staging or development databases without irreversible pseudonymization or synthetic data generation.`
          }
        ]
      },
      {
        pageNumber: 6,
        title: 'Retention & Disposal Standards',
        content: `3. Data Retention & Certified Disposal (Annex A.8.10)
Information assets shall not be retained longer than legally required or contractually permitted.`,
        sections: [
          {
            heading: 'Disposal Standards (NIST SP 800-88 Rev 1)',
            body: `▪ Cloud Data Deletion: Deletion of production customer data upon contract termination must be completed within 30 calendar days, including all live tables, replicas, and automated snapshots.
▪ Physical Hardware Decommissioning: All retired endpoints must undergo certified cryptographic wipe or physical shredding with a Certificate of Destruction issued by an accredited ITAD partner.`
          }
        ]
      },
      {
        pageNumber: 7,
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
                ['Auditor Fieldwork Attestation Verdict', `${auditorDossier.auditorVerdict} - CERTIFIED CONFORMING (Zero Unencrypted Data Stores)`]
              ]
            }
          },
          {
            heading: 'Executive Sign-off',
            body: `Approved by CISO (${cisoName}) and Head of Legal / Data Protection Officer. Effective Date: ${effectiveDate}.`
          }
        ]
      }
    ],
    content: `# ${companyName} - Data Classification & Cryptographic Protection Policy
**Doc Code:** POL-CLS-05 | **Classification:** Confidential - Internal ISMS Use Only | **Standard:** ${framework}
**Document Owner:** ${cisoName} | **Approver:** CISO & Legal Counsel | **Effective Date:** ${effectiveDate}

## 1. 4-Tier Taxonomy (Annex A.5.12)
Secret, Confidential, Internal, Public.

## 2. Technical Guardrails
- 100% data encrypted at rest with AES-256 Cloud KMS.
- 100% traffic encrypted in transit with TLS 1.3.
- Production PII prohibited in staging databases (Annex A.8.11 Data Masking).`
  };
}

export function buildPolDev08(ctx: PolicyTemplateContext): GeneratedDocument {
  const { companyName, framework, cloudProvider, vulnerabilityTool, scmProvider, cisoName, effectiveDate, defaultControlStatements, defaultRevisionHistory } = ctx;

  const auditorDossier = buildAuditorVerificationDossier({
    docCode: 'POL-DEV-08',
    docTitle: 'Secure Software Development Lifecycle (SDLC) Policy',
    companyName,
    clauseOrAnnexA: 'Annex A.8.25 (Secure Development), A.8.28 (Secure Coding), A.8.31 (Separation of Environments)',
    riskId: 'RSK-DEV-01',
    statutoryMandate: 'ISO 27001:2022 A.8.25-A.8.31, MAS TRM Section 9.1, OWASP ASVS Level 2',
    artifactName: `${companyName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}_GITHUB_CI_CD_SECURITY_AUDIT.json`,
    samplingProtocol: 'ISO 19011:2018 §B.3 Sample of 20 pull requests across past 6 months'
  });

  return {
    id: 'doc_pol_dev_08',
    docCode: 'POL-DEV-08',
    title: 'Secure Software Development Lifecycle (SDLC) Policy',
    type: 'POLICY',
    category: 'Software Engineering & DevOps',
    version: '1.0',
    status: 'APPROVED',
    owner: cisoName,
    approver: 'VP Engineering & CISO',
    effectiveDate,
    reviewCycle: 'Annual',
    classification: 'Confidential - Internal ISMS Use Only',
    standard: framework,
    documentOwner: cisoName,
    issuedBy: 'DevSecOps Working Group',
    approvedBy: 'VP Engineering & CISO',
    acknowledgementCount: 28,
    lastModified: new Date().toISOString(),
    documentControlStatements: defaultControlStatements,
    revisionHistory: defaultRevisionHistory,
    tableOfContents: [
      { title: 'Document Control & Revision Record', pageNo: 2, level: 1 },
      { title: 'Table of Contents', pageNo: 3, level: 1 },
      { title: '1. Policy Mandate & Scope (Annex A.8.25)', pageNo: 4, level: 1 },
      { title: '2. Mandatory Automated CI/CD Security Gates & Branch Protection', pageNo: 4, level: 1 },
      { title: '3. Secure Coding Standards & OWASP Top 10 Defenses (Annex A.8.28)', pageNo: 5, level: 1 },
      { title: '4. Strict Separation of Environments (Annex A.8.31)', pageNo: 5, level: 1 },
      { title: '5. Dependency Scanning, SBOM & Third-Party Package Governance', pageNo: 6, level: 1 },
      { title: '6. Lead Auditor Stage 2 SDLC Verification Dossier & Seal', pageNo: 7, level: 1 }
    ],
    pages: [
      {
        pageNumber: 4,
        title: 'SDLC Mandate & CI/CD Security Gates',
        content: `1. Policy Mandate (Annex A.8.25)
This policy governs all software design, development, peer review, automated testing, and deployment pipelines operated by ${companyName} across ${scmProvider} and ${cloudProvider}.

2. Mandatory Automated CI/CD Gates:
All source code changes destined for production must satisfy the following automated gating conditions before merge:`,
        sections: [
          {
            heading: 'Automated Pipeline Security Gates Table',
            table: {
              headers: ['Pipeline Gate', 'Tool / Mechanism', 'Blocking Threshold', 'Bypass Allowance'],
              rows: [
                ['Static Application Security Testing (SAST)', vulnerabilityTool, '0 Critical, 0 High vulnerabilities allowed', 'ZERO - Hard CI/CD block'],
                ['Software Composition Analysis (SCA)', vulnerabilityTool, '0 Critical dependencies with public CVE exploits', 'ZERO - Hard CI/CD block'],
                ['Secret & Credential Scanning', 'GitGuardian / TruffleHog in pre-commit', '0 detected API keys, private keys, or credentials', 'ZERO - Pre-receive hook rejects push'],
                ['Branch Protection & Peer Review', `${scmProvider} Branch Rules`, 'Minimum 1 independent senior engineer peer sign-off', 'Admin bypass strictly disabled']
              ]
            }
          }
        ]
      },
      {
        pageNumber: 5,
        title: 'Secure Coding & Environment Separation',
        content: `3. Secure Coding Standards (Annex A.8.28)
Engineering teams shall implement defensive coding aligned with OWASP Top 10 and CWE Top 25 standards. All inputs must be parameterized and validated server-side.

4. Strict Separation of Environments (Annex A.8.31)
Development, Staging, and Production environments must reside in separate, isolated cloud accounts or VPCs within ${cloudProvider}.`,
        sections: [
          {
            heading: 'Environment Isolation Matrix',
            table: {
              headers: ['Environment', 'Access Level', 'Data Permitted', 'Deployment Mechanism'],
              rows: [
                ['Development', 'Software Developers', 'Synthetic & Mock Data only', 'Local / developer workspace'],
                ['Staging', 'QA & Engineering Leads', 'Anonymized / Tokenized Data only', 'Automated CI/CD pull request merge'],
                ['Production', 'No Direct Human Access (Zero Standing Privileges)', 'Live Customer Data (AES-256 encrypted)', 'Automated GitOps CD pipeline via main branch']
              ]
            }
          }
        ]
      },
      {
        pageNumber: 6,
        title: 'Dependency Governance & Third-Party Packages',
        content: `5. Third-Party Libraries & SBOM Governance
Developers are prohibited from introducing unvetted open-source libraries into production codebases. Every production container image shall generate a cryptographically signed Software Bill of Materials (SBOM).`,
        sections: [
          {
            heading: 'Package Management Rules',
            body: `▪ Package Registry: All dependencies must be pulled from internal, authenticated artifact caches with vulnerability scanning enabled.
▪ Deprecated Packages: Packages with unmaintained code (> 2 years without commits) or open Critical CVEs shall be quarantined within 7 business days.`
          }
        ]
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
                ['Auditor Fieldwork Attestation Verdict', `${auditorDossier.auditorVerdict} - CERTIFIED CONFORMING (Zero Unreviewed Merges)`]
              ]
            }
          },
          {
            heading: 'Executive Sign-off',
            body: `Approved by VP of Engineering and CISO (${cisoName}). Effective Date: ${effectiveDate}.`
          }
        ]
      }
    ],
    content: `# ${companyName} - Secure Software Development Lifecycle Policy
**Doc Code:** POL-DEV-08 | **Classification:** Confidential - Internal ISMS Use Only | **Standard:** ${framework}
**Document Owner:** ${cisoName} | **Approver:** VP Engineering & CISO | **Effective Date:** ${effectiveDate}

## 1. Automated CI/CD Gates (Annex A.8.25 & A.8.28)
- Zero Critical/High vulnerabilities allowed through SAST/SCA gates.
- Mandatory peer branch review in **${scmProvider}**; admin bypass disabled.
- Strict isolation of Dev, Staging, and Production in **${cloudProvider}**.`
  };
}

export function buildPolVul09(ctx: PolicyTemplateContext): GeneratedDocument {
  const { companyName, framework, vulnerabilityTool, cisoName, effectiveDate, defaultControlStatements, defaultRevisionHistory } = ctx;

  const auditorDossier = buildAuditorVerificationDossier({
    docCode: 'POL-VUL-09',
    docTitle: 'Vulnerability Management & Threat Intelligence Policy',
    companyName,
    clauseOrAnnexA: 'Annex A.8.8 (Management of Technical Vulnerabilities) & A.5.7 (Threat Intelligence)',
    riskId: 'RSK-VUL-01',
    statutoryMandate: 'ISO 27001:2022 A.8.8, A.5.7, MAS TRM Section 8.1 & 8.3',
    artifactName: `${companyName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}_VULN_SCAN_REPORT_Q3.pdf`,
    samplingProtocol: 'ISO 19011:2018 §B.3 Sample of 30 past CVE remediation tickets'
  });

  return {
    id: 'doc_pol_vul_09',
    docCode: 'POL-VUL-09',
    title: 'Vulnerability Management & Threat Intelligence Policy',
    type: 'POLICY',
    category: 'Security Operations & Infrastructure',
    version: '1.0',
    status: 'APPROVED',
    owner: cisoName,
    approver: 'CISO & Executive Committee',
    effectiveDate,
    reviewCycle: 'Annual',
    classification: 'Confidential - Internal ISMS Use Only',
    standard: framework,
    documentOwner: cisoName,
    issuedBy: 'SecOps Working Group',
    approvedBy: 'CISO',
    acknowledgementCount: 25,
    lastModified: new Date().toISOString(),
    documentControlStatements: defaultControlStatements,
    revisionHistory: defaultRevisionHistory,
    tableOfContents: [
      { title: 'Document Control & Revision Record', pageNo: 2, level: 1 },
      { title: 'Table of Contents', pageNo: 3, level: 1 },
      { title: '1. Policy Mandate & Threat Intelligence Ingestion (Annex A.5.7)', pageNo: 4, level: 1 },
      { title: '2. Quantitative CVSS Remediation SLAs (Annex A.8.8)', pageNo: 4, level: 1 },
      { title: '3. Vulnerability Scanning Cadences across Containers, Cloud & Endpoints', pageNo: 5, level: 1 },
      { title: '4. Annual Third-Party Penetration Testing Mandate', pageNo: 5, level: 1 },
      { title: '5. Security Exception & Compensating Controls Protocol', pageNo: 6, level: 1 },
      { title: '6. Lead Auditor Stage 2 Vulnerability Verification Dossier', pageNo: 7, level: 1 }
    ],
    pages: [
      {
        pageNumber: 4,
        title: 'Threat Intelligence & CVSS SLAs',
        content: `1. Policy Mandate & Threat Intelligence (Annex A.5.7)
${companyName} ingests actionable threat intelligence from automated CVE feeds, cloud threat advisory circulars, and CISA advisories to proactively detect evolving attack vectors.

2. Enforceable Quantitative CVSS Remediation SLAs (Annex A.8.8):
All identified technical vulnerabilities must be remediated or mitigated within the following strict timeframes from detection:`,
        sections: [
          {
            heading: 'CVSS Remediation SLA Schedule',
            table: {
              headers: ['Severity Tier', 'CVSS v3/v4 Score', 'Mandatory Remediation SLA', 'Escalation Protocol'],
              rows: [
                ['Critical Severity', '9.0 – 10.0', 'Within 72 Hours of discovery', 'Daily executive standup; CISO notified within 4 hours'],
                ['High Severity', '7.0 – 8.9', 'Within 14 Calendar Days', 'Weekly SecOps tracking; Engineering Lead notified'],
                ['Medium Severity', '4.0 – 6.9', 'Within 30 Calendar Days', 'Standard engineering sprint backlog planning'],
                ['Low Severity', '0.1 – 3.9', 'Within 90 Calendar Days', 'Routine maintenance cycle']
              ]
            }
          }
        ]
      },
      {
        pageNumber: 5,
        title: 'Scanning Cadences & Penetration Testing',
        content: `3. Scanning Cadence Standards
Continuous automated scans must execute across all attack surfaces using ${vulnerabilityTool}:`,
        sections: [
          {
            heading: 'Scanning Schedules Table',
            table: {
              headers: ['Target Surface', 'Scanning Cadence', 'Tool / Mechanism', 'Action on SLA Breach'],
              rows: [
                ['Production Container Images', 'Continuous / Every Build', vulnerabilityTool, 'Automated deployment block'],
                ['Cloud Infrastructure (VPCs/IAM)', 'Daily automated scan', 'Cloud Security Posture Mgmt (CSPM)', 'Automated Jira ticket generation'],
                ['External Attack Surface (EASM)', 'Weekly automated scan', 'External perimeter crawler', 'Immediate port closure / WAF rule update'],
                ['Workforce Laptops / Endpoints', 'Weekly background scan', 'Endpoint EDR / Vulnerability agent', 'Quarantine if unpatched > 14 days']
              ]
            }
          },
          {
            heading: '4. Independent Third-Party Penetration Testing',
            body: `An independent, CREST-accredited or certified third-party cybersecurity firm shall perform an annual gray-box penetration test covering production web applications, public APIs, and cloud perimeters. All findings rated Critical or High must be remediated within standard SLAs and re-tested before test sign-off.`
          }
        ]
      },
      {
        pageNumber: 6,
        title: 'Security Exceptions & Compensating Controls',
        content: `5. Vulnerability Exception Management
Where immediate remediation is technically unfeasible due to vendor dependencies or architectural limitations, a formal Security Waiver must be approved by the CISO with compensating WAF rules or network segmentation, expiring in maximum 90 days.`,
        sections: [
          {
            heading: 'Compensating Control Requirements',
            body: `▪ WAF Virtual Patching: Apply immediate virtual patch at the CDN/WAF layer while upstream vendor patch is developed.
▪ Network Isolation: Restrict inbound traffic to internal management VPN subnets.`
          }
        ]
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
                ['Auditor Fieldwork Attestation Verdict', `${auditorDossier.auditorVerdict} - CERTIFIED CONFORMING (Zero Overdue Critical CVEs)`]
              ]
            }
          },
          {
            heading: 'Executive Sign-off',
            body: `Approved by Chief Information Security Officer (${cisoName}). Effective Date: ${effectiveDate}.`
          }
        ]
      }
    ],
    content: `# ${companyName} - Vulnerability Management & Threat Intelligence Policy
**Doc Code:** POL-VUL-09 | **Classification:** Confidential - Internal ISMS Use Only | **Standard:** ${framework}
**Document Owner:** ${cisoName} | **Approver:** CISO | **Effective Date:** ${effectiveDate}

## 1. Quantitative Remediation SLAs (Annex A.8.8)
- Critical (CVSS >= 9.0): Remediated within 72 Hours.
- High (CVSS 7.0-8.9): Remediated within 14 Calendar Days.
- Continuous scans via **${vulnerabilityTool}**; annual independent penetration testing.`
  };
}

export function buildPolAup06(ctx: PolicyTemplateContext): GeneratedDocument {
  const { companyName, framework, mdmProvider, cisoName, effectiveDate, defaultControlStatements, defaultRevisionHistory } = ctx;

  const auditorDossier = buildAuditorVerificationDossier({
    docCode: 'POL-AUP-06',
    docTitle: 'Acceptable Use & Clean Desk / Screen Policy',
    companyName,
    clauseOrAnnexA: 'Annex A.5.10 (Acceptable Use of Information), A.7.7 (Clear Desk and Clear Screen)',
    riskId: 'RSK-HR-03',
    statutoryMandate: 'ISO 27001:2022 A.5.10, A.7.7, MAS TRM Section 4.3',
    artifactName: `${companyName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}_EMPLOYEE_AUP_ATTESTATION_2026.csv`
  });

  return {
    id: 'doc_pol_aup_06',
    docCode: 'POL-AUP-06',
    title: 'Acceptable Use & Clean Desk / Screen Policy',
    type: 'POLICY',
    category: 'Human Resource Security',
    version: '1.0',
    status: 'APPROVED',
    owner: cisoName,
    approver: 'Executive Board / CISO',
    effectiveDate,
    reviewCycle: 'Annual',
    classification: 'Confidential - Internal ISMS Use Only',
    standard: framework,
    documentOwner: cisoName,
    issuedBy: 'People Operations & IT Support',
    approvedBy: 'CISO & Head of HR',
    acknowledgementCount: 40,
    lastModified: new Date().toISOString(),
    documentControlStatements: defaultControlStatements,
    revisionHistory: defaultRevisionHistory,
    tableOfContents: [
      { title: 'Document Control & Revision Record', pageNo: 2, level: 1 },
      { title: 'Table of Contents', pageNo: 3, level: 1 },
      { title: '1. Purpose, Scope & Mandatory Attestation (Annex A.5.10)', pageNo: 4, level: 1 },
      { title: '2. Permitted & Prohibited Activities on Corporate Assets', pageNo: 4, level: 1 },
      { title: '3. Clean Desk & Clear Screen Technical Guardrails (Annex A.7.7)', pageNo: 5, level: 1 },
      { title: '4. Remote Work, Public Wi-Fi & Mobile Device Protection', pageNo: 5, level: 1 },
      { title: '5. Lead Auditor Stage 2 AUP Verification Dossier & Seal', pageNo: 6, level: 1 }
    ],
    pages: [
      {
        pageNumber: 4,
        title: 'Acceptable Use Mandate & Prohibitions',
        content: `1. Policy Mandate & Scope (Annex A.5.10)
This policy establishes behavioral standards governing all employees, contractors, and temporary staff utilizing information assets, corporate laptops, email accounts, and cloud services of ${companyName}. Annual attestation is mandatory for 100% of workforce personnel within 30 calendar days of joining and upon annual re-certification.`,
        sections: [
          {
            heading: 'Permitted vs. Prohibited Activities Table',
            table: {
              headers: ['Category', 'Permitted Activities', 'Strictly Prohibited Activities'],
              rows: [
                ['Software Installation', 'Approved corporate applications via Company Portal', 'Unapproved third-party software, peer-to-peer (P2P), torrents, unauthorized cryptocurrency mining'],
                ['Data Handling', 'Storing business data in approved cloud repositories', 'Forwarding confidential company documents to personal email or unauthorized cloud drives'],
                ['Network Access', 'Using enterprise VPN or ZTNA on secure connections', 'Connecting corporate laptops to unencrypted public Wi-Fi without VPN'],
                ['Device Integrity', 'Enrolling corporate laptops in ${mdmProvider}', 'Jailbreaking, rooting, disabling EDR agents, or bypassing MDM profiles']
              ]
            }
          }
        ]
      },
      {
        pageNumber: 5,
        title: 'Clean Desk, Screen Lock & Remote Work',
        content: `2. Clean Desk & Clear Screen Standards (Annex A.7.7)
Physical security and shoulder-surfing prevention are essential requirements across both corporate offices and remote telework environments.`,
        sections: [
          {
            heading: 'Enforceable Technical Screen Lock Mandate',
            body: `▪ 5-Minute Automated Lock: All corporate laptops and workstations shall automatically lock screens after a maximum of 5 minutes of inactivity. This setting is enforced via ${mdmProvider} and cannot be altered or disabled by users.
▪ Manual Lock Requirement: Personnel shall manually lock screens (Win+L / Cmd+Ctrl+Q) immediately upon stepping away from their workstation.
▪ Clean Desk Mandate: Physical documents containing Confidential or Secret data, physical security tokens, and visitor badges must be locked in secure drawers overnight. Writing passwords on paper or sticky notes is strictly prohibited.`
          }
        ]
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
                ['Auditor Fieldwork Attestation Verdict', `${auditorDossier.auditorVerdict} - CERTIFIED CONFORMING (100% Attestation Attained)`]
              ]
            }
          },
          {
            heading: 'Formal Sign-off',
            body: `Approved by CISO (${cisoName}) and Head of People / HR. Effective Date: ${effectiveDate}.`
          }
        ]
      }
    ],
    content: `# ${companyName} - Acceptable Use & Clean Desk / Screen Policy
**Doc Code:** POL-AUP-06 | **Classification:** Confidential - Internal ISMS Use Only | **Standard:** ${framework}
**Document Owner:** ${cisoName} | **Approver:** CISO & HR | **Effective Date:** ${effectiveDate}

## 1. Clean Desk & Screen (Annex A.7.7)
- 5-minute automated screen lock enforced via **${mdmProvider}**.
- Passwords on sticky notes or physical desks strictly banned.
- 100% workforce annual attestation.`
  };
}

export function buildPolCry07(ctx: PolicyTemplateContext): GeneratedDocument {
  const { companyName, framework, cloudProvider, cisoName, effectiveDate, defaultControlStatements, defaultRevisionHistory } = ctx;

  const auditorDossier = buildAuditorVerificationDossier({
    docCode: 'POL-CRY-07',
    docTitle: 'Cryptographic Controls & Key Management Policy',
    companyName,
    clauseOrAnnexA: 'Annex A.8.24 (Use of Cryptography)',
    riskId: 'RSK-CRY-01',
    statutoryMandate: 'ISO 27001:2022 A.8.24, NIST SP 800-57, MAS TRM Section 4.4',
    artifactName: `${companyName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}_AWS_KMS_KEY_ROTATION_AUDIT.json`
  });

  return {
    id: 'doc_pol_cry_07',
    docCode: 'POL-CRY-07',
    title: 'Cryptographic Controls & Key Management Policy',
    type: 'POLICY',
    category: 'Technical Security Controls',
    version: '1.0',
    status: 'APPROVED',
    owner: cisoName,
    approver: 'CISO & Principal Cryptographer',
    effectiveDate,
    reviewCycle: 'Annual',
    classification: 'Confidential - Internal ISMS Use Only',
    standard: framework,
    documentOwner: cisoName,
    issuedBy: 'Cloud Security Architecture',
    approvedBy: 'CISO',
    acknowledgementCount: 18,
    lastModified: new Date().toISOString(),
    documentControlStatements: defaultControlStatements,
    revisionHistory: defaultRevisionHistory,
    tableOfContents: [
      { title: 'Document Control & Revision Record', pageNo: 2, level: 1 },
      { title: 'Table of Contents', pageNo: 3, level: 1 },
      { title: '1. Cryptographic Mandate & Approved Ciphers (Annex A.8.24)', pageNo: 4, level: 1 },
      { title: '2. Cloud Key Management Service (KMS) Lifecycle & Automated Rotation', pageNo: 4, level: 1 },
      { title: '3. Data-in-Transit Encryption & Deprecated Protocol Sunset', pageNo: 5, level: 1 },
      { title: '4. Lead Auditor Stage 2 Cryptographic Verification Dossier & Seal', pageNo: 6, level: 1 }
    ],
    pages: [
      {
        pageNumber: 4,
        title: 'Cryptographic Mandate & Key Lifecycle',
        content: `1. Policy Mandate & Approved Ciphers (Annex A.8.24)
This policy defines mandatory cryptographic algorithms, key lengths, and key management lifecycles across all data assets of ${companyName}.`,
        sections: [
          {
            heading: 'Approved Cryptographic Ciphers Table',
            table: {
              headers: ['Use Case', 'Approved Algorithm & Minimum Key Length', 'Deprecated / Prohibited Ciphers'],
              rows: [
                ['Symmetric Encryption at Rest', 'AES-GCM with 256-bit keys', 'DES, 3DES, RC4, Blowfish, AES-CBC without HMAC'],
                ['Asymmetric Key Pairs', 'RSA >= 3072-bit (preferred 4096-bit), ECDSA with Curve P-384 / Ed25519', 'RSA < 2048-bit, DSA'],
                ['Cryptographic Hash Functions', 'SHA-256, SHA-384, SHA-512', 'MD5, SHA-1 (strictly prohibited for security)'],
                ['Data in Transit', 'TLS 1.3 (RFC 8446) with PFS (Perfect Forward Secrecy)', 'SSL v2/v3, TLS 1.0, TLS 1.1, unencrypted HTTP/FTP']
              ]
            }
          },
          {
            heading: '2. Cloud KMS Key Lifecycle & Automated Rotation',
            body: `▪ Customer-Managed Keys (CMK): Master encryption keys shall be generated and stored within Hardware Security Modules (FIPS 140-2 Level 3) in ${cloudProvider} KMS.
▪ Automated Key Rotation: Key rotation shall be enabled automatically with a maximum rotation frequency of 365 days.
▪ Key Export Prohibition: Plaintext master keys shall NEVER be exported from the KMS under any circumstances.`
          }
        ]
      },
      {
        pageNumber: 5,
        title: 'Data-in-Transit & Key Destruction',
        content: `3. Data-in-Transit & Key Destruction Protocols`,
        sections: [
          {
            heading: 'Key Destruction Protocol',
            body: `When an encryption key reaches end-of-life or is compromised:
1. Revocation: Key status changed to disabled immediately.
2. 7-Day Pending Deletion Window: Allows emergency recovery if key was tied to live business dependencies.
3. Irreversible Destruction: Key material permanently deleted from HSM after 7 days.`
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
                ['Auditor Fieldwork Attestation Verdict', `${auditorDossier.auditorVerdict} - CERTIFIED CONFORMING (Zero Hardcoded Secrets)`]
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
    content: `# ${companyName} - Cryptographic Controls & Key Management Policy
**Doc Code:** POL-CRY-07 | **Classification:** Confidential - Internal ISMS Use Only | **Standard:** ${framework}
**Document Owner:** ${cisoName} | **Approver:** CISO | **Effective Date:** ${effectiveDate}

## 1. Approved Ciphers (Annex A.8.24)
- AES-256 GCM at rest; TLS 1.3 in transit.
- Automated 365-day KMS key rotation in **${cloudProvider}**; export of plaintext master keys prohibited.`
  };
}

export function buildPolPhy10(ctx: PolicyTemplateContext): GeneratedDocument {
  const { companyName, framework, cloudProvider, cisoName, effectiveDate, defaultControlStatements, defaultRevisionHistory } = ctx;

  const auditorDossier = buildAuditorVerificationDossier({
    docCode: 'POL-PHY-10',
    docTitle: 'Physical & Environmental Security Policy',
    companyName,
    clauseOrAnnexA: 'Annex A.7.1 (Physical Security Perimeters) through A.7.14 (Equipment Disposal)',
    riskId: 'RSK-PHY-01',
    statutoryMandate: 'ISO 27001:2022 A.7.1-A.7.14, MAS TRM Section 7.2',
    artifactName: `${companyName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}_FACILITY_BADGE_ACCESS_LOG.csv`
  });

  return {
    id: 'doc_pol_phy_10',
    docCode: 'POL-PHY-10',
    title: 'Physical & Environmental Security Policy',
    type: 'POLICY',
    category: 'Physical Security & Facilities',
    version: '1.0',
    status: 'APPROVED',
    owner: cisoName,
    approver: 'Head of Facilities & CISO',
    effectiveDate,
    reviewCycle: 'Annual',
    classification: 'Confidential - Internal ISMS Use Only',
    standard: framework,
    documentOwner: cisoName,
    issuedBy: 'Facilities & Physical Security',
    approvedBy: 'CISO & COO',
    acknowledgementCount: 20,
    lastModified: new Date().toISOString(),
    documentControlStatements: defaultControlStatements,
    revisionHistory: defaultRevisionHistory,
    tableOfContents: [
      { title: 'Document Control & Revision Record', pageNo: 2, level: 1 },
      { title: 'Table of Contents', pageNo: 3, level: 1 },
      { title: '1. Physical Security Perimeters & Access Tiers (Annex A.7.1)', pageNo: 4, level: 1 },
      { title: '2. Visitor Registration, Escort & Surveillance Standards (Annex A.7.4)', pageNo: 4, level: 1 },
      { title: '3. Cloud Datacenter Physical Security & Shared Responsibility', pageNo: 5, level: 1 },
      { title: '4. Lead Auditor Stage 2 Physical Security Verification Dossier', pageNo: 6, level: 1 }
    ],
    pages: [
      {
        pageNumber: 4,
        title: 'Physical Perimeters & Visitor Controls',
        content: `1. Physical Security Perimeters (Annex A.7.1)
${companyName} enforces defense-in-depth physical security across all corporate headquarters and facilities. Entry points are secured via electronic access badges with continuous timestamped logging.`,
        sections: [
          {
            heading: 'Visitor Protocol & Surveillance Standards (Annex A.7.4)',
            body: `▪ Visitor Escort: All external visitors must sign the electronic visitor register, present government-issued photo ID, receive a visitor badge, and remain escorted by a full-time employee at all times.
▪ 24/7 CCTV Surveillance: CCTV monitors all perimeter access points, reception lobbies, and server rooms with video recordings retained securely for a minimum of 90 calendar days.`
          }
        ]
      },
      {
        pageNumber: 5,
        title: 'Cloud Datacenter Shared Responsibility',
        content: `2. Cloud Datacenter Physical Security (${cloudProvider})
${companyName} maintains zero physical server racks or on-premise datacenters. Physical datacenter security (fences, biometric access, diesel generators, fire suppression) is contractually delegated to ${cloudProvider} under the Cloud Shared Responsibility Model. Annual SOC 2 Type II reports from ${cloudProvider} are reviewed and archived as compliance evidence.`,
        sections: [
          {
            heading: 'Workstation Sanitization & Certified Disposal (Annex A.7.14)',
            body: `All decommissioned laptops and storage drives are cryptographically sanitized or destroyed in accordance with NIST SP 800-88 Rev 1 by a certified ITAD partner with serialized certificates of destruction retained for 3 years.`
          }
        ]
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
                ['Auditor Fieldwork Attestation Verdict', `${auditorDossier.auditorVerdict} - CERTIFIED CONFORMING (Zero Unescorted Visitors)`]
              ]
            }
          },
          {
            heading: 'Formal Sign-off',
            body: `Approved by Head of Facilities and CISO (${cisoName}). Effective Date: ${effectiveDate}.`
          }
        ]
      }
    ],
    content: `# ${companyName} - Physical & Environmental Security Policy
**Doc Code:** POL-PHY-10 | **Classification:** Confidential - Internal ISMS Use Only | **Standard:** ${framework}
**Document Owner:** ${cisoName} | **Approver:** Facilities & CISO | **Effective Date:** ${effectiveDate}

## 1. Physical Perimeter (Annex A.7.1 & A.7.4)
- Badge-controlled access; 100% escorted visitors; 90-day CCTV video retention.
- Cloud physical datacenter security governed by **${cloudProvider}** SOC 2 Type II assurance.`
  };
}

export function buildPolSup11(ctx: PolicyTemplateContext): GeneratedDocument {
  const { companyName, framework, cloudProvider, identityProvider, cisoName, effectiveDate, defaultControlStatements, defaultRevisionHistory } = ctx;

  const auditorDossier = buildAuditorVerificationDossier({
    docCode: 'POL-SUP-11',
    docTitle: 'Supplier & Third-Party Security Governance Policy',
    companyName,
    clauseOrAnnexA: 'Annex A.5.19 (Supplier Relationships) through A.5.23 (Cloud Services)',
    riskId: 'RSK-SUP-01',
    statutoryMandate: 'ISO 27001:2022 A.5.19-A.5.23, MAS TRM Section 6.1, GDPR Article 28',
    artifactName: `${companyName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}_VENDOR_RISK_REGISTER_2026.xlsx`
  });

  return {
    id: 'doc_pol_sup_11',
    docCode: 'POL-SUP-11',
    title: 'Supplier & Third-Party Security Governance Policy',
    type: 'POLICY',
    category: 'Procurement & Vendor Management',
    version: '1.0',
    status: 'APPROVED',
    owner: cisoName,
    approver: 'CISO & Head of Procurement',
    effectiveDate,
    reviewCycle: 'Annual',
    classification: 'Confidential - Internal ISMS Use Only',
    standard: framework,
    documentOwner: cisoName,
    issuedBy: 'Vendor Governance Committee',
    approvedBy: 'CISO & Legal Counsel',
    acknowledgementCount: 22,
    lastModified: new Date().toISOString(),
    documentControlStatements: defaultControlStatements,
    revisionHistory: defaultRevisionHistory,
    tableOfContents: [
      { title: 'Document Control & Revision Record', pageNo: 2, level: 1 },
      { title: 'Table of Contents', pageNo: 3, level: 1 },
      { title: '1. Vendor Risk Tiering & Assessment Standard (Annex A.5.19)', pageNo: 4, level: 1 },
      { title: '2. Mandatory Contractual Clauses & Data Processing Agreements', pageNo: 4, level: 1 },
      { title: '3. Cloud Service Provider Governance (Annex A.5.23)', pageNo: 5, level: 1 },
      { title: '4. Annual Vendor Audit Reviews & Offboarding Runbooks', pageNo: 5, level: 1 },
      { title: '5. Lead Auditor Stage 2 Supplier Verification Dossier & Seal', pageNo: 6, level: 1 }
    ],
    pages: [
      {
        pageNumber: 4,
        title: 'Vendor Tiering & Contractual Clauses',
        content: `1. Vendor Risk Tiering (Annex A.5.19)
All third-party vendors, suppliers, and cloud SaaS providers engaged by ${companyName} must undergo a formal vendor security risk assessment before contract execution.`,
        sections: [
          {
            heading: 'Vendor Risk Tiering Matrix',
            table: {
              headers: ['Tier', 'Definition & Examples', 'Mandatory Assessment Artifacts', 'Re-evaluation Frequency'],
              rows: [
                ['Tier 1 (Critical)', `Direct access to customer data or core infrastructure (${cloudProvider}, ${identityProvider})`, 'SOC 2 Type II / ISO 27001 certificate, SIG Questionnaire, DPA, Penetration Test summary', 'Annual formal review'],
                ['Tier 2 (High)', 'Processes confidential business data without customer PII (e.g. accounting SaaS)', 'SOC 2 Type II or ISO 27001 certificate, standard DPA', 'Annual review'],
                ['Tier 3 (Standard)', 'Operational SaaS without access to confidential data (e.g. design tools)', 'Terms of Service review, basic security questionnaire', 'Biennial review']
              ]
            }
          },
          {
            heading: '2. Mandatory Contractual Security Clauses',
            body: `All Tier 1 and Tier 2 vendor contracts must include:
▪ Right to Audit: Contractual right to request annual independent audit reports.
▪ Data Breach Notification SLA: Vendor must notify ${companyName} within 24–48 hours of any confirmed security incident affecting company data.
▪ Certified Data Return / Destruction: Vendor must certify complete deletion of company data within 30 days of contract termination.`
          }
        ]
      },
      {
        pageNumber: 5,
        title: 'Cloud Governance & Vendor Offboarding',
        content: `3. Information Security in Cloud Services (Annex A.5.23)
Cloud services shall be configured in strict adherence to published security benchmarks (CIS Benchmarks for ${cloudProvider}). Shadow IT is prohibited; corporate credit cards cannot be used to procure SaaS tools without Security approval.

4. Vendor Offboarding Protocol
Upon contract termination:
a) All API keys, tokens, and SSO federations associated with the vendor are revoked immediately.
b) Confirmation of data destruction received within 30 calendar days.
c) Vendor status updated to Archived in the Skanda Vendor Risk Register.`
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
                ['Auditor Fieldwork Attestation Verdict', `${auditorDossier.auditorVerdict} - CERTIFIED CONFORMING (Zero Unvetted Tier-1 Vendors)`]
              ]
            }
          },
          {
            heading: 'Formal Sign-off',
            body: `Approved by CISO (${cisoName}) and Head of Procurement. Effective Date: ${effectiveDate}.`
          }
        ]
      }
    ],
    content: `# ${companyName} - Supplier & Third-Party Security Governance Policy
**Doc Code:** POL-SUP-11 | **Classification:** Confidential - Internal ISMS Use Only | **Standard:** ${framework}
**Document Owner:** ${cisoName} | **Approver:** CISO & Procurement | **Effective Date:** ${effectiveDate}

## 1. Vendor Tiering (Annex A.5.19)
- Tier 1: Annual SOC 2 Type II / ISO 27001 review; DPA with 24-48h breach notification SLA.
- Cloud Services (Annex A.5.23): CIS benchmark hardening in **${cloudProvider}**.`
  };
}
