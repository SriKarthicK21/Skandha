import { ComplianceProgram } from '../../types/canonicalGrcTypes';

/**
 * SKANDA Canonical Compliance Program Service
 * Manages first-class Compliance Programs grouping frameworks under unified enterprise governance.
 */
export class ComplianceProgramService {
  private programs: Map<string, ComplianceProgram> = new Map();

  constructor() {
    this.initializePrograms();
  }

  private initializePrograms() {
    const programsList: ComplianceProgram[] = [
      // 1. Enterprise Information Security Program
      {
        id: 'prog-infosec-global',
        tenantId: 'tenant-acme-corp',
        code: 'PROG-SEC-01',
        name: 'Enterprise Information Security & Cybersecurity Program',
        type: 'INFORMATION_SECURITY',
        description: 'Multi-framework defense-in-depth security program harmonizing ISO 27001:2022, SOC 2 Type II, and NIST CSF 2.0.',
        executiveSponsor: 'Dr. Marcus Vance (Chief Information Security Officer)',
        programLead: 'Sarah Chen (Head of Cyber Governance & Risk)',
        frameworkCodes: ['ISO_27001_2022', 'SOC_2_TYPE_2', 'NIST_CSF_2_0', 'CIS_CONTROLS_V8'],
        businessUnitIds: ['bu-cloud-fintech', 'bu-core-banking', 'bu-corporate-it'],
        status: 'ACTIVE',
        targetCertificationDate: '2026-11-15',
        nextAuditDate: '2026-10-10',
        metrics: {
          totalRequirements: 263,
          implementedControlsCount: 88,
          testedControlsCount: 76,
          effectiveControlsCount: 72,
          deficientControlsCount: 4,
          evidenceCoveragePercent: 92.4,
          openFindingsCount: 1,
          activeExceptionsCount: 1,
          overallReadinessPercent: 91.8
        },
        createdAt: '2026-01-10T00:00:00.000Z',
        updatedAt: '2026-10-02T18:00:00.000Z'
      },

      // 2. Global Privacy & Data Protection Program
      {
        id: 'prog-privacy-pims',
        tenantId: 'tenant-acme-corp',
        code: 'PROG-PRV-01',
        name: 'Global Privacy & Personal Data Protection Program',
        type: 'PRIVACY_DATA_PROTECTION',
        description: 'Statutory compliance program enforcing DPDP Act 2023, ISO 27701:2019, and GDPR Article 32 safeguards.',
        executiveSponsor: 'Elena Rostova (Global Data Protection Officer)',
        programLead: 'Rajesh Nair (Privacy Engineering Lead)',
        frameworkCodes: ['DPDP_ACT_2023', 'ISO_27701_2019'],
        businessUnitIds: ['bu-cloud-fintech', 'bu-customer-operations'],
        status: 'ACTIVE',
        targetCertificationDate: '2026-12-01',
        nextAuditDate: '2026-11-20',
        metrics: {
          totalRequirements: 118,
          implementedControlsCount: 42,
          testedControlsCount: 38,
          effectiveControlsCount: 36,
          deficientControlsCount: 2,
          evidenceCoveragePercent: 88.5,
          openFindingsCount: 2,
          activeExceptionsCount: 0,
          overallReadinessPercent: 87.2
        },
        createdAt: '2026-02-01T00:00:00.000Z',
        updatedAt: '2026-10-01T12:00:00.000Z'
      },

      // 3. AI Safety & Algorithmic Governance Program
      {
        id: 'prog-ai-governance',
        tenantId: 'tenant-acme-corp',
        code: 'PROG-AI-01',
        name: 'Enterprise Artificial Intelligence Management & Safety Program',
        type: 'AI_GOVERNANCE',
        description: 'ISO/IEC 42001:2023 Artificial Intelligence Management System (AIMS) and EU AI Act high-risk model risk program.',
        executiveSponsor: 'Dr. Aris Thorne (Chief AI Safety & Compliance Officer)',
        programLead: 'Elena Vance (Lead AI Auditor)',
        frameworkCodes: ['ISO_42001_2023', 'NIST_AI_RMF'],
        businessUnitIds: ['bu-cloud-fintech', 'bu-ai-research'],
        status: 'ACTIVE',
        targetCertificationDate: '2027-02-15',
        nextAuditDate: '2026-11-10',
        metrics: {
          totalRequirements: 86,
          implementedControlsCount: 31,
          testedControlsCount: 24,
          effectiveControlsCount: 22,
          deficientControlsCount: 2,
          evidenceCoveragePercent: 82.0,
          openFindingsCount: 1,
          activeExceptionsCount: 1,
          overallReadinessPercent: 81.0
        },
        createdAt: '2026-03-15T00:00:00.000Z',
        updatedAt: '2026-09-28T16:00:00.000Z'
      },

      // 4. Technology Risk & Regulatory Resilience Program
      {
        id: 'prog-mas-trm',
        tenantId: 'tenant-acme-corp',
        code: 'PROG-TRM-01',
        name: 'Singapore Financial Services Technology Risk (MAS TRM) Program',
        type: 'TECHNOLOGY_RISK_FINTECH',
        description: 'Monetary Authority of Singapore (MAS) TRM 2021 & Cyber Hygiene Notice 655 compliance program.',
        executiveSponsor: 'Kevin Tan (Managing Director & Regional Head of Risk)',
        programLead: 'Sarah Chen (Head of Cyber Governance)',
        frameworkCodes: ['MAS_TRM_2021', 'ISO_22301_2019'],
        businessUnitIds: ['bu-cloud-fintech', 'bu-core-banking'],
        status: 'ACTIVE',
        targetCertificationDate: '2026-10-31',
        nextAuditDate: '2026-10-10',
        metrics: {
          totalRequirements: 146,
          implementedControlsCount: 78,
          testedControlsCount: 70,
          effectiveControlsCount: 68,
          deficientControlsCount: 2,
          evidenceCoveragePercent: 94.0,
          openFindingsCount: 1,
          activeExceptionsCount: 1,
          overallReadinessPercent: 93.2
        },
        createdAt: '2026-01-05T00:00:00.000Z',
        updatedAt: '2026-10-02T15:00:00.000Z'
      }
    ];

    programsList.forEach(p => this.programs.set(p.id, p));
  }

