import { GeneratedDocument, PolicyApprovalRecord, PolicyDigitalSignature, PolicyReviewNotification, ReviewTriggerRule } from '../types';
import { computeSHA256 } from './crypto';

export interface PolicyStageConfig {
  id: PolicyApprovalRecord['stage'];
  label: string;
  shortLabel: string;
  stepNumber: number;
  description: string;
  defaultRole: string;
  defaultApprover: string;
  slaDays: number;
}

export const POLICY_STAGES: PolicyStageConfig[] = [
  {
    id: 'DRAFT',
    label: 'Authoring & Formulation',
    shortLabel: 'Draft',
    stepNumber: 1,
    description: 'Initial drafting, scoping, and departmental requirements gathering.',
    defaultRole: 'Policy Author / Security Analyst',
    defaultApprover: 'Marcus Vance',
    slaDays: 5
  },
  {
    id: 'TECHNICAL_REVIEW',
    label: 'SecOps & Technical Review',
    shortLabel: 'Technical Review',
    stepNumber: 2,
    description: 'Architecture review, control enforceability, and technical baseline validation.',
    defaultRole: 'Lead Security Architect / SecOps Head',
    defaultApprover: 'Alex Chen',
    slaDays: 7
  },
  {
    id: 'LEGAL_COMPLIANCE',
    label: 'Legal & Regulatory Sign-Off',
    shortLabel: 'Legal & DPO',
    stepNumber: 3,
    description: 'Legal compliance, regulatory crosswalk, and data protection impact evaluation.',
    defaultRole: 'Data Protection Officer (DPO) / Legal Counsel',
    defaultApprover: 'Elena Rostova',
    slaDays: 5
  },
  {
    id: 'EXECUTIVE_CISO',
    label: 'Executive CISO Endorsement',
    shortLabel: 'CISO Approval',
    stepNumber: 4,
    description: 'Executive leadership sign-off, management commitment, and resource allocation.',
    defaultRole: 'Chief Information Security Officer (CISO)',
    defaultApprover: 'Sarah Jenkins',
    slaDays: 3
  },
  {
    id: 'PUBLISHED',
    label: 'Enacted & Published Suite',
    shortLabel: 'Published',
    stepNumber: 5,
    description: 'Officially published to the ISMS portal, in active enforcement, and employee acknowledgment enabled.',
    defaultRole: 'GRC Program Director',
    defaultApprover: 'David Vance',
    slaDays: 1
  }
];

export function getStageProgress(stage?: PolicyApprovalRecord['stage']): number {
  switch (stage) {
    case 'DRAFT': return 20;
    case 'TECHNICAL_REVIEW': return 40;
    case 'LEGAL_COMPLIANCE': return 60;
    case 'EXECUTIVE_CISO': return 80;
    case 'PUBLISHED': return 100;
    default: return 20;
  }
}

export function getEffectiveStage(doc: GeneratedDocument): PolicyApprovalRecord['stage'] {
  if (doc.approvalStage) return doc.approvalStage;
  if (doc.status === 'PUBLISHED') return 'PUBLISHED';
  if (doc.status === 'APPROVED') return 'EXECUTIVE_CISO';
  if (doc.status === 'IN_REVIEW') return 'TECHNICAL_REVIEW';
  return 'DRAFT';
}

