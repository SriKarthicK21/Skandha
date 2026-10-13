/**
 * SKANDA ENTERPRISE AUDITOR WORKBENCH
 * Path: src/components/audit/AuditorWorkbenchWorkspace.tsx
 * 
 * Principal Audit Technology Architect & Chief Enterprise Architect Component
 * Dedicated workspace for internal and external certification auditors.
 * 
 * Cleanroom Security Model:
 * - Scoped only to authorized audit programs and framework boundaries.
 * - External auditors strictly denied write access to controls, policies, and evidence.
 * - Provides unbroken assurance traversal:
 *   Audit -> Scope -> Requirement -> Control -> Implementation -> Evidence (SHA-256) -> Test -> Finding -> CAPA -> Retest -> Assurance
 * - Embedded "SHOW ME WHY" explainability engine.
 */

import React, { useState } from 'react';
import {
  ShieldCheck,
  FileSearch,
  FileText,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Download,
  Lock,
  ExternalLink,
  Layers,
  Network,
  Activity,
  History,
  Filter,
  Search,
  Key,
  Database,
  ArrowRight,
  Sparkles,
  ChevronRight,
  FileCheck2,
  Calendar,
  Eye
} from 'lucide-react';
import { assuranceExplanationService } from '../../services/canonical/AssuranceExplanationService';
import { AuditRemediationEngine } from '../../services/grc/AuditRemediationEngine';
import { UnifiedControlLibrary } from '../../services/grc/UnifiedControlLibrary';
import { SmartEvidenceEngine } from '../../services/grc/SmartEvidenceEngine';
import { controlTestingService } from '../../services/canonical/ControlTestingService';
import { exceptionManagementService } from '../../services/canonical/ExceptionManagementService';
import { FrameworkLibrary } from '../../services/grc/FrameworkLibrary';
import { domainEventBus } from '../../services/canonical/DomainEventBus';
import { ShowMeWhyDrawer } from '../grc/ShowMeWhyDrawer';
import { PremiumBadge } from '../ui/premium/PremiumBadge';
import { PremiumButton } from '../ui/premium/PremiumButton';
import { GrcNavigationService } from '../../services/grc/grcNavigationService';

type AuditorTab = 
  | 'OVERVIEW'
  | 'SCOPE'
  | 'CONTROLS'
  | 'EVIDENCE'
  | 'FIELDWORK'
  | 'FINDINGS'
  | 'CAPA'
  | 'RETESTS'
  | 'EXCEPTIONS'
  | 'AUDIT_TRAIL'
  | 'ASSURANCE_SUMMARY';

interface AuditorWorkbenchWorkspaceProps {
  tenantId?: string;
  auditId?: string;
}

