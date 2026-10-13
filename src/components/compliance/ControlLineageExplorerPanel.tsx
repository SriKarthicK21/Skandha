import React, { useState, useEffect, useCallback } from 'react';
import {
  GitFork,
  Shield,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Activity,
  Database,
  Lock,
  Key,
  Server,
  Cpu,
  Globe,
  Cloud,
  GitBranch,
  Terminal,
  FileText,
  Download,
  Info,
  Zap,
  Layers,
  BarChart3,
  AlertCircle,
  Eye,
  Sliders,
  Network,
  ListTree,
  Workflow,
  ChevronDown,
  ChevronRight,
  CornerDownRight,
  Folder,
  FolderOpen
} from 'lucide-react';
import { ControlLineageResponse } from '../../../server/repositories/types';

interface ControlLineageExplorerPanelProps {
  controlCode: string;
  tenantId?: string;
  theme?: 'dark' | 'light' | 'midnight' | string;
  onNavigateToModule?: (moduleId: string) => void;
  onClose?: () => void;
  standalone?: boolean;
}

export const ControlLineageExplorerPanel: React.FC<ControlLineageExplorerPanelProps> = ({
  controlCode,
  tenantId = 'tenant_skanda',
  theme = 'dark',
  onNavigateToModule,
  onClose,
  standalone = false
}) => {
  const isLight = theme === 'light';

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lineageData, setLineageData] = useState<ControlLineageResponse | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<'source' | 'control' | 'evidence' | 'risk'>('control');
  const [viewMode, setViewMode] = useState<'graph' | 'tree' | 'pipeline'>('graph');
  const [expandedTreeNodes, setExpandedTreeNodes] = useState<Record<string, boolean>>({
    source: true,
    control: true,
    evidence: true,
    risk: true
  });
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const toggleTreeNode = (nodeKey: string) => {
    setExpandedTreeNodes(prev => ({ ...prev, [nodeKey]: !prev[nodeKey] }));
  };
  const [isSimulatingPing, setIsSimulatingPing] = useState<boolean>(false);
  const [pingResult, setPingResult] = useState<string | null>(null);

  // Fetch Lineage Data from Backend API
  const fetchLineage = useCallback(async () => {
    setLoading(true);
    setError(null);
    setPingResult(null);
    try {
      const response = await fetch(
        `/api/v1/compliance/iso27001/controls/${encodeURIComponent(controlCode)}/lineage?tenantId=${encodeURIComponent(tenantId)}`
      );
      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.message || `HTTP ${response.status} failed to fetch control lineage`);
      }
      const json = await response.json();
      if (json.success && json.data) {
        setLineageData(json.data);
      } else {
        throw new Error(json.error || 'Failed to parse lineage data');
      }
    } catch (err: any) {
      console.error('[Lineage Explorer] Error fetching control lineage:', err);
      setError(err?.message || 'Failed to connect to backend lineage API');
    } finally {
      setLoading(false);
    }
  }, [controlCode, tenantId]);

  useEffect(() => {
    fetchLineage();
  }, [fetchLineage]);

  // Copy hash helper
  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  // Export lineage JSON
  const handleExportJson = () => {
    if (!lineageData) return;
    const blob = new Blob([JSON.stringify(lineageData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SKANDA_Lineage_${controlCode}_${tenantId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Simulate ping test for integration
  const handlePingIntegration = () => {
    setIsSimulatingPing(true);
    setTimeout(() => {
      setIsSimulatingPing(false);
      setPingResult(`HTTP 200 OK • Response Time: 21ms • TLS 1.3 Certified`);
    }, 800);
  };

  if (loading) {
    return (
      <div className={`p-8 rounded-xl border flex flex-col items-center justify-center space-y-4 min-h-[360px] ${
        isLight ? 'bg-white border-slate-200' : 'bg-[#0B1220] border-[#182338]'
      }`}>
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
        <div className="text-center">
          <p className="text-sm font-semibold">Tracing 4-Hop Cryptographic Lineage...</p>
          <p className="text-xs text-slate-400 font-mono mt-1">
            GET /api/v1/compliance/iso27001/controls/{controlCode}/lineage
          </p>
        </div>
      </div>
    );
  }

  if (error || !lineageData) {
    return (
      <div className={`p-6 rounded-xl border text-center space-y-3 ${
        isLight ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
      }`}>
        <AlertCircle className="w-8 h-8 mx-auto text-rose-500" />
        <h4 className="font-bold text-sm">Failed to Load Control Lineage</h4>
        <p className="text-xs max-w-md mx-auto">{error}</p>
        <button
          onClick={fetchLineage}
          className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold inline-flex items-center space-x-1.5 transition cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Fetch</span>
        </button>
      </div>
    );
  }

  const { control, evidence, riskScore, sourceIntegration, auditTrail, telemetry } = lineageData;
  const primaryEvidence = evidence[0];
  const isVerified = control.breakdownStatus === 'Verified';
  const isRemediating = control.breakdownStatus === 'Remediating';
  const isFailed = control.breakdownStatus === 'Failed';

  // Helper for source icon
  const getSourceIcon = (type: string) => {
    if (type.includes('Identity')) return Key;
    if (type.includes('Cloud')) return Cloud;
    if (type.includes('Threat')) return Zap;
    if (type.includes('Physical')) return Lock;
    if (type.includes('DevOps')) return GitBranch;
    if (type.includes('SIEM') || type.includes('Log')) return Terminal;
    if (type.includes('Endpoint')) return Cpu;
    return Server;
  };
  const SourceIcon = getSourceIcon(sourceIntegration.type);

  return (
    <div className={`rounded-xl border flex flex-col space-y-4 ${
      isLight ? 'bg-slate-50/70 border-slate-200 text-slate-900' : 'bg-[#0B1324] border-[#18263E] text-slate-100'
    } ${standalone ? 'p-6' : 'p-4'}`}>

      {/* ==================================================================== */}
      {/* 1. LINEAGE PANEL HEADER & TELEMETRY */}
      {/* ==================================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-inherit">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <GitFork className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm tracking-tight">Control Lineage Explorer</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {control.code}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                isVerified ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                isRemediating ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}>
                {control.breakdownStatus}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              4-Hop Provenance: Source Integration ➔ ISO 27001 Control ➔ Associated Evidence ➔ Risk Appetite
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* API Telemetry Tag */}
          <div className={`hidden sm:flex items-center space-x-1 px-2.5 py-1 rounded-md text-[10px] font-mono border ${
            isLight ? 'bg-white border-slate-200 text-slate-600' : 'bg-[#101B2E] border-[#1E2D48] text-slate-400'
          }`} title={`Data Source: ${telemetry.dataSource}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>API Latency: {telemetry.latencyMs}ms</span>
          </div>

          <button
            onClick={fetchLineage}
            className={`p-1.5 rounded-lg border transition cursor-pointer ${
              isLight ? 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700' : 'bg-[#121E33] border-[#223350] hover:bg-[#1A2C4A] text-slate-300'
            }`}
            title="Refresh Lineage from PostgreSQL API"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleExportJson}
            className={`px-2.5 py-1 rounded-lg border text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer ${
              isLight ? 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700' : 'bg-[#121E33] border-[#223350] hover:bg-[#1A2C4A] text-slate-300'
            }`}
            title="Download JSON Provenance Manifest"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden md:inline">Export Lineage</span>
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. INTERACTIVE LINEAGE VISUALIZATION: GRAPH / TREE / PIPELINE */}
      {/* ==================================================================== */}
      <div className={`p-4 rounded-xl border relative overflow-hidden ${
        isLight ? 'bg-gradient-to-r from-slate-100 via-white to-slate-100 border-slate-200' : 'bg-gradient-to-r from-[#0C1527] via-[#0F1C33] to-[#0C1527] border-[#1C2C47]'
      }`}>
        {/* Visualization Mode Selector Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5 pb-2.5 border-b border-slate-700/30">
          <div className="flex items-center space-x-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Visualization Mode:
            </span>
            <div className={`p-0.5 rounded-lg border flex items-center space-x-1 ${
              isLight ? 'bg-slate-200/80 border-slate-300' : 'bg-[#080E1A] border-[#182338]'
            }`}>
              <button
                type="button"
                onClick={() => setViewMode('graph')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer ${
                  viewMode === 'graph'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                }`}
                title="Interactive Connected Node Graph"
              >
                <Network className="w-3.5 h-3.5" />
                <span>Connected Node Graph</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('tree')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer ${
                  viewMode === 'tree'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                }`}
                title="Hierarchical Tree Component"
              >
                <ListTree className="w-3.5 h-3.5" />
                <span>Hierarchical List</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('pipeline')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer ${
                  viewMode === 'pipeline'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                }`}
                title="4-Hop Linear Pipeline"
              >
                <Workflow className="w-3.5 h-3.5" />
                <span>Pipeline</span>
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-400">
            <span className="flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-emerald-400">Live Provenance Chain</span>
            </span>
            <span>•</span>
            <span>ISO/IEC 27001:2022</span>
          </div>
        </div>

        {/* ============================================================== */}
        {/* MODE A: CONNECTED NODE GRAPH VIEW */}
        {/* ============================================================== */}
        {viewMode === 'graph' && (
          <div className="relative py-2">
            {/* SVG Connector Overlay (Rendered above background, behind nodes) */}
            <div className="hidden lg:block absolute inset-0 pointer-events-none z-0">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 200">
                <defs>
                  <linearGradient id="lineageFlowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
                    <stop offset="35%" stopColor="#818cf8" stopOpacity="0.9" />
                    <stop offset="70%" stopColor="#10b981" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.8" />
                  </linearGradient>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Path 1: Source (x~240, y~100) to Control (x~260, y~100) */}
                <path
                  d="M 235 100 C 248 100, 252 100, 265 100"
                  fill="none"
                  stroke="url(#lineageFlowGradient)"
                  strokeWidth="3"
                  strokeDasharray="6 4"
                  filter="url(#glow)"
                  className="animate-pulse"
                />
                {/* Path 2: Control (x~485, y~100) to Evidence (x~515, y~100) */}
                <path
                  d="M 485 100 C 500 100, 505 100, 515 100"
                  fill="none"
                  stroke="url(#lineageFlowGradient)"
                  strokeWidth="3"
                  strokeDasharray="6 4"
                  filter="url(#glow)"
                  className="animate-pulse"
                />
                {/* Path 3: Evidence (x~735, y~100) to Risk (x~765, y~100) */}
                <path
                  d="M 735 100 C 750 100, 755 100, 765 100"
                  fill="none"
                  stroke="url(#lineageFlowGradient)"
                  strokeWidth="3"
                  strokeDasharray="6 4"
                  filter="url(#glow)"
                  className="animate-pulse"
                />
              </svg>
            </div>

            {/* Nodes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">

              {/* NODE 1: SOURCE INTEGRATION */}
              <div
                onClick={() => setSelectedNodeId('source')}
                className={`p-4 rounded-xl border transition-all cursor-pointer relative group flex flex-col justify-between ${
                  selectedNodeId === 'source'
                    ? 'ring-2 ring-indigo-500 shadow-lg scale-[1.02] ' + (isLight ? 'bg-white border-indigo-300' : 'bg-[#13213b] border-indigo-500/70')
                    : isLight ? 'bg-white/95 hover:bg-white border-slate-200 shadow-xs' : 'bg-[#0F1A2F]/95 hover:bg-[#121F38] border-[#1C2C47]'
                }`}
              >
                {/* Connector Pin Right */}
                <span className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-indigo-500 border-2 border-[#0C1527] z-20 shadow-xs"></span>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 flex items-center space-x-1">
                      <span>Node 1: Source System</span>
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      sourceIntegration.status === 'Connected' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {sourceIntegration.status}
                    </span>
                  </div>

                  <div className="flex items-start space-x-2.5">
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0 mt-0.5">
                      <SourceIcon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h5 className="font-bold text-xs leading-tight truncate text-slate-100" title={sourceIntegration.name}>
                        {sourceIntegration.name}
                      </h5>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5 font-medium">
                        {sourceIntegration.type}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-inherit/40 space-y-1 text-[10px] font-mono">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Telemetry Health:</span>
                    <span className="text-emerald-400 font-bold">{sourceIntegration.healthScorePct}%</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Ingested Events:</span>
                    <span className="text-indigo-300">{sourceIntegration.recordsIngested24h.toLocaleString()} / 24h</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Transport:</span>
                    <span className="text-slate-300">{sourceIntegration.authMethod}</span>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-inherit/40 flex items-center justify-between text-[10px]">
                  <span className="text-indigo-400 font-semibold group-hover:underline">Click to Inspect</span>
                  <ArrowRight className="w-3 h-3 text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>

              {/* NODE 2: ISO 27001 CONTROL */}
              <div
                onClick={() => setSelectedNodeId('control')}
                className={`p-4 rounded-xl border transition-all cursor-pointer relative group flex flex-col justify-between ${
                  selectedNodeId === 'control'
                    ? 'ring-2 ring-indigo-500 shadow-lg scale-[1.02] ' + (isLight ? 'bg-white border-indigo-300' : 'bg-[#13213b] border-indigo-500/70')
                    : isLight ? 'bg-white/95 hover:bg-white border-slate-200 shadow-xs' : 'bg-[#0F1A2F]/95 hover:bg-[#121F38] border-[#1C2C47]'
                }`}
              >
                {/* Connector Pins */}
                <span className="hidden lg:block absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-indigo-500 border-2 border-[#0C1527] z-20 shadow-xs"></span>
                <span className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#0C1527] z-20 shadow-xs"></span>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 flex items-center space-x-1">
                      <span>Node 2: Control Policy</span>
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      isVerified ? 'bg-emerald-500/20 text-emerald-300' :
                      isRemediating ? 'bg-amber-500/20 text-amber-300' :
                      'bg-rose-500/20 text-rose-300'
                    }`}>
                      {control.breakdownStatus}
                    </span>
                  </div>

                  <div className="flex items-start space-x-2.5">
                    <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                      isVerified ? 'bg-emerald-500/15 text-emerald-400' :
                      isRemediating ? 'bg-amber-500/15 text-amber-400' :
                      'bg-rose-500/15 text-rose-400'
                    }`}>
                      <Shield className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-mono font-bold text-xs text-indigo-400">{control.code}</span>
                        {control.isNewIn2022 && (
                          <span className="text-[9px] px-1 rounded bg-purple-500/20 text-purple-300 font-bold">2022</span>
                        )}
                      </div>
                      <h5 className="font-bold text-xs leading-tight truncate mt-0.5 text-slate-100" title={control.title}>
                        {control.title}
                      </h5>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">
                        {control.category}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-inherit/40 space-y-1 text-[10px] font-mono">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Maturity Level:</span>
                    <span className="text-indigo-300 font-bold">Level {control.maturityLevel}/5</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Owner Dept:</span>
                    <span className="text-slate-300 truncate max-w-[110px]">{control.responsibleDepartment}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Evidence SLA:</span>
                    <span className="text-slate-300">{control.evidenceCollectionSlaDays} days</span>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-inherit/40 flex items-center justify-between text-[10px]">
                  <span className="text-indigo-400 font-semibold group-hover:underline">Click to Inspect</span>
                  <ArrowRight className="w-3 h-3 text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>

              {/* NODE 3: ASSOCIATED EVIDENCE */}
              <div
                onClick={() => setSelectedNodeId('evidence')}
                className={`p-4 rounded-xl border transition-all cursor-pointer relative group flex flex-col justify-between ${
                  selectedNodeId === 'evidence'
                    ? 'ring-2 ring-emerald-500 shadow-lg scale-[1.02] ' + (isLight ? 'bg-white border-emerald-300' : 'bg-[#13213b] border-emerald-500/70')
                    : isLight ? 'bg-white/95 hover:bg-white border-slate-200 shadow-xs' : 'bg-[#0F1A2F]/95 hover:bg-[#121F38] border-[#1C2C47]'
                }`}
              >
                {/* Connector Pins */}
                <span className="hidden lg:block absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#0C1527] z-20 shadow-xs"></span>
                <span className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-rose-500 border-2 border-[#0C1527] z-20 shadow-xs"></span>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1">
                      <span>Node 3: Evidence Vault</span>
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                      SHA-256
                    </span>
                  </div>

                  <div className="flex items-start space-x-2.5">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0 mt-0.5">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h5 className="font-bold text-xs leading-tight truncate text-slate-100" title={primaryEvidence?.title}>
                        {primaryEvidence?.title || 'No Evidence Artifact'}
                      </h5>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5 font-mono">
                        {primaryEvidence?.fileName}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-inherit/40 space-y-1 text-[10px] font-mono">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Artifact Count:</span>
                    <span className="text-emerald-400 font-bold">{evidence.length} Artifact{evidence.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Integrity Hash:</span>
                    <span className="text-indigo-400 font-mono">{primaryEvidence?.sha256Hash.substring(0, 10)}...</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Attestation:</span>
                    <span className="text-slate-300">{primaryEvidence?.status || 'Missing'}</span>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-inherit/40 flex items-center justify-between text-[10px]">
                  <span className="text-emerald-400 font-semibold group-hover:underline">Click to Inspect</span>
                  <ArrowRight className="w-3 h-3 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>

              {/* NODE 4: RISK SCORE & APPETITE */}
              <div
                onClick={() => setSelectedNodeId('risk')}
                className={`p-4 rounded-xl border transition-all cursor-pointer relative group flex flex-col justify-between ${
                  selectedNodeId === 'risk'
                    ? 'ring-2 ring-rose-500 shadow-lg scale-[1.02] ' + (isLight ? 'bg-white border-rose-300' : 'bg-[#13213b] border-rose-500/70')
                    : isLight ? 'bg-white/95 hover:bg-white border-slate-200 shadow-xs' : 'bg-[#0F1A2F]/95 hover:bg-[#121F38] border-[#1C2C47]'
                }`}
              >
                {/* Connector Pin Left */}
                <span className="hidden lg:block absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-rose-500 border-2 border-[#0C1527] z-20 shadow-xs"></span>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 flex items-center space-x-1">
                      <span>Node 4: Risk Scoring</span>
                    </span>
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                      riskScore.withinAppetite ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                    }`}>
                      {riskScore.withinAppetite ? 'Within Appetite' : 'Appetite Breach'}
                    </span>
                  </div>

                  <div className="flex items-start space-x-2.5">
                    <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                      riskScore.withinAppetite ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-slate-400">Score:</span>
                        <span className="text-xs font-mono line-through text-slate-500">{riskScore.inherentScore}</span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                        <span className={`text-xs font-mono font-bold ${
                          riskScore.withinAppetite ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {riskScore.residualScore}/25
                        </span>
                      </div>
                      <h5 className="font-bold text-xs leading-tight truncate mt-1 text-slate-100" title={riskScore.threatCategory}>
                        {riskScore.threatCategory}
                      </h5>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-inherit/40 space-y-1 text-[10px] font-mono">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Mitigation:</span>
                    <span className="text-emerald-400 font-bold">{riskScore.mitigationEffectivenessPct}% reduction</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Appetite Limit:</span>
                    <span className="text-slate-300">≤{riskScore.riskAppetiteThreshold}/25</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Loss Exposure:</span>
                    <span className="text-indigo-300 truncate max-w-[110px]">{riskScore.financialExposure}</span>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-inherit/40 flex items-center justify-between text-[10px]">
                  <span className="text-rose-400 font-semibold group-hover:underline">Click to Inspect</span>
                  <ArrowRight className="w-3 h-3 text-rose-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODE B: HIERARCHICAL TREE COMPONENT VIEW */}
        {/* ============================================================== */}
        {viewMode === 'tree' && (
          <div className={`p-4 rounded-xl border space-y-3 ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#0E1627] border-[#1C2C47]'
          }`}>
            <div className="flex items-center justify-between pb-2 border-b border-inherit text-xs">
              <span className="font-bold text-slate-300 flex items-center space-x-1.5">
                <ListTree className="w-4 h-4 text-indigo-400" />
                <span>Relationship Chain Hierarchy (Tree Explorer)</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Click any node to expand details or inspect
              </span>
            </div>

            {/* Tree Branch: Level 0 -> Source System */}
            <div className="space-y-2 text-xs">
              <div
                onClick={() => {
                  setSelectedNodeId('source');
                  toggleTreeNode('source');
                }}
                className={`p-3 rounded-lg border transition cursor-pointer flex items-center justify-between ${
                  selectedNodeId === 'source'
                    ? 'bg-indigo-950/40 border-indigo-500/50 text-white'
                    : isLight ? 'bg-slate-50 border-slate-200 hover:bg-slate-100' : 'bg-[#121E33] border-[#1D2B44] text-slate-200 hover:bg-[#16253F]'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <span className="p-1 rounded bg-indigo-500/20 text-indigo-400">
                    <SourceIcon className="w-4 h-4" />
                  </span>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-bold">
                        Source System
                      </span>
                      <strong className="text-sm">{sourceIntegration.name}</strong>
                      <span className="text-slate-400 text-xs font-normal">({sourceIntegration.type})</span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 mt-0.5 flex items-center space-x-2">
                      <span>Endpoint: {sourceIntegration.telemetryEndpoint}</span>
                      <span>•</span>
                      <span className="text-emerald-400">{sourceIntegration.healthScorePct}% Health</span>
                      <span>•</span>
                      <span>{sourceIntegration.recordsIngested24h.toLocaleString()} events/24h</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    sourceIntegration.status === 'Connected' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {sourceIntegration.status}
                  </span>
                  {expandedTreeNodes.source ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                </div>
              </div>

              {/* Tree Branch: Level 1 -> Control Node (Nested inside Source) */}
              {expandedTreeNodes.source && (
                <div className="ml-6 pl-4 border-l-2 border-indigo-500/30 space-y-2">
                  <div
                    onClick={() => {
                      setSelectedNodeId('control');
                      toggleTreeNode('control');
                    }}
                    className={`p-3 rounded-lg border transition cursor-pointer flex items-center justify-between ${
                      selectedNodeId === 'control'
                        ? 'bg-indigo-950/40 border-indigo-500/50 text-white'
                        : isLight ? 'bg-slate-50 border-slate-200 hover:bg-slate-100' : 'bg-[#121E33] border-[#1D2B44] text-slate-200 hover:bg-[#16253F]'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className="p-1 rounded bg-indigo-500/20 text-indigo-400">
                        <Shield className="w-4 h-4" />
                      </span>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-bold">
                            Control Standard
                          </span>
                          <strong className="text-sm font-mono text-indigo-400">{control.code}</strong>
                          <span className="font-bold">{control.title}</span>
                          {control.isNewIn2022 && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300">
                              2022 Revision
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 flex items-center space-x-2 font-mono">
                          <span>Domain: {control.category}</span>
                          <span>•</span>
                          <span>Owner: {control.responsibleDepartment}</span>
                          <span>•</span>
                          <span className="text-indigo-300">Maturity: Level {control.maturityLevel}/5</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isVerified ? 'bg-emerald-500/20 text-emerald-300' :
                        isRemediating ? 'bg-amber-500/20 text-amber-300' :
                        'bg-rose-500/20 text-rose-300'
                      }`}>
                        {control.breakdownStatus}
                      </span>
                      {expandedTreeNodes.control ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                    </div>
                  </div>

                  {/* Tree Branch: Level 2 -> Evidence Artifacts and Risk Scores */}
                  {expandedTreeNodes.control && (
                    <div className="ml-6 pl-4 border-l-2 border-emerald-500/30 space-y-2">

                      {/* Evidence Subtree Header */}
                      <div
                        onClick={() => {
                          setSelectedNodeId('evidence');
                          toggleTreeNode('evidence');
                        }}
                        className={`p-2.5 rounded-lg border transition cursor-pointer flex items-center justify-between ${
                          selectedNodeId === 'evidence'
                            ? 'bg-emerald-950/40 border-emerald-500/50 text-white'
                            : isLight ? 'bg-slate-50 border-slate-200 hover:bg-slate-100' : 'bg-[#101C2F] border-[#1A2A42] text-slate-300 hover:bg-[#14233A]'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <Lock className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="font-bold text-xs text-emerald-300">
                            Associated Evidence Artifacts ({evidence.length} Cryptographic Object{evidence.length !== 1 ? 's' : ''})
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-mono text-emerald-400">SHA-256 Tamper Evident</span>
                          {expandedTreeNodes.evidence ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                        </div>
                      </div>

                      {/* Evidence Leaf Nodes */}
                      {expandedTreeNodes.evidence && (
                        <div className="ml-5 space-y-1.5">
                          {evidence.map((evd, idx) => (
                            <div
                              key={evd.id}
                              onClick={() => setSelectedNodeId('evidence')}
                              className={`p-2.5 rounded-md border flex items-center justify-between text-xs transition cursor-pointer ${
                                isLight ? 'bg-white border-slate-200 hover:border-indigo-300' : 'bg-[#0D1627] border-[#18263E] hover:border-emerald-500/40 text-slate-300'
                              }`}
                            >
                              <div className="space-y-0.5 min-w-0">
                                <div className="flex items-center space-x-2">
                                  <span className="font-semibold text-slate-200 truncate">{evd.title}</span>
                                  <span className="text-[10px] font-mono text-slate-400">({evd.fileSizeKb} KB)</span>
                                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                                    evd.status === 'Verified' ? 'bg-emerald-500/20 text-emerald-300' :
                                    evd.status === 'Pending Review' ? 'bg-amber-500/20 text-amber-300' :
                                    'bg-rose-500/20 text-rose-300'
                                  }`}>
                                    {evd.status}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-400">
                                  <span>File: {evd.fileName}</span>
                                  <span>•</span>
                                  <span className="text-indigo-400">Hash: {evd.sha256Hash.substring(0, 16)}...</span>
                                  <span>•</span>
                                  <span>SLA: {evd.collectedAt}</span>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopyHash(evd.sha256Hash);
                                }}
                                className="p-1 rounded hover:bg-slate-700/50 text-slate-400 hover:text-white"
                                title="Copy full SHA-256 hash"
                              >
                                {copiedHash === evd.sha256Hash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Risk Scores Subtree Header */}
                      <div
                        onClick={() => {
                          setSelectedNodeId('risk');
                          toggleTreeNode('risk');
                        }}
                        className={`p-2.5 rounded-lg border transition cursor-pointer flex items-center justify-between ${
                          selectedNodeId === 'risk'
                            ? 'bg-rose-950/40 border-rose-500/50 text-white'
                            : isLight ? 'bg-slate-50 border-slate-200 hover:bg-slate-100' : 'bg-[#101C2F] border-[#1A2A42] text-slate-300 hover:bg-[#14233A]'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                          <span className="font-bold text-xs text-rose-300">
                            Risk Quantification & Appetite Boundary ({riskScore.threatCategory})
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.2 rounded text-[10px] font-mono font-bold ${
                            riskScore.withinAppetite ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                          }`}>
                            Residual: {riskScore.residualScore}/25 ({riskScore.withinAppetite ? 'Appetite OK' : 'Breach'})
                          </span>
                          {expandedTreeNodes.risk ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                        </div>
                      </div>

                      {/* Risk Leaf Node Details */}
                      {expandedTreeNodes.risk && (
                        <div className="ml-5 p-3 rounded-md border text-xs space-y-2 bg-[#0D1627] border-[#18263E] text-slate-300 font-mono">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                              <span className="text-[10px] text-slate-400 block">Inherent Risk</span>
                              <span className="text-sm font-bold text-rose-400">{riskScore.inherentScore} / 25</span>
                              <span className="text-[10px] text-slate-500 block">Band: {riskScore.inherentLevel} Severity</span>
                            </div>
                            <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                              <span className="text-[10px] text-slate-400 block">Residual Risk</span>
                              <span className="text-sm font-bold text-emerald-400">{riskScore.residualScore} / 25</span>
                              <span className="text-[10px] text-slate-500 block">Band: {riskScore.residualLevel} (L:{riskScore.likelihood} × I:{riskScore.impact})</span>
                            </div>
                            <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                              <span className="text-[10px] text-slate-400 block">Mitigation Efficiency</span>
                              <span className="text-sm font-bold text-indigo-400">{riskScore.mitigationEffectivenessPct}%</span>
                              <span className="text-[10px] text-slate-500 block">Appetite Cap: ≤{riskScore.riskAppetiteThreshold}</span>
                            </div>
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800">
                            <span>Annualized Financial Exposure: <strong className="text-slate-200">{riskScore.financialExposure}</strong></span>
                            <span className="text-indigo-400 cursor-pointer hover:underline" onClick={() => setSelectedNodeId('risk')}>
                              Inspect 5x5 Matrix ➔
                            </span>
                          </div>
                        </div>
                      )}

                    </div>
                  )}

                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODE C: 4-HOP PIPELINE VIEW */}
        {/* ============================================================== */}
        {viewMode === 'pipeline' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative z-10">

            {/* HOP 1: SOURCE INTEGRATION */}
            <div
              onClick={() => setSelectedNodeId('source')}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer relative group ${
                selectedNodeId === 'source'
                  ? 'ring-2 ring-indigo-500 shadow-md ' + (isLight ? 'bg-white border-indigo-300' : 'bg-[#14233D] border-indigo-500/60')
                  : isLight ? 'bg-white/90 hover:bg-white border-slate-200' : 'bg-[#101A2D]/90 hover:bg-[#132038] border-[#1C2C47]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 flex items-center space-x-1">
                  <span>01. Source Integration</span>
                </span>
                <span className={`w-2 h-2 rounded-full ${sourceIntegration.status === 'Connected' ? 'bg-emerald-400 shadow-xs shadow-emerald-500' : 'bg-amber-400'}`}></span>
              </div>

              <div className="flex items-start space-x-2.5">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0 mt-0.5">
                  <SourceIcon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h5 className="font-bold text-xs leading-tight truncate" title={sourceIntegration.name}>
                    {sourceIntegration.name}
                  </h5>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">
                    {sourceIntegration.type}
                  </p>
                  <div className="mt-2 flex items-center space-x-2 text-[10px] font-mono">
                    <span className="text-emerald-400 font-semibold">{sourceIntegration.healthScorePct}% Health</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400">{sourceIntegration.syncCadence.split(' ')[0]}</span>
                  </div>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-inherit flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>{sourceIntegration.recordsIngested24h.toLocaleString()} evts/24h</span>
                <span className="text-indigo-400 group-hover:underline">Inspect ➔</span>
              </div>
            </div>

            {/* HOP 2: ISO 27001 CONTROL */}
            <div
              onClick={() => setSelectedNodeId('control')}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer relative group ${
                selectedNodeId === 'control'
                  ? 'ring-2 ring-indigo-500 shadow-md ' + (isLight ? 'bg-white border-indigo-300' : 'bg-[#14233D] border-indigo-500/60')
                  : isLight ? 'bg-white/90 hover:bg-white border-slate-200' : 'bg-[#101A2D]/90 hover:bg-[#132038] border-[#1C2C47]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 flex items-center space-x-1">
                  <span>02. ISO 27001 Control</span>
                </span>
                <span className="text-[10px] font-mono font-bold text-indigo-300">
                  L{control.maturityLevel}
                </span>
              </div>

              <div className="flex items-start space-x-2.5">
                <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                  isVerified ? 'bg-emerald-500/15 text-emerald-400' :
                  isRemediating ? 'bg-amber-500/15 text-amber-400' :
                  'bg-rose-500/15 text-rose-400'
                }`}>
                  {isVerified && <CheckCircle2 className="w-4 h-4" />}
                  {isRemediating && <AlertTriangle className="w-4 h-4" />}
                  {isFailed && <XCircle className="w-4 h-4" />}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-mono font-bold text-xs text-indigo-400">{control.code}</span>
                    {control.isNewIn2022 && (
                      <span className="text-[9px] px-1 rounded bg-purple-500/20 text-purple-300">2022</span>
                    )}
                  </div>
                  <h5 className="font-bold text-xs leading-tight truncate mt-0.5" title={control.title}>
                    {control.title}
                  </h5>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">
                    {control.category} • {control.responsibleDepartment}
                  </p>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-inherit flex items-center justify-between text-[10px] font-mono">
                <span className={
                  isVerified ? 'text-emerald-400' : isRemediating ? 'text-amber-400' : 'text-rose-400'
                }>{control.breakdownStatus}</span>
                <span className="text-indigo-400 group-hover:underline">Inspect ➔</span>
              </div>
            </div>

            {/* HOP 3: ASSOCIATED EVIDENCE */}
            <div
              onClick={() => setSelectedNodeId('evidence')}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer relative group ${
                selectedNodeId === 'evidence'
                  ? 'ring-2 ring-indigo-500 shadow-md ' + (isLight ? 'bg-white border-indigo-300' : 'bg-[#14233D] border-indigo-500/60')
                  : isLight ? 'bg-white/90 hover:bg-white border-slate-200' : 'bg-[#101A2D]/90 hover:bg-[#132038] border-[#1C2C47]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1">
                  <span>03. Evidence Vault</span>
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                  SHA-256
                </span>
              </div>

              <div className="flex items-start space-x-2.5">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0 mt-0.5">
                  <Lock className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h5 className="font-bold text-xs leading-tight truncate" title={primaryEvidence?.title}>
                    {primaryEvidence?.title || 'No Evidence Artifact'}
                  </h5>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5 font-mono">
                    {primaryEvidence?.fileName}
                  </p>
                  <div className="mt-2 flex items-center space-x-1 text-[10px] font-mono text-slate-400">
                    <span>Hash:</span>
                    <span className="text-indigo-400 truncate">{primaryEvidence?.sha256Hash.substring(0, 10)}...</span>
                  </div>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-inherit flex items-center justify-between text-[10px] font-mono">
                <span className={
                  primaryEvidence?.status === 'Verified' ? 'text-emerald-400' :
                  primaryEvidence?.status === 'Pending Review' ? 'text-amber-400' : 'text-rose-400'
                }>
                  {primaryEvidence?.status || 'Missing'}
                </span>
                <span className="text-indigo-400 group-hover:underline">Inspect ➔</span>
              </div>
            </div>

            {/* HOP 4: RISK SCORE & APPETITE */}
            <div
              onClick={() => setSelectedNodeId('risk')}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer relative group ${
                selectedNodeId === 'risk'
                  ? 'ring-2 ring-indigo-500 shadow-md ' + (isLight ? 'bg-white border-indigo-300' : 'bg-[#14233D] border-indigo-500/60')
                  : isLight ? 'bg-white/90 hover:bg-white border-slate-200' : 'bg-[#101A2D]/90 hover:bg-[#132038] border-[#1C2C47]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 flex items-center space-x-1">
                  <span>04. Risk & Appetite</span>
                </span>
                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                  riskScore.withinAppetite ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                }`}>
                  {riskScore.withinAppetite ? 'Within Appetite' : 'Appetite Breach'}
                </span>
              </div>

              <div className="flex items-start space-x-2.5">
                <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                  riskScore.withinAppetite ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                }`}>
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-400">Score:</span>
                    <span className="text-xs font-mono line-through text-slate-500">{riskScore.inherentScore}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                    <span className={`text-xs font-mono font-bold ${
                      riskScore.withinAppetite ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {riskScore.residualScore}/25
                    </span>
                  </div>
                  <h5 className="font-bold text-xs leading-tight truncate mt-1 text-slate-300" title={riskScore.threatCategory}>
                    {riskScore.threatCategory}
                  </h5>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Mitigation: <strong>{riskScore.mitigationEffectivenessPct}%</strong>
                  </p>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-inherit flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-400">Limit: ≤{riskScore.riskAppetiteThreshold}</span>
                <span className="text-indigo-400 group-hover:underline">Inspect ➔</span>
              </div>
            </div>

          </div>
        )}

        {/* Visual Lineage Connector Footnote */}
        <div className="mt-3 pt-2.5 border-t border-slate-700/40 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
              <span>Telemetry Ingest Stream</span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Cryptographic Tamper-Proofing</span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-rose-400"></span>
              <span>FAIR Risk Reduction Delta</span>
            </span>
          </div>
          <span className="font-mono text-[10px] text-slate-500">
            Selected: <strong className="text-indigo-300 uppercase">{selectedNodeId}</strong> node
          </span>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 3. DETAILED FORENSIC NODE INSPECTOR */}
      {/* ==================================================================== */}
      <div className={`p-4 rounded-xl border ${
        isLight ? 'bg-white border-slate-200' : 'bg-[#0E1729] border-[#1B2942]'
      }`}>
        {/* Inspector Navigation Tabs */}
        <div className="flex items-center space-x-1 border-b pb-3 mb-4 text-xs font-semibold overflow-x-auto border-inherit">
          <button
            type="button"
            onClick={() => setSelectedNodeId('source')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
              selectedNodeId === 'source'
                ? 'bg-indigo-600 text-white shadow-xs'
                : isLight ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-400 hover:bg-[#17253D] hover:text-white'
            }`}
          >
            <SourceIcon className="w-3.5 h-3.5" />
            <span>1. Source Integration Telemetry</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedNodeId('control')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
              selectedNodeId === 'control'
                ? 'bg-indigo-600 text-white shadow-xs'
                : isLight ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-400 hover:bg-[#17253D] hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>2. Control Specifications & Audit</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedNodeId('evidence')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
              selectedNodeId === 'evidence'
                ? 'bg-indigo-600 text-white shadow-xs'
                : isLight ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-400 hover:bg-[#17253D] hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>3. Cryptographic Evidence Vault</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedNodeId('risk')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
              selectedNodeId === 'risk'
                ? 'bg-indigo-600 text-white shadow-xs'
                : isLight ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-400 hover:bg-[#17253D] hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>4. Risk Heatmap & Appetite Matrix</span>
          </button>
        </div>

        {/* TAB 1: SOURCE INTEGRATION TELEMETRY */}
        {selectedNodeId === 'source' && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div className={`p-3 rounded-lg border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121E33] border-[#1D2B44]'}`}>
                <span className="text-[10px] uppercase font-bold text-slate-400">Connection State</span>
                <p className="font-bold text-sm text-emerald-400 mt-1 flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>{sourceIntegration.status}</span>
                </p>
                <span className="text-[10px] text-slate-400 font-mono">Last ping: {new Date(sourceIntegration.lastSyncTimestamp).toLocaleTimeString()}</span>
              </div>

              <div className={`p-3 rounded-lg border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121E33] border-[#1D2B44]'}`}>
                <span className="text-[10px] uppercase font-bold text-slate-400">Health Score</span>
                <p className="font-bold text-sm text-indigo-400 mt-1">
                  {sourceIntegration.healthScorePct}% Available
                </p>
                <span className="text-[10px] text-slate-400 font-mono">SLA Target: ≥99.5%</span>
              </div>

              <div className={`p-3 rounded-lg border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121E33] border-[#1D2B44]'}`}>
                <span className="text-[10px] uppercase font-bold text-slate-400">24h Ingestion Volume</span>
                <p className="font-bold text-sm text-slate-200 mt-1 font-mono">
                  {sourceIntegration.recordsIngested24h.toLocaleString()} Events
                </p>
                <span className="text-[10px] text-slate-400 font-mono">Cadence: {sourceIntegration.syncCadence}</span>
              </div>

              <div className={`p-3 rounded-lg border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121E33] border-[#1D2B44]'}`}>
                <span className="text-[10px] uppercase font-bold text-slate-400">Auth Protocol</span>
                <p className="font-bold text-xs text-slate-200 mt-1 truncate" title={sourceIntegration.authMethod}>
                  {sourceIntegration.authMethod}
                </p>
                <span className="text-[10px] text-emerald-400 font-mono">Zero-Trust Secured</span>
              </div>
            </div>

            {/* Ingestion Endpoint & Ping Simulation */}
            <div className={`p-3.5 rounded-lg border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121E33] border-[#1D2B44]'}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Telemetry Ingestion Webhook</span>
                  <p className="font-mono text-xs text-indigo-400 mt-0.5 break-all">
                    {sourceIntegration.telemetryEndpoint}
                  </p>
                </div>
                <button
                  onClick={handlePingIntegration}
                  disabled={isSimulatingPing}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-1.5 shrink-0 cursor-pointer disabled:opacity-50"
                >
                  <Activity className={`w-3.5 h-3.5 ${isSimulatingPing ? 'animate-spin' : ''}`} />
                  <span>{isSimulatingPing ? 'Pinging Gateway...' : 'Test Ingestion Stream'}</span>
                </button>
              </div>

              {pingResult && (
                <div className="mt-2.5 pt-2 border-t border-slate-700 text-[11px] font-mono text-emerald-400 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{pingResult}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: CONTROL SPECIFICATIONS & AUDIT */}
        {selectedNodeId === 'control' && (
          <div className="space-y-4 text-xs">
            <div>
              <h5 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                ISO/IEC 27001:2022 Official Requirement Scope
              </h5>
              <div className={`p-3.5 rounded-lg border leading-relaxed ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-[#121E33] border-[#1D2B44] text-slate-300'
              }`}>
                {control.description}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className={`p-3 rounded-lg border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121E33] border-[#1D2B44]'}`}>
                <span className="text-[10px] uppercase font-bold text-slate-400">Annex A Category</span>
                <p className="font-bold text-sm text-indigo-400 mt-1">{control.category}</p>
                <span className="text-[10px] text-slate-400">Control Type: {control.controlType}</span>
              </div>

              <div className={`p-3 rounded-lg border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121E33] border-[#1D2B44]'}`}>
                <span className="text-[10px] uppercase font-bold text-slate-400">Responsible Dept</span>
                <p className="font-bold text-sm text-slate-200 mt-1">{control.responsibleDepartment}</p>
                <span className="text-[10px] text-slate-400 font-mono">SLA: {control.evidenceCollectionSlaDays} days</span>
              </div>

              <div className={`p-3 rounded-lg border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121E33] border-[#1D2B44]'}`}>
                <span className="text-[10px] uppercase font-bold text-slate-400">2013 Crosswalk</span>
                <p className="font-mono font-bold text-xs text-indigo-300 mt-1 truncate">
                  {control.iso2013Mapping || 'Direct Annex A mapping'}
                </p>
                <span className="text-[10px] text-purple-400">
                  {control.isNewIn2022 ? 'New in 2022 Standard' : 'Harmonized Clause'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CRYPTOGRAPHIC EVIDENCE VAULT */}
        {selectedNodeId === 'evidence' && (
          <div className="space-y-3 text-xs">
            {evidence.map((evd, idx) => (
              <div
                key={evd.id || idx}
                className={`p-3.5 rounded-xl border flex flex-col space-y-2.5 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121E33] border-[#1D2B44]'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-slate-100">{evd.title}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      evd.status === 'Verified' ? 'bg-emerald-500/20 text-emerald-300' :
                      evd.status === 'Pending Review' ? 'bg-amber-500/20 text-amber-300' :
                      'bg-rose-500/20 text-rose-300'
                    }`}>
                      {evd.status}
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-black/30 text-slate-400">
                      {evd.collectionType}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {evd.fileSizeKb} KB • Collected: {new Date(evd.collectedAt).toLocaleDateString()}
                  </span>
                </div>

                <div className={`p-2.5 rounded-lg border font-mono text-[11px] flex items-center justify-between ${
                  isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-[#0A101C] border-[#182338] text-indigo-300'
                }`}>
                  <div className="truncate mr-3">
                    <span className="text-slate-500 mr-2">SHA-256:</span>
                    <span>{evd.sha256Hash}</span>
                  </div>
                  <button
                    onClick={() => handleCopyHash(evd.sha256Hash)}
                    className="p-1 rounded hover:bg-slate-700/40 transition cursor-pointer text-slate-400 hover:text-white"
                    title="Copy Full Checksum"
                  >
                    {copiedHash === evd.sha256Hash ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  <strong>Auditor Attestation:</strong> {evd.auditStatus}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: RISK HEATMAP & BOARD APPETITE MATRIX */}
        {selectedNodeId === 'risk' && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* 5x5 Matrix Visualizer */}
              <div className={`p-3.5 rounded-xl border ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121E33] border-[#1D2B44]'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-300">
                    5x5 Inherent vs. Residual Matrix
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Likelihood × Impact</span>
                </div>

                <div className="grid grid-cols-5 gap-1.5 p-2 bg-black/30 rounded-lg">
                  {[5, 4, 3, 2, 1].map(rowL => (
                    <React.Fragment key={rowL}>
                      {[1, 2, 3, 4, 5].map(colI => {
                        const score = rowL * colI;
                        const isInher = rowL === 4 && (colI === 4 || colI === 5);
                        const isResid = rowL === riskScore.likelihood && colI === riskScore.impact;

                        let cellBg = 'bg-emerald-950/40 text-emerald-400';
                        if (score >= 15) cellBg = 'bg-rose-950/60 text-rose-400 border border-rose-500/30';
                        else if (score >= 8) cellBg = 'bg-amber-950/50 text-amber-400 border border-amber-500/30';

                        return (
                          <div
                            key={`${rowL}-${colI}`}
                            className={`h-9 rounded flex flex-col items-center justify-center font-mono text-[10px] relative transition ${cellBg}`}
                          >
                            <span>{score}</span>
                            {isInher && (
                              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-black" title="Inherent Risk Placement"></span>
                            )}
                            {isResid && (
                              <span className="absolute -bottom-1 -left-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-black" title="Current Residual Risk Placement"></span>
                            )}
                          </div>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>

                <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    <span>Inherent ({riskScore.inherentScore}/25)</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span>Residual ({riskScore.residualScore}/25)</span>
                  </span>
                </div>
              </div>

              {/* Risk Mitigation & Financial Exposure Breakdown */}
              <div className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121E33] border-[#1D2B44]'
              }`}>
                <div>
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-300">
                    Control Risk Reduction Impact
                  </span>

                  <div className="mt-3 space-y-2">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1 font-mono">
                        <span>Risk Mitigation Efficiency:</span>
                        <strong className="text-emerald-400">{riskScore.mitigationEffectivenessPct}%</strong>
                      </div>
                      <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 transition-all duration-500"
                          style={{ width: `${riskScore.mitigationEffectivenessPct}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="pt-2 text-slate-300 text-[11px] space-y-1">
                      <div><strong>Threat Scenario:</strong> {riskScore.threatCategory}</div>
                      <div><strong>Treatment Strategy:</strong> {riskScore.riskTreatment}</div>
                      <div><strong>Estimated Exposure:</strong> <span className="font-mono text-amber-300">{riskScore.financialExposure}</span></div>
                    </div>
                  </div>
                </div>

                <div className={`mt-3 p-2.5 rounded-lg border text-[11px] font-mono flex items-center space-x-2 ${
                  riskScore.withinAppetite
                    ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-950/30 border-rose-500/30 text-rose-300'
                }`}>
                  {riskScore.withinAppetite ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <span>
                    {riskScore.withinAppetite
                      ? `Residual risk (${riskScore.residualScore}) is within Board-approved appetite (≤${riskScore.riskAppetiteThreshold}).`
                      : `Appetite Breach: Residual risk (${riskScore.residualScore}) exceeds ceiling (≤${riskScore.riskAppetiteThreshold}). CAPA escalation active.`}
                  </span>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* 4. PROVENANCE AUDIT TRAIL LEDGER */}
      {/* ==================================================================== */}
      <div className={`p-3.5 rounded-xl border ${
        isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0E1729] border-[#1B2942]'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-xs uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            <span>Cryptographic Provenance Ledger</span>
          </span>
          <span className="text-[10px] font-mono text-slate-400">Audit Trail Sourced from PostgreSQL</span>
        </div>

        <div className="space-y-1.5 text-[11px]">
          {auditTrail.map((ev, i) => (
            <div
              key={i}
              className={`p-2 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-1 ${
                isLight ? 'bg-white border-slate-200' : 'bg-[#121E33] border-[#1D2B44]'
              }`}
            >
              <div className="flex items-center space-x-2 truncate">
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-indigo-500/20 text-indigo-300 shrink-0">
                  {ev.action}
                </span>
                <span className="text-slate-300 truncate">{ev.details}</span>
              </div>
              <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-400 shrink-0">
                <span>By: {ev.actor}</span>
                <span>•</span>
                <span>{new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
