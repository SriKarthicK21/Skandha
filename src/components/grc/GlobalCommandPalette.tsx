import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Command, 
  Network, 
  ShieldCheck, 
  FileText, 
  AlertTriangle, 
  FileSearch, 
  Layers,
  ArrowRight,
  CornerDownLeft
} from 'lucide-react';
import { FrameworkLibrary } from '../../services/grc/FrameworkLibrary';
import { UnifiedControlLibrary } from '../../services/grc/UnifiedControlLibrary';
import { ConfigurableRiskEngine } from '../../services/grc/ConfigurableRiskEngine';
import { SmartEvidenceEngine } from '../../services/grc/SmartEvidenceEngine';
import { AuditRemediationEngine } from '../../services/grc/AuditRemediationEngine';
import { ExtendedGrcEngines } from '../../services/grc/ExtendedGrcEngines';
import { complianceProgramService } from '../../services/canonical/ComplianceProgramService';
import { controlTestingService } from '../../services/canonical/ControlTestingService';
import { exceptionManagementService } from '../../services/canonical/ExceptionManagementService';
import { universalWorkflowService } from '../../services/canonical/WorkflowService';
import { PremiumModal } from '../ui/premium/PremiumModal';
import { PremiumBadge } from '../ui/premium/PremiumBadge';
import {
  DEFAULT_DEPARTMENTS,
  ACME_ONBOARDING_BLUEPRINT
} from '../../services/grc/organizationalDiscoveryService';
import { dpdpPrivacyEngineService } from '../../services/canonical/DpdpPrivacyEngineService';

interface GlobalCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEntity: (entityId: string, entityType: string) => void;
}

