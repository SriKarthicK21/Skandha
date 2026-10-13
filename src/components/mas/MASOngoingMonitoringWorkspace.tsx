import React, { useState } from 'react';
import {
  Activity,
  Server,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  ShieldCheck,
  Zap,
  HardDrive,
  FileCheck2,
  RefreshCw
} from 'lucide-react';
import { MASCISDowntimeLedger } from './MASCISDowntimeLedger';
import { MASCriticalSystemsRegister } from './MASCriticalSystemsRegister';
import { PageContainer } from '../layout/PageContainer';

interface MASOngoingMonitoringWorkspaceProps {
  onBackToDashboard: () => void;
}

export const MASOngoingMonitoringWorkspace: React.FC<MASOngoingMonitoringWorkspaceProps> = ({
  onBackToDashboard
}) => {
  const [activeTab, setActiveTab] = useState<'downtime_ledger' | 'systems_register'>('downtime_ledger');

  return (
    <PageContainer id="mas-ongoing-monitoring-workspace">
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Top Header Banner */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <button
                  onClick={onBackToDashboard}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Flow</span>
                </button>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Step 9 &bull; Ongoing Telemetry & SLA Monitoring
                </span>
                <span className="text-xs text-slate-400">MAS Notice 644 Statutory Caps</span>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Critical Systems SLA Telemetry & Downtime Ledger
              </h1>
              <p className="text-slate-400 text-sm mt-1 max-w-3xl">
                Statutory operational monitoring under Notice 644 (Technology Risk Management): continuous enforcement of the 4-hour RTO, 4-hour cumulative unscheduled outage cap, and DR drill readiness.
              </p>
            </div>

            {/* Sub-tab Switcher */}
            <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 shrink-0">
              <button
                onClick={() => setActiveTab('downtime_ledger')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'downtime_ledger'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Downtime & DR Ledger</span>
              </button>
              <button
                onClick={() => setActiveTab('systems_register')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'systems_register'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Server className="w-3.5 h-3.5" />
                <span>Critical Systems Inventory</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'downtime_ledger' ? (
          <MASCISDowntimeLedger />
        ) : (
          <MASCriticalSystemsRegister />
        )}
      </div>
    </PageContainer>
  );
};
