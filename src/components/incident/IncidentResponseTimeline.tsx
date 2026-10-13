import React, { useState, useMemo } from 'react';
import { useGRC } from '../../context/GRCContext';
import { UnifiedRemediationItem } from '../../types/remediation';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Download,
  Copy,
  Check,
  FileCheck2,
  Lock,
  Layers,
  Terminal,
  Activity,
  Flame,
  Globe,
  Award,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Printer,
  Sparkles,
  Search,
  Filter,
  RefreshCw,
  Scale
} from 'lucide-react';
import { useToast } from '../common/ToastContainer';

export interface IncidentTimelineEvent {
  id: string;
  stageNumber: number;
  stageName: 'DETECTION' | 'TRIAGE' | 'CONTAINMENT' | 'TAKEDOWN' | 'VERIFICATION' | 'AUDIT_SIGNOFF';
  stageTitle: string;
  systemOrigin: 'BrandGuard' | 'RemediationDesk' | 'SecOps' | 'AuditorDesk';
  timestamp: string;
  relativeTime: string;
  actorName: string;
  actorRole: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING';
  headline: string;
  narrative: string;
  technicalTelemetry: {
    label: string;
    value: string;
    badge?: string;
  }[];
  evidenceArtifact?: {
    artifactCode: string;
    title: string;
    sha256Hash: string;
    category: string;
    vaultReference: string;
  };
  complianceControls: string[];
}

export interface IncidentLifecycleCase {
  id: string;
  remediationCode: string;
  brandFindingCode: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  status: 'CLOSED_VERIFIED' | 'REMEDIATION_IN_PROGRESS' | 'AUDIT_VERIFICATION_PENDING';
  targetResource: string;
  detectionTime: string;
  resolutionTime?: string;
  totalDurationHours: number;
  slaLimitHours: number;
  slaStatus: 'COMPLIANT' | 'BREACHED' | 'AT_RISK';
  summary: string;
  chainOfCustodyHash: string;
  auditorSignOff?: {
    auditorName: string;
    auditorRole: string;
    organization: string;
    timestamp: string;
    signatureEd25519: string;
    closureConclusion: string;
  };
  events: IncidentTimelineEvent[];
}

export interface IncidentResponseTimelineProps {
  remediationItem?: UnifiedRemediationItem | null;
  onClose?: () => void;
  onOpenRemediation?: (id: string) => void;
  isStandalone?: boolean;
}

