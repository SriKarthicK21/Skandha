import React, { useState, useEffect, useRef } from 'react';
import { useGRC } from '../../context/GRCContext';
import { useToast } from '../common/ToastContainer';
import { safeConfirm } from '../../utils/safeConfirm';
import { UserRole } from '../../types';
import {
  Search,
  Compass,
  Building,
  Users2,
  Server,
  Database,
  Truck,
  Flame,
  Shield,
  SlidersHorizontal,
  Layers,
  FileText,
  ListTodo,
  UploadCloud,
  FileCheck,
  FileCheck2,
  ClipboardList,
  AlertOctagon,
  Award,
  BarChart3,
  Globe2,
  Settings,
  Lock,
  BookmarkCheck,
  Grid,
  Grid3X3,
  Sparkles,
  ArrowRight,
  UserCheck,
  Building2,
  CheckCircle2,
  CheckSquare,
  Command,
  Wand2,
  GraduationCap,
  RotateCcw,
  Moon,
  Sun,
  Laptop,
  ArrowRightLeft,
  Clock,
  Calendar,
  Trash2,
  Target,
  ShieldAlert,
  ShieldCheck,
  LayoutDashboard,
  Library,
  LineChart
} from 'lucide-react';

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  category: 'Modules' | 'Controls & Clauses' | 'Tenants' | 'Roles' | 'Actions';
  icon: React.ElementType;
  action: () => void;
  badge?: string;
  keywords?: string[];
}

