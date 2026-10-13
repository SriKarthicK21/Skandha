# SKANDA ISO/IEC 27001:2022 Platform Assurance Matrix
## Comprehensive Evaluation Against ISO 27001:2022 Management System & Annex A Themes

**Document Reference:** `SKD-ISO-MAT-001`  
**Classification:** Enterprise Auditor Grade  
**Standard Reference:** ISO/IEC 27001:2022 (Clauses 4.1–10.2 & Annex A.5–A.8)  
**Lead Auditor Personas:** Senior ISO/IEC 27001:2022 Lead Auditor, Senior ISMS Implementer, Enterprise GRC Architect  
**Regulatory Boundary:**  
> **CRITICAL COMPLIANCE NOTICE:** SKANDA is an Enterprise SaaS GRC and Assurance Operating System. The platform provides software mechanisms, workflows, templates, evidence tracking, and assurance automation to support a customer's Information Security Management System (ISMS). Utilizing SKANDA does not automatically confer ISO/IEC 27001:2022 accredited certification; accredited certification requires formal independent third-party audit by an accredited certification body (e.g., BSI, TÜV, DNV).

---

### Part I: ISO/IEC 27001:2022 Management System Clauses (4.0 – 10.0)

| ISO 27001 Clause | Requirement Summary | SKANDA Platform Capability | Implementation Architecture | Evidence & Testing Lineage | Platform Assurance State | Remaining Enterprise Gap | Recommendation |
|---|---|---|---|---|---|---|---|
| **Clause 4.1** Context of the Organization | Determine external & internal issues relevant to purpose & security | **Organizational Discovery Studio** (`organizationalDiscoveryService.ts`) | Captures business model, operating units, external market context, and regulatory landscape. | Discovery Questionnaire JSON, SME sign-off timestamps, Context Register. | **ASSURED** (Truth-Gated) | None | Complete contextual survey during onboarding Phase 1. |
| **Clause 4.2** Interested Parties | Determine interested parties and their security requirements | **Stakeholder & Legal Obligations Hub** (`Phase2ScopeSoA.tsx`) | Records customer, regulator, partner, and vendor expectations linked to legal mandates. | Interested Parties Matrix, legal obligation crosswalk records. | **ASSURED** | None | Tie annual stakeholder review to Management Review cadence. |
| **Clause 4.3** Scope of the ISMS | Determine ISMS boundaries & applicability | **Scoping & Exclusion Engine** (`Phase2ScopeSoA.tsx`, `OrgScopeModule.tsx`) | Formally defines physical, organizational, and technological boundaries; enforces justifications for exclusions. | Signed ISMS Scope Statement document, department headcount & asset boundaries. | **ASSURED** | None | Lock baseline scope in PostgreSQL before certification audit. |
| **Clause 5.1** Leadership & Commitment | Top management leadership, resource allocation, and policy integration | **Executive Command Center & BRC Deck** (`CommandCenterDashboard.tsx`, `ExecutiveStakeholderView.tsx`) | Direct executive KPI dashboards, board reporting pack generation, resource justification tracking. | Board Risk Committee Deck exports, executive sign-off audit logs. | **ASSURED** | None | Retain executive meeting minutes alongside presentation exports. |
| **Clause 5.2** Information Security Policy | Establish, approve, and communicate information security policies | **Policy & Document Governance Center** (`policyGovernanceService.ts`, `ContextualizedPolicyStudio.tsx`) | Full policy lifecycle (Draft → SME Review → Legal Review → Executive Sign-off → Staff Acknowledgment). | Cryptographically signed policy versions, SHA-256 hash, acknowledgment ledger. | **ASSURED** | None | Enforce mandatory annual re-attestation cycles for all policies. |
| **Clause 5.3** Roles, Responsibilities & Authorities | Assign security roles and organizational RACI | **RACI Matrix & Organization Hub** (`organizationalDiscoveryService.ts`, `SettingsUsersModule.tsx`) | Explicit Responsible, Accountable, Consulted, Informed mapping for all security processes and controls. | Department RACI tables, role assignment event bus logs, RBAC assignments. | **ASSURED** | None | Integrate with HRIS/SCIM for automated Joiner/Mover/Leaver sync. |
| **Clause 6.1.2** Information Security Risk Assessment | Establish risk criteria and identify/analyze security risks | **Configurable Risk Engine** (`ConfigurableRiskEngine.ts`, `RiskWorkspace.tsx`) | 5x5 Inherent Risk scoring, risk velocity, asset-threat-vulnerability linkage. | Risk Register, threat taxonomy records, likelihood/impact scoring logs. | **ASSURED** | None | Re-evaluate residual risks immediately following control drift alerts. |
| **Clause 6.1.3** Information Security Risk Treatment | Define treatment plans and formulate Statement of Applicability | **Risk Treatment Simulator & SoA Engine** (`StatementOfApplicabilityModule.tsx`) | Modulates treatments (Mitigate, Accept, Transfer, Avoid); generates canonical 93-control SoA with inclusion/exclusion justifications. | Treatment plan milestones, signed SoA baseline with cryptographic digest. | **ASSURED** | None | Maintain formal Risk Acceptance justification workflows for high risks. |
| **Clause 6.2** Security Objectives & Planning | Establish measurable security goals and action plans | **Milestones & Implementation Planner** (`GuidedImplementationEngine.tsx`) | Goal tracking with owners, target completion dates, resource requirements, and status indicators. | Objective register, progress tracking telemetry, next-best-action alerts. | **ASSURED** | None | Review objective progress during quarterly CISO governance meetings. |
| **Clause 7.2** Competence | Ensure personnel competence and maintain training evidence | **Staff Training & Certification Registry** (`StandardsAcademyModule.tsx`) | Security training tracking, role-based competency requirements, certification expiry tracking. | Training attendance manifests, LMS completion certificates, assessment scores. | **PARTIALLY WIRED** | Requires direct LMS webhook sync | Implement SCORM / Workday learning connector. |
| **Clause 7.5** Documented Information | Control creation, update, approval, and versioning of documents | **Authoritative Document Engine & WORM Ledger** (`CryptographicWormLedger.ts`) | Immutable version history, metadata headers, approval workflows, retention enforcement. | SHA-256 addressable documents, tamper-detection checks, revision history diffs. | **ASSURED** | None | Ensure WORM storage is replicated across multi-region object storage. |
| **Clause 8.1** Operational Planning & Control | Implement plans to meet information security requirements | **Continuous Compliance Monitoring** (`continuousComplianceService.ts`, `TelemetryIngestionPipeline.ts`) | Real-time telemetry ingestion, automated control verification, scheduled operational tasks. | Live sensor telemetry, execution logs, drift alert records. | **ASSURED** | None | Expand automated connectors for AWS, Azure, GCP, and GitHub. |
| **Clause 9.1** Monitoring, Measurement, Analysis | Evaluate security performance and control effectiveness | **Assurance Explanation Engine** (`AssuranceExplanationService.ts`, `ControlTestingService.ts`) | 10-dimension deterministic evaluation of control operation, test fieldwork, and drift metrics. | Test fieldwork records (sample size, method, results), assurance scorecards. | **ASSURED** | None | Establish automated monthly assurance report dispatch to CISO. |
| **Clause 9.2** Internal Audit | Conduct planned internal audits at planned intervals | **Enterprise Audit Operating System** (`EnterpriseAuditService.ts`, `InternalAuditModule.tsx`) | Audit program management, auditor assignment, sampling rationale, fieldwork testing, finding generation. | Audit charters, sampling records (ISO 19011), preliminary and final audit reports. | **ASSURED** | None | Ensure independent auditor assignment prevents self-auditing. |
| **Clause 9.3** Management Review | Top management review of ISMS suitability and effectiveness | **Management Review Workspace** (`ManagementReviewModule.tsx`) | Structured 12-point review agenda covering audit results, risk changes, CAPA status, and resource needs. | Management Review minutes, attendee list, approved action items. | **ASSURED** | None | Export certified executive briefing package prior to certification audits. |
| **Clause 10.1** Continual Improvement | Continually improve ISMS suitability and effectiveness | **Continuous Improvement Hub** (`ISOMASImprovementHubModule.tsx`) | Tracks lessons learned, maturity progression, process enhancements, and automated suggestions. | Continual improvement register, maturity delta sparklines. | **ASSURED** | None | Tie improvement items to annual budget planning. |
| **Clause 10.2** Nonconformity & Corrective Action | React to nonconformities, evaluate root causes, implement CAPA | **CAPA & 5-Whys Remediation Desk** (`AuditRemediationEngine.ts`) | Structured 5-Whys root cause analysis, preventive action formulation, independent retest verification. | CAPA records, closure evidence artifacts, retest fieldwork verification logs. | **ASSURED** | None | Block finding closure until independent retest passes. |

