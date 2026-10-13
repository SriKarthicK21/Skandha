import React, { useState, useEffect } from 'react';
import { useGRC } from '../../context/GRCContext';
import { WorkspaceLayout, WorkspaceTab, WorkspaceStat } from './WorkspaceLayout';
import {
  Flame,
  Grid,
  SlidersHorizontal,
  FileCheck2,
  Award,
  DollarSign,
  Activity,
  Sparkles,
  Layers,
  LayoutDashboard,
  AlertOctagon,
  Cpu
} from 'lucide-react';

// Modules & Views
import { EnterpriseRiskCommandCenter } from '../risk/EnterpriseRiskCommandCenter';
import { EnterpriseRiskRegisterView } from '../risk/EnterpriseRiskRegisterView';
import { QuantitativeRiskSimulatorView } from '../risk/QuantitativeRiskSimulatorView';
import { RiskAppetiteStudioView } from '../risk/RiskAppetiteStudioView';
import { AIRiskIntelligenceCopilotView } from '../risk/AIRiskIntelligenceCopilotView';
import { RiskExplainabilityModal } from '../risk/RiskExplainabilityModal';
import { EnterpriseRiskCreateModal } from '../risk/EnterpriseRiskCreateModal';
import { ExecutiveDecisionQueueView } from '../risk/ExecutiveDecisionQueueView';
import { LiveConnectorMaturityView } from '../risk/LiveConnectorMaturityView';
import { TreatmentAssuranceLedgerView } from '../risk/TreatmentAssuranceLedgerView';
import { RiskMapModule } from '../modules/RiskMapModule';
import { RiskTreatmentSimulatorModule } from '../modules/RiskTreatmentSimulatorModule';
import { SecurityExceptionsModule } from '../modules/SecurityExceptionsModule';
import { LiveTelemetryFeed } from '../risk/LiveTelemetryFeed';

import {
  EnterpriseRiskRecord,
  ExecutiveRiskCommandSummary,
  AIRiskCopilotResponse,
  ExecutiveDecisionItem,
  LiveConnectorMaturityRecord,
  TreatmentVerificationRecord
} from '../../types/enterpriseRiskTypes';

import {
  MASTER_ENTERPRISE_RISKS,
  MASTER_APPETITE_THRESHOLDS,
  MASTER_BUSINESS_SERVICES
} from '../../data/enterpriseRiskMasterData';

interface RiskWorkspaceProps {
  initialTab?: string;
}

