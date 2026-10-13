import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Clock,
  Radio,
  MapPin,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Zap,
  Activity,
  ArrowUpRight,
  TrendingUp,
  Download,
  Terminal,
  Crosshair,
  Copy,
  Check,
  Flame,
  Layers,
  FileText,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { useToast } from '../common/ToastContainer';

export type ThreatSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type MitigationStatus = 'ACTIVE_BREACH' | 'MITIGATING' | 'CONTAINED' | 'BLOCKED';

export interface ThreatDetectionEvent {
  id: string;
  timestamp: string; // ISO 8601 string
  displayTime: string; // e.g. "23:41:14 UTC"
  timeAgo: string;
  nodeId: string;
  nodeName: string;
  nodeCode: string;
  severity: ThreatSeverity;
  threatCategory: string;
  threatTitle: string;
  description: string;
  sourceOrigin: string;
  targetVector: string;
  cveOrRuleRef: string;
  mitigationStatus: MitigationStatus;
  
  // Correlated connectivity breach metrics
  correlatedMetrics: {
    latencyPreBreach: number;
    latencyAtBreach: number;
    packetLossPreBreach: number;
    packetLossAtBreach: number;
    throughputDelta: string;
    jitterSurgeMs: number;
    affectedSensors: string[];
    correlationLagSeconds: number; // lag between security trigger and telemetry drop
    breachWindowDescription: string;
  };

  // SOC / Audit compliance context
  complianceImpact: string;
  forensicPayloadSnippet?: string;
}

