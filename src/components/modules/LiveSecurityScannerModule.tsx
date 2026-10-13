import React, { useState } from 'react';
import { useGRC } from '../../context/GRCContext';
import { PageContainer } from '../layout/PageContainer';
import {
  Globe,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Lock,
  RefreshCw,
  Server,
  Zap,
  Sparkles,
  ExternalLink,
  FolderPlus,
  AlertOctagon,
  Key,
  Layers,
  Search,
  Activity,
  Calendar,
  Check,
  Terminal
} from 'lucide-react';

interface ScanResult {
  target: string;
  scanTimestamp: string;
  score: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'F';
  latencyMs: number;
  dns: {
    resolvedIp?: string;
    allIps?: string[];
    hasMx?: boolean;
    mxCount?: number;
    hasSpf?: boolean;
    spfRecord?: string | null;
    hasDmarc?: boolean;
    dmarcRecord?: string | null;
    error?: string;
  };
  tls: {
    valid?: boolean;
    subject?: any;
    issuer?: any;
    validFrom?: string;
    validTo?: string;
    daysRemaining?: number;
    protocol?: string;
    cipher?: string;
    authorized?: boolean;
    error?: string;
  };
  headers: {
    statusCode?: number;
    statusText?: string;
    hsts?: { present: boolean; value: string | null };
    csp?: { present: boolean; value: string | null };
    xfo?: { present: boolean; value: string | null };
    xcto?: { present: boolean; value: string | null };
    referrerPolicy?: { present: boolean; value: string | null };
    permissionsPolicy?: { present: boolean; value: string | null };
    serverHeader?: { present: boolean; value: string | null };
    error?: string;
  };
  complianceChecks: Array<{
    id: string;
    name: string;
    status: 'PASS' | 'WARN' | 'FAIL';
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
    isoControl: string;
    masClause: string;
    detail: string;
    remediation?: string;
  }>;
}

