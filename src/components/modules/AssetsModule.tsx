import React, { useState } from 'react';
import { useGRC } from '../../context/GRCContext';
import { PageContainer } from '../layout/PageContainer';
import { useToast } from '../common/ToastContainer';
import { safeConfirm } from '../../utils/safeConfirm';
import {
  Server,
  Plus,
  Search,
  Filter,
  Trash2,
  HardDrive,
  Cloud,
  Database,
  Shield,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  ChevronRight,
  Activity,
  Zap,
  Lock,
  X,
  FileCheck2,
  Bug
} from 'lucide-react';

export interface AssetItem {
  id: string;
  name: string;
  type: 'Cloud Infrastructure' | 'SaaS Platform' | 'Hardware Server' | 'Database' | 'Endpoint' | 'AI Model / Microservice';
  criticality: 'High' | 'Medium' | 'Low';
  isCriticalSystem: boolean; // MAS TRM Critical System designation
  rtoHours: number; // Recovery Time Objective
  rpoHours: number; // Recovery Point Objective
  owner: string;
  businessService: string;
  location: string;
  classification: 'Confidential' | 'Restricted' | 'Internal' | 'Public';
  cveVulnerabilitiesCount: number;
  patchStatus: 'Current (0-day clean)' | 'Patching in progress' | 'Maintenance scheduled';
  linkedControls: string[];
  linkedRisks: string[];
  hostingVendor: string;
  lastScannedDate: string;
}

