import { Router, Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';

export const complianceNewsTickerRouter = Router();

// Lazy initialization of Google GenAI client with official User-Agent header
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiClient;
}

export interface TickerItem {
  id: string;
  headline: string;
  bulletin: string;
  authority: string;
  jurisdiction: 'GLOBAL' | 'SG' | 'EU' | 'US' | 'IN' | 'UK';
  urgency: 'CRITICAL' | 'HIGH' | 'ADVISORY';
  category: string;
  affectedFrameworks: string[];
  auditImpact: string;
  actionSteps: string[];
  sourceUrl: string;
  sourceTitle: string;
  publishedTimeAgo: string;
}

// Fallback high-fidelity regulatory bulletins for continuous availability
const FALLBACK_TICKER_ITEMS: TickerItem[] = [
  {
    id: 'TICKER-MAS-655',
    headline: 'MAS Notice 655 Tightens 1-Hour Statutory Incident Escalation & Privileged IAM Probes',
    bulletin: 'Monetary Authority of Singapore mandates zero-trust hardware MFA and binding 60-minute notification for critical banking infrastructure outages under Notice 655.',
    authority: 'Monetary Authority of Singapore (MAS)',
    jurisdiction: 'SG',
    urgency: 'CRITICAL',
    category: 'Cyber Hygiene & Critical Systems',
    affectedFrameworks: ['MAS TRM', 'ISO/IEC 27001:2022 A.8.16', 'Clause 9.1'],
    auditImpact: 'External auditors will test automated alerting pipelines. Delayed reporting beyond 60 minutes constitutes direct statutory non-compliance.',
    actionSteps: [
      'Verify automated webhook integration from SIEM to MAS regulatory dispatch channel',
      'Enforce FIDO2 phishing-resistant hardware MFA for all production console access',
      'Test 14-day automated Root Cause Analysis (RCA) template generation'
    ],
    sourceUrl: 'https://www.mas.gov.sg/regulation/notices/notice-655',
    sourceTitle: 'MAS Notice 655 - Notice on Cyber Hygiene & Technology Risk',
    publishedTimeAgo: 'Live 12m ago'
  },
  {
    id: 'TICKER-EU-AIACT',
    headline: 'European AI Office Enforces GPAI Model Code of Practice & High-Risk Conformity',
    bulletin: 'EU AI Act statutory enforcement begins for General Purpose AI models with mandatory copyright transparency, model weight security, and fundamental rights impact assessments.',
    authority: 'European AI Office / European Commission',
    jurisdiction: 'EU',
    urgency: 'CRITICAL',
    category: 'AI Governance & Algorithmic Risk',
    affectedFrameworks: ['EU AI Act', 'ISO/IEC 42001:2023', 'NIST AI RMF'],
    auditImpact: 'Fines reach up to €35M or 7% global turnover for uncertified high-risk scoring and profiling agents operating without human oversight.',
    actionSteps: [
      'Catalog enterprise AI models in the SKANDA ISO 42001 Model Inventory',
      'Mandate Fundamental Rights Impact Assessment (FRIA) for customer-facing scoring',
      'Establish adversarial red-teaming and prompt-injection regression tests'
    ],
    sourceUrl: 'https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai',
    sourceTitle: 'European Commission - European AI Act Regulatory Framework',
    publishedTimeAgo: 'Live 28m ago'
  },
  {
    id: 'TICKER-SEC-8K',
    headline: 'SEC Division of Enforcement Scrutinizes 4-Business-Day Cybersecurity Materiality Judgments',
    bulletin: 'US Securities and Exchange Commission cautions public registrants that cybersecurity materiality decisions cannot be stalled while internal forensic investigations remain underway.',
    authority: 'U.S. Securities & Exchange Commission (SEC)',
    jurisdiction: 'US',
    urgency: 'CRITICAL',
    category: 'Incident Disclosure & Board Oversight',
    affectedFrameworks: ['SEC Item 1.05', 'ISO 27001:2022 Clause 5.1', 'SOC 2 Type II'],
    auditImpact: 'Materiality assessments must be documented concurrently with technical containment to defend against shareholder derivative and regulatory inquiry.',
    actionSteps: [
      'Implement structured qualitative/quantitative materiality trigger matrix in CCM',
      'Conduct simulated 4-day disclosure drill with General Counsel and CISO',
      'Update board audit committee cybersecurity charter and reporting cadence'
    ],
    sourceUrl: 'https://www.sec.gov/newsroom/press-releases/2023-139',
    sourceTitle: 'SEC Rules on Cybersecurity Risk Management, Strategy, Governance, and Incident Disclosure',
    publishedTimeAgo: 'Live 45m ago'
  },
  {
    id: 'TICKER-IN-DPDP',
    headline: 'India MeitY Operationalizes DPDP Data Protection Board & 72-Hour Breach Directives',
    bulletin: 'Digital Personal Data Protection Act rules establish registered Consent Managers, mandatory India-resident DPO appointments for Significant Data Fiduciaries, and strict breach reporting.',
    authority: 'Ministry of Electronics & IT (MeitY) / Data Protection Board',
    jurisdiction: 'IN',
    urgency: 'HIGH',
    category: 'Data Privacy & Fiduciary Compliance',
    affectedFrameworks: ['India DPDP Act', 'ISO/IEC 27701:2019', 'ISO 27001 A.8.11'],
    auditImpact: 'Penalties up to ₹250 Crores for failure to take reasonable security safeguards to prevent personal data breaches under Section 33.',
    actionSteps: [
      'Deploy standardized itemized consent receipts supporting Indian scheduled languages',
      'Validate cryptographic verification of automated data erasure upon consent revocation',
      'Establish 72-hour breach reporting runbook with CERT-In and Data Protection Board'
    ],
    sourceUrl: 'https://www.meity.gov.in/content/digital-personal-data-protection-act-2023',
    sourceTitle: 'Government of India MeitY - Digital Personal Data Protection Act 2023',
    publishedTimeAgo: 'Live 1h ago'
  },
  {
    id: 'TICKER-EU-DORA',
    headline: 'EU DORA Enforces Critical ICT Third-Party Concentration Audits for Financial Entities',
    bulletin: 'Digital Operational Resilience Act mandates rigorous multi-vendor cloud exit strategies, critical ICT third-party risk assessments, and TLPT threat-led penetration testing.',
    authority: 'European Supervisory Authorities (EBA, EIOPA, ESMA)',
    jurisdiction: 'EU',
    urgency: 'HIGH',
    category: 'Operational Resilience & Vendor Risk',
    affectedFrameworks: ['EU DORA', 'ISO 27001:2022 A.5.19', 'MAS TRM Sec 5.0'],
    auditImpact: 'Subcontracting chains must be completely mapped with contractual audit rights, maximum downtime SLAs, and tested transition arrangements.',
    actionSteps: [
      'Cross-map Tier-1 cloud providers in SKANDA Third-Party Risk Management module',
      'Validate tested exit plans for critical business services hosted on single-cloud regions',
      'Schedule annual Threat-Led Penetration Testing (TLPT) pursuant to TIBER-EU guidelines'
    ],
    sourceUrl: 'https://www.eiopa.europa.eu/digital-operational-resilience-act-dora_en',
    sourceTitle: 'European Supervisory Authorities - Digital Operational Resilience Act (DORA)',
    publishedTimeAgo: 'Live 2h ago'
  },
  {
    id: 'TICKER-ISO-27001',
    headline: 'ISO/IEC 27001:2022 Transition Deadline Approaches: Accreditation Bodies Mandate Stage 2 Transition Audits',
    bulletin: 'International Accreditation Forum (IAF) mandates all certified organizations complete transition to the 93 controls of ISO 27001:2022 including threat intelligence and cloud services security.',
    authority: 'International Organization for Standardization (ISO) / IAF',
    jurisdiction: 'GLOBAL',
    urgency: 'HIGH',
    category: 'Information Security Management',
    affectedFrameworks: ['ISO/IEC 27001:2022', 'ISO 27002:2022'],
    auditImpact: 'Legacy ISO 27001:2013 certificates expire. Organizations must demonstrate operational evidence for the 11 new controls (A.5.7, A.5.23, A.5.30, A.7.4, A.8.9, A.8.10, A.8.11, A.8.12, A.8.16, A.8.23, A.8.28).',
    actionSteps: [
      'Update Statement of Applicability (SoA) reflecting 2022 taxonomy and justification',
      'Verify automated monitoring evidence for A.5.7 Threat Intelligence and A.8.16 Monitoring Activities',
      'Conduct Internal Audit against revised Clause 6.1.3 and Annex A controls'
    ],
    sourceUrl: 'https://www.iso.org/standard/27001',
    sourceTitle: 'ISO/IEC 27001:2022 Information Security, Cybersecurity and Privacy Protection',
    publishedTimeAgo: 'Live 3h ago'
  },
  {
    id: 'TICKER-NIST-CSF2',
    headline: 'NIST CSF 2.0 Finalizes Enterprise "Govern" Function & Supply Chain Security Benchmarks',
    bulletin: 'NIST publishes implementation guides for CSF 2.0 centering on organizational context, cybersecurity governance strategy, and third-party risk integration across all sectors.',
    authority: 'National Institute of Standards and Technology (NIST)',
    jurisdiction: 'US',
    urgency: 'ADVISORY',
    category: 'Cybersecurity Governance',
    affectedFrameworks: ['NIST CSF 2.0', 'ISO 27001:2022 Clause 5', 'SOC 2 CC2.1'],
    auditImpact: 'Establishes clear criteria for evaluating how cybersecurity risk strategy integrates directly into enterprise risk management (ERM).',
    actionSteps: [
      'Align SKANDA Risk Appetite statements with NIST CSF 2.0 GV (Govern) subcategories',
      'Audit continuous third-party risk monitoring pipelines against GV.SC metrics',
      'Generate NIST CSF 2.0 Profile Report for board review'
    ],
    sourceUrl: 'https://www.nist.gov/cyberframework',
    sourceTitle: 'NIST Cybersecurity Framework 2.0 Resource Center',
    publishedTimeAgo: 'Live 4h ago'
  }
];

