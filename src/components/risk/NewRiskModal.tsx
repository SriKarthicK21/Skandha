import React, { useState } from 'react';
import { useGRC } from '../../context/GRCContext';
import { useToast } from '../common/ToastContainer';
import { RiskCategory, RiskTreatmentOption } from '../../types';
import {
  X,
  Plus,
  Flame,
  Shield,
  Layers,
  Save,
  Building2,
  Calendar
} from 'lucide-react';

interface NewRiskModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultLikelihood?: number;
  defaultImpact?: number;
}

export const NewRiskModal: React.FC<NewRiskModalProps> = ({
  isOpen,
  onClose,
  defaultLikelihood = 3,
  defaultImpact = 3
}) => {
  const { addRisk, currentTenant } = useGRC();
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<RiskCategory>('Information Security');
  const [department, setDepartment] = useState('Software Engineering & DevOps');
  const [threatDescription, setThreatDescription] = useState('');
  const [vulnerabilityDescription, setVulnerabilityDescription] = useState('');
  const [linkedItem, setLinkedItem] = useState('');
  const [likelihood, setLikelihood] = useState<number>(defaultLikelihood);
  const [impact, setImpact] = useState<number>(defaultImpact);
  const [treatmentOption, setTreatmentOption] = useState<RiskTreatmentOption>('Mitigate');
  const [mitigationControl, setMitigationControl] = useState('');
  const [treatmentOwner, setTreatmentOwner] = useState('SriKarthiK (CISO)');
  const [targetDate, setTargetDate] = useState('2026-10-31');
  const [residualLikelihood, setResidualLikelihood] = useState<number>(1);
  const [residualImpact, setResidualImpact] = useState<number>(2);

  if (!isOpen) return null;

  const inherentScore = likelihood * impact;
  const residualScore = residualLikelihood * residualImpact;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !threatDescription.trim()) {
      showToast({
        title: 'Validation Error',
        message: 'Risk title and threat description are required.',
        type: 'warning'
      });
      return;
    }

    addRisk({
      title: title.trim(),
      category,
      department,
      threatDescription: threatDescription.trim(),
      vulnerabilityDescription: vulnerabilityDescription.trim(),
      linkedItem: linkedItem.trim() || 'Core Production Infrastructure',
      likelihood: likelihood as any,
      impact: impact as any,
      treatmentOption,
      mitigationControl: mitigationControl.trim() || 'Controls to be established',
      treatmentOwner: treatmentOwner.trim() || 'Security Officer',
      targetDate,
      residualLikelihood: residualLikelihood as any,
      residualImpact: residualImpact as any,
      status: 'Treatment in Progress'
    });

    showToast({
      title: 'Risk Created Successfully',
      message: `New risk added and mapped to D3 heatmap coordinates (L${likelihood} × I${impact}).`,
      type: 'success'
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-900 to-rose-950/40 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Add New Risk Record</h2>
              <p className="text-xs text-slate-400">Map new threat vector to 5x5 Heatmap</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          <div>
            <label className="font-bold text-slate-300 block mb-1">Risk Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Unauthenticated API Endpoint in Microservice Mesh"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-300 block mb-1">Risk Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as RiskCategory)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
              >
                <option value="Information Security">Information Security</option>
                <option value="Legal & Compliance">Legal & Compliance</option>
                <option value="Asset">Asset</option>
                <option value="Process">Process</option>
                <option value="Vendor">Vendor</option>
                <option value="Department">Department</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Matrix Coordinates Pickers */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <div>
              <label className="font-bold text-rose-300 block mb-1">
                Inherent Likelihood (1-5): {likelihood}
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={likelihood}
                onChange={(e) => setLikelihood(parseInt(e.target.value))}
                className="w-full accent-rose-500"
              />
            </div>

            <div>
              <label className="font-bold text-rose-300 block mb-1">
                Inherent Impact (1-5): {impact}
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={impact}
                onChange={(e) => setImpact(parseInt(e.target.value))}
                className="w-full accent-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-300 block mb-1">Threat Description *</label>
            <textarea
              required
              rows={2}
              placeholder="Describe the threat actor, scenario, and potential blast radius..."
              value={threatDescription}
              onChange={(e) => setThreatDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-300 block mb-1">Treatment Strategy</label>
              <select
                value={treatmentOption}
                onChange={(e) => setTreatmentOption(e.target.value as RiskTreatmentOption)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
              >
                <option value="Mitigate">Mitigate (Controls)</option>
                <option value="Transfer">Transfer (Insurance / SLA)</option>
                <option value="Avoid">Avoid</option>
                <option value="Accept">Accept</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">Treatment Owner</label>
              <input
                type="text"
                value={treatmentOwner}
                onChange={(e) => setTreatmentOwner(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-300 block mb-1">Proposed Mitigation Control</label>
            <input
              type="text"
              placeholder="e.g. Implement mTLS and OAuth token validation on Envoy proxy gateway"
              value={mitigationControl}
              onChange={(e) => setMitigationControl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-mono">
              Inherent Score: <strong className="text-white">{inherentScore}</strong>
            </span>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-lg shadow-sky-950 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save Risk</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
