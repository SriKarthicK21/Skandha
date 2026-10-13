import React, { useState } from 'react';
import { useGRC } from '../../context/GRCContext';
import { PageContainer } from '../layout/PageContainer';
import { RoleType, UserRole } from '../../types';
import {
  ROLE_DEFINITIONS,
  NON_ADMIN_PREVIEW_ROLES,
  RoleDefinition,
  checkModulePermission
} from '../../utils/rbacPermissions';
import { useToast } from '../common/ToastContainer';
import { safeConfirm } from '../../utils/safeConfirm';
import {
  Users,
  ShieldCheck,
  Building,
  Key,
  Database,
  Lock,
  Unlock,
  CheckCircle2,
  Download,
  RotateCcw,
  Sparkles,
  Layers,
  Eye,
  EyeOff,
  ShieldAlert,
  UserCheck,
  ArrowRight,
  ExternalLink,
  HelpCircle,
  Info,
  Sliders,
  Check,
  X,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';

export const SettingsUsersModule: React.FC = () => {
  const {
    currentTenant,
    currentUser,
    currentRole,
    switchRole,
    users,
    resetToDemoData,
    savePhase1Registration,
    isPreviewRoleActive,
    previewRole,
    realAdminRole,
    isRealRoleAdmin,
    enableRolePreview,
    disableRolePreview,
    toggleRolePreview,
    canUserAccessModule,
    setActiveModule
  } = useGRC();
  const { showToast } = useToast();

  const [companyName, setCompanyName] = useState(currentTenant?.name || '');
  const [contactEmail, setContactEmail] = useState(currentTenant?.contactEmail || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Default selected non-admin role in preview inspector
  const [selectedPersonaRole, setSelectedPersonaRole] = useState<UserRole>(
    previewRole || 'INTERNAL_AUDITOR'
  );

  const handleTogglePreview = (checked: boolean) => {
    if (checked) {
      enableRolePreview(selectedPersonaRole);
      showToast({
        title: `Role Preview Activated`,
        message: `Now previewing the portal as ${ROLE_DEFINITIONS[selectedPersonaRole]?.title}. Navigating will simulate non-admin RBAC boundaries.`,
        type: 'info'
      });
    } else {
      disableRolePreview();
      showToast({
        title: `Exited Preview Mode`,
        message: `Administrative access (${realAdminRole}) restored.`,
        type: 'success'
      });
    }
  };

  const handleSelectRoleForPreview = (role: UserRole) => {
    setSelectedPersonaRole(role);
    if (isPreviewRoleActive) {
      enableRolePreview(role);
      showToast({
        title: `Simulated Role Changed`,
        message: `Switched preview to ${ROLE_DEFINITIONS[role]?.title}`,
        type: 'info'
      });
    }
  };

  const handleSaveTenantSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTenant) return;

    // Check if role has permission to edit tenant parameters
    const perm = checkModulePermission(currentRole, 'tenant_parameters_edit');
    if (!perm.allowed) {
      showToast({
        title: 'Permission Denied',
        message: `Non-admin persona (${currentRole}) cannot modify tenant governance settings under ISO 27001 A.5.15.`,
        type: 'error'
      });
      return;
    }

    savePhase1Registration({
      companyName,
      contactEmail,
      registeredCategory: currentTenant.registeredCategory,
      registeredAddress: currentTenant.registeredAddress,
      industryType: currentTenant.industryType
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
    showToast({
      title: 'Settings Saved',
      message: 'Organization configuration updated successfully.',
      type: 'success'
    });
  };

  const handleExportAuditPack = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentTenant, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `GRC_Audit_Pack_${currentTenant?.id}_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast({
      title: 'Audit Pack Exported',
      message: 'JSON compliance evidence bundle downloaded.',
      type: 'success'
    });
  };

  const activePersonaDef = ROLE_DEFINITIONS[selectedPersonaRole];
  const activeCurrentDef = ROLE_DEFINITIONS[currentRole];

  // RBAC permission check for modifying settings
  const canModifySettings = isRealRoleAdmin && !isPreviewRoleActive;

  return (
    <PageContainer id="settings-users-module">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950/40 border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400 px-2 py-0.5 rounded bg-sky-950 border border-sky-800">
                Governance Administration & RBAC
              </span>
              <span className="text-xs text-slate-400">
                Current Role: <span className="text-white font-bold">{currentRole}</span>
              </span>
              {isPreviewRoleActive && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center space-x-1 animate-pulse">
                  <Eye className="w-3 h-3" />
                  <span>Simulation Active</span>
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold text-white mt-1">
              Tenant Settings & Role-Based Access Control (RBAC)
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Configure organizational parameters, toggle <span className="text-amber-300 font-semibold">Preview as Role</span> to verify non-admin portal visibility and module permissions, or switch personas to test audit trails.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={handleExportAuditPack}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 shadow-sm transition"
              id="btn-export-audit-pack"
            >
              <Download className="w-4 h-4 text-sky-400" />
              <span>Export Complete Audit Pack (JSON)</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FEATURE 1: DEDICATED "PREVIEW AS ROLE" RBAC SIMULATION CONTROLLER */}
      {/* ========================================================================= */}
      <div className={`p-6 rounded-2xl border transition-all duration-300 shadow-xl ${
        isPreviewRoleActive
          ? 'bg-gradient-to-br from-slate-900 via-amber-950/20 to-slate-900 border-amber-500/50 ring-1 ring-amber-500/30 shadow-amber-950/20'
          : 'bg-slate-900/90 border-slate-800'
      }`}>
        {/* Top Control Bar with Toggle Switch */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center space-x-2.5">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
                isPreviewRoleActive
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-sky-500/10 border-sky-500/30 text-sky-400'
              }`}>
                <Eye className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <span>Preview as Role (RBAC Simulation)</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                  isPreviewRoleActive
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {isPreviewRoleActive ? 'Active Simulation' : 'Standard Admin Mode'}
                </span>
              </h2>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl">
              Enable this toggle to see exactly what non-admin employees, internal auditors, or board members see. Navigation menus and module access will strictly reflect their assigned ISO 27001 / MAS TRM access controls.
            </p>
          </div>

          {/* Master Toggle Switch */}
          <div className="flex items-center space-x-3 shrink-0 self-start sm:self-center">
            <span className="text-xs font-semibold text-slate-300">
              {isPreviewRoleActive ? (
                <span className="text-amber-300 font-bold flex items-center space-x-1">
                  <span>Simulating: {ROLE_DEFINITIONS[previewRole || selectedPersonaRole]?.title}</span>
                </span>
              ) : (
                <span className="text-slate-400">Preview as Non-Admin</span>
              )}
            </span>

            {/* Toggle Switch Element */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="toggle-preview-as-role"
                checked={isPreviewRoleActive}
                onChange={(e) => handleTogglePreview(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-6 after:transition-all peer-checked:bg-amber-500 peer-checked:after:bg-slate-950 peer-checked:after:border-amber-600 shadow-inner"></div>
            </label>

            {isPreviewRoleActive && (
              <button
                onClick={() => disableRolePreview()}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold transition flex items-center space-x-1.5"
                title="Exit preview and restore administrator permissions"
              >
                <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Exit Preview</span>
              </button>
            )}
          </div>
        </div>

        {/* Status Callout Banner when Preview is Active */}
        {isPreviewRoleActive && (
          <div className="mt-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-amber-200">
            <div className="flex items-center space-x-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="font-bold text-white">Live RBAC Filter Active:</span> Viewing the portal under{' '}
                <span className="font-bold text-amber-300 underline">{ROLE_DEFINITIONS[previewRole || selectedPersonaRole]?.title}</span>{' '}
                entitlements. Restricted modules will display access-denied boundaries.
              </div>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <span className="text-[11px] text-amber-300/80 font-mono">
                Admin Session: <span className="text-white font-bold">{realAdminRole}</span>
              </span>
            </div>
          </div>
        )}

        {/* Non-Admin Persona Selector Grid */}
        <div className="mt-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <Sliders className="w-3.5 h-3.5 text-sky-400" />
              <span>Select Non-Admin Persona to Simulate</span>
            </span>
            <span className="text-[11px] text-slate-400">
              Click a role card to inspect permissions or switch simulation
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {NON_ADMIN_PREVIEW_ROLES.map(role => {
              const def = ROLE_DEFINITIONS[role];
              const isSelected = selectedPersonaRole === role;
              const isCurrentlyPreviewing = isPreviewRoleActive && previewRole === role;

              return (
                <div
                  key={role}
                  onClick={() => handleSelectRoleForPreview(role)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all relative flex flex-col justify-between ${
                    isCurrentlyPreviewing
                      ? 'bg-amber-950/40 border-amber-500 shadow-md ring-2 ring-amber-500/30'
                      : isSelected
                      ? 'bg-slate-850 border-sky-500/60 shadow-sm'
                      : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/80 hover:border-slate-600'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${def.accentColor.badge}`}>
                        {def.tier}
                      </span>
                      {isCurrentlyPreviewing ? (
                        <span className="flex items-center space-x-1 text-[10px] font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/40">
                          <Eye className="w-3 h-3" />
                          <span>Simulating</span>
                        </span>
                      ) : isSelected ? (
                        <span className="text-[10px] font-semibold text-sky-400">Selected</span>
                      ) : null}
                    </div>

                    <div>
                      <h4 className="font-bold text-xs text-white">{def.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {def.shortDescription}
                      </p>
                    </div>
                  </div>

                  {/* Module Count Pill & Action Button */}
                  <div className="pt-3 mt-3 border-t border-slate-700/60 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400">
                      <span className="text-emerald-400 font-bold">{def.allowedModuleIds.length}</span> Permitted Modules
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        enableRolePreview(role);
                        showToast({
                          title: `Previewing as ${def.title}`,
                          message: `Portal views now filtered by ${def.tier} rules.`,
                          type: 'info'
                        });
                      }}
                      className={`text-[11px] font-bold px-2 py-1 rounded-lg transition ${
                        isCurrentlyPreviewing
                          ? 'bg-amber-500 text-slate-950 shadow-sm'
                          : 'bg-slate-700 hover:bg-slate-600 text-slate-200 hover:text-white'
                      }`}
                    >
                      {isCurrentlyPreviewing ? 'Active' : 'Preview →'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Deep Dive: Selected Role RBAC Entitlements & Test Suite */}
        {activePersonaDef && (
          <div className="mt-5 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-sky-400" />
                <h3 className="text-xs font-bold text-white">
                  Entitlements & Governance Scope for {activePersonaDef.title}
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] text-slate-400">Governance Level:</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${activePersonaDef.accentColor.badge}`}>
                  {activePersonaDef.tier}
                </span>
              </div>
            </div>

            {/* Functional Capabilities Checklist */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {[
                { label: 'Upload Evidence', allowed: activePersonaDef.capabilities.canUploadEvidence },
                { label: 'Verify Evidence', allowed: activePersonaDef.capabilities.canVerifyEvidence },
                { label: 'Raise CAPA Finding', allowed: activePersonaDef.capabilities.canRaiseFindings },
                { label: 'Lock SoA Baseline', allowed: activePersonaDef.capabilities.canLockSoA },
                { label: 'Execute Digital MoU', allowed: activePersonaDef.capabilities.canSignMoU },
                { label: 'Edit Tenant Config', allowed: activePersonaDef.capabilities.canEditTenantSettings },
              ].map((cap, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded-lg border text-[11px] flex items-center space-x-1.5 ${
                    cap.allowed
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  {cap.allowed ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <X className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  )}
                  <span className="font-medium truncate">{cap.label}</span>
                </div>
              ))}
            </div>

            {/* Modules Permitted vs Restricted */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* Authorized Modules */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span className="flex items-center space-x-1.5 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Permitted Modules ({activePersonaDef.allowedModuleIds.length})</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">Accessible in Portal</span>
                </div>
                <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto pr-1">
                  {activePersonaDef.allowedModuleIds.map(m => (
                    <button
                      key={m}
                      onClick={() => {
                        if (!isPreviewRoleActive) {
                          enableRolePreview(selectedPersonaRole);
                        }
                        setActiveModule(m);
                      }}
                      className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 hover:text-emerald-200 border border-emerald-500/30 transition flex items-center space-x-1 group"
                      title={`Navigate to ${m} as ${activePersonaDef.title}`}
                    >
                      <span>{m.replace(/_/g, ' ')}</span>
                      <ArrowRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Restricted Modules */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span className="flex items-center space-x-1.5 text-rose-400">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Restricted Modules ({activePersonaDef.restrictedModuleIds.length})</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">HTTP 403 Enforced</span>
                </div>
                <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto pr-1">
                  {activePersonaDef.restrictedModuleIds.map(m => (
                    <button
                      key={m}
                      onClick={() => {
                        if (!isPreviewRoleActive) {
                          enableRolePreview(selectedPersonaRole);
                        }
                        setActiveModule(m);
                      }}
                      className="text-[10px] px-2 py-0.5 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 border border-rose-500/30 transition flex items-center space-x-1 group"
                      title={`Click to test 403 access restriction for ${m}`}
                    >
                      <Lock className="w-2.5 h-2.5 text-rose-400" />
                      <span>{m.replace(/_/g, ' ')}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Test Simulation Action Row */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="text-slate-400 text-[11px] flex items-center space-x-1.5">
                <Info className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>
                  Tip: Clicking any module button above will immediately simulate navigating to that view as {activePersonaDef.title}.
                </span>
              </div>

              <div className="flex items-center space-x-2">
                {!isPreviewRoleActive ? (
                  <button
                    onClick={() => {
                      enableRolePreview(selectedPersonaRole);
                      setActiveModule('command_center');
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition flex items-center space-x-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Launch Preview as {activePersonaDef.title}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => disableRolePreview()}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 font-bold text-xs transition flex items-center space-x-1.5"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Exit Role Preview</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* GRID: STANDARD RBAC PERSONAS & TENANT CONFIG */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Full Organizational RBAC Hierarchy Switcher (7 Cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-sky-400" />
              <h3 className="text-sm font-bold text-white">Full RBAC Persona Directory</h3>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              Total Personas: {Object.keys(ROLE_DEFINITIONS).length}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Select a role to switch the primary active session identity, or use the <span className="text-amber-300 font-semibold">Preview as Role</span> toggle above for safe non-destructive simulation.
          </p>

          <div className="space-y-3">
            {(Object.keys(ROLE_DEFINITIONS) as UserRole[]).map(role => {
              const def = ROLE_DEFINITIONS[role];
              const isCurrentSessionRole = currentRole === role;
              const isSimulated = isPreviewRoleActive && previewRole === role;

              return (
                <div
                  key={role}
                  onClick={() => switchRole(role)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSimulated
                      ? 'bg-amber-950/40 border-amber-500/80 shadow-md ring-1 ring-amber-500/30'
                      : isCurrentSessionRole
                      ? 'bg-sky-950/60 border-sky-500/80 shadow-md ring-1 ring-sky-500/30'
                      : 'bg-slate-800/40 border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-xs text-white">{def.title}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${def.accentColor.badge}`}>
                        {def.tier}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {isSimulated ? (
                        <span className="text-xs text-amber-300 font-bold flex items-center space-x-1">
                          <Eye className="w-3.5 h-3.5" />
                          <span>Simulated</span>
                        </span>
                      ) : isCurrentSessionRole ? (
                        <span className="text-xs text-sky-400 font-bold flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Active Role</span>
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 hover:text-white">Switch →</span>
                      )}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">{def.shortDescription}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tenant Configuration & Demoworkspace Controls (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Building className="w-5 h-5 text-sky-400" />
                <h3 className="text-sm font-bold text-white">Tenant Parameters</h3>
              </div>
              {!canModifySettings && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/30 font-bold flex items-center space-x-1">
                  <Lock className="w-3 h-3" />
                  <span>Read-Only</span>
                </span>
              )}
            </div>

            {/* RBAC Notice if viewing as non-admin */}
            {!canModifySettings && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed text-[11px]">
                  <strong>RBAC Enforced:</strong> Non-admin users cannot alter organization legal parameters or email bindings (ISO 27001 Clause 5.3 & Control A.5.15).
                </p>
              </div>
            )}

            {saveSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Tenant profile updated successfully.</span>
              </div>
            )}

            <form onSubmit={handleSaveTenantSettings} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Company Legal Name</label>
                <input
                  type="text"
                  required
                  disabled={!canModifySettings}
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  className={`w-full px-3 py-2 text-xs rounded-xl border text-white focus:outline-none ${
                    canModifySettings
                      ? 'bg-slate-800 border-slate-700 focus:border-sky-500'
                      : 'bg-slate-900 border-slate-800 text-slate-400 cursor-not-allowed'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Primary Audit Contact Email</label>
                <input
                  type="email"
                  required
                  disabled={!canModifySettings}
                  value={contactEmail}
                  onChange={e => setContactEmail(e.target.value)}
                  className={`w-full px-3 py-2 text-xs rounded-xl border text-white focus:outline-none ${
                    canModifySettings
                      ? 'bg-slate-800 border-slate-700 focus:border-sky-500'
                      : 'bg-slate-900 border-slate-800 text-slate-400 cursor-not-allowed'
                  }`}
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!canModifySettings}
                  className={`w-full py-2 rounded-xl text-xs font-bold shadow-md transition ${
                    canModifySettings
                      ? 'bg-sky-600 hover:bg-sky-500 text-white cursor-pointer'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                  }`}
                >
                  {canModifySettings ? 'Save Organization Settings' : 'Locked (Admin Privilege Required)'}
                </button>
              </div>
            </form>
          </div>

          {/* Reset Demo Data Card */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-rose-900/40 space-y-3">
            <div className="flex items-center space-x-2 text-rose-400">
              <RotateCcw className="w-5 h-5" />
              <h3 className="text-sm font-bold text-white">Reset Demo Workspace</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Restore initial seed state with all pre-configured tenants, ISO 27001 Annex A controls, risks, and evidence items.
            </p>
            <button
              disabled={!canModifySettings}
              onClick={() => {
                if (safeConfirm('Reset all demo state to fresh default mock data?')) {
                  resetToDemoData();
                  showToast({
                    title: 'Workspace Reset',
                    message: 'Restored factory mock compliance state.',
                    type: 'info'
                  });
                }
              }}
              className={`w-full py-2 rounded-xl text-xs font-bold transition ${
                canModifySettings
                  ? 'bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 border border-slate-700/40 cursor-not-allowed'
              }`}
            >
              {canModifySettings ? 'Reset to Factory Demo State' : 'Reset Disabled in Role Preview'}
            </button>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