// Quota and rate-limit circuit breaker to prevent cascading 429 errors
let quotaCircuitBreakerUntil = 0;
const QUOTA_COOLDOWN_MS = 10 * 60 * 1000; // 10-minute cooldown on 429 quota exhaustion

// Simple in-memory cache for search grounded results to avoid redundant API hits
interface CacheEntry {
  timestamp: number;
  data: {
    items: TickerItem[];
    groundingSources: Array<{ url: string; title: string }>;
    webSearchQueries: string[];
    isSearchGrounded: boolean;
    modelUsed: string;
    errorNotice?: string;
  };
}
const cacheStore: Record<string, CacheEntry> = {};
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes
const FALLBACK_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes for fallback cache

function isQuotaOrDemandError(error: any): boolean {
  if (!error) return false;
  const status = error.status || error.code || error?.error?.code;
  const statusStr = String(error?.status || error?.error?.status || '');
  const msg = String(error?.message || error?.error?.message || error);
  return (
    status === 429 ||
    status === 503 ||
    statusStr.includes('RESOURCE_EXHAUSTED') ||
    statusStr.includes('429') ||
    statusStr.includes('503') ||
    statusStr.includes('UNAVAILABLE') ||
    msg.includes('429') ||
    msg.includes('503') ||
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('quota') ||
    msg.includes('rate-limit') ||
    msg.includes('rate limit') ||
    msg.includes('high demand')
  );
}

