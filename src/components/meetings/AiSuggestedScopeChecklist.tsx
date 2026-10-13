import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Plus,
  Check,
  RefreshCw,
  HelpCircle,
  ShieldCheck,
  BookOpen,
  ArrowRight,
  Layers
} from 'lucide-react';
import { AiScopeChecklistItem, StakeholderRole, InterviewObjective } from '../../types/meetingScheduler';
import { getAiSuggestedScopeAreas } from '../../data/aiScopeSuggestions';

interface AiSuggestedScopeChecklistProps {
  framework: string;
  department: string;
  role: StakeholderRole;
  interviewObjective?: InterviewObjective;
  objectiveDescription?: string;
  scopeItems: AiScopeChecklistItem[];
  onUpdateScopeItems: (items: AiScopeChecklistItem[]) => void;
  onAppendQuestions?: (questions: Array<{ question: string; clause: string }>) => void;
}

export const AiSuggestedScopeChecklist: React.FC<AiSuggestedScopeChecklistProps> = ({
  framework,
  department,
  role,
  interviewObjective,
  objectiveDescription,
  scopeItems,
  onUpdateScopeItems,
  onAppendQuestions
}) => {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationSource, setGenerationSource] = useState<'gemini-3.8-flash' | 'heuristics-engine'>('heuristics-engine');
  const [recentlyAdopted, setRecentlyAdopted] = useState<boolean>(false);

  // Auto-populate or regenerate when framework, department, or role changes
  useEffect(() => {
    // Generate default high-precision scope areas for current inputs
    const generated = getAiSuggestedScopeAreas(framework, department, role, interviewObjective);
    onUpdateScopeItems(generated);
  }, [framework, department, role, interviewObjective]);

  const handleToggleItem = (id: string) => {
    const updated = scopeItems.map(item =>
      item.id === id ? { ...item, selected: !item.selected } : item
    );
    onUpdateScopeItems(updated);
  };

  // Re-analyze with AI (calls backend route or fallback with brief loading state)
  const handleAiReanalyze = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/v1/meetings/generate-scope', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          framework,
          department,
          role,
          interviewObjective,
          objectiveDescription
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.scopeAreas && data.scopeAreas.length >= 3) {
          onUpdateScopeItems(data.scopeAreas);
          setGenerationSource('gemini-3.8-flash');
          setIsGenerating(false);
          return;
        }
      }
    } catch (err) {
      console.warn('[AI Scope] Backend fetch failed, utilizing client synthesis:', err);
    }

    // Heuristic fallback with simulated brief analysis
    setTimeout(() => {
      const regenerated = getAiSuggestedScopeAreas(framework, department, role, interviewObjective);
      onUpdateScopeItems(regenerated);
      setGenerationSource('heuristics-engine');
      setIsGenerating(false);
    }, 450);
  };

  const handleAdoptSelected = () => {
    if (!onAppendQuestions) return;

    const selectedAreas = scopeItems.filter(item => item.selected !== false);
    const questionsToAppend: Array<{ question: string; clause: string }> = [];

    selectedAreas.forEach(area => {
      area.suggestedQuestions.forEach(q => {
        questionsToAppend.push({
          question: q,
          clause: area.mappedControlOrClause
        });
      });
    });

    if (questionsToAppend.length > 0) {
      onAppendQuestions(questionsToAppend);
      setRecentlyAdopted(true);
      setTimeout(() => setRecentlyAdopted(false), 2500);
    }
  };

  const selectedCount = scopeItems.filter(i => i.selected !== false).length;

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-indigo-950/20 to-slate-950 border border-indigo-500/30 space-y-4 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <label className="text-xs font-bold text-white uppercase tracking-wider">
              AI-Suggested Scope Checklist (Top 3 Critical Discussion Areas)
            </label>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-900/60 text-indigo-300 border border-indigo-700/50">
              {generationSource === 'gemini-3.8-flash' ? 'Gemini 3.8 Live AI' : 'ISO Domain Model'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Dynamically derived from <strong className="text-white">{framework}</strong> for{' '}
            <strong className="text-sky-300">{department}</strong> ({role.replace(/_/g, ' ')})
          </p>
        </div>

        {/* Action controls */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={handleAiReanalyze}
            disabled={isGenerating}
            className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-medium transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
            title="Re-run AI scope synthesis for current department and framework"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Synthesizing...' : 'AI Re-analyze'}</span>
          </button>

          {onAppendQuestions && (
            <button
              type="button"
              onClick={handleAdoptSelected}
              disabled={selectedCount === 0}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-xs ${
                recentlyAdopted
                  ? 'bg-emerald-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 disabled:cursor-not-allowed'
              }`}
              title="Append selected discussion area probe questions into pre-populated interview questions"
            >
              {recentlyAdopted ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Adopted into Plan!</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adopt {selectedCount} Areas to Questions</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* The 3 Critical Discussion Areas Checklist */}
      <div className="space-y-3">
        {scopeItems.slice(0, 3).map((item, index) => {
          const isSelected = item.selected !== false;
          const isCritical = item.severityImpact === 'CRITICAL';

          return (
            <div
              key={item.id || `scope_area_${index}`}
              className={`p-3.5 rounded-xl border transition-all ${
                isSelected
                  ? 'bg-slate-900/90 border-indigo-500/40 shadow-xs'
                  : 'bg-slate-950/60 border-slate-800/80 opacity-60'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Custom Interactive Checkbox */}
                <button
                  type="button"
                  onClick={() => handleToggleItem(item.id)}
                  className="mt-0.5 shrink-0 focus:outline-none cursor-pointer"
                  title={isSelected ? 'Deselect discussion area' : 'Select discussion area'}
                >
                  {isSelected ? (
                    <div className="w-5 h-5 rounded-md bg-indigo-600 border border-indigo-400 flex items-center justify-center text-white shadow-xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-md bg-slate-900 border border-slate-700 hover:border-slate-500" />
                  )}
                </button>

                <div className="flex-1 min-w-0 space-y-1.5">
                  {/* Title and Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <div className="flex items-center space-x-2 min-w-0">
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700 shrink-0">
                        Area #{index + 1}
                      </span>
                      <h4 className="text-xs font-bold text-white truncate">{item.topic}</h4>
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0">
                      <span
                        className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border flex items-center space-x-1 ${
                          isCritical
                            ? 'bg-rose-950/80 text-rose-300 border-rose-700/60'
                            : 'bg-amber-950/80 text-amber-300 border-amber-700/60'
                        }`}
                      >
                        {isCritical && <Flame className="w-2.5 h-2.5 text-rose-400" />}
                        <span>{item.severityImpact} PRIORITY</span>
                      </span>
                      <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-sky-950/80 text-sky-300 border border-sky-800/60">
                        {item.mappedControlOrClause}
                      </span>
                    </div>
                  </div>

                  {/* Rationale */}
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    <strong className="text-indigo-300">Audit Rationale:</strong> {item.rationale}
                  </p>

                  {/* Suggested Probing Questions */}
                  {item.suggestedQuestions && item.suggestedQuestions.length > 0 && (
                    <div className="pt-1.5 mt-1.5 border-t border-slate-800/80 space-y-1">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                        Suggested Key Interview Probe Questions:
                      </span>
                      <div className="space-y-1">
                        {item.suggestedQuestions.map((sq, sqIdx) => (
                          <div
                            key={sqIdx}
                            className="text-[11px] text-slate-400 flex items-start space-x-2 pl-1 bg-slate-950/40 py-1 px-2 rounded-lg border border-slate-800/40"
                          >
                            <span className="text-indigo-400 font-mono text-[10px] shrink-0 font-bold">
                              Q{index + 1}.{sqIdx + 1}
                            </span>
                            <span className="text-slate-300">{sq}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center space-x-1.5 text-[11px]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>
            Selected areas ({selectedCount}/3) will be mapped into the meeting agenda & ISO working paper.
          </span>
        </div>
        <span className="text-[10px] text-indigo-300 font-medium">
          ISO 19011 Clause 6.3.2 Audit Scope Alignment
        </span>
      </div>
    </div>
  );
};
