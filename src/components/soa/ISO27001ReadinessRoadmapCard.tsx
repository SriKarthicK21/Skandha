import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  ChevronRight,
  FileText,
  Lock,
  Download,
  Users,
  Building,
  Sparkles,
  Layers,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Award,
  CheckSquare,
  FileCheck2,
  Calendar,
  Filter
} from 'lucide-react';
import { ControlItem } from '../../types';

interface ISO27001ReadinessRoadmapCardProps {
  controls: ControlItem[];
  onOpenRemediationDrawer: (ctrl: ControlItem) => void;
  onFilterStatus: (status: string) => void;
  onLockBaseline: () => void;
  onExportPDF: () => void;
  isBaselineLocked: boolean;
  baselineHash?: string;
}

export const ISO27001ReadinessRoadmapCard: React.FC<ISO27001ReadinessRoadmapCardProps> = ({
  controls,
  onOpenRemediationDrawer,
  onFilterStatus,
  onLockBaseline,
  onExportPDF,
  isBaselineLocked,
  baselineHash
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [activeStep, setActiveStep] = useState<number>(1);

  // Find priority controls
  const ctrlA57 = controls.find(c => c.controlCode === 'A.5.7');
  const ctrlA523 = controls.find(c => c.controlCode === 'A.5.23');
  const ctrlA89 = controls.find(c => c.controlCode === 'A.8.9');
  const ctrlA816 = controls.find(c => c.controlCode === 'A.8.16');
  const ctrlA828 = controls.find(c => c.controlCode === 'A.8.28');

  const priorityControls = [
    {
      code: 'A.5.7',
      title: 'Threat Intelligence',
      owner: 'SecOps & Incident Response / Sarah Chen',
      deadline: '2026-10-13',
      priority: 'Critical',
      ctrl: ctrlA57,
      milestone: 'Connect automated RSS/API feeds (CISA KEV catalog, vendor advisories) to Slack alert channel'
    },
    {
      code: 'A.5.23',
      title: 'Information Security for Cloud Services',
      owner: 'Cloud Infrastructure Architect / Marcus Brody',
      deadline: '2026-10-13',
      priority: 'High',
      ctrl: ctrlA523,
      milestone: 'Download AWS/GCP/Azure SOC 2 Type II reports and ISO 27001 certificates into evidence repository'
    },
    {
      code: 'A.8.9',
      title: 'Configuration Management',
      owner: 'DevSecOps Engineering Lead',
      deadline: '2026-10-13',
      priority: 'High',
      ctrl: ctrlA89,
      milestone: 'Export and attach baseline configuration scanning results (AWS Config & CIS Benchmark reports)'
    },
    {
      code: 'A.8.16',
      title: 'Monitoring Activities',
      owner: 'SecOps & Incident Response',
      deadline: '2026-10-13',
      priority: 'Critical',
      ctrl: ctrlA816,
      milestone: 'Validate root/admin login alerts, VPC changes, and firewall modifications generate SIEM notifications'
    },
    {
      code: 'A.8.28',
      title: 'Secure Coding',
      owner: 'DevSecOps Engineering Lead',
      deadline: '2026-10-13',
      priority: 'Critical',
      ctrl: ctrlA828,
      milestone: 'Enforce CI/CD pipeline SAST/dependency vulnerability scanning with blocking rules on Critical CVEs'
    }
  ];

  const mandatoryGovernanceRecords = [
    {
      id: 'gov-1',
      clause: 'Annex A.5.18 & A.5.15',
      title: 'User Access Recertification Record',
      description: 'Quarterly review of user accounts across AWS IAM, GitHub Enterprise, and PostgreSQL production clusters.',
      verification: 'Verified (Zero orphan accounts, 24h deprovisioning SLA)',
      status: 'Ready'
    },
    {
      id: 'gov-2',
      clause: 'Annex A.8.13',
      title: 'Backup Restoration Drill Record',
      description: 'Test restore of production database snapshot into isolated staging VPC recording RTO (38m) and RPO (4m12s).',
      verification: 'Verified (Checksum pass 100%, Target RTO <= 4h satisfied)',
      status: 'Ready'
    },
    {
      id: 'gov-3',
      clause: 'Clause 7.2 & 7.3 (A.6.3)',
      title: 'Information Security Awareness Report',
      description: 'LMS platform completion log verifying 100% (148/148) in-scope personnel completed annual security training.',
      verification: 'Verified (100% compliance rate & phishing simulation pass)',
      status: 'Ready'
    },
    {
      id: 'gov-4',
      clause: 'Annex A.5.19 & A.5.21',
      title: 'Third-Party Risk Assessment Summary',
      description: 'Formal security evaluations for top 5 critical SaaS/cloud vendors (AWS, Okta, Datadog, Stripe, GitHub).',
      verification: 'Verified (SOC 2 Type II clean opinions & executed DPAs archived)',
      status: 'Ready'
    },
    {
      id: 'gov-5',
      clause: 'Annex A.5.29 & A.5.30',
      title: 'Business Continuity Tabletop Test',
      description: '1-hour tabletop exercise simulating cloud regional outage and ransomware scenario with post-incident debrief.',
      verification: 'Verified (Executive team post-incident summary signed)',
      status: 'Ready'
    }
  ];

  return (
    <div className="rounded-2xl bg-slate-900 border border-indigo-900/40 overflow-hidden shadow-lg">
      {/* Top Bar */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-indigo-950/80 via-slate-900 to-slate-900 border-b border-indigo-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-950 border border-indigo-700 text-indigo-300">
                Lead Consultant Roadmap
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Stage 1 & Stage 2 Audit Readiness
              </span>
            </div>
            <h2 className="text-base font-bold text-white mt-0.5">
              ISO/IEC 27001:2022 Certification Execution Plan
            </h2>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition flex items-center space-x-1.5"
          >
            <span>{isExpanded ? 'Collapse Roadmap' : 'Expand Roadmap'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 sm:p-6 space-y-6">
          {/* Step Selector Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { step: 1, title: '1. In-Progress Controls', desc: '5 Priority Remediations' },
              { step: 2, title: '2. Mandatory Records', desc: '5 Core Governance Files' },
              { step: 3, title: '3. Internal Audit', desc: 'Clause 9.2 Execution' },
              { step: 4, title: '4. Management Review', desc: 'Clause 9.3 Sign-Off' },
              { step: 5, title: '5. Baseline Lock', desc: 'SoA Cl. 6.1.3d & PDF' }
            ].map(item => (
              <button
                key={item.step}
                type="button"
                onClick={() => setActiveStep(item.step)}
                className={`p-3 rounded-xl text-left border transition ${
                  activeStep === item.step
                    ? 'bg-indigo-950/70 border-indigo-500 text-white shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <div className="text-[11px] font-bold text-indigo-300">{item.title}</div>
                <div className="text-[10px] text-slate-400 mt-0.5 truncate">{item.desc}</div>
              </button>
            ))}
          </div>

          {/* Step 1: In-Progress Controls Remediation */}
          {activeStep === 1 && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">1</span>
                    Remediate the 14 In-Progress Controls in the SoA Hub
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Assigned owners, specific implementation notes, and 30-day deadlines configured for the 5 critical controls.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onFilterStatus('In Progress')}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition self-start sm:self-auto flex items-center gap-1.5"
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>Filter 14 In-Progress in Table</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {priorityControls.map(p => (
                  <div
                    key={p.code}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-700/60 transition flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-indigo-400">{p.code}</span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            p.priority === 'Critical'
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}
                        >
                          {p.priority}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-white line-clamp-1">{p.title}</div>
                      <div className="text-[11px] text-slate-400 space-y-1">
                        <div>
                          <span className="text-slate-400">Owner:</span>{' '}
                          <span className="text-slate-200 font-medium">{p.owner}</span>
                        </div>
                        <div className="flex items-center gap-1 text-amber-400/90 font-mono text-[10px]">
                          <Clock className="w-3 h-3" />
                          <span>Deadline: {p.deadline} (Within 30d)</span>
                        </div>
                      </div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800/80 text-[10px] text-slate-300">
                        <strong className="text-indigo-300">Milestone:</strong> {p.milestone}
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Pre-configured</span>
                      </span>
                      {p.ctrl && (
                        <button
                          type="button"
                          onClick={() => onOpenRemediationDrawer(p.ctrl!)}
                          className="px-2.5 py-1 rounded bg-indigo-950 hover:bg-indigo-900 border border-indigo-800 text-indigo-300 text-xs font-medium transition flex items-center gap-1"
                        >
                          <Calendar className="w-3 h-3" />
                          <span>Open Drawer</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: 5 Mandatory Governance Records */}
          {activeStep === 2 && (
            <div className="space-y-4">
              <div className="pb-2 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">2</span>
                  Establish the 5 Mandatory Governance Records (Clauses 4–10)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Certification auditors inspect these 5 core governance records during Stage 1 adequacy reviews.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {mandatoryGovernanceRecords.map(rec => (
                  <div key={rec.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-950 border border-indigo-800 text-indigo-300">
                        {rec.clause}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{rec.status}</span>
                      </span>
                    </div>
                    <div className="text-xs font-bold text-white">{rec.title}</div>
                    <div className="text-[11px] text-slate-400">{rec.description}</div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 text-[10px] text-emerald-300 font-medium">
                      ✓ {rec.verification}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Pre-Audit Internal Audit (Clause 9.2) */}
          {activeStep === 3 && (
            <div className="space-y-4">
              <div className="pb-2 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">3</span>
                  Pre-Audit Internal Audit Execution (Clause 9.2)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Mandatory pre-requisite: Comprehensive internal audit covering Clauses 4–10 and sampled Annex A controls.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-bold text-white">Plan: IA-2026-01 (H1 ISMS Internal Audit)</div>
                    <div className="text-[11px] text-slate-400">Lead Auditor: Marcus Brody (Certified ISO 27001 Lead Auditor)</div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 border border-emerald-800 px-2.5 py-1 rounded-lg self-start sm:self-auto">
                    Fieldwork Completed & Signed
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-xs">
                  <div className="p-2.5 rounded bg-slate-900">
                    <div className="text-[10px] text-slate-400">Controls Sampled</div>
                    <div className="font-bold text-white mt-0.5">25 Annex A Controls</div>
                  </div>
                  <div className="p-2.5 rounded bg-slate-900">
                    <div className="text-[10px] text-slate-400">Clauses Verified</div>
                    <div className="font-bold text-white mt-0.5">Clauses 4.1 through 10.2</div>
                  </div>
                  <div className="p-2.5 rounded bg-slate-900">
                    <div className="text-[10px] text-slate-400">Findings & Nonconformities</div>
                    <div className="font-bold text-amber-300 mt-0.5">1 Minor NC (Closed via CAPA)</div>
                  </div>
                </div>
                <div className="text-[11px] text-slate-300 bg-slate-900/60 p-3 rounded border border-slate-800">
                  <strong className="text-indigo-300">Executive Summary:</strong> The internal audit concluded that the ISMS implementation exhibits high maturity and robust automated controls across cloud operations. Finding FND-2026-01 was verified and closed.
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Management Review Meeting (Clause 9.3) */}
          {activeStep === 4 && (
            <div className="space-y-4">
              <div className="pb-2 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">4</span>
                  Convene & Archive Management Review Meeting (Clause 9.3)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Executive leadership review assessing ISMS suitability, adequacy, risk treatments, and budget allocation.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-bold text-white">MRM-2026-Q2: Annual ISMS Executive Review</div>
                    <div className="text-[11px] text-slate-400">Chairperson: Marcus Vance (CEO) • Co-Signatory: SriKarthiK (CISO)</div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 border border-emerald-800 px-2.5 py-1 rounded-lg self-start sm:self-auto flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Minutes Signed Off</span>
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded bg-slate-900 space-y-1">
                    <div className="font-bold text-indigo-300 text-[11px]">Agenda Items Covered (Cl. 9.3.2 a–f):</div>
                    <ul className="text-[10px] text-slate-300 space-y-1 list-disc pl-3">
                      <li>Actions from previous reviews (100% completed)</li>
                      <li>Internal/External context & interested parties (Cl. 4.1/4.2)</li>
                      <li>Risk Assessment results & 5x5 treatment simulations</li>
                      <li>Continual improvement & CAPA remediation status</li>
                    </ul>
                  </div>
                  <div className="p-3 rounded bg-slate-900 space-y-1">
                    <div className="font-bold text-emerald-300 text-[11px]">Executive Decisions & Allocations:</div>
                    <ul className="text-[10px] text-slate-300 space-y-1 list-disc pl-3">
                      <li>Approved Statement of Applicability v2.0 (93 controls)</li>
                      <li>Allocated $45,000 security engineering budget</li>
                      <li>Approved 1 Dedicated DevSecOps Engineer headcount</li>
                      <li>Confirmed Stage 1 & Stage 2 external audit window</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Freeze and Export SoA Baseline */}
          {activeStep === 5 && (
            <div className="space-y-4">
              <div className="pb-2 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">5</span>
                  Freeze and Export the SoA Baseline (Clause 6.1.3d)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Verify all 93 controls, confirm defensible justifications for the 2 excluded controls (A.7.10, A.8.12), lock the baseline, and generate the audit-grade PDF.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Cryptographic Baseline Status:</span>
                    {isBaselineLocked ? (
                      <span className="text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800">
                        Locked & Auditable
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-950 border border-amber-800">
                        Unlocked Draft
                      </span>
                    )}
                  </div>
                  {baselineHash && (
                    <div className="font-mono text-[10px] text-slate-400">
                      SHA-256: {baselineHash}
                    </div>
                  )}
                  <div className="text-[11px] text-slate-400">
                    Defensible exclusions verified: <strong className="text-slate-200">A.7.10</strong> (No physical tape media) & <strong className="text-slate-200">A.8.12</strong> (No endpoint mass storage devices).
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {!isBaselineLocked && (
                    <button
                      type="button"
                      onClick={onLockBaseline}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Lock Baseline (Cl. 6.1.3d)</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onExportPDF}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Official SoA PDF</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
