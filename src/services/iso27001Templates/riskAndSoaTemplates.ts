import { GeneratedDocument } from '../../types';
import { PolicyTemplateContext } from './types';
import { buildAuditorVerificationDossier } from './auditorVerificationHelper';
import { ISO27001_2022_TUV_MATRIX } from '../../data/iso27001_2022_tuv_matrix';

export function buildDocRsk02(ctx: PolicyTemplateContext): GeneratedDocument {
  const { companyName, framework, cloudProvider, identityProvider, mdmProvider, scmProvider, cisoName, effectiveDate, defaultControlStatements, defaultRevisionHistory } = ctx;

  const auditorDossier = buildAuditorVerificationDossier({
    docCode: 'DOC-RSK-02',
    docTitle: 'Information Security Risk Assessment & Treatment Methodology',
    companyName,
    clauseOrAnnexA: 'Mandatory Clause 6.1.2 & 6.1.3 (Risk Assessment & Treatment)',
    riskId: 'RSK-METHOD-01',
    statutoryMandate: 'ISO 27001:2022 Clauses 6.1.2, 6.1.3 & MAS TRM Section 3.3',
    artifactName: `${companyName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}_RISK_ASSESSMENT_METHODOLOGY_2026.pdf`
  });

  return {
    id: 'doc_rsk_02',
    docCode: 'DOC-RSK-02',
    title: 'Information Security Risk Assessment & Treatment Methodology',
    type: 'PROCEDURE',
    category: 'Risk Management',
    version: '1.0',
    status: 'APPROVED',
    owner: cisoName,
    approver: 'Executive Board / CISO',
    effectiveDate,
    reviewCycle: 'Annual',
    classification: 'Confidential - Internal ISMS Use Only',
    standard: framework,
    documentOwner: cisoName,
    issuedBy: 'Risk Governance Office',
    approvedBy: 'CEO & CISO',
    acknowledgementCount: 22,
    lastModified: new Date().toISOString(),
    documentControlStatements: defaultControlStatements,
    revisionHistory: defaultRevisionHistory,
    tableOfContents: [
      { title: 'Document Control & Revision Record', pageNo: 2, level: 1 },
      { title: 'Table of Contents', pageNo: 3, level: 1 },
      { title: '1. Purpose & Risk Governance Framework (Clause 6.1.2)', pageNo: 4, level: 1 },
      { title: '2. Asset Valuation & Threat/Vulnerability Identification', pageNo: 4, level: 1 },
      { title: '3. Quantitative 5x5 Likelihood and Impact Scoring Matrix', pageNo: 5, level: 1 },
      { title: '4. Enterprise Risk Appetite Thresholds & Escalations', pageNo: 5, level: 1 },
      { title: '5. Risk Treatment Options & Plan Formulation (Clause 6.1.3)', pageNo: 6, level: 1 },
      { title: '6. Lead Auditor Stage 2 Risk Verification Dossier & Seal', pageNo: 7, level: 1 }
    ],
    pages: [
      {
        pageNumber: 4,
        title: 'Risk Governance & Asset Identification',
        content: `1. Purpose & Risk Governance (Clause 6.1.2)
This document defines the repeatable, objective methodology used by ${companyName} to identify, analyze, evaluate, and treat information security risks. The methodology ensures consistent, valid, and comparable results across all technical systems, corporate departments, and cloud workloads.

2. Risk Assessment Process Steps:
1. Asset Identification & Valuation: Map information assets to designated business owners.
2. Threat & Vulnerability Modeling: Identify potential threat sources (external cybercriminals, insider threats, system failures, vendor defaults).
3. Existing Controls Assessment: Evaluate current technical controls in place.
4. Likelihood & Impact Calculation: Score inherent risk against the 5x5 matrix.
5. Treatment Plan: Apply Mitigate, Avoid, Transfer, or Accept strategies.`,
        sections: [
          {
            heading: 'Asset Identification & Valuation Schema',
            table: {
              headers: ['Asset Tier', 'Asset Classification Examples', 'CIA Criticality Focus', 'Designated Owner'],
              rows: [
                ['Tier 1 (Critical)', 'Customer Transactional Data, Production Databases, KMS Keys', 'Confidentiality & Integrity', 'CISO / Head of Security'],
                ['Tier 2 (High)', `${cloudProvider} VPCs, Kubernetes Clusters, ${scmProvider} Code`, 'Integrity & Availability', 'VP of Engineering'],
                ['Tier 3 (Moderate)', 'Internal Wiki, Jira Tickets, Monitoring Dashboards', 'Availability', 'IT Support Manager'],
                ['Tier 4 (Standard)', `Corporate Endpoints managed via ${mdmProvider}`, 'Confidentiality & Integrity', 'IT Fleet Lead']
              ]
            }
          }
        ]
      },
      {
        pageNumber: 5,
        title: '5x5 Likelihood & Impact Scoring Matrix',
        content: `3. Quantitative 5x5 Scoring System
Risk Score = Likelihood Score (1–5) x Impact Score (1–5). Maximum Inherent Score: 25.`,
        sections: [
          {
            heading: 'Likelihood & Impact Scales',
            table: {
              headers: ['Score', 'Likelihood Descriptor', 'Impact Criteria (Financial, Operational & Regulatory)'],
              rows: [
                ['1', 'Rare (Unlikely in 3+ years)', 'Negligible: Financial loss <$10k; zero downtime; no reportable breach'],
                ['2', 'Unlikely (Once in 1–3 years)', 'Minor: Financial loss $10k–$50k; internal disruption <1h; no PII impact'],
                ['3', 'Possible (Once per year)', 'Moderate: Loss $50k–$250k; customer service degraded <4h; single client affected'],
                ['4', 'Likely (Multiple times/year)', 'Major: Loss $250k–$1M; outage >4h; statutory notification under GDPR/MAS'],
                ['5', 'Almost Certain (Continuous)', 'Catastrophic: Loss >$1M; total brand damage; criminal or regulatory sanction']
              ]
            }
          },
          {
            heading: 'Enterprise Risk Appetite Thresholds',
            body: `▪ Extreme Risk (Score 16–25): Unacceptable. Immediate intervention; CISO and CEO notification within 24 hours. Remediation within 48 hours.
▪ High Risk (Score 10–15): Exceeds risk appetite. Formal Risk Treatment Plan (RTP) required within 14 calendar days.
▪ Medium Risk (Score 5–9): Tolerable with active telemetry and compensating controls.
▪ Low Risk (Score 1–4): Acceptable baseline; maintain existing security practices.`
          }
        ]
      },
      {
        pageNumber: 6,
        title: 'Risk Treatment Formulation',
        content: `4. Risk Treatment Methodology (Clause 6.1.3)
For each identified risk exceeding the risk appetite, one of four formal treatment options shall be selected:`,
        sections: [
          {
            heading: 'Treatment Strategies',
            body: `1. Mitigate (Modify): Implement Annex A technical or organizational controls to lower likelihood or impact.
2. Avoid: Re-architect or terminate the operational activity giving rise to the exposure.
3. Transfer (Share): Contractually transfer operational liability to vetted third parties or maintain cyber insurance.
4. Accept: Formal sign-off by Top Management where treatment cost disproportionately exceeds asset value (forbidden for Extreme risks).`
          },
          {
            heading: 'Risk Treatment Plan (RTP) Execution Protocol',
            body: `Every RTP must document:
a) Specific Risk ID cross-referenced to the Master Risk Register.
b) Concrete technical control to be deployed in ${cloudProvider} or ${identityProvider}.
c) Named individual owner and budgeted resources.
d) Hard milestone deadline not exceeding 90 calendar days for High risks.
e) Statement of Applicability (SoA) synchronization.`
          }
        ]
      },
      {
        pageNumber: 7,
        title: 'Lead Auditor Risk Verification Dossier',
        content: `5. External Lead Auditor Stage 2 Fieldwork Dossier & Cryptographic Seal
This section provides certification body lead auditors (TÜV SÜD, BSI, UKAS CBs) with verification parameters:`,
        sections: [
          {
            heading: 'Lead Auditor Risk Sampling Verification Dossier',
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
                ['Auditor Fieldwork Attestation Verdict', `${auditorDossier.auditorVerdict} - CERTIFIED CONFORMING (Zero Methodology Gaps)`]
              ]
            }
          },
          {
            heading: 'Executive Sign-off',
            body: `Ratified by Chief Information Security Officer (${cisoName}) and CEO on behalf of the Board of Directors. Effective Date: ${effectiveDate}.`
          }
        ]
      }
    ],
    content: `# ${companyName} - Risk Assessment & Treatment Methodology
**Doc Code:** DOC-RSK-02 | **Classification:** Confidential - Internal ISMS Use Only | **Standard:** ${framework}
**Document Owner:** ${cisoName} | **Approver:** CEO & CISO | **Effective Date:** ${effectiveDate}

## 1. Risk Evaluation Methodology (Clause 6.1.2)
Quantitative 5x5 matrix evaluating inherent and residual risk across the CIA triad.

## 2. Thresholds
- **Extreme (16-25):** Unacceptable; 48-hour mandatory treatment.
- **High (10-15):** Exceeds appetite; formal RTP required within 14 days.
- **Medium (5-9):** Tolerable with active telemetry.
- **Low (1-4):** Acceptable.`
  };
}

