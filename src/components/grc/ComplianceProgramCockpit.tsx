import React, { useState } from 'react';
import { 
  Layers, 
  ShieldCheck, 
  Lock, 
  Cpu, 
  Landmark, 
  ArrowUpRight, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  BarChart3,
  Calendar,
  User,
  Search,
  Compass
} from 'lucide-react';
import { complianceProgramService } from '../../services/canonical/ComplianceProgramService';
import { ComplianceProgram } from '../../types/canonicalGrcTypes';
import { PremiumCard } from '../ui/premium/PremiumCard';
import { PremiumKpi } from '../ui/premium/PremiumKpi';
import { PremiumBadge } from '../ui/premium/PremiumBadge';
import { PremiumButton } from '../ui/premium/PremiumButton';
import { PremiumModal } from '../ui/premium/PremiumModal';
import { PremiumInput } from '../ui/premium/PremiumInput';

export const ComplianceProgramCockpit: React.FC = () => {
  const [selectedProgramId, setSelectedProgramId] = useState<string>('PROG-SEC-01');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const programs = complianceProgramService.getAllPrograms();
  const selectedProgram = complianceProgramService.getProgramById(selectedProgramId) || programs[0];

  const getProgramIcon = (type: ComplianceProgram['type']) => {
    switch (type) {
      case 'INFORMATION_SECURITY':
        return <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-cyan-400" />;
      case 'PRIVACY_DATA_PROTECTION':
        return <Lock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 'AI_GOVERNANCE':
        return <Cpu className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
      case 'TECHNOLOGY_RISK_FINTECH':
        return <Landmark className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      default:
        return <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
    }
  };

  const filteredPrograms = programs.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Cockpit Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-cyan-500/10 text-blue-600 dark:text-cyan-400 border border-blue-200 dark:border-cyan-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Compliance Program Governance</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Multi-framework governance operating model: Programs → Frameworks → Requirements → Your Controls.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <PremiumButton
            size="sm"
            variant="primary"
            onClick={() => setIsCreateModalOpen(true)}
            icon={Plus}
          >
            Start Compliance Program
          </PremiumButton>
        </div>
      </div>

      {/* Program Cards Carousel / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {programs.map(prog => {
          const isSelected = prog.id === selectedProgramId;
          return (
            <div
              key={prog.id}
              onClick={() => setSelectedProgramId(prog.id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-white dark:bg-slate-900 border-blue-500 dark:border-cyan-500/80 shadow-md ring-1 ring-blue-500/40 dark:ring-cyan-500/40'
                  : 'bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    {getProgramIcon(prog.type)}
                  </div>
                  <PremiumBadge variant={isSelected ? 'info' : 'neutral'}>
                    {prog.status}
                  </PremiumBadge>
                </div>

                <div>
                  <div className="font-mono text-xs font-bold text-blue-600 dark:text-cyan-400">{prog.code}</div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{prog.name}</h3>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {prog.frameworkCodes.map((fw, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800/80 text-[10px] font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {typeof fw === 'string' ? fw.replace(/_/g, ' ') : String(fw)}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Audit Readiness</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">{prog.metrics.overallReadinessPercent}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Program Deep-Dive */}
      {selectedProgram && (
        <div className="space-y-6">
          {/* Program Overview & Lineage KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            <PremiumKpi
              label="Requirements"
              value={selectedProgram.metrics.totalRequirements}
              icon={FileText}
              statusType="neutral"
            />
            <PremiumKpi
              label="Controls Implemented"
              value={selectedProgram.metrics.implementedControlsCount}
              icon={ShieldCheck}
              statusType="info"
            />
            <PremiumKpi
              label="Controls Tested"
              value={selectedProgram.metrics.testedControlsCount}
              icon={BarChart3}
              statusType="info"
            />
            <PremiumKpi
              label="Effective"
              value={selectedProgram.metrics.effectiveControlsCount}
              icon={CheckCircle2}
              statusType="success"
            />
            <PremiumKpi
              label="Deficient"
              value={selectedProgram.metrics.deficientControlsCount}
              icon={AlertTriangle}
              statusType={selectedProgram.metrics.deficientControlsCount > 0 ? 'critical' : 'success'}
            />
            <PremiumKpi
              label="Evidence Health"
              value={`${selectedProgram.metrics.evidenceCoveragePercent}%`}
              icon={Layers}
              statusType={selectedProgram.metrics.evidenceCoveragePercent >= 90 ? 'success' : 'warning'}
            />
            <PremiumKpi
              label="Open Findings"
              value={selectedProgram.metrics.openFindingsCount}
              icon={AlertTriangle}
              statusType={selectedProgram.metrics.openFindingsCount > 0 ? 'warning' : 'success'}
            />
            <PremiumKpi
              label="Exceptions"
              value={selectedProgram.metrics.activeExceptionsCount}
              icon={Lock}
              statusType="neutral"
            />
          </div>

          {/* Program Details Card */}
          <PremiumCard elevation={1} className="p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="font-mono text-xs font-bold text-blue-600 dark:text-cyan-400">{selectedProgram.code}</span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{selectedProgram.name}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">{selectedProgram.description}</p>
              </div>

              <div className="flex items-center gap-6 text-xs text-slate-600 dark:text-slate-300">
                <div className="space-y-0.5">
                  <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Executive Sponsor</span>
                  <strong className="text-slate-900 dark:text-white font-medium">{selectedProgram.executiveSponsor}</strong>
                </div>
                <div className="space-y-0.5">
                  <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Program Lead</span>
                  <strong className="text-blue-600 dark:text-cyan-400 font-medium">{selectedProgram.programLead}</strong>
                </div>
                {selectedProgram.targetCertificationDate && (
                  <div className="space-y-0.5">
                    <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Target Audit</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-medium">{selectedProgram.targetCertificationDate}</strong>
                  </div>
                )}
              </div>
            </div>

            {/* Framework Composition Breakdown */}
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Underlying Harmonized Framework Stack ({selectedProgram.frameworkCodes.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {selectedProgram.frameworkCodes.map((fwCode, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                        {typeof fwCode === 'string' ? fwCode.replace(/_/g, ' ') : String(fwCode)}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Harmonized into {selectedProgram.code}</div>
                    </div>
                    <PremiumBadge variant="success">Harmonized</PremiumBadge>
                  </div>
                ))}
              </div>
            </div>
          </PremiumCard>
        </div>
      )}

      {/* New Program Modal */}
      <PremiumModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Initialize New Compliance Program"
        subtitle="Define high-level multi-framework governance program"
        size="md"
      >
        <div className="space-y-4">
          <PremiumInput
            label="Program Code"
            placeholder="e.g. PROG-RES-01"
            value="PROG-RES-01"
            onChange={() => {}}
          />
          <PremiumInput
            label="Program Name"
            placeholder="e.g. Enterprise Business Continuity & Disaster Recovery"
            value="Enterprise Business Continuity & Disaster Recovery"
            onChange={() => {}}
          />
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Executive Sponsor</label>
            <input
              type="text"
              defaultValue="Chief Risk Officer"
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Program Lead</label>
            <input
              type="text"
              defaultValue="Head of Resilience"
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
            />
          </div>
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
            <PremiumButton size="sm" variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </PremiumButton>
            <PremiumButton size="sm" variant="primary" onClick={() => setIsCreateModalOpen(false)}>
              Create Program
            </PremiumButton>
          </div>
        </div>
      </PremiumModal>
    </div>
  );
};

export default ComplianceProgramCockpit;
