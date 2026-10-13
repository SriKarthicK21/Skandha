/**
 * SKANDA Enterprise Framework Factory — Master Workspace
 * Path: src/components/framework-factory/FrameworkFactoryWorkspace.tsx
 */

import React, { useState } from 'react';
import {
  Layers,
  BookOpen,
  ArrowRightLeft,
  Sparkles,
  Scale,
  TrendingUp,
  UploadCloud,
  FileCheck,
  ShieldCheck,
  Activity,
  Award
} from 'lucide-react';
import { useGRC } from '../../context/GRCContext';
import { FrameworkCommandCenterView } from './FrameworkCommandCenterView';
import { FrameworkMarketplaceView } from './FrameworkMarketplaceView';
import { FrameworkDetailView } from './FrameworkDetailView';
import { CrossFrameworkGraphView } from './CrossFrameworkGraphView';
import { ApplicabilityCenterView } from './ApplicabilityCenterView';
import { FrameworkCompareView } from './FrameworkCompareView';
import { FrameworkMigrationView } from './FrameworkMigrationView';
import { FrameworkIngestionView } from './FrameworkIngestionView';
import { AIFrameworkCopilotView } from './AIFrameworkCopilotView';

import {
  MASTER_FRAMEWORK_REGISTRY,
  MASTER_CANONICAL_CONTROLS,
  MASTER_CROSS_FRAMEWORK_MAPPINGS,
  MASTER_FRAMEWORK_BUNDLES,
  MASTER_CHECK_PACKS,
  MASTER_MIGRATION_PLANS,
  MASTER_COMPARISON_MATRICES,
  MASTER_FRAMEWORK_CHANGES
} from '../../data/frameworkMasterCatalogData';

import {
  MASTER_FRAMEWORK_SECTIONS,
  MASTER_FRAMEWORK_REQUIREMENTS
} from '../../data/frameworkRequirementsMasterData';

import { FrameworkFactoryEngine } from '../../../server/services/regulatory/FrameworkFactoryEngine';

interface FrameworkFactoryWorkspaceProps {
  initialTab?: string;
  initialFrameworkCode?: string;
}

export const FrameworkFactoryWorkspace: React.FC<FrameworkFactoryWorkspaceProps> = ({
  initialTab = 'command_center',
  initialFrameworkCode = 'ISO_27001_2022'
}) => {
  const { currentTenant, setActiveModule } = useGRC();
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [selectedFrameworkCode, setSelectedFrameworkCode] = useState<string>(initialFrameworkCode);

  const engine = FrameworkFactoryEngine.getInstance();
  const frameworks = engine.listFrameworks({ tenantId: currentTenant?.id });
  const selectedFramework = engine.getFrameworkByCode(selectedFrameworkCode) || frameworks[0];
  const sections = engine.getFrameworkSections(selectedFramework.frameworkCode);
  const requirements = engine.getFrameworkRequirements(selectedFramework.frameworkCode);
  const controls = engine.getCanonicalControls();
  const mappings = engine.getCrossFrameworkMappings();
  const bundles = engine.getBundles();
  const migrationPlans = engine.getMigrationPlans();
  const comparisonMatrices = MASTER_COMPARISON_MATRICES;
  const changes = engine.getRecentChanges();
  const ingestionJobs = engine.listIngestionJobs();
  const reuseMetrics = engine.calculateReuseMetrics(currentTenant?.id || 'tenant-01', [
    'ISO_27001_2022',
    'SOC2_TYPE2_TSC',
    'PCI_DSS_V4_0_1',
    'MAS_TRM_2021',
    'INDIA_DPDP_2023',
    'EU_DORA'
  ]);

  const navTabs = [
    { id: 'command_center', label: 'Command Center', icon: Activity },
    { id: 'marketplace', label: 'Framework Marketplace', icon: BookOpen },
    { id: 'detail', label: 'Framework Detail 360°', icon: FileCheck },
    { id: 'crosswalk', label: 'Cross-Framework Graph', icon: ArrowRightLeft },
    { id: 'applicability', label: 'Applicability Discovery', icon: Sparkles },
    { id: 'compare', label: 'Framework Compare', icon: Scale },
    { id: 'migration', label: 'Version Migration', icon: TrendingUp },
    { id: 'ingestion', label: 'Ingestion Factory', icon: UploadCloud },
    { id: 'copilot', label: 'AI Copilot', icon: Sparkles }
  ];

  const handleSelectFramework = (frameworkCode: string) => {
    setSelectedFrameworkCode(frameworkCode);
    setActiveTab('detail');
  };

  const handleNavigateTab = (tab: string, param?: string) => {
    if (tab === 'detail' && param) {
      setSelectedFrameworkCode(param);
    }
    setActiveTab(tab);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6">
      {/* Top Workspace Header & Navigation Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-cyan-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/25">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              SKANDA Framework Factory
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                PROD HARDENED
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Enterprise Governance, Risk, Compliance, Regulatory Intelligence & Continuous Assurance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          {navTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Workspace Body */}
      {activeTab === 'command_center' && (
        <FrameworkCommandCenterView
          frameworks={frameworks}
          changes={changes}
          reuseMetrics={reuseMetrics}
          onNavigateTab={handleNavigateTab}
          onSelectFramework={handleSelectFramework}
        />
      )}

      {activeTab === 'marketplace' && (
        <FrameworkMarketplaceView
          frameworks={frameworks}
          onSelectFramework={handleSelectFramework}
          onNavigateTab={handleNavigateTab}
        />
      )}

      {activeTab === 'detail' && (
        <FrameworkDetailView
          framework={selectedFramework}
          sections={sections}
          requirements={requirements}
          controls={controls.filter(c => c.supportedFrameworks.includes(selectedFramework.frameworkCode))}
          mappings={mappings.filter(m => m.sourceFrameworkId.includes(selectedFramework.frameworkCode) || m.targetFrameworkId.includes(selectedFramework.frameworkCode))}
          changes={changes.filter(c => c.frameworkCode === selectedFramework.frameworkCode)}
          onBack={() => setActiveTab('marketplace')}
          onNavigateTab={handleNavigateTab}
        />
      )}

      {activeTab === 'crosswalk' && (
        <CrossFrameworkGraphView
          frameworks={frameworks}
          controls={controls}
          mappings={mappings}
          onSelectControl={ctrlId => console.log('Selected control:', ctrlId)}
        />
      )}

      {activeTab === 'applicability' && (
        <ApplicabilityCenterView
          bundles={bundles}
          onEvaluateApplicability={profile => engine.evaluateApplicability(profile)}
          onSelectFramework={handleSelectFramework}
          onNavigateTab={handleNavigateTab}
        />
      )}

      {activeTab === 'compare' && (
        <FrameworkCompareView
          frameworks={frameworks}
          comparisonMatrices={comparisonMatrices}
          onSelectFramework={handleSelectFramework}
        />
      )}

      {activeTab === 'migration' && (
        <FrameworkMigrationView
          migrationPlans={migrationPlans}
        />
      )}

      {activeTab === 'ingestion' && (
        <FrameworkIngestionView
          jobs={ingestionJobs}
          onSubmitJob={job => engine.submitIngestionJob(job)}
        />
      )}

      {activeTab === 'copilot' && (
        <AIFrameworkCopilotView
          onQueryCopilot={q => engine.queryCopilot(q)}
          onSelectFramework={handleSelectFramework}
        />
      )}
    </div>
  );
};
