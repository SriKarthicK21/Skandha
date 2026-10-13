import { GrcRisk, RiskMatrixConfig, RiskMatrixDimension, RiskTreatmentStrategy } from '../../types/grcCoreTypes';

/**
 * SKANDA Configurable Risk Engine
 * Supports versioned 3x3, 4x4, and 5x5 Risk Heatmaps with dynamic calculations.
 */
export class ConfigurableRiskEngine {
  private static matrixConfigs: Map<RiskMatrixDimension, RiskMatrixConfig> = new Map();
  private static risks: Map<string, GrcRisk> = new Map();

  static {
    this.initializeMatrices();
    this.initializeRisks();
  }

  private static initializeMatrices() {
    // 5x5 Standard Enterprise Matrix
    const matrix5x5: RiskMatrixConfig = {
      id: 'matrix-5x5-iso31000-v2',
      dimension: '5x5',
      version: '2026.1-Enterprise',
      likelihoodLevels: [
        { value: 1, label: 'Rare', description: 'Occurs less than once in 5 years (< 5%)' },
        { value: 2, label: 'Unlikely', description: 'Occurs once in 2-5 years (5% - 20%)' },
        { value: 3, label: 'Moderate', description: 'Occurs once a year (21% - 50%)' },
        { value: 4, label: 'Likely', description: 'Occurs multiple times a year (51% - 80%)' },
        { value: 5, label: 'Almost Certain', description: 'Occurs monthly or continuously (> 80%)' }
      ],
      impactLevels: [
        { value: 1, label: 'Insignificant', description: '< $10K USD, zero operational disruption, no PII' },
        { value: 2, label: 'Minor', description: '$10K-$100K USD, brief minor disruption (< 1h), no regulatory breach' },
        { value: 3, label: 'Moderate', description: '$100K-$500K USD, notable disruption (< 4h), minor regulatory report' },
        { value: 4, label: 'Major', description: '$500K-$2M USD, serious customer impact (< 24h), MAS/DPDP breach notice' },
        { value: 5, label: 'Catastrophic', description: '> $2M USD, prolonged outage (> 24h), license revocation risk' }
      ],
      riskScoreThresholds: {
        critical: { min: 16, max: 25, label: 'CRITICAL', color: '#EF4444' },
        high: { min: 10, max: 15, label: 'HIGH', color: '#F97316' },
        medium: { min: 5, max: 9, label: 'MEDIUM', color: '#F59E0B' },
        low: { min: 1, max: 4, label: 'LOW', color: '#10B981' }
      }
    };

    // 4x4 Financial Matrix
    const matrix4x4: RiskMatrixConfig = {
      id: 'matrix-4x4-mas-v1',
      dimension: '4x4',
      version: '2026.1-MAS-TRM',
      likelihoodLevels: [
        { value: 1, label: 'Low', description: 'Very low probability' },
        { value: 2, label: 'Medium', description: 'Moderate probability' },
        { value: 3, label: 'High', description: 'High probability' },
        { value: 4, label: 'Very High', description: 'Immediate / Continuous' }
      ],
      impactLevels: [
        { value: 1, label: 'Low', description: 'Minor impact' },
        { value: 2, label: 'Medium', description: 'Moderate financial/reputational impact' },
        { value: 3, label: 'High', description: 'Severe disruption' },
        { value: 4, label: 'Critical', description: 'Statutory non-compliance' }
      ],
      riskScoreThresholds: {
        critical: { min: 12, max: 16, label: 'CRITICAL', color: '#EF4444' },
        high: { min: 8, max: 11, label: 'HIGH', color: '#F97316' },
        medium: { min: 4, max: 7, label: 'MEDIUM', color: '#F59E0B' },
        low: { min: 1, max: 3, label: 'LOW', color: '#10B981' }
      }
    };

    // 3x3 Lightweight Matrix
    const matrix3x3: RiskMatrixConfig = {
      id: 'matrix-3x3-standard-v1',
      dimension: '3x3',
      version: '2026.1-Standard',
      likelihoodLevels: [
        { value: 1, label: 'Low', description: 'Unlikely' },
        { value: 2, label: 'Medium', description: 'Possible' },
        { value: 3, label: 'High', description: 'Probable' }
      ],
      impactLevels: [
        { value: 1, label: 'Low', description: 'Low impact' },
        { value: 2, label: 'Medium', description: 'Medium impact' },
        { value: 3, label: 'High', description: 'High impact' }
      ],
      riskScoreThresholds: {
        critical: { min: 7, max: 9, label: 'CRITICAL', color: '#EF4444' },
        high: { min: 5, max: 6, label: 'HIGH', color: '#F97316' },
        medium: { min: 3, max: 4, label: 'MEDIUM', color: '#F59E0B' },
        low: { min: 1, max: 2, label: 'LOW', color: '#10B981' }
      }
    };

    this.matrixConfigs.set('5x5', matrix5x5);
    this.matrixConfigs.set('4x4', matrix4x4);
    this.matrixConfigs.set('3x3', matrix3x3);
  }

