// Global ISO Accreditation & Certification Authority Registry Types
// Designed for Enterprise GRC SaaS — Multi-Tenant, Temporal, Deterministic Verification

export type CooperationType = 'GLOBAL' | 'REGIONAL' | 'NATIONAL_ASSOCIATION';

export interface GlobalAccreditationCooperation {
  id: string;
  code: string; // e.g. 'GLOBAL-ACI', 'APAC', 'EA', 'IAAC', 'AFRAC', 'ARAC', 'SADCA'
  name: string;
  type: CooperationType;
  region: string;
  headquarters: string;
  website: string;
  establishedYear: number;
  recognitionArrangementName: string; // e.g. 'IAF MLA / Global ACI Multilateral Recognition Arrangement'
  signatoriesCount: number;
  coverageCountries: string[];
  status: 'ACTIVE' | 'TRANSITIONING' | 'HISTORICAL';
  successorEntity?: string;
  sourceUrl: string;
  lastVerifiedDate: string;
  confidenceScore: number; // 0-100
  notes: string;
}

export type RecognitionStatus = 'MLA_SIGNATORY' | 'MRA_SIGNATORY' | 'ASSOCIATE' | 'SUSPENDED' | 'NON_SIGNATORY';

export interface NationalAccreditationBody {
  id: string;
  code: string; // e.g. 'NABCB', 'UKAS', 'ANAB', 'DAkkS', 'COFRAC', 'RvA', 'ACCREDIA', 'JAS-ANZ', 'CNAS', 'JAB', 'SAC', 'SANAS'
  legalName: string;
  brandName: string;
  country: string;
  countryCode: string; // ISO 3166-1 alpha-2 / alpha-3
  region: string;
  regionalBodyCode: string; // 'APAC', 'EA', 'IAAC', 'AFRAC', 'ARAC'
  globalCooperationCode: string; // 'GLOBAL-ACI'
  recognitionStatus: RecognitionStatus;
  signatorySince: string;
  website: string;
  officialDirectoryUrl: string;
  accreditedSchemes: string[]; // ['ISMS', 'PIMS', 'AIMS', 'QMS', 'EMS', 'BCMS', 'ITSMS', 'FSMS']
  governingStandards: string[]; // ['ISO/IEC 17021-1:2015', 'ISO/IEC 27006-1:2024', 'ISO/IEC TS 27006-2:2021']
  peerEvaluatedBy: string; // e.g. 'APAC Peer Evaluation Team / EA MLA Peer Review'
  lastPeerReviewDate: string;
  nextPeerReviewDate: string;
  status: 'ACTIVE' | 'UNDER_REVIEW' | 'SUSPENDED';
  sourceReference: {
    sourceOrg: string;
    url: string;
    documentTitle: string;
    lastRetrieved: string;
    confidence: 'HIGH_OFFICIAL' | 'VERIFIED_INDIRECT' | 'MANUAL_AUDIT';
  };
}

export type CertificationBodyStatus = 'ACTIVE_ACCREDITED' | 'SUSPENDED' | 'WITHDRAWN' | 'UNACCREDITED_OFFERING';

export interface CertificationBodyAccreditation {
  id: string;
  accreditationBodyCode: string; // 'NABCB', 'UKAS', 'ANAB', 'DAkkS', etc.
  accreditationNumber: string; // e.g. 'IS001', '0003', 'CB-MS-2022'
  initialAccreditationDate: string;
  currentCycleStartDate: string;
  validUntil: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'WITHDRAWN' | 'EXPIRED';
  schemes: string[]; // ['ISMS', 'PIMS', 'AIMS', 'QMS', 'EMS', 'BCMS']
  standardsAccredited: string[]; // ['ISO/IEC 27001:2022', 'ISO/IEC 27701:2019', 'ISO/IEC 42001:2023', 'ISO 9001:2015', 'ISO 22301:2019']
  iafSectorCodes: number[]; // e.g. [33, 28, 35] (33 = Information Technology)
  geographicScope: 'GLOBAL' | 'REGIONAL' | 'COUNTRY_SPECIFIC';
  officialScopeDocumentUrl: string;
  scopeHashSHA256: string;
  lastAuditedByAB: string;
}

