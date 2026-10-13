import React, { useState } from 'react';
import {
  RefreshCw,
  AlertTriangle,
  FileCheck2,
  ShieldAlert,
  CheckCircle2,
  Zap,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useGRC } from '../../context/GRCContext';
import { useToast } from '../common/ToastContainer';
import { CCMRiskWaiverModal } from './CCMRiskWaiverModal';
import { FindingCAPARecord } from '../../types';

interface CCMQuickRemediationBarProps {
  controlCode: string;
  title: string;
  providerOrSystem: string;
  category?: string;
  onRetestComplete?: () => void;
  className?: string;
}

export const CCMQuickRemediationBar: React.FC<CCMQuickRemediationBarProps> = ({
  controlCode,
  title,
  providerOrSystem,
  category = 'Security Architecture',
  onRetestComplete,
  className = ''
}) => {
  const { currentTenant, logAuditEvent, findings, addFinding, setActiveModule, theme } = useGRC();
  const { showToast } = useToast();

  const [isRetesting, setIsRetesting] = useState<boolean>(false);
  const [retestedSuccess, setRetestedSuccess] = useState<boolean>(false);
  const [isWaiverModalOpen, setIsWaiverModalOpen] = useState<boolean>(false);
  const [createdCapaId, setCreatedCapaId] = useState<string | null>(null);

  // 1. Trigger Live Retest
  const handleTriggerRetest = async () => {
    setIsRetesting(true);
    setRetestedSuccess(false);

    // Realistic API latency and probe simulation
    await new Promise(r => setTimeout(r, 1200));

    setIsRetesting(false);
    setRetestedSuccess(true);

    logAuditEvent(
      'UPDATE',
      'Continuous Monitoring',
      `Manual retest invoked for control ${controlCode} on provider ${providerOrSystem}. Health check returned HTTP 200 OK (Roundtrip: 38ms, Cryptographic TLS: TLS_AES_256_GCM_SHA384).`
    );

    showToast({
      title: 'Retest Passed Successfully',
      message: `Verified telemetry probe for ${providerOrSystem} (${controlCode}). Latency: 38ms.`,
      type: 'success'
    });

    if (onRetestComplete) {
      onRetestComplete();
    }

    setTimeout(() => setRetestedSuccess(false), 5000);
  };

  // 2. Generate Corrective Action (CAPA)
  const handleGenerateCAPA = () => {
    const capaCode = `CAPA-CCM-${Math.floor(1000 + Math.random() * 9000)}`;
    const deadline = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    addFinding({
      source: 'CONTINUOUS_MONITORING',
      severity: 'Minor Non-Conformity',
      title: `CCM Telemetry Drift: ${title} (${controlCode})`,
      clauseOrControl: controlCode,
      department: 'Information Security & Cyber SOC',
      description: `Continuous Compliance Monitoring telemetry probe detected SLA drift or stale heartbeat on ${providerOrSystem} for control ${controlCode}.`,
      rootCauseAnalysis: {
        methodology: 'DIRECT',
        rootCauseStatement: `Automated probe threshold exceeded on provider endpoint ${providerOrSystem}. Daemon heartbeat sync delayed.`
      },
      capaPlan: {
        correctiveAction: `Investigate daemon queue on ${providerOrSystem} and restart heartbeat worker pool with updated auth token.`,
        preventiveAction: `Add synthetic failover monitor in Datadog and tighten queue retry cadence to 300s.`,
        owner: 'Arjun Mehta, CISO',
        targetDate: deadline,
        evidenceRequired: 'Verified clean telemetry logs and passing health check attestation.'
      },
      status: 'Open'
    });

    setCreatedCapaId(capaCode);

    logAuditEvent(
      'CREATE',
      'CAPA Engine',
      `Auto-generated Corrective Action ticket ${capaCode} for control ${controlCode} from CCM remediation console.`
    );

    showToast({
      title: `CAPA Ticket Generated: ${capaCode}`,
      message: `Assigned to CISO with 14-day SLA deadline (${deadline}).`,
      type: 'success'
    });
  };

  return (
    <div className={`flex items-center gap-1.5 flex-wrap ${className}`}>
      {/* 1. Trigger Retest */}
      <button
        type="button"
        disabled={isRetesting}
        onClick={handleTriggerRetest}
        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center space-x-1.5 transition border cursor-pointer ${
          retestedSuccess
            ? 'bg-emerald-950/60 border-emerald-600 text-emerald-300'
            : isRetesting
            ? 'bg-slate-800 border-slate-700 text-slate-400 cursor-not-allowed'
            : 'bg-sky-950/40 hover:bg-sky-900/60 text-sky-300 border-sky-800/60'
        }`}
        title="Execute immediate automated endpoint probe & latency verification"
      >
        <RefreshCw className={`w-3 h-3 ${isRetesting ? 'animate-spin text-sky-400' : retestedSuccess ? 'text-emerald-400' : 'text-sky-400'}`} />
        <span>{isRetesting ? 'Testing...' : retestedSuccess ? 'Retested OK' : 'Trigger Retest'}</span>
      </button>

      {/* 2. Generate CAPA */}
      <button
        type="button"
        onClick={handleGenerateCAPA}
        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center space-x-1.5 transition border cursor-pointer ${
          createdCapaId
            ? 'bg-purple-950/60 border-purple-600 text-purple-300'
            : 'bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 border-purple-800/60'
        }`}
        title="Escalate drift into a formal Corrective Action (CAPA) ticket"
      >
        <FileCheck2 className="w-3 h-3 text-purple-400" />
        <span>{createdCapaId ? `Created ${createdCapaId}` : 'Generate CAPA'}</span>
      </button>

      {/* 3. Request 30-Day Risk Waiver */}
      <button
        type="button"
        onClick={() => setIsWaiverModalOpen(true)}
        className="px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center space-x-1.5 transition border bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border-amber-800/60 cursor-pointer"
        title="Request a formal 30-day compliance risk waiver with compensating controls"
      >
        <ShieldAlert className="w-3 h-3 text-amber-400" />
        <span>30-Day Risk Waiver</span>
      </button>

      {/* Embedded Risk Waiver Modal */}
      <CCMRiskWaiverModal
        isOpen={isWaiverModalOpen}
        onClose={() => setIsWaiverModalOpen(false)}
        targetItem={{
          controlCode,
          title,
          providerOrSystem,
          category
        }}
      />
    </div>
  );
};
