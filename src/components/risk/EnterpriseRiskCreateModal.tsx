import React, { useState } from 'react';
import {
  X,
  Plus,
  Flame,
  Shield,
  ShieldCheck,
  Building2,
  DollarSign,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { EnterpriseRiskCategory, EnterpriseRiskTreatmentStrategy } from '../../types/enterpriseRiskTypes';

interface EnterpriseRiskCreateModalProps {
  onClose: () => void;
  onSubmit: (riskData: any) => void;
}

export const EnterpriseRiskCreateModal: React.FC<EnterpriseRiskCreateModalProps> = ({
  onClose,
  onSubmit
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<EnterpriseRiskCategory>('Cybersecurity');
  const [description, setDescription] = useState('');
  const [riskScenario, setRiskScenario] = useState('');
  const [riskStatement, setRiskStatement] = useState('');
  const [riskOwner, setRiskOwner] = useState('David Lim (Head of InfoSec)');
  const [accountableExecutive, setAccountableExecutive] = useState('Sarah Chen (Chief Technology Officer)');
  const [businessUnit, setBusinessUnit] = useState('Cloud Platform & Engineering');
  const [inherentLikelihood, setInherentLikelihood] = useState<number>(3);
  const [inherentImpact, setInherentImpact] = useState<number>(4);
  const [residualLikelihood, setResidualLikelihood] = useState<number>(1);
  const [residualImpact, setResidualImpact] = useState<number>(3);
  const [treatmentStrategy, setTreatmentStrategy] = useState<EnterpriseRiskTreatmentStrategy>('MITIGATE');
  const [treatmentPlanDescription, setTreatmentPlanDescription] = useState('Deploy mitigating technical controls and telemetry verifications.');
  const [treatmentPlanBudgetUSD, setTreatmentPlanBudgetUSD] = useState<number>(50000);
  const [treatmentTargetDate, setTreatmentTargetDate] = useState('2026-12-31');
  const [riskAppetiteScore, setRiskAppetiteScore] = useState<number>(8);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      category,
      description: description || title,
      riskScenario: riskScenario || `Threat event affecting ${category} operations.`,
      riskStatement: riskStatement || `If unmitigated, ${title} could cause financial or regulatory exposure.`,
      riskOwner,
      accountableExecutive,
      businessUnit,
      businessServiceIds: ['srv-payment-gateway', 'srv-core-banking'],
      assetIds: ['ast-aws-prod-eks', 'ast-rds-aurora-prod'],
      controlIds: ['SKD-CTRL-IAM-01', 'SKD-CTRL-BCP-01'],
      inherentLikelihood,
      inherentImpact,
      residualLikelihood,
      residualImpact,
      treatmentStrategy,
      treatmentPlanDescription,
      treatmentPlanBudgetUSD,
      treatmentTargetDate,
      riskAppetiteScore
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-rose-500" />
            <h2 className="text-base font-bold text-white">Register Canonical Enterprise Risk</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          <div>
            <label className="text-slate-300 font-medium block mb-1">Risk Title & Objective</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Unencrypted S3 Database Backup Snapshot Exposure"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-medium block mb-1">Risk Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
              >
                <option value="Cybersecurity">Cybersecurity</option>
                <option value="Information Security">Information Security</option>
                <option value="Privacy & Personal Data">Privacy & Personal Data</option>
                <option value="Third-Party & Supply Chain">Third-Party & Supply Chain</option>
                <option value="Artificial Intelligence">Artificial Intelligence</option>
                <option value="Regulatory Compliance">Regulatory Compliance</option>
                <option value="Business Continuity">Business Continuity</option>
              </select>
            </div>
            <div>
              <label className="text-slate-300 font-medium block mb-1">Business Unit</label>
              <input
                type="text"
                value={businessUnit}
                onChange={(e) => setBusinessUnit(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
              >
              </input>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-medium block mb-1">Risk Owner</label>
              <input
                type="text"
                value={riskOwner}
                onChange={(e) => setRiskOwner(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
              />
            </div>
            <div>
              <label className="text-slate-300 font-medium block mb-1">Accountable Executive</label>
              <input
                type="text"
                value={accountableExecutive}
                onChange={(e) => setAccountableExecutive(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/40">
            <div className="space-y-2">
              <span className="font-semibold text-rose-400 block">Inherent Risk (Likelihood × Impact)</span>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-[10px] text-slate-400 block">Likelihood (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={inherentLikelihood}
                    onChange={(e) => setInherentLikelihood(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded p-1.5 text-center font-mono"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] text-slate-400 block">Impact (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={inherentImpact}
                    onChange={(e) => setInherentImpact(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded p-1.5 text-center font-mono"
                  />
                </div>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                Score: <strong className="text-white">{inherentLikelihood * inherentImpact}/25</strong>
              </div>
            </div>

            <div className="space-y-2">
              <span className="font-semibold text-amber-400 block">Residual Risk (Post-Control)</span>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-[10px] text-slate-400 block">Likelihood (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={residualLikelihood}
                    onChange={(e) => setResidualLikelihood(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded p-1.5 text-center font-mono"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] text-slate-400 block">Impact (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={residualImpact}
                    onChange={(e) => setResidualImpact(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded p-1.5 text-center font-mono"
                  />
                </div>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                Score: <strong className="text-white">{residualLikelihood * residualImpact}/25</strong>
              </div>
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-medium block mb-1">Treatment Strategy & Action Plan</label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {(['MITIGATE', 'AVOID', 'TRANSFER', 'ACCEPT'] as const).map((strat) => (
                <button
                  type="button"
                  key={strat}
                  onClick={() => setTreatmentStrategy(strat)}
                  className={`py-1.5 rounded text-[11px] font-semibold transition-colors border ${
                    treatmentStrategy === strat
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  {strat}
                </button>
              ))}
            </div>
            <textarea
              rows={2}
              value={treatmentPlanDescription}
              onChange={(e) => setTreatmentPlanDescription(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-xs"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Register Risk Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
