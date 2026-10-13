# User Access Provisioning and Modification Procedure

*Operational control procedure with roles, gates, evidence, exceptions and verification*

> **[!WARNING] ILLUSTRATIVE MODEL DOCUMENT — MUST BE TAILORED AND APPROVED BEFORE USE**

### Document Control Field

| Document Control Field | Model Value |
|---|---|
| **Document ID** | ISMS-PROC-IAM-001 |
| **Version / Status** | 1.1 — 1.1 — Model sample (quality revision); not approved |
| **Document Owner** | Role to be formally assigned |
| **Approver** | Authorized management approver to be assigned |
| **Effective Date** | Not effective until formally approved |
| **Classification** | INTERNAL_ILLUSTRATIVE |
| **Review Trigger** | Scheduled review and material business, technology, risk or regulatory change |

> *This document demonstrates the depth, structure and operational specificity expected of an enterprise management-system document. It is not a representation that a real organization has implemented these requirements.*

### Revision History

| Version | Date | Summary of Change | Prepared By | Approval Status |
|---|---|---|---|---|
| 1.0 | Not recorded | Initial illustrative model sample. | SKANDA Documentation | Not approved — model sample |
| 1.1 | 2026-10-11 | Quality revision: replaced duplicated service-level section with service-level governance requirements; corrected RACI so each activity has one Accountable role; added approval record, revision history, contents and terms and definitions (new Section 3; later sections renumbered); moved procedure table to a landscape page; corrected metadata, header, "Page X of Y" numbering and table pagination. | SKANDA Documentation | Not approved — model sample |

## 1. Purpose

Define a controlled, traceable process to request, authorize, provision, verify and record access to in-scope systems and information. This procedure is designed to prevent unauthorized access and to ensure granted entitlements correspond to approved business need.

## 2. Scope

Applies to new user access and changes to existing access for systems within the organization’s defined scope. Privileged access, service accounts, emergency access, machine identities, external users and systems with specialized access workflows may require additional controls or procedures. Confirm the applicable systems and user populations before approval.

- **In-Scope Locations**: [In-scope operational locations]
- **In-Scope Systems & Services**: [Approved target systems and identity providers]

**Documented Exclusions:**
- *[Excluded access systems/categories if separately governed]*: [Documented justification and compensating controls]

## 3. Terms and Definitions

| Term | Working Definition (Model) |
|---|---|
| **Entitlement** | A specific permission, role, group membership or access right granted to an identity on a system. |
| **Provisioning** | Creating, changing or assigning an account or entitlement on a target system. |
| **Privileged access** | Access permitting administrative actions, security configuration changes, control bypass or broad access to sensitive information, as defined in the organization’s privileged access standard. |
| **Segregation of duties** | Separation of conflicting responsibilities so that no single individual can initiate, authorize and complete a sensitive action without independent involvement. |
| **Independent verification** | A check of resulting access against the approved request by a person or control independent of whoever performed the change. |
| **Emergency access** | Time-limited access granted under a separately approved emergency process when the standard workflow cannot be followed. |
| **Request record** | The uniquely identified record linking request, approvals, execution, verification and closure evidence. |

## 4. Process Controls and Prerequisites

- An approved access request channel and record identifier are available.
- The target system, entitlement catalogue and accountable system/data owner are identified.
- Identity proofing and authentication requirements are defined for the relevant user category.
- The approval matrix and segregation-of-duties rules are current and accessible.
- Provisioning is restricted to authorized operators or controlled automation.
- Required evidence storage, retention and access protections are defined.

## 5. Roles and Segregation of Duties

| Role | Permitted Responsibility | Control Boundary |
|---|---|---|
| **Requester / line manager** | Initiates request and documents business need. | Must not approve their own request unless a documented, authorized exception explicitly permits it. |
| **System / data owner** | Confirms role suitability and authorizes access within delegated authority. | Must not approve beyond delegated scope; conflicts require escalation. |
| **Security / IAM reviewer** | Checks privileged access, sensitive entitlements, role conflicts and policy exceptions as required. | Review is not a substitute for system-owner approval. |
| **Provisioning operator / automation** | Executes the approved entitlement change. | Must verify required approvals and must not expand access beyond the authorization. |
| **Independent verifier** | Checks resulting entitlement against approval where required by risk or design. | Should be independent of execution for high-risk access where practicable. |
| **Process owner** | Maintains procedure, monitors metrics and coordinates remediation. | Does not retrospectively legitimize unauthorized access without formal handling. |

## 6. Inputs and Required Records

