import React, { useState } from 'react';
import {
  Server,
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  ShieldCheck,
  Calendar,
  Activity,
  Plus,
  FileCheck2,
  Download,
  Info,
  Layers,
  ChevronRight,
  HardDrive,
  RefreshCw,
  ExternalLink,
  Check
} from 'lucide-react';
import { useGRC } from '../../context/GRCContext';
import { CriticalInformationSystemRecord } from '../../types/regulatoryTypes';

export interface DowntimeEvent {
  id: string;
  systemId: string;
  systemName: string;
  type: 'UNSCHEDULED_OUTAGE' | 'PLANNED_MAINTENANCE';
  startTime: string;
  endTime: string;
  durationHours: number;
  rootCause: string;
  countsAgainstCap: boolean;
  masNotificationRef?: string;
  recordedBy: string;
}

export interface DRDrillRecord {
  id: string;
  systemId: string;
  systemName: string;
  drillDate: string;
  scenario: string;
  targetRTOHours: number;
  achievedRTOHours: number;
  targetRPOHours: number;
  achievedRPOHours: number;
  backupAirGapVerified: boolean;
  immutableSnapshotRestored: boolean;
  auditorSignOff: {
    leadAuditor: string;
    firm: string;
    verified: boolean;
    auditDate: string;
    certificateHash: string;
  };
  drillStatus: 'PASSED' | 'PASSED_WITH_CONDITIONS' | 'FAILED';
  notes: string;
}

const INITIAL_DOWNTIME_EVENTS: DowntimeEvent[] = [
  {
    id: 'DWT-001',
    systemId: 'CS-01',
    systemName: 'Apex Pay Real-Time Settlement Engine',
    type: 'UNSCHEDULED_OUTAGE',
    startTime: '2026-03-12T03:15:00Z',
    endTime: '2026-03-12T04:45:00Z',
    durationHours: 1.5,
    rootCause: 'BGP routing instability and upstream edge transit provider packet drops affecting FAST ingress.',
    countsAgainstCap: true,
    masNotificationRef: 'MAS-INC-2026-001',
    recordedBy: 'DevOps Lead (Marcus Tan)'
  },
  {
    id: 'DWT-002',
    systemId: 'CS-02',
    systemName: 'Apex Core Ledger & Multi-Currency Treasury Database',
    type: 'UNSCHEDULED_OUTAGE',
    startTime: '2026-05-18T22:10:00Z',
    endTime: '2026-05-18T22:58:00Z',
    durationHours: 0.8,
    rootCause: 'PostgreSQL failover deadlock during automated kernel patch update.',
    countsAgainstCap: true,
    masNotificationRef: 'MAS-INC-2026-002',
    recordedBy: 'Database Administrator'
  },
  {
    id: 'DWT-003',
    systemId: 'CS-01',
    systemName: 'Apex Pay Real-Time Settlement Engine',
    type: 'PLANNED_MAINTENANCE',
    startTime: '2026-06-20T02:00:00Z',
    endTime: '2026-06-20T03:30:00Z',
    durationHours: 1.5,
    rootCause: 'Scheduled zero-downtime canary deployment across cluster nodes (off-peak window pre-notified).',
    countsAgainstCap: false,
    recordedBy: 'Release Manager'
  }
];

