// SKANDA GRC — Continuous ISO Compliance Monitoring Shared DB & Calculations
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import {
  ContinuousControlEvaluation,
  AutomatedControlTest,
  CertificationLifecycle,
  ComplianceDriftEvent,
  AuditReadinessPackage,
  ContinuousComplianceSummary,
  ContinuousComplianceControlStatus,
  MonitoringFrequency,
  EvidenceFreshnessRating,
  ComplianceFrameworkSchema,
  ComplianceRequirementSchema,
  ContinuousControlSchema,
  ContinuousEvidenceSchema
} from '../src/types/continuousCompliance';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'continuous_compliance_db.json');

// Ensure database directory exists
if (!fs.existsSync(DB_DIR)) {
  try {
    fs.mkdirSync(DB_DIR, { recursive: true });
  } catch (err) {
    console.error('Failed to create data directory:', err);
  }
}

export interface ContinuousComplianceDbSchema {
  frameworks: Record<string, ComplianceFrameworkSchema[]>;
  requirements: Record<string, ComplianceRequirementSchema[]>;
  controls: Record<string, ContinuousControlSchema[]>;
  evaluations: Record<string, ContinuousControlEvaluation[]>;
  automatedTests: Record<string, AutomatedControlTest[]>;
  evidence: Record<string, ContinuousEvidenceSchema[]>;
  certifications: Record<string, CertificationLifecycle>;
  driftEvents: Record<string, ComplianceDriftEvent[]>;
  readinessPackages: Record<string, AuditReadinessPackage[]>;
  auditTrail: Record<string, Array<{
    id: string;
    timestamp: string;
    action: string;
    actor: string;
    details: string;
    sha256: string;
  }>>;
}

export const db: ContinuousComplianceDbSchema = {
  frameworks: {},
  requirements: {},
  controls: {},
  evaluations: {},
  automatedTests: {},
  evidence: {},
  certifications: {},
  driftEvents: {},
  readinessPackages: {},
  auditTrail: {}
};

// Load database from disk if present
if (fs.existsSync(DB_FILE)) {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    Object.assign(db, parsed);
  } catch (err) {
    console.warn('Failed to parse continuous compliance DB, initializing seed data.');
  }
}

export function persistDb() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write continuous compliance DB to disk:', err);
  }
}

export function calculateLifecycleMetrics(data: {
  expiryDate: string;
  surveillanceYear1Date: string;
  surveillanceYear2Date: string;
  recertificationDate: string;
  lastInternalAuditDate: string;
  lastManagementReviewDate: string;
}) {
  const now = new Date();
  const msPerDay = 1000 * 60 * 60 * 24;

  const getDaysDiff = (targetStr: string) => {
    const target = new Date(targetStr);
    return Math.round((target.getTime() - now.getTime()) / msPerDay);
  };

  const getDaysSince = (targetStr: string) => {
    const target = new Date(targetStr);
    return Math.max(0, Math.round((now.getTime() - target.getTime()) / msPerDay));
  };

  const daysUntilSurveillance1 = getDaysDiff(data.surveillanceYear1Date);
  const daysUntilSurveillance2 = getDaysDiff(data.surveillanceYear2Date);
  const daysUntilRecertification = getDaysDiff(data.recertificationDate);
  const daysUntilCertificateExpiry = getDaysDiff(data.expiryDate);
  const daysSinceInternalAudit = getDaysSince(data.lastInternalAuditDate);
  const daysSinceManagementReview = getDaysSince(data.lastManagementReviewDate);

  const internalAuditOverdue = daysSinceInternalAudit > 365;
  const managementReviewOverdue = daysSinceManagementReview > 365;
  const surveillanceOverdue = daysUntilSurveillance1 < 0;

  let certificationRiskLevel: 'LOW' | 'MODERATE' | 'ELEVATED' | 'CRITICAL' = 'LOW';
  if (internalAuditOverdue || managementReviewOverdue || surveillanceOverdue || daysUntilCertificateExpiry < 30) {
    certificationRiskLevel = 'CRITICAL';
  } else if (daysSinceInternalAudit > 300 || daysSinceManagementReview > 300 || daysUntilSurveillance1 < 60) {
    certificationRiskLevel = 'ELEVATED';
  } else if (daysUntilSurveillance1 < 120) {
    certificationRiskLevel = 'MODERATE';
  }

  return {
    daysUntilSurveillance1,
    daysUntilSurveillance2,
    daysUntilRecertification,
    daysUntilCertificateExpiry,
    daysSinceInternalAudit,
    daysSinceManagementReview,
    internalAuditOverdue,
    managementReviewOverdue,
    surveillanceOverdue,
    certificationRiskLevel
  };
}

