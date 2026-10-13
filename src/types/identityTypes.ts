// ============================================================================
// SKANDA ZERO-TRUST ENTERPRISE IDENTITY & EXPERIENCE GATEWAY TYPES
// Path: src/types/identityTypes.ts
//
// Canonical data contracts for Server-Authoritative Identity Resolution,
// Multi-Tenant Isolation, Persona Routing, Risk-Based Authentication,
// Onboarding Gateways, and Cryptographic Session Telemetry.
// ============================================================================

import { EnterpriseRole, SubscriptionTier, CloudResidencyRegion } from './saasTypes';
import { UserRole } from '../types';

/**
 * Supported Authentication Methods
 */
export type AuthMethod =
  | 'PASSWORD_MFA'
  | 'ENTERPRISE_SSO'
  | 'ENTRA_ID'
  | 'OKTA'
  | 'GOOGLE_WORKSPACE'
  | 'SAML_2_0'
  | 'OIDC'
  | 'PASSKEY_WEBAUTHN'
  | 'TOTP'
  | 'SMART_CARD'
  | 'CERTIFICATE_AUTH';

/**
 * Integration Truth & Production Readiness Status
 */
export type IntegrationStatus =
  | 'IMPLEMENTED'
  | 'CONFIGURED'
  | 'INTEGRATION_READY'
  | 'SIMULATED'
  | 'REQUIRES_EXTERNAL_IDP'
  | 'REQUIRES_CUSTOMER_CONFIGURATION'
  | 'PILOT_READY'
  | 'PRODUCTION_DEPLOYED'
  | 'UNVERIFIED';

/**
 * Risk-Based Authentication Evaluation Level
 */
export type LoginRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

/**
 * MFA Challenge Types
 */
export type MfaType = 'TOTP' | 'WEBAUTHN_PASSKEY' | 'HARDWARE_KEY' | 'EMAIL_MAGIC_LINK';

/**
 * Canonical Security Telemetry Events
 */
export type SecurityTelemetryEventType =
  | 'LOGIN_ATTEMPT'
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILURE'
  | 'MFA_REQUIRED'
  | 'MFA_SUCCESS'
  | 'MFA_FAILURE'
  | 'SSO_REDIRECT'
  | 'SSO_SUCCESS'
  | 'SSO_FAILURE'
  | 'PASSKEY_SUCCESS'
  | 'PASSKEY_FAILURE'
  | 'SESSION_CREATED'
  | 'SESSION_REVOKED'
  | 'ACCOUNT_LOCKED'
  | 'SUSPICIOUS_LOGIN'
  | 'PRIVILEGED_LOGIN'
  | 'TENANT_RESOLVED'
  | 'PERSONA_RESOLVED'
  | 'STEP_UP_TRIGGERED'
  | 'CROSS_TENANT_ACCESS_BLOCKED'
  | 'RLS_VIOLATION_PREVENTED'
  | 'UNAUTHORIZED_MODULE_BLOCKED';

/**
 * Immutable Security Telemetry Event Record
 */
export interface SecurityTelemetryEvent {
  eventId: string;
  timestamp: string;
  eventType: SecurityTelemetryEventType;
  tenantId?: string;
  userId?: string;
  userEmail?: string;
  correlationId: string;
  authMethod: AuthMethod;
  result: 'SUCCESS' | 'FAILURE' | 'CHALLENGED' | 'BLOCKED';
  riskContext: {
    level: LoginRiskLevel;
    score: number; // 0 - 100
    factors: string[];
    clientIp?: string;
    userAgent?: string;
    geoCity?: string;
    geoCountry?: string;
    impossibleTravelDetected?: boolean;
    deviceFamiliarityScore?: number;
  };
  sourceMetadata: {
    origin: string;
    sovereignRegion: string;
    tlsCipherSuite?: string;
    protocolVersion: string;
  };
}

/**
 * Onboarding State Progression
 */
export type OnboardingState =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'DISCOVERY_PENDING'
  | 'SME_INTERVIEWS_PENDING'
  | 'PROCESS_DISCOVERY_PENDING'
  | 'REVIEW_PENDING'
  | 'SCOPE_PENDING'
  | 'APPROVAL_PENDING'
  | 'READY'
  | 'ACTIVE'
  | 'SUSPENDED';

/**
 * Canonical Persona Type (Distinct from Role)
 */
export type CanonicalPersona =
  | 'EXECUTIVE_CISO'
  | 'GRC_LEAD'
  | 'CONTRIBUTOR'
  | 'AUDITOR'
  | 'PRIVACY_OFFICER'
  | 'EXECUTIVE_BOARD'
  | 'TENANT_ADMIN'
  | 'SUPER_ADMIN';

/**
 * Persona Description & Metadata
 */
export interface PersonaDefinition {
  persona: CanonicalPersona;
  displayName: string;
  subtitle: string;
  description: string;
  defaultLandingWorkspace: string;
  allowedRoles: (EnterpriseRole | UserRole | string)[];
  requiredPermissions: string[];
  keyCapabilities: string[];
}

/**
 * Active Compliance Program Reference
 */
export interface ActiveComplianceProgram {
  programId: string;
  frameworkCode: string;
  displayName: string;
  version: string;
  status: 'ACTIVE' | 'AUDIT_IN_PROGRESS' | 'REMEDIATION' | 'CERTIFIED';
  controlsCount: number;
  posturePercentage: number;
}

/**
 * Resolved Sovereign Regional Authority
 */
export interface SovereignRegionContext {
  regionCode: CloudResidencyRegion;
  displayName: string;
  cloudProvider: 'AWS' | 'AZURE' | 'GCP' | 'ON_PREMISE_HSM';
  dataCenterLocation: string;
  jurisdiction: string;
  sovereignComplianceStandards: string[];
  isLockedByPolicy: boolean;
}

