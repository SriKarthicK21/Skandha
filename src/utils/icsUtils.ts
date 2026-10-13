export type AuditEventCategory = 'AUDIT_SESSION' | 'EVIDENCE_DEADLINE' | 'REVIEWER_MEETING' | 'EXTERNAL_SYNC';

export interface AuditCalendarEvent {
  id: string;
  title: string;
  description: string;
  category: AuditEventCategory;
  startDate: string; // YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss
  endDate: string;   // YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss
  allDay?: boolean;
  timeString?: string;
  location?: string;
  meetingUrl?: string;
  organizer?: string;
  attendees?: string[];
  department?: string;
  linkedClause?: string;
  sourceType: 'INTERNAL_AUDIT' | 'EXTERNAL_AUDIT' | 'EVIDENCE' | 'TASK' | 'MANAGEMENT_REVIEW' | 'CAPA' | 'EXTERNAL_FEED' | 'CUSTOM';
  sourceId?: string;
  priority?: 'Critical' | 'High' | 'Medium' | 'Low';
  status?: 'Scheduled' | 'In Progress' | 'Completed' | 'Pending' | 'Overdue';
  externalFeedName?: string;
}

export interface ExternalFeedSubscription {
  id: string;
  name: string;
  url: string;
  lastSynced: string;
  eventCount: number;
  color: string;
  active: boolean;
}

/**
 * Format a Date or ISO string into an iCalendar RFC 5545 timestamp (UTC or local)
 */
export function formatToICSDate(dateStr: string, isAllDay = false): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    const now = new Date();
    return `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}00Z`;
  }

  const year = date.getUTCFullYear();
  const month = pad(date.getUTCMonth() + 1);
  const day = pad(date.getUTCDate());

  if (isAllDay) {
    return `${year}${month}${day}`;
  }

  const hours = pad(date.getUTCHours());
  const minutes = pad(date.getUTCMinutes());
  const seconds = pad(date.getUTCSeconds());

  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

/**
 * Escape text for RFC 5545 compliance
 */
export function escapeICSText(text: string): string {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '');
}

/**
 * Unescape text from RFC 5545 ICS format
 */
export function unescapeICSText(text: string): string {
  if (!text) return '';
  return text
    .replace(/\\n/g, '\n')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\');
}

/**
 * Generate full RFC 5545 .ics calendar content
 */
export function generateICSFeed(
  events: AuditCalendarEvent[],
  calendarName = 'Apex GRC - ISMS Audit & Compliance Calendar'
): string {
  const now = formatToICSDate(new Date().toISOString());

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Apex Security GRC//ISMS Audit Calendar 2.0//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeICSText(calendarName)}`,
    'X-WR-TIMEZONE:UTC',
    'X-WR-CALDESC:Comprehensive ISO 27001 / SOC 2 Internal Audits, Evidence Deadlines, and Reviewer Meetings Feed'
  ];

  events.forEach((evt) => {
    const isAllDay = evt.allDay || evt.startDate.length === 10;
    const startProp = isAllDay
      ? `DTSTART;VALUE=DATE:${formatToICSDate(evt.startDate, true)}`
      : `DTSTART:${formatToICSDate(evt.startDate)}`;
    
    // For all-day events in ICS, end date is exclusive (day + 1 if same day)
    let endFormatted: string;
    if (isAllDay) {
      const eDate = new Date(evt.endDate || evt.startDate);
      eDate.setDate(eDate.getDate() + 1);
      endFormatted = `DTEND;VALUE=DATE:${formatToICSDate(eDate.toISOString(), true)}`;
    } else {
      endFormatted = `DTEND:${formatToICSDate(evt.endDate || evt.startDate)}`;
    }

    const description = [
      evt.description || '',
      evt.linkedClause ? `Linked Requirement / Clause: ${evt.linkedClause}` : '',
      evt.department ? `Department: ${evt.department}` : '',
      evt.organizer ? `Lead / Organizer: ${evt.organizer}` : '',
      evt.priority ? `Priority: ${evt.priority}` : '',
      evt.meetingUrl ? `Meeting Link: ${evt.meetingUrl}` : '',
      'Generated automatically by Apex GRC ISMS Platform'
    ]
      .filter(Boolean)
      .join('\n\n');

    lines.push(
      'BEGIN:VEVENT',
      `UID:${evt.id || `grc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`}@apexgrc.io`,
      `DTSTAMP:${now}`,
      startProp,
      endFormatted,
      `SUMMARY:[${getCategoryPrefix(evt.category)}] ${escapeICSText(evt.title)}`,
      `DESCRIPTION:${escapeICSText(description)}`,
      evt.location ? `LOCATION:${escapeICSText(evt.location)}` : '',
      evt.meetingUrl ? `URL:${escapeICSText(evt.meetingUrl)}` : '',
      `CATEGORIES:${evt.category}`,
      `STATUS:${evt.status === 'Completed' ? 'CONFIRMED' : 'TENTATIVE'}`,
      'END:VEVENT'
    );
  });

  lines.push('END:VCALENDAR');

  return lines.filter(Boolean).join('\r\n');
}

