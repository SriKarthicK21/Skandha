// ============================================================================
// SKANDA ENTERPRISE GRC: PERSONAL DATA INVENTORY WORKSPACE
// Path: src/components/dpdp/DPDPPersonalDataInventoryWorkspace.tsx
//
// Enterprise Personal Data Inventory & Data Lineage Engine:
// - Element-level granularity with classification, sensitivity, and categories
// - Source collection point, systems, databases, recipient processors
// - Purpose mapping, lawful basis, and notice linkage
// - End-to-end data lineage visualization
// - Privacy-by-Design PII Masking toggle
// - Add Element Intake Modal with validation
// ============================================================================

import React, { useState, useMemo } from 'react';
import {
  Database,
  Search,
  Filter,
  Plus,
  Shield,
  Eye,
  EyeOff,
  Layers,
  Lock,
  ArrowRight,
  Server,
  FileCheck2,
  AlertTriangle,
  Download,
  Building,
  CheckCircle2
} from 'lucide-react';
import { dpdpPrivacyEngineService } from '../../services/canonical/DpdpPrivacyEngineService';
import { DpdpPersonalDataElement, DpdpDataCategory } from '../../types/dpdpPlatformTypes';

interface DPDPPersonalDataInventoryWorkspaceProps {
  tenantId: string;
}