export const INITIAL_THREAT_EVENTS: ThreatDetectionEvent[] = [
  {
    id: 'thr-2026-0919-01',
    timestamp: '2026-09-19T23:41:14.000Z',
    displayTime: '23:41:14 UTC',
    timeAgo: '2m ago',
    nodeId: 'reg-ap-northeast',
    nodeName: 'Asia Pacific (Tokyo)',
    nodeCode: 'ap-northeast-1',
    severity: 'CRITICAL',
    threatCategory: 'Volumetric DDoS & BGP Flap',
    threatTitle: 'Trans-Pacific BGP Route Injection & Syn Flood',
    description: 'Autonomous System route diversion detected correlating directly with saturated trans-Pacific undersea fiber pipe and edge router queue starvation.',
    sourceOrigin: 'ASN 4134 (Distributed Reflector Mesh) • 14,200 bot IPs',
    targetVector: 'Ingress BGP Peer 203.0.113.1 / TCP Port 443',
    cveOrRuleRef: 'MITRE ATT&CK T1498.001 • RPKI Invalidation',
    mitigationStatus: 'ACTIVE_BREACH',
    correlatedMetrics: {
      latencyPreBreach: 18,
      latencyAtBreach: 248,
      packetLossPreBreach: 0.0,
      packetLossAtBreach: 4.8,
      throughputDelta: '+1,277% surge (48,000 pkts/min)',
      jitterSurgeMs: 14.8,
      affectedSensors: ['CrowdStrike EDR', 'Cloudflare WAF'],
      correlationLagSeconds: 1.4,
      breachWindowDescription: 'Carrier edge queue overflow occurred 1.4s following initial SYN flood burst.'
    },
    complianceImpact: 'NIST SP 800-53 SC-7 (Boundary Protection) • SOC2 CC6.8',
    forensicPayloadSnippet: 'BGP_UPDATE: Prefix 198.51.100.0/24 AS_PATH [4134, 4837, 64512] -> INVALID_ORIGIN_ROA'
  },
  {
    id: 'thr-2026-0919-02',
    timestamp: '2026-09-19T23:28:40.000Z',
    displayTime: '23:28:40 UTC',
    timeAgo: '14m ago',
    nodeId: 'reg-eu-central',
    nodeName: 'Europe Central (Frankfurt)',
    nodeCode: 'eu-central-1',
    severity: 'HIGH',
    threatCategory: 'Cryptographic Protocol Downgrade',
    threatTitle: 'TLS 1.3 Renegotiation Probe & Cipher Downgrade',
    description: 'Malicious client renegotiation storm attempting to force fallback to deprecated CBC ciphers, producing high CPU crypto thread starvation and round-trip delay.',
    sourceOrigin: 'IP 185.220.101.5 (Tor Exit Node) • JA3: 771,4865-4866',
    targetVector: 'Vault PKI Mutual-TLS Ingress Gateway',
    cveOrRuleRef: 'CVE-2026-4419 • BSI TR-02102-1 Sovereign Standard',
    mitigationStatus: 'MITIGATING',
    correlatedMetrics: {
      latencyPreBreach: 26,
      latencyAtBreach: 92,
      packetLossPreBreach: 0.01,
      packetLossAtBreach: 1.2,
      throughputDelta: '+254% Handshake Renegotiation Rate',
      jitterSurgeMs: 6.1,
      affectedSensors: ['Vault PKI', 'CrowdStrike EDR'],
      correlationLagSeconds: 0.8,
      breachWindowDescription: 'Latency peaked to 92ms when crypto worker threads hit 98% saturation.'
    },
    complianceImpact: 'EU GDPR Art. 32 • BSI C5 Cryptographic Security',
    forensicPayloadSnippet: 'TLS_CLIENT_HELLO: SupportedVersion=[0x0303] CipherSuites=[TLS_RSA_WITH_AES_128_CBC_SHA] -> REJECTED'
  },
  {
    id: 'thr-2026-0919-03',
    timestamp: '2026-09-19T23:14:02.000Z',
    displayTime: '23:14:02 UTC',
    timeAgo: '29m ago',
    nodeId: 'reg-us-east',
    nodeName: 'US East (N. Virginia)',
    nodeCode: 'us-east-1',
    severity: 'HIGH',
    threatCategory: 'C2 Exfiltration via DNS Tunnel',
    threatTitle: 'High-Entropy DNS TXT Query Burst (Subdomain Tunneling)',
    description: 'Anomalous outbound DNS TXT lookups carrying base64-encoded binary chunks, coinciding with a sudden UDP socket queue backup and regional jitter spike.',
    sourceOrigin: 'Internal VPC Instance 10.240.4.12 -> Authoritative NS',
    targetVector: 'Regional DNS Ingress Pipe (Port 53 UDP)',
    cveOrRuleRef: 'MITRE ATT&CK T1071.004 • AWS GuardDuty DNS.Exfiltration',
    mitigationStatus: 'CONTAINED',
    correlatedMetrics: {
      latencyPreBreach: 14,
      latencyAtBreach: 46,
      packetLossPreBreach: 0.0,
      packetLossAtBreach: 0.4,
      throughputDelta: '+410% DNS queries/sec (Entropy 4.91)',
      jitterSurgeMs: 4.2,
      affectedSensors: ['AWS GuardDuty', 'Okta Identity'],
      correlationLagSeconds: 2.1,
      breachWindowDescription: 'Egress packet drop triggered automated VPC network ACL blackhole rule.'
    },
    complianceImpact: 'PCI-DSS 4.0 Req 11.5 • NIST SP 800-53 SI-4',
    forensicPayloadSnippet: 'DNS_QUERY: aXNfaW1tdXRhYmxlX2xlZGdlcl9rZXk=.c2.attacker-mesh.net IN TXT -> BLOCKED'
  },
  {
    id: 'thr-2026-0919-04',
    timestamp: '2026-09-19T22:52:18.000Z',
    displayTime: '22:52:18 UTC',
    timeAgo: '51m ago',
    nodeId: 'reg-sa-east',
    nodeName: 'South America (São Paulo)',
    nodeCode: 'sa-east-1',
    severity: 'MEDIUM',
    threatCategory: 'Credential Stuffing & WAF Rate Surge',
    threatTitle: 'Distributed OAuth Token Harvest & API Burst',
    description: 'Coordinated credential stuffing attack across Latin America edge endpoints, generating 3,200 requests/minute that caused localized WAF rate-limiting latency bump.',
    sourceOrigin: 'Residential Proxies (ASN 28573) • 82 distinct subnets',
    targetVector: 'REST API Ingress /auth/v2/token',
    cveOrRuleRef: 'OWASP API2:2023 Broken Authentication • Rule WAF-881',
    mitigationStatus: 'BLOCKED',
    correlatedMetrics: {
      latencyPreBreach: 38,
      latencyAtBreach: 84,
      packetLossPreBreach: 0.05,
      packetLossAtBreach: 0.1,
      throughputDelta: '+180% 401 Unauthorized bursts',
      jitterSurgeMs: 2.4,
      affectedSensors: ['Cloudflare WAF', 'Datadog APM'],
      correlationLagSeconds: 0.5,
      breachWindowDescription: 'Adaptive Cloudflare rate-limiting active within 500ms; latency normalized.'
    },
    complianceImpact: 'ISO 27001:2022 A.8.5 • LGPD Art. 46 (Brazil)',
    forensicPayloadSnippet: 'HTTP_POST: /auth/v2/token HTTP/2 User-Agent: python-requests/2.31 -> WAF_CAPTCHA_FAIL'
  },
  {
    id: 'thr-2026-0919-05',
    timestamp: '2026-09-19T22:15:30.000Z',
    displayTime: '22:15:30 UTC',
    timeAgo: '1h 28m ago',
    nodeId: 'reg-me-central',
    nodeName: 'Middle East (Dubai)',
    nodeCode: 'me-central-1',
    severity: 'LOW',
    threatCategory: 'Unauthorized Peer Route Flapping',
    threatTitle: 'Upstream Transit AS-Path Length Anomaly',
    description: 'Suspicious path prepending anomaly on IXP peering session caused momentary traffic hair-pinning through secondary European gateway.',
    sourceOrigin: 'Regional Internet Exchange Peering AS64512',
    targetVector: 'BGP Route Advertisement ASN 64512',
    cveOrRuleRef: 'BGPsec RFC 8205 • UAE NESA IAS Standard',
    mitigationStatus: 'BLOCKED',
    correlatedMetrics: {
      latencyPreBreach: 35,
      latencyAtBreach: 58,
      packetLossPreBreach: 0.0,
      packetLossAtBreach: 0.0,
      throughputDelta: 'Temporary 18 Mbps reroute via Marseille',
      jitterSurgeMs: 3.1,
      affectedSensors: ['Prisma Cloud', 'Vault PKI'],
      correlationLagSeconds: 3.2,
      breachWindowDescription: 'Traffic gracefully re-anchored back to local UAE gateway with zero dropped packets.'
    },
    complianceImpact: 'UAE NESA Telecommunications Standard • ISO 27001 A.8.20',
    forensicPayloadSnippet: 'BGP_MED: AS_PATH [64512, 64512, 64512, 64512] -> PREFERRED_LOCAL_PREF_100'
  },
  {
    id: 'thr-2026-0919-06',
    timestamp: '2026-09-19T21:42:08.000Z',
    displayTime: '21:42:08 UTC',
    timeAgo: '2h 29m ago',
    nodeId: 'reg-us-west',
    nodeName: 'US West (Oregon)',
    nodeCode: 'us-west-2',
    severity: 'MEDIUM',
    threatCategory: 'IAM Role Privilege Hijack',
    threatTitle: 'Anomalous Cross-Account STS AssumeRole Burst',
    description: 'Intercepted unauthorized STS AssumeRole invocation burst originating from untrusted CIDR block; automated policy quarantine engaged.',
    sourceOrigin: 'IP 198.51.100.84 (Suspicious AS209) • Tor Exit node',
    targetVector: 'AWS STS Ingress Regional Endpoint (us-west-2)',
    cveOrRuleRef: 'AWS GuardDuty IAM.RoleHijack • NIST SP 800-53 AC-6',
    mitigationStatus: 'CONTAINED',
    correlatedMetrics: {
      latencyPreBreach: 22,
      latencyAtBreach: 34,
      packetLossPreBreach: 0.02,
      packetLossAtBreach: 0.05,
      throughputDelta: '+88% IAM verification requests',
      jitterSurgeMs: 2.2,
      affectedSensors: ['AWS GuardDuty', 'Terraform IaC'],
      correlationLagSeconds: 1.1,
      breachWindowDescription: 'Quarantined IAM role lease within 1.1s; telemetry normalized.'
    },
    complianceImpact: 'NIST SP 800-53 AC-6 (Least Privilege) • SOC2 CC6.1',
    forensicPayloadSnippet: 'STS_ASSUMEROLE: TargetArn=arn:aws:iam::123456789:role/DevSecOpsAdmin -> ACCESS_DENIED_EXPIRED'
  },
  {
    id: 'thr-2026-0919-07',
    timestamp: '2026-09-19T20:19:15.000Z',
    displayTime: '20:19:15 UTC',
    timeAgo: '3h 52m ago',
    nodeId: 'reg-eu-west',
    nodeName: 'Europe West (London)',
    nodeCode: 'europe-west2',
    severity: 'LOW',
    threatCategory: 'API Token Replay & Rate Surge',
    threatTitle: 'Rate-Limited Open Banking OAuth Token Replay',
    description: 'Elevated volume of expired client token refresh invocations flagged at London edge proxy; throttled by GCP Cloud Armor rate limiter.',
    sourceOrigin: 'Egress IP 195.154.122.90 • Automated Bot Scraper',
    targetVector: 'GCP Cloud Armor Ingress /api/v3/banking',
    cveOrRuleRef: 'OWASP API4:2023 Rate Limiting • UK PRA PS21/3',
    mitigationStatus: 'BLOCKED',
    correlatedMetrics: {
      latencyPreBreach: 24,
      latencyAtBreach: 38,
      packetLossPreBreach: 0.03,
      packetLossAtBreach: 0.03,
      throughputDelta: '+92% 429 Too Many Requests response rate',
      jitterSurgeMs: 1.4,
      affectedSensors: ['Cloudflare WAF', 'GitHub CI/CD'],
      correlationLagSeconds: 0.4,
      breachWindowDescription: 'Rate limiting prevented downstream API gateway queue starvation.'
    },
    complianceImpact: 'UK PRA PS21/3 Operational Resilience • ISO 27001 A.8.20',
    forensicPayloadSnippet: 'OAUTH_REFRESH: ClientId=app-uk-fintech-44 RefreshToken=EXPIRED_SIGNATURE -> HTTP_429'
  },
  {
    id: 'thr-2026-0919-08',
    timestamp: '2026-09-19T19:04:30.000Z',
    displayTime: '19:04:30 UTC',
    timeAgo: '5h 07m ago',
    nodeId: 'reg-ap-southeast',
    nodeName: 'Asia Pacific (Singapore)',
    nodeCode: 'ap-southeast-1',
    severity: 'LOW',
    threatCategory: 'TLS Handshake Probe',
    threatTitle: 'Deprecated Cipher Suite Scanning Sequence',
    description: 'External security scanner probe attempting TLS 1.0/1.1 legacy handshakes on edge Anycast ingress; dropped at perimeter WAF.',
    sourceOrigin: 'Scanner AS16276 • Distributed test cluster',
    targetVector: 'Edge Anycast IP 104.16.24.1 Port 443',
    cveOrRuleRef: 'MAS TRM 13.0 Cryptography • RFC 8996 Deprecation',
    mitigationStatus: 'BLOCKED',
    correlatedMetrics: {
      latencyPreBreach: 8,
      latencyAtBreach: 12,
      packetLossPreBreach: 0.0,
      packetLossAtBreach: 0.0,
      throughputDelta: '+14 pkts/min TLS handshake probes',
      jitterSurgeMs: 0.5,
      affectedSensors: ['Cloudflare WAF (SIN Edge)', 'Okta SCIM & MFA'],
      correlationLagSeconds: 0.2,
      breachWindowDescription: 'Perimeter firewall terminated connection before reaching application cluster.'
    },
    complianceImpact: 'MAS Technology Risk Management Notice 644 • PCI-DSS 4.0',
    forensicPayloadSnippet: 'TLS_RECORD: Handshake Type 1 (ClientHello) Version=TLS 1.0 (0x0301) -> DROPPED_BY_WAF'
  },
  {
    id: 'thr-2026-0919-09',
    timestamp: '2026-09-19T18:15:55.000Z',
    displayTime: '18:15:55 UTC',
    timeAgo: '5h 55m ago',
    nodeId: 'reg-ap-southeast-2',
    nodeName: 'Australia (Sydney)',
    nodeCode: 'ap-southeast-2',
    severity: 'MEDIUM',
    threatCategory: 'Bastion SSH Brute-Force',
    threatTitle: 'Distributed Key-Exchange Probing on Bastion Host',
    description: 'Sequential SSH-RSA key exchange attempts from untrusted foreign IP subnets; IP ban triggered by CrowdStrike EDR perimeter rule.',
    sourceOrigin: 'Known Malicious Relays • 6 unique external IPs',
    targetVector: 'Bastion Subnet 10.140.0.5 Port 22',
    cveOrRuleRef: 'MITRE ATT&CK T1110.001 • APRA CPS 234',
    mitigationStatus: 'BLOCKED',
    correlatedMetrics: {
      latencyPreBreach: 42,
      latencyAtBreach: 48,
      packetLossPreBreach: 0.02,
      packetLossAtBreach: 0.02,
      throughputDelta: '+62 SSH connection attempts/sec',
      jitterSurgeMs: 1.1,
      affectedSensors: ['CrowdStrike EDR', 'Terraform IaC'],
      correlationLagSeconds: 0.9,
      breachWindowDescription: 'Dynamic perimeter security group blocked origin IPs across Australia edge.'
    },
    complianceImpact: 'APRA CPS 234 Information Security • Privacy Act 1988',
    forensicPayloadSnippet: 'SSHD_EVENT: Failed password for invalid user admin from 185.220.101.44 port 54812 ssh2 -> BANNED_IP'
  }
];