// Built-in audit-grade incident lifecycle cases bridging BrandGuard to RemediationDesk
const SEED_INCIDENT_CASES: IncidentLifecycleCase[] = [
  {
    id: 'case_bg_001',
    remediationCode: 'REM-BG-2026-004',
    brandFindingCode: 'BF-2026-001',
    title: 'Phishing Brand Impersonation & Cloned SSO Harvester: apex-portal-auth.com',
    severity: 'CRITICAL',
    status: 'CLOSED_VERIFIED',
    targetResource: 'https://apex-portal-auth.com/login/sso',
    detectionTime: '2026-09-12T04:15:00Z',
    resolutionTime: '2026-09-12T20:25:00Z',
    totalDurationHours: 16.2,
    slaLimitHours: 24.0,
    slaStatus: 'COMPLIANT',
    summary: 'Rogue phishing infrastructure mimicking Apex corporate single sign-on portal detected via Certificate Transparency stream, contained via egress proxy sinkhole, mitigated via registrar suspension, and formally verified by Lead Auditor.',
    chainOfCustodyHash: 'SHA256:7e91f0a28b4c5381d6830182ec09138407fb932a9c1e7a536290e2b4f51e9021',
    auditorSignOff: {
      auditorName: 'Dr. Aris Thorne',
      auditorRole: 'Lead Security Assurance Auditor (ISO/IEC 27001 & MAS TRM)',
      organization: 'Skanda Global Assurance & Risk Registry',
      timestamp: '2026-09-12T20:25:00Z',
      signatureEd25519: 'ED25519:9f408e019b88301824a9b91e5d71c1b3f9408e019b88301829e71c1b3f9408e0',
      closureConclusion: 'Satisfactory & Immutable - Offending domain sinkholed, DNS records purged, zero employee credential compromise confirmed via SIEM correlation.'
    },
    events: [
      {
        id: 'evt_1',
        stageNumber: 1,
        stageName: 'DETECTION',
        stageTitle: '1. Autonomous Threat Detection & CT Log Discovery',
        systemOrigin: 'BrandGuard',
        timestamp: '2026-09-12T04:15:00Z',
        relativeTime: 'T+00:00 (Incident Trigger)',
        actorName: 'BrandGuard CT Stream Daemon',
        actorRole: 'Automated Discovery Agent',
        status: 'COMPLETED',
        headline: 'Rogue SSL Certificate Issued & Cloned Site Detected',
        narrative: 'BrandGuard Certificate Transparency log crawler identified pre-issuance certificate for apex-portal-auth.com by Let\'s Encrypt. Automated headless browser fetched DOM, discovering 96.4% perceptual hash match against official corporate shield logo.',
        technicalTelemetry: [
          { label: 'Domain', value: 'apex-portal-auth.com', badge: 'Punycode/Combosquat' },
          { label: 'Registrar', value: 'NameCheap, Inc. (Privacy Shield)' },
          { label: 'pHash Similarity', value: '96.4% (Vision AI SSIM)', badge: 'Critical Match' },
          { label: 'Risk Score', value: '94/100 (CVSS 9.1)' }
        ],
        evidenceArtifact: {
          artifactCode: 'EVD-BG-HARVESTER-001',
          title: 'Perceptual Hash & DOM Scrape Comparison Dossier',
          sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          category: 'Visual & DOM Forensics',
          vaultReference: 'vault://evidence/2026/09/bf_001_dom_hash.tar.gz'
        },
        complianceControls: ['ISO 27001:2022 A.8.1', 'MAS TRM 12.3', 'SOC 2 CC7.4']
      },
      {
        id: 'evt_2',
        stageNumber: 2,
        stageName: 'TRIAGE',
        stageTitle: '2. SecOps Triage & Remediation Escalation',
        systemOrigin: 'BrandGuard',
        timestamp: '2026-09-12T04:22:15Z',
        relativeTime: 'T+07m 15s',
        actorName: 'Automated Correlation Engine',
        actorRole: 'Security Automation Engine',
        status: 'COMPLETED',
        headline: 'Correlated Threat Dispatched to RemediationDesk',
        narrative: 'Cross-correlated active mail relay (MX) presence with active credential phishing pattern. Automatically minted unified remediation ticket REM-BG-2026-004 in RemediationDesk with 24-hour Critical SLA deadline.',
        technicalTelemetry: [
          { label: 'Remediation Code', value: 'REM-BG-2026-004', badge: 'Auto-Generated' },
          { label: 'Priority SLA', value: '24 Hours (Critical Tier)' },
          { label: 'Assigned Lead', value: 'Sarah Jenkins (Cyber SecOps)' },
          { label: 'Email Threat', value: 'MX points to offshore open relay' }
        ],
        evidenceArtifact: {
          artifactCode: 'EVD-TRIAGE-BG-002',
          title: 'DNS Zone & Mail Relay Diagnostics Capture',
          sha256Hash: '9a5c43a0b4e2f891b2c45e67890123456789abcdef0123456789abcdef012345',
          category: 'DNS Telemetry',
          vaultReference: 'vault://evidence/2026/09/dns_zone_bg_001.json'
        },
        complianceControls: ['ISO 27001:2022 A.5.25', 'MAS TRM 13.1']
      },
      {
        id: 'evt_3',
        stageNumber: 3,
        stageName: 'CONTAINMENT',
        stageTitle: '3. Compensating Control Enforcement & Perimeter Block',
        systemOrigin: 'RemediationDesk',
        timestamp: '2026-09-12T05:30:00Z',
        relativeTime: 'T+01h 15m',
        actorName: 'Sarah Jenkins',
        actorRole: 'Cyber Threat Lead & SecOps',
        status: 'COMPLETED',
        headline: 'Corporate Firewall Sinkhole & Global Threat Intel Feed Push',
        narrative: 'Enacted immediate compensating control via Palo Alto & Zscaler corporate egress proxies, sinking all internal corporate traffic to the malicious domain. Dispatched automated IOC telemetry into Google Safe Browsing and Microsoft Defender SmartScreen.',
        technicalTelemetry: [
          { label: 'Compensating Control', value: 'CMP-CTRL-A823-01', badge: '100% Effective' },
          { label: 'Sinkhole Status', value: 'Enforced via Egress Gateway' },
          { label: 'Google Safe Browsing', value: 'API Submitted (Receipt #GSB-9024)' },
          { label: 'Internal Exposure', value: '0 Compromised Accounts' }
        ],
        evidenceArtifact: {
          artifactCode: 'EVD-PROXY-SINKHOLE-003',
          title: 'Zscaler Egress Policy & Palo Alto Sinkhole Rule Log',
          sha256Hash: '4f26b88b71d9e2b10a9c8f74e63b218408f619b88301824a9b91e5d71c1b3f94',
          category: 'Firewall Policy Rule',
          vaultReference: 'vault://evidence/2026/09/firewall_rule_sinkhole_004.pdf'
        },
        complianceControls: ['ISO 27001:2022 A.8.23', 'MAS TRM 12.3.2']
      },
      {
        id: 'evt_4',
        stageNumber: 4,
        stageName: 'TAKEDOWN',
        stageTitle: '4. Legal WIPO Notice & Upstream Registrar Suspension',
        systemOrigin: 'BrandGuard',
        timestamp: '2026-09-12T08:45:00Z',
        relativeTime: 'T+04h 30m',
        actorName: 'Legal & Intellectual Property Counsel',
        actorRole: 'Corporate Legal Takedown Desk',
        status: 'COMPLETED',
        headline: 'WIPO UDRP Abuse Brief Submitted; NameCheap Suspends Domain',
        narrative: 'Dispatched automated cryptographically sealed WIPO UDRP/URS dispute dossier directly to NameCheap Abuse Operations. Registrar validated trademark infringement evidence and placed apex-portal-auth.com on clientHold and serverHold status.',
        technicalTelemetry: [
          { label: 'Abuse Ticket', value: 'NC-ABUSE-2026-89412', badge: 'Registrar Confirmed' },
          { label: 'DNS Status', value: 'serverHold / clientHold', badge: 'Revoked' },
          { label: 'Upstream CDN', value: 'Cloudflare Takedown Notice Served' },
          { label: 'MTTR to Suspension', value: '4.5 Hours' }
        ],
        evidenceArtifact: {
          artifactCode: 'EVD-WIPO-TAKEDOWN-004',
          title: 'Signed WIPO Trademark Dispute Filing & Registrar Receipt',
          sha256Hash: 'b5a2f7c9e01348a6d71b9c24e83f01948271a9b88301824a9b91e5d71c1b3f94',
          category: 'Legal Affidavits',
          vaultReference: 'vault://evidence/2026/09/wipo_udrp_filing_signed.pdf'
        },
        complianceControls: ['ISO 27001:2022 A.5.28', 'SOC 2 CC7.5']
      },
      {
        id: 'evt_5',
        stageNumber: 5,
        stageName: 'VERIFICATION',
        stageTitle: '5. Remediation Retesting & Verification Daemon',
        systemOrigin: 'RemediationDesk',
        timestamp: '2026-09-12T16:00:00Z',
        relativeTime: 'T+11h 45m',
        actorName: 'Continuous Retesting Daemon',
        actorRole: 'Automated Compliance Engine',
        status: 'COMPLETED',
        headline: 'Global DNS Propagation Sweep Confirmed NXDOMAIN',
        narrative: 'Synthetic multi-region probes across 16 global edge nodes executed DNS queries and HTTP assertions. Confirmed complete domain blackout with NXDOMAIN resolution and zero active listening ports. Residual threat score recalculated to 0.',
        technicalTelemetry: [
          { label: 'Probes Queried', value: '16 Regional DNS Resolvers', badge: '100% NXDOMAIN' },
          { label: 'Residual Risk', value: '0/100 (Completely Remediated)' },
          { label: 'Retest Result', value: 'PASS - Zero Residual Threat', badge: 'Verified' },
          { label: 'SIEM Sweep', value: 'Zero outbound telemetry hits' }
        ],
        evidenceArtifact: {
          artifactCode: 'EVD-RETEST-PROBE-005',
          title: 'Global DNS Multi-Region Resolution Matrix Log',
          sha256Hash: '1c49b934ca495991b7852b855e3b0c44298fc1c149afbf4c8996fb92427ae41e',
          category: 'Automated Telemetry',
          vaultReference: 'vault://evidence/2026/09/dns_retest_multi_edge.json'
        },
        complianceControls: ['ISO 27001:2022 A.8.8', 'MAS TRM 12.3']
      },
      {
        id: 'evt_6',
        stageNumber: 6,
        stageName: 'AUDIT_SIGNOFF',
        stageTitle: '6. Lead Auditor Sign-Off & Immutable Vault Seal',
        systemOrigin: 'AuditorDesk',
        timestamp: '2026-09-12T20:25:00Z',
        relativeTime: 'T+16h 10m (Closed & Sealed)',
        actorName: 'Dr. Aris Thorne',
        actorRole: 'ISO Lead Auditor & Assurance Director',
        status: 'COMPLETED',
        headline: 'Tamper-Evident Sign-Off Seal & Regulatory Filing Dossier',
        narrative: 'Lead Auditor conducted formal review of the BrandGuard detection telemetry, compensating control efficacy, registrar takedown affidavits, and retest evidence. Formally authorized closure of ticket REM-BG-2026-004 with cryptographic Ed25519 digital signature.',
        technicalTelemetry: [
          { label: 'Closure Status', value: 'CLOSED_VERIFIED', badge: 'Audit-Ready' },
          { label: 'Signature Algorithm', value: 'Ed25519 (256-bit Edwards Curve)' },
          { label: 'Audit Pack Ref', value: 'EVD-VAULT-2026-9042', badge: 'Immutable' },
          { label: 'Total MTTR', value: '16.2 Hours (Within 24h SLA)' }
        ],
        evidenceArtifact: {
          artifactCode: 'EVD-AUDIT-CERT-006',
          title: 'Cryptographic Lead Auditor Sign-Off Dossier & Certificate',
          sha256Hash: '7e91f0a28b4c5381d6830182ec09138407fb932a9c1e7a536290e2b4f51e9021',
          category: 'Formal Audit Certification',
          vaultReference: 'vault://evidence/2026/09/signed_incident_signoff_rem_004.pdf'
        },
        complianceControls: ['ISO 27001:2022 Clause 9.2', 'Clause 10.2', 'MAS TRM 13.2']
      }
    ]
  },
  {
    id: 'case_bg_002',
    remediationCode: 'REM-BG-2026-002',
    brandFindingCode: 'BF-2026-002',
    title: 'Fraudulent Crypto Investment Portal Exploiting Brandmark: apex-investments.xyz',
    severity: 'HIGH',
    status: 'AUDIT_VERIFICATION_PENDING',
    targetResource: 'https://apex-investments.xyz/vip-login',
    detectionTime: '2026-09-14T02:00:00Z',
    resolutionTime: undefined,
    totalDurationHours: 9.5,
    slaLimitHours: 48.0,
    slaStatus: 'COMPLIANT',
    summary: 'Typosquatting cryptocurrency investment platform utilizing unauthorized brand logo and CEO endorsement likeness. Cloudflare abuse ticket acknowledged; DNS sinkhole verified; final audit verification pending.',
    chainOfCustodyHash: 'SHA256:3a4b91e5d71c1b3f9408e019b8830182ec09138407fb932a9c1e7a536290ef41',
    events: [
      {
        id: 'evt_2_1',
        stageNumber: 1,
        stageName: 'DETECTION',
        stageTitle: '1. Autonomous Threat Detection & Vision AI Flag',
        systemOrigin: 'BrandGuard',
        timestamp: '2026-09-14T02:00:00Z',
        relativeTime: 'T+00:00',
        actorName: 'BrandGuard Vision AI Engine',
        actorRole: 'Perceptual Hash Crawler',
        status: 'COMPLETED',
        headline: '84% Perceptual Hash Match on Crypto Investment Portal',
        narrative: 'Detected rogue site promising 28% APY arbitrage with fabricated CEO quote and unauthorized high-resolution wordmark asset.',
        technicalTelemetry: [
          { label: 'Domain', value: 'apex-investments.xyz', badge: 'High Risk gTLD' },
          { label: 'Similarity Score', value: '84% (Visual Brandmark)' },
          { label: 'Risk Score', value: '91/100' }
        ],
        evidenceArtifact: {
          artifactCode: 'EVD-INVEST-001',
          title: 'Visual Screenshot & OCR Extracted Text Dossier',
          sha256Hash: '5a4b91e5d71c1b3f9408e019b88301824a9b91e5d71c1b3f9408e019b8830182',
          category: 'Visual Forensics',
          vaultReference: 'vault://evidence/2026/09/apex_invest_ocr.png'
        },
        complianceControls: ['ISO 27001:2022 A.8.1', 'MAS TRM 12.3']
      },
      {
        id: 'evt_2_2',
        stageNumber: 2,
        stageName: 'TRIAGE',
        stageTitle: '2. Triage & Legal Risk Escalation',
        systemOrigin: 'BrandGuard',
        timestamp: '2026-09-14T02:15:00Z',
        relativeTime: 'T+15m',
        actorName: 'BrandGuard Triage Specialist',
        actorRole: 'Brand Protection Analyst',
        status: 'COMPLETED',
        headline: 'Escalated to RemediationDesk as REM-BG-2026-002',
        narrative: 'Assessed consumer confusion threat and brand reputational damage. Dispatched to RemediationDesk with 48h SLA.',
        technicalTelemetry: [
          { label: 'Remediation Ticket', value: 'REM-BG-2026-002' },
          { label: 'SLA Window', value: '48 Hours' }
        ],
        complianceControls: ['ISO 27001:2022 A.5.25']
      },
      {
        id: 'evt_2_3',
        stageNumber: 3,
        stageName: 'CONTAINMENT',
        stageTitle: '3. Compensating Defense & Proxy Blocklist',
        systemOrigin: 'RemediationDesk',
        timestamp: '2026-09-14T03:30:00Z',
        relativeTime: 'T+01h 30m',
        actorName: 'SecOps Infrastructure Team',
        actorRole: 'Security Operations',
        status: 'COMPLETED',
        headline: 'Zscaler Threat Intel Feed Updated; Domain Sinkholed',
        narrative: 'Domain added to corporate URL threat categories and blocked at the DNS resolver layer.',
        technicalTelemetry: [
          { label: 'Blocklist Status', value: 'Active on 100% of Fleet' }
        ],
        complianceControls: ['ISO 27001:2022 A.8.23']
      },
      {
        id: 'evt_2_4',
        stageNumber: 4,
        stageName: 'TAKEDOWN',
        stageTitle: '4. Abuse Notice Dispatched to Porkbun LLC',
        systemOrigin: 'BrandGuard',
        timestamp: '2026-09-14T05:00:00Z',
        relativeTime: 'T+03h 00m',
        actorName: 'BrandGuard Mitigation Desk',
        actorRole: 'Automated Enforcement',
        status: 'COMPLETED',
        headline: 'Registrar Issued Notice; DNS Routing Suspended',
        narrative: 'Porkbun LLC processed trademark misuse takedown; domain nameservers removed from global root.',
        technicalTelemetry: [
          { label: 'Registrar Action', value: 'Nameservers Delisted' }
        ],
        complianceControls: ['ISO 27001:2022 A.5.28']
      },
      {
        id: 'evt_2_5',
        stageNumber: 5,
        stageName: 'VERIFICATION',
        stageTitle: '5. Retesting & Uptime Verification',
        systemOrigin: 'RemediationDesk',
        timestamp: '2026-09-14T11:30:00Z',
        relativeTime: 'T+09h 30m',
        actorName: 'Automated Retest Daemon',
        actorRole: 'Verification Bot',
        status: 'COMPLETED',
        headline: 'Retest Passed: Host Unreachable (HTTP 523 / NXDOMAIN)',
        narrative: 'Probes confirm web application is offline. Awaiting formal auditor review and closure sign-off.',
        technicalTelemetry: [
          { label: 'Retest Status', value: 'PASS', badge: 'Verified Offline' }
        ],
        complianceControls: ['ISO 27001:2022 A.8.8']
      },
      {
        id: 'evt_2_6',
        stageNumber: 6,
        stageName: 'AUDIT_SIGNOFF',
        stageTitle: '6. Auditor Review & Sign-Off Desk',
        systemOrigin: 'AuditorDesk',
        timestamp: '2026-09-14T12:00:00Z',
        relativeTime: 'T+10h 00m',
        actorName: 'Pending Auditor',
        actorRole: 'External Quality Auditor',
        status: 'IN_PROGRESS',
        headline: 'Reviewing Chain-of-Custody Evidence & Retest Records',
        narrative: 'Dossier compiled and submitted into Second-Line Assurance queue for final sign-off.',
        technicalTelemetry: [
          { label: 'Status', value: 'AUDIT_VERIFICATION_PENDING', badge: 'Under Review' }
        ],
        complianceControls: ['ISO 27001:2022 Clause 9.2']
      }
    ]
  }
];

