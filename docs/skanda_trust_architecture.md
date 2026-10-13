# SKANDA Customer Trust Architecture & Security Assurance Portal
## Public Trust Center Specification, Subprocessor Governance & Assurance Gating

**Document Reference:** `SKD-TRU-ARC-001`  
**Classification:** Customer-Facing Assurance / Enterprise Buyer Grade  
**Date:** October 8, 2026  
**Architect Personas:** Customer Trust / Security Assurance Architect, CISO, Privacy Architect, SOC 2 Consultant  

---

### Executive Trust Vision

In modern enterprise B2B procurement, **Customer Trust is the primary sales accelerator**. Enterprise security reviews frequently delay sales cycles by 3 to 6 months due to manual security questionnaires (SIG Lite, CAIQ, VSA).

SKANDA establishes a state-of-the-art **Customer Trust Center** (`trust.skanda.io`). It provides enterprise prospects, customers, and external auditors with transparent, verifiable, real-time proof of SKANDA's security posture, privacy governance, third-party subprocessor compliance, and business continuity readiness.

---

### 1. Trust Center Information Architecture

```
                                 [ trust.skanda.io ]
                                          │
       ┌──────────────────┬───────────────┴───────────────┬──────────────────┐
       ▼                  ▼                               ▼                  ▼
[ Public Overview ] [ Live Posture ]            [ Gated Documents ]  [ Continuous Health ]
- Security Charter  - Framework Badges          - SOC 2 Type II      - 99.99% Uptime
- Privacy Promise   - Real-Time CCM Controls    - ISO 27001 Cert     - Incident History
- Subprocessors     - Cryptographic Integrity   - Pentest Summary    - Maintenance Schedule
- Vulnerability VDP - Data Residency Map        - BCP/DR Test Log    - Status Page RSS
                                                       │
                                                (Click-Wrap NDA)
```

---

### 2. Trust Center Structural Modules

#### 2.1 Live Compliance & Certification Registry
Displays SKANDA's active framework alignments with verifiable scope and validity dates:
- **ISO/IEC 27001:2022 (ISMS):** Complete coverage across Clauses 4–10 and Annex A.5–A.8 controls.
- **SOC 2 Type II (Security, Availability, Confidentiality):** Continuous automated control verification against Trust Services Criteria.
- **ISO/IEC 42001:2023 (AIMS):** Responsible AI management system, source grounding, and risk minimization.
- **India DPDP Act 2023 / Rules 2026:** Comprehensive personal data governance, verifiable consent records, and multilingual notices.
- **Singapore MAS TRM Guidelines:** Notice 644/655 cyber hygiene and incident response readiness.

#### 2.2 Authorized Subprocessor Directory (DPDP & GDPR Compliant)
In accordance with ISO 27001 Control A.5.19 and DPDP Section 8/9, SKANDA maintains a public, real-time registry of all third-party data processors:

| Subprocessor Legal Entity | Headquarters & Processing Region | Service Provided | Data Processed | Executed DPA & Safeguards | Security Certifications |
|---|---|---|---|---|---|
| **Amazon Web Services (AWS) Inc.** | Singapore (ap-southeast-1) / US | Cloud Infrastructure & PostgreSQL Hosting | Customer Encrypted Data at Rest & in Transit | Standard Contractual Clauses (SCC) + DPA with AWS APN | ISO 27001, SOC 2 Type II, PCI DSS Level 1 |
| **Cloudflare, Inc.** | Global Edge Network | CDN, DDoS Protection, WAF, Edge TLS | Network Traffic Metadata & Ephemeral IP Packets | Executed Global Enterprise DPA | ISO 27001, SOC 2 Type II |
| **Twilio India Communication Services** | India / US | SMS & Voice Multi-Factor Authentication | User Phone Numbers (Hashed at rest) | Executed Indian DPDP Addendum | ISO 27001, SOC 2 Type II |
| **Google Cloud (Gemini GenAI)** | Singapore / US | Secure Enterprise AI Processing (No Training on Customer Data) | Prompt payloads (Ephemerally processed; zero model training) | Google Cloud Enterprise Master Agreement + DPA | ISO 27001, SOC 2 Type II, ISO 42001 |

#### 2.3 Automated Click-Wrap NDA & Document Access Gating
Sensitive audit reports must never be exposed publicly. SKANDA implements an automated, self-service request pipeline:
1. **Public Request Form:** Enterprise prospect provides corporate work email, company name, and intended reviewer role.
2. **Instant Verification:** Disposable/personal email domains (`gmail.com`, `yahoo.com`, `hotmail.com`) are rejected.
3. **Click-Wrap NDA Signature:** Dynamic mutual non-disclosure agreement displayed with cryptographic timestamping.
4. **Time-Bound Watermarked Download:** User receives a 24-hour access link. All downloaded PDFs are dynamically watermarked with the prospect's email, IP address, and access timestamp to prevent unauthorized dissemination.

#### 2.4 Vulnerability Disclosure Program (VDP) & Bug Bounty
- **Commitment:** Responsible disclosure guidelines providing safe harbor for ethical security researchers.
- **Scope:** `*.skanda.io` and API endpoints. Out-of-scope: Denial of service, physical attacks, social engineering.
- **SLA:** Initial triage response within 24 hours; severity assessment within 72 hours; fix deployment within SLA (Critical < 7 days, High < 14 days).
- **Security Contact:** `security@skanda.io` with PGP key published at `trust.skanda.io/pgp.key`.

#### 2.5 Real-Time Availability & Incident History
- Embedded status indicator reflecting the last 90 days of uptime across API, Web Dashboard, AI Copilot, and Telemetry Pipelines.
- Detailed post-mortem archives for any unscheduled service interruption, outlining root cause, impact duration, and preventive CAPA remediations.

---

### 3. Data Protection, Residency & Sovereign Assurances

SKANDA offers enterprise customers **Regional Data Residency Guarantees**:
- **Singapore / ASEAN Sovereign Zone:** Primary storage in AWS `ap-southeast-1` (Singapore); all customer data, backups, and audit trails remain strictly within ASEAN borders.
- **India Sovereign Zone:** Primary storage in AWS `ap-south-1` (Mumbai) and `ap-south-2` (Hyderabad); strictly complies with DPDP local processing mandates.
- **Europe (EU) Sovereign Zone:** Primary storage in AWS `eu-central-1` (Frankfurt); adheres strictly to GDPR Chapter V data transfer requirements.

```
+--------------------------------------------------------------------------------------------------+
|                            SKANDA ZERO-DATA-TRAINING AI GUARANTEE                                |
+--------------------------------------------------------------------------------------------------+
| Customer data, governance policies, risk registers, and evidence artifacts ingested into SKANDA   |
| are NEVER used to train, fine-tune, or improve foundation AI models (Gemini or third-party LLMs). |
| All GenAI processing occurs under dedicated enterprise API terms with zero data retention.       |
+--------------------------------------------------------------------------------------------------+
```

---

### 4. Customer Trust Architecture Conclusion

SKANDA's Customer Trust Center transforms compliance from a defensive hurdle into a powerful, transparent competitive asset. By pairing verifiable real-time posture displays with automated click-wrap NDA gating for third-party audit reports, SKANDA accelerates enterprise security sign-off and builds unassailable market trust.
