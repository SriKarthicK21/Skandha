import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  Shield,
  Layers,
  Copy,
  Check,
  RotateCcw,
  Download,
  AlertCircle,
  Brain,
  Zap,
  CheckCircle2,
  Mic,
  Maximize2,
  Minimize2,
  X,
  Volume2,
  VolumeX,
  FileText
} from 'lucide-react';
import { useGRC } from '../../context/GRCContext';
import { organizationService } from '../../services/organizationService';
import { AudioTranscriptionInput } from './AudioTranscriptionInput';
import { CopilotMarkdown } from './CopilotMarkdown';
import { safeConfirm } from '../../utils/safeConfirm';

export interface ChatMessageTurn {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  modelUsed?: string;
  roleTag?: string;
}

export type ModelTypeOption = 'complex' | 'general' | 'fast';

export interface RoleConfig {
  id: string;
  label: string;
  icon: string;
  description: string;
  defaultModel: ModelTypeOption;
  badgeColor: string;
}

export const ROLE_CONFIGS: Record<string, RoleConfig> = {
  CHIEF_GRC: {
    id: 'CHIEF_GRC',
    label: 'Chief GRC Executive Advisor',
    icon: '🛡️',
    description: 'Executive governance strategy, board risk reporting, and multi-framework alignment.',
    defaultModel: 'general',
    badgeColor: 'bg-indigo-950 text-indigo-300 border-indigo-700/60'
  },
  ISO_AUDITOR: {
    id: 'ISO_AUDITOR',
    label: 'Principal ISO 27001/42001 Auditor',
    icon: '🔍',
    description: 'Rigorous clause breakdown, Statement of Applicability (SoA), and non-conformity analysis.',
    defaultModel: 'complex',
    badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-700/60'
  },
  MAS_TRM: {
    id: 'MAS_TRM',
    label: 'MAS TRM & Cyber Hygiene Specialist',
    icon: '🏦',
    description: 'Monetary Authority of Singapore (MAS) TRM, 1-Hour Incident SLA, and critical systems security.',
    defaultModel: 'complex',
    badgeColor: 'bg-sky-950 text-sky-300 border-sky-700/60'
  },
  RISK_REMEDIATION: {
    id: 'RISK_REMEDIATION',
    label: 'Incident & CAPA Commander',
    icon: '🚨',
    description: 'Threat containment, root cause analysis (5-Whys), and corrective action workstreams.',
    defaultModel: 'general',
    badgeColor: 'bg-amber-950 text-amber-300 border-amber-700/60'
  },
  FAST_ASSISTANT: {
    id: 'FAST_ASSISTANT',
    label: 'Rapid Compliance Assistant',
    icon: '⚡',
    description: 'Fast definitions, snappy procedural checks, and instant control citations.',
    defaultModel: 'fast',
    badgeColor: 'bg-purple-950 text-purple-300 border-purple-700/60'
  }
};

export interface GeminiMultiTurnChatbotProps {
  isOpen?: boolean;
  onClose?: () => void;
  isModal?: boolean;
  initialRole?: string;
  initialModel?: ModelTypeOption;
}

