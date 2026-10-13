// ============================================================================
// SKANDA ENTERPRISE GRC: AI PRIVACY COPILOT DRAWER
// Path: src/components/dpdp/DPDPPrivacyCopilotDrawer.tsx
//
// Source-Grounded Privacy Intelligence Assistant:
// - Answers contextual queries strictly using SKANDA canonical records
// - Clear banner: "AI-GENERATED // HUMAN VALIDATION REQUIRED"
// - Interactive source citations linking to primary GRC entities
// - Strictly barred from making automated legal determinations
// ============================================================================

import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Send,
  ShieldCheck,
  FileText,
  Database,
  Users,
  AlertTriangle,
  ExternalLink,
  Bot
} from 'lucide-react';
import { dpdpPrivacyEngineService } from '../../services/canonical/DpdpPrivacyEngineService';
import { DpdpCopilotResponse } from '../../types/dpdpPlatformTypes';

interface DPDPPrivacyCopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  tenantId: string;
}

export const DPDPPrivacyCopilotDrawer: React.FC<DPDPPrivacyCopilotDrawerProps> = ({
  isOpen,
  onClose,
  tenantId
}) => {
  const [query, setQuery] = useState('');
  const [conversation, setConversation] = useState<DpdpCopilotResponse[]>([
    {
      query: 'What is our current DPDP compliance and personal data posture?',
      answerMarkdown: `### SKANDA Privacy Operations Overview\n- **4 Personal Data Elements** actively cataloged (Workforce, Customer PII, KYC, Payroll).\n- **4 Processing Activities (RoPA)** approved by DPO under lawful grounds.\n- **Customer Privacy Notice v2.1** published in 8 Schedule VIII Indian languages.\n- **0 Open Critical Breach Incidents**.\n- All databases encrypted at rest using AES-256 with KMS keys in AWS Mumbai (ap-south-1).`,
      citedRecordIds: [
        { id: 'not-01', type: 'PRIVACY_NOTICE', title: 'Customer Notice v2.1' },
        { id: 'act-01', type: 'ROPA_ACTIVITY', title: 'User Authentication' },
        { id: 'pde-01', type: 'PERSONAL_DATA', title: 'Customer Name' }
      ],
      confidenceScore: 0.99,
      generatedAt: new Date().toISOString(),
      disclaimer: 'AI-GENERATED // HUMAN VALIDATION REQUIRED'
    }
  ]);
  const [isSearching, setIsSearching] = useState(false);

  if (!isOpen) return null;

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setTimeout(() => {
      const response = dpdpPrivacyEngineService.askPrivacyCopilot(tenantId, query);
      setConversation(prev => [response, ...prev]);
      setQuery('');
      setIsSearching(false);
    }, 300);
  };

  const presetQueries = [
    'What personal data do we process for authentication?',
    'Which cloud processors access customer phone numbers?',
    'What is the status of open Data Principal Rights requests?',
    'Which retention rules have active legal holds?'
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-50/50 via-white to-sky-50/50 dark:from-slate-900 dark:to-indigo-950/30">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">SKANDA Privacy Copilot</h2>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-mono bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  DPDP AI 2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Source-Grounded Privacy Intelligence</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Governance Disclaimer Banner */}
        <div className="px-4 py-2 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200/60 dark:border-amber-900/60 flex items-center space-x-2 text-[11px] text-amber-800 dark:text-amber-300">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>
            <strong>AI-GENERATED // HUMAN VALIDATION REQUIRED.</strong> All responses cite authoritative tenant records. AI cannot make legal determinations.
          </span>
        </div>

        {/* Conversation Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Quick Preset Buttons */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Suggested Queries</span>
            <div className="flex flex-wrap gap-1.5">
              {presetQueries.map((pq, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(pq);
                  }}
                  className="text-left text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  {pq}
                </button>
              ))}
            </div>
          </div>

          {conversation.map((msg, idx) => (
            <div key={idx} className="space-y-2 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 shadow-xs">
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">Q: {msg.query}</span>
                <span>{new Date(msg.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="text-xs text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed border-t border-slate-200/60 dark:border-slate-700/60 pt-2 font-sans">
                {msg.answerMarkdown}
              </div>

              {/* Citations */}
              {msg.citedRecordIds.length > 0 && (
                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Cited SKANDA Records:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.citedRecordIds.map((c, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                      >
                        <FileText className="w-2.5 h-2.5 text-indigo-500" />
                        <span>{c.title}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {isSearching && (
            <div className="flex items-center space-x-2 text-xs text-indigo-600 dark:text-indigo-400 p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800 animate-pulse">
              <Bot className="w-4 h-4 animate-spin" />
              <span>Analyzing canonical DPDP graph for tenant {tenantId}...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center space-x-2">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Ask anything about personal data, RoPA, notices, DSR, processors..."
            className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={!query.trim() || isSearching}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors flex items-center space-x-1"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Ask</span>
          </button>
        </form>
      </div>
    </div>
  );
};
