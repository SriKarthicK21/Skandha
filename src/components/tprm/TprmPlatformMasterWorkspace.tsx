/**
 * SKANDA ENTERPRISE TPRM PLATFORM MASTER WORKSPACE
 * Path: src/components/tprm/TprmPlatformMasterWorkspace.tsx
 * 
 * Top-level workspace orchestrator connecting:
 * - Executive Command Center
 * - Vendor 360 Workspace
 * - Risk-Based Due Diligence & Dynamic Questionnaires
 * - Continuous Telemetry & Attack Surface Monitoring
 * - Fourth-Party Dependency Graph & Concentration Blast Radius
 * - Contracts, SLAs & DPA Repository
 * - Closed-Loop Findings & CAPA Retesting
 * - 14-Factor Risk Methodology Studio
 */

import React from 'react';
import {
  LayoutDashboard,
  Building,
  ClipboardCheck,
  Activity,
  Network,
  FileCheck2,
  ShieldAlert,
  Sliders,
  Layers,
  Sparkles,
  Truck
} from 'lucide-react';
import { useTprmStore } from '../../stores/useTprmStore';
import { useGRC } from '../../context/GRCContext';
import { PageContainer } from '../layout/PageContainer';
import { TprmCommandCenter } from './TprmCommandCenter';
import { Vendor360Workspace } from './Vendor360Workspace';
import { VendorDueDiligenceWorkspace } from './VendorDueDiligenceWorkspace';
import { ContinuousMonitoringWorkspace } from './ContinuousMonitoringWorkspace';
import { FourthPartyGraphWorkspace } from './FourthPartyGraphWorkspace';
import { ContractObligationWorkspace } from './ContractObligationWorkspace';
import { VendorFindingsCapaWorkspace } from './VendorFindingsCapaWorkspace';
import { TprmMethodologyStudio } from './TprmMethodologyStudio';

export const TprmPlatformMasterWorkspace: React.FC = () => {
  const { theme } = useGRC();
  const { activeTab, setActiveTab, vendors, metrics } = useTprmStore();

  const isLight = theme === 'light';

  const renderTabContent = () => {
    switch (activeTab) {
      case 'command_center':
        return <TprmCommandCenter />;
      case 'vendor_360':
        return <Vendor360Workspace />;
      case 'assessments':
        return <VendorDueDiligenceWorkspace />;
      case 'monitoring':
        return <ContinuousMonitoringWorkspace />;
      case 'fourth_party':
        return <FourthPartyGraphWorkspace />;
      case 'contracts':
        return <ContractObligationWorkspace />;
      case 'findings':
        return <VendorFindingsCapaWorkspace />;
      case 'methodology':
        return <TprmMethodologyStudio />;
      default:
        return <TprmCommandCenter />;
    }
  };

  const navItems = [
    { id: 'command_center', label: 'Executive Command Center', icon: LayoutDashboard },
    { id: 'vendor_360', label: 'Vendor 360 & Directory', icon: Building, badge: vendors.length },
    { id: 'assessments', label: 'Due Diligence & Questionnaires', icon: ClipboardCheck },
    { id: 'monitoring', label: 'Continuous Telemetry & Signals', icon: Activity },
    { id: 'fourth_party', label: '4th-Party Concentration Graph', icon: Network },
    { id: 'contracts', label: 'Contracts, SLAs & DPAs', icon: FileCheck2 },
    { id: 'findings', label: 'Findings & CAPA Retesting', icon: ShieldAlert, badge: metrics.openFindingsCount > 0 ? metrics.openFindingsCount : undefined, badgeColor: 'bg-rose-500 text-white' },
    { id: 'methodology', label: '14-Factor Methodology Studio', icon: Sliders }
  ];

  return (
    <PageContainer id="tprm-platform-workspace">
      {/* Top Workspace Tab Bar */}
      <div
        className={`flex items-center space-x-1.5 border-b overflow-x-auto pb-1 mb-6 ${
          isLight ? 'border-slate-200' : 'border-slate-800'
        }`}
      >
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition border-b-2 flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'border-sky-500 text-sky-400 bg-sky-500/10 shadow-xs'
                  : isLight
                  ? 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
              {item.badge !== undefined && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    item.badgeColor || (isLight ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-300')
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Render Active Tab Component */}
      {renderTabContent()}
    </PageContainer>
  );
};

export default TprmPlatformMasterWorkspace;
