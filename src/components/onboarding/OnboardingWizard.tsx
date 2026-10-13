import React, { useState } from 'react';
import { useGRC } from '../../context/GRCContext';
import { Phase1Registration } from './Phase1Registration';
import { Phase2ScopeSoA } from './Phase2ScopeSoA';
import { Phase3DocGeneration } from './Phase3DocGeneration';
import { Phase4MoUExecution } from './Phase4MoUExecution';
import {
  Building2,
  Layers,
  Sparkles,
  FileSignature,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  UserCheck,
  Crown,
  PlusCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export const OnboardingWizard: React.FC = () => {
  const {
    currentTenant,
    setActiveModule,
    quickLoginAsAdmin,
    quickLoginAsSuperAdmin,
    startNewEntityOnboarding,
    currentRole
  } = useGRC();
  const currentPhase = currentTenant?.onboardingPhase || 1;

  // Active step inside the wizard
  const [activeStep, setActiveStep] = useState<number>(
    currentPhase > 4 ? 4 : currentPhase
  );

  const steps = [
    {
      num: 1,
      title: 'Company Registration',
      subtitle: 'Legal Profile & Address',
      icon: Building2
    },
    {
      num: 2,
      title: 'Scope & SoA',
      subtitle: 'Boundaries & Baseline',
      icon: Layers
    },
    {
      num: 3,
      title: 'Doc Generation',
      subtitle: 'Frameworks & Policies',
      icon: Sparkles
    },
    {
      num: 4,
      title: 'Digital MoU',
      subtitle: 'Execution & Unlock',
      icon: FileSignature
    }
  ];

  const isCurrentTenantComplete = Boolean(
    currentTenant && (currentTenant.onboardingPhase >= 5 || currentTenant.mou?.executed)
  );

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-6xl mx-auto">
      {/* SaaS Architecture Context & Quick Role Switches */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs relative overflow-hidden transition-colors duration-200">
        <div className="absolute top-0 right-0 w-80 h-32 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
                SaaS Multi-Tenant Architecture
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">•</span>
              <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                Active Tenant: <strong className="text-[#0F172A] dark:text-white">{currentTenant?.name || 'New Registration'}</strong>
              </span>
            </div>
            <h1 className="text-xl font-bold text-[#0F172A] dark:text-white tracking-tight flex items-center space-x-2">
              <span>SKANDA Enterprise GRC • Onboarding Survey & Registration</span>
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
              Standardized regulatory onboarding sequence. Register your corporate legal entity, establish compliance scope across ISO/IEC 27001 &amp; MAS TRM 2021, generate auditor-grade ISMS policies, and cryptographically execute your digital audit agreement.
            </p>
          </div>

          {/* Quick Access Actions for Admin & Super Admin */}
          <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 shrink-0">
            <button
              onClick={quickLoginAsAdmin}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-[#0F172A] dark:text-slate-200 text-xs font-semibold border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 transition-all shadow-xs cursor-pointer"
              title="Switch to Enterprise Admin & CISO view with fully populated live data"
              id="btn-quick-admin-login"
            >
              <UserCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Login as Admin</span>
            </button>

            <button
              onClick={quickLoginAsSuperAdmin}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-900 dark:text-purple-300 text-xs font-semibold border border-purple-200 dark:border-purple-800/60 hover:border-purple-300 transition-all shadow-xs cursor-pointer"
              title="Switch to Super Admin & CTO platform governance portfolio"
              id="btn-quick-superadmin-login"
            >
              <Crown className="w-3.5 h-3.5 text-amber-500" />
              <span>Super Admin Portfolio</span>
            </button>

            <button
              onClick={startNewEntityOnboarding}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#7C3AED] hover:from-[#1D4ED8] hover:to-[#6D28D9] text-white text-xs font-semibold shadow-xs hover:shadow-sm transition-all cursor-pointer"
              title="Start a fresh registration and onboarding survey for another entity"
              id="btn-register-new-entity"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Register New Entity</span>
            </button>
          </div>
        </div>

        {/* Notice for already completed entities */}
        {isCurrentTenantComplete && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-50/50 dark:bg-emerald-950/30 -mx-5 -mb-5 p-4 rounded-b-2xl border-emerald-200 dark:border-emerald-800/40">
            <div className="flex items-center space-x-2 text-xs text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                <strong>{currentTenant?.name}</strong> has completed the Onboarding Survey and executed its digital MoU.
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveModule('command_center')}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                id="btn-enter-command-center"
              >
                <span>Enter Command Center</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setActiveModule('super_admin_portfolio')}
                className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-300 dark:border-slate-700 cursor-pointer"
              >
                Super Admin
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Wizard Stepper Progress Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 lg:p-6 shadow-xs transition-colors duration-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-[#0F172A] dark:text-white tracking-tight">
              4-Milestone Regulatory Survey Progression
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Follow each milestone in order. Responses dynamically generate legal policies and lock the Statement of Applicability.
            </p>
          </div>
          {currentTenant?.onboardingPhase === 5 && (
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Fully Onboarded & Active</span>
            </div>
          )}
        </div>

        {/* 4 Steps Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {steps.map(step => {
            const isCompleted = currentPhase > step.num;
            const isCurrent = activeStep === step.num;
            const StepIcon = step.icon;

            return (
              <button
                key={step.num}
                onClick={() => setActiveStep(step.num)}
                className={`p-3 rounded-xl text-left border transition-all flex items-start space-x-3 cursor-pointer ${
                  isCurrent
                    ? 'bg-blue-50/80 dark:bg-blue-950/60 border-blue-500 text-blue-900 dark:text-blue-200 shadow-xs ring-1 ring-blue-500/20'
                    : isCompleted
                    ? 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                    isCompleted
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : step.num}
                </div>

                <div className="min-w-0">
                  <div className={`text-xs font-bold truncate ${isCurrent ? 'text-blue-950 dark:text-blue-200' : 'text-[#0F172A] dark:text-white'}`}>{step.title}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{step.subtitle}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Render Step Content */}
      <div className="transition-all">
        {activeStep === 1 && (
          <Phase1Registration onComplete={() => setActiveStep(2)} />
        )}
        {activeStep === 2 && (
          <Phase2ScopeSoA
            onBack={() => setActiveStep(1)}
            onComplete={() => setActiveStep(3)}
          />
        )}
        {activeStep === 3 && (
          <Phase3DocGeneration
            onBack={() => setActiveStep(2)}
            onComplete={() => setActiveStep(4)}
          />
        )}
        {activeStep === 4 && (
          <Phase4MoUExecution
            onBack={() => setActiveStep(3)}
            onComplete={() => {
              setActiveStep(4);
            }}
          />
        )}
      </div>
    </div>
  );
};
