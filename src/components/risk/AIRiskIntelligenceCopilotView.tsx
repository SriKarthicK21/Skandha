import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  ShieldCheck,
  Flame,
  AlertTriangle,
  FileText,
  Info,
  CheckCircle2,
  RefreshCw,
  Layers,
  ArrowRight
} from 'lucide-react';
import { AIRiskCopilotResponse, AIRiskCopilotQuery } from '../../types/enterpriseRiskTypes';

interface AIRiskCopilotProps {
  onAskCopilot: (question: string) => Promise<AIRiskCopilotResponse>;
}

export const AIRiskIntelligenceCopilotView: React.FC<AIRiskCopilotProps> = ({ onAskCopilot }) => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<AIRiskCopilotResponse[]>([]);

  const samplePrompts = [
    'What are our top enterprise risks exceeding approved risk appetite?',
    'What is our total Annual Loss Expectancy (ALE) and highest financial exposure scenario?',
    'Which business services have the highest concentration of unmitigated risk?',
    'What mitigating controls have significant operating deficiencies?'
  ];

  const handleSend = async (qText?: string) => {
    const textToSubmit = qText || question;
    if (!textToSubmit.trim() || loading) return;

    setLoading(true);
    try {
      const res = await onAskCopilot(textToSubmit);
      setHistory(prev => [res, ...prev]);
      setQuestion('');
    } catch (err) {
      console.error('Copilot query error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* COPILOT HEADER */}
      <div className="bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900/60 border border-indigo-500/20 rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-500/20 border border-indigo-500/30 rounded-lg text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-white">SKANDA AI Risk Intelligence Copilot</h2>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-mono">
              GROUNDED IN REPOSITORY RECORDS
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Ask complex queries regarding enterprise risk posture, financial loss projections, regulatory blast radius, and control effectiveness. Provenance is explicitly tagged on every response.
          </p>
        </div>
      </div>

      {/* SEARCH INPUT & QUICK PROMPTS */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask anything about enterprise risks, financial loss projections, or appetite breaches..."
            disabled={loading}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors shrink-0"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Ask Copilot
          </button>
        </form>

        {/* PROMPT CHIPS */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] text-slate-500">Quick Inquiries:</span>
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              disabled={loading}
              className="text-[11px] bg-slate-800/80 hover:bg-indigo-950/40 text-slate-300 hover:text-indigo-300 border border-slate-700/60 hover:border-indigo-500/30 px-3 py-1.5 rounded-lg transition-all text-left"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* RESPONSES STREAM */}
      <div className="space-y-4">
        {history.length === 0 && (
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-8 text-center text-xs text-slate-500 space-y-2">
            <Sparkles className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-slate-400 font-medium">No inquiries in active session.</p>
            <p className="text-slate-500 text-[11px]">
              Select a quick inquiry above or enter a custom regulatory risk query.
            </p>
          </div>
        )}

        {history.map((resp, idx) => {
          const provenanceBadge =
            resp.provenance === 'DIRECT_SOURCE'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : resp.provenance === 'SOURCE_DERIVED'
              ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
              : resp.provenance === 'SKANDA_INTERPRETATION'
              ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
              : 'bg-rose-500/10 text-rose-400 border-rose-500/30';

          return (
            <div
              key={idx}
              className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-4 animate-in fade-in duration-200"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  Q: {resp.question}
                </span>
                <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded border ${provenanceBadge}`}>
                  PROVENANCE: {resp.provenance}
                </span>
              </div>

              {/* ANSWER MARKDOWN */}
              <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-sans space-y-2 bg-slate-950/40 p-4 rounded-lg border border-slate-800">
                {resp.answerMarkdown}
              </div>

              {/* GRAPH CITATIONS & REFERENCED RECORDS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-[11px]">
                <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-700/40 space-y-1">
                  <span className="text-slate-400 font-semibold block">Referenced Canonical Entities:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {resp.referencedRiskIds.map(id => (
                      <span key={id} className="font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                        {id}
                      </span>
                    ))}
                    {resp.referencedControlIds.map(id => (
                      <span key={id} className="font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {id}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-700/40 space-y-1">
                  <span className="text-slate-400 font-semibold block">Disclosed Limitations & Confidence:</span>
                  <div className="text-slate-400 space-y-0.5">
                    <div>Confidence Score: <strong className="text-white font-mono">{resp.confidenceScore}%</strong></div>
                    <div className="text-[10px] text-slate-500">{resp.limitationsDisclosed.join('; ')}</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
