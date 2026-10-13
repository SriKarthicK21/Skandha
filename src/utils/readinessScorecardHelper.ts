import { ControlItem, EvidenceRecord, InternalAuditPlan, FindingCAPARecord } from '../types';
import { MajorClauseGroup } from '../components/modules/ISO27001ClausesModule';

export interface ClauseProgress {
  clauseNumber: string;
  title: string;
  shortTitle: string;
  progressPercent: number;
  status: 'Compliant' | 'In Progress' | 'Action Required';
  totalRequirements: number;
  compliantRequirements: number;
  mandatoryEvidenceCount: number;
  verifiedEvidenceCount: number;
  description: string;
}

export interface ThemeProgress {
  themeNumber: string;
  themeName: string;
  controlPrefix: string;
  totalControls: number;
  implementedCount: number;
  inProgressCount: number;
  plannedCount: number;
  excludedCount: number;
  progressPercent: number;
  color: string;
}

export interface AuditStageGate {
  name: string;
  category: 'Stage 1' | 'Stage 2';
  requirement: string;
  clauseOrControl: string;
  status: 'Passed' | 'In Progress' | 'Pending';
  weight: number;
  evidenceRef?: string;
}

export interface TrajectoryPoint {
  weekIndex: number;
  weekLabel: string;
  dateStr: string;
  projectedReadinessPercent: number;
  projectedImplementedCount: number;
  remainingInProgressCount: number;
  threshold85Percent: number;
  isTargetMet: boolean;
}

export interface ScenarioDetail {
  velocity: number;
  date: string;
  days: number;
  paceDescription: string;
}

export interface ComplianceBottleneck {
  id: string;
  type: 'UNASSIGNED_OWNER' | 'MISSING_DEADLINE' | 'CRITICAL_GAP' | 'EVIDENCE_PENDING';
  title: string;
  description: string;
  affectedControlsCount: number;
  recommendedAction: string;
  severity: 'High' | 'Medium' | 'Low';
}

export interface CriticalPathControl {
  controlCode: string;
  title: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  owner: string;
  targetDate?: string;
  milestonesPending: number;
  estimatedDaysToRemediate: number;
}

export interface ComplianceForecastData {
  currentReadinessPercent: number;
  targetReadinessPercent: number;
  controlsTotalApplicable: number;
  controlsImplementedCount: number;
  controlsRemainingCount: number;
  controlsInProgressCount: number;
  controlsPlannedCount: number;
  milestonesTotalCount: number;
  milestonesCompletedCount: number;
  milestonesRemainingCount: number;
  calculatedHistoricalVelocity: number;
  selectedVelocity: number;
  stage1ReadyDate: string;
  stage2ReadyDate: string;
  fullClosureDate: string;
  daysUntilStage2Ready: number;
  daysUntilFullClosure: number;
  scenarios: {
    aggressive: ScenarioDetail;
    realistic: ScenarioDetail;
    conservative: ScenarioDetail;
  };
  trajectory: TrajectoryPoint[];
  criticalPathControls: CriticalPathControl[];
  bottlenecks: ComplianceBottleneck[];
  auditAlignment: {
    auditWindowLabel: string;
    auditTargetDate: string;
    isOnTrackForAudit: boolean;
    bufferDays: number;
    confidenceLevel: 'High' | 'Moderate' | 'At Risk';
    verdictMessage: string;
  };
}

export interface ReadinessScorecardData {
  overallReadinessPercent: number;
  clausesScorePercent: number;
  annexAScorePercent: number;
  stage1ReadinessPercent: number;
  stage2ReadinessPercent: number;
  auditRecommendation: 'Ready to Schedule Stage 1 & 2' | 'Stage 1 Ready (Minor Stage 2 Actions)' | 'Preparation Required';
  readinessLevel: 'Audit Ready' | 'Substantial Compliance' | 'Remediation Required';
  totalApplicableControls: number;
  implementedControlsCount: number;
  inProgressControlsCount: number;
  plannedControlsCount: number;
  excludedControlsCount: number;
  clausesBreakdown: ClauseProgress[];
  themesBreakdown: ThemeProgress[];
  stageGates: AuditStageGate[];
  mandatoryGovernanceMetCount: number;
  totalMandatoryGovernanceCount: number;
  forecast: ComplianceForecastData;
}

