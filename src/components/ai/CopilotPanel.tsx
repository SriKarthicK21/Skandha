import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  X,
  Minus,
  Send,
  Move,
  MoreVertical,
  RotateCcw,
  Copy,
  Check,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
  Lock,
  Compass,
  Download,
  Volume2,
  VolumeX,
  CornerDownLeft,
  Bot
} from 'lucide-react';
import { SkandaGRCopilotIcon } from './SkandaGRCopilotIcon';
import { CopilotMarkdown } from './CopilotMarkdown';
import { AudioTranscriptionInput } from './AudioTranscriptionInput';
import {
  PanelPlacement,
  SnapPreset
} from './CopilotPositionManager';

export interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  citations?: Array<{ label: string; ref: string }>;
  actions?: Array<{ label: string; moduleId: string; actionType?: string }>;
}

export interface CopilotPanelProps {
  placement: PanelPlacement;
  isOpen: boolean;
  onMinimize: () => void;
  onClose: () => void;
  onResetPosition: () => void;
  onSnapToPreset: (preset: SnapPreset) => void;
  status: 'online' | 'processing' | 'offline' | 'idle';
  currentFrameworkLabel: string;
  currentModuleContext: string;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isTyping: boolean;
  onNavigateModule?: (moduleId: string) => void;
  onClearChat: () => void;
  onOpenMultiTurnChatbot?: () => void;
}

/**
 * CopilotPanel
 * Expanded conversational intelligence panel for SKANDA GRC AI Copilot.
 * 
 * Features:
 * - High-fidelity Markdown & Table rendering
 * - Multi-line composer with auto-resize (Enter sends, Shift+Enter newlines)
 * - Dynamic context-aware prompt recommendations
 * - Speech synthesis TTS (read response aloud)
 * - Export audit consultation log
 * - 1-Click reposition presets
 */
