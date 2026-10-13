import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { exceptionManagementService } from '../../services/canonical/ExceptionManagementService';
import { CanonicalException, ExceptionStatus } from '../../types/canonicalGrcTypes';
import { PremiumCard } from '../ui/premium/PremiumCard';
import { PremiumKpi } from '../ui/premium/PremiumKpi';
import { PremiumBadge } from '../ui/premium/PremiumBadge';
import { PremiumButton } from '../ui/premium/PremiumButton';
import { PremiumModal } from '../ui/premium/PremiumModal';
import { PremiumInput } from '../ui/premium/PremiumInput';
import { PremiumEmptyState } from '../ui/premium/PremiumEmptyState';
import { PageContainer } from '../layout/PageContainer';

export const ExceptionManagementWorkspace: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'ACTIVE' | 'APPROACHING' | 'EXPIRED'>('ALL');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // New exception form fields
  const [title, setTitle] = useState('Legacy Bastion MFA Exemption for Automated Financial Batch');
  const [controlCode, setControlCode] = useState('CTRL-088');
  const [requirementCode, setRequirementCode] = useState('A.5.15');
  const [department, setDepartment] = useState('Payment Operations');
  const [requestedBy, setRequestedBy] = useState('Karthik Rao');
  const [inherentRisk, setInherentRisk] = useState(16);
  const [residualRisk, setResidualRisk] = useState(6);
  const [compensatingControls, setCompensatingControls] = useState('IP-whitelisted VPN gateway, hourly session token rotation, and 100% video-recorded bastion sessions.');
  const [businessJustification, setBusinessJustification] = useState('Core mainframe clearing batches cannot execute interactive WebAuthn biometric challenges.');
  const [expiryDate, setExpiryDate] = useState('2026-12-31');

  const allExceptions = exceptionManagementService.getAllExceptions();
  const activeExceptions = exceptionManagementService.getActiveExceptions();
  const approachingExceptions = exceptionManagementService.getExceptionsApproachingExpiry();
  const expiredExceptions = exceptionManagementService.getExpiredExceptions();

  const filteredExceptions = activeFilter === 'ACTIVE' 
    ? activeExceptions 
    : activeFilter === 'APPROACHING' 
    ? approachingExceptions 
    : activeFilter === 'EXPIRED' 
    ? expiredExceptions 
    : allExceptions;

  const handleCreateException = () => {
    exceptionManagementService.createException({
      tenantId: 'tenant-acme-corp',
      exceptionCode: `EXC-2026-${String(allExceptions.length + 1).padStart(3, '0')}`,
      title,
      businessJustification,
      relatedControlId: controlCode,
      relatedRequirementCode: requirementCode,
      affectedAssetIds: ['ASSET-GW-01'],
      inherentRiskScore: inherentRisk,
      compensatingControls,
      residualRiskScore: residualRisk,
      requestedBy,
      department,
      requestedDate: new Date().toISOString(),
      expiryDate,
      reviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'UNDER_REVIEW',
      supportingEvidenceIds: ['EV-2026-001'],
      remediationPlanUponExpiry: 'Deploy mTLS certificate-based API connector in Q4 2026.'
    });

    setIsNewModalOpen(false);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <PageContainer maxWidth="1600px" className="space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Security Exception & Waiver Management</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Time-bound control deviations, compensating safeguards, and automated expiration monitoring.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <PremiumButton
            size="sm"
            variant="primary"
            onClick={() => setIsNewModalOpen(true)}
            icon={Plus}
          >
            Request Security Exception
          </PremiumButton>
        </div>
      </div>

      {/* Exception KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <PremiumKpi
          label="Total Exceptions"
          value={allExceptions.length}
          statusType="neutral"
          icon={ShieldAlert}
        />
        <PremiumKpi
          label="Active Approved"
          value={activeExceptions.length}
          statusType="info"
          icon={CheckCircle2}
        />
        <PremiumKpi
          label="Approaching Expiry"
          value={approachingExceptions.length}
          statusType={approachingExceptions.length > 0 ? 'warning' : 'success'}
          icon={Clock}
        />
        <PremiumKpi
          label="Expired Exceptions"
          value={expiredExceptions.length}
          statusType={expiredExceptions.length > 0 ? 'critical' : 'success'}
          icon={XCircle}
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
        {[
          { id: 'ALL', label: `All Exceptions (${allExceptions.length})` },
          { id: 'ACTIVE', label: `Active & Approved (${activeExceptions.length})` },
          { id: 'APPROACHING', label: `Approaching Expiry (${approachingExceptions.length})` },
          { id: 'EXPIRED', label: `Expired (${expiredExceptions.length})` },
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveFilter(tab.id as any)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeFilter === tab.id
                ? 'bg-blue-600 text-white dark:bg-amber-500 dark:text-slate-950 font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Exceptions List */}
      <div className="space-y-3">
        {filteredExceptions.map(exc => {
          const isApproaching = approachingExceptions.some(e => e.id === exc.id);
          const isExpired = expiredExceptions.some(e => e.id === exc.id);

          return (
            <PremiumCard
              key={exc.id}
              elevation={1}
              className={`p-5 border transition-all ${
                isExpired
                  ? 'border-rose-300 dark:border-rose-500/40 bg-rose-50/30 dark:bg-rose-950/10'
                  : isApproaching
                  ? 'border-amber-300 dark:border-amber-500/40 bg-amber-50/30 dark:bg-amber-950/10'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-blue-600 dark:text-cyan-400">{exc.exceptionCode}</span>
                    <PremiumBadge variant={isExpired ? 'critical' : isApproaching ? 'warning' : 'success'}>
                      {isExpired ? 'EXPIRED' : isApproaching ? 'EXPIRING SOON' : exc.status}
                    </PremiumBadge>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Your Control: <strong className="text-slate-800 dark:text-slate-200 font-mono">{exc.relatedControlId}</strong>
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Req: <strong className="text-slate-800 dark:text-slate-200 font-mono">{exc.relatedRequirementCode}</strong>
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{exc.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{exc.businessJustification}</p>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                    <div className="text-slate-800 dark:text-slate-200">
                      <strong className="text-amber-700 dark:text-amber-400 font-semibold">Compensating Safeguards:</strong> {exc.compensatingControls}
                    </div>
                    <div className="text-slate-600 dark:text-slate-400">
                      <strong className="text-blue-700 dark:text-cyan-400 font-semibold">Exit Remediation Plan:</strong> {exc.remediationPlanUponExpiry}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
                    <span>Requested by: <strong className="text-slate-800 dark:text-slate-200">{exc.requestedBy}</strong> ({exc.department})</span>
                    <span>•</span>
                    <span>Expiry Date: <strong className={isExpired ? 'text-rose-600 dark:text-rose-400 font-mono' : isApproaching ? 'text-amber-600 dark:text-amber-400 font-mono' : 'text-slate-800 dark:text-slate-200 font-mono'}>{exc.expiryDate}</strong></span>
                    <span>•</span>
                    <span>Inherent Risk: {exc.inherentRiskScore} → Residual: <strong className="text-emerald-600 dark:text-emerald-400">{exc.residualRiskScore}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <PremiumButton size="sm" variant="secondary">
                    Review Waiver
                  </PremiumButton>
                </div>
              </div>
            </PremiumCard>
          );
        })}

        {filteredExceptions.length === 0 && (
          <PremiumEmptyState
            title="No exceptions in this view"
            description="There are no security exceptions matching the selected status filter. All baseline controls are fully operational."
            icon={ShieldCheck}
          />
        )}
      </div>

      {/* New Exception Modal */}
      <PremiumModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Request Time-Bound Security Exception"
        subtitle="Formal deviation request with compensating safeguards and automated expiry"
        size="lg"
      >
        <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          <PremiumInput
            label="Exception Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <PremiumInput
              label="Related Control Code"
              value={controlCode}
              onChange={(e) => setControlCode(e.target.value)}
            />
            <PremiumInput
              label="Requirement Reference"
              value={requirementCode}
              onChange={(e) => setRequirementCode(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <PremiumInput
              label="Requested By"
              value={requestedBy}
              onChange={(e) => setRequestedBy(e.target.value)}
            />
            <PremiumInput
              label="Department / Unit"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Business Justification</label>
            <textarea
              rows={2}
              value={businessJustification}
              onChange={(e) => setBusinessJustification(e.target.value)}
              className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Compensating Safeguards</label>
            <textarea
              rows={2}
              value={compensatingControls}
              onChange={(e) => setCompensatingControls(e.target.value)}
              className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <PremiumInput
              label="Inherent Risk (1-25)"
              type="number"
              value={inherentRisk}
              onChange={(e) => setInherentRisk(Number(e.target.value))}
            />
            <PremiumInput
              label="Residual Risk (1-25)"
              type="number"
              value={residualRisk}
              onChange={(e) => setResidualRisk(Number(e.target.value))}
            />
            <PremiumInput
              label="Expiry Date"
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
            <PremiumButton size="sm" variant="secondary" onClick={() => setIsNewModalOpen(false)}>
              Cancel
            </PremiumButton>
            <PremiumButton size="sm" variant="primary" onClick={handleCreateException}>
              Submit Exception Request
            </PremiumButton>
          </div>
        </div>
      </PremiumModal>
    </PageContainer>
  );
};

export default ExceptionManagementWorkspace;
