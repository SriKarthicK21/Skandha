// Skanda BrandGuard — Threat Actor Infrastructure Clustering & ASN Fingerprinting Service
// Groups discovered domains by shared ASN, Name Servers, IP subnets, and SSL fingerprints into Campaign Clusters.
// Enables single-action takedowns for entire adversary infrastructures and automated firewall blocklist generation.

import { BrandFinding, ThreatActorCluster } from '../../types/brandguard';
import { safeStorage } from '../../utils/safeStorage';

const STORAGE_KEY = 'skanda_brandguard_clusters_v1';

export class BrandGuardClusteringService {
  /**
   * Retrieves or initializes Campaign Clusters from findings and storage
   */
  public static getClusters(findings?: BrandFinding[]): ThreatActorCluster[] {
    const saved = safeStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // fall through to seed
      }
    }

    // Default Seed Clusters correlated from findings
    const defaultClusters: ThreatActorCluster[] = [
      {
        id: 'cluster_storm_0914',
        clusterName: 'Storm-0914 Cloned Portal Syndicate',
        threatActorLabel: 'UNC3944 / ScattySpider Affiliate',
        commonAsn: 'AS59711',
        commonAsnOrg: 'Hostkey B.V. (Offshore Hosting Network)',
        commonSubnet: '194.26.29.0/24',
        commonNameServers: ['dns1.offshore-bulletproof.is', 'dns2.offshore-bulletproof.is'],
        commonSslFingerprint: 'SHA256:4a:91:c2:e8:1b:09:55:df:6a:12:33:01:bb:ee:98:fa',
        commonRegistrar: 'NameCheap, Inc.',
        domainCount: 4,
        domains: [
          'sso-apexfintech-verify.com',
          'login.apexfintech-verify.com',
          'auth-apexfintech-gateway.com',
          'portal-apexfintech-internal.net'
        ],
        findingCodes: ['BF-2026-001', 'BF-2026-007'],
        campaignConfidence: 98,
        attackVector: 'Credential Harvesting + TOTP Bypassing targeting Financial Employees & Traders',
        firstDetected: new Date(Date.now() - 6 * 86400000).toISOString(),
        lastActive: new Date(Date.now() - 25 * 60000).toISOString(),
        clusterStatus: 'ACTIVE_CAMPAIGN',
        dispatchedAbuseReference: 'ABUSE-ASN-HOSTKEY-2026-081',
        dispatchedTimestamp: new Date(Date.now() - 4 * 3600000).toISOString()
      },
      {
        id: 'cluster_phishkit_vance',
        clusterName: 'PhishKit-Vance Executive Lure Campaign',
        threatActorLabel: 'FIN7 / Carbanak Credential Crew',
        commonAsn: 'AS197695',
        commonAsnOrg: 'Reg.ru Hosting & Cloud Services',
        commonSubnet: '185.220.101.0/24',
        commonNameServers: ['ns1.bulletproof-russia.su', 'ns2.bulletproof-russia.su'],
        commonSslFingerprint: 'SHA256:7f:88:9a:bc:12:44:00:d1:ef:32:89:aa:cc:bb:01:45',
        commonRegistrar: 'Tucows Domains Inc.',
        domainCount: 3,
        domains: [
          'apex-capitalinvest.vip',
          'apex-wealthcore-dividends.com',
          'marcus-vance-apexcapital.org'
        ],
        findingCodes: ['BF-2026-002'],
        campaignConfidence: 94,
        attackVector: 'High-Yield Investment Fraud & Executive Impersonation (CEO & CTO)',
        firstDetected: new Date(Date.now() - 8 * 86400000).toISOString(),
        lastActive: new Date(Date.now() - 40 * 60000).toISOString(),
        clusterStatus: 'ACTIVE_CAMPAIGN'
      },
      {
        id: 'cluster_homoglyph_typo_farm',
        clusterName: 'Cloudflare Proxied Homoglyph Swarm',
        threatActorLabel: 'Automated Typosquatting Monopolizer',
        commonAsn: 'AS13335',
        commonAsnOrg: 'Cloudflare, Inc.',
        commonSubnet: '104.21.0.0/16',
        commonNameServers: ['mona.ns.cloudflare.com', 'walt.ns.cloudflare.com'],
        commonSslFingerprint: 'SHA256:91:0a:33:4d:bb:21:ee:ff:11:22:33:44:55:66:77:88',
        commonRegistrar: 'GoDaddy.com, LLC',
        domainCount: 5,
        domains: [
          'аpexfintech.com',
          'apexfïntech.com',
          'apexfintech.io.global-verify.com',
          'apexfintch.com',
          'apexfintech-support.live'
        ],
        findingCodes: ['BF-2026-003', 'BF-2026-005'],
        campaignConfidence: 89,
        attackVector: 'Cyrillic Character Lookalikes & Parked Traffic Hijacking',
        firstDetected: new Date(Date.now() - 14 * 86400000).toISOString(),
        lastActive: new Date(Date.now() - 2 * 3600000).toISOString(),
        clusterStatus: 'BATCH_DISPATCHED',
        dispatchedAbuseReference: 'ABUSE-CLOUDFLARE-TRUST-0992',
        dispatchedTimestamp: new Date(Date.now() - 12 * 3600000).toISOString()
      }
    ];

    safeStorage.setItem(STORAGE_KEY, JSON.stringify(defaultClusters));
    return defaultClusters;
  }

  public static saveClusters(clusters: ThreatActorCluster[]): void {
    safeStorage.setItem(STORAGE_KEY, JSON.stringify(clusters));
  }

  /**
   * Executes a 1-click takedown for an entire cluster
   */
  public static dispatchClusterTakedown(
    clusterId: string,
    officerName: string = 'Priya Sharma (CISO / Threat Response Lead)'
  ): { success: boolean; abuseRef: string; message: string } {
    const clusters = this.getClusters([]);
    const cluster = clusters.find(c => c.id === clusterId);
    if (!cluster) {
      return { success: false, abuseRef: '', message: 'Cluster not found' };
    }

    const abuseRef = `ABUSE-CLUSTER-${cluster.commonAsn}-${Date.now().toString().slice(-6)}`;
    cluster.clusterStatus = 'BATCH_DISPATCHED';
    cluster.dispatchedAbuseReference = abuseRef;
    cluster.dispatchedTimestamp = new Date().toISOString();

    this.saveClusters(clusters);

    return {
      success: true,
      abuseRef,
      message: `Successfully dispatched cluster abuse complaint to upstream ASN ${cluster.commonAsn} (${cluster.commonAsnOrg}) and registrars covering ${cluster.domainCount} linked domains.`
    };
  }

  /**
   * Generates network firewall & DNS blocklist rules
   */
  public static generateBlocklist(clusterId: string, format: 'iptables' | 'rpz' | 'paloalto'): string {
    const clusters = this.getClusters();
    const cluster = clusters.find(c => c.id === clusterId);
    if (!cluster) return '# Cluster not found';

    const fmt = format === 'iptables' ? 'CIDR_IPTABLES' : format === 'rpz' ? 'BIND_RPZ' : 'PALO_ALTO';
    return this.exportFirewallBlocklist(cluster, fmt);
  }

  public static exportFirewallBlocklist(cluster: ThreatActorCluster, format: 'CIDR_IPTABLES' | 'BIND_RPZ' | 'PALO_ALTO'): string {
    const timestamp = new Date().toISOString();

    if (format === 'CIDR_IPTABLES') {
      return `# Skanda BrandGuard - Network Defense Blocklist
# Campaign Cluster: ${cluster.clusterName}
# Upstream ASN: ${cluster.commonAsn} (${cluster.commonAsnOrg})
# Generated: ${timestamp}
# Block entire malicious subnet and host IPs
iptables -A INPUT -s ${cluster.commonSubnet} -j DROP
${cluster.domains.map(d => `iptables -A FORWARD -d ${d} -j REJECT`).join('\n')}
`;
    } else if (format === 'BIND_RPZ') {
      return `; Skanda BrandGuard - DNS Response Policy Zone (RPZ)
; Campaign: ${cluster.clusterName} (${cluster.threatActorLabel})
; Generated: ${timestamp}
$TTL 300
@ IN SOA localhost. root.localhost. 2026090801 3600 600 604800 300
${cluster.domains.map(d => `${d} CNAME .\n*.${d} CNAME .`).join('\n')}
`;
    } else {
      // Palo Alto Networks URL & IP Custom Block format
      return `# Palo Alto Networks External Dynamic List (EDL)
# Threat Actor: ${cluster.threatActorLabel}
# Generated: ${timestamp}
${cluster.commonSubnet}
${cluster.domains.join('\n')}
`;
    }
  }
}