export const CopilotPanel: React.FC<CopilotPanelProps> = ({
  placement,
  isOpen,
  onMinimize,
  onClose,
  onResetPosition,
  onSnapToPreset,
  status = 'online',
  currentFrameworkLabel,
  currentModuleContext,
  messages,
  onSendMessage,
  isTyping,
  onNavigateModule,
  onClearChat,
  onOpenMultiTurnChatbot
}) => {
  const [inputText, setInputText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [resetFeedback, setResetFeedback] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Dynamic context-aware suggestions based on active module & framework
  const contextualSuggestions = useMemo(() => {
    const lower = (currentModuleContext + ' ' + currentFrameworkLabel).toLowerCase();

    if (lower.includes('risk')) {
      return [
        "Show our top 5 critical risks in matrix",
        "Summarize Clause 6.1.2 risk appetite",
        "Which risks lack compensating controls?",
        "Explain RSK-001 zero-day mitigation"
      ];
    }
    if (lower.includes('evidence')) {
      return [
        "Which controls need evidence before audit?",
        "Summarize unhashed evidence files",
        "How to verify AWS IAM access logs?",
        "List overdue Q3 evidence submissions"
      ];
    }
    if (lower.includes('mas')) {
      return [
        "How to satisfy MAS 1-Hour Incident SLA?",
        "What is our RTO & RPO recovery posture?",
        "Explain cyber hygiene notice 655",
        "Review MAS critical system dependencies"
      ];
    }
    if (lower.includes('42001') || lower.includes('ai governance') || lower.includes('aims')) {
      return [
        "Summarize AI impact assessment readiness",
        "What are our ISO 42001 governance gaps?",
        "Explain algorithmic transparency controls",
        "How to audit machine learning training data?"
      ];
    }
    if (lower.includes('findings') || lower.includes('capa')) {
      return [
        "Show overdue CAPA remediation actions",
        "What are our open Stage 1 findings?",
        "Root cause analysis for vendor OFI-01",
        "Prepare remediation report for CISO"
      ];
    }

    // Default executive overview prompts
    return [
      "Why is our compliance readiness 96.4%?",
      "Show our top 5 compliance risks",
      "Which controls need evidence before audit?",
      "Prepare for the next certification audit",
      "Explain our ISO 27001 Annex A gaps",
      "How to satisfy MAS 1-Hour Incident SLA?"
    ];
  }, [currentModuleContext, currentFrameworkLabel]);

  // Auto-scroll messages to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  // Focus textarea when opened
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        textareaRef.current?.focus();
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Keyboard shortcut: Escape to minimize or dismiss submenus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        if (showMenu) {
          setShowMenu(false);
        } else if (showMoveModal) {
          setShowMoveModal(false);
        } else if (showPrivacyModal) {
          setShowPrivacyModal(false);
        } else {
          onMinimize();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showMenu, showMoveModal, showPrivacyModal, onMinimize]);

  // Speech synthesis TTS handler
  const handleToggleSpeak = (id: string, text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#`_\[\]()]/g, '').slice(0, 500);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  // Copy message text
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Export chat as GRC Consultation Record
  const handleExportChat = () => {
    const header = `==========================================================\nSKANDA ENTERPRISE GRC AI CONSULTATION RECORD\nGenerated: ${new Date().toISOString()}\nFramework: ${currentFrameworkLabel}\nModule Context: ${currentModuleContext}\n==========================================================\n\n`;
    const body = messages
      .map(m => `[${m.timestamp}] ${m.sender === 'ai' ? 'SKANDA COPILOT' : 'USER'}:\n${m.text}\n`)
      .join('\n----------------------------------------------------------\n\n');

    const blob = new Blob([header + body], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `skanda-grc-copilot-notes-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setShowMenu(false);
  };

  // Form submit: triggers onSendMessage
  const handleSend = () => {
    if (!inputText.trim() || isTyping) return;
    onSendMessage(inputText.trim());
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDownComposer = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    const target = e.target;
    target.style.height = 'auto';
    target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-label="GRC AI Copilot Workspace"
      aria-modal="true"
      style={{
        position: 'fixed',
        left: `${placement.left}px`,
        top: `${placement.top}px`,
        width: `${placement.width}px`,
        height: `${placement.height}px`,
        zIndex: 45
      }}
      className="rounded-2xl border border-indigo-500/35 bg-[#0D1222]/98 shadow-[0_25px_60px_rgba(0,0,0,0.85),0_0_35px_rgba(99,102,241,0.25)] backdrop-blur-2xl flex flex-col overflow-hidden text-slate-100 transition-all duration-300 animate-in fade-in zoom-in-95"
    >
      {/* 1. Header with Status & Toolbar */}
      <div className="px-4 py-3 border-b border-indigo-500/20 bg-[#0A0E1A] flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center space-x-2.5">
          <SkandaGRCopilotIcon
            size={28}
            status={status}
            animate={status === 'processing'}
          />
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xs font-bold text-white tracking-tight flex items-center space-x-1.5">
                <span>GRC AI Copilot</span>
              </h3>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Enterprise
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium truncate max-w-[200px]">
              {currentFrameworkLabel}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-1">
          {/* Quick Reposition Trigger */}
          <button
            type="button"
            onClick={() => {
              setShowMoveModal(!showMoveModal);
              setShowMenu(false);
            }}
            className={`p-1.5 rounded-lg transition ${
              showMoveModal
                ? 'bg-indigo-600/30 text-indigo-300'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
            title="Snap Copilot to corner/edge"
            aria-label="Reposition Copilot"
          >
            <Move className="w-3.5 h-3.5" />
          </button>

          {/* More Options Menu (⋮) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowMenu(!showMenu);
                setShowMoveModal(false);
              }}
              className={`p-1.5 rounded-lg transition ${
                showMenu
                  ? 'bg-indigo-600/30 text-indigo-300'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
              title="Copilot Options"
              aria-label="Copilot Options"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {/* Menu Popover */}
            {showMenu && (
              <div
                className="absolute right-0 mt-1 w-56 rounded-xl bg-slate-900/98 border border-slate-700 shadow-2xl py-1 z-50 text-xs backdrop-blur-lg animate-in fade-in zoom-in-95"
              >
                <div className="px-3 py-1.5 border-b border-slate-800 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  Copilot Controls
                </div>
                <button
                  type="button"
                  id="copilot-action-reset-position"
                  onClick={() => {
                    onResetPosition();
                    setShowMenu(false);
                    setResetFeedback(true);
                    setTimeout(() => setResetFeedback(false), 2400);
                  }}
                  className="w-full text-left px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center justify-between group"
                  title="Revert AI widget coordinates to default state (Bottom-Right)"
                  aria-label="Reset Position"
                >
                  <div className="flex items-center space-x-2">
                    <RotateCcw className="w-3.5 h-3.5 text-indigo-400 group-hover:rotate-[-45deg] transition-transform duration-200" />
                    <span className="font-medium text-slate-200 group-hover:text-white">Reset Position</span>
                  </div>
                  <span className="text-[9px] text-indigo-400/80 font-mono bg-indigo-950/70 px-1.5 py-0.5 rounded border border-indigo-500/30">
                    Default
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMoveModal(true);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center space-x-2"
                >
                  <Compass className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Position Presets</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportChat}
                  className="w-full text-left px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center space-x-2"
                >
                  <Download className="w-3.5 h-3.5 text-sky-400" />
                  <span>Export Consultation Notes</span>
                </button>
                {onOpenMultiTurnChatbot && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenMultiTurnChatbot();
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-indigo-300 hover:text-white hover:bg-indigo-950/80 transition flex items-center space-x-2 border-t border-b border-slate-800"
                  >
                    <Bot className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="font-semibold">Gemini Multi-Turn Chatbot</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    onClearChat();
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center space-x-2"
                >
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  <span>Clear Conversation</span>
                </button>
                <div className="border-t border-slate-800 my-1" />
                <button
                  type="button"
                  onClick={() => {
                    setShowPrivacyModal(true);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center space-x-2"
                >
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Privacy & Tenant Isolation</span>
                </button>
              </div>
            )}
          </div>

          {/* Multi-Turn Chatbot Button */}
          {onOpenMultiTurnChatbot && (
            <button
              type="button"
              onClick={onOpenMultiTurnChatbot}
              className="px-2 py-1 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 hover:text-white border border-indigo-700/60 text-[10px] font-semibold flex items-center space-x-1 transition shadow-sm cursor-pointer"
              title="Open Gemini Multi-Turn Chatbot with Role Selection"
            >
              <Bot className="w-3 h-3 text-indigo-400" />
              <span className="hidden sm:inline">Multi-Turn</span>
            </button>
          )}

          {/* Minimize Button */}
          <button
            type="button"
            onClick={onMinimize}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
            title="Minimize Copilot (Esc)"
            aria-label="Minimize Copilot"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
            title="Hide Copilot (Re-open from Header)"
            aria-label="Close Copilot"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Reposition Presets Sub-Bar */}
      {showMoveModal && (
        <div className="p-3 bg-slate-900/98 border-b border-indigo-500/25 text-xs animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-white flex items-center space-x-1.5 text-[11px]">
              <Compass className="w-3.5 h-3.5 text-indigo-400" />
              <span>Select Screen Edge Docking Preset</span>
            </span>
            <button
              type="button"
              onClick={() => setShowMoveModal(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => {
                onSnapToPreset('top-left');
                setShowMoveModal(false);
              }}
              className="p-1.5 rounded-lg bg-slate-800/90 hover:bg-indigo-950/80 text-slate-300 hover:text-white border border-slate-700/80 hover:border-indigo-500/50 text-[11px] font-medium transition"
            >
              ↖ Top-Left
            </button>
            <button
              type="button"
              onClick={() => {
                onSnapToPreset('top-right');
                setShowMoveModal(false);
              }}
              className="p-1.5 rounded-lg bg-slate-800/90 hover:bg-indigo-950/80 text-slate-300 hover:text-white border border-slate-700/80 hover:border-indigo-500/50 text-[11px] font-medium transition"
            >
              ↗ Top-Right
            </button>
            <button
              type="button"
              onClick={() => {
                onSnapToPreset('middle-left');
                setShowMoveModal(false);
              }}
              className="p-1.5 rounded-lg bg-slate-800/90 hover:bg-indigo-950/80 text-slate-300 hover:text-white border border-slate-700/80 hover:border-indigo-500/50 text-[11px] font-medium transition"
            >
              ← Middle-Left
            </button>
            <button
              type="button"
              onClick={() => {
                onSnapToPreset('middle-right');
                setShowMoveModal(false);
              }}
              className="p-1.5 rounded-lg bg-slate-800/90 hover:bg-indigo-950/80 text-slate-300 hover:text-white border border-slate-700/80 hover:border-indigo-500/50 text-[11px] font-medium transition"
            >
              → Middle-Right
            </button>
            <button
              type="button"
              onClick={() => {
                onSnapToPreset('bottom-left');
                setShowMoveModal(false);
              }}
              className="p-1.5 rounded-lg bg-slate-800/90 hover:bg-indigo-950/80 text-slate-300 hover:text-white border border-slate-700/80 hover:border-indigo-500/50 text-[11px] font-medium transition"
            >
              ↙ Bottom-Left
            </button>
            <button
              type="button"
              onClick={() => {
                onSnapToPreset('bottom-right');
                setShowMoveModal(false);
              }}
              className="p-1.5 rounded-lg bg-slate-800/90 hover:bg-indigo-950/80 text-slate-300 hover:text-white border border-slate-700/80 hover:border-indigo-500/50 text-[11px] font-medium transition"
            >
              ↘ Bottom-Right
            </button>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-[10px] text-slate-400">Want default coordinates?</span>
            <button
              type="button"
              onClick={() => {
                onResetPosition();
                setShowMoveModal(false);
                setResetFeedback(true);
                setTimeout(() => setResetFeedback(false), 2400);
              }}
              className="px-2.5 py-1 text-[10px] font-medium text-indigo-300 hover:text-white bg-indigo-950/70 hover:bg-indigo-900/90 rounded-md border border-indigo-500/40 flex items-center space-x-1.5 transition active:scale-95 shadow-sm"
              title="Reset Position to Default (Bottom-Right)"
            >
              <RotateCcw className="w-3 h-3 text-indigo-400" />
              <span>Reset Position</span>
            </button>
          </div>
        </div>
      )}

      {/* Privacy & Data Isolation Info Overlay */}
      {showPrivacyModal && (
        <div className="p-3.5 bg-slate-900/98 border-b border-indigo-500/30 text-xs animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
              <Shield className="w-3.5 h-3.5" />
              <span>SKANDA Enterprise Privacy & Isolation</span>
            </div>
            <button
              type="button"
              onClick={() => setShowPrivacyModal(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed mb-2.5">
            All AI queries are strictly bounded to your organization's tenant context with zero cross-tenant leakage. Audit hashes, evidence, and prompts are processed under enterprise confidentiality and never used to train public models.
          </p>
          <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-mono">
            <span className="text-emerald-400">● Strict RBAC</span>
            <span>•</span>
            <span className="text-indigo-400">Zero Retention</span>
            <span>•</span>
            <span className="text-sky-400">Cryptographically Audited</span>
          </div>
        </div>
      )}

      {/* 2. Context-Aware Sub-header */}
      <div className="px-3.5 py-1.5 bg-[#0B0F19]/90 border-b border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400 select-none">
        <div className="flex items-center space-x-1.5 truncate">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
          <span className="text-indigo-300 font-semibold truncate">Live Scope:</span>
          <span className="text-slate-300 truncate">{currentModuleContext}</span>
        </div>
        <span className="text-slate-500 shrink-0 pl-2">Esc to minimize</span>
      </div>

      {/* Position Reset Success Confirmation */}
      {resetFeedback && (
        <div className="px-3 py-1.5 bg-emerald-950/90 border-b border-emerald-500/40 text-[11px] text-emerald-200 flex items-center justify-between animate-in slide-in-from-top-1 transition-all select-none">
          <div className="flex items-center space-x-2">
            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Widget position reverted to default (Bottom-Right)</span>
          </div>
          <button
            type="button"
            onClick={() => setResetFeedback(false)}
            className="text-emerald-400 hover:text-white p-0.5"
            aria-label="Dismiss reset confirmation"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* 3. Messages Viewport */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-indigo-900/40">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} group`}
          >
            {/* Sender Meta Tag */}
            <div className="flex items-center space-x-1.5 mb-1 text-[10px] text-slate-400 select-none">
              {msg.sender === 'ai' ? (
                <>
                  <SkandaGRCopilotIcon size={12} status="online" animate={false} />
                  <span className="font-semibold text-indigo-300">GRC AI Copilot</span>
                </>
              ) : (
                <span className="font-semibold text-slate-300">You</span>
              )}
              <span>•</span>
              <span className="font-mono text-slate-500">{msg.timestamp}</span>
            </div>

            {/* Bubble Container */}
            <div
              className={`relative p-3.5 rounded-2xl text-xs leading-relaxed max-w-[94%] shadow-md ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-600 text-white rounded-tr-xs'
                  : 'bg-slate-900/95 text-slate-200 border border-indigo-500/25 rounded-tl-xs'
              }`}
            >
              {/* Formatted Markdown Body */}
              <div className="select-text">
                <CopilotMarkdown
                  content={msg.text}
                  onNavigateModule={onNavigateModule}
                />
              </div>

              {/* Citations / Regulatory References */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-3 pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 font-mono">Citations:</span>
                  {msg.citations.map((cite, cIdx) => (
                    <span
                      key={cIdx}
                      className="px-2 py-0.5 rounded bg-indigo-950/80 border border-indigo-700/50 text-[10px] text-indigo-300 font-mono"
                    >
                      {cite.label} ({cite.ref})
                    </span>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              {msg.actions && msg.actions.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap gap-1.5">
                  {msg.actions.map((act, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        if (act.moduleId && onNavigateModule) {
                          onNavigateModule(act.moduleId);
                        }
                      }}
                      className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 hover:text-white border border-indigo-600/50 text-[10px] font-semibold transition shadow-sm active:scale-95"
                    >
                      <span>{act.label}</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </button>
                  ))}
                </div>
              )}

              {/* AI Bubble Tools: Copy & Read Aloud */}
              {msg.sender === 'ai' && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1 bg-slate-900/90 rounded-md p-0.5 border border-slate-700">
                  <button
                    type="button"
                    onClick={() => handleToggleSpeak(msg.id, msg.text)}
                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition"
                    title={speakingId === msg.id ? "Stop voice" : "Read aloud"}
                  >
                    {speakingId === msg.id ? (
                      <VolumeX className="w-3 h-3 text-amber-400 animate-pulse" />
                    ) : (
                      <Volume2 className="w-3 h-3" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopy(msg.id, msg.text)}
                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition"
                    title="Copy response"
                  >
                    {copiedId === msg.id ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Processing/Typing Indicator */}
        {isTyping && (
          <div className="flex items-center space-x-2 text-xs text-indigo-400 p-2 animate-pulse">
            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" />
            <div className="w-2 h-2 rounded-full bg-sky-400 animate-bounce [animation-delay:0.2s]" />
            <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:0.4s]" />
            <span className="text-[11px] text-slate-400 font-mono">
              Analyzing governance artifacts & policy controls...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 4. Clickable Suggestion Prompts */}
      <div className="px-3 py-2 bg-[#0A0E1A]/95 border-t border-indigo-950/60 overflow-x-auto scrollbar-none flex items-center space-x-1.5 select-none shrink-0">
        {contextualSuggestions.map((prompt, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onSendMessage(prompt)}
            className="shrink-0 px-2.5 py-1 rounded-full bg-slate-900/90 hover:bg-indigo-950 text-slate-300 hover:text-indigo-200 border border-slate-800 hover:border-indigo-600/60 text-[10px] font-medium transition flex items-center space-x-1 active:scale-95"
          >
            <Sparkles className="w-2.5 h-2.5 text-indigo-400" />
            <span className="truncate max-w-[200px]">{prompt}</span>
          </button>
        ))}
      </div>

      {/* 5. Chat Composer with Multi-Line Textarea */}
      <div className="p-3 bg-[#0A0E1A] border-t border-indigo-500/20 shrink-0">
        <div className="relative flex items-end bg-slate-900/90 rounded-xl border border-slate-700/80 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500/40 p-1.5 transition gap-1.5">
          {/* Audio transcription via gemini-3.5-transcribe */}
          <AudioTranscriptionInput
            onTranscriptionComplete={text => {
              if (text) {
                setInputText(prev => (prev ? `${prev} ${text}` : text));
                if (textareaRef.current) {
                  textareaRef.current.focus();
                }
              }
            }}
            promptHint="Transcribe the spoken compliance or audit question into clear text."
            size="sm"
            disabled={isTyping}
          />

          <textarea
            ref={textareaRef}
            rows={1}
            placeholder="Ask GRC Copilot or click Mic to dictate..."
            value={inputText}
            onChange={handleTextareaInput}
            onKeyDown={handleKeyDownComposer}
            disabled={isTyping}
            className="w-full bg-transparent px-2 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none resize-none max-h-28 overflow-y-auto scrollbar-none"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!inputText.trim() || isTyping}
            className="p-2 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:from-indigo-500 hover:to-blue-500 transition shadow shrink-0 active:scale-95 cursor-pointer"
            title="Send inquiry (Enter)"
            aria-label="Send inquiry"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="mt-1.5 flex items-center justify-between text-[9px] text-slate-500 font-mono select-none">
          <span className="flex items-center space-x-1 truncate">
            <CornerDownLeft className="w-2.5 h-2.5 text-slate-400 inline" />
            <span>Enter to send • Shift+Enter for newline</span>
          </span>
          <span className="text-indigo-400 font-semibold shrink-0 pl-1">Gemini AI (Mic Enabled)</span>
        </div>
      </div>
    </div>
  );
};
