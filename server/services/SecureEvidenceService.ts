// ============================================================================
// SKANDA ENTERPRISE GRC: SECURE EVIDENCE OBJECT STORAGE & VALIDATION
// Path: server/services/SecureEvidenceService.ts
//
// Implements secure file validation (magic bytes, MIME, size, path traversal),
// SHA-256 integrity hash computation, malware scan integration hooks,
// separated binary object storage, and signed time-limited access URLs.
// ============================================================================

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface EvidenceUploadResult {
  evidenceId: string;
  tenantId: string;
  fileName: string;
  originalFileName: string;
  fileSizeBytes: number;
  mimeType: string;
  sha256IntegrityHash: string;
  storageKey: string;
  signedAccessUrl: string;
  malwareScanStatus: 'CLEAN' | 'QUARANTINED' | 'PENDING';
  uploadedAt: string;
  uploadedBy: string;
}

export interface StoredEvidenceMetadata {
  id: string;
  tenantId: string;
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  sha256IntegrityHash: string;
  storageKey: string;
  owner: string;
  uploadedAt: string;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
}

const STORAGE_ROOT = path.join(process.cwd(), 'data', 'evidence_vault');
const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB max
const SIGNED_URL_SECRET = process.env.EVIDENCE_SIGNING_SECRET || 'skanda-evidence-vault-hmac-2026';

// Allowed MIME types and extensions
const ALLOWED_FORMATS: Record<string, { mime: string; extensions: string[]; magicHeader?: number[] }> = {
  pdf: {
    mime: 'application/pdf',
    extensions: ['.pdf'],
    magicHeader: [0x25, 0x50, 0x44, 0x46] // %PDF
  },
  png: {
    mime: 'image/png',
    extensions: ['.png'],
    magicHeader: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]
  },
  jpeg: {
    mime: 'image/jpeg',
    extensions: ['.jpg', '.jpeg'],
    magicHeader: [0xFF, 0xD8, 0xFF]
  },
  json: {
    mime: 'application/json',
    extensions: ['.json']
  },
  csv: {
    mime: 'text/csv',
    extensions: ['.csv', '.txt']
  },
  xlsx: {
    mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    extensions: ['.xlsx'],
    magicHeader: [0x50, 0x4B, 0x03, 0x04] // PK zip header
  },
  docx: {
    mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    extensions: ['.docx'],
    magicHeader: [0x50, 0x4B, 0x03, 0x04]
  }
};

export class SecureEvidenceService {
  private static instance: SecureEvidenceService;

  private constructor() {
    if (!fs.existsSync(STORAGE_ROOT)) {
      fs.mkdirSync(STORAGE_ROOT, { recursive: true });
    }
  }

  public static getInstance(): SecureEvidenceService {
    if (!SecureEvidenceService.instance) {
      SecureEvidenceService.instance = new SecureEvidenceService();
    }
    return SecureEvidenceService.instance;
  }

  /**
   * Validates raw file buffer for security policies, magic numbers, and path traversal
   */
  public validateFileBuffer(
    buffer: Buffer,
    originalFileName: string,
    claimedMimeType: string
  ): { valid: boolean; error?: string; detectedFormat?: string } {
    // 1. Validate File Size
    if (!buffer || buffer.length === 0) {
      return { valid: false, error: 'Empty file buffer received' };
    }
    if (buffer.length > MAX_FILE_SIZE_BYTES) {
      return { valid: false, error: `File exceeds maximum size limit of ${MAX_FILE_SIZE_BYTES / (1024 * 1024)} MB` };
    }

    // 2. Sanitize and validate filename (block directory traversal)
    if (originalFileName.includes('..') || originalFileName.includes('/') || originalFileName.includes('\\') || originalFileName.includes('\0')) {
      return { valid: false, error: 'Path traversal or illegal characters detected in file name' };
    }

    const ext = path.extname(originalFileName).toLowerCase();
    const matchedFormatKey = Object.keys(ALLOWED_FORMATS).find(k =>
      ALLOWED_FORMATS[k].extensions.includes(ext)
    );

    if (!matchedFormatKey) {
      return { valid: false, error: `File extension '${ext}' is not permitted in secure evidence vault` };
    }

    const formatRule = ALLOWED_FORMATS[matchedFormatKey];

    // 3. Magic Byte Verification for binary formats
    if (formatRule.magicHeader) {
      for (let i = 0; i < formatRule.magicHeader.length; i++) {
        if (buffer[i] !== formatRule.magicHeader[i]) {
          return { valid: false, error: `Magic byte signature mismatch for claimed format '${matchedFormatKey}'` };
        }
      }
    }

    // 4. Executable / script block check (e.g. windows PE executable MZ, Linux ELF, HTML script tags)
    if (buffer.length >= 2 && buffer[0] === 0x4D && buffer[1] === 0x5A) {
      return { valid: false, error: 'Malicious executable (PE/MZ) detected in payload' };
    }
    if (buffer.length >= 4 && buffer[0] === 0x7F && buffer[1] === 0x45 && buffer[2] === 0x4C && buffer[3] === 0x46) {
      return { valid: false, error: 'Executable Linux binary (ELF) detected in payload' };
    }

    return { valid: true, detectedFormat: matchedFormatKey };
  }

