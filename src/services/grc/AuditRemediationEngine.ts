import { GrcAssessment, GrcAudit, GrcFinding, GrcCapaAction } from '../../types/grcCoreTypes';

/**
 * SKANDA Assessment, Audit, Findings & CAPA Remediation Engine
 */
export class AuditRemediationEngine {
  private static assessments: Map<string, GrcAssessment> = new Map();
  private static audits: Map<string, GrcAudit> = new Map();
  private static findings: Map<string, GrcFinding> = new Map();
  private static capas: Map<string, GrcCapaAction> = new Map();

  static {
    this.initializeData();
  }

  private static initializeData() {
    // 1. Generic Assessments
    const assessmentIso: GrcAssessment = {
      id: 'asm-iso-27001-q3',
      tenantId: 'tenant_skanda',
      frameworkCode: 'ISO_27001_2022',
      frameworkName: 'ISO/IEC 27001:2022 ISMS',
      name: 'Q3 Enterprise Global ISMS Surveillance Readiness Assessment',
      scopePerimeter: 'Global Multi-Region Cloud Banking & Microservices Infrastructure',
      leadAssessor: 'Dr. Evelyn Vance (Chief GRC Auditor)',
      state: 'APPROVED',
      overallScore: 92.4,
      completedRequirementsCount: 88,
      totalRequirementsCount: 93,
      statementOfApplicabilityPublished: true,
      approvedBy: 'CISO / Executive Risk Committee',
      approvedAt: '2026-10-01T14:00:00.000Z',
      createdAt: '2026-09-01T08:00:00.000Z',
      updatedAt: '2026-10-02T16:00:00.000Z',
      requirementsEvaluated: [
        {
          requirementCode: 'A.5.15',
          status: 'COMPLIANT',
          complianceScore: 100,
          assessorNotes: 'Hardware MFA enforced for all production engineers with automated access revocation.',
          evaluatedControlIds: ['CTRL-IAM-01', 'CTRL-IAM-02'],
          supportingEvidenceIds: ['EV-2026-001'],
          findingIds: []
        },
        {
          requirementCode: 'A.8.12',
          status: 'PARTIALLY_COMPLIANT',
          complianceScore: 78,
          assessorNotes: 'DLP egress filtering active on endpoints, but staging container telemetry alert threshold needs fine-tuning.',
          evaluatedControlIds: ['CTRL-DLP-01'],
          supportingEvidenceIds: ['EV-2026-004'],
          findingIds: ['FND-001']
        }
      ]
    };

    // 2. Audit Engagements
    const auditIso: GrcAudit = {
      id: 'AUD-2026-Q1',
      tenantId: 'tenant_skanda',
      auditCode: 'AUD-2026-Q1',
      title: '2026 Stage-2 Recertification & MAS Regulatory Examination',
      auditType: 'EXTERNAL_CERTIFICATION',
      frameworkCode: 'ISO_27001_2022',
      scopeDescription: 'Production Kubernetes Cluster, Data Lake, IAM Provider, and FinTech Ingress Gateways',
      leadAuditor: 'Marcus Sterling, Lead Auditor ISO/IEC 27001',
      auditFirm: 'BSI Group / TÜV Rheinland Inspection Services',
      independenceDeclarationSigned: true,
      status: 'FIELDWORK_ACTIVE',
      startDate: '2026-09-25',
      endDate: '2026-10-10',
      totalCheckpoints: 93,
      testedCheckpoints: 82,
      passedCheckpoints: 80,
      findingsCount: { critical: 0, major: 0, minor: 1, observation: 1 },
      auditorOpinion: 'UNQUALIFIED_CLEAN',
      signedOffAt: undefined
    };

    // 3. Findings
    const finding1: GrcFinding = {
      id: 'FND-001',
      tenantId: 'tenant_skanda',
      findingCode: 'FND-001',
      title: 'Dormant IAM Access Credentials in Staging Cluster',
      description: 'During sampling of 50 active IAM roles, 2 service accounts in the staging environment exceeded the 90-day inactivity threshold without being auto-disabled.',
      severity: 'MINOR_NON_CONFORMITY',
      sourceAuditId: 'AUD-2026-Q1',
      sourceAssessmentId: 'asm-iso-27001-q3',
      relatedRequirementCode: 'A.5.15',
      relatedControlId: 'CTRL-IAM-02',
      identifiedBy: 'Marcus Sterling (BSI Lead Auditor)',
      identifiedDate: '2026-09-28',
      status: 'CAPA_IN_PROGRESS',
      capaIds: ['CAPA-001']
    };

    // 4. CAPA Action
    const capa1: GrcCapaAction = {
      id: 'CAPA-001',
      tenantId: 'tenant_skanda',
      capaCode: 'CAPA-001',
      findingId: 'FND-001',
      title: 'Automated IAM Key Inactivity Purge Cron Implementation',
      rootCauseAnalysis: 'Root Cause: Manual offboarding checklist failed to cover non-human service accounts created for transient staging load tests (5-Whys verified).',
      immediateCorrection: 'Manually revoked the 2 dormant staging credentials immediately upon identification.',
      correctiveAction: 'Deployed Lambda auto-remediation rule to disable any API key or IAM role idle for > 45 days across all non-prod AWS accounts.',
      preventiveAction: 'Integrated Terraform IAM linting gate requiring mandatory expiration tags on all created service principals.',
      owner: 'Lead IAM & SecOps Engineer',
      dueDate: '2026-10-15',
      priority: 'HIGH',
      status: 'SUBMITTED_FOR_VERIFICATION',
      closureEvidenceIds: ['EV-2026-002'],
      verifiedBy: 'Senior Compliance Director',
      verifiedAt: '2026-10-02T10:00:00.000Z'
    };

    this.assessments.set(assessmentIso.id, assessmentIso);
    this.audits.set(auditIso.id, auditIso);
    this.findings.set(finding1.id, finding1);
    this.capas.set(capa1.id, capa1);
  }

  public static getAllAssessments(): GrcAssessment[] {
    return Array.from(this.assessments.values());
  }

  public static getAllAudits(): GrcAudit[] {
    return Array.from(this.audits.values());
  }

  public static getAllFindings(): GrcFinding[] {
    return Array.from(this.findings.values());
  }

  public static getAllCapas(): GrcCapaAction[] {
    return Array.from(this.capas.values());
  }

  public static getFindingById(id: string): GrcFinding | undefined {
    return this.findings.get(id);
  }

  public static getCapaById(id: string): GrcCapaAction | undefined {
    return this.capas.get(id);
  }

  public static updateCapaStatus(id: string, status: GrcCapaAction['status'], closureEvidenceId?: string) {
    const capa = this.capas.get(id);
    if (capa) {
      capa.status = status;
      if (closureEvidenceId && !capa.closureEvidenceIds.includes(closureEvidenceId)) {
        capa.closureEvidenceIds.push(closureEvidenceId);
      }
      this.capas.set(id, capa);
    }
    return capa;
  }
}
