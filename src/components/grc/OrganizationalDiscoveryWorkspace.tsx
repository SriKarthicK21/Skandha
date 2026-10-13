// ============================================================================
// SKANDA ENTERPRISE GRC: PHASE 13.1 CLIENT DISCOVERY WORKSHOP & DOCUMENTATION STUDIO
// Path: src/components/grc/OrganizationalDiscoveryWorkspace.tsx
//
// Transforms SKANDA into a client-facing organizational discovery workshop,
// interactive process blueprint mapper, and authoritative documentation studio.
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { useGRC } from '../../context/GRCContext';
import { PageContainer } from '../layout/PageContainer';
import {
  organizationalDiscoveryClient,
  DiscoveryDepartmentWorkplanItem,
  ProcessBlueprint,
  ProcessStepObject,
  ProcessGapItem,
  DiscoveryConflict,
  AuthoritativeDocument,
  SectionProvenance,
  QuestionCategory,
  InterviewQuestion,
  InterviewResponse,
  ACME_ONBOARDING_BLUEPRINT
} from '../../services/grc/organizationalDiscoveryService';
import {
  Building2,
  Workflow,
  Users,
  FileText,
  ShieldCheck,
  Flame,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowRight,
  Plus,
  Search,
  Filter,
  Eye,
  Check,
  X,
  RefreshCw,
  FileCheck,
  Lock,
  ChevronRight,
  ChevronDown,
  Info,
  Sliders,
  Send,
  Save,
  MessageSquare,
  ShieldAlert,
  Server,
  Database,
  Link as LinkIcon,
  HelpCircle,
  ExternalLink,
  BookOpen,
  Award,
  Zap,
  RotateCcw,
  CheckSquare,
  FileSpreadsheet,
  Cpu,
  Fingerprint
} from 'lucide-react';

export interface OrganizationalDiscoveryWorkspaceProps {
  initialTab?: string;
  initialDepartmentId?: string;
  initialProcessId?: string;
}

