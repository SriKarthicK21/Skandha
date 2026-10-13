// Master Dataset & Statistical Engine Utilities for MAS TRM Section 15 Independent IT Audit Sampling
// Complies with AICPA / IIA / ISACA and ISO 19011 Audit Sampling Standards

export interface AuditPopulationItem {
  id: string;
  recordIdentifier: string;
  timestamp: string;
  category: string;
  primaryActor: string;
  systemOrAsset: string;
  summary: string;
  riskTier: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  controlExpectation: string;
  // Audit Testing Attributes
  testedStatus?: 'UNTESTED' | 'TESTED_PASS' | 'EXCEPTION_FOUND';
  verificationDetails?: {
    inquiryNotes?: string;
    observationNotes?: string;
    inspectionArtifactRef?: string;
    reperformanceOutcome?: 'RE_PERFORMED_CORRECT' | 'RE_PERFORMANCE_FAILED';
    reperformanceNotes?: string;
  };
  auditorRemarks?: string;
}

export interface AuditPopulationProfile {
  id: string;
  name: string;
  controlId: string;
  controlTitle: string;
  masChapterRef: string;
  controlFrequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
  recommendedSampleSize: number;
  description: string;
  totalPopulationCount: number;
  sampleItems: AuditPopulationItem[];
}

// Generate realistic mock records for 420 Change Tickets
export const GENERATE_CHANGE_TICKETS = (): AuditPopulationItem[] => {
  const items: AuditPopulationItem[] = [];
  const systems = ['Core Banking Engine', 'Payment Gateway (FAST)', 'Online Portal API', 'PostgreSQL DB Cluster', 'Kubernetes Ingress'];
  const authors = ['alex.chen@apexfin.sg', 'rachel.lim@apexfin.sg', 'marcus.tan@apexfin.sg', 'devops-bot', 'priya.nair@apexfin.sg'];

  for (let i = 1; i <= 420; i++) {
    const padded = String(i).padStart(4, '0');
    const risk = i % 15 === 0 ? 'CRITICAL' : i % 5 === 0 ? 'HIGH' : i % 2 === 0 ? 'MEDIUM' : 'LOW';
    const month = Math.min(12, Math.floor((i - 1) / 35) + 1);
    const day = ((i * 7) % 28) + 1;
    const dateStr = `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const sys = systems[i % systems.length];
    const actor = authors[i % authors.length];

    items.push({
      id: `POP-CHG-${padded}`,
      recordIdentifier: `CAB-2026-${padded}`,
      timestamp: `${dateStr}T${String((i * 3) % 24).padStart(2, '0')}:${String((i * 11) % 60).padStart(2, '0')}:00Z`,
      category: 'CHANGE_MANAGEMENT',
      primaryActor: actor,
      systemOrAsset: sys,
      summary: `Release v4.${Math.floor(i / 20)}.${i % 20} patch deployment for ${sys}`,
      riskTier: risk,
      controlExpectation: 'Independent peer review, automated SAST pass (0 Highs), and CAB chair digital sign-off before deployment.'
    });
  }
  return items;
};

// Generate 65 Employee Terminations
export const GENERATE_EMPLOYEE_LEAVERS = (): AuditPopulationItem[] => {
  const items: AuditPopulationItem[] = [];
  const depts = ['Treasury', 'Wealth Tech', 'Customer Support', 'IT Infrastructure', 'Internal Audit', 'Compliance', 'Product Engineering'];
  const names = [
    'Derek Ong', 'Sylvia Seah', 'Jonathan Teo', 'Farah Abdullah', 'Vikram Patel',
    'Benjamin Goh', 'Chloe Wong', 'David Lee', 'Hannah Low', 'Gabriel Sim'
  ];

  for (let i = 1; i <= 65; i++) {
    const padded = String(i).padStart(3, '0');
    const month = Math.min(12, Math.floor((i - 1) / 5) + 1);
    const day = ((i * 4) % 28) + 1;
    const dateStr = `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const person = `${names[i % names.length]} (${padded})`;
    const dept = depts[i % depts.length];
    const risk = dept === 'IT Infrastructure' || dept === 'Treasury' ? 'HIGH' : 'MEDIUM';

    items.push({
      id: `POP-TERM-${padded}`,
      recordIdentifier: `HR-SEP-2026-${padded}`,
      timestamp: `${dateStr}T17:00:00Z`,
      category: 'USER_DEPROVISIONING',
      primaryActor: person,
      systemOrAsset: `${dept} Access Bundle (Active Directory & Cloud IAM)`,
      summary: `Formal resignation separation from ${dept}`,
      riskTier: risk,
      controlExpectation: 'Complete revocation of all corporate email, VPN, SaaS and privileged access within 24 hours of separation.'
    });
  }
  return items;
};

