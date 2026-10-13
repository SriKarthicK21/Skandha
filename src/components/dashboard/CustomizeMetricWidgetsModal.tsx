import React, { useState } from 'react';
import {
  X,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Columns,
  RotateCcw,
  Check,
  Star,
  Sparkles,
  SlidersHorizontal,
  Save,
  ShieldAlert,
  Clock
} from 'lucide-react';
import {
  MetricWidgetConfig,
  MetricWidgetId,
  MetricWidgetSize,
  METRIC_PRIORITY_PRESETS,
  MetricPriorityArea
} from './metricWidgetTypes';
import { useGRC } from '../../context/GRCContext';

interface CustomizeMetricWidgetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  widgets: MetricWidgetConfig[];
  activePresetId: MetricPriorityArea;
  onSaveWidgets: (updatedWidgets: MetricWidgetConfig[], presetId?: MetricPriorityArea) => void;
  onResetDefault: () => void;
}

export const CustomizeMetricWidgetsModal: React.FC<CustomizeMetricWidgetsModalProps> = ({
  isOpen,
  onClose,
  widgets,
  activePresetId,
  onSaveWidgets,
  onResetDefault
}) => {
  const { theme } = useGRC();
  const isLight = theme === 'light';

  const [localWidgets, setLocalWidgets] = useState<MetricWidgetConfig[]>([...widgets]);
  const [localPresetId, setLocalPresetId] = useState<MetricPriorityArea>(activePresetId);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const next = [...localWidgets];
    const [moved] = next.splice(index, 1);
    next.splice(index - 1, 0, moved);
    setLocalWidgets(next);
  };

  const handleMoveDown = (index: number) => {
    if (index === localWidgets.length - 1) return;
    const next = [...localWidgets];
    const [moved] = next.splice(index, 1);
    next.splice(index + 1, 0, moved);
    setLocalWidgets(next);
  };

  const handleToggleVisibility = (id: MetricWidgetId) => {
    setLocalWidgets(prev =>
      prev.map(w => (w.id === id ? { ...w, visible: !w.visible } : w))
    );
  };

  const handleSizeChange = (id: MetricWidgetId, size: MetricWidgetSize) => {
    setLocalWidgets(prev =>
      prev.map(w => (w.id === id ? { ...w, size } : w))
    );
  };

  const handleApplyPreset = (presetId: MetricPriorityArea) => {
    const preset = METRIC_PRIORITY_PRESETS.find(p => p.id === presetId);
    if (!preset) return;

    setLocalPresetId(presetId);
    const widgetMap = new Map(localWidgets.map(w => [w.id, w]));

    const reordered: MetricWidgetConfig[] = [];
    preset.order.forEach((id, idx) => {
      const existing = widgetMap.get(id);
      if (existing) {
        reordered.push({
          ...existing,
          size: preset.sizes[id] || existing.size,
          priorityRank: idx + 1,
          visible: true
        });
        widgetMap.delete(id);
      }
    });

    // Add any remaining widgets
    widgetMap.forEach(w => reordered.push(w));
    setLocalWidgets(reordered);
  };

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
    const next = [...localWidgets];
    const [dragged] = next.splice(draggedIndex, 1);
    next.splice(targetIndex, 0, dragged);
    setLocalWidgets(next);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleSave = () => {
    onSaveWidgets(localWidgets, localPresetId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-3xl rounded-2xl shadow-2xl border flex flex-col max-h-[88vh] overflow-hidden ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
        }`}
      >
        {/* Modal Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl border ${
              isLight ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-indigo-900/30 text-indigo-400 border-indigo-700/50'
            }`}>
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Customize Key Metric Widgets</h2>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Rearrange, resize width, and set priority focus areas for top-line metrics.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition ${
              isLight ? 'hover:bg-slate-200 text-slate-500' : 'hover:bg-slate-800 text-slate-400'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Priority Area Quick Presets Bar */}
        <div className={`px-6 py-3 border-b flex flex-wrap items-center justify-between gap-2 text-xs ${
          isLight ? 'bg-slate-100/60 border-slate-200' : 'bg-slate-900/60 border-slate-800'
        }`}>
          <div className="flex items-center space-x-2">
            <span className="font-bold uppercase text-[10px] tracking-wider text-slate-400">
              Quick Priority Focus:
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {METRIC_PRIORITY_PRESETS.map(preset => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleApplyPreset(preset.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                    localPresetId === preset.id
                      ? isLight
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
                      : isLight
                      ? 'bg-white hover:bg-slate-200 text-slate-700 border-slate-300'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              onResetDefault();
              onClose();
            }}
            className={`flex items-center space-x-1 text-xs font-semibold px-2.5 py-1 rounded-md transition ${
              isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>

        {/* Modal List Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-2.5">
          {localWidgets.map((widget, idx) => (
            <div
              key={widget.id}
              draggable
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDrop={(e) => handleDrop(e, idx)}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                dragOverIndex === idx
                  ? 'border-indigo-500 bg-indigo-50/20'
                  : isLight
                  ? 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                  : 'bg-slate-800/60 border-slate-700/70 hover:border-slate-600'
              }`}
            >
              {/* Left: Grip + Ranking + Title */}
              <div className="flex items-center space-x-3 min-w-0">
                <div className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-indigo-500 p-1">
                  <GripVertical className="w-4 h-4" />
                </div>
                <span className={`w-6 h-6 rounded-md flex items-center justify-center font-mono text-xs font-bold border shrink-0 ${
                  idx === 0
                    ? isLight ? 'bg-amber-50 text-amber-800 border-amber-300' : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : isLight ? 'bg-slate-100 text-slate-700 border-slate-300' : 'bg-slate-700 text-slate-300 border-slate-600'
                }`}>
                  #{idx + 1}
                </span>

                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs truncate">{widget.title}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold ${
                      widget.priorityArea === 'Risk Status'
                        ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/50'
                        : widget.priorityArea === 'Tasks Due'
                        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/50'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}>
                      {widget.priorityArea}
                    </span>
                  </div>
                  <p className={`text-[11px] truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    {widget.description}
                  </p>
                </div>
              </div>

              {/* Right: Controls (Move Up/Down, Size selector, Show/Hide) */}
              <div className="flex items-center space-x-2 shrink-0">
                {/* Size Selector */}
                <div className={`flex items-center p-0.5 rounded-lg border text-[10px] font-mono ${
                  isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-700'
                }`}>
                  <button
                    type="button"
                    onClick={() => handleSizeChange(widget.id, 'compact')}
                    className={`px-2 py-0.5 rounded font-semibold transition ${
                      widget.size === 'compact'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    1x Compact
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSizeChange(widget.id, 'standard')}
                    className={`px-2 py-0.5 rounded font-semibold transition ${
                      widget.size === 'standard'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    2x Standard
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSizeChange(widget.id, 'expanded')}
                    className={`px-2 py-0.5 rounded font-semibold transition ${
                      widget.size === 'expanded'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    3x Wide
                  </button>
                </div>

                {/* Move Up/Down */}
                <div className="flex items-center space-x-0.5">
                  <button
                    type="button"
                    onClick={() => handleMoveUp(idx)}
                    disabled={idx === 0}
                    className={`p-1 rounded transition disabled:opacity-30 ${
                      isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-slate-800 text-slate-400'
                    }`}
                    title="Move Up"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveDown(idx)}
                    disabled={idx === localWidgets.length - 1}
                    className={`p-1 rounded transition disabled:opacity-30 ${
                      isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-slate-800 text-slate-400'
                    }`}
                    title="Move Down"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                {/* Visibility Toggle */}
                <button
                  type="button"
                  onClick={() => handleToggleVisibility(widget.id)}
                  className={`p-1.5 rounded-lg border transition ${
                    widget.visible
                      ? isLight
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        : 'bg-indigo-950/40 text-indigo-400 border-indigo-800/40'
                      : isLight
                      ? 'bg-slate-100 text-slate-400 border-slate-200'
                      : 'bg-slate-800 text-slate-500 border-slate-700'
                  }`}
                  title={widget.visible ? 'Hide metric widget' : 'Show metric widget'}
                >
                  {widget.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className={`px-6 py-3.5 border-t flex items-center justify-between ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
        }`}>
          <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            {localWidgets.filter(w => w.visible).length} of {localWidgets.length} metrics enabled
          </span>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
                isLight ? 'border-slate-300 hover:bg-slate-100 text-slate-700' : 'border-slate-700 hover:bg-slate-800 text-slate-300'
              }`}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Apply Custom Layout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