export const OrganizationalDiscoveryWorkspace: React.FC<OrganizationalDiscoveryWorkspaceProps> = ({
  initialTab = 'overview',
  initialDepartmentId,
  initialProcessId = 'PROC-HR-001'
}) => {
  const { currentTenant, currentRole, currentUser } = useGRC();

  // Active Workspace Tab
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [selectedDeptId, setSelectedDeptId] = useState<string>(initialDepartmentId || 'DEP-HR-01');
  const [selectedProcessId, setSelectedProcessId] = useState<string>(initialProcessId);

  // Departments & Canonical Metrics State
  const [departments, setDepartments] = useState<DiscoveryDepartmentWorkplanItem[]>(() =>
    organizationalDiscoveryClient.getDepartments(currentTenant?.id)
  );
  const [metrics, setMetrics] = useState(() =>
    organizationalDiscoveryClient.getCommandCentreMetrics(currentTenant?.id)
  );

  // Department Workplan Filters
  const [workplanSearch, setWorkplanSearch] = useState('');
  const [workplanPriorityFilter, setWorkplanPriorityFilter] = useState<string>('ALL');

  // Department 360 Drawer State
  const [selectedDept360, setSelectedDept360] = useState<DiscoveryDepartmentWorkplanItem | null>(null);

  // Interview Workspace State
  const [interviewSessionActive, setInterviewSessionActive] = useState<boolean>(true);
  const [interviewAutosaveText, setInterviewAutosaveText] = useState<string>('Autosaved just now (v4)');
  const [activeQuestionCategory, setActiveQuestionCategory] = useState<QuestionCategory>('PROCESS');
  const [currentAnswer, setCurrentAnswer] = useState<string>(
    'The onboarding workflow is triggered when a signed offer letter is uploaded to Keka HRMS. HR Operations verifies candidate KYC documents and generates a unique Employee ID. An automated webhook then sends the profile payload to ServiceNow to initiate the IT access request.'
  );
  const [currentEvidenceNote, setCurrentEvidenceNote] = useState<string>(
    'Keka Employee Master Log #EMP-2026-9921 & Signed Employment Offer PDF'
  );
  const [validationStatus, setValidationStatus] = useState<'CONFIRMED' | 'EDITED' | 'REJECTED' | 'REQUEST_CLARIFICATION'>('CONFIRMED');
  const [showFollowUpBox, setShowFollowUpBox] = useState<boolean>(true);

  // Process Blueprint State
  const [blueprint, setBlueprint] = useState<ProcessBlueprint>(ACME_ONBOARDING_BLUEPRINT);
  const [selectedStep, setSelectedStep] = useState<ProcessStepObject | null>(ACME_ONBOARDING_BLUEPRINT.steps[3]); // Entra ID step
  const [showAddStepModal, setShowAddStepModal] = useState<boolean>(false);

  // Gaps & Conflicts State
  const [gaps, setGaps] = useState<ProcessGapItem[]>(() => organizationalDiscoveryClient.getGaps());
  const [selectedGapCategory, setSelectedGapCategory] = useState<string>('ALL');
  const [conflicts, setConflicts] = useState<DiscoveryConflict[]>([
    {
      id: 'CONFLICT-HR-001',
      tenantId: currentTenant?.id || 'SKANDA-DEMO-ENTERPRISE',
      title: 'Contradiction Detected on Control A.5.15 (MFA Enforcement)',
      affectedProcessId: 'PROC-HR-001',
      affectedControlCode: 'A.5.15',
      claimA: {
        source: 'INTERVIEW',
        claim: 'SME asserted: MFA is mandatory and enforced 100% for all users prior to initial login.',
        timestamp: '2026-10-06T10:15:00Z',
        actor: 'Rachel Green (HR Operations Manager)'
      },
      claimB: {
        source: 'SYSTEM',
        claim: 'Azure AD Telemetry Sensor detected: 3 privileged service accounts currently have MFA disabled.',
        timestamp: '2026-10-06T10:20:00Z',
        actor: 'Cloud Telemetry Ingestion Sensor'
      },
      severity: 'CRITICAL',
      status: 'OPEN',
      riskImpact: 'SME operational claim contradicts live cloud telemetry. Potential unauthorized access path on unmonitored service accounts.',
      owner: 'David Miller (IAM Lead) / Marcus Vance (CISO)'
    }
  ]);
  const [selectedConflict, setSelectedConflict] = useState<DiscoveryConflict | null>(null);

  // Documentation Studio State
  const [selectedDocType, setSelectedDocType] = useState<'POLICY' | 'PROCEDURE' | 'SOP' | 'STANDARD' | 'GUIDELINE'>('POLICY');
  const [readinessScore, setReadinessScore] = useState<number>(92);
  const [readinessTier, setReadinessTier] = useState<'READY' | 'READY_WITH_REVIEW' | 'INSUFFICIENT_CONTEXT' | 'INTERVIEW_REQUIRED'>('READY');
  const [generatedDoc, setGeneratedDoc] = useState<AuthoritativeDocument | null>(null);
  const [selectedProvenanceSection, setSelectedProvenanceSection] = useState<SectionProvenance | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState<boolean>(false);
  const [approvalConfirmedCheck, setApprovalConfirmedCheck] = useState<boolean>(false);
  const [approvalComment, setApprovalComment] = useState<string>('Approved based on verified SME interview and Entra ID telemetry.');
  const [approvalError, setApprovalError] = useState<string | null>(null);

  // Document Impact Analysis State
  const [impactReport, setImpactReport] = useState<{
    detected: boolean;
    processId: string;
    description: string;
    impactedDocs: string[];
  }>({
    detected: false,
    processId: 'PROC-HR-001',
    description: '',
    impactedDocs: []
  });

  // Selected Department Object
  const currentDept = useMemo(() => {
    return departments.find(d => d.departmentId === selectedDeptId) || departments[0];
  }, [departments, selectedDeptId]);

  // Handle Initial Tab Props
  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  // Filtered Workplan Departments
  const filteredDepartments = useMemo(() => {
    return departments.filter(d => {
      const matchSearch =
        d.departmentName.toLowerCase().includes(workplanSearch.toLowerCase()) ||
        d.ownerName.toLowerCase().includes(workplanSearch.toLowerCase()) ||
        d.departmentId.toLowerCase().includes(workplanSearch.toLowerCase());
      const matchPriority = workplanPriorityFilter === 'ALL' || d.priority === workplanPriorityFilter;
      return matchSearch && matchPriority;
    });
  }, [departments, workplanSearch, workplanPriorityFilter]);

  // Handle Generating Authoritative Document
  const handleGenerateAuthoritativeDocument = () => {
    if (readinessScore < 50) {
      alert('CANNOT_GENERATE_DOCUMENT: Readiness score is in INTERVIEW_REQUIRED status.');
      return;
    }

    const doc: AuthoritativeDocument = {
      id: `DOC-${selectedDocType}-${Date.now()}`,
      tenantId: currentTenant?.id || 'SKANDA-DEMO-ENTERPRISE',
      docType: selectedDocType,
      title: `${currentDept.departmentName} - ${blueprint.processName} ${selectedDocType === 'POLICY' ? 'Policy' : selectedDocType === 'PROCEDURE' ? 'Procedure' : 'Standard Operating Procedure'}`,
      code: `SKD-${selectedDocType.substring(0, 3)}-HR-001`,
      version: '1.0.0-DRAFT',
      processId: blueprint.processId,
      department: currentDept.departmentName,
      lifecycleStatus: 'AI_DRAFT',
      readinessScore: readinessScore,
      generatedAt: new Date().toISOString(),
      generatedBy: currentUser?.email || 'ciso@acmefintech.io',
      content: {
        purpose: `Establishes mandatory organizational standards and workflows for ${blueprint.processName} across Acme Financial Technologies in accordance with ISO 27001:2022 and ISO 27701:2019.`,
        scope: 'Applies to all permanent employees, contractors, third-party staff, and privileged administrators operating within enterprise cloud environments.',
        objectives: [
          'Enforce strict least-privilege role-based access for all new hires.',
          'Mandate MFA conditional access prior to initial account activation.',
          'Maintain complete unbroken audit logs linking HR hire events to IAM provisioning in Entra ID.'
        ],
        definitions: {
          HRIS: 'Human Resources Information System (Keka HRMS)',
          IdP: 'Identity Provider (Microsoft Entra ID)',
          MFA: 'Multi-Factor Authentication via Microsoft Authenticator App'
        },
        rolesAndResponsibilities: [
          { role: 'Hiring Manager', mandate: 'Submits job requisitions and approves requested application entitlements', r: true, a: true, c: false, i: false },
          { role: 'HR Operations Lead', mandate: 'Creates employee record in Keka and triggers ServiceNow onboarding workflow', r: true, a: true, c: true, i: false },
          { role: 'IT / IAM Administrator', mandate: 'Provisions Entra ID accounts, assigns security groups, and verifies MFA enforcement', r: true, a: false, c: false, i: true },
          { role: 'CISO / Security Architect', mandate: 'Defines access control policies, conducts periodic access reviews, and accepts risk', r: false, a: true, c: true, i: true }
        ],
        requirementsOrSteps: blueprint.steps.map(s => ({
          stepNumber: s.sequence,
          actor: s.actor,
          system: s.application,
          action: s.activity,
          expectedOutput: s.expectedOutput,
          evidenceProduced: s.evidenceSource
        })),
        controlMappings: [
          { controlCode: 'A.5.15', requirement: 'Access Control', practice: 'Role-based access approval mandatory via ServiceNow' },
          { controlCode: 'A.5.18', requirement: 'Access Rights Management', practice: 'Automated deprovisioning hook linked to Keka termination trigger' },
          { controlCode: 'A.5.34', requirement: 'Privacy and Protection of PII', practice: 'Encrypted employee records stored with restricted HR access' }
        ],
        exceptionHandling: {
          workflow: 'Temporary emergency access requests require written CISO approval and auto-expire in 72 hours.',
          approver: 'Chief Information Security Officer (CISO)',
          maxDays: 3
        },
        governanceAndReview: {
          cycle: 'ANNUAL',
          owner: 'HR Operations Manager',
          approver: 'Chief Information Security Officer'
        }
      },
      provenance: [
        {
          sectionKey: 'PURPOSE_AND_SCOPE',
          title: '1. Purpose & Organizational Scope',
          sourceType: 'APPROVED_PROCESS',
          sourceReferences: [
            { type: 'PROCESS', id: blueprint.processId, description: 'Canonical Onboarding Process Definition' },
            { type: 'FRAMEWORK', id: 'ISO_27001_2022', description: 'Clause 5.1 & Annex A.5.15' }
          ],
          aiGenerated: false,
          humanConfirmed: true,
          confidenceScore: 1.0
        },
        {
          sectionKey: 'ROLES_RACI',
          title: '2. RACI Responsibilities & Accountable Owners',
          sourceType: 'INTERVIEW',
          sourceReferences: [
            { type: 'INTERVIEW', id: 'INT-PLAN-HR-001', description: 'HR Manager & IAM Lead SME Interview Responses' }
          ],
          aiGenerated: true,
          humanConfirmed: true,
          confidenceScore: 0.98
        },
        {
          sectionKey: 'OPERATIONAL_STEPS',
          title: '3. Step-by-Step Execution Workflow',
          sourceType: 'INTERVIEW',
          sourceReferences: [
            { type: 'INTERVIEW', id: 'INT-PLAN-HR-001', description: 'Keka record creation & ServiceNow RITM trigger' },
            { type: 'SYSTEM', id: 'Keka HRMS', description: 'Verified HRIS employee master record trigger' }
          ],
          aiGenerated: true,
          humanConfirmed: true,
          confidenceScore: 0.96
        },
        {
          sectionKey: 'CONTROL_AND_EVIDENCE',
          title: '4. Control Implementations & Auditable Proof',
          sourceType: 'EVIDENCE',
          sourceReferences: [
            { type: 'CONTROL', id: 'A.5.15', description: 'MFA Conditional Access Enforcement Policy' },
            { type: 'EVIDENCE', id: 'EVIDSRC-SN-01', description: 'ServiceNow Access Request Audit Records' }
          ],
          aiGenerated: false,
          humanConfirmed: true,
          confidenceScore: 1.0
        }
      ],
      sha256Digest: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      impactedByChange: false
    };

    setGeneratedDoc(doc);
  };

  // Handle Formal Approval Transition
  const handleTransitionStatus = (targetStatus: AuthoritativeDocument['lifecycleStatus']) => {
    if (!generatedDoc) return;

    if (targetStatus === 'APPROVED' || targetStatus === 'PUBLISHED') {
      const isCisoOrAdmin =
        currentRole === 'SUPER_ADMIN' ||
        currentRole === 'COMPANY_ADMIN' ||
        String(currentRole).toUpperCase().includes('ADMIN') ||
        String(currentRole).toUpperCase().includes('CISO');
      if (!isCisoOrAdmin) {
        setApprovalError(`UNAUTHORIZED_APPROVAL: Role '${currentRole}' is not authorized to formally approve enterprise policies. CISO or Super Admin role is required.`);
        return;
      }
    }

    setGeneratedDoc(prev => {
      if (!prev) return null;
      return {
        ...prev,
        lifecycleStatus: targetStatus,
        approvedBy: targetStatus === 'APPROVED' || targetStatus === 'PUBLISHED' ? (currentUser?.email || 'ciso@acmefintech.io') : prev.approvedBy,
        approvedAt: targetStatus === 'APPROVED' || targetStatus === 'PUBLISHED' ? new Date().toISOString() : prev.approvedAt,
        publishedAt: targetStatus === 'PUBLISHED' ? new Date().toISOString() : prev.publishedAt
      };
    });
    setShowApprovalModal(false);
    setApprovalError(null);
  };

  // Handle Simulating Document Impact Analysis
  const handleTriggerImpactAnalysis = () => {
    setImpactReport({
      detected: true,
      processId: 'PROC-HR-001',
      description: 'Modified Step 002 in Onboarding: Dual hiring manager sign-off is now mandatory before IAM provisioning.',
      impactedDocs: ['SKD-POL-HR-001 (Access Control Policy)', 'SKD-SOP-HR-001 (Onboarding Standard Operating Procedure)']
    });
    if (generatedDoc) {
      setGeneratedDoc({
        ...generatedDoc,
        impactedByChange: true,
        lifecycleStatus: 'IMPACTED_BY_CHANGE'
      });
    }
  };

  return (
    <PageContainer id="organizational-discovery-workshop">
      <div className="space-y-6">
        {/* ==================================================================== */}
        {/* 1. TOP HEADER & WORKSPACE HERO                                       */}
        {/* ==================================================================== */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-slate-800 rounded-2xl shadow-2xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-xl shadow-inner">
                  <Workflow className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h1 className="text-xl font-bold text-white tracking-tight">
                      Organizational Discovery & Documentation Studio
                    </h1>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Phase 13.1 Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Enterprise Discovery Workshop • Interactive Process Blueprint • RACI & Systems Mapping • Verified Documentation Studio
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Demo Scenario Switcher & Status */}
            <div className="flex items-center space-x-3">
              <div className="px-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-xl flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-semibold text-slate-300">Acme Financial Technologies</span>
              </div>
              <button
                onClick={() => {
                  setActiveTab('interview_session');
                  setSelectedDeptId('DEP-HR-01');
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center space-x-2 transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Conduct SME Interview</span>
              </button>
            </div>
          </div>

          {/* Canonical Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mt-6 pt-5 border-t border-slate-800/80">
            <div className="p-2.5 bg-slate-950/60 border border-slate-800/60 rounded-xl">
              <div className="text-[10px] font-medium text-slate-400 uppercase">Departments</div>
              <div className="text-lg font-bold text-white mt-0.5">{metrics.totalDepartmentsInScope}</div>
            </div>
            <div className="p-2.5 bg-slate-950/60 border border-slate-800/60 rounded-xl">
              <div className="text-[10px] font-medium text-slate-400 uppercase">Processes</div>
              <div className="text-lg font-bold text-white mt-0.5">{metrics.totalProcessesDiscovered}</div>
            </div>
            <div className="p-2.5 bg-slate-950/60 border border-slate-800/60 rounded-xl">
              <div className="text-[10px] font-medium text-slate-400 uppercase">SME Coverage</div>
              <div className="text-lg font-bold text-indigo-400 mt-0.5">{metrics.smeCoveragePercentage}%</div>
            </div>
            <div className="p-2.5 bg-slate-950/60 border border-slate-800/60 rounded-xl">
              <div className="text-[10px] font-medium text-slate-400 uppercase">Process Coverage</div>
              <div className="text-lg font-bold text-sky-400 mt-0.5">{metrics.processCoveragePercentage}%</div>
            </div>
            <div className="p-2.5 bg-slate-950/60 border border-slate-800/60 rounded-xl">
              <div className="text-[10px] font-medium text-slate-400 uppercase">Control Coverage</div>
              <div className="text-lg font-bold text-teal-400 mt-0.5">{metrics.controlCoveragePercentage}%</div>
            </div>
            <div className="p-2.5 bg-slate-950/60 border border-slate-800/60 rounded-xl">
              <div className="text-[10px] font-medium text-slate-400 uppercase">Evidence Coverage</div>
              <div className="text-lg font-bold text-emerald-400 mt-0.5">{metrics.evidenceCoveragePercentage}%</div>
            </div>
            <div className="p-2.5 bg-slate-950/60 border border-slate-800/60 rounded-xl">
              <div className="text-[10px] font-medium text-slate-400 uppercase">Readiness Score</div>
              <div className="text-lg font-bold text-amber-400 mt-0.5">{metrics.overallDocumentationReadinessScore}/100</div>
            </div>
            <div className="p-2.5 bg-slate-950/60 border border-slate-800/60 rounded-xl">
              <div className="text-[10px] font-medium text-slate-400 uppercase">Open Conflicts</div>
              <div className="text-lg font-bold text-rose-400 mt-0.5">{metrics.openDiscoveryConflictsCount}</div>
            </div>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* 2. NAVIGATION TABS                                                   */}
        {/* ==================================================================== */}
        <div className="flex items-center space-x-1 border-b border-slate-800 overflow-x-auto pb-1">
          {[
            { id: 'overview', label: 'Discovery Overview', icon: BookOpen },
            { id: 'workplan', label: 'Department Workplan', icon: Users, count: departments.length },
            { id: 'interview_session', label: 'SME Interview Workspace', icon: MessageSquare, badge: 'Active' },
            { id: 'process_blueprint', label: 'Process Blueprint Mapper', icon: Workflow, badge: 'Core' },
            { id: 'overlays', label: 'Control & Evidence Overlays', icon: ShieldCheck },
            { id: 'gaps_conflicts', label: 'Gap Analysis & Conflict Center', icon: AlertTriangle, count: conflicts.length },
            { id: 'doc_studio', label: 'Documentation Studio', icon: FileText, badge: 'Authoritative' },
            { id: 'impact_analysis', label: 'Impact Analysis Cascade', icon: Cpu }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    {tab.count}
                  </span>
                )}
                {tab.badge && (
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase ${
                    isActive ? 'bg-white/20 text-white' : 'bg-indigo-500/20 text-indigo-300'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ==================================================================== */}
        {/* TAB 1: DISCOVERY OVERVIEW                                            */}
        {/* ==================================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Core Architectural Journey Flow */}
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white">The SKANDA Discovery → Assurance Lifecycle</h2>
                  <p className="text-xs text-slate-400">
                    Strict Architectural Principle: No Organizational Truth → No Authoritative Document
                  </p>
                </div>
                <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                  ISO 27001 / ISO 27701 Aligned
                </span>
              </div>

              {/* Visual Pipeline Steps */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 pt-2">
                {[
                  { step: '1. DISCOVER', desc: 'Scope & Departments', status: 'COMPLETE', color: 'emerald' },
                  { step: '2. INTERVIEW', desc: 'Structured SME Sessions', status: 'IN_PROGRESS', color: 'indigo' },
                  { step: '3. BLUEPRINT', desc: 'Process Map & RACI', status: 'VALIDATED', color: 'sky' },
                  { step: '4. OVERLAYS', desc: 'Controls & Evidence', status: 'ACTIVE', color: 'teal' },
                  { step: '5. GAP ANALYSIS', desc: 'Readiness Scoring (92%)', status: 'READY', color: 'amber' },
                  { step: '6. STUDIO', desc: 'Policy / SOP Generation', status: 'READY', color: 'indigo' },
                  { step: '7. GOVERNANCE', desc: 'CISO Formal Approval', status: 'PENDING', color: 'purple' }
                ].map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1 relative">
                    <div className="text-[11px] font-bold text-slate-200">{item.step}</div>
                    <div className="text-[10px] text-slate-400">{item.desc}</div>
                    <span className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                onClick={() => setActiveTab('interview_session')}
                className="p-5 bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-slate-800 hover:border-indigo-500/50 rounded-2xl cursor-pointer transition-all space-y-3 group"
              >
                <div className="p-3 bg-indigo-500/20 text-indigo-400 w-fit rounded-xl group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                    SME Discovery Workshop
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Conduct context-aware structured interviews with HR, IT, SecOps, and Engineering SMEs.
                  </p>
                </div>
                <div className="text-xs font-semibold text-indigo-400 flex items-center space-x-1 pt-2">
                  <span>Launch Live Session</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              <div
                onClick={() => setActiveTab('process_blueprint')}
                className="p-5 bg-gradient-to-br from-slate-900 to-sky-950/40 border border-slate-800 hover:border-sky-500/50 rounded-2xl cursor-pointer transition-all space-y-3 group"
              >
                <div className="p-3 bg-sky-500/20 text-sky-400 w-fit rounded-xl group-hover:scale-110 transition-transform">
                  <Workflow className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
                    Process Blueprint Mapper
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Model sequential activities, RACI roles, systems, controls (A.5.15), and auditable evidence.
                  </p>
                </div>
                <div className="text-xs font-semibold text-sky-400 flex items-center space-x-1 pt-2">
                  <span>View Process Map</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              <div
                onClick={() => setActiveTab('doc_studio')}
                className="p-5 bg-gradient-to-br from-slate-900 to-emerald-950/40 border border-slate-800 hover:border-emerald-500/50 rounded-2xl cursor-pointer transition-all space-y-3 group"
              >
                <div className="p-3 bg-emerald-500/20 text-emerald-400 w-fit rounded-xl group-hover:scale-110 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                    Documentation Studio
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Generate trusted Policies, Procedures & SOPs with granular provenance and CISO approval.
                  </p>
                </div>
                <div className="text-xs font-semibold text-emerald-400 flex items-center space-x-1 pt-2">
                  <span>Open Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* Department Summary Table */}
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Departmental Discovery & Readiness Summary</h3>
                  <p className="text-xs text-slate-400">Canonical status across all 6 in-scope enterprise business units</p>
                </div>
                <button
                  onClick={() => setActiveTab('workplan')}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                >
                  View Full Workplan →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800 uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Owner</th>
                      <th className="py-3 px-4">Priority</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Process Cov.</th>
                      <th className="py-3 px-4">Control Cov.</th>
                      <th className="py-3 px-4">Readiness</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {departments.map(d => (
                      <tr key={d.departmentId} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-semibold text-white flex items-center space-x-2">
                          <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{d.departmentName}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-300">{d.ownerName}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            d.priority === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300' :
                            d.priority === 'HIGH' ? 'bg-amber-500/20 text-amber-300' :
                            'bg-blue-500/20 text-blue-300'
                          }`}>
                            {d.priority}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-slate-300 font-mono text-[11px]">{d.status}</span>
                        </td>
                        <td className="py-3 px-4 text-sky-400 font-semibold">{d.processCoveragePercentage}%</td>
                        <td className="py-3 px-4 text-teal-400 font-semibold">{d.controlCoveragePercentage}%</td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-emerald-400">{d.documentationReadinessScore}/100</span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedDept360(d);
                            }}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-medium transition-colors"
                          >
                            Inspect 360
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 2: DISCOVERY WORKPLAN                                            */}
        {/* ==================================================================== */}
        {activeTab === 'workplan' && (
          <div className="space-y-6">
            {/* Filter & Action Bar */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-3 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search department, owner, or process..."
                    value={workplanSearch}
                    onChange={e => setWorkplanSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="flex items-center space-x-1.5">
                  {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map(p => (
                    <button
                      key={p}
                      onClick={() => setWorkplanPriorityFilter(p)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        workplanPriorityFilter === p
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-xs text-slate-400 font-medium">
                Showing {filteredDepartments.length} of {departments.length} departments
              </div>
            </div>

            {/* Department Workplan Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDepartments.map(dept => (
                <div
                  key={dept.departmentId}
                  className="p-5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl shadow-lg space-y-4 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Building2 className="w-4 h-4 text-indigo-400" />
                        <h3 className="text-sm font-bold text-white">{dept.departmentName}</h3>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          dept.priority === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300' :
                          dept.priority === 'HIGH' ? 'bg-amber-500/20 text-amber-300' :
                          'bg-blue-500/20 text-blue-300'
                        }`}>
                          {dept.priority}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Owner: <span className="text-slate-200 font-medium">{dept.ownerName}</span> ({dept.ownerRole})
                      </p>
                    </div>

                    <span className="text-[10px] font-mono px-2.5 py-1 rounded-md bg-slate-950 text-slate-300 border border-slate-800">
                      {dept.status}
                    </span>
                  </div>

                  {/* Coverage Progress Meters */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <div className="p-2.5 bg-slate-950/70 rounded-xl border border-slate-800/80">
                      <div className="text-[9px] text-slate-400 uppercase font-medium">Process Cov.</div>
                      <div className="text-sm font-bold text-sky-400 mt-0.5">{dept.processCoveragePercentage}%</div>
                    </div>
                    <div className="p-2.5 bg-slate-950/70 rounded-xl border border-slate-800/80">
                      <div className="text-[9px] text-slate-400 uppercase font-medium">Control Cov.</div>
                      <div className="text-sm font-bold text-teal-400 mt-0.5">{dept.controlCoveragePercentage}%</div>
                    </div>
                    <div className="p-2.5 bg-slate-950/70 rounded-xl border border-slate-800/80">
                      <div className="text-[9px] text-slate-400 uppercase font-medium">Readiness</div>
                      <div className="text-sm font-bold text-emerald-400 mt-0.5">{dept.documentationReadinessScore}/100</div>
                    </div>
                  </div>

                  {/* Discovered Processes List */}
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-semibold text-slate-300">In-Scope Processes:</div>
                    <div className="space-y-1">
                      {dept.processes.map(proc => (
                        <div
                          key={proc.id}
                          className="p-2 bg-slate-950/40 rounded-lg flex items-center justify-between text-xs text-slate-300 border border-slate-800/40"
                        >
                          <span className="font-medium truncate pr-2">{proc.name}</span>
                          <span className="text-[10px] font-bold text-indigo-400 font-mono">
                            {proc.readiness}% Ready
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Next Best Action & Actions Footer */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <div className="text-[11px] text-amber-300 font-medium flex items-center space-x-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span className="truncate max-w-[240px]">{dept.nextBestAction}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedDept360(dept)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors"
                      >
                        Inspect 360
                      </button>
                      <button
                        onClick={() => {
                          setSelectedDeptId(dept.departmentId);
                          setActiveTab('interview_session');
                        }}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow transition-colors"
                      >
                        Interview
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 3: LIVE SME INTERVIEW WORKSPACE                                  */}
        {/* ==================================================================== */}
        {activeTab === 'interview_session' && (
          <div className="space-y-6">
            {/* Interview Header Banner */}
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-bold uppercase px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Live SME Session
                  </span>
                  <span className="text-xs text-slate-400 font-mono">ID: INT-PLAN-HR-001</span>
                </div>
                <h2 className="text-base font-bold text-white">
                  {currentDept.departmentName} — {blueprint.processName}
                </h2>
                <p className="text-xs text-slate-400">
                  Target SME: <span className="text-slate-200 font-medium">Rachel Green (HR Operations Lead)</span> • Facilitator: <span className="text-slate-200 font-medium">Marcus Vance (CISO / GRC Lead)</span>
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <div className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center space-x-2 text-xs text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{interviewAutosaveText}</span>
                </div>
                <button
                  onClick={() => {
                    setValidationStatus('CONFIRMED');
                    alert('Interview response validated and saved to canonical discovery graph.');
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-600/30 flex items-center space-x-1.5 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Complete & Validate Interview</span>
                </button>
              </div>
            </div>

            {/* Main Interactive Q&A & Context Split View */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Question Experience & Answer Editor */}
              <div className="lg:col-span-2 space-y-4">
                {/* Category Navigation Pills */}
                <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
                  {(['PROCESS', 'PEOPLE', 'TECHNOLOGY', 'DATA', 'CONTROL', 'APPROVAL', 'EVIDENCE', 'EXCEPTION', 'CONTINUITY'] as QuestionCategory[]).map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveQuestionCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all whitespace-nowrap ${
                        activeQuestionCategory === cat
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Active Question Box */}
                <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 uppercase">
                          {activeQuestionCategory} DISCOVERY
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 uppercase">
                          MANDATORY
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-white pt-1">
                        {activeQuestionCategory === 'PROCESS'
                          ? 'What exact operational trigger initiates the employee onboarding and account provisioning workflow?'
                          : activeQuestionCategory === 'TECHNOLOGY'
                          ? 'Which primary HRIS, Identity Provider (IdP), and ITSM ticketing applications are utilized in this process?'
                          : activeQuestionCategory === 'CONTROL'
                          ? 'Is Multi-Factor Authentication (MFA) mandatory for all newly provisioned accounts prior to first logon?'
                          : 'What evidence artifacts and audit logs prove manager approval and access provisioning?'}
                      </h3>
                    </div>
                  </div>

                  {/* Question Context Rationale */}
                  <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl text-xs text-slate-300 flex items-start space-x-2">
                    <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-indigo-300">Why this matters: </span>
                      Required by ISO 27001:2022 A.5.15 and A.5.18 to ensure formal authorization and auditable trigger events precede any access rights assignment.
                    </div>
                  </div>

                  {/* Structured Response Capture Area */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300">SME Operational Response:</label>
                    <textarea
                      rows={4}
                      value={currentAnswer}
                      onChange={e => {
                        setCurrentAnswer(e.target.value);
                        setInterviewAutosaveText('Autosaving changes...');
                        setTimeout(() => setInterviewAutosaveText('Autosaved just now (v5)'), 600);
                      }}
                      placeholder="Capture structured explanation from SME..."
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
                    />
                  </div>

                  {/* Evidence Artifact Reference */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300">Evidence & System References:</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={currentEvidenceNote}
                        onChange={e => setCurrentEvidenceNote(e.target.value)}
                        placeholder="e.g. ServiceNow RITM Ticket ID, Entra ID Conditional Access Log"
                        className="flex-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        onClick={() => alert('Evidence artifact linked to process graph.')}
                        className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors"
                      >
                        Attach Artifact
                      </button>
                    </div>
                  </div>

                  {/* SME Explicit Response Validation Bar */}
                  <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-slate-400 font-medium">SME Validation:</span>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center space-x-1 ${
                        validationStatus === 'CONFIRMED'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{validationStatus}</span>
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setValidationStatus('CONFIRMED')}
                        className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-semibold transition-colors"
                      >
                        ✓ Confirm Accurate Practice
                      </button>
                      <button
                        onClick={() => setValidationStatus('EDITED')}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setValidationStatus('REQUEST_CLARIFICATION')}
                        className="px-3 py-1.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-semibold transition-colors"
                      >
                        Request Clarification
                      </button>
                    </div>
                  </div>
                </div>

                {/* Adaptive Follow-up Suggestions Box */}
                {showFollowUpBox && (
                  <div className="p-4 bg-indigo-950/40 border border-indigo-800/40 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-indigo-300 text-xs font-bold">
                        <Sparkles className="w-4 h-4" />
                        <span>Adaptive Follow-up Inquiries (Non-inventive AI Guardrails)</span>
                      </div>
                      <button
                        onClick={() => setShowFollowUpBox(false)}
                        className="text-slate-400 hover:text-slate-200"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-300">
                      Based on mention of <span className="font-semibold text-white">"ServiceNow IT request"</span> and <span className="font-semibold text-white">"Keka HRMS"</span>:
                    </p>
                    <ul className="text-xs text-slate-400 space-y-1 list-disc pl-5">
                      <li>Which exact ServiceNow catalog item workflow is triggered?</li>
                      <li>Who formally verifies identity credentials before the Entra ID provisioning webhook fires?</li>
                      <li>What retention schedule is applied to the signed onboarding agreement?</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Right Col: Process Context & Mapped Controls Panel */}
              <div className="space-y-4">
                <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-400" />
                    <span>Context & Control Lineage</span>
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="text-slate-400 uppercase text-[10px] font-semibold">Mapped Framework Requirements</div>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded font-mono font-bold">
                          ISO 27001 A.5.15
                        </span>
                        <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded font-mono font-bold">
                          ISO 27001 A.5.18
                        </span>
                        <span className="px-2 py-0.5 bg-sky-500/20 text-sky-300 rounded font-mono font-bold">
                          SOC 2 CC6.1
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="text-slate-400 uppercase text-[10px] font-semibold">Discovered Systems & IdPs</div>
                      <div className="space-y-1 mt-1">
                        <div className="p-2 bg-slate-950 rounded-lg flex items-center justify-between text-slate-300">
                          <span className="font-medium">Keka HRMS</span>
                          <span className="text-[10px] text-emerald-400 font-bold">Active Master</span>
                        </div>
                        <div className="p-2 bg-slate-950 rounded-lg flex items-center justify-between text-slate-300">
                          <span className="font-medium">Microsoft Entra ID</span>
                          <span className="text-[10px] text-emerald-400 font-bold">IdP / MFA</span>
                        </div>
                        <div className="p-2 bg-slate-950 rounded-lg flex items-center justify-between text-slate-300">
                          <span className="font-medium">ServiceNow ITSM</span>
                          <span className="text-[10px] text-sky-400 font-bold">Ticketing</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="text-slate-400 uppercase text-[10px] font-semibold">Identified Process Risks</div>
                      <div className="p-2.5 bg-rose-950/30 border border-rose-800/30 rounded-lg text-rose-300 mt-1">
                        <div className="font-bold">RSK-IAM-001 (Privileged Access Creep)</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Risk of unauthorized access if default role permissions exceed minimum required duties.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 4: PROCESS BLUEPRINT & VISUAL MAP                                */}
        {/* ==================================================================== */}
        {activeTab === 'process_blueprint' && (
          <div className="space-y-6">
            {/* Blueprint Header */}
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    Process Blueprint Authoritative Model
                  </span>
                  <span className="text-xs text-slate-400 font-mono">CODE: {blueprint.processId}</span>
                </div>
                <h2 className="text-base font-bold text-white">{blueprint.processName}</h2>
                <p className="text-xs text-slate-400">{blueprint.purpose}</p>
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Blueprint Validated</span>
                </span>
                <button
                  onClick={() => setActiveTab('doc_studio')}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center space-x-1.5 transition-all"
                >
                  <FileText className="w-4 h-4" />
                  <span>Generate Documentation</span>
                </button>
              </div>
            </div>

            {/* Visual Process Flow Map */}
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Visual Operational Workflow Map</h3>
                  <p className="text-xs text-slate-400">Click any step node to inspect RACI, application, control, and evidence bindings</p>
                </div>
                <span className="text-xs text-slate-400 font-mono">6 Sequential Nodes</span>
              </div>

              {/* Node Sequence Diagram */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 pt-2">
                {blueprint.steps.map((step, idx) => {
                  const isSelected = selectedStep?.stepId === step.stepId;
                  return (
                    <div
                      key={step.stepId}
                      onClick={() => setSelectedStep(step)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 relative ${
                        isSelected
                          ? 'bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/30 shadow-lg'
                          : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold font-mono text-indigo-400">
                          {step.stepId}
                        </span>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                          {step.validationStatus}
                        </span>
                      </div>

                      <div className="text-xs font-bold text-white line-clamp-2">
                        {step.activity}
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 space-y-1 text-[10px]">
                        <div className="text-slate-400">
                          Actor: <span className="text-slate-200 font-medium">{step.actor}</span>
                        </div>
                        <div className="text-slate-400">
                          System: <span className="text-sky-300 font-medium">{step.application}</span>
                        </div>
                        <div className="text-slate-400">
                          Control: <span className="text-teal-300 font-mono">{step.mappedControlCode}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Step Object Deep Inspector */}
            {selectedStep && (
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold px-2.5 py-1 bg-indigo-500/20 text-indigo-300 rounded-lg">
                      {selectedStep.stepId} Inspector
                    </span>
                    <h3 className="text-sm font-bold text-white">{selectedStep.activity}</h3>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">Source: {selectedStep.source}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs pt-2">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1">
                    <div className="text-slate-400 uppercase text-[10px] font-semibold">Accountability (RACI)</div>
                    <div className="text-slate-200 font-medium">Responsible: {selectedStep.responsibleRole}</div>
                    <div className="text-indigo-400 font-medium">Accountable: {selectedStep.accountableRole}</div>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1">
                    <div className="text-slate-400 uppercase text-[10px] font-semibold">Application & Trigger</div>
                    <div className="text-sky-300 font-medium">{selectedStep.application}</div>
                    <div className="text-slate-400 text-[11px] truncate">Trigger: {selectedStep.inputTrigger}</div>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1">
                    <div className="text-slate-400 uppercase text-[10px] font-semibold">Control & Evidence</div>
                    <div className="text-teal-300 font-mono font-bold">{selectedStep.mappedControlCode} (ISO 27001)</div>
                    <div className="text-slate-400 text-[11px] truncate">Proof: {selectedStep.evidenceSource}</div>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1">
                    <div className="text-slate-400 uppercase text-[10px] font-semibold">Risk & Exception Gate</div>
                    <div className="text-rose-300 font-medium truncate">{selectedStep.identifiedRisk}</div>
                    <div className="text-amber-400 text-[11px]">Approval Required: {selectedStep.approvalRequired ? 'YES' : 'NO'}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 5: CONTROL & EVIDENCE OVERLAYS                                   */}
        {/* ==================================================================== */}
        {activeTab === 'overlays' && (
          <div className="space-y-6">
            {/* Control Overlay Table */}
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Process → Control → Framework Lineage Overlay</h3>
                  <p className="text-xs text-slate-400">Explicit mapping of operational steps to ISO 27001:2022 and SOC 2 controls</p>
                </div>
                <span className="text-xs font-mono text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-lg border border-teal-500/20">
                  3 Controls Bound
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800 uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Control Code</th>
                      <th className="py-3 px-4">Control Title</th>
                      <th className="py-3 px-4">Owner</th>
                      <th className="py-3 px-4">Implementation Status</th>
                      <th className="py-3 px-4">Supporting Systems</th>
                      <th className="py-3 px-4">Evidence Artifact</th>
                      <th className="py-3 px-4">Validation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    <tr className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono font-bold text-teal-300">A.5.15</td>
                      <td className="py-3 px-4 text-white font-medium">Access Control & Privileged IAM</td>
                      <td className="py-3 px-4 text-slate-300">David Miller (IAM Lead)</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded font-bold text-[10px]">
                          IMPLEMENTED
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sky-300">Microsoft Entra ID, ServiceNow</td>
                      <td className="py-3 px-4 text-slate-300 font-mono text-[11px]">Entra MFA Conditional Access Log</td>
                      <td className="py-3 px-4 text-emerald-400 font-semibold">✓ Verified</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono font-bold text-teal-300">A.5.18</td>
                      <td className="py-3 px-4 text-white font-medium">Access Rights Deprovisioning Sync</td>
                      <td className="py-3 px-4 text-slate-300">Rachel Green (HR Lead)</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded font-bold text-[10px]">
                          IMPLEMENTED
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sky-300">Keka HRMS, Entra ID</td>
                      <td className="py-3 px-4 text-slate-300 font-mono text-[11px]">Keka Joiner/Leaver Audit Log</td>
                      <td className="py-3 px-4 text-emerald-400 font-semibold">✓ Verified</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono font-bold text-teal-300">A.5.34</td>
                      <td className="py-3 px-4 text-white font-medium">Privacy and Protection of PII</td>
                      <td className="py-3 px-4 text-slate-300">Harvey Specter (DPO)</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded font-bold text-[10px]">
                          IMPLEMENTED
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sky-300">Keka HRMS Encrypted DB</td>
                      <td className="py-3 px-4 text-slate-300 font-mono text-[11px]">DPDP Employee Consent Form</td>
                      <td className="py-3 px-4 text-emerald-400 font-semibold">✓ Verified</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Evidence Overlay Table */}
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Evidence Source & Retention SLA Overlay</h3>
                  <p className="text-xs text-slate-400">Automated harvesting capabilities and immutable WORM retention periods</p>
                </div>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                  Continuous Telemetry Active
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">ServiceNow Access Request & Approval Ticket</div>
                      <div className="text-[11px] text-slate-400 font-mono">ID: EVIDSRC-SN-01 • Control: A.5.15</div>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded text-[10px] font-bold">
                      AUTOMATED
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                    <div>Source: <span className="text-sky-300">ServiceNow ITSM</span></div>
                    <div>Owner: <span className="text-slate-200">IT Service Desk</span></div>
                    <div>Retention: <span className="text-emerald-300 font-mono">1,095 Days (3 Years)</span></div>
                    <div>Harvest: <span className="text-indigo-400">LIVE_CONNECTOR</span></div>
                  </div>
                </div>

                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">Microsoft Entra ID User Provisioning & MFA Log</div>
                      <div className="text-[11px] text-slate-400 font-mono">ID: EVIDSRC-ENTRA-02 • Control: A.5.15</div>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded text-[10px] font-bold">
                      LIVE STREAM
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                    <div>Source: <span className="text-sky-300">Microsoft Entra ID</span></div>
                    <div>Owner: <span className="text-slate-200">IAM Lead</span></div>
                    <div>Retention: <span className="text-emerald-300 font-mono">365 Days</span></div>
                    <div>Harvest: <span className="text-indigo-400">LIVE_CONNECTOR</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 6: GAP ANALYSIS & CONFLICT CENTER                                */}
        {/* ==================================================================== */}
        {activeTab === 'gaps_conflicts' && (
          <div className="space-y-6">
            {/* Conflict Center Banner */}
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Discovery Conflict Center</h3>
                    <p className="text-xs text-slate-400">Contradictions detected between SME interview claims and live cloud telemetry</p>
                  </div>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {conflicts.length} Action Required
                </span>
              </div>

              {/* Conflict Card */}
              {conflicts.map(conf => (
                <div key={conf.id} className="p-5 bg-slate-950 border border-rose-900/40 rounded-xl space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-rose-400 uppercase">
                        {conf.id} • SEVERITY: {conf.severity}
                      </span>
                      <h4 className="text-sm font-bold text-white mt-0.5">{conf.title}</h4>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                      {conf.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 space-y-1">
                      <div className="text-slate-400 uppercase text-[10px] font-semibold flex items-center space-x-1 text-indigo-300">
                        <MessageSquare className="w-3 h-3" />
                        <span>Source A: SME Interview Claim</span>
                      </div>
                      <div className="text-slate-200 font-medium">{conf.claimA.claim}</div>
                      <div className="text-slate-400 text-[10px]">Actor: {conf.claimA.actor}</div>
                    </div>

                    <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 space-y-1">
                      <div className="text-slate-400 uppercase text-[10px] font-semibold flex items-center space-x-1 text-rose-300">
                        <Server className="w-3 h-3" />
                        <span>Source B: Cloud Telemetry Fact</span>
                      </div>
                      <div className="text-slate-200 font-medium">{conf.claimB.claim}</div>
                      <div className="text-slate-400 text-[10px]">Actor: {conf.claimB.actor}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                    <div className="text-slate-400">
                      Owner: <span className="text-slate-200 font-medium">{conf.owner}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setConflicts(conflicts.map(c => c.id === conf.id ? { ...c, status: 'RESOLVED' } : c));
                          alert('Conflict resolved: Enforcing MFA requirement across all 3 detected service accounts.');
                        }}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors"
                      >
                        Enforce Telemetry Truth & Resolve
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Process Gap Analysis Table */}
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Process Gap Analysis (Required vs Current)</h3>
                  <p className="text-xs text-slate-400">Discovered gaps across control, evidence, documentation, and tooling</p>
                </div>
                <div className="flex items-center space-x-1">
                  {['ALL', 'EVIDENCE_GAP', 'PROCESS_GAP', 'DOCUMENTATION_GAP'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedGapCategory(cat)}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                        selectedGapCategory === cat
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {gaps
                  .filter(g => selectedGapCategory === 'ALL' || g.category === selectedGapCategory)
                  .map(gap => (
                    <div key={gap.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-indigo-400">{gap.id}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                            {gap.category}
                          </span>
                          <span className="font-semibold text-white">{gap.department}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          gap.riskSeverity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300' :
                          gap.riskSeverity === 'HIGH' ? 'bg-amber-500/20 text-amber-300' :
                          'bg-blue-500/20 text-blue-300'
                        }`}>
                          {gap.riskSeverity}
                        </span>
                      </div>

                      <p className="text-slate-300">{gap.description}</p>
                      
                      <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800/80 text-[11px] flex items-start space-x-2 text-indigo-300">
                        <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <div><span className="font-bold">Remediation: </span>{gap.recommendedRemediation}</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 7: DOCUMENTATION STUDIO                                          */}
        {/* ==================================================================== */}
        {activeTab === 'doc_studio' && (
          <div className="space-y-6">
            {/* Documentation Readiness & Selector */}
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Gated Authoritative Generation
                    </span>
                    <span className="text-xs text-slate-400 font-mono">READINESS SCORE: {readinessScore}/100</span>
                  </div>
                  <h2 className="text-base font-bold text-white">Documentation Studio & Provenance Engine</h2>
                  <p className="text-xs text-slate-400">
                    Generates organization-specific Policies, Procedures & SOPs bound to verified interview responses and cloud telemetry.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  {(['POLICY', 'PROCEDURE', 'SOP'] as const).map(dt => (
                    <button
                      key={dt}
                      onClick={() => setSelectedDocType(dt)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        selectedDocType === dt
                          ? 'bg-indigo-600 text-white shadow-lg'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {dt}
                    </button>
                  ))}
                  <button
                    onClick={handleGenerateAuthoritativeDocument}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-600/30 flex items-center space-x-1.5 transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Authoritative {selectedDocType}</span>
                  </button>
                </div>
              </div>

              {/* 12-Factor Readiness Checklist Bar */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 space-y-2">
                <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Documentation Readiness Gate (Score: {readinessScore}/100 — {readinessTier})
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 text-[11px]">
                  <div className="flex items-center space-x-1.5 text-emerald-400">
                    <Check className="w-3.5 h-3.5" /> <span>Process Owner Verified</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-emerald-400">
                    <Check className="w-3.5 h-3.5" /> <span>SME Interview Complete</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-emerald-400">
                    <Check className="w-3.5 h-3.5" /> <span>Current Practice Captured</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-emerald-400">
                    <Check className="w-3.5 h-3.5" /> <span>RACI Roles Mapped</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-emerald-400">
                    <Check className="w-3.5 h-3.5" /> <span>Systems & IdP Bound</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-emerald-400">
                    <Check className="w-3.5 h-3.5" /> <span>Evidence Sources Verified</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Generated Document Preview with Provenance */}
            {generatedDoc ? (
              <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl space-y-6">
                {/* Document Metadata Header */}
                <div className="pb-6 border-b border-slate-800 flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-indigo-400">{generatedDoc.code}</span>
                      <span className="text-xs text-slate-400 font-mono">v{generatedDoc.version}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300">
                        {generatedDoc.lifecycleStatus}
                      </span>
                      {generatedDoc.impactedByChange && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300">
                          IMPACTED BY CHANGE
                        </span>
                      )}
                    </div>
                    <h2 className="text-lg font-bold text-white">{generatedDoc.title}</h2>
                    <p className="text-xs text-slate-400">
                      Author: {generatedDoc.generatedBy} • Department: {generatedDoc.department} • Readiness: {generatedDoc.readinessScore}%
                    </p>
                  </div>

                  {/* Governance Approval Buttons */}
                  <div className="flex items-center space-x-2">
                    {generatedDoc.lifecycleStatus !== 'PUBLISHED' && (
                      <button
                        onClick={() => setShowApprovalModal(true)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-600/30 flex items-center space-x-1.5 transition-all"
                      >
                        <Award className="w-4 h-4" />
                        <span>CISO Review & Approve</span>
                      </button>
                    )}
                    <button
                      onClick={handleTriggerImpactAnalysis}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors"
                    >
                      Simulate Process Edit
                    </button>
                  </div>
                </div>

                {/* Section 1: Purpose & Scope */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">1. Purpose & Organizational Scope</h3>
                    <button
                      onClick={() => setSelectedProvenanceSection(generatedDoc.provenance[0])}
                      className="px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-lg text-[11px] font-semibold flex items-center space-x-1"
                    >
                      <Fingerprint className="w-3.5 h-3.5" />
                      <span>VIEW SOURCE</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{generatedDoc.content.purpose}</p>
                  <p className="text-xs text-slate-400 leading-relaxed">{generatedDoc.content.scope}</p>
                </div>

                {/* Section 2: Roles & RACI */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">2. RACI Responsibilities & Accountable Owners</h3>
                    <button
                      onClick={() => setSelectedProvenanceSection(generatedDoc.provenance[1])}
                      className="px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-lg text-[11px] font-semibold flex items-center space-x-1"
                    >
                      <Fingerprint className="w-3.5 h-3.5" />
                      <span>VIEW SOURCE</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    {generatedDoc.content.rolesAndResponsibilities.map((r, i) => (
                      <div key={i} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                        <div className="font-bold text-white">{r.role}</div>
                        <div className="text-slate-400">{r.mandate}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 3: Step-by-Step Execution Workflow */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">3. Step-by-Step Execution Workflow</h3>
                    <button
                      onClick={() => setSelectedProvenanceSection(generatedDoc.provenance[2])}
                      className="px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-lg text-[11px] font-semibold flex items-center space-x-1"
                    >
                      <Fingerprint className="w-3.5 h-3.5" />
                      <span>VIEW SOURCE</span>
                    </button>
                  </div>
                  <div className="space-y-2">
                    {generatedDoc.content.requirementsOrSteps.map(step => (
                      <div key={step.stepNumber} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-indigo-400">Step {step.stepNumber}: {step.actor}</span>
                          <span className="text-sky-300 font-medium">{step.system}</span>
                        </div>
                        <div className="text-slate-200">{step.action}</div>
                        <div className="text-slate-400 text-[11px]">Output: {step.expectedOutput} • Proof: {step.evidenceProduced}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 4: Control & Evidence Proof */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">4. Control Implementations & Auditable Proof</h3>
                    <button
                      onClick={() => setSelectedProvenanceSection(generatedDoc.provenance[3])}
                      className="px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-lg text-[11px] font-semibold flex items-center space-x-1"
                    >
                      <Fingerprint className="w-3.5 h-3.5" />
                      <span>VIEW SOURCE</span>
                    </button>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    {generatedDoc.content.controlMappings.map((cm, i) => (
                      <div key={i} className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
                        <span className="font-mono font-bold text-teal-300">{cm.controlCode} ({cm.requirement})</span>
                        <span className="text-slate-300">{cm.practice}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Cryptographic Hash */}
                <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 font-mono flex items-center justify-between">
                  <span>SHA256: {generatedDoc.sha256Digest}</span>
                  <span>WORM Audit Trail Immutable</span>
                </div>
              </div>
            ) : (
              <div className="p-12 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-3">
                <FileText className="w-8 h-8 text-slate-500 mx-auto" />
                <h3 className="text-sm font-bold text-white">No Document Generated Yet</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Click "Generate Authoritative {selectedDocType}" above to build the draft based on verified interview responses, process blueprint, and control mappings.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 8: DOCUMENT IMPACT ANALYSIS CASCADE                              */}
        {/* ==================================================================== */}
        {activeTab === 'impact_analysis' && (
          <div className="space-y-6">
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Organizational Change Impact Analysis Cascade</h3>
                  <p className="text-xs text-slate-400">
                    Automatically flags impacted policies, procedures, SOPs, and controls when an upstream process is modified
                  </p>
                </div>
                <button
                  onClick={handleTriggerImpactAnalysis}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow transition-colors"
                >
                  Simulate Process Change
                </button>
              </div>

              {impactReport.detected ? (
                <div className="p-5 bg-rose-950/40 border border-rose-800/40 rounded-xl space-y-3">
                  <div className="flex items-center space-x-2 text-rose-300 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4" />
                    <span>DOCUMENT IMPACT DETECTED (Process: {impactReport.processId})</span>
                  </div>
                  <p className="text-xs text-slate-300">{impactReport.description}</p>
                  
                  <div className="space-y-1.5 pt-2">
                    <div className="text-[11px] font-semibold text-slate-300 uppercase">Impacted Authoritative Documents:</div>
                    {impactReport.impactedDocs.map((docTitle, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                        <span className="text-white font-medium">{docTitle}</span>
                        <span className="text-[10px] font-bold text-amber-300">Requires Delta Review</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-8 bg-slate-950 rounded-xl text-center text-xs text-slate-400">
                  No active process changes detected. All authoritative documents match current operational reality.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* MODAL 1: VIEW SOURCE PROVENANCE MODAL                                */}
      {/* ==================================================================== */}
      {selectedProvenanceSection && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Fingerprint className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Source Provenance Inspector</h3>
              </div>
              <button
                onClick={() => setSelectedProvenanceSection(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="text-slate-400 uppercase text-[10px] font-semibold">Document Section</div>
                <div className="text-white font-bold text-sm">{selectedProvenanceSection.title}</div>
              </div>

              <div>
                <div className="text-slate-400 uppercase text-[10px] font-semibold">Source Classification</div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 font-mono">
                  {selectedProvenanceSection.sourceType}
                </span>
              </div>

              <div>
                <div className="text-slate-400 uppercase text-[10px] font-semibold">Lineage References</div>
                <div className="space-y-1.5 mt-1">
                  {selectedProvenanceSection.sourceReferences.map((ref, i) => (
                    <div key={i} className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 space-y-0.5">
                      <div className="text-indigo-300 font-bold font-mono text-[11px]">{ref.type}: {ref.id}</div>
                      <div className="text-slate-300">{ref.description}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                <div>
                  <span className="text-slate-400">Confidence Score:</span>{' '}
                  <span className="text-emerald-400 font-bold">{(selectedProvenanceSection.confidenceScore * 100).toFixed(0)}%</span>
                </div>
                <div>
                  <span className="text-slate-400">Human Confirmed:</span>{' '}
                  <span className="text-indigo-300 font-bold">{selectedProvenanceSection.humanConfirmed ? 'YES' : 'NO'}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedProvenanceSection(null)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl"
              >
                Close Provenance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 2: FORMAL CISO APPROVAL MODAL                                  */}
      {/* ==================================================================== */}
      {showApprovalModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Formal Human Governance Approval</h3>
              </div>
              <button
                onClick={() => setShowApprovalModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {approvalError && (
              <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-xl flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{approvalError}</span>
              </div>
            )}

            <div className="space-y-3 text-xs text-slate-300">
              <p>
                You are approving <span className="text-white font-bold">{generatedDoc?.title}</span> ({generatedDoc?.code}) for formal enterprise publication across Acme Financial Technologies.
              </p>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <div className="text-slate-400 text-[10px] uppercase font-semibold">Approver Details</div>
                <div>Role: <span className="text-white font-bold">{currentRole.toUpperCase()}</span></div>
                <div>Email: <span className="text-indigo-400 font-mono">{currentUser?.email || 'ciso@acmefintech.io'}</span></div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 text-[10px] uppercase font-semibold">Approval Rationale / Comment:</label>
                <input
                  type="text"
                  value={approvalComment}
                  onChange={e => setApprovalComment(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <label className="flex items-start space-x-2.5 pt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={approvalConfirmedCheck}
                  onChange={e => setApprovalConfirmedCheck(e.target.checked)}
                  className="mt-0.5 rounded bg-slate-950 border-slate-800 text-emerald-500 focus:ring-emerald-500"
                />
                <span className="text-[11px] text-slate-300 leading-snug">
                  I explicitly confirm that I have reviewed this document and verified its underlying interview, process blueprint, and evidence provenance. I approve this document for publication.
                </span>
              </label>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-2">
              <button
                onClick={() => setShowApprovalModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                disabled={!approvalConfirmedCheck}
                onClick={() => handleTransitionStatus('PUBLISHED')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-600/30 transition-all"
              >
                Publish Document
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 3: DEPARTMENT 360 DRILL-DOWN                                   */}
      {/* ==================================================================== */}
      {selectedDept360 && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">{selectedDept360.departmentName} 360 View</h3>
              </div>
              <button
                onClick={() => setSelectedDept360(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Owner</div>
                  <div className="text-white font-bold mt-0.5">{selectedDept360.ownerName}</div>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Priority</div>
                  <div className="text-indigo-400 font-bold mt-0.5">{selectedDept360.priority}</div>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Readiness</div>
                  <div className="text-emerald-400 font-bold mt-0.5">{selectedDept360.documentationReadinessScore}/100</div>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Processes</div>
                  <div className="text-sky-400 font-bold mt-0.5">{selectedDept360.processesCount}</div>
                </div>
              </div>

              <div>
                <div className="text-slate-400 uppercase text-[10px] font-semibold mb-1">Applicable Frameworks & Controls</div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedDept360.applicableFrameworks.map(f => (
                    <span key={f} className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded font-bold">
                      {f}
                    </span>
                  ))}
                  {selectedDept360.controlsInScope.map(c => (
                    <span key={c} className="px-2 py-0.5 bg-teal-500/20 text-teal-300 rounded font-mono font-bold">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-slate-400 uppercase text-[10px] font-semibold mb-1">Assigned SMEs</div>
                <div className="space-y-1">
                  {selectedDept360.smes.map((sme, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-950 rounded-lg flex items-center justify-between text-slate-300">
                      <span className="font-medium text-white">{sme.name} ({sme.role})</span>
                      <span className="text-indigo-400 font-mono text-[11px]">{sme.email}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end space-x-2">
              <button
                onClick={() => setSelectedDept360(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};
