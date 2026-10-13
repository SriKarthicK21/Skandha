import React, { useState, useMemo } from 'react';
import { useGRC } from '../../context/GRCContext';
import { PageContainer } from '../layout/PageContainer';
import { useToast } from '../common/ToastContainer';
import {
  Activity,
  Layers,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Server,
  Flame,
  FileCheck2,
  FolderCheck,
  Wrench,
  Award,
  Search,
  Filter,
  RefreshCw,
  Zap,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  Lock,
  Download,
  Clock,
  Sparkles,
  Info,
  Radio,
  FileText,
  SlidersHorizontal,
  Check,
  AlertOctagon,
  Eye,
  GitCommit,
  Hash,
  Database,
  Shield
} from 'lucide-react';
import { useEnterpriseRealTime } from '../../services/telemetry/enterpriseRealTimeService';
import { AssetRecord, ControlItem, RiskRecord, EvidenceRecord, FindingCAPARecord, ManagementReviewRecord } from '../../types';

export interface UnifiedLineageNode {
  id: string;
  controlCode: string;
  controlTitle: string;
  domain: string;
  framework: 'ISO/IEC 27001:2022' | 'MAS TRM' | 'ISO 42001:2023' | 'SOC 2';
  
  // 1. Linked Asset
  asset: {
    id: string;
    name: string;
    type: string;
    criticality: 'Critical' | 'High' | 'Medium' | 'Low';
    owner: string;
  };

  // 2. Linked Risk
  risk: {
    id: string;
    code: string;
    title: string;
    inherentScore: number;
    residualScore: number;
    status: string;
    treatment: string;
  };

  // 3. Control Effectiveness
  control: {
    implementationStatus: string;
    applicable: boolean;
    maturityLevel: number;
    owner: string;
    justification: string;
  };

  // 4. Automated Live Telemetry Test
  telemetry: {
    testId: string;
    testName: string;
    provider: 'AWS' | 'Okta' | 'GitHub' | 'CrowdStrike' | 'Cloudflare' | 'Datadog' | 'Manual';
    status: 'PASS' | 'FAIL' | 'DRIFT_WARNING' | 'NOT_CONFIGURED';
    lastHeartbeat: string;
    metricValue: string;
    threshold: string;
  };

  // 5. Verified Evidence
  evidence: {
    id: string;
    title: string;
    status: 'Verified' | 'Pending Review' | 'Expired' | 'Missing';
    sha256Hash: string;
    uploadedDate: string;
    freshnessDaysRemaining: number;
  };

  // 6. Audit Finding / CAPA
  finding: {
    id?: string;
    findingCode?: string;
    severity?: string;
    status?: string;
    hasActiveNC: boolean;
    capaTitle?: string;
  };

  // 7. Management Review
  mgmtReview: {
    reviewed: boolean;
    reviewDate: string;
    decision: string;
    chairPerson: string;
  };

  // Overall Computed Health
  overallHealth: 'CONFORMING' | 'DRIFT' | 'DEFICIENT' | 'EVIDENCE_GAP';
}

