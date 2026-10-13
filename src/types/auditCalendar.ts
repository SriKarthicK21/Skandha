export type AuditCalendarCategory =
  | 'external_audit'
  | 'internal_audit'
  | 'remediation_capa'
  | 'evidence_refresh'
  | 'regulatory_filing';

export type AuditCalendarPriority = 'Critical' | 'High' | 'Medium' | 'Low';

export type AuditCalendarStatus =
  | 'Scheduled'
  | 'Upcoming'
  | 'In Progress'
  | 'Under Review'
  | 'Completed'
  | 'Overdue'
  | 'At Risk';

export interface AuditCalendarChecklistItem {
  id: string;
  task: string;
  completed: boolean;
  owner: string;
  dueDate?: string;
}

export interface AuditCalendarEvent {
  id: string;
  title: string;
  shortCode: string;
  description: string;
  category: AuditCalendarCategory;
  categoryLabel: string;
  framework: string;
  startDate: string;
  dueDate: string;
  completedDate?: string;
  daysRemaining: number;
  status: AuditCalendarStatus;
  priority: AuditCalendarPriority;
  owner: string;
  ownerRole: string;
  department: string;
  linkedModule: string;
  linkedControls: string[];
  remediationProgress: number; // 0-100%
  deliverableArtifact?: string;
  registrarBadge?: string;
  checklist: AuditCalendarChecklistItem[];
  isKeyMilestone?: boolean;
}

export interface CalendarFilterState {
  category: string;
  framework: string;
  status: string;
  timeHorizon: 'all' | '14_days' | '30_days' | '90_days' | 'q4_2026';
  searchQuery: string;
  onlyKeyMilestones: boolean;
}