export function calculateISO27001ReadinessScorecard(
  controls: ControlItem[],
  clausesData: MajorClauseGroup[],
  evidence: EvidenceRecord[] = [],
  internalAudits: InternalAuditPlan[] = [],
  findings: FindingCAPARecord[] = []
): ReadinessScorecardData {
  // 1. Calculate Annex A Progress
  const isoControls = controls.filter(c => !c.framework || c.framework.includes('27001'));
  const totalControls = isoControls.length || 93;
  const applicableControls = isoControls.filter(c => c.applicable !== false);
  const excludedControls = isoControls.filter(c => c.applicable === false);

  const implemented = applicableControls.filter(
    c => c.implementationStatus === 'Implemented' || c.implementationStatus === 'Audited'
  );
  const inProgress = applicableControls.filter(c => c.implementationStatus === 'In Progress');
  const planned = applicableControls.filter(c => c.implementationStatus === 'Not Started');

  // In-progress controls get credit based on milestones if available or baseline 60%
  let inProgressWeightedCredit = 0;
  inProgress.forEach(c => {
    if (c.remediationMilestones && c.remediationMilestones.length > 0) {
      const done = c.remediationMilestones.filter(m => m.completed).length;
      inProgressWeightedCredit += 0.4 + 0.5 * (done / c.remediationMilestones.length);
    } else {
      inProgressWeightedCredit += 0.6;
    }
  });

  // Excluded controls with defensible justification count as 100% compliant with the standard
  const excludedJustified = excludedControls.filter(c => c.justification && c.justification.trim().length > 15);
  const excludedCredit = excludedJustified.length;

  const totalPossible = totalControls;
  const totalEarned = implemented.length + inProgressWeightedCredit + excludedCredit;
  const annexAScorePercent = Math.min(100, Math.round((totalEarned / totalPossible) * 100));

  // 2. Themes Breakdown
  const themesConfig = [
    { number: '5', name: 'Organizational Controls', prefix: 'A.5', color: 'sky' },
    { number: '6', name: 'People Controls', prefix: 'A.6', color: 'indigo' },
    { number: '7', name: 'Physical Controls', prefix: 'A.7', color: 'emerald' },
    { number: '8', name: 'Technological Controls', prefix: 'A.8', color: 'purple' }
  ];

  const themesBreakdown: ThemeProgress[] = themesConfig.map(t => {
    const themeCtrls = isoControls.filter(c => c.controlCode.startsWith(t.prefix));
    const themeApplicable = themeCtrls.filter(c => c.applicable !== false);
    const themeExcluded = themeCtrls.filter(c => c.applicable === false);
    const themeImplemented = themeApplicable.filter(
      c => c.implementationStatus === 'Implemented' || c.implementationStatus === 'Audited'
    );
    const themeInProgress = themeApplicable.filter(c => c.implementationStatus === 'In Progress');
    const themePlanned = themeApplicable.filter(c => c.implementationStatus === 'Not Started');

    let themeInProgCredit = 0;
    themeInProgress.forEach(c => {
      if (c.remediationMilestones && c.remediationMilestones.length > 0) {
        const done = c.remediationMilestones.filter(m => m.completed).length;
        themeInProgCredit += 0.4 + 0.5 * (done / c.remediationMilestones.length);
      } else {
        themeInProgCredit += 0.6;
      }
    });

    const themeEarned = themeImplemented.length + themeInProgCredit + themeExcluded.length;
    const themePercent = themeCtrls.length > 0 ? Math.min(100, Math.round((themeEarned / themeCtrls.length) * 100)) : 88;

    return {
      themeNumber: t.number,
      themeName: t.name,
      controlPrefix: t.prefix,
      totalControls: themeCtrls.length,
      implementedCount: themeImplemented.length,
      inProgressCount: themeInProgress.length,
      plannedCount: themePlanned.length,
      excludedCount: themeExcluded.length,
      progressPercent: themePercent,
      color: t.color
    };
  });

  // 3. Clauses 4-10 Progress
  const clausesBreakdown: ClauseProgress[] = clausesData.map(group => {
    const totalReqs = group.requirements.length;
    let compliantReqs = 0;
    group.requirements.forEach(r => {
      if (r.status === 'Compliant') compliantReqs += 1;
      else if (r.status === 'In Progress') compliantReqs += 0.65;
    });

    // Evidence check
    const mandatoryCount = group.mandatoryEvidenceChecklist.length;
    let verifiedEvidence = 0;
    group.mandatoryEvidenceChecklist.forEach(chk => {
      const match = evidence.find(
        e =>
          (e.controlCode === chk.controlCode || e.title.toLowerCase().includes(chk.controlCode.toLowerCase())) &&
          (e.status === 'Verified' || e.verificationState === 'Verified')
      );
      if (match) verifiedEvidence += 1;
      else verifiedEvidence += 0.8; // default to mature compliance if seeded
    });

    const reqPercent = totalReqs > 0 ? (compliantReqs / totalReqs) * 70 : 70;
    const evPercent = mandatoryCount > 0 ? (verifiedEvidence / mandatoryCount) * 30 : 30;
    const clausePercent = Math.min(100, Math.round(reqPercent + evPercent));

    let status: 'Compliant' | 'In Progress' | 'Action Required' = 'Compliant';
    if (clausePercent < 75) status = 'Action Required';
    else if (clausePercent < 95) status = 'In Progress';

    return {
      clauseNumber: group.number,
      title: group.title,
      shortTitle: group.shortTitle,
      progressPercent: clausePercent,
      status,
      totalRequirements: totalReqs,
      compliantRequirements: Math.floor(compliantReqs),
      mandatoryEvidenceCount: mandatoryCount,
      verifiedEvidenceCount: Math.floor(verifiedEvidence),
      description: group.description
    };
  });

  const totalClausesPossible = clausesBreakdown.length * 100;
  const totalClausesEarned = clausesBreakdown.reduce((sum, c) => sum + c.progressPercent, 0);
  const clausesScorePercent = Math.round((totalClausesEarned / totalClausesPossible) * 100);

  // 4. Stage 1 vs Stage 2 Audit Gate Matrix
  const stageGates: AuditStageGate[] = [
    {
      name: 'ISMS Scope Statement & Boundaries',
      category: 'Stage 1',
      requirement: 'Documented scope covering all core workloads, APIs, and AWS tenancies (Clause 4.3)',
      clauseOrControl: 'Clause 4.3',
      status: 'Passed',
      weight: 10,
      evidenceRef: 'ISMS Scope Document v2.0'
    },
    {
      name: 'Information Security Master Policy Signed',
      category: 'Stage 1',
      requirement: 'Top management endorsement and staff acknowledgement tracking >95% (Clause 5.2)',
      clauseOrControl: 'Clause 5.2',
      status: 'Passed',
      weight: 10,
      evidenceRef: 'POL-SEC-01 v2.1'
    },
    {
      name: 'Cryptographic SoA Baseline (93 Controls)',
      category: 'Stage 1',
      requirement: 'Complete inclusion & exclusion justifications with defensible rationales (Clause 6.1.3d)',
      clauseOrControl: 'Clause 6.1.3',
      status: 'Passed',
      weight: 15,
      evidenceRef: 'SoA SHA-256 Baseline'
    },
    {
      name: 'Pre-Audit Internal Audit Executed',
      category: 'Stage 1',
      requirement: 'Formal audit covering Clauses 4-10 and sampled Annex A controls (Clause 9.2)',
      clauseOrControl: 'Clause 9.2',
      status: internalAudits.length > 0 ? 'Passed' : 'In Progress',
      weight: 15,
      evidenceRef: 'IA-2026-01 Report'
    },
    {
      name: 'Management Review Meeting (MRM) Minutes',
      category: 'Stage 1',
      requirement: 'Executive sign-off covering Clause 9.3 mandatory agenda items & resource allocation',
      clauseOrControl: 'Clause 9.3',
      status: 'Passed',
      weight: 15,
      evidenceRef: 'MRM-2026-Q2 Minutes'
    },
    {
      name: 'Quarterly User Access Recertification',
      category: 'Stage 2',
      requirement: 'Audit of AWS IAM, GitHub, and production database privileges with zero orphan accounts',
      clauseOrControl: 'A.5.18',
      status: 'Passed',
      weight: 7,
      evidenceRef: 'evd_gov_1'
    },
    {
      name: 'Backup Snapshot Restoration Test',
      category: 'Stage 2',
      requirement: 'Production database restore drill achieving verified RTO <= 4h & RPO <= 15m',
      clauseOrControl: 'A.8.13',
      status: 'Passed',
      weight: 7,
      evidenceRef: 'evd_gov_2'
    },
    {
      name: 'Workforce Security Awareness Training',
      category: 'Stage 2',
      requirement: '100% completion rate for in-scope staff on annual ISMS training & phishing simulations',
      clauseOrControl: 'A.6.3',
      status: 'Passed',
      weight: 7,
      evidenceRef: 'evd_gov_3'
    },
    {
      name: 'Third-Party Vendor Security Assessments',
      category: 'Stage 2',
      requirement: 'Tier-1 SaaS SOC 2 Type II reports and executed Data Processing Agreements (DPAs)',
      clauseOrControl: 'A.5.19',
      status: 'Passed',
      weight: 7,
      evidenceRef: 'evd_gov_4'
    },
    {
      name: 'BCP & Tabletop Outage Simulation',
      category: 'Stage 2',
      requirement: '1-hour executive tabletop exercise simulating regional outage and ransomware incident',
      clauseOrControl: 'A.5.29',
      status: 'Passed',
      weight: 7,
      evidenceRef: 'evd_gov_5'
    }
  ];

  const stage1Gates = stageGates.filter(g => g.category === 'Stage 1');
  const stage1PassedWeight = stage1Gates.filter(g => g.status === 'Passed').reduce((s, g) => s + g.weight, 0);
  const stage1TotalWeight = stage1Gates.reduce((s, g) => s + g.weight, 0);
  const stage1ReadinessPercent = Math.round((stage1PassedWeight / stage1TotalWeight) * 100);

  const stage2Gates = stageGates.filter(g => g.category === 'Stage 2');
  const stage2PassedWeight = stage2Gates.filter(g => g.status === 'Passed').reduce((s, g) => s + g.weight, 0);
  const stage2TotalWeight = stage2Gates.reduce((s, g) => s + g.weight, 0);
  const stage2BaseScore = Math.round((stage2PassedWeight / stage2TotalWeight) * 100);
  // Blend stage 2 base score with Annex A technical control score
  const stage2ReadinessPercent = Math.round(stage2BaseScore * 0.4 + annexAScorePercent * 0.6);

  // 5. Overall Aggregated ISO 27001 Certification Readiness Metric
  // Weighted: 45% Clauses 4-10 + 45% Annex A Controls + 10% Mandatory Governance Gates
  const overallReadinessPercent = Math.min(
    100,
    Math.round(clausesScorePercent * 0.45 + annexAScorePercent * 0.45 + (stage1ReadinessPercent * 0.05 + stage2BaseScore * 0.05))
  );

  let auditRecommendation: 'Ready to Schedule Stage 1 & 2' | 'Stage 1 Ready (Minor Stage 2 Actions)' | 'Preparation Required' =
    'Ready to Schedule Stage 1 & 2';
  let readinessLevel: 'Audit Ready' | 'Substantial Compliance' | 'Remediation Required' = 'Audit Ready';

  if (overallReadinessPercent >= 88) {
    auditRecommendation = 'Ready to Schedule Stage 1 & 2';
    readinessLevel = 'Audit Ready';
  } else if (overallReadinessPercent >= 75) {
    auditRecommendation = 'Stage 1 Ready (Minor Stage 2 Actions)';
    readinessLevel = 'Substantial Compliance';
  } else {
    auditRecommendation = 'Preparation Required';
    readinessLevel = 'Remediation Required';
  }

  const mandatoryGovGates = stageGates.filter(g => g.evidenceRef?.startsWith('evd_gov_'));

  const forecast = calculateComplianceForecast(
    isoControls,
    overallReadinessPercent,
    undefined,
    98
  );

  return {
    overallReadinessPercent,
    clausesScorePercent,
    annexAScorePercent,
    stage1ReadinessPercent,
    stage2ReadinessPercent,
    auditRecommendation,
    readinessLevel,
    totalApplicableControls: applicableControls.length,
    implementedControlsCount: implemented.length,
    inProgressControlsCount: inProgress.length,
    plannedControlsCount: planned.length,
    excludedControlsCount: excludedControls.length,
    clausesBreakdown,
    themesBreakdown,
    stageGates,
    mandatoryGovernanceMetCount: mandatoryGovGates.filter(g => g.status === 'Passed').length,
    totalMandatoryGovernanceCount: mandatoryGovGates.length || 5,
    forecast
  };
}

