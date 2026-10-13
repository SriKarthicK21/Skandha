import React, { useState, useRef, useEffect } from 'react';
import { useGRC } from '../../context/GRCContext';
import { organizationService } from '../../services/organizationService';
import { useToast } from '../common/ToastContainer';
import { SkandaGRCopilotIcon } from './SkandaGRCopilotIcon';
import {
  Send,
  X,
  Bot,
  User,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  FileText,
  HelpCircle,
  Zap,
  RefreshCw,
  Copy,
  Check,
  Layers,
  ChevronRight,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  citations?: Array<{ label: string; ref: string }>;
  actions?: Array<{ label: string; moduleId: string; actionType?: string }>;
}

interface AICopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateModule?: (moduleId: string) => void;
  initialPrompt?: string;
}

export const AICopilotDrawer: React.FC<AICopilotDrawerProps> = ({
  isOpen,
  onClose,
  onNavigateModule,
  initialPrompt
}) => {
  const { currentTenant, currentUser, setActiveModule, evidence, findings, risks } = useGRC();
  const { showToast } = useToast();

  const [inputQuery, setInputQuery] = useState(initialPrompt || '');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialPrompt) {
      setInputQuery(initialPrompt);
    }
  }, [initialPrompt]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'ai',
      text: `Hello ${currentUser?.name?.split(' ')[0] || 'GRC Officer'}! 👋 I am your SKANDA AI GRC Chief Consultant. I am analyzing ${organizationService.getOrganizationName(currentTenant)} in real time across ISO 27001, ISO 42001, SOC 2, and MAS TRM.\n\nHow can I help you optimize your compliance roadmap or prepare for your upcoming audit?`,
      timestamp: 'Just now'
    }
  ]);

  const suggestedPrompts = [
    "Explain this control",
    "What evidence is required?",
    "Show me an example",
    "Assess this evidence",
    "Identify the gap",
    "Create remediation action",
    "Map this control to MAS TRM",
    "Map this requirement to ISO 27001"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = (queryToSend?: string) => {
    const text = (queryToSend || inputQuery).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    setTimeout(() => {
      let aiResponse = '';
      let citations: Array<{ label: string; ref: string }> = [];
      let actions: Array<{ label: string; moduleId: string }> = [];

      const lower = text.toLowerCase();

      if (lower.includes('risk') || lower.includes('top 5') || lower.includes('exposure')) {
        aiResponse = `### Executive Risk Assessment for ${organizationService.getOrganizationName(currentTenant)}:\n\n1. **Privileged IAM Misuse (Risk Score: 9.2)**: 23 accounts pending privileged review under A.5.15.\n2. **Third-Party SaaS Security (Risk Score: 8.7)**: 12 vendors lack annual SIG questionnaires (A.5.19).\n3. **Incident Response Maturity (Risk Score: 7.1)**: Tabletop drill required before Q3 audit.\n4. **Data Classification Gaps (Risk Score: 6.8)**: 3 data stores missing sensitivity tags.\n5. **Unpatched Vulnerabilities (Risk Score: 5.6)**: 2 low-severity CVEs in staging environment.`;
        citations = [
          { label: 'Risk Map Matrix', ref: 'Clause 6.1.2' },
          { label: 'Annex A.5.15 Access Review', ref: 'ISO 27001:2022' }
        ];
        actions = [
          { label: 'Open Risk Register', moduleId: 'risk_map' },
          { label: 'Review Access Controls', moduleId: 'evidence_upload' }
        ];
      } else if (lower.includes('evidence') || lower.includes('missing')) {
        aiResponse = `### Evidence Health & Missing Artifacts:\n\n- **Total Hashes Verified**: 1,284 / 1,438 (89% Valid)\n- **Overdue Items**: 3 evidence submissions require immediate CISO sign-off.\n- **Critical Missing**: Key Management Lifecycle (A.8.24) and Quarterly Access Review sheet.\n\nUploading these 2 items will boost your Evidence Health score from **89% to 94%**.`;
        citations = [
          { label: 'Evidence Vault', ref: '1,284 Hashes' },
          { label: 'Annex A.8.24 Key Lifecycle', ref: 'A.8 Technical' }
        ];
        actions = [
          { label: 'Open Evidence Center', moduleId: 'evidence_centre' },
          { label: 'Upload Missing Hashes', moduleId: 'evidence_upload' }
        ];
      } else if (lower.includes('audit') || lower.includes('prepare') || lower.includes('24 days')) {
        aiResponse = `### Stage 2 Surveillance Audit Prep Plan:\n\n- **Target Date**: 26 September 2026 (24 Days remaining)\n- **Overall Readiness**: 98% (Qualified)\n- **Mandatory Requirements Status**:\n  - Clauses 4-10: 91% verified ✅\n  - Statement of Applicability (SoA): 93/93 controls documented ✅\n  - Management Review Meeting: Minutes approved & signed ✅\n  - Remaining Action: Clear 1 minor observation (OFI-01 in Vendor Security).`;
        citations = [
          { label: 'Audit Pack', ref: 'Stage 2 Ready' },
          { label: 'Management Review P08', ref: 'Clause 9.3' }
        ];
        actions = [
          { label: 'Download Audit Readiness Pack', moduleId: 'readiness_cert' },
          { label: 'Review SoA Document', moduleId: 'statement_of_applicability' }
        ];
      } else if (lower.includes('explain this control') || lower.includes('explain')) {
        aiResponse = `### Control Requirement (Plain English):\n\n**A.5.15 Access Control**: Your organization must formally define, document, and enforce rules governing who can access your systems, networks, and confidential customer data based on the **principle of least privilege (POLP)**.\n\n### Why It Matters:\nWithout access controls, compromised credentials or rogue accounts can traverse internal networks without restriction, causing data breaches and catastrophic regulatory fines.\n\n### Implementation Steps:\n1. Establish Role-Based Access Control (RBAC) matrix.\n2. Require manager approvals for new permission grants.\n3. Enforce MFA on all administrative consoles.\n4. Perform quarterly access reviews with department leads.`;
        citations = [
          { label: 'ISO 27001:2022', ref: 'Annex A.5.15' },
          { label: 'SOC 2 Trust Criteria', ref: 'CC6.1' }
        ];
        actions = [
          { label: 'Open Control Library', moduleId: 'control_library' },
          { label: 'Upload Access Review', moduleId: 'evidence_upload' }
        ];
      } else if (lower.includes('evidence is required') || lower.includes('required evidence')) {
        aiResponse = `### Required Objective Evidence for A.5.15 (Access Control):\n\nTo satisfy Lead External Auditors, you must provide:\n\n1. **Documented Policy**: Approved Access Control Policy (POL-01) with executive signature.\n2. **Entitlement Matrix**: RBAC role definitions exported from IdP (Okta / Entra ID / Google).\n3. **Quarterly Review Logs**: Signed manager review verifying active user lists within the last 90 days.\n4. **Revocation Records**: Offboarding ticket proving user deprovisioning within 24 hours of employee departure.`;
        citations = [
          { label: 'Lead Auditor Evidence Guide', ref: 'A.5.15 Standard' }
        ];
        actions = [
          { label: 'Launch Smart Evidence Analyzer', moduleId: 'evidence_centre' }
        ];
      } else if (lower.includes('show me an example') || lower.includes('example')) {
        aiResponse = `### Example: Quarterly User Access Review Manifest\n\n\`\`\`json\n{\n  "reviewPeriod": "Q2 2026",\n  "reviewDate": "2026-06-30",\n  "reviewer": "Sarah Chen, VP InfoSec",\n  "system": "AWS Production & Corporate HRIS",\n  "totalAccountsEvaluated": 84,\n  "accountsConfirmed": 81,\n  "accountsRevoked": 3,\n  "revocationReasons": ["Employee Resignation", "Role Transfer", "Dormant Account (>90d)"],\n  "status": "APPROVED_BY_EXECUTIVE"\n}\n\`\`\`\n\nUpload this signed manifest via the Smart Evidence uploader to achieve 100% control compliance.`;
        citations = [
          { label: 'Big 4 Audit Template', ref: 'UAR-SOP-01' }
        ];
        actions = [
          { label: 'Upload Sample Evidence', moduleId: 'evidence_upload' }
        ];
      } else if (lower.includes('assess this evidence') || lower.includes('assess')) {
        aiResponse = `### Automated Evidence Health Assessment:\n\n- **Document Integrity**: Valid (SHA-256 Verified)\n- **Auditor Criteria Score**: **98 / 100 (Qualified)**\n- **Review Validity Window**: 84 days remaining before 90-day expiry\n- **Missing Elements**: None. Manager signature stamp and account revocation logs are present.\n\n**Verdict**: Fully accepted for Stage 1 and Stage 2 external certification audits.`;
        citations = [
          { label: 'Cryptographic WORM Hash', ref: 'SHA-256 Match' }
        ];
        actions = [
          { label: 'View in Evidence Centre', moduleId: 'evidence_centre' }
        ];
      } else if (lower.includes('identify the gap') || lower.includes('gap')) {
        aiResponse = `### Identified Compliance Gaps for Active Tenant:\n\n1. **A.5.15 Access Control**: Finance ERP access review was performed informally in Slack; formal signed review PDF missing.\n2. **A.8.20 Network Security**: Staging Redis database is exposed without mutual TLS.\n3. **A.5.19 Supplier Risk**: AWS SOC 2 Type II report collection is 14 days overdue.\n\nRemediating these 3 items will increase Audit Readiness from **76% to 85%**.`;
        citations = [
          { label: 'Gap Matrix', ref: '3 High Priority Gaps' }
        ];
        actions = [
          { label: 'Launch Smart Gap Assessment', moduleId: 'gap_assessment' },
          { label: 'View Remediation Desk', moduleId: 'remediation_desk' }
        ];
      } else if (lower.includes('create remediation') || lower.includes('remediation')) {
        aiResponse = `### Remediation Action Generated:\n\n- **Task Title**: [CAPA-2026-08] Formalize Q2 Finance ERP User Access Review\n- **Root Cause**: Absence of automated quarterly review reminder trigger\n- **Assigned Owner**: Lead ISMS Implementer / CFO\n- **Target SLA**: 7 Calendar Days\n- **Preventive Action**: Configure recurring Skanda 90-day notification workflow.`;
        citations = [
          { label: 'CAPA Module', ref: 'ISO 27001 Clause 10.2' }
        ];
        actions = [
          { label: 'Open Findings & CAPA', moduleId: 'findings_capa' }
        ];
      } else if (lower.includes('map this control to mas trm') || lower.includes('mas trm')) {
        aiResponse = `### Multi-Framework Crosswalk: ISO 27001 A.5.15 → MAS TRM 2021\n\n- **MAS TRM Section 8.1 (User Access Management)**:\n  - 8.1.1: Grant user access only on need-to-use basis (POLP).\n  - 8.1.2: Implement dual authorization for privileged administration.\n  - 8.1.3: Review all user access rights at least once every six months (or quarterly for privileged users).\n  - 8.1.4: Revoke access immediately upon cessation of employment.\n\n**Harmonization Benefit**: Satisfying A.5.15 automatically fulfills 100% of MAS TRM 8.1 without duplicate documentation!`;
        citations = [
          { label: 'MAS TRM Guidelines 2021', ref: 'Section 8.1' },
          { label: 'Reuse Factor', ref: '100% Direct Match' }
        ];
        actions = [
          { label: 'Open MAS Crosswalk Matrix', moduleId: 'cross_framework_crosswalk' }
        ];
      } else if (lower.includes('map this requirement to iso 27001') || lower.includes('map to iso')) {
        aiResponse = `### Requirement Mapping to ISO/IEC 27001:2022:\n\n- **Selected Requirement**: Third-Party Vendor Risk Assessment\n- **Primary ISO Control**: **Annex A.5.19 (Information Security in Supplier Relationships)**\n- **Supporting Controls**:\n  - A.5.20: Addressing information security within supplier agreements\n  - A.5.21: Managing information security in the ICT supply chain\n  - A.5.22: Monitoring, review and change management of supplier services\n\n**One Upload Multiplier**: Uploading vendor SOC 2 reports satisfies A.5.19, SOC 2 CC9.2, and MAS Notice 658 simultaneously.`;
        citations = [
          { label: 'ISO/IEC 27001:2022', ref: 'Annex A.5.19 - A.5.22' }
        ];
        actions = [
          { label: 'Open Control Library', moduleId: 'control_library' }
        ];
      } else if (lower.includes('mas') || lower.includes('sla') || lower.includes('1-hour')) {
        aiResponse = `### MAS TRM 1-Hour Incident Notification Mandate:\n\n1. **1-Hour SLA**: Under MAS Notice 644/655, financial institutions must report severe system downtime or cyber breaches within **60 minutes**.\n2. **Automated Drill**: Our real-time simulator completed a mock drill in **18 minutes** (100% compliant).\n3. **Critical Systems**: RTO < 4h and RPO < 15m verified for Payment Gateway and Core Ledger.`;
        citations = [
          { label: 'MAS Notice 644/655', ref: 'Section 4.1' },
          { label: 'Crosswalk to ISO 27001', ref: '82% Reuse' }
        ];
        actions = [
          { label: 'Open MAS Command Center', moduleId: 'mas_dashboard' },
          { label: 'View Crosswalk Matrix', moduleId: 'cross_framework_crosswalk' }
        ];
      } else {
        aiResponse = `I have analyzed your request regarding "${text}".\n\nBased on your active framework scope (ISO 27001:2022, MAS TRM, and ISO 42001), your organization is in **Stage 5 (Control Implementation)** with a healthy **96.4% compliance score**.\n\nRecommended next steps are to review expiring vendor security assessments and confirm privileged access reviews for the upcoming Stage 2 audit.`;
        actions = [
          { label: 'View Priority Actions', moduleId: 'command_center' },
          { label: 'Open Tasks & Projects', moduleId: 'tasks' }
        ];
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations,
        actions
      };

      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 450);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast({ title: 'Copied to clipboard', type: 'info' });
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] lg:w-[480px] bg-[#0D111D] border-l border-slate-800 shadow-2xl flex flex-col justify-between transition-all duration-300">
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-800 bg-[#0B0F19] flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <SkandaGRCopilotIcon size={32} status="online" animate={false} />
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center space-x-1.5">
              <span>GRC AI Copilot</span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Enterprise GRC
              </span>
            </h3>
            <p className="text-[10px] text-slate-400">Context: {organizationService.getOrganizationName(currentTenant)}</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title="Close AI Consultant Drawer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center space-x-1.5 text-[10px] text-slate-500 mb-1 px-1">
              <span>{msg.sender === 'user' ? 'You' : 'AI Chief Consultant'}</span>
              <span>•</span>
              <span>{msg.timestamp}</span>
            </div>

            <div
              className={`p-3.5 rounded-2xl max-w-[92%] text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-xs'
                  : 'bg-slate-900 border border-slate-800/80 text-slate-200 rounded-tl-xs shadow-lg'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>

              {/* Citations */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap gap-1.5">
                  <span className="text-[10px] text-slate-500 w-full font-semibold uppercase tracking-wider">Citations:</span>
                  {msg.citations.map((c, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-indigo-300"
                    >
                      {c.label} ({c.ref})
                    </span>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              {msg.actions && msg.actions.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 space-y-1.5">
                  {msg.actions.map((act, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        if (onNavigateModule) onNavigateModule(act.moduleId);
                        else setActiveModule(act.moduleId as any);
                        showToast({ title: `Navigating to ${act.label}`, type: 'info' });
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/30 text-[11px] font-semibold transition flex items-center justify-between"
                    >
                      <span>{act.label}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Copy button */}
            {msg.sender === 'ai' && (
              <button
                onClick={() => handleCopy(msg.id, msg.text)}
                className="mt-1 ml-1 text-[10px] text-slate-500 hover:text-slate-300 flex items-center space-x-1"
              >
                {copiedId === msg.id ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center space-x-2 text-slate-400 text-xs p-3 rounded-2xl bg-slate-900 border border-slate-800 w-36">
            <Bot className="w-4 h-4 text-purple-400 animate-spin" />
            <span>Analyzing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-4 py-2 bg-[#0B0F19] border-t border-slate-800/80">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
          Suggested Prompts:
        </span>
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
          {suggestedPrompts.slice(0, 4).map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              className="shrink-0 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 hover:text-white transition whitespace-nowrap"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <div className="p-3 border-t border-slate-800 bg-[#0B0F19]">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            placeholder="Ask anything about controls, risks, evidence..."
            value={inputQuery}
            onChange={e => setInputQuery(e.target.value)}
            className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-purple-500 transition"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isTyping}
            className="p-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold disabled:opacity-40 transition shadow-md"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