export function generateSeedEvaluations(tenantId: string): ContinuousControlEvaluation[] {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const rawControls = [
    { code: 'A.5.1', title: 'Policies for information security', cat: 'Organizational', freq: 'Annual', status: 'Effective', freshness: 'Fresh' },
    { code: 'A.5.2', title: 'Information security roles and responsibilities', cat: 'Organizational', freq: 'Bi-Annual', status: 'Effective', freshness: 'Fresh' },
    { code: 'A.5.3', title: 'Segregation of duties', cat: 'Organizational', freq: 'Quarterly', status: 'Effective', freshness: 'Fresh' },
    { code: 'A.5.4', title: 'Management responsibilities', cat: 'Organizational', freq: 'Bi-Annual', status: 'Effective', freshness: 'Fresh' },
    { code: 'A.5.7', title: 'Threat intelligence', cat: 'Organizational', freq: 'Continuous', status: 'Effective', freshness: 'Fresh' },
    { code: 'A.5.8', title: 'Information security in project management', cat: 'Organizational', freq: 'Monthly', status: 'Effective', freshness: 'Fresh' },
    { code: 'A.5.9', title: 'Inventory of information and other associated assets', cat: 'Organizational', freq: 'Monthly', status: 'Effective', freshness: 'Fresh' },
    { code: 'A.5.10', title: 'Acceptable use of information and other associated assets', cat: 'Organizational', freq: 'Annual', status: 'Effective', freshness: 'Fresh' },
    { code: 'A.5.12', title: 'Classification of information', cat: 'Organizational', freq: 'Quarterly', status: 'Effective', freshness: 'Fresh' },
    { code: 'A.5.15', title: 'Access control', cat: 'Organizational', freq: 'Continuous', status: 'Effective', freshness: 'Fresh' },
    { code: 'A.5.17', title: 'Authentication information', cat: 'Organizational', freq: 'Daily', status: 'Effective', freshness: 'Fresh' },
    { code: 'A.5.18', title: 'Access rights', cat: 'Organizational', freq: 'Daily', status: 'Effective', freshness: 'Fresh' },
    { code: 'A.5.19', title: 'Information security in supplier relationships', cat: 'Organizational', freq: 'Monthly', status: 'Effective', freshness: 'Fresh' },
    { code: 'A.5.20', title: 'Addressing information security within supplier agreements', cat: 'Organizational', freq: 'Quarterly', status: 'Effective', freshness: 'Fresh' },
    { code: 'A.5.23', title: 'Information security for use of cloud services', cat: 'Organizational', freq: 'Monthly', status: 'Effective', freshness: 'Fresh' },
    { code: 'A.5.24', title: 'Information security incident management planning and preparation', cat: 'Organizational', freq: 'Bi-Annual', status: 'Effective', freshness: 'Fresh' },
    { code: 'A.5.29', title: 'Information security during disruption', cat: 'Organizational', freq: 'Annual', status: 'Effective', freshness: 'Fresh' },
    { code: 'A.5.30', title: 'ICT readiness for business continuity', cat: 'Organizational', freq: 'Bi-Annual', status: 'Effective', freshness: 'Fresh' },
    { code: 'A.5.31', title: 'Legal, statutory, regulatory and contractual requirements', cat: 'Organizational', freq: 'Quarterly', status: 'Effective', freshness: 'Fresh' },
    { code: 'A.5.36', title: 'Compliance with policies and standards for information security', cat: 'Organizational', freq: 'Quarterly', status: 'Effective', freshness: 'Fresh' },
    { code: 'A.5.37', title: 'Documented operating procedures', cat: 'Organizational', freq: 'Annual', status: 'Effective', freshness: 'Fresh' },
    
    // People Controls
    { code: 'A.6.1', title: 'Screening', cat: 'People', freq: 'Monthly', status: 'Effective', freshness: 'Fresh' },
    { code: 'A.6.2', title: 'Terms and conditions of employment', cat: 'People', freq: 'Annual', status: 'Effective', freshness: 'Fresh' },
    { code: 'A.6.3', title: 'Information security awareness, education and training', cat: 'People', freq: 'Weekly', status: 'Remediation Required', freshness: 'Aging' },
    { code: 'A.6.4', title: 'Disciplinary process', cat: 'People', freq: 'Annual', status: 'Effective', freshness: 'Fresh' },
    { code: 'A.6.5', title: 'Responsibilities after termination or change of employment', cat: 'People', freq: 'Quarterly', status: 'Effective', freshness: 'Fresh' },
    { code: 'A.6.8', title: 'Information security event reporting', cat: 'People', freq: 'Continuous', status: 'Effective', freshness: 'Fresh' },

    // Physical Controls
    { code: 'A.7.1', title: 'Physical security perimeters', cat: 'Physical', freq: 'Quarterly', status: 'Effective', freshness: 'Fresh' },
    { code: 'A.7.2', title: 'Physical entry', cat: 'Physical', freq: 'Quarterly', status: 'Effective', freshness: 'Fresh' },
    { code: 'A.7.3', title: 'Securing offices, rooms and facilities', cat: 'Physical', freq: 'Bi-Annual', status: 'Effective', freshness: 'Fresh' },
    { code: 'A.7.4', title: 'Physical security monitoring', cat: 'Physical', freq: 'Continuous', status: 'Effective', freshness: 'Fresh' },
    { code: 'A.7.7', title: 'Clear desk and clear screen', cat: 'Physical', freq: 'Monthly', status: 'Effective', freshness: 'Fresh' },
    { code: 'A.7.10', title: 'Storage media', cat: 'Physical', freq: 'Bi-Annual', status: 'Effective', freshness: 'Fresh' },

    // Technological Controls
    { code: 'A.8.1', title: 'User endpoint devices', cat: 'Technological', freq: 'Weekly', status: 'Effective', freshness: 'Fresh' },
    { code: 'A.8.2', title: 'Privileged access rights', cat: 'Technological', freq: 'Daily', status: 'Effective', freshness: 'Fresh' },
    { code: 'A.8.3', title: 'Information access restriction', cat: 'Technological', freq: 'Continuous', status: 'Effective', freshness: 'Fresh' },
    { code: 'A.8.4', title: 'Access to source code', cat: 'Technological', freq: 'Continuous', status: 'Effective', freshness: 'Fresh' },
    { code: 'A.8.5', title: 'Secure authentication', cat: 'Technological', freq: 'Daily', status: 'Effective', freshness: 'Fresh' },
    { code: 'A.8.7', title: 'Protection against malware', cat: 'Technological', freq: 'Continuous', status: 'Effective', freshness: 'Fresh' },
    { code: 'A.8.8', title: 'Management of technical vulnerabilities', cat: 'Technological', freq: 'Daily', status: 'Ineffective', freshness: 'Stale' },
    { code: 'A.8.9', title: 'Configuration management', cat: 'Technological', freq: 'Weekly', status: 'Effective', freshness: 'Fresh' },
    { code: 'A.8.10', title: 'Information deletion', cat: 'Technological', freq: 'Quarterly', status: 'Effective', freshness: 'Fresh' },
    { code: 'A.8.11', title: 'Data masking', cat: 'Technological', freq: 'Monthly', status: 'Effective', freshness: 'Fresh' },
    { code: 'A.8.12', title: 'Data leakage prevention', cat: 'Technological', freq: 'Continuous', status: 'Effective', freshness: 'Fresh' },
    { code: 'A.8.13', title: 'Information backup', cat: 'Technological', freq: 'Daily', status: 'Effective', freshness: 'Fresh' },
    { code: 'A.8.14', title: 'Redundancy of information processing facilities', cat: 'Technological', freq: 'Daily', status: 'Effective', freshness: 'Fresh' },
    { code: 'A.8.15', title: 'Logging', cat: 'Technological', freq: 'Continuous', status: 'Effective', freshness: 'Fresh' },
    { code: 'A.8.16', title: 'Monitoring activities', cat: 'Technological', freq: 'Continuous', status: 'Effective', freshness: 'Fresh' },
    { code: 'A.8.20', title: 'Network security', cat: 'Technological', freq: 'Daily', status: 'Effective', freshness: 'Fresh' },
    { code: 'A.8.21', title: 'Security of network services', cat: 'Technological', freq: 'Monthly', status: 'Effective', freshness: 'Fresh' },
    { code: 'A.8.24', title: 'Use of cryptography', cat: 'Technological', freq: 'Weekly', status: 'Effective', freshness: 'Fresh' },
    { code: 'A.8.28', title: 'Secure coding', cat: 'Technological', freq: 'Continuous', status: 'Effective', freshness: 'Fresh' },
    
    // Core Clauses
    { code: 'Cl.4.1', title: 'Understanding the organization and its context', cat: 'Organizational', freq: 'Annual', status: 'Effective', freshness: 'Fresh' },
    { code: 'Cl.4.2', title: 'Understanding the needs and expectations of interested parties', cat: 'Organizational', freq: 'Annual', status: 'Effective', freshness: 'Fresh' },
    { code: 'Cl.5.1', title: 'Leadership and commitment', cat: 'Organizational', freq: 'Bi-Annual', status: 'Effective', freshness: 'Fresh' },
    { code: 'Cl.6.1', title: 'Actions to address risks and opportunities', cat: 'Organizational', freq: 'Quarterly', status: 'Effective', freshness: 'Fresh' },
    { code: 'Cl.8.1', title: 'Operational planning and control', cat: 'Organizational', freq: 'Monthly', status: 'Effective', freshness: 'Fresh' },
    { code: 'Cl.9.1', title: 'Monitoring, measurement, analysis and evaluation', cat: 'Organizational', freq: 'Quarterly', status: 'Effective', freshness: 'Fresh' },
    { code: 'Cl.9.2', title: 'Internal audit program', cat: 'Organizational', freq: 'Annual', status: 'Effective', freshness: 'Fresh' },
    { code: 'Cl.9.3', title: 'Management review', cat: 'Organizational', freq: 'Annual', status: 'Effective', freshness: 'Fresh' },
    { code: 'Cl.10.1', title: 'Continual improvement', cat: 'Organizational', freq: 'Continuous', status: 'Effective', freshness: 'Fresh' },
    { code: 'Cl.10.2', title: 'Nonconformity and corrective action', cat: 'Organizational', freq: 'Monthly', status: 'Nonconforming', freshness: 'Expired' }
  ];

  return rawControls.map((c, idx) => {
    const isDrift = c.status === 'Ineffective' || c.status === 'Nonconforming' || c.status === 'Remediation Required';
    return {
      id: `eval_${c.code.replace('.', '_')}_${tenantId}`,
      tenantId,
      controlCode: c.code,
      framework: 'ISO/IEC 27001:2022',
      clauseOrAnnex: c.code.startsWith('Cl') ? 'Clause 4-10' : 'Annex A',
      title: c.title,
      description: `Comprehensive continuous control operational requirements for ${c.code}: ${c.title}.`,
      category: c.cat as any,
      controlOwner: c.cat === 'Technological' ? 'Security Engineering Lead' : c.cat === 'People' ? 'HR / People Lead' : 'ISMS Manager',
      responsibleDepartment: c.cat === 'Technological' ? 'DevOps & IT' : c.cat === 'People' ? 'People & Culture' : 'Governance & Compliance',
      applicabilityStatus: 'Applicable',
      implementationStatus: 'Implemented',
      operatingEffectivenessStatus: c.status === 'Effective' ? 'Effective' : 'Ineffective',
      overallStatus: c.status as ContinuousComplianceControlStatus,
      monitoringFrequency: c.freq as MonitoringFrequency,
      lastEvaluated: new Date(now.getTime() - (idx % 5) * 3600000).toISOString(),
      nextEvaluationDue: new Date(now.getTime() + 24 * 3600000).toISOString(),
      lastEvidenceDate: new Date(now.getTime() - (idx % 14) * 86400000).toISOString(),
      evidenceFreshnessStatus: c.freshness as EvidenceFreshnessRating,
      evidenceIds: [`evd_ctrl_${c.code.toLowerCase().replace('.', '_')}`],
      mappedRiskIds: idx % 3 === 0 ? ['risk-01', 'risk-02'] : ['risk-03'],
      mappedCapaIds: isDrift ? ['CAPA-2024-03'] : [],
      automatedTestIds: c.code === 'A.5.17' ? ['TEST-MFA-01'] : c.code === 'A.8.8' ? ['TEST-VULN-02'] : [],
      hasActiveException: false,
      driftDetected: isDrift,
      driftReason: isDrift ? `Automated check or SLA breach detected on ${c.code}. Operating effectiveness compromised.` : undefined,
      evaluationHistory: [
        {
          evaluatedAt: todayStr,
          status: c.status as ContinuousComplianceControlStatus,
          evaluator: 'SKANDA Continuous Evaluation Daemon',
          notes: `Automated post-certification evaluation against telemetry, evidence freshness, and SLA clocks.`
        }
      ]
    };
  });
}

