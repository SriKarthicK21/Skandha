import React, { useState } from 'react';
import { 
  CheckSquare, 
  Shield, 
  FlaskConical, 
  AlertTriangle, 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  UserCheck, 
  Layers,
  ChevronRight,
  Filter,
  Check,
  Ban
} from 'lucide-react';
import { myWorkService } from '../../services/canonical/MyWorkService';
import { universalWorkflowService } from '../../services/canonical/WorkflowService';
import { exceptionManagementService } from '../../services/canonical/ExceptionManagementService';
import { PremiumCard } from '../ui/premium/PremiumCard';
import { PremiumKpi } from '../ui/premium/PremiumKpi';
import { PremiumBadge } from '../ui/premium/PremiumBadge';
import { PremiumButton } from '../ui/premium/PremiumButton';
import { PremiumEmptyState } from '../ui/premium/PremiumEmptyState';

export const MyWorkWorkspace: React.FC = () => {
  const [activeUser, setActiveUser] = useState('Sarah Chen');
  const [activeTab, setActiveTab] = useState<
    'TASKS' | 'APPROVALS' | 'CONTROLS' | 'TESTS' | 'RISKS' | 'EVIDENCE' | 'CAPA' | 'EXCEPTIONS' | 'AUDITS'
  >('TASKS');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const myWork = myWorkService.getMyWorkQueue(activeUser);

  const handleApprove = (taskId: string) => {
    universalWorkflowService.approveTask(taskId, activeUser, 'Approved via My Work Workspace');
    setRefreshTrigger(prev => prev + 1);
  };

  const handleReject = (taskId: string) => {
    universalWorkflowService.rejectTask(taskId, activeUser, 'Action required before sign-off.');
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-cyan-500/10 text-blue-600 dark:text-cyan-400 border border-blue-200 dark:border-cyan-500/20">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">My Work & Operational Queue</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Consolidated personal responsibilities across all 9 GRC domains.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
            <span className="text-slate-500">Active Operator:</span>
            <span className="font-semibold text-blue-600 dark:text-cyan-400">{myWork.userName}</span>
            <PremiumBadge variant="info">Director of IAM</PremiumBadge>
          </div>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <PremiumKpi
          label="My Tasks"
          value={myWork.tasks.length}
          statusType="info"
          icon={Clock}
        />
        <PremiumKpi
          label="Pending Approvals"
          value={myWork.pendingApprovals.length}
          statusType={myWork.pendingApprovals.length > 0 ? 'warning' : 'success'}
          icon={UserCheck}
        />
        <PremiumKpi
          label="My Controls"
          value={myWork.assignedControls.length}
          statusType="neutral"
          icon={Shield}
        />
        <PremiumKpi
          label="Scheduled Tests"
          value={myWork.scheduledControlTests.length}
          statusType="info"
          icon={FlaskConical}
        />
        <PremiumKpi
          label="Active Exceptions"
          value={myWork.activeExceptions.length}
          statusType={myWork.activeExceptions.some(e => e.isApproachingExpiry) ? 'critical' : 'warning'}
          icon={AlertTriangle}
        />
        <PremiumKpi
          label="Audits In Scope"
          value={myWork.auditsInScope.length}
          statusType="neutral"
          icon={FileText}
        />
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
        {[
          { id: 'TASKS', label: 'My Tasks', count: myWork.tasks.length },
          { id: 'APPROVALS', label: 'My Approvals', count: myWork.pendingApprovals.length },
          { id: 'CONTROLS', label: 'My Controls', count: myWork.assignedControls.length },
          { id: 'TESTS', label: 'Control Tests', count: myWork.scheduledControlTests.length },
          { id: 'RISKS', label: 'My Risks', count: myWork.ownedRisks.length },
          { id: 'EVIDENCE', label: 'Pending Evidence', count: myWork.pendingEvidenceUploads.length },
          { id: 'CAPA', label: 'Assigned CAPA', count: myWork.assignedCapas.length },
          { id: 'EXCEPTIONS', label: 'My Exceptions', count: myWork.activeExceptions.length },
          { id: 'AUDITS', label: 'My Audits', count: myWork.auditsInScope.length },
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white dark:bg-cyan-500 dark:text-slate-950 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
              activeTab === tab.id ? 'bg-white/20 dark:bg-slate-950/30 text-white dark:text-slate-950 font-black' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="space-y-4">
        {/* 1. MY TASKS TAB */}
        {activeTab === 'TASKS' && (
          <div className="space-y-3">
            {myWork.tasks.map(task => (
              <PremiumCard key={task.id} elevation={1} className="p-4 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-blue-600 dark:text-cyan-400">{task.id}</span>
                      <PremiumBadge variant="info">{task.entityType.replace(/_/g, ' ')}</PremiumBadge>
                      <PremiumBadge variant={task.priority === 'CRITICAL' ? 'critical' : task.priority === 'HIGH' ? 'warning' : 'neutral'}>
                        {task.priority}
                      </PremiumBadge>
                      <span className="text-xs text-slate-500 dark:text-slate-400">Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{task.title}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">{task.description}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right hidden sm:block">
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-300">{task.slaHoursRemaining}h SLA</div>
                      <div className="text-[11px] text-slate-500">{task.state}</div>
                    </div>
                    <PremiumButton size="sm" variant="secondary">
                      Open Action
                    </PremiumButton>
                  </div>
                </div>
              </PremiumCard>
            ))}

            {myWork.tasks.length === 0 && (
              <PremiumEmptyState
                title="No active tasks assigned"
                description="Your operational queue is completely clear. All assigned tasks and milestones are up to date."
                icon={CheckCircle2}
              />
            )}
          </div>
        )}

        {/* 2. PENDING APPROVALS TAB */}
        {activeTab === 'APPROVALS' && (
          <div className="space-y-3">
            {myWork.pendingApprovals.map(task => (
              <PremiumCard key={task.id} elevation={2} className="p-5 border-amber-300 dark:border-amber-500/30 bg-amber-50/30 dark:bg-gradient-to-r dark:from-amber-950/20 dark:to-slate-900">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <PremiumBadge variant="warning">APPROVAL REQUIRED</PremiumBadge>
                      <span className="font-mono text-xs text-amber-600 dark:text-amber-400 font-bold">{task.id}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">Target: {task.entityCode}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{task.title}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300">{task.description}</p>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Submitted by: <strong className="text-slate-800 dark:text-slate-200">{task.assignee}</strong> • SLA Remaining: <strong className="text-amber-600 dark:text-amber-400">{task.slaHoursRemaining} hours</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <PremiumButton
                      size="sm"
                      variant="primary"
                      onClick={() => handleApprove(task.id)}
                      icon={Check}
                    >
                      Approve
                    </PremiumButton>
                    <PremiumButton
                      size="sm"
                      variant="danger"
                      onClick={() => handleReject(task.id)}
                      icon={Ban}
                    >
                      Reject
                    </PremiumButton>
                  </div>
                </div>
              </PremiumCard>
            ))}

            {myWork.pendingApprovals.length === 0 && (
              <PremiumEmptyState
                title="No pending approvals"
                description="You have no pending policy sign-offs, evidence assertions, or exception requests awaiting your authorization."
                icon={UserCheck}
              />
            )}
          </div>
        )}

        {/* 3. MY CONTROLS TAB */}
        {activeTab === 'CONTROLS' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myWork.assignedControls.map(ctrl => (
              <PremiumCard key={ctrl.id} elevation={1} className="p-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-blue-600 dark:text-indigo-400">{ctrl.controlCode}</span>
                  <PremiumBadge variant={ctrl.effectivenessRating === 'EFFECTIVE' ? 'success' : ctrl.effectivenessRating === 'PARTIALLY_EFFECTIVE' ? 'warning' : 'critical'}>
                    {ctrl.effectivenessRating}
                  </PremiumBadge>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{ctrl.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">{ctrl.implementationDetails}</p>
                </div>
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Env: <strong className="text-slate-800 dark:text-slate-200">{ctrl.operatingEnvironment}</strong></span>
                  <span>Next Test: <strong className="text-blue-600 dark:text-cyan-400">{ctrl.nextTestDueDate}</strong></span>
                </div>
              </PremiumCard>
            ))}
          </div>
        )}

        {/* 4. CONTROL TESTS TAB */}
        {activeTab === 'TESTS' && (
          <div className="space-y-3">
            {myWork.scheduledControlTests.map(test => (
              <PremiumCard key={test.id} elevation={1} className="p-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-purple-600 dark:text-purple-400">{test.id}</span>
                    <PremiumBadge variant={test.testResult === 'PASS' ? 'success' : test.testResult === 'PARTIAL' ? 'warning' : 'critical'}>
                      {test.testResult}
                    </PremiumBadge>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Control: {test.controlCode}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{test.testTitle}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Sample: {test.sampleSize} of {test.populationSize} items • Method: {test.samplingMethod}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Status: <strong className="text-slate-800 dark:text-slate-200">{test.status}</strong></span>
                  <PremiumButton size="sm" variant="secondary">
                    Record Fieldwork
                  </PremiumButton>
                </div>
              </PremiumCard>
            ))}
          </div>
        )}

        {/* 5. EXCEPTIONS TAB */}
        {activeTab === 'EXCEPTIONS' && (
          <div className="space-y-3">
            {myWork.activeExceptions.map(exc => (
              <PremiumCard key={exc.id} elevation={1} className={`p-4 border ${exc.isApproachingExpiry ? 'border-amber-300 dark:border-amber-500/40 bg-amber-50/40 dark:bg-amber-950/10' : exc.hasExpired ? 'border-rose-300 dark:border-rose-500/40 bg-rose-50/40 dark:bg-rose-950/10' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'}`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-600 dark:text-cyan-400">{exc.exceptionCode}</span>
                      <PremiumBadge variant={exc.hasExpired ? 'critical' : exc.isApproachingExpiry ? 'warning' : 'success'}>
                        {exc.hasExpired ? 'EXPIRED' : exc.isApproachingExpiry ? 'EXPIRING SOON' : exc.status}
                      </PremiumBadge>
                      <span className="text-xs text-slate-500 dark:text-slate-400">Control: {exc.relatedControlId}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{exc.title}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300">Compensating Safeguards: {exc.compensatingControls}</p>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Expiry Date: <strong className="text-rose-600 dark:text-rose-400">{exc.expiryDate}</strong> • Inherent Risk: {exc.inherentRiskScore} → Residual Risk: {exc.residualRiskScore}
                    </div>
                  </div>
                  <div className="shrink-0">
                    <PremiumButton size="sm" variant="secondary">
                      Review Exemption
                    </PremiumButton>
                  </div>
                </div>
              </PremiumCard>
            ))}
          </div>
        )}

        {/* 6. RISKS TAB */}
        {activeTab === 'RISKS' && (
          <div className="space-y-3">
            {myWork.ownedRisks.map(rsk => (
              <PremiumCard key={rsk.id} elevation={1} className="p-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">{rsk.code}</span>
                    <PremiumBadge variant="warning">{rsk.level}</PremiumBadge>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Risk Score: {rsk.score}/25</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">{rsk.title}</h4>
                </div>
                <PremiumButton size="sm" variant="secondary">
                  Update Treatment
                </PremiumButton>
              </PremiumCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyWorkWorkspace;
