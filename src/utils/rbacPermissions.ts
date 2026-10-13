import { UserRole } from '../types';

export interface RoleCapability {
  canUploadEvidence: boolean;
  canVerifyEvidence: boolean;
  canRaiseFindings: boolean;
  canLockSoA: boolean;
  canSignMoU: boolean;
  canEditTenantSettings: boolean;
  canAccessSuperAdmin: boolean;
  canExecuteInternalAudit: boolean;
  isReadOnly: boolean;
}

export interface RoleDefinition {
  role: UserRole;
  title: string;
  category: 'Admin' | 'Non-Admin';
  tier: string;
  shortDescription: string;
  fullDescription: string;
  accentColor: {
    bg: string;
    text: string;
    border: string;
    ring: string;
    badge: string;
  };
  capabilities: RoleCapability;
  allowedModuleIds: string[];
  restrictedModuleIds: string[];
}

// Map of all modules and their access rules
export const ROLE_DEFINITIONS: Record<UserRole, RoleDefinition> = {
  SUPER_ADMIN: {
    role: 'SUPER_ADMIN',
    title: 'Super Admin / CTO',
    category: 'Admin',
    tier: 'Platform Operator',
    shortDescription: 'Unrestricted global governance across all tenants, master catalogs, and cross-organization telemetry.',
    fullDescription: 'Highest level administrative role with unrestricted access across all client tenants, master data management, system-wide live scanner telemetry, and global regulatory crosswalks.',
    accentColor: {
      bg: 'bg-rose-500/10',
      text: 'text-rose-400',
      border: 'border-rose-500/30',
      ring: 'ring-rose-500/30',
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40'
    },
    capabilities: {
      canUploadEvidence: true,
      canVerifyEvidence: true,
      canRaiseFindings: true,
      canLockSoA: true,
      canSignMoU: true,
      canEditTenantSettings: true,
      canAccessSuperAdmin: true,
      canExecuteInternalAudit: true,
      isReadOnly: false
    },
    allowedModuleIds: ['*'], // Universal access
    restrictedModuleIds: []
  },

  COMPANY_ADMIN: {
    role: 'COMPANY_ADMIN',
    title: 'Company Admin / CISO',
    category: 'Admin',
    tier: 'Tenant Executive',
    shortDescription: 'Full tenant-level authority for ISO 27001, MAS TRM, policies, SoA locking, and tenant profile.',
    fullDescription: 'Designated organizational owner responsible for ISMS/AIMS scope definition, policy approvals, Statement of Applicability (SoA) baseline locking, digital MoU execution, and assigning departmental leads.',
    accentColor: {
      bg: 'bg-sky-500/10',
      text: 'text-sky-400',
      border: 'border-sky-500/30',
      ring: 'ring-sky-500/30',
      badge: 'bg-sky-500/20 text-sky-300 border-sky-500/40'
    },
    capabilities: {
      canUploadEvidence: true,
      canVerifyEvidence: true,
      canRaiseFindings: true,
      canLockSoA: true,
      canSignMoU: true,
      canEditTenantSettings: true,
      canAccessSuperAdmin: false,
      canExecuteInternalAudit: true,
      isReadOnly: false
    },
    allowedModuleIds: [
      'command_center',
      'dashboards',
      'executive_view',
      'business_discovery',
      'org_scope',
      'departments',
      'processes',
      'assets',
      'data_information',
      'vendors',
      'evidence_upload',
      'risk_map',
      'frameworks',
      'gap_assessment',
      'risk_assessment',
      'requirements',
      'control_library',
      'iso27001_dashboard',
      'iso27001_workbench',
      'iso27001_clauses',
      'statement_of_applicability',
      'iso42001_dashboard',
      'iso42001_workbench',
      'iso42001_scoping',
      'iso42001_reporting',
      'mas_dashboard',
      'mas_checklist',
      'mas_overview',
      'mas_applicability',
      'mas_assessment_workbench',
      'mas_policy_generator',
      'cross_framework_crosswalk',
      'regulatory_sources',
      'mas_reporting',
      'implementation',
      'policies',
      'tasks',
      'evidence_requirements',
      'evidence_centre',
      'internal_audit',
      'external_audit',
      'findings_capa',
      'remediation_desk',
      'audit_reporting',
      'readiness_cert',
      'reports_analytics',
      'ai_insights',
      'live_scanner',
      'telemetry_stream',
      'integrations',
      'settings_users',
      'settings',
      'data_sources',
      'onboarding_survey'
    ],
    restrictedModuleIds: [
      'super_admin_portfolio'
    ]
  },

  INTERNAL_AUDITOR: {
    role: 'INTERNAL_AUDITOR',
    title: 'Internal Auditor',
    category: 'Non-Admin',
    tier: 'Tenant Assurance',
    shortDescription: 'Clause 9.2 internal audits, independent controls testing, checklists, and raising non-conformities.',
    fullDescription: 'Second-line defense persona mandated under ISO 27001 Clause 9.2 to perform annual audit programs, execute clause fieldwork checklists, raise CAPA findings, and review evidence objectivity without mutating tenant parameters.',
    accentColor: {
      bg: 'bg-indigo-500/10',
      text: 'text-indigo-400',
      border: 'border-indigo-500/30',
      ring: 'ring-indigo-500/30',
      badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
    },
    capabilities: {
      canUploadEvidence: true,
      canVerifyEvidence: true,
      canRaiseFindings: true,
      canLockSoA: false,
      canSignMoU: false,
      canEditTenantSettings: false,
      canAccessSuperAdmin: false,
      canExecuteInternalAudit: true,
      isReadOnly: false
    },
    allowedModuleIds: [
      'command_center',
      'dashboards',
      'executive_view',
      'internal_audit',
      'findings_capa',
      'remediation_desk',
      'audit_reporting',
      'evidence_requirements',
      'evidence_centre',
      'iso27001_clauses',
      'iso27001_workbench',
      'iso27001_dashboard',
      'statement_of_applicability',
      'control_library',
      'risk_map',
      'risk_assessment',
      'gap_assessment',
      'requirements',
      'frameworks',
      'mas_checklist',
      'mas_assessment_workbench',
      'mas_overview',
      'mas_reporting',
      'cross_framework_crosswalk',
      'iso42001_workbench',
      'iso42001_reporting',
      'policies',
      'readiness_cert',
      'reports_analytics',
      'departments',
      'processes',
      'assets',
      'vendors'
    ],
    restrictedModuleIds: [
      'super_admin_portfolio',
      'settings_users',
      'settings',
      'onboarding_survey',
      'live_scanner',
      'telemetry_stream',
      'integrations',
      'mas_policy_generator'
    ]
  },

  DEPARTMENT_CONTRIBUTOR: {
    role: 'DEPARTMENT_CONTRIBUTOR',
    title: 'Department Contributor',
    category: 'Non-Admin',
    tier: 'Operational Contributor',
    shortDescription: 'Evidence uploads, assigned corrective actions, policy reading, and asset catalog contributions.',
    fullDescription: 'First-line operational user (e.g. IT SysAdmin, HR Specialist, DevOps Engineer) focused on uploading departmental audit proof, verifying SHA-256 artifacts, executing assigned tasks, and signing policy declarations.',
    accentColor: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
      ring: 'ring-emerald-500/30',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
    },
    capabilities: {
      canUploadEvidence: true,
      canVerifyEvidence: false,
      canRaiseFindings: false,
      canLockSoA: false,
      canSignMoU: false,
      canEditTenantSettings: false,
      canAccessSuperAdmin: false,
      canExecuteInternalAudit: false,
      isReadOnly: false
    },
    allowedModuleIds: [
      'command_center',
      'executive_view',
      'evidence_upload',
      'evidence_centre',
      'evidence_requirements',
      'tasks',
      'remediation_desk',
      'policies',
      'assets',
      'data_information',
      'departments',
      'control_library',
      'iso27001_workbench',
      'mas_checklist'
    ],
    restrictedModuleIds: [
      'super_admin_portfolio',
      'settings_users',
      'settings',
      'onboarding_survey',
      'statement_of_applicability',
      'internal_audit',
      'external_audit',
      'findings_capa',
      'risk_assessment',
      'risk_map',
      'gap_assessment',
      'iso27001_clauses',
      'iso42001_scoping',
      'iso42001_reporting',
      'mas_policy_generator',
      'mas_reporting',
      'live_scanner',
      'telemetry_stream',
      'integrations',
      'reports_analytics'
    ]
  },

  EXECUTIVE_VIEWER: {
    role: 'EXECUTIVE_VIEWER',
    title: 'Executive Viewer / Board Member',
    category: 'Non-Admin',
    tier: 'Executive Read-Only',
    shortDescription: 'Read-only visibility into compliance maturity, risk heatmaps, readiness scores, and executive board packs.',
    fullDescription: 'Senior executive persona (CEO, Board Audit Committee, CFO) with read-only access to high-level compliance indices, residual risk distributions, certification timelines, and board packs without data-entry controls.',
    accentColor: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      border: 'border-amber-500/30',
      ring: 'ring-amber-500/30',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
    },
    capabilities: {
      canUploadEvidence: false,
      canVerifyEvidence: false,
      canRaiseFindings: false,
      canLockSoA: false,
      canSignMoU: false,
      canEditTenantSettings: false,
      canAccessSuperAdmin: false,
      canExecuteInternalAudit: false,
      isReadOnly: true
    },
    allowedModuleIds: [
      'command_center',
      'dashboards',
      'executive_view',
      'iso27001_dashboard',
      'iso42001_dashboard',
      'mas_dashboard',
      'risk_map',
      'readiness_cert',
      'reports_analytics',
      'ai_insights',
      'statement_of_applicability',
      'policies',
      'mas_reporting',
      'iso42001_reporting'
    ],
    restrictedModuleIds: [
      'super_admin_portfolio',
      'settings_users',
      'settings',
      'onboarding_survey',
      'evidence_upload',
      'tasks',
      'internal_audit',
      'external_audit',
      'findings_capa',
      'live_scanner',
      'telemetry_stream',
      'integrations',
      'mas_policy_generator',
      'data_sources'
    ]
  },

  PLATFORM_AUDITOR: {
    role: 'PLATFORM_AUDITOR',
    title: 'Platform / External Lead Auditor',
    category: 'Non-Admin',
    tier: 'Certification Body',
    shortDescription: 'Stage 1/2 certification reviews, evidence sampling, external finding issuance, and audit recommendations.',
    fullDescription: 'Accredited third-party certification lead auditor (e.g. BSI, SGS, TÜV) conducting formal conformity assessments, independent evidence sampling, and signing off on certification readiness.',
    accentColor: {
      bg: 'bg-purple-500/10',
      text: 'text-purple-400',
      border: 'border-purple-500/30',
      ring: 'ring-purple-500/30',
      badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40'
    },
    capabilities: {
      canUploadEvidence: false,
      canVerifyEvidence: true,
      canRaiseFindings: true,
      canLockSoA: false,
      canSignMoU: false,
      canEditTenantSettings: false,
      canAccessSuperAdmin: false,
      canExecuteInternalAudit: true,
      isReadOnly: false
    },
    allowedModuleIds: [
      'command_center',
      'dashboards',
      'executive_view',
      'external_audit',
      'internal_audit',
      'findings_capa',
      'remediation_desk',
      'evidence_centre',
      'evidence_requirements',
      'iso27001_clauses',
      'iso27001_workbench',
      'iso27001_dashboard',
      'statement_of_applicability',
      'readiness_cert',
      'control_library',
      'risk_map',
      'risk_assessment',
      'policies',
      'mas_dashboard',
      'mas_checklist',
      'mas_overview',
      'mas_assessment_workbench',
      'mas_reporting',
      'cross_framework_crosswalk',
      'iso42001_dashboard',
      'iso42001_workbench',
      'iso42001_reporting',
      'reports_analytics'
    ],
    restrictedModuleIds: [
      'super_admin_portfolio',
      'settings_users',
      'settings',
      'onboarding_survey',
      'evidence_upload',
      'tasks',
      'live_scanner',
      'telemetry_stream',
      'integrations',
      'mas_policy_generator'
    ]
  }
};