---

### Part II: ISO/IEC 27001:2022 Annex A Control Themes Assessment

#### Theme A.5: Organizational Controls (37 Controls)

| Control ID & Title | Objective & Specification | SKANDA Platform Automation & Enforcement | Evidence & Verification Mechanism | Assurance Rating | Customer Responsibility |
|---|---|---|---|---|---|
| **A.5.1 Policies for Information Security** | Security policies defined, approved, published, and communicated. | Centralized Policy Studio with versioning, executive sign-off, and staff acknowledgment tracking. | Cryptographically signed policy records, acknowledgment ledger, review calendar. | **ASSURED** | Customer must draft, approve, and enforce internal policies. |
| **A.5.8 Information Security in Project Management** | Security integrated into project lifecycle. | Project security milestone gates, risk assessment checks during project initiation. | Project security checklist, risk review minutes. | **PARTIALLY WIRED** | Project managers must submit gating requests. |
| **A.5.15 Access Control** | Rules for access control established based on business requirements. | Role-Based (RBAC) and Attribute-Based (ABAC) access controls; tenant isolation enforcement. | User permission matrix, access logs, periodic access review attestations. | **ASSURED** | Customer admins must assign least-privilege roles. |
| **A.5.19 Information Security in Supplier Relationships** | Requirements for mitigating risks associated with suppliers. | Vendor Risk Management (TPRM) hub with vendor categorization, DPA tracking, security questionnaire scoring. | Executed DPAs, supplier risk assessments, third-party SOC 2/ISO reports. | **ASSURED** | Vendor managers must conduct annual vendor reviews. |
| **A.5.24 Information Security Incident Management Planning** | Preparedness to respond to security incidents. | Incident triage center with severity scoring, regulatory notice timelines (e.g. CERT-In / MAS / DPDP), SLA tracking. | Incident response plans, test run logs, communication checklists. | **ASSURED** | Security operations team must manage actual incidents. |
| **A.5.31 Legal, Statutory, Regulatory & Contractual Requirements** | Identification of legal, statutory, regulatory, and contractual requirements. | Regulatory Change Intelligence engine mapping global authorities, circulars, and statutes to canonical controls. | Regulatory inventory, requirement-to-control crosswalk, compliance gap analyses. | **ASSURED** | Legal counsel must confirm applicability of regulations. |
| **A.5.34 Privacy & Protection of PII** | Compliance with statutory privacy requirements (DPDP, GDPR). | Canonical Privacy Graph connecting personal data elements, purposes, notices, consent, RoPA, retention, and deletion. | Consent logs, RoPA records, DSR execution trails, published privacy notices. | **ASSURED** | DPO must approve lawful basis and notice translations. |

