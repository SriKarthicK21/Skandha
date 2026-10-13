import { NextBestActionItem } from '../../types/grcCoreTypes';
import { ConfigurableRiskEngine } from './ConfigurableRiskEngine';
import { SmartEvidenceEngine } from './SmartEvidenceEngine';
import { AuditRemediationEngine } from './AuditRemediationEngine';

/**
 * SKANDA Next Best Action Engine
 * Autonomous prioritization of GRC tasks, SLA exposures, and audit blockers.
 */
export class NextBestActionEngine {
  public static computeNextBestActions(): NextBestActionItem[] {
    const actions: NextBestActionItem[] = [];

    // 1. Critical Risks requiring treatment review
    const risks = ConfigurableRiskEngine.getAllRisks();
    risks.filter(r => r.residualLevel === 'CRITICAL' || r.inherentLevel === 'CRITICAL').forEach(r => {
      actions.push({
        id: `nba-risk-${r.id}`,
        tenantId: r.tenantId,
        priorityScore: 96,
        category: 'CRITICAL_RISK',
        severity: 'CRITICAL',
        title: `Mitigate ${r.riskCode}: ${r.title}`,
        reason: `Inherent risk score of ${r.inherentScore} exceeds the approved Board Risk Appetite ceiling.`,
        sourceEntity: { type: 'RISK', id: r.id, code: r.riskCode },
        recommendedAction: `Review mitigating controls (${r.mitigatingControlIds.join(', ')}) and approve treatment plan.`,
        impactIfIgnored: 'Potential regulatory non-compliance penalty or operational disruption.',
        owner: r.owner,
        dueDate: r.dueDate,
        actionType: 'REMEDIATE'
      });
    });

    // 2. Overdue or In-Progress CAPAs
    const capas = AuditRemediationEngine.getAllCapas();
    capas.filter(c => c.status === 'SUBMITTED_FOR_VERIFICATION' || c.status === 'IN_PROGRESS').forEach(c => {
      actions.push({
        id: `nba-capa-${c.id}`,
        tenantId: c.tenantId,
        priorityScore: 92,
        category: 'OVERDUE_CAPA',
        severity: c.priority === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
        title: `Verify Closure: ${c.capaCode} (${c.title})`,
        reason: 'Remediation implementation submitted by SecOps; requires formal auditor/CISO verification sign-off.',
        sourceEntity: { type: 'CAPA', id: c.id, code: c.capaCode },
        recommendedAction: 'Inspect attached closure evidence (EV-2026-002) and execute verification closure.',
        impactIfIgnored: 'Open finding will be escalated to External Certification Body (BSI) during Stage-2 audit.',
        owner: c.owner,
        dueDate: c.dueDate,
        actionType: 'APPROVE'
      });
    });

    // 3. Evidence pending review or nearing expiration
    const evidence = SmartEvidenceEngine.getAllEvidence();
    evidence.filter(e => e.verificationStatus === 'PENDING_REVIEW').forEach(e => {
      actions.push({
        id: `nba-ev-${e.id}`,
        tenantId: e.tenantId,
        priorityScore: 84,
        category: 'MISSING_EVIDENCE',
        severity: 'MEDIUM',
        title: `Confirm AI Classification for ${e.evidenceCode}`,
        reason: `Uploaded artifact (${e.fileName}) classified with ${(e.aiClassification?.confidenceScore! * 100).toFixed(0)}% AI confidence; requires human confirmation.`,
        sourceEntity: { type: 'EVIDENCE', id: e.id, code: e.evidenceCode },
        recommendedAction: `Confirm mapping to controls ${e.mappedControlIds.join(', ')} to establish compliance.`,
        impactIfIgnored: 'Evidence remains in unverified state and cannot be sampled by external auditors.',
        owner: e.owner,
        dueDate: 'Within 48 hours',
        actionType: 'REVIEW'
      });
    });

    // 4. Audit Fieldwork Deadlines
    const audits = AuditRemediationEngine.getAllAudits();
    audits.filter(a => a.status === 'FIELDWORK_ACTIVE').forEach(a => {
      actions.push({
        id: `nba-audit-${a.id}`,
        tenantId: a.tenantId,
        priorityScore: 90,
        category: 'AUDIT_DEADLINE',
        severity: 'HIGH',
        title: `Active Audit Fieldwork: ${a.auditCode} (${a.title})`,
        reason: `${a.testedCheckpoints}/${a.totalCheckpoints} checkpoints sampled. Fieldwork concludes on ${a.endDate}.`,
        sourceEntity: { type: 'AUDIT', id: a.id, code: a.auditCode },
        recommendedAction: 'Open Auditor Clean Room workspace to review sample workpapers and record observations.',
        impactIfIgnored: 'Delay in certification issuance from external registrar.',
        owner: a.leadAuditor,
        dueDate: a.endDate,
        actionType: 'TEST'
      });
    });

    // Sort descending by priority score
    return actions.sort((a, b) => b.priorityScore - a.priorityScore);
  }
}
