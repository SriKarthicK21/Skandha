import React, { useState } from 'react';
import { dpdpPrivacyEngineService } from '../../services/canonical/DpdpPrivacyEngineService';
import { DpdpSdfAssessment } from '../../types/dpdpPlatformTypes';
import {
  Building2,
  ShieldCheck,
  AlertTriangle,
  FileText,
  UserCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Award,
  RefreshCw,
  Scale,
  Cpu
} from 'lucide-react';

interface DPDPSdfAssessmentWorkspaceProps {
  tenantId?: string;
}

export const DPDPSdfAssessmentWorkspace: React.FC<DPDPSdfAssessmentWorkspaceProps> = ({
  tenantId = 'tenant_skanda'
}) => {
  const [assessment, setAssessment] = useState<DpdpSdfAssessment | null>(() =>
    dpdpPrivacyEngineService.getSdfAssessment(tenantId)
  );

  const refreshData = () => {
    setAssessment(dpdpPrivacyEngineService.getSdfAssessment(tenantId));
  };

  if (!assessment) {
    return (
      <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-3xl">
        <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
        <p className="text-white font-bold">No SDF Assessment Record Found for Tenant</p>
        <p className="text-xs text-slate-400 mt-1">
          Initiate an authoritative assessment based on MeitY criteria under DPDP Act §10.
        </p>
      </div>
    );
  }

  const getStatusBadge = (isSdf: boolean, approval: string) => {
    if (isSdf) {
      return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
    }
    if (approval === 'DPO_APPROVED' || approval === 'BOARD_RATIFIED') {
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
    return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
  };

  const statutoryObligations = [
    {
      id: 'DPO_APPOINTMENT',
      title: 'Data Protection Officer (DPO) Appointment',
      section: 'DPDP Act §10(2)(a)',
      description: 'Must be an individual based in India, representing the fiduciary and directly reporting to the Board of Directors / highest executive body.',
      status: assessment.statutoryObligationsActive.residentDpoAppointed ? 'COMPLIANT' : 'NON_COMPLIANT',
      evidenceId: 'ev_sdf_dpo_resolution'
    },
    {
      id: 'INDEPENDENT_AUDITOR',
      title: 'Independent Data Auditor Appointment',
      section: 'DPDP Act §10(2)(b)',
      description: 'Must engage an independent data auditor to evaluate compliance with statutory DPDP provisions periodically.',
      status: assessment.statutoryObligationsActive.independentDataAuditorEngaged ? 'COMPLIANT' : 'IN_PROGRESS',
      evidenceId: 'ev_sdf_auditor_engagement'
    },
    {
      id: 'DPIA_PERIODIC',
      title: 'Periodic Data Protection Impact Assessment (DPIA)',
      section: 'DPDP Act §10(2)(c)(i)',
      description: 'Periodic DPIA including identification and management of risk of harm to Data Principals.',
      status: assessment.statutoryObligationsActive.periodicDpiaMandated ? 'COMPLIANT' : 'PENDING_CYCLE',
      evidenceId: 'ev_sdf_dpia_matrix'
    },
    {
      id: 'PERIODIC_AUDIT',
      title: 'Periodic Privacy & Data Governance Audit',
      section: 'DPDP Act §10(2)(c)(ii)',
      description: 'Formal periodic privacy audit with transparent certification and remedial CAPA.',
      status: assessment.statutoryObligationsActive.periodicAlgorithmAuditConducted ? 'COMPLIANT' : 'PENDING_CYCLE',
      evidenceId: 'ev_sdf_audit_report'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              Significant Data Fiduciary (SDF) Governance & Criteria Studio
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              DPDP Act §10 & MeitY Guidelines
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Authoritative assessment against statutory 6-factor criteria, mandatory resident DPO appointment, independent auditor oversight, and DPIA rigor.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={refreshData}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Designation Banner */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-purple-500/30 shadow-xl relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(assessment.isDesignatedSdf, assessment.approvalStatus)}`}>
                {assessment.isDesignatedSdf ? 'DESIGNATED SDF' : 'NON-SDF STANDARD FIDUCIARY'}
              </span>
              <span className="text-xs text-slate-400 font-mono">ID: {assessment.id}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                {assessment.approvalStatus}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white">SDF Designation Assessment Summary</h3>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Overall Volume: <strong>{assessment.overallVolumeOfData}</strong> • Sensitivity Profile: <strong>{assessment.sensitivityProfile}</strong> • Risk of Harm Score: <strong>{assessment.riskOfHarmScore}/100</strong>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1 text-xs">
              <div className="text-slate-400">Assessed by: <span className="text-white font-semibold">{assessment.evaluatedBy}</span></div>
              <div className="text-slate-400">Resident DPO: <span className="text-emerald-400 font-semibold">{assessment.dpoName}</span></div>
              <div className="text-slate-400 font-mono text-[11px]">Assessment Date: {assessment.assessmentDate}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 10(1) Six Statutory Factors */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Scale className="w-4 h-4 text-purple-400" />
            <span>Statutory Evaluation Factors (DPDP Act §10(1))</span>
          </h3>
          <span className="text-xs text-slate-400">All statutory parameters evaluated</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assessment.factors.map((f, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold text-slate-400">{idx + 1}. {f.factor}</div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${f.thresholdTriggered ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
                  Score: {f.evaluatedScore}/5
                </span>
              </div>
              <div className="text-xs text-slate-200 leading-snug">{f.rationale}</div>
              <div className="text-[10px] text-indigo-400 font-mono pt-1">Evidence: {f.evidenceId}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 10(2) Mandatory SDF Obligations */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Statutory SDF Operational Obligations (DPDP Act §10(2))</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {statutoryObligations.map((ob) => (
            <div
              key={ob.id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-3 shadow-md"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {ob.section}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      ob.status === 'COMPLIANT'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}
                  >
                    {ob.status}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white">{ob.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{ob.description}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                <span className="text-slate-500 font-mono">
                  Evidence: <span className="text-indigo-400">{ob.evidenceId || 'N/A'}</span>
                </span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Audited</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DPO Profile Card */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Statutory Data Protection Officer (DPO) Profile (§10(2)(a))
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-slate-400">Designated DPO</div>
            <div className="font-bold text-white text-sm mt-0.5">{assessment.dpoName}</div>
            <div className="text-slate-500 text-[11px]">Chief Privacy Officer & DPO</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-slate-400">Physical Location (India Based)</div>
            <div className="font-bold text-white text-sm mt-0.5">Bengaluru & Mumbai, India</div>
            <div className="text-emerald-400 text-[11px] font-semibold">✓ In-Jurisdiction Resident</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-slate-400">Contact & Redressal</div>
            <div className="font-mono text-indigo-300 text-xs mt-0.5">dpo@skanda-enterprisegrc.com</div>
            <div className="text-slate-500 text-[11px]">+91 (80) 4122-9080</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-slate-400">Appointment Evidence</div>
            <div className="font-mono text-emerald-400 text-xs mt-0.5">ev_sdf_dpo_resolution</div>
            <div className="text-slate-500 text-[11px]">Board Resolution Attached</div>
          </div>
        </div>
      </div>
    </div>
  );
};
