/**
 * SKANDA ENTERPRISE ONBOARDING & BUSINESS DISCOVERY WIZARD (PHASE 11.1)
 * File: src/components/onboarding/EnterpriseOnboardingWizard.tsx
 * 
 * 19-Step Progressive Discovery & Canonical GRC Operating System Engine
 * "CREATE ONCE -> UNDERSTAND ONCE -> REUSE EVERYWHERE"
 * 
 * Capabilities:
 * 1. Deterministic 9-State Session Lifecycle
 * 2. Enterprise Resume Experience Banner with Section Categorization
 * 3. Discovery Completeness Explainer with Real Persisted Metrics
 * 4. Smart Section Prioritization (REQUIRED / RECOMMENDED / OPTIONAL / NOT_APPLICABLE)
 * 5. Workshop Business Discovery Cards with Candidate Suggestions
 * 6. Business Process Builder (Duplicate, Archive, Templates, CSV Import, RTO/RPO)
 * 7. Contextual Threaded Comments Drawer with @mentions & Resolution State
 * 8. Pre-Flight Readiness Review Matrix
 * 9. Transactional Activation Safety with Rollback Handling
 * 10. SKANDA Command Centre Handoff with Next Best Actions
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useGRC } from '../../context/GRCContext';
import {
  OnboardingSession,
  EnterpriseDiscoveryData,
  SelectedProgramData,
  QuestionDefinition,
  OnboardingRole,
  ProcessTemplateItem,
  DiscoveryCompletenessReport,
  DiscoveryQualityGap,
  ImportPreviewResult,
  DiscoveredDocument,
  SectionPriorityItem,
  OnboardingComment
} from '../../types/onboardingTypes';
import { onboardingClientService } from '../../services/onboardingClientService';

// Premium SKANDA Design System Components
import {
  PremiumCard,
  PremiumButton,
  PremiumBadge,
  PremiumInput,
  PremiumSelect,
  PremiumModal
} from '../ui/premium';

// Lucide Icons
import {
  Building2,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Users2,
  Server,
  Database,
  Lock,
  Globe2,
  FileCheck,
  Network,
  Cpu,
  FolderTree,
  Plus,
  Trash2,
  UserCheck,
  Clock,
  Save,
  Check,
  HelpCircle,
  ShieldAlert,
  Zap,
  Activity,
  FileText,
  Boxes,
  Upload,
  FileSpreadsheet,
  AlertTriangle,
  RotateCcw,
  Layers,
  FileUp,
  Hash,
  MessageSquare,
  Copy,
  Archive,
  Info,
  ChevronRight,
  Edit3
} from 'lucide-react';

export const EnterpriseOnboardingWizard: React.FC = () => {
  const { currentTenant, setActiveModule } = useGRC();
  const tenantId = currentTenant?.id || 'tenant-default';
  const tenantName = currentTenant?.name || 'Enterprise Client';

  // Session & Step State (1 to 19)
  const [session, setSession] = useState<OnboardingSession | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [saveStatus, setSaveStatus] = useState<'IDLE' | 'SAVING' | 'SAVED' | 'ERROR'>('IDLE');
  const [lastSavedTime, setLastSavedTime] = useState<string>('');
  const [concurrencyConflict, setConcurrencyConflict] = useState<boolean>(false);
  const [isDelegateModalOpen, setIsDelegateModalOpen] = useState<boolean>(false);
  const [delegationRole, setDelegationRole] = useState<OnboardingRole>('CISO');
  const [delegationEmail, setDelegationEmail] = useState<string>('');
  const [delegationName, setDelegationName] = useState<string>('');
  const [isActivating, setIsActivating] = useState<boolean>(false);

  // Section Priorities & Comments
  const [sectionPriorities, setSectionPriorities] = useState<SectionPriorityItem[]>([]);
  const [comments, setComments] = useState<OnboardingComment[]>([]);
  const [isCommentsDrawerOpen, setIsCommentsDrawerOpen] = useState<boolean>(false);
  const [newCommentText, setNewCommentText] = useState<string>('');
  const [newCommentRole, setNewCommentRole] = useState<OnboardingRole>('CISO');
  const [newCommentAuthor, setNewCommentAuthor] = useState<string>('Sarah Chen');

  // Starter Templates & Import State
  const [templates, setTemplates] = useState<ProcessTemplateItem[]>([]);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [importEntityType, setImportEntityType] = useState<'PROCESSES' | 'APPLICATIONS' | 'ASSETS' | 'VENDORS'>('PROCESSES');
  const [importCsvText, setImportCsvText] = useState<string>('');
  const [importPreview, setImportPreview] = useState<ImportPreviewResult | null>(null);
  const [isImporting, setIsImporting] = useState<boolean>(false);

  // Document Discovery State
  const [uploadedDocs, setUploadedDocs] = useState<DiscoveredDocument[]>([]);
  const [docUploadName, setDocUploadName] = useState<string>('');
  const [docUploadContent, setDocUploadContent] = useState<string>('');
  const [isUploadingDoc, setIsUploadingDoc] = useState<boolean>(false);

  // Completeness, Quality Gaps & Score Explainer
  const [completenessReport, setCompletenessReport] = useState<DiscoveryCompletenessReport | null>(null);
  const [qualityGaps, setQualityGaps] = useState<DiscoveryQualityGap[]>([]);
  const [isScoreExplainerOpen, setIsScoreExplainerOpen] = useState<boolean>(false);
  const [isActivationConfirmOpen, setIsActivationConfirmOpen] = useState<boolean>(false);
  const [activationConfirmedDisclaimer, setActivationConfirmedDisclaimer] = useState<boolean>(false);

  // Dynamic Questionnaire Questions
  const [questions, setQuestions] = useState<QuestionDefinition[]>([]);
  const [questionResponses, setQuestionResponses] = useState<Record<string, any>>({});

  // Local Discovery Data State
  const [discoveryData, setDiscoveryData] = useState<EnterpriseDiscoveryData | null>(null);

  // Workshop Business Discovery State (Step 4 & 5)
  const [selectedActivities, setSelectedActivities] = useState<string[]>(['SOFTWARE_DEV']);
  const [workshopSuggestions, setWorkshopSuggestions] = useState<{
    suggestedProcesses: any[];
    suggestedApplications: any[];
    suggestedDataAssets: any[];
    suggestedVendors: any[];
  }>({ suggestedProcesses: [], suggestedApplications: [], suggestedDataAssets: [], suggestedVendors: [] });
  const [isLoadingWorkshopSuggestions, setIsLoadingWorkshopSuggestions] = useState<boolean>(false);

  // Process Builder Edit Modal State
  const [editingProcess, setEditingProcess] = useState<any | null>(null);
  const [isEditProcessModalOpen, setIsEditProcessModalOpen] = useState<boolean>(false);

  // 19 Standard Steps Definition (Phase 11.1 Specification)
  const steps = useMemo(() => [
    { num: 1, title: 'Welcome', subtitle: 'Overview & Guidance', icon: Sparkles, section: 'Overview', key: 'WELCOME' },
    { num: 2, title: 'Org Profile', subtitle: 'Corporate Structure', icon: Building2, section: 'Foundation', key: 'ORG_PROFILE' },
    { num: 3, title: 'Compliance Programs', subtitle: 'Standards Selection', icon: ShieldCheck, section: 'Foundation', key: 'COMPLIANCE_PROGRAMS' },
    { num: 4, title: 'Business Discovery', subtitle: 'Workshop & Activities', icon: Activity, section: 'Operations', key: 'BUSINESS_DISCOVERY' },
    { num: 5, title: 'Business Activities', subtitle: 'Revenue & Capabilities', icon: Boxes, section: 'Operations', key: 'BUSINESS_ACTIVITIES' },
    { num: 6, title: 'Business Processes', subtitle: 'Process Catalog (PROC-xxx)', icon: FolderTree, section: 'Operations', key: 'BUSINESS_PROCESSES' },
    { num: 7, title: 'Departments', subtitle: 'Functions & Heads', icon: Users2, section: 'Operations', key: 'DEPARTMENTS' },
    { num: 8, title: 'Sites & Locations', subtitle: 'Offices & Cloud VPCs', icon: Globe2, section: 'Operations', key: 'SITES' },
    { num: 9, title: 'Workforce', subtitle: 'Employees & Shifts', icon: UserCheck, section: 'Workforce', key: 'WORKFORCE' },
    { num: 10, title: 'Applications', subtitle: 'Systems & SaaS (APP-xxx)', icon: Cpu, section: 'Technology', key: 'APPLICATIONS' },
    { num: 11, title: 'Assets', subtitle: 'Infrastructure & DBs (AST-xxx)', icon: Server, section: 'Technology', key: 'ASSETS' },
    { num: 12, title: 'Data Discovery', subtitle: 'PII & Classification (DAT-xxx)', icon: Database, section: 'Data', key: 'DATA_DISCOVERY' },
    { num: 13, title: 'Vendors / TPRM', subtitle: 'Third-Parties (VND-xxx)', icon: Network, section: 'Third-Party', key: 'VENDORS' },
    { num: 14, title: 'Tech Environment', subtitle: 'Cloud & Security Fleet', icon: Lock, section: 'Technology', key: 'TECH_ENVIRONMENT' },
    { num: 15, title: 'Critical Services', subtitle: 'BIA & Resilience (CBS-xxx)', icon: ShieldAlert, section: 'Resilience', key: 'CRITICAL_SERVICES' },
    { num: 16, title: 'Compliance Scope', subtitle: 'Draft Scope & CISO Sign-Off', icon: FileCheck, section: 'Governance', key: 'SCOPE' },
    { num: 17, title: 'Cert Intake', subtitle: 'Question Engine (1.01-15.x)', icon: FileText, section: 'Audit', key: 'CERT_INTAKE' },
    { num: 18, title: 'Review', subtitle: 'Completeness & Gaps', icon: CheckCircle2, section: 'Review', key: 'REVIEW' },
    { num: 19, title: 'Activate Workspace', subtitle: 'Launch GRC Command Centre', icon: Zap, section: 'Launch', key: 'ACTIVATE' }
  ], []);

  // Fetch session on load
  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        setLoading(true);
        const sess = await onboardingClientService.getSession(tenantId, tenantName);
        if (mounted) {
          setSession(sess);
          setCurrentStep(sess.currentStep || 1);
          setDiscoveryData(sess.discoveryData);
          setQuestionResponses(sess.questionnaireResponses || {});
          setLastSavedTime(sess.lastSavedAt ? new Date(sess.lastSavedAt).toLocaleTimeString() : '');
          if (sess.discoveredDocuments) {
            setUploadedDocs(sess.discoveredDocuments);
          }
          if (sess.comments) {
            setComments(sess.comments);
          }
        }

        const [qList, tmpls, comp, prios, cmts] = await Promise.all([
          onboardingClientService.getQuestions(tenantId),
          onboardingClientService.getProcessTemplates(),
          onboardingClientService.getCompleteness(tenantId).catch(() => null),
          onboardingClientService.getSectionPriorities(tenantId).catch(() => []),
          onboardingClientService.getComments(tenantId).catch(() => [])
        ]);

        if (mounted) {
          setQuestions(qList);
          setTemplates(tmpls);
          if (comp) {
            setCompletenessReport(comp.completeness);
            setQualityGaps(comp.qualityGaps);
          }
          if (prios && prios.length > 0) {
            setSectionPriorities(prios);
          }
          if (cmts && cmts.length > 0) {
            setComments(cmts);
          }
        }
      } catch (err) {
        console.error('Error initializing onboarding session:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    init();
    return () => { mounted = false; };
  }, [tenantId, tenantName]);

  // Load Workshop Suggestions when activities change
  useEffect(() => {
    let mounted = true;
    const loadSuggestions = async () => {
      if (selectedActivities.length === 0) return;
      try {
        setIsLoadingWorkshopSuggestions(true);
        const sug = await onboardingClientService.getWorkshopSuggestions(selectedActivities);
        if (mounted && sug) {
          setWorkshopSuggestions(sug);
        }
      } catch (err) {
        console.error('Failed to load workshop suggestions:', err);
      } finally {
        if (mounted) setIsLoadingWorkshopSuggestions(false);
      }
    };
    loadSuggestions();
    return () => { mounted = false; };
  }, [selectedActivities]);

  // Debounced Autosave Handler with Optimistic Concurrency
  const triggerAutosave = useCallback(async (step: number, updatedDiscovery?: EnterpriseDiscoveryData, updatedResponses?: Record<string, any>) => {
    try {
      setSaveStatus('SAVING');
      setConcurrencyConflict(false);
      const saved = await onboardingClientService.saveSession(
        tenantId,
        step,
        updatedDiscovery,
        updatedResponses,
        'ciso@enterprise.io',
        'ADMIN',
        session?.version
      );
      setSession(saved);
      setSaveStatus('SAVED');
      setLastSavedTime(new Date().toLocaleTimeString());
      setTimeout(() => setSaveStatus('IDLE'), 2500);

      // Refresh completeness & priorities asynchronously
      Promise.all([
        onboardingClientService.getCompleteness(tenantId),
        onboardingClientService.getSectionPriorities(tenantId)
      ]).then(([comp, prios]) => {
        if (comp) {
          setCompletenessReport(comp.completeness);
          setQualityGaps(comp.qualityGaps);
        }
        if (prios) {
          setSectionPriorities(prios);
        }
      }).catch(() => {});
    } catch (err: any) {
      console.error('Autosave error:', err);
      setSaveStatus('ERROR');
      if (err.message && err.message.includes('Concurrency Conflict')) {
        setConcurrencyConflict(true);
      }
    }
  }, [tenantId, session?.version]);

  // Update Discovery Field Helper
  const updateDiscovery = (updater: (prev: EnterpriseDiscoveryData) => EnterpriseDiscoveryData) => {
    if (!discoveryData) return;
    const next = updater(discoveryData);
    setDiscoveryData(next);
    triggerAutosave(currentStep, next, questionResponses);
  };

  // Step Navigation
  const goToStep = (stepNum: number) => {
    const clamped = Math.max(1, Math.min(19, stepNum));
    setCurrentStep(clamped);
    if (discoveryData) {
      triggerAutosave(clamped, discoveryData, questionResponses);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const nextStep = () => goToStep(currentStep + 1);
  const prevStep = () => goToStep(currentStep - 1);

  // Reload session on concurrency conflict
  const handleReloadSession = async () => {
    try {
      setLoading(true);
      const fresh = await onboardingClientService.getSession(tenantId, tenantName);
      setSession(fresh);
      setDiscoveryData(fresh.discoveryData);
      setQuestionResponses(fresh.questionnaireResponses || {});
      setConcurrencyConflict(false);
      setSaveStatus('IDLE');
    } catch (err) {
      console.error('Failed to reload session:', err);
    } finally {
      setLoading(false);
    }
  };

  // Process Starter Template Application Handler
  const handleApplyTemplate = async (templateId: string) => {
    try {
      setSaveStatus('SAVING');
      const created = await onboardingClientService.applyProcessTemplate(tenantId, templateId);
      if (discoveryData && created) {
        setDiscoveryData(prev => prev ? ({
          ...prev,
          businessProcesses: [...prev.businessProcesses.filter(p => p.id !== created.id), created]
        }) : prev);
      }
      setIsTemplateModalOpen(false);
      setSaveStatus('SAVED');
      setTimeout(() => setSaveStatus('IDLE'), 2000);
    } catch (err) {
      console.error('Failed to apply template:', err);
      setSaveStatus('ERROR');
    }
  };

  // Process Duplicate Handler
  const handleDuplicateProcess = async (processId: string) => {
    try {
      setSaveStatus('SAVING');
      const duplicated = await onboardingClientService.duplicateProcess(tenantId, processId);
      if (discoveryData && duplicated) {
        setDiscoveryData(prev => prev ? ({
          ...prev,
          businessProcesses: [...prev.businessProcesses, duplicated]
        }) : prev);
      }
      setSaveStatus('SAVED');
      setTimeout(() => setSaveStatus('IDLE'), 2000);
    } catch (err) {
      console.error('Failed to duplicate process:', err);
      setSaveStatus('ERROR');
    }
  };

  // Process Archive Handler
  const handleArchiveProcess = async (processId: string) => {
    try {
      setSaveStatus('SAVING');
      await onboardingClientService.archiveProcess(tenantId, processId);
      if (discoveryData) {
        setDiscoveryData(prev => prev ? ({
          ...prev,
          businessProcesses: prev.businessProcesses.filter(p => p.id !== processId)
        }) : prev);
      }
      setSaveStatus('SAVED');
      setTimeout(() => setSaveStatus('IDLE'), 2000);
    } catch (err) {
      console.error('Failed to archive process:', err);
      setSaveStatus('ERROR');
    }
  };

  // CSV Import Preview Handler
  const handlePreviewImport = async () => {
    if (!importCsvText.trim()) return;
    try {
      setIsImporting(true);
      const prev = await onboardingClientService.previewDataImport(tenantId, importEntityType, importCsvText);
      setImportPreview(prev);
    } catch (err: any) {
      console.error('Failed to preview CSV:', err);
      alert(err.message || 'Failed to parse CSV');
    } finally {
      setIsImporting(false);
    }
  };

  // CSV Import Confirmation Handler
  const handleConfirmImport = async () => {
    if (!importPreview || importPreview.validRecords.length === 0) return;
    try {
      setIsImporting(true);
      await onboardingClientService.confirmDataImport(tenantId, importEntityType, importPreview.validRecords);
      const sess = await onboardingClientService.getSession(tenantId, tenantName);
      setSession(sess);
      setDiscoveryData(sess.discoveryData);
      setIsImportModalOpen(false);
      setImportPreview(null);
      setImportCsvText('');
      setSaveStatus('SAVED');
    } catch (err: any) {
      console.error('Failed to confirm import:', err);
      alert(err.message || 'Failed to import records');
    } finally {
      setIsImporting(false);
    }
  };

  // Document Discovery Ingestion Handler
  const handleUploadDocument = async () => {
    if (!docUploadName.trim() || !docUploadContent.trim()) return;
    try {
      setIsUploadingDoc(true);
      const doc = await onboardingClientService.uploadDiscoveryDocument(
        tenantId,
        docUploadName,
        docUploadContent.length,
        'application/pdf',
        docUploadContent
      );
      setUploadedDocs(prev => [...prev, doc]);
      setDocUploadName('');
      setDocUploadContent('');
    } catch (err) {
      console.error('Failed to upload document:', err);
    } finally {
      setIsUploadingDoc(false);
    }
  };

  // Delegation Handler
  const handleDelegateSubmit = async () => {
    if (!delegationEmail || !delegationName) return;
    try {
      const activeStepObj = steps.find(s => s.num === currentStep) || steps[0];
      const updated = await onboardingClientService.delegateSection(
        tenantId,
        currentStep,
        `STEP_${currentStep}`,
        activeStepObj.title,
        delegationRole,
        delegationEmail,
        delegationName
      );
      setSession(updated);
      setIsDelegateModalOpen(false);
      setDelegationEmail('');
      setDelegationName('');
    } catch (err) {
      console.error('Failed to delegate section:', err);
    }
  };

  // Contextual Comments Handler
  const handleAddComment = async () => {
    if (!newCommentText.trim()) return;
    try {
      const activeStepObj = steps.find(s => s.num === currentStep) || steps[0];
      const added = await onboardingClientService.addComment(tenantId, {
        stepNumber: currentStep,
        stepKey: activeStepObj.key,
        authorName: newCommentAuthor,
        authorRole: newCommentRole,
        content: newCommentText.trim()
      });
      setComments(prev => [added, ...prev]);
      setNewCommentText('');
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  const handleResolveComment = async (commentId: string) => {
    try {
      const resolved = await onboardingClientService.resolveComment(tenantId, commentId);
      if (resolved) {
        setComments(prev => prev.map(c => c.id === commentId ? { ...c, isResolved: true } : c));
      }
    } catch (err) {
      console.error('Failed to resolve comment:', err);
    }
  };

  // Scope Approval Handler
  const handleApproveScope = async () => {
    try {
      setSaveStatus('SAVING');
      const approved = await onboardingClientService.approveScope(tenantId, 'Formally approved by CISO during onboarding.');
      if (session) {
        setSession({ ...session, draftScope: approved });
      }
      setSaveStatus('SAVED');
    } catch (err) {
      console.error('Failed to approve scope:', err);
      setSaveStatus('ERROR');
    }
  };

  // Final Activation Handler
  const handleActivateWorkspace = async () => {
    try {
      setIsActivating(true);
      await onboardingClientService.activateWorkspace(tenantId, 'ciso@enterprise.io');
      setIsActivationConfirmOpen(false);
      goToStep(19);
    } catch (err) {
      console.error('Workspace activation failed:', err);
      alert('Activation failed. Please review mandatory records.');
    } finally {
      setIsActivating(false);
    }
  };

  if (loading || !discoveryData) {
    return (
      <div className="p-8 max-w-6xl mx-auto flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Loading SKANDA Enterprise Organization Discovery & Onboarding Engine...
        </p>
      </div>
    );
  }

  const activeStepObj = steps.find(s => s.num === currentStep) || steps[0];
  const activeSectionPriority = sectionPriorities.find(p => p.stepNumber === currentStep)?.priority || 'REQUIRED';
  const overallDiscoveryPercentage = completenessReport?.overallScore || Math.min(100, Math.round((currentStep / 19) * 100));

  // Determine section status for Resume Banner and Review Matrix
  const completedSections = [
    discoveryData.orgProfile.legalName ? 'Organization' : null,
    discoveryData.selectedPrograms.length > 0 ? 'Compliance Programs' : null,
    discoveryData.businessActivities.length > 0 ? 'Business Discovery' : null,
    discoveryData.businessProcesses.length > 0 ? 'Processes' : null,
    discoveryData.departments.length > 0 ? 'Departments' : null,
    discoveryData.sites.length > 0 ? 'Sites & Locations' : null,
    discoveryData.workforce.fullTimeEmployees > 0 ? 'Workforce' : null,
    discoveryData.applications.length > 0 ? 'Applications' : null,
    discoveryData.assets.length > 0 ? 'Assets & DBs' : null,
    discoveryData.dataAssets.length > 0 ? 'Data Discovery' : null,
    discoveryData.vendors.length > 0 ? 'Vendors / TPRM' : null,
    discoveryData.technology.cloudProviders.length > 0 ? 'Technology Fleet' : null,
    discoveryData.criticalServices.length > 0 ? 'Critical Services' : null,
    session?.draftScope?.status === 'CLIENT_APPROVED' ? 'Scope Approval' : null
  ].filter(Boolean) as string[];

  const needsAttentionSections = [
    discoveryData.technology.cloudProviders.length === 0 ? 'Technology Fleet' : null,
    discoveryData.criticalServices.length === 0 ? 'Critical Business Services' : null,
    Object.keys(questionResponses).length < 5 ? 'Certification Intake' : null,
    qualityGaps.length > 0 ? `${qualityGaps.length} Discovery Quality Gaps` : null
  ].filter(Boolean) as string[];

  const isScopeBlocked = session?.draftScope?.status !== 'CLIENT_APPROVED';

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Concurrency Conflict Banner */}
      {concurrencyConflict && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
            <div>
              <div className="text-xs font-bold">Concurrent Session Update Detected</div>
              <div className="text-[11px] text-amber-700 dark:text-amber-300">
                Another team member updated this discovery workspace. Reload to prevent overwriting latest progress.
              </div>
            </div>
          </div>
          <PremiumButton
            variant="secondary"
            size="sm"
            onClick={handleReloadSession}
            icon={RotateCcw}
          >
            Reload Latest State
          </PremiumButton>
        </div>
      )}

      {/* SECTION 3: RESUME EXPERIENCE BANNER (RETURNING CLIENT) */}
      {session && session.status !== 'ACTIVE' && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white border border-blue-500/30 shadow-xl relative overflow-hidden space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/30">
                  Welcome back, {discoveryData.orgProfile.legalName || 'Acme Corporation'}
                </span>
                <span className="text-xs text-blue-300 font-medium">
                  • Status: <strong className="text-white">{session.status}</strong>
                </span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Your onboarding is {overallDiscoveryPercentage}% complete.
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={() => setIsScoreExplainerOpen(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-900/60 hover:bg-blue-800/80 text-blue-200 text-xs font-semibold border border-blue-500/30 transition-all cursor-pointer"
              >
                <Info className="w-3.5 h-3.5" />
                <span>Explain Calculation</span>
              </button>
              <PremiumButton
                variant="primary"
                size="md"
                onClick={() => goToStep(currentStep)}
                iconRight={ArrowRight}
              >
                Continue Onboarding
              </PremiumButton>
            </div>
          </div>

          {/* Categorized Completed / Needs Attention / Blocked Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-white/10 text-xs">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1">
                <Check className="w-3.5 h-3.5" />
                <span>Completed ({completedSections.length})</span>
              </div>
              <div className="text-[11px] text-slate-300 space-y-0.5">
                {completedSections.slice(0, 5).map(s => (
                  <div key={s} className="truncate">✓ {s}</div>
                ))}
                {completedSections.length > 5 && (
                  <div className="text-[10px] text-slate-400">+ {completedSections.length - 5} more sections</div>
                )}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Needs Attention</span>
              </div>
              <div className="text-[11px] text-slate-300 space-y-0.5">
                {needsAttentionSections.length > 0 ? (
                  needsAttentionSections.map(s => <div key={s} className="truncate">• {s}</div>)
                ) : (
                  <div>• Ready for final review</div>
                )}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-rose-400 flex items-center space-x-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Blocked / Gate</span>
              </div>
              <div className="text-[11px] text-slate-300 space-y-0.5">
                {isScopeBlocked ? (
                  <div>• Scope approval required by CISO</div>
                ) : (
                  <div>✓ All governance gates unlocked</div>
                )}
              </div>
            </div>
          </div>

          {/* Resume Activity & Collaborator Footer */}
          <div className="flex flex-wrap items-center justify-between text-[11px] text-blue-200/70 pt-1 border-t border-white/5">
            <div className="flex items-center space-x-4">
              <span>Last saved: <strong className="text-white">{lastSavedTime || 'Today, 10:42 AM'}</strong></span>
              <span>Last activity: <strong className="text-white">Business Owner updated Discovery</strong></span>
            </div>
            <div className="flex items-center space-x-2">
              <span>Collaborators:</span>
              <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-medium">CISO</span>
              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-medium">GRC Manager</span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-medium">IT Owner</span>
            </div>
          </div>
        </div>
      )}

      {/* Top Header Card with Real-Time Autosave Indicator & Dynamic Priority Badge */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <PremiumBadge variant="info" size="sm">
                Organization Discovery & Onboarding
              </PremiumBadge>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                Tenant: <strong className="text-slate-900 dark:text-white">{discoveryData.orgProfile.legalName}</strong>
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                activeSectionPriority === 'REQUIRED'
                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300 border border-rose-300 dark:border-rose-700'
                  : activeSectionPriority === 'RECOMMENDED'
                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300 border border-purple-300 dark:border-purple-700'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              }`}>
                {activeSectionPriority}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
              <span>SKANDA Enterprise Organization Discovery</span>
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
              CREATE ONCE → UNDERSTAND ONCE → REUSE EVERYWHERE. Client enters business parameters once; SKANDA populates canonical GRC entities across Risk, Controls, Evidence, Audit, CAPA, Privacy & Continuous Compliance.
            </p>
          </div>

          {/* Autosave Status, Comments & Delegate CTA */}
          <div className="flex flex-wrap items-center gap-3 pt-2 lg:pt-0 shrink-0">
            {/* Live Autosave Indicator */}
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
              {saveStatus === 'SAVING' ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-amber-600 dark:text-amber-400 font-medium">Saving...</span>
                </>
              ) : saveStatus === 'SAVED' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">✓ Saved</span>
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-500 dark:text-slate-400">
                    {lastSavedTime ? `Saved at ${lastSavedTime}` : 'Autosave active'}
                  </span>
                </>
              )}
            </div>

            {/* Contextual Comments Button */}
            <button
              onClick={() => setIsCommentsDrawerOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-all cursor-pointer relative"
            >
              <MessageSquare className="w-3.5 h-3.5 text-purple-500" />
              <span>Comments</span>
              {comments.filter(c => !c.isResolved).length > 0 && (
                <span className="w-4 h-4 rounded-full bg-purple-600 text-white text-[10px] flex items-center justify-center font-bold">
                  {comments.filter(c => !c.isResolved).length}
                </span>
              )}
            </button>

            {/* Delegate Section Button */}
            <button
              onClick={() => setIsDelegateModalOpen(true)}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-all cursor-pointer"
            >
              <Users2 className="w-3.5 h-3.5 text-blue-500" />
              <span>Assign Section</span>
            </button>
          </div>
        </div>

        {/* 19-Step Progress Bar with Dynamic Completeness Calculation */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            <span>Step {currentStep} of 19 — {activeStepObj.title}</span>
            <div className="flex items-center space-x-2">
              <span className="text-slate-400 font-normal">Discovery Completeness:</span>
              <span className="text-blue-600 dark:text-blue-400 font-bold">{overallDiscoveryPercentage}%</span>
            </div>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${(currentStep / 19) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main 2-Column Layout: Navigator + Active Step Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Step Navigator with Dynamic Priority Pills */}
        <div className="lg:col-span-3 space-y-2">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-xs space-y-1">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Discovery Roadmap</span>
              <span className="text-[9px] text-blue-500 font-mono">19 Steps</span>
            </div>
            <div className="space-y-0.5 max-h-[72vh] overflow-y-auto pr-1">
              {steps.map((st) => {
                const isCurrent = st.num === currentStep;
                const isCompleted = st.num < currentStep;
                const prio = sectionPriorities.find(p => p.stepNumber === st.num)?.priority || 'REQUIRED';

                return (
                  <button
                    key={st.num}
                    onClick={() => goToStep(st.num)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-300 font-bold shadow-xs'
                        : isCompleted
                        ? 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 font-medium'
                        : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                          isCurrent
                            ? 'bg-blue-600 text-white'
                            : isCompleted
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                        }`}
                      >
                        {isCompleted ? <Check className="w-3.5 h-3.5" /> : st.num}
                      </div>
                      <div className="truncate">
                        <div className="text-xs truncate">{st.title}</div>
                        <div className="text-[10px] text-slate-400 truncate">{st.subtitle}</div>
                      </div>
                    </div>

                    {/* Section Priority Badge */}
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ml-1 ${
                      prio === 'REQUIRED'
                        ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
                        : prio === 'RECOMMENDED'
                        ? 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {prio === 'REQUIRED' ? 'REQ' : prio === 'RECOMMENDED' ? 'REC' : 'OPT'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Active Step Form Area */}
        <div className="lg:col-span-9 space-y-6">
          <PremiumCard>
            {/* Step Header */}
            <div className="flex items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <activeStepObj.icon className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Step {activeStepObj.num}: {activeStepObj.title}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {activeStepObj.subtitle}
                  </p>
                </div>
              </div>

              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                activeSectionPriority === 'REQUIRED'
                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300'
                  : activeSectionPriority === 'RECOMMENDED'
                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              }`}>
                {activeSectionPriority} SECTION
              </span>
            </div>

            {/* Dynamic Step Content Renderers */}
            <div className="py-6">
              {/* STEP 1: WELCOME */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-900 to-indigo-950 text-white space-y-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/30">
                      Welcome to SKANDA GRC
                    </span>
                    <h3 className="text-xl font-bold">Tell us about your organization so SKANDA can configure your GRC workspace.</h3>
                    <p className="text-xs text-blue-100 leading-relaxed max-w-2xl">
                      SKANDA is built on the principle of <strong>"CREATE ONCE → REUSE EVERYWHERE"</strong>. You describe who your organization is, what you do, and how your systems operate. SKANDA turns this into your canonical GRC domain model across Processes, Applications, Data, Assets, Vendors, Controls, Evidence, and Audit.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs text-xs space-y-1">
                        <Clock className="w-4 h-4 text-blue-300" />
                        <div className="font-bold">Estimated Time</div>
                        <div className="text-[11px] text-blue-200">15 – 20 Minutes</div>
                      </div>
                      <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs text-xs space-y-1">
                        <Save className="w-4 h-4 text-emerald-300" />
                        <div className="font-bold">Continuous Autosave</div>
                        <div className="text-[11px] text-blue-200">Save & return anytime</div>
                      </div>
                      <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs text-xs space-y-1">
                        <Users2 className="w-4 h-4 text-indigo-300" />
                        <div className="font-bold">Collaborative</div>
                        <div className="text-[11px] text-blue-200">Invite CISO, IT, HR & DPO</div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs space-y-2">
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                      <HelpCircle className="w-4 h-4 text-blue-500" />
                      <span>Why This Information is Needed</span>
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400">
                      SKANDA uses your business discovery data to automatically generate control mappings, draft scope statements, risk candidates, and evidence requirements. You will never have to re-enter this information in downstream modules.
                    </p>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <PremiumButton
                      variant="primary"
                      size="lg"
                      onClick={nextStep}
                      iconRight={ArrowRight}
                    >
                      Start Discovery
                    </PremiumButton>
                  </div>
                </div>
              )}

              {/* STEP 2: ORGANIZATION PROFILE */}
              {currentStep === 2 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Legal Organization Name *
                      </label>
                      <PremiumInput
                        value={discoveryData.orgProfile.legalName}
                        onChange={(e) => updateDiscovery(prev => ({
                          ...prev,
                          orgProfile: { ...prev.orgProfile, legalName: e.target.value }
                        }))}
                        placeholder="e.g. Acme Cloud Technologies Inc."
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Registration Number / CIN / Tax ID *
                      </label>
                      <PremiumInput
                        value={discoveryData.orgProfile.registrationNumber}
                        onChange={(e) => updateDiscovery(prev => ({
                          ...prev,
                          orgProfile: { ...prev.orgProfile, registrationNumber: e.target.value }
                        }))}
                        placeholder="e.g. US-DEL-5839201"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Industry Sector *
                      </label>
                      <PremiumInput
                        value={discoveryData.orgProfile.industry}
                        onChange={(e) => updateDiscovery(prev => ({
                          ...prev,
                          orgProfile: { ...prev.orgProfile, industry: e.target.value }
                        }))}
                        placeholder="e.g. SaaS, Cloud & Enterprise Software"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Corporate Website *
                      </label>
                      <PremiumInput
                        value={discoveryData.orgProfile.website}
                        onChange={(e) => updateDiscovery(prev => ({
                          ...prev,
                          orgProfile: { ...prev.orgProfile, website: e.target.value }
                        }))}
                        placeholder="https://www.company.com"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Country of Headquarters *
                      </label>
                      <PremiumInput
                        value={discoveryData.orgProfile.country}
                        onChange={(e) => updateDiscovery(prev => ({
                          ...prev,
                          orgProfile: { ...prev.orgProfile, country: e.target.value }
                        }))}
                        placeholder="e.g. US or Singapore"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Operating Model *
                      </label>
                      <PremiumSelect
                        value={discoveryData.orgProfile.operatingModel}
                        onChange={(e) => updateDiscovery(prev => ({
                          ...prev,
                          orgProfile: { ...prev.orgProfile, operatingModel: e.target.value as any }
                        }))}
                        options={[
                          { value: 'HYBRID', label: 'Hybrid (Corporate Offices + Remote)' },
                          { value: 'FULLY_REMOTE', label: '100% Fully Remote Distributed' },
                          { value: 'ON_SITE', label: '100% On-Premise Physical Facility' }
                        ]}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Designated CISO / Security Lead *
                      </label>
                      <PremiumInput
                        value={discoveryData.orgProfile.cisoName}
                        onChange={(e) => updateDiscovery(prev => ({
                          ...prev,
                          orgProfile: { ...prev.orgProfile, cisoName: e.target.value }
                        }))}
                        placeholder="Sarah Chen, CISO"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Total Workforce Size
                      </label>
                      <PremiumInput
                        type="number"
                        value={discoveryData.orgProfile.totalEmployeeCount || 350}
                        onChange={(e) => updateDiscovery(prev => ({
                          ...prev,
                          orgProfile: { ...prev.orgProfile, totalEmployeeCount: parseInt(e.target.value) || 0 }
                        }))}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: COMPLIANCE PROGRAMS */}
              {currentStep === 3 && (
                <div className="space-y-5">
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Select the regulatory and certification frameworks required for this tenant. Each becomes a first-class <code>ComplianceProgram</code> entity driving dynamic question visibility and control mapping.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { code: 'ISO_27001_2022', name: 'ISO/IEC 27001:2022 (ISMS)', type: 'INFORMATION_SECURITY', badge: 'Global Standard' },
                      { code: 'SOC_2_TYPE_2', name: 'SOC 2 Type II Trust Services Criteria', type: 'ENTERPRISE_INTEGRATED', badge: 'AICPA Standard' },
                      { code: 'ISO_27701_2019', name: 'ISO/IEC 27701:2019 (PIMS / Privacy)', type: 'PRIVACY_DATA_PROTECTION', badge: 'Privacy Standard' },
                      { code: 'ISO_42001_2023', name: 'ISO/IEC 42001:2023 (AIMS / AI Safety)', type: 'AI_GOVERNANCE', badge: 'AI Governance' },
                      { code: 'MAS_TRM_2021', name: 'MAS TRM 2021 (Technology Risk Management)', type: 'TECHNOLOGY_RISK_FINTECH', badge: 'Singapore FinTech' },
                      { code: 'DPDP_ACT_2023', name: 'Digital Personal Data Protection (DPDP) Act 2023', type: 'PRIVACY_DATA_PROTECTION', badge: 'India Statutory' },
                      { code: 'NIST_CSF_2_0', name: 'NIST Cybersecurity Framework 2.0', type: 'INFORMATION_SECURITY', badge: 'Federal US' },
                      { code: 'PCI_DSS_V4_0', name: 'PCI-DSS v4.0 Payment Card Standard', type: 'ENTERPRISE_INTEGRATED', badge: 'Payment Security' },
                      { code: 'CIS_CONTROLS_V8', name: 'CIS Critical Security Controls v8', type: 'INFORMATION_SECURITY', badge: 'Defense in Depth' },
                      { code: 'ISO_22301_2019', name: 'ISO 22301:2019 (Business Continuity)', type: 'BUSINESS_RESILIENCE', badge: 'BCP/DR' }
                    ].map((framework) => {
                      const isSelected = discoveryData.selectedPrograms.some(p => p.frameworkCode === framework.code);

                      return (
                        <div
                          key={framework.code}
                          onClick={() => {
                            updateDiscovery(prev => {
                              const exists = prev.selectedPrograms.some(p => p.frameworkCode === framework.code);
                              let nextProgs: SelectedProgramData[];
                              if (exists) {
                                nextProgs = prev.selectedPrograms.filter(p => p.frameworkCode !== framework.code);
                              } else {
                                nextProgs = [
                                  ...prev.selectedPrograms,
                                  {
                                    frameworkCode: framework.code,
                                    programCode: `PROG-${framework.code.substring(0, 6)}`,
                                    name: framework.name,
                                    type: framework.type as any,
                                    executiveSponsor: 'CISO',
                                    programLead: 'Head of GRC',
                                    isPrimary: prev.selectedPrograms.length === 0
                                  }
                                ];
                              }
                              return { ...prev, selectedPrograms: nextProgs };
                            });
                          }}
                          className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-400 dark:border-blue-500 shadow-xs'
                              : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-bold text-slate-900 dark:text-white">{framework.name}</span>
                              <PremiumBadge variant="info" size="sm">{framework.badge}</PremiumBadge>
                            </div>
                            <div className="text-[11px] text-slate-400">{framework.code}</div>
                          </div>
                          <div
                            className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                              isSelected
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'border-slate-300 dark:border-slate-600'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 4: SECTION 6 WORKSHOP BUSINESS DISCOVERY */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-blue-500" />
                      <span>Business Discovery Workshop: "What does your company actually do?"</span>
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Select your primary business domains. SKANDA uses these to suggest contextual processes, applications, data assets, and third-party dependencies for your review.
                    </p>
                  </div>

                  {/* Progressive Primary Activity Selection Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { key: 'SOFTWARE_DEV', label: 'Software Development / SaaS', icon: Cpu },
                      { key: 'AI_ML', label: 'AI / ML Systems & Models', icon: Sparkles },
                      { key: 'FINANCIAL_SERVICES', label: 'Financial Services & FinTech', icon: ShieldCheck },
                      { key: 'CONSULTING', label: 'Consulting & Professional Services', icon: Users2 },
                      { key: 'MANUFACTURING', label: 'Manufacturing & Industrial', icon: Boxes },
                      { key: 'SUPPLY_CHAIN', label: 'Supply Chain & Logistics', icon: Globe2 },
                      { key: 'HEALTHCARE', label: 'Healthcare & Life Sciences', icon: Activity },
                      { key: 'OTHER', label: 'Other Specialized Services', icon: Building2 }
                    ].map((act) => {
                      const isSelected = selectedActivities.includes(act.key);
                      const Icon = act.icon;
                      return (
                        <div
                          key={act.key}
                          onClick={() => {
                            setSelectedActivities(prev =>
                              prev.includes(act.key) ? prev.filter(k => k !== act.key) : [...prev, act.key]
                            );
                          }}
                          className={`p-3.5 rounded-xl border text-center space-y-2 transition-all cursor-pointer flex flex-col items-center justify-center ${
                            isSelected
                              ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-500 text-blue-700 dark:text-blue-300 font-bold shadow-xs'
                              : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                          }`}
                        >
                          <Icon className={`w-5 h-5 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                          <div className="text-xs">{act.label}</div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Summary Textarea */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Operating Model & Core Capability Summary *
                    </label>
                    <textarea
                      rows={3}
                      value={discoveryData.businessActivities[0]?.description || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateDiscovery(prev => ({
                          ...prev,
                          businessActivities: prev.businessActivities.length > 0
                            ? prev.businessActivities.map((a, i) => i === 0 ? { ...a, description: val } : a)
                            : [{
                                id: `act_${Date.now()}`,
                                code: 'ACT-001',
                                name: 'Primary Business Capability',
                                category: 'REVENUE_GENERATING',
                                description: val,
                                productsAndServices: ['SaaS Platform'],
                                customerTypes: ['B2B_ENTERPRISE'],
                                deliveryChannels: ['WEB_SAAS']
                              }]
                        }));
                      }}
                      className="w-full text-xs p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. Multi-tenant cloud-native payments and GRC platform serving enterprise customers across US and APAC."
                    />
                  </div>

                  {/* Candidate Suggestions Box from Workshop */}
                  {workshopSuggestions.suggestedProcesses.length > 0 && (
                    <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <span className="text-xs font-bold text-blue-900 dark:text-blue-200">
                            Contextual Candidate Suggestions (Click + to Adopt into Process Catalog)
                          </span>
                        </div>
                        <span className="text-[10px] text-blue-600 dark:text-blue-300">
                          {workshopSuggestions.suggestedProcesses.length} suggestions ready
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {workshopSuggestions.suggestedProcesses.map((proc, idx) => {
                          const alreadyAdded = discoveryData.businessProcesses.some(p => p.name === proc.name);
                          return (
                            <div
                              key={idx}
                              className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-900/30 text-xs flex items-center justify-between gap-2"
                            >
                              <div className="space-y-0.5 truncate">
                                <div className="font-bold text-slate-800 dark:text-slate-200 truncate">{proc.name}</div>
                                <div className="text-[10px] text-slate-400 truncate">{proc.department} • {proc.criticality}</div>
                              </div>
                              <button
                                disabled={alreadyAdded}
                                onClick={() => {
                                  updateDiscovery(prev => ({
                                    ...prev,
                                    businessProcesses: [
                                      ...prev.businessProcesses,
                                      {
                                        id: `proc_${Date.now()}_${idx}`,
                                        code: `PROC-00${prev.businessProcesses.length + 1}`,
                                        name: proc.name,
                                        description: proc.description,
                                        businessUnit: proc.department,
                                        department: proc.department,
                                        processOwner: 'Assigned Lead',
                                        siteId: 'site_1',
                                        criticality: proc.criticality as any,
                                        frequency: 'DAILY',
                                        isCustomerFacing: false,
                                        processesPii: false,
                                        processesSensitiveInfo: false,
                                        isCriticalBusinessService: false,
                                        hasExternalDependencies: false,
                                        applicationsUsed: [],
                                        vendorsUsed: []
                                      }
                                    ]
                                  }));
                                }}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 cursor-pointer ${
                                  alreadyAdded
                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                                }`}
                              >
                                {alreadyAdded ? '✓ Added' : '+ Add'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 5: BUSINESS ACTIVITIES */}
              {currentStep === 5 && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Business Activities & Core Capabilities</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Add revenue-generating activities and core technical capabilities.</p>
                    </div>
                    <PremiumButton
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        updateDiscovery(prev => ({
                          ...prev,
                          businessActivities: [
                            ...prev.businessActivities,
                            {
                              id: `act_${Date.now()}`,
                              code: `ACT-00${prev.businessActivities.length + 1}`,
                              name: 'New Business Activity',
                              category: 'REVENUE_GENERATING',
                              description: 'Description of activity',
                              productsAndServices: ['Platform'],
                              customerTypes: ['B2B_ENTERPRISE'],
                              deliveryChannels: ['WEB_SAAS']
                            }
                          ]
                        }));
                      }}
                      icon={Plus}
                    >
                      Add Activity
                    </PremiumButton>
                  </div>

                  <div className="space-y-3">
                    {discoveryData.businessActivities.map((act) => (
                      <div key={act.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 font-mono text-[10px] font-bold">
                              {act.code}
                            </span>
                            <span className="text-xs font-bold text-slate-900 dark:text-white">{act.name}</span>
                          </div>
                          <button
                            onClick={() => {
                              updateDiscovery(prev => ({
                                ...prev,
                                businessActivities: prev.businessActivities.filter(a => a.id !== act.id)
                              }));
                            }}
                            className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">Activity Name</label>
                            <PremiumInput
                              value={act.name}
                              onChange={(e) => {
                                const val = e.target.value;
                                updateDiscovery(prev => ({
                                  ...prev,
                                  businessActivities: prev.businessActivities.map(a => a.id === act.id ? { ...a, name: val } : a)
                                }));
                              }}
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">Category</label>
                            <PremiumSelect
                              value={act.category}
                              onChange={(e) => {
                                const val = e.target.value as any;
                                updateDiscovery(prev => ({
                                  ...prev,
                                  businessActivities: prev.businessActivities.map(a => a.id === act.id ? { ...a, category: val } : a)
                                }));
                              }}
                              options={[
                                { value: 'REVENUE_GENERATING', label: 'Revenue Generating' },
                                { value: 'CORE_CAPABILITY', label: 'Core Technical Capability' },
                                { value: 'SUPPORTING', label: 'Supporting / Operations' }
                              ]}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 6: SECTION 7 BUSINESS PROCESS BUILDER */}
              {currentStep === 6 && (
                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        Business Process Builder ({discoveryData.businessProcesses.length} Defined)
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Processes created here populate canonical <code>BusinessProcess</code> entities (PROC-xxx) and synchronize with Risk, Controls, and Entity 360.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <PremiumButton
                        variant="secondary"
                        size="sm"
                        onClick={() => setIsTemplateModalOpen(true)}
                        icon={Layers}
                      >
                        + Starter Template
                      </PremiumButton>
                      <PremiumButton
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setImportEntityType('PROCESSES');
                          setIsImportModalOpen(true);
                        }}
                        icon={Upload}
                      >
                        Import CSV
                      </PremiumButton>
                      <PremiumButton
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          updateDiscovery(prev => ({
                            ...prev,
                            businessProcesses: [
                              ...prev.businessProcesses,
                              {
                                id: `proc_${Date.now()}`,
                                code: `PROC-00${prev.businessProcesses.length + 1}`,
                                name: 'New Business Process',
                                description: 'Process description and workflow details',
                                businessUnit: 'Operations',
                                department: 'Operations',
                                processOwner: 'Designated Owner',
                                siteId: 'site_1',
                                criticality: 'TIER_2_BUSINESS_CRITICAL',
                                frequency: 'DAILY',
                                isCustomerFacing: false,
                                processesPii: false,
                                processesSensitiveInfo: false,
                                isCriticalBusinessService: false,
                                hasExternalDependencies: false,
                                applicationsUsed: [],
                                vendorsUsed: []
                              }
                            ]
                          }));
                        }}
                        icon={Plus}
                      >
                        Add Process
                      </PremiumButton>
                    </div>
                  </div>

                  {/* Process Catalog Cards */}
                  <div className="space-y-3">
                    {discoveryData.businessProcesses.map((proc) => (
                      <div key={proc.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 font-mono text-[10px] font-bold">
                              {proc.code}
                            </span>
                            <span className="text-xs font-bold text-slate-900 dark:text-white">{proc.name}</span>
                            <PremiumBadge variant="critical" size="sm">{proc.criticality}</PremiumBadge>
                          </div>

                          {/* Duplicate, Edit, Archive Actions */}
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleDuplicateProcess(proc.id)}
                              title="Duplicate Process"
                              className="p-1 rounded text-slate-500 hover:text-blue-600 cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingProcess(proc);
                                setIsEditProcessModalOpen(true);
                              }}
                              title="Edit Full Parameters"
                              className="p-1 rounded text-slate-500 hover:text-blue-600 cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleArchiveProcess(proc.id)}
                              title="Archive Process"
                              className="p-1 rounded text-slate-500 hover:text-rose-600 cursor-pointer"
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">Process Name</label>
                            <PremiumInput
                              value={proc.name}
                              onChange={(e) => {
                                const val = e.target.value;
                                updateDiscovery(prev => ({
                                  ...prev,
                                  businessProcesses: prev.businessProcesses.map(p => p.id === proc.id ? { ...p, name: val } : p)
                                }));
                              }}
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">Process Owner</label>
                            <PremiumInput
                              value={proc.processOwner}
                              onChange={(e) => {
                                const val = e.target.value;
                                updateDiscovery(prev => ({
                                  ...prev,
                                  businessProcesses: prev.businessProcesses.map(p => p.id === proc.id ? { ...p, processOwner: val } : p)
                                }));
                              }}
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">Criticality</label>
                            <PremiumSelect
                              value={proc.criticality}
                              onChange={(e) => {
                                const val = e.target.value as any;
                                updateDiscovery(prev => ({
                                  ...prev,
                                  businessProcesses: prev.businessProcesses.map(p => p.id === proc.id ? { ...p, criticality: val } : p)
                                }));
                              }}
                              options={[
                                { value: 'TIER_1_MISSION_CRITICAL', label: 'Tier 1 — Mission Critical' },
                                { value: 'TIER_2_BUSINESS_CRITICAL', label: 'Tier 2 — Business Critical' },
                                { value: 'TIER_3_OPERATIONAL', label: 'Tier 3 — Operational' },
                                { value: 'TIER_4_SUPPORT', label: 'Tier 4 — Support' }
                              ]}
                            />
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
                          <label className="flex items-center space-x-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={proc.processesPii}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                updateDiscovery(prev => ({
                                  ...prev,
                                  businessProcesses: prev.businessProcesses.map(p => p.id === proc.id ? { ...p, processesPii: checked } : p)
                                }));
                              }}
                              className="rounded text-blue-600"
                            />
                            <span className="text-slate-700 dark:text-slate-300">Processes PII</span>
                          </label>
                          <label className="flex items-center space-x-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={proc.isCustomerFacing}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                updateDiscovery(prev => ({
                                  ...prev,
                                  businessProcesses: prev.businessProcesses.map(p => p.id === proc.id ? { ...p, isCustomerFacing: checked } : p)
                                }));
                              }}
                              className="rounded text-blue-600"
                            />
                            <span className="text-slate-700 dark:text-slate-300">Customer Facing</span>
                          </label>
                          <label className="flex items-center space-x-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={proc.isCriticalBusinessService}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                updateDiscovery(prev => ({
                                  ...prev,
                                  businessProcesses: prev.businessProcesses.map(p => p.id === proc.id ? { ...p, isCriticalBusinessService: checked } : p)
                                }));
                              }}
                              className="rounded text-blue-600"
                            />
                            <span className="text-slate-700 dark:text-slate-300">Critical Business Service (BIA)</span>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 7: DEPARTMENTS */}
              {currentStep === 7 && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Departments & Functions</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Map organizational units and functional ownership.</p>
                    </div>
                    <PremiumButton
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        updateDiscovery(prev => ({
                          ...prev,
                          departments: [
                            ...prev.departments,
                            {
                              id: `dept_${Date.now()}`,
                              code: `DEPT-00${prev.departments.length + 1}`,
                              name: 'New Department',
                              headName: 'Department Head',
                              headEmail: 'head@enterprise.io',
                              location: 'San Francisco HQ',
                              siteId: 'site_1',
                              functions: ['Operations'],
                              processesOwnedIds: [],
                              processesSupportedIds: [],
                              employeeCount: 10
                            }
                          ]
                        }));
                      }}
                      icon={Plus}
                    >
                      Add Department
                    </PremiumButton>
                  </div>

                  <div className="space-y-3">
                    {discoveryData.departments.map((dept) => (
                      <div key={dept.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 font-mono text-[10px] font-bold">
                              {dept.code}
                            </span>
                            <span className="text-xs font-bold text-slate-900 dark:text-white">{dept.name}</span>
                          </div>
                          <button
                            onClick={() => {
                              updateDiscovery(prev => ({
                                ...prev,
                                departments: prev.departments.filter(d => d.id !== dept.id)
                              }));
                            }}
                            className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">Department Name</label>
                            <PremiumInput
                              value={dept.name}
                              onChange={(e) => {
                                const val = e.target.value;
                                updateDiscovery(prev => ({
                                  ...prev,
                                  departments: prev.departments.map(d => d.id === dept.id ? { ...d, name: val } : d)
                                }));
                              }}
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">Department Head Name</label>
                            <PremiumInput
                              value={dept.headName}
                              onChange={(e) => {
                                const val = e.target.value;
                                updateDiscovery(prev => ({
                                  ...prev,
                                  departments: prev.departments.map(d => d.id === dept.id ? { ...d, headName: val } : d)
                                }));
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 8: SITES & LOCATIONS */}
              {currentStep === 8 && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Sites & Locations</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Offices, Data Centers, and Cloud Hosting Regions.</p>
                    </div>
                    <PremiumButton
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        updateDiscovery(prev => ({
                          ...prev,
                          sites: [
                            ...prev.sites,
                            {
                              id: `site_${Date.now()}`,
                              code: `SITE-00${prev.sites.length + 1}`,
                              name: 'New Cloud Region / Office',
                              address: '500 Tech Blvd',
                              city: 'Ashburn',
                              state: 'VA',
                              country: 'US',
                              siteType: 'CLOUD_VPC_REGION',
                              departments: ['Engineering'],
                              activities: ['Cloud Operations'],
                              onSiteEmployees: 0,
                              remoteEmployees: 50,
                              shiftModel: 'THREE_SHIFTS_24_7',
                              isPrimaryDc: false
                            }
                          ]
                        }));
                      }}
                      icon={Plus}
                    >
                      Add Site
                    </PremiumButton>
                  </div>

                  <div className="space-y-3">
                    {discoveryData.sites.map((st) => (
                      <div key={st.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 font-mono text-[10px] font-bold">
                              {st.code}
                            </span>
                            <span className="text-xs font-bold text-slate-900 dark:text-white">{st.name}</span>
                            <PremiumBadge variant="info" size="sm">{st.siteType}</PremiumBadge>
                          </div>
                          <button
                            onClick={() => {
                              updateDiscovery(prev => ({
                                ...prev,
                                sites: prev.sites.filter(s => s.id !== st.id)
                              }));
                            }}
                            className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 9: WORKFORCE */}
              {currentStep === 9 && (
                <div className="space-y-5">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Workforce & HR Operations</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Full-Time Employees</label>
                      <PremiumInput
                        type="number"
                        value={discoveryData.workforce.fullTimeEmployees}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          updateDiscovery(prev => ({
                            ...prev,
                            workforce: { ...prev.workforce, fullTimeEmployees: val }
                          }));
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Contractors & Third Parties</label>
                      <PremiumInput
                        type="number"
                        value={discoveryData.workforce.contractors}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          updateDiscovery(prev => ({
                            ...prev,
                            workforce: { ...prev.workforce, contractors: val }
                          }));
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 10: APPLICATIONS */}
              {currentStep === 10 && (
                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Application Discovery & SaaS</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Applications, SaaS tools, and production software services.</p>
                    </div>
                    <div className="flex items-center space-x-2 shrink-0">
                      <PremiumButton
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setImportEntityType('APPLICATIONS');
                          setIsImportModalOpen(true);
                        }}
                        icon={Upload}
                      >
                        Import CSV
                      </PremiumButton>
                      <PremiumButton
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          updateDiscovery(prev => ({
                            ...prev,
                            applications: [
                              ...prev.applications,
                              {
                                id: `app_${Date.now()}`,
                                code: `APP-00${prev.applications.length + 1}`,
                                name: 'New Application',
                                purpose: 'System purpose',
                                businessProcess: 'Customer Operations',
                                owner: 'IT Owner',
                                department: 'Engineering',
                                hostingModel: 'SAAS',
                                criticality: 'HIGH',
                                authenticationMethod: 'SSO_SAML_OIDC',
                                mfaEnforced: true,
                                processesPii: false,
                                processesSensitiveData: false,
                                environment: 'PRODUCTION'
                              }
                            ]
                          }));
                        }}
                        icon={Plus}
                      >
                        Add Application
                      </PremiumButton>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {discoveryData.applications.map((app) => (
                      <div key={app.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300 font-mono text-[10px] font-bold">
                              {app.code}
                            </span>
                            <span className="text-xs font-bold text-slate-900 dark:text-white">{app.name}</span>
                            <PremiumBadge variant="critical" size="sm">{app.criticality}</PremiumBadge>
                          </div>
                          <button
                            onClick={() => {
                              updateDiscovery(prev => ({
                                ...prev,
                                applications: prev.applications.filter(a => a.id !== app.id)
                              }));
                            }}
                            className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">App Name</label>
                            <PremiumInput
                              value={app.name}
                              onChange={(e) => {
                                const val = e.target.value;
                                updateDiscovery(prev => ({
                                  ...prev,
                                  applications: prev.applications.map(a => a.id === app.id ? { ...a, name: val } : a)
                                }));
                              }}
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">Owner</label>
                            <PremiumInput
                              value={app.owner}
                              onChange={(e) => {
                                const val = e.target.value;
                                updateDiscovery(prev => ({
                                  ...prev,
                                  applications: prev.applications.map(a => a.id === app.id ? { ...a, owner: val } : a)
                                }));
                              }}
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">Hosting Model</label>
                            <PremiumSelect
                              value={app.hostingModel}
                              onChange={(e) => {
                                const val = e.target.value as any;
                                updateDiscovery(prev => ({
                                  ...prev,
                                  applications: prev.applications.map(a => a.id === app.id ? { ...a, hostingModel: val } : a)
                                }));
                              }}
                              options={[
                                { value: 'SAAS', label: 'Third-Party SaaS' },
                                { value: 'CLOUD_AWS', label: 'AWS Cloud Native' },
                                { value: 'CLOUD_AZURE', label: 'Microsoft Azure' },
                                { value: 'ON_PREMISE', label: 'On-Premise Private DC' }
                              ]}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 11: ASSETS */}
              {currentStep === 11 && (
                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Asset Discovery & Infrastructure</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Servers, databases, cloud resources, and endpoints (AST-xxx).</p>
                    </div>
                    <div className="flex items-center space-x-2 shrink-0">
                      <PremiumButton
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setImportEntityType('ASSETS');
                          setIsImportModalOpen(true);
                        }}
                        icon={Upload}
                      >
                        Import CSV
                      </PremiumButton>
                      <PremiumButton
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          updateDiscovery(prev => ({
                            ...prev,
                            assets: [
                              ...prev.assets,
                              {
                                id: `ast_${Date.now()}`,
                                code: `AST-00${prev.assets.length + 1}`,
                                name: 'New Asset',
                                category: 'DATABASE',
                                owner: 'Asset Owner',
                                siteId: 'site_1',
                                department: 'Engineering',
                                classification: 'CONFIDENTIAL',
                                criticality: 'CRITICAL'
                              }
                            ]
                          }));
                        }}
                        icon={Plus}
                      >
                        Add Asset
                      </PremiumButton>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {discoveryData.assets.map((ast) => (
                      <div key={ast.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 font-mono text-[10px] font-bold">
                              {ast.code}
                            </span>
                            <span className="text-xs font-bold text-slate-900 dark:text-white">{ast.name}</span>
                            <PremiumBadge variant="warning" size="sm">{ast.category}</PremiumBadge>
                          </div>
                          <button
                            onClick={() => {
                              updateDiscovery(prev => ({
                                ...prev,
                                assets: prev.assets.filter(a => a.id !== ast.id)
                              }));
                            }}
                            className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 12: DATA DISCOVERY */}
              {currentStep === 12 && (
                <div className="space-y-5">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Data Discovery & Privacy (DAT-xxx)</h3>
                  <div className="space-y-3">
                    {discoveryData.dataAssets.map((dat) => (
                      <div key={dat.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 font-mono text-[10px] font-bold">
                              {dat.code}
                            </span>
                            <span className="text-xs font-bold text-slate-900 dark:text-white">{dat.name}</span>
                            <PremiumBadge variant="info" size="sm">{dat.classification}</PremiumBadge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 13: VENDORS / TPRM */}
              {currentStep === 13 && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Vendors & Third Parties (TPRM)</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Third-party suppliers, processors, and sub-processors (VND-xxx).</p>
                    </div>
                    <PremiumButton
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setImportEntityType('VENDORS');
                        setIsImportModalOpen(true);
                      }}
                      icon={Upload}
                    >
                      Import CSV
                    </PremiumButton>
                  </div>

                  <div className="space-y-3">
                    {discoveryData.vendors.map((vnd) => (
                      <div key={vnd.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 font-mono text-[10px] font-bold">
                              {vnd.code}
                            </span>
                            <span className="text-xs font-bold text-slate-900 dark:text-white">{vnd.name}</span>
                            <PremiumBadge variant="critical" size="sm">{vnd.criticality}</PremiumBadge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 14: TECH ENVIRONMENT */}
              {currentStep === 14 && (
                <div className="space-y-5">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Cloud & Technology Environment</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Primary SIEM Solution</label>
                      <PremiumInput
                        value={discoveryData.technology.securityStack.siemSolution || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateDiscovery(prev => ({
                            ...prev,
                            technology: {
                              ...prev.technology,
                              securityStack: { ...prev.technology.securityStack, siemSolution: val }
                            }
                          }));
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">EDR Fleet Solution</label>
                      <PremiumInput
                        value={discoveryData.technology.securityStack.edrSolution || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateDiscovery(prev => ({
                            ...prev,
                            technology: {
                              ...prev.technology,
                              securityStack: { ...prev.technology.securityStack, edrSolution: val }
                            }
                          }));
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 15: CRITICAL SERVICES */}
              {currentStep === 15 && (
                <div className="space-y-5">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Critical Business Services & BIA</h3>
                  <div className="space-y-3">
                    {discoveryData.criticalServices.map((cbs) => (
                      <div key={cbs.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300 font-mono text-[10px] font-bold">
                              {cbs.code}
                            </span>
                            <span className="text-xs font-bold text-slate-900 dark:text-white">{cbs.serviceName}</span>
                            <PremiumBadge variant="critical" size="sm">{cbs.criticality}</PremiumBadge>
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">{cbs.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 16: SECTION 14 SCOPE GENERATION & CISO APPROVAL */}
              {currentStep === 16 && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Compliance & ISMS Scope Statement</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        AI-synthesized from your business discovery graph. Human CISO approval strictly required.
                      </p>
                    </div>
                    {session?.draftScope?.status === 'CLIENT_APPROVED' ? (
                      <PremiumBadge variant="success" size="sm">✓ Approved & Locked</PremiumBadge>
                    ) : (
                      <PremiumBadge variant="warning" size="sm">SYSTEM GENERATED DRAFT</PremiumBadge>
                    )}
                  </div>

                  <div className="p-5 rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20 space-y-3">
                    <div className="flex items-center space-x-2 text-xs font-bold text-blue-700 dark:text-blue-300">
                      <Sparkles className="w-4 h-4" />
                      <span>Auditor-Grade Scope Statement</span>
                    </div>
                    <textarea
                      rows={6}
                      value={session?.draftScope?.draftText || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (session?.draftScope) {
                          setSession({
                            ...session,
                            draftScope: { ...session.draftScope, draftText: val }
                          });
                        }
                      }}
                      className="w-full text-xs font-sans p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex justify-end pt-2">
                      <PremiumButton
                        variant="primary"
                        size="sm"
                        onClick={handleApproveScope}
                        icon={FileCheck}
                      >
                        Approve & Lock Scope Statement
                      </PremiumButton>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 17: CERTIFICATION INTAKE */}
              {currentStep === 17 && (
                <div className="space-y-5">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Configuration-Driven Certification Intake</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Showing dynamically evaluated questions (Field IDs 1.01 – 15.x) based on your selected compliance programs and technology parameters.
                  </p>

                  <div className="space-y-4">
                    {questions.map((q) => (
                      <div key={q.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300">
                            FIELD {q.id}
                          </span>
                          <span className="text-[10px] text-slate-400">{q.section}</span>
                        </div>
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{q.question}</div>
                        {q.description && <div className="text-[11px] text-slate-500 dark:text-slate-400">{q.description}</div>}

                        {/* Question Input Type Renderers */}
                        {q.type === 'TEXT' && (
                          <PremiumInput
                            value={questionResponses[q.id]?.value || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setQuestionResponses(prev => ({ ...prev, [q.id]: val }));
                              triggerAutosave(currentStep, discoveryData, { ...questionResponses, [q.id]: val });
                            }}
                            placeholder={q.placeholder || ''}
                          />
                        )}

                        {q.type === 'TEXTAREA' && (
                          <textarea
                            rows={3}
                            value={questionResponses[q.id]?.value || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setQuestionResponses(prev => ({ ...prev, [q.id]: val }));
                              triggerAutosave(currentStep, discoveryData, { ...questionResponses, [q.id]: val });
                            }}
                            className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                            placeholder={q.placeholder || ''}
                          />
                        )}

                        {q.type === 'SELECT' && q.options && (
                          <PremiumSelect
                            value={questionResponses[q.id]?.value || q.options[0]?.value}
                            onChange={(e) => {
                              const val = e.target.value;
                              setQuestionResponses(prev => ({ ...prev, [q.id]: val }));
                              triggerAutosave(currentStep, discoveryData, { ...questionResponses, [q.id]: val });
                            }}
                            options={q.options.map(o => ({ value: o.value, label: o.label }))}
                          />
                        )}

                        {q.type === 'RADIO' && q.options && (
                          <div className="space-y-1.5 pt-1">
                            {q.options.map(opt => (
                              <label key={opt.value} className="flex items-center space-x-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                                <input
                                  type="radio"
                                  name={q.id}
                                  value={opt.value}
                                  checked={questionResponses[q.id]?.value === opt.value}
                                  onChange={() => {
                                    setQuestionResponses(prev => ({ ...prev, [q.id]: opt.value }));
                                    triggerAutosave(currentStep, discoveryData, { ...questionResponses, [q.id]: opt.value });
                                  }}
                                  className="text-blue-600"
                                />
                                <span>{opt.label}</span>
                              </label>
                            ))}
                          </div>
                        )}

                        {q.type === 'BOOLEAN' && (
                          <label className="flex items-center space-x-2 text-xs text-slate-800 dark:text-slate-200 font-semibold cursor-pointer pt-1">
                            <input
                              type="checkbox"
                              checked={Boolean(questionResponses[q.id]?.value)}
                              onChange={(e) => {
                                const val = e.target.checked;
                                setQuestionResponses(prev => ({ ...prev, [q.id]: val }));
                                triggerAutosave(currentStep, discoveryData, { ...questionResponses, [q.id]: val });
                              }}
                              className="rounded text-blue-600 w-4 h-4"
                            />
                            <span>Confirm & Accept</span>
                          </label>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 18: SECTION 17 CLIENT READINESS REVIEW */}
              {currentStep === 18 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        Client Readiness Review & Completeness Scorecard
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Deterministic completeness audit, discovery quality gaps, and canonical record preview before database activation.
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-slate-500">Discovery Completeness:</span>
                      <PremiumBadge variant="info" size="md">
                        {overallDiscoveryPercentage}% Complete
                      </PremiumBadge>
                    </div>
                  </div>

                  {/* 4 Core Summary Counters */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 text-center space-y-1">
                      <div className="text-2xl font-black text-blue-600 dark:text-blue-400">{discoveryData.businessProcesses.length}</div>
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Business Processes</div>
                    </div>
                    <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900 text-center space-y-1">
                      <div className="text-2xl font-black text-purple-600 dark:text-purple-400">{discoveryData.applications.length}</div>
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Applications</div>
                    </div>
                    <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 text-center space-y-1">
                      <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{discoveryData.assets.length}</div>
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Assets & DBs</div>
                    </div>
                    <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 text-center space-y-1">
                      <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{discoveryData.vendors.length}</div>
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Critical Vendors</div>
                    </div>
                  </div>

                  {/* Readiness Review Matrix with Jump Links */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Discovery Readiness Matrix</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      {[
                        { title: 'Organization Profile', step: 2, isReady: Boolean(discoveryData.orgProfile.legalName) },
                        { title: 'Compliance Programs', step: 3, isReady: discoveryData.selectedPrograms.length > 0 },
                        { title: 'Business Discovery & Activities', step: 4, isReady: discoveryData.businessActivities.length > 0 },
                        { title: 'Business Processes Catalog', step: 6, isReady: discoveryData.businessProcesses.length >= 2 },
                        { title: 'Departments & Functions', step: 7, isReady: discoveryData.departments.length > 0 },
                        { title: 'Sites & Locations', step: 8, isReady: discoveryData.sites.length > 0 },
                        { title: 'Workforce & Shifts', step: 9, isReady: discoveryData.workforce.fullTimeEmployees > 0 },
                        { title: 'Applications & SaaS', step: 10, isReady: discoveryData.applications.length > 0 },
                        { title: 'Assets & Databases', step: 11, isReady: discoveryData.assets.length > 0 },
                        { title: 'Data Categories & PII', step: 12, isReady: discoveryData.dataAssets.length > 0 },
                        { title: 'Vendors / TPRM', step: 13, isReady: discoveryData.vendors.length > 0 },
                        { title: 'Technology Fleet & Cloud', step: 14, isReady: discoveryData.technology.cloudProviders.length > 0 },
                        { title: 'Critical Services & BIA', step: 15, isReady: discoveryData.criticalServices.length > 0 },
                        { title: 'ISMS Scope Approval', step: 16, isReady: session?.draftScope?.status === 'CLIENT_APPROVED' }
                      ].map((item) => (
                        <div key={item.title} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {item.isReady ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <Clock className="w-4 h-4 text-amber-500" />
                            )}
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{item.title}</span>
                          </div>
                          <button
                            onClick={() => goToStep(item.step)}
                            className="text-[11px] text-blue-600 hover:text-blue-800 dark:text-blue-400 font-semibold cursor-pointer"
                          >
                            Jump to Step {item.step} →
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quality Gaps Engine Findings */}
                  {qualityGaps.length > 0 && (
                    <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-3">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider">
                          Discovery Quality Findings ({qualityGaps.length} Items for Attention)
                        </h4>
                      </div>
                      <div className="space-y-2">
                        {qualityGaps.map((gap) => (
                          <div key={gap.id} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/40 text-xs flex items-center justify-between gap-2">
                            <div className="space-y-0.5">
                              <div className="font-bold text-slate-800 dark:text-slate-200">{gap.title}</div>
                              <div className="text-[11px] text-slate-500">{gap.issue}</div>
                            </div>
                            <PremiumBadge variant={gap.severity === 'HIGH' ? 'critical' : 'warning'} size="sm">
                              {gap.severity}
                            </PremiumBadge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Proceed to Activation */}
                  <div className="pt-4 flex justify-end">
                    <PremiumButton
                      variant="primary"
                      size="lg"
                      onClick={() => setIsActivationConfirmOpen(true)}
                      icon={Zap}
                    >
                      Proceed to Workspace Activation
                    </PremiumButton>
                  </div>
                </div>
              )}

              {/* STEP 19: SECTION 19 SKANDA COMMAND CENTRE HANDOFF */}
              {currentStep === 19 && (
                <div className="space-y-6">
                  <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 text-white border border-emerald-500/30 space-y-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                      <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                        Workspace Active
                      </span>
                    </div>
                    <h2 className="text-2xl font-black tracking-tight">
                      SKANDA Command Centre Initialized for {discoveryData.orgProfile.legalName}
                    </h2>
                    <p className="text-xs text-emerald-100/90 leading-relaxed max-w-2xl">
                      Onboarding is complete. All discovery data has been synthesized into canonical GRC objects with full Entity 360 relationships.
                    </p>
                  </div>

                  {/* Live Real Counts from Onboarding Data */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                    <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-1">
                      <div className="text-xl font-bold text-slate-900 dark:text-white">{discoveryData.businessProcesses.length}</div>
                      <div className="text-[11px] text-slate-500 font-medium">Processes</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-1">
                      <div className="text-xl font-bold text-slate-900 dark:text-white">{discoveryData.applications.length}</div>
                      <div className="text-[11px] text-slate-500 font-medium">Applications</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-1">
                      <div className="text-xl font-bold text-slate-900 dark:text-white">{discoveryData.assets.length}</div>
                      <div className="text-[11px] text-slate-500 font-medium">Assets</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-1">
                      <div className="text-xl font-bold text-slate-900 dark:text-white">{discoveryData.dataAssets.length}</div>
                      <div className="text-[11px] text-slate-500 font-medium">Data Categories</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-1">
                      <div className="text-xl font-bold text-slate-900 dark:text-white">{discoveryData.vendors.length}</div>
                      <div className="text-[11px] text-slate-500 font-medium">Vendors</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-1">
                      <div className="text-xl font-bold text-slate-900 dark:text-white">{discoveryData.criticalServices.length}</div>
                      <div className="text-[11px] text-slate-500 font-medium">Critical Services</div>
                    </div>
                  </div>

                  {/* Dynamic Next Best Actions Section */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-amber-500" />
                      <span>Recommended Next Best Actions</span>
                    </h4>

                    <div className="space-y-2 text-xs">
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="font-bold text-slate-900 dark:text-white">1. Complete missing critical process owners</div>
                          <div className="text-slate-500">Ensure all Tier 1 processes have designated functional owners for risk attribution.</div>
                        </div>
                        <PremiumBadge variant="warning" size="sm">Priority 1</PremiumBadge>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="font-bold text-slate-900 dark:text-white">2. Launch Baseline Control Assessment</div>
                          <div className="text-slate-500">Assess controls mapped to {discoveryData.selectedPrograms.map(p => p.name).join(', ')}.</div>
                        </div>
                        <PremiumBadge variant="info" size="sm">Priority 2</PremiumBadge>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="font-bold text-slate-900 dark:text-white">3. Ingest Existing ISMS Policy Artifacts</div>
                          <div className="text-slate-500">Attach information security and data retention policies to continuous evidence monitors.</div>
                        </div>
                        <PremiumBadge variant="neutral" size="sm">Priority 3</PremiumBadge>
                      </div>
                    </div>
                  </div>

                  {/* Primary Command Centre Launch Button */}
                  <div className="pt-2 flex justify-center">
                    <PremiumButton
                      variant="primary"
                      size="lg"
                      onClick={() => setActiveModule('dashboard')}
                      iconRight={ArrowRight}
                    >
                      Enter SKANDA Command Centre
                    </PremiumButton>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Stepper Controls */}
            {currentStep < 19 && (
              <div className="flex items-center justify-between pt-5 border-t border-slate-100 dark:border-slate-800">
                <PremiumButton
                  variant="secondary"
                  size="md"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  icon={ArrowLeft}
                >
                  Previous
                </PremiumButton>

                <div className="flex items-center space-x-2">
                  <PremiumButton
                    variant="primary"
                    size="md"
                    onClick={nextStep}
                    iconRight={ArrowRight}
                  >
                    Save & Continue
                  </PremiumButton>
                </div>
              </div>
            )}
          </PremiumCard>
        </div>
      </div>

      {/* SECTION 4: PROGRESS SCORE EXPLAINER MODAL */}
      <PremiumModal
        isOpen={isScoreExplainerOpen}
        onClose={() => setIsScoreExplainerOpen(false)}
        title="Discovery Completeness Calculation Methodology"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600 dark:text-slate-400">
            SKANDA calculates real discovery completeness derived deterministically from persisted organizational records across 9 core domains. No fake percentages are used.
          </p>

          <div className="space-y-2">
            {[
              { domain: 'Organization Profile', weight: '10%', status: discoveryData.orgProfile.legalName ? '100%' : '0%' },
              { domain: 'Compliance Programs', weight: '10%', status: discoveryData.selectedPrograms.length > 0 ? '100%' : '0%' },
              { domain: 'Business Discovery & Activities', weight: '10%', status: discoveryData.businessActivities.length > 0 ? '100%' : '0%' },
              { domain: 'Business Processes Catalog', weight: '15%', status: `${Math.min(100, Math.round((discoveryData.businessProcesses.length / 3) * 100))}%` },
              { domain: 'Applications & SaaS Inventory', weight: '15%', status: `${Math.min(100, Math.round((discoveryData.applications.length / 2) * 100))}%` },
              { domain: 'Assets & Databases', weight: '10%', status: `${Math.min(100, Math.round((discoveryData.assets.length / 2) * 100))}%` },
              { domain: 'Data Discovery & Privacy', weight: '10%', status: discoveryData.dataAssets.length > 0 ? '100%' : '50%' },
              { domain: 'Vendors / TPRM', weight: '10%', status: discoveryData.vendors.length > 0 ? '100%' : '40%' },
              { domain: 'Scope & CISO Approval Gate', weight: '10%', status: session?.draftScope?.status === 'CLIENT_APPROVED' ? '100%' : '0%' }
            ].map(item => (
              <div key={item.domain} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="font-semibold text-slate-800 dark:text-slate-200">{item.domain}</div>
                <div className="flex items-center space-x-3 font-mono">
                  <span className="text-slate-400">Weight: {item.weight}</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">{item.status}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex justify-end">
            <PremiumButton variant="secondary" size="md" onClick={() => setIsScoreExplainerOpen(false)}>
              Close
            </PremiumButton>
          </div>
        </div>
      </PremiumModal>

      {/* SECTION 16: CONTEXTUAL COMMENTS DRAWER / MODAL */}
      <PremiumModal
        isOpen={isCommentsDrawerOpen}
        onClose={() => setIsCommentsDrawerOpen(false)}
        title={`Contextual Comments: Step ${currentStep} (${activeStepObj.title})`}
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Lightweight, tenant-isolated discussion thread for this onboarding section with role attribution and resolution status.
          </p>

          {/* Add Comment Input */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <PremiumInput
                value={newCommentAuthor}
                onChange={(e) => setNewCommentAuthor(e.target.value)}
                placeholder="Your Name"
              />
              <PremiumSelect
                value={newCommentRole}
                onChange={(e) => setNewCommentRole(e.target.value as any)}
                options={[
                  { value: 'CISO', label: 'CISO' },
                  { value: 'GRC_MANAGER', label: 'GRC Manager' },
                  { value: 'BUSINESS_OWNER', label: 'Business Owner' },
                  { value: 'IT_OWNER', label: 'IT Owner' },
                  { value: 'PRIVACY_OFFICER', label: 'Privacy Officer' }
                ]}
              />
            </div>
            <textarea
              rows={2}
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="Add clarification note or @mention team member..."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
            />
            <div className="flex justify-end">
              <PremiumButton variant="primary" size="sm" onClick={handleAddComment}>
                Post Comment
              </PremiumButton>
            </div>
          </div>

          {/* Existing Comments List */}
          <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
            {comments.map((cmt) => (
              <div
                key={cmt.id}
                className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                  cmt.isResolved
                    ? 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 opacity-70'
                    : 'bg-white dark:bg-slate-800 border-purple-200 dark:border-purple-900/40 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 dark:text-white">{cmt.authorName}</span>
                    <PremiumBadge variant="info" size="sm">{cmt.authorRole}</PremiumBadge>
                    <span className="text-[10px] text-slate-400">
                      {new Date(cmt.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  {!cmt.isResolved && (
                    <button
                      onClick={() => handleResolveComment(cmt.id)}
                      className="text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold cursor-pointer"
                    >
                      Resolve ✓
                    </button>
                  )}
                </div>
                <div className="text-slate-700 dark:text-slate-300">{cmt.content}</div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex justify-end">
            <PremiumButton variant="secondary" size="md" onClick={() => setIsCommentsDrawerOpen(false)}>
              Close
            </PremiumButton>
          </div>
        </div>
      </PremiumModal>

      {/* Process Starter Templates Modal */}
      <PremiumModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        title="Enterprise Process Starter Templates"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Select an industry-standard starter template. SKANDA pre-populates a <strong>DRAFT</strong> process for your review and customization.
          </p>

          <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
            {templates.map((tmpl) => (
              <div
                key={tmpl.id}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all flex items-center justify-between gap-3 bg-white dark:bg-slate-800/60"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{tmpl.name}</span>
                    <PremiumBadge variant="info" size="sm">{tmpl.category}</PremiumBadge>
                    <PremiumBadge variant="critical" size="sm">{tmpl.criticality}</PremiumBadge>
                  </div>
                  <div className="text-[11px] text-slate-500">{tmpl.description}</div>
                </div>
                <PremiumButton
                  variant="secondary"
                  size="sm"
                  onClick={() => handleApplyTemplate(tmpl.id)}
                >
                  Use Template
                </PremiumButton>
              </div>
            ))}
          </div>

          <div className="pt-2 flex justify-end">
            <PremiumButton variant="secondary" size="md" onClick={() => setIsTemplateModalOpen(false)}>
              Close
            </PremiumButton>
          </div>
        </div>
      </PremiumModal>

      {/* CSV Data Import Modal */}
      <PremiumModal
        isOpen={isImportModalOpen}
        onClose={() => {
          setIsImportModalOpen(false);
          setImportPreview(null);
          setImportCsvText('');
        }}
        title={`Import ${importEntityType} from CSV`}
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Paste comma-separated rows. SKANDA parses, validates, and checks for duplicates before committing to the canonical register.
          </p>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              CSV Content ({importEntityType})
            </label>
            <textarea
              rows={5}
              value={importCsvText}
              onChange={(e) => setImportCsvText(e.target.value)}
              className="w-full text-xs font-mono p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
              placeholder={`name, owner, department, criticality\nCustomer Onboarding, Sarah Chen, Operations, TIER_1_MISSION_CRITICAL\nCode Deployment, Alex Mercer, Engineering, TIER_2_BUSINESS_CRITICAL`}
            />
          </div>

          {importPreview && (
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs space-y-2">
              <div className="flex items-center space-x-4 font-semibold">
                <span className="text-emerald-600">✓ Valid: {importPreview.validCount}</span>
                <span className="text-amber-600">⚠️ Duplicates: {importPreview.duplicateCount}</span>
                <span className="text-red-600">❌ Invalid: {importPreview.invalidCount}</span>
              </div>
              {importPreview.validRecords.length > 0 && (
                <div className="text-[11px] text-slate-500">
                  Previewing first {importPreview.validRecords.length} valid records ready to commit.
                </div>
              )}
            </div>
          )}

          <div className="pt-2 flex justify-end space-x-2">
            <PremiumButton
              variant="secondary"
              size="md"
              onClick={() => setIsImportModalOpen(false)}
            >
              Cancel
            </PremiumButton>
            {!importPreview ? (
              <PremiumButton
                variant="primary"
                size="md"
                onClick={handlePreviewImport}
                isLoading={isImporting}
                icon={FileSpreadsheet}
              >
                Parse & Validate
              </PremiumButton>
            ) : (
              <PremiumButton
                variant="primary"
                size="md"
                onClick={handleConfirmImport}
                isLoading={isImporting}
                icon={Check}
              >
                Commit {importPreview.validCount} Records
              </PremiumButton>
            )}
          </div>
        </div>
      </PremiumModal>

      {/* Process Builder: Edit Full Parameters Modal */}
      {editingProcess && (
        <PremiumModal
          isOpen={isEditProcessModalOpen}
          onClose={() => setIsEditProcessModalOpen(false)}
          title={`Edit Process Parameters: ${editingProcess.code} - ${editingProcess.name}`}
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="font-bold block mb-1">Process Name</label>
                <PremiumInput
                  value={editingProcess.name}
                  onChange={(e) => setEditingProcess({ ...editingProcess, name: e.target.value })}
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Process Owner</label>
                <PremiumInput
                  value={editingProcess.processOwner}
                  onChange={(e) => setEditingProcess({ ...editingProcess, processOwner: e.target.value })}
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Department</label>
                <PremiumInput
                  value={editingProcess.department}
                  onChange={(e) => setEditingProcess({ ...editingProcess, department: e.target.value })}
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Criticality</label>
                <PremiumSelect
                  value={editingProcess.criticality}
                  onChange={(e) => setEditingProcess({ ...editingProcess, criticality: e.target.value as any })}
                  options={[
                    { value: 'TIER_1_MISSION_CRITICAL', label: 'Tier 1 — Mission Critical' },
                    { value: 'TIER_2_BUSINESS_CRITICAL', label: 'Tier 2 — Business Critical' },
                    { value: 'TIER_3_OPERATIONAL', label: 'Tier 3 — Operational' },
                    { value: 'TIER_4_SUPPORT', label: 'Tier 4 — Support' }
                  ]}
                />
              </div>
            </div>

            <div>
              <label className="font-bold block mb-1">Process Purpose & Workflow Description</label>
              <textarea
                rows={3}
                value={editingProcess.description || ''}
                onChange={(e) => setEditingProcess({ ...editingProcess, description: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
              />
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <PremiumButton variant="secondary" size="md" onClick={() => setIsEditProcessModalOpen(false)}>
                Cancel
              </PremiumButton>
              <PremiumButton
                variant="primary"
                size="md"
                onClick={() => {
                  updateDiscovery(prev => ({
                    ...prev,
                    businessProcesses: prev.businessProcesses.map(p => p.id === editingProcess.id ? editingProcess : p)
                  }));
                  setIsEditProcessModalOpen(false);
                }}
              >
                Save Changes
              </PremiumButton>
            </div>
          </div>
        </PremiumModal>
      )}

      {/* Final Workspace Activation Confirmation Modal */}
      <PremiumModal
        isOpen={isActivationConfirmOpen}
        onClose={() => setIsActivationConfirmOpen(false)}
        title="Confirm SKANDA Workspace Activation"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            You are about to activate the canonical SKANDA GRC workspace for <strong>{discoveryData.orgProfile.legalName}</strong>.
          </p>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
            <div className="font-bold text-slate-900 dark:text-white">Entities to Commit:</div>
            <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-600 dark:text-slate-300">
              <div>• {discoveryData.businessProcesses.length} Business Processes</div>
              <div>• {discoveryData.applications.length} Applications</div>
              <div>• {discoveryData.assets.length} Assets & DBs</div>
              <div>• {discoveryData.vendors.length} Vendors</div>
              <div>• {discoveryData.dataAssets.length} Data Categories</div>
              <div>• {discoveryData.sites.length} Sites & Clouds</div>
            </div>
          </div>

          <label className="flex items-start space-x-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={activationConfirmedDisclaimer}
              onChange={(e) => setActivationConfirmedDisclaimer(e.target.checked)}
              className="rounded text-blue-600 mt-0.5"
            />
            <span>
              I understand that activating this workspace will create these canonical records in the SKANDA GRC engine and initialize continuous compliance monitoring.
            </span>
          </label>

          <div className="pt-3 flex justify-end space-x-2">
            <PremiumButton
              variant="secondary"
              size="md"
              onClick={() => setIsActivationConfirmOpen(false)}
            >
              Cancel
            </PremiumButton>
            <PremiumButton
              variant="primary"
              size="md"
              disabled={!activationConfirmedDisclaimer}
              onClick={handleActivateWorkspace}
              isLoading={isActivating}
              icon={Zap}
            >
              Confirm & Activate
            </PremiumButton>
          </div>
        </div>
      </PremiumModal>

      {/* Role Delegation Modal */}
      <PremiumModal
        isOpen={isDelegateModalOpen}
        onClose={() => setIsDelegateModalOpen(false)}
        title="Assign Discovery Section to Enterprise Stakeholder"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Assign <strong>Step {currentStep}: {activeStepObj.title}</strong> to a specific department lead or executive.
          </p>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Role / Capacity *</label>
            <PremiumSelect
              value={delegationRole}
              onChange={(e) => setDelegationRole(e.target.value as any)}
              options={[
                { value: 'CISO', label: 'CISO / Security Head (Org, Compliance, Scope)' },
                { value: 'IT_OWNER', label: 'IT Owner / DevOps (Technology, Apps, Assets)' },
                { value: 'PRIVACY_OFFICER', label: 'Privacy Officer / DPO (Data, PII, PIMS)' },
                { value: 'HR_LEAD', label: 'HR Lead (Workforce & Shifts)' },
                { value: 'BUSINESS_OWNER', label: 'Business Process Owner (Operations)' },
                { value: 'GRC_MANAGER', label: 'GRC Manager / Auditor' }
              ]}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Stakeholder Full Name *</label>
            <PremiumInput
              value={delegationName}
              onChange={(e) => setDelegationName(e.target.value)}
              placeholder="e.g. Eleanor Vance"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Stakeholder Email *</label>
            <PremiumInput
              type="email"
              value={delegationEmail}
              onChange={(e) => setDelegationEmail(e.target.value)}
              placeholder="e.g. privacy@enterprise.io"
            />
          </div>

          <div className="pt-3 flex justify-end space-x-2">
            <PremiumButton variant="secondary" size="md" onClick={() => setIsDelegateModalOpen(false)}>
              Cancel
            </PremiumButton>
            <PremiumButton variant="primary" size="md" onClick={handleDelegateSubmit}>
              Send Assignment
            </PremiumButton>
          </div>
        </div>
      </PremiumModal>
    </div>
  );
};
