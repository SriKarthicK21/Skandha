import { Router, Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';

export const geminiAiChatRouter = Router();

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

// System instructions for specific enterprise persona roles
export const CHATBOT_ROLES = {
  CHIEF_GRC: {
    id: 'CHIEF_GRC',
    title: 'Chief GRC Executive Advisor',
    description: 'Strategic governance, cross-framework orchestration, and board compliance posture.',
    recommendedModel: 'gemini-3.5-flash',
    systemInstruction: `You are the Chief GRC Executive Advisor for SKANDA, an enterprise-grade GRC and Cyber Risk platform.
Your expertise spans ISO/IEC 27001:2022, ISO 42001 (Artificial Intelligence Management), SOC 2 Type II, and MAS Technology Risk Management (TRM).
Provide authoritative, commercially viable, and strategically sound governance counsel.
Format responses with clean Markdown, clear headers, actionable bullet points, and authoritative regulatory citations where applicable.
Always uphold the highest standards of audit traceability and enterprise data protection.`
  },
  ISO_AUDITOR: {
    id: 'ISO_AUDITOR',
    title: 'Principal ISO 27001/42001 Lead Auditor',
    description: 'Rigorous clause analysis, Statement of Applicability (SoA), and evidence validation.',
    recommendedModel: 'gemini-3.1-pro-preview',
    systemInstruction: `You are a Principal ISO/IEC 27001:2022 & ISO 42001 Lead Auditor.
You evaluate management system compliance through objective evidence, conformity testing, and rigorous risk assessments.
Always trace from: Requirement/Clause → Control → Evidence Artifact → Test Result → Finding / Non-Conformity → Corrective Action Plan.
Cite specific ISO 27001 clauses (Clauses 4-10) and Annex A controls (A.5 Organizational, A.6 People, A.7 Physical, A.8 Technological).
Do not assume compliance without verifiable evidence. Distinguish clearly between Minor Non-Conformities, Major Non-Conformities, and Opportunities for Improvement (OFI).`
  },
  MAS_TRM: {
    id: 'MAS_TRM',
    title: 'MAS TRM & Cyber Hygiene Specialist',
    description: 'Singapore MAS Notice 644/655, 1-Hour Incident SLA, and critical systems security.',
    recommendedModel: 'gemini-3.1-pro-preview',
    systemInstruction: `You are the Chief MAS Technology Risk Management (TRM) Specialist.
You specialize in the Monetary Authority of Singapore (MAS) TRM Guidelines and mandatory MAS Notices 644 and 655 (Cyber Hygiene & Incident Reporting).
Enforce the strict MAS statutory rules:
1. Statutory 1-Hour Notification SLA for critical system degradation or security breaches.
2. 14-day Root Cause Analysis (RCA) and mitigation report submission requirement.
3. RTO < 4 hours and maximum data loss (RPO) < 15 minutes for designated critical systems.
4. Mandatory controls across Identity & Access, Network Segregation, Malware Protection, and Vendor Risk Management.
Provide crisp, regulatory-precise answers for financial institutions and payment service providers.`
  },
  RISK_REMEDIATION: {
    id: 'RISK_REMEDIATION',
    title: 'Incident & CAPA Remediation Commander',
    description: 'Rapid threat containment, root cause analysis (5-Whys), and corrective action plans.',
    recommendedModel: 'gemini-3.5-flash',
    systemInstruction: `You are the SKANDA Cyber Incident & Corrective Action (CAPA) Remediation Commander.
You guide security teams through immediate containment, forensic root-cause analysis (5-Whys, Ishikawa), vulnerability eradication, and post-incident compliance validation.
Provide concrete, prioritized remediation runbooks, owner assignments, and verification metrics.
Emphasize measurable risk reduction and audit trail integrity.`
  },
  FAST_ASSISTANT: {
    id: 'FAST_ASSISTANT',
    title: 'Rapid Compliance Assistant',
    description: 'Fast definitions, quick control lookups, and snappy procedural answers.',
    recommendedModel: 'gemini-3.1-flash-lite',
    systemInstruction: `You are the SKANDA Rapid Compliance Assistant.
Provide fast, direct, concise, and accurate answers to compliance, audit, and security questions.
Use bullet points and short sentences to deliver immediate clarity without unnecessary preamble.`
  }
};

/**
 * Audio Transcription Endpoint
 * Uses model: gemini-3.5-transcribe
 */
geminiAiChatRouter.post('/transcribe', async (req: Request, res: Response) => {
  try {
    const {
      audioBase64,
      mimeType = 'audio/webm',
      prompt = 'Transcribe the spoken audio accurately into clear text. Preserve audit-specific terminology (e.g. ISO clauses, MAS TRM, CVE, controls, evidence). Output only the verbatim transcription.'
    } = req.body;

    if (!audioBase64) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: audioBase64'
      });
    }

    // Sanitize base64 payload
    const cleanBase64 = audioBase64.replace(/^data:audio\/[a-z0-9-+.]+;base64,/, '');

    const ai = getAiClient();
    if (!ai) {
      return res.status(503).json({
        success: false,
        error: 'GEMINI_API_KEY is not configured on the server.'
      });
    }

    const audioPart = {
      inlineData: {
        mimeType: mimeType.split(';')[0] || 'audio/webm',
        data: cleanBase64
      }
    };

    // Primary audio transcription model per prompt requirements: gemini-3.5-transcribe
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [
          audioPart,
          { text: prompt }
        ]
      }
    });

    const transcription = response.text?.trim() || '';

    return res.json({
      success: true,
      text: transcription,
      modelUsed: 'gemini-3.5-transcribe',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    const isQuota =
      error?.status === 429 ||
      error?.code === 429 ||
      String(error?.message || '').includes('429') ||
      String(error?.message || '').includes('RESOURCE_EXHAUSTED') ||
      String(error?.message || '').includes('quota');

    if (isQuota) {
      console.warn('[Audio Transcription] Upstream Gemini quota/rate limit reached (429 RESOURCE_EXHAUSTED).');
      return res.status(429).json({
        success: false,
        error: 'Gemini API quota exceeded. Please try again in a few moments.'
      });
    }

    console.warn('Audio transcription warning:', error?.message || error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to transcribe audio'
    });
  }
});

