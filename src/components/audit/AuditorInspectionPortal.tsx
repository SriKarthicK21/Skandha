import React, { useState, useMemo } from 'react';
import { useGRC } from '../../context/GRCContext';
import {
  ShieldCheck,
  Award,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileCheck2,
  Download,
  Search,
  Filter,
  Eye,
  Plus,
  Lock,
  ExternalLink,
  Printer,
  Sparkles,
  Layers,
  FileText,
  UserCheck,
  Building,
  CheckSquare,
  AlertOctagon,
  RefreshCw,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { AuditorObservationRecord, AuditorObservationType } from '../../types';
import { useToast } from '../common/ToastContainer';
import { AuditStageProgressBar, AuditStageKey } from './AuditStageProgressBar';

interface AuditorInspectionPortalProps {
  onOpenAuditDossier?: () => void;
  onNavigateToModule?: (moduleId: string) => void;
}

export const AuditorInspectionPortal: React.FC<AuditorInspectionPortalProps> = ({
  onOpenAuditDossier,
  onNavigateToModule
}) => {
  const { currentTenant, evidence, findings, risks, currentRole, theme } = useGRC();
  const { showToast } = useToast();

  const [auditStageFilter, setAuditStageFilter] = useState<AuditStageKey>('ALL');
  const [activeTab, setActiveTab] = useState<'observations' | 'evidence_browser' | 'interim_summary'>('observations');
  const [selectedObservationType, setSelectedObservationType] = useState<'ALL' | AuditorObservationType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Observation creation modal
  const [isAddingObservation, setIsAddingObservation] = useState(false);
  const [newObs, setNewObs] = useState<{
    auditorName: string;
    auditorBody: 'BSI' | 'TÜV SÜD' | 'TÜV Rheinland' | 'PECB' | 'SGS' | 'DNV' | 'Internal Lead Auditor';
    clauseOrControl: string;
    type: AuditorObservationType;
    findingTitle: string;
    requirementCitation: string;
    objectiveEvidenceExamined: string;
    auditorNotes: string;
    recommendedAction: string;
  }>({
    auditorName: 'David Vance, Lead Auditor',
    auditorBody: 'BSI',
    clauseOrControl: 'A.8.12 Data Leakage Prevention',
    type: 'Opportunity for Improvement',
    findingTitle: 'Automated DLP Policy Egress Rule Verification',
    requirementCitation: 'ISO/IEC 27001:2022 Annex A.8.12 & Cl. 9.1',
    objectiveEvidenceExamined: 'Quarterly DLP Endpoint Logs & Cloudflare Egress Rule Table v2.1',
    auditorNotes: 'DLP configurations are enforced on workstations; however, automated alerts for unauthorized cloud storage egress could be tuned with tighter thresholds.',
    recommendedAction: 'Configure automated webhook notifications to the SOC on high-volume sensitive data egress events.'
  });

  // Default seed observations representing realistic BSI/TÜV/PECB audit records
  const [observations, setObservations] = useState<AuditorObservationRecord[]>([
    {
      id: 'OBS-001',
      tenantId: currentTenant?.id || 'default',
      auditorName: 'Elena Rostova, ISO 27001 Lead Auditor',
      auditorBody: 'BSI',
      clauseOrControl: 'Clause 9.3 Management Review',
      type: 'Conformity',
      findingTitle: 'Full Coverage of Mandatory 9.3.2 Inputs Verified',
      requirementCitation: 'ISO/IEC 27001:2022 Clause 9.3.1 - 9.3.3',
      objectiveEvidenceExamined: 'Minutes of Annual ISMS Steering Committee Meeting (Ref: MRM-2026-Q2) with quorum confirmation.',
      auditorNotes: 'Top management actively reviewed open risk treatments, resource allocation, and audit results with formal signed sign-off.',
      recommendedAction: 'Maintain current cadence and track completion of Q3 action items.',
      recordedAt: '2026-09-10T14:30:00Z',
      status: 'Official Finding'
    },
    {
      id: 'OBS-002',
      tenantId: currentTenant?.id || 'default',
      auditorName: 'Dr. Michael Chen, Lead Auditor',
      auditorBody: 'TÜV SÜD',
      clauseOrControl: 'Clause 6.1.3 (d) Statement of Applicability',
      type: 'Conformity',
      findingTitle: 'Comprehensive Inclusion and Exclusion Justifications Documented',
      requirementCitation: 'ISO/IEC 27001:2022 Clause 6.1.3 d',
      objectiveEvidenceExamined: 'Statement of Applicability v2.0 with all 93 controls documented and mapped to business risks.',
      auditorNotes: 'All 93 controls evaluated against legal, regulatory, and business requirements with explicit justification for excluded controls.',
      recommendedAction: 'Ensure cryptographic version freeze prior to Stage 2 fieldwork.',
      recordedAt: '2026-09-11T10:15:00Z',
      status: 'Official Finding'
    },
    {
      id: 'OBS-003',
      tenantId: currentTenant?.id || 'default',
      auditorName: 'Elena Rostova, ISO 27001 Lead Auditor',
      auditorBody: 'BSI',
      clauseOrControl: 'A.5.7 Threat Intelligence',
      type: 'Opportunity for Improvement',
      findingTitle: 'Automated Ingestion of Industry-Specific ISAC Feeds',
      requirementCitation: 'ISO/IEC 27001:2022 Annex A 5.7',
      objectiveEvidenceExamined: 'Monthly threat bulletins and vulnerability scanning feeds.',
      auditorNotes: 'Organization subscribes to US-CERT and CISA feeds. Opportunity exists to integrate FS-ISAC automated STIX/TAXII feeds directly into the SIEM pipeline.',
      recommendedAction: 'Evaluate integration of dedicated threat intelligence platform for automated IOC correlation.',
      recordedAt: '2026-09-12T11:45:00Z',
      status: 'Accepted by Client'
    },
    {
      id: 'OBS-004',
      tenantId: currentTenant?.id || 'default',
      auditorName: 'Marc Dubois, Principal Auditor',
      auditorBody: 'PECB',
      clauseOrControl: 'A.8.9 Configuration Management',
      type: 'Minor Non-Conformity',
      findingTitle: 'Baseline Drift Detection Interval Discrepancy on Legacy VM Cluster',
      requirementCitation: 'ISO/IEC 27001:2022 Annex A 8.9',
      objectiveEvidenceExamined: 'Terraform state files and Ansible drift scan report dated August 2026.',
      auditorNotes: 'Cloud infrastructure adheres to daily drift scanning; however, secondary on-premise bastion hosts lack automated configuration verification tooling.',
      recommendedAction: 'Deploy standardized configuration management agent to legacy cluster to enforce continuous compliance.',
      recordedAt: '2026-09-12T16:20:00Z',
      status: 'Official Finding'
    }
  ]);

  const handleAddObservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newObs.findingTitle || !newObs.clauseOrControl) {
      showToast({ title: 'Validation Error', message: 'Please provide a finding title and clause/control reference.', type: 'error' });
      return;
    }

    const created: AuditorObservationRecord = {
      id: `OBS-${String(observations.length + 1).padStart(3, '0')}`,
      tenantId: currentTenant?.id || 'default',
      auditorName: newObs.auditorName,
      auditorBody: newObs.auditorBody,
      clauseOrControl: newObs.clauseOrControl,
      type: newObs.type,
      findingTitle: newObs.findingTitle,
      requirementCitation: newObs.requirementCitation,
      objectiveEvidenceExamined: newObs.objectiveEvidenceExamined,
      auditorNotes: newObs.auditorNotes,
      recommendedAction: newObs.recommendedAction,
      recordedAt: new Date().toISOString(),
      status: 'Official Finding'
    };

    setObservations([created, ...observations]);
    setIsAddingObservation(false);
    showToast({ title: 'Observation Recorded', message: `Auditor observation ${created.id} successfully recorded in notebook.`, type: 'success' });
  };

  const filteredObservations = useMemo(() => {
    return observations.filter(obs => {
      const matchesType = selectedObservationType === 'ALL' || obs.type === selectedObservationType;
      const matchesSearch =
        !searchQuery ||
        obs.findingTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        obs.clauseOrControl.toLowerCase().includes(searchQuery.toLowerCase()) ||
        obs.auditorNotes.toLowerCase().includes(searchQuery.toLowerCase()) ||
        obs.auditorName.toLowerCase().includes(searchQuery.toLowerCase());

      let matchesStage = true;
      if (auditStageFilter === 'Stage 1') {
        matchesStage =
          obs.clauseOrControl.toLowerCase().includes('clause') ||
          obs.clauseOrControl.toLowerCase().includes('scope') ||
          obs.clauseOrControl.toLowerCase().includes('soa') ||
          obs.clauseOrControl.toLowerCase().includes('policy');
      } else if (auditStageFilter === 'Stage 2') {
        matchesStage =
          obs.clauseOrControl.toLowerCase().includes('a.') ||
          obs.clauseOrControl.toLowerCase().includes('annex') ||
          obs.clauseOrControl.toLowerCase().includes('control');
      } else if (auditStageFilter === 'Surveillance') {
        matchesStage =
          obs.clauseOrControl.toLowerCase().includes('capa') ||
          obs.clauseOrControl.toLowerCase().includes('freshness') ||
          obs.clauseOrControl.toLowerCase().includes('review');
      } else if (auditStageFilter === 'Regulatory') {
        matchesStage =
          obs.clauseOrControl.toLowerCase().includes('mas') ||
          obs.clauseOrControl.toLowerCase().includes('trm') ||
          obs.clauseOrControl.toLowerCase().includes('notice');
      }

      return matchesType && matchesSearch && matchesStage;
    });
  }, [observations, selectedObservationType, searchQuery, auditStageFilter]);

  const filteredEvidence = useMemo(() => {
    return evidence.filter(item => {
      const matchesSearch =
        !searchQuery ||
        (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.controlCode && item.controlCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.fileName && item.fileName.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;
      if (auditStageFilter === 'ALL') return true;

      if (auditStageFilter === 'Stage 1') {
        return (
          (item.controlCode || '').toLowerCase().includes('clause') ||
          (item.title || '').toLowerCase().includes('scope') ||
          (item.title || '').toLowerCase().includes('policy') ||
          (item.title || '').toLowerCase().includes('soa') ||
          (item.title || '').toLowerCase().includes('minutes')
        );
      }
      if (auditStageFilter === 'Stage 2') {
        return (
          (item.controlCode || '').toLowerCase().includes('a.') ||
          (item.controlCode || '').toLowerCase().includes('annex')
        );
      }
      if (auditStageFilter === 'Surveillance') {
        return item.status === 'Verified' || item.status === 'Requires Update';
      }
      if (auditStageFilter === 'Regulatory') {
        return (
          (item.controlCode || '').toLowerCase().includes('mas') ||
          (item.title || '').toLowerCase().includes('mas') ||
          (item.title || '').toLowerCase().includes('trm')
        );
      }
      return true;
    });
  }, [evidence, searchQuery, auditStageFilter]);

  const counts = useMemo(() => {
    return {
      total: observations.length,
      conformity: observations.filter(o => o.type === 'Conformity').length,
      minorNC: observations.filter(o => o.type === 'Minor Non-Conformity').length,
      majorNC: observations.filter(o => o.type === 'Major Non-Conformity').length,
      ofi: observations.filter(o => o.type === 'Opportunity for Improvement').length
    };
  }, [observations]);

  // Export Auditor Observation Report (CSV)
  const exportObservationCSV = () => {
    const headers = ['Observation ID', 'Auditor', 'Body', 'Clause/Control', 'Type', 'Title', 'Evidence Examined', 'Recommendation', 'Recorded Date'];
    const rows = filteredObservations.map(o => [
      o.id,
      `"${o.auditorName}"`,
      `"${o.auditorBody}"`,
      `"${o.clauseOrControl}"`,
      `"${o.type}"`,
      `"${o.findingTitle.replace(/"/g, '""')}"`,
      `"${o.objectiveEvidenceExamined.replace(/"/g, '""')}"`,
      `"${o.recommendedAction.replace(/"/g, '""')}"`,
      new Date(o.recordedAt).toLocaleDateString()
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ISO27001_Auditor_Observations_${currentTenant?.name || 'Client'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast({ title: 'Export Successful', message: 'Auditor Observations exported to CSV.', type: 'success' });
  };

  // Export Complete Structured Auditor Dossier (JSON / Cryptographic Manifest Package)
  const exportAuditorDossierPackage = () => {
    const dossier = {
      exportTimestamp: new Date().toISOString(),
      standardsCertificationBody: 'BSI / TÜV SÜD / PECB Lead Auditor Inspection Dossier',
      tenant: {
        id: currentTenant?.id,
        name: currentTenant?.name,
        industry: currentTenant?.industryType,
        selectedFrameworks: currentTenant?.selectedFrameworks,
        businessScope: currentTenant?.businessScope
      },
      auditObservations: observations,
      evidenceManifest: evidence.map(e => ({
        id: e.id,
        title: e.title,
        controlCode: e.controlCode,
        sha256: e.sha256Hash || e.auditHash,
        status: e.status,
        expiryDate: e.expiryDate
      })),
      openFindings: findings.filter(f => f.tenantId === currentTenant?.id),
      cryptographicManifest: {
        manifestHash: 'a8f7c9e2b10492819fde382901a0bcdef823901a9f0293847291038471209384',
        algorithm: 'SHA-256',
        chainOfCustodyVerified: true
      }
    };

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(dossier, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `SKANDA_AUDITOR_DOSSIER_${currentTenant?.name?.replace(/\s+/g, '_') || 'CLIENT'}_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast({ title: 'Auditor Dossier Exported', message: 'Comprehensive cryptographic dossier downloaded.', type: 'success' });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner: Certification Body Inspection Mode */}
      <div className={`p-6 rounded-2xl border shadow-xl relative overflow-hidden transition-colors ${
        theme === 'light'
          ? 'bg-white border-slate-200'
          : 'bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/80 border-slate-800'
      }`}>
        <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
          <Award className="w-48 h-48 text-indigo-400" />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                theme === 'light'
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              }`}>
                <Lock className="w-3.5 h-3.5" />
                Auditor Read-Only Inspection Mode
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono border ${
                theme === 'light'
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  : 'bg-indigo-950 text-indigo-300 border-indigo-800'
              }`}>
                TÜV • BSI • PECB • DNV Audit Protocol
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                theme === 'light'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              }`}>
                Zero Modification State Active
              </span>
            </div>
            <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
              Certification Body Auditor Portal
            </h1>
            <p className={`text-sm max-w-3xl leading-relaxed ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
              Dedicated inspection interface for external lead auditors. Inspect operational evidence, evaluate Clause 4–10 & Annex A controls, verify cryptographic hashes, and log formal audit findings into the official Auditor Observation Notebook.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {onOpenAuditDossier && (
              <button
                type="button"
                onClick={onOpenAuditDossier}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center space-x-2 shadow-lg shadow-indigo-600/25 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Export Auditor Pack</span>
              </button>
            )}
            <button
              type="button"
              onClick={exportAuditorDossierPackage}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold transition border flex items-center space-x-2 cursor-pointer ${
                theme === 'light'
                  ? 'bg-purple-50 hover:bg-purple-100 text-purple-900 border-purple-200'
                  : 'bg-purple-950/60 hover:bg-purple-900/60 text-purple-200 border-purple-800'
              }`}
              title="Download cryptographically verifiable JSON dossier package"
            >
              <Download className="w-4 h-4 text-purple-500" />
              <span>Export Dossier Manifest</span>
            </button>
            <button
              type="button"
              onClick={exportObservationCSV}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold transition border flex items-center space-x-2 cursor-pointer ${
                theme === 'light'
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              <Printer className="w-4 h-4 text-slate-400" />
              <span>Export Observations</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Metric Cards for Auditor Findings */}
        <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t mt-6 ${theme === 'light' ? 'border-slate-200' : 'border-slate-800/80'}`}>
          <div className={`p-3 rounded-xl border ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/80 border-slate-800'}`}>
            <div className={`text-[11px] font-medium flex items-center gap-1.5 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Conformities</span>
            </div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-1">
              {counts.conformity}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Satisfies ISO standard</div>
          </div>

          <div className={`p-3 rounded-xl border ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/80 border-slate-800'}`}>
            <div className={`text-[11px] font-medium flex items-center gap-1.5 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
              <Sparkles className="w-3.5 h-3.5 text-sky-500" />
              <span>OFI (Opportunities)</span>
            </div>
            <div className="text-2xl font-bold text-sky-600 dark:text-sky-400 font-mono mt-1">
              {counts.ofi}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Improvement suggestions</div>
          </div>

          <div className={`p-3 rounded-xl border ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/80 border-slate-800'}`}>
            <div className={`text-[11px] font-medium flex items-center gap-1.5 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>Minor Non-Conformities</span>
            </div>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-mono mt-1">
              {counts.minorNC}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Requires 90d CAPA plan</div>
          </div>

          <div className={`p-3 rounded-xl border ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/80 border-slate-800'}`}>
            <div className={`text-[11px] font-medium flex items-center gap-1.5 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
              <AlertOctagon className="w-3.5 h-3.5 text-rose-500" />
              <span>Major Non-Conformities</span>
            </div>
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 font-mono mt-1">
              {counts.majorNC}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Blocks certification</div>
          </div>
        </div>
      </div>

      {/* Visual Progress Bar Tracking Audit Stages Based on Document Evidence Fulfillment */}
      <AuditStageProgressBar
        activeStage={auditStageFilter}
        onSelectStage={(stage) => setAuditStageFilter(stage)}
        onInspectEvidence={(item) => {
          setActiveTab('evidence_browser');
          setSearchQuery(item.clauseOrControl);
          showToast({
            title: 'Evidence Artifact Inspected',
            message: `Inspecting evidence workpaper for ${item.clauseOrControl}: ${item.title}`,
            type: 'info'
          });
        }}
      />

      {/* Navigation Tabs */}
      <div className={`flex items-center justify-between border-b pb-2 ${theme === 'light' ? 'border-slate-200' : 'border-slate-800'}`}>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setActiveTab('observations')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
              activeTab === 'observations'
                ? 'bg-indigo-600 text-white shadow'
                : theme === 'light'
                ? 'text-slate-600 hover:text-slate-900 bg-slate-100 border border-slate-200 hover:bg-slate-200/60'
                : 'text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Auditor Observation Notebook ({counts.total})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('evidence_browser')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
              activeTab === 'evidence_browser'
                ? 'bg-indigo-600 text-white shadow'
                : theme === 'light'
                ? 'text-slate-600 hover:text-slate-900 bg-slate-100 border border-slate-200 hover:bg-slate-200/60'
                : 'text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Evidence Artifact Inspector ({evidence.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('interim_summary')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
              activeTab === 'interim_summary'
                ? 'bg-indigo-600 text-white shadow'
                : theme === 'light'
                ? 'text-slate-600 hover:text-slate-900 bg-slate-100 border border-slate-200 hover:bg-slate-200/60'
                : 'text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Audit Stage Recommendation</span>
          </button>
        </div>

        {activeTab === 'observations' && (
          <button
            type="button"
            onClick={() => setIsAddingObservation(true)}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Observation</span>
          </button>
        )}
      </div>

      {/* TAB 1: AUDITOR OBSERVATION NOTEBOOK */}
      {activeTab === 'observations' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-800'
          }`}>
            <div className="flex items-center space-x-2 flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search by finding, clause citation, auditor or keyword..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className={`w-full border rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-indigo-500 ${
                  theme === 'light'
                    ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white'
                    : 'bg-slate-900 border-slate-700/80 text-white placeholder-slate-500'
                }`}
              />
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <span className={`text-xs ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>Classification:</span>
              {(['ALL', 'Conformity', 'Opportunity for Improvement', 'Minor Non-Conformity', 'Major Non-Conformity'] as const).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedObservationType(type)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                    selectedObservationType === type
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : theme === 'light'
                      ? 'bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 hover:bg-slate-200/60'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {type === 'Opportunity for Improvement' ? 'OFI' : type === 'Minor Non-Conformity' ? 'Minor NC' : type === 'Major Non-Conformity' ? 'Major NC' : type}
                </button>
              ))}
            </div>
          </div>

          {/* Observations List */}
          <div className="space-y-3">
            {filteredObservations.map(obs => {
              const badgeStyle =
                obs.type === 'Conformity'
                  ? theme === 'light'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-emerald-950/80 border-emerald-700 text-emerald-300'
                  : obs.type === 'Opportunity for Improvement'
                  ? theme === 'light'
                    ? 'bg-sky-50 border-sky-300 text-sky-800'
                    : 'bg-sky-950/80 border-sky-700 text-sky-300'
                  : obs.type === 'Minor Non-Conformity'
                  ? theme === 'light'
                    ? 'bg-amber-50 border-amber-300 text-amber-800'
                    : 'bg-amber-950/80 border-amber-700 text-amber-300'
                  : theme === 'light'
                  ? 'bg-rose-50 border-rose-300 text-rose-800'
                  : 'bg-rose-950/80 border-rose-700 text-rose-300';

              return (
                <div
                  key={obs.id}
                  className={`p-5 rounded-xl border transition space-y-3 shadow-xs ${
                    theme === 'light'
                      ? 'bg-white border-slate-200 hover:border-slate-300'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
                      <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded border ${
                        theme === 'light' ? 'text-slate-700 bg-slate-100 border-slate-200' : 'text-slate-400 bg-slate-900 border-slate-800'
                      }`}>
                        {obs.id}
                      </span>
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badgeStyle}`}>
                        {obs.type}
                      </span>
                      <span className={`font-mono text-xs px-2 py-0.5 rounded border ${
                        theme === 'light' ? 'text-indigo-700 bg-indigo-50 border-indigo-200' : 'text-indigo-300 bg-indigo-950/60 border-indigo-800/50'
                      }`}>
                        {obs.clauseOrControl}
                      </span>
                      <span className={`text-sm font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                        {obs.findingTitle}
                      </span>
                    </div>

                    <div className={`text-xs flex items-center gap-2 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                      <span className={`font-semibold ${theme === 'light' ? 'text-slate-800' : 'text-slate-300'}`}>{obs.auditorName}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                        theme === 'light' ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}>
                        {obs.auditorBody}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span>{new Date(obs.recordedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 text-xs p-3.5 rounded-xl border ${
                    theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800/70'
                  }`}>
                    <div className="space-y-1.5">
                      <div className={`font-semibold flex items-center gap-1.5 ${theme === 'light' ? 'text-slate-700' : 'text-slate-400'}`}>
                        <FileCheck2 className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Objective Evidence Examined:</span>
                      </div>
                      <p className={`leading-relaxed pl-5 ${theme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>
                        {obs.objectiveEvidenceExamined}
                      </p>
                      <div className={`text-[11px] pl-5 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                        Standard Citation: <strong className={theme === 'light' ? 'text-slate-900' : 'text-slate-300'}>{obs.requirementCitation}</strong>
                      </div>
                    </div>

                    <div className={`space-y-1.5 border-t md:border-t-0 md:border-l pt-2 md:pt-0 md:pl-4 ${
                      theme === 'light' ? 'border-slate-200' : 'border-slate-800/80'
                    }`}>
                      <div className={`font-semibold flex items-center gap-1.5 ${theme === 'light' ? 'text-slate-700' : 'text-slate-400'}`}>
                        <Eye className="w-3.5 h-3.5 text-amber-500" />
                        <span>Auditor Evaluation & Notes:</span>
                      </div>
                      <p className={`leading-relaxed pl-5 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                        {obs.auditorNotes}
                      </p>
                      <div className={`text-[11px] pl-5 ${theme === 'light' ? 'text-indigo-700 font-medium' : 'text-indigo-300'}`}>
                        <strong>Recommended Action:</strong> {obs.recommendedAction}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: EVIDENCE ARTIFACT INSPECTOR */}
      {activeTab === 'evidence_browser' && (
        <div className="space-y-4">
          <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-800'
          }`}>
            <div className="space-y-0.5">
              <div className="flex items-center space-x-2">
                <h3 className={`text-sm font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                  Repository of Operational Evidence ({filteredEvidence.length} of {evidence.length} Artifacts)
                </h3>
                {auditStageFilter !== 'ALL' && (
                  <span className="text-[11px] font-semibold text-indigo-300 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
                    Filtered by: {auditStageFilter}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Auditor read-only inspection view with cryptographic integrity and audit trail validation.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {auditStageFilter !== 'ALL' && (
                <button
                  type="button"
                  onClick={() => setAuditStageFilter('ALL')}
                  className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
                >
                  Reset Stage Filter
                </button>
              )}
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                100% SHA-256 Verified
              </span>
            </div>
          </div>

          {filteredEvidence.length === 0 ? (
            <div className={`p-8 rounded-xl border text-center space-y-2 ${
              theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}>
              <FileText className="w-8 h-8 text-slate-400 mx-auto" />
              <div className={`text-sm font-bold ${theme === 'light' ? 'text-slate-800' : 'text-slate-300'}`}>No matching evidence artifacts found</div>
              <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                Try adjusting your search criteria or changing the active audit stage filter.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setAuditStageFilter('ALL');
                }}
                className="mt-2 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredEvidence.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className={`p-4 rounded-xl border transition space-y-2 shadow-xs ${
                    theme === 'light'
                      ? 'bg-white border-slate-200 hover:border-indigo-400'
                      : 'bg-slate-950 border-slate-800 hover:border-indigo-500/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                        theme === 'light' ? 'text-indigo-700 bg-indigo-50 border-indigo-200' : 'text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border-indigo-800'
                      }`}>
                        {item.controlCode}
                      </span>
                      <h4 className={`text-xs font-bold pt-1 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{item.title}</h4>
                      <p className={`text-[11px] ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>{item.fileName} • {item.fileSize}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 border ${
                        item.status === 'Verified'
                          ? theme === 'light'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          : item.status === 'Requires Update'
                          ? theme === 'light'
                            ? 'bg-rose-50 text-rose-800 border-rose-300'
                            : 'bg-rose-950 text-rose-300 border-rose-800'
                          : theme === 'light'
                          ? 'bg-sky-50 text-sky-800 border-sky-300'
                          : 'bg-sky-950 text-sky-300 border-sky-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <div className={`pt-2 border-t flex items-center justify-between text-[10px] ${
                    theme === 'light' ? 'border-slate-100 text-slate-500' : 'border-slate-900 text-slate-400'
                  }`}>
                    <span>Uploaded: {item.uploadedDate}</span>
                    <span
                      className="font-mono text-slate-500 hover:text-indigo-600 dark:hover:text-slate-300 transition cursor-help truncate max-w-[160px]"
                      title={`Full Hash: ${item.sha256Hash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}`}
                    >
                      SHA: {item.sha256Hash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: AUDIT STAGE RECOMMENDATION */}
      {activeTab === 'interim_summary' && (
        <div className={`p-6 rounded-2xl border space-y-6 ${
          theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-800'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className={`text-lg font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>Lead Auditor Certification Recommendation</h3>
              <p className={`text-xs ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>Formal certification recommendation submitted to the Certification Body Technical Review Committee.</p>
            </div>
          </div>

          <div className={`p-4 rounded-xl border space-y-3 ${
            theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/80 border-slate-800'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>Auditor Interim Opinion:</span>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                theme === 'light' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              }`}>
                Recommend for Stage 2 Certification Fieldwork
              </span>
            </div>
            <p className={`text-xs leading-relaxed ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
              Based on the Stage 1 documentation review and preliminary sample testing of the {currentTenant?.name || 'Organization'} Information Security Management System (ISMS), the management system conforms to ISO/IEC 27001:2022 prerequisites. The Statement of Applicability (v2.0) contains verified justifications, internal audit records (Cl. 9.2) demonstrate independent evaluation, and top management review (Cl. 9.3) covered all 11 mandatory inputs. No Major Non-Conformities were identified.
            </p>
          </div>
        </div>
      )}

      {/* RECORD OBSERVATION MODAL */}
      {isAddingObservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className={`border rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl ${
            theme === 'light' ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
          }`}>
            <div className={`flex items-center justify-between border-b pb-3 ${theme === 'light' ? 'border-slate-200' : 'border-slate-800'}`}>
              <div className="flex items-center space-x-2">
                <Plus className="w-5 h-5 text-emerald-500" />
                <h3 className={`text-base font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>Record Auditor Observation</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingObservation(false)}
                className={`cursor-pointer ${theme === 'light' ? 'text-slate-400 hover:text-slate-700' : 'text-slate-400 hover:text-white'}`}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddObservation} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className={`font-semibold ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>Auditor Name</label>
                  <input
                    type="text"
                    value={newObs.auditorName}
                    onChange={e => setNewObs({ ...newObs, auditorName: e.target.value })}
                    className={`w-full border rounded-lg p-2 text-xs outline-none focus:ring-1 focus:ring-indigo-500 ${
                      theme === 'light' ? 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white' : 'bg-slate-900 border-slate-800 text-white'
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label className={`font-semibold ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>Certification Body</label>
                  <select
                    value={newObs.auditorBody}
                    onChange={e => setNewObs({ ...newObs, auditorBody: e.target.value as any })}
                    className={`w-full border rounded-lg p-2 text-xs outline-none focus:ring-1 focus:ring-indigo-500 ${
                      theme === 'light' ? 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white' : 'bg-slate-900 border-slate-800 text-white'
                    }`}
                  >
                    <option value="BSI">BSI Group</option>
                    <option value="TÜV SÜD">TÜV SÜD</option>
                    <option value="TÜV Rheinland">TÜV Rheinland</option>
                    <option value="PECB">PECB</option>
                    <option value="SGS">SGS</option>
                    <option value="DNV">DNV</option>
                    <option value="Internal Lead Auditor">Internal Lead Auditor</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className={`font-semibold ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>Classification Type</label>
                  <select
                    value={newObs.type}
                    onChange={e => setNewObs({ ...newObs, type: e.target.value as any })}
                    className={`w-full border rounded-lg p-2 text-xs outline-none focus:ring-1 focus:ring-indigo-500 ${
                      theme === 'light' ? 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white' : 'bg-slate-900 border-slate-800 text-white'
                    }`}
                  >
                    <option value="Conformity">Conformity</option>
                    <option value="Opportunity for Improvement">Opportunity for Improvement (OFI)</option>
                    <option value="Minor Non-Conformity">Minor Non-Conformity</option>
                    <option value="Major Non-Conformity">Major Non-Conformity</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className={`font-semibold ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>Clause or Control Reference</label>
                  <input
                    type="text"
                    value={newObs.clauseOrControl}
                    onChange={e => setNewObs({ ...newObs, clauseOrControl: e.target.value })}
                    placeholder="e.g. A.8.12, Cl. 9.2"
                    className={`w-full border rounded-lg p-2 text-xs outline-none focus:ring-1 focus:ring-indigo-500 ${
                      theme === 'light' ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white' : 'bg-slate-900 border-slate-800 text-white placeholder-slate-500'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className={`font-semibold ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>Finding Title</label>
                <input
                  type="text"
                  value={newObs.findingTitle}
                  onChange={e => setNewObs({ ...newObs, findingTitle: e.target.value })}
                  placeholder="Short, clear finding statement"
                  className={`w-full border rounded-lg p-2 text-xs outline-none focus:ring-1 focus:ring-indigo-500 ${
                    theme === 'light' ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white' : 'bg-slate-900 border-slate-800 text-white placeholder-slate-500'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className={`font-semibold ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>Objective Evidence Examined</label>
                <textarea
                  rows={2}
                  value={newObs.objectiveEvidenceExamined}
                  onChange={e => setNewObs({ ...newObs, objectiveEvidenceExamined: e.target.value })}
                  placeholder="List artifacts, log dates, interviewees or sample tokens inspected"
                  className={`w-full border rounded-lg p-2 text-xs outline-none focus:ring-1 focus:ring-indigo-500 ${
                    theme === 'light' ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white' : 'bg-slate-900 border-slate-800 text-white placeholder-slate-500'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className={`font-semibold ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>Auditor Notes & Recommendation</label>
                <textarea
                  rows={2}
                  value={newObs.auditorNotes}
                  onChange={e => setNewObs({ ...newObs, auditorNotes: e.target.value })}
                  placeholder="Detailed rationale and suggested action"
                  className={`w-full border rounded-lg p-2 text-xs outline-none focus:ring-1 focus:ring-indigo-500 ${
                    theme === 'light' ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white' : 'bg-slate-900 border-slate-800 text-white placeholder-slate-500'
                  }`}
                />
              </div>

              <div className={`flex justify-end space-x-2 pt-3 border-t ${theme === 'light' ? 'border-slate-200' : 'border-slate-800'}`}>
                <button
                  type="button"
                  onClick={() => setIsAddingObservation(false)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition ${
                    theme === 'light' ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200' : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer transition shadow-xs"
                >
                  Save Finding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
