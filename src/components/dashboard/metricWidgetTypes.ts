export type MetricWidgetId =
  | 'risk_status'
  | 'tasks_due'
  | 'compliance_health'
  | 'controls_effective'
  | 'audit_readiness'
  | 'evidence_vault'
  | 'framework_alignment'
  | 'regulatory_alerts';

export type MetricWidgetSize = 'compact' | 'standard' | 'expanded';

export type MetricPriorityArea =
  | 'all'
  | 'risk_status'
  | 'tasks_due'
  | 'audit_readiness'
  | 'evidence_vault'
  | 'balanced';

export interface MetricWidgetConfig {
  id: MetricWidgetId;
  title: string;
  shortLabel: string;
  category: string;
  priorityArea: 'Risk Status' | 'Tasks Due' | 'Compliance Health' | 'Controls & Audit' | 'Evidence & Assurance' | 'Governance & Regulatory';
  size: MetricWidgetSize;
  visible: boolean;
  priorityRank: number;
  description: string;
}

export interface MetricPriorityPreset {
  id: MetricPriorityArea;
  label: string;
  badge: string;
  description: string;
  focusWidgetId?: MetricWidgetId;
  order: MetricWidgetId[];
  sizes: Record<MetricWidgetId, MetricWidgetSize>;
}

export const DEFAULT_METRIC_WIDGET_CONFIGS: MetricWidgetConfig[] = [
  {
    id: 'risk_status',
    title: 'Enterprise Risk Status & Residual Exposure',
    shortLabel: 'Risk Status',
    category: 'Risk Management',
    priorityArea: 'Risk Status',
    size: 'standard',
    visible: true,
    priorityRank: 1,
    description: 'Residual threat distribution, risk appetite tolerance gauge, and high-severity risk tracking.'
  },
  {
    id: 'tasks_due',
    title: 'Urgent Tasks Due & CAPA Remediation',
    shortLabel: 'Tasks Due',
    category: 'Remediation SLA',
    priorityArea: 'Tasks Due',
    size: 'standard',
    visible: true,
    priorityRank: 2,
    description: 'Urgent compliance deadlines, CAPA corrective actions, access reviews, and policy renewals.'
  },
  {
    id: 'compliance_health',
    title: 'Overall Compliance Health & Velocity',
    shortLabel: 'Compliance Health',
    category: 'Executive Overview',
    priorityArea: 'Compliance Health',
    size: 'standard',
    visible: true,
    priorityRank: 3,
    description: 'Multi-framework deterministic health score, continuous velocity pulse, and audit milestones.'
  },
  {
    id: 'controls_effective',
    title: 'Controls Operational Effectiveness',
    shortLabel: 'Controls Effective',
    category: 'Controls & Audit',
    priorityArea: 'Controls & Audit',
    size: 'compact',
    visible: true,
    priorityRank: 4,
    description: 'Tested and verified Annex A & MAS TRM security controls with benchmark pass rate.'
  },
  {
    id: 'audit_readiness',
    title: 'External Audit Readiness & Qualification',
    shortLabel: 'Audit Readiness',
    category: 'Controls & Audit',
    priorityArea: 'Controls & Audit',
    size: 'compact',
    visible: true,
    priorityRank: 5,
    description: 'Stage 1 documentation review, Stage 2 sampling readiness, and lead auditor attestation pack.'
  },
  {
    id: 'evidence_vault',
    title: 'Evidence Vault Integrity & Freshness',
    shortLabel: 'Evidence Vault',
    category: 'Evidence & Assurance',
    priorityArea: 'Evidence & Assurance',
    size: 'compact',
    visible: true,
    priorityRank: 6,
    description: 'Cryptographic SHA-256 validation, 90-day evidence freshness window, and automated cloud sync.'
  },
  {
    id: 'framework_alignment',
    title: 'Multi-Framework Harmonization & Crosswalk',
    shortLabel: 'Framework Align',
    category: 'Governance & Regulatory',
    priorityArea: 'Governance & Regulatory',
    size: 'compact',
    visible: true,
    priorityRank: 7,
    description: 'Cross-standard control overlap, evidence reusability (82%), and deduplicated audit workload.'
  },
  {
    id: 'regulatory_alerts',
    title: 'Active Regulatory Circulars & Mandates',
    shortLabel: 'Regulatory Watch',
    category: 'Governance & Regulatory',
    priorityArea: 'Governance & Regulatory',
    size: 'compact',
    visible: true,
    priorityRank: 8,
    description: 'Live regulatory bulletins, MAS circulars, EU AI Act conformity, and compliance deadlines.'
  }
];

