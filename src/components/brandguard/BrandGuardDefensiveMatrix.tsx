// Skanda BrandGuard — Defensive Domain Recommendation & Homoglyph Matrix Generator
// Interactively analyzes Cyrillic lookalikes, IDN Punycode, typosquatting, combosquatting,
// and secondary TLD vulnerabilities with procurement budgeting and bulk export.

import React, { useState } from 'react';
import {
  Globe,
  ShieldAlert,
  Search,
  Download,
  CheckCircle2,
  ShoppingCart,
  AlertTriangle,
  Flame,
  ArrowRight,
  Plus,
  Trash2,
  Check,
  Eye,
  RefreshCw,
  Lock
} from 'lucide-react';
import { BrandProfile } from '../../types/brandguard';
import {
  BrandGuardHomoglyphService,
  DefensiveDomainVariant
} from '../../services/brandguard/brandguardHomoglyphService';
import { useGRC } from '../../context/GRCContext';
import { BrandGuardHomoglyphScatterPlot } from './BrandGuardHomoglyphScatterPlot';

interface BrandGuardDefensiveMatrixProps {
  brandProfile: BrandProfile;
  onInspectEmail?: (domain: string) => void;
}

export const BrandGuardDefensiveMatrix: React.FC<BrandGuardDefensiveMatrixProps> = ({
  brandProfile,
  onInspectEmail
}) => {
  const { theme, logAuditEvent } = useGRC();
  const defaultDomain = brandProfile.officialDomains[0] || 'apexfintech.com';
  const [baseDomain, setBaseDomain] = useState(defaultDomain);
  const [matrix, setMatrix] = useState<DefensiveDomainVariant[]>(() =>
    BrandGuardHomoglyphService.generateMatrix(defaultDomain)
  );
  const [selectedCategory, setSelectedCategory] = useState<
    'ALL' | 'CRITICAL_DEFENSE' | 'HOMOGLYPH' | 'COMBOSQUATTING' | 'TYPOSQUATTING' | 'TLD_VARIATION' | 'AVAILABLE'
  >('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const handleRegenerate = (domainToUse: string = baseDomain) => {
    const fresh = BrandGuardHomoglyphService.generateMatrix(domainToUse.trim() || 'apexfintech.com');
    setMatrix(fresh);
  };

  const handleToggleCart = (variant: DefensiveDomainVariant) => {
    const isInCart = BrandGuardHomoglyphService.toggleProcurementCart(variant.domain);
    setMatrix(prev =>
      prev.map(v => (v.id === variant.id ? { ...v, inProcurementCart: isInCart } : v))
    );

    logAuditEvent(
      'UPDATE',
      'BrandGuard Defensive Matrix',
      `${isInCart ? 'Added' : 'Removed'} ${variant.domain} ${isInCart ? 'to' : 'from'} defensive procurement registrar queue.`
    );
  };

  const handleExportCSV = () => {
    BrandGuardHomoglyphService.exportProcurementCSV(filteredVariants);
    logAuditEvent(
      'EXPORT',
      'BrandGuard Defensive Matrix',
      `Exported defensive domain procurement order CSV (${filteredVariants.length} records)`
    );
  };

  const filteredVariants = matrix.filter(v => {
    if (selectedCategory === 'CRITICAL_DEFENSE' && v.priorityTier !== 'CRITICAL_DEFENSE') return false;
    if (selectedCategory === 'AVAILABLE' && v.registrationStatus !== 'AVAILABLE_FOR_PURCHASE') return false;
    if (['HOMOGLYPH', 'COMBOSQUATTING', 'TYPOSQUATTING', 'TLD_VARIATION'].includes(selectedCategory)) {
      if (v.technique !== selectedCategory) return false;
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const mDomain = v.domain.toLowerCase().includes(q);
      const mPuny = v.punycode.toLowerCase().includes(q);
      const mRatio = v.threatRationale.toLowerCase().includes(q);
      if (!mDomain && !mPuny && !mRatio) return false;
    }
    return true;
  });

  const criticalCount = matrix.filter(v => v.priorityTier === 'CRITICAL_DEFENSE').length;
  const availableCount = matrix.filter(v => v.registrationStatus === 'AVAILABLE_FOR_PURCHASE').length;
  const squattedCount = matrix.filter(v => v.registrationStatus.includes('SQUATTED')).length;
  const cartCount = matrix.filter(v => v.inProcurementCart).length;
  const cartTotalCost = matrix
    .filter(v => v.inProcurementCart)
    .reduce((sum, v) => sum + v.estimatedAnnualFeeUSD, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner & Domain Permutation Engine */}
      <div className={`p-5 rounded-2xl border ${
        theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Globe className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-bold">Defensive Domain Recommendation & Homoglyph Matrix</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Proactive pre-registration advisory mapping Cyrillic lookalikes, IDN Punycode, typosquatting, and combosquats
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 shrink-0">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center space-x-1.5 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export Registrar CSV</span>
            </button>
          </div>
        </div>

        {/* Domain Generator Form */}
        <div className="mt-4 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-400 whitespace-nowrap">Target Core Brand Domain:</span>
            <input
              type="text"
              value={baseDomain}
              onChange={e => setBaseDomain(e.target.value)}
              placeholder="e.g. apexfintech.com"
              className={`flex-1 text-xs font-mono px-3 py-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                theme === 'light' ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
              }`}
            />
          </div>

          <button
            onClick={() => handleRegenerate()}
            className="w-full sm:w-auto px-4 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center space-x-1.5 transition-colors shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Generate Homoglyphs & Permutations</span>
          </button>
        </div>

        {/* 4 Summary Stats */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Permutations Evaluated</span>
            <span className="text-base font-bold text-slate-200 mt-0.5 block">{matrix.length} Permutations</span>
            <span className="text-[10px] text-slate-400">Algorithmic coverage</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Critical Defensive Priority</span>
            <span className="text-base font-bold text-rose-400 mt-0.5 block">{criticalCount} Domains</span>
            <span className="text-[10px] text-rose-300">High deception probability</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Available to Defensively Buy</span>
            <span className="text-base font-bold text-emerald-400 mt-0.5 block">{availableCount} Unregistered</span>
            <span className="text-[10px] text-emerald-300">Low-cost defensive protection</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Active External Squatters</span>
            <span className="text-base font-bold text-amber-400 mt-0.5 block">{squattedCount} Already Taken</span>
            <span className="text-[10px] text-amber-300">Tracked in continuous monitoring</span>
          </div>
        </div>

        {/* Procurement Cart Bar (if items queued) */}
        {cartCount > 0 && (
          <div className="mt-4 p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/40 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="w-4 h-4 text-indigo-400" />
              <span className="font-bold text-indigo-300">
                {cartCount} Domain(s) Queued for Defensive Registrar Acquisition
              </span>
              <span className="text-slate-400">
                (Est. Annual Total: <strong className="text-white">${cartTotalCost.toFixed(2)} USD/yr</strong>)
              </span>
            </div>
            <button
              onClick={handleExportCSV}
              className="px-3 py-1 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center space-x-1 shadow-sm"
            >
              <span>Download Purchase Order</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Interactive Homoglyph Attack Surface Scatter Plot */}
      <BrandGuardHomoglyphScatterPlot
        variants={matrix}
        onToggleCart={handleToggleCart}
        onInspectEmail={onInspectEmail}
      />

      {/* Filter Tabs & Search Row */}
      <div className={`p-4 rounded-2xl border flex flex-col lg:flex-row items-center justify-between gap-3 ${
        theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
      }`}>
        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search variant, punycode, or threat..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
              theme === 'light' ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
            }`}
          />
        </div>

        <div className="flex items-center space-x-1.5 w-full lg:w-auto overflow-x-auto text-xs font-bold">
          {[
            { id: 'ALL', label: 'All Variants' },
            { id: 'CRITICAL_DEFENSE', label: 'Critical Defense' },
            { id: 'HOMOGLYPH', label: 'Cyrillic Homoglyphs' },
            { id: 'COMBOSQUATTING', label: 'Combosquatting' },
            { id: 'TYPOSQUATTING', label: 'Typosquatting' },
            { id: 'TLD_VARIATION', label: 'Secondary TLDs' },
            { id: 'AVAILABLE', label: 'Available to Buy' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                selectedCategory === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Domain Matrix Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredVariants.map(variant => {
          const isHomoglyph = variant.technique === 'HOMOGLYPH';
          const isAvailable = variant.registrationStatus === 'AVAILABLE_FOR_PURCHASE';

          return (
            <div
              key={variant.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
              }`}
            >
              <div>
                {/* Header with Domain & Badges */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-base font-bold font-mono text-white tracking-wide">
                        {variant.domain}
                      </span>
                      {isHomoglyph && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          CYRILLIC
                        </span>
                      )}
                    </div>
                    {isHomoglyph && (
                      <span className="text-[11px] font-mono text-indigo-400 block mt-0.5">
                        IDN Punycode: {variant.punycode}
                      </span>
                    )}
                  </div>

                  <div className="shrink-0 text-right">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      variant.priorityTier === 'CRITICAL_DEFENSE'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}>
                      {variant.priorityTier.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 block mt-1">
                      Risk Score: {variant.deceptionScore}/100
                    </span>
                  </div>
                </div>

                {/* Threat Rationale */}
                <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
                  {variant.threatRationale}
                </p>

                {/* Status Indicator & Fee */}
                <div className="mt-3 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className={`w-2 h-2 rounded-full ${
                      isAvailable ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
                    }`} />
                    <span className="font-semibold text-slate-200">
                      {isAvailable ? 'Available for Defensive Registration' : 'Squatted by External Party'}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-slate-300">
                    ~${variant.estimatedAnnualFeeUSD.toFixed(2)}/yr
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-3.5 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500 font-mono">
                  Technique: {variant.technique.replace(/_/g, ' ')}
                </span>

                <div className="flex items-center space-x-2">
                  {isAvailable ? (
                    <button
                      onClick={() => handleToggleCart(variant)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors border ${
                        variant.inProcurementCart
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : 'bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border-indigo-500/40'
                      }`}
                    >
                      {variant.inProcurementCart ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>In Procurement Queue</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>Queue for Acquisition</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-400 text-[11px] font-semibold flex items-center space-x-1">
                      <Lock className="w-3 h-3 text-amber-400" />
                      <span>Monitored in CT Feed</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
