import React, { useState } from 'react';
import {
  SlidersHorizontal,
  ArrowUpDown,
  RotateCcw,
  Sparkles,
  Check,
  ChevronDown,
  Layers,
  Save,
  HelpCircle,
  Move
} from 'lucide-react';
import { DashboardModuleConfig, PRIORITY_PRESETS, PriorityPreset } from './dashboardLayoutTypes';
import { useGRC } from '../../context/GRCContext';

interface DashboardPriorityBarProps {
  modules: DashboardModuleConfig[];
  activePresetId: string;
  isReorderMode: boolean;
  onToggleReorderMode: () => void;
  onSelectPreset: (preset: PriorityPreset) => void;
  onResetDefault: () => void;
  onOpenLayoutModal: () => void;
  onSaveLayout: () => void;
}

export const DashboardPriorityBar: React.FC<DashboardPriorityBarProps> = ({
  modules,
  activePresetId,
  isReorderMode,
  onToggleReorderMode,
  onSelectPreset,
  onResetDefault,
  onOpenLayoutModal,
  onSaveLayout
}) => {
  const { theme } = useGRC();
  const [presetDropdownOpen, setPresetDropdownOpen] = useState(false);

  const topPriorityModule = modules.find(m => m.visible) || modules[0];
  const activePreset = PRIORITY_PRESETS.find(p => p.id === activePresetId);

  return (
    <div className={`border rounded-xl p-3 space-y-2 transition-colors ${
      theme === 'light'
        ? 'bg-white/72 backdrop-blur-xl border-slate-200/68 shadow-[0_1px_2px_rgba(15,23,42,0.025),0_8px_24px_-4px_rgba(15,23,42,0.035),inset_0_1px_0_rgba(255,255,255,0.90)]'
        : 'bg-[#0D1424] border-[#1B2639] shadow-md'
    }`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        {/* Left: Drag-and-Drop info & Current #1 Priority */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-2">
            <div className={`p-1.5 rounded-lg border ${
              theme === 'light'
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                : 'bg-[#8B5CF6]/15 text-[#A78BFA] border-[#8B5CF6]/30'
            }`}>
              <ArrowUpDown className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className={`text-xs font-bold tracking-wide ${
                  theme === 'light' ? 'text-slate-900' : 'text-[#FFFFFF]'
                }`}>
                  Daily Priority Arrangement
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                  theme === 'light'
                    ? 'bg-slate-100 text-slate-700 border-slate-300 font-semibold'
                    : 'bg-[#111A2C] text-[#A7B0C0] border-[#1B2639]'
                }`}>
                  {modules.filter(m => m.visible).length} Modules Active
                </span>
              </div>
              <p className={`text-[11px] hidden sm:block ${
                theme === 'light' ? 'text-slate-500' : 'text-[#7F8BA3]'
              }`}>
                Drag any module card header to rearrange your daily compliance focus.
              </p>
            </div>
          </div>

          {/* Active #1 Priority Chip */}
          {topPriorityModule && (
            <div className={`hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border text-xs ${
              theme === 'light'
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-amber-500/10 border-amber-500/30 text-[#FFFFFF]'
            }`}>
              <span className={`text-[10px] font-bold uppercase ${
                theme === 'light' ? 'text-amber-800' : 'text-amber-400'
              }`}>
                Today's #1 Focus:
              </span>
              <span className={`font-semibold truncate max-w-[200px] ${
                theme === 'light' ? 'text-slate-900' : 'text-[#F8FAFC]'
              }`}>
                {topPriorityModule.shortTitle}
              </span>
            </div>
          )}
        </div>

        {/* Right: Controls (Preset Selector, Drag Mode, Layout Modal, Reset) */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Preset Selector Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setPresetDropdownOpen(!presetDropdownOpen)}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition cursor-pointer ${
                theme === 'light'
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                  : 'bg-[#111A2C] hover:bg-[#1B2639] text-[#F8FAFC] border-[#1B2639]'
              }`}
              title="Apply pre-configured compliance priority workflows"
            >
              <Layers className={`w-3.5 h-3.5 ${theme === 'light' ? 'text-indigo-600' : 'text-[#A78BFA]'}`} />
              <span>{activePreset?.label || 'Custom Priority'}</span>
              <ChevronDown className="w-3 h-3 text-[#7F8BA3]" />
            </button>

            {presetDropdownOpen && (
              <div className={`absolute right-0 mt-1.5 w-64 rounded-xl border shadow-2xl py-1 z-40 ${
                theme === 'light' ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0D1424] border-[#1B2639] text-[#F8FAFC]'
              }`}>
                <div className={`px-3 py-1.5 border-b text-[10px] font-bold uppercase ${
                  theme === 'light' ? 'border-slate-200 text-slate-500' : 'border-[#1B2639] text-[#7F8BA3]'
                }`}>
                  Select Daily Priority Workflow
                </div>
                {PRIORITY_PRESETS.map(preset => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      onSelectPreset(preset);
                      setPresetDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs transition flex flex-col space-y-0.5 cursor-pointer ${
                      activePresetId === preset.id
                        ? theme === 'light'
                          ? 'bg-indigo-50 text-indigo-900 font-semibold'
                          : 'bg-[#8B5CF6]/15 text-[#A78BFA] font-semibold'
                        : theme === 'light'
                          ? 'text-slate-700 hover:bg-slate-100'
                          : 'text-[#A7B0C0] hover:bg-[#111A2C]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{preset.label}</span>
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                        theme === 'light'
                          ? 'bg-slate-100 text-slate-600 border-slate-300'
                          : 'bg-[#111A2C] text-[#7F8BA3] border-[#1B2639]'
                      }`}>
                        {preset.badge}
                      </span>
                    </div>
                    <span className={`text-[10px] line-clamp-1 ${
                      theme === 'light' ? 'text-slate-500' : 'text-[#7F8BA3]'
                    }`}>{preset.description}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Drag & Drop Reorder Mode Toggle */}
          <button
            type="button"
            onClick={onToggleReorderMode}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
              isReorderMode
                ? 'bg-[#7C3AED] text-white border-[#7C3AED] shadow-xs animate-pulse'
                : theme === 'light'
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                  : 'bg-[#111A2C] hover:bg-[#1B2639] text-[#A7B0C0] border-[#1B2639]'
            }`}
            title="Toggle prominent drag guidelines and drop targets"
          >
            <Move className={`w-3.5 h-3.5 ${isReorderMode ? 'animate-bounce text-white' : 'text-[#7F8BA3]'}`} />
            <span>{isReorderMode ? 'Done Reordering' : 'Reorder Mode'}</span>
          </button>

          {/* Manage Layout Modal Trigger */}
          <button
            type="button"
            onClick={onOpenLayoutModal}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition cursor-pointer ${
              theme === 'light'
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                : 'bg-[#111A2C] hover:bg-[#1B2639] text-[#A7B0C0] border-[#1B2639]'
            }`}
            title="Open comprehensive module manager to toggle visibility and custom layout"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#7F8BA3]" />
            <span className="hidden sm:inline">Customize</span>
          </button>

          {/* Reset to Default */}
          <button
            type="button"
            onClick={onResetDefault}
            className={`p-1.5 rounded-lg border text-xs transition cursor-pointer ${
              theme === 'light'
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border-slate-300'
                : 'bg-[#111A2C] hover:bg-[#1B2639] text-[#7F8BA3] hover:text-[#FFFFFF] border-[#1B2639]'
            }`}
            title="Reset to recommended standard order"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Save Layout */}
          <button
            type="button"
            onClick={onSaveLayout}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold shadow-xs transition cursor-pointer"
            title="Save arrangement to profile and persistent storage"
          >
            <Save className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Save</span>
          </button>
        </div>
      </div>

      {/* Visual helper banner when Reorder Mode is active */}
      {isReorderMode && (
        <div className={`px-3 py-2 rounded-lg border text-xs flex items-center justify-between animate-fadeIn ${
          theme === 'light'
            ? 'bg-indigo-50 border-indigo-200 text-indigo-950'
            : 'bg-[#8B5CF6]/15 border-[#8B5CF6]/30 text-[#A78BFA]'
        }`}>
          <div className="flex items-center space-x-2">
            <Sparkles className={`w-4 h-4 shrink-0 ${theme === 'light' ? 'text-amber-600' : 'text-amber-400'}`} />
            <span>
              <strong>Reorder Mode Active:</strong> Click and drag any module card header to reposition it, or use the ▲ and ▼ buttons on each card for precise placement.
            </span>
          </div>
          <button
            type="button"
            onClick={onToggleReorderMode}
            className="text-[11px] font-bold text-white bg-[#8B5CF6] hover:bg-[#7C3AED] px-2.5 py-1 rounded-md ml-2 shrink-0 transition cursor-pointer"
          >
            Finish Reordering
          </button>
        </div>
      )}
    </div>
  );
};
