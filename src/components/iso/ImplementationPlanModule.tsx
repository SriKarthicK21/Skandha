import React, { useState, useMemo } from 'react';
import { useGRC } from '../../context/GRCContext';
import { ImplementationPlanItem } from '../../types';
import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Lock,
  ArrowRight,
  Filter,
  Search,
  ExternalLink,
  Users,
  Building,
  FileText,
  BarChart3
} from 'lucide-react';

export const ImplementationPlanModule: React.FC = () => {
  const { currentTenant, updateImplementationPlanItem, setActiveModule } = useGRC();
  const planItems: ImplementationPlanItem[] = currentTenant?.implementationPlan || [];

  const [phaseFilter, setPhaseFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredItems = useMemo(() => {
    return planItems.filter(item => {
      const matchesPhase = phaseFilter === 'ALL' || item.phaseTitle.toLowerCase().includes(phaseFilter.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
      const matchesSearch = !searchQuery.trim() ||
        (item.taskTitle && item.taskTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.activityTitle && item.activityTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.owner && item.owner.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.department && item.department.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesPhase && matchesStatus && matchesSearch;
    });
  }, [planItems, phaseFilter, statusFilter, searchQuery]);

  const stats = useMemo(() => {
    const completed = planItems.filter(i => i.status === 'COMPLETED').length;
    const inProgress = planItems.filter(i => i.status === 'IN_PROGRESS').length;
    const scheduled = planItems.filter(i => i.status === 'NOT_STARTED').length;
    const blocked = planItems.filter(i => i.status === 'BLOCKED').length;
    const pct = planItems.length > 0 ? Math.round((completed / planItems.length) * 100) : 0;
    return { completed, inProgress, scheduled, blocked, pct };
  }, [planItems]);

  const handleStatusChange = (itemId: string, status: ImplementationPlanItem['status']) => {
    updateImplementationPlanItem(itemId, { status });
  };

  const getStatusPill = (status: ImplementationPlanItem['status']) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Completed
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Clock className="w-3.5 h-3.5" />
            In Progress
          </span>
        );
      case 'BLOCKED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Lock className="w-3.5 h-3.5" />
            Blocked
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
            Scheduled
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase bg-sky-500/10 text-sky-400 border border-sky-500/30">
                Project Schedule & Milestones
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-slate-400 font-medium">
                Stage 10 of 24 ISO Workflow
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              ISMS Implementation Project Plan & Work Breakdown
            </h1>
            <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
              Orchestrates all 24 ISO/IEC 27001:2022 implementation stages with responsible leads, departmental dependencies, target completion deadlines, and mandatory certification deliverables.
            </p>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl shrink-0 flex items-center gap-5">
            <div className="text-center">
              <div className="text-3xl font-bold text-sky-400">{stats.pct}%</div>
              <div className="text-[11px] text-slate-400 font-medium">Plan Executed</div>
            </div>
            <div className="h-10 w-px bg-slate-800" />
            <div className="text-xs text-slate-400 space-y-1">
              <div>Total Milestones: <strong className="text-white">{planItems.length}</strong></div>
              <div>Completed: <strong className="text-emerald-400">{stats.completed}</strong></div>
              <div>In Progress: <strong className="text-sky-400">{stats.inProgress}</strong></div>
            </div>
          </div>
        </div>

        {/* Global Progress Line */}
        <div className="mt-5 pt-4 border-t border-slate-800">
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${stats.pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {['ALL', 'Foundation', 'Context & Scope', 'Risk & Controls', 'Implementation & Evidence', 'Assurance & Audit', 'Continual Improvement'].map(phase => (
            <button
              key={phase}
              onClick={() => setPhaseFilter(phase)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                phaseFilter === phase
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
              }`}
            >
              {phase === 'ALL' ? 'All Phases' : phase}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64 shrink-0">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search tasks, roles, or depts..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Implementation Milestones List */}
      <div className="space-y-3">
        {filteredItems.map(item => (
          <div
            key={item.id}
            className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-sky-400 border border-slate-700">
                    Phase {item.phaseNumber} • {item.phaseTitle}
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="text-xs text-slate-400">
                    Dept: <strong className="text-slate-300">{item.department}</strong>
                  </span>
                  {item.isoClause && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      Clause {item.isoClause}
                    </span>
                  )}
                  {item.annexAControl && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Annex A {item.annexAControl}
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-white pt-0.5">
                  {item.activityTitle}: {item.taskTitle}
                </h3>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {/* Status Dropdown */}
                <select
                  value={item.status}
                  onChange={e => handleStatusChange(item.id, e.target.value as ImplementationPlanItem['status'])}
                  aria-label="Milestone execution status"
                  className="bg-slate-800 border border-slate-700 text-xs font-semibold rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:border-sky-500"
                >
                  <option value="NOT_STARTED">Scheduled</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="BLOCKED">Blocked</option>
                </select>

                {getStatusPill(item.status)}
              </div>
            </div>

            {/* Middle Grid: Owner, Deadline, Target Module */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
              <div className="flex items-center gap-2 text-slate-400">
                <Users className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>Lead: <strong className="text-slate-200">{item.owner}</strong></span>
              </div>

              <div className="flex items-center gap-2 text-slate-400">
                <Calendar className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>Target: <strong className="text-slate-200">{item.dueDate}</strong></span>
              </div>

              <div className="flex items-center justify-start sm:justify-end">
                <button
                  onClick={() => setActiveModule(item.isoClause ? 'iso27001_clauses' : 'iso27001_workbench')}
                  className="inline-flex items-center gap-1 text-xs font-medium text-sky-400 hover:text-sky-300 hover:underline"
                >
                  <span>Launch Task Module</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Deliverables Checklist */}
            {item.evidenceRequirement && (
              <div className="pt-2 border-t border-slate-800 flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-semibold text-slate-400">Required Evidence:</span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {item.evidenceRequirement}
                </span>
              </div>
            )}
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl text-slate-400 text-sm">
            No implementation milestones match your filter.
          </div>
        )}
      </div>
    </div>
  );
};
