import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Building2,
  Cloud,
  Layers,
  AlertTriangle,
  Calendar,
  Clock,
  ExternalLink,
  CheckCircle2,
  Check,
  FileText,
  Search,
  Filter,
  ArrowRight,
  TrendingDown,
  Activity,
  Send,
  Zap,
  Lock,
  Globe
} from 'lucide-react';

export interface ThirdPartyVendor {
  id: string;
  name: string;
  serviceType: 'CLOUD_CSP' | 'CORE_BANKING_SW' | 'PAYMENT_RAIL' | 'IDENTITY_SAAS' | 'COLOCATION_DC';
  materialityTier: 'MAS_MATERIAL_OUTSOURCING' | 'STANDARD_TSP';
  cloudHostingRegion: string;
  availabilityZoneDependency: string; // e.g., 'AWS ap-southeast-1a & 1b'
  threatRatingScore: number; // 0-100 (BitSight / SecurityScorecard scale)
  threatRatingGrade: 'A' | 'B' | 'C' | 'D';
  soc2ExpiryDate: string;
  daysToSoc2Expiry: number;
  iso27001ExpiryDate: string;
  contractSlaUptimePct: number;
  currentQuarterAvailabilityPct: number;
  concentrationRiskLevel: 'HIGH_SPOF' | 'MODERATE' | 'LOW';
  hostedWorkloads: string[];
  lastAuditAttestationDate: string;
}

