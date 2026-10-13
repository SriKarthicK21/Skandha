/**
 * SKANDA CISO & EXECUTIVE ASSURANCE INTELLIGENCE HUB
 * Path: src/components/executive/AssuranceIntelligenceHub.tsx
 * 
 * Principal GRC Platform Architect & UX Lead Component
 * Provides board-level and executive risk assurance posture,
 * explainable confidence ratings, top attention items, and embedded Show-Me-Why diagnostics.
 */

import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Download,
  Activity,
  Key,
  Clock,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Layers,
  FileText
} from 'lucide-react';
import { assuranceExplanationService } from '../../services/canonical/AssuranceExplanationService';
import { ShowMeWhyDrawer } from '../grc/ShowMeWhyDrawer';
import { PremiumBadge } from '../ui/premium/PremiumBadge';
import { PremiumButton } from '../ui/premium/PremiumButton';
import { GrcNavigationService } from '../../services/grc/grcNavigationService';

interface AssuranceIntelligenceHubProps {
  tenantId?: string;
}

export const AssuranceIntelligenceHub: React.FC<AssuranceIntelligenceHubProps> = ({
  tenantId = 'tenant-acme-corp'
}) => {
  const [selectedControlCode, setSelectedControlCode] = useState<string | null>(null);
  const [isShowMeWhyOpen, setIsShowMeWhyOpen] = useState(false);

  const summary = assuranceExplanationService.getEnterpriseAssuranceSummary(tenantId);

  const handleOpenShowMeWhy = (code: string) => {
    setSelectedControlCode(code);
    setIsShowMeWhyOpen(true);
  };

  const handleExportSummary = (format: 'JSON' | 'CSV' | 'TEXT') => {
    const codes = ['CTRL-001', 'CTRL-088', 'CTRL-024', 'CTRL-019', 'CTRL-042', 'CTRL-077', 'CTRL-095'];
    const res = assuranceExplanationService.exportAssurancePackage(codes, format, tenantId);
    const blob = new Blob([res.dataContent], { type: format === 'JSON' ? 'application/json' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SKANDA-EXECUTIVE-ASSURANCE-REPORT.${format.toLowerCase()}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Enterprise Assurance Intelligence</span>
              <PremiumBadge variant="success" size="sm">
                <CheckCircle2 className="w-3 h-3 mr-1" /> {summary.overallEnterprisePosture}
              </PremiumBadge>
            </div>
            <h2 className="text-sm font-bold text-slate-100 mt-1">
              Executive Assurance Posture & Empirical Confidence: <span className="text-indigo-400">{summary.overallConfidenceScore}% (VERY HIGH)</span>
            </h2>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <PremiumButton variant="secondary" size="sm" onClick={() => handleExportSummary('JSON')}>
              <Download className="w-3.5 h-3.5 mr-1.5" /> Export Dossier
            </PremiumButton>
            <PremiumButton variant="primary" size="sm" onClick={() => handleOpenShowMeWhy('CTRL-001')}>
              <HelpCircle className="w-3.5 h-3.5 mr-1.5" /> Show Me Why
            </PremiumButton>
          </div>
        </div>

        {/* 6 Contributing Factors Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mt-4 pt-3 border-t border-slate-800/80">
          {summary.confidenceBreakdown.map(factor => (
            <div key={factor.factorId} className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-2.5">
              <span className="text-[10px] text-slate-400 font-medium block truncate">{factor.name}</span>
              <div className="flex items-baseline space-x-1 mt-1">
                <span className="text-sm font-bold text-slate-100">{factor.scorePercent}%</span>
                <span className="text-[10px] text-indigo-400 font-mono">+{factor.weightedScore}pts</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Items Requiring CISO / Executive Attention */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Top Priorities Requiring CISO Attention ({summary.topAttentionItems.length})</span>
          </h3>
          <span className="text-[11px] text-slate-500 font-mono">Automated Sentry Active</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {summary.topAttentionItems.map(item => (
            <div key={item.id} className="bg-slate-800/40 border border-slate-700/50 hover:border-slate-600/60 rounded-lg p-3 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold font-mono px-1.5 py-0.2 rounded uppercase ${
                    item.severity === 'HIGH' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {item.category.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{item.controlCode}</span>
                </div>
                <h4 className="text-xs font-semibold text-slate-200 mt-2 line-clamp-1">{item.title}</h4>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">{item.description}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] text-indigo-300 font-medium truncate max-w-[150px]">{item.actionRequired}</span>
                <button
                  onClick={() => handleOpenShowMeWhy(item.controlCode)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center space-x-1 shrink-0 ml-2"
                >
                  <span>Why?</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Embedded Show-Me-Why Drawer */}
      <ShowMeWhyDrawer
        isOpen={isShowMeWhyOpen}
        onClose={() => setIsShowMeWhyOpen(false)}
        controlCode={selectedControlCode}
        tenantId={tenantId}
      />
    </div>
  );
};