/**
 * Canonical Subscription & Entitlement Context
 */
export interface ResolvedEntitlementContext {
  tier: SubscriptionTier;
  maxSeats: number;
  usedSeats: number;
  entitledModules: string[];
  aiTokenQuotaMonthly: number;
  aiTokenUsedMonthly: number;
  telemetryQuotaEventsMonthly: number;
  telemetryUsedMonthly: number;
  wormStorageCapacityGb: number;
  wormStorageUsedGb: number;
  supportsCustomBranding: boolean;
  supportsDedicatedHSM: boolean;
  supportsCrossTenantConsortium: boolean;
}

/**
 * Server-Authoritative Authenticated Session Context
 * (The single source of truth for the entire application session)
 */
export interface AuthenticatedSessionContext {
  // Session Security & Cryptographic Tokens
  sessionId: string;
  sessionToken: string; // HMAC/JWT formatted server signature
  refreshToken: string;
  issuedAt: string;
  expiresAt: string;
  idleTimeoutMinutes: number;
  correlationId: string;
  authenticationStrength: 'STANDARD' | 'STEP_UP' | 'FIDO2_AL2' | 'HARDWARE_MFA';

  // Resolved User Identity
  user: {
    id: string;
    email: string;
    name: string;
    title: string;
    department?: string;
    isPrivileged: boolean;
    primaryRole: EnterpriseRole | UserRole | string;
    authMethod: AuthMethod;
    lastLoginAt: string;
  };

  // Resolved Tenant Context
  tenant: {
    id: string;
    organizationId: string;
    name: string;
    legalName: string;
    domain: string;
    status: 'ACTIVE' | 'TRIAL' | 'PENDING_DISCOVERY' | 'SUSPENDED' | 'ARCHIVED';
    tier: SubscriptionTier;
    industry: string;
    country: string;
  };

  // Resolved Roles & Granular Permissions
  roles: (EnterpriseRole | UserRole | string)[];
  permissions: string[];

  // Resolved Persona Context
  persona: {
    activePersona: CanonicalPersona;
    displayName: string;
    description: string;
  };

  // Resolved SaaS Subscriptions & Entitlements
  subscription: ResolvedEntitlementContext;

  // Active Compliance Programs
  frameworks: ActiveComplianceProgram[];

  // Sovereign Region & Data Residency
  region: SovereignRegionContext;

  // Onboarding & Organizational Truth State
  onboarding: {
    state: OnboardingState;
    completionPercentage: number;
    discoveryCompleted: boolean;
    pendingDepartmentInterviews: string[];
    totalInScopeDepartments: number;
    completedInterviewsCount: number;
    baselineLocked: boolean;
    nextRecommendedStep: string;
  };

  // Risk & Device Context
  risk: {
    level: LoginRiskLevel;
    score: number;
    flags: string[];
  };

  // Canonical Landing Resolution
  landing: {
    targetModuleId: string;
    targetTab?: string;
    reason: string;
    journeyPhase: 'ONBOARDING' | 'ORGANIZATIONAL_DISCOVERY' | 'SME_INTERVIEWS' | 'OPERATIONAL_GRC' | 'EXECUTIVE_ASSURANCE' | 'AUDIT_CLEANROOM';
  };
}

/**
 * Login Request Payload
 */
export interface LoginCredentialsPayload {
  email: string;
  password?: string;
  mfaCode?: string;
  authMethod: AuthMethod;
  ssoProviderId?: string;
  ssoAssertionToken?: string;
  passkeyCredential?: {
    id: string;
    rawId: string;
    authenticatorData: string;
    clientDataJSON: string;
    signature: string;
  };
  clientRiskHints?: {
    screenResolution?: string;
    timezone?: string;
    locale?: string;
    userAgent?: string;
  };
}

/**
 * Authentication Response from Gateway
 */
export interface AuthGatewayResponse {
  success: boolean;
  requiresMfa?: boolean;
  mfaChallenge?: {
    challengeId: string;
    mfaType: MfaType;
    maskedTarget: string; // e.g., "Google Authenticator / TOTP App"
    expiresAt: string;
  };
  requiresStepUp?: boolean;
  stepUpReason?: string;
  sessionContext?: AuthenticatedSessionContext;
  errorMessage?: string;
  errorCode?: 'INVALID_CREDENTIALS' | 'ACCOUNT_LOCKED' | 'TENANT_SUSPENDED' | 'MFA_FAILED' | 'RISK_BLOCK' | 'SSO_REJECTED' | 'INVALID_REQUEST';
  lockoutRemainingSeconds?: number;
}

/**
 * Enterprise SSO Provider Configuration
 */
export interface SSOProviderRecord {
  providerId: string;
  domain: string;
  name: string;
  protocol: 'SAML_2_0' | 'OIDC';
  idpEntityId: string;
  ssoLoginUrl: string;
  certThumbprint: string;
  status: IntegrationStatus;
  autoProvisionRoles: EnterpriseRole[];
}

/**
 * Administrative Identity Metrics
 */
export interface IdentityGatewayMetrics {
  totalLogins24h: number;
  authSuccessRate: number; // e.g. 99.4%
  failedAuthRate: number; // e.g. 0.6%
  mfaChallengeRate: number; // e.g. 100% for privileged
  mfaSuccessRate: number; // e.g. 98.8%
  suspiciousLogins24h: number;
  lockedAccountsCount: number;
  activeSessionsCount: number;
  privilegedSessionsCount: number;
  passkeyAdoptionRate: number; // e.g. 34%
  ssoHealthStatus: 'HEALTHY' | 'DEGRADED' | 'FAILED';
  scimSyncHealthStatus: 'HEALTHY' | 'DEGRADED' | 'FAILED';
}