export const Notice658SupplyChainTelemetry: React.FC = () => {
  const [vendors, setVendors] = useState<ThirdPartyVendor[]>([
    {
      id: 'VND-01',
      name: 'Amazon Web Services Singapore (AWS)',
      serviceType: 'CLOUD_CSP',
      materialityTier: 'MAS_MATERIAL_OUTSOURCING',
      cloudHostingRegion: 'Singapore (ap-southeast-1)',
      availabilityZoneDependency: 'ap-southeast-1a & ap-southeast-1b',
      threatRatingScore: 94,
      threatRatingGrade: 'A',
      soc2ExpiryDate: '2026-11-30',
      daysToSoc2Expiry: 64,
      iso27001ExpiryDate: '2027-05-15',
      contractSlaUptimePct: 99.99,
      currentQuarterAvailabilityPct: 99.998,
      concentrationRiskLevel: 'HIGH_SPOF',
      hostedWorkloads: ['Customer Identity Vault', 'Microservices API Gateway', 'Analytics Lake'],
      lastAuditAttestationDate: '2025-11-30'
    },
    {
      id: 'VND-02',
      name: 'SWIFT International Financial Messaging',
      serviceType: 'PAYMENT_RAIL',
      materialityTier: 'MAS_MATERIAL_OUTSOURCING',
      cloudHostingRegion: 'Dedicated On-Prem / Secure Gateway',
      availabilityZoneDependency: 'Dual Encrypted HSM Ring',
      threatRatingScore: 98,
      threatRatingGrade: 'A',
      soc2ExpiryDate: '2026-10-15',
      daysToSoc2Expiry: 18, // <60 days alert!
      iso27001ExpiryDate: '2026-12-31',
      contractSlaUptimePct: 99.999,
      currentQuarterAvailabilityPct: 100,
      concentrationRiskLevel: 'HIGH_SPOF',
      hostedWorkloads: ['MEPS+ Cross-Border Wire Settlement', 'Treasury FX Messaging'],
      lastAuditAttestationDate: '2025-10-15'
    },
    {
      id: 'VND-03',
      name: 'Okta Enterprise Identity Cloud',
      serviceType: 'IDENTITY_SAAS',
      materialityTier: 'MAS_MATERIAL_OUTSOURCING',
      cloudHostingRegion: 'Multi-Tenant AWS Singapore',
      availabilityZoneDependency: 'ap-southeast-1a',
      threatRatingScore: 89,
      threatRatingGrade: 'B',
      soc2ExpiryDate: '2026-10-25',
      daysToSoc2Expiry: 28, // <60 days alert!
      iso27001ExpiryDate: '2027-01-20',
      contractSlaUptimePct: 99.95,
      currentQuarterAvailabilityPct: 99.98,
      concentrationRiskLevel: 'HIGH_SPOF',
      hostedWorkloads: ['Staff Single Sign-On (SSO)', 'Admin FIDO2 MFA Enforcement'],
      lastAuditAttestationDate: '2025-10-25'
    },
    {
      id: 'VND-04',
      name: 'Equinix Singapore Tier 3 Data Center (SG1/SG3)',
      serviceType: 'COLOCATION_DC',
      materialityTier: 'MAS_MATERIAL_OUTSOURCING',
      cloudHostingRegion: 'Physical Changi South & Ayer Rajah',
      availabilityZoneDependency: 'Dual Feed Utility Substations (Tuas/Changi)',
      threatRatingScore: 96,
      threatRatingGrade: 'A',
      soc2ExpiryDate: '2027-03-31',
      daysToSoc2Expiry: 185,
      iso27001ExpiryDate: '2027-04-15',
      contractSlaUptimePct: 99.999,
      currentQuarterAvailabilityPct: 100,
      concentrationRiskLevel: 'MODERATE',
      hostedWorkloads: ['Core Banking MEPS+ Hardware Bastion', 'Primary Ledger SAN'],
      lastAuditAttestationDate: '2026-03-31'
    }
  ]);

  const [selectedVendor, setSelectedVendor] = useState<ThirdPartyVendor>(vendors[0]);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [requestedAttestationVendorId, setRequestedAttestationVendorId] = useState<string | null>(null);

  // Filtered vendors
  const filteredVendors = vendors.filter((v) => {
    if (filterType === 'MATERIAL_ONLY') return v.materialityTier === 'MAS_MATERIAL_OUTSOURCING';
    if (filterType === 'EXPIRING_SOON') return v.daysToSoc2Expiry <= 60;
    if (filterType === 'HIGH_CONCENTRATION') return v.concentrationRiskLevel === 'HIGH_SPOF';
    return true;
  });

  const expiringVendorsCount = vendors.filter((v) => v.daysToSoc2Expiry <= 60).length;
  const highConcentrationCount = vendors.filter((v) => v.concentrationRiskLevel === 'HIGH_SPOF').length;

  const handleTriggerReAttestationRequest = (vendorId: string) => {
    setRequestedAttestationVendorId(vendorId);
    setTimeout(() => {
      setRequestedAttestationVendorId(null);
    }, 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-amber-500/40 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                <Cloud className="w-3.5 h-3.5 text-amber-400" />
                MAS NOTICE 658 &amp; TRM §5 OUTSOURCING OVERSIGHT
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                {expiringVendorsCount} Attestation Expiries in &lt; 60 Days
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-400">
                {highConcentrationCount} High Concentration SPOFs
              </span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>Third-Party, Cloud &amp; Supply Chain Risk Telemetry</span>
            </h3>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Continuous threat scoring and concentration risk monitoring for material Cloud Service Providers (CSPs) and Third-Party Service Providers (TSPs). Features automated 60-day SOC 2 / ISO 27001 expiry watchdogs and single-point-of-failure infrastructure mapping.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1 shadow-inner text-xs">
              <button
                type="button"
                onClick={() => setFilterType('ALL')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  filterType === 'ALL' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                All Providers ({vendors.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('EXPIRING_SOON')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  filterType === 'EXPIRING_SOON' ? 'bg-rose-600 text-white' : 'text-rose-400 hover:text-rose-300'
                }`}
              >
                Expiring (&lt;60d) ({expiringVendorsCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('HIGH_CONCENTRATION')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  filterType === 'HIGH_CONCENTRATION' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Concentration SPOFs
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4 KPI Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Material TSPs</span>
            <Building2 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-white">4</span>
            <span className="text-xs text-amber-400 font-medium">100% In-Scope</span>
          </div>
          <p className="text-[11px] text-slate-400">Classified under MAS Notice 658</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Threat Score Avg</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-emerald-400">94.2</span>
            <span className="text-xs text-slate-400">/ 100 (Grade A)</span>
          </div>
          <p className="text-[11px] text-slate-400">BitSight &amp; SecurityScorecard feed</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-rose-400">SOC 2 Expiries</span>
            <Clock className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-rose-400">{expiringVendorsCount}</span>
            <span className="text-xs text-rose-300 font-medium">&lt; 60 days</span>
          </div>
          <p className="text-[11px] text-slate-400">Automated attestation demand sent</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Concentration SPOF</span>
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-amber-300">{highConcentrationCount}</span>
            <span className="text-xs text-slate-400">Key dependencies</span>
          </div>
          <p className="text-[11px] text-slate-400">AWS SG1 &amp; SWIFT messaging</p>
        </div>
      </div>

      {/* Main Vendor Ledger & Drill-down */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Vendor Cards List */}
        <div className="space-y-3 lg:col-span-2">
          {filteredVendors.map((vendor) => {
            const isSelected = vendor.id === selectedVendor.id;
            const isExpiring = vendor.daysToSoc2Expiry <= 60;
            return (
              <div
                key={vendor.id}
                onClick={() => setSelectedVendor(vendor)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-slate-900 border-amber-500 ring-1 ring-amber-500/50 shadow-lg'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-sky-300 border border-slate-700">
                        {vendor.id}
                      </span>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {vendor.serviceType}
                      </span>
                      {isExpiring && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                          SOC 2 Expires in {vendor.daysToSoc2Expiry} Days
                        </span>
                      )}
                    </div>
                    <h4 className="text-base font-bold text-white pt-0.5">{vendor.name}</h4>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="flex items-baseline justify-end gap-1 font-mono">
                        <span className="text-lg font-bold text-emerald-400">{vendor.threatRatingScore}</span>
                        <span className="text-xs text-slate-400">/ 100</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block">Posture Grade: {vendor.threatRatingGrade}</span>
                    </div>
                  </div>
                </div>

                {/* Infrastructure Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-3 border-t border-slate-800/80 mt-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-semibold">Hosting Region</span>
                    <span className="text-slate-300 font-mono text-[11px] truncate block">{vendor.cloudHostingRegion}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-semibold">AZ Dependency</span>
                    <span className="text-slate-300 font-mono text-[11px] truncate block">{vendor.availabilityZoneDependency}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-semibold">SLA Uptime</span>
                    <span className="text-emerald-400 font-mono font-bold text-[11px]">
                      {vendor.currentQuarterAvailabilityPct}% (SLA: {vendor.contractSlaUptimePct}%)
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Selected Vendor Deep-Dive & Watchdog Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <span className="text-xs font-mono font-bold text-amber-400 block uppercase tracking-wider">
              Selected TSP Profile &bull; {selectedVendor.id}
            </span>
            <h4 className="text-lg font-bold text-white mt-1">{selectedVendor.name}</h4>
            <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {selectedVendor.materialityTier}
            </span>
          </div>

          {/* Concentration Risk Alert */}
          <div className="bg-slate-950/80 rounded-xl p-3.5 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                Concentration Risk Factor
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                selectedVendor.concentrationRiskLevel === 'HIGH_SPOF'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                {selectedVendor.concentrationRiskLevel}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Multiple critical workloads depend on this service provider. MAS TRM §5.2 mandates dual-region failover and exit strategies.
            </p>
            <div className="pt-2 border-t border-slate-800/80">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Material Workloads:</span>
              <div className="flex items-center gap-1 flex-wrap pt-1">
                {selectedVendor.hostedWorkloads.map((w, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 text-sky-300 border border-slate-800"
                  >
                    {w}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Audit Attestation Watchdog */}
          <div className="bg-slate-950/80 rounded-xl p-3.5 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-sky-400" />
                Audit Attestation Watchdog
              </span>
              <span className="font-mono text-slate-400 text-[11px]">
                {selectedVendor.daysToSoc2Expiry} days left
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center bg-slate-900/60 p-2 rounded border border-slate-800">
                <span className="text-slate-400">SOC 2 Type II:</span>
                <span className="font-mono font-bold text-white">{selectedVendor.soc2ExpiryDate}</span>
              </div>
              <div className="flex justify-between items-center bg-slate-900/60 p-2 rounded border border-slate-800">
                <span className="text-slate-400">ISO/IEC 27001:</span>
                <span className="font-mono font-bold text-white">{selectedVendor.iso27001ExpiryDate}</span>
              </div>
            </div>

            {selectedVendor.daysToSoc2Expiry <= 60 && (
              <div className="p-2.5 rounded bg-rose-950/40 border border-rose-500/40 text-[11px] text-rose-300 space-y-1">
                <span className="font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />
                  Attestation Renewal Action Required
                </span>
                <p className="text-[10.5px] text-rose-200/90 leading-tight">
                  Vendor certificate renewal must be secured prior to expiry to satisfy MAS Notice 658 annual third-party verification.
                </p>
              </div>
            )}
          </div>

          {/* Re-Attestation Trigger Button */}
          <button
            type="button"
            onClick={() => handleTriggerReAttestationRequest(selectedVendor.id)}
            disabled={requestedAttestationVendorId === selectedVendor.id}
            className="w-full py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-600 to-teal-600 hover:from-amber-500 hover:to-teal-500 text-white flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            {requestedAttestationVendorId === selectedVendor.id ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Attestation Package Dispatched!</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 text-amber-200" />
                <span>Dispatch SOC 2 Re-Attestation Demand</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