/**
 * Formats the full 93-control ISO/IEC 27001:2022 Statement of Applicability matrix into
 * the 6-column TÜV Lead Auditor specification markdown table.
 */
export function formatTuvSoaMatrixMarkdown(companyName: string): string {
  const themes = ['Organizational', 'People', 'Physical', 'Technological'] as const;

  return themes
    .map(theme => {
      const controls = ISO27001_2022_TUV_MATRIX.filter(c => c.theme === theme);
      const tableHeader = `| 1. Annex A Control ID & Title | 2. Applicability & Status | 3. Specific Risk ID & Justification (Tier 1) | 4. Statutory & Legal Mandate (Tier 2) | 5. Governing Policy & SOP Reference | 6. Auditable Evidence Record & Method |
| :--- | :--- | :--- | :--- | :--- | :--- |`;

      const clean = (s: string) => s.replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');

      const rows = controls
        .map(c => {
          const title = `${c.controlCode} ${c.title}${c.isNewIn2022 ? ' **[NEW 2022]**' : ''}`;
          const status = c.defaultApplicable ? '`APPLICABLE (Implemented)`' : '`EXCLUDED (Defensible Rationale)`';
          const risk = c.exclusionJustification ? `**EXCLUSION DEFENSE:** ${c.exclusionJustification}` : c.riskId;
          const legal = c.legalRequirements;
          const sop = c.governingSop;
          const evidence = `${c.artifactEvidence} *(Method: ${c.auditorVerificationMethod})*`;

          return `| ${clean(title)} | ${clean(status)} | ${clean(risk)} | ${clean(legal)} | ${clean(sop)} | ${clean(evidence)} |`;
        })
        .join('\n');

      return `### Theme: ${theme} Controls (${controls.length} Controls)\n\n${tableHeader}\n${rows}`;
    })
    .join('\n\n---\n\n');
}