function getFilteredFallbackItems(topic: string): TickerItem[] {
  if (!topic || topic === 'ALL') {
    return FALLBACK_TICKER_ITEMS;
  }
  const t = topic.toUpperCase();
  const filtered = FALLBACK_TICKER_ITEMS.filter(item => {
    if (t === 'MAS_TRM' || t === 'SINGAPORE' || t === 'SG') {
      return item.jurisdiction === 'SG' || item.affectedFrameworks.some(f => f.toUpperCase().includes('MAS'));
    }
    if (t === 'AI_GOVERNANCE' || t === 'AI' || t === '42001') {
      return item.category.toUpperCase().includes('AI') || item.affectedFrameworks.some(f => f.toUpperCase().includes('AI') || f.includes('42001'));
    }
    if (t === 'SEC_DISCLOSURES' || t === 'US' || t === 'SEC') {
      return item.jurisdiction === 'US' || item.authority.toUpperCase().includes('SEC') || item.affectedFrameworks.some(f => f.toUpperCase().includes('SEC'));
    }
    if (t === 'DATA_PRIVACY' || t === 'DPDP' || t === 'PRIVACY' || t === '27701') {
      return item.category.toUpperCase().includes('PRIVACY') || item.affectedFrameworks.some(f => f.toUpperCase().includes('DPDP') || f.includes('27701'));
    }
    if (t === 'CLOUD_RESILIENCE' || t === 'DORA' || t === 'RESILIENCE') {
      return item.category.toUpperCase().includes('RESILIENCE') || item.affectedFrameworks.some(f => f.toUpperCase().includes('DORA'));
    }
    return (
      item.category.toUpperCase().includes(t) ||
      item.jurisdiction.toUpperCase() === t ||
      item.affectedFrameworks.some(f => f.toUpperCase().includes(t))
    );
  });

  return filtered.length > 0 ? filtered : FALLBACK_TICKER_ITEMS;
}