export const DPDPPersonalDataInventoryWorkspace: React.FC<DPDPPersonalDataInventoryWorkspaceProps> = ({
  tenantId
}) => {
  const [elements, setElements] = useState<DpdpPersonalDataElement[]>(() =>
    dpdpPrivacyEngineService.getPersonalDataInventory(tenantId)
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [maskPii, setMaskPii] = useState(true);
  const [selectedElementForLineage, setSelectedElementForLineage] = useState<DpdpPersonalDataElement | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState<DpdpDataCategory>('IDENTITY_CONTACT');
  const [dataPrincipalCategory, setDataPrincipalCategory] = useState<any>('CUSTOMER_USER');
  const [collectionSource, setCollectionSource] = useState('');
  const [systems, setSystems] = useState('AWS RDS Postgres, Web Gateway');
  const [storageLocations, setStorageLocations] = useState('AWS ap-south-1 (Mumbai)');
  const [lawfulBasis, setLawfulBasis] = useState<any>('CONSENT');
  const [classification, setClassification] = useState<any>('CONFIDENTIAL');

  const filteredElements = useMemo(() => {
    return elements.filter(el => {
      const matchesSearch =
        el.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        el.collectionSource.toLowerCase().includes(searchTerm.toLowerCase()) ||
        el.processingSystems.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = categoryFilter === 'ALL' || el.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [elements, searchTerm, categoryFilter]);

  const handleCreateElement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !collectionSource) return;

    const newElement = dpdpPrivacyEngineService.addPersonalDataElement(tenantId, {
      name,
      category,
      dataType: 'STRING',
      dataPrincipalCategory,
      isSensitivePersonalData: category === 'FINANCIAL_TRANSACTIONAL' || category === 'HEALTH_BIOMETRIC',
      isChildrenData: dataPrincipalCategory === 'CHILD_UNDER_18',
      collectionSource,
      processingSystems: systems.split(',').map(s => s.trim()),
      storageLocations: storageLocations.split(',').map(s => s.trim()),
      processingActivityIds: ['act-01'],
      purposeIds: ['purp-01'],
      recipientProcessors: ['proc-01'],
      retentionRuleId: 'ret-01',
      deletionMechanism: 'HARD_DELETE_AUTOMATED',
      securityControls: ['AES-256 at Rest', 'TLS 1.3 in Transit', 'RBAC'],
      noticeId: 'not-01',
      consentRequired: lawfulBasis === 'CONSENT',
      lawfulBasis,
      riskRating: 'MEDIUM',
      owner: 'Privacy Custodian',
      classification,
      discoveryStatus: 'VERIFIED_ACTIVE',
      evidenceId: `ev_pde_${Date.now()}`,
      dataLineage: {
        source: collectionSource,
        flowStages: ['API Gateway', 'Input Sanitizer', 'Postgres Master Node'],
        destination: 'Encrypted Database Table users_master',
        encryptionActive: true
      }
    });

    setElements(dpdpPrivacyEngineService.getPersonalDataInventory(tenantId));
    setIsAddModalOpen(false);
    setName('');
    setCollectionSource('');
  };

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Database className="w-4 h-4 text-sky-500" />
            <span>Personal Data Inventory & Lineage Catalog</span>
          </h2>
          <p className="text-[11px] text-slate-500">
            Element-level statutory register mapping personal data to purpose, system, processor, retention, and encryption controls.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Masking Toggle */}
          <button
            onClick={() => setMaskPii(!maskPii)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 border border-slate-200 dark:border-slate-700 transition-colors flex items-center space-x-1"
          >
            {maskPii ? <EyeOff className="w-3.5 h-3.5 text-amber-500" /> : <Eye className="w-3.5 h-3.5 text-emerald-500" />}
            <span>{maskPii ? 'Privacy Mask: ON' : 'Privacy Mask: OFF'}</span>
          </button>

          {/* Add Data Element */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Register Data Element</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search personal data elements, systems, sources, databases..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
        >
          <option value="ALL">All Categories ({elements.length})</option>
          <option value="IDENTITY_CONTACT">Identity & Contact</option>
          <option value="FINANCIAL_TRANSACTIONAL">Financial & Transactional</option>
          <option value="EMPLOYMENT_HR">Employment & HR</option>
          <option value="HEALTH_BIOMETRIC">Health & Biometric</option>
          <option value="CHILDREN_DATA">Children Data</option>
        </select>
      </div>

      {/* Elements Table */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <th className="pb-2.5">Data Element</th>
              <th className="pb-2.5">Category & Principal</th>
              <th className="pb-2.5">Source & Systems</th>
              <th className="pb-2.5">Lawful Basis</th>
              <th className="pb-2.5">Security Controls</th>
              <th className="pb-2.5">Classification</th>
              <th className="pb-2.5 text-right">Lineage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredElements.map(el => (
              <tr key={el.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors h-[42px]">
                <td className="font-semibold text-slate-900 dark:text-white">
                  <div>{maskPii && el.isSensitivePersonalData ? `${el.name} (MASKED)` : el.name}</div>
                  <div className="text-[10px] font-mono text-slate-400">{el.id}</div>
                </td>
                <td>
                  <div className="font-medium text-indigo-600 dark:text-indigo-400">{el.category}</div>
                  <div className="text-[10px] text-slate-500">{el.dataPrincipalCategory}</div>
                </td>
                <td>
                  <div className="text-slate-800 dark:text-slate-200 truncate max-w-xs">{el.collectionSource}</div>
                  <div className="text-[10px] text-slate-400 truncate max-w-xs">{el.processingSystems.join(', ')}</div>
                </td>
                <td>
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    {el.lawfulBasis}
                  </span>
                </td>
                <td>
                  <div className="flex items-center space-x-1 text-slate-600 dark:text-slate-400 text-[11px]">
                    <Lock className="w-3 h-3 text-emerald-500 shrink-0" />
                    <span className="truncate max-w-[150px]">{el.securityControls[0] || 'AES-256'}</span>
                  </div>
                </td>
                <td>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      el.classification === 'RESTRICTED'
                        ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                        : 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                    }`}
                  >
                    {el.classification}
                  </span>
                </td>
                <td className="text-right">
                  <button
                    onClick={() => setSelectedElementForLineage(el)}
                    className="px-2.5 py-1 text-[11px] font-semibold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 rounded border border-sky-200 dark:border-sky-800 transition-colors inline-flex items-center space-x-1"
                  >
                    <Layers className="w-3 h-3" />
                    <span>View Lineage</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Data Lineage Modal */}
      {selectedElementForLineage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-sky-500" />
                  <span>Data Flow Lineage: {selectedElementForLineage.name}</span>
                </h3>
                <p className="text-[11px] text-slate-500 font-mono">Element ID: {selectedElementForLineage.id}</p>
              </div>
              <button
                onClick={() => setSelectedElementForLineage(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>

            {/* Visual Lineage Flow */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Cryptographic Flow Stages</span>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
                <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-center flex-1 w-full">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Collection Source</div>
                  <div className="font-semibold text-slate-900 dark:text-white mt-1">{selectedElementForLineage.collectionSource}</div>
                </div>
                <ArrowRight className="w-4 h-4 text-indigo-500 shrink-0 rotate-90 sm:rotate-0" />
                <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-center flex-1 w-full">
                  <div className="text-[10px] font-bold text-indigo-500 uppercase">In-Transit Encryption</div>
                  <div className="font-semibold text-indigo-900 dark:text-indigo-200 mt-1">TLS 1.3 / API Gateway</div>
                </div>
                <ArrowRight className="w-4 h-4 text-indigo-500 shrink-0 rotate-90 sm:rotate-0" />
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-center flex-1 w-full">
                  <div className="text-[10px] font-bold text-emerald-600 uppercase">At-Rest Storage</div>
                  <div className="font-semibold text-emerald-900 dark:text-emerald-200 mt-1">{selectedElementForLineage.storageLocations.join(', ')}</div>
                </div>
              </div>
            </div>

            {/* Metadata Summary */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 text-[10px] font-bold uppercase">Security Safeguards:</span>
                <div className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">{selectedElementForLineage.securityControls.join(' • ')}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 text-[10px] font-bold uppercase">Retention & Deletion:</span>
                <div className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">{selectedElementForLineage.deletionMechanism}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <form
            onSubmit={handleCreateElement}
            className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-3.5"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Register Personal Data Element</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Data Element Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Bank Account Number, Customer Email"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="IDENTITY_CONTACT">Identity & Contact</option>
                  <option value="FINANCIAL_TRANSACTIONAL">Financial & Transactional</option>
                  <option value="EMPLOYMENT_HR">Employment & HR</option>
                  <option value="HEALTH_BIOMETRIC">Health & Biometric</option>
                  <option value="CHILDREN_DATA">Children Data</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Data Principal Category
                </label>
                <select
                  value={dataPrincipalCategory}
                  onChange={e => setDataPrincipalCategory(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="CUSTOMER_USER">Customer / User</option>
                  <option value="WORKFORCE_EMPLOYEE">Workforce Employee</option>
                  <option value="JOB_APPLICANT">Job Applicant</option>
                  <option value="CHILD_UNDER_18">Child (&lt;18 Years)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Collection Source & Ingestion Point *
              </label>
              <input
                type="text"
                required
                value={collectionSource}
                onChange={e => setCollectionSource(e.target.value)}
                placeholder="e.g. Web Onboarding Form, Mobile SDK"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs transition-colors"
              >
                Save Element
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
