import React, { useState, useEffect } from 'react';
import { DPDPBreachIncidentRecord, INITIAL_BREACH_INCIDENTS } from '../../data/dpdpMasterData';
import { useToast } from '../common/ToastContainer';
import { useGRC } from '../../context/GRCContext';
import { organizationService } from '../../services/organizationService';
import {
  AlertOctagon,
  Clock,
  ShieldAlert,
  Send,
  FileText,
  CheckCircle2,
  Copy,
  Download,
  Flame,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export const DPDPBreachPlaybook: React.FC = () => {
  const { currentTenant } = useGRC();
  const orgName = organizationService.getOrganizationName(currentTenant, 'Enterprise Data Fiduciary');
  const legalOrgName = organizationService.getLegalName(currentTenant, `${orgName} Pvt Ltd`);
  const emailDomain = (currentTenant?.name || 'enterprise').toLowerCase().replace(/[^a-z0-9]/g, '');
  const { showToast } = useToast();
  const [incidents, setIncidents] = useState<DPDPBreachIncidentRecord[]>(INITIAL_BREACH_INCIDENTS);
  const [selectedIncident, setSelectedIncident] = useState<DPDPBreachIncidentRecord>(INITIAL_BREACH_INCIDENTS[0]);
  const [activeDocView, setActiveDocView] = useState<'DPBI' | 'CERT_IN' | 'PRINCIPAL'>('DPBI');

  // Interactive Live Drill Countdown Simulator
  const [drillActive, setDrillActive] = useState<boolean>(false);
  const [drillSecondsLeft, setDrillSecondsLeft] = useState<number>(6 * 3600); // 6 hours = 21,600s
  const [activeDrillMilestone, setActiveDrillMilestone] = useState<number>(1);

  useEffect(() => {
    let interval: any;
    if (drillActive && drillSecondsLeft > 0) {
      interval = setInterval(() => {
        setDrillSecondsLeft(prev => {
          if (prev <= 1) {
            setDrillActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [drillActive, drillSecondsLeft]);

  // Format drill seconds to HH:MM:SS
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const startDrill = () => {
    setDrillActive(true);
    setDrillSecondsLeft(6 * 3600);
    setActiveDrillMilestone(1);
    showToast({
      title: '6-Hour Breach Drill Initiated',
      description: 'The statutory 6-hour DPBI & CERT-In escalation clock is now live.',
      type: 'warning'
    });
  };

  const resetDrill = () => {
    setDrillActive(false);
    setDrillSecondsLeft(6 * 3600);
    setActiveDrillMilestone(1);
  };

  // Copy document to clipboard
  const copyToClipboard = (text: string, title: string) => {
    navigator.clipboard.writeText(text);
    showToast({
      title: 'Copied to Clipboard',
      description: `Copied ${title} format for regulatory submission.`,
      type: 'info'
    });
  };

  // Generate DPBI Formal Notice Text
  const dpbiNoticeText = `FORM OF INTIMATION OF PERSONAL DATA BREACH
[Pursuant to Section 8(6) of the Digital Personal Data Protection Act, 2023]

TO:
The Secretary / Adjudicating Officer,
Data Protection Board of India (DPBI),
Government of India, New Delhi.

FROM DATA FIDUCIARY:
Entity Name: ${legalOrgName}
Registration Ref: FIDC-IND-2026-8812
Designated DPO: Elena Rostova (CISO & Data Protection Officer)
Contact: dpo@${emailDomain}.example.in / +91 80 4455 0100

1. DETAILS OF PERSONAL DATA BREACH:
   - Incident Reference: ${selectedIncident.incidentCode}
   - Date & Time of Detection: ${selectedIncident.detectedAt}
   - Source of Discovery: ${selectedIncident.discoverySource}
   - Severity Level: ${selectedIncident.severity}

2. NATURE AND SCOPE OF BREACH:
   - Summary: ${selectedIncident.breachDescription}
   - Root Cause: ${selectedIncident.rootCause}
   - Estimated Number of Affected Data Principals: ${selectedIncident.affectedDataPrincipalsEst.toLocaleString()}
   - Categories of Personal Data Exposed: ${selectedIncident.dataCategoriesCompromised.join(', ')}

3. CONTAINMENT & TECHNICAL SAFEGUARDS DEPLOYED:
   - Containment Status: ${selectedIncident.containmentStatus}
   - Measures Taken: Access credentials revoked; affected cloud storage permissions immediately restricted to private VPC; forensic memory snapshot captured for analysis.

4. INTIMATION TO DATA PRINCIPALS:
   - Intimation Status: ${selectedIncident.dataPrincipalNotificationStatus}
   - Mode of Communication: Direct verified email and in-app security warning banner.

Date: ${new Date().toISOString().split('T')[0]}
Authorized Signature: Elena Rostova, DPO`;

  // Generate CERT-In Report Text
  const certInNoticeText = `CYBER INCIDENT REPORTING FORMAT (ANNEXURE 1)
[Pursuant to CERT-In Cyber Security Directions 2022 / 6-Hour Reporting Mandate]

TO:
Computer Emergency Response Team - India (CERT-In),
Electronics Niketan, 6, CGO Complex, Lodhi Road, New Delhi - 110003
Email: incident@cert-in.org.in / Hotline: 1800-11-4949

1. Organization: ${legalOrgName}
2. Incident Classification: Data Exfiltration / S3 Bucket Misconfiguration
3. Time of Incident Detection: ${selectedIncident.detectedAt}
4. Time of Submission: Within 6 Hours of Discovery (Compliant)
5. Impacted Assets: Staging & Replication Storage Clusters (AWS ap-south-1 Mumbai)
6. Indicators of Compromise (IoCs):
   - IP Range: 198.51.100.44 - 198.51.100.58
   - User Agent: Automated Scanner / Exfil Engine
7. Containment Actions Taken:
   - Bucket ACLs switched to Block Public Access
   - Access keys rotated across all service accounts
   - Zero production databases compromised
8. Incident Handler / CISO Contact: Elena Rostova (+91 80 4455 0100)`;

  // Generate Data Principal Notice Text
  const principalNoticeText = `IMPORTANT SECURITY NOTICE REGARDING YOUR PERSONAL DATA
[Pursuant to Section 8(6) of the Digital Personal Data Protection Act, 2023]

Dear Valued Customer,

We are writing to inform you of a recent security incident that may have involved a portion of your personal data. At ${orgName}, we take the confidentiality of your digital personal data with the utmost seriousness.

WHAT HAPPENED?
On ${new Date(selectedIncident.detectedAt).toLocaleDateString()}, our Security Operations Center detected an unauthorized configuration change affecting a non-production data cluster. Our security team isolated and contained the issue within 18 minutes.

WHAT INFORMATION WAS INVOLVED?
The data categories potentially viewed were limited to: ${selectedIncident.dataCategoriesCompromised.join(', ')}.
CRITICAL NOTE: No passwords, payment card PINs, CVVs, or core financial transaction records were involved.

WHAT MEASURES HAVE WE TAKEN?
- The exposure was completely sealed immediately.
- We have notified the Data Protection Board of India (DPBI) and CERT-In in compliance with statutory requirements.
- We have engaged an independent certified cybersecurity audit firm to verify the integrity of all cloud environments.

RECOMMENDED ACTIONS FOR YOU:
${selectedIncident.remedialMeasuresToPrincipals.map(m => `• ${m}`).join('\n')}

FOR ASSISTANCE OR QUESTIONS:
Contact our designated Data Protection Officer (DPO) directly at dpo@apexfintech.example.in or toll-free at 1800-200-FINTECH.`;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-rose-950/20 to-slate-900 border border-rose-500/20 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Section 8(6) & CERT-In 6-Hour SLA
              </span>
              <span className="text-xs text-slate-400">Statutory Penalties Up to ₹200 Crores</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>6-Hour Breach Notification Playbook & Drill</span>
              <AlertOctagon className="w-5 h-5 text-rose-400" />
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Upon detection of a personal data breach, Section 8(6) of the DPDP Act mandates intimation to the Data Protection Board of India (DPBI) and each affected Data Principal. Synchronized with CERT-In directions, formal notification must be dispatched within 6 hours.
            </p>
          </div>

          {/* Live Drill Simulator Box */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 shrink-0 flex flex-col items-center justify-center space-y-2 min-w-[240px]">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {drillActive ? 'Active Breach Drill Countdown' : '6-Hour Escalation Benchmark'}
            </div>
            <div
              className={`text-3xl font-black font-mono tracking-wider ${
                drillSecondsLeft <= 3600
                  ? 'text-rose-400 animate-pulse'
                  : drillSecondsLeft <= 7200
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {formatTime(drillSecondsLeft)}
            </div>
            <div className="flex items-center space-x-2">
              {!drillActive ? (
                <button
                  type="button"
                  onClick={startDrill}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center space-x-1 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Start Mock 6h Drill</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={resetDrill}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Drill</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 5-Step Escalation Milestones */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-mono text-amber-400 font-bold">T+0h &rarr; T+1h</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-bold text-white">Detection & Scoping</div>
          <p className="text-[11px] text-slate-400">Classify breach severity and quantify affected Indian Data Principals.</p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-mono text-amber-400 font-bold">T+1h &rarr; T+3h</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-bold text-white">Containment & Freeze</div>
          <p className="text-[11px] text-slate-400">Seal compromised endpoints, revoke tokens, freeze forensic evidence.</p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-rose-500/30 bg-rose-950/10 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-mono text-rose-400 font-bold">T+3h &rarr; T+4h</span>
            <Clock className="w-4 h-4 text-rose-400" />
          </div>
          <div className="font-bold text-white">DPBI Notice Prep</div>
          <p className="text-[11px] text-slate-300">Generate formal intimation under Section 8(6) for Board submission.</p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-rose-500/30 bg-rose-950/10 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-mono text-rose-400 font-bold">T+4h &rarr; T+6h</span>
            <Clock className="w-4 h-4 text-rose-400" />
          </div>
          <div className="font-bold text-white">CERT-In 6h Dispatch</div>
          <p className="text-[11px] text-slate-300">Submit Annexure 1 cyber incident format to incident@cert-in.org.in.</p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-mono text-sky-400 font-bold">Post-Containment</span>
            <FileText className="w-4 h-4 text-sky-400" />
          </div>
          <div className="font-bold text-white">Principal Warning</div>
          <p className="text-[11px] text-slate-400">Issue direct notice to affected citizens with actionable remedy steps.</p>
        </div>
      </div>

      {/* Interactive Regulatory Intimation Document Generator */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setActiveDocView('DPBI')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeDocView === 'DPBI'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              1. DPBI Section 8(6) Intimation Form
            </button>
            <button
              type="button"
              onClick={() => setActiveDocView('CERT_IN')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeDocView === 'CERT_IN'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              2. CERT-In 6-Hour Incident Report
            </button>
            <button
              type="button"
              onClick={() => setActiveDocView('PRINCIPAL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeDocView === 'PRINCIPAL'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              3. Data Principal Direct Notice
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => {
                const text =
                  activeDocView === 'DPBI'
                    ? dpbiNoticeText
                    : activeDocView === 'CERT_IN'
                    ? certInNoticeText
                    : principalNoticeText;
                copyToClipboard(text, activeDocView);
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-amber-400" />
              <span>Copy Template</span>
            </button>
          </div>
        </div>

        {/* Document Content Preview */}
        <div className="p-4 rounded-xl bg-slate-950 font-mono text-xs text-slate-200 border border-slate-800 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
          {activeDocView === 'DPBI' && dpbiNoticeText}
          {activeDocView === 'CERT_IN' && certInNoticeText}
          {activeDocView === 'PRINCIPAL' && principalNoticeText}
        </div>
      </div>
    </div>
  );
};