export const IncidentResponseTimeline: React.FC<IncidentResponseTimelineProps> = ({
  remediationItem,
  onClose,
  onOpenRemediation,
  isStandalone = true
}) => {
  const { theme, currentUser, logAuditEvent } = useGRC();
  const { showToast } = useToast();

  const [selectedCaseId, setSelectedCaseId] = useState<string>(
    remediationItem?.remediationCode === 'REM-BG-2026-002' ? 'case_bg_002' : 'case_bg_001'
  );
  const [expandedEvents, setExpandedEvents] = useState<Record<string, boolean>>({
    evt_1: true,
    evt_3: true,
    evt_4: true,
    evt_6: true
  });
  const [filterStage, setFilterStage] = useState<string>('ALL');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [isVerifyingSignature, setIsVerifyingSignature] = useState<boolean>(false);
  const [signatureVerified, setSignatureVerified] = useState<boolean>(true);

  // Active Case
  const activeCase = useMemo(() => {
    return SEED_INCIDENT_CASES.find(c => c.id === selectedCaseId) || SEED_INCIDENT_CASES[0];
  }, [selectedCaseId]);

  const toggleEventExpand = (eventId: string) => {
    setExpandedEvents(prev => ({
      ...prev,
      [eventId]: !prev[eventId]
    }));
  };

  const handleCopyHash = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    showToast({ title: `Copied ${label}`, type: 'success' });
    setTimeout(() => setCopiedHash(null), 2500);
  };

  const handleVerifySignature = () => {
    setIsVerifyingSignature(true);
    setTimeout(() => {
      setIsVerifyingSignature(false);
      setSignatureVerified(true);
      showToast({
        title: 'Cryptographic Signature Verified',
        message: 'Ed25519 signature authentic. Vault evidence hash matches immutable audit ledger.',
        type: 'success'
      });
      logAuditEvent('ACCESS', 'IncidentResponseTimeline', `Verified signature for case ${activeCase.remediationCode}`);
    }, 800);
  };

  const handleExportJson = () => {
    const exportData = {
      auditDossierType: 'SKANDA_INCIDENT_RESPONSE_LIFECYCLE_DOSSIER',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      exportedBy: currentUser?.name || 'Security Lead',
      case: activeCase
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Incident_Dossier_${activeCase.remediationCode}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast({ title: 'Exported Incident Dossier (JSON)', type: 'info' });
  };

  const handlePrintDossier = () => {
    window.print();
  };

  const filteredEvents = useMemo(() => {
    if (filterStage === 'ALL') return activeCase.events;
    return activeCase.events.filter(e => e.stageName === filterStage);
  }, [activeCase, filterStage]);

  return (
    <div id="incident-response-timeline-container" className="space-y-6">
      {/* Top Header Card */}
      <div className={`p-5 sm:p-6 rounded-2xl border shadow-sm transition-all ${
        theme === 'light'
          ? 'bg-white border-slate-200 text-slate-900'
          : 'bg-slate-900/90 border-slate-800 text-slate-100'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-start space-x-3.5">
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 shrink-0">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
                <h2 className="text-lg font-extrabold tracking-tight">
                  Incident Response Lifecycle Timeline
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                  BrandGuard &rarr; RemediationDesk
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  ISO 27001 A.5.24 &ndash; A.5.28 Audit-Ready
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed max-w-3xl">
                End-to-end chronological timeline tracking a detected threat from autonomous detection (BrandGuard),
                through SecOps triage, containment, and registrar takedown, to automated retesting and auditor closure.
              </p>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center space-x-2 shrink-0 flex-wrap gap-y-2">
            <button
              onClick={handleExportJson}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer ${
                theme === 'light'
                  ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
              title="Download Audit Dossier JSON"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>Export Dossier</span>
            </button>
            <button
              onClick={handlePrintDossier}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer ${
                theme === 'light'
                  ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
              title="Print Audit Pack"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              <span>Print View</span>
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                Close
              </button>
            )}
          </div>
        </div>

        {/* Case Selector Tabs & KPI Strip */}
        <div className="pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-0.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mr-1 shrink-0">
              Select Threat Case:
            </span>
            {SEED_INCIDENT_CASES.map(c => {
              const isSelected = c.id === activeCase.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCaseId(c.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 border cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : theme === 'light'
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                      : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  <span className="font-mono mr-1.5 text-[11px] opacity-90">{c.remediationCode}</span>
                  <span>{c.severity}</span>
                </button>
              );
            })}
          </div>

          {/* SLA Performance Pill */}
          <div className="flex items-center gap-3 shrink-0 text-xs">
            <div className="flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500 dark:text-slate-400">Total MTTR:</span>
              <strong className="font-mono text-emerald-500 dark:text-emerald-400 font-bold">
                {activeCase.totalDurationHours}h
              </strong>
              <span className="text-slate-400 text-[10px]">(&le; {activeCase.slaLimitHours}h SLA)</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              SLA {activeCase.slaStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Case Overview & Cryptographic Seal Box */}
      <div className={`p-5 rounded-xl border transition-all ${
        theme === 'light'
          ? 'bg-gradient-to-r from-slate-50 via-indigo-50/20 to-white border-slate-200 text-slate-900'
          : 'bg-gradient-to-r from-slate-950 via-indigo-950/20 to-slate-900 border-slate-800 text-slate-100'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                {activeCase.severity} SEVERITY
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                BrandGuard Ref: {activeCase.brandFindingCode}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Remediation Desk: {activeCase.remediationCode}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {activeCase.status.replace(/_/g, ' ')}
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
              {activeCase.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-4xl">
              {activeCase.summary}
            </p>
          </div>

          {/* Quick Jump into Remediation Desk */}
          {onOpenRemediation && (
            <button
              onClick={() => onOpenRemediation(activeCase.remediationCode)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center space-x-1.5 shrink-0 shadow-xs cursor-pointer transition-colors"
            >
              <span>Inspect in RemediationDesk</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Chain-of-Custody Cryptographic Ledger Bar */}
        <div className={`mt-4 pt-3 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
          theme === 'light' ? 'border-slate-200' : 'border-slate-800'
        }`}>
          <div className="flex items-center space-x-2 font-mono text-[11px] truncate">
            <Lock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="text-slate-400">Immutable Ledger Root:</span>
            <span className="font-bold text-slate-700 dark:text-slate-300 truncate">{activeCase.chainOfCustodyHash}</span>
            <button
              onClick={() => handleCopyHash(activeCase.chainOfCustodyHash, 'Ledger Root Hash')}
              className="text-slate-400 hover:text-slate-200 cursor-pointer p-0.5"
              title="Copy SHA-256 Ledger Hash"
            >
              {copiedHash === activeCase.chainOfCustodyHash ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={handleVerifySignature}
              disabled={isVerifyingSignature}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center space-x-1.5 border transition cursor-pointer ${
                signatureVerified
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              <FileCheck2 className={`w-3.5 h-3.5 ${isVerifyingSignature ? 'animate-spin text-indigo-400' : 'text-emerald-400'}`} />
              <span>{isVerifyingSignature ? 'Verifying Ed25519...' : 'Verify Cryptographic Proof'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Stages Bar */}
      <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter Lifecycle:</span>
          </span>
          {[
            { id: 'ALL', label: 'All Lifecycle Stages (6)' },
            { id: 'DETECTION', label: '1. Detection (BrandGuard)' },
            { id: 'TRIAGE', label: '2. Triage & Ticket' },
            { id: 'CONTAINMENT', label: '3. Compensating Control' },
            { id: 'TAKEDOWN', label: '4. Legal / Takedown' },
            { id: 'VERIFICATION', label: '5. Retest Verification' },
            { id: 'AUDIT_SIGNOFF', label: '6. Auditor Sign-Off' }
          ].map(stage => {
            const isSelected = filterStage === stage.id;
            return (
              <button
                key={stage.id}
                onClick={() => setFilterStage(stage.id)}
                className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer text-[11px] shrink-0 border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                    : theme === 'light'
                    ? 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800'
                }`}
              >
                {stage.label}
              </button>
            );
          })}
        </div>

        <div className="text-[11px] text-slate-400 font-mono">
          Showing {filteredEvents.length} of {activeCase.events.length} Audited Milestones
        </div>
      </div>

      {/* Chronological Vertical Timeline Feed */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-rose-500 before:via-amber-500 before:to-emerald-500">
        {filteredEvents.map((evt) => {
          const isExpanded = !!expandedEvents[evt.id];
          const isBrandGuard = evt.systemOrigin === 'BrandGuard';
          const isRemediation = evt.systemOrigin === 'RemediationDesk';
          const isAuditor = evt.systemOrigin === 'AuditorDesk';

          return (
            <div key={evt.id} className="relative group">
              {/* Timeline Node Dot */}
              <div className={`absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 rounded-full flex items-center justify-center border-2 shadow-sm transition-transform group-hover:scale-110 ${
                evt.stageNumber === 1
                  ? 'bg-rose-500 border-white dark:border-slate-950 text-white'
                  : evt.stageNumber === 2
                  ? 'bg-amber-500 border-white dark:border-slate-950 text-white'
                  : evt.stageNumber === 3
                  ? 'bg-sky-500 border-white dark:border-slate-950 text-white'
                  : evt.stageNumber === 4
                  ? 'bg-indigo-500 border-white dark:border-slate-950 text-white'
                  : evt.stageNumber === 5
                  ? 'bg-teal-500 border-white dark:border-slate-950 text-white'
                  : 'bg-emerald-500 border-white dark:border-slate-950 text-white'
              }`}>
                <span className="text-[10px] font-black font-mono">{evt.stageNumber}</span>
              </div>

              {/* Event Card Container */}
              <div className={`rounded-xl border shadow-xs transition-all ${
                theme === 'light'
                  ? 'bg-white hover:border-slate-300 border-slate-200 text-slate-900'
                  : 'bg-slate-900/90 hover:border-slate-700 border-slate-800 text-slate-100'
              }`}>
                {/* Event Header Strip */}
                <div
                  onClick={() => toggleEventExpand(evt.id)}
                  className="p-4 sm:p-4.5 cursor-pointer flex items-start justify-between gap-3 select-none"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        isBrandGuard
                          ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30'
                          : isRemediation
                          ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                          : isAuditor
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {evt.systemOrigin}
                      </span>
                      <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100">
                        {evt.stageTitle}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {evt.relativeTime}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">
                      {evt.headline}
                    </h4>

                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-2">
                      <span>Actor: <strong className="text-slate-700 dark:text-slate-300 font-medium">{evt.actorName}</strong> ({evt.actorRole})</span>
                      <span>&bull;</span>
                      <span className="font-mono text-[11px]">{new Date(evt.timestamp).toUTCString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {evt.status}
                    </span>
                    <button
                      type="button"
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Granular Telemetry & Evidence Details */}
                {isExpanded && (
                  <div className={`p-4 sm:p-5 pt-0 border-t space-y-4 text-xs ${
                    theme === 'light' ? 'border-slate-100 bg-slate-50/50' : 'border-slate-800/80 bg-slate-950/40'
                  }`}>
                    {/* Narrative Text */}
                    <div className="pt-3">
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs">
                        {evt.narrative}
                      </p>
                    </div>

                    {/* Technical Telemetry Grid */}
                    {evt.technicalTelemetry.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                        {evt.technicalTelemetry.map((metric, i) => (
                          <div
                            key={i}
                            className={`p-2.5 rounded-lg border ${
                              theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
                            }`}
                          >
                            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                              {metric.label}
                            </div>
                            <div className="font-mono font-bold text-xs mt-0.5 text-slate-800 dark:text-slate-200 truncate">
                              {metric.value}
                            </div>
                            {metric.badge && (
                              <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                                {metric.badge}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Evidence Artifact Block */}
                    {evt.evidenceArtifact && (
                      <div className={`p-3 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
                      }`}>
                        <div className="flex items-start space-x-2.5 min-w-0">
                          <FileCheck2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                                {evt.evidenceArtifact.title}
                              </span>
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                {evt.evidenceArtifact.artifactCode}
                              </span>
                            </div>
                            <div className="text-[11px] font-mono text-slate-500 truncate mt-0.5">
                              Hash: {evt.evidenceArtifact.sha256Hash}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              Stored in: {evt.evidenceArtifact.vaultReference}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                          <button
                            onClick={() => handleCopyHash(evt.evidenceArtifact!.sha256Hash, 'Artifact SHA-256')}
                            className="px-2 py-1 rounded text-[11px] border text-slate-400 hover:text-slate-200 hover:bg-slate-800 border-slate-700 flex items-center space-x-1 cursor-pointer"
                          >
                            <Copy className="w-3 h-3" />
                            <span>Copy Hash</span>
                          </button>
                          <button
                            onClick={() => showToast({ title: `Inspecting ${evt.evidenceArtifact!.artifactCode}`, message: 'Opening raw evidence artifact from vault...', type: 'info' })}
                            className="px-2 py-1 rounded text-[11px] bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center space-x-1 cursor-pointer"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Inspect File</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Mapped Compliance Controls */}
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Audit Standard Mapping:
                      </span>
                      {evt.complianceControls.map((ctrl, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700"
                        >
                          {ctrl}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Auditor Formal Sign-Off Seal & Verification Block */}
      {activeCase.auditorSignOff && (
        <div className={`p-5 sm:p-6 rounded-2xl border transition-all ${
          theme === 'light'
            ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
            : 'bg-emerald-950/20 border-emerald-800/60 text-emerald-100'
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-emerald-500/20">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold uppercase tracking-wider text-emerald-500 dark:text-emerald-400 flex items-center gap-2">
                  <span>Formal Regulatory Audit Sign-Off Certificate</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                    ED25519 SEALED
                  </span>
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Signed under ISO/IEC 27001:2022 Clause 10.2 Non-conformity and corrective action protocols.
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-mono font-bold text-emerald-400 block">
                {new Date(activeCase.auditorSignOff.timestamp).toUTCString()}
              </span>
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Attestation Date</span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <div className="text-[10px] font-bold uppercase text-slate-400">Auditor Attestation Statement</div>
              <p className="mt-1 text-slate-700 dark:text-slate-300 italic leading-relaxed">
                &ldquo;{activeCase.auditorSignOff.closureConclusion}&rdquo;
              </p>
              <div className="mt-2 text-[11px] text-slate-500">
                Signer: <strong className="text-slate-800 dark:text-slate-200">{activeCase.auditorSignOff.auditorName}</strong> &bull; {activeCase.auditorSignOff.auditorRole}
              </div>
            </div>

            <div className="space-y-1.5 font-mono text-[11px]">
              <div>
                <span className="text-slate-400 text-[10px] block">Cryptographic Ed25519 Public Key & Signature:</span>
                <span className="font-bold text-emerald-400 break-all">{activeCase.auditorSignOff.signatureEd25519}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Accredited Assurance Body:</span>
                <span className="text-slate-700 dark:text-slate-300 font-sans">{activeCase.auditorSignOff.organization}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