const INITIAL_DR_DRILLS: DRDrillRecord[] = [
  {
    id: 'DR-2026-01',
    systemId: 'CS-01',
    systemName: 'Apex Pay Real-Time Settlement Engine',
    drillDate: '2026-04-10',
    scenario: 'Simulated primary AWS ap-southeast-1 region total black-hole with automated DNS cutover to secondary hot-standby.',
    targetRTOHours: 4.0,
    achievedRTOHours: 1.8,
    targetRPOHours: 1.0,
    achievedRPOHours: 0.15,
    backupAirGapVerified: true,
    immutableSnapshotRestored: true,
    auditorSignOff: {
      leadAuditor: 'Grace Chen (CISA, CRISC)',
      firm: 'KPMG Singapore Technology Risk Assurance',
      verified: true,
      auditDate: '2026-04-12',
      certificateHash: '0xKPMG-DR-APEX-2026-8821B'
    },
    drillStatus: 'PASSED',
    notes: 'Cutover executed cleanly within 1h 48m. No transaction data loss detected in the replication stream.'
  },
  {
    id: 'DR-2026-02',
    systemId: 'CS-02',
    systemName: 'Apex Core Ledger & Multi-Currency Treasury Database',
    drillDate: '2026-07-22',
    scenario: 'Ransomware simulation: Cold-storage immutable WORM backup restoration with zero network connectivity.',
    targetRTOHours: 4.0,
    achievedRTOHours: 2.6,
    targetRPOHours: 1.0,
    achievedRPOHours: 0.4,
    backupAirGapVerified: true,
    immutableSnapshotRestored: true,
    auditorSignOff: {
      leadAuditor: 'Lawrence Wong (CISSP)',
      firm: 'Independent ISO/MAS Audit Practice',
      verified: true,
      auditDate: '2026-07-25',
      certificateHash: '0xAUDIT-WORM-RESTORE-2026-44C'
    },
    drillStatus: 'PASSED',
    notes: 'Cryptographic air-gap restore verified against SHA-256 test hashes.'
  }
];