// Generate 84 Privileged Session Logs
export const GENERATE_PAM_SESSIONS = (): AuditPopulationItem[] => {
  const items: AuditPopulationItem[] = [];
  const admins = ['admin.chen@apexfin.sg', 'sysadmin.tan@apexfin.sg', 'dba.sharma@apexfin.sg', 'cloud.ops@apexfin.sg'];
  const targets = ['prod-db-master-01', 'core-switch-gw-01', 'k8s-prod-master', 'hsm-key-vault-node'];

  for (let i = 1; i <= 84; i++) {
    const padded = String(i).padStart(3, '0');
    const month = Math.min(12, Math.floor((i - 1) / 7) + 1);
    const day = ((i * 3) % 28) + 1;
    const dateStr = `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    items.push({
      id: `POP-PAM-${padded}`,
      recordIdentifier: `PAM-SESS-2026-${padded}`,
      timestamp: `${dateStr}T${String((i * 2) % 24).padStart(2, '0')}:15:00Z`,
      category: 'PRIVILEGED_ACCESS',
      primaryActor: admins[i % admins.length],
      systemOrAsset: targets[i % targets.length],
      summary: `Just-In-Time elevated administrative session (Duration: ${(i % 3 + 1) * 35} mins)`,
      riskTier: i % 4 === 0 ? 'CRITICAL' : 'HIGH',
      controlExpectation: 'Pre-approved incident/change ticket, active MFA challenge, dual-custody approval, and video session recording archived.'
    });
  }
  return items;
};

export const AUDIT_POPULATION_REGISTRY: AuditPopulationProfile[] = [
  {
    id: 'POP-CAB-CHANGES',
    name: 'Production Change Requests & Deployment Logs',
    controlId: 'MAS-CTRL-07.4',
    controlTitle: 'Software Release Segregation of Duties & CAB Authorization',
    masChapterRef: 'MAS TRM Guidelines Section 7.4.1 & 7.4.2',
    controlFrequency: 'DAILY',
    recommendedSampleSize: 25,
    description: 'Total population of all production release tickets, hotfixes, and database migrations executed in the rolling 12 months.',
    totalPopulationCount: 420,
    sampleItems: GENERATE_CHANGE_TICKETS()
  },
  {
    id: 'POP-HR-TERMINATIONS',
    name: 'Employee Resignations & Contractor Deprovisioning Records',
    controlId: 'MAS-CTRL-09.1',
    controlTitle: 'Timely Revocation of Access Privileges upon Separation',
    masChapterRef: 'MAS TRM Guidelines Section 9.1.4 & Notice 655',
    controlFrequency: 'WEEKLY',
    recommendedSampleSize: 25,
    description: 'All employee, contractor, and intern separations processed by HR requiring IAM revocation within 24 hours.',
    totalPopulationCount: 65,
    sampleItems: GENERATE_EMPLOYEE_LEAVERS()
  },
  {
    id: 'POP-PAM-SESSIONS',
    name: 'Privileged Administrative Sessions & Root Firecall Events',
    controlId: 'MAS-CTRL-09.2',
    controlTitle: 'Privileged Account Governance & Session Recording',
    masChapterRef: 'MAS TRM Guidelines Section 9.2.1 - 9.2.3',
    controlFrequency: 'DAILY',
    recommendedSampleSize: 25,
    description: 'All elevated root, domain admin, and database administrator JIT sessions checked out from the PAM vault.',
    totalPopulationCount: 84,
    sampleItems: GENERATE_PAM_SESSIONS()
  }
];

// Calculation standard based on AICPA Audit Sampling Guide & IIA Practice Standards:
export const CALCULATE_AUDIT_SAMPLE_SIZE = (
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUAL',
  confidenceLevel: 90 | 95 | 99 = 95,
  tolerableDeviationRate: number = 5
): { standardSampleSize: number; guidanceText: string } => {
  switch (frequency) {
    case 'DAILY':
      return {
        standardSampleSize: confidenceLevel === 99 ? 40 : confidenceLevel === 95 ? 25 : 20,
        guidanceText: 'AICPA / IIA standard for daily controls recommends 25 samples for 95% confidence level (0 expected deviations).'
      };
    case 'WEEKLY':
      return {
        standardSampleSize: confidenceLevel === 99 ? 8 : 5,
        guidanceText: 'Weekly controls (52 occurrences/year) typically require 5 samples for 95% confidence.'
      };
    case 'MONTHLY':
      return {
        standardSampleSize: 2,
        guidanceText: 'Monthly controls (12 occurrences/year) typically require 2 samples for 95% confidence.'
      };
    case 'QUARTERLY':
      return {
        standardSampleSize: 2,
        guidanceText: 'Quarterly controls (4 occurrences/year) require testing at least 2 quarters.'
      };
    case 'ANNUAL':
      return {
        standardSampleSize: 1,
        guidanceText: 'Annual controls (1 occurrence/year) require 100% testing (1 sample).'
      };
  }
};
