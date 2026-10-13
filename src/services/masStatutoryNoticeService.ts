// Authoritative Service for MAS Statutory Notice Mandates (MAS Notice 644/655, PSN01, Notice 126, CMG-N02)
// Distinguishes legally binding statutory mandates from supervisory guidelines.

import { MASRequirementAssessmentRecord, RegulatoryRequirement } from '../types/regulatoryTypes';

export interface StatutoryNoticePillar {
  id: string;
  pillarNumber: number;
  title: string;
  shortCode: string;
  legalBasis: string;
  enforceability: 'STATUTORY_MANDATE';
  penaltiesForBreach: string;
  keyRequirementsSummary: string;
  primaryReqCode: string;
  mappedReqCodes: string[];
  primaryChecklistCode: string;
  mappedChecklistCodes: string[];
  mandatoryThreshold: string;
}

export const STATUTORY_NOTICE_PILLARS: StatutoryNoticePillar[] = [
  {
    id: 'PILLAR-MFA',
    pillarNumber: 1,
    title: 'Multi-Factor Authentication (MFA)',
    shortCode: 'NOTICE-MFA',
    legalBasis: 'MAS Notice 644/655 Clause 3; Notice PSN01 Clause 4; Notice 126 Clause 3',
    enforceability: 'STATUTORY_MANDATE',
    penaltiesForBreach: 'Statutory direction under Section 58 Banking Act / Section 85 PSA; financial penalties up to S$1,000,000 and supervisory capital add-ons.',
    keyRequirementsSummary: 'Mandatory MFA across all system administrator accounts, remote access connections, and critical customer internet-facing transactions. Single-factor or SMS OTP for admin access is strictly non-compliant.',
    primaryReqCode: 'MAS-TRM-9.1',
    mappedReqCodes: ['MAS-TRM-9.1', 'MAS-TRM-11.1', 'MAS-TRM-14.2'],
    primaryChecklistCode: 'CHK-D4-03',
    mappedChecklistCodes: ['CHK-D4-03', 'D4.3', 'TASK-MAS-9.1', '9.1.1'],
    mandatoryThreshold: '100% Enforced - Zero Exception Tolerance'
  },
  {
    id: 'PILLAR-PRIV-ACCESS',
    pillarNumber: 2,
    title: 'Privilege Access Control & Dual Authorization',
    shortCode: 'NOTICE-PRIV-ACCESS',
    legalBasis: 'MAS Notice 644/655 Clause 4; Notice PSN01 Clause 5',
    enforceability: 'STATUTORY_MANDATE',
    penaltiesForBreach: 'Supervisory investigation, mandatory external audit appointment under Section 58, personal liability for compliance officers.',
    keyRequirementsSummary: 'Strict access controls, separation of duties, dual authorization for critical administrative operations, automated privileged session recording, and credential vaulting.',
    primaryReqCode: 'MAS-TRM-9.2',
    mappedReqCodes: ['MAS-TRM-9.2', 'MAS-TRM-11.2'],
    primaryChecklistCode: 'CHK-D4-07',
    mappedChecklistCodes: ['CHK-D4-07', 'D4.7', 'TASK-MAS-9.2', '9.2.1'],
    mandatoryThreshold: 'Vaulted & Dual Authorized for all Critical Systems'
  },
  {
    id: 'PILLAR-ENCRYPT',
    pillarNumber: 3,
    title: 'Strong Cryptography & Customer Data Protection',
    shortCode: 'NOTICE-ENCRYPT',
    legalBasis: 'MAS Notice 644/655 Clause 5; Notice PSN01 Clause 6; Notice 126 Clause 4',
    enforceability: 'STATUTORY_MANDATE',
    penaltiesForBreach: 'Statutory penalties under Banking Act; joint regulatory enforcement by MAS and PDPC for sensitive data exposure.',
    keyRequirementsSummary: 'End-to-end encryption for customer sensitive data and payment credentials in transit (TLS 1.2+ / TLS 1.3) and at rest (AES-256) with HSM-backed key management.',
    primaryReqCode: 'MAS-TRM-10.2',
    mappedReqCodes: ['MAS-TRM-10.2', 'MAS-TRM-11.1', 'MAS-TRM-12.1', 'MAS-TRM-12.2'],
    primaryChecklistCode: 'CHK-D6-05',
    mappedChecklistCodes: ['CHK-D6-05', 'D6.5', 'TASK-MAS-11.1', '11.1.1', 'TASK-MAS-12.1', '12.1.1'],
    mandatoryThreshold: 'AES-256 / TLS 1.3 with Hardware Key Management (HSM)'
  },
  {
    id: 'PILLAR-CIS-AVAIL',
    pillarNumber: 4,
    title: 'Critical System Availability (Max 4-Hour Annual Downtime)',
    shortCode: 'NOTICE-CIS-DOWNTIME',
    legalBasis: 'MAS Notice 644/655 Clause 6; Notice PSN01 Clause 7',
    enforceability: 'STATUTORY_MANDATE',
    penaltiesForBreach: 'Immediate supervisory review, potential suspension of business activities, public regulatory reprimand.',
    keyRequirementsSummary: 'Maximum cumulative unscheduled downtime for any Critical Information System (CIS) shall not exceed 4 hours in any rolling 12-month window.',
    primaryReqCode: 'MAS-TRM-8.1',
    mappedReqCodes: ['MAS-TRM-8.1'],
    primaryChecklistCode: 'CHK-D7-08',
    mappedChecklistCodes: ['CHK-D7-08', 'D7.8', 'TASK-MAS-8.1', '8.1.1'],
    mandatoryThreshold: 'Rolling 12-Month Outage <= 4.0 Hours Total'
  },
  {
    id: 'PILLAR-RTO-RPO',
    pillarNumber: 5,
    title: 'Recovery Objectives (RTO <= 4h, RPO <= 1h)',
    shortCode: 'NOTICE-RTO-RPO',
    legalBasis: 'MAS Notice 644/655 Clause 7; Notice PSN01 Clause 8; Notice 126 Clause 5',
    enforceability: 'STATUTORY_MANDATE',
    penaltiesForBreach: 'Formal direction to hold capital buffer against operational risk; mandatory remediation within 90 days.',
    keyRequirementsSummary: 'Recovery Time Objective (RTO) of max 4 hours and Recovery Point Objective (RPO) of max 1 hour for all Critical Information Systems, validated via annual switchover drills.',
    primaryReqCode: 'MAS-TRM-8.2',
    mappedReqCodes: ['MAS-TRM-8.2'],
    primaryChecklistCode: 'CHK-D7-03',
    mappedChecklistCodes: ['CHK-D7-03', 'D7.3', 'TASK-MAS-8.2', '8.2.1'],
    mandatoryThreshold: 'RTO <= 4 Hours, RPO <= 1 Hour validated in live drills'
  },
  {
    id: 'PILLAR-INCIDENT-NOTIF',
    pillarNumber: 6,
    title: '1-Hour Rapid Incident Notification & 14-Day Post-Incident Report',
    shortCode: 'NOTICE-INCIDENT-1H',
    legalBasis: 'MAS Notice 644/655 Clause 8; Notice PSN01 Clause 9; Notice 126 Clause 6',
    enforceability: 'STATUTORY_MANDATE',
    penaltiesForBreach: 'Severe regulatory censure, personal sanction on CEO/CISO, statutory fines for failure to disclose operational disruption.',
    keyRequirementsSummary: 'Notify MAS within 1 hour of discovering any critical system disruption or major cyber security incident. Submit a comprehensive root cause investigation report within 14 calendar days.',
    primaryReqCode: 'MAS-TRM-12.3',
    mappedReqCodes: ['MAS-TRM-12.3', 'MAS-TRM-14.1', 'MAS-TRM-14.2'],
    primaryChecklistCode: 'CHK-D9-07',
    mappedChecklistCodes: ['CHK-D9-07', 'D9.7', 'TASK-MAS-14.1', '14.1.1'],
    mandatoryThreshold: 'Notification <= 60 minutes; PIR <= 14 days'
  }
];

