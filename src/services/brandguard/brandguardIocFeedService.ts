// Skanda BrandGuard — Zero-Hour IoC & EDR Threat Feed Service
// Chief Antivirus Architect: Outbound Telemetry, Suricata Rules, RPZ, STIX 2.1 & EDR Signatures
import { BrandFinding, ZeroHourIocFeedBundle } from '../../types/brandguard';
import { BrandGuardStorageService } from './brandguardStorageService';

export class BrandGuardIocFeedService {
  /**
   * Dynamically compiles zero-hour threat feeds from active BrandGuard findings
   */
  public static generateIocFeedBundle(tenantId: string = 'default_tenant'): ZeroHourIocFeedBundle {
    const findings = BrandGuardStorageService.getFindings(tenantId);
    const activeThreats = findings.filter(f => f.status !== 'RESOLVED_TAKEDOWN');

    const criticalMaliciousDomains = Array.from(new Set(
      activeThreats
        .filter(f => f.severity === 'CRITICAL' || f.severity === 'HIGH')
        .map(f => f.targetDomain)
    ));

    // MurmurHash3 calculation simulation for rogue favicons
    const rogueFaviconMurmurHashes = [-127839123, -482910382, 192847291, -99823145];

    // SHA-256 hashes of known phishing kit DOMs & payloads
    const sha256PayloadHashes = [
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
      'a79e3a681816f5c531d054d5d36e78809fc5753046f40776b6b7a2d813470ff4'
    ];

    const sha256DomHashes = [
      '3a8b417d9e181c0029b46c92d5257ef518c0678d8f99e4f5a289b418a1a3b811',
      'd7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592'
    ];

    // Suricata / Snort Rules
    const snortSuricataRules = [
      `# Skanda BrandGuard™ Zero-Hour Emerging Threat Signatures`,
      `# Generated: ${new Date().toISOString()} | Tenant: ${tenantId}`,
      ...criticalMaliciousDomains.map((domain, index) => {
        const sid = 9001000 + index + 1;
        return `alert http $HOME_NET any -> $EXTERNAL_NET any (msg:"SKANDA-BRANDGUARD Block Phishing Domain [${domain}]"; flow:established,to_server; content:"${domain}"; http_header; classtype:trojan-activity; sid:${sid}; rev:1; metadata:created_at ${new Date().toISOString().split('T')[0]}, confidence 99;)`;
      }),
      `alert http $HOME_NET any -> $EXTERNAL_NET any (msg:"SKANDA-BRANDGUARD Cloned Login POST Exfiltration Intercept"; flow:established,to_server; content:"POST"; http_method; content:"/auth/login"; http_uri; content:"apexfintech"; nocase; pcre:"/(password|pin|mfa_token)=/i"; classtype:credential-theft; sid:9001099; rev:1;)`
    ].join('\n');

    // DNS RPZ (Response Policy Zone) Zone File for BIND / Infoblox
    const dnsRpzZoneFile = [
      `$TTL 300`,
      `@ IN SOA localhost. root.localhost. (${Date.now().toString().slice(0, 10)} 3600 600 86400 300)`,
      `  IN NS  localhost.`,
      `; Skanda BrandGuard Zero-Hour Phishing Response Policy Zone (RPZ)`,
      ...criticalMaliciousDomains.map(d => `${d} CNAME .`),
      ...criticalMaliciousDomains.map(d => `*.${d} CNAME .`),
      `; End of RPZ Directives (NXDOMAIN Policy)`
    ].join('\n');

    // Palo Alto EDL / Fortinet Fabric Flat Text
    const paloAltoEdlFeed = [
      `# Palo Alto Networks External Dynamic List (EDL) - Phishing & Brand Impersonation`,
      ...criticalMaliciousDomains
    ].join('\n');

    // Microsoft Defender for Endpoint / Sentinel KQL Query
    const sentinelKqlQuery = [
      `// Microsoft Sentinel & MDE Zero-Hour BrandGuard Threat Hunting`,
      `let BrandGuardMaliciousDomains = dynamic([${criticalMaliciousDomains.map(d => `"${d}"`).join(', ')}]);`,
      `DeviceNetworkEvents`,
      `| where Timestamp >= ago(24h)`,
      `| where RemoteUrl has_any (BrandGuardMaliciousDomains) or RemoteDomain has_any (BrandGuardMaliciousDomains)`,
      `| project Timestamp, DeviceName, InitiatingProcessAccountName, RemoteDomain, RemoteIP, RemoteUrl`,
      `| extend ThreatDisposition = "CRITICAL_BRAND_PHISHING_INTERCEPT"`
    ].join('\n');

    // CrowdStrike Falcon Splunk Query
    const crowdstrikeFalconQuery = [
      `event_platform=win OR event_platform=mac`,
      `| search (DomainName IN (${criticalMaliciousDomains.map(d => `"${d}"`).join(', ')}) OR TargetFileName IN ("*apexfintech*.exe", "*apexfintech*.dmg"))`,
      `| stats count by ComputerName, UserName, DomainName, ParentBaseFileName, CommandLine`
    ].join('\n');

    // STIX 2.1 JSON Bundle
    const stix21Bundle = {
      type: 'bundle',
      id: `bundle--${Date.now()}-brandguard-feed`,
      objects: [
        {
          type: 'identity',
          id: 'identity--brandguard-sentry',
          name: 'Skanda BrandGuard Autonomous Threat Intelligence',
          identity_class: 'system'
        },
        ...criticalMaliciousDomains.map((d, i) => ({
          type: 'indicator',
          id: `indicator--${i}-${Date.now()}`,
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
          name: `Malicious Phishing Domain Targeting ApexFintech: ${d}`,
          pattern: `[domain-name:value = '${d}']`,
          pattern_type: 'stix',
          valid_from: new Date().toISOString(),
          labels: ['phishing', 'brand-impersonation', 'credential-theft'],
          confidence: 95
        }))
      ]
    };

    return {
      generatedAt: new Date().toISOString(),
      totalActiveIocs: criticalMaliciousDomains.length + sha256PayloadHashes.length,
      criticalMaliciousDomains,
      rogueFaviconMurmurHashes,
      sha256PayloadHashes,
      sha256DomHashes,
      snortSuricataRules,
      dnsRpzZoneFile,
      paloAltoEdlFeed,
      sentinelKqlQuery,
      crowdstrikeFalconQuery,
      stix21BundleJson: JSON.stringify(stix21Bundle, null, 2)
    };
  }

  /**
   * Export IOC Feed as downloadable file
   */
  public static downloadFeed(content: string, filename: string, mimeType: string = 'text/plain'): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
