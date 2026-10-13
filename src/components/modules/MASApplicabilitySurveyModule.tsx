import React, { useState } from 'react';
import {
  Building2,
  Server,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Save,
  FileCheck,
  UserCheck,
  Cloud,
  Layers,
  ChevronDown
} from 'lucide-react';
import { useGRC } from '../../context/GRCContext';
import { MASFinancialInstitutionProfile, CriticalInformationSystemRecord } from '../../types/regulatoryTypes';
import { PageContainer } from '../layout/PageContainer';

export const MASApplicabilitySurveyModule: React.FC = () => {
  const { masProfile, updateMASProfile, currentTenant, logAuditEvent } = useGRC();

  const [formData, setFormData] = useState<MASFinancialInstitutionProfile>(masProfile);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [newSystemModal, setNewSystemModal] = useState(false);
  const [newSystem, setNewSystem] = useState<Partial<CriticalInformationSystemRecord>>({
    systemName: '',
    purpose: '',
    hostingModel: 'COMMERCIAL_CLOUD_SG',
    rtoTargetHours: 2,
    rpoTargetHours: 0.5,
    maxAnnualDowntimeHours: 2,
    incidentNotificationSlaMinutes: 60
  });

  const handleSaveProfile = () => {
    updateMASProfile(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleAddCriticalSystem = () => {
    if (!newSystem.systemName) return;
    const system: CriticalInformationSystemRecord = {
      id: `CS-${Date.now().toString().slice(-4)}`,
      systemName: newSystem.systemName || 'Unnamed Critical System',
      purpose: newSystem.purpose || '',
      hostingModel: newSystem.hostingModel || 'COMMERCIAL_CLOUD_SG',
      rtoTargetHours: Number(newSystem.rtoTargetHours) || 4,
      rpoTargetHours: Number(newSystem.rpoTargetHours) || 1,
      maxAnnualDowntimeHours: Number(newSystem.maxAnnualDowntimeHours) || 4,
      incidentNotificationSlaMinutes: 60
    };

    const updatedList = [...(formData.criticalSystemsList || []), system];
    const updatedProfile = {
      ...formData,
      designatedCriticalSystemsCount: updatedList.length,
      criticalSystemsList: updatedList
    };
    setFormData(updatedProfile);
    updateMASProfile(updatedProfile);
    setNewSystemModal(false);
    setNewSystem({
      systemName: '',
      purpose: '',
      hostingModel: 'COMMERCIAL_CLOUD_SG',
      rtoTargetHours: 2,
      rpoTargetHours: 0.5,
      maxAnnualDowntimeHours: 2,
      incidentNotificationSlaMinutes: 60
    });
  };

  const handleDeleteSystem = (id: string) => {
    const updatedList = (formData.criticalSystemsList || []).filter(s => s.id !== id);
    const updatedProfile = {
      ...formData,
      designatedCriticalSystemsCount: updatedList.length,
      criticalSystemsList: updatedList
    };
    setFormData(updatedProfile);
    updateMASProfile(updatedProfile);
  };

  return (
    <PageContainer id="mas-applicability-survey-module">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950/30 to-slate-950 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                MAS Regulatory Applicability & Scoping Engine
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
                Singapore Banking & Payment Services Act
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              MAS Financial Institution Profile & Critical Systems Registry
            </h1>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Designate statutory institution classification, maintain the official register of Critical Information Systems (CIS), and establish binding Recovery Time Objectives (RTO &le; 4h) and Recovery Point Objectives (RPO &le; 1h) under MAS Notice 644/655.
            </p>
          </div>

          <button
            onClick={handleSaveProfile}
            className="px-4 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-rose-950 transition-all cursor-pointer self-start"
          >
            <Save className="w-4 h-4" />
            {saveSuccess ? 'Saved Successfully!' : 'Save & Lock Scoping Profile'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Institution Categorization & Executive Governance */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
              <Building2 className="w-4 h-4 text-rose-400" />
              Statutory FI Classification
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  MAS Institution Category / License Class
                </label>
                <select
                  value={formData.institutionCategory}
                  onChange={(e) => setFormData({ ...formData, institutionCategory: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="BANK_FULL">Licensed Full Bank (Commercial / Retail)</option>
                  <option value="BANK_WHOLESALE">Wholesale Bank / Merchant Bank</option>
                  <option value="MAJOR_PAYMENT_INSTITUTION">Major Payment Institution (MPI - Payment Services Act)</option>
                  <option value="STANDARD_PAYMENT_INSTITUTION">Standard Payment Institution (SPI)</option>
                  <option value="CAPITAL_MARKETS_SERVICES">Capital Markets Services (CMS Licensee / Broker-Dealer)</option>
                  <option value="FINANCE_COMPANY">Licensed Finance Company</option>
                  <option value="INSURER_DIRECT">Direct Life / General Insurer</option>
                  <option value="DIGITAL_PAYMENT_TOKEN">Digital Payment Token (DPT / Crypto Custody Licensee)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Official MAS License / Regulatory Reference No.
                </label>
                <input
                  type="text"
                  value={formData.masLicenseNumber}
                  onChange={(e) => setFormData({ ...formData, masLicenseNumber: e.target.value })}
                  placeholder="e.g. MAS-MPI-2024-SG-0089"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Cloud Infrastructure Adoption Model
                </label>
                <select
                  value={formData.cloudAdoptionModel}
                  onChange={(e) => setFormData({ ...formData, cloudAdoptionModel: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="HYBRID_MULTI_CLOUD">Hybrid Multi-Cloud (AWS Singapore + Azure SG + On-Premises)</option>
                  <option value="PUBLIC_CLOUD_ONLY">100% Commercial Public Cloud (AWS / Azure / GCP)</option>
                  <option value="PRIVATE_CLOUD">Dedicated Private On-Premises Datacenter</option>
                  <option value="ON_PREMISE_DATACENTER">Traditional Co-location Datacenter</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Material Outsourcing Arrangements Count
                </label>
                <input
                  type="number"
                  value={formData.materialOutsourcingArrangementsCount}
                  onChange={(e) => setFormData({ ...formData, materialOutsourcingArrangementsCount: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>
          </div>

          {/* Key Executive Governance Roles */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              Designated Executive Accountabilities
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Chief Information Security Officer (CISO)
                </label>
                <input
                  type="text"
                  value={formData.executiveSponsors.chiefInformationSecurityOfficer}
                  onChange={(e) => setFormData({
                    ...formData,
                    executiveSponsors: { ...formData.executiveSponsors, chiefInformationSecurityOfficer: e.target.value }
                  })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Chief Technology Officer (CTO)
                </label>
                <input
                  type="text"
                  value={formData.executiveSponsors.chiefTechnologyOfficer}
                  onChange={(e) => setFormData({
                    ...formData,
                    executiveSponsors: { ...formData.executiveSponsors, chiefTechnologyOfficer: e.target.value }
                  })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Chief Risk Officer (CRO)
                </label>
                <input
                  type="text"
                  value={formData.executiveSponsors.chiefRiskOfficer}
                  onChange={(e) => setFormData({
                    ...formData,
                    executiveSponsors: { ...formData.executiveSponsors, chiefRiskOfficer: e.target.value }
                  })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Board Technology Committee Chair
                </label>
                <input
                  type="text"
                  value={formData.executiveSponsors.boardTechnologyCommitteeChair}
                  onChange={(e) => setFormData({
                    ...formData,
                    executiveSponsors: { ...formData.executiveSponsors, boardTechnologyCommitteeChair: e.target.value }
                  })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Designated Critical Information Systems (CIS) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Server className="w-4 h-4 text-rose-400" />
                  Designated Critical Information Systems (CIS)
                </h2>
                <span className="text-xs text-slate-400">
                  Systems subject to MAS Notice 644/655 statutory SLAs (RTO &le; 4h, RPO &le; 1h, max 4h unscheduled downtime/yr)
                </span>
              </div>

              <button
                onClick={() => setNewSystemModal(true)}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Critical System
              </button>
            </div>

            {/* List of Critical Systems */}
            <div className="space-y-3">
              {(formData.criticalSystemsList || []).map((sys) => {
                const isRtoCompliant = sys.rtoTargetHours <= 4;
                const isRpoCompliant = sys.rpoTargetHours <= 1;
                const isDowntimeCompliant = sys.maxAnnualDowntimeHours <= 4;

                return (
                  <div
                    key={sys.id}
                    className="p-4 rounded-lg bg-slate-950/80 border border-slate-800/80 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 font-mono text-[10px] font-bold border border-rose-800/60">
                            {sys.id}
                          </span>
                          <h3 className="text-sm font-bold text-white">
                            {sys.systemName}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-400">
                          {sys.purpose}
                        </p>
                      </div>

                      <button
                        onClick={() => handleDeleteSystem(sys.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 transition-colors cursor-pointer"
                        title="Remove system"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* SLA Status Metrics */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-900 text-xs">
                      <div className="bg-slate-900 p-2 rounded border border-slate-800/80">
                        <span className="text-[10px] text-slate-400 block">RTO Target</span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className={`font-mono font-bold ${isRtoCompliant ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {sys.rtoTargetHours} Hours
                          </span>
                          {isRtoCompliant && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                        </div>
                        <span className="text-[9px] text-slate-500">MAS Limit: &le; 4.0h</span>
                      </div>

                      <div className="bg-slate-900 p-2 rounded border border-slate-800/80">
                        <span className="text-[10px] text-slate-400 block">RPO Target</span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className={`font-mono font-bold ${isRpoCompliant ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {sys.rpoTargetHours} Hours
                          </span>
                          {isRpoCompliant && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                        </div>
                        <span className="text-[9px] text-slate-500">MAS Limit: &le; 1.0h</span>
                      </div>

                      <div className="bg-slate-900 p-2 rounded border border-slate-800/80">
                        <span className="text-[10px] text-slate-400 block">Max Annual Downtime</span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className={`font-mono font-bold ${isDowntimeCompliant ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {sys.maxAnnualDowntimeHours} Hours/Yr
                          </span>
                          {isDowntimeCompliant && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                        </div>
                        <span className="text-[9px] text-slate-500">MAS Limit: &le; 4.0h/yr</span>
                      </div>

                      <div className="bg-slate-900 p-2 rounded border border-slate-800/80">
                        <span className="text-[10px] text-slate-400 block">Incident SLA</span>
                        <div className="flex items-center gap-1 mt-0.5 text-amber-400 font-mono font-bold">
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span>60 Mins</span>
                        </div>
                        <span className="text-[9px] text-slate-500">MAS 1-Hour SLA</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Modal to add new critical system */}
          {newSystemModal && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Server className="w-4 h-4 text-rose-400" />
                    Register Critical Information System (CIS)
                  </h3>
                  <button
                    onClick={() => setNewSystemModal(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    &times;
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      System Name *
                    </label>
                    <input
                      type="text"
                      value={newSystem.systemName}
                      onChange={(e) => setNewSystem({ ...newSystem, systemName: e.target.value })}
                      placeholder="e.g. Real-Time Payment Clearing Engine"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Business Purpose & Criticality Justification
                    </label>
                    <textarea
                      value={newSystem.purpose}
                      onChange={(e) => setNewSystem({ ...newSystem, purpose: e.target.value })}
                      rows={2}
                      placeholder="e.g. Processes customer FAST/PayNow fund transfers."
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">RTO Target (Hours)</label>
                      <input
                        type="number"
                        step="0.5"
                        max="4"
                        value={newSystem.rtoTargetHours}
                        onChange={(e) => setNewSystem({ ...newSystem, rtoTargetHours: Number(e.target.value) })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">RPO Target (Hours)</label>
                      <input
                        type="number"
                        step="0.25"
                        max="1"
                        value={newSystem.rpoTargetHours}
                        onChange={(e) => setNewSystem({ ...newSystem, rpoTargetHours: Number(e.target.value) })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Max Downtime (h/yr)</label>
                      <input
                        type="number"
                        step="0.5"
                        max="4"
                        value={newSystem.maxAnnualDowntimeHours}
                        onChange={(e) => setNewSystem({ ...newSystem, maxAnnualDowntimeHours: Number(e.target.value) })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    onClick={() => setNewSystemModal(false)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddCriticalSystem}
                    disabled={!newSystem.systemName}
                    className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-semibold"
                  >
                    Save Critical System
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
};