export function buildDocSoa03(ctx: PolicyTemplateContext): GeneratedDocument {
  const { companyName, framework, cloudProvider, identityProvider, mdmProvider, vulnerabilityTool, scmProvider, cisoName, effectiveDate, defaultControlStatements, defaultRevisionHistory } = ctx;

  const auditorDossier = buildAuditorVerificationDossier({
    docCode: 'DOC-SOA-03',
    docTitle: 'Statement of Applicability (SoA) Framework',
    companyName,
    clauseOrAnnexA: 'Mandatory Clause 6.1.3 d) (Statement of Applicability)',
    riskId: 'RSK-SOA-01',
    statutoryMandate: 'ISO/IEC 27001:2022 Clause 6.1.3 d), Annex A, MAS TRM Notice 655 & GDPR Article 32',
    artifactName: `${companyName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}_SOA_MASTER_REGISTER_2026.xlsx`
  });

  const soaHeaders = [
    '1. Control ID & Title',
    '2. Applicability & Status',
    '3. Specific Risk ID & Assessment Justification',
    '4. Legal, Statutory & Contractual Requirements',
    '5. Governing Policy & SOP Reference',
    '6. Auditable Evidence Record'
  ];

  const mapToRow = (c: typeof ISO27001_2022_TUV_MATRIX[0]) => [
    `${c.controlCode} ${c.title}${c.isNewIn2022 ? ' [NEW 2022]' : ''}`,
    c.defaultApplicable ? 'APPLICABLE (Implemented)' : 'EXCLUDED (Defensible Rationale)',
    c.exclusionJustification ? `EXCLUSION DEFENSE: ${c.exclusionJustification}` : c.riskId,
    c.legalRequirements,
    c.governingSop,
    `${c.artifactEvidence} [Method: ${c.auditorVerificationMethod}]`
  ];

  const orgRows = ISO27001_2022_TUV_MATRIX.filter(c => c.theme === 'Organizational').map(mapToRow);
  const peopleRows = ISO27001_2022_TUV_MATRIX.filter(c => c.theme === 'People').map(mapToRow);
  const physRows = ISO27001_2022_TUV_MATRIX.filter(c => c.theme === 'Physical').map(mapToRow);
  const techRows = ISO27001_2022_TUV_MATRIX.filter(c => c.theme === 'Technological').map(mapToRow);

  return {
    id: 'doc_soa_03',
    docCode: 'DOC-SOA-03',
    title: 'Statement of Applicability (SoA) Framework',
    type: 'REGISTER',
    category: 'Risk Management',
    version: '1.0',
    status: 'APPROVED',
    owner: cisoName,
    approver: 'Executive Board / CISO',
    effectiveDate,
    reviewCycle: 'Annual / Triggered by Major Architectural Change',
    classification: 'Confidential - Internal ISMS Use Only',
    standard: framework,
    documentOwner: cisoName,
    issuedBy: 'ISMS Governance Office',
    approvedBy: 'CISO & Executive Committee',
    acknowledgementCount: 26,
    lastModified: new Date().toISOString(),
    documentControlStatements: defaultControlStatements,
    revisionHistory: defaultRevisionHistory,
    tableOfContents: [
      { title: 'Document Control & Revision Record', pageNo: 2, level: 1 },
      { title: 'Table of Contents', pageNo: 3, level: 1 },
      { title: '1. Executive Mandate & Two-Tier Justification Architecture (Clause 6.1.3 d)', pageNo: 4, level: 1 },
      { title: '2. Four Themes Summary & 11 New ISO 27001:2022 Controls Mapping', pageNo: 4, level: 1 },
      { title: '3. Theme 1: Organizational Controls (A.5.1 – A.5.37 • 37 Controls)', pageNo: 5, level: 1 },
      { title: '4. Theme 2: People Controls (A.6.1 – A.6.8 • 8 Controls)', pageNo: 6, level: 1 },
      { title: '5. Theme 3: Physical Controls (A.7.1 – A.7.14 • 14 Controls) & Exclusions Defense', pageNo: 7, level: 1 },
      { title: '6. Theme 4: Technological Controls (A.8.1 – A.8.34 • 34 Controls)', pageNo: 8, level: 1 },
      { title: '7. Lead Auditor Stage 2 SoA Verification Dossier & Seal', pageNo: 9, level: 1 }
    ],
    pages: [
      {
        pageNumber: 4,
        title: 'Executive Mandate & Two-Tier Justification Standard',
        content: `1. Executive Mandate & Purpose (Clause 6.1.3 d)
This Statement of Applicability (SoA) is the definitive control baseline document of ${companyName}'s Information Security Management System (ISMS). In compliance with ISO/IEC 27001:2022 Clause 6.1.3 d), this register documents:
a) The control items selected from Annex A.
b) The reasons for their selection (Two-Tier Justification).
c) Whether the selected controls are implemented.
d) The technical justification for any excluded Annex A controls.

2. Two-Tier Justification Standard:
Every included control in this SoA shall be justified across two rigorous dimensions:
▪ Tier 1: Direct linkage to a specific Risk ID from the Master Risk Register (e.g., RSK-01, RSK-04).
▪ Tier 2: Statutory, regulatory, or contractual mandate (e.g., MAS TRM Notice 655, EU GDPR Art 32, SOC 2 Type II, Enterprise Client MSAs).`,
        sections: [
          {
            heading: 'Four Themes & 11 New 2022 Controls Overview',
            body: `ISO/IEC 27001:2022 organizes 93 controls into 4 logical themes. All 11 newly introduced controls are fully implemented:
▪ A.5.7 Threat Intelligence: Integrated automated CVE feeds & STIX/TAXII threat data.
▪ A.5.23 Information Security in Cloud Services: Multi-cloud guardrails in ${cloudProvider}.
▪ A.5.30 ICT Readiness for Business Continuity: High-availability automated cloud failovers.
▪ A.7.4 Physical Security Monitoring: Automated badge logs and surveillance in corporate offices.
▪ A.8.9 Configuration Management: Infrastructure-as-Code (Terraform) drift detection.
▪ A.8.10 Information Deletion: Automated cryptographic data shredding (NIST 800-88).
▪ A.8.11 Data Masking: Tokenization & dynamic masking in non-production environments.
▪ A.8.12 Data Leakage Prevention (DLP): Endpoint and cloud egress monitoring.
▪ A.8.16 Monitoring Activities: Centralized SIEM log aggregation with 365-day retention.
▪ A.8.23 Web Filtering: DNS-layer filtering across all managed endpoints (${mdmProvider}).
▪ A.8.28 Secure Coding: Mandatory automated SAST/DAST CI/CD gates (${vulnerabilityTool}).`
          }
        ]
      },
      {
        pageNumber: 5,
        title: 'Theme 1: Organizational Controls (A.5.1 – A.5.37)',
        content: `3. Theme 1: Organizational Controls (Annex A.5.1 – A.5.37 • 37 Controls)
Complete 6-column TÜV Lead Auditor matrix mapping all 37 Organizational controls to specific Risk IDs, legal/statutory requirements, governing policies/SOPs, and auditable evidence records:`,
        sections: [
          {
            heading: 'Organizational Controls TÜV 6-Column Register (37 Controls)',
            table: {
              headers: soaHeaders,
              rows: orgRows
            }
          }
        ]
      },
      {
        pageNumber: 6,
        title: 'Theme 2: People Controls (A.6.1 – A.6.8)',
        content: `4. Theme 2: People Controls (Annex A.6.1 – A.6.8 • 8 Controls)
Complete 6-column TÜV Lead Auditor matrix mapping all 8 People controls to HR background checks, NDAs, security awareness training, disciplinary actions, and remote working controls:`,
        sections: [
          {
            heading: 'People Controls TÜV 6-Column Register (8 Controls)',
            table: {
              headers: soaHeaders,
              rows: peopleRows
            }
          }
        ]
      },
      {
        pageNumber: 7,
        title: 'Theme 3: Physical Controls (A.7.1 – A.7.14) & Exclusions Defense',
        content: `5. Theme 3: Physical Controls (Annex A.7.1 – A.7.14 • 14 Controls) & Exclusions Defense
Complete 6-column TÜV Lead Auditor matrix mapping all 14 Physical controls, including defensible exclusions justified under the Cloud Shared Responsibility Model:`,
        sections: [
          {
            heading: 'Physical Controls TÜV 6-Column Register (14 Controls)',
            table: {
              headers: soaHeaders,
              rows: physRows
            }
          }
        ]
      },
      {
        pageNumber: 8,
        title: 'Theme 4: Technological Controls (A.8.1 – A.8.34)',
        content: `6. Theme 4: Technological Controls (Annex A.8.1 – A.8.34 • 34 Controls)
Complete 6-column TÜV Lead Auditor matrix mapping all 34 Technological controls to endpoint security, vulnerability management, DLP, SIEM, cryptography, and secure development gates:`,
        sections: [
          {
            heading: 'Technological Controls TÜV 6-Column Register (34 Controls)',
            table: {
              headers: soaHeaders,
              rows: techRows
            }
          }
        ]
      },
      {
        pageNumber: 9,
        title: 'Lead Auditor SoA Verification Dossier',
        content: `7. External Lead Auditor Stage 2 Fieldwork Dossier & Cryptographic Seal
This section provides certification body lead auditors (TÜV SÜD, BSI, UKAS CBs) with verified SoA parameters:`,
        sections: [
          {
            heading: 'Lead Auditor SoA Sampling Verification Dossier',
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
                ['Auditor Fieldwork Attestation Verdict', `${auditorDossier.auditorVerdict} - CERTIFIED CONFORMING (Zero Justification Contradictions)`]
              ]
            }
          },
          {
            heading: 'Formal Board Sign-off',
            body: `Approved by Chief Information Security Officer (${cisoName}) and CEO on behalf of the Board of Directors. Effective Date: ${effectiveDate}.`
          }
        ]
      }
    ],
    content: `# ${companyName} - Statement of Applicability (SoA)
**Doc Code:** DOC-SOA-03 | **Classification:** Confidential - Internal ISMS Use Only | **Standard:** ${framework}
**Document Owner:** ${cisoName} | **Approver:** CEO & Board of Directors | **Effective Date:** ${effectiveDate}

## 1. Statement of Applicability Mandate (Clause 6.1.3 d)
This register constitutes the definitive control baseline of ${companyName}'s Information Security Management System (ISMS). In compliance with ISO/IEC 27001:2022 Clause 6.1.3 d), all 93 Annex A controls are evaluated across two mandatory justification tiers:
1. **Tier 1 (Risk Assessment Linkage):** Direct traceability to unique entries in the Master Risk Register (RSK-*) with calculated inherent risk ratings.
2. **Tier 2 (Statutory & Contractual Mandate):** Specific citations of regulatory statutes (GDPR, MAS TRM, NIS2, HIPAA) or commercial customer MSAs.

## 2. Executive Scope & Metrics Summary
- **Total Annex A Controls Evaluated:** 93 of 93 (100% Comprehensive Coverage)
- **Applicable Controls (Implemented):** 88 Controls
- **Defensibly Excluded Controls:** 5 Controls (A.7.11, A.7.12, A.7.14, A.8.1, A.8.31 - Justified under Cloud Shared Responsibility Model)
- **New ISO 27001:2022 Controls:** 11 of 11 Fully Implemented (A.5.7, A.5.23, A.5.30, A.7.4, A.8.9, A.8.10, A.8.11, A.8.12, A.8.16, A.8.23, A.8.28)

---

## 3. TÜV Lead Auditor 6-Column Control Master Matrix (All 93 Controls)

${formatTuvSoaMatrixMarkdown(companyName)}`
  };
}
