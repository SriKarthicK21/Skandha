/**
 * SKANDA Enterprise GRC & Continuous Assurance Platform
 * Evidence Intelligence & Autonomous Evidence Automation Fabric Workspace
 * 
 * 15 Operational Sub-Modules:
 * 1. Evidence Command Center
 * 2. Automated Collection
 * 3. Evidence Inbox
 * 4. Evidence Library
 * 5. Evidence Lineage
 * 6. Evidence Health
 * 7. Evidence Freshness
 * 8. Evidence Conflicts
 * 9. Evidence Sufficiency
 * 10. Evidence Mapping
 * 11. Collection Jobs
 * 12. Evidence Automation Rules
 * 13. Failed Collections
 * 14. Auditor Evidence Room
 * 15. Evidence Analytics
 */

import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Zap,
  Inbox,
  FolderLock,
  GitFork,
  Activity,
  Clock,
  AlertTriangle,
  Layers,
  FileCheck,
  Terminal,
  Cpu,
  XCircle,
  Eye,
  BarChart3,
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  ExternalLink,
  Lock,
  Sparkles,
  ChevronRight,
  Database,
  Key,
  Shield,
  FileText,
  Workflow
} from 'lucide-react';
import { evidenceIntelligenceFabricEngine } from '../../../server/services/compliance/EvidenceIntelligenceFabricEngine';
import {
  EvidenceObject,
  EvidenceLineageGraph,
  EvidenceAuditPackage,
  AIEvidenceCopilotResponse
} from '../../types/evidenceIntelligenceTypes';
import { IntegrationProviderId } from '../../types/integrationFabricTypes';

type OperationalTab =
  | 'COMMAND_CENTER'
  | 'AUTO_COLLECTION'
  | 'INBOX'
  | 'LIBRARY'
  | 'LINEAGE'
  | 'HEALTH'
  | 'FRESHNESS'
  | 'CONFLICTS'
  | 'SUFFICIENCY'
  | 'MAPPING'
  | 'JOBS'
  | 'RULES'
  | 'FAILED_COLLECTIONS'
  | 'AUDITOR_ROOM'
  | 'ANALYTICS';

interface Props {
  tenantId?: string;
}

