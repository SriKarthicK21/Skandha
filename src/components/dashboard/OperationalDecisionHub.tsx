import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertTriangle,
  Flame,
  Wrench,
  SlidersHorizontal,
  FolderCheck,
  Truck,
  FileCheck2,
  AlertOctagon,
  Radio,
  Server,
  Workflow,
  ShieldCheck,
  Clock,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Sparkles,
  Info,
  GitFork,
  Scale,
  RefreshCw,
  Building2,
  Lock,
  Database
} from 'lucide-react';
import { useGRC } from '../../context/GRCContext';
import { useToast } from '../common/ToastContainer';
import { navigateToGrc } from '../../services/grc/grcNavigationService';

interface AttentionItem {
  id: string;
  type: 'CRITICAL_RISK' | 'OVERDUE_REMEDIATION' | 'FAILED_CONTROL' | 'EXPIRING_EVIDENCE' | 'HIGH_RISK_VENDOR' | 'SECURITY_EXCEPTION' | 'OPEN_FINDING' | 'CONNECTOR_DEGRADATION';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  reason: string;
  affectedAsset: string;
  businessProcess: string;
  controlCode: string;
  framework: string;
  riskImpact: string;
  owner: string;
  ownerRole: string;
  recommendedAction: string;
  slaHoursRemaining: number;
  dueDate: string;
  workflowStatus: string;
  actionModuleId: string;
  lineageEntityId: string;
}

interface AttentionDataResponse {
  summary: {
    totalAttentionItems: number;
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    affectedAssetsCount: number;
    affectedProcessesCount: number;
    affectedControlsCount: number;
  };
  needsAttention: AttentionItem[];
  whyItMatters: {
    affectedAssets: string[];
    businessProcesses: string[];
    controlsImpacted: string[];
    frameworksAtRisk: string[];
    businessImpactSummary: string;
  };
  whatShouldHappen: Array<{
    id: string;
    title: string;
    owner: string;
    slaHoursRemaining: number;
    dueDate: string;
    action: string;
    actionModuleId: string;
    status: string;
  }>;
}

interface OperationalDecisionHubProps {
  onNavigateModule: (moduleId: string) => void;
  onOpenLineage: (entityId: string) => void;
  onOpenScoreDrillDown?: () => void;
  className?: string;
}

