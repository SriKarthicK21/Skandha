import React, { useState, useMemo } from 'react';
import { useGRC } from '../../context/GRCContext';
import {
  Calculator,
  Download,
  Shuffle,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Layers,
  Sparkles,
  RefreshCw,
  Printer,
  Info,
  Building,
  Check,
  X,
  FileText,
  ShieldCheck,
  AlertTriangle,
  Sliders,
  ChevronDown,
  ChevronUp,
  FileCheck2,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { useToast } from '../common/ToastContainer';
import {
  PopulationRiskFactor,
  PopulationRiskAssessment,
  PopulationRiskTier,
  SamplingRationaleData
} from '../../types/samplingRationale';
import {
  exportSamplingRationalePdf,
  exportSamplingRationaleMarkdown,
  computeSamplingAuditSeal
} from '../../utils/iso19011SamplingRationaleExporter';
import { SamplingRationaleModal } from './SamplingRationaleModal';

interface SampleItem {
  id: string;
  itemRef: string;
  category: string;
  department: string;
  riskTier: 'High' | 'Medium' | 'Low';
  status: 'Pass' | 'Fail' | 'Pending';
  notes: string;
}

interface ControlMapping {
  code: string;
  name: string;
  description: string;
  framework: string;
}

const CONTROL_MAPPINGS: Record<string, ControlMapping> = {
  'Employee Access Reviews': {
    code: 'A.5.18',
    name: 'Access Rights Review & Least Privilege Enforcement',
    description: 'Periodic re-certification of user access rights across identity providers and cloud environments.',
    framework: 'ISO/IEC 27001:2022'
  },
  'Firewall Rule Changes': {
    code: 'A.8.20',
    name: 'Network Security & Boundary Segmentation Rules',
    description: 'Authorization, change management, and architectural peer-review for perimeter firewall ingress/egress rules.',
    framework: 'ISO/IEC 27001:2022'
  },
  'Third-Party Vendor Assessments': {
    code: 'A.5.19',
    name: 'Information Security in Supplier Relationships',
    description: 'Due diligence, SOC 2/ISO certifications review, and SLA risk monitoring for critical supply chain vendors.',
    framework: 'ISO/IEC 27001:2022'
  },
  'Production Code Commits': {
    code: 'A.8.28',
    name: 'Secure Coding & Development Environment Segregation',
    description: 'Enforcement of automated SAST/DAST gating, branch protection rules, and mandatory secondary code reviews.',
    framework: 'ISO/IEC 27001:2022'
  },
  'Server Patching Logs': {
    code: 'A.8.8',
    name: 'Management of Technical Vulnerabilities',
    description: 'Timely deployment and verification of security patches across enterprise cloud and on-premises server fleets.',
    framework: 'ISO/IEC 27001:2022'
  },
  'Cryptographic Key Rotations': {
    code: 'A.8.24',
    name: 'Use of Cryptography & Key Management',
    description: 'Automated and scheduled rotation of master encryption keys, TLS certificates, and secrets vaults.',
    framework: 'ISO/IEC 27001:2022'
  },
  'Security Incident Remediation': {
    code: 'A.5.24',
    name: 'Incident Management Planning & Post-Mortems',
    description: 'Evidence of containment, root-cause analysis, and preventative control implementation following security events.',
    framework: 'ISO/IEC 27001:2022'
  }
};

const DEFAULT_RISK_FACTORS_BY_TYPE: Record<string, PopulationRiskFactor[]> = {
  'Employee Access Reviews': [
    { id: 'crit', name: 'Process & Asset Criticality', description: 'Sensitivity of systems accessed (production cloud, customer PII)', score: 8, weight: 0.25, justification: 'Grants direct administrative and data access to multi-tenant production databases.' },
    { id: 'mode', name: 'Control Execution Mode', description: 'Manual human review vs automated pipeline enforcement', score: 7, weight: 0.20, justification: 'Quarterly review conducted manually by department managers, introducing human oversight risk.' },
    { id: 'defect', name: 'Historical Defect Velocity', description: 'Rate of dormant accounts or unrevoked privileges in prior audits', score: 6, weight: 0.20, justification: 'Prior internal audit recorded 2 minor observations regarding delayed contractor deprovisioning.' },
    { id: 'blast', name: 'Privileged Access & Blast Radius', description: 'Scope of potential breach if access review fails', score: 8, weight: 0.20, justification: 'Over-privileged access can facilitate lateral movement and mass data exfiltration.' },
    { id: 'reg', name: 'Regulatory & Statutory Impact', description: 'Direct implications for SOC 2, ISO 27001, GDPR, and HIPAA', score: 8, weight: 0.15, justification: 'Mandatory certification criteria with direct non-conformity consequences if failed.' }
  ],
  'Firewall Rule Changes': [
    { id: 'crit', name: 'Process & Asset Criticality', description: 'Criticality of network perimeters and VPC routing', score: 9, weight: 0.25, justification: 'Perimeter firewall controls all ingress traffic from public internet to production subnets.' },
    { id: 'mode', name: 'Control Execution Mode', description: 'Manual change ticket vs automated Terraform policy check', score: 6, weight: 0.20, justification: 'Rules defined via GitOps but require manual peer review and security team exception sign-off.' },
    { id: 'defect', name: 'Historical Defect Velocity', description: 'Previous misconfigurations or open ports (e.g. 0.0.0.0/0)', score: 6, weight: 0.20, justification: 'One past drift incident detected during red-team drill where port 22 was temporarily exposed.' },
    { id: 'blast', name: 'Privileged Access & Blast Radius', description: 'Potential breach surface from permissive firewall rule', score: 9, weight: 0.20, justification: 'Flawed ingress rule exposes internal cluster ports to unauthorized external probes.' },
    { id: 'reg', name: 'Regulatory & Statutory Impact', description: 'PCI-DSS Req 1, ISO 27001 A.8.20 network requirements', score: 9, weight: 0.15, justification: 'Strict non-negotiable requirement for PCI-DSS and ISO 27001 network boundary control.' }
  ],
  'Third-Party Vendor Assessments': [
    { id: 'crit', name: 'Process & Asset Criticality', description: 'Vendor data handling and system integration level', score: 8, weight: 0.25, justification: 'Tier-1 SaaS vendors host corporate telemetry, CRM data, and source code mirrors.' },
    { id: 'mode', name: 'Control Execution Mode', description: 'Annual questionnaires vs continuous automated posture scoring', score: 8, weight: 0.20, justification: 'Relies heavily on annual vendor questionnaire submissions and third-party SOC 2 Type II reports.' },
    { id: 'defect', name: 'Historical Defect Velocity', description: 'Third-party breaches or expired vendor contracts', score: 7, weight: 0.20, justification: 'Several vendors delayed submitting updated annual SOC 2 renewal attestations.' },
    { id: 'blast', name: 'Privileged Access & Blast Radius', description: 'Supply chain compromise and downstream data spill potential', score: 8, weight: 0.20, justification: 'Vendor compromise can compromise integrated API tokens and confidential customer records.' },
    { id: 'reg', name: 'Regulatory & Statutory Impact', description: 'ISO 27001 A.5.19-22, GDPR Article 28 data processor obligations', score: 8, weight: 0.15, justification: 'Requires signed Data Processing Agreements (DPAs) and documented security assurance.' }
  ],
  'Production Code Commits': [
    { id: 'crit', name: 'Process & Asset Criticality', description: 'Core application codebase and release pipelines', score: 7, weight: 0.25, justification: 'Directly dictates code running in customer-facing SaaS workloads.' },
    { id: 'mode', name: 'Control Execution Mode', description: 'Automated CI/CD security linters vs human code review', score: 4, weight: 0.20, justification: 'High degree of automation with mandatory GitHub branch protection and automated SAST/DAST bots.' },
    { id: 'defect', name: 'Historical Defect Velocity', description: 'Unapproved commits or bypassed PR checks in past 12 months', score: 4, weight: 0.20, justification: 'Strict branch rules prevent direct push to main; zero bypasses recorded in past audit cycles.' },
    { id: 'blast', name: 'Privileged Access & Blast Radius', description: 'Code injection or vulnerability deployment risks', score: 7, weight: 0.20, justification: 'Malicious code commit could deploy remote-code execution flaws if gating checks fail.' },
    { id: 'reg', name: 'Regulatory & Statutory Impact', description: 'ISO 27001 A.8.28 & A.8.31, SOC 2 CC7.1-7.4 change management', score: 7, weight: 0.15, justification: 'Demonstrates disciplined software development lifecycle (SDLC) controls.' }
  ],
  'Server Patching Logs': [
    { id: 'crit', name: 'Process & Asset Criticality', description: 'Vulnerability remediation across production cloud compute nodes', score: 8, weight: 0.25, justification: 'Hosts core microservices, Kubernetes nodes, and persistent database volumes.' },
    { id: 'mode', name: 'Control Execution Mode', description: 'Automated patch rollout vs manual maintenance windows', score: 5, weight: 0.20, justification: 'OS updates use automated AWS SSM patch baselines; legacy bastion nodes require manual patching.' },
    { id: 'defect', name: 'Historical Defect Velocity', description: 'Overdue CVE remediations exceeding SLA targets', score: 6, weight: 0.20, justification: 'Occasional reboot deferrals occurred during high-traffic quarters for core databases.' },
    { id: 'blast', name: 'Privileged Access & Blast Radius', description: 'Exploitation of unpatched critical/high CVEs', score: 8, weight: 0.20, justification: 'Unpatched kernels or services expose nodes to privilege escalation exploits.' },
    { id: 'reg', name: 'Regulatory & Statutory Impact', description: 'ISO 27001 A.8.8, CIS Benchmarks, NIST SP 800-53 SI-2', score: 8, weight: 0.15, justification: 'Auditors require proof of timely remediation within established 30-day critical patch SLAs.' }
  ],
  'Cryptographic Key Rotations': [
    { id: 'crit', name: 'Process & Asset Criticality', description: 'Customer data encryption at rest and in transit', score: 10, weight: 0.25, justification: 'Protects AES-256 master keys securing all multi-tenant customer datastores.' },
    { id: 'mode', name: 'Control Execution Mode', description: 'AWS KMS automated rotation vs manual HSM key rotation', score: 3, weight: 0.20, justification: 'Cloud KMS provides native 365-day automated rotation; minimal manual touchpoints.' },
    { id: 'defect', name: 'Historical Defect Velocity', description: 'Expired TLS certificates or delayed secret rotations', score: 3, weight: 0.20, justification: 'Clean track record with automated alerting 30 days prior to certificate expiry.' },
    { id: 'blast', name: 'Privileged Access & Blast Radius', description: 'Catastrophic confidentiality loss if keys compromised', score: 10, weight: 0.20, justification: 'Compromise of root key invalidates confidential boundaries across all tenants.' },
    { id: 'reg', name: 'Regulatory & Statutory Impact', description: 'ISO 27001 A.8.24, PCI-DSS Req 3.5-3.6, FIPS 140-3', score: 9, weight: 0.15, justification: 'Strict cryptographic management criteria under international banking and privacy laws.' }
  ],
  'Security Incident Remediation': [
    { id: 'crit', name: 'Process & Asset Criticality', description: 'Threat containment and post-incident forensic corrective action', score: 9, weight: 0.25, justification: 'Directly reflects organization capability to respond to active threats and data breaches.' },
    { id: 'mode', name: 'Control Execution Mode', description: 'Incident commander execution and manual CAPA investigations', score: 8, weight: 0.20, justification: 'Requires bespoke investigative interviews, log forensics, and manual documentation.' },
    { id: 'defect', name: 'Historical Defect Velocity', description: 'Overdue post-mortems or recurring root-causes', score: 7, weight: 0.20, justification: 'Two past low-severity alerts lacked formal sign-off from the technical steering committee.' },
    { id: 'blast', name: 'Privileged Access & Blast Radius', description: 'Uncontained security breach or systemic vulnerability recurrence', score: 9, weight: 0.20, justification: 'Unresolved root causes lead directly to secondary ransomware or persistent threat vectors.' },
    { id: 'reg', name: 'Regulatory & Statutory Impact', description: 'ISO 27001 A.5.24-28, GDPR Article 33 (72-hour reporting rule)', score: 9, weight: 0.15, justification: 'Critical legal liability if incident response and corrective actions fail regulatory scrutiny.' }
  ]
};

export const ISO19011SamplingCalculator: React.FC = () => {
  const { currentTenant } = useGRC();
  const { showToast } = useToast();

  const [populationType, setPopulationType] = useState<string>('Employee Access Reviews');
  const [populationSize, setPopulationSize] = useState<number>(450);
  const [confidenceLevel, setConfidenceLevel] = useState<number>(95);
  const [marginOfError, setMarginOfError] = useState<number>(5);
  const [samplingMethod, setSamplingMethod] = useState<'Attribute Sampling' | 'Simple Random' | 'Stratified Risk-Based'>('Attribute Sampling');

  // Risk Factors State
  const [riskFactors, setRiskFactors] = useState<PopulationRiskFactor[]>(() => {
    return DEFAULT_RISK_FACTORS_BY_TYPE['Employee Access Reviews'] || [];
  });
  const [showRiskEditor, setShowRiskEditor] = useState<boolean>(false);
  const [isRationaleModalOpen, setIsRationaleModalOpen] = useState<boolean>(false);

  // Compute Inherent Population Risk Score (0 - 100)
  const populationRiskAssessment = useMemo<PopulationRiskAssessment>(() => {
    const rawWeighted = riskFactors.reduce((sum, f) => sum + f.score * f.weight, 0);
    const overallRiskScore = Math.min(Math.max(Math.round(rawWeighted * 10), 0), 100);

    let riskTier: PopulationRiskTier = 'LOW';
    if (overallRiskScore >= 80) riskTier = 'CRITICAL';
    else if (overallRiskScore >= 60) riskTier = 'HIGH';
    else if (overallRiskScore >= 40) riskTier = 'MODERATE';

    // Derive ISO 19011 recommended sampling rigor based on risk score
    let recommendedConfidence: 90 | 95 | 99 = 95;
    let recommendedMarginOfError = 5;
    let recommendedMethod: 'Attribute Sampling' | 'Simple Random' | 'Stratified Risk-Based' = 'Attribute Sampling';

    if (riskTier === 'CRITICAL') {
      recommendedConfidence = 99;
      recommendedMarginOfError = 3;
      recommendedMethod = 'Stratified Risk-Based';
    } else if (riskTier === 'HIGH') {
      recommendedConfidence = 95;
      recommendedMarginOfError = 5;
      recommendedMethod = 'Stratified Risk-Based';
    } else if (riskTier === 'MODERATE') {
      recommendedConfidence = 95;
      recommendedMarginOfError = 5;
      recommendedMethod = 'Attribute Sampling';
    } else {
      recommendedConfidence = 90;
      recommendedMarginOfError = 10;
      recommendedMethod = 'Simple Random';
    }

    const highRiskStratum = riskFactors.reduce((prev, current) => (prev.score > current.score ? prev : current), riskFactors[0]);

    const rationaleSummary = `The population exhibits an inherent risk score of ${overallRiskScore}/100 (${riskTier} Risk). Primary risk driver is '${highRiskStratum?.name || 'Criticality'}' (rated ${highRiskStratum?.score || 8}/10). Pursuant to ISO 19011:2018 §B.3, this elevated risk profile warrants a ${recommendedConfidence}% confidence level, a strict ±${recommendedMarginOfError}% tolerable margin of error, and ${recommendedMethod} to safeguard against Type II (Beta) sampling error.`;

    return {
      overallRiskScore,
      riskTier,
      evaluatedAt: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      evaluator: 'Lead ISO Auditor / Risk & Compliance Team',
      factors: riskFactors,
      highRiskStratumDescription: highRiskStratum ? `${highRiskStratum.name} (Score: ${highRiskStratum.score}/10)` : 'Systemic Privilege Risk',
      recommendedConfidence,
      recommendedMarginOfError,
      recommendedMethod,
      rationaleSummary
    };
  }, [riskFactors]);

  // When population type changes, reload default risk profile
  const handlePopulationTypeChange = (newType: string) => {
    setPopulationType(newType);
    const defaults = DEFAULT_RISK_FACTORS_BY_TYPE[newType] || DEFAULT_RISK_FACTORS_BY_TYPE['Employee Access Reviews'];
    setRiskFactors(defaults);
    const newItems = generateRandomSamples(newType, calculatedSampleSize);
    setSamples(newItems);
  };

  const handleUpdateFactorScore = (id: string, newScore: number) => {
    setRiskFactors(prev => prev.map(f => f.id === id ? { ...f, score: Math.min(Math.max(newScore, 1), 10) } : f));
  };

  // Auto-tune sampling parameters based on the calculated risk score
  const handleAutoTuneToRiskScore = () => {
    setConfidenceLevel(populationRiskAssessment.recommendedConfidence);
    setMarginOfError(populationRiskAssessment.recommendedMarginOfError);
    setSamplingMethod(populationRiskAssessment.recommendedMethod);
    showToast({
      title: 'Risk Calibration Applied',
      message: `Aligned sampling parameters to ${populationRiskAssessment.riskTier} Risk (${populationRiskAssessment.overallRiskScore}/100): ${populationRiskAssessment.recommendedConfidence}% Confidence, ±${populationRiskAssessment.recommendedMarginOfError}% Margin of Error.`,
      type: 'success'
    });
  };

  // Calculate statistically sound sample size (Cochran finite population formula)
  const calculatedSampleSize = useMemo(() => {
    const z = confidenceLevel === 99 ? 2.576 : confidenceLevel === 95 ? 1.96 : 1.645;
    // Estimated population error rate standard for ISO 19011 audits
    const p = populationRiskAssessment.overallRiskScore >= 80 ? 0.08 : populationRiskAssessment.overallRiskScore >= 60 ? 0.05 : 0.03;
    const e = marginOfError / 100;
    const N = Math.max(populationSize, 1);

    // Cochran's formula for finite population
    const n0 = (z * z * p * (1 - p)) / (e * e);
    const n = Math.ceil(n0 / (1 + (n0 - 1) / N));

    // Clamp between 5 and population size, min 25 for typical enterprise ISO audits unless population is smaller
    return Math.min(Math.max(n, Math.min(25, N)), N);
  }, [populationSize, confidenceLevel, marginOfError, populationRiskAssessment.overallRiskScore]);

  // Generate randomized sample rows
  const [samples, setSamples] = useState<SampleItem[]>(() => generateRandomSamples(populationType, 25));

  function generateRandomSamples(type: string, count: number): SampleItem[] {
    const departments = ['Engineering', 'Security Operations', 'Human Resources', 'Finance & Procurement', 'Cloud Infrastructure'];
    const prefix = type.toLowerCase().includes('access')
      ? 'ACC'
      : type.toLowerCase().includes('firewall')
      ? 'FW'
      : type.toLowerCase().includes('vendor')
      ? 'VND'
      : type.toLowerCase().includes('commit')
      ? 'GIT'
      : type.toLowerCase().includes('patch')
      ? 'PTC'
      : type.toLowerCase().includes('crypto')
      ? 'KMS'
      : 'INC';

    const items: SampleItem[] = [];
    for (let i = 1; i <= count; i++) {
      const randNum = Math.floor(1000 + Math.random() * 9000);
      const isHighRisk = i % 4 === 0;
      const isMedRisk = !isHighRisk && i % 2 === 0;
      const isFail = i === 3 || (i === 11 && count > 15);
      const isPending = i > Math.floor(count * 0.85);

      items.push({
        id: `SMP-${String(i).padStart(3, '0')}`,
        itemRef: `${prefix}-${randNum}`,
        category: type,
        department: departments[i % departments.length],
        riskTier: isHighRisk ? 'High' : isMedRisk ? 'Medium' : 'Low',
        status: isPending ? 'Pending' : isFail ? 'Fail' : 'Pass',
        notes: isFail
          ? 'Evidence timestamp missing secondary supervisor sign-off stamp.'
          : isPending
          ? 'Artifact extraction initiated; awaiting verification log.'
          : 'Satisfies control design and operational verification criteria.'
      });
    }
    return items;
  }

  const handleRegenerate = () => {
    const newItems = generateRandomSamples(populationType, calculatedSampleSize);
    setSamples(newItems);
    showToast({
      title: 'Samples Generated',
      message: `Generated ${calculatedSampleSize} randomized ISO 19011 sample items.`,
      type: 'success'
    });
  };

  const handleStatusToggle = (id: string, status: 'Pass' | 'Fail' | 'Pending') => {
    setSamples(samples.map(s => s.id === id ? { ...s, status } : s));
  };

  const passCount = samples.filter(s => s.status === 'Pass').length;
  const failCount = samples.filter(s => s.status === 'Fail').length;
  const pendingCount = samples.filter(s => s.status === 'Pending').length;
  const sampleErrorRate = (failCount / Math.max(passCount + failCount, 1)) * 100;

  // Build Comprehensive Rationale Data Object
  const rationaleData = useMemo<SamplingRationaleData>(() => {
    const control = CONTROL_MAPPINGS[populationType] || {
      code: 'A.5.18',
      name: populationType,
      description: 'Audit evaluation of operational control implementation.',
      framework: 'ISO/IEC 27001:2022'
    };

    const z = confidenceLevel === 99 ? 2.576 : confidenceLevel === 95 ? 1.96 : 1.645;
    const expectedRate = populationRiskAssessment.overallRiskScore >= 80 ? 0.08 : populationRiskAssessment.overallRiskScore >= 60 ? 0.05 : 0.03;
    const sampleFraction = (calculatedSampleSize / Math.max(populationSize, 1)) * 100;

    // Stratification counts
    const highSamples = samples.filter(s => s.riskTier === 'High').length;
    const medSamples = samples.filter(s => s.riskTier === 'Medium').length;
    const lowSamples = samples.filter(s => s.riskTier === 'Low').length;

    const highPop = Math.round(populationSize * 0.25);
    const medPop = Math.round(populationSize * 0.45);
    const lowPop = populationSize - highPop - medPop;

    const sealPayload = `${currentTenant?.id || 'default'}-${populationType}-${populationSize}-${calculatedSampleSize}-${populationRiskAssessment.overallRiskScore}-${Date.now()}`;
    const sha256Seal = computeSamplingAuditSeal(sealPayload);

    // Audit Verdict
    let auditVerdict: 'CONFORMANT' | 'NON_CONFORMANT' | 'QUALIFIED_CONFORMANCE' | 'PENDING_FIELDWORK' = 'CONFORMANT';
    if (failCount > 0 && sampleErrorRate > marginOfError) {
      auditVerdict = 'NON_CONFORMANT';
    } else if (failCount > 0) {
      auditVerdict = 'QUALIFIED_CONFORMANCE';
    } else if (pendingCount > 0 && passCount + failCount < calculatedSampleSize) {
      auditVerdict = 'PENDING_FIELDWORK';
    }

    const auditorObservation =
      failCount > 0
        ? `Testing of ${samples.length} sample items revealed ${failCount} non-conformities (${sampleErrorRate.toFixed(1)}% error rate). Remediation CAPA ticket issued to target system owners.`
        : `All ${passCount} evaluated samples conformed with documented operational criteria without exceptions. No systemic control drift detected.`;

    return {
      documentId: `DOC-ISO19011-SRD-2026-${String(populationRiskAssessment.overallRiskScore).padStart(3, '0')}`,
      workingPaperRef: `WP-${control.code.replace(/[^a-zA-Z0-9]/g, '')}-SAMPL-${new Date().getFullYear()}`,
      tenantName: currentTenant?.name || 'Skanda Enterprise GRC',
      leadAuditor: {
        name: 'Dr. Sarah Chen, CISSP, CISA',
        role: 'Lead ISO Management Systems Auditor',
        certifications: ['ISO/IEC 27001 Lead Auditor', 'ISO 19011 Certified', 'CISA'],
        email: 'audit.lead@skanda-grc.internal'
      },
      auditStandard: 'ISO 19011:2018 Clause 6.4.4 & Annex B.3 / ISO/IEC 27001:2022 Clause 9.2',
      targetControl: control,
      population: {
        artifactType: populationType,
        populationSize,
        description: `Complete operational record population of ${populationType} generated within the active audit cycle.`,
        periodCovered: 'Prior 12 Rolling Months',
        homogeneityAssessment: 'Heterogeneous population stratified across engineering, cloud operations, HR, and vendor administration.'
      },
      riskAssessment: populationRiskAssessment,
      statisticalParameters: {
        confidenceLevel,
        zScore: z,
        marginOfError,
        expectedErrorRate: expectedRate,
        samplingMethod,
        finitePopulationCorrection: true,
        calculatedSampleSize,
        sampleFractionPercentage: sampleFraction,
        formulaNotation: `n = n₀ / [1 + (n₀ - 1) / N] with n₀ = (Z² · p · (1 - p)) / e²`
      },
      samplingRiskAnalysis: {
        alphaRiskDescription: `Type I Error (Risk of Under-reliance / false rejection): Probability of concluding the control is ineffective when it is compliant. Controlled at ${(100 - confidenceLevel)}% by standardizing expected deviation rate at ${(expectedRate * 100).toFixed(0)}%.`,
        betaRiskDescription: `Type II Error (Risk of Over-reliance / false acceptance): Probability of concluding the control is effective when true population defect rate exceeds the ±${marginOfError}% tolerable margin. Actively mitigated by applying a ${confidenceLevel}% confidence boundary.`,
        acceptableBetaRiskLevel: `≤ ${(100 - confidenceLevel)}% (Maximum Tolerable Over-reliance Probability)`
      },
      stratificationAllocation: [
        {
          stratum: 'High',
          populationCount: highPop,
          sampleCount: highSamples,
          samplingRatioPct: (highSamples / Math.max(highPop, 1)) * 100,
          allocationBasis: 'Disproportionate over-sampling applied to high-privilege access and root configurations.'
        },
        {
          stratum: 'Medium',
          populationCount: medPop,
          sampleCount: medSamples,
          samplingRatioPct: (medSamples / Math.max(medPop, 1)) * 100,
          allocationBasis: 'Proportional attribute sampling across standard business unit operational changes.'
        },
        {
          stratum: 'Low',
          populationCount: lowPop,
          sampleCount: lowSamples,
          samplingRatioPct: (lowSamples / Math.max(lowPop, 1)) * 100,
          allocationBasis: 'Baseline screening sample for automated or read-only operational telemetry.'
        }
      ],
      fieldworkResults: {
        totalTested: passCount + failCount,
        passedCount: passCount,
        failedCount: failCount,
        pendingCount,
        sampleErrorRatePct: sampleErrorRate,
        tolerableErrorRatePct: marginOfError,
        upperErrorLimitEstimatePct: sampleErrorRate + marginOfError,
        auditVerdict,
        auditorObservation
      },
      samples,
      sha256IntegritySeal: sha256Seal,
      generatedDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    };
  }, [
    currentTenant,
    populationType,
    populationSize,
    confidenceLevel,
    marginOfError,
    samplingMethod,
    calculatedSampleSize,
    populationRiskAssessment,
    samples,
    passCount,
    failCount,
    pendingCount,
    sampleErrorRate
  ]);

  // One-click direct PDF export
  const handleExportRationalePDF = () => {
    try {
      exportSamplingRationalePdf(rationaleData);
      showToast({
        title: 'Audit Rationale Exported',
        message: `ISO 19011 Audit Sampling Rationale document generated and downloaded as PDF for ${populationType} (Risk Score: ${populationRiskAssessment.overallRiskScore}/100).`,
        type: 'success'
      });
    } catch (err: any) {
      showToast({
        title: 'Export Error',
        message: err?.message || 'Failed to export sampling rationale PDF.',
        type: 'error'
      });
    }
  };

  // Export Samples to CSV
  const exportCSV = () => {
    const headers = ['Sample ID', 'Item Reference', 'Population Type', 'Department', 'Risk Tier', 'Audit Test Status', 'Auditor Notes'];
    const rows = samples.map(s => [
      s.id,
      s.itemRef,
      `"${s.category}"`,
      `"${s.department}"`,
      s.riskTier,
      s.status,
      `"${s.notes.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ISO19011_Sample_Sheet_${populationType.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast({ title: 'Export Successful', message: 'Sample testing sheet exported as CSV.', type: 'success' });
  };

  const riskBadgeColor =
    populationRiskAssessment.riskTier === 'CRITICAL'
      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
      : populationRiskAssessment.riskTier === 'HIGH'
      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
      : populationRiskAssessment.riskTier === 'MODERATE'
      ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/80 border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5" />
                ISO 19011:2018 Clause 6.4.4 & §B.3
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${riskBadgeColor}`}>
                Population Risk: {populationRiskAssessment.overallRiskScore}/100 ({populationRiskAssessment.riskTier})
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-slate-900 text-slate-300 border border-slate-800">
                Statistical Sampling Engine
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Audit Sampling Calculator & Working Paper Sheet
            </h1>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              Standardized mathematical sampling engine adhering to ISO 19011:2018 guidelines for auditing management systems. Calculates statistically sound sample sizes from population risk profiles and generates formal, auditor-certified sampling rationale documents.
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleExportRationalePDF}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold transition flex items-center space-x-2 shadow-lg shadow-indigo-600/25 border border-indigo-400/30"
              title="Generate formal ISO 19011 audit sampling rationale PDF based on population risk score"
            >
              <FileCheck2 className="w-4 h-4 text-indigo-100" />
              <span>Export Audit Rationale (PDF)</span>
            </button>

            <button
              type="button"
              onClick={() => setIsRationaleModalOpen(true)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700 flex items-center space-x-1.5"
              title="Preview formal rationale working paper before exporting"
            >
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>View Rationale Dossier</span>
            </button>

            <button
              type="button"
              onClick={handleRegenerate}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700 flex items-center space-x-1.5"
            >
              <Shuffle className="w-4 h-4 text-indigo-400" />
              <span>Draw Samples ({calculatedSampleSize})</span>
            </button>

            <button
              type="button"
              onClick={exportCSV}
              className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700 flex items-center space-x-1.5"
            >
              <Download className="w-4 h-4 text-slate-400" />
              <span>CSV</span>
            </button>
          </div>
        </div>

        {/* Statistical Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="space-y-1">
            <label className="text-slate-400 text-[11px] font-semibold">Population Artifact Type</label>
            <select
              value={populationType}
              onChange={e => handlePopulationTypeChange(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:border-indigo-500 outline-none"
            >
              <option value="Employee Access Reviews">Employee Access Reviews (A.5.18)</option>
              <option value="Firewall Rule Changes">Firewall Rule Changes (A.8.20)</option>
              <option value="Third-Party Vendor Assessments">Third-Party Vendor Risk (A.5.19)</option>
              <option value="Production Code Commits">Production Code Commits (A.8.28)</option>
              <option value="Server Patching Logs">Server Patching Logs (A.8.8)</option>
              <option value="Cryptographic Key Rotations">Cryptographic Key Rotations (A.8.24)</option>
              <option value="Security Incident Remediation">Security Incident Tickets (A.5.24)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 text-[11px] font-semibold">Total Population Size (N)</label>
            <input
              type="number"
              min={1}
              max={100000}
              value={populationSize}
              onChange={e => setPopulationSize(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white font-mono focus:border-indigo-500 outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 text-[11px] font-semibold">Confidence Level</label>
            <select
              value={confidenceLevel}
              onChange={e => setConfidenceLevel(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:border-indigo-500 outline-none"
            >
              <option value={90}>90% (Low-Risk Screening)</option>
              <option value={95}>95% (Standard CB Audit Benchmark)</option>
              <option value={99}>99% (High-Assurance / Critical)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 text-[11px] font-semibold">Margin of Error (Tolerable Error)</label>
            <select
              value={marginOfError}
              onChange={e => setMarginOfError(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:border-indigo-500 outline-none"
            >
              <option value={3}>±3% (Strict Tolerance)</option>
              <option value={5}>±5% (Standard Practice)</option>
              <option value={10}>±10% (Exploratory / Wide)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 text-[11px] font-semibold">Sampling Methodology</label>
            <select
              value={samplingMethod}
              onChange={e => setSamplingMethod(e.target.value as any)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:border-indigo-500 outline-none"
            >
              <option value="Attribute Sampling">Attribute Sampling</option>
              <option value="Simple Random">Simple Random</option>
              <option value="Stratified Risk-Based">Stratified Risk-Based</option>
            </select>
          </div>
        </div>
      </div>

      {/* POPULATION RISK SCORE & ADAPTIVE CALIBRATION CARD */}
      <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start space-x-4">
            {/* Big Risk Dial / Badge */}
            <div className={`p-4 rounded-xl border flex flex-col items-center justify-center min-w-[110px] ${riskBadgeColor}`}>
              <span className="text-[10px] font-bold uppercase tracking-wider">Risk Score</span>
              <span className="text-3xl font-black font-mono mt-0.5">
                {populationRiskAssessment.overallRiskScore}
              </span>
              <span className="text-[11px] font-bold uppercase mt-0.5">
                {populationRiskAssessment.riskTier} RISK
              </span>
            </div>

            {/* Risk Explanation */}
            <div className="space-y-1 max-w-2xl">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">
                  ISO 19011 Population Risk Score Evaluation
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {populationRiskAssessment.rationaleSummary}
              </p>
              <div className="text-[11px] text-slate-400 pt-0.5">
                Highest risk contributor: <strong className="text-indigo-300">{populationRiskAssessment.highRiskStratumDescription}</strong>
              </div>
            </div>
          </div>

          {/* Risk-Adaptive Action Controls */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleAutoTuneToRiskScore}
              className="px-3.5 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold transition flex items-center space-x-1.5"
              title="Automatically adjust confidence level, tolerable error, and sampling method to match calculated population risk score"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Risk-Adaptive Auto-Tune</span>
            </button>

            <button
              type="button"
              onClick={() => setShowRiskEditor(!showRiskEditor)}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-medium transition flex items-center space-x-1.5"
            >
              <Sliders className="w-3.5 h-3.5 text-slate-400" />
              <span>{showRiskEditor ? 'Hide Risk Dimensions' : 'Edit Risk Factors (5)'}</span>
              {showRiskEditor ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Expandable Risk Factors Slider Panel */}
        {showRiskEditor && (
          <div className="pt-4 border-t border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
              <span className="font-semibold text-slate-300">
                Fine-Tune Population Risk Dimensions (ISO 19011:2018 §B.3 & ISO 27001 Risk Criteria):
              </span>
              <span className="text-[11px]">Weighted formula: Σ(Score × Weight) × 10</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
              {riskFactors.map(factor => (
                <div key={factor.id} className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-white truncate" title={factor.name}>
                      {factor.name}
                    </span>
                    <span className="text-[10px] font-mono text-indigo-400">
                      {(factor.weight * 100).toFixed(0)}% wt
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-400 line-clamp-2 h-7" title={factor.description}>
                    {factor.description}
                  </p>

                  <div className="flex items-center space-x-2 pt-1">
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={factor.score}
                      onChange={e => handleUpdateFactorScore(factor.id, Number(e.target.value))}
                      className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                    <span className="text-xs font-mono font-bold text-white w-6 text-right">
                      {factor.score}/10
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sampling Result Metric Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[11px] text-slate-400">Required Sample Size (n)</span>
          <div className="text-2xl font-bold text-white font-mono mt-1">
            {calculatedSampleSize} <span className="text-xs text-slate-500 font-normal">items</span>
          </div>
          <span className="text-[10px] text-indigo-400 mt-0.5 block">
            {((calculatedSampleSize / Math.max(populationSize, 1)) * 100).toFixed(1)}% of population (Cochran n)
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[11px] text-slate-400">Passed Control Tests</span>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
            {passCount}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            Satisfies control design criteria
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[11px] text-slate-400">Non-Conformities (Fail)</span>
          <div className="text-2xl font-bold text-rose-400 font-mono mt-1">
            {failCount}
          </div>
          <span className="text-[10px] text-rose-400/80 mt-0.5 block">
            {sampleErrorRate.toFixed(1)}% sample error rate
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[11px] text-slate-400">Pending Fieldwork</span>
          <div className="text-2xl font-bold text-amber-400 font-mono mt-1">
            {pendingCount}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            Awaiting artifact verification
          </span>
        </div>
      </div>

      {/* Generated Sample Items Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">
              Randomized Sample Working Paper ({samples.length} Items Selected)
            </h3>
          </div>
          <div className="flex items-center space-x-3 text-xs">
            <span className="text-slate-400">
              Population: <strong className="text-white">{populationSize}</strong> | Confidence: <strong className="text-white">{confidenceLevel}%</strong> | Error: <strong className="text-white">±{marginOfError}%</strong>
            </span>
            <button
              type="button"
              onClick={handleExportRationalePDF}
              className="px-2.5 py-1 rounded bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 border border-indigo-500/30 font-semibold text-[11px] flex items-center space-x-1 transition"
            >
              <FileCheck2 className="w-3 h-3" />
              <span>Export Formal Rationale (PDF)</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-4">Sample ID</th>
                <th className="py-2.5 px-4">Artifact Reference</th>
                <th className="py-2.5 px-4">Department</th>
                <th className="py-2.5 px-4">Risk Stratum</th>
                <th className="py-2.5 px-4">Test Status</th>
                <th className="py-2.5 px-4">Working Paper / Finding Notes</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {samples.map(s => {
                const statusBadge =
                  s.status === 'Pass'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : s.status === 'Fail'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30';

                return (
                  <tr key={s.id} className="hover:bg-slate-900/40 transition">
                    <td className="py-3 px-4 font-mono text-slate-400 font-bold">{s.id}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-indigo-300">{s.itemRef}</td>
                    <td className="py-3 px-4 text-slate-300">{s.department}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        s.riskTier === 'High' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                        s.riskTier === 'Medium' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                        'bg-slate-900 text-slate-400 border border-slate-800'
                      }`}>
                        {s.riskTier}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 max-w-xs truncate">{s.notes}</td>
                    <td className="py-3 px-4 text-right space-x-1.5">
                      <button
                        type="button"
                        onClick={() => handleStatusToggle(s.id, 'Pass')}
                        className="px-2 py-1 rounded bg-emerald-950 text-emerald-300 hover:bg-emerald-900 text-[10px] font-bold border border-emerald-800 transition"
                      >
                        Pass
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusToggle(s.id, 'Fail')}
                        className="px-2 py-1 rounded bg-rose-950 text-rose-300 hover:bg-rose-900 text-[10px] font-bold border border-rose-800 transition"
                      >
                        Fail
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Formal Rationale Modal Preview */}
      <SamplingRationaleModal
        isOpen={isRationaleModalOpen}
        onClose={() => setIsRationaleModalOpen(false)}
        data={rationaleData}
      />
    </div>
  );
};