export function generateSeedFrameworks(): ComplianceFrameworkSchema[] {
  return [
    {
      id: 'fw-iso-27001-2022',
      code: 'ISO/IEC 27001:2022',
      name: 'Information Security Management Systems — Requirements',
      version: '2022',
      authority: 'ISO_IEC',
      category: 'INFORMATION_SECURITY',
      description: 'The international standard specifying requirements for establishing, implementing, maintaining and continually improving an information security management system (ISMS).',
      officialReferenceUrl: 'https://www.iso.org/standard/27001',
      totalClausesCount: 7,
      totalControlsCount: 93,
      surveillanceCycleMonths: 12,
      accreditationRequired: true,
      statementOfApplicabilityMandatory: true,
      status: 'ACTIVE',
      applicableJurisdictions: ['Global', 'EU', 'SG', 'US', 'UK'],
      supportedCertificationBodies: ['BSI Assurance UK', 'TÜV Rheinland', 'DNV', 'Bureau Veritas', 'SGS'],
      domains: [
        { id: 'dom-a5', code: 'A.5', title: 'Organizational controls', description: 'Policies, roles, asset management, access control, supplier relationships', controlCount: 37 },
        { id: 'dom-a6', code: 'A.6', title: 'People controls', description: 'Screening, employment terms, security awareness, disciplinary processes', controlCount: 8 },
        { id: 'dom-a7', code: 'A.7', title: 'Physical controls', description: 'Perimeters, physical entry, secure offices, clear desk and clear screen', controlCount: 14 },
        { id: 'dom-a8', code: 'A.8', title: 'Technological controls', description: 'Endpoint devices, privileged access, cryptography, vulnerability management, secure coding', controlCount: 34 }
      ],
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: new Date().toISOString()
    },
    {
      id: 'fw-iso-27701-2019',
      code: 'ISO/IEC 27701:2019',
      name: 'Privacy Information Management System (PIMS)',
      version: '2019',
      authority: 'ISO_IEC',
      category: 'PRIVACY_DATA_PROTECTION',
      description: 'Specifies requirements and provides guidance for establishing, implementing, maintaining and continually improving a PIMS in the form of an extension to ISO/IEC 27001 and ISO/IEC 27002.',
      officialReferenceUrl: 'https://www.iso.org/standard/71670.html',
      totalClausesCount: 8,
      totalControlsCount: 49,
      surveillanceCycleMonths: 12,
      accreditationRequired: true,
      statementOfApplicabilityMandatory: true,
      status: 'ACTIVE',
      applicableJurisdictions: ['Global', 'EU (GDPR)', 'SG (PDPA)', 'US (CCPA)'],
      supportedCertificationBodies: ['BSI', 'DNV', 'TÜV SÜD'],
      domains: [
        { id: 'dom-pims-ctrl', code: 'PIMS-C', title: 'PII Controller Controls', description: 'Specific controls for organizations acting as PII controllers', controlCount: 31 },
        { id: 'dom-pims-proc', code: 'PIMS-P', title: 'PII Processor Controls', description: 'Specific controls for organizations acting as PII processors', controlCount: 18 }
      ],
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: new Date().toISOString()
    },
    {
      id: 'fw-soc2-type2',
      code: 'SOC 2 Type II',
      name: 'AICPA Service Organization Control 2 (Trust Services Criteria)',
      version: '2017 (Rev 2022)',
      authority: 'AICPA',
      category: 'CLOUD_SECURITY',
      description: 'Report on controls at a service organization relevant to security, availability, processing integrity, confidentiality, and privacy over a 12-month period.',
      totalClausesCount: 5,
      totalControlsCount: 64,
      surveillanceCycleMonths: 12,
      accreditationRequired: true,
      statementOfApplicabilityMandatory: false,
      status: 'ACTIVE',
      applicableJurisdictions: ['US', 'Global'],
      supportedCertificationBodies: ['AICPA Licensed CPA Firms'],
      domains: [
        { id: 'dom-soc2-sec', code: 'CC', title: 'Common Criteria (Security)', description: 'Governance, risk assessment, monitoring, access, operational controls', controlCount: 33 },
        { id: 'dom-soc2-avail', code: 'A', title: 'Availability', description: 'Capacity management, environmental protections, disaster recovery', controlCount: 7 },
        { id: 'dom-soc2-conf', code: 'C', title: 'Confidentiality', description: 'Data identification, retention, disposal, safeguards', controlCount: 8 }
      ],
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: new Date().toISOString()
    },
    {
      id: 'fw-mas-trm-2021',
      code: 'MAS TRM Guidelines 2021',
      name: 'Monetary Authority of Singapore Technology Risk Management Guidelines',
      version: '2021',
      authority: 'MAS_SINGAPORE',
      category: 'FINANCIAL_REGULATORY',
      description: 'Risk management principles and standards to guide financial institutions in establishing sound technology risk governance, cyber hygiene, and operational resilience.',
      totalClausesCount: 13,
      totalControlsCount: 88,
      surveillanceCycleMonths: 12,
      accreditationRequired: false,
      statementOfApplicabilityMandatory: false,
      status: 'ACTIVE',
      applicableJurisdictions: ['SG', 'APAC'],
      supportedCertificationBodies: ['MAS Regulatory Inspection / Internal Audit'],
      domains: [
        { id: 'dom-mas-gov', code: 'TRM-Gov', title: 'IT Governance & Risk Oversight', description: 'Board oversight, technology steering, cyber risk policies', controlCount: 18 },
        { id: 'dom-mas-ops', code: 'TRM-Ops', title: 'Technology Operations & Resilience', description: 'Capacity, high availability, change management, incident handling', controlCount: 42 },
        { id: 'dom-mas-sec', code: 'TRM-Sec', title: 'Cyber Security & Access Defense', description: 'Network protection, IAM, API security, vulnerability management', controlCount: 28 }
      ],
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: new Date().toISOString()
    }
  ];
}

