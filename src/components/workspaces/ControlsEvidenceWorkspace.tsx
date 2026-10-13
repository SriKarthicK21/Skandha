import React, { useState, useEffect } from 'react';
import { useGRC } from '../../context/GRCContext';
import { WorkspaceLayout, WorkspaceTab, WorkspaceStat } from './WorkspaceLayout';
import {
  Library,
  FolderCheck,
  UploadCloud,
  FileCheck2,
  GitFork,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

import { ControlLibraryModule } from '../modules/ControlLibraryModule';
import { EvidenceCentreModule } from '../modules/EvidenceCentreModule';
import { EvidenceUploadModule } from '../modules/EvidenceUploadModule';
import { EvidenceChecklistModule } from '../modules/EvidenceChecklistModule';
import { EnterpriseRealTimeControlGraph } from '../compliance/EnterpriseRealTimeControlGraph';
import { EvidenceIntelligenceFabricWorkspace } from '../compliance/EvidenceIntelligenceFabricWorkspace';

interface ControlsEvidenceWorkspaceProps {
  initialTab?: string;
}

export const ControlsEvidenceWorkspace: React.FC<ControlsEvidenceWorkspaceProps> = ({ initialTab }) => {
  const { controls, evidence } = useGRC();
  const [activeTab, setActiveTab] = useState<string>(initialTab || 'intelligence_fabric');

  useEffect(() => {
    if (initialTab) {
      if (['intelligence_fabric', 'controls', 'evidence', 'upload', 'checklist', 'lineage'].includes(initialTab)) {
        setActiveTab(initialTab);
      } else if (initialTab === 'control_library') {
        setActiveTab('controls');
      } else if (initialTab === 'evidence_centre') {
        setActiveTab('evidence');
      } else if (initialTab === 'evidence_upload') {
        setActiveTab('upload');
      } else if (initialTab === 'evidence_requirements' || initialTab === 'evidence_checklist') {
        setActiveTab('checklist');
      } else if (initialTab === 'entity_lineage_graph' || initialTab === 'control_lineage_graph') {
        setActiveTab('lineage');
      } else {
        setActiveTab(initialTab);
      }
    }
  }, [initialTab]);

  const tabs: WorkspaceTab[] = [
    { id: 'intelligence_fabric', label: 'Evidence Intelligence Fabric', icon: Sparkles, badge: 'WORM' },
    { id: 'controls', label: 'Control Library & Status', icon: Library, badge: controls?.length || 0 },
    { id: 'evidence', label: 'Evidence Centre & Vault', icon: FolderCheck, badge: evidence?.length || 0 },
    { id: 'upload', label: 'Intake & Upload', icon: UploadCloud },
    { id: 'checklist', label: 'Master Evidence Checklist', icon: FileCheck2, badge: 'Dual-Lens' },
    { id: 'lineage', label: 'Real-Time Control Graph', icon: GitFork, badge: 'Telemetry' }
  ];

  const validatedEvidence = (evidence || []).filter(e => e.status === 'Verified').length;
  const pendingEvidence = (evidence || []).filter(e => e.status === 'Pending Review').length;

  const stats: WorkspaceStat[] = [
    { label: 'Active Controls', value: controls?.length || 164 },
    { label: 'Evidence Files', value: evidence?.length || 42 },
    { label: 'AI Validated', value: validatedEvidence || 28 },
    { label: 'Pending Review', value: pendingEvidence || 6 }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'intelligence_fabric':
        return <EvidenceIntelligenceFabricWorkspace />;
      case 'controls':
      case 'control_library':
        return <ControlLibraryModule />;
      case 'evidence':
      case 'evidence_centre':
        return <EvidenceCentreModule />;
      case 'upload':
      case 'evidence_upload':
        return <EvidenceUploadModule />;
      case 'checklist':
      case 'evidence_requirements':
        return <EvidenceChecklistModule />;
      case 'lineage':
      case 'entity_lineage_graph':
        return <EnterpriseRealTimeControlGraph />;
      default:
        return <EvidenceIntelligenceFabricWorkspace />;
    }
  };

  return (
    <WorkspaceLayout
      title="Controls & Evidence Operations"
      subtitle="Operational hub for control implementation and audit-grade verification. Map controls to requirements, collect artifacts, and automate AI validation."
      icon={Library}
      iconColor="text-sky-600 dark:text-sky-400"
      stats={stats}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {renderContent()}
    </WorkspaceLayout>
  );
};
