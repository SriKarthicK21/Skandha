# SKANDA SCIM 2.0 & Enterprise Identity Architecture
**Document ID:** SKD-ID-SCIM-2026-V1  
**Classification:** Enterprise Identity Standard  
**Compliance Standards:** RFC 7643, RFC 7644, ISO/IEC 27001:2022 A.5.16 (Identity management), A.5.17 (Authentication information), SOC 2 CC6.1, CC6.2  

---

## 1. Enterprise Identity Federation & Provisioning Overview

SKANDA implements native **System for Cross-domain Identity Management (SCIM 2.0)** endpoints conforming to RFC 7643 and RFC 7644:
- `/scim/v2/Users` (and `/api/v1/scim/v2/Users`)
- `/scim/v2/Groups` (and `/api/v1/scim/v2/Groups`)
- `/scim/v2/ServiceProviderConfig`

Compatible with enterprise Identity Providers (IdPs):
- **Microsoft Entra ID (Azure AD)**
- **Okta Workforce Identity Cloud**
- **Google Workspace**
- **Ping Identity / CyberArk**

---

## 2. Joiner, Mover, Leaver (JML) Lifecycle Automation

```
[ Enterprise IdP (Okta / Entra ID) ]
               |
               | (SCIM 2.0 REST Protocol with Bearer Token)
               v
 [ SKANDA SCIM Gateway: IdentityFederationService ]
               |
  +------------+------------+--------------------+
  |                         |                    |
  v                         v                    v
[ JOINER ]               [ MOVER ]            [ LEAVER ]
POST /scim/v2/Users      PUT/PATCH Users      PATCH active:false / DELETE
- Assign Tenant ID       - Update Roles       - Deactivate account
- Map Groups to RBAC     - Change Department  - Invalidate all JWT sessions
- Provision Home Org     - Re-evaluate ABAC   - Revoke active tokens
  |                         |                    |
  +------------+------------+--------------------+
               |
               v
  [ Immutable WORM Audit Trail Event Logged ]
```

---

## 3. RBAC & ABAC Security Guarantees

SCIM provisioning cannot bypass tenant boundaries or elevated authorization guards:
1. **Tenant Containment**: All provisioned users belong strictly to the authenticating tenant.
2. **Role Mapping Matrix**:
   - `SG-SKANDA-ADMINS` -> `CUSTOMER_ADMIN`
   - `SG-SKANDA-AUDITORS` -> `INTERNAL_AUDITOR`
   - `SG-SKANDA-COMPLIANCE` -> `COMPLIANCE_OFFICER`
   - `SG-SKANDA-DPO` -> `DATA_PROTECTION_OFFICER`
   - `SG-SKANDA-CISO` -> `CISO`
3. **Privilege Escalation Protection**: SCIM requests cannot grant `PLATFORM_SUPERADMIN` or bypass database RLS.
4. **Audit Immutability**: Every Joiner, Mover, and Leaver action produces a cryptographically sealed domain event in `EnterpriseAuditService`.
