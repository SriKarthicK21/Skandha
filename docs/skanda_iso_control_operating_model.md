# SKANDA ISO 27001 Control Operating Model & Canonical Control 360
## Enterprise Control Specification, Lifecycle Management & Operational Governance

**Document Reference:** `SKD-CTL-OPS-001`  
**Classification:** Enterprise Methodology & Implementation Standard  
**Date:** October 8, 2026  
**Architect Personas:** Senior Chief ISO/IEC 27001:2022 Implementer, Senior ISO Lead Auditor, Enterprise GRC Architect  

---

### Executive Methodology Summary

In legacy GRC tools, a security control is frequently treated as a passive static text string with a checkbox. This static approach fails during real audits because controls exist in dynamic environments: code changes, vendors rotate, employees leave, and evidence expires.

SKANDA establishes the **Canonical Control Operating Model** and the **Control 360 Architecture**. Under this model, a control is a live, stateful enterprise object that actively binds to business processes, assets, risks, policies, evidence artifacts, ISO 19011 test fieldwork records, non-conformity findings, CAPA remediations, and real-time telemetry sensors.

---

### 1. The Canonical Control 360 Domain Model

```
                               ┌────────────────────────────────┐
                               │       CANONICAL CONTROL        │
                               │          (CTRL-XXX)            │
                               └───────────────┬────────────────┘
                                               │
      ┌────────────────────────┬───────────────┼───────────────┬────────────────────────┐
      ▼                        ▼               ▼               ▼                        ▼
[ GOVERNANCE ]           [ RISK LINK ]   [ EVIDENCE ]    [ FIELDWORK ]           [ REMEDIATION ]
- Objectives & Mandates  - Inherent Risk - SHA-256 Hash  - ISO 19011 Sampling    - Findings (NC)
- Policy & SOP Citations - Residual Risk - Freshness (90d)- Pass / Fail / Partial - 5-Whys RCA
- Owner, RACI, Cadence   - Threat Model  - WORM Storage  - Tester Signoff        - Closed-Loop CAPA
- Exceptions & Waivers   - Treatment Plan- Chain of Cust.- Last/Next Test Date   - Retest Verification
```

---

### 2. Control 360 Schema Specification (30 Standard Attributes)

Every canonical control within SKANDA implements the following 30 enterprise attributes:

| # | Attribute Name | Data Type & Format | Description & Operational Function |
|---|---|---|---|
| **1** | `controlId` | String (`CTRL-XXX-NNN`) | Unique canonical primary key. Universal identifier referenced across all frameworks. |
| **2** | `controlCode` | String (`A.5.15`, `PR.AA-01`) | Framework-specific designation code (e.g., ISO 27001 Annex A, NIST CSF, SOC 2). |
| **3** | `name` | String (≤ 120 chars) | Concise, descriptive title of the control. |
| **4** | `objective` | Text | The security outcome or regulatory goal this control is designed to achieve. |
| **5** | `description` | Text | Precise operational instruction on how the control is implemented and enforced. |
| **6** | `frameworks` | Array of Strings | Active compliance frameworks satisfied by this control (e.g. `['ISO27001', 'SOC2', 'DPDP']`). |
| **7** | `requirementMappings`| Array of Strings | Statutory or standards clause citations (e.g. `['ISO:A.5.15', 'SOC2:CC6.1', 'DPDP:Rule3']`). |
| **8** | `applicability` | Enum (`IN_SCOPE`, `EXCLUDED`, `INHERITED`) | Scoping determination in the customer's Statement of Applicability (SoA). |
| **9** | `exclusionJustification`| Text (Nullable) | Mandatory justification if applicability is `EXCLUDED` (required by ISO 27001 Clause 6.1.3). |
| **10** | `owner` | User Reference (UUID) | Accountable individual with overall responsibility for control design and efficacy. |
| **11** | `implementer` | User Reference (UUID) | Operational team or individual responsible for day-to-day control execution. |
| **12** | `reviewer` | User Reference (UUID) | Independent supervisor or auditor validating control performance. |
| **13** | `frequency` | Enum (`CONTINUOUS`, `DAILY`, `WEEKLY`, `MONTHLY`, `QUARTERLY`, `ANNUAL`) | Scheduled operating interval for manual or semi-automated controls. |
| **14** | `evidenceRequirements` | Array of Object DTOs | Concrete specification of artifacts required to prove control execution (e.g. screenshot, log, config export). |
| **15** | `testProcedure` | Text | Step-by-step audit fieldwork procedure instructing testers how to evaluate the control. |
| **16** | `testFrequency` | Enum (`MONTHLY`, `QUARTERLY`, `SEMI_ANNUAL`, `ANNUAL`) | Mandatory interval at which empirical testing must be conducted. |
| **17** | `mitigatedRisks` | Array of Risk IDs | Specific risk registry items mitigated by this control (binds to Inherent/Residual scores). |
| **18** | `governingPolicies` | Array of Policy IDs | Authoritative policy and procedure documents establishing the mandate for this control. |
| **19** | `inScopeAssets` | Array of Asset IDs | Hardware, cloud resources, software, or databases subject to this control. |
| **20** | `inScopeProcesses` | Array of Process IDs | Business workflows (e.g. Customer Onboarding, Payroll, Deployment) governed by this control. |
| **21** | `associatedVendors` | Array of Vendor IDs | Third-party service providers or SaaS tools involved in control execution. |
| **22** | `boundEvidence` | Array of Evidence IDs | Active cryptographic evidence artifacts proving control execution. |
| **23** | `associatedFindings`| Array of Finding IDs | Open or historical audit non-conformities identified against this control. |
| **24** | `activeCAPAs` | Array of CAPA IDs | Corrective and Preventive Action plans currently remediating control deficiencies. |
| **25** | `activeExceptions` | Array of Exception IDs | Approved time-bound waivers and deviations currently in effect for this control. |
| **26** | `effectiveness` | Enum (`EFFECTIVE`, `PARTIALLY_EFFECTIVE`, `DEFICIENT`, `UNTESTED`) | Derived operating effectiveness rating determined from test results and evidence freshness. |
| **27** | `assuranceScore` | Number (0–100%) | Computed score from the 10-dimension Assurance Explanation Engine. |
| **28** | `lastTestedAt` | ISO 8601 Timestamp | Timestamp of the most recent empirical fieldwork test execution. |
| **29** | `nextTestDueAt` | ISO 8601 Timestamp | Calendar deadline for the next mandatory fieldwork test. |
| **30** | `changeHistory` | Array of Audit Event IDs | Immutable timeline of all design, assignment, effectiveness, and test modifications. |

