export type RemediationSourceDomain =
  | 'REGULATORY_GAP'     // MAS TRM, ISO 27001, ISO 42001, SOC 2 non-conformities
  | 'PERIMETER_BRAND'    // BrandGuard, domain squatting, typosquatting, logo abuse, phishing
  | 'VULNERABILITY'      // CVEs, automated scanners, cloud misconfigurations, Dependabot
  | 'INTERNAL_AUDIT'     // Internal audit working paper non-conformities
  | 'EXTERNAL_AUDIT'     // Stage 1 / Stage 2 external certification findings
  | 'POLICY_DRIFT'       // Automated drift detection, shelfware SOP alerts
  | 'THIRD_PARTY_RISK'  // Vendor security questionnaires, critical supplier deficiencies
  | 'Regulatory Gap'
  | 'Brand & Perimeter Infringement'
  | 'Vulnerability Management'
  | 'Third-Party / Vendor Finding'
  | 'Continuous Compliance Drift';

export type RemediationSeverity =
  | 'CRITICAL'
  | 'HIGH'
  | 'MEDIUM'
  | 'LOW'
  | 'Critical'
  | 'High'
  | 'Medium'
  | 'Low';

export type RemediationWorkflowStatus =
  | 'NEW_TRIAGE'
  | 'ASSIGNED'
  | 'REMEDIATION_IN_PROGRESS'
  | 'COMPENSATING_CONTROL_ACTIVE'
  | 'EXCEPTION_REQUESTED'
  | 'EXCEPTION_APPROVED'
  | 'AUDIT_VERIFICATION_PENDING'
  | 'CLOSED_VERIFIED'
  | 'OVERDUE_ESCALATED'
  | 'Remediation In Progress'
  | 'Pending Auditor Verification'
  | 'Closed & Verified'
  | 'Risk Accepted / Waived'
  | 'Under Investigation'
  | 'Compensating Control Active'
  | 'Risk Exception Requested'
  | 'Open';

export type RemediationStatus = RemediationWorkflowStatus;

export type RemediationSLAStatus =
  | 'Within SLA'
  | 'At Risk (<5d)'
  | 'SLA Breached'
  | 'Exception Granted'
  | string;

export type RemediationResolutionType =
  | 'DIRECT_REMEDIATION'
  | 'COMPENSATING_CONTROL'
  | 'RISK_EXCEPTION_WAIVER'
  | 'FALSE_POSITIVE'
  | 'UPSTREAM_VENDOR_FIX';

export interface RemediationMilestoneItem {
  id: string;
  title: string;
  targetDate: string;
  completedDate?: string;
  completedAt?: string;
  isCompleted?: boolean;
  completed?: boolean;
  assignedEngineer?: string;
  owner?: string;
}

export interface CompensatingControlVerification {
  id: string;
  title?: string;
  controlName?: string;
  controlCode: string;
  frameworkRef?: string;
  description: string;
  verificationEvidenceHash?: string;
  evidenceTitle?: string;
  evidenceArtifactRef?: string;
  testedBy?: string;
  verifiedBy?: string;
  testedAt?: string;
  verificationDate?: string;
  effectivenessScore: number; // 0 - 100%
  status?: 'TESTED_EFFECTIVE' | 'TESTED_PARTIAL' | 'FAILED_TEST' | 'PENDING_EVALUATION' | string;
  retestDueDays?: number;
}

export interface RiskExceptionWaiverRequest {
  id: string;
  waiverCode: string;
  requestedBy: string;
  requesterRole?: string;
  department?: string;
  businessJustification: string;
  inherentRisk?: RemediationSeverity;
  residualRisk?: 'LOW' | 'MEDIUM' | 'HIGH';
  residualRiskLevel?: string;
  compensatingControlsRationale?: string;
  requestedDurationDays?: number; // e.g. 30, 60, 90 days
  waiverDurationDays?: number;
  expirationDate?: string;
  expiryDate?: string;
  requestedDate?: string;
  executiveApprover?: string;
  approvedBy?: string;
  approvalDate?: string;
  approvalStatus: 'PENDING_CISO_REVIEW' | 'APPROVED' | 'REJECTED' | 'EXPIRED' | string;
  approvedAt?: string;
  conditionsOfApproval?: string[];
  conditions?: string[];
  retestIntervalWeeks?: number;
}

export interface RemediationAuditSignOff {
  signedOffBy?: string;
  auditorName?: string;
  auditorRole?: string;
  auditOrganization?: string;
  role?: string;
  signatureTimestamp: string;
  auditNotes?: string;
  notes?: string;
  cryptographicSignature?: string;
  evidenceVerifiedIds?: string[];
  verificationEvidenceRefs?: string[];
  closureAccepted?: boolean;
  conclusion?: string;
}

export interface UnifiedRemediationItem {
  id: string;
  tenantId: string;
  remediationCode: string; // e.g. REM-2026-001
  title: string;
  description?: string;
  sourceDomain: RemediationSourceDomain;
  sourceRefCode?: string; // e.g. "GAP-2026-01", "BF-2026-001", "MAS-N655-4.1", "A.5.15"
  sourceFindingId?: string;
  sourceModule?: string;
  sourceEntityId?: string; // foreign key to finding / brand finding / risk / control
  frameworksAffected?: string[]; // e.g. ["MAS TRM", "ISO/IEC 27001:2022", "SOC 2 Type II"]
  linkedFrameworks?: string[];
  severity: RemediationSeverity;
  status: RemediationWorkflowStatus;
  
  // SLA & Deadlines
  createdAt: string;
  slaDaysTotal?: number;
  slaDeadlineHours?: number;
  slaDueDate?: string;
  targetResolutionDate?: string;
  isBreached: boolean;
  daysRemainingOrOverdue: number;
  slaStatus?: string;

  // Assignment & Ownership
  assignedOwner?: string;
  ownerName?: string;
  assignedOwnerEmail?: string;
  ownerEmail?: string;
  department: string;
  technicalLead?: string;

  // Problem & Root Cause
  threatOrGapSummary?: string;
  rootCauseAnalysis?: string;
  technicalDetails?: string;
  targetResourceOrDomain?: string;
  affectedAssets?: string[];
  linkedControls?: string[];

  // Action & Corrective Steps
  correctiveActionPlan?: string;
  proposedActionPlan?: string;
  preventiveActionPlan?: string;
  remediationProgressPct?: number;
  milestones: RemediationMilestoneItem[];

  // Compensating Controls & Risk Exception
  compensatingControls?: CompensatingControlVerification[];
  activeWaiver?: RiskExceptionWaiverRequest;
  waiverRequest?: RiskExceptionWaiverRequest;

  // Verification & Audit Sign-Off
  auditSignOff?: RemediationAuditSignOff;
  evidenceDocumentIds?: string[];
  history?: any[];
  retestResult?: {
    lastRetestAt: string;
    passed: boolean;
    outputSummary: string;
  };

  tags?: string[];
}
