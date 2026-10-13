import React, { useState } from 'react';
import { useGRC } from '../../context/GRCContext';
import { PageContainer } from '../layout/PageContainer';
import {
  ClipboardList,
  Calendar,
  CheckCircle2,
  AlertOctagon,
  Clock,
  Plus,
  Search,
  Filter,
  FileCheck,
  Award,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  CalendarDays,
  Users,
  LayoutDashboard,
  TrendingUp,
  BarChart3,
  Flame,
  Zap,
  Building2,
  Check,
  FileText
} from 'lucide-react';
import { AuditCalendarView } from '../audit/AuditCalendarView';
import { AuditTeamAvailabilityWidget } from '../audit/AuditTeamAvailabilityWidget';
import { NonConformityLogTracker } from '../audit/NonConformityLogTracker';
import { NCTrendAnalyticsChart } from '../audit/NCTrendAnalyticsChart';
import { AuditStageProgressBar } from '../audit/AuditStageProgressBar';
import { AuditorIndependenceMatrixModal } from '../audit/AuditorIndependenceMatrixModal';
import { Scale } from 'lucide-react';

interface AuditChecklistSection {
  clause: string;
  title: string;
  items: {
    id: string;
    question: string;
    status: 'Compliant' | 'Non-Conformity' | 'Observation' | 'Not Tested';
    notes: string;
    sampleRef: string;
  }[];
}