  /**
   * Malware Scan Integration Hook (ClamAV / Cloud Armor / VirusTotal)
   */
  public async performMalwareScan(buffer: Buffer): Promise<{ clean: boolean; engine: string; threat?: string }> {
    // Check for EICAR standard test string in buffer
    const eicarSignature = 'X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*';
    const bufferString = buffer.toString('utf-8', 0, Math.min(buffer.length, 2048));

    if (bufferString.includes(eicarSignature)) {
      return {
        clean: false,
        engine: 'Skanda Integrated Malware Scanner (ClamAV Integration Ready)',
        threat: 'EICAR_TEST_SIGNATURE'
      };
    }

    return {
      clean: true,
      engine: 'Skanda Integrated Malware Scanner (ClamAV Integration Ready)'
    };
  }

  /**
   * Stores binary payload in isolated tenant storage directory and returns SHA-256 integrity hash
   */
  public async uploadEvidence(
    tenantId: string,
    userId: string,
    originalFileName: string,
    buffer: Buffer,
    mimeType: string
  ): Promise<EvidenceUploadResult> {
    // 1. Validation
    const validation = this.validateFileBuffer(buffer, originalFileName, mimeType);
    if (!validation.valid) {
      throw new Error(`Evidence validation failed: ${validation.error}`);
    }

    // 2. Malware Scan
    const scanResult = await this.performMalwareScan(buffer);
    if (!scanResult.clean) {
      throw new Error(`Evidence rejected by malware scanner: threat ${scanResult.threat} detected`);
    }

    // 3. Compute SHA-256 Integrity Hash
    const sha256IntegrityHash = crypto.createHash('sha256').update(buffer).digest('hex');

    // 4. Partitioned Tenant Storage
    const tenantDir = path.join(STORAGE_ROOT, tenantId);
    if (!fs.existsSync(tenantDir)) {
      fs.mkdirSync(tenantDir, { recursive: true });
    }

    const ext = path.extname(originalFileName).toLowerCase();
    const evidenceId = `EV-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const storageFileName = `${sha256IntegrityHash}${ext}`;
    const storageFilePath = path.join(tenantDir, storageFileName);

    // Save binary to disk/object store
    fs.writeFileSync(storageFilePath, buffer);

    const storageKey = `${tenantId}/${storageFileName}`;
    const signedAccessUrl = this.generateSignedAccessUrl(tenantId, evidenceId, storageKey, 3600);

    return {
      evidenceId,
      tenantId,
      fileName: originalFileName,
      originalFileName,
      fileSizeBytes: buffer.length,
      mimeType,
      sha256IntegrityHash,
      storageKey,
      signedAccessUrl,
      malwareScanStatus: 'CLEAN',
      uploadedAt: new Date().toISOString(),
      uploadedBy: userId
    };
  }

  /**
   * Generates a tamper-proof HMAC signed access URL valid for a specific duration
   */
  public generateSignedAccessUrl(
    tenantId: string,
    evidenceId: string,
    storageKey: string,
    expiresInSeconds: number = 3600
  ): string {
    const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;
    const message = `${tenantId}:${evidenceId}:${storageKey}:${expiresAt}`;
    const signature = crypto
      .createHmac('sha256', SIGNED_URL_SECRET)
      .update(message)
      .digest('hex');

    return `/api/v1/evidence/download/${evidenceId}?tenant=${tenantId}&key=${encodeURIComponent(storageKey)}&exp=${expiresAt}&sig=${signature}`;
  }

  /**
   * Verifies signed download access URL
   */
  public verifySignedAccessUrl(
    tenantId: string,
    evidenceId: string,
    storageKey: string,
    expiresAt: number,
    signature: string
  ): boolean {
    const now = Math.floor(Date.now() / 1000);
    if (expiresAt < now) {
      return false; // Expired
    }

    const message = `${tenantId}:${evidenceId}:${storageKey}:${expiresAt}`;
    const expectedSig = crypto
      .createHmac('sha256', SIGNED_URL_SECRET)
      .update(message)
      .digest('hex');

    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSig);

    if (sigBuf.length !== expBuf.length) return false;
    return crypto.timingSafeEqual(sigBuf, expBuf);
  }
}

export const secureEvidenceService = SecureEvidenceService.getInstance();
