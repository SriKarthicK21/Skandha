import React, { useState } from 'react';
import { useGRC } from '../../context/GRCContext';
import { DepartmentScopeHub } from '../departments/DepartmentScopeHub';
import { OrganizationalComplianceGuidelinesView } from '../compliance/OrganizationalComplianceGuidelinesView';
import { PageContainer } from '../layout/PageContainer';
import { OrganizationScopeModule } from '../scope/OrganizationScopeModule';
import { SmartBusinessGapAssessment } from '../assessment/SmartBusinessGapAssessment';
import { SmartFrameworkCrosswalkSelector } from '../onboarding/SmartFrameworkCrosswalkSelector';
import { AutomaticComplianceRoadmap } from '../roadmap/AutomaticComplianceRoadmap';
import {
  Compass,
  Building,
  Layers,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Award,
  Download,
  Printer,
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  ListTodo,
  BookOpen,
  Globe,
  Shield
} from 'lucide-react';

// --- 1. Gap Assessment & CMMI Maturity Module ---
export const GapAssessmentModule: React.FC = () => {
  const { currentTenant, setActiveModule, tasks, addTask } = useGRC();
  
  interface DomainMaturity {
    name: string;
    clause: string;
    currentScore: number; // 0 to 5
    targetScore: number;  // default 4
    description: string;
    evidenceNeeded: string;
  }

  const [domains, setDomains] = useState<DomainMaturity[]>([
    { name: 'Context of the Organization', clause: 'Clause 4', currentScore: 4, targetScore: 4, description: 'Internal/external issues and scope boundary documentation.', evidenceNeeded: 'Scope Statement & Interested Parties Register' },
    { name: 'Leadership & Commitment', clause: 'Clause 5', currentScore: 4, targetScore: 4, description: 'Information security policy and formal executive roles.', evidenceNeeded: 'ISMS Policy & Roles Matrix signed by CEO' },
    { name: 'Planning & Risk Management', clause: 'Clause 6', currentScore: 3, targetScore: 4, description: '5x5 risk evaluation, treatment plans, and ISMS objectives.', evidenceNeeded: 'Risk Register & Risk Treatment Simulator outputs' },
    { name: 'Support, Resources & Competence', clause: 'Clause 7', currentScore: 3, targetScore: 4, description: 'Security awareness training and documented information control.', evidenceNeeded: 'Staff training logs and document version control' },
    { name: 'Operational Planning & Control', clause: 'Clause 8', currentScore: 4, targetScore: 4, description: 'Executing security controls and change management.', evidenceNeeded: 'Change logs and supplier security assessments' },
    { name: 'Performance Evaluation & MRM', clause: 'Clause 9', currentScore: 3, targetScore: 4, description: 'Internal audits (9.2) and management review meetings (9.3).', evidenceNeeded: 'Internal Audit Reports & Signed MRM Minutes' },
    { name: 'Improvement & CAPA Handling', clause: 'Clause 10', currentScore: 4, targetScore: 4, description: 'Root cause analysis and corrective action management.', evidenceNeeded: 'CAPA closure forms with 5-Whys analysis' },
    { name: 'Organizational Controls (Annex A.5)', clause: 'Annex A.5', currentScore: 4, targetScore: 4, description: 'Policies, roles, asset management, and supplier relationships.', evidenceNeeded: '37 Organizational control evidence items' },
    { name: 'People Security Controls (Annex A.6)', clause: 'Annex A.6', currentScore: 3, targetScore: 4, description: 'Background screening, NDAs, and remote working safeguards.', evidenceNeeded: '8 People control evidence files and NDAs' },
    { name: 'Physical Security (Annex A.7)', clause: 'Annex A.7', currentScore: 4, targetScore: 4, description: 'Office perimeter, badges, clear desk, and equipment security.', evidenceNeeded: 'CCTV/Access logs and clean desk spot audits' },
    { name: 'Technological Controls (Annex A.8)', clause: 'Annex A.8', currentScore: 3, targetScore: 4, description: 'IAM, MFA, encryption, backup, logging, and vulnerability scans.', evidenceNeeded: 'Cloud drift reports, pentests, and SAST scans' }
  ]);

  const [activeTab, setActiveTab] = useState<'smart_questions' | 'matrix' | 'remediation'>('smart_questions');
  const [createdTaskDomain, setCreatedTaskDomain] = useState<string | null>(null);

  const handleScoreChange = (index: number, newScore: number) => {
    setDomains(prev => prev.map((d, i) => i === index ? { ...d, currentScore: newScore } : d));
  };

  const handleGenerateRemediationTask = (d: DomainMaturity) => {
    addTask({
      title: `[Gap Remediation] Elevate ${d.name} (${d.clause}) to Level ${d.targetScore}`,
      description: `Targeted ISO 27001 gap remediation action: Close control maturity deficit. Evidence required: ${d.evidenceNeeded}`,
      category: 'Remediation',
      department: 'Information Security',
      priority: 'High',
      status: 'To Do',
      assignedTo: 'Lead ISMS Implementer',
      dueDate: new Date(Date.now() + 21 * 86400000).toISOString().split('T')[0]
    });

    setCreatedTaskDomain(d.name);
    setTimeout(() => setCreatedTaskDomain(null), 3000);
  };

  // Overall calculations
  const totalCurrent = domains.reduce((acc, curr) => acc + curr.currentScore, 0);
  const totalTarget = domains.reduce((acc, curr) => acc + curr.targetScore, 0);
  const averageCurrent = (totalCurrent / domains.length).toFixed(1);
  const maturityPercentage = Math.round((totalCurrent / totalTarget) * 100);

  return (
    <PageContainer id="gap-assessment-module">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950/40 border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400 px-2 py-0.5 rounded bg-sky-950 border border-sky-800">
              ISO/IEC 27001 & CMMI Maturity Benchmarking
            </span>
            <h1 className="text-xl font-bold text-white mt-1">ISMS Gap Assessment & CMMI Maturity Matrix</h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Evaluate ISO 27001 Clauses 4–10 and Annex A themes across CMMI Levels 0 (Incomplete) through 5 (Optimizing). Generate remediation tasks automatically for items below target maturity.
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => setActiveTab('smart_questions')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'smart_questions' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Business Questions</span>
            </button>
            <button
              onClick={() => setActiveTab('matrix')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'matrix' ? 'bg-sky-600 text-white shadow-xs' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              CMMI Maturity Matrix
            </button>
            <button
              onClick={() => setActiveTab('remediation')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'remediation' ? 'bg-sky-600 text-white shadow-xs' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Remediation Action Roadmap
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">Average Maturity Score</div>
          <div className="text-2xl font-black text-sky-400">{averageCurrent} <span className="text-sm font-normal text-slate-400">/ 5.0</span></div>
          <div className="text-[11px] text-slate-400">Target: Level 4 (Managed)</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">Audit Readiness Alignment</div>
          <div className="text-2xl font-black text-emerald-400">{maturityPercentage}%</div>
          <div className="text-[11px] text-slate-400">Stage 1 Audit Benchmark: 80%</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">Domains at Target</div>
          <div className="text-2xl font-black text-indigo-400">
            {domains.filter(d => d.currentScore >= d.targetScore).length} / {domains.length}
          </div>
          <div className="text-[11px] text-slate-400">Ready for External Inspection</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">Maturity Gaps Identified</div>
          <div className="text-2xl font-black text-amber-400">
            {domains.filter(d => d.currentScore < d.targetScore).length}
          </div>
          <div className="text-[11px] text-slate-400">Requires Remediation Action</div>
        </div>
      </div>

      {createdTaskDomain && (
        <div className="p-3 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-700 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Remediation task for "{createdTaskDomain}" created in Tasks & Projects module!</span>
        </div>
      )}

      {/* Main Tab Content */}
      {activeTab === 'smart_questions' ? (
        <SmartBusinessGapAssessment />
      ) : activeTab === 'matrix' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {domains.map((domain, idx) => {
            const hasGap = domain.currentScore < domain.targetScore;
            return (
              <div
                key={domain.name}
                className={`p-5 rounded-2xl border space-y-3 transition-colors ${
                  hasGap ? 'bg-slate-900 border-amber-500/30' : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-sky-400">
                      {domain.clause}
                    </span>
                    <span className="text-xs font-bold text-white">{domain.name}</span>
                  </div>

                  <span className={`text-xs font-bold ${hasGap ? 'text-amber-400' : 'text-emerald-400'}`}>
                    Level {domain.currentScore} / {domain.targetScore}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">{domain.description}</p>

                {/* Progress bar */}
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full rounded-full ${
                      domain.currentScore >= 4
                        ? 'bg-gradient-to-r from-sky-500 to-emerald-500'
                        : 'bg-gradient-to-r from-amber-500 to-sky-500'
                    }`}
                    style={{ width: `${(domain.currentScore / 5) * 100}%` }}
                  />
                </div>

                {/* Score Selector Controls */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center space-x-1">
                    {[0, 1, 2, 3, 4, 5].map(lvl => (
                      <button
                        key={lvl}
                        onClick={() => handleScoreChange(idx, lvl)}
                        className={`w-6 h-6 rounded-md text-[10px] font-bold transition ${
                          domain.currentScore === lvl
                            ? 'bg-sky-600 text-white ring-1 ring-sky-400'
                            : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                        title={`Set to CMMI Level ${lvl}`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>

                  {hasGap && (
                    <button
                      onClick={() => handleGenerateRemediationTask(domain)}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-bold transition flex items-center space-x-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Create Task</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white">Prioritized Gap Remediation Roadmap</h3>
          <p className="text-xs text-slate-400">
            The following domains contain maturity deficits that must be closed prior to Stage 1 external certification.
          </p>

          <div className="space-y-3">
            {domains.filter(d => d.currentScore < d.targetScore).map(domain => (
              <div key={domain.name} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-amber-400">{domain.clause}</span>
                    <span className="text-xs font-bold text-white">{domain.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                      Gap: {domain.targetScore - domain.currentScore} Level Deficit
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Required Evidence: <strong className="text-slate-200">{domain.evidenceNeeded}</strong>
                  </div>
                </div>

                <button
                  onClick={() => handleGenerateRemediationTask(domain)}
                  className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition shadow-sm shrink-0"
                >
                  Generate Task
                </button>
              </div>
            ))}

            {domains.filter(d => d.currentScore < d.targetScore).length === 0 && (
              <div className="p-8 text-center text-emerald-400 text-xs font-semibold">
                🎉 All ISO 27001 domains have achieved target CMMI Level 4 (Managed) maturity!
              </div>
            )}
          </div>
        </div>
      )}
    </PageContainer>
  );
};

// --- 2. Organizational Scope Module ---
export const OrgScopeModule: React.FC = () => {
  return <OrganizationScopeModule />;
};

// --- 3. Departments Module ---
export const DepartmentsModule: React.FC = () => {
  return <DepartmentScopeHub />;
};

// --- 4. Frameworks Module ---
export const FrameworksModule: React.FC = () => {
  const { currentTenant } = useGRC();
  const [activeTab, setActiveTab] = useState<'crosswalk' | 'guidelines' | 'catalog'>('crosswalk');

  const frameworks = [
    {
      code: 'ISO/IEC 27001:2022',
      title: 'Information Security Management System (ISMS)',
      controls: 93,
      status: 'Active (Primary)',
      badge: 'bg-sky-500/20 text-sky-300 border-sky-500/40'
    },
    {
      code: 'SOC 2 Type II',
      title: 'Trust Services Criteria (Security, Availability, Confidentiality)',
      controls: 64,
      status: currentTenant?.selectedFrameworks.includes('SOC 2') ? 'Active (Mapped)' : 'Available',
      badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
    },
    {
      code: 'ISO/IEC 27701:2019',
      title: 'Privacy Information Management System (PIMS)',
      controls: 49,
      status: currentTenant?.selectedFrameworks.includes('ISO 27701') ? 'Active (Mapped)' : 'Available',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
    },
    {
      code: 'NIST CSF 2.0',
      title: 'National Institute of Standards & Technology Cybersecurity Framework',
      controls: 106,
      status: currentTenant?.selectedFrameworks.includes('NIST CSF') ? 'Active (Mapped)' : 'Available',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
    }
  ];

  return (
    <PageContainer id="frameworks-module">
      {/* Tab Switcher */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('crosswalk')}
          className={`pb-3 px-4 text-xs font-bold flex items-center space-x-2 border-b-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === 'crosswalk'
              ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span>Multi-Framework Crosswalk & Intelligence</span>
        </button>

        <button
          onClick={() => setActiveTab('guidelines')}
          className={`pb-3 px-4 text-xs font-bold flex items-center space-x-2 border-b-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === 'guidelines'
              ? 'border-sky-500 text-sky-600 dark:text-sky-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Compliance Guidelines (ISO, MAS TRM, DPDP, GDPR)</span>
        </button>

        <button
          onClick={() => setActiveTab('catalog')}
          className={`pb-3 px-4 text-xs font-bold flex items-center space-x-2 border-b-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === 'catalog'
              ? 'border-sky-500 text-sky-600 dark:text-sky-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Supported Framework Catalog & Status</span>
        </button>
      </div>

      {activeTab === 'crosswalk' && (
        <div className="pt-4">
          <SmartFrameworkCrosswalkSelector />
        </div>
      )}

      {activeTab === 'guidelines' && (
        <div className="pt-4">
          <OrganizationalComplianceGuidelinesView />
        </div>
      )}

      {activeTab === 'catalog' && (
        <div className="space-y-6 pt-4">
          <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950/40 border border-slate-800 shadow-md">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400 px-2 py-0.5 rounded bg-sky-950 border border-sky-800">
              Standard-Agnostic Engine
            </span>
            <h1 className="text-xl font-bold text-white mt-1">Supported Standards & Security Frameworks</h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Multi-standard cross-mapping allowing controls, risks, and evidence to be evaluated simultaneously across ISO 27001, SOC 2, and NIST CSF.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {frameworks.map((fw, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-white">{fw.code}</span>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${fw.badge}`}>
                    {fw.status}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white">{fw.title}</h3>
                <p className="text-xs text-slate-400">Total Control Criteria: {fw.controls} Controls</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </PageContainer>
  );
};

// --- 5. Requirements (Clauses 4-10) Module ---
export const RequirementsModule: React.FC = () => {
  const clauses = [
    { num: '4', title: 'Context of the Organization', reqs: 'Internal/external issues, interested parties, ISMS scope.' },
    { num: '5', title: 'Leadership & Commitment', reqs: 'Information security policy, organizational roles & responsibilities.' },
    { num: '6', title: 'Planning & Risk Assessment', reqs: 'Risk identification, 5x5 evaluation, treatment planning, ISMS objectives.' },
    { num: '7', title: 'Support & Resources', reqs: 'Competence, awareness training, communication, documented information.' },
    { num: '8', title: 'Operation & Control', reqs: 'Operational planning, risk assessment execution, risk treatment implementation.' },
    { num: '9', title: 'Performance Evaluation', reqs: 'Monitoring, measurement, internal audit program (9.2), management review (9.3).' },
    { num: '10', title: 'Improvement & CAPA', reqs: 'Non-conformity, 5-Whys root cause analysis, corrective action, continual improvement.' }
  ];

  return (
    <PageContainer id="requirements-module">
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950/40 border border-slate-800 shadow-md">
        <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400 px-2 py-0.5 rounded bg-sky-950 border border-sky-800">
          ISO 27001:2022 Mandatory Core
        </span>
        <h1 className="text-xl font-bold text-white mt-1">Management System Requirements (Clauses 4 to 10)</h1>
        <p className="text-xs text-slate-300 mt-1 max-w-2xl">
          Complete mandatory Clauses 4 through 10 governing the governance backbone of the Information Security Management System.
        </p>
      </div>

      <div className="space-y-3">
        {clauses.map(c => (
          <div key={c.num} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800">
                  Clause {c.num}
                </span>
                <h3 className="text-sm font-bold text-white">{c.title}</h3>
              </div>
              <p className="text-xs text-slate-400">{c.reqs}</p>
            </div>
            <span className="text-emerald-400 font-bold text-xs flex items-center space-x-1 shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Compliant</span>
            </span>
          </div>
        ))}
      </div>
    </PageContainer>
  );
};

// --- 6. Implementation Timeline Module ---
export const ImplementationModule: React.FC = () => {
  return (
    <PageContainer id="implementation-module">
      <AutomaticComplianceRoadmap />
    </PageContainer>
  );
};

// --- 7. Critical Business Processes & Dependency Mapping ---
export const ProcessesModule: React.FC = () => {
  const { currentTenant, setActiveModule } = useGRC();
  const [filterCriticality, setFilterCriticality] = useState<string>('ALL');

  interface ProcessItem {
    id: string;
    code: string;
    name: string;
    criticality: 'CRITICAL' | 'HIGH' | 'MEDIUM';
    rto: string;
    rpo: string;
    department: string;
    owner: string;
    isoControlMapping: string[];
    masDomain: string;
    status: 'Operational' | 'Under Review' | 'BIA Verified';
  }

  const processes: ProcessItem[] = [
    {
      id: 'proc-1',
      code: 'BP-01',
      name: 'Client Onboarding, e-KYC & Identity Verification',
      criticality: 'CRITICAL',
      rto: '< 2 Hours',
      rpo: '< 15 Mins',
      department: 'Operations & Business Continuity',
      owner: 'Head of Operations',
      isoControlMapping: ['A.5.15', 'A.8.1', 'A.8.24'],
      masDomain: 'Sec 10.0 Access Control & Sec 11.0 Data Protection',
      status: 'BIA Verified'
    },
    {
      id: 'proc-2',
      code: 'BP-02',
      name: 'Real-Time Payment Gateway & Settlement Execution',
      criticality: 'CRITICAL',
      rto: '< 1 Hour',
      rpo: '< 5 Mins',
      department: 'Software Engineering & DevOps',
      owner: 'Principal Architect',
      isoControlMapping: ['A.5.29', 'A.5.30', 'A.8.13'],
      masDomain: 'Sec 6.0 IT Systems Resilience & Sec 9.0 Network Security',
      status: 'BIA Verified'
    },
    {
      id: 'proc-3',
      code: 'BP-03',
      name: 'CI/CD Pipeline & Automated Security Gate Deployment',
      criticality: 'HIGH',
      rto: '< 4 Hours',
      rpo: '< 1 Hour',
      department: 'Software Engineering & DevOps',
      owner: 'DevOps Lead',
      isoControlMapping: ['A.8.25', 'A.8.28', 'A.8.31'],
      masDomain: 'Sec 8.0 Software Application Development',
      status: 'Operational'
    },
    {
      id: 'proc-4',
      code: 'BP-04',
      name: '24/7 Security Operations & Incident Containment (SIEM/SOC)',
      criticality: 'CRITICAL',
      rto: '< 30 Mins',
      rpo: 'Real-time',
      department: 'Information Security & Compliance',
      owner: 'Lead SOC Analyst',
      isoControlMapping: ['A.5.24', 'A.5.25', 'A.8.15', 'A.8.16'],
      masDomain: 'Sec 13.0 Cyber Incident Management (Notice 644)',
      status: 'BIA Verified'
    },
    {
      id: 'proc-5',
      code: 'BP-05',
      name: 'Vulnerability Management & Zero-Day Patch Orchestration',
      criticality: 'HIGH',
      rto: '< 24 Hours',
      rpo: 'N/A',
      department: 'Information Security & Compliance',
      owner: 'Vulnerability Manager',
      isoControlMapping: ['A.8.8', 'A.8.19'],
      masDomain: 'Sec 12.0 Vulnerability Assessment & Pen-Testing',
      status: 'Operational'
    },
    {
      id: 'proc-6',
      code: 'BP-06',
      name: 'Employee Lifecycle, Access Provisioning & Deprovisioning',
      criticality: 'MEDIUM',
      rto: '< 8 Hours',
      rpo: 'N/A',
      department: 'Human Resources & People Ops',
      owner: 'HR Business Partner',
      isoControlMapping: ['A.6.1', 'A.6.2', 'A.6.5'],
      masDomain: 'Sec 3.0 IT Governance & HR Security',
      status: 'Operational'
    },
    {
      id: 'proc-7',
      code: 'BP-07',
      name: 'Vendor & Cloud Sub-processor Due Diligence & SLA Oversight',
      criticality: 'HIGH',
      rto: '< 48 Hours',
      rpo: 'N/A',
      department: 'Procurement & Vendor Management',
      owner: 'Procurement Director',
      isoControlMapping: ['A.5.19', 'A.5.20', 'A.5.21', 'A.5.22'],
      masDomain: 'Sec 14.0 Technology Service Provider Management',
      status: 'BIA Verified'
    }
  ];

  const filtered = processes.filter(p =>
    filterCriticality === 'ALL' ? true : p.criticality === filterCriticality
  );

  return (
    <PageContainer id="processes-module">
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950/40 border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400 px-2 py-0.5 rounded bg-sky-950 border border-sky-800">
              ISO 27001 Clause 8.1 & MAS TRM Critical Systems
            </span>
            <h1 className="text-xl font-bold text-white mt-1">Critical Business Processes & System Dependencies</h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Inventory of business functions, Maximum Tolerable Outage (MTO), RTO/RPO recovery metrics, and regulatory mapping for {currentTenant?.name}.
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map(crit => (
              <button
                key={crit}
                onClick={() => setFilterCriticality(crit)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  filterCriticality === crit
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {crit}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">Total Business Processes</div>
          <div className="text-2xl font-black text-sky-400">{processes.length}</div>
          <div className="text-[11px] text-slate-400">Registered in BIA Registry</div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">MAS TRM Critical Systems</div>
          <div className="text-2xl font-black text-rose-400">{processes.filter(p => p.criticality === 'CRITICAL').length}</div>
          <div className="text-[11px] text-slate-400">RTO &lt; 2h & 99.99% SLA Mandate</div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">BIA Verified Status</div>
          <div className="text-2xl font-black text-emerald-400">{processes.filter(p => p.status === 'BIA Verified').length} / {processes.length}</div>
          <div className="text-[11px] text-slate-400">Annual BIA Completed</div>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map(proc => (
          <div
            key={proc.id}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2.5">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-sky-400">
                  {proc.code}
                </span>
                <h3 className="text-sm font-bold text-white">{proc.name}</h3>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    proc.criticality === 'CRITICAL'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : proc.criticality === 'HIGH'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                  }`}
                >
                  {proc.criticality}
                </span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {proc.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs pt-1 border-t border-slate-800/80">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Department</span>
                <span className="text-slate-300 font-medium">{proc.department}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Process Owner</span>
                <span className="text-slate-300 font-medium">{proc.owner}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Recovery Targets</span>
                <span className="text-sky-300 font-mono font-semibold">RTO: {proc.rto} | RPO: {proc.rpo}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">ISO & MAS Mapping</span>
                <span className="text-slate-300 font-mono text-[11px]">{proc.isoControlMapping.join(', ')}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
};

// --- 8. Reports & Analytics / Compliance Roadmap Module ---
export { ReportsAnalyticsModule } from './ReportsAnalyticsModule';