// The exact 6 primary requirement codes representing the 6 Statutory Notice Pillars
export const STATUTORY_PRIMARY_REQ_CODES = [
  'MAS-TRM-9.1',  // Pillar 1: MFA
  'MAS-TRM-9.2',  // Pillar 2: PAM
  'MAS-TRM-10.2', // Pillar 3: Encryption
  'MAS-TRM-8.1',  // Pillar 4: Availability <= 4h Downtime
  'MAS-TRM-8.2',  // Pillar 5: RTO <= 4h, RPO <= 1h
  'MAS-TRM-12.3'  // Pillar 6: 1-Hour Incident Notification
];

// Helper: Check if a requirement code belongs to the 6 Statutory Notice Mandates
export const isStatutoryNoticeRequirement = (reqCode: string, title?: string): boolean => {
  const code = (reqCode || '').toUpperCase().trim();

  // First priority: Exact match against the 6 primary requirements
  if (STATUTORY_PRIMARY_REQ_CODES.includes(code)) {
    return true;
  }

  // Check mapped requirement codes
  for (const pillar of STATUTORY_NOTICE_PILLARS) {
    if (pillar.mappedReqCodes.includes(code)) {
      return true;
    }
  }

  // Fallback for title matching if code prefix differs
  if (title) {
    const t = title.toLowerCase();
    if (
      t.includes('multi-factor authentication') ||
      t.includes('privileged access management (pam)') ||
      t.includes('cryptographic key management & hardware security modules') ||
      t.includes('single point of failure (spof) elimination') ||
      t.includes('rto <= 4h, rpo <= 1h') ||
      t.includes('mandatory 1-hour notification')
    ) {
      return true;
    }
  }

  return false;
};

