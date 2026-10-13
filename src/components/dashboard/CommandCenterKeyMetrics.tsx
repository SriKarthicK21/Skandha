import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  SlidersHorizontal,
  ArrowUpDown,
  RotateCcw,
  Sparkles,
  Check,
  ChevronDown,
  ChevronUp,
  Layers,
  Save,
  ShieldAlert,
  Clock,
  Award,
  FileCheck2,
  Columns,
  Maximize2,
  Minimize2,
  AlertTriangle,
  Activity
} from 'lucide-react';
import {
  MetricWidgetConfig,
  MetricWidgetId,
  MetricWidgetSize,
  MetricPriorityArea,
  DEFAULT_METRIC_WIDGET_CONFIGS,
  METRIC_PRIORITY_PRESETS,
  MetricPriorityPreset
} from './metricWidgetTypes';
import { DraggableMetricWidget } from './DraggableMetricWidget';
import { CustomizeMetricWidgetsModal } from './CustomizeMetricWidgetsModal';
import { useGRC } from '../../context/GRCContext';
import { useToast } from '../common/ToastContainer';

interface CommandCenterKeyMetricsProps {
  onNavigateModule: (moduleId: string) => void;
  onOpenScoreModal?: () => void;
  criticalThreshold?: number;
  isAlertPulsingEnabled?: boolean;
  onOpenAlertThresholdModal?: () => void;
  density?: 'compact' | 'expanded';
  onDensityChange?: (density: 'compact' | 'expanded') => void;
  className?: string;
}

