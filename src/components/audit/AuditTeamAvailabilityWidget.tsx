import React, { useState, useMemo } from 'react';
import { useGRC } from '../../context/GRCContext';
import {
  Users,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Search,
  Download,
  Plus,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX,
  Layers,
  Award,
  BarChart2,
  TrendingUp,
  AlertOctagon,
  RefreshCw,
  Info,
  X,
  Check,
  Briefcase,
  BookOpen,
  CalendarDays,
  SlidersHorizontal,
  Flame,
  Activity,
  HeartPulse
} from 'lucide-react';

export interface AuditorMember {
  id: string;
  name: string;
  role: string;
  avatarInitials: string;
  department: string;
  certifications: string[];
  weeklyCapacityHours: number; // e.g., 40
  specialties: string[];
  experienceYears: number;
  email: string;
  color: string;
}

export interface ScheduledAuditSlot {
  id: string;
  auditorId: string;
  auditTitle: string;
  auditCode: string;
  dateStr: string; // YYYY-MM-DD
  hours: number;
  category: 'FIELDWORK' | 'DOCUMENT_REVIEW' | 'INTERVIEW' | 'REPORTING' | 'MEETING' | 'OUT_OF_OFFICE' | 'TRAINING';
  linkedClause?: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  location?: string;
  status: 'Confirmed' | 'Tentative' | 'Completed';
}

export interface SchedulingGap {
  id: string;
  dateStr: string;
  title: string;
  auditCode: string;
  requiredSpecialty: string;
  estimatedHours: number;
  priority: 'Critical' | 'High' | 'Medium';
  urgencyReason: string;
  linkedClause: string;
  suggestedAuditorId?: string;
}

// Default team members
export const INITIAL_AUDITOR_TEAM: AuditorMember[] = [
  {
    id: 'aud_1',
    name: 'Elena Rostova',
    role: 'Lead ISMS & Governance Auditor',
    avatarInitials: 'ER',
    department: 'Internal Audit & Risk',
    certifications: ['ISO 27001 Lead Auditor', 'CISA', 'CRISC'],
    weeklyCapacityHours: 40,
    specialties: ['Clauses 4-10 Governance', 'Risk Management', 'Executive Review'],
    experienceYears: 11,
    email: 'elena.rostova@apexgrc.internal',
    color: 'emerald'
  },
  {
    id: 'aud_2',
    name: 'David Chen',
    role: 'Senior Cloud & Technical Auditor',
    avatarInitials: 'DC',
    department: 'Technical Assurance',
    certifications: ['CISSP', 'AWS Certified Security', 'CCSP'],
    weeklyCapacityHours: 40,
    specialties: ['Annex A A.8 Cloud', 'KMS & Cryptography', 'DevSecOps & CI/CD'],
    experienceYears: 8,
    email: 'david.chen@apexgrc.internal',
    color: 'sky'
  },
  {
    id: 'aud_3',
    name: 'Sarah Jenkins',
    role: 'Compliance & Privacy Auditor',
    avatarInitials: 'SJ',
    department: 'Legal & Privacy Compliance',
    certifications: ['CIPP/E', 'CISM', 'CIPM'],
    weeklyCapacityHours: 36,
    specialties: ['Annex A A.5 / A.6 HR & Supplier', 'GDPR / PDPA', 'Third-Party Risk'],
    experienceYears: 7,
    email: 'sarah.jenkins@apexgrc.internal',
    color: 'violet'
  },
  {
    id: 'aud_4',
    name: 'Michael Torres',
    role: 'Infrastructure & Threat Auditor',
    avatarInitials: 'MT',
    department: 'Cyber Operations & Assurance',
    certifications: ['OSCP', 'CEH', 'CISA'],
    weeklyCapacityHours: 40,
    specialties: ['Annex A A.8.20 Network', 'Vulnerability & VA/PT', 'Physical Security'],
    experienceYears: 9,
    email: 'michael.torres@apexgrc.internal',
    color: 'amber'
  },
  {
    id: 'aud_5',
    name: 'Aisha Patel',
    role: 'Operational Resiliency Auditor',
    avatarInitials: 'AP',
    department: 'Business Continuity',
    certifications: ['CBCP', 'ISO 22301 Lead Implementer', 'MAS TRM Assessor'],
    weeklyCapacityHours: 32,
    specialties: ['Annex A A.5.29 BCP / DR', 'Incident Management (MAS TRM)', 'RTO/RPO Validation'],
    experienceYears: 6,
    email: 'aisha.patel@apexgrc.internal',
    color: 'rose'
  },
  {
    id: 'aud_6',
    name: 'Marcus Brody',
    role: 'Associate Auditor & Sampling Analyst',
    avatarInitials: 'MB',
    department: 'Internal Audit',
    certifications: ['CISA Candidate', 'Security+'],
    weeklyCapacityHours: 40,
    specialties: ['Evidence Verification', 'Access Control Sampling', 'Audit Working Papers'],
    experienceYears: 3,
    email: 'marcus.brody@apexgrc.internal',
    color: 'teal'
  }
];

// 2-Week working window in September 2026 (Mon Sep 07 - Fri Sep 18, 2026)
export const CALENDAR_DAYS_SAMPLE: { dateStr: string; dayLabel: string; dayNumber: string; isWeekend?: boolean; isMilestone?: boolean; milestoneTitle?: string }[] = [
  { dateStr: '2026-09-07', dayLabel: 'Mon', dayNumber: '07' },
  { dateStr: '2026-09-08', dayLabel: 'Tue', dayNumber: '08', isMilestone: true, milestoneTitle: 'Opening Conference' },
  { dateStr: '2026-09-09', dayLabel: 'Wed', dayNumber: '09' },
  { dateStr: '2026-09-10', dayLabel: 'Thu', dayNumber: '10' },
  { dateStr: '2026-09-11', dayLabel: 'Fri', dayNumber: '11', isMilestone: true, milestoneTitle: 'Week 1 Wrap-up' },
  { dateStr: '2026-09-14', dayLabel: 'Mon', dayNumber: '14' },
  { dateStr: '2026-09-15', dayLabel: 'Tue', dayNumber: '15' },
  { dateStr: '2026-09-16', dayLabel: 'Wed', dayNumber: '16', isMilestone: true, milestoneTitle: 'MAS TRM 1-Hr SLA Drill' },
  { dateStr: '2026-09-17', dayLabel: 'Thu', dayNumber: '17' },
  { dateStr: '2026-09-18', dayLabel: 'Fri', dayNumber: '18', isMilestone: true, milestoneTitle: 'Final Interim Review' }
];

