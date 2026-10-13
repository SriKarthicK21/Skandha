import React, { useState, useMemo } from 'react';
import { useGRC } from '../../context/GRCContext';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  ChevronRight,
  Filter,
  Search,
  Plus,
  Download,
  Share2,
  ExternalLink,
  Target,
  ShieldCheck,
  Award,
  Layers,
  Sparkles,
  ArrowRight,
  Check,
  X,
  ListTodo,
  CalendarDays,
  Flame,
  Milestone,
  SlidersHorizontal,
  FileCheck,
  Building,
  User,
  Tag,
  CheckSquare,
  Square
} from 'lucide-react';
import {
  AuditCalendarEvent,
  AuditCalendarCategory,
  AuditCalendarStatus,
  AuditCalendarPriority,
  CalendarFilterState
} from '../../types/auditCalendar';
import { INITIAL_AUDIT_CALENDAR_EVENTS } from '../../data/auditCalendarData';
import { Tooltip } from '../common/Tooltip';

interface AuditComplianceCalendarWidgetProps {
  onNavigateModule?: (moduleId: string) => void;
  selectedFrameworkId?: string;
}

type ViewMode = 'timeline' | 'calendar_grid' | 'remediation_milestones';

export const AuditComplianceCalendarWidget: React.FC<AuditComplianceCalendarWidgetProps> = ({
  onNavigateModule,
  selectedFrameworkId
}) => {
  const { currentTenant, theme } = useGRC();
  const isLight = theme === 'light';

  // Events state with mock dataset initialized
  const [events, setEvents] = useState<AuditCalendarEvent[]>(INITIAL_AUDIT_CALENDAR_EVENTS);
  const [viewMode, setViewMode] = useState<ViewMode>('timeline');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [exportToast, setExportToast] = useState<string | null>(null);

  // Filter State
  const [filters, setFilters] = useState<CalendarFilterState>({
    category: 'all',
    framework: selectedFrameworkId || 'all',
    status: 'all',
    timeHorizon: 'all',
    searchQuery: '',
    onlyKeyMilestones: false
  });

  // Active inspected event
  const selectedEvent = useMemo(() => {
    return events.find(e => e.id === selectedEventId) || null;
  }, [events, selectedEventId]);

  // Filter logic
  const filteredEvents = useMemo(() => {
    return events
      .filter(event => {
        // Category filter
        if (filters.category !== 'all' && event.category !== filters.category) {
          return false;
        }
        // Framework filter
        if (filters.framework !== 'all') {
          const f = filters.framework.toLowerCase();
          const ef = event.framework.toLowerCase();
          if (f === 'iso27001' && !ef.includes('27001')) return false;
          if (f === 'iso42001' && !ef.includes('42001')) return false;
          if (f === 'mas_trm' && !ef.includes('mas')) return false;
          if (f === 'dpdp' && !ef.includes('dpdp')) return false;
          if (f === 'soc2' && !ef.includes('soc')) return false;
        }
        // Status filter
        if (filters.status !== 'all' && event.status !== filters.status) {
          return false;
        }
        // Time Horizon filter
        if (filters.timeHorizon === '14_days' && event.daysRemaining > 14) {
          return false;
        }
        if (filters.timeHorizon === '30_days' && event.daysRemaining > 30) {
          return false;
        }
        if (filters.timeHorizon === '90_days' && event.daysRemaining > 90) {
          return false;
        }
        // Key Milestones filter
        if (filters.onlyKeyMilestones && !event.isKeyMilestone) {
          return false;
        }
        // Search Query
        if (filters.searchQuery.trim()) {
          const q = filters.searchQuery.toLowerCase();
          const matchTitle = event.title.toLowerCase().includes(q);
          const matchOwner = event.owner.toLowerCase().includes(q);
          const matchDept = event.department.toLowerCase().includes(q);
          const matchFramework = event.framework.toLowerCase().includes(q);
          const matchCode = event.shortCode.toLowerCase().includes(q);
          if (!matchTitle && !matchOwner && !matchDept && !matchFramework && !matchCode) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => a.daysRemaining - b.daysRemaining);
  }, [events, filters]);

  // Statistics
  const stats = useMemo(() => {
    const total = events.length;
    const urgentCount = events.filter(e => e.daysRemaining <= 14 && e.status !== 'Completed').length;
    const upcomingCount = events.filter(e => e.daysRemaining > 14 && e.daysRemaining <= 30).length;
    const capaCount = events.filter(e => e.category === 'remediation_capa').length;
    const externalAudits = events.filter(e => e.category === 'external_audit');
    const nextEvent = events.filter(e => e.daysRemaining > 0 && e.status !== 'Completed').sort((a, b) => a.daysRemaining - b.daysRemaining)[0];

    return {
      total,
      urgentCount,
      upcomingCount,
      capaCount,
      externalAuditsCount: externalAudits.length,
      nextEvent
    };
  }, [events]);

  // Toggle checklist item
  const handleToggleChecklist = (eventId: string, checkId: string) => {
    setEvents(prev =>
      prev.map(evt => {
        if (evt.id !== eventId) return evt;
        const updatedChecklist = evt.checklist.map(chk =>
          chk.id === checkId ? { ...chk, completed: !chk.completed } : chk
        );
        const completedCount = updatedChecklist.filter(c => c.completed).length;
        const newProgress = Math.round((completedCount / updatedChecklist.length) * 100);
        return {
          ...evt,
          checklist: updatedChecklist,
          remediationProgress: newProgress,
          status: newProgress === 100 ? 'Completed' : evt.status === 'Completed' ? 'In Progress' : evt.status
        };
      })
    );
  };

  // Export iCal (.ics) file
  const handleExportICS = () => {
    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Skanda GRC//Audit Compliance Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH'
    ];

    events.forEach(evt => {
      const d = evt.dueDate.replace(/-/g, '');
      icsContent.push('BEGIN:VEVENT');
      icsContent.push(`UID:${evt.id}@skanda-grc.io`);
      icsContent.push(`DTSTAMP:20260909T000000Z`);
      icsContent.push(`DTSTART;VALUE=DATE:${d}`);
      icsContent.push(`DTEND;VALUE=DATE:${d}`);
      icsContent.push(`SUMMARY:[${evt.framework}] ${evt.title}`);
      icsContent.push(`DESCRIPTION:${evt.description} | Assigned: ${evt.owner} (${evt.department}) | Status: ${evt.status}`);
      icsContent.push(`CATEGORIES:${evt.categoryLabel}`);
      icsContent.push(`STATUS:${evt.status === 'Completed' ? 'CONFIRMED' : 'TENTATIVE'}`);
      icsContent.push('END:VEVENT');
    });

    icsContent.push('END:VCALENDAR');
    const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Skanda_Audit_Compliance_Calendar_${currentTenant?.name || 'Enterprise'}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportToast('Calendar (.ics) exported! Ready to sync with Outlook & Google Calendar.');
    setTimeout(() => setExportToast(null), 4000);
  };

  // Helper for Category Badge Colors
  const getCategoryBadge = (cat: AuditCalendarCategory) => {
    switch (cat) {
      case 'external_audit':
        return {
          bg: isLight ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-purple-950/60 text-purple-300 border-purple-800/60',
          dot: 'bg-purple-500',
          label: 'External Audit'
        };
      case 'internal_audit':
        return {
          bg: isLight ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-indigo-950/60 text-indigo-300 border-indigo-800/60',
          dot: 'bg-indigo-500',
          label: 'Internal Audit'
        };
      case 'remediation_capa':
        return {
          bg: isLight ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-amber-950/60 text-amber-300 border-amber-800/60',
          dot: 'bg-amber-500',
          label: 'CAPA Remediation'
        };
      case 'evidence_refresh':
        return {
          bg: isLight ? 'bg-sky-50 text-sky-700 border-sky-200' : 'bg-sky-950/60 text-sky-300 border-sky-800/60',
          dot: 'bg-sky-500',
          label: 'Evidence Refresh'
        };
      case 'regulatory_filing':
        return {
          bg: isLight ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60',
          dot: 'bg-emerald-500',
          label: 'Regulatory / Governance'
        };
      default:
        return {
          bg: isLight ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-slate-800 text-slate-300 border-slate-700',
          dot: 'bg-slate-400',
          label: 'Milestone'
        };
    }
  };

  // Helper for Urgency Badge Colors
  const getUrgencyBadge = (days: number, status: AuditCalendarStatus) => {
    if (status === 'Completed') {
      return {
        bg: isLight ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60',
        text: 'Completed',
        icon: CheckCircle2
      };
    }
    if (days <= 0) {
      return {
        bg: isLight ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-rose-950/60 text-rose-400 border-rose-800/60',
        text: 'Due Today / Overdue',
        icon: AlertTriangle
      };
    }
    if (days <= 7) {
      return {
        bg: isLight ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-rose-950/60 text-rose-400 border-rose-800/60',
        text: `${days}d Left (Urgent)`,
        icon: Flame
      };
    }
    if (days <= 14) {
      return {
        bg: isLight ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-amber-950/60 text-amber-400 border-amber-800/60',
        text: `${days}d Left`,
        icon: Clock
      };
    }
    if (days <= 30) {
      return {
        bg: isLight ? 'bg-sky-50 text-sky-700 border-sky-200' : 'bg-sky-950/60 text-sky-300 border-sky-800/60',
        text: `${days}d Left`,
        icon: Calendar
      };
    }
    return {
      bg: isLight ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-slate-800/80 text-slate-300 border-slate-700',
      text: `${days}d Left`,
      icon: Calendar
    };
  };

  return (
    <div
      id="audit-compliance-calendar-widget"
      className={`rounded-2xl border transition-all duration-200 shadow-md ${
        isLight ? 'bg-white border-slate-200 shadow-slate-200/50' : 'bg-slate-900/95 border-slate-800 shadow-slate-950/50'
      }`}
    >
      {/* Toast Notification */}
      {exportToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500 shadow-2xl rounded-xl p-3 flex items-center space-x-3 text-white animate-in slide-in-from-bottom duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="text-xs font-medium text-slate-200">{exportToast}</p>
        </div>
      )}

      {/* 1. Header & Controls Bar */}
      <div className={`p-5 sm:p-6 border-b ${isLight ? 'border-slate-100 bg-slate-50/50' : 'border-slate-800/80 bg-slate-950/40'}`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-900/20 shrink-0">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className={`text-base sm:text-lg font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Audit Compliance Calendar & Remediation Milestones
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                  isLight ? 'bg-sky-50 text-sky-700 border-sky-200' : 'bg-sky-950/80 text-sky-400 border-sky-800'
                }`}>
                  Timeline Horizon: Q3/Q4 2026
                </span>
                {stats.urgentCount > 0 && (
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 animate-pulse">
                    <Flame className="w-3 h-3 text-rose-500" />
                    <span>{stats.urgentCount} Urgent (&lt;14d)</span>
                  </span>
                )}
              </div>
              <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Continuous chronological tracking of external registrar audits, internal reviews, CAPA remediations, and evidence SLAs for {currentTenant?.name || 'Enterprise'}.
              </p>
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Switcher */}
            <div className={`p-1 rounded-xl border flex items-center space-x-1 ${
              isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}>
              <button
                type="button"
                onClick={() => setViewMode('timeline')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center space-x-1 ${
                  viewMode === 'timeline'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                }`}
                title="Chronological timeline view"
              >
                <Milestone className="w-3.5 h-3.5" />
                <span>Timeline</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('remediation_milestones')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center space-x-1 ${
                  viewMode === 'remediation_milestones'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                }`}
                title="Remediation & CAPA milestones view"
              >
                <ListTodo className="w-3.5 h-3.5" />
                <span>Milestones</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('calendar_grid')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center space-x-1 ${
                  viewMode === 'calendar_grid'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                }`}
                title="Monthly grid schedule"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Grid</span>
              </button>
            </div>

            {/* Export iCal */}
            <button
              type="button"
              onClick={handleExportICS}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5 ${
                isLight
                  ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-2xs'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
              title="Export standard iCalendar feed (.ics) for Outlook & Google Calendar sync"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span>Export .ICS</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Pulse Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <div className={`p-3 rounded-xl border transition-all duration-200 hover:scale-[1.01] ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Next Target Deadline</span>
              <Clock className="w-3.5 h-3.5 text-sky-400" />
            </div>
            <div className="text-sm font-bold text-sky-400 mt-1 truncate" title={stats.nextEvent?.title}>
              {stats.nextEvent ? `${stats.nextEvent.daysRemaining} Days: ${stats.nextEvent.shortCode}` : 'None pending'}
            </div>
            <div className={`text-[10px] mt-0.5 truncate ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
              Due {stats.nextEvent?.dueDate || 'N/A'}
            </div>
          </div>

          <div className={`p-3 rounded-xl border transition-all duration-200 hover:scale-[1.01] ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Stage 1 Fieldwork</span>
              <Award className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className={`text-sm font-bold mt-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              36 Days (Oct 15)
            </div>
            <div className="text-[10px] text-purple-400 font-medium">BSI Accredited Audit</div>
          </div>

          <div className={`p-3 rounded-xl border transition-all duration-200 hover:scale-[1.01] ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Active CAPA Actions</span>
              <ListTodo className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className={`text-sm font-bold mt-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {stats.capaCount} Remediation Milestones
            </div>
            <div className="text-[10px] text-amber-400 font-medium">85% Avg Resolution Progress</div>
          </div>

          <div className={`p-3 rounded-xl border transition-all duration-200 hover:scale-[1.01] ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Evidence Refresh SLA</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className={`text-sm font-bold mt-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              16 Days Remaining
            </div>
            <div className="text-[10px] text-emerald-400 font-medium">90-Day Freshness Window</div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Filter & Search Strip */}
      <div className={`p-4 border-b text-xs flex flex-wrap items-center justify-between gap-3 ${
        isLight ? 'border-slate-100 bg-white' : 'border-slate-800/80 bg-slate-900'
      }`}>
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <div className="flex items-center space-x-1">
            <span className={`text-[11px] font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Type:</span>
            <select
              value={filters.category}
              onChange={e => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className={`px-2.5 py-1 rounded-lg border text-xs font-medium focus:outline-hidden focus:ring-1 focus:ring-indigo-500 ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-800 border-slate-700 text-slate-200'
              }`}
            >
              <option value="all">All Event Types ({events.length})</option>
              <option value="external_audit">External Registrar Audits</option>
              <option value="internal_audit">Internal Audits & Reviews</option>
              <option value="remediation_capa">CAPA Remediations</option>
              <option value="evidence_refresh">Evidence Freshness Refresh</option>
              <option value="regulatory_filing">Regulatory / Governance Filings</option>
            </select>
          </div>

          {/* Framework Filter */}
          <div className="flex items-center space-x-1">
            <span className={`text-[11px] font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Standard:</span>
            <select
              value={filters.framework}
              onChange={e => setFilters(prev => ({ ...prev, framework: e.target.value }))}
              className={`px-2.5 py-1 rounded-lg border text-xs font-medium focus:outline-hidden focus:ring-1 focus:ring-indigo-500 ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-800 border-slate-700 text-slate-200'
              }`}
            >
              <option value="all">All Standards</option>
              <option value="iso27001">ISO/IEC 27001:2022</option>
              <option value="iso42001">ISO/IEC 42001:2023 (AI)</option>
              <option value="mas_trm">MAS TRM Guidelines</option>
              <option value="dpdp">India DPDP Act 2023</option>
              <option value="soc2">SOC 2 Type II</option>
            </select>
          </div>

          {/* Horizon Filter */}
          <div className="flex items-center space-x-1">
            <span className={`text-[11px] font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Horizon:</span>
            <select
              value={filters.timeHorizon}
              onChange={e => setFilters(prev => ({ ...prev, timeHorizon: e.target.value as any }))}
              className={`px-2.5 py-1 rounded-lg border text-xs font-medium focus:outline-hidden focus:ring-1 focus:ring-indigo-500 ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-800 border-slate-700 text-slate-200'
              }`}
            >
              <option value="all">All Deadlines</option>
              <option value="14_days">Next 14 Days (&lt;= 14d)</option>
              <option value="30_days">Next 30 Days (&lt;= 30d)</option>
              <option value="90_days">Next 90 Days (&lt;= 90d)</option>
            </select>
          </div>

          {/* Key Milestones Only Toggle */}
          <button
            type="button"
            onClick={() => setFilters(prev => ({ ...prev, onlyKeyMilestones: !prev.onlyKeyMilestones }))}
            className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition cursor-pointer flex items-center space-x-1 ${
              filters.onlyKeyMilestones
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : isLight ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Key Milestones Only</span>
          </button>
        </div>

        {/* Search Box */}
        <div className="relative w-full sm:w-56">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={e => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
            placeholder="Search milestone, owner..."
            className={`w-full pl-8 pr-3 py-1 rounded-lg border text-xs focus:outline-hidden focus:ring-1 focus:ring-indigo-500 ${
              isLight ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400' : 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500'
            }`}
          />
          {filters.searchQuery && (
            <button
              onClick={() => setFilters(prev => ({ ...prev, searchQuery: '' }))}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* 3. Main Views Container */}
      <div className="p-5 sm:p-6">
        {/* Empty State */}
        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-10 h-10 text-slate-500 mx-auto mb-2" />
            <p className={`text-sm font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>No events match your active filters</p>
            <p className="text-xs text-slate-500 mt-1">Try resetting the category, framework, or search keywords.</p>
            <button
              onClick={() =>
                setFilters({
                  category: 'all',
                  framework: 'all',
                  status: 'all',
                  timeHorizon: 'all',
                  searchQuery: '',
                  onlyKeyMilestones: false
                })
              }
              className="mt-3 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* View 1: Timeline Stream View */}
        {viewMode === 'timeline' && filteredEvents.length > 0 && (
          <div className="space-y-6">
            {/* Timeline progression line */}
            <div className="relative border-l-2 border-slate-700/80 ml-4 sm:ml-6 space-y-6">
              {filteredEvents.map((event, idx) => {
                const catBadge = getCategoryBadge(event.category);
                const urgency = getUrgencyBadge(event.daysRemaining, event.status);
                const isSelected = selectedEventId === event.id;
                const UrgencyIcon = urgency.icon;

                return (
                  <div
                    key={event.id}
                    className="relative pl-6 sm:pl-8 group cursor-pointer"
                    onClick={() => setSelectedEventId(isSelected ? null : event.id)}
                  >
                    {/* Node Pin Marker */}
                    <div
                      className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 transition-transform duration-200 group-hover:scale-125 flex items-center justify-center ${
                        event.isKeyMilestone
                          ? 'bg-amber-400 border-slate-900 ring-2 ring-amber-400/50'
                          : event.daysRemaining <= 7
                          ? 'bg-rose-500 border-slate-900 ring-2 ring-rose-500/50'
                          : `${catBadge.dot} border-slate-900`
                      }`}
                    />

                    {/* Timeline Event Card */}
                    <div
                      className={`p-4 rounded-xl border transition-all duration-200 hover:scale-[1.01] ${
                        isSelected
                          ? isLight
                            ? 'bg-indigo-50/70 border-indigo-300 ring-1 ring-indigo-300 shadow-md'
                            : 'bg-indigo-950/40 border-indigo-500/60 ring-1 ring-indigo-500/40 shadow-xl'
                          : isLight
                          ? 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950/90'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${catBadge.bg}`}>
                            {catBadge.label}
                          </span>

                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                            isLight ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}>
                            {event.framework}
                          </span>

                          {event.registrarBadge && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30 flex items-center space-x-1">
                              <Award className="w-3 h-3 text-purple-400 mr-1" />
                              <span>{event.registrarBadge}</span>
                            </span>
                          )}

                          {event.isKeyMilestone && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              KEY MILESTONE
                            </span>
                          )}
                        </div>

                        {/* Urgency countdown pill */}
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${urgency.bg}`}>
                            <UrgencyIcon className="w-3.5 h-3.5 mr-0.5" />
                            <span>{urgency.text}</span>
                          </span>

                          <span className={`text-[11px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                            Due: {event.dueDate}
                          </span>
                        </div>
                      </div>

                      {/* Title & Description */}
                      <div className="mt-2">
                        <h4 className={`text-sm sm:text-base font-bold ${
                          isSelected ? 'text-indigo-400' : isLight ? 'text-slate-900 group-hover:text-indigo-600' : 'text-white group-hover:text-sky-300'
                        }`}>
                          {event.title}
                        </h4>
                        <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                          {event.description}
                        </p>
                      </div>

                      {/* Meta stats & progress */}
                      <div className="mt-3 pt-3 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex flex-wrap items-center gap-4 text-[11px]">
                          <div className="flex items-center space-x-1.5 text-slate-400">
                            <User className="w-3.5 h-3.5 text-slate-500" />
                            <span className="font-medium text-slate-300">{event.owner}</span>
                            <span className="text-slate-500">({event.department})</span>
                          </div>

                          <div className="flex items-center space-x-1.5">
                            <Tag className="w-3.5 h-3.5 text-indigo-400" />
                            <span className="text-slate-400 font-mono text-[10px]">
                              {event.linkedControls.join(', ')}
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="flex items-center space-x-2 shrink-0">
                          <span className="text-[11px] font-semibold text-slate-400">
                            {event.remediationProgress}% Progress
                          </span>
                          <div className="w-20 sm:w-28 h-2 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${
                                event.remediationProgress === 100
                                  ? 'bg-emerald-500'
                                  : event.remediationProgress > 50
                                  ? 'bg-indigo-500'
                                  : 'bg-amber-500'
                              }`}
                              style={{ width: `${event.remediationProgress}%` }}
                            />
                          </div>

                          <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${isSelected ? 'rotate-90 text-indigo-400' : ''}`} />
                        </div>
                      </div>

                      {/* Expanded In-Line Details Drawer */}
                      {isSelected && (
                        <div className="mt-4 pt-4 border-t border-slate-800/90 space-y-3 animate-in fade-in duration-200">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center space-x-1">
                              <CheckSquare className="w-3.5 h-3.5" />
                              <span>Remediation & Compliance Action Checklist</span>
                            </div>

                            {onNavigateModule && (
                              <button
                                type="button"
                                onClick={e => {
                                  e.stopPropagation();
                                  onNavigateModule(event.linkedModule);
                                }}
                                className="inline-flex items-center space-x-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer"
                              >
                                <span>Go to {event.linkedModule.replace(/_/g, ' ').toUpperCase()}</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          {/* Checklist items */}
                          <div className="space-y-1.5">
                            {event.checklist.map(item => (
                              <div
                                key={item.id}
                                onClick={e => {
                                  e.stopPropagation();
                                  handleToggleChecklist(event.id, item.id);
                                }}
                                className={`p-2 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition ${
                                  item.completed
                                    ? isLight
                                      ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900 line-through opacity-75'
                                      : 'bg-emerald-950/20 border-emerald-900/40 text-emerald-300 line-through opacity-75'
                                    : isLight
                                    ? 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                                    : 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-850'
                                }`}
                              >
                                <div className="flex items-center space-x-2">
                                  {item.completed ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                  ) : (
                                    <Square className="w-4 h-4 text-slate-500 shrink-0" />
                                  )}
                                  <span>{item.task}</span>
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono">
                                  {item.owner} {item.dueDate ? `• Due ${item.dueDate}` : ''}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Deliverable Artifact */}
                          {event.deliverableArtifact && (
                            <div className={`p-2.5 rounded-lg border flex items-center justify-between text-xs ${
                              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'
                            }`}>
                              <div className="flex items-center space-x-2">
                                <FileCheck className="w-4 h-4 text-sky-400" />
                                <span className={`font-medium ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                                  Artifact: {event.deliverableArtifact}
                                </span>
                              </div>
                              <span className="text-[10px] font-mono text-emerald-400 font-semibold uppercase">
                                Verified In Vault
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* View 2: Remediation Milestones Focused View */}
        {viewMode === 'remediation_milestones' && filteredEvents.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredEvents.map(event => {
              const urgency = getUrgencyBadge(event.daysRemaining, event.status);
              const catBadge = getCategoryBadge(event.category);
              return (
                <div
                  key={event.id}
                  onClick={() => setSelectedEventId(selectedEventId === event.id ? null : event.id)}
                  className={`p-4 rounded-xl border transition-all duration-200 hover:scale-[1.01] cursor-pointer flex flex-col justify-between ${
                    isLight
                      ? 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${catBadge.bg}`}>
                        {catBadge.label}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${urgency.bg}`}>
                        {urgency.text}
                      </span>
                    </div>

                    <h4 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {event.title}
                    </h4>
                    <p className={`text-xs mt-1 line-clamp-2 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      {event.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-400 font-medium">Resolution SLA</span>
                      <span className="font-bold text-sky-400">{event.remediationProgress}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mb-3">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-sky-400"
                        style={{ width: `${event.remediationProgress}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Owner: {event.owner}</span>
                      <span className="font-mono text-indigo-400">Due {event.dueDate}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* View 3: Calendar Grid View */}
        {viewMode === 'calendar_grid' && (
          <div className="space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
              <span>September / October 2026 Audit Schedule</span>
              <span className="font-mono text-indigo-400 font-semibold">Current Cycle: Active</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {filteredEvents.slice(0, 8).map(event => {
                const urgency = getUrgencyBadge(event.daysRemaining, event.status);
                const catBadge = getCategoryBadge(event.category);
                return (
                  <div
                    key={event.id}
                    onClick={() => setSelectedEventId(selectedEventId === event.id ? null : event.id)}
                    className={`p-3 rounded-xl border transition-all duration-200 hover:scale-[1.01] cursor-pointer ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                      <span>{event.dueDate}</span>
                      <span className={`font-bold ${event.daysRemaining <= 7 ? 'text-rose-400' : 'text-sky-400'}`}>
                        {event.daysRemaining}d Left
                      </span>
                    </div>
                    <div className="text-xs font-bold text-white truncate" title={event.title}>
                      {event.title}
                    </div>
                    <div className="flex items-center space-x-1 mt-2">
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${catBadge.bg}`}>
                        {catBadge.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 4. Footer Help & Deep-Link Bar */}
      <div className={`p-4 border-t text-xs flex flex-wrap items-center justify-between gap-3 ${
        isLight ? 'border-slate-100 bg-slate-50' : 'border-slate-800/80 bg-slate-950/40'
      }`}>
        <div className="flex items-center space-x-2 text-slate-400">
          <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>
            Calendar deadlines sync directly with the <strong>Findings & CAPA Module</strong>, <strong>Evidence Freshness SLAs</strong>, and <strong>Registrar Dossiers</strong>.
          </span>
        </div>

        {onNavigateModule && (
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => onNavigateModule('external_audit')}
              className="text-xs font-semibold text-purple-400 hover:text-purple-300 hover:underline cursor-pointer"
            >
              External Audit Hub →
            </button>
            <button
              type="button"
              onClick={() => onNavigateModule('findings_capa')}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 hover:underline cursor-pointer"
            >
              Findings & CAPA Tracker →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