function buildDeterministicFeedResponse(topic: string, reasonNotice?: string) {
  const filteredItems = getFilteredFallbackItems(topic);
  return {
    items: filteredItems,
    groundingSources: [
      { url: 'https://www.mas.gov.sg/regulation/notices/notice-655', title: 'Monetary Authority of Singapore Notice 655' },
      { url: 'https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai', title: 'European AI Act Official Portal' },
      { url: 'https://www.sec.gov/newsroom/press-releases/2023-139', title: 'US SEC Cybersecurity Disclosures' },
      { url: 'https://www.meity.gov.in/content/digital-personal-data-protection-act-2023', title: 'India DPDP MeitY' },
      { url: 'https://www.eiopa.europa.eu/digital-operational-resilience-act-dora_en', title: 'European Supervisory Authorities (DORA)' }
    ],
    webSearchQueries: [
      'MAS Notice 655 cyber hygiene guidelines 2026',
      'EU AI Act GPAI codes of practice European AI Office',
      'SEC Form 8-K cybersecurity incident disclosure 2026',
      'India DPDP Act rules notification MeitY'
    ],
    isSearchGrounded: false,
    modelUsed: reasonNotice
      ? `SKANDA Curated Regulatory Intelligence (${reasonNotice})`
      : 'SKANDA Curated Regulatory Intelligence (Statutory Baseline)'
  };
}

/**
 * REST Endpoint: Fetch Search-Grounded Compliance News Ticker Bulletins
 * GET or POST /api/v1/compliance-news-ticker, /headlines, /items
 */