function getCategoryPrefix(category: AuditEventCategory): string {
  switch (category) {
    case 'AUDIT_SESSION':
      return 'Audit Session';
    case 'EVIDENCE_DEADLINE':
      return 'Evidence Deadline';
    case 'REVIEWER_MEETING':
      return 'Reviewer Meeting';
    case 'EXTERNAL_SYNC':
      return 'External Feed';
    default:
      return 'GRC Event';
  }
}

/**
 * Trigger browser file download of ICS content
 */
export function downloadICSFile(fileName: string, icsContent: string): void {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName.endsWith('.ics') ? fileName : `${fileName}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate Google Calendar Web URL for quick 1-click addition
 */
export function getGoogleCalendarUrl(event: AuditCalendarEvent): string {
  const isAllDay = event.allDay || event.startDate.length === 10;
  const startStr = formatToICSDate(event.startDate, isAllDay);
  const endStr = formatToICSDate(event.endDate || event.startDate, isAllDay);
  const dates = `${startStr}/${endStr}`;

  const details = [
    event.description || '',
    event.linkedClause ? `Requirement: ${event.linkedClause}` : '',
    event.department ? `Department: ${event.department}` : '',
    event.meetingUrl ? `Link: ${event.meetingUrl}` : ''
  ]
    .filter(Boolean)
    .join('\n\n');

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `[${getCategoryPrefix(event.category)}] ${event.title}`,
    dates,
    details,
    location: event.location || event.meetingUrl || 'Apex GRC Virtual Portal'
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generate Outlook 365 Web URL for quick 1-click addition
 */
export function getOutlookCalendarUrl(event: AuditCalendarEvent): string {
  const isAllDay = event.allDay || event.startDate.length === 10;
  const startIso = new Date(event.startDate).toISOString();
  const endIso = new Date(event.endDate || event.startDate).toISOString();

  const details = [
    event.description || '',
    event.linkedClause ? `Requirement: ${event.linkedClause}` : '',
    event.department ? `Department: ${event.department}` : '',
    event.meetingUrl ? `Link: ${event.meetingUrl}` : ''
  ]
    .filter(Boolean)
    .join('\n\n');

  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: `[${getCategoryPrefix(event.category)}] ${event.title}`,
    startdt: startIso,
    enddt: endIso,
    body: details,
    location: event.location || event.meetingUrl || 'Apex GRC Virtual Portal',
    allday: isAllDay ? 'true' : 'false'
  });

  return `https://outlook.office.com/calendar/0/deeplink/compose?${params.toString()}`;
}

/**
 * Robust RFC 5545 parser for imported ICS feeds
 */
