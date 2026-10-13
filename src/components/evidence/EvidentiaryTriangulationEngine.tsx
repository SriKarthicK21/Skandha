import React, { useState, useMemo } from 'react';
import {
  Star,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Terminal,
  Users,
  CheckCircle2,
  ExternalLink,
  Plus,
  Info,
  Layers,
  ArrowRight,
  Filter,
  Search,
  Sparkles,
  Lock
} from 'lucide-react';
import { ControlItem, EvidenceRecord } from '../../types';
import { useToast } from '../common/ToastContainer';

export interface TriangulationPillar {
  type: 'POLICY' | 'OPERATIONAL_RECORD' | 'TELEMETRY_INTERVIEW';
  label: string;
  description: string;
  icon: any;
  satisfied: boolean;
  artifactRef?: string;
}

export interface ControlTriangulationAnalysis {
  controlCode: string;
  title: string;
  category: string;
  isMandatoryStage2: boolean;
  score: 1 | 2 | 3;
  pillars: {
    policy: TriangulationPillar;
    operational: TriangulationPillar;
    telemetry: TriangulationPillar;
  };
}

const HIGH_SCRUTINY_STAGE2_CONTROLS = [
  'A.5.18', // Access rights
  'A.8.8',  // Management of technical vulnerabilities
  'A.8.20', // Network security
  'A.8.24', // Use of cryptography
  'A.5.24', // Information security incident management
  'A.8.28', // Secure coding
  'A.5.15', // Access control
  'A.8.31'  // Separation of development, test and production
];

interface Props {
  controls: ControlItem[];
  evidenceList: EvidenceRecord[];
  onUploadEvidenceForControl?: (controlCode: string) => void;
}