export function generateSeedRequirements(): ComplianceRequirementSchema[] {
  return [
    {
      id: 'req-iso27001-cl4-1',
      frameworkId: 'fw-iso-27001-2022',
      frameworkCode: 'ISO/IEC 27001:2022',
      requirementCode: 'Cl.4.1',
      clauseNumber: '4.1',
      title: 'Understanding the organization and its context',
      requirementText: 'The organization shall determine external and internal issues that are relevant to its purpose and that affect its ability to achieve the intended outcome(s) of its information security management system.',
      type: 'MANAGEMENT_SYSTEM_CLAUSE',
      mandatory: true,
      auditCriteria: ['Documented context analysis (PESTLE/SWOT)', 'Annual board or management review', 'Alignment with ISMS scope'],
      evidenceGuidance: 'Provide approved Organizational Context & Stakeholder Analysis document signed by C-suite within past 12 months.',
      defaultMonitoringFrequency: 'Annual',
      freshnessSlaDays: 365,
      mappedControlIds: ['ctrl-cl-4-1'],
      riskSignificance: 'HIGH',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: new Date().toISOString()
    },
    {
      id: 'req-iso27001-cl9-2',
      frameworkId: 'fw-iso-27001-2022',
      frameworkCode: 'ISO/IEC 27001:2022',
      requirementCode: 'Cl.9.2',
      clauseNumber: '9.2',
      title: 'Internal audit program',
      requirementText: 'The organization shall conduct internal audits at planned intervals to provide information on whether the information security management system conforms to the organization’s own requirements and the requirements of ISO/IEC 27001.',
      type: 'MANAGEMENT_SYSTEM_CLAUSE',
      mandatory: true,
      auditCriteria: ['Documented audit charter and schedule', 'Auditor objectivity and independence', 'Comprehensive audit report and nonconformity logs'],
      evidenceGuidance: 'Complete annual internal audit report covering Clauses 4-10 and all active Annex A controls, signed by lead internal auditor.',
      defaultMonitoringFrequency: 'Annual',
      freshnessSlaDays: 365,
      mappedControlIds: ['ctrl-cl-9-2'],
      riskSignificance: 'CRITICAL',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: new Date().toISOString()
    },
    {
      id: 'req-iso27001-cl9-3',
      frameworkId: 'fw-iso-27001-2022',
      frameworkCode: 'ISO/IEC 27001:2022',
      requirementCode: 'Cl.9.3',
      clauseNumber: '9.3',
      title: 'Management review',
      requirementText: 'Top management shall review the organization’s information security management system at planned intervals to ensure its continuing suitability, adequacy and effectiveness.',
      type: 'MANAGEMENT_SYSTEM_CLAUSE',
      mandatory: true,
      auditCriteria: ['C-level / Executive attendance', 'Review of audit results, risk treatment status, and continuous metrics', 'Documented decisions and resource commitments'],
      evidenceGuidance: 'Signed Management Review Minutes with action items and executive signatory within past 12 months.',
      defaultMonitoringFrequency: 'Annual',
      freshnessSlaDays: 365,
      mappedControlIds: ['ctrl-cl-9-3'],
      riskSignificance: 'CRITICAL',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: new Date().toISOString()
    },
    {
      id: 'req-iso27001-a5-15',
      frameworkId: 'fw-iso-27001-2022',
      frameworkCode: 'ISO/IEC 27001:2022',
      requirementCode: 'A.5.15',
      clauseNumber: 'A.5.15',
      title: 'Access control',
      requirementText: 'Rules to control physical and logical access to information and other associated assets shall be established and implemented based on business and information security requirements.',
      type: 'OPERATIONAL_CONTROL',
      mandatory: true,
      auditCriteria: ['Role-based access control (RBAC) policy', 'Principle of least privilege enforced', 'Quarterly privileged access reviews'],
      evidenceGuidance: 'Access Control Policy, RBAC matrix, and quarterly user entitlement review signoffs.',
      defaultMonitoringFrequency: 'Continuous',
      freshnessSlaDays: 90,
      mappedControlIds: ['ctrl-a-5-15'],
      riskSignificance: 'CRITICAL',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: new Date().toISOString()
    },
    {
      id: 'req-iso27001-a8-8',
      frameworkId: 'fw-iso-27001-2022',
      frameworkCode: 'ISO/IEC 27001:2022',
      requirementCode: 'A.8.8',
      clauseNumber: 'A.8.8',
      title: 'Management of technical vulnerabilities',
      requirementText: 'Information about technical vulnerabilities of information systems being used shall be obtained, the organization’s exposure to such vulnerabilities shall be evaluated and appropriate measures shall be taken.',
      type: 'OPERATIONAL_CONTROL',
      mandatory: true,
      auditCriteria: ['Automated vulnerability scanning cadence', 'SLA for remediation: Critical <= 7 days, High <= 14 days', 'Zero unmitigated critical CVEs in production'],
      evidenceGuidance: 'Automated vulnerability scan reports, container vulnerability manifests, and patch management records.',
      defaultMonitoringFrequency: 'Daily',
      freshnessSlaDays: 14,
      mappedControlIds: ['ctrl-a-8-8'],
      riskSignificance: 'CRITICAL',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: new Date().toISOString()
    }
  ];
}

export function generateSeedControls(tenantId: string): ContinuousControlSchema[] {
  return [
    {
      id: 'ctrl-cl-4-1',
      tenantId,
      controlCode: 'Cl.4.1',
      title: 'Understanding the organization and its context',
      description: 'Establish and document internal/external contextual drivers and ISMS alignment.',
      category: 'Organizational',
      primaryFrameworkId: 'fw-iso-27001-2022',
      clauseOrAnnex: 'Clause 4',
      crossFrameworkMappings: [
        { frameworkCode: 'SOC 2 Type II', mappedControlCode: 'CC1.1', relationshipType: 'EXACT_EQUIVALENT' },
        { frameworkCode: 'MAS TRM Guidelines 2021', mappedControlCode: 'Sec 3.1', relationshipType: 'COMPLEMENTARY' }
      ],
      controlType: ['Preventive'],
      securityProperties: ['Confidentiality', 'Integrity', 'Availability'],
      cybersecurityConcepts: ['Identify'],
      securityDomains: ['Governance_and_Ecosystem'],
      controlOwner: 'Chief Information Security Officer (CISO)',
      responsibleDepartment: 'Governance & Compliance',
      defaultMonitoringFrequency: 'Annual',
      evidenceCollectionSlaDays: 365,
      isContinuousMonitoringEnabled: true,
      automatedTestCapable: false,
      requiresDocumentedProcedure: true,
      tags: ['ISMS', 'Governance', 'Clause-4'],
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: new Date().toISOString()
    },
    {
      id: 'ctrl-a-5-15',
      tenantId,
      controlCode: 'A.5.15',
      title: 'Access control',
      description: 'Implement logical and physical access control based on least privilege and business necessity.',
      category: 'Organizational',
      primaryFrameworkId: 'fw-iso-27001-2022',
      clauseOrAnnex: 'Annex A.5',
      crossFrameworkMappings: [
        { frameworkCode: 'SOC 2 Type II', mappedControlCode: 'CC6.1', relationshipType: 'EXACT_EQUIVALENT' },
        { frameworkCode: 'MAS TRM Guidelines 2021', mappedControlCode: 'Sec 8.1', relationshipType: 'SUBSET' }
      ],
      controlType: ['Preventive'],
      securityProperties: ['Confidentiality', 'Integrity'],
      cybersecurityConcepts: ['Protect'],
      securityDomains: ['Protection'],
      controlOwner: 'Head of Identity & Access Management',
      responsibleDepartment: 'SecOps & IAM',
      defaultMonitoringFrequency: 'Continuous',
      evidenceCollectionSlaDays: 30,
      isContinuousMonitoringEnabled: true,
      automatedTestCapable: true,
      requiresDocumentedProcedure: true,
      tags: ['IAM', 'AccessControl', 'ZeroTrust'],
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: new Date().toISOString()
    },
    {
      id: 'ctrl-a-5-17',
      tenantId,
      controlCode: 'A.5.17',
      title: 'Authentication information',
      description: 'Management and allocation of authentication information including multi-factor authentication (MFA).',
      category: 'Organizational',
      primaryFrameworkId: 'fw-iso-27001-2022',
      clauseOrAnnex: 'Annex A.5',
      crossFrameworkMappings: [
        { frameworkCode: 'SOC 2 Type II', mappedControlCode: 'CC6.2', relationshipType: 'EXACT_EQUIVALENT' },
        { frameworkCode: 'MAS TRM Guidelines 2021', mappedControlCode: 'Sec 8.3', relationshipType: 'EXACT_EQUIVALENT' }
      ],
      controlType: ['Preventive'],
      securityProperties: ['Confidentiality', 'Integrity'],
      cybersecurityConcepts: ['Protect'],
      securityDomains: ['Protection'],
      controlOwner: 'Security Engineering Lead',
      responsibleDepartment: 'DevOps & IT',
      defaultMonitoringFrequency: 'Daily',
      evidenceCollectionSlaDays: 7,
      isContinuousMonitoringEnabled: true,
      automatedTestCapable: true,
      requiresDocumentedProcedure: true,
      tags: ['MFA', 'Authentication', 'Annex-A5'],
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: new Date().toISOString()
    },
    {
      id: 'ctrl-a-8-8',
      tenantId,
      controlCode: 'A.8.8',
      title: 'Management of technical vulnerabilities',
      description: 'Identify, track, and remediate technical vulnerabilities across container images, libraries, and cloud hosts.',
      category: 'Technological',
      primaryFrameworkId: 'fw-iso-27001-2022',
      clauseOrAnnex: 'Annex A.8',
      crossFrameworkMappings: [
        { frameworkCode: 'SOC 2 Type II', mappedControlCode: 'CC7.1', relationshipType: 'EXACT_EQUIVALENT' },
        { frameworkCode: 'MAS TRM Guidelines 2021', mappedControlCode: 'Sec 11.2', relationshipType: 'EXACT_EQUIVALENT' }
      ],
      controlType: ['Preventive', 'Corrective'],
      securityProperties: ['Confidentiality', 'Integrity', 'Availability'],
      cybersecurityConcepts: ['Identify', 'Protect', 'Respond'],
      securityDomains: ['Defense'],
      controlOwner: 'Product Security Lead',
      responsibleDepartment: 'Product Security',
      defaultMonitoringFrequency: 'Daily',
      evidenceCollectionSlaDays: 14,
      isContinuousMonitoringEnabled: true,
      automatedTestCapable: true,
      requiresDocumentedProcedure: true,
      tags: ['CVE', 'Vulnerability', 'Patching', 'DevSecOps'],
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: new Date().toISOString()
    }
  ];
}