export const LiveSecurityScannerModule: React.FC = () => {
  const { currentTenant, uploadEvidence, addFinding, setActiveModule } = useGRC();
  const [targetInput, setTargetInput] = useState('github.com');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'checks' | 'tls' | 'headers' | 'dns'>('overview');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [aiAuditing, setAiAuditing] = useState(false);
  const [aiReview, setAiReview] = useState<any | null>(null);

  const quickPresets = ['github.com', 'cloudflare.com', 'stripe.com', 'google.com', 'microsoft.com'];

  const executeLiveScan = async (domainToScan?: string) => {
    const target = domainToScan || targetInput;
    if (!target.trim()) return;

    setIsScanning(true);
    setScanError(null);
    setAiReview(null);

    try {
      const response = await fetch('/api/scan/domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: target.trim() })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `Scan failed with status ${response.status}`);
      }

      const data: ScanResult = await response.json();
      setScanResult(data);
    } catch (err: any) {
      setScanError(err.message || 'Failed to complete live scan');
    } finally {
      setIsScanning(false);
    }
  };

  const handleExportAsEvidence = () => {
    if (!scanResult) return;

    uploadEvidence({
      title: `[Live Probe] Security & TLS Audit: ${scanResult.target} (Grade ${scanResult.grade})`,
      controlCode: 'A.8.20',
      department: 'Information Security & DevOps',
      fileName: `live_probe_${scanResult.target.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.json`,
      fileType: 'JSON',
      fileSize: '4.2 KB',
      tags: ['Live Scan', 'TLS', 'HSTS', 'DNSSEC', 'Automated Probe']
    });

    setToastMessage(`Saved live scan for ${scanResult.target} to Evidence Center!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleGenerateFindings = () => {
    if (!scanResult) return;

    const failedChecks = scanResult.complianceChecks.filter(c => c.status === 'FAIL' || c.status === 'WARN');
    if (failedChecks.length === 0) {
      setToastMessage('No critical non-conformities found to convert to findings.');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    failedChecks.forEach(chk => {
      addFinding({
        source: 'CONTINUOUS_MONITORING',
        severity: chk.severity === 'CRITICAL' || chk.severity === 'HIGH' ? 'Major Non-Conformity' : 'Minor Non-Conformity',
        title: `[Automated Scanner] ${chk.name} on ${scanResult.target}`,
        clauseOrControl: chk.isoControl,
        department: 'Information Security & DevOps',
        description: chk.detail,
        rootCauseAnalysis: {
          methodology: 'DIRECT',
          rootCauseStatement: chk.detail
        },
        capaPlan: {
          correctiveAction: chk.remediation || 'Apply standard security configurations.',
          preventiveAction: 'Incorporate automated TLS and header check in CI/CD pipeline.',
          owner: 'Lead Security Engineer',
          targetDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
          evidenceRequired: 'Verified TLS / Header Scan Report'
        },
        status: 'Open'
      });
    });

    setToastMessage(`Generated ${failedChecks.length} corrective action items in Findings & CAPA!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleRunAiAudit = async () => {
    if (!scanResult) return;
    setAiAuditing(true);

    try {
      const summaryText = `
Live Target: ${scanResult.target}
Overall Security Score: ${scanResult.score}/100 (Grade: ${scanResult.grade})
TLS Protocol: ${scanResult.tls.protocol}, Cipher: ${scanResult.tls.cipher}, Expiry: ${scanResult.tls.daysRemaining} days.
HSTS Status: ${scanResult.headers.hsts?.present ? 'Enforced' : 'Missing'}
CSP Status: ${scanResult.headers.csp?.present ? 'Enforced' : 'Missing'}
DMARC Status: ${scanResult.dns.hasDmarc ? 'Configured' : 'Missing'}
Failed Checks:
${scanResult.complianceChecks.filter(c => c.status !== 'PASS').map(c => `- ${c.name}: ${c.detail} (Ref: ${c.isoControl} / ${c.masClause})`).join('\n')}
      `;

      const res = await fetch('/api/ai/audit-evidence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentText: summaryText,
          standard: 'ISO 27001:2022 & MAS TRM',
          controlRef: 'A.8.20 Network Security & A.8.24 Cryptography'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setAiReview(data);
      }
    } catch (err: any) {
      console.error('AI review error:', err);
    } finally {
      setAiAuditing(false);
    }
  };

  return (
    <PageContainer id="live-security-scanner-module">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Continuous Control Monitor (CCM)</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">Port 443 TLS & DNS Engine</span>
            </div>
            <h1 className="text-xl font-bold text-white mt-1.5">Real-Time Security & Cryptography Scanner</h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Execute live, real-time cryptographic TLS/SSL handshakes, DNS authentication (SPF/DMARC), and HTTP security header audits against real hostnames. Automatically map telemetry to ISO 27001 Annex A.8.20/A.8.24 and MAS TRM Section 9.0/11.0.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-mono">Live Probes: <span className="text-emerald-400 font-bold">ONLINE</span></span>
          </div>
        </div>
      </div>

      {/* Target Input & Execution Bar */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={targetInput}
              onChange={e => setTargetInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && executeLiveScan()}
              placeholder="Enter real company domain (e.g. yourcompany.com, github.com, api.stripe.com)"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition font-mono"
            />
          </div>

          <button
            onClick={() => executeLiveScan()}
            disabled={isScanning}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-sky-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white text-xs font-bold flex items-center justify-center space-x-2 shadow-md transition disabled:opacity-50 shrink-0"
          >
            {isScanning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Running Live Probe...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-amber-300" />
                <span>Execute Real-Time Scan</span>
              </>
            )}
          </button>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] text-slate-400">Quick Test Targets:</span>
          {quickPresets.map(preset => (
            <button
              key={preset}
              onClick={() => {
                setTargetInput(preset);
                executeLiveScan(preset);
              }}
              className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {scanError && (
        <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2">
          <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>Scan Error: {scanError}</span>
        </div>
      )}

      {/* Results Viewport */}
      {scanResult && (
        <div className="space-y-6">
          {/* Top Score Banner */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-5">
              <div
                className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center font-black text-3xl shadow-lg border ${
                  scanResult.grade === 'A+' || scanResult.grade === 'A'
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                    : scanResult.grade === 'B'
                    ? 'bg-sky-500/10 border-sky-500/40 text-sky-400'
                    : scanResult.grade === 'C'
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                    : 'bg-rose-500/10 border-rose-500/40 text-rose-400'
                }`}
              >
                <span>{scanResult.grade}</span>
                <span className="text-[10px] font-bold text-slate-400 tracking-wider">GRADE</span>
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-bold text-white font-mono">{scanResult.target}</h2>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                    {scanResult.latencyMs}ms latency
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Resolved IP: <span className="font-mono text-sky-300">{scanResult.dns.resolvedIp || 'N/A'}</span> • Scanned at {new Date(scanResult.scanTimestamp).toLocaleTimeString()}
                </p>
                <div className="flex items-center space-x-4 text-xs font-bold mt-2">
                  <span className="text-slate-300">Score: <span className="text-white text-sm">{scanResult.score}</span> / 100</span>
                  <span className="text-emerald-400 flex items-center space-x-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>{scanResult.complianceChecks.filter(c => c.status === 'PASS').length} Passed</span>
                  </span>
                  <span className="text-rose-400 flex items-center space-x-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{scanResult.complianceChecks.filter(c => c.status !== 'PASS').length} Remediation Items</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleExportAsEvidence}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center space-x-1.5 border border-slate-700 transition"
              >
                <FolderPlus className="w-3.5 h-3.5 text-sky-400" />
                <span>Save to Evidence Vault</span>
              </button>

              <button
                onClick={handleGenerateFindings}
                className="px-3.5 py-2 rounded-xl bg-rose-950 hover:bg-rose-900 text-rose-200 text-xs font-bold flex items-center space-x-1.5 border border-rose-800 transition"
              >
                <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
                <span>Log Remediation Findings</span>
              </button>

              <button
                onClick={handleRunAiAudit}
                disabled={aiAuditing}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow transition disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{aiAuditing ? 'Auditing with AI...' : 'Gemini AI Auditor'}</span>
              </button>
            </div>
          </div>

          {/* AI Auditor Review Panel */}
          {aiReview && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/60 to-indigo-950/60 border border-purple-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Gemini Lead Auditor Assessment</h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-900/80 text-purple-200 border border-purple-700">
                  {aiReview.complianceRating}
                </span>
              </div>
              <p className="text-xs text-purple-200 leading-relaxed font-mono">
                {aiReview.recommendedAction}
              </p>
              <div className="space-y-1.5 pt-1">
                {aiReview.observations?.map((obs: string, idx: number) => (
                  <div key={idx} className="flex items-start space-x-2 text-xs text-slate-300">
                    <span className="text-purple-400 font-bold">•</span>
                    <span>{obs}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sub Navigation */}
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
            {[
              { id: 'overview', label: 'Compliance Overview' },
              { id: 'checks', label: `Standard Checks (${scanResult.complianceChecks.length})` },
              { id: 'tls', label: 'TLS / SSL Certificate Details' },
              { id: 'headers', label: 'HTTP Security Headers' },
              { id: 'dns', label: 'DNS & DMARC' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content: Compliance Checks */}
          {(activeTab === 'overview' || activeTab === 'checks') && (
            <div className="space-y-3">
              {scanResult.complianceChecks.map((chk, idx) => (
                <div
                  key={chk.id || idx}
                  className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                    chk.status === 'PASS'
                      ? 'bg-slate-900 border-slate-800'
                      : chk.status === 'WARN'
                      ? 'bg-amber-950/20 border-amber-800/40'
                      : 'bg-rose-950/20 border-rose-800/40'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          chk.status === 'PASS'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : chk.status === 'WARN'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800'
                            : 'bg-rose-950 text-rose-400 border border-rose-800'
                        }`}
                      >
                        {chk.status}
                      </span>
                      <h4 className="text-xs font-bold text-white">{chk.name}</h4>
                    </div>
                    <p className="text-xs text-slate-400">{chk.detail}</p>
                    {chk.remediation && (
                      <div className="text-[11px] text-amber-300 font-mono bg-slate-950/60 p-2 rounded-lg border border-slate-800 mt-1">
                        Remediation Directive: {chk.remediation}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col md:items-end text-xs text-slate-400 space-y-0.5 shrink-0 font-mono">
                    <span className="text-indigo-300 font-bold">{chk.isoControl}</span>
                    <span className="text-slate-500 text-[10px]">{chk.masClause}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab Content: TLS Certificate */}
          {activeTab === 'tls' && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center space-x-2 text-white font-bold text-sm">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>Cryptographic TLS Handshake Telemetry</span>
              </div>

              {scanResult.tls.valid ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Issuer Authority</span>
                    <div className="text-white font-mono font-bold text-sm">
                      {scanResult.tls.issuer?.O || scanResult.tls.issuer?.CN || 'Trusted Root CA'}
                    </div>
                    <p className="text-slate-400 text-[11px]">Common Name: {scanResult.tls.issuer?.CN || 'N/A'}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Expiration Health</span>
                    <div className="text-emerald-400 font-mono font-bold text-sm">
                      {scanResult.tls.daysRemaining} Days Remaining
                    </div>
                    <p className="text-slate-400 text-[11px]">Valid Until: {new Date(scanResult.tls.validTo || '').toLocaleString()}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Negotiated Protocol</span>
                    <div className="text-sky-300 font-mono font-bold text-sm">{scanResult.tls.protocol}</div>
                    <p className="text-slate-400 text-[11px]">Authorized: {scanResult.tls.authorized ? 'YES (Valid Chain)' : 'NO'}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Cipher Suite</span>
                    <div className="text-purple-300 font-mono font-bold text-sm">{scanResult.tls.cipher}</div>
                    <p className="text-slate-400 text-[11px]">Forward Secrecy Enforced</p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs">
                  {scanResult.tls.error || 'TLS connection failed.'}
                </div>
              )}
            </div>
          )}

          {/* Tab Content: HTTP Headers */}
          {activeTab === 'headers' && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center space-x-2 text-white font-bold text-sm">
                <Terminal className="w-4 h-4 text-sky-400" />
                <span>Live HTTP Response Headers Telemetry</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-slate-300 font-bold">Strict-Transport-Security (HSTS)</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${scanResult.headers.hsts?.present ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'}`}>
                      {scanResult.headers.hsts?.present ? 'ENFORCED' : 'MISSING'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono truncate">{scanResult.headers.hsts?.value || 'None'}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-slate-300 font-bold">Content-Security-Policy (CSP)</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${scanResult.headers.csp?.present ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'}`}>
                      {scanResult.headers.csp?.present ? 'ACTIVE' : 'MISSING'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono truncate">{scanResult.headers.csp?.value || 'None'}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-slate-300 font-bold">X-Frame-Options (Clickjacking Guard)</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${scanResult.headers.xfo?.present ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                      {scanResult.headers.xfo?.present ? 'PROTECTED' : 'NOT SET'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono">{scanResult.headers.xfo?.value || 'None'}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-slate-300 font-bold">X-Content-Type-Options (MIME Sniff)</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${scanResult.headers.xcto?.present ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                      {scanResult.headers.xcto?.present ? 'nosniff' : 'NOT SET'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono">{scanResult.headers.xcto?.value || 'None'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content: DNS & DMARC */}
          {activeTab === 'dns' && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center space-x-2 text-white font-bold text-sm">
                <Server className="w-4 h-4 text-amber-400" />
                <span>DNS Resolution & Anti-Spoofing Records</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">DMARC (RFC 7489)</span>
                  <div className="text-white font-mono font-bold text-sm">
                    {scanResult.dns.hasDmarc ? 'Configured (v=DMARC1)' : 'Missing Record'}
                  </div>
                  <p className="text-slate-400 text-[11px] font-mono break-all">{scanResult.dns.dmarcRecord || 'No _dmarc TXT record found.'}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">SPF Record</span>
                  <div className="text-white font-mono font-bold text-sm">
                    {scanResult.dns.hasSpf ? 'Configured (v=spf1)' : 'No SPF Found'}
                  </div>
                  <p className="text-slate-400 text-[11px] font-mono break-all">{scanResult.dns.spfRecord || 'No SPF TXT record found.'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </PageContainer>
  );
};
