import React, { useState } from 'react';
import { useGRC } from '../../context/GRCContext';
import {
  FileCode,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Zap,
  ArrowRight,
  ExternalLink,
  Sliders,
  Cpu,
  Lock,
  Search,
  Check,
  RotateCcw,
  Plus,
  ShieldCheck,
  Terminal,
  Activity,
  Layers,
  FileCheck
} from 'lucide-react';
import {
  POLICY_CONTROL_MAPPINGS,
  INITIAL_POLICY_DRIFTS,
  PolicyToControlMapping
} from '../../services/isoPolicyGovernanceEngine';
import { PolicyDriftAlert } from '../../types';
import { useToast } from '../common/ToastContainer';

interface PolicyAsCodeDriftCenterProps {
  onRequestWaiver?: (drift: PolicyDriftAlert) => void;
}

export const PolicyAsCodeDriftCenter: React.FC<PolicyAsCodeDriftCenterProps> = ({
  onRequestWaiver
}) => {
  const { showToast } = useToast();
  const { currentTenant, logAuditEvent, addFinding } = useGRC();

  const [mappings, setMappings] = useState<PolicyToControlMapping[]>(POLICY_CONTROL_MAPPINGS);
  const [drifts, setDrifts] = useState<PolicyDriftAlert[]>(INITIAL_POLICY_DRIFTS);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All');
  const [remediatingId, setRemediatingId] = useState<string | null>(null);

  // Trigger continuous compliance probe scan
  const handleRunProbes = () => {
    setIsScanning(true);
    setTimeout(() => {
      // Simulate probes running and updating timestamps
      setMappings(prev =>
        prev.map(m => ({
          ...m,
          lastProbeRun: new Date().toISOString()
        }))
      );
      setIsScanning(false);
      logAuditEvent(
        'UPDATE',
        `Automated Policy-as-Code probes executed across ${mappings.length} operational controls.`,
        'PASS'
      );
    }, 1000);
  };

  // 1-Click Auto-Remediation
  const handleAutoRemediate = (drift: PolicyDriftAlert) => {
    setRemediatingId(drift.id);
    setTimeout(() => {
      setDrifts(prev =>
        prev.map(d => {
          if (d.id === drift.id) {
            return {
              ...d,
              status: 'AUTO_REMEDIATED',
              remediatedAt: new Date().toISOString()
            };
          }
          return d;
        })
      );
      // Update mapping status
      setMappings(prev =>
        prev.map(m => {
          if (m.policyCode === drift.policyCode) {
            return { ...m, status: 'Remediated', lastProbeRun: new Date().toISOString() };
          }
          return m;
        })
      );
      setRemediatingId(null);
      logAuditEvent(
        'UPDATE',
        `Auto-remediation executed for ${drift.resourceId}: ${drift.autoRemediationAction}`,
        'PASS'
      );
    }, 800);
  };

  const filteredDrifts = drifts.filter(d => {
    if (selectedSeverity === 'All') return true;
    return d.severity === selectedSeverity;
  });

  const openDriftsCount = drifts.filter(d => d.status === 'OPEN').length;

  return (
    <div className="space-y-5 text-slate-800">
      {/* Overview Card */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-700 px-2 py-0.5 rounded bg-sky-50 border border-sky-200">
                  Pillar 2: Policy-as-Code
                </span>
                <span className="text-xs text-slate-500">Bi-Directional Traceability &amp; Drift Detection</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                Operationalizing Policies into Testable Controls &amp; Real-Time Probes
              </h3>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleRunProbes}
              disabled={isScanning}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center space-x-2 shadow-xs cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Scanning Probes...' : 'Run Continuous Probes'}</span>
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed max-w-4xl">
          <strong>The Problem:</strong> Written statements like &ldquo;All databases must have customer-managed encryption&rdquo; are rarely linked to code, creating a disconnect between policy and live cloud reality.
          <br />
          <strong>The Fix:</strong> Bind every policy clause to an automated CSPM probe, CI/CD webhook, or IdP API monitor. When technical configuration drifts, the system triggers real-time alerts with one-click automated remediation.
        </p>

        {/* Quick Metric Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-[11px] text-slate-500 font-medium">Mapped Active Probes</div>
            <div className="text-lg font-bold text-slate-900 mt-0.5">{mappings.length} Probes</div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">100% Clause Coverage</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-[11px] text-slate-500 font-medium">Policy Drift Incidents</div>
            <div className={`text-lg font-bold mt-0.5 ${openDriftsCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {openDriftsCount} Open Alert{openDriftsCount === 1 ? '' : 's'}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Real-time CSPM &amp; IdP</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-[11px] text-slate-500 font-medium">Automated Auto-Remediations</div>
            <div className="text-lg font-bold text-emerald-600 mt-0.5">
              {drifts.filter(d => d.status === 'AUTO_REMEDIATED').length} Resolved
            </div>
            <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">Zero human downtime</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-[11px] text-slate-500 font-medium">Audit Drift Status</div>
            <div className="text-lg font-bold text-indigo-600 mt-0.5">Continuous Pass</div>
            <div className="text-[10px] text-indigo-700 font-semibold mt-0.5">ISO 27001 Cl. 8.1</div>
          </div>
        </div>
      </div>

      {/* SECTION 1: Active Drift Alerts & Auto-Remediation */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>Automated Policy Drift Alerts</span>
            </h4>
            <p className="text-xs text-slate-500">
              When production infrastructure diverges from written policy clauses, alerts flag the exact deviation with automated remediation paths.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500 font-medium">Filter Severity:</span>
            <select
              value={selectedSeverity}
              onChange={e => setSelectedSeverity(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-semibold bg-white"
            >
              <option value="All">All Severities</option>
              <option value="CRITICAL">Critical Only</option>
              <option value="HIGH">High Only</option>
              <option value="MEDIUM">Medium Only</option>
            </select>
          </div>
        </div>

        <div className="space-y-3">
          {filteredDrifts.map(drift => {
            const isOpen = drift.status === 'OPEN';
            const isRemediated = drift.status === 'AUTO_REMEDIATED';

            return (
              <div
                key={drift.id}
                className={`p-4 rounded-xl border transition-all ${
                  isOpen
                    ? 'bg-rose-50/40 border-rose-200'
                    : 'bg-emerald-50/30 border-emerald-200'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono ${
                        drift.severity === 'CRITICAL'
                          ? 'bg-rose-600 text-white'
                          : drift.severity === 'HIGH'
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-700 text-white'
                      }`}>
                        {drift.severity}
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-900">
                        {drift.id}
                      </span>
                      <span className="text-xs font-semibold text-slate-700">
                        {drift.policyCode} • {drift.annexA}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                        isOpen
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      }`}>
                        {isOpen ? 'ACTIVE DRIFT' : 'AUTO-REMEDIATED'}
                      </span>
                    </div>

                    <h5 className="text-xs font-bold text-slate-900">
                      {drift.policyClause}
                    </h5>

                    <p className="text-xs text-slate-600">
                      {drift.driftDescription}
                    </p>

                    <div className="pt-1 flex flex-wrap gap-4 text-[11px] text-slate-500 font-mono">
                      <span>Resource: <strong className="text-slate-800">{drift.resourceId}</strong></span>
                      <span>Type: <strong className="text-slate-800">{drift.resourceType}</strong></span>
                    </div>
                  </div>

                  {/* Actions: Auto Remediate OR Request Formal Waiver */}
                  <div className="flex items-center space-x-2 shrink-0">
                    {isOpen ? (
                      <>
                        {drift.autoRemediationAvailable && (
                          <button
                            onClick={() => handleAutoRemediate(drift)}
                            disabled={remediatingId === drift.id}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                          >
                            <Zap className={`w-3.5 h-3.5 ${remediatingId === drift.id ? 'animate-spin' : ''}`} />
                            <span>{remediatingId === drift.id ? 'Remediating...' : '1-Click Auto-Remediate'}</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            if (onRequestWaiver) onRequestWaiver(drift);
                            else showToast({
                              type: 'info',
                              title: 'ISO Exception Waiver',
                              message: `Request formal ISO Exception Waiver for ${drift.id}`
                            });
                          }}
                          className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold transition flex items-center space-x-1.5 cursor-pointer"
                        >
                          <FileCheck className="w-3.5 h-3.5 text-amber-600" />
                          <span>Request Policy Waiver</span>
                        </button>
                      </>
                    ) : (
                      <div className="flex items-center space-x-1.5 text-emerald-700 text-xs font-semibold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Remediated at {new Date(drift.remediatedAt || '').toLocaleTimeString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* State comparison drawer */}
                <div className="mt-3 pt-3 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                      Expected Policy Baseline
                    </span>
                    <span className="font-mono text-[11px] text-slate-800">{drift.policyRuleExpected}</span>
                  </div>
                  <div className={`p-2.5 rounded-lg border ${isOpen ? 'bg-rose-50/50 border-rose-200' : 'bg-emerald-50/50 border-emerald-200'}`}>
                    <span className="text-[10px] font-bold uppercase tracking-wider block mb-0.5 text-slate-500">
                      Actual Observed State
                    </span>
                    <span className="font-mono text-[11px] font-semibold text-slate-900">{drift.actualObservedState}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: Bi-Directional Traceability Matrix */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Bi-Directional Policy-to-Probe Traceability Matrix</span>
            </h4>
            <p className="text-xs text-slate-500">
              Live mapping linking every written policy clause to ISO 27001:2022 Annex A controls and automated telemetry probes.
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono">Continuous Verification Active</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <th className="py-2.5 px-3">Policy Clause &amp; Title</th>
                <th className="py-2.5 px-3">ISO 27001:2022 Control</th>
                <th className="py-2.5 px-3">Automated Enforcement Probe</th>
                <th className="py-2.5 px-3">Scan Cadence</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Last Verified</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mappings.map(m => (
                <tr key={m.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-slate-900">{m.clauseOrSection}</div>
                    <div className="text-[11px] text-slate-500">{m.policyCode} • {m.policyTitle}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="font-mono font-bold text-indigo-700 px-1.5 py-0.5 rounded bg-indigo-50 border border-indigo-200">
                      {m.isoAnnexA}
                    </span>
                    <div className="text-[11px] text-slate-600 mt-0.5">{m.controlTitle}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-slate-800">{m.automatedProbe}</div>
                    <div className="text-[11px] text-slate-500">{m.enforcementMechanism}</div>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">
                    {m.probeCadence}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      m.status === 'Pass'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : m.status === 'Drift Detected'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-sky-50 text-sky-700 border-sky-200'
                    }`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-[11px] text-slate-500 font-mono">
                    {new Date(m.lastProbeRun).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