export const METRIC_PRIORITY_PRESETS: MetricPriorityPreset[] = [
  {
    id: 'all',
    label: 'Standard Overview',
    badge: 'Standard',
    description: 'Balanced arrangement with even sizing across all governance and risk metrics.',
    order: [
      'risk_status',
      'tasks_due',
      'compliance_health',
      'controls_effective',
      'audit_readiness',
      'evidence_vault',
      'framework_alignment',
      'regulatory_alerts'
    ],
    sizes: {
      risk_status: 'standard',
      tasks_due: 'standard',
      compliance_health: 'standard',
      controls_effective: 'compact',
      audit_readiness: 'compact',
      evidence_vault: 'compact',
      framework_alignment: 'compact',
      regulatory_alerts: 'compact'
    }
  },
  {
    id: 'risk_status',
    label: 'Risk Status Focus',
    badge: 'Risk Priority',
    description: 'Maximizes risk exposure visibility, threat landscape breakdown, and appetite threshold tracking.',
    focusWidgetId: 'risk_status',
    order: [
      'risk_status',
      'tasks_due',
      'compliance_health',
      'controls_effective',
      'audit_readiness',
      'evidence_vault',
      'framework_alignment',
      'regulatory_alerts'
    ],
    sizes: {
      risk_status: 'expanded',
      tasks_due: 'standard',
      compliance_health: 'compact',
      controls_effective: 'compact',
      audit_readiness: 'compact',
      evidence_vault: 'compact',
      framework_alignment: 'compact',
      regulatory_alerts: 'compact'
    }
  },
  {
    id: 'tasks_due',
    label: 'Tasks Due Focus',
    badge: 'Urgent Actions',
    description: 'Expands critical CAPA remediation items, upcoming SLAs, and overdue task tracking.',
    focusWidgetId: 'tasks_due',
    order: [
      'tasks_due',
      'risk_status',
      'controls_effective',
      'compliance_health',
      'audit_readiness',
      'evidence_vault',
      'regulatory_alerts',
      'framework_alignment'
    ],
    sizes: {
      tasks_due: 'expanded',
      risk_status: 'standard',
      controls_effective: 'standard',
      compliance_health: 'compact',
      audit_readiness: 'compact',
      evidence_vault: 'compact',
      regulatory_alerts: 'compact',
      framework_alignment: 'compact'
    }
  },
  {
    id: 'audit_readiness',
    label: 'Audit Crunch Focus',
    badge: 'Pre-Audit',
    description: 'Spotlights Stage 1/2 audit qualification, controls effectiveness, and evidence integrity.',
    focusWidgetId: 'audit_readiness',
    order: [
      'audit_readiness',
      'controls_effective',
      'evidence_vault',
      'tasks_due',
      'compliance_health',
      'risk_status',
      'framework_alignment',
      'regulatory_alerts'
    ],
    sizes: {
      audit_readiness: 'expanded',
      controls_effective: 'expanded',
      evidence_vault: 'standard',
      tasks_due: 'standard',
      compliance_health: 'compact',
      risk_status: 'compact',
      framework_alignment: 'compact',
      regulatory_alerts: 'compact'
    }
  },
  {
    id: 'evidence_vault',
    label: 'Evidence & Assurance',
    badge: 'Integrity',
    description: 'Deep dive on tamper-evident cryptographic vault status and freshness validation.',
    focusWidgetId: 'evidence_vault',
    order: [
      'evidence_vault',
      'compliance_health',
      'controls_effective',
      'audit_readiness',
      'tasks_due',
      'risk_status',
      'framework_alignment',
      'regulatory_alerts'
    ],
    sizes: {
      evidence_vault: 'expanded',
      compliance_health: 'standard',
      controls_effective: 'standard',
      audit_readiness: 'compact',
      tasks_due: 'compact',
      risk_status: 'compact',
      framework_alignment: 'compact',
      regulatory_alerts: 'compact'
    }
  }
];
