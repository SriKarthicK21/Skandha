import React, { useState } from 'react';
import {
  Layers,
  Globe,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Award,
  ExternalLink
} from 'lucide-react';
import { CrossFrameworkCrosswalkModule } from './CrossFrameworkCrosswalkModule';
import { MASRegulatoryHorizonScanner } from './MASRegulatoryHorizonScanner';
import { PageContainer } from '../layout/PageContainer';
import { useGRC } from '../../context/GRCContext';

interface MASContinuousGRCWorkspaceProps {
  onBackToDashboard: () => void;
}

export const MASContinuousGRCWorkspace: React.FC<MASContinuousGRCWorkspaceProps> = ({
  onBackToDashboard
}) => {
  const { setActiveModule } = useGRC();
  const [activeTab, setActiveTab] = useState<'crosswalk' | 'horizon_scanner'>('crosswalk');

  return (
    <PageContainer id="mas-continuous-grc-workspace">
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Top Header Banner */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <button
                  onClick={onBackToDashboard}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Flow</span>
                </button>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Step 10 &bull; Continual Improvement & GRC Crosswalk
                </span>
                <span className="text-xs text-slate-400">Multi-Standard Harmonization</span>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Continuous GRC & Regulatory Harmonization
              </h1>
              <p className="text-slate-400 text-sm mt-1 max-w-3xl">
                Harmonize MAS TRM 2021 controls with ISO/IEC 27001:2022, SOC 2 Type II, NIST CSF 2.0, and PCI DSS. Ingest live MAS regulatory circulars for continuous regulatory alignment.
              </p>
            </div>

            {/* Sub-tab Switcher */}
            <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 shrink-0">
              <button
                onClick={() => setActiveTab('crosswalk')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'crosswalk'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Cross-Standard Crosswalk</span>
              </button>
              <button
                onClick={() => setActiveTab('horizon_scanner')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'horizon_scanner'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>MAS Circular Scanner</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'crosswalk' ? (
          <CrossFrameworkCrosswalkModule />
        ) : (
          <MASRegulatoryHorizonScanner
            onLinkToIncident={() => setActiveModule('incident_mgr')}
          />
        )}
      </div>
    </PageContainer>
  );
};