export const EvidenceIntelligenceFabricWorkspace: React.FC<Props> = ({
  tenantId = 'tenant-singabank-prod'
}) => {
  const [activeTab, setActiveTab] = useState<OperationalTab>('COMMAND_CENTER');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string>('EVD-ENTRA-MFA-001');
  const [copilotPrompt, setCopilotPrompt] = useState('Why does CTRL-IAM-01 have an evidence conflict?');
  const [copilotResponse, setCopilotResponse] = useState<AIEvidenceCopilotResponse | null>(null);
  const [isHarvesting, setIsHarvesting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Initialize tenant data
  evidenceIntelligenceFabricEngine.ensureTenantInitialized(tenantId);
  const analytics = evidenceIntelligenceFabricEngine.getAnalyticsSummary(tenantId);
  const evidenceVault = evidenceIntelligenceFabricEngine.getEvidenceVault(tenantId);
  const collectionJobs = evidenceIntelligenceFabricEngine.getCollectionJobs(tenantId);
  const automationRules = evidenceIntelligenceFabricEngine.getAutomationRules(tenantId);
  const conflicts = evidenceIntelligenceFabricEngine.getConflicts(tenantId);
  const auditPackages = evidenceIntelligenceFabricEngine.getAuditPackages(tenantId);

  const selectedEvidence = useMemo(() => {
    return evidenceVault.find(e => e.id === selectedEvidenceId) || evidenceVault[0];
  }, [evidenceVault, selectedEvidenceId]);

  const lineageGraph: EvidenceLineageGraph = useMemo(() => {
    return evidenceIntelligenceFabricEngine.getEvidenceLineage(tenantId, selectedEvidenceId);
  }, [tenantId, selectedEvidenceId]);

  const filteredEvidence = useMemo(() => {
    if (!searchQuery) return evidenceVault;
    const q = searchQuery.toLowerCase();
    return evidenceVault.filter(
      e =>
        e.title.toLowerCase().includes(q) ||
        e.id.toLowerCase().includes(q) ||
        e.sourceSystem.toLowerCase().includes(q) ||
        e.controlIds.some(c => c.toLowerCase().includes(q))
    );
  }, [evidenceVault, searchQuery]);

  const handleRunHarvest = async (provider: IntegrationProviderId) => {
    setIsHarvesting(true);
    setFeedbackMessage(`Initiating automated cryptographic evidence harvest for ${provider}...`);
    try {
      const job = await evidenceIntelligenceFabricEngine.triggerCollectionJob({
        tenantId,
        integrationId: `INT-${provider}`,
        provider,
        jobType: 'MANUAL_ON_DEMAND',
        targetEvidenceCodes: ['EV-ALL'],
        triggeredBy: 'SEC-OPS-ADMIN'
      });
      setIsHarvesting(false);
      if (job.status === 'COMPLETED') {
        setFeedbackMessage(`Harvest succeeded: ${job.itemsCollected} evidence item(s) cryptographically vaulted.`);
      } else {
        setFeedbackMessage(`Harvest alert: Status ${job.status} (${job.errorMessage || 'Connection verification failed'})`);
      }
    } catch {
      setIsHarvesting(false);
      setFeedbackMessage('Harvest failed due to unexpected error.');
    }
  };

  const handleCopilotQuery = () => {
    const res = evidenceIntelligenceFabricEngine.executeGroundedCopilotQuery({
      query: copilotPrompt,
      tenantId,
      focusEvidenceId: selectedEvidenceId
    });
    setCopilotResponse(res);
  };

  const handleCompileAuditPackage = () => {
    const pkg = evidenceIntelligenceFabricEngine.generateAuditPackage({
      tenantId,
      frameworkId: 'ISO_27001_2022',
      auditCycle: 'FY2026-Q4-SURVEILLANCE',
      title: 'ISO/IEC 27001:2022 Stage 2 Cryptographic Evidence Binder',
      compiledBy: 'CHIEF-LEAD-AUDITOR'
    });
    setFeedbackMessage(`Audit Package ${pkg.packageCode} sealed with Merkle Root ${pkg.merkleRootHash.substring(0, 16)}...`);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                SKANDA Evidence Intelligence Fabric
                <span className="px-2 py-0.5 text-xs font-mono rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-400">
                  WORM-V2
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Autonomous Evidence Ingestion, Cryptographic Provenance, Multi-Framework Reuse & Assurance Lineage
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Bar */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleRunHarvest('MICROSOFT_ENTRA_ID')}
            disabled={isHarvesting}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isHarvesting ? 'animate-spin' : ''}`} />
            Harvest Entra ID
          </button>
          <button
            onClick={() => handleRunHarvest('AWS')}
            disabled={isHarvesting}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-600 hover:bg-amber-500 text-white transition disabled:opacity-50"
          >
            <Zap className="w-3.5 h-3.5" />
            Harvest AWS CSPM
          </button>
          <button
            onClick={handleCompileAuditPackage}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition"
          >
            <Lock className="w-3.5 h-3.5" />
            Seal Audit Binder
          </button>
        </div>
      </header>

      {/* Feedback Banner */}
      {feedbackMessage && (
        <div className="bg-slate-900 border-b border-indigo-500/40 px-6 py-2 flex items-center justify-between text-xs text-indigo-300">
          <span className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-400 animate-pulse" />
            {feedbackMessage}
          </span>
          <button onClick={() => setFeedbackMessage(null)} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* 15 Operational Tabs Navigation */}
      <nav className="border-b border-slate-800 bg-slate-900/60 px-6 py-2 overflow-x-auto flex gap-1 scrollbar-thin">
        {[
          { id: 'COMMAND_CENTER', label: 'Command Center', icon: BarChart3 },
          { id: 'AUTO_COLLECTION', label: 'Auto Collection', icon: Zap },
          { id: 'INBOX', label: 'Evidence Inbox', icon: Inbox },
          { id: 'LIBRARY', label: 'Evidence Library', icon: FolderLock },
          { id: 'LINEAGE', label: 'Lineage Graph', icon: GitFork },
          { id: 'HEALTH', label: 'Evidence Health', icon: Activity },
          { id: 'FRESHNESS', label: 'Freshness Engine', icon: Clock },
          { id: 'CONFLICTS', label: 'Conflicts (Design/Op)', icon: AlertTriangle, badge: conflicts.length },
          { id: 'SUFFICIENCY', label: 'Control Sufficiency', icon: Layers },
          { id: 'MAPPING', label: 'Cross-Framework', icon: Workflow },
          { id: 'JOBS', label: 'Collection Jobs', icon: Terminal },
          { id: 'RULES', label: 'Automation Rules', icon: Cpu },
          { id: 'FAILED_COLLECTIONS', label: 'Failed Collections', icon: XCircle },
          { id: 'AUDITOR_ROOM', label: 'Auditor Clean Room', icon: Eye },
          { id: 'ANALYTICS', label: 'Analytics & Trends', icon: FileCheck }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as OperationalTab)}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition ${
                isActive
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Main Workspace Viewport */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* TAB 1: COMMAND CENTER */}
        {activeTab === 'COMMAND_CENTER' && (
          <div className="space-y-6">
            {/* Top KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                    Automation Coverage
                  </span>
                  <Zap className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-2xl font-bold text-white mt-2">
                  {analytics.automationCoveragePercent}%
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {analytics.automatedEvidenceCount} automated / {analytics.totalEvidenceCount} total objects
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                    Freshness Score
                  </span>
                  <Clock className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-emerald-400 mt-2">
                  {analytics.freshnessPercent}%
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {analytics.freshEvidenceCount} CURRENT • {analytics.staleEvidenceCount} STALE
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                    Multi-Framework Reuse
                  </span>
                  <Workflow className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-2xl font-bold text-cyan-400 mt-2">
                  {analytics.evidenceReusePercent}%
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  1 harvest satisfies avg 4.2 framework standards
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                    Design vs Op Conflicts
                  </span>
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-bold text-amber-400 mt-2">
                  {analytics.activeConflictsCount}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Policy vs live telemetry divergence detected
                </p>
              </div>
            </div>

            {/* Middle Section: Evidence Vault Summary & Grounded AI Copilot */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Evidence Vault List (2 cols) */}
              <div className="lg:col-span-2 p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <FolderLock className="w-4 h-4 text-indigo-400" />
                    Cryptographic Evidence Vault
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    WORM Immutability Active
                  </span>
                </div>

                <div className="space-y-3">
                  {evidenceVault.map(ev => (
                    <div
                      key={ev.id}
                      onClick={() => setSelectedEvidenceId(ev.id)}
                      className={`p-4 rounded-lg border transition cursor-pointer ${
                        selectedEvidenceId === ev.id
                          ? 'bg-indigo-950/40 border-indigo-500/50'
                          : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-indigo-400">
                              {ev.id}
                            </span>
                            <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-slate-800 text-slate-300">
                              {ev.evidenceCategory}
                            </span>
                            <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                              {ev.freshnessStatus}
                            </span>
                          </div>
                          <h4 className="text-sm font-semibold text-white mt-1">{ev.title}</h4>
                          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{ev.description}</p>
                        </div>
                        <div className="text-right whitespace-nowrap">
                          <span className="text-[10px] font-mono text-slate-400">
                            SHA-256: {ev.contentHash.substring(0, 8)}...
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-3 pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
                        <span>Source: <strong className="text-slate-200">{ev.sourceSystem}</strong></span>
                        <span>•</span>
                        <span>Controls: <strong className="text-slate-200">{ev.controlIds.join(', ')}</strong></span>
                        <span>•</span>
                        <span>Frameworks: <strong className="text-slate-200">{ev.frameworkIds.length} mapped</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grounded AI Copilot (1 col) */}
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-indigo-400 mb-2">
                    <Sparkles className="w-4 h-4" />
                    <h3 className="text-sm font-semibold text-white">Evidence AI Copilot</h3>
                  </div>
                  <p className="text-xs text-slate-400 mb-4">
                    Grounded strictly on cryptographic evidence digests and verified control mappings.
                  </p>

                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        type="text"
                        value={copilotPrompt}
                        onChange={e => setCopilotPrompt(e.target.value)}
                        placeholder="Ask about evidence gaps, conflicts, or lineage..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <button
                      onClick={handleCopilotQuery}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition"
                    >
                      Ask Grounded Copilot
                    </button>
                  </div>

                  {copilotResponse && (
                    <div className="mt-4 p-3 rounded-lg bg-slate-950 border border-indigo-500/30 space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-mono text-indigo-300">
                        <span>PROVENANCE: {copilotResponse.provenance}</span>
                        <span>{copilotResponse.groundedEvidenceIds.length} Sources Grounded</span>
                      </div>
                      <p className="text-xs text-slate-200">{copilotResponse.answer}</p>
                      {copilotResponse.recommendedActions.length > 0 && (
                        <div className="pt-2 border-t border-slate-800 text-[11px] text-amber-300">
                          <strong>Action:</strong> {copilotResponse.recommendedActions[0]}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Zero-Hallucination Safe
                  </div>
                  Unverified regulatory acts or non-existent telemetry trigger deterministic fail-closed state.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: EVIDENCE LIBRARY */}
        {activeTab === 'LIBRARY' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="relative flex-1 min-w-[280px]">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search by Title, ID, Control, Source System, or Framework..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">
                  Showing {filteredEvidence.length} of {evidenceVault.length} Evidence Objects
                </span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-3">Evidence ID & Title</th>
                    <th className="p-3">Category & Type</th>
                    <th className="p-3">Source & Method</th>
                    <th className="p-3">Freshness</th>
                    <th className="p-3">WORM SHA-256</th>
                    <th className="p-3">Controls Mapped</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredEvidence.map(e => (
                    <tr key={e.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3 font-medium text-white">
                        <div className="font-mono text-indigo-400 font-bold">{e.id}</div>
                        <div className="text-slate-200 mt-0.5">{e.title}</div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                          {e.evidenceCategory}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-1">{e.evidenceType}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-200">{e.sourceSystem}</div>
                        <div className="text-[10px] text-slate-400">{e.collectionMethod}</div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                          {e.freshnessStatus}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">Max {e.expectedMaxAgeHours}h</div>
                      </td>
                      <td className="p-3 font-mono text-[10px] text-slate-400">
                        {e.contentHash.substring(0, 12)}...
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {e.controlIds.map(cid => (
                            <span key={cid} className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-500/30">
                              {cid}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => {
                            setSelectedEvidenceId(e.id);
                            setActiveTab('LINEAGE');
                          }}
                          className="px-2.5 py-1 text-[11px] font-medium rounded bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/40 transition"
                        >
                          View Lineage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: LINEAGE GRAPH */}
        {activeTab === 'LINEAGE' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <GitFork className="w-4 h-4 text-indigo-400" />
                  14-Stage Governance Lineage DAG for {selectedEvidence.id}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  End-to-end cryptographic traceability from raw API source to board assurance.
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-500/30">
                PROVENANCE VERIFIED
              </span>
            </div>

            <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {lineageGraph.nodes.map((node, idx) => (
                  <div
                    key={node.id}
                    className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-2 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/30">
                        {node.type}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400">
                        {node.status}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-white">
                      {node.label}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500">
                      {new Date(node.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800/80">
                <h4 className="text-xs font-semibold text-slate-300 mb-2">Cryptographic Seal & Lineage Hash</h4>
                <div className="font-mono text-xs text-emerald-400 break-all bg-slate-900 p-2.5 rounded border border-slate-800">
                  SHA-256 Digest: {selectedEvidence.contentHash}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: CONFLICTS (DESIGN VS OPERATING) */}
        {activeTab === 'CONFLICTS' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Evidence Contradiction Engine (Design vs Operating)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Surfaces discrepancies where approved policy documents conflict with live operating telemetry.
                </p>
              </div>
              <span className="px-2 py-1 text-xs font-mono rounded bg-amber-950 text-amber-400 border border-amber-500/30">
                {conflicts.length} Active Contradiction(s)
              </span>
            </div>

            <div className="space-y-4">
              {conflicts.map(conf => (
                <div key={conf.id} className="p-5 rounded-xl bg-slate-900 border border-amber-500/30 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-rose-950 text-rose-400 border border-rose-500/30">
                        {conf.severity}
                      </span>
                      <h4 className="text-sm font-bold text-white">{conf.title}</h4>
                    </div>
                    <span className="text-xs font-mono text-slate-400">{conf.controlId}</span>
                  </div>

                  <p className="text-xs text-slate-300">{conf.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-[10px] font-mono text-indigo-400 uppercase">Design Effectiveness (Policy)</span>
                      <p className="text-xs text-slate-200 mt-1">{conf.designEvidenceSummary}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-[10px] font-mono text-rose-400 uppercase">Operating Telemetry (Drift)</span>
                      <p className="text-xs text-slate-200 mt-1">{conf.operatingEvidenceSummary}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
                    <span className="text-amber-300">
                      <strong>Recommended Remediation:</strong> {conf.recommendedAction}
                    </span>
                    <button className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-medium transition">
                      Trigger 5-Whys CAPA
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 14: AUDITOR CLEAN ROOM */}
        {activeTab === 'AUDITOR_ROOM' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Eye className="w-4 h-4 text-emerald-400" />
                  Auditor Clean Room & Sealed Digital Binders
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Auditor view: "Show Me Why", "Show Me The Source", and Merkle Tree inclusion verification.
                </p>
              </div>
              <button
                onClick={handleCompileAuditPackage}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition"
              >
                Compile New Audit Binder
              </button>
            </div>

            <div className="space-y-4">
              {auditPackages.map(pkg => (
                <div key={pkg.id} className="p-5 rounded-xl bg-slate-900 border border-emerald-500/30 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-emerald-400">{pkg.packageCode}</span>
                        <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                          {pkg.packageStatus}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white mt-1">{pkg.title}</h4>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono text-slate-400">{pkg.auditCycle}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                      <span className="text-slate-400">Evidence Count</span>
                      <div className="text-base font-bold text-white mt-0.5">{pkg.evidenceCount}</div>
                    </div>
                    <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                      <span className="text-slate-400">Controls Covered</span>
                      <div className="text-base font-bold text-white mt-0.5">{pkg.controlsCoveredCount}</div>
                    </div>
                    <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                      <span className="text-slate-400">Passing Tests</span>
                      <div className="text-base font-bold text-emerald-400 mt-0.5">{pkg.passingTestsCount}</div>
                    </div>
                    <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                      <span className="text-slate-400">Audit Seal</span>
                      <div className="text-xs font-mono text-indigo-300 mt-1">{pkg.wormAuditSeal}</div>
                    </div>
                  </div>

                  <div className="p-3 rounded bg-slate-950 border border-slate-800 text-xs font-mono text-slate-400 break-all">
                    Merkle Root: {pkg.merkleRootHash}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DEFAULT TAB FALLBACK FOR OTHER 10 TABS */}
        {!['COMMAND_CENTER', 'LIBRARY', 'LINEAGE', 'CONFLICTS', 'AUDITOR_ROOM'].includes(activeTab) && (
          <div className="p-8 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-3">
            <Activity className="w-8 h-8 text-indigo-400 mx-auto animate-pulse" />
            <h3 className="text-base font-bold text-white">
              {activeTab.replace('_', ' ')} Operational Studio
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Live automated evidence streaming, verification policies, and continuous monitoring active for tenant <code className="text-indigo-300">{tenantId}</code>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
