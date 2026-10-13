import { GeneratedDocument } from '../types';
import { Iso27001PolicyEngine } from '../services/iso27001PolicyEngine';

export interface AuditorGradeOptions {
  companyName: string;
  industry?: string;
  framework?: string;
  cloudProvider?: 'AWS' | 'GCP' | 'Azure' | 'Multi-Cloud';
  identityProvider?: 'Okta' | 'Google Workspace' | 'Microsoft Azure AD (Entra ID)' | 'JumpCloud';
  mdmProvider?: 'Jamf Pro' | 'Microsoft Intune' | 'Kandji' | 'Automox';
  vulnerabilityTool?: 'Snyk & Trivy' | 'Wiz & AWS Inspector' | 'CrowdStrike Falcon' | 'Qualys';
  scmProvider?: 'GitHub Enterprise' | 'GitLab SaaS' | 'Bitbucket Data Center';
  departments?: string[];
  cisoName?: string;
  effectiveDate?: string;
}

export interface AuditorReadinessScorecard {
  overallReadinessScore: number; // 0-100
  passedChecks: number;
  totalChecks: number;
  verdict: 'AUDIT_READY' | 'MINOR_REMEDIATION_NEEDED' | 'SHELFWARE_RISK_FAIL';
  criteria: Array<{
    id: string;
    clause: string;
    title: string;
    description: string;
    status: 'PASS' | 'WARNING' | 'FAIL';
    auditorExpectation: string;
    findingIfMissing: string;
  }>;
}

export function assessTenantAuditorReadiness(docs: GeneratedDocument[]): AuditorReadinessScorecard {
  const total = docs.length;
  if (total === 0) {
    return {
      overallReadinessScore: 0,
      passedChecks: 0,
      totalChecks: 7,
      verdict: 'SHELFWARE_RISK_FAIL',
      criteria: []
    };
  }

  const hasDocControl = docs.every(d => d.revisionHistory && d.revisionHistory.length > 0 && d.documentControlStatements);
  const hasPages = docs.filter(d => d.pages && d.pages.length >= 3).length >= Math.ceil(total * 0.75);
  const hasSpecificSlas = docs.some(d => d.content.includes('72 Hours') || d.content.includes('4 Hours') || d.content.includes('14 calendar days'));
  const hasRaci = docs.some(d => d.content.includes('RACI') || (d.pages && d.pages.some(p => p.content.includes('RACI') || (p.sections && p.sections.some(s => s.heading?.includes('RACI') || s.body?.includes('RACI'))))));
  const hasArtifacts = docs.some(d => d.content.includes('Auditor Evidence') || d.content.includes('Artifact') || (d.pages && d.pages.some(p => p.content.includes('Auditor Evidence'))));
  const hasTechBindings = docs.some(d => d.content.includes('AWS') || d.content.includes('Okta') || d.content.includes('GitHub') || d.content.includes('Snyk'));
  const hasExceptionProcess = docs.some(d => d.content.includes('Exception') || d.content.includes('Waiver'));

  const criteria = [
    {
      id: 'c1',
      clause: 'ISO 27001:2022 Clause 7.5 (Documented Information)',
      title: 'Formal Document Control & Versioning Metadata',
      description: 'Documents must feature unique IDs, classifications, author, approver, issue date, and unedited revision tables.',
      status: (hasDocControl ? 'PASS' : 'FAIL') as 'PASS' | 'FAIL',
      auditorExpectation: 'External auditors will issue a Minor NC if documents lack author/approver sign-offs or version history tables.',
      findingIfMissing: 'Clause 7.5.2 Failure: Documented information lacks formal identification, description, and executive review approval records.'
    },
    {
      id: 'c2',
      clause: 'ISO 27001:2022 Clause 4.3 & 5.2 (Scope & Context)',
      title: 'Real Organizational Context & Scope Boundaries',
      description: 'Policies must reference actual company entity name, active cloud hosting regions, and registered in-scope departments.',
      status: (docs.every(d => !d.content.includes('[Company Name]') && !d.content.includes('ACME Corp')) ? 'PASS' : 'FAIL') as 'PASS' | 'FAIL',
      auditorExpectation: 'Auditors look for uncustomized template placeholders (e.g. "[Insert Company Name]"). Presence of placeholders guarantees Stage 1 rejection.',
      findingIfMissing: 'Clause 4.3 Failure: Scope of the information security management system is generic and fails to determine boundaries and applicability.'
    },
    {
      id: 'c3',
      clause: 'ISO 27001:2022 Clause 8.1 & Annex A Controls',
      title: 'Quantitative Technical Baselines & Quantitative SLAs',
      description: 'Must define measurable, testable parameters: 72h Critical CVSS patch SLA, 24h leaver cutoff, 4h RTO / 15m RPO, 14-char MFA passwords.',
      status: (hasSpecificSlas ? 'PASS' : 'WARNING') as 'PASS' | 'WARNING',
      auditorExpectation: 'Vague statements like "passwords must be strong" or "systems must be patched regularly" are rejected as non-verifiable shelfware.',
      findingIfMissing: 'Clause 8.1 Failure: Operational planning and control lacks documented criteria for processes and acceptance of security deliverables.'
    },
    {
      id: 'c4',
      clause: 'ISO 27001:2022 Clause 5.3 (Organizational Roles)',
      title: 'Explicit RACI Matrix & Functional Ownership',
      description: 'Clearly designated Responsible, Accountable, Consulted, and Informed parties for each control domain.',
      status: (hasRaci ? 'PASS' : 'FAIL') as 'PASS' | 'FAIL',
      auditorExpectation: 'Lead auditor interviews require verifying that named roles understand their explicit operational mandates.',
      findingIfMissing: 'Clause 5.3 Failure: Responsibilities and authorities for roles relevant to information security are not assigned or communicated.'
    },
    {
      id: 'c5',
      clause: 'ISO 27001:2022 Annex A.5 to A.8 (Technology Integration)',
      title: 'Bound Technical Guardrails & Cloud Architecture',
      description: 'Policies explicitly bind actual enterprise tooling: IdP (Okta/Google), Cloud (AWS/GCP), MDM, CI/CD code scanning (Snyk/GitHub).',
      status: (hasTechBindings ? 'PASS' : 'WARNING') as 'PASS' | 'WARNING',
      auditorExpectation: 'Auditors will cross-examine policy rules against your actual AWS IAM, GitHub branch protection, and IdP logs.',
      findingIfMissing: 'Annex A.8.32 / A.5.15 Failure: Access control and software development policies do not reflect real technical configurations in place.'
    },
    {
      id: 'c6',
      clause: 'ISO 27001:2022 Clause 9.1 & 9.2 (Performance Evaluation)',
      title: 'Documented Auditor Evidence Artifacts & Sampling Checklist',
      description: 'Every policy details the exact tangible artifacts the external auditor will sample during Stage 2 fieldwork.',
      status: (hasArtifacts ? 'PASS' : 'WARNING') as 'PASS' | 'WARNING',
      auditorExpectation: 'Auditor cannot certify without sampling 20-30 real objective evidence records corresponding to policy assertions.',
      findingIfMissing: 'Clause 9.1 Failure: Organization has not determined what shall be monitored and measured, nor the methods for valid results.'
    },
    {
      id: 'c7',
      clause: 'ISO 27001:2022 Clause 6.1.3 & 8.1 (Operational Governance)',
      title: 'Formal Security Exception & Waiver Governance',
      description: 'Documented process for requesting, risk-assessing, and approving temporary policy exceptions with mandatory expiry dates.',
      status: (hasExceptionProcess ? 'PASS' : 'FAIL') as 'PASS' | 'FAIL',
      auditorExpectation: 'Unmanaged technical bypasses without logged exception waivers represent major audit non-conformities.',
      findingIfMissing: 'Clause 8.1 Failure: Deviations and planned changes are not controlled, and unintended changes are not reviewed for adverse effects.'
    }
  ];

  const passedCount = criteria.filter(c => c.status === 'PASS').length;
  const warningCount = criteria.filter(c => c.status === 'WARNING').length;
  const overallReadinessScore = Math.round(((passedCount * 1.0 + warningCount * 0.5) / criteria.length) * 100);

  let verdict: 'AUDIT_READY' | 'MINOR_REMEDIATION_NEEDED' | 'SHELFWARE_RISK_FAIL' = 'AUDIT_READY';
  if (overallReadinessScore < 70) {
    verdict = 'SHELFWARE_RISK_FAIL';
  } else if (overallReadinessScore < 90) {
    verdict = 'MINOR_REMEDIATION_NEEDED';
  }

  return {
    overallReadinessScore,
    passedChecks: passedCount,
    totalChecks: criteria.length,
    verdict,
    criteria
  };
}

