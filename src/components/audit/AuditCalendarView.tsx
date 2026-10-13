import React, { useState, useMemo } from 'react';
import { useGRC } from '../../context/GRCContext';
import { organizationService } from '../../services/organizationService';
import {
  AuditCalendarEvent,
  AuditEventCategory,
  ExternalFeedSubscription,
  generateICSFeed,
  downloadICSFile,
  getGoogleCalendarUrl,
  getOutlookCalendarUrl,
  parseICSFeed,
  SAMPLE_EXTERNAL_FEEDS
} from '../../utils/icsUtils';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Filter,
  Download,
  Share2,
  RefreshCw,
  Clock,
  MapPin,
  Video,
  Users,
  CheckCircle2,
  AlertCircle,
  Link2,
  UploadCloud,
  Layers,
  FileCheck,
  ShieldCheck,
  ExternalLink,
  Trash2,
  Check,
  Copy,
  Tag,
  CalendarDays,
  ListFilter,
  Sparkles,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { useToast } from '../common/ToastContainer';

interface AuditCalendarViewProps {
  onNavigateModule?: (module: string) => void;
}

export const AuditCalendarView: React.FC<AuditCalendarViewProps> = ({ onNavigateModule }) => {
  const { showToast } = useToast();
  const {
    currentTenant,
    internalAudits,
    evidence,
    tasks,
    managementReviews,
    findings,
    currentUser,
    setActiveModule
  } = useGRC();

  // Navigation handler fallback
  const handleNav = (mod: string) => {
    if (onNavigateModule) {
      onNavigateModule(mod);
    } else {
      setActiveModule(mod);
    }
  };

  // View state: 'month' | 'week' | 'agenda'
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'agenda'>('month');
  
  // Current focused date for calendar navigation
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date(2026, 8, 1)); // Default Sept 2026 for alignment with demo roadmap

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<AuditEventCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');

  // Custom User-Created Events
  const [customEvents, setCustomEvents] = useState<AuditCalendarEvent[]>(() => {
    try {
      const saved = localStorage.getItem('apex_grc_custom_calendar_events');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: 'cust_1',
        title: 'Lead Auditor Opening Conference & Scope Finalization',
        description: 'Formal opening conference with ISO 27001 Lead Auditor, Top Management, and CISO to confirm audit plan sampling boundaries.',
        category: 'AUDIT_SESSION',
        startDate: '2026-09-08T09:00:00',
        endDate: '2026-09-08T10:30:00',
        timeString: '09:00 AM - 10:30 AM',
        location: 'HQ Executive Boardroom 4A & Virtual Video Room',
        meetingUrl: 'https://meet.google.com/audit-opening-apex',
        organizer: 'Elena Rostova (Lead Auditor)',
        attendees: ['SriKarthiK (CISO)', 'Marcus Vance (CEO)', 'Priya Sharma (DevOps)'],
        department: 'Information Security & Compliance',
        linkedClause: 'ISO 27001 Clause 9.2',
        sourceType: 'CUSTOM',
        priority: 'Critical',
        status: 'Scheduled'
      },
      {
        id: 'cust_2',
        title: 'Q3 Cryptographic Keys & Cloud Access Evidence Deadline',
        description: 'Final submission deadline for AWS KMS key rotation logs and Okta WebAuthn enrollment attestations for Stage 1 submission.',
        category: 'EVIDENCE_DEADLINE',
        startDate: '2026-09-12T17:00:00',
        endDate: '2026-09-12T18:00:00',
        timeString: '05:00 PM Deadline',
        location: 'Apex GRC Evidence Vault',
        organizer: 'SriKarthiK (CISO)',
        attendees: ['Priya Sharma (DevOps Lead)', 'Cloud Platform Team'],
        department: 'Software Engineering & DevOps',
        linkedClause: 'Annex A A.8.24 & A.5.15',
        sourceType: 'CUSTOM',
        priority: 'High',
        status: 'Pending'
      },
      {
        id: 'cust_3',
        title: 'ISMS Steering Committee & CAPA Verification Meeting',
        description: 'Review of open CAPA corrective actions from internal audit, verification of evidence, and formal sign-off before Stage 1.',
        category: 'REVIEWER_MEETING',
        startDate: '2026-09-22T14:00:00',
        endDate: '2026-09-22T15:30:00',
        timeString: '02:00 PM - 03:30 PM',
        location: 'Virtual Conference Hub',
        meetingUrl: 'https://meet.google.com/isms-steering-apex',
        organizer: 'SriKarthiK (CISO)',
        attendees: ['Marcus Vance', 'Rachel Zane', 'James Sterling', 'Marcus Brody'],
        department: 'Executive Leadership & Risk',
        linkedClause: 'ISO 27001 Clause 9.3 & 10.1',
        sourceType: 'CUSTOM',
        priority: 'High',
        status: 'Scheduled'
      }
    ];
  });

  // External Synced Feeds state
  const [externalFeeds, setExternalFeeds] = useState<ExternalFeedSubscription[]>(() => {
    try {
      const saved = localStorage.getItem('apex_grc_external_feeds');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: 'feed_bsi',
        name: 'BSI External Certification Body Schedule Feed',
        url: 'https://cert-portal.bsigroup.com/feeds/apex-audit-2026.ics',
        lastSynced: '2026-09-02T08:15:00Z',
        eventCount: 2,
        color: '#0284c7',
        active: true
      }
    ];
  });

  // Synced events from external feeds
  const [syncedFeedEvents, setSyncedFeedEvents] = useState<AuditCalendarEvent[]>(() => {
    try {
      const saved = localStorage.getItem('apex_grc_synced_feed_events');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    // Default parse from sample
    return parseICSFeed(SAMPLE_EXTERNAL_FEEDS[0].sampleIcs, 'BSI Certification Feed');
  });

  // Modals & UI States
  const [selectedEvent, setSelectedEvent] = useState<AuditCalendarEvent | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [copiedFeedLink, setCopiedFeedLink] = useState(false);
  const [isSyncingFeeds, setIsSyncingFeeds] = useState(false);
  const [customFeedUrl, setCustomFeedUrl] = useState('');
  const [customFeedName, setCustomFeedName] = useState('');

  // Form state for creating an event
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventCategory, setNewEventCategory] = useState<AuditEventCategory>('AUDIT_SESSION');
  const [newEventStartDate, setNewEventStartDate] = useState('2026-09-15');
  const [newEventStartTime, setNewEventStartTime] = useState('10:00');
  const [newEventEndDate, setNewEventEndDate] = useState('2026-09-15');
  const [newEventEndTime, setNewEventEndTime] = useState('11:30');
  const [newEventLocation, setNewEventLocation] = useState('');
  const [newEventMeetingUrl, setNewEventMeetingUrl] = useState('');
  const [newEventOrganizer, setNewEventOrganizer] = useState(currentUser?.name || 'SriKarthiK (CISO)');
  const [newEventDepartment, setNewEventDepartment] = useState('Information Security & Compliance');
  const [newEventClause, setNewEventClause] = useState('ISO 27001 Clause 9.2');
  const [newEventPriority, setNewEventPriority] = useState<'Critical' | 'High' | 'Medium' | 'Low'>('High');
  const [newEventDescription, setNewEventDescription] = useState('');

  // Persist custom events & feeds
  const persistCustomEvents = (events: AuditCalendarEvent[]) => {
    setCustomEvents(events);
    try {
      localStorage.setItem('apex_grc_custom_calendar_events', JSON.stringify(events));
    } catch (e) {
      console.error(e);
    }
  };

  const persistExternalFeeds = (feeds: ExternalFeedSubscription[], events: AuditCalendarEvent[]) => {
    setExternalFeeds(feeds);
    setSyncedFeedEvents(events);
    try {
      localStorage.setItem('apex_grc_external_feeds', JSON.stringify(feeds));
      localStorage.setItem('apex_grc_synced_feed_events', JSON.stringify(events));
    } catch (e) {
      console.error(e);
    }
  };

  // Aggregate All Events from GRC Context + External Feeds + Custom Events
  const allEvents = useMemo<AuditCalendarEvent[]>(() => {
    const list: AuditCalendarEvent[] = [];

    // 1. Internal Audits
    internalAudits.forEach((audit) => {
      list.push({
        id: `ia_start_${audit.id}`,
        title: `[Internal Audit Kickoff] ${audit.title}`,
        description: `Scope: ${audit.scope}\nDepartment: ${audit.department}\nLead Auditor: ${audit.leadAuditor}`,
        category: 'AUDIT_SESSION',
        startDate: audit.scheduledStartDate,
        endDate: audit.scheduledStartDate,
        allDay: true,
        location: 'Virtual Audit War Room / On-Site',
        organizer: audit.leadAuditor,
        attendees: audit.auditTeam,
        department: audit.department,
        linkedClause: 'ISO 27001 Clause 9.2',
        sourceType: 'INTERNAL_AUDIT',
        sourceId: audit.id,
        priority: 'High',
        status: audit.status === 'Fieldwork Completed' || audit.status === 'Closed' ? 'Completed' : 'Scheduled'
      });

      if (audit.scheduledEndDate && audit.scheduledEndDate !== audit.scheduledStartDate) {
        list.push({
          id: `ia_close_${audit.id}`,
          title: `[Audit Closing & Working Papers Exit] ${audit.auditCode}`,
          description: `Formal exit briefing and working paper submission for ${audit.title}.`,
          category: 'REVIEWER_MEETING',
          startDate: audit.scheduledEndDate,
          endDate: audit.scheduledEndDate,
          allDay: true,
          location: 'Executive Boardroom & Virtual Meet',
          organizer: audit.leadAuditor,
          attendees: audit.auditTeam,
          department: audit.department,
          linkedClause: 'ISO 27001 Clause 9.2',
          sourceType: 'INTERNAL_AUDIT',
          sourceId: audit.id,
          priority: 'High',
          status: audit.status === 'Closed' ? 'Completed' : 'Scheduled'
        });
      }
    });

    // 2. External Audit Timeline (Stage 1 / Stage 2 from Tenant)
    if (currentTenant?.externalAuditTimeline) {
      const ext = currentTenant.externalAuditTimeline;
      if (ext.stage1Date) {
        list.push({
          id: 'ext_stage1',
          title: 'ISO/IEC 27001:2022 Stage 1 External Certification Audit',
          description: 'Official Stage 1 documentation review by Accredited Registrar (BSI/SGS). Review of SoA, Scope, and ISMS policies.',
          category: 'AUDIT_SESSION',
          startDate: ext.stage1Date,
          endDate: ext.stage1Date,
          allDay: true,
          location: 'Virtual Audit Hub / Remote Sampling',
          organizer: 'External Certification Lead Auditor',
          department: 'Executive Leadership & CISO',
          linkedClause: 'ISO/IEC 27001 Stage 1 Gate',
          sourceType: 'EXTERNAL_AUDIT',
          priority: 'Critical',
          status: 'Scheduled'
        });
      }
      if (ext.stage2Date) {
        list.push({
          id: 'ext_stage2',
          title: 'ISO/IEC 27001:2022 Stage 2 Formal Implementation & Verification Audit',
          description: '3-Day on-site and cloud infrastructure verification audit for initial ISO 27001 certification grant.',
          category: 'AUDIT_SESSION',
          startDate: ext.stage2Date,
          endDate: ext.stage2Date,
          allDay: true,
          location: `${organizationService.getOrganizationName(currentTenant)} HQ & Cloud Data Centers`,
          organizer: 'External Certification Audit Team',
          department: 'Entire Organization Scope',
          linkedClause: 'ISO/IEC 27001 Stage 2 Certification',
          sourceType: 'EXTERNAL_AUDIT',
          priority: 'Critical',
          status: 'Scheduled'
        });
      }
    }

    // 3. Evidence Expirations & Deadlines
    evidence.forEach((ev) => {
      if (ev.expiryDate) {
        list.push({
          id: `ev_exp_${ev.id}`,
          title: `[Evidence Recertification Due] ${ev.title}`,
          description: `Control: ${ev.controlCode} • Department: ${ev.department}\nUploaded By: ${ev.uploadedBy}`,
          category: 'EVIDENCE_DEADLINE',
          startDate: ev.expiryDate,
          endDate: ev.expiryDate,
          allDay: true,
          location: 'Apex Evidence Vault',
          organizer: ev.uploadedBy,
          department: ev.department,
          linkedClause: `Annex A ${ev.controlCode}`,
          sourceType: 'EVIDENCE',
          sourceId: ev.id,
          priority: 'Medium',
          status: ev.status === 'Verified' ? 'Scheduled' : 'Pending'
        });
      }
    });

    // 4. Audit Prep & Remediation Tasks
    tasks.forEach((tsk) => {
      if (tsk.dueDate) {
        const isReviewer = tsk.category === 'Policy Review' || tsk.category === 'Audit Prep';
        list.push({
          id: `tsk_${tsk.id}`,
          title: `[${tsk.category}] ${tsk.title}`,
          description: `Assigned To: ${tsk.assignedTo} • Department: ${tsk.department}${tsk.linkedControl ? ` • Linked: ${tsk.linkedControl}` : ''}`,
          category: isReviewer ? 'REVIEWER_MEETING' : 'EVIDENCE_DEADLINE',
          startDate: tsk.dueDate,
          endDate: tsk.dueDate,
          allDay: true,
          location: 'Compliance Workflow Engine',
          organizer: tsk.assignedTo,
          department: tsk.department,
          linkedClause: tsk.linkedControl || 'General ISMS Governance',
          sourceType: 'TASK',
          sourceId: tsk.id,
          priority: tsk.priority === 'High' ? 'High' : 'Medium',
          status: tsk.status === 'Done' ? 'Completed' : 'Pending'
        });
      }
    });

    // 5. Management Review Meetings (Clause 9.3)
    managementReviews.forEach((mrm) => {
      if (mrm.meetingDate) {
        list.push({
          id: `mrm_${mrm.id}`,
          title: `[Clause 9.3 MRM] ${mrm.meetingTitle}`,
          description: `Chair: ${mrm.chairPerson}\nAttendees: ${mrm.attendees.map(a => a.name).join(', ')}\nConclusions: ${mrm.conclusions || 'Scheduled Review'}`,
          category: 'REVIEWER_MEETING',
          startDate: mrm.meetingDate,
          endDate: mrm.meetingDate,
          allDay: true,
          location: 'Executive Conference Room & Virtual Hub',
          organizer: mrm.chairPerson,
          attendees: mrm.attendees.map(a => a.name),
          department: 'Top Management & Steering Committee',
          linkedClause: 'ISO 27001 Clause 9.3',
          sourceType: 'MANAGEMENT_REVIEW',
          sourceId: mrm.id,
          priority: 'Critical',
          status: mrm.status === 'Signed Off' ? 'Completed' : 'Scheduled'
        });
      }
    });

    // 6. Findings / CAPA Target Dates
    findings.forEach((fnd) => {
      if (fnd.capaPlan?.targetDate) {
        list.push({
          id: `fnd_${fnd.id}`,
          title: `[CAPA SLA Target] ${fnd.findingCode}: ${fnd.title}`,
          description: `Corrective Action: ${fnd.capaPlan.correctiveAction}\nOwner: ${fnd.capaPlan.owner}\nDepartment: ${fnd.department}`,
          category: 'EVIDENCE_DEADLINE',
          startDate: fnd.capaPlan.targetDate,
          endDate: fnd.capaPlan.targetDate,
          allDay: true,
          location: 'CAPA Remediation Portal',
          organizer: fnd.capaPlan.owner,
          department: fnd.department,
          linkedClause: fnd.clauseOrControl,
          sourceType: 'CAPA',
          sourceId: fnd.id,
          priority: fnd.severity.includes('Major') ? 'Critical' : 'High',
          status: fnd.status === 'Closed Verified' ? 'Completed' : 'Pending'
        });
      }
    });

    // 7. Custom User-Created Events
    list.push(...customEvents);

    // 8. Synced External Feeds Events
    list.push(...syncedFeedEvents);

    return list;
  }, [internalAudits, currentTenant, evidence, tasks, managementReviews, findings, customEvents, syncedFeedEvents]);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return allEvents.filter((evt) => {
      // Category filter
      if (selectedCategory !== 'ALL' && evt.category !== selectedCategory) {
        return false;
      }

      // Department filter
      if (selectedDepartment !== 'ALL' && evt.department !== selectedDepartment) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const match =
          evt.title.toLowerCase().includes(query) ||
          (evt.description && evt.description.toLowerCase().includes(query)) ||
          (evt.linkedClause && evt.linkedClause.toLowerCase().includes(query)) ||
          (evt.organizer && evt.organizer.toLowerCase().includes(query)) ||
          (evt.department && evt.department.toLowerCase().includes(query));
        if (!match) return false;
      }

      return true;
    });
  }, [allEvents, selectedCategory, selectedDepartment, searchQuery]);

  // Unique departments for filter dropdown
  const departmentOptions = useMemo(() => {
    const set = new Set<string>();
    allEvents.forEach(e => {
      if (e.department) set.add(e.department);
    });
    return Array.from(set).sort();
  }, [allEvents]);

  // Month navigation helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const setToday = () => {
    setCurrentDate(new Date(2026, 8, 2)); // demo context anchor
  };

  // Calendar Grid Days Calculation
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 (Sun) to 6 (Sat)
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: Array<{
      date: Date;
      dateString: string;
      isCurrentMonth: boolean;
      isToday: boolean;
      events: AuditCalendarEvent[];
    }> = [];

    // Previous month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, daysInPrevMonth - i);
      const dateStr = d.toISOString().split('T')[0];
      days.push({
        date: d,
        dateString: dateStr,
        isCurrentMonth: false,
        isToday: false,
        events: []
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isToday = year === 2026 && month === 8 && day === 2; // Anchor demo today

      // Match events for this date
      const dayEvents = filteredEvents.filter(e => {
        const eStart = e.startDate.split('T')[0];
        const eEnd = (e.endDate || e.startDate).split('T')[0];
        return dateStr >= eStart && dateStr <= eEnd;
      });

      days.push({
        date: d,
        dateString: dateStr,
        isCurrentMonth: true,
        isToday,
        events: dayEvents
      });
    }

    // Next month padding to fill complete grid (multiples of 7)
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const d = new Date(year, month + 1, i);
      const dateStr = d.toISOString().split('T')[0];
      days.push({
        date: d,
        dateString: dateStr,
        isCurrentMonth: false,
        isToday: false,
        events: []
      });
    }

    return days;
  }, [year, month, filteredEvents]);

  // Export full calendar ICS
  const handleExportFullICS = () => {
    const orgName = organizationService.getOrganizationName(currentTenant);
    const icsContent = generateICSFeed(
      allEvents,
      `${orgName} - ISMS Audit & Compliance Calendar`
    );
    const fileName = `${orgName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-isms-audit-compliance-calendar.ics`;
    downloadICSFile(fileName, icsContent);
  };

  // Copy live subscription feed link
  const handleCopyFeedLink = () => {
    const feedUrl = `${window.location.protocol === 'https:' ? 'webcals:' : 'webcal:'}//${window.location.host}/api/v1/grc/calendar/feed.ics?tenantId=${currentTenant?.id || 'active'}&token=${Date.now()}`;
    navigator.clipboard.writeText(feedUrl);
    setCopiedFeedLink(true);
    setTimeout(() => setCopiedFeedLink(false), 2500);
  };

  // Sync External Feeds (simulate live network refresh)
  const handleRefreshFeeds = () => {
    setIsSyncingFeeds(true);
    setTimeout(() => {
      // Re-parse feeds
      const refreshedEvents: AuditCalendarEvent[] = [];
      externalFeeds.forEach(feed => {
        const sample = SAMPLE_EXTERNAL_FEEDS.find(s => s.url === feed.url);
        if (sample && feed.active) {
          const parsed = parseICSFeed(sample.sampleIcs, feed.name);
          refreshedEvents.push(...parsed);
        }
      });
      setSyncedFeedEvents(refreshedEvents);
      setExternalFeeds(prev =>
        prev.map(f => ({
          ...f,
          lastSynced: new Date().toISOString()
        }))
      );
      setIsSyncingFeeds(false);
    }, 800);
  };

  // Add custom or sample feed
  const handleAddSampleFeed = (sample: typeof SAMPLE_EXTERNAL_FEEDS[0]) => {
    const newFeed: ExternalFeedSubscription = {
      id: `feed_${Date.now()}`,
      name: sample.name,
      url: sample.url,
      lastSynced: new Date().toISOString(),
      eventCount: 2,
      color: '#0284c7',
      active: true
    };
    const parsed = parseICSFeed(sample.sampleIcs, sample.name);
    const updatedFeeds = [...externalFeeds, newFeed];
    const updatedEvents = [...syncedFeedEvents, ...parsed];
    persistExternalFeeds(updatedFeeds, updatedEvents);
  };

  const handleToggleFeed = (feedId: string) => {
    const updatedFeeds = externalFeeds.map(f =>
      f.id === feedId ? { ...f, active: !f.active } : f
    );
    // Rebuild synced events
    const updatedEvents: AuditCalendarEvent[] = [];
    updatedFeeds.forEach(feed => {
      if (feed.active) {
        const sample = SAMPLE_EXTERNAL_FEEDS.find(s => s.url === feed.url);
        if (sample) {
          updatedEvents.push(...parseICSFeed(sample.sampleIcs, feed.name));
        }
      }
    });
    persistExternalFeeds(updatedFeeds, updatedEvents);
  };

  const handleDeleteFeed = (feedId: string) => {
    const feedToDelete = externalFeeds.find(f => f.id === feedId);
    const updatedFeeds = externalFeeds.filter(f => f.id !== feedId);
    const updatedEvents = syncedFeedEvents.filter(e => e.externalFeedName !== feedToDelete?.name);
    persistExternalFeeds(updatedFeeds, updatedEvents);
  };

  // Handle manual ICS file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        const parsed = parseICSFeed(content, file.name.replace('.ics', ''));
        if (parsed.length > 0) {
          const newFeed: ExternalFeedSubscription = {
            id: `feed_upload_${Date.now()}`,
            name: file.name.replace('.ics', ''),
            url: `file://${file.name}`,
            lastSynced: new Date().toISOString(),
            eventCount: parsed.length,
            color: '#10b981',
            active: true
          };
          const updatedFeeds = [...externalFeeds, newFeed];
          const updatedEvents = [...syncedFeedEvents, ...parsed];
          persistExternalFeeds(updatedFeeds, updatedEvents);
          showToast({
            type: 'success',
            title: 'Calendar Import Completed',
            message: `Successfully imported ${parsed.length} events from ${file.name}!`
          });
        } else {
          showToast({
            type: 'warning',
            title: 'No Events Found',
            message: 'No valid VEVENT records found in this .ics file.'
          });
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Submit new event form
  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    const startIso = `${newEventStartDate}T${newEventStartTime}:00`;
    const endIso = `${newEventEndDate}T${newEventEndTime}:00`;

    const newEvt: AuditCalendarEvent = {
      id: `custom_${Date.now()}`,
      title: newEventTitle.trim(),
      description: newEventDescription.trim(),
      category: newEventCategory,
      startDate: startIso,
      endDate: endIso,
      timeString: `${newEventStartTime} - ${newEventEndTime}`,
      location: newEventLocation.trim() || 'Virtual Conference Room',
      meetingUrl: newEventMeetingUrl.trim(),
      organizer: newEventOrganizer.trim(),
      department: newEventDepartment,
      linkedClause: newEventClause.trim(),
      priority: newEventPriority,
      sourceType: 'CUSTOM',
      status: 'Scheduled'
    };

    const updated = [newEvt, ...customEvents];
    persistCustomEvents(updated);
    setIsCreateModalOpen(false);

    // Reset fields
    setNewEventTitle('');
    setNewEventDescription('');
    setNewEventLocation('');
    setNewEventMeetingUrl('');
  };

  // Helper badge color
  const getCategoryStyles = (category: AuditEventCategory) => {
    switch (category) {
      case 'AUDIT_SESSION':
        return {
          badgeBg: 'bg-sky-500/15 text-sky-200 border-sky-500/40 font-bold',
          dotBg: 'bg-sky-400',
          pillBg: 'bg-sky-950/90 border-sky-700/80 text-sky-100 font-semibold hover:bg-sky-900',
          label: 'Audit Session'
        };
      case 'EVIDENCE_DEADLINE':
        return {
          badgeBg: 'bg-amber-500/15 text-amber-200 border-amber-500/40 font-bold',
          dotBg: 'bg-amber-400',
          pillBg: 'bg-amber-950/90 border-amber-700/80 text-amber-100 font-semibold hover:bg-amber-900',
          label: 'Evidence Deadline'
        };
      case 'REVIEWER_MEETING':
        return {
          badgeBg: 'bg-purple-500/15 text-purple-200 border-purple-500/40 font-bold',
          dotBg: 'bg-purple-400',
          pillBg: 'bg-purple-950/90 border-purple-700/80 text-purple-100 font-semibold hover:bg-purple-900',
          label: 'Reviewer Meeting'
        };
      case 'EXTERNAL_SYNC':
        return {
          badgeBg: 'bg-emerald-500/15 text-emerald-200 border-emerald-500/40 font-bold',
          dotBg: 'bg-emerald-400',
          pillBg: 'bg-emerald-950/90 border-emerald-700/80 text-emerald-100 font-semibold hover:bg-emerald-900',
          label: 'External Synced'
        };
      default:
        return {
          badgeBg: 'bg-slate-500/15 text-slate-200 border-slate-500/40 font-bold',
          dotBg: 'bg-slate-400',
          pillBg: 'bg-slate-900 border-slate-700 text-slate-100 font-semibold hover:bg-slate-800',
          label: 'Event'
        };
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Action Controls */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400 px-2.5 py-0.5 rounded-md bg-sky-950 border border-sky-800 flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5" />
                Live Compliance Schedule & Feed Sync
              </span>
              <span className="text-xs text-slate-400 font-mono">RFC 5545 iCalendar Standards</span>
            </div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Audit Sessions, Evidence Deadlines & Reviewer Meetings
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Unified calendar synchronization for Clause 9.2 internal audits, Clause 9.3 Management Reviews, ISO 27001 Stage 1/2 certification windows, and evidence collection SLAs with two-way ICS feed support.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setIsSyncModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all shadow-sm"
              title="Manage and configure external calendar feed subscriptions"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-sky-400 ${isSyncingFeeds ? 'animate-spin' : ''}`} />
              <span>Sync Feeds ({externalFeeds.filter(f => f.active).length} Active)</span>
            </button>

            <button
              onClick={handleExportFullICS}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all shadow-sm"
              title="Export all upcoming audit and compliance events to standard .ics file"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export .ICS</span>
            </button>

            <button
              onClick={handleCopyFeedLink}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-800 text-xs font-semibold transition-all shadow-sm"
              title="Copy live webcal feed subscription URL"
            >
              {copiedFeedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Link2 className="w-3.5 h-3.5 text-indigo-400" />}
              <span>{copiedFeedLink ? 'Feed Link Copied!' : 'Copy WebCal Feed'}</span>
            </button>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-sm shadow-sky-900/30"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Schedule Event</span>
            </button>
          </div>
        </div>

        {/* Live Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800/80">
          <div className="flex items-center space-x-3 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
            </div>
            <div>
              <div className="text-xs text-slate-400">Audit Sessions</div>
              <div className="text-sm font-bold text-white font-mono">
                {allEvents.filter(e => e.category === 'AUDIT_SESSION').length} Scheduled
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="text-xs text-slate-400">Evidence Deadlines</div>
              <div className="text-sm font-bold text-white font-mono">
                {allEvents.filter(e => e.category === 'EVIDENCE_DEADLINE').length} Active
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <div className="text-xs text-slate-400">Reviewer Meetings</div>
              <div className="text-sm font-bold text-white font-mono">
                {allEvents.filter(e => e.category === 'REVIEWER_MEETING').length} Sessions
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="text-xs text-slate-400">External Feeds</div>
              <div className="text-sm font-bold text-white font-mono">
                {syncedFeedEvents.length} Synced Events
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Navigation Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Month Navigation */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 bg-slate-950 border border-slate-800 rounded-xl p-1">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={setToday}
              className="px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              Today
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h3 className="text-base font-bold text-white tracking-tight">
            {monthNames[month]} <span className="text-sky-400 font-mono">{year}</span>
          </h3>
        </div>

        {/* Search & Category Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sessions, clauses, assignees..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Department Filter */}
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-sky-500"
          >
            <option value="ALL">All Departments</option>
            {departmentOptions.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          {/* Category Switcher Pills */}
          <div className="flex items-center space-x-1 p-1 bg-slate-950 border border-slate-800 rounded-xl">
            {(
              [
                { id: 'ALL', label: 'All' },
                { id: 'AUDIT_SESSION', label: 'Audit Sessions' },
                { id: 'EVIDENCE_DEADLINE', label: 'Deadlines' },
                { id: 'REVIEWER_MEETING', label: 'Meetings' },
                { id: 'EXTERNAL_SYNC', label: 'External' }
              ] as const
            ).map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedCategory === tab.id
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-1 p-1 bg-slate-950 border border-slate-800 rounded-xl">
            <button
              onClick={() => setViewMode('month')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'month' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'agenda' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Agenda
            </button>
          </div>
        </div>
      </div>

      {/* Main Calendar Views */}
      {viewMode === 'month' && (
        <div className="p-4 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-200 uppercase tracking-wider pb-2 border-b border-slate-800">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Day Grid */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, idx) => {
              const hasEvents = day.events.length > 0;
              return (
                <div
                  key={idx}
                  className={`min-h-[115px] sm:min-h-[135px] p-2 rounded-xl border flex flex-col justify-between transition-all ${
                    day.isCurrentMonth
                      ? day.isToday
                        ? 'bg-sky-950/20 border-sky-500/50 shadow-sm'
                        : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700'
                      : 'bg-slate-950/20 border-slate-900/40 text-slate-500 opacity-50'
                  }`}
                >
                  {/* Top Day Number Header */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-mono font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        day.isToday
                          ? 'bg-sky-500 text-white font-bold shadow-sm'
                          : day.isCurrentMonth
                          ? 'text-white font-bold'
                          : 'text-slate-500'
                      }`}
                    >
                      {day.date.getDate()}
                    </span>

                    {hasEvents && day.isCurrentMonth && (
                      <span className="text-[10px] font-mono font-bold text-slate-200 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700">
                        {day.events.length}
                      </span>
                    )}
                  </div>

                  {/* Events Container in Day Cell */}
                  <div className="space-y-1.5 my-1 flex-1 overflow-y-auto max-h-[85px] scrollbar-thin">
                    {day.events.slice(0, 3).map((evt) => {
                      const style = getCategoryStyles(evt.category);
                      return (
                        <button
                          key={evt.id}
                          onClick={() => setSelectedEvent(evt)}
                          className={`w-full text-left px-1.5 py-1 rounded text-[11px] font-medium border truncate block transition-all ${style.pillBg}`}
                        >
                          <div className="flex items-center space-x-1 truncate">
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dotBg}`} />
                            <span className="truncate">{evt.title}</span>
                          </div>
                        </button>
                      );
                    })}

                    {day.events.length > 3 && (
                      <button
                        onClick={() => setSelectedEvent(day.events[3])}
                        className="text-[10px] font-semibold text-sky-400 hover:text-sky-300 block pl-1"
                      >
                        +{day.events.length - 3} more items
                      </button>
                    )}
                  </div>

                  {/* Empty cell placeholder click to schedule */}
                  {day.isCurrentMonth && day.events.length === 0 && (
                    <button
                      onClick={() => {
                        setNewEventStartDate(day.dateString);
                        setNewEventEndDate(day.dateString);
                        setIsCreateModalOpen(true);
                      }}
                      className="opacity-0 hover:opacity-100 text-[10px] text-slate-500 hover:text-sky-400 flex items-center justify-center gap-1 py-0.5 transition-opacity"
                    >
                      <Plus className="w-2.5 h-2.5" />
                      <span>Add</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Agenda / Chronological List View */}
      {viewMode === 'agenda' && (
        <div className="space-y-4">
          {filteredEvents.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <CalendarIcon className="w-10 h-10 text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-white">No compliance events match your current filter</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Try selecting "All Categories" or reset your search query to view all scheduled audit sessions and deadlines.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('ALL');
                  setSelectedDepartment('ALL');
                  setSearchQuery('');
                }}
                className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEvents
                .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                .map((evt) => {
                  const style = getCategoryStyles(evt.category);
                  const dateStr = new Date(evt.startDate).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  });

                  return (
                    <div
                      key={evt.id}
                      onClick={() => setSelectedEvent(evt)}
                      className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${style.badgeBg}`}>
                            {style.label}
                          </span>
                          {evt.priority && (
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                              evt.priority === 'Critical'
                                ? 'bg-rose-950 text-rose-400 border border-rose-800'
                                : evt.priority === 'High'
                                ? 'bg-amber-950 text-amber-400 border border-amber-800'
                                : 'bg-slate-800 text-slate-300'
                            }`}>
                              {evt.priority} Priority
                            </span>
                          )}
                          {evt.linkedClause && (
                            <span className="text-[11px] font-mono text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800/60">
                              {evt.linkedClause}
                            </span>
                          )}
                          {evt.externalFeedName && (
                            <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                              Feed: {evt.externalFeedName}
                            </span>
                          )}
                        </div>

                        <h4 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
                          {evt.title}
                        </h4>

                        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                          {evt.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 pt-1">
                          <div className="flex items-center space-x-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            <span>{dateStr} {evt.timeString ? `• ${evt.timeString}` : ''}</span>
                          </div>
                          {evt.location && (
                            <div className="flex items-center space-x-1.5">
                              <MapPin className="w-3.5 h-3.5 text-slate-500" />
                              <span>{evt.location}</span>
                            </div>
                          )}
                          {evt.organizer && (
                            <div className="flex items-center space-x-1.5">
                              <Users className="w-3.5 h-3.5 text-slate-500" />
                              <span>Lead: {evt.organizer}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Quick Action links */}
                      <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
                        {evt.meetingUrl && (
                          <a
                            href={evt.meetingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors"
                          >
                            <Video className="w-3.5 h-3.5" />
                            <span>Join</span>
                          </a>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(evt);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* Detail Modal for Selected Event */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header category badge */}
            <div className="flex items-center space-x-2">
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md border ${getCategoryStyles(selectedEvent.category).badgeBg}`}>
                {getCategoryStyles(selectedEvent.category).label}
              </span>
              {selectedEvent.priority && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {selectedEvent.priority} Priority
                </span>
              )}
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">{selectedEvent.title}</h3>
              {selectedEvent.linkedClause && (
                <div className="text-xs text-sky-400 font-mono">
                  Requirement / Clause: {selectedEvent.linkedClause}
                </div>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2.5 text-xs">
              <div className="flex items-start justify-between">
                <span className="text-slate-400 font-medium">Date & Schedule:</span>
                <span className="text-white font-mono text-right">
                  {new Date(selectedEvent.startDate).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                  {selectedEvent.timeString ? ` (${selectedEvent.timeString})` : ''}
                </span>
              </div>

              {selectedEvent.location && (
                <div className="flex items-start justify-between">
                  <span className="text-slate-400 font-medium">Location / Channel:</span>
                  <span className="text-slate-200 text-right">{selectedEvent.location}</span>
                </div>
              )}

              {selectedEvent.organizer && (
                <div className="flex items-start justify-between">
                  <span className="text-slate-400 font-medium">Organizer / Lead:</span>
                  <span className="text-slate-200 text-right">{selectedEvent.organizer}</span>
                </div>
              )}

              {selectedEvent.department && (
                <div className="flex items-start justify-between">
                  <span className="text-slate-400 font-medium">Department:</span>
                  <span className="text-slate-200 text-right">{selectedEvent.department}</span>
                </div>
              )}

              {selectedEvent.attendees && selectedEvent.attendees.length > 0 && (
                <div className="flex items-start justify-between">
                  <span className="text-slate-400 font-medium">Attendees / Roster:</span>
                  <span className="text-slate-200 text-right">{selectedEvent.attendees.join(', ')}</span>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-slate-300">Objectives & Notes:</h4>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-800">
                {selectedEvent.description || 'No additional notes provided for this compliance milestone.'}
              </p>
            </div>

            {/* Deep Links to Modules if applicable */}
            {selectedEvent.sourceType === 'INTERNAL_AUDIT' && (
              <div className="p-3 rounded-xl bg-sky-950/30 border border-sky-800/40 flex items-center justify-between">
                <span className="text-xs text-sky-300">Linked to Internal Audit Working Papers</span>
                <button
                  onClick={() => {
                    setSelectedEvent(null);
                    handleNav('internal_audit');
                  }}
                  className="px-2.5 py-1 text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors"
                >
                  View Checklists
                </button>
              </div>
            )}

            {selectedEvent.sourceType === 'MANAGEMENT_REVIEW' && (
              <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-800/40 flex items-center justify-between">
                <span className="text-xs text-purple-300">Linked to Clause 9.3 Management Review Meeting</span>
                <button
                  onClick={() => {
                    setSelectedEvent(null);
                    handleNav('management_review');
                  }}
                  className="px-2.5 py-1 text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
                >
                  Open MRM Module
                </button>
              </div>
            )}

            {selectedEvent.sourceType === 'CAPA' && (
              <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-800/40 flex items-center justify-between">
                <span className="text-xs text-rose-300">Linked to CAPA Remediation Finding</span>
                <button
                  onClick={() => {
                    setSelectedEvent(null);
                    handleNav('findings_capa');
                  }}
                  className="px-2.5 py-1 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-colors"
                >
                  View CAPA Record
                </button>
              </div>
            )}

            {/* Export & Personal Sync Actions */}
            <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <a
                  href={getGoogleCalendarUrl(selectedEvent)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                  <span>Google Cal</span>
                </a>

                <a
                  href={getOutlookCalendarUrl(selectedEvent)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
                  <span>Outlook 365</span>
                </a>

                <button
                  onClick={() => {
                    const ics = generateICSFeed([selectedEvent], selectedEvent.title);
                    downloadICSFile(`${selectedEvent.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.ics`, ics);
                  }}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>.ICS File</span>
                </button>
              </div>

              {selectedEvent.sourceType === 'CUSTOM' && (
                <button
                  onClick={() => {
                    const filtered = customEvents.filter(e => e.id !== selectedEvent.id);
                    persistCustomEvents(filtered);
                    setSelectedEvent(null);
                  }}
                  className="flex items-center space-x-1 text-xs text-rose-400 hover:text-rose-300 font-semibold px-2 py-1 rounded hover:bg-rose-950/40 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Event</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sync External Feeds Modal */}
      {isSyncModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsSyncModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-bold text-sky-400 bg-sky-950 px-2.5 py-0.5 rounded border border-sky-800">
                  External ICS Feeds & Two-Way Sync
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">External Calendar Feeds Synchronization</h3>
              <p className="text-xs text-slate-300">
                Subscribe to your registrar's live audit feed (BSI, SGS, DNV) or import corporate calendar files in standard iCalendar (RFC 5545) format.
              </p>
            </div>

            {/* Outgoing Live WebCal Subscription */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5 text-sky-400" />
                  Live Outgoing Feed (Subscribe from Apple / Google / Outlook)
                </h4>
                <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                  Status: Live & Synced
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Paste this WebCal link into your external calendar client to receive real-time automatic updates as audit milestones or evidence deadlines shift.
              </p>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  readOnly
                  value={`webcal://apexfintech.io/api/v1/grc/calendar/feed.ics?token=apex_${currentTenant?.id || 'tenant_apex'}`}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-slate-300 focus:outline-none"
                />
                <button
                  onClick={handleCopyFeedLink}
                  className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shrink-0 transition-colors flex items-center gap-1.5"
                >
                  {copiedFeedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedFeedLink ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Active Subscribed Feeds */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white">Active External Feeds ({externalFeeds.length})</h4>
                <button
                  onClick={handleRefreshFeeds}
                  disabled={isSyncingFeeds}
                  className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncingFeeds ? 'animate-spin' : ''}`} />
                  <span>Sync Now</span>
                </button>
              </div>

              <div className="space-y-2">
                {externalFeeds.map(feed => (
                  <div
                    key={feed.id}
                    className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className={`w-2 h-2 rounded-full ${feed.active ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                        <h5 className="text-xs font-bold text-white truncate">{feed.name}</h5>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono truncate">{feed.url}</div>
                      <div className="text-[10px] text-slate-500">
                        Last checked: {new Date(feed.lastSynced).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {feed.eventCount} events
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => handleToggleFeed(feed.id)}
                        className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                          feed.active
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {feed.active ? 'Enabled' : 'Disabled'}
                      </button>
                      <button
                        onClick={() => handleDeleteFeed(feed.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                        title="Remove feed"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Import Options: Pre-configured Feeds or File Upload */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <h4 className="text-xs font-bold text-white">Subscribe to Registrar & Infrastructure Feeds</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SAMPLE_EXTERNAL_FEEDS.map((sample, idx) => {
                  const alreadyAdded = externalFeeds.some(f => f.url === sample.url);
                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2 flex flex-col justify-between"
                    >
                      <div>
                        <h5 className="text-xs font-bold text-white">{sample.name}</h5>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{sample.description}</p>
                      </div>
                      <button
                        onClick={() => handleAddSampleFeed(sample)}
                        disabled={alreadyAdded}
                        className={`w-full py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          alreadyAdded
                            ? 'bg-slate-900 text-slate-500 cursor-not-allowed'
                            : 'bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30'
                        }`}
                      >
                        {alreadyAdded ? 'Feed Subscribed' : '+ Subscribe to Feed'}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Upload Local .ics file */}
              <div className="p-4 rounded-xl border border-dashed border-slate-700 bg-slate-950/40 text-center space-y-2">
                <UploadCloud className="w-6 h-6 text-slate-400 mx-auto" />
                <div>
                  <div className="text-xs font-semibold text-white">Import Calendar from .ICS File</div>
                  <div className="text-[11px] text-slate-400">Upload audit schedules exported from Outlook, Apple, or Google</div>
                </div>
                <label className="inline-block px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold cursor-pointer transition-colors">
                  <span>Browse .ICS File</span>
                  <input
                    type="file"
                    accept=".ics,text/calendar"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create / Schedule Event Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <span className="text-[11px] font-bold text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
                New Milestone
              </span>
              <h3 className="text-lg font-bold text-white">Schedule Audit Session or Deadline</h3>
              <p className="text-xs text-slate-300">
                Create a calendar entry synchronized with the ISMS audit timeline and exportable to ICS feeds.
              </p>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              {/* Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Event Title *</label>
                <input
                  type="text"
                  required
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="e.g. Q3 DevOps Access Control Audit Sampling Session"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Category */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Category *</label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: 'AUDIT_SESSION', label: 'Audit Session' },
                      { id: 'EVIDENCE_DEADLINE', label: 'Evidence Deadline' },
                      { id: 'REVIEWER_MEETING', label: 'Reviewer Meeting' }
                    ] as const
                  ).map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setNewEventCategory(cat.id)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                        newEventCategory === cat.id
                          ? 'bg-sky-600 text-white border-sky-500 shadow-sm'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date & Time Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="space-y-1 col-span-2 sm:col-span-1">
                  <label className="text-[11px] font-bold text-slate-400">Start Date</label>
                  <input
                    type="date"
                    required
                    value={newEventStartDate}
                    onChange={(e) => setNewEventStartDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1 col-span-2 sm:col-span-1">
                  <label className="text-[11px] font-bold text-slate-400">Start Time</label>
                  <input
                    type="time"
                    required
                    value={newEventStartTime}
                    onChange={(e) => setNewEventStartTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1 col-span-2 sm:col-span-1">
                  <label className="text-[11px] font-bold text-slate-400">End Date</label>
                  <input
                    type="date"
                    required
                    value={newEventEndDate}
                    onChange={(e) => setNewEventEndDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1 col-span-2 sm:col-span-1">
                  <label className="text-[11px] font-bold text-slate-400">End Time</label>
                  <input
                    type="time"
                    required
                    value={newEventEndTime}
                    onChange={(e) => setNewEventEndTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* Location & Video Meeting URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Location / Room</label>
                  <input
                    type="text"
                    value={newEventLocation}
                    onChange={(e) => setNewEventLocation(e.target.value)}
                    placeholder="e.g. Boardroom 4A / Virtual"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Virtual Meeting URL</label>
                  <input
                    type="url"
                    value={newEventMeetingUrl}
                    onChange={(e) => setNewEventMeetingUrl(e.target.value)}
                    placeholder="e.g. https://meet.google.com/xyz-abc"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* Department & Linked Clause */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Department</label>
                  <select
                    value={newEventDepartment}
                    onChange={(e) => setNewEventDepartment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none"
                  >
                    <option value="Information Security & Compliance">Information Security & Compliance</option>
                    <option value="Software Engineering & DevOps">Software Engineering & DevOps</option>
                    <option value="Human Resources & People Ops">Human Resources & People Ops</option>
                    <option value="Executive Leadership & Legal">Executive Leadership & Legal</option>
                    <option value="Procurement & Vendor Governance">Procurement & Vendor Governance</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Linked Clause / Standard</label>
                  <input
                    type="text"
                    value={newEventClause}
                    onChange={(e) => setNewEventClause(e.target.value)}
                    placeholder="e.g. ISO 27001 Clause 9.2 or Annex A 5.15"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Agenda Objectives & Sampling Notes</label>
                <textarea
                  rows={2}
                  value={newEventDescription}
                  onChange={(e) => setNewEventDescription(e.target.value)}
                  placeholder="Details regarding attendees, sampling requirements, and expected working papers..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-colors shadow-sm"
                >
                  Add to Compliance Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
