import React, { useState } from 'react';
import {
  X,
  GripVertical,
  SlidersHorizontal,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Columns2,
  RotateCcw,
  Check,
  Star,
  Sparkles,
  Layers,
  Save
} from 'lucide-react';
import {
  DashboardModuleConfig,
  DashboardModuleId,
  PRIORITY_PRESETS,
  PriorityPreset,
  DailyPriorityTier
} from './dashboardLayoutTypes';

interface DashboardLayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  modules: DashboardModuleConfig[];
  onSaveModules: (updatedModules: DashboardModuleConfig[]) => void;
  onResetDefault: () => void;
}

export const DashboardLayoutModal: React.FC<DashboardLayoutModalProps> = ({
  isOpen,
  onClose,
  modules,
  onSaveModules,
  onResetDefault
}) => {
  if (!isOpen) return null;

  // Local state for modal editing
  const [localModules, setLocalModules] = useState<DashboardModuleConfig[]>([...modules]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const next = [...localModules];
    const [moved] = next.splice(index, 1);
    next.splice(index - 1, 0, moved);
    setLocalModules(next);
  };

  const handleMoveDown = (index: number) => {
    if (index === localModules.length - 1) return;
    const next = [...localModules];
    const [moved] = next.splice(index, 1);
    next.splice(index + 1, 0, moved);
    setLocalModules(next);
  };

  const handleToggleVisibility = (id: DashboardModuleId) => {
    setLocalModules(prev =>
      prev.map(m => (m.id === id ? { ...m, visible: !m.visible } : m))
    );
  };

  const handleToggleWidth = (id: DashboardModuleId) => {
    setLocalModules(prev =>
      prev.map(m =>
        m.id === id ? { ...m, colSpan: m.colSpan === 12 ? 6 : 12 } : m
      )
    );
  };

  const handleTierChange = (id: DashboardModuleId, tier: DailyPriorityTier) => {
    setLocalModules(prev =>
      prev.map(m => (m.id === id ? { ...m, priorityTier: tier } : m))
    );
  };

  // Drag & drop in modal list
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;
    const next = [...localModules];
    const [dragged] = next.splice(draggedIndex, 1);
    next.splice(targetIndex, 0, dragged);
    setLocalModules(next);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleApplyPreset = (preset: PriorityPreset) => {
    const next = [...localModules].sort((a, b) => {
      const idxA = preset.order.indexOf(a.id);
      const idxB = preset.order.indexOf(b.id);
      return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
    });
    setLocalModules(next);
  };

  const handleSave = () => {
    onSaveModules(localModules);
    onClose();
  };

  const handleReset = () => {
    onResetDefault();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Customize Daily Priorities & Layout</h3>
              <p className="text-xs text-slate-400">
                Drag modules into your prioritized daily order or toggle widths.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets Bar */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">Quick Priority Presets</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {PRIORITY_PRESETS.map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition flex flex-col justify-between group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 group-hover:text-indigo-300">
                    {p.label}
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                    {p.badge}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 line-clamp-1">{p.description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Draggable Module List */}
        <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase px-1">
            <span>Daily Priority Sequence (Top to Bottom)</span>
            <span>Controls & Width</span>
          </div>

          <div className="space-y-2">
            {localModules.map((mod, index) => {
              const isOver = dragOverIndex === index;
              const isDraggingThis = draggedIndex === index;

              return (
                <div
                  key={mod.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    isDraggingThis
                      ? 'opacity-40 border-dashed border-indigo-500 bg-slate-950'
                      : isOver
                      ? 'border-indigo-400 bg-indigo-950/30 scale-[1.01]'
                      : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                  }`}
                >
                  {/* Left: Drag Handle, Priority Pill & Title */}
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div
                      className="cursor-grab active:cursor-grabbing text-slate-500 hover:text-indigo-400 p-1 rounded transition"
                      title="Drag to reposition"
                    >
                      <GripVertical className="w-4 h-4" />
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono border shrink-0 ${
                        index === 0
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : index === 1
                          ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      #{index + 1}
                    </span>

                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-white truncate">
                          {mod.shortTitle}
                        </span>
                        {!mod.visible && (
                          <span className="text-[10px] text-rose-400 font-semibold">(Hidden)</span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 truncate block">
                        {mod.category}
                      </span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center space-x-1.5 shrink-0">
                    {/* Width Button */}
                    <button
                      type="button"
                      onClick={() => handleToggleWidth(mod.id)}
                      className={`px-2 py-1 rounded-md text-[11px] font-mono border transition ${
                        mod.colSpan === 12
                          ? 'bg-slate-800 text-slate-300 border-slate-700'
                          : 'bg-indigo-950 text-indigo-300 border-indigo-700'
                      }`}
                      title={mod.colSpan === 12 ? 'Set Half Width (6-col)' : 'Set Full Width (12-col)'}
                    >
                      {mod.colSpan === 12 ? 'Full Width' : 'Half Width'}
                    </button>

                    {/* Visibility Toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleVisibility(mod.id)}
                      className={`p-1.5 rounded-lg border transition ${
                        mod.visible
                          ? 'bg-slate-800 text-emerald-400 border-slate-700 hover:bg-slate-750'
                          : 'bg-rose-950/40 text-rose-400 border-rose-800 hover:bg-rose-950/60'
                      }`}
                      title={mod.visible ? 'Hide from dashboard' : 'Show on dashboard'}
                    >
                      {mod.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>

                    {/* Move Up */}
                    <button
                      type="button"
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-25 transition"
                      title="Move Up"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>

                    {/* Move Down */}
                    <button
                      type="button"
                      onClick={() => handleMoveDown(index)}
                      disabled={index === localModules.length - 1}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-25 transition"
                      title="Move Down"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Default</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs transition"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Apply & Save Layout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