export const MODULE_CANONICAL_MAP: Record<string, string> = {
  'dashboard': 'command_center',
  'dashboards': 'command_center',
  'executive': 'ciso_executive_summary',
  'executive_view': 'command_center',
  'audit_centre': 'auditor_portal',
  'audit_center': 'auditor_portal',
  'audit_readiness': 'readiness_cert',
  'controls': 'control_library',
  'iso27001_controls': 'iso27001_workbench',
  'control_lineage_graph': 'entity_lineage_graph',
  'global_regulatory_news': 'regulatory_sources',
  'regulatory_change': 'regulatory_sources',
  'incident_mgr': 'mas_incident_notification',
  'mas_gap_analysis': 'compliance_gap_visualization',
  'mas_trm': 'mas_overview',
  'mas_trm_reporting': 'mas_reporting',
  'multi_framework_harmonizer': 'cross_regulatory_crosswalk',
  'non_conformity': 'findings_capa',
  'priority_actions': 'tasks',
  'remediation_capa': 'remediation_desk',
  'global_accreditation': 'accreditation_registry',
  'soa_matrix': 'statement_of_applicability',
  'vendor_risk': 'vendors',
  'risk_register': 'risk_assessment',
  'analytics': 'reports_analytics',
  'security_questionnaires': 'security_questionnaire',
  'customer_assurance': 'security_questionnaire'
};

