// ============================================================================
// SKANDA ENTERPRISE GRC: REGULATORY SOURCE ADAPTER INTERFACE
// Path: server/services/regulatory/RegulatorySourceAdapter.ts
//
// Phase 23: Abstraction for Official Regulatory Sources & Document Ingestion
// Prioritizes official regulatory portals with cryptographic provenance
// ============================================================================

import {
  RegulatoryAuthority,
  RegulatoryNotice360,
  RegulatoryVersion,
  RegulatorySourceMetadata
} from '../../../src/types/masRegulatoryIntelligenceTypes';

export interface RegulatorySourceAdapter {
  readonly sourceId: string;
  readonly authority: RegulatoryAuthority;
  readonly authorityName: string;
  readonly baseUrl: string;

  /**
   * Retrieves all official regulatory notices, circulars, and consultations
   */
  fetchListings(): Promise<RegulatoryNotice360[]>;

  /**
   * Retrieves official publication document metadata and version specifics
   */
  fetchDocument(noticeNumber: string, versionId?: string): Promise<{
    version: RegulatoryVersion;
    rawText: string;
    documentSha256: string;
    retrievedAt: string;
  } | null>;

  /**
   * Retrieves source synchronization metadata and connectivity status
   */
  fetchMetadata(): Promise<RegulatorySourceMetadata>;

  /**
   * Detects upstream publication updates and changes against stored hashes
   */
  detectChanges(knownDocumentHashes: Map<string, string>): Promise<{
    updatedNotices: string[];
    newNotices: string[];
    unchangedCount: number;
  }>;

  /**
   * Calculates cryptographic SHA-256 hash of document payload for WORM provenance
   */
  calculateDocumentHash(content: string): string;
}