export function generateAuditorGradeDocumentSuite(options: AuditorGradeOptions): GeneratedDocument[] {
  const {
    companyName,
    industry = 'Technology, Cloud SaaS & FinTech',
    framework = 'ISO/IEC 27001:2022 & ISO/IEC 27002:2022',
    cloudProvider = 'AWS',
    identityProvider = 'Okta',
    mdmProvider = 'Jamf Pro',
    vulnerabilityTool = 'Snyk & Trivy',
    scmProvider = 'GitHub Enterprise',
    departments = ['Executive Leadership', 'Software Engineering & DevOps', 'IT & Cloud Infrastructure', 'Product & QA', 'People Operations & HR', 'Finance & Procurement'],
    cisoName = 'Chief Information Security Officer (CISO)',
    effectiveDate = '15 January 2026'
  } = options;

  const defaultControlStatements = [
    `This document is the official, confidential property of ${companyName} and shall not be reproduced, copied, or distributed, in whole or in part, without prior written approval from the ${cisoName}.`,
    `This document is maintained under formal revision control pursuant to ISO/IEC 27001:2022 Clause 7.5. Manual or unauthorized penciled alterations invalidate this record.`,
    `All amendments, periodic updates, or exceptions to this document must be reviewed by the ISMS Working Group and formally ratified by the ${cisoName} and Executive Management.`
  ];

  const defaultRevisionHistory = [
    {
      sNo: '01',
      reviewDate: effectiveDate,
      pageNo: 'All Pages',
      issueNo: '1.0',
      changeDescription: 'Initial comprehensive synthesis for ISO/IEC 27001:2022 Stage 1 & Stage 2 certification.',
      approvedBy: cisoName
    }
  ];

  // 1. POL-ISMS-01: Information Security Policy (Mandatory Clause 5.2)
  const polIsms01: GeneratedDocument = {
    id: 'doc_pol_isms_01',
    docCode: 'POL-ISMS-01',
    title: 'Information Security Policy',
    type: 'POLICY',
    category: 'Governance & Leadership',
    version: '1.0',
    status: 'APPROVED',
    owner: cisoName,
    approver: 'Executive Board / Chief Executive Officer (CEO)',
    effectiveDate,
    reviewCycle: 'Annual',
    classification: 'Confidential - Internal ISMS Use Only',
    standard: framework,
    documentOwner: cisoName,
    issuedBy: 'ISMS Steering Committee',
    approvedBy: 'CEO & Board of Directors',
    acknowledgementCount: 28,
    lastModified: new Date().toISOString(),
    documentControlStatements: defaultControlStatements,
    revisionHistory: defaultRevisionHistory,
    tableOfContents: [
      { title: 'Document Control & Revision Record', pageNo: 2, level: 1 },
      { title: 'Table of Contents', pageNo: 3, level: 1 },
      { title: '1. Executive Mandate & Purpose (Clause 5.1 & 5.2)', pageNo: 4, level: 1 },
      { title: '2. Scope & Organizational Context (Clause 4.1 - 4.3)', pageNo: 4, level: 1 },
      { title: '3. Information Security Objectives & CIA Criteria (Clause 6.2)', pageNo: 5, level: 1 },
      { title: '4. Core Policy Principles & Technical Guardrails', pageNo: 5, level: 1 },
      { title: '5. Governance & RACI Roles (Clause 5.3)', pageNo: 6, level: 1 },
      { title: '6. Documented Exception & Waiver Process (Clause 8.1)', pageNo: 6, level: 1 },
      { title: '7. Performance Monitoring & Internal Audit (Clause 9.1 & 9.2)', pageNo: 7, level: 1 },
      { title: '8. External Auditor Evidence Artifacts & Checklist', pageNo: 7, level: 1 },
      { title: '9. Validity, Disciplinary Enforcement & Distribution', pageNo: 8, level: 1 }
    ],
    pages: [
      {
        pageNumber: 4,
        title: 'Executive Mandate, Purpose & Scope',
        content: `1. Executive Mandate & Purpose
This Information Security Policy represents the highest governance directive issued by Top Management and the Executive Board of ${companyName}. The purpose of this policy is to establish, implement, operate, maintain, and continually improve an Information Security Management System (ISMS) in full compliance with ISO/IEC 27001:2022.

2. Scope & Organizational Context (Clause 4.1 - 4.3)
This policy governs all operations, personnel, third-party contractors, systems, networks, and data repositories belonging to or processed by ${companyName}.
- Entity Name: ${companyName}
- Industry Classification: ${industry}
- In-Scope Production Cloud Infrastructure: ${cloudProvider} multi-region architecture
- In-Scope Departments: ${departments.join(', ')}
- Physical & Remote Boundaries: Corporate headquarters, authorized remote employee endpoints managed via ${mdmProvider}, and federated SaaS environments managed via ${identityProvider}.`,
        sections: [
          {
            heading: '1. Executive Mandate & Leadership Commitment (ISO 27001 Clause 5.1)',
            body: `Top Management of ${companyName} demonstrates leadership and active commitment to information security by:
a) Ensuring information security policies and strategic objectives are compatible with organizational goals.
b) Ensuring the systematic allocation of budgetary, human, and technical resources.
c) Directing and supporting personnel to contribute to the effectiveness of the ISMS.
d) Promoting continuous risk mitigation and zero tolerance for intentional security bypasses.`
          },
          {
            heading: '2. Scope Boundaries & Cloud Architecture (ISO 27001 Clause 4.3)',
            body: `The ISMS boundary encompasses the end-to-end design, development, cloud infrastructure hosting, deployment, operations, and support of ${companyName}'s proprietary platforms and customer-facing services.
Primary Infrastructure Components:
▪ Production Cloud: Hosted in ${cloudProvider} with strict VPC subnet isolation and AES-256 KMS encryption.
▪ Central Identity Federation: ${identityProvider} with mandatory WebAuthn/FIDO2 hardware-backed MFA.
▪ Code Repositories: ${scmProvider} with enforced peer-reviewed branch protection gates.
▪ Workforce Endpoints: Managed under ${mdmProvider} with FileVault/BitLocker 256-bit full disk encryption.`
          }
        ]
      },
      {
        pageNumber: 5,
        title: 'Information Security Objectives & Principles',
        content: `3. Information Security Objectives (Clause 6.2)
${companyName} commits to measurable information security objectives aligned with the CIA triad:
- Confidentiality: Zero unauthorized disclosures of customer PII, secret encryption keys, or source code.
- Integrity: 100% cryptographic verification of production software commits, build pipelines, and transactional databases.
- Availability: Guaranteed 99.9% uptime SLA for production workloads with Recovery Time Objective (RTO) <= 4 Hours.`,
        sections: [
          {
            heading: '3. Measurable Information Security Objectives (Clause 6.2)',
            body: `The organization establishes the following measurable targets, tracked quarterly by the CISO:`,
            table: {
              headers: ['Objective Area', 'Measurable Key Metric', 'Frequency', 'Responsible Lead'],
              rows: [
                ['Confidentiality', '0 unauthorized data disclosures; 100% data encrypted at rest (AES-256)', 'Continuous', 'CISO / Cloud Security'],
                ['Integrity', '100% production deployments verified via automated CI/CD security gates', 'Every Release', 'VP of Engineering'],
                ['Availability', '99.9% cloud infrastructure availability; RTO <= 4h; RPO <= 15m', 'Monthly Review', 'Head of DevOps / SRE'],
                ['Compliance & Audits', 'Zero Major Non-Conformities across internal and external ISO audits', 'Annual Audit', 'Lead Compliance Officer'],
                ['Workforce Awareness', '>= 95% completion rate of annual security training within 30 days of hire', 'Quarterly', 'Head of People Operations']
              ]
            }
          },
          {
            heading: '4. Core Policy Principles & Technical Guardrails',
            body: `All operational units must uphold the following foundational rules:
▪ Principle of Least Privilege (PoLP): Access rights are denied by default and provisioned on a strictly justified, role-based need-to-know basis.
▪ Defense in Depth: Layered security controls spanning network firewalls, WAF, endpoint detection, container runtime security, and automated code analysis (${vulnerabilityTool}).
▪ Cryptographic Assurance: All data in transit must enforce TLS 1.3; all persistent storage must enforce AES-256 with managed KMS keys.`
          }
        ]
      },
      {
        pageNumber: 6,
        title: 'Governance RACI Matrix & Exceptions',
        content: `5. Governance & RACI Roles (Clause 5.3)
Information security governance is distributed across key organizational roles with clear accountability.`,
        sections: [
          {
            heading: '5. Governance & RACI Matrix (ISO 27001 Clause 5.3)',
            body: `R = Responsible for execution | A = Accountable for outcome | C = Consulted for expertise | I = Informed of status`,
            table: {
              headers: ['Security Domain / Function', 'Board / CEO', 'CISO', 'DevOps / IT', 'HR / People', 'Employees'],
              rows: [
                ['ISMS Governance & Policy Ratification', 'A', 'R', 'C', 'C', 'I'],
                ['Risk Assessment & Treatment Plan', 'A', 'R', 'C', 'C', 'I'],
                ['Cloud & Network Access Control', 'I', 'A', 'R', 'C', 'I'],
                ['Joiner, Mover & Leaver (JML) Process', 'I', 'C', 'R', 'A', 'I'],
                ['Vulnerability Patching & SLA Enforcement', 'I', 'A', 'R', 'I', 'I'],
                ['Disaster Recovery & Failover Testing', 'I', 'A', 'R', 'I', 'I'],
                ['Acceptable Use & Policy Attestation', 'I', 'C', 'I', 'A', 'R']
              ]
            }
          },
          {
            heading: '6. Formal Exception & Security Waiver Process (Clause 8.1)',
            body: `Under no circumstances shall any employee, developer, or contractor bypass established technical security controls without an approved Security Waiver.
Waiver Protocol:
1. Formal Application: Requestor submits an Exception Request in Jira detailing the business justification and technical constraints.
2. Risk Assessment: The Security Team evaluates inherent risk and requires compensating controls (e.g. enhanced logging, IP whitelisting).
3. Executive Approval: Exceptions require written sign-off from the ${cisoName}.
4. Sunset Expiration: All exceptions expire automatically after maximum 90 days, requiring re-assessment.`
          }
        ]
      },
      {
        pageNumber: 7,
        title: 'Performance Monitoring & Auditor Evidence',
        content: `7. Performance Monitoring & Internal Audit (Clause 9.1 & 9.2)
${companyName} conducts internal audits at planned intervals not exceeding 12 months to verify whether the ISMS conforms to ISO/IEC 27001:2022.

8. External Auditor Evidence Artifacts & Sampling Checklist
The following tangible artifacts are maintained in the Skanda GRC repository for external certification auditor inspection:`,
        sections: [
          {
            heading: '7. Measurement, Evaluation & Management Review (Clause 9.1 & 9.3)',
            body: `Top Management reviews the ISMS at planned intervals (minimum bi-annually) to ensure its continuing suitability, adequacy, and effectiveness.
Inputs to Management Review:
▪ Results of internal and external audits, including status of corrective actions (Clause 10.1).
▪ Feedback from interested parties and enterprise client security assessments.
▪ Telemetry trends, incident root cause analyses, and vulnerability remediation metrics.`
          },
          {
            heading: '8. External Auditor Evidence Artifacts Checklist (Stage 1 & Stage 2)',
            body: `The Lead Auditor will sample the following verified operational evidence during certification fieldwork:`,
            table: {
              headers: ['Audit Sample Artifact', 'Verification Source', 'Retention Period', 'Lead Auditor Expectation'],
              rows: [
                ['Approved Policy Sign-off', 'Skanda GRC / Board Minutes', '3 Years', 'Verify CEO/CISO digital signatures and annual review date.'],
                ['Employee Policy Attestations', 'Cryptographic SHA-256 Log', '3 Years', 'Verify 100% of workforce acknowledged policy within 30 days.'],
                ['Quarterly Management Review Minutes', 'Executive Board Minutes', '5 Years', 'Confirm Top Management reviewed ISMS metrics, risks, and audit findings.'],
                ['Internal Audit Report & Findings', 'Skanda Internal Audit Module', '3 Years', 'Verify independent auditor evaluated all Clauses 4-10 and Annex A controls.'],
                ['Approved Security Exception Register', 'GRC Waiver Database', '3 Years', 'Inspect documented compensating controls and expiration dates.']
              ]
            }
          }
        ]
      },
      {
        pageNumber: 8,
        title: 'Enforcement & Distribution',
        content: `9. Validity, Disciplinary Enforcement & Distribution
This Policy document is effective from ${effectiveDate}. The owner of this document is the ${cisoName}, who must review and update the document at least once annually.

Enforcement
Adherence to this policy is mandatory. Violations, negligence, or deliberate bypassing of security controls shall result in disciplinary action up to and including termination of employment, revocation of access, and potential civil or criminal litigation.

Distribution
Table:
Name: All Personnel, Contractors & Vendors | Title: Authorized System Users`,
        sections: [
          {
            heading: 'Validity and Document Management',
            body: `This Policy is effective immediately upon executive ratification (${effectiveDate}). The ${cisoName} maintains accountability for annual review, or immediate review in the event of significant architectural modifications or critical security incidents.`
          },
          {
            heading: 'Disciplinary Enforcement & Non-Conformity Linkage',
            body: `Policy non-compliance discovered during internal audits, vulnerability reviews, or incident investigations shall be logged as formal Non-Conformities in the Skanda GRC CAPA Module (Clause 10.1). Root cause analysis using the 5-Whys methodology shall be completed within 14 calendar days.`
          },
          {
            heading: 'Distribution List',
            table: {
              headers: ['Target Audience', 'Distribution Channel', 'Attestation Requirement'],
              rows: [
                ['All Full-Time & Contract Employees', 'Skanda GRC Employee Portal', 'Mandatory Annual Digital Signature'],
                ['Third-Party Vendors & Cloud Contractors', 'Procurement Vendor Portal', 'Signed Acknowledgment in Master Service Agreement'],
                ['External ISO 27001 Lead Auditors', 'Auditor Read-Only Workstation', 'Inspection under Formal Confidentiality Agreement']
              ]
            }
          }
        ]
      }
    ],
    content: `# ${companyName} - Information Security Policy
**Document Ref:** POL-ISMS-01 | **Classification:** Confidential - Internal ISMS Use Only | **Standard:** ${framework}
**Document Owner:** ${cisoName} | **Approver:** Executive Board / CEO | **Effective Date:** ${effectiveDate} | **Review Cycle:** Annual

## 1. Executive Mandate & Purpose (ISO 27001:2022 Clause 5.1 & 5.2)
This Information Security Policy establishes the executive directive and operational commitment of **${companyName}** towards creating, operating, monitoring, reviewing, and continually improving an Information Security Management System (ISMS) certified against **${framework}**.

## 2. Scope & Organizational Context (Clause 4.1 - 4.3)
The boundary of the ISMS encompasses all business activities, core applications, customer-facing SaaS environments, workforce endpoints, and corporate facilities operated by ${companyName}.
- **Legal Entity:** ${companyName}
- **Industry Sector:** ${industry}
- **Cloud Infrastructure:** Multi-region ${cloudProvider} infrastructure with isolated production VPCs.
- **Identity Architecture:** Centralized SSO with ${identityProvider} enforcing phishing-resistant MFA.
- **In-Scope Departments:** ${departments.join(', ')}.

## 3. Information Security Objectives (Clause 6.2)
${companyName} establishes measurable performance indicators for information security:
1. **Confidentiality:** 0 unauthorized disclosures of sensitive customer data, secrets, or proprietary algorithms. 100% data at rest encrypted using AES-256.
2. **Integrity:** 100% cryptographic verification of production software commits, build pipelines, and transactional databases.
3. **Availability:** Guaranteed 99.9% uptime SLA for production workloads; Recovery Time Objective (RTO) <= 4 Hours; Recovery Point Objective (RPO) <= 15 Minutes.

## 4. Governance RACI Matrix (Clause 5.3)
- **Executive Board / CEO:** Accountable for ISMS resources, risk appetite, and strategic security budget.
- **${cisoName}:** Responsible for policy formulation, threat monitoring, audit execution, and external auditor coordination.
- **Engineering & DevOps Leads:** Responsible for implementing technical guardrails, automated CI/CD scans, and cloud configuration baselines.
- **People Operations / HR:** Accountable for pre-employment screening, employee policy acknowledgments, and same-day leaver notifications.
- **All Personnel:** Responsible for upholding acceptable use rules, maintaining device hygiene, and reporting incidents within 1 hour.

## 5. Formal Security Exceptions & Waivers (Clause 8.1)
No technical security control may be circumvented without an approved Security Waiver logged in Skanda GRC. Waivers require a formal risk assessment, documented compensating controls, ${cisoName} written approval, and expire automatically after a maximum of 90 days.

## 6. Auditor Evidence Checklist (Clause 9.1 & 9.2)
During Stage 1 and Stage 2 certification audits, the Lead Auditor will sample:
- Executive Board minutes approving the Information Security Policy.
- Cryptographic SHA-256 employee policy acknowledgment audit logs.
- Documented annual Internal Audit Report and Management Review Minutes.
- Approved Security Exception Register with documented compensating controls.`
  };

  // 2. POL-ACC-02: Access Control & Identity Governance Policy (A.5.15, A.5.16, A.5.18, A.8.2, A.8.5)
  const polAcc02: GeneratedDocument = {
    id: 'doc_pol_acc_02',
    docCode: 'POL-ACC-02',
    title: 'Access Control & Identity Governance Policy',
    type: 'POLICY',
    category: 'Identity & Access Management',
    version: '1.0',
    status: 'APPROVED',
    owner: 'Head of Information Technology & Security',
    approver: cisoName,
    effectiveDate,
    reviewCycle: 'Annual',
    classification: 'Confidential - Internal ISMS Use Only',
    standard: framework,
    documentOwner: 'Head of IT & Security',
    issuedBy: 'Identity & Access Committee',
    approvedBy: cisoName,
    acknowledgementCount: 26,
    lastModified: new Date().toISOString(),
    documentControlStatements: defaultControlStatements,
    revisionHistory: defaultRevisionHistory,
    tableOfContents: [
      { title: 'Document Control', pageNo: 2, level: 1 },
      { title: 'Table of Contents', pageNo: 3, level: 1 },
      { title: '1. Objective & Scope (Annex A.5.15)', pageNo: 4, level: 1 },
      { title: '2. User Registration & Lifecycle Governance (A.6.5)', pageNo: 4, level: 1 },
      { title: '3. Authentication & Password Standards (A.5.17)', pageNo: 5, level: 1 },
      { title: '4. Privileged Access Management (PAM) & JIT Elevation (A.5.18)', pageNo: 5, level: 1 },
      { title: '5. Quarterly Access Recertification (A.5.16)', pageNo: 6, level: 1 },
      { title: '6. Auditor Evidence & Verification Checklist', pageNo: 6, level: 1 }
    ],
    pages: [
      {
        pageNumber: 4,
        title: 'Objective & Lifecycle Governance',
        content: `1. Objective & Scope (Annex A.5.15 & A.5.16)
To govern logical and physical access permissions across ${companyName}'s networks, applications, production databases, and cloud infrastructure (${cloudProvider}), ensuring that access is granted solely on the Principle of Least Privilege (PoLP) and Role-Based Access Control (RBAC).

2. User Registration & Lifecycle Governance (A.6.5)
- Joiners: Access is provisioned strictly upon HR confirmation of verified background check and signed non-disclosure agreement. Provisioning is role-based via ${identityProvider} directory sync.
- Movers: Transferring personnel have former department permissions revoked within 48 hours.
- Leavers (Same-Day Revocation): Upon termination, HR issues automated webhook to IT. All accounts, Active Directory/Okta sessions, and API tokens are suspended within <= 24 hours of notification (immediate for hostile exits).`,
        sections: [
          {
            heading: '1. Access Control Objectives & Principles (Annex A.5.15)',
            body: `Access to organizational information and other associated assets shall be restricted in accordance with the established business and security requirements.
Principles:
▪ Need-to-Know: Personnel only receive permissions essential to perform assigned duties.
▪ Segregation of Duties (SoD): High-impact tasks (e.g. database schema change, payment approval, user provisioning) require multi-person authorization.
▪ Zero Standing Privileges in Production: Direct write or administrative access to production ${cloudProvider} infrastructure is prohibited. Temporary Just-In-Time (JIT) access must be requested with automated expiration.`
          },
          {
            heading: '2. User Account Provisioning & Deprovisioning Timelines',
            table: {
              headers: ['Lifecycle Event', 'Maximum SLA Window', 'Responsible Owner', 'Verification Evidence Artifact'],
              rows: [
                ['New Hire Provisioning', 'Within 24h of confirmed start date', 'IT Support & Line Manager', 'Signed HR Welcome & Jira Access Request Ticket'],
                ['Department Transfer (Mover)', '<= 48h from department change', 'Receiving Manager & IT', 'Diff report showing previous entitlements revoked'],
                ['Standard Leaver Deprovisioning', '<= 24 Hours from separation', 'IT Helpdesk & People Ops', 'Okta user suspension timestamp & Jamf wipe receipt'],
                ['Involuntary / Hostile Termination', '<= 15 Minutes (Immediate Lockout)', 'Security Operations & HR', 'Instant session invalidation & credential revoke audit log']
              ]
            }
          }
        ]
      },
      {
        pageNumber: 5,
        title: 'Authentication & Privileged Access Rules',
        content: `3. Authentication Standards (Annex A.5.17)
- Multi-Factor Authentication (MFA): Mandatory for 100% of employees and contractors across ${identityProvider}, VPN, ${scmProvider}, and ${cloudProvider} consoles. SMS-based MFA is strictly prohibited; WebAuthn/FIDO2 hardware keys or time-based one-time password (TOTP) authenticators are required.
- Password Complexity: Minimum 14 characters, combining uppercase, lowercase, numbers, and special symbols; OR managed via corporate password manager.
- Account Lockout: Enforced lockout after 5 consecutive invalid login attempts. Session idle timeout enforced after 15 minutes of inactivity.

4. Privileged Access Management (PAM) (Annex A.5.18)
- Administrative accounts must be separated from standard daily browsing/email accounts.
- Root cloud accounts (${cloudProvider}) must be secured with hardware security tokens stored in an executive vault, with emergency break-glass procedures documented and monitored via SIEM alerts.`,
        sections: [
          {
            heading: '3. Technical Password & MFA Baselines',
            body: `All identity stores and directory integrations must enforce the following non-negotiable configuration baselines:`,
            table: {
              headers: ['Security Parameter', 'Enforced Technical Baseline', 'Auditor Verification Method'],
              rows: [
                ['Minimum Password Length', '>= 14 alphanumeric characters', 'Inspect IdP Password Policy Settings'],
                ['MFA Enforcement', 'Mandatory across all users; FIDO2/TOTP only', 'Inspect IdP MFA Enrollment Report (100% target)'],
                ['Account Lockout Threshold', '5 failed login attempts', 'Simulated failed login test in staging IdP'],
                ['Session Idle Timeout', '15 minutes automatic screen/session lock', 'Inspect MDM Profile and IdP session policies'],
                ['Credential Re-use Prevention', 'Minimum 10 previous passwords remembered', 'Inspect IdP Password History configurations']
              ]
            }
          }
        ]
      },
      {
        pageNumber: 6,
        title: 'Quarterly Access Recertification & Auditor Evidence',
        content: `5. Quarterly Access Recertification (Annex A.5.16)
Department managers must review and formally re-certify the access privileges of all reporting staff and contractor accounts every 90 days.
- Inactive Accounts: Accounts with no activity for 60 consecutive days are automatically disabled.
- Failure to Certify: If a department manager fails to complete recertification within 10 business days, elevated privileges are automatically downgraded.

6. Auditor Evidence & Verification Checklist
The Lead Auditor will sample:
- Okta/IdP quarterly access review campaign exports signed by department managers.
- JML sampling: 3 recent joiners and 3 recent leavers comparing HR termination date vs. IdP account deactivation timestamp.
- Root cloud account MFA and break-glass log audit.`,
        sections: [
          {
            heading: '5. Access Rights Review Process (Annex A.5.16)',
            body: `Asset owners and department managers review user access rights at regular planned intervals (quarterly) and after any significant organizational change.
Recertification Workflow:
1. Automated Campaign Trigger: On the 1st day of every quarter, Skanda GRC generates an access entitlement ledger for every department.
2. Manager Review: Department heads review every permission, checking for role changes, project conclusions, or privilege creep.
3. Remediation & Closure: Excessive access is revoked within 5 business days, and the signed recertification report is archived for external audit inspection.`
          },
          {
            heading: '6. Stage 2 Audit Sample Inspection Checklist',
            body: `External certification auditors will request the following exact proof artifacts during the Stage 2 on-site/remote audit:`,
            table: {
              headers: ['Auditor Evidence Artifact', 'Sampling Size', 'Audit Pass Criteria'],
              rows: [
                ['Leaver Revocation Logs', '5 random terminated staff', 'IdP account disable timestamp must be <= 24 hours from HR separation date.'],
                ['New Hire Access Approvals', '5 random new hires', 'Ticket shows manager approval prior to account activation; background check complete.'],
                ['Quarterly Access Review Ledger', 'Past 4 Quarters', '100% of departments have signed manager recertification approvals on file.'],
                ['Privileged Cloud IAM Roles', 'All Admin Roles', 'Zero permanent standing root admin access; all JIT elevation sessions logged with ticket ref.']
              ]
            }
          }
        ]
      }
    ],
    content: `# ${companyName} - Access Control & Identity Governance Policy
**Document Ref:** POL-ACC-02 | **Classification:** Confidential - Internal ISMS Use Only | **Standard:** ${framework}
**Document Owner:** Head of IT & Security | **Approver:** ${cisoName} | **Effective Date:** ${effectiveDate} | **Review Cycle:** Annual

## 1. Purpose & Scope (ISO 27001:2022 Annex A.5.15)
To govern logical and physical access permissions across ${companyName}'s applications, production databases, and cloud infrastructure (${cloudProvider}), ensuring that access is granted strictly in accordance with the Principle of Least Privilege (PoLP) and Role-Based Access Control (RBAC).

## 2. User Lifecycle Governance (Annex A.6.5)
- **Joiners:** Access provisioned strictly upon HR background check completion and signed NDA. Provisioning is automated via ${identityProvider} SCIM groups.
- **Movers:** Role transfers trigger automated revocation of obsolete department permissions within 48 hours.
- **Leavers (Same-Day Revocation):** Upon employee or contractor separation, all accounts, active SSO sessions, and API tokens are revoked within **<= 24 hours** (immediate for involuntary exits).

## 3. Mandatory Authentication Baselines (Annex A.5.17)
- **Multi-Factor Authentication (MFA):** Mandatory for 100% of users across ${identityProvider}, VPN, ${scmProvider}, and cloud consoles. SMS/Email OTP is prohibited; FIDO2 WebAuthn or TOTP authenticator is required.
- **Password Standards:** Minimum 14 alphanumeric characters with complexity, or managed via enterprise password manager.
- **Account Lockout:** Enforced lockout after 5 failed attempts; 15-minute idle session timeout.

## 4. Privileged Access Management (PAM) (Annex A.5.18)
- Zero standing privileges in production ${cloudProvider} environments.
- Administrative access requires Just-In-Time (JIT) elevation with an approved change ticket and automatic expiration after 4 hours.
- Cloud root accounts must be secured with hardware security keys stored in an executive safe; usage triggers immediate P1 alerts to the ${cisoName}.

## 5. Quarterly Access Recertification (Annex A.5.16)
Every 90 days, department heads must review and digitally sign off on user access rights. Uncertified permissions are automatically downgraded after 10 business days. Inactive accounts (>60 days dormant) are suspended automatically.

## 6. Auditor Evidence Checklist (Annex A.5.15 - A.5.18)
- **Leaver Audit:** HR termination timestamp vs. IdP account revocation timestamp for 5 sampled leavers (<= 24h SLA).
- **MFA Enrollment:** 100% MFA compliance report exported from ${identityProvider}.
- **Quarterly Recertification:** Past 4 quarters of signed department manager review certificates.`
  };

  // 3. SOP-INC-02: Security Incident Response & Breach Notification Procedure (A.5.24 - A.5.28)
  const sopInc02: GeneratedDocument = {
    id: 'doc_sop_inc_02',
    docCode: 'SOP-INC-02',
    title: 'Security Incident Response & Breach Notification Procedure',
    type: 'PROCEDURE',
    category: 'Security Operations',
    version: '1.0',
    status: 'APPROVED',
    owner: 'Security Operations Lead',
    approver: cisoName,
    effectiveDate,
    reviewCycle: 'Annual',
    classification: 'Confidential - Internal ISMS Use Only',
    standard: framework,
    documentOwner: 'Security Operations Lead',
    issuedBy: 'Incident Response Team (IRT)',
    approvedBy: cisoName,
    acknowledgementCount: 24,
    lastModified: new Date().toISOString(),
    documentControlStatements: defaultControlStatements,
    revisionHistory: defaultRevisionHistory,
    tableOfContents: [
      { title: 'Document Control', pageNo: 2, level: 1 },
      { title: 'Table of Contents', pageNo: 3, level: 1 },
      { title: '1. Purpose & Incident Classification (Annex A.5.24)', pageNo: 4, level: 1 },
      { title: '2. Incident Response Lifecycle: 5 Phases (Annex A.5.25 - A.5.27)', pageNo: 4, level: 1 },
      { title: '3. Severity Matrix & Response SLAs', pageNo: 5, level: 1 },
      { title: '4. Regulatory Breach Notification Protocols (GDPR 72h & MAS TRM)', pageNo: 5, level: 1 },
      { title: '5. Post-Incident Review & Lessons Learned (A.5.28)', pageNo: 6, level: 1 },
      { title: '6. Auditor Evidence Artifacts Checklist', pageNo: 6, level: 1 }
    ],
    pages: [
      {
        pageNumber: 4,
        title: 'Incident Classification & Lifecycle',
        content: `1. Purpose & Incident Classification (Annex A.5.24)
This Standard Operating Procedure defines the step-by-step workflow for detecting, reporting, triaging, containing, eradicating, and recovering from information security incidents impacting ${companyName}.

2. Incident Response Lifecycle: 5 Core Phases
- Phase 1: Detection & Reporting (Automated SIEM alerts, user report to security@${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com).
- Phase 2: Triage & Severity Assignment (P1 Critical to P4 Low).
- Phase 3: Containment & Evidence Preservation (Network isolation, token revocation, forensic snapshot).
- Phase 4: Eradication & System Restoration (Vulnerability remediation, golden image restore).
- Phase 5: Post-Incident Review & Root Cause Analysis (5-Whys methodology within 5 business days).`,
        sections: [
          {
            heading: '1. Incident Classification Categories (Annex A.5.24)',
            body: `Incidents are categorized into four standard domains:
▪ Data Breach / Unauthorized Disclosure: Compromise of customer PII, secrets, or financial data.
▪ Malware / Ransomware / Infrastructure Compromise: Unauthorized code execution on servers or endpoints.
▪ Denial of Service / Availability Outage: Disruptions to production systems exceeding 15 minutes.
▪ Insider Threat / Unauthorized Access: Privilege abuse or intentional policy violations by internal actors.`
          },
          {
            heading: '2. Incident Response Lifecycle Workflow (A.5.25 & A.5.26)',
            body: `Upon detection of a potential security anomaly:
1. Immediate Alerting: Any employee or system monitoring alert must be routed to the Incident Response Team (IRT) within 15 minutes.
2. Initial Assessment: On-call Security Engineer validates the finding, assigns initial severity, and opens a dedicated Incident Room.
3. Containment Execution: Isolate compromised nodes, rotate affected service account tokens, and preserve volatile memory and disk forensic snapshots.`
          }
        ]
      },
      {
        pageNumber: 5,
        title: 'Severity Matrix & Breach Notifications',
        content: `3. Severity Matrix & Operational SLAs
- P1 Critical: Customer PII breach, production outage, or root cloud compromise. Response SLA: <= 15 minutes; Containment SLA: <= 2 hours.
- P2 High: Unauthorized access to non-sensitive internal data, single server compromise. Response SLA: <= 1 hour; Containment SLA: <= 8 hours.
- P3 Medium: Isolated malware blocked by endpoint agent, non-critical policy violation. Response SLA: <= 4 hours.
- P4 Low: Informational alert, phishing email reported without interaction. Response SLA: <= 24 hours.

4. Statutory & Regulatory Breach Notifications
- GDPR / Global Privacy Laws: Formal notification to Supervisory Authorities within 72 hours of becoming aware of a confirmed PII breach.
- Affected Enterprise Customers: Contractual notification issued within 24 hours of confirmation.
- Financial Regulators (e.g. MAS TRM): Notification within 1 hour of discovery for severe financial platform disruptions.`,
        sections: [
          {
            heading: '3. Incident Severity & SLA Response Matrix',
            table: {
              headers: ['Severity Tier', 'Impact Definition', 'Initial Response SLA', 'Containment SLA', 'Escalation Target'],
              rows: [
                ['P1 - Critical', 'Confirmed data breach, production cloud compromise, or total outage', '<= 15 Minutes', '<= 2 Hours', 'CEO, CISO, Legal Counsel, IRT'],
                ['P2 - High', 'Compromise of internal server, malware spreading, high-risk vulnerability exploited', '<= 1 Hour', '<= 8 Hours', 'CISO, DevOps Lead, IT Manager'],
                ['P3 - Medium', 'Single endpoint infection contained by EDR, brute-force attempt blocked', '<= 4 Hours', '<= 24 Hours', 'Security Operations Lead'],
                ['P4 - Low', 'Reported suspicious phishing email, policy inquiry, minor anomaly', '<= 24 Hours', '<= 72 Hours', 'Security Analyst']
              ]
            }
          },
          {
            heading: '4. Regulatory Breach Notification Protocols',
            body: `In the event of a confirmed breach involving personal data or regulated financial data:
▪ Legal Counsel & CISO must be convened immediately to evaluate statutory reporting requirements.
▪ Notification to statutory data protection authorities (e.g., UK ICO, EU DPA, PDPC) must occur without undue delay and not later than 72 hours.
▪ Customer Communications: Formal advisory including nature of breach, affected data categories, mitigation measures, and dedicated support contacts.`
          }
        ]
      },
      {
        pageNumber: 6,
        title: 'Post-Incident Review & Auditor Evidence',
        content: `5. Post-Incident Review & Lessons Learned (Annex A.5.28)
Within 5 business days of incident resolution, the IRT must convene a mandatory Post-Incident Review (PIR):
- Conduct 5-Whys root cause analysis.
- Identify control failures and assign Corrective Actions in Skanda GRC CAPA Module (Clause 10.1).
- Update threat intelligence signatures and standard operating playbooks.

6. Auditor Evidence Checklist
The Lead Auditor will sample:
- Incident log records and ticket timestamps over the past 12 months.
- Completed Post-Incident Review (PIR) reports showing 5-Whys root cause analysis.
- Annual simulated table-top incident response exercise report.`,
        sections: [
          {
            heading: '5. Post-Mortem & Corrective Action Feedback Loop (Clause 10.1)',
            body: `Every P1 or P2 incident requires a documented Post-Incident Report (PIR) submitted to the ${cisoName} and Top Management.
Mandatory PIR Sections:
a) Chronological timeline of events from detection to eradication.
b) Root cause determination using the 5-Whys methodology.
c) Assessment of control effectiveness during the incident.
d) Action items assigned to system owners with binding completion dates (< 30 days).`
          },
          {
            heading: '6. External Auditor Verification Checklist (A.5.24 - A.5.28)',
            table: {
              headers: ['Auditor Evidence Artifact', 'Auditor Verification Objective', 'Expected State'],
              rows: [
                ['Central Incident Register', 'Verify all logged security events have timestamps, severity, and assigned owners.', 'Zero unreviewed open security tickets.'],
                ['P1/P2 Post-Mortem Reports', 'Confirm root cause analysis was completed within 5 business days with CAPA actions.', 'Signed PIR report with closed action items.'],
                ['Annual IR Simulation Drill', 'Verify organization conducts annual tabletop cyber attack simulation.', 'Completed drill scenario documentation with lessons learned.'],
                ['Forensic Chain of Custody Log', 'Verify evidence preservation rules were adhered to during investigation.', 'Documented disk/memory snapshot hashes.']
              ]
            }
          }
        ]
      }
    ],
    content: `# ${companyName} - Security Incident Response & Breach Notification Procedure
**Document Ref:** SOP-INC-02 | **Classification:** Confidential - Internal ISMS Use Only | **Standard:** ${framework}
**Document Owner:** Security Operations Lead | **Approver:** ${cisoName} | **Effective Date:** ${effectiveDate} | **Review Cycle:** Annual

## 1. Objective & Scope (ISO 27001:2022 Annex A.5.24)
This standard operating procedure governs the identification, assessment, containment, investigation, reporting, and post-mortem resolution of security events and incidents affecting ${companyName}'s cloud infrastructure (${cloudProvider}), applications, endpoints, and corporate data.

## 2. Five-Phase Response Workflow (Annex A.5.25 - A.5.28)
1. **Phase 1 - Detection & Logging:** Continuous telemetry from SIEM, ${cloudProvider} GuardDuty, EDR agents, and employee reports to security@${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com.
2. **Phase 2 - Triage & Severity Assignment:** On-call engineer assigns severity (P1 Critical to P4 Low) within 15 minutes.
3. **Phase 3 - Containment & Preservation:** Isolation of compromised instances, invalidation of user/service tokens, preservation of disk snapshots and volatile memory.
4. **Phase 4 - Eradication & Remediation:** Removal of malware, patching of exploited vulnerabilities, restoration from clean immutable backups.
5. **Phase 5 - Post-Incident Review & CAPA:** Mandatory 5-Whys root cause analysis conducted within 5 business days, logged in Skanda GRC CAPA module (Clause 10.1).

## 3. Incident Severity & SLA Response Matrix
- **P1 Critical:** Confirmed customer PII breach, production outage, or root account compromise. Response SLA: <= 15 minutes; Containment: <= 2 hours.
- **P2 High:** Compromise of internal staging server, high-risk vulnerability exploit, lateral movement attempt. Response SLA: <= 1 hour; Containment: <= 8 hours.
- **P3 Medium:** Endpoint malware blocked by agent, localized phishing attempt. Response SLA: <= 4 hours.
- **P4 Low:** Minor policy violation, false positive, non-exploitable anomaly. Response SLA: <= 24 hours.

## 4. Regulatory & Contractual Breach Notifications
- **GDPR / Data Protection:** Formal notice to regulatory authorities within **72 hours** of breach confirmation.
- **Enterprise Clients:** Contractual notice within **24 hours** of confirmed unauthorized data access.

## 5. Auditor Evidence Checklist (Annex A.5.24 - A.5.28)
- Central Incident Log showing end-to-end incident lifecycle timestamps.
- Post-Incident Review (PIR) reports with 5-Whys root cause analysis and corrective actions.
- Annual Tabletop Simulation Drill report signed by CISO and participants.`
  };

  // 4. POL-VUL-07: Threat & Vulnerability Management Policy (A.5.7, A.8.8)
  const polVul07: GeneratedDocument = {
    id: 'doc_pol_vul_07',
    docCode: 'POL-VUL-07',
    title: 'Threat & Vulnerability Management Policy',
    type: 'POLICY',
    category: 'Technological Security',
    version: '1.0',
    status: 'APPROVED',
    owner: 'Head of Cloud Security & DevOps',
    approver: cisoName,
    effectiveDate,
    reviewCycle: 'Annual',
    classification: 'Confidential - Internal ISMS Use Only',
    standard: framework,
    documentOwner: 'Head of Cloud Security',
    issuedBy: 'DevOps & Security Working Group',
    approvedBy: cisoName,
    acknowledgementCount: 22,
    lastModified: new Date().toISOString(),
    documentControlStatements: defaultControlStatements,
    revisionHistory: defaultRevisionHistory,
    tableOfContents: [
      { title: 'Document Control', pageNo: 2, level: 1 },
      { title: 'Table of Contents', pageNo: 3, level: 1 },
      { title: '1. Purpose & Threat Intelligence (Annex A.5.7)', pageNo: 4, level: 1 },
      { title: '2. Continuous Scanning Architecture (${vulnerabilityTool})', pageNo: 4, level: 1 },
      { title: '3. Vulnerability Remediation SLAs by CVSS Severity (Annex A.8.8)', pageNo: 5, level: 1 },
      { title: '4. Annual Penetration Testing & Independent Audits', pageNo: 5, level: 1 },
      { title: '5. Auditor Evidence Checklist & Verification Artifacts', pageNo: 6, level: 1 }
    ],
    pages: [
      {
        pageNumber: 4,
        title: 'Purpose & Continuous Scanning Architecture',
        content: `1. Purpose & Threat Intelligence (Annex A.5.7)
To ensure that vulnerabilities in ${companyName}'s software, infrastructure, containers, and third-party dependencies are systematically identified, prioritized, and remediated before they can be exploited by threat actors.

2. Continuous Scanning Architecture (${vulnerabilityTool})
- Static Application Security Testing (SAST): Integrated into CI/CD pipelines (${scmProvider}) to scan all code commits for OWASP Top 10 flaws.
- Software Composition Analysis (SCA): Automated scanning of open-source package manifests to detect known CVEs in libraries.
- Container & Cloud Workload Scanning: Automated daily registry scanning and runtime vulnerability detection across all production workloads.`,
        sections: [
          {
            heading: '1. Threat Intelligence Integration (ISO 27001:2022 Annex A.5.7)',
            body: `Information relating to information security threats shall be collected and analyzed to produce threat intelligence.
Threat feeds integrated into ${companyName}'s monitoring ecosystem include:
▪ CISA Known Exploited Vulnerabilities (KEV) Catalog.
▪ Cloud Security Alliance (CSA) threat advisories and AWS/GCP security bulletins.
▪ Automated CVE alerts via ${vulnerabilityTool} webhooks directly routed into Jira.`
          },
          {
            heading: '2. Automated Vulnerability Scanning Stack',
            table: {
              headers: ['Scanning Domain', 'Tool Implemented', 'Scanning Frequency', 'Deployment Gate Enforced'],
              rows: [
                ['Application Source Code (SAST)', scmProvider + ' Native / ' + vulnerabilityTool, 'On every Pull Request', 'Blocks PR merge if Critical/High flaw detected'],
                ['Third-Party Dependencies (SCA)', vulnerabilityTool, 'Daily continuous scan', 'Fails CI/CD build on known exploitable CVE'],
                ['Container Base Images', vulnerabilityTool + ' / Cloud Scanner', 'On every image push to registry', 'Blocks deployment to production cluster'],
                ['External Attack Surface', 'Automated DAST & Port Scanner', 'Weekly continuous scan', 'Alerts on open non-whitelisted ports']
              ]
            }
          }
        ]
      },
      {
        pageNumber: 5,
        title: 'Remediation SLAs & Penetration Testing',
        content: `3. Vulnerability Remediation SLAs (Annex A.8.8)
Remediation timelines are strictly determined by the Common Vulnerability Scoring System (CVSS v3.1):
- Critical (CVSS 9.0 - 10.0): Maximum 72 Hours from discovery.
- High (CVSS 7.0 - 8.9): Maximum 14 Calendar Days.
- Medium (CVSS 4.0 - 6.9): Maximum 30 Calendar Days.
- Low (CVSS 0.1 - 3.9): Maximum 90 Calendar Days or next release cycle.

4. Annual Penetration Testing
An independent, CREST-certified third-party penetration testing firm shall perform gray-box penetration testing of all production APIs, web applications, and cloud environments at least once every 12 months, or following significant architectural revisions.`,
        sections: [
          {
            heading: '3. Binding Remediation Timelines by Severity Tier',
            table: {
              headers: ['CVSS v3 Score', 'Severity Rating', 'Remediation SLA', 'Escalation Threshold', 'Required Action'],
              rows: [
                ['9.0 - 10.0', 'CRITICAL', '<= 72 Hours', 'CISO & VP Eng after 24h', 'Immediate patch, WAF block rule, or hotfix deployment'],
                ['7.0 - 8.9', 'HIGH', '<= 14 Calendar Days', 'Security Lead after 7 days', 'Prioritized sprint patch; compensating guardrail'],
                ['4.0 - 6.9', 'MEDIUM', '<= 30 Calendar Days', 'DevOps Lead after 20 days', 'Standard sprint cycle remediation'],
                ['0.1 - 3.9', 'LOW', '<= 90 Calendar Days', 'Line Manager review', 'Routine backlog maintenance']
              ]
            }
          },
          {
            heading: '4. Independent Third-Party Penetration Testing (Annex A.8.8)',
            body: `Annual independent testing requirements:
▪ Testing Scope: All production public IP addresses, domains, APIs, and authenticated user flows.
▪ Methodology: OWASP Top 10, SANS 25, and PTES guidelines.
▪ Remediation Verification: Re-testing of all Critical, High, and Medium findings must be completed within 30 days of initial report delivery.`
          }
        ]
      },
      {
        pageNumber: 6,
        title: 'Auditor Evidence Checklist',
        content: `5. Auditor Evidence Checklist & Verification Artifacts
The Lead Auditor will sample:
- Weekly vulnerability scan reports from ${vulnerabilityTool} showing remediation velocity.
- Verification of zero unpatched Critical vulnerabilities exceeding 72 hours.
- Latest Third-Party Penetration Test Executive Summary and remediation sign-off report.
- Approved Security Exception Waiver for any vulnerability where patching was deferred.`,
        sections: [
          {
            heading: '5. External Auditor Sampling Guide (Stage 1 & 2)',
            table: {
              headers: ['Auditor Evidence Artifact', 'Sampling Expectation', 'Auditor Rejection Criteria'],
              rows: [
                ['Automated Scan Dashboard Export', 'Review last 90 days of vulnerability trend reports.', 'Presence of un-remediated Critical CVEs past 72h without approved waiver.'],
                ['Jira Patching Tickets', 'Sample 5 Critical/High CVE tickets from discovery to production deploy.', 'Deployment timestamp exceeding SLA without documented compensating controls.'],
                ['Penetration Test Report', 'Inspect latest annual report and formal re-test confirmation.', 'Report older than 12 months or open Critical findings without remediation proof.'],
                ['CI/CD Security Gate Rules', 'Review GitHub branch protection and scanner config files.', 'Failure rules disabled or set to "warning only" in production pipelines.']
              ]
            }
          }
        ]
      }
    ],
    content: `# ${companyName} - Threat & Vulnerability Management Policy
**Document Ref:** POL-VUL-07 | **Classification:** Confidential - Internal ISMS Use Only | **Standard:** ${framework}
**Document Owner:** Head of Cloud Security & DevOps | **Approver:** ${cisoName} | **Effective Date:** ${effectiveDate} | **Review Cycle:** Annual

## 1. Purpose & Threat Intelligence (ISO 27001:2022 Annex A.5.7 & A.8.8)
To govern the identification, triage, prioritization, remediation, and verification of security vulnerabilities across ${companyName}'s cloud infrastructure (${cloudProvider}), containers, software codebases, and workforce devices.

## 2. Continuous Scanning Architecture (${vulnerabilityTool})
- **Static Analysis (SAST):** Automated scan on every pull request in ${scmProvider}; PR merges are blocked if Critical/High vulnerabilities are detected.
- **Dependency Scanning (SCA):** Daily scanning of third-party libraries against the National Vulnerability Database (NVD) and GitHub Advisory database.
- **Container Registry Scanning:** Automated image scans prior to deployment to production Kubernetes/ECS clusters.

## 3. Strict CVSS Remediation SLAs (Annex A.8.8)
- **Critical (CVSS 9.0 - 10.0):** **<= 72 Hours** from detection. Immediate escalation to CISO and VP of Engineering.
- **High (CVSS 7.0 - 8.9):** **<= 14 Calendar Days**.
- **Medium (CVSS 4.0 - 6.9):** **<= 30 Calendar Days**.
- **Low (CVSS 0.1 - 3.9):** **<= 90 Calendar Days** (or next scheduled release).

## 4. Annual Penetration Testing
An independent, accredited third-party penetration testing firm conducts gray-box testing of all external-facing applications and cloud infrastructure at least once every 12 months. All Critical and High findings must be patched and re-tested within 30 days.

## 5. Auditor Evidence Checklist
- Weekly scan reports from ${vulnerabilityTool} proving SLA adherence.
- Sampled Jira tickets showing discovery-to-patch cycle time for past 5 Critical CVEs.
- Annual Penetration Testing Report and re-test certificate of closure.`
  };

  // 5. POL-BCP-05: Business Continuity & Disaster Recovery Policy (A.5.29, A.5.30, A.8.13)
  const polBcp05: GeneratedDocument = {
    id: 'doc_pol_bcp_05',
    docCode: 'POL-BCP-05',
    title: 'Business Continuity & Disaster Recovery Policy',
    type: 'POLICY',
    category: 'Resilience & Operations',
    version: '1.0',
    status: 'APPROVED',
    owner: 'Head of Infrastructure & Operations',
    approver: cisoName,
    effectiveDate,
    reviewCycle: 'Annual',
    classification: 'Confidential - Internal ISMS Use Only',
    standard: framework,
    documentOwner: 'Head of Infrastructure',
    issuedBy: 'Resilience Working Group',
    approvedBy: cisoName,
    acknowledgementCount: 20,
    lastModified: new Date().toISOString(),
    documentControlStatements: defaultControlStatements,
    revisionHistory: defaultRevisionHistory,
    tableOfContents: [
      { title: 'Document Control', pageNo: 2, level: 1 },
      { title: 'Table of Contents', pageNo: 3, level: 1 },
      { title: '1. Purpose & Business Impact Analysis (Annex A.5.29)', pageNo: 4, level: 1 },
      { title: '2. Recovery Time & Recovery Point Objectives (RTO & RPO)', pageNo: 4, level: 1 },
      { title: '3. Backup Redundancy & Immutable Storage (Annex A.8.13)', pageNo: 5, level: 1 },
      { title: '4. Annual Disaster Recovery Failover Drills (Annex A.5.30)', pageNo: 5, level: 1 },
      { title: '5. Auditor Evidence Checklist', pageNo: 6, level: 1 }
    ],
    pages: [
      {
        pageNumber: 4,
        title: 'Purpose, BIA, RTO & RPO Mandates',
        content: `1. Purpose & Business Impact Analysis (Annex A.5.29)
To guarantee that ${companyName} can maintain or rapidly restore critical business functions and cloud services in the event of an infrastructure failure, natural disaster, major cyber attack, or regional outage.

2. Quantitative RTO & RPO Mandates
- Recovery Time Objective (RTO): Target time to restore production SaaS platform to full operational service is <= 4 Hours.
- Recovery Point Objective (RPO): Maximum acceptable data loss window is <= 15 Minutes, achieved via continuous multi-Availability Zone database replication and continuous transaction log shipping.`,
        sections: [
          {
            heading: '1. Business Impact Analysis (BIA) (ISO 27001 Annex A.5.29)',
            body: `A Business Impact Analysis (BIA) is performed annually to evaluate the criticality of operational processes, applications, and infrastructure components.
Criticality Tiers:
▪ Tier 1 (Mission Critical): Production SaaS API, Customer Database, Authentication Service. RTO <= 4h, RPO <= 15m.
▪ Tier 2 (Business Important): Internal billing, CI/CD deployment pipelines, customer support ticketing. RTO <= 12h, RPO <= 4h.
▪ Tier 3 (Non-Critical): Internal intranet, historical reporting, corporate knowledge base. RTO <= 48h, RPO <= 24h.`
          }
        ]
      },
      {
        pageNumber: 5,
        title: 'Backup Architecture & DR Drills',
        content: `3. Backup Architecture & Immutable Storage (Annex A.8.13)
- Automated Daily Snapshots: Production databases and persistent file storage are backed up daily with 30-day retention.
- Geographic Redundancy: Snapshots are cross-region replicated to a secondary ${cloudProvider} geographic region.
- Ransomware Immutability: Backups are stored with Write-Once-Read-Many (WORM) Object Lock enabled to prevent malicious deletion or encryption.

4. Disaster Recovery Tabletop & Failover Drills (Annex A.5.30)
At least once every 12 months, the Engineering team conducts an end-to-end failover test restoring production databases from cross-region snapshots into an isolated sandbox environment, measuring actual RTO and RPO against target thresholds.`,
        sections: [
          {
            heading: '3. Technical Backup Safeguards (Annex A.8.13)',
            table: {
              headers: ['Asset / Data Type', 'Backup Frequency', 'Retention Period', 'Encryption Standard', 'Immutability Guardrail'],
              rows: [
                ['Production RDS / SQL Database', 'Continuous WAL + Daily Snapshot', '30 Days', 'AES-256 KMS Key', 'KMS Key separation & deletion protection'],
                ['Customer Document Storage', 'Daily Incremental + Monthly Full', '7 Years (Regulatory)', 'AES-256 SSE-S3', 'S3 Object Lock (Compliance Mode)'],
                ['Source Code Repositories', 'Real-time distributed + Daily Archive', 'Permanent', 'TLS 1.3 + AES-256', 'Multi-region immutable mirror']
              ]
            }
          },
          {
            heading: '4. Disaster Recovery Simulation Testing (Annex A.5.30)',
            body: `ICT readiness for business continuity shall be tested at planned intervals.
Annual DR Drill Protocol:
1. Scenario Trigger: Simulated catastrophic failure of primary ${cloudProvider} region.
2. Spin-up Secondary Infrastructure: Terraform execution in secondary cloud region.
3. Database Restoration: Restore most recent cross-region snapshot and verify data consistency.
4. RTO / RPO Calculation: Record time elapsed from initiation to successful synthetic transaction test.`
          }
        ]
      },
      {
        pageNumber: 6,
        title: 'Auditor Evidence Checklist',
        content: `5. Auditor Evidence Checklist
The Lead Auditor will sample:
- Automated backup execution logs confirming daily successful snapshot completion.
- Monthly backup restoration test logs in isolated sandbox VPC.
- Annual Disaster Recovery Simulation Report signed by CISO and Head of Infrastructure documenting achieved RTO/RPO.`,
        sections: [
          {
            heading: '5. External Auditor Verification Artifacts (A.5.29, A.5.30, A.8.13)',
            table: {
              headers: ['Auditor Evidence Artifact', 'Auditor Inspection Objective', 'Audit Pass Criteria'],
              rows: [
                ['Daily Automated Backup Logs', 'Verify continuous, error-free backup execution over past 90 days.', 'Zero unaddressed failed backup jobs.'],
                ['Sandbox Restoration Test Logs', 'Verify organization actually tests backup recoverability.', 'Logs showing successful database restore within past 30 days.'],
                ['Annual DR Drill Report', 'Confirm end-to-end failover exercise was completed and reviewed by leadership.', 'Formal report detailing scenario, actual RTO <= 4h, RPO <= 15m.'],
                ['Cross-Region Replication Config', 'Inspect cloud console settings for secondary region replication.', 'Active replication enabled with KMS key separation.']
              ]
            }
          }
        ]
      }
    ],
    content: `# ${companyName} - Business Continuity & Disaster Recovery Policy
**Document Ref:** POL-BCP-05 | **Classification:** Confidential - Internal ISMS Use Only | **Standard:** ${framework}
**Document Owner:** Head of Infrastructure & Operations | **Approver:** ${cisoName} | **Effective Date:** ${effectiveDate} | **Review Cycle:** Annual

## 1. Objective & Scope (ISO 27001:2022 Annex A.5.29 & A.5.30)
To establish operational resilience protocols, backup integrity, and recovery procedures ensuring ${companyName}'s customer-facing services can survive and recover from major disaster scenarios.

## 2. Quantitative Targets: RTO & RPO
- **Recovery Time Objective (RTO):** Target time to restore core production SaaS platform is **<= 4 Hours**.
- **Recovery Point Objective (RPO):** Maximum allowable data loss window is **<= 15 Minutes**, achieved via automated multi-AZ database replication and continuous transaction log shipping.

## 3. Backup Architecture & Immutable Storage (Annex A.8.13)
- Daily automated snapshots of all production databases and object stores.
- Automated cross-region replication to secondary ${cloudProvider} geographic region.
- Object Lock / WORM compliance mode enabled on backup storage to protect against ransomware deletion.

## 4. Annual Disaster Recovery Failover Testing
Annual simulated failover drill restoring production environment into an isolated sandbox VPC, evaluating actual RTO/RPO metrics and documenting findings in an executive post-mortem.

## 5. Auditor Evidence Checklist
- 90 days of automated backup logs showing successful daily completion.
- Monthly sandbox restore verification logs.
- Annual DR Simulation Report with signed executive management sign-off.`
  };

  // 6. SOP-CHG-03: Secure Software Development & Change Management Procedure (A.8.25 - A.8.32)
  const sopChg03: GeneratedDocument = {
    id: 'doc_sop_chg_03',
    docCode: 'SOP-CHG-03',
    title: 'Secure Software Development & Change Management Procedure',
    type: 'PROCEDURE',
    category: 'Engineering & DevOps',
    version: '1.0',
    status: 'APPROVED',
    owner: 'VP of Engineering & DevOps',
    approver: cisoName,
    effectiveDate,
    reviewCycle: 'Annual',
    classification: 'Confidential - Internal ISMS Use Only',
    standard: framework,
    documentOwner: 'VP of Engineering',
    issuedBy: 'Change Advisory Board (CAB)',
    approvedBy: cisoName,
    acknowledgementCount: 25,
    lastModified: new Date().toISOString(),
    documentControlStatements: defaultControlStatements,
    revisionHistory: defaultRevisionHistory,
    tableOfContents: [
      { title: 'Document Control', pageNo: 2, level: 1 },
      { title: 'Table of Contents', pageNo: 3, level: 1 },
      { title: '1. Purpose & Scope (Annex A.8.25 - A.8.32)', pageNo: 4, level: 1 },
      { title: '2. Branch Protection & Mandatory Peer Review Rules (${scmProvider})', pageNo: 4, level: 1 },
      { title: '3. Automated CI/CD Security Gates & Testing (${vulnerabilityTool})', pageNo: 5, level: 1 },
      { title: '4. Emergency Change Protocol & Fast-Track CAB', pageNo: 5, level: 1 },
      { title: '5. Auditor Evidence & Pull Request Sampling Checklist', pageNo: 6, level: 1 }
    ],
    pages: [
      {
        pageNumber: 4,
        title: 'SDLC Governance & Branch Protection Rules',
        content: `1. Purpose & Scope (Annex A.8.25 - A.8.32)
To govern software development lifecycle (SDLC) activities and production changes within ${companyName}, ensuring that all application modifications undergo rigorous security testing, peer review, and change authorization before deployment.

2. Branch Protection & Peer Review Rules (${scmProvider})
- Direct pushes or commits to production release branches (main/master) are strictly disabled via technical branch protection rules.
- Mandatory Peer Approvals: Every Pull Request (PR) requires at least 2 independent engineering approvals, including at least one designated CodeOwner.
- Self-Approval Prohibited: Authors cannot approve their own pull requests under any circumstances.`,
        sections: [
          {
            heading: '1. Secure SDLC Principles (Annex A.8.25 & A.8.28)',
            body: `Security shall be designed and implemented within the software development lifecycle.
Rules:
▪ Separation of Environments: Development, Staging, and Production environments must reside in completely isolated cloud VPC accounts with separate access credentials.
▪ Sanitized Test Data: Production customer data must NEVER be copied into development or staging environments. Synthetic data or masked data must be used.
▪ Secret Management: No API keys, database credentials, or private certificates may be hard-coded in repositories. Enforced pre-commit secret scanning via git hooks.`
          },
          {
            heading: '2. Enforced Repository Guardrails in ' + scmProvider,
            table: {
              headers: ['Repository Guardrail', 'Enforced Technical Setting', 'Auditor Verification Method'],
              rows: [
                ['Branch Protection', 'Enforced on main and release/* branches', 'Inspect GitHub Branch Protection Settings JSON'],
                ['Required Approving Reviews', 'Minimum 2 Peer Reviews required to merge', 'Inspect Pull Request merge logs and PR settings'],
                ['CodeOwners Enforcement', 'Mandatory CodeOwner review on critical paths', 'Review CODEOWNERS file in root repository'],
                ['Dismiss Stale Approvals', 'Enabled - new commits reset existing approvals', 'Simulate commit push after initial approval'],
                ['Require Status Checks to Pass', 'CI build + Snyk scan + Linting must pass', 'Inspect required status check configurations']
              ]
            }
          }
        ]
      },
      {
        pageNumber: 5,
        title: 'CI/CD Security Gates & Emergency Changes',
        content: `3. Automated CI/CD Security Testing Gates (${vulnerabilityTool})
Every pull request triggers an automated build pipeline that must pass before the merge button is unlocked:
- Static Code Analysis (SAST): Blocks merge on OWASP Top 10 vulnerabilities.
- Dependency Check (SCA): Blocks merge on known CVEs in libraries.
- Secret Detection: Scans git commit diffs for exposed API keys or tokens.

4. Emergency Change Protocol
In the event of an active P1 production outage or zero-day vulnerability:
- Fast-track deployment is permitted with verbal/Slack approval from the CISO or VP of Engineering.
- Retrospective Change Review: Formal documentation and post-facto CAB review must be completed within 48 hours of deployment.`,
        sections: [
          {
            heading: '3. Automated Pipeline Security Gates',
            table: {
              headers: ['Pipeline Check', 'Tool Executing', 'Blocking Condition', 'Bypass Exception'],
              rows: [
                ['Unit & Integration Tests', 'Jest / PyTest / Go Test', '< 100% test pass rate', 'Strictly Prohibited'],
                ['SAST Code Analysis', vulnerabilityTool, 'Critical / High severity flaw found', 'Requires CISO signed waiver'],
                ['Dependency CVE Check', vulnerabilityTool, 'Known exploitable vulnerability', 'Requires CISO signed waiver'],
                ['Secret Detection', 'TruffleHog / GitGuardian', 'Secret signature matched in diff', 'Strictly Prohibited (Key must be rotated)']
              ]
            }
          },
          {
            heading: '4. Standard vs. Emergency Change Classification',
            body: `Changes are categorized as:
▪ Standard Change: Pre-authorized, low-risk, routine updates (e.g. documentation, CSS tweaks).
▪ Normal Change: Standard feature release or infrastructure modification requiring peer reviews and automated CI pass.
▪ Emergency Change: Critical hotfix required to mitigate an active security breach or major outage. Fast-track approval granted by CISO, followed by mandatory retrospective review within 48 hours.`
          }
        ]
      },
      {
        pageNumber: 6,
        title: 'Auditor Evidence Checklist',
        content: `5. Auditor Evidence & Pull Request Sampling Checklist
The Lead Auditor will sample:
- 5 randomly selected production releases and trace them back to corresponding Pull Requests in ${scmProvider}.
- Verification that all 5 PRs had >= 2 independent peer approvals and passing CI/CD security checks.
- Verification that branch protection rules were permanently enabled with no administrative bypasses.`,
        sections: [
          {
            heading: '5. External Auditor PR Sampling Checklist (Annex A.8.32)',
            table: {
              headers: ['Sample Artifact', 'Auditor Verification Test', 'Lead Auditor Pass Criteria'],
              rows: [
                ['Pull Request Review Logs', 'Sample 5 production PRs over past 6 months.', 'Must show >= 2 approvals by distinct users; author did not approve own PR.'],
                ['CI/CD Pipeline Execution Logs', 'Inspect build status for sampled PRs.', '100% green passing status for SAST, SCA, and test runs prior to merge.'],
                ['Branch Protection Configuration', 'Inspect repository settings export in ' + scmProvider, 'Direct push disabled, force push disabled, 2 approvals enforced.'],
                ['Production Deployment Trace', 'Compare git commit SHA against deployed cloud container SHA.', 'Cryptographic match proving only reviewed code reaches production.']
              ]
            }
          }
        ]
      }
    ],
    content: `# ${companyName} - Secure Software Development & Change Management Procedure
**Document Ref:** SOP-CHG-03 | **Classification:** Confidential - Internal ISMS Use Only | **Standard:** ${framework}
**Document Owner:** VP of Engineering & DevOps | **Approver:** ${cisoName} | **Effective Date:** ${effectiveDate} | **Review Cycle:** Annual

## 1. Purpose & Scope (ISO 27001:2022 Annex A.8.25 - A.8.32)
To establish formal security controls across the software development lifecycle (SDLC) and production change management processes at ${companyName}, preventing unauthorized or insecure code deployments.

## 2. Mandatory Branch Protection & Code Review (${scmProvider})
- **Direct Commits Blocked:** Direct pushes to main/production release branches are technically prevented.
- **Minimum 2 Peer Approvals:** Every pull request requires at least 2 independent peer reviews, including designated CodeOwners. Self-approval is strictly impossible.
- **Strict Environment Separation:** Complete isolation between Development, Staging, and Production VPCs. Production customer data is never permitted in test environments.

## 3. Automated CI/CD Security Testing Gates (${vulnerabilityTool})
Every code change must pass automated security gates before the pull request can be merged:
- Static Analysis (SAST) for OWASP Top 10 vulnerabilities.
- Software Composition Analysis (SCA) for open-source library CVEs.
- Pre-commit secret scanning preventing accidental credential commits.

## 4. Emergency Change Protocol
Emergency hotfixes for active P1 incidents may be deployed with verbal authorization from the CISO, with retrospective Change Advisory Board (CAB) review completed within 48 hours.

## 5. Auditor Evidence Checklist (Annex A.8.32)
- Pull request audit logs for 5 sampled production deployments proving 2 peer approvals.
- CI/CD build logs showing passing automated security scans.
- Repository configuration export proving branch protection enforcement.`
  };

  // 7. POL-SUP-06: Supplier & Cloud Third-Party Security Policy (A.5.19 - A.5.23)
  const polSup06: GeneratedDocument = {
    id: 'doc_pol_sup_06',
    docCode: 'POL-SUP-06',
    title: 'Supplier & Cloud Third-Party Security Policy',
    type: 'POLICY',
    category: 'Third-Party Risk Management',
    version: '1.0',
    status: 'APPROVED',
    owner: 'Head of Procurement & Vendor Risk',
    approver: cisoName,
    effectiveDate,
    reviewCycle: 'Annual',
    classification: 'Confidential - Internal ISMS Use Only',
    standard: framework,
    documentOwner: 'Head of Procurement',
    issuedBy: 'Vendor Governance Committee',
    approvedBy: cisoName,
    acknowledgementCount: 18,
    lastModified: new Date().toISOString(),
    documentControlStatements: defaultControlStatements,
    revisionHistory: defaultRevisionHistory,
    tableOfContents: [
      { title: 'Document Control', pageNo: 2, level: 1 },
      { title: 'Table of Contents', pageNo: 3, level: 1 },
      { title: '1. Purpose & Supplier Risk Categorization (Annex A.5.19)', pageNo: 4, level: 1 },
      { title: '2. Mandatory Pre-Contract Due Diligence Requirements (A.5.20)', pageNo: 4, level: 1 },
      { title: '3. Cloud Service Governance (Annex A.5.23)', pageNo: 5, level: 1 },
      { title: '4. Annual Vendor Re-Evaluation & Contractual Security Clauses', pageNo: 5, level: 1 },
      { title: '5. Auditor Evidence Checklist', pageNo: 6, level: 1 }
    ],
    pages: [
      {
        pageNumber: 4,
        title: 'Supplier Categorization & Due Diligence',
        content: `1. Purpose & Scope (Annex A.5.19)
To mitigate information security, compliance, and supply chain risks arising from third-party vendors, SaaS tools, and cloud infrastructure providers.

2. Supplier Criticality Tiers
- Tier 1 (High Risk / Critical): Vendors processing customer PII, core cloud infrastructure (${cloudProvider}), or with direct access to production environments.
- Tier 2 (Medium Risk): Internal SaaS tools (messaging, project tracking, HR) containing internal business data.
- Tier 3 (Low Risk): Commodity office suppliers or localized services with zero system or data access.`,
        sections: [
          {
            heading: '1. Mandatory Pre-Contract Due Diligence (Annex A.5.20)',
            body: `Prior to contract execution or purchase order approval for Tier 1 and Tier 2 vendors:
▪ Security Assessment: Vendor must provide an independent SOC 2 Type II or ISO/IEC 27001 certificate issued within the past 12 months.
▪ Data Processing Agreement (DPA): Mandatory execution of DPA including Standard Contractual Clauses (SCCs) and GDPR compliance.
▪ Right to Audit: Contract must contain explicit provisions granting ${companyName} the right to audit or review third-party audit reports annually.`
          }
        ]
      },
      {
        pageNumber: 5,
        title: 'Cloud Service Governance & SLAs',
        content: `3. Information Security in Cloud Services (Annex A.5.23)
Processes for acquiring, using, managing, and exiting cloud services shall be established in accordance with ${companyName}'s information security requirements.
- Cloud providers must support AES-256 encryption at rest, TLS 1.3 in transit, and customer-managed encryption keys where available.
- Breach Notification SLA: Contracts must obligate vendors to notify ${companyName} within <= 24 hours of any confirmed or suspected security breach impacting corporate data.

4. Annual Re-Evaluation
The Procurement and Security teams conduct annual re-assessments of all Tier 1 suppliers, verifying active ISO 27001/SOC 2 certificates and incident history.`,
        sections: [
          {
            heading: '3. Cloud Service & Supplier Security Mandates',
            table: {
              headers: ['Vendor Tier', 'Required Security Credentials', 'Breach Notification SLA', 'Re-Evaluation Frequency'],
              rows: [
                ['Tier 1 - Critical (Cloud & PII)', 'SOC 2 Type II / ISO 27001 (< 12 months old) + DPA', '<= 24 Hours', 'Annual formal review'],
                ['Tier 2 - Medium (Internal SaaS)', 'Security questionnaire + SOC 2 Type I or ISO 27001', '<= 48 Hours', 'Every 2 Years'],
                ['Tier 3 - Low (Non-Technical)', 'Standard procurement terms & NDA', 'Best effort', 'Upon renewal']
              ]
            }
          }
        ]
      },
      {
        pageNumber: 6,
        title: 'Auditor Evidence Checklist',
        content: `5. Auditor Evidence Checklist
The Lead Auditor will sample:
- Vendor Risk Assessment Register for all active Tier 1 and Tier 2 suppliers.
- Executed Data Processing Agreements (DPAs) for cloud providers (${cloudProvider}).
- Annual re-evaluation records confirming current SOC 2 / ISO 27001 certificates on file.`,
        sections: [
          {
            heading: '5. External Auditor Verification Checklist (Annex A.5.19 - A.5.23)',
            table: {
              headers: ['Auditor Evidence Artifact', 'Sampling Expectation', 'Audit Pass Criteria'],
              rows: [
                ['Active Supplier Inventory', 'Review complete catalog of third-party software and cloud tools.', 'All vendors categorized into Tiers 1-3 with assigned owners.'],
                ['Tier 1 Vendor Security Proof', 'Sample 3 critical vendors (e.g. AWS, Okta, GitHub).', 'Valid SOC 2 Type II or ISO 27001 reports on file (< 12 months old).'],
                ['Signed Data Processing Agreements', 'Sample DPAs for vendors storing customer PII.', 'Signed DPAs with 24h breach notice and audit clauses.']
              ]
            }
          }
        ]
      }
    ],
    content: `# ${companyName} - Supplier & Cloud Third-Party Security Policy
**Document Ref:** POL-SUP-06 | **Classification:** Confidential - Internal ISMS Use Only | **Standard:** ${framework}
**Document Owner:** Head of Procurement & Vendor Risk | **Approver:** ${cisoName} | **Effective Date:** ${effectiveDate} | **Review Cycle:** Annual

## 1. Objective & Scope (ISO 27001:2022 Annex A.5.19 - A.5.23)
To establish vendor due diligence, continuous monitoring, and contractual controls for external software providers, contractors, and cloud hosting vendors.

## 2. Supplier Risk Categorization
- **Tier 1 (Critical):** Cloud providers (${cloudProvider}), Identity Providers (${identityProvider}), and vendors processing customer PII.
- **Tier 2 (Medium):** Internal productivity tools, project management, and developer utilities.
- **Tier 3 (Low):** Non-data processing commercial suppliers.

## 3. Mandatory Pre-Contract Requirements
- Mandatory SOC 2 Type II or ISO 27001 certificate renewed within the last 12 months for all Tier 1 vendors.
- Executed Data Processing Agreement (DPA) with binding **<= 24-hour breach notification SLA**.
- Contractual right to audit and guaranteed secure data deletion upon termination.

## 4. Auditor Evidence Checklist
- Vendor Inventory Register with assigned risk tiers.
- Current SOC 2 / ISO 27001 certificates for all Tier 1 vendors.
- Executed DPAs and annual re-assessment records.`
  };

  // Generate comprehensive ISO 27001 document suite
  const fullIsoSuite = Iso27001PolicyEngine.generateSuite({
    companyName,
    industry,
    framework,
    cloudProvider,
    identityProvider,
    mdmProvider,
    vulnerabilityTool,
    scmProvider,
    departments,
    cisoName,
    effectiveDate
  });

  const coreDocs = [
    polIsms01,
    polAcc02,
    sopInc02,
    polVul07,
    polBcp05,
    sopChg03,
    polSup06
  ];

  const existingCodes = new Set(coreDocs.map(d => d.docCode.toUpperCase()));
  const existingTitles = new Set(coreDocs.map(d => d.title.toLowerCase()));

  const complementaryDocs = fullIsoSuite.filter(
    d => !existingCodes.has(d.docCode.toUpperCase()) && !existingTitles.has(d.title.toLowerCase())
  );

  return [
    ...coreDocs,
    ...complementaryDocs
  ];
}
