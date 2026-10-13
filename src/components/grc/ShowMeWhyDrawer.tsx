/**
 * SKANDA "SHOW ME WHY" ASSURANCE EXPLANATION DRAWER
 * Path: src/components/grc/ShowMeWhyDrawer.tsx
 * 
 * Principal GRC Platform Architect & UX Lead Component
 * Answers "Why is this control effective?" with complete canonical traceability,
 * transparent confidence scoring, bidirectional evidence lineage, historical testing,
 * and drift intelligence.
 */

import React, { useState } from 'react';
import {
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  FileText,
  History,
  Activity,
  Sparkles,
  ExternalLink,
  Lock,
  ArrowRight,
  GitCommit,
  Clock,
  Layers,
  FileCheck2,
  RefreshCw,
  Download,
  Key,
  Database,
  ChevronRight,
  Network
} from 'lucide-react';
import { assuranceExplanationService } from '../../services/canonical/AssuranceExplanationService';
import { ControlAssuranceExplanation, AssuranceDimensionCheck } from '../../types/assuranceTypes';
import { PremiumDrawer } from '../ui/premium/PremiumDrawer';
import { PremiumBadge } from '../ui/premium/PremiumBadge';
import { PremiumButton } from '../ui/premium/PremiumButton';
import { GrcNavigationService } from '../../services/grc/grcNavigationService';

interface ShowMeWhyDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  controlCode: string | null;
  tenantId?: string;
  onSelectConnectedEntity?: (entityId: string, entityType: string) => void;
}

