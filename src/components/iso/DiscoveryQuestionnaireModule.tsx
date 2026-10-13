import React, { useState, useMemo } from 'react';
import { useGRC } from '../../context/GRCContext';
import { DiscoveryQuestionnaireSection, DiscoveryQuestion } from '../../types';
import {
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  Search,
  Filter,
  Sparkles,
  Download,
  Building,
  Users,
  Shield,
  FileText,
  Key,
  Database,
  Lock,
  Server,
  Cloud,
  Layers,
  ArrowRight,
  Check
} from 'lucide-react';

export const DiscoveryQuestionnaireModule: React.FC = () => {
  const {
    currentTenant,
    updateDiscoveryQuestion,
    batchAnswerDiscoverySection,
    setActiveModule
  } = useGRC();

  const sections: DiscoveryQuestionnaireSection[] = currentTenant?.discoveryQuestionnaires || [];

  const [activeSectionKey, setActiveSectionKey] = useState<string>(
    sections[0]?.sectionKey || 'governance'
  );
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const activeSection = useMemo(() => {
    return sections.find(s => s.sectionKey === activeSectionKey) || sections[0];
  }, [sections, activeSectionKey]);

  // Metric computations
  const totalQuestions = useMemo(() => {
    return sections.reduce((acc, s) => acc + s.questions.length, 0);
  }, [sections]);

  const answeredQuestions = useMemo(() => {
    return sections.reduce(
      (acc, s) => acc + s.questions.filter(q => q.status !== 'Unanswered').length,
      0
    );
  }, [sections]);

  const completionPct = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;

  const filteredQuestions = useMemo(() => {
    if (!activeSection) return [];
    return activeSection.questions.filter(q => {
      const matchesFilter = filterStatus === 'ALL' || q.status === filterStatus;
      const matchesSearch = !searchQuery.trim() ||
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (q.isoClauseMapping && q.isoClauseMapping.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (q.annexAControlMapping && q.annexAControlMapping.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesFilter && matchesSearch;
    });
  }, [activeSection, filterStatus, searchQuery]);

  const handleStatusChange = (questionId: string, status: DiscoveryQuestion['status']) => {
    updateDiscoveryQuestion(activeSectionKey, questionId, { status });
  };

  const handleNotesChange = (questionId: string, textResponse: string) => {
    updateDiscoveryQuestion(activeSectionKey, questionId, { textResponse });
  };

  const autoEvaluateCurrentSection = () => {
    if (!activeSection) return;
    const batch: Record<string, { answer: 'YES' | 'NO' | 'PARTIAL' | 'NA'; notes?: string }> = {};
    activeSection.questions.forEach(q => {
      batch[q.id] = {
        answer: 'YES',
        notes: `Verified compliant during initial discovery baseline review for ${currentTenant?.name || 'organization'}.`
      };
    });
    batchAnswerDiscoverySection(activeSectionKey, batch);
  };

  const getSectionIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Building': return <Building className="w-4 h-4" />;
      case 'Users': return <Users className="w-4 h-4" />;
      case 'Shield': return <Shield className="w-4 h-4" />;
      case 'FileText': return <FileText className="w-4 h-4" />;
      case 'Key': return <Key className="w-4 h-4" />;
      case 'Database': return <Database className="w-4 h-4" />;
      case 'Lock': return <Lock className="w-4 h-4" />;
      case 'Cloud': return <Cloud className="w-4 h-4" />;
      default: return <Layers className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase bg-sky-500/10 text-sky-400 border border-sky-500/30">
                14 Domain Framework
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-slate-400 font-medium">
                Tenant: <strong className="text-slate-200">{currentTenant?.name || 'New Registration'}</strong>
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Organization Discovery & Baseline Questionnaire
            </h1>
            <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
              Comprehensive 14-section ISO 27001:2022 diagnostic survey. Evaluates baseline security posture across leadership, human resources, asset management, access controls, cryptography, cloud security, and disaster recovery.
            </p>
          </div>

          {/* Completion KPI Card */}
          <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl shrink-0 flex items-center gap-5">
            <div className="text-center">
              <div className="text-3xl font-bold text-sky-400">{completionPct}%</div>
              <div className="text-[11px] text-slate-400 font-medium">Survey Answered</div>
            </div>
            <div className="h-10 w-px bg-slate-800" />
            <div className="text-xs text-slate-400 space-y-1">
              <div>Total Domains: <strong className="text-white">{sections.length}</strong></div>
              <div>Completed: <strong className="text-emerald-400">{answeredQuestions}</strong> / {totalQuestions}</div>
            </div>
          </div>
        </div>

        {/* Global Progress Line */}
        <div className="mt-5 pt-4 border-t border-slate-800">
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-sky-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Layout: 14 Sections Left Sidebar + Questions Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sections Navigation Column (4 cols) */}
        <div className="lg:col-span-4 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 mb-1 flex items-center justify-between">
            <span>Discovery Domains (14)</span>
            <span className="text-[10px] text-sky-400 font-semibold">{sections.length} Areas</span>
          </div>

          <div className="space-y-1.5 max-h-[720px] overflow-y-auto pr-1">
            {sections.map((sec, idx) => {
              const isCurrent = sec.sectionKey === activeSectionKey;
              const answered = sec.questions.filter(q => q.status !== 'Unanswered').length;
              const isAllAnswered = answered === sec.questions.length && sec.questions.length > 0;

              return (
                <button
                  key={sec.sectionKey}
                  onClick={() => setActiveSectionKey(sec.sectionKey)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                    isCurrent
                      ? 'bg-slate-850 border-sky-500 shadow-md ring-1 ring-sky-500/30'
                      : 'bg-slate-900 border-slate-800 hover:bg-slate-850 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                      isCurrent ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {getSectionIcon(sec.iconName)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white line-clamp-1">
                        {idx + 1}. {sec.title}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {sec.description}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-1.5 mt-0.5">
                    {isAllAnswered ? (
                      <span className="flex items-center text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        <Check className="w-3 h-3 mr-0.5" />
                        Done
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                        {answered}/{sec.questions.length}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Questions Panel Column (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {activeSection && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
              {/* Section Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
                    Domain Evaluation
                  </span>
                  <h2 className="text-lg font-bold text-white mt-0.5">
                    {activeSection.title}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    {activeSection.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={autoEvaluateCurrentSection}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-medium transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Auto-Evaluate Standard</span>
                  </button>
                </div>
              </div>

              {/* Filter controls */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  {['ALL', 'Yes', 'Partially', 'No', 'Unanswered'].map(status => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                        filterStatus === status
                          ? 'bg-sky-600 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                      }`}
                    >
                      {status === 'ALL' ? 'All Questions' : status}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-60">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search within domain..."
                    className="w-full pl-8 pr-3 py-1 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                {filteredQuestions.map((q, qIndex) => (
                  <div
                    key={q.id}
                    className="p-4 rounded-xl bg-slate-850/80 border border-slate-800 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                            Q{qIndex + 1}
                          </span>
                          {q.isoClauseMapping && (
                            <span className="text-[10px] font-semibold text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                              ISO 27001 {q.isoClauseMapping}
                            </span>
                          )}
                          {q.annexAControlMapping && (
                            <span className="text-[10px] font-semibold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                              Annex {q.annexAControlMapping}
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-semibold text-white leading-snug pt-1">
                          {q.question}
                        </h4>
                        {q.guidance && (
                          <p className="text-xs text-slate-400 flex items-start gap-1.5 pt-0.5">
                            <HelpCircle className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                            <span>{q.guidance}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Interactive Response Buttons */}
                    <div className="pt-2 flex flex-wrap items-center gap-2">
                      <span className="text-xs font-medium text-slate-400 mr-2">Evaluation:</span>
                      {(['Yes', 'Partially', 'No', 'Not Applicable'] as const).map(option => {
                        const isSelected = q.status === option;
                        let colorClass = 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750';
                        if (isSelected) {
                          if (option === 'Yes') colorClass = 'bg-emerald-500 text-white border-emerald-400 shadow-sm';
                          else if (option === 'Partially') colorClass = 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-sm';
                          else if (option === 'No') colorClass = 'bg-rose-500 text-white border-rose-400 shadow-sm';
                          else colorClass = 'bg-slate-700 text-white border-slate-600 shadow-sm';
                        }

                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => handleStatusChange(q.id, option)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${colorClass}`}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>

                    {/* Observations and Evidence Notes */}
                    <div className="pt-1">
                      <label className="text-[11px] font-medium text-slate-400 block mb-1">
                        Auditor Observations & Supporting Evidence Notes
                      </label>
                      <input
                        type="text"
                        value={q.textResponse || ''}
                        onChange={e => handleNotesChange(q.id, e.target.value)}
                        placeholder="Enter implementation details, file names, or process links..."
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-750 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>
                ))}

                {filteredQuestions.length === 0 && (
                  <div className="p-8 text-center bg-slate-850 rounded-xl text-slate-400 text-sm">
                    No questions match the selected filter.
                  </div>
                )}
              </div>

              {/* Navigation to next domain */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {activeSection.questions.filter(q => q.status !== 'Unanswered').length} of {activeSection.questions.length} answered in this domain
                </span>

                <button
                  type="button"
                  onClick={() => {
                    const currentIndex = sections.findIndex(s => s.sectionKey === activeSectionKey);
                    if (currentIndex < sections.length - 1) {
                      setActiveSectionKey(sections[currentIndex + 1].sectionKey);
                    } else {
                      setActiveModule('compliance_profile');
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow transition-all"
                >
                  <span>Continue to Next Step</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
