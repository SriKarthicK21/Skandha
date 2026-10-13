import React, { useState, useEffect } from 'react';
import { useGRC } from '../../context/GRCContext';
import { WorkspaceLayout, WorkspaceTab, WorkspaceStat } from './WorkspaceLayout';
import {
  CheckSquare,
  Wrench,
  UploadCloud,
  FileText,
  Clock,
  AlertCircle,
  FolderKanban,
  CheckCircle2
} from 'lucide-react';

import { TasksModule } from '../modules/TasksModule';
import { RemediationDeskModule } from '../modules/RemediationDeskModule';
import { EvidenceUploadModule } from '../modules/EvidenceUploadModule';
import { PoliciesModule } from '../modules/PoliciesModule';

interface MyWorkWorkspaceProps {
  initialTab?: string;
}

export const MyWorkWorkspace: React.FC<MyWorkWorkspaceProps> = ({ initialTab }) => {
  const { tasks, unifiedRemediations, evidence, currentUser } = useGRC();
  const [activeTab, setActiveTab] = useState<string>(initialTab || 'tasks');

  useEffect(() => {
    if (initialTab) {
      if (['tasks', 'remediation', 'evidence', 'policies'].includes(initialTab)) {
        setActiveTab(initialTab);
      } else if (initialTab === 'priority_actions' || initialTab === 'action_items') {
        setActiveTab('tasks');
      } else if (initialTab === 'remediation_queue' || initialTab === 'capa_queue') {
        setActiveTab('remediation');
      } else if (initialTab === 'my_evidence' || initialTab === 'evidence_due') {
        setActiveTab('evidence');
      } else if (initialTab === 'my_policies' || initialTab === 'acknowledgments') {
        setActiveTab('policies');
      } else {
        setActiveTab(initialTab);
      }
    }
  }, [initialTab]);

  const openRemediations = (unifiedRemediations || []).filter(
    (r) => r.status !== 'Closed & Verified'
  );
  const pendingEv = (evidence || []).filter(
    (e) => e.status === 'Pending Review' || e.status === 'Draft'
  );

  const tabs: WorkspaceTab[] = [
    {
      id: 'tasks',
      label: 'Assigned Tasks & Milestones',
      icon: CheckSquare,
      badge: (tasks || []).length || 12
    },
    {
      id: 'remediation',
      label: 'My CAPA & Remediation Queue',
      icon: Wrench,
      badge: openRemediations.length || 5,
      badgeColor: openRemediations.length > 0 ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : undefined
    },
    {
      id: 'evidence',
      label: 'Evidence Intake & Upload Queue',
      icon: UploadCloud,
      badge: pendingEv.length || 3
    },
    {
      id: 'policies',
      label: 'Document Sign-offs & SOPs',
      icon: FileText
    }
  ];

  const stats: WorkspaceStat[] = [
    { label: 'Active Tasks', value: (tasks || []).length || 12 },
    { label: 'Open Remediations', value: openRemediations.length || 5 },
    { label: 'Evidence Due', value: pendingEv.length || 3 },
    { label: 'Assigned Persona', value: currentUser?.name || 'SriKarthiK (CISO)' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'tasks':
      case 'priority_actions':
        return <TasksModule />;
      case 'remediation':
      case 'remediation_queue':
        return <RemediationDeskModule />;
      case 'evidence':
      case 'my_evidence':
        return <EvidenceUploadModule />;
      case 'policies':
      case 'my_policies':
        return <PoliciesModule />;
      default:
        return <TasksModule />;
    }
  };

  return (
    <WorkspaceLayout
      title="My Work & Action Desk"
      subtitle="Your unified execution center: manage assigned compliance tasks, drive open CAPA remediation actions, upload requested audit artifacts, and sign off on organizational SOPs."
      icon={CheckSquare}
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