export const GeminiMultiTurnChatbot: React.FC<GeminiMultiTurnChatbotProps> = ({
  isOpen = true,
  onClose,
  isModal = false,
  initialRole = 'CHIEF_GRC',
  initialModel = 'general'
}) => {
  const { currentTenant, currentUser } = useGRC();

  const [selectedRole, setSelectedRole] = useState<string>(initialRole);
  const [selectedModel, setSelectedModel] = useState<ModelTypeOption>(initialModel);
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initial greeting
  const [messages, setMessages] = useState<ChatMessageTurn[]>([
    {
      id: 'msg-init',
      role: 'model',
      text: `Hello ${currentUser?.name?.split(' ')[0] || 'GRC Officer'}! I am your **SKANDA Gemini Multi-Turn Chatbot**.

I maintain our active conversation history and apply specialized role-based system instructions to evaluate your compliance roadmap for **${organizationService.getOrganizationName(currentTenant, 'Organization')}**.

### Operating Parameters:
- **Active Role**: ${ROLE_CONFIGS[initialRole]?.label || 'Chief GRC Executive Advisor'}
- **Current Model**: ${
        initialModel === 'complex'
          ? 'gemini-3.1-pro-preview (Complex Tasks)'
          : initialModel === 'fast'
          ? 'gemini-3.1-flash-lite (Fast Tasks)'
          : 'gemini-3.5-flash (General Tasks)'
      }
- **Voice Transcription**: Use the **Microphone button** below to speak your questions with **gemini-3.5-transcribe**

How can I assist your compliance posture or audit preparations?`,
      timestamp: 'Just now',
      modelUsed: initialModel === 'complex' ? 'gemini-3.1-pro-preview' : initialModel === 'fast' ? 'gemini-3.1-flash-lite' : 'gemini-3.5-flash',
      roleTag: ROLE_CONFIGS[initialRole]?.label
    }
  ]);

  const activeRoleConfig = ROLE_CONFIGS[selectedRole] || ROLE_CONFIGS.CHIEF_GRC;

  // Auto-scroll when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Adjust textarea height dynamically
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  };

  const handleRoleChange = (roleId: string) => {
    setSelectedRole(roleId);
    const config = ROLE_CONFIGS[roleId];
    if (config) {
      setSelectedModel(config.defaultModel);
    }
  };

  const handleSendMessage = async (overrideText?: string) => {
    const text = (overrideText || inputText).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessageTurn = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputText('');
    setIsLoading(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      const response = await fetch('/api/v1/ai/multi-turn-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({
            role: m.role,
            text: m.text
          })),
          role: selectedRole,
          modelType: selectedModel,
          tenantContext: {
            organizationName: organizationService.getOrganizationName(currentTenant, 'Organization'),
            readinessScore: currentTenant?.readinessScore || 96,
            frameworks: 'ISO/IEC 27001:2022, MAS TRM Guidelines, ISO 42001'
          }
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to receive AI reply');
      }

      const aiMessage: ChatMessageTurn = {
        id: `ai-${Date.now()}`,
        role: 'model',
        text: data.reply || 'No response generated.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.modelUsed || selectedModel,
        roleTag: activeRoleConfig.label
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessageTurn = {
        id: `err-${Date.now()}`,
        role: 'model',
        text: `⚠️ **Error receiving Gemini response**: ${err?.message || 'Network failure or quota exhaustion.'}\n\nPlease verify your connection or try switching to \`gemini-3.5-flash\` or \`gemini-3.1-flash-lite\`.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: 'system'
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeech = (id: string, text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#_`~\[\]]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);
    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  const handleClearChat = () => {
    if (safeConfirm('Reset this multi-turn conversation thread?')) {
      setMessages([
        {
          id: `msg-${Date.now()}`,
          role: 'model',
          text: `Conversation history reset. You are conversing with the **${activeRoleConfig.label}** using **${selectedModel}**.\n\nHow can I help you today?`,
          timestamp: 'Just now',
          modelUsed: selectedModel,
          roleTag: activeRoleConfig.label
        }
      ]);
    }
  };

  const handleExportTranscript = () => {
    const formatted = messages
      .map(m => `### [${m.timestamp}] ${m.role === 'user' ? 'Auditor / User' : `AI: ${m.roleTag || 'Consultant'} (${m.modelUsed})`}\n\n${m.text}\n`)
      .join('\n---\n\n');

    const header = `# SKANDA Enterprise GRC Consultation Transcript
Generated: ${new Date().toLocaleString()}
Organization: ${organizationService.getOrganizationName(currentTenant, 'Organization')}
Role: ${activeRoleConfig.label}
Model Configuration: ${selectedModel}

=======================================================

${formatted}`;

    const blob = new Blob([header], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SKANDA_GRC_Chat_${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const suggestedPrompts = [
    "What are the mandatory clauses under ISO 27001:2022?",
    "Explain the MAS 1-Hour incident notification requirement.",
    "Evaluate our Annex A.5.15 access control compliance.",
    "How to establish a risk appetite statement under ISO 31000?",
    "Draft an incident root-cause analysis (5-Whys) template."
  ];

  if (!isOpen) return null;

  return (
    <div
      className={`flex flex-col bg-slate-950 border border-slate-800 shadow-2xl rounded-2xl overflow-hidden transition-all duration-200 ${
        isModal
          ? isFullscreen
            ? 'fixed inset-4 z-50 rounded-2xl'
            : 'fixed inset-y-12 right-6 w-full max-w-2xl z-50'
          : 'w-full h-full'
      }`}
    >
      {/* Top Header */}
      <div className="px-5 py-3.5 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-600 flex items-center justify-center text-white shadow-md shadow-indigo-950/50">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-100">SKANDA Gemini Multi-Turn Chatbot</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/60 font-semibold">
                Multi-Turn Live
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Role-guided enterprise advisory with microphone audio transcription
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleClearChat}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-colors"
            title="Clear conversation history"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={handleExportTranscript}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-colors"
            title="Export conversation transcript (Markdown)"
          >
            <Download className="w-4 h-4" />
          </button>
          {isModal && (
            <button
              onClick={() => setIsFullscreen(prev => !prev)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-300 hover:bg-rose-950/40 border border-transparent hover:border-rose-800/50 transition-colors"
              title="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Role & Model Selector Sub-Header */}
      <div className="px-5 py-2.5 bg-slate-900/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Role Selector */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">Role:</span>
          <select
            value={selectedRole}
            onChange={e => handleRoleChange(e.target.value)}
            className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            {Object.values(ROLE_CONFIGS).map(role => (
              <option key={role.id} value={role.id}>
                {role.icon} {role.label}
              </option>
            ))}
          </select>
        </div>

        {/* Model Selector Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setSelectedModel('fast')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 cursor-pointer ${
              selectedModel === 'fast'
                ? 'bg-purple-950 text-purple-200 border border-purple-600/70 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="gemini-3.1-flash-lite: Fast tasks, definitions, and quick lookups"
          >
            <Zap className="w-3 h-3 text-purple-400" />
            <span>Fast</span>
            <span className="text-[10px] opacity-70 hidden sm:inline">(3.1-lite)</span>
          </button>

          <button
            onClick={() => setSelectedModel('general')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 cursor-pointer ${
              selectedModel === 'general'
                ? 'bg-indigo-950 text-indigo-200 border border-indigo-600/70 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="gemini-3.5-flash: General tasks, summaries, and audit workflows"
          >
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>General</span>
            <span className="text-[10px] opacity-70 hidden sm:inline">(3.5-flash)</span>
          </button>

          <button
            onClick={() => setSelectedModel('complex')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 cursor-pointer ${
              selectedModel === 'complex'
                ? 'bg-sky-950 text-sky-200 border border-sky-600/70 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="gemini-3.1-pro-preview: Particularly complex tasks, deep reasoning, and multi-clause audits"
          >
            <Brain className="w-3 h-3 text-sky-400" />
            <span>Complex</span>
            <span className="text-[10px] opacity-70 hidden sm:inline">(3.1-pro)</span>
          </button>
        </div>
      </div>

      {/* Role Description Banner */}
      <div className="px-5 py-1.5 bg-slate-950/80 border-b border-slate-900 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5 truncate">
          <span className="text-base">{activeRoleConfig.icon}</span>
          <span className="font-semibold text-slate-300">{activeRoleConfig.label}:</span>
          <span className="truncate">{activeRoleConfig.description}</span>
        </div>
        <span className="shrink-0 text-[10px] font-mono text-slate-500">
          History: {messages.length} messages
        </span>
      </div>

      {/* Scrollable Message Thread */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 scroll-smooth">
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          const isCopied = copiedId === msg.id;
          const isSpeaking = speakingId === msg.id;

          return (
            <div
              key={msg.id || index}
              className={`flex gap-3 group ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-lg bg-indigo-950 border border-indigo-700/60 flex items-center justify-center text-indigo-400 shrink-0 mt-1 shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 transition-all duration-200 ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-tr-sm shadow-md'
                    : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-tl-sm shadow-lg'
                }`}
              >
                {/* Message Header (Sender label, timestamp, model) */}
                <div className="flex items-center justify-between gap-3 mb-1.5 text-[11px]">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <span>{isUser ? 'You' : msg.roleTag || 'SKANDA AI'}</span>
                    {!isUser && msg.modelUsed && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        {msg.modelUsed}
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] ${isUser ? 'text-indigo-200' : 'text-slate-500'}`}>
                    {msg.timestamp}
                  </span>
                </div>

                {/* Message Content */}
                <div className={`text-xs sm:text-sm leading-relaxed ${isUser ? 'text-white' : 'text-slate-200'}`}>
                  {isUser ? (
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  ) : (
                    <CopilotMarkdown content={msg.text} />
                  )}
                </div>

                {/* AI Message Action Footer (Copy, Speech) */}
                {!isUser && (
                  <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                        title="Copy message text"
                      >
                        {isCopied ? (
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

                      <button
                        onClick={() => handleSpeech(msg.id, msg.text)}
                        className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                        title={isSpeaking ? 'Stop speaking' : 'Read message aloud (TTS)'}
                      >
                        {isSpeaking ? (
                          <>
                            <VolumeX className="w-3 h-3 text-rose-400" />
                            <span className="text-rose-400">Stop</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3 h-3" />
                            <span>Listen</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-7 h-7 rounded-lg bg-indigo-700 flex items-center justify-center text-white shrink-0 mt-1 shadow-sm">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-7 h-7 rounded-lg bg-indigo-950 border border-indigo-700/60 flex items-center justify-center text-indigo-400 shrink-0 mt-1 animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-sm p-4 text-xs text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
              <span>
                {activeRoleConfig.label} is analyzing using{' '}
                <strong className="text-slate-200">{selectedModel}</strong>...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts Pill Bar */}
      {messages.length <= 3 && (
        <div className="px-5 py-2 bg-slate-950 border-t border-slate-900 overflow-x-auto">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold whitespace-nowrap">
              Suggested:
            </span>
            {suggestedPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(prompt)}
                disabled={isLoading}
                className="whitespace-nowrap text-xs px-2.5 py-1 rounded-full bg-slate-900 hover:bg-indigo-950/80 text-slate-300 hover:text-indigo-200 border border-slate-800 hover:border-indigo-700/60 transition-colors cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Composer with Microphone Transcription Button */}
      <div className="p-4 bg-slate-900 border-t border-slate-800">
        <div className="relative flex items-end gap-2 bg-slate-950 rounded-xl border border-slate-800 p-2 focus-within:border-indigo-600 focus-within:ring-1 focus-within:ring-indigo-600 transition-all">
          {/* Microphone Audio Input (Uses model: gemini-3.5-transcribe) */}
          <AudioTranscriptionInput
            onTranscriptionComplete={transcribed => {
              if (transcribed) {
                setInputText(prev => (prev ? `${prev} ${transcribed}` : transcribed));
                if (textareaRef.current) {
                  textareaRef.current.focus();
                }
              }
            }}
            promptHint="Transcribe the spoken compliance or audit question accurately into clear text."
            disabled={isLoading}
          />

          {/* Text Area */}
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder={`Ask ${activeRoleConfig.label} (Enter to send, Shift+Enter for newline, or click Mic to transcribe)...`}
            rows={1}
            disabled={isLoading}
            className="flex-1 bg-transparent text-slate-200 text-xs sm:text-sm resize-none focus:outline-none placeholder:text-slate-500 py-1.5 px-2 max-h-40 min-h-[36px]"
          />

          {/* Send Button */}
          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isLoading}
            className={`p-2 rounded-lg transition-all flex items-center justify-center shrink-0 cursor-pointer ${
              inputText.trim() && !isLoading
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-900/40'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
            title="Send query"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Footer info note */}
        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 px-1">
          <div className="flex items-center gap-2">
            <span>Model: <strong className="text-slate-400 font-mono">{selectedModel}</strong></span>
            <span>•</span>
            <span>Mic Transcribe: <strong className="text-slate-400 font-mono">gemini-3.5-transcribe</strong></span>
          </div>
          <span>Shift+Enter for newline</span>
        </div>
      </div>
    </div>
  );
};
