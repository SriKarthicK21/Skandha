import React, { useState } from 'react';
import { useGRC } from '../../context/GRCContext';
import { useToast } from '../common/ToastContainer';
import { SmartEvidenceDropzone } from '../evidence/SmartEvidenceDropzone';
import {
  Building2,
  ShieldCheck,
  Compass,
  FileCheck,
  Layers,
  AlertTriangle,
  UploadCloud,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Lock,
  Globe,
  Users,
  Server,
  FileText,
  Clock,
  ExternalLink,
  ChevronRight,
  Check,
  RefreshCw,
  FolderCheck,
  ShieldAlert,
  Sliders,
  Scale
} from 'lucide-react';

interface GuidedImplementationEngineProps {
  onComplete?: () => void;
  onExitToCommandCenter?: () => void;
}

export const GuidedImplementationEngine: React.FC<GuidedImplementationEngineProps> = ({
  onComplete,
  onExitToCommandCenter
}) => {
  const {
    currentTenant,
    setTenantOnboardingPhase,
    setProductMode,
    setActiveModule,
    controls,
    risks,
    evidence,
    findings,
    openEntityDrawer
  } = useGRC();
  const { showToast } = useToast();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 12;

  // Step 2: Org Registration State
  const [orgData, setOrgData] = useState({
    legalName: currentTenant?.name || 'Acme Global Technologies Inc.',
    tradingName: 'Acme Cloud',
    website: 'https://acmecloud.io',
    industry: currentTenant?.industryType || 'B2B SaaS / FinTech',
    country: currentTenant?.registeredAddress?.country || 'Singapore',
    employeeCount: '250',
    locationsCount: '3',
    primaryContact: 'Alex Rivera (VP Eng)',
    complianceContact: 'Sarah Chen (CISO)',
    privacyContact: 'David Tan (DPO)',
    itContact: 'Marcus Vance (Head of IT)',
    aiContact: 'Elena Rostova (Head of AI)'
  });

  // Step 3: Selected Compliance Programs
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>(
    currentTenant?.selectedFrameworks?.length ? currentTenant.selectedFrameworks : ['ISO/IEC 27001:2022', 'MAS TRM 2021', 'DPDP Act 2023']
  );

  // Step 4: Business Discovery
  const [selectedActivities, setSelectedActivities] = useState<string[]>([
    'Software Development',
    'AI / ML & LLMs',
    'Cloud SaaS Hosting',
    'Financial Data Processing'
  ]);
  const [criticalProcesses, setCriticalProcesses] = useState<string[]>([
    'CI/CD Deployment Pipeline',
    'Customer Identity & Access (IAM)',
    'Financial Transaction Processing',
    'Data Backup & Disaster Recovery'
  ]);

  // Step 5: Dynamic Assessment Questions
  const [answers, setAnswers] = useState<Record<string, 'YES' | 'NO' | 'PARTIAL'>>({
    processPersonalData: 'YES',
    useAISystems: 'YES',
    masTrmApplicable: 'YES',
    publicCloudHosted: 'YES',
    thirdPartyVendors: 'YES'
  });

  // Step 6: Scope Statement
  const [scopeStatement, setScopeStatement] = useState(
    `The Information Security Management System (ISMS), Privacy Information Management System (PIMS), and AI Governance System applies to all customer cloud platforms, software engineering pipelines, and financial data services operated by ${orgData.legalName} across ${orgData.country} and global regional nodes.`
  );
  const [scopeApproved, setScopeApproved] = useState(false);

  const toggleProgram = (prog: string) => {
    setSelectedPrograms(prev =>
      prev.includes(prog) ? prev.filter(p => p !== prog) : [...prev, prog]
    );
  };

  const stepsList = [
    { num: 1, title: 'Welcome & Orientation', subtitle: 'Compliance Vision' },
    { num: 2, title: 'Organization Profile', subtitle: 'Hierarchy & Contacts' },
    { num: 3, title: 'Select Programs', subtitle: 'Multi-Framework Selection' },
    { num: 4, title: 'Business Discovery', subtitle: 'Processes & Activities' },
    { num: 5, title: 'Dynamic Assessment', subtitle: 'Conditional Scoping' },
    { num: 6, title: 'Scope Definition', subtitle: 'ISMS / PIMS Boundaries' },
    { num: 7, title: 'Unified Control Mapping', subtitle: 'Deduplicated Catalog' },
    { num: 8, title: 'Gap & Risk Analysis', subtitle: 'Threats & Vulnerabilities' },
    { num: 9, title: 'Evidence Collection', subtitle: 'Smart Dropzone & OCR' },
    { num: 10, title: 'Remediation & CAPA', subtitle: 'Corrective Action Plan' },
    { num: 11, title: 'Audit Readiness', subtitle: 'Why Is This Score?' },
    { num: 12, title: 'Continuous Monitoring', subtitle: 'Enter Command Centre' }
  ];

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Transition to Enterprise Command Center
      if (currentTenant) {
        setTenantOnboardingPhase(5);
      }
      setProductMode('command_center');
      setActiveModule('command_center');
      showToast({
        title: 'Guided Implementation Completed',
        message: 'Welcome to Enterprise Command Centre!',
        type: 'success'
      });
      if (onComplete) onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const handleExit = () => {
    setProductMode('command_center');
    setActiveModule('command_center');
    if (onExitToCommandCenter) onExitToCommandCenter();
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Guided Header & Progress Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                Mode 1 • Guided Implementation Partner
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Step {currentStep} of {totalSteps}: {stepsList[currentStep - 1]?.title}
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              {currentStep === 1
                ? 'Welcome to SKANDA • Configure Your Compliance Environment'
                : stepsList[currentStep - 1]?.title}
            </h1>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleExit}
              className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Exit to Command Centre
            </button>
            <button
              onClick={handleNext}
              className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-colors flex items-center space-x-1.5"
            >
              <span>{currentStep === totalSteps ? 'Enter Command Centre' : 'Save & Continue'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span>Overall Implementation Progress</span>
            <span className="font-bold text-slate-900 dark:text-white">{Math.round((currentStep / totalSteps) * 100)}%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Stepper Pills Carousel */}
        <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          {stepsList.map(s => {
            const isCompleted = currentStep > s.num;
            const isCurrent = currentStep === s.num;

            return (
              <button
                key={s.num}
                onClick={() => setCurrentStep(s.num)}
                className={`px-3 py-1.5 rounded-lg shrink-0 flex items-center space-x-1.5 font-medium transition-all ${
                  isCurrent
                    ? 'bg-blue-600 text-white shadow-xs'
                    : isCompleted
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <span>{isCompleted ? '✓' : s.num}.</span>
                <span>{s.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step Content Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
        {/* STEP 1: WELCOME */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-blue-600/5 border border-blue-200 dark:border-blue-900">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Intelligent Enterprise GRC Implementation Partner
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed max-w-3xl">
                SKANDA eliminates compliance fragmentation. Instead of facing hundreds of disconnected controls and spreadsheets, follow this structured guided journey. We will register your organizational hierarchy, activate selected regulatory frameworks, define your boundary scope, generate dynamic assessments, map unified controls, and prepare for external audit certification.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">1. Where Am I?</span>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  You are at Step 1 of 12 in the initial guided onboarding and baseline configuration sequence.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">2. What Is Required?</span>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Basic corporate details, critical business processes, applicable compliance frameworks, and key stakeholder contacts.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">3. What Happens Next?</span>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  SKANDA dynamically configures your Unified Control Engine and activates only the assessment questions applicable to your environment.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: ORGANIZATION REGISTRATION */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Organization Profile & Hierarchy</h2>
              <p className="text-xs text-slate-500 mt-0.5">Define corporate legal identity and key compliance governance leads.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Corporate Legal Name</label>
                <input
                  type="text"
                  value={orgData.legalName}
                  onChange={e => setOrgData({ ...orgData, legalName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Industry Classification</label>
                <input
                  type="text"
                  value={orgData.industry}
                  onChange={e => setOrgData({ ...orgData, industry: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Country of Primary Headquarters</label>
                <input
                  type="text"
                  value={orgData.country}
                  onChange={e => setOrgData({ ...orgData, country: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Total Employee Count</label>
                <input
                  type="text"
                  value={orgData.employeeCount}
                  onChange={e => setOrgData({ ...orgData, employeeCount: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Compliance & CISO Lead</label>
                <input
                  type="text"
                  value={orgData.complianceContact}
                  onChange={e => setOrgData({ ...orgData, complianceContact: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Privacy / DPO Lead</label>
                <input
                  type="text"
                  value={orgData.privacyContact}
                  onChange={e => setOrgData({ ...orgData, privacyContact: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                />
              </div>
            </div>

            {/* Organizational Hierarchy Preview */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Unified Multi-Tier Hierarchy Model
              </span>
              <div className="font-mono text-xs text-slate-700 dark:text-slate-300 space-y-1">
                <div>🏢 <strong>{orgData.legalName}</strong> (Global Enterprise)</div>
                <div className="pl-4">├── 🌍 Regional Entity: <strong>{orgData.country} Operations</strong></div>
                <div className="pl-8">├── 👥 In-Scope Departments: <strong>Engineering, IT Ops, Security, HR, Finance</strong></div>
                <div className="pl-12">└── 📍 Facilities & Cloud Regions: <strong>AWS ap-southeast-1, Singapore DC, Azure US-East</strong></div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: SELECT COMPLIANCE PROGRAMS */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">What Do You Want to Achieve?</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Select one or multiple regulatory and standards frameworks. SKANDA unifies them into a single deduplicated compliance program.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { name: 'ISO/IEC 27001:2022', category: 'Information Security', desc: 'Global ISMS benchmark with 93 Annex A controls' },
                { name: 'MAS TRM 2021', category: 'Technology Risk', desc: 'Monetary Authority of Singapore financial technology guidelines' },
                { name: 'ISO/IEC 42001:2023', category: 'AI Governance', desc: 'Artificial Intelligence Management System (AIMS)' },
                { name: 'DPDP Act 2023', category: 'Data Privacy', desc: 'India Digital Personal Data Protection statutory compliance' },
                { name: 'ISO/IEC 27701:2019', category: 'Data Privacy', desc: 'Privacy Information Management System (PIMS)' },
                { name: 'SOC 2 Type II', category: 'Service Organization', desc: 'AICPA Trust Services Criteria (Security, Confidentiality)' },
                { name: 'NIST CSF 2.0', category: 'Security & Risk', desc: 'Identify, Protect, Detect, Respond, Recover, Govern' },
                { name: 'CIS Controls v8', category: 'Security & Risk', desc: '18 Essential cyber hygiene defensive safeguards' },
                { name: 'PCI DSS v4.0', category: 'Payment Security', desc: 'Payment Card Industry Data Security Standard' },
                { name: 'ISO 22301:2019', category: 'Business Continuity', desc: 'Business Continuity Management System (BCMS)' },
                { name: 'ISO 31000:2018', category: 'Risk Management', desc: 'Enterprise risk management principles & guidelines' },
                { name: 'COBIT 2019', category: 'Governance', desc: 'Information & Technology enterprise governance framework' }
              ].map(prog => {
                const isSelected = selectedPrograms.includes(prog.name);

                return (
                  <div
                    key={prog.name}
                    onClick={() => toggleProgram(prog.name)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 ring-1 ring-blue-500'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          {prog.category}
                        </span>
                        <div
                          className={`w-4 h-4 rounded-md flex items-center justify-center text-xs ${
                            isSelected ? 'bg-blue-600 text-white' : 'border border-slate-300'
                          }`}
                        >
                          {isSelected && '✓'}
                        </div>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1.5">
                        {prog.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{prog.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-300 flex items-center justify-between">
              <span>
                <strong>Unified Program Generated:</strong> {selectedPrograms.length} frameworks selected. SKANDA’s Crosswalk Engine will automatically deduplicate 82% of overlapping control requirements.
              </span>
              <span className="font-bold text-blue-600 dark:text-blue-400 shrink-0 ml-2">Zero Redundant Audits</span>
            </div>
          </div>
        )}

        {/* STEP 4: BUSINESS DISCOVERY */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Business Discovery</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Define what your organization does and identify the critical business processes that deliver value.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  What does your organization do?
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Software Development', 'AI / ML & LLMs', 'Cloud SaaS Hosting', 'Financial Data Processing', 'Healthcare Data', 'Supply Chain / IoT', 'Consulting & Advisory'].map(act => (
                    <button
                      key={act}
                      onClick={() => {
                        setSelectedActivities(prev =>
                          prev.includes(act) ? prev.filter(a => a !== act) : [...prev, act]
                        );
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                        selectedActivities.includes(act)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {selectedActivities.includes(act) ? '✓ ' : '+ '}
                      {act}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Critical Business Processes
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {criticalProcesses.map(proc => (
                    <div key={proc} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
                      <span className="font-semibold text-slate-900 dark:text-white">{proc}</span>
                      <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">RTO &lt; 4h</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: DYNAMIC QUESTION ENGINE */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Smart Dynamic Assessment</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Questions are dynamically tailored to your selected frameworks and technology landscape. No 300-page generic questionnaires.
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  id: 'processPersonalData',
                  q: 'Does your organization collect, store, or process personal identifiable data (PII)?',
                  tag: 'Activates: Privacy & Consent Management (DPDP / ISO 27701)'
                },
                {
                  id: 'useAISystems',
                  q: 'Does your organization develop, train, fine-tune, or utilize AI models / LLMs in production?',
                  tag: 'Activates: ISO 42001 AIMS & MAS FEAT AI Governance'
                },
                {
                  id: 'masTrmApplicable',
                  q: 'Do you operate a payment service or financial technology service under MAS supervision?',
                  tag: 'Activates: MAS Notice 644/655 & Critical Systems SLA'
                },
                {
                  id: 'publicCloudHosted',
                  q: 'Are your production systems hosted on public cloud providers (AWS, Azure, Google Cloud)?',
                  tag: 'Activates: Cloud Security Configuration Telemetry (ISO 27001 A.8.23)'
                }
              ].map(item => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{item.q}</p>
                    <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">{item.tag}</span>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    {(['YES', 'NO'] as const).map(opt => (
                      <button
                        key={opt}
                        onClick={() => setAnswers({ ...answers, [item.id]: opt })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          answers[item.id] === opt
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 6: SCOPE DEFINITION */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Compliance Scope Builder</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                SKANDA has synthesized your organizational profile and critical processes into a Draft Statement of Scope.
              </p>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Draft ISMS / PIMS Scope Statement (ISO 27001 Clause 4.3)
              </label>
              <textarea
                rows={4}
                value={scopeStatement}
                onChange={e => setScopeStatement(e.target.value)}
                className="w-full p-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 leading-relaxed"
              />
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">Formal Scope Approval</span>
                <span className="text-[11px] text-slate-500">
                  Version 1.0 (Draft) • Prepared for CISO sign-off
                </span>
              </div>
              <button
                onClick={() => {
                  setScopeApproved(!scopeApproved);
                  showToast({
                    title: 'Scope Updated',
                    message: scopeApproved ? 'Scope approval reverted' : 'Scope approved & baselined',
                    type: 'success'
                  });
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  scopeApproved
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{scopeApproved ? 'Scope Approved ✓' : 'Approve Scope'}</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 7: UNIFIED CONTROL MAPPING */}
        {currentStep === 7 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Unified Control Engine</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                One single operational implementation satisfies multiple regulatory mandates without duplicate controls.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Example: Identity & Access Management (MFA, RBAC, Quarterly Reviews)
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  5 Standards Satisfied
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                  <span className="text-[10px] font-bold text-blue-600 block">ISO 27001</span>
                  <span className="font-semibold text-slate-900 dark:text-white">A.5.15 / A.5.18</span>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                  <span className="text-[10px] font-bold text-purple-600 block">MAS TRM</span>
                  <span className="font-semibold text-slate-900 dark:text-white">Section 8.1 - 8.3</span>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                  <span className="text-[10px] font-bold text-emerald-600 block">DPDP Act</span>
                  <span className="font-semibold text-slate-900 dark:text-white">Section 8(5)</span>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                  <span className="text-[10px] font-bold text-amber-600 block">SOC 2</span>
                  <span className="font-semibold text-slate-900 dark:text-white">CC6.1 / CC6.2</span>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                  <span className="text-[10px] font-bold text-rose-600 block">NIST CSF</span>
                  <span className="font-semibold text-slate-900 dark:text-white">PR.AC-1 to AC-7</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 8: GAP & RISK ANALYSIS */}
        {currentStep === 8 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Compliance Gap & Risk Engine</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Identified gaps automatically generate candidate risks following the Asset → Threat → Vulnerability → Treatment lifecycle.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40">
                <span className="text-lg font-bold text-emerald-700 dark:text-emerald-300">94</span>
                <span className="text-xs text-slate-500 block">Controls Implemented</span>
              </div>
              <div className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40">
                <span className="text-lg font-bold text-amber-700 dark:text-amber-300">12</span>
                <span className="text-xs text-slate-500 block">Partial Gaps</span>
              </div>
              <div className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40">
                <span className="text-lg font-bold text-rose-700 dark:text-rose-300">7</span>
                <span className="text-xs text-slate-500 block">Critical Missing</span>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                <span className="text-lg font-bold text-slate-700 dark:text-slate-300">4</span>
                <span className="text-xs text-slate-500 block">Justified Exclusions</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 9: EVIDENCE COLLECTION & SMART DROPZONE */}
        {currentStep === 9 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Evidence Collection & Smart Dropzone</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Drag and drop your technical evidence or policy documents. SKANDA automatically computes the cryptographic SHA-256 hash and suggests control mappings.
              </p>
            </div>

            <SmartEvidenceDropzone onEvidenceUploaded={id => showToast({ title: 'Evidence Uploaded', message: `Evidence ${id} added to vault`, type: 'success' })} />
          </div>
        )}

        {/* STEP 10: REMEDIATION & CAPA */}
        {currentStep === 10 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Remediation & Corrective Actions (CAPA)</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Every control gap or audit finding is tracked through a 5-Why root cause analysis and assigned SLAs.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 dark:text-white">Finding #F-1024: Quarterly IAM Access Review Missing</span>
                <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 text-[10px] font-bold">
                  SLA: 14 Days Remaining
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Action: Configure Okta automated quarterly manager attestation and deposit report into Evidence Vault.
              </p>
            </div>
          </div>
        )}

        {/* STEP 11: AUDIT READINESS */}
        {currentStep === 11 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Audit & Regulatory Readiness Centre</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Scores are defensible and calculated directly from verified controls, evidence artifacts, and closed CAPAs.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40">
                <span className="text-xs text-slate-500 block mb-1">Controls</span>
                <span className="text-xl font-bold text-emerald-600">92%</span>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40">
                <span className="text-xs text-slate-500 block mb-1">Evidence</span>
                <span className="text-xl font-bold text-blue-600">84%</span>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40">
                <span className="text-xs text-slate-500 block mb-1">Policies</span>
                <span className="text-xl font-bold text-purple-600">96%</span>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40">
                <span className="text-xs text-slate-500 block mb-1">Overall Readiness</span>
                <span className="text-xl font-bold text-emerald-600">86%</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/30 text-xs text-slate-600 dark:text-slate-300">
              <strong>Defensibility Audit Trail:</strong> Every score metric allows clicking to inspect the underlying Requirement → Control → Evidence File → Verification Hash.
            </div>
          </div>
        )}

        {/* STEP 12: CONTINUOUS MONITORING TRANSITION */}
        {currentStep === 12 && (
          <div className="space-y-6 text-center py-6">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="max-w-md mx-auto space-y-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Implementation Journey Complete
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Your organizational scope, selected frameworks ({selectedPrograms.join(', ')}), unified controls, and baseline evidence are now configured.
              </p>
            </div>

            <div className="pt-4 flex items-center justify-center space-x-3">
              <button
                onClick={handleNext}
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-colors flex items-center space-x-2"
              >
                <span>Enter Enterprise Command Centre</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
              currentStep === 1
                ? 'opacity-40 cursor-not-allowed text-slate-400'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleExit}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              Save &amp; Exit
            </button>
            <button
              onClick={handleNext}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs transition-colors flex items-center space-x-1.5"
            >
              <span>{currentStep === totalSteps ? 'Finish & Launch' : 'Save & Continue'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