export const CommandCenterKeyMetrics: React.FC<CommandCenterKeyMetricsProps> = ({
  onNavigateModule,
  onOpenScoreModal,
  criticalThreshold = 85,
  isAlertPulsingEnabled = true,
  onOpenAlertThresholdModal,
  density = 'expanded',
  onDensityChange,
  className = ''
}) => {
  const { theme, currentTenant } = useGRC();
  const { showToast } = useToast();
  const isLight = theme === 'light';

  const [isReorderMode, setIsReorderMode] = useState<boolean>(false);
  const [activePresetId, setActivePresetId] = useState<MetricPriorityArea>('all');
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState<boolean>(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  // Drag state
  const [draggedWidgetId, setDraggedWidgetId] = useState<MetricWidgetId | null>(null);
  const [dragOverWidgetId, setDragOverWidgetId] = useState<MetricWidgetId | null>(null);
  const [dropPosition, setDropPosition] = useState<'before' | 'after' | null>(null);

  // Load saved layout from localStorage
  const getInitialWidgets = useCallback((): MetricWidgetConfig[] => {
    try {
      const tenantKey = currentTenant?.id || 'default';
      const saved = localStorage.getItem(`skanda_key_metrics_deck_${tenantKey}`);
      if (saved) {
        const parsed = JSON.parse(saved) as MetricWidgetConfig[];
        const savedIds = new Set(parsed.map(w => w.id));
        const missing = DEFAULT_METRIC_WIDGET_CONFIGS.filter(d => !savedIds.has(d.id));
        return [...parsed, ...missing];
      }
    } catch (e) {
      console.error('Failed to load metric widgets layout:', e);
    }
    return DEFAULT_METRIC_WIDGET_CONFIGS;
  }, [currentTenant?.id]);

  const [widgets, setWidgets] = useState<MetricWidgetConfig[]>(getInitialWidgets);

  // Sync on tenant change
  useEffect(() => {
    setWidgets(getInitialWidgets());
  }, [currentTenant?.id, getInitialWidgets]);

  // Save widgets to localStorage
  const saveWidgets = (updated: MetricWidgetConfig[], message?: string) => {
    setWidgets(updated);
    try {
      const tenantKey = currentTenant?.id || 'default';
      localStorage.setItem(`skanda_key_metrics_deck_${tenantKey}`, JSON.stringify(updated));
      if (message) {
        showToast({ title: 'Layout Updated', message, type: 'success' });
      }
    } catch (e) {
      console.error('Failed to save metric widgets:', e);
    }
  };

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, id: MetricWidgetId) => {
    setDraggedWidgetId(id);
    e.dataTransfer.effectAllowed = 'move';
    try {
      e.dataTransfer.setData('text/plain', id);
    } catch {}
  };

  const handleDragOver = (e: React.DragEvent, id: MetricWidgetId) => {
    e.preventDefault();
    if (!draggedWidgetId || draggedWidgetId === id) return;

    const targetRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const midpointX = targetRect.left + targetRect.width / 2;
    const isBefore = e.clientX < midpointX;

    setDragOverWidgetId(id);
    setDropPosition(isBefore ? 'before' : 'after');
  };

  const handleDragLeave = (_e: React.DragEvent, id: MetricWidgetId) => {
    if (dragOverWidgetId === id) {
      setDragOverWidgetId(null);
      setDropPosition(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetId: MetricWidgetId) => {
    e.preventDefault();
    if (!draggedWidgetId || draggedWidgetId === targetId) {
      handleDragEnd();
      return;
    }

    const currentList = [...widgets];
    const sourceIndex = currentList.findIndex(w => w.id === draggedWidgetId);
    const targetIndex = currentList.findIndex(w => w.id === targetId);

    if (sourceIndex === -1 || targetIndex === -1) {
      handleDragEnd();
      return;
    }

    const [movedWidget] = currentList.splice(sourceIndex, 1);
    const destinationIndex = dropPosition === 'after' ? targetIndex + 1 : targetIndex;
    const finalIndex = sourceIndex < destinationIndex ? destinationIndex - 1 : destinationIndex;

    currentList.splice(finalIndex, 0, movedWidget);

    const reindexed = currentList.map((w, idx) => ({ ...w, priorityRank: idx + 1 }));
    saveWidgets(reindexed, `Metric rearranged to #${finalIndex + 1} Priority`);
    handleDragEnd();
  };

  const handleDragEnd = () => {
    setDraggedWidgetId(null);
    setDragOverWidgetId(null);
    setDropPosition(null);
  };

  // Move left / right buttons
  const handleMoveLeft = (id: MetricWidgetId) => {
    const idx = widgets.findIndex(w => w.id === id);
    if (idx <= 0) return;
    const next = [...widgets];
    const [moved] = next.splice(idx, 1);
    next.splice(idx - 1, 0, moved);
    const reindexed = next.map((w, i) => ({ ...w, priorityRank: i + 1 }));
    saveWidgets(reindexed, `Moved ${moved.shortLabel} left to #${idx} Priority`);
  };

  const handleMoveRight = (id: MetricWidgetId) => {
    const idx = widgets.findIndex(w => w.id === id);
    if (idx >= widgets.length - 1) return;
    const next = [...widgets];
    const [moved] = next.splice(idx, 1);
    next.splice(idx + 1, 0, moved);
    const reindexed = next.map((w, i) => ({ ...w, priorityRank: i + 1 }));
    saveWidgets(reindexed, `Moved ${moved.shortLabel} right to #${idx + 2} Priority`);
  };

  // Resize handler
  const handleResize = (id: MetricWidgetId, newSize: MetricWidgetSize) => {
    const updated = widgets.map(w => (w.id === id ? { ...w, size: newSize } : w));
    const target = widgets.find(w => w.id === id);
    const sizeLabel = newSize === 'expanded' ? '3x Wide' : newSize === 'standard' ? '2x Standard' : '1x Compact';
    saveWidgets(updated, `Resized ${target?.shortLabel || 'widget'} to ${sizeLabel}`);
  };

  // Priority focus area preset selection
  const handleSelectPriorityArea = (presetId: MetricPriorityArea) => {
    setActivePresetId(presetId);
    const preset = METRIC_PRIORITY_PRESETS.find(p => p.id === presetId);
    if (!preset) return;

    const widgetMap = new Map(widgets.map(w => [w.id, w]));
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

    widgetMap.forEach(w => reordered.push(w));
    saveWidgets(reordered, `Applied Priority Focus: ${preset.label}`);
  };

  // Reset to default
  const handleResetDefault = () => {
    setActivePresetId('all');
    saveWidgets(DEFAULT_METRIC_WIDGET_CONFIGS, 'Reset key metric widgets to default balanced layout');
  };

  const visibleWidgets = widgets.filter(w => w.visible);
  const topWidget = visibleWidgets[0];

  return (
    <div id="command-center-key-metrics" className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
      isLight
        ? 'bg-slate-50/50 border-slate-200 shadow-xs'
        : 'bg-[#0D1424] border-[#1B2639] shadow-md'
    }`}>
      {/* Deck Header & Priority Focus Toolbar */}
      <div className={`p-3 sm:p-4 border-b flex flex-col lg:flex-row lg:items-center justify-between gap-3 ${
        isLight ? 'bg-white/80 border-slate-200' : 'bg-[#0D1424] border-[#1B2639]'
      }`}>
        {/* Left: Title + Priority Area Indicator */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className={`p-1.5 rounded-xl border ${
            isLight ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-[#8B5CF6]/15 text-[#A78BFA] border-[#8B5CF6]/30'
          }`}>
            <ArrowUpDown className="w-4 h-4" />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h2 className={`text-sm font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-[#FFFFFF]'}`}>
                Key Metric Widgets
              </h2>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                isLight ? 'bg-slate-100 text-slate-700 border-slate-300 font-semibold' : 'bg-[#111A2C] text-[#A7B0C0] border-[#1B2639]'
              }`}>
                {visibleWidgets.length} Active
              </span>
            </div>
            <p className={`text-[11px] hidden sm:block ${isLight ? 'text-slate-500' : 'text-[#7F8BA3]'}`}>
              Drag handles to rearrange order, or use the size toggle (1x, 2x, 3x) to customize widget prominence.
            </p>
          </div>

          {/* Current #1 Priority Area Badge */}
          {topWidget && (
            <div className={`hidden xl:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border text-xs ${
              isLight ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            }`}>
              <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">
                #1 Focus:
              </span>
              <span className="font-semibold truncate max-w-[140px] text-slate-900 dark:text-[#F8FAFC]">
                {topWidget.shortLabel}
              </span>
            </div>
          )}
        </div>

        {/* Right: Priority Areas Preset Filter Chips + Deck Controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Priority Areas Presets */}
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1 hidden sm:inline">
              Priority Focus:
            </span>

            {/* Risk Status Priority Button */}
            <button
              type="button"
              onClick={() => handleSelectPriorityArea('risk_status')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition flex items-center space-x-1 cursor-pointer ${
                activePresetId === 'risk_status'
                  ? isLight
                    ? 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA] shadow-xs font-bold'
                    : 'bg-rose-950/80 text-rose-300 border-rose-500/50 shadow-xs'
                  : isLight
                  ? 'bg-white hover:bg-[#F8FAFC] text-[#475569] border-[#CBD5E1]'
                  : 'bg-[#111A2C] hover:bg-[#1B2639] text-[#A7B0C0] border-[#1B2639]'
              }`}
              title="Prioritize & Expand Risk Status & Residual Exposure"
            >
              <ShieldAlert className="w-3 h-3 text-[#DC2626]" />
              <span>Risk Status</span>
            </button>

            {/* Tasks Due Priority Button */}
            <button
              type="button"
              onClick={() => handleSelectPriorityArea('tasks_due')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition flex items-center space-x-1 cursor-pointer ${
                activePresetId === 'tasks_due'
                  ? isLight
                    ? 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A] shadow-xs font-bold'
                    : 'bg-amber-950/80 text-amber-300 border-amber-500/50 shadow-xs'
                  : isLight
                  ? 'bg-white hover:bg-[#F8FAFC] text-[#475569] border-[#CBD5E1]'
                  : 'bg-[#111A2C] hover:bg-[#1B2639] text-[#A7B0C0] border-[#1B2639]'
              }`}
              title="Prioritize & Expand Urgent Tasks Due & CAPA Remediation"
            >
              <Clock className="w-3 h-3 text-[#D97706]" />
              <span>Tasks Due</span>
            </button>

            {/* Audit Readiness Priority Button */}
            <button
              type="button"
              onClick={() => handleSelectPriorityArea('audit_readiness')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition flex items-center space-x-1 cursor-pointer ${
                activePresetId === 'audit_readiness'
                  ? isLight
                    ? 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE] shadow-xs font-bold'
                    : 'bg-purple-950/80 text-purple-300 border-purple-500/50 shadow-xs'
                  : isLight
                  ? 'bg-white hover:bg-[#F8FAFC] text-[#475569] border-[#CBD5E1]'
                  : 'bg-[#111A2C] hover:bg-[#1B2639] text-[#A7B0C0] border-[#1B2639]'
              }`}
              title="Prioritize Audit Readiness & Stage 1/2 Qualification"
            >
              <Award className="w-3 h-3 text-[#2563EB]" />
              <span>Audit Crunch</span>
            </button>

            {/* Balanced / All Button */}
            <button
              type="button"
              onClick={() => handleSelectPriorityArea('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                activePresetId === 'all'
                  ? isLight
                    ? 'bg-[#0F2747] text-white border-[#0F2747] shadow-xs font-bold'
                    : 'bg-[#7C3AED] text-white border-[#7C3AED] shadow-xs'
                  : isLight
                  ? 'bg-white hover:bg-[#F8FAFC] text-[#475569] border-[#CBD5E1]'
                  : 'bg-[#111A2C] hover:bg-[#1B2639] text-[#A7B0C0] border-[#1B2639]'
              }`}
              title="Reset to Balanced Standard Overview"
            >
              Balanced
            </button>
          </div>

          <span className={`hidden sm:inline ${isLight ? 'text-slate-300' : 'text-[#1B2639]'}`}>|</span>

          {/* Reorder Mode Highlight Toggle */}
          <button
            type="button"
            onClick={() => setIsReorderMode(prev => !prev)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition flex items-center space-x-1.5 cursor-pointer ${
              isReorderMode
                ? isLight
                  ? 'bg-[#0F2747] text-white border-[#0F2747] shadow-xs'
                  : 'bg-[#7C3AED] text-white border-[#7C3AED] shadow-xs'
                : isLight
                ? 'bg-white hover:bg-[#F8FAFC] text-[#475569] border-[#CBD5E1]'
                : 'bg-[#111A2C] hover:bg-[#1B2639] text-[#A7B0C0] border-[#1B2639]'
            }`}
            title="Toggle Visual Reorder Guide"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>{isReorderMode ? 'Done Reordering' : 'Reorder Mode'}</span>
          </button>

          {/* Compact / Expanded Density Toggle */}
          {onDensityChange && (
            <button
              type="button"
              id="command-center-metrics-deck-density-btn"
              onClick={() => onDensityChange(density === 'compact' ? 'expanded' : 'compact')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition flex items-center space-x-1.5 cursor-pointer ${
                density === 'compact'
                  ? isLight
                    ? 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE] shadow-2xs font-bold'
                    : 'bg-[#8B5CF6]/20 text-[#C4B5FD] border-[#8B5CF6]/40 hover:bg-[#8B5CF6]/30 shadow-xs'
                  : isLight
                  ? 'bg-white hover:bg-[#F8FAFC] text-[#475569] border-[#CBD5E1]'
                  : 'bg-[#111A2C] hover:bg-[#1B2639] text-[#A7B0C0] border-[#1B2639]'
              }`}
              title={
                density === 'compact'
                  ? 'Compact View Active (Sparklines & trends hidden). Click for Expanded View.'
                  : 'Expanded View Active (Sparklines & trends shown). Click for Compact View.'
              }
            >
              {density === 'compact' ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>Compact</span>
                </>
              ) : (
                <>
                  <Activity className="w-3.5 h-3.5 text-[#475569]" />
                  <span>Expanded</span>
                </>
              )}
            </button>
          )}

          {/* Alert Thresholds Modal Trigger */}
          {onOpenAlertThresholdModal && (
            <button
              type="button"
              onClick={onOpenAlertThresholdModal}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition flex items-center space-x-1.5 cursor-pointer ${
                isLight
                  ? 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA] hover:bg-[#FEE2E2] shadow-2xs'
                  : 'bg-rose-950/60 text-rose-300 border-rose-500/40 hover:bg-rose-950/90 shadow-xs'
              }`}
              title={`Configure KPI Visual Alert Threshold (Current: < ${criticalThreshold}%)`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-[#DC2626]" />
              <span className="hidden sm:inline">Alert:</span>
              <span className="font-mono font-bold">&lt;{criticalThreshold}%</span>
            </button>
          )}

          {/* Customize Widgets Modal Trigger */}
          <button
            type="button"
            onClick={() => setIsCustomizeModalOpen(true)}
            className={`p-1.5 rounded-lg border transition cursor-pointer ${
              isLight
                ? 'bg-white hover:bg-[#F8FAFC] text-[#475569] hover:text-[#0F172A] border-[#CBD5E1]'
                : 'bg-[#111A2C] hover:bg-[#1B2639] text-[#A7B0C0] border-[#1B2639]'
            }`}
            title="Open Metric Customization Modal (Show/Hide, Resize, Reorder)"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>

          {/* Collapse / Expand Deck */}
          <button
            type="button"
            onClick={() => setIsCollapsed(prev => !prev)}
            className={`p-1.5 rounded-lg border transition cursor-pointer ${
              isLight
                ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                : 'bg-[#111A2C] hover:bg-[#1B2639] text-[#A7B0C0] border-[#1B2639]'
            }`}
            title={isCollapsed ? 'Expand Metric Widgets' : 'Minimize Metric Widgets'}
          >
            {isCollapsed ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Grid of Key Metric Widgets */}
      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="p-4 sm:p-5 overflow-hidden"
          >
            <div
              className={`grid grid-cols-12 gap-4 sm:gap-5 lg:gap-6 items-stretch stagger-cards ${className}`.trim()}
            >
              {visibleWidgets.map((widget, index) => (
                <DraggableMetricWidget
                  key={widget.id}
                  widget={widget}
                  priorityIndex={index}
                  totalWidgets={visibleWidgets.length}
                  isReorderMode={isReorderMode}
                  isDragging={draggedWidgetId === widget.id}
                  isDragOver={dragOverWidgetId === widget.id}
                  dropPosition={dragOverWidgetId === widget.id ? dropPosition : null}
                  criticalThreshold={criticalThreshold}
                  isAlertPulsingEnabled={isAlertPulsingEnabled}
                  density={density}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onDragEnd={handleDragEnd}
                  onMoveLeft={handleMoveLeft}
                  onMoveRight={handleMoveRight}
                  onResize={handleResize}
                  onNavigateModule={onNavigateModule}
                  onOpenScoreModal={onOpenScoreModal}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Customize Metric Widgets Modal */}
      <CustomizeMetricWidgetsModal
        isOpen={isCustomizeModalOpen}
        onClose={() => setIsCustomizeModalOpen(false)}
        widgets={widgets}
        activePresetId={activePresetId}
        onSaveWidgets={(updated, presetId) => {
          if (presetId) setActivePresetId(presetId);
          saveWidgets(updated, 'Key metric widgets layout saved to your profile');
        }}
        onResetDefault={handleResetDefault}
      />
    </div>
  );
};