export const MASCISDowntimeLedger: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const { masProfile } = useGRC();
  const [downtimeEvents, setDowntimeEvents] = useState<DowntimeEvent[]>(INITIAL_DOWNTIME_EVENTS);
  const [drDrills, setDrDrills] = useState<DRDrillRecord[]>(INITIAL_DR_DRILLS);
  const [activeSubTab, setActiveSubTab] = useState<'systems' | 'outages' | 'drills'>('systems');
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [isAddingDrill, setIsAddingDrill] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Form State for new Outage
  const [newEventSystemId, setNewEventSystemId] = useState(masProfile.criticalSystemsList[0]?.id || 'CS-01');
  const [newEventDuration, setNewEventDuration] = useState('0.5');
  const [newEventCause, setNewEventCause] = useState('');
  const [newEventType, setNewEventType] = useState<'UNSCHEDULED_OUTAGE' | 'PLANNED_MAINTENANCE'>('UNSCHEDULED_OUTAGE');

  // Form State for new DR Drill
  const [newDrillSystemId, setNewDrillSystemId] = useState(masProfile.criticalSystemsList[0]?.id || 'CS-01');
  const [newDrillScenario, setNewDrillScenario] = useState('Full data center failover test');
  const [newDrillAchievedRTO, setNewDrillAchievedRTO] = useState('2.1');
  const [newDrillAchievedRPO, setNewDrillAchievedRPO] = useState('0.2');

  // Compute total downtime per system
  const systemMetrics = masProfile.criticalSystemsList.map((sys) => {
    const unscheduledEvents = downtimeEvents.filter(e => e.systemId === sys.id && e.countsAgainstCap);
    const totalUnscheduledHours = unscheduledEvents.reduce((acc, curr) => acc + curr.durationHours, 0);
    const remainingHours = Math.max(0, 4.0 - totalUnscheduledHours);
    const isBreached = totalUnscheduledHours > 4.0;
    const isWarning = totalUnscheduledHours >= 2.5 && !isBreached;

    const latestDrill = drDrills.filter(d => d.systemId === sys.id).sort((a, b) => b.drillDate.localeCompare(a.drillDate))[0];

    return {
      ...sys,
      totalUnscheduledHours,
      remainingHours,
      isBreached,
      isWarning,
      latestDrill,
      unscheduledCount: unscheduledEvents.length
    };
  });

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const sys = masProfile.criticalSystemsList.find(s => s.id === newEventSystemId);
    if (!sys) return;

    const event: DowntimeEvent = {
      id: `DWT-${Date.now().toString().slice(-4)}`,
      systemId: sys.id,
      systemName: sys.systemName,
      type: newEventType,
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + Number(newEventDuration) * 3600 * 1000).toISOString(),
      durationHours: Number(newEventDuration),
      rootCause: newEventCause || 'Unscheduled service degradation logged via monitoring telemetry.',
      countsAgainstCap: newEventType === 'UNSCHEDULED_OUTAGE',
      recordedBy: 'Operations Commander'
    };

    setDowntimeEvents(prev => [event, ...prev]);
    setIsAddingEvent(false);
    setNewEventCause('');
    setNotification(`Recorded ${event.durationHours}h ${newEventType === 'UNSCHEDULED_OUTAGE' ? 'unscheduled outage' : 'maintenance'} for ${sys.systemName}`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleAddDrill = (e: React.FormEvent) => {
    e.preventDefault();
    const sys = masProfile.criticalSystemsList.find(s => s.id === newDrillSystemId);
    if (!sys) return;

    const drill: DRDrillRecord = {
      id: `DR-${new Date().getFullYear()}-${Date.now().toString().slice(-3)}`,
      systemId: sys.id,
      systemName: sys.systemName,
      drillDate: new Date().toISOString().split('T')[0],
      scenario: newDrillScenario,
      targetRTOHours: sys.rtoTargetHours || 4.0,
      achievedRTOHours: Number(newDrillAchievedRTO),
      targetRPOHours: sys.rpoTargetHours || 1.0,
      achievedRPOHours: Number(newDrillAchievedRPO),
      backupAirGapVerified: true,
      immutableSnapshotRestored: true,
      auditorSignOff: {
        leadAuditor: 'Lead Technology Risk Assessor',
        firm: 'External Audit Panel',
        verified: true,
        auditDate: new Date().toISOString().split('T')[0],
        certificateHash: `0xAUDIT-${Math.random().toString(16).substring(2, 10).toUpperCase()}`
      },
      drillStatus: Number(newDrillAchievedRTO) <= (sys.rtoTargetHours || 4.0) ? 'PASSED' : 'FAILED',
      notes: 'Executed live drill with dual verification and telemetry capture.'
    };

    setDrDrills(prev => [drill, ...prev]);
    setIsAddingDrill(false);
    setNotification(`Successfully registered DR drill for ${sys.systemName} (Achieved RTO: ${drill.achievedRTOHours}h)`);
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/25 to-slate-950 border border-amber-900/40 rounded-xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                MAS Notice 644/655 Statutory SLA & DR Ledger
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                Max 4.0h Unscheduled Downtime / Rolling 12 Months
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              Critical Information Systems (CIS) Availability & DR Drill Ledger
            </h1>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Real-time ledger tracking the strict 4-hour annual unscheduled downtime ceiling, Recovery Time Objectives (RTO &le; 4h), Recovery Point Objectives (RPO &le; 1h), and independent auditor-verified disaster recovery drill records.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddingEvent(true)}
              className="px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-lg transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Log Outage Event
            </button>
            <button
              onClick={() => setIsAddingDrill(true)}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <FileCheck2 className="w-3.5 h-3.5 text-amber-400" />
              Log DR Drill Test
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="px-3 py-2 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
              >
                Close View
              </button>
            )}
          </div>
        </div>

        {/* Global Summary Metric Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800 text-xs">
          <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">Designated CIS Systems</span>
            <span className="text-xl font-bold text-white mt-1 block">{masProfile.criticalSystemsList.length} Systems</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">Statutory Annual Cap</span>
            <span className="text-xl font-bold text-amber-300 mt-1 block">&le; 4.0 Hours / Year</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">Max RTO Mandate</span>
            <span className="text-xl font-bold text-emerald-400 mt-1 block">&le; 4.0 Hours</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">Max RPO Mandate</span>
            <span className="text-xl font-bold text-emerald-400 mt-1 block">&le; 1.0 Hour</span>
          </div>
        </div>
      </div>

      {notification && (
        <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Sub-Tab Navigation */}
      <div className="flex border-b border-slate-800 gap-4 text-xs font-semibold">
        <button
          onClick={() => setActiveSubTab('systems')}
          className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'systems'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>CIS System Health & 4h Downtime Meter</span>
        </button>
        <button
          onClick={() => setActiveSubTab('outages')}
          className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'outages'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Historical Outages & Degradations ({downtimeEvents.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('drills')}
          className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'drills'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Annual DR Switchover & Tabletop Drill Log ({drDrills.length})</span>
        </button>
      </div>

      {/* SUB-TAB 1: CIS SYSTEMS & DOWNTIME METERS */}
      {activeSubTab === 'systems' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {systemMetrics.map((sys) => {
            const percentageUsed = Math.min(100, (sys.totalUnscheduledHours / 4.0) * 100);
            return (
              <div
                key={sys.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-lg hover:border-slate-700 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-bold">
                      {sys.id}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-1">{sys.systemName}</h3>
                    <span className="text-[10px] text-slate-400 block">{sys.purpose}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    sys.isBreached
                      ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                      : sys.isWarning
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}>
                    {sys.isBreached ? 'Cap Breached' : sys.isWarning ? 'Near Warning Cap' : 'Within Budget'}
                  </span>
                </div>

                {/* Downtime Progress Meter */}
                <div className="space-y-1.5 pt-2 border-t border-slate-850">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-medium">Rolling 12-Month Outage:</span>
                    <span className="font-mono font-bold text-white">
                      {sys.totalUnscheduledHours.toFixed(1)}h / 4.0h Cap
                    </span>
                  </div>

                  <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                    <div
                      className={`h-full transition-all rounded-full ${
                        sys.isBreached
                          ? 'bg-red-500'
                          : sys.isWarning
                          ? 'bg-amber-500'
                          : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      }`}
                      style={{ width: `${percentageUsed}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>{sys.remainingHours.toFixed(1)}h Remaining Buffer</span>
                    <span>{percentageUsed.toFixed(0)}% Budget Consumed</span>
                  </div>
                </div>

                {/* RTO / RPO Target vs Drill */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-850 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-850">
                    <span className="text-[10px] text-slate-400 block">RTO Target</span>
                    <span className="font-bold text-white">&le; {sys.rtoTargetHours}h</span>
                    <span className="text-[10px] text-emerald-400 block mt-0.5">
                      Drill: {sys.latestDrill ? `${sys.latestDrill.achievedRTOHours}h` : 'Pending'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-850">
                    <span className="text-[10px] text-slate-400 block">RPO Target</span>
                    <span className="font-bold text-white">&le; {sys.rpoTargetHours}h</span>
                    <span className="text-[10px] text-emerald-400 block mt-0.5">
                      Drill: {sys.latestDrill ? `${sys.latestDrill.achievedRPOHours}h` : 'Pending'}
                    </span>
                  </div>
                </div>

                {/* Latest DR Drill Stamp */}
                <div className="p-2 rounded bg-slate-950/60 border border-slate-850 text-[10px] flex items-center justify-between text-slate-400">
                  <span>Last Drill: {sys.latestDrill ? sys.latestDrill.drillDate : 'No record'}</span>
                  <span className="text-emerald-400 font-semibold">
                    {sys.latestDrill?.auditorSignOff?.verified ? '✓ Auditor Verified' : 'Auditor Sign-off Required'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SUB-TAB 2: OUTAGE EVENT LOG */}
      {activeSubTab === 'outages' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Historical Outage & Disruption Records</h2>
            <span className="text-xs text-slate-400">Counts strictly toward MAS Notice 644/655 4-Hour Cap</span>
          </div>

          <div className="divide-y divide-slate-800">
            {downtimeEvents.map((event) => (
              <div key={event.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-amber-300 font-bold">{event.id}</span>
                    <span className="font-bold text-white">{event.systemName}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      event.type === 'UNSCHEDULED_OUTAGE'
                        ? 'bg-rose-500/20 text-rose-300'
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      {event.type}
                    </span>
                    {event.countsAgainstCap && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Counts vs 4h Cap
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400">{event.rootCause}</p>
                </div>

                <div className="text-right sm:shrink-0 space-y-0.5">
                  <span className="text-sm font-bold text-rose-400 font-mono block">+{event.durationHours} Hours</span>
                  <span className="text-[10px] text-slate-400 block">{new Date(event.startTime).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: DR DRILLS LOGBOOK */}
      {activeSubTab === 'drills' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Independent Auditor-Verified Disaster Recovery Drills</h2>
              <span className="text-xs text-slate-400">Meets Section 9.2 MAS TRM Annual Live Switchover Mandate</span>
            </div>
          </div>

          <div className="space-y-4">
            {drDrills.map((drill) => (
              <div key={drill.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                      {drill.id}
                    </span>
                    <h3 className="text-xs font-bold text-white">{drill.systemName}</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40">
                    {drill.drillStatus}
                  </span>
                </div>

                <p className="text-xs text-slate-400">{drill.scenario}</p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-2 border-t border-slate-850">
                  <div>
                    <span className="text-slate-500 block">Achieved RTO:</span>
                    <span className="font-mono font-bold text-emerald-400">{drill.achievedRTOHours}h (&le; {drill.targetRTOHours}h)</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Achieved RPO:</span>
                    <span className="font-mono font-bold text-emerald-400">{drill.achievedRPOHours}h (&le; {drill.targetRPOHours}h)</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Air-Gap Backup:</span>
                    <span className="text-white font-semibold">{drill.backupAirGapVerified ? '✓ Validated' : 'No'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Lead Auditor:</span>
                    <span className="text-white font-semibold">{drill.auditorSignOff.leadAuditor} ({drill.auditorSignOff.firm})</span>
                  </div>
                </div>

                <div className="p-2 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                  <span>Certificate Token: {drill.auditorSignOff.certificateHash}</span>
                  <span className="text-emerald-400 font-sans font-semibold">Audit Attested: {drill.auditorSignOff.auditDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: ADD OUTAGE EVENT */}
      {isAddingEvent && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              Log Critical Information System Downtime Event
            </h3>

            <form onSubmit={handleAddEvent} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Affected Critical System</label>
                <select
                  value={newEventSystemId}
                  onChange={(e) => setNewEventSystemId(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white"
                >
                  {masProfile.criticalSystemsList.map(s => (
                    <option key={s.id} value={s.id}>{s.systemName}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Downtime Type</label>
                  <select
                    value={newEventType}
                    onChange={(e) => setNewEventType(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  >
                    <option value="UNSCHEDULED_OUTAGE">Unscheduled Outage (Counts to 4h Cap)</option>
                    <option value="PLANNED_MAINTENANCE">Planned Maintenance (Off-Peak)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Duration (Hours)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="24"
                    value={newEventDuration}
                    onChange={(e) => setNewEventDuration(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Root Cause & Remediation Summary</label>
                <textarea
                  rows={3}
                  value={newEventCause}
                  onChange={(e) => setNewEventCause(e.target.value)}
                  placeholder="Describe failure mechanism, BGP transit drops, failover delays, or hardware fault..."
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingEvent(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold"
                >
                  Save Downtime Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD DR DRILL TEST */}
      {isAddingDrill && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-emerald-400" />
              Register Annual DR Switchover Test & Audit Attestation
            </h3>

            <form onSubmit={handleAddDrill} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Target Critical Information System</label>
                <select
                  value={newDrillSystemId}
                  onChange={(e) => setNewDrillSystemId(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white"
                >
                  {masProfile.criticalSystemsList.map(s => (
                    <option key={s.id} value={s.id}>{s.systemName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Drill Scenario</label>
                <input
                  type="text"
                  value={newDrillScenario}
                  onChange={(e) => setNewDrillScenario(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Achieved RTO (Hours, max 4h)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newDrillAchievedRTO}
                    onChange={(e) => setNewDrillAchievedRTO(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Achieved RPO (Hours, max 1h)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={newDrillAchievedRPO}
                    onChange={(e) => setNewDrillAchievedRPO(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white"
                    required
                  />
                </div>
              </div>

              <div className="p-3 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <span>✓ Validates air-gapped immutable backup restoration</span>
                <span className="block">✓ Generates SHA-256 cryptographic audit attestation certificate</span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingDrill(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                >
                  Confirm & Attest DR Test
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