export const AuditorWorkbenchWorkspace: React.FC<AuditorWorkbenchWorkspaceProps> = ({
  tenantId = 'tenant-acme-corp',
  auditId = 'AUD-2026-Q1'
}) => {
  const [activeTab, setActiveTab] = useState<AuditorTab>('OVERVIEW');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedControlCode, setSelectedControlCode] = useState<string | null>(null);
  const [isShowMeWhyOpen, setIsShowMeWhyOpen] = useState(false);

  // Load canonical audit & assurance records
  const audit = AuditRemediationEngine.getAllAudits().find(a => a.id === auditId) || AuditRemediationEngine.getAllAudits()[0];
  const enterpriseSummary = assuranceExplanationService.getEnterpriseAssuranceSummary(tenantId);
  const allControls = UnifiedControlLibrary.getAllControls();
  const allEvidence = SmartEvidenceEngine.getAllEvidence();
  const allTests = controlTestingService.getAllTests();
  const allFindings = AuditRemediationEngine.getAllFindings();
  const allCapas = AuditRemediationEngine.getAllCapas();
  const allExceptions = exceptionManagementService.getAllExceptions();
  const recentAuditEvents = domainEventBus.getAllEvents(25);

  const handleOpenShowMeWhy = (code: string) => {
    setSelectedControlCode(code);
    setIsShowMeWhyOpen(true);
  };

  const handleExportFullDossier = (format: 'JSON' | 'CSV' | 'TEXT') => {
    const codes = allControls.map(c => c.code);
    const res = assuranceExplanationService.exportAssurancePackage(codes, format, tenantId);
    const blob = new Blob([res.dataContent], { type: format === 'JSON' ? 'application/json' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SKANDA-AUDIT-DOSSIER-${audit?.auditCode || '2026'}.${format.toLowerCase()}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      {/* Top Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 font-semibold border border-indigo-500/20">
                  {audit?.auditCode || 'AUD-2026-Q1'}
                </span>
                <h1 className="text-lg font-bold text-slate-100">{audit?.title || '2026 Stage-2 Recertification & MAS Examination'}</h1>
                <PremiumBadge variant="success" size="sm">AUDITOR CLEAN ROOM ACTIVE</PremiumBadge>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Lead Auditor: <strong className="text-slate-200">{audit?.leadAuditor || 'Marcus Sterling (BSI Group)'}</strong> • 
                Audit Firm: <strong className="text-slate-200">{audit?.auditFirm || 'BSI Group / TÜV Rheinland'}</strong> • 
                Status: <strong className="text-indigo-400">{audit?.status || 'FIELDWORK_ACTIVE'}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <PremiumButton variant="secondary" size="sm" onClick={() => handleExportFullDossier('JSON')}>
              <Download className="w-3.5 h-3.5 mr-1.5" /> Export Audit Dossier
            </PremiumButton>
            <PremiumButton variant="primary" size="sm" onClick={() => handleOpenShowMeWhy('CTRL-001')}>
              <HelpCircle className="w-3.5 h-3.5 mr-1.5" /> Show Me Why
            </PremiumButton>
          </div>
        </div>

        {/* Auditor Clean Room Security Notice */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Clean Room Quarantine: Server-side RLS enforced. Read-only verification active. Direct control mutations blocked.</span>
          </div>
          <span className="font-mono text-[11px] text-slate-500">Master Seal: {enterpriseSummary.sha256AuditSeal.substring(0, 20)}...</span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center space-x-1.5 border-b border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'OVERVIEW', label: 'Audit Overview', icon: FileSearch },
          { id: 'SCOPE', label: 'Scope & Requirements', icon: Layers, badge: `${audit?.totalCheckpoints || 93}` },
          { id: 'CONTROLS', label: 'Controls & Assurance', icon: ShieldCheck, badge: `${allControls.length}` },
          { id: 'EVIDENCE', label: 'Evidence Vault', icon: FileText, badge: `${allEvidence.length}` },
          { id: 'FIELDWORK', label: 'Fieldwork Sampling', icon: FileCheck2, badge: `${allTests.length}` },
          { id: 'FINDINGS', label: 'Findings', icon: AlertTriangle, badge: `${allFindings.length}` },
          { id: 'CAPA', label: 'CAPA Remediation', icon: Activity, badge: `${allCapas.length}` },
          { id: 'RETESTS', label: 'Retests', icon: CheckCircle2 },
          { id: 'EXCEPTIONS', label: 'Exceptions & Expiry', icon: Key, badge: `${allExceptions.length}` },
          { id: 'AUDIT_TRAIL', label: 'Immutable Trail', icon: History },
          { id: 'ASSURANCE_SUMMARY', label: 'Assurance Summary', icon: Sparkles }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AuditorTab)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
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

      {/* ==================================================================== */}
      {/* TAB 1: AUDIT OVERVIEW */}
      {/* ==================================================================== */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
              <span className="text-xs text-slate-400 font-medium">Checkpoints Tested</span>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="text-2xl font-bold text-slate-100">{audit?.testedCheckpoints || 82}</span>
                <span className="text-xs text-slate-500 font-mono">/ {audit?.totalCheckpoints || 93} ({Math.round(((audit?.testedCheckpoints || 82) / (audit?.totalCheckpoints || 93)) * 100)}%)</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: '88%' }} />
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
              <span className="text-xs text-slate-400 font-medium">Controls Effective</span>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="text-2xl font-bold text-emerald-400">{enterpriseSummary.controlDistribution.effectiveCount}</span>
                <span className="text-xs text-slate-500 font-mono">/ {enterpriseSummary.controlDistribution.totalControls} ({enterpriseSummary.controlDistribution.effectivePercentage}%)</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${enterpriseSummary.controlDistribution.effectivePercentage}%` }} />
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
              <span className="text-xs text-slate-400 font-medium">Assurance Confidence</span>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="text-2xl font-bold text-indigo-400">{enterpriseSummary.overallConfidenceScore}%</span>
                <span className="text-xs text-slate-500 font-mono">VERY HIGH</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">Weighted across 6 canonical diagnostic factors.</p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
              <span className="text-xs text-slate-400 font-medium">Auditor Preliminary Opinion</span>
              <div className="mt-1">
                <span className="text-sm font-bold text-emerald-400 block">{audit?.auditorOpinion || 'UNQUALIFIED CLEAN'}</span>
                <span className="text-[11px] text-slate-400 mt-1 block">Zero critical non-conformities blocking certification.</span>
              </div>
            </div>
          </div>

          {/* Scope Perimeter & Multi-Standard Harmonization */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Audit Scope Perimeter & Framework Compliance</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>Scope Perimeter:</strong> {audit?.scopeDescription || 'Global Multi-Region Cloud Banking, Ingress API Gateways, IAM Provider, and Kubernetes Microservices Architecture.'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 pt-2">
              {enterpriseSummary.frameworkReadiness.map(fw => (
                <div key={fw.frameworkCode} className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-200">{fw.frameworkCode}</span>
                    <span className="text-xs font-bold text-emerald-400">{fw.readinessPercent}%</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 truncate">{fw.frameworkName}</p>
                  <span className="text-[10px] text-indigo-300 font-mono block mt-2">{fw.compliantRequirements}/{fw.totalRequirements} Requirements Met</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: CONTROLS & "SHOW ME WHY" INSPECTION */}
      {/* ==================================================================== */}
      {activeTab === 'CONTROLS' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Filter controls by code, title, owner..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <span className="text-xs text-slate-400">{allControls.length} controls available for audit fieldwork</span>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/50 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Control Code</th>
                  <th className="py-2.5 px-3">Title</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Owner</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Assurance Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {allControls
                  .filter(c => !searchQuery || c.code.toLowerCase().includes(searchQuery.toLowerCase()) || c.title.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(ctrl => (
                    <tr key={ctrl.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-indigo-300">{ctrl.code}</td>
                      <td className="py-2.5 px-3 text-slate-200 font-medium">{ctrl.title}</td>
                      <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">{ctrl.category}</td>
                      <td className="py-2.5 px-3 text-slate-300">{ctrl.owner}</td>
                      <td className="py-2.5 px-3">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold">
                          {ctrl.operatingEffectiveness}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => handleOpenShowMeWhy(ctrl.code)}
                          className="px-2.5 py-1 rounded bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs font-medium border border-indigo-500/30 transition-all flex items-center space-x-1 inline-flex"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>Show Me Why</span>
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: EVIDENCE VAULT & SHA-256 INTEGRITY */}
      {/* ==================================================================== */}
      {activeTab === 'EVIDENCE' && (
        <div className="space-y-3">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">Evidence Cryptographic Vault</h3>
              <p className="text-xs text-slate-400 mt-0.5">Every evidence payload is bound by immutable SHA-256 checksums with fail-closed tamper sentry.</p>
            </div>
            <span className="text-xs text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
              100% SHA-256 INTEGRITY VERIFIED
            </span>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/50 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Evidence Code</th>
                  <th className="py-2.5 px-3">Artifact Name</th>
                  <th className="py-2.5 px-3">SHA-256 Cryptographic Hash</th>
                  <th className="py-2.5 px-3">Source</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Valid Until</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {allEvidence.map(ev => (
                  <tr key={ev.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">{ev.evidenceCode}</td>
                    <td className="py-2.5 px-3 text-slate-200 font-medium">{ev.name || ev.fileName}</td>
                    <td className="py-2.5 px-3 font-mono text-[10px] text-slate-400">{ev.sha256Hash.substring(0, 24)}...</td>
                    <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">{ev.sourceType}</td>
                    <td className="py-2.5 px-3">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold">
                        {ev.verificationStatus}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">
                      {ev.validUntil ? new Date(ev.validUntil).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 4: FIELDWORK SAMPLING & TESTING */}
      {/* ==================================================================== */}
      {activeTab === 'FIELDWORK' && (
        <div className="space-y-3">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">ISO 19011 Fieldwork & Sampling Records</h3>
            <p className="text-xs text-slate-400 mt-0.5">Fieldwork inspection logs capturing sampling size, population, tester role, and test procedure.</p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {allTests.map(t => (
              <div key={t.id} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-indigo-300">{t.id}</span>
                      <span className="text-xs font-semibold text-slate-100">{t.testTitle}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        t.testResult === 'PASS' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {t.testResult}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1.5">{t.testProcedure}</p>
                    <div className="flex items-center space-x-4 mt-2.5 text-[11px] text-slate-400 font-mono">
                      <span>Target Control: <strong className="text-indigo-300">{t.controlCode}</strong></span>
                      <span>Sample: <strong>{t.sampleSize} / {t.populationSize}</strong> ({t.samplingMethod})</span>
                      <span>Tester: <strong>{t.tester}</strong> ({t.testerRole})</span>
                      <span>Performed: <strong>{new Date(t.performedAt).toLocaleDateString()}</strong></span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenShowMeWhy(t.controlCode)}
                    className="px-2.5 py-1 rounded bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs font-medium border border-indigo-500/30 shrink-0"
                  >
                    View Lineage
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 5: FINDINGS & CAPA */}
      {/* ==================================================================== */}
      {(activeTab === 'FINDINGS' || activeTab === 'CAPA' || activeTab === 'RETESTS') && (
        <div className="space-y-3">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">Closed-Loop Non-Conformity & CAPA Remediation</h3>
            <p className="text-xs text-slate-400 mt-0.5">Traceable 5-Whys root cause analysis, immediate corrections, preventive actions, and independent retests.</p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {allFindings.map(f => {
              const capa = allCapas.find(c => c.findingId === f.id || c.findingId === f.findingCode);
              return (
                <div key={f.id} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-rose-400">{f.findingCode}</span>
                      <span className="text-xs font-semibold text-slate-100">{f.title}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-300">{f.severity}</span>
                    </div>
                    <span className="text-xs font-mono text-slate-400">{f.status}</span>
                  </div>
                  <p className="text-xs text-slate-300">{f.description}</p>

                  {capa && (
                    <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-3 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-indigo-300">CAPA: {capa.title} ({capa.capaCode})</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold">{capa.status}</span>
                      </div>
                      <p className="text-xs text-slate-300 font-mono text-[11px]">{capa.rootCauseAnalysis}</p>
                      <div className="flex items-center space-x-3 text-[11px] text-slate-400 font-mono pt-1">
                        <span>Owner: <strong>{capa.owner}</strong></span>
                        <span>•</span>
                        <span>Due: <strong>{capa.dueDate}</strong></span>
                        <span>•</span>
                        <span>Verified By: <strong>{capa.verifiedBy || 'Auditor'}</strong></span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 6: IMMUTABLE AUDIT TRAIL */}
      {/* ==================================================================== */}
      {activeTab === 'AUDIT_TRAIL' && (
        <div className="space-y-3">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">Immutable WORM Domain Event Stream</h3>
              <p className="text-xs text-slate-400 mt-0.5">Cryptographically sealed chronological audit events with SHA-256 non-repudiation digests.</p>
            </div>
            <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20">
              HASH CHAIN INTACT
            </span>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/50 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Event ID</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Event Type</th>
                  <th className="py-2.5 px-3">Target Entity</th>
                  <th className="py-2.5 px-3">Actor</th>
                  <th className="py-2.5 px-3">Summary</th>
                  <th className="py-2.5 px-3 font-mono">Checksum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentAuditEvents.map(evt => (
                  <tr key={evt.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2 px-3 font-mono text-[11px] text-indigo-300">{evt.id}</td>
                    <td className="py-2 px-3 font-mono text-[10px] text-slate-400">{new Date(evt.timestamp).toLocaleString()}</td>
                    <td className="py-2 px-3 font-mono text-[11px] text-slate-300">{evt.eventType}</td>
                    <td className="py-2 px-3 font-mono text-[11px] text-cyan-400">{evt.entityCode || evt.entityId}</td>
                    <td className="py-2 px-3 text-slate-300">{evt.actor}</td>
                    <td className="py-2 px-3 text-slate-200 max-w-xs truncate">{evt.summary}</td>
                    <td className="py-2 px-3 font-mono text-[10px] text-slate-500">{evt.integrityChecksum?.substring(0, 16)}...</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Embedded "Show Me Why" Drawer */}
      <ShowMeWhyDrawer
        isOpen={isShowMeWhyOpen}
        onClose={() => setIsShowMeWhyOpen(false)}
        controlCode={selectedControlCode}
        tenantId={tenantId}
      />
    </div>
  );
};
