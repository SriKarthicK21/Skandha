export type DashboardModuleId =
  | 'compliance_overview'
  | 'compliance_maturity_trend'
  | 'compliance_projection'
  | 'audit_compliance_calendar'
  | 'global_regulatory_news'
  | 'framework_mapping'
  | 'compliance_heatmap'
  | 'priority_actions'
  | 'risk_overview'
  | 'framework_readiness'
  | 'audit_readiness'
  | 'journey_lifecycle'
  | 'department_readiness'
  | 'recent_activity';

export type DailyPriorityTier = 'critical' | 'high' | 'medium' | 'monitoring';

export interface DashboardModuleConfig {
  id: DashboardModuleId;
  title: string;
  shortTitle: string;
  category: string;
  description: string;
  defaultColSpan: 12 | 7 | 6 | 5;
  colSpan: 12 | 6; // User-adjustable width: full or half
  visible: boolean;
  collapsed?: boolean;
  priorityTag?: string;
  priorityTier?: DailyPriorityTier;
}

export interface PriorityPreset {
  id: string;
  label: string;
  description: string;
  badge: string;
  order: DashboardModuleId[];
}

export const DEFAULT_MODULE_CONFIGS: DashboardModuleConfig[] = [
  {
    id: 'compliance_overview',
    title: 'Executive Compliance Scorecard & Trend Pulse',
    shortTitle: 'Compliance Scorecard',
    category: 'Executive Overview',
    description: 'Real-time multi-standard health index, KPI breakdown, and interactive 30D/90D/1Y trajectory chart.',
    defaultColSpan: 12,
    colSpan: 12,
    visible: true,
    collapsed: false,
    priorityTag: 'Executive Visibility',
    priorityTier: 'critical'
  },
  {
    id: 'compliance_maturity_trend',
    title: 'Compliance Maturity Score Trends (Last 6 Months)',
    shortTitle: 'Maturity Trends (6 Mo)',
    category: 'Maturity & Trajectory',
    description: 'Historical 6-month compliance maturity trend graph (Apr-Sep 2026) across ISO 27001, ISO 42001, MAS TRM, SOC 2, and Privacy regulations with CMMI maturity bands and audit milestones.',
    defaultColSpan: 12,
    colSpan: 12,
    visible: true,
    collapsed: false,
    priorityTag: '6-Month Trajectory',
    priorityTier: 'critical'
  },
  {
    id: 'compliance_projection',
    title: 'ISO Recertification Compliance Projection & Likelihood Forecast',
    shortTitle: 'Compliance Projection',
    category: 'Predictive Intelligence',
    description: 'Historical audit telemetry and Bayesian forecasting model projecting the probability of passing upcoming ISO 27001 & ISO 42001 recertification audits.',
    defaultColSpan: 12,
    colSpan: 12,
    visible: true,
    collapsed: false,
    priorityTag: 'Recertification Forecast',
    priorityTier: 'critical'
  },
  {
    id: 'audit_compliance_calendar',
    title: 'Audit Compliance Calendar & Remediation Milestones',
    shortTitle: 'Audit Calendar',
    category: 'Audit & Remediation Timeline',
    description: 'Upcoming certification deadlines, internal walkthroughs, CAPA remediation milestones, and 90-day evidence refresh windows across an interactive timeline view.',
    defaultColSpan: 12,
    colSpan: 12,
    visible: true,
    collapsed: false,
    priorityTag: 'Timeline & Milestones',
    priorityTier: 'critical'
  },
  {
    id: 'global_regulatory_news',
    title: 'Global Regulatory News & Intelligence',
    shortTitle: 'Global Regulatory News',
    category: 'Regulatory Intelligence',
    description: 'Live Google Search-grounded regulatory bulletins, cybersecurity circulars, and compliance mandates across ISO, EU AI Act, NIST, SEC, MAS, and India DPDP.',
    defaultColSpan: 12,
    colSpan: 12,
    visible: true,
    collapsed: false,
    priorityTag: 'Live Google Search',
    priorityTier: 'high'
  },
  {
    id: 'framework_mapping',
    title: 'Framework Mapping & Crosswalk Visualizer',
    shortTitle: 'Framework Mapping',
    category: 'Framework & Crosswalk',
    description: 'Interactive dual-framework crosswalk visualizer highlighting overlapping vs. unique control requirements, evidence reusability, and audit gap analysis.',
    defaultColSpan: 12,
    colSpan: 12,
    visible: true,
    collapsed: false,
    priorityTag: 'Dual-Standard Crosswalk',
    priorityTier: 'high'
  },
  {
    id: 'compliance_heatmap',
    title: 'Multi-Framework Compliance Heatmap',
    shortTitle: 'Compliance Heatmap',
    category: 'Multi-Standard Coverage',
    description: 'Visual risk coverage matrix across departments, ISO 27001 clauses, and MAS TRM modules using a color-coded intensity scale.',
    defaultColSpan: 12,
    colSpan: 12,
    visible: true,
    collapsed: false,
    priorityTag: 'Cross-Standard Coverage',
    priorityTier: 'critical'
  },
  {
    id: 'priority_actions',
    title: 'Critical Priority Actions & Deadlines',
    shortTitle: 'Priority Actions',
    category: 'Remediation SLA',
    description: 'Urgent compliance tasks, CAPA remediation deadlines, and required policy sign-offs.',
    defaultColSpan: 7,
    colSpan: 6,
    visible: true,
    collapsed: false,
    priorityTag: 'Action Required',
    priorityTier: 'critical'
  },
  {
    id: 'risk_overview',
    title: 'Risk Heatmap & Threat Landscape',
    shortTitle: 'Risk Heatmap',
    category: 'Enterprise Risk',
    description: 'Residual threat distribution, high-severity risks, and risk appetite threshold tracking.',
    defaultColSpan: 5,
    colSpan: 6,
    visible: true,
    collapsed: false,
    priorityTag: 'Active Threats',
    priorityTier: 'high'
  },
  {
    id: 'framework_readiness',
    title: 'Multi-Framework Readiness Matrix',
    shortTitle: 'Framework Matrix',
    category: 'Standard Alignment',
    description: 'Clause-by-clause progress across ISO 27001, MAS TRM, ISO 42001, SOC 2, and GDPR.',
    defaultColSpan: 12,
    colSpan: 12,
    visible: true,
    collapsed: false,
    priorityTag: 'Audit Scope',
    priorityTier: 'high'
  },
  {
    id: 'audit_readiness',
    title: 'External Audit Readiness & Gap Analysis',
    shortTitle: 'Audit Readiness',
    category: 'Certification Prep',
    description: 'Stage 1 / Stage 2 readiness qualification, lead auditor sign-off status, and evidence verification.',
    defaultColSpan: 6,
    colSpan: 6,
    visible: true,
    collapsed: false,
    priorityTag: 'Pre-Audit Window',
    priorityTier: 'medium'
  },
  {
    id: 'journey_lifecycle',
    title: 'Implementation Journey & Milestones',
    shortTitle: 'Journey Lifecycle',
    category: 'Program Roadmap',
    description: 'Phase progress from scoping and risk assessment through to certification and surveillance.',
    defaultColSpan: 6,
    colSpan: 6,
    visible: true,
    collapsed: false,
    priorityTag: 'Roadmap Milestone',
    priorityTier: 'medium'
  },
  {
    id: 'department_readiness',
    title: 'Departmental Scope & Operational Readiness',
    shortTitle: 'Department Scope',
    category: 'Organizational Units',
    description: 'Maturity breakdown across Engineering, DevOps, Cloud Infrastructure, HR, and Finance.',
    defaultColSpan: 12,
    colSpan: 12,
    visible: true,
    collapsed: false,
    priorityTag: 'Coverage Scope',
    priorityTier: 'monitoring'
  },
  {
    id: 'recent_activity',
    title: 'Recent Activity & Governance Action Feed',
    shortTitle: 'Recent Activity',
    category: 'Chronological Audit',
    description: 'Chronological feed of evidence deposits, risk evaluations, policy updates, and cryptographic attestations.',
    defaultColSpan: 12,
    colSpan: 12,
    visible: true,
    collapsed: false,
    priorityTag: 'Live Chronological Feed',
    priorityTier: 'high'
  }
];