/**
 * Multi-Turn Chat Endpoint
 * Uses:
 * - gemini-3.1-pro-preview for complex tasks
 * - gemini-3.8-flash for general tasks
 * - gemini-3.1-flash-lite for fast tasks
 */
geminiAiChatRouter.post('/multi-turn-chat', async (req: Request, res: Response) => {
  try {
    const {
      messages = [],
      role = 'CHIEF_GRC',
      modelType = 'general', // 'complex' | 'general' | 'fast'
      tenantContext = {}
    } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'messages array is required and must not be empty.'
      });
    }

    const ai = getAiClient();
    if (!ai) {
      return res.status(503).json({
        success: false,
        error: 'GEMINI_API_KEY is not configured on the server.'
      });
    }

    // Determine target model based on user requirement:
    // "Use gemini-3.1-pro-preview for particularly complex tasks, gemini-3.8-flash for general tasks, and gemini-3.1-flash-lite for tasks that should happen fast."
    let targetModel = 'gemini-3.8-flash';
    if (modelType === 'complex' || modelType === 'gemini-3.1-pro-preview') {
      targetModel = 'gemini-3.1-pro-preview';
    } else if (modelType === 'fast' || modelType === 'gemini-3.1-flash-lite') {
      targetModel = 'gemini-3.1-flash-lite';
    } else if (modelType === 'general' || modelType === 'gemini-3.8-flash') {
      targetModel = 'gemini-3.8-flash';
    }

    // Fetch role persona configuration
    const selectedRoleConfig = CHATBOT_ROLES[role as keyof typeof CHATBOT_ROLES] || CHATBOT_ROLES.CHIEF_GRC;

    // Grounding with tenant context if available
    const tenantContextText = tenantContext?.organizationName
      ? `\n\nActive Tenant Context:
- Organization: ${tenantContext.organizationName}
- Industry: ${tenantContext.industry || 'Financial Services / Technology'}
- Target Frameworks: ${tenantContext.frameworks || 'ISO/IEC 27001:2022, MAS TRM, ISO 42001'}
- Current Readiness: ${tenantContext.readinessScore || 96}%`
      : '';

    const systemInstruction = `${selectedRoleConfig.systemInstruction}${tenantContextText}`;

    // Format multi-turn history into the standard GoogleGenAI contents structure
    const contents = messages.map((m: { role: string; text: string }) => ({
      role: m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.text }]
    }));

    // Cascade models if target model encounters quota or transient error
    const cascadeList = [
      targetModel,
      targetModel !== 'gemini-3.8-flash' ? 'gemini-3.8-flash' : 'gemini-3.1-flash-lite',
      'gemini-3.1-flash-lite'
    ].filter((m, idx, arr) => arr.indexOf(m) === idx);

    let responseText = '';
    let actualModelUsed = targetModel;
    let lastChatError: any = null;

    for (let i = 0; i < cascadeList.length; i++) {
      const currentModel = cascadeList[i];
      try {
        if (i > 0) {
          await new Promise(r => setTimeout(r, 250 * i));
        }
        const response = await ai.models.generateContent({
          model: currentModel,
          contents,
          config: {
            systemInstruction
          }
        });
        if (response.text) {
          responseText = response.text;
          actualModelUsed = currentModel;
          break;
        }
      } catch (chatErr: any) {
        lastChatError = chatErr;
        const isQuota =
          chatErr?.status === 429 ||
          chatErr?.code === 429 ||
          String(chatErr?.message || '').includes('429') ||
          String(chatErr?.message || '').includes('RESOURCE_EXHAUSTED') ||
          String(chatErr?.message || '').includes('quota');

        if (isQuota && i === cascadeList.length - 1) {
          console.warn('[Multi-turn chat] Quota exhausted across all model tiers.');
          break;
        }
        console.warn(`[Multi-turn chat] Model ${currentModel} returned notice, trying next fallback:`, chatErr?.message);
      }
    }

    if (!responseText) {
      const isQuota =
        lastChatError?.status === 429 ||
        lastChatError?.code === 429 ||
        String(lastChatError?.message || '').includes('429') ||
        String(lastChatError?.message || '').includes('RESOURCE_EXHAUSTED') ||
        String(lastChatError?.message || '').includes('quota');

      if (isQuota) {
        return res.status(429).json({
          success: false,
          error: 'Gemini API quota exceeded. Please try again shortly or check your API key plan.'
        });
      }

      return res.status(500).json({
        success: false,
        error: lastChatError?.message || 'Unable to generate response from AI models'
      });
    }

    return res.json({
      success: true,
      reply: responseText,
      modelUsed: actualModelUsed,
      role: selectedRoleConfig.id,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    const isQuota =
      error?.status === 429 ||
      error?.code === 429 ||
      String(error?.message || '').includes('429') ||
      String(error?.message || '').includes('RESOURCE_EXHAUSTED') ||
      String(error?.message || '').includes('quota');

    if (isQuota) {
      console.warn('[Multi-turn chat] Gemini quota exceeded (429 RESOURCE_EXHAUSTED)');
      return res.status(429).json({
        success: false,
        error: 'Gemini API quota exceeded. Please try again shortly.'
      });
    }

    console.warn('Multi-turn chat warning:', error?.message || error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to process chat message'
    });
  }
});
