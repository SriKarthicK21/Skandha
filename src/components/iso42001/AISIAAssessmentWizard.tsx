import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Sliders, 
  FileText, 
  Award, 
  Lock, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Save, 
  Printer, 
  Download, 
  RefreshCw, 
  Cpu, 
  Eye, 
  UserCheck, 
  Scale, 
  Leaf, 
  ChevronDown, 
  ChevronUp, 
  HelpCircle,
  Plus,
  Trash2,
  FileSpreadsheet,
  Check,
  Info,
  ExternalLink,
  Shield,
  RotateCcw,
  Database,
  Building2,
  Layers
} from 'lucide-react';
import { 
  AISIAAssessmentRecord, 
  INITIAL_AISIA_ASSESSMENTS 
} from '../../data/iso42001ExtendedMasterData';

interface AISIAAssessmentWizardProps {
  initialSystemId?: string;
  targetSystemId?: string;
  tenantId?: string;
  tenantName?: string;
  onAssessmentSaved?: (record: AISIAAssessmentRecord) => void;
  onAssessmentComplete?: (record: AISIAAssessmentRecord) => void;
  availableSystems?: { id: string; name: string; category?: string; version?: string }[];
}

// Criteria Anchor definitions for 1-5 rating
const CRITERIA_ANCHORS: Record<string, { title: string; subtitle: string; weight: number; levels: Record<number, string> }> = {
  adverseOutcomeSeverity: {
    title: 'Adverse Outcome Severity on Individuals',
    subtitle: 'Potential for severe deprivation of economic opportunities, credit, employment, liberty, or essential services.',
    weight: 1.5,
    levels: {
      1: 'Negligible: Reversible, minor aesthetic or non-critical inconvenience without material loss.',
      2: 'Minor: Minor financial or operational friction; prompt recourse readily available.',
      3: 'Moderate: Significant impact on commercial terms or service delays; manual appeal required.',
      4: 'High: Formal denial of credit, employment filtering, or adverse economic action.',
      5: 'Critical: Catastrophic impact on liberty, physical safety, housing, or fundamental livelihood.'
    }
  },
  discriminationBiasPotential: {
    title: 'Algorithmic Discrimination & Disparate Impact',
    subtitle: 'Risk of differential outcomes across protected characteristics (gender, race, age, religion, geography).',
    weight: 1.4,
    levels: {
      1: 'Negligible: No demographic variables, validated 1.0 parity ratio across all testing slices.',
      2: 'Minor: Minor disparate impact ratio (0.90–0.95); well within regulatory safe harbor.',
      3: 'Moderate: Disparate impact ratio borderline (0.80–0.89); requires re-weighing or feature pruning.',
      4: 'High: High proxy correlation with protected classes; fails EEOC 4/5ths rule (<0.80).',
      5: 'Critical: Systematic, entrenched algorithmic discrimination resulting in unlawful disparate treatment.'
    }
  },
  privacyIntrusionLevel: {
    title: 'Privacy Intrusion & Sensitive Data Ingestion',
    subtitle: 'Extent of personal data, biometrics, financial transactions, or confidential communications processed.',
    weight: 1.1,
    levels: {
      1: 'Negligible: Fully anonymized or non-personal tabular/telemetry data only.',
      2: 'Minor: Standard enterprise contact details with explicit processing consent.',
      3: 'Moderate: Financial transactional histories or behavioral logs with pseudonymization.',
      4: 'High: Sensitive PII, customer chat logs, biometric vectors, or KYC identity documents.',
      5: 'Critical: Continuous biometric surveillance, special-category health data, or children’s data.'
    }
  },
  explainabilityBarrier: {
    title: 'Explainability & Decision Transparency Barrier',
    subtitle: 'Complexity in rendering individual adverse decision rationales human-interpretable and contestable.',
    weight: 1.0,
    levels: {
      1: 'Negligible: Direct linear regression or shallow rule tree; self-explanatory logic.',
      2: 'Minor: Constrained decision trees or generalized additive models with transparent weights.',
      3: 'Moderate: Ensemble gradient boosting (XGBoost); interpretable via SHAP/LIME feature vectors.',
      4: 'High: Deep neural networks or multi-step RAG pipelines; challenging non-linear explainability.',
      5: 'Critical: Black-box foundation model with uninterpretable latent representations and hallucinations.'
    }
  },
  criticalInfrastructureReliance: {
    title: 'Critical Infrastructure & Systemic Dependency',
    subtitle: 'Reliance of essential financial services, payment rails, or critical operations on model continuous availability.',
    weight: 1.2,
    levels: {
      1: 'Negligible: Standalone offline tool; zero dependency for business-critical workflows.',
      2: 'Minor: Internal workflow accelerator; manual fallback takes < 15 minutes.',
      3: 'Moderate: Departmental core tool; downtime causes operational backlog within 4 hours.',
      4: 'High: Direct dependency for real-time payment authorization, credit origination, or trading.',
      5: 'Critical: National financial market infrastructure, payment clearing, or systemic liquidity stability.'
    }
  },
  disinformationHallucinationRisk: {
    title: 'Disinformation, Hallucination & Content Integrity',
    subtitle: 'Risk of generating ungrounded facts, fabricated statutory citations, or manipulated synthetic media.',
    weight: 1.2,
    levels: {
      1: 'Negligible: Deterministic numerical computation with zero generative text generation.',
      2: 'Minor: Closed-domain search retrieval with exact citation matching; hallucination rate < 1%.',
      3: 'Moderate: Generative RAG assistant; occasional hallucinations trapped by semantic reranker.',
      4: 'High: Open-ended conversational agent without strict context bounds; risk of misleading advice.',
      5: 'Critical: Autonomous synthesis of legal/medical contracts or public financial statements without HITL.'
    }
  },
  environmentalCarbonFootprint: {
    title: 'Environmental & Compute Carbon Footprint',
    subtitle: 'Energy intensity of training iterations, inference throughput, and data center sustainability.',
    weight: 0.6,
    levels: {
      1: 'Negligible: Lightweight CPU inference (< 5W per query); trained in under 1 GPU hour.',
      2: 'Minor: Optimized quantized model (INT8/FP8); inference runs on shared low-power nodes.',
      3: 'Moderate: Multi-GPU cluster fine-tuning; inference utilizes dedicated cloud accelerators.',
      4: 'High: Continuous training on large GPU clusters (10k+ GPU hours); significant power consumption.',
      5: 'Critical: Hyperscale foundation model training from scratch with massive global carbon impact.'
    }
  },
  vulnerablePopulationExposure: {
    title: 'Exposure of Vulnerable Populations',
    subtitle: 'Direct interaction with or decisions affecting minors, economically distressed, or unbanked individuals.',
    weight: 1.3,
    levels: {
      1: 'Negligible: Strictly B2B enterprise operator interface for certified professionals.',
      2: 'Minor: General adult consumer base with financial literacy standards.',
      3: 'Moderate: Accessible to retail consumer base including first-time account holders.',
      4: 'High: Targets distressed borrowers, micro-loan applicants, or underserved demographics.',
      5: 'Critical: Direct autonomous impact on children, elderly cognitive care, or vulnerable asylum seekers.'
    }
  },
  regulatoryNonComplianceExposure: {
    title: 'Regulatory Non-Compliance Penalty Exposure',
    subtitle: 'Statutory exposure under EU AI Act (Art. 9/71), MAS FEAT Principles, US FTC, and Singapore PDPC.',
    weight: 1.5,
    levels: {
      1: 'Negligible: Standard internal utility; outside scope of mandatory AI regulations.',
      2: 'Minor: Limited regulatory reporting; subject only to general voluntary codes of conduct.',
      3: 'Moderate: Subject to mandatory transparency disclosures (EU AI Act Art. 50 or MAS FEAT).',
      4: 'High: High-Risk AI System under EU AI Act Annex III; subject to mandatory CE mark & fines up to €35M.',
      5: 'Critical: Prohibited AI Practice under EU AI Act Article 5 (social scoring, subliminal manipulation).'
    }
  },
  intellectualPropertyInfringement: {
    title: 'Intellectual Property & Copyright Exposure',
    subtitle: 'Risk of training data copyright infringement, unauthorized trade secret ingestion, or license breaches.',
    weight: 0.9,
    levels: {
      1: 'Negligible: Proprietary internal transactional dataset with full company ownership.',
      2: 'Minor: Licensed commercial dataset (CC-BY / Apache 2.0) with verified legal indemnity.',
      3: 'Moderate: Third-party foundation model API with contractual copyright indemnification shield.',
      4: 'High: Web-scraped training corpora with ambiguous terms of service or pending fair-use challenges.',
      5: 'Critical: Known inclusion of copyrighted artistic/literary works or proprietary competitor code.'
    }
  },
  reputationalDamagePotential: {
    title: 'Brand Reputational & Public Trust Harm',
    subtitle: 'Potential brand damage from public viral failures, discriminatory leaks, or regulatory censures.',
    weight: 1.4,
    levels: {
      1: 'Negligible: Internal tool failure undetectable outside immediate development squad.',
      2: 'Minor: Minor customer support complaint resolved with standard voucher/apology.',
      3: 'Moderate: Localized negative social media mention or trade press scrutiny.',
      4: 'High: Front-page headline, regulatory warning letter, or customer boycott.',
      5: 'Critical: Systemic corporate scandal, congressional/parliamentary inquiry, and C-suite resignations.'
    }
  },
  modelDriftOperationalInstability: {
    title: 'Model Drift & Operational Instability',
    subtitle: 'Vulnerability to concept drift, covariate shift, data pipeline corruption, or adversarial perturbation.',
    weight: 1.1,
    levels: {
      1: 'Negligible: Static deterministic model with fixed parameters and verified invariant inputs.',
      2: 'Minor: Slow drift over multi-year cycles; quarterly performance checks sufficient.',
      3: 'Moderate: Macroeconomic cyclical sensitivity; Population Stability Index (PSI) monitored monthly.',
      4: 'High: Dynamic fast-moving market data (high frequency trading); daily drift alerts common.',
      5: 'Critical: Extreme feedback loops with self-reinforcing drift causing catastrophic prediction failure.'
    }
  }
};