export const CommandPalette: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose
}) => {
  const {
    activeModule,
    setActiveModule,
    currentTenant,
    tenants,
    switchTenant,
    currentRole,
    switchRole,
    resetAllData,
    theme,
    osTheme,
    isOSThemeSynced,
    setTheme,
    toggleTheme,
    syncWithOSTheme,
    openEntityDrawer,
    setProductMode,
    controls,
    risks,
    evidence,
    assets
  } = useGRC();
  const { showToast } = useToast();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const items: CommandItem[] = [
    // Primary Actions & Modes
    {
      id: 'action-guided-journey',
      title: '> Start Guided Implementation Journey',
      subtitle: 'Step-by-step onboarding for new clients: Org → Programs → Discovery → Scope → Audit',
      category: 'Actions',
      icon: Compass,
      badge: 'Mode 1',
      keywords: ['mode 1', 'guided', 'journey', 'onboarding', 'wizard', 'start', 'setup'],
      action: () => {
        setProductMode('guided_journey');
        setActiveModule('guided_journey');
        onClose();
        showToast({ title: 'Switched to Guided Implementation Mode', type: 'info' });
      }
    },
    {
      id: 'action-auditor-clean-room',
      title: '> Open Auditor Clean Room',
      subtitle: 'Read-only inspection portal with 1-click dossier export and 3LoD manifest',
      category: 'Actions',
      icon: ShieldCheck,
      badge: 'Auditor',
      keywords: ['auditor', 'clean room', 'portal', 'inspection', 'dossier', 'export', 'bsi', 'pwc'],
      action: () => {
        setActiveModule('auditor_portal');
        onClose();
        showToast({ title: 'Entered Auditor Clean Room', type: 'info' });
      }
    },
    // Real Controls (Direct 360° Entity Drawer exploration)
    ...controls.slice(0, 30).map(c => ({
      id: `ctrl-${c.controlCode}`,
      title: `${c.controlCode} • ${c.title}`,
      subtitle: `${c.category} • ${c.applicable ? 'Applicable' : 'Excluded'}`,
      category: 'Controls & Clauses' as const,
      icon: Shield,
      badge: 'Control',
      keywords: [c.controlCode.toLowerCase(), c.title.toLowerCase(), c.category.toLowerCase(), 'control', 'clause'],
      action: () => {
        openEntityDrawer({ type: 'control', id: c.controlCode, title: `${c.controlCode} ${c.title}`, data: c });
        onClose();
      }
    })),
    // Real Risks (Direct 360° Entity Drawer exploration)
    ...risks.slice(0, 15).map(r => ({
      id: `risk-${r.id}`,
      title: `${r.riskCode || 'RISK'} • ${r.title}`,
      subtitle: `Score: ${r.residualScore} • Treatment: ${r.treatmentOption || 'Mitigate'}`,
      category: 'Actions' as const,
      icon: Flame,
      badge: 'Risk',
      keywords: [r.title.toLowerCase(), r.riskCode?.toLowerCase() || '', 'risk', 'threat'],
      action: () => {
        openEntityDrawer({ type: 'risk', id: r.id, title: r.title, data: r });
        onClose();
      }
    })),
    // Consolidated Business Workspaces
    {
      id: 'ws-home',
      title: 'Home / Command Center',
      subtitle: 'Executive readiness, critical risks, open gaps & next best action',
      category: 'Modules',
      icon: LayoutDashboard,
      badge: 'Workspace',
      keywords: ['home', 'command center', 'dashboard', 'readiness', 'workspace'],
      action: () => {
        setActiveModule('command_center');
        showToast({ title: 'Navigated to Command Center', type: 'info' });
      }
    },
    {
      id: 'ws-governance',
      title: 'Governance & Organization Workspace',
      subtitle: 'Org boundary, departments, policies, SOPs, and Cl. 4.2 obligations',
      category: 'Modules',
      icon: Building,
      badge: 'Workspace',
      keywords: ['governance', 'organization', 'scope', 'departments', 'policies', 'sops', 'workspace'],
      action: () => {
        setActiveModule('governance');
        showToast({ title: 'Navigated to Governance Workspace', type: 'info' });
      }
    },
    {
      id: 'ws-compliance',
      title: 'Compliance & Frameworks Workspace',
      subtitle: 'ISO 27001, MAS TRM, ISO 42001, DPDP Act, gap analysis & harmonization',
      category: 'Modules',
      icon: ShieldCheck,
      badge: 'Workspace',
      keywords: ['compliance', 'frameworks', 'iso 27001', 'mas trm', 'iso 42001', 'dpdp', 'soc 2', 'workspace'],
      action: () => {
        setActiveModule('compliance');
        showToast({ title: 'Navigated to Compliance Workspace', type: 'info' });
      }
    },
    {
      id: 'ws-risk',
      title: 'Risk Management Workspace',
      subtitle: 'Risk register, scoring, D3 heatmap, treatment simulator & exceptions',
      category: 'Modules',
      icon: Flame,
      badge: 'Workspace',
      keywords: ['risk', 'heatmap', 'matrix', 'register', 'treatment', 'exceptions', 'appetite', 'workspace'],
      action: () => {
        setActiveModule('risk');
        showToast({ title: 'Navigated to Risk Management Workspace', type: 'info' });
      }
    },
    {
      id: 'ws-controls-evidence',
      title: 'Controls & Evidence Workspace',
      subtitle: 'Central control library, evidence vault, AI OCR validation & dual-lens checklist',
      category: 'Modules',
      icon: Library,
      badge: 'Workspace',
      keywords: ['controls', 'evidence', 'library', 'vault', 'upload', 'ocr', 'workspace'],
      action: () => {
        setActiveModule('controls_evidence');
        showToast({ title: 'Navigated to Controls & Evidence Workspace', type: 'info' });
      }
    },
    {
      id: 'ws-audit',
      title: 'Audit & Assurance Workspace',
      subtitle: 'Audit planning, auditor portal, non-conformities, CAPA desk & sampling',
      category: 'Modules',
      icon: ClipboardList,
      badge: 'Workspace',
      keywords: ['audit', 'assurance', 'internal audit', 'portal', 'findings', 'capa', 'sampling', 'workspace'],
      action: () => {
        setActiveModule('audit');
        showToast({ title: 'Navigated to Audit & Assurance Workspace', type: 'info' });
      }
    },
    {
      id: 'ws-tprm-assets',
      title: 'Third-Party & Assets Workspace',
      subtitle: 'Vendors, TPRM, CMDB inventory, critical systems & data classification',
      category: 'Modules',
      icon: Truck,
      badge: 'Workspace',
      keywords: ['third party', 'vendors', 'tprm', 'assets', 'cmdb', 'critical systems', 'workspace'],
      action: () => {
        setActiveModule('third_party_assets');
        showToast({ title: 'Navigated to Third-Party & Assets Workspace', type: 'info' });
      }
    },
    {
      id: 'ws-threat-intel',
      title: 'Threat & External Risk Workspace',
      subtitle: 'BrandGuard, attack surface EASM, dark web leaks, takedowns & crisis war room',
      category: 'Modules',
      icon: ShieldAlert,
      badge: 'Workspace',
      keywords: ['threat', 'brandguard', 'easm', 'dark web', 'takedowns', 'ioc', 'war room', 'workspace'],
      action: () => {
        setActiveModule('threat_intelligence');
        showToast({ title: 'Navigated to Threat & External Risk Workspace', type: 'info' });
      }
    },
    {
      id: 'ws-reports',
      title: 'Reports & Intelligence Workspace',
      subtitle: 'CISO 1-pager, board deck, compliance heatmap, maturity scorecard & academy',
      category: 'Modules',
      icon: LineChart,
      badge: 'Workspace',
      keywords: ['reports', 'ciso', 'board', 'heatmap', 'maturity', 'analytics', 'academy', 'workspace'],
      action: () => {
        setActiveModule('reports_intelligence');
        showToast({ title: 'Navigated to Reports & Intelligence Workspace', type: 'info' });
      }
    },
    {
      id: 'ws-settings',
      title: 'Platform Settings Workspace',
      subtitle: 'Users, RBAC, workflows, connectors, WORM cryptographic ledger & super admin',
      category: 'Modules',
      icon: Settings,
      badge: 'Workspace',
      keywords: ['settings', 'rbac', 'users', 'workflows', 'integrations', 'ledger', 'workspace'],
      action: () => {
        setActiveModule('settings');
        showToast({ title: 'Navigated to Platform Settings Workspace', type: 'info' });
      }
    },
    // Modules
    {
      id: 'mod-continuous-compliance',
      title: 'Continuous ISO Compliance Monitoring',
      subtitle: 'Post-certification 3-year surveillance, automated tests & drift detection',
      category: 'Modules',
      icon: ShieldCheck,
      keywords: ['continuous', 'surveillance', 'monitoring', 'post-cert', 'drift', 'recertification', 'iso 27001', 'ccm'],
      action: () => {
        setActiveModule('continuous_compliance');
        showToast({ title: 'Navigated to Continuous ISO Compliance Monitoring', type: 'info' });
      }
    },
    {
      id: 'mod-discovery',
      title: 'Business Discovery & ISMS Scope',
      subtitle: 'Overview, business context & ISO 27001 boundaries',
      category: 'Modules',
      icon: Compass,
      keywords: ['dashboard', 'home', 'scope', 'overview'],
      action: () => {
        setActiveModule('business_discovery');
        showToast({ title: 'Navigated to Business Discovery', type: 'info' });
      }
    },
    {
      id: 'mod-onboarding',
      title: '4-Phase Onboarding Survey',
      subtitle: 'Registration, Scope, Document Generation & Digital MoU',
      category: 'Modules',
      icon: Sparkles,
      keywords: ['survey', 'wizard', 'mou', 'setup', 'initiation'],
      action: () => {
        setActiveModule('onboarding_survey');
        showToast({ title: 'Opened Onboarding Survey', type: 'info' });
      }
    },
    {
      id: 'mod-risk-map',
      title: 'Risk Map (5x5 Matrix)',
      subtitle: 'ISO 27005 Likelihood vs Impact heat map & appetite thresholds',
      category: 'Modules',
      icon: Flame,
      keywords: ['risk', 'heatmap', 'matrix', '5x5', 'threat', 'iso 27005'],
      action: () => {
        setActiveModule('risk_map');
        showToast({ title: 'Navigated to 5x5 Risk Map', type: 'info' });
      }
    },
    {
      id: 'mod-compliance-heatmap',
      title: 'Compliance Heatmap',
      subtitle: 'Department risk concentration matrix across ISO 27001 & MAS TRM',
      category: 'Modules',
      icon: Grid,
      badge: 'Live Matrix',
      keywords: ['compliance heatmap', 'heatmap', 'matrix', 'departments', 'risk concentration', 'iso 27001', 'mas trm'],
      action: () => {
        setActiveModule('compliance_heatmap');
        showToast({ title: 'Navigated to Compliance Heatmap', type: 'info' });
      }
    },
    {
      id: 'mod-risk-assessment',
      title: 'Risk Assessment & Register',
      subtitle: 'Risk catalog, CIA ratings, asset linkages and owner assignments',
      category: 'Modules',
      icon: Shield,
      keywords: ['assessment', 'register', 'cia', 'threats', 'vulnerabilities'],
      action: () => {
        setActiveModule('risk_assessment');
        showToast({ title: 'Navigated to Risk Assessment Register', type: 'info' });
      }
    },
    {
      id: 'mod-risk-sim',
      title: 'Risk Treatment Simulator',
      subtitle: 'Cost-benefit ROI analysis, control residual risk calculator',
      category: 'Modules',
      icon: Sparkles,
      keywords: ['simulator', 'treatment', 'mitigate', 'roi', 'residual'],
      action: () => {
        setActiveModule('risk_simulator');
        showToast({ title: 'Opened Risk Treatment Simulator', type: 'info' });
      }
    },
    {
      id: 'mod-soa',
      title: 'Statement of Applicability (SoA)',
      subtitle: 'All 93 ISO 27001:2022 Annex A controls with inclusion rationale',
      category: 'Modules',
      icon: BookmarkCheck,
      badge: '93 Controls',
      keywords: ['soa', 'statement of applicability', 'annex a', '93', 'controls'],
      action: () => {
        setActiveModule('statement_of_applicability');
        showToast({ title: 'Navigated to Statement of Applicability', type: 'info' });
      }
    },
    {
      id: 'mod-iso42001-soa',
      title: 'ISO 42001 Automated Statement of Applicability (SoA) Generator',
      subtitle: 'Annex A.2–A.10 compliance documentation with automatic ISO 27001 crosswalk citations',
      category: 'Modules',
      icon: FileCheck2,
      badge: 'Auto SoA',
      keywords: ['iso 42001', 'ai soa', 'statement of applicability', 'crosswalk', 'iso 27001', 'annex a.2', 'aims', 'ai ethics'],
      action: () => {
        setActiveModule('iso42001_soa');
        showToast({ title: 'Opened ISO 42001 Automated SoA Generator', type: 'info' });
      }
    },
    {
      id: 'mod-iso27701-soa',
      title: 'ISO 27701 Statement of Applicability (SoA) Builder & Lead Auditor Dossier',
      subtitle: 'Annex A (7.2–7.5 Controller) and Annex B (8.2–8.5 Processor) with Stage 1 & 2 Certifier Package',
      category: 'Modules',
      icon: ShieldCheck,
      badge: 'PIMS SoA',
      keywords: ['iso 27701', 'pims', 'soa', 'annex a', 'annex b', 'privacy', 'controller', 'processor', 'lead auditor', 'dossier', 'dpia', 'dsar'],
      action: () => {
        setActiveModule('iso27701_soa');
        showToast({ title: 'Opened ISO 27701 PIMS SoA & Audit Dossier', type: 'info' });
      }
    },
    {
      id: 'mod-accreditation',
      title: 'Global Accreditation & Certification Authority Registry',
      subtitle: 'Global ACI, IAF MLA, UKAS, NABCB, ANAB & CB Verification Engine',
      category: 'Modules',
      icon: Globe2,
      badge: 'Global ACI',
      keywords: ['accreditation', 'iaf', 'nabcb', 'ukas', 'anab', 'bsi', 'tuv', 'dnv', 'verification', 'registry'],
      action: () => {
        setActiveModule('accreditation_registry');
        showToast({ title: 'Opened Global Accreditation Registry', type: 'info' });
      }
    },
    {
      id: 'mod-standards-academy',
      title: 'Standards and Training Knowledge Hub',
      subtitle: '17 global standards, mandatory checklists, 10-step roadmaps, and auditor Q&As',
      category: 'Modules',
      icon: GraduationCap,
      badge: '17 Standards',
      keywords: ['standards', 'training', 'iso 9001', 'iso 13485', 'iso 14001', 'iso 45001', 'iso 20000', 'iso 22301', 'iso 17025', 'nis2', 'gdpr', 'mdr', 'dora', 'iatf', 'as9100', 'annex sl'],
      action: () => {
        setActiveModule('standards_academy');
        showToast({ title: 'Opened Standards and Training Hub', type: 'info' });
      }
    },
    {
      id: 'mod-policies',
      title: 'Policies & Procedures Hub',
      subtitle: '24 ISO mandatory policies, acknowledgment tracking & versioning',
      category: 'Modules',
      icon: FileText,
      keywords: ['policies', 'procedures', 'documents', 'isms', 'mou'],
      action: () => {
        setActiveModule('policies');
        showToast({ title: 'Navigated to Policies & Procedures', type: 'info' });
      }
    },
    {
      id: 'mod-internal-audit',
      title: 'Internal Audit Management (Clause 9.2)',
      subtitle: 'Audit schedules, sampling checklists, fieldwork and reports',
      category: 'Modules',
      icon: ClipboardList,
      keywords: ['internal audit', '9.2', 'audit plan', 'sampling', 'auditor'],
      action: () => {
        setActiveModule('internal_audit');
        showToast({ title: 'Navigated to Internal Audit Module', type: 'info' });
      }
    },
    {
      id: 'mod-mgmt-review',
      title: 'Management Review (Clause 9.3)',
      subtitle: 'Executive governance meetings, ISO mandatory inputs/outputs',
      category: 'Modules',
      icon: Users2,
      keywords: ['management review', '9.3', 'executive', 'meeting', 'minutes'],
      action: () => {
        setActiveModule('management_review');
        showToast({ title: 'Navigated to Management Review (9.3)', type: 'info' });
      }
    },
    {
      id: 'mod-findings',
      title: 'Findings & CAPA Tracker (Clause 10)',
      subtitle: 'Non-conformities, root cause 5-Whys analysis & corrective actions',
      category: 'Modules',
      icon: AlertOctagon,
      keywords: ['findings', 'capa', 'clause 10', 'non-conformity', 'root cause', 'corrective'],
      action: () => {
        setActiveModule('findings_capa');
        showToast({ title: 'Navigated to Findings & CAPA Tracker', type: 'info' });
      }
    },
    {
      id: 'mod-audit-reporting',
      title: 'Automated Audit Reporting Module & Stakeholder Dossier',
      subtitle: 'Aggregate findings, 5-Whys, CAPA milestones & generate executive PDF reports',
      category: 'Modules',
      icon: FileText,
      badge: 'Automated',
      keywords: ['audit report', 'automated report', 'findings report', 'dossier', 'stakeholder report', 'capa report', 'executive pdf', 'board report'],
      action: () => {
        setActiveModule('audit_reporting');
        showToast({ title: 'Navigated to Automated Audit Reporting Module', type: 'info' });
      }
    },
    {
      id: 'mod-evidence',
      title: 'Evidence Centre & Vault',
      subtitle: 'SHA-256 verified evidence repository with auditor review flow',
      category: 'Modules',
      icon: FileCheck,
      keywords: ['evidence', 'vault', 'files', 'sha256', 'hash', 'artifacts'],
      action: () => {
        setActiveModule('evidence_centre');
        showToast({ title: 'Opened Evidence Centre', type: 'info' });
      }
    },
    {
      id: 'mod-readiness',
      title: 'Readiness & Certification Score',
      subtitle: 'Overall maturity scoring, Stage 1 / Stage 2 readiness report',
      category: 'Modules',
      icon: Award,
      keywords: ['readiness', 'certificate', 'maturity', 'stage 1', 'stage 2', 'score'],
      action: () => {
        setActiveModule('readiness_cert');
        showToast({ title: 'Opened Readiness Certification Module', type: 'info' });
      }
    },
    {
      id: 'mod-vendors',
      title: 'Vendors & Third Party Risk (A.5.19 - A.5.23)',
      subtitle: 'Supplier directory, risk tiers, SLA assessments & ISO cert checks',
      category: 'Modules',
      icon: Truck,
      keywords: ['vendors', 'third party', 'suppliers', 'supply chain', 'a.5.19', 'sla'],
      action: () => {
        setActiveModule('vendors');
        showToast({ title: 'Navigated to Vendors & Third Parties', type: 'info' });
      }
    },
    {
      id: 'mod-assets',
      title: 'Asset Inventory & Criticality (A.5.9)',
      subtitle: 'Hardware, software, cloud services, and endpoint tracking',
      category: 'Modules',
      icon: Server,
      keywords: ['assets', 'hardware', 'software', 'servers', 'a.5.9'],
      action: () => {
        setActiveModule('assets');
        showToast({ title: 'Navigated to Assets & Systems', type: 'info' });
      }
    },
    {
      id: 'mod-data-info',
      title: 'Data & Information Assets (A.5.12)',
      subtitle: 'Data classification, PII mapping, data flows and retention rules',
      category: 'Modules',
      icon: Database,
      keywords: ['data', 'pii', 'classification', 'gdpr', 'dpdp', 'a.5.12'],
      action: () => {
        setActiveModule('data_information');
        showToast({ title: 'Navigated to Data & Information Assets', type: 'info' });
      }
    },
    {
      id: 'mod-control-lib',
      title: 'Control Library & Guidance',
      subtitle: 'Complete ISO 27001:2022, ISO 27701 and ISO 42001 control taxonomy',
      category: 'Modules',
      icon: Grid3X3,
      keywords: ['controls', 'library', 'taxonomy', 'iso 42001', 'iso 27701'],
      action: () => {
        setActiveModule('control_library');
        showToast({ title: 'Navigated to Control Library', type: 'info' });
      }
    },
    {
      id: 'mod-superadmin',
      title: 'Super Admin Portfolio Console',
      subtitle: 'Multi-tenant health metrics, risk benchmark & global master data',
      category: 'Modules',
      icon: Globe2,
      badge: 'Admin Only',
      keywords: ['super admin', 'portfolio', 'master data', 'tenants', 'benchmarks'],
      action: () => {
        setActiveModule('super_admin_portfolio');
        showToast({ title: 'Opened Super Admin Portfolio', type: 'info' });
      }
    },
    {
      id: 'mod-audit-trail',
      title: 'Immutable Audit Trail',
      subtitle: 'Cryptographic SHA-256 event log of all GRC actions and changes',
      category: 'Modules',
      icon: Lock,
      keywords: ['audit trail', 'logs', 'immutable', 'sha256', 'tamper-proof'],
      action: () => {
        setActiveModule('audit_trail');
        showToast({ title: 'Navigated to Audit Trail', type: 'info' });
      }
    },
    {
      id: 'mod-iso-mas-improvements',
      title: 'ISO & MAS Compliance Improvement Hub',
      subtitle: '11 New ISO 2022 controls, Notice 644 1-hour drill, Notice 655 cyber hygiene & Test Once crosswalk',
      category: 'Modules',
      icon: ArrowRightLeft,
      badge: 'Harmonized',
      keywords: ['iso', 'mas', 'improve', 'improvements', 'notice 644', 'notice 655', 'test once', 'synergy', '11 new controls'],
      action: () => {
        setActiveModule('iso_mas_improvements');
        showToast({ title: 'Opened ISO & MAS Compliance Improvement Hub', type: 'info' });
      }
    },
    {
      id: 'mod-notice-644-drill',
      title: 'MAS Notice 644: 1-Hour Incident Notification Simulator',
      subtitle: 'Statutory 60-minute countdown drill, incident triage & Template IT-01 generator',
      category: 'Modules',
      icon: Clock,
      badge: 'Statutory',
      keywords: ['incident', 'notice 644', '1 hour', 'drill', 'mas', 'outage', 'critical systems', 'notification', 'it-01'],
      action: () => {
        setActiveModule('mas_notice644_simulator');
        showToast({ title: 'Opened MAS Notice 644 Incident Simulator', type: 'info' });
      }
    },
    {
      id: 'mod-notice-655-hygiene',
      title: 'MAS Notice 655: Cyber Hygiene Mandates Ledger',
      subtitle: 'The 6 legally binding cyber hygiene mandates with live evidence verification',
      category: 'Modules',
      icon: Lock,
      badge: 'Legally Binding',
      keywords: ['notice 655', 'cyber hygiene', 'mfa', 'patching', 'perimeter', 'malware', 'pentest', 'mas'],
      action: () => {
        setActiveModule('mas_notice655_hygiene');
        showToast({ title: 'Opened MAS Notice 655 Cyber Hygiene Ledger', type: 'info' });
      }
    },
    {
      id: 'mod-cis-register',
      title: 'MAS Critical Information Systems (CIS) & RTO/RPO Register',
      subtitle: 'Tier 1/2 systems, 4-hour RTO compliance, 2-hour RPO, and annual unscheduled downtime cap',
      category: 'Modules',
      icon: Server,
      badge: 'RTO $\le$ 4h',
      keywords: ['critical systems', 'cis', 'rto', 'rpo', 'downtime', 'mas trm section 5', 'dr drill'],
      action: () => {
        setActiveModule('mas_critical_systems');
        showToast({ title: 'Opened Critical Systems Register', type: 'info' });
      }
    },
    {
      id: 'mod-mas-dashboard',
      title: 'MAS TRM Executive Command Center',
      subtitle: 'Singapore MAS Technology Risk Management governance and audit readiness',
      category: 'Modules',
      icon: Building2,
      badge: 'MAS Singapore',
      keywords: ['mas', 'singapore', 'trm', 'monetary authority', 'notice 644', 'critical systems'],
      action: () => {
        setActiveModule('mas_dashboard');
        showToast({ title: 'Navigated to MAS TRM Dashboard', type: 'info' });
      }
    },
    {
      id: 'mod-mas-checklist',
      title: 'MAS TRM Compliance Checklist (14 Domains)',
      subtitle: 'Actionable testing sub-tasks linked to findings & CAPA remediation',
      category: 'Modules',
      icon: CheckSquare,
      badge: '14 Domains',
      keywords: ['mas checklist', 'compliance checklist', 'subtasks', '14 domains', 'capa linkage'],
      action: () => {
        setActiveModule('mas_checklist');
        showToast({ title: 'Opened MAS TRM Compliance Checklist', type: 'info' });
      }
    },
    {
      id: 'mod-mas-overview',
      title: 'MAS TRM 15 Guideline Domains',
      subtitle: 'Technology risk management domains, statutory notices & baseline controls',
      category: 'Modules',
      icon: Shield,
      badge: '15 Domains',
      keywords: ['mas', 'domains', 'guidelines', 'statutory', 'trm'],
      action: () => {
        setActiveModule('mas_overview');
        showToast({ title: 'Opened MAS TRM 15 Domains', type: 'info' });
      }
    },
    {
      id: 'mod-mas-applicability',
      title: 'MAS Scoping & Critical Systems Register',
      subtitle: 'Institution tiering, online financial services, high-availability & critical infra',
      category: 'Modules',
      icon: Server,
      badge: 'Critical Systems',
      keywords: ['scoping', 'critical systems', 'mto', 'rto', 'rpo', 'tiering'],
      action: () => {
        setActiveModule('mas_applicability');
        showToast({ title: 'Opened MAS Scoping & Critical Systems', type: 'info' });
      }
    },
    {
      id: 'mod-mas-policy-generator',
      title: 'Automated Policy Generator (MAS TRM)',
      subtitle: 'Cross-reference internal policy drafts against MAS TRM guidelines to generate compliant policy text',
      category: 'Modules',
      icon: Wand2,
      badge: 'AI Policy Engine',
      keywords: ['policy generator', 'automated policy', 'cross reference', 'mas policy', 'draft', 'remediation', 'guidelines'],
      action: () => {
        setActiveModule('mas_policy_generator');
        showToast({ title: 'Opened Automated Policy Generator', type: 'info' });
      }
    },
    {
      id: 'mod-mas-workbench',
      title: 'MAS TRM Control Testing Workbench',
      subtitle: 'Statutory testing procedures, evidence verification & effectiveness scores',
      category: 'Modules',
      icon: ClipboardList,
      badge: '86 Controls',
      keywords: ['workbench', 'testing', 'audit procedures', 'effectiveness', 'mas'],
      action: () => {
        setActiveModule('mas_assessment_workbench');
        showToast({ title: 'Opened MAS Control Testing Workbench', type: 'info' });
      }
    },
    {
      id: 'mod-crosswalk',
      title: 'Multi-Framework Regulatory Crosswalk Matrix',
      subtitle: 'Bi-directional mapping: ISO 27001:2022 vs MAS TRM vs SOC 2 vs NIST CSF',
      category: 'Modules',
      icon: Layers,
      badge: 'Crosswalk',
      keywords: ['crosswalk', 'mapping', 'iso 27001', 'mas trm', 'soc 2', 'nist'],
      action: () => {
        setActiveModule('cross_framework_crosswalk');
        showToast({ title: 'Opened Multi-Framework Crosswalk', type: 'info' });
      }
    },
    {
      id: 'mod-regulatory-sources',
      title: 'Regulatory Change Feed & Source Registry',
      subtitle: 'Live statutory updates from MAS, ISO/IEC, NIST, and cyber authorities',
      category: 'Modules',
      icon: Globe2,
      keywords: ['regulatory', 'feed', 'updates', 'circulars', 'notices'],
      action: () => {
        setActiveModule('regulatory_sources');
        showToast({ title: 'Opened Regulatory Change Feed', type: 'info' });
      }
    },
    {
      id: 'mod-mas-reporting',
      title: 'MAS TRM Executive & Board Reporting Suite',
      subtitle: 'Regulatory compliance pack, cyber incident reports & Board risk summaries',
      category: 'Modules',
      icon: BarChart3,
      badge: 'Board Pack',
      keywords: ['reporting', 'board report', 'mas pack', 'audit export'],
      action: () => {
        setActiveModule('mas_reporting');
        showToast({ title: 'Opened MAS TRM Reporting', type: 'info' });
      }
    },
    {
      id: 'mod-compliance-maturity-scorecard',
      title: 'Compliance Maturity Scorecard (ISO 27001 & ISO 42001)',
      subtitle: 'Multiaxial radar visualization comparing adherence across ISMS & AIMS frameworks',
      category: 'Modules',
      icon: Compass,
      badge: 'Radar Chart',
      keywords: ['maturity', 'scorecard', 'radar', 'spider', 'iso 27001', 'iso 42001', 'adherence', 'chart', 'harmonization'],
      action: () => {
        setActiveModule('compliance_maturity_scorecard');
        showToast({ title: 'Opened Compliance Maturity Scorecard', type: 'info' });
      }
    },
    {
      id: 'mod-reports-analytics',
      title: 'Compliance Roadmap & Analytics Report',
      subtitle: 'Comprehensive implementation roadmap, milestone milestones & PDF export',
      category: 'Modules',
      icon: BarChart3,
      badge: 'PDF Export',
      keywords: ['roadmap', 'analytics', 'report', 'milestones', 'pdf', 'export'],
      action: () => {
        setActiveModule('reports_analytics');
        showToast({ title: 'Opened Compliance Roadmap & Analytics', type: 'info' });
      }
    },
    {
      id: 'mod-gap-assessment',
      title: 'CMMI Gap Assessment & Maturity Evaluation',
      subtitle: 'Evaluate ISO 27001 domains against CMMI Level 0-5 and generate remediation tasks',
      category: 'Modules',
      icon: Sparkles,
      keywords: ['gap', 'assessment', 'cmmi', 'maturity', 'remediation'],
      action: () => {
        setActiveModule('gap_assessment');
        showToast({ title: 'Opened Gap Assessment Module', type: 'info' });
      }
    },
    {
      id: 'mod-processes',
      title: 'Critical Business Processes & System Dependencies',
      subtitle: 'Business impact analysis (BIA), RTO/RPO targets and SLA tracking',
      category: 'Modules',
      icon: Server,
      keywords: ['processes', 'bia', 'rto', 'rpo', 'sla', 'business continuity'],
      action: () => {
        setActiveModule('processes');
        showToast({ title: 'Opened Critical Business Processes', type: 'info' });
      }
    },
    {
      id: 'mod-dpdp-training-gap',
      title: 'DPDP Training Gap Analyzer (Standards Integration)',
      subtitle: 'Cross-reference departmental roles with statutory DPDP requirements and assign Standards Training Hub modules',
      category: 'Modules',
      icon: Target,
      badge: 'Standards',
      keywords: ['gap', 'training', 'standards', 'dpdp', 'analyzer', 'statutory', 'roles', 'department', 'iso 27001', 'gdpr'],
      action: () => {
        setActiveModule('dpdp_training_gap');
        showToast({ title: 'Opened DPDP Training Gap Analyzer', type: 'info' });
      }
    },
    {
      id: 'mod-dpdp-academy',
      title: 'dpdpa.com Compliance Academy & Certification',
      subtitle: '8 statutory training modules, 5 industry toolkits, templates & certification exam',
      category: 'Modules',
      icon: GraduationCap,
      badge: 'dpdpa.com',
      keywords: ['training', 'certification', 'exam', 'dpdpa.com', 'course', 'academy', 'learn', 'syllabus'],
      action: () => {
        setActiveModule('dpdp_academy');
        showToast({ title: 'Opened dpdpa.com Compliance Academy', type: 'info' });
      }
    },
    {
      id: 'mod-dpdp-retention',
      title: 'DPDP Data Retention & Purge Policy Manager',
      subtitle: 'Statutory retention schedules, automated expiry queue & non-repudiation Record of Disposal',
      category: 'Modules',
      icon: Calendar,
      badge: 'Sec 8(7)',
      keywords: ['retention', 'purge', 'disposal', 'dpdp', 'destruction', 'shred', 'expiry', 'nist', 'sec 8'],
      action: () => {
        setActiveModule('dpdp_retention');
        showToast({ title: 'Opened DPDP Retention & Purge Manager', type: 'info' });
      }
    },
    {
      id: 'mod-dpdp-dataflow',
      title: 'DPDP Data Flow Mapping & RoPA Visualizer',
      subtitle: 'End-to-end personal data lineage, statutory clause crosswalk & RoPA matrix',
      category: 'Modules',
      icon: Trash2,
      badge: 'RoPA',
      keywords: ['data flow', 'ropa', 'mapping', 'dpdp', 'pipeline', 'statutory', 'lineage'],
      action: () => {
        setActiveModule('dpdp_data_flow');
        showToast({ title: 'Opened DPDP Data Flow Mapping & RoPA', type: 'info' });
      }
    },
    {
      id: 'mod-brandguard',
      title: 'BrandGuard™ Command Center & Multi-Surface Protection',
      subtitle: 'Executive posture, surface discovery, typosquatting, spoofing, logo cloning & automated takedowns',
      category: 'Modules',
      icon: ShieldAlert,
      badge: 'BrandGuard',
      keywords: ['brandguard', 'brand protection', 'threat intelligence', 'typosquatting', 'phishing', 'spoofing', 'takedown', 'surface web', 'infringement'],
      action: () => {
        setActiveModule('brandguard');
        showToast({ title: 'Opened BrandGuard™ Command Center', type: 'info' });
      }
    },
    {
      id: 'mod-easm',
      title: 'External Attack Surface Management (EASM) & Subdomain Takeover',
      subtitle: 'Dangling CNAME detection, unmanaged CloudFront/S3/Azure buckets, DNS drift',
      category: 'Modules',
      icon: Globe2,
      badge: 'Attack Surface',
      keywords: ['easm', 'attack surface', 'subdomain takeover', 'cname', 'dns', 'external assets', 'ct logs'],
      action: () => {
        setActiveModule('attack_surface');
        showToast({ title: 'Opened Attack Surface Management (EASM)', type: 'info' });
      }
    },
    {
      id: 'mod-threat-intel',
      title: 'Zero-Hour Threat Intelligence & IoC Ingestion Desk',
      subtitle: 'Autonomous high-velocity IoC clustering, threat actors, STIX/TAXII, and kill-chain attribution',
      category: 'Modules',
      icon: AlertOctagon,
      badge: 'Threat Intel',
      keywords: ['threat intel', 'ioc', 'indicators of compromise', 'threat actor', 'cyber threat', 'zero-hour'],
      action: () => {
        setActiveModule('threat_intel');
        showToast({ title: 'Opened Threat Intelligence & IoC Desk', type: 'info' });
      }
    },
    {
      id: 'mod-dark-web',
      title: 'Dark Web & Compromised Credential Intelligence Desk',
      subtitle: 'Tor onion network scanning, stealer logs, corporate credentials, breach dump correlation',
      category: 'Modules',
      icon: Lock,
      badge: 'Dark Web',
      keywords: ['dark web', 'credential leak', 'stealer logs', 'tor', 'onion', 'breach', 'passwords', 'dump'],
      action: () => {
        setActiveModule('dark_web');
        showToast({ title: 'Opened Dark Web & Credential Intelligence Desk', type: 'info' });
      }
    },
    {
      id: 'mod-logo-monitoring',
      title: 'Visual Logo Misuse & Brand Abuse Detection',
      subtitle: 'Deep Vision AI logo perceptual hashing, social impersonation, and trademark infringement',
      category: 'Modules',
      icon: Award,
      badge: 'Brand Abuse',
      keywords: ['logo monitoring', 'brand abuse', 'impersonation', 'trademark', 'visual ai', 'cloning'],
      action: () => {
        setActiveModule('logo_monitoring');
        showToast({ title: 'Opened Visual Logo & Brand Abuse Detection', type: 'info' });
      }
    },
    {
      id: 'mod-takedowns',
      title: 'Automated Abuse Takedown & WIPO Enforcement SLA Desk',
      subtitle: 'Automated registrar abuse dispatch, Google Safe Browsing reporting, and UDRP arbitration dossiers',
      category: 'Modules',
      icon: Flame,
      badge: 'Takedowns',
      keywords: ['takedown', 'wipo', 'udrp', 'safe browsing', 'abuse', 'registrar', 'enforcement'],
      action: () => {
        setActiveModule('takedowns');
        showToast({ title: 'Opened Takedown & WIPO Enforcement Desk', type: 'info' });
      }
    },
    {
      id: 'mod-entity-lineage-graph',
      title: 'Real-Time Entity Lineage & Traceability Graph',
      subtitle: '7-Hop Provenance: Asset ↔ Risk ↔ Control ↔ ACT Telemetry ↔ Evidence ↔ CAPA ↔ Review',
      category: 'Modules',
      icon: Layers,
      badge: 'Real-Time Graph',
      keywords: ['entity', 'lineage', 'graph', 'traceability', 'provenance', 'act', 'telemetry', '7-hop', 'control graph'],
      action: () => {
        setActiveModule('entity_lineage_graph');
        showToast({ title: 'Opened Real-Time Entity Lineage Graph', type: 'info' });
      }
    },

    // Switch Tenant Organizations
    ...tenants.filter(t => !t.isDemo).map(tenant => ({
      id: `tenant-${tenant.id}`,
      title: `Switch to ${tenant.name}`,
      subtitle: `${tenant.industryType} • ${!tenant.isDemo && tenant.soaBaselineLocked && tenant.readinessScore ? `Readiness ${tenant.readinessScore}%` : 'Data collection required'}`,
      category: 'Tenants' as const,
      icon: Building2,
      badge: tenant.id === currentTenant?.id ? 'Current' : undefined,
      keywords: [tenant.name.toLowerCase(), tenant.industryType.toLowerCase(), 'company', 'organization'],
      action: () => {
        switchTenant(tenant.id);
        showToast({
          title: `Switched Organization`,
          message: `Active organization is now ${tenant.name}`,
          type: 'success'
        });
      }
    })),

    // Switch Role / Personas
    {
      id: 'role-superadmin',
      title: 'Simulate: Super Admin',
      subtitle: 'Platform-wide authority & master catalog governance',
      category: 'Roles',
      icon: UserCheck,
      badge: currentRole === 'SUPER_ADMIN' ? 'Active' : undefined,
      keywords: ['role', 'super admin', 'persona', 'rbac', 'privileges'],
      action: () => {
        switchRole('SUPER_ADMIN');
        showToast({ title: 'Simulating Super Admin Role', type: 'info' });
      }
    },
    {
      id: 'role-ext-auditor',
      title: 'Simulate: Platform Auditor (External)',
      subtitle: 'Certification body lead auditor with read-only inspection access',
      category: 'Roles',
      icon: UserCheck,
      badge: currentRole === 'PLATFORM_AUDITOR' ? 'Active' : undefined,
      keywords: ['role', 'auditor', 'external', 'lead auditor', 'cb'],
      action: () => {
        switchRole('PLATFORM_AUDITOR');
        showToast({ title: 'Simulating Platform Auditor Role', type: 'info' });
      }
    },
    {
      id: 'role-co-admin',
      title: 'Simulate: Company Admin',
      subtitle: 'Tenant CISO / Security Lead with full administrative rights',
      category: 'Roles',
      icon: UserCheck,
      badge: currentRole === 'COMPANY_ADMIN' ? 'Active' : undefined,
      keywords: ['role', 'company admin', 'ciso', 'tenant admin'],
      action: () => {
        switchRole('COMPANY_ADMIN');
        showToast({ title: 'Simulating Company Admin Role', type: 'info' });
      }
    },
    {
      id: 'role-int-auditor',
      title: 'Simulate: Internal Auditor',
      subtitle: 'Independent 2nd-party internal audit practitioner',
      category: 'Roles',
      icon: UserCheck,
      badge: currentRole === 'INTERNAL_AUDITOR' ? 'Active' : undefined,
      keywords: ['role', 'internal auditor', 'audit team'],
      action: () => {
        switchRole('INTERNAL_AUDITOR');
        showToast({ title: 'Simulating Internal Auditor Role', type: 'info' });
      }
    },
    {
      id: 'role-exec',
      title: 'Simulate: Executive Viewer',
      subtitle: 'Board member / CEO view-only reporting & risk heat maps',
      category: 'Roles',
      icon: UserCheck,
      badge: currentRole === 'EXECUTIVE_VIEWER' ? 'Active' : undefined,
      keywords: ['role', 'executive', 'board', 'ceo', 'read only'],
      action: () => {
        switchRole('EXECUTIVE_VIEWER');
        showToast({ title: 'Simulating Executive Viewer Role', type: 'info' });
      }
    },

    // Quick Actions
    {
      id: 'action-toggle-theme',
      title: theme === 'midnight' ? 'Switch to High-Contrast Light Mode' : 'Switch to Midnight Dark Mode',
      subtitle: 'Smooth CSS cross-fade transition across all surfaces, tokens, and controls',
      category: 'Actions',
      icon: theme === 'midnight' ? Sun : Moon,
      keywords: ['theme', 'dark', 'light', 'mode', 'color', 'contrast', 'crossfade', 'toggle'],
      action: () => {
        toggleTheme();
      }
    },
    {
      id: 'action-theme-os-sync',
      title: 'Auto-Sync Theme with OS Preference',
      subtitle: `Dynamically detect and follow OS color scheme via window.matchMedia (Current OS: ${osTheme === 'midnight' ? 'Dark' : 'Light'})`,
      category: 'Actions',
      icon: Laptop,
      badge: isOSThemeSynced ? 'Auto-Synced' : undefined,
      keywords: ['system', 'os', 'auto', 'matchmedia', 'preference', 'scheme', 'sync'],
      action: () => {
        syncWithOSTheme();
        showToast({
          title: 'Theme: Synced with OS',
          message: `Auto-synchronization active via window.matchMedia. Currently in ${osTheme === 'midnight' ? 'Midnight Dark' : 'High-Contrast Light'} mode.`,
          type: 'info'
        });
      }
    },
    {
      id: 'action-theme-midnight',
      title: 'Set Theme: Midnight Dark Mode',
      subtitle: 'Deep slate low-light compliance monitoring palette with smooth cross-fade',
      category: 'Actions',
      icon: Moon,
      badge: theme === 'midnight' ? 'Active' : undefined,
      keywords: ['dark', 'midnight', 'night', 'theme', 'black'],
      action: () => {
        setTheme('midnight');
      }
    },
    {
      id: 'action-theme-light',
      title: 'Set Theme: High-Contrast Light Mode',
      subtitle: 'Crisp daytime high-contrast mode for board presentations and external audits',
      category: 'Actions',
      icon: Sun,
      badge: theme === 'light' ? 'Active' : undefined,
      keywords: ['light', 'day', 'white', 'theme', 'audit', 'bright'],
      action: () => {
        setTheme('light');
      }
    },
    {
      id: 'action-reset-demo',
      title: 'Reset Demo Data to Initial State',
      subtitle: 'Restores default sample tenants, SoA controls, evidence, and audit logs',
      category: 'Actions',
      icon: RotateCcw,
      keywords: ['reset', 'restore', 'sample', 'defaults', 'clear'],
      action: () => {
        if (safeConfirm('Reset all demo data across all tenants to default state?')) {
          resetAllData();
          showToast({ title: 'Demo Data Reset', message: 'All baseline state restored.', type: 'warning' });
        }
      }
    }
  ];

  const filteredItems = items.filter(item => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    const matchTitle = item.title.toLowerCase().includes(q);
    const matchSubtitle = item.subtitle?.toLowerCase().includes(q);
    const matchKeywords = item.keywords?.some(k => k.toLowerCase().includes(q));
    const matchCat = item.category.toLowerCase().includes(q);
    return matchTitle || matchSubtitle || matchKeywords || matchCat;
  });

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < filteredItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-sm flex items-start justify-center pt-[10vh] px-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[75vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Bar Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 bg-slate-950/80">
          <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command, module, control (e.g. SoA, Risk Map, UKAS, A.5.1), or tenant..."
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-sm focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center space-x-1 px-2 py-0.5 text-[10px] font-mono font-medium text-slate-400 bg-slate-800 border border-slate-700 rounded-md">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-2 divide-y divide-slate-800/40">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No matching modules, controls, or commands found for "{query}".
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const IconComp = item.icon;
              const isSelected = idx === selectedIndex;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0 pr-2">
                    <div
                      className={`p-2 rounded-lg shrink-0 ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-100'}`}>
                          {item.title}
                        </span>
                        {item.badge && (
                          <span
                            className={`text-[9px] font-semibold px-1.5 py-0.2 rounded font-mono ${
                              isSelected
                                ? 'bg-white/20 text-white'
                                : 'bg-slate-800 text-blue-400 border border-blue-500/20'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                      {item.subtitle && (
                        <p
                          className={`text-[11px] truncate mt-0.5 ${
                            isSelected ? 'text-blue-100' : 'text-slate-400'
                          }`}
                        >
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0 text-[10px]">
                    <span
                      className={`px-1.5 py-0.5 rounded font-mono uppercase tracking-wider ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.category}
                    </span>
                    <ArrowRight
                      className={`w-3.5 h-3.5 ${
                        isSelected ? 'text-white translate-x-0.5' : 'text-slate-600'
                      } transition-transform`}
                    />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer info & shortcut tips */}
        <div className="px-4 py-2 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1">
              <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-[9px] font-mono text-slate-300 border border-slate-700">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-[9px] font-mono text-slate-300 border border-slate-700">↓</kbd>
              <span>to navigate</span>
            </span>
            <span className="flex items-center space-x-1">
              <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-[9px] font-mono text-slate-300 border border-slate-700">↵</kbd>
              <span>to select</span>
            </span>
          </div>
          <span className="hidden sm:inline text-slate-500 font-mono">SKANDA GRC Universal Command</span>
        </div>
      </div>
    </div>
  );
};