| Input / Record | Required Content |
|---|---|
| **Access request** | Unique ID; requester and intended user; identity reference; system; requested role/entitlement; business justification; requested start/end date where relevant. |
| **Authorization matrix** | Required approvers by system, data sensitivity, role, user type and privilege level. |
| **Entitlement definition** | Role permissions, risk classification, prerequisite training or conditions where applicable. |
| **Conflict / restriction check** | Segregation-of-duties results, privileged access rules and exception requirements. |
| **Execution and verification record** | Approvals, operator or automation identity, timestamps, granted entitlement, verification result and any remediation. |

## 7. Procedure Steps & Operational Gates

| Step / Gate | Required Action | Responsible Role | Evidence | Exit Criteria | Failure / Exception |
|---|---|---|---|---|---|
| **1. Register request** | Requester submits through the approved workflow and identifies the intended user, target system, requested entitlement, business justification and required timing. | Requester / line manager | Request ID; identity reference; business justification; requested entitlement. | Request is uniquely recorded and traceable. Missing mandatory fields cause return for completion. | No access is granted. |
| **2. Validate identity and completeness** | Coordinator or workflow validates identity status, target system, entitlement validity, business rationale and required information. | IAM coordinator or approved workflow | Validation result; identity status; target system and entitlement reference. | Request meets documented entry criteria. Invalid or incomplete requests are returned or rejected. | No access is granted. |
| **3. Confirm business need** | Line manager and/or system owner confirms the entitlement is required for assigned duties and is proportionate to need. | Line manager / system owner | Business justification and approval decision. | Decision is recorded by an authorized identity and is within delegated authority. | Reject or return if need is not established. |
| **4. Obtain required approvals** | Route to all approvers required by the current approval matrix, including data owner, security reviewer or other approvers where applicable. | Workflow / designated coordinator | Approver identity, decision, timestamp, conditions and comments where appropriate. | All mandatory approvals are positive and precede provisioning. Rejection ends the normal workflow. | Do not provision while approvals are missing or rejected. |
| **5. Assess conflicts and elevated risk** | Check segregation of duties, privilege level, sensitive data access, external user status, and applicable restrictions. Obtain additional approval or documented exception where required. | IAM / security reviewer / system owner | Conflict check, risk assessment, exception ID and approval if applicable. | No unresolved prohibited conflict; any permitted exception has authorized approval, safeguards and review/expiry date. | Hold and escalate unresolved conflict. |
| **6. Provision approved entitlement** | Authorized operator or controlled automation applies only the entitlement, scope and duration approved. Use the approved administrative channel and preserve system audit records. | Provisioning operator / controlled automation | Execution event, actor, system, entitlement, timestamp, result and correlation to request ID. | Actual change matches authorization; failure is recorded and not represented as success. | Do not substitute broader access or use unauthorized workaround. |
| **7. Independently verify result** | Compare actual assigned permissions with the approved request using system logs, access reports or other reliable evidence. Use independent verification for high-risk access where required. | Verifier or independent control | Expected versus actual entitlement, verification method, verifier and timestamp. | Exact match is confirmed, or discrepancy is recorded and corrected. | Keep request open; remove or correct unauthorized excess access and escalate as required. |
| **8. Notify and close** | Notify relevant parties and close the request only after approvals, execution and required verification are complete. | Workflow owner / IAM coordinator | Closure status, notifications reference, linked execution and verification evidence. | Required fields and evidence are present; final state is accurate. | Do not close with unresolved discrepancy or missing mandatory evidence. |
| **9. Retain and monitor** | Retain the request and associated records under the approved retention schedule. Include the event in monitoring or periodic access review where required. | Process owner / records owner | Record links, retention class, review flags and monitoring outcome. | Records remain retrievable and protected; relevant access reviews are scheduled. | Escalate missing records or suspected record alteration. |

## 8. Decision Rules and Exception Handling