export function ensureDocApprovalHistory(doc: GeneratedDocument): PolicyApprovalRecord[] {
  if (doc.approvalHistory && doc.approvalHistory.length > 0) {
    return doc.approvalHistory;
  }

  const effectiveStage = getEffectiveStage(doc);
  const now = new Date();
  const createdDate = new Date(now.getTime() - 45 * 86400000).toISOString();
  const techReviewDate = new Date(now.getTime() - 32 * 86400000).toISOString();
  const legalReviewDate = new Date(now.getTime() - 20 * 86400000).toISOString();
  const cisoReviewDate = new Date(now.getTime() - 10 * 86400000).toISOString();
  const publishedDate = new Date(now.getTime() - 5 * 86400000).toISOString();

  const history: PolicyApprovalRecord[] = [
    {
      id: `appr_${doc.id}_draft`,
      documentId: doc.id,
      documentCode: doc.docCode,
      documentVersion: doc.version || '1.0',
      stage: 'DRAFT',
      status: 'APPROVED',
      approverName: doc.documentOwner || 'Marcus Vance',
      approverRole: 'Policy Author & Security Analyst',
      approverEmail: 'marcus.vance@company.internal',
      assignedDate: createdDate,
      actionDate: createdDate,
      comments: `Initial document baseline formulation for ${doc.title} aligned with ISO/IEC 27001:2022.`
    }
  ];

  if (effectiveStage !== 'DRAFT') {
    history.unshift({
      id: `appr_${doc.id}_tech`,
      documentId: doc.id,
      documentCode: doc.docCode,
      documentVersion: doc.version || '1.0',
      stage: 'TECHNICAL_REVIEW',
      status: 'APPROVED',
      approverName: 'Alex Chen',
      approverRole: 'Lead Security Architect / SecOps Head',
      approverEmail: 'alex.chen@company.internal',
      assignedDate: createdDate,
      actionDate: techReviewDate,
      comments: 'Validated technical control feasibility, logging telemetry, and operational runbook criteria.'
    });
  }

  if (effectiveStage === 'LEGAL_COMPLIANCE' || effectiveStage === 'EXECUTIVE_CISO' || effectiveStage === 'PUBLISHED') {
    history.unshift({
      id: `appr_${doc.id}_legal`,
      documentId: doc.id,
      documentCode: doc.docCode,
      documentVersion: doc.version || '1.0',
      stage: 'LEGAL_COMPLIANCE',
      status: 'APPROVED',
      approverName: 'Elena Rostova',
      approverRole: 'Data Protection Officer (DPO) & Legal Counsel',
      approverEmail: 'elena.rostova@company.internal',
      assignedDate: techReviewDate,
      actionDate: legalReviewDate,
      comments: 'Concurred with GDPR, local statutory privacy mandates, and MAS TRM Sec 3/8 requirements.'
    });
  }

  if (effectiveStage === 'EXECUTIVE_CISO' || effectiveStage === 'PUBLISHED') {
    history.unshift({
      id: `appr_${doc.id}_ciso`,
      documentId: doc.id,
      documentCode: doc.docCode,
      documentVersion: doc.version || '1.0',
      stage: 'EXECUTIVE_CISO',
      status: 'APPROVED',
      approverName: doc.approvedBy || 'Sarah Jenkins',
      approverRole: 'Chief Information Security Officer (CISO)',
      approverEmail: 'sarah.jenkins@company.internal',
      assignedDate: legalReviewDate,
      actionDate: cisoReviewDate,
      comments: 'Formally endorsed for corporate-wide ISMS enforcement. Mandated employee policy acknowledgment.'
    });
  }

  if (effectiveStage === 'PUBLISHED') {
    history.unshift({
      id: `appr_${doc.id}_pub`,
      documentId: doc.id,
      documentCode: doc.docCode,
      documentVersion: doc.version || '1.0',
      stage: 'PUBLISHED',
      status: 'APPROVED',
      approverName: 'David Vance',
      approverRole: 'GRC Program Director',
      approverEmail: 'david.vance@company.internal',
      assignedDate: cisoReviewDate,
      actionDate: publishedDate,
      comments: 'Published to corporate policy portal; automated acknowledgment campaigns dispatched to staff.'
    });
  }

  return history;
}

export function ensureDocDigitalSignatures(doc: GeneratedDocument): PolicyDigitalSignature[] {
  if (doc.digitalSignatures && doc.digitalSignatures.length > 0) {
    return doc.digitalSignatures;
  }

  const effectiveStage = getEffectiveStage(doc);
  if (effectiveStage !== 'PUBLISHED' && effectiveStage !== 'EXECUTIVE_CISO') {
    return [];
  }

  const now = new Date();
  const signDate = new Date(now.getTime() - 8 * 86400000).toISOString();
  const verificationHash = `sha256_sig_${doc.docCode.toLowerCase()}_e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f`;
  const documentChecksum = `sha256_chk_${doc.docCode.toLowerCase()}_4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b`;

  return [
    {
      id: `dsig_${doc.id}_ciso`,
      documentId: doc.id,
      documentCode: doc.docCode,
      documentTitle: doc.title,
      documentVersion: doc.version || '1.0',
      signerName: doc.approvedBy || 'Sarah Jenkins',
      signerEmail: 'sarah.jenkins@company.internal',
      signerRole: 'Chief Information Security Officer (CISO)',
      signingPurpose: 'INITIAL_APPROVAL',
      timestamp: signDate,
      ipAddress: '185.192.68.14',
      certificateAuthority: 'Skanda GRC CA / ISO 27001 Trust Network (Root-01)',
      verificationHash,
      documentChecksum,
      auditDeclaration: 'I hereby attest and certify that this policy has been formally reviewed, validated against ISO/IEC 27001:2022 Clause 5.1/5.2 & regulatory mandates, and is authorized for active governance enforcement.',
      status: 'VALID',
      signatureNotes: 'Annual ISMS Governance Attestation Cycle.'
    },
    {
      id: `dsig_${doc.id}_dpo`,
      documentId: doc.id,
      documentCode: doc.docCode,
      documentTitle: doc.title,
      documentVersion: doc.version || '1.0',
      signerName: 'Elena Rostova',
      signerEmail: 'elena.rostova@company.internal',
      signerRole: 'Data Protection Officer (DPO)',
      signingPurpose: 'LEGAL_SIGN_OFF',
      timestamp: new Date(now.getTime() - 12 * 86400000).toISOString(),
      ipAddress: '185.192.68.22',
      certificateAuthority: 'Skanda GRC CA / ISO 27001 Trust Network (Root-01)',
      verificationHash: `sha256_dpo_${doc.docCode.toLowerCase()}_3b7c9e1f5a8d2c4e6f8a0b1c3d5e7f9a1b3c5d7e9f1a3b5c7d9e1f3a5b7c9e1f`,
      documentChecksum,
      auditDeclaration: 'Privacy & Data Protection compliance review signed and certified. No regulatory conflicts identified.',
      status: 'VALID',
      signatureNotes: 'Statutory compliance sign-off for enterprise data protection.'
    }
  ];
}

