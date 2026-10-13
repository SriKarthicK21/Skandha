import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Lock,
  FileText,
  Sparkles,
  Layers,
  Download,
  Search,
  Building2,
  Server,
  Activity,
  Check,
  Copy,
  ExternalLink,
  Eye,
  RefreshCw,
  Play,
  Send,
  Zap,
  Award,
  FileCheck,
  Flame,
  SlidersHorizontal,
  Radio,
  Users,
  CheckSquare,
  KeyRound,
  ArrowRightLeft,
  Calendar,
  BarChart3,
  TrendingUp,
  Cpu,
  BadgeAlert,
  FileWarning,
  ListOrdered
} from 'lucide-react';
import { useGRC } from '../../context/GRCContext';
import { useToast } from '../common/ToastContainer';

// 11 New ISO 27001:2022 Controls Deep Structure
interface NewISOControl {
  code: string;
  title: string;
  theme: 'Organizational' | 'Physical' | 'Technological';
  clauseRef: string;
  masTrmOverlap: string;
  purpose: string;
  auditorExpectation: string;
  mandatoryEvidence: string[];
  suggestedAction: string;
  defaultStatus: 'Implemented' | 'In Progress' | 'Action Required';
}

const NEW_ISO_2022_CONTROLS: NewISOControl[] = [
  {
    code: 'A.5.7',
    title: 'Threat Intelligence',
    theme: 'Organizational',
    clauseRef: 'Annex A 5.7',
    masTrmOverlap: 'MAS TRM Domain 10.1 & Circular on Cyber Threat Intel Sharing',
    purpose: 'Systematically gather and analyze external threat intelligence (IOCs, TTPs, CVE exploits) to inform defensive postures.',
    auditorExpectation: 'Formal subscription to commercial or national threat feeds (e.g., FS-ISAC, SingCERT), documented weekly triage log, and integration into SIEM/EDR blocklists.',
    mandatoryEvidence: ['Threat Intelligence SOP v1.2', 'FS-ISAC / CERT Ingestion Log', 'Threat-to-Defense Mapping Matrix'],
    suggestedAction: 'Connect external threat feeds directly to firewall and EDR automated blocking rules.',
    defaultStatus: 'In Progress'
  },
  {
    code: 'A.5.23',
    title: 'Information Security for Cloud Services',
    theme: 'Organizational',
    clauseRef: 'Annex A 5.23',
    masTrmOverlap: 'MAS TRM Domain 5 (Outsourcing & Cloud) & MAS Cloud Computing Advisory',
    purpose: 'Establish processes for acquisition, use, management, and exit of cloud services (IaaS, PaaS, SaaS) with clear shared responsibilities.',
    auditorExpectation: 'Cloud Security Matrix documenting shared responsibility boundaries (AWS/GCP vs Tenant), automated cloud posture management (CSPM) reports, and validated cloud exit/DR plans.',
    mandatoryEvidence: ['Cloud Security Shared Responsibility Matrix', 'CSPM Drift Scan Reports', 'Cloud Exit Strategy & Data Extraction Runbook'],
    suggestedAction: 'Audit tenant AWS/Azure/GCP IAM configurations against CIS Cloud Benchmarks.',
    defaultStatus: 'Implemented'
  },
  {
    code: 'A.5.30',
    title: 'ICT Readiness for Business Continuity',
    theme: 'Organizational',
    clauseRef: 'Annex A 5.30',
    masTrmOverlap: 'MAS TRM Domain 12 & Notice 644 Critical System Availability (4-hour RTO)',
    purpose: 'Ensure ICT capability can be maintained or recovered at required levels and within required timeframes during disruption.',
    auditorExpectation: 'Demonstrated disaster recovery drills with documented RTO (Recovery Time Objective) and RPO (Recovery Point Objective) matching business continuity plans.',
    mandatoryEvidence: ['Annual DR Drill Test Report', 'RTO/RPO System Tiering Register', 'Secondary Datacenter Failover Log'],
    suggestedAction: 'Verify critical banking/payment systems meet the MAS 4-hour RTO statutory mandate.',
    defaultStatus: 'In Progress'
  },
  {
    code: 'A.7.4',
    title: 'Physical Security Monitoring',
    theme: 'Physical',
    clauseRef: 'Annex A 7.4',
    masTrmOverlap: 'MAS TRM Domain 6 (Physical Access & Data Centre Security)',
    purpose: 'Continuously monitor physical premises, server rooms, and critical processing zones against unauthorized physical intrusion.',
    auditorExpectation: 'Tamper-resistant CCTV recordings retained for minimum 90 days, biometric access logs reviewed monthly, and environmental sensor alerts.',
    mandatoryEvidence: ['CCTV Retention & Coverage Audit', 'Server Room Access Badge Audit Log', 'Physical Security Inspection Checklists'],
    suggestedAction: 'Implement automated quarterly reviews of physical access badge permissions.',
    defaultStatus: 'Implemented'
  },
  {
    code: 'A.8.9',
    title: 'Configuration Management',
    theme: 'Technological',
    clauseRef: 'Annex A 8.9',
    masTrmOverlap: 'MAS TRM Domain 7.1 & Notice 655 Cyber Hygiene (Baseline Hardening)',
    purpose: 'Establish, document, implement, monitor, and review security configurations (hardening baselines) for hardware, software, and services.',
    auditorExpectation: 'Golden baseline images based on CIS Benchmarks, automated drift detection with daily alerting, and strict change control on configuration templates.',
    mandatoryEvidence: ['CIS Benchmark Hardening Standard', 'Infrastructure-as-Code (Terraform) Drift Logs', 'Golden Image Build Pipeline Config'],
    suggestedAction: 'Enforce automated IaC compliance scans in CI/CD before any server or cluster provisioning.',
    defaultStatus: 'In Progress'
  },
  {
    code: 'A.8.10',
    title: 'Information Deletion',
    theme: 'Technological',
    clauseRef: 'Annex A 8.10',
    masTrmOverlap: 'MAS TRM Domain 7.4 (Secure Disposal) & Singapore PDPA Retention Mandates',
    purpose: 'Securely delete information held in systems, applications, or storage media when no longer required by policy or law.',
    auditorExpectation: 'Automated data retention and purging scripts compliant with NIST SP 800-88, crypto-shredding keys rotation logs, and certificates of media destruction.',
    mandatoryEvidence: ['Data Retention & Disposal Schedule', 'NIST 800-88 Sanitization Certificates', 'Automated Purging Job Logs'],
    suggestedAction: 'Implement automated lifecycle policies on S3 buckets and database archive partitions.',
    defaultStatus: 'Action Required'
  },
  {
    code: 'A.8.11',
    title: 'Data Masking',
    theme: 'Technological',
    clauseRef: 'Annex A 8.11',
    masTrmOverlap: 'MAS TRM Domain 8.3 (Data Protection & Test Data Anonymization)',
    purpose: 'Apply masking, pseudonymization, or tokenization to sensitive data in accordance with access control policies and regulatory requirements.',
    auditorExpectation: 'Enforced tokenization or dynamic masking of PII and financial card data in non-production environments; zero raw production data in staging/test.',
    mandatoryEvidence: ['Data Masking Standard Operating Procedure', 'Non-Production Test Data Sanitization Attestation', 'Synthetic Data Pipeline Configuration'],
    suggestedAction: 'Deploy synthetic data generation tools for software QA staging environments.',
    defaultStatus: 'In Progress'
  },
  {
    code: 'A.8.12',
    title: 'Data Leakage Prevention (DLP)',
    theme: 'Technological',
    clauseRef: 'Annex A 8.12',
    masTrmOverlap: 'MAS TRM Domain 7.3 & Notice 655 Data Protection',
    purpose: 'Apply data leakage prevention measures to systems, networks, and endpoint devices that process, store, or transmit sensitive information.',
    auditorExpectation: 'Active DLP agents on corporate endpoints blocking unencrypted USB exfiltration, email content inspection filtering credit cards/PII, and cloud storage upload filters.',
    mandatoryEvidence: ['DLP Rule & Policy Configuration Export', 'Quarterly Exfiltration Alert Triage Reports', 'Endpoint USB Blocklist Verification Log'],
    suggestedAction: 'Enable outbound email DLP rules for payment account numbers and national ID formats.',
    defaultStatus: 'In Progress'
  },
  {
    code: 'A.8.16',
    title: 'Monitoring Activities',
    theme: 'Technological',
    clauseRef: 'Annex A 8.16',
    masTrmOverlap: 'MAS TRM Domain 10.2 & Notice 655 Centralized Security Logging',
    purpose: 'Continuously monitor networks, systems, and applications for anomalous behavior and evaluate information security events.',
    auditorExpectation: '24/7 SOC / SIEM coverage with behavioral baselining, correlated alert rules, and automated ticket generation for high-severity anomalies.',
    mandatoryEvidence: ['SIEM Alert Use Case Matrix', 'SOC Tier-1/2 Escalation Runbook', 'Monthly Incident & Anomaly Trend Reports'],
    suggestedAction: 'Tune SIEM alerts to filter false positives and focus on brute-force, lateral movement, and privileged misuse.',
    defaultStatus: 'Implemented'
  },
  {
    code: 'A.8.23',
    title: 'Web Filtering',
    theme: 'Technological',
    clauseRef: 'Annex A 8.23',
    masTrmOverlap: 'MAS TRM Domain 7.2 & Notice 655 Network Defense',
    purpose: 'Manage access to external websites to reduce exposure to malicious content, phishing, and unapproved web services.',
    auditorExpectation: 'DNS and HTTP/HTTPS proxy inspection blocking newly registered domains, known command-and-control IP addresses, and unsanctioned personal cloud storage.',
    mandatoryEvidence: ['Secure Web Gateway (SWG) Policy Matrix', 'DNS Sinkhole & Filter Configuration', 'Quarterly Web Proxy Block Statistics'],
    suggestedAction: 'Enforce DNS-over-HTTPS filtering across all corporate laptops and remote worker VPNs.',
    defaultStatus: 'Implemented'
  },
  {
    code: 'A.8.28',
    title: 'Secure Coding',
    theme: 'Technological',
    clauseRef: 'Annex A 8.28',
    masTrmOverlap: 'MAS TRM Domain 8.1 & 8.2 (Secure Software Development & Source Code Review)',
    purpose: 'Apply secure coding principles to internal software development and third-party software components.',
    auditorExpectation: 'Automated SAST, DAST, and SCA (Software Composition Analysis) integrated into git commit/merge gates with blocking thresholds on OWASP Top 10 vulnerabilities.',
    mandatoryEvidence: ['Secure Coding Guidelines (OWASP Top 10)', 'CI/CD Pipeline Security Gate Definitions', 'Annual Third-Party Penetration Test & Code Audit'],
    suggestedAction: 'Enforce mandatory branch protection requiring zero critical/high CVEs in open-source dependencies prior to deployment.',
    defaultStatus: 'In Progress'
  }
];