export function parseICSFeed(icsContent: string, feedName = 'Imported Feed'): AuditCalendarEvent[] {
  const events: AuditCalendarEvent[] = [];
  if (!icsContent || !icsContent.includes('BEGIN:VCALENDAR')) {
    return events;
  }

  // Unfold multi-line ICS fields (lines starting with space or tab are continuations)
  const unfolded = icsContent.replace(/\r\n[ \t]/g, '').replace(/\n[ \t]/g, '');
  const lines = unfolded.split(/\r\n|\n|\r/);

  let currentEvent: Partial<AuditCalendarEvent> | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line === 'BEGIN:VEVENT') {
      currentEvent = {
        id: `ext_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        category: 'EXTERNAL_SYNC',
        sourceType: 'EXTERNAL_FEED',
        externalFeedName: feedName,
        status: 'Scheduled',
        priority: 'Medium'
      };
      continue;
    }

    if (line === 'END:VEVENT' && currentEvent) {
      if (currentEvent.title && currentEvent.startDate) {
        if (!currentEvent.endDate) {
          currentEvent.endDate = currentEvent.startDate;
        }
        
        // Auto-categorize based on title/description keywords if needed
        const fullText = `${currentEvent.title} ${currentEvent.description || ''}`.toLowerCase();
        if (fullText.includes('audit') || fullText.includes('stage 1') || fullText.includes('stage 2') || fullText.includes('fieldwork')) {
          currentEvent.category = 'AUDIT_SESSION';
        } else if (fullText.includes('evidence') || fullText.includes('deadline') || fullText.includes('due') || fullText.includes('recertification')) {
          currentEvent.category = 'EVIDENCE_DEADLINE';
        } else if (fullText.includes('meeting') || fullText.includes('review') || fullText.includes('committee') || fullText.includes('mrm')) {
          currentEvent.category = 'REVIEWER_MEETING';
        }

        events.push(currentEvent as AuditCalendarEvent);
      }
      currentEvent = null;
      continue;
    }

    if (!currentEvent) continue;

    // Parse Key:Value properties
    const separatorIdx = line.indexOf(':');
    if (separatorIdx === -1) continue;

    const propHeader = line.substring(0, separatorIdx);
    const propValue = line.substring(separatorIdx + 1);

    const [propName] = propHeader.split(';');

    switch (propName.toUpperCase()) {
      case 'UID':
        currentEvent.id = propValue || currentEvent.id;
        break;
      case 'SUMMARY':
        currentEvent.title = unescapeICSText(propValue);
        break;
      case 'DESCRIPTION':
        currentEvent.description = unescapeICSText(propValue);
        break;
      case 'LOCATION':
        currentEvent.location = unescapeICSText(propValue);
        break;
      case 'URL':
        currentEvent.meetingUrl = propValue;
        break;
      case 'DTSTART':
        currentEvent.startDate = parseICSDateStringToISO(propValue);
        if (propHeader.includes('VALUE=DATE') || propValue.length === 8) {
          currentEvent.allDay = true;
        }
        break;
      case 'DTEND':
        currentEvent.endDate = parseICSDateStringToISO(propValue);
        break;
      case 'CATEGORIES':
        // Keep or enrich category
        break;
      case 'ORGANIZER':
        currentEvent.organizer = propValue.replace(/^mailto:/i, '');
        break;
    }
  }

  return events;
}

function parseICSDateStringToISO(dateStr: string): string {
  // e.g. 20260915T093000Z or 20260915 or 20260915T093000
  const clean = dateStr.replace(/[^0-9T]/g, '');
  if (clean.length === 8) {
    const y = clean.substring(0, 4);
    const m = clean.substring(4, 6);
    const d = clean.substring(6, 8);
    return `${y}-${m}-${d}`;
  }
  if (clean.length >= 15) {
    const y = clean.substring(0, 4);
    const m = clean.substring(4, 6);
    const d = clean.substring(6, 8);
    const h = clean.substring(9, 11);
    const min = clean.substring(11, 13);
    const s = clean.substring(13, 15);
    return `${y}-${m}-${d}T${h}:${min}:${s}Z`;
  }
  return new Date().toISOString().split('T')[0];
}

/**
 * Built-in mock external ICS feed templates for demonstration & instant sync
 */
export const SAMPLE_EXTERNAL_FEEDS: Array<{
  name: string;
  url: string;
  description: string;
  sampleIcs: string;
}> = [
  {
    name: 'BSI External Certification Body Schedule Feed',
    url: 'https://cert-portal.bsigroup.com/feeds/apex-audit-2026.ics',
    description: 'Accredited Certification Body official Stage 1 document review & Stage 2 on-site audit schedule.',
    sampleIcs: `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//BSI Group//Auditing Feeds//EN
X-WR-CALNAME:BSI ISO 27001 Certification Schedule
BEGIN:VEVENT
UID:bsi-stage1-prep-2026
DTSTART:20260910T090000Z
DTEND:20260910T120000Z
SUMMARY:ISO 27001 Stage 1 Documentation Readiness Walkthrough (BSI Lead Auditor)
DESCRIPTION:Pre-assessment review of ISMS Scope Statement, Statement of Applicability (SoA baseline), and Risk Treatment Plan.
LOCATION:Virtual Webex / BSI Portal Room 402
URL:https://meet.bsigroup.com/stage1-apex-fintech
CATEGORIES:AUDIT_SESSION
END:VEVENT
BEGIN:VEVENT
UID:bsi-stage2-sampling-2026
DTSTART:20261014T083000Z
DTEND:20261016T170000Z
SUMMARY:ISO/IEC 27001:2022 Stage 2 Formal Certification Audit (On-Site & Cloud)
DESCRIPTION:Formal 3-day on-site sampling across Annex A controls, AWS infrastructure, HR onboarding, and executive management interview.
LOCATION:Enterprise HQ (Level 18 Main Boardroom) & Cloud Architecture
URL:https://meet.audit-certifier.com/stage2-formal
CATEGORIES:AUDIT_SESSION
END:VEVENT
END:VCALENDAR`
  },
  {
    name: 'Corporate IT & DevOps Freeze Calendar',
    url: 'https://calendar.internal.enterprise/it-ops/change-management.ics',
    description: 'DevOps change freeze windows, quarterly penetration testing, and failover disaster recovery tests.',
    sampleIcs: `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Enterprise DevOps//Change Management Feed//EN
X-WR-CALNAME:DevOps & Infrastructure Schedule
BEGIN:VEVENT
UID:devops-dr-failover-2026
DTSTART:20260918T140000Z
DTEND:20260918T180000Z
SUMMARY:Semi-Annual AWS Multi-Region Disaster Recovery & Database Failover Test
DESCRIPTION:Live simulation of primary us-east-1 database disruption and automated failover to eu-central-1 in accordance with Clause A.8.14.
LOCATION:AWS Control Tower & Incident War Room (Slack #dr-drill-2026)
URL:https://meet.enterprise.internal/dr-failover
CATEGORIES:AUDIT_SESSION
END:VEVENT
BEGIN:VEVENT
UID:devops-pentest-retest-2026
DTSTART:20260925T100000Z
DTEND:20260925T160000Z
SUMMARY:Penetration Testing Attestation & Exploit Verification Review
DESCRIPTION:External security consultancy (Bishop Fox / Mandiant) re-test of public API gateways and mobile authentication endpoints.
LOCATION:Virtual Teams Room
CATEGORIES:EVIDENCE_DEADLINE
END:VEVENT
END:VCALENDAR`
  }
];
