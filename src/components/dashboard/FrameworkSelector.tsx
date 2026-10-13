import React, { useState } from 'react';
import {
  ShieldCheck,
  Shield,
  Sparkles,
  Award,
  Database,
  Layers,
  Globe2,
  Building2,
  Plus,
  X,
  Check
} from 'lucide-react';
import { useToast } from '../common/ToastContainer';
import { useGRC } from '../../context/GRCContext';

export interface FrameworkItem {
  id: string;
  name: string;
  shortName: string;
  readiness: number;
  icon: React.ElementType;
  standardCode?: string;
  status: 'active' | 'evaluating' | 'planned';
}

interface FrameworkSelectorProps {
  selectedFrameworkId: string; // 'all' or specific framework id
  onSelectFramework: (id: string) => void;
}

export const FrameworkSelector: React.FC<FrameworkSelectorProps> = ({
  selectedFrameworkId,
  onSelectFramework
}) => {
  const { theme } = useGRC();
  const { showToast } = useToast();
  const [showAddModal, setShowAddModal] = useState(false);

  const frameworks: FrameworkItem[] = [
    { id: 'iso_27001', name: 'ISO 27001:2022', shortName: 'ISO 27001', readiness: 74, icon: ShieldCheck, status: 'active' },
    { id: 'iso_27701', name: 'ISO 27701:2019', shortName: 'ISO 27701', readiness: 52, icon: Shield, status: 'active' },
    { id: 'iso_42001', name: 'ISO 42001:2023', shortName: 'ISO 42001 (AI)', readiness: 31, icon: Sparkles, status: 'active' },
    { id: 'soc_2', name: 'SOC 2 Type II', shortName: 'SOC 2', readiness: 68, icon: Award, status: 'active' },
    { id: 'mas_trm', name: 'MAS TRM Singapore', shortName: 'MAS TRM', readiness: 82, icon: Building2, status: 'active' },
    { id: 'gdpr', name: 'GDPR Privacy', shortName: 'GDPR', readiness: 60, icon: Database, status: 'active' },
    { id: 'dpdpa', name: 'India DPDPA', shortName: 'DPDPA', readiness: 45, icon: Layers, status: 'active' },
    { id: 'ndpr', name: 'NDPR Nigeria', shortName: 'NDPR', readiness: 58, icon: Globe2, status: 'active' }
  ];

  const availableNewFrameworks = [
    { name: 'NIST CSF 2.0', desc: 'National Institute of Standards Cybersecurity Framework', badge: 'Popular' },
    { name: 'PCI DSS v4.0', desc: 'Payment Card Industry Data Security Standard', badge: 'FinTech' },
    { name: 'HIPAA Security Rule', desc: 'Health Insurance Portability & Accountability Act', badge: 'Healthcare' },
    { name: 'ISO 22301:2019', desc: 'Business Continuity Management Systems (BCMS)', badge: 'Resilience' },
    { name: 'NIST AI RMF 1.0', desc: 'NIST Artificial Intelligence Risk Management Framework', badge: 'AI Governance' },
    { name: 'FedRAMP Moderate', desc: 'Federal Risk and Authorization Management Program', badge: 'Cloud Gov' }
  ];

  return (
    <div id="framework-selector" className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
      <span className={`text-xs font-bold uppercase tracking-wider shrink-0 mr-1 hidden sm:inline ${
        theme === 'light' ? 'text-slate-600' : 'text-slate-400'
      }`}>
        Frameworks:
      </span>

      {/* 'All' Consolidated Pill */}
      <button
        onClick={() => {
          onSelectFramework('all');
          showToast({ title: 'Viewing All Frameworks', message: 'Consolidated cross-standard metrics active', type: 'info' });
        }}
        className={`shrink-0 flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
          selectedFrameworkId === 'all'
            ? 'bg-[#7C3AED] text-white border-[#7C3AED] shadow-xs'
            : theme === 'light'
              ? 'bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border-slate-300 shadow-xs'
              : 'bg-[#0D1424] hover:bg-[#111A2C] text-[#A7B0C0] hover:text-[#FFFFFF] border-[#1B2639]'
        }`}
      >
        <span>All</span>
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
          selectedFrameworkId === 'all'
            ? 'bg-[#7C3AED] text-white'
            : theme === 'light'
              ? 'bg-slate-100 text-slate-700 border border-slate-200'
              : 'bg-[#111A2C] text-[#7F8BA3]'
        }`}>
          8
        </span>
      </button>

      {/* Individual Framework Pills */}
      {frameworks.map(fw => {
        const isSelected = selectedFrameworkId === fw.id;
        const Icon = fw.icon;

        return (
          <button
            key={fw.id}
            onClick={() => {
              onSelectFramework(fw.id);
              showToast({
                title: `Active Framework: ${fw.name}`,
                message: `Current Readiness: ${fw.readiness}%`,
                type: 'info'
              });
            }}
            className={`shrink-0 flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs border transition-all cursor-pointer ${
              isSelected
                ? theme === 'light'
                  ? 'bg-indigo-50 text-indigo-900 border-indigo-400 ring-1 ring-indigo-400/40 shadow-xs font-semibold'
                  : 'bg-[#8B5CF6]/20 text-[#FFFFFF] border-[#8B5CF6] ring-1 ring-[#8B5CF6]/40 shadow-xs font-semibold'
                : theme === 'light'
                  ? 'bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border-slate-300 shadow-xs'
                  : 'bg-[#0D1424] hover:bg-[#111A2C] text-[#A7B0C0] hover:text-[#FFFFFF] border-[#1B2639]'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 shrink-0 ${
              isSelected
                ? theme === 'light' ? 'text-indigo-600' : 'text-[#A78BFA]'
                : theme === 'light' ? 'text-slate-400' : 'text-[#7F8BA3]'
            }`} />
            <span className="whitespace-nowrap">{fw.shortName}</span>
            <span
              className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                isSelected
                  ? theme === 'light'
                    ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                    : 'bg-[#8B5CF6]/30 text-[#FFFFFF]'
                  : fw.readiness >= 70
                  ? theme === 'light'
                    ? 'text-emerald-800 bg-emerald-50 border border-emerald-200'
                    : 'text-emerald-400 bg-emerald-500/10'
                  : fw.readiness >= 50
                  ? theme === 'light'
                    ? 'text-indigo-800 bg-indigo-50 border border-indigo-200'
                    : 'text-indigo-400 bg-indigo-500/10'
                  : theme === 'light'
                    ? 'text-amber-800 bg-amber-50 border border-amber-200'
                    : 'text-amber-400 bg-amber-500/10'
              }`}
            >
              {fw.readiness}%
            </span>
          </button>
        );
      })}

      {/* Add Framework Trigger */}
      <button
        onClick={() => setShowAddModal(true)}
        className={`shrink-0 flex items-center space-x-1 px-2 py-1 rounded-lg border border-dashed text-xs font-medium transition cursor-pointer ${
          theme === 'light'
            ? 'border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 shadow-xs'
            : 'border-[#1B2639] hover:border-[#8B5CF6]/50 bg-[#0D1424]/60 hover:bg-[#111A2C] text-[#7F8BA3] hover:text-[#F8FAFC]'
        }`}
        title="Add New Framework"
      >
        <Plus className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Add</span>
      </button>

      {/* Add Framework Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 ${
            theme === 'light' ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0D1424] border-[#1B2639] text-[#F8FAFC]'
          }`}>
            <div className={`flex items-center justify-between border-b pb-3 ${
              theme === 'light' ? 'border-slate-200' : 'border-[#1B2639]'
            }`}>
              <div>
                <h3 className={`text-sm font-bold ${theme === 'light' ? 'text-slate-900' : 'text-[#FFFFFF]'}`}>
                  Add Compliance Framework
                </h3>
                <p className={`text-xs mt-0.5 ${theme === 'light' ? 'text-slate-500' : 'text-[#7F8BA3]'}`}>
                  Activate additional standards in your crosswalk matrix
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className={`p-1 rounded-lg transition cursor-pointer ${
                  theme === 'light' ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-[#7F8BA3] hover:text-[#FFFFFF] hover:bg-[#111A2C]'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              {availableNewFrameworks.map(fw => (
                <div
                  key={fw.name}
                  onClick={() => {
                    showToast({
                      title: `Framework ${fw.name} Activated`,
                      message: 'Crosswalk mapping and baseline controls generated',
                      type: 'success'
                    });
                    setShowAddModal(false);
                  }}
                  className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between group ${
                    theme === 'light'
                      ? 'bg-slate-50 border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50'
                      : 'bg-[#111A2C] border-[#1B2639] hover:border-[#8B5CF6]/50 hover:bg-[#152138]'
                  }`}
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`font-bold text-xs ${theme === 'light' ? 'text-slate-900' : 'text-[#FFFFFF]'}`}>{fw.name}</span>
                      <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${
                        theme === 'light'
                          ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                          : 'bg-[#8B5CF6]/15 text-[#A78BFA] border-[#8B5CF6]/30'
                      }`}>
                        {fw.badge}
                      </span>
                    </div>
                    <p className={`text-[11px] mt-0.5 ${theme === 'light' ? 'text-slate-500' : 'text-[#7F8BA3]'}`}>{fw.desc}</p>
                  </div>
                  <div className={`p-1.5 rounded-lg border transition ${
                    theme === 'light'
                      ? 'bg-white border-slate-200 group-hover:bg-indigo-600 group-hover:text-white text-slate-500'
                      : 'bg-[#0D1424] border-[#1B2639] group-hover:bg-[#8B5CF6] group-hover:text-white text-[#7F8BA3]'
                  }`}>
                    <Plus className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>

            <div className={`flex justify-end pt-2 border-t ${
              theme === 'light' ? 'border-slate-200' : 'border-[#1B2639]'
            }`}>
              <button
                onClick={() => setShowAddModal(false)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer ${
                  theme === 'light'
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    : 'bg-[#111A2C] hover:bg-[#1B2639] text-[#A7B0C0] hover:text-[#FFFFFF]'
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
