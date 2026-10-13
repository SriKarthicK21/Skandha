import React, { useState } from 'react';
import {
  ShieldAlert,
  Lock,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  Download,
  Building2,
  ExternalLink,
  Search,
  KeyRound,
  Eye,
  ShieldCheck,
  RefreshCw,
  Server,
  Zap,
  Clock
} from 'lucide-react';
import { useGRC } from '../../context/GRCContext';
import { useToast } from '../common/ToastContainer';
import { MASNotice655Mandate } from '../../types';

// The 6 Legally Binding Mandates of MAS Notice 655 (Cyber Hygiene)
const NOTICE_655_STATUTORY_MANDATES: MASNotice655Mandate[] = [
  {
    id: 'MANDATE-655-1',
    paragraphRef: 'Notice 655 Par. 3(a)',
    requirementTitle: 'Administrative Account Securing & Segregation',
    legallyBindingClause: 'A financial institution must secure every administrative account that can be used to manage or control critical systems or networks.',
    description: 'Enforce principle of least privilege, disable generic root/admin accounts, and isolate privileged workstations.',
    isoMapping: ['A.5.15', 'A.8.2', 'A.9.2.3'],
    status: 'COMPLIANT',
    currentTelemetryValue: '0 Shared Root Accounts; PAM Dual-Control Active',
    statutoryThreshold: 'Zero unmanaged or shared root credentials permitted.',
    lastAuditedDate: '2026-08-25',
    spoc: 'Marcus Tan (Head of IAM & Cloud Infrastructure)',
    auditEvidenceRef: 'CyberArk PAM Vault Telemetry Log v2026.8',
    penaltiesForBreach: 'Statutory fine up to SGD $100,000 per violation; personal director liability.'
  },
  {
    id: 'MANDATE-655-2',
    paragraphRef: 'Notice 655 Par. 3(b)',
    requirementTitle: 'Mandatory Multi-Factor Authentication (MFA)',
    legallyBindingClause: 'A financial institution must apply multi-factor authentication to secure every administrative account and every account accessing critical systems through untrusted networks.',
    description: 'FIDO2 WebAuthn / hardware security keys enforced for all administrator logins, console access, and remote VPN ingress.',
    isoMapping: ['A.5.17', 'A.8.5', 'A.9.4.2'],
    status: 'COMPLIANT',
    currentTelemetryValue: '100% MFA Enforcement via FIDO2 / Okta Verify',
    statutoryThreshold: '100% of admin accounts and remote access must use hardware or biometric MFA.',
    lastAuditedDate: '2026-09-02',
    spoc: 'Rachel Koh (Identity Security Lead)',
    auditEvidenceRef: 'Okta Adaptive MFA Enforcement Policy Report Q3-2026',
    penaltiesForBreach: 'Regulatory sanction and revocation of digital banking feature permissions.'
  },
  {
    id: 'MANDATE-655-3',
    paragraphRef: 'Notice 655 Par. 3(c)',
    requirementTitle: 'Critical Security Patch Management (Time-Bound)',
    legallyBindingClause: 'A financial institution must apply security patches to address high-severity software vulnerabilities in all critical systems within statutory timelines.',
    description: 'Critical CVE patches (CVSS >= 9.0) must be applied within 14 calendar days; high severity (CVSS 7.0-8.9) within 30 days.',
    isoMapping: ['A.8.8', 'A.8.19', 'A.12.6.1'],
    status: 'PARTIALLY_COMPLIANT',
    currentTelemetryValue: '96.2% Patched on Time (2 Workloads in Staging Canary)',
    statutoryThreshold: 'Critical patches deployed within 14 days of public release.',
    lastAuditedDate: '2026-09-10',
    spoc: 'Dave Chen (DevSecOps Infrastructure Lead)',
    auditEvidenceRef: 'Tenable.io Vulnerability & Patch SLA Dashboard',
    penaltiesForBreach: 'Formal supervisory inquiry and mandatory third-party remediation audit.'
  },
  {
    id: 'MANDATE-655-4',
    paragraphRef: 'Notice 655 Par. 3(d)',
    requirementTitle: 'Perimeter Defense & Network Segmentation (DMZ)',
    legallyBindingClause: 'A financial institution must establish and maintain perimeter defense controls to protect its internal network from unauthorized internet connections.',
    description: 'Zero-trust network architecture, deep packet inspection, egress filtering, and strict demilitarized zones (DMZ) for public APIs.',
    isoMapping: ['A.8.20', 'A.8.21', 'A.8.22'],
    status: 'COMPLIANT',
    currentTelemetryValue: 'Micro-segmentation active across all AWS VPC subnets & Cloudflare WAF',
    statutoryThreshold: 'No direct unsegmented connectivity between Internet and Core Financial Ledgers.',
    lastAuditedDate: '2026-08-30',
    spoc: 'Praveen Kumar (Principal Network Security Architect)',
    auditEvidenceRef: 'Palo Alto Panorama Firewall Ruleset Review v2026-Q3',
    penaltiesForBreach: 'Immediate supervisory intervention by MAS Cyber Surveillance.'
  },
  {
    id: 'MANDATE-655-5',
    paragraphRef: 'Notice 655 Par. 3(e)',
    requirementTitle: 'Malware Protection & Endpoint Detection (EDR)',
    legallyBindingClause: 'A financial institution must install and maintain anti-malware controls on all systems containing customer data or connected to critical systems.',
    description: 'Behavioral EDR with real-time heuristic blocking, daily definition updates, and automated host isolation upon detection.',
    isoMapping: ['A.8.7', 'A.12.2.1'],
    status: 'COMPLIANT',
    currentTelemetryValue: 'CrowdStrike Falcon deployed on 100% of production nodes & developer laptops',
    statutoryThreshold: 'Continuous real-time behavioral protection with daily signature synchronization.',
    lastAuditedDate: '2026-09-08',
    spoc: 'Security Operations Center (SOC Tier 3)',
    auditEvidenceRef: 'CrowdStrike Agent Health & Coverage Telemetry Feed',
    penaltiesForBreach: 'Breach penalty under Notice 655 with mandatory incident reporting.'
  },
  {
    id: 'MANDATE-655-6',
    paragraphRef: 'Notice 655 Par. 3(f)',
    requirementTitle: 'Continuous Vulnerability Assessment & Pen Testing',
    legallyBindingClause: 'A financial institution must conduct regular security vulnerability assessments to identify weaknesses and annual penetration testing.',
    description: 'Automated weekly vulnerability scanning of external attack surfaces and annual CREST-certified independent penetration test.',
    isoMapping: ['A.8.8', 'A.12.6.1'],
    status: 'COMPLIANT',
    currentTelemetryValue: 'Weekly Qualys scans active; Annual CREST Pen Test completed June 2026',
    statutoryThreshold: 'Weekly external scans; annual independent penetration testing.',
    lastAuditedDate: '2026-06-18',
    spoc: 'Karthi Jegan (Chief Information Security Officer)',
    auditEvidenceRef: 'PwC Singapore CREST-Accredited Penetration Test Report',
    penaltiesForBreach: 'Suspension of new product releases pending independent security re-audit.'
  }
];

