/**
 * SKANDA ENTERPRISE VENDOR DUE DILIGENCE & QUESTIONNAIRE WORKSPACE
 * Path: src/components/tprm/VendorDueDiligenceWorkspace.tsx
 */

import React, { useState } from 'react';
import {
  ClipboardCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Upload,
  Sparkles,
  ShieldCheck,
  Send,
  Search,
  Filter,
  ArrowRight
} from 'lucide-react';
import { useTprmStore } from '../../stores/useTprmStore';
import { useGRC } from '../../context/GRCContext';
import { useToast } from '../common/ToastContainer';
import { MASTER_TPRM_QUESTIONS } from '../../data/tprmMasterData';
import { QuestionnaireFrameworkType } from '../../types/tprmTypes';
import { tprmIntelligenceEngine } from '../../services/grc/TprmIntelligenceEngine';

export const VendorDueDiligenceWorkspace: React.FC = () => {
  const { theme } = useGRC();
  const { showToast } = useToast();
  const { selectedVendor, vendors, setSelectedVendorId } = useTprmStore();

  const [activeFramework, setActiveFramework] = useState<QuestionnaireFrameworkType>('MAS_TRM_OUTSOURCING_SEC12');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  const isLight = theme === 'light';

  if (!selectedVendor) {
    return <div className="p-8 text-center text-slate-400">Please select a vendor to view assessments.</div>;
  }

  // Generate tailored assessment
  const currentAssessment = selectedVendor.activeAssessments[0] || tprmIntelligenceEngine.generateTailoredAssessment(selectedVendor, activeFramework);

  const categories = Array.from(new Set(MASTER_TPRM_QUESTIONS.map(q => q.category)));

  const filteredQuestions = MASTER_TPRM_QUESTIONS.filter(q => {
    if (filterCategory !== 'ALL' && q.category !== filterCategory) return false;
    return true;
  });

  const handleDispatch = () => {
    showToast({
      title: 'Due Diligence Dispatched',
      message: `${activeFramework} dispatched to ${selectedVendor.profile.legalName} security team with 14-day completion SLA.`,
      type: 'success'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Strip */}
      <div
        className={`p-6 rounded-2xl border transition ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
                Risk-Based Due Diligence Engine
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Assessing: <strong className={isLight ? 'text-slate-900' : 'text-white'}>{selectedVendor.profile.legalName}</strong>
              </span>
            </div>
            <h2 className={`text-xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Standard Information Gathering & Regulatory Due Diligence
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl mt-0.5 leading-relaxed">
              Dynamic question selection based on vendor criticality tier, data access permissions, and cloud architecture.
            </p>
          </div>

          <div className="flex items-center space-x-2.5">
            <select
              value={activeFramework}
              onChange={e => setActiveFramework(e.target.value as QuestionnaireFrameworkType)}
              className={`p-2 rounded-xl text-xs font-bold border focus:outline-none ${
                isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
              }`}
            >
              <option value="MAS_TRM_OUTSOURCING_SEC12">MAS TRM Outsourcing Sec 12</option>
              <option value="SIG_LITE_ANNEX_A">SIG Lite + ISO 27001 Annex A</option>
              <option value="CSA_CAIQ_V4">Cloud Security Alliance (CSA CAIQ v4)</option>
              <option value="DPDP_PROCESSOR_DILIGENCE">India DPDP Act Sec 8 Due Diligence</option>
              <option value="AI_VENDOR_SAFETY_ISO42001">ISO 42001 AI Vendor Safety</option>
            </select>

            <button
              onClick={handleDispatch}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Dispatch Assessment</span>
            </button>
          </div>
        </div>

        {/* Score & Progress Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/60 border-slate-700'}`}>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Assessment Score</span>
            <div className="text-lg font-black text-emerald-400 mt-0.5">{currentAssessment.overallScorePercent}%</div>
            <span className="text-[10px] text-slate-400">Weighted compliance index</span>
          </div>

          <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/60 border-slate-700'}`}>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Questions Completed</span>
            <div className="text-lg font-black text-sky-400 mt-0.5">{currentAssessment.answeredQuestions} / {currentAssessment.totalQuestions}</div>
            <span className="text-[10px] text-slate-400">100% Mandatory Answered</span>
          </div>

          <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/60 border-slate-700'}`}>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Evidence Attachments</span>
            <div className="text-lg font-black text-indigo-400 mt-0.5">{currentAssessment.evidenceItemsProvidedCount} Documents</div>
            <span className="text-[10px] text-slate-400">Cryptographically Sealed</span>
          </div>

          <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/60 border-slate-700'}`}>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Assurance Status</span>
            <div className="text-lg font-black text-teal-400 mt-0.5">{currentAssessment.status}</div>
            <span className="text-[10px] text-slate-400">Lead Assessor: {currentAssessment.leadAssessor}</span>
          </div>
        </div>
      </div>

      {/* Category Filter Bar */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        <button
          onClick={() => setFilterCategory('ALL')}
          className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            filterCategory === 'ALL'
              ? 'bg-sky-600 text-white'
              : isLight
              ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          All Domains ({MASTER_TPRM_QUESTIONS.length})
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              filterCategory === cat
                ? 'bg-sky-600 text-white'
                : isLight
                ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {cat.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        {filteredQuestions.map((q, idx) => (
          <div
            key={q.id}
            className={`p-5 rounded-2xl border transition space-y-3 ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded border bg-slate-800 text-sky-300 border-slate-700">
                    {q.questionCode}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    {q.category.replace(/_/g, ' ')}
                  </span>
                  {q.isMandatory && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30">
                      MANDATORY
                    </span>
                  )}
                </div>
                <h4 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {q.questionText}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {q.guidanceText}
                </p>
              </div>

              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>YES_FULL_COMPLIANCE</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">Weight: {q.weight}/10</span>
              </div>
            </div>

            {/* Mapped Controls & Evidence Requirements Strip */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px]">
              <div className="flex items-center space-x-2">
                <span className="text-slate-400 font-semibold">Mapped Controls:</span>
                <div className="flex flex-wrap gap-1">
                  {q.mappedControlIds.map(ctrl => (
                    <span key={ctrl} className="px-1.5 py-0.2 rounded bg-indigo-500/15 text-indigo-300 font-mono text-[10px] border border-indigo-500/30">
                      {ctrl}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-slate-400">Evidence Required:</span>
                <span className="font-mono text-emerald-400 font-semibold">✓ Verified Attestation</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
