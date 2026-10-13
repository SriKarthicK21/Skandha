import React, { useState } from 'react';
import { useGRC } from '../../context/GRCContext';
import {
  X,
  ArrowLeft,
  Shield,
  AlertTriangle,
  FileCheck2,
  FileText,
  Server,
  Building2,
  CheckCircle2,
  Clock,
  ExternalLink,
  Copy,
  Check,
  Hash,
  User,
  Calendar,
  Lock,
  Sparkles,
  Layers,
  ChevronRight,
  TrendingDown,
  Activity,
  FileSearch,
  Eye
} from 'lucide-react';

export const SlideOverDrawer: React.FC = () => {
  const {
    entityDrawerState,
    closeEntityDrawer,
    navigateEntityDrawerBack,
    openEntityDrawer,
    currentTenant,
    controls,
    risks,
    evidence,
    findings,
    assets,
    vendors,
    setActiveModule
  } = useGRC();

  const [activeTab, setActiveTab] = useState<'overview' | 'relationships' | 'audit_trail'>('overview');
  const [copiedHash, setCopiedHash] = useState(false);

  if (!entityDrawerState.isOpen) return null;

  const { entityType, entityId, entityTitle, entityData, history } = entityDrawerState;

  // Resolve entity data from current context if not explicitly passed
  let resolvedData = entityData;
  if (!resolvedData) {
    if (entityType === 'control') {
      resolvedData = controls.find(c => c.id === entityId || c.controlCode === entityId);
    } else if (entityType === 'risk') {
      resolvedData = risks.find(r => r.id === entityId || r.riskCode === entityId);
    } else if (entityType === 'evidence') {
      resolvedData = evidence.find(e => e.id === entityId || e.controlCode === entityId);
    } else if (entityType === 'finding') {
      resolvedData = findings.find(f => f.id === entityId);
    } else if (entityType === 'asset') {
      resolvedData = assets.find(a => a.id === entityId);
    } else if (entityType === 'vendor') {
      resolvedData = vendors.find(v => v.id === entityId);
    }
  }

  const handleCopyHash = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'control': return Shield;
      case 'risk': return AlertTriangle;
      case 'evidence': return FileCheck2;
      case 'finding': return Clock;
      case 'asset': return Server;
      case 'vendor': return Building2;
      default: return FileText;
    }
  };

  const IconComponent = getEntityIcon(entityType);

  // Cross-entity resolution
  const linkedEvidence = entityType === 'control'
    ? evidence.filter(e => e.controlCode === resolvedData?.id || e.controlCode === resolvedData?.controlCode)
    : [];

  const linkedRisks = entityType === 'control'
    ? risks.filter(r => r.mitigationControl?.includes(resolvedData?.controlCode || '') || r.category?.toLowerCase() === resolvedData?.category?.toLowerCase())
    : [];

  const linkedFindings = entityType === 'control'
    ? findings.filter(f => f.clauseOrControl === resolvedData?.id || f.clauseOrControl === resolvedData?.controlCode)
    : [];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col h-full transform transition-all animate-in slide-in-from-right duration-300"
        role="dialog"
        aria-modal="true"
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3 min-w-0">
            {history.length > 0 && (
              <button
                onClick={navigateEntityDrawerBack}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                title="Back to previous entity"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}

            <div className="w-10 h-10 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-800">
              <IconComponent className="w-5 h-5" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {entityType}
                </span>
                <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400">
                  #{entityId}
                </span>
              </div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {entityTitle || resolvedData?.title || resolvedData?.name || `Entity ${entityId}`}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => {
                if (entityType === 'control') setActiveModule('controls_evidence');
                else if (entityType === 'risk') setActiveModule('risk');
                else if (entityType === 'evidence') setActiveModule('controls_evidence');
                else if (entityType === 'finding') setActiveModule('audit');
                else if (entityType === 'asset' || entityType === 'vendor') setActiveModule('assets_third_parties');
                closeEntityDrawer();
              }}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs font-medium flex items-center space-x-1"
              title="Open full workspace view"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
            <button
              onClick={closeEntityDrawer}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-5 bg-white dark:bg-slate-900">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            360° Overview
          </button>
          <button
            onClick={() => setActiveTab('relationships')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'relationships'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Connected Lineage ({linkedEvidence.length + linkedRisks.length + linkedFindings.length})
          </button>
          <button
            onClick={() => setActiveTab('audit_trail')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'audit_trail'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Audit Trail & Hashes
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* Primary Status Card */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Compliance State</span>
                  <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{resolvedData?.status || 'Active & Effective'}</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-200 dark:border-slate-700/60">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Assigned Owner</span>
                    <span className="font-semibold text-slate-900 dark:text-white flex items-center space-x-1 mt-0.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{resolvedData?.owner || resolvedData?.assignedOwner || 'CISO & Security Engineering'}</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Tenant Domain</span>
                    <span className="font-semibold text-slate-900 dark:text-white flex items-center space-x-1 mt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{currentTenant?.name}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Description / Statement */}
              <div className="space-y-1.5">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Objective & Scope
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  {resolvedData?.description || resolvedData?.objective || resolvedData?.statement || 'Enterprise security control operationalized under ISO/IEC 27001:2022 and MAS TRM Guidelines.'}
                </p>
              </div>

              {/* Framework Alignment Matrix */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-1.5">
                  <Layers className="w-4 h-4 text-blue-500" />
                  <span>Harmonized Multi-Standard Mapping</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">ISO/IEC 27001:2022</span>
                    <p className="font-semibold text-slate-900 dark:text-white mt-0.5">Annex A.5.15 / Cl. 6.1.3</p>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
                    <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase">MAS TRM 2021</span>
                    <p className="font-semibold text-slate-900 dark:text-white mt-0.5">Section 8.1 Access Management</p>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">DPDP Act 2023</span>
                    <p className="font-semibold text-slate-900 dark:text-white mt-0.5">Section 8(5) Security Safeguards</p>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase">SOC 2 Type II</span>
                    <p className="font-semibold text-slate-900 dark:text-white mt-0.5">Common Criteria CC6.1 - CC6.3</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'relationships' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-500">
                Connected 360° graph nodes. Click any entity to inspect in place without losing context.
              </div>

              {/* Linked Evidence */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-1.5">
                  <FileCheck2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Linked Verification Evidence ({linkedEvidence.length})</span>
                </h4>
                {linkedEvidence.length === 0 ? (
                  <div className="p-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-500 text-center">
                    No directly attached evidence files. Click "Request Evidence" below.
                  </div>
                ) : (
                  linkedEvidence.map(ev => (
                    <div
                      key={ev.id}
                      onClick={() => openEntityDrawer({ type: 'evidence', id: ev.id, title: ev.title, data: ev })}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 hover:border-blue-400 transition-all cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2.5">
                        <FileText className="w-4 h-4 text-emerald-500" />
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{ev.title}</p>
                          <span className="text-[10px] text-slate-400 font-mono">SHA-256: {(ev.sha256Hash || ev.auditHash || '').substring(0, 16)}...</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  ))
                )}
              </div>

              {/* Linked Risks */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  <span>Mitigated Risks ({linkedRisks.length})</span>
                </h4>
                {linkedRisks.slice(0, 3).map(risk => (
                  <div
                    key={risk.id}
                    onClick={() => openEntityDrawer({ type: 'risk', id: risk.id, title: risk.title, data: risk })}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 hover:border-amber-400 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{risk.title}</p>
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">Inherent: {risk.inherentScore} → Residual: {risk.residualScore}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'audit_trail' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
                    <Hash className="w-3.5 h-3.5 text-blue-500" />
                    <span>Cryptographic Verification Hash</span>
                  </span>
                  <button
                    onClick={() => handleCopyHash(resolvedData?.contentSha256 || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855')}
                    className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 flex items-center space-x-1 cursor-pointer"
                  >
                    {copiedHash ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedHash ? 'Copied' : 'Copy Hash'}</span>
                  </button>
                </div>
                <div className="font-mono text-[11px] bg-slate-900 text-slate-200 p-2.5 rounded-lg break-all border border-slate-800">
                  {resolvedData?.contentSha256 || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
                </div>
              </div>

              {/* Chain of Custody */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Chain of Custody Events
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 flex items-start space-x-3">
                    <Clock className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">Control Verified Compliant</p>
                      <span className="text-[10px] text-slate-400">By Lead Auditor on {new Date().toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 flex items-start space-x-3">
                    <Lock className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">Baseline Locked & Indexed</p>
                      <span className="text-[10px] text-slate-400">Recorded to WORM Ledger</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Action Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between gap-3">
          <button
            onClick={closeEntityDrawer}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            Close Drawer
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setActiveModule('controls_evidence');
                closeEntityDrawer();
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Inspect in Full Workspace</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
