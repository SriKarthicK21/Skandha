import React, { useState, useEffect } from 'react';
import { DPDPPrivacyCommandCenter } from './DPDPPrivacyCommandCenter';
import { DPDPPersonalDataInventoryWorkspace } from './DPDPPersonalDataInventoryWorkspace';
import { DPDPProcessingActivityRegisterWorkspace } from './DPDPProcessingActivityRegisterWorkspace';
import { DPDPPurposeGovernanceStudio } from './DPDPPurposeGovernanceStudio';
import { DPDPPrivacyNoticeStudio } from './DPDPPrivacyNoticeStudio';
import { DPDPConsentLifecycleWorkspace } from './DPDPConsentLifecycleWorkspace';
import { DPDPDataPrincipalRightsCenter } from './DPDPDataPrincipalRightsCenter';
import { DPDPRetentionDeletionWorkspace } from './DPDPRetentionDeletionWorkspace';
import { DPDPProcessorPrivacy360Workspace } from './DPDPProcessorPrivacy360Workspace';
import { DPDPPrivacyIncidentWorkspace } from './DPDPPrivacyIncidentWorkspace';
import { DPDPSdfAssessmentWorkspace } from './DPDPSdfAssessmentWorkspace';
import { DPDPAuditorWorkbenchWorkspace } from './DPDPAuditorWorkbenchWorkspace';
import { DPDPPrivacyReportsStudio } from './DPDPPrivacyReportsStudio';
import { DPDPPrivacyCopilotDrawer } from './DPDPPrivacyCopilotDrawer';

// Legacy specialized modules preserved for deep-dive tooling
import { DPDPClauseAuditChecklist } from './DPDPClauseAuditChecklist';
import { DPDPConsentGrievanceRegister } from './DPDPConsentGrievanceRegister';
import { DPDPChildrenDataModule } from './DPDPChildrenDataModule';
import { DPDPErasureCascadeModule } from './DPDPErasureCascadeModule';
import { DPDPProcessorDpaModule } from './DPDPProcessorDpaModule';
import { DPDPCrossBorderModule } from './DPDPCrossBorderModule';
import { DPDPDpiaWorkbench } from './DPDPDpiaWorkbench';
import { DPDPBreachPlaybook } from './DPDPBreachPlaybook';
import { DPDPDataFlowVisualizer } from './DPDPDataFlowVisualizer';
import { DPDPRetentionPurgeManager } from './DPDPRetentionPurgeManager';
import { DPDPAComTrainingAcademy } from './DPDPAComTrainingAcademy';
import { DPDPTrainingGapAnalyzer } from './DPDPTrainingGapAnalyzer';
import { DPDPRegulatoryDossierModal } from './DPDPRegulatoryDossierModal';

import {
  Shield,
  Layers,
  FileCheck2,
  Clock,
  Cpu,
  AlertOctagon,
  Languages,
  Award,
  BookOpen,
  Baby,
  Trash2,
  Server,
  Globe,
  FileText,
  GitFork,
  Calendar,
  GraduationCap,
  Target,
  Database,
  UserCheck,
  Building2,
  HelpCircle,
  Sparkles,
  Bot
} from 'lucide-react';

export type DPDPTabType =
  | 'command_center'
  | 'data_inventory'
  | 'ropa_register'
  | 'purpose_governance'
  | 'notice_studio'
  | 'consent_lifecycle'
  | 'rights_center'
  | 'retention_deletion'
  | 'processor_360'
  | 'incidents_breach'
  | 'sdf_governance'
  | 'auditor_workbench'
  | 'reports_studio'
  | 'legacy_checklist'
  | 'legacy_academy'
  | 'legacy_children_vpc'
  | 'legacy_dpia';

export interface DPDPActComplianceModuleProps {
  initialTab?: DPDPTabType;
  tenantId?: string;
}

