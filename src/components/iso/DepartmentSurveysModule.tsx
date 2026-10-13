import React, { useState, useMemo } from 'react';
import { useGRC } from '../../context/GRCContext';
import { DepartmentSurveyRecord, DepartmentSurveyQuestion } from '../../types';
import {
  Users,
  Building2,
  Code,
  Shield,
  FileCheck,
  Truck,
  Briefcase,
  CheckCircle2,
  Clock,
  ArrowRight,
  Search,
  Sparkles,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

export const DepartmentSurveysModule: React.FC = () => {
  const { currentTenant, updateDepartmentSurvey, setActiveModule } = useGRC();
  const surveys: DepartmentSurveyRecord[] = currentTenant?.departmentSurveys || [];

  const [selectedDeptId, setSelectedDeptId] = useState<string>(
    surveys[0]?.departmentId || 'dept_it'
  );
  const [searchQuery, setSearchQuery] = useState<string>('');

  const activeSurvey = useMemo(() => {
    return surveys.find(s => s.departmentId === selectedDeptId) || surveys[0];
  }, [surveys, selectedDeptId]);

  const totalQuestions = useMemo(() => {
    return surveys.reduce((acc, s) => acc + s.questions.length, 0);
  }, [surveys]);

  const answeredQuestions = useMemo(() => {
    return surveys.reduce(
      (acc, s) => acc + s.questions.filter(q => Boolean(q.response)).length,
      0
    );
  }, [surveys]);

  const overallProgress = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;

  const handleResponseChange = (questionId: string, response: string) => {
    updateDepartmentSurvey(selectedDeptId, questionId, { response });
  };

  const handleEvidenceNotesChange = (questionId: string, evidenceNotes: string) => {
    updateDepartmentSurvey(selectedDeptId, questionId, { evidenceNotes });
  };

  const autoFillDepartment = () => {
    if (!activeSurvey) return;
    activeSurvey.questions.forEach(q => {
      updateDepartmentSurvey(selectedDeptId, q.id, {
        response: 'Fully Compliant',
        evidenceNotes: `Verified via ${activeSurvey.departmentName} annual audit evidence submission.`
      });
    });
  };

  const getDeptIcon = (deptId: string) => {
    switch (deptId) {
      case 'dept_it': return <Briefcase className="w-4 h-4" />;
      case 'dept_dev': return <Code className="w-4 h-4" />;
      case 'dept_sec': return <Shield className="w-4 h-4" />;
      case 'dept_hr': return <Users className="w-4 h-4" />;
      case 'dept_leg': return <FileCheck className="w-4 h-4" />;
      case 'dept_proc': return <Truck className="w-4 h-4" />;
      default: return <Building2 className="w-4 h-4" />;
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
                Departmental Governance
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-slate-400 font-medium">
                Stage 5 of 24 ISO Workflow
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Departmental Security & Operational Surveys
            </h1>
            <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
              Distribute tailored compliance questions to department heads across IT, DevOps, InfoSec, HR, Legal, Procurement, and Executive Management. Capture evidence references and track operational control implementation at the department level.
            </p>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl shrink-0 flex items-center gap-5">
            <div className="text-center">
              <div className="text-3xl font-bold text-sky-400">{overallProgress}%</div>
              <div className="text-[11px] text-slate-400 font-medium">Completed</div>
            </div>
            <div className="h-10 w-px bg-slate-800" />
            <div className="text-xs text-slate-400 space-y-1">
              <div>Departments: <strong className="text-white">{surveys.length} In-Scope</strong></div>
              <div>Answered: <strong className="text-emerald-400">{answeredQuestions}</strong> / {totalQuestions} Questions</div>
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-5 pt-4 border-t border-slate-800">
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-sky-500 to-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Department Cards / Selector + Active Questions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Department Selection Column (4 cols) */}
        <div className="lg:col-span-4 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 mb-1 flex items-center justify-between">
            <span>In-Scope Departments ({surveys.length})</span>
            <span className="text-[10px] text-sky-400 font-semibold">ISO 27001 Cl. 4.3</span>
          </div>

          <div className="space-y-2">
            {surveys.map(survey => {
              const isSelected = survey.departmentId === selectedDeptId;
              const answered = survey.questions.filter(q => Boolean(q.response)).length;
              const pct = survey.questions.length > 0 ? Math.round((answered / survey.questions.length) * 100) : 0;

              return (
                <button
                  key={survey.departmentId}
                  onClick={() => setSelectedDeptId(survey.departmentId)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-slate-850 border-sky-500 shadow-md ring-1 ring-sky-500/30'
                      : 'bg-slate-900 border-slate-800 hover:bg-slate-850 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                        isSelected ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {getDeptIcon(survey.departmentId)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">
                          {survey.departmentName}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Lead: {survey.headOfDepartment || 'Designated Lead'}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`text-[11px] font-bold ${
                        pct === 100 ? 'text-emerald-400' : 'text-slate-400'
                      }`}>
                        {pct}%
                      </span>
                      <div className="text-[10px] text-slate-500">{answered}/{survey.questions.length}</div>
                    </div>
                  </div>

                  {/* Progress Line */}
                  <div className="mt-3 w-full bg-slate-800 rounded-full h-1 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        pct === 100 ? 'bg-emerald-500' : 'bg-sky-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Questions Panel Column (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {activeSurvey && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
              {/* Department Survey Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
                    Department Assessment Survey
                  </span>
                  <h2 className="text-lg font-bold text-white">
                    {activeSurvey.departmentName}
                  </h2>
                  <p className="text-xs text-slate-400">
                    Lead: <strong className="text-slate-200">{activeSurvey.headOfDepartment}</strong> • Status: {activeSurvey.completionPercentage}% Complete
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={autoFillDepartment}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-medium transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Auto-Complete Department</span>
                  </button>
                </div>
              </div>

              {/* Department Questions List */}
              <div className="space-y-4">
                {activeSurvey.questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="p-4 rounded-xl bg-slate-850/80 border border-slate-800 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                            Requirement {idx + 1}
                          </span>
                          {q.controlMapping && (
                            <span className="text-[10px] font-semibold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                              Annex {q.controlMapping}
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-semibold text-white leading-snug pt-1">
                          {q.question}
                        </h4>
                      </div>
                    </div>

                    {/* Operational Response Buttons */}
                    <div className="pt-2 flex flex-wrap items-center gap-2">
                      <span className="text-xs font-medium text-slate-400 mr-2">Operational Status:</span>
                      {['Fully Compliant', 'Partially Implemented', 'Not Implemented', 'Not Applicable'].map(opt => {
                        const isSelected = q.response === opt;
                        let colorClass = 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750';
                        if (isSelected) {
                          if (opt === 'Fully Compliant') colorClass = 'bg-emerald-500 text-white border-emerald-400 shadow-sm';
                          else if (opt === 'Partially Implemented') colorClass = 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-sm';
                          else if (opt === 'Not Implemented') colorClass = 'bg-rose-500 text-white border-rose-400 shadow-sm';
                          else colorClass = 'bg-slate-700 text-white border-slate-600 shadow-sm';
                        }

                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => handleResponseChange(q.id, opt)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${colorClass}`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {/* Evidence & Implementation Notes */}
                    <div className="pt-1">
                      <label className="text-[11px] font-medium text-slate-400 block mb-1">
                        Supporting Departmental Evidence & Verification Artifacts
                      </label>
                      <input
                        type="text"
                        value={q.evidenceNotes || ''}
                        onChange={e => handleEvidenceNotesChange(q.id, e.target.value)}
                        placeholder="Artifact references, policy sections, ticket numbers, or dashboard links..."
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-750 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Navigation Footer */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {activeSurvey.questions.filter(q => Boolean(q.response)).length} of {activeSurvey.questions.length} questions completed for {activeSurvey.departmentName}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    const currentIndex = surveys.findIndex(s => s.departmentId === selectedDeptId);
                    if (currentIndex < surveys.length - 1) {
                      setSelectedDeptId(surveys[currentIndex + 1].departmentId);
                    } else {
                      setActiveModule('compliance_profile');
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow transition-all"
                >
                  <span>Next Department</span>
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