export function getNextReviewDate(doc: GeneratedDocument): { dateString: string; daysRemaining: number; isOverdue: boolean } {
  if (doc.nextReviewDate) {
    const target = new Date(doc.nextReviewDate);
    const diffDays = Math.ceil((target.getTime() - Date.now()) / (86400000));
    return {
      dateString: doc.nextReviewDate,
      daysRemaining: diffDays,
      isOverdue: diffDays < 0
    };
  }

  // Default to 1 year from effectiveDate or 180 days in future
  const future = new Date(Date.now() + 180 * 86400000);
  const formatted = future.toISOString().split('T')[0];
  return {
    dateString: formatted,
    daysRemaining: 180,
    isOverdue: false
  };
}

// -------------------------------------------------------------
// Formal 3-Stage Document Review Workflow (Draft, Review, Approved)
// -------------------------------------------------------------
export interface MacroStageConfig {
  id: 'DRAFT' | 'REVIEW' | 'APPROVED';
  label: string;
  stepNumber: number;
  description: string;
  subStages: PolicyApprovalRecord['stage'][];
  responsibleRoles: string[];
  mandatoryCriteria: string[];
  isoClause: string;
}

export const THREE_STAGE_WORKFLOW: MacroStageConfig[] = [
  {
    id: 'DRAFT',
    label: 'Stage 1: Draft & Formulation',
    stepNumber: 1,
    description: 'Initial drafting, scope formulation, regulatory gap baseline, and author attestation.',
    subStages: ['DRAFT'],
    responsibleRoles: ['Policy Author', 'GRC Analyst', 'Process Owner'],
    mandatoryCriteria: [
      'Document scope and applicability boundaries defined',
      'ISO/IEC 27001:2022 clause and Annex A control mapping established',
      'RACI ownership matrix assigned with designated custodians'
    ],
    isoClause: 'ISO 27001 Clause 7.5.2 (Creating and updating)'
  },
  {
    id: 'REVIEW',
    label: 'Stage 2: Technical & Compliance Review',
    stepNumber: 2,
    description: 'SecOps architectural verification, operational enforceability, DPO privacy crosswalk, and stakeholder feedback.',
    subStages: ['TECHNICAL_REVIEW', 'LEGAL_COMPLIANCE'],
    responsibleRoles: ['Lead Security Architect', 'SecOps Lead', 'Data Protection Officer (DPO)', 'Legal Counsel'],
    mandatoryCriteria: [
      'Technical control feasibility and automated telemetry verified',
      'Dual-control gates and incident escalation thresholds ratified',
      'Statutory privacy and jurisdictional compliance confirmed'
    ],
    isoClause: 'ISO 27001 Clause 7.5.3 (Control of documented information - Review)'
  },
  {
    id: 'APPROVED',
    label: 'Stage 3: Executive CISO Sign-Off & Enactment',
    stepNumber: 3,
    description: 'Formal executive sign-off, management commitment, cryptographic SHA-256 seal, and corporate publication.',
    subStages: ['EXECUTIVE_CISO', 'PUBLISHED'],
    responsibleRoles: ['Chief Information Security Officer (CISO)', 'ISMS Steering Committee', 'GRC Director'],
    mandatoryCriteria: [
      'Executive CISO digital signature and audit declaration executed',
      'Cryptographic SHA-256 tamper-proof checksum generated',
      'Annual recertification cadence and review notification triggers active'
    ],
    isoClause: 'ISO 27001 Clause 5.1 (Leadership commitment) & Clause 9.3'
  }
];