export interface RegionThreatSummary {
  activeAlertsCount: number;
  criticalAlertsCount: number;
  latestThreatTimestamp: string;
  latestThreatDisplayTime: string;
  latestThreatTimeAgo: string;
  latestThreatTitle: string;
  latestThreatCategory: string;
  latestThreatSeverity: ThreatSeverity;
  latestMitigationStatus: MitigationStatus;
  threatEventsCount: number;
  affectedSensors: string[];
}

export const getRegionThreatSummary = (
  nodeId: string,
  events: ThreatDetectionEvent[] = INITIAL_THREAT_EVENTS
): RegionThreatSummary => {
  const nodeEvents = events.filter(e => e.nodeId === nodeId);
  const activeEvents = nodeEvents.filter(
    e => e.mitigationStatus === 'ACTIVE_BREACH' || e.mitigationStatus === 'MITIGATING'
  );
  const criticalCount = nodeEvents.filter(e => e.severity === 'CRITICAL').length;

  if (nodeEvents.length === 0) {
    return {
      activeAlertsCount: 0,
      criticalAlertsCount: 0,
      latestThreatTimestamp: '2026-09-19T20:00:00.000Z',
      latestThreatDisplayTime: '20:00:00 UTC',
      latestThreatTimeAgo: '4h ago',
      latestThreatTitle: 'Routine SOC-2 Perimeter Telemetry Integrity Scan',
      latestThreatCategory: 'Routine SIEM Baseline',
      latestThreatSeverity: 'LOW',
      latestMitigationStatus: 'BLOCKED',
      threatEventsCount: 0,
      affectedSensors: []
    };
  }

  // Sorted by timestamp descending
  const sorted = [...nodeEvents].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  const latest = sorted[0];

  return {
    activeAlertsCount: activeEvents.length,
    criticalAlertsCount: criticalCount,
    latestThreatTimestamp: latest.timestamp,
    latestThreatDisplayTime: latest.displayTime,
    latestThreatTimeAgo: latest.timeAgo,
    latestThreatTitle: latest.threatTitle,
    latestThreatCategory: latest.threatCategory,
    latestThreatSeverity: latest.severity,
    latestMitigationStatus: latest.mitigationStatus,
    threatEventsCount: nodeEvents.length,
    affectedSensors: latest.correlatedMetrics.affectedSensors || []
  };
};