#### Theme A.6: People Controls (8 Controls)

| Control ID & Title | Objective & Specification | SKANDA Platform Automation & Enforcement | Evidence & Verification Mechanism | Assurance Rating | Customer Responsibility |
|---|---|---|---|---|---|
| **A.6.1 Screening** | Background verification checks conducted in accordance with laws and ethics. | Candidate onboarding screening verification checklist with document retention rules. | Verification sign-off records, screening logs (without storing sensitive biometric records). | **ASSURED** | HR department must execute background checks. |
| **A.6.2 Terms and Conditions of Employment** | Employment agreements state security responsibilities. | Employment contract security rider tracking, confidentiality agreement acknowledgment tracking. | Signed NDA records, employment policy acknowledgment timestamps. | **ASSURED** | Legal/HR must execute employment agreements. |
| **A.6.3 Information Security Awareness & Training** | Appropriate training and regular updates on security policies. | Standards Academy module with interactive awareness modules, compliance quizzes, and tracking. | Quiz completion certificates, training attendance logs, overdue reminders. | **ASSURED** | Employees must complete annual mandatory training. |
| **A.6.5 Responsibilities After Termination** | Security obligations enforced after termination of employment. | Automated Joiner/Mover/Leaver (JML) offboarding task checklist with access revocation confirmation. | Offboarding sign-off records, asset return receipts, access termination timestamps. | **ASSURED** | Line managers must verify physical and logical return. |

#### Theme A.7: Physical Controls (14 Controls)

| Control ID & Title | Objective & Specification | SKANDA Platform Automation & Enforcement | Evidence & Verification Mechanism | Assurance Rating | Customer Responsibility |
|---|---|---|---|---|---|
| **A.7.1 Physical Security Perimeters** | Security perimeters defined and used to protect sensitive areas. | Facility and data center security attribute tracking; co-location vendor SOC 2 physical control review. | Facility inspection reports, badge access logs, third-party data center SOC 2 reports. | **ASSURED** (Cloud-SaaS Model) | Facilities team must maintain physical office controls; AWS/Azure manages data center perimeters. |
| **A.7.4 Physical Security Monitoring** | Premises monitored for unauthorized physical access. | Surveillance review checklist, security guard contract tracking, CCTV log verification. | Physical inspection logs, visitor badges, camera maintenance records. | **ASSURED** | Office administrators must conduct quarterly surveillance reviews. |
| **A.7.10 Storage Media** | Storage media managed through lifecycle. | Media sanitization and disposal tracking with cryptographic wipe verification. | Certificates of destruction, media disposal chain of custody receipts. | **ASSURED** | IT asset managers must physically destroy decommissioned media. |

