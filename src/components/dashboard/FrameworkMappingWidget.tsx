import React, { useState, useMemo } from 'react';
import {
  Layers,
  ArrowRightLeft,
  CheckCircle2,
  ShieldCheck,
  Award,
  Flame,
  Building2,
  Sparkles,
  CreditCard,
  Scale,
  Search,
  Download,
  Copy,
  Check,
  Info,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Filter,
  FileSpreadsheet,
  Zap,
  HelpCircle,
  FileCheck,
  SlidersHorizontal,
  BookmarkPlus,
  RefreshCw,
  Lightbulb,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import {
  FrameworkId,
  FrameworkMeta,
  SUPPORTED_FRAMEWORKS,
  RECOMMENDED_PAIRINGS,
  generateFrameworkPairCrosswalk,
  OverlappingControlMapping,
  UniqueControlRequirement
} from '../../data/frameworkMappingData';

interface FrameworkMappingWidgetProps {
  onNavigateModule?: (moduleId: string) => void;
  selectedFrameworkId?: string | null;
}

export const FrameworkMappingWidget: React.FC<FrameworkMappingWidgetProps> = ({
  onNavigateModule,
  selectedFrameworkId
}) => {
  // Determine initial frameworks based on optional prop
  const initialA: FrameworkId = useMemo(() => {
    if (selectedFrameworkId) {
      const normalized = selectedFrameworkId.toUpperCase();
      if (normalized.includes('42001')) return 'ISO_42001';
      if (normalized.includes('SOC')) return 'SOC_2';
      if (normalized.includes('NIST')) return 'NIST_CSF';
      if (normalized.includes('MAS')) return 'MAS_TRM';
      if (normalized.includes('PCI')) return 'PCI_DSS';
      if (normalized.includes('DPDP')) return 'INDIA_DPDP';
    }
    return 'ISO_27001';
  }, [selectedFrameworkId]);

  const [frameworkAId, setFrameworkAId] = useState<FrameworkId>(initialA);
  const [frameworkBId, setFrameworkBId] = useState<FrameworkId>('SOC_2');

  // Filter state
  const [activeTab, setActiveTab] = useState<'ALL' | 'OVERLAPPING' | 'UNIQUE_A' | 'UNIQUE_B'>('OVERLAPPING');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDomain, setSelectedDomain] = useState<string>('ALL');
  const [reusabilityFilter, setReusabilityFilter] = useState<string>('ALL');

  // Expanded items
  const [expandedMappingId, setExpandedMappingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showAiGapModal, setShowAiGapModal] = useState<boolean>(false);
  const [linkedControls, setLinkedControls] = useState<Record<string, boolean>>({});

  // Get current framework metadata
  const metaA = useMemo(
    () => SUPPORTED_FRAMEWORKS.find(f => f.id === frameworkAId) || SUPPORTED_FRAMEWORKS[0],
    [frameworkAId]
  );
  const metaB = useMemo(
    () => SUPPORTED_FRAMEWORKS.find(f => f.id === frameworkBId) || SUPPORTED_FRAMEWORKS[1],
    [frameworkBId]
  );

  // Compute crosswalk analysis
  const crosswalkAnalysis = useMemo(
    () => generateFrameworkPairCrosswalk(frameworkAId, frameworkBId),
    [frameworkAId, frameworkBId]
  );

  // Extract all unique domains from current dataset
  const availableDomains = useMemo(() => {
    const domains = new Set<string>();
    crosswalkAnalysis.overlapping.forEach(o => domains.add(o.domain));
    crosswalkAnalysis.uniqueToA.forEach(u => domains.add(u.domain));
    crosswalkAnalysis.uniqueToB.forEach(u => domains.add(u.domain));
    return Array.from(domains).sort();
  }, [crosswalkAnalysis]);

  // Swap frameworks
  const handleSwapFrameworks = () => {
    setFrameworkAId(frameworkBId);
    setFrameworkBId(frameworkAId);
  };

  // Quick preset selection
  const handleSelectPreset = (a: FrameworkId, b: FrameworkId) => {
    setFrameworkAId(a);
    setFrameworkBId(b);
    setActiveTab('OVERLAPPING');
  };

  // Filtered lists
  const filteredOverlapping = useMemo(() => {
    return crosswalkAnalysis.overlapping.filter(item => {
      const matchesSearch =
        searchQuery === '' ||
        item.controlA.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.controlA.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.controlB.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.controlB.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.synergyExplanation.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDomain = selectedDomain === 'ALL' || item.domain === selectedDomain;
      const matchesReusability =
        reusabilityFilter === 'ALL' || item.evidenceReusability === reusabilityFilter;

      return matchesSearch && matchesDomain && matchesReusability;
    });
  }, [crosswalkAnalysis.overlapping, searchQuery, selectedDomain, reusabilityFilter]);

  const filteredUniqueA = useMemo(() => {
    return crosswalkAnalysis.uniqueToA.filter(item => {
      const matchesSearch =
        searchQuery === '' ||
        item.control.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.control.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.whyUnique.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDomain = selectedDomain === 'ALL' || item.domain === selectedDomain;
      return matchesSearch && matchesDomain;
    });
  }, [crosswalkAnalysis.uniqueToA, searchQuery, selectedDomain]);

  const filteredUniqueB = useMemo(() => {
    return crosswalkAnalysis.uniqueToB.filter(item => {
      const matchesSearch =
        searchQuery === '' ||
        item.control.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.control.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.whyUnique.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDomain = selectedDomain === 'ALL' || item.domain === selectedDomain;
      return matchesSearch && matchesDomain;
    });
  }, [crosswalkAnalysis.uniqueToB, searchQuery, selectedDomain]);

  const totalVisibleCount = useMemo(() => {
    if (activeTab === 'OVERLAPPING') return filteredOverlapping.length;
    if (activeTab === 'UNIQUE_A') return filteredUniqueA.length;
    if (activeTab === 'UNIQUE_B') return filteredUniqueB.length;
    return filteredOverlapping.length + filteredUniqueA.length + filteredUniqueB.length;
  }, [activeTab, filteredOverlapping.length, filteredUniqueA.length, filteredUniqueB.length]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopyEvidence = (mapping: OverlappingControlMapping) => {
    const text = `[CROSSWALK EVIDENCE PACKAGE]\n${metaA.shortTitle} ${mapping.controlA.code}: ${mapping.controlA.title}\n${metaB.shortTitle} ${mapping.controlB.code}: ${mapping.controlB.title}\nMapping: ${mapping.mappingType} (${mapping.confidenceScore}% confidence)\nReusability: ${mapping.evidenceReusability}\n\nShared Evidence Artifacts:\n${mapping.sharedEvidenceArtifacts.map(a => `• ${a}`).join('\n')}\n\nSynergy Notes:\n${mapping.synergyExplanation}`;
    navigator.clipboard.writeText(text);
    setCopiedId(mapping.id);
    showToast(`Copied shared evidence artifacts for ${mapping.controlA.code} / ${mapping.controlB.code}!`);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleLinkToAudit = (id: string, label: string) => {
    setLinkedControls(prev => ({ ...prev, [id]: !prev[id] }));
    showToast(`Linked "${label}" to Joint Audit Evidence Binder!`);
  };

  const handleExportMatrix = (format: 'CSV' | 'JSON') => {
    if (format === 'JSON') {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(crosswalkAnalysis, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `crosswalk-${frameworkAId}-vs-${frameworkBId}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('Exported Crosswalk Matrix to JSON!');
    } else {
      // CSV format
      const headers = [
        'Category',
        'Framework A Code',
        'Framework A Title',
        'Framework B Code',
        'Framework B Title',
        'Domain',
        'Mapping Type',
        'Confidence Score',
        'Evidence Reusability',
        'Shared Evidence Artifacts',
        'Synergy Guidance'
      ];
      const rows = crosswalkAnalysis.overlapping.map(o => [
        'OVERLAPPING',
        `"${o.controlA.code}"`,
        `"${o.controlA.title.replace(/"/g, '""')}"`,
        `"${o.controlB.code}"`,
        `"${o.controlB.title.replace(/"/g, '""')}"`,
        `"${o.domain}"`,
        `"${o.mappingType}"`,
        `"${o.confidenceScore}%"`,
        `"${o.evidenceReusability}"`,
        `"${o.sharedEvidenceArtifacts.join('; ').replace(/"/g, '""')}"`,
        `"${o.synergyExplanation.replace(/"/g, '""')}"`
      ]);

      crosswalkAnalysis.uniqueToA.forEach(u => {
        rows.push([
          `UNIQUE TO ${metaA.shortTitle}`,
          `"${u.control.code}"`,
          `"${u.control.title.replace(/"/g, '""')}"`,
          'N/A',
          'Not evaluated in Framework B',
          `"${u.domain}"`,
          'UNIQUE',
          '100%',
          'UNIQUE_EFFORT',
          `"${u.targetDeliverable.replace(/"/g, '""')}"`,
          `"${u.whyUnique.replace(/"/g, '""')} Guidance: ${u.complianceGuidance.replace(/"/g, '""')}"`
        ]);
      });

      crosswalkAnalysis.uniqueToB.forEach(u => {
        rows.push([
          `UNIQUE TO ${metaB.shortTitle}`,
          'N/A',
          'Not evaluated in Framework A',
          `"${u.control.code}"`,
          `"${u.control.title.replace(/"/g, '""')}"`,
          `"${u.domain}"`,
          'UNIQUE',
          '100%',
          'UNIQUE_EFFORT',
          `"${u.targetDeliverable.replace(/"/g, '""')}"`,
          `"${u.whyUnique.replace(/"/g, '""')} Guidance: ${u.complianceGuidance.replace(/"/g, '""')}"`
        ]);
      });

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `crosswalk-${frameworkAId}-vs-${frameworkBId}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast('Exported Crosswalk Matrix to CSV!');
    }
  };

  const renderFrameworkIcon = (iconName: string, className: string = 'w-4 h-4') => {
    switch (iconName) {
      case 'ShieldCheck':
        return <ShieldCheck className={className} />;
      case 'Award':
        return <Award className={className} />;
      case 'Flame':
        return <Flame className={className} />;
      case 'Building2':
        return <Building2 className={className} />;
      case 'Sparkles':
        return <Sparkles className={className} />;
      case 'CreditCard':
        return <CreditCard className={className} />;
      case 'Scale':
        return <Scale className={className} />;
      default:
        return <Layers className={className} />;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Toast alert */}
      {toastMessage && (
        <div className="bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs px-4 py-2.5 font-medium flex items-center justify-between transition-all duration-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white dark:hover:text-slate-900 text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header & Framework Comparison Selector */}
      <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-50 via-slate-50 to-indigo-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/40">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0 border border-indigo-600/20 shadow-sm">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  Framework Mapping & Crosswalk Visualizer
                </h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  <ArrowRightLeft className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                  Dual-Standard Crosswalk
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  Harmonized Synergy Engine
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Select two regulatory frameworks to isolate overlapping controls for unified audits, discover unique requirements, and eliminate redundant evidence collection.
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {onNavigateModule && (
              <button
                onClick={() => onNavigateModule('cross_framework_crosswalk')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-xs cursor-pointer"
                title="Open Enterprise Multi-Standard Crosswalk Engine"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>Open Full Crosswalk</span>
              </button>
            )}
            <button
              onClick={() => setShowAiGapModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-lg border border-indigo-200 dark:border-indigo-800 transition-colors shadow-xs"
            >
              <Lightbulb className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>AI Gap Analysis</span>
            </button>
            <div className="relative group">
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export Matrix</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
              <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 hidden group-hover:block z-20">
                <button
                  onClick={() => handleExportMatrix('CSV')}
                  className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Download CSV Table</span>
                </button>
                <button
                  onClick={() => handleExportMatrix('JSON')}
                  className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                >
                  <Download className="w-3.5 h-3.5 text-blue-500" />
                  <span>Download JSON Model</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Dual Framework Selector & Swapper */}
        <div className="mt-5 p-4 bg-white dark:bg-slate-950/70 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center">
            {/* Framework A */}
            <div className="md:col-span-5 p-3 rounded-lg border border-sky-200 dark:border-sky-900/60 bg-sky-50/40 dark:bg-sky-950/20">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-500" />
                  Framework A (Baseline)
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {metaA.totalControls} Controls
                </span>
              </div>
              <div className="relative">
                <select
                  value={frameworkAId}
                  onChange={e => setFrameworkAId(e.target.value as FrameworkId)}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs focus:ring-2 focus:ring-sky-500 focus:outline-none pr-8 appearance-none"
                >
                  {SUPPORTED_FRAMEWORKS.map(f => (
                    <option key={f.id} value={f.id} disabled={f.id === frameworkBId}>
                      {f.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                <span className="truncate">{metaA.authority}</span>
                <span>•</span>
                <span className="truncate font-mono">{metaA.version}</span>
              </div>
            </div>

            {/* Swap Button */}
            <div className="md:col-span-1 flex justify-center">
              <button
                onClick={handleSwapFrameworks}
                title="Swap Framework A and Framework B"
                className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-600 dark:text-slate-300 flex items-center justify-center border border-slate-200 dark:border-slate-700 transition-transform active:scale-95 shadow-xs"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Framework B */}
            <div className="md:col-span-5 p-3 rounded-lg border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  Framework B (Comparison)
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {metaB.totalControls} Controls
                </span>
              </div>
              <div className="relative">
                <select
                  value={frameworkBId}
                  onChange={e => setFrameworkBId(e.target.value as FrameworkId)}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none pr-8 appearance-none"
                >
                  {SUPPORTED_FRAMEWORKS.map(f => (
                    <option key={f.id} value={f.id} disabled={f.id === frameworkAId}>
                      {f.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                <span className="truncate">{metaB.authority}</span>
                <span>•</span>
                <span className="truncate font-mono">{metaB.version}</span>
              </div>
            </div>
          </div>

          {/* Quick Preset Selector Chips */}
          <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 flex-wrap text-xs">
            <span className="text-slate-400 dark:text-slate-500 font-medium text-[11px] mr-1">
              Popular Crosswalks:
            </span>
            {RECOMMENDED_PAIRINGS.map(p => {
              const isActive =
                (frameworkAId === p.frameworkA && frameworkBId === p.frameworkB) ||
                (frameworkAId === p.frameworkB && frameworkBId === p.frameworkA);
              return (
                <button
                  key={p.pairId}
                  onClick={() => handleSelectPreset(p.frameworkA, p.frameworkB)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                      : 'bg-slate-100 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Executive Synergy & Overlap Highlights Scorecard */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {/* Synergy Score */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Crosswalk Synergy</span>
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                {crosswalkAnalysis.overallSynergyScore}%
              </span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                High Overlap
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                style={{ width: `${crosswalkAnalysis.overallSynergyScore}%` }}
              />
            </div>
          </div>

          {/* Audit Hours Saved */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Audit Time Saved</span>
              <Clock className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {crosswalkAnalysis.estimatedAuditHoursSaved}+ hrs
              </span>
              <span className="text-[11px] text-slate-500">estimated</span>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 truncate">
              Via direct evidence artifact reuse
            </p>
          </div>

          {/* Overlapping Controls Count */}
          <div
            onClick={() => setActiveTab('OVERLAPPING')}
            className={`p-3.5 rounded-xl border shadow-xs cursor-pointer transition-all ${
              activeTab === 'OVERLAPPING'
                ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                : 'bg-white dark:bg-slate-950/70 border-slate-200 dark:border-slate-800 hover:border-emerald-300'
            }`}
          >
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Overlapping (Shared)</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                {crosswalkAnalysis.overlapping.length}
              </span>
              <span className="text-[11px] text-slate-500">common controls</span>
            </div>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
              {crosswalkAnalysis.directEvidenceReuseRate}% Direct Reusability
            </p>
          </div>

          {/* Unique Requirements Count */}
          <div
            onClick={() => setActiveTab(activeTab === 'UNIQUE_A' ? 'UNIQUE_B' : 'UNIQUE_A')}
            className={`p-3.5 rounded-xl border shadow-xs cursor-pointer transition-all ${
              activeTab === 'UNIQUE_A' || activeTab === 'UNIQUE_B'
                ? 'bg-indigo-50/60 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-800'
                : 'bg-white dark:bg-slate-950/70 border-slate-200 dark:border-slate-800 hover:border-indigo-300'
            }`}
          >
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Unique Controls</span>
              <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-500" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                {crosswalkAnalysis.uniqueToA.length + crosswalkAnalysis.uniqueToB.length}
              </span>
              <span className="text-[11px] text-slate-500">distinct gaps</span>
            </div>
            <p className="text-[10px] text-indigo-600 dark:text-indigo-400 mt-1 font-semibold truncate">
              {crosswalkAnalysis.uniqueToA.length} in A • {crosswalkAnalysis.uniqueToB.length} in B
            </p>
          </div>
        </div>

        {/* Visual Venn / Intersection Interactive Distribution */}
        <div className="mt-4 p-4 rounded-xl bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Control Requirement Distribution & Overlap Visualizer
            </span>
            <span className="text-[11px] text-slate-400">Click any section to filter controls</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
            {/* Left Segment: Unique to Framework A */}
            <div
              onClick={() => setActiveTab('UNIQUE_A')}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                activeTab === 'UNIQUE_A'
                  ? 'bg-sky-50 dark:bg-sky-950/50 border-sky-400 dark:border-sky-600 ring-2 ring-sky-400/20'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-sky-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-sky-700 dark:text-sky-300 truncate">
                  Unique to {metaA.shortTitle}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300">
                  {crosswalkAnalysis.uniqueToA.length}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                Controls exclusively required by {metaA.shortTitle} not evaluated under {metaB.shortTitle}.
              </p>
            </div>

            {/* Center Segment: Overlapping Intersection */}
            <div
              onClick={() => setActiveTab('OVERLAPPING')}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                activeTab === 'OVERLAPPING'
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-400 dark:border-emerald-600 ring-2 ring-emerald-400/20'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-emerald-700 dark:text-emerald-300 truncate flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Overlapping (Shared)
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                  {crosswalkAnalysis.overlapping.length}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                Dual-satisfying controls where evidence can be directly reused for both assessments.
              </p>
            </div>

            {/* Right Segment: Unique to Framework B */}
            <div
              onClick={() => setActiveTab('UNIQUE_B')}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                activeTab === 'UNIQUE_B'
                  ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-400 dark:border-indigo-600 ring-2 ring-indigo-400/20'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-indigo-700 dark:text-indigo-300 truncate">
                  Unique to {metaB.shortTitle}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                  {crosswalkAnalysis.uniqueToB.length}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                Controls exclusively demanded by {metaB.shortTitle} requiring separate evidence packages.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 flex flex-col gap-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={`Search control codes (A.5.1, CC6.1), titles, statements, or evidence artifacts...`}
              className="w-full pl-9 pr-16 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Clear
              </button>
            )}
          </div>

          {/* Domain Filter Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={selectedDomain}
              onChange={e => setSelectedDomain(e.target.value)}
              className="px-2.5 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Domains ({availableDomains.length})</option>
              {availableDomains.map(d => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            {activeTab === 'OVERLAPPING' && (
              <select
                value={reusabilityFilter}
                onChange={e => setReusabilityFilter(e.target.value)}
                className="px-2.5 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">All Reusability Types</option>
                <option value="DIRECT_REUSE">Direct Evidence Reuse</option>
                <option value="REQUIRES_ADDITIONAL_METRIC">Requires Additional Metric</option>
                <option value="PARTIAL_SUPPORT">Partial Support</option>
              </select>
            )}
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-2 flex-wrap gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setActiveTab('OVERLAPPING')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'OVERLAPPING'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Overlapping Controls</span>
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === 'OVERLAPPING'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {filteredOverlapping.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('UNIQUE_A')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'UNIQUE_A'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span>Unique to {metaA.shortTitle}</span>
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === 'UNIQUE_A'
                    ? 'bg-sky-700 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {filteredUniqueA.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('UNIQUE_B')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'UNIQUE_B'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span>Unique to {metaB.shortTitle}</span>
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === 'UNIQUE_B'
                    ? 'bg-indigo-700 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {filteredUniqueB.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'ALL'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              All Requirements ({filteredOverlapping.length + filteredUniqueA.length + filteredUniqueB.length})
            </button>
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            Showing <strong className="text-slate-800 dark:text-slate-200">{totalVisibleCount}</strong> control requirements
          </div>
        </div>
      </div>

      {/* Main Requirements List */}
      <div className="p-5 sm:p-6 space-y-4">
        {totalVisibleCount === 0 ? (
          <div className="py-12 text-center text-slate-500 dark:text-slate-400 text-xs">
            <Info className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">
              No control requirements match the active search or filters.
            </p>
            <p className="mt-1">Try clearing your keywords or domain filter.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedDomain('ALL');
                setReusabilityFilter('ALL');
                setActiveTab('ALL');
              }}
              className="mt-3 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg hover:bg-indigo-100"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* OVERLAPPING SECTION */}
            {(activeTab === 'OVERLAPPING' || activeTab === 'ALL') &&
              filteredOverlapping.map(mapping => {
                const isExpanded = expandedMappingId === mapping.id;
                const isLinked = linkedControls[mapping.id];

                return (
                  <div
                    key={mapping.id}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden"
                  >
                    {/* Header Banner */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-850 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          {mapping.mappingType.replace('_', ' ')} ({mapping.confidenceScore}%)
                        </span>

                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {mapping.domain}
                        </span>

                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-900/40">
                          <Zap className="w-3 h-3 text-blue-500" />
                          {mapping.evidenceReusability.replace(/_/g, ' ')}
                        </span>

                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                          +{mapping.auditHourSavingsEstimate}h Saved
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleCopyEvidence(mapping)}
                          title="Copy crosswalk evidence package"
                          className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md transition-colors"
                        >
                          {copiedId === mapping.id ? (
                            <Check className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleLinkToAudit(mapping.id, `${mapping.controlA.code} / ${mapping.controlB.code}`)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                            isLinked
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          {isLinked ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                              <span>Linked to Audit</span>
                            </>
                          ) : (
                            <>
                              <BookmarkPlus className="w-3.5 h-3.5 text-indigo-500" />
                              <span>Link to Audit</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Side-by-Side Dual Requirement Comparison */}
                    <div className="p-4 sm:p-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Control A Box */}
                        <div className="p-3.5 rounded-lg border border-sky-100 dark:border-sky-950/80 bg-sky-50/30 dark:bg-sky-950/10 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between gap-1.5 mb-1.5">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 dark:bg-sky-900/60 text-sky-800 dark:text-sky-300 font-mono">
                                {metaA.shortTitle} • {mapping.controlA.code}
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium">
                                {mapping.controlA.domain}
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug mb-1.5">
                              {mapping.controlA.title}
                            </h4>
                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-2.5">
                              {mapping.controlA.requirementStatement}
                            </p>
                          </div>
                          <div className="pt-2 border-t border-sky-200/50 dark:border-sky-900/40 text-[11px] text-slate-500 dark:text-slate-400">
                            <strong className="text-sky-800 dark:text-sky-300">Auditor Expectation:</strong>{' '}
                            {mapping.controlA.auditExpectation}
                          </div>
                        </div>

                        {/* Control B Box */}
                        <div className="p-3.5 rounded-lg border border-indigo-100 dark:border-indigo-950/80 bg-indigo-50/30 dark:bg-indigo-950/10 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between gap-1.5 mb-1.5">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300 font-mono">
                                {metaB.shortTitle} • {mapping.controlB.code}
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium">
                                {mapping.controlB.domain}
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug mb-1.5">
                              {mapping.controlB.title}
                            </h4>
                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-2.5">
                              {mapping.controlB.requirementStatement}
                            </p>
                          </div>
                          <div className="pt-2 border-t border-indigo-200/50 dark:border-indigo-900/40 text-[11px] text-slate-500 dark:text-slate-400">
                            <strong className="text-indigo-800 dark:text-indigo-300">Auditor Expectation:</strong>{' '}
                            {mapping.controlB.auditExpectation}
                          </div>
                        </div>
                      </div>

                      {/* Harmonization & Synergy Callout */}
                      <div className="mt-3.5 p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 text-xs text-slate-800 dark:text-slate-200 flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <span className="font-semibold text-emerald-900 dark:text-emerald-300 mr-1.5">
                            Audit Synergy & Harmonization Rationale:
                          </span>
                          <span>{mapping.synergyExplanation}</span>
                        </div>
                      </div>

                      {/* Expandable Shared Evidence Artifacts Drawer */}
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                              <FileCheck className="w-3.5 h-3.5 text-indigo-500" />
                              Single Artifact Reuse: Upload Once, Satisfy Both Frameworks
                            </span>
                            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                              100% Shared Evidence Validity
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {mapping.sharedEvidenceArtifacts.map((artifact, idx) => (
                              <div
                                key={idx}
                                className="p-2 rounded bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-start gap-2 text-slate-700 dark:text-slate-300"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                                <span className="leading-snug">{artifact}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Bottom Expand Toggle */}
                      <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                        <div className="text-[11px] text-slate-400">
                          Shared Evidence Artifacts: {mapping.sharedEvidenceArtifacts.length} verified files
                        </div>
                        <button
                          onClick={() => setExpandedMappingId(isExpanded ? null : mapping.id)}
                          className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
                        >
                          <span>{isExpanded ? 'Hide Shared Evidence' : 'View Shared Evidence Artifacts'}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

            {/* UNIQUE TO FRAMEWORK A SECTION */}
            {(activeTab === 'UNIQUE_A' || activeTab === 'ALL') &&
              filteredUniqueA.map(item => (
                <div
                  key={item.id}
                  className="rounded-xl border border-sky-200 dark:border-sky-900/50 bg-gradient-to-br from-white via-white to-sky-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-sky-950/10 shadow-xs hover:shadow-md transition-all duration-200 p-4 sm:p-5"
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/25">
                        <ShieldCheck className="w-3.5 h-3.5 text-sky-500" />
                        Exclusive to {metaA.shortTitle}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                        {item.control.code}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {item.domain}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-500">
                        Bridging Effort:{' '}
                        <strong
                          className={
                            item.effortToAddress === 'HIGH'
                              ? 'text-rose-600 dark:text-rose-400'
                              : item.effortToAddress === 'MEDIUM'
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-emerald-600 dark:text-emerald-400'
                          }
                        >
                          {item.effortToAddress}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 dark:text-white leading-snug mb-1.5">
                    {item.control.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                    {item.control.requirementStatement}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                      <div className="font-semibold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5 text-sky-500" />
                        Why It's Not in {metaB.shortTitle}:
                      </div>
                      <p className="text-slate-600 dark:text-slate-300">{item.whyUnique}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-sky-50/50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900/60">
                      <div className="font-semibold text-sky-900 dark:text-sky-200 mb-1 flex items-center gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                        How to Bridge Gap for Dual Compliance:
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 mb-1.5">{item.complianceGuidance}</p>
                      <div className="text-[11px] text-sky-800 dark:text-sky-300 font-medium">
                        Target Deliverable: <strong>{item.targetDeliverable}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

            {/* UNIQUE TO FRAMEWORK B SECTION */}
            {(activeTab === 'UNIQUE_B' || activeTab === 'ALL') &&
              filteredUniqueB.map(item => (
                <div
                  key={item.id}
                  className="rounded-xl border border-indigo-200 dark:border-indigo-900/50 bg-gradient-to-br from-white via-white to-indigo-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/10 shadow-xs hover:shadow-md transition-all duration-200 p-4 sm:p-5"
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/25">
                        <Award className="w-3.5 h-3.5 text-indigo-500" />
                        Exclusive to {metaB.shortTitle}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                        {item.control.code}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {item.domain}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-500">
                        Bridging Effort:{' '}
                        <strong
                          className={
                            item.effortToAddress === 'HIGH'
                              ? 'text-rose-600 dark:text-rose-400'
                              : item.effortToAddress === 'MEDIUM'
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-emerald-600 dark:text-emerald-400'
                          }
                        >
                          {item.effortToAddress}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 dark:text-white leading-snug mb-1.5">
                    {item.control.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                    {item.control.requirementStatement}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                      <div className="font-semibold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5 text-indigo-500" />
                        Why It's Not in {metaA.shortTitle}:
                      </div>
                      <p className="text-slate-600 dark:text-slate-300">{item.whyUnique}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/60">
                      <div className="font-semibold text-indigo-900 dark:text-indigo-200 mb-1 flex items-center gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        How to Bridge Gap for Dual Compliance:
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 mb-1.5">{item.complianceGuidance}</p>
                      <div className="text-[11px] text-indigo-800 dark:text-indigo-300 font-medium">
                        Target Deliverable: <strong>{item.targetDeliverable}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* AI Gap Analysis Modal / Drawer */}
      {showAiGapModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-slate-900 dark:to-indigo-950/40">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    Executive Dual-Attestation Strategy
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {metaA.shortTitle} vs. {metaB.shortTitle} Crosswalk Synthesis
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAiGapModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 text-slate-800 dark:text-slate-200">
                <div className="font-bold text-indigo-900 dark:text-indigo-300 text-sm mb-1">
                  Executive Briefing & Harmonization Potential ({crosswalkAnalysis.overallSynergyScore}% Overlap)
                </div>
                <p className="leading-relaxed">{crosswalkAnalysis.executiveBriefing}</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-2 text-xs uppercase tracking-wider">
                  Recommended 4-Step Dual-Attestation Roadmap
                </h4>
                <div className="space-y-2.5">
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                      1
                    </span>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">
                        Standardize Core Shared Artifacts First
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                        Build one universal RBAC/MFA policy, unified KMS encryption config, branch protection PR rules, and an annual external pen test report. These 4 artifacts fulfill over 70% of both audits simultaneously.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                      2
                    </span>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">
                        Bridge {metaA.shortTitle} Unique Gaps ({crosswalkAnalysis.uniqueToA.length} Requirements)
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                        Formulate the formal Statement of Applicability (SoA) and schedule the ISO 19011 internal audit program prior to inviting the certification registrar.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                      3
                    </span>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">
                        Bridge {metaB.shortTitle} Unique Gaps ({crosswalkAnalysis.uniqueToB.length} Requirements)
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                        Establish the anonymous whistleblower hotline, map cloud provider CUECs, and formalize board audit committee quarterly cybersecurity reviews.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                      4
                    </span>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">
                        Schedule Joint Evidence Collection Window
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                        Align the 6-to-12 month SOC 2 testing window with your annual ISO 27001 surveillance audit to execute evidence collection once for both external assessors.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Potential audit savings: <strong>{crosswalkAnalysis.estimatedAuditHoursSaved}+ hours</strong>
              </span>
              <button
                onClick={() => setShowAiGapModal(false)}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
              >
                Close Synthesis
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