export const INITIAL_AUDIT_SLOTS: ScheduledAuditSlot[] = [
  // Elena Rostova
  { id: 's1', auditorId: 'aud_1', auditTitle: 'Lead Auditor Opening Conference & Scope Verification', auditCode: 'IA-2026-01', dateStr: '2026-09-08', hours: 4, category: 'MEETING', linkedClause: 'Clause 9.2 / 5.1', priority: 'Critical', status: 'Confirmed' },
  { id: 's2', auditorId: 'aud_1', auditTitle: 'Clause 4 Context & Clause 5 Leadership Top Management Interviews', auditCode: 'IA-2026-01', dateStr: '2026-09-08', hours: 4, category: 'INTERVIEW', linkedClause: 'Clause 4 & 5', priority: 'High', status: 'Confirmed' },
  { id: 's3', auditorId: 'aud_1', auditTitle: 'Risk Assessment 5x5 Matrix & SoA Justification Audit', auditCode: 'IA-2026-01', dateStr: '2026-09-09', hours: 6, category: 'FIELDWORK', linkedClause: 'Clause 6.1.2 / 6.1.3', priority: 'High', status: 'Confirmed' },
  { id: 's4', auditorId: 'aud_1', auditTitle: 'Management Review Meeting Minute Validation', auditCode: 'IA-2026-01', dateStr: '2026-09-10', hours: 5, category: 'DOCUMENT_REVIEW', linkedClause: 'Clause 9.3', priority: 'Medium', status: 'Confirmed' },
  { id: 's5', auditorId: 'aud_1', auditTitle: 'Week 1 Executive Debriefing', auditCode: 'IA-2026-01', dateStr: '2026-09-11', hours: 3, category: 'MEETING', linkedClause: 'Clause 9.2', priority: 'High', status: 'Confirmed' },
  { id: 's6', auditorId: 'aud_1', auditTitle: 'Executive CAPA Action Review & Verification Sign-off', auditCode: 'IA-2026-01', dateStr: '2026-09-15', hours: 7, category: 'FIELDWORK', linkedClause: 'Clause 10.1', priority: 'Critical', status: 'Confirmed' },
  { id: 's7', auditorId: 'aud_1', auditTitle: 'Final Interim Audit Working Paper Review', auditCode: 'IA-2026-01', dateStr: '2026-09-18', hours: 6, category: 'REPORTING', linkedClause: 'Clause 9.2', priority: 'High', status: 'Confirmed' },

  // David Chen (Heavy Tech Load / Overbooked on Sep 9 & Sep 16)
  { id: 's8', auditorId: 'aud_2', auditTitle: 'AWS Multi-Account IAM & RBAC Privileged Access Fieldwork', auditCode: 'IA-2026-02', dateStr: '2026-09-07', hours: 7, category: 'FIELDWORK', linkedClause: 'Annex A A.5.15 / A.8.2', priority: 'High', status: 'Confirmed' },
  { id: 's9', auditorId: 'aud_2', auditTitle: 'AWS KMS Key Rotation & HSM FIPS 140-2 Verification', auditCode: 'IA-2026-02', dateStr: '2026-09-08', hours: 6, category: 'FIELDWORK', linkedClause: 'Annex A A.8.24', priority: 'High', status: 'Confirmed' },
  { id: 's10', auditorId: 'aud_2', auditTitle: 'CI/CD DevSecOps Quality Gate & Snyk/SonarQube Pipeline Audit', auditCode: 'IA-2026-02', dateStr: '2026-09-09', hours: 6, category: 'FIELDWORK', linkedClause: 'Annex A A.8.25 / A.8.28', priority: 'Critical', status: 'Confirmed' },
  { id: 's11', auditorId: 'aud_2', auditTitle: 'Emergency Production Access Log & Terraform Drift Audit', auditCode: 'IA-2026-02', dateStr: '2026-09-09', hours: 3.5, category: 'FIELDWORK', linkedClause: 'Annex A A.8.2', priority: 'Critical', status: 'Confirmed' }, // Overbooked! 9.5h
  { id: 's12', auditorId: 'aud_2', auditTitle: 'Cloud Architecture Threat Model Verification', auditCode: 'IA-2026-02', dateStr: '2026-09-10', hours: 5, category: 'DOCUMENT_REVIEW', linkedClause: 'Annex A A.8.27', priority: 'Medium', status: 'Confirmed' },
  { id: 's13', auditorId: 'aud_2', auditTitle: 'Stage 1 Tech Evidence Bundle Compilation', auditCode: 'IA-2026-02', dateStr: '2026-09-11', hours: 4, category: 'REPORTING', linkedClause: 'Clause 9.2', priority: 'Medium', status: 'Confirmed' },
  { id: 's14', auditorId: 'aud_2', auditTitle: 'Database Field-Level Encryption & TLS 1.3 Cipher Suite Tests', auditCode: 'IA-2026-02', dateStr: '2026-09-14', hours: 6, category: 'FIELDWORK', linkedClause: 'Annex A A.8.24', priority: 'High', status: 'Confirmed' },
  { id: 's15', auditorId: 'aud_2', auditTitle: 'MAS TRM Cryptographic Standards Compliance Deep-Dive', auditCode: 'IA-2026-02', dateStr: '2026-09-15', hours: 7, category: 'FIELDWORK', linkedClause: 'MAS TRM 9.1', priority: 'Critical', status: 'Confirmed' },
  { id: 's16', auditorId: 'aud_2', auditTitle: 'Container Security & Kubernetes RBAC Sampling', auditCode: 'IA-2026-02', dateStr: '2026-09-16', hours: 5.5, category: 'FIELDWORK', linkedClause: 'Annex A A.8.31', priority: 'High', status: 'Confirmed' },
  { id: 's17', auditorId: 'aud_2', auditTitle: 'Cloud Native SIEM Detection Rule Verification', auditCode: 'IA-2026-02', dateStr: '2026-09-16', hours: 4, category: 'FIELDWORK', linkedClause: 'Annex A A.8.16', priority: 'Critical', status: 'Confirmed' }, // Overbooked! 9.5h

  // Sarah Jenkins (Vendor & HR Security)
  { id: 's18', auditorId: 'aud_3', auditTitle: 'Tier 1 Cloud Vendor SOC 2 Type II Report Analysis', auditCode: 'IA-2026-03', dateStr: '2026-09-07', hours: 5, category: 'DOCUMENT_REVIEW', linkedClause: 'Annex A A.5.19 / A.5.23', priority: 'High', status: 'Confirmed' },
  { id: 's19', auditorId: 'aud_3', auditTitle: 'Vendor Contractual Security Schedule & Right-to-Audit Review', auditCode: 'IA-2026-03', dateStr: '2026-09-08', hours: 4, category: 'DOCUMENT_REVIEW', linkedClause: 'Annex A A.5.20', priority: 'Medium', status: 'Confirmed' },
  { id: 's20', auditorId: 'aud_3', auditTitle: 'HR Pre-Employment Screening & Background Verification Sampling', auditCode: 'IA-2026-03', dateStr: '2026-09-09', hours: 5, category: 'FIELDWORK', linkedClause: 'Annex A A.6.1', priority: 'High', status: 'Confirmed' },
  { id: 's21', auditorId: 'aud_3', auditTitle: 'Cybersecurity Awareness Training LMS Roster Completion Audit', auditCode: 'IA-2026-03', dateStr: '2026-09-10', hours: 4, category: 'FIELDWORK', linkedClause: 'Annex A A.6.3', priority: 'Medium', status: 'Confirmed' },
  { id: 's22', auditorId: 'aud_3', auditTitle: 'Out-of-Office: Annual Privacy Law Forum Singapore', auditCode: 'OOO-01', dateStr: '2026-09-14', hours: 8, category: 'OUT_OF_OFFICE', priority: 'Low', status: 'Confirmed' },
  { id: 's23', auditorId: 'aud_3', auditTitle: 'Out-of-Office: Annual Privacy Law Forum Singapore', auditCode: 'OOO-01', dateStr: '2026-09-15', hours: 8, category: 'OUT_OF_OFFICE', priority: 'Low', status: 'Confirmed' },

  // Michael Torres (Network & Threat Vuln)
  { id: 's24', auditorId: 'aud_4', auditTitle: 'VPC Architecture & Security Group Rule Review', auditCode: 'IA-2026-04', dateStr: '2026-09-08', hours: 6, category: 'FIELDWORK', linkedClause: 'Annex A A.8.20 / A.8.21', priority: 'High', status: 'Confirmed' },
  { id: 's25', auditorId: 'aud_4', auditTitle: 'Annual Penetration Testing & Vulnerability Assessment Report Verification', auditCode: 'IA-2026-04', dateStr: '2026-09-09', hours: 6, category: 'DOCUMENT_REVIEW', linkedClause: 'Annex A A.8.8 / MAS 17.1', priority: 'Critical', status: 'Confirmed' },
  { id: 's26', auditorId: 'aud_4', auditTitle: 'WAF & DDoS Mitigation Rule Base Inspection', auditCode: 'IA-2026-04', dateStr: '2026-09-10', hours: 4, category: 'FIELDWORK', linkedClause: 'Annex A A.8.20', priority: 'Medium', status: 'Confirmed' },
  { id: 's27', auditorId: 'aud_4', auditTitle: 'Physical Security & Server Room Biometric Access Log Sampling', auditCode: 'IA-2026-04', dateStr: '2026-09-16', hours: 5, category: 'FIELDWORK', linkedClause: 'Annex A A.7.1 - A.7.4', priority: 'Medium', status: 'Confirmed' },
  { id: 's28', auditorId: 'aud_4', auditTitle: 'Patch Management SLA Compliance (48-Hr Critical CVEs)', auditCode: 'IA-2026-04', dateStr: '2026-09-17', hours: 6, category: 'FIELDWORK', linkedClause: 'Annex A A.8.8', priority: 'Critical', status: 'Confirmed' },

  // Aisha Patel (BCP / DR / Incident Resiliency)
  { id: 's29', auditorId: 'aud_5', auditTitle: 'Disaster Recovery RTO (<=4h) & RPO (<=1h) Evidence Review', auditCode: 'IA-2026-05', dateStr: '2026-09-07', hours: 4, category: 'DOCUMENT_REVIEW', linkedClause: 'Annex A A.5.29 / MAS 15.1', priority: 'Critical', status: 'Confirmed' },
  { id: 's30', auditorId: 'aud_5', auditTitle: 'Live Multi-AZ Failover Drill Witnessing & Timestamp Audit', auditCode: 'IA-2026-05', dateStr: '2026-09-11', hours: 6, category: 'FIELDWORK', linkedClause: 'Annex A A.5.30', priority: 'Critical', status: 'Confirmed' },
  { id: 's31', auditorId: 'aud_5', auditTitle: 'MAS 1-Hour Incident Escalation Protocol Tabletop Drill Audit', auditCode: 'IA-2026-05', dateStr: '2026-09-16', hours: 7, category: 'FIELDWORK', linkedClause: 'Annex A A.5.24 / MAS 14.1', priority: 'Critical', status: 'Confirmed' },

  // Marcus Brody (Sampling Analyst / Free Capacity)
  { id: 's32', auditorId: 'aud_6', auditTitle: 'Employee Onboarding Checklists Random Sampling (N=30)', auditCode: 'IA-2026-03', dateStr: '2026-09-07', hours: 4, category: 'FIELDWORK', linkedClause: 'Annex A A.6.1', priority: 'Medium', status: 'Confirmed' },
  { id: 's33', auditorId: 'aud_6', auditTitle: 'Laptop Full-Disk BitLocker & Antivirus InTune Compliance Verification', auditCode: 'IA-2026-02', dateStr: '2026-09-08', hours: 4, category: 'FIELDWORK', linkedClause: 'Annex A A.8.1 / A.8.7', priority: 'Medium', status: 'Confirmed' },
  { id: 's34', auditorId: 'aud_6', auditTitle: 'Disposal of Media & Hard Drive Certificate of Destruction Logs', auditCode: 'IA-2026-04', dateStr: '2026-09-10', hours: 3, category: 'FIELDWORK', linkedClause: 'Annex A A.7.14', priority: 'Low', status: 'Confirmed' },
  { id: 's35', auditorId: 'aud_6', auditTitle: 'Working Papers Formatting & Evidence Attachment Indexing', auditCode: 'IA-2026-01', dateStr: '2026-09-17', hours: 4, category: 'REPORTING', linkedClause: 'Clause 9.2', priority: 'Medium', status: 'Confirmed' }
];

