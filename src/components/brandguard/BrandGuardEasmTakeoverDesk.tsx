// Skanda BrandGuard — EASM Subdomain Takeover & Executive Deepfake Defense Desk
// Chief Cyber Security Architect: Dangling DNS, Cloud Drift & Multimodal Impersonation Defense
import React, { useState } from 'react';
import {
  ShieldAlert,
  Server,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Zap,
  Globe,
  Mic,
  PhoneCall,
  Terminal,
  ExternalLink,
  Lock,
  Search
} from 'lucide-react';
import { EasmSubdomainRecord, ExecutiveDeepfakeAlert } from '../../types/brandguard';
import { BrandGuardEasmService } from '../../services/brandguard/brandguardEasmService';
import { useGRC } from '../../context/GRCContext';

export const BrandGuardEasmTakeoverDesk: React.FC = () => {
  const { theme, logAuditEvent } = useGRC();

  const [subdomains, setSubdomains] = useState<EasmSubdomainRecord[]>(() =>
    BrandGuardEasmService.getSubdomainRecords()
  );
  const [deepfakeAlerts, setDeepfakeAlerts] = useState<ExecutiveDeepfakeAlert[]>(() =>
    BrandGuardEasmService.getDeepfakeAlerts()
  );
  const [isScanningDns, setIsScanningDns] = useState(false);
  const [selectedSubdomain, setSelectedSubdomain] = useState<EasmSubdomainRecord | null>(null);
  const [searchFilter, setSearchFilter] = useState('');

  const vulnerableCount = subdomains.filter(s => s.status === 'VULNERABLE_DANGLING').length;
  const secureCount = subdomains.filter(s => s.status === 'SECURE_ACTIVE').length;

  const handleRunDnsScan = () => {
    setIsScanningDns(true);
    setTimeout(() => {
      const refreshed = BrandGuardEasmService.getSubdomainRecords().map(rec => ({
        ...rec,
        lastVerified: new Date().toISOString()
      }));
      setSubdomains(refreshed);
      setIsScanningDns(false);
      logAuditEvent('ACCESS', 'EASM Subdomain Takeover Engine', 'Completed full authoritative zone DNS drift sweep across corporate infrastructure.');
    }, 1200);
  };

  const handleRemediate = (record: EasmSubdomainRecord) => {
    const updated = BrandGuardEasmService.remediateSubdomain(record.id);
    setSubdomains(updated);
    if (selectedSubdomain?.id === record.id) {
      setSelectedSubdomain(updated.find(u => u.id === record.id) || null);
    }
    logAuditEvent('UPDATE', 'DNS Subdomain Purge', `Purged dangling CNAME record for ${record.subdomain} preventing adversary takeover.`);
  };

  const handleContainDeepfake = (alertId: string) => {
    const updated = BrandGuardEasmService.updateDeepfakeStatus(alertId, 'CONTAINED');
    setDeepfakeAlerts(updated);
    logAuditEvent('UPDATE', 'Executive Deepfake Defense', `Enforced containment on VIP impersonation incident #${alertId}.`);
  };

  const filteredSubdomains = subdomains.filter(s =>
    s.subdomain.toLowerCase().includes(searchFilter.toLowerCase()) ||
    s.cnameTarget.toLowerCase().includes(searchFilter.toLowerCase()) ||
    s.cloudService.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Architecture Banner */}
      <div className={`p-6 rounded-2xl border ${
        theme === 'light'
          ? 'bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white border-slate-800'
          : 'bg-gradient-to-r from-slate-950 via-rose-950/60 to-slate-950 text-white border-slate-800'
      } shadow-xl relative overflow-hidden`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center space-x-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Chief Cyber Security Architect Suite</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                EASM & SUBDOMAIN TAKEOVER SENTRY
              </span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              External Attack Surface Management & DNS Drift Defense
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Continuous monitoring of corporate apex and sub-delegated zones. Detects orphaned cloud resources (AWS S3, GitHub Pages, Azure, Zendesk)
              with dangling CNAME pointers before threat actors weaponize them for legitimate-domain phishing.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={handleRunDnsScan}
              disabled={isScanningDns}
              className="px-4 py-3 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30"
            >
              <RefreshCw className={`w-4 h-4 ${isScanningDns ? 'animate-spin' : ''}`} />
              <span>{isScanningDns ? 'Auditing DNS Zones...' : 'Run Live DNS Drift Sweep'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`p-5 rounded-2xl border ${
          theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Dangling / Takeover Risks</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-rose-400">{vulnerableCount}</span>
            <span className="text-xs text-rose-400 font-bold">Vulnerable Subdomains</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Orphaned cloud pointers susceptible to takeover.</p>
        </div>

        <div className={`p-5 rounded-2xl border ${
          theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Verified Secure Subdomains</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-emerald-400">{secureCount}</span>
            <span className="text-xs text-emerald-400 font-bold">Protected Endpoints</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Validated production hosts with active TLS and WAF.</p>
        </div>

        <div className={`p-5 rounded-2xl border ${
          theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Executive Deepfake Sentry</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Mic className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-indigo-400">{deepfakeAlerts.length}</span>
            <span className="text-xs text-indigo-400 font-bold">Monitored VIP Incidents</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Voice diffusion clone and smishing intelligence alerts.</p>
        </div>
      </div>

      {/* Subdomains Table */}
      <div className={`rounded-2xl border overflow-hidden ${
        theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
      }`}>
        <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Authoritative Subdomain Drift Inventory</h3>
              <p className="text-xs text-slate-400">Real-time DNS canonical mapping against known cloud service providers</p>
            </div>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter subdomains..."
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-800/80 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/60 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Subdomain & Apex</th>
                <th className="py-3 px-4">Record & CNAME Target</th>
                <th className="py-3 px-4">Cloud Provider</th>
                <th className="py-3 px-4">Status & Vulnerability</th>
                <th className="py-3 px-4">Impact</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredSubdomains.map(record => {
                const isVuln = record.status === 'VULNERABLE_DANGLING';
                return (
                  <tr
                    key={record.id}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      isVuln ? 'bg-rose-500/5' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-200">{record.subdomain}</div>
                      <div className="text-[10px] text-slate-400">{record.apexDomain}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 mr-2">
                        {record.recordType}
                      </span>
                      <span className="text-slate-300 text-[11px] truncate max-w-[200px] inline-block align-middle" title={record.cnameTarget}>
                        {record.cnameTarget}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-sans font-semibold text-slate-300">
                      {record.cloudService.replace('_', ' ')}
                    </td>
                    <td className="py-3.5 px-4 font-sans">
                      {isVuln ? (
                        <div className="space-y-1">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center space-x-1 w-fit">
                            <AlertTriangle className="w-3 h-3 text-rose-400" />
                            <span>DANGLING CNAME (TAKE OVER RISKS)</span>
                          </span>
                          <p className="text-[11px] text-rose-300/90 font-mono">
                            {record.httpFingerprintSignature}
                          </p>
                        </div>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1 w-fit">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>SECURE & ACTIVE</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        record.takeoverImpact === 'CRITICAL'
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {record.takeoverImpact}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-sans space-x-2">
                      <button
                        onClick={() => setSelectedSubdomain(record)}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                      >
                        Inspect Proof
                      </button>
                      {isVuln && (
                        <button
                          onClick={() => handleRemediate(record)}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-sm transition-colors"
                        >
                          Purge DNS Record
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Exploit Proof Modal / Drawer */}
      {selectedSubdomain && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-2xl w-full p-6 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                <h3 className="text-base font-bold text-white">
                  Subdomain Takeover Exploit Simulation: {selectedSubdomain.subdomain}
                </h3>
              </div>
              <button
                onClick={() => setSelectedSubdomain(null)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block font-semibold mb-1">Vulnerability Mechanics:</span>
                <p className="p-3 rounded-xl bg-slate-800/80 text-slate-200 border border-slate-700 leading-relaxed">
                  {selectedSubdomain.vulnerabilityReason}
                </p>
              </div>

              <div>
                <span className="text-slate-400 block font-semibold mb-1">Simulated Exploit Proof:</span>
                <div className="p-3 rounded-xl bg-black font-mono text-[11px] text-emerald-400 border border-slate-800">
                  <div className="text-slate-500 mb-1">// Terminal Command Probe</div>
                  {selectedSubdomain.exploitSimulationProof}
                </div>
              </div>

              <div>
                <span className="text-slate-400 block font-semibold mb-1">Suggested Remediation:</span>
                <p className="p-3 rounded-xl bg-indigo-950/40 text-indigo-200 border border-indigo-500/30">
                  {selectedSubdomain.suggestedDnsFix}
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedSubdomain(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Close
              </button>
              {selectedSubdomain.status === 'VULNERABLE_DANGLING' && (
                <button
                  onClick={() => handleRemediate(selectedSubdomain)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg"
                >
                  Confirm & Purge DNS Record Now
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* EXECUTIVE DEEPFAKE & MULTIMODAL IMPERSONATION DEFENSE SECTION */}
      <div className={`p-5 rounded-2xl border space-y-4 ${
        theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Executive Deepfake & Multimodal VIP Defense</h3>
              <p className="text-xs text-slate-400">
                Acoustic spectral artifact inspection, synthetic voice cloning interception, and C-suite mobile smishing leaks
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {deepfakeAlerts.map(alert => (
            <div
              key={alert.id}
              className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/80 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-white text-sm">{alert.executiveName}</span>
                  <span className="text-slate-400 text-xs">({alert.executiveTitle})</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  alert.status === 'ACTIVE_CAMPAIGN'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {alert.status.replace('_', ' ')}
                </span>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Media Classification:</span>
                  <span className="font-mono font-bold text-indigo-300">{alert.mediaType}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Source Platform:</span>
                  <span className="font-semibold text-slate-200">{alert.sourcePlatform}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Synthetic Confidence:</span>
                  <span className="font-bold text-rose-400">{alert.detectionConfidence}%</span>
                </div>
                {alert.associatedPhoneExposure && (
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">Leaked Mobile:</span>
                    <span className="font-mono text-amber-300">{alert.associatedPhoneExposure}</span>
                  </div>
                )}
              </div>

              {/* Synthetic Indicators */}
              <div className="p-2.5 rounded-lg bg-black/40 border border-slate-800 font-mono text-[10px] text-slate-300 space-y-1">
                <div className="text-indigo-300 font-bold">Detection Heuristics:</div>
                {alert.syntheticIndicators.map((ind, i) => (
                  <div key={i} className="flex items-start space-x-1.5">
                    <span className="text-rose-400">•</span>
                    <span>{ind}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-slate-400">
                  Discovered: {new Date(alert.recordedAt).toLocaleString()}
                </span>
                {alert.status === 'ACTIVE_CAMPAIGN' && (
                  <button
                    onClick={() => handleContainDeepfake(alert.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow transition-all"
                  >
                    Enforce Immediate Containment
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
