# SKANDA PostgreSQL Production Hardening & Fail-Fast Assurance
**Document ID:** SKD-DB-2026-V1  
**Classification:** Engineering & Security Standard  
**Compliance Reference:** ISO/IEC 27001:2022 A.8.24 (Use of cryptography), A.8.12 (Data leakage prevention), A.8.14 (Redundancy of information processing facilities)  

---

## 1. Objective & Hardening Philosophy

Historically, non-production environments permit silent fallback to in-memory state when database connectivity fails. In enterprise production environments, **silent data degradation is unacceptable** as it leads to phantom transactions, unpersisted compliance evidence, and split-brain states.

In Phase 21, SKANDA implements a strict **Fail-Fast Database Boot Guard**:
```
NODE_ENV=production
        |
        v
PostgreSQL REQUIRED (Aurora Multi-AZ)
        |
        +---> Connection Health & Migration Check
        |
        +---> FAIL: Throws EnterpriseDatabaseUnavailableFatalError
        |     (Container terminates with non-zero exit code, triggering orchestrator restart)
        |
        +---> NO SILENT IN-MEMORY FALLBACK PERMITTED
```

---

## 2. Nine Production Failure Scenarios & Verification Evidence

All 9 failure scenarios are executed and verified via `scripts/validatePhase21EnterpriseHardening.ts` and `server/services/PostgresConnectionManager.ts`:

| # | Scenario | Production Behavior | Dev/Sandbox Behavior | Verification Result |
| :--- | :--- | :--- | :--- | :--- |
| **1** | PostgreSQL Available | Normal connection pool initialization; `HEALTHY` state; transactions enabled. | Normal connection. | **PASS (HEALTHY)** |
| **2** | PostgreSQL Unavailable | **FAILS FAST**: Throws `EnterpriseDatabaseUnavailableFatalError`. Process exits immediately. | Degrades to in-memory store with prominent telemetry warnings. | **PASS (threwFatal=true)** |
| **3** | Invalid Credentials | Throws fatal auth failure; prevents connection leak; triggers security alert. | Logs error, degrades to mock mode. | **PASS (threwFatal=true)** |
| **4** | Invalid Host Resolution | DNS failure immediately trips fatal circuit breaker; prevents hanging requests. | Logs error, degrades to mock mode. | **PASS (threwFatal=true)** |
| **5** | Connection Timeout | Trips 5000ms timeout threshold; throws fatal timeout exception. | Times out and enters mock mode. | **PASS (threwFatal=true)** |
| **6** | Connection Pool Exhaustion | Rejects excess acquisition requests; throws fatal resource error. | Queues or uses mock fallback. | **PASS (threwFatal=true)** |
| **7** | Database Restart | Catches disconnection, drains corrupted connections, and safely reconnects. | Graceful reconnect. | **PASS (Reconnected HEALTHY)** |
| **8** | Transient Network Glitch | Fails fast; never silently downgrades production transactions to memory. | Degrades to memory with alert. | **PASS (threwFatal=true)** |
| **9** | Migration Version Mismatch | Throws `EnterpriseMigrationMismatchError`; refuses schema execution. | Logs warning. | **PASS (threwMismatch=true)** |

---

## 3. Production Connection Pooling & Tuning Parameters

```typescript
const productionPoolConfig = {
  max: 50,                        // Maximum connections in pool
  min: 10,                        // Minimum warm idle connections
  idleTimeoutMillis: 30000,       // Close idle connections after 30s
  connectionTimeoutMillis: 5000,  // Fast fail on connection acquisition (5s)
  ssl: {
    rejectUnauthorized: true,     // Enforce verified TLS certificate chain
    ca: process.env.RDS_CA_BUNDLE // AWS RDS Global Root CA certificate
  },
  statement_timeout: 10000,       // Kill rogue queries running > 10s
  idle_in_transaction_session_timeout: 15000 // Prevent hanging transaction locks
};
```

---

## 4. Reconciliation & Data Migration Assurance

To move from legacy JSON storage to relational PostgreSQL, the reconciliation pipeline (`scripts/validatePhase21EnterpriseHardening.ts`) validates:
1. **Source Record Count vs. Target Record Count**: Exact match across all 84 foundational entities.
2. **Cryptographic SHA-256 Hash Reconciliation**: Source JSON dataset hash (`6a5d7bd6ab0a...`) reconciled with database state table representations.
3. **Foreign Key Integrity**: Zero orphaned controls, evidence items, or risk relationships.
4. **Tenant Ownership**: 100% of rows contain valid `tenant_id` foreign keys to registered tenant records.
