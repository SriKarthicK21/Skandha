import React from 'react';
import { useGRC } from '../../context/GRCContext';
import { useToast } from '../common/ToastContainer';
import { navigateToGrc } from '../../services/grc/grcNavigationService';
import {
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldAlert,
  FileCheck2,
  FileText,
  UserCheck,
  CheckCircle2
} from 'lucide-react';

interface PriorityActionsSectionProps {
  onNavigateModule: (moduleId: string) => void;
}

export interface PriorityActionItem {
  id: string;
  title: string;
  category: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  dueText: string;
  owner: string;
  moduleId: string;
  buttonLabel: string;
  impactIndicator?: string;
}

export const PriorityActionsSection: React.FC<PriorityActionsSectionProps> = ({
  onNavigateModule
}) => {
  const { theme, findings, evidence, risks, currentTenant } = useGRC();
  const { showToast } = useToast();
  const isLight = theme === 'light';

  // Derive dynamic actions from real records
  const dynamicActions: PriorityActionItem[] = [];

  // 1. Open Major or Critical Findings
  const openFindings = findings.filter(f => 
    (!f.tenantId || f.tenantId === currentTenant?.id) &&
    f.status !== 'Closed Verified'
  );
  openFindings.slice(0, 2).forEach((f, idx) => {
    dynamicActions.push({
      id: `act-finding-${f.id || idx}`,
      title: `${f.severity}: ${f.title}`,
      category: `${f.clauseOrControl || 'General'} • Finding CAPA`,
      severity: f.severity === 'Major Non-Conformity' ? 'CRITICAL' : 'HIGH',
      dueText: f.capaPlan?.targetDate ? `Target: ${f.capaPlan.targetDate}` : 'Action Required',
      owner: f.capaPlan?.owner || 'Assigned Lead',
      moduleId: 'findings_capa',
      buttonLabel: 'Remediate Finding',
      impactIndicator: 'Resolves 1 Audit Finding'
    });
  });

  // 2. Critical or High Risks requiring treatment
  const openRisks = risks.filter(r => 
    (!r.tenantId || r.tenantId === currentTenant?.id) &&
    (r.residualScore || r.inherentScore) >= 12 &&
    r.treatmentOption !== 'Accept'
  );
  if (openRisks.length > 0) {
    const topRisk = openRisks[0];
    dynamicActions.push({
      id: `act-risk-${topRisk.id}`,
      title: `Risk Treatment: ${topRisk.title}`,
      category: `${topRisk.category || 'Enterprise Risk'} • Score: ${topRisk.residualScore || topRisk.inherentScore}`,
      severity: (topRisk.residualScore || topRisk.inherentScore) >= 20 ? 'CRITICAL' : 'HIGH',
      dueText: 'Review Treatment Plan',
      owner: topRisk.treatmentOwner || 'Risk Owner',
      moduleId: 'risk_register',
      buttonLabel: 'Manage Risk',
      impactIndicator: 'Addresses 3 Mitigating Controls'
    });
  }

  // 3. Expired or unverified evidence
  const unverifiedEvidence = evidence.filter(e => 
    (!e.tenantId || e.tenantId === currentTenant?.id) &&
    (e.status === 'Pending Review' || e.status === 'Requires Update' || e.status === 'Expired' || !e.sha256Hash)
  );
  if (unverifiedEvidence.length > 0) {
    const ev = unverifiedEvidence[0];
    dynamicActions.push({
      id: `act-ev-${ev.id}`,
      title: `Evidence Verification: ${ev.title || ev.fileName || 'Pending File'}`,
      category: `${ev.controlCode || 'Compliance'} • Evidence Vault`,
      severity: 'MEDIUM',
      dueText: 'Cryptographic Review Needed',
      owner: ev.uploadedBy || 'Evidence Custodian',
      moduleId: 'evidence_upload',
      buttonLabel: 'Verify Evidence',
      impactIndicator: 'Validates 2 Framework Proofs'
    });
  }

  // 4. Fallback if everything is 100% compliant
  if (dynamicActions.length === 0) {
    dynamicActions.push({
      id: 'act-audit-prep',
      title: 'Audit Surveillance Readiness Verification',
      category: 'Stage 2 Preparation',
      severity: 'MEDIUM',
      dueText: 'Continuous Validation',
      owner: 'Lead Auditor',
      moduleId: 'internal_audit',
      buttonLabel: 'Inspect Workpapers'
    });
  }

  const actions = dynamicActions.slice(0, 4);

  const handleActionClick = (item: PriorityActionItem) => {
    navigateToGrc({
      module: item.moduleId,
      filters: {
        severity: item.severity.toLowerCase(),
        category: item.category
      }
    });
    onNavigateModule(item.moduleId);
    showToast({
      title: `Navigating: ${item.title}`,
      message: `Assigned to ${item.owner} • ${item.dueText}`,
      type: 'info'
    });
  };

  const severityBadge = (severity: PriorityActionItem['severity']) => {
    switch (severity) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            <span>CRITICAL</span>
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>HIGH</span>
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-blue-500/15 text-blue-400 border border-blue-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            <span>MEDIUM</span>
          </span>
        );
    }
  };

  return (
    <div className="p-5 flex flex-col justify-between h-full">
      <div>
        <div className={`flex items-center justify-between pb-3 border-b ${
          isLight ? 'border-slate-200' : 'border-slate-800/60'
        }`}>
          <div>
            <h2 className="text-sm font-bold tracking-tight flex items-center space-x-2">
              <span className={isLight ? 'text-slate-900' : 'text-white'}>Priority Actions</span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                isLight ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-indigo-500/20 text-indigo-300'
              }`}>
                {actions.length} Pending
              </span>
            </h2>
            <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              High-impact tasks requiring immediate executive or technical action
            </p>
          </div>
          <button
            onClick={() => onNavigateModule('tasks')}
            className={`text-xs font-semibold transition flex items-center space-x-1 ${
              isLight ? 'text-indigo-600 hover:text-indigo-800' : 'text-indigo-400 hover:text-indigo-300'
            }`}
          >
            <span>View All Tasks</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Action Items List */}
        <div className="space-y-2.5 mt-3.5">
          {actions.map((act, index) => (
            <div
              key={act.id}
              className={`p-3.5 rounded-xl border transition-all duration-200 hover:scale-[1.01] flex flex-col sm:flex-row sm:items-center justify-between gap-3 group ${
                isLight
                  ? 'bg-gradient-to-r from-white via-slate-50/50 to-white border-slate-200/90 hover:border-indigo-300 hover:shadow-md hover:bg-indigo-50/15'
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-indigo-500/40 hover:bg-slate-950'
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-2">
                  <span className={`text-xs font-mono font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{`0${index + 1}`}</span>
                  {severityBadge(act.severity)}
                  <span className={`text-[11px] font-medium truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{act.category}</span>
                </div>

                <h4 className={`text-xs font-bold mt-1.5 transition ${
                  isLight ? 'text-slate-900 group-hover:text-indigo-700' : 'text-white group-hover:text-blue-300'
                }`}>
                  {act.title}
                </h4>

                {act.impactIndicator && (
                  <div className="mt-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                      ⚡ {act.impactIndicator}
                    </span>
                  </div>
                )}

                <div className={`flex items-center space-x-4 mt-2 text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  <span className="flex items-center space-x-1">
                    <span className={isLight ? 'text-slate-400' : 'text-slate-500'}>Owner:</span>
                    <strong className={`font-medium ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{act.owner}</strong>
                  </span>
                  <span className={isLight ? 'text-slate-300' : 'text-slate-600'}>•</span>
                  <span className={`flex items-center space-x-1 font-mono ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    <Clock className={`w-3 h-3 inline mr-0.5 ${isLight ? 'text-amber-600' : 'text-amber-400'}`} />
                    <span>{act.dueText}</span>
                  </span>
                </div>
              </div>

              {/* Action Trigger Button */}
              <button
                onClick={() => handleActionClick(act)}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center justify-center space-x-1.5 ${
                  isLight
                    ? 'bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-200 hover:border-indigo-600 shadow-2xs'
                    : 'bg-indigo-600/20 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/30 hover:border-indigo-500'
                }`}
              >
                <span>{act.buttonLabel}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
