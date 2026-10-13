# Incident Management Policy

*Consulting Benchmark Sample — Establish mandatory incident reporting, severity classification (SEV-1 to SEV-4), response team structure (CSIRT), and statutory breach notification deadlines.*

> **[!WARNING] ILLUSTRATIVE MODEL DOCUMENT — MUST BE TAILORED AND APPROVED BEFORE USE**

### Document Control Field

| Document Control Field | Model Value |
|---|---|
| **Document ID** | POL-SEC-011-MODEL |
| **Version / Status** | 1.0 — Model sample (illustrative benchmark) — Model sample — not approved; not effective |
| **Document Owner** | Head of Incident Response & SOC (Illustrative Benchmark) |
| **Approver** | CISO & General Counsel (Illustrative Benchmark) |
| **Effective Date** | Not effective until formally tailored and approved |
| **Classification** | INTERNAL_ILLUSTRATIVE |
| **Review Trigger** | Scheduled annual review and material business, technology, risk or regulatory change |

> *This document demonstrates the depth, structure, and operational specificity expected of an enterprise consulting-grade artifact. It does not represent an actual organization and cannot be submitted to auditors without tailoring.*

### Revision History

| Version | Date | Summary of Change | Prepared By | Approval Status |
|---|---|---|---|---|
| 1.0 | 2026-10-12 | Baseline illustrative model sample generated for Incident Management Policy fulfilling Annex A.5.24, A.5.25, A.5.26, A.5.27. | Legal & Regulatory Counsel (SKANDA Benchmark Engine) | Model sample — not approved |

## 1. Purpose

Establish an authoritative, structured, and auditable policy framework for Incident Response Governance. This document fulfills the requirements of ISO_27001_2022 (Annex A.5.24, A.5.25, A.5.26, A.5.27) while ensuring clear separation between management intent, operational execution, and verifiable evidence.

## 2. Scope

This policy applies across all illustrative enterprise environments, production cloud clusters, data storage repositories, and personnel supporting Incident Response Governance.

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

## 4. Policy Objectives

- Establish an authoritative 4-tier security incident classification and response framework for Acme Global FinTech Inc..
- Define unambiguous command-and-control authority during active crises through the Computer Incident Response Team (CIRT).
- Mandate strict adherence to statutory regulatory breach notification deadlines across all operating jurisdictions based on verified legal applicability.

## 6. Mandatory Policy Requirements

### REQ-01 Incident Classification Hierarchy

Acme Global FinTech Inc. establishes four severity tiers: Severity 1 (Critical Enterprise Incident: confirmed breach, exfiltration of sensitive data, or complete core service outage); Severity 2 (Major Incident: elevated threat with contained impact); Severity 3 (Moderate: localized disruption); Severity 4 (Low: minor anomaly).

### REQ-02 Incident Commander Authority and War Room Activation

Upon declaration of a P1 or P2 incident, the designated Incident Commander assumes sole operational command. The Incident Commander has pre-authorized executive authority to sever external network connections, isolate systems, and revoke credentials without standard change advisory board approval.

### REQ-03 Jurisdictional Regulatory Notification Decision Matrix

Formal regulatory breach intimations must be executed strictly in accordance with verified jurisdictional thresholds and entity applicability: (1) CERT-In (India): Pursuant to IT Act 2000 §70B(6) and 2022 Directions, applicable Indian entities, intermediaries, and body corporates must report any of the 20 specified Annexure I cyber incident types to CERT-In within 6 hours of noticing or being brought to notice; (2) MAS (Singapore): Pursuant to MAS Notice 644/126, regulated Financial Institutions in Singapore must notify the Monetary Authority of Singapore as soon as possible and in any event within 1 hour upon discovery of a relevant critical incident causing severe operational disruption, followed by a formal investigation report within 14 calendar days; (3) EU GDPR: Pursuant to Regulation (EU) 2016/679 Art 33(1), Data Controllers must notify the competent supervisory authority without undue delay and, where feasible, within 72 hours of becoming aware of a personal data breach likely to result in a risk to rights and freedoms (unless the breach is unlikely to result in risk); and notify data principals under Art 34 without undue delay where high risk is likely; (4) India DPDP Act 2023: Pursuant to Section 8(6), in the event of a personal data breach, Data Fiduciaries must give intimation to the Data Protection Board of India and each affected Data Principal in such form and manner as may be prescribed by the Central Government Rules. Internal operational response targets (SOC triage within 15 minutes, CIRT War Room mobilization within 30 minutes) operate as internal service level objectives to ensure statutory windows are never compromised.

### REQ-04 Forensic Evidence Preservation and Chain of Custody

During active containment, digital evidence (memory dumps, disk images, firewall packet captures) must be collected using forensically validated tools, cryptographically hashed with SHA-256, and preserved in write-once-read-many (WORM) storage with completed chain-of-custody forms.

### REQ-05 Post-Incident Review (PIR) and Continual Improvement

A blameless post-incident retrospective must be conducted within 5 business days of P1/P2 closure. Root cause analysis (RCA) findings must generate corrective and preventive action (CAPA) tickets tracked to verified completion.

## 7. Control Implementation and Evidence

| Governance Object | Minimum Expected Record | Assurance Limitation |
|---|---|---|
| **Annex A.5.24 Incident Management** | ITSM Incident log, War Room timeline, and formal Post-Incident Review document | An incident policy defines protocol; simulated tabletop exercises and red team engagements are required to validate response efficacy. |

## Appendix C — Pre-Publication Tailoring Checklist

- [ ] **CHK-INPUT-01**: Validate organizational value for: organizationProfile.legalEntityName (currently set to illustrative benchmark). 
- [ ] **CHK-INPUT-02**: Validate organizational value for: keyRolesAndDelegations.ismsOwnerOrCisoRole (currently set to illustrative benchmark). 
- [ ] **CHK-INPUT-03**: Validate organizational value for: organizationProfile.jurisdictions (currently set to illustrative benchmark). 
- [ ] **CHK-BENCH-01**: Verify model thresholds, SLAs, and technical roles against actual corporate delegations. 
- [ ] **CHK-BENCH-02**: Obtain formal management sign-off to transition illustrative model to live draft. 