#### Theme A.8: Technological Controls (34 Controls)

| Control ID & Title | Objective & Specification | SKANDA Platform Automation & Enforcement | Evidence & Verification Mechanism | Assurance Rating | Customer Responsibility |
|---|---|---|---|---|---|
| **A.8.1 User Endpoint Devices** | Information protected on user endpoint devices. | Endpoint compliance telemetry ingestion (MDM status, disk encryption, EDR agent presence). | Telemetry sensor reports, MDM enrollment logs, encryption verification digests. | **ASSURED** | IT admins must enforce Intune / Jamf MDM policies. |
| **A.8.2 Privileged Access Rights** | Allocation and use of privileged access restricted and controlled. | Privileged role segregation, break-glass workflow tracking, session auditing. | Privileged access review logs, MFA enforcement records, temporary elevation tickets. | **ASSURED** | Systems engineering must review admin credentials. |
| **A.8.8 Management of Technical Vulnerabilities** | Vulnerability exposure prevented, evaluated, and remediated. | Vulnerability scanning ingestion (SAST/DAST/SCA), CVE tracking, remediation SLA monitoring. | Vulnerability scan outputs (SARIF/JSON), patch verification logs, exception waivers. | **ASSURED** | DevSecOps must remediate high/critical CVEs within SLA. |
| **A.8.12 Data Leakage Prevention** | DLP measures applied to systems, networks, and devices. | Data classification labeling, DLP policy monitoring, sensitive file export logging. | Data inventory classification logs, export audit logs, DLP alert feeds. | **ASSURED** | Security team must define DLP blocking rules. |
| **A.8.15 Logging** | Logs recorded, protected, and analyzed. | Immutable Domain Event Bus with SHA-256 non-repudiation hashes; security audit event generation. | System event logs, SIEM export manifests, hash verification check records. | **ASSURED** | Cloud ops must forward logs to centralized SIEM. |
| **A.8.24 Use of Cryptography** | Cryptographic controls applied to protect information. | Strict TLS 1.3 in transit; AES-256 at rest; post-quantum crypto migration tracking ledger. | SSL/TLS configuration reports, KMS key rotation logs, cryptographic manifests. | **ASSURED** | Infrastructure team must rotate KMS keys annually. |
| **A.8.32 Change Management** | Changes to information processing facilities controlled. | Change advisory board (CAB) workflow, emergency change tracking, production deployment gating. | Pull request approvals, CI/CD deployment logs, change approval tickets. | **ASSURED** | Engineering leads must approve production releases. |

---

### Part III: Implementation Responsibility Separation Model

```
+---------------------------------------------------------------------------------------------------+
|                         RESPONSIBILITY SEPARATION MATRIX (SHARED MODEL)                          |
+---------------------------------------------------------------------------------------------------+
| Responsibility Level  | Scope & Domain                                  | Execution Entity        |
+-----------------------+-------------------------------------------------+-------------------------+
| PLATFORM AUTOMATION   | Workflow gating, cryptographic WORM evidence,   | SKANDA Software Engine  |
|                       | deterministic assurance, drift calculation      |                         |
+-----------------------+-------------------------------------------------+-------------------------+
| CUSTOMER MANAGEMENT   | Policy approvals, risk appetite decisions,      | Customer CISO / ISMS    |
|                       | employee screening, physical office controls    | Steering Committee      |
+-----------------------+-------------------------------------------------+-------------------------+
| EXTERNAL ASSURANCE    | Independent assessment of compliance, sampling, | Accredited Certification|
|                       | certification decision & certificate issuance   | Body (e.g. BSI, TÜV)    |
+-----------------------+-------------------------------------------------+-------------------------+
```

---

### Part IV: ISO 27001 Assurance Conclusion

SKANDA provides comprehensive technical and operational tooling supporting all 7 Management System clauses and all 93 Annex A controls. By anchoring every control to verifiable evidence, ISO 19011 test fieldwork, and closed-loop CAPA, SKANDA transforms ISO 27001 from a stressful annual paper audit into a continuous, real-time operating system.
