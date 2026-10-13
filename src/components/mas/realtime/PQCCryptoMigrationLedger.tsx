import React, { useState } from 'react';
import {
  Key,
  Lock,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Cpu,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Search,
  Filter,
  ExternalLink,
  Flame,
  Check,
  Sliders,
  Database
} from 'lucide-react';

export type QuantumGrading = 'QUANTUM_VULNERABLE' | 'QUANTUM_RESILIENT' | 'NIST_PQC_READY';

export interface CryptoAssetItem {
  id: string;
  assetName: string;
  systemCategory: 'SWIFT_MEPS_PAYMENT' | 'CUSTOMER_EBANKING_TLS' | 'DATABASE_TDE' | 'HSM_KEY_VAULT' | 'API_GATEWAY';
  currentAlgorithm: string;
  keyLength: string;
  pqcGrade: QuantumGrading;
  hndlExposureRisk: 'CRITICAL' | 'HIGH' | 'LOW'; // Harvest Now, Decrypt Later
  targetPqcStandard: string;
  masMigrationMilestone: string;
  status: 'PENDING_MIGRATION' | 'PILOT_HYBRID_ACTIVE' | 'MIGRATED_PQC';
  lastScanned: string;
}

export const PQCCryptoMigrationLedger: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'INVENTORY' | 'TIMELINE' | 'STANDARDS'>('INVENTORY');
  const [selectedGrade, setSelectedGrade] = useState<'ALL' | QuantumGrading>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUpgradingId, setIsUpgradingId] = useState<string | null>(null);

  const [cryptoAssets, setCryptoAssets] = useState<CryptoAssetItem[]>([
    {
      id: 'CRYPTO-01',
      assetName: 'SWIFT Alliance Gateway ISO 20022 Signature Cluster',
      systemCategory: 'SWIFT_MEPS_PAYMENT',
      currentAlgorithm: 'RSA-2048 (PKCS#1 v1.5)',
      keyLength: '2048-bit',
      pqcGrade: 'QUANTUM_VULNERABLE',
      hndlExposureRisk: 'CRITICAL',
      targetPqcStandard: 'FIPS 204 ML-DSA-65 (Dilithium-3)',
      masMigrationMilestone: 'Q2 2027 (Statutory Interbank Cap)',
      status: 'PENDING_MIGRATION',
      lastScanned: '2 hours ago'
    },
    {
      id: 'CRYPTO-02',
      assetName: 'Customer Internet Banking TLS Reverse Proxy Edge',
      systemCategory: 'CUSTOMER_EBANKING_TLS',
      currentAlgorithm: 'ECDHE-ECDSA-AES256-GCM-SHA384 (secp256r1)',
      keyLength: '256-bit ECC',
      pqcGrade: 'QUANTUM_VULNERABLE',
      hndlExposureRisk: 'HIGH',
      targetPqcStandard: 'Hybrid X25519 + ML-KEM-768 (FIPS 203)',
      masMigrationMilestone: 'Q4 2026 (Recommended Pilot)',
      status: 'PILOT_HYBRID_ACTIVE',
      lastScanned: '10 mins ago'
    },
    {
      id: 'CRYPTO-03',
      assetName: 'Core Banking Postgres DB Column Encryption (PII Vault)',
      systemCategory: 'DATABASE_TDE',
      currentAlgorithm: 'AES-256-GCM with RSA-4096 Master Key Wrap',
      keyLength: '256-bit AES / 4096-bit RSA',
      pqcGrade: 'QUANTUM_VULNERABLE',
      hndlExposureRisk: 'CRITICAL',
      targetPqcStandard: 'AES-256-GCM + ML-KEM-1024 Envelope Wrapping',
      masMigrationMilestone: 'Q1 2028',
      status: 'PENDING_MIGRATION',
      lastScanned: '1 hour ago'
    },
    {
      id: 'CRYPTO-04',
      assetName: 'Hardware Security Module (Thales Luna HSM Partition 4)',
      systemCategory: 'HSM_KEY_VAULT',
      currentAlgorithm: 'FIPS 203 ML-KEM & ML-DSA Firmware Patch v10.4',
      keyLength: 'Post-Quantum Lattice',
      pqcGrade: 'NIST_PQC_READY',
      hndlExposureRisk: 'LOW',
      targetPqcStandard: 'NIST FIPS 203/204 Standard Compliant',
      masMigrationMilestone: 'Completed',
      status: 'MIGRATED_PQC',
      lastScanned: '3 mins ago'
    },
    {
      id: 'CRYPTO-05',
      assetName: 'Open Banking Public API Gateway (MAS APIX Gateway)',
      systemCategory: 'API_GATEWAY',
      currentAlgorithm: 'ECDSA P-384 with SHA-384',
      keyLength: '384-bit ECC',
      pqcGrade: 'QUANTUM_VULNERABLE',
      hndlExposureRisk: 'HIGH',
      targetPqcStandard: 'Hybrid ML-DSA + ECDSA dual-signed JWTs',
      masMigrationMilestone: 'Q3 2027',
      status: 'PENDING_MIGRATION',
      lastScanned: '25 mins ago'
    },
    {
      id: 'CRYPTO-06',
      assetName: 'Inter-Datacenter Synchronous Replication IPsec Tunnel',
      systemCategory: 'SWIFT_MEPS_PAYMENT',
      currentAlgorithm: 'AES-256-GCM (IKEv2 with Pre-Shared Key)',
      keyLength: '256-bit Symmetric',
      pqcGrade: 'QUANTUM_RESILIENT',
      hndlExposureRisk: 'LOW',
      targetPqcStandard: 'Post-Quantum Pre-Shared Key (RFC 8784)',
      masMigrationMilestone: 'Q2 2028',
      status: 'PILOT_HYBRID_ACTIVE',
      lastScanned: '5 mins ago'
    }
  ]);

  // Simulate upgrade to PQC
  const handleUpgradeToPQC = (id: string) => {
    setIsUpgradingId(id);
    setTimeout(() => {
      setCryptoAssets(prev =>
        prev.map(item => {
          if (item.id === id) {
            return {
              ...item,
              currentAlgorithm: item.targetPqcStandard,
              pqcGrade: 'NIST_PQC_READY',
              hndlExposureRisk: 'LOW',
              status: 'MIGRATED_PQC',
              lastScanned: 'Just now (Upgraded)'
            };
          }
          return item;
        })
      );
      setIsUpgradingId(null);
    }, 1200);
  };

  const filteredAssets = cryptoAssets.filter(item => {
    if (selectedGrade !== 'ALL' && item.pqcGrade !== selectedGrade) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.assetName.toLowerCase().includes(q) ||
        item.currentAlgorithm.toLowerCase().includes(q) ||
        item.targetPqcStandard.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalAssets = cryptoAssets.length;
  const vulnerableCount = cryptoAssets.filter(a => a.pqcGrade === 'QUANTUM_VULNERABLE').length;
  const resilientCount = cryptoAssets.filter(a => a.pqcGrade === 'QUANTUM_RESILIENT').length;
  const pqcReadyCount = cryptoAssets.filter(a => a.pqcGrade === 'NIST_PQC_READY').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border border-emerald-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                MAS Post-Quantum Cryptography (PQC) Readiness
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-rose-500/10 text-rose-400 border border-rose-500/30">
                Q-DAY AGILITY MANDATE
              </span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Post-Quantum Cryptography Migration & Asset Ledger
            </h2>
            <p className="text-sm text-slate-300 max-w-3xl mt-1 leading-relaxed">
              Supervisory catalog of cryptographic algorithms across interbank payment gateways, core databases, and TLS endpoints.
              Mitigate "Harvest Now, Decrypt Later" (HNDL) exposure and track migration burn-down towards NIST FIPS 203/204/205 standards.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="bg-slate-950/80 border border-emerald-500/30 rounded-xl p-3 text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                PQC Readiness Index
              </span>
              <div className="text-2xl font-bold font-mono text-emerald-300">
                {Math.round(((pqcReadyCount + resilientCount * 0.5) / totalAssets) * 100)}%
                <span className="text-xs text-slate-400 font-normal font-sans ml-1">
                  ({pqcReadyCount}/{totalAssets} Ready)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Breakdown Gauges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-800/80">
          <div className="bg-slate-950/80 border border-rose-500/30 rounded-xl p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-rose-400 font-bold uppercase tracking-wider">Quantum Vulnerable</span>
              <span className="font-mono font-bold text-rose-300">{vulnerableCount} Assets</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              RSA-2048 & ECDSA vulnerable to Shor's algorithm (Urgent Migration)
            </p>
          </div>

          <div className="bg-slate-950/80 border border-amber-500/30 rounded-xl p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-amber-400 font-bold uppercase tracking-wider">Quantum Resilient</span>
              <span className="font-mono font-bold text-amber-300">{resilientCount} Assets</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              AES-256 symmetric cipher suites resilient against Grover's algorithm
            </p>
          </div>

          <div className="bg-slate-950/80 border border-emerald-500/30 rounded-xl p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-emerald-400 font-bold uppercase tracking-wider">NIST PQC Standardized</span>
              <span className="font-mono font-bold text-emerald-300">{pqcReadyCount} Assets</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              FIPS 203 (ML-KEM/Kyber) & FIPS 204 (ML-DSA/Dilithium) active
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedGrade('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
              selectedGrade === 'ALL' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            All Algorithms ({cryptoAssets.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedGrade('QUANTUM_VULNERABLE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
              selectedGrade === 'QUANTUM_VULNERABLE' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            Quantum Vulnerable ({vulnerableCount})
          </button>
          <button
            type="button"
            onClick={() => setSelectedGrade('NIST_PQC_READY')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
              selectedGrade === 'NIST_PQC_READY' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            PQC Ready ({pqcReadyCount})
          </button>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search crypto endpoint or cipher..."
            className="bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-64"
          />
        </div>
      </div>

      {/* Asset Table */}
      <div className="space-y-4">
        {filteredAssets.map(asset => (
          <div
            key={asset.id}
            className={`bg-slate-900 border rounded-2xl p-5 shadow-lg transition-all ${
              asset.pqcGrade === 'QUANTUM_VULNERABLE'
                ? 'border-rose-500/40 hover:border-rose-500/60'
                : asset.pqcGrade === 'QUANTUM_RESILIENT'
                ? 'border-amber-500/40 hover:border-amber-500/60'
                : 'border-emerald-500/40 hover:border-emerald-500/60'
            }`}
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-400/30">
                    {asset.id}
                  </span>
                  <h3 className="text-sm font-bold text-white">{asset.assetName}</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-slate-800 text-slate-300">
                    {asset.systemCategory.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-300 pt-1 flex-wrap">
                  <span>Current Cipher: <strong className="font-mono text-white">{asset.currentAlgorithm}</strong></span>
                  <span className="text-slate-500">•</span>
                  <span>Target PQC: <strong className="font-mono text-emerald-400">{asset.targetPqcStandard}</strong></span>
                  <span className="text-slate-500">•</span>
                  <span>Statutory Milestone: <strong className="text-amber-300">{asset.masMigrationMilestone}</strong></span>
                </div>
              </div>

              {/* Badges & Upgrade Button */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">HNDL Risk</span>
                  <span
                    className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                      asset.hndlExposureRisk === 'CRITICAL'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : asset.hndlExposureRisk === 'HIGH'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {asset.hndlExposureRisk} EXPOSURE
                  </span>
                </div>

                <div className="pl-3 border-l border-slate-800">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                      asset.pqcGrade === 'NIST_PQC_READY'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : asset.pqcGrade === 'QUANTUM_RESILIENT'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    }`}
                  >
                    {asset.pqcGrade === 'NIST_PQC_READY' && <ShieldCheck className="w-3.5 h-3.5" />}
                    {asset.pqcGrade === 'QUANTUM_RESILIENT' && <Lock className="w-3.5 h-3.5" />}
                    {asset.pqcGrade === 'QUANTUM_VULNERABLE' && <AlertTriangle className="w-3.5 h-3.5" />}
                    <span>{asset.pqcGrade.replace(/_/g, ' ')}</span>
                  </span>
                </div>

                {asset.pqcGrade !== 'NIST_PQC_READY' && (
                  <button
                    type="button"
                    onClick={() => handleUpgradeToPQC(asset.id)}
                    disabled={isUpgradingId === asset.id}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50 transition-all"
                  >
                    {isUpgradingId === asset.id ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Re-keying ML-KEM...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Deploy PQC Hybrid</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