---

### 3. Five-State Operational Effectiveness Lifecycle

```
  [ UNTESTED ]
       │
       ▼ (Fieldwork Executed: Sample Evaluated)
  [ TESTED ]
       ├───▶ (Evidence Valid & Test Passed) ──▶ [ EFFECTIVE ]
       │                                             │ (Telemetry Drift / Expired Evidence)
       │                                             ▼
       └───▶ (Test Failed / Finding Created) ─▶ [ DEFICIENT ]
                                                     │ (CAPA Implemented & Independent Retest Passes)
                                                     ▼
                                                [ EFFECTIVE ]
```

#### Deterministic Rules Governing Effectiveness:
1. **Rule of Empirical Grounding:** A control can NEVER achieve `EFFECTIVE` status based solely on document presence. If `lastTestedAt` is null or older than `testFrequency`, the control automatically drops to `UNTESTED`.
2. **Rule of Negative Gating:** If a control has an open `CRITICAL` or `HIGH` non-conformity finding, its effectiveness is locked to `DEFICIENT`, regardless of past test passes.
3. **Rule of Retest Verification:** Implementing a CAPA does not restore `EFFECTIVE` status. An independent retest must be executed and recorded; only a passing retest clears the deficiency.
4. **Rule of Evidence Freshness:** If all bound evidence artifacts exceed 90 days of age without renewal, the assurance score degrades to `PARTIALLY_EFFECTIVE` due to stale proof.

---

### 4. ISO 19011 Fieldwork Testing Methodology Integration

When an auditor or compliance manager tests a control within SKANDA, the **Control Testing Service** (`ControlTestingService.ts`) requires formal audit methodology parameters:
- **Testing Cadence:** Scheduled or Ad-Hoc inspection.
- **Population Size:** Total occurrences of the event within the audit period (e.g. 120 employee onboardings).
- **Sample Size:** Mathematically derived sample based on risk significance (e.g. 25 samples for 120 population).
- **Sampling Method:** `RANDOM`, `STRATIFIED`, `SYSTEMATIC`, or `100_PERCENT_EXHAUSTIVE`.
- **Testing Technique:** `INSPECTION`, `OBSERVATION`, `INQUIRY`, `REPERFORMANCE`, or `AUTOMATED_TELEMETRY`.
- **Sample Ledger:** Exact identifiers of the sampled records (e.g. Employee IDs `EMP-012`, `EMP-045`, `EMP-089`).
- **Defect Count:** Number of samples failing the control criteria.
- **Auditor Role & Sign-off:** Cryptographically signed record of the tester persona and completion timestamp.

---

### 5. Control 360 User Experience Specification

The **Control 360 Workspace Drawer** renders five specialized tabs providing a 360-degree view without navigating away from the current page:
1. **Overview & Lineage:** Control specification, owner, RACI, governing policies, upstream risks, and downstream processes.
2. **Evidence Vault:** Bound evidence files, SHA-256 digests, freshness indicators, and upload dropzones.
3. **Fieldwork & Test History:** Chronological log of past ISO 19011 audit tests, sample sizes, and tester opinions.
4. **Findings & CAPA:** Open non-conformities, 5-Whys root cause analyses, corrective milestones, and retest statuses.
5. **Assurance & "Show Me Why":** Interactive 10-dimension radar breakdown showing exact reasons for the current assurance rating.

---

### 6. Control Operating Model Conclusion

By elevating controls from flat documentation to connected, stateful, empirical enterprise objects, SKANDA provides organizations and auditors with **unshakeable operational assurance**. Every control tells a complete, auditable story from business risk to cryptographic proof.
