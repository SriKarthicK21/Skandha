import React, { useState } from 'react';
import {
  FileText,
  Copy,
  Check,
  Edit2,
  Globe2,
  Users2,
  Network,
  ShieldAlert
} from 'lucide-react';

interface ScopeStatementCardProps {
  statement: string;
  onEdit: () => void;
}

export const ScopeStatementCard: React.FC<ScopeStatementCardProps> = ({
  statement,
  onEdit
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(statement);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section aria-labelledby="scope-statement-heading" className="p-6 rounded-2xl bg-skanda-secondary border border-skanda shadow-lg space-y-6">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/25 flex items-center justify-center text-sky-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 id="scope-statement-heading" className="text-[18px] font-bold text-white tracking-tight">
              Documented ISMS Scope Statement
            </h2>
            <p className="text-[12px] text-slate-300">
              Formally approved under ISO/IEC 27001:2022 Clause 4.3 & Statement of Applicability
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-xl text-[12px] font-medium bg-skanda-card hover:bg-skanda-elevated text-slate-300 hover:text-white border border-skanda hover:border-slate-600 transition flex items-center space-x-1.5"
            title="Copy scope statement to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy Statement</span>
              </>
            )}
          </button>

          <button
            onClick={onEdit}
            className="px-3 py-1.5 rounded-xl text-[12px] font-medium bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/40 transition flex items-center space-x-1.5"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
        </div>
      </div>

      {/* Scope Statement Box */}
      <div className="p-5 rounded-xl bg-skanda-primary border border-skanda relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-sky-500 rounded-l" />
        <p className="text-[14px] text-slate-200 leading-relaxed font-mono pl-3">
          "{statement}"
        </p>
      </div>

      {/* Clause 4.3 Three Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        {/* Pillar 1 */}
        <div className="p-4 rounded-xl bg-skanda-card border border-skanda space-y-2">
          <div className="flex items-center space-x-2 text-sky-400">
            <Globe2 className="w-4 h-4" />
            <span className="text-[12px] font-bold uppercase tracking-wider">Clause 4.3(a)</span>
          </div>
          <h3 className="text-[14px] font-semibold text-white">External & Internal Issues</h3>
          <p className="text-[12px] text-slate-300 leading-relaxed">
            Considers cloud multi-tenancy, cross-border data transfer laws (GDPR/DPDP), remote workforce security,
            and threat intelligence feeds.
          </p>
        </div>

        {/* Pillar 2 */}
        <div className="p-4 rounded-xl bg-skanda-card border border-skanda space-y-2">
          <div className="flex items-center space-x-2 text-indigo-400">
            <Users2 className="w-4 h-4" />
            <span className="text-[12px] font-bold uppercase tracking-wider">Clause 4.3(b)</span>
          </div>
          <h3 className="text-[14px] font-semibold text-white">Interested Parties Requirements</h3>
          <p className="text-[12px] text-slate-300 leading-relaxed">
            Covers customer SLAs (99.95% uptime), financial regulatory mandates (FCA / MAS), and third-party
            contractual data privacy obligations.
          </p>
        </div>

        {/* Pillar 3 */}
        <div className="p-4 rounded-xl bg-skanda-card border border-skanda space-y-2">
          <div className="flex items-center space-x-2 text-emerald-400">
            <Network className="w-4 h-4" />
            <span className="text-[12px] font-bold uppercase tracking-wider">Clause 4.3(c)</span>
          </div>
          <h3 className="text-[14px] font-semibold text-white">Interfaces & Dependencies</h3>
          <p className="text-[12px] text-slate-300 leading-relaxed">
            Encompasses AWS/Azure cloud infrastructure, CI/CD pipeline automation, identity providers (Okta/Entra ID),
            and third-party API gateways.
          </p>
        </div>
      </div>
    </section>
  );
};
