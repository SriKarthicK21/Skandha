// ============================================================================
// SKANDA ENTERPRISE GRC: POLICY VERSION INTEGRITY & CANONICAL HASHING ENGINE
// Path: server/services/PolicyVersionIntegrityService.ts
//
// Implements deterministic, RFC 8785-aligned canonical JSON serialization,
// unicode/newline normalization, and cryptographic SHA-256 version sealing.
//
// Guarantees:
// 1. Any change to protected version content changes the hash.
// 2. Field ordering does NOT cause unintended hash changes (recursive key sorting).
// 3. Unicode and newline normalization (\r\n -> \n, NFC) are deterministic.
// 4. Stored hashes can be independently recalculated across any platform.
// 5. Published versions cannot be mutated in place (WORM-enforced).
// ============================================================================

import crypto from 'crypto';

export class PublishedVersionImmutableError extends Error {
  public readonly code = 'P0_VERSION_IMMUTABLE_VIOLATION';
  constructor(message: string) {
    super(`[IMMUTABILITY VIOLATION] ${message}`);
    this.name = 'PublishedVersionImmutableError';
  }
}

export interface CanonicalVersionPayload {
  tenantId: string;
  documentId: string;
  documentCode: string;
  version: string;
  type: string;
  title: string;
  effectiveDate: string;
  frameworkCodes: string[];
  content: {
    purpose: string;
    scope: string;
    objectives: string[];
    definitions: Record<string, string>;
    rolesAndResponsibilities: Array<{ role: string; mandate: string; r?: boolean; a?: boolean; c?: boolean; i?: boolean }>;
    requirementsOrSteps: Array<{
      stepNumber?: number;
      actor: string;
      system: string;
      action: string;
      expectedOutput?: string;
      evidenceProduced?: string;
    }>;
    controlMappings: Array<{ controlCode: string; requirement: string; practice: string }>;
    exceptionHandling: { workflow: string; approver: string; maxDays: number };
    governanceAndReview: { cycle: string; owner: string; approver: string };
  };
}

export class PolicyVersionIntegrityService {
  private static instance: PolicyVersionIntegrityService;

  private constructor() {}

  public static getInstance(): PolicyVersionIntegrityService {
    if (!PolicyVersionIntegrityService.instance) {
      PolicyVersionIntegrityService.instance = new PolicyVersionIntegrityService();
    }
    return PolicyVersionIntegrityService.instance;
  }

  /**
   * Recursively normalizes strings (NFC unicode + standard Unix \n newlines)
   * and sorts object keys alphabetically to guarantee RFC 8785 canonical representation.
   */
  public canonicalizeValue(val: any): any {
    if (val === null || val === undefined) {
      return null;
    }
    if (typeof val === 'string') {
      // Normalize Unicode to NFC and newlines to \n
      return val.normalize('NFC').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    }
    if (typeof val === 'number' || typeof val === 'boolean') {
      return val;
    }
    if (Array.isArray(val)) {
      return val.map(item => this.canonicalizeValue(item));
    }
    if (typeof val === 'object') {
      const sortedKeys = Object.keys(val).sort();
      const result: Record<string, any> = {};
      for (const key of sortedKeys) {
        result[key] = this.canonicalizeValue(val[key]);
      }
      return result;
    }
    return String(val);
  }

  /**
   * Constructs the deterministic canonical JSON string for a policy version.
   */
  public serializeCanonicalPayload(payload: CanonicalVersionPayload): string {
    const normalized = {
      tenantId: payload.tenantId,
      documentId: payload.documentId,
      documentCode: payload.documentCode,
      version: payload.version,
      type: payload.type,
      title: payload.title,
      effectiveDate: payload.effectiveDate ? new Date(payload.effectiveDate).toISOString() : '',
      frameworkCodes: [...(payload.frameworkCodes || [])].sort(),
      content: payload.content
    };

    const canonicalTree = this.canonicalizeValue(normalized);
    return JSON.stringify(canonicalTree);
  }

  /**
   * Computes the authoritative 64-character SHA-256 hash of a policy version.
   */
  public computeVersionDigest(payload: CanonicalVersionPayload): string {
    const canonicalJson = this.serializeCanonicalPayload(payload);
    return crypto.createHash('sha256').update(canonicalJson, 'utf8').digest('hex');
  }

  /**
   * Independently recalculates and verifies whether the given version matches its stored hash.
   */
  public verifyVersionIntegrity(payload: CanonicalVersionPayload, expectedDigest: string): {
    isValid: boolean;
    computedDigest: string;
    expectedDigest: string;
    mismatchReason?: string;
  } {
    const computedDigest = this.computeVersionDigest(payload);
    const isValid = crypto.timingSafeEqual(
      Buffer.from(computedDigest, 'hex'),
      Buffer.from(expectedDigest, 'hex')
    );

    return {
      isValid,
      computedDigest,
      expectedDigest,
      mismatchReason: isValid ? undefined : `Hash mismatch: Stored [${expectedDigest}] vs Recalculated [${computedDigest}]`
    };
  }

  /**
   * WORM Guard: Ensures that an already published version cannot be modified in place.
   */
  public assertImmutabilityGuard(isPublished: boolean, targetVersion: string, currentVersion: string): void {
    if (isPublished && targetVersion === currentVersion) {
      throw new PublishedVersionImmutableError(
        `Version ${targetVersion} is published and immutable. In-place modification is strictly prohibited. Create a revision (e.g. 2.0.0-DRAFT) instead.`
      );
    }
  }

  public assertPublishedVersionImmutable(doc: { status: string; currentVersion: string; sha256Digest?: string; content?: any }): void {
    if (doc.status === 'PUBLISHED') {
      throw new PublishedVersionImmutableError(
        `Version ${doc.currentVersion} is published and immutable. In-place modification is strictly prohibited. Create a revision instead.`
      );
    }
  }
}

export const policyVersionIntegrityService = PolicyVersionIntegrityService.getInstance();
