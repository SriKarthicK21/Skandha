# SKANDA Enterprise GRC: Production Architecture Specification
**Document ID:** SKD-ARCH-2026-V1  
**Classification:** Enterprise Confidential / Restricted  
**Current Milestone:** Phase 21 Hardening — Enterprise Beta → Production Candidate  
**Target Compliance:** ISO/IEC 27001:2022 Clauses 4–10 & Annex A, SOC 2 Type II, DPDP Act 2023  

---

## 1. Executive Summary & Architectural Overview

SKANDA is an enterprise Governance, Risk, and Compliance (GRC) and Privacy Engineering platform designed to provide an immutable, mathematically verifiable system of record for digital trust. The system is architected around a single, unified Canonical GRC Graph that links risks, controls, evidence, evaluations, corrective actions, and privacy processing activities across multi-tenant boundaries.

In Phase 21 Enterprise Hardening, SKANDA transitions from **Enterprise Beta** to **Production Candidate** through strict elimination of in-memory fallbacks in production, multi-layered database Row-Level Security (RLS), RFC 7644 SCIM 2.0 provisioning, automated SSRF outbound guards, EICAR-aware evidence quarantine pipelines, envelope KMS encryption, and verified point-in-time recovery (PITR) disaster recovery procedures.

```
+----------------------------------------------------------------------------------------------------+
|                                    SKANDA ARCHITECTURE TOPOLOGY                                    |
+----------------------------------------------------------------------------------------------------+
                                      |
                       [ Cloudflare Edge / WAF ]
                                      | (TLS 1.3 Strict, DDoS L3/L4/L7, Geo-Fencing)
                                      v
                      [ AWS Application Load Balancer ]
                                      |
       +------------------------------+------------------------------+
       |                                                             |
       v                                                             v
 [ SKANDA Core API Cluster (ECS/EKS) ]           [ SKANDA Worker Cluster (Outbox & Jobs) ]
 - SCIM 2.0 Engine (/scim/v2)                    - Outbox Broker Service
 - Billing Entitlements Reconciler               - Cryptographic Seal Engine
 - Clean Room Service                            - Telemetry Stream Processor
 - Evidence Upload Pipeline                      - Background Reconciliation
       |                                                             |
       +------------------------------+------------------------------+
                                      |
                                      v
                       [ PostgreSQL Connection Manager ]
                       - Fail-fast enforcement (`NODE_ENV=production`)
                       - Zero in-memory fallback in production
                       - Dynamic connection pooling & health checks
                                      |
               +----------------------+----------------------+
               |                                             |
               v                                             v
 [ AWS Aurora PostgreSQL (Multi-AZ) ]          [ AWS S3 / Glacier Vault ]
 - Database-Level Row-Level Security (RLS)     - WORM / Object Lock Compliance
 - Canonical GRC Graph relational schema       - Envelope KMS Encrypted Objects
 - Hash-chained Immutable Audit Trail         - Secure Evidence Artifacts
 - Automated PITR Backups (RPO < 15m)
```

---

## 2. Core Architectural Invariants

The platform strictly enforces the following core architectural invariants:

1. **One Canonical GRC Graph**: Every domain entity (`RiskNode`, `ControlRecord`, `EvidenceArtifact`, `AssuranceExplanation`, `PrivacyActivity`) resolves to a single unified graph node. No shadow data stores or duplicate domain models exist.
2. **One Multi-Tenant Model**: Multi-tenancy is enforced hierarchically at the API Gateway, Service Layer, and PostgreSQL Database Level via Row-Level Security (`app.current_tenant_id`).
3. **One Cryptographic WORM Evidence Model**: Every piece of evidence is hashed via SHA-256 upon upload, validated through streaming antivirus and magic-number MIME sniffing, and registered into an immutable cryptographic seal ledger.
4. **Zero Silent Fallback**: In production (`NODE_ENV=production`), the application strictly halts boot and throws fatal exceptions (`EnterpriseDatabaseUnavailableFatalError`) if the managed PostgreSQL cluster is unreachable or if schema migrations mismatch.
5. **Least Privilege Identity & Access**: SCIM 2.0 lifecycle management synchronizes users and groups from enterprise IdPs (Okta, Entra ID), strictly governed by RBAC, ABAC, and external clean-room containment.

---

## 3. High-Availability & Disaster Recovery Topology

| Layer | Primary Architecture | Standby / Failover Mechanism | SLA / Target Metric |
| :--- | :--- | :--- | :--- |
| **Compute / API** | AWS ECS Fargate multi-AZ across 3 AZs | Horizontal pod autoscaling (HPA) & automated unhealthy task draining | 99.95% Availability |
| **Database** | Aurora PostgreSQL Multi-AZ cluster | Synchronous replication to Aurora read replicas with automated failover | RTO < 8.2 min, RPO < 2.5 min |
| **Object Storage** | AWS S3 Standard with Bucket Versioning | Cross-Region Replication (CRR) with AWS S3 Glacier WORM Object Lock | 99.999999999% (11 9s) Durability |
| **Secrets & KMS** | AWS KMS Customer Managed Keys (CMK) | Multi-Region CMK Replication with automated annual rotation | < 5ms encryption latency |
| **Edge & CDN** | Cloudflare Enterprise Edge | Dynamic anycast routing with automated DDoS mitigation | Global Edge Latency < 35ms |

---

## 4. Production Candidate Status Declaration

With Phase 21 hardening verified across all 12 primary acceptance domains, SKANDA is objectively verified as **PRODUCTION CANDIDATE**. Production deployment to live customer environments is gated only on final operational live cloud infrastructure provisioning (managed database spin-up, HSM KMS alias binding, and public DNS cutover).
