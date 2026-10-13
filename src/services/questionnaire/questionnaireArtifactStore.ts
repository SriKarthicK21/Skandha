// ============================================================================
// SKANDA QUESTIONNAIRE INTELLIGENCE: SECURE SOURCE ARTIFACT STORE
// Path: src/services/questionnaire/questionnaireArtifactStore.ts
//
// Persists original uploaded questionnaire artifacts with:
//  - per-tenant directory isolation (path traversal sanitized)
//  - deterministic storage locator
//  - SHA-256 integrity verification on read
//  - hard size ceiling
//
// The original uploaded file is NEVER overwritten: exports are written to a
// separate derivative path.
// ============================================================================

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export const MAX_QUESTIONNAIRE_FILE_BYTES = 25 * 1024 * 1024; // 25 MB

export interface StoredArtifact {
  artifactId: string;
  tenantId: string;
  fileName: string;
  storageLocator: string;
  sha256ContentHash: string;
  fileSizeBytes: number;
}

export function sanitizeTenantSegment(tenantId: string): string {
  const cleaned = (tenantId || 'unknown-tenant').replace(/[^a-zA-Z0-9._-]/g, '_');
  return cleaned.length > 0 ? cleaned.slice(0, 96) : 'unknown-tenant';
}

export function sanitizeFileName(fileName: string): string {
  const base = path.basename(fileName || 'questionnaire').replace(/[^a-zA-Z0-9._-]/g, '_');
  return base.length > 0 ? base.slice(0, 160) : 'questionnaire';
}

export function computeSha256(buffer: Buffer | Uint8Array): string {
  return crypto.createHash('sha256').update(Buffer.from(buffer)).digest('hex');
}

export const DEFAULT_ARTIFACT_ROOT = path.join(process.cwd(), 'data', 'questionnaire_artifacts');

/**
 * Resolves the active artifact root. `SKANDA_QUESTIONNAIRE_ARTIFACT_DIR` allows
 * tests and non-default deployments to relocate stored artifacts.
 */
export function resolveArtifactRoot(): string {
  return process.env.SKANDA_QUESTIONNAIRE_ARTIFACT_DIR || DEFAULT_ARTIFACT_ROOT;
}

export class QuestionnaireArtifactStore {
  private static instances: Map<string, QuestionnaireArtifactStore> = new Map();
  private readonly rootDir: string;

  constructor(rootDir?: string) {
    this.rootDir = rootDir || resolveArtifactRoot();
  }

  public static getInstance(): QuestionnaireArtifactStore {
    const root = resolveArtifactRoot();
    if (!QuestionnaireArtifactStore.instances.has(root)) {
      QuestionnaireArtifactStore.instances.set(root, new QuestionnaireArtifactStore(root));
    }
    return QuestionnaireArtifactStore.instances.get(root)!;
  }

  public getRootDir(): string {
    return this.rootDir;
  }

  /** Absolute directory for a tenant's artifacts, guaranteed inside the root. */
  public tenantDir(tenantId: string): string {
    const dir = path.join(this.rootDir, sanitizeTenantSegment(tenantId));
    const resolvedRoot = path.resolve(this.rootDir);
    const resolvedDir = path.resolve(dir);
    if (!resolvedDir.startsWith(resolvedRoot)) {
      throw new Error('Refusing to write outside the artifact root (path traversal detected).');
    }
    return resolvedDir;
  }

  public saveSource(tenantId: string, fileName: string, buffer: Buffer): StoredArtifact {
    if (buffer.length > MAX_QUESTIONNAIRE_FILE_BYTES) {
      throw new Error(
        `File exceeds the ${Math.round(MAX_QUESTIONNAIRE_FILE_BYTES / (1024 * 1024))} MB upload ceiling.`
      );
    }
    const sha256 = computeSha256(buffer);
    const artifactId = `qa-${sha256.slice(0, 12)}-${Date.now().toString(36)}`;
    const dir = this.tenantDir(tenantId);
    const safeName = sanitizeFileName(fileName);
    const locator = path.join(dir, `${artifactId}__${safeName}`);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(locator, buffer);

    return {
      artifactId,
      tenantId,
      fileName: safeName,
      storageLocator: locator,
      sha256ContentHash: sha256,
      fileSizeBytes: buffer.length
    };
  }

  /** Saves a derivative (export) without touching the original source. */
  public saveDerivative(tenantId: string, fileName: string, buffer: Buffer): { locator: string; sha256: string } {
    const dir = this.tenantDir(tenantId);
    fs.mkdirSync(dir, { recursive: true });
    const safeName = sanitizeFileName(fileName);
    const locator = path.join(dir, `exports__${Date.now().toString(36)}__${safeName}`);
    fs.writeFileSync(locator, buffer);
    return { locator, sha256: computeSha256(buffer) };
  }

  /**
   * Reads an artifact and verifies its stored hash. A hash mismatch means the
   * artifact was tampered with or corrupted — the read fails closed.
   */
  public readVerified(
    tenantId: string,
    locator: string,
    expectedSha256: string
  ): { buffer: Buffer; verified: boolean; reason?: string } {
    const tenantRoot = this.tenantDir(tenantId);
    const resolved = path.resolve(locator);
    if (!resolved.startsWith(tenantRoot)) {
      return {
        buffer: Buffer.alloc(0),
        verified: false,
        reason: 'Artifact locator is outside the authenticated tenant directory; access denied.'
      };
    }
    if (!fs.existsSync(resolved)) {
      return { buffer: Buffer.alloc(0), verified: false, reason: 'Artifact not found.' };
    }
    const buffer = fs.readFileSync(resolved);
    const actual = computeSha256(buffer);
    if (actual !== expectedSha256) {
      return {
        buffer,
        verified: false,
        reason: 'SHA-256 integrity verification failed; artifact hash does not match ingestion record.'
      };
    }
    return { buffer, verified: true };
  }
}

/** Lazily resolved accessor: honours SKANDA_QUESTIONNAIRE_ARTIFACT_DIR at call time. */
export function getQuestionnaireArtifactStore(): QuestionnaireArtifactStore {
  return QuestionnaireArtifactStore.getInstance();
}

export const questionnaireArtifactStore = QuestionnaireArtifactStore.getInstance();
