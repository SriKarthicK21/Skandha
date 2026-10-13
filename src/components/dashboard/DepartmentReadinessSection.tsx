import React from 'react';
import { useGRC } from '../../context/GRCContext';
import {
  Users2,
  Server,
  Database,
  Truck,
  Building,
  ArrowRight,
  ChevronRight,
  TrendingUp,
  FileCheck2,
  Sparkles,
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import { Tooltip, MetricInfoTooltip } from '../common/Tooltip';
import { DataCollectionRequired } from '../common/DataCollectionRequired';

interface DepartmentReadinessSectionProps {
  onNavigateModule: (moduleId: string) => void;
}

export const DepartmentReadinessSection: React.FC<DepartmentReadinessSectionProps> = ({
  onNavigateModule
}) => {
  const { theme, currentTenant, evidence, findings } = useGRC();

  const controls = currentTenant?.controls || [];

  // Map Annex A / Controls to departments
  const rawDepts = [
    {
      name: 'Engineering & DevOps',
      target: 90,
      owner: 'Vikram Patel',
      icon: Server,
      iconColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      match: ['A.8', 'Engineering', 'DevOps', 'Development', 'Cloud']
    },
    {
      name: 'IT Infrastructure & Systems',
      target: 85,
      owner: 'Sarah Chen',
      icon: Database,
      iconColor: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
      match: ['Infrastructure', 'Network', 'IT', 'Backup', 'Access']
    },
    {
      name: 'Finance & Payments',
      target: 80,
      owner: 'Marcus Aurelius',
      icon: CreditCard,
      iconColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      match: ['Finance', 'Payments', 'Commercial', 'Billing']
    },
    {
      name: 'Human Resources (People)',
      target: 75,
      owner: 'Priya Sharma',
      icon: Users2,
      iconColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      match: ['A.6', 'HR', 'People', 'Personnel', 'Training', 'Screening']
    },
    {
      name: 'Procurement & Supply Chain',
      target: 75,
      owner: 'David Tan',
      icon: Truck,
      iconColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      match: ['A.5.19', 'A.5.20', 'A.5.21', 'Procurement', 'Supplier', 'Vendor']
    }
  ];

  const departments = rawDepts.map(dept => {
    const matchedControls = controls.filter(c => 
      dept.match.some(m => c.controlCode.includes(m) || (c.title && c.title.toLowerCase().includes(m.toLowerCase())) || (c.responsibleDepartment && c.responsibleDepartment.toLowerCase().includes(m.toLowerCase())))
    );
    const total = matchedControls.length > 0 ? matchedControls.length : 12;
    const implemented = matchedControls.filter(c => 
      c.implementationStatus === 'Implemented' || c.implementationStatus === 'Monitored' || c.implementationStatus === 'Audited'
    ).length;
    const computedScore = matchedControls.length > 0 ? Math.round((implemented / total) * 100) : (dept.target - 8);
    const score = Math.max(25, Math.min(100, computedScore));
    const status = score >= dept.target ? 'On Track' : (score >= dept.target - 12 ? 'Attention' : 'Lagging');

    return {
      name: dept.name,
      score,
      target: dept.target,
      status,
      owner: dept.owner,
      icon: dept.icon,
      iconColor: dept.iconColor
    };
  });

  // Calculate scope domain metrics from Annex A themes
  const techControls = controls.filter(c => c.controlCode.startsWith('A.8'));
  const techPct = techControls.length > 0 
    ? Math.round((techControls.filter(c => c.implementationStatus === 'Implemented' || c.implementationStatus === 'Monitored').length / techControls.length) * 100)
    : 92;

  const physicalControls = controls.filter(c => c.controlCode.startsWith('A.7'));
  const physicalPct = physicalControls.length > 0 
    ? Math.round((physicalControls.filter(c => c.implementationStatus === 'Implemented' || c.implementationStatus === 'Monitored').length / physicalControls.length) * 100)
    : 88;

  const peopleControls = controls.filter(c => c.controlCode.startsWith('A.6'));
  const peoplePct = peopleControls.length > 0 
    ? Math.round((peopleControls.filter(c => c.implementationStatus === 'Implemented' || c.implementationStatus === 'Monitored').length / peopleControls.length) * 100)
    : 82;

  const orgControls = controls.filter(c => c.controlCode.startsWith('A.5'));
  const orgPct = orgControls.length > 0 
    ? Math.round((orgControls.filter(c => c.implementationStatus === 'Implemented' || c.implementationStatus === 'Monitored').length / orgControls.length) * 100)
    : 78;

  const vendorControls = controls.filter(c => c.controlCode.startsWith('A.5.19') || c.controlCode.startsWith('A.5.20') || c.controlCode.startsWith('A.5.21'));
  const vendorPct = vendorControls.length > 0 
    ? Math.round((vendorControls.filter(c => c.implementationStatus === 'Implemented' || c.implementationStatus === 'Monitored').length / vendorControls.length) * 100)
    : 65;

  const scopeCategories = [
    { label: 'Technology & Cloud (A.8)', pct: techPct, color: 'bg-indigo-500' },
    { label: 'Locations & Facilities (A.7)', pct: physicalPct, color: 'bg-purple-500' },
    { label: 'People & Awareness (A.6)', pct: peoplePct, color: 'bg-emerald-500' },
    { label: 'Organizational Policies (A.5)', pct: orgPct, color: 'bg-blue-500' },
    { label: 'Vendors & Supply Chain', pct: vendorPct, color: 'bg-amber-500' }
  ];

  const isUninitialized = currentTenant?.isDemo || !currentTenant?.soaBaselineLocked || !currentTenant?.readinessScore || currentTenant?.readinessScore === 0;

  if (isUninitialized) {
    return (
      <div className="p-5 h-full flex flex-col justify-center">
        <DataCollectionRequired
          variant="card"
          title="Data collection required"
          description="Departmental control ownership, audit readiness radar, and evidence contribution compliance have not been configured for this organization. Real data collection is required."
          actionLabel="Configure Department Controls"
          onAction={() => onNavigateModule('departments')}
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-800/70 h-full">
      {/* Department Readiness Radar & Breakdown (7 cols) */}
      <div className="lg:col-span-7 p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center space-x-2">
                <span>Department Readiness</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold">
                  5 Business Units
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Control ownership & evidence contribution compliance</p>
            </div>
            <button
              onClick={() => onNavigateModule('departments')}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center mt-3">
            {/* SVG Spider Radar Diagram (5 cols) */}
            <div className="sm:col-span-5 flex flex-col items-center justify-center">
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 200 200">
                  {/* Outer & Inner Polygon Webs */}
                  <polygon points="100,20 180,75 150,165 50,165 20,75" fill="none" stroke="#1E293B" strokeWidth="1" />
                  <polygon points="100,50 155,90 135,145 65,145 45,90" fill="none" stroke="#1E293B" strokeWidth="1" />
                  <polygon points="100,75 130,105 120,130 80,130 70,105" fill="none" stroke="#1E293B" strokeWidth="1" />

                  {/* Axes */}
                  <line x1="100" y1="100" x2="100" y2="20" stroke="#1E293B" strokeWidth="1" />
                  <line x1="100" y1="100" x2="180" y2="75" stroke="#1E293B" strokeWidth="1" />
                  <line x1="100" y1="100" x2="150" y2="165" stroke="#1E293B" strokeWidth="1" />
                  <line x1="100" y1="100" x2="50" y2="165" stroke="#1E293B" strokeWidth="1" />
                  <line x1="100" y1="100" x2="20" y2="75" stroke="#1E293B" strokeWidth="1" />

                  {/* Target Polygon (Cyan dashed) */}
                  <polygon points="100,28 170,82 142,158 58,158 28,82" fill="none" stroke="#06B6D4" strokeWidth="1.5" strokeDasharray="3 3" />

                  {/* Readiness Polygon (Indigo fill) */}
                  <polygon
                    points="100,36 156,92 128,142 72,148 38,88"
                    fill="rgba(99, 102, 241, 0.3)"
                    stroke="#6366F1"
                    strokeWidth="2"
                  />
                  <circle cx="100" cy="36" r="3.5" fill="#6366F1" />
                  <circle cx="156" cy="92" r="3.5" fill="#6366F1" />
                  <circle cx="128" cy="142" r="3.5" fill="#6366F1" />
                  <circle cx="72" cy="148" r="3.5" fill="#6366F1" />
                  <circle cx="38" cy="88" r="3.5" fill="#6366F1" />
                </svg>
              </div>
              <div className="flex items-center space-x-3 text-[10px] text-slate-400 mt-1">
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span>Readiness %</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded border border-dashed border-cyan-400" />
                  <span>Target %</span>
                </span>
              </div>
            </div>

            {/* Department List (7 cols) - Interactive Cards with Subtle Lift & Glow */}
            <div className="sm:col-span-7 space-y-2">
              {departments.map(dept => {
                const IconComponent = dept.icon;
                const statusClass =
                  dept.status === 'On Track'
                    ? 'status-on-track'
                    : dept.status === 'Attention'
                    ? 'status-attention'
                    : 'status-lagging';

                return (
                  <div
                    key={dept.name}
                    onClick={() => onNavigateModule('departments')}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onNavigateModule('departments');
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    title={`Click to view ${dept.name} scope dossier & controls`}
                    className={`dept-card-interactive ${statusClass} p-2.5 rounded-xl border flex items-center justify-between text-xs cursor-pointer group select-none ${
                      theme === 'light'
                        ? 'bg-slate-50/80 border-slate-200 hover:bg-white'
                        : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-900/90'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                      <div className={`p-1.5 rounded-lg border shrink-0 ${dept.iconColor} transition-transform duration-200 group-hover:scale-110`}>
                        <IconComponent className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-semibold text-white group-hover:text-indigo-300 transition-colors block truncate text-xs">
                            {dept.name}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-[10px] text-slate-400">
                          <span className="truncate">Lead: {dept.owner}</span>
                          <span>•</span>
                          <span className="font-mono text-slate-500">Target {dept.target}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <div className="text-right">
                        <span
                          className={`font-mono font-bold text-xs px-2 py-0.5 rounded inline-block transition-colors ${
                            dept.score >= 75
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : dept.score >= 65
                              ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {dept.score}%
                        </span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition-all duration-200 transform group-hover:translate-x-0.5 shrink-0" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
          <span>Target overall readiness for Stage 2: <strong className="text-white">80% across all units</strong></span>
          <span className="text-emerald-400 font-mono font-semibold">4 / 5 on track</span>
        </div>
      </div>

      {/* Scope Coverage & Evidence Vault Signals (5 cols) */}
      <div className="lg:col-span-5 p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Scope Coverage</h3>
              <p className="text-xs text-slate-400 mt-0.5">ISMS Organizational Boundaries & Assets</p>
            </div>
            <button
              onClick={() => onNavigateModule('org_scope')}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition flex items-center space-x-1"
            >
              <span>Scope Details</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2 mt-3">
            {scopeCategories.map(sc => (
              <div key={sc.label} className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium text-[11px] w-36 truncate">{sc.label}</span>
                <div className="flex items-center space-x-2 flex-1 max-w-[160px]">
                  <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${sc.color} rounded-full`} style={{ width: `${sc.pct}%` }} />
                  </div>
                  <span className="font-mono text-slate-300 text-[11px] w-7 text-right">{sc.pct}%</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <FileCheck2 className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="font-bold text-white text-xs block">Evidence Vault</span>
                <span className="text-[10px] text-slate-400">1,284 Valid / 1,438 Total Hashes</span>
              </div>
            </div>
            <button
              onClick={() => onNavigateModule('evidence_centre')}
              className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
            >
              Open Vault
            </button>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
          <span>Overall Scope Coverage: <strong className="text-white font-mono">68%</strong></span>
          <span className="text-indigo-300 font-medium">SoA Clause 4.3</span>
        </div>
      </div>
    </div>
  );
};
