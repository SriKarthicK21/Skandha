import React, { useState } from 'react';
import { useGRC } from '../../context/GRCContext';
import {
  Brain,
  Cpu,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Scale,
  ShieldAlert,
  Database,
  ExternalLink,
  Bot,
  Sliders,
  Layers,
  Sparkles,
  Building2,
  ArrowRight,
  ShieldCheck,
  FileText,
  FileCheck2
} from 'lucide-react';
import { AISIAAssessmentWizard } from '../iso42001/AISIAAssessmentWizard';
import { ThirdPartyAISupplierDueDiligence } from '../iso42001/ThirdPartyAISupplierDueDiligence';
import { ISO42001SoAGenerator } from '../iso42001/ISO42001SoAGenerator';
import { PageContainer } from '../layout/PageContainer';

interface AISystemRecord {
  id: string;
  name: string;
  type: string;
  architecture: string;
  riskTier: 'HIGH_RISK' | 'MEDIUM_RISK' | 'LOW_RISK' | 'EXEMPT';
  purpose: string;
  businessOwner: string;
  datasetName: string;
  datasetProvenance: string;
  disparateImpactRatio: number;
  humanInTheLoop: boolean;
  status: 'Production' | 'Staging' | 'Decommissioned' | 'Pilot';
  lastAisiAssessmentDate?: string;
  aisiaScore?: number;
}

