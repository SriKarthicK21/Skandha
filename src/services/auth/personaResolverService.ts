// ============================================================================
// SKANDA ZERO-TRUST IDENTITY GATEWAY: PERSONA RESOLUTION SERVICE
// Path: src/services/auth/personaResolverService.ts
//
// Resolves server-authoritative Persona, Persona Metadata, Key Capabilities,
// and default Landing Workspace from canonical User Role and Tenant state.
//
// RULE: Separates ROLE (RBAC access level) from PERSONA (User experience focus).
// ============================================================================

import { CanonicalPersona, PersonaDefinition } from '../../types/identityTypes';
import { EnterpriseRole } from '../../types/saasTypes';
import { UserRole } from '../../types';

export const CANONICAL_PERSONAS: Record<CanonicalPersona, PersonaDefinition> = {
  EXECUTIVE_CISO: {
    persona: 'EXECUTIVE_CISO',
    displayName: 'Executive Security Leadership',
    subtitle: 'Chief Information Security Officer & Cyber Risk Command',
    description: 'Executive posture oversight, critical threat vectors, continuous compliance health, audit readiness, and board-level risk appetite.',
    defaultLandingWorkspace: 'command_center',
    allowedRoles: ['CISO', 'COMPANY_ADMIN', 'PLATFORM_SUPER_ADMIN', 'SECURITY_ADMIN'],
    requiredPermissions: ['dashboard:read', 'risk:read', 'compliance:read', 'audit:read', 'controls:read'],
    keyCapabilities: [
      'Enterprise Security Posture & Dynamic RAG Status',
      'Real-Time Control Health & Telemetry Streams',
      'Continuous Compliance Readiness (ISO 27001, MAS TRM, SOC 2)',
      'Forensic Evidence Freshness & Closed-Loop CAPA Exposure',
      'Executive Risk Appetite & Incident Command'
    ]
  },
  GRC_LEAD: {
    persona: 'GRC_LEAD',
    displayName: 'Compliance & Governance Operations',
    subtitle: 'GRC Manager & Risk Assurance Lead',
    description: 'Operational orchestration of compliance programs, risk registers, control baselines, policy lifecycle, and audit workpapers.',
    defaultLandingWorkspace: 'compliance',
    allowedRoles: ['GRC_MANAGER', 'COMPLIANCE_MANAGER', 'RISK_MANAGER', 'COMPANY_ADMIN', 'CISO'],
    requiredPermissions: ['compliance:write', 'controls:write', 'risk:write', 'policies:write', 'evidence:read'],
    keyCapabilities: [
      'Multi-Framework Mapping & Gap Assessments',
      'Policy Lifecycle, SME Reviews & Formal Approvals',
      'Unified Control Library & Implementation Tracking',
      'Audit Package Generation & Remediation Signoffs',
      'Regulatory Horizon Scanning & Statutory Notices'
    ]
  },
  CONTRIBUTOR: {
    persona: 'CONTRIBUTOR',
    displayName: 'My Work Contributor',
    subtitle: 'Control Owner & Operational Contributor',
    description: 'Streamlined task execution hub: upload evidence, complete department interview questionnaires, acknowledge policies, and remediate assigned controls.',
    defaultLandingWorkspace: 'my_work',
    allowedRoles: ['CONTROL_OWNER', 'PROCESS_OWNER', 'BUSINESS_OWNER', 'IT_OWNER', 'HR_LEAD', 'DEPARTMENT_CONTRIBUTOR', 'EMPLOYEE'],
    requiredPermissions: ['tasks:write', 'evidence:upload', 'policies:acknowledge', 'interviews:answer'],
    keyCapabilities: [
      'Personal Work Queue & Upcoming Deadlines',
      'Evidence Request Fulfilment with Drag-and-Drop & Hash Proofs',
      'Policy Review & Digital Acknowledgment',
      'Control Activity Self-Assessments',
      'Department Discovery Survey Collaboration'
    ]
  },
  AUDITOR: {
    persona: 'AUDITOR',
    displayName: 'Audit Clean Room',
    subtitle: 'External / Internal Lead Auditor',
    description: 'Read-only, tamper-evident audit workspace. Inspect evidence vaults, sample controls, verify cryptographic WORM proofs, and log findings.',
    defaultLandingWorkspace: 'auditor_portal',
    allowedRoles: ['AUDITOR', 'PLATFORM_AUDITOR', 'INTERNAL_AUDITOR'],
    requiredPermissions: ['audit:read', 'evidence:read_readonly', 'controls:read', 'worm:verify'],
    keyCapabilities: [
      'Digital Audit Binder & Cryptographic WORM Verification',
      'Independent Control Sampling & Effectiveness Testing',
      'Non-Conformity (NC) & Opportunity for Improvement (OFI) Logging',
      'Real-Time Evidence Freshness Verification',
      'Read-Only Cross-Tenant Cleanroom Isolation'
    ]
  },
  PRIVACY_OFFICER: {
    persona: 'PRIVACY_OFFICER',
    displayName: 'Privacy & Data Protection Hub',
    subtitle: 'Data Protection Officer (DPO) & Privacy Counsel',
    description: 'PII asset inventories, Records of Processing Activities (RoPA), Data Protection Impact Assessments (DPIA), and DPDP/GDPR/PDPA compliance.',
    defaultLandingWorkspace: 'dpdp',
    allowedRoles: ['PRIVACY_OFFICER', 'DPO', 'COMPANY_ADMIN', 'CISO', 'LEGAL_COUNSEL'],
    requiredPermissions: ['privacy:write', 'assets:read', 'data:read', 'compliance:read'],
    keyCapabilities: [
      'Digital Personal Data Inventory & Cross-Border Data Flows',
      'Automated RoPA Generation & Processing Lawfulness Verification',
      'Data Principal Rights (DSR) Request Tracking',
      '6-Hour / 72-Hour Breach Notification Escalation Sentry',
      'ISO 27701 PIMS Privacy Extension Controls'
    ]
  },
  EXECUTIVE_BOARD: {
    persona: 'EXECUTIVE_BOARD',
    displayName: 'Executive Stakeholder View',
    subtitle: 'Board Member & Strategic Leadership',
    description: 'High-level strategic risk oversight, regulatory posture summaries, incident exposure, and executive presentation decks.',
    defaultLandingWorkspace: 'board_deck',
    allowedRoles: ['EXECUTIVE', 'BOARD_MEMBER', 'EXECUTIVE_VIEWER', 'CEO'],
    requiredPermissions: ['board:read', 'risk:read_summary', 'reports:read'],
    keyCapabilities: [
      'Enterprise Risk Heatmap & Aggregate Exposure',
      'Board-Ready Compliance Status Summaries',
      'Major Cyber Incident Impact Analysis',
      'Regulatory Authority Compliance Standing',
      'Presentation Deck Generator for Board Meetings'
    ]
  },
  TENANT_ADMIN: {
    persona: 'TENANT_ADMIN',
    displayName: 'Tenant Administration',
    subtitle: 'Enterprise SaaS Administrator',
    description: 'Manage users, teams, SAML SSO/SCIM integrations, subscription entitlements, audit logs, and data residency settings.',
    defaultLandingWorkspace: 'tenant_admin',
    allowedRoles: ['TENANT_ADMIN', 'COMPANY_ADMIN', 'SUPER_ADMIN'],
    requiredPermissions: ['tenant:admin', 'users:manage', 'sso:configure', 'billing:read', 'audit:read'],
    keyCapabilities: [
      'Directory Sync (SAML 2.0 / OIDC / SCIM 2.0)',
      'Granular RBAC & User Seat Management',
      'Subscription Tier & Quota Usage Monitoring',
      'Sovereign Data Residency & Cryptographic Key Management',
      'Enterprise Support SLA & Service Catalog'
    ]
  },
  SUPER_ADMIN: {
    persona: 'SUPER_ADMIN',
    displayName: 'Platform Operations',
    subtitle: 'SKANDA Platform Super Administrator',
    description: 'Global multi-tenant governance, cross-tenant telemetry health, platform catalog definitions, and sovereign infrastructure operations.',
    defaultLandingWorkspace: 'super_admin_portfolio',
    allowedRoles: ['SUPER_ADMIN', 'PLATFORM_SUPER_ADMIN'],
    requiredPermissions: ['superadmin:all', 'platform:manage', 'master_data:write'],
    keyCapabilities: [
      'Global Multi-Tenant Portfolio Overview',
      'Master Regulatory Knowledge Base & Framework Maintenance',
      'System-Wide Security Telemetry & Abuse Sentry',
      'Tenant Provisioning & Dedicated HSM Allocation',
      'Platform Health & SLA Performance Metrics'
    ]
  }
};

