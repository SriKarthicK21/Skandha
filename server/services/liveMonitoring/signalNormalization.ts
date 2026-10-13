// ============================================================================
// SKANDA LIVE MONITORING: SIGNAL NORMALIZATION & VALIDATION
// Path: server/services/liveMonitoring/signalNormalization.ts
//
// Converts provider-specific observations into the canonical SecuritySignal.
//
// Security rules enforced here (not in the transport layer):
//   1. Tenant ownership is NEVER taken from the inbound payload. The caller
//      must supply a binding derived from the verified integration record and
//      the authenticated request context, and a payload that claims a
//      different tenant is rejected outright.
//   2. Malformed payloads are rejected with an explicit reason; valid but
//      unmapped provider event types are accepted as GENERIC_SECURITY_EVENT so
//      an event is never silently discarded.
//   3. An immutable digest of the raw payload is always preserved so the
//      original observation remains reproducible after the fact.
// ============================================================================

import crypto from 'crypto';
import {
  CanonicalSignalType,
  ObservedStateValue,
  SecuritySignal,
  SignalProcessingStatus,
  SignalProvenance
} from '../../../src/types/liveMonitoringTypes';

/** Maximum accepted raw payload size (bytes of JSON), guarding the pipeline. */
export const MAX_RAW_PAYLOAD_BYTES = 256 * 1024;

/** Server-derived integration binding. Never built from the payload itself. */
export interface IntegrationBinding {
  tenantId: string;
  integrationId: string;
  connectorId: string;
  provider: string;
  resourceScope: string[];
  /** Verification performed on the transport before normalization. */
  signatureVerification: SignalProvenance['signatureVerification'];
  receivedFromUntrustedChannel: boolean;
}

export interface RawSignalInput {
  providerEventId?: string;
  providerEventType?: string;
  resourceRef?: string;
  resourceType?: string;
  sourceObservedAt?: string;
  sourceRevision?: string;
  severity?: string;
  payload: unknown;
}

export interface NormalizationResult {
  accepted: boolean;
  signal?: SecuritySignal;
  processingStatus: SignalProcessingStatus;
  rejectionReason?: string;
  /** Provider event type that did not map to a canonical signal type. */
  unmappedProviderEventType?: string;
}

// ---------------------------------------------------------------------------
// PROVIDER EVENT → CANONICAL SIGNAL TYPE
// ---------------------------------------------------------------------------

const PROVIDER_SIGNAL_MAP: Record<string, Record<string, CanonicalSignalType>> = {
  GITHUB: {
    'organization.two_factor_requirement': 'REPOSITORY_MFA_ENFORCEMENT',
    'repository.branch_protection': 'REPOSITORY_BRANCH_PROTECTION',
    'repository.secret_scanning': 'REPOSITORY_SECRET_SCANNING',
    'repository.code_ownership': 'REPOSITORY_CODE_OWNERSHIP',
    'repository.vulnerability_alert': 'VULNERABILITY_FINDING',
    'repository.dependabot_alert': 'VULNERABILITY_FINDING'
  },
  MICROSOFT_ENTRA_ID: {
    'identity.mfa_registration': 'IDENTITY_MFA_STATE',
    'identity.privileged_role_assignment': 'IDENTITY_PRIVILEGED_ROLE_GRANT',
    'identity.sign_in_activity': 'IDENTITY_STALE_ACCOUNT',
    'identity.sso_enforcement': 'IDENTITY_SSO_ENFORCEMENT'
  },
  AWS: {
    's3.bucket_encryption': 'CLOUD_STORAGE_ENCRYPTION',
    's3.bucket_public_access': 'CLOUD_PUBLIC_EXPOSURE',
    'config.rule_compliance': 'CONFIGURATION_BASELINE_DRIFT',
    'securityhub.finding': 'GENERIC_SECURITY_EVENT'
  },
  AZURE: {
    'storage.account_encryption': 'CLOUD_STORAGE_ENCRYPTION',
    'network.public_endpoint': 'CLOUD_PUBLIC_EXPOSURE',
    'defender.recommendation': 'CONFIGURATION_BASELINE_DRIFT'
  },
  VULNERABILITY_SCANNER: {
    'scan.finding': 'VULNERABILITY_FINDING',
    'scan.sla_breach': 'VULNERABILITY_SLA_BREACH'
  }
};

