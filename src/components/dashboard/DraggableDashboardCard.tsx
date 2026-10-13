import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  GripVertical,
  ChevronUp,
  ChevronDown,
  Columns2,
  Maximize2,
  Minimize2,
  EyeOff,
  Star,
  Sparkles,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { DashboardModuleConfig, DashboardModuleId } from './dashboardLayoutTypes';
import { useGRC } from '../../context/GRCContext';

interface DraggableDashboardCardProps {
  module: DashboardModuleConfig;
  priorityIndex: number;
  totalModules: number;
  isReorderMode: boolean;
  isDragging: boolean;
  isDragOver: boolean;
  dropPosition: 'before' | 'after' | null;
  onDragStart: (e: React.DragEvent, id: DashboardModuleId) => void;
  onDragOver: (e: React.DragEvent, id: DashboardModuleId) => void;
  onDragLeave: (e: React.DragEvent, id: DashboardModuleId) => void;
  onDrop: (e: React.DragEvent, id: DashboardModuleId) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onMoveUp: (id: DashboardModuleId) => void;
  onMoveDown: (id: DashboardModuleId) => void;
  onToggleWidth: (id: DashboardModuleId) => void;
  onToggleCollapse: (id: DashboardModuleId) => void;
  onHide?: (id: DashboardModuleId) => void;
  children: React.ReactNode;
}

