import React, { useState } from 'react';
import {
  Cpu,
  Package,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  FileCode2,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Flame,
  Bug,
  Download,
  Upload,
  Check,
  Zap,
  Sliders,
  Layers
} from 'lucide-react';

export interface SBOMComponent {
  id: string;
  name: string;
  version: string;
  ecosystem: 'npm' | 'maven' | 'PyPI' | 'container';
  license: string;
  cveId?: string;
  cvssScore?: number;
  epssScore: number; // Exploit Prediction Scoring System (0.00 to 1.00)
  cisaKevKnownExploited: boolean; // Active in CISA Known Exploited Vulnerabilities catalog
  maliciousRisk: 'CLEAN' | 'TYPOSQUAT_SUSPECT' | 'DEPENDENCY_CONFUSION' | 'CVE_EXPLOITED';
  remediationRecommendation: string;
  fixedInVersion?: string;
}

export const SBOMOpenSourceSentinel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'SBOM_CATALOG' | 'CISA_KEV_PRIORITY' | 'MALICIOUS_SENTINEL'>('SBOM_CATALOG');
  const [filterRisk, setFilterRisk] = useState<'ALL' | 'HIGH_EXPLOIT' | 'TYPOSQUAT'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [remediatingId, setRemediatingId] = useState<string | null>(null);

  const [components, setComponents] = useState<SBOMComponent[]>([
    {
      id: 'PKG-01',
      name: 'log4j-core',
      version: '2.14.1',
      ecosystem: 'maven',
      license: 'Apache-2.0',
      cveId: 'CVE-2021-44228',
      cvssScore: 10.0,
      epssScore: 0.974, // 97.4% probability of weaponized exploitation in the wild
      cisaKevKnownExploited: true,
      maliciousRisk: 'CVE_EXPLOITED',
      remediationRecommendation: 'Immediate upgrade to log4j-core 2.17.1+; zero RCE surface',
      fixedInVersion: '2.17.1'
    },
    {
      id: 'PKG-02',
      name: 'cross-env-utils', // Typosquat of 'cross-env'
      version: '7.0.4',
      ecosystem: 'npm',
      license: 'MIT',
      epssScore: 0.45,
      cisaKevKnownExploited: false,
      maliciousRisk: 'TYPOSQUAT_SUSPECT',
      remediationRecommendation: 'Malicious clone attempting credential exfiltration. Purge from package.json and quarantine CI pipeline.',
      fixedInVersion: 'cross-env@7.0.3 (Official)'
    },
    {
      id: 'PKG-03',
      name: 'cryptography',
      version: '41.0.3',
      ecosystem: 'PyPI',
      license: 'Apache-2.0 / BSD',
      cveId: 'CVE-2023-49083',
      cvssScore: 7.5,
      epssScore: 0.12,
      cisaKevKnownExploited: false,
      maliciousRisk: 'CLEAN',
      remediationRecommendation: 'Low live weaponization risk. Scheduled patch in next sprint cycle.',
      fixedInVersion: '41.0.6'
    },
    {
      id: 'PKG-04',
      name: 'internal-bank-payments-auth',
      version: '1.0.0',
      ecosystem: 'npm',
      license: 'UNLICENSED (Proprietary)',
      epssScore: 0.88,
      cisaKevKnownExploited: false,
      maliciousRisk: 'DEPENDENCY_CONFUSION',
      remediationRecommendation: 'Public npm registry package claiming internal scope name. Configure private Artifactory repository scoping.',
      fixedInVersion: '@bank-sg/payments-auth@1.0.1'
    },
    {
      id: 'PKG-05',
      name: 'axios',
      version: '1.7.4',
      ecosystem: 'npm',
      license: 'MIT',
      cveId: 'CVE-2024-39338',
      cvssScore: 6.5,
      epssScore: 0.08,
      cisaKevKnownExploited: false,
      maliciousRisk: 'CLEAN',
      remediationRecommendation: 'Minor SSRF vulnerability in specific relative URL proxy setups. Patch in regular release.',
      fixedInVersion: '1.7.7'
    }
  ]);

  const handleRunSBOMScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 900);
  };

  const handleRemediate = (id: string, fixVersion?: string) => {
    setRemediatingId(id);
    setTimeout(() => {
      setComponents(prev =>
        prev.map(c => {
          if (c.id === id) {
            return {
              ...c,
              version: fixVersion || 'Latest Secure',
              maliciousRisk: 'CLEAN',
              cisaKevKnownExploited: false,
              epssScore: 0.01,
              remediationRecommendation: 'Remediated & verified against CI/CD container hash'
            };
          }
          return c;
        })
      );
      setRemediatingId(null);
    }, 800);
  };

  const filteredComponents = components.filter(c => {
    if (filterRisk === 'HIGH_EXPLOIT' && (!c.cisaKevKnownExploited && c.epssScore < 0.5)) return false;
    if (filterRisk === 'TYPOSQUAT' && (c.maliciousRisk !== 'TYPOSQUAT_SUSPECT' && c.maliciousRisk !== 'DEPENDENCY_CONFUSION')) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return c.name.toLowerCase().includes(q) || (c.cveId && c.cveId.toLowerCase().includes(q)) || c.ecosystem.toLowerCase().includes(q);
    }
    return true;
  });

  const cisaKevCount = components.filter(c => c.cisaKevKnownExploited).length;
  const maliciousCount = components.filter(c => c.maliciousRisk === 'TYPOSQUAT_SUSPECT' || c.maliciousRisk === 'DEPENDENCY_CONFUSION').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-cyan-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-cyan-400" />
                MAS TRM §5 Software Bill of Materials (SBOM) Sentinel
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                CYCLONEDX / SPDX COMPLIANT
              </span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Open-Source Software (OSS) & Vulnerability Prioritization
            </h2>
            <p className="text-sm text-slate-300 max-w-3xl mt-1 leading-relaxed">
              Supervisory monitoring of open-source dependencies across core banking microservices. Replaces raw CVSS with
              real-world weaponization intelligence from <strong>EPSS & CISA KEV</strong> feeds, preventing dependency confusion and typosquatting attacks.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleRunSBOMScan}
              disabled={isScanning}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-2 cursor-pointer shadow-md transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Ingesting CI/CD Artifacts...' : 'Scan Build Manifests'}</span>
            </button>
          </div>
        </div>

        {/* Breakdown Metric Gauges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-800/80 text-xs">
          <div className="bg-slate-950/80 border border-rose-500/30 rounded-xl p-3">
            <span className="text-rose-400 font-bold uppercase tracking-wider text-[10px] block">CISA KEV Known Exploited</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-bold font-mono text-rose-300">{cisaKevCount}</span>
              <span className="text-xs text-rose-400 font-semibold">(Weaponized in Wild)</span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-0.5">Mandatory Notice 655 &lt;14 day remediation</span>
          </div>

          <div className="bg-slate-950/80 border border-amber-500/30 rounded-xl p-3">
            <span className="text-amber-400 font-bold uppercase tracking-wider text-[10px] block">Typosquat & Dependency Confusion</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-bold font-mono text-amber-300">{maliciousCount}</span>
              <span className="text-xs text-slate-400">Suspicious Packages</span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-0.5">CI/CD build pipeline quarantine active</span>
          </div>

          <div className="bg-slate-950/80 border border-emerald-500/30 rounded-xl p-3">
            <span className="text-emerald-400 font-bold uppercase tracking-wider text-[10px] block">Total Ingested Components</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-bold font-mono text-emerald-400">{components.length}</span>
              <span className="text-xs text-slate-400">Across 4 Repositories</span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-0.5">100% License compliance audit passed</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterRisk('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
              filterRisk === 'ALL' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            All Packages ({components.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterRisk('HIGH_EXPLOIT')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
              filterRisk === 'HIGH_EXPLOIT' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            Exploited / High EPSS ({components.filter(c => c.cisaKevKnownExploited || c.epssScore >= 0.5).length})
          </button>
          <button
            type="button"
            onClick={() => setFilterRisk('TYPOSQUAT')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
              filterRisk === 'TYPOSQUAT' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            Typosquat / Confusion ({maliciousCount})
          </button>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search package name or CVE ID..."
            className="bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-64"
          />
        </div>
      </div>

      {/* Components List */}
      <div className="space-y-3">
        {filteredComponents.map(pkg => (
          <div
            key={pkg.id}
            className={`bg-slate-900 border rounded-2xl p-5 shadow-lg transition-all ${
              pkg.cisaKevKnownExploited || pkg.maliciousRisk === 'TYPOSQUAT_SUSPECT'
                ? 'border-rose-500/50 bg-rose-950/10'
                : pkg.maliciousRisk === 'DEPENDENCY_CONFUSION'
                ? 'border-amber-500/50 bg-amber-950/10'
                : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-cyan-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    {pkg.id}
                  </span>
                  <h3 className="text-sm font-bold text-white">{pkg.name}</h3>
                  <span className="text-xs font-mono text-slate-400">v{pkg.version}</span>
                  <span className="px-2 py-0.2 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                    {pkg.ecosystem}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">({pkg.license})</span>
                </div>

                <div className="flex items-center gap-3 text-xs pt-1 flex-wrap">
                  {pkg.cveId && (
                    <span className="font-mono font-bold text-rose-300">
                      {pkg.cveId} (CVSS {pkg.cvssScore?.toFixed(1)})
                    </span>
                  )}
                  <span className="text-slate-500">•</span>
                  <span>
                    EPSS Exploit Probability:{' '}
                    <strong
                      className={`font-mono ${
                        pkg.epssScore >= 0.5 ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {(pkg.epssScore * 100).toFixed(1)}%
                    </strong>
                  </span>
                  {pkg.cisaKevKnownExploited && (
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold text-[10px] animate-pulse">
                      🔥 CISA KEV ACTIVE WEAPON
                    </span>
                  )}
                </div>

                <p className="text-[11.5px] text-slate-400 pt-1">
                  <strong className="text-slate-300">Action:</strong> {pkg.remediationRecommendation}
                </p>
              </div>

              {/* Status and 1-Click Fix Button */}
              <div className="flex items-center gap-3 shrink-0">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                    pkg.maliciousRisk === 'CLEAN'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : pkg.maliciousRisk === 'DEPENDENCY_CONFUSION'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  }`}
                >
                  {pkg.maliciousRisk === 'CLEAN' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {pkg.maliciousRisk !== 'CLEAN' && <AlertTriangle className="w-3.5 h-3.5" />}
                  <span>{pkg.maliciousRisk.replace(/_/g, ' ')}</span>
                </span>

                {pkg.maliciousRisk !== 'CLEAN' && (
                  <button
                    type="button"
                    onClick={() => handleRemediate(pkg.id, pkg.fixedInVersion)}
                    disabled={remediatingId === pkg.id}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-1.5 cursor-pointer shadow-md transition-all disabled:opacity-50"
                  >
                    {remediatingId === pkg.id ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Applying Patch...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5" />
                        <span>1-Click Remediation</span>
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