export const GlobalCommandPalette: React.FC<GlobalCommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectEntity
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Aggregate searchable items from GRC Core & Canonical Services
  const programs = complianceProgramService.getAllPrograms().map(p => ({
    id: p.id,
    code: p.code,
    title: p.name,
    type: 'PROGRAM',
    category: p.type
  }));

  const controls = controlTestingService.getAllControlDefinitions().map(c => ({
    id: c.id,
    code: c.code,
    title: c.title,
    type: 'CONTROL',
    category: c.category
  }));

  const implementations = controlTestingService.getAllImplementations().map(c => ({
    id: c.id,
    code: c.controlCode,
    title: `${c.title} (${c.owner})`,
    type: 'CONTROL_IMPL',
    category: c.operatingEnvironment
  }));

  const tests = controlTestingService.getAllTests().map(t => ({
    id: t.id,
    code: t.id,
    title: `${t.testTitle} [${t.testResult}]`,
    type: 'CONTROL_TEST',
    category: t.testType
  }));

  const exceptions = exceptionManagementService.getAllExceptions().map(e => ({
    id: e.id,
    code: e.exceptionCode,
    title: `${e.title} (${e.status})`,
    type: 'EXCEPTION',
    category: e.department
  }));

  const tasks = universalWorkflowService.getAllTasks().map(w => ({
    id: w.id,
    code: w.id,
    title: `${w.title} (${w.assignee})`,
    type: 'TASK',
    category: w.entityType
  }));

  const requirements = FrameworkLibrary.getAllFrameworks().flatMap(f => 
    f.sections.flatMap(s => 
      s.requirements.map(r => ({
        id: r.id,
        code: r.code,
        title: `${r.title} (${r.frameworkCode})`,
        type: 'REQUIREMENT',
        category: r.frameworkCode
      }))
    )
  );

  const risks = ConfigurableRiskEngine.getAllRisks().map(r => ({
    id: r.id,
    code: r.riskCode,
    title: r.title,
    type: 'RISK',
    category: r.category
  }));

  const evidence = SmartEvidenceEngine.getAllEvidence().map(e => ({
    id: e.id,
    code: e.evidenceCode,
    title: e.name,
    type: 'EVIDENCE',
    category: e.sourceType
  }));

  const policies = ExtendedGrcEngines.getPolicies().map(p => ({
    id: p.id,
    code: p.policyCode,
    title: p.title,
    type: 'POLICY',
    category: p.category
  }));

  const telemetryItems = [
    { id: 'conn-aws-sec-hub', code: 'AWS-SEC-HUB', title: 'AWS Security Hub & CSPM Connector', type: 'CONNECTOR', category: 'Cloud Infrastructure' },
    { id: 'conn-entra-id', code: 'ENTRA-ID', title: 'Microsoft Entra ID Access & MFA Sensor', type: 'CONNECTOR', category: 'Identity & Access' },
    { id: 'conn-github', code: 'GITHUB-GATE', title: 'GitHub Enterprise Branch Gate & CodeQL', type: 'CONNECTOR', category: 'Source Control & DevOps' },
    { id: 'OBS-2026-00091', code: 'OBS-00091', title: 'Entra ID Privileged MFA Exemption Observation', type: 'TELEMETRY', category: 'Observation' },
    { id: 'VND-OBS-2026-041', code: 'VND-OBS-041', title: 'Databricks Expiring TLS Certificate Observation', type: 'TPRM_SCAN', category: 'Vendor Risk' }
  ];

  const departments = DEFAULT_DEPARTMENTS.map(d => ({
    id: d.departmentId,
    code: d.departmentId,
    title: `${d.departmentName} (Owner: ${d.ownerName})`,
    type: 'DEPARTMENT',
    category: d.priority
  }));

  const processes = [
    ACME_ONBOARDING_BLUEPRINT
  ].map(p => ({
    id: p.processId,
    code: p.processId,
    title: `${p.processName} (${p.department})`,
    type: 'PROCESS',
    category: p.businessImpact
  }));

  const audits = AuditRemediationEngine.getAllAudits().map(a => ({
    id: a.id,
    code: a.auditCode,
    title: `${a.title} [${a.status}]`,
    type: 'AUDIT',
    category: a.frameworkCode
  }));

  const findings = AuditRemediationEngine.getAllFindings().map(f => ({
    id: f.id,
    code: f.findingCode,
    title: `${f.title} (${f.severity})`,
    type: 'FINDING',
    category: f.status
  }));

  const capas = AuditRemediationEngine.getAllCapas().map(c => ({
    id: c.id,
    code: c.capaCode,
    title: `${c.title} (Owner: ${c.owner})`,
    type: 'CAPA',
    category: c.status
  }));

  const dpdpDataElements = dpdpPrivacyEngineService.getPersonalDataInventory('tenant_skanda').map(p => ({
    id: p.id,
    code: p.id,
    title: `${p.name} [DPDP Personal Data]`,
    type: 'PERSONAL_DATA',
    category: p.category
  }));

  const dpdpActivities = dpdpPrivacyEngineService.getProcessingActivities('tenant_skanda').map(a => ({
    id: a.id,
    code: a.id,
    title: `${a.name} [DPDP RoPA]`,
    type: 'PROCESSING_ACTIVITY',
    category: a.applicableBasis
  }));

  const dpdpNotices = dpdpPrivacyEngineService.getPrivacyNotices('tenant_skanda').map(n => ({
    id: n.id,
    code: n.noticeCode,
    title: `${n.title} (v${n.currentVersion}) [DPDP Notice]`,
    type: 'PRIVACY_NOTICE',
    category: 'Privacy Notice'
  }));

  const dpdpDsrs = dpdpPrivacyEngineService.getRightRequests('tenant_skanda').map(d => ({
    id: d.id,
    code: d.id,
    title: `${d.requestType} - ${d.dataPrincipalName} [DPDP DSR]`,
    type: 'DSR_REQUEST',
    category: d.status
  }));

  const dpdpProcessors = dpdpPrivacyEngineService.getProcessors('tenant_skanda').map(pr => ({
    id: pr.id,
    code: pr.id,
    title: `${pr.name} (Risk: ${pr.riskScore}/100) [DPDP Processor]`,
    type: 'PROCESSOR',
    category: pr.riskTier
  }));

  const allEntities = [
    ...programs,
    ...departments,
    ...processes,
    ...controls,
    ...implementations,
    ...tests,
    ...audits,
    ...findings,
    ...capas,
    ...exceptions,
    ...tasks,
    ...requirements,
    ...risks,
    ...evidence,
    ...policies,
    ...dpdpDataElements,
    ...dpdpActivities,
    ...dpdpNotices,
    ...dpdpDsrs,
    ...dpdpProcessors,
    ...telemetryItems
  ];

  const filtered = query.trim() === ''
    ? allEntities.slice(0, 8)
    : allEntities.filter(e => 
        e.code.toLowerCase().includes(query.toLowerCase()) ||
        e.title.toLowerCase().includes(query.toLowerCase()) ||
        e.type.toLowerCase().includes(query.toLowerCase()) ||
        e.category?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 10);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      e.preventDefault();
      const item = filtered[selectedIndex];
      onSelectEntity(item.id, item.type);
      onClose();
    }
  };

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'CONTROL':
      case 'CONTROL_IMPL':
        return <Network className="w-4 h-4 text-indigo-400" />;
      case 'REQUIREMENT':
      case 'PROGRAM':
        return <ShieldCheck className="w-4 h-4 text-cyan-400" />;
      case 'RISK':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'EVIDENCE':
        return <FileText className="w-4 h-4 text-emerald-400" />;
      case 'POLICY':
        return <Layers className="w-4 h-4 text-sky-400" />;
      case 'FINDING':
      case 'CAPA':
      case 'AUDIT':
        return <FileSearch className="w-4 h-4 text-rose-400" />;
      case 'EXCEPTION':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      default:
        return <Search className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <PremiumModal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      className="p-0 overflow-hidden"
    >
      <div className="flex flex-col bg-slate-900 rounded-2xl border border-slate-700/80 shadow-2xl">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-800 bg-slate-950/60">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search any GRC object (e.g. A.8.12, MAS 8.1, CTRL-001, RSK-001)..."
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 border border-slate-700 rounded-md">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-2 space-y-1">
          {filtered.map((item, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <div
                key={`${item.type}-${item.id}`}
                onClick={() => {
                  onSelectEntity(item.id, item.type);
                  onClose();
                }}
                className={`p-3 rounded-xl transition-all flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-500/10 border border-cyan-500/30 text-white'
                    : 'hover:bg-slate-800/60 border border-transparent text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-800">
                    {getEntityIcon(item.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-cyan-400">{item.code}</span>
                      <PremiumBadge variant="neutral">{item.type}</PremiumBadge>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5 line-clamp-1">{item.title}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <CornerDownLeft className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-400 opacity-100' : 'opacity-0'}`} />
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-500">
              No matching GRC objects found for "{query}".
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/80 border-t border-slate-800 text-[11px] text-slate-500">
          <div className="flex items-center gap-4">
            <span>Use <kbd className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-slate-300">↑</kbd> <kbd className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-slate-300">↓</kbd> to navigate</span>
            <span><kbd className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-slate-300">↵</kbd> to select</span>
          </div>
          <span className="text-cyan-400 font-medium">SKANDA Global GRC Search</span>
        </div>
      </div>
    </PremiumModal>
  );
};
