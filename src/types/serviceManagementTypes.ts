/**
 * SKANDA ENTERPRISE GRC: SERVICE MANAGEMENT, CUSTOMER SUPPORT & SLA OPERATING SYSTEM
 * Canonical Types Definition — Phase 18
 */

export type SupportCaseLifecycle =
  | 'NEW'
  | 'TRIAGED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'PENDING_CUSTOMER'
  | 'PENDING_INTERNAL'
  | 'RESOLVED'
  | 'CUSTOMER_CONFIRMATION'
  | 'CLOSED'
  | 'ESCALATED'
  | 'REOPENED'
  | 'CANCELLED';

export type CaseType =
  | 'INCIDENT'
  | 'SERVICE_REQUEST'
  | 'QUESTION'
  | 'ACCESS_REQUEST'
  | 'SECURITY_INCIDENT'
  | 'PRIVACY_REQUEST'
  | 'COMPLIANCE_SUPPORT'
  | 'INTEGRATION_FAILURE'
  | 'BILLING_QUERY'
  | 'CONTRACT_QUERY'
  | 'DATA_RESIDENCY_REQUEST'
  | 'FEATURE_REQUEST';

export type SupportPriority = 'P1' | 'P2' | 'P3' | 'P4';

export type SupportQueueId =
  | 'TECHNICAL_SUPPORT'
  | 'SECURITY'
  | 'PRIVACY'
  | 'GRC'
  | 'BILLING'
  | 'INTEGRATIONS'
  | 'PLATFORM'
  | 'CUSTOMER_SUCCESS';

export type EscalationLevel =
  | 'LEVEL_1'
  | 'LEVEL_2'
  | 'LEVEL_3'
  | 'SECURITY'
  | 'PRIVACY'
  | 'GRC'
  | 'EXECUTIVE';

export type SLAStatus =
  | 'SLA_REMAINING'
  | 'SLA_WARNING'
  | 'SLA_BREACHED'
  | 'SLA_PAUSED'
  | 'SLA_MET';

export interface SLATargets {
  firstResponseMins: number;
  acknowledgementMins: number;
  resolutionMins: number;
  updateFrequencyMins: number;
  confirmationMins: number;
}

export interface SLATimerRecord {
  targetMinutes: number;
  elapsedMinutes: number;
  remainingMinutes: number;
  startedAt: string;
  pausedAt?: string;
  pauseReason?: string;
  status: SLAStatus;
  isWarningTriggered: boolean;
  isBreached: boolean;
  breachedAt?: string;
  metAt?: string;
}

export interface CaseComment {
  id: string;
  caseId: string;
  tenantId: string;
  actorEmail: string;
  actorName: string;
  actorRole: string;
  isInternalOnly: boolean;
  body: string;
  createdAt: string;
  attachments?: {
    id: string;
    filename: string;
    filesize: number;
    sha256Hash: string;
    uploadedAt: string;
  }[];
}

export interface CustomerConfirmationRecord {
  status: 'PENDING' | 'CONFIRMED' | 'DISPUTED_REOPENED' | 'AUTO_CLOSED';
  confirmedBy?: string;
  confirmedAt?: string;
  csatRating?: number; // 1 to 5
  feedback?: string;
  autoCloseDeadline?: string;
}