export const INITIAL_SCHEDULING_GAPS: SchedulingGap[] = [
  {
    id: 'gap_1',
    dateStr: '2026-09-14',
    title: 'Material Outsourcing & Cloud Multi-Tenancy Risk Assessment Audit',
    auditCode: 'IA-2026-03',
    requiredSpecialty: 'Vendor & Cloud Risk (Annex A A.5.19 / MAS TRM 7.1)',
    estimatedHours: 6,
    priority: 'Critical',
    urgencyReason: 'Auditor Sarah Jenkins is out of office; audit must be executed prior to Stage 1 filing.',
    linkedClause: 'Annex A A.5.19 & MAS TRM 7.1',
    suggestedAuditorId: 'aud_6'
  },
  {
    id: 'gap_2',
    dateStr: '2026-09-15',
    title: 'Ad-Hoc Cryptographic Key Vault Secret Sharing & Multi-Signature Audit',
    auditCode: 'IA-2026-02',
    requiredSpecialty: 'KMS & Cryptography (Annex A A.8.24)',
    estimatedHours: 4,
    priority: 'High',
    urgencyReason: 'David Chen is near maximum capacity (7h booked); needs assistance to avoid bottleneck.',
    linkedClause: 'Annex A A.8.24',
    suggestedAuditorId: 'aud_4'
  },
  {
    id: 'gap_3',
    dateStr: '2026-09-17',
    title: 'Data Center Physical Perimeter & Environmental Sensor Calibration Review',
    auditCode: 'IA-2026-04',
    requiredSpecialty: 'Physical Security (Annex A A.7.1 - A.7.4)',
    estimatedHours: 4,
    priority: 'Medium',
    urgencyReason: 'Scheduled physical inspection has no assigned auditor for on-site facility log verification.',
    linkedClause: 'Annex A A.7.2',
    suggestedAuditorId: 'aud_6'
  },
  {
    id: 'gap_4',
    dateStr: '2026-09-18',
    title: 'Pre-Certification Stage 1 Document Completeness Cross-Check',
    auditCode: 'IA-2026-01',
    requiredSpecialty: 'Lead Auditor Verification (Clause 9.2)',
    estimatedHours: 5,
    priority: 'Critical',
    urgencyReason: 'Mandatory final pre-audit gate requires a certified Lead Auditor independent review.',
    linkedClause: 'ISO 27001 Clause 9.2',
    suggestedAuditorId: 'aud_1'
  }
];

