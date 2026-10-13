import React, { useState } from 'react';
import { 
  Network, 
  ShieldCheck, 
  FileText, 
  AlertTriangle, 
  FileSearch, 
  Layers, 
  ArrowRight,
  ExternalLink,
  GitCommit,
  CheckCircle2,
  Clock,
  Key,
  Database,
  Building2,
  Activity,
  History,
  AlertCircle,
  FileCheck2,
  Lock,
  ChevronRight
} from 'lucide-react';
import { MappingExplorerEngine } from '../../services/grc/MappingExplorerEngine';
import { Entity360Graph, EntityNode } from '../../types/grcCoreTypes';
import { PremiumDrawer } from '../ui/premium/PremiumDrawer';
import { PremiumBadge } from '../ui/premium/PremiumBadge';
import { PremiumButton } from '../ui/premium/PremiumButton';
import { GrcNavigationService } from '../../services/grc/grcNavigationService';
import { domainEventBus } from '../../services/canonical/DomainEventBus';

interface Entity360DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  entityId: string | null;
  entityType?: string;
  onSelectConnectedEntity?: (entityId: string, entityType: string) => void;
}

export const Entity360Drawer: React.FC<Entity360DrawerProps> = ({
  isOpen,
  onClose,
  entityId,
  entityType,
  onSelectConnectedEntity
}) => {
  const [activeTab, setActiveTab] = useState<'GRAPH' | 'LINEAGE' | 'RISKS' | 'DOCS' | 'EVIDENCE' | 'TESTING' | 'CAPA' | 'TIMELINE'>('GRAPH');

  if (!isOpen || !entityId) return null;

  const graph: Entity360Graph = MappingExplorerEngine.get360GraphForEntity(entityId, entityType);
  const metadata = graph.metadata || {};
  const events = domainEventBus.getEventsByEntity(graph.rootEntity.type, graph.rootEntity.code).concat(
    domainEventBus.getEventsByEntity(graph.rootEntity.type, graph.rootEntity.id)
  );

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'FRAMEWORK':
      case 'REQUIREMENT':
        return <ShieldCheck className="w-4 h-4 text-cyan-400" />;
      case 'CONTROL':
      case 'CONTROL_IMPL':
        return <Network className="w-4 h-4 text-indigo-400" />;
      case 'EVIDENCE':
      case 'ASSERTION':
        return <FileText className="w-4 h-4 text-emerald-400" />;
      case 'RISK':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'AUDIT':
      case 'FINDING':
      case 'CAPA':
        return <FileSearch className="w-4 h-4 text-rose-400" />;
      case 'POLICY':
      case 'PROCEDURE':
      case 'SOP':
        return <FileCheck2 className="w-4 h-4 text-sky-400" />;
      case 'DEPARTMENT':
      case 'ORGANIZATION':
        return <Building2 className="w-4 h-4 text-purple-400" />;
      case 'PROCESS':
      case 'ACTIVITY':
        return <Activity className="w-4 h-4 text-teal-400" />;
      case 'EXCEPTION':
        return <AlertCircle className="w-4 h-4 text-amber-500" />;
      case 'PERSONAL_DATA':
      case 'DPDP_PERSONAL_DATA':
        return <Database className="w-4 h-4 text-emerald-400" />;
      case 'PROCESSING_ACTIVITY':
      case 'DPDP_ROPA':
        return <Activity className="w-4 h-4 text-indigo-400" />;
      case 'PRIVACY_NOTICE':
      case 'DPDP_NOTICE':
        return <FileText className="w-4 h-4 text-amber-400" />;
      case 'DSR_REQUEST':
      case 'DPDP_DSR':
        return <Clock className="w-4 h-4 text-cyan-400" />;
      case 'PROCESSOR':
      case 'DPDP_PROCESSOR':
        return <Building2 className="w-4 h-4 text-purple-400" />;
      default:
        return <Layers className="w-4 h-4 text-slate-400" />;
    }
  };

  const handleNavigateToWorkspace = () => {
    const type = graph.rootEntity.type;
    const code = graph.rootEntity.code;

    if (type === 'CONTROL' || type === 'CONTROL_IMPL') {
      GrcNavigationService.navigate({ module: 'controls_evidence', tab: 'controls', entityId: code });
    } else if (type === 'RISK') {
      GrcNavigationService.navigate({ module: 'risk', tab: 'register', entityId: code });
    } else if (type === 'POLICY' || type === 'PROCEDURE' || type === 'SOP') {
      GrcNavigationService.navigate({ module: 'governance', tab: 'policy_documents', entityId: code });
    } else if (type === 'EVIDENCE') {
      GrcNavigationService.navigate({ module: 'controls_evidence', tab: 'evidence', entityId: code });
    } else if (type === 'AUDIT' || type === 'FINDING') {
      GrcNavigationService.navigate({ module: 'audit_assurance', tab: 'audits', entityId: code });
    } else if (type === 'CAPA') {
      GrcNavigationService.navigate({ module: 'audit_assurance', tab: 'capa', entityId: code });
    } else if (type === 'DEPARTMENT' || type === 'PROCESS') {
      GrcNavigationService.navigate({ module: 'governance', tab: 'departments', entityId: code });
    } else if (type === 'EXCEPTION') {
      GrcNavigationService.navigate({ module: 'governance', tab: 'exceptions', entityId: code });
    } else if (
      type === 'PERSONAL_DATA' ||
      type === 'PROCESSING_ACTIVITY' ||
      type === 'PRIVACY_NOTICE' ||
      type === 'DSR_REQUEST' ||
      type === 'PROCESSOR' ||
      type.includes('DPDP')
    ) {
      GrcNavigationService.navigate({ module: 'compliance', tab: 'dpdp', entityId: code });
    } else {
      GrcNavigationService.navigate({ module: 'dashboard', entityId: code });
    }
    onClose();
  };

  return (
    <PremiumDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Network className="w-4 h-4" />
          </span>
          <span>Entity 360° Operational Inspector</span>
        </div>
      }
      subtitle={`Canonical Identity: ${graph.rootEntity.code || entityId}`}
      width="lg"
    >
      <div className="space-y-5">
        {/* Root Entity Header Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-850 border border-cyan-500/40 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-cyan-400">{graph.rootEntity.code}</span>
              <PremiumBadge variant="info">{graph.rootEntity.type}</PremiumBadge>
            </div>
            {graph.rootEntity.owner && (
              <span className="text-[11px] text-slate-400">Owner: <strong className="text-slate-200">{graph.rootEntity.owner}</strong></span>
            )}
          </div>
          <h3 className="text-base font-bold text-white">{graph.rootEntity.title}</h3>
          
          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-300">
            <div>
              Status: <strong className="text-emerald-400">{graph.rootEntity.status || 'ACTIVE'}</strong>
            </div>
            <button
              onClick={handleNavigateToWorkspace}
              className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 hover:underline transition-colors"
            >
              <span>Open in Workspace</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800/80 overflow-x-auto">
          {[
            { id: 'GRAPH', label: '360° Graph', count: graph.connectedNodes.length },
            { id: 'LINEAGE', label: 'GRC Lineage' },
            { id: 'RISKS', label: 'Risks & Controls', count: (metadata.risks?.length || 0) + (metadata.controls?.length || 0) },
            { id: 'DOCS', label: 'Governance & SOPs', count: metadata.policies?.length },
            { id: 'EVIDENCE', label: 'Evidence & Hash', count: metadata.evidence?.length },
            { id: 'TESTING', label: 'Fieldwork Tests', count: metadata.testing?.length },
            { id: 'CAPA', label: 'Findings & CAPA', count: (metadata.findings?.length || 0) + (metadata.capas?.length || 0) },
            { id: 'TIMELINE', label: 'Audit Trail', count: events.length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeTab === tab.id ? 'bg-slate-950/30 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab 1: 360° Relational Graph */}
        {activeTab === 'GRAPH' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Connected Canonical Nodes ({graph.connectedNodes.length})
              </h4>
              <span className="text-[11px] text-slate-500">Click any connected node to inspect</span>
            </div>

            <div className="space-y-2">
              {graph.connectedNodes.map((node) => {
                const edge = graph.edges.find(
                  e => (e.sourceId === node.id && e.targetId === graph.rootEntity.id) ||
                       (e.sourceId === graph.rootEntity.id && e.targetId === node.id)
                );

                return (
                  <div
                    key={node.id}
                    onClick={() => {
                      if (onSelectConnectedEntity) onSelectConnectedEntity(node.id, node.type);
                    }}
                    className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/60 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-slate-800 group-hover:bg-slate-700 transition-colors">
                        {getNodeIcon(node.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-200">{node.code}</span>
                          {edge && (
                            <span className="text-[10px] uppercase font-bold text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40">
                              {edge.relationship.replace(/_/g, ' ')}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 group-hover:text-slate-200 transition-colors line-clamp-1">
                          {node.title}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <PremiumBadge variant="neutral">{node.type}</PremiumBadge>
                      <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                );
              })}

              {graph.connectedNodes.length === 0 && (
                <div className="p-8 rounded-xl bg-slate-950/40 border border-dashed border-slate-800 text-center text-xs text-slate-500">
                  No direct relational dependencies currently registered for this entity.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Canonical GRC Lineage */}
        {activeTab === 'LINEAGE' && (
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Deterministic End-to-End Governance Lineage
            </h4>
            <div className="relative pl-6 border-l-2 border-cyan-500/40 space-y-4 my-2">
              {(metadata.lineagePath || [
                'Organization: Acme Financial Technologies',
                'Department: Cloud Security & DevSecOps',
                'Process: Privileged Access & JIT Elevation',
                `Entity: ${graph.rootEntity.code} (${graph.rootEntity.type})`,
                'Control Implementation: Enforced via Okta & Teleport',
                'Evidence: EV-2026-001 (SHA-256 Verified)',
                'Control Test: TEST-2026-Q3-088 (PASS - Effective)',
                'Continuous Assurance: Stage-2 Certification'
              ]).map((step, idx) => (
                <div key={idx} className="relative flex items-center gap-3">
                  <div className="absolute -left-[31px] p-1 rounded-full bg-slate-950 border-2 border-cyan-400 text-cyan-400">
                    <CheckCircle2 className="w-3 h-3" />
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 w-full flex items-center justify-between">
                    <span className="font-medium">{step}</span>
                    <span className="text-[10px] text-slate-500 font-mono">Stage {idx + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Risks & Controls */}
        {activeTab === 'RISKS' && (
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Associated Risks & Mitigating Controls
            </h4>
            
            {metadata.risks && metadata.risks.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-amber-400 uppercase">Enterprise Threats & Risks</span>
                {metadata.risks.map(r => (
                  <div key={r.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-amber-400">{r.code}</span>
                      <PremiumBadge variant={r.level === 'CRITICAL' ? 'critical' : 'warning'}>{r.level}</PremiumBadge>
                    </div>
                    <p className="text-xs text-white font-medium">{r.title}</p>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>Inherent: <strong className="text-rose-400">{r.inherentScore}</strong> | Residual: <strong className="text-emerald-400">{r.residualScore}</strong></span>
                      <span>Treatment: <strong className="text-slate-200">{r.treatment}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {metadata.controls && metadata.controls.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-bold text-indigo-400 uppercase">Governed & Applied Controls</span>
                {metadata.controls.map(c => (
                  <div key={c.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-indigo-400">{c.code}</span>
                      <PremiumBadge variant="success">{c.effectiveness}</PremiumBadge>
                    </div>
                    <p className="text-xs text-white font-medium">{c.title}</p>
                    <div className="text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Status: <strong className="text-slate-200">{c.status}</strong></span>
                      <span>Owner: <strong className="text-slate-200">{c.owner}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {(!metadata.risks || metadata.risks.length === 0) && (!metadata.controls || metadata.controls.length === 0) && (
              <div className="p-8 rounded-xl bg-slate-950/40 border border-dashed border-slate-800 text-center text-xs text-slate-500">
                No direct risk or control mappings evaluated for this entity.
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Governance & SOPs */}
        {activeTab === 'DOCS' && (
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Authoritative Documents, Policies & SOPs
            </h4>
            {metadata.policies && metadata.policies.length > 0 ? (
              <div className="space-y-2">
                {metadata.policies.map(p => (
                  <div key={p.id} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-sky-400">{p.code}</span>
                        <PremiumBadge variant="info">{p.type}</PremiumBadge>
                      </div>
                      <span className="text-xs font-bold text-emerald-400">{p.status}</span>
                    </div>
                    <p className="text-xs text-white font-medium">{p.title}</p>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                      <span>Version: <strong>v{p.version}</strong></span>
                      <span>Owner: <strong>{p.owner}</strong></span>
                      {p.acknowledgementRate !== undefined && (
                        <span>Ack: <strong className="text-emerald-400">{p.acknowledgementRate}%</strong></span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-xl bg-slate-950/40 border border-dashed border-slate-800 text-center text-xs text-slate-500">
                No linked governance policies or SOPs currently mapped to this entity.
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Evidence & Cryptography */}
        {activeTab === 'EVIDENCE' && (
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Cryptographic Evidence Ledger
            </h4>
            {metadata.evidence && metadata.evidence.length > 0 ? (
              <div className="space-y-2">
                {metadata.evidence.map(e => (
                  <div key={e.id} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-emerald-400">{e.code}</span>
                      <PremiumBadge variant={e.isExpired ? 'critical' : 'success'}>
                        {e.isExpired ? 'EXPIRED' : e.status}
                      </PremiumBadge>
                    </div>
                    <p className="text-xs text-white font-medium">{e.name}</p>
                    <div className="p-2 rounded bg-slate-950 font-mono text-[10px] text-slate-400 flex items-center justify-between">
                      <span>SHA-256: {e.hash.slice(0, 24)}...</span>
                      <Lock className="w-3 h-3 text-emerald-400" />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Valid Until: <strong>{new Date(e.validUntil).toLocaleDateString()}</strong></span>
                      {e.verifiedBy && <span>Verified By: <strong>{e.verifiedBy}</strong></span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-xl bg-slate-950/40 border border-dashed border-slate-800 text-center text-xs text-slate-500">
                No evidence artifacts currently attached to this entity.
              </div>
            )}
          </div>
        )}

        {/* Tab 6: Fieldwork Testing */}
        {activeTab === 'TESTING' && (
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Control Effectiveness Testing & Fieldwork
            </h4>
            {metadata.testing && metadata.testing.length > 0 ? (
              <div className="space-y-2">
                {metadata.testing.map(t => (
                  <div key={t.id} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-cyan-400">{t.id}</span>
                      <PremiumBadge variant={t.result === 'PASS' ? 'success' : 'warning'}>
                        {t.result} ({t.effectiveness})
                      </PremiumBadge>
                    </div>
                    <p className="text-xs text-white font-medium">{t.title}</p>
                    {t.testProcedure && (
                      <p className="text-[11px] text-slate-400 bg-slate-950/60 p-2 rounded">{t.testProcedure}</p>
                    )}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>Tester: <strong>{t.tester}</strong></span>
                      <span>Sample Size: <strong>{t.sampleSize || 'N/A'}</strong></span>
                      <span>Date: <strong>{new Date(t.date).toLocaleDateString()}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-xl bg-slate-950/40 border border-dashed border-slate-800 text-center text-xs text-slate-500">
                No formal control testing records registered for this entity.
              </div>
            )}
          </div>
        )}

        {/* Tab 7: Findings & CAPA */}
        {activeTab === 'CAPA' && (
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Findings, Root Cause Analysis & CAPA Remediation
            </h4>
            {metadata.findings && metadata.findings.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-rose-400 uppercase">Non-Conformities & Findings</span>
                {metadata.findings.map(f => (
                  <div key={f.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-rose-400">{f.code}</span>
                      <PremiumBadge variant="critical">{f.severity}</PremiumBadge>
                    </div>
                    <p className="text-xs text-white font-medium">{f.title}</p>
                    <div className="text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Status: <strong className="text-slate-200">{f.status}</strong></span>
                      <span>Identified By: <strong className="text-slate-200">{f.owner || f.identifiedBy}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {metadata.capas && metadata.capas.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-bold text-teal-400 uppercase">Remediation CAPAs & Retests</span>
                {metadata.capas.map(c => (
                  <div key={c.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-teal-400">{c.code}</span>
                      <PremiumBadge variant={c.status === 'EFFECTIVE_CLOSED' ? 'success' : 'warning'}>{c.status}</PremiumBadge>
                    </div>
                    <p className="text-xs text-white font-medium">{c.title}</p>
                    {c.rootCause && (
                      <p className="text-[11px] text-slate-400 bg-slate-950 p-2 rounded">{c.rootCause}</p>
                    )}
                    <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                      <span>Owner: <strong className="text-slate-200">{c.owner}</strong></span>
                      <span>Due Date: <strong className="text-amber-400">{c.dueDate}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {(!metadata.findings || metadata.findings.length === 0) && (!metadata.capas || metadata.capas.length === 0) && (
              <div className="p-8 rounded-xl bg-slate-950/40 border border-dashed border-slate-800 text-center text-xs text-slate-500">
                Zero active non-conformities or pending CAPAs for this entity.
              </div>
            )}
          </div>
        )}

        {/* Tab 8: Audit Trail */}
        {activeTab === 'TIMELINE' && (
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Immutable Domain Event Ledger
            </h4>
            {events.length > 0 ? (
              <div className="space-y-2.5">
                {events.map((evt) => (
                  <div key={evt.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold text-cyan-400">{evt.eventType}</span>
                      <span className="text-[10px] text-slate-500">{new Date(evt.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-slate-200">{evt.summary}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                      <span>Actor: <strong className="text-slate-300">{evt.actor}</strong> ({evt.actorRole})</span>
                      <span className="font-mono text-[9px] text-slate-500">WORM Checksum: {evt.integrityChecksum.slice(0, 14)}...</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-xl bg-slate-950/40 border border-dashed border-slate-800 text-center text-xs text-slate-500">
                No recent domain audit events recorded for this entity.
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
          <PremiumButton size="sm" variant="secondary" onClick={handleNavigateToWorkspace}>
            <span className="flex items-center gap-1.5">
              <span>View in Workspace</span>
              <ChevronRight className="w-4 h-4" />
            </span>
          </PremiumButton>

          <PremiumButton size="sm" variant="primary" onClick={onClose}>
            Close Inspection
          </PremiumButton>
        </div>
      </div>
    </PremiumDrawer>
  );
};
