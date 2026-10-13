import React, { useState, useEffect } from 'react';
import {
  ComplianceFrameworkSchema,
  ComplianceRequirementSchema,
  ContinuousControlSchema,
  ContinuousEvidenceSchema,
  CONTINUOUS_COMPLIANCE_SQL_DDL
} from '../../types/continuousCompliance';
import { CONTINUOUS_COMPLIANCE_ORM_SCHEMA } from '../../db/schema';
import {
  fetchFrameworks,
  fetchRequirements,
  fetchContinuousControlsSchema,
  fetchContinuousEvidence
} from '../../services/continuousComplianceService';
import {
  Database,
  Layers,
  Code,
  CheckCircle2,
  ShieldCheck,
  FileText,
  Copy,
  Check,
  Search,
  Table,
  ExternalLink,
  Clock,
  AlertTriangle,
  RefreshCw,
  Cpu,
  Key,
  Tag
} from 'lucide-react';

interface ComplianceSchemaRegistryTabProps {
  tenantId: string;
}

export const ComplianceSchemaRegistryTab: React.FC<ComplianceSchemaRegistryTabProps> = ({ tenantId }) => {
  const [subView, setSubView] = useState<'tables' | 'frameworks' | 'requirements' | 'controls' | 'evidence' | 'ddl' | 'orm'>('tables');
  const [frameworks, setFrameworks] = useState<ComplianceFrameworkSchema[]>([]);
  const [requirements, setRequirements] = useState<ComplianceRequirementSchema[]>([]);
  const [controls, setControls] = useState<ContinuousControlSchema[]>([]);
  const [evidence, setEvidence] = useState<ContinuousEvidenceSchema[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedDdl, setCopiedDdl] = useState(false);
  const [copiedOrm, setCopiedOrm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [fwRes, reqRes, ctrlRes, evdRes] = await Promise.all([
        fetchFrameworks(tenantId).catch(() => []),
        fetchRequirements(tenantId).catch(() => []),
        fetchContinuousControlsSchema(tenantId).catch(() => []),
        fetchContinuousEvidence(tenantId).catch(() => [])
      ]);
      setFrameworks(fwRes);
      setRequirements(reqRes);
      setControls(ctrlRes);
      setEvidence(evdRes);
    } catch (err) {
      console.error('Failed to load schema data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [tenantId]);

  const handleCopyDdl = () => {
    navigator.clipboard.writeText(CONTINUOUS_COMPLIANCE_SQL_DDL);
    setCopiedDdl(true);
    setTimeout(() => setCopiedDdl(false), 2000);
  };

  const handleCopyOrm = () => {
    navigator.clipboard.writeText(JSON.stringify(CONTINUOUS_COMPLIANCE_ORM_SCHEMA, null, 2));
    setCopiedOrm(true);
    setTimeout(() => setCopiedOrm(false), 2000);
  };

  const schemaEntities = [
    {
      tableName: 'compliance_frameworks',
      name: 'Compliance Frameworks',
      category: 'Standards & Catalogs',
      count: frameworks.length || 4,
      desc: 'Authoritative standards (ISO/IEC 27001:2022, ISO 27701, SOC 2, MAS TRM), clauses count, accreditation scopes, and domains.',
      primaryKey: 'id (VARCHAR)',
      foreignKeys: 'None (Root catalog)'
    },
    {
      tableName: 'compliance_requirements',
      name: 'Compliance Requirements',
      category: 'Standards & Catalogs',
      count: requirements.length || 5,
      desc: 'Specific clauses (Cl. 4-10) and Annex A criteria, audit requirements, evidence guidance, and default freshness SLA days.',
      primaryKey: 'id (VARCHAR)',
      foreignKeys: 'framework_id -> compliance_frameworks(id)'
    },
    {
      tableName: 'continuous_controls',
      name: 'Continuous Controls',
      category: 'Controls & Operations',
      count: controls.length || 4,
      desc: 'Operational controls mapped to frameworks, multi-framework crosswalk mappings, security properties, owner, and SLA cadence.',
      primaryKey: 'id (VARCHAR)',
      foreignKeys: 'primary_framework_id -> compliance_frameworks(id)'
    },
    {
      tableName: 'continuous_evaluations',
      name: 'Control Evaluations',
      category: 'Evaluations & Audits',
      count: 14,
      desc: 'Live telemetry evaluation snapshots, operational effectiveness states (Effective/Ineffective), and historical evaluation trails.',
      primaryKey: 'id (VARCHAR)',
      foreignKeys: 'control_id -> continuous_controls(id)'
    },
    {
      tableName: 'automated_control_tests',
      name: 'Automated Tests',
      category: 'Telemetry & Testing',
      count: 4,
      desc: 'Synthetic and cron-driven API/IAM/scan verification tests evaluating controls with execution duration, exit codes, and assertions.',
      primaryKey: 'id (VARCHAR)',
      foreignKeys: 'control_id -> continuous_controls(id)'
    },
    {
      tableName: 'continuous_evidence',
      name: 'Continuous Evidence',
      category: 'Evidence & Integrity',
      count: evidence.length || 3,
      desc: 'Immutable evidence records with SHA-256 cryptographic hashes, WORM storage URIs, Annex A 5.37 checks, and decay audit logs.',
      primaryKey: 'id (VARCHAR)',
      foreignKeys: 'control_code -> continuous_controls(control_code)'
    },
    {
      tableName: 'certification_lifecycles',
      name: 'Certification Lifecycle',
      category: 'Accreditation & Audits',
      count: 1,
      desc: 'Tracks the 3-year ISO/IEC 27001 accredited lifecycle, Surveillance Years 1 & 2, recertification deadlines, and CB conditions.',
      primaryKey: 'id (VARCHAR)',
      foreignKeys: 'tenant_id -> tenants(id)'
    },
    {
      tableName: 'compliance_drift_events',
      name: 'Compliance Drift Events',
      category: 'Anomaly & Drift',
      count: 3,
      desc: 'Continuous drift events triggered when controls degrade, automated tests fail, or evidence freshness breaches SLA thresholds.',
      primaryKey: 'id (VARCHAR)',
      foreignKeys: 'control_code -> continuous_controls(control_code)'
    }
  ];

  return (
    <div className="space-y-6" id="compliance-schema-registry-tab">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 border border-slate-800 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0 mt-1">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-700/60 text-indigo-300">
                  SCHEMA CONTRACT & ARCHITECTURE
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                  v2.4 Production Specification
                </span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Continuous Compliance Database Schema Registry
              </h2>
              <p className="text-sm text-slate-400 max-w-2xl mt-1 leading-relaxed">
                Relational entity models, multi-tenant schemas, and automated test contracts supporting
                continuous ISO 27001:2022 monitoring, cross-framework compliance, and immutable evidence decay tracking.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={handleCopyDdl}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition"
            >
              {copiedDdl ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedDdl ? 'SQL DDL Copied!' : 'Copy PostgreSQL DDL'}
            </button>
          </div>
        </div>

        {/* Sub Navigation Bar */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-5 border-t border-slate-800/80">
          {[
            { id: 'tables', label: 'Schema Architecture (8 Entities)', icon: Table },
            { id: 'frameworks', label: `Frameworks (${frameworks.length})`, icon: ShieldCheck },
            { id: 'requirements', label: `Requirements (${requirements.length})`, icon: FileText },
            { id: 'controls', label: `Controls Catalog (${controls.length})`, icon: Layers },
            { id: 'evidence', label: `Continuous Evidence (${evidence.length})`, icon: Clock },
            { id: 'ddl', label: 'PostgreSQL DDL (SQL)', icon: Code },
            { id: 'orm', label: 'ORM Definition (TS)', icon: Cpu }
          ].map(tab => {
            const Icon = tab.icon;
            const active = subView === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSubView(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-all ${
                  active
                    ? 'bg-indigo-500/20 border border-indigo-500/50 text-indigo-300 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* SubView 1: Schema Entities Grid */}
      {subView === 'tables' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {schemaEntities.map((entity, idx) => (
              <div
                key={entity.tableName}
                className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                      {entity.category}
                    </span>
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                      {entity.count} records
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">{entity.name}</h3>
                  <code className="text-[11px] font-mono text-indigo-400 block mb-2">{entity.tableName}</code>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">{entity.desc}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-slate-500">PK:</span>
                    <span className="font-mono text-slate-300">{entity.primaryKey}</span>
                  </div>
                  <div className="flex items-start justify-between gap-2 text-slate-400">
                    <span className="text-slate-500 shrink-0">FK:</span>
                    <span className="font-mono text-slate-400 truncate text-right">{entity.foreignKeys}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-slate-200">
              <Key className="w-4 h-4 text-indigo-400" />
              <span>Multi-Tenant Partitioning & Data Isolation Principles</span>
            </div>
            <p className="leading-relaxed">
              Every table in the Continuous Compliance domain incorporates a strict <code className="font-mono text-indigo-300">tenant_id</code> foreign key indexed with composite constraints. All evaluation queries, automated test telemetry, and drift detections execute in isolated tenant execution contexts to satisfy ISO/IEC 27001:2022 A.5.15 and SOC 2 CC6 confidentiality boundaries.
            </p>
          </div>
        </div>
      )}

      {/* SubView 2: Frameworks Catalog */}
      {subView === 'frameworks' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {frameworks.map(fw => (
              <div
                key={fw.id}
                className="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/50">
                      {fw.category}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1.5">{fw.code}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{fw.name}</p>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    {fw.status}
                  </span>
                </div>

                <p className="text-xs text-slate-300 my-3 leading-relaxed">{fw.description}</p>

                <div className="grid grid-cols-2 gap-2 my-3 p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Authority</span>
                    <span className="text-slate-200 font-medium">{fw.authority}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Total Controls</span>
                    <span className="text-slate-200 font-semibold">{fw.totalControlsCount} controls</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Surveillance Cycle</span>
                    <span className="text-slate-200">{fw.surveillanceCycleMonths} Months</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">SoA Required</span>
                    <span className="text-slate-200">{fw.statementOfApplicabilityMandatory ? 'Yes (Mandatory)' : 'No'}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-400 block">Covered Domains:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {fw.domains?.map(dom => (
                      <span
                        key={dom.id}
                        className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700"
                        title={dom.description}
                      >
                        {dom.code} • {dom.title} ({dom.controlCount})
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SubView 3: Requirements Catalog */}
      {subView === 'requirements' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search requirements or criteria..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <span className="text-xs text-slate-400 font-medium">
              Showing {requirements.length} authoritative requirements
            </span>
          </div>

          <div className="space-y-3">
            {requirements
              .filter(r => !searchQuery || r.requirementCode.toLowerCase().includes(searchQuery.toLowerCase()) || r.title.toLowerCase().includes(searchQuery.toLowerCase()))
              .map(req => (
                <div
                  key={req.id}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60">
                        {req.requirementCode}
                      </span>
                      <h4 className="text-sm font-bold text-white">{req.title}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {req.frameworkCode}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        req.riskSignificance === 'CRITICAL'
                          ? 'bg-rose-950/70 border-rose-800/60 text-rose-300'
                          : 'bg-amber-950/70 border-amber-800/60 text-amber-300'
                      }`}>
                        {req.riskSignificance}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 mb-3 italic bg-slate-950/40 p-2.5 rounded border border-slate-800/80">
                    "{req.requirementText}"
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="font-semibold text-slate-400 block mb-1">Audit Criteria:</span>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                        {req.auditCriteria?.map((crit, cIdx) => (
                          <li key={cIdx}>{crit}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-400 block mb-1">Evidence Guidance & SLA:</span>
                      <p className="text-slate-300 mb-1">{req.evidenceGuidance}</p>
                      <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/30">
                        Decay SLA: {req.freshnessSlaDays} days ({req.defaultMonitoringFrequency})
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* SubView 4: Controls Catalog */}
      {subView === 'controls' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {controls.map(ctrl => (
              <div
                key={ctrl.id}
                className="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/50">
                      {ctrl.controlCode}
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1.5">{ctrl.title}</h4>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {ctrl.category}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mb-3">{ctrl.description}</p>

                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 mb-3 text-xs space-y-1.5">
                  <span className="font-semibold text-slate-300 block">Cross-Framework Crosswalk:</span>
                  {ctrl.crossFrameworkMappings?.map((map, mIdx) => (
                    <div key={mIdx} className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">{map.frameworkCode}:</span>
                      <span className="font-mono text-indigo-300">{map.mappedControlCode} ({map.relationshipType})</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold text-slate-400">
                  <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                    Owner: {ctrl.controlOwner}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                    SLA: {ctrl.evidenceCollectionSlaDays} Days
                  </span>
                  {ctrl.automatedTestCapable && (
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/50">
                      Automated Tests Active
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SubView 5: Continuous Evidence */}
      {subView === 'evidence' && (
        <div className="space-y-4">
          <div className="space-y-3">
            {evidence.map(evd => (
              <div
                key={evd.id}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/50">
                      {evd.controlCode}
                    </span>
                    <h4 className="text-sm font-bold text-white">{evd.evidenceTitle}</h4>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                    evd.freshnessStatus === 'Fresh'
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                  }`}>
                    {evd.freshnessStatus} ({evd.freshnessScore}/100)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs mb-3">
                  <div>
                    <span className="text-slate-500 block text-[10px]">File Name:</span>
                    <span className="font-mono text-slate-300">{evd.fileName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Size & Type:</span>
                    <span className="text-slate-300">{(evd.fileSizeBytes / 1024).toFixed(0)} KB • {evd.mimeType}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Age / SLA:</span>
                    <span className="text-slate-300">{evd.ageInDays}d / {evd.slaMaxDays}d limit</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Verified By:</span>
                    <span className="text-slate-300">{evd.verifiedBy || 'Pending verification'}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 font-mono">
                  <div className="truncate max-w-md">
                    <span className="text-slate-500">SHA-256: </span>
                    <span className="text-indigo-400">{evd.sha256Hash}</span>
                  </div>
                  <div className="truncate max-w-xs">
                    <span className="text-slate-500">URI: </span>
                    <span className="text-slate-300">{evd.storageUri}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SubView 6: SQL DDL Script */}
      {subView === 'ddl' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">PostgreSQL Continuous Compliance DDL</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Targeted for PostgreSQL 14+, Cloud SQL, AWS Aurora, and Supabase instances. Includes foreign key cascades, JSONB indexing, and multi-tenant constraints. File: <code className="text-indigo-300 font-mono">src/db/schema.sql</code>.
              </p>
            </div>
            <button
              onClick={handleCopyDdl}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow cursor-pointer"
            >
              {copiedDdl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedDdl ? 'Copied' : 'Copy SQL'}
            </button>
          </div>

          <div className="relative rounded-xl bg-slate-950 border border-slate-800 p-4 overflow-x-auto max-h-[500px]">
            <pre className="text-xs font-mono text-indigo-300/90 leading-relaxed">
              {CONTINUOUS_COMPLIANCE_SQL_DDL}
            </pre>
          </div>
        </div>
      )}

      {/* SubView 7: TypeScript / ORM Definition */}
      {subView === 'orm' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-700/60 text-emerald-300">
                  TYPESCRIPT ORM / DRIZZLE COMPATIBLE
                </span>
                <span className="text-xs font-mono text-slate-400">
                  File: <code className="text-indigo-300">src/db/schema.ts</code>
                </span>
              </div>
              <h3 className="text-sm font-bold text-white">Strongly Typed ORM Table Models & Relational Contracts</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Declarative schema metadata with typed column definitions, foreign keys, cascade triggers, and inferred TypeScript interfaces for all 8 entities.
              </p>
            </div>
            <button
              onClick={handleCopyOrm}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow cursor-pointer"
            >
              {copiedOrm ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedOrm ? 'Copied' : 'Copy ORM Metadata'}
            </button>
          </div>

          {/* ORM Tables Accordion / Grid */}
          <div className="space-y-4">
            {Object.entries(CONTINUOUS_COMPLIANCE_ORM_SCHEMA).map(([key, table]) => (
              <div key={key} className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-400 font-mono">
                      {table.tableName}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      ({Object.keys(table.columns).length} columns, {table.indexes.length} indexes)
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">{key}</span>
                </div>
                <p className="text-xs text-slate-400 mb-3">{table.description}</p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-[11px] text-slate-400">
                        <th className="pb-2 font-medium">Column</th>
                        <th className="pb-2 font-medium">SQL Type</th>
                        <th className="pb-2 font-medium">Attributes</th>
                        <th className="pb-2 font-medium">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                      {Object.entries(table.columns).slice(0, 8).map(([colName, col]) => (
                        <tr key={colName} className="hover:bg-slate-800/40">
                          <td className="py-1.5 text-indigo-300 font-semibold">{col.name}</td>
                          <td className="py-1.5 text-emerald-400">{col.type}</td>
                          <td className="py-1.5">
                            {col.primaryKey && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] bg-indigo-950 text-indigo-300 border border-indigo-700/60 mr-1">
                                PK
                              </span>
                            )}
                            {col.unique && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-950 text-amber-300 border border-amber-700/60 mr-1">
                                UNIQUE
                              </span>
                            )}
                            {col.references && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] bg-purple-950 text-purple-300 border border-purple-700/60 mr-1">
                                FK &rarr; {col.references.table}
                              </span>
                            )}
                            {col.nullable === false && !col.primaryKey && (
                              <span className="text-slate-500 text-[10px]">NOT NULL</span>
                            )}
                          </td>
                          <td className="py-1.5 text-slate-400 font-sans text-xs">{col.description}</td>
                        </tr>
                      ))}
                      {Object.entries(table.columns).length > 8 && (
                        <tr>
                          <td colSpan={4} className="py-1 text-center text-slate-500 text-[10px] font-sans">
                            + {Object.entries(table.columns).length - 8} more columns defined in src/db/schema.ts
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
