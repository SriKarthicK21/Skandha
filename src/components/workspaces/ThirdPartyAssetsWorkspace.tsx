import React, { useState, useEffect } from 'react';
import { useGRC } from '../../context/GRCContext';
import { WorkspaceLayout, WorkspaceTab, WorkspaceStat } from './WorkspaceLayout';
import {
  Truck,
  Server,
  Database,
  Layers,
  ShieldAlert,
  HardDrive
} from 'lucide-react';

import { VendorsModule } from '../modules/VendorsModule';
import { AssetsModule } from '../modules/AssetsModule';
import { MASCriticalSystemsRegister } from '../mas/MASCriticalSystemsRegister';
import { DataInfoModule } from '../modules/DataInfoModule';

interface ThirdPartyAssetsWorkspaceProps {
  initialTab?: string;
}

export const ThirdPartyAssetsWorkspace: React.FC<ThirdPartyAssetsWorkspaceProps> = ({ initialTab }) => {
  const { vendors, assets } = useGRC();
  const [activeTab, setActiveTab] = useState<string>(initialTab || 'vendors');

  useEffect(() => {
    if (initialTab) {
      if (['vendors', 'assets', 'critical_systems', 'data_privacy'].includes(initialTab)) {
        setActiveTab(initialTab);
      } else if (initialTab === 'data_information' || initialTab === 'data_info') {
        setActiveTab('data_privacy');
      } else if (initialTab === 'mas_critical_systems') {
        setActiveTab('critical_systems');
      } else {
        setActiveTab(initialTab);
      }
    }
  }, [initialTab]);

  const tabs: WorkspaceTab[] = [
    { id: 'vendors', label: 'Vendor Directory & TPRM', icon: Truck, badge: vendors?.length || 0 },
    { id: 'assets', label: 'Assets & CMDB', icon: Server, badge: assets?.length || 0 },
    { id: 'critical_systems', label: 'Critical Systems (RTO ≤ 4h)', icon: Layers, badge: 'High Avail' },
    { id: 'data_privacy', label: 'Data Classification & Flow', icon: Database }
  ];

  const highCriticalityVendors = (vendors || []).filter(v => v.criticality === 'Critical' || v.criticality === 'Major').length;
  const criticalAssets = (assets || []).filter(a => a.criticality === 'Critical' || a.criticality === 'High').length;

  const stats: WorkspaceStat[] = [
    { label: 'Active Vendors', value: vendors?.length || 18 },
    { label: 'Tier-1 Critical Vendors', value: highCriticalityVendors || 4 },
    { label: 'CMDB Managed Assets', value: assets?.length || 64 },
    { label: 'Critical Systems RTO', value: '< 4h SLA' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'vendors':
        return <VendorsModule />;
      case 'assets':
        return <AssetsModule />;
      case 'critical_systems':
      case 'mas_critical_systems':
        return <MASCriticalSystemsRegister />;
      case 'data_privacy':
      case 'data_information':
        return <DataInfoModule />;
      default:
        return <VendorsModule />;
    }
  };

  return (
    <WorkspaceLayout
      title="Assets & Third Parties"
      subtitle="Unified directory of enterprise hardware, cloud assets, critical financial infrastructure systems, suppliers, and third-party vendors."
      icon={Truck}
      iconColor="text-teal-600 dark:text-teal-400"
      stats={stats}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {renderContent()}
    </WorkspaceLayout>
  );
};

export { ThirdPartyAssetsWorkspace as AssetsThirdPartiesWorkspace };

