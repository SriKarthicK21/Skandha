import React, { useState, useEffect } from 'react';
import { useGRC } from '../../context/GRCContext';
import { WorkspaceLayout, WorkspaceTab, WorkspaceStat } from './WorkspaceLayout';
import {
  Building2,
  Users,
  Workflow,
  FileText,
  Wand2,
  Compass,
  Scale,
  CalendarCheck
} from 'lucide-react';

import {
  OrgScopeModule,
  DepartmentsModule,
  ProcessesModule
} from '../modules/SupportingModules';
import { BusinessDiscovery } from '../modules/BusinessDiscovery';
import { PoliciesModule } from '../modules/PoliciesModule';
import { Clause42StakeholderObligations } from '../governance/Clause42StakeholderObligations';
import { MASAutomatedPolicyGeneratorModule } from '../mas/MASAutomatedPolicyGeneratorModule';
import { ManagementReviewModule } from '../modules/ManagementReviewModule';
import { OrganizationalDiscoveryWorkspace } from '../grc/OrganizationalDiscoveryWorkspace';
import { PolicyGovernanceWorkspace } from '../grc/PolicyGovernanceWorkspace';

interface GovernanceWorkspaceProps {
  initialTab?: string;
}

export const GovernanceWorkspace: React.FC<GovernanceWorkspaceProps> = ({ initialTab }) => {
  const { currentTenant, departmentScopes, generatedDocs } = useGRC();
  const [activeTab, setActiveTab] = useState<string>(initialTab || 'organization');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const tabs: WorkspaceTab[] = [
    { id: 'organization', label: 'Organization & Scope', icon: Building2 },
    { id: 'departments', label: 'Departments & Units', icon: Users, badge: departmentScopes?.length || 0 },
    { id: 'organizational_discovery', label: 'Organizational Discovery', icon: Workflow, badge: 'Phase 13.1' },
    { id: 'policy_governance', label: 'Policy & Document Governance', icon: FileText, badge: 'Phase 14' },
    { id: 'processes', label: 'Business Processes', icon: Workflow },
    { id: 'stakeholder_obligations', label: 'Stakeholder Obligations (Cl. 4.2)', icon: Scale },
    { id: 'policies', label: 'Policies & SOPs', icon: FileText, badge: generatedDocs?.length || 0 },
    { id: 'policy_generator', label: 'AI Policy Generator', icon: Wand2, badge: 'AI' },
    { id: 'management_review', label: 'Management Review', icon: CalendarCheck },
    { id: 'discovery', label: 'Business Discovery', icon: Compass }
  ];

  const stats: WorkspaceStat[] = [
    { label: 'Active Organization', value: currentTenant?.name || 'Default' },
    { label: 'Departments', value: departmentScopes?.length || 8 },
    { label: 'Approved Policies', value: generatedDocs?.length || 14 },
    { label: 'Clause 4.2 Coverage', value: '100%' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'organization':
      case 'org_scope':
        return <OrgScopeModule />;
      case 'departments':
        return <DepartmentsModule />;
      case 'organizational_discovery':
      case 'discovery_workshop':
      case 'process_blueprint':
      case 'documentation_studio':
        return <OrganizationalDiscoveryWorkspace initialTab="overview" />;
      case 'policy_governance':
      case 'document_governance':
      case 'document_register':
      case 'approval_queue':
      case 'acknowledgement_hub':
      case 'implementation_plans':
      case 'review_calendar':
        return <PolicyGovernanceWorkspace initialTab="overview" />;
      case 'processes':
        return <ProcessesModule />;
      case 'stakeholder_obligations':
        return <Clause42StakeholderObligations />;
      case 'policies':
        return <PoliciesModule />;
      case 'policy_generator':
      case 'mas_policy_generator':
        return <MASAutomatedPolicyGeneratorModule />;
      case 'management_review':
        return <ManagementReviewModule />;
      case 'discovery':
      case 'business_discovery':
        return <BusinessDiscovery />;
      default:
        return <OrgScopeModule />;
    }
  };

  return (
    <WorkspaceLayout
      title="Governance & Organization"
      subtitle="Define organizational boundary, business units, stakeholder requirements, documented policies, and governance committees."
      icon={Building2}
      iconColor="text-blue-600 dark:text-blue-400"
      stats={stats}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {renderContent()}
    </WorkspaceLayout>
  );
};