export const AuditTeamAvailabilityWidget: React.FC = () => {
  const { currentTenant } = useGRC();

  // Auditors state
  const [auditors, setAuditors] = useState<AuditorMember[]>(INITIAL_AUDITOR_TEAM);
  const [slots, setSlots] = useState<ScheduledAuditSlot[]>(INITIAL_AUDIT_SLOTS);
  const [gaps, setGaps] = useState<SchedulingGap[]>(INITIAL_SCHEDULING_GAPS);

  // Filters
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('ALL');
  const [intensityFilter, setIntensityFilter] = useState<'ALL' | 'OVERLOAD' | 'OPTIMAL' | 'AVAILABLE' | 'GAPS'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCell, setSelectedCell] = useState<{ auditor: AuditorMember; dateStr: string; slots: ScheduledAuditSlot[]; dayHours: number } | null>(null);
  const [selectedGap, setSelectedGap] = useState<SchedulingGap | null>(null);

  // Modals
  const [isAddSlotOpen, setIsAddSlotOpen] = useState(false);
  const [isAutoRebalanceModalOpen, setIsAutoRebalanceModalOpen] = useState(false);
  const [rebalanceFeedback, setRebalanceFeedback] = useState<string | null>(null);

  // New Slot Form State
  const [newSlotAuditorId, setNewSlotAuditorId] = useState<string>('aud_1');
  const [newSlotTitle, setNewSlotTitle] = useState<string>('');
  const [newSlotAuditCode, setNewSlotAuditCode] = useState<string>('IA-2026-01');
  const [newSlotDate, setNewSlotDate] = useState<string>('2026-09-14');
  const [newSlotHours, setNewSlotHours] = useState<number>(4);
  const [newSlotCategory, setNewSlotCategory] = useState<ScheduledAuditSlot['category']>('FIELDWORK');
  const [newSlotPriority, setNewSlotPriority] = useState<ScheduledAuditSlot['priority']>('High');
  const [newSlotClause, setNewSlotClause] = useState<string>('Annex A A.8.2');

  // Matrix calculations: Map of `auditorId_dateStr` -> hours
  const matrixData = useMemo(() => {
    const map = new Map<string, { hours: number; slots: ScheduledAuditSlot[] }>();
    
    auditors.forEach(aud => {
      CALENDAR_DAYS_SAMPLE.forEach(day => {
        const key = `${aud.id}_${day.dateStr}`;
        map.set(key, { hours: 0, slots: [] });
      });
    });

    slots.forEach(slot => {
      const key = `${slot.auditorId}_${slot.dateStr}`;
      const existing = map.get(key) || { hours: 0, slots: [] };
      existing.hours += slot.hours;
      existing.slots.push(slot);
      map.set(key, existing);
    });

    return map;
  }, [auditors, slots]);

  // Auditor totals & utilization over the 10 business days window (80 capacity hours baseline)
  const auditorStats = useMemo(() => {
    return auditors.map(aud => {
      let totalBookedHours = 0;
      let overbookedDays = 0;
      let oooHours = 0;

      CALENDAR_DAYS_SAMPLE.forEach(day => {
        const key = `${aud.id}_${day.dateStr}`;
        const data = matrixData.get(key);
        if (data) {
          totalBookedHours += data.hours;
          if (data.hours > 8) overbookedDays++;
          data.slots.forEach(s => {
            if (s.category === 'OUT_OF_OFFICE') oooHours += s.hours;
          });
        }
      });

      // 2-week window capacity = weeklyCapacityHours * 2
      const totalCapacity = aud.weeklyCapacityHours * 2;
      const utilizationRate = Math.round((totalBookedHours / totalCapacity) * 100);
      const isOverloaded = utilizationRate > 95 || overbookedDays > 0;
      const isUnderutilized = utilizationRate < 50;

      return {
        auditor: aud,
        totalBookedHours,
        totalCapacity,
        utilizationRate,
        overbookedDays,
        oooHours,
        isOverloaded,
        isUnderutilized
      };
    });
  }, [auditors, matrixData]);

  // Overall Team High-Level Analytics
  const teamMetrics = useMemo(() => {
    const totalCapacity = auditorStats.reduce((acc, a) => acc + a.totalCapacity, 0);
    const totalBooked = auditorStats.reduce((acc, a) => acc + a.totalBookedHours, 0);
    const avgUtilization = Math.round((totalBooked / totalCapacity) * 100);
    const totalOverbookedDays = auditorStats.reduce((acc, a) => acc + a.overbookedDays, 0);
    const highBurnoutAuditors = auditorStats.filter(a => a.isOverloaded).length;

    return {
      totalCapacity,
      totalBooked,
      avgUtilization,
      totalOverbookedDays,
      highBurnoutAuditors,
      openGapsCount: gaps.length
    };
  }, [auditorStats, gaps]);

  // Filtered auditors
  const filteredAuditors = useMemo(() => {
    return auditors.filter(aud => {
      if (specialtyFilter !== 'ALL') {
        const match = aud.specialties.some(s => s.toLowerCase().includes(specialtyFilter.toLowerCase())) ||
                      aud.role.toLowerCase().includes(specialtyFilter.toLowerCase());
        if (!match) return false;
      }
      if (intensityFilter !== 'ALL') {
        const stats = auditorStats.find(s => s.auditor.id === aud.id);
        if (intensityFilter === 'OVERLOAD' && !stats?.isOverloaded) return false;
        if (intensityFilter === 'AVAILABLE' && (stats?.utilizationRate || 0) > 75) return false;
        if (intensityFilter === 'OPTIMAL' && ((stats?.utilizationRate || 0) < 60 || (stats?.utilizationRate || 0) > 90)) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match = aud.name.toLowerCase().includes(q) ||
                      aud.role.toLowerCase().includes(q) ||
                      aud.certifications.some(c => c.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [auditors, specialtyFilter, intensityFilter, searchQuery, auditorStats]);

  // Quick gap assignment handler
  const handleAssignGap = (gap: SchedulingGap, targetAuditorId: string) => {
    const targetAud = auditors.find(a => a.id === targetAuditorId);
    if (!targetAud) return;

    const newSlot: ScheduledAuditSlot = {
      id: `slot_gap_${Date.now()}`,
      auditorId: targetAuditorId,
      auditTitle: gap.title,
      auditCode: gap.auditCode,
      dateStr: gap.dateStr,
      hours: gap.estimatedHours,
      category: 'FIELDWORK',
      linkedClause: gap.linkedClause,
      priority: gap.priority,
      status: 'Confirmed'
    };

    setSlots(prev => [...prev, newSlot]);
    setGaps(prev => prev.filter(g => g.id !== gap.id));
    setSelectedGap(null);
    setRebalanceFeedback(`Assigned "${gap.title}" to ${targetAud.name} for ${gap.dateStr} (${gap.estimatedHours}h).`);
    setTimeout(() => setRebalanceFeedback(null), 4000);
  };

  // Auto-Rebalance Routine
  const handleExecuteAutoRebalance = () => {
    // 1. Shift David Chen's overbooked Terraform drift slot on Sep 09 (3.5h) to Marcus Brody
    // 2. Shift David Chen's Cloud Native SIEM rule audit on Sep 16 (4h) to Michael Torres
    // 3. Assign Gap 1 (Outsourcing Risk) to Marcus Brody
    let updatedSlots = [...slots];

    // Find and shift slot s11 to Marcus Brody (aud_6)
    updatedSlots = updatedSlots.map(s => {
      if (s.id === 's11') {
        return { ...s, auditorId: 'aud_6', auditTitle: `${s.auditTitle} (Assisted by Associate Auditor)` };
      }
      if (s.id === 's17') {
        return { ...s, auditorId: 'aud_4', auditTitle: `${s.auditTitle} (Transferred from Cloud Team)` };
      }
      return s;
    });

    // Also auto-assign open gaps where a suggested auditor is available
    const resolvedGaps: string[] = [];
    gaps.forEach(g => {
      if (g.suggestedAuditorId) {
        updatedSlots.push({
          id: `slot_auto_${g.id}`,
          auditorId: g.suggestedAuditorId,
          auditTitle: g.title,
          auditCode: g.auditCode,
          dateStr: g.dateStr,
          hours: g.estimatedHours,
          category: 'FIELDWORK',
          linkedClause: g.linkedClause,
          priority: g.priority,
          status: 'Confirmed'
        });
        resolvedGaps.push(g.id);
      }
    });

    setSlots(updatedSlots);
    setGaps(prev => prev.filter(g => !resolvedGaps.includes(g.id)));
    setIsAutoRebalanceModalOpen(false);
    setRebalanceFeedback('Audit workload successfully rebalanced: 2 overbooked bottlenecks resolved and open scheduling gaps allocated to certified peers.');
    setTimeout(() => setRebalanceFeedback(null), 5000);
  };

  // Add new audit slot
  const handleCreateSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlotTitle.trim()) return;

    const newSlot: ScheduledAuditSlot = {
      id: `slot_custom_${Date.now()}`,
      auditorId: newSlotAuditorId,
      auditTitle: newSlotTitle,
      auditCode: newSlotAuditCode,
      dateStr: newSlotDate,
      hours: Number(newSlotHours),
      category: newSlotCategory,
      linkedClause: newSlotClause,
      priority: newSlotPriority,
      status: 'Confirmed'
    };

    setSlots(prev => [...prev, newSlot]);
    setIsAddSlotOpen(false);
    setNewSlotTitle('');
    setRebalanceFeedback(`Scheduled ${newSlotHours}h audit session for ${auditors.find(a => a.id === newSlotAuditorId)?.name}.`);
    setTimeout(() => setRebalanceFeedback(null), 3000);
  };

  // Heatmap Cell Color Resolver
  const getCellIntensityStyle = (hours: number, isOOO: boolean) => {
    if (isOOO) {
      return {
        bg: 'bg-purple-950/60 border-purple-800/80 text-purple-300',
        badge: 'bg-purple-900 text-purple-200 border-purple-700',
        label: 'Out of Office / Leave'
      };
    }
    if (hours === 0) {
      return {
        bg: 'bg-slate-950/40 border-slate-800/50 hover:border-slate-700 text-slate-500',
        badge: 'bg-slate-900 text-slate-400 border-slate-800',
        label: 'Open Capacity (0h)'
      };
    }
    if (hours <= 4) {
      return {
        bg: 'bg-emerald-950/50 border-emerald-800/60 hover:border-emerald-600 text-emerald-300',
        badge: 'bg-emerald-950 text-emerald-300 border-emerald-700/80',
        label: `Light Load (${hours}h)`
      };
    }
    if (hours <= 7.5) {
      return {
        bg: 'bg-sky-950/60 border-sky-800/70 hover:border-sky-500 text-sky-200',
        badge: 'bg-sky-950 text-sky-200 border-sky-700/80',
        label: `Optimal Load (${hours}h)`
      };
    }
    if (hours <= 8.5) {
      return {
        bg: 'bg-amber-950/70 border-amber-800/80 hover:border-amber-500 text-amber-200',
        badge: 'bg-amber-950 text-amber-200 border-amber-700/90',
        label: `Full Capacity (${hours}h)`
      };
    }
    // Overbooked > 8.5 hours
    return {
      bg: 'bg-rose-950/80 border-rose-600 hover:border-rose-400 text-rose-200 shadow-sm animate-pulse-subtle',
      badge: 'bg-rose-900 text-rose-100 border-rose-500 font-bold',
      label: `Overbooked / Conflict (${hours}h)`
    };
  };

  // CSV Export for Auditor Workload & Availability Schedule
  const handleExportWorkloadCSV = () => {
    const headers = [
      'Auditor ID',
      'Auditor Name',
      'Role & Title',
      'Certifications',
      'Weekly Capacity (Hrs)',
      'Total Booked (10-Day Window)',
      'Utilization Rate (%)',
      'Overbooked Days',
      'Out-of-Office (Hrs)',
      'Status'
    ];

    const rows = auditorStats.map(stat => [
      `"${stat.auditor.id}"`,
      `"${stat.auditor.name}"`,
      `"${stat.auditor.role}"`,
      `"${stat.auditor.certifications.join(', ')}"`,
      stat.auditor.weeklyCapacityHours,
      stat.totalBookedHours,
      `${stat.utilizationRate}%`,
      stat.overbookedDays,
      stat.oooHours,
      `"${stat.isOverloaded ? 'Overallocated' : stat.isUnderutilized ? 'Underutilized' : 'Optimal'}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Apex_Audit_Team_Availability_Workload_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback Notification */}
      {rebalanceFeedback && (
        <div className="p-3.5 bg-emerald-950/90 border border-emerald-600 rounded-xl text-xs text-emerald-200 flex items-center justify-between shadow-lg animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{rebalanceFeedback}</span>
          </div>
          <button onClick={() => setRebalanceFeedback(null)} className="text-emerald-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Widget Header & Team High-Level Dashboard */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/50 border border-slate-800 rounded-2xl p-6 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-sky-400" />
                Audit Team Availability & Workload Heatmap
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 flex items-center gap-1">
                <HeartPulse className="w-3 h-3 text-indigo-400" />
                Workload Balance & Burnout Prevention
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Sprint Window: Sep 07 - Sep 18, 2026
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              Auditor Allocation Matrix & Scheduling Gap Analysis
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Real-time capacity tracking across internal audit personnel. Identify critical control sampling bottlenecks, monitor individual burnout indices, and reallocate fieldwork to certified peers before certification surveillance.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              onClick={() => setIsAutoRebalanceModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              title="Intelligently rebalance overallocated auditors and fill open gaps"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Auto-Rebalance Workload</span>
            </button>
            <button
              onClick={() => setIsAddSlotOpen(true)}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 text-sky-400" />
              <span>Book Audit Slot</span>
            </button>
            <button
              onClick={handleExportWorkloadCSV}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs transition-all cursor-pointer"
              title="Export Availability CSV"
            >
              <Download className="w-4 h-4 text-emerald-400" />
            </button>
          </div>
        </div>

        {/* 4 Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800 text-xs">
          {/* Card 1: Team Utilization */}
          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] uppercase font-semibold">Active Team Utilization</span>
              <Activity className="w-3.5 h-3.5 text-sky-400" />
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-white">{teamMetrics.avgUtilization}%</span>
              <span className="text-[11px] text-slate-400">
                ({teamMetrics.totalBooked}h / {teamMetrics.totalCapacity}h)
              </span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  teamMetrics.avgUtilization > 85 ? 'bg-amber-400' : 'bg-sky-400'
                }`}
                style={{ width: `${Math.min(teamMetrics.avgUtilization, 100)}%` }}
              />
            </div>
          </div>

          {/* Card 2: Overbooked Alert */}
          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] uppercase font-semibold">Fatigue & Overload Risk</span>
              <Flame className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-rose-400">
                {teamMetrics.totalOverbookedDays} Days
              </span>
              <span className="text-[11px] text-slate-400">
                ({teamMetrics.highBurnoutAuditors} auditor at risk)
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              {teamMetrics.totalOverbookedDays > 0 ? 'Exceeding 8h daily capacity baseline' : 'Zero fatigue risks detected'}
            </p>
          </div>

          {/* Card 3: Scheduling Gaps */}
          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] uppercase font-semibold">Open Scheduling Gaps</span>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-amber-400">
                {teamMetrics.openGapsCount} Scopes
              </span>
              <span className="text-[11px] text-slate-400">Unassigned controls</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Action required to ensure 100% clause coverage
            </p>
          </div>

          {/* Card 4: Certified Lead Count */}
          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] uppercase font-semibold">Qualified Audit Pool</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-emerald-400">{auditors.length} Auditors</span>
              <span className="text-[11px] text-slate-400">6 Domains</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              ISO 27001 LA, CISSP, CISA, MAS TRM certified
            </p>
          </div>
        </div>
      </div>

      {/* Critical Scheduling Gaps Action Strip */}
      {gaps.length > 0 && (
        <div className="bg-slate-900 border border-amber-900/40 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-amber-950 text-amber-400 border border-amber-800">
                <AlertTriangle className="w-4 h-4" />
              </span>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Unassigned Audit Scope Gaps Detected ({gaps.length})
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">
              Select an unallocated audit below to auto-assign to an auditor with open capacity
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
            {gaps.map((gap) => {
              const suggestedAud = auditors.find(a => a.id === gap.suggestedAuditorId);
              return (
                <div
                  key={gap.id}
                  className="bg-slate-950 p-3 rounded-xl border border-slate-800 hover:border-amber-700/60 transition-all flex flex-col justify-between space-y-2.5 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 font-mono text-[10px] font-bold border border-amber-800/80">
                        {gap.auditCode}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono font-semibold">
                        {gap.dateStr} • {gap.estimatedHours}h
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white line-clamp-2 leading-snug">
                      {gap.title}
                    </h4>

                    <div className="text-[10px] text-slate-400">
                      Req: <span className="text-slate-300 font-semibold">{gap.requiredSpecialty}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-900 flex items-center justify-between gap-1.5">
                    <button
                      onClick={() => setSelectedGap(gap)}
                      className="text-[11px] text-slate-400 hover:text-sky-300 font-medium transition-colors"
                    >
                      Inspect
                    </button>
                    {suggestedAud && (
                      <button
                        onClick={() => handleAssignGap(gap, suggestedAud.id)}
                        className="px-2 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-[10px] flex items-center gap-1 transition-all shadow-sm cursor-pointer"
                        title={`Assign to ${suggestedAud.name}`}
                      >
                        <UserCheck className="w-3 h-3" />
                        <span>Assign {suggestedAud.avatarInitials}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter & Heatmap Legend Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 font-semibold uppercase text-[10px]">Filter Specialty:</span>
            <select
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-sky-500 text-xs cursor-pointer"
            >
              <option value="ALL">All Specialties ({auditors.length})</option>
              <option value="Governance">Governance & Leadership (ER)</option>
              <option value="Cloud">Cloud & Cryptography (DC)</option>
              <option value="Privacy">Privacy & Suppliers (SJ)</option>
              <option value="Threat">Network & Vulnerabilities (MT)</option>
              <option value="Resiliency">Resiliency & BCP (AP)</option>
              <option value="Sampling">Sampling & Working Papers (MB)</option>
            </select>

            <select
              value={intensityFilter}
              onChange={(e) => setIntensityFilter(e.target.value as any)}
              className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-sky-500 text-xs cursor-pointer"
            >
              <option value="ALL">All Workload Intensities</option>
              <option value="OVERLOAD">Overbooked Only (&gt;90% / &gt;8h/day)</option>
              <option value="OPTIMAL">Optimal Load (60% - 90%)</option>
              <option value="AVAILABLE">Available / High Capacity (&lt;75%)</option>
            </select>
          </div>

          {/* Search Bar */}
          <div className="relative w-full lg:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search auditor, certification..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 text-xs"
            />
          </div>
        </div>

        {/* Heatmap Color Scale Legend */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5 font-semibold text-slate-300">
            <SlidersHorizontal className="w-3.5 h-3.5 text-sky-400" />
            <span>Heatmap Capacity Scale:</span>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-slate-950 border border-slate-800" />
              <span>0h (Available / Open Gap)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-950/80 border border-emerald-700" />
              <span>1 - 4h (Light Load)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-sky-950/80 border border-sky-700" />
              <span>5 - 7.5h (Optimal)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-amber-950/80 border border-amber-700" />
              <span>8h (Full Day)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-rose-900 border border-rose-500" />
              <span className="text-rose-300 font-semibold">&gt; 8h (Overbooked Conflict)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-purple-900 border border-purple-700" />
              <span>Out of Office (OOO)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Heatmap Matrix Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-slate-950/90 border-b border-slate-800 text-[11px] text-slate-400 uppercase tracking-wider">
                <th className="p-3.5 pl-5 w-64 sticky left-0 bg-slate-950/95 z-10 border-r border-slate-800">
                  Auditor & Role
                </th>
                {CALENDAR_DAYS_SAMPLE.map((day) => (
                  <th
                    key={day.dateStr}
                    className={`p-2.5 text-center border-r border-slate-800/80 ${
                      day.isMilestone ? 'bg-sky-950/30' : ''
                    }`}
                  >
                    <div className="font-bold text-white text-xs">{day.dayNumber}</div>
                    <div className="text-[10px] text-slate-400 font-normal">{day.dayLabel}</div>
                    {day.isMilestone && (
                      <span className="mt-0.5 inline-block text-[9px] font-mono text-sky-400 px-1 py-0.2 bg-sky-950 rounded border border-sky-800 whitespace-nowrap">
                        {day.milestoneTitle}
                      </span>
                    )}
                  </th>
                ))}
                <th className="p-3.5 pr-5 text-right w-36">
                  10-Day Total & Util.
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/80 text-xs">
              {filteredAuditors.map((auditor) => {
                const stat = auditorStats.find(s => s.auditor.id === auditor.id);
                const totalBooked = stat?.totalBookedHours || 0;
                const utilRate = stat?.utilizationRate || 0;
                const isOverloaded = stat?.isOverloaded;

                return (
                  <tr key={auditor.id} className="hover:bg-slate-800/30 transition-colors">
                    {/* Auditor Profile Header (Sticky Column) */}
                    <td className="p-3.5 pl-5 sticky left-0 bg-slate-900 z-10 border-r border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 border ${
                          auditor.id === 'aud_1' ? 'bg-emerald-950 text-emerald-300 border-emerald-700' :
                          auditor.id === 'aud_2' ? 'bg-sky-950 text-sky-300 border-sky-700' :
                          auditor.id === 'aud_3' ? 'bg-violet-950 text-violet-300 border-violet-700' :
                          auditor.id === 'aud_4' ? 'bg-amber-950 text-amber-300 border-amber-700' :
                          auditor.id === 'aud_5' ? 'bg-rose-950 text-rose-300 border-rose-700' :
                          'bg-teal-950 text-teal-300 border-teal-700'
                        }`}>
                          {auditor.avatarInitials}
                        </div>

                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white truncate">{auditor.name}</span>
                            {isOverloaded && (
                              <span className="px-1 py-0.2 rounded bg-rose-950 text-rose-400 font-bold text-[9px] border border-rose-800" title="Overbooked Schedule">
                                Overload
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">{auditor.role}</div>
                          <div className="text-[10px] text-slate-500 font-mono truncate">
                            {auditor.certifications[0]} • {auditor.weeklyCapacityHours}h/wk
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 10 Daily Heatmap Cells */}
                    {CALENDAR_DAYS_SAMPLE.map((day) => {
                      const key = `${auditor.id}_${day.dateStr}`;
                      const cellData = matrixData.get(key) || { hours: 0, slots: [] };
                      const isOOO = cellData.slots.some(s => s.category === 'OUT_OF_OFFICE');
                      const style = getCellIntensityStyle(cellData.hours, isOOO);

                      return (
                        <td
                          key={day.dateStr}
                          onClick={() => setSelectedCell({ auditor, dateStr: day.dateStr, slots: cellData.slots, dayHours: cellData.hours })}
                          className="p-1.5 text-center border-r border-slate-800/80 align-middle cursor-pointer"
                        >
                          <div
                            className={`h-14 rounded-xl border p-1.5 flex flex-col justify-between items-center transition-all ${style.bg}`}
                            title={`Click to inspect ${auditor.name}'s schedule on ${day.dateStr}`}
                          >
                            <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono border ${style.badge}`}>
                              {isOOO ? 'OOO' : cellData.hours > 0 ? `${cellData.hours}h` : 'Free'}
                            </span>

                            {cellData.slots.length > 0 ? (
                              <div className="text-[10px] text-slate-300 font-medium truncate max-w-[70px] leading-tight text-center">
                                {cellData.slots[0].auditCode}
                                {cellData.slots.length > 1 && (
                                  <span className="text-[9px] text-sky-400 block">+{cellData.slots.length - 1} more</span>
                                )}
                              </div>
                            ) : (
                              <span className="text-[9px] text-slate-600 font-mono">--</span>
                            )}
                          </div>
                        </td>
                      );
                    })}

                    {/* Total Booked Hours & Utilization Column */}
                    <td className="p-3.5 pr-5 text-right align-middle">
                      <div className="space-y-1">
                        <div className="flex items-center justify-end gap-1.5">
                          <span className={`text-sm font-bold font-mono ${
                            isOverloaded ? 'text-rose-400' : 'text-white'
                          }`}>
                            {totalBooked}h
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">/ 80h</span>
                        </div>

                        <div className="flex items-center justify-end gap-1.5">
                          <span className={`text-[11px] font-bold ${
                            utilRate > 95 ? 'text-rose-400' :
                            utilRate >= 60 ? 'text-emerald-400' :
                            'text-slate-400'
                          }`}>
                            {utilRate}%
                          </span>
                          <span className="text-[10px] text-slate-500">Util</span>
                        </div>

                        <div className="w-20 ml-auto bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              utilRate > 95 ? 'bg-rose-500' :
                              utilRate >= 60 ? 'bg-emerald-400' :
                              'bg-slate-600'
                            }`}
                            style={{ width: `${Math.min(utilRate, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Cell Inspector Modal */}
      {selectedCell && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-300 font-mono text-xs font-bold border border-sky-800">
                    {selectedCell.dateStr}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">
                    Total Hours: <strong className="text-white">{selectedCell.dayHours}h</strong>
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-1">
                  {selectedCell.auditor.name} • Daily Audit Schedule
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedCell.auditor.role} ({selectedCell.auditor.department})
                </p>
              </div>

              <button
                onClick={() => setSelectedCell(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white bg-slate-800/80"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Slots List */}
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {selectedCell.slots.length === 0 ? (
                <div className="p-8 text-center bg-slate-950 rounded-xl border border-slate-800 text-slate-400 text-xs">
                  <UserCheck className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-60" />
                  <div className="font-bold text-white">Full Availability on this Date</div>
                  <p className="text-slate-500 mt-1">
                    No audits or meetings are currently booked. This 8-hour window is available to absorb scheduling gaps.
                  </p>
                </div>
              ) : (
                selectedCell.slots.map((slot) => (
                  <div
                    key={slot.id}
                    className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 bg-slate-900 text-sky-400 font-mono font-bold text-[10px] rounded border border-slate-800">
                        {slot.auditCode}
                      </span>
                      <span className="font-mono font-bold text-emerald-400 text-xs">
                        {slot.hours} Hours
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white leading-snug">
                      {slot.auditTitle}
                    </h4>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-900">
                      <span>Category: <strong className="text-slate-300">{slot.category}</strong></span>
                      {slot.linkedClause && (
                        <span>Clause: <strong className="text-sky-400 font-mono">{slot.linkedClause}</strong></span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <div className="text-xs text-slate-400">
                Capacity Status:{' '}
                <strong className={selectedCell.dayHours > 8 ? 'text-rose-400' : 'text-emerald-400'}>
                  {selectedCell.dayHours > 8 ? 'Overallocated (+ ' + (selectedCell.dayHours - 8) + 'h)' : (8 - selectedCell.dayHours) + 'h Free Capacity'}
                </strong>
              </div>
              <button
                onClick={() => setSelectedCell(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Selected Gap Inspector & Assignment Modal */}
      {selectedGap && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 font-mono text-xs font-bold border border-amber-800">
                  Scheduling Gap: {selectedGap.auditCode}
                </span>
                <h3 className="text-base font-bold text-white mt-1">
                  {selectedGap.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedGap(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white bg-slate-800/80"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Target Date:</span>
                  <strong className="text-white font-mono">{selectedGap.dateStr}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Estimated Effort:</span>
                  <strong className="text-emerald-400 font-mono">{selectedGap.estimatedHours} Hours</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Required Specialty:</span>
                  <strong className="text-sky-300">{selectedGap.requiredSpecialty}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Linked Standard / Clause:</span>
                  <strong className="text-indigo-300 font-mono">{selectedGap.linkedClause}</strong>
                </div>
              </div>

              <div className="bg-amber-950/40 p-3 rounded-xl border border-amber-900/50 text-amber-200">
                <strong className="block text-[11px] font-bold uppercase mb-0.5">Urgency Rationale:</strong>
                {selectedGap.urgencyReason}
              </div>
            </div>

            {/* Select Auditor to Assign */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-slate-300 block">
                Assign Certified Auditor for this Scope:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {auditors.map((aud) => (
                  <button
                    key={aud.id}
                    onClick={() => handleAssignGap(selectedGap, aud.id)}
                    className="p-2.5 rounded-xl bg-slate-950 hover:bg-sky-950/60 border border-slate-800 hover:border-sky-600 text-left transition-all flex items-center gap-2.5 cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-700 text-sky-400 font-bold text-xs flex items-center justify-center shrink-0">
                      {aud.avatarInitials}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-white text-xs truncate">{aud.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{aud.certifications[0]}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auto-Rebalance Confirmation Modal */}
      {isAutoRebalanceModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-800">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Smart Workload Rebalancer
                  </h3>
                  <p className="text-xs text-slate-400">
                    Automated optimization of auditor schedules and unassigned gaps
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAutoRebalanceModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white bg-slate-800/80"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <p className="leading-relaxed">
                The smart balancing algorithm will execute the following schedule adjustments based on auditor certifications and open capacity:
              </p>

              <div className="space-y-2 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Shift 3.5h Terraform Drift Audit:</strong>
                    <p className="text-slate-400 text-[11px]">
                      From David Chen (9.5h on Sep 09) to Marcus Brody (Free Capacity).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Transfer 4h Cloud SIEM Review:</strong>
                    <p className="text-slate-400 text-[11px]">
                      From David Chen (9.5h on Sep 16) to Michael Torres (Threat Specialist).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Fill Open Scheduling Gaps:</strong>
                    <p className="text-slate-400 text-[11px]">
                      Auto-assign {gaps.length} unallocated audit scopes to qualified auditors.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsAutoRebalanceModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteAutoRebalance}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Apply Rebalance Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Audit Slot Modal */}
      {isAddSlotOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateSlot} className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Book Audit Session Slot</h3>
                <p className="text-xs text-slate-400">Allocate auditor hours to an internal audit scope</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddSlotOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white bg-slate-800/80"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Assign Auditor:</label>
                <select
                  value={newSlotAuditorId}
                  onChange={(e) => setNewSlotAuditorId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-sky-500"
                >
                  {auditors.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Audit Scope / Task Title:</label>
                <input
                  type="text"
                  required
                  value={newSlotTitle}
                  onChange={(e) => setNewSlotTitle(e.target.value)}
                  placeholder="e.g. AWS Multi-Account IAM Access Review"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Date:</label>
                  <select
                    value={newSlotDate}
                    onChange={(e) => setNewSlotDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-sky-500"
                  >
                    {CALENDAR_DAYS_SAMPLE.map(d => (
                      <option key={d.dateStr} value={d.dateStr}>
                        {d.dayLabel} {d.dateStr}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Allocated Hours:</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    step="0.5"
                    value={newSlotHours}
                    onChange={(e) => setNewSlotHours(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Category:</label>
                  <select
                    value={newSlotCategory}
                    onChange={(e) => setNewSlotCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-sky-500"
                  >
                    <option value="FIELDWORK">Fieldwork Sampling</option>
                    <option value="DOCUMENT_REVIEW">Document Review</option>
                    <option value="INTERVIEW">Interview / Conference</option>
                    <option value="REPORTING">Working Paper Reporting</option>
                    <option value="OUT_OF_OFFICE">Out of Office / Leave</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Linked Clause:</label>
                  <input
                    type="text"
                    value={newSlotClause}
                    onChange={(e) => setNewSlotClause(e.target.value)}
                    placeholder="e.g. Annex A A.8.24"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddSlotOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Save Schedule Slot
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
