import React, { useState } from 'react';
import { 
  FlaskConical, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  Plus, 
  Search, 
  Filter, 
  Layers, 
  ArrowRight,
  FileCheck,
  Building2,
  Globe
} from 'lucide-react';
import { controlTestingService } from '../../services/canonical/ControlTestingService';
import { ControlTest, ControlTestResult, ControlEffectivenessStatus } from '../../types/canonicalGrcTypes';
import { PremiumCard } from '../ui/premium/PremiumCard';
import { PremiumKpi } from '../ui/premium/PremiumKpi';
import { PremiumBadge } from '../ui/premium/PremiumBadge';
import { PremiumButton } from '../ui/premium/PremiumButton';
import { PremiumModal } from '../ui/premium/PremiumModal';
import { PremiumInput } from '../ui/premium/PremiumInput';

export const ControlTestingWorkspace: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'POSTURE' | 'TESTS' | 'IMPLEMENTATIONS' | 'DEFINITIONS'>('POSTURE');
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Form states for recording new test
  const [selectedControlCode, setSelectedControlCode] = useState('CTRL-088');
  const [testResult, setTestResult] = useState<ControlTestResult>('PASS');
  const [effectiveness, setEffectiveness] = useState<ControlEffectivenessStatus>('EFFECTIVE');
  const [sampleSize, setSampleSize] = useState(45);
  const [populationSize, setPopulationSize] = useState(120);
  const [tester, setTester] = useState('Sarah Chen');
  const [testObjective, setTestObjective] = useState('Verify 100% MFA WebAuthn enforcement across all admin accounts.');
  const [testProcedure, setTestProcedure] = useState('Sampled 45 privileged sessions from AWS CloudTrail and Okta system logs.');

  const posture = controlTestingService.getControlTestingPosture();
  const tests = controlTestingService.getAllTests();
  const implementations = controlTestingService.getAllImplementations();
  const definitions = controlTestingService.getAllControlDefinitions();

  const handleRecordTest = () => {
    controlTestingService.recordTestResult({
      tenantId: 'tenant-acme-corp',
      controlImplementationId: `${selectedControlCode}-ACME-PROD`,
      controlCode: selectedControlCode,
      testTitle: `${selectedControlCode} Operating Effectiveness Fieldwork`,
      testObjective,
      testProcedure,
      testType: 'HYBRID_SAMPLE',
      tester,
      testerRole: 'FIRST_LINE_OPS',
      populationSize,
      sampleSize,
      samplingMethod: 'RANDOM',
      testingPeriod: { startDate: '2026-07-01', endDate: '2026-09-30' },
      testResult,
      effectiveness,
      deficienciesIdentified: testResult === 'FAIL' ? ['Unmitigated access control deviation'] : [],
      exceptionsNotedCount: testResult === 'PASS' ? 0 : 2,
      evidenceIds: ['EV-2026-001'],
      findingsGeneratedIds: testResult === 'FAIL' ? ['FND-NEW-01'] : [],
      status: 'SIGNED_OFF'
    });

    setIsRecordModalOpen(false);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Control Testing & Effectiveness</h1>
              <p className="text-xs text-slate-400">
                Operating Effectiveness domain: Global Control Definition ≠ Tenant Implementation ≠ Control Test.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <PremiumButton
            size="sm"
            variant="primary"
            onClick={() => setIsRecordModalOpen(true)}
            icon={Plus}
          >
            Record Control Test
          </PremiumButton>
        </div>
      </div>

      {/* 5-State Posture KPIs (Mandatory GRC Lineage) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <PremiumKpi
          label="Total Canonical"
          value={posture.totalDefinitions}
          statusType="neutral"
          icon={Globe}
        />
        <PremiumKpi
          label="Implemented"
          value={posture.totalImplemented}
          statusType="info"
          icon={Building2}
        />
        <PremiumKpi
          label="Tested Controls"
          value={posture.testedCount}
          statusType="info"
          icon={FileCheck}
        />
        <PremiumKpi
          label="Effective Controls"
          value={posture.effectiveCount}
          statusType="success"
          icon={CheckCircle2}
        />
        <PremiumKpi
          label="Deficient Controls"
          value={posture.deficientCount}
          statusType={posture.deficientCount > 0 ? 'critical' : 'success'}
          icon={XCircle}
        />
        <PremiumKpi
          label="Untested Controls"
          value={posture.untestedCount}
          statusType="warning"
          icon={Clock}
        />
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-900/90 rounded-xl border border-slate-800">
        {[
          { id: 'POSTURE', label: 'Testing Posture Overview' },
          { id: 'TESTS', label: `Recorded Control Tests (${tests.length})` },
          { id: 'IMPLEMENTATIONS', label: `Tenant Implementations (${implementations.length})` },
          { id: 'DEFINITIONS', label: `Global Control Definitions (${definitions.length})` },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white shadow-md font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {/* TAB 1: POSTURE */}
        {activeTab === 'POSTURE' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <PremiumCard elevation={2} className="p-5 border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                Control Effectiveness Distribution
              </h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Effective ({posture.effectiveCount})</span>
                    <span className="font-bold text-emerald-400">
                      {Math.round((posture.effectiveCount / posture.totalImplemented) * 100)}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${(posture.effectiveCount / posture.totalImplemented) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Partially Effective ({posture.partiallyEffectiveCount})</span>
                    <span className="font-bold text-amber-400">
                      {Math.round((posture.partiallyEffectiveCount / posture.totalImplemented) * 100)}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${(posture.partiallyEffectiveCount / posture.totalImplemented) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Untested Backlog ({posture.untestedCount})</span>
                    <span className="font-bold text-slate-400">
                      {Math.round((posture.untestedCount / posture.totalImplemented) * 100)}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-slate-600 rounded-full"
                      style={{ width: `${(posture.untestedCount / posture.totalImplemented) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </PremiumCard>

            <PremiumCard elevation={2} className="p-5 border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-purple-400" />
                Recent Test Outcomes
              </h3>
              <div className="space-y-2.5">
                {tests.slice(0, 3).map(test => (
                  <div key={test.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-purple-400">{test.id}</span>
                        <span className="text-xs text-white font-medium">{test.controlCode}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{test.testTitle}</div>
                    </div>
                    <PremiumBadge variant={test.testResult === 'PASS' ? 'success' : test.testResult === 'PARTIAL' ? 'warning' : 'critical'}>
                      {test.testResult}
                    </PremiumBadge>
                  </div>
                ))}
              </div>
            </PremiumCard>
          </div>
        )}

        {/* TAB 2: TESTS */}
        {activeTab === 'TESTS' && (
          <div className="space-y-3">
            {tests.map(test => (
              <PremiumCard key={test.id} elevation={1} className="p-5 border-slate-800 space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-purple-400">{test.id}</span>
                      <span className="font-mono text-xs font-bold text-cyan-400">{test.controlCode}</span>
                      <PremiumBadge variant={test.testResult === 'PASS' ? 'success' : test.testResult === 'PARTIAL' ? 'warning' : 'critical'}>
                        {test.testResult}
                      </PremiumBadge>
                      <PremiumBadge variant="neutral">{test.testType.replace(/_/g, ' ')}</PremiumBadge>
                    </div>
                    <h4 className="text-sm font-bold text-white">{test.testTitle}</h4>
                  </div>

                  <div className="text-right text-xs text-slate-400">
                    <div>Tester: <strong className="text-slate-200">{test.tester}</strong></div>
                    <div>Performed: {test.performedAt.split('T')[0]}</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs space-y-1.5">
                  <div><strong className="text-slate-300">Objective:</strong> {test.testObjective}</div>
                  <div><strong className="text-slate-300">Procedure:</strong> {test.testProcedure}</div>
                  <div className="text-slate-400 pt-1">
                    Sample: <strong>{test.sampleSize}</strong> of <strong>{test.populationSize}</strong> items • Sampling Method: <strong>{test.samplingMethod}</strong>
                  </div>
                </div>
              </PremiumCard>
            ))}
          </div>
        )}

        {/* TAB 3: IMPLEMENTATIONS */}
        {activeTab === 'IMPLEMENTATIONS' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {implementations.map(impl => (
              <PremiumCard key={impl.id} elevation={1} className="p-5 border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-cyan-400">{impl.controlCode}</span>
                  <PremiumBadge variant={impl.effectivenessRating === 'EFFECTIVE' ? 'success' : impl.effectivenessRating === 'PARTIALLY_EFFECTIVE' ? 'warning' : 'critical'}>
                    {impl.effectivenessRating}
                  </PremiumBadge>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{impl.title}</h4>
                  <p className="text-xs text-slate-400 mt-1">{impl.implementationDetails}</p>
                </div>
                <div className="pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                  <span>Owner: <strong className="text-slate-200">{impl.owner}</strong></span>
                  <span>Env: <strong className="text-slate-200">{impl.operatingEnvironment}</strong></span>
                </div>
              </PremiumCard>
            ))}
          </div>
        )}

        {/* TAB 4: DEFINITIONS */}
        {activeTab === 'DEFINITIONS' && (
          <div className="space-y-3">
            {definitions.map(def => (
              <PremiumCard key={def.id} elevation={1} className="p-5 border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-400">{def.code}</span>
                    <PremiumBadge variant="neutral">{def.category.replace(/_/g, ' ')}</PremiumBadge>
                    <PremiumBadge variant="info">{def.type}</PremiumBadge>
                  </div>
                  <span className="text-xs text-slate-500">Global ID: {def.id}</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{def.title}</h4>
                  <p className="text-xs text-slate-400 mt-1">{def.description}</p>
                </div>
                <div className="text-xs text-slate-400 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <strong className="text-slate-300">Standard Testing Procedure:</strong> {def.standardTestingProcedure}
                </div>
              </PremiumCard>
            ))}
          </div>
        )}
      </div>

      {/* Record Test Modal */}
      <PremiumModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        title="Record Control Operating Effectiveness Test"
        subtitle="Perform ISO 19011-compliant control fieldwork and audit sign-off"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Target Control</label>
              <select
                value={selectedControlCode}
                onChange={e => setSelectedControlCode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
              >
                {implementations.map(impl => (
                  <option key={impl.controlCode} value={impl.controlCode}>
                    {impl.controlCode} - {impl.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Tester / Assessor</label>
              <input
                type="text"
                value={tester}
                onChange={e => setTester(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Test Result</label>
              <select
                value={testResult}
                onChange={e => setTestResult(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
              >
                <option value="PASS">PASS</option>
                <option value="PARTIAL">PARTIAL</option>
                <option value="FAIL">FAIL</option>
                <option value="NOT_TESTED">NOT TESTED</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Assessed Effectiveness</label>
              <select
                value={effectiveness}
                onChange={e => setEffectiveness(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
              >
                <option value="EFFECTIVE">EFFECTIVE</option>
                <option value="PARTIALLY_EFFECTIVE">PARTIALLY EFFECTIVE</option>
                <option value="DEFICIENT">DEFICIENT</option>
                <option value="NOT_TESTED">NOT TESTED</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Sample Size</label>
              <input
                type="number"
                value={sampleSize}
                onChange={e => setSampleSize(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Population Size</label>
              <input
                type="number"
                value={populationSize}
                onChange={e => setPopulationSize(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Test Objective</label>
            <textarea
              rows={2}
              value={testObjective}
              onChange={e => setTestObjective(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Test Procedure & Fieldwork Notes</label>
            <textarea
              rows={2}
              value={testProcedure}
              onChange={e => setTestProcedure(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
            <PremiumButton size="sm" variant="secondary" onClick={() => setIsRecordModalOpen(false)}>
              Cancel
            </PremiumButton>
            <PremiumButton size="sm" variant="primary" onClick={handleRecordTest}>
              Submit & Sign-off Test
            </PremiumButton>
          </div>
        </div>
      </PremiumModal>
    </div>
  );
};