export interface PostIncidentReviewRecord {
  id: string;
  incidentId: string;
  tenantId: string;
  title: string;
  rootCause: string;
  contributingFactors: string[];
  timeline: {
    timestamp: string;
    event: string;
    actor: string;
  }[];
  detectionMethod: string;
  containmentDurationMins: number;
  recoveryDurationMins: number;
  customerImpactSummary: string;
  securityImpactSummary?: string;
  controlGaps: string[];
  correctiveActionIds: string[]; // Linked CAPAs
  lessonsLearned: string[];
  status: 'DRAFT' | 'APPROVED' | 'PUBLISHED';
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProblemRecord {
  id: string;
  problemNumber: string;
  tenantId?: string; // Global platform problem or tenant specific
  title: string;
  description: string;
  category: string;
  affectedServiceIds: string[];
  affectedTenantIds: string[];
  linkedIncidentIds: string[];
  rootCauseAnalysis: string;
  workaround?: string;
  permanentFix?: string;
  linkedRiskIds: string[];
  linkedControlIds: string[];
  linkedCapaIds: string[];
  status: 'OPEN' | 'UNDER_INVESTIGATION' | 'KNOWN_ERROR' | 'RESOLVED' | 'CLOSED';
  assignedTeam: string;
  ownerEmail: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export type KnowledgeArticleType =
  | 'HOW_TO'
  | 'TROUBLESHOOTING'
  | 'FAQ'
  | 'SECURITY_ADVISORY'
  | 'COMPLIANCE_GUIDANCE'
  | 'INTEGRATION_GUIDE'
  | 'POLICY_GUIDANCE'
  | 'POST_INCIDENT_LESSON';

export interface KnowledgeArticle {
  id: string;
  articleNumber: string;
  title: string;
  content: string;
  summary: string;
  type: KnowledgeArticleType;
  category: string;
  status: 'DRAFT' | 'REVIEW' | 'APPROVED' | 'PUBLISHED' | 'SUPERSEDED' | 'ARCHIVED';
  authorEmail: string;
  approvedBy?: string;
  approvedAt?: string;
  reviewDate?: string;
  version: string;
  relatedControlIds: string[];
  relatedFrameworks: string[];
  relatedCaseIds: string[];
  tags: string[];
  viewCount: number;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
}

export type ServiceCriticality = 'MISSION_CRITICAL' | 'BUSINESS_CRITICAL' | 'STANDARD' | 'SUPPORTING';

export type ServiceHealthStatus = 'OPERATIONAL' | 'DEGRADED' | 'PARTIAL_OUTAGE' | 'MAJOR_OUTAGE' | 'MAINTENANCE';

export interface ServiceCatalogItem {
  id: string;
  serviceCode: string;
  name: string;
  description: string;
  category: string;
  criticality: ServiceCriticality;
  ownerEmail: string;
  defaultSlaHours: number;
  dependencies: string[];
  healthStatus: ServiceHealthStatus;
  healthMessage?: string;
  activeIncidentsCount: number;
  lastHealthCheckAt: string;
}

export interface ServiceHealthEvent {
  id: string;
  serviceId: string;
  timestamp: string;
  previousStatus: ServiceHealthStatus;
  newStatus: ServiceHealthStatus;
  reason: string;
  affectedTenants: string[];
  incidentId?: string;
}

export interface PrivacyRequestDetails {
  requestType: 'DSAR_ACCESS' | 'DELETION_ERASURE' | 'DATA_PORTABILITY' | 'CORRECTION' | 'CONSENT_WITHDRAWAL' | 'PRIVACY_BREACH';
  dataSubjectEmail: string;
  identityVerified: boolean;
  jurisdiction: 'EU_GDPR' | 'SG_PDPA' | 'IN_DPDPA' | 'US_CCPA' | 'GLOBAL';
  statutoryDeadline: string;
  dpoAssignedEmail: string;
  completionProofHash?: string;
}

export interface SecurityIncidentDetails {
  severity: 'CRITICAL_P1' | 'HIGH_P2' | 'MEDIUM_P3' | 'LOW_P4';
  threatVectors: string[];
  affectedAssets: string[];
  affectedDataClass: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED_PII';
  containmentStatus: 'DETECTED' | 'CONTAINING' | 'CONTAINED' | 'ERADICATED' | 'RECOVERED';
  attackIndicators: string[];
  statutoryBreachNotificationRequired: boolean;
  statutoryReportedAt?: string;
}

export interface EnterpriseSupportCase {
  id: string;
  caseNumber: string;
  tenantId: string;
  organizationName: string;
  type: CaseType;
  priority: SupportPriority;
  lifecycle: SupportCaseLifecycle;
  queue: SupportQueueId;
  escalationLevel: EscalationLevel;
  subject: string;
  description: string;
  affectedServiceId: string;
  affectedServiceCode: string;
  affectedUserCount: number;
  customerTier: 'STARTER' | 'GROWTH' | 'ENTERPRISE' | 'APEX_GLOBAL';
  contractualSlaHours: number;
  
  // Assigned Responders
  requesterEmail: string;
  requesterName: string;
  assignedAgentEmail?: string;
  assignedAgentName?: string;
  incidentCommanderEmail?: string;

  // Timers & SLAs
  firstResponseSla: SLATimerRecord;
  resolutionSla: SLATimerRecord;
  
  // GRC & Assurance Linkages
  relatedRiskIds: string[];
  relatedControlIds: string[];
  relatedEvidenceIds: string[];
  relatedCapaIds: string[];
  relatedFindingIds: string[];
  relatedFrameworks: string[];
  
  // Domain Specific Modules
  securityIncident?: SecurityIncidentDetails;
  privacyRequest?: PrivacyRequestDetails;
  
  // Communication & Confirmation
  comments: CaseComment[];
  resolutionNotes?: string;
  resolutionEvidenceHash?: string;
  customerConfirmation?: CustomerConfirmationRecord;
  pir?: PostIncidentReviewRecord;
  
  // Health & Renewal Flags
  isCustomerHealthImpacted: boolean;
  isRenewalRiskTriggered: boolean;
  nextBestActionRecommendation?: string;
  reopenCount: number;

  // Metadata
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
  auditProvenanceHash: string;
}

export interface SupportQueueMetrics {
  queueId: SupportQueueId;
  name: string;
  leadEmail: string;
  openCasesCount: number;
  p1Count: number;
  p2Count: number;
  slaBreachedCount: number;
  averageResolutionTimeHours: number;
  workloadScore: number; // 0-100
}

export interface SupportPlatformMetrics {
  totalOpenCases: number;
  p1ActiveCount: number;
  p2ActiveCount: number;
  slaComplianceRate: number; // Percentage 0-100
  firstResponseMetRate: number;
  resolutionMetRate: number;
  totalResolved30Days: number;
  averageCsatRating: number; // 1-5
  recurringProblemsCount: number;
  activeServiceDegradations: number;
}