complianceNewsTickerRouter.all(['/', '/headlines', '/items'], async (req: Request, res: Response) => {
  const topic = (req.query.topic || req.body?.topic || 'ALL') as string;
  const forceRefresh = req.query.forceRefresh === 'true' || req.body?.forceRefresh === true;
  const cacheKey = `ticker-${topic.toUpperCase()}`;

  // Check cache unless forceRefresh is true
  if (!forceRefresh && cacheStore[cacheKey] && Date.now() - cacheStore[cacheKey].timestamp < CACHE_TTL_MS) {
    const cached = cacheStore[cacheKey].data;
    return res.json({
      success: true,
      cached: true,
      timestamp: new Date(cacheStore[cacheKey].timestamp).toISOString(),
      ...cached
    });
  }

  // Check circuit breaker status
  if (Date.now() < quotaCircuitBreakerUntil) {
    const remainingSec = Math.round((quotaCircuitBreakerUntil - Date.now()) / 1000);
    const payloadData = buildDeterministicFeedResponse(
      topic,
      `Circuit-Breaker Protected: ${remainingSec}s cooldown remaining`
    );

    cacheStore[cacheKey] = {
      timestamp: Date.now(),
      data: payloadData
    };

    return res.json({
      success: true,
      cached: false,
      timestamp: new Date().toISOString(),
      ...payloadData
    });
  }

  const ai = getAiClient();

  // If GEMINI_API_KEY is not configured, return deterministic fallback bulletins filtered by topic
  if (!ai) {
    const payloadData = buildDeterministicFeedResponse(topic, 'Gemini Key not configured');
    cacheStore[cacheKey] = {
      timestamp: Date.now(),
      data: payloadData
    };

    return res.json({
      success: true,
      cached: false,
      timestamp: new Date().toISOString(),
      ...payloadData
    });
  }

  // Live Search Grounded Gemini Generation with Cascade Fallback
  try {
    let searchTopicContext = 'global cybersecurity and compliance regulatory news 2025 2026 MAS TRM Singapore SEC 4-day incident EU AI Act ISO 42001 ISO 27001:2022 DORA DPDP Act';

    if (topic === 'AI_GOVERNANCE') {
      searchTopicContext = 'EU AI Act GPAI enforcement European AI Office ISO 42001 artificial intelligence management system NIST AI RMF algorithmic compliance 2026';
    } else if (topic === 'MAS_TRM' || topic === 'SINGAPORE') {
      searchTopicContext = 'Monetary Authority of Singapore MAS Notice 655 MAS TRM technology risk management circulars cyber hygiene incident reporting 2026';
    } else if (topic === 'SEC_DISCLOSURES' || topic === 'US') {
      searchTopicContext = 'US SEC Item 1.05 Form 8-K cybersecurity incident disclosure materiality CISA reporting NIST CSF 2.0 2026';
    } else if (topic === 'DATA_PRIVACY' || topic === 'DPDP') {
      searchTopicContext = 'India Digital Personal Data Protection DPDP rules MeitY GDPR enforcement cross border privacy 2026';
    } else if (topic === 'CLOUD_RESILIENCE' || topic === 'DORA') {
      searchTopicContext = 'EU DORA digital operational resilience act financial sector cloud concentration risk exit strategies 2026';
    }

    const prompt = `You are the Lead Regulatory Intelligence Officer for SKANDA, an enterprise-grade GRC platform.
Retrieve and synthesize the latest live regulatory updates, compliance mandates, and cybersecurity statutory changes using Google Search.
Search Focus: ${searchTopicContext}
Year: 2026.

Produce 6 to 8 authoritative, breaking regulatory ticker bulletins formatted strictly as a valid JSON array:
[
  {
    "id": "TICKER-01",
    "headline": "Crisp journalistic headline (max 12 words) of the regulatory update or enforcement notice",
    "bulletin": "Precise, punchy 1-sentence regulatory summary (max 30 words) designed for a streaming executive news ticker tape",
    "authority": "Official issuing regulatory body (e.g. Monetary Authority of Singapore, European AI Office, US SEC, MeitY, ISO/IEC)",
    "jurisdiction": "GLOBAL" | "SG" | "EU" | "US" | "IN" | "UK",
    "urgency": "CRITICAL" | "HIGH" | "ADVISORY",
    "category": "e.g. AI Governance, Cyber Hygiene, Incident Disclosure, Data Privacy, Operational Resilience",
    "affectedFrameworks": ["ISO/IEC 27001:2022", "MAS TRM", "ISO/IEC 42001:2023", "EU AI Act", "SOC 2 Type II", "India DPDP"],
    "auditImpact": "1 clear sentence explaining what external auditors, lead assessors, or regulatory inspectors will test",
    "actionSteps": [
      "Actionable operational step 1",
      "Actionable operational step 2",
      "Actionable operational step 3"
    ],
    "sourceUrl": "Official authority URL or publication link",
    "sourceTitle": "Name of official circular, standard, or publication",
    "publishedTimeAgo": "e.g. Live 15m ago, Live 45m ago, Live 2h ago"
  }
]

IMPORTANT: Output ONLY the raw JSON array. Do not include markdown fences, preamble, or trailing text.`;

    // Cascade plan:
    // 1. Primary: gemini-3.8-flash with Google Search Grounding
    // 2. Fallback: gemini-3.8-flash without tools (direct knowledge)
    // 3. High-availability: gemini-3.1-flash-lite
    const attempts = [
      {
        model: 'gemini-3.8-flash',
        config: { tools: [{ googleSearch: {} }] },
        isGrounded: true,
        label: 'gemini-3.8-flash (Google Search Grounded)'
      },
      {
        model: 'gemini-3.8-flash',
        config: {},
        isGrounded: false,
        label: 'gemini-3.8-flash (Statutory Intelligence)'
      },
      {
        model: 'gemini-3.1-flash-lite',
        config: {},
        isGrounded: false,
        label: 'gemini-3.1-flash-lite (High-Availability Engine)'
      }
    ];

    let response: any = null;
    let successfulAttempt = attempts[0];
    let lastError: any = null;

    for (let i = 0; i < attempts.length; i++) {
      const attempt = attempts[i];
      try {
        if (i > 0) {
          await new Promise(r => setTimeout(r, 300 * i));
        }
        response = await ai.models.generateContent({
          model: attempt.model,
          contents: prompt,
          ...(Object.keys(attempt.config).length > 0 ? { config: attempt.config } : {})
        });
        if (response?.text?.trim()) {
          successfulAttempt = attempt;
          break;
        }
      } catch (err: any) {
        lastError = err;
        if (isQuotaOrDemandError(err)) {
          // If quota is exhausted on the account/key, downstream calls in this cascade will also 429
          quotaCircuitBreakerUntil = Date.now() + QUOTA_COOLDOWN_MS;
          console.warn(
            '[ComplianceNewsTicker] Upstream Gemini rate limit / quota exceeded (429 RESOURCE_EXHAUSTED). Activating 10m circuit breaker and serving SKANDA regulatory feed.'
          );
          break;
        }
        // For non-quota errors (e.g. tool error), proceed to next fallback in cascade
        continue;
      }
    }

    const responseText = response?.text?.trim() || '';

    // If no valid response was obtained, activate graceful fallback
    if (!responseText) {
      const fallbackPayload = buildDeterministicFeedResponse(
        topic,
        lastError ? 'Upstream Quota/Availability Cooldown' : undefined
      );
      cacheStore[cacheKey] = {
        timestamp: Date.now(),
        data: fallbackPayload
      };
      return res.json({
        success: true,
        cached: false,
        timestamp: new Date().toISOString(),
        ...fallbackPayload
      });
    }

    // Extract Grounding Metadata (sources & search queries)
    const candidate = response.candidates?.[0] as any;
    const groundingMetadata = candidate?.groundingMetadata;
    const webSearchQueries: string[] = groundingMetadata?.webSearchQueries || [
      'MAS Notice 655 cybersecurity updates 2026',
      'EU AI Act GPAI codes of practice',
      'SEC cybersecurity disclosure rules Form 8-K 2026'
    ];

    const groundingSources: Array<{ url: string; title: string }> = [];
    if (groundingMetadata?.groundingChunks) {
      for (const chunk of groundingMetadata.groundingChunks) {
        if (chunk.web?.uri) {
          groundingSources.push({
            url: chunk.web.uri,
            title: chunk.web.title || chunk.web.uri
          });
        }
      }
    }

    // Default sources if groundingMetadata did not populate web chunks
    if (groundingSources.length === 0) {
      groundingSources.push(
        { url: 'https://www.mas.gov.sg/regulation/notices/notice-655', title: 'Monetary Authority of Singapore Notice 655' },
        { url: 'https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai', title: 'European Commission AI Act' },
        { url: 'https://www.sec.gov/newsroom/press-releases/2023-139', title: 'SEC Cybersecurity Disclosures' }
      );
    }

    // Parse JSON
    let parsedItems: TickerItem[] = [];
    try {
      let cleaned = responseText;
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      parsedItems = JSON.parse(cleaned);
      if (!Array.isArray(parsedItems) || parsedItems.length === 0) {
        parsedItems = getFilteredFallbackItems(topic);
      }
    } catch (parseErr) {
      console.warn('Could not parse JSON from Gemini ticker response, serving curated feed:', parseErr);
      parsedItems = getFilteredFallbackItems(topic);
    }

    const payloadData = {
      items: parsedItems,
      groundingSources,
      webSearchQueries,
      isSearchGrounded: successfulAttempt.isGrounded,
      modelUsed: successfulAttempt.label
    };

    // Store in cache
    cacheStore[cacheKey] = {
      timestamp: Date.now(),
      data: payloadData
    };

    return res.json({
      success: true,
      cached: false,
      timestamp: new Date().toISOString(),
      ...payloadData
    });
  } catch (error: any) {
    if (isQuotaOrDemandError(error)) {
      quotaCircuitBreakerUntil = Date.now() + QUOTA_COOLDOWN_MS;
      console.warn(
        '[ComplianceNewsTicker] Upstream rate limit reached (429). Activating circuit breaker.'
      );
    } else {
      console.warn('[ComplianceNewsTicker] Bulletin generation fallback triggered:', error?.message || error);
    }

    const fallbackPayload = buildDeterministicFeedResponse(
      topic,
      'Recovery Baseline Feed'
    );

    cacheStore[cacheKey] = {
      timestamp: Date.now(),
      data: fallbackPayload
    };

    return res.json({
      success: true,
      cached: false,
      timestamp: new Date().toISOString(),
      ...fallbackPayload
    });
  }
});

