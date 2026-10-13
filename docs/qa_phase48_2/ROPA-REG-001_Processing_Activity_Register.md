# Processing Activity Register

*Consulting Benchmark Sample — Provide structured, auditable Article 30 / Section 8 Register of Processing Activities (RoPA): processing purposes, data categories, recipients, cross-border transfers, and retention.*

> **[!WARNING] ILLUSTRATIVE MODEL DOCUMENT — MUST BE TAILORED AND APPROVED BEFORE USE**

### Document Control Field

| Document Control Field | Model Value |
|---|---|
| **Document ID** | REG-ROPA-001-MODEL |
| **Version / Status** | 1.0 — Model sample (illustrative benchmark) — Model sample — not approved; not effective |
| **Document Owner** | DPO & Privacy Lead (Illustrative Benchmark) |
| **Approver** | General Counsel (Illustrative Benchmark) |
| **Effective Date** | Not effective until formally tailored and approved |
| **Classification** | INTERNAL_ILLUSTRATIVE |
| **Review Trigger** | Scheduled annual review and material business, technology, risk or regulatory change |

> *This document demonstrates the depth, structure, and operational specificity expected of an enterprise consulting-grade artifact. It does not represent an actual organization and cannot be submitted to auditors without tailoring.*

### Revision History

| Version | Date | Summary of Change | Prepared By | Approval Status |
|---|---|---|---|---|
| 1.0 | 2026-10-12 | Baseline illustrative model sample generated for Processing Activity Register fulfilling Article 30, Section 8. | Business Unit Leads (SKANDA Benchmark Engine) | Model sample — not approved |

## 1. Purpose

Establish an authoritative, structured, and auditable register_log framework for Regulatory Registers & RoPA. This document fulfills the requirements of GDPR (Article 30), DPDP_ACT_2023 (Section 8) while ensuring clear separation between management intent, operational execution, and verifiable evidence.

## 2. Scope

This register_log applies across all illustrative enterprise environments, production cloud clusters, data storage repositories, and personnel supporting Regulatory Registers & RoPA.

- **In-Scope Locations**: Global Headquarters (Singapore), Primary Cloud Region (AWS US-East-1), Disaster Recovery Region (AWS AP-Southeast-1)
- **In-Scope Systems & Services**: Production Transaction Switch, Enterprise Identity Provider (Okta), Continuous Deployment Pipelines, Authoritative Records Vault

**Documented Exclusions:**
- *Decommissioned Legacy Batch Server (DC-01)*: Fully air-gapped and retired in Q1 2026; zero customer data processed.

## 3. Terms and Definitions

| Term | Working Definition (Model) |
|---|---|
| **Documented Information** | Information required to be controlled and maintained by the organization (ISO/IEC 27001:2022 Clause 7.5). |
| **Accountable Role** | The single operational role with ultimate decision-making authority and veto for the activity. |
| **Verifiable Evidence** | Attributable, timestamped, immutable record confirming that a requirement was performed in practice. |
| **Operating Effectiveness** | Confirmation through systematic testing and evidence sampling that a control operates reliably over a period of time. |

## Register Schema & Column Specifications

