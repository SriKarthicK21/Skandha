import { ControlItem, EvidenceRecord, FindingCAPARecord, RiskRecord, OrganizationRecord, OrganizationCompliancePosture } from '../types';

export function calculateOrganizationCompliancePosture(
  org: OrganizationRecord | { id: string; tenantId?: string; selectedFrameworks?: string[]; scopeStatement?: string; [key: string]: any },
  controls: ControlItem[] = [],
  evidence: EvidenceRecord[] = [],
  findings: FindingCAPARecord[] = [],
  risks: RiskRecord[] = [],
  lastEvaluatedTimestamp?: string
): OrganizationCompliancePosture {
  const orgId = org.id;
  const tenantId = org.tenantId || org.id;
  const framework = (org.selectedFrameworks && org.selectedFrameworks[0]) || 'ISO/IEC 27001:2022';
  const scope = (org as any).businessScope?.statement || org.scopeStatement || 'Enterprise Information Security Management System (ISMS)';
  const evaluatedAt = lastEvaluatedTimestamp || new Date().toISOString();

  // If there are no controls, return uninitialized state (NEVER a fake 88% or 0%)
  if (!controls || controls.length === 0) {
    return {
      orgId,
      tenantId,
      score: null,
      status: 'NOT_INITIALIZED',
      lastEvaluatedAt: evaluatedAt,
      framework,
      scope,
      applicableControlCount: 0,
      passingControlCount: 0,
      failedControlCount: 0,
      implementedControlCount: 0,
      evidenceGaps: 0,
      openFindings: 0,
      openMajorNCs: 0,
      openMinorNCs: 0,
      dataFreshness: 0,
      summaryText: 'Compliance assessment not yet initialized',
      evaluatedAgo: 'Not evaluated',
      breakdown: {
        controlsScore: 0,
        evidenceScore: 0,
        findingsPenalty: 0,
        riskFactor: 0
      }
    };
  }

  // 1. Controls Analysis
  const applicableControls = controls.filter(c => c.applicable !== false);
  const applicableCount = applicableControls.length;

  if (applicableCount === 0) {
    return {
      orgId,
      tenantId,
      score: null,
      status: 'NOT_INITIALIZED',
      lastEvaluatedAt: evaluatedAt,
      framework,
      scope,
      applicableControlCount: 0,
      passingControlCount: 0,
      failedControlCount: 0,
      implementedControlCount: 0,
      evidenceGaps: 0,
      openFindings: 0,
      openMajorNCs: 0,
      openMinorNCs: 0,
      dataFreshness: 0,
      summaryText: 'No applicable controls in scope',
      evaluatedAgo: 'Just now',
      breakdown: {
        controlsScore: 0,
        evidenceScore: 0,
        findingsPenalty: 0,
        riskFactor: 0
      }
    };
  }

  const implementedControls = applicableControls.filter(c => 
    c.implementationStatus === 'Implemented' || 
    c.implementationStatus === 'Monitored' || 
    c.implementationStatus === 'Audited'
  );
  const implementedCount = implementedControls.length;

  const passingControls = applicableControls.filter(c => 
    c.implementationStatus === 'Audited' || 
    (c.implementationStatus === 'Monitored' && (c.maturityLevel || 0) >= 3)
  );

  const failedControls = applicableControls.filter(c => 
    c.implementationStatus === 'Not Started' ||
    findings.some(f => 
      ((f as any).controlId === c.controlCode || f.clauseOrControl === c.controlCode) && 
      f.status !== 'Closed Verified' && 
      (f.severity === 'Major Non-Conformity' || (f.severity as string) === 'Critical')
    )
  );

  const controlsScore = Math.round((implementedCount / applicableCount) * 100);

  // 2. Evidence Integrity & Freshness Analysis
  const totalEvidence = evidence.length;
  const verifiedEvidence = evidence.filter(e => e.status === 'Verified' || e.verificationState === 'Verified');
  const expiredEvidence = evidence.filter(e => {
    if (e.status === 'Expired') return true;
    if (e.expiryDate) {
      return new Date(e.expiryDate).getTime() < Date.now();
    }
    return false;
  });

  const freshEvidenceCount = Math.max(0, totalEvidence - expiredEvidence.length);
  const dataFreshness = totalEvidence > 0 ? Math.round((freshEvidenceCount / totalEvidence) * 100) : 0;
  const verificationRatio = totalEvidence > 0 ? verifiedEvidence.length / totalEvidence : 0;
  const freshnessRatio = totalEvidence > 0 ? freshEvidenceCount / totalEvidence : 0;
  const evidenceScore = Math.round(verificationRatio * 100 * (0.6 + 0.4 * freshnessRatio));

  // Check evidence gaps: applicable controls with 0 attached or verified evidence
  const coveredControlCodes = new Set(
    evidence
      .filter(e => e.status === 'Verified' || e.verificationState === 'Verified')
      .flatMap(e => (e as any).mappedControlIds || (e.controlCode ? [e.controlCode] : []))
  );
  const evidenceGaps = applicableControls.filter(c => !coveredControlCodes.has(c.controlCode)).length;

  // 3. Open Findings & Non-Conformities Penalty
  const openFindingsList = findings.filter(f => f.status !== 'Closed Verified');
  const majorNCs = openFindingsList.filter(f => f.severity === 'Major Non-Conformity' || (f.severity as string) === 'Critical');
  const minorNCs = openFindingsList.filter(f => f.severity === 'Minor Non-Conformity' || (f.severity as string) === 'High');
  const findingsPenalty = (majorNCs.length * 15) + (minorNCs.length * 5);

  // 4. Critical Risk Exposure Factor
  const criticalRisks = risks.filter(r => (r.residualScore || r.inherentScore) >= 20);
  const riskFactor = Math.min(25, criticalRisks.length * 4);

  // Determine if assessment data is sufficient
  if (implementedCount === 0 && totalEvidence === 0) {
    return {
      orgId,
      tenantId,
      score: null,
      status: 'DATA_REQUIRED',
      lastEvaluatedAt: evaluatedAt,
      framework,
      scope,
      applicableControlCount: applicableCount,
      passingControlCount: 0,
      failedControlCount: applicableCount,
      implementedControlCount: 0,
      evidenceGaps: applicableCount,
      openFindings: openFindingsList.length,
      openMajorNCs: majorNCs.length,
      openMinorNCs: minorNCs.length,
      dataFreshness: 0,
      summaryText: 'Data collection required (0 evidence files, 0 implemented controls)',
      evaluatedAgo: 'Just now',
      breakdown: {
        controlsScore: 0,
        evidenceScore: 0,
        findingsPenalty,
        riskFactor
      }
    };
  }

  // Composite Formula:
  // 50% Controls Implementation + 35% Evidence Verification & Freshness + 15% Audit/Finding Health - Risk Factor
  const weightedControls = controlsScore * 0.50;
  const weightedEvidence = evidenceScore * 0.35;
  const auditHealth = Math.max(0, (100 - findingsPenalty) * 0.15);
  const rawScore = weightedControls + weightedEvidence + auditHealth - riskFactor;
  const finalScore = Math.max(0, Math.min(100, Math.round(rawScore * 10) / 10));

  // Relative timestamp calculation
  const diffMs = Date.now() - new Date(evaluatedAt).getTime();
  let evaluatedAgo = 'Just now';
  if (diffMs > 3600000) {
    const hours = Math.floor(diffMs / 3600000);
    evaluatedAgo = `${hours}h ago`;
  } else if (diffMs > 60000) {
    const mins = Math.floor(diffMs / 60000);
    evaluatedAgo = `${mins}m ago`;
  }

  return {
    orgId,
    tenantId,
    score: finalScore,
    status: 'EVALUATED',
    lastEvaluatedAt: evaluatedAt,
    framework,
    scope,
    applicableControlCount: applicableCount,
    passingControlCount: passingControls.length,
    failedControlCount: failedControls.length,
    implementedControlCount: implementedCount,
    evidenceGaps,
    openFindings: openFindingsList.length,
    openMajorNCs: majorNCs.length,
    openMinorNCs: minorNCs.length,
    dataFreshness,
    summaryText: `${implementedCount} / ${applicableCount} controls evaluated`,
    evaluatedAgo,
    breakdown: {
      controlsScore,
      evidenceScore,
      findingsPenalty,
      riskFactor
    }
  };
}
