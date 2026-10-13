import React, { useState } from 'react';
import {
  DPDPAKnowledgeModule,
  DPDPAIndustryChecklist,
  DPDPADocTemplate,
  DPDPAExamQuestion,
  DPDPA_TRAINING_MODULES,
  DPDPA_INDUSTRY_CHECKLISTS,
  DPDPA_DOC_TEMPLATES,
  DPDPA_EXAM_QUESTIONS,
  generateCertificationHash
} from '../../data/dpdpaComTrainingData';
import { useToast } from '../common/ToastContainer';
import {
  GraduationCap,
  BookOpen,
  Award,
  CheckCircle2,
  XCircle,
  FileText,
  Shield,
  Clock,
  Download,
  Copy,
  ExternalLink,
  ChevronRight,
  AlertTriangle,
  Building,
  Sparkles,
  Layers,
  Search,
  RotateCcw,
  Check,
  Scale,
  FileCheck2,
  AlertOctagon,
  ArrowRight,
  Target
} from 'lucide-react';
import { DPDPTrainingGapAnalyzer } from './DPDPTrainingGapAnalyzer';

export const DPDPAComTrainingAcademy: React.FC = () => {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'CURRICULUM' | 'EXAM' | 'INDUSTRY_CHECKLISTS' | 'TEMPLATES' | 'PENALTY_CALC' | 'GAP_ANALYZER'>('CURRICULUM');

  // Selected Module for Inspection
  const [selectedModule, setSelectedModule] = useState<DPDPAKnowledgeModule>(DPDPA_TRAINING_MODULES[0]);
  const [completedModuleIds, setCompletedModuleIds] = useState<string[]>(['mod_1']);

  // Exam State
  const [examStarted, setExamStarted] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [candidateName, setCandidateName] = useState('Elena Rostova');
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  // Selected Template
  const [selectedTemplate, setSelectedTemplate] = useState<DPDPADocTemplate>(DPDPA_DOC_TEMPLATES[0]);

  // Penalty Calculator State
  const [calcSecurityBreach, setCalcSecurityBreach] = useState(false);
  const [calcNotificationFailure, setCalcNotificationFailure] = useState(false);
  const [calcChildDataViolation, setCalcChildDataViolation] = useState(false);
  const [calcSdfViolation, setCalcSdfViolation] = useState(false);
  const [calcGeneralBreach, setCalcGeneralBreach] = useState(false);

  // Module Completion Toggle
  const handleToggleModuleComplete = (modId: string) => {
    if (completedModuleIds.includes(modId)) {
      setCompletedModuleIds(completedModuleIds.filter(id => id !== modId));
    } else {
      setCompletedModuleIds([...completedModuleIds, modId]);
      showToast({
        title: 'Module Progress Recorded',
        description: 'Module completed and added to statutory training transcript.',
        type: 'success'
      });
    }
  };

  // Exam Handlers
  const handleSelectAnswer = (qId: number, optIdx: number) => {
    if (examSubmitted) return;
    setUserAnswers({ ...userAnswers, [qId]: optIdx });
  };

  const calculateScore = () => {
    let correct = 0;
    DPDPA_EXAM_QUESTIONS.forEach(q => {
      if (userAnswers[q.id] === q.correctOptionIndex) {
        correct++;
      }
    });
    return Math.round((correct / DPDPA_EXAM_QUESTIONS.length) * 100);
  };

  const score = calculateScore();
  const isPassed = score >= 70;

  const handleSubmitExam = () => {
    if (Object.keys(userAnswers).length < DPDPA_EXAM_QUESTIONS.length) {
      showToast({
        title: 'Unanswered Questions Remaining',
        description: 'Please complete all questions before submitting the certification exam.',
        type: 'warning'
      });
      return;
    }
    setExamSubmitted(true);
    if (isPassed) {
      showToast({
        title: 'Certification Exam Passed!',
        description: `Congratulations! You scored ${score}%. Official Certificate of Competency unlocked.`,
        type: 'success'
      });
    } else {
      showToast({
        title: 'Certification Incomplete',
        description: `You scored ${score}% (Passing score is 70%). Review curriculum and retake.`,
        type: 'info'
      });
    }
  };

  const handleResetExam = () => {
    setExamStarted(false);
    setExamSubmitted(false);
    setCurrentQuestionIdx(0);
    setUserAnswers({});
    setShowCertificateModal(false);
  };

  const handleCopyTemplate = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast({
      title: 'Template Copied',
      description: 'Document text copied to clipboard in statutory format.',
      type: 'success'
    });
  };

  // Penalty Calculation
  const totalEstimatedPenaltyCrores =
    (calcSecurityBreach ? 250 : 0) +
    (calcNotificationFailure ? 200 : 0) +
    (calcChildDataViolation ? 200 : 0) +
    (calcSdfViolation ? 150 : 0) +
    (calcGeneralBreach ? 50 : 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Executive Academy Header */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>dpdpa.com Compliance Academy</span>
              </span>
              <span className="text-xs text-slate-400">Trained on dpdpa.com Official Statutory Framework</span>
              <a
                href="https://www.dpdpa.com/"
                target="_blank"
                rel="noreferrer"
                className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-amber-400 border border-slate-700 flex items-center gap-1 hover:border-amber-500/50 transition-colors"
              >
                <span>dpdpa.com</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <span>DPDPA 2023 Master Training & Certification Engine</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Equip your compliance team, engineering leads, and DPOs with comprehensive statutory training modules, industry sector toolkits, standardized contract templates, and an interactive certification exam based on <strong>dpdpa.com</strong> standards.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('GAP_ANALYZER')}
              className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Target className="w-4 h-4 text-amber-400" />
              <span>Training Gap Analyzer</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('EXAM');
                setExamStarted(true);
              }}
              className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>Take Certification Exam</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('TEMPLATES')}
              className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Document Templates</span>
            </button>
          </div>
        </div>

        {/* Progress & Stat Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80">
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">Curriculum Progress</div>
            <div className="text-xl font-bold font-mono text-amber-400 mt-0.5">
              {completedModuleIds.length} / {DPDPA_TRAINING_MODULES.length} Modules
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(completedModuleIds.length / DPDPA_TRAINING_MODULES.length) * 100}%`
                }}
              />
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">Industry Toolkits</div>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
              5 Sectors
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">BFSI, Health, EdTech, E-Com, SaaS</div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">Standardized Templates</div>
            <div className="text-xl font-bold font-mono text-indigo-300 mt-0.5">
              {DPDPA_DOC_TEMPLATES.length} Formats
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Notices, DPAs, VPC, DPBI Breach</div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">Certification Status</div>
            <div className={`text-xl font-bold font-mono mt-0.5 ${examSubmitted && isPassed ? 'text-emerald-400' : 'text-slate-400'}`}>
              {examSubmitted ? (isPassed ? 'Certified 🏆' : 'Not Certified') : 'Ready for Exam'}
            </div>
            <div className="text-[10px] text-amber-400/90 font-semibold mt-0.5">Passing Score: 70%</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-800 mt-5 w-fit overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('CURRICULUM')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
              activeTab === 'CURRICULUM'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>1. Training Curriculum (8 Modules)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('INDUSTRY_CHECKLISTS')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
              activeTab === 'INDUSTRY_CHECKLISTS'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>2. Sector Toolkits</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('TEMPLATES')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
              activeTab === 'TEMPLATES'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>3. Regulatory Templates</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('EXAM')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
              activeTab === 'EXAM'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>4. Certification Exam</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('PENALTY_CALC')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
              activeTab === 'PENALTY_CALC'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>5. Penalty Calculator</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('GAP_ANALYZER')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
              activeTab === 'GAP_ANALYZER'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-indigo-300 hover:text-white bg-indigo-950/40 border border-indigo-700/40'
            }`}
          >
            <Target className="w-3.5 h-3.5 text-indigo-400" />
            <span>6. Training Gap Analyzer (Standards Hub)</span>
          </button>
        </div>
      </div>

      {/* TAB 1: CURRICULUM (8 MODULES) */}
      {activeTab === 'CURRICULUM' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Modules List Sidebar */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span>Core Statutory Modules</span>
              <span className="text-xs font-mono text-slate-400">8 Modules</span>
            </h3>

            {DPDPA_TRAINING_MODULES.map(mod => {
              const isSelected = selectedModule.id === mod.id;
              const isDone = completedModuleIds.includes(mod.id);

              return (
                <div
                  key={mod.id}
                  onClick={() => setSelectedModule(mod)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500 text-white shadow-lg shadow-amber-500/10'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-amber-400">
                      Module {mod.moduleNumber}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{mod.estimatedMinutes}m</span>
                    </span>
                  </div>

                  <h4 className="text-xs font-bold leading-snug">{mod.title}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{mod.subtitle}</p>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px]">
                    <span className="text-slate-400">{mod.statutoryBasis}</span>
                    {isDone ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Completed</span>
                      </span>
                    ) : (
                      <span className="text-slate-500">Incomplete</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Module Inspector */}
          <div className="lg:col-span-2 space-y-4">
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Module {selectedModule.moduleNumber}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs bg-slate-800 text-slate-300 font-semibold">
                      {selectedModule.statutoryBasis}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white mt-1.5">{selectedModule.title}</h3>
                  <p className="text-xs text-slate-400">{selectedModule.subtitle}</p>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleModuleComplete(selectedModule.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer shrink-0 ${
                    completedModuleIds.includes(selectedModule.id)
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>
                    {completedModuleIds.includes(selectedModule.id) ? 'Completed' : 'Mark as Complete'}
                  </span>
                </button>
              </div>

              {/* Module Overview */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">Statutory Overview</h4>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  {selectedModule.overview}
                </p>
              </div>

              {/* Key Statutory Requirements */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Mandatory Legal Requirements
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {selectedModule.keyRequirements.map((req, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start space-x-2.5 text-xs text-slate-300"
                    >
                      <Shield className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>{req}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Practical Implementation Checklist */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Engineering & Operational Checklist
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {selectedModule.practicalChecklist.map((item, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/40 flex items-start space-x-2.5 text-xs text-emerald-200"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* DPBI Enforcement & Penalties */}
              <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <span className="font-bold text-rose-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    <span>DPBI Enforcement Risk:</span>
                  </span>
                  <p className="text-rose-200/90">{selectedModule.dpbiEnforcementRisk}</p>
                </div>
                <div className="shrink-0 text-right sm:border-l sm:border-rose-900/60 sm:pl-4">
                  <span className="text-[10px] text-rose-300 block uppercase font-bold">Max Statutory Penalty:</span>
                  <span className="font-mono font-black text-rose-400 text-sm">{selectedModule.maxPenalty}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INDUSTRY-SPECIFIC CHECKLISTS */}
      {activeTab === 'INDUSTRY_CHECKLISTS' && (
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building className="w-4 h-4 text-amber-400" />
                <span>Sector-Specific DPDPA Compliance Matrix</span>
              </h3>
              <p className="text-xs text-slate-400">
                Tailored regulatory harmonizations reflecting dpdpa.com industry toolkits across banking, healthcare, education, e-commerce, and SaaS.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DPDPA_INDUSTRY_CHECKLISTS.map(ind => (
                <div
                  key={ind.id}
                  className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <h4 className="text-sm font-bold text-white">{ind.industry}</h4>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${ind.badgeColor}`}>
                      {ind.riskProfile} RISK
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">{ind.description}</p>

                  <div className="space-y-2 pt-1">
                    {ind.specificObligations.map((ob, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-amber-300">{ob.rule}</span>
                          <span className="text-[10px] font-mono text-slate-400">{ob.statutoryRef}</span>
                        </div>
                        <p className="text-slate-300 text-[11px] leading-relaxed">{ob.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: STANDARDIZED REGULATORY CONTRACT TEMPLATES */}
      {activeTab === 'TEMPLATES' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white">Document Template Library</h3>
            {DPDPA_DOC_TEMPLATES.map(tmpl => {
              const isSelected = selectedTemplate.id === tmpl.id;
              return (
                <div
                  key={tmpl.id}
                  onClick={() => setSelectedTemplate(tmpl)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-1 ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500 text-white shadow-lg'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-mono text-amber-400">{tmpl.statutoryClause}</span>
                    <span className="text-slate-400">{tmpl.format}</span>
                  </div>
                  <h4 className="text-xs font-bold leading-snug">{tmpl.title}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{tmpl.description}</p>
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-2">
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <span className="text-xs font-mono font-bold text-amber-400">
                    {selectedTemplate.statutoryClause}
                  </span>
                  <h3 className="text-base font-bold text-white">{selectedTemplate.title}</h3>
                  <p className="text-xs text-slate-400">{selectedTemplate.description}</p>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCopyTemplate(selectedTemplate.content)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center space-x-1 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Text</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const element = document.createElement('a');
                      const file = new Blob([selectedTemplate.content], { type: 'text/plain' });
                      element.href = URL.createObjectURL(file);
                      element.download = `${selectedTemplate.id}_template.txt`;
                      document.body.appendChild(element);
                      element.click();
                      element.remove();
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>

              <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[500px]">
                {selectedTemplate.content}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CERTIFICATION EXAM */}
      {activeTab === 'EXAM' && (
        <div className="space-y-4">
          {!examStarted ? (
            <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl text-center max-w-2xl mx-auto space-y-5">
              <div className="inline-flex p-3 rounded-3xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Award className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-white">DPDPA 2023 Certified Privacy Practitioner Exam</h3>
                <p className="text-xs text-slate-400 max-w-lg mx-auto leading-relaxed">
                  Validate your operational understanding of the Digital Personal Data Protection Act 2023 and DPDP Rules 2025. 10 scenario-based questions covering notice mandates, VPC, breach reporting, and penalty schedules.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 max-w-md mx-auto text-left text-xs space-y-2">
                <div className="flex justify-between text-slate-300">
                  <span>Candidate Name:</span>
                  <input
                    type="text"
                    value={candidateName}
                    onChange={e => setCandidateName(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-right font-bold text-amber-400 focus:outline-none"
                  />
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Passing Threshold:</span>
                  <span className="font-bold text-emerald-400">70% (7 of 10 correct)</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Questions Count:</span>
                  <span className="font-mono text-white">10 Questions</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Certification Output:</span>
                  <span className="text-indigo-300 font-semibold">SHA-256 Validated Certificate</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setExamStarted(true)}
                className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm cursor-pointer shadow-lg shadow-amber-500/20"
              >
                Begin Certification Assessment
              </button>
            </div>
          ) : (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">DPDPA Certification Exam</h3>
                    <p className="text-xs text-slate-400">Candidate: {candidateName}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-xs font-mono font-bold text-amber-400">
                    Answered {Object.keys(userAnswers).length} / {DPDPA_EXAM_QUESTIONS.length}
                  </span>
                  <button
                    type="button"
                    onClick={handleResetExam}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              {/* Question Carousel / List */}
              <div className="space-y-6">
                {DPDPA_EXAM_QUESTIONS.map((q, qIndex) => {
                  const selectedOpt = userAnswers[q.id];
                  const isAnswered = selectedOpt !== undefined;
                  const isCorrect = selectedOpt === q.correctOptionIndex;

                  return (
                    <div
                      key={q.id}
                      className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start space-x-2.5">
                          <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-amber-500/20 text-amber-300">
                            Q{q.id}
                          </span>
                          <h4 className="text-sm font-bold text-white leading-snug">{q.question}</h4>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 shrink-0">
                          {q.statutoryRef}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-2 pt-1">
                        {q.options.map((opt, optIndex) => {
                          let optClass = 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300';
                          if (selectedOpt === optIndex) {
                            optClass = 'bg-amber-500/20 border-amber-500 text-amber-200 font-medium';
                          }
                          if (examSubmitted) {
                            if (optIndex === q.correctOptionIndex) {
                              optClass = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-bold';
                            } else if (selectedOpt === optIndex && !isCorrect) {
                              optClass = 'bg-rose-950/60 border-rose-500 text-rose-200';
                            }
                          }

                          return (
                            <button
                              key={optIndex}
                              type="button"
                              disabled={examSubmitted}
                              onClick={() => handleSelectAnswer(q.id, optIndex)}
                              className={`p-3 rounded-xl border text-left text-xs transition-all flex items-start space-x-2.5 cursor-pointer ${optClass}`}
                            >
                              <span className="font-mono font-bold text-slate-500 shrink-0">
                                {String.fromCharCode(65 + optIndex)}.
                              </span>
                              <span>{opt}</span>
                            </button>
                          );
                        })}
                      </div>

                      {examSubmitted && (
                        <div className={`p-3 rounded-xl text-xs space-y-1 ${
                          isCorrect ? 'bg-emerald-950/30 border border-emerald-800/50 text-emerald-200' : 'bg-rose-950/30 border border-rose-800/50 text-rose-200'
                        }`}>
                          <div className="flex items-center space-x-1 font-bold">
                            {isCorrect ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Correct Answer</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3.5 h-3.5 text-rose-400" />
                                <span>Incorrect</span>
                              </>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-300 leading-relaxed">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Submission Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-800">
                <div className="text-xs">
                  {examSubmitted ? (
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-400">Final Score:</span>
                      <span className={`text-base font-black font-mono ${isPassed ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {score}% ({Object.values(userAnswers).filter((ans, idx) => ans === DPDPA_EXAM_QUESTIONS[idx]?.correctOptionIndex).length} / 10)
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${isPassed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                        {isPassed ? 'PASSED' : 'FAILED'}
                      </span>
                    </div>
                  ) : (
                    <span className="text-slate-400">
                      Answer all questions to unlock statutory certification.
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  {!examSubmitted ? (
                    <button
                      type="button"
                      onClick={handleSubmitExam}
                      className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 cursor-pointer shadow-lg shadow-amber-500/20"
                    >
                      <FileCheck2 className="w-4 h-4" />
                      <span>Submit Certification Exam</span>
                    </button>
                  ) : isPassed ? (
                    <button
                      type="button"
                      onClick={() => setShowCertificateModal(true)}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 cursor-pointer shadow-lg shadow-emerald-600/30"
                    >
                      <Award className="w-4 h-4" />
                      <span>View Official Certificate</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResetExam}
                      className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center space-x-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Retake Assessment</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: SECTION 33 PENALTY EXPOSURE CALCULATOR */}
      {activeTab === 'PENALTY_CALC' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Scale className="w-4 h-4 text-amber-400" />
                <span>DPDPA Section 33 Statutory Fine & Penalty Exposure Calculator</span>
              </h3>
              <p className="text-xs text-slate-400">
                Simulate potential non-compliance liability under the Schedule to Section 33 of the Act.
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase block font-bold">Total Max Exposure:</span>
              <span className="text-xl font-black font-mono text-rose-400">
                ₹{totalEstimatedPenaltyCrores} Crores
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start space-x-3 ${
              calcSecurityBreach ? 'bg-rose-950/30 border-rose-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-300'
            }`}>
              <input
                type="checkbox"
                checked={calcSecurityBreach}
                onChange={e => setCalcSecurityBreach(e.target.checked)}
                className="mt-1 accent-rose-500 cursor-pointer"
              />
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Failure to take reasonable security safeguards (Sec 8(5))</span>
                  <span className="font-mono font-bold text-rose-400 text-xs">Up to ₹250 Cr</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Breach in observing reasonable technical safeguards to prevent personal data breach under Section 8(5).
                </p>
              </div>
            </label>

            <label className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start space-x-3 ${
              calcNotificationFailure ? 'bg-rose-950/30 border-rose-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-300'
            }`}>
              <input
                type="checkbox"
                checked={calcNotificationFailure}
                onChange={e => setCalcNotificationFailure(e.target.checked)}
                className="mt-1 accent-rose-500 cursor-pointer"
              />
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Failure to notify DPBI or Data Principal (Sec 8(6))</span>
                  <span className="font-mono font-bold text-rose-400 text-xs">Up to ₹200 Cr</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Failure to notify the Board and affected data principals upon occurrence of a personal data breach.
                </p>
              </div>
            </label>

            <label className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start space-x-3 ${
              calcChildDataViolation ? 'bg-rose-950/30 border-rose-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-300'
            }`}>
              <input
                type="checkbox"
                checked={calcChildDataViolation}
                onChange={e => setCalcChildDataViolation(e.target.checked)}
                className="mt-1 accent-rose-500 cursor-pointer"
              />
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Violation of Children Data Obligations (Sec 9)</span>
                  <span className="font-mono font-bold text-rose-400 text-xs">Up to ₹200 Cr</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Processing child data without verifiable parental consent, behavioral tracking, or targeted advertising.
                </p>
              </div>
            </label>

            <label className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start space-x-3 ${
              calcSdfViolation ? 'bg-rose-950/30 border-rose-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-300'
            }`}>
              <input
                type="checkbox"
                checked={calcSdfViolation}
                onChange={e => setCalcSdfViolation(e.target.checked)}
                className="mt-1 accent-rose-500 cursor-pointer"
              />
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Significant Data Fiduciary Non-Compliance (Sec 10)</span>
                  <span className="font-mono font-bold text-rose-400 text-xs">Up to ₹150 Cr</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Failure to appoint Indian resident DPO, conduct periodic DPIAs, or appoint independent auditor.
                </p>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* TAB 6: TRAINING GAP ANALYZER (STANDARDS INTEGRATION) */}
      {activeTab === 'GAP_ANALYZER' && (
        <div className="pt-2">
          <DPDPTrainingGapAnalyzer />
        </div>
      )}

      {/* OFFICIAL CERTIFICATE MODAL */}
      {showCertificateModal && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border-2 border-amber-500/80 rounded-3xl max-w-2xl w-full p-8 space-y-6 shadow-2xl relative my-8 text-center">
            <button
              type="button"
              onClick={() => setShowCertificateModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              ✕
            </button>

            {/* Certificate Branding */}
            <div className="space-y-2 border-b border-slate-800 pb-5">
              <div className="inline-flex p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 mb-2">
                <Award className="w-10 h-10" />
              </div>
              <div className="text-xs uppercase font-black tracking-widest text-amber-400">
                Data Protection Academy • dpdpa.com Standards
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight">
                Certificate of Competency in DPDPA 2023 Compliance
              </h3>
              <p className="text-xs text-slate-400">
                Digital Personal Data Protection Act, 2023 & DPDP Rules 2025
              </p>
            </div>

            {/* Candidate & Attestation */}
            <div className="space-y-3 py-2">
              <p className="text-xs text-slate-400">This is to officially certify that</p>
              <h2 className="text-2xl font-black text-amber-300 tracking-wide font-mono">
                {candidateName}
              </h2>
              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                has successfully demonstrated proficiency in statutory notice architectures, verifiable parental consent mechanisms, 6-hour breach disclosure protocols, and data processor governance with an exam score of:
              </p>
              <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold text-sm border border-emerald-500/30">
                Score: {score}% • Certified Privacy Officer
              </div>
            </div>

            {/* Verification Metadata */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-slate-400">Certificate Reference:</span>
                <span className="font-mono text-amber-400 font-bold">DPDPA-CERT-2026-9041</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Date of Attestation:</span>
                <span className="text-slate-200">{new Date().toISOString().split('T')[0]}</span>
              </div>
              <div className="space-y-1 pt-1 border-t border-slate-800/80">
                <span className="text-slate-400 text-[10px] block">Cryptographic Non-Repudiation Proof Hash:</span>
                <span className="font-mono text-[9px] text-slate-300 bg-slate-900 p-2 rounded block break-all border border-slate-800">
                  {generateCertificationHash(candidateName, score, 'DPDPA-CERT-2026-9041')}
                </span>
              </div>
            </div>

            {/* Signatory Footnote */}
            <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800">
              <div className="text-left">
                <span className="font-bold text-white block">Elena Rostova</span>
                <span className="text-[10px]">Chief Data Protection Officer</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-white block">dpdpa.com Standards</span>
                <span className="text-[10px]">Verified Regulatory Curriculum</span>
              </div>
            </div>

            <div className="flex justify-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center space-x-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Print / Save Certificate</span>
              </button>
              <button
                type="button"
                onClick={() => setShowCertificateModal(false)}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
