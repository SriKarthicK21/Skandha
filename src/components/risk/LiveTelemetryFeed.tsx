import React, { useState } from 'react';
import { RiskRecord, RiskTelemetrySignal } from '../../types';
import { useGRC } from '../../context/GRCContext';
import { useToast } from '../common/ToastContainer';
import {
  Activity,
  Radio,
  AlertTriangle,
  CheckCircle2,
  Zap,
  RefreshCw,
  Flame,
  Shield,
  ShieldAlert,
  Server,
  Terminal,
  ExternalLink,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
  SlidersHorizontal,
  BellRing
} from 'lucide-react';

interface LiveTelemetryFeedProps {
  risks: RiskRecord[];
  onSelectRisk: (risk: RiskRecord) => void;
}

export const LiveTelemetryFeed: React.FC<LiveTelemetryFeedProps> = ({
  risks,
  onSelectRisk
}) => {
  const { updateRisk, logAuditEvent, currentTenant } = useGRC();
  const { showToast } = useToast();

  const [simulatingSource, setSimulatingSource] = useState<string | null>(null);

  // Extract all active and historic telemetry signals across risks
  const telemetryEntries = risks.flatMap(r => 
    (r.telemetrySignals || []).map(sig => ({
      risk: r,
      signal: sig
    }))
  );

  const activeSignals = telemetryEntries.filter(t => t.signal.active);
  const resolvedSignals = telemetryEntries.filter(t => !t.signal.active);

  // Simulation scenarios
  const SIMULATION_SCENARIOS = [
    {
      id: 'guardduty_iam',
      source: 'AWS Security Hub' as const,
      riskCode: 'RSK-2026-01',
      title: 'GuardDuty: IAM Reconnaissance API call detected from unrecognized Tor Exit Node',
      severity: 'High' as const,
      likelihoodDelta: 2,
      rawPayload: '{"event": "UnauthorizedAccess:IAMUser/TorIPCaller", "account": "123456789012", "principal": "ci-deployer", "ip": "185.220.101.5"}'
    },
    {
      id: 'crowdstrike_malware',
      source: 'CrowdStrike Falcon' as const,
      riskCode: 'RSK-2026-05',
      title: 'CrowdStrike EDR: Suspicious PowerShell process injection blocked on laptop WKS-042',
      severity: 'Critical' as const,
      likelihoodDelta: 2,
      rawPayload: '{"agent_id": "cs-sensor-042", "tactic": "Defense Evasion", "technique": "T1055 Process Injection", "action": "Quarantined"}'
    },
    {
      id: 'dependabot_cve',
      source: 'GitHub Dependabot' as const,
      riskCode: 'RSK-2026-08',
      title: 'Dependabot: CVSS 9.8 Remote Code Execution vulnerability flagged in core crypto lib',
      severity: 'High' as const,
      likelihoodDelta: 1,
      rawPayload: '{"advisory": "GHSA-798x-w49p-47p4", "cve": "CVE-2026-38491", "package": "go-jose", "fixed_version": "v4.0.5"}'
    },
    {
      id: 'okta_mfa_anomaly',
      source: 'Okta Identity' as const,
      riskCode: 'RSK-2026-04',
      title: 'Okta ThreatInsight: Multiple failed MFA challenge attempts against admin account',
      severity: 'Medium' as const,
      likelihoodDelta: 1,
      rawPayload: '{"event_type": "user.mfa.challenge.fail", "actor": "admin@apexfintech.io", "location": "Bucharest, RO", "status": "DENIED"}'
    }
  ];

  const handleSimulateAlert = async (scenario: typeof SIMULATION_SCENARIOS[0]) => {
    setSimulatingSource(scenario.id);
    const targetRisk = risks.find(r => r.riskCode === scenario.riskCode);

    if (!targetRisk) {
      showToast({
        title: 'Target Risk Not Found',
        message: `Risk ${scenario.riskCode} could not be found for telemetry stream injection.`,
        type: 'error'
      });
      setSimulatingSource(null);
      return;
    }

    const newSignal: RiskTelemetrySignal = {
      source: scenario.source,
      alertTitle: scenario.title,
      severity: scenario.severity,
      detectedAt: new Date().toISOString(),
      active: true,
      rawPayloadSnippet: scenario.rawPayload,
      automatedScoreDelta: scenario.likelihoodDelta
    };

    // Calculate dynamically elevated likelihood (clamped to 5)
    const newLikelihood = Math.min(5, (targetRisk.residualLikelihood || 1) + scenario.likelihoodDelta);
    const existingSignals = targetRisk.telemetrySignals || [];

    updateRisk(targetRisk.id, {
      telemetrySignals: [newSignal, ...existingSignals],
      residualLikelihood: newLikelihood,
      residualScore: newLikelihood * (targetRisk.residualImpact || 1)
    });

    logAuditEvent(
      'UPDATE',
      'Continuous Control Telemetry',
      `Live signal injected from ${scenario.source} onto ${targetRisk.riskCode}. Residual likelihood elevated to ${newLikelihood}.`
    );

    showToast({
      title: `Live Alert: ${scenario.source}`,
      message: `Risk ${targetRisk.riskCode} score elevated due to live detection.`,
      type: 'warning'
    });

    setTimeout(() => {
      setSimulatingSource(null);
    }, 600);
  };

  const handleAutoRemediate = (risk: RiskRecord, signalTitle: string) => {
    const updatedSignals = (risk.telemetrySignals || []).map(s => 
      s.alertTitle === signalTitle ? { ...s, active: false } : s
    );

    // Revert residual likelihood back down by 1-2 points (min 1)
    const newLikelihood = Math.max(1, (risk.residualLikelihood || 1) - 1);

    updateRisk(risk.id, {
      telemetrySignals: updatedSignals,
      residualLikelihood: newLikelihood,
      residualScore: newLikelihood * (risk.residualImpact || 1)
    });

    logAuditEvent(
      'UPDATE',
      'Continuous Control Telemetry',
      `Auto-remediation executed for signal "${signalTitle}" on ${risk.riskCode}. Likelihood normalized to ${newLikelihood}.`
    );

    showToast({
      title: 'Signal Remediated',
      message: `Automated control applied. Risk ${risk.riskCode} likelihood normalized.`,
      type: 'success'
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Status */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-rose-950/30 to-slate-900 border border-rose-900/40 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
              </span>
              <span className="text-[10px] font-mono uppercase font-bold text-rose-400 bg-rose-950 px-2.5 py-0.5 rounded-lg border border-rose-800 flex items-center space-x-1">
                <Radio className="w-3.5 h-3.5" />
                <span>Continuous Control Monitoring (CCM) Telemetry</span>
              </span>
              <span className="text-xs text-slate-400">
                Live Ingestion Stream
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              Automated Risk Telemetry & SIEM / EDR Signal Stream
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Real-time API webhooks from AWS Security Hub, CrowdStrike Falcon, GitHub Dependabot, and Okta.
              Live threats dynamically adjust risk probability scores and trigger automated audit escalations.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
              <div className="text-xl font-bold font-mono text-rose-400">{activeSignals.length}</div>
              <div className="text-[10px] text-slate-400">Active Signals</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
              <div className="text-xl font-bold font-mono text-emerald-400">{resolvedSignals.length}</div>
              <div className="text-[10px] text-slate-400">Auto-Remediated</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Telemetry Simulator Card */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Live Telemetry Event Simulator (Inject Anomaly to Test Auto-Score Adjustment)
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">Click any trigger to simulate live event</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {SIMULATION_SCENARIOS.map((sc) => (
            <button
              key={sc.id}
              disabled={simulatingSource === sc.id}
              onClick={() => handleSimulateAlert(sc)}
              className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-rose-500/50 hover:bg-slate-900 text-left transition-all group relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono font-bold text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
                  {sc.source}
                </span>
                <span className="text-[10px] font-mono font-bold text-rose-400">
                  +{sc.likelihoodDelta} Likelihood
                </span>
              </div>
              <div className="text-xs font-bold text-white group-hover:text-rose-300 transition-colors line-clamp-2">
                {sc.title}
              </div>
              <div className="text-[10px] text-slate-400 mt-2 flex items-center justify-between">
                <span>Target: {sc.riskCode}</span>
                <span className="text-slate-300 font-semibold group-hover:text-white flex items-center space-x-1">
                  <Play className="w-3 h-3 text-rose-400 fill-rose-400" />
                  <span>Fire Webhook</span>
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Live Telemetry Stream Feed */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-sky-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Connected Telemetry Feed & Audit Log Hook
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            {telemetryEntries.length} Total Telemetry Signals Logged
          </span>
        </div>

        {telemetryEntries.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400">
            <Radio className="w-8 h-8 text-slate-600 mx-auto mb-2 animate-pulse" />
            <p className="font-semibold text-sm text-slate-300">No telemetry signals recorded yet.</p>
            <p className="text-xs text-slate-500 mt-1">Use the simulator triggers above to test continuous control monitoring.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {telemetryEntries.map(({ risk, signal }, idx) => (
              <div
                key={`${risk.id}_${idx}`}
                className={`p-4 rounded-2xl border transition-all ${
                  signal.active
                    ? 'bg-rose-950/20 border-rose-800/80 shadow-lg shadow-rose-950/30'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-xl border shrink-0 ${
                      signal.active
                        ? 'bg-rose-950 border-rose-700 text-rose-400'
                        : 'bg-slate-950 border-slate-800 text-emerald-400'
                    }`}>
                      {signal.active ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-xs text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
                          {risk.riskCode}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                          {signal.source}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          signal.active
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        }`}>
                          {signal.active ? 'ACTIVE THREAT ELEVATION' : 'RESOLVED / MONITORED'}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white mt-1">
                        {signal.alertTitle}
                      </h4>

                      <div className="text-[11px] text-slate-400 mt-1 flex flex-wrap items-center gap-2">
                        <span>Associated Risk: <strong className="text-slate-300">{risk.title}</strong></span>
                        <span>•</span>
                        <span>Detected: {new Date(signal.detectedAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 shrink-0">
                    {signal.active ? (
                      <button
                        onClick={() => handleAutoRemediate(risk, signal.alertTitle)}
                        className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Auto-Remediate</span>
                      </button>
                    ) : null}

                    <button
                      onClick={() => onSelectRisk(risk)}
                      className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs border border-slate-700 transition-colors"
                    >
                      <span>Open Risk Detail</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Raw Payload Snippet */}
                {signal.rawPayloadSnippet && (
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-950 font-mono text-[10px] text-slate-300 border border-slate-800 overflow-x-auto">
                    <span className="text-slate-500 select-none mr-2">$ payload:</span>
                    {signal.rawPayloadSnippet}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
