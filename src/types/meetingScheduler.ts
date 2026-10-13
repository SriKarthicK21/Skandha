export type StakeholderRole =
  | 'DEPARTMENT_HEAD'
  | 'PROCESS_OWNER'
  | 'SYSTEM_ADMIN'
  | 'TECH_CUSTODIAN'
  | 'RISK_OWNER'
  | 'DATA_PROTECTION_LEAD'
  | 'EXECUTIVE_SPONSOR'
  | 'KEY_OPERATIONAL_STAFF'
  | 'EXTERNAL_CONSULTANT';

export type InterviewObjective =
  | 'CONTEXT_AND_INTERESTED_PARTIES'
  | 'SCOPE_AND_BOUNDARY'
  | 'ROLES_AND_AUTHORITIES'
  | 'RISK_AND_THREAT_DISCOVERY'
  | 'AWARENESS_AND_COMPETENCE'
  | 'OPERATIONAL_CONTROLS_WALKTHROUGH'
  | 'BIA_AND_DISASTER_RECOVERY'
  | 'INTERNAL_AUDIT_FIELDWORK'
  | 'CAPA_AND_REMEDIATION_REVIEW';

export interface ObjectiveDefinition {
  id: InterviewObjective;
  title: string;
  isoClause: string;
  defaultPhase: 'Phase 1 Context & Leadership' | 'Phase 2 Scope & SoA' | 'Phase 3 Policies & Procedures' | 'Phase 4 Digital MoU' | 'Phase 5 Evidence & Audit Fieldwork' | 'Phase 6 Stage 1 Readiness';
  description: string;
  defaultControls: string[];
  deliverable: string;
}

export interface TranscriptConsentRecord {
  audioVideoRecordingConsent: boolean;
  recordingConsentTimestamp?: string; // RFC3339/ISO logged timestamp for recording authorization
  aiTranscriptionConsent: boolean;
  transcriptConsentTimestamp?: string; // RFC3339/ISO logged timestamp for transcript authorization
  confidentialityAgreementConsent: boolean;
  confidentialityConsentTimestamp?: string; // RFC3339/ISO logged timestamp for Clause 7.5 NDA
  auditorAccessSamplingConsent: boolean;
  auditorAccessConsentTimestamp?: string; // RFC3339/ISO logged timestamp for auditor sampling
  dataRetentionMonths: number;
  consentSignerName: string;
  consentSignerEmail: string;
  consentSignedAt: string;
  consentIpAddress: string;
  consentIntegrityHash: string; // SHA-256 verifiable hash
}

export interface IsoProjectMapping {
  projectId: string;
  projectName: string;
  projectPhase: 'Phase 1 Context & Leadership' | 'Phase 2 Scope & SoA' | 'Phase 3 Policies & Procedures' | 'Phase 4 Digital MoU' | 'Phase 5 Evidence & Audit Fieldwork' | 'Phase 6 Stage 1 Readiness';
  targetMilestone: string;
  mappedClauses: string[];
  mappedAnnexAControls: string[];
  generatedTaskIds: string[];
  expectedEvidenceArtifacts: string[];
  deliverableOutput: string;
}

export interface InterviewQuestionItem {
  id: string;
  question: string;
  mappedClauseOrControl: string;
  responseNotes?: string;
  complianceFinding?: 'Conforming' | 'Observation' | 'Minor Gap' | 'Major Deficit';
}

export interface AiScopeChecklistItem {
  id: string;
  topic: string;
  mappedControlOrClause: string;
  rationale: string;
  suggestedQuestions: string[];
  severityImpact: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  selected?: boolean;
}

export type AgendaPhase =
  | 'OPENING'
  | 'CONTEXT_GOVERNANCE'
  | 'FIELDWORK_WALKTHROUGH'
  | 'RISK_VERIFICATION'
  | 'CLOSING_SYNTHESIS';

export interface AgendaItem {
  id: string;
  phase: AgendaPhase;
  phaseLabel: string;
  title: string;
  durationMinutes: number;
  timeOffsetMinutes: number; // e.g. starts at minute 0, 10, 25...
  isoAuditPoints: string[]; // Explicit ISO audit citations/clauses e.g. ["ISO 19011:2018 Cl. 6.4.2", "ISO 27001 Cl. 5.3 & A.8.25"]
  discussionCheckpoints: string[]; // Key inquiries and walkthrough steps
  mandatoryEvidence: string[]; // Expected artifacts/records to verify
  responsibleRole: string; // e.g. "Lead Auditor & Department Lead"
}

export interface MeetingAgendaStructure {
  framework: string;
  department: string;
  totalDurationMinutes: number;
  agendaTitle: string;
  leadAuditorStandardProtocol: string; // e.g. "ISO 19011:2018 Clause 6.4 Compliant Audit Flow"
  items: AgendaItem[];
  generatedBy?: string; // e.g. "gemini-3.8-flash" | "ISO 19011 Audit Engine"
  generatedAt?: string;
}

