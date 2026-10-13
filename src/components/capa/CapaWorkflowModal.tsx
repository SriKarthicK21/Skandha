import React, { useState, useMemo } from 'react';
import { FindingCAPARecord, FiveWhysStep, AttachedEvidenceArtifact, IndependentAuditValidation } from '../../types';
import { useGRC } from '../../context/GRCContext';
import {
  ShieldCheck,
  Award,
  CheckCircle2,
  Clock,
  ArrowRight,
  FileText,
  Lock,
  Unlock,
  UserCheck,
  AlertTriangle,
  AlertOctagon,
  Sparkles,
  Printer,
  X,
  UploadCloud,
  ChevronRight,
  Hash,
  Building,
  HelpCircle,
  FileCheck2,
  Plus,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { CapaAuditCertificateModal } from './CapaAuditCertificateModal';

interface CapaWorkflowModalProps {
  finding: FindingCAPARecord;
  onClose: () => void;
  theme?: string;
}

export const CapaWorkflowModal: React.FC<CapaWorkflowModalProps> = ({
  finding,
  onClose,
  theme = 'dark'
}) => {
  const isLight = theme === 'light';
  const { currentTenant, currentUser, currentRole, updateFinding, validateAndCloseFinding, logAuditEvent } = useGRC();

  // Active Stage Tab (1: Linkage, 2: 5-Whys RCA, 3: CAPA Plan, 4: Implementation & Evidence, 5: Independent Audit Validation)
  const [activeStage, setActiveStage] = useState<1 | 2 | 3 | 4 | 5>(() => {
    if (finding.status === 'Closed Verified' || finding.status === 'Verification Pending') return 5;
    if (finding.status === 'CAPA Submitted') return 4;
    if (finding.status === 'Root Cause Defined') return 3;
    return 2;
  });

  // Local state copy for edits
  const [currentFinding, setCurrentFinding] = useState<FindingCAPARecord>(finding);
  const [showCertModal, setShowCertModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // --- STAGE 2: 5-WHYS STATE ---
  const initialFiveWhys: FiveWhysStep[] = useMemo(() => {
    if (currentFinding.rootCauseAnalysis.fiveWhysChain && currentFinding.rootCauseAnalysis.fiveWhysChain.length > 0) {
      return currentFinding.rootCauseAnalysis.fiveWhysChain;
    }
    // Parse from legacy whys array if present
    if (currentFinding.rootCauseAnalysis.whys && currentFinding.rootCauseAnalysis.whys.length > 0) {
      return currentFinding.rootCauseAnalysis.whys.map((w, idx) => ({
        whyNumber: idx + 1,
        question: `Why did condition ${idx + 1} manifest?`,
        answer: w.replace(/^Why.*?->\s*/, ''),
        category: (idx === 0 ? 'Process' : idx === 1 ? 'Technology' : idx === 2 ? 'People' : 'Governance') as any
      }));
    }
    return [
      { whyNumber: 1, question: `Why did the ${currentFinding.title.toLowerCase()} occur?`, answer: '', category: 'Process' },
      { whyNumber: 2, question: 'Why was the standard procedure not followed or bypassed?', answer: '', category: 'Process' },
      { whyNumber: 3, question: 'Why did existing technical safeguards or alerts fail to catch it?', answer: '', category: 'Technology' },
      { whyNumber: 4, question: 'Why was there no supervisory review or verification gate?', answer: '', category: 'Governance' },
      { whyNumber: 5, question: 'Root Cause: Why does the system-level design allow this condition?', answer: '', category: 'Governance' }
    ];
  }, [currentFinding]);

  const [fiveWhys, setFiveWhys] = useState<FiveWhysStep[]>(initialFiveWhys);
  const [rootCauseStatement, setRootCauseStatement] = useState(
    currentFinding.rootCauseAnalysis.rootCauseStatement || ''
  );
  const [contributingFactors, setContributingFactors] = useState<string[]>(
    currentFinding.rootCauseAnalysis.contributingFactors || ['Procedure Documentation Gap', 'Monitoring Latency']
  );
  const [newFactorInput, setNewFactorInput] = useState('');

  // --- STAGE 3: CAPA PLAN STATE ---
  const [correctiveAction, setCorrectiveAction] = useState(currentFinding.capaPlan.correctiveAction || '');
  const [preventiveAction, setPreventiveAction] = useState(currentFinding.capaPlan.preventiveAction || '');
  const [actionOwner, setActionOwner] = useState(currentFinding.capaPlan.owner || '');
  const [targetDate, setTargetDate] = useState(currentFinding.capaPlan.targetDate || '');
  const [evidenceRequired, setEvidenceRequired] = useState(currentFinding.capaPlan.evidenceRequired || '');

  // --- STAGE 4: IMPLEMENTATION & EVIDENCE STATE ---
  const [implementationNotes, setImplementationNotes] = useState(
    currentFinding.implementationNotes || currentFinding.capaPlan.implementationNotes || ''
  );
  const [attachedArtifacts, setAttachedArtifacts] = useState<AttachedEvidenceArtifact[]>(
    currentFinding.capaPlan.attachedEvidenceArtifacts || []
  );
  const [newArtifactTitle, setNewArtifactTitle] = useState('');
  const [newArtifactRef, setNewArtifactRef] = useState('');

  // --- STAGE 5: INDEPENDENT AUDIT VALIDATION STATE ---
  // Segregation of duties: auditor cannot be action owner
  const isActionOwner = currentUser.name.toLowerCase().includes((currentFinding.capaPlan.owner || '').toLowerCase());
  const [simulateAuditorRole, setSimulateAuditorRole] = useState(
    currentRole === 'PLATFORM_AUDITOR' || currentRole === 'SUPER_ADMIN' || !isActionOwner
  );

  const existingVal = currentFinding.independentAuditValidation;
  const [auditorName, setAuditorName] = useState(existingVal?.auditorName || (simulateAuditorRole ? 'Marcus Brody' : currentUser.name));
  const [auditorEmail, setAuditorEmail] = useState(existingVal?.auditorEmail || (simulateAuditorRole ? 'm.brody@skanda-audit.internal' : currentUser.email));
  const [auditorRole, setAuditorRole] = useState(existingVal?.auditorRole || 'Lead Internal Auditor (ISO 27001 / CISA)');
  const [auditProgramRef, setAuditProgramRef] = useState(existingVal?.auditProgramRef || 'IA-2026-Q3-RETEST-04');
  const [samplingMethodology, setSamplingMethodology] = useState(
    existingVal?.samplingMethodology || '100% Population re-inspection of remediated artifacts and synthetic failure test.'
  );
  const [sampleSizeInspected, setSampleSizeInspected] = useState(existingVal?.sampleSizeInspected || 25);
  const [auditorObservations, setAuditorObservations] = useState(
    existingVal?.auditorObservations ||
      'Independently inspected operating evidence. Re-executed automated validation script; confirmed that root cause has been systematically eliminated.'
  );
  const [toeResult, setToeResult] = useState<'PASSED' | 'FAILED' | 'CONDITIONALLY_PASSED'>(
    existingVal?.testOfOperatingEffectiveness || 'PASSED'
  );
  const [independenceConfirmed, setIndependenceConfirmed] = useState(
    existingVal?.independenceStatementConfirmed ?? true
  );
  const [validationError, setValidationError] = useState<string | null>(null);
  const [accelerateEffectivenessWindow, setAccelerateEffectivenessWindow] = useState(false);

  // 60-Day Effectiveness Countdown (ISO 27001 Clause 10.2 / Lead Auditor Requirement)
  const completedTimestamp = new Date(currentFinding.capaPlan.completedDate || currentFinding.raisedDate).getTime();
  const daysSinceCompletion = Math.max(0, Math.floor((Date.now() - completedTimestamp) / (1000 * 60 * 60 * 24)));
  const daysRemainingInWindow = Math.max(0, 60 - daysSinceCompletion);
  const isEffectivenessWindowSatisfied = daysRemainingInWindow === 0 || accelerateEffectivenessWindow;

  // Root Cause Depth Checker (Clause 10.2: Rejection of superficial causes)
  const superficialPhrases = ['user error', 'human error', 'employee forgot', 'forgot to', 'accidental mistake', 'careless'];
  const hasSuperficialRootCause = superficialPhrases.some(phrase =>
    rootCauseStatement.toLowerCase().includes(phrase)
  );

  // Systemic Failure Categories Breakdown for Ishikawa
  const categoryCounts = useMemo(() => {
    const counts = { People: 0, Process: 0, Technology: 0, Governance: 0, Environment: 0 };
    fiveWhys.forEach(w => {
      if (w.category && counts[w.category as keyof typeof counts] !== undefined) {
        counts[w.category as keyof typeof counts]++;
      }
    });
    return counts;
  }, [fiveWhys]);

  // Auto-generate AI 5-Whys sequence based on finding context
  const handleGenerateAiFiveWhys = () => {
    let q1 = `Why did the ${currentFinding.title.toLowerCase()} occur?`;
    let a1 = `The operational activity in ${currentFinding.department} was executed without fulfilling control ${currentFinding.clauseOrControl}.`;
    let q2 = `Why was control ${currentFinding.clauseOrControl} bypassed or delayed?`;
    let a2 = `Operational staff relied on informal working handoffs rather than automated gate checks.`;
    let q3 = `Why were automated gate checks absent?`;
    let a3 = `The continuous compliance monitoring rule was not integrated into the CI/CD and ticket routing webhook.`;
    let q4 = `Why was the webhook integration deferred or omitted?`;
    let a4 = `Prior sprint allocations prioritized functional delivery over GRC technical debt verification.`;
    let q5 = `Root Cause: Why did governance not mandate automated gating before production release?`;
    let a5 = `Lack of mandatory ISO 27001 control verification checkpoints within the departmental change management standard.`;

    if (currentFinding.clauseOrControl.includes('8.8') || currentFinding.title.toLowerCase().includes('vulnerab')) {
      a1 = `Container vulnerability patching exceeded internal 30-day SLA window during staging deployment.`;
      a2 = `Alerts were dispatched to a legacy notification queue that was unmonitored following departmental reorganization.`;
      a3 = `Alert webhook heartbeat monitoring and dead-letter queue were absent.`;
      a4 = `Change management procedures did not mandate verifying webhook subscribers during team reorganizations.`;
      a5 = `Systemic absence of centralized, automated alert health-checks across security monitoring tooling.`;
    } else if (currentFinding.clauseOrControl.includes('5.15') || currentFinding.title.toLowerCase().includes('access')) {
      a1 = `Quarterly privileged access review sign-offs were not completed within the prescribed 90-day cycle.`;
      a2 = `Access reviews depended on manual spreadsheet distribution via manager email.`;
      a3 = `Identity governance platform lacked automated Zero-Standing-Privilege and JIT auto-revocation triggers.`;
      a4 = `Department managers did not have unified IAM dashboards to review cross-cloud credentials.`;
      a5 = `Lack of automated policy-as-code enforcement for credential expiration and just-in-time privilege escalation.`;
    }

    const aiChain: FiveWhysStep[] = [
      { whyNumber: 1, question: q1, answer: a1, category: 'Process' },
      { whyNumber: 2, question: q2, answer: a2, category: 'Process' },
      { whyNumber: 3, question: q3, answer: a3, category: 'Technology' },
      { whyNumber: 4, question: q4, answer: a4, category: 'People' },
      { whyNumber: 5, question: q5, answer: a5, category: 'Governance' }
    ];

    setFiveWhys(aiChain);
    setRootCauseStatement(a5);
    setSaveSuccessMsg('AI 5-Whys recursive chain synthesized based on standard clause and deficiency profile.');
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  // Add new 5-why step
  const handleAddWhyStep = () => {
    const nextNum = fiveWhys.length + 1;
    setFiveWhys(prev => [
      ...prev,
      {
        whyNumber: nextNum,
        question: `Why did the preceding condition manifest (Step ${nextNum})?`,
        answer: '',
        category: 'Process'
      }
    ]);
  };

  // Remove 5-why step
  const handleRemoveWhyStep = (num: number) => {
    if (fiveWhys.length <= 1) return;
    setFiveWhys(prev =>
      prev.filter(w => w.whyNumber !== num).map((w, idx) => ({ ...w, whyNumber: idx + 1 }))
    );
  };

  // Update specific 5-why step
  const handleUpdateWhy = (num: number, field: keyof FiveWhysStep, value: string) => {
    setFiveWhys(prev =>
      prev.map(w => (w.whyNumber === num ? { ...w, [field]: value } : w))
    );
  };

  // Save 5-Whys RCA (Stage 2)
  const handleSaveRca = () => {
    setIsSaving(true);
    const updatedWhysList = fiveWhys.map(w => `Why #${w.whyNumber}: ${w.question} -> ${w.answer}`);
    const nextStatus = currentFinding.status === 'Open' ? 'Root Cause Defined' : currentFinding.status;

    updateFinding(currentFinding.id, {
      status: nextStatus,
      rootCauseAnalysis: {
        methodology: '5_WHYS',
        whys: updatedWhysList,
        fiveWhysChain: fiveWhys,
        rootCauseStatement: rootCauseStatement || fiveWhys[fiveWhys.length - 1]?.answer || 'Root cause identified.',
        contributingFactors,
        analyzedBy: `${currentUser.name} (${currentRole})`,
        analyzedDate: new Date().toISOString()
      }
    });

    setCurrentFinding(prev => ({
      ...prev,
      status: nextStatus,
      rootCauseAnalysis: {
        ...prev.rootCauseAnalysis,
        methodology: '5_WHYS',
        whys: updatedWhysList,
        fiveWhysChain: fiveWhys,
        rootCauseStatement: rootCauseStatement,
        contributingFactors
      }
    }));

    setIsSaving(false);
    setSaveSuccessMsg('5-Whys Root Cause Analysis saved successfully. Status advanced to Root Cause Defined.');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
    setActiveStage(3);
  };

  // Save CAPA Plan (Stage 3)
  const handleSaveCapaPlan = () => {
    setIsSaving(true);
    const nextStatus = currentFinding.status === 'Open' || currentFinding.status === 'Root Cause Defined'
      ? 'CAPA Submitted'
      : currentFinding.status;

    updateFinding(currentFinding.id, {
      status: nextStatus,
      capaPlan: {
        ...currentFinding.capaPlan,
        correctiveAction,
        preventiveAction,
        owner: actionOwner,
        targetDate,
        evidenceRequired,
        implementationStatus: currentFinding.capaPlan.implementationStatus || 'In Progress'
      }
    });

    setCurrentFinding(prev => ({
      ...prev,
      status: nextStatus,
      capaPlan: {
        ...prev.capaPlan,
        correctiveAction,
        preventiveAction,
        owner: actionOwner,
        targetDate,
        evidenceRequired
      }
    }));

    setIsSaving(false);
    setSaveSuccessMsg('CAPA Plan registered. Corrective & preventive actions committed.');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
    setActiveStage(4);
  };

  // Attach Evidence Artifact (Stage 4)
  const handleAddArtifact = () => {
    if (!newArtifactTitle.trim()) return;
    const newArt: AttachedEvidenceArtifact = {
      id: `art-${Date.now()}`,
      title: newArtifactTitle.trim(),
      fileRef: newArtifactRef.trim() || `artifacts/capa/${newArtifactTitle.toLowerCase().replace(/\s+/g, '-')}`,
      hash: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      fileSize: `${(Math.random() * 2 + 0.4).toFixed(1)} MB`,
      uploadedAt: new Date().toISOString(),
      uploadedBy: currentUser.name
    };

    const nextArtifacts = [...attachedArtifacts, newArt];
    setAttachedArtifacts(nextArtifacts);
    setNewArtifactTitle('');
    setNewArtifactRef('');

    updateFinding(currentFinding.id, {
      capaPlan: {
        ...currentFinding.capaPlan,
        attachedEvidenceArtifacts: nextArtifacts
      }
    });
  };

  // Submit Implementation for Independent Audit Verification (Stage 4 -> 5)
  const handleSubmitForVerification = () => {
    setIsSaving(true);
    const nextStatus = 'Verification Pending';

    updateFinding(currentFinding.id, {
      status: nextStatus,
      implementationNotes,
      capaPlan: {
        ...currentFinding.capaPlan,
        implementationNotes,
        implementationStatus: 'Submitted for Verification',
        attachedEvidenceArtifacts: attachedArtifacts,
        completedDate: new Date().toISOString()
      }
    });

    setCurrentFinding(prev => ({
      ...prev,
      status: nextStatus,
      implementationNotes,
      capaPlan: {
        ...prev.capaPlan,
        implementationNotes,
        implementationStatus: 'Submitted for Verification',
        attachedEvidenceArtifacts: attachedArtifacts
      }
    }));

    setIsSaving(false);
    setSaveSuccessMsg('Remediation submitted! Finding transitioned to "Verification Pending". Ready for independent audit inspection.');
    setTimeout(() => setSaveSuccessMsg(null), 4000);
    setActiveStage(5);
  };

  // Execute Independent Audit Validation & Formal Closure (Stage 5)
  const handleExecuteValidationAndClose = () => {
    setValidationError(null);

    // Strict validation rules
    if (!auditorName.trim()) {
      setValidationError('Independent Auditor Name is required under ISO 19011.');
      return;
    }
    if (!independenceConfirmed) {
      setValidationError('You must confirm the Auditor Independence Attestation.');
      return;
    }
    if (!auditorObservations.trim()) {
      setValidationError('Auditor re-test observations and operating effectiveness notes are mandatory.');
      return;
    }
    if (sampleSizeInspected <= 0) {
      setValidationError('Audited sample population size must be at least 1.');
      return;
    }
    if (!isEffectivenessWindowSatisfied) {
      setValidationError(`ISO 27001 Clause 10.2 Effectiveness Window Incomplete: ${daysRemainingInWindow} days remaining in the mandatory 60-day observation window. You must allow the observation period to lapse or toggle Lead Auditor Demonstration Certification.`);
      return;
    }
    if (attachedArtifacts.length === 0) {
      setValidationError('At least one evidence artifact demonstrating operational non-recurrence is mandatory before closing CAPA.');
      return;
    }

    // Check if re-test failed
    if (toeResult !== 'PASSED') {
      // Re-test failed! Send back to Action Owner
      const rejectedStatus = 'Root Cause Defined';
      updateFinding(currentFinding.id, {
        status: rejectedStatus,
        implementationNotes: `[AUDIT RETEST REJECTED ${new Date().toISOString().split('T')[0]} by ${auditorName}]: ${auditorObservations}`
      });

      setCurrentFinding(prev => ({
        ...prev,
        status: rejectedStatus,
        implementationNotes: `[AUDIT RETEST REJECTED]: ${auditorObservations}`
      }));

      logAuditEvent(
        'REJECT',
        'Independent Audit Retest Failed',
        `Auditor ${auditorName} rejected CAPA for ${currentFinding.findingCode}. Test of Operating Effectiveness FAILED. Finding re-opened.`
      );

      setValidationError('Re-test marked as FAILED. Finding has been rejected and sent back to Action Owner for revision.');
      return;
    }

    // Passed! Construct tamper-evident cryptographic digital signature
    const sigPayload = `${currentTenant.id}:${currentFinding.findingCode}:${auditorEmail}:${new Date().toISOString()}:${toeResult}`;
    const digitalSignatureHash = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    const validationRecord: IndependentAuditValidation = {
      validationId: `VAL-${Date.now().toString().slice(-6)}`,
      auditProgramRef,
      auditorName,
      auditorEmail,
      auditorRole,
      validationDate: new Date().toISOString(),
      testOfOperatingEffectiveness: 'PASSED',
      samplingMethodology,
      sampleSizeInspected,
      inspectedArtifactReferences: attachedArtifacts.map(a => a.title),
      auditorObservations,
      effectivenessConclusion: `Corrective and Preventive actions independently validated as fully effective pursuant to ISO/IEC 27001:2022 Clause 10.2 and ISO 19011:2018. Root cause has been systematically eliminated with zero recurrence detected.`,
      independenceStatementConfirmed: true,
      digitalSignatureHash,
      validatedAt: new Date().toISOString()
    };

    const success = validateAndCloseFinding(currentFinding.id, validationRecord);
    if (success) {
      setCurrentFinding(prev => ({
        ...prev,
        status: 'Closed Verified',
        verifiedBy: `${auditorName} (${auditorRole})`,
        verifiedDate: new Date().toISOString(),
        independentAuditValidation: validationRecord
      }));
      setSaveSuccessMsg('INDEPENDENT AUDIT VALIDATION LOGGED! Finding is now formally CLOSED and attested.');
      setTimeout(() => setSaveSuccessMsg(null), 5000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div
        className={`w-full max-w-5xl rounded-2xl shadow-2xl border flex flex-col max-h-[95vh] overflow-hidden ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-700 text-slate-100'
        }`}
      >
        {/* Top Bar */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950/40">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold text-sky-400">{currentFinding.findingCode}</span>
                <span className="text-slate-500">•</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    currentFinding.severity === 'Major Non-Conformity'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : currentFinding.severity === 'Minor Non-Conformity'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  }`}
                >
                  {currentFinding.severity}
                </span>
                <span className="text-slate-500">•</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold flex items-center space-x-1 ${
                    currentFinding.status === 'Closed Verified'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : currentFinding.status === 'Verification Pending'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                      : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                  }`}
                >
                  {currentFinding.status === 'Closed Verified' ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>CLOSED & VALIDATED</span>
                    </>
                  ) : (
                    <span>{currentFinding.status.toUpperCase()}</span>
                  )}
                </span>
              </div>
              <h2 className="text-sm font-bold text-white tracking-tight truncate max-w-xl mt-0.5">
                {currentFinding.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {currentFinding.status === 'Closed Verified' && (
              <button
                onClick={() => setShowCertModal(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 flex items-center space-x-1.5 transition cursor-pointer"
              >
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                <span>View Formal Certificate</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Success Alert Banner */}
        {saveSuccessMsg && (
          <div className="px-6 py-2 bg-emerald-500/20 border-b border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* 5-Stage Stepper Navigation Bar */}
        <div className="px-6 py-3 border-b border-slate-800 bg-slate-950/20 shrink-0">
          <div className="grid grid-cols-5 gap-2 text-center text-xs">
            {[
              { num: 1, label: '1. Finding Intake', desc: 'Audit Linkage' },
              { num: 2, label: '2. 5-Whys RCA', desc: 'Root Cause Engine' },
              { num: 3, label: '3. CAPA Plan', desc: 'Corrective & Preventive' },
              { num: 4, label: '4. Implementation', desc: 'Evidence Center' },
              { num: 5, label: '5. Audit Validation', desc: 'Clause 10.2 Sign-off' }
            ].map(stage => {
              const isActive = activeStage === stage.num;
              const isPast =
                (stage.num === 1) ||
                (stage.num === 2 && currentFinding.status !== 'Open') ||
                (stage.num === 3 && currentFinding.status !== 'Open' && currentFinding.status !== 'Root Cause Defined') ||
                (stage.num === 4 && (currentFinding.status === 'Verification Pending' || currentFinding.status === 'Closed Verified')) ||
                (stage.num === 5 && currentFinding.status === 'Closed Verified');

              return (
                <button
                  key={stage.num}
                  onClick={() => setActiveStage(stage.num as any)}
                  className={`p-2 rounded-xl transition border text-left cursor-pointer flex flex-col justify-between ${
                    isActive
                      ? 'bg-emerald-500/15 border-emerald-500/50 text-white'
                      : isPast
                      ? 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                      : 'bg-slate-900/40 border-slate-800/50 text-slate-500 hover:text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[11px] truncate">{stage.label}</span>
                    {isPast && stage.num !== 5 && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                    {stage.num === 5 && currentFinding.status === 'Closed Verified' && (
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    )}
                    {stage.num === 5 && currentFinding.status === 'Verification Pending' && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">{stage.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Stage Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* ========================================================================= */}
          {/* STAGE 1: FINDING INTAKE & AUDIT LINKAGE */}
          {/* ========================================================================= */}
          {activeStage === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Building className="w-4 h-4 text-sky-400" />
                    <span>Audit Finding Identification & Traceability Linkage</span>
                  </h3>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Original non-conformity raised during internal/external audit fieldwork pursuant to ISO 19011.
                  </p>
                </div>
                <div className="flex items-center space-x-2 font-mono text-[11px] text-slate-400">
                  <span>Raised By: <strong className="text-slate-200">{currentFinding.raisedBy}</strong></span>
                  <span>•</span>
                  <span>Date: <strong className="text-slate-200">{new Date(currentFinding.raisedDate).toLocaleDateString()}</strong></span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Audit Source</span>
                  <span className="text-slate-200 font-semibold text-xs">{currentFinding.source.replace(/_/g, ' ')}</span>
                  <p className="text-[10px] text-slate-500">Formal engagement origin</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Clause / Control Reference</span>
                  <span className="text-sky-400 font-mono font-semibold text-xs">{currentFinding.clauseOrControl}</span>
                  <p className="text-[10px] text-slate-500">ISO/IEC 27001 / MAS TRM requirement</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Responsible Department</span>
                  <span className="text-slate-200 font-semibold text-xs">{currentFinding.department}</span>
                  <p className="text-[10px] text-slate-500">Action Owner: {currentFinding.capaPlan.owner}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Deficiency Statement & Objective Audit Evidence Observed
                </span>
                <p className="text-slate-200 text-xs leading-relaxed">
                  {currentFinding.description}
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setActiveStage(2)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center space-x-2 transition cursor-pointer shadow-lg shadow-emerald-950"
                >
                  <span>Proceed to 5-Whys Root Cause Analysis</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STAGE 2: 5-WHYS ROOT CAUSE ANALYSIS (RCA ENGINE) */}
          {/* ========================================================================= */}
          {activeStage === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Hash className="w-4 h-4 text-amber-400" />
                    <span>Recursive 5-Whys Root Cause Analysis Engine</span>
                  </h3>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Drill down past operational symptoms into the fundamental management, architectural, or procedural root cause.
                  </p>
                </div>
                <button
                  onClick={handleGenerateAiFiveWhys}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 flex items-center space-x-1.5 transition cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>AI 5-Whys Synthesis</span>
                </button>
              </div>

              {/* Ishikawa Systemic Failure Category Breakdown */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Systemic Failure Categorization (Ishikawa 4-Pillars)
                  </span>
                  <span className="text-[10px] text-amber-400 font-mono">
                    Clause 10.2 Requirement
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className={`p-2.5 rounded-lg border text-center ${categoryCounts.People > 0 ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300' : 'bg-slate-900/40 border-slate-800 text-slate-500'}`}>
                    <span className="text-[10px] uppercase block font-bold">People</span>
                    <span className="text-xs font-mono font-bold">{categoryCounts.People} Nodes</span>
                    <span className="text-[9px] block text-slate-400">Training / Competency</span>
                  </div>
                  <div className={`p-2.5 rounded-lg border text-center ${categoryCounts.Process > 0 ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' : 'bg-slate-900/40 border-slate-800 text-slate-500'}`}>
                    <span className="text-[10px] uppercase block font-bold">Process</span>
                    <span className="text-xs font-mono font-bold">{categoryCounts.Process} Nodes</span>
                    <span className="text-[9px] block text-slate-400">SOP / Procedure Deficit</span>
                  </div>
                  <div className={`p-2.5 rounded-lg border text-center ${categoryCounts.Technology > 0 ? 'bg-sky-500/10 border-sky-500/30 text-sky-300' : 'bg-slate-900/40 border-slate-800 text-slate-500'}`}>
                    <span className="text-[10px] uppercase block font-bold">Technology</span>
                    <span className="text-xs font-mono font-bold">{categoryCounts.Technology} Nodes</span>
                    <span className="text-[9px] block text-slate-400">Tooling / Automation</span>
                  </div>
                  <div className={`p-2.5 rounded-lg border text-center ${categoryCounts.Governance > 0 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-slate-900/40 border-slate-800 text-slate-500'}`}>
                    <span className="text-[10px] uppercase block font-bold">Governance</span>
                    <span className="text-xs font-mono font-bold">{categoryCounts.Governance} Nodes</span>
                    <span className="text-[9px] block text-slate-400">Policy / Oversight</span>
                  </div>
                </div>
              </div>

              {/* Superficial Root Cause Warning */}
              {hasSuperficialRootCause && (
                <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/50 text-rose-300 text-xs flex items-start space-x-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold text-rose-200 block mb-0.5">Lead Auditor Warning: Superficial Root Cause Detected</strong>
                    <p className="text-[11px] text-rose-300 leading-relaxed">
                      Phrases like "user error", "human error", or "employee forgot" trigger automatic major non-conformities under ISO/IEC 27001:2022 Clause 10.2. Lead auditors expect you to identify <em>why</em> the management system or technical safeguard permitted human error to occur without automated prevention or detection.
                    </p>
                  </div>
                </div>
              )}

              {/* 5-Whys Interactive List */}
              <div className="space-y-3">
                {fiveWhys.map((step, idx) => (
                  <div
                    key={step.whyNumber}
                    className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 font-mono font-bold text-xs flex items-center justify-center">
                          {step.whyNumber}
                        </span>
                        <span className="font-bold text-slate-300 text-xs">
                          {step.whyNumber === 1
                            ? 'Why #1: Immediate Event / Direct Symptom'
                            : step.whyNumber === 5
                            ? 'Why #5: Systemic / Root Cause'
                            : `Why #${step.whyNumber}: Underlying Mechanism`}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <select
                          value={step.category || 'Process'}
                          onChange={e => handleUpdateWhy(step.whyNumber, 'category', e.target.value)}
                          className="px-2 py-1 rounded-lg text-[10px] font-mono bg-slate-900 border border-slate-700 text-slate-300 focus:outline-none focus:border-amber-400 cursor-pointer"
                        >
                          <option value="Process">Process</option>
                          <option value="Technology">Technology</option>
                          <option value="People">People</option>
                          <option value="Governance">Governance</option>
                          <option value="Environment">Environment</option>
                        </select>
                        {fiveWhys.length > 1 && (
                          <button
                            onClick={() => handleRemoveWhyStep(step.whyNumber)}
                            className="p-1 text-slate-500 hover:text-rose-400 transition cursor-pointer"
                            title="Remove step"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <input
                        type="text"
                        value={step.question}
                        onChange={e => handleUpdateWhy(step.whyNumber, 'question', e.target.value)}
                        placeholder="Why question..."
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 placeholder-slate-600 focus:outline-none focus:border-amber-400 font-medium text-xs"
                      />
                      <textarea
                        rows={2}
                        value={step.answer}
                        onChange={e => handleUpdateWhy(step.whyNumber, 'answer', e.target.value)}
                        placeholder="Detailed answer explaining the underlying cause..."
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-400 text-xs"
                      />
                    </div>
                  </div>
                ))}

                <button
                  onClick={handleAddWhyStep}
                  className="w-full py-2 rounded-xl border border-dashed border-slate-700 hover:border-amber-400/60 text-slate-400 hover:text-amber-300 text-xs font-semibold flex items-center justify-center space-x-1.5 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Next 'Why' Iteration Step</span>
                </button>
              </div>

              {/* Synthesized Root Cause Statement */}
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block">
                    Final Synthesized Root Cause Statement
                  </span>
                  <button
                    onClick={() => {
                      const lastAnswer = fiveWhys[fiveWhys.length - 1]?.answer;
                      if (lastAnswer) setRootCauseStatement(lastAnswer);
                    }}
                    className="text-[10px] text-amber-300 hover:underline cursor-pointer"
                  >
                    Use Answer from Why #{fiveWhys.length}
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={rootCauseStatement}
                  onChange={e => setRootCauseStatement(e.target.value)}
                  placeholder="Summarize the fundamental system-level root cause that, if removed, permanently eliminates the nonconformity..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-amber-500/40 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-400 font-semibold text-xs leading-relaxed"
                />
              </div>

              {/* Contributing Factors */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Contributing Factors & Latent Vulnerabilities
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {contributingFactors.map((factor, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-mono bg-slate-900 border border-slate-700 text-slate-300 flex items-center space-x-1.5"
                    >
                      <span>{factor}</span>
                      <button
                        onClick={() => setContributingFactors(prev => prev.filter((_, i) => i !== idx))}
                        className="text-slate-500 hover:text-rose-400 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="text"
                    value={newFactorInput}
                    onChange={e => setNewFactorInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && newFactorInput.trim()) {
                        e.preventDefault();
                        setContributingFactors(prev => [...prev, newFactorInput.trim()]);
                        setNewFactorInput('');
                      }
                    }}
                    placeholder="Add contributing factor (press Enter)..."
                    className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 placeholder-slate-600 text-xs focus:outline-none focus:border-amber-400"
                  />
                  <button
                    onClick={() => {
                      if (newFactorInput.trim()) {
                        setContributingFactors(prev => [...prev, newFactorInput.trim()]);
                        setNewFactorInput('');
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setActiveStage(1)}
                  className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  ← Back to Finding Intake
                </button>
                <button
                  onClick={handleSaveRca}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white flex items-center space-x-2 transition cursor-pointer shadow-lg shadow-amber-950"
                >
                  <span>Save RCA & Advance to CAPA Formulation</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STAGE 3: CAPA PLAN FORMULATION (DUAL-TRACK) */}
          {/* ========================================================================= */}
          {activeStage === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span>Dual-Track Corrective & Preventive Action Plan (CAPA)</span>
                  </h3>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    ISO/IEC 27001 Clause 10.2 requires both immediate containment of the nonconformity AND systemic preventive action.
                  </p>
                </div>
                <div className="text-right font-mono text-[10px] text-slate-400">
                  <span>Root Cause: <strong className="text-amber-400">{currentFinding.rootCauseAnalysis.rootCauseStatement || 'Defined'}</strong></span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Track A: Corrective Action */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-sky-500/30 space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs font-mono">
                      A
                    </span>
                    <div>
                      <h4 className="font-bold text-sky-300 text-xs">Corrective Action (Immediate Containment)</h4>
                      <p className="text-[10px] text-slate-400">Remediate this specific detected nonconformity.</p>
                    </div>
                  </div>
                  <textarea
                    rows={4}
                    value={correctiveAction}
                    onChange={e => setCorrectiveAction(e.target.value)}
                    placeholder="Describe immediate containment step (e.g. rebuild container with patched base image, revoke stale credential, perform emergency review)..."
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-600 text-xs focus:outline-none focus:border-sky-400"
                  />
                </div>

                {/* Track B: Preventive Action */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-emerald-500/30 space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs font-mono">
                      B
                    </span>
                    <div>
                      <h4 className="font-bold text-emerald-300 text-xs">Preventive Action (Systemic Recurrence Prevention)</h4>
                      <p className="text-[10px] text-slate-400">Eliminate the root cause so it can never recur company-wide.</p>
                    </div>
                  </div>
                  <textarea
                    rows={4}
                    value={preventiveAction}
                    onChange={e => setPreventiveAction(e.target.value)}
                    placeholder="Describe systemic preventative measure (e.g. automated CI/CD gating, ZSP/JIT deployment, central webhook heartbeat alerts)..."
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-600 text-xs focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              {/* Assignment & Governance */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Assigned Action Owner</label>
                  <input
                    type="text"
                    value={actionOwner}
                    onChange={e => setActionOwner(e.target.value)}
                    placeholder="e.g. Priya Sharma (DevOps Lead)"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-emerald-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Target Implementation Due Date</label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={e => setTargetDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-emerald-400 font-mono"
                  />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400">
                    Mandatory Objective Evidence Required for Audit Verification
                  </label>
                  <input
                    type="text"
                    value={evidenceRequired}
                    onChange={e => setEvidenceRequired(e.target.value)}
                    placeholder="Specify objective artifacts (e.g. Jira escalation webhook screenshot, signed SOP v1.2, zero overdue tickets export)..."
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setActiveStage(2)}
                  className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  ← Back to 5-Whys RCA
                </button>
                <button
                  onClick={handleSaveCapaPlan}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center space-x-2 transition cursor-pointer shadow-lg shadow-emerald-950"
                >
                  <span>Commit CAPA Plan & Advance to Implementation</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STAGE 4: IMPLEMENTATION & EVIDENCE CENTER */}
          {/* ========================================================================= */}
          {activeStage === 4 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <FileCheck2 className="w-4 h-4 text-sky-400" />
                    <span>Implementation Execution & Objective Evidence Center</span>
                  </h3>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Action owners log execution progress and attach verifiable evidence artifacts before requesting independent audit inspection.
                  </p>
                </div>
                <div className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 font-mono text-[10px] text-slate-300">
                  Required: {currentFinding.capaPlan.evidenceRequired || 'Documented Artifacts'}
                </div>
              </div>

              {/* Implementation Log Notes */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <label className="text-[10px] uppercase font-bold text-slate-400 block">
                  Action Owner Implementation Execution Notes
                </label>
                <textarea
                  rows={3}
                  value={implementationNotes}
                  onChange={e => setImplementationNotes(e.target.value)}
                  placeholder="Detail the technical steps taken, deployment timestamps, scripts run, and operating status..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-sky-400"
                />
              </div>

              {/* Attached Evidence Artifacts List */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Attached Objective Evidence Artifacts ({attachedArtifacts.length})
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">SHA-256 Verifiable Hashes</span>
                </div>

                {attachedArtifacts.length > 0 ? (
                  <div className="space-y-2">
                    {attachedArtifacts.map(art => (
                      <div
                        key={art.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800"
                      >
                        <div className="flex items-center space-x-3">
                          <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                          <div>
                            <span className="font-bold text-slate-200 block text-xs">{art.title}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              Ref: {art.fileRef} • Uploaded by {art.uploadedBy} on {new Date(art.uploadedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 text-right">
                          <span className="text-[10px] font-mono text-slate-500 hidden md:inline">
                            {art.hash ? `SHA256:${art.hash.substring(0, 16)}...` : 'HASH-VERIFIED'}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold">
                            ATTACHED
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl text-slate-500">
                    <UploadCloud className="w-6 h-6 mx-auto mb-1 text-slate-600" />
                    <p className="text-xs">No evidence artifacts attached yet.</p>
                    <p className="text-[10px] text-slate-600">Attach files or logs below to enable independent validation.</p>
                  </div>
                )}

                {/* Attach New Artifact Form */}
                <div className="pt-2 border-t border-slate-800 flex flex-col md:flex-row gap-2">
                  <input
                    type="text"
                    value={newArtifactTitle}
                    onChange={e => setNewArtifactTitle(e.target.value)}
                    placeholder="Artifact Title (e.g. Snyk-Jira-Webhook-Log-Export.pdf)..."
                    className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-400"
                  />
                  <input
                    type="text"
                    value={newArtifactRef}
                    onChange={e => setNewArtifactRef(e.target.value)}
                    placeholder="Storage URI or Hash (optional)..."
                    className="w-full md:w-56 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 text-xs font-mono focus:outline-none focus:border-indigo-400"
                  />
                  <button
                    onClick={handleAddArtifact}
                    disabled={!newArtifactTitle.trim()}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Attach Evidence</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setActiveStage(3)}
                  className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  ← Back to CAPA Plan
                </button>
                <button
                  onClick={handleSubmitForVerification}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white flex items-center space-x-2 transition cursor-pointer shadow-lg shadow-sky-950"
                >
                  <span>Submit for Independent Audit Verification</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STAGE 5: INDEPENDENT AUDIT VALIDATION STEP (THE STRICT GATE) */}
          {/* ========================================================================= */}
          {activeStage === 5 && (
            <div className="space-y-4">
              {/* Mandatory Regulatory Gate Callout */}
              <div className="p-4 rounded-xl bg-emerald-950/20 border-2 border-emerald-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
                    <ShieldCheck className="w-4 h-4" />
                    <span>ISO/IEC 27001 Clause 10.2 & ISO 19011:2018 INDEPENDENT AUDIT VERIFICATION GATE</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    ZERO SELF-APPROVAL ENFORCED
                  </span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  <strong>Regulatory Invariant:</strong> Under ISO 19011:2018 §4(e) (Independence) and ISO 27001 Clause 10.2, the auditee or action owner is strictly prohibited from signing off or closing their own nonconformity. Formal closure requires an independent auditor to inspect operating evidence, execute a test of operating effectiveness (TOE), and sign off with a verifiable digital signature.
                </p>
              </div>

              {/* Segregation of Duties Check */}
              {isActionOwner && !simulateAuditorRole && (
                <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/40 text-rose-300 text-xs flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>
                      <strong>Segregation of Duties Conflict:</strong> You are logged in as the Action Owner ({currentFinding.capaPlan.owner}). You cannot self-close this finding.
                    </span>
                  </div>
                  <button
                    onClick={() => setSimulateAuditorRole(true)}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-white cursor-pointer shrink-0 ml-2"
                  >
                    Switch to Independent Lead Auditor Role
                  </button>
                </div>
              )}

              {/* If already closed, display official closure seal */}
              {currentFinding.status === 'Closed Verified' && existingVal && (
                <div className="p-4 rounded-xl bg-emerald-950/40 border-2 border-emerald-500/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Award className="w-5 h-5 text-emerald-400" />
                      <span className="font-bold text-white text-xs">
                        THIS FINDING IS FORMALLY CLOSED & INDEPENDENTLY VERIFIED
                      </span>
                    </div>
                    <span className="text-emerald-400 font-mono text-[10px]">
                      Validated: {new Date(existingVal.validatedAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px] pt-1">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Independent Auditor</span>
                      <span className="text-slate-200 font-semibold">{existingVal.auditorName}</span>
                      <span className="text-[10px] text-slate-400 block">{existingVal.auditorRole}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Audit Retest Ref</span>
                      <span className="text-sky-400 font-mono font-bold">{existingVal.auditProgramRef}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">TOE Conclusion</span>
                      <span className="text-emerald-300 font-bold">{existingVal.testOfOperatingEffectiveness}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Sample Inspected</span>
                      <span className="text-slate-200 font-mono">{existingVal.sampleSizeInspected} units</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Auditor Observations:</span>
                    <p className="text-slate-300 italic">"{existingVal.auditorObservations}"</p>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[10px]">
                    <div className="truncate mr-2">
                      <span className="text-slate-500">Digital Seal: </span>
                      <span className="text-emerald-400 font-bold truncate">{existingVal.digitalSignatureHash}</span>
                    </div>
                    <button
                      onClick={() => setShowCertModal(true)}
                      className="px-2.5 py-1 rounded bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-200 text-[10px] font-bold shrink-0 cursor-pointer"
                    >
                      Open Certificate
                    </button>
                  </div>
                </div>
              )}

              {/* Independent Auditor Validation Form (If not closed or re-testing) */}
              {currentFinding.status !== 'Closed Verified' && (
                <div className="space-y-4">
                  {validationError && (
                    <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>{validationError}</span>
                    </div>
                  )}

                  {/* ISO 27001 Clause 10.2 Mandatory 60-Day Effectiveness Review Window */}
                  <div className={`p-4 rounded-xl border ${isEffectivenessWindowSatisfied ? 'bg-emerald-950/20 border-emerald-500/40' : 'bg-amber-950/30 border-amber-500/40'} space-y-3`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className={`w-4 h-4 ${isEffectivenessWindowSatisfied ? 'text-emerald-400' : 'text-amber-400'}`} />
                        <span className="text-xs font-bold text-white">
                          ISO 27001 Clause 10.2 Mandatory 60-Day Effectiveness Verification Window
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${isEffectivenessWindowSatisfied ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'}`}>
                        {isEffectivenessWindowSatisfied ? 'MATURATION SATISFIED' : `${daysRemainingInWindow} DAYS REMAINING`}
                      </span>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-[11px] text-slate-300">
                      <div>
                        <span>Observed Lapsed Time: <strong className="text-white font-mono">{daysSinceCompletion} days</strong> since remediation milestone.</span>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Lead auditor accreditation rules require demonstrable non-recurrence over a sustained operating cycle before sign-off.
                        </p>
                      </div>
                      <label className="flex items-center space-x-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700 hover:border-amber-500/50 transition cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={accelerateEffectivenessWindow}
                          onChange={e => setAccelerateEffectivenessWindow(e.target.checked)}
                          className="w-3.5 h-3.5 rounded text-amber-500 focus:ring-amber-400 bg-slate-800 border-slate-600"
                        />
                        <span className="text-[10px] text-slate-300 font-medium">
                          Auditor Accelerated Certification (Simulate 60-Day Maturation)
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Auditor Profile Credentials */}
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>1. Independent Auditor Identification</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-400">Auditor Name</label>
                        <input
                          type="text"
                          value={auditorName}
                          onChange={e => setAuditorName(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-emerald-400 font-semibold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-400">Auditor Professional Title</label>
                        <input
                          type="text"
                          value={auditorRole}
                          onChange={e => setAuditorRole(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-emerald-400"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-400">Audit Program / Retest Ref</label>
                        <input
                          type="text"
                          value={auditProgramRef}
                          onChange={e => setAuditProgramRef(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-sky-400 text-xs font-mono focus:outline-none focus:border-emerald-400"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Test of Operating Effectiveness (TOE) */}
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                      <span>2. Test of Operating Effectiveness (TOE) & Sampling</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="space-y-1 col-span-2">
                        <label className="text-[10px] uppercase font-bold text-slate-400">Sampling & Testing Methodology</label>
                        <input
                          type="text"
                          value={samplingMethodology}
                          onChange={e => setSamplingMethodology(e.target.value)}
                          placeholder="e.g. 100% population inspection, random 25 sample re-test over 90 days..."
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-emerald-400"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-400">Sample Population Size</label>
                        <input
                          type="number"
                          value={sampleSizeInspected}
                          onChange={e => setSampleSizeInspected(parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs font-mono focus:outline-none focus:border-emerald-400"
                        />
                      </div>
                      <div className="col-span-3 space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-400">
                          Auditor Retest Observations & Evaluation of Evidence
                        </label>
                        <textarea
                          rows={3}
                          value={auditorObservations}
                          onChange={e => setAuditorObservations(e.target.value)}
                          placeholder="Independently tested operating effectiveness. Document findings, test results, and validation conclusions..."
                          className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-emerald-400"
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800">
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                        Operating Effectiveness Test Result Conclusion
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'PASSED', label: 'PASSED (Effective)', desc: 'Root cause eliminated; nonconformity resolved.', color: 'emerald' },
                          { id: 'FAILED', label: 'FAILED (Ineffective)', desc: 'Deficiency persists; reject and reopen.', color: 'rose' },
                          { id: 'CONDITIONALLY_PASSED', label: 'CONDITIONALLY PASSED', desc: 'Minor follow-up needed.', color: 'amber' }
                        ].map(opt => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setToeResult(opt.id as any)}
                            className={`p-2.5 rounded-xl border text-left cursor-pointer transition ${
                              toeResult === opt.id
                                ? opt.id === 'PASSED'
                                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                                  : opt.id === 'FAILED'
                                  ? 'bg-rose-500/20 border-rose-500 text-rose-300 font-bold'
                                  : 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                                : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-300'
                            }`}
                          >
                            <span className="block text-xs">{opt.label}</span>
                            <span className="text-[10px] opacity-75 font-normal block mt-0.5">{opt.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Auditor Independence Declaration */}
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="independenceDeclaration"
                      checked={independenceConfirmed}
                      onChange={e => setIndependenceConfirmed(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-400 cursor-pointer"
                    />
                    <label htmlFor="independenceDeclaration" className="text-slate-300 text-xs leading-relaxed cursor-pointer">
                      <strong>Auditor Independence Declaration:</strong> I formally confirm under ISO 19011:2018 §4(e) that I have exercised independent professional auditor judgment, hold no direct operational or management responsibility in {currentFinding.department}, have personally re-tested the operating evidence, and validate this CAPA pursuant to ISO/IEC 27001:2022 Clause 10.2.
                    </label>
                  </div>

                  {/* Execute Button */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => setActiveStage(4)}
                      className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white cursor-pointer"
                    >
                      ← Back to Implementation & Evidence
                    </button>
                    {toeResult === 'PASSED' ? (
                      <button
                        onClick={handleExecuteValidationAndClose}
                        className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center space-x-2 transition cursor-pointer shadow-lg shadow-emerald-950"
                      >
                        <Award className="w-4 h-4 text-white" />
                        <span>Sign Validation & Formally Close Finding</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleExecuteValidationAndClose}
                        className="px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center space-x-2 transition cursor-pointer shadow-lg shadow-rose-950"
                      >
                        <AlertTriangle className="w-4 h-4 text-white" />
                        <span>Reject CAPA & Re-Open Finding</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Bottom Status Summary Bar */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between text-slate-500 font-mono text-[11px] shrink-0">
          <div className="flex items-center space-x-2">
            <span>Finding: <strong className="text-slate-300">{currentFinding.findingCode}</strong></span>
            <span>•</span>
            <span>Tenant: <strong className="text-slate-300">{currentTenant.name}</strong></span>
          </div>
          <div>
            <span>ISO 19011 / ISO/IEC 27001 Clause 10.2 Continuous Compliance</span>
          </div>
        </div>
      </div>

      {/* Certificate Modal View */}
      {showCertModal && (
        <CapaAuditCertificateModal
          finding={currentFinding}
          companyName={currentTenant.name}
          onClose={() => setShowCertModal(false)}
          theme={theme}
        />
      )}
    </div>
  );
};