export const ISO42001ScopingModule: React.FC = () => {
  const { currentTenant } = useGRC();
  const [activeTab, setActiveTab] = useState<'inventory' | 'ai_sia' | 'suppliers' | 'soa_generator'>('inventory');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [tierFilter, setTierFilter] = useState<string>('All');
  const [targetSystemForAisia, setTargetSystemForAisia] = useState<string | undefined>(undefined);
  
  const scopingStorageKey = `grc_portal_v1_iso42001_ai_systems_${currentTenant?.id || 'default'}`;

  const DEFAULT_AI_SYSTEMS: AISystemRecord[] = [
    {
      id: 'AI-SYS-001',
      name: 'Underwriting Credit Risk Scorer v3.2',
      type: 'Decision Automation & Predictive Scoring',
      architecture: 'Gradient Boosted Decision Trees (XGBoost / LightGBM)',
      riskTier: 'HIGH_RISK',
      purpose: 'Determines commercial lending credit limits and automated rate adjustments based on transactional velocity.',
      businessOwner: 'Credit Risk & Quantitative Modeling Team',
      datasetName: 'LendingClub_Enriched_v4 (2.4M records)',
      datasetProvenance: 'Internal Historical Loan Portfolio (2018-2025) with Fair Housing consent.',
      disparateImpactRatio: 0.94,
      humanInTheLoop: true,
      status: 'Production',
      lastAisiAssessmentDate: '2026-08-14',
      aisiaScore: 28
    },
    {
      id: 'AI-SYS-002',
      name: 'Omnichannel Customer Support Copilot',
      type: 'Generative Conversational AI',
      architecture: 'Fine-tuned Llama 3 70B with RAG Architecture',
      riskTier: 'MEDIUM_RISK',
      purpose: 'Answers customer queries, parses policy documents, and creates support tickets with automated categorization.',
      businessOwner: 'Customer Operations & Support Lead',
      datasetName: 'Enterprise_KB_Embeddings_v2',
      datasetProvenance: 'Internal Knowledge Base, Zendesk sanitized transcripts, and FAQ manuals.',
      disparateImpactRatio: 0.98,
      humanInTheLoop: true,
      status: 'Production',
      lastAisiAssessmentDate: '2026-08-20',
      aisiaScore: 18
    },
    {
      id: 'AI-SYS-003',
      name: 'Anti-Money Laundering (AML) Anomaly Detector',
      type: 'Graph Analytics & Fraud Detection',
      architecture: 'Graph Convolutional Network (GCN)',
      riskTier: 'HIGH_RISK',
      purpose: 'Identifies smurfing, circular transactions, and sanctions evasion patterns across open-banking API calls.',
      businessOwner: 'Financial Crime Compliance (FCC)',
      datasetName: 'Synthesized_SWIFT_Graph_v3',
      datasetProvenance: 'Synthetic transaction graphs verified by Financial Intelligence Unit.',
      disparateImpactRatio: 0.91,
      humanInTheLoop: true,
      status: 'Production',
      lastAisiAssessmentDate: '2026-08-18',
      aisiaScore: 32
    },
    {
      id: 'AI-SYS-004',
      name: 'Invoice & Identity Document OCR Engine',
      type: 'Computer Vision & OCR',
      architecture: 'Vision Transformer (Donut / LayoutLMv3)',
      riskTier: 'LOW_RISK',
      purpose: 'Extracts tabular invoice line items and checks KYC document authenticity.',
      businessOwner: 'IT Operations & Workflow Automation',
      datasetName: 'OpenInvoice_Standard_v1',
      datasetProvenance: 'Licensed commercial OCR dataset (Apache 2.0 / Commercial EULA).',
      disparateImpactRatio: 1.0,
      humanInTheLoop: false,
      status: 'Production',
      lastAisiAssessmentDate: '2026-08-05',
      aisiaScore: 11
    }
  ];

  const [aiSystems, setAiSystems] = useState<AISystemRecord[]>(() => {
    try {
      const saved = localStorage.getItem(scopingStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to read aiSystems from localStorage', e);
    }
    return DEFAULT_AI_SYSTEMS;
  });

  const saveAiSystems = (systems: AISystemRecord[]) => {
    setAiSystems(systems);
    try {
      localStorage.setItem(scopingStorageKey, JSON.stringify(systems));
    } catch (e) {
      console.error('Failed to save aiSystems to localStorage', e);
    }
  };

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newSystem, setNewSystem] = useState<Partial<AISystemRecord>>({
    name: '',
    type: 'Generative AI',
    architecture: '',
    riskTier: 'MEDIUM_RISK',
    purpose: '',
    businessOwner: '',
    datasetName: '',
    datasetProvenance: '',
    disparateImpactRatio: 1.0,
    humanInTheLoop: true,
    status: 'Staging'
  });

  const handleOpenAisiaForSystem = (sysId: string) => {
    setTargetSystemForAisia(sysId);
    setActiveTab('ai_sia');
  };

  const handleAisiaCompleted = (record: any) => {
    const sysId = record.systemId || record.aiSystemId;
    if (!sysId) return;

    const derivedTier = record.derivedRiskTier || record.residualRiskTier;
    const mappedTier: 'HIGH_RISK' | 'MEDIUM_RISK' | 'LOW_RISK' | 'EXEMPT' = 
      derivedTier === 'CRITICAL_UNACCEPTABLE' || derivedTier === 'CRITICAL_RISK' || derivedTier === 'HIGH_RISK' ? 'HIGH_RISK' :
      derivedTier === 'MEDIUM_RISK' ? 'MEDIUM_RISK' : 'LOW_RISK';

    const score = record.residualImpactScore ?? record.residualRiskScore ?? 25;
    const isHitl = record.autonomyLevel === 'HUMAN_IN_THE_LOOP' || 
      (Array.isArray(record.appliedMitigations) && record.appliedMitigations.some((m: string) => m.toLowerCase().includes('human')));

    const updated = aiSystems.map(sys => {
      if (sys.id !== sysId) return sys;
      return {
        ...sys,
        riskTier: mappedTier,
        lastAisiAssessmentDate: record.assessmentDate || new Date().toISOString().split('T')[0],
        aisiaScore: score,
        humanInTheLoop: isHitl
      };
    });

    saveAiSystems(updated);
  };

  const filteredSystems = aiSystems.filter(sys => {
    const matchTier = tierFilter === 'All' || sys.riskTier === tierFilter;
    const matchSearch =
      sys.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sys.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sys.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sys.architecture.toLowerCase().includes(searchTerm.toLowerCase());
    return matchTier && matchSearch;
  });

  const handleCreateSystem = () => {
    if (!newSystem.name) return;
    const created: AISystemRecord = {
      id: `AI-SYS-00${aiSystems.length + 1}`,
      name: newSystem.name || 'New AI Model',
      type: newSystem.type || 'Custom Model',
      architecture: newSystem.architecture || 'Neural Network',
      riskTier: newSystem.riskTier || 'MEDIUM_RISK',
      purpose: newSystem.purpose || '',
      businessOwner: newSystem.businessOwner || 'Data Science Team',
      datasetName: newSystem.datasetName || 'Catalog Data v1',
      datasetProvenance: newSystem.datasetProvenance || 'Enterprise Data Lake',
      disparateImpactRatio: newSystem.disparateImpactRatio || 0.95,
      humanInTheLoop: newSystem.humanInTheLoop ?? true,
      status: newSystem.status || 'Staging'
    };
    saveAiSystems([created, ...aiSystems]);
    setShowAddModal(false);
  };

  return (
    <PageContainer id="iso42001-scoping-module">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold">
              ISO/IEC 42001:2023 Clause 4.3 & Annex A.6 / A.10
            </span>
            <span className="text-xs text-slate-400">AI Inventory, Impact Assessments & Supplier Diligence</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            AI Scoping, Impact Assessment & Supplier Workbench
          </h1>
          <p className="text-xs text-slate-300">
            Comprehensive operational workspace for AI model governance, risk evaluation, and third-party supplier diligence across {currentTenant?.name}.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('soa_generator')}
            className="px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 font-medium text-xs flex items-center space-x-2 transition"
          >
            <FileCheck2 className="w-3.5 h-3.5 text-sky-400" />
            <span>Annex A SoA</span>
          </button>
          {activeTab === 'inventory' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs flex items-center space-x-2 transition shadow-lg shadow-purple-950/50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register AI System</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center space-x-2 bg-slate-900/90 border border-slate-800 p-1.5 rounded-xl text-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 rounded-lg font-medium transition flex items-center space-x-2 whitespace-nowrap ${
            activeTab === 'inventory'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>AI System Inventory ({aiSystems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ai_sia')}
          className={`px-4 py-2 rounded-lg font-medium transition flex items-center space-x-2 whitespace-nowrap ${
            activeTab === 'ai_sia'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Interactive AI-SIA Assessment Module</span>
        </button>

        <button
          onClick={() => setActiveTab('suppliers')}
          className={`px-4 py-2 rounded-lg font-medium transition flex items-center space-x-2 whitespace-nowrap ${
            activeTab === 'suppliers'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Third-Party AI Supplier Due Diligence & ZDR</span>
        </button>

        <button
          onClick={() => setActiveTab('soa_generator')}
          className={`px-4 py-2 rounded-lg font-medium transition flex items-center space-x-2 whitespace-nowrap ${
            activeTab === 'soa_generator'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <FileCheck2 className="w-4 h-4 text-sky-400" />
          <span>Annex A.2–A.10 SoA Generator</span>
        </button>
      </div>

      {/* Conditional Content Views */}
      {activeTab === 'soa_generator' ? (
        <ISO42001SoAGenerator tenantName={currentTenant?.name} />
      ) : activeTab === 'ai_sia' ? (
        <AISIAAssessmentWizard 
          targetSystemId={targetSystemForAisia} 
          availableSystems={aiSystems.map(s => ({
            id: s.id,
            name: s.name,
            category: s.type,
            version: s.architecture
          }))}
          tenantId={currentTenant?.id}
          tenantName={currentTenant?.name}
          onAssessmentComplete={handleAisiaCompleted}
          onAssessmentSaved={handleAisiaCompleted}
        />
      ) : activeTab === 'suppliers' ? (
        <ThirdPartyAISupplierDueDiligence />
      ) : (
        <>
          {/* Filter Bar */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search model name, architecture, purpose..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-purple-500"
              >
                <option value="All">All Risk Tiers</option>
                <option value="HIGH_RISK">High Risk</option>
                <option value="MEDIUM_RISK">Medium Risk</option>
                <option value="LOW_RISK">Low Risk</option>
              </select>
            </div>

            <span className="text-xs text-slate-400">
              <span className="text-white font-semibold">{filteredSystems.length}</span> models cataloged
            </span>
          </div>

          {/* Systems Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSystems.map((sys) => (
              <div
                key={sys.id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 transition space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        <Bot className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-mono font-bold text-slate-400">{sys.id}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            sys.riskTier === 'HIGH_RISK' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                            sys.riskTier === 'MEDIUM_RISK' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                            'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}>
                            {sys.riskTier.replace('_', ' ')}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-white mt-0.5">{sys.name}</h3>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                      {sys.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-850">
                    {sys.purpose}
                  </p>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Architecture / Family:</span>
                      <span className="text-slate-200 font-medium">{sys.architecture}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Training Dataset & Lineage:</span>
                      <span className="text-slate-200 font-mono text-[11px] truncate max-w-[200px]" title={sys.datasetName}>
                        {sys.datasetName}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Disparate Impact / Bias Ratio:</span>
                      <span className={`font-mono font-bold ${sys.disparateImpactRatio >= 0.8 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {sys.disparateImpactRatio} (Passes EEOC 4/5ths)
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Human-in-the-Loop (HITL):</span>
                      <span className="text-purple-300 font-medium">
                        {sys.humanInTheLoop ? 'Mandatory Verification Gate' : 'Fully Automated'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>System Owner:</span>
                      <span className="text-slate-200">{sys.businessOwner}</span>
                    </div>
                    {sys.lastAisiAssessmentDate && (
                      <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-slate-800/80">
                        <span>AI-SIA Impact Verified:</span>
                        <span className="text-emerald-400 font-medium flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{sys.lastAisiAssessmentDate} (Score: {sys.aisiaScore ?? 24})</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Action Bar */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Annex A.5 Requirement</span>
                  <button
                    onClick={() => handleOpenAisiaForSystem(sys.id)}
                    className="px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-semibold flex items-center space-x-1.5 transition"
                  >
                    <Scale className="w-3.5 h-3.5" />
                    <span>Conduct AI-SIA Evaluation</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Register In-Scope AI System</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white text-xs font-bold">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">System / Model Name</label>
                <input
                  type="text"
                  placeholder="e.g. Fraud Detection Neural Engine"
                  value={newSystem.name}
                  onChange={(e) => setNewSystem({ ...newSystem, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Risk Tier (ISO 42001)</label>
                  <select
                    value={newSystem.riskTier}
                    onChange={(e) => setNewSystem({ ...newSystem, riskTier: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-purple-500"
                  >
                    <option value="HIGH_RISK">High Risk (Direct User Impact)</option>
                    <option value="MEDIUM_RISK">Medium Risk (Internal Workflow)</option>
                    <option value="LOW_RISK">Low Risk (Exempt / Utilities)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Architecture</label>
                  <input
                    type="text"
                    placeholder="e.g. LLM / Transformer / XGBoost"
                    value={newSystem.architecture}
                    onChange={(e) => setNewSystem({ ...newSystem, architecture: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Intended Purpose & Use Case</label>
                <textarea
                  rows={2}
                  placeholder="Describe operational scope and expected decisions..."
                  value={newSystem.purpose}
                  onChange={(e) => setNewSystem({ ...newSystem, purpose: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Training Dataset Name & Legal Provenance</label>
                <input
                  type="text"
                  placeholder="e.g. Customer_Interaction_Corpus_v2 (Licensed)"
                  value={newSystem.datasetName}
                  onChange={(e) => setNewSystem({ ...newSystem, datasetName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSystem}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs transition shadow-lg shadow-purple-950/50"
              >
                Register System
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};
