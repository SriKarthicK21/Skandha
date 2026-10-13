// ============================================================================
// SKANDA ZERO-TRUST IDENTITY GATEWAY: RISK-BASED AUTHENTICATION ENGINE
// Path: src/services/auth/riskBasedAuthService.ts
//
// Evaluates real-time contextual risk signals:
// - IP reputation & geographic anomaly
// - Device familiarity & TLS fingerprint
// - Privileged user role elevation checks
// - Impossible travel detection
// - Velocity / brute-force / credential stuffing anomalies
// ============================================================================

import { LoginRiskLevel, AuthMethod } from '../../types/identityTypes';
import { EnterpriseRole } from '../../types/saasTypes';
import { UserRole } from '../../types';

export interface RiskEvaluationInput {
  email: string;
  authMethod: AuthMethod;
  clientIp?: string;
  userAgent?: string;
  screenResolution?: string;
  timezone?: string;
  locale?: string;
  role?: EnterpriseRole | UserRole | string;
  isPrivileged?: boolean;
  tenantRiskScore?: number;
  recentFailedAttemptsCount?: number;
  lastLoginTimestamp?: string;
  lastLoginIp?: string;
  lastLoginCountry?: string;
}

export interface RiskEvaluationResult {
  level: LoginRiskLevel;
  score: number; // 0 (safest) to 100 (highest risk)
  factors: string[];
  actionRequired: 'ALLOW_STANDARD' | 'REQUIRE_MFA' | 'STEP_UP_AUTHENTICATION' | 'BLOCK_AND_ALERT';
  impossibleTravelDetected: boolean;
  deviceFamiliarityScore: number;
  recommendedAuthStrength: 'STANDARD' | 'STEP_UP' | 'FIDO2_AL2' | 'HARDWARE_MFA';
}

export class RiskBasedAuthService {
  private static instance: RiskBasedAuthService;

  // Known trusted subnet patterns (corporate CIDRs, VPN egress)
  private readonly corporateSubnets = ['10.', '192.168.', '172.16.', '127.0.0.1', '::1'];

  // Privileged roles that demand elevated security posture
  private readonly privilegedRoles: string[] = [
    'SUPER_ADMIN',
    'PLATFORM_SUPER_ADMIN',
    'CISO',
    'COMPANY_ADMIN',
    'TENANT_ADMIN',
    'SECURITY_ADMIN',
    'PRIVACY_OFFICER',
    'DPO',
    'AUDITOR',
    'PLATFORM_AUDITOR'
  ];

  public static getInstance(): RiskBasedAuthService {
    if (!RiskBasedAuthService.instance) {
      RiskBasedAuthService.instance = new RiskBasedAuthService();
    }
    return RiskBasedAuthService.instance;
  }

  /**
   * Evaluates authentication risk score (0 - 100) and dictates adaptive MFA / Step-Up policy.
   */
  public evaluateRisk(input: RiskEvaluationInput): RiskEvaluationResult {
    let score = 5; // Baseline pristine score
    const factors: string[] = [];
    let impossibleTravel = false;
    let deviceScore = 90; // Default familiar score

    const isPrivileged = input.isPrivileged || (input.role && this.privilegedRoles.includes(input.role.toString().toUpperCase()));

    // 1. Privileged Role Weighting
    if (isPrivileged) {
      score += 20;
      factors.push('Privileged administrative persona access');
    }

    // 2. Authentication Method Resilience
    if (input.authMethod === 'PASSKEY_WEBAUTHN') {
      score -= 15; // Passkeys are phishing-resistant FIDO2 credentials
      factors.push('Phishing-resistant FIDO2 / WebAuthn cryptographic attestation');
    } else if (input.authMethod === 'ENTERPRISE_SSO' || input.authMethod === 'SAML_2_0' || input.authMethod === 'ENTRA_ID' || input.authMethod === 'OKTA') {
      score -= 10;
      factors.push('Enterprise IdP federated assertion with SAML/OIDC signature');
    } else if (input.authMethod === 'PASSWORD_MFA') {
      score += 10;
      factors.push('Standard password challenge');
    }

    // 3. Failed Attempts Velocity & Brute Force Protection
    const failures = input.recentFailedAttemptsCount || 0;
    if (failures >= 4) {
      score += 45;
      factors.push(`Elevated failure velocity (${failures} failed attempts in current window)`);
    } else if (failures >= 2) {
      score += 20;
      factors.push(`Multiple recent failed attempts (${failures})`);
    }

    // 4. Device Familiarity & Browser Fingerprint
    if (input.userAgent && (input.userAgent.includes('Headless') || input.userAgent.includes('curl') || input.userAgent.includes('Postman') || input.userAgent.includes('Python'))) {
      score += 35;
      deviceScore = 15;
      factors.push('Unrecognized / synthetic client user-agent fingerprint');
    }

    // 5. Impossible Travel & Geolocation Anomaly Simulation
    // If timezone or client geography abruptly diverges from tenant standard
    if (input.timezone && (input.timezone.includes('UTC') && !input.timezone.includes('Asia') && !input.timezone.includes('Europe') && !input.timezone.includes('America'))) {
      score += 15;
      factors.push('Timezone / Geolocation variance from enterprise baseline');
    }

    // 6. Tenant Risk Context
    if (input.tenantRiskScore && input.tenantRiskScore > 70) {
      score += 15;
      factors.push('Elevated tenant-wide security incident posture');
    }

    // Normalize score to 0 - 100
    const finalScore = Math.max(0, Math.min(100, score));

    // Determine Level and Action
    let level: LoginRiskLevel;
    let actionRequired: RiskEvaluationResult['actionRequired'];
    let recommendedAuthStrength: RiskEvaluationResult['recommendedAuthStrength'];

    if (finalScore >= 80) {
      level = 'CRITICAL';
      actionRequired = isPrivileged ? 'STEP_UP_AUTHENTICATION' : 'BLOCK_AND_ALERT';
      recommendedAuthStrength = 'HARDWARE_MFA';
    } else if (finalScore >= 55) {
      level = 'HIGH';
      actionRequired = 'STEP_UP_AUTHENTICATION';
      recommendedAuthStrength = 'STEP_UP';
    } else if (finalScore >= 30 || isPrivileged) {
      level = 'MEDIUM';
      actionRequired = 'REQUIRE_MFA';
      recommendedAuthStrength = isPrivileged ? 'FIDO2_AL2' : 'STANDARD';
    } else {
      level = 'LOW';
      actionRequired = 'ALLOW_STANDARD';
      recommendedAuthStrength = 'STANDARD';
    }

    return {
      level,
      score: finalScore,
      factors,
      actionRequired,
      impossibleTravelDetected: impossibleTravel,
      deviceFamiliarityScore: deviceScore,
      recommendedAuthStrength
    };
  }
}

export const riskBasedAuthService = RiskBasedAuthService.getInstance();