  public getAllPrograms(): ComplianceProgram[] {
    return Array.from(this.programs.values());
  }

  public getProgramById(id: string): ComplianceProgram | undefined {
    return this.programs.get(id) || Array.from(this.programs.values()).find(p => p.code === id || p.id === id);
  }

  public getProgramByCode(code: string): ComplianceProgram | undefined {
    return Array.from(this.programs.values()).find(p => p.code === code);
  }

  public createProgram(input: Partial<ComplianceProgram>): ComplianceProgram {
    const id = input.id || `prog-${Date.now()}`;
    const newProg: ComplianceProgram = {
      id,
      tenantId: input.tenantId || 'tenant-acme-corp',
      code: input.code || `PROG-${this.programs.size + 1}`,
      name: input.name || 'New Compliance Program',
      type: input.type || 'INFORMATION_SECURITY',
      description: input.description || '',
      executiveSponsor: input.executiveSponsor || 'CISO',
      programLead: input.programLead || 'GRC Lead',
      frameworkCodes: input.frameworkCodes || ['ISO_27001_2022'],
      businessUnitIds: input.businessUnitIds || ['bu-default'],
      status: input.status || 'ACTIVE',
      metrics: input.metrics || {
        totalRequirements: 100,
        implementedControlsCount: 20,
        testedControlsCount: 10,
        effectiveControlsCount: 10,
        deficientControlsCount: 0,
        evidenceCoveragePercent: 50,
        openFindingsCount: 0,
        activeExceptionsCount: 0,
        overallReadinessPercent: 60
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.programs.set(id, newProg);
    return newProg;
  }
}

export const complianceProgramService = new ComplianceProgramService();