export const InternalAuditModule: React.FC = () => {
  const { currentTenant, setActiveModule, findings } = useGRC();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'nc_log' | 'fieldwork' | 'availability' | 'calendar' | 'schedule'>('dashboard');
  const [showIndependenceModal, setShowIndependenceModal] = useState<boolean>(false);

  // Tenant findings
  const tenantFindings = findings.filter(f => f.tenantId === currentTenant?.id);
  const openNCs = tenantFindings.filter(f => f.status !== 'Closed Verified');
  const majorNCs = tenantFindings.filter(f => f.severity === 'Major Non-Conformity');
  const minorNCs = tenantFindings.filter(f => f.severity === 'Minor Non-Conformity');

  // Interactive Checklist State
  const [sections, setSections] = useState<AuditChecklistSection[]>([
    {
      clause: 'Clause 4 & 5',
      title: 'Context of Organisation & Leadership Commitment',
      items: [
        {
          id: 'item_4_1',
          question: 'Are internal and external issues relevant to the purpose of the ISMS formally documented and reviewed annually?',
          status: 'Compliant',
          notes: 'Documented in Business Discovery narrative and SoA baseline.',
          sampleRef: 'DOC-POL-001 v1.0'
        },
        {
          id: 'item_5_2',
          question: 'Has top management established and published an information security policy that includes security objectives?',
          status: 'Compliant',
          notes: 'Information Security Policy approved by CISO and published to portal.',
          sampleRef: 'DOC-POL-001'
        }
      ]
    },
    {
      clause: 'Clause 6 & 8',
      title: 'Planning, Risk Assessment & Operational Control',
      items: [
        {
          id: 'item_6_1',
          question: 'Is the information security risk assessment process defined, repeatable, and producing consistent results against a 5x5 matrix?',
          status: 'Compliant',
          notes: 'Risk assessment register populated with 6 items; residual thresholds active.',
          sampleRef: 'Risk Register 2026'
        },
        {
          id: 'item_8_2',
          question: 'Are risk assessments performed at planned intervals or when significant changes occur?',
          status: 'Observation',
          notes: 'Trigger mechanism for ad-hoc cloud architecture changes needs tighter DevOps integration.',
          sampleRef: 'Change Log Q2'
        }
      ]
    },
    {
      clause: 'Clause 9 & 10',
      title: 'Performance Evaluation, Internal Audit & Improvement',
      items: [
        {
          id: 'item_9_2',
          question: 'Does the organisation conduct internal audits at planned intervals covering all ISO 27001 requirements?',
          status: 'Compliant',
          notes: 'Annual internal audit program executed across all in-scope departments.',
          sampleRef: 'Internal Audit Plan 2026'
        },
        {
          id: 'item_10_1',
          question: 'Are non-conformities subjected to structured root cause analysis with corrective actions verified by independent auditors?',
          status: 'Compliant',
          notes: 'CAPA workflow enforces 5-Whys methodology and closure signoff.',
          sampleRef: 'CAPA Register FND-001'
        }
      ]
    }
  ]);

  const updateItemStatus = (sectionIdx: number, itemIdx: number, newStatus: any) => {
    setSections(prev => {
      const copy = [...prev];
      copy[sectionIdx].items[itemIdx].status = newStatus;
      return copy;
    });
  };

  const updateItemNotes = (sectionIdx: number, itemIdx: number, notes: string) => {
    setSections(prev => {
      const copy = [...prev];
      copy[sectionIdx].items[itemIdx].notes = notes;
      return copy;
    });
  };

  return (
    <PageContainer id="internal-audit-module">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950/40 border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400 px-2 py-0.5 rounded bg-sky-950 border border-sky-800">
                Internal Audit Program (Clause 9.2)
              </span>
              <span className="text-xs text-slate-400">Target Standard: ISO/IEC 27001:2022</span>
            </div>
            <h1 className="text-xl font-bold text-white mt-1">Internal Audit Universe, Checklists & Working Papers</h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Plan and execute formal internal audits across Clauses 4-10 and Annex A control sets. Record objective sampling evidence, evaluate compliance maturity, and automatically raise non-conformity findings for CAPA remediation.
            </p>
          </div>

          {/* Sub Navigation */}
          <div className="flex items-center space-x-1.5 p-1.5 rounded-xl bg-slate-800 border border-slate-700 shrink-0 flex-wrap">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'dashboard' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Audit Dashboard & NC Trends</span>
            </button>
            <button
              onClick={() => setActiveTab('nc_log')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'nc_log' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>Non-Conformity (NC) Log & CAPA</span>
            </button>
            <button
              onClick={() => setActiveTab('fieldwork')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'fieldwork' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Fieldwork Checklists
            </button>
            <button
              onClick={() => setActiveTab('availability')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'availability' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Team Availability & Workload Heatmap</span>
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'calendar' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Audit Calendar & ICS Feeds</span>
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'schedule' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Annual Audit Plan
            </button>
            <button
              onClick={() => setActiveModule('audit_reporting')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white shadow-sm hover:scale-[1.02]"
              title="Generate Automated Stakeholder Audit Report"
              id="btn-nav-audit-reporting-from-audit"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Stakeholder Audit Report</span>
            </button>
            <button
              onClick={() => setShowIndependenceModal(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer bg-sky-950/80 hover:bg-sky-900 text-sky-300 border border-sky-700 shadow-sm"
              title="Audit Independence Matrix & ISO 19011 Impartiality Attestation (Clause 9.2.2)"
              id="btn-nav-independence-matrix"
            >
              <Scale className="w-3.5 h-3.5 text-sky-400" />
              <span>Auditor Independence (Cl. 9.2.2)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Audit Executive Dashboard & NC Trends View */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Executive KPI Header Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-slate-400 font-medium">Audit Universe Scope</div>
                <div className="text-xl font-bold font-mono text-white mt-1">100% Covered</div>
                <div className="text-[10px] text-emerald-400 mt-0.5">Clauses 4-10 & Annex A</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-sky-950/60 border border-sky-800/60 flex items-center justify-center text-sky-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-slate-400 font-medium">Open Non-Conformities</div>
                <div className="text-xl font-bold font-mono text-rose-400 mt-1">
                  {openNCs.length} <span className="text-xs font-normal text-slate-400">active</span>
                </div>
                <div className="text-[10px] text-rose-400 mt-0.5">
                  {majorNCs.filter(f => f.status !== 'Closed Verified').length} Major • {minorNCs.filter(f => f.status !== 'Closed Verified').length} Minor
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-950/60 border border-rose-800/60 flex items-center justify-center text-rose-400">
                <AlertOctagon className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-slate-400 font-medium">Mean Turnaround (MTTR)</div>
                <div className="text-xl font-bold font-mono text-sky-400 mt-1">11.2 Days</div>
                <div className="text-[10px] text-emerald-400 mt-0.5">57% faster vs Q2 baseline</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-sky-950/60 border border-sky-800/60 flex items-center justify-center text-sky-400">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-slate-400 font-medium">Checklist Execution</div>
                <div className="text-xl font-bold font-mono text-emerald-400 mt-1">86% Pass</div>
                <div className="text-[10px] text-slate-400 mt-0.5">18 of 21 controls compliant</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Audit Stage Document Evidence Fulfillment Progress Bar */}
          <AuditStageProgressBar />

          {/* Dedicated Recharts Trend Line Chart Component */}
          <NCTrendAnalyticsChart
            findings={tenantFindings}
            onSelectMonth={() => setActiveTab('nc_log')}
          />

          {/* Department Remediation Velocity & SLA Leaderboard */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Building2 className="w-4 h-4 text-sky-400" />
                    <span>Departmental Remediation Velocity & SLA Compliance</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Mean time to resolution (MTTR) and on-time CAPA submission across operational business units
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('nc_log')}
                  className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center space-x-1 cursor-pointer"
                >
                  <span>Open Full Log</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="divide-y divide-slate-800/80">
                {[
                  { dept: 'Software Engineering & DevOps', open: 1, closed: 4, avgDays: 7.4, sla: '100% On-Time', grade: 'text-emerald-400 bg-emerald-950/60 border-emerald-800' },
                  { dept: 'IT & Infrastructure', open: 1, closed: 5, avgDays: 10.2, sla: '94% On-Time', grade: 'text-emerald-400 bg-emerald-950/60 border-emerald-800' },
                  { dept: 'Cyber Security & SecOps', open: 1, closed: 4, avgDays: 8.9, sla: '92% On-Time', grade: 'text-emerald-400 bg-emerald-950/60 border-emerald-800' },
                  { dept: 'Human Resources & People Ops', open: 0, closed: 2, avgDays: 14.0, sla: '88% On-Time', grade: 'text-sky-400 bg-sky-950/60 border-sky-800' },
                  { dept: 'Procurement & Vendor Mgmt', open: 0, closed: 3, avgDays: 15.5, sla: '85% On-Time', grade: 'text-amber-400 bg-amber-950/60 border-amber-800' },
                  { dept: 'Physical Facilities & Security', open: 0, closed: 2, avgDays: 16.0, sla: '82% On-Time', grade: 'text-amber-400 bg-amber-950/60 border-amber-800' }
                ].map((item, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <div className="font-semibold text-white">{item.dept}</div>
                      <div className="text-[11px] text-slate-400">
                        {item.open} open • {item.closed} resolved in 6-mo window
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="font-mono font-bold text-sky-400">{item.avgDays}d avg</div>
                        <div className="text-[10px] text-slate-400">Turnaround</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono border ${item.grade}`}>
                        {item.sla}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Action & Audit Universe Links */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Audit Action Center</span>
                </h4>
                <p className="text-xs text-slate-400">
                  Direct navigation to key audit phases and active field working papers.
                </p>

                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => setActiveTab('nc_log')}
                    className="w-full p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 flex items-center justify-between text-left transition cursor-pointer"
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-lg bg-rose-950/80 text-rose-400 flex items-center justify-center border border-rose-800">
                        <AlertOctagon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">Non-Conformity (NC) Log</div>
                        <div className="text-[10px] text-slate-400">Raise or verify CAPA closures</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </button>

                  <button
                    onClick={() => setActiveTab('fieldwork')}
                    className="w-full p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 flex items-center justify-between text-left transition cursor-pointer"
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-lg bg-sky-950/80 text-sky-400 flex items-center justify-center border border-sky-800">
                        <ClipboardList className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">Audit Fieldwork Checklists</div>
                        <div className="text-[10px] text-slate-400">Conduct sample tests & evidence</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </button>

                  <button
                    onClick={() => setActiveTab('calendar')}
                    className="w-full p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 flex items-center justify-between text-left transition cursor-pointer"
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-950/80 text-indigo-400 flex items-center justify-center border border-indigo-800">
                        <CalendarDays className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">Audit Calendar & Feeds</div>
                        <div className="text-[10px] text-slate-400">Outlook / Apple Calendar ICS</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-sky-950/40 border border-sky-800/50 text-[11px] text-sky-300">
                <span className="font-bold text-white">ISO 27001 Auditor Tip:</span> Keep resolution speed under the 14-day SLA threshold to ensure zero outstanding non-conformities before external Stage 2 surveillance.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Non-Conformity (NC) Log & CAPA Tracker View */}
      {activeTab === 'nc_log' && (
        <NonConformityLogTracker onNavigateToFieldwork={() => setActiveTab('fieldwork')} />
      )}

      {/* Team Availability & Workload Heatmap View */}
      {activeTab === 'availability' && (
        <AuditTeamAvailabilityWidget />
      )}

      {/* Calendar View (ICS Sync) */}
      {activeTab === 'calendar' && (
        <AuditCalendarView onNavigateModule={setActiveModule} />
      )}

      {/* Fieldwork Checklists */}
      {activeTab === 'fieldwork' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div className="text-xs text-slate-300">
              <strong className="text-white">Active Audit:</strong> ISO 27001 Annual Internal Audit Cycle 2026 • Lead Auditor: Internal Audit Lead
            </div>
            <button
              onClick={() => setActiveTab('nc_log')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-600/20 text-rose-300 border border-rose-500/40 text-xs font-bold hover:bg-rose-600/30 transition cursor-pointer"
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>Non-Conformity (NC) Log</span>
            </button>
          </div>

          <div className="space-y-4">
            {sections.map((sec, secIdx) => (
              <div key={secIdx} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800">
                      {sec.clause}
                    </span>
                    <h3 className="text-sm font-bold text-white">{sec.title}</h3>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    {sec.items.filter(i => i.status === 'Compliant').length}/{sec.items.length} Tested
                  </span>
                </div>

                <div className="space-y-4">
                  {sec.items.map((item, itemIdx) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-3"
                    >
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                        <div className="space-y-1 flex-1">
                          <p className="text-xs font-semibold text-white leading-relaxed">
                            {item.question}
                          </p>
                          <div className="text-[11px] text-slate-400 font-mono">
                            Sample Ref: <span className="text-sky-400">{item.sampleRef}</span>
                          </div>
                        </div>

                        {/* Status Switcher */}
                        <div className="flex items-center space-x-2 shrink-0">
                          {(['Compliant', 'Non-Conformity', 'Observation', 'Not Tested'] as const).map(st => (
                            <button
                              key={st}
                              onClick={() => updateItemStatus(secIdx, itemIdx, st)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                                item.status === st
                                  ? st === 'Compliant'
                                    ? 'bg-emerald-600 text-white'
                                    : st === 'Non-Conformity'
                                    ? 'bg-rose-600 text-white'
                                    : st === 'Observation'
                                    ? 'bg-amber-600 text-white'
                                    : 'bg-slate-700 text-white'
                                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Auditor Fieldwork Notes */}
                      <div>
                        <input
                          type="text"
                          value={item.notes}
                          onChange={e => updateItemNotes(secIdx, itemIdx, e.target.value)}
                          placeholder="Auditor fieldwork sampling observations and notes..."
                          className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-sky-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Annual Audit Plan */}
      {activeTab === 'schedule' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white">Annual Internal Audit Cycle & Coverage Matrix</h3>
          <p className="text-xs text-slate-400">
            Mandatory planned schedule distributing audit scopes throughout the calendar year to ensure 100% clause and Annex A coverage prior to certification surveillance.
          </p>

          <div className="space-y-3 pt-2">
            {[
              {
                quarter: 'Q1 (Jan - Mar)',
                scope: 'Context, Leadership & Information Security Policies (Clauses 4, 5, 6)',
                auditor: 'Internal Lead Auditor',
                status: 'Completed (Clean)'
              },
              {
                quarter: 'Q2 (Apr - Jun)',
                scope: 'Technological & Cloud Controls (Annex A: A.8.1 - A.8.34)',
                auditor: 'Senior Cloud Security Auditor',
                status: 'Completed (2 CAPAs Raised)'
              },
              {
                quarter: 'Q3 (Jul - Sep)',
                scope: 'People, Physical & Supplier Governance (Annex A: A.6, A.7, A.5.19)',
                auditor: 'Internal Lead Auditor',
                status: 'In Progress (Active Fieldwork)'
              },
              {
                quarter: 'Q4 (Oct - Dec)',
                scope: 'Incident Management, BCP & Management Review (Clause 9.3, 10)',
                auditor: 'Internal Lead Auditor',
                status: 'Scheduled'
              }
            ].map((audit, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-sky-400">{audit.quarter}</span>
                  <h4 className="text-xs font-bold text-white mt-0.5">{audit.scope}</h4>
                  <div className="text-[10px] text-slate-400 mt-0.5">Assigned: {audit.auditor}</div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-900 text-sky-300 border border-slate-700">
                  {audit.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Auditor Independence & Impartiality Modal */}
      <AuditorIndependenceMatrixModal
        isOpen={showIndependenceModal}
        onClose={() => setShowIndependenceModal(false)}
        tenantName={currentTenant?.name || 'Skanda Enterprise GRC'}
      />
    </PageContainer>
  );
};
