import React, { useState } from 'react';
import { useGRC } from '../../context/GRCContext';
import { UserRole } from '../../types';
import { ROLE_DEFINITIONS, NON_ADMIN_PREVIEW_ROLES } from '../../utils/rbacPermissions';
import { useToast } from '../common/ToastContainer';
import {
  Eye,
  X,
  ChevronDown,
  Shield,
  UserCheck,
  Sliders,
  CheckCircle2,
  Info
} from 'lucide-react';

export const RolePreviewBanner: React.FC = () => {
  const {
    isPreviewRoleActive,
    previewRole,
    realAdminRole,
    disableRolePreview,
    enableRolePreview,
    setActiveModule
  } = useGRC();
  const { showToast } = useToast();

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  if (!isPreviewRoleActive || !previewRole) {
    return null;
  }

  const roleDef = ROLE_DEFINITIONS[previewRole];

  return (
    <div className="bg-gradient-to-r from-amber-500/20 via-amber-500/15 to-orange-500/20 border-b border-amber-500/40 px-4 py-2 text-xs text-amber-200 z-50 sticky top-0 backdrop-blur-md shadow-lg shadow-amber-950/20 select-none animate-in slide-in-from-top-2 duration-200">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        {/* Left: Preview Status & Role Identifier */}
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-amber-500/30 border border-amber-400/50 text-amber-100 font-bold text-[10px] tracking-wider uppercase shrink-0 animate-pulse">
            <Eye className="w-3 h-3 text-amber-300" />
            <span>Role Preview Mode</span>
          </div>

          <div className="flex items-center space-x-2 min-w-0 truncate">
            <span className="text-slate-300 text-xs hidden md:inline">Viewing portal as:</span>
            <span className={`font-bold text-xs px-2 py-0.5 rounded-lg border truncate ${roleDef?.accentColor.badge || 'bg-slate-800 text-white'}`}>
              {roleDef?.title || previewRole}
            </span>
            <span className="text-[11px] text-amber-300/80 font-mono hidden lg:inline">
              ({roleDef?.tier})
            </span>
          </div>
        </div>

        {/* Center/Right: Role Switcher, RBAC Info & Exit Action */}
        <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
          {/* Quick Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-900 text-amber-200 hover:text-white border border-amber-500/30 text-[11px] font-medium transition"
              title="Switch to another non-admin persona"
            >
              <span>Switch Persona</span>
              <ChevronDown className="w-3 h-3 text-amber-400" />
            </button>

            {roleDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-64 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-1.5 z-50 animate-in fade-in-50 duration-100">
                <div className="px-2 py-1 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-800 mb-1 tracking-wider">
                  Select Simulated Role
                </div>
                {NON_ADMIN_PREVIEW_ROLES.map(r => {
                  const def = ROLE_DEFINITIONS[r];
                  const isCurrent = previewRole === r;
                  return (
                    <button
                      key={r}
                      onClick={() => {
                        enableRolePreview(r);
                        setRoleDropdownOpen(false);
                        showToast({
                          title: `Previewing as ${def.title}`,
                          message: `Permissions adjusted to ${def.tier}`,
                          type: 'info'
                        });
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition flex items-center justify-between ${
                        isCurrent
                          ? 'bg-amber-500/20 text-amber-300 font-bold'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-[11px]">{def.title}</div>
                        <div className="text-[9px] text-slate-400">{def.tier}</div>
                      </div>
                      {isCurrent && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Jump to SettingsUsersModule / RBAC matrix */}
          <button
            onClick={() => setActiveModule('settings_users')}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-900/60 hover:bg-slate-900 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-medium transition"
            title="Inspect full RBAC Permissions Matrix in Settings"
          >
            <Sliders className="w-3 h-3 text-slate-400" />
            <span className="hidden md:inline">Permissions</span>
          </button>

          {/* Primary Exit Button */}
          <button
            onClick={() => {
              disableRolePreview();
              showToast({
                title: 'Exited Role Preview',
                message: `Restored ${realAdminRole} administrator permissions.`,
                type: 'success'
              });
            }}
            className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition"
            title={`Exit preview and restore ${realAdminRole}`}
            id="btn-exit-role-preview"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Exit Preview</span>
          </button>
        </div>
      </div>
    </div>
  );
};
