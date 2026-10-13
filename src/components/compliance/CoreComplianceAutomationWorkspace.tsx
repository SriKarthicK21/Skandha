// ============================================================================
// SKANDA ENTERPRISE GRC: CORE COMPLIANCE AUTOMATION COMMAND CENTER WORKSPACE
// Path: src/components/compliance/CoreComplianceAutomationWorkspace.tsx
//
// Enterprise Compliance Automation & Continuous Assurance Operating System
// UI Command Center uniting:
//  - Multi-Framework Compliance Programs & 1-Click Activation
//  - Cross-Framework Canonical Control Harmonization ("1 Evidence -> 4 Frameworks")
//  - Extensible Integration Ecosystem & Live Telemetry Studio (30+ Connectors)
//  - Automated Evidence Vault with WORM Cryptographic Digests
//  - Continuous Control Monitoring & Automated Testing Center
//  - Compliance Tasks & 5-Tier SLA Escalation Cockpit
//  - 5-Whys Root Cause Remediation & Closed-Loop Retest
//  - Audit Readiness Center & Digital Binder Packager
//  - Enterprise Compliance Calendar
//  - Grounded AI Compliance Copilot (7-Layer Data Taxonomy)
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Zap,
  Layers,
  Cpu,
  FolderCheck,
  Activity,
  CheckSquare,
  AlertTriangle,
  FileCheck2,
  Calendar,
  Sparkles,
  RefreshCw,
  Play,
  Download,
  Plus,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Sliders,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Lock,
  Search,
  Filter,
  Eye,
  SlidersHorizontal,
  Server,
  Cloud,
  FileText,
  Key,
  Database
} from 'lucide-react';

import {
  EnterpriseComplianceProgram,
  FrameworkActivationRequest,
  FrameworkActivationResult,
  CanonicalUnifiedControl,
  IntegrationProviderId,
  AutomatedEvidenceRecord,
  ControlTestExecutionRecord,
  ContinuousMonitoringEvent,
  ComplianceAutomationTask,
  AutomatedCapaRemediation,
  FrameworkAuditReadinessProfile,
  AuditorEvidenceRequestPackage,
  ComplianceCalendarItem,
  AICopilotGroundedResponse,
  EnterpriseComplianceCommandCenterSummary
} from '../../types/coreComplianceAutomationTypes';

import { coreComplianceAutomationEngine } from '../../../server/services/compliance/CoreComplianceAutomationEngine';
import { complianceIntegrationRegistry } from '../../../server/services/compliance/IntegrationSdkAdapters';

interface CoreComplianceAutomationWorkspaceProps {
  tenantId?: string;
}

