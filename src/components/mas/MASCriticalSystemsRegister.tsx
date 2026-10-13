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
  Check,
  Search,
  Zap,
  TrendingDown
} from 'lucide-react';
import { useGRC } from '../../context/GRCContext';
import { useToast } from '../common/ToastContainer';
import { MASCISSystemRegisterItem } from '../../types';

// Statutory Critical Information Systems for Licensed Financial Institutions
const INITIAL_CIS_SYSTEMS: MASCISSystemRegisterItem[] = [
  {
    id: 'CIS-01',
    systemName: 'Apex Pay Real-Time FAST Settlement Switch',
    tier: 'Tier 1 - Critical Financial Infrastructure',
    businessFunction: 'Interbank Real-Time Payment Clearing & Settlement (FAST/PayNow)',
    hostingModel: 'Singapore Sovereign Cloud',
    declaredRTOHours: 2.0, // Well within MAS 4h cap
    actualDrillRTOHours: 1.8,
    declaredRPOHours: 0.5, // Well within MAS 2h cap
    actualDrillRPOHours: 0.15,
    annualAllowedDowntimeHours: 4.0, // MAS Statutory Cap
    consumedDowntimeHours: 1.5,
    lastDRDrillDate: '2026-04-10',
    drDrillResult: 'PASSED',
    auditorVerificationProof: 'KPMG Singapore Technology Risk Assurance Report #TR-2026-8821',
    owner: 'Marcus Tan (Head of Payment Switch Operations)'
  },
  {
    id: 'CIS-02',
    systemName: 'Apex Core Banking Multi-Currency Ledger',
    tier: 'Tier 1 - Critical Financial Infrastructure',
    businessFunction: 'Customer Account Balances, Ledger Postings & Interest Calculations',
    hostingModel: 'Multi-Region AWS/GCP',
    declaredRTOHours: 3.0,
    actualDrillRTOHours: 2.6,
    declaredRPOHours: 1.0,
    actualDrillRPOHours: 0.4,
    annualAllowedDowntimeHours: 4.0,
    consumedDowntimeHours: 0.8,
    lastDRDrillDate: '2026-07-22',
    drDrillResult: 'PASSED',
    auditorVerificationProof: 'TÜV SÜD ISO/MAS Independent DR Attestation Cert #DR-7719',
    owner: 'Sophia Tremblay (Core Banking Systems Lead)'
  },
  {
    id: 'CIS-03',
    systemName: 'Institutional Treasury Trading & Liquidity Gateway',
    tier: 'Tier 1 - Critical Financial Infrastructure',
    businessFunction: 'FX Dealing, Money Market Liquidity & Central Bank Reporting',
    hostingModel: 'Hybrid On-Premise & Cloud',
    declaredRTOHours: 4.0,
    actualDrillRTOHours: 3.8,
    declaredRPOHours: 2.0,
    actualDrillRPOHours: 1.6,
    annualAllowedDowntimeHours: 4.0,
    consumedDowntimeHours: 0.0,
    lastDRDrillDate: '2026-06-15',
    drDrillResult: 'PASSED',
    auditorVerificationProof: 'Internal Audit Special Review Paper IA-2026-TRM-04',
    owner: 'Praveen Kumar (Treasury Technology Director)'
  },
  {
    id: 'CIS-04',
    systemName: 'Customer Digital Onboarding & KYC Identity Gateway',
    tier: 'Tier 2 - Important Business System',
    businessFunction: 'Singpass MyInfo Verification & AML Sanctions Screening',
    hostingModel: 'Singapore Sovereign Cloud',
    declaredRTOHours: 6.0,
    actualDrillRTOHours: 4.2,
    declaredRPOHours: 2.0,
    actualDrillRPOHours: 1.1,
    annualAllowedDowntimeHours: 12.0,
    consumedDowntimeHours: 2.1,
    lastDRDrillDate: '2026-05-18',
    drDrillResult: 'PASSED',
    auditorVerificationProof: 'Singpass Integration Security Audit Report 2026',
    owner: 'Rachel Koh (Compliance Tech Operations)'
  }
];

