/**
 * SKANDA Enterprise Framework Factory — Ingestion Factory & Pipeline Tracker
 * Path: src/components/framework-factory/FrameworkIngestionView.tsx
 */

import React, { useState } from 'react';
import {
  UploadCloud,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertOctagon,
  Layers,
  ArrowRight,
  Terminal,
  Lock,
  Cpu,
  Sparkles,
  Info
} from 'lucide-react';
import { FrameworkIngestionJob, IngestionPipelineStage, IngestionSourceFormat } from '../../types/frameworkFactoryTypes';

interface FrameworkIngestionViewProps {
  jobs: FrameworkIngestionJob[];
  onSubmitJob: (job: Partial<FrameworkIngestionJob>) => FrameworkIngestionJob;
}

export const FrameworkIngestionView: React.FC<FrameworkIngestionViewProps> = ({
  jobs,
  onSubmitJob
}) => {
  const [activeJobs, setActiveJobs] = useState<FrameworkIngestionJob[]>(jobs);
  const [sourceFormat, setSourceFormat] = useState<IngestionSourceFormat>('PDF');
  const [sourceUrl, setSourceUrl] = useState<string>('');
  const [frameworkCode, setFrameworkCode] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pipelineStages: IngestionPipelineStage[] = [
    'SOURCE',
    'RETRIEVE',
    'HASH',
    'PARSE',
    'STRUCTURE',
    'CLASSIFY',
    'NORMALIZE',
    'VERSION',
    'HUMAN_REVIEW',
    'PUBLISH',
    'MAP',
    'ASSURE'
  ];

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!frameworkCode.trim()) return;

    setIsSubmitting(true);
    const newJob = onSubmitJob({
      frameworkCode: frameworkCode.toUpperCase(),
      sourceFormat,
      sourceUrl: sourceUrl || 'https://authoritative-standard.org/publication',
      sourceHash: 'SHA256_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    });

    setActiveJobs(prev => [newJob, ...prev]);
    setFrameworkCode('');
    setSourceUrl('');
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Framework Ingestion Factory & Pipeline Pipeline
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            12-Stage Ingestion Pipeline: SOURCE → RETRIEVE → HASH → PARSE → STRUCTURE → CLASSIFY → NORMALIZE → VERSION → HUMAN REVIEW → PUBLISH → MAP → ASSURE.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/70 border border-amber-300/40 text-amber-800 dark:text-amber-200 text-xs font-semibold">
          <Lock className="w-3.5 h-3.5" />
          No Framework Becomes Active Purely on Upload (Human Review Gated)
        </div>
      </div>

      {/* Main Grid: Upload Intake on Left, Active Pipeline Jobs on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Upload & Ingestion Form */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-500" />
            Ingest New Standard / Statutory Source
          </h3>

          <form onSubmit={handleUploadSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Framework / Statute Code
              </label>
              <input
                type="text"
                required
                value={frameworkCode}
                onChange={e => setFrameworkCode(e.target.value)}
                placeholder="e.g. APRA_CPS_234, DORA_RTS_2025"
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Ingestion Source Format
              </label>
              <select
                value={sourceFormat}
                onChange={e => setSourceFormat(e.target.value as IngestionSourceFormat)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="PDF">Official PDF Gazette / Standard Document</option>
                <option value="HTML">Official Regulatory Portal HTML</option>
                <option value="API_JSON">Official Statutory XML / JSON API</option>
                <option value="STRUCTURED_CATALOG">Structured CSV / XLSX Control Catalog</option>
                <option value="MANUAL_CONTROLLED">Manual Controlled Ingestion Dossier</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Authoritative Source URL / Gazette Link
              </label>
              <input
                type="url"
                value={sourceUrl}
                onChange={e => setSourceUrl(e.target.value)}
                placeholder="https://official-gazette.gov/regulation/doc.pdf"
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            {/* Drag and Drop Box */}
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-center space-y-2 hover:border-indigo-400 transition-colors">
              <UploadCloud className="w-8 h-8 text-indigo-500 mx-auto" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Drag & Drop Official Standard PDF or Catalog File
              </p>
              <p className="text-[11px] text-slate-400">Supported formats: PDF, XML, JSON, CSV (Max 50MB)</p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm flex items-center justify-center gap-2 transition-all"
            >
              <Cpu className="w-4 h-4 text-indigo-200" />
              Initiate Ingestion Pipeline Job
            </button>
          </form>
        </div>

        {/* Right Col: Ingestion Pipeline Progress */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Active Ingestion Pipeline Jobs ({activeJobs.length})
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">Stage Progression</span>
          </div>

          <div className="space-y-4">
            {activeJobs.map(job => (
              <div
                key={job.jobId}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-3 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-2 py-0.5 rounded">
                      {job.frameworkCode}
                    </span>
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">
                      Job ID: {job.jobId}
                    </span>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    job.status === 'COMPLETED'
                      ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                      : 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 animate-pulse'
                  }`}>
                    {job.status} • STAGE: {job.stage}
                  </span>
                </div>

                {/* 12-Stage Visual Progress Line */}
                <div className="space-y-1.5 pt-1">
                  <div className="grid grid-cols-12 gap-1 text-[9px] font-mono text-center">
                    {pipelineStages.map((stage, idx) => {
                      const currentStageIdx = pipelineStages.indexOf(job.stage);
                      const isCompleted = idx <= currentStageIdx;
                      const isCurrent = idx === currentStageIdx;
                      return (
                        <div
                          key={stage}
                          title={stage}
                          className={`h-2 rounded-full transition-all ${
                            isCompleted
                              ? isCurrent
                                ? 'bg-indigo-600 ring-2 ring-indigo-400 animate-pulse'
                                : 'bg-emerald-500'
                              : 'bg-slate-200 dark:bg-slate-800'
                          }`}
                        />
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                    <span>Stage 1: SOURCE</span>
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">Current: {job.stage}</span>
                    <span>Stage 12: ASSURE</span>
                  </div>
                </div>

                {/* Reviewer Note & Extraction Metrics */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span>Extracted Sections: <strong>{job.extractedSectionsCount}</strong></span>
                    <span>Requirements Parsed: <strong>{job.extractedRequirementsCount}</strong></span>
                    <span>Format: <strong>{job.sourceFormat}</strong></span>
                  </div>
                  {job.reviewerNotes && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                      <strong>Audit Note:</strong> {job.reviewerNotes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
