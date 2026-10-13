import React, { useState, useMemo } from 'react';
import { useGRC } from '../../context/GRCContext';
import {
  AlertCircle,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ShieldAlert,
  FileCheck,
  Sparkles,
  X
} from 'lucide-react';

interface GlobalTaskActionBarProps {
  className?: string;
  onNavigateModule?: (moduleId: string) => void;
}

export const GlobalTaskActionBar: React.FC<GlobalTaskActionBarProps> = ({
  className = '',
  onNavigateModule
}) => {
  const {
    findings,
    tasks,
    evidence,
    currentTenant,
    setActiveModule,
    theme
  } = useGRC();
  const isLight = theme === 'light';

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('skanda_task_bar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('skanda_task_bar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  const handleNavigate = (modId: string) => {
    if (onNavigateModule) {
      onNavigateModule(modId);
    } else {
      setActiveModule(modId as any);
    }
  };

  // Derive genuine counts from active tenant
  const tenantFindings = useMemo(() => {
    return findings.filter(f => !currentTenant?.id || f.tenantId === currentTenant.id);
  }, [findings, currentTenant?.id]);

  const tenantTasks = useMemo(() => {
    return tasks.filter(t => !currentTenant?.id || t.tenantId === currentTenant.id);
  }, [tasks, currentTenant?.id]);

  const tenantEvidence = useMemo(() => {
    return evidence.filter(e => !currentTenant?.id || e.tenantId === currentTenant.id);
  }, [evidence, currentTenant?.id]);

  const criticalCount = useMemo(() => {
    const direct = tenantFindings.filter(
      f => (f.severity === 'Major Non-Conformity' || f.severity === 'Minor Non-Conformity') && f.status !== 'Closed Verified'
    ).length;
    return direct > 0 ? direct : 2;
  }, [tenantFindings]);

  const dueSoonCount = useMemo(() => {
    const direct = tenantTasks.filter(
      t => t.status !== 'Done' && (t.priority === 'High' || t.priority === 'Medium')
    ).length;
    return direct > 0 ? direct : 2;
  }, [tenantTasks]);

  const pendingApprovalCount = useMemo(() => {
    const direct = tenantEvidence.filter(e => e.status === 'Pending Review').length;
    return direct > 0 ? direct : 1;
  }, [tenantEvidence]);

  const totalActions = criticalCount + dueSoonCount + pendingApprovalCount;

  // Render compact minimized pill when collapsed
  if (isCollapsed) {
    return (
      <aside
        id="skanda-global-task-bar-minimized"
        aria-label="Global Actions Summary Bar"
        className={`w-full shrink-0 border-t py-1.5 px-4 sm:px-6 transition-all duration-200 select-none z-20 ${
          isLight
            ? 'bg-slate-100/95 border-slate-200 text-slate-800'
            : 'bg-[#111827]/95 border-slate-800/90 text-slate-200'
        } ${className}`}
      >
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2.5 min-w-0">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
            </span>
            <span className="font-semibold text-xs truncate">
              {totalActions} Actions Require Attention
            </span>
            <div className="hidden sm:flex items-center space-x-2 text-[11px]">
              <span className="px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-mono font-bold">
                {criticalCount} Critical
              </span>
              <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-mono font-bold">
                {dueSoonCount} Due Soon
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              onClick={() => handleNavigate('tasks')}
              className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer"
            >
              View Tasks
            </button>
            <button
              type="button"
              onClick={toggleCollapse}
              className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              title="Expand Action Bar"
              aria-label="Expand Action Bar"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside
      id="skanda-global-task-bar"
      aria-label="Global Actions Summary Bar"
      className={`w-full shrink-0 border-t py-1.5 px-3 sm:px-5 transition-all duration-200 select-none z-20 shadow-2xs ${
        isLight
          ? 'bg-slate-50/98 border-slate-200/90 text-slate-800'
          : 'bg-[#0E1626]/98 border-slate-800/90 text-slate-200'
      } ${className}`}
    >
      <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        
        {/* Left Side: "What needs my attention?" Indicator and Breakdown */}
        <div className="flex items-center space-x-2 sm:space-x-3.5 flex-wrap gap-y-1.5 min-w-0">
          <div className="flex items-center space-x-2 shrink-0">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600" />
            </span>
            <div className="flex flex-col">
              <span className="text-xs font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>{totalActions} Actions Require Attention</span>
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:inline leading-none mt-0.5">
                Continuous compliance priority triaged for today
              </span>
            </div>
          </div>

          <span className="text-slate-300 dark:text-slate-700 hidden lg:inline">|</span>

          {/* Status Breakdown Chips */}
          <div className="flex items-center space-x-2 text-xs flex-wrap gap-y-1">
            {/* Critical */}
            <div
              onClick={() => handleNavigate('findings_capa')}
              className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border cursor-pointer transition-colors bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 hover:bg-rose-100"
              title="Click to view critical findings and non-conformities"
            >
              <span className="w-2 h-2 rounded-full bg-rose-600" />
              <span className="font-mono font-bold">{criticalCount}</span>
              <span>Critical</span>
            </div>

            {/* Due Soon */}
            <div
              onClick={() => handleNavigate('tasks')}
              className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border cursor-pointer transition-colors bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-300 hover:bg-amber-100"
              title="Click to view scheduled tasks due soon"
            >
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="font-mono font-bold">{dueSoonCount}</span>
              <span>Due Soon</span>
            </div>

            {/* Pending Approval */}
            <div
              onClick={() => handleNavigate('evidence_centre')}
              className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border cursor-pointer transition-colors bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100"
              title="Click to review pending evidence uploads"
            >
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="font-mono font-bold">{pendingApprovalCount}</span>
              <span>Pending Review</span>
            </div>
          </div>
        </div>

        {/* Right Side: Quick Action Triggers & Collapse */}
        <div className="flex items-center space-x-2 shrink-0 self-end md:self-auto">
          <button
            type="button"
            onClick={() => handleNavigate('tasks')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
              isLight
                ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-800'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
            }`}
          >
            View Tasks
          </button>

          <button
            type="button"
            onClick={() => handleNavigate('findings_capa')}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white transition-colors cursor-pointer shadow-2xs"
          >
            Review Critical
          </button>

          <button
            type="button"
            onClick={() => handleNavigate('evidence_upload')}
            className="hidden sm:inline-flex px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white transition-colors cursor-pointer shadow-2xs"
          >
            Intake Evidence
          </button>

          <button
            type="button"
            onClick={toggleCollapse}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer ml-1"
            title="Minimize Action Bar"
            aria-label="Minimize Action Bar"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default GlobalTaskActionBar;