| Field Name | Data Type | Mandatory | Regulatory Source | Description |
|---|---|---|---|---|
| **Controller & DPO Contact Details** | String | Yes | EU GDPR Art 30(1)(a) | Name and contact details of the controller and, where applicable, the joint controller, representative, and data protection officer |
| **Purpose of Processing** | String | Yes | EU GDPR Art 30(1)(b) | The specific purposes of the processing operation |
| **Categories of Data Subjects** | StringList | Yes | EU GDPR Art 30(1)(c) | Description of the categories of data subjects (e.g. employees, retail consumers, prospects) |
| **Categories of Personal Data** | StringList | Yes | EU GDPR Art 30(1)(c) | Description of the categories of personal data (e.g. contact identifiers, financial, special category) |
| **Categories of Recipients & Processors** | StringList | Yes | EU GDPR Art 30(1)(d) | The categories of recipients to whom personal data have been or will be disclosed, including third-party processors |
| **Cross-Border Transfers & Safeguards** | String | Yes | EU GDPR Art 30(1)(e) | Identification of third country or international organisation and documentation of suitable safeguards (e.g. Standard Contractual Clauses under Art 46) |
| **Time Limits for Erasure & Retention Schedule** | String | Yes | EU GDPR Art 30(1)(f) | Envisaged statutory and operational time limits for erasure of the different categories of data |
| **Technical & Organisational Security Measures (TOMs)** | String | Yes | EU GDPR Art 30(1)(g) / Art 32 | General description of technical and organisational security measures pursuant to Article 32(1) |
| **DPDP Notice Reference & Lawful Ground** | String | Yes | DPDP Act 2023 Sec 4 & 5 | Reference to Section 5 notice and lawful ground: consent under Sec 6 or certain legitimate uses under Sec 4(2) / Sec 7 |
| **Minor / Disabled Data Principal Flag** | Boolean | Yes | DPDP Act 2023 Sec 9 | Indicates whether personal data of children (< 18 years) is processed; triggers verifiable parental consent and prohibition on tracking |
| **DPDP Grievance Redressal Mechanism** | String | Yes | DPDP Act 2023 Sec 8(9) | Readily available mechanism and contact details for redressing grievances of Data Principals |
| **DPDP Purpose Fulfillment Erasure Trigger** | String | Yes | DPDP Act 2023 Sec 8(7) | Criteria determining when purpose is no longer being served, triggering mandatory erasure of personal data |
| **Internal Process Identifier (Process ID)** | String | Yes | Enterprise Governance Standard | Unique internal inventory identifier assigned to the processing activity |
| **Lawful Basis under GDPR Art 6** | Enum | Yes | EDPB / ICO RoPA Guidance | Specific lawful ground under GDPR Art 6(1): Consent (a), Contract (b), Legal Obligation (c), Vital Interests (d), Public Task (e), or Legitimate Interests (f) |
| **DPIA Reference & Risk Rating** | String | No | GDPR Art 35 / DPDP Sec 10 Guidance | Cross-reference to Data Protection Impact Assessment record and residual privacy risk determination |
| **Operating Business Unit & Custodian** | String | Yes | ISO/IEC 27701 Cl 5.2.1 | Operating department and individual business owner managing the data processing activity |

## Register Records & Operational Entries

### Record 1: ROPA-ACT-001 (Customer Operations)

| Attribute | Value |
|---|---|
| **Internal Process Identifier (Process ID)** | ROPA-ACT-001 |
| **Processing Activity Name** | Customer Onboarding & Identity Verification (KYC) |
| **Controller & DPO Contact Details** | Acme Global FinTech Inc. (Data Controller); DPO: dpo@acmefintech.com |
| **Operating Business Unit & Custodian** | Acme Global FinTech Inc. / Operations & FinCrime Division |
| **Purpose of Processing** | Fulfill statutory identity verification and Anti-Money Laundering (AML) mandates |
| **Lawful Basis under GDPR Art 6** | Legal Obligation (GDPR Art 6(1)(c)) |
| **DPDP Notice Reference & Lawful Ground** | Section 5 KYC Notice; Consent under Sec 6 and Legitimate Uses under Sec 4(2) |
| **Categories of Data Subjects** | Prospective & active retail banking customers |
| **Categories of Personal Data** | Government Photo ID, Full Name, DOB, Tax ID, Residential Address, Selfie Match Hash |
| **Minor / Disabled Data Principal Flag** | No (Adult retail banking only >= 18 years) |
| **Categories of Recipients & Processors** | Jumio KYC Cloud (Sub-processor), Monetary Authority Auditors |
| **Cross-Border Transfers & Safeguards** | Singapore to AWS US-East-1 (Standard Contractual Clauses with Transfer Impact Assessment) |
| **Time Limits for Erasure & Retention Schedule** | 5 years post-account closure per statutory banking requirements; automated cryptographic purge |
| **DPDP Purpose Fulfillment Erasure Trigger** | Account closure or KYC rejection, subject to statutory AML retention period |
| **DPDP Grievance Redressal Mechanism** | Online Grievance Portal & Officer: grievance-officer@acmefintech.com |
| **Technical & Organisational Security Measures (TOMs)** | AES-256 field-level encryption, TLS 1.3 in transit, KMS envelope encryption, Role-based access |
| **DPIA Reference & Risk Rating** | DPIA-2026-KYC-01 (Residual Risk: Low) |
| **Last Reviewed** | 2026-10-10 |
| **Compliance Status** | VERIFIED_COMPLIANT |

### Record 2: ROPA-ACT-002 (Human Resources)

