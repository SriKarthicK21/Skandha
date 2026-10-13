import React, { useState, useEffect, useMemo } from 'react';
import {
  AlertOctagon,
  Clock,
  ShieldAlert,
  Send,
  Download,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Building2,
  Calendar,
  Lock,
  ChevronRight,
  Sparkles,
  Server,
  UserCheck,
  RefreshCw,
  ExternalLink,
  Info,
  Layers,
  History,
  Check,
  Copy,
  Printer,
  Sliders,
  Flame,
  FileDown,
  X,
  ShieldCheck,
  Zap,
  CheckSquare,
  Globe,
  Search
} from 'lucide-react';
import { useGRC } from '../../context/GRCContext';
import { organizationService } from '../../services/organizationService';
import { MASIncidentBreachRecord } from '../../types/regulatoryTypes';
import {
  calculateMASIncidentSeverity,
  ServiceCriticalityFactor,
  OutageDurationFactor,
  CustomerImpactFactor,
  CyberCompromiseFactor,
  FinancialExposureFactor,
  SeverityScoreResult,
  DetailedSeverityCalculatorInput,
  DetailedSeverityScoreResult
} from '../../services/masIncidentSeverityService';
import { MASAutomatedSeverityCalculator } from './MASAutomatedSeverityCalculator';
import {
  generateOfficialMASNotificationMarkdown,
  generate14DayPIRTemplateMarkdown,
  generateExecutiveBoardFlashMemoMarkdown,
  ReportingEntityMetadata
} from '../../services/masRegulatoryReportingTemplateService';
import {
  MASCircularRecord,
  MAS_CIRCULAR_MASTER_DATA
} from '../../services/masCircularHorizonService';

export interface MASIncidentResponseWorkbenchProps {
  onClose?: () => void;
  isModal?: boolean;
  initialLinkedCircular?: MASCircularRecord | null;
  onOpenHorizonScanner?: () => void;
}

