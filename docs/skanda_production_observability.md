# SKANDA Production Observability & Security Monitoring
**Document ID:** SKD-OPS-OBS-2026-V1  
**Classification:** Enterprise SRE Standard  
**Compliance Standards:** ISO/IEC 27001:2022 A.8.15 (Logging), A.8.16 (Monitoring activities), SOC 2 CC7.1, CC7.2  

---

## 1. Observability Architecture: Metrics, Logs, Traces & Error Budgets

SKANDA implements full-stack observability following the Google SRE Golden Signals (Latency, Traffic, Errors, Saturation) with OpenTelemetry (OTel) context propagation.

```
[ Request Context ] ---> Injects [ X-Request-ID, X-Correlation-ID, X-Tenant-ID ]
         |
         v
 [ OpenTelemetry Collector ]
         +---> Traces (Distributed Span Tracing across API, Outbox, DB)
         +---> Metrics (Prometheus / CloudWatch / Datadog)
         +---> Logs (JSON structured logs with zero-leak sanitization)
```

---

## 2. Service Level Objectives (SLOs) & Error Budgets

| Service Domain | SLI (Service Level Indicator) | Target SLO | 30-Day Error Budget |
| :--- | :--- | :--- | :--- |
| **API Availability** | Successful non-5xx responses / Total requests | **99.95%** | 21.6 minutes downtime |
| **API P95 Latency** | HTTP response duration for canonical graph reads | **< 200 ms** | Max 5% requests > 200ms |
| **Database Pool** | Connection acquisition wait time | **< 50 ms** | Pool saturation < 80% |
| **Evidence Ledger** | Cryptographic block seal duration | **< 500 ms** | Unsealed block lag < 5s |
| **Outbox Webhook Delivery** | Time from event emission to external dispatch | **< 30 sec** | Dead-letter queue depth = 0 |

---

## 3. Automated Security Alerts Matrix

The security monitoring daemon monitors and generates high-priority alerts for:

1. **Repeated Authentication Failures**: > 5 failed logins within 60 seconds from a single IP/tenant.
2. **MFA Failures & Bypass Attempts**: Repeated invalid TOTP/WebAuthn submissions.
3. **Privilege Escalation**: Unauthorized attempts to assume `PLATFORM_SUPERADMIN` or bypass role checks.
4. **Role & Permission Changes**: Immediate Sev-2 alert logged when any user receives elevated admin privileges.
5. **Cross-Tenant Access Violations**: Any database query or API call blocked by tenant isolation policies.
6. **Evidence Tampering**: SHA-256 mismatch detected during cryptographic verification.
7. **Unusual Bulk Exports**: Any single session requesting > 100 evidence artifacts or full tenant export.
8. **SSRF / Malicious Webhook Invocations**: Blocked requests to loopback, RFC1918, or cloud metadata.
9. **KMS / Secret Break-Glass Activation**: Immediate Sev-1 notification to CISO upon dual-custody unlock.
10. **Database Failover / Pool Saturation**: Aurora failover detection or pool utilization > 85%.
