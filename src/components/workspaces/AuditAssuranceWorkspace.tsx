import React, { useState, useEffect } from 'react';
import { useGRC } from '../../context/GRCContext';
import { WorkspaceLayout, WorkspaceTab, WorkspaceStat } from './WorkspaceLayout';
import {
  ClipboardList,
  AlertOctagon,
  Wrench,
  Lock,
  Award,
  Calculator,
  Fingerprint,
  FileText,
  CheckSquare
} from 'lucide-react';

import { InternalAuditModule } from '../modules/InternalAuditModule';
import { ExternalAuditModule } from '../modules/ExternalAuditModule';
import { AuditorInspectionPortal } from '../audit/AuditorInspectionPortal';
import { DepartmentAuditChecklistHub } from '../audit/DepartmentAuditChecklistHub';
import { FindingsCAPAModule } from '../modules/FindingsCAPAModule';
import { RemediationDeskModule } from '../modules/RemediationDeskModule';
import { StageGatesReadinessVerifier } from '../audit/StageGatesReadinessVerifier';
import { ISO19011SamplingCalculator } from '../audit/ISO19011SamplingCalculator';
import { Auditor3LoDPortal } from '../mas/realtime/Auditor3LoDPortal';
import { AuditReportingModule } from '../modules/AuditReportingModule';
import { ReadinessCertModule } from '../modules/ReadinessCertModule';

interface AuditAssuranceWorkspaceProps {
  initialTab?: string;
}

export const AuditAssuranceWorkspace: React.FC<AuditAssuranceWorkspaceProps> = ({ initialTab }) => {
  const { findings, unifiedRemediations } = useGRC();
  const [activeTab, setActiveTab] = useState<string>(initialTab || 'internal_audit');

  useEffect(() => {
    if (initialTab) {
      if ([
        'internal_audit', 'external_audit', 'inspection_portal', 'dept_checklists',
        'findings', 'remediation', 'stage_gates', 'sampling', 'auditor_3lod', 'reporting', 'readiness_cert'
      ].includes(initialTab)) {
        setActiveTab(initialTab);
      } else if (initialTab === 'findings_capa') {
        setActiveTab('findings');
      } else if (initialTab === 'remediation_desk') {
        setActiveTab('remediation');
      } else if (initialTab === 'auditor_portal') {
        setActiveTab('inspection_portal');
      } else if (initialTab === 'stage_gate_verifier') {
        setActiveTab('stage_gates');
      } else if (initialTab === 'audit_sampling_calculator') {
        setActiveTab('sampling');
      } else if (initialTab === 'audit_reporting') {
        setActiveTab('reporting');
      } else if (initialTab === 'readiness_cert') {
        setActiveTab('readiness_cert');
      } else {
        setActiveTab(initialTab);
      }
    }
  }, [initialTab]);

  const openFindings = (findings || []).filter(f => f.status !== 'Closed Verified');
  const activeRemediations = (unifiedRemediations || []).filter(r => r.status !== 'Closed & Verified');

  const tabs: WorkspaceTab[] = [
    { id: 'internal_audit', label: 'Internal Audit Program', icon: ClipboardList },
    { id: 'inspection_portal', label: 'Auditor Inspection Portal', icon: Lock, badge: 'BSI/TÜV' },
    { id: 'findings', label: 'Findings & Non-Conformities', icon: AlertOctagon, badge: openFindings.length, badgeColor: openFindings.length > 0 ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300' : undefined },
    { id: 'remediation', label: 'Continuous Remediation & CAPA', icon: Wrench, badge: activeRemediations.length },
    { id: 'stage_gates', label: 'Stage 1 vs 2 Gate Verifier', icon: Award, badge: 'Gates' },
    { id: 'sampling', label: 'ISO 19011 Sampling Engine', icon: Calculator },
    { id: 'dept_checklists', label: 'Department Audit Checklists', icon: CheckSquare },
    { id: 'auditor_3lod', label: '3LoD Auditor & Manifest', icon: Fingerprint, badge: 'SHA-256' },
    { id: 'reporting', label: 'Audit Reporting & Archive', icon: FileText },
    { id: 'readiness_cert', label: 'Readiness Attestation', icon: Award }
  ];

  const stats: WorkspaceStat[] = [
    { label: 'Audit Readiness', value: '88.4%' },
    { label: 'Open Non-Conformities', value: openFindings.length },
    { label: 'Active CAPA Items', value: activeRemediations.length },
    { label: '3LoD Manifest', value: 'Verified SHA-256' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'internal_audit':
        return <InternalAuditModule />;
      case 'inspection_portal':
      case 'auditor_portal':
        return <AuditorInspectionPortal />;
      case 'findings':
      case 'findings_capa':
        return <FindingsCAPAModule />;
      case 'remediation':
      case 'remediation_desk':
        return <RemediationDeskModule />;
      case 'stage_gates':
      case 'stage_gate_verifier':
        return <StageGatesReadinessVerifier />;
      case 'sampling':
      case 'audit_sampling_calculator':
        return <ISO19011SamplingCalculator />;
      case 'dept_checklists':
      case 'department_audit_checklists':
        return <DepartmentAuditChecklistHub />;
      case 'auditor_3lod':
      case 'auditor_3lod_portal':
        return <Auditor3LoDPortal />;
      case 'reporting':
      case 'audit_reporting':
        return <AuditReportingModule />;
      case 'readiness_cert':
        return <ReadinessCertModule />;
      case 'external_audit':
        return <ExternalAuditModule />;
      default:
        return <InternalAuditModule />;
    }
  };

  return (
    <WorkspaceLayout
      title="Audit, Assurance & Remediation"
      subtitle="Complete lifecycle for internal and certification audits. Plan programs, track non-conformities, drive root cause CAPA, and verify ISO 19011 sampling."
      icon={ClipboardList}
      iconColor="text-indigo-600 dark:text-indigo-400"
      stats={stats}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {renderContent()}
    </WorkspaceLayout>
  );
};
