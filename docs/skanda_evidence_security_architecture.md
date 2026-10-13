# SKANDA Evidence Security & WORM Ledger Architecture
**Document ID:** SKD-EVI-WORM-2026-V1  
**Classification:** Enterprise Cryptographic Architecture  
**Compliance Standards:** ISO/IEC 27001:2022 A.8.15 (Logging), A.8.24 (Cryptography), A.8.7 (Protection against malware), SOC 2 CC6.8  

---

## 1. Zero-Trust Evidence Ingestion Pipeline

To guarantee that compliance evidence cannot be tampered with or used as an attack vector, every uploaded artifact passes through the 9-stage pipeline implemented in `SecureEvidencePipelineService`:

```
[ Inbound Artifact Upload ]
            |
            v
1. Authentication & Session Validation (Reject unauthenticated tokens)
            |
            v
2. Authorization & Tenant Scoping (Assert tenant ownership & control binding)
            |
            v
3. File Size Validation (Hard 50 MB payload ceiling)
            |
            v
4. Extension Whitelisting (Reject executable/script extensions: .exe, .sh, .bat, .dll, .js, etc.)
            |
            v
5. Magic-Number MIME Sniffing (Validate binary header matches claimed MIME type: PDF %PDF-, PNG \x89PNG, ZIP/Office PK\x03\x04)
            |
            v
6. Streaming Antivirus & Malware Scanning (Detect malicious patterns & EICAR test signatures -> Quarantine)
            |
            v
7. Cryptographic SHA-256 Digest Calculation
            |
            v
8. Write-Once-Read-Many (WORM) Cryptographic Ledger Registration (RFC 6962 Merkle tree block sealing)
            |
            v
9. Immutable Audit Event Emission (Recorded in EnterpriseAuditService)
```

---

## 2. External Auditor Clean Room

External auditors (e.g. TÜV SÜD, PwC, EY) require scoped, time-bound evidence access without exposing tenant operational secrets or unassigned domains:

- **Time-Bound Magic Tokens**: Generated with explicit expiration (e.g. 48 hours).
- **Scope Restriction**: Confined strictly to specified frameworks (`ISO_27001_2022`) and control codes (`A.5.15`, `A.8.2`). Any attempt to access controls outside the scope is blocked and audited.
- **Forensic Watermarking**: Exported or viewed evidence dynamically renders an immutable forensic watermark (`Confidential — Audit Access for <auditorEmail> [<auditorOrg>] — Ref: <token>`).
- **Instant Revocation**: Customer CISO can revoke clean room tokens at any moment, invalidating active auditor sessions.