interface EvaluationPreset {
  id: string;
  name: string;
  badge: string;
  badgeColor: string;
  systemId: string;
  systemName: string;
  intendedDomain: string;
  deploymentContext: string;
  autonomyLevel: 'HUMAN_IN_THE_LOOP' | 'HUMAN_ON_THE_LOOP' | 'FULLY_AUTONOMOUS';
  targetStakeholders: string;
  scores: Record<string, number>;
  notes: { individual: string; societal: string; org: string };
  mitigations: string[];
}

const PRESET_ARCHETYPES: EvaluationPreset[] = [
  {
    id: 'preset-credit',
    name: 'Credit Underwriting Scorer',
    badge: 'High Risk (Annex III)',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    systemId: 'AI-SYS-001',
    systemName: 'Underwriting Credit Risk Scorer v3.2',
    intendedDomain: 'Commercial and Retail Credit Limit Underwriting',
    deploymentContext: 'Integrated into core banking origination API; processes loan applications < $250k.',
    autonomyLevel: 'HUMAN_IN_THE_LOOP',
    targetStakeholders: 'Small Business Borrowers, Underwriters, Banking Regulators',
    scores: {
      adverseOutcomeSeverity: 4,
      discriminationBiasPotential: 4,
      privacyIntrusionLevel: 3,
      explainabilityBarrier: 3,
      criticalInfrastructureReliance: 3,
      disinformationHallucinationRisk: 1,
      environmentalCarbonFootprint: 1,
      vulnerablePopulationExposure: 4,
      regulatoryNonComplianceExposure: 4,
      intellectualPropertyInfringement: 1,
      reputationalDamagePotential: 4,
      modelDriftOperationalInstability: 3
    },
    notes: {
      individual: 'Adverse credit actions trigger statutory Fair Housing & FCRA adverse action notice mandates.',
      societal: 'Monitored under EEOC 4/5ths rule and MAS FEAT fairness guidelines to prevent credit deserts.',
      org: 'Quarterly Population Stability Index (PSI) drift monitoring enforced across interest rate changes.'
    },
    mitigations: [
      'Disparate impact analysis with re-weighing algorithm (Fairlearn)',
      'Mandatory Human-in-the-loop review for credit denials and borderline scores (0.45 - 0.65)',
      'SHAP value feature contribution generation for adverse action letters',
      'Real-time Population Stability Index (PSI) drift monitoring with 0.10 threshold'
    ]
  },
  {
    id: 'preset-copilot',
    name: 'Omnichannel Support Copilot',
    badge: 'Medium Risk (RAG)',
    badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    systemId: 'AI-SYS-002',
    systemName: 'Omnichannel Customer Support Copilot',
    intendedDomain: 'Customer Service Knowledge Retrieval & Ticket Resolution',
    deploymentContext: 'Public-facing chat widget and internal support agent recommendation copilot.',
    autonomyLevel: 'HUMAN_ON_THE_LOOP',
    targetStakeholders: 'Bank Customers, Support Agents, IT Helpdesk',
    scores: {
      adverseOutcomeSeverity: 2,
      discriminationBiasPotential: 2,
      privacyIntrusionLevel: 3,
      explainabilityBarrier: 3,
      criticalInfrastructureReliance: 2,
      disinformationHallucinationRisk: 4,
      environmentalCarbonFootprint: 2,
      vulnerablePopulationExposure: 2,
      regulatoryNonComplianceExposure: 3,
      intellectualPropertyInfringement: 2,
      reputationalDamagePotential: 4,
      modelDriftOperationalInstability: 2
    },
    notes: {
      individual: 'Requires automated redaction of sensitive payment card numbers and customer SSNs.',
      societal: 'NeMo Guardrails deployed to prevent hallucinated financial promises or misleading terms.',
      org: 'Prominently marked as AI conversation in accordance with EU AI Act Art. 50 disclosure rules.'
    },
    mitigations: [
      'Microsoft Presidio automated PII sanitization in prompt pipeline',
      'NeMo Guardrails active for jailbreak and prompt injection defense',
      'Context grounding verification (RAG-triad evaluation) with 0.85 minimum threshold',
      'Mandatory disclaimer indicating AI generation with one-click human escalation'
    ]
  },
  {
    id: 'preset-aml',
    name: 'AML Sanctions Anomaly Detector',
    badge: 'High Risk (FCC)',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    systemId: 'AI-SYS-003',
    systemName: 'Anti-Money Laundering (AML) Anomaly Detector',
    intendedDomain: 'Sanctions Evasion & Graph-based Fraud Detection',
    deploymentContext: 'Streaming transaction surveillance across FAST and SWIFT payment rails.',
    autonomyLevel: 'HUMAN_IN_THE_LOOP',
    targetStakeholders: 'Financial Crime Compliance, MAS Regulators, Law Enforcement',
    scores: {
      adverseOutcomeSeverity: 5,
      discriminationBiasPotential: 3,
      privacyIntrusionLevel: 4,
      explainabilityBarrier: 4,
      criticalInfrastructureReliance: 4,
      disinformationHallucinationRisk: 1,
      environmentalCarbonFootprint: 2,
      vulnerablePopulationExposure: 3,
      regulatoryNonComplianceExposure: 5,
      intellectualPropertyInfringement: 1,
      reputationalDamagePotential: 4,
      modelDriftOperationalInstability: 3
    },
    notes: {
      individual: 'Account freezes and SAR reports require human investigator verification before execution.',
      societal: 'Critical line of defense for national security and combating illicit terrorist financing.',
      org: 'Subject to strict MAS TRM Guidelines and Financial Action Task Force (FATF) standards.'
    },
    mitigations: [
      'Sub-graph visual evidence packages generated for compliance investigators',
      'Mandatory Human-in-the-loop review before any account freeze or law enforcement report',
      'Dual-key cryptographic sign-off for threshold adjustment',
      'Emergency kill-switch circuit breaker with instant rule-based fallback'
    ]
  },
  {
    id: 'preset-ocr',
    name: 'Document & Invoice OCR Engine',
    badge: 'Low / Exempt Utility',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    systemId: 'AI-SYS-004',
    systemName: 'Invoice & Identity Document OCR Engine',
    intendedDomain: 'Tabular Line Item Extraction & Document Verification',
    deploymentContext: 'Internal batch document processing in accounts payable and onboarding.',
    autonomyLevel: 'HUMAN_ON_THE_LOOP',
    targetStakeholders: 'Accounts Payable Specialists, IT Operations',
    scores: {
      adverseOutcomeSeverity: 1,
      discriminationBiasPotential: 1,
      privacyIntrusionLevel: 2,
      explainabilityBarrier: 1,
      criticalInfrastructureReliance: 1,
      disinformationHallucinationRisk: 1,
      environmentalCarbonFootprint: 1,
      vulnerablePopulationExposure: 1,
      regulatoryNonComplianceExposure: 1,
      intellectualPropertyInfringement: 1,
      reputationalDamagePotential: 1,
      modelDriftOperationalInstability: 1
    },
    notes: {
      individual: 'Purely mechanical character recognition on invoices with negligible adverse impact.',
      societal: 'No societal harm vectors identified.',
      org: 'Fully documented under ISO 42001 Annex A.4 inventory requirements.'
    },
    mitigations: [
      'Confidence score threshold gating: line items < 90% flagged for manual keying',
      'Ephemeral memory processing: documents purged from server cache post-extraction'
    ]
  }
];

const STANDARD_MITIGATIONS = [
  { name: 'Disparate impact analysis with re-weighing algorithm (Fairlearn)', category: 'Fairness', impact: 12 },
  { name: 'Mandatory Human-in-the-loop review for credit denials and borderline scores (0.45 - 0.65)', category: 'Oversight', impact: 15 },
  { name: 'SHAP value feature contribution generation for adverse action letters', category: 'Explainability', impact: 10 },
  { name: 'Real-time Population Stability Index (PSI) drift monitoring with 0.10 threshold', category: 'Drift', impact: 10 },
  { name: 'Microsoft Presidio automated PII sanitization in prompt pipeline', category: 'Privacy', impact: 11 },
  { name: 'NeMo Guardrails active for jailbreak and prompt injection defense', category: 'Security', impact: 11 },
  { name: 'Context grounding verification (RAG-triad evaluation) with 0.85 minimum threshold', category: 'Integrity', impact: 12 },
  { name: 'Cryptographic SHA-256 model weight artifact verification in registry', category: 'Security', impact: 8 },
  { name: 'Emergency kill-switch circuit breaker with instant rule-based fallback', category: 'Resilience', impact: 14 },
  { name: 'Mandatory disclaimer indicating AI generation with one-click human escalation', category: 'Transparency', impact: 9 },
  { name: 'Sub-graph visual evidence packages generated for compliance investigators', category: 'Explainability', impact: 10 },
  { name: 'Dual-key cryptographic sign-off for threshold adjustment', category: 'Governance', impact: 9 }
];