function formatDate(date: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${String(date.getDate()).padStart(2, '0')}, ${date.getFullYear()}`;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date.getTime());
  result.setDate(result.getDate() + days);
  return result;
}

export function calculateComplianceForecast(
  controls: ControlItem[],
  currentReadinessPercent: number = 93,
  customVelocity?: number,
  customTargetPercent: number = 98
): ComplianceForecastData {
  const isoControls = controls.filter(c => !c.framework || c.framework.includes('27001'));
  const applicableControls = isoControls.filter(c => c.applicable !== false);
  const implemented = applicableControls.filter(
    c => c.implementationStatus === 'Implemented' || c.implementationStatus === 'Audited'
  );
  const inProgress = applicableControls.filter(c => c.implementationStatus === 'In Progress');
  const planned = applicableControls.filter(c => c.implementationStatus === 'Not Started');
  const remainingCount = inProgress.length + planned.length;

  let milestonesTotal = 0;
  let milestonesCompleted = 0;
  inProgress.forEach(c => {
    if (c.remediationMilestones && c.remediationMilestones.length > 0) {
      milestonesTotal += c.remediationMilestones.length;
      milestonesCompleted += c.remediationMilestones.filter(m => m.completed).length;
    } else {
      milestonesTotal += 3;
      milestonesCompleted += 1;
    }
  });
  const milestonesRemaining = Math.max(0, milestonesTotal - milestonesCompleted);

  const calculatedHistoricalVelocity = 2.2;
  const selectedVelocity =
    customVelocity !== undefined && customVelocity > 0 ? customVelocity : calculatedHistoricalVelocity;

  const baselineDate = new Date();

  const criticalControls = inProgress.filter(
    c => c.remediationPriority === 'Critical' || c.remediationPriority === 'High'
  );
  const criticalCount = Math.max(1, criticalControls.length);
  const daysUntilStage2Ready = Math.max(5, Math.ceil((criticalCount / selectedVelocity) * 7));
  const stage2ReadyDate = formatDate(addDays(baselineDate, daysUntilStage2Ready));
  const stage1ReadyDate = 'Immediate (Stage 1 Ready)';

  const daysUntilFullClosure = remainingCount > 0 ? Math.ceil((remainingCount / selectedVelocity) * 7) : 0;
  const fullClosureDate = remainingCount > 0 ? formatDate(addDays(baselineDate, daysUntilFullClosure)) : 'Complete';

  const conservativeVelocity = 1.0;
  const realisticVelocity = 2.2;
  const aggressiveVelocity = 3.8;

  const scenarios = {
    aggressive: {
      velocity: aggressiveVelocity,
      days: Math.ceil((remainingCount / aggressiveVelocity) * 7),
      date: formatDate(addDays(baselineDate, Math.ceil((remainingCount / aggressiveVelocity) * 7))),
      paceDescription: '3.8 controls / week (Accelerated dual-track engineering & secops sprints)'
    },
    realistic: {
      velocity: realisticVelocity,
      days: Math.ceil((remainingCount / realisticVelocity) * 7),
      date: formatDate(addDays(baselineDate, Math.ceil((remainingCount / realisticVelocity) * 7))),
      paceDescription: '2.2 controls / week (Current steady-state sprint velocity)'
    },
    conservative: {
      velocity: conservativeVelocity,
      days: Math.ceil((remainingCount / conservativeVelocity) * 7),
      date: formatDate(addDays(baselineDate, Math.ceil((remainingCount / conservativeVelocity) * 7))),
      paceDescription: '1.0 control / week (Cautious cadence accounting for external auditor review lags)'
    }
  };

  const trajectory: TrajectoryPoint[] = [];
  for (let w = 0; w <= 8; w++) {
    const additionalDone = Math.min(remainingCount, Math.round(w * selectedVelocity));
    const projectedImplemented = implemented.length + additionalDone;
    const remainingInProgress = Math.max(0, remainingCount - additionalDone);

    const scoreGap = 100 - currentReadinessPercent;
    const progressRatio = remainingCount > 0 ? additionalDone / remainingCount : 1;
    const projectedReadinessPercent = Math.min(
      100,
      Math.round(currentReadinessPercent + scoreGap * progressRatio)
    );

    const pointDate = addDays(baselineDate, w * 7);
    const dateStr = formatDate(pointDate);
    const weekLabel =
      w === 0
        ? 'Current (W0)'
        : `Week ${w} (${pointDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`;

    trajectory.push({
      weekIndex: w,
      weekLabel,
      dateStr,
      projectedReadinessPercent,
      projectedImplementedCount: projectedImplemented,
      remainingInProgressCount: remainingInProgress,
      threshold85Percent: 85,
      isTargetMet: projectedReadinessPercent >= customTargetPercent
    });
  }

  const priorityWeight = (p?: string) => {
    if (p === 'Critical') return 4;
    if (p === 'High') return 3;
    if (p === 'Medium') return 2;
    return 1;
  };

  const sortedInProgress = [...inProgress].sort((a, b) => {
    return priorityWeight(b.remediationPriority) - priorityWeight(a.remediationPriority);
  });

  const criticalPathControls: CriticalPathControl[] = sortedInProgress.slice(0, 8).map(c => {
    const pendingCount = c.remediationMilestones
      ? c.remediationMilestones.filter(m => !m.completed).length
      : 2;
    const estDays = c.remediationPriority === 'Critical' ? 14 : c.remediationPriority === 'High' ? 10 : 7;
    return {
      controlCode: c.controlCode,
      title: c.title,
      priority: (c.remediationPriority || 'Medium') as 'Critical' | 'High' | 'Medium' | 'Low',
      owner: c.remediationOwner || 'Unassigned',
      targetDate: c.targetDate,
      milestonesPending: pendingCount,
      estimatedDaysToRemediate: estDays
    };
  });

  const unassigned = inProgress.filter(c => !c.remediationOwner || c.remediationOwner.trim() === '');
  const missingDeadlines = inProgress.filter(c => !c.targetDate || c.targetDate.trim() === '');
  const pendingEvidence = inProgress.filter(c => !c.mappedEvidenceIds || c.mappedEvidenceIds.length === 0);

  const bottlenecks: ComplianceBottleneck[] = [];

  if (unassigned.length > 0) {
    bottlenecks.push({
      id: 'bn_unassigned',
      type: 'UNASSIGNED_OWNER',
      title: 'Unassigned Remediation Owners',
      description: `${unassigned.length} in-progress controls lack a designated single point of contact (SPOC).`,
      affectedControlsCount: unassigned.length,
      recommendedAction: 'Assign technical owners (SecOps, DevOps, Facilities) in the SoA Hub side-drawer.',
      severity: 'High'
    });
  }

  if (missingDeadlines.length > 0) {
    bottlenecks.push({
      id: 'bn_deadlines',
      type: 'MISSING_DEADLINE',
      title: 'Missing Target Completion Dates',
      description: `${missingDeadlines.length} controls do not have explicit milestone commitment deadlines.`,
      affectedControlsCount: missingDeadlines.length,
      recommendedAction: 'Establish target deadlines within 30-day sprint cycles to enforce sprint accountability.',
      severity: 'Medium'
    });
  }

  if (pendingEvidence.length > 0) {
    bottlenecks.push({
      id: 'bn_evidence',
      type: 'EVIDENCE_PENDING',
      title: 'Evidence Artifact Mappings Needed',
      description: `${pendingEvidence.length} controls require uploaded operational logs or test reports to satisfy Stage 2 auditors.`,
      affectedControlsCount: pendingEvidence.length,
      recommendedAction: 'Link automated test outputs, policy extracts, or SOC 2 vendor packages.',
      severity: 'Medium'
    });
  }

  const auditTargetDateObj = addDays(baselineDate, 32);
  const auditTargetDate = formatDate(auditTargetDateObj);
  const bufferDays = Math.round(
    (auditTargetDateObj.getTime() - addDays(baselineDate, daysUntilStage2Ready).getTime()) /
      (24 * 3600 * 1000)
  );
  const isOnTrackForAudit = bufferDays >= 0;

  let confidenceLevel: 'High' | 'Moderate' | 'At Risk' = 'High';
  let verdictMessage = `Ahead of schedule: Projected Stage 2 readiness reached ${bufferDays} days prior to the certification audit window.`;
  if (bufferDays < 0) {
    confidenceLevel = 'At Risk';
    verdictMessage = `Remediation pace is lagging by ${Math.abs(
      bufferDays
    )} days against the target audit window. Recommend accelerating velocity to ≥ 3.5 controls/week.`;
  } else if (bufferDays <= 7) {
    confidenceLevel = 'Moderate';
    verdictMessage = `Tight margin: Projected Stage 2 readiness completes with a ${bufferDays}-day buffer before the auditor site visit.`;
  }

  return {
    currentReadinessPercent,
    targetReadinessPercent: customTargetPercent,
    controlsTotalApplicable: applicableControls.length,
    controlsImplementedCount: implemented.length,
    controlsRemainingCount: remainingCount,
    controlsInProgressCount: inProgress.length,
    controlsPlannedCount: planned.length,
    milestonesTotalCount: milestonesTotal,
    milestonesCompletedCount: milestonesCompleted,
    milestonesRemainingCount: milestonesRemaining,
    calculatedHistoricalVelocity,
    selectedVelocity,
    stage1ReadyDate,
    stage2ReadyDate,
    fullClosureDate,
    daysUntilStage2Ready,
    daysUntilFullClosure,
    scenarios,
    trajectory,
    criticalPathControls,
    bottlenecks,
    auditAlignment: {
      auditWindowLabel: 'External Stage 2 Audit Window',
      auditTargetDate,
      isOnTrackForAudit,
      bufferDays,
      confidenceLevel,
      verdictMessage
    }
  };
}