export const MASCriticalSystemsRegister: React.FC = () => {
  const { currentTenant } = useGRC();
  const { showToast } = useToast();

  const [systems, setSystems] = useState<MASCISSystemRegisterItem[]>(INITIAL_CIS_SYSTEMS);
  const [selectedSystem, setSelectedSystem] = useState<MASCISSystemRegisterItem>(INITIAL_CIS_SYSTEMS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTier, setFilterTier] = useState<'ALL' | 'Tier 1' | 'Tier 2'>('ALL');

  // Statutory metrics
  const tier1Systems = systems.filter(s => s.tier.includes('Tier 1'));
  const totalConsumedDowntime = tier1Systems.reduce((acc, s) => acc + s.consumedDowntimeHours, 0);
  const maxCapHours = 4.0;
  const highestDrillRTO = Math.max(...tier1Systems.map(s => s.actualDrillRTOHours));
  const highestDrillRPO = Math.max(...tier1Systems.map(s => s.actualDrillRPOHours));

  const handleExportCISRegister = () => {
    const csvContent = [
      ['System ID', 'System Name', 'Tier', 'Business Function', 'Hosting Model', 'Declared RTO (h)', 'Drill RTO (h)', 'Declared RPO (h)', 'Drill RPO (h)', 'Consumed Downtime (h)', 'MAS 4h Cap Status', 'Last DR Drill', 'Drill Result', 'Auditor Proof', 'System Owner'].join(','),
      ...systems.map(s => [
        `"${s.id}"`,
        `"${s.systemName}"`,
        `"${s.tier}"`,
        `"${s.businessFunction}"`,
        `"${s.hostingModel}"`,
        s.declaredRTOHours,
        s.actualDrillRTOHours,
        s.declaredRPOHours,
        s.actualDrillRPOHours,
        s.consumedDowntimeHours,
        s.consumedDowntimeHours <= 4.0 ? 'COMPLIANT' : 'BREACH',
        `"${s.lastDRDrillDate}"`,
        `"${s.drDrillResult}"`,
        `"${s.auditorVerificationProof}"`,
        `"${s.owner}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MAS_Critical_Information_Systems_Register_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast({
      title: 'CIS Register Exported',
      message: 'MAS TRM Section 5 Critical Systems & RTO/RPO Ledger downloaded as CSV.',
      type: 'success'
    });
  };

  const filteredSystems = systems.filter(s => {
    const matchesSearch = s.systemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.businessFunction.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.owner.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterTier === 'ALL') return matchesSearch;
    return matchesSearch && s.tier.includes(filterTier);
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-sky-950/40 via-slate-900 to-slate-900 border border-sky-800/40 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30 font-mono">
                MAS TRM SECTION 5 • CRITICAL SYSTEMS
              </span>
              <span className="text-xs text-slate-400 font-mono">STATUTORY RTO $\le$ 4H • RPO $\le$ 2H</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Server className="w-6 h-6 text-sky-400" />
              <span>Critical Information Systems (CIS) & RTO/RPO Compliance Register</span>
            </h1>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Mandatory inventory of all systems supporting financial transactions under <strong>MAS TRM Guidelines Section 5</strong>. Enforces maximum <strong>4-hour RTO</strong>, <strong>2-hour RPO</strong>, and tracking against the statutory <strong>4-hour annual unscheduled downtime cap</strong>.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleExportCISRegister}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition flex items-center space-x-2 shadow-lg shadow-sky-600/20"
            >
              <Download className="w-4 h-4" />
              <span>Export CIS Register (CSV)</span>
            </button>
          </div>
        </div>

        {/* 4 Core Regulatory RTO/RPO Metrics */}
        <div className="mt-5 pt-4 border-t border-sky-900/40 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Max Statutory RTO Cap
            </span>
            <div className="text-2xl font-black font-mono text-emerald-400 mt-0.5">
              {highestDrillRTO}h / 4.0h
            </div>
            <span className="text-[10px] text-emerald-400">All Tier-1 Meet MAS 4h Limit</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Max Statutory RPO Benchmark
            </span>
            <div className="text-2xl font-bold text-white font-mono mt-0.5">
              {highestDrillRPO}h / 2.0h
            </div>
            <span className="text-[10px] text-slate-400">Data Loss Interval Protected</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Notice 644 Unscheduled Cap
            </span>
            <div className="text-2xl font-bold text-sky-400 font-mono mt-0.5">
              {totalConsumedDowntime}h / 4.0h
            </div>
            <span className="text-[10px] text-sky-300">Rolling 12-Month Consumption</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Annual DR Drill Verification
            </span>
            <div className="text-xs font-bold text-emerald-400 mt-1">
              100% Passed with Auditor Sign-Off
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              Simulated Failover Drills
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Systems List & Deep Technical Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: System Registry Table (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-sky-400" />
                <span>Tiered Workloads Inventory</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-400">{systems.length} Systems</span>
            </div>

            {/* Filter & Search */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search systems, functions, owners..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex space-x-1">
                {(['ALL', 'Tier 1', 'Tier 2'] as const).map(tier => (
                  <button
                    key={tier}
                    onClick={() => setFilterTier(tier)}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold transition ${
                      filterTier === tier
                        ? 'bg-sky-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {tier}
                  </button>
                ))}
              </div>
            </div>

            {/* Systems Cards */}
            <div className="space-y-2.5">
              {filteredSystems.map(system => {
                const isSelected = selectedSystem.id === system.id;
                const isTier1 = system.tier.includes('Tier 1');

                return (
                  <div
                    key={system.id}
                    onClick={() => setSelectedSystem(system)}
                    className={`p-3.5 rounded-xl border transition cursor-pointer text-left ${
                      isSelected
                        ? 'bg-sky-950/40 border-sky-500/60 shadow-md'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-sky-300">
                        {system.id}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          isTier1
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {isTier1 ? 'Tier 1 CIS' : 'Tier 2'}
                      </span>
                    </div>

                    <div className="font-bold text-xs text-white mt-1">
                      {system.systemName}
                    </div>

                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                      {system.businessFunction}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-2 border-t border-slate-800/80">
                      <span>RTO: <strong className="text-emerald-400 font-mono">{system.actualDrillRTOHours}h</strong> (Cap: {system.declaredRTOHours}h)</span>
                      <span>Downtime Used: <strong className="text-sky-300 font-mono">{system.consumedDowntimeHours}h / 4h</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Detailed CIS Technical Card & Drill Telemetry (7 cols) */}
        <div className="lg:col-span-7">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-sky-950 text-sky-300 border border-sky-800 font-mono">
                    {selectedSystem.id}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {selectedSystem.hostingModel}
                  </span>
                </div>
                <h2 className="text-base font-bold text-white mt-1.5">
                  {selectedSystem.systemName}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selectedSystem.businessFunction}
                </p>
              </div>

              <span
                className={`px-3 py-1 rounded-xl text-xs font-bold ${
                  selectedSystem.tier.includes('Tier 1')
                    ? 'bg-rose-950 text-rose-300 border border-rose-800'
                    : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                }`}
              >
                {selectedSystem.tier.includes('Tier 1') ? 'Tier 1 Critical' : 'Tier 2 Important'}
              </span>
            </div>

            {/* RTO and RPO Comparative Gauges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* RTO Gauge */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Recovery Time (RTO)</span>
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                    Complies with $\le$ 4h
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Achieved in DR Drill:</span>
                    <span className="font-mono font-bold text-emerald-400">{selectedSystem.actualDrillRTOHours} hours</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Internal Declared Target:</span>
                    <span className="font-mono text-slate-300">{selectedSystem.declaredRTOHours} hours</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">MAS Statutory Maximum:</span>
                    <span className="font-mono text-rose-400 font-bold">4.0 hours</span>
                  </div>
                </div>

                {/* Progress bar visual */}
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${(selectedSystem.actualDrillRTOHours / 4.0) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* RPO Gauge */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-sky-400" />
                    <span>Recovery Point (RPO)</span>
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-950 text-sky-300 border border-sky-800">
                    Complies with $\le$ 2h
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Achieved Data Loss Delta:</span>
                    <span className="font-mono font-bold text-sky-300">{selectedSystem.actualDrillRPOHours} hours (9 mins)</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Internal Declared Target:</span>
                    <span className="font-mono text-slate-300">{selectedSystem.declaredRPOHours} hours</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">MAS Statutory Benchmark:</span>
                    <span className="font-mono text-rose-400 font-bold">2.0 hours</span>
                  </div>
                </div>

                {/* Progress bar visual */}
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-sky-500 rounded-full"
                    style={{ width: `${(selectedSystem.actualDrillRPOHours / 2.0) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Annual 4-Hour Unscheduled Downtime Budget */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Notice 644 Annual 4-Hour Downtime Budget</span>
                </h4>
                <span className="font-mono text-xs text-emerald-400 font-bold">
                  {(4.0 - selectedSystem.consumedDowntimeHours).toFixed(1)}h Remaining
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Consumed: <strong>{selectedSystem.consumedDowntimeHours} hours</strong></span>
                  <span>Statutory Threshold: <strong>4.0 hours (Rolling 12 Mo)</strong></span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      selectedSystem.consumedDowntimeHours > 3.0
                        ? 'bg-rose-500'
                        : selectedSystem.consumedDowntimeHours > 2.0
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${(selectedSystem.consumedDowntimeHours / 4.0) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Independent Auditor Verification Workpaper */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Auditor Examination Workpapers & DR Drill Verification
              </h4>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Last Simulated DR Drill:</span>
                  <span className="font-mono font-bold text-white">{selectedSystem.lastDRDrillDate}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Drill Result Status:</span>
                  <span className="font-bold text-emerald-400">{selectedSystem.drDrillResult}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Independent Auditor Verification:</span>
                  <span className="font-mono text-indigo-300 font-bold">{selectedSystem.auditorVerificationProof}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">System Owner (SPOC):</span>
                  <span className="text-white font-semibold">{selectedSystem.owner}</span>
                </div>
              </div>
            </div>

            {/* Chief Implementer Guidance */}
            <div className="p-3 rounded-xl bg-sky-950/30 border border-sky-800/40 text-[11px] text-sky-200 leading-relaxed flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
              <span>
                <strong>Chief Implementer Advisory:</strong> MAS TRM Guidelines Section 5 requires annual disaster recovery testing with third-party auditor attestation. Any unscheduled outage &gt; 4 hours triggers mandatory Section 4 reporting and supervisory intervention.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
