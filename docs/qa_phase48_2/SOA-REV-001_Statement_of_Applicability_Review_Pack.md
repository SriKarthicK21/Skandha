# Statement of Applicability Support Template

*Consulting Benchmark Sample — Provide complete ISO/IEC 27001:2022 Annex A (Controls A.5.1 to A.8.34) Statement of Applicability (SoA) matrix: applicability, inclusion/exclusion justification, implementation status, and evidence.*

> **[!WARNING] ILLUSTRATIVE MODEL DOCUMENT — MUST BE TAILORED AND APPROVED BEFORE USE**

### Document Control Field

| Document Control Field | Model Value |
|---|---|
| **Document ID** | REV-SOA-001-MODEL |
| **Version / Status** | 1.0 — Model sample (illustrative benchmark) — Model sample — not approved; not effective |
| **Document Owner** | CISO / ISO Implementer Lead (Illustrative Benchmark) |
| **Approver** | Executive Committee & Board (Illustrative Benchmark) |
| **Effective Date** | Not effective until formally tailored and approved |
| **Classification** | INTERNAL_ILLUSTRATIVE |
| **Review Trigger** | Scheduled annual review and material business, technology, risk or regulatory change |

> *This document demonstrates the depth, structure, and operational specificity expected of an enterprise consulting-grade artifact. It does not represent an actual organization and cannot be submitted to auditors without tailoring.*

### Revision History

| Version | Date | Summary of Change | Prepared By | Approval Status |
|---|---|---|---|---|
| 1.0 | 2026-10-12 | Baseline illustrative model sample generated for Statement of Applicability Support Template fulfilling Clause 6.1.3(d). | Lead Auditor (SKANDA Benchmark Engine) | Model sample — not approved |

## 1. Purpose

Establish an authoritative, structured, and auditable management_review_pack framework for ISO 27001 Core Deliverables. This document fulfills the requirements of ISO_27001_2022 (Clause 6.1.3(d)) while ensuring clear separation between management intent, operational execution, and verifiable evidence.

## 2. Scope

This management_review_pack applies across all illustrative enterprise environments, production cloud clusters, data storage repositories, and personnel supporting ISO 27001 Core Deliverables.

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

## Statement of Applicability (SoA) Evaluation Matrix

| Control ID | Title | Theme | Applicable | Status | Justification | Supporting Document |
|---|---|---|---|---|---|---|
| **A.5.1** | Policies for Information Security | ORGANIZATIONAL | Yes | IMPLEMENTED | Mandatory foundational control providing management direction and governance baseline. | ISMS-POL-001 Information Security Policy |
| **A.5.15** | Access Control | ORGANIZATIONAL | Yes | IMPLEMENTED | Critical for protecting customer financial data and production cloud infrastructure. | ISMS-POL-002 Access Control Policy; ISMS-PROC-IAM-001 Provisioning Procedure |
| **A.5.19** | Information Security in Supplier Relationships | ORGANIZATIONAL | Yes | IMPLEMENTED | High reliance on third-party cloud infrastructure (AWS) and SaaS platforms. | ISMS-POL-014 Supplier Security Policy; ISMS-PROC-TPRM-001 TPRM Procedure |
| **A.6.7** | Remote Working | PEOPLE | Yes | IMPLEMENTED | Hybrid workforce operating across distributed international locations. | ISMS-POL-017 Remote Working Guideline |
| **A.7.1** | Physical Security Perimeters | PHYSICAL | Yes | IMPLEMENTED | Corporate headquarters hosts network operations and executive offices. | ISMS-POL-005 Physical & Environmental Security Policy |
| **A.7.14** | Secure Disposal or Re-use of Equipment | PHYSICAL | Yes | IMPLEMENTED | Prevention of data leakage through retired laptops and decommissioned servers. | ISMS-PROC-DISP-001 Media Sanitization Work Instruction |
| **A.8.2** | Privileged Access Rights | TECHNOLOGICAL | Yes | IMPLEMENTED | Essential safeguard against lateral movement and administrative compromise. | ISMS-PROC-IAM-004 Privileged Access Management Procedure |
| **A.8.8** | Management of Technical Vulnerabilities | TECHNOLOGICAL | Yes | IMPLEMENTED | Mitigates exploitation of CVEs across container clusters and endpoints. | ISMS-POL-009 Vulnerability Management Policy |
| **A.8.24** | Use of Cryptography | TECHNOLOGICAL | Yes | IMPLEMENTED | Protects confidentiality and integrity of customer data at rest and in transit. | ISMS-POL-007 Cryptography and Key Management Policy |
| **A.8.32** | Change Management | TECHNOLOGICAL | Yes | IMPLEMENTED | Ensures authorized, tested, and reversible changes to production software. | ISMS-PROC-CHG-001 Change Management Procedure |

## Management Review Agenda & Executive Decisions

| Item | Agenda Topic | Mandatory Input (ISO 27001 Clause 9.3) | Evidence Presented | Executive Decision / Allocation | Action Owner | Due Date |
|---|---|---|---|---|---|---|
| **1** | Review of Previous Management Review Action Items | ISO/IEC 27001:2022 Clause 9.3(a) | Verification of 4 open CAPA tickets from Q2 2026 review; all 4 tickets verified as closed with tested evidence. | Approved formal closure of Q2 action register. | ISMS Lead Implementer | 2026-10-15 |
| **2** | Changes in External and Internal Context & Stakeholder Expectations | ISO/IEC 27001:2022 Clause 9.3(b) | Assessment of India DPDP Act 2023 Rules gazetted and updated MAS TRM circulars; risk register refreshed. | Authorized allocation of $45,000 for automated consent management platform integration. | CISO / Head of Privacy | 2026-11-30 |
| **3** | ISMS Performance, Control Metrics & Nonconformity Trends | ISO/IEC 27001:2022 Clause 9.3(c) | Zero P1 incidents in preceding 6 months; 99.8% MFA enforcement rate; patch SLA compliance at 96.4%. | Commended SecOps team; mandated sprint priority for 3 overdue High vulnerability patches. | SecOps Lead | 2026-10-25 |
| **4** | Internal & External Audit Results Assessment | ISO/IEC 27001:2022 Clause 9.3(d) | Internal audit completed 12 control domains with 2 minor nonconformities (access review timeliness, asset tag sync). | Formally approved corrective action plans with 30-day closure targets. | Internal Audit Lead | 2026-11-15 |
| **5** | Formal Statement of Applicability (SoA) Ratification | ISO/IEC 27001:2022 Clause 6.1.3(d) | Complete evaluation of all 93 Annex A controls across Organizational, People, Physical, Technological themes. | Executive Committee and CISO formally ratified SoA Version 1.2 as authoritative benchmark. | CISO | 2026-10-12 |

## Appendix C — Pre-Publication Tailoring Checklist

- [ ] **CHK-INPUT-01**: Validate organizational value for: organizationProfile.legalEntityName (currently set to illustrative benchmark). 
- [ ] **CHK-INPUT-02**: Validate organizational value for: scopeDefinition.inScopeServicesAndProducts (currently set to illustrative benchmark). 
- [ ] **CHK-BENCH-01**: Verify model thresholds, SLAs, and technical roles against actual corporate delegations. 
- [ ] **CHK-BENCH-02**: Obtain formal management sign-off to transition illustrative model to live draft. 