| Scenario | Required Handling | Required Evidence |
|---|---|---|
| **Incomplete or invalid request** | Return for correction or reject under workflow rules. Do not provision. | Reason, status, requester notification and timestamps. |
| **Approver rejects request** | End normal processing; do not provision. Re-submission requires a new or formally reopened request. | Decision, approver identity and reason where recorded. |
| **Approval absent or unauthorized** | Hold request and route to the correct authority; never infer approval from silence. | Approval matrix version and workflow history. |
| **Segregation-of-duties conflict** | Apply conflict-resolution process. If policy permits an exception, document risk, compensating controls, authorized approval, expiry/review and monitoring. | Conflict result and linked exception record. |
| **Privileged or sensitive access** | Apply enhanced approval, authentication, logging, time limitation and verification according to approved standard. | Privilege classification, approvals, conditions and verification. |
| **Provisioning fails** | Record failure, investigate, retry only through authorized controls, and ensure partial access is assessed. | Failure log, incident/change reference if applicable, final outcome. |
| **Unexpected or excessive access appears** | Contain or remove unauthorized access promptly under approved process; preserve evidence and assess incident escalation. | Actual entitlement, corrective action, escalation and verification. |
| **Emergency access needed** | Use separately approved emergency access process; retrospective review does not replace initial authorization requirements unless explicitly defined by that process. | Emergency justification, authorization, start/end time, monitoring and retrospective review. |

## 9. Service Levels and Operational Targets

### Governance Elements

| Governance Element | Required Definition |
|---|---|
| **Measured interval** | For each request category, define the start event, stop event and any permitted pause conditions (for example, awaiting requester information) so performance is calculated consistently. |
| **Target and thresholds** | Define the approved target, an at-risk threshold that triggers proactive follow-up, and the breach point. |
| **Ownership and data source** | Assign an accountable owner for each target and identify the system of record used to calculate performance. |
| **Control precedence** | Service-level targets never override authorization, segregation-of-duties or verification gates. Time pressure is not grounds for provisioning without required approval. |
| **Ageing and breach escalation** | Define the escalation route, recipients and timing for requests at risk or in breach, including stalled approvals and provisioning awaiting verification. |
| **Urgent business need** | Urgent requests follow the standard gates with prioritization. Where the gates cannot be met, the separately approved emergency access process applies. |
| **Third-party delivery** | Where a third party performs provisioning, align targets with verified contractual terms rather than assumed service commitments. |
| **Reporting and review** | Report performance at the approved frequency to the process owner and the relevant governance forum; review targets at each document review or upon material change. |

### Targets by Request Category

| Request Category | Approved Target | Measured Interval | Escalation Route |
|---|---|---|---|
| **Standard user access** | To be defined | To be defined | To be defined |
| **Access modification or role change** | To be defined | To be defined | To be defined |
| **Privileged or sensitive access** | To be defined | To be defined | To be defined |
| **External or third-party user access** | To be defined | To be defined | To be defined |

## 10. Evidence, Retention and Access Protection

| Evidence Item | Minimum Fields | Control Purpose |
|---|---|---|
| **Request record** | Request ID, user, system, entitlement, business need, dates, status | Traceability from business need to action. |
| **Approval trail** | Approver identity, role, decision, timestamp, conditions | Evidence of authorization before provisioning. |
| **Provisioning event** | System, actual entitlement, actor, timestamp, result | Evidence of what changed and who/what performed it. |
| **Verification record** | Expected/actual comparison, verifier, method, result | Evidence the result matched the approved request. |
| **Exception record** | Risk, rationale, controls, approver, expiry/review, closure | Controlled handling of deviations. |
| **Notification / closure** | Notification reference, completion status, links to evidence | Evidence of workflow completion. |

## Appendix B — Operational RACI (Illustrative)

| Activity | Requester / Mgr | System Owner | IAM / Operator | Security Reviewer | Verifier |
|---|---|---|---|---|---|
| **Submit request** | A/R | I | I | I | I |
| **Confirm business need** | R | A/R | C | C | I |
| **Approve entitlement** | I | A/R | I | C | I |
| **Provision access** | I | I | A/R | C | I |
| **Verify result** | I | C | C | C | A/R |
| **Close and retain record** | I | C | A/R | I | C |

*R = Responsible; A = Accountable; C = Consulted; I = Informed. Each activity has exactly one Accountable role.*

## Appendix C — Pre-Publication Tailoring Checklist

- [ ] **CHK-IAM-01**: Confirm in-scope systems, user populations and entitlement types. 
- [ ] **CHK-IAM-02**: Map role titles to the actual organization chart and approval matrix. 
- [ ] **CHK-IAM-03**: Define identity proofing, privileged access and segregation-of-duties rules. 
- [ ] **CHK-IAM-04**: Identify actual request, identity, logging, and evidence systems. 
- [ ] **CHK-IAM-05**: Approve service-level targets and retention requirements. 
- [ ] **CHK-IAM-06**: Define emergency access and third-party access variations. 
- [ ] **CHK-IAM-07**: Test end-to-end with representative scenarios and verify evidence. 
- [ ] **CHK-IAM-08**: Obtain process owner, security review and authorized approval. 