  private static initializeRisks() {
    const risksList: GrcRisk[] = [
      {
        id: 'RSK-001',
        tenantId: 'tenant_skanda',
        riskCode: 'RSK-001',
        title: 'Unauthorized Privilege Escalation in Production Cloud Environment',
        description: 'Compromise of administrator IAM credentials leading to unauthorized access to production databases and Kubernetes control planes.',
        category: 'CYBERSECURITY',
        affectedAssetIds: ['ast-aws-prod-iam', 'ast-eks-cluster-prod'],
        threatVector: 'Phishing of DevOps engineers or stolen long-lived API tokens.',
        vulnerabilityDescription: 'Lack of automated session termination and dormant privileged IAM roles.',
        inherentLikelihood: 4,
        inherentImpact: 5,
        inherentScore: 20,
        inherentLevel: 'CRITICAL',
        mitigatingControlIds: ['CTRL-IAM-01', 'CTRL-IAM-02'],
        residualLikelihood: 2,
        residualImpact: 3,
        residualScore: 6,
        residualLevel: 'MEDIUM',
        treatmentStrategy: 'MITIGATION',
        treatmentPlan: 'Enforce hardware FIDO2 MFA tokens and implement 4-hour Just-In-Time (JIT) access grants via Okta PAM.',
        owner: 'Director of Cloud Security',
        dueDate: '2026-10-31',
        status: 'ASSESSED',
        linkedFindingIds: ['FND-001'],
        linkedCapaIds: ['CAPA-001'],
        linkedAuditIds: ['AUD-2026-Q1'],
        updatedAt: '2026-10-02T18:00:00.000Z'
      },

      {
        id: 'RSK-004',
        tenantId: 'tenant_skanda',
        riskCode: 'RSK-004',
        title: 'Customer PII Exfiltration via Cloud Storage Misconfiguration',
        description: 'Accidental public exposure of S3 storage buckets containing customer onboarding KYC documents and financial telemetry.',
        category: 'PRIVACY',
        affectedAssetIds: ['ast-aws-s3-prod'],
        threatVector: 'Misconfigured Terraform pipeline granting public read ACLs to object buckets.',
        vulnerabilityDescription: 'Absence of account-wide S3 Block Public Access enforcement.',
        inherentLikelihood: 4,
        inherentImpact: 4,
        inherentScore: 16,
        inherentLevel: 'CRITICAL',
        mitigatingControlIds: ['CTRL-CRY-01', 'CTRL-DLP-01'],
        residualLikelihood: 1,
        residualImpact: 3,
        residualScore: 3,
        residualLevel: 'LOW',
        treatmentStrategy: 'MITIGATION',
        treatmentPlan: 'Enforce AWS Organization SCP blocking public S3 buckets and enable automated Macie PII scanning.',
        owner: 'Data Protection Officer (DPO)',
        dueDate: '2026-10-15',
        status: 'TREATMENT_IN_PROGRESS',
        linkedFindingIds: [],
        linkedCapaIds: [],
        linkedAuditIds: ['AUD-2026-Q1'],
        updatedAt: '2026-10-01T12:00:00.000Z'
      },

      {
        id: 'RSK-005',
        tenantId: 'tenant_skanda',
        riskCode: 'RSK-005',
        title: 'Third-Party SaaS Provider Breach (Supply Chain Risk)',
        description: 'Security compromise at a critical Tier 1 billing/payment processing partner resulting in operational downtime or data leakage.',
        category: 'THIRD_PARTY',
        affectedAssetIds: ['ast-vendor-portal'],
        threatVector: 'Supply chain compromise or unpatched Zero-Day at upstream vendor.',
        vulnerabilityDescription: 'Single point of failure on third-party payment gateway integration.',
        inherentLikelihood: 3,
        inherentImpact: 4,
        inherentScore: 12,
        inherentLevel: 'HIGH',
        mitigatingControlIds: ['CTRL-TPRM-01'],
        residualLikelihood: 2,
        residualImpact: 3,
        residualScore: 6,
        residualLevel: 'MEDIUM',
        treatmentStrategy: 'TRANSFER',
        treatmentPlan: 'Maintain cyber insurance policy with $10M liability coverage and dual-vendor failover routing.',
        owner: 'Head of Vendor Governance',
        dueDate: '2026-11-30',
        status: 'ASSESSED',
        linkedFindingIds: [],
        linkedCapaIds: [],
        linkedAuditIds: [],
        updatedAt: '2026-09-20T10:00:00.000Z'
      }
    ];

    risksList.forEach(r => this.risks.set(r.id, r));
  }

  public static getMatrixConfig(dimension: RiskMatrixDimension = '5x5'): RiskMatrixConfig {
    return this.matrixConfigs.get(dimension) || this.matrixConfigs.get('5x5')!;
  }

  public static getAllRisks(): GrcRisk[] {
    return Array.from(this.risks.values());
  }

  public static getRiskById(id: string): GrcRisk | undefined {
    return this.risks.get(id);
  }

  public static calculateRiskLevel(score: number, dimension: RiskMatrixDimension = '5x5'): 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' {
    const config = this.getMatrixConfig(dimension);
    if (score >= config.riskScoreThresholds.critical.min) return 'CRITICAL';
    if (score >= config.riskScoreThresholds.high.min) return 'HIGH';
    if (score >= config.riskScoreThresholds.medium.min) return 'MEDIUM';
    return 'LOW';
  }

  public static upsertRisk(risk: GrcRisk) {
    // Recompute scores and levels automatically
    risk.inherentScore = risk.inherentLikelihood * risk.inherentImpact;
    risk.inherentLevel = this.calculateRiskLevel(risk.inherentScore);
    risk.residualScore = risk.residualLikelihood * risk.residualImpact;
    risk.residualLevel = this.calculateRiskLevel(risk.residualScore);
    risk.updatedAt = new Date().toISOString();
    this.risks.set(risk.id, risk);
    return risk;
  }
}