export class PersonaResolverService {
  private static instance: PersonaResolverService;

  public static getInstance(): PersonaResolverService {
    if (!PersonaResolverService.instance) {
      PersonaResolverService.instance = new PersonaResolverService();
    }
    return PersonaResolverService.instance;
  }

  /**
   * Resolves canonical persona from user role and tenant context.
   */
  public resolvePersona(role: EnterpriseRole | UserRole | string, explicitPersona?: CanonicalPersona): {
    persona: CanonicalPersona;
    definition: PersonaDefinition;
    targetWorkspace: string;
  } {
    const normalizedRole = (role || '').toString().toUpperCase();

    // If explicit persona requested and permitted for role, honor it
    if (explicitPersona && CANONICAL_PERSONAS[explicitPersona]) {
      const def = CANONICAL_PERSONAS[explicitPersona];
      if (def.allowedRoles.includes(normalizedRole as any) || normalizedRole === 'SUPER_ADMIN' || normalizedRole === 'PLATFORM_SUPER_ADMIN') {
        return {
          persona: explicitPersona,
          definition: def,
          targetWorkspace: def.defaultLandingWorkspace
        };
      }
    }

    // Server-authoritative resolution based on role
    let resolvedPersona: CanonicalPersona = 'CONTRIBUTOR';

    if (normalizedRole === 'SUPER_ADMIN' || normalizedRole === 'PLATFORM_SUPER_ADMIN') {
      resolvedPersona = 'SUPER_ADMIN';
    } else if (normalizedRole === 'CISO') {
      resolvedPersona = 'EXECUTIVE_CISO';
    } else if (normalizedRole === 'COMPANY_ADMIN' || normalizedRole === 'TENANT_ADMIN') {
      // Default company admins to CISO command center if security lead, or tenant admin if IT admin
      resolvedPersona = 'EXECUTIVE_CISO';
    } else if (normalizedRole === 'AUDITOR' || normalizedRole === 'PLATFORM_AUDITOR' || normalizedRole === 'INTERNAL_AUDITOR') {
      resolvedPersona = 'AUDITOR';
    } else if (normalizedRole === 'PRIVACY_OFFICER' || normalizedRole === 'DPO') {
      resolvedPersona = 'PRIVACY_OFFICER';
    } else if (normalizedRole === 'EXECUTIVE_VIEWER' || normalizedRole === 'EXECUTIVE' || normalizedRole === 'BOARD_MEMBER' || normalizedRole === 'CEO') {
      resolvedPersona = 'EXECUTIVE_BOARD';
    } else if (normalizedRole === 'GRC_MANAGER' || normalizedRole === 'COMPLIANCE_MANAGER' || normalizedRole === 'RISK_MANAGER' || normalizedRole === 'GRC_LEAD') {
      resolvedPersona = 'GRC_LEAD';
    } else {
      // Department Contributor, Process Owner, Control Owner, Employee
      resolvedPersona = 'CONTRIBUTOR';
    }

    const definition = CANONICAL_PERSONAS[resolvedPersona];
    return {
      persona: resolvedPersona,
      definition,
      targetWorkspace: definition.defaultLandingWorkspace
    };
  }