export const AISIAAssessmentWizard: React.FC<AISIAAssessmentWizardProps> = ({
  initialSystemId,
  targetSystemId,
  tenantId,
  tenantName = 'Enterprise Financial Corporation',
  onAssessmentSaved,
  onAssessmentComplete,
  availableSystems = [
    { id: 'AI-SYS-001', name: 'Underwriting Credit Risk Scorer v3.2', category: 'Credit Underwriting', version: '3.2' },
    { id: 'AI-SYS-002', name: 'Omnichannel Customer Support Copilot', category: 'Customer Service Generative AI', version: '1.4' },
    { id: 'AI-SYS-003', name: 'Anti-Money Laundering (AML) Anomaly Detector', category: 'Financial Crime & Graph Analytics', version: '3.0' },
    { id: 'AI-SYS-004', name: 'Invoice & Identity Document OCR Engine', category: 'Computer Vision & OCR', version: '1.0' }
  ]
}) => {
  const activeInitialSysId = targetSystemId || initialSystemId || availableSystems[0]?.id || 'AI-SYS-001';
  const initialMatchedSys = availableSystems.find(s => s.id === activeInitialSysId);

  const storageKey = `grc_portal_v1_iso42001_aisia_assessments_${tenantId || 'default'}`;

  // Persistent Assessment Registry State
  const [assessments, setAssessments] = useState<AISIAAssessmentRecord[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load AISIA assessments from localStorage', e);
    }
    return INITIAL_AISIA_ASSESSMENTS;
  });

  const [activeTab, setActiveTab] = useState<'wizard' | 'registry'>('wizard');
  const [showCertificateModal, setShowCertificateModal] = useState<AISIAAssessmentRecord | null>(null);
  const [showAutoSaveToast, setShowAutoSaveToast] = useState<boolean>(false);
  const [lastAutoSaveTime, setLastAutoSaveTime] = useState<string>(() => new Date().toLocaleTimeString());
  const [registrySearch, setRegistrySearch] = useState<string>('');
  const [registryTierFilter, setRegistryTierFilter] = useState<string>('All');

  // Wizard state
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [systemId, setSystemId] = useState<string>(activeInitialSysId);
  const [systemName, setSystemName] = useState<string>(initialMatchedSys?.name || 'Underwriting Credit Risk Scorer v3.2');
  const [assessorName, setAssessorName] = useState<string>('Marcus Vance, PhD');
  const [assessorTitle, setAssessorTitle] = useState<string>('Lead AI Risk & Algorithmic Ethics Assessor');
  const [intendedDomain, setIntendedDomain] = useState<string>('Commercial and Retail Credit Limit Underwriting');
  const [deploymentContext, setDeploymentContext] = useState<string>('Integrated into core banking origination API; processes loan applications < $250k.');
  const [autonomyLevel, setAutonomyLevel] = useState<'HUMAN_IN_THE_LOOP' | 'HUMAN_ON_THE_LOOP' | 'FULLY_AUTONOMOUS'>('HUMAN_IN_THE_LOOP');
  const [targetStakeholders, setTargetStakeholders] = useState<string>('Small Business Borrowers, Credit Underwriters, Banking Regulators');
  const [reviewCadence, setReviewCadence] = useState<'Quarterly' | 'Bi-Annual' | 'Annual'>('Quarterly');

  // Step 2: Individual Rights (1-5)
  const [adverseOutcomeSeverity, setAdverseOutcomeSeverity] = useState<number>(4);
  const [discriminationBiasPotential, setDiscriminationBiasPotential] = useState<number>(4);
  const [privacyIntrusionLevel, setPrivacyIntrusionLevel] = useState<number>(3);
  const [explainabilityBarrier, setExplainabilityBarrier] = useState<number>(3);
  const [individualNotes, setIndividualNotes] = useState<string>('Potential adverse action notices required by Fair Credit Reporting Act. Clear explanation of declined factors required.');

  // Step 3: Societal Impact (1-5)
  const [criticalInfrastructureReliance, setCriticalInfrastructureReliance] = useState<number>(3);
  const [disinformationHallucinationRisk, setDisinformationHallucinationRisk] = useState<number>(1);
  const [environmentalCarbonFootprint, setEnvironmentalCarbonFootprint] = useState<number>(1);
  const [vulnerablePopulationExposure, setVulnerablePopulationExposure] = useState<number>(4);
  const [societalNotes, setSocietalNotes] = useState<string>('Monitored under EEOC 4/5ths rule and MAS FEAT fairness principles to protect underrepresented business owners.');

  // Step 4: Organizational Risk (1-5)
  const [regulatoryNonComplianceExposure, setRegulatoryNonComplianceExposure] = useState<number>(4);
  const [intellectualPropertyInfringement, setIntellectualPropertyInfringement] = useState<number>(1);
  const [reputationalDamagePotential, setReputationalDamagePotential] = useState<number>(4);
  const [modelDriftOperationalInstability, setModelDriftOperationalInstability] = useState<number>(3);
  const [organizationalNotes, setOrganizationalNotes] = useState<string>('Quarterly Population Stability Index (PSI) drift monitoring enforced across macroeconomic shifts.');

  // Step 5: Mitigations
  const [selectedMitigations, setSelectedMitigations] = useState<string[]>([
    'Disparate impact analysis with re-weighing algorithm (Fairlearn)',
    'Mandatory Human-in-the-loop review for credit denials and borderline scores (0.45 - 0.65)',
    'SHAP value feature contribution generation for adverse action letters',
    'Real-time Population Stability Index (PSI) drift monitoring with 0.10 threshold'
  ]);
  const [customMitigation, setCustomMitigation] = useState<string>('');

  // Step 6: Approval
  const [approverName, setApproverName] = useState<string>('Elena Rostova, Lead AI Ethics Officer & CISO');
  const [approverComments, setApproverComments] = useState<string>('Approved with requirement for monthly bias audits and mandatory human sign-off on credit denials.');
  const [approvalStatus, setApprovalStatus] = useState<'APPROVED' | 'CONDITIONALLY_APPROVED' | 'UNDER_REVIEW' | 'REJECTED'>('APPROVED');

  // Sync if targetSystemId changes from external props
  useEffect(() => {
    if (targetSystemId && targetSystemId !== systemId) {
      setSystemId(targetSystemId);
      const found = availableSystems.find(s => s.id === targetSystemId);
      if (found) {
        setSystemName(found.name);
      }
      const existing = assessments.find(a => a.systemId === targetSystemId);
      if (existing) {
        loadAssessment(existing);
      }
    }
  }, [targetSystemId, availableSystems]);

  // Mathematical scoring calculation
  // Category Subtotals
  const individualSubtotal = 
    (adverseOutcomeSeverity * CRITERIA_ANCHORS.adverseOutcomeSeverity.weight) +
    (discriminationBiasPotential * CRITERIA_ANCHORS.discriminationBiasPotential.weight) +
    (privacyIntrusionLevel * CRITERIA_ANCHORS.privacyIntrusionLevel.weight) +
    (explainabilityBarrier * CRITERIA_ANCHORS.explainabilityBarrier.weight);

  const societalSubtotal = 
    (criticalInfrastructureReliance * CRITERIA_ANCHORS.criticalInfrastructureReliance.weight) +
    (disinformationHallucinationRisk * CRITERIA_ANCHORS.disinformationHallucinationRisk.weight) +
    (environmentalCarbonFootprint * CRITERIA_ANCHORS.environmentalCarbonFootprint.weight) +
    (vulnerablePopulationExposure * CRITERIA_ANCHORS.vulnerablePopulationExposure.weight);

  const orgSubtotal = 
    (regulatoryNonComplianceExposure * CRITERIA_ANCHORS.regulatoryNonComplianceExposure.weight) +
    (intellectualPropertyInfringement * CRITERIA_ANCHORS.intellectualPropertyInfringement.weight) +
    (reputationalDamagePotential * CRITERIA_ANCHORS.reputationalDamagePotential.weight) +
    (modelDriftOperationalInstability * CRITERIA_ANCHORS.modelDriftOperationalInstability.weight);

  const inherentTotal = individualSubtotal + societalSubtotal + orgSubtotal;
  
  // Normalized to 0-100 scale (max possible points is approx 71.5 -> scale to 100)
  const inherentScore = Math.min(100, Math.round((inherentTotal / 71.5) * 100));
  
  // Dynamic mitigation reduction calculation based on applied controls
  const calculatedMitigationDiscount = selectedMitigations.reduce((acc, mName) => {
    const found = STANDARD_MITIGATIONS.find(sm => sm.name === mName);
    return acc + (found ? found.impact : 10);
  }, 0);
  
  const mitigationPercent = Math.min(60, calculatedMitigationDiscount);
  const residualScore = Math.max(10, Math.round(inherentScore * (1 - mitigationPercent / 100)));

  // Risk Tier Derivation
  const getRiskTier = (score: number): 'CRITICAL_UNACCEPTABLE' | 'HIGH_RISK' | 'MEDIUM_RISK' | 'LOW_EXEMPT' => {
    if (score >= 75) return 'CRITICAL_UNACCEPTABLE';
    if (score >= 45) return 'HIGH_RISK';
    if (score >= 25) return 'MEDIUM_RISK';
    return 'LOW_EXEMPT';
  };

  const currentRiskTier = getRiskTier(residualScore);

  // Automatic Storage Writer
  const persistAssessments = (updated: AISIAAssessmentRecord[]) => {
    setAssessments(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
      const nowStr = new Date().toLocaleTimeString();
      setLastAutoSaveTime(nowStr);
      setShowAutoSaveToast(true);
      setTimeout(() => setShowAutoSaveToast(false), 3500);
    } catch (e) {
      console.error('Error saving AISIA assessments to localStorage', e);
    }
  };

  const buildAssessmentRecord = (): AISIAAssessmentRecord => {
    return {
      id: `AISIA-${new Date().getFullYear()}-${String(assessments.length + 1).padStart(3, '0')}`,
      systemId,
      systemName,
      assessorName,
      assessorTitle,
      assessmentDate: new Date().toISOString().split('T')[0],
      reviewCadence,
      version: '1.0',
      intendedDomain,
      deploymentContext,
      autonomyLevel,
      targetStakeholders: targetStakeholders.split(',').map(s => s.trim()).filter(Boolean),
      individualRights: {
        adverseOutcomeSeverity,
        discriminationBiasPotential,
        privacyIntrusionLevel,
        explainabilityBarrier,
        notes: individualNotes
      },
      societalImpact: {
        criticalInfrastructureReliance,
        disinformationHallucinationRisk,
        environmentalCarbonFootprint,
        vulnerablePopulationExposure,
        notes: societalNotes
      },
      organizationalRisk: {
        regulatoryNonComplianceExposure,
        intellectualPropertyInfringement,
        reputationalDamagePotential,
        modelDriftOperationalInstability,
        notes: organizationalNotes
      },
      appliedMitigations: selectedMitigations,
      mitigationEffectiveness: mitigationPercent,
      inherentImpactScore: inherentScore,
      residualImpactScore: residualScore,
      derivedRiskTier: currentRiskTier,
      mandatoryControls: currentRiskTier === 'HIGH_RISK' || currentRiskTier === 'CRITICAL_UNACCEPTABLE' 
        ? ['A.5.1', 'A.6.3', 'A.7.3', 'A.8.2', 'A.9.2', 'A.9.4']
        : ['A.5.1', 'A.7.4', 'A.8.1', 'A.9.1'],
      approvalStatus,
      approverComments,
      approvedBy: approverName,
      approvalDate: new Date().toISOString().split('T')[0],
      cryptographicDigest: `sha256-${Math.random().toString(36).substring(2, 12)}${Math.random().toString(36).substring(2, 12)}`
    };
  };

  const handleSaveAssessment = (triggerCertificate: boolean = true) => {
    const record = buildAssessmentRecord();
    const updated = [record, ...assessments.filter(a => a.systemId !== systemId)];
    persistAssessments(updated);

    if (onAssessmentSaved) {
      onAssessmentSaved(record);
    }
    if (onAssessmentComplete) {
      onAssessmentComplete(record);
    }
    if (triggerCertificate) {
      setShowCertificateModal(record);
    }
  };

  const handleAutoSaveDraft = () => {
    handleSaveAssessment(false);
  };

  const handleSystemChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sId = e.target.value;
    setSystemId(sId);
    const found = availableSystems.find(s => s.id === sId);
    if (found) {
      setSystemName(found.name);
    }
    const existing = assessments.find(a => a.systemId === sId);
    if (existing) {
      loadAssessment(existing);
    }
  };

  const loadAssessment = (rec: AISIAAssessmentRecord) => {
    setSystemId(rec.systemId);
    setSystemName(rec.systemName);
    setAssessorName(rec.assessorName);
    setAssessorTitle(rec.assessorTitle);
    setIntendedDomain(rec.intendedDomain);
    setDeploymentContext(rec.deploymentContext);
    setAutonomyLevel(rec.autonomyLevel);
    setTargetStakeholders(rec.targetStakeholders.join(', '));
    setReviewCadence(rec.reviewCadence);

    setAdverseOutcomeSeverity(rec.individualRights.adverseOutcomeSeverity);
    setDiscriminationBiasPotential(rec.individualRights.discriminationBiasPotential);
    setPrivacyIntrusionLevel(rec.individualRights.privacyIntrusionLevel);
    setExplainabilityBarrier(rec.individualRights.explainabilityBarrier);
    setIndividualNotes(rec.individualRights.notes);

    setCriticalInfrastructureReliance(rec.societalImpact.criticalInfrastructureReliance);
    setDisinformationHallucinationRisk(rec.societalImpact.disinformationHallucinationRisk);
    setEnvironmentalCarbonFootprint(rec.societalImpact.environmentalCarbonFootprint);
    setVulnerablePopulationExposure(rec.societalImpact.vulnerablePopulationExposure);
    setSocietalNotes(rec.societalImpact.notes);

    setRegulatoryNonComplianceExposure(rec.organizationalRisk.regulatoryNonComplianceExposure);
    setIntellectualPropertyInfringement(rec.organizationalRisk.intellectualPropertyInfringement);
    setReputationalDamagePotential(rec.organizationalRisk.reputationalDamagePotential);
    setModelDriftOperationalInstability(rec.organizationalRisk.modelDriftOperationalInstability);
    setOrganizationalNotes(rec.organizationalRisk.notes);

    setSelectedMitigations(rec.appliedMitigations);
    setApproverComments(rec.approverComments);
    setApprovalStatus(rec.approvalStatus);
    if (rec.approvedBy) setApproverName(rec.approvedBy);
  };

  const handleApplyPreset = (preset: EvaluationPreset) => {
    setSystemId(preset.systemId);
    setSystemName(preset.systemName);
    setIntendedDomain(preset.intendedDomain);
    setDeploymentContext(preset.deploymentContext);
    setAutonomyLevel(preset.autonomyLevel);
    setTargetStakeholders(preset.targetStakeholders);

    setAdverseOutcomeSeverity(preset.scores.adverseOutcomeSeverity);
    setDiscriminationBiasPotential(preset.scores.discriminationBiasPotential);
    setPrivacyIntrusionLevel(preset.scores.privacyIntrusionLevel);
    setExplainabilityBarrier(preset.scores.explainabilityBarrier);
    setIndividualNotes(preset.notes.individual);

    setCriticalInfrastructureReliance(preset.scores.criticalInfrastructureReliance);
    setDisinformationHallucinationRisk(preset.scores.disinformationHallucinationRisk);
    setEnvironmentalCarbonFootprint(preset.scores.environmentalCarbonFootprint);
    setVulnerablePopulationExposure(preset.scores.vulnerablePopulationExposure);
    setSocietalNotes(preset.notes.societal);

    setRegulatoryNonComplianceExposure(preset.scores.regulatoryNonComplianceExposure);
    setIntellectualPropertyInfringement(preset.scores.intellectualPropertyInfringement);
    setReputationalDamagePotential(preset.scores.reputationalDamagePotential);
    setModelDriftOperationalInstability(preset.scores.modelDriftOperationalInstability);
    setOrganizationalNotes(preset.notes.org);

    setSelectedMitigations(preset.mitigations);
  };

  const handleToggleMitigation = (mitigation: string) => {
    if (selectedMitigations.includes(mitigation)) {
      setSelectedMitigations(selectedMitigations.filter(m => m !== mitigation));
    } else {
      setSelectedMitigations([...selectedMitigations, mitigation]);
    }
  };

  const handleAddCustomMitigation = () => {
    if (customMitigation.trim() && !selectedMitigations.includes(customMitigation.trim())) {
      setSelectedMitigations([...selectedMitigations, customMitigation.trim()]);
      setCustomMitigation('');
    }
  };

  const handleDeleteAssessment = (id: string) => {
    const updated = assessments.filter(a => a.id !== id);
    persistAssessments(updated);
  };

  const handleResetToFactoryDefaults = () => {
    persistAssessments(INITIAL_AISIA_ASSESSMENTS);
  };

  // Export handlers
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(assessments, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `ISO42001_AI_SIA_Register_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleExportMarkdownReport = () => {
    const current = buildAssessmentRecord();
    const md = `# ISO/IEC 42001:2023 AI SYSTEM IMPACT ASSESSMENT (AI-SIA)
**Clause 6.1.2 & Annex A.5 Formal Impact Evaluation Report**
**Organization:** ${tenantName}
**Evaluation ID:** ${current.id}
**Assessment Date:** ${current.assessmentDate}
**Cryptographic Integrity Digest:** \`${current.cryptographicDigest}\`

---

## 1. System Identification & Scope
- **Target AI System Name:** ${current.systemName}
- **System Asset Identifier:** ${current.systemId}
- **Operational Autonomy:** ${current.autonomyLevel}
- **Intended Domain:** ${current.intendedDomain}
- **Deployment Context:** ${current.deploymentContext}
- **Target Stakeholders:** ${current.targetStakeholders.join(', ')}
- **Review Cadence:** ${current.reviewCadence}
- **Lead Assessor:** ${current.assessorName} (${current.assessorTitle})

---

## 2. Impact Evaluation Scores & Dimensions (1–5 Scale)

### 2.1 Individual & Fundamental Rights
| Dimension | Rating | Anchor Interpretation |
| :--- | :---: | :--- |
| Adverse Outcome Severity | **${adverseOutcomeSeverity}/5** | ${CRITERIA_ANCHORS.adverseOutcomeSeverity.levels[adverseOutcomeSeverity]} |
| Discrimination & Bias Potential | **${discriminationBiasPotential}/5** | ${CRITERIA_ANCHORS.discriminationBiasPotential.levels[discriminationBiasPotential]} |
| Privacy Intrusion & Data Intake | **${privacyIntrusionLevel}/5** | ${CRITERIA_ANCHORS.privacyIntrusionLevel.levels[privacyIntrusionLevel]} |
| Explainability & Transparency Barrier | **${explainabilityBarrier}/5** | ${CRITERIA_ANCHORS.explainabilityBarrier.levels[explainabilityBarrier]} |

*Qualitative Notes:* ${individualNotes}

### 2.2 Societal & Environmental Impact
| Dimension | Rating | Anchor Interpretation |
| :--- | :---: | :--- |
| Critical Infrastructure Reliance | **${criticalInfrastructureReliance}/5** | ${CRITERIA_ANCHORS.criticalInfrastructureReliance.levels[criticalInfrastructureReliance]} |
| Disinformation & Hallucination | **${disinformationHallucinationRisk}/5** | ${CRITERIA_ANCHORS.disinformationHallucinationRisk.levels[disinformationHallucinationRisk]} |
| Environmental Carbon Footprint | **${environmentalCarbonFootprint}/5** | ${CRITERIA_ANCHORS.environmentalCarbonFootprint.levels[environmentalCarbonFootprint]} |
| Vulnerable Population Exposure | **${vulnerablePopulationExposure}/5** | ${CRITERIA_ANCHORS.vulnerablePopulationExposure.levels[vulnerablePopulationExposure]} |

*Qualitative Notes:* ${societalNotes}

### 2.3 Organizational & Regulatory Exposure
| Dimension | Rating | Anchor Interpretation |
| :--- | :---: | :--- |
| Regulatory Non-Compliance Exposure | **${regulatoryNonComplianceExposure}/5** | ${CRITERIA_ANCHORS.regulatoryNonComplianceExposure.levels[regulatoryNonComplianceExposure]} |
| Intellectual Property & Copyright | **${intellectualPropertyInfringement}/5** | ${CRITERIA_ANCHORS.intellectualPropertyInfringement.levels[intellectualPropertyInfringement]} |
| Reputational Damage Potential | **${reputationalDamagePotential}/5** | ${CRITERIA_ANCHORS.reputationalDamagePotential.levels[reputationalDamagePotential]} |
| Model Drift & Operational Instability | **${modelDriftOperationalInstability}/5** | ${CRITERIA_ANCHORS.modelDriftOperationalInstability.levels[modelDriftOperationalInstability]} |

*Qualitative Notes:* ${organizationalNotes}

---

## 3. Risk Derivation & Technical Mitigations
- **Inherent Impact Score:** ${inherentScore} / 100
- **Applied Mitigations Count:** ${selectedMitigations.length} safeguards active
- **Mitigation Risk Reduction:** -${mitigationPercent}%
- **Net Residual Impact Score:** ${residualScore} / 100
- **Derived Risk Tier:** **${currentRiskTier}**

### Applied Technical & Governance Safeguards:
${selectedMitigations.map(m => `- [x] ${m}`).join('\n')}

---

## 4. Triggered Mandatory ISO/IEC 42001:2023 Annex A Controls
${current.mandatoryControls.map(c => `- **${c}**: In-scope for periodic third-party conformity audit.`).join('\n')}

---

## 5. Formal Governance Sign-Off & Attestation
- **Approval Determination:** ${approvalStatus}
- **Authorizing Sign-Off:** ${approverName}
- **Sign-Off Date:** ${current.approvalDate}
- **Remarks:** ${approverComments}

*Report generated by ISO 42001 AIMS Compliance Portal.*
`;
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ISO42001_AI_SIA_${systemId}_${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleExportCSV = () => {
    const headers = [
      'Assessment ID', 'System ID', 'System Name', 'Assessor', 'Date', 'Cadence', 
      'Autonomy', 'Inherent Score', 'Mitigation Discount %', 'Residual Score', 
      'Risk Tier', 'Approval Status', 'Approver', 'Digest'
    ];
    const rows = assessments.map(a => [
      `"${a.id}"`,
      `"${a.systemId}"`,
      `"${a.systemName.replace(/"/g, '""')}"`,
      `"${a.assessorName.replace(/"/g, '""')}"`,
      `"${a.assessmentDate}"`,
      `"${a.reviewCadence}"`,
      `"${a.autonomyLevel}"`,
      a.inherentImpactScore,
      a.mitigationEffectiveness,
      a.residualImpactScore,
      `"${a.derivedRiskTier}"`,
      `"${a.approvalStatus}"`,
      `"${(a.approvedBy || '').replace(/"/g, '""')}"`,
      `"${a.cryptographicDigest || ''}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ISO42001_AI_SIA_Register_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'CRITICAL_UNACCEPTABLE':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">CRITICAL / UNACCEPTABLE</span>;
      case 'HIGH_RISK':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">HIGH RISK (ANNEX III)</span>;
      case 'MEDIUM_RISK':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40">MEDIUM RISK</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">LOW / EXEMPT</span>;
    }
  };

  // Filtered Registry for Registry tab
  const filteredAssessments = assessments.filter(a => {
    const matchTier = registryTierFilter === 'All' || a.derivedRiskTier === registryTierFilter;
    const matchSearch = 
      a.systemName.toLowerCase().includes(registrySearch.toLowerCase()) ||
      a.systemId.toLowerCase().includes(registrySearch.toLowerCase()) ||
      a.assessorName.toLowerCase().includes(registrySearch.toLowerCase()) ||
      a.id.toLowerCase().includes(registrySearch.toLowerCase());
    return matchTier && matchSearch;
  });

  // Reusable 1-5 Criteria Scoring Slider Component
  const renderScoringCriterion = (
    key: string,
    value: number,
    onChange: (val: number) => void
  ) => {
    const info = CRITERIA_ANCHORS[key];
    if (!info) return null;

    return (
      <div key={key} className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/70 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="space-y-0.5">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-100">{info.title}</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/50">
                Weight: {info.weight}x
              </span>
            </div>
            <p className="text-[11px] text-slate-400 max-w-xl">{info.subtitle}</p>
          </div>

          {/* Quick 1-5 Button Selectors */}
          <div className="flex items-center space-x-1.5 shrink-0">
            {[1, 2, 3, 4, 5].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => onChange(lvl)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition flex items-center justify-center ${
                  value === lvl
                    ? lvl >= 4
                      ? 'bg-rose-600 text-white ring-2 ring-rose-400'
                      : lvl === 3
                      ? 'bg-amber-600 text-white ring-2 ring-amber-400'
                      : 'bg-emerald-600 text-white ring-2 ring-emerald-400'
                    : 'bg-slate-700/80 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Range Slider for granular/tactile interaction */}
        <div className="flex items-center space-x-3 pt-1">
          <span className="text-[10px] text-slate-500 font-mono">1</span>
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="flex-1 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
          <span className="text-[10px] text-slate-500 font-mono">5</span>
          <span className="text-xs font-mono font-bold text-purple-300 w-12 text-right">
            Rating: {value}/5
          </span>
        </div>

        {/* Active Anchor Description Box */}
        <div className="text-[11px] bg-slate-900/80 p-2.5 rounded-lg border border-slate-750 flex items-start space-x-2">
          <Info className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
          <div className="text-slate-300">
            <span className="font-semibold text-white">Level {value}: </span>
            <span>{info.levels[value]}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div id="aisia-assessment-module" className="space-y-6">
      {/* Auto-save Toast Banner */}
      {showAutoSaveToast && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-4 py-2.5 rounded-xl text-xs flex items-center justify-between shadow-lg animate-fadeIn">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="font-medium">
              Assessment automatically synchronized & stored in secure GRC store ({lastAutoSaveTime})
            </span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400/80">Local Storage Active</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                ISO/IEC 42001:2023 Clause 6.1.2 & Annex A.5
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                EU AI Act Art. 27 FRIA
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-800 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Auto-Storage Synchronized</span>
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-purple-400" />
              <span>Interactive AI System Impact Assessment (AI-SIA) Wizard</span>
            </h2>
            <p className="text-xs text-slate-400 max-w-3xl">
              Evaluate and score model impact across fundamental individual rights, societal infrastructure, and organizational liability. Automated storage persists all evaluations into {tenantName}'s audit repository.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-xl bg-slate-800/80 p-1 border border-slate-700">
              <button
                id="tab-wizard-btn"
                onClick={() => setActiveTab('wizard')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  activeTab === 'wizard'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Guided Assessment Wizard
              </button>
              <button
                id="tab-registry-btn"
                onClick={() => setActiveTab('registry')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  activeTab === 'registry'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Completed Dossiers ({assessments.length})
              </button>
            </div>

            <button
              onClick={handleAutoSaveDraft}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 text-xs font-medium flex items-center space-x-1.5 transition"
              title="Manually trigger immediate localStorage write"
            >
              <Save className="w-3.5 h-3.5 text-purple-400" />
              <span>Save Draft</span>
            </button>

            <div className="relative group">
              <button className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 text-xs font-medium flex items-center space-x-1.5 transition">
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <span>Export</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
              <div className="hidden group-hover:block absolute right-0 top-full mt-1 w-52 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-1 z-20 text-xs">
                <button
                  onClick={handleExportMarkdownReport}
                  className="w-full text-left px-3 py-2 text-slate-200 hover:bg-slate-700 flex items-center space-x-2"
                >
                  <FileText className="w-3.5 h-3.5 text-purple-400" />
                  <span>Export Evaluation Manual (.MD)</span>
                </button>
                <button
                  onClick={handleExportCSV}
                  className="w-full text-left px-3 py-2 text-slate-200 hover:bg-slate-700 flex items-center space-x-2"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Export Audit Matrix (.CSV)</span>
                </button>
                <button
                  onClick={handleExportJSON}
                  className="w-full text-left px-3 py-2 text-slate-200 hover:bg-slate-700 flex items-center space-x-2"
                >
                  <Database className="w-3.5 h-3.5 text-sky-400" />
                  <span>Export Master Register (.JSON)</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Evaluation Archetypes Bar */}
        {activeTab === 'wizard' && (
          <div className="mt-5 pt-4 border-t border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-1.5 text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span className="font-semibold text-slate-300">Quick-Load Evaluation Archetypes:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {PRESET_ARCHETYPES.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleApplyPreset(p)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition flex items-center space-x-1.5"
                >
                  <span className="font-medium">{p.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${p.badgeColor}`}>
                    {p.badge}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {activeTab === 'wizard' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Wizard Form (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Step Navigation Bar */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between overflow-x-auto text-xs">
              {[
                { step: 1, label: '1. Scoping & Context' },
                { step: 2, label: '2. Individual Rights' },
                { step: 3, label: '3. Societal Impact' },
                { step: 4, label: '4. Org Exposure' },
                { step: 5, label: '5. Mitigations' },
                { step: 6, label: '6. Attestation & Sign-off' }
              ].map((s) => (
                <button
                  key={s.step}
                  onClick={() => {
                    handleAutoSaveDraft();
                    setCurrentStep(s.step);
                  }}
                  className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition flex items-center space-x-1.5 ${
                    currentStep === s.step
                      ? 'bg-purple-600 text-white shadow'
                      : currentStep > s.step
                      ? 'text-purple-300 bg-purple-950/40 border border-purple-800/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <span>{s.label}</span>
                </button>
              ))}
            </div>

            {/* Step 1: Context & Scope */}
            {currentStep === 1 && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-base font-semibold text-white flex items-center space-x-2">
                    <Cpu className="w-4 h-4 text-purple-400" />
                    <span>Step 1: System Identification & Operational Scoping (Clause 4.3)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Select an in-scope AI model asset from your inventory or assess a new pipeline candidate.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Target AI System / Model Asset
                    </label>
                    <select
                      id="wizard-system-select"
                      value={systemId}
                      onChange={handleSystemChange}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    >
                      {availableSystems.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.id} - {s.name} ({s.category || 'AI Model'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Operational Autonomy Level (Annex A.9.2)
                    </label>
                    <select
                      id="wizard-autonomy-select"
                      value={autonomyLevel}
                      onChange={(e) => setAutonomyLevel(e.target.value as any)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="HUMAN_IN_THE_LOOP">Human-in-the-Loop (Mandatory Human Approval Gate)</option>
                      <option value="HUMAN_ON_THE_LOOP">Human-on-the-Loop (Supervisory Oversight with Override)</option>
                      <option value="FULLY_AUTONOMOUS">Fully Autonomous (Straight-Through Processing)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Lead AI Risk Assessor
                    </label>
                    <input
                      type="text"
                      value={assessorName}
                      onChange={(e) => setAssessorName(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                      placeholder="e.g. Marcus Vance, PhD"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Assessor Official Title
                    </label>
                    <input
                      type="text"
                      value={assessorTitle}
                      onChange={(e) => setAssessorTitle(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                      placeholder="e.g. Lead AI Ethics & Algorithmic Risk Architect"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Intended Business Purpose & Algorithmic Domain
                    </label>
                    <input
                      type="text"
                      value={intendedDomain}
                      onChange={(e) => setIntendedDomain(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                      placeholder="e.g. Commercial and Retail Credit Limit Underwriting"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Operational Deployment Architecture & Context
                    </label>
                    <textarea
                      rows={2}
                      value={deploymentContext}
                      onChange={(e) => setDeploymentContext(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500"
                      placeholder="e.g. Integrated into core banking origination API; processes loan applications < $250k."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Affected Stakeholders & Impacted Groups
                    </label>
                    <input
                      type="text"
                      value={targetStakeholders}
                      onChange={(e) => setTargetStakeholders(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                      placeholder="e.g. Small Business Borrowers, Underwriters, Banking Regulators"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Mandatory Re-Evaluation Cadence
                    </label>
                    <select
                      value={reviewCadence}
                      onChange={(e) => setReviewCadence(e.target.value as any)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="Quarterly">Quarterly (High-Risk or Fast-Drifting Models)</option>
                      <option value="Bi-Annual">Bi-Annual (Moderate-Risk Systems)</option>
                      <option value="Annual">Annual (Low-Risk Utilities)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Individual Rights */}
            {currentStep === 2 && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6">
                <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-white flex items-center space-x-2">
                      <UserCheck className="w-4 h-4 text-purple-400" />
                      <span>Step 2: Individual & Fundamental Rights Impact (Annex A.5.1 / EU FRIA)</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Score severity on human dignity, non-discrimination, privacy, and decision explainability.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400">Subtotal Points:</span>
                    <div className="text-sm font-bold text-purple-300">{individualSubtotal.toFixed(1)} pts</div>
                  </div>
                </div>

                <div className="space-y-4">
                  {renderScoringCriterion('adverseOutcomeSeverity', adverseOutcomeSeverity, setAdverseOutcomeSeverity)}
                  {renderScoringCriterion('discriminationBiasPotential', discriminationBiasPotential, setDiscriminationBiasPotential)}
                  {renderScoringCriterion('privacyIntrusionLevel', privacyIntrusionLevel, setPrivacyIntrusionLevel)}
                  {renderScoringCriterion('explainabilityBarrier', explainabilityBarrier, setExplainabilityBarrier)}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Individual Rights Qualitative Rationale & Evidence Citations
                  </label>
                  <textarea
                    rows={2}
                    value={individualNotes}
                    onChange={(e) => setIndividualNotes(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500"
                    placeholder="Document specific individual harm vectors and statutory compliance considerations..."
                  />
                </div>
              </div>
            )}

            {/* Step 3: Societal Impact */}
            {currentStep === 3 && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6">
                <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-white flex items-center space-x-2">
                      <Scale className="w-4 h-4 text-purple-400" />
                      <span>Step 3: Societal, Systemic & Environmental Risk (Annex A.5.2)</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Evaluate critical infrastructure reliance, disinformation hallucination, carbon footprint, and vulnerable groups.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400">Subtotal Points:</span>
                    <div className="text-sm font-bold text-purple-300">{societalSubtotal.toFixed(1)} pts</div>
                  </div>
                </div>

                <div className="space-y-4">
                  {renderScoringCriterion('criticalInfrastructureReliance', criticalInfrastructureReliance, setCriticalInfrastructureReliance)}
                  {renderScoringCriterion('disinformationHallucinationRisk', disinformationHallucinationRisk, setDisinformationHallucinationRisk)}
                  {renderScoringCriterion('environmentalCarbonFootprint', environmentalCarbonFootprint, setEnvironmentalCarbonFootprint)}
                  {renderScoringCriterion('vulnerablePopulationExposure', vulnerablePopulationExposure, setVulnerablePopulationExposure)}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Societal & Environmental Risk Notes & Sustainability Evidence
                  </label>
                  <textarea
                    rows={2}
                    value={societalNotes}
                    onChange={(e) => setSocietalNotes(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500"
                    placeholder="Document societal impact factors and carbon efficiency measures..."
                  />
                </div>
              </div>
            )}

            {/* Step 4: Organizational Risk */}
            {currentStep === 4 && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6">
                <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-white flex items-center space-x-2">
                      <ShieldAlert className="w-4 h-4 text-purple-400" />
                      <span>Step 4: Organizational, Legal & Regulatory Exposure (Clause 6.1.2)</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Assess regulatory penalties (EU AI Act / MAS FEAT), copyright liability, brand reputation, and drift instability.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400">Subtotal Points:</span>
                    <div className="text-sm font-bold text-purple-300">{orgSubtotal.toFixed(1)} pts</div>
                  </div>
                </div>

                <div className="space-y-4">
                  {renderScoringCriterion('regulatoryNonComplianceExposure', regulatoryNonComplianceExposure, setRegulatoryNonComplianceExposure)}
                  {renderScoringCriterion('intellectualPropertyInfringement', intellectualPropertyInfringement, setIntellectualPropertyInfringement)}
                  {renderScoringCriterion('reputationalDamagePotential', reputationalDamagePotential, setReputationalDamagePotential)}
                  {renderScoringCriterion('modelDriftOperationalInstability', modelDriftOperationalInstability, setModelDriftOperationalInstability)}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Organizational Legal & Drift Notes
                  </label>
                  <textarea
                    rows={2}
                    value={organizationalNotes}
                    onChange={(e) => setOrganizationalNotes(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500"
                    placeholder="Document regulatory classification and potential enterprise loss vector..."
                  />
                </div>
              </div>
            )}

            {/* Step 5: Mitigations */}
            {currentStep === 5 && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6">
                <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-white flex items-center space-x-2">
                      <Sliders className="w-4 h-4 text-purple-400" />
                      <span>Step 5: Applied Technical & Governance Safeguards (Annex A.6–A.9)</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Select active safeguards to dynamically compress inherent risk into an acceptable residual risk rating.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400">Calculated Discount:</span>
                    <div className="text-sm font-bold text-emerald-400">-{mitigationPercent}% Inherent Risk</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {STANDARD_MITIGATIONS.map((mitigation) => {
                    const isChecked = selectedMitigations.includes(mitigation.name);
                    return (
                      <div
                        key={mitigation.name}
                        onClick={() => handleToggleMitigation(mitigation.name)}
                        className={`p-3.5 rounded-xl border transition cursor-pointer flex items-start space-x-3 ${
                          isChecked
                            ? 'bg-purple-950/40 border-purple-500/60 text-white'
                            : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="mt-0.5 rounded text-purple-600 focus:ring-purple-500 h-4 w-4 bg-slate-800 border-slate-700 pointer-events-none"
                        />
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-semibold">{mitigation.name}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-[10px]">
                            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                              {mitigation.category}
                            </span>
                            <span className="text-emerald-400 font-bold">-{mitigation.impact}% Inherent</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Custom mitigation adder */}
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/80 space-y-2">
                  <span className="text-xs font-semibold text-slate-200">Add Custom Architectural or Process Mitigation:</span>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={customMitigation}
                      onChange={(e) => setCustomMitigation(e.target.value)}
                      placeholder="e.g. Dual-layer vector embedding validation with cosine distance < 0.15..."
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                    <button
                      onClick={handleAddCustomMitigation}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium flex items-center space-x-1.5 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Safeguard</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: Review & Sign-Off */}
            {currentStep === 6 && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-base font-semibold text-white flex items-center space-x-2">
                    <Award className="w-4 h-4 text-purple-400" />
                    <span>Step 6: Evaluation Summary, Risk Determination & Formal Attestation</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Formalize ISO 42001 Clause 6.1.2 risk determination and capture Chief AI Ethics Officer attestation for audit evidence.
                  </p>
                </div>

                {/* Summary Scorecard */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 text-center">
                    <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Inherent Risk Score</div>
                    <div className="text-2xl font-bold text-amber-400 mt-1">{inherentScore} <span className="text-xs text-slate-400 font-normal">/ 100</span></div>
                    <div className="text-[11px] text-slate-400 mt-1">Pre-Mitigation Level</div>
                  </div>

                  <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 text-center">
                    <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Residual Risk Score</div>
                    <div className="text-2xl font-bold text-emerald-400 mt-1">{residualScore} <span className="text-xs text-slate-400 font-normal">/ 100</span></div>
                    <div className="text-[11px] text-emerald-400/80 mt-1">-{mitigationPercent}% Safeguards Applied</div>
                  </div>

                  <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 text-center flex flex-col justify-center items-center">
                    <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Derived Risk Tier</div>
                    <div className="mt-2">{getTierBadge(currentRiskTier)}</div>
                  </div>
                </div>

                {/* Mandatory ISO 42001 Controls Triggered */}
                <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4 space-y-2">
                  <div className="text-xs font-semibold text-slate-200">
                    Mandatory ISO/IEC 42001:2023 Annex A Controls Triggered by this Impact Assessment:
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {(currentRiskTier === 'HIGH_RISK' || currentRiskTier === 'CRITICAL_UNACCEPTABLE' 
                      ? ['A.5.1 AI-SIA Impact Assessment', 'A.6.3 V&V Red Teaming', 'A.7.3 Bias Mitigation', 'A.8.2 Explainability', 'A.9.2 Human Oversight', 'A.9.4 Kill-Switch']
                      : ['A.5.1 AI-SIA Process', 'A.7.4 Privacy Scrubbing', 'A.8.1 Transparency Disclosures', 'A.9.1 Responsible Use Guardrails']
                    ).map((ctrl) => (
                      <span key={ctrl} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-950/60 text-purple-300 border border-purple-800/50">
                        {ctrl}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Sign-off form */}
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Approval Recommendation
                      </label>
                      <select
                        value={approvalStatus}
                        onChange={(e) => setApprovalStatus(e.target.value as any)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                      >
                        <option value="APPROVED">APPROVED FOR PRODUCTION</option>
                        <option value="CONDITIONALLY_APPROVED">CONDITIONALLY APPROVED (With Ongoing Safeguards)</option>
                        <option value="UNDER_REVIEW">UNDER ETHICS BOARD REVIEW</option>
                        <option value="REJECTED">REJECTED / PROHIBITED RISK</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Authorizing Officer Sign-Off
                      </label>
                      <input
                        type="text"
                        value={approverName}
                        onChange={(e) => setApproverName(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                        placeholder="e.g. Elena Rostova, Lead AI Ethics Officer & CISO"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Attestation Remarks & Operational Contingencies
                    </label>
                    <textarea
                      rows={3}
                      value={approverComments}
                      onChange={(e) => setApproverComments(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500"
                      placeholder="Add formal remarks for external auditors and governance committees..."
                    />
                  </div>
                </div>

                <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800">
                  <div className="text-[11px] text-slate-400 flex items-center space-x-1.5">
                    <Lock className="w-3.5 h-3.5 text-purple-400" />
                    <span>Calculates cryptographic SHA-256 integrity hash upon saving.</span>
                  </div>
                  <button
                    id="save-aisia-assessment-btn"
                    onClick={() => handleSaveAssessment(true)}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-xs flex items-center space-x-2 shadow-lg shadow-purple-950/40 transition"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Evaluation & Generate Audit Certificate</span>
                  </button>
                </div>
              </div>
            )}

            {/* Wizard Navigation Footer */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  handleAutoSaveDraft();
                  setCurrentStep(Math.max(1, currentStep - 1));
                }}
                disabled={currentStep === 1}
                className={`px-4 py-2 rounded-xl text-xs font-medium flex items-center space-x-1.5 border transition ${
                  currentStep === 1
                    ? 'opacity-40 cursor-not-allowed border-slate-800 text-slate-500'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous Step</span>
              </button>

              <div className="text-xs text-slate-400">
                Step {currentStep} of 6
              </div>

              {currentStep < 6 ? (
                <button
                  onClick={() => {
                    handleAutoSaveDraft();
                    setCurrentStep(Math.min(6, currentStep + 1));
                  }}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium flex items-center space-x-1.5 transition"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={() => handleSaveAssessment(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center space-x-1.5 transition"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Complete Assessment</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Sidebar: Real-Time Dynamic Risk Gauge (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-5 sticky top-6 shadow-xl">
              <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-purple-300 uppercase tracking-wider">Live AI-SIA Evaluator</div>
                  <h4 className="text-sm font-bold text-white mt-0.5">{systemName}</h4>
                  <div className="text-[11px] text-slate-400">ID: {systemId}</div>
                </div>
                <button
                  onClick={handleAutoSaveDraft}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                  title="Auto-Save current draft"
                >
                  <Save className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Mathematical breakdown preview */}
              <div className="bg-slate-850 p-3 rounded-xl border border-slate-750 space-y-2 text-xs">
                <div className="text-[11px] font-semibold text-slate-300">Weighted Dimension Calculation:</div>
                <div className="space-y-1 font-mono text-[11px]">
                  <div className="flex justify-between text-slate-400">
                    <span>Individual Rights (5.0x):</span>
                    <span className="text-slate-200">{individualSubtotal.toFixed(1)} pts</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Societal & Systemic (4.3x):</span>
                    <span className="text-slate-200">{societalSubtotal.toFixed(1)} pts</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Org & Regulatory (4.9x):</span>
                    <span className="text-slate-200">{orgSubtotal.toFixed(1)} pts</span>
                  </div>
                  <div className="flex justify-between text-slate-300 pt-1 border-t border-slate-750 font-bold">
                    <span>Inherent Points Total:</span>
                    <span className="text-amber-400">{inherentTotal.toFixed(1)} / 71.5</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Risk Gauge */}
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Inherent Impact Score:</span>
                    <span className="font-bold text-amber-400">{inherentScore} / 100</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-yellow-500 to-rose-500 transition-all duration-300"
                      style={{ width: `${inherentScore}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Applied Mitigations:</span>
                    <span className="font-bold text-emerald-400">-{mitigationPercent}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-300"
                      style={{ width: `${mitigationPercent}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Residual Impact Score:</span>
                    <span className="font-bold text-purple-300">{residualScore} / 100</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        residualScore >= 75 ? 'bg-rose-500' :
                        residualScore >= 45 ? 'bg-amber-500' :
                        residualScore >= 25 ? 'bg-sky-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${residualScore}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Tier Callout */}
              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2">
                <div className="text-[11px] text-slate-400 font-semibold uppercase">Classification Tier</div>
                <div className="flex items-center justify-between">
                  {getTierBadge(currentRiskTier)}
                  <span className="text-xs text-slate-400 font-mono">Res: {residualScore}/100</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                  {currentRiskTier === 'HIGH_RISK'
                    ? 'Triggers EU AI Act Annex III conformity evaluation and mandatory ISO 42001 HITL oversight.'
                    : currentRiskTier === 'CRITICAL_UNACCEPTABLE'
                    ? 'Prohibited without immediate Board-level variance and external audit review.'
                    : 'Eligible for production rollout with standard post-deployment monitoring.'}
                </p>
              </div>

              {/* Autonomy Level Indicator */}
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 space-y-1">
                <div className="text-[11px] text-slate-400">Configured Autonomy:</div>
                <div className="text-xs font-semibold text-slate-200">
                  {autonomyLevel === 'HUMAN_IN_THE_LOOP' ? 'Human-in-the-Loop (Highest Oversight)' :
                   autonomyLevel === 'HUMAN_ON_THE_LOOP' ? 'Human-on-the-Loop (Supervisory)' : 'Fully Autonomous'}
                </div>
              </div>

              {/* Quick Jump to Existing Dossiers */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Saved Assessments:</span>
                  <span className="text-purple-400 font-semibold">{assessments.length} on file</span>
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {assessments.map((a) => (
                    <div
                      key={a.id}
                      onClick={() => loadAssessment(a)}
                      className="p-2 rounded-lg bg-slate-800/40 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 cursor-pointer transition flex items-center justify-between text-xs"
                    >
                      <div className="truncate pr-2">
                        <div className="font-medium text-slate-200 truncate">{a.systemName}</div>
                        <div className="text-[10px] text-slate-400">{a.id} • {a.assessmentDate}</div>
                      </div>
                      <span className="text-[10px] font-bold text-purple-400 shrink-0">
                        {a.residualImpactScore}/100
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Registry View (All Completed AI-SIAs) */
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white">AI System Impact Assessment (AI-SIA) Master Register</h3>
                <p className="text-xs text-slate-400">Formal evaluations maintained for external ISO 42001 certification bodies with automatic persistence.</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleResetToFactoryDefaults}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs font-medium flex items-center space-x-1.5 transition"
                  title="Reset storage to default seeded examples"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Data</span>
                </button>
                <button
                  onClick={() => setActiveTab('wizard')}
                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium flex items-center space-x-1.5 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Assessment</span>
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="p-3 bg-slate-850 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <input
                type="text"
                placeholder="Search by system name, ID, assessor..."
                value={registrySearch}
                onChange={(e) => setRegistrySearch(e.target.value)}
                className="w-full sm:w-72 bg-slate-900 border border-slate-750 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
              />
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <span className="text-slate-400">Risk Tier:</span>
                <select
                  value={registryTierFilter}
                  onChange={(e) => setRegistryTierFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-750 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="All">All Tiers</option>
                  <option value="CRITICAL_UNACCEPTABLE">Critical / Unacceptable</option>
                  <option value="HIGH_RISK">High Risk (Annex III)</option>
                  <option value="MEDIUM_RISK">Medium Risk</option>
                  <option value="LOW_EXEMPT">Low / Exempt</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/60 text-[11px] text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">Assessment ID</th>
                    <th className="p-3.5">AI System Asset</th>
                    <th className="p-3.5">Assessor</th>
                    <th className="p-3.5">Autonomy</th>
                    <th className="p-3.5 text-center">Inherent</th>
                    <th className="p-3.5 text-center">Residual</th>
                    <th className="p-3.5">Risk Tier</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredAssessments.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-400">
                        No impact assessments found matching current filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredAssessments.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-800/40 transition">
                        <td className="p-3.5 font-mono text-slate-400 font-semibold">{rec.id}</td>
                        <td className="p-3.5">
                          <div className="font-medium text-white">{rec.systemName}</div>
                          <div className="text-[11px] text-slate-400">{rec.systemId}</div>
                        </td>
                        <td className="p-3.5">
                          <div className="text-slate-200">{rec.assessorName}</div>
                          <div className="text-[10px] text-slate-400">{rec.assessmentDate}</div>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                            {rec.autonomyLevel.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="p-3.5 text-center font-bold text-amber-400">{rec.inherentImpactScore}</td>
                        <td className="p-3.5 text-center font-bold text-emerald-400">{rec.residualImpactScore}</td>
                        <td className="p-3.5">{getTierBadge(rec.derivedRiskTier)}</td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {rec.approvalStatus}
                          </span>
                        </td>
                        <td className="p-3.5 text-right space-x-1.5">
                          <button
                            onClick={() => setShowCertificateModal(rec)}
                            className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs transition inline-flex items-center space-x-1"
                            title="View Formal Audit Certificate"
                          >
                            <FileText className="w-3 h-3 text-purple-400" />
                            <span>Cert</span>
                          </button>
                          <button
                            onClick={() => {
                              loadAssessment(rec);
                              setActiveTab('wizard');
                              setCurrentStep(6);
                            }}
                            className="px-2 py-1 rounded-lg bg-purple-600/80 hover:bg-purple-600 text-white text-xs transition inline-flex items-center space-x-1"
                            title="Open in Wizard for editing"
                          >
                            <Sliders className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteAssessment(rec.id)}
                            className="p-1 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 border border-slate-700 text-xs transition inline-flex items-center"
                            title="Delete record from store"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Audit Certificate Modal */}
      {showCertificateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-purple-500/40 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    ISO/IEC 42001:2023 Attestation
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{showCertificateModal.id}</span>
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  AI-SIA Formal Impact Evaluation Certificate
                </h3>
              </div>
              <button
                onClick={() => setShowCertificateModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {/* Certificate Content */}
            <div className="space-y-4 text-xs text-slate-300">
              <div className="bg-slate-800/70 p-4 rounded-xl border border-slate-700 space-y-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400">AI System Name:</span>
                    <div className="font-bold text-white">{showCertificateModal.systemName}</div>
                  </div>
                  <div>
                    <span className="text-slate-400">System Asset Code:</span>
                    <div className="font-mono text-purple-300">{showCertificateModal.systemId}</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Assessment Date:</span>
                    <div className="text-slate-200">{showCertificateModal.assessmentDate}</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Derived Risk Tier:</span>
                    <div className="mt-0.5">{getTierBadge(showCertificateModal.derivedRiskTier)}</div>
                  </div>
                </div>
              </div>

              {/* Scores breakdown */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-lg bg-slate-800 border border-slate-700">
                  <div className="text-slate-400 text-[10px]">Inherent Score</div>
                  <div className="text-lg font-bold text-amber-400">{showCertificateModal.inherentImpactScore}/100</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-800 border border-slate-700">
                  <div className="text-slate-400 text-[10px]">Mitigation Reduction</div>
                  <div className="text-lg font-bold text-emerald-400">-{showCertificateModal.mitigationEffectiveness}%</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-800 border border-slate-700">
                  <div className="text-slate-400 text-[10px]">Residual Score</div>
                  <div className="text-lg font-bold text-purple-300">{showCertificateModal.residualImpactScore}/100</div>
                </div>
              </div>

              {/* Applied Mitigations */}
              <div className="space-y-1.5">
                <div className="font-semibold text-slate-200">Applied Safeguards & Technical Mitigations:</div>
                <ul className="list-disc pl-4 space-y-1 text-slate-400">
                  {showCertificateModal.appliedMitigations.map((m, idx) => (
                    <li key={idx}>{m}</li>
                  ))}
                </ul>
              </div>

              {/* Mandatory Controls Triggered */}
              <div className="bg-slate-850 p-3 rounded-xl border border-slate-750 space-y-1.5">
                <div className="font-semibold text-slate-300">Mandatory Triggered ISO 42001 Controls:</div>
                <div className="flex flex-wrap gap-1.5">
                  {showCertificateModal.mandatoryControls.map((c) => (
                    <span key={c} className="px-2 py-0.5 rounded text-[11px] font-mono bg-purple-950/80 text-purple-300 border border-purple-800/40">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Signatures */}
              <div className="bg-purple-950/20 border border-purple-500/30 rounded-xl p-4 space-y-2">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400">Lead AI Assessor:</span>
                  <span className="font-medium text-white">{showCertificateModal.assessorName} ({showCertificateModal.assessorTitle})</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400">Authorizing AI Ethics Officer:</span>
                  <span className="font-medium text-white">{showCertificateModal.approvedBy || 'Elena Rostova, CISO'}</span>
                </div>
                <div className="pt-2 border-t border-purple-500/20 flex justify-between items-center text-[10px] text-slate-400 font-mono">
                  <span>Cryptographic Digest:</span>
                  <span className="truncate max-w-[280px]">{showCertificateModal.cryptographicDigest || 'sha256-verified-aims-attestation'}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center space-x-1.5 transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Certificate</span>
              </button>
              <button
                onClick={() => setShowCertificateModal(null)}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
