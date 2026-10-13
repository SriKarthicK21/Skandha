import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  XCircle,
  AlertTriangle,
  AlertOctagon,
  AlertCircle,
  CheckCircle2,
  FileText,
  Info,
  Layers,
  Sparkles,
  Building,
  UserCheck,
  Calendar,
  Lock,
  ArrowRight,
  HelpCircle,
  Clock,
  Shield,
  Tag
} from 'lucide-react';
import { ControlItem, RiskRecord } from '../../types';
import {
  ISO27001_2022_93_MASTER,
  ISO27001Control2022Meta,
  ExclusionCategory
} from '../../data/iso27001_2022_masterControls';

interface SoAJustificationWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  control: ControlItem | null;
  activeRisks: RiskRecord[];
  onSave: (updated: Partial<ControlItem>) => void;
}

export const SoAJustificationWorkflowModal: React.FC<SoAJustificationWorkflowModalProps> = ({
  isOpen,
  onClose,
  control,
  activeRisks,
  onSave
}) => {
  if (!isOpen || !control) return null;

  // Find authoritative ISO 27001:2022 metadata
  const meta: ISO27001Control2022Meta | undefined = ISO27001_2022_93_MASTER.find(
    m => m.controlCode === control.controlCode
  );

  const [applicable, setApplicable] = useState<boolean>(control.applicable);
  const [justification, setJustification] = useState<string>(control.justification || '');
  const [implementationStatus, setImplementationStatus] = useState<ControlItem['implementationStatus']>(
    control.implementationStatus || 'Implemented'
  );
  const [responsibleDepartment, setResponsibleDepartment] = useState<string>(
    control.responsibleDepartment || meta?.responsibleDepartment || 'Information Security'
  );
  const [remediationOwner, setRemediationOwner] = useState<string>(
    control.remediationOwner || 'CISO / Lead Security Engineer'
  );
  const [targetDate, setTargetDate] = useState<string>(
    control.targetDate || new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [selectedRiskCodes, setSelectedRiskCodes] = useState<string[]>(
    control.mappedRiskCodes || []
  );

  // Workflow Specific Rationale Categories
  const [inclusionCategory, setInclusionCategory] = useState<string>('RISK_TREATMENT');
  const [exclusionCategory, setExclusionCategory] = useState<ExclusionCategory>('NO_PHYSICAL_DATACENTER');
  const [implementationMechanism, setImplementationMechanism] = useState<string>('TECHNICAL_AUTOMATION');
  const [compensatingControls, setCompensatingControls] = useState<string>('');

  // Structured Clause 6.1.3(d) Exclusion Rigor Fields
  const [scopeBoundaryCitation, setScopeBoundaryCitation] = useState<string>('');
  const [riskAssessmentCitation, setRiskAssessmentCitation] = useState<string>('');
  const [compensatingControlRef, setCompensatingControlRef] = useState<string>('');
  const [attemptedSubmit, setAttemptedSubmit] = useState<boolean>(false);

  // Synchronize state when control changes
  useEffect(() => {
    if (control) {
      setApplicable(control.applicable);
      setImplementationStatus(control.implementationStatus);
      setResponsibleDepartment(control.responsibleDepartment || meta?.responsibleDepartment || 'Information Security');
      setRemediationOwner(control.remediationOwner || 'CISO / Lead Security Engineer');
      setTargetDate(control.targetDate || new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
      setSelectedRiskCodes(control.mappedRiskCodes || []);
      setAttemptedSubmit(false);

      // Parse existing 3-part citations if present in control or structured justification
      const scopeMatch = control.justification?.match(/\[(?:Cl\.\s*4\.3\s*Scope|Scope(?:\s*Boundary)?):\s*([^\]]+)\]/i);
      const riskMatch = control.justification?.match(/\[(?:Cl\.\s*6\.1\.2\s*Risk|Risk(?:\s*Ref|\s*Assessment)?):\s*([^\]]+)\]/i);
      const compMatch = control.justification?.match(/\[(?:Compensating(?:\s*Control)?):\s*([^\]]+)\]/i);

      const parsedScope = control.scopeBoundaryCitation || (scopeMatch ? scopeMatch[1].trim() : '');
      const parsedRisk = control.riskAssessmentCitation || (riskMatch ? riskMatch[1].trim() : '');
      const parsedComp = control.compensatingControlRef || (compMatch ? compMatch[1].trim() : '');

      let cleanNarrative = control.justification || '';
      if (scopeMatch || riskMatch || compMatch) {
        cleanNarrative = cleanNarrative
          .replace(/\[(?:Cl\.\s*4\.3\s*Scope|Scope(?:\s*Boundary)?):\s*[^\]]+\]/gi, '')
          .replace(/\[(?:Cl\.\s*6\.1\.2\s*Risk|Risk(?:\s*Ref|\s*Assessment)?):\s*[^\]]+\]/gi, '')
          .replace(/\[(?:Compensating(?:\s*Control)?):\s*[^\]]+\]/gi, '')
          .replace(/^\s*[-—–]+\s*/, '')
          .trim();
      }

      setJustification(cleanNarrative);
      setScopeBoundaryCitation(parsedScope);
      setRiskAssessmentCitation(parsedRisk);
      setCompensatingControlRef(parsedComp);

      // If control is excluded and fields are empty, pre-populate intelligent category presets
      if (!control.applicable) {
        if (control.justification?.toLowerCase().includes('cloud') || control.justification?.toLowerCase().includes('aws')) {
          setExclusionCategory('CLOUD_OUTSOURCED');
          if (!parsedScope) setScopeBoundaryCitation('ISMS-SCOPE-2026 §4.1 (Shared Responsibility Model for Cloud Infrastructure)');
          if (!parsedRisk) setRiskAssessmentCitation('RA-2026-VND-04 (Evaluated under Supplier Security A.5.19)');
          if (!parsedComp) setCompensatingControlRef('AWS / GCP SOC 2 Type II Attestation & ISO 27001 BSI Cert');
        } else if (control.justification?.toLowerCase().includes('software') || control.justification?.toLowerCase().includes('development')) {
          setExclusionCategory('NO_CUSTOM_SOFTWARE');
          if (!parsedScope) setScopeBoundaryCitation('ISMS-SCOPE-2026 §2.4 (Commercial COTS/SaaS Only - No Bespoke Code)');
          if (!parsedRisk) setRiskAssessmentCitation('RA-2026-SDLC-02 (Application Development Threat Profile: Zero In-House Code)');
          if (!parsedComp) setCompensatingControlRef('Vendor SOC 2 Type II Reports & Strict Configuration Hardening');
        } else if (control.justification?.toLowerCase().includes('datacenter') || control.justification?.toLowerCase().includes('data center') || control.justification?.toLowerCase().includes('physical')) {
          setExclusionCategory('NO_PHYSICAL_DATACENTER');
          if (!parsedScope) setScopeBoundaryCitation('ISMS-SCOPE-2026 §3.2 (Virtual Cloud Perimeter / No On-Premises Data Center)');
          if (!parsedRisk) setRiskAssessmentCitation('RA-2026-PHYS-01 (Inherent Risk: 0 - Physical access threat eliminated)');
          if (!parsedComp) setCompensatingControlRef('AWS SOC 2 Type II Report (CC6.4 / ISO 27001 BSI Cert BSI-IS-712891)');
        }
      }
    }
  }, [control, meta]);

  const getRiskSeverity = (r: RiskRecord): 'Critical' | 'High' | 'Medium' | 'Low' => {
    if (r.inherentScore >= 15) return 'Critical';
    if (r.inherentScore >= 10) return 'High';
    if (r.inherentScore >= 5) return 'Medium';
    return 'Low';
  };

  // Check if any active risk contradicts excluding this control
  const contradictingRisks = activeRisks.filter(
    r => (r.mitigationControl === control.controlCode || control.mappedRiskCodes?.includes(r.riskCode)) &&
         (r.inherentScore >= 10)
  );

  // Mandatory 3-Part Rigor Validation
  const isScopePopulated = scopeBoundaryCitation.trim().length > 0;
  const isRiskPopulated = riskAssessmentCitation.trim().length > 0;
  const isCompensatingPopulated = compensatingControlRef.trim().length > 0;
  const is3PartComplete = isScopePopulated && isRiskPopulated && isCompensatingPopulated;
  const isNarrativePopulated = justification.trim().length > 0;
  const hasNoContradictingRisks = contradictingRisks.length === 0;

  // Strict Form Validation Flag: If excluded, ALL 3 sections must be populated!
  const isFormValid = applicable
    ? isNarrativePopulated
    : (is3PartComplete && isNarrativePopulated);

  const exclusionChecks = useMemo(() => [
    { id: 'scope', label: '1. Cl. 4.3 Scope Boundary / Legal Exemption Citation', passed: isScopePopulated, hint: 'e.g., ISMS-SCOPE-2026 §3.2' },
    { id: 'risk', label: '2. Cl. 6.1.2 Risk Assessment Reference (Residual Risk)', passed: isRiskPopulated, hint: 'e.g., RA-2026-PHYS-01 (Residual: 0)' },
    { id: 'comp', label: '3. Cl. 6.1.3 Compensating Control / CSP Attestation Link', passed: isCompensatingPopulated, hint: 'e.g., AWS SOC 2 Type II BSI-IS-712891' },
    { id: 'narrative', label: '4. Substantive Operational Narrative', passed: isNarrativePopulated, hint: 'Detailed rationale for certification body' },
    { id: 'activeRisk', label: '5. Zero Contradictory High Inherent Risks', passed: hasNoContradictingRisks, hint: 'Unmap conflicting risks first' }
  ], [isScopePopulated, isRiskPopulated, isCompensatingPopulated, isNarrativePopulated, hasNoContradictingRisks]);

  const exclusionRigorScore = useMemo(() => {
    const passed = exclusionChecks.filter(c => c.passed).length;
    return Math.round((passed / exclusionChecks.length) * 100);
  }, [exclusionChecks]);

  const handleExclusionCategoryChange = (cat: ExclusionCategory) => {
    setExclusionCategory(cat);
    switch (cat) {
      case 'CLOUD_OUTSOURCED':
        setScopeBoundaryCitation('ISMS-SCOPE-2026 §4.1 (Shared Responsibility Model for Cloud Infrastructure)');
        setRiskAssessmentCitation('RA-2026-VND-04 (Evaluated under Supplier Security A.5.19)');
        setCompensatingControlRef('AWS / GCP SOC 2 Type II Attestation & ISO 27001 BSI Cert');
        break;
      case 'NO_CUSTOM_SOFTWARE':
        setScopeBoundaryCitation('ISMS-SCOPE-2026 §2.4 (Commercial COTS/SaaS Only - No Bespoke Code)');
        setRiskAssessmentCitation('RA-2026-SDLC-02 (Application Development Threat Profile: Zero In-House Code)');
        setCompensatingControlRef('Vendor SOC 2 Type II Reports & Strict Configuration Hardening');
        break;
      case 'NO_PHYSICAL_DATACENTER':
        setScopeBoundaryCitation('ISMS-SCOPE-2026 §3.2 (Virtual Cloud Perimeter / No On-Premises Data Center)');
        setRiskAssessmentCitation('RA-2026-PHYS-01 (Inherent Risk: 0 - Physical access threat eliminated)');
        setCompensatingControlRef('AWS SOC 2 Type II Report (CC6.4 / ISO 27001 BSI Cert BSI-IS-712891)');
        break;
      case 'NO_REMOVABLE_MEDIA':
        setScopeBoundaryCitation('ISMS-SCOPE-2026 §2.1 (Endpoint Fleet Hardening Policy)');
        setRiskAssessmentCitation('RA-2026-ENDP-03 (Data Exfiltration via Physical USB: Negligible)');
        setCompensatingControlRef('MDM Enforced USB Port Blocking & DLP Alerting');
        break;
      default:
        setScopeBoundaryCitation('ISMS-SCOPE-2026 §1.3 (Organizational Boundary Specification)');
        setRiskAssessmentCitation('RA-2026-GEN-01 (Residual Risk Level: Acceptable)');
        setCompensatingControlRef('Alternative Organizational Baseline Safeguards');
    }
  };

  // Suggested Standard Justification Templates
  const handleApplySuggestedJustification = () => {
    if (applicable) {
      if (meta?.guidance) {
        setJustification(
          `Mandatory ISMS control required by ISO/IEC 27001:2022 Annex ${meta.controlCode} (${meta.title}). Implemented through ${responsibleDepartment} operational procedures and automated technical safeguards to satisfy risk treatment requirements.`
        );
      } else {
        setJustification(
          `Mandatory ISMS control required by ISO/IEC 27001:2022 Annex ${control.controlCode}. Implemented across organizational infrastructure to ensure information security confidentiality, integrity, and availability.`
        );
      }
    } else {
      if (meta?.suggestedExclusionReason) {
        setJustification(meta.suggestedExclusionReason);
      } else {
        switch (exclusionCategory) {
          case 'CLOUD_OUTSOURCED':
            setJustification(
              'The organization operates 100% on certified multi-tenant cloud infrastructure (AWS/GCP). Physical, environmental, and hypervisor-level controls are fully managed and attested by the Cloud Service Provider under independent SOC 2 Type II and ISO/IEC 27001 certifications.'
            );
            break;
          case 'NO_CUSTOM_SOFTWARE':
            setJustification(
              'The organization does not develop, compile, or maintain bespoke in-house software code. All business applications are commercial-off-the-shelf (COTS) SaaS solutions evaluated under supplier security due diligence procedures.'
            );
            break;
          case 'NO_PHYSICAL_DATACENTER':
            setJustification(
              'The organization maintains a virtualized, remote-first operational posture without on-premises data center facilities, server rooms, or physical IT closets. Physical site security is limited to commercial co-working access.'
            );
            break;
          case 'NO_REMOVABLE_MEDIA':
            setJustification(
              'Use of USB mass storage and removable media is strictly prohibited by corporate policy and technically enforced across all managed workstations via endpoint mobile device management (MDM) hardware port blocking.'
            );
            break;
          default:
            setJustification(
              `Control ${control.controlCode} is deemed not applicable based on organizational risk assessment scope boundaries. Evaluated under Clause 6.1.2 risk analysis with formal CISO risk acceptance.`
            );
        }
      }
    }
  };

  const handleToggleRisk = (riskCode: string) => {
    setSelectedRiskCodes(prev =>
      prev.includes(riskCode) ? prev.filter(c => c !== riskCode) : [...prev, riskCode]
    );
  };

  const handleSave = () => {
    if (!isFormValid) {
      setAttemptedSubmit(true);
      return;
    }
    let finalJustification = justification.trim();
    if (!applicable) {
      finalJustification = `[Cl. 4.3 Scope: ${scopeBoundaryCitation.trim()}] [Cl. 6.1.2 Risk: ${riskAssessmentCitation.trim()}] [Compensating: ${compensatingControlRef.trim()}] — ${justification.trim()}`;
    }
    onSave({
      applicable,
      justification: finalJustification,
      scopeBoundaryCitation: !applicable ? scopeBoundaryCitation.trim() : undefined,
      riskAssessmentCitation: !applicable ? riskAssessmentCitation.trim() : undefined,
      compensatingControlRef: !applicable ? compensatingControlRef.trim() : undefined,
      implementationStatus,
      responsibleDepartment,
      remediationOwner,
      targetDate: implementationStatus !== 'Implemented' && implementationStatus !== 'Audited' ? targetDate : undefined,
      mappedRiskCodes: selectedRiskCodes
    });
    onClose();
  };

  const departmentsList = [
    'Information Security',
    'DevOps / IT Infrastructure',
    'Application Engineering',
    'Human Resources',
    'Legal & Regulatory Compliance',
    'Facilities & Physical Security',
    'Procurement & Vendor Management',
    'Internal Audit & Governance'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl my-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border-b border-slate-800 flex items-start justify-between gap-4 shrink-0">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm font-black text-indigo-400 bg-indigo-950/80 border border-indigo-800/80 px-2 py-0.5 rounded">
                {control.controlCode}
              </span>
              <span className="text-[11px] font-bold text-slate-300 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                {control.category}
              </span>
              {meta?.isNewIn2022 && (
                <span className="text-[10px] font-bold text-purple-300 px-2 py-0.5 rounded bg-purple-950/80 border border-purple-800 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  NEW ISO 27001:2022 Control
                </span>
              )}
              {meta?.iso2013Mapping && (
                <span className="text-[10px] text-slate-400 bg-slate-800/60 px-1.5 py-0.5 rounded" title="Crosswalk from ISO 27001:2013">
                  Prev: {meta.iso2013Mapping}
                </span>
              )}
            </div>
            <h2 className="text-base font-bold text-white mt-1.5">{control.title}</h2>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">{control.description}</p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition shrink-0"
            title="Close dialog"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 space-y-5 overflow-y-auto text-xs text-slate-300 flex-1">
          {/* ISO 27002 Attribute Tags Bar */}
          {meta && (
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px]">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Tag className="w-3.5 h-3.5 text-indigo-400" />
                <span className="font-semibold text-slate-300">Type:</span>
                <span className="text-white">{meta.controlType}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                <span className="font-semibold text-slate-300">Cyber Concept:</span>
                <span className="text-white">{meta.cybersecurityConcept}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span className="font-semibold text-slate-300">Capability:</span>
                <span className="text-white">{meta.operationalCapability}</span>
              </div>
            </div>
          )}

          {/* STEP 1: FORMAL APPLICABILITY DECISION */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-white uppercase tracking-wider">
              1. Applicability Decision (ISO Clause 6.1.3 d)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setApplicable(true)}
                className={`p-3.5 rounded-xl border text-left transition flex items-start space-x-3 ${
                  applicable
                    ? 'bg-emerald-950/50 border-emerald-500/80 shadow-md shadow-emerald-950/40 text-emerald-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-850'
                }`}
              >
                <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${applicable ? 'text-emerald-400' : 'text-slate-500'}`} />
                <div>
                  <div className="font-bold text-sm text-white">Applicable (In-Scope)</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Required control implemented to safeguard assets or treat assessed risk.
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setApplicable(false)}
                className={`p-3.5 rounded-xl border text-left transition flex items-start space-x-3 ${
                  !applicable
                    ? 'bg-amber-950/50 border-amber-500/80 shadow-md shadow-amber-950/40 text-amber-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-850'
                }`}
              >
                <XCircle className={`w-4 h-4 mt-0.5 shrink-0 ${!applicable ? 'text-amber-400' : 'text-slate-500'}`} />
                <div>
                  <div className="font-bold text-sm text-white">Excluded (Out-of-Scope)</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Not applicable. Requires legally defensible justification for auditor review.
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* STEP 2: JUSTIFICATION WORKFLOW & DETAILS */}
          {applicable ? (
            /* APPLICABLE WORKFLOW */
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Primary Inclusion Rationale Category
                </label>
                <select
                  value={inclusionCategory}
                  onChange={e => setInclusionCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="RISK_TREATMENT">Risk Assessment & Treatment Plan (Treating identified risks)</option>
                  <option value="LEGAL_REGULATORY">Statutory / Legal / Regulatory Compliance Requirement</option>
                  <option value="CONTRACTUAL">Contractual / Customer Master Service Agreement (MSA) Obligation</option>
                  <option value="SECURITY_BASELINE">Organizational Security Policy & Good Practice Baseline</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Primary Implementation Mechanism
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'TECHNICAL_AUTOMATION', label: 'Technical Safeguard' },
                    { id: 'POLICY_PROCEDURE', label: 'Policy & SOP' },
                    { id: 'OPERATIONAL_WORKFLOW', label: 'Operational Review' },
                    { id: 'PHYSICAL_PERIMETER', label: 'Physical Security' },
                    { id: 'THIRD_PARTY_SLA', label: 'Third-Party SLA' }
                  ].map(mech => (
                    <button
                      key={mech.id}
                      type="button"
                      onClick={() => setImplementationMechanism(mech.id)}
                      className={`px-2.5 py-1.5 rounded-lg border text-left text-[11px] font-semibold transition ${
                        implementationMechanism === mech.id
                          ? 'bg-indigo-950 border-indigo-600 text-indigo-200'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {mech.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Formal Inclusion Justification Statement <span className="text-red-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleApplySuggestedJustification}
                    className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Auto-fill Standard Rationale</span>
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={justification}
                  onChange={e => setJustification(e.target.value)}
                  placeholder="Explain why this control is applicable and how it supports risk treatment or contractual requirements..."
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Implementation Status & Ownership */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Implementation Status</label>
                  <select
                    value={implementationStatus}
                    onChange={e => setImplementationStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Implemented">Implemented (Operational)</option>
                    <option value="In Progress">Partially Implemented (In Progress)</option>
                    <option value="Not Started">Planned (Not Started / Roadmapped)</option>
                    <option value="Monitored">Monitored (Continuous Telemetry)</option>
                    <option value="Audited">Audited (Verified by Auditor)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Responsible Department</label>
                  <select
                    value={responsibleDepartment}
                    onChange={e => setResponsibleDepartment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                  >
                    {departmentsList.map(dept => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Control Owner</label>
                  <input
                    type="text"
                    value={remediationOwner}
                    onChange={e => setRemediationOwner(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {implementationStatus !== 'Implemented' && implementationStatus !== 'Audited' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Target Remediation Date</label>
                    <input
                      type="date"
                      value={targetDate}
                      onChange={e => setTargetDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* EXCLUDED WORKFLOW */
            <div className="p-4 rounded-xl bg-slate-950/70 border border-amber-900/50 space-y-4">
              <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong>Mandatory ISO 27001 Clause 6.1.3 d Requirement:</strong>
                  <p className="mt-0.5 text-[11px] text-amber-200/90">
                    External certification auditors require rigorous, documented proof that excluded controls are genuinely outside the organization's ISMS boundary or that risks are treated via alternative safeguards.
                  </p>
                </div>
              </div>

              {contradictingRisks.length > 0 && (
                <div className="p-3 rounded-lg bg-red-950/60 border border-red-800 text-red-200 text-xs space-y-1">
                  <div className="font-bold flex items-center space-x-1.5 text-red-300">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span>Auditor Conflict Detected! Active Risks depend on this control:</span>
                  </div>
                  <ul className="list-disc list-inside text-[11px] text-red-200/90">
                    {contradictingRisks.map(r => (
                      <li key={r.id}>
                        <span className="font-mono font-bold text-white">{r.riskCode}</span>: {r.title} ({getRiskSeverity(r)} Severity)
                      </li>
                    ))}
                  </ul>
                  <p className="text-[10px] text-red-300 italic pt-1">
                    Excluding this control without reassigning these risks will generate an ISO non-conformity during Stage 2 audit.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Formal Exclusion Category
                </label>
                <select
                  value={exclusionCategory}
                  onChange={e => handleExclusionCategoryChange(e.target.value as ExclusionCategory)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
                >
                  <option value="NO_PHYSICAL_DATACENTER">No Physical Data Center (100% remote / cloud-hosted)</option>
                  <option value="NO_CUSTOM_SOFTWARE">No Custom Software Development (COTS / SaaS only)</option>
                  <option value="CLOUD_OUTSOURCED">Cloud-Outsourced (Fully covered by AWS/GCP SOC 2 / ISO 27001)</option>
                  <option value="NO_REMOVABLE_MEDIA">No Removable Media Permitted (Enforced by MDM policy)</option>
                  <option value="COVERED_BY_PARENT_ENTITY">Covered by Parent Entity ISMS (Group governance)</option>
                  <option value="CONTRACTUALLY_EXEMPT">Contractually or Legally Exempt from Scope</option>
                  <option value="REGULATORY_ALTERNATIVE">Compensating Alternative Safeguards Applied</option>
                </select>
              </div>

              {/* MANDATORY 3-PART CLAUSE 6.1.3(d) EXCLUSION RIGOR ENGINE */}
              <div className="p-4 rounded-xl bg-slate-950 border border-amber-900/50 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-md bg-amber-500/20 text-amber-400">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-amber-300">
                        Mandatory 3-Part Exclusion Defense (ISO/IEC 27001:2022 Cl. 6.1.3.d)
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Lead auditor defense: Scope Citation, Risk Reference, & Compensating Safeguard
                      </div>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border ${
                      is3PartComplete
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80'
                        : 'bg-amber-950/80 text-amber-300 border-amber-700/80'
                    }`}
                  >
                    {is3PartComplete ? '✓ 3 of 3 Sections Populated' : `${[isScopePopulated, isRiskPopulated, isCompensatingPopulated].filter(Boolean).length}/3 Populated`}
                  </span>
                </div>

                {/* Validation Block Alert if user attempts submit with missing fields */}
                {attemptedSubmit && !is3PartComplete && (
                  <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-600/80 text-rose-200 text-xs space-y-1.5 animate-fadeIn">
                    <div className="flex items-center gap-1.5 font-bold text-rose-300">
                      <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>Exclusion Blocked: All 3 Mandatory Sections Must Be Populated</span>
                    </div>
                    <p className="text-[11px] text-rose-200/90 leading-relaxed">
                      ISO 27001 Clause 6.1.3(d) mandates that no Annex A control can be excluded without a documented scope boundary citation, risk assessment reference, and compensating control link.
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1 text-[10px] font-mono">
                      {!isScopePopulated && (
                        <span className="px-2 py-0.5 rounded bg-rose-900/60 border border-rose-500/50 text-rose-200">
                          Missing: 1. Scope Boundary (Cl. 4.3)
                        </span>
                      )}
                      {!isRiskPopulated && (
                        <span className="px-2 py-0.5 rounded bg-rose-900/60 border border-rose-500/50 text-rose-200">
                          Missing: 2. Risk Reference (Cl. 6.1.2)
                        </span>
                      )}
                      {!isCompensatingPopulated && (
                        <span className="px-2 py-0.5 rounded bg-rose-900/60 border border-rose-500/50 text-rose-200">
                          Missing: 3. Compensating Control Link
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Part 1: Scope Boundary Citation */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-semibold text-slate-300">
                      1. Scope Boundary Citation (Clause 4.3 Linkage) <span className="text-red-400">*</span>
                    </label>
                    <span className="text-[10px] font-mono text-slate-400">
                      {isScopePopulated ? <span className="text-emerald-400 font-bold">✓ Populated</span> : <span className="text-amber-400">Required</span>}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={scopeBoundaryCitation}
                    onChange={e => {
                      setScopeBoundaryCitation(e.target.value);
                      if (attemptedSubmit && e.target.value.trim()) {
                        // clear field error on typing
                      }
                    }}
                    placeholder="e.g., ISMS-SCOPE-2026 §3.2 (Zero On-Premises Server Footprint / 100% Cloud Virtual)"
                    className={`w-full px-3 py-2 rounded-lg text-white text-xs font-mono transition focus:outline-none ${
                      !isScopePopulated && attemptedSubmit
                        ? 'bg-rose-950/40 border border-rose-500 ring-1 ring-rose-500'
                        : 'bg-slate-900 border border-slate-700 focus:border-amber-500'
                    }`}
                  />
                  {!isScopePopulated && attemptedSubmit && (
                    <p className="text-[10px] text-rose-400 mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3 h-3 text-rose-400 shrink-0" />
                      <span>Scope boundary citation (Cl. 4.3) is required to exclude this control from ISMS scope.</span>
                    </p>
                  )}
                </div>

                {/* Part 2: Risk Assessment Citation */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-semibold text-slate-300">
                      2. Risk Assessment Citation (Clause 6.1.2 Linkage - Residual Risk Proof) <span className="text-red-400">*</span>
                    </label>
                    <span className="text-[10px] font-mono text-slate-400">
                      {isRiskPopulated ? <span className="text-emerald-400 font-bold">✓ Populated</span> : <span className="text-amber-400">Required</span>}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={riskAssessmentCitation}
                    onChange={e => {
                      setRiskAssessmentCitation(e.target.value);
                    }}
                    placeholder="e.g., RA-2026-PHYS-01 (Inherent Risk: 0 - Physical access threat vector eliminated)"
                    className={`w-full px-3 py-2 rounded-lg text-white text-xs font-mono transition focus:outline-none ${
                      !isRiskPopulated && attemptedSubmit
                        ? 'bg-rose-950/40 border border-rose-500 ring-1 ring-rose-500'
                        : 'bg-slate-900 border border-slate-700 focus:border-amber-500'
                    }`}
                  />
                  {!isRiskPopulated && attemptedSubmit && (
                    <p className="text-[10px] text-rose-400 mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3 h-3 text-rose-400 shrink-0" />
                      <span>Risk assessment reference (Cl. 6.1.2) is required to substantiate residual risk acceptance.</span>
                    </p>
                  )}
                </div>

                {/* Part 3: Compensating Control Reference */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-semibold text-slate-300">
                      3. Compensating Control / CSP Attestation Reference (Clause 6.1.3 Linkage) <span className="text-red-400">*</span>
                    </label>
                    <span className="text-[10px] font-mono text-slate-400">
                      {isCompensatingPopulated ? <span className="text-emerald-400 font-bold">✓ Populated</span> : <span className="text-amber-400">Required</span>}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={compensatingControlRef}
                    onChange={e => {
                      setCompensatingControlRef(e.target.value);
                    }}
                    placeholder="e.g., AWS SOC 2 Type II Report (CC6.4 / ISO 27001 BSI Cert BSI-IS-712891)"
                    className={`w-full px-3 py-2 rounded-lg text-white text-xs font-mono transition focus:outline-none ${
                      !isCompensatingPopulated && attemptedSubmit
                        ? 'bg-rose-950/40 border border-rose-500 ring-1 ring-rose-500'
                        : 'bg-slate-900 border border-slate-700 focus:border-amber-500'
                    }`}
                  />
                  {!isCompensatingPopulated && attemptedSubmit && (
                    <p className="text-[10px] text-rose-400 mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3 h-3 text-rose-400 shrink-0" />
                      <span>Compensating control link (Cl. 6.1.3) is required to document alternative safeguards or CSP assurance.</span>
                    </p>
                  )}
                </div>

                {/* Rigor Checklist Indicators */}
                <div className="pt-2 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-1 text-[10px]">
                  {exclusionChecks.map(check => (
                    <div
                      key={check.id}
                      className={`flex items-center space-x-1.5 ${
                        check.passed ? 'text-emerald-400' : 'text-slate-500'
                      }`}
                    >
                      <CheckCircle2 className={`w-3 h-3 shrink-0 ${check.passed ? 'text-emerald-400' : 'text-slate-600'}`} />
                      <span className="truncate">{check.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Defensible Exclusion Narrative <span className="text-red-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleApplySuggestedJustification}
                    className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center space-x-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Load Standard Exemption Argument</span>
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={justification}
                  onChange={e => setJustification(e.target.value)}
                  placeholder="Clearly state the operational, architectural, or contractual justification for excluding this Annex A control..."
                  className={`w-full p-3 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none ${
                    !isNarrativePopulated && attemptedSubmit
                      ? 'bg-rose-950/40 border border-rose-500 ring-1 ring-rose-500'
                      : 'bg-slate-900 border border-slate-700 focus:border-amber-500'
                  }`}
                />
                {!isNarrativePopulated && attemptedSubmit && (
                  <p className="text-[10px] text-rose-400 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3 text-rose-400 shrink-0" />
                    <span>Exclusion narrative is required to provide context for external certification auditors.</span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: MAPPED ACTIVE RISKS (CL. 6.1.2) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-white uppercase tracking-wider">
                2. Risk Register Alignment (Clause 6.1.2 & 6.1.3 Linkage)
              </label>
              <span className="text-[10px] text-slate-400">
                {selectedRiskCodes.length} Risk(s) mapped
              </span>
            </div>

            {activeRisks.length === 0 ? (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 text-xs">
                No active risks registered in current tenant. Control serves as baseline safeguard.
              </div>
            ) : (
              <div className="max-h-36 overflow-y-auto space-y-1.5 p-2 rounded-xl bg-slate-950 border border-slate-800">
                {activeRisks.map(risk => {
                  const isChecked = selectedRiskCodes.includes(risk.riskCode);
                  return (
                    <label
                      key={risk.id}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition text-[11px] ${
                        isChecked
                          ? 'bg-indigo-950/60 border border-indigo-800/80 text-white'
                          : 'hover:bg-slate-850 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2 truncate mr-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleRisk(risk.riskCode)}
                          className="accent-indigo-600 rounded"
                        />
                        <span className="font-mono font-bold text-indigo-400">{risk.riskCode}</span>
                        <span className="truncate">{risk.title}</span>
                      </div>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                          getRiskSeverity(risk) === 'Critical'
                            ? 'bg-red-950 text-red-300'
                            : getRiskSeverity(risk) === 'High'
                            ? 'bg-amber-950 text-amber-300'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {getRiskSeverity(risk)}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* STEP 4: AUDIT EVIDENCE REQUIREMENTS */}
          {meta?.evidenceRequirements && meta.evidenceRequirements.length > 0 && (
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-300">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                <span>Auditor Objective Evidence Artifacts (ISO 19011)</span>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-slate-400">
                {meta.evidenceRequirements.map((req, rIdx) => (
                  <li key={rIdx} className="flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                    <span className="truncate" title={req}>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-slate-500">
            Updates will be immutably recorded in the Tenant Audit Trail.
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!isFormValid}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition shadow-lg flex items-center space-x-1.5 ${
                !isFormValid
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700 opacity-60'
                  : !applicable
                  ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30 text-white'
              }`}
              title={
                !applicable && !is3PartComplete
                  ? 'Clause 6.1.3(d) requires Scope Boundary (Cl. 4.3), Risk Assessment Reference, and Compensating Control Link'
                  : !isNarrativePopulated
                  ? 'Please input a justification narrative'
                  : undefined
              }
            >
              {!applicable ? (
                is3PartComplete ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Commit Exclusion (3-Part Verified)</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Incomplete (All 3 Sections Required)</span>
                  </>
                )
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Commit Justification</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
