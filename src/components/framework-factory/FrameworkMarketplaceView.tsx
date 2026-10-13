/**
 * SKANDA Enterprise Framework Factory — Framework Marketplace & Catalog
 * Path: src/components/framework-factory/FrameworkMarketplaceView.tsx
 */

import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Layers,
  ShieldCheck,
  Globe,
  Building,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  BookOpen,
  Sparkles,
  SlidersHorizontal,
  Lock,
  Scale,
  Brain,
  CreditCard,
  HeartPulse,
  Cloud,
  FileCheck
} from 'lucide-react';
import { FrameworkRecord, FrameworkClassification, FrameworkMaturityLevel } from '../../types/frameworkFactoryTypes';

interface FrameworkMarketplaceViewProps {
  frameworks: FrameworkRecord[];
  onSelectFramework: (frameworkCode: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const FrameworkMarketplaceView: React.FC<FrameworkMarketplaceViewProps> = ({
  frameworks,
  onSelectFramework,
  onNavigateTab
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<string>('ALL');
  const [selectedMaturity, setSelectedMaturity] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');

  const categories = [
    { id: 'ALL', label: 'All Frameworks' },
    { id: 'SECURITY', label: 'Security & ISMS', icon: ShieldCheck },
    { id: 'PRIVACY', label: 'Privacy & Data Protection', icon: Lock },
    { id: 'AI', label: 'AI Governance', icon: Brain },
    { id: 'FINANCIAL', label: 'Financial & Banking', icon: Scale },
    { id: 'PAYMENTS', label: 'Payments & Cardholder', icon: CreditCard },
    { id: 'CLOUD', label: 'Cloud & SaaS', icon: Cloud },
    { id: 'HEALTHCARE', label: 'Healthcare & HIPAA', icon: HeartPulse }
  ];

  const filteredFrameworks = useMemo(() => {
    return frameworks.filter(fw => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          fw.frameworkName.toLowerCase().includes(q) ||
          fw.shortName.toLowerCase().includes(q) ||
          fw.frameworkCode.toLowerCase().includes(q) ||
          fw.publisher.toLowerCase().includes(q) ||
          fw.tags.some(t => t.toLowerCase().includes(q));
        if (!matches) return false;
      }

      // 2. Category Filter
      if (selectedCategory !== 'ALL') {
        if (selectedCategory === 'SECURITY' && !['CERTIFICATION_STANDARD', 'INTERNATIONAL_STANDARD', 'CYBERSECURITY_FRAMEWORK'].includes(fw.frameworkType)) return false;
        if (selectedCategory === 'PRIVACY' && !['PRIVACY_FRAMEWORK', 'REGULATION'].includes(fw.frameworkType) && !fw.tags.includes('Privacy')) return false;
        if (selectedCategory === 'AI' && fw.frameworkType !== 'AI_GOVERNANCE_FRAMEWORK') return false;
        if (selectedCategory === 'FINANCIAL' && !['REGULATORY_GUIDELINE', 'REGULATORY_NOTICE', 'REGULATION'].includes(fw.frameworkType) && !fw.tags.includes('MAS TRM') && !fw.tags.includes('DORA')) return false;
        if (selectedCategory === 'PAYMENTS' && fw.frameworkType !== 'PAYMENT_SECURITY_STANDARD') return false;
        if (selectedCategory === 'CLOUD' && fw.frameworkType !== 'CLOUD_SECURITY_STANDARD' && !fw.tags.includes('Cloud')) return false;
        if (selectedCategory === 'HEALTHCARE' && fw.frameworkType !== 'HEALTHCARE_STANDARD') return false;
      }

      // 3. Jurisdiction Filter
      if (selectedJurisdiction !== 'ALL') {
        if (selectedJurisdiction === 'GLOBAL' && fw.region !== 'Global' && !fw.jurisdiction.includes('Global')) return false;
        if (selectedJurisdiction === 'EU' && fw.region !== 'European Union' && !fw.jurisdiction.includes('European')) return false;
        if (selectedJurisdiction === 'SINGAPORE' && fw.country !== 'Singapore') return false;
        if (selectedJurisdiction === 'US' && fw.country !== 'United States') return false;
        if (selectedJurisdiction === 'INDIA' && fw.country !== 'India') return false;
      }

      // 4. Maturity Filter
      if (selectedMaturity !== 'ALL' && fw.maturityLevel !== selectedMaturity) {
        return false;
      }

      // 5. Type Filter
      if (selectedType !== 'ALL' && fw.frameworkType !== selectedType) {
        return false;
      }

      return true;
    });
  }, [frameworks, searchQuery, selectedCategory, selectedJurisdiction, selectedMaturity, selectedType]);

  return (
    <div className="space-y-6">
      {/* Header with Search & Discovery Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Enterprise Framework Marketplace & Standards Registry
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Discover, ingest, and harmonize global security standards, financial regulations, privacy statutes, and AI frameworks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by framework, ISO, NIST, law..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
            />
          </div>

          <button
            onClick={() => onNavigateTab('applicability')}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm flex items-center gap-1.5 transition-all whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
            Run Applicability Discovery
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map(cat => {
          const Icon = cat.icon || Layers;
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Secondary Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500 dark:text-slate-400">Jurisdiction:</span>
            <select
              value={selectedJurisdiction}
              onChange={e => setSelectedJurisdiction(e.target.value)}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Regions (Global)</option>
              <option value="GLOBAL">Global Standards</option>
              <option value="EU">European Union (EU)</option>
              <option value="SINGAPORE">Singapore (MAS)</option>
              <option value="US">United States</option>
              <option value="INDIA">India (MeitY/DPDP)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500 dark:text-slate-400">Maturity Level:</span>
            <select
              value={selectedMaturity}
              onChange={e => setSelectedMaturity(e.target.value)}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Maturity Levels (L0-L6)</option>
              <option value="LEVEL_6_PRODUCTION_VERIFIED">Level 6: Production Verified</option>
              <option value="LEVEL_5_CONTINUOUSLY_ASSURED">Level 5: Continuously Assured</option>
              <option value="LEVEL_4_AUTOMATED">Level 4: Automated</option>
              <option value="LEVEL_3_MAPPED">Level 3: Mapped</option>
              <option value="LEVEL_2_STRUCTURED">Level 2: Structured</option>
              <option value="LEVEL_1_SOURCE_VERIFIED">Level 1: Source Verified</option>
              <option value="LEVEL_0_CATALOG_ONLY">Level 0: Catalog Only</option>
            </select>
          </div>
        </div>

        <div className="text-slate-500 dark:text-slate-400 font-medium">
          Showing <span className="font-bold text-slate-900 dark:text-white">{filteredFrameworks.length}</span> of {frameworks.length} Frameworks
        </div>
      </div>

      {/* Framework Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFrameworks.map(fw => {
          const isStatute = fw.frameworkType === 'REGULATION' || fw.bindingNature === 'LEGALLY_BINDING_STATUTE';
          const isStandard = fw.frameworkType === 'CERTIFICATION_STANDARD' || fw.frameworkType === 'INTERNATIONAL_STANDARD';
          const isAttestation = fw.frameworkType === 'ATTESTATION_FRAMEWORK';
          const isNotice = fw.frameworkType === 'REGULATORY_NOTICE';
          const isAI = fw.frameworkType === 'AI_GOVERNANCE_FRAMEWORK';

          return (
            <div
              key={fw.frameworkId}
              className="flex flex-col justify-between bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 hover:border-indigo-500 hover:shadow-lg transition-all group"
            >
              <div className="space-y-3">
                {/* Card Top: Badges & Publisher */}
                <div className="flex items-start justify-between gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    isStatute
                      ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-300/50'
                      : isNotice
                      ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-300/50'
                      : isStandard
                      ? 'bg-sky-100 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 border border-sky-300/50'
                      : isAttestation
                      ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-300/50'
                      : isAI
                      ? 'bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-300/50'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}>
                    {fw.frameworkType.replace(/_/g, ' ')}
                  </span>

                  <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {fw.version}
                  </span>
                </div>

                {/* Title & Publisher */}
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                    {fw.frameworkName}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 shrink-0" />
                    <span className="line-clamp-1">{fw.publisher}</span>
                  </p>
                </div>

                {/* Statutory / Standard Citation */}
                <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 leading-relaxed line-clamp-2">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Citation: </span>
                  {fw.citation}
                </div>

                {/* Metrics Matrix */}
                <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 dark:border-slate-800 text-center text-xs">
                  <div className="bg-slate-50/80 dark:bg-slate-800/40 p-2 rounded-lg">
                    <div className="text-[10px] text-slate-600 dark:text-slate-300 font-semibold uppercase">Reqs</div>
                    <div className="font-bold text-slate-900 dark:text-white mt-0.5">{fw.totalRequirementsCount}</div>
                  </div>
                  <div className="bg-slate-50/80 dark:bg-slate-800/40 p-2 rounded-lg">
                    <div className="text-[10px] text-slate-600 dark:text-slate-300 font-semibold uppercase">Controls</div>
                    <div className="font-bold text-slate-900 dark:text-white mt-0.5">{fw.mappedControlsCount}</div>
                  </div>
                  <div className="bg-slate-50/80 dark:bg-slate-800/40 p-2 rounded-lg">
                    <div className="text-[10px] text-slate-600 dark:text-slate-300 font-semibold uppercase">Assurance</div>
                    <div className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{fw.assuranceCoveragePercent}%</div>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {fw.tags.slice(0, 3).map((tag, idx) => (
                    <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                      #{tag}
                    </span>
                  ))}
                  {fw.tags.length > 3 && (
                    <span className="text-[10px] text-slate-600 dark:text-slate-300 self-center">
                      +{fw.tags.length - 3}
                    </span>
                  )}
                </div>
              </div>

              {/* Card Footer: Maturity & Action */}
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                    {fw.maturityLevel.replace(/_/g, ' ')}
                  </span>
                </div>

                <button
                  onClick={() => onSelectFramework(fw.frameworkCode)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-600 hover:text-white text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60 transition-all flex items-center gap-1"
                >
                  Detail 360° <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
