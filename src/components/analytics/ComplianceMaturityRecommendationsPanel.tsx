import React, { useState, useMemo } from 'react';
import {
  Brain,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  User,
  ArrowUpRight,
  Filter,
  FileDown,
  Layers,
  TrendingUp,
  Cpu,
  Lock,
  Calendar
} from 'lucide-react';
import { DomainMaturityItem } from './ComplianceMaturityScorecard';

export interface ScorecardRecommendation {
  id: string;
  phase: 'Immediate (0-30 Days)' | 'Strategic (30-90 Days)' | 'Harmonization & Continual Improvement';
  title: string;
  description: string;
  framework: 'ISO 27001' | 'ISO 42001' | 'Harmonized Dual';
  priority: 'Critical' | 'High' | 'Medium';
  owner: string;
  targetDomain: string;
  estimatedEffort: string;
  expectedReadinessBoost: string;
  status: 'Open' | 'In Progress' | 'Verified';
}

export interface ComplianceMaturityRecommendationsPanelProps {
  activeDataset: DomainMaturityItem[];
  overallIso27001: number;
  overallIso42001: number;
  onOpenExportPdf?: () => void;
  className?: string;
}

export const ComplianceMaturityRecommendationsPanel: React.FC<ComplianceMaturityRecommendationsPanelProps> = ({
  activeDataset,
  overallIso27001,
  overallIso42001,
  onOpenExportPdf,
  className = ''
}) => {
  const [selectedPhaseFilter, setSelectedPhaseFilter] = useState<string>('all');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<string>('all');

  // Dynamic recommendations generated from active dataset gaps
  const recommendations: ScorecardRecommendation[] = useMemo(() => {
    const list: ScorecardRecommendation[] = [];

    // Check Risk Management & Impact Assessment
    const riskDomain = activeDataset.find(d => d.key.includes('risk') || d.key.includes('clause_6'));
    if (riskDomain && (riskDomain.iso27001Score < 85 || riskDomain.iso42001Score < 85)) {
      list.push({
        id: 'rec_risk_aisia',
        phase: 'Immediate (0-30 Days)',
        title: 'Formalize AI Impact Assessments (AISIA) with Clause 6.1.2 Cross-References',
        description: 'Bridge the gap between cyber risk and algorithmic harm by linking ISO 42001 Annex B impact assessments to the master ISO 27005 risk ledger. Document bias mitigations for foundation models.',
        framework: 'ISO 42001',
        priority: 'Critical',
        owner: 'Head of AI Governance & CISO',
        targetDomain: riskDomain.domainName,
        estimatedEffort: '2 Weeks',
        expectedReadinessBoost: '+4.5% AIMS Readiness',
        status: 'Open'
      });
    }

    // Check Model Lifecycle & DevOps
    const devopsDomain = activeDataset.find(d => d.key.includes('devops') || d.key.includes('lifecycle') || d.key.includes('clause_8'));
    if (devopsDomain && (devopsDomain.iso27001Score < 85 || devopsDomain.iso42001Score < 85)) {
      list.push({
        id: 'rec_devops_guardrails',
        phase: 'Immediate (0-30 Days)',
        title: 'Deploy Automated CI/CD Guardrails for Model Red Teaming (A.6.3 & A.8.25)',
        description: 'Implement automated prompt-injection scanners and hallucination drift tests into the build pipeline. Enforce deployment gating requiring minimum 95% safety confidence score.',
        framework: 'Harmonized Dual',
        priority: 'Critical',
        owner: 'DevOps & AppSec Lead',
        targetDomain: devopsDomain.domainName,
        estimatedEffort: '3 Weeks',
        expectedReadinessBoost: '+5.0% Dual Score',
        status: 'In Progress'
      });
    }

    // Check Third-Party & Cloud Vendor
    const vendorDomain = activeDataset.find(d => d.key.includes('third_party') || d.key.includes('supplier'));
    if (vendorDomain) {
      list.push({
        id: 'rec_vendor_dpa',
        phase: 'Strategic (30-90 Days)',
        title: 'Update Foundation Model DPAs with Zero-Retention Attestations (A.10.1 & A.5.19)',
        description: 'Verify and archive legal agreements with external model suppliers (OpenAI, Anthropic, GCP Vertex) certifying customer prompt and vector weight data is excluded from public model training.',
        framework: 'Harmonized Dual',
        priority: 'High',
        owner: 'Legal Counsel & Procurement',
        targetDomain: vendorDomain.domainName,
        estimatedEffort: '4 Weeks',
        expectedReadinessBoost: '+3.5% ISMS/AIMS Score',
        status: 'Open'
      });
    }

    // Check Telemetry & Monitoring
    const telemetryDomain = activeDataset.find(d => d.key.includes('telemetry') || d.key.includes('mon') || d.key.includes('clause_9'));
    if (telemetryDomain) {
      list.push({
        id: 'rec_telemetry_drift',
        phase: 'Strategic (30-90 Days)',
        title: 'Integrate Real-Time Vector Drift & Hallucination Telemetry with SIEM (A.9.1 & A.8.16)',
        description: 'Connect production LLM inference logs to central security monitoring. Trigger automated incident alerts on abnormal prompt anomalies or output sentiment shifts.',
        framework: 'ISO 42001',
        priority: 'High',
        owner: 'SecOps Telemetry Lead',
        targetDomain: telemetryDomain.domainName,
        estimatedEffort: '3 Weeks',
        expectedReadinessBoost: '+4.0% AIMS Score',
        status: 'In Progress'
      });
    }

    // Always include Harmonization Best Practice
    list.push({
      id: 'rec_harmonize_management_review',
      phase: 'Harmonization & Continual Improvement',
      title: 'Consolidate ISMS & AIMS into Joint Executive Governance Review (Cl. 9.3)',
      description: 'Merge quarterly Information Security and AI Safety board reviews into a single harmonized session. Eliminates duplicate auditor interviews and reduces recurring audit fees by ~35%.',
      framework: 'Harmonized Dual',
      priority: 'Medium',
      owner: 'Internal Audit Director',
      targetDomain: 'Leadership & Continual Impr.',
      estimatedEffort: '1 Week',
      expectedReadinessBoost: '+3.0% Overall Maturity',
      status: 'Open'
    });

    // Check Personnel Awareness
    const peopleDomain = activeDataset.find(d => d.key.includes('people') || d.key.includes('clause_7'));
    if (peopleDomain) {
      list.push({
        id: 'rec_ai_competence',
        phase: 'Harmonization & Continual Improvement',
        title: 'Institute Role-Based AI Ethics & Prompt Engineering Accreditation (A.3.2 & A.6.3)',
        description: 'Mandate annual specialized training for developers, product managers, and data analysts handling generative AI and sensitive customer data classification.',
        framework: 'ISO 42001',
        priority: 'Medium',
        owner: 'People Ops & Security Awareness Lead',
        targetDomain: peopleDomain.domainName,
        estimatedEffort: '2 Weeks',
        expectedReadinessBoost: '+2.5% AIMS Score',
        status: 'Open'
      });
    }

    return list;
  }, [activeDataset]);

  // Filtered list
  const filteredRecs = useMemo(() => {
    return recommendations.filter(rec => {
      const matchPhase = selectedPhaseFilter === 'all' || rec.phase.includes(selectedPhaseFilter);
      const matchPriority = selectedPriorityFilter === 'all' || rec.priority.toLowerCase() === selectedPriorityFilter.toLowerCase();
      return matchPhase && matchPriority;
    });
  }, [recommendations, selectedPhaseFilter, selectedPriorityFilter]);

  return (
    <div className={`bg-[var(--skanda-bg-card)] border border-[var(--skanda-border)] rounded-2xl p-4 sm:p-6 shadow-sm space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--skanda-border)] pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Brain className="w-4 h-4" />
            </span>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
              Actionable Strategic & Tactical Recommendations
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
              {recommendations.length} Recommendations
            </span>
          </div>
          <p className="text-xs text-[var(--skanda-text-muted)] mt-1">
            Prioritized actions designed to bridge identified maturity gaps and achieve full registrar Stage 1 / Stage 2 readiness.
          </p>
        </div>

        {onOpenExportPdf && (
          <button
            type="button"
            onClick={onOpenExportPdf}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-xs font-semibold text-white shadow-sm flex items-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Export in PDF Dossier</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
        {/* Phase Filter */}
        <div className="flex items-center bg-[var(--skanda-bg-primary)] p-1 rounded-xl border border-[var(--skanda-border)] text-xs">
          <button
            type="button"
            onClick={() => setSelectedPhaseFilter('all')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              selectedPhaseFilter === 'all' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Phases
          </button>
          <button
            type="button"
            onClick={() => setSelectedPhaseFilter('0-30')}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
              selectedPhaseFilter === '0-30' ? 'bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>0-30 Days</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedPhaseFilter('30-90')}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
              selectedPhaseFilter === '30-90' ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>30-90 Days</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedPhaseFilter('Harmonization')}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
              selectedPhaseFilter === 'Harmonization' ? 'bg-sky-500/20 text-sky-300 font-semibold border border-sky-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Harmonization</span>
          </button>
        </div>

        {/* Priority Filter */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-[11px] text-slate-400 font-medium">Priority:</span>
          <select
            value={selectedPriorityFilter}
            onChange={(e) => setSelectedPriorityFilter(e.target.value)}
            className="bg-[var(--skanda-bg-primary)] border border-[var(--skanda-border)] text-slate-200 rounded-lg px-2.5 py-1 text-xs focus:ring-1 focus:ring-sky-500 cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical Only</option>
            <option value="high">High Only</option>
            <option value="medium">Medium Only</option>
          </select>
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
        {filteredRecs.map((rec) => {
          const isCritical = rec.priority === 'Critical';
          const isHigh = rec.priority === 'High';

          return (
            <div
              key={rec.id}
              className="p-4 rounded-xl bg-[var(--skanda-bg-primary)] border border-[var(--skanda-border)] shadow-xs hover:shadow-xl hover:shadow-slate-300/40 dark:hover:shadow-[0_16px_36px_-6px_rgba(0,0,0,0.85)] hover:border-slate-400 dark:hover:border-slate-600 transition-all duration-300 ease-out transform hover:scale-[1.02] hover:-translate-y-1 flex flex-col justify-between space-y-3 relative group cursor-default origin-center will-change-transform z-10 hover:z-20"
            >
              <div className="space-y-2">
                {/* Meta Badges */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border uppercase ${
                      isCritical
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        : isHigh
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                    }`}>
                      {rec.priority}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {rec.phase}
                    </span>
                  </div>

                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                    rec.framework === 'ISO 27001'
                      ? 'bg-emerald-500/15 text-emerald-300'
                      : rec.framework === 'ISO 42001'
                      ? 'bg-purple-500/15 text-purple-300'
                      : 'bg-sky-500/15 text-sky-300'
                  }`}>
                    {rec.framework}
                  </span>
                </div>

                {/* Title */}
                <h4 className="text-xs sm:text-sm font-bold text-white leading-snug group-hover:text-sky-300 transition-colors">
                  {rec.title}
                </h4>

                {/* Description */}
                <p className="text-xs text-slate-300 leading-relaxed">
                  {rec.description}
                </p>
              </div>

              {/* Footer Meta Details */}
              <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center space-x-1.5">
                  <User className="w-3 h-3 text-slate-500" />
                  <span className="truncate max-w-[150px]">{rec.owner}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="font-mono text-emerald-400 font-semibold text-[10px]">
                    {rec.expectedReadinessBoost}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