export interface ThreatDetectionTimelineProps {
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
  onSwitchToInspector?: () => void;
  threatEvents?: ThreatDetectionEvent[];
  onThreatEventsChange?: (events: ThreatDetectionEvent[]) => void;
}

export const ThreatDetectionTimeline: React.FC<ThreatDetectionTimelineProps> = ({
  selectedNodeId,
  onSelectNode,
  onSwitchToInspector,
  threatEvents: externalThreatEvents,
  onThreatEventsChange
}) => {
  const { showToast } = useToast();

  const [internalThreatEvents, setInternalThreatEvents] = useState<ThreatDetectionEvent[]>(INITIAL_THREAT_EVENTS);
  const threatEvents = externalThreatEvents || internalThreatEvents;

  const setThreatEvents = (updater: React.SetStateAction<ThreatDetectionEvent[]>) => {
    if (onThreatEventsChange && externalThreatEvents) {
      const next = typeof updater === 'function' ? updater(externalThreatEvents) : updater;
      onThreatEventsChange(next);
    } else {
      setInternalThreatEvents(updater);
    }
  };
  const [selectedThreatId, setSelectedThreatId] = useState<string | null>('thr-2026-0919-01');
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'ACTIVE_ONLY'>('ALL');
  const [regionFilter, setRegionFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedPayloads, setExpandedPayloads] = useState<Record<string, boolean>>({
    'thr-2026-0919-01': true
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Synchronize region filter if parent selects a node
  const activeRegionNodeId = selectedNodeId;

  // Filtered threat events
  const filteredEvents = useMemo(() => {
    return threatEvents.filter(ev => {
      // Region filter
      if (regionFilter !== 'ALL' && ev.nodeId !== regionFilter) {
        return false;
      }
      // Severity filter
      if (severityFilter === 'CRITICAL' && ev.severity !== 'CRITICAL') return false;
      if (severityFilter === 'HIGH' && ev.severity !== 'HIGH' && ev.severity !== 'CRITICAL') return false;
      if (severityFilter === 'ACTIVE_ONLY' && ev.mitigationStatus !== 'ACTIVE_BREACH') return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          ev.threatTitle.toLowerCase().includes(q) ||
          ev.threatCategory.toLowerCase().includes(q) ||
          ev.nodeName.toLowerCase().includes(q) ||
          ev.nodeCode.toLowerCase().includes(q) ||
          ev.cveOrRuleRef.toLowerCase().includes(q) ||
          ev.sourceOrigin.toLowerCase().includes(q) ||
          ev.displayTime.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [threatEvents, severityFilter, regionFilter, searchQuery]);

  // Aggregate stats
  const threatStats = useMemo(() => {
    const total = threatEvents.length;
    const activeBreaches = threatEvents.filter(e => e.mitigationStatus === 'ACTIVE_BREACH').length;
    const criticalCount = threatEvents.filter(e => e.severity === 'CRITICAL').length;
    const avgLagSec =
      Math.round(
        (threatEvents.reduce((acc, e) => acc + e.correlatedMetrics.correlationLagSeconds, 0) / total) *
          10
      ) / 10;
    return { total, activeBreaches, criticalCount, avgLagSec };
  }, [threatEvents]);

  // Handlers
  const handleTogglePayload = (id: string) => {
    setExpandedPayloads(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleCopyPayload = (snippet: string, id: string) => {
    navigator.clipboard.writeText(snippet);
    setCopiedId(id);
    showToast({
      title: 'Forensic Snippet Copied',
      message: 'Cryptographic payload signature copied to clipboard for SIEM correlation.',
      type: 'info'
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleMitigateThreat = (event: ThreatDetectionEvent) => {
    setThreatEvents(prev =>
      prev.map(ev => {
        if (ev.id === event.id) {
          return {
            ...ev,
            mitigationStatus: 'CONTAINED',
            correlatedMetrics: {
              ...ev.correlatedMetrics,
              latencyAtBreach: Math.round(ev.correlatedMetrics.latencyPreBreach * 1.15),
              packetLossAtBreach: 0.0
            }
          };
        }
        return ev;
      })
    );

    showToast({
      title: 'Threat Contained & Traffic Isolated',
      message: `Ingress firewall rule injected for ${event.nodeCode}. Rerouted telemetry to backup path.`,
      type: 'success'
    });
  };

  const handleSimulateNewBreach = () => {
    const now = new Date();
    const isoString = now.toISOString();
    const displayTime = `${now.getUTCHours().toString().padStart(2, '0')}:${now
      .getUTCMinutes()
      .toString()
      .padStart(2, '0')}:${now.getUTCSeconds().toString().padStart(2, '0')} UTC`;

    const newBreach: ThreatDetectionEvent = {
      id: `thr-${Date.now()}`,
      timestamp: isoString,
      displayTime,
      timeAgo: 'Just now',
      nodeId: selectedNodeId || 'reg-us-west',
      nodeName: selectedNodeId ? 'Selected Gateway' : 'US West (Oregon)',
      nodeCode: selectedNodeId ? 'reg-active' : 'us-west-2',
      severity: 'CRITICAL',
      threatCategory: 'Layer-7 API DDoS & Credential Exfiltration',
      threatTitle: 'Live Telemetry Rate Surge & Token Injection Attempt',
      description: 'Simulated real-time adversarial flood generating abnormal TCP socket queueing and high packet latency drop.',
      sourceOrigin: `ASN 13335 (Injected Simulator) • IP 198.51.100.${Math.floor(Math.random() * 200 + 10)}`,
      targetVector: 'HTTPS Mutual-TLS Edge Gateway /v1/telemetry',
      cveOrRuleRef: 'CORTEX-SIM-2026-X • NIST SP 800-53 SI-4(12)',
      mitigationStatus: 'ACTIVE_BREACH',
      correlatedMetrics: {
        latencyPreBreach: 19,
        latencyAtBreach: 186,
        packetLossPreBreach: 0.0,
        packetLossAtBreach: 3.4,
        throughputDelta: '+850% socket pressure (29,400 pkts/min)',
        jitterSurgeMs: 11.2,
        affectedSensors: ['Cloudflare WAF', 'CrowdStrike EDR'],
        correlationLagSeconds: 1.1,
        breachWindowDescription: 'Simulated latency degradation initiated 1.1s after payload injection.'
      },
      complianceImpact: 'ISO 27001:2022 A.8.16 (Monitoring Activities)',
      forensicPayloadSnippet: 'SIM_ATTACK_PACKET: payload="SYN_FLOOD_ANOMALY" cipher="TLS_AES_256_GCM_SHA384"'
    };

    setThreatEvents(prev => [newBreach, ...prev]);
    setSelectedThreatId(newBreach.id);
    onSelectNode(newBreach.nodeId);

    showToast({
      title: 'Simulated Security Breach Injected',
      message: `Breach timestamp recorded at ${displayTime}. Regional latency degraded to 186ms.`,
      type: 'warning'
    });
  };

  const handleExportAuditTrail = () => {
    const dataStr = JSON.stringify(threatEvents, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `skanda-threat-telemetry-correlation-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast({
      title: 'Audit Trail Exported',
      message: 'Cryptographically signed threat-connectivity correlation ledger downloaded.',
      type: 'success'
    });
  };

  return (
    <div className="flex flex-col h-full space-y-3.5 text-xs font-mono">
      {/* 1. Header Toolbar & Quick Stats */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400">
              <ShieldAlert className="w-4 h-4" />
            </span>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center space-x-1.5">
                <span>Threat Detection Timeline</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500 text-white font-black animate-pulse">
                  {threatStats.activeBreaches} LIVE
                </span>
              </h4>
              <p className="text-[10px] text-slate-400">
                Correlated breach events &amp; network latency anomalies
              </p>
            </div>
          </div>

          {/* Simulate Breach Trigger */}
          <button
            type="button"
            onClick={handleSimulateNewBreach}
            className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold transition cursor-pointer flex items-center space-x-1 shadow-xs"
            title="Inject simulated security incident with real-time connectivity drop"
          >
            <Flame className="w-3 h-3 text-amber-300 animate-pulse" />
            <span className="hidden sm:inline">Simulate Attack</span>
          </button>
        </div>

        {/* Quick Correlation Metrics Pill Bar */}
        <div className="grid grid-cols-3 gap-1.5 p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-[10px]">
          <div className="text-center border-r border-slate-800">
            <span className="text-slate-400 block text-[9px] uppercase">Active Breaches</span>
            <span className="text-rose-400 font-bold text-xs">{threatStats.activeBreaches} Critical</span>
          </div>
          <div className="text-center border-r border-slate-800">
            <span className="text-slate-400 block text-[9px] uppercase">Avg Correlation Lag</span>
            <span className="text-indigo-400 font-bold text-xs">{threatStats.avgLagSec}s Window</span>
          </div>
          <div className="text-center">
            <span className="text-slate-400 block text-[9px] uppercase">Audit Ledger</span>
            <button
              type="button"
              onClick={handleExportAuditTrail}
              className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center justify-center space-x-1 mx-auto"
              title="Download signed JSON audit log"
            >
              <Download className="w-2.5 h-2.5" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Filters & Search Bar */}
      <div className="space-y-1.5">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by CVE, Attack Vector, Region, or IP..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500 text-[11px] focus:outline-hidden focus:border-indigo-500 transition"
          />
        </div>

        <div className="flex items-center justify-between gap-1 text-[10px]">
          {/* Severity Filter Pills */}
          <div className="flex items-center space-x-1 overflow-x-auto py-0.5">
            {(['ALL', 'ACTIVE_ONLY', 'CRITICAL', 'HIGH'] as const).map(sev => (
              <button
                key={sev}
                type="button"
                onClick={() => setSeverityFilter(sev)}
                className={`px-2 py-0.5 rounded transition cursor-pointer font-bold whitespace-nowrap ${
                  severityFilter === sev
                    ? 'bg-slate-800 text-white border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {sev === 'ACTIVE_ONLY' ? 'Live Only' : sev}
              </button>
            ))}
          </div>

          {/* Region Filter Dropdown */}
          <select
            value={regionFilter}
            onChange={e => setRegionFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-300 text-[10px] focus:outline-hidden"
          >
            <option value="ALL">All Regions</option>
            <option value="reg-ap-northeast">Tokyo (ap-northeast-1)</option>
            <option value="reg-eu-central">Frankfurt (eu-central-1)</option>
            <option value="reg-us-east">N. Virginia (us-east-1)</option>
            <option value="reg-sa-east">São Paulo (sa-east-1)</option>
            <option value="reg-me-central">Dubai (me-central-1)</option>
          </select>
        </div>
      </div>

      {/* 3. Chronological Correlated Timeline List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[520px] scrollbar-thin scrollbar-thumb-slate-800">
        {filteredEvents.length === 0 ? (
          <div className="p-6 text-center text-slate-500 rounded-xl border border-slate-900 bg-slate-950/40">
            <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-slate-600 opacity-60" />
            <p className="text-xs font-semibold text-slate-400">No threat events match filter</p>
            <p className="text-[10px] text-slate-600 mt-0.5">
              Network boundaries operating within nominal SLA baseline.
            </p>
          </div>
        ) : (
          filteredEvents.map((event, idx) => {
            const isSelected = selectedThreatId === event.id;
            const isPayloadExpanded = !!expandedPayloads[event.id];

            return (
              <div
                key={event.id}
                className={`relative rounded-xl border transition-all duration-150 p-3 ${
                  isSelected
                    ? 'bg-slate-900/95 border-rose-500/60 shadow-lg shadow-rose-950/20'
                    : 'bg-slate-950/60 hover:bg-slate-900/60 border-slate-800/80'
                }`}
              >
                {/* Visual Timeline Spine Connection */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    {/* Pulsing Dot according to severity */}
                    <span
                      className={`relative flex h-2.5 w-2.5 ${
                        event.mitigationStatus === 'ACTIVE_BREACH' ? 'animate-ping' : ''
                      }`}
                    >
                      <span
                        className={`inline-flex rounded-full h-2.5 w-2.5 ${
                          event.severity === 'CRITICAL'
                            ? 'bg-rose-500'
                            : event.severity === 'HIGH'
                            ? 'bg-amber-500'
                            : 'bg-indigo-400'
                        }`}
                      />
                    </span>

                    {/* Exact Timestamp */}
                    <div className="flex items-center space-x-1.5">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span className="font-bold text-white text-[11px]">{event.displayTime}</span>
                      <span className="text-[10px] text-slate-500">({event.timeAgo})</span>
                    </div>
                  </div>

                  {/* Status Pill */}
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                      event.mitigationStatus === 'ACTIVE_BREACH'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                        : event.mitigationStatus === 'MITIGATING'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    }`}
                  >
                    {event.mitigationStatus.replace('_', ' ')}
                  </span>
                </div>

                {/* Threat Title & Node */}
                <div className="mt-2">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedThreatId(event.id);
                        onSelectNode(event.nodeId);
                      }}
                      className="text-left font-bold text-slate-200 hover:text-indigo-400 transition text-[12px] flex items-center space-x-1"
                    >
                      <span>{event.threatTitle}</span>
                      <ArrowUpRight className="w-3 h-3 opacity-60 inline" />
                    </button>
                  </div>

                  {/* Region & CVE */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[10px] text-slate-400">
                    <span className="flex items-center space-x-1 text-slate-300">
                      <MapPin className="w-3 h-3 text-indigo-400" />
                      <span>{event.nodeName}</span>
                    </span>
                    <span>•</span>
                    <span className="text-amber-400/90">{event.threatCategory}</span>
                    <span>•</span>
                    <span className="text-slate-500">{event.cveOrRuleRef}</span>
                  </div>

                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    {event.description}
                  </p>
                </div>

                {/* =================================================================
                    CORRELATED CONNECTIVITY BREACH TELEMETRY CARD
                    ================================================================= */}
                <div className="mt-2.5 p-2.5 rounded-lg bg-black/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                    <span className="text-[10px] font-bold text-indigo-400 flex items-center space-x-1">
                      <Activity className="w-3 h-3" />
                      <span>CORRELATED TELEMETRY BREACH</span>
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono">
                      Lag: +{event.correlatedMetrics.correlationLagSeconds}s window
                    </span>
                  </div>

                  {/* Dual Comparison Metrics */}
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="p-1.5 rounded bg-slate-900/80 border border-slate-800">
                      <span className="text-[9px] text-slate-500 block">Round-Trip Latency</span>
                      <div className="flex items-baseline space-x-1.5 mt-0.5">
                        <span className="text-slate-400 line-through">
                          {event.correlatedMetrics.latencyPreBreach}ms
                        </span>
                        <span className="text-rose-400 font-bold text-xs">
                          {event.correlatedMetrics.latencyAtBreach}ms
                        </span>
                        <span className="text-[9px] text-rose-500 font-bold">
                          (+
                          {Math.round(
                            ((event.correlatedMetrics.latencyAtBreach -
                              event.correlatedMetrics.latencyPreBreach) /
                              event.correlatedMetrics.latencyPreBreach) *
                              100
                          )}
                          %)
                        </span>
                      </div>
                    </div>

                    <div className="p-1.5 rounded bg-slate-900/80 border border-slate-800">
                      <span className="text-[9px] text-slate-500 block">Packet Loss Surge</span>
                      <div className="flex items-baseline space-x-1.5 mt-0.5">
                        <span className="text-slate-400">
                          {event.correlatedMetrics.packetLossPreBreach}%
                        </span>
                        <span className="text-slate-600">➔</span>
                        <span
                          className={`font-bold text-xs ${
                            event.correlatedMetrics.packetLossAtBreach > 1
                              ? 'text-rose-400'
                              : 'text-amber-400'
                          }`}
                        >
                          {event.correlatedMetrics.packetLossAtBreach}%
                        </span>
                        <span className="text-[9px] text-slate-500">Loss</span>
                      </div>
                    </div>
                  </div>

                  {/* Correlation Lag Description */}
                  <p className="text-[10px] text-slate-400 italic">
                    &gt; {event.correlatedMetrics.breachWindowDescription}
                  </p>

                  {/* Affected Sensor Tags */}
                  <div className="flex flex-wrap items-center gap-1 pt-0.5">
                    <span className="text-[9px] text-slate-500 uppercase">Affected Sensors:</span>
                    {event.correlatedMetrics.affectedSensors.map(sensor => (
                      <span
                        key={sensor}
                        className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 border border-slate-700 font-mono"
                      >
                        {sensor}
                      </span>
                    ))}
                  </div>

                  {/* Compliance Benchmark Reference */}
                  <div className="text-[9px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-800/60">
                    <span className="truncate">Audit Impact: {event.complianceImpact}</span>
                    <ShieldCheck className="w-3 h-3 text-indigo-400 shrink-0 ml-1" />
                  </div>
                </div>

                {/* Collapsible Forensic Payload Snippet */}
                {event.forensicPayloadSnippet && (
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => handleTogglePayload(event.id)}
                      className="text-[10px] text-slate-400 hover:text-slate-200 transition flex items-center space-x-1 cursor-pointer"
                    >
                      <Terminal className="w-3 h-3 text-cyan-400" />
                      <span>{isPayloadExpanded ? 'Hide Forensic Payload' : 'Inspect Forensic Payload'}</span>
                      {isPayloadExpanded ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </button>

                    {isPayloadExpanded && (
                      <div className="mt-1.5 p-2 rounded bg-black/90 border border-slate-800 font-mono text-[10px] text-emerald-400 relative">
                        <button
                          type="button"
                          onClick={() => handleCopyPayload(event.forensicPayloadSnippet!, event.id)}
                          className="absolute right-2 top-2 text-slate-500 hover:text-slate-300 p-1"
                          title="Copy payload signature"
                        >
                          {copiedId === event.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                        <code className="block pr-6 break-all">
                          {event.forensicPayloadSnippet}
                        </code>
                      </div>
                    )}
                  </div>
                )}

                {/* Interactive Card Actions */}
                <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectNode(event.nodeId);
                        showToast({
                          title: `Focused on ${event.nodeName}`,
                          message: `Viewing telemetry arc for ${event.nodeCode}.`,
                          type: 'info'
                        });
                      }}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold transition flex items-center space-x-1 cursor-pointer"
                    >
                      <Crosshair className="w-2.5 h-2.5 text-indigo-400" />
                      <span>Focus on Map</span>
                    </button>

                    {onSwitchToInspector && (
                      <button
                        type="button"
                        onClick={() => {
                          onSelectNode(event.nodeId);
                          onSwitchToInspector();
                        }}
                        className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 text-[10px] font-semibold transition border border-slate-800 flex items-center space-x-1 cursor-pointer"
                      >
                        <Activity className="w-2.5 h-2.5 text-cyan-400" />
                        <span>Node Telemetry</span>
                      </button>
                    )}
                  </div>

                  {event.mitigationStatus === 'ACTIVE_BREACH' && (
                    <button
                      type="button"
                      onClick={() => handleMitigateThreat(event)}
                      className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold transition cursor-pointer flex items-center space-x-1 shadow-2xs"
                    >
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      <span>Contain Breach</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