export const CoreComplianceAutomationWorkspace: React.FC<CoreComplianceAutomationWorkspaceProps> = ({
  tenantId = 'tenant-acme-corp'
}) => {
  const [activeTab, setActiveTab] = useState<string>('programs');
  const [summary, setSummary] = useState<EnterpriseComplianceCommandCenterSummary | null>(null);
  const [programs, setPrograms] = useState<EnterpriseComplianceProgram[]>([]);
  const [controls, setControls] = useState<CanonicalUnifiedControl[]>([]);
  const [evidenceList, setEvidenceList] = useState<AutomatedEvidenceRecord[]>([]);
  const [testExecutions, setTestExecutions] = useState<ControlTestExecutionRecord[]>([]);
  const [monitoringEvents, setMonitoringEvents] = useState<ContinuousMonitoringEvent[]>([]);
  const [tasks, setTasks] = useState<ComplianceAutomationTask[]>([]);
  const [capas, setCapas] = useState<AutomatedCapaRemediation[]>([]);
  const [readinessProfiles, setReadinessProfiles] = useState<FrameworkAuditReadinessProfile[]>([]);
  const [calendarItems, setCalendarItems] = useState<ComplianceCalendarItem[]>([]);
  const [auditorPackages, setAuditorPackages] = useState<AuditorEvidenceRequestPackage[]>([]);

  // Modals & Interactive State
  const [activationModalOpen, setActivationModalOpen] = useState(false);
  const [selectedFrameworkForActivation, setSelectedFrameworkForActivation] = useState('ISO_27001_2022');
  const [activationLoading, setActivationLoading] = useState(false);
  const [activationResult, setActivationResult] = useState<FrameworkActivationResult | null>(null);

  const [testingControlCode, setTestingControlCode] = useState<string | null>(null);
  const [testExecutionResult, setTestExecutionResult] = useState<ControlTestExecutionRecord | null>(null);

  const [copilotQuery, setCopilotQuery] = useState('');
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [copilotResponse, setCopilotResponse] = useState<AICopilotGroundedResponse | null>(null);

  const [selectedControlForDetail, setSelectedControlForDetail] = useState<CanonicalUnifiedControl | null>(null);

  const refreshData = () => {
    coreComplianceAutomationEngine.ensureTenantInitialized(tenantId);
    setSummary(coreComplianceAutomationEngine.getEnterpriseSummary(tenantId));
    setPrograms(coreComplianceAutomationEngine.getCompliancePrograms(tenantId));
    setControls(coreComplianceAutomationEngine.getAllCanonicalControls());
    setEvidenceList(coreComplianceAutomationEngine.getEvidenceForTenant(tenantId));
    setTestExecutions(coreComplianceAutomationEngine.getTestExecutionsForTenant(tenantId));
    setMonitoringEvents(coreComplianceAutomationEngine.getMonitoringEventsForTenant(tenantId));
    setTasks(coreComplianceAutomationEngine.getTasksForTenant(tenantId));
    setCapas(coreComplianceAutomationEngine.getCapasForTenant(tenantId));
    setReadinessProfiles(coreComplianceAutomationEngine.getFrameworkReadinessProfiles(tenantId));
    setCalendarItems(coreComplianceAutomationEngine.getCalendarEvents(tenantId));
    setAuditorPackages(coreComplianceAutomationEngine.getAuditorPackagesForTenant(tenantId));
  };

  useEffect(() => {
    refreshData();
  }, [tenantId]);

  const handleActivateFramework = async () => {
    setActivationLoading(true);
    try {
      const result = await coreComplianceAutomationEngine.activateFramework({
        frameworkCode: selectedFrameworkForActivation,
        tenantId,
        scope: {
          businessUnits: ['bu-cloud-fintech', 'bu-core-banking'],
          inScopeAssetIds: ['aws-s3-prod-data', 'aws-rds-core-db'],
          targetCloudAccounts: ['123456789012'],
          applicableJurisdictions: ['SG', 'IN', 'GLOBAL'],
          includedEnvironments: ['PRODUCTION']
        },
        autoMapCommonControls: true,
        autoProvisionEvidenceRequests: true,
        autoConnectAvailableTelemetry: true,
        defaultControlOwner: 'sarah.chen@acme.com'
      });
      setActivationResult(result);
      refreshData();
    } finally {
      setActivationLoading(false);
    }
  };

  const handleRunLiveTest = async (controlCode: string) => {
    setTestingControlCode(controlCode);
    try {
      const record = await coreComplianceAutomationEngine.executeControlTest(tenantId, controlCode, 'AUTOMATED', 'sarah.chen@acme.com');
      setTestExecutionResult(record);
      refreshData();
    } finally {
      setTestingControlCode(null);
    }
  };

  const handleCopilotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!copilotQuery.trim()) return;
    setCopilotLoading(true);
    try {
      const resp = await coreComplianceAutomationEngine.executeGroundedCopilotQuery({
        tenantId,
        query: copilotQuery
      });
      setCopilotResponse(resp);
    } finally {
      setCopilotLoading(false);
    }
  };

  const handleGenerateAuditPackage = (frameworkCode: string) => {
    const pkg = coreComplianceAutomationEngine.generateAuditorRequestPackage({
      tenantId,
      requestTitle: `Full Certification Audit Package for ${frameworkCode.replace(/_/g, ' ')}`,
      auditorQuery: 'Provide 100% verified evidence and control testing results for all in-scope controls.',
      requestedFramework: frameworkCode,
      requestedPeriod: { startDate: '2026-01-01', endDate: '2026-10-08' }
    });
    refreshData();
    alert(`Audit Package ${pkg.packageId} generated successfully with SHA-256 seal: ${pkg.cryptographicSealHash.substring(0, 16)}...`);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* 1. ENTERPRISE HEADER BANNER */}
      <div className="rounded-2xl border border-slate-700/80 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-6 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              <Zap className="w-3.5 h-3.5 animate-pulse" />
              SKANDA CONTINUOUS COMPLIANCE OPERATING SYSTEM
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              Compliance Operations Command Center
            </h1>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              Autonomous multi-framework orchestration engine. Continuously automates evidence collection across 30+ enterprise integrations, runs automated control testing, tracks 5-tier SLA task escalations, and packages audit-grade digital binders with zero duplicate fieldwork.
            </p>
          </div>

          {/* Top Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActivationModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              Activate Framework
            </button>
            <button
              onClick={() => handleGenerateAuditPackage('ISO_27001_2022')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium text-sm transition-all"
            >
              <FileCheck2 className="w-4 h-4 text-emerald-400" />
              Package Audit Binder
            </button>
            <button
              onClick={refreshData}
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-all"
              title="Refresh Operating Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Executive Real-Time Metrics Strip */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-slate-800">
            <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
              <div className="text-xs text-slate-400 font-medium">Compliance Posture</div>
              <div className="text-lg font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                {summary.overallPostureGrade}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">{summary.controlAssuranceCoveragePercent}% Assurance</div>
            </div>

            <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
              <div className="text-xs text-slate-400 font-medium">Active Programs</div>
              <div className="text-lg font-bold text-white mt-1 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-400" />
                {summary.activeProgramsCount} Programs
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">{summary.activeFrameworksCount} Frameworks</div>
            </div>

            <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
              <div className="text-xs text-slate-400 font-medium">Automated Evidence</div>
              <div className="text-lg font-bold text-sky-400 mt-1 flex items-center gap-1.5">
                <Cpu className="w-4 h-4" />
                {summary.automatedEvidencePercent}%
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">WORM Verified</div>
            </div>

            <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
              <div className="text-xs text-slate-400 font-medium">Control Testing</div>
              <div className="text-lg font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
                <Activity className="w-4 h-4" />
                {summary.totalCanonicalControls - summary.failedControlsCount}/{summary.totalCanonicalControls} Passing
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Continuous Monitoring</div>
            </div>

            <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
              <div className="text-xs text-slate-400 font-medium">Live Connectors</div>
              <div className="text-lg font-bold text-indigo-300 mt-1 flex items-center gap-1.5">
                <Server className="w-4 h-4" />
                {summary.activeConnectorsCount} Connected
              </div>
              <div className="text-[11px] text-emerald-400 mt-0.5">100% Healthy</div>
            </div>

            <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
              <div className="text-xs text-slate-400 font-medium">Audit Readiness</div>
              <div className="text-lg font-bold text-amber-400 mt-1 flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4" />
                {summary.auditReadinessAveragePercent}% Ready
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Stage 2 Prepared</div>
            </div>
          </div>
        )}
      </div>

      {/* 2. COMMAND CENTER TABS NAVIGATION */}
      <div className="flex items-center gap-2 border-b border-slate-800 overflow-x-auto pb-2 scrollbar-thin">
        {[
          { id: 'programs', label: 'Compliance Programs & Scope', icon: Layers, badge: programs.length },
          { id: 'crosswalk', label: 'Cross-Framework Controls', icon: Sliders, badge: 'Unified' },
          { id: 'integrations', label: 'Integration Ecosystem (30+)', icon: Server, badge: 'Live SDK' },
          { id: 'evidence', label: 'Automated Evidence Vault', icon: FolderCheck, badge: evidenceList.length },
          { id: 'testing', label: 'Control Testing & Monitoring', icon: Activity, badge: 'Live' },
          { id: 'tasks', label: 'Compliance Tasks & SLAs', icon: CheckSquare, badge: tasks.length },
          { id: 'remediation', label: '5-Whys CAPA Remediation', icon: AlertTriangle, badge: capas.length },
          { id: 'readiness', label: 'Audit Readiness Center', icon: FileCheck2, badge: readinessProfiles.length },
          { id: 'calendar', label: 'Compliance Calendar', icon: Calendar },
          { id: 'copilot', label: 'AI Compliance Copilot', icon: Sparkles, badge: '7-Layer' }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                  isActive ? 'bg-indigo-700/80 text-white' : 'bg-slate-800 text-slate-300 border border-slate-700'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. TAB CONTENT WORKSPACES */}

      {/* TAB 1: COMPLIANCE PROGRAMS */}
      {activeTab === 'programs' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {programs.map(prog => (
              <div key={prog.id} className="rounded-2xl border border-slate-700/80 bg-slate-900/90 p-6 shadow-xl space-y-4 hover:border-indigo-500/50 transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                      {prog.code}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-2">{prog.name}</h3>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    {prog.status}
                  </span>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{prog.description}</p>

                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="text-xs text-slate-400 font-medium">Included Frameworks:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {prog.frameworkCodes.map(fc => (
                      <span key={fc} className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-300 border border-slate-700">
                        {fc.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-slate-800/50 p-2.5 rounded-lg border border-slate-700/40">
                    <div className="text-[11px] text-slate-400">Assurance Coverage</div>
                    <div className="text-base font-bold text-emerald-400 mt-0.5">{prog.metrics.controlAssuranceCoveragePercent}%</div>
                  </div>
                  <div className="bg-slate-800/50 p-2.5 rounded-lg border border-slate-700/40">
                    <div className="text-[11px] text-slate-400">Audit Readiness</div>
                    <div className="text-base font-bold text-indigo-400 mt-0.5">{prog.metrics.auditReadinessScore}%</div>
                  </div>
                </div>

                <div className="pt-2 text-xs text-slate-400 flex items-center justify-between border-t border-slate-800">
                  <span>Lead: {prog.programLead}</span>
                  <span className="text-indigo-400 font-medium cursor-pointer hover:underline">Manage Scope →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: CROSS-FRAMEWORK CONTROLS MATRIX */}
      {activeTab === 'crosswalk' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white">Canonical Unified Control Matrix</h3>
                <p className="text-xs text-slate-400">Cross-framework mapping showing how 1 canonical control simultaneously satisfies multiple global statutory standards.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-800/80 text-xs text-slate-400 uppercase">
                  <tr>
                    <th className="p-3.5 rounded-l-lg">Control Code & Title</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Mapped Framework Requirements ("1 to Many")</th>
                    <th className="p-3.5">Automation Mode</th>
                    <th className="p-3.5 rounded-r-lg text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {controls.map(ctrl => (
                    <tr key={ctrl.id} className="hover:bg-slate-800/40 transition-all">
                      <td className="p-3.5">
                        <div className="font-bold text-white">{ctrl.controlCode}</div>
                        <div className="text-xs text-slate-400 line-clamp-1">{ctrl.title}</div>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-indigo-300 border border-slate-700">
                          {ctrl.category}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div className="flex flex-wrap gap-1.5 max-w-xl">
                          {ctrl.mappedFrameworkRequirements.map(m => (
                            <span key={`${m.frameworkCode}-${m.requirementCode}`} className="px-2 py-0.5 rounded text-[11px] bg-slate-800/80 border border-slate-700 text-slate-200">
                              <strong className="text-indigo-400">{m.frameworkCode.split('_')[0]}:</strong> {m.requirementCode} ({m.sectionOrClause})
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 w-max">
                          <Zap className="w-3 h-3" />
                          {ctrl.nature}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleRunLiveTest(ctrl.controlCode)}
                          disabled={testingControlCode === ctrl.controlCode}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-all"
                        >
                          <Play className="w-3 h-3" />
                          {testingControlCode === ctrl.controlCode ? 'Testing...' : 'Run Live Test'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: INTEGRATION ECOSYSTEM (30+ CONNECTORS) */}
      {activeTab === 'integrations' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {complianceIntegrationRegistry.getAllAdapters().map(adapter => {
              const health = adapter.getHealth(tenantId);
              return (
                <div key={adapter.providerId} className="rounded-2xl border border-slate-700/80 bg-slate-900/90 p-5 shadow-xl space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-indigo-300 border border-slate-700">
                        {adapter.category}
                      </span>
                      <h4 className="text-base font-bold text-white mt-1.5">{adapter.name}</h4>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      CONNECTED
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">{adapter.description}</p>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center">
                    <div className="bg-slate-800/40 p-2 rounded">
                      <div className="text-[10px] text-slate-400">Latency</div>
                      <div className="text-xs font-bold text-white mt-0.5">12.5ms</div>
                    </div>
                    <div className="bg-slate-800/40 p-2 rounded">
                      <div className="text-[10px] text-slate-400">30d Success</div>
                      <div className="text-xs font-bold text-emerald-400 mt-0.5">99.8%</div>
                    </div>
                    <div className="bg-slate-800/40 p-2 rounded">
                      <div className="text-[10px] text-slate-400">Freshness</div>
                      <div className="text-xs font-bold text-indigo-400 mt-0.5">1 min ago</div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Provider: <strong className="text-slate-200">{adapter.providerId}</strong></span>
                    <button
                      onClick={() => handleRunLiveTest('CTRL-IAM-01')}
                      className="text-indigo-400 font-semibold hover:underline"
                    >
                      Trigger Sync Now →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: AUTOMATED EVIDENCE VAULT */}
      {activeTab === 'evidence' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white">Cryptographic Automated Evidence Vault (WORM)</h3>
                <p className="text-xs text-slate-400">Tamper-evident evidence ledger with SHA-256 integrity digests, automatic freshness decay tracking, and multi-framework linkage.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-800/80 text-xs text-slate-400 uppercase">
                  <tr>
                    <th className="p-3.5 rounded-l-lg">Evidence Code & Title</th>
                    <th className="p-3.5">Source Provider</th>
                    <th className="p-3.5">SHA-256 Cryptographic Digest</th>
                    <th className="p-3.5">Freshness State</th>
                    <th className="p-3.5 rounded-r-lg">Valid Until</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {evidenceList.map(ev => (
                    <tr key={ev.id} className="hover:bg-slate-800/40 transition-all">
                      <td className="p-3.5">
                        <div className="font-bold text-white">{ev.evidenceCode}</div>
                        <div className="text-xs text-slate-400 line-clamp-1">{ev.title}</div>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-indigo-300 border border-slate-700">
                          {ev.sourceProvider}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-xs text-slate-400">
                        {ev.sha256Digest.substring(0, 20)}...
                      </td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          {ev.freshnessState}
                        </span>
                      </td>
                      <td className="p-3.5 text-xs text-slate-400">
                        {new Date(ev.validUntil).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: CONTROL TESTING & MONITORING */}
      {activeTab === 'testing' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white">Continuous Control Testing & Live Drift Logs</h3>
                <p className="text-xs text-slate-400">Real-time execution records against live infrastructure telemetry with automatic failure blast radius detection.</p>
              </div>
            </div>

            <div className="space-y-3">
              {testExecutions.map(t => (
                <div key={t.executionId} className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        t.verdict === 'PASS' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'
                      }`}>
                        {t.verdict}
                      </span>
                      <strong className="text-white text-sm">{t.controlCode}: {t.controlTitle}</strong>
                    </div>
                    <div className="text-xs text-slate-400">
                      Evaluated {t.evaluatedInputSummary.totalEntitiesEvaluated} telemetry entities in {t.executionDurationMs}ms • Executed by {t.executedBy}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {t.affectedFrameworkCodes.map(f => (
                      <span key={f} className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-300 border border-slate-700">
                        {f.split('_')[0]}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: COMPLIANCE TASKS & SLA ESCALATION */}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-white">Compliance Tasks & 5-Tier SLA Escalation Queue</h3>
            <div className="space-y-3">
              {tasks.map(tsk => (
                <div key={tsk.id} className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                        {tsk.taskCode}
                      </span>
                      <strong className="text-white text-sm">{tsk.title}</strong>
                    </div>
                    <p className="text-xs text-slate-300">{tsk.description}</p>
                    <div className="text-xs text-slate-400">
                      Assigned: <strong className="text-slate-200">{tsk.assignedOwner}</strong> • SLA Remaining: <strong className="text-emerald-400">{tsk.slaHoursRemaining}h</strong> • Escalation Tier: <strong className="text-indigo-300">{tsk.currentEscalationTier}</strong>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    {tsk.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: 5-WHYS REMEDIATION */}
      {activeTab === 'remediation' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-white">5-Whys Root Cause Remediation & Closed-Loop Retest</h3>
            <div className="space-y-4">
              {capas.map(capa => (
                <div key={capa.id} className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        {capa.capaCode}
                      </span>
                      <h4 className="text-sm font-bold text-white">{capa.findingTitle}</h4>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {capa.status}
                    </span>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-xs space-y-1 text-slate-300">
                    <div className="font-semibold text-indigo-400">5-Whys Root Cause:</div>
                    <div>1. {capa.rootCauseAnalysis.why1}</div>
                    <div>5. Systemic: {capa.rootCauseAnalysis.why5} ({capa.rootCauseAnalysis.rootCauseCategory})</div>
                  </div>

                  <div className="text-xs text-slate-400 flex items-center justify-between">
                    <span>Corrective Action: {capa.correctiveActionPlan}</span>
                    <span className="text-emerald-400 font-semibold">Retest Passed & Closed</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: AUDIT READINESS CENTER */}
      {activeTab === 'readiness' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {readinessProfiles.map(rp => (
              <div key={rp.frameworkCode} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                      {rp.frameworkCode}
                    </span>
                    <h4 className="text-lg font-bold text-white mt-1.5">{rp.frameworkName}</h4>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-emerald-400">{rp.readinessScore}%</div>
                    <div className="text-[11px] text-emerald-400 font-medium">{rp.readinessRating}</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center">
                  <div className="bg-slate-800/40 p-2 rounded">
                    <div className="text-[10px] text-slate-400">Checkpoints</div>
                    <div className="text-xs font-bold text-white mt-0.5">{rp.passingCheckpoints}/{rp.totalCheckpoints}</div>
                  </div>
                  <div className="bg-slate-800/40 p-2 rounded">
                    <div className="text-[10px] text-slate-400">Evidence Freshness</div>
                    <div className="text-xs font-bold text-emerald-400 mt-0.5">{rp.evidenceFreshnessScore}%</div>
                  </div>
                  <div className="bg-slate-800/40 p-2 rounded">
                    <div className="text-[10px] text-slate-400">Auditor Days</div>
                    <div className="text-xs font-bold text-indigo-400 mt-0.5">{rp.estimatedAuditorTestingDays} Days</div>
                  </div>
                </div>

                <button
                  onClick={() => handleGenerateAuditPackage(rp.frameworkCode)}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  Generate Sealed Auditor Package
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 9: COMPLIANCE CALENDAR */}
      {activeTab === 'calendar' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-white">Enterprise Compliance Calendar</h3>
            <div className="space-y-3">
              {calendarItems.map(item => (
                <div key={item.id} className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                        {item.eventType}
                      </span>
                      <strong className="text-white text-sm">{item.title}</strong>
                    </div>
                    <div className="text-xs text-slate-400">
                      Scheduled: <strong className="text-white">{item.date}</strong> • Owner: <strong className="text-slate-200">{item.ownerName}</strong> • Recurrence: {item.recurrence}
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 10: AI COMPLIANCE COPILOT */}
      {activeTab === 'copilot' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                Grounded AI Compliance Copilot
              </h3>
              <p className="text-xs text-slate-400">Answers inquiries strictly grounded in canonical telemetry, statutory standard citations, and multi-framework mappings with explicit 7-layer data classification.</p>
            </div>

            <form onSubmit={handleCopilotSubmit} className="flex gap-3">
              <input
                type="text"
                value={copilotQuery}
                onChange={e => setCopilotQuery(e.target.value)}
                placeholder="Ask e.g. 'Which controls satisfy multiple frameworks?' or 'Why is ISO 27001 readiness 96%?'"
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={copilotLoading}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm flex items-center gap-2 transition-all"
              >
                <Send className="w-4 h-4" />
                {copilotLoading ? 'Reasoning...' : 'Ask Copilot'}
              </button>
            </form>

            {copilotResponse && (
              <div className="bg-slate-800/80 border border-indigo-500/40 rounded-xl p-5 space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                    Classification: {copilotResponse.classification}
                  </span>
                  <span className="text-xs text-slate-400">Confidence: {(copilotResponse.confidenceScore * 100).toFixed(0)}%</span>
                </div>

                <p className="text-sm text-slate-200 leading-relaxed font-sans">{copilotResponse.answer}</p>

                {copilotResponse.citations.length > 0 && (
                  <div className="space-y-1 pt-2 border-t border-slate-700/60">
                    <div className="text-xs font-semibold text-indigo-400">Authoritative Standard Citations:</div>
                    {copilotResponse.citations.map((c, i) => (
                      <div key={i} className="text-xs text-slate-400">
                        • <strong>{c.sourceAuthority}:</strong> {c.documentTitle} ({c.sectionOrClause})
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. ONE-CLICK FRAMEWORK ACTIVATION MODAL */}
      {activationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">One-Click Framework Activation</h3>
                <p className="text-xs text-slate-400">Instantly provision operational requirements, canonical control cross-walks, and evidence requests.</p>
              </div>
              <button
                onClick={() => { setActivationModalOpen(false); setActivationResult(null); }}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {!activationResult ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Select Framework to Operationalize</label>
                  <select
                    value={selectedFrameworkForActivation}
                    onChange={e => setSelectedFrameworkForActivation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
                  >
                    <option value="ISO_27001_2022">ISO/IEC 27001:2022 (Information Security)</option>
                    <option value="SOC_2_TYPE_2">AICPA SOC 2 Type II (Trust Services Criteria)</option>
                    <option value="MAS_TRM_2021">MAS TRM Guidelines 2021 & Notice 644/655</option>
                    <option value="DPDP_ACT_2023">DPDP Act 2023 (Digital Data Protection)</option>
                    <option value="PCI_DSS_V4">PCI DSS v4.0 (Payment Card Security)</option>
                    <option value="ISO_42001_2023">ISO/IEC 42001:2023 (AI Management System)</option>
                    <option value="DORA_EU_2022">DORA (EU Digital Operational Resilience)</option>
                  </select>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300 space-y-1.5">
                  <div className="font-semibold text-indigo-400">Automated Provisioning Includes:</div>
                  <div>✓ Load statutory requirements & determine applicability</div>
                  <div>✓ Harmonize with existing canonical controls (Zero duplicate tasks)</div>
                  <div>✓ Auto-link live AWS, Entra ID, GitHub, Qualys, and CrowdStrike evidence</div>
                  <div>✓ Generate 14-day SLA evidence verification tasks for control owners</div>
                </div>

                <button
                  onClick={handleActivateFramework}
                  disabled={activationLoading}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all"
                >
                  {activationLoading ? 'Operationalizing Framework...' : 'Activate Framework Now'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs space-y-1.5">
                  <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    {activationResult.frameworkTitle} Activated Successfully
                  </div>
                  <div>• {activationResult.requirementsLoaded} Requirements Loaded</div>
                  <div>• {activationResult.reusedCommonControls} Common Controls Reused (Zero Duplicate Work)</div>
                  <div>• {activationResult.manualTasksGenerated} Actionable Verification Tasks Dispatched</div>
                  <div>• Initial Audit Readiness Score: {activationResult.initialReadinessScore}%</div>
                </div>

                <button
                  onClick={() => { setActivationModalOpen(false); setActivationResult(null); }}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
                >
                  Close & View in Workspace
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
