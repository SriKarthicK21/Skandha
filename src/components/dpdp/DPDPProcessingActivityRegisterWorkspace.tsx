// ============================================================================
// SKANDA ENTERPRISE GRC: PROCESSING ACTIVITY REGISTER (RoPA) WORKSPACE
// Path: src/components/dpdp/DPDPProcessingActivityRegisterWorkspace.tsx
//
// Canonical Record of Processing Activities (RoPA):
// - Business purpose, lawful-use basis, data elements, principal categories
// - Processors, sub-processors, storage regions, and security safeguards
// - DPIA trigger & score integration
// - Statutory RoPA PDF / Excel Export Engine
// ============================================================================

import React, { useState, useMemo } from 'react';
import {
  Layers,
  Search,
  Filter,
  Shield,
  FileCheck2,
  Building,
  Lock,
  Download,
  Plus,
  CheckCircle2,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { dpdpPrivacyEngineService } from '../../services/canonical/DpdpPrivacyEngineService';
import { DpdpProcessingActivity } from '../../types/dpdpPlatformTypes';

interface DPDPProcessingActivityRegisterWorkspaceProps {
  tenantId: string;
}

export const DPDPProcessingActivityRegisterWorkspace: React.FC<DPDPProcessingActivityRegisterWorkspaceProps> = ({
  tenantId
}) => {
  const [activities, setActivities] = useState<DpdpProcessingActivity[]>(() =>
    dpdpPrivacyEngineService.getProcessingActivities(tenantId)
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedActivity, setSelectedActivity] = useState<DpdpProcessingActivity | null>(null);

  const filtered = useMemo(() => {
    return activities.filter(a =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.businessPurpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.applicableBasis.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [activities, searchTerm]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>Record of Processing Activities (RoPA) Register</span>
          </h2>
          <p className="text-[11px] text-slate-500">
            Authoritative inventory of business processing operations, lawful basis, data elements, and third-party recipients.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search RoPA operations..."
              className="pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none w-56"
            />
          </div>
        </div>
      </div>

      {/* RoPA Cards / Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: RoPA List */}
        <div className="lg:col-span-2 space-y-3">
          {filtered.map(act => (
            <div
              key={act.id}
              onClick={() => setSelectedActivity(act)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                selectedActivity?.id === act.id
                  ? 'bg-indigo-50/70 border-indigo-300 dark:bg-indigo-950/40 dark:border-indigo-800 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{act.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {act.id}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-snug">{act.businessPurpose}</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 whitespace-nowrap">
                  {act.applicableBasis}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase font-bold">Data Principals</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{act.dataPrincipalCategories.join(', ')}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase font-bold">Systems & Stores</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200 truncate block">{act.processingSystems.join(', ')}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase font-bold">DPIA Requirement</span>
                  <span className="font-medium text-indigo-600 dark:text-indigo-400">{act.dpiaRequired ? `Required (${act.dpiaScore}/100)` : 'Standard'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Col: Dossier Drill-down */}
        <div className="space-y-3">
          {selectedActivity ? (
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 sticky top-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center space-x-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Activity Dossier: {selectedActivity.id}</span>
                </h3>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Owner:</span>
                  <div className="font-medium text-slate-900 dark:text-white">{selectedActivity.owner}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Deletion & Retention:</span>
                  <div className="font-medium text-slate-700 dark:text-slate-300">{selectedActivity.deletionRule}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Security Safeguards:</span>
                  <div className="font-medium text-slate-700 dark:text-slate-300">{selectedActivity.securityControls.join(' • ')}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Review SLA:</span>
                  <div className="font-medium text-emerald-600">Every {selectedActivity.reviewFrequencyDays} Days (Next: {selectedActivity.nextReviewDate})</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 text-center text-xs text-slate-400">
              Select a processing activity from the left to view detailed statutory dossier and third-party processors.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