export const AssetsModule: React.FC = () => {
  const { currentTenant, setActiveModule, theme } = useGRC();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'inventory' | 'critical_systems' | 'vulnerabilities' | 'traceability'>('inventory');

  const [assets, setAssets] = useState<AssetItem[]>([
    {
      id: 'ast_001',
      name: 'AWS Primary Production VPC (eu-west-1)',
      type: 'Cloud Infrastructure',
      criticality: 'High',
      isCriticalSystem: true,
      rtoHours: 2,
      rpoHours: 0.25,
      owner: 'DevOps Lead',
      businessService: 'Core Banking API & Client Ingestion',
      location: 'AWS Ireland (eu-west-1)',
      classification: 'Confidential',
      cveVulnerabilitiesCount: 0,
      patchStatus: 'Current (0-day clean)',
      linkedControls: ['A.5.9', 'A.8.1', 'A.8.6', 'MAS TRM 8.1'],
      linkedRisks: ['RSK-002: Cloud Outage in Primary Region'],
      hostingVendor: 'Amazon Web Services',
      lastScannedDate: '2026-09-12'
    },
    {
      id: 'ast_002',
      name: 'PostgreSQL Multi-Tenant Production DB Cluster',
      type: 'Database',
      criticality: 'High',
      isCriticalSystem: true,
      rtoHours: 1,
      rpoHours: 0.1,
      owner: 'Principal DBA',
      businessService: 'Customer Account Balances & Ledgers',
      location: 'AWS RDS Aurora eu-west-1',
      classification: 'Restricted',
      cveVulnerabilitiesCount: 0,
      patchStatus: 'Current (0-day clean)',
      linkedControls: ['A.8.11', 'A.8.24', 'MAS TRM 11.2'],
      linkedRisks: ['RSK-005: Unauthorized Database Access'],
      hostingVendor: 'Amazon Web Services',
      lastScannedDate: '2026-09-14'
    },
    {
      id: 'ast_003',
      name: 'Corporate GitHub Enterprise Cloud',
      type: 'SaaS Platform',
      criticality: 'High',
      isCriticalSystem: false,
      rtoHours: 4,
      rpoHours: 1,
      owner: 'Security Lead',
      businessService: 'Continuous Integration & Code Deployments',
      location: 'GitHub Cloud SaaS',
      classification: 'Confidential',
      cveVulnerabilitiesCount: 1,
      patchStatus: 'Maintenance scheduled',
      linkedControls: ['A.8.28', 'A.8.32'],
      linkedRisks: ['RSK-008: Source Code Leakage via Dependency'],
      hostingVendor: 'Microsoft GitHub',
      lastScannedDate: '2026-09-10'
    },
    {
      id: 'ast_004',
      name: 'Google Workspace Enterprise Identity & Email',
      type: 'SaaS Platform',
      criticality: 'High',
      isCriticalSystem: false,
      rtoHours: 4,
      rpoHours: 1,
      owner: 'IT Operations Lead',
      businessService: 'Workforce Authentication & Secure Communication',
      location: 'Google Cloud Platform',
      classification: 'Confidential',
      cveVulnerabilitiesCount: 0,
      patchStatus: 'Current (0-day clean)',
      linkedControls: ['A.5.15', 'A.8.5'],
      linkedRisks: ['RSK-001: Phishing Credential Theft'],
      hostingVendor: 'Google Cloud',
      lastScannedDate: '2026-09-13'
    },
    {
      id: 'ast_005',
      name: 'MDM-Managed Developer Laptops (Apple macOS)',
      type: 'Endpoint',
      criticality: 'Medium',
      isCriticalSystem: false,
      rtoHours: 8,
      rpoHours: 4,
      owner: 'Workplace Engineering Lead',
      businessService: 'Internal Developer Workstations',
      location: 'Hybrid Workplace Global',
      classification: 'Internal',
      cveVulnerabilitiesCount: 3,
      patchStatus: 'Patching in progress',
      linkedControls: ['A.8.1', 'A.8.7', 'A.8.8'],
      linkedRisks: ['RSK-010: Endpoint Malware Compromise'],
      hostingVendor: 'Internal Jamf MDM',
      lastScannedDate: '2026-09-14'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [criticalFilter, setCriticalFilter] = useState('All');
  const [selectedAsset, setSelectedAsset] = useState<AssetItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<AssetItem['type']>('Cloud Infrastructure');
  const [criticality, setCriticality] = useState<AssetItem['criticality']>('High');
  const [owner, setOwner] = useState('');
  const [businessService, setBusinessService] = useState('');
  const [location, setLocation] = useState('AWS Ireland (eu-west-1)');
  const [classification, setClassification] = useState<AssetItem['classification']>('Confidential');
  const [isCriticalSystem, setIsCriticalSystem] = useState(false);
  const [rtoHours, setRtoHours] = useState(4);

  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newAsset: AssetItem = {
      id: `ast_${Date.now().toString().slice(-4)}`,
      name,
      type,
      criticality,
      isCriticalSystem,
      rtoHours: Number(rtoHours) || 4,
      rpoHours: Number(rtoHours) <= 2 ? 0.25 : 1,
      owner: owner || 'Operations Lead',
      businessService: businessService || 'Core Platform Services',
      location,
      classification,
      cveVulnerabilitiesCount: 0,
      patchStatus: 'Current (0-day clean)',
      linkedControls: ['A.5.9', 'A.8.1'],
      linkedRisks: ['RSK-001: Platform Unavailability'],
      hostingVendor: 'AWS Cloud',
      lastScannedDate: new Date().toISOString().split('T')[0]
    };

    setAssets(prev => [newAsset, ...prev]);
    setName('');
    setOwner('');
    setBusinessService('');
    setShowAddModal(false);
    showToast({
      title: 'Asset Registered',
      message: `${newAsset.name} added to CMDB and mapped to ISO 27001 controls.`,
      type: 'success'
    });
  };

  const handleDelete = (id: string, assetName: string) => {
    if (safeConfirm(`Remove asset "${assetName}" from inventory?`)) {
      setAssets(prev => prev.filter(a => a.id !== id));
      if (selectedAsset?.id === id) {
        setSelectedAsset(null);
      }
      showToast({
        title: 'Asset Removed',
        message: `${assetName} has been purged from active CMDB inventory.`,
        type: 'warning'
      });
    }
  };

  const filteredAssets = assets.filter(a => {
    const matchesSearch =
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.businessService.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'All' || a.type === typeFilter;
    const matchesCritical =
      criticalFilter === 'All' ||
      (criticalFilter === 'Critical' && a.isCriticalSystem) ||
      (criticalFilter === 'NonCritical' && !a.isCriticalSystem);
    return matchesSearch && matchesType && matchesCritical;
  });

  const criticalSystemsCount = assets.filter(a => a.isCriticalSystem).length;
  const cleanPatchCount = assets.filter(a => a.patchStatus === 'Current (0-day clean)').length;

  return (
    <PageContainer id="assets-module">
      {/* Top Header Card */}
      <div className={`p-5 sm:p-6 rounded-2xl border shadow-sm transition-colors ${
        theme === 'light'
          ? 'bg-gradient-to-r from-indigo-50/80 via-sky-50/50 to-white border-slate-200'
          : 'bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border-slate-800'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                theme === 'light'
                  ? 'bg-indigo-100 text-indigo-800 border-indigo-300'
                  : 'bg-indigo-950/80 text-indigo-300 border-indigo-800'
              }`}>
                ISO 27001 A.5.9, A.8.1 & MAS TRM Critical Systems
              </span>
              <span className={`text-xs ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                Total Cataloged Assets: <strong className={theme === 'light' ? 'text-slate-900' : 'text-white'}>{assets.length}</strong>
              </span>
            </div>
            <h1 className={`text-xl sm:text-2xl font-black tracking-tight ${
              theme === 'light' ? 'text-slate-900' : 'text-white'
            }`}>
              Asset Inventory & Configuration Management (CMDB)
            </h1>
            <p className={`text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed ${
              theme === 'light' ? 'text-slate-600' : 'text-slate-300'
            }`}>
              Maintain continuous discovery and ownership of systems, cloud infrastructure, databases, RTO/RPO targets, linked risks, and vulnerability patch status.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setActiveModule('mas_critical_systems')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl border text-xs font-semibold shadow-xs transition hover:scale-[1.01] ${
                theme === 'light'
                  ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              <Server className="w-4 h-4 text-sky-500" />
              <span>MAS TRM RTO/RPO Desk</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md shadow-sky-900/20 transition hover:scale-[1.02] shrink-0 cursor-pointer"
              id="btn-add-asset"
            >
              <Plus className="w-4 h-4" />
              <span>Register Asset</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-200/60 dark:border-slate-800/80">
          <div className={`p-3 rounded-xl border ${
            theme === 'light' ? 'bg-white/80 border-slate-200' : 'bg-slate-800/60 border-slate-700/60'
          }`}>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Critical Systems</span>
            <div className="text-lg font-black text-rose-500 mt-0.5">{criticalSystemsCount} Systems</div>
            <span className="text-[10px] text-slate-400">RTO $\le$ 4h regulatory SLA</span>
          </div>

          <div className={`p-3 rounded-xl border ${
            theme === 'light' ? 'bg-white/80 border-slate-200' : 'bg-slate-800/60 border-slate-700/60'
          }`}>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Patch Cleanliness</span>
            <div className="text-lg font-black text-emerald-500 mt-0.5">{cleanPatchCount} / {assets.length}</div>
            <span className="text-[10px] text-slate-400">0 Critical CVEs exposed</span>
          </div>

          <div className={`p-3 rounded-xl border ${
            theme === 'light' ? 'bg-white/80 border-slate-200' : 'bg-slate-800/60 border-slate-700/60'
          }`}>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Confidential / Restricted</span>
            <div className="text-lg font-black text-indigo-500 mt-0.5">
              {assets.filter(a => a.classification === 'Confidential' || a.classification === 'Restricted').length} Assets
            </div>
            <span className="text-[10px] text-slate-400">AES-256 KMS protected</span>
          </div>

          <div className={`p-3 rounded-xl border ${
            theme === 'light' ? 'bg-white/80 border-slate-200' : 'bg-slate-800/60 border-slate-700/60'
          }`}>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Continuous Discovery</span>
            <div className="text-lg font-black text-sky-500 mt-0.5">100% Synced</div>
            <span className="text-[10px] text-slate-400">AWS / Azure / SaaS API live</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className={`flex items-center space-x-2 border-b overflow-x-auto pb-1 ${
        theme === 'light' ? 'border-slate-200' : 'border-slate-800'
      }`}>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-colors border-b-2 flex items-center space-x-1.5 whitespace-nowrap ${
            activeTab === 'inventory'
              ? theme === 'light'
                ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
                : 'border-indigo-400 text-indigo-300 bg-indigo-950/20'
              : theme === 'light'
              ? 'border-transparent text-slate-600 hover:text-slate-900'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>Asset Inventory (CMDB)</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-800 font-mono ml-1">
            {assets.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('critical_systems')}
          className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-colors border-b-2 flex items-center space-x-1.5 whitespace-nowrap ${
            activeTab === 'critical_systems'
              ? theme === 'light'
                ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
                : 'border-indigo-400 text-indigo-300 bg-indigo-950/20'
              : theme === 'light'
              ? 'border-transparent text-slate-600 hover:text-slate-900'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Critical Systems & RTO/RPO</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 font-mono ml-1">
            MAS Notice 644
          </span>
        </button>

        <button
          onClick={() => setActiveTab('vulnerabilities')}
          className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-colors border-b-2 flex items-center space-x-1.5 whitespace-nowrap ${
            activeTab === 'vulnerabilities'
              ? theme === 'light'
                ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
                : 'border-indigo-400 text-indigo-300 bg-indigo-950/20'
              : theme === 'light'
              ? 'border-transparent text-slate-600 hover:text-slate-900'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Bug className="w-3.5 h-3.5" />
          <span>Vulnerabilities & Patching (A.8.8)</span>
        </button>

        <button
          onClick={() => setActiveTab('traceability')}
          className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-colors border-b-2 flex items-center space-x-1.5 whitespace-nowrap ${
            activeTab === 'traceability'
              ? theme === 'light'
                ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
                : 'border-indigo-400 text-indigo-300 bg-indigo-950/20'
              : theme === 'light'
              ? 'border-transparent text-slate-600 hover:text-slate-900'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Service, Risk & Control Traceability</span>
        </button>
      </div>

      {/* Tab 1: CMDB Inventory */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          {/* Filter and Search Bar */}
          <div className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-3 ${
            theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            <div className="relative flex-1 w-full sm:w-auto">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search assets by name, owner, service, or location..."
                className={`w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${
                  theme === 'light'
                    ? 'bg-slate-50 border-slate-300 text-slate-900'
                    : 'bg-slate-800 border-slate-700 text-white'
                }`}
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className={`px-3 py-1.5 text-xs rounded-lg border focus:outline-none ${
                  theme === 'light'
                    ? 'bg-slate-50 border-slate-300 text-slate-900'
                    : 'bg-slate-800 border-slate-700 text-white'
                }`}
              >
                <option value="All">All Types</option>
                <option value="Cloud Infrastructure">Cloud Infrastructure</option>
                <option value="Database">Database</option>
                <option value="SaaS Platform">SaaS Platform</option>
                <option value="Endpoint">Endpoint</option>
              </select>

              <select
                value={criticalFilter}
                onChange={e => setCriticalFilter(e.target.value)}
                className={`px-3 py-1.5 text-xs rounded-lg border focus:outline-none ${
                  theme === 'light'
                    ? 'bg-slate-50 border-slate-300 text-slate-900'
                    : 'bg-slate-800 border-slate-700 text-white'
                }`}
              >
                <option value="All">All Criticality</option>
                <option value="Critical">Critical Systems Only</option>
                <option value="NonCritical">Non-Critical Systems</option>
              </select>
            </div>
          </div>

          {/* Assets Table */}
          <div className={`border rounded-xl overflow-hidden shadow-xs ${
            theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className={`text-[11px] uppercase tracking-wider font-bold border-b ${
                  theme === 'light' ? 'bg-slate-50 text-slate-500 border-slate-200' : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  <tr>
                    <th className="p-3.5">Asset Identification</th>
                    <th className="p-3.5">Business Service</th>
                    <th className="p-3.5">Type</th>
                    <th className="p-3.5">Classification</th>
                    <th className="p-3.5">Criticality / RTO</th>
                    <th className="p-3.5">Owner</th>
                    <th className="p-3.5">Location / Host</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${theme === 'light' ? 'divide-slate-200 text-slate-700' : 'divide-slate-800 text-slate-300'}`}>
                  {filteredAssets.map(a => (
                    <tr
                      key={a.id}
                      className="hover:bg-slate-500/5 transition-colors cursor-pointer"
                      onClick={() => setSelectedAsset(a)}
                    >
                      <td className="p-3.5">
                        <div className={`font-bold text-xs ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                          {a.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{a.id}</div>
                      </td>
                      <td className="p-3.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                        {a.businessService}
                      </td>
                      <td className="p-3.5 text-slate-500 dark:text-slate-400">{a.type}</td>
                      <td className="p-3.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded border font-medium ${
                          theme === 'light'
                            ? 'bg-slate-100 text-slate-700 border-slate-300'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}>
                          {a.classification}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center space-x-1.5">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                              a.isCriticalSystem
                                ? 'bg-rose-500/20 text-rose-500 border-rose-500/40'
                                : 'bg-emerald-500/20 text-emerald-500 border-emerald-500/40'
                            }`}
                          >
                            {a.isCriticalSystem ? 'MAS Critical' : a.criticality}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">RTO: {a.rtoHours}h</span>
                        </div>
                      </td>
                      <td className="p-3.5 text-slate-900 dark:text-white font-medium">{a.owner}</td>
                      <td className="p-3.5 text-slate-400 font-mono text-[11px]">{a.location}</td>
                      <td className="p-3.5 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => setSelectedAsset(a)}
                            className="p-1 px-2 rounded-lg bg-indigo-500/15 text-indigo-400 text-[11px] font-semibold hover:bg-indigo-500/25"
                          >
                            Details
                          </button>
                          <button
                            onClick={() => handleDelete(a.id, a.name)}
                            className="p-1 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"
                            title="Remove Asset"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Critical Systems & RTO/RPO */}
      {activeTab === 'critical_systems' && (
        <div className={`p-5 rounded-xl border space-y-4 ${
          theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-sm font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                MAS TRM Section 8: Critical Systems & Maximum Tolerable Downtime (MTD)
              </h3>
              <p className="text-xs text-slate-400">
                Monetary Authority of Singapore statutory requirement: Recovery Time Objective (RTO) must not exceed 4 hours.
              </p>
            </div>
            <button
              onClick={() => setActiveModule('mas_critical_systems')}
              className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold"
            >
              Open Full MAS TRM Workspace
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {assets.filter(a => a.isCriticalSystem).map(a => (
              <div
                key={a.id}
                className={`p-4 rounded-xl border space-y-2 ${
                  theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/60 border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{a.name}</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 font-bold">
                    Designated Critical System
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Function: {a.businessService}</p>
                <div className="flex items-center space-x-4 text-xs font-mono pt-1">
                  <div>RTO Target: <strong className="text-emerald-400">{a.rtoHours}h</strong> (Max 4h)</div>
                  <div>RPO Target: <strong className="text-sky-400">{a.rpoHours}h</strong> (Max 1h)</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Vulnerabilities */}
      {activeTab === 'vulnerabilities' && (
        <div className={`p-5 rounded-xl border space-y-4 ${
          theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <div>
            <h3 className={`text-sm font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
              ISO 27001:2022 A.8.8 Management of Technical Vulnerabilities
            </h3>
            <p className="text-xs text-slate-400">
              Automated correlation with CVE feeds, live scanner telemetry, and zero-day exposure tracking.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className={`text-[11px] uppercase tracking-wider font-bold border-b ${
                theme === 'light' ? 'bg-slate-50 text-slate-500 border-slate-200' : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                <tr>
                  <th className="p-3">Asset</th>
                  <th className="p-3">Last Vulnerability Scan</th>
                  <th className="p-3">Known CVEs</th>
                  <th className="p-3">Remediation Status</th>
                  <th className="p-3">Patch Window SLA</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${theme === 'light' ? 'divide-slate-200 text-slate-700' : 'divide-slate-800 text-slate-300'}`}>
                {assets.map(a => (
                  <tr key={a.id} className="hover:bg-slate-500/5">
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">{a.name}</td>
                    <td className="p-3 font-mono text-slate-400">{a.lastScannedDate}</td>
                    <td className="p-3">
                      <span className={`font-mono font-bold ${a.cveVulnerabilitiesCount > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                        {a.cveVulnerabilitiesCount} CVEs
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        a.patchStatus === 'Current (0-day clean)'
                          ? 'bg-emerald-500/15 text-emerald-500'
                          : 'bg-amber-500/15 text-amber-500'
                      }`}>
                        {a.patchStatus}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-[11px] text-slate-400">
                      {a.criticality === 'High' ? '14 Calendar Days' : '30 Calendar Days'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Traceability */}
      {activeTab === 'traceability' && (
        <div className={`p-5 rounded-xl border space-y-4 ${
          theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <div>
            <h3 className={`text-sm font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
              End-to-End Asset → Risk → Control Traceability Matrix
            </h3>
            <p className="text-xs text-slate-400">
              Audit-grade verification showing how each infrastructure asset is safeguarded by ISO 27001 Annex A controls and addressed in the Risk Register.
            </p>
          </div>

          <div className="space-y-3">
            {assets.map(a => (
              <div
                key={a.id}
                className={`p-4 rounded-xl border ${
                  theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/60 border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-bold text-xs text-slate-900 dark:text-white">{a.name}</div>
                  <span className="text-[10px] text-slate-400 font-mono">Service: {a.businessService}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Guarding Controls</span>
                    <div className="flex flex-wrap gap-1">
                      {a.linkedControls.map(c => (
                        <span key={c} className="px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 font-mono text-[10px]">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Associated Threat Scenarios</span>
                    <div className="space-y-0.5">
                      {a.linkedRisks.map(r => (
                        <div key={r} className="text-[11px] text-rose-400 font-mono">
                          ⚠ {r}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Asset Detail Drawer / Modal */}
      {selectedAsset && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 border ${
            theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-700'
          }`}>
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`text-base font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                    {selectedAsset.name}
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">{selectedAsset.type} • {selectedAsset.id}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedAsset(null)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <strong className={theme === 'light' ? 'text-slate-800' : 'text-slate-200'}>Business Service:</strong>
                <p className="text-slate-400 mt-0.5">{selectedAsset.businessService}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className={`p-2.5 rounded-lg border ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-800 border-slate-700'}`}>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">RTO Target</span>
                  <span className="font-bold text-sky-400 text-sm">{selectedAsset.rtoHours} Hours</span>
                </div>
                <div className={`p-2.5 rounded-lg border ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-800 border-slate-700'}`}>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">RPO Target</span>
                  <span className="font-bold text-sky-400 text-sm">{selectedAsset.rpoHours} Hours</span>
                </div>
              </div>

              <div>
                <strong className={theme === 'light' ? 'text-slate-800' : 'text-slate-200'}>Hosting / Vendor:</strong>
                <p className="text-slate-400 mt-0.5">{selectedAsset.hostingVendor} ({selectedAsset.location})</p>
              </div>

              <div>
                <strong className={theme === 'light' ? 'text-slate-800' : 'text-slate-200'}>Guarding Controls:</strong>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {selectedAsset.linkedControls.map(c => (
                    <span key={c} className="px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-400 font-mono text-[10px] border border-indigo-500/30">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400">
                Owner: <strong className="text-sky-400">{selectedAsset.owner}</strong> • Classification: <strong className="text-emerald-400">{selectedAsset.classification}</strong>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setSelectedAsset(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Register Asset Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border ${
            theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-700'
          }`}>
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
              <h3 className={`text-base font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                Register Information Asset (CMDB)
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddAsset} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Asset Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Production Kubernetes Cluster (EKS)"
                  className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${
                    theme === 'light' ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Asset Type</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as any)}
                    className={`w-full px-3 py-2 text-xs rounded-xl border ${
                      theme === 'light' ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
                    }`}
                  >
                    <option value="Cloud Infrastructure">Cloud Infrastructure</option>
                    <option value="Database">Database</option>
                    <option value="SaaS Platform">SaaS Platform</option>
                    <option value="Endpoint">Endpoint</option>
                    <option value="Hardware Server">Hardware Server</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Criticality</label>
                  <select
                    value={criticality}
                    onChange={e => setCriticality(e.target.value as any)}
                    className={`w-full px-3 py-2 text-xs rounded-xl border ${
                      theme === 'light' ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
                    }`}
                  >
                    <option value="High">High Criticality</option>
                    <option value="Medium">Medium Criticality</option>
                    <option value="Low">Low Criticality</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Business Service Supported</label>
                <input
                  type="text"
                  value={businessService}
                  onChange={e => setBusinessService(e.target.value)}
                  placeholder="e.g. Core Banking API & Transaction Processing"
                  className={`w-full px-3 py-2 text-xs rounded-xl border ${
                    theme === 'light' ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Owner / Custodian</label>
                  <input
                    type="text"
                    value={owner}
                    onChange={e => setOwner(e.target.value)}
                    placeholder="e.g. DevOps Lead"
                    className={`w-full px-3 py-2 text-xs rounded-xl border ${
                      theme === 'light' ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Location / Region</label>
                  <input
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="e.g. AWS Ireland (eu-west-1)"
                    className={`w-full px-3 py-2 text-xs rounded-xl border ${
                      theme === 'light' ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Classification</label>
                  <select
                    value={classification}
                    onChange={e => setClassification(e.target.value as any)}
                    className={`w-full px-3 py-2 text-xs rounded-xl border ${
                      theme === 'light' ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
                    }`}
                  >
                    <option value="Confidential">Confidential</option>
                    <option value="Restricted">Restricted</option>
                    <option value="Internal">Internal</option>
                    <option value="Public">Public</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">RTO Target (Hours)</label>
                  <input
                    type="number"
                    min="1"
                    max="72"
                    value={rtoHours}
                    onChange={e => setRtoHours(Number(e.target.value))}
                    className={`w-full px-3 py-2 text-xs rounded-xl border ${
                      theme === 'light' ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
                    }`}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="isCriticalSystemCheck"
                  checked={isCriticalSystem}
                  onChange={e => setIsCriticalSystem(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="isCriticalSystemCheck" className="text-xs text-slate-300 font-semibold cursor-pointer">
                  Designate as MAS TRM Critical System (Statutory 4-Hour RTO Mandate)
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className={`px-4 py-2 rounded-xl text-xs ${
                    theme === 'light' ? 'bg-slate-100 text-slate-700' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs cursor-pointer"
                >
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
};