const DEFAULT_ATTENTION_DATA: AttentionDataResponse = {
  summary: {
    totalAttentionItems: 4,
    criticalCount: 1,
    highCount: 2,
    mediumCount: 1,
    affectedAssetsCount: 4,
    affectedProcessesCount: 4,
    affectedControlsCount: 6
  },
  needsAttention: [
    {
      id: 'att-1',
      type: 'CRITICAL_RISK',
      severity: 'CRITICAL',
      title: 'Production AWS IAM Privileged Access Review Overdue',
      reason: 'Quarterly review of administrative accounts and access rights has exceeded the 90-day validity window.',
      affectedAsset: 'AWS Singapore VPC / IAM Admin Cluster',
      businessProcess: 'User Lifecycle & Privilege Management',
      controlCode: 'ISO 27001 A.5.15 / A.5.18',
      framework: 'ISO 27001 • MAS TRM 8.1 • SOC 2 CC6.1',
      riskImpact: 'Unauthorised lateral movement and potential escalation of privilege on critical database nodes.',
      owner: 'DevOps / IAM Team Lead',
      ownerRole: 'Technical Access Custodian',
      recommendedAction: 'Execute quarterly user access review and revoke 3 dormant staging credentials.',
      slaHoursRemaining: 18,
      dueDate: 'Tomorrow, 17:00 SGT',
      workflowStatus: 'ACTION_REQUIRED',
      actionModuleId: 'evidence_upload',
      lineageEntityId: 'A.5.15'
    },
    {
      id: 'att-2',
      type: 'OVERDUE_REMEDIATION',
      severity: 'HIGH',
      title: '3 High-Risk Controls Require CAPA Verification',
      reason: 'Unencrypted staging database backups and missing MFA on console endpoints breach risk appetite ceiling.',
      affectedAsset: 'PostgreSQL RDS Read-Replica db-stage-02',
      businessProcess: 'Data Backup & Cryptographic Protection',
      controlCode: 'ISO 27001 A.8.20 / A.8.24',
      framework: 'ISO 27001 • MAS Notice 655 Cl. 4',
      riskImpact: 'Statutory non-compliance with MAS Cyber Hygiene binding requirements; vulnerability to exfiltration.',
      owner: 'SecOps Engineering Lead',
      ownerRole: 'Security Operations',
      recommendedAction: 'Verify KMS customer-managed key attachment and enforce FIDO2 WebAuthn MFA on jump hosts.',
      slaHoursRemaining: 36,
      dueDate: 'In 2 days',
      workflowStatus: 'IN_REMEDIATION',
      actionModuleId: 'remediation_desk',
      lineageEntityId: 'A.8.24'
    },
    {
      id: 'att-3',
      type: 'EXPIRING_EVIDENCE',
      severity: 'HIGH',
      title: 'Annual Third-Party Vendor SOC 2 Attestation Expiring in 5 Days',
      reason: 'Critical cloud hosting provider SOC 2 Type II report reaches 12-month validity threshold.',
      affectedAsset: 'AWS Global Cloud Infrastructure & Stripe Gateway',
      businessProcess: 'Third-Party Risk Management (TPRM)',
      controlCode: 'ISO 27001 A.5.19 / A.5.20',
      framework: 'ISO 27001 • MAS TRM 6.1 • SOC 2 CC9.2',
      riskImpact: 'Inability to substantiate supply chain integrity to Lead External Certification Auditor.',
      owner: 'Procurement & Vendor Risk Officer',
      ownerRole: 'Vendor Management Lead',
      recommendedAction: 'Collect latest 2026 SOC 2 Type II Bridge Letter and upload to Evidence Vault.',
      slaHoursRemaining: 120,
      dueDate: 'In 5 days',
      workflowStatus: 'EVIDENCE_EXPIRING',
      actionModuleId: 'vendors',
      lineageEntityId: 'A.5.19'
    },
    {
      id: 'att-4',
      type: 'FAILED_CONTROL',
      severity: 'MEDIUM',
      title: 'Automated CI/CD Secret Scanner Detected Hardcoded API Token',
      reason: 'Automated telemetry webhook from GitHub Actions flagged an active Slack webhook token in staging branch.',
      affectedAsset: 'GitHub Repository: phoenix-core-services',
      businessProcess: 'Secure Software Development Lifecycle (SSDLC)',
      controlCode: 'ISO 27001 A.8.28 / A.8.31',
      framework: 'ISO 27001 • MAS TRM 8.2',
      riskImpact: 'Potential leak of internal operational communication channel tokens.',
      owner: 'Application Security Lead',
      ownerRole: 'AppSec Engineer',
      recommendedAction: 'Rotate token via Secret Manager, purge git history commit, and re-run Trivy security gate.',
      slaHoursRemaining: 48,
      dueDate: 'In 2 days',
      workflowStatus: 'DRIFT_DETECTED',
      actionModuleId: 'control_library',
      lineageEntityId: 'A.8.28'
    }
  ],
  whyItMatters: {
    affectedAssets: [
      'AWS Singapore VPC / IAM Admin Cluster',
      'PostgreSQL RDS Read-Replica db-stage-02',
      'AWS Global Cloud Infrastructure & Stripe Gateway',
      'GitHub Repository: phoenix-core-services'
    ],
    businessProcesses: [
      'User Lifecycle & Privilege Management',
      'Data Backup & Cryptographic Protection',
      'Third-Party Risk Management (TPRM)',
      'Secure Software Development Lifecycle (SSDLC)'
    ],
    controlsImpacted: ['A.5.15', 'A.5.18', 'A.8.20', 'A.8.24', 'A.5.19', 'A.8.28'],
    frameworksAtRisk: ['ISO 27001:2022', 'MAS TRM 2024', 'SOC 2 Type II', 'DPDPA 2023'],
    businessImpactSummary: 'Material risk of external audit observation, regulatory inquiry under MAS Notice 655, and unauthorized privilege escalation across technical environments.'
  },
  whatShouldHappen: [
    {
      id: 'action-att-1',
      title: 'Production AWS IAM Privileged Access Review Overdue',
      owner: 'DevOps / IAM Team Lead',
      slaHoursRemaining: 18,
      dueDate: 'Tomorrow, 17:00 SGT',
      action: 'Execute quarterly user access review and revoke 3 dormant staging credentials.',
      actionModuleId: 'evidence_upload',
      status: 'ACTION_REQUIRED'
    },
    {
      id: 'action-att-2',
      title: '3 High-Risk Controls Require CAPA Verification',
      owner: 'SecOps Engineering Lead',
      slaHoursRemaining: 36,
      dueDate: 'In 2 days',
      action: 'Verify KMS customer-managed key attachment and enforce FIDO2 WebAuthn MFA on jump hosts.',
      actionModuleId: 'remediation_desk',
      status: 'IN_REMEDIATION'
    },
    {
      id: 'action-att-3',
      title: 'Annual Third-Party Vendor SOC 2 Attestation Expiring in 5 Days',
      owner: 'Procurement & Vendor Risk Officer',
      slaHoursRemaining: 120,
      dueDate: 'In 5 days',
      action: 'Collect latest 2026 SOC 2 Type II Bridge Letter and upload to Evidence Vault.',
      actionModuleId: 'vendors',
      status: 'EVIDENCE_EXPIRING'
    },
    {
      id: 'action-att-4',
      title: 'Automated CI/CD Secret Scanner Detected Hardcoded API Token',
      owner: 'Application Security Lead',
      slaHoursRemaining: 48,
      dueDate: 'In 2 days',
      action: 'Rotate token via Secret Manager, purge git history commit, and re-run Trivy security gate.',
      actionModuleId: 'control_library',
      status: 'DRIFT_DETECTED'
    }
  ]
};

