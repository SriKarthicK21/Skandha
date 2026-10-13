import React, { useState } from 'react';
import {
  AlertOctagon,
  ShieldCheck,
  Plus,
  Trash2,
  HelpCircle,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { DepartmentScopeProfile } from '../../types';

interface ExclusionItem {
  id: string;
  controlOrProcess: string;
  justification: string;
}

interface ScopeExclusionsRegisterProps {
  exclusions: ExclusionItem[];
  departmentScopes: DepartmentScopeProfile[];
  onAddExclusion: (exclusion: { controlOrProcess: string; justification: string }) => void;
  onRemoveExclusion: (id: string) => void;
}

export const ScopeExclusionsRegister: React.FC<ScopeExclusionsRegisterProps> = ({
  exclusions,
  departmentScopes,
  onAddExclusion,
  onRemoveExclusion
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [controlInput, setControlInput] = useState('');
  const [justificationInput, setJustificationInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const excludedDepts = departmentScopes.filter(d => !d.isInScope);

  const handleSave = () => {
    if (!controlInput.trim() || !justificationInput.trim()) {
      setError('Please provide both the control/process name and an auditor-grade justification.');
      return;
    }
    onAddExclusion({
      controlOrProcess: controlInput.trim(),
      justification: justificationInput.trim()
    });
    setControlInput('');
    setJustificationInput('');
    setIsAdding(false);
    setError(null);
  };

  return (
    <section aria-labelledby="exclusions-heading" className="p-6 rounded-2xl bg-skanda-secondary border border-skanda shadow-lg space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div>
            <h2 id="exclusions-heading" className="text-[18px] font-bold text-white tracking-tight">
              Scope Exclusions & Justifications Register
            </h2>
            <p className="text-[12px] text-slate-300">
              Mandatory under ISO/IEC 27001:2022 Clause 4.3 & Clause 6.1.3 (Statement of Applicability)
            </p>
          </div>
        </div>

        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-3.5 py-1.5 rounded-xl text-[12px] font-semibold bg-skanda-card hover:bg-skanda-elevated text-slate-200 hover:text-white border border-skanda transition flex items-center space-x-1.5 shrink-0"
          >
            <Plus className="w-4 h-4 text-sky-400" />
            <span>Document Exclusion</span>
          </button>
        )}
      </div>

      {/* Add New Exclusion Form */}
      {isAdding && (
        <div className="p-5 rounded-xl bg-skanda-card border border-skanda space-y-3">
          <div className="text-[14px] font-semibold text-white">Record Formal Scope Exclusion</div>
          <p className="text-[12px] text-slate-300">
            Auditors require clear technical or operational justification demonstrating why this control or unit does
            not diminish the security of the in-scope boundary.
          </p>

          <div className="space-y-2">
            <input
              type="text"
              placeholder="Excluded Control or Activity (e.g., A.7.11 Supporting utilities)"
              value={controlInput}
              onChange={e => setControlInput(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg bg-skanda-primary border border-skanda text-[14px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
            <textarea
              rows={3}
              placeholder="Formal Justification (e.g., Apex operates 100% serverless infrastructure on AWS...)"
              value={justificationInput}
              onChange={e => setJustificationInput(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg bg-skanda-primary border border-skanda text-[14px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          {error && <div className="text-[12px] text-rose-400">{error}</div>}

          <div className="flex items-center justify-end space-x-2 pt-1">
            <button
              onClick={() => {
                setIsAdding(false);
                setError(null);
              }}
              className="px-3 py-1.5 rounded-lg text-[12px] text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg text-[12px] font-semibold bg-sky-600 hover:bg-sky-500 text-white transition"
            >
              Save Exclusion
            </button>
          </div>
        </div>
      )}

      {/* Exclusions Table/Cards */}
      <div className="space-y-3">
        {exclusions.map(ex => (
          <div
            key={ex.id}
            className="p-4 rounded-xl bg-skanda-primary border border-skanda flex flex-col md:flex-row md:items-start justify-between gap-4"
          >
            <div className="space-y-1.5 max-w-3xl">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  Control Exclusion
                </span>
                <h3 className="text-[14px] font-semibold text-white">{ex.controlOrProcess}</h3>
              </div>
              <p className="text-[12px] text-slate-300 leading-relaxed font-mono pl-1">
                "{ex.justification}"
              </p>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              <span className="inline-flex items-center space-x-1 text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded">
                <CheckCircle2 className="w-3 h-3" />
                <span>Auditor Validated</span>
              </span>

              {onRemoveExclusion && (
                <button
                  onClick={() => onRemoveExclusion(ex.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition"
                  title="Remove exclusion"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Formally Excluded Departments */}
        {excludedDepts.map(dept => (
          <div
            key={dept.id}
            className="p-4 rounded-xl bg-[#070B17] border border-[#1E293B] flex flex-col md:flex-row md:items-start justify-between gap-4"
          >
            <div className="space-y-1.5 max-w-3xl">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                  Department Boundary Exclusion
                </span>
                <h3 className="text-[14px] font-semibold text-white">{dept.name}</h3>
              </div>
              <p className="text-[12px] text-slate-300 leading-relaxed pl-1">
                {dept.scopeBoundary ||
                  'Excluded from immediate Phase 2 ISMS boundaries. Handles independent non-cloud business operations with no access to production networks.'}
              </p>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              <span className="inline-flex items-center space-x-1 text-[11px] text-slate-400 bg-slate-800/80 border border-slate-700 px-2 py-0.5 rounded">
                <span>Excluded from ISMS</span>
              </span>
            </div>
          </div>
        ))}

        {exclusions.length === 0 && excludedDepts.length === 0 && (
          <div className="p-6 text-center text-slate-400 text-[12px]">
            No exclusions recorded. All organizational units and Annex A controls are currently declared in scope.
          </div>
        )}
      </div>
    </section>
  );
};
