import React, { useState, useEffect } from 'react';
import { useGRC } from '../../context/GRCContext';
import { WorkspaceLayout, WorkspaceTab, WorkspaceStat } from './WorkspaceLayout';
import {
  Settings,
  UserCheck,
  Workflow,
  Link2,
  Lock,
  Globe2,
  Sparkles
} from 'lucide-react';

import { SettingsUsersModule } from '../modules/SettingsUsersModule';
import { WorkflowsModule } from '../modules/WorkflowsModule';
import { LiveIntegrationsHubModule } from '../modules/LiveIntegrationsHubModule';
import { AuditTrailModule } from '../modules/AuditTrailModule';
import { SuperAdminPortfolio } from '../modules/SuperAdminPortfolio';
import { EnterpriseSaaSHub } from '../saas/EnterpriseSaaSHub';

interface PlatformSettingsWorkspaceProps {
  initialTab?: string;
}

export const PlatformSettingsWorkspace: React.FC<PlatformSettingsWorkspaceProps> = ({ initialTab }) => {
  const { users, currentRole } = useGRC();
  const [activeTab, setActiveTab] = useState<string>(initialTab || 'users_rbac');

  useEffect(() => {
    if (initialTab) {
      if (['users_rbac', 'workflows', 'integrations', 'audit_trail', 'super_admin'].includes(initialTab)) {
        setActiveTab(initialTab);
      } else if (initialTab === 'settings_users') {
        setActiveTab('users_rbac');
      } else if (initialTab === 'workflows' || initialTab === 'approvals') {
        setActiveTab('workflows');
      } else if (initialTab === 'integrations' || initialTab === 'live_integrations') {
        setActiveTab('integrations');
      } else if (initialTab === 'audit_trail') {
        setActiveTab('audit_trail');
      } else if (initialTab === 'super_admin_portfolio') {
        setActiveTab('super_admin');
      } else {
        setActiveTab(initialTab);
      }
    }
  }, [initialTab]);

  const tabs: WorkspaceTab[] = [
    { id: 'saas_subscription', label: 'Subscription & SaaS Hub', icon: Sparkles, badge: 'Enterprise' },
    { id: 'users_rbac', label: 'Users & Roles (RBAC)', icon: UserCheck, badge: users?.length || 0 },
    { id: 'workflows', label: 'Approval Workflows', icon: Workflow },
    { id: 'integrations', label: 'Integrations & Connectors', icon: Link2, badge: 'Active' },
    { id: 'audit_trail', label: 'WORM Cryptographic Ledger', icon: Lock, badge: 'Immutable' }
  ];

  if (currentRole === 'SUPER_ADMIN') {
    tabs.push({ id: 'super_admin', label: 'Super Admin Console', icon: Globe2, badge: 'Portfolio' });
  }

  const stats: WorkspaceStat[] = [
    { label: 'SaaS Plan Tier', value: 'Apex Global' },
    { label: 'Active Users', value: users?.length || 8 },
    { label: 'Security Role', value: currentRole || 'CISO' },
    { label: 'Cloud Residency', value: 'Singapore (AWS)' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'saas_subscription':
      case 'saas_hub':
      case 'subscription':
      case 'billing':
        return <EnterpriseSaaSHub initialTab="overview" />;
      case 'users_rbac':
      case 'settings_users':
        return <SettingsUsersModule />;
      case 'workflows':
        return <WorkflowsModule />;
      case 'integrations':
        return <LiveIntegrationsHubModule />;
      case 'audit_trail':
        return <AuditTrailModule />;
      case 'super_admin':
      case 'super_admin_portfolio':
        return <SuperAdminPortfolio />;
      default:
        return <EnterpriseSaaSHub initialTab="overview" />;
    }
  };

  return (
    <WorkspaceLayout
      title="Platform Settings & Administration"
      subtitle="Enterprise system configuration, role-based access control, cryptographic audit logging, automated approval workflows, and cloud telemetry connectors."
      icon={Settings}
      iconColor="text-slate-600 dark:text-slate-400"
      stats={stats}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {renderContent()}
    </WorkspaceLayout>
  );
};
