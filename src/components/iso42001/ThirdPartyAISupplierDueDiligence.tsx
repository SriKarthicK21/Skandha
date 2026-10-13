import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  AlertOctagon, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Download, 
  Plus, 
  ExternalLink, 
  ChevronRight, 
  X, 
  SlidersHorizontal, 
  FileSpreadsheet, 
  Search, 
  Filter,
  Check,
  AlertTriangle,
  FileCheck2,
  Lock,
  Globe,
  Zap,
  Server
} from 'lucide-react';
import { 
  AISupplierDueDiligenceRecord, 
  INITIAL_AI_SUPPLIER_DILIGENCE_RECORDS,
  AISupplierCheckItem 
} from '../../data/iso42001ExtendedMasterData';

export const ThirdPartyAISupplierDueDiligence: React.FC = () => {
  const [suppliers, setSuppliers] = useState<AISupplierDueDiligenceRecord[]>(INITIAL_AI_SUPPLIER_DILIGENCE_RECORDS);
  const [selectedSupplier, setSelectedSupplier] = useState<AISupplierDueDiligenceRecord | null>(suppliers[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRating, setFilterRating] = useState<string>('ALL');
  const [showNewVendorModal, setShowNewVendorModal] = useState(false);

  // New Vendor Form State
  const [newSupplierName, setNewSupplierName] = useState('');
  const [newServiceName, setNewServiceName] = useState('');
  const [newCategory, setNewCategory] = useState<'Foundation Model API' | 'Cloud AI Platform' | 'Vector DB / Embedding' | 'Open Source Model Vendor'>('Foundation Model API');
  const [newModels, setNewModels] = useState('');
  const [newBusinessOwner, setNewBusinessOwner] = useState('Data Science & Platform Engineering');
  const [newResidency, setNewResidency] = useState('Singapore Local Region (Southeast Asia)');
  const [newZDR, setNewZDR] = useState(true);
  const [newOwnership, setNewOwnership] = useState(true);
  const [newIndemnity, setNewIndemnity] = useState(true);
  const [newSLA, setNewSLA] = useState('99.9%');
  const [newLatency, setNewLatency] = useState('< 350ms');

  // Filtered suppliers
  const filteredSuppliers = suppliers.filter(s => {
    const matchesSearch = s.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.modelFamiliesUsed.some(m => m.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRating = filterRating === 'ALL' || s.riskRating === filterRating;
    return matchesSearch && matchesRating;
  });

  const getRatingBadge = (rating: string) => {
    switch (rating) {
      case 'APPROVED_FOR_PRODUCTION':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Approved for Production</span>
          </span>
        );
      case 'RESTRICTED_PILOT_ONLY':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center space-x-1">
            <AlertTriangle className="w-3 h-3" />
            <span>Restricted Sandbox / Pilot</span>
          </span>
        );
      case 'HIGH_RISK_SUSPENDED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center space-x-1">
            <AlertOctagon className="w-3 h-3" />
            <span>Suspended / Prohibited</span>
          </span>
        );
      default:
        return null;
    }
  };

  const handleToggleCheckStatus = (supplierId: string, checkId: string) => {
    setSuppliers(prev => prev.map(sup => {
      if (sup.id !== supplierId) return sup;
      const updatedChecks = sup.checkItems.map(item => {
        if (item.id !== checkId) return item;
        const nextStatus: 'PASS' | 'FLAGGED' | 'FAIL' = 
          item.status === 'PASS' ? 'FLAGGED' :
          item.status === 'FLAGGED' ? 'FAIL' : 'PASS';
        return { ...item, status: nextStatus };
      });
      
      // Recalculate score
      const passCount = updatedChecks.filter(c => c.status === 'PASS').length;
      const newScore = Math.round((passCount / updatedChecks.length) * 100);
      const newRating = newScore >= 85 ? 'APPROVED_FOR_PRODUCTION' : newScore >= 60 ? 'RESTRICTED_PILOT_ONLY' : 'HIGH_RISK_SUSPENDED';

      const updatedSup = {
        ...sup,
        checkItems: updatedChecks,
        overallScore: newScore,
        riskRating: newRating as any
      };

      if (selectedSupplier?.id === supplierId) {
        setSelectedSupplier(updatedSup);
      }
      return updatedSup;
    }));
  };

  const handleAddVendor = () => {
    if (!newSupplierName.trim()) return;

    const defaultChecks: AISupplierCheckItem[] = [
      {
        id: 'CHK-01',
        name: 'Zero Data Retention (ZDR) Verification',
        description: 'Verifies that prompt and completion payloads are not cached on disk beyond immediate inference.',
        status: newZDR ? 'PASS' : 'FAIL',
        evidenceCitation: 'Executed Enterprise DPA Addendum Section 3.1',
        verifiedAt: new Date().toISOString().split('T')[0],
        notes: newZDR ? 'ZDR confirmed in enterprise addendum' : 'Requires zero-retention contractual amendment'
      },
      {
        id: 'CHK-02',
        name: 'Training Data Exclusion Guarantee',
        description: 'Vendor covenants that customer inputs are not used to train public models.',
        status: newZDR ? 'PASS' : 'FLAGGED',
        evidenceCitation: 'Service Terms & Privacy Addendum',
        verifiedAt: new Date().toISOString().split('T')[0],
        notes: 'Enforced via organization policy'
      },
      {
        id: 'CHK-03',
        name: 'Model Output IP & Weights Ownership',
        description: 'Customer retains full ownership of generated outputs and adapter weights.',
        status: newOwnership ? 'PASS' : 'FLAGGED',
        evidenceCitation: 'Master Services Agreement Section 7.2',
        verifiedAt: new Date().toISOString().split('T')[0],
        notes: newOwnership ? 'Full IP assigned to enterprise' : 'Pending legal IP review'
      },
      {
        id: 'CHK-04',
        name: 'Copyright & Patent Indemnification',
        description: 'Vendor provides indemnity against third-party copyright infringement claims.',
        status: newIndemnity ? 'PASS' : 'FLAGGED',
        evidenceCitation: 'Generative AI Customer Indemnity Addendum',
        verifiedAt: new Date().toISOString().split('T')[0],
        notes: newIndemnity ? 'Standard commercial indemnity active' : 'Indemnity cap under review'
      },
      {
        id: 'CHK-05',
        name: 'Data Residency & Sovereign Boundary',
        description: 'Inference and embeddings restricted to designated sovereign jurisdiction.',
        status: 'PASS',
        evidenceCitation: newResidency,
        verifiedAt: new Date().toISOString().split('T')[0],
        notes: 'Designated local region'
      },
      {
        id: 'CHK-06',
        name: 'SLA Uptime & Latency Guarantees',
        description: 'Availability SLA and maximum latency guarantee.',
        status: 'PASS',
        evidenceCitation: `SLA Agreement: ${newSLA} uptime, p95 ${newLatency}`,
        verifiedAt: new Date().toISOString().split('T')[0],
        notes: 'Financial penalty credits agreed'
      },
      {
        id: 'CHK-07',
        name: 'ISO 42001 Certification & Security Posture',
        description: 'Vendor compliance with ISO 42001:2023 or SOC 2 Type II.',
        status: 'PASS',
        evidenceCitation: 'SOC 2 Type II and ISO 27001 active audit report',
        verifiedAt: new Date().toISOString().split('T')[0],
        notes: 'Annual audit report reviewed'
      }
    ];

    const passCount = defaultChecks.filter(c => c.status === 'PASS').length;
    const score = Math.round((passCount / defaultChecks.length) * 100);

    const newRecord: AISupplierDueDiligenceRecord = {
      id: `SUP-AI-00${suppliers.length + 1}`,
      supplierName: newSupplierName,
      serviceName: newServiceName || `${newSupplierName} API`,
      category: newCategory,
      modelFamiliesUsed: newModels ? newModels.split(',').map(m => m.trim()) : ['Custom Model API'],
      businessOwner: newBusinessOwner,
      contactEmail: `security@${newSupplierName.toLowerCase().replace(/\s+/g, '')}.com`,
      contractRenewalDate: '2027-01-31',
      riskRating: score >= 85 ? 'APPROVED_FOR_PRODUCTION' : score >= 60 ? 'RESTRICTED_PILOT_ONLY' : 'HIGH_RISK_SUSPENDED',
      zeroDataRetention: newZDR,
      trainingExemptionGuaranteed: newZDR,
      outputOwnershipConfirmed: newOwnership,
      ipIndemnificationProvided: newIndemnity,
      dataResidencyOption: newResidency,
      availabilitySla: newSLA,
      p95LatencyGuarantee: newLatency,
      soc2Type2Verified: true,
      iso27001Certified: true,
      iso42001Compliant: true,
      dpaSignedDate: new Date().toISOString().split('T')[0],
      dpaDocumentRef: `DPA-${newSupplierName.toUpperCase().slice(0, 4)}-${new Date().getFullYear()}`,
      overallScore: score,
      lastAuditDate: new Date().toISOString().split('T')[0],
      nextAuditDueDate: '2027-02-01',
      checkItems: defaultChecks
    };

    setSuppliers([newRecord, ...suppliers]);
    setSelectedSupplier(newRecord);
    setShowNewVendorModal(false);

    // Reset form
    setNewSupplierName('');
    setNewServiceName('');
    setNewModels('');
  };

  const handleExportCSV = () => {
    const headers = [
      'Vendor ID',
      'Supplier Name',
      'Service Name',
      'Category',
      'Models Used',
      'Zero Data Retention (ZDR)',
      'Training Exemption',
      'Output IP Ownership',
      'IP Indemnification',
      'Data Residency',
      'Uptime SLA',
      'p95 Latency',
      'Overall Score',
      'Risk Rating',
      'DPA Reference',
      'Last Audit Date'
    ];

    const rows = suppliers.map(s => [
      `"${s.id}"`,
      `"${s.supplierName}"`,
      `"${s.serviceName}"`,
      `"${s.category}"`,
      `"${s.modelFamiliesUsed.join('; ')}"`,
      s.zeroDataRetention ? 'TRUE' : 'FALSE',
      s.trainingExemptionGuaranteed ? 'TRUE' : 'FALSE',
      s.outputOwnershipConfirmed ? 'TRUE' : 'FALSE',
      s.ipIndemnificationProvided ? 'TRUE' : 'FALSE',
      `"${s.dataResidencyOption}"`,
      `"${s.availabilitySla}"`,
      `"${s.p95LatencyGuarantee}"`,
      s.overallScore,
      `"${s.riskRating}"`,
      `"${s.dpaDocumentRef}"`,
      `"${s.lastAuditDate}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ISO42001_ThirdParty_AI_Supplier_Diligence_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div id="ai-supplier-due-diligence-module" className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                ISO/IEC 42001:2023 Annex A.10
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Zero Data Retention (ZDR) Enforced
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-purple-400" />
              <span>Third-Party AI Supplier Due Diligence & ZDR Verification Checklist</span>
            </h2>
            <p className="text-xs text-slate-400 max-w-3xl">
              Mandatory vendor risk management workflow verifying Zero Data Retention (ZDR), customer ownership of model weights and outputs, IP indemnification, and SLA assurances for foundation model providers.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              id="new-vendor-diligence-btn"
              onClick={() => setShowNewVendorModal(true)}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium flex items-center space-x-1.5 shadow-lg shadow-purple-950/40 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Assess New AI Vendor</span>
            </button>
            <button
              id="export-vendor-csv-btn"
              onClick={handleExportCSV}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center space-x-1.5 transition"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Active AI Providers</div>
          <div className="text-2xl font-bold text-white mt-1">{suppliers.length}</div>
          <div className="text-[11px] text-purple-300 mt-0.5">Foundational & Cloud AI Vendors</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">ZDR Guarantee Rate</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">
            {Math.round((suppliers.filter(s => s.zeroDataRetention).length / suppliers.length) * 100)}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Contractual Zero-Retention Executed</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Approved for Production</div>
          <div className="text-2xl font-bold text-sky-400 mt-1">
            {suppliers.filter(s => s.riskRating === 'APPROVED_FOR_PRODUCTION').length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Cleared for Customer Data</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Average Diligence Score</div>
          <div className="text-2xl font-bold text-purple-400 mt-1">
            {Math.round(suppliers.reduce((acc, s) => acc + s.overallScore, 0) / suppliers.length)}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Annex A.10 Readiness Index</div>
        </div>
      </div>

      {/* Main Vendor Explorer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Supplier Roster (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Search & Filter Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search vendor, service, model family..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex items-center space-x-1 overflow-x-auto text-[11px]">
              {['ALL', 'APPROVED_FOR_PRODUCTION', 'RESTRICTED_PILOT_ONLY'].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setFilterRating(rating)}
                  className={`px-2.5 py-1 rounded-lg whitespace-nowrap font-medium transition ${
                    filterRating === rating
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {rating === 'ALL' ? 'All Vendors' : rating === 'APPROVED_FOR_PRODUCTION' ? 'Production' : 'Pilot / Sandbox'}
                </button>
              ))}
            </div>
          </div>

          {/* Supplier Cards List */}
          <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
            {filteredSuppliers.map((supplier) => {
              const isSelected = selectedSupplier?.id === supplier.id;
              return (
                <div
                  key={supplier.id}
                  onClick={() => setSelectedSupplier(supplier)}
                  className={`p-4 rounded-xl border cursor-pointer transition relative ${
                    isSelected
                      ? 'bg-purple-950/20 border-purple-500/60 shadow-lg'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-[10px] text-purple-300 font-mono font-semibold">{supplier.id}</div>
                      <h4 className="text-sm font-bold text-white mt-0.5">{supplier.supplierName}</h4>
                      <p className="text-xs text-slate-400 line-clamp-1">{supplier.serviceName}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-bold text-emerald-400">{supplier.overallScore}%</div>
                      <div className="text-[10px] text-slate-400">Diligence Score</div>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {supplier.modelFamiliesUsed.map((model) => (
                      <span key={model} className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                        {model}
                      </span>
                    ))}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                    <div>{getRatingBadge(supplier.riskRating)}</div>
                    <div className="flex items-center space-x-2 text-[10px] text-slate-400">
                      {supplier.zeroDataRetention && (
                        <span className="flex items-center text-emerald-400 space-x-0.5">
                          <Lock className="w-2.5 h-2.5" />
                          <span>ZDR</span>
                        </span>
                      )}
                      <span>•</span>
                      <span>SLA {supplier.availabilitySla}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Vendor Detail & Interactive Checklist (7 cols) */}
        <div className="lg:col-span-7">
          {selectedSupplier ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
              {/* Vendor Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs text-purple-300 font-semibold">{selectedSupplier.id}</span>
                    <span>•</span>
                    <span className="text-xs text-slate-400">{selectedSupplier.category}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mt-1">{selectedSupplier.supplierName}</h3>
                  <div className="text-xs text-slate-300">{selectedSupplier.serviceName}</div>
                </div>
                <div className="flex flex-col sm:items-end">
                  {getRatingBadge(selectedSupplier.riskRating)}
                  <div className="text-xs text-slate-400 mt-1">
                    Last Audit: <span className="text-slate-200">{selectedSupplier.lastAuditDate}</span>
                  </div>
                </div>
              </div>

              {/* Core Verification Pillars (ZDR, Weights, Indemnity, Residency, SLA) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Zero Data Retention</div>
                  <div className="mt-1 flex items-center space-x-1.5 font-bold text-xs text-emerald-400">
                    <Lock className="w-3.5 h-3.5" />
                    <span>{selectedSupplier.zeroDataRetention ? 'VERIFIED ZDR' : 'NO ZDR'}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Weights & Output IP</div>
                  <div className="mt-1 flex items-center space-x-1.5 font-bold text-xs text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{selectedSupplier.outputOwnershipConfirmed ? '100% OWNED' : 'CONDITIONAL'}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Data Residency</div>
                  <div className="mt-1 flex items-center space-x-1.5 font-bold text-xs text-purple-300 truncate">
                    <Globe className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{selectedSupplier.dataResidencyOption}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Uptime / Latency SLA</div>
                  <div className="mt-1 flex items-center space-x-1.5 font-bold text-xs text-sky-400">
                    <Zap className="w-3.5 h-3.5" />
                    <span>{selectedSupplier.availabilitySla} ({selectedSupplier.p95LatencyGuarantee})</span>
                  </div>
                </div>
              </div>

              {/* DPA & Legal Reference */}
              <div className="bg-purple-950/20 border border-purple-500/30 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
                <div>
                  <div className="font-semibold text-purple-300">Data Processing Addendum (DPA) Status</div>
                  <div className="text-slate-400 mt-0.5">
                    Executed Reference: <span className="font-mono text-white">{selectedSupplier.dpaDocumentRef}</span> (Signed: {selectedSupplier.dpaSignedDate})
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    SOC 2 Type II
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/40">
                    ISO 27001
                  </span>
                  {selectedSupplier.iso42001Compliant && (
                    <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/40">
                      ISO 42001
                    </span>
                  )}
                </div>
              </div>

              {/* Interactive Diligence Checklist Items */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Due Diligence Checklist Verification Points ({selectedSupplier.checkItems.length})
                  </h4>
                  <span className="text-[11px] text-slate-400">Click status badge to toggle (PASS / FLAGGED / FAIL)</span>
                </div>

                <div className="space-y-2.5">
                  {selectedSupplier.checkItems.map((check) => (
                    <div
                      key={check.id}
                      className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/70 hover:border-slate-600 transition space-y-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-xs font-semibold text-white">{check.name}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{check.description}</div>
                        </div>

                        <button
                          onClick={() => handleToggleCheckStatus(selectedSupplier.id, check.id)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1 shrink-0 ${
                            check.status === 'PASS'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                              : check.status === 'FLAGGED'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                          }`}
                        >
                          {check.status === 'PASS' ? <Check className="w-3 h-3" /> :
                           check.status === 'FLAGGED' ? <AlertTriangle className="w-3 h-3" /> :
                           <X className="w-3 h-3" />}
                          <span>{check.status}</span>
                        </button>
                      </div>

                      <div className="pt-2 border-t border-slate-700/50 flex flex-col sm:flex-row sm:items-center sm:justify-between text-[11px] text-slate-400 gap-1">
                        <div className="truncate">
                          <span className="text-slate-500">Evidence Citation:</span>{' '}
                          <span className="text-slate-300 font-mono">{check.evidenceCitation}</span>
                        </div>
                        <div className="text-slate-400 text-[10px] shrink-0">
                          Audited: {check.verifiedAt}
                        </div>
                      </div>

                      {check.notes && (
                        <div className="text-[11px] text-purple-300/90 bg-purple-950/30 p-2 rounded-lg border border-purple-900/40">
                          <span className="font-semibold text-purple-400">Assessor Note:</span> {check.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-12 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-xs">
              Select an AI vendor on the left to inspect due diligence evidence and ZDR assertions.
            </div>
          )}
        </div>
      </div>

      {/* New Vendor Modal */}
      {showNewVendorModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Assess New Third-Party AI Vendor</h3>
                <p className="text-xs text-slate-400">Verify ZDR, IP ownership, and SLA assurances prior to model onboarding.</p>
              </div>
              <button
                onClick={() => setShowNewVendorModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Vendor / Supplier Name</label>
                <input
                  type="text"
                  placeholder="e.g. Cohere Enterprise / Mistral AI"
                  value={newSupplierName}
                  onChange={(e) => setNewSupplierName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Service / API Endpoint</label>
                  <input
                    type="text"
                    placeholder="e.g. Cohere Command R+ Enterprise"
                    value={newServiceName}
                    onChange={(e) => setNewServiceName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Foundation Model API">Foundation Model API</option>
                    <option value="Cloud AI Platform">Cloud AI Platform</option>
                    <option value="Vector DB / Embedding">Vector DB / Embedding</option>
                    <option value="Open Source Model Vendor">Open Source Model Vendor</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Model Families In-Scope (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Command R+, Embed English v3.0"
                  value={newModels}
                  onChange={(e) => setNewModels(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Data Residency Jurisdiction</label>
                  <input
                    type="text"
                    value={newResidency}
                    onChange={(e) => setNewResidency(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Uptime SLA Guarantee</label>
                  <input
                    type="text"
                    value={newSLA}
                    onChange={(e) => setNewSLA(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Critical Checkbox Assurances */}
              <div className="space-y-2 pt-1">
                <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newZDR}
                    onChange={(e) => setNewZDR(e.target.checked)}
                    className="rounded text-purple-600 focus:ring-purple-500 h-4 w-4 bg-slate-800 border-slate-700"
                  />
                  <span>Contractual Zero Data Retention (ZDR) Guaranteed in DPA</span>
                </label>

                <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newOwnership}
                    onChange={(e) => setNewOwnership(e.target.checked)}
                    className="rounded text-purple-600 focus:ring-purple-500 h-4 w-4 bg-slate-800 border-slate-700"
                  />
                  <span>Enterprise owns 100% of Model Outputs & Fine-Tuned Weights</span>
                </label>

                <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newIndemnity}
                    onChange={(e) => setNewIndemnity(e.target.checked)}
                    className="rounded text-purple-600 focus:ring-purple-500 h-4 w-4 bg-slate-800 border-slate-700"
                  />
                  <span>Copyright & Patent Infringement Indemnification Provided</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowNewVendorModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAddVendor}
                disabled={!newSupplierName.trim()}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium shadow-lg shadow-purple-950/40 disabled:opacity-50"
              >
                Register & Initialize Checklist
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
