// Skanda GRC — ISO Clause Inherent Risk Weighting Configuration Modal
// Allows risk officers and auditors to configure and inspect inherent threat weightings
// which adjust the visual intensity across the Compliance Heatmap.

import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Sliders,
  RotateCcw,
  Save,
  Info,
  CheckCircle2,
  Zap,
  BookOpen
} from 'lucide-react';
import {
  ISOClauseInherentRisk,
  ComplianceHeatmapService,
  DEFAULT_ISO_INHERENT_RISKS
} from '../../services/complianceHeatmapService';
import { useGRC } from '../../context/GRCContext';
import { useToast } from '../common/ToastContainer';

interface ISOInherentRiskConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (risks: Record<string, ISOClauseInherentRisk>) => void;
}

export const ISOInherentRiskConfigModal: React.FC<ISOInherentRiskConfigModalProps> = ({
  isOpen,
  onClose,
  onSaved
}) => {
  const { theme, logAuditEvent } = useGRC();
  const { showToast } = useToast();

  const [riskWeights, setRiskWeights] = useState<Record<string, ISOClauseInherentRisk>>(() =>
    ComplianceHeatmapService.getISOInherentRisks()
  );
  const [selectedClauseCode, setSelectedClauseCode] = useState<string>('Annex A.8');

  if (!isOpen) return null;

  const handleWeightChange = (clauseCode: string, newWeight: number) => {
    setRiskWeights(prev => {
      const item = prev[clauseCode];
      if (!item) return prev;
      const updatedLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' =
        newWeight >= 1.6 ? 'CRITICAL' : newWeight >= 1.3 ? 'HIGH' : newWeight >= 1.0 ? 'MEDIUM' : 'LOW';

      return {
        ...prev,
        [clauseCode]: {
          ...item,
          inherentRiskWeight: Math.round(newWeight * 10) / 10,
          inherentRiskLevel: updatedLevel
        }
      };
    });
  };

  const handleApplyPreset = (presetType: 'DEFAULT' | 'TECH_HEAVY' | 'EQUALIZED') => {
    if (presetType === 'DEFAULT') {
      setRiskWeights({ ...DEFAULT_ISO_INHERENT_RISKS });
      showToast({
        title: 'Default Baseline Applied',
        message: 'Authoritative ISO 27001 risk weighting restored',
        type: 'info'
      });
    } else if (presetType === 'TECH_HEAVY') {
      setRiskWeights(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(code => {
          if (code === 'Annex A.8') {
            next[code] = { ...next[code], inherentRiskWeight: 2.2, inherentRiskLevel: 'CRITICAL' };
          } else if (code === 'Annex A.5' || code === 'Clause 6' || code === 'Clause 8') {
            next[code] = { ...next[code], inherentRiskWeight: 1.6, inherentRiskLevel: 'CRITICAL' };
          } else {
            next[code] = { ...next[code], inherentRiskWeight: 0.9, inherentRiskLevel: 'LOW' };
          }
        });
        return next;
      });
      showToast({
        title: 'Tech-Heavy Threat Preset Applied',
        message: 'Annex A.8 and critical operational clauses weighted at 2.2x and 1.6x',
        type: 'info'
      });
    } else if (presetType === 'EQUALIZED') {
      setRiskWeights(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(code => {
          next[code] = { ...next[code], inherentRiskWeight: 1.0, inherentRiskLevel: 'MEDIUM' };
        });
        return next;
      });
      showToast({
        title: 'Equalized Weights Applied',
        message: 'All ISO clauses set to 1.0x flat weighting',
        type: 'info'
      });
    }
  };

  const handleSave = () => {
    ComplianceHeatmapService.saveISOInherentRisks(riskWeights);
    onSaved(riskWeights);
    logAuditEvent(
      'UPDATE',
      'Compliance Heatmap',
      'Configured and applied Inherent Risk weightings across ISO 27001 clauses.'
    );
    showToast({
      title: 'Inherent Risk Weights Saved',
      message: 'Visual intensity on the Compliance Heatmap will now reflect updated weightings',
      type: 'success'
    });
    onClose();
  };

  const selectedRisk = riskWeights[selectedClauseCode] || riskWeights['Annex A.8'];

  const getRiskLevelBadge = (level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW') => {
    switch (level) {
      case 'CRITICAL':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center space-x-1">
            <Flame className="w-3 h-3 text-rose-400" />
            <span>CRITICAL RISK</span>
          </span>
        );
      case 'HIGH':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center space-x-1">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            <span>HIGH RISK</span>
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
            MEDIUM RISK
          </span>
        );
      case 'LOW':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-500/20 text-slate-300 border border-slate-500/40">
            LOW RISK
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className={`w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden ${
          theme === 'light' ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-800'
        }`}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Sliders className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <span>ISO 27001 Inherent Risk Weighting Configuration</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Visual Intensity Engine
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Adjust the risk multipliers for each ISO clause. When Inherent Risk Weighting is toggled ON, the visual
                intensity of non-compliant gaps and in-progress tasks scales according to clause severity.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets Bar */}
        <div className="px-5 py-2.5 border-b border-slate-800/80 bg-slate-950/40 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-slate-400 font-medium flex items-center space-x-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Preset Profiles:</span>
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleApplyPreset('DEFAULT')}
              className="px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition cursor-pointer"
            >
              Authoritative Baseline (Default)
            </button>
            <button
              onClick={() => handleApplyPreset('TECH_HEAVY')}
              className="px-2.5 py-1 rounded-lg border border-indigo-500/40 bg-indigo-950/40 hover:bg-indigo-900/50 text-indigo-300 text-[11px] font-semibold transition cursor-pointer"
            >
              Tech Exploit Heavy (2.2x A.8)
            </button>
            <button
              onClick={() => handleApplyPreset('EQUALIZED')}
              className="px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold transition cursor-pointer"
            >
              Equalized (1.0x Flat)
            </button>
          </div>
        </div>

        {/* Main Body Grid */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Left: Clause List & Weight Sliders (7 cols) */}
          <div className="md:col-span-7 space-y-2.5">
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider pb-1">
              <span>Clause / Annex A Theme</span>
              <span>Weight Multiplier</span>
            </div>

            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {Object.values(riskWeights).map(item => {
                const isSelected = item.clauseCode === selectedClauseCode;
                const weight = item.inherentRiskWeight;

                return (
                  <div
                    key={item.clauseCode}
                    onClick={() => setSelectedClauseCode(item.clauseCode)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 ${
                      isSelected
                        ? 'border-indigo-500/80 bg-indigo-950/30 ring-1 ring-indigo-500/40 shadow-sm'
                        : theme === 'light'
                        ? 'bg-slate-50 border-slate-200 hover:border-slate-300'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-xs text-white px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                          {item.clauseCode}
                        </span>
                        <span className="text-xs font-semibold text-slate-200 truncate max-w-[200px]" title={item.title}>
                          {item.shortTitle}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getRiskLevelBadge(item.inherentRiskLevel)}
                        <span className="font-mono font-black text-sm text-indigo-400 w-12 text-right">
                          {weight.toFixed(1)}x
                        </span>
                      </div>
                    </div>

                    {/* Interactive Range Slider */}
                    <div className="flex items-center space-x-3 pt-1">
                      <span className="text-[10px] text-slate-500 font-mono">0.8x</span>
                      <input
                        type="range"
                        min="0.8"
                        max="2.5"
                        step="0.1"
                        value={weight}
                        onChange={(e) => handleWeightChange(item.clauseCode, parseFloat(e.target.value))}
                        className="flex-1 accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                      />
                      <span className="text-[10px] text-slate-500 font-mono">2.5x</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Selected Clause Deep Dive (5 cols) */}
          <div className="md:col-span-5 flex flex-col space-y-3">
            <div className={`p-4 rounded-xl border flex-1 space-y-3.5 ${
              theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800'
            }`}>
              <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono text-indigo-400 uppercase font-bold tracking-wider">
                    Inherent Threat Profile
                  </span>
                  <h3 className="text-sm font-bold text-white mt-0.5">{selectedRisk.clauseCode}</h3>
                  <p className="text-xs text-slate-300 font-medium">{selectedRisk.title}</p>
                </div>
                <div>{getRiskLevelBadge(selectedRisk.inherentRiskLevel)}</div>
              </div>

              {/* Multiplier Impact Card */}
              <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-300">Visual Intensity Impact:</span>
                  <span className="font-mono font-black text-sm text-amber-300">
                    {selectedRisk.inherentRiskWeight.toFixed(1)}x Multiplier
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 space-y-1">
                  <p>
                    • <strong className="text-rose-400">Non-Compliant Gaps (&lt;50%):</strong>
                    {selectedRisk.inherentRiskWeight >= 1.3
                      ? ' Rendered with high-intensity glowing crimson & warning pulse.'
                      : selectedRisk.inherentRiskWeight <= 0.95
                      ? ' Rendered with subdued soft pink (low operational blast radius).'
                      : ' Rendered with standard high-contrast red.'}
                  </p>
                  <p>
                    • <strong className="text-amber-400">In Progress (50-84%):</strong>
                    {selectedRisk.inherentRiskWeight >= 1.3
                      ? ' Intensified to urgent amber with elevated audit alert.'
                      : ' Rendered with standard yellow/amber progress scale.'}
                  </p>
                  <p>
                    • <strong className="text-emerald-400">Compliant (&ge;85%):</strong>
                    {selectedRisk.inherentRiskWeight >= 1.3
                      ? ' Highlighted with Fortified Emerald Shield badge.'
                      : ' Standard compliant green.'}
                  </p>
                </div>
              </div>

              {/* Threat Category */}
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Threat Classification</span>
                <span className="text-xs font-semibold text-slate-200 mt-0.5 block">
                  {selectedRisk.threatCategory}
                </span>
              </div>

              {/* Audit Scrutiny */}
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">External Audit Scrutiny</span>
                <span className="text-xs text-slate-300 mt-0.5 block">{selectedRisk.auditSeverity}</span>
              </div>

              {/* Rationale & Threat Description */}
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Exposure Rationale</span>
                <p className="text-xs text-slate-400 leading-relaxed mt-0.5">{selectedRisk.threatDescription}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <button
            onClick={() => handleApplyPreset('DEFAULT')}
            className="px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Baseline</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md transition cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save & Apply Weights</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