/**
 * Checks if a specific role can access a module.
 */
export function checkModulePermission(role: UserRole, rawModuleId: string): {
  allowed: boolean;
  reason?: string;
  requiredRoles: UserRole[];
} {
  const moduleId = MODULE_CANONICAL_MAP[rawModuleId] || rawModuleId;
  const def = ROLE_DEFINITIONS[role];
  if (!def) {
    return { allowed: true, requiredRoles: [] };
  }

  // Super Admin has universal access
  if (def.allowedModuleIds.includes('*')) {
    return { allowed: true, requiredRoles: ['SUPER_ADMIN'] };
  }

  // Explicitly restricted
  if (def.restrictedModuleIds.includes(moduleId)) {
    // Find which roles DO have access
    const rolesWithAccess = (Object.keys(ROLE_DEFINITIONS) as UserRole[]).filter(r => {
      const d = ROLE_DEFINITIONS[r];
      return d.allowedModuleIds.includes('*') || d.allowedModuleIds.includes(moduleId);
    });

    return {
      allowed: false,
      reason: `The module '${moduleId}' is restricted for the '${def.title}' persona under ISO 27001 A.5.15 access control policy.`,
      requiredRoles: rolesWithAccess
    };
  }

  // Explicitly allowed
  if (def.allowedModuleIds.includes(moduleId)) {
    return { allowed: true, requiredRoles: [] };
  }

  // Default fallback for unlisted supporting modules (e.g., business discovery)
  const isGeneralAccess = [
    'command_center',
    'dashboards',
    'compliance_heatmap',
    'compliance_matrix',
    'risk_heatmap',
    'frameworks',
    'requirements',
    'org_scope',
    'departments',
    'processes',
    'standards_academy',
    'standards_training',
    'standards_standards',
    'standards_knowledge',
    'standards_hub',
    'brandguard',
    'brandguard_dashboard',
    'brand_protection',
    'dpdp_compliance',
    'dpdp_checklist',
    'dpdp_consent_grievance',
    'dpdp_dpia',
    'dpdp_breach_playbook',
    'audit_reporting',
    'meeting_scheduler',
    'implementation',
    'implementation_journey',
    'discovery_questionnaire',
    'department_surveys',
    'compliance_profile',
    'implementation_plan',
    // Questionnaire reading is available to every persona; the server still
    // enforces approve / export / disclose permissions independently of the UI.
    'security_questionnaire',
    // Live monitoring is readable by every persona (a control owner must be able
    // to see their own drift). Ingestion, retest and closure remain enforced by
    // the server's control.manage / capa.manage / capa.close permissions.
    'live_monitoring',
    'monitoring_drift',
    'continuous_monitoring'
  ].includes(moduleId);

  return {
    allowed: isGeneralAccess,
    reason: isGeneralAccess ? undefined : `Module not assigned in ${def.title} RBAC profile.`,
    requiredRoles: ['COMPANY_ADMIN', 'SUPER_ADMIN']
  };
}

/**
 * Helper to identify non-admin roles eligible for preview simulation.
 */
export const NON_ADMIN_PREVIEW_ROLES: UserRole[] = [
  'INTERNAL_AUDITOR',
  'DEPARTMENT_CONTRIBUTOR',
  'EXECUTIVE_VIEWER',
  'PLATFORM_AUDITOR'
];
