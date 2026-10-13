import React from 'react';
import { useGRC } from '../../context/GRCContext';
import { ROLE_DEFINITIONS } from '../../utils/rbacPermissions';
import { ShieldAlert, Lock, ArrowLeft, Eye, Sparkles, CheckCircle2, UserCheck } from 'lucide-react';

interface AccessRestrictedViewProps {
  moduleId: string;
  moduleName?: string;
  onGoBack?: () => void;
}

export const AccessRestrictedView: React.FC<AccessRestrictedViewProps> = ({
  moduleId,
  moduleName,
  onGoBack
}) => {
  const {
    currentRole,
    isPreviewRoleActive,
    previewRole,
    realAdminRole,
    disableRolePreview,
    setActiveModule
  } = useGRC();

  const roleDef = ROLE_DEFINITIONS[currentRole];
  const displayName = moduleName || moduleId.replace(/_/g, ' ').toUpperCase();

  return (
    <div className="p-6 lg:p-12 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[70vh] text-center space-y-6 animate-in fade-in-50 duration-200">
      {/* Icon Badge */}
      <div className="relative">
        <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border-2 border-rose-500/30 flex items-center justify-center text-rose-400 shadow-xl shadow-rose-950/40">
          <Lock className="w-10 h-10" />
        </div>
        <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-slate-900 border-2 border-rose-500 flex items-center justify-center text-rose-400 shadow-md">
          <ShieldAlert className="w-4 h-4" />
        </div>
      </div>

      {/* Header */}
      <div className="space-y-2 max-w-lg">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono font-bold tracking-wide">
          <span>HTTP 403 • RBAC ACCESS RESTRICTED</span>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">
          Restricted for {roleDef?.title || currentRole}
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          The <span className="text-white font-bold">{displayName}</span> module requires higher governance authorization than granted to the current role tier under ISO 27001 Clause 5.3 & Control A.5.15 (Access Control).
        </p>
      </div>

      {/* Preview Role Context Box */}
      {isPreviewRoleActive && (
        <div className="w-full max-w-lg p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-left space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-amber-300 text-xs font-bold">
              <Eye className="w-4 h-4" />
              <span>Active Simulation Mode</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-200 font-bold border border-amber-500/30">
              Admin Impersonation
            </span>
          </div>
          <p className="text-xs text-amber-200/90 leading-relaxed">
            You are currently viewing the portal through the lens of a <span className="font-bold underline">{roleDef?.title}</span>. Your real account possesses <span className="font-bold text-white">{realAdminRole}</span> administrative privileges.
          </p>
          <div className="pt-2 flex items-center space-x-3">
            <button
              onClick={() => disableRolePreview()}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition flex items-center space-x-1.5"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Exit Preview Mode (Return to {realAdminRole})</span>
            </button>
            <button
              onClick={() => setActiveModule('settings_users')}
              className="text-xs text-amber-300 hover:text-white transition font-semibold"
            >
              Configure RBAC →
            </button>
          </div>
        </div>
      )}

      {/* Permitted Modules Info */}
      <div className="w-full max-w-lg p-4 rounded-2xl bg-slate-900 border border-slate-800 text-left space-y-3">
        <div className="text-xs font-bold text-slate-300 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Modules Authorized for {roleDef?.title}:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {roleDef?.allowedModuleIds.slice(0, 8).map(m => (
            <button
              key={m}
              onClick={() => setActiveModule(m)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
            >
              {m.replace(/_/g, ' ')}
            </button>
          ))}
          {(roleDef?.allowedModuleIds.length || 0) > 8 && (
            <span className="text-[11px] px-2 py-1 text-slate-500">
              +{(roleDef?.allowedModuleIds.length || 0) - 8} more
            </span>
          )}
        </div>
      </div>

      {/* Navigation Return Button */}
      <div className="flex items-center space-x-3 pt-2">
        <button
          onClick={() => {
            if (onGoBack) onGoBack();
            else setActiveModule('command_center');
          }}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center space-x-2 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Command Center</span>
        </button>
      </div>
    </div>
  );
};