export interface CertificationBody {
  id: string;
  code: string; // 'BSI', 'TUV_SUD', 'TUV_RHEINLAND', 'DNV', 'BUREAU_VERITAS', 'SGS', 'INTERTEK', 'LRQA', 'DEKRA', 'IRCLASS', 'STQC', 'CONTROLASE'
  legalName: string;
  brandName: string;
  headquartersCountry: string;
  headquartersCity: string;
  website: string;
  verificationPortalUrl?: string; // CB Certificate Search Directory URL
  countriesServed: string[];
  globalEmployees?: number;
  status: CertificationBodyStatus;
  accreditations: CertificationBodyAccreditation[];
  supportedCertifiableStandards: string[]; // ISO standards they offer audits for
  primaryContactEmail: string;
  isIAFCertSearchListed: boolean;
  notes: string;
  sourceReference: {
    sourceOrg: string;
    url: string;
    lastVerified: string;
    confidence: 'AUTHORITATIVE_REGISTRY' | 'CONFIRMED_AB_DIRECTORY' | 'PENDING_CONFIRMATION';
  };
}

export interface ISOStandardMaster {
  id: string;
  standardNumber: string; // 'ISO/IEC 27001:2022'
  family: string; // 'ISO/IEC 27000 Series (Information Security)'
  shortCode: string; // 'ISO 27001'
  title: string;
  edition: string;
  publicationYear: number;
  isCertifiable: boolean; // true for 27001, 9001, 22301, 42001; false for 27002, 27005 (guidelines)
  requiresAccreditation: boolean;
  applicableAccreditationStandard: string; // 'ISO/IEC 17021-1:2015'
  schemeSpecificRequirementStandard?: string; // 'ISO/IEC 27006-1:2024'
  accreditationSchemeCode: string; // 'ISMS', 'PIMS', 'AIMS', 'QMS', 'BCMS'
  mandatoryClauses: string[];
  controlsCount?: number; // e.g. 93 controls for 27001:2022
  transitionDeadline?: string; // e.g. '2025-10-31' for 2013 -> 2022 transition
  predecessorVersion?: string;
  successorVersion?: string;
  status: 'CURRENT' | 'TRANSITION_PERIOD' | 'SUPERSEDED' | 'WITHDRAWN';
}

export interface IAFCodeMaster {
  code: number;
  name: string;
  description: string;
  technicalRiskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  commonISMSRelevance: boolean;
}

export type CertificateTrustStatus = 
  | 'VERIFIED_ACCREDITED'
  | 'VERIFIED_NON_ACCREDITED'
  | 'OUTSIDE_ACCREDITED_SCOPE'
  | 'EXPIRED'
  | 'SUSPENDED'
  | 'WITHDRAWN'
  | 'INVALID'
  | 'REQUIRES_MANUAL_VERIFICATION';

export interface CertificateVerificationRequest {
  certificateNumber: string;
  certifiedOrganization: string;
  certificationBodyCode: string;
  accreditationBodyCode?: string;
  standardNumber: string;
  issueDate: string;
  expiryDate: string;
  iafCode?: number;
  country: string;
  scopeSummary?: string;
}

export interface VerificationCheckStep {
  step: string;
  description: string;
  passed: boolean | 'UNKNOWN';
  detail: string;
  evidenceSource?: string;
}

export interface CertificateVerificationResult {
  id: string;
  timestamp: string;
  request: CertificateVerificationRequest;
  trustStatus: CertificateTrustStatus;
  trustScore: number; // 0-100
  badgeColor: string; // Tailwind class
  certificationBodyFound: boolean;
  certificationBodyName: string;
  accreditationBodyFound: boolean;
  accreditationBodyName: string;
  isAccreditedForStandard: boolean | 'UNKNOWN';
  isWithinDateValidity: boolean;
  isRecognitionArrangementValid: boolean;
  isIAFCodeInScope: boolean | 'UNKNOWN';
  auditTrailHash: string;
  verificationSteps: VerificationCheckStep[];
  auditorSummary: string;
  recommendedAction: string;
  authoritativeSources: string[];
}