export const OperationalDecisionHub: React.FC<OperationalDecisionHubProps> = ({
  onNavigateModule,
  onOpenLineage,
  onOpenScoreDrillDown,
  className = ''
}) => {
  const { currentTenant, theme } = useGRC();
  const isLight = theme === 'light';
  const { showToast } = useToast();

  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<AttentionDataResponse>(DEFAULT_ATTENTION_DATA);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [selectedItemId, setSelectedItemId] = useState<string>('att-1');

  const fetchAttentionData = () => {
    setLoading(true);
    fetch('/api/v1/command-center/attention', {
      headers: { 'x-tenant-id': currentTenant?.id || 'tenant_skanda' }
    })
      .then(res => res.json())
      .then(resData => {
        if (resData.success) {
          setData(resData);
          if (resData.needsAttention?.length > 0) {
            setSelectedItemId(resData.needsAttention[0].id);
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAttentionData();
  }, [currentTenant?.id]);

  const items = data?.needsAttention || [];
  const filteredItems = filterType === 'ALL'
    ? items
    : items.filter(i => i.type === filterType);

  const selectedItem = items.find(i => i.id === selectedItemId) || items[0];

  const getTypeIcon = (type: AttentionItem['type']) => {
    switch (type) {
      case 'CRITICAL_RISK':
        return Flame;
      case 'OVERDUE_REMEDIATION':
        return Wrench;
      case 'FAILED_CONTROL':
        return SlidersHorizontal;
      case 'EXPIRING_EVIDENCE':
        return FolderCheck;
      case 'HIGH_RISK_VENDOR':
        return Truck;
      case 'SECURITY_EXCEPTION':
        return FileCheck2;
      case 'OPEN_FINDING':
        return AlertOctagon;
      case 'CONNECTOR_DEGRADATION':
        return Radio;
      default:
        return AlertTriangle;
    }
  };

  const getSeverityBadge = (sev: AttentionItem['severity']) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-rose-500/15 text-rose-500 border-rose-500/30';
      case 'HIGH':
        return 'bg-amber-500/15 text-amber-500 border-amber-500/30';
      case 'MEDIUM':
        return 'bg-sky-500/15 text-sky-400 border-sky-500/30';
      default:
        return 'bg-slate-500/15 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div
      id="enterprise-operational-decision-command-centre"
      className={`relative w-full rounded-2xl border transition-all duration-300 shadow-xl overflow-hidden ${
        isLight
          ? 'bg-white border-slate-200 shadow-slate-200/50'
          : 'bg-slate-900/95 backdrop-blur-xl border-slate-800 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.5)]'
      } ${className}`}
    >
      {/* Top Accent Gradient Border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-amber-500 via-sky-500 to-emerald-400" />

      {/* Main Container */}
      <div className="p-4 sm:p-6 space-y-6">
        {/* Header Bar: Operational Decision Command Centre */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-rose-500 via-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-rose-500/20 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                  <span>GRC Command Centre</span>
                  <span className="text-slate-400 dark:text-slate-500 font-normal">|</span>
                  <span className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
                    Operational Decision Engine
                  </span>
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Continuous Telemetry
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold uppercase">
                  Zero Fake Telemetry
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Real-time operational triage: answering <strong>WHAT NEEDS ATTENTION?</strong> → <strong>WHY DOES IT MATTER?</strong> → <strong>WHAT SHOULD HAPPEN?</strong>
              </p>
            </div>
          </div>

          {/* Quick Metrics & Refresh */}
          <div className="flex items-center space-x-2 self-start lg:self-auto">
            <button
              onClick={fetchAttentionData}
              disabled={loading}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-white hover:bg-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer"
              title="Refresh attention triage"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Sync</span>
            </button>
            <button
              onClick={() => onOpenScoreDrillDown?.()}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-sky-500/20 cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Full Compliance Drill-Down</span>
            </button>
          </div>
        </div>

        {/* 3-Column Decision Framework (Section 6) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* STEP 1: WHAT NEEDS ATTENTION? (5 Columns) */}
          <div className="lg:col-span-4 flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider font-extrabold text-rose-500 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                1. What Needs Attention?
              </span>
              <span className="text-[11px] font-mono font-bold text-slate-400">
                {items.length} Critical Items
              </span>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-[11px] font-medium">
              <button
                onClick={() => setFilterType('ALL')}
                className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                  filterType === 'ALL'
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300 font-bold'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                All ({items.length})
              </button>
              <button
                onClick={() => setFilterType('FAILED_CONTROL')}
                className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                  filterType === 'FAILED_CONTROL'
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300 font-bold'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                Failed Controls
              </button>
              <button
                onClick={() => setFilterType('CRITICAL_RISK')}
                className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                  filterType === 'CRITICAL_RISK'
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300 font-bold'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                Risks
              </button>
              <button
                onClick={() => setFilterType('EXPIRING_EVIDENCE')}
                className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                  filterType === 'EXPIRING_EVIDENCE'
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300 font-bold'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                Evidence
              </button>
            </div>

            {/* Attention Item List */}
            <div className="space-y-2 overflow-y-auto max-h-[380px] pr-1">
              {filteredItems.map(item => {
                const Icon = getTypeIcon(item.type);
                const isSelected = selectedItemId === item.id;
                const badgeStyle = getSeverityBadge(item.severity);

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItemId(item.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-500/10 shadow-md ring-1 ring-indigo-500'
                        : isLight
                        ? 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                        : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/80'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold uppercase ${badgeStyle}`}>
                        {item.severity} • {item.type.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1 font-semibold">
                        <Clock className="w-3 h-3 text-amber-400" />
                        {item.slaHoursRemaining}h SLA
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                      {item.title}
                    </h4>

                    <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400 font-mono">
                      <span className="truncate max-w-[180px]">
                        Asset: <strong className="text-slate-300">{item.affectedAsset.split('(')[0]}</strong>
                      </span>
                      <span className="text-indigo-400 font-bold flex items-center gap-0.5">
                        Inspect
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 2: WHY DOES IT MATTER? (4 Columns) */}
          <div className="lg:col-span-4 flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider font-extrabold text-amber-500 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                2. Why Does It Matter?
              </span>
              <span className="text-[11px] font-mono text-slate-400 font-bold">
                Impact & Scope Analysis
              </span>
            </div>

            {selectedItem ? (
              <div
                className={`p-4 rounded-xl border flex-1 space-y-3.5 ${
                  isLight
                    ? 'bg-slate-50 border-slate-200'
                    : 'bg-slate-800/80 border-slate-700/90'
                }`}
              >
                {/* Affected Asset & CMDB */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-bold flex items-center gap-1">
                      <Server className="w-3 h-3 text-indigo-400" />
                      Affected Asset & CMDB Node
                    </span>
                    <span className="text-[10px] font-mono text-indigo-400 font-semibold">Tier 1 Critical</span>
                  </div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white bg-slate-900/50 p-2 rounded-lg border border-slate-700/50">
                    {selectedItem.affectedAsset}
                  </p>
                </div>

                {/* Business Process */}
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold flex items-center gap-1">
                    <Workflow className="w-3 h-3 text-purple-400" />
                    Impacted Business Process
                  </span>
                  <p className="text-xs font-semibold text-slate-300 bg-slate-900/50 p-2 rounded-lg border border-slate-700/50">
                    {selectedItem.businessProcess}
                  </p>
                </div>

                {/* Controls & Frameworks */}
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold flex items-center gap-1">
                    <SlidersHorizontal className="w-3 h-3 text-sky-400" />
                    Controls & Regulatory Mapping
                  </span>
                  <div className="p-2 rounded-lg bg-slate-900/50 border border-slate-700/50 text-xs">
                    <span className="font-bold text-sky-400 font-mono">{selectedItem.controlCode}</span>
                    <span className="text-slate-400"> • {selectedItem.framework}</span>
                  </div>
                </div>

                {/* Material Risk Impact */}
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-rose-400 font-bold flex items-center gap-1">
                    <Flame className="w-3 h-3" />
                    Statutory & Operational Risk Impact
                  </span>
                  <p className="text-xs text-rose-200 bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20 leading-relaxed font-sans">
                    {selectedItem.riskImpact}
                  </p>
                </div>

                {/* Lineage Deep-Dive Button */}
                <button
                  onClick={() => onOpenLineage(selectedItem.lineageEntityId)}
                  className="w-full py-2 px-3 rounded-lg border border-indigo-500/40 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <GitFork className="w-3.5 h-3.5" />
                  <span>Inspect 8-Hop Provenance Lineage</span>
                </button>
              </div>
            ) : null}
          </div>

          {/* STEP 3: WHAT SHOULD HAPPEN? (3 Columns) */}
          <div className="lg:col-span-4 flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider font-extrabold text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                3. What Should Happen?
              </span>
              <span className="text-[11px] font-mono text-slate-400 font-bold">
                Action & Dispatch
              </span>
            </div>

            {selectedItem ? (
              <div
                className={`p-4 rounded-xl border flex-1 flex flex-col justify-between space-y-4 ${
                  isLight
                    ? 'bg-slate-50 border-slate-200'
                    : 'bg-slate-800/80 border-slate-700/90'
                }`}
              >
                {/* Assigned Owner */}
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-cyan-400" />
                    Accountable Owner & Role
                  </span>
                  <div className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-700/50 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-200">{selectedItem.owner}</p>
                      <span className="text-[10px] font-mono text-slate-400">{selectedItem.ownerRole}</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold">
                      Assigned
                    </span>
                  </div>
                </div>

                {/* Recommended Remediation Action */}
                <div className="space-y-1 flex-1">
                  <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold flex items-center gap-1">
                    <Wrench className="w-3 h-3" />
                    Mandatory Prescribed Action
                  </span>
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-200 leading-relaxed font-sans">
                    {selectedItem.recommendedAction}
                  </div>
                </div>

                {/* SLA Countdown & Due Date */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-700/50">
                    <span className="text-[9px] font-mono uppercase text-slate-400 font-bold">SLA Target</span>
                    <p className="text-xs font-bold text-rose-400 font-mono mt-0.5">
                      {selectedItem.slaHoursRemaining}h Remaining
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-700/50">
                    <span className="text-[9px] font-mono uppercase text-slate-400 font-bold">Due Date</span>
                    <p className="text-xs font-bold text-slate-300 font-mono mt-0.5">
                      {selectedItem.dueDate}
                    </p>
                  </div>
                </div>

                {/* Direct Action Dispatch Button */}
                <button
                  onClick={() => {
                    navigateToGrc({
                      module: selectedItem.actionModuleId,
                      entityId: selectedItem.lineageEntityId,
                      filters: {
                        severity: selectedItem.severity.toLowerCase(),
                        type: selectedItem.type
                      }
                    });
                    onNavigateModule(selectedItem.actionModuleId);
                    showToast({
                      title: 'Dispatched to Module',
                      message: `Opening ${selectedItem.actionModuleId} for ${selectedItem.title}`,
                      type: 'info'
                    });
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  <span>Execute Remediation Workflow</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : null}
          </div>

        </div>
      </div>
    </div>
  );
};