export const DraggableDashboardCard: React.FC<DraggableDashboardCardProps> = ({
  module,
  priorityIndex,
  totalModules,
  isReorderMode,
  isDragging,
  isDragOver,
  dropPosition,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  onMoveUp,
  onMoveDown,
  onToggleWidth,
  onToggleCollapse,
  onHide,
  children
}) => {
  const { theme } = useGRC();
  const [isHovered, setIsHovered] = useState(false);

  // Priority Tier styling
  const getPriorityBadge = (index: number) => {
    if (index === 0) {
      return {
        bg: theme === 'light'
          ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-xs'
          : 'bg-amber-500/15 text-amber-300 border-amber-500/30 shadow-xs',
        label: '#1 Top Daily Focus',
        icon: Star,
        iconColor: theme === 'light' ? 'text-amber-600 fill-amber-500' : 'text-amber-400 fill-amber-400'
      };
    }
    if (index === 1) {
      return {
        bg: theme === 'light'
          ? 'bg-indigo-50 text-indigo-800 border-indigo-300'
          : 'bg-[#8B5CF6]/15 text-[#A78BFA] border-[#8B5CF6]/30',
        label: `#2 Key Priority`,
        icon: Sparkles,
        iconColor: theme === 'light' ? 'text-indigo-600' : 'text-[#A78BFA]'
      };
    }
    if (index === 2) {
      return {
        bg: theme === 'light'
          ? 'bg-sky-50 text-sky-800 border-sky-300'
          : 'bg-sky-500/15 text-sky-300 border-sky-500/30',
        label: `#3 In Scope`,
        icon: null,
        iconColor: theme === 'light' ? 'text-sky-600' : 'text-sky-400'
      };
    }
    return {
      bg: theme === 'light'
        ? 'bg-slate-100 text-slate-700 border-slate-300'
        : 'bg-[#111A2C] text-[#A7B0C0] border-[#1B2639]',
      label: `#${index + 1} Priority`,
      icon: null,
      iconColor: theme === 'light' ? 'text-slate-600' : 'text-[#7F8BA3]'
    };
  };

  const priorityStyle = getPriorityBadge(priorityIndex);
  const PriorityIcon = priorityStyle.icon;

  // Compute column class based on colSpan configuration
  const colSpanClass = module.colSpan === 12 ? 'col-span-12' : 'col-span-12 lg:col-span-6';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{
        scale: isDragging ? 0.98 : 1,
        opacity: isDragging ? 0.4 : 1,
      }}
      transition={{ duration: 0.15 }}
      id={`module-card-${module.id}`}
      className={`relative flex flex-col min-w-0 ${colSpanClass}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDragOver={(e) => onDragOver(e, module.id)}
      onDragLeave={(e) => onDragLeave(e, module.id)}
      onDrop={(e) => onDrop(e, module.id)}
    >
      {/* Drop Target Indicator (Before) - In-Bounds */}
      {isDragOver && dropPosition === 'before' && (
        <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-center pointer-events-none">
          <div className="h-1.5 w-full bg-blue-500 rounded-t-2xl shadow-xs" />
          <span className="absolute top-1 px-2.5 py-0.5 rounded-full bg-blue-600 text-white font-mono text-[10px] font-bold shadow-md whitespace-nowrap">
            Drop here as Priority #{priorityIndex + 1}
          </span>
        </div>
      )}

      {/* Main Draggable Wrapper Card */}
      <div
        className={`rounded-2xl transition-all duration-150 group flex flex-col h-full border border-[var(--skanda-border)] bg-[var(--skanda-bg-elevated)] overflow-hidden ${
          theme === 'light'
            ? 'shadow-2xs ' + (isReorderMode ? 'ring-2 ring-indigo-500 border-indigo-400' : isHovered ? 'border-slate-300' : 'border-slate-200/90')
            : 'shadow-xs ' + (isReorderMode ? 'ring-2 ring-indigo-500/60 border-indigo-500/50' : isHovered ? 'border-slate-700' : 'border-slate-800')
        }`}
      >
        {/* Tactile Daily Priority Header Strip */}
        <div
          draggable={isReorderMode}
          onDragStart={(e) => onDragStart(e, module.id)}
          onDragEnd={onDragEnd}
          className={`flex items-center justify-between px-3.5 py-1.5 border-b border-[var(--skanda-border)] select-none transition-colors shrink-0 ${
            isReorderMode ? 'cursor-grab active:cursor-grabbing bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800' : ''
          } ${
            theme === 'light'
              ? 'bg-slate-50/60'
              : 'bg-slate-900/60'
          }`}
          title={isReorderMode ? "Click and drag to rearrange daily compliance priority" : undefined}
        >
          {/* Left: Grip Handle + Priority Badge */}
          <div className="flex items-center space-x-2 min-w-0">
            {isReorderMode && (
              <div
                className="p-1 rounded-md transition-colors flex items-center justify-center shrink-0 bg-indigo-600 text-white shadow-xs animate-pulse"
                title="Click and drag to reorder"
              >
                <GripVertical className="w-3.5 h-3.5" />
              </div>
            )}

            {/* Priority Ranking Badge */}
            <span
              className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold border shrink-0 ${priorityStyle.bg}`}
            >
              {PriorityIcon && <PriorityIcon className={`w-3 h-3 ${priorityStyle.iconColor}`} />}
              <span>{priorityStyle.label}</span>
            </span>

            {/* Priority Tag */}
            {module.priorityTag && (
              <span className={`hidden sm:inline-block text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded border truncate ${
                theme === 'light'
                  ? 'text-slate-600 bg-slate-100 border-slate-300'
                  : 'text-slate-400 bg-slate-800 border-slate-700'
              }`}>
                {module.priorityTag}
              </span>
            )}

            {isReorderMode && (
              <span className={`text-xs font-semibold truncate ${
                theme === 'light' ? 'text-slate-800' : 'text-slate-200'
              }`}>
                {module.shortTitle}
              </span>
            )}
          </div>

          {/* Right: Quick Action Controls (Nudge Up/Down, Width Toggle, Minimize) */}
          <div className="flex items-center space-x-1 shrink-0">
            {/* Quick Nudge Up */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMoveUp(module.id);
              }}
              disabled={priorityIndex === 0}
              className={`p-1 rounded-md transition disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer ${
                theme === 'light'
                  ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-200 disabled:hover:text-slate-500'
                  : 'text-[#7F8BA3] hover:text-[#FFFFFF] hover:bg-[#1B2639] disabled:hover:text-[#7F8BA3]'
              }`}
              title="Move Up in Daily Priority"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>

            {/* Quick Nudge Down */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMoveDown(module.id);
              }}
              disabled={priorityIndex === totalModules - 1}
              className={`p-1 rounded-md transition disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer ${
                theme === 'light'
                  ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-200 disabled:hover:text-slate-500'
                  : 'text-[#7F8BA3] hover:text-[#FFFFFF] hover:bg-[#1B2639] disabled:hover:text-[#7F8BA3]'
              }`}
              title="Move Down in Daily Priority"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {/* Width Toggle (Full 12-cols vs Half 6-cols) */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleWidth(module.id);
              }}
              className={`p-1 rounded-md text-xs transition flex items-center space-x-1 cursor-pointer ${
                module.colSpan === 12
                  ? theme === 'light'
                    ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
                    : 'text-[#7F8BA3] hover:text-[#FFFFFF] hover:bg-[#1B2639]'
                  : theme === 'light'
                    ? 'text-indigo-700 bg-indigo-50 border border-indigo-200 font-semibold'
                    : 'text-[#A78BFA] bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 font-semibold'
              }`}
              title={module.colSpan === 12 ? 'Switch to Half Width (6 Cols)' : 'Switch to Full Width (12 Cols)'}
            >
              <Columns2 className="w-3.5 h-3.5" />
              <span className="text-[10px] font-mono hidden xl:inline">
                {module.colSpan === 12 ? '12-col' : '6-col'}
              </span>
            </button>

            {/* Collapse / Expand Toggle */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleCollapse(module.id);
              }}
              className={`p-1 rounded-md transition cursor-pointer ${
                theme === 'light'
                  ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
                  : 'text-[#7F8BA3] hover:text-[#FFFFFF] hover:bg-[#1B2639]'
              }`}
              title={module.collapsed ? 'Expand Module' : 'Minimize Module'}
            >
              {module.collapsed ? (
                <Maximize2 className={`w-3.5 h-3.5 ${theme === 'light' ? 'text-indigo-600' : 'text-[#8B5CF6]'}`} />
              ) : (
                <Minimize2 className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Hide Module (Optional) */}
            {onHide && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onHide(module.id);
                }}
                className={`p-1 rounded-md transition hidden sm:block cursor-pointer ${
                  theme === 'light'
                    ? 'text-slate-400 hover:text-rose-600 hover:bg-slate-200'
                    : 'text-[#7F8BA3] hover:text-[#F43F5E] hover:bg-[#1B2639]'
                }`}
                title="Hide module from dashboard (can be restored from Customize Layout)"
              >
                <EyeOff className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Module Content Area */}
        {!module.collapsed ? (
          <div className="flex-1 flex flex-col min-w-0">{children}</div>
        ) : (
          <div className={`p-4 border-t flex items-center justify-between text-xs ${
            theme === 'light'
              ? 'bg-slate-50 border-slate-200 text-slate-600'
              : 'bg-[#080D1A] border-[#1B2639] text-[#7F8BA3]'
          }`}>
            <span className="italic">{module.description}</span>
            <button
              type="button"
              onClick={() => onToggleCollapse(module.id)}
              className={`text-xs font-semibold hover:underline shrink-0 ml-3 cursor-pointer ${
                theme === 'light' ? 'text-indigo-600' : 'text-[#8B5CF6]'
              }`}
            >
              Expand view
            </button>
          </div>
        )}
      </div>

      {/* Drop Target Indicator (After) */}
      {isDragOver && dropPosition === 'after' && (
        <div className="absolute bottom-0 left-0 right-0 z-30 flex items-center justify-center pointer-events-none animate-pulse">
          <div className="h-1.5 w-full bg-gradient-to-r from-[#8B5CF6] via-sky-400 to-[#8B5CF6] rounded-full shadow-lg shadow-[#8B5CF6]/50" />
          <span className="absolute px-2.5 py-0.5 rounded-full bg-[#7C3AED] text-white font-mono text-[10px] font-bold shadow-md border border-[#A78BFA] whitespace-nowrap">
            Drop here as Priority #{priorityIndex + 2}
          </span>
        </div>
      )}
    </motion.div>
  );
};