export const MASIncidentResponseWorkbench: React.FC<MASIncidentResponseWorkbenchProps> = ({
  onClose,
  isModal = false,
  initialLinkedCircular = null,
  onOpenHorizonScanner
}) => {
  const {
    masProfile,
    masIncidents,
    addMASIncident,
    currentTenant,
    currentUser
  } = useGRC();

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<'calculator_declare' | 'official_form' | 'pir_timeline' | 'export_center' | 'incident_history'>('calculator_declare');

  // Simulation vs Live Regulatory Incident Mode
  const [drillMode, setDrillMode] = useState<boolean>(false);

  // 1-Hour SLA Countdown Timer State
  const [discoveryTime, setDiscoveryTime] = useState<Date>(() => new Date(Date.now() - 22 * 60 * 1000)); // Default 22 mins ago
  const [secondsRemaining, setSecondsRemaining] = useState<number>(38 * 60);
  const [isDispatched, setIsDispatched] = useState<boolean>(false);
  const [dispatchTimestamp, setDispatchTimestamp] = useState<string | null>(null);
  const [dispatchReceiptHash, setDispatchReceiptHash] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Severity Calculator Inputs
  const [serviceCriticality, setServiceCriticality] = useState<ServiceCriticalityFactor>('CORE_CIS_PAYMENTS');
  const [outageDuration, setOutageDuration] = useState<OutageDurationFactor>('BETWEEN_1_AND_2_HOURS');
  const [customerImpact, setCustomerImpact] = useState<CustomerImpactFactor>('MODERATE_1K_TO_10K');
  const [cyberCompromise, setCyberCompromise] = useState<CyberCompromiseFactor>('NO_CYBER_INTERNAL_GLITCH');
  const [financialExposure, setFinancialExposure] = useState<FinancialExposureFactor>('MODERATE_50K_TO_500K');
  const [isCIS, setIsCIS] = useState<boolean>(true);

  // Form Fields
  const [incidentTitle, setIncidentTitle] = useState('Critical Service Disruption: Payment Gateway Latency & Transaction Clearing Timeout');
  const [incidentCode, setIncidentCode] = useState(() => `MAS-INC-${new Date().getFullYear()}-${String(masIncidents.length + 1).padStart(3, '0')}`);
  const [selectedSystems, setSelectedSystems] = useState<string[]>([
    masProfile.criticalSystemsList[0]?.systemName || 'Apex Pay Real-Time Settlement Engine',
    'Customer Online Banking Gateway'
  ]);
  const [customerImpactEstimate, setCustomerImpactEstimate] = useState<number>(3850);
  const [rootCauseCategory, setRootCauseCategory] = useState<MASIncidentBreachRecord['rootCauseCategory']>('SOFTWARE_DEFECT');
  const [executiveSummary, setExecutiveSummary] = useState(
    'At 14:15 SGT, core FAST and PayNow transaction routing nodes encountered severe database connection pool saturation, causing payment API timeouts exceeding 8,000ms. Failover to secondary standby cluster AZ-2 was successfully initiated.'
  );
  const [containmentActions, setContainmentActions] = useState(
    'Automated canary deployment aborted; active traffic gracefully drained to secondary availability zone; DB connection pool thread allocation doubled; synthetic validation tests running.'
  );
  const [incidentCommander, setIncidentCommander] = useState(currentUser?.name ? `${currentUser.name} (Incident Commander)` : 'Marcus Vance (Head of Information Security)');
  const [cisoName, setCisoName] = useState('Dr. Elena Rostova (Chief Information Security Officer)');
  const [masOfficerContacted, setMasOfficerContacted] = useState('Technology Risk Supervision Department (TRS FinTech Supervision)');
  const [contactNumber, setContactNumber] = useState('+65 6825 9000 / +65 9123 4567');
  const [pirDueDate, setPirDueDate] = useState(() => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

  // Linked MAS Circulars State
  const [linkedCirculars, setLinkedCirculars] = useState<Array<{
    id: string;
    referenceCode: string;
    title: string;
    relevance?: string;
    sourceUrl?: string;
  }>>([
    {
      id: 'NOT-MAS-655-644',
      referenceCode: 'MAS Notice 655 / Notice 644',
      title: 'Notice on Technology Risk Management (Mandatory 1-Hour Incident Notification & CIS Availability)',
      relevance: 'Statutory basis for mandatory 1-hour SLA escalation and annual 4-hour downtime limit',
      sourceUrl: 'https://www.mas.gov.sg/regulation/notices/notice-655'
    }
  ]);
  const [showCircularSelectorModal, setShowCircularSelectorModal] = useState<boolean>(false);
  const [circularModalSearch, setCircularModalSearch] = useState<string>('');

  // Synchronize pre-linked circular from Regulatory Horizon Scanner if passed
  useEffect(() => {
    if (initialLinkedCircular) {
      setLinkedCirculars(prev => {
        if (prev.some(c => c.id === initialLinkedCircular.id || c.referenceCode === initialLinkedCircular.referenceCode)) {
          return prev;
        }
        return [
          {
            id: initialLinkedCircular.id,
            referenceCode: initialLinkedCircular.referenceCode,
            title: initialLinkedCircular.title,
            relevance: initialLinkedCircular.incidentNotificationImplications?.reportingTriggerCondition || 'Supervisory context under ' + initialLinkedCircular.referenceCode,
            sourceUrl: initialLinkedCircular.sourceUrl
          },
          ...prev
        ];
      });

      if (initialLinkedCircular.incidentNotificationImplications) {
        const imp = initialLinkedCircular.incidentNotificationImplications;
        if (imp.recommendedIncidentTitle) setIncidentTitle(imp.recommendedIncidentTitle);
        if (imp.defaultRootCauseCategory) setRootCauseCategory(imp.defaultRootCauseCategory);
        if (imp.recommendedPrePopulatedSummary) setExecutiveSummary(imp.recommendedPrePopulatedSummary);
        if (imp.recommendedContainmentChecklist?.length) {
          setContainmentActions(imp.recommendedContainmentChecklist.map(act => `• ${act}`).join('\n'));
        }
        if (imp.applicableCriticalSystems?.length) {
          setSelectedSystems(prev => Array.from(new Set([...prev, ...imp.applicableCriticalSystems])));
        }
      }

      setToastMessage(`Linked ${initialLinkedCircular.referenceCode} to Incident. Form populated.`);
      setTimeout(() => setToastMessage(null), 4000);
      setActiveTab('official_form');
    }
  }, [initialLinkedCircular]);

  // Selected template for export center
  const [selectedExportTemplate, setSelectedExportTemplate] = useState<'1_hour_form' | '14_day_pir' | 'board_flash_memo'>('1_hour_form');
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);
  const [calculatorSubMode, setCalculatorSubMode] = useState<'advanced_calculator' | 'factor_sliders'>('advanced_calculator');

  // Handle application of detailed automated score
  const handleApplyDetailedScore = (result: DetailedSeverityScoreResult, input: DetailedSeverityCalculatorInput) => {
    setCustomerImpactEstimate(input.affectedCustomerCount);
    setIsCIS(input.isCriticalInformationSystem);

    if (input.directFinancialLossSGD >= 500000) {
      setFinancialExposure('SEVERE_OVER_500K');
    } else if (input.directFinancialLossSGD >= 50000) {
      setFinancialExposure('MODERATE_50K_TO_500K');
    } else {
      setFinancialExposure('LOW_UNDER_50K');
    }

    if (input.projectedOutageDurationMinutes >= 240) {
      setOutageDuration('EXCEEDS_4_HOURS');
    } else if (input.projectedOutageDurationMinutes >= 120) {
      setOutageDuration('BETWEEN_2_AND_4_HOURS');
    } else if (input.projectedOutageDurationMinutes >= 60) {
      setOutageDuration('BETWEEN_1_AND_2_HOURS');
    } else {
      setOutageDuration('UNDER_1_HOUR');
    }

    if (input.affectedCustomerCount >= 50000) {
      setCustomerImpact('MASSIVE_OVER_50K');
    } else if (input.affectedCustomerCount >= 10000) {
      setCustomerImpact('SIGNIFICANT_10K_TO_50K');
    } else if (input.affectedCustomerCount >= 1000) {
      setCustomerImpact('MODERATE_1K_TO_10K');
    } else {
      setCustomerImpact('LIMITED_UNDER_1K');
    }

    if (input.channelDisrupted === 'CORE_PAYMENT_FAST_PAYNOW') {
      setServiceCriticality('CORE_CIS_PAYMENTS');
      setIncidentTitle(`Critical Rail Disruption: FAST & PayNow Interbank Settlement (${input.affectedCustomerCount.toLocaleString()} Customers Impacted)`);
    } else if (input.isCriticalInformationSystem) {
      setServiceCriticality('CORE_CIS_BANKING');
      setIncidentTitle(`Major Service Incident: Core Banking System Disruption (${input.affectedCustomerCount.toLocaleString()} Customers Impacted)`);
    }

    if (input.cyberCompromiseLevel === 'ACTIVE_EXFILTRATION_RANSOMWARE') {
      setCyberCompromise('CRITICAL_EXFILTRATION_RANSOMWARE');
      setRootCauseCategory('RANSOMWARE');
    } else if (input.cyberCompromiseLevel === 'DDOS_PERIMETER_SURGE') {
      setCyberCompromise('EXTERNAL_ATTACK_NO_DATA_LOSS');
      setRootCauseCategory('CYBER_ATTACK');
    }

    setToastMessage(`Automated Severity Score (${result.compositeScore}/100) applied. Notice 644/655 form pre-populated.`);
    setTimeout(() => setToastMessage(null), 3500);
    setActiveTab('official_form');
  };

  // Calculate live severity score
  const severityResult: SeverityScoreResult = useMemo(() => {
    return calculateMASIncidentSeverity({
      serviceCriticality,
      outageDuration,
      customerImpact,
      cyberCompromise,
      financialExposure,
      isCriticalInformationSystem: isCIS
    });
  }, [serviceCriticality, outageDuration, customerImpact, cyberCompromise, financialExposure, isCIS]);

  // Reporting Entity Metadata for templates
  const reportingEntity: ReportingEntityMetadata = useMemo(() => ({
    entityName: organizationService.getLegalName(currentTenant, 'Licensed Institution (Singapore)'),
    licenseNumber: masProfile.masLicenseNumber || 'MAS-MPI-2024-SG-0089',
    licenseType: masProfile.institutionCategory ? masProfile.institutionCategory.replace(/_/g, ' ') : 'Major Payment Institution (MPI)',
    cisoName,
    incidentCommander,
    contactNumber,
    masSupervisionDivision: masOfficerContacted
  }), [currentTenant?.name, masProfile, cisoName, incidentCommander, contactNumber, masOfficerContacted]);

  // Countdown timer interval
  useEffect(() => {
    if (isDispatched) return;

    const tick = () => {
      const deadline = new Date(discoveryTime.getTime() + 60 * 60 * 1000);
      const diffSec = Math.floor((deadline.getTime() - Date.now()) / 1000);
      setSecondsRemaining(Math.max(0, diffSec));
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [discoveryTime, isDispatched]);

  const minutesLeft = Math.floor(secondsRemaining / 60);
  const secondsLeft = secondsRemaining % 60;
  const isBreached = secondsRemaining === 0 && !isDispatched;
  const isUrgent = secondsRemaining < 15 * 60 && !isDispatched;
  const percentRemaining = Math.min(100, Math.max(0, (secondsRemaining / 3600) * 100));

  // Handle quick adjustments to discovery timestamp
  const handleSetDiscoveryElapsed = (minutesAgo: number) => {
    const newDiscovery = new Date(Date.now() - minutesAgo * 60 * 1000);
    setDiscoveryTime(newDiscovery);
    setIsDispatched(false);
    setDispatchReceiptHash(null);
    setDispatchTimestamp(null);
    showToast(`Incident discovery time set to ${minutesAgo} minutes ago.`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Toggle affected CIS
  const toggleCIS = (sysName: string) => {
    setSelectedSystems(prev =>
      prev.includes(sysName) ? prev.filter(s => s !== sysName) : [...prev, sysName]
    );
  };

  // Freeze and dispatch notification
  const handleFormalDispatch = () => {
    const receipt = `MAS-NOTIF-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString().slice(-4)}`;
    const nowIso = new Date().toISOString();

    const record: Omit<MASIncidentBreachRecord, 'id' | 'tenantId'> = {
      incidentCode,
      title: `${drillMode ? '[TABLETOP DRILL] ' : ''}${incidentTitle}`,
      discoveryTimestamp: discoveryTime.toISOString(),
      masNotificationDeadlineTimestamp: new Date(discoveryTime.getTime() + 60 * 60 * 1000).toISOString(),
      masNotificationStatus: isBreached ? 'SLA_BREACHED' : 'WITHIN_SLA',
      severity: severityResult.derivedSeverity,
      affectedCriticalSystems: selectedSystems,
      customerImpactEstimate,
      rootCauseCategory,
      executiveSummary: `${executiveSummary}\n\n[Immediate Containment Actions Taken]:\n${containmentActions}`,
      containmentStatus: 'ACTIVE_INVESTIGATION',
      regulatoryReportPreparedBy: incidentCommander,
      masOfficerContacted,
      postIncidentReportDueDate: pirDueDate,
      linkedCirculars
    };

    addMASIncident(record);
    setIsDispatched(true);
    setDispatchReceiptHash(receipt);
    setDispatchTimestamp(nowIso);
    showToast(`Notification logged and dispatched under receipt ${receipt}!`);
  };

  // Export templates in various formats
  const currentMarkdown = useMemo(() => {
    const dummyIncident: Partial<MASIncidentBreachRecord> = {
      incidentCode,
      title: incidentTitle,
      discoveryTimestamp: discoveryTime.toISOString(),
      masNotificationDeadlineTimestamp: new Date(discoveryTime.getTime() + 60 * 60 * 1000).toISOString(),
      masNotificationStatus: isDispatched ? (isBreached ? 'SLA_BREACHED' : 'WITHIN_SLA') : (isBreached ? 'SLA_BREACHED' : 'PENDING_DISPATCH'),
      severity: severityResult.derivedSeverity,
      affectedCriticalSystems: selectedSystems,
      customerImpactEstimate,
      rootCauseCategory,
      executiveSummary,
      containmentStatus: 'ACTIVE_INVESTIGATION',
      regulatoryReportPreparedBy: incidentCommander,
      masOfficerContacted,
      postIncidentReportDueDate: pirDueDate,
      linkedCirculars
    };

    switch (selectedExportTemplate) {
      case '1_hour_form':
        return generateOfficialMASNotificationMarkdown(dummyIncident, reportingEntity, severityResult, dispatchReceiptHash || 'PENDING_DISPATCH');
      case '14_day_pir':
        return generate14DayPIRTemplateMarkdown(dummyIncident, reportingEntity);
      case 'board_flash_memo':
        return generateExecutiveBoardFlashMemoMarkdown(dummyIncident, reportingEntity, severityResult);
      default:
        return '';
    }
  }, [selectedExportTemplate, incidentCode, incidentTitle, discoveryTime, isDispatched, isBreached, severityResult, selectedSystems, customerImpactEstimate, rootCauseCategory, executiveSummary, incidentCommander, masOfficerContacted, pirDueDate, reportingEntity, dispatchReceiptHash, linkedCirculars]);

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(currentMarkdown);
    setCopiedNotification(true);
    showToast('Template copied to clipboard in regulatory markdown format!');
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([currentMarkdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MAS_${selectedExportTemplate.toUpperCase()}_${incidentCode}.md`;
    link.click();
    URL.revokeObjectURL(url);
    showToast(`Downloaded MAS_${selectedExportTemplate.toUpperCase()}_${incidentCode}.md`);
  };

  const handleDownloadJSON = () => {
    const payload = {
      regulatoryAuthority: 'Monetary Authority of Singapore (MAS)',
      statutoryBasis: 'Notice 644 / Notice 655 / Notice PSN01',
      formType: 'FORM_MAS_INCIDENT_NOTIFICATION_1_HOUR',
      receiptToken: dispatchReceiptHash || 'PENDING_DISPATCH',
      generatedAt: new Date().toISOString(),
      reportingEntity,
      linkedCirculars,
      incidentDetails: {
        incidentCode,
        incidentTitle,
        discoveryTimestamp: discoveryTime.toISOString(),
        notificationDeadline: new Date(discoveryTime.getTime() + 60 * 60 * 1000).toISOString(),
        slaComplianceStatus: isBreached ? 'SLA_BREACHED' : (isDispatched ? 'WITHIN_SLA' : 'PENDING_DISPATCH'),
        severityScore: severityResult.totalScore,
        severityLevel: severityResult.derivedSeverity,
        severityLabel: severityResult.severityLabel,
        isStatutorilyMandated: severityResult.isMandatory1HourNotice,
        affectedCriticalSystems: selectedSystems,
        customerImpactEstimate,
        rootCauseCategory,
        executiveSummary,
        containmentActions,
        postIncidentReportDueDate: pirDueDate
      }
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MAS_INCIDENT_${incidentCode}_PAYLOAD.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast(`Downloaded MAS_INCIDENT_${incidentCode}_PAYLOAD.json`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950/40 to-slate-950 border border-rose-900/50 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1.5">
                <AlertOctagon className="w-4 h-4 text-rose-400 animate-pulse" />
                MAS 1-Hour Statutory Incident Notification Engine
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                Notice 644/655 Cl. 8 • Notice PSN01 Cl. 9
              </span>
              {drillMode ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" />
                  SIMULATION / TABLETOP DRILL
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  LIVE REGULATORY DISPATCH MODE
                </span>
              )}
            </div>

            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
              MAS 1-Hour Incident Notification Form & Severity Workbench
            </h1>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Enforces the non-negotiable statutory mandate to notify the Monetary Authority of Singapore within 60 minutes of critical system disruption, complete with multi-factor severity auto-scoring, SLA countdown control, and exportable regulatory reporting templates.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              onClick={() => setDrillMode(!drillMode)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-2 ${
                drillMode
                  ? 'bg-amber-950/60 text-amber-200 border-amber-600/60 shadow-lg shadow-amber-950'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
              title="Toggle Tabletop Simulation Mode vs Live Statutory Incident"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{drillMode ? 'Tabletop Active' : 'Switch to Drill Mode'}</span>
            </button>

            {onClose && isModal && (
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Global Toast Notification */}
        {toastMessage && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-950/90 border border-emerald-700/80 text-emerald-200 text-xs flex items-center gap-2 shadow-lg animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>

      {/* Hero Countdown Timer & SLA Progress Bar Card */}
      <div className={`p-6 rounded-2xl border transition-all shadow-xl ${
        isBreached
          ? 'bg-red-950/40 border-red-500 shadow-red-950/50'
          : isUrgent
          ? 'bg-rose-950/30 border-rose-500 shadow-rose-950/40 animate-pulse'
          : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Clock Display */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className={`w-5 h-5 ${isBreached ? 'text-red-400' : isUrgent ? 'text-rose-400' : 'text-emerald-400'}`} />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Statutory 1-Hour Notification SLA Clock (MAS Notice 644/655)
              </span>
            </div>

            <div className="flex items-baseline gap-4 flex-wrap">
              <div className="font-mono text-4xl lg:text-5xl font-extrabold tracking-tight text-white flex items-center gap-2">
                <span className={isBreached ? 'text-red-400' : isUrgent ? 'text-rose-400' : 'text-emerald-300'}>
                  {String(minutesLeft).padStart(2, '0')}:{String(secondsLeft).padStart(2, '0')}
                </span>
                <span className="text-sm font-sans font-normal text-slate-400">
                  {isDispatched ? 'Frozen (Dispatched)' : 'Remaining to Statutory Cutoff'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  isDispatched
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                    : isBreached
                    ? 'bg-red-600 text-white border-red-500 font-extrabold shadow-lg shadow-red-950'
                    : isUrgent
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}>
                  {isDispatched
                    ? '✓ NOTIFICATION FILED WITHIN SLA'
                    : isBreached
                    ? '🚨 1-HOUR STATUTORY SLA BREACHED'
                    : isUrgent
                    ? '⚠️ CRITICAL URGENCY (< 15 MINS)'
                    : '● WITHIN STATUTORY WINDOW'}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400">
              Discovered: <strong className="text-white">{discoveryTime.toLocaleTimeString()} SGT</strong> • Hard Deadline: <strong className="text-rose-400">{new Date(discoveryTime.getTime() + 60 * 60 * 1000).toLocaleTimeString()} SGT</strong>
            </p>
          </div>

          {/* Right: Quick Adjustment Controls & Formal Dispatch Button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 px-2 font-semibold">Simulate Elapsed:</span>
              <button
                onClick={() => handleSetDiscoveryElapsed(5)}
                className="px-2 py-1 text-[11px] rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                title="5m ago (55m left)"
              >
                5m
              </button>
              <button
                onClick={() => handleSetDiscoveryElapsed(25)}
                className="px-2 py-1 text-[11px] rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                title="25m ago (35m left)"
              >
                25m
              </button>
              <button
                onClick={() => handleSetDiscoveryElapsed(48)}
                className="px-2 py-1 text-[11px] rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                title="48m ago (12m left - Critical)"
              >
                48m
              </button>
              <button
                onClick={() => handleSetDiscoveryElapsed(65)}
                className="px-2 py-1 text-[11px] rounded-lg bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 cursor-pointer"
                title="65m ago (Breached)"
              >
                65m
              </button>
            </div>

            <button
              onClick={handleFormalDispatch}
              disabled={isDispatched}
              className={`px-5 py-3 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xl shrink-0 ${
                isDispatched
                  ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white shadow-rose-950 ring-2 ring-rose-500/40'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>{isDispatched ? 'Dispatched to MAS' : 'Freeze & Transmit to MAS'}</span>
            </button>
          </div>
        </div>

        {/* SLA Progress Bar */}
        <div className="mt-5 space-y-1.5">
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>Progress through 60-minute window</span>
            <span>{Math.round(percentRemaining)}% time remaining</span>
          </div>
          <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all duration-1000 ${
                isBreached
                  ? 'bg-red-600'
                  : isUrgent
                  ? 'bg-rose-500 animate-pulse'
                  : minutesLeft < 30
                  ? 'bg-amber-400'
                  : 'bg-emerald-400'
              }`}
              style={{ width: `${percentRemaining}%` }}
            />
          </div>
        </div>

        {/* Breach / Sanction Warning Callout */}
        {isBreached && (
          <div className="mt-4 p-3.5 rounded-xl bg-red-950/80 border border-red-500 text-xs text-red-200 flex items-start gap-3">
            <AlertOctagon className="w-5 h-5 text-red-400 shrink-0 mt-0.5 animate-pulse" />
            <div className="space-y-1">
              <strong className="font-bold text-red-300 block text-xs uppercase tracking-wide">
                STATUTORY NOTIFICATION DEFAULT DETECTED
              </strong>
              <p className="text-[11px] text-red-200/90 leading-relaxed">
                The 60-minute statutory window under MAS Notice 644/655 has elapsed. Immediate emergency escalation to Chief Risk Officer, General Counsel, and designated MAS Supervisory Officer is required. Detailed explanation of the delay must be documented in Section 2 of the Post-Incident Report.
              </p>
            </div>
          </div>
        )}

        {/* Dispatch Confirmation Card */}
        {isDispatched && dispatchReceiptHash && (
          <div className="mt-4 p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/60 text-xs text-emerald-200 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold text-emerald-300 block">Formal Notification Dispatched</span>
                <span className="text-[11px] font-mono text-emerald-200/80">
                  Receipt Token: {dispatchReceiptHash} • Dispatched at {new Date(dispatchTimestamp || '').toLocaleTimeString()} SGT
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('export_center')}
                className="px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>View Exportable Filing</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('calculator_declare')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'calculator_declare'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-950'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>1. Severity Calculator & Declaration</span>
        </button>

        <button
          onClick={() => setActiveTab('official_form')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'official_form'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-950'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>2. Official MAS Notification Form (Notice 644/655)</span>
        </button>

        <button
          onClick={() => setActiveTab('pir_timeline')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'pir_timeline'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-950'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>3. 14-Day Post-Incident Report (PIR) Tracker</span>
        </button>

        <button
          onClick={() => setActiveTab('export_center')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'export_center'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-950'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>4. Exportable Regulatory Templates</span>
        </button>

        <button
          onClick={() => setActiveTab('incident_history')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'incident_history'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-950'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <History className="w-4 h-4" />
          <span>5. Incident Log ({masIncidents.length})</span>
        </button>
      </div>

      {/* TAB 1: SEVERITY CALCULATOR & INCIDENT DECLARATION */}
      {activeTab === 'calculator_declare' && (
        <div className="space-y-6">
          {/* Sub-mode selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-white">Severity Scoring Engine:</span>
              <span className="text-xs text-slate-300">
                {calculatorSubMode === 'advanced_calculator'
                  ? 'Automated 3-Dimensional (Customer Impact, Financial Loss & Regulatory Reporting Urgency)'
                  : 'Compact Multi-Factor Dropdown Mode'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 shrink-0">
              <button
                onClick={() => setCalculatorSubMode('advanced_calculator')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  calculatorSubMode === 'advanced_calculator'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Advanced Automated Calculator
              </button>
              <button
                onClick={() => setCalculatorSubMode('factor_sliders')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  calculatorSubMode === 'factor_sliders'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Compact Factor View
              </button>
            </div>
          </div>

          {calculatorSubMode === 'advanced_calculator' ? (
            <MASAutomatedSeverityCalculator
              initialInput={{
                affectedCustomerCount: customerImpactEstimate,
                isCriticalInformationSystem: isCIS,
                directFinancialLossSGD: financialExposure === 'SEVERE_OVER_500K' ? 650000 : financialExposure === 'MODERATE_50K_TO_500K' ? 120000 : 25000,
                channelDisrupted: serviceCriticality === 'CORE_CIS_PAYMENTS' ? 'CORE_PAYMENT_FAST_PAYNOW' : 'INTERNET_MOBILE_BANKING'
              }}
              onApplyToIncident={handleApplyDetailedScore}
              onNavigateToDispatch={() => setActiveTab('official_form')}
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: 5 Multi-Factor Severity Controls */}
              <div className="lg:col-span-7 space-y-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="space-y-0.5">
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-rose-400" />
                      MAS Multi-Factor Incident Severity Calculator
                    </h2>
                    <p className="text-xs text-slate-400">
                      Calibrated against MAS TRM Section 14 and supervisory notification guidelines.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-rose-300">
                    Score: {severityResult.totalScore}/100
                  </span>
                </div>

            {/* Factor 1: Service Criticality */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>1. Service Criticality & System Designation</span>
                <span className="text-[11px] text-rose-400 font-mono">Weight: {severityResult.factorBreakdown.serviceCriticalityScore} pts</span>
              </label>
              <select
                value={serviceCriticality}
                onChange={e => setServiceCriticality(e.target.value as ServiceCriticalityFactor)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
              >
                <option value="CORE_CIS_PAYMENTS">Critical Information System (CIS) - Core Settlement / Payment Rail (FAST / PayNow / MEPS+) [35 pts]</option>
                <option value="CORE_CIS_BANKING">Critical Information System (CIS) - Core Banking / Trading / Wealth Portal [28 pts]</option>
                <option value="HIGH_PRIORITY_INTERNAL">High-Priority Internal - Treasury, Risk Management Engines [18 pts]</option>
                <option value="STANDARD_SUPPORTING">Standard Supporting System - Customer Support, Analytics [8 pts]</option>
              </select>
            </div>

            {/* Factor 2: Outage Duration */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>2. Outage Duration / Projected MTTR</span>
                <span className="text-[11px] text-rose-400 font-mono">Weight: {severityResult.factorBreakdown.outageDurationScore} pts</span>
              </label>
              <select
                value={outageDuration}
                onChange={e => setOutageDuration(e.target.value as OutageDurationFactor)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
              >
                <option value="EXCEEDS_4_HOURS">&gt; 4 Hours (MAS Statutory CIS Downtime Cap Breach) [25 pts]</option>
                <option value="BETWEEN_2_AND_4_HOURS">2 to 4 Hours (High Severity Outage) [18 pts]</option>
                <option value="BETWEEN_1_AND_2_HOURS">1 to 2 Hours (Material Service Disruption) [12 pts]</option>
                <option value="UNDER_1_HOUR">&lt; 1 Hour (Transient Disruption / Rapid Failover) [5 pts]</option>
              </select>
            </div>

            {/* Factor 3: Customer & Counterparty Impact */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>3. Customer & Transaction Impact Scope</span>
                <span className="text-[11px] text-rose-400 font-mono">Weight: {severityResult.factorBreakdown.customerImpactScore} pts</span>
              </label>
              <select
                value={customerImpact}
                onChange={e => setCustomerImpact(e.target.value as CustomerImpactFactor)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
              >
                <option value="MASSIVE_OVER_50K">&gt; 50,000 Accounts Impacted or Total Payment Rail Halt [20 pts]</option>
                <option value="SIGNIFICANT_10K_TO_50K">10,000 to 50,000 Accounts Impacted [14 pts]</option>
                <option value="MODERATE_1K_TO_10K">1,000 to 10,000 Accounts Impacted [8 pts]</option>
                <option value="LIMITED_UNDER_1K">&lt; 1,000 Accounts Impacted [3 pts]</option>
              </select>
            </div>

            {/* Factor 4: Cyber Compromise / Confidentiality */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>4. Cyber Compromise & Data Confidentiality</span>
                <span className="text-[11px] text-rose-400 font-mono">Weight: {severityResult.factorBreakdown.cyberCompromiseScore} pts</span>
              </label>
              <select
                value={cyberCompromise}
                onChange={e => setCyberCompromise(e.target.value as CyberCompromiseFactor)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
              >
                <option value="CRITICAL_EXFILTRATION_RANSOMWARE">Active Ransomware or Customer Financial Data / PII Exfiltrated [20 pts]</option>
                <option value="CONTAINED_MALWARE_ADMIN_BREACH">Privileged Administrator Account Compromised or Contained Malware [12 pts]</option>
                <option value="EXTERNAL_ATTACK_NO_DATA_LOSS">DDoS / External Perimeter Attack Without Data Breach [7 pts]</option>
                <option value="NO_CYBER_INTERNAL_GLITCH">Hardware / Cloud Provider / Software Defect (No Cyber Breach) [2 pts]</option>
              </select>
            </div>

            {/* Factor 5: Financial Exposure & Market Contagion */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>5. Financial Loss & Systemic Market Risk</span>
                <span className="text-[11px] text-rose-400 font-mono">Weight: {severityResult.factorBreakdown.financialExposureScore} pts</span>
              </label>
              <select
                value={financialExposure}
                onChange={e => setFinancialExposure(e.target.value as FinancialExposureFactor)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
              >
                <option value="SEVERE_OVER_500K">Estimated Loss &gt; SGD 500,000 or Interbank Spillover [15 pts]</option>
                <option value="MODERATE_50K_TO_500K">Estimated Loss SGD 50,000 - 500,000 [8 pts]</option>
                <option value="LOW_UNDER_50K">Estimated Loss &lt; SGD 50,000 [2 pts]</option>
              </select>
            </div>

            {/* Critical Information System Switch */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-white block">Designated Critical Information System (CIS)</span>
                <span className="text-[11px] text-slate-400">Triggers mandatory statutory scrutiny under MAS Notice 644/655.</span>
              </div>
              <input
                type="checkbox"
                checked={isCIS}
                onChange={e => setIsCIS(e.target.checked)}
                className="w-4 h-4 text-rose-600 rounded bg-slate-900 border-slate-700 cursor-pointer"
              />
            </div>
          </div>

          {/* Right Column: Dynamic Scoring Engine Verdict & Incident Declaration */}
          <div className="lg:col-span-5 space-y-5">
            {/* Score Result Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Calculated Severity Output</span>
                <span className="text-xs font-mono font-bold text-slate-300">Composite Engine v2.4</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-750 flex flex-col items-center justify-center font-mono font-extrabold text-2xl text-rose-400 shrink-0 shadow-inner">
                  {severityResult.totalScore}
                  <span className="text-[9px] text-slate-500 -mt-1 font-sans">/ 100</span>
                </div>

                <div className="space-y-1">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border inline-block ${severityResult.riskTierBadgeColor}`}>
                    {severityResult.severityLabel}
                  </span>
                  <p className="text-[11px] text-slate-300 font-semibold">
                    {severityResult.isMandatory1HourNotice
                      ? '⚠️ STATUTORY 1-HOUR MAS NOTIFICATION MANDATORY'
                      : 'ℹ️ DISCRETIONARY / INTERNAL RESOLUTION LOG'}
                  </p>
                </div>
              </div>

              {/* Statutory Verdict Callout */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1.5">
                <span className="font-bold text-rose-300 block text-[11px]">Regulatory Basis:</span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {severityResult.regulatoryNoticeReason}
                </p>
              </div>

              {/* Fine disclosure warning */}
              {severityResult.statutorySanctionWarning && (
                <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-xl text-xs text-red-200 space-y-1">
                  <span className="font-bold text-red-300 block text-[11px] uppercase tracking-wider">
                    Statutory Sanction Disclosure:
                  </span>
                  <p className="text-[11px] text-red-200/90 leading-relaxed">
                    {severityResult.statutorySanctionWarning}
                  </p>
                </div>
              )}

              {/* Factor Score Bar Graph */}
              <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
                <span className="font-semibold text-slate-400 block text-[11px]">Factor Contribution:</span>
                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between text-slate-400">
                    <span>Service Criticality</span>
                    <span className="font-mono text-white">{severityResult.factorBreakdown.serviceCriticalityScore} pts</span>
                  </div>
                  <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full" style={{ width: `${(severityResult.factorBreakdown.serviceCriticalityScore / 35) * 100}%` }} />
                  </div>

                  <div className="flex justify-between text-slate-400 pt-1">
                    <span>Outage Duration</span>
                    <span className="font-mono text-white">{severityResult.factorBreakdown.outageDurationScore} pts</span>
                  </div>
                  <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-400 h-full" style={{ width: `${(severityResult.factorBreakdown.outageDurationScore / 25) * 100}%` }} />
                  </div>

                  <div className="flex justify-between text-slate-400 pt-1">
                    <span>Customer Impact</span>
                    <span className="font-mono text-white">{severityResult.factorBreakdown.customerImpactScore} pts</span>
                  </div>
                  <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-sky-400 h-full" style={{ width: `${(severityResult.factorBreakdown.customerImpactScore / 20) * 100}%` }} />
                  </div>

                  <div className="flex justify-between text-slate-400 pt-1">
                    <span>Cyber / Data Compromise</span>
                    <span className="font-mono text-white">{severityResult.factorBreakdown.cyberCompromiseScore} pts</span>
                  </div>
                  <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-purple-400 h-full" style={{ width: `${(severityResult.factorBreakdown.cyberCompromiseScore / 20) * 100}%` }} />
                  </div>

                  <div className="flex justify-between text-slate-400 pt-1">
                    <span>Financial Exposure</span>
                    <span className="font-mono text-white">{severityResult.factorBreakdown.financialExposureScore} pts</span>
                  </div>
                  <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-400 h-full" style={{ width: `${(severityResult.factorBreakdown.financialExposureScore / 15) * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl space-y-3">
              <span className="text-xs font-bold text-white block">Next Operational Steps</span>
              <button
                onClick={() => setActiveTab('official_form')}
                className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>Edit Official Notification Form Fields</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => setActiveTab('export_center')}
                className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>Preview Print-Ready Filing Package</span>
                <ExternalLink className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )}

  {/* TAB 2: OFFICIAL MAS NOTIFICATION FORM (APPENDIX 1) */}
      {activeTab === 'official_form' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-rose-400" />
                MAS Notice 644/655 Official Notification Payload
              </h2>
              <p className="text-xs text-slate-400">
                Regulatory fields conforming directly to Monetary Authority of Singapore TRS reporting specifications.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleFormalDispatch}
                disabled={isDispatched}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isDispatched ? 'Filed to MAS' : 'Transmit Form'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            {/* Incident Title & Code */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Incident Code</label>
              <input
                type="text"
                value={incidentCode}
                onChange={e => setIncidentCode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Incident Descriptive Headline</label>
              <input
                type="text"
                value={incidentTitle}
                onChange={e => setIncidentTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
              />
            </div>

            {/* Reporting Entity Details */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Institution Name & License</label>
              <input
                type="text"
                value={`${reportingEntity.entityName} (${reportingEntity.licenseNumber})`}
                disabled
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-2.5 text-slate-400 cursor-not-allowed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Designated MAS Supervisory Division</label>
              <input
                type="text"
                value={masOfficerContacted}
                onChange={e => setMasOfficerContacted(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
              />
            </div>

            {/* Incident Commander & 24/7 Phone */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Designated Incident Commander</label>
              <input
                type="text"
                value={incidentCommander}
                onChange={e => setIncidentCommander(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">24/7 Incident Emergency Contact No.</label>
              <input
                type="text"
                value={contactNumber}
                onChange={e => setContactNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
              />
            </div>

            {/* Root Cause & Customer Impact Estimate */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Preliminary Root Cause Classification</label>
              <select
                value={rootCauseCategory}
                onChange={e => setRootCauseCategory(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
              >
                <option value="SOFTWARE_DEFECT">Software Defect / Logic Error</option>
                <option value="CYBER_ATTACK">Cyber Attack / Malicious Ingress</option>
                <option value="HARDWARE_FAILURE">Hardware / Cloud Host Outage</option>
                <option value="THIRD_PARTY_OUTAGE">Critical Third-Party / Vendor Outage</option>
                <option value="HUMAN_ERROR">Human Configuration Error</option>
                <option value="RANSOMWARE">Ransomware / Extortion Vector</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Estimated Impacted Accounts / Users</label>
              <input
                type="number"
                value={customerImpactEstimate}
                onChange={e => setCustomerImpactEstimate(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
              />
            </div>
          </div>

          {/* Section 2B: Applicable MAS Circulars & Statutory Directives Linked */}
          <div className="p-4 rounded-xl bg-slate-950/90 border border-indigo-900/40 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-indigo-400" />
                  Section 2B: Applicable MAS Circulars & Statutory Directives Linked ({linkedCirculars.length})
                </span>
                <p className="text-[11px] text-slate-400">
                  Explicitly associate regulatory directives, circulars, and advisories to this notification for supervisory traceability.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowCircularSelectorModal(true)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-950 transition-colors"
                >
                  <span>+ Link MAS Circular</span>
                </button>

                {onOpenHorizonScanner && (
                  <button
                    type="button"
                    onClick={onOpenHorizonScanner}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <span>Horizon Scanner</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              {linkedCirculars.map((cir, cIdx) => (
                <div
                  key={cIdx}
                  className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-indigo-300 px-2 py-0.5 rounded bg-slate-950 border border-indigo-900/50 text-[10px]">
                        {cir.referenceCode}
                      </span>
                      <span className="font-bold text-white truncate max-w-md">{cir.title}</span>
                    </div>
                    {cir.relevance && (
                      <p className="text-[11px] text-slate-400 italic">
                        Context: {cir.relevance}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {cir.sourceUrl && (
                      <a
                        href={cir.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
                        title="View Official MAS Publication"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {linkedCirculars.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setLinkedCirculars(prev => prev.filter((_, i) => i !== cIdx))}
                        className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-slate-800 cursor-pointer"
                        title="Remove directive linkage"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Affected Critical Information Systems Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">
              Affected Critical Information Systems (CIS List per Section 4.0)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {masProfile.criticalSystemsList.map((sys, idx) => {
                const checked = selectedSystems.includes(sys.systemName);
                return (
                  <div
                    key={idx}
                    onClick={() => toggleCIS(sys.systemName)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                      checked
                        ? 'bg-rose-950/50 border-rose-500/70 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <CheckSquare className={`w-4 h-4 ${checked ? 'text-rose-400' : 'text-slate-600'}`} />
                      <span className="font-medium truncate">{sys.systemName}</span>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      RTO: {sys.rtoTargetHours}h
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Narratives */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Section 4: Summary of Disruption & Customer Impact
              </label>
              <textarea
                rows={4}
                value={executiveSummary}
                onChange={e => setExecutiveSummary(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-500 leading-relaxed font-sans"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Section 5: Immediate Containment Actions Taken
              </label>
              <textarea
                rows={3}
                value={containmentActions}
                onChange={e => setContainmentActions(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-500 leading-relaxed font-sans"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: 14-DAY POST-INCIDENT REPORT (PIR) TRACKER */}
      {activeTab === 'pir_timeline' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-rose-400" />
                MAS 14-Day Post-Incident Root Cause Analysis (PIR) Lifecycle
              </h2>
              <p className="text-xs text-slate-400">
                Statutory undertaking under MAS TRM Guidelines Section 14.3.3. Full forensic report due within 14 calendar days.
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 block">Submission Deadline:</span>
              <strong className="text-rose-400 text-sm font-mono">{pirDueDate}</strong>
            </div>
          </div>

          {/* Timeline Milestones */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Mandatory Investigation Milestones</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">DAY 1 - COMPLETED</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <strong className="text-white block font-semibold">1. Initial 1-Hour MAS Notification</strong>
                <p className="text-slate-400 text-[11px]">
                  Formal statutory notification dispatched to MAS TRS division with preliminary containment status.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-amber-400 font-bold">DAY 3-5 - IN MOTION</span>
                  <Clock className="w-4 h-4 text-amber-400" />
                </div>
                <strong className="text-white block font-semibold">2. Forensic Reconstruction & 5 Whys</strong>
                <p className="text-slate-400 text-[11px]">
                  Technical log forensic extraction, memory captures, database thread locks, and vendor code analysis.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-purple-400 font-bold">DAY 8-10</span>
                  <Layers className="w-4 h-4 text-purple-400" />
                </div>
                <strong className="text-white block font-semibold">3. CAPA Plan & Architecture Review</strong>
                <p className="text-slate-400 text-[11px]">
                  Draft permanent corrective and preventive actions with assigned owners and 30/60/90 day deadlines.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-rose-400 font-bold">DAY 14 - STATUTORY CUTOFF</span>
                  <AlertOctagon className="w-4 h-4 text-rose-400" />
                </div>
                <strong className="text-white block font-semibold">4. Formal Filing & Board Sign-off</strong>
                <p className="text-slate-400 text-[11px]">
                  Final submission endorsed by CISO, CTO, and presented to Board Risk Committee (BRC).
                </p>
              </div>
            </div>
          </div>

          {/* Quick PIR Template Preview Box */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Pre-Generated 14-Day Report Structure</span>
              <button
                onClick={() => {
                  setSelectedExportTemplate('14_day_pir');
                  setActiveTab('export_center');
                }}
                className="text-xs text-rose-400 hover:text-rose-300 font-semibold cursor-pointer flex items-center gap-1"
              >
                <span>Open in Template Export Center</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              SKANDA automatically links this incident to your Findings & CAPA module, generating traceable corrective actions with verification criteria for internal and external auditors.
            </p>
          </div>
        </div>
      )}

      {/* TAB 4: EXPORTABLE REGULATORY TEMPLATES & PREVIEW */}
      {activeTab === 'export_center' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileDown className="w-5 h-5 text-rose-400" />
                MAS Regulatory Reporting Export Center
              </h2>
              <p className="text-xs text-slate-400">
                Generate, preview, print, or download official MAS-ready regulatory documents.
              </p>
            </div>

            {/* Format Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleCopyMarkdown}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Copy formatted markdown to clipboard"
              >
                {copiedNotification ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedNotification ? 'Copied' : 'Copy Text'}</span>
              </button>

              <button
                onClick={handleDownloadMarkdown}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Download as Markdown"
              >
                <FileText className="w-3.5 h-3.5 text-sky-400" />
                <span>Download .MD</span>
              </button>

              <button
                onClick={handleDownloadJSON}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Download machine-readable JSON payload"
              >
                <Download className="w-3.5 h-3.5 text-purple-400" />
                <span>Download JSON</span>
              </button>

              <button
                onClick={handlePrint}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-lg shadow-rose-950"
                title="Print-ready view or PDF export"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Export PDF</span>
              </button>
            </div>
          </div>

          {/* Template Selector Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedExportTemplate('1_hour_form')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedExportTemplate === '1_hour_form'
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              Official 1-Hour Incident Notification Form (Appx 1)
            </button>
            <button
              onClick={() => setSelectedExportTemplate('14_day_pir')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedExportTemplate === '14_day_pir'
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              14-Day Post-Incident Root Cause Analysis (PIR)
            </button>
            <button
              onClick={() => setSelectedExportTemplate('board_flash_memo')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedExportTemplate === 'board_flash_memo'
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              Board Risk Committee (BRC) Flash Memo
            </button>
          </div>

          {/* Document Preview Window */}
          <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl overflow-x-auto">
            <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed select-text">
              {currentMarkdown}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 5: INCIDENT HISTORY & DRILL AUDIT LOG */}
      {activeTab === 'incident_history' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-rose-400" />
              MAS Incident Notification Audit Log ({masIncidents.length})
            </h2>
            <span className="text-xs text-slate-400">Immutable historical compliance ledger</span>
          </div>

          {masIncidents.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs bg-slate-950 rounded-xl border border-slate-800">
              No previous incidents or tabletop drills logged.
            </div>
          ) : (
            <div className="space-y-3">
              {masIncidents.map((inc) => (
                <div
                  key={inc.id}
                  className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 hover:border-slate-700 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-rose-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                        {inc.incidentCode}
                      </span>
                      <strong className="text-sm text-white font-bold">{inc.title}</strong>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      inc.masNotificationStatus === 'WITHIN_SLA'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-red-500/20 text-red-300 border border-red-500/40'
                    }`}>
                      {inc.masNotificationStatus}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2">
                    {inc.executiveSummary}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1">
                    <span>Discovered: <strong>{new Date(inc.discoveryTimestamp).toLocaleString()}</strong></span>
                    <span>•</span>
                    <span>Severity: <strong className="text-rose-300">{inc.severity}</strong></span>
                    <span>•</span>
                    <span>PIR Due: <strong>{inc.postIncidentReportDueDate}</strong></span>
                    <span>•</span>
                    <span>Commander: <strong>{inc.regulatoryReportPreparedBy}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Inline Circular Selector Modal */}
      {showCircularSelectorModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-2xl w-full shadow-2xl space-y-4 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Globe className="w-5 h-5 text-indigo-400" />
                  Link Applicable MAS Circular or Statutory Directive
                </h3>
                <p className="text-xs text-slate-400">
                  Select official MAS circulars to attach to this notification payload and 14-day PIR audit trail.
                </p>
              </div>
              <button
                onClick={() => setShowCircularSelectorModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={circularModalSearch}
                onChange={e => setCircularModalSearch(e.target.value)}
                placeholder="Search circulars by code, title, or topic (e.g. cloud, notice 655, ransomware)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* List of Circulars */}
            <div className="overflow-y-auto space-y-2.5 flex-1 pr-1">
              {MAS_CIRCULAR_MASTER_DATA.filter(c => {
                const q = circularModalSearch.toLowerCase();
                return (
                  c.referenceCode.toLowerCase().includes(q) ||
                  c.title.toLowerCase().includes(q) ||
                  c.summary.toLowerCase().includes(q) ||
                  c.tags.some(t => t.toLowerCase().includes(q))
                );
              }).map(c => {
                const isAlreadyLinked = linkedCirculars.some(
                  lc => lc.id === c.id || lc.referenceCode === c.referenceCode
                );

                return (
                  <div
                    key={c.id}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-indigo-300 px-2 py-0.5 rounded bg-slate-900 border border-indigo-900/60 text-[10px]">
                          {c.referenceCode}
                        </span>
                        <span className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                          c.type === 'NOTICE' ? 'bg-rose-500/20 text-rose-300' : 'bg-indigo-500/20 text-indigo-300'
                        }`}>
                          {c.type}
                        </span>
                        {c.isStatutoryMandate && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-red-950 text-red-200 border border-red-800">
                            Statutory
                          </span>
                        )}
                        <span className="text-slate-500 text-[10px]">{c.issuanceDate}</span>
                      </div>
                      <h4 className="font-bold text-white text-xs leading-snug">{c.title}</h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {c.summary}
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-2 justify-end">
                      {isAlreadyLinked ? (
                        <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Linked</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setLinkedCirculars(prev => [
                              {
                                id: c.id,
                                referenceCode: c.referenceCode,
                                title: c.title,
                                relevance: c.incidentNotificationImplications?.reportingTriggerCondition || c.summary,
                                sourceUrl: c.sourceUrl
                              },
                              ...prev
                            ]);
                            // Optionally populate recommendations if user confirms
                            if (c.incidentNotificationImplications) {
                              const imp = c.incidentNotificationImplications;
                              if (imp.applicableCriticalSystems?.length) {
                                setSelectedSystems(prev => Array.from(new Set([...prev, ...imp.applicableCriticalSystems])));
                              }
                            }
                            setShowCircularSelectorModal(false);
                            showToast(`Linked ${c.referenceCode} to Incident.`);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                        >
                          <Send className="w-3 h-3" />
                          <span>Link Directive</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
              <span>{linkedCirculars.length} circulars currently linked</span>
              <button
                type="button"
                onClick={() => setShowCircularSelectorModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
