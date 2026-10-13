// Skanda BrandGuard — Threat Actor Infrastructure Clustering & ASN Fingerprinting
// Groups discovered lookalike/phishing domains by shared ASN, Name Servers, IP subnets,
// and SSL fingerprints into Campaign Clusters (e.g., Storm-0914, PhishKit-Vance).
// Enables single-action takedown dispatch and automated firewall blocklist generation.

import React, { useState, useEffect } from 'react';
import {
  Network,
  ShieldAlert,
  Server,
  Send,
  Download,
  Copy,
  Check,
  Globe,
  Lock,
  Layers,
  Flame,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Code,
  FileText,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { ThreatActorCluster, BrandFinding, BrandProfile } from '../../types/brandguard';
import { BrandGuardClusteringService } from '../../services/brandguard/brandguardClusteringService';
import { useGRC } from '../../context/GRCContext';

interface BrandGuardThreatClustersProps {
  findings?: BrandFinding[];
  brandProfile?: BrandProfile;
  onSelectFinding?: (f: BrandFinding) => void;
  onInspectEmail?: (domain: string) => void;
}

export const BrandGuardThreatClusters: React.FC<BrandGuardThreatClustersProps> = ({
  findings,
  brandProfile,
  onSelectFinding,
  onInspectEmail
}) => {
  const { theme, logAuditEvent } = useGRC();
  const [clusters, setClusters] = useState<ThreatActorCluster[]>(() =>
    BrandGuardClusteringService.getClusters(findings)
  );
  const [selectedCluster, setSelectedCluster] = useState<ThreatActorCluster | null>(null);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'iptables' | 'rpz' | 'paloalto'>('iptables');
  const [copiedExport, setCopiedExport] = useState(false);
  const [takedownProcessingId, setTakedownProcessingId] = useState<string | null>(null);

  // Sync cluster selection default
  useEffect(() => {
    if (clusters.length > 0 && !selectedCluster) {
      setSelectedCluster(clusters[0]);
    }
  }, [clusters, selectedCluster]);

  const handleDispatchClusterTakedown = async (cluster: ThreatActorCluster) => {
    setTakedownProcessingId(cluster.id);
    try {
      const res = BrandGuardClusteringService.dispatchClusterTakedown(
        cluster.id,
        'Auto-dispatched via BrandGuard Threat Actor Clustering Engine'
      );
      if (res.success) {
        const updatedClusters = BrandGuardClusteringService.getClusters(findings);
        setClusters(updatedClusters);
        const refreshed = updatedClusters.find(c => c.id === cluster.id) || null;
        setSelectedCluster(refreshed);
        logAuditEvent(
          'UPDATE',
          'BrandGuard Threat Clustering',
          `Dispatched unified cluster takedown for campaign "${cluster.clusterName}" encompassing ${cluster.domains.length} rogue domains across ${cluster.commonAsn}.`
        );
      }
    } finally {
      setTakedownProcessingId(null);
    }
  };

  const getExportContent = () => {
    if (!selectedCluster) return '';
    return BrandGuardClusteringService.generateBlocklist(selectedCluster.id, exportFormat);
  };

  const handleCopyExport = () => {
    navigator.clipboard.writeText(getExportContent());
    setCopiedExport(true);
    setTimeout(() => setCopiedExport(false), 2000);
    logAuditEvent(
      'ACCESS',
      'BrandGuard Firewall Blocklist',
      `Exported ${exportFormat.toUpperCase()} blocklist rules for cluster "${selectedCluster?.clusterName}".`
    );
  };

  const totalCampaignDomains = clusters.reduce((acc, c) => acc + c.domains.length, 0);
  const activeClustersCount = clusters.filter(c => c.clusterStatus === 'ACTIVE_CAMPAIGN').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div
        className={`p-5 rounded-xl border shadow-xs ${
          theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <Network className="w-6 h-6 shrink-0" />
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <h3 className={`text-base font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                  Threat Actor Infrastructure Clustering & ASN Fingerprinting
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {activeClustersCount} Active Campaigns
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                  theme === 'light' ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}>
                  ISO 27001 A.5.20 / SOC 2 CC7.4
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Automatically aggregates homoglyph and phishing domains sharing Autonomous Systems (ASN), IP subnets, Name Servers, and SSL serial fingerprints.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <div className="text-right hidden sm:block">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Correlated Rogue Domains</span>
              <span className="text-sm font-mono font-bold text-rose-400">{totalCampaignDomains} Domains Fingerprinted</span>
            </div>

            <button
              onClick={() => setExportModalOpen(true)}
              disabled={!selectedCluster}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center space-x-2 shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export Firewall Blocklist</span>
            </button>
          </div>
        </div>

        {/* Highlight Metrics */}
        <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t text-xs ${
          theme === 'light' ? 'border-slate-200' : 'border-slate-800'
        }`}>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Fingerprinted Clusters</span>
            <span className={`text-lg font-black mt-0.5 block ${theme === 'light' ? 'text-slate-900' : 'text-slate-200'}`}>
              {clusters.length} Campaigns
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Correlated Domains</span>
            <span className="text-lg font-black text-rose-500 mt-0.5 block">{totalCampaignDomains} Target Sites</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Host & ASN Diversity</span>
            <span className="text-lg font-black text-indigo-400 mt-0.5 block">
              {new Set(clusters.map(c => c.commonAsn)).size} Autonomous Systems
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Mitigation Capability</span>
            <span className="text-lg font-black text-emerald-400 mt-0.5 block">1-Click Unified Takedown</span>
          </div>
        </div>
      </div>

      {/* Main Split: Cluster List (Left) vs Selected Cluster Details (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Cluster Cards */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
            <span>DISCOVERED THREAT CAMPAIGNS ({clusters.length})</span>
            <span>DOMAINS</span>
          </div>

          {clusters.map(cluster => {
            const isSelected = selectedCluster?.id === cluster.id;
            return (
              <div
                key={cluster.id}
                onClick={() => setSelectedCluster(cluster)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? theme === 'light'
                      ? 'bg-indigo-50/80 border-indigo-400 shadow-md shadow-indigo-100'
                      : 'bg-indigo-950/40 border-indigo-500/60 shadow-lg shadow-indigo-900/20'
                    : theme === 'light'
                    ? 'bg-white border-slate-200 hover:border-slate-300'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center space-x-2 flex-wrap">
                      <span className={`font-bold text-sm ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                        {cluster.clusterName}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          cluster.campaignConfidence >= 90
                            ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        CONFIDENCE {cluster.campaignConfidence}%
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-1">{cluster.attackVector}</p>

                    <div className="pt-1 flex items-center space-x-2 text-[11px] font-mono text-indigo-400 flex-wrap gap-y-1">
                      <span>{cluster.commonAsn}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-400">{cluster.commonAsnOrg}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0 pl-2">
                    <span className={`px-2.5 py-1 rounded-xl border font-mono text-xs font-bold block ${
                      theme === 'light' ? 'bg-slate-100 border-slate-200 text-slate-800' : 'bg-slate-800 border-slate-700 text-slate-200'
                    }`}>
                      {cluster.domains.length}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      {cluster.clusterStatus === 'BATCH_DISPATCHED' ? 'Takedown Sent' : 'Active'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Selected Campaign Deep Dive */}
        <div className="lg:col-span-7">
          {selectedCluster ? (
            <div
              className={`p-5 rounded-xl border space-y-5 shadow-xs ${
                theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
              }`}
            >
              {/* Campaign Header & Single-Click Takedown */}
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b ${
                theme === 'light' ? 'border-slate-200' : 'border-slate-800'
              }`}>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className={`text-base font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                      {selectedCluster.clusterName}
                    </h4>
                    <span className={`text-xs font-mono px-2 py-0.5 rounded border ${
                      theme === 'light' ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}>
                      ID: {selectedCluster.id}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    First Observed: {new Date(selectedCluster.firstDetected).toLocaleDateString()} • Status:{' '}
                    <strong className="text-rose-500">{selectedCluster.clusterStatus.replace(/_/g, ' ')}</strong>
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleDispatchClusterTakedown(selectedCluster)}
                    disabled={takedownProcessingId === selectedCluster.id || selectedCluster.clusterStatus === 'BATCH_DISPATCHED'}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-lg ${
                      selectedCluster.clusterStatus === 'BATCH_DISPATCHED'
                        ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 cursor-default'
                        : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>
                      {selectedCluster.clusterStatus === 'BATCH_DISPATCHED'
                        ? 'Cluster Takedown Active'
                        : takedownProcessingId === selectedCluster.id
                        ? 'Dispatching RFC Notices...'
                        : `Dispatch Unified Takedown (${selectedCluster.domains.length} Domains)`}
                    </span>
                  </button>
                </div>
              </div>

              {/* Infrastructure Fingerprint Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className={`p-3 rounded-xl border ${
                  theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800'
                }`}>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                    ASN Fingerprint
                  </span>
                  <span className="font-mono font-bold text-indigo-400 text-sm block mt-1">
                    {selectedCluster.commonAsn}
                  </span>
                  <span className="text-[11px] text-slate-400">{selectedCluster.commonAsnOrg}</span>
                </div>

                <div className={`p-3 rounded-xl border ${
                  theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800'
                }`}>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                    Shared Name Servers
                  </span>
                  <div className="mt-1 space-y-0.5">
                    {selectedCluster.commonNameServers.map((ns, i) => (
                      <span key={i} className={`font-mono block text-[11px] truncate ${
                        theme === 'light' ? 'text-slate-700' : 'text-slate-300'
                      }`}>
                        {ns}
                      </span>
                    ))}
                  </div>
                </div>

                <div className={`p-3 rounded-xl border ${
                  theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800'
                }`}>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                    SSL Cert Fingerprint
                  </span>
                  <span className={`font-mono block text-[11px] mt-1 break-all ${
                    theme === 'light' ? 'text-slate-700' : 'text-slate-300'
                  }`}>
                    {selectedCluster.commonSslFingerprint || "Not Fingerprinted (Dynamic Let's Encrypt)"}
                  </span>
                </div>
              </div>

              {/* Correlated Domains Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                  <span>CORRELATED DECEPTIVE DOMAINS IN THIS CLUSTER</span>
                  <span>IP SUBSET</span>
                </div>

                <div className={`divide-y rounded-xl border overflow-hidden text-xs ${
                  theme === 'light'
                    ? 'divide-slate-200 border-slate-200 bg-slate-50/50'
                    : 'divide-slate-800 border-slate-800 bg-slate-950/50'
                }`}>
                  {selectedCluster.domains.map((dom, idx) => (
                    <div
                      key={idx}
                      className={`p-3 flex items-center justify-between transition-colors ${
                        theme === 'light' ? 'hover:bg-slate-100/80' : 'hover:bg-slate-900/80'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <Globe className="w-4 h-4 text-rose-400 shrink-0" />
                        <div className="min-w-0">
                          <span className={`font-mono font-bold cursor-pointer truncate block ${
                            theme === 'light' ? 'text-slate-900 hover:text-indigo-600' : 'text-slate-100 hover:text-indigo-400'
                          }`}>
                            {dom}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Subnet: {selectedCluster.commonSubnet}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 shrink-0">
                        <span className="font-mono text-slate-400 text-[11px]">{selectedCluster.commonSubnet}</span>
                        {onInspectEmail && (
                          <button
                            onClick={() => onInspectEmail(dom)}
                            className={`px-2 py-1 rounded text-indigo-400 text-[10px] font-semibold border ${
                              theme === 'light'
                                ? 'bg-white hover:bg-slate-100 border-slate-200'
                                : 'bg-slate-800 hover:bg-slate-700 border-slate-700'
                            }`}
                            title="Inspect active mail server & spoofability"
                          >
                            MX
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Takedown RFC Template Preview */}
              <div className={`p-3.5 rounded-xl border text-xs font-mono space-y-1.5 ${
                theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
              }`}>
                <div className="flex items-center justify-between text-indigo-400 font-bold">
                  <div className="flex items-center space-x-1.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Unified Upstream Carrier Takedown Payload:</span>
                  </div>
                  <span className="text-[10px] text-slate-400">RFC 2142 Abuse Notice</span>
                </div>
                <div className={`text-[11px] leading-relaxed p-2.5 rounded-lg border ${
                  theme === 'light'
                    ? 'bg-white border-slate-200 text-slate-700'
                    : 'bg-black/40 border-slate-800/80 text-slate-400'
                }`}>
                  <p>To: abuse@{selectedCluster.commonAsnOrg.toLowerCase().replace(/[^a-z0-9]/g, '')}.com</p>
                  <p>Subject: [EMERGENCY ABUSE] Criminal Phishing Infrastructure Hosted on {selectedCluster.commonAsn}</p>
                  <p className={`mt-1 ${theme === 'light' ? 'text-slate-900 font-medium' : 'text-slate-300'}`}>
                    Sir/Madam, the ASN {selectedCluster.commonAsn} currently hosts an active coordinated phishing cluster targeting our financial institution. Enclosed are {selectedCluster.domains.length} confirmed hostile hostnames. Cease and desist immediately.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-10 text-center text-slate-400">Select a campaign cluster to view forensic details.</div>
          )}
        </div>
      </div>

      {/* Firewall Blocklist Export Modal */}
      {exportModalOpen && selectedCluster && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Code className="w-5 h-5 text-indigo-400" />
                <h4 className="font-bold text-sm">Firewall & Perimeter Blocklist Export</h4>
              </div>
              <button
                onClick={() => setExportModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Format Switcher */}
            <div className="flex space-x-2 text-xs font-semibold">
              {[
                { id: 'iptables', label: 'Linux iptables (IP Drops)' },
                { id: 'rpz', label: 'BIND RPZ (DNS Firewall Sinkhole)' },
                { id: 'paloalto', label: 'Palo Alto EDL (External Dynamic List)' }
              ].map(fmt => (
                <button
                  key={fmt.id}
                  onClick={() => setExportFormat(fmt.id as any)}
                  className={`px-3 py-1.5 rounded-xl border transition-colors ${
                    exportFormat === fmt.id
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {fmt.label}
                </button>
              ))}
            </div>

            {/* Code Block */}
            <div className="relative">
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-indigo-300 overflow-x-auto max-h-64">
                {getExportContent()}
              </pre>

              <button
                onClick={handleCopyExport}
                className="absolute top-2.5 right-2.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center space-x-1.5 shadow"
              >
                {copiedExport ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Rules</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setExportModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