export const DPDPActComplianceModule: React.FC<DPDPActComplianceModuleProps> = ({
  initialTab = 'command_center',
  tenantId = 'tenant_skanda'
}) => {
  const [activeTab, setActiveTab] = useState<DPDPTabType>(initialTab);
  const [showDossierModal, setShowDossierModal] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [activeShowMeWhyReqId, setActiveShowMeWhyReqId] = useState<string | null>(null);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const handleOpenShowMeWhy = (reqId: string) => {
    setActiveShowMeWhyReqId(reqId);
  };

  return (
    <div className="space-y-6">
      {/* Executive Module Header */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Republic of India • DPDP Act 2023 & Rules 2025
              </span>
              <span className="text-xs text-slate-400">Notified 13-Nov-2025 • MeitY & DPBI</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                Canonical Assurance Engine
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span>SKANDA DPDP Privacy Operations & Assurance Platform</span>
              <Shield className="w-7 h-7 text-amber-400 shrink-0" />
            </h1>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              Real-time enterprise privacy governance connecting Personal Data Inventory, Processing Activities (RoPA), Purpose Governance, Multilingual Notices, Consent Lifecycle, 9-Stage Data Principal Rights (DSR), Retention & Cryptographic Deletion, Processor 360, Breach Forensics, Significant Data Fiduciary (SDF) Governance, and Independent Auditor Clean-Room Workbench.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <div className="flex items-center space-x-3 bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
              <div className="text-center px-3">
                <div className="text-xs text-slate-400">Statutory Max Fine</div>
                <div className="text-xl font-bold font-mono text-rose-400">₹250 Crores</div>
              </div>
              <div className="h-8 w-px bg-slate-800" />
              <div className="text-center px-3">
                <div className="text-xs text-slate-400">Breach SLA Window</div>
                <div className="text-xl font-bold font-mono text-amber-400">6 Hours</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCopilotOpen(true)}
                className="px-4 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
              >
                <Bot className="w-4 h-4" />
                <span>AI Privacy Copilot</span>
              </button>

              <button
                onClick={() => setShowDossierModal(true)}
                className="px-4 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
              >
                <Award className="w-4 h-4" />
                <span>DPBI Dossier</span>
              </button>
            </div>
          </div>
        </div>

        {/* Primary Navigation Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pt-6 mt-4 border-t border-slate-800/80 scrollbar-thin">
          <button
            type="button"
            onClick={() => setActiveTab('command_center')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer shrink-0 ${
              activeTab === 'command_center'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'bg-slate-800/60 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Command Center</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('data_inventory')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer shrink-0 ${
              activeTab === 'data_inventory'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'bg-slate-800/60 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Personal Data Inventory</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ropa_register')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer shrink-0 ${
              activeTab === 'ropa_register'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'bg-slate-800/60 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <GitFork className="w-4 h-4" />
            <span>Processing Register (RoPA)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('purpose_governance')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer shrink-0 ${
              activeTab === 'purpose_governance'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'bg-slate-800/60 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Purpose Governance</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('notice_studio')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer shrink-0 ${
              activeTab === 'notice_studio'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'bg-slate-800/60 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Languages className="w-4 h-4" />
            <span>Notice Studio (22 Languages)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('consent_lifecycle')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer shrink-0 ${
              activeTab === 'consent_lifecycle'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'bg-slate-800/60 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Consent Lifecycle</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('rights_center')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer shrink-0 ${
              activeTab === 'rights_center'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'bg-slate-800/60 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Rights Center (DSR)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('retention_deletion')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer shrink-0 ${
              activeTab === 'retention_deletion'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'bg-slate-800/60 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            <span>Retention & Deletion Engine</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('processor_360')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer shrink-0 ${
              activeTab === 'processor_360'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'bg-slate-800/60 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Processor Privacy 360</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('incidents_breach')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer shrink-0 ${
              activeTab === 'incidents_breach'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20'
                : 'bg-slate-800/60 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <AlertOctagon className="w-4 h-4" />
            <span>Incidents & 6-Hour Breach</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sdf_governance')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer shrink-0 ${
              activeTab === 'sdf_governance'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                : 'bg-slate-800/60 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>SDF Governance (§10)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('auditor_workbench')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer shrink-0 ${
              activeTab === 'auditor_workbench'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                : 'bg-slate-800/60 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Auditor Workbench</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reports_studio')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer shrink-0 ${
              activeTab === 'reports_studio'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'bg-slate-800/60 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Regulatory Reports</span>
          </button>
        </div>
      </div>

      {/* Render Active Tool Tab */}
      {activeTab === 'command_center' && (
        <DPDPPrivacyCommandCenter
          tenantId={tenantId}
          onNavigate={(tab) => setActiveTab(tab as DPDPTabType)}
        />
      )}
      {activeTab === 'data_inventory' && (
        <DPDPPersonalDataInventoryWorkspace tenantId={tenantId} />
      )}
      {activeTab === 'ropa_register' && (
        <DPDPProcessingActivityRegisterWorkspace tenantId={tenantId} />
      )}
      {activeTab === 'purpose_governance' && (
        <DPDPPurposeGovernanceStudio tenantId={tenantId} />
      )}
      {activeTab === 'notice_studio' && (
        <DPDPPrivacyNoticeStudio tenantId={tenantId} />
      )}
      {activeTab === 'consent_lifecycle' && (
        <DPDPConsentLifecycleWorkspace tenantId={tenantId} />
      )}
      {activeTab === 'rights_center' && (
        <DPDPDataPrincipalRightsCenter tenantId={tenantId} />
      )}
      {activeTab === 'retention_deletion' && (
        <DPDPRetentionDeletionWorkspace tenantId={tenantId} />
      )}
      {activeTab === 'processor_360' && (
        <DPDPProcessorPrivacy360Workspace tenantId={tenantId} />
      )}
      {activeTab === 'incidents_breach' && (
        <DPDPPrivacyIncidentWorkspace tenantId={tenantId} />
      )}
      {activeTab === 'sdf_governance' && (
        <DPDPSdfAssessmentWorkspace tenantId={tenantId} />
      )}
      {activeTab === 'auditor_workbench' && (
        <DPDPAuditorWorkbenchWorkspace
          tenantId={tenantId}
          onOpenShowMeWhy={handleOpenShowMeWhy}
        />
      )}
      {activeTab === 'reports_studio' && (
        <DPDPPrivacyReportsStudio tenantId={tenantId} />
      )}

      {/* Legacy Fallbacks */}
      {activeTab === 'legacy_checklist' && <DPDPClauseAuditChecklist />}
      {activeTab === 'legacy_academy' && <DPDPAComTrainingAcademy />}
      {activeTab === 'legacy_children_vpc' && <DPDPChildrenDataModule />}
      {activeTab === 'legacy_dpia' && <DPDPDpiaWorkbench />}

      {/* Executive DPBI Statutory Compliance Dossier Modal */}
      <DPDPRegulatoryDossierModal
        isOpen={showDossierModal}
        onClose={() => setShowDossierModal(false)}
      />

      {/* AI Privacy Copilot Drawer */}
      <DPDPPrivacyCopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        tenantId={tenantId}
      />
    </div>
  );
};