  /**
   * Returns permissions granted to a specific role.
   */
  public resolvePermissions(role: EnterpriseRole | UserRole | string): string[] {
    const normalizedRole = (role || '').toString().toUpperCase();

    const basePermissions = ['profile:read', 'notifications:read', 'tasks:read'];

    switch (normalizedRole) {
      case 'SUPER_ADMIN':
      case 'PLATFORM_SUPER_ADMIN':
        return ['*'];

      case 'CISO':
      case 'COMPANY_ADMIN':
        return [
          ...basePermissions,
          'dashboard:read',
          'command_center:read',
          'risk:all',
          'compliance:all',
          'controls:all',
          'evidence:all',
          'policies:all',
          'audit:all',
          'tenant:admin',
          'users:manage',
          'sso:configure',
          'billing:read',
          'worm:verify'
        ];

      case 'GRC_MANAGER':
      case 'COMPLIANCE_MANAGER':
      case 'RISK_MANAGER':
        return [
          ...basePermissions,
          'dashboard:read',
          'compliance:all',
          'controls:all',
          'risk:all',
          'policies:all',
          'evidence:all',
          'interviews:manage',
          'discovery:manage',
          'audit:collaborate'
        ];

      case 'AUDITOR':
      case 'PLATFORM_AUDITOR':
      case 'INTERNAL_AUDITOR':
        return [
          ...basePermissions,
          'auditor_portal:read',
          'evidence:read_readonly',
          'controls:read_readonly',
          'policies:read_readonly',
          'audit:log_finding',
          'worm:verify'
        ];

      case 'PRIVACY_OFFICER':
      case 'DPO':
        return [
          ...basePermissions,
          'privacy:all',
          'dpdp:all',
          'assets:read',
          'data:read',
          'policies:read_privacy'
        ];

      case 'EXECUTIVE':
      case 'BOARD_MEMBER':
      case 'EXECUTIVE_VIEWER':
        return [
          ...basePermissions,
          'board:read',
          'risk:read_summary',
          'compliance:read_summary',
          'reports:read'
        ];

      case 'CONTROL_OWNER':
      case 'PROCESS_OWNER':
      case 'DEPARTMENT_CONTRIBUTOR':
      default:
        return [
          ...basePermissions,
          'my_work:all',
          'tasks:write',
          'evidence:upload',
          'policies:acknowledge',
          'interviews:answer',
          'surveys:answer'
        ];
    }
  }
}

export const personaResolverService = PersonaResolverService.getInstance();
