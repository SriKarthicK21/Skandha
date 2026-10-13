# SKANDA Secrets Management & AWS KMS Architecture
**Document ID:** SKD-SEC-KMS-2026-V1  
**Classification:** Enterprise Security Architecture  
**Compliance Standards:** ISO/IEC 27001:2022 A.8.24 (Use of cryptography), A.8.11 (Data masking), SOC 2 CC6.1, CC6.6  

---

## 1. Secrets Management Philosophy: Zero Hardcoded Credentials

In production environments, SKANDA prohibits storing credentials, JWT signing keys, database connection strings, or cloud tokens in source repositories or unencrypted environment files.

The architecture utilizes **Envelope Encryption** powered by AWS KMS (Key Management Service) or equivalent enterprise HSMs (Hardware Security Modules):

```
+-----------------------------------------------------------------------------------+
|                        ENVELOPE ENCRYPTION ARCHITECTURE                            |
+-----------------------------------------------------------------------------------+
                                        |
               [ AWS KMS Customer Master Key (CMK) ]
                                        |
                +-----------------------+-----------------------+
                | GenerateDataKey                               | DecryptDataKey
                v                                               v
     [ Plaintext Data Key (DEK) ]                      [ Encrypted Data Key (CipherDEK) ]
                |                                               |
                | (AES-256-GCM)                                 | (Stored alongside payload)
                v                                               v
     [ Encrypted Secret Payload ] <-----------------------------+
```

---

## 2. Key Hierarchy & Envelope Encryption Specifications

1. **Customer Master Key (CMK)**: Managed by AWS KMS (or CloudHSM in APEX_GLOBAL tier). Configured with automated 365-day rotation.
2. **Data Encryption Key (DEK)**: A high-entropy 256-bit cryptographic key generated per encryption session, used to encrypt the payload via authenticated `AES-256-GCM` with a 96-bit Initialization Vector (IV) and a 128-bit authentication tag (`authTag`).
3. **DEK Key Wrapping**: The DEK is encrypted using AES-256 key wrapping (`iv:cipherDek`), ensuring the raw plaintext DEK resides in memory only for the duration of the cryptographic operation.

---

## 3. Secret Versioning & Dual-Custody Break-Glass Access

1. **Secret Versioning**: Every secret mutation creates a new version (`v1`, `v2`, etc.). Old versions remain accessible for decryption of historical data but are deprecated for new encryptions.
2. **Break-Glass Emergency Protocol**: In severe Sev-1 production incidents (e.g. database failover lockup), break-glass access requires:
   - Incident Ticket ID (`INC-2026-...`)
   - Dual custody: Requester (on-call SRE) and independent Approver (CISO / Security Lead).
   - Time-bound access token (expires in 60 minutes).
   - Instant immutable audit trail generation to WORM ledger.

---

## 4. Zero-Leak Log Sanitization

The `EnterpriseSecretsManager.sanitizeLog()` engine automatically strips:
- Database connection strings containing user/password credentials (`postgres://user:pass@host...` -> `postgres://user:***@host...`)
- Bearer tokens and JWTs (`Bearer eyJ...` -> `Bearer [REDACTED_JWT]`)
- Hexadecimal / Base64 private keys and authorization headers.
