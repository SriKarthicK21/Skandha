// ============================================================================
// SKANDA ENTERPRISE GRC: SSRF PROTECTION & OUTBOUND WEBHOOK VALIDATOR
// Path: server/services/SsrfProtectionService.ts
//
// Protects all outbound webhooks, connector pings, and notification calls
// against Server-Side Request Forgery (SSRF) and Cloud Metadata exfiltration.
//
// Blocks:
// - Loopback addresses (127.0.0.1, localhost, ::1)
// - RFC 1918 Private Ranges (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16)
// - AWS / Cloud Instance Metadata (169.254.169.254, 169.254.0.0/16)
// - Carrier-Grade NAT (100.64.0.0/10)
// - Link-local IPv6 (fe80::/10, fc00::/7)
// - Internal domain suffixes (.internal, .local, .corp, .lan, .intranet, .onion)
// - Suspicious URL schemes (file://, gopher://, dict://, ftp://, ldap://)
// ============================================================================

import dns from 'dns';
import { promises as dnsPromises } from 'dns';
import { URL } from 'url';

export interface SsrfValidationResult {
  allowed: boolean;
  sanitizedUrl?: string;
  blockedReason?: string;
  resolvedIp?: string;
}

export class SsrfProtectionService {
  private static instance: SsrfProtectionService;

  // Blocked CIDRs and IP patterns
  private blockedIpPatterns = [
    /^127\./,                         // Loopback (127.0.0.0/8)
    /^0\./,                           // Current network
    /^10\./,                          // RFC 1918 Class A (10.0.0.0/8)
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // RFC 1918 Class B (172.16.0.0/12)
    /^192\.168\./,                    // RFC 1918 Class C (192.168.0.0/16)
    /^169\.254\./,                    // Link-Local / Cloud Metadata (169.254.0.0/16)
    /^100\.(6[4-9]|[7-9][0-9]|1[0-1][0-9]|12[0-7])\./, // CGNAT (100.64.0.0/10)
    /^192\.0\.2\./,                   // TEST-NET-1
    /^198\.51\.100\./,                // TEST-NET-2
    /^203\.0\.113\./,                 // TEST-NET-3
    /^224\./,                         // Multicast
    /^240\./                          // Reserved
  ];

  private blockedHostnames = [
    'localhost',
    'localhost.localdomain',
    'broadcasthost',
    'metadata.google.internal',
    'instance-data'
  ];

  private blockedDomainSuffixes = [
    '.local',
    '.internal',
    '.corp',
    '.lan',
    '.intranet',
    '.onion',
    '.localhost',
    '.invalid',
    '.vpc'
  ];

  private constructor() {}

  public static getInstance(): SsrfProtectionService {
    if (!SsrfProtectionService.instance) {
      SsrfProtectionService.instance = new SsrfProtectionService();
    }
    return SsrfProtectionService.instance;
  }

  /**
   * Evaluates if an IPv4 or IPv6 string is private, loopback, or metadata.
   */
  public isPrivateOrReservedIp(ip: string): boolean {
    const trimmed = ip.trim().toLowerCase();

    // Check IPv6 loopback / unique local / link-local
    if (trimmed === '::1' || trimmed === '::' || trimmed.startsWith('fe80:') || trimmed.startsWith('fc00:') || trimmed.startsWith('fd00:')) {
      return true;
    }

    // Check IPv4-mapped IPv6 (e.g. ::ffff:127.0.0.1)
    if (trimmed.startsWith('::ffff:')) {
      const ipv4Part = trimmed.substring(7);
      return this.isPrivateOrReservedIp(ipv4Part);
    }

    // Check IPv4 patterns
    for (const pattern of this.blockedIpPatterns) {
      if (pattern.test(trimmed)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Validates target URL against SSRF attack vectors.
   * Performs protocol inspection, hostname checks, and DNS resolution validation.
   */
  public async validateWebhookUrl(rawUrl: string): Promise<SsrfValidationResult> {
    if (!rawUrl || typeof rawUrl !== 'string') {
      return { allowed: false, blockedReason: 'URL is required and must be a string' };
    }

    let parsed: URL;
    try {
      parsed = new URL(rawUrl.trim());
    } catch {
      return { allowed: false, blockedReason: 'Malformed URL structure' };
    }

    // 1. Enforce HTTPS or HTTP (reject file://, gopher://, dict://, etc.)
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { allowed: false, blockedReason: `Forbidden protocol scheme: ${parsed.protocol}. Only HTTP/HTTPS allowed.` };
    }

    // 2. Reject credentials in URL (e.g. http://user:pass@host)
    if (parsed.username || parsed.password) {
      return { allowed: false, blockedReason: 'Embedded userinfo credentials are not permitted in webhook URLs' };
    }

    // 3. Reject non-standard ports for production webhooks (permit 80, 443, 8443)
    const port = parsed.port ? parseInt(parsed.port, 10) : (parsed.protocol === 'https:' ? 443 : 80);
    const allowedPorts = [80, 443, 8443];
    if (process.env.NODE_ENV === 'production' && !allowedPorts.includes(port)) {
      return { allowed: false, blockedReason: `Non-standard port ${port} is blocked in production. Allowed ports: 80, 443, 8443.` };
    }

    const hostname = parsed.hostname.toLowerCase();

    // 4. Reject exact blocked hostnames
    if (this.blockedHostnames.includes(hostname)) {
      return { allowed: false, blockedReason: `Blocked local or metadata hostname: ${hostname}` };
    }

    // 5. Reject blocked private domain suffixes
    for (const suffix of this.blockedDomainSuffixes) {
      if (hostname.endsWith(suffix)) {
        return { allowed: false, blockedReason: `Internal domain suffix not permitted: ${suffix}` };
      }
    }

    // 6. Direct IP Check
    if (this.isPrivateOrReservedIp(hostname)) {
      return { allowed: false, blockedReason: `Direct reference to private, loopback, or metadata IP: ${hostname}` };
    }

    // 7. DNS Resolution Check (Prevent DNS Rebinding to 127.0.0.1 or 169.254.169.254)
    try {
      const records = await dnsPromises.lookup(hostname, { all: true });
      for (const record of records) {
        if (this.isPrivateOrReservedIp(record.address)) {
          return {
            allowed: false,
            blockedReason: `Host "${hostname}" resolves to private/internal IP address: ${record.address}`,
            resolvedIp: record.address
          };
        }
      }

      return {
        allowed: true,
        sanitizedUrl: parsed.toString(),
        resolvedIp: records[0]?.address
      };
    } catch (err: any) {
      // If DNS resolution fails, block the request
      return {
        allowed: false,
        blockedReason: `DNS resolution failed for hostname "${hostname}": ${err.message}`
      };
    }
  }
}

export const ssrfProtectionService = SsrfProtectionService.getInstance();