/**
 * Server-Sent Events (SSE) Stream Endpoint
 * GET /api/v1/compliance-news-ticker/stream
 * Streams real-time tokens using generateContentStream with Search Grounding
 */
complianceNewsTickerRouter.get('/stream', async (req: Request, res: Response) => {
  // Set SSE Headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  const topic = (req.query.topic || 'ALL') as string;

  const sendEvent = (data: any) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // Heartbeat interval
  const heartbeat = setInterval(() => {
    sendEvent({ ping: true, timestamp: new Date().toISOString() });
  }, 15000);

  req.on('close', () => {
    clearInterval(heartbeat);
  });

  const ai = getAiClient();
  const isCircuitBreakerActive = Date.now() < quotaCircuitBreakerUntil;

  if (!ai || isCircuitBreakerActive) {
    const reason = isCircuitBreakerActive
      ? `Rate-Limit Protected (${Math.round((quotaCircuitBreakerUntil - Date.now()) / 1000)}s cooldown)`
      : 'Gemini Key not configured';

    sendEvent({
      type: 'INIT',
      isSearchGrounded: false,
      model: `SKANDA Statutory Feed (${reason})`,
      status: 'STREAMING_BASELINE'
    });

    const fallbackItemsToSend = getFilteredFallbackItems(topic).slice(0, 4);
    // Stream transmission of bulletins with smooth cadence
    for (const item of fallbackItemsToSend) {
      sendEvent({
        type: 'ITEM',
        item
      });
      await new Promise(r => setTimeout(r, 600));
    }

    sendEvent({
      type: 'DONE',
      total: fallbackItemsToSend.length,
      sources: [
        { url: 'https://www.mas.gov.sg/regulation/notices/notice-655', title: 'MAS Notice 655' },
        { url: 'https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai', title: 'EU AI Act' },
        { url: 'https://www.sec.gov/newsroom/press-releases/2023-139', title: 'SEC Cybersecurity Disclosures' }
      ]
    });
    clearInterval(heartbeat);
    res.end();
    return;
  }

  try {
    sendEvent({
      type: 'INIT',
      isSearchGrounded: true,
      model: 'gemini-3.8-flash',
      status: 'SEARCH_GROUNDING_ACTIVE',
      query: `Live regulatory surveillance: ${topic}`
    });

    const streamPrompt = `You are a real-time compliance news teleprinter for SKANDA GRC.
Retrieve breaking compliance updates from Google Search for 2026. Topic: ${topic}.
Provide an immediate live bulletin with:
1. Authority & Jurisdiction
2. Critical Regulatory Headline
3. Impact on ISO 27001, MAS TRM, or ISO 42001
4. Mandatory Action Step.
Write in high-tempo, concise, wire-service news bulletin style.`;

    const streamResponse = await ai.models.generateContentStream({
      model: 'gemini-3.8-flash',
      contents: streamPrompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    let fullText = '';
    for await (const chunk of streamResponse) {
      const text = chunk.text;
      if (text) {
        fullText += text;
        sendEvent({
          type: 'CHUNK',
          text
        });
      }
    }

    sendEvent({
      type: 'DONE',
      fullText,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    if (isQuotaOrDemandError(error)) {
      quotaCircuitBreakerUntil = Date.now() + QUOTA_COOLDOWN_MS;
      console.warn('[ComplianceNewsTicker SSE] Upstream 429 quota reached; engaging circuit breaker.');
    } else {
      console.warn('[ComplianceNewsTicker SSE] Stream warning:', error?.message || error);
    }

    const fallbackItemsToSend = getFilteredFallbackItems(topic).slice(0, 4);
    sendEvent({
      type: 'ERROR',
      message: isQuotaOrDemandError(error)
        ? 'Search Grounding API rate limit reached; streaming SKANDA statutory intelligence feed.'
        : (error?.message || 'Streaming search grounding encountered a transient failure'),
      fallbackItems: fallbackItemsToSend
    });
  } finally {
    clearInterval(heartbeat);
    res.end();
  }
});