export function resolveCanonicalSignalType(provider: string, providerEventType: string): CanonicalSignalType | null {
  const providerMap = PROVIDER_SIGNAL_MAP[provider];
  if (!providerMap) return null;
  return providerMap[providerEventType] || null;
}

// ---------------------------------------------------------------------------
// IDENTITY / INTEGRITY HELPERS
// ---------------------------------------------------------------------------

export function computePayloadSha256(payload: unknown): string {
  const serialized = typeof payload === 'string' ? payload : JSON.stringify(payload ?? null);
  return crypto.createHash('sha256').update(serialized).digest('hex');
}

/**
 * Idempotency key: stable for the same provider event on the same resource so
 * a duplicated webhook delivery or an overlapping poll cannot create a second
 * signal, evaluate twice, or open a duplicate finding.
 */
export function computeSignalIdempotencyKey(params: {
  tenantId: string;
  connectorId: string;
  providerEventId: string;
  providerEventType: string;
  resourceRef: string;
  sourceObservedAt: string;
  payloadSha256: string;
}): string {
  return (
    `${params.tenantId}|${params.connectorId}|${params.providerEventId}|${params.providerEventType}|` +
    `${params.resourceRef}|${params.sourceObservedAt}|${params.payloadSha256}`
  );
}

/** Correlation id groups every artefact produced by one observation. */
export function computeCorrelationId(tenantId: string, connectorId: string, resourceRef: string, sourceObservedAt: string): string {
  return `corr-${crypto
    .createHash('sha256')
    .update(`${tenantId}|${connectorId}|${resourceRef}|${sourceObservedAt}`)
    .digest('hex')
    .slice(0, 16)}`;
}

// ---------------------------------------------------------------------------
// VALIDATION
// ---------------------------------------------------------------------------

const TENANT_CLAIM_KEYS = ['tenantId', 'tenant_id', 'tenant', 'organisationId', 'organizationId', 'orgId', 'accountTenant'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isValidIsoTimestamp(value: unknown): value is string {
  if (typeof value !== 'string' || value.trim() === '') return false;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed);
}

function isSupportedObservedState(value: unknown): value is ObservedStateValue {
  if (value === null) return true;
  const type = typeof value;
  if (type === 'boolean' || type === 'number' || type === 'string') return true;
  if (Array.isArray(value)) return value.every(item => typeof item === 'string');
  return false;
}

/** Extracts any tenant claim carried by an untrusted payload (for blocking). */
export function extractPayloadTenantClaims(payload: unknown): string[] {
  if (!isRecord(payload)) return [];
  const claims: string[] = [];
  for (const key of TENANT_CLAIM_KEYS) {
    const value = payload[key];
    if (typeof value === 'string' && value.trim() !== '') claims.push(value.trim());
    if (isRecord(value) && typeof value.id === 'string') claims.push(value.id);
  }
  return claims;
}

function pickObservedState(payload: Record<string, unknown>): unknown {
  if ('observedState' in payload) return payload.observedState;
  if ('state' in payload) return payload.state;
  if ('compliant' in payload) return payload.enabled ?? null;
  if ('enabled' in payload) return payload.enabled;
  if ('isEnabled' in payload) return payload.isEnabled;
  if ('value' in payload) return payload.value;
  if ('count' in payload) return payload.count;
  if ('status' in payload) return payload.status;
  return null;
}

function normalizeSeverity(value: unknown): SecuritySignal['severity'] {
  const candidates: SecuritySignal['severity'][] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFORMATIONAL'];
  const upper = String(value ?? '').toUpperCase();
  return candidates.includes(upper as SecuritySignal['severity']) ? (upper as SecuritySignal['severity']) : 'MEDIUM';
}