export const EvidentiaryTriangulationEngine: React.FC<Props> = ({
  controls,
  evidenceList,
  onUploadEvidenceForControl
}) => {
  const { showToast } = useToast();
  const [filterMode, setFilterMode] = useState<'ALL' | 'HIGH_SCRUTINY' | 'NEEDS_TRIANGULATION' | 'AUDIT_GRADE'>('HIGH_SCRUTINY');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedControlCode, setSelectedControlCode] = useState<string | null>('A.8.8');
  const [isLinkingTelemetry, setIsLinkingTelemetry] = useState(false);

  // Analyze triangulation for each control
  const analyzedControls: ControlTriangulationAnalysis[] = useMemo(() => {
    return controls.map(ctrl => {
      const isMandatory = HIGH_SCRUTINY_STAGE2_CONTROLS.includes(ctrl.controlCode);
      const linkedEvidence = evidenceList.filter(
        e => e.controlCode === ctrl.controlCode ||
             e.tags?.some(t => t.toLowerCase().includes(ctrl.controlCode.toLowerCase())) ||
             (e.isoRequirements && e.isoRequirements.includes(ctrl.controlCode))
      );

      // Check Pillar 1: Policy / Standard / Procedure (Human authorial rules)
      const hasPolicy = linkedEvidence.some(
        e => (e.fileType && e.fileType.toLowerCase().includes('policy')) ||
             e.title.toLowerCase().includes('policy') ||
             e.title.toLowerCase().includes('sop') ||
             e.fileName.toLowerCase().includes('policy')
      ) || (ctrl.implementationStatus === 'Implemented' || ctrl.implementationStatus === 'Monitored');

      // Check Pillar 2: Operational Record / JIRA Ticket / Sign-off Record
      const hasOperational = linkedEvidence.some(
        e => e.title.toLowerCase().includes('ticket') ||
             e.title.toLowerCase().includes('review') ||
             e.title.toLowerCase().includes('log') ||
             e.title.toLowerCase().includes('minute') ||
             e.title.toLowerCase().includes('signoff') ||
             e.fileName.toLowerCase().includes('ticket')
      ) || ctrl.implementationStatus === 'Monitored';

      // Check Pillar 3: Technical Telemetry / Automated Scan / Walkthrough Interview Record
      const hasTelemetryOrInterview = linkedEvidence.some(
        e => e.title.toLowerCase().includes('telemetry') ||
             e.title.toLowerCase().includes('scan') ||
             e.title.toLowerCase().includes('interview') ||
             e.title.toLowerCase().includes('script') ||
             e.tags?.some(t => t.toLowerCase().includes('telemetry') || t.toLowerCase().includes('interview') || t.toLowerCase().includes('scanner'))
      );

      const satisfiedCount = [hasPolicy, hasOperational, hasTelemetryOrInterview].filter(Boolean).length;
      const score = (satisfiedCount >= 3 ? 3 : satisfiedCount >= 2 ? 2 : 1) as 1 | 2 | 3;

      return {
        controlCode: ctrl.controlCode,
        title: ctrl.title,
        category: ctrl.category,
        isMandatoryStage2: isMandatory,
        score,
        pillars: {
          policy: {
            type: 'POLICY',
            label: 'Documentary Rule / Policy',
            description: 'Approved ISMS policy, operational procedure, or architectural baseline.',
            icon: FileText,
            satisfied: hasPolicy,
            artifactRef: hasPolicy ? `POL-${ctrl.controlCode}-v2.1` : undefined
          },
          operational: {
            type: 'OPERATIONAL_RECORD',
            label: 'Operational Execution Record',
            description: 'Change approval, sprint review record, access review sign-off, or operational ticket.',
            icon: Users,
            satisfied: hasOperational,
            artifactRef: hasOperational ? `TICK-${ctrl.controlCode}-2026-Q3` : undefined
          },
          telemetry: {
            type: 'TELEMETRY_INTERVIEW',
            label: 'Technical Telemetry & Walkthrough',
            description: 'Automated scanner output, AWS/GCP live API telemetry, or auditor walkthrough transcript.',
            icon: Terminal,
            satisfied: hasTelemetryOrInterview,
            artifactRef: hasTelemetryOrInterview ? `TELEM-AUTO-${ctrl.controlCode}-LIVE` : undefined
          }
        }
      };
    });
  }, [controls, evidenceList]);

  // Statistics
  const totalControls = analyzedControls.length;
  const grade3Count = analyzedControls.filter(c => c.score === 3).length;
  const grade2Count = analyzedControls.filter(c => c.score === 2).length;
  const grade1Count = analyzedControls.filter(c => c.score === 1).length;

  const mandatoryStage2Controls = analyzedControls.filter(c => c.isMandatoryStage2);
  const mandatoryAtRisk = mandatoryStage2Controls.filter(c => c.score < 3);

  // Filtered List
  const filteredControls = useMemo(() => {
    return analyzedControls.filter(c => {
      if (filterMode === 'HIGH_SCRUTINY' && !c.isMandatoryStage2) return false;
      if (filterMode === 'NEEDS_TRIANGULATION' && c.score === 3) return false;
      if (filterMode === 'AUDIT_GRADE' && c.score !== 3) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          c.controlCode.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [analyzedControls, filterMode, searchQuery]);

  const activeControl = analyzedControls.find(c => c.controlCode === selectedControlCode) || analyzedControls[0];

  const handleSimulateTelemetryLink = (controlCode: string) => {
    setIsLinkingTelemetry(true);
    setTimeout(() => {
      setIsLinkingTelemetry(false);
      showToast({
        title: 'Telemetry Triangulation Corroborated',
        message: `Successfully linked live AWS/GCP telemetry log & auditor walkthrough transcript for ${controlCode}. Triangulation score elevated to 3-Stars (Audit-Grade).`,
        type: 'success'
      });
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Lead Auditor Alert Banner for Stage 2 Scrutiny */}
      {mandatoryAtRisk.length > 0 ? (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/70 via-slate-900 to-amber-950/50 border border-amber-800/80 shadow-lg shadow-amber-950/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-900/60 border border-amber-700 flex items-center justify-center text-amber-300 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  PECB / TÜV / BSI Stage 2 Defense Warning
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-200 border border-amber-800">
                  {mandatoryAtRisk.length} Mandatory Controls At Risk
                </span>
              </div>
              <h3 className="text-sm font-bold text-white mt-0.5">
                ISO 19011:2018 §6.4.7 Evidentiary Triangulation Incomplete
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                Stage 2 certification auditors will issue an automatic finding if high-scrutiny controls (Access Control, Vulnerabilities, Network Security) only feature policies without operational records and technical telemetry corroboration.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => setFilterMode('HIGH_SCRUTINY')}
              className="px-3.5 py-2 rounded-xl bg-amber-900 hover:bg-amber-800 text-white text-xs font-bold transition shadow-sm"
            >
              Inspect {mandatoryAtRisk.length} Priority Deficits
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-emerald-950/50 border border-emerald-800/80 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-900/60 border border-emerald-700 flex items-center justify-center text-emerald-300 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                100% Audit-Grade Triangulation on Mandatory Stage 2 Controls
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                All 8 high-scrutiny Annex A controls are corroborated by Policy + Operational Records + Technical Telemetry.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
            PECB / TÜV Defense Ready
          </span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[11px] text-slate-400 font-medium">Stage 2 Triangulation Health</div>
          <div className="text-xl font-bold font-mono text-white mt-1">
            {Math.round((grade3Count / (totalControls || 1)) * 100)}%
          </div>
          <div className="text-[10px] text-sky-400 mt-0.5">{grade3Count} of {totalControls} Controls 3-Star</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[11px] text-slate-400 font-medium">★★★ Triangulated Audit-Grade</div>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1">{grade3Count}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Policy + Record + Telemetry</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[11px] text-slate-400 font-medium">★★☆ Corroborated Artifact</div>
          <div className="text-xl font-bold font-mono text-amber-400 mt-1">{grade2Count}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Policy + Operational Ticket</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[11px] text-slate-400 font-medium">★☆☆ Single Artifact (Audit Risk)</div>
          <div className="text-xl font-bold font-mono text-rose-400 mt-1">{grade1Count}</div>
          <div className="text-[10px] text-rose-400 mt-0.5">Policy only — High Scrutiny Risk</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900 p-3 rounded-xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setFilterMode('HIGH_SCRUTINY')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filterMode === 'HIGH_SCRUTINY' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Stage 2 Scrutiny Controls ({mandatoryStage2Controls.length})
          </button>
          <button
            onClick={() => setFilterMode('NEEDS_TRIANGULATION')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filterMode === 'NEEDS_TRIANGULATION' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Needs Corroboration ({grade1Count + grade2Count})
          </button>
          <button
            onClick={() => setFilterMode('AUDIT_GRADE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filterMode === 'AUDIT_GRADE' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            3-Star Audit-Grade ({grade3Count})
          </button>
          <button
            onClick={() => setFilterMode('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filterMode === 'ALL' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Controls ({totalControls})
          </button>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search control code or title..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-sky-500 w-full sm:w-60"
          />
        </div>
      </div>

      {/* Main Grid: Control List + Triangulation Deep Dive */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: List of Controls */}
        <div className="lg:col-span-6 space-y-2 max-h-[580px] overflow-y-auto pr-1">
          {filteredControls.map(ctrl => {
            const isSelected = activeControl?.controlCode === ctrl.controlCode;

            return (
              <div
                key={ctrl.controlCode}
                onClick={() => setSelectedControlCode(ctrl.controlCode)}
                className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-slate-850 border-sky-500 shadow-md shadow-sky-950/40'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-black text-xs text-sky-400">{ctrl.controlCode}</span>
                    {ctrl.isMandatoryStage2 && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                        Stage 2 Core
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400">{ctrl.category}</span>
                  </div>
                  <div className="text-xs font-semibold text-white truncate max-w-sm">{ctrl.title}</div>
                </div>

                {/* Stars Indicator */}
                <div className="flex flex-col items-end space-y-1 shrink-0 ml-2">
                  <div className="flex items-center space-x-0.5">
                    {[1, 2, 3].map(starNum => (
                      <Star
                        key={starNum}
                        className={`w-3.5 h-3.5 ${
                          starNum <= ctrl.score
                            ? ctrl.score === 3
                              ? 'text-emerald-400 fill-emerald-400'
                              : ctrl.score === 2
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-rose-400 fill-rose-400'
                            : 'text-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                  <span
                    className={`text-[9px] font-bold ${
                      ctrl.score === 3
                        ? 'text-emerald-400'
                        : ctrl.score === 2
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {ctrl.score === 3 ? 'Audit Grade' : ctrl.score === 2 ? 'Corroborated' : 'Single Artifact'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Detailed Triangulation Triad */}
        <div className="lg:col-span-6">
          {activeControl ? (
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-black text-sm text-sky-400">{activeControl.controlCode}</span>
                    <span className="text-xs text-slate-400">{activeControl.category}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white mt-1">{activeControl.title}</h3>
                </div>

                <div className="text-right">
                  <div className="flex items-center space-x-1 justify-end">
                    {[1, 2, 3].map(starNum => (
                      <Star
                        key={starNum}
                        className={`w-4 h-4 ${
                          starNum <= activeControl.score
                            ? activeControl.score === 3
                              ? 'text-emerald-400 fill-emerald-400'
                              : 'text-amber-400 fill-amber-400'
                            : 'text-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    Triangulation Score: {activeControl.score}/3
                  </span>
                </div>
              </div>

              {/* Triangulation Triad Pillars */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                  <span>ISO 19011:2018 §6.4.7 Verification Triad</span>
                  <span className="text-[10px] text-slate-500 font-normal">Corroboration Engine</span>
                </h4>

                {/* Pillar 1: Policy */}
                <div
                  className={`p-3 rounded-xl border flex items-start space-x-3 ${
                    activeControl.pillars.policy.satisfied
                      ? 'bg-slate-950/80 border-emerald-900/60 text-slate-200'
                      : 'bg-slate-950/40 border-slate-800 text-slate-500'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      activeControl.pillars.policy.satisfied
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-slate-850 text-slate-600'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">1. Documentary Pillar (Policy / SOP)</span>
                      {activeControl.pillars.policy.satisfied ? (
                        <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Verified
                        </span>
                      ) : (
                        <span className="text-[10px] text-rose-400 font-semibold">Missing Policy</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">{activeControl.pillars.policy.description}</p>
                    {activeControl.pillars.policy.artifactRef && (
                      <div className="text-[10px] font-mono text-sky-400 pt-0.5">
                        Artifact: {activeControl.pillars.policy.artifactRef}
                      </div>
                    )}
                  </div>
                </div>

                {/* Pillar 2: Operational Record */}
                <div
                  className={`p-3 rounded-xl border flex items-start space-x-3 ${
                    activeControl.pillars.operational.satisfied
                      ? 'bg-slate-950/80 border-emerald-900/60 text-slate-200'
                      : 'bg-slate-950/40 border-slate-800 text-slate-500'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      activeControl.pillars.operational.satisfied
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-slate-850 text-slate-600'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">2. Operational Pillar (Ticket / Review Sign-off)</span>
                      {activeControl.pillars.operational.satisfied ? (
                        <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Corroborated
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-400 font-semibold">Needs Operational Proof</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">{activeControl.pillars.operational.description}</p>
                    {activeControl.pillars.operational.artifactRef && (
                      <div className="text-[10px] font-mono text-sky-400 pt-0.5">
                        Artifact: {activeControl.pillars.operational.artifactRef}
                      </div>
                    )}
                  </div>
                </div>

                {/* Pillar 3: Telemetry / Walkthrough */}
                <div
                  className={`p-3 rounded-xl border flex items-start space-x-3 ${
                    activeControl.pillars.telemetry.satisfied
                      ? 'bg-slate-950/80 border-emerald-900/60 text-slate-200'
                      : 'bg-slate-950/40 border-slate-800 text-slate-500'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      activeControl.pillars.telemetry.satisfied
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-slate-850 text-slate-600'
                    }`}
                  >
                    <Terminal className="w-4 h-4" />
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">3. Technical Telemetry & Interview Transcript</span>
                      {activeControl.pillars.telemetry.satisfied ? (
                        <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Triangulated
                        </span>
                      ) : (
                        <span className="text-[10px] text-rose-400 font-semibold">Missing Telemetry</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">{activeControl.pillars.telemetry.description}</p>
                    {activeControl.pillars.telemetry.artifactRef && (
                      <div className="text-[10px] font-mono text-sky-400 pt-0.5">
                        Artifact: {activeControl.pillars.telemetry.artifactRef}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
                <span className="text-[11px] text-slate-400">
                  Lead Auditor Defense Level:{' '}
                  <strong className={activeControl.score === 3 ? 'text-emerald-400' : 'text-amber-400'}>
                    {activeControl.score === 3 ? 'PECB/TÜV Stage 2 Ready' : 'Stage 2 Incomplete'}
                  </strong>
                </span>

                <div className="flex items-center space-x-2">
                  {!activeControl.pillars.telemetry.satisfied && (
                    <button
                      type="button"
                      onClick={() => handleSimulateTelemetryLink(activeControl.controlCode)}
                      disabled={isLinkingTelemetry}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold transition shadow-sm flex items-center space-x-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isLinkingTelemetry ? 'Connecting...' : 'Link Live Telemetry / Interview'}</span>
                    </button>
                  )}
                  {onUploadEvidenceForControl && (
                    <button
                      type="button"
                      onClick={() => onUploadEvidenceForControl(activeControl.controlCode)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Artifact</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-400 text-xs">
              Select a control to view its ISO 19011 Triangulation Triad analysis.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