export interface MeetingInterviewSession {
  id: string;
  tenantId: string;
  meetingCode: string; // e.g. "MTG-ISO-2026-001"
  title: string;
  projectId: string;
  projectName: string;
  department: string;
  departmentId?: string;
  stakeholder: {
    name: string;
    email: string;
    title: string;
    phone?: string;
  };
  stakeholderRole: StakeholderRole;
  interviewObjective: InterviewObjective;
  objectiveDescription?: string;
  frameworks: string[];
  primaryFramework: string;
  aiSuggestedScope?: AiScopeChecklistItem[];
  dynamicAgenda?: MeetingAgendaStructure;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // HH:MM
  durationMinutes: number;
  locationOrLink: string;
  interviewer: {
    name: string;
    email: string;
    role: string;
  };
  status: 'Scheduled' | 'In Progress' | 'Transcript Ready' | 'Evidence Synthesized' | 'Completed & Mapped' | 'Cancelled';
  isArchived?: boolean;
  archivedAt?: string;
  archivedBy?: string;
  archiveReason?: string;
  retentionExpiryDate?: string;
  archiveIntegrityHash?: string;
  consents: TranscriptConsentRecord;
  isoProjectMapping: IsoProjectMapping;
  interviewQuestions: InterviewQuestionItem[];
  transcriptSummary?: string;
  transcriptFullText?: string;
  actionItems?: Array<{
    id: string;
    description: string;
    assignee: string;
    dueDate: string;
    status: 'To Do' | 'Done';
    createdTaskId?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export type IdentifiedEntityType = 'Application' | 'Asset' | 'Risk' | 'Control' | 'Policy';

export interface TranscriptEntity {
  id: string;
  name: string;
  type: IdentifiedEntityType;
  mentionCount: number;
  firstMentionTimestamp: string;
  segmentId: string;
  contextSnippet: string;
  confidence: number; // 0.0 - 1.0 (e.g. 0.97)
  associatedControlOrClause?: string;
  riskSeverity?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status?: 'Extracted' | 'Verified' | 'Mapped to Asset Inventory' | 'Mapped to Risk Register';
  tags?: string[];
}

export type SegmentSentimentPosture =
  | 'POSITIVE_COMPLIANCE'
  | 'IDENTIFIED_RISK'
  | 'CAUTION_UNCERTAINTY'
  | 'NEUTRAL_PROCEDURAL';

export interface SegmentSentimentAnalysis {
  posture: SegmentSentimentPosture;
  score: number; // -1.0 (severe risk) to +1.0 (strong positive compliance)
  confidence: number; // 0.0 to 1.0 (e.g. 0.94)
  toneLabel: 'Positive Compliance' | 'Identified Risk' | 'Caution / Gap' | 'Procedural Neutral';
  reasoning: string;
  triggerKeywords: string[];
}

export type SpeakerAffiliation =
  | 'AUDIT_TEAM'
  | 'AUDITEE_STAKEHOLDER'
  | 'TECHNICAL_SME'
  | 'GOVERNANCE_OFFICER'
  | 'OBSERVER';

export interface DetectedSpeakerLabel {
  speakerId: string;
  speakerName: string;
  role: string;
  department?: string;
  affiliation: SpeakerAffiliation;
  badgeLabel: string;
  avatarColor: string;
  confidence: number; // 0.0 - 1.0 (e.g. 0.98)
  detectedVia:
    | 'AUTO_DIARIZATION'
    | 'AI_SEMANTIC_ANALYSIS'
    | 'SESSION_METADATA'
    | 'PREFIX_PARSING'
    | 'AUDITOR_OVERRIDE';
  detectedReason?: string;
  turnNumber?: number;
  isSpeakerSwitch?: boolean;
}

export interface LiveTranscriptSegment {
  id: string;
  timestamp: string; // e.g. "00:15"
  seconds: number;
  speaker: string;
  speakerRole: 'Interviewer / Lead Auditor' | 'Auditee / Stakeholder' | 'Observer' | string;
  speakerAvatar?: string;
  text: string;
  entityIds: string[];
  isNew?: boolean;
  sentiment?: SegmentSentimentAnalysis;
  speakerLabel?: DetectedSpeakerLabel;
}

export interface MeetingSegmentAiSummary {
  executiveSummary: string;
  keyDiscussions: string[];
  complianceFindings: Array<{
    topic: string;
    findingType: 'STRENGTH' | 'OBSERVATION' | 'GAP' | 'COMPLIANT';
    controlRef: string;
    detail: string;
  }>;
  actionItems: Array<{
    task: string;
    owner: string;
    dueDate: string;
    priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  }>;
  auditReadinessVerdict: string;
  source?: string;
  generatedAt?: string;
}