// ---------------------------------------------------------------------------
// NORMALIZATION
// ---------------------------------------------------------------------------

/**
 * Validates and normalizes a raw provider observation into a canonical signal.
 * The signal is fully populated but not yet persisted; the pipeline owns
 * persistence and job creation.
 */
export function normalizeInboundSignal(input: RawSignalInput, binding: IntegrationBinding): NormalizationResult {
  // 1. Binding sanity: a signal can never be attributed without a verified tenant.
  if (!binding?.tenantId || !binding.integrationId || !binding.connectorId || !binding.provider) {
    return {
      accepted: false,
      processingStatus: 'REJECTED_UNKNOWN_INTEGRATION',
      rejectionReason:
        'No verified integration binding was supplied. Inbound events are only accepted through a registered, enabled integration.'
    };
  }

  // 2. Shape validation.
  if (!isRecord(input?.payload)) {
    return {
      accepted: false,
      processingStatus: 'REJECTED_MALFORMED',
      rejectionReason: 'Payload must be a JSON object; primitives, arrays and null are rejected.'
    };
  }
  const payload = input.payload as Record<string, unknown>;

  const payloadBytes = Buffer.byteLength(JSON.stringify(payload), 'utf8');
  if (payloadBytes > MAX_RAW_PAYLOAD_BYTES) {
    return {
      accepted: false,
      processingStatus: 'REJECTED_MALFORMED',
      rejectionReason: `Payload of ${payloadBytes} bytes exceeds the ${MAX_RAW_PAYLOAD_BYTES} byte ingestion limit.`
    };
  }

  const providerEventId = typeof input.providerEventId === 'string' ? input.providerEventId.trim() : '';
  if (!providerEventId || providerEventId.length > 255) {
    return {
      accepted: false,
      processingStatus: 'REJECTED_MALFORMED',
      rejectionReason: 'providerEventId is required and must be at most 255 characters.'
    };
  }

  const providerEventType = typeof input.providerEventType === 'string' ? input.providerEventType.trim() : '';
  if (!providerEventType) {
    return {
      accepted: false,
      processingStatus: 'REJECTED_MALFORMED',
      rejectionReason: 'providerEventType is required; the canonical signal type cannot be derived without it.'
    };
  }

  const resourceRef = typeof input.resourceRef === 'string' ? input.resourceRef.trim() : '';
  if (!resourceRef || resourceRef.length > 512) {
    return {
      accepted: false,
      processingStatus: 'REJECTED_MALFORMED',
      rejectionReason: 'resourceRef is required (provider resource identifier, at most 512 characters).'
    };
  }

  const sourceObservedAt = input.sourceObservedAt;
  if (!isValidIsoTimestamp(sourceObservedAt)) {
    return {
      accepted: false,
      processingStatus: 'REJECTED_MALFORMED',
      rejectionReason: 'sourceObservedAt must be a valid ISO-8601 timestamp describing when the provider observed the state.'
    };
  }

  const observedState = pickObservedState(payload);
  if (!isSupportedObservedState(observedState)) {
    return {
      accepted: false,
      processingStatus: 'REJECTED_MALFORMED',
      rejectionReason:
        'Observed state must be a boolean, number, string, array of strings, or explicit null. Nested structures are rejected because they cannot be evaluated deterministically.'
    };
  }

  // 3. Cross-tenant claim rejection.
  const claimedTenants = extractPayloadTenantClaims(payload);
  const foreignClaims = claimedTenants.filter(claim => claim !== binding.tenantId);
  if (foreignClaims.length > 0) {
    return {
      accepted: false,
      processingStatus: 'REJECTED_MALFORMED',
      rejectionReason:
        `Payload claims tenant ownership (${foreignClaims.join(', ')}) that does not match the verified integration owner ` +
        `(${binding.tenantId}). Cross-integration tenant attribution is refused.`
    };
  }

  // 4. Signature expectations for untrusted channels.
  const provenance: SignalProvenance = {
    sourceEventReference: `${binding.provider}:${providerEventType}:${providerEventId}`,
    sourceEventSha256: computePayloadSha256(payload),
    sourceApiVersion: typeof payload.apiVersion === 'string' ? payload.apiVersion : undefined,
    receivedFromUntrustedChannel: binding.receivedFromUntrustedChannel,
    signatureVerification: binding.signatureVerification,
    rawPayloadPreserved: true
  };

  if (
    binding.receivedFromUntrustedChannel &&
    binding.signatureVerification !== 'HMAC_SHA256_VERIFIED' &&
    binding.signatureVerification !== 'NOT_APPLICABLE'
  ) {
    return {
      accepted: false,
      processingStatus: 'REJECTED_UNVERIFIED_SIGNATURE',
      rejectionReason: 'Webhook delivery could not be verified with a valid HMAC SHA-256 signature and was refused.'
    };
  }

  // 5. Canonical mapping. An unmapped provider event is retained, never dropped.
  const mappedSignalType = resolveCanonicalSignalType(binding.provider, providerEventType);

  const signal: SecuritySignal = {
    id: `SIG-${crypto.randomUUID().replace(/-/g, '').slice(0, 24)}`,
    tenantId: binding.tenantId,
    integrationId: binding.integrationId,
    connectorId: binding.connectorId,
    provider: binding.provider,
    providerEventId,
    providerEventType,
    signalType: mappedSignalType ?? 'GENERIC_SECURITY_EVENT',
    canonicalEntityType: normalizeEntityType(input.resourceType),
    canonicalEntityId: resourceRef,
    resourceRef,
    resourceScope: [...binding.resourceScope],
    observedState,
    previousState: undefined,
    sourceObservedAt,
    ingestedAt: new Date().toISOString(),
    sourceRevision: input.sourceRevision,
    severity: mappedSignalType ? normalizeSeverity(input.severity) : 'INFORMATIONAL',
    provenance,
    correlationId: computeCorrelationId(binding.tenantId, binding.connectorId, resourceRef, sourceObservedAt),
    idempotencyKey: computeSignalIdempotencyKey({
      tenantId: binding.tenantId,
      connectorId: binding.connectorId,
      providerEventId,
      providerEventType,
      resourceRef,
      sourceObservedAt,
      payloadSha256: provenance.sourceEventSha256
    }),
    processingStatus: 'RECEIVED',
    providerFields: sanitizeProviderFields(payload),
    evaluatedControlIds: []
  };

  return {
    accepted: true,
    signal,
    processingStatus: 'RECEIVED',
    unmappedProviderEventType: mappedSignalType ? undefined : providerEventType
  };
}

function normalizeEntityType(resourceType: unknown): SecuritySignal['canonicalEntityType'] {
  const value = String(resourceType ?? '').toUpperCase();
  const allowed: SecuritySignal['canonicalEntityType'][] = [
    'ASSET',
    'IDENTITY',
    'REPOSITORY',
    'VULNERABILITY',
    'CONTROL_OWNER'
  ];
  return allowed.includes(value as SecuritySignal['canonicalEntityType'])
    ? (value as SecuritySignal['canonicalEntityType'])
    : 'UNKNOWN';
}

/**
 * Retains provider context for traceability while removing anything that looks
 * like a credential so secrets never reach the durable signal record.
 */
function sanitizeProviderFields(payload: Record<string, unknown>): Record<string, unknown> {
  const sensitivePattern = /(token|secret|password|private[_-]?key|authorization|api[_-]?key|client[_-]?secret|bearer)/i;
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (sensitivePattern.test(key)) {
      out[key] = '[REDACTED_BY_INGESTION]';
      continue;
    }
    if (typeof value === 'string' && value.length > 2048) {
      out[key] = `${value.slice(0, 2048)}…[truncated]`;
      continue;
    }
    out[key] = value;
  }
  return out;
}