export const ISOMASImprovementHubModule: React.FC = () => {
  const {
    controls,
    updateControl,
    findings,
    addFinding,
    currentTenant
  } = useGRC();
  const { showToast } = useToast();

  // Active Tab navigation inside this hub
  const [activeTab, setActiveTab] = useState<
    'harmonization' | 'incident644' | 'cyberHygiene655' | 'newISOControls' | 'vendorPrivileged' | 'boardGovernance'
  >('harmonization');

  // Search & Filters
  const [isoControlFilter, setIsoControlFilter] = useState<'ALL' | 'Implemented' | 'In Progress' | 'Action Required'>('ALL');
  const [isoSearch, setIsoSearch] = useState('');

  // Local state for 11 new controls
  const [isoControlStates, setIsoControlStates] = useState<Record<string, 'Implemented' | 'In Progress' | 'Action Required'>>(() => {
    const map: Record<string, 'Implemented' | 'In Progress' | 'Action Required'> = {};
    NEW_ISO_2022_CONTROLS.forEach(c => {
      map[c.code] = c.defaultStatus;
    });
    return map;
  });

  // MAS Notice 644 Simulator State
  const [drillActive, setDrillActive] = useState<boolean>(false);
  const [drillSecondsElapsed, setDrillSecondsElapsed] = useState<number>(0);
  const [selectedIncidentScenario, setSelectedIncidentScenario] = useState<string>('PAYMENT_API_RANSOMWARE');
  const [incidentDetails, setIncidentDetails] = useState({
    systemAffected: 'Core Fast Payment Switch (API Gateway Cluster)',
    criticalSystem: true,
    discoveryTime: new Date(Date.now() - 18 * 60000).toISOString().slice(0, 16),
    severity: 'SEV-1 (Critical Outage)',
    estimatedCustomersAffected: '45,000 Retail & Corporate Accounts',
    impactSummary: 'Inability to settle real-time domestic interbank payment transactions. Potential unauthorized payload detected on secondary worker node.',
    containmentAction: 'Isolated node cluster subnet, rerouted traffic to standby Singapore disaster recovery site, revoked compromised service account token.',
    masLiaisonContact: 'Technology Risk Department - Cyber Surveillance Team (MAS)',
    cisoSignOff: 'Karthi Jegan (Chief Information Security Officer)'
  });
  const [noticeGenerated, setNoticeGenerated] = useState<boolean>(false);
  const [rciChecklist, setRciChecklist] = useState<Record<string, boolean>>({
    step1: true,
    step2: true,
    step3: false,
    step4: false,
    step5: false
  });

  // MAS Notice 655 Cyber Hygiene State
  const [hygieneControls, setHygieneControls] = useState([
    {
      id: 'hygiene-1',
      title: 'Perimeter Defense & Zero-Trust Segmentation',
      mandateRef: 'MAS Notice 655 Paragraph 3(a)',
      isoMapping: 'ISO 27001 A.8.20 / A.8.21 / A.8.22',
      status: 'Compliant',
      description: 'Establish and maintain perimeter defense controls to protect internal networks from unauthorized internet ingress. Segregate critical systems into dedicated secure zones.',
      slaScore: '100% Ingress Inspected',
      lastAudited: '2026-08-28',
      actionNeeded: 'None. Next firewall ruleset recertification scheduled for Q4.'
    },
    {
      id: 'hygiene-2',
      title: 'Universal Multi-Factor Authentication (MFA)',
      mandateRef: 'MAS Notice 655 Paragraph 3(b)',
      isoMapping: 'ISO 27001 A.5.15 / A.8.5',
      status: 'Action Required',
      description: 'Implement multi-factor authentication for all administrative accounts accessing critical systems and all external customer/remote user access points.',
      slaScore: '94% Admin Coverage (6 service accounts missing FIDO2 hardware keys)',
      lastAudited: '2026-09-02',
      actionNeeded: 'Mandate hardware FIDO2 tokens for remaining 6 database admin accounts.'
    },
    {
      id: 'hygiene-3',
      title: 'Security Patching SLA Clock (<14d Critical / <30d High)',
      mandateRef: 'MAS Notice 655 Paragraph 3(c)',
      isoMapping: 'ISO 27001 A.8.8 / A.8.19',
      status: 'In Progress',
      description: 'Apply security patches to remediate critical vulnerabilities within 14 calendar days and high vulnerabilities within 30 calendar days of vendor release.',
      slaScore: '96.2% On-Time SLA (2 High CVEs approaching Day 26)',
      lastAudited: '2026-09-04',
      actionNeeded: 'Deploy emergency patch cycle for Linux kernel CVE-2026-3841 tonight.'
    },
    {
      id: 'hygiene-4',
      title: 'Malware Protection & Tamper-Resistant Logging',
      mandateRef: 'MAS Notice 655 Paragraph 3(d)',
      isoMapping: 'ISO 27001 A.8.7 / A.8.15 / A.8.16',
      status: 'Compliant',
      description: 'Install malware protection on all operating systems and ensure security logs of critical systems are retained in immutable, write-once storage for at least 1 year.',
      slaScore: '100% Immutable WORM Cloud Vault',
      lastAudited: '2026-08-30',
      actionNeeded: 'Verify weekly AWS S3 Object Lock compliance verification run.'
    }
  ]);

  // Timer for drill
  React.useEffect(() => {
    let interval: any;
    if (drillActive) {
      interval = setInterval(() => {
        setDrillSecondsElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [drillActive]);

  // Overall calculations
  const isoImplementedCount = Object.values(isoControlStates).filter(s => s === 'Implemented').length;
  const isoScorePercent = Math.round((isoImplementedCount / NEW_ISO_2022_CONTROLS.length) * 100);

  const hygieneCompliantCount = hygieneControls.filter(c => c.status === 'Compliant').length;
  const hygieneScorePercent = Math.round((hygieneCompliantCount / hygieneControls.length) * 100);

  const handleUpdateISOStatus = (code: string, status: 'Implemented' | 'In Progress' | 'Action Required') => {
    setIsoControlStates(prev => ({ ...prev, [code]: status }));
    showToast({
      title: `ISO Control ${code} Updated`,
      message: `Status marked as "${status}". Statement of Applicability register updated.`,
      type: 'success'
    });
  };

  const handleExecuteHarmonizedRemediation = (pillarTitle: string, isoCode: string, masDomain: string) => {
    // Add linked CAPA finding
    addFinding({
      source: 'CONTINUOUS_MONITORING',
      severity: 'Minor Non-Conformity',
      title: `[Harmonized Fix] ${pillarTitle} Alignment (ISO ${isoCode} ↔ MAS TRM ${masDomain})`,
      clauseOrControl: `${isoCode} / MAS TRM ${masDomain}`,
      department: 'Information Security & Technology Risk',
      description: `Automated remediation initiated to synchronize controls between ISO/IEC 27001:2022 (${isoCode}) and MAS TRM Guidelines (${masDomain}). Policy, technical configuration, and evidence audit trails updated.`,
      rootCauseAnalysis: {
        methodology: 'DIRECT',
        rootCauseStatement: 'Cross-framework gap identified during integrated audit harmonization review.'
      },
      capaPlan: {
        correctiveAction: 'Deploy unified policy standard, enforce automated compliance checks, and register recurring evidence artefacts in Evidence Center.',
        preventiveAction: 'Continuous crosswalk monitoring and bi-annual joint audit validation.',
        owner: 'Karthi Jegan (Lead Auditor)',
        targetDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
        evidenceRequired: 'Audit configuration exports and validated system screenshots'
      },
      status: 'Open'
    });

    showToast({
      title: 'Harmonized Remediation Executed!',
      message: `Created linked CAPA finding for ISO ${isoCode} & MAS ${masDomain}. Evidence artifacts synchronized across both registers.`,
      type: 'success'
    });
  };

  const formatDrillTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner & Multi-Standard Improvement Command Center */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-950 border border-slate-800 rounded-3xl p-6 lg:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-sky-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                ISO 27001:2022 & MAS TRM Compliance Improvement Suite
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-400" />
                Test Once, Comply with Both (~82% Synergy)
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30">
                MAS Notices 644 / 655 Enforced
              </span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Regulatory Excellence & Continuous Audit Readiness Engine
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Comprehensive implementation workspace covering the <strong>11 New ISO 27001:2022 Controls</strong>, 
              the statutory <strong>MAS 1-Hour Incident Notification (Notice 644)</strong>, 
              mandatory <strong>Cyber Hygiene SLAs (Notice 655)</strong>, privileged access zero-trust controls, and board governance.
            </p>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 min-w-[320px]">
            <div className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-3.5 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-400 block">11 New ISO Controls</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-sky-400">{isoImplementedCount}/11</span>
                <span className="text-xs text-slate-400 font-mono">({isoScorePercent}%)</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-sky-500 h-full rounded-full transition-all duration-500" style={{ width: `${isoScorePercent}%` }} />
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-3.5 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-400 block">MAS Cyber Hygiene</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-emerald-400">{hygieneCompliantCount}/4</span>
                <span className="text-xs text-slate-400 font-mono">({hygieneScorePercent}%)</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${hygieneScorePercent}%` }} />
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1 bg-slate-950/80 border border-slate-800/90 rounded-2xl p-3.5 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-400 block">Notice 644 Readiness</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-rose-400">&lt; 60m</span>
                <span className="text-[11px] text-slate-400 font-mono">SLA Drill</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1 mt-1.5">
                <CheckCircle2 className="w-3 h-3" /> Template Pre-Staged
              </span>
            </div>
          </div>
        </div>

        {/* Action Hub Navigation Tabs */}
        <div className="flex items-center gap-2 mt-8 pt-6 border-t border-slate-800/80 overflow-x-auto pb-1 scrollbar-thin">
          <button
            onClick={() => setActiveTab('harmonization')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'harmonization'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-1 ring-indigo-400/40'
                : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4 text-indigo-300" />
            <span>Harmonized Action Center ("Test Once")</span>
          </button>

          <button
            onClick={() => setActiveTab('incident644')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'incident644'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 ring-1 ring-rose-400/40'
                : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Clock className="w-4 h-4 text-rose-300" />
            <span>MAS Notice 644: 1-Hour Incident Simulator</span>
            <span className="px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 text-[10px] font-mono border border-rose-800">
              Statutory
            </span>
          </button>

          <button
            onClick={() => setActiveTab('cyberHygiene655')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'cyberHygiene655'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 ring-1 ring-emerald-400/40'
                : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>MAS Notice 655: Cyber Hygiene Engine</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px] font-mono border border-emerald-800">
              4 Mandates
            </span>
          </button>

          <button
            onClick={() => setActiveTab('newISOControls')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'newISOControls'
                ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30 ring-1 ring-sky-400/40'
                : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Layers className="w-4 h-4 text-sky-300" />
            <span>11 New ISO 27001:2022 Controls Deck</span>
            <span className="px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 text-[10px] font-mono border border-sky-800">
              Annex A Focus
            </span>
          </button>

          <button
            onClick={() => setActiveTab('vendorPrivileged')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'vendorPrivileged'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 ring-1 ring-purple-400/40'
                : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <KeyRound className="w-4 h-4 text-purple-300" />
            <span>Privileged Access & Vendor Governance</span>
          </button>

          <button
            onClick={() => setActiveTab('boardGovernance')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'boardGovernance'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30 ring-1 ring-amber-400/40'
                : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Award className="w-4 h-4 text-amber-300" />
            <span>Board Oversight & Risk Appetite Pack</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: HARMONIZED ACTION CENTER ("TEST ONCE, COMPLY WITH BOTH")           */}
      {/* ========================================================================= */}
      {activeTab === 'harmonization' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <ArrowRightLeft className="w-5 h-5 text-indigo-400" />
                  Harmonized Core Overlap Matrix: Test Once, Satisfy Both
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Bridging ISO/IEC 27001:2022 requirements with MAS TRM statutory guidelines and notices. Executing remediation here synchronizes controls and evidence in both registries.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 font-medium">Synergy Index:</span>
                <span className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                  82.4% Direct Evidence Reusability
                </span>
              </div>
            </div>

            {/* Core 5 Overlap Pillars Grid */}
            <div className="mt-6 space-y-4">
              {[
                {
                  id: 'pillar-iam',
                  title: '1. Identity, Access & Privileged Governance',
                  isoRef: 'ISO 27001 A.5.15, A.5.18, A.8.5',
                  masRef: 'MAS TRM Domain 9 & Notice 655 Para 3(b)',
                  gapSummary: 'Shared administrative credentials exist on secondary staging databases; MFA hardware keys not universal on all bastion nodes.',
                  sharedEvidence: ['Privileged Access Management (PAM) Session Logs', 'FIDO2 MFA Enrollment Attestation', 'Quarterly Segregation of Duties Review'],
                  isoCode: 'A.5.15',
                  masDomain: 'Domain 9',
                  synergyPercent: 95
                },
                {
                  id: 'pillar-incident',
                  title: '2. Incident Response & 1-Hour Notification',
                  isoRef: 'ISO 27001 A.5.24, A.5.25, A.5.26, A.5.28',
                  masRef: 'MAS TRM Domain 13 & Notice 644 (Mandatory 1-Hour Notification)',
                  gapSummary: 'Incident Response plan lacked an automated 60-minute statutory regulatory escalation alert for critical payment service outages.',
                  sharedEvidence: ['Unified Incident Response Playbook v3.0', 'Tabletop Drill Debrief with Timestamp Audits', 'MAS Incident Escalation Contacts Registry'],
                  isoCode: 'A.5.24',
                  masDomain: 'Domain 13',
                  synergyPercent: 90
                },
                {
                  id: 'pillar-vuln',
                  title: '3. Vulnerability Management & Patching SLAs',
                  isoRef: 'ISO 27001 A.8.8 (Management of Tech Vulns), A.8.19',
                  masRef: 'MAS TRM Domain 10 & Notice 655 Para 3(c) (14d/30d SLAs)',
                  gapSummary: 'Patching cadence was quarterly rather than enforced against the statutory 14-day SLA for critical CVEs.',
                  sharedEvidence: ['Automated Vulnerability Scanner Pipeline', 'Patch SLA Aging Report', 'Penetration Testing Remediations Log'],
                  isoCode: 'A.8.8',
                  masDomain: 'Domain 10',
                  synergyPercent: 88
                },
                {
                  id: 'pillar-tpr',
                  title: '4. Third-Party & Cloud Vendor Risk Governance',
                  isoRef: 'ISO 27001 A.5.19, A.5.20, A.5.21, A.5.22, A.5.23',
                  masRef: 'MAS TRM Domain 5 & MAS Guidelines on Outsourcing',
                  gapSummary: 'Contractual "Right to Audit" clauses missing in 2 SaaS provider contracts; annual disaster recovery verification missing.',
                  sharedEvidence: ['Vendor Right-to-Audit Contractual Addenda', 'Tier-1 SaaS SOC 2 Type II / ISO Cert Registry', 'Cloud Exit Strategy Runbooks'],
                  isoCode: 'A.5.19',
                  masDomain: 'Domain 5',
                  synergyPercent: 85
                },
                {
                  id: 'pillar-software',
                  title: '5. Secure Software Development (SDLC) & Coding',
                  isoRef: 'ISO 27001 A.8.25, A.8.28 (Secure Coding), A.8.31',
                  masRef: 'MAS TRM Domain 8 (Software Application Development)',
                  gapSummary: 'Pre-commit SAST scans lacked automated blocking gates on high-severity dependency CVEs.',
                  sharedEvidence: ['CI/CD Branch Protection Rules', 'SAST/DAST Static Analysis Audit Trail', 'Software Bill of Materials (SBOM)'],
                  isoCode: 'A.8.28',
                  masDomain: 'Domain 8',
                  synergyPercent: 92
                }
              ].map(pillar => (
                <div key={pillar.id} className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-white text-sm">{pillar.title}</h3>
                        <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-300 text-[10px] font-mono border border-sky-800">
                          {pillar.isoRef}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 text-[10px] font-mono border border-rose-800">
                          {pillar.masRef}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 text-[10px] font-semibold border border-emerald-800">
                          {pillar.synergyPercent}% Synergy
                        </span>
                      </div>

                      <p className="text-xs text-amber-300/90 flex items-center gap-1.5 font-medium">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>Identified Gap: {pillar.gapSummary}</span>
                      </p>

                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[11px] text-slate-400 font-semibold">Shared Evidence:</span>
                        {pillar.sharedEvidence.map((ev, i) => (
                          <span key={i} className="text-[11px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-800">
                            {ev}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleExecuteHarmonizedRemediation(pillar.title, pillar.isoCode, pillar.masDomain)}
                        className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                      >
                        <Zap className="w-3.5 h-3.5 text-indigo-200" />
                        Remediate for Both
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MAS NOTICE 644: 1-HOUR INCIDENT NOTIFICATION SIMULATOR & PLAYBOOK  */}
      {/* ========================================================================= */}
      {activeTab === 'incident644' && (
        <div className="space-y-6">
          {/* Statutory Mandate Callout */}
          <div className="bg-rose-950/40 border border-rose-800/80 rounded-2xl p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-rose-600/20 text-rose-400 rounded-xl border border-rose-500/30 shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-600 text-white uppercase tracking-wider">
                    Statutory Obligation
                  </span>
                  <span className="text-xs font-mono text-rose-300">
                    MAS Notice 644 / MAS TRM Guidelines Section 13
                  </span>
                </div>
                <h2 className="text-base font-bold text-white">
                  Mandatory 1-Hour Incident Notification Rule for Critical Systems
                </h2>
                <p className="text-xs text-rose-200/90 leading-relaxed">
                  Financial institutions and regulated capital markets entities must notify MAS <strong>within 1 hour</strong> upon discovering a critical system malfunction, outage, or severe cyber attack. 
                  Following the initial 1-hour notice, a comprehensive <strong>Root Cause Investigation (RCI)</strong> report must be submitted within <strong>14 calendar days</strong>.
                </p>
              </div>

              {/* Live Drill Runner Button */}
              <div className="shrink-0">
                {!drillActive ? (
                  <button
                    onClick={() => {
                      setDrillActive(true);
                      setDrillSecondsElapsed(0);
                      showToast({
                        title: '1-Hour Drill Started!',
                        message: 'Statutory countdown clock running. Formulate and review initial notice.',
                        type: 'warning'
                      });
                    }}
                    className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
                  >
                    <Play className="w-4 h-4" />
                    Launch 1-Hour Drill
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-2 rounded-xl bg-rose-950 border border-rose-700 text-rose-200 font-mono font-bold text-sm animate-pulse">
                      ⏱ {formatDrillTime(drillSecondsElapsed)} / 60:00
                    </div>
                    <button
                      onClick={() => {
                        setDrillActive(false);
                        showToast({
                          title: 'Drill Completed',
                          message: `Completed within ${formatDrillTime(drillSecondsElapsed)}. Notification prepared within regulatory window!`,
                          type: 'success'
                        });
                      }}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 cursor-pointer"
                    >
                      Stop Drill
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Interactive Notice 644 Incident Generator */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center justify-between">
                <span>MAS Statutory Initial Notification Form (Notice 644)</span>
                <span className="text-[11px] font-normal text-slate-400">Section 13.1.2 Compliance</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Incident Scenario Template</label>
                  <select
                    value={selectedIncidentScenario}
                    onChange={(e) => setSelectedIncidentScenario(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  >
                    <option value="PAYMENT_API_RANSOMWARE">Critical Payment Gateway API Outage / Ransomware</option>
                    <option value="CUSTOMER_PII_EXFIL">Core Banking DB Customer Credential Exfiltration</option>
                    <option value="CLOUD_INFRA_FAILOVER">Primary AWS Singapore Region Network Blackhole</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Severity Classification</label>
                  <input
                    type="text"
                    value={incidentDetails.severity}
                    onChange={(e) => setIncidentDetails({ ...incidentDetails, severity: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Affected System (Critical System?)</label>
                  <input
                    type="text"
                    value={incidentDetails.systemAffected}
                    onChange={(e) => setIncidentDetails({ ...incidentDetails, systemAffected: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Discovery Timestamp (UTC+8 SGT)</label>
                  <input
                    type="datetime-local"
                    value={incidentDetails.discoveryTime}
                    onChange={(e) => setIncidentDetails({ ...incidentDetails, discoveryTime: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1 font-semibold">Impact Assessment & Customer Exposure</label>
                  <input
                    type="text"
                    value={incidentDetails.estimatedCustomersAffected}
                    onChange={(e) => setIncidentDetails({ ...incidentDetails, estimatedCustomersAffected: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1 font-semibold">Incident Summary & Initial Root Cause Symptoms</label>
                  <textarea
                    rows={2}
                    value={incidentDetails.impactSummary}
                    onChange={(e) => setIncidentDetails({ ...incidentDetails, impactSummary: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1 font-semibold">Containment Actions Taken (First 30 Mins)</label>
                  <textarea
                    rows={2}
                    value={incidentDetails.containmentAction}
                    onChange={(e) => setIncidentDetails({ ...incidentDetails, containmentAction: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <span className="text-xs text-slate-400">
                  MAS Designated Recipient: <strong>it_risk@mas.gov.sg</strong>
                </span>
                <button
                  onClick={() => {
                    setNoticeGenerated(true);
                    showToast({
                      title: 'MAS Notice 644 Draft Ready',
                      message: 'Formal statutory notification text formatted. Copy or dispatch to regulatory liaison.',
                      type: 'success'
                    });
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <FileText className="w-4 h-4" />
                  Generate Statutory Notice 644 Memo
                </button>
              </div>
            </div>

            {/* Generated Statutory Memo Preview & 14-Day RCI Tracker */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-rose-400" />
                    Statutory Memo Preview (Notice 644 Format)
                  </h4>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `URGENT STATUTORY NOTIFICATION UNDER MAS NOTICE 644\nTo: it_risk@mas.gov.sg\nEntity: Apex Global Technologies Pte Ltd\nSystem: ${incidentDetails.systemAffected}\nSeverity: ${incidentDetails.severity}\nDiscovery Time: ${incidentDetails.discoveryTime}\nImpact: ${incidentDetails.impactSummary}\nContainment: ${incidentDetails.containmentAction}\nSign-off: ${incidentDetails.cisoSignOff}`
                      );
                      showToast({ title: 'Copied to Clipboard', message: 'MAS Notice 644 memo copied.', type: 'info' });
                    }}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    Copy
                  </button>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800/90 font-mono text-[11px] text-slate-300 space-y-2 leading-relaxed max-h-56 overflow-y-auto">
                  <p className="text-rose-400 font-bold">FORMAL NOTIFICATION UNDER MAS NOTICE 644 (PARA 3)</p>
                  <p><strong>TO:</strong> Monetary Authority of Singapore (Technology Risk Department)</p>
                  <p><strong>FROM:</strong> {incidentDetails.cisoSignOff}</p>
                  <p><strong>SYSTEM AFFECTED:</strong> {incidentDetails.systemAffected}</p>
                  <p><strong>DISCOVERY TIME:</strong> {incidentDetails.discoveryTime} (SGT)</p>
                  <p><strong>IMPACT:</strong> {incidentDetails.impactSummary}</p>
                  <p><strong>CONTAINMENT:</strong> {incidentDetails.containmentAction}</p>
                  <p className="text-emerald-400">STATUS: INITIAL NOTIFICATION DISPATCHED WITHIN 60-MINUTE REGULATORY WINDOW.</p>
                </div>
              </div>

              {/* 14-Day Root Cause Investigation (RCI) Milestone Tracker */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
                <h4 className="font-bold text-white text-xs flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-sky-400" />
                    14-Day Root Cause Investigation (RCI) Milestones
                  </span>
                  <span className="text-[10px] text-sky-300 font-mono">MAS Notice 644 Para 4</span>
                </h4>

                <div className="space-y-2 text-xs">
                  {[
                    { key: 'step1', day: 'Day 1', label: 'Initial 1-Hour Notification Ack & Forensic Freeze' },
                    { key: 'step2', day: 'Day 3', label: 'Interim Daily Update to MAS Liaison Officer' },
                    { key: 'step3', day: 'Day 7', label: 'Third-Party Forensic Log Extraction & Analysis' },
                    { key: 'step4', day: 'Day 10', label: 'Management Review & Preventive CAPA Formulation' },
                    { key: 'step5', day: 'Day 14', label: 'Final Formal RCI Report Submission to MAS' }
                  ].map(step => (
                    <label
                      key={step.key}
                      onClick={() => setRciChecklist({ ...rciChecklist, [step.key]: !rciChecklist[step.key] })}
                      className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-950/60 border border-slate-800 hover:bg-slate-950 cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={rciChecklist[step.key]}
                        onChange={() => {}}
                        className="rounded border-slate-700 text-rose-600 focus:ring-rose-500 w-3.5 h-3.5"
                      />
                      <span className="font-mono text-[10px] text-slate-400">{step.day}:</span>
                      <span className={`text-xs ${rciChecklist[step.key] ? 'text-white line-through opacity-80' : 'text-slate-300'}`}>
                        {step.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MAS NOTICE 655 MANDATORY CYBER HYGIENE VERIFICATION ENGINE         */}
      {/* ========================================================================= */}
      {activeTab === 'cyberHygiene655' && (
        <div className="space-y-6">
          <div className="bg-emerald-950/30 border border-emerald-800/80 rounded-2xl p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-600 text-white uppercase tracking-wider">
                    Statutory Cyber Hygiene
                  </span>
                  <span className="text-xs font-mono text-emerald-300">MAS Notice 655 (Legally Binding for all FIs)</span>
                </div>
                <h2 className="text-lg font-bold text-white">
                  Mandatory Four Baseline Security Requirements Engine
                </h2>
                <p className="text-xs text-emerald-200/90 leading-relaxed max-w-3xl">
                  Non-compliance with MAS Notice 655 constitutes an offence under the Monetary Authority of Singapore Act. 
                  Below are the 4 mandated controls with live audit status and SLA adherence tracking.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    showToast({
                      title: 'Notice 655 Audit Report Exported',
                      message: 'Exported formal cyber hygiene compliance certification package.',
                      type: 'success'
                    });
                  }}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Export Notice 655 Audit Pack
                </button>
              </div>
            </div>
          </div>

          {/* 4 Cyber Hygiene Mandates Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hygieneControls.map(ctrl => (
              <div key={ctrl.id} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3.5 hover:border-slate-700 transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-mono text-emerald-400 font-semibold block">{ctrl.mandateRef}</span>
                    <h3 className="font-bold text-white text-sm mt-0.5">{ctrl.title}</h3>
                    <span className="text-[10px] text-sky-400 font-mono">Cross-Mapped: {ctrl.isoMapping}</span>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold shrink-0 ${
                      ctrl.status === 'Compliant'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : ctrl.status === 'In Progress'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {ctrl.status}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {ctrl.description}
                </p>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">Current Measured SLA:</span>
                    <span className="font-mono font-bold text-emerald-400">{ctrl.slaScore}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">Last External Penetration Audit:</span>
                    <span className="text-slate-300 font-mono">{ctrl.lastAudited}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] pt-1 border-t border-slate-900">
                    <span className="text-slate-400">Required Remediation:</span>
                    <span className="text-amber-300 font-medium">{ctrl.actionNeeded}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-slate-400">Status Override:</span>
                  <div className="flex items-center gap-1.5">
                    {(['Compliant', 'In Progress', 'Action Required'] as const).map(st => (
                      <button
                        key={st}
                        onClick={() => {
                          setHygieneControls(prev => prev.map(c => c.id === ctrl.id ? { ...c, status: st } : c));
                          showToast({ title: 'Notice 655 Status Updated', message: `${ctrl.title} set to ${st}.`, type: 'info' });
                        }}
                        className={`px-2 py-1 rounded text-[10px] font-semibold cursor-pointer transition-colors ${
                          ctrl.status === st
                            ? 'bg-slate-700 text-white'
                            : 'bg-slate-950 text-slate-400 hover:text-white'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: 11 NEW ISO 27001:2022 CONTROLS DECK                               */}
      {/* ========================================================================= */}
      {activeTab === 'newISOControls' && (
        <div className="space-y-6">
          <div className="bg-sky-950/30 border border-sky-800/80 rounded-2xl p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-sky-600 text-white uppercase tracking-wider">
                    ISO/IEC 27001:2022 Upgrade
                  </span>
                  <span className="text-xs font-mono text-sky-300">11 Newly Introduced Annex A Controls</span>
                </div>
                <h2 className="text-lg font-bold text-white mt-1">
                  Mastery Deck for the 11 New Controls in ISO 27001:2022
                </h2>
                <p className="text-xs text-sky-200/90 leading-relaxed max-w-3xl">
                  Auditors focusing on ISO 27001:2022 transitions specifically examine these 11 controls. Review purpose, lead auditor expectations, required evidence artifacts, and current implementation states.
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                {(['ALL', 'Implemented', 'In Progress', 'Action Required'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setIsoControlFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                      isoControlFilter === f
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 11 Controls Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {NEW_ISO_2022_CONTROLS.filter(c => {
              if (isoControlFilter !== 'ALL' && isoControlStates[c.code] !== isoControlFilter) return false;
              if (isoSearch.trim()) {
                const q = isoSearch.toLowerCase();
                return c.code.toLowerCase().includes(q) || c.title.toLowerCase().includes(q) || c.purpose.toLowerCase().includes(q);
              }
              return true;
            }).map(ctrl => {
              const currentStatus = isoControlStates[ctrl.code];
              return (
                <div
                  key={ctrl.code}
                  className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3.5 flex flex-col justify-between hover:border-slate-700 transition-all shadow-sm"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                          {ctrl.code}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-2 font-medium">{ctrl.theme}</span>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          currentStatus === 'Implemented'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : currentStatus === 'In Progress'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {currentStatus}
                      </span>
                    </div>

                    <h3 className="font-bold text-white text-sm">{ctrl.title}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">{ctrl.purpose}</p>

                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1.5 text-xs">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                        Lead Auditor Expectation:
                      </span>
                      <p className="text-slate-300 text-[11px] leading-relaxed italic">"{ctrl.auditorExpectation}"</p>
                    </div>

                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                        Mandatory Audit Evidence:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {ctrl.mandatoryEvidence.map((ev, i) => (
                          <span key={i} className="text-[10px] bg-slate-950 text-slate-300 px-2 py-0.5 rounded border border-slate-800">
                            {ev}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Status Toggle Bar */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">Set Status:</span>
                    <div className="flex items-center gap-1">
                      {(['Implemented', 'In Progress', 'Action Required'] as const).map(st => (
                        <button
                          key={st}
                          onClick={() => handleUpdateISOStatus(ctrl.code, st)}
                          className={`px-2 py-1 rounded text-[10px] font-semibold cursor-pointer transition-colors ${
                            currentStatus === st
                              ? 'bg-sky-600 text-white'
                              : 'bg-slate-950 text-slate-400 hover:text-white'
                          }`}
                        >
                          {st.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: PRIVILEGED ACCESS & VENDOR RISK GOVERNANCE                          */}
      {/* ========================================================================= */}
      {activeTab === 'vendorPrivileged' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Privileged Access Governance */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2.5 bg-purple-500/20 text-purple-400 rounded-xl">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">Zero Shared Accounts & Just-in-Time (JIT) Access</h3>
                    <p className="text-xs text-slate-400">MAS TRM Domain 9.1 & ISO 27001 A.5.15</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                  Compliant
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                MAS strictly prohibits generic or shared administrative logins (such as shared <code>root</code> or <code>administrator</code> accounts) without individual non-repudiation.
              </p>

              <div className="space-y-2.5">
                {[
                  { check: 'Zero Shared Root/Admin Logins', status: 'Passed', detail: 'All engineers log in via individual SSO + hardware key; sudo commands recorded in immutable audit log.' },
                  { check: 'Just-in-Time (JIT) Temporary Privilege Escalation', status: 'Passed', detail: 'Production database access automatically expires after 60 minutes with peer approval.' },
                  { check: 'Dual-Authorization for Critical Financial Logic', status: 'Passed', detail: 'Maker-Checker approval required on all payment ledger database modifications.' },
                  { check: 'Quarterly Segregation of Duties (SoD) Review', status: 'Passed', detail: 'Last completed 2026-08-15. Zero developer permissions to direct prod deploy.' }
                ].map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start justify-between gap-3 text-xs">
                    <div className="space-y-0.5">
                      <span className="font-bold text-white">{item.check}</span>
                      <p className="text-[11px] text-slate-400">{item.detail}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-800">
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Vendor Risk & Right to Audit */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2.5 bg-sky-500/20 text-sky-400 rounded-xl">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">Third-Party & Vendor "Right to Audit" Governance</h3>
                    <p className="text-xs text-slate-400">MAS TRM Domain 5 & ISO 27001 A.5.19-A.5.23</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                  1 Gap Detected
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Regulators require all outsourcing contracts to explicitly grant the financial institution and supervisory authorities (MAS / ISO Lead Auditors) the legal right to inspect vendor operations.
              </p>

              <div className="space-y-2.5">
                {[
                  { vendor: 'Amazon Web Services (AWS Singapore)', tier: 'Tier-1 Critical Cloud', rightToAudit: 'Present (AWS Financial Services Addendum)', soc2Status: 'SOC 2 Type II Valid' },
                  { vendor: 'Stripe Payments Singapore', tier: 'Tier-1 Payment Switch', rightToAudit: 'Present (Regulated MAS Major Payment Inst.)', soc2Status: 'PCI DSS v4.0 Level 1' },
                  { vendor: 'Datadog Telemetry Cloud', tier: 'Tier-2 Monitoring', rightToAudit: 'Present (Standard Master Service Agreement)', soc2Status: 'SOC 2 Type II Valid' },
                  { vendor: 'Legacy Customer Ticketing SaaS', tier: 'Tier-3 Operational Support', rightToAudit: 'MISSING (Action Needed: Sign MAS Addendum)', soc2Status: 'SOC 2 Expiring in 30d' }
                ].map((v, i) => (
                  <div key={i} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start justify-between gap-3 text-xs">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{v.vendor}</span>
                        <span className="text-[10px] text-slate-400">({v.tier})</span>
                      </div>
                      <p className={`text-[11px] ${v.rightToAudit.includes('MISSING') ? 'text-rose-400 font-bold' : 'text-slate-400'}`}>
                        Right to Audit: {v.rightToAudit}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 font-mono text-[10px] border border-slate-800">
                      {v.soc2Status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: BOARD OVERSIGHT & RISK APPETITE PACK                                */}
      {/* ========================================================================= */}
      {activeTab === 'boardGovernance' && (
        <div className="space-y-6">
          <div className="bg-amber-950/30 border border-amber-800/80 rounded-2xl p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-600 text-white uppercase tracking-wider">
                    Executive Governance
                  </span>
                  <span className="text-xs font-mono text-amber-300">MAS TRM Domain 2 & ISO 27001 Clause 5 / 9.3</span>
                </div>
                <h2 className="text-lg font-bold text-white mt-1">
                  Board of Directors & Senior Management Oversight Pack
                </h2>
                <p className="text-xs text-amber-200/90 leading-relaxed max-w-3xl">
                  Under MAS TRM, ultimate responsibility for technology risk rests with the Board and CEO. Review the technology risk appetite statement, cyber insurance coverage, and generate the formal Board Minutes package.
                </p>
              </div>

              <button
                onClick={() => {
                  showToast({
                    title: 'Board Minutes Pack Generated',
                    message: 'Exported formal Executive Governance Pack with CISO and CEO sign-off blocks.',
                    type: 'success'
                  });
                }}
                className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer shrink-0"
              >
                <Download className="w-4 h-4" />
                Export Board & CISO Minutes
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-2">
              <span className="text-slate-400 font-semibold text-xs">Technology Risk Appetite Threshold</span>
              <h4 className="text-white font-bold text-sm">Critical Outage Tolerance: Zero Unplanned Outages &gt; 4h</h4>
              <p className="text-slate-300 text-xs leading-relaxed">
                Annual aggregate downtime for critical customer-facing banking and payment switches must remain under 4 hours per rolling 12 months (MAS Notice 644 availability SLA).
              </p>
              <span className="inline-block mt-2 px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-800">
                Current: 99.98% Uptime
              </span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-2">
              <span className="text-slate-400 font-semibold text-xs">Cyber Insurance Coverage</span>
              <h4 className="text-white font-bold text-sm">$25,000,000 Comprehensive Cyber Liability</h4>
              <p className="text-slate-300 text-xs leading-relaxed">
                Underwritten by Tier-1 Lloyd's syndicate covering ransomware extortion, business interruption, forensic investigation, and regulatory penalty defense.
              </p>
              <span className="inline-block mt-2 px-2 py-0.5 rounded bg-sky-950 text-sky-400 font-mono text-[10px] font-bold border border-sky-800">
                Policy Active through 2027
              </span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-2">
              <span className="text-slate-400 font-semibold text-xs">Independent Third-Party Penetration Test</span>
              <h4 className="text-white font-bold text-sm">CREST-Accredited Red Team Drill (Annual)</h4>
              <p className="text-slate-300 text-xs leading-relaxed">
                Full-scope external black-box and internal assumed-breach penetration test conducted every 12 months. All high findings remediated within 14 days.
              </p>
              <span className="inline-block mt-2 px-2 py-0.5 rounded bg-purple-950 text-purple-400 font-mono text-[10px] font-bold border border-purple-800">
                Next Scheduled: 2026-11-15
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