export function getMacroStage(stage?: PolicyApprovalRecord['stage']): 'DRAFT' | 'REVIEW' | 'APPROVED' {
  if (!stage || stage === 'DRAFT') return 'DRAFT';
  if (stage === 'TECHNICAL_REVIEW' || stage === 'LEGAL_COMPLIANCE') return 'REVIEW';
  return 'APPROVED';
}

// -------------------------------------------------------------
// Automated Review Notification Trigger System
// -------------------------------------------------------------
export const DEFAULT_REVIEW_TRIGGER_RULES: ReviewTriggerRule[] = [
  {
    id: 'rule_60d',
    daysThreshold: 60,
    label: '60-Day Advance Advisory',
    description: 'Advance notice to Document Owner & Department Lead to schedule annual ISMS review.',
    recipientRoles: ['Document Owner', 'Process Owner', 'GRC Lead'],
    channels: ['EMAIL', 'IN_APP'],
    severity: 'INFO',
    enabled: true
  },
  {
    id: 'rule_30d',
    daysThreshold: 30,
    label: '30-Day Review Kickoff Alert',
    description: 'Formal notification to initiate multi-stage drafting & technical peer review.',
    recipientRoles: ['Document Owner', 'Lead Security Architect', 'Lead Internal Auditor'],
    channels: ['EMAIL', 'IN_APP', 'SLACK_WEBHOOK'],
    severity: 'WARNING',
    enabled: true
  },
  {
    id: 'rule_14d',
    daysThreshold: 14,
    label: '14-Day Urgent Review Escalation',
    description: 'High-priority escalation to Document Owner and Legal & Compliance sign-off team.',
    recipientRoles: ['Document Owner', 'Data Protection Officer (DPO)', 'CISO'],
    channels: ['EMAIL', 'IN_APP', 'SLACK_WEBHOOK'],
    severity: 'HIGH',
    enabled: true
  },
  {
    id: 'rule_7d',
    daysThreshold: 7,
    label: '7-Day Critical Sign-off Warning',
    description: 'Immediate deadline warning to Executive CISO for final approval before expiration.',
    recipientRoles: ['Chief Information Security Officer (CISO)', 'ISMS Steering Committee'],
    channels: ['EMAIL', 'IN_APP', 'TEAMS', 'SLACK_WEBHOOK'],
    severity: 'CRITICAL',
    enabled: true
  },
  {
    id: 'rule_0d_overdue',
    daysThreshold: 0,
    label: 'Overdue / Recertification Non-Conformance',
    description: 'Immediate statutory breach notification under ISO 27001 Clause 9.2 & Clause 10.1.',
    recipientRoles: ['Chief Information Security Officer (CISO)', 'Lead Auditor', 'Executive Committee'],
    channels: ['EMAIL', 'IN_APP', 'SLACK_WEBHOOK'],
    severity: 'CRITICAL',
    enabled: true
  }
];

export interface PolicyReviewHealthAssessment {
  status: 'OVERDUE' | 'CRITICAL' | 'URGENT' | 'APPROACHING' | 'EARLY_WARNING' | 'HEALTHY';
  label: string;
  badgeClass: string;
  daysRemaining: number;
  dueDate: string;
  isOverdue: boolean;
  activeRule: ReviewTriggerRule | null;
  recommendedAction: string;
  targetStakeholder: string;
}