export const RiskWorkspace: React.FC<RiskWorkspaceProps> = ({ initialTab }) => {
  const { currentTenant, risks: canonicalGrcRisks } = useGRC();
  const [activeTab, setActiveTab] = useState<string>(initialTab || 'command_center');

  // Enterprise Risk State
  const [risksList, setRisksList] = useState<EnterpriseRiskRecord[]>([...MASTER_ENTERPRISE_RISKS]);
  const [selectedRisk, setSelectedRisk] = useState<EnterpriseRiskRecord | null>(null);
  const [explainRisk, setExplainRisk] = useState<{ risk: EnterpriseRiskRecord; tab: 'why' | 'what-changed' | 'next-action' } | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  // Synchronize Tab on prop change
  useEffect(() => {
    if (initialTab) {
      if (
        [
          'command_center',
          'decision_queue',
          'register',
          'quantitative',
          'appetite',
          'treatment_ledger',
          'connectors',
          'heatmap',
          'treatment',
          'exceptions',
          'telemetry',
          'copilot'
        ].includes(initialTab)
      ) {
        setActiveTab(initialTab);
      } else if (initialTab === 'risk_map') {
        setActiveTab('heatmap');
      } else if (initialTab === 'risk_assessment') {
        setActiveTab('register');
      } else if (initialTab === 'board_risk_appetite') {
        setActiveTab('appetite');
      } else {
        setActiveTab(initialTab);
      }
    }
  }, [initialTab]);

  // Executive Summary KPI calculations
  const summaryKPIs: ExecutiveRiskCommandSummary = {
    tenantId: currentTenant?.id || '11111111-1111-4111-8111-111111111111',
    totalActiveRisks: risksList.length,
    criticalRisksCount: risksList.filter(r => r.residualRiskScore >= 16).length,
    highRisksCount: risksList.filter(r => r.residualRiskScore >= 10 && r.residualRiskScore < 16).length,
    mediumRisksCount: risksList.filter(r => r.residualRiskScore >= 5 && r.residualRiskScore < 10).length,
    lowRisksCount: risksList.filter(r => r.residualRiskScore < 5).length,
    outsideAppetiteCount: risksList.filter(r => r.isOutsideAppetite).length,
    increasingVelocityCount: risksList.filter(r => r.riskVelocity === 'INCREASING').length,
    overdueReviewCount: 0,
    activeTreatmentsCount: risksList.filter(r => r.treatmentStatus === 'IN_PROGRESS').length,
    overdueCapasCount: 0,
    staleEvidenceRisksCount: risksList.filter(r => r.assuranceStatus === 'STALE_EVIDENCE').length,
    failedControlLinkedRisksCount: risksList.filter(r => r.controlOperatingRating === 'SIGNIFICANT_DEFICIENCY').length,
    supplierConcentrationRisksCount: risksList.filter(r => r.category === 'Third-Party & Supply Chain').length,
    regulatoryImpactedRisksCount: risksList.filter(r => r.requirementIds.length > 0).length,
    averageControlEffectivenessPercent: Math.round(
      risksList.reduce((acc, r) => acc + r.currentControlEffectivenessPercent, 0) / Math.max(1, risksList.length)
    ),
    totalAssessedFinancialExposureUSD: risksList.reduce(
      (acc, r) => acc + (r.quantitativeAnalysis?.singleLossExpectancyUSD || 0),
      0
    ),
    totalAnnualLossExpectancyUSD: risksList.reduce(
      (acc, r) => acc + (r.quantitativeAnalysis?.annualLossExpectancyUSD || 0),
      0
    ),
    overallEnterpriseRiskScore: 68,
    topRiskDrivers: [...risksList].sort((a, b) => b.residualRiskScore - a.residualRiskScore).slice(0, 5),
    topExposedBusinessServices: MASTER_BUSINESS_SERVICES.map(svc => {
      const mapped = risksList.filter(r => r.businessServiceIds.includes(svc.id));
      return {
        serviceId: svc.id,
        serviceName: svc.name,
        criticality: svc.criticality,
        activeRisksCount: mapped.length,
        maxResidualScore: mapped.length > 0 ? Math.max(...mapped.map(r => r.residualRiskScore)) : 0
      };
    }).sort((a, b) => b.maxResidualScore - a.maxResidualScore),
    generatedAt: new Date().toISOString()
  };

  // Phase 34 Decision Support Items
  const decisionItems: ExecutiveDecisionItem[] = [
    {
      decisionId: 'DEC-001',
      priority: 'CRITICAL',
      urgencyScore: 92,
      riskId: 'RSK-PRIV-003',
      riskCode: 'RSK-PRIV-003',
      title: 'Appetite Breach: Personal Data Subprocessor Routing to Non-Whitelisted Jurisdiction',
      whyItMatters: 'Residual score 12/25 exceeds approved Board appetite limit of 8/25 under DPDP Section 8 and GDPR Art 44.',
      whatChanged: 'Datadog subprocessor log telemetry scan detected unmasked Aadhaar and phone numbers.',
      businessImpact: 'Potential statutory penalties up to ₹250 Crores and regulatory enforcement notice.',
      supportingEvidence: ['EV-DPDP-DPIA-01', 'EV-DLP-SCAN-01'],
      residualRiskScore: 12,
      appetiteLimit: 8,
      isOutsideAppetite: true,
      potentialExposureUSD: 2500000,
      accountableOwner: 'Sarah Chen (CISO)',
      requiredDecision: 'Authorize temporary 30-day risk acceptance waiver or allocate $95,000 emergency proxy budget.',
      availableActions: ['ACCEPT', 'APPROVE_TREATMENT', 'ESCALATE', 'REQUEST_EVIDENCE'],
      dueDate: '2026-10-31',
      verificationStatus: 'PENDING_REVIEW'
    },
    {
      decisionId: 'DEC-002',
      priority: 'HIGH',
      urgencyScore: 78,
      riskId: 'RSK-CYBER-001',
      riskCode: 'RSK-CYBER-001',
      title: 'Control Retest Verification: AWS S3 Object Lock & DR Snapshot Reconstitution',
      whyItMatters: 'Quarterly DR failover SLA must be verified to sustain Tier-1 Core Banking resilience mandate.',
      whatChanged: 'Completed deployment of immutable backup locks in ap-southeast-1.',
      businessImpact: 'Protects against $7.5M maximum ransomware loss scenario.',
      supportingEvidence: ['EV-DR-TEST-01', 'EV-AWS-IAM-01'],
      residualRiskScore: 8,
      appetiteLimit: 12,
      isOutsideAppetite: false,
      potentialExposureUSD: 450000,
      accountableOwner: 'David Lim (Head of InfoSec)',
      requiredDecision: 'Review passing retest telemetry and sign off on verified residual risk reduction to 8/25.',
      availableActions: ['APPROVE_TREATMENT', 'REQUEST_REASSESSMENT', 'SCHEDULE_REVIEW'],
      dueDate: '2026-11-15',
      verificationStatus: 'VERIFIED'
    }
  ];

  // Phase 34 Connectors Maturity Data
  const connectorMaturity: LiveConnectorMaturityRecord[] = [
    {
      connectorId: 'conn-aws-prod',
      name: 'AWS Cloud Infrastructure (ap-southeast-1)',
      provider: 'Amazon Web Services',
      environment: 'PRODUCTION',
      maturityLevel: 'PRODUCTION_VERIFIED',
      authStatus: 'CONFIGURED',
      isLiveValidated: true,
      credentialScope: ['read:cloudtrail', 'read:s3', 'read:iam'],
      lastSuccessfulRetrieval: new Date().toISOString(),
      collectionLatencyMs: 42,
      dataCompletenessPercent: 98,
      dataFreshnessScore: 99,
      errorRatePercent: 0.01,
      affectedEntitiesCount: 142,
      risksUpdatedCount: 3,
      knownLimitations: ['CloudTrail multi-region stream buffer latency < 15s']
    },
    {
      connectorId: 'conn-okta-identity',
      name: 'Okta Enterprise Workforce SSO & MFA',
      provider: 'Okta Inc.',
      environment: 'PRODUCTION',
      maturityLevel: 'PRODUCTION_VERIFIED',
      authStatus: 'CONFIGURED',
      isLiveValidated: true,
      credentialScope: ['users:read', 'factors:read', 'logs:read'],
      lastSuccessfulRetrieval: new Date().toISOString(),
      collectionLatencyMs: 28,
      dataCompletenessPercent: 100,
      dataFreshnessScore: 100,
      errorRatePercent: 0.0,
      affectedEntitiesCount: 840,
      risksUpdatedCount: 2,
      knownLimitations: ['Rate limit cap 200 req/min on public API endpoint']
    },
    {
      connectorId: 'conn-snyk-vmdr',
      name: 'Snyk Container & Dependency Security Hub',
      provider: 'Snyk Ltd.',
      environment: 'PRODUCTION',
      maturityLevel: 'CONTINUOUS_MONITORING_VERIFIED',
      authStatus: 'CONFIGURED',
      isLiveValidated: true,
      credentialScope: ['org:read', 'project:read', 'vuln:read'],
      lastSuccessfulRetrieval: new Date().toISOString(),
      collectionLatencyMs: 85,
      dataCompletenessPercent: 95,
      dataFreshnessScore: 92,
      errorRatePercent: 0.05,
      affectedEntitiesCount: 68,
      risksUpdatedCount: 2,
      knownLimitations: ['Nightly deep-scan SLA window for large base images']
    },
    {
      connectorId: 'conn-datadog-siem',
      name: 'Datadog Cloud SIEM & Auditd Log Sentinel',
      provider: 'Datadog Inc.',
      environment: 'PRODUCTION',
      maturityLevel: 'PRODUCTION_VERIFIED',
      authStatus: 'CONFIGURED',
      isLiveValidated: true,
      credentialScope: ['logs:read', 'monitors:read', 'events:read'],
      lastSuccessfulRetrieval: new Date().toISOString(),
      collectionLatencyMs: 18,
      dataCompletenessPercent: 99,
      dataFreshnessScore: 98,
      errorRatePercent: 0.02,
      affectedEntitiesCount: 320,
      risksUpdatedCount: 4,
      knownLimitations: ['PII client-side tokenization proxy active']
    }
  ];

  // Phase 34 Treatment Verifications
  const treatmentVerifications: TreatmentVerificationRecord[] = [
    {
      treatmentId: 'TRT-VERIF-001',
      riskId: 'RSK-CYBER-001',
      tenantId: '11111111-1111-4111-8111-111111111111',
      verifiedBy: 'Sarah Chen (CISO)',
      verificationProcedure: 'Automated DR Failover simulation and S3 Object Lock snapshot recovery test.',
      retestCriteria: 'Recovery point objective (RPO) = 0 and recovery time objective (RTO) < 15 minutes.',
      retestPassed: true,
      retestEvidenceIds: ['EV-DR-TEST-01', 'EV-AWS-IAM-01'],
      preTreatmentResidualScore: 15,
      postTreatmentResidualScore: 8,
      preTreatmentALEUSD: 1200000,
      postTreatmentALEUSD: 450000,
      unmitigatedExposureUSD: 450000,
      verificationDate: '2026-10-01T08:00:00Z',
      status: 'VERIFIED_AND_CLOSED',
      closureApproved: true,
      closureApprovedBy: 'Sarah Chen (CISO)',
      retestRequired: false,
      auditExplanation: 'Automated DR failover test passed and residual score 8 is within appetite 12.'
    },
    {
      treatmentId: 'TRT-VERIF-002',
      riskId: 'RSK-IAM-002',
      tenantId: '11111111-1111-4111-8111-111111111111',
      verifiedBy: 'Elena Rostova (Lead IAM Engineer)',
      verificationProcedure: 'Automated Okta API query for 100% FIDO2 WebAuthn enrollment with zero SMS fallback.',
      retestCriteria: '100% active workforce accounts configured with hardware passkeys.',
      retestPassed: true,
      retestEvidenceIds: ['EV-OKTA-FIDO2-01'],
      preTreatmentResidualScore: 16,
      postTreatmentResidualScore: 4,
      preTreatmentALEUSD: 350000,
      postTreatmentALEUSD: 35000,
      unmitigatedExposureUSD: 35000,
      verificationDate: '2026-09-15T10:00:00Z',
      status: 'VERIFIED_AND_CLOSED',
      closureApproved: true,
      closureApprovedBy: 'David Lim (Head of InfoSec)',
      retestRequired: false,
      auditExplanation: '100% WebAuthn enforcement verified via Okta API.'
    }
  ];

  // Handlers
  const handleCreateRisk = (newRiskData: any) => {
    const id = `RSK-AUTO-${Date.now()}`;
    const nextCode = `RSK-USR-${String(risksList.length + 1).padStart(3, '0')}`;
    const inherentScore = newRiskData.inherentLikelihood * newRiskData.inherentImpact;
    const residualScore = newRiskData.residualLikelihood * newRiskData.residualImpact;
    const appetite = newRiskData.riskAppetiteScore || 8;
    const isOutside = residualScore > appetite;

    const created: EnterpriseRiskRecord = {
      id,
      tenantId: currentTenant?.id || '11111111-1111-4111-8111-111111111111',
      riskCode: nextCode,
      title: newRiskData.title,
      description: newRiskData.description,
      category: newRiskData.category,
      riskScenario: newRiskData.riskScenario,
      riskStatement: newRiskData.riskStatement,
      businessContext: 'Enterprise operational scope',
      riskOwner: newRiskData.riskOwner,
      accountableExecutive: newRiskData.accountableExecutive,
      businessUnit: newRiskData.businessUnit,
      businessServiceIds: newRiskData.businessServiceIds,
      assetIds: newRiskData.assetIds,
      supplierIds: [],
      threatIds: [],
      vulnerabilityIds: [],
      requirementIds: [],
      controlIds: newRiskData.controlIds,
      evidenceIds: [],
      findingIds: [],
      capaIds: [],
      exceptionIds: [],
      riskMethodology: 'QUALITATIVE_5X5',
      methodologyVersion: '2026.1-Enterprise',
      inherentLikelihood: newRiskData.inherentLikelihood,
      inherentImpact: newRiskData.inherentImpact,
      inherentRiskScore: inherentScore,
      inherentLevel: inherentScore >= 16 ? 'CRITICAL' : inherentScore >= 10 ? 'HIGH' : inherentScore >= 5 ? 'MEDIUM' : 'LOW',
      currentControlEffectivenessPercent: 75,
      controlDesignRating: 'EFFECTIVE',
      controlOperatingRating: 'OPERATING_EFFECTIVELY',
      residualLikelihood: newRiskData.residualLikelihood,
      residualImpact: newRiskData.residualImpact,
      residualRiskScore: residualScore,
      residualLevel: residualScore >= 16 ? 'CRITICAL' : residualScore >= 10 ? 'HIGH' : residualScore >= 5 ? 'MEDIUM' : 'LOW',
      targetRiskScore: Math.min(residualScore, 6),
      riskAppetiteScore: appetite,
      isOutsideAppetite: isOutside,
      riskVelocity: isOutside ? 'OUTSIDE_APPETITE' : 'STABLE',
      riskTrend: 'STABLE',
      confidenceLevelPercent: 88,
      dataCompletenessPercent: 90,
      treatmentStrategy: newRiskData.treatmentStrategy,
      treatmentPlanDescription: newRiskData.treatmentPlanDescription,
      treatmentPlanBudgetUSD: newRiskData.treatmentPlanBudgetUSD,
      treatmentTargetDate: newRiskData.treatmentTargetDate,
      treatmentStatus: 'IN_PROGRESS',
      status: 'TREATMENT_IN_PROGRESS',
      assuranceStatus: 'PARTIALLY_ASSURED',
      executiveAcceptance: {
        required: isOutside,
        status: isOutside ? 'PENDING_REVIEW' : 'NOT_REQUIRED',
        justification: 'Nominal',
        compensatingControls: [],
        reviewFrequencyMonths: 6
      },
      lastAssessmentAt: new Date().toISOString(),
      lastAssessedBy: newRiskData.riskOwner,
      nextReviewAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1
    };

    setRisksList(prev => [created, ...prev]);
  };

  const handleAcceptRisk = (riskId: string, approvalData: any) => {
    setRisksList(prev =>
      prev.map(r => {
        if (r.id === riskId) {
          return {
            ...r,
            executiveAcceptance: {
              required: true,
              status: 'ACCEPTED',
              acceptedBy: approvalData.approverName,
              acceptedByRole: approvalData.approverRole,
              acceptedAt: new Date().toISOString(),
              reviewFrequencyMonths: 3,
              expiryDate: approvalData.expiryDate,
              justification: approvalData.justification,
              compensatingControls: approvalData.compensatingControls,
              isExpired: false
            },
            isOutsideAppetite: false, // Formally accepted
            updatedAt: new Date().toISOString(),
            version: r.version + 1
          };
        }
        return r;
      })
    );
  };

  const handleAskCopilot = async (q: string): Promise<AIRiskCopilotResponse> => {
    const qLower = q.toLowerCase();
    const outside = risksList.filter(r => r.isOutsideAppetite);
    const topRisks = [...risksList].sort((a, b) => b.residualRiskScore - a.residualRiskScore).slice(0, 3);
    const totalAle = risksList.reduce((acc, r) => acc + (r.quantitativeAnalysis?.annualLossExpectancyUSD || 0), 0);
    const totalSle = risksList.reduce((acc, r) => acc + (r.quantitativeAnalysis?.singleLossExpectancyUSD || 0), 0);

    let answer = `### Enterprise Risk Briefing\nAnalyzed ${risksList.length} active enterprise risks with ${summaryKPIs.averageControlEffectivenessPercent}% average control effectiveness.`;
    let provenance: any = 'DIRECT_SOURCE';

    if (qLower.includes('appetite') || qLower.includes('top risk')) {
      answer = `### Top Risk Drivers & Appetite Breaches\n\nThere are currently **${outside.length} risk(s)** exceeding approved Board appetite limits:\n` +
        outside.map(r => `- **[${r.riskCode}] ${r.title}**: Current Residual Score ${r.residualRiskScore} vs Appetite Limit ${r.riskAppetiteScore} (Assigned to ${r.riskOwner})`).join('\n') +
        `\n\n**Top Prioritized Risk:** [${topRisks[0].riskCode}] ${topRisks[0].title} with inherent score ${topRisks[0].inherentRiskScore}/25.`;
    } else if (qLower.includes('financial') || qLower.includes('ale') || qLower.includes('loss')) {
      provenance = 'SOURCE_DERIVED';
      answer = `### Quantitative Cyber Loss Summary\n- **Total Assessed Single Loss Exposure (SLE):** $${(totalSle / 1000000).toFixed(1)}M USD\n- **Total Annualized Loss Expectancy (ALE):** $${(totalAle / 1000).toFixed(0)}K USD/Year\n- **Highest Loss Scenario:** [RSK-CYBER-001] Cloud Infrastructure Ransomware with estimated maximum loss of $7,500,000 USD.`;
    }

    return {
      queryId: `COPILOT-${Date.now()}`,
      question: q,
      answerMarkdown: answer,
      provenance,
      referencedRiskIds: topRisks.map(r => r.id),
      referencedControlIds: Array.from(new Set(topRisks.flatMap(r => r.controlIds))),
      referencedEvidenceIds: Array.from(new Set(topRisks.flatMap(r => r.evidenceIds))),
      supportingAssumptions: ['Qualitative 5x5 matrix evaluated', 'Beta-PERT Monte Carlo distribution'],
      confidenceScore: 94,
      limitationsDisclosed: ['Live telemetry evaluated from active integration fabric connector feeds.'],
      suggestedFollowUps: ['What remediation is planned for the top risk?', 'Show me the business services with highest exposure.'],
      generatedAt: new Date().toISOString()
    };
  };

  const tabs: WorkspaceTab[] = [
    { id: 'command_center', label: 'Risk Command Centre', icon: LayoutDashboard },
    { id: 'decision_queue', label: 'Executive Decision Queue', icon: AlertOctagon, badge: `${decisionItems.length} Actions` },
    { id: 'register', label: 'Enterprise Risk Register', icon: Flame, badge: risksList.length },
    { id: 'quantitative', label: 'Quantitative FAIR Simulator', icon: DollarSign, badge: 'Monte Carlo' },
    { id: 'appetite', label: 'Risk Appetite & Tolerance', icon: Award, badge: summaryKPIs.outsideAppetiteCount > 0 ? `${summaryKPIs.outsideAppetiteCount} Breaches` : 'Nominal' },
    { id: 'treatment_ledger', label: 'Treatment Retest Ledger', icon: SlidersHorizontal, badge: `${treatmentVerifications.length} Verified` },
    { id: 'connectors', label: 'Live Integration Assurance', icon: Cpu, badge: '10-Tier' },
    { id: 'heatmap', label: 'D3.js Matrix & Heatmap', icon: Grid, badge: '5x5' },
    { id: 'treatment', label: 'Treatment Simulator', icon: SlidersHorizontal, badge: 'What-If' },
    { id: 'exceptions', label: 'Security Exceptions & Waivers', icon: FileCheck2 },
    { id: 'telemetry', label: 'Continuous Telemetry Stream', icon: Activity, badge: 'Live' },
    { id: 'copilot', label: 'AI Risk Copilot', icon: Sparkles, badge: 'Grounded' }
  ];

  const stats: WorkspaceStat[] = [
    { label: 'Active Enterprise Risks', value: risksList.length },
    { label: 'Pending Executive Decisions', value: decisionItems.length },
    { label: 'Appetite Breaches', value: summaryKPIs.outsideAppetiteCount > 0 ? `${summaryKPIs.outsideAppetiteCount} Breached` : '0 Nominal' },
    { label: 'Avg Control Effectiveness', value: `${summaryKPIs.averageControlEffectivenessPercent}%` }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'command_center':
        return (
          <EnterpriseRiskCommandCenter
            summary={summaryKPIs}
            onSelectRisk={(r) => setExplainRisk({ risk: r, tab: 'why' })}
            onOpenExplainability={(r, tab) => setExplainRisk({ risk: r, tab })}
            onNavigateTab={setActiveTab}
          />
        );
      case 'decision_queue':
        return (
          <ExecutiveDecisionQueueView
            decisionItems={decisionItems}
            onSelectDecision={(d) => setActiveTab('appetite')}
            onNavigateTab={setActiveTab}
          />
        );
      case 'register':
        return (
          <EnterpriseRiskRegisterView
            risks={risksList}
            onSelectRisk={(r) => setExplainRisk({ risk: r, tab: 'why' })}
            onOpenExplainability={(r, tab) => setExplainRisk({ risk: r, tab })}
            onCreateRiskModal={() => setShowCreateModal(true)}
          />
        );
      case 'quantitative':
        return <QuantitativeRiskSimulatorView risks={risksList} />;
      case 'appetite':
        return (
          <RiskAppetiteStudioView
            risks={risksList}
            thresholds={MASTER_APPETITE_THRESHOLDS}
            onAcceptRisk={handleAcceptRisk}
          />
        );
      case 'treatment_ledger':
        return <TreatmentAssuranceLedgerView verifications={treatmentVerifications} />;
      case 'connectors':
        return <LiveConnectorMaturityView connectors={connectorMaturity} />;
      case 'heatmap':
        return <RiskMapModule />;
      case 'treatment':
        return <RiskTreatmentSimulatorModule />;
      case 'exceptions':
        return <SecurityExceptionsModule />;
      case 'telemetry':
        return (
          <LiveTelemetryFeed
            risks={canonicalGrcRisks || []}
            onSelectRisk={(r) => {
              const enterpriseMatch = risksList.find((er) => er.riskCode === r.riskCode || er.id === r.id);
              if (enterpriseMatch) setExplainRisk({ risk: enterpriseMatch, tab: 'why' });
            }}
          />
        );
      case 'copilot':
        return <AIRiskIntelligenceCopilotView onAskCopilot={handleAskCopilot} />;
      default:
        return (
          <EnterpriseRiskCommandCenter
            summary={summaryKPIs}
            onSelectRisk={(r) => setExplainRisk({ risk: r, tab: 'why' })}
            onOpenExplainability={(r, tab) => setExplainRisk({ risk: r, tab })}
            onNavigateTab={setActiveTab}
          />
        );
    }
  };

  return (
    <WorkspaceLayout
      title="Enterprise Risk Intelligence & Continuous Risk Assurance OS"
      subtitle="Comprehensive enterprise risk operations. Calibrate inherent and residual risk, simulate FAIR quantitative loss distributions, enforce board risk appetite, track continuous telemetry, and explain every risk conclusion."
      icon={Flame}
      iconColor="text-rose-600 dark:text-rose-400"
      stats={stats}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {renderContent()}

      {/* EXPLAINABILITY MODAL */}
      {explainRisk && (
        <RiskExplainabilityModal
          risk={explainRisk.risk}
          initialTab={explainRisk.tab}
          onClose={() => setExplainRisk(null)}
        />
      )}

      {/* RISK CREATION MODAL */}
      {showCreateModal && (
        <EnterpriseRiskCreateModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateRisk}
        />
      )}
    </WorkspaceLayout>
  );
};
export default RiskWorkspace;
