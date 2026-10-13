import React, { useState } from 'react';
import {
  Sliders,
  AlertOctagon,
  Sparkles,
  ShieldCheck,
  Clock,
  FileText,
  Globe,
  ArrowRight
} from 'lucide-react';
import { MASIncidentResponseWorkbench } from '../mas/MASIncidentResponseWorkbench';
import { MASAutomatedSeverityCalculator } from '../mas/MASAutomatedSeverityCalculator';
import { MASRegulatoryHorizonScanner } from '../mas/MASRegulatoryHorizonScanner';
import { DetailedSeverityCalculatorInput, DetailedSeverityScoreResult } from '../../services/masIncidentSeverityService';
import { MASCircularRecord } from '../../services/masCircularHorizonService';
import { PageContainer } from '../layout/PageContainer';

export const MASIncidentNotificationModule: React.FC = () => {
  const [activeView, setActiveView] = useState<'automated_calculator' | 'regulatory_dispatcher' | 'regulatory_horizon_scanner'>('automated_calculator');
  const [savedCalculatorState, setSavedCalculatorState] = useState<{
    result: DetailedSeverityScoreResult | null;
    input: DetailedSeverityCalculatorInput | null;
  }>({
    result: null,
    input: null
  });
  const [linkedCircularForDispatcher, setLinkedCircularForDispatcher] = useState<MASCircularRecord | null>(null);

  const handleApplyToIncident = (result: DetailedSeverityScoreResult, input: DetailedSeverityCalculatorInput) => {
    setSavedCalculatorState({ result, input });
    setActiveView('regulatory_dispatcher');
  };

  const handleLinkCircularToIncident = (circular: MASCircularRecord) => {
    setLinkedCircularForDispatcher(circular);
    setActiveView('regulatory_dispatcher');
  };

  return (
    <PageContainer id="mas-incident-notification-module">
      {/* Top Banner & Module Mode Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-rose-400" />
              MAS TRM Statutory Directive
            </span>
            <span className="text-xs text-slate-400">
              Notice 644 (Banking Act) & Notice 655 (Payment Services Act) Section 8
            </span>
            {linkedCircularForDispatcher && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-mono">
                Linked: {linkedCircularForDispatcher.referenceCode}
              </span>
            )}
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <AlertOctagon className="w-6 h-6 text-rose-400" />
            MAS Statutory Incident Notification & Regulatory Horizon Center
          </h1>
          <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
            Automated multi-factor severity scoring, continuous MAS circular horizon scanning, and statutory 1-hour incident dispatch engine calibrated for Singapore Financial Institutions, Major Payment Institutions, and Digital Asset operators.
          </p>
        </div>

        {/* View Toggle Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 shrink-0 flex-wrap">
          <button
            onClick={() => setActiveView('automated_calculator')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeView === 'automated_calculator'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Severity Calculator</span>
          </button>

          <button
            onClick={() => setActiveView('regulatory_horizon_scanner')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeView === 'regulatory_horizon_scanner'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Globe className="w-4 h-4 text-cyan-400" />
            <span>Regulatory Horizon Scanner</span>
          </button>

          <button
            onClick={() => setActiveView('regulatory_dispatcher')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeView === 'regulatory_dispatcher'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-950'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Clock className="w-4 h-4 text-rose-400" />
            <span>1-Hour Dispatcher</span>
          </button>
        </div>
      </div>

      {/* Main View Switching */}
      {activeView === 'automated_calculator' && (
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>
                Need to align your incident declaration with the latest MAS Circulars or Outage Directives?
              </span>
            </span>
            <button
              onClick={() => setActiveView('regulatory_horizon_scanner')}
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer shrink-0"
            >
              <span>Scan MAS Circulars</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <MASAutomatedSeverityCalculator
            initialInput={savedCalculatorState.input || undefined}
            onApplyToIncident={handleApplyToIncident}
            onNavigateToDispatch={() => setActiveView('regulatory_dispatcher')}
          />
        </div>
      )}

      {activeView === 'regulatory_horizon_scanner' && (
        <MASRegulatoryHorizonScanner
          onLinkToIncident={handleLinkCircularToIncident}
          onNavigateToDispatcher={() => setActiveView('regulatory_dispatcher')}
        />
      )}

      {activeView === 'regulatory_dispatcher' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex-wrap gap-2">
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>
                Viewing 1-Hour Statutory Incident Notification Workbench & Filing Center.
                {linkedCircularForDispatcher && (
                  <strong className="text-indigo-300 ml-1">
                    Pre-populated from {linkedCircularForDispatcher.referenceCode}.
                  </strong>
                )}
              </span>
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveView('regulatory_horizon_scanner')}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Search Horizon Scanner</span>
              </button>
              <button
                onClick={() => setActiveView('automated_calculator')}
                className="text-xs font-semibold text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Severity Calculator</span>
              </button>
            </div>
          </div>

          <MASIncidentResponseWorkbench
            isModal={false}
            initialLinkedCircular={linkedCircularForDispatcher}
            onOpenHorizonScanner={() => setActiveView('regulatory_horizon_scanner')}
          />
        </div>
      )}
    </PageContainer>
  );
};

