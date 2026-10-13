import React from 'react';
import { Scale, ExternalLink, ShieldCheck, BookOpen } from 'lucide-react';

interface InterestedParty {
  id: string;
  party: string;
  requirements: string;
  legalObligation: string;
}

interface InterestedPartiesSectionProps {
  parties: InterestedParty[];
  onOpenFullMatrix: () => void;
}

export const InterestedPartiesSection: React.FC<InterestedPartiesSectionProps> = ({
  parties,
  onOpenFullMatrix
}) => {
  return (
    <section aria-labelledby="interested-parties-heading" className="p-6 rounded-2xl bg-skanda-secondary border border-skanda shadow-lg space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h2 id="interested-parties-heading" className="text-[18px] font-bold text-white tracking-tight">
              Interested Parties & Regulatory Obligations
            </h2>
            <p className="text-[12px] text-slate-300">
              Clause 4.3(b) Mandatory Input: Understanding the needs and expectations of interested parties (Clause 4.2)
            </p>
          </div>
        </div>

        <button
          onClick={onOpenFullMatrix}
          className="px-3.5 py-1.5 rounded-xl text-[12px] font-semibold bg-skanda-card hover:bg-skanda-elevated text-slate-200 hover:text-white border border-skanda transition flex items-center space-x-1.5 shrink-0"
        >
          <BookOpen className="w-4 h-4 text-indigo-400" />
          <span>Open Clause 4.2 Matrix</span>
          <ExternalLink className="w-3.5 h-3.5 ml-1 text-slate-400" />
        </button>
      </div>

      {/* Grid of Interested Parties */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {parties.map(p => (
          <div
            key={p.id}
            className="p-4 rounded-xl bg-skanda-card border border-skanda space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  Stakeholder
                </span>
              </div>
              <h3 className="text-[14px] font-semibold text-white">{p.party}</h3>
              <p className="text-[12px] text-slate-300 leading-relaxed">{p.requirements}</p>
            </div>

            <div className="pt-2 border-t border-skanda/80 text-[11px] text-slate-400">
              <span className="text-slate-400 block font-medium uppercase tracking-wider text-[10px]">
                Statutory / Contractual Basis
              </span>
              <span className="text-slate-300 font-mono">{p.legalObligation}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