// Helper: Get matching pillar metadata for an assessment
export const getStatutoryNoticePillar = (reqCode: string, title?: string): StatutoryNoticePillar | null => {
  const code = (reqCode || '').toUpperCase().trim();
  
  // Exact primary code match
  const directPillar = STATUTORY_NOTICE_PILLARS.find(p => p.primaryReqCode === code);
  if (directPillar) return directPillar;

  // Secondary mapped codes
  for (const pillar of STATUTORY_NOTICE_PILLARS) {
    if (pillar.mappedReqCodes.includes(code)) {
      return pillar;
    }
  }

  // Title fallback
  if (title) {
    const t = title.toLowerCase();
    if (t.includes('mfa') || t.includes('multi-factor')) return STATUTORY_NOTICE_PILLARS[0];
    if (t.includes('pam') || t.includes('privileged access')) return STATUTORY_NOTICE_PILLARS[1];
    if (t.includes('cryptograph') || t.includes('hsm') || t.includes('encryption')) return STATUTORY_NOTICE_PILLARS[2];
    if (t.includes('spof') || t.includes('unscheduled downtime') || t.includes('system availability')) return STATUTORY_NOTICE_PILLARS[3];
    if (t.includes('rto') || t.includes('recoverab')) return STATUTORY_NOTICE_PILLARS[4];
    if (t.includes('1-hour') || t.includes('incident response plan')) return STATUTORY_NOTICE_PILLARS[5];
  }

  return null;
};

// Helper: Check if an assessment is a Severe Statutory Violation
export const isSevereStatutoryViolation = (status: string, reqCode: string, title?: string): boolean => {
  if (!isStatutoryNoticeRequirement(reqCode, title)) return false;
  const s = (status || '').toUpperCase();
  // Any non-compliant or partially compliant statutory requirement is a severe statutory violation
  return s !== 'COMPLIANT' && s !== 'NOT_APPLICABLE';
};

// Helper: Check if a checklist task belongs to the 6 Statutory Notice Mandates
export const isStatutoryNoticeTask = (task: {
  id?: string;
  taskCode?: string;
  title?: string;
  regulatoryRef?: string;
  mandatoryNoticeRef?: string;
}): boolean => {
  if (!task) return false;

  const id = (task.id || '').toUpperCase().trim();
  const code = (task.taskCode || '').toUpperCase().trim();
  const noticeRef = (task.mandatoryNoticeRef || '').toUpperCase().trim();
  const title = (task.title || '').toLowerCase();

  // Explicit mandatoryNoticeRef
  if (noticeRef.includes('NOTICE 644') || noticeRef.includes('NOTICE 655') || noticeRef.includes('NOTICE PSN01')) {
    return true;
  }

  // Match against mapped checklist codes across the 6 pillars
  for (const pillar of STATUTORY_NOTICE_PILLARS) {
    if (
      pillar.mappedChecklistCodes.some(
        c => id === c.toUpperCase() || code === c.toUpperCase()
      )
    ) {
      return true;
    }
  }

  // Check titles for statutory pillar keywords
  if (
    title.includes('multi-factor authentication (mfa)') ||
    title.includes('privileged access management (pam) deployment') ||
    title.includes('encryption standards (tls') ||
    title.includes('max 4h/yr downtime') ||
    title.includes('critical system rto <= 4 hours') ||
    title.includes('1-hour incident notification')
  ) {
    return true;
  }

  return false;
};