export function evaluatePolicyReviewHealth(doc: GeneratedDocument): PolicyReviewHealthAssessment {
  const { dateString, daysRemaining, isOverdue } = getNextReviewDate(doc);
  const docOwner = doc.documentOwner || doc.owner || 'Document Custodian';

  if (isOverdue || daysRemaining <= 0) {
    const rule = DEFAULT_REVIEW_TRIGGER_RULES.find(r => r.id === 'rule_0d_overdue') || null;
    return {
      status: 'OVERDUE',
      label: `Overdue by ${Math.abs(daysRemaining)} days`,
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 font-bold',
      daysRemaining,
      dueDate: dateString,
      isOverdue: true,
      activeRule: rule,
      recommendedAction: 'Immediate revision review required. Audit non-conformance ticket triggered.',
      targetStakeholder: 'CISO & Lead Internal Auditor'
    };
  }

  if (daysRemaining <= 7) {
    const rule = DEFAULT_REVIEW_TRIGGER_RULES.find(r => r.id === 'rule_7d') || null;
    return {
      status: 'CRITICAL',
      label: `Critical: ${daysRemaining}d remaining`,
      badgeClass: 'bg-red-100 text-red-800 border-red-300 font-bold',
      daysRemaining,
      dueDate: dateString,
      isOverdue: false,
      activeRule: rule,
      recommendedAction: 'Final sign-off sign-off gate pending. Urgent escalation active.',
      targetStakeholder: 'Chief Information Security Officer (CISO)'
    };
  }

  if (daysRemaining <= 14) {
    const rule = DEFAULT_REVIEW_TRIGGER_RULES.find(r => r.id === 'rule_14d') || null;
    return {
      status: 'URGENT',
      label: `Urgent: ${daysRemaining}d remaining`,
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300 font-bold',
      daysRemaining,
      dueDate: dateString,
      isOverdue: false,
      activeRule: rule,
      recommendedAction: 'Complete Technical & Legal review stage before CISO approval window.',
      targetStakeholder: 'SecOps Architect & DPO'
    };
  }

  if (daysRemaining <= 30) {
    const rule = DEFAULT_REVIEW_TRIGGER_RULES.find(r => r.id === 'rule_30d') || null;
    return {
      status: 'APPROACHING',
      label: `Review in ${daysRemaining}d`,
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 font-semibold',
      daysRemaining,
      dueDate: dateString,
      isOverdue: false,
      activeRule: rule,
      recommendedAction: 'Initiate Stage 2 Technical & Compliance review workflow.',
      targetStakeholder: docOwner
    };
  }

  if (daysRemaining <= 60) {
    const rule = DEFAULT_REVIEW_TRIGGER_RULES.find(r => r.id === 'rule_60d') || null;
    return {
      status: 'EARLY_WARNING',
      label: `Upcoming in ${daysRemaining}d`,
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200 font-medium',
      daysRemaining,
      dueDate: dateString,
      isOverdue: false,
      activeRule: rule,
      recommendedAction: 'Schedule annual review kickoff meeting with document stakeholders.',
      targetStakeholder: docOwner
    };
  }

  return {
    status: 'HEALTHY',
    label: `Healthy (${daysRemaining}d remaining)`,
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-medium',
    daysRemaining,
    dueDate: dateString,
    isOverdue: false,
    activeRule: null,
    recommendedAction: 'Policy is actively enforced and within standard recertification validity cycle.',
    targetStakeholder: docOwner
  };
}

export function generateAutomatedReviewNotifications(docs: GeneratedDocument[]): PolicyReviewNotification[] {
  const notifications: PolicyReviewNotification[] = [];
  const now = new Date();

  docs.forEach(doc => {
    const health = evaluatePolicyReviewHealth(doc);
    if (health.activeRule) {
      let triggerType: PolicyReviewNotification['triggerType'] = 'MANUAL_DISPATCH';
      if (health.status === 'OVERDUE') triggerType = 'OVERDUE_BREACH';
      else if (health.status === 'CRITICAL') triggerType = '7_DAY_URGENT';
      else if (health.status === 'URGENT') triggerType = '14_DAY_REMINDER';
      else if (health.status === 'APPROACHING') triggerType = '30_DAY_APPROACHING';
      else if (health.status === 'EARLY_WARNING') triggerType = '60_DAY_ADVANCE';

      const docOwner = doc.documentOwner || doc.owner || 'Alex Vance';
      const ownerEmail = `${docOwner.toLowerCase().replace(/\s+/g, '.')}@company.internal`;

      health.activeRule.recipientRoles.forEach((role, idx) => {
        const recipientName = idx === 0 ? docOwner : role.includes('CISO') ? 'Sarah Jenkins' : role.includes('Auditor') ? 'David Vance' : 'Elena Rostova';
        const recipientEmail = idx === 0 ? ownerEmail : `${recipientName.toLowerCase().replace(/\s+/g, '.')}@company.internal`;
        const channel = health.activeRule?.channels[idx % health.activeRule.channels.length] || 'EMAIL';

        notifications.push({
          id: `notif_${doc.id}_${health.activeRule?.id}_${idx}`,
          documentId: doc.id,
          documentCode: doc.docCode,
          documentTitle: doc.title,
          triggerType,
          recipientName,
          recipientRole: role,
          recipientEmail,
          daysRemaining: health.daysRemaining,
          dueDate: health.dueDate,
          channel,
          sentTimestamp: new Date(now.getTime() - (idx * 3600000 + 1200000)).toISOString(),
          deliveryStatus: 'DELIVERED',
          messageSummary: `[${health.activeRule?.label}] Policy ${doc.docCode} ("${doc.title}") review deadline: ${health.dueDate} (${health.daysRemaining > 0 ? `${health.daysRemaining} days remaining` : 'OVERDUE'}). Action: ${health.recommendedAction}`
        });
      });
    }
  });

  return notifications;
}