| Attribute | Value |
|---|---|
| **Internal Process Identifier (Process ID)** | ROPA-ACT-002 |
| **Processing Activity Name** | Workforce Human Resources & Payroll Administration |
| **Controller & DPO Contact Details** | Acme Global FinTech Inc. (Data Controller); DPO: dpo@acmefintech.com |
| **Operating Business Unit & Custodian** | Acme Global FinTech Inc. / People Operations |
| **Purpose of Processing** | Employment contract execution, salary remittance, tax withholding, and benefit management |
| **Lawful Basis under GDPR Art 6** | Performance of Contract (GDPR Art 6(1)(b)) |
| **DPDP Notice Reference & Lawful Ground** | Section 5 Employee Onboarding Notice; Employment Ground under Sec 7(i) |
| **Categories of Data Subjects** | Full-time employees, contractors, direct dependents |
| **Categories of Personal Data** | National ID, Bank Account Number, Salary Data, Medical Benefit Records, Home Address |
| **Minor / Disabled Data Principal Flag** | No (Workforce accounts only; minor dependents processed solely for medical insurance with parental consent) |
| **Categories of Recipients & Processors** | Workday HCM (Cloud SaaS), Local Tax Authority, Commercial Payroll Bank |
| **Cross-Border Transfers & Safeguards** | Global offices to Singapore Headquarters (Intra-Group Data Transfer Agreement) |
| **Time Limits for Erasure & Retention Schedule** | Employment duration + 7 years statutory tax retention; certified electronic shredding |
| **DPDP Purpose Fulfillment Erasure Trigger** | Surrender of employment + statutory tax retention expiry |
| **DPDP Grievance Redressal Mechanism** | Internal HR Ombudsman & Grievance Portal: hr-grievance@acmefintech.com |
| **Technical & Organisational Security Measures (TOMs)** | SSO with mandatory FIDO2 hardware MFA, database column masking, strict RBAC |
| **DPIA Reference & Risk Rating** | DPIA-2025-HR-02 (Residual Risk: Low) |
| **Last Reviewed** | 2026-10-10 |
| **Compliance Status** | VERIFIED_COMPLIANT |

### Record 3: ROPA-ACT-003 (Technology & Product)

| Attribute | Value |
|---|---|
| **Internal Process Identifier (Process ID)** | ROPA-ACT-003 |
| **Processing Activity Name** | Cloud Platform Diagnostic Telemetry & Error Logging |
| **Controller & DPO Contact Details** | Acme Global FinTech Inc. (Data Controller); DPO: dpo@acmefintech.com |
| **Operating Business Unit & Custodian** | Acme Global FinTech Inc. / Site Reliability Engineering |
| **Purpose of Processing** | System stability monitoring, cyber threat detection, and software bug remediation |
| **Lawful Basis under GDPR Art 6** | Legitimate Interest (GDPR Art 6(1)(f)) |
| **DPDP Notice Reference & Lawful Ground** | Platform Privacy Notice; Technical Security Use under Sec 7(b) |
| **Categories of Data Subjects** | Application users, API callers |
| **Categories of Personal Data** | Masked IP Address, User Agent String, Transaction Session ID, Timestamped Error Traces |
| **Minor / Disabled Data Principal Flag** | No |
| **Categories of Recipients & Processors** | Datadog Cloud SIEM (Processor), AWS CloudWatch |
| **Cross-Border Transfers & Safeguards** | AWS AP-Southeast-1 to AWS US-East-1 (Standard Contractual Clauses) |
| **Time Limits for Erasure & Retention Schedule** | Rolling 90-day retention; automated S3 lifecycle expiration and permanent deletion |
| **DPDP Purpose Fulfillment Erasure Trigger** | 90-day log expiration cycle automated by AWS lifecycle rule |
| **DPDP Grievance Redressal Mechanism** | Security & Privacy Desk: privacy@acmefintech.com |
| **Technical & Organisational Security Measures (TOMs)** | Automated PII scrubbing at ingestion proxy, salted hashing of session identifiers, TLS 1.3 |
| **DPIA Reference & Risk Rating** | DPIA-2025-LOG-01 (Residual Risk: Low) |
| **Last Reviewed** | 2026-10-10 |
| **Compliance Status** | VERIFIED_COMPLIANT |

## Appendix C — Pre-Publication Tailoring Checklist

- [ ] **CHK-INPUT-01**: Validate organizational value for: organizationProfile.legalEntityName (currently set to illustrative benchmark). 
- [ ] **CHK-INPUT-02**: Validate organizational value for: scopeDefinition.inScopeServicesAndProducts (currently set to illustrative benchmark). 
- [ ] **CHK-BENCH-01**: Verify model thresholds, SLAs, and technical roles against actual corporate delegations. 
- [ ] **CHK-BENCH-02**: Obtain formal management sign-off to transition illustrative model to live draft. 