export const MASNotice655CyberHygieneDashboard: React.FC = () => {
  const { currentTenant } = useGRC();
  const { showToast } = useToast();

  const [mandates, setMandates] = useState<MASNotice655Mandate[]>(NOTICE_655_STATUTORY_MANDATES);
  const [selectedMandate, setSelectedMandate] = useState<MASNotice655Mandate>(NOTICE_655_STATUTORY_MANDATES[0]);
  const [searchQuery, setSearchQuery] = useState('');

  const compliantCount = mandates.filter(m => m.status === 'COMPLIANT').length;
  const partialCount = mandates.filter(m => m.status === 'PARTIALLY_COMPLIANT').length;
  const nonCompliantCount = mandates.filter(m => m.status === 'NON_COMPLIANT').length;
  const complianceScore = Math.round(((compliantCount + partialCount * 0.5) / mandates.length) * 100);

  const handleExportHygieneAuditSheet = () => {
    const csvContent = [
      ['Paragraph Ref', 'Requirement Title', 'Status', 'Current Telemetry', 'Statutory Threshold', 'ISO Mapping', 'Audited Date', 'SPOC', 'Evidence Ref', 'Penalties'].join(','),
      ...mandates.map(m => [
        `"${m.paragraphRef}"`,
        `"${m.requirementTitle}"`,
        `"${m.status}"`,
        `"${m.currentTelemetryValue}"`,
        `"${m.statutoryThreshold}"`,
        `"${m.isoMapping.join('; ')}"`,
        `"${m.lastAuditedDate}"`,
        `"${m.spoc}"`,
        `"${m.auditEvidenceRef}"`,
        `"${m.penaltiesForBreach}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MAS_Notice_655_Cyber_Hygiene_Compliance_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast({
      title: 'Audit Sheet Exported',
      message: 'MAS Notice 655 Legally Binding Cyber Hygiene Matrix downloaded.',
      type: 'success'
    });
  };

  const filteredMandates = mandates.filter(m =>
    m.requirementTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.paragraphRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.isoMapping.some(iso => iso.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Top Banner: Legally Binding Nature */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-800/40 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                NOTICE 655 • STATUTORY REGULATION
              </span>
              <span className="text-xs text-rose-400 font-mono font-bold">LEGALLY BINDING CYBER HYGIENE</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Lock className="w-6 h-6 text-amber-400" />
              <span>MAS Notice 655 Cyber Hygiene Mandates Ledger</span>
            </h1>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Unlike guidance, Notice 655 is <strong>subsidiary legislation</strong> carrying criminal & administrative sanctions. The 6 requirements are mandatory baseline hygiene standards for all financial institutions in Singapore.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleExportHygieneAuditSheet}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition flex items-center space-x-2 shadow-lg shadow-amber-600/20"
            >
              <Download className="w-4 h-4" />
              <span>Export Regulatory Evidence Sheet</span>
            </button>
          </div>
        </div>

        {/* 4 Scorecard Metrics */}
        <div className="mt-5 pt-4 border-t border-amber-900/40 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Notice 655 Statutory Health
            </span>
            <div className="text-2xl font-black font-mono text-emerald-400 mt-0.5">
              {complianceScore}%
            </div>
            <span className="text-[10px] text-slate-400">Zero Critical Mandate Breaches</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Fully Compliant Mandates
            </span>
            <div className="text-2xl font-bold text-white font-mono mt-0.5">
              {compliantCount} / {mandates.length}
            </div>
            <span className="text-[10px] text-emerald-400">Statutory Baselines Met</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Action Required / In-Flight
            </span>
            <div className="text-2xl font-bold text-amber-400 font-mono mt-0.5">
              {partialCount}
            </div>
            <span className="text-[10px] text-amber-400">Canary Patch SLA Active</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Non-Compliance Penalties
            </span>
            <div className="text-xs font-bold text-rose-400 mt-1">
              Max SGD $100k + License Sanction
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              Monetary Authority of Singapore
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 6 Mandates List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>The 6 Legally Enforceable Mandates</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-400">Notice 655</span>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search mandates, paragraphs, ISO controls..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-2.5">
              {filteredMandates.map(mandate => {
                const isSelected = selectedMandate.id === mandate.id;
                return (
                  <div
                    key={mandate.id}
                    onClick={() => setSelectedMandate(mandate)}
                    className={`p-3.5 rounded-xl border transition cursor-pointer text-left ${
                      isSelected
                        ? 'bg-amber-950/40 border-amber-500/60 shadow-md'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-amber-300">
                        {mandate.paragraphRef}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          mandate.status === 'COMPLIANT'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}
                      >
                        {mandate.status}
                      </span>
                    </div>

                    <div className="font-bold text-xs text-white mt-1">
                      {mandate.requirementTitle}
                    </div>

                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                      {mandate.currentTelemetryValue}
                    </p>

                    <div className="flex items-center space-x-1.5 mt-2">
                      {mandate.isoMapping.map(iso => (
                        <span key={iso} className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-800 text-slate-300">
                          {iso}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Selected Mandate Deep Dive (7 cols) */}
        <div className="lg:col-span-7">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800 font-mono">
                    {selectedMandate.paragraphRef}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Statutory Obligation</span>
                </div>
                <h2 className="text-base font-bold text-white mt-1.5">
                  {selectedMandate.requirementTitle}
                </h2>
              </div>

              <span
                className={`px-3 py-1 rounded-xl text-xs font-bold ${
                  selectedMandate.status === 'COMPLIANT'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'bg-amber-950 text-amber-300 border border-amber-800'
                }`}
              >
                {selectedMandate.status}
              </span>
            </div>

            {/* Legally Binding Clause Excerpt */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 block">
                Statutory Legal Clause (MAS Notice 655)
              </span>
              <p className="text-xs text-slate-200 italic leading-relaxed">
                "{selectedMandate.legallyBindingClause}"
              </p>
            </div>

            {/* Operational Implementation & Live Telemetry */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                <span className="text-[10px] text-slate-400 block">Live Operating Telemetry</span>
                <div className="text-xs font-bold text-emerald-400">
                  {selectedMandate.currentTelemetryValue}
                </div>
                <span className="text-[10px] text-slate-500 block">
                  Last verified: {selectedMandate.lastAuditedDate}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                <span className="text-[10px] text-slate-400 block">Statutory Non-Compliance Threshold</span>
                <div className="text-xs font-bold text-rose-300">
                  {selectedMandate.statutoryThreshold}
                </div>
                <span className="text-[10px] text-slate-500 block">
                  Regulatory Breach Level
                </span>
              </div>
            </div>

            {/* Audit Evidence & SPOC Information */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Auditor Examination Workpapers
              </h4>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Mandatory Evidence Artifact:</span>
                  <span className="font-mono font-bold text-indigo-300">{selectedMandate.auditEvidenceRef}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Single Point of Contact (SPOC):</span>
                  <span className="text-white font-semibold">{selectedMandate.spoc}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Harmonized ISO 27001 Controls:</span>
                  <span className="font-mono text-emerald-400">{selectedMandate.isoMapping.join(', ')}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Statutory Legal Penalty:</span>
                  <span className="text-rose-400 font-bold">{selectedMandate.penaltiesForBreach}</span>
                </div>
              </div>
            </div>

            {/* Bottom CISO Action Note */}
            <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-800/40 text-[11px] text-indigo-200 leading-relaxed flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>
                <strong>Chief Implementer Advisory:</strong> All 6 Notice 655 mandates must have verifiable machine logs stored for a minimum of 1 year for MAS inspection readiness.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
