/**
 * Immutable Forensic Audit Trail Types for MAS-TRM Incident Simulation
 * Fulfills MAS Technology Risk Management Guidelines (Nov 2021) Section 12 & MAS Notice 644 Paragraph 4
 */

export type MASAuditActionType =
  | 'INCIDENT_INITIALIZED'
  | 'INCIDENT_SIMULATION_LAUNCHED'
  | 'USER_PARAMETER_UPDATE'
  | 'SEVERITY_RECLASSIFIED'
  | 'MILESTONE_STATUS_UPDATE'
  | 'ONE_HOUR_NOTICE_DISPATCHED'
  | 'CONTAINMENT_ATTESTATION'
  | 'FORENSIC_STAGE_UPDATE'
  | 'RCA_14D_SUBMITTED'
  | 'OFFICER_LOG_ENTRY'
  | 'SLA_ALERT_TRIGGERED'
  | 'REGULATORY_EXPORT'
  | 'CHAIN_INTEGRITY_VERIFIED';

export type MASAuditCategory =
  | 'LIFECYCLE'
  | 'MILESTONE'
  | 'USER_CHANGE'
  | 'DISPATCH'
  | 'FORENSIC'
  | 'OFFICER_NOTE'
  | 'SLA_ALERT'
  | 'COMPLIANCE_EXPORT';

export interface MASAuditFieldDiff {
  fieldName: string;
  fieldLabel: string;
  oldValue: string | number | boolean | null | undefined;
  newValue: string | number | boolean | null | undefined;
}

export interface MASAuditActor {
  userId: string;
  name: string;
  role: string;
  email: string;
  ipAddress: string;
  terminalId: string;
}

export interface MASIncidentAuditBlock {
  sequenceNumber: number;
  blockId: string;
  incidentId: string;
  incidentRef: string;
  timestamp: string; // ISO 8601 UTC
  localTimestampSGT: string; // e.g. "14 Sep 2026, 17:34:12 SGT (UTC+8)"
  actionType: MASAuditActionType;
  category: MASAuditCategory;
  title: string;
  description: string;
  actor: MASAuditActor;
  statutoryClause: string;
  diffs?: MASAuditFieldDiff[];
  metadata?: Record<string, any>;
  previousHash: string; // SHA-256 of previous block
  payloadDigest: string; // SHA-256 of raw canonical block payload
  blockHash: string; // SHA-256(previousHash + payloadDigest)
  digitalSignature: string; // Cryptographic attestation signature
  verified: boolean;
}

export interface MASAuditVerificationResult {
  isValid: boolean;
  totalBlocks: number;
  verifiedBlocks: number;
  tamperedBlocks: number;
  genesisTimestamp: string;
  latestBlockTimestamp: string;
  merkleRoot: string;
  checkedAt: string;
  brokenBlockIndex?: number;
  message: string;
}

export interface MASAuditFilterOptions {
  category: 'ALL' | MASAuditCategory;
  incidentId: string;
  searchQuery: string;
  startDate?: string;
  endDate?: string;
}