export const EnterpriseRealTimeControlGraph: React.FC = () => {
  const {
    currentTenant,
    risks,
    assets,
    evidence,
    findings,
    managementReviews,
    setActiveModule,
    updateRisk,
    addFinding,
    currentUser,
    logAuditEvent
  } = useGRC();

  const { showToast } = useToast();
  const { stats: telemetryStats, simulateEvent } = useEnterpriseRealTime();

  // View mode & filters
  const [viewMode, setViewMode] = useState<'graph' | 'matrix'>('graph');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFramework, setSelectedFramework] = useState<string>('ALL');
  const [selectedHealth, setSelectedHealth] = useState<string>('ALL');
  const [selectedCriticality, setSelectedCriticality] = useState<string>('ALL');

  // Selected lineage node for drawer inspection
  const [selectedNode, setSelectedNode] = useState<UnifiedLineageNode | null>(null);

  // Live simulation states
  const [isSimulatingDegradation, setIsSimulatingDegradation] = useState(false);
  const [simulatedOverriddenNodeId, setSimulatedOverriddenNodeId] = useState<string | null>(null);

  // Derive Unified Lineage Graph from active tenant data
  const lineageNodes = useMemo<UnifiedLineageNode[]>(() => {
    const tenantControls: ControlItem[] = currentTenant?.controls || [];
    const tenantRisks: RiskRecord[] = risks.filter(r => r.tenantId === currentTenant?.id);
    const tenantAssets: any[] = assets.filter((a: any) => a.tenantId === currentTenant?.id);
    const tenantEvidence: EvidenceRecord[] = evidence.filter(e => e.tenantId === currentTenant?.id);
    const tenantFindings: FindingCAPARecord[] = findings.filter(f => f.tenantId === currentTenant?.id);
    const latestMgmtReview = managementReviews.find(m => m.tenantId === currentTenant?.id && (m.status === 'Signed Off' || m.status === 'Minutes Approved')) || managementReviews[0];

    // Build rich lineage for priority controls
    const nodes: UnifiedLineageNode[] = tenantControls.slice(0, 32).map((ctrl, idx) => {
      // 1. Resolve or map asset
      const linkedAsset = tenantAssets[idx % Math.max(tenantAssets.length, 1)] || {
        id: `ast-${idx}`,
        name: idx % 3 === 0 ? 'Production Cloud VPC (AWS ap-southeast-1)' : idx % 3 === 1 ? 'Customer Core Transaction DB (PostgreSQL)' : 'Developer Workstations & CI/CD Runners',
        type: idx % 3 === 0 ? 'Infrastructure' : idx % 3 === 1 ? 'Data Repository' : 'Application',
        criticality: idx % 2 === 0 ? 'Critical' : 'High',
        owner: 'DevOps & SRE Lead'
      };

      // 2. Resolve or map risk
      const linkedRisk = tenantRisks.find(r => 
        r.frameworkMappings?.iso27001Controls?.includes(ctrl.controlCode) ||
        r.mitigationControl?.includes(ctrl.controlCode)
      ) || tenantRisks[idx % Math.max(tenantRisks.length, 1)] || {
        id: `rsk-${idx}`,
        riskCode: `RSK-00${(idx % 8) + 1}`,
        title: `Unauthorized access or data breach impacting ${linkedAsset.name}`,
        inherentScore: 16,
        residualScore: 6,
        status: 'Residual Monitored',
        treatmentOption: 'Mitigate'
      };

      // 3. Resolve or map evidence
      const linkedEvd = tenantEvidence.find(e => e.controlCode === ctrl.controlCode) || {
        id: `evd-${ctrl.controlCode}`,
        title: `${ctrl.title} - Verification Artifact`,
        status: idx % 7 === 0 ? 'Expired' : idx % 5 === 0 ? 'Pending Review' : 'Verified',
        sha256Hash: `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b8${idx.toString(16).padStart(2, '0')}`,
        uploadedDate: '2026-08-15',
        freshnessDaysRemaining: idx % 7 === 0 ? -4 : 84 - (idx * 2)
      };

      // 4. Resolve or map finding
      const linkedFinding = tenantFindings.find(f => 
        f.clauseOrControl === ctrl.controlCode && f.status !== 'Closed Verified'
      );

      // 5. Automated test telemetry binding
      let telemetryProvider: 'AWS' | 'Okta' | 'GitHub' | 'CrowdStrike' | 'Cloudflare' | 'Datadog' | 'Manual' = 'AWS';
      let testName = `Automated Compliance Probe: ${ctrl.controlCode}`;
      let testStatus: 'PASS' | 'FAIL' | 'DRIFT_WARNING' | 'NOT_CONFIGURED' = 'PASS';
      let metricValue = '100% compliant';
      let threshold = '>= 99.5%';

      if (ctrl.controlCode.includes('5.15') || ctrl.controlCode.includes('5.17')) {
        telemetryProvider = 'Okta';
        testName = 'Okta Adaptive MFA & FIDO2 Enforcement';
        metricValue = '100% of privileged roles enforced';
        threshold = '100%';
      } else if (ctrl.controlCode.includes('8.28') || ctrl.controlCode.includes('8.25')) {
        telemetryProvider = 'GitHub';
        testName = 'GitHub Actions SAST & Secret Protection Gate';
        metricValue = '0 Critical CVEs in main';
        threshold = '0 Critical';
      } else if (ctrl.controlCode.includes('8.20') || ctrl.controlCode.includes('8.21')) {
        telemetryProvider = 'Cloudflare';
        testName = 'Cloudflare WAF Zero-Day DDoS Mitigation';
        metricValue = '99.98% clean traffic';
        threshold = '>= 99.9%';
      } else if (ctrl.controlCode.includes('8.7') || ctrl.controlCode.includes('8.16')) {
        telemetryProvider = 'CrowdStrike';
        testName = 'Falcon EDR Endpoint Health & Sensor Uptime';
        metricValue = '99.8% sensor coverage';
        threshold = '>= 99.0%';
      }

      // Check simulated override
      if (simulatedOverriddenNodeId === ctrl.id) {
        testStatus = 'FAIL';
        metricValue = 'DRIFT DETECTED: 1 critical nonconformity';
      } else if (linkedFinding) {
        testStatus = 'DRIFT_WARNING';
      } else if (linkedEvd.status === 'Expired') {
        testStatus = 'DRIFT_WARNING';
      }

      // 6. Overall computed health
      let overallHealth: 'CONFORMING' | 'DRIFT' | 'DEFICIENT' | 'EVIDENCE_GAP' = 'CONFORMING';
      if (testStatus === 'FAIL' || (linkedFinding && linkedFinding.severity === 'Major Non-Conformity')) {
        overallHealth = 'DEFICIENT';
      } else if (testStatus === 'DRIFT_WARNING' || (linkedFinding && linkedFinding.severity === 'Minor Non-Conformity')) {
        overallHealth = 'DRIFT';
      } else if (linkedEvd.status === 'Expired' || linkedEvd.status === 'Requires Update' || linkedEvd.status === 'Draft') {
        overallHealth = 'EVIDENCE_GAP';
      }

      const frameworkName = ctrl.framework?.includes('MAS') ? 'MAS TRM' : 
                            ctrl.framework?.includes('42001') ? 'ISO 42001:2023' : 
                            ctrl.framework?.includes('SOC') ? 'SOC 2' : 'ISO/IEC 27001:2022';

      return {
        id: ctrl.id,
        controlCode: ctrl.controlCode,
        controlTitle: ctrl.title,
        domain: ctrl.category || 'Technological Controls',
        framework: frameworkName as any,
        asset: {
          id: (linkedAsset as any).id,
          name: (linkedAsset as any).name,
          type: (linkedAsset as any).type,
          criticality: (linkedAsset as any).criticality || 'Critical',
          owner: (linkedAsset as any).owner || 'IT Operations'
        },
        risk: {
          id: (linkedRisk as any).id,
          code: (linkedRisk as any).riskCode,
          title: (linkedRisk as any).title,
          inherentScore: (linkedRisk as any).inherentScore,
          residualScore: simulatedOverriddenNodeId === ctrl.id ? 15 : (linkedRisk as any).residualScore,
          status: simulatedOverriddenNodeId === ctrl.id ? 'Elevated Critical' : (linkedRisk as any).status,
          treatment: (linkedRisk as any).treatmentOption || 'Mitigate'
        },
        control: {
          implementationStatus: simulatedOverriddenNodeId === ctrl.id ? 'Degraded / Deficient' : ctrl.implementationStatus,
          applicable: ctrl.applicable,
          maturityLevel: ctrl.maturityLevel || 4,
          owner: ctrl.responsibleDepartment || 'Information Security',
          justification: ctrl.justification || 'Mandatory standard baseline requirement'
        },
        telemetry: {
          testId: `act-${ctrl.controlCode}`,
          testName,
          provider: telemetryProvider,
          status: testStatus,
          lastHeartbeat: '2 minutes ago',
          metricValue,
          threshold
        },
        evidence: {
          id: linkedEvd.id,
          title: linkedEvd.title,
          status: linkedEvd.status as any,
          sha256Hash: linkedEvd.sha256Hash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          uploadedDate: linkedEvd.uploadedDate || '2026-09-01',
          freshnessDaysRemaining: (linkedEvd as any).freshnessDaysRemaining ?? 45
        },
        finding: {
          id: linkedFinding?.id,
          findingCode: linkedFinding?.findingCode,
          severity: linkedFinding?.severity,
          status: linkedFinding?.status,
          hasActiveNC: Boolean(linkedFinding) || simulatedOverriddenNodeId === ctrl.id,
          capaTitle: linkedFinding?.title || (simulatedOverriddenNodeId === ctrl.id ? 'Auto-Triggered CAPA: Immediate Control Drift Remediation' : undefined)
        },
        mgmtReview: {
          reviewed: true,
          reviewDate: latestMgmtReview?.meetingDate || '2026-08-30',
          decision: 'Suitable, Adequate & Operating Effectively',
          chairPerson: latestMgmtReview?.chairPerson || 'Marcus Vance (CEO)'
        },
        overallHealth
      };
    });

    return nodes;
  }, [currentTenant, risks, assets, evidence, findings, managementReviews, simulatedOverriddenNodeId]);

  // Filtered nodes
  const filteredNodes = useMemo(() => {
    return lineageNodes.filter(node => {
      // Framework filter
      if (selectedFramework !== 'ALL' && node.framework !== selectedFramework) {
        return false;
      }
      // Health filter
      if (selectedHealth !== 'ALL' && node.overallHealth !== selectedHealth) {
        return false;
      }
      // Criticality filter
      if (selectedCriticality !== 'ALL' && node.asset.criticality !== selectedCriticality) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matches =
          node.controlCode.toLowerCase().includes(query) ||
          node.controlTitle.toLowerCase().includes(query) ||
          node.asset.name.toLowerCase().includes(query) ||
          node.risk.code.toLowerCase().includes(query) ||
          node.risk.title.toLowerCase().includes(query) ||
          node.telemetry.provider.toLowerCase().includes(query);
        if (!matches) return false;
      }
      return true;
    });
  }, [lineageNodes, selectedFramework, selectedHealth, selectedCriticality, searchQuery]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const total = lineageNodes.length;
    const conforming = lineageNodes.filter(n => n.overallHealth === 'CONFORMING').length;
    const drift = lineageNodes.filter(n => n.overallHealth === 'DRIFT').length;
    const deficient = lineageNodes.filter(n => n.overallHealth === 'DEFICIENT').length;
    const evidenceGap = lineageNodes.filter(n => n.overallHealth === 'EVIDENCE_GAP').length;
    const automatedCoveragePct = Math.round((lineageNodes.filter(n => n.telemetry.status !== 'NOT_CONFIGURED').length / Math.max(total, 1)) * 100);

    return {
      total,
      conforming,
      drift,
      deficient,
      evidenceGap,
      automatedCoveragePct
    };
  }, [lineageNodes]);

  // Handler: Simulate Control Degradation
  const handleSimulateControlDrift = async (node: UnifiedLineageNode) => {
    setIsSimulatingDegradation(true);
    setSimulatedOverriddenNodeId(node.id);
    setSelectedNode(node);

    // Trigger telemetry event
    simulateEvent({
      source: node.telemetry.provider === 'AWS' ? 'AWS Security Hub' : 'Okta Identity',
      eventType: 'ControlEffectivenessDegraded',
      severity: 'CRITICAL',
      summary: `Automated test probe failed for ${node.controlCode} (${node.controlTitle}) on asset ${node.asset.name}.`,
      isoMapping: node.controlCode,
      masMapping: 'Sec 10.0 IT Security Operations'
    });

    // Auto-generate a real-time finding & CAPA
    addFinding({
      source: 'CONTINUOUS_MONITORING',
      severity: 'Major Non-Conformity',
      title: `Automated Telemetry Drift: ${node.controlCode} on ${node.asset.name}`,
      clauseOrControl: node.controlCode,
      department: node.control.owner,
      description: `Continuous automated control test ${node.telemetry.testName} detected threshold breach. Observed metric: ${node.telemetry.metricValue}. SLA breached on ${new Date().toISOString()}.`,
      rootCauseAnalysis: {
        methodology: '5_WHYS',
        rootCauseStatement: 'Configuration drift occurred outside automated IaC pipeline without change approval gate.',
        fiveWhysChain: [
          { whyNumber: 1, question: 'Why did the automated control test fail?', answer: 'Unencrypted storage bucket / disabled MFA was detected by cloud probe.' },
          { whyNumber: 2, question: 'Why was this configuration applied?', answer: 'An emergency hotfix was applied out-of-band during an incident.' },
          { whyNumber: 3, question: 'Why was it not caught before deployment?', answer: 'Pipeline security gate was bypassed with emergency override token.' },
          { whyNumber: 4, question: 'Why was the override not automatically revoked within 2 hours?', answer: 'Automated revocation webhook had an unhandled timeout error.' },
          { whyNumber: 5, question: 'What is the root cause?', answer: 'Lack of automated reconciliation watchdog verifying hotfix rollback.' }
        ],
        analyzedBy: 'Skanda Real-Time Telemetry Engine',
        analyzedDate: new Date().toISOString()
      },
      capaPlan: {
        correctiveAction: `Rollback configuration drift on ${node.asset.name} and execute emergency compliance remediation.`,
        preventiveAction: 'Deploy automated reconciliation webhook watchdog to enforce auto-revocation.',
        owner: 'Lead Security Engineer',
        targetDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        evidenceRequired: 'Clean telemetry probe hash and PR change approval audit record.',
        implementationStatus: 'In Progress'
      },
      status: 'Open'
    });

    await logAuditEvent(
      'UPDATE',
      'Automated Control Testing',
      `Simulated live telemetry failure for ${node.controlCode}. Auto-generated CAPA finding. Residual risk escalated.`
    );

    showToast({
      type: 'error',
      title: 'Telemetry Drift Detected!',
      message: `Control ${node.controlCode} degraded. Residual risk escalated from ${node.risk.residualScore} to 15. CAPA nonconformity auto-generated.`
    });

    setIsSimulatingDegradation(false);
  };

  // Handler: Self-Heal / Reset Simulated Control
  const handleHealControl = (nodeId: string) => {
    setSimulatedOverriddenNodeId(null);
    showToast({
      type: 'success',
      title: 'Control Self-Healed',
      message: 'Telemetry probe restored to PASS. Residual risk normalized and proof logged.'
    });
  };

  // Handler: Export ISO 19011 End-to-End Traceability Dossier
  const handleExportDossier = () => {
    const reportPayload = {
      tenantName: currentTenant?.name || 'Enterprise Client',
      reportTitle: 'ISO 19011:2018 & Clause 7.5.3 Continuous Lineage Traceability Dossier',
      generatedAt: new Date().toISOString(),
      generatedBy: `${currentUser.name} (${currentUser.role})`,
      auditStandard: 'ISO/IEC 27001:2022 & MAS TRM Guidelines',
      metrics,
      traceabilityMatrix: filteredNodes.map(n => ({
        controlCode: n.controlCode,
        controlTitle: n.controlTitle,
        asset: `${n.asset.name} (${n.asset.criticality})`,
        riskCode: n.risk.code,
        inherentScore: n.risk.inherentScore,
        residualScore: n.risk.residualScore,
        telemetryTest: n.telemetry.testName,
        telemetryStatus: n.telemetry.status,
        evidenceHash: n.evidence.sha256Hash,
        evidenceStatus: n.evidence.status,
        capaFinding: n.finding.hasActiveNC ? `${n.finding.findingCode} (${n.finding.severity})` : 'None — Conforming',
        mgmtReviewRatified: n.mgmtReview.reviewed ? `Yes (${n.mgmtReview.reviewDate})` : 'Pending'
      }))
    };

    const dataBlob = new Blob([JSON.stringify(reportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SKANDA-ISO19011-Traceability-Dossier-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    showToast({
      type: 'success',
      title: 'Dossier Exported',
      message: 'Cryptographic Lineage Dossier downloaded successfully.'
    });
  };

  return (
    <PageContainer id="enterprise-realtime-control-graph">
      <div className="space-y-6">
        {/* Module Title Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-sky-950/40 border border-slate-800 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0 mt-0.5 shadow-inner">
                <Layers className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400 px-2.5 py-0.5 rounded-full bg-sky-950/80 border border-sky-700/50">
                    CACM Provenance Engine
                  </span>
                  <span className="text-[11px] font-mono text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-700/50">
                    ISO 19011:2018 & Clause 7.5.3
                  </span>
                  <span className="text-[11px] font-mono text-purple-400 px-2.5 py-0.5 rounded-full bg-purple-950/80 border border-purple-700/50">
                    7-Hop Full Lineage
                  </span>
                </div>
                <h1 className="text-2xl font-black text-white tracking-tight">
                  Enterprise Real-Time Control & Entity Lineage Graph
                </h1>
                <p className="text-xs text-slate-400 max-w-3xl mt-1 leading-relaxed">
                  Unified 7-dimensional continuous traceability: Asset ↔ Threat & Risk ↔ Control Baseline ↔ Automated Telemetry (ACT) ↔ Cryptographic Evidence ↔ Dynamic CAPA ↔ Management Review.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 shrink-0">
              <button
                onClick={handleExportDossier}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-lg shadow-sky-600/30 transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Export Audit Dossier</span>
              </button>
            </div>
          </div>
        </div>
        {/* Top Executive Health & Telemetry Metrics Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Total Monitored Controls */}
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>Total Controls</span>
              <Layers className="w-4 h-4 text-sky-400" />
            </div>
            <div className="mt-2 text-2xl font-black text-white font-mono">{metrics.total}</div>
            <div className="mt-1 text-[11px] text-slate-500">Continuous scope</div>
          </div>

          {/* Conforming Controls */}
          <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-800/40 shadow-sm">
            <div className="flex items-center justify-between text-xs text-emerald-300 font-medium">
              <span>Conforming</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-2 text-2xl font-black text-emerald-400 font-mono">{metrics.conforming}</div>
            <div className="mt-1 text-[11px] text-emerald-500/90 font-mono">100% verified</div>
          </div>

          {/* Drift Detected */}
          <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-800/40 shadow-sm">
            <div className="flex items-center justify-between text-xs text-amber-300 font-medium">
              <span>Drift Warning</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-2 text-2xl font-black text-amber-400 font-mono">{metrics.drift}</div>
            <div className="mt-1 text-[11px] text-amber-500/90">Grace period active</div>
          </div>

          {/* Deficient / Critical */}
          <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-800/40 shadow-sm">
            <div className="flex items-center justify-between text-xs text-rose-300 font-medium">
              <span>Deficient / NC</span>
              <XCircle className="w-4 h-4 text-rose-400" />
            </div>
            <div className="mt-2 text-2xl font-black text-rose-400 font-mono">{metrics.deficient}</div>
            <div className="mt-1 text-[11px] text-rose-500/90">CAPA required</div>
          </div>

          {/* Evidence Decay / Gaps */}
          <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-800/40 shadow-sm">
            <div className="flex items-center justify-between text-xs text-purple-300 font-medium">
              <span>Evidence Gaps</span>
              <FolderCheck className="w-4 h-4 text-purple-400" />
            </div>
            <div className="mt-2 text-2xl font-black text-purple-400 font-mono">{metrics.evidenceGap}</div>
            <div className="mt-1 text-[11px] text-purple-500/90">Expired/stale evidence</div>
          </div>

          {/* Automated Control Testing (ACT) Coverage */}
          <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-800/40 shadow-sm">
            <div className="flex items-center justify-between text-xs text-indigo-300 font-medium">
              <span>ACT Coverage</span>
              <Radio className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="mt-2 text-2xl font-black text-indigo-400 font-mono">{metrics.automatedCoveragePct}%</div>
            <div className="mt-1 text-[11px] text-indigo-400/80">Live automated probes</div>
          </div>
        </div>

        {/* Toolbar: View Mode, Framework Selector, Search, and Action Buttons */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm">
          {/* Left: Search input */}
          <div className="relative flex-1 min-w-[260px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search control code, title, asset name, or risk code..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
            />
          </div>

          {/* Center: Dropdown Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Framework Filter */}
            <select
              value={selectedFramework}
              onChange={e => setSelectedFramework(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-medium focus:outline-none focus:border-sky-500 transition cursor-pointer"
            >
              <option value="ALL">All Frameworks</option>
              <option value="ISO/IEC 27001:2022">ISO/IEC 27001:2022</option>
              <option value="MAS TRM">MAS TRM Guidelines</option>
              <option value="ISO 42001:2023">ISO 42001:2023</option>
              <option value="SOC 2">SOC 2 Type II</option>
            </select>

            {/* Health Status Filter */}
            <select
              value={selectedHealth}
              onChange={e => setSelectedHealth(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-medium focus:outline-none focus:border-sky-500 transition cursor-pointer"
            >
              <option value="ALL">All Health States</option>
              <option value="CONFORMING">Conforming Only (Green)</option>
              <option value="DRIFT">Drift Warnings (Amber)</option>
              <option value="DEFICIENT">Deficient / NC (Red)</option>
              <option value="EVIDENCE_GAP">Evidence Gaps (Purple)</option>
            </select>

            {/* Asset Criticality */}
            <select
              value={selectedCriticality}
              onChange={e => setSelectedCriticality(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-medium focus:outline-none focus:border-sky-500 transition cursor-pointer"
            >
              <option value="ALL">All Asset Criticalities</option>
              <option value="Critical">Critical Assets Only</option>
              <option value="High">High Assets Only</option>
              <option value="Medium">Medium Assets Only</option>
            </select>
          </div>

          {/* Right: View Switcher & Export */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setViewMode('graph')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                  viewMode === 'graph' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Interactive Flow Lineage Graph"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Lineage Flow</span>
              </button>
              <button
                onClick={() => setViewMode('matrix')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                  viewMode === 'matrix' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Dense Auditor Traceability Matrix"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Auditor Matrix</span>
              </button>
            </div>

            <button
              onClick={handleExportDossier}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer border border-slate-700 shadow-xs"
              title="Export Cryptographic Traceability Dossier for Certification Auditor"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export Dossier</span>
            </button>
          </div>
        </div>

        {/* VIEW MODE 1: INTERACTIVE LINEAGE FLOW PIPELINE */}
        {viewMode === 'graph' && (
          <div className="space-y-4">
            {/* Legend Banner */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center space-x-4">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">7-Hop Provenance Pipeline:</span>
                <span className="flex items-center gap-1 text-slate-300"><Server className="w-3 h-3 text-sky-400" /> 1. Asset</span>
                <ArrowRight className="w-3 h-3 text-slate-600" />
                <span className="flex items-center gap-1 text-slate-300"><Flame className="w-3 h-3 text-rose-400" /> 2. Risk</span>
                <ArrowRight className="w-3 h-3 text-slate-600" />
                <span className="flex items-center gap-1 text-slate-300"><ShieldCheck className="w-3 h-3 text-emerald-400" /> 3. Control</span>
                <ArrowRight className="w-3 h-3 text-slate-600" />
                <span className="flex items-center gap-1 text-slate-300"><Radio className="w-3 h-3 text-indigo-400" /> 4. ACT Test</span>
                <ArrowRight className="w-3 h-3 text-slate-600" />
                <span className="flex items-center gap-1 text-slate-300"><FileCheck2 className="w-3 h-3 text-purple-400" /> 5. Evidence</span>
                <ArrowRight className="w-3 h-3 text-slate-600" />
                <span className="flex items-center gap-1 text-slate-300"><Wrench className="w-3 h-3 text-amber-400" /> 6. CAPA</span>
                <ArrowRight className="w-3 h-3 text-slate-600" />
                <span className="flex items-center gap-1 text-slate-300"><Award className="w-3 h-3 text-teal-400" /> 7. Mgmt Review</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                Showing {filteredNodes.length} of {lineageNodes.length} lineage chains
              </div>
            </div>

            {/* Lineage Cards Grid */}
            <div className="grid grid-cols-1 gap-4">
              {filteredNodes.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400">
                  <ShieldAlert className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                  <p className="text-sm font-bold text-white">No matching entity lineage paths found</p>
                  <p className="text-xs mt-1">Try adjusting your framework, health status, or search filters.</p>
                </div>
              ) : (
                filteredNodes.map(node => {
                  const isOverridden = simulatedOverriddenNodeId === node.id;
                  const healthColor = 
                    node.overallHealth === 'DEFICIENT' ? 'border-rose-700/60 bg-rose-950/20' :
                    node.overallHealth === 'DRIFT' ? 'border-amber-700/60 bg-amber-950/20' :
                    node.overallHealth === 'EVIDENCE_GAP' ? 'border-purple-700/60 bg-purple-950/20' :
                    'border-slate-800 bg-slate-900';

                  return (
                    <div
                      key={node.id}
                      className={`p-4 rounded-2xl border transition-all duration-200 hover:border-slate-700 ${healthColor} shadow-sm space-y-4`}
                    >
                      {/* Card Header: Control Code, Title, Framework, Health Badge, and Simulation Actions */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                        <div className="flex items-center space-x-2">
                          <span className="px-2.5 py-1 rounded-lg bg-sky-950 border border-sky-800 text-sky-300 font-mono font-bold text-xs">
                            {node.controlCode}
                          </span>
                          <span className="font-bold text-white text-sm">
                            {node.controlTitle}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                            {node.framework}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          {/* Health status badge */}
                          {node.overallHealth === 'CONFORMING' && (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              Conforming
                            </span>
                          )}
                          {node.overallHealth === 'DRIFT' && (
                            <span className="px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-bold flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-amber-400" />
                              Drift Warning
                            </span>
                          )}
                          {node.overallHealth === 'DEFICIENT' && (
                            <span className="px-2.5 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[11px] font-bold flex items-center gap-1">
                              <XCircle className="w-3 h-3 text-rose-400" />
                              Deficient / NC
                            </span>
                          )}
                          {node.overallHealth === 'EVIDENCE_GAP' && (
                            <span className="px-2.5 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-[11px] font-bold flex items-center gap-1">
                              <FolderCheck className="w-3 h-3 text-purple-400" />
                              Evidence Expired
                            </span>
                          )}

                          {/* Simulation buttons */}
                          {isOverridden ? (
                            <button
                              onClick={() => handleHealControl(node.id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs transition flex items-center space-x-1 cursor-pointer shadow-xs"
                              title="Restore telemetry and close simulated finding"
                            >
                              <RefreshCw className="w-3 h-3 animate-spin" />
                              <span>Self-Heal Control</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSimulateControlDrift(node)}
                              disabled={isSimulatingDegradation}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-rose-950 hover:text-rose-300 hover:border-rose-700 border border-slate-700 text-slate-300 font-bold text-xs transition flex items-center space-x-1 cursor-pointer shadow-xs"
                              title="Simulate live telemetry failure and watch automated CAPA trigger"
                            >
                              <Zap className="w-3 h-3 text-amber-400" />
                              <span>Simulate Drift</span>
                            </button>
                          )}

                          {/* Inspect Drawer Button */}
                          <button
                            onClick={() => setSelectedNode(node)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition flex items-center space-x-1 cursor-pointer border border-slate-700"
                            title="Inspect 7-hop cryptographic provenance details"
                          >
                            <Eye className="w-3 h-3 text-sky-400" />
                            <span>Inspect</span>
                          </button>
                        </div>
                      </div>

                      {/* 7-Hop Interactive Pipeline Flow Nodes */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-2 text-xs">
                        {/* 1. Asset Node */}
                        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase">
                            <span className="flex items-center gap-1">
                              <Server className="w-2.5 h-2.5 text-sky-400" />
                              Asset
                            </span>
                            <span className={`px-1 rounded text-[9px] ${
                              node.asset.criticality === 'Critical' ? 'bg-rose-500/20 text-rose-300 font-bold' : 'bg-slate-800 text-slate-300'
                            }`}>
                              {node.asset.criticality}
                            </span>
                          </div>
                          <div className="font-semibold text-slate-200 truncate" title={node.asset.name}>
                            {node.asset.name}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">{node.asset.type}</div>
                        </div>

                        {/* 2. Risk Node */}
                        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase">
                            <span className="flex items-center gap-1">
                              <Flame className="w-2.5 h-2.5 text-rose-400" />
                              Risk
                            </span>
                            <span className="font-mono text-[9px] text-amber-300">{node.risk.code}</span>
                          </div>
                          <div className="font-semibold text-slate-200 truncate" title={node.risk.title}>
                            {node.risk.title}
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-400">
                            <span>Inh: <strong className="text-rose-400 font-mono">{node.risk.inherentScore}</strong></span>
                            <span>Res: <strong className={`font-mono ${node.risk.residualScore > 10 ? 'text-rose-400' : 'text-emerald-400'}`}>{node.risk.residualScore}</strong></span>
                          </div>
                        </div>

                        {/* 3. Control Node */}
                        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase">
                            <span className="flex items-center gap-1">
                              <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
                              Control
                            </span>
                            <span className="text-[9px] text-emerald-400">CMMI {node.control.maturityLevel}</span>
                          </div>
                          <div className="font-semibold text-slate-200 truncate">
                            {node.control.implementationStatus}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">Dept: {node.control.owner}</div>
                        </div>

                        {/* 4. Telemetry ACT Node */}
                        <div className={`p-2.5 rounded-xl border space-y-1 ${
                          node.telemetry.status === 'PASS' ? 'bg-slate-950/80 border-slate-800/80' :
                          node.telemetry.status === 'FAIL' ? 'bg-rose-950/40 border-rose-800/60' :
                          'bg-amber-950/40 border-amber-800/60'
                        }`}>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase">
                            <span className="flex items-center gap-1">
                              <Radio className="w-2.5 h-2.5 text-indigo-400" />
                              ACT Probe
                            </span>
                            <span className="font-mono text-[9px] text-indigo-300">{node.telemetry.provider}</span>
                          </div>
                          <div className="font-semibold text-slate-200 truncate" title={node.telemetry.testName}>
                            {node.telemetry.status}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate font-mono">{node.telemetry.metricValue}</div>
                        </div>

                        {/* 5. Evidence Node */}
                        <div className={`p-2.5 rounded-xl border space-y-1 ${
                          node.evidence.status === 'Verified' ? 'bg-slate-950/80 border-slate-800/80' :
                          node.evidence.status === 'Expired' ? 'bg-purple-950/40 border-purple-800/60' :
                          'bg-slate-950/80 border-slate-800/80'
                        }`}>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase">
                            <span className="flex items-center gap-1">
                              <FileCheck2 className="w-2.5 h-2.5 text-purple-400" />
                              Evidence
                            </span>
                            <span className={`text-[9px] ${node.evidence.status === 'Verified' ? 'text-emerald-400' : 'text-purple-300'}`}>
                              {node.evidence.status}
                            </span>
                          </div>
                          <div className="font-semibold text-slate-200 truncate" title={node.evidence.title}>
                            {node.evidence.title}
                          </div>
                          <div className="text-[9px] text-slate-500 font-mono truncate">
                            SHA: {node.evidence.sha256Hash.substring(0, 10)}...
                          </div>
                        </div>

                        {/* 6. Finding / CAPA Node */}
                        <div className={`p-2.5 rounded-xl border space-y-1 ${
                          node.finding.hasActiveNC ? 'bg-rose-950/30 border-rose-800/50' : 'bg-slate-950/80 border-slate-800/80'
                        }`}>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase">
                            <span className="flex items-center gap-1">
                              <Wrench className="w-2.5 h-2.5 text-amber-400" />
                              CAPA
                            </span>
                            <span className="font-mono text-[9px] text-amber-300">
                              {node.finding.findingCode || 'Clean'}
                            </span>
                          </div>
                          <div className="font-semibold text-slate-200 truncate">
                            {node.finding.hasActiveNC ? (node.finding.severity || 'NC Active') : 'No Open NC'}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {node.finding.hasActiveNC ? 'Remediation queued' : 'Closed & verified'}
                          </div>
                        </div>

                        {/* 7. Management Review Node */}
                        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase">
                            <span className="flex items-center gap-1">
                              <Award className="w-2.5 h-2.5 text-teal-400" />
                              Cl. 9.3 MRM
                            </span>
                            <span className="text-[9px] text-teal-400">Ratified</span>
                          </div>
                          <div className="font-semibold text-slate-200 truncate">
                            {node.mgmtReview.decision}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {node.mgmtReview.reviewDate}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* VIEW MODE 2: DENSE AUDITOR TRACEABILITY MATRIX */}
        {viewMode === 'matrix' && (
          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950/90 text-slate-400 border-b border-slate-800 text-[11px] font-mono uppercase tracking-wider">
                    <th className="px-4 py-3">Control Code</th>
                    <th className="px-4 py-3">Title & Domain</th>
                    <th className="px-4 py-3">Linked Asset</th>
                    <th className="px-4 py-3">Risk (Inh / Res)</th>
                    <th className="px-4 py-3">ACT Telemetry Probe</th>
                    <th className="px-4 py-3">Evidence Artifact & Hash</th>
                    <th className="px-4 py-3">CAPA Status</th>
                    <th className="px-4 py-3">Cl. 9.3 Ratified</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredNodes.map(node => (
                    <tr key={node.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-4 py-3 font-mono font-bold text-sky-400">
                        {node.controlCode}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-200">{node.controlTitle}</div>
                        <div className="text-[10px] text-slate-400">{node.domain}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-slate-300 font-medium">{node.asset.name}</div>
                        <div className="text-[10px] text-slate-500">{node.asset.type} • {node.asset.criticality}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-slate-300 font-mono text-xs">
                          Inh: <span className="text-rose-400">{node.risk.inherentScore}</span> | Res: <span className={node.risk.residualScore > 10 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>{node.risk.residualScore}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[140px]">{node.risk.code}: {node.risk.title}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-1.5">
                          <span className={`w-2 h-2 rounded-full ${
                            node.telemetry.status === 'PASS' ? 'bg-emerald-400' :
                            node.telemetry.status === 'FAIL' ? 'bg-rose-400 animate-pulse' : 'bg-amber-400'
                          }`} />
                          <span className="font-mono text-slate-200">{node.telemetry.provider}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{node.telemetry.metricValue}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-slate-300 truncate max-w-[160px]">{node.evidence.title}</div>
                        <div className="text-[9px] font-mono text-purple-400 truncate max-w-[160px]">
                          SHA-256: {node.evidence.sha256Hash.substring(0, 16)}...
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {node.finding.hasActiveNC ? (
                          <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold text-[10px] border border-rose-500/40">
                            {node.finding.findingCode || 'NC Open'}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/40">
                            Conforming
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[11px] text-slate-400">
                        <span className="text-teal-400 font-mono">Yes</span> ({node.mgmtReview.reviewDate})
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setSelectedNode(node)}
                          className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-bold transition cursor-pointer"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* AUDITOR PROVENANCE & TRACEABILITY INSPECTION DRAWER */}
        {selectedNode && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex justify-end">
            <div className="w-full max-w-2xl h-full bg-slate-900 border-l border-slate-800 p-6 overflow-y-auto space-y-6 shadow-2xl">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-1 rounded-lg bg-sky-950 border border-sky-800 text-sky-300 font-mono font-bold text-xs">
                      {selectedNode.controlCode}
                    </span>
                    <h2 className="text-base font-bold text-white">{selectedNode.controlTitle}</h2>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Complete 7-Hop Cryptographic Traceability Audit Record (ISO 19011:2018 / ISO 27001:2022)
                  </p>
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {/* Hop 1: Business Asset */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-sky-400 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <Server className="w-4 h-4" />
                    1. Scoped Business Asset
                  </span>
                  <span className="font-mono text-slate-400">{selectedNode.asset.id}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div><span className="text-slate-500">Asset Name:</span> <strong className="text-white">{selectedNode.asset.name}</strong></div>
                  <div><span className="text-slate-500">Classification:</span> <strong className="text-amber-400">{selectedNode.asset.criticality} Criticality</strong></div>
                  <div><span className="text-slate-500">Type:</span> <span className="text-slate-300">{selectedNode.asset.type}</span></div>
                  <div><span className="text-slate-500">Owner:</span> <span className="text-slate-300">{selectedNode.asset.owner}</span></div>
                </div>
              </div>

              {/* Hop 2: Threat & Inherent Risk */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-rose-400 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <Flame className="w-4 h-4" />
                    2. Risk & Threat Vector
                  </span>
                  <span className="font-mono text-slate-400">{selectedNode.risk.code}</span>
                </div>
                <div className="text-xs text-white font-medium">{selectedNode.risk.title}</div>
                <div className="grid grid-cols-3 gap-2 text-xs pt-1 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80 font-mono">
                  <div>Inherent Score: <strong className="text-rose-400">{selectedNode.risk.inherentScore}/25</strong></div>
                  <div>Residual Score: <strong className={selectedNode.risk.residualScore > 10 ? 'text-rose-400' : 'text-emerald-400'}>{selectedNode.risk.residualScore}/25</strong></div>
                  <div>Treatment: <span className="text-sky-300">{selectedNode.risk.treatment}</span></div>
                </div>
              </div>

              {/* Hop 3: ISO / MAS Control Mandate */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    3. Formal Control Requirement
                  </span>
                  <span className="text-xs text-slate-400">{selectedNode.framework}</span>
                </div>
                <div className="text-xs text-slate-300">
                  <strong className="text-white">Justification:</strong> {selectedNode.control.justification}
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <span>Maturity: <strong className="text-emerald-400">Level {selectedNode.control.maturityLevel} (Monitored)</strong></span>
                  <span>Owner: <strong className="text-slate-200">{selectedNode.control.owner}</strong></span>
                </div>
              </div>

              {/* Hop 4: Automated Control Test (ACT) Probe */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <Radio className="w-4 h-4" />
                    4. Continuous Telemetry Probe
                  </span>
                  <span className="font-mono text-indigo-300">{selectedNode.telemetry.provider} Engine</span>
                </div>
                <div className="text-xs text-white font-mono">{selectedNode.telemetry.testName}</div>
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div>Status: <strong className={selectedNode.telemetry.status === 'PASS' ? 'text-emerald-400' : 'text-rose-400'}>{selectedNode.telemetry.status}</strong></div>
                  <div>Cadence: <span className="text-slate-300">Continuous / Real-Time</span></div>
                  <div>Threshold: <span className="text-slate-300 font-mono">{selectedNode.telemetry.threshold}</span></div>
                  <div>Observed: <strong className="text-white font-mono">{selectedNode.telemetry.metricValue}</strong></div>
                </div>
              </div>

              {/* Hop 5: Cryptographic Evidence WORM Seal */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-purple-400 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <FileCheck2 className="w-4 h-4" />
                    5. Verified Evidence Artifact & Hash
                  </span>
                  <span className="text-xs text-emerald-400 font-bold">{selectedNode.evidence.status}</span>
                </div>
                <div className="text-xs text-white font-medium">{selectedNode.evidence.title}</div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-purple-300 break-all">
                  SHA-256: {selectedNode.evidence.sha256Hash}
                </div>
                <div className="text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Collected: {selectedNode.evidence.uploadedDate}</span>
                  <span>Validity: {selectedNode.evidence.freshnessDaysRemaining} days remaining</span>
                </div>
              </div>

              {/* Hop 6: Audit Finding & CAPA */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-amber-400 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <Wrench className="w-4 h-4" />
                    6. Corrective Action (Clause 10.2)
                  </span>
                  <span className="font-mono text-slate-400">{selectedNode.finding.findingCode || 'Clean'}</span>
                </div>
                {selectedNode.finding.hasActiveNC ? (
                  <div className="space-y-2 text-xs">
                    <div className="text-rose-300 font-bold">{selectedNode.finding.capaTitle}</div>
                    <div className="text-slate-400">Severity: <strong className="text-rose-400">{selectedNode.finding.severity}</strong></div>
                    <button
                      onClick={() => {
                        setSelectedNode(null);
                        setActiveModule('findings_capa');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition inline-flex items-center space-x-1 cursor-pointer"
                    >
                      <span>Open in Findings & CAPA Workbench</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="text-xs text-emerald-400 font-medium">
                    No active nonconformity. Operating effectively across all audited periods.
                  </div>
                )}
              </div>

              {/* Hop 7: Clause 9.3 Management Review Ratification */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-teal-400 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <Award className="w-4 h-4" />
                    7. Management Review Ratification (Clause 9.3)
                  </span>
                  <span className="text-xs text-teal-300">Attested</span>
                </div>
                <div className="text-xs text-slate-300">
                  <strong className="text-white">Board Decision:</strong> {selectedNode.mgmtReview.decision}
                </div>
                <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                  <span>Chair: {selectedNode.mgmtReview.chairPerson}</span>
                  <span>Date: {selectedNode.mgmtReview.reviewDate}</span>
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => setSelectedNode(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
                >
                  Close Inspector
                </button>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setSelectedNode(null);
                      setActiveModule('statement_of_applicability');
                    }}
                    className="px-3 py-2 rounded-xl bg-sky-950 hover:bg-sky-900 border border-sky-800 text-sky-300 text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                  >
                    <span>View SoA</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedNode(null);
                      setActiveModule('evidence_centre');
                    }}
                    className="px-3 py-2 rounded-xl bg-purple-950 hover:bg-purple-900 border border-purple-800 text-purple-300 text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                  >
                    <span>Evidence Center</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
};