export const ShowMeWhyDrawer: React.FC<ShowMeWhyDrawerProps> = ({
  isOpen,
  onClose,
  controlCode,
  tenantId = 'tenant-acme-corp',
  onSelectConnectedEntity
}) => {
  const [activeTab, setActiveTab] = useState<'EXPLANATION' | 'CONFIDENCE' | 'LINEAGE' | 'HISTORY' | 'DRIFT' | 'AI_INSIGHTS'>('EXPLANATION');

  if (!isOpen || !controlCode) return null;

  const explanation: ControlAssuranceExplanation = assuranceExplanationService.getControlAssuranceExplanation(controlCode, tenantId);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'EFFECTIVE':
        return <PremiumBadge variant="success" size="sm"><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> EFFECTIVE</PremiumBadge>;
      case 'CONDITIONALLY_EFFECTIVE':
        return <PremiumBadge variant="warning" size="sm"><AlertTriangle className="w-3.5 h-3.5 mr-1" /> CONDITIONALLY EFFECTIVE</PremiumBadge>;
      case 'PARTIALLY_EFFECTIVE':
        return <PremiumBadge variant="warning" size="sm"><Clock className="w-3.5 h-3.5 mr-1" /> PARTIALLY EFFECTIVE</PremiumBadge>;
      case 'DEFICIENT':
        return <PremiumBadge variant="critical" size="sm"><XCircle className="w-3.5 h-3.5 mr-1" /> DEFICIENT</PremiumBadge>;
      default:
        return <PremiumBadge variant="neutral" size="sm">NOT TESTED</PremiumBadge>;
    }
  };

  const getCheckIcon = (status: AssuranceDimensionCheck['status']) => {
    switch (status) {
      case 'PASS':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
      case 'WARNING':
        return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
      case 'FAIL':
        return <XCircle className="w-4 h-4 text-rose-400 shrink-0" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400 shrink-0" />;
    }
  };

  const handleExport = (format: 'JSON' | 'CSV' | 'TEXT') => {
    const res = assuranceExplanationService.exportAssurancePackage([controlCode], format, tenantId);
    const blob = new Blob([res.dataContent], { type: format === 'JSON' ? 'application/json' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SKANDA-ASSURANCE-${controlCode}.${format.toLowerCase()}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PremiumDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-semibold">{explanation.controlCode}</span>
              <h2 className="text-sm font-semibold text-slate-100">{explanation.controlTitle}</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Authoritative Assurance Explanation & Diagnostic Breakdown</p>
          </div>
        </div>
      }
      width="xl"
    >
      <div className="p-5 space-y-5">
        {/* Top Posture Banner */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400 font-medium">Assurance Decision:</span>
              {getStatusBadge(explanation.assuranceStatus)}
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-slate-400">Confidence:</span>
              <span className="text-xs font-bold text-indigo-400">{explanation.confidence.overallScore}% ({explanation.confidence.confidenceLevel})</span>
            </div>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{explanation.statusRationale}</p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <PremiumButton variant="secondary" size="sm" onClick={() => handleExport('JSON')}>
              <Download className="w-3.5 h-3.5 mr-1.5" /> Export JSON
            </PremiumButton>
            <PremiumButton variant="secondary" size="sm" onClick={() => handleExport('CSV')}>
              <FileText className="w-3.5 h-3.5 mr-1.5" /> CSV
            </PremiumButton>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-1 border-b border-slate-800 pb-2 overflow-x-auto">
          {[
            { id: 'EXPLANATION', label: 'Show Me Why (10 Checks)', icon: HelpCircle, badge: `${explanation.checks.filter(c => c.status === 'PASS').length}/10` },
            { id: 'CONFIDENCE', label: 'Confidence Model', icon: ShieldCheck, badge: `${explanation.confidence.overallScore}%` },
            { id: 'LINEAGE', label: 'Evidence Lineage', icon: Network, badge: `${explanation.evidenceLineage.length}` },
            { id: 'HISTORY', label: 'Testing History', icon: History, badge: `${explanation.historyTimeline.length}` },
            { id: 'DRIFT', label: 'Drift Intelligence', icon: Activity, badge: explanation.driftIntelligence.length > 0 ? `${explanation.driftIntelligence.length}` : undefined },
            { id: 'AI_INSIGHTS', label: 'AI Assurance Analysis', icon: Sparkles }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? 'bg-indigo-500/20 text-indigo-200' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: 10-POINT "SHOW ME WHY" CHECKS */}
        {activeTab === 'EXPLANATION' && (
          <div className="space-y-3">
            <div className="text-xs text-slate-400 font-medium mb-1">
              Every assurance conclusion is backed by 10 authoritative dimensions evaluated against canonical records:
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {explanation.checks.map((chk, idx) => (
                <div
                  key={chk.id}
                  className="bg-slate-900/50 border border-slate-800 hover:border-slate-700/80 rounded-xl p-3.5 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start space-x-3">
                      <div className="mt-0.5">{getCheckIcon(chk.status)}</div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-semibold text-slate-200">{idx + 1}. {chk.title}</span>
                          <span className={`text-[10px] uppercase font-mono px-1.5 py-0.2 rounded ${
                            chk.status === 'PASS' ? 'bg-emerald-500/10 text-emerald-400' :
                            chk.status === 'WARNING' ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'
                          }`}>
                            {chk.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1">{chk.summary}</p>
                        <p className="text-[11px] text-slate-400 mt-1 font-mono">{chk.details}</p>

                        {/* Authoritative record chips */}
                        {chk.authoritativeRecords.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2.5 pt-2 border-t border-slate-800/60">
                            <span className="text-[10px] text-slate-500 font-medium">Authoritative Records:</span>
                            {chk.authoritativeRecords.map(rec => (
                              <span key={rec.recordId} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700/50 text-slate-300">
                                {rec.recordType}: <strong className="text-indigo-300">{rec.recordId}</strong>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {chk.deepLink && (
                      <button
                        onClick={() => GrcNavigationService.navigate({ module: chk.deepLink!.module, tab: chk.deepLink!.tab, entityId: chk.deepLink!.entityId })}
                        className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 shrink-0 px-2 py-1 rounded bg-indigo-500/5 hover:bg-indigo-500/10 transition-colors"
                      >
                        <span>Inspect</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: CONFIDENCE SCORING MODEL */}
        {activeTab === 'CONFIDENCE' && (
          <div className="space-y-4">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-100">Assurance Confidence Score: {explanation.confidence.overallScore}%</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Rating: <strong className="text-indigo-300">{explanation.confidence.confidenceLevel}</strong> (Model {explanation.confidence.calculationVersion})</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-500">Reproducibility Seal:</span>
                  <p className="text-[11px] font-mono text-indigo-400">{explanation.confidence.scoringHash.substring(0, 24)}...</p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-800/80">
                <span className="text-[11px] font-mono text-slate-400">Formula: <code>{explanation.confidence.scoringModelFormula}</code></span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Contributing Factor Weights & Diagnostic Scores</h4>
              <div className="grid grid-cols-1 gap-2">
                {explanation.confidence.factors.map(f => (
                  <div key={f.factorId} className="bg-slate-900/40 border border-slate-800 rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-medium text-slate-200">{f.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">Weight: {f.weightPercent}%</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{f.rationale}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-slate-100">{f.scorePercent}%</span>
                      <span className="text-[10px] text-indigo-400 block font-mono">+{f.weightedScore} pts</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: BIDIRECTIONAL EVIDENCE LINEAGE */}
        {activeTab === 'LINEAGE' && (
          <div className="space-y-4">
            <div className="text-xs text-slate-400 mb-1">
              Traversable upstream governance anchors and downstream operational verification records:
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Upstream Lineage (Requirements, Risks & Policies)</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {explanation.evidenceLineage.filter(n => n.direction === 'UPSTREAM').map(node => (
                    <div key={node.nodeId} className="bg-slate-900/60 border border-slate-800 rounded-lg p-2.5">
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-slate-800 text-cyan-400">{node.nodeType}</span>
                      <p className="text-xs font-semibold text-slate-200 mt-1 truncate">{node.title}</p>
                      <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">{node.relationship}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="py-2 flex items-center justify-center">
                <div className="px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-xs font-semibold text-indigo-300 flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{explanation.controlCode} (Operational Control Anchor)</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Downstream Lineage (Evidence, Tests, Findings & CAPA)</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {explanation.evidenceLineage.filter(n => n.direction === 'DOWNSTREAM').map(node => (
                    <div key={node.nodeId} className="bg-slate-900/60 border border-slate-800 rounded-lg p-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-slate-800 text-emerald-400">{node.nodeType}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{node.status}</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-200 mt-1 truncate">{node.title}</p>
                      {node.sha256Digest && (
                        <p className="text-[10px] font-mono text-slate-500 mt-0.5 truncate">SHA256: {node.sha256Digest.substring(0, 16)}...</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: TESTING HISTORY & PRESERVED RETESTS */}
        {activeTab === 'HISTORY' && (
          <div className="space-y-3">
            <div className="text-xs text-slate-400 mb-1">
              Historical fieldwork testing timeline. A passing retest never overwrites historical failures:
            </div>

            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
              {explanation.historyTimeline.map((evt, idx) => (
                <div key={evt.eventId} className="relative">
                  <div className={`absolute -left-6 top-1 w-3 h-3 rounded-full border-2 border-slate-950 ${
                    evt.testResult === 'PASS' ? 'bg-emerald-400' : (evt.testResult === 'FAIL' ? 'bg-rose-400' : 'bg-amber-400')
                  }`} />
                  <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-200">{evt.periodLabel}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{new Date(evt.timestamp).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">{evt.actionSummary}</p>
                    <div className="flex items-center space-x-3 mt-2 text-[11px] text-slate-400 font-mono">
                      <span>Tester: <strong className="text-slate-300">{evt.actor}</strong> ({evt.actorRole})</span>
                      <span>•</span>
                      <span>Result: <strong className={evt.testResult === 'PASS' ? 'text-emerald-400' : 'text-rose-400'}>{evt.testResult || evt.postureStatus}</strong></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: DRIFT INTELLIGENCE */}
        {activeTab === 'DRIFT' && (
          <div className="space-y-3">
            <div className="text-xs text-slate-400 mb-1">
              What changed since the previous review? Real-time configuration drift, expiring evidence, and policy shifts:
            </div>

            {explanation.driftIntelligence.length === 0 ? (
              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-8 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <h4 className="text-sm font-semibold text-slate-200">Zero Unacknowledged Drift</h4>
                <p className="text-xs text-slate-400 mt-1">Control configuration, evidence, and owner assignments are synchronized with baseline.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {explanation.driftIntelligence.map(drift => (
                  <div key={drift.changeId} className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 flex items-start space-x-3">
                    <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${
                      drift.severity === 'HIGH' || drift.severity === 'CRITICAL' ? 'text-rose-400' : 'text-amber-400'
                    }`} />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold text-slate-200">{drift.title}</span>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">{drift.driftType}</span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">{drift.description}</p>
                      <span className="text-[10px] text-slate-500 font-mono block mt-1">{new Date(drift.detectedAt).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 6: AI ASSURANCE INSIGHTS */}
        {activeTab === 'AI_INSIGHTS' && explanation.aiInsights && (
          <div className="space-y-4">
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                  {explanation.aiInsights.disclaimer}
                </span>
                <span className="text-xs text-indigo-300 font-medium">Verified by: {explanation.aiInsights.verifiedBy}</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">{explanation.aiInsights.executiveSummary}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3.5">
                <h4 className="text-xs font-semibold text-slate-200 mb-2 flex items-center space-x-1.5">
                  <FileCheck2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Suggested Auditor Fieldwork Questions</span>
                </h4>
                <ul className="space-y-2">
                  {explanation.aiInsights.suggestedAuditorQuestions.map((q, idx) => (
                    <li key={idx} className="text-xs text-slate-300 flex items-start space-x-2">
                      <span className="text-indigo-400 font-bold shrink-0">{idx + 1}.</span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3.5">
                <h4 className="text-xs font-semibold text-slate-200 mb-2 flex items-center space-x-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Proactive Improvement Actions</span>
                </h4>
                <ul className="space-y-2">
                  {explanation.aiInsights.recommendedProactiveActions.map((act, idx) => (
                    <li key={idx} className="text-xs text-slate-300 flex items-start space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </PremiumDrawer>
  );
};