export const PRIORITY_PRESETS: PriorityPreset[] = [
  {
    id: 'default',
    label: 'Standard Balanced',
    badge: 'Balanced',
    description: 'Recommended general overview covering executive KPIs, immediate tasks, and standard frameworks.',
    order: [
      'compliance_overview',
      'compliance_maturity_trend',
      'compliance_projection',
      'priority_actions',
      'recent_activity',
      'audit_compliance_calendar',
      'global_regulatory_news',
      'framework_mapping',
      'compliance_heatmap',
      'risk_overview',
      'framework_readiness',
      'audit_readiness',
      'journey_lifecycle',
      'department_readiness'
    ]
  },
  {
    id: 'audit_crunch',
    label: 'Audit Crunch Day',
    badge: 'Audit Focus',
    description: 'Prioritizes external audit qualification, immediate remediation actions, and framework matrix at the very top.',
    order: [
      'compliance_maturity_trend',
      'compliance_projection',
      'audit_compliance_calendar',
      'framework_mapping',
      'global_regulatory_news',
      'audit_readiness',
      'priority_actions',
      'framework_readiness',
      'compliance_overview',
      'journey_lifecycle',
      'risk_overview',
      'recent_activity',
      'department_readiness'
    ]
  },
  {
    id: 'risk_mitigation',
    label: 'Risk & Threat Triage',
    badge: 'Risk Focus',
    description: 'Puts enterprise risk heatmap, urgent action items, and live telemetry feeds front and center.',
    order: [
      'risk_overview',
      'compliance_maturity_trend',
      'audit_compliance_calendar',
      'framework_mapping',
      'global_regulatory_news',
      'priority_actions',
      'recent_activity',
      'compliance_overview',
      'framework_readiness',
      'department_readiness',
      'audit_readiness',
      'journey_lifecycle'
    ]
  },
  {
    id: 'executive_board',
    label: 'Board & Executive Review',
    badge: 'C-Suite',
    description: 'High-altitude view highlighting global compliance health score, framework progress, and audit readiness.',
    order: [
      'compliance_overview',
      'compliance_maturity_trend',
      'compliance_projection',
      'audit_compliance_calendar',
      'global_regulatory_news',
      'framework_mapping',
      'framework_readiness',
      'audit_readiness',
      'journey_lifecycle',
      'risk_overview',
      'priority_actions',
      'department_readiness',
      'recent_activity'
    ]
  },
  {
    id: 'daily_operations',
    label: 'Daily Security Operations',
    badge: 'SecOps',
    description: 'Focused on live evidence streams, immediate operational tasks, and departmental team tracking.',
    order: [
      'recent_activity',
      'compliance_maturity_trend',
      'priority_actions',
      'global_regulatory_news',
      'framework_mapping',
      'department_readiness',
      'risk_overview',
      'compliance_overview',
      'framework_readiness',
      'journey_lifecycle',
      'audit_readiness'
    ]
  }
];