export function generateSeedEvidence(tenantId: string): ContinuousEvidenceSchema[] {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  return [
    {
      id: `evd-${tenantId}-a517-mfa`,
      tenantId,
      controlCode: 'A.5.17',
      controlTitle: 'Authentication information',
      evidenceTitle: 'Cloud Console & IdP Administrative MFA Telemetry Report',
      fileName: 'Okta_AWS_IAM_MFA_Enforcement_2026_Q3.json',
      fileSizeBytes: 245760,
      mimeType: 'application/json',
      storageUri: `worm://skanda-evidence-vault/${tenantId}/2026/09/mfa_telemetry.json`,
      department: 'DevOps & IT',
      uploadedBy: 'Automated Collector Daemon',
      uploadedAt: new Date(now.getTime() - 2 * 3600000).toISOString(),
      expiryDate: new Date(now.getTime() + 7 * 86400000).toISOString(),
      collectionFrequency: 'Daily',
      slaMaxDays: 1,
      ageInDays: 0,
      slaRemainingDays: 1,
      freshnessStatus: 'Fresh',
      freshnessScore: 100,
      sha256Hash: crypto.createHash('sha256').update(`mfa-${tenantId}-${todayStr}`).digest('hex'),
      tamperEvidentVerified: true,
      digitalSignatureId: 'sig-kms-sha256-001',
      annexA537Compliant: true,
      verified: true,
      verifiedBy: 'Lead Internal Auditor',
      verifiedAt: new Date(now.getTime() - 1 * 3600000).toISOString(),
      tags: ['MFA', 'IAM', 'Continuous-Telemetry'],
      decayAuditHistory: [
        { evaluatedAt: todayStr, freshnessStatus: 'Fresh', ageInDays: 0, score: 100 }
      ],
      createdAt: new Date(now.getTime() - 2 * 3600000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: `evd-${tenantId}-a88-vuln`,
      tenantId,
      controlCode: 'A.8.8',
      controlTitle: 'Management of technical vulnerabilities',
      evidenceTitle: 'Container & Host Vulnerability Scan Delta Report',
      fileName: 'Trivy_AWS_Inspector_Scan_20260914.json',
      fileSizeBytes: 1845200,
      mimeType: 'application/json',
      storageUri: `worm://skanda-evidence-vault/${tenantId}/2026/09/vuln_scan.json`,
      department: 'Product Security',
      uploadedBy: 'GitHub Actions CI/CD Pipeline',
      uploadedAt: new Date(now.getTime() - 16 * 86400000).toISOString(),
      expiryDate: new Date(now.getTime() - 2 * 86400000).toISOString(),
      collectionFrequency: 'Daily',
      slaMaxDays: 14,
      ageInDays: 16,
      slaRemainingDays: -2,
      freshnessStatus: 'Stale',
      freshnessScore: 45,
      sha256Hash: crypto.createHash('sha256').update(`vuln-${tenantId}-${todayStr}`).digest('hex'),
      tamperEvidentVerified: true,
      digitalSignatureId: 'sig-kms-sha256-002',
      annexA537Compliant: true,
      verified: false,
      tags: ['CVE', 'Vulnerability', 'SLA-Decay'],
      decayAuditHistory: [
        { evaluatedAt: todayStr, freshnessStatus: 'Stale', ageInDays: 16, score: 45 }
      ],
      createdAt: new Date(now.getTime() - 16 * 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: `evd-${tenantId}-cl92-audit`,
      tenantId,
      controlCode: 'Cl.9.2',
      controlTitle: 'Internal audit program',
      evidenceTitle: 'Annual ISMS Comprehensive Internal Audit Report & Corrective Action Register',
      fileName: 'ISMS_Internal_Audit_Report_FY2026_Signed.pdf',
      fileSizeBytes: 4219000,
      mimeType: 'application/pdf',
      storageUri: `worm://skanda-evidence-vault/${tenantId}/2026/audit/internal_audit_2026.pdf`,
      department: 'Governance & Compliance',
      uploadedBy: 'Lead Internal Auditor',
      uploadedAt: new Date(now.getTime() - 65 * 86400000).toISOString(),
      expiryDate: new Date(now.getTime() + 300 * 86400000).toISOString(),
      collectionFrequency: 'Annual',
      slaMaxDays: 365,
      ageInDays: 65,
      slaRemainingDays: 300,
      freshnessStatus: 'Fresh',
      freshnessScore: 92,
      sha256Hash: crypto.createHash('sha256').update(`cl92-${tenantId}-internal-audit`).digest('hex'),
      tamperEvidentVerified: true,
      digitalSignatureId: 'sig-kms-sha256-003',
      annexA537Compliant: true,
      verified: true,
      verifiedBy: 'Dr. Marcus Vance (BSI)',
      verifiedAt: new Date(now.getTime() - 60 * 86400000).toISOString(),
      tags: ['Clause-9.2', 'Internal-Audit', 'UKAS-Evidence'],
      decayAuditHistory: [
        { evaluatedAt: todayStr, freshnessStatus: 'Fresh', ageInDays: 65, score: 92 }
      ],
      createdAt: new Date(now.getTime() - 65 * 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
}

export function ensureTenantSeeded(tenantId: string) {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // 0. Seed Frameworks, Requirements, Controls, and Evidence Schema Extensions
  if (!db.frameworks[tenantId] || db.frameworks[tenantId].length === 0) {
    db.frameworks[tenantId] = generateSeedFrameworks();
  }
  if (!db.requirements[tenantId] || db.requirements[tenantId].length === 0) {
    db.requirements[tenantId] = generateSeedRequirements();
  }
  if (!db.controls[tenantId] || db.controls[tenantId].length === 0) {
    db.controls[tenantId] = generateSeedControls(tenantId);
  }
  if (!db.evidence[tenantId] || db.evidence[tenantId].length === 0) {
    db.evidence[tenantId] = generateSeedEvidence(tenantId);
  }

  // 1. Certification Lifecycle
  if (!db.certifications[tenantId]) {
    const issueDate = new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const expiryDate = new Date(now.getTime() + 975 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const surv1Date = new Date(now.getTime() + 245 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const surv2Date = new Date(now.getTime() + 610 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const recertDate = new Date(now.getTime() + 970 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const lastInternalAudit = new Date(now.getTime() - 65 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const nextInternalAudit = new Date(now.getTime() + 115 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const lastMgmtRev = new Date(now.getTime() - 95 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const nextMgmtRev = new Date(now.getTime() + 85 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    db.certifications[tenantId] = {
      tenantId,
      standard: 'ISO/IEC 27001:2022',
      certificationStatus: 'Certified — Active',
      certificationBody: 'BSI Assurance UK Ltd (UKAS Accreditation #0003)',
      certificateNumber: 'ISMS 749281-2024-SKD',
      scopeStatement: 'The Information Security Management System covering SaaS GRC platform design, cloud engineering, customer data processing, threat intelligence operations, and incident response from Singapore & London centers.',
      issueDate,
      expiryDate,
      surveillanceYear1Date: surv1Date,
      surveillanceYear1Status: 'Scheduled',
      surveillanceYear2Date: surv2Date,
      surveillanceYear2Status: 'Scheduled',
      recertificationDate: recertDate,
      recertificationStatus: 'Planned',
      certificationConditions: [
        'Maintain continuous quarterly evidence collection across all 93 Annex A controls',
        'Address Minor Nonconformity NC-2024-03 on Privileged Access review within 90 days',
        'Submit annual internal audit summary report 30 days prior to Surveillance 1'
      ],
      lastInternalAuditDate: lastInternalAudit,
      nextInternalAuditDate: nextInternalAudit,
      lastManagementReviewDate: lastMgmtRev,
      nextManagementReviewDate: nextMgmtRev,
      leadAuditor: 'Dr. Marcus Vance, Lead Auditor IRCA/BSI',
      cbClientManager: 'Eleanor Davies (BSI Client Services UK)',
      calculatedMetrics: calculateLifecycleMetrics({
        expiryDate,
        surveillanceYear1Date: surv1Date,
        surveillanceYear2Date: surv2Date,
        recertificationDate: recertDate,
        lastInternalAuditDate: lastInternalAudit,
        lastManagementReviewDate: lastMgmtRev
      })
    };
  }

  // 2. Automated Control Tests (15 Production-Grade Test Suites)
  if (!db.automatedTests[tenantId] || db.automatedTests[tenantId].length === 0) {
    db.automatedTests[tenantId] = [
      {
        id: 'TEST-MFA-01',
        tenantId,
        controlCode: 'A.5.17',
        testName: 'Privileged & Administrative Account MFA Enforcement',
        description: 'Verifies 100% enforcement of FIDO2/WebAuthn or hardware TOTP on all cloud console and root accounts.',
        sourceSystem: 'Okta & AWS IAM Identity Center API',
        executionFrequency: 'Daily',
        lastExecuted: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        nextExecution: new Date(now.getTime() + 22 * 60 * 60 * 1000).toISOString(),
        status: 'PASS',
        metricValue: '100% MFA Enforced (48/48 Admins)',
        threshold: '100% required for ISO 27001 A.5.17 & A.8.5',
        testOwner: 'SecOps Team',
        evidenceGeneratedId: 'evd-live-a517-mfa',
        evidenceGeneratedSha256: crypto.createHash('sha256').update(`mfa-${tenantId}-${todayStr}`).digest('hex'),
        history: [
          { timestamp: new Date(now.getTime() - 24 * 3600000).toISOString(), status: 'PASS', metricValue: '100% (48/48)' },
          { timestamp: new Date(now.getTime() - 48 * 3600000).toISOString(), status: 'PASS', metricValue: '100% (48/48)' }
        ]
      },
      {
        id: 'TEST-VULN-02',
        tenantId,
        controlCode: 'A.8.8',
        testName: 'Critical & High Vulnerability Remediation SLA (14-Day Limit)',
        description: 'Queries container image scans, OS packages, and SAST repositories to verify zero unresolved Critical CVEs > 14 days.',
        sourceSystem: 'Trivy / AWS Inspector / GitHub Dependabot',
        executionFrequency: 'Daily',
        lastExecuted: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
        nextExecution: new Date(now.getTime() + 20 * 60 * 60 * 1000).toISOString(),
        status: 'WARNING',
        metricValue: '1 High CVE Breached SLA (16 days open: CVE-2026-1049 libssl3)',
        threshold: '0 Critical > 7 days, 0 High > 14 days',
        failureReason: 'Patch libssl3 pending staging deployment approval by DevOps.',
        testOwner: 'Product Security Lead',
        evidenceGeneratedId: 'evd-live-a88-vuln',
        evidenceGeneratedSha256: crypto.createHash('sha256').update(`vuln-${tenantId}-${todayStr}`).digest('hex'),
        history: [
          { timestamp: new Date(now.getTime() - 24 * 3600000).toISOString(), status: 'WARNING', metricValue: '1 High CVE' },
          { timestamp: new Date(now.getTime() - 48 * 3600000).toISOString(), status: 'PASS', metricValue: '0 Open CVEs' }
        ]
      },
      {
        id: 'TEST-BCP-03',
        tenantId,
        controlCode: 'A.8.14',
        testName: 'Redundancy of Information Processing Facilities & Automated DB Restore Validation',
        description: 'Automated nightly spinning of isolated container to restore production PostgreSQL snapshot, verify checksums, and measure RTO.',
        sourceSystem: 'AWS Backup & RDS Automated Restore Validator',
        executionFrequency: 'Daily',
        lastExecuted: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(),
        nextExecution: new Date(now.getTime() + 19 * 60 * 60 * 1000).toISOString(),
        status: 'PASS',
        metricValue: 'Restore Successful: RTO 18 mins, Integrity 100%',
        threshold: 'RTO <= 4h, RPO <= 1h, Checksum Match 100%',
        testOwner: 'Site Reliability Engineering',
        evidenceGeneratedId: 'evd-live-a814-restore',
        evidenceGeneratedSha256: crypto.createHash('sha256').update(`bcp-${tenantId}-${todayStr}`).digest('hex'),
        history: [
          { timestamp: new Date(now.getTime() - 24 * 3600000).toISOString(), status: 'PASS', metricValue: 'RTO 19m' }
        ]
      },
      {
        id: 'TEST-IAM-04',
        tenantId,
        controlCode: 'A.5.18',
        testName: 'Access Rights Deprovisioning on Termination (Leaver SLA < 24h)',
        description: 'Reconciles HRIS employee termination records against IdP active user status to detect orphaned active credentials.',
        sourceSystem: 'Workday HRIS + Okta Directory Service',
        executionFrequency: 'Daily',
        lastExecuted: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
        nextExecution: new Date(now.getTime() + 18 * 60 * 60 * 1000).toISOString(),
        status: 'PASS',
        metricValue: '0 Orphaned Accounts, Mean Deprovisioning Time: 3.2 mins',
        threshold: '100% deprovisioned <= 24 hours of exit',
        testOwner: 'IT Operations & HR Ops',
        evidenceGeneratedId: 'evd-live-a518-deprov',
        evidenceGeneratedSha256: crypto.createHash('sha256').update(`iam-${tenantId}-${todayStr}`).digest('hex'),
        history: [
          { timestamp: new Date(now.getTime() - 24 * 3600000).toISOString(), status: 'PASS', metricValue: '0 Orphaned' }
        ]
      },
      {
        id: 'TEST-SECLOG-05',
        tenantId,
        controlCode: 'A.8.15',
        testName: 'Centralized Logging & Protection of Log Information (WORM Compliance)',
        description: 'Verifies continuous streaming of CloudTrail, Kubernetes audit logs, and app access logs to S3 bucket with Object Lock (WORM).',
        sourceSystem: 'AWS CloudWatch / S3 Object Lock & Datadog',
        executionFrequency: 'Continuous',
        lastExecuted: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
        nextExecution: new Date(now.getTime() + 45 * 60 * 1000).toISOString(),
        status: 'PASS',
        metricValue: 'Logs Ingested: 14.2M events/24h, Immutability Verified (WORM 365d)',
        threshold: 'Zero unencrypted logs, WORM retention >= 365 days',
        testOwner: 'SecOps & Compliance',
        evidenceGeneratedId: 'evd-live-a815-logs',
        evidenceGeneratedSha256: crypto.createHash('sha256').update(`logs-${tenantId}-${todayStr}`).digest('hex'),
        history: [
          { timestamp: new Date(now.getTime() - 3600000).toISOString(), status: 'PASS', metricValue: 'WORM Verified' }
        ]
      },
      {
        id: 'TEST-SAST-06',
        tenantId,
        controlCode: 'A.8.28',
        testName: 'Secure Coding & CI/CD Security Gate Enforcement',
        description: 'Validates that 100% of pull requests merged to main branch passed GitHub CodeQL SAST and secret push protection.',
        sourceSystem: 'GitHub Actions & Branch Protection Rule API',
        executionFrequency: 'Continuous',
        lastExecuted: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
        nextExecution: new Date(now.getTime() + 30 * 60 * 1000).toISOString(),
        status: 'PASS',
        metricValue: '100% PRs Scanned (142/142), 0 Secret Leaks Detected',
        threshold: '100% coverage, blocking merges on Critical SAST findings',
        testOwner: 'Application Security Lead',
        evidenceGeneratedId: 'evd-live-a828-sast',
        evidenceGeneratedSha256: crypto.createHash('sha256').update(`sast-${tenantId}-${todayStr}`).digest('hex'),
        history: [
          { timestamp: new Date(now.getTime() - 3600000).toISOString(), status: 'PASS', metricValue: '100% Scanned' }
        ]
      },
      {
        id: 'TEST-PORT-07',
        tenantId,
        controlCode: 'A.8.20',
        testName: 'Network Security & Public Exposure Sentinel (Zero Open Ingress)',
        description: 'External Shodan/Censys scan validation ensuring zero unauthorized public listening ports (SSH, RDP, DBs) on production VPCs.',
        sourceSystem: 'AWS VPC Security Groups & External Attack Surface Manager',
        executionFrequency: 'Daily',
        lastExecuted: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
        nextExecution: new Date(now.getTime() + 23 * 60 * 60 * 1000).toISOString(),
        status: 'PASS',
        metricValue: '0 Unauthorized Ports Exposed (Only 443/TLS permitted)',
        threshold: 'Zero unapproved public ingress ports',
        testOwner: 'Cloud Infrastructure Lead',
        evidenceGeneratedId: 'evd-live-a820-network',
        evidenceGeneratedSha256: crypto.createHash('sha256').update(`port-${tenantId}-${todayStr}`).digest('hex'),
        history: [
          { timestamp: new Date(now.getTime() - 24 * 3600000).toISOString(), status: 'PASS', metricValue: '0 Exposed' }
        ]
      },
      {
        id: 'TEST-AWARE-08',
        tenantId,
        controlCode: 'A.6.3',
        testName: 'Security Awareness Training & Phishing Simulation Completion',
        description: 'Tracks employee completion rate for annual ISO security training and monthly simulated phishing click rates.',
        sourceSystem: 'KnowBe4 / CultureAmp API',
        executionFrequency: 'Weekly',
        lastExecuted: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        nextExecution: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'WARNING',
        metricValue: 'Completion: 91.8% (Target >= 95%), Phish Prone: 2.1%',
        threshold: '>= 95% completion within 30 days of assignment',
        failureReason: '10 recent engineering hires pending completion of module 4.',
        testOwner: 'People Operations / HR',
        evidenceGeneratedId: 'evd-live-a63-aware',
        evidenceGeneratedSha256: crypto.createHash('sha256').update(`aware-${tenantId}-${todayStr}`).digest('hex'),
        history: [
          { timestamp: new Date(now.getTime() - 7 * 24 * 3600000).toISOString(), status: 'PASS', metricValue: '96.2%' }
        ]
      },
      {
        id: 'TEST-VENDOR-09',
        tenantId,
        controlCode: 'A.5.19',
        testName: 'Supplier Security Assessment & SOC 2/ISO Certificate Recertification',
        description: 'Monitors Tier-1 critical cloud suppliers (AWS, Datadog, GitHub, Okta) for active SOC 2 Type II reports and ISO 27001 renewals.',
        sourceSystem: 'Vendor Risk Registry & Whistic API',
        executionFrequency: 'Monthly',
        lastExecuted: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        nextExecution: new Date(now.getTime() + 18 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'PASS',
        metricValue: '100% Tier-1 Vendors Certified (12/12 active SOC 2 / ISO 27001)',
        threshold: 'Zero expired certifications for critical vendors',
        testOwner: 'Procurement & Vendor Risk',
        evidenceGeneratedId: 'evd-live-a519-vendor',
        evidenceGeneratedSha256: crypto.createHash('sha256').update(`vendor-${tenantId}-${todayStr}`).digest('hex'),
        history: [
          { timestamp: new Date(now.getTime() - 30 * 24 * 3600000).toISOString(), status: 'PASS', metricValue: '100%' }
        ]
      },
      {
        id: 'TEST-POLREV-10',
        tenantId,
        controlCode: 'A.5.1',
        testName: 'Information Security Policy Suite Annual Review Cadence',
        description: 'Ensures all 14 core ISMS policies have been reviewed and approved by Top Management within the preceding 365 days.',
        sourceSystem: 'SKANDA Policy Engine',
        executionFrequency: 'Monthly',
        lastExecuted: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        nextExecution: new Date(now.getTime() + 22 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'PASS',
        metricValue: '14/14 Policies Approved & Current (Avg Age: 112 days)',
        threshold: '100% reviewed <= 365 days',
        testOwner: 'CISO / Head of Compliance',
        evidenceGeneratedId: 'evd-live-a51-policies',
        evidenceGeneratedSha256: crypto.createHash('sha256').update(`policies-${tenantId}-${todayStr}`).digest('hex'),
        history: [
          { timestamp: new Date(now.getTime() - 30 * 24 * 3600000).toISOString(), status: 'PASS', metricValue: '14/14' }
        ]
      },
      {
        id: 'TEST-INTAUD-11',
        tenantId,
        controlCode: 'Cl.9.2',
        testName: 'Clause 9.2 Internal Audit Execution & Schedule Adherence',
        description: 'Audits completion of planned internal audit cycles across all domains and verified independence of internal auditors.',
        sourceSystem: 'SKANDA Audit Management',
        executionFrequency: 'Quarterly',
        lastExecuted: new Date(now.getTime() - 65 * 24 * 60 * 60 * 1000).toISOString(),
        nextExecution: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'PASS',
        metricValue: 'Audit Completed: 2026-07-13 (Days Elapsed: 65d < 365d)',
        threshold: 'Internal Audit frequency <= 365 days, zero overdue findings',
        testOwner: 'Lead Internal Auditor',
        evidenceGeneratedId: 'evd-live-cl92-audit',
        evidenceGeneratedSha256: crypto.createHash('sha256').update(`audit-${tenantId}-${todayStr}`).digest('hex'),
        history: [
          { timestamp: new Date(now.getTime() - 90 * 24 * 3600000).toISOString(), status: 'PASS', metricValue: 'Passed' }
        ]
      },
      {
        id: 'TEST-MGMTREV-12',
        tenantId,
        controlCode: 'Cl.9.3',
        testName: 'Clause 9.3 Management Review Meeting & Output Validation',
        description: 'Validates that Executive Committee conducted formalized ISMS management review with recorded minutes covering all required inputs.',
        sourceSystem: 'Executive Governance Committee Records',
        executionFrequency: 'Bi-Annual',
        lastExecuted: new Date(now.getTime() - 95 * 24 * 60 * 60 * 1000).toISOString(),
        nextExecution: new Date(now.getTime() + 85 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'PASS',
        metricValue: 'Management Review Valid: 2026-06-13 (Minutes signed off by CEO & CISO)',
        threshold: 'Review frequency <= 365 days (target bi-annual)',
        testOwner: 'ISMS Steering Committee',
        evidenceGeneratedId: 'evd-live-cl93-mgmt',
        evidenceGeneratedSha256: crypto.createHash('sha256').update(`mgmt-${tenantId}-${todayStr}`).digest('hex'),
        history: [
          { timestamp: new Date(now.getTime() - 180 * 24 * 3600000).toISOString(), status: 'PASS', metricValue: 'Valid' }
        ]
      },
      {
        id: 'TEST-CAPA-13',
        tenantId,
        controlCode: 'Cl.10.2',
        testName: 'Nonconformity & Corrective Action Closure SLA (Clause 10.2)',
        description: 'Audits open Major and Minor Nonconformities to ensure corrective actions are verified and closed within agreed target dates.',
        sourceSystem: 'SKANDA CAPA Engine',
        executionFrequency: 'Daily',
        lastExecuted: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
        nextExecution: new Date(now.getTime() + 23 * 60 * 60 * 1000).toISOString(),
        status: 'FAIL',
        metricValue: '1 Overdue CAPA (CAPA-2024-03 on Privileged Account Review breached by 6 days)',
        threshold: '0 overdue CAPAs allowed prior to surveillance audit',
        failureReason: 'CAPA-2024-03 remediation evidence pending internal audit re-inspection.',
        testOwner: 'Compliance & Quality Lead',
        evidenceGeneratedId: 'evd-live-cl102-capa',
        evidenceGeneratedSha256: crypto.createHash('sha256').update(`capa-${tenantId}-${todayStr}`).digest('hex'),
        history: [
          { timestamp: new Date(now.getTime() - 24 * 3600000).toISOString(), status: 'FAIL', metricValue: '1 Overdue CAPA' }
        ]
      },
      {
        id: 'TEST-CRYPTO-14',
        tenantId,
        controlCode: 'A.8.24',
        testName: 'Cryptographic Controls, TLS 1.3 & KMS Key Rotation',
        description: 'Scans public TLS endpoints for TLS 1.3/1.2 only, strong cipher suites, and verifies annual AWS KMS key rotation.',
        sourceSystem: 'SSL Labs API & AWS KMS Key Manager',
        executionFrequency: 'Weekly',
        lastExecuted: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        nextExecution: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'PASS',
        metricValue: 'Grade A+ (TLS 1.3 enforced, 100% KMS keys auto-rotated)',
        threshold: 'Grade A or higher, zero weak ciphers',
        testOwner: 'Security Engineering',
        evidenceGeneratedId: 'evd-live-a824-crypto',
        evidenceGeneratedSha256: crypto.createHash('sha256').update(`crypto-${tenantId}-${todayStr}`).digest('hex'),
        history: [
          { timestamp: new Date(now.getTime() - 7 * 24 * 3600000).toISOString(), status: 'PASS', metricValue: 'Grade A+' }
        ]
      },
      {
        id: 'TEST-DATA-15',
        tenantId,
        controlCode: 'A.5.12',
        testName: 'Data Classification & Storage Encryption at Rest',
        description: 'Audits S3 buckets, PostgreSQL databases, and EBS volumes to ensure AES-256 or AWS KMS encryption enabled on 100% of data stores.',
        sourceSystem: 'AWS Macie & Security Hub CSPM',
        executionFrequency: 'Daily',
        lastExecuted: new Date(now.getTime() - 10 * 60 * 60 * 1000).toISOString(),
        nextExecution: new Date(now.getTime() + 14 * 60 * 60 * 1000).toISOString(),
        status: 'PASS',
        metricValue: '100% Encrypted at Rest (16/16 S3 Buckets, 4/4 DB instances)',
        threshold: '100% encryption enforced',
        testOwner: 'Data Protection Officer',
        evidenceGeneratedId: 'evd-live-a512-encrypt',
        evidenceGeneratedSha256: crypto.createHash('sha256').update(`data-${tenantId}-${todayStr}`).digest('hex'),
        history: [
          { timestamp: new Date(now.getTime() - 24 * 3600000).toISOString(), status: 'PASS', metricValue: '100% Encrypted' }
        ]
      }
    ];
  }

  // 3. Continuous Control Evaluations (Annex A Controls + Clauses)
  if (!db.evaluations[tenantId] || db.evaluations[tenantId].length === 0) {
    db.evaluations[tenantId] = generateSeedEvaluations(tenantId);
  }

  // 4. Compliance Drift Events
  if (!db.driftEvents[tenantId] || db.driftEvents[tenantId].length === 0) {
    db.driftEvents[tenantId] = [
      {
        id: 'DRIFT-2026-001',
        tenantId,
        controlCode: 'Cl.10.2',
        controlTitle: 'Nonconformity and Corrective Action SLA Breach',
        severity: 'HIGH',
        driftType: 'CAPA_SLA_BREACH',
        detectedAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        rootCause: 'Remediation task CAPA-2024-03 (Privileged Account Recertification) passed target completion date without Lead Auditor re-verification sign-off.',
        recommendedAction: 'Execute immediate emergency re-verification and close evidence attachment in CAPA module before external surveillance audit.',
        assignedOwner: 'Sarah Jenkins (Compliance Lead)',
        dueDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        affectedRiskIds: ['risk-01', 'risk-04'],
        capaId: 'CAPA-2024-03',
        status: 'IN_REMEDIATION',
        resolutionNotes: 'Evidence submitted by IT Ops on 2026-09-14; pending second-pair verification.'
      },
      {
        id: 'DRIFT-2026-002',
        tenantId,
        controlCode: 'A.8.8',
        controlTitle: 'Management of Technical Vulnerabilities (High CVE SLA Exceeded)',
        severity: 'HIGH',
        driftType: 'VULNERABILITY_SLA_BREACH',
        detectedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        rootCause: 'Automated scan TEST-VULN-02 identified CVE-2026-1049 (libssl3) open for 16 days against the mandatory 14-day SLA in production Kubernetes cluster.',
        recommendedAction: 'Deploy patched base image alpine:3.20.1 in next release cycle scheduled today; trigger automated re-scan.',
        assignedOwner: 'Alex Rivera (DevSecOps Lead)',
        dueDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        affectedRiskIds: ['risk-02'],
        capaId: 'CAPA-2026-08',
        status: 'OPEN'
      },
      {
        id: 'DRIFT-2026-003',
        tenantId,
        controlCode: 'A.6.3',
        controlTitle: 'Information Security Awareness Completion Drop',
        severity: 'MEDIUM',
        driftType: 'AUTOMATED_TEST_FAILURE',
        detectedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        rootCause: 'Training completion rate slipped from 96.2% to 91.8% due to 10 new hires joining in late Q3 without completing onboarding module within 14 days.',
        recommendedAction: 'Dispatch automated reminder escalation via Slack/Email; lock network access if not completed in 48 hours.',
        assignedOwner: 'David Chen (People Operations / HR)',
        dueDate: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString(),
        affectedRiskIds: ['risk-05'],
        status: 'OPEN'
      }
    ];
  }

  // 5. Initial Audit Trail
  if (!db.auditTrail[tenantId]) {
    db.auditTrail[tenantId] = [
      {
        id: `audit-${Date.now()}-init`,
        timestamp: now.toISOString(),
        action: 'CONTINUOUS_MONITORING_INITIALIZED',
        actor: 'SKANDA Continuous Compliance Daemon',
        details: 'Initial post-certification baseline established. Surveillance Year 1 countdown active.',
        sha256: crypto.createHash('sha256').update(`init-${tenantId}`).digest('hex')
      }
    ];
  }

  persistDb();
}

export function calculateSummary(tenantId: string): ContinuousComplianceSummary {
  ensureTenantSeeded(tenantId);
  const evals = db.evaluations[tenantId] || [];
  const tests = db.automatedTests[tenantId] || [];
  const drifts = db.driftEvents[tenantId] || [];

  const totalApplicableControls = evals.filter(e => e.applicabilityStatus === 'Applicable').length;
  const effectiveControlsCount = evals.filter(e => e.overallStatus === 'Effective').length;
  const ineffectiveControlsCount = evals.filter(e => e.overallStatus === 'Ineffective' || e.overallStatus === 'Nonconforming' || e.overallStatus === 'Remediation Required').length;
  const operatingPendingCount = evals.filter(e => e.overallStatus === 'Operating Effectiveness Pending' || e.overallStatus === 'In Progress').length;
  const evidenceExpiredCount = evals.filter(e => e.evidenceFreshnessStatus === 'Expired').length;
  const evidenceMissingCount = evals.filter(e => e.evidenceFreshnessStatus === 'Missing').length;

  const activeDrifts = drifts.filter(d => d.status !== 'RESOLVED');
  const criticalDriftCount = activeDrifts.filter(d => d.severity === 'CRITICAL' || d.severity === 'HIGH').length;
  const failedAutomatedTestsCount = tests.filter(t => t.status === 'FAIL' || t.status === 'ERROR').length;

  const effectiveRate = totalApplicableControls > 0 ? (effectiveControlsCount / totalApplicableControls) * 100 : 0;
  const driftDeduction = criticalDriftCount * 4;
  const testDeduction = failedAutomatedTestsCount * 3;
  const expiredDeduction = evidenceExpiredCount * 2;

  const rawScore = effectiveRate - driftDeduction - testDeduction - expiredDeduction;
  const overallComplianceScore = Math.max(0, Math.min(100, Math.round(rawScore)));

  const freshEvidenceRatio = evals.length > 0 ? (evals.filter(e => e.evidenceFreshnessStatus === 'Fresh' || e.evidenceFreshnessStatus === 'Aging').length / evals.length) * 100 : 100;
  const passingTestsRatio = tests.length > 0 ? (tests.filter(t => t.status === 'PASS').length / tests.length) * 100 : 100;
  const surveillanceReadinessScore = Math.max(0, Math.min(100, Math.round(
    (effectiveRate * 0.45) + (freshEvidenceRatio * 0.35) + (passingTestsRatio * 0.20) - (criticalDriftCount * 3)
  )));

  return {
    overallComplianceScore,
    totalApplicableControls,
    effectiveControlsCount,
    ineffectiveControlsCount,
    operatingPendingCount,
    evidenceExpiredCount,
    evidenceMissingCount,
    activeDriftEventsCount: activeDrifts.length,
    criticalDriftCount,
    failedAutomatedTestsCount,
    openMajorNCCount: 1,
    openMinorNCCount: 2,
    overdueCapaCount: 1,
    evidenceVerificationRate: Math.round(freshEvidenceRatio),
    surveillanceReadinessScore,
    lastContinuousScanTimestamp: new Date().toISOString()
  };
}
