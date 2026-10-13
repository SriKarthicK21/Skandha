// Skanda BrandGuard — Weaponization State Machine & Threat Intelligence Enrichment Service
// Tracks domain lifecycle transitions (Parked -> MX/SPF -> Live HTTP -> Weaponized Harvester)
// Provides automated ASN/Hosting reputation scoring, passive DNS correlation, and SSE stream worker simulation.

import {
  BrandFinding,
  WeaponizationLifecycleRecord,
  WeaponizationStage,
  WeaponizationTransitionEvent,
  EnrichedDnsThreatIntel,
  AsnReputationScorecard,
  PassiveDnsEntry
} from '../../types/brandguard';

export class BrandGuardWeaponizationService {
  /**
   * Generates or retrieves the weaponization state for a finding based on its technical telemetry.
   */
  public static computeWeaponizationLifecycle(finding: BrandFinding): WeaponizationLifecycleRecord {
    if (finding.weaponization) {
      return finding.weaponization;
    }

    const hasLogin = finding.webPageAnalysis.detectedForms.hasLoginForm || finding.webPageAnalysis.detectedForms.hasPasswordInput;
    const highSimilarity = (finding.logoSimilarityScore >= 80 || finding.websiteVisualSimilarityScore >= 75);
    const hasMx = finding.domainIntel.emailSecurity.hasMx;
    const isLiveHttp = finding.webPageAnalysis.httpMetadata.statusCode >= 200 && finding.webPageAnalysis.httpMetadata.statusCode < 400;

    let stage: WeaponizationStage = 'REGISTERED_PARKED';
    let score = 15;
    let priority: WeaponizationLifecycleRecord['escalationPriority'] = 'P3_DORMANT_SURVEILLANCE';

    if (hasLogin && highSimilarity) {
      stage = 'WEAPONIZED_CREDENTIAL_HARVEST';
      score = 95;
      priority = 'P1_CRITICAL_IMMOBILIZE';
    } else if (isLiveHttp) {
      stage = 'LIVE_HTTP_HTTPS';
      score = 65;
      priority = 'P2_ELEVATED_WATCH';
    } else if (hasMx) {
      stage = 'MX_SPF_CONFIGURED';
      score = 50;
      priority = 'P2_ELEVATED_WATCH';
    }

    const transitionEvents: WeaponizationTransitionEvent[] = [
      {
        id: `trans_${finding.id}_1`,
        timestamp: new Date(Date.now() - 4 * 86400000).toISOString(),
        fromStage: 'REGISTERED_PARKED',
        toStage: hasMx ? 'MX_SPF_CONFIGURED' : 'LIVE_HTTP_HTTPS',
        triggerDescription: hasMx 
          ? 'DNS surveillance detected active MX mail exchanger registration (SPF/DMARC permissive).'
          : 'HTTP probe verified TLS certificate provisioning and live NGINX reverse proxy response.',
        alertEscalated: true,
        technicalDeltas: {
          dnsChange: 'Added MX records with priority 10 pointing to mail-relay.',
          httpStatus: 200
        }
      }
    ];

    if (stage === 'WEAPONIZED_CREDENTIAL_HARVEST') {
      transitionEvents.push({
        id: `trans_${finding.id}_2`,
        timestamp: new Date(Date.now() - 3 * 3600000).toISOString(),
        fromStage: 'LIVE_HTTP_HTTPS',
        toStage: 'WEAPONIZED_CREDENTIAL_HARVEST',
        triggerDescription: 'CRITICAL ESCALATION: Sandbox DOM crawler detected interactive login password input matching corporate SSO visual theme.',
        alertEscalated: true,
        technicalDeltas: {
          httpStatus: 200,
          visualSimilarityJump: 92
        }
      });
    }

    return {
      currentStage: stage,
      weaponizationScore: score,
      lastTransitionAt: transitionEvents[transitionEvents.length - 1]?.timestamp || finding.firstSeen,
      escalationPriority: priority,
      stateMachineHistory: transitionEvents,
      activeThreatIndicators: {
        isParkedAdFarm: stage === 'REGISTERED_PARKED',
        hasActiveMailExchange: hasMx,
        isResolvingHttp: isLiveHttp,
        hasInteractiveForms: hasLogin,
        brandMarkDetected: highSimilarity
      }
    };
  }

  /**
   * Evaluates ASN threat reputation and hosting provider abuse responsiveness.
   */
  public static getAsnScorecard(asn: string, asnOrg: string): AsnReputationScorecard {
    const isBulletproof = asn.includes('59711') || asnOrg.toLowerCase().includes('bulletproof') || asnOrg.toLowerCase().includes('hostkey');
    const isHyperscaler = asnOrg.toLowerCase().includes('amazon') || asnOrg.toLowerCase().includes('cloudflare') || asnOrg.toLowerCase().includes('google');

    if (isBulletproof) {
      return {
        asn: asn || 'AS59711',
        asnOrg: asnOrg || 'Hostkey Offshore Infrastructure',
        asnCountry: 'NL / Offshore',
        reputationCategory: 'BULLETPROOF_OFFSHORE',
        threatIndex: 92,
        hostingAbuseResponsivenessScore: 12, // extremely uncooperative
        averageTakedownTurnaroundHours: 96,
        abuseContactEmail: 'abuse@offshore-bulletproof.is',
        isBulletproofSuspect: true,
        networkPrefix: '194.26.29.0/24'
      };
    }

    if (isHyperscaler) {
      return {
        asn: asn || 'AS13335',
        asnOrg: asnOrg || 'Cloudflare, Inc.',
        asnCountry: 'US',
        reputationCategory: 'TIER1_HYPERSCALER',
        threatIndex: 25,
        hostingAbuseResponsivenessScore: 94, // rapid takedown via API
        averageTakedownTurnaroundHours: 3.5,
        abuseContactEmail: 'abuse@cloudflare.com',
        isBulletproofSuspect: false,
        networkPrefix: '104.21.0.0/16'
      };
    }

    return {
      asn: asn || 'AS20940',
      asnOrg: asnOrg || 'Akamai Technologies',
      asnCountry: 'DE',
      reputationCategory: 'STANDARD_HOST',
      threatIndex: 45,
      hostingAbuseResponsivenessScore: 82,
      averageTakedownTurnaroundHours: 12,
      abuseContactEmail: 'abuse-desk@akamai.com',
      isBulletproofSuspect: false,
      networkPrefix: '23.192.0.0/14'
    };
  }

