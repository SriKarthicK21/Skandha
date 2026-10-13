/**
 * SKANDA Enterprise Framework Factory — AI Framework Copilot
 * Path: src/components/framework-factory/AIFrameworkCopilotView.tsx
 */

import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  ShieldCheck,
  BookOpen,
  Info,
  Layers,
  ArrowRightLeft,
  Lock,
  ExternalLink,
  ChevronRight,
  Terminal,
  Bot,
  User,
  AlertTriangle
} from 'lucide-react';
import { AIFrameworkQuery, AIFrameworkResponse, SourceProvenanceTier } from '../../types/frameworkFactoryTypes';

interface AIFrameworkCopilotViewProps {
  onQueryCopilot: (query: AIFrameworkQuery) => AIFrameworkResponse;
  onSelectFramework: (frameworkCode: string) => void;
}

interface MessageItem {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  response?: AIFrameworkResponse;
  timestamp: string;
}

export const AIFrameworkCopilotView: React.FC<AIFrameworkCopilotViewProps> = ({
  onQueryCopilot,
  onSelectFramework
}) => {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: `Hello! I am your **SKANDA AI Framework Copilot**. I provide strictly grounded answers regarding multi-framework applicability, cross-standard control harmonization, regulatory version migration, and evidence reusability. Every response is tagged with its authoritative provenance tier.

Ask me questions like:
- *"What frameworks apply to our FinTech SaaS platform?"*
- *"What changed between ISO 27001:2013 and ISO 27001:2022?"*
- *"Which frameworks can our MFA and Encryption controls satisfy simultaneously?"*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const quickPrompts = [
    'What frameworks apply to us?',
    'What changed in ISO 27001:2022?',
    'How does 1 MFA control satisfy multi-framework obligations?',
    'Compare GDPR vs India DPDP Act 2023',
    'Explain DORA Article 28 Third-Party ICT Risk'
  ];

  const handleSend = (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    const userMsg: MessageItem = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    // Query grounded Copilot Engine
    const copilotRes = onQueryCopilot({
      tenantId: 'tenant-enterprise-01',
      query
    });

    const assistantMsg: MessageItem = {
      id: `msg-resp-${Date.now()}`,
      sender: 'assistant',
      text: copilotRes.answer,
      response: copilotRes,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, assistantMsg]);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            AI Framework Copilot & Provenance-Grounded Advisory
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Strict provenance classification: DIRECT_SOURCE • SOURCE_DERIVED • SKANDA_INTERPRETATION • SKANDA_RECOMMENDATION • FAIL-CLOSED ON UNKNOWN.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Zero Hallucination • Grounded on Official Gazettes & Standards</span>
        </div>
      </div>

      {/* Main Chat Box Layout */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[650px] overflow-hidden">
        {/* Messages Scroll Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map(msg => {
            const isUser = msg.sender === 'user';
            const provenance = msg.response?.provenance;

            return (
              <div
                key={msg.id}
                className={`flex gap-3.5 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  isUser
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white'
                }`}>
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div className="space-y-2 max-w-2xl">
                  {/* Provenance Badge for AI Responses */}
                  {!isUser && provenance && (
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        provenance === 'DIRECT_SOURCE'
                          ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300/40'
                          : provenance === 'SOURCE_DERIVED'
                          ? 'bg-cyan-100 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300 border border-cyan-300/40'
                          : provenance === 'SKANDA_RECOMMENDATION'
                          ? 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-300/40'
                          : provenance === 'SKANDA_INTERPRETATION'
                          ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-300/40'
                          : 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-300/40'
                      }`}>
                        PROVENANCE: {provenance.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] text-slate-600 dark:text-slate-300">{msg.timestamp}</span>
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 rounded-tl-none space-y-2'
                  }`}>
                    <div className="whitespace-pre-wrap">{msg.text}</div>

                    {/* Citations Box if available */}
                    {msg.response?.sourceCitations && msg.response.sourceCitations.length > 0 && (
                      <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 space-y-1 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        <div className="font-bold text-slate-700 dark:text-slate-300">Authoritative Citations:</div>
                        {msg.response.sourceCitations.map((cit, idx) => (
                          <div key={idx} className="flex items-center gap-1.5">
                            <BookOpen className="w-3 h-3 text-indigo-500" />
                            <span>{cit.citation}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Prompts Bar */}
        <div className="px-6 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center gap-2 overflow-x-auto scrollbar-none text-xs">
          <span className="text-[11px] font-bold text-slate-400 shrink-0">Quick Queries:</span>
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="px-3 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-400 hover:text-indigo-600 whitespace-nowrap transition-all text-[11px]"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-3">
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Ask AI Copilot about any framework, requirement, mapping, or change impact..."
            className="flex-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <button
            onClick={() => handleSend()}
            disabled={!inputText.trim()}
            className="px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