// Helper: Get matching pillar metadata for a checklist task
export const getStatutoryNoticePillarForTask = (task: {
  id?: string;
  taskCode?: string;
  title?: string;
}): StatutoryNoticePillar | null => {
  if (!task) return null;
  const id = (task.id || '').toUpperCase().trim();
  const code = (task.taskCode || '').toUpperCase().trim();
  const title = (task.title || '').toLowerCase();

  for (const pillar of STATUTORY_NOTICE_PILLARS) {
    if (
      pillar.mappedChecklistCodes.some(
        c => id === c.toUpperCase() || code === c.toUpperCase()
      )
    ) {
      return pillar;
    }
  }

  // Title fallback
  if (title.includes('mfa') || title.includes('multi-factor')) return STATUTORY_NOTICE_PILLARS[0];
  if (title.includes('pam') || title.includes('privileged access')) return STATUTORY_NOTICE_PILLARS[1];
  if (title.includes('encryption') || title.includes('cryptograph')) return STATUTORY_NOTICE_PILLARS[2];
  if (title.includes('downtime') || title.includes('availability tracking')) return STATUTORY_NOTICE_PILLARS[3];
  if (title.includes('rto') || title.includes('recovery')) return STATUTORY_NOTICE_PILLARS[4];
  if (title.includes('1-hour') || title.includes('incident notification')) return STATUTORY_NOTICE_PILLARS[5];

  return null;
};

// Helper: Check if a checklist task is a Severe Statutory Violation
export const isSevereStatutoryTaskViolation = (task: {
  id?: string;
  taskCode?: string;
  status: string;
  title?: string;
  regulatoryRef?: string;
  mandatoryNoticeRef?: string;
}): boolean => {
  if (!isStatutoryNoticeTask(task)) return false;
  const s = (task.status || '').toUpperCase();
  // If it's a statutory mandate and not COMPLIANT (e.g. GAP_FINDING, IN_PROGRESS, NOT_STARTED), it constitutes a Severe Statutory Violation
  return s !== 'COMPLIANT' && s !== 'NOT_APPLICABLE';
};

// Helper: Calculate Statutory Notice compliance stats for assessments
export const getStatutoryNoticeStats = (assessments: MASRequirementAssessmentRecord[]) => {
  const noticeAssessments = assessments.filter(a => isStatutoryNoticeRequirement(a.requirementCode, a.requirementTitle));
  const compliant = noticeAssessments.filter(a => a.complianceStatus === 'COMPLIANT').length;
  const partial = noticeAssessments.filter(a => a.complianceStatus === 'PARTIALLY_COMPLIANT').length;
  const nonCompliant = noticeAssessments.filter(a => a.complianceStatus === 'NON_COMPLIANT').length;
  const total = noticeAssessments.length;
  const severeViolations = partial + nonCompliant;

  return {
    totalPillars: 6,
    evaluatedItemsCount: total,
    compliantCount: compliant,
    partialCount: partial,
    nonCompliantCount: nonCompliant,
    severeViolations,
    isCleanStatutoryBill: severeViolations === 0 && total > 0,
    regulatoryRiskLevel: severeViolations > 2 ? 'CRITICAL_SANCTION_RISK' : severeViolations > 0 ? 'HIGH_SUPERVISORY_RISK' : 'SATISFACTORY'
  };
};

// Helper: Calculate Statutory Notice compliance stats for checklist sub-tasks
export const getStatutoryTaskStats = (tasks: Array<{
  id: string;
  taskCode: string;
  status: string;
  title?: string;
  regulatoryRef?: string;
  mandatoryNoticeRef?: string;
}>) => {
  const statutoryTasks = tasks.filter(t => isStatutoryNoticeTask(t));
  const compliant = statutoryTasks.filter(t => t.status === 'COMPLIANT').length;
  const inProgress = statutoryTasks.filter(t => t.status === 'IN_PROGRESS').length;
  const gapFinding = statutoryTasks.filter(t => t.status === 'GAP_FINDING').length;
  const notStarted = statutoryTasks.filter(t => t.status === 'NOT_STARTED').length;
  const total = statutoryTasks.length;
  const severeViolations = inProgress + gapFinding + notStarted;

  return {
    totalPillars: 6,
    evaluatedTasksCount: total,
    compliantCount: compliant,
    inProgressCount: inProgress,
    gapFindingCount: gapFinding,
    notStartedCount: notStarted,
    severeViolations,
    isCleanStatutoryBill: severeViolations === 0 && total > 0,
    regulatoryRiskLevel: severeViolations > 2 ? 'CRITICAL_SANCTION_RISK' : severeViolations > 0 ? 'HIGH_SUPERVISORY_RISK' : 'SATISFACTORY'
  };
};
