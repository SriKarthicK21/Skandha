/**
 * SKANDA ENTERPRISE VENDOR 360 WORKSPACE
 * Path: src/components/tprm/Vendor360Workspace.tsx
 */

import React, { useState } from 'react';
import {
  Building,
  ShieldCheck,
  Server,
  FileCheck2,
  Lock,
  Globe2,
  Users,
  Clock,
  Layers,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Sparkles,
  ArrowRight,
  FileText,
  Key,
  Database,
  ExternalLink,
  ShieldAlert,
  Search,
  Plus
} from 'lucide-react';
import { useTprmStore } from '../../stores/useTprmStore';
import { useGRC } from '../../context/GRCContext';
import { useToast } from '../common/ToastContainer';
import { VendorLifecycleStatus } from '../../types/tprmTypes';
import { PERMITTED_LIFECYCLE_TRANSITIONS } from '../../data/tprmMasterData';

export const Vendor360Workspace: React.FC = () => {
  const { theme } = useGRC();
  const { showToast } = useToast();
  const {
    vendors,
    selectedVendor,
    selectedVendorId,
    setSelectedVendorId,
    actions: { transitionVendorLifecycle, recalculateVendorRisk, addVendor }
  } = useTprmStore();

  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'relationship' | 'tech_data' | 'assurance' | 'lifecycle'>('profile');
  const [searchTerm, setSearchTerm] = useState('');
  const [targetStatus, setTargetStatus] = useState<VendorLifecycleStatus | ''>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newVendorName, setNewVendorName] = useState('');
  const [newVendorCategory, setNewVendorCategory] = useState('SAAS_COLLABORATION');

  const isLight = theme === 'light';

  if (!selectedVendor) {
    return (
      <div className="p-8 text-center text-slate-400">
        <Building className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>No vendor records found in this tenant.</p>
      </div>
    );
  }

  const allowedTransitions = PERMITTED_LIFECYCLE_TRANSITIONS[selectedVendor.lifecycleStatus] || [];

  const handleTransitionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetStatus) return;

    const result = transitionVendorLifecycle(selectedVendor.id, targetStatus);
    if (result.success) {
      showToast({
        title: 'Lifecycle Status Updated',
        message: result.message,
        type: 'success'
      });
      setTargetStatus('');
    } else {
      showToast({
        title: 'Transition Blocked by Governance Guard',
        message: result.message,
        type: 'error'
      });
    }
  };

  const handleRecalculateRisk = () => {
    const snapshot = recalculateVendorRisk(selectedVendor.id, 'Risk Assessor (User)');
    if (snapshot) {
      showToast({
        title: '14-Factor Risk Recalculated',
        message: `Updated Inherent: ${snapshot.inherentRiskScore}/25 | Residual: ${snapshot.residualRiskScore}/25`,
        type: 'info'
      });
    }
  };

  const handleAddVendorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendorName.trim()) return;

    const created = addVendor({
      profile: {
        legalName: newVendorName,
        tradingName: newVendorName,
        vendorIdentifier: `VND-NEW`,
        legalEntityJurisdiction: 'Singapore (SG)',
        headquartersAddress: 'Singapore Office',
        industryCategory: newVendorCategory as any,
        websiteUrl: 'https://example.com',
        keyContacts: {
          relationshipOwner: { name: 'IT Lead', email: 'it@acmegrc.internal', role: 'IT Manager' },
          businessSponsor: { name: 'Sponsor', email: 'sponsor@acmegrc.internal', department: 'Operations' },
          procurementOwner: { name: 'Procurement', email: 'procurement@acmegrc.internal' },
          securityContact: { name: 'Security Contact', email: 'sec@vendor.com' },
          privacyOfficer: { name: 'DPO', email: 'dpo@vendor.com' },
          contractSignatory: { name: 'Legal', email: 'legal@acmegrc.internal' }
        }
      }
    });

    setShowAddModal(false);
    setNewVendorName('');
    showToast({
      title: 'Vendor Onboarded',
      message: `${created.profile.legalName} added to TPRM inventory in VENDOR_REGISTRATION state.`,
      type: 'success'
    });
  };

  const filteredVendors = vendors.filter(
    v =>
      v.profile.legalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.profile.industryCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.vendorCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* 1. Vendor Selection Strip & Search */}
      <div
        className={`p-4 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}
      >
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search vendor by name or ID..."
            className={`w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-sky-500/30 ${
              isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
            }`}
          />
        </div>

        {/* Vendor Pills Carousel */}
        <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {filteredVendors.map(v => (
            <button
              key={v.id}
              onClick={() => setSelectedVendorId(v.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center space-x-1.5 ${
                selectedVendorId === v.id
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-900/20'
                  : isLight
                  ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <span>{v.profile.tradingName || v.profile.legalName}</span>
              <span className="text-[10px] opacity-75 font-mono">({v.latestRiskSnapshot.residualRiskScore}/25)</span>
            </button>
          ))}

          <button
            onClick={() => setShowAddModal(true)}
            className="p-1.5 rounded-xl border border-dashed border-sky-500/50 hover:bg-sky-500/10 text-sky-400 text-xs font-bold flex items-center space-x-1 shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* 2. Vendor Header Card with Live Status & Quick Action */}
      <div
        className={`p-6 rounded-2xl border transition ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="p-3 rounded-2xl bg-sky-500/15 text-sky-400">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className={`text-xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {selectedVendor.profile.legalName}
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded border bg-slate-500/15 text-slate-400 border-slate-500/30">
                  {selectedVendor.vendorCode} • {selectedVendor.profile.industryCategory}
                </span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold border bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
                  Lifecycle: {selectedVendor.lifecycleStatus}
                </span>
              </div>
              <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                {selectedVendor.relationship.servicesProvidedSummary}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 shrink-0">
            <button
              onClick={handleRecalculateRisk}
              className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                isLight ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-300' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              <RotateCw className="w-3.5 h-3.5 text-sky-400" />
              <span>Recalculate 14-Factor Risk</span>
            </button>
          </div>
        </div>

        {/* 4 Score Summary Blocks */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/60 border-slate-700/60'}`}>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Inherent Risk</span>
            <div className="text-lg font-black text-rose-500 mt-0.5">
              {selectedVendor.latestRiskSnapshot.inherentRiskScore} / 25
            </div>
            <span className="text-[10px] text-slate-400">Likelihood {selectedVendor.latestRiskSnapshot.inherentLikelihood} &times; Impact {selectedVendor.latestRiskSnapshot.inherentImpact}</span>
          </div>

          <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/60 border-slate-700/60'}`}>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Control Mitigating Score</span>
            <div className="text-lg font-black text-emerald-500 mt-0.5">
              {selectedVendor.latestRiskSnapshot.combinedControlEffectiveness}%
            </div>
            <span className="text-[10px] text-slate-400">ISO/SOC2/Telemetry</span>
          </div>

          <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/60 border-slate-700/60'}`}>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Residual Risk</span>
            <div className={`text-lg font-black mt-0.5 ${selectedVendor.latestRiskSnapshot.residualRiskScore > 8 ? 'text-amber-500' : 'text-emerald-500'}`}>
              {selectedVendor.latestRiskSnapshot.residualRiskScore} / 25
            </div>
            <span className="text-[10px] text-slate-400">Appetite: {selectedVendor.latestRiskSnapshot.isOutsideAppetite ? 'OUTSIDE (>8)' : 'WITHIN (≤8)'}</span>
          </div>

          <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/60 border-slate-700/60'}`}>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Assurance Confidence</span>
            <div className="text-lg font-black text-indigo-400 mt-0.5">
              {selectedVendor.latestRiskSnapshot.confidenceScorePercent}%
            </div>
            <span className="text-[10px] text-slate-400">{selectedVendor.latestRiskSnapshot.evidenceCompletenessPercent}% Evidence Completeness</span>
          </div>
        </div>
      </div>

      {/* 3. Sub-Navigation Tabs */}
      <div className={`flex items-center space-x-2 border-b overflow-x-auto pb-1 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
        <button
          onClick={() => setActiveSubTab('profile')}
          className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition border-b-2 flex items-center space-x-1.5 whitespace-nowrap ${
            activeSubTab === 'profile'
              ? 'border-sky-500 text-sky-400 bg-sky-500/10'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>A. Organization Profile & Contacts</span>
        </button>

        <button
          onClick={() => setActiveSubTab('relationship')}
          className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition border-b-2 flex items-center space-x-1.5 whitespace-nowrap ${
            activeSubTab === 'relationship'
              ? 'border-sky-500 text-sky-400 bg-sky-500/10'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Globe2 className="w-3.5 h-3.5" />
          <span>B. Business Relationship & Criticality</span>
        </button>

        <button
          onClick={() => setActiveSubTab('tech_data')}
          className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition border-b-2 flex items-center space-x-1.5 whitespace-nowrap ${
            activeSubTab === 'tech_data'
              ? 'border-sky-500 text-sky-400 bg-sky-500/10'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>C. Technology & Data Access</span>
        </button>

        <button
          onClick={() => setActiveSubTab('assurance')}
          className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition border-b-2 flex items-center space-x-1.5 whitespace-nowrap ${
            activeSubTab === 'assurance'
              ? 'border-sky-500 text-sky-400 bg-sky-500/10'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>D. Assurance Profile & SHA-256 Proofs</span>
        </button>

        <button
          onClick={() => setActiveSubTab('lifecycle')}
          className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition border-b-2 flex items-center space-x-1.5 whitespace-nowrap ${
            activeSubTab === 'lifecycle'
              ? 'border-sky-500 text-sky-400 bg-sky-500/10'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>E. 17-Stage Lifecycle Manager</span>
        </button>
      </div>

      {/* 4. Tab Content Area */}
      {/* Sub-Tab 1: Profile & Key Contacts */}
      {activeSubTab === 'profile' && (
        <div className={`p-6 rounded-2xl border space-y-6 ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-3">
              <h3 className={`text-sm font-bold border-b pb-2 ${isLight ? 'text-slate-900 border-slate-200' : 'text-white border-slate-800'}`}>
                Entity Registration & Jurisdiction
              </h3>
              <div>
                <span className="text-slate-400 block">Legal Entity Name:</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">{selectedVendor.profile.legalName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Jurisdiction:</span>
                <span className="font-mono text-slate-300">{selectedVendor.profile.legalEntityJurisdiction}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Tax Identifier (EIN/UEN):</span>
                <span className="font-mono text-slate-300">{selectedVendor.profile.taxIdentifier || 'UEN-PENDING'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Headquarters Address:</span>
                <span className="text-slate-300 leading-relaxed">{selectedVendor.profile.headquartersAddress}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Official Website:</span>
                <a href={selectedVendor.profile.websiteUrl} target="_blank" rel="noreferrer" className="text-sky-400 hover:underline flex items-center space-x-1">
                  <span>{selectedVendor.profile.websiteUrl}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className={`text-sm font-bold border-b pb-2 ${isLight ? 'text-slate-900 border-slate-200' : 'text-white border-slate-800'}`}>
                Enterprise Stakeholders & Contacts
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/60 border-slate-700'}`}>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Relationship Owner</span>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">{selectedVendor.profile.keyContacts.relationshipOwner.name}</div>
                  <span className="text-[10px] text-slate-400 font-mono">{selectedVendor.profile.keyContacts.relationshipOwner.email}</span>
                </div>

                <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/60 border-slate-700'}`}>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Business Sponsor</span>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">{selectedVendor.profile.keyContacts.businessSponsor.name}</div>
                  <span className="text-[10px] text-slate-400 font-mono">{selectedVendor.profile.keyContacts.businessSponsor.department}</span>
                </div>

                <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/60 border-slate-700'}`}>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Security Contact</span>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">{selectedVendor.profile.keyContacts.securityContact.name}</div>
                  <span className="text-[10px] text-slate-400 font-mono">{selectedVendor.profile.keyContacts.securityContact.email}</span>
                </div>

                <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/60 border-slate-700'}`}>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Privacy / DPO Contact</span>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">{selectedVendor.profile.keyContacts.privacyOfficer.name}</div>
                  <span className="text-[10px] text-slate-400 font-mono">{selectedVendor.profile.keyContacts.privacyOfficer.email}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 2: Business Relationship & Criticality */}
      {activeSubTab === 'relationship' && (
        <div className={`p-6 rounded-2xl border space-y-6 ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-3">
              <h3 className={`text-sm font-bold border-b pb-2 ${isLight ? 'text-slate-900 border-slate-200' : 'text-white border-slate-800'}`}>
                Service Scope & Business Criticality
              </h3>
              <div>
                <span className="text-slate-400 block">Criticality Tier:</span>
                <span className="text-rose-400 font-black text-sm">{selectedVendor.relationship.criticalityTier}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Critical Business Services Affected:</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {selectedVendor.relationship.criticalBusinessServicesAffected.length > 0 ? (
                    selectedVendor.relationship.criticalBusinessServicesAffected.map(cbs => (
                      <span key={cbs} className="px-2 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30 font-mono text-[10px]">
                        {cbs}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 italic">None designated</span>
                  )}
                </div>
              </div>
              <div>
                <span className="text-slate-400 block">Supported Business Functions:</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {selectedVendor.relationship.businessFunctionsSupported.map(fn => (
                    <span key={fn} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px]">
                      {fn}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className={`text-sm font-bold border-b pb-2 ${isLight ? 'text-slate-900 border-slate-200' : 'text-white border-slate-800'}`}>
                Substitutability & Exit Governance
              </h3>
              <div>
                <span className="text-slate-400 block">Substitutability Rating:</span>
                <span className="text-amber-400 font-bold">{selectedVendor.relationship.substitutabilityRating}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Alternative Suppliers Identified:</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {selectedVendor.relationship.alternativeSupplierNames.map(alt => (
                    <span key={alt} className="px-2 py-0.5 rounded bg-sky-500/15 text-sky-300 border border-sky-500/30 text-[10px]">
                      {alt}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-slate-400 block">Exit Strategy & Transition Window:</span>
                <span className="text-slate-300 font-mono">{selectedVendor.relationship.exitTransitionPeriodDays} Days contractually committed</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 3: Technology & Data Access */}
      {activeSubTab === 'tech_data' && (
        <div className={`p-6 rounded-2xl border space-y-6 ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-3">
              <h3 className={`text-sm font-bold border-b pb-2 ${isLight ? 'text-slate-900 border-slate-200' : 'text-white border-slate-800'}`}>
                Data Classifications & Privacy Scope
              </h3>
              <div>
                <span className="text-slate-400 block">Data Classifications Ingested:</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {selectedVendor.technologyAndData.dataClassificationsProcessed.map(dc => (
                    <span key={dc} className="px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-mono text-[10px]">
                      {dc}
                    </span>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div>
                  <span className="text-slate-400 block">Personal Data (PII):</span>
                  <strong className={selectedVendor.technologyAndData.personalDataInvolvement ? 'text-rose-400' : 'text-emerald-400'}>
                    {selectedVendor.technologyAndData.personalDataInvolvement ? 'YES (DPA Required)' : 'NO'}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Privileged Access:</span>
                  <strong className={selectedVendor.technologyAndData.privilegedAccessGranted ? 'text-rose-400' : 'text-emerald-400'}>
                    {selectedVendor.technologyAndData.privilegedAccessGranted ? 'YES' : 'NO'}
                  </strong>
                </div>
              </div>
              <div>
                <span className="text-slate-400 block">Data Retention Policy:</span>
                <span className="font-mono text-slate-300">{selectedVendor.technologyAndData.dataRetentionPeriod}</span>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className={`text-sm font-bold border-b pb-2 ${isLight ? 'text-slate-900 border-slate-200' : 'text-white border-slate-800'}`}>
                Hosting Architecture & Subprocessors
              </h3>
              <div>
                <span className="text-slate-400 block">Cloud Hosting Environment:</span>
                <span className="text-sky-400 font-bold">{selectedVendor.technologyAndData.hostingEnvironment}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Primary Storage Locations:</span>
                <span className="text-slate-300 font-mono">{selectedVendor.technologyAndData.primaryStorageLocations.join(', ')}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Direct Fourth-Party Subprocessors:</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {selectedVendor.technologyAndData.directSubprocessors.map(sp => (
                    <span key={sp} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px]">
                      {sp}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 4: Assurance Profile & SHA-256 Proofs */}
      {activeSubTab === 'assurance' && (
        <div className={`p-6 rounded-2xl border space-y-6 ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
          <div className="space-y-4">
            <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Certifications & SOC Assurance Proofs with Cryptographic Seals
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* ISO Certifications */}
              {selectedVendor.assuranceProfile.certifications.map(cert => (
                <div
                  key={cert.certificateNumber}
                  className={`p-4 rounded-xl border space-y-2 ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/60 border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold text-sky-400">{cert.standard}</span>
                      <div className="text-[11px] text-slate-400 font-mono">Cert: {cert.certificateNumber} • {cert.accreditationBody}</div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                      {cert.assuranceTier}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">{cert.scopeSummary}</p>
                  <div className="text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-700/60 flex items-center justify-between">
                    <span>Valid: {cert.validFrom} to {cert.validTo}</span>
                    <span title={cert.sha256Seal}>Seal: {cert.sha256Seal.slice(0, 12)}...</span>
                  </div>
                </div>
              ))}

              {/* SOC Reports */}
              {selectedVendor.assuranceProfile.socReports.map(soc => (
                <div
                  key={soc.reportingPeriodEnd}
                  className={`p-4 rounded-xl border space-y-2 ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/60 border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold text-indigo-400">{soc.reportType}</span>
                      <div className="text-[11px] text-slate-400 font-mono">Auditor: {soc.auditingFirm}</div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                      {soc.auditorOpinion}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300">
                    Criteria: {soc.trustServicesCriteria.join(', ')}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-700/60 flex items-center justify-between">
                    <span>Period: {soc.reportingPeriodStart} to {soc.reportingPeriodEnd}</span>
                    <span title={soc.sha256Seal}>Seal: {soc.sha256Seal.slice(0, 12)}...</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 5: 17-Stage Lifecycle State Machine */}
      {activeSubTab === 'lifecycle' && (
        <div className={`p-6 rounded-2xl border space-y-6 ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
          <div>
            <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              17-Stage Enterprise TPRM Lifecycle State Machine
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Auditable lifecycle governance driven by business transition guards and segregation of duties.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-sky-500/30 bg-sky-500/10 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400">Current Status:</span>
              <div className="text-base font-black text-sky-400">{selectedVendor.lifecycleStatus}</div>
            </div>
            <span className="text-xs font-mono text-slate-300">Version: v{selectedVendor.version}</span>
          </div>

          {/* Transition Form */}
          <form onSubmit={handleTransitionSubmit} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5">
                Permitted Target Lifecycle States:
              </label>
              <select
                value={targetStatus}
                onChange={e => setTargetStatus(e.target.value as VendorLifecycleStatus)}
                className={`w-full p-2.5 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-sky-500/30 ${
                  isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
                }`}
              >
                <option value="">Select Permitted Target State...</option>
                {allowedTransitions.map(st => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={!targetStatus}
              className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center space-x-2"
            >
              <span>Execute Governance Transition</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Add Vendor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className={`rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-700'
            }`}
          >
            <h3 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Onboard Third-Party Vendor
            </h3>

            <form onSubmit={handleAddVendorSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Vendor Legal Name</label>
                <input
                  type="text"
                  required
                  value={newVendorName}
                  onChange={e => setNewVendorName(e.target.value)}
                  placeholder="e.g. Snowflake Computing Singapore Pte Ltd"
                  className={`w-full p-2.5 rounded-xl border focus:outline-none ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
                  }`}
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Service Category</label>
                <select
                  value={newVendorCategory}
                  onChange={e => setNewVendorCategory(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
                  }`}
                >
                  <option value="CLOUD_INFRASTRUCTURE">Cloud Infrastructure</option>
                  <option value="SAAS_COLLABORATION">SaaS Collaboration</option>
                  <option value="PAYMENT_GATEWAY_FINTECH">Payment Gateway / Fintech</option>
                  <option value="MANAGED_SECURITY_MSSP">Managed Security / MSSP</option>
                  <option value="DATA_ANALYTICS_AI">Data Analytics / AI</option>
                  <option value="DEVELOPER_TOOLS_DEVOPS">Developer Tools / DevOps</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-700/60">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold"
                >
                  Save & Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