  /**
   * Enriches domain intelligence with passive DNS and threat feed cross-correlations.
   */
  public static enrichDnsThreatIntel(domain: string, asn: string, asnOrg: string): EnrichedDnsThreatIntel {
    const pDnsHistory: PassiveDnsEntry[] = [
      {
        timestamp: new Date(Date.now() - 30 * 86400000).toISOString(),
        recordType: 'A',
        value: '198.51.100.44',
        ttl: 3600,
        firstSeen: new Date(Date.now() - 35 * 86400000).toISOString(),
        lastSeen: new Date(Date.now() - 28 * 86400000).toISOString()
      },
      {
        timestamp: new Date(Date.now() - 5 * 86400000).toISOString(),
        recordType: 'A',
        value: '194.26.29.114',
        ttl: 300,
        firstSeen: new Date(Date.now() - 5 * 86400000).toISOString(),
        lastSeen: new Date().toISOString()
      },
      {
        timestamp: new Date(Date.now() - 4 * 86400000).toISOString(),
        recordType: 'MX',
        value: 'mail.offshore-bulletproof.is (Pri: 10)',
        ttl: 600,
        firstSeen: new Date(Date.now() - 4 * 86400000).toISOString(),
        lastSeen: new Date().toISOString()
      }
    ];

    const asnScorecard = this.getAsnScorecard(asn, asnOrg);

    return {
      domain,
      passiveDnsHistory: pDnsHistory,
      asnScorecard,
      threatFeedMatches: [
        {
          source: 'SPAMHAUS_DBL',
          listed: true,
          confidence: 96,
          category: 'Abusive Phishing Domain'
        },
        {
          source: 'PHISHTANK',
          listed: true,
          confidence: 99,
          category: 'Verified Online Phish'
        },
        {
          source: 'URLHAUS',
          listed: false,
          confidence: 0,
          category: 'Clean'
        },
        {
          source: 'VIRUSTOTAL_COMMUNITY',
          listed: true,
          confidence: 14,
          category: '14/92 Security Vendors Flagged Malicious'
        }
      ],
      ipGeolocation: {
        country: 'Netherlands',
        city: 'Amsterdam',
        latitude: 52.3676,
        longitude: 4.9041
      },
      nameserverReputation: {
        isKnownFastFlux: false,
        nameservers: ['dns1.offshore-bulletproof.is', 'dns2.offshore-bulletproof.is'],
        sharedMaliciousDomainsCount: 18
      }
    };
  }

  /**
   * Promotes or updates finding weaponization state.
   */
  public static triggerWeaponizationTransition(
    finding: BrandFinding,
    targetStage: WeaponizationStage,
    reason: string
  ): WeaponizationLifecycleRecord {
    const current = this.computeWeaponizationLifecycle(finding);
    const newEvent: WeaponizationTransitionEvent = {
      id: `trans_${Date.now()}`,
      timestamp: new Date().toISOString(),
      fromStage: current.currentStage,
      toStage: targetStage,
      triggerDescription: reason,
      alertEscalated: targetStage === 'WEAPONIZED_CREDENTIAL_HARVEST' || targetStage === 'MX_SPF_CONFIGURED',
      technicalDeltas: {
        dnsChange: 'Analyst / Scanner state transition verified.',
        httpStatus: 200
      }
    };

    let score = 20;
    let priority: WeaponizationLifecycleRecord['escalationPriority'] = 'P3_DORMANT_SURVEILLANCE';
    if (targetStage === 'WEAPONIZED_CREDENTIAL_HARVEST') {
      score = 98;
      priority = 'P1_CRITICAL_IMMOBILIZE';
    } else if (targetStage === 'LIVE_HTTP_HTTPS') {
      score = 70;
      priority = 'P2_ELEVATED_WATCH';
    } else if (targetStage === 'MX_SPF_CONFIGURED') {
      score = 55;
      priority = 'P2_ELEVATED_WATCH';
    }

    return {
      currentStage: targetStage,
      weaponizationScore: score,
      lastTransitionAt: newEvent.timestamp,
      escalationPriority: priority,
      stateMachineHistory: [newEvent, ...current.stateMachineHistory],
      activeThreatIndicators: {
        ...current.activeThreatIndicators,
        hasInteractiveForms: targetStage === 'WEAPONIZED_CREDENTIAL_HARVEST',
        hasActiveMailExchange: targetStage === 'MX_SPF_CONFIGURED' || targetStage === 'WEAPONIZED_CREDENTIAL_HARVEST'
      }
    };
  }
}
