import React, { useState, useMemo, useRef } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  LineChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ReferenceDot,
  ReferenceArea,
  Area
} from 'recharts';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Brain,
  Gauge,
  ArrowRight,
  ArrowRightLeft,
  ExternalLink,
  ChevronRight,
  Filter,
  Search,
  X,
  CheckCircle2,
  Clock,
  Lock,
  Server,
  Cloud,
  FileText,
  Database,
  Layers,
  FolderCheck,
  Sparkles,
  Download,
  ArrowUpRight,
  CheckSquare,
  Upload,
  Hash,
  Fingerprint,
  Eye,
  RefreshCw,
  FileCheck,
  Wrench,
  SlidersHorizontal,
  Building2,
  AlertOctagon,
  HelpCircle,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  List,
  Grid,
  FileQuestion,
  AlertCircle,
  Zap,
  Plus,
  TrendingDown,
  TrendingUp,
  Target,
  Activity,
  ArrowDownRight,
  History,
  RotateCcw,
  Calendar,
  Award,
  Flag,
  Bookmark,
  Tag,
  ArrowLeftRight,
  Scale,
  BarChart3,
  FileDown,
  Loader2
} from 'lucide-react';
import { exportComplianceGapPDF } from '../../utils/complianceGapPdfExporter';
import { useGRC } from '../../context/GRCContext';
import { PageContainer } from '../layout/PageContainer';
import { MASRequirementAssessmentRecord, FrameworkDomain } from '../../types/regulatoryTypes';
import { MAS_TRM_REQUIREMENTS } from '../../data/masRegulatoryMasterData';
import { FindingCAPARecord, EvidenceRecord } from '../../types';
import { INITIAL_UNIFIED_REMEDIATIONS } from '../../data/remediationData';
import { MASRequirementDrilldownView } from './MASRequirementDrilldownView';
import { EvidenceGapRecommendationHub } from './EvidenceGapRecommendationHub';
import { ComplianceAuditDataTable } from './ComplianceAuditDataTable';
import { AutomatedTelemetryCCMEngine } from './realtime/AutomatedTelemetryCCMEngine';
import { Notice644SystemAvailabilityLedger } from './realtime/Notice644SystemAvailabilityLedger';
import { Notice658SupplyChainTelemetry } from './realtime/Notice658SupplyChainTelemetry';
import { ThreatInformedDefenseCAPADesk } from './realtime/ThreatInformedDefenseCAPADesk';
import { Auditor3LoDPortal } from './realtime/Auditor3LoDPortal';
import { FEATGenAIRiskSentinel } from './realtime/FEATGenAIRiskSentinel';
import { CrossRegulatoryHarmonizationEngine } from './realtime/CrossRegulatoryHarmonizationEngine';
import { PQCCryptoMigrationLedger } from './realtime/PQCCryptoMigrationLedger';
import { CyberCrisisWarRoomEngine } from './realtime/CyberCrisisWarRoomEngine';
import { BoardRiskAppetiteDashboard } from './realtime/BoardRiskAppetiteDashboard';
import {
  generateRequirementGapRecommendation,
  generateExecutiveGapRemediationSummary,
  EvidenceVaultMatch,
  RequirementGapRecommendation,
  PrescribedEvidenceTemplate
} from '../../services/evidenceRecommendationEngine';
import { useToast } from '../common/ToastContainer';

export type MilestoneCategory = 'POLICY' | 'AUDIT' | 'TECH' | 'BASELINE' | 'TARGET';

export interface MilestoneEventAnnotation {
  eventTitle: string; // e.g. 'Policy Implemented', 'Audit Passed'
  eventSubtext?: string; // e.g. 'Notice 655 Hygiene Standards Enforced'
  category: MilestoneCategory; // 'POLICY' | 'AUDIT' | 'TECH' | 'BASELINE' | 'TARGET'
  badgeColor: string; // hex color for line and badge accent
  icon?: 'shield' | 'check' | 'lock' | 'zap' | 'flag' | 'award';
  impactText: string; // e.g. '-3 Deficiencies', 'Passed Internal Audit'
  detailedNotes?: string;
}

export interface IncurredAuditRequirement {
  requirementCode: string;
  requirementTitle: string;
  domainNumber: string;
  domainName: string;
  riskTier: 'HIGH_RISK' | 'MEDIUM_RISK';
  controlCategory: string;
  findingSummary: string;
  deficiencyReason: string;
  evidenceDeficit: string;
  remediationAction: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  remediationStatus: 'REMEDIATED' | 'IN_PROGRESS' | 'OPEN';
}

export interface ComplianceSpikeAnomaly {
  id: string;
  period: string; // The timeline point where the spike peaked
  dateLabel: string;
  timestamp: string;
  previousPeriod: string; // Baseline before the spike
  previousDateLabel: string;
  previousTimestamp: string;
  gapIncrease: number; // e.g. +6 deficiencies
  previousDeficient: number;
  newDeficient: number;
  percentageSpike: number; // e.g. +50%
  severity: 'CRITICAL' | 'HIGH' | 'ELEVATED';
  triggerEventTitle: string;
  auditEntity: string;
  auditScope: string;
  auditDate: string;
  auditReportRef: string;
  auditTypeLabel: string;
  rootCauseDescription: string;
  affectedDomains: {
    domainNumber: string;
    domainName: string;
    incurredGaps: number;
    color: string;
  }[];
  incurredRequirements: IncurredAuditRequirement[];
  immediateActionTaken: string;
  remediationMilestoneRef: string;
  remediatedPeriodDateLabel: string;
}

export interface RegulatoryRequirementRelease {
  id: string;
  title: string;
  authority: 'MAS' | 'ISO/IEC' | 'NIST' | 'CSA Singapore' | 'Global Baseline';
  circularRef: string;
  domainNumber: string;
  domainName: string;
  summary: string;
  mandatoryClausesCount: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  effectiveDate: string;
  remediationActionSummary: string;
}

export interface PeriodRegulatoryVelocityData {
  period: string;
  dateLabel: string;
  timestamp: string;
  improvementRate: number; // Rate of compliance improvement (Deficiencies resolved / controls verified in period)
  readinessDeltaPct: number; // % readiness gained
  verifiedControlsCount: number;
  newRequirementsVolume: number; // Volume of new regulatory requirements released within period
  releasedRequirements: RegulatoryRequirementRelease[];
  netVelocity: number; // improvementRate - newRequirementsVolume
  velocityRatio: number; // improvementRate / max(1, newRequirementsVolume)
  velocityStatus: 'OUTPACING' | 'LAGGING' | 'BALANCED';
  velocityStatusLabel: string;
  absorptionRatePct: number;
}

export interface RegulatoryVelocityAggregateModel {
  overallVelocityRatio: number;
  totalRequirementsReleased: number;
  totalImprovementsRemediated: number;
  netSpread: number;
  averageImprovementRatePerMonth: number;
  averageNewRequirementsRatePerMonth: number;
  currentPeriodVelocity: PeriodRegulatoryVelocityData;
  periods: PeriodRegulatoryVelocityData[];
  velocityHealth: 'EXPANDING_LEAD' | 'STABLE_ABSORPTION' | 'REGULATORY_HEADWIND';
  velocityHealthLabel: string;
  summaryInsight: string;
}

export interface RetrospectiveTimelinePoint {
  period: string;
  dateLabel: string;
  timestamp: string;
  deficient: number;
  pendingEvidence: number;
  compliant: number;
  overallReadiness: number;
  target: number;
  milestone?: string;
  isCurrent?: boolean;
  isProjected?: boolean;
  isLinearCompletionPoint?: boolean;
  isAiCompletionPoint?: boolean;
  regressionDeficient?: number | null;
  actualGap?: number | null;
  projectedGap?: number | null;
  gapVariance?: number | null;
  aiProjectedDeficient?: number | null;
  aiVarianceVsActual?: number | null;
  aiVarianceVsLinear?: number | null;
  auditStage?: string;
  snapshotDescription?: string;
  eventAnnotation?: MilestoneEventAnnotation;
  spikeAnomaly?: ComplianceSpikeAnomaly;
  // Regulatory Velocity Fields
  improvementRate?: number;
  newRequirementsVolume?: number;
  netVelocitySpread?: number;
  velocityRatio?: number;
  velocityStatus?: 'OUTPACING' | 'LAGGING' | 'BALANCED';
  releasedRequirementsDetails?: RegulatoryRequirementRelease[];
}

export interface AITrendProjectionModel {
  historicalRemediationSpeedGapsPerMonth: number;
  historicalAverageResolutionDays: number;
  totalHistoricalClosedItems: number;
  openTasksCount: number;
  completedTasksCount: number;
  openTaskCompletionRate: number;
  momentumMultiplier: number;
  adjustedRemediationVelocity: number;
  projectedZeroGapDate: Date;
  projectedZeroGapDateLabel: string;
  projectedZeroGapDateFull: string;
  daysRemainingToZero: number;
  projectedTargetGapDate: Date;
  projectedTargetGapDateLabel: string;
  projectedTargetGapDateFull: string;
  daysRemainingToTarget: number;
  confidenceScore: number;
  varianceVsLinearDays: number;
  formula: string;
  scenario: 'BALANCED' | 'ACCELERATED' | 'CONSERVATIVE';
  insights: string[];
  remediationBreakdown: {
    criticalHighVelocity: number;
    mediumLowVelocity: number;
    tasksOnTrack: number;
    tasksAtRisk: number;
  };
}

export interface LinearRegressionResult {
  slopePerDay: number;
  slopePerMonth: number;
  slopePerWeek: number;
  intercept: number;
  rSquared: number;
  projectedZeroGapDate: Date;
  projectedZeroGapDateLabel: string;
  projectedZeroGapDateFull: string;
  daysRemainingToZero: number;
  projectedTargetGapDate: Date;
  projectedTargetGapDateLabel: string;
  projectedTargetGapDateFull: string;
  daysRemainingToTarget: number;
  formula: string;
  historicalCount: number;
  startDateLabel: string;
  currentDateLabel: string;
  currentDeficiencies: number;
  isDeclining: boolean;
}

export interface RetrospectiveEvidenceItem {
  id: string;
  requirementCode: string;
  requirementTitle: string;
  domainNumber: string;
  domainName: string;
  riskTier: 'HIGH_RISK' | 'MEDIUM_RISK' | 'LOW_RISK';
  controlCode: string;
  evidenceTitle: string;
  suggestedFileName: string;
  department: string;
  retrospectiveStatus: 'MISSING_AT_SNAPSHOT' | 'SATISFIED_IN_VAULT' | 'REMEDIATED_LATER' | 'PROJECTED_BRIDGED';
  retrospectiveStatusLabel: string;
  evidenceRecord?: EvidenceRecord;
  uploadedDate?: string;
  remediatedOn?: string;
  auditHash?: string;
  deficiencyReason?: string;
  mandatorySafeguards?: string[];
  recommendedActionText?: string;
  canBridgeNow?: boolean;
  matchingVaultId?: string;
}

export type MASRequirementComplianceBadgeStatus = 'Pending Evidence' | 'Under Review' | 'Deficient' | 'Compliant';

export const ComplianceStatusBadge: React.FC<{
  status: MASRequirementComplianceBadgeStatus;
  size?: 'sm' | 'md';
  className?: string;
}> = ({ status, size = 'sm', className = '' }) => {
  switch (status) {
    case 'Compliant':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-full ${
            size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'
          } bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm shrink-0 ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
          <CheckCircle2 className={`${size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-emerald-400 shrink-0`} />
          <span>Compliant</span>
        </span>
      );
    case 'Under Review':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-full ${
            size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'
          } bg-sky-500/15 text-sky-300 border border-sky-500/30 shadow-sm shrink-0 ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
          <Clock className={`${size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-sky-400 shrink-0`} />
          <span>Under Review</span>
        </span>
      );
    case 'Pending Evidence':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-full ${
            size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'
          } bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm shrink-0 ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
          <FileQuestion className={`${size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-amber-400 shrink-0`} />
          <span>Pending Evidence</span>
        </span>
      );
    case 'Deficient':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-bold rounded-full ${
            size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'
          } bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm shrink-0 ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
          <AlertOctagon className={`${size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-rose-400 shrink-0`} />
          <span>Deficient</span>
        </span>
      );
    default:
      return null;
  }
};

// Enriched Requirement Type with Computed Readiness Score, Open Findings, and Associated Evidence
export interface EnrichedMASRequirement {
  id: string;
  requirementCode: string;
  title: string;
  domainNumber: string;
  domainName: string;
  statement: string;
  intentAndGuidance: string;
  regulatorySourceRef: string;
  mandatoryForFIs: boolean;
  criticalSystemsMandate: boolean;
  responsibleRoles: string[];
  crossFrameworkMappings: {
    iso27001?: string[];
  };
  assessment?: MASRequirementAssessmentRecord;
  readinessScore: number; // 0 - 100%
  riskTier: 'HIGH_RISK' | 'MEDIUM_RISK' | 'LOW_RISK';
  riskScore: number; // 1 - 100 scale (higher is riskier)
  openFindings: FindingCAPARecord[];
  associatedEvidence: EvidenceRecord[];
  evidenceGapIdentified: boolean;
  statutoryMandateType: 'NOTICE_655_CYBER_HYGIENE' | 'NOTICE_644_CRITICAL_SYSTEMS' | 'TRM_2021_GUIDELINES' | 'OUTSOURCING_MANDATE';
  complianceStatusBadge: MASRequirementComplianceBadgeStatus;
}

// Rich Audit Event Anomaly Spikes for Compliance Anomaly Detector
export const SPIKE_ANOMALY_SEP_2025: ComplianceSpikeAnomaly = {
  id: 'anom-sep-2025',
  period: 'Sep 2025',
  dateLabel: "Sep '25",
  timestamp: '2025-09-20',
  previousPeriod: 'Jun 2025',
  previousDateLabel: "Jun '25",
  previousTimestamp: '2025-06-30',
  gapIncrease: 6,
  previousDeficient: 12,
  newDeficient: 18,
  percentageSpike: 50,
  severity: 'CRITICAL',
  triggerEventTitle: 'MAS Joint Supervisory Red-Team & Multi-Cloud Influx Audit',
  auditEntity: 'Monetary Authority of Singapore (MAS) Cybersecurity Inspection Team & External Red-Team',
  auditScope: 'MAS Notice 658 Cloud Resilience Mandate & Multi-Tenant API Pentest',
  auditDate: '2025-09-18',
  auditReportRef: 'MAS-INSP-2025-Q3-094',
  auditTypeLabel: 'Supervisory Red-Team & Cloud Architecture Audit',
  rootCauseDescription: 'Surprise regulatory inspection and adversarial red-team engagement uncovered critical non-conformities across AWS and Azure multi-cloud infrastructure. Inspectors identified unrotated API keys with administrator delegation, unsegmented microservice ingress gateways, missing automated DR failover evidence, and container image zero-days.',
  affectedDomains: [
    { domainNumber: '5', domainName: 'Access Control & IAM', incurredGaps: 2, color: '#f43f5e' },
    { domainNumber: '8', domainName: 'Data Security & Encryption', incurredGaps: 1, color: '#fb923c' },
    { domainNumber: '11', domainName: 'Business Continuity & Disaster Recovery', incurredGaps: 1, color: '#eab308' },
    { domainNumber: '6', domainName: 'Network Security & Micro-Segmentation', incurredGaps: 1, color: '#a855f7' },
    { domainNumber: '9', domainName: 'Cyber Threat Intelligence & SIEM', incurredGaps: 1, color: '#06b6d4' }
  ],
  incurredRequirements: [
    {
      requirementCode: 'TRM-5.1.2',
      requirementTitle: 'Privileged Cloud IAM Delegation & Cross-Account Role Sprawl',
      domainNumber: '5',
      domainName: 'Access Control',
      riskTier: 'HIGH_RISK',
      controlCategory: 'Cloud IAM & Privileged Access',
      findingSummary: 'Excessive wildcard IAM policies assigned to automated CI/CD service principals allowing cross-tenant privilege escalation.',
      deficiencyReason: 'Quarterly automated entitlement reviews were absent; temporary token session boundaries were unconfigured.',
      evidenceDeficit: 'Missing Okta PAM session boundary telemetry and automated IAM credential expiration logs.',
      remediationAction: 'Deployed Okta Privileged Access Management (PAM) with 1-hour ephemeral credentials and automated session revocation.',
      severity: 'CRITICAL',
      remediationStatus: 'REMEDIATED'
    },
    {
      requirementCode: 'TRM-8.3.1',
      requirementTitle: 'Unauthenticated Cloud Storage Bucket Egress & Secret Drift',
      domainNumber: '8',
      domainName: 'Data Security',
      riskTier: 'HIGH_RISK',
      controlCategory: 'Object Storage Encryption & Isolation',
      findingSummary: 'Internal audit found 4 secondary S3 buckets lacking KMS customer-managed encryption (CMK) and bucket-level SCP guards.',
      deficiencyReason: 'Terraform modules bypassed customer-managed encryption and permitted cross-VPC read egress.',
      evidenceDeficit: 'Continuous CloudTrail S3 access policy tamper-evident audit trail was not enabled.',
      remediationAction: 'Enforced AWS KMS CMK with strict Bucket Policy Service Control Policies (SCPs) blocking cross-VPC egress.',
      severity: 'CRITICAL',
      remediationStatus: 'REMEDIATED'
    },
    {
      requirementCode: 'TRM-11.2.4',
      requirementTitle: 'Kubernetes Multi-Region DR Automated Failover Verification Deficit',
      domainNumber: '11',
      domainName: 'Business Continuity',
      riskTier: 'HIGH_RISK',
      controlCategory: 'High Availability & Failover Automation',
      findingSummary: 'Institution could not present automated 4-hour RTO failover logs for primary payment switch clusters.',
      deficiencyReason: 'Disaster recovery runbooks relied on manual DNS re-routing without automated synthetic validation.',
      evidenceDeficit: 'DR drill reports lacked synthetic end-to-end transaction latency and RTO integrity benchmarks.',
      remediationAction: 'Executed live automated traffic failover drill and hashed verifiable cryptographic audit trail into EvidenceVault.',
      severity: 'HIGH',
      remediationStatus: 'REMEDIATED'
    },
    {
      requirementCode: 'TRM-6.4.2',
      requirementTitle: 'Unsegmented Microservices East-West Service Mesh Ingress',
      domainNumber: '6',
      domainName: 'Network Security',
      riskTier: 'HIGH_RISK',
      controlCategory: 'Service Mesh Micro-Segmentation',
      findingSummary: 'Kubernetes ingress controller allowed unauthenticated lateral east-west network traversal between container pods.',
      deficiencyReason: 'Mutual TLS (mTLS) was not enforced between payment microservices and logging clusters.',
      evidenceDeficit: 'Missing Istio mTLS mutual authentication enforcement logs and network policy telemetry.',
      remediationAction: 'Deployed strict Istio Mutual TLS mesh and Calico micro-segmentation network policy rules enterprise-wide.',
      severity: 'HIGH',
      remediationStatus: 'REMEDIATED'
    },
    {
      requirementCode: 'TRM-9.1.5',
      requirementTitle: 'SIEM Cyber Threat Ingestion Latency Exceeding 15-Minute Rule',
      domainNumber: '9',
      domainName: 'Cyber Threat Management',
      riskTier: 'MEDIUM_RISK',
      controlCategory: 'Real-Time Threat Telemetry & SIEM',
      findingSummary: 'CloudWatch to Splunk ingestion pipeline experienced 45-minute buffer lag during peak trading hours.',
      deficiencyReason: 'Kafka log streamer clusters were undersized, breaching the MAS 15-minute alert correlation mandate.',
      evidenceDeficit: 'Real-time telemetry pipeline SLA verification reports missing for 3 consecutive months.',
      remediationAction: 'Scaled Kafka log streamer cluster nodes, reducing ingestion latency to under 90 seconds guaranteed SLA.',
      severity: 'MEDIUM',
      remediationStatus: 'REMEDIATED'
    },
    {
      requirementCode: 'TRM-7.2.1',
      requirementTitle: 'Critical Container Base Image CVE Patching Latency',
      domainNumber: '7',
      domainName: 'Vulnerability Management',
      riskTier: 'MEDIUM_RISK',
      controlCategory: 'Container Security & CVE Remediation',
      findingSummary: 'Production container images in private registry contained unpatched critical OpenSSL vulnerabilities older than 14 days.',
      deficiencyReason: 'Base image rebuild pipeline lacked automated admission controller gating based on CVE severity.',
      evidenceDeficit: 'Cryptographic Cosign image signing verification absent in Kubernetes admission controller.',
      remediationAction: 'Integrated automated Trivy vulnerability gating and Cosign image signing in CI/CD deployment gates.',
      severity: 'MEDIUM',
      remediationStatus: 'REMEDIATED'
    }
  ],
  immediateActionTaken: 'Convened Emergency IT Risk Steering Committee; instantiated Notice 655 Rapid Remediation Taskforce and accelerated Central Evidence Vault automated ingestion.',
  remediationMilestoneRef: 'Resolved in Dec 25 Central Evidence Vault Rollout & Oct 25 Hygiene Sprint',
  remediatedPeriodDateLabel: "Dec '25"
};

export const SPIKE_ANOMALY_NOV_2025: ComplianceSpikeAnomaly = {
  id: 'anom-nov-2025',
  period: 'Nov 2025',
  dateLabel: "Nov '25",
  timestamp: '2025-11-20',
  previousPeriod: 'Oct 2025',
  previousDateLabel: "Oct '25",
  previousTimestamp: '2025-10-31',
  gapIncrease: 5,
  previousDeficient: 10,
  newDeficient: 15,
  percentageSpike: 50,
  severity: 'CRITICAL',
  triggerEventTitle: 'Subsidiary Core Banking Cloud Migration & Cyber Drill',
  auditEntity: 'Group Internal Audit & MAS Cyber Inspection Branch',
  auditScope: 'Subsidiary M&A Technology Integration & MAS Notice 655 Hygiene Audit',
  auditDate: '2025-11-15',
  auditReportRef: 'MAS-INSP-2025-Q4-118',
  auditTypeLabel: 'Targeted M&A Infrastructure Supervisory Audit',
  rootCauseDescription: 'The technical integration of acquired subsidiary core banking microservices brought legacy cloud tenancies into the primary MAS TRM compliance boundary, immediately introducing 5 unverified controls across database encryption, third-party vendor APIs, and incident runbooks.',
  affectedDomains: [
    { domainNumber: '5', domainName: 'Access Control & IAM', incurredGaps: 2, color: '#f43f5e' },
    { domainNumber: '8', domainName: 'Data Security & Cryptography', incurredGaps: 1, color: '#fb923c' },
    { domainNumber: '3', domainName: 'Third-Party Risk Management', incurredGaps: 1, color: '#eab308' },
    { domainNumber: '10', domainName: 'Incident Management & Response', incurredGaps: 1, color: '#a855f7' }
  ],
  incurredRequirements: [
    {
      requirementCode: 'TRM-5.2.1',
      requirementTitle: 'Subsidiary Legacy Database Root Credential Hardcoding',
      domainNumber: '5',
      domainName: 'Access Control',
      riskTier: 'HIGH_RISK',
      controlCategory: 'Database Privileged Access',
      findingSummary: 'Hardcoded database administrative credentials discovered in subsidiary configuration repositories.',
      deficiencyReason: 'Acquired platform utilized static configuration files rather than central HashiCorp Vault.',
      evidenceDeficit: 'Automated secret rotation logs and PAM vault access audit trails were unavailable.',
      remediationAction: 'Migrated all subsidiary database credentials to HashiCorp Vault with 24-hour automated dynamic rotation.',
      severity: 'CRITICAL',
      remediationStatus: 'REMEDIATED'
    },
    {
      requirementCode: 'TRM-8.1.3',
      requirementTitle: 'Unencrypted Transit Data between Hybrid Datacenter Direct Connect',
      domainNumber: '8',
      domainName: 'Data Security',
      riskTier: 'HIGH_RISK',
      controlCategory: 'Transport Layer Security',
      findingSummary: 'Direct Connect dedicated link between on-premise subsidiary datacenter and AWS VPC lacked MACsec/IPsec encryption.',
      deficiencyReason: 'Assumed physical circuit isolation was sufficient without cryptographic transport layer enforcement.',
      evidenceDeficit: 'Proof of AES-256 MACsec cryptographic encapsulation over Direct Connect interface.',
      remediationAction: 'Activated AWS Direct Connect MACsec encryption with strict TLS 1.3 mutual tunnel safeguards.',
      severity: 'CRITICAL',
      remediationStatus: 'REMEDIATED'
    },
    {
      requirementCode: 'TRM-3.2.4',
      requirementTitle: 'Third-Party SaaS Payment Gateway Token Lifecycle Governance',
      domainNumber: '3',
      domainName: 'Third-Party Risk',
      riskTier: 'HIGH_RISK',
      controlCategory: 'Vendor API Integration Governance',
      findingSummary: 'Subsidiary payment gateway webhook endpoints lacked HMAC signature verification and certificate pinning.',
      deficiencyReason: 'Vendor integration contracts had not undergone MAS Notice 655 third-party security assessment.',
      evidenceDeficit: 'Annual independent SOC 2 Type II attestation and cryptographic webhook signature validation logs.',
      remediationAction: 'Implemented API Gateway mutual TLS validation and mandated HMAC-SHA256 signature verification on all webhooks.',
      severity: 'HIGH',
      remediationStatus: 'REMEDIATED'
    },
    {
      requirementCode: 'TRM-10.3.1',
      requirementTitle: 'Incident Escalation Runbook Desynchronization Across Acquired Entities',
      domainNumber: '10',
      domainName: 'Incident Management',
      riskTier: 'MEDIUM_RISK',
      controlCategory: 'Cyber Incident Response & Escalation',
      findingSummary: 'Subsidiary operational staff followed legacy crisis communication trees that bypassed MAS 1-hour regulatory notification.',
      deficiencyReason: 'Crisis escalation runbooks had not been unified post-merger.',
      evidenceDeficit: 'Joint tabletop exercise simulation logs validating the 1-hour MAS notification SLA.',
      remediationAction: 'Conducted unified cyber tabletop simulation and deployed automated PagerDuty escalation to MAS Compliance Officer.',
      severity: 'MEDIUM',
      remediationStatus: 'REMEDIATED'
    },
    {
      requirementCode: 'TRM-5.4.1',
      requirementTitle: 'Lack of Centralized Multi-Factor Authentication on Acquired Bastion Hosts',
      domainNumber: '5',
      domainName: 'Access Control',
      riskTier: 'HIGH_RISK',
      controlCategory: 'Administrative Access & Bastion 2FA',
      findingSummary: 'Subsidiary engineers accessed jump-box bastion servers via password-only authentication without hardware token 2FA.',
      deficiencyReason: 'Bastion host fleet had not been enrolled in central enterprise Okta SSO.',
      evidenceDeficit: 'SSH session capture and FIDO2 hardware token verification telemetry.',
      remediationAction: 'Enrolled all acquired servers into Teleport Zero-Trust Access with mandatory FIDO2 hardware token 2FA.',
      severity: 'HIGH',
      remediationStatus: 'REMEDIATED'
    }
  ],
  immediateActionTaken: 'Enforced emergency IAM credential reset; isolated subsidiary VPC behind zero-trust gateway and integrated into EvidenceVault continuous compliance scanning.',
  remediationMilestoneRef: 'Remediated across Dec 25 EvidenceVault Linkage and Jan 26 Annual Kickoff',
  remediatedPeriodDateLabel: "Jan '26"
};

export const SPIKE_ANOMALY_JAN_2026: ComplianceSpikeAnomaly = {
  id: 'anom-jan-2026',
  period: 'Late Jan 2026',
  dateLabel: "Jan '22",
  timestamp: '2026-01-22',
  previousPeriod: 'Jan 2026',
  previousDateLabel: "Jan '26",
  previousTimestamp: '2026-01-10',
  gapIncrease: 4,
  previousDeficient: 8,
  newDeficient: 12,
  percentageSpike: 50,
  severity: 'HIGH',
  triggerEventTitle: 'MAS Third-Party Supply Chain & GenAI Shadow IT Security Audit',
  auditEntity: 'External Specialized AI Red-Team & MAS Technology Risk Taskforce',
  auditScope: 'Enterprise Generative AI & SaaS Supply Chain Governance Review',
  auditDate: '2026-01-20',
  auditReportRef: 'MAS-INSP-2026-Q1-014',
  auditTypeLabel: 'Emerging Tech & GenAI Supply Chain Audit',
  rootCauseDescription: 'Targeted regulatory inspection into enterprise Generative AI integrations revealed unauthorized staff usage of external LLM endpoints, lack of cryptographic data egress tokenization, and unvetted third-party SaaS connector privileges, causing 4 new high-priority control deficiencies.',
  affectedDomains: [
    { domainNumber: '8', domainName: 'Data Security & AI DLP', incurredGaps: 1, color: '#fb923c' },
    { domainNumber: '3', domainName: 'Third-Party Risk Management', incurredGaps: 1, color: '#eab308' },
    { domainNumber: '5', domainName: 'Access Control & API Keys', incurredGaps: 1, color: '#f43f5e' },
    { domainNumber: '9', domainName: 'Threat Intelligence & Adversarial AI', incurredGaps: 1, color: '#06b6d4' }
  ],
  incurredRequirements: [
    {
      requirementCode: 'TRM-8.4.2',
      requirementTitle: 'Unsanitized PII Transmission to External Model Provider APIs',
      domainNumber: '8',
      domainName: 'Data Security',
      riskTier: 'HIGH_RISK',
      controlCategory: 'AI Model Data Loss Prevention',
      findingSummary: 'Staff prompts to commercial external LLMs contained customer NRIC and account metadata without DLP masking.',
      deficiencyReason: 'Enterprise AI gateway lacked automated presidio-based tokenization and regex PII interceptors.',
      evidenceDeficit: 'Real-time outbound payload sanitization inspection reports and cryptographic masking validation.',
      remediationAction: 'Deployed Private AI Proxy with automated deterministic tokenization stripping all sensitive financial and PII entities.',
      severity: 'HIGH',
      remediationStatus: 'REMEDIATED'
    },
    {
      requirementCode: 'TRM-3.4.1',
      requirementTitle: 'Third-Party AI Model Provider SLA & Real-Time Outage Fallback Gaps',
      domainNumber: '3',
      domainName: 'Third-Party Risk',
      riskTier: 'HIGH_RISK',
      controlCategory: 'Cloud & AI Vendor Continuity',
      findingSummary: 'Critical loan processing automated workflow relied on single cloud AI model without fallback provider redundancy.',
      deficiencyReason: 'Vendor SLA assessment lacked business continuity failover provisions for multi-region model availability.',
      evidenceDeficit: 'Automated multi-model provider failover drill verification logs.',
      remediationAction: 'Configured active-active multi-provider routing across Azure OpenAI and self-hosted private models.',
      severity: 'HIGH',
      remediationStatus: 'REMEDIATED'
    },
    {
      requirementCode: 'TRM-5.3.3',
      requirementTitle: 'Uncontrolled API Key Token Rotation for Automated AI Pipelines',
      domainNumber: '5',
      domainName: 'Access Control',
      riskTier: 'HIGH_RISK',
      controlCategory: 'Service Account API Key Management',
      findingSummary: 'Long-lived static master API keys for model provider endpoints stored in shared environment variables.',
      deficiencyReason: 'Absence of ephemeral OAuth service account binding for machine-to-machine AI integration.',
      evidenceDeficit: 'Automated 7-day API secret rotation telemetry and key usage audit trail.',
      remediationAction: 'Integrated HashiCorp Vault dynamic secret engine delivering 4-hour expiring tokens for AI pipeline workers.',
      severity: 'HIGH',
      remediationStatus: 'REMEDIATED'
    },
    {
      requirementCode: 'TRM-9.3.2',
      requirementTitle: 'Absence of Prompt-Injection & Adversarial Model Poisoning Telemetry',
      domainNumber: '9',
      domainName: 'Cyber Threat Management',
      riskTier: 'MEDIUM_RISK',
      controlCategory: 'Adversarial AI Threat Monitoring',
      findingSummary: 'Institution had no detection mechanisms for prompt injection, jailbreaking, or systemic model manipulation.',
      deficiencyReason: 'SIEM rulesets had not been updated to incorporate OWASP Top 10 for LLMs threat signatures.',
      evidenceDeficit: 'Real-time alert streaming for adversarial prompt patterns and automated blocking telemetry.',
      remediationAction: 'Integrated LlamaGuard and Lakera AI firewall telemetry into central Splunk SIEM with automated alert playbooks.',
      severity: 'MEDIUM',
      remediationStatus: 'REMEDIATED'
    }
  ],
  immediateActionTaken: 'Enforced enterprise proxy blocking unvetted LLM endpoints; deployed Private Enterprise Model Gateway with DLP data masking and automated API key vault rotation.',
  remediationMilestoneRef: 'Remediated in Mid-February 2026 Pre-Audit Internal Inspection Sprint',
  remediatedPeriodDateLabel: "Feb '26"
};

export const ComplianceGapVisualization: React.FC = () => {
  const {
    masAssessments,
    masDomains,
    findings,
    tasks,
    unifiedRemediations,
    evidence,
    generatedDocs,
    masRegulatoryProfile,
    setActiveModule,
    setFindingFilterQuery,
    theme,
    applicabilityRuleConfig,
    applicabilityRule,
    ApplicabilityRule,
    masReadinessScoreSummary,
    calculateMASReadinessScore,
    logAuditEvent,
    updateMASAssessment,
    uploadEvidence
  } = useGRC();
  const { showToast } = useToast();

  // Active ApplicabilityRule configuration and readiness summary from GRCContext
  const ruleConfig = applicabilityRuleConfig || applicabilityRule || ApplicabilityRule;
  const readinessSummary = masReadinessScoreSummary || ruleConfig?.readinessSummary;

  // View mode: Matrix Analytics vs Automated Recommendations vs Real-Time Telemetry & Audit Suites
  const [activeViewMode, setActiveViewMode] = useState<
    | 'ANALYTICS_MATRIX'
    | 'AUTOMATED_RECOMMENDATIONS'
    | 'TELEMETRY_CCM'
    | 'NOTICE_644_DOWNTIME'
    | 'NOTICE_658_SUPPLY_CHAIN'
    | 'THREAT_DEFENSE_CAPA'
    | 'AUDITOR_3LOD_PORTAL'
    | 'FEAT_GENAI_SENTINEL'
    | 'CROSS_REGULATORY_CROSSWALK'
    | 'PQC_CRYPTO_MIGRATION'
    | 'CYBER_WAR_ROOM'
    | 'BOARD_RISK_APPETITE'
  >('ANALYTICS_MATRIX');

  // State filters
  const [selectedDomain, setSelectedDomain] = useState<string>('ALL');
  const [riskFilter, setRiskFilter] = useState<'ALL' | 'HIGH_RISK_ONLY' | 'OPEN_FINDINGS_ONLY' | 'CRITICAL_SYSTEMS'>('HIGH_RISK_ONLY');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Pending Evidence' | 'Under Review' | 'Deficient' | 'Compliant'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewLayout, setViewLayout] = useState<'GRID' | 'TABLE'>('GRID');
  const [isRecalculating, setIsRecalculating] = useState<boolean>(false);
  const [lastCalculatedAt, setLastCalculatedAt] = useState<string>(() => new Date().toLocaleTimeString());

  // Recommendation action states
  const [isBulkBridging, setIsBulkBridging] = useState<boolean>(false);
  const [linkingEvidenceId, setLinkingEvidenceId] = useState<string | null>(null);
  const [scaffoldingTemplateId, setScaffoldingTemplateId] = useState<string | null>(null);

  // Chart Visualization State: Deficiency Reduction Trend vs Domain Readiness Overlay vs Combined
  const [chartDisplayMode, setChartDisplayMode] = useState<'BURNDOWN_TREND' | 'DOMAIN_OVERLAY' | 'COMBINED'>('BURNDOWN_TREND');
  const [trendTimeHorizon, setTrendTimeHorizon] = useState<'6_MONTHS' | 'YTD' | '12_MONTHS'>('6_MONTHS');
  const [showPendingInTrend, setShowPendingInTrend] = useState<boolean>(true);
  const [showReadinessInTrend, setShowReadinessInTrend] = useState<boolean>(true);

  // Key Event Annotations on Timeline Line Chart (e.g. 'Policy Updated', 'Audit Started')
  const [showKeyEventAnnotations, setShowKeyEventAnnotations] = useState<boolean>(true);
  const showMilestoneAnnotations = showKeyEventAnnotations;
  const setShowMilestoneAnnotations = setShowKeyEventAnnotations;
  const [selectedMilestoneCategory, setSelectedMilestoneCategory] = useState<string>('ALL'); // 'ALL' | 'POLICY' | 'AUDIT' | 'TECH'

  // Anomaly Detector Overlay State
  const [showAnomalyOverlay, setShowAnomalyOverlay] = useState<boolean>(true);
  const [selectedAnomaly, setSelectedAnomaly] = useState<ComplianceSpikeAnomaly | null>(null);

  // Linear Regression Trend Line & Projected Compliance Completion Date State
  const [showRegressionTrend, setShowRegressionTrend] = useState<boolean>(true);

  // AI-Driven Trend Projection Line & Remediation Velocity Forecasting State
  const [showAiTrendProjection, setShowAiTrendProjection] = useState<boolean>(true);
  const [aiVelocityScenario, setAiVelocityScenario] = useState<'BALANCED' | 'ACCELERATED' | 'CONSERVATIVE'>('BALANCED');
  const [showAiForecastDetails, setShowAiForecastDetails] = useState<boolean>(true);

  // Side-by-Side Comparison Toggle State: Projected Gap vs Actual Gap
  const [showSideBySideComparison, setShowSideBySideComparison] = useState<boolean>(false);
  const [comparisonChartType, setComparisonChartType] = useState<'CLUSTERED_BARS' | 'DUAL_LINES'>('CLUSTERED_BARS');
  const [showSideBySideMatrix, setShowSideBySideMatrix] = useState<boolean>(true);

  // Regulatory Velocity Overlay State: Rate of Compliance Improvement vs Volume of New Regulatory Requirements Released
  const [showRegulatoryVelocity, setShowRegulatoryVelocity] = useState<boolean>(true);
  const [regulatoryVelocityMode, setRegulatoryVelocityMode] = useState<'CLUSTERED_BARS' | 'SPREAD_LINE' | 'COMBINED'>('CLUSTERED_BARS');
  const [selectedVelocityPeriod, setSelectedVelocityPeriod] = useState<string | null>(null);
  const [showVelocityDetailsModal, setShowVelocityDetailsModal] = useState<boolean>(false);
  const [showVelocityEngineCard, setShowVelocityEngineCard] = useState<boolean>(true);

  // PDF Export loading state
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);

  // Ref and hover state for interactive milestone marker tooltips
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [hoveredMilestone, setHoveredMilestone] = useState<{
    point: RetrospectiveTimelinePoint;
    x: number;
    y: number;
  } | null>(null);

  // Interactive Retrospective Point Selection from Line Chart
  const [selectedSnapshotPeriod, setSelectedSnapshotPeriod] = useState<string | null>(null);
  const [retrospectiveEvidenceTab, setRetrospectiveEvidenceTab] = useState<'MISSING_GAPS' | 'ALL_REQUIRED' | 'SATISFIED_VAULT' | 'REMEDIATION_PATH'>('MISSING_GAPS');
  const [retrospectiveSearch, setRetrospectiveSearch] = useState<string>('');
  const [retrospectiveDomainFilter, setRetrospectiveDomainFilter] = useState<string>('ALL');

  // Drill-down slide-over modal state
  const [selectedRequirement, setSelectedRequirement] = useState<EnrichedMASRequirement | null>(null);
  const [drillDownTab, setDrillDownTab] = useState<'EVIDENCE_VAULT' | 'OPEN_FINDINGS' | 'REQUIREMENT_DETAILS' | 'RECOMMENDED_EVIDENCE'>('EVIDENCE_VAULT');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Interactive in-place drilldown expansion state for requirements
  const [expandedReqCodes, setExpandedReqCodes] = useState<Set<string>>(new Set());

  const toggleRequirementExpansion = (reqCode: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setExpandedReqCodes((prev) => {
      const next = new Set(prev);
      if (next.has(reqCode)) {
        next.delete(reqCode);
      } else {
        next.add(reqCode);
      }
      return next;
    });
  };

  const expandAllRequirements = () => {
    setExpandedReqCodes(new Set(filteredRequirements.map((r) => r.requirementCode)));
  };

  const collapseAllRequirements = () => {
    setExpandedReqCodes(new Set());
  };

  // Quick upload modal simulation
  const [uploadProofModalOpen, setUploadProofModalOpen] = useState<boolean>(false);
  const [proofTitle, setProofTitle] = useState<string>('');
  const [proofFile, setProofFile] = useState<string>('Audit_Proof_Artifact.pdf');
  const [proofDept, setProofDept] = useState<string>('IT & Infrastructure');

  const handleRecalculateMetrics = () => {
    setIsRecalculating(true);
    setTimeout(() => {
      calculateMASReadinessScore?.();
      logAuditEvent?.(
        'UPDATE',
        'MAS_TRM_READINESS',
        'Triggered manual MAS TRM readiness recalculation based on requirement criticality, open findings, and evidence status'
      );
      setIsRecalculating(false);
      setLastCalculatedAt(new Date().toLocaleTimeString());
    }, 500);
  };

  // Correlate Requirements with Assessments, Findings, and Evidence Vault records
  const enrichedRequirements: EnrichedMASRequirement[] = useMemo(() => {
    const rawReqs = MAS_TRM_REQUIREMENTS || [];

    return rawReqs.map((req) => {
      // 1. Find matching assessment
      const assess = masAssessments.find(
        (a) => a.requirementCode === req.requirementCode || a.id.includes(req.requirementCode)
      );

      // 2. Correlate open findings
      const linkedIsoCodes = req.crossFrameworkMappings?.iso27001 || [];
      const openFindings = findings.filter((f) => {
        // Is finding open or under remediation?
        const isOpen = f.status !== 'Closed Verified';
        if (!isOpen) return false;

        // Check explicit ID link in assessment
        if (assess?.linkedFindingIds?.includes(f.id) || assess?.linkedFindingIds?.includes(f.findingCode)) {
          return true;
        }

        // Check ISO control code match
        const findingControl = (f.clauseOrControl || '').toLowerCase();
        const matchesIso = linkedIsoCodes.some((isoCode) =>
          findingControl.includes(isoCode.toLowerCase())
        );
        if (matchesIso) return true;

        // Check requirement code in title or description
        const text = `${f.title} ${f.description || ''} ${f.clauseOrControl || ''}`.toLowerCase();
        if (text.includes(req.requirementCode.toLowerCase())) return true;

        // Specific high-risk keyword mapping
        if (req.requirementCode === 'MAS-TRM-8.1' && (text.includes('privileged access') || text.includes('access control') || text.includes('a.5.15'))) return true;
        if (req.requirementCode === 'MAS-TRM-12.1' && (text.includes('failover') || text.includes('disaster recovery') || text.includes('a.5.23') || text.includes('rto'))) return true;
        if (req.requirementCode === 'MAS-TRM-8.3' && (text.includes('vulnerability') || text.includes('patch') || text.includes('a.8.8'))) return true;
        if (req.requirementCode === 'MAS-TRM-5.1' && (text.includes('vendor') || text.includes('supplier') || text.includes('a.5.19'))) return true;

        return false;
      });

      // 3. Correlate associated evidence from Evidence Vault
      const associatedEvidence = evidence.filter((ev) => {
        // Direct link in assessment
        if (assess?.linkedEvidenceIds?.includes(ev.id)) return true;

        // Control code match
        const evControl = (ev.controlCode || '').toLowerCase();
        if (linkedIsoCodes.some((iso) => evControl.includes(iso.toLowerCase()))) return true;

        // Tags or requirement code match
        if (ev.tags?.some((t) => t.toLowerCase().includes(req.requirementCode.toLowerCase()))) return true;

        // Domain keyword match
        if (req.requirementCode.startsWith('MAS-TRM-3') && ev.tags?.includes('Mandatory Governance')) return true;
        if (req.requirementCode.startsWith('MAS-TRM-8') && (ev.tags?.includes('Annex A.5.15') || ev.tags?.includes('Cyber Hygiene'))) return true;
        if (req.requirementCode.startsWith('MAS-TRM-5') && ev.tags?.includes('Third-Party Due Diligence')) return true;
        if (req.requirementCode.startsWith('MAS-TRM-12') && ev.tags?.includes('BCP')) return true;

        return false;
      });

      // Central detail from GRCContext readiness engine if available
      const centralDetail = readinessSummary?.details?.[req.requirementCode];

      let readinessScore: number;
      let riskTier: EnrichedMASRequirement['riskTier'];
      let riskScore: number;
      let statutoryMandateType: EnrichedMASRequirement['statutoryMandateType'];
      let evidenceGapIdentified: boolean;

      const verifiedEvidenceCount = associatedEvidence.filter(
        (e) => e.verificationState === 'Verified' || e.status === 'Verified'
      ).length;
      const pendingEvidenceCount = associatedEvidence.filter(
        (e) =>
          e.verificationState === 'Pending Review' ||
          e.verificationState === 'Draft' ||
          e.status === 'Pending Review' ||
          e.status === 'Draft'
      ).length;

      if (centralDetail) {
        readinessScore = centralDetail.readinessScore;
        riskTier = centralDetail.riskTier;
        riskScore = centralDetail.riskScore;
        statutoryMandateType = centralDetail.statutoryMandateType;
        evidenceGapIdentified = centralDetail.evidenceGapIdentified;
      } else {
        // Fallback local calculation
        let baseScore = 75;
        if (assess) {
          if (assess.complianceStatus === 'COMPLIANT') baseScore = 95;
          else if (assess.complianceStatus === 'PARTIALLY_COMPLIANT') baseScore = 62;
          else if (assess.complianceStatus === 'NON_COMPLIANT') baseScore = 20;

          if (assess.maturityLevel >= 4) baseScore = Math.min(100, baseScore + 5);
          if (assess.maturityLevel <= 2) baseScore = Math.max(10, baseScore - 15);
          if (assess.testedSamplesFailedCount > 0) {
            baseScore = Math.max(10, baseScore - (assess.testedSamplesFailedCount * 8));
          }
        }

        openFindings.forEach((f) => {
          if (f.severity === 'Major Non-Conformity') baseScore -= 25;
          else if (f.severity === 'Minor Non-Conformity') baseScore -= 12;
          else baseScore -= 4;
        });

        readinessScore = Math.max(5, Math.min(100, Math.round(baseScore)));

        statutoryMandateType = 'TRM_2021_GUIDELINES';
        if (req.requirementCode.startsWith('MAS-TRM-8') || req.requirementCode.startsWith('MAS-TRM-7')) {
          statutoryMandateType = 'NOTICE_655_CYBER_HYGIENE';
        } else if (req.criticalSystemsMandate || req.requirementCode.startsWith('MAS-TRM-12') || req.requirementCode.startsWith('MAS-TRM-11')) {
          statutoryMandateType = 'NOTICE_644_CRITICAL_SYSTEMS';
        } else if (req.requirementCode.startsWith('MAS-TRM-5')) {
          statutoryMandateType = 'OUTSOURCING_MANDATE';
        }

        const hasMajorFinding = openFindings.some((f) => f.severity === 'Major Non-Conformity');
        const isCriticalMandateWithFindings = (req.criticalSystemsMandate || statutoryMandateType === 'NOTICE_655_CYBER_HYGIENE') && openFindings.length > 0;
        const isLowReadiness = readinessScore < 60;

        riskTier = 'LOW_RISK';
        riskScore = 100 - readinessScore;

        if (hasMajorFinding || isLowReadiness || (isCriticalMandateWithFindings && readinessScore < 75)) {
          riskTier = 'HIGH_RISK';
          riskScore = Math.max(75, riskScore + (hasMajorFinding ? 20 : 10));
        } else if (openFindings.length > 0 || readinessScore < 80 || assess?.complianceStatus === 'PARTIALLY_COMPLIANT') {
          riskTier = 'MEDIUM_RISK';
          riskScore = Math.max(40, Math.min(74, riskScore));
        } else {
          riskTier = 'LOW_RISK';
          riskScore = Math.min(39, riskScore);
        }

        evidenceGapIdentified = verifiedEvidenceCount === 0 && (riskTier === 'HIGH_RISK' || riskTier === 'MEDIUM_RISK');
      }

      const hasMajorFinding = openFindings.some((f) => f.severity === 'Major Non-Conformity');
      const isAssessmentNonCompliant = assess?.complianceStatus === 'NON_COMPLIANT';

      let complianceStatusBadge: MASRequirementComplianceBadgeStatus;

      // 1. Deficient: Has Major Non-Conformity, explicit non-compliance, or low readiness with open findings
      if (hasMajorFinding || isAssessmentNonCompliant || readinessScore < 50 || (openFindings.length > 0 && readinessScore < 65)) {
        complianceStatusBadge = 'Deficient';
      } else if (associatedEvidence.length === 0 || (verifiedEvidenceCount === 0 && pendingEvidenceCount === 0 && evidenceGapIdentified)) {
        // 2. Pending Evidence: Zero evidence uploaded or identified evidence gap without any pending review items
        complianceStatusBadge = 'Pending Evidence';
      } else if (
        pendingEvidenceCount > 0 ||
        (associatedEvidence.length > 0 && verifiedEvidenceCount === 0) ||
        assess?.complianceStatus === 'PARTIALLY_COMPLIANT' ||
        openFindings.some((f) => f.severity === 'Minor Non-Conformity') ||
        (readinessScore >= 50 && readinessScore < 75)
      ) {
        // 3. Under Review: Evidence submitted and awaiting validation, or active remediation on minor observations
        complianceStatusBadge = 'Under Review';
      } else {
        // 4. Compliant: Fully verified evidence artifacts, robust readiness score, zero critical gaps
        complianceStatusBadge = 'Compliant';
      }

      return {
        id: req.id,
        requirementCode: req.requirementCode,
        title: req.title,
        domainNumber: req.domainNumber,
        domainName: req.domainName,
        statement: req.statement,
        intentAndGuidance: req.intentAndGuidance,
        regulatorySourceRef: req.regulatorySourceRef,
        mandatoryForFIs: req.mandatoryForFIs,
        criticalSystemsMandate: req.criticalSystemsMandate,
        responsibleRoles: req.responsibleRoles,
        crossFrameworkMappings: req.crossFrameworkMappings,
        assessment: assess,
        readinessScore,
        riskTier,
        riskScore: Math.min(100, riskScore),
        openFindings,
        associatedEvidence,
        evidenceGapIdentified,
        statutoryMandateType,
        complianceStatusBadge
      };
    });
  }, [masAssessments, findings, evidence, readinessSummary]);

  // Automated Evidence Recommendation Engine: Executive Gap Remediation Summary
  const gapExecutiveSummary = useMemo(() => {
    return generateExecutiveGapRemediationSummary(enrichedRequirements, evidence, masAssessments);
  }, [enrichedRequirements, evidence, masAssessments]);

  // Fast O(1) recommendation lookup map by requirementCode
  const recommendationsMap = useMemo(() => {
    const map = new Map<string, RequirementGapRecommendation>();
    gapExecutiveSummary.recommendations.forEach((rec) => {
      map.set(rec.requirementCode, rec);
    });
    return map;
  }, [gapExecutiveSummary]);

  // Immediate Wins: Deficient/Pending requirements with verified matching EvidenceVault items ready to link
  const immediateWins = useMemo(() => {
    return gapExecutiveSummary.recommendations.filter(
      (r) => r.topMatch && r.topMatch.recommendedAction === 'LINK_EXISTING_EVIDENCE'
    );
  }, [gapExecutiveSummary]);

  // Recommendation for currently selected requirement in slide-over inspector
  const selectedRequirementRec = useMemo(() => {
    if (!selectedRequirement) return null;
    return recommendationsMap.get(selectedRequirement.requirementCode) || null;
  }, [selectedRequirement, recommendationsMap]);

  // 1-Click Bridge for a specific requirement
  const handleQuickLinkEvidence = (reqCode: string, match: EvidenceVaultMatch) => {
    try {
      setLinkingEvidenceId(match.evidence.id);
      const assess = masAssessments.find((a) => a.requirementCode === reqCode || a.id.includes(reqCode));
      if (assess) {
        const existingIds = assess.linkedEvidenceIds || [];
        if (!existingIds.includes(match.evidence.id)) {
          updateMASAssessment(assess.id, {
            linkedEvidenceIds: [...existingIds, match.evidence.id],
            complianceStatus: assess.complianceStatus === 'NON_COMPLIANT' ? 'PARTIALLY_COMPLIANT' : assess.complianceStatus
          });
        }
      }

      logAuditEvent(
        'UPDATE',
        'AUTOMATED_EVIDENCE_RECOMMENDER',
        `Quick-linked EvidenceVault item "${match.evidence.title}" to bridge regulatory gap for ${reqCode}.`
      );

      showToast({
        type: 'success',
        title: 'Evidence Gap Bridged',
        message: `Successfully linked "${match.evidence.title}" to ${reqCode}. Projected +${match.projectedReadinessUplift}% readiness uplift applied!`
      });
    } catch (err) {
      console.error('Failed to link evidence:', err);
      showToast({
        type: 'error',
        title: 'Linking Failed',
        message: 'Could not associate evidence artifact.'
      });
    } finally {
      setLinkingEvidenceId(null);
    }
  };

  // Bulk Auto-Bridge all high-confidence immediate wins
  const handleBulkBridgeAllWins = async () => {
    if (immediateWins.length === 0) return;
    setIsBulkBridging(true);
    try {
      let linkedCount = 0;
      for (const win of immediateWins) {
        if (!win.topMatch) continue;
        const assess = masAssessments.find(
          (a) => a.requirementCode === win.requirementCode || a.id.includes(win.requirementCode)
        );
        if (assess) {
          const existingIds = assess.linkedEvidenceIds || [];
          if (!existingIds.includes(win.topMatch.evidence.id)) {
            updateMASAssessment(assess.id, {
              linkedEvidenceIds: [...existingIds, win.topMatch.evidence.id],
              complianceStatus: assess.complianceStatus === 'NON_COMPLIANT' ? 'PARTIALLY_COMPLIANT' : assess.complianceStatus
            });
            linkedCount++;
          }
        }
      }

      logAuditEvent(
        'UPDATE',
        'AUTOMATED_EVIDENCE_RECOMMENDER',
        `Batch linked ${linkedCount} high-confidence EvidenceVault artifacts to bridge MAS TRM deficiencies.`
      );

      showToast({
        type: 'success',
        title: 'Batch Auto-Bridge Complete',
        message: `Successfully linked ${linkedCount} EvidenceVault artifacts across deficient & pending requirements!`
      });
    } catch (err) {
      console.error('Batch linking failed:', err);
      showToast({
        type: 'error',
        title: 'Batch Linking Failed',
        message: 'An error occurred during automated gap bridging.'
      });
    } finally {
      setIsBulkBridging(false);
    }
  };

  // Scaffold Prescribed Template into EvidenceVault
  const handleScaffoldTemplate = async (reqCode: string, template: PrescribedEvidenceTemplate) => {
    try {
      setScaffoldingTemplateId(template.templateId);
      await uploadEvidence({
        title: template.title,
        controlCode: template.controlCode,
        department: template.department,
        fileName: template.suggestedFileName,
        fileSize: '1.4 MB (Scaffolded)',
        fileType: template.suggestedFileType,
        tags: [...template.tags, reqCode, 'AI-Scaffolded-Request'],
        initialStatus: 'Pending Review',
        documentExcerpt: `Automated compliance request scaffolded to bridge regulatory gap for ${reqCode}. Prescribed mandatory safeguards: ${template.mandatorySafeguards.join('; ')}.`
      });

      logAuditEvent(
        'CREATE',
        'EVIDENCE_VAULT_SCAFFOLD',
        `Scaffolded evidence placeholder "${template.title}" in EvidenceVault to remediate ${reqCode}.`
      );

      showToast({
        type: 'success',
        title: 'Evidence Request Scaffolded',
        message: `Created placeholder "${template.title}" in EvidenceVault and assigned to ${template.department}.`
      });
    } catch (err) {
      console.error('Scaffolding template failed:', err);
      showToast({
        type: 'error',
        title: 'Scaffolding Failed',
        message: 'Could not create evidence request in EvidenceVault.'
      });
    } finally {
      setScaffoldingTemplateId(null);
    }
  };

  // Pre-select the highest risk requirement when initial requirements load if none selected
  React.useEffect(() => {
    if (!selectedRequirement && enrichedRequirements.length > 0) {
      const topHighRisk = enrichedRequirements.find((r) => r.riskTier === 'HIGH_RISK') || enrichedRequirements[0];
      setSelectedRequirement(topHighRisk);
    }
  }, [enrichedRequirements, selectedRequirement]);

  // Aggregate stats
  const metrics = useMemo(() => {
    const total = enrichedRequirements.length;
    const highRiskReqs = enrichedRequirements.filter((r) => r.riskTier === 'HIGH_RISK');
    const mediumRiskReqs = enrichedRequirements.filter((r) => r.riskTier === 'MEDIUM_RISK');
    const lowRiskReqs = enrichedRequirements.filter((r) => r.riskTier === 'LOW_RISK');

    const totalOpenFindings = readinessSummary?.totalOpenFindings ?? enrichedRequirements.reduce((acc, r) => acc + r.openFindings.length, 0);
    const majorNonConformities = readinessSummary?.majorNonConformitiesCount ?? enrichedRequirements.reduce(
      (acc, r) => acc + r.openFindings.filter((f) => f.severity === 'Major Non-Conformity').length,
      0
    );

    const avgReadiness = readinessSummary?.overallReadinessScore ?? (
      total > 0 ? Math.round(enrichedRequirements.reduce((acc, r) => acc + r.readinessScore, 0) / total) : 0
    );

    const reqsWithVerifiedEvidence = enrichedRequirements.filter(
      (r) => r.associatedEvidence.some((e) => e.verificationState === 'Verified' || e.status === 'Verified')
    ).length;

    const evidenceCoverageRate = readinessSummary?.evidenceCoverageRate ?? (
      total > 0 ? Math.round((reqsWithVerifiedEvidence / total) * 100) : 0
    );

    const criticalSystemsReadiness = readinessSummary?.criticalSystemsReadiness ?? 82;
    const cyberHygieneNotice655Readiness = readinessSummary?.cyberHygieneNotice655Readiness ?? 85;

    const compliantCount = enrichedRequirements.filter((r) => r.complianceStatusBadge === 'Compliant').length;
    const underReviewCount = enrichedRequirements.filter((r) => r.complianceStatusBadge === 'Under Review').length;
    const pendingEvidenceCount = enrichedRequirements.filter((r) => r.complianceStatusBadge === 'Pending Evidence').length;
    const deficientCount = enrichedRequirements.filter((r) => r.complianceStatusBadge === 'Deficient').length;

    return {
      total,
      highRiskCount: readinessSummary?.highRiskCount ?? highRiskReqs.length,
      mediumRiskCount: readinessSummary?.mediumRiskCount ?? mediumRiskReqs.length,
      lowRiskCount: readinessSummary?.lowRiskCount ?? lowRiskReqs.length,
      totalOpenFindings,
      majorNonConformities,
      avgReadiness,
      evidenceCoverageRate,
      criticalSystemsReadiness,
      cyberHygieneNotice655Readiness,
      compliantCount,
      underReviewCount,
      pendingEvidenceCount,
      deficientCount
    };
  }, [enrichedRequirements, readinessSummary]);

  // Domain Chart Data for Recharts Dual-Overlay (Readiness Score % vs Open Findings)
  const domainOverlayChartData = useMemo(() => {
    // Unique domains
    const domainMap = new Map<string, {
      domainNumber: string;
      domainName: string;
      totalReqs: number;
      readinessSum: number;
      openFindingsCount: number;
      majorFindingsCount: number;
      highRiskCount: number;
    }>();

    enrichedRequirements.forEach((r) => {
      const key = r.domainNumber;
      const existing = domainMap.get(key) || {
        domainNumber: r.domainNumber,
        domainName: r.domainName,
        totalReqs: 0,
        readinessSum: 0,
        openFindingsCount: 0,
        majorFindingsCount: 0,
        highRiskCount: 0
      };

      existing.totalReqs += 1;
      existing.readinessSum += r.readinessScore;
      existing.openFindingsCount += r.openFindings.length;
      existing.majorFindingsCount += r.openFindings.filter((f) => f.severity === 'Major Non-Conformity').length;
      if (r.riskTier === 'HIGH_RISK') existing.highRiskCount += 1;

      domainMap.set(key, existing);
    });

    return Array.from(domainMap.values())
      .sort((a, b) => parseFloat(a.domainNumber) - parseFloat(b.domainNumber))
      .map((d) => ({
        domainNumber: d.domainNumber,
        label: `Dom ${d.domainNumber}`,
        fullName: d.domainName,
        readinessScore: Math.round(d.readinessSum / (d.totalReqs || 1)),
        openFindings: d.openFindingsCount,
        majorFindings: d.majorFindingsCount,
        highRiskReqs: d.highRiskCount,
        totalReqs: d.totalReqs
      }));
  }, [enrichedRequirements]);

  // Master Repository of New Regulatory Releases & Compliance Improvement Velocities across Horizons
  const getPeriodRegulatoryVelocity = (
    period: string,
    dateLabel: string,
    timestamp: string
  ): PeriodRegulatoryVelocityData => {
    const p = period.toLowerCase();

    if (p.includes('apr 2025')) {
      return {
        period,
        dateLabel,
        timestamp,
        improvementRate: 2.0,
        readinessDeltaPct: 4,
        verifiedControlsCount: 2,
        newRequirementsVolume: 4,
        releasedRequirements: [
          {
            id: 'REL-2025-04-01',
            title: 'Initial MAS TRM Supervisory Baseline Framework Mandate',
            authority: 'MAS',
            circularRef: 'MAS TRM Supervisory Assessment Circular 2025/04',
            domainNumber: '01',
            domainName: 'IT Governance and Risk Management',
            summary: 'Formal mandate establishing mandatory continuous risk scoring and Board-level technology committee escalation protocols.',
            mandatoryClausesCount: 2,
            severity: 'HIGH',
            effectiveDate: '2025-04-15',
            remediationActionSummary: 'Chartered IT Steering Committee and instituted weekly cyber posture telemetry.'
          },
          {
            id: 'REL-2025-04-02',
            title: 'ISO/IEC 27001:2022 Control Harmonization Mandate',
            authority: 'ISO/IEC',
            circularRef: 'ISO 27001:2022 Transition Directive §5.23',
            domainNumber: '02',
            domainName: 'Identity and Access Management',
            summary: 'Mandates mapping of legacy ISO 27001:2013 controls to the 93 restructured controls under the 2022 standard.',
            mandatoryClausesCount: 2,
            severity: 'MEDIUM',
            effectiveDate: '2025-04-20',
            remediationActionSummary: 'Completed Statement of Applicability cross-walk in Evidence Recommendation Hub.'
          }
        ],
        netVelocity: -2.0,
        velocityRatio: 0.5,
        velocityStatus: 'LAGGING',
        velocityStatusLabel: 'Regulatory Influx Exceeding Remediation Pace',
        absorptionRatePct: 33
      };
    }

    if (p.includes('jun 2025')) {
      return {
        period,
        dateLabel,
        timestamp,
        improvementRate: 4.0,
        readinessDeltaPct: 7,
        verifiedControlsCount: 4,
        newRequirementsVolume: 2,
        releasedRequirements: [
          {
            id: 'REL-2025-06-01',
            title: 'Network Zoning & Perimeter Micro-Segmentation Standard',
            authority: 'MAS',
            circularRef: 'MAS Advisory BSD/2025/06',
            domainNumber: '01',
            domainName: 'Network Security',
            summary: 'Enforces strict isolation of payment gateways, SWIFT interfaces, and core banking databases from general corporate networks.',
            mandatoryClausesCount: 2,
            severity: 'CRITICAL',
            effectiveDate: '2025-06-12',
            remediationActionSummary: 'Steering committee signed off on perimeter zero-trust zoning and automated ingress filtering.'
          }
        ],
        netVelocity: 2.0,
        velocityRatio: 2.0,
        velocityStatus: 'OUTPACING',
        velocityStatusLabel: 'Remediation Outpacing Regulatory Influx',
        absorptionRatePct: 67
      };
    }

    if (p.includes('sep 2025')) {
      return {
        period,
        dateLabel,
        timestamp,
        improvementRate: 2.5,
        readinessDeltaPct: 1,
        verifiedControlsCount: 2,
        newRequirementsVolume: 6,
        releasedRequirements: [
          {
            id: 'REL-2025-09-01',
            title: 'MAS Supervisory Red-Team Penetration Testing Mandate',
            authority: 'MAS',
            circularRef: 'MAS Advisory TRM-RT/2025/09',
            domainNumber: '04',
            domainName: 'Vulnerability Assessment',
            summary: 'Mandates independent threat-led adversarial red-teaming (TLPT) simulating nation-state APT kill-chains across core banking infrastructure.',
            mandatoryClausesCount: 3,
            severity: 'CRITICAL',
            effectiveDate: '2025-09-10',
            remediationActionSummary: 'Engaged Mandiant for comprehensive red-team engagement covering multi-cloud IAM delegation.'
          },
          {
            id: 'REL-2025-09-02',
            title: 'Multi-Cloud Service Mesh Mutual TLS Encryption',
            authority: 'CSA Singapore',
            circularRef: 'CII Directive 2025/09',
            domainNumber: '08',
            domainName: 'Data Security and Privacy',
            summary: 'Requires cryptographically verified mutual TLS (mTLS) with automated SPIFFE/SPIRE certificate rotation on all inter-service calls.',
            mandatoryClausesCount: 3,
            severity: 'HIGH',
            effectiveDate: '2025-09-18',
            remediationActionSummary: 'Enforced Istio mTLS strict mode with automated 12-hour cert rotation.'
          }
        ],
        netVelocity: -3.5,
        velocityRatio: 0.42,
        velocityStatus: 'LAGGING',
        velocityStatusLabel: 'Regulatory Influx Spike (Red-Team Finding Influx)',
        absorptionRatePct: 29
      };
    }

    if (p.includes('oct 2025')) {
      return {
        period,
        dateLabel,
        timestamp,
        improvementRate: 4.0,
        readinessDeltaPct: 8,
        verifiedControlsCount: 4,
        newRequirementsVolume: 3,
        releasedRequirements: [
          {
            id: 'REL-2025-10-01',
            title: 'Notice 655 Addendum: Mandatory 2FA for Privileged Consoles',
            authority: 'MAS',
            circularRef: 'Notice 655 Addendum §4.1',
            domainNumber: '02',
            domainName: 'Identity and Access Management',
            summary: 'Requires biometric or hardware token 2FA for all administrative tenant consoles and bastion jump-hosts.',
            mandatoryClausesCount: 2,
            severity: 'CRITICAL',
            effectiveDate: '2025-10-15',
            remediationActionSummary: 'Deployed hardware tokens and conditional access policies eliminating shared root access.'
          },
          {
            id: 'REL-2025-10-02',
            title: 'Weekly Vulnerability Patch Telemetry Verification',
            authority: 'MAS',
            circularRef: 'Notice 655 Addendum §6.3',
            domainNumber: '04',
            domainName: 'Vulnerability Assessment',
            summary: 'Mandates financial institutions cross-correlate weekly automated patch telemetry with active production configuration management databases.',
            mandatoryClausesCount: 1,
            severity: 'HIGH',
            effectiveDate: '2025-10-22',
            remediationActionSummary: 'Automated Qualys patch sync into Jira Service Management with automated verification.'
          }
        ],
        netVelocity: 1.0,
        velocityRatio: 1.33,
        velocityStatus: 'OUTPACING',
        velocityStatusLabel: 'Notice 655 Sprint Outpacing Influx',
        absorptionRatePct: 57
      };
    }

    if (p.includes('nov 2025')) {
      return {
        period,
        dateLabel,
        timestamp,
        improvementRate: 3.0,
        readinessDeltaPct: 3,
        verifiedControlsCount: 3,
        newRequirementsVolume: 5,
        releasedRequirements: [
          {
            id: 'REL-2025-11-01',
            title: 'M&A Infrastructure Micro-Segmentation & Boundary Isolation',
            authority: 'MAS',
            circularRef: 'MAS Advisory BSD/2025/11',
            domainNumber: '01',
            domainName: 'Network Security',
            summary: 'Strict cryptographic separation and zero-trust perimeter verification for newly acquired subsidiary microservices.',
            mandatoryClausesCount: 2,
            severity: 'CRITICAL',
            effectiveDate: '2025-11-10',
            remediationActionSummary: 'Deployed Palo Alto NGFW zoning between core banking and legacy subsidiary networks.'
          },
          {
            id: 'REL-2025-11-02',
            title: 'Automated Credential Rotation for Core Banking Microservices',
            authority: 'MAS',
            circularRef: 'MAS TRM §8.2 Expansion',
            domainNumber: '02',
            domainName: 'Identity and Access Management',
            summary: 'Prohibits hardcoded credentials in microservice container definitions; enforces dynamic short-lived HashiCorp Vault tokens.',
            mandatoryClausesCount: 2,
            severity: 'HIGH',
            effectiveDate: '2025-11-18',
            remediationActionSummary: 'Migrated 42 microservices to automated 24-hour HashiCorp Vault leased credentials.'
          },
          {
            id: 'REL-2025-11-03',
            title: 'Cross-Border Layer-2 Line-Rate Interconnect Encryption',
            authority: 'CSA Singapore',
            circularRef: 'CII Directive 2025/11 §3',
            domainNumber: '08',
            domainName: 'Data Security and Privacy',
            summary: 'Mandatory MACsec Layer 2 line-rate encryption for all AWS Direct Connect and Azure ExpressRoute links.',
            mandatoryClausesCount: 1,
            severity: 'HIGH',
            effectiveDate: '2025-11-25',
            remediationActionSummary: 'Configured 10Gbps line-rate MACsec key exchanges on edge routers.'
          }
        ],
        netVelocity: -2.0,
        velocityRatio: 0.6,
        velocityStatus: 'LAGGING',
        velocityStatusLabel: 'Subsidiary M&A Influx Drag',
        absorptionRatePct: 38
      };
    }

    if (p.includes('dec 2025')) {
      return {
        period,
        dateLabel,
        timestamp,
        improvementRate: 4.5,
        readinessDeltaPct: 11,
        verifiedControlsCount: 5,
        newRequirementsVolume: 2,
        releasedRequirements: [
          {
            id: 'REL-2025-12-01',
            title: 'Cryptographic SHA-256 Audit Trail Immutability',
            authority: 'MAS',
            circularRef: 'MAS TRM Circular 2025/12',
            domainNumber: '09',
            domainName: 'Security Logging and Monitoring',
            summary: 'Requires tamper-evident cryptographic hashing and write-once-read-many (WORM) storage for all supervisory compliance evidence.',
            mandatoryClausesCount: 1,
            severity: 'HIGH',
            effectiveDate: '2025-12-08',
            remediationActionSummary: 'Deployed S3 Object Lock in compliance mode with automated SHA-256 hashing.'
          },
          {
            id: 'REL-2025-12-02',
            title: 'Multi-Cloud Control Plane Telemetry Ingestion',
            authority: 'ISO/IEC',
            circularRef: 'ISO 27001:2022 §8.15 Addendum',
            domainNumber: '09',
            domainName: 'Security Logging and Monitoring',
            summary: 'Centralized automated streaming of AWS CloudTrail and Azure Activity logs with zero-drop retention guarantees.',
            mandatoryClausesCount: 1,
            severity: 'MEDIUM',
            effectiveDate: '2025-12-20',
            remediationActionSummary: 'Configured real-time Kafka ingest pipelines into central Splunk Enterprise instance.'
          }
        ],
        netVelocity: 2.5,
        velocityRatio: 2.25,
        velocityStatus: 'OUTPACING',
        velocityStatusLabel: 'EvidenceVault Acceleration (Net Lead)',
        absorptionRatePct: 69
      };
    }

    if (p.includes('jan 2026') || p.includes("jan '10") || p.includes("jan '22")) {
      const isSpike = p.includes('late') || p.includes('22');
      return {
        period,
        dateLabel,
        timestamp,
        improvementRate: isSpike ? 2.5 : 3.5,
        readinessDeltaPct: isSpike ? 2 : 5,
        verifiedControlsCount: isSpike ? 2 : 4,
        newRequirementsVolume: isSpike ? 4 : 6,
        releasedRequirements: [
          {
            id: 'REL-2026-01-01',
            title: 'Generative AI & LLM Model Security Governance Mandate',
            authority: 'MAS',
            circularRef: 'MAS GenAI Supervisory Framework 2026/01',
            domainNumber: '11',
            domainName: 'Emerging Tech Governance',
            summary: 'Enforces mandatory prompt injection defense, real-time DLP redaction on external LLM prompts, and training weights provenance logs.',
            mandatoryClausesCount: 3,
            severity: 'CRITICAL',
            effectiveDate: '2026-01-12',
            remediationActionSummary: 'Implemented AI Gateway proxy with NeMo Guardrails and cryptographic outbound payload inspection.'
          },
          {
            id: 'REL-2026-01-02',
            title: 'Annual Multi-Cloud Identity Delegation & Privilege Recertification',
            authority: 'MAS',
            circularRef: 'MAS TRM §5.4 Annual Revision',
            domainNumber: '02',
            domainName: 'Identity and Access Management',
            summary: 'Mandatory quarterly automated access reviews for all cross-account IAM role assumptions and enterprise service accounts.',
            mandatoryClausesCount: 2,
            severity: 'HIGH',
            effectiveDate: '2026-01-18',
            remediationActionSummary: 'Configured automated Okta Access Certifications across all production AWS accounts.'
          },
          {
            id: 'REL-2026-01-03',
            title: 'NIST CSF 2.0 Governance Category Harmonization Directives',
            authority: 'NIST',
            circularRef: 'Harmonization Circular 2026/01',
            domainNumber: '12',
            domainName: 'Third-Party Risk Management',
            summary: 'Mandatory continuous vendor risk scoring and fourth-party dependency mapping for cloud SaaS providers.',
            mandatoryClausesCount: 1,
            severity: 'MEDIUM',
            effectiveDate: '2026-01-28',
            remediationActionSummary: 'Integrated SecurityScorecard continuous API monitoring for Tier 1 cloud vendors.'
          }
        ],
        netVelocity: isSpike ? -1.5 : -2.5,
        velocityRatio: isSpike ? 0.63 : 0.58,
        velocityStatus: 'LAGGING',
        velocityStatusLabel: 'Annual Supervisory Influx Absorption',
        absorptionRatePct: isSpike ? 38 : 37
      };
    }

    if (p.includes('feb 2026') || p.includes('feb 15') || p.includes("feb '26")) {
      return {
        period,
        dateLabel,
        timestamp,
        improvementRate: 4.2,
        readinessDeltaPct: 7,
        verifiedControlsCount: 5,
        newRequirementsVolume: 2,
        releasedRequirements: [
          {
            id: 'REL-2026-02-01',
            title: 'Automated Disaster Recovery RTO/RPO Drill Signoffs',
            authority: 'MAS',
            circularRef: 'Notice 655 Annex 1 Drill Spec',
            domainNumber: '07',
            domainName: 'Disaster Recovery and BCP',
            summary: 'Financial institutions must execute automated semi-annual live DR cutover exercises proving RTO < 2 hours and RPO < 15 minutes.',
            mandatoryClausesCount: 1,
            severity: 'CRITICAL',
            effectiveDate: '2026-02-08',
            remediationActionSummary: 'Executed automated Aurora Global Database cross-region failover in 8 minutes.'
          },
          {
            id: 'REL-2026-02-02',
            title: 'Level-2 CIS Benchmark Configuration Baseline',
            authority: 'MAS',
            circularRef: 'MAS TRM §9.1 CIS Spec',
            domainNumber: '05',
            domainName: 'Configuration and Patch Management',
            summary: 'Mandatory continuous configuration audits against CIS Level 2 hardening benchmarks for all Kubernetes clusters.',
            mandatoryClausesCount: 1,
            severity: 'HIGH',
            effectiveDate: '2026-02-18',
            remediationActionSummary: 'Enforced Kyverno admission controllers blocking non-compliant container configs.'
          }
        ],
        netVelocity: 2.2,
        velocityRatio: 2.1,
        velocityStatus: 'OUTPACING',
        velocityStatusLabel: 'Remediation Outpacing Regulatory Influx',
        absorptionRatePct: 68
      };
    }

    if (p.includes('mar 2026') || p.includes('now') || p.includes('live')) {
      return {
        period,
        dateLabel,
        timestamp,
        improvementRate: 3.8,
        readinessDeltaPct: 5,
        verifiedControlsCount: 4,
        newRequirementsVolume: 1,
        releasedRequirements: [
          {
            id: 'REL-2026-03-01',
            title: 'Continuous Technology Risk Assurance & Live Telemetry Protocol',
            authority: 'MAS',
            circularRef: 'MAS Advisory BSD/2026/03',
            domainNumber: '09',
            domainName: 'Security Logging and Monitoring',
            summary: 'Formal supervisory shift from annual static sample tests to live API-driven evidence ingestion into regulatory auditor portals.',
            mandatoryClausesCount: 1,
            severity: 'HIGH',
            effectiveDate: '2026-03-12',
            remediationActionSummary: 'Evidence Vault live streaming endpoint certified with cryptographic SHA-256 auditor receipts.'
          }
        ],
        netVelocity: 2.8,
        velocityRatio: 3.8,
        velocityStatus: 'OUTPACING',
        velocityStatusLabel: 'Live Baseline Outpacing Influx (3.8x Speed)',
        absorptionRatePct: 79
      };
    }

    // Default / Projected periods
    return {
      period,
      dateLabel,
      timestamp,
      improvementRate: 3.2,
      readinessDeltaPct: 6,
      verifiedControlsCount: 3,
      newRequirementsVolume: 1,
      releasedRequirements: [
        {
          id: 'REL-2026-04-01',
          title: 'Harmonized AI & Cloud Assurance Standard (Proposed)',
          authority: 'ISO/IEC',
          circularRef: 'Draft Circular 2026/Q2',
          domainNumber: '11',
          domainName: 'Emerging Tech Governance',
          summary: 'Harmonized control mapping aligning MAS GenAI requirements with international ISO/IEC 42001 standards.',
          mandatoryClausesCount: 1,
          severity: 'MEDIUM',
          effectiveDate: '2026-04-25',
          remediationActionSummary: 'Pre-configured unified mapping matrix in Evidence Recommendation Hub.'
        }
      ],
      netVelocity: 2.2,
      velocityRatio: 3.2,
      velocityStatus: 'OUTPACING',
      velocityStatusLabel: 'Target Clearance Pace (3.2x Absorption)',
      absorptionRatePct: 76
    };
  };

  // Historical & Projected Deficiency Reduction Trend Data for Recharts Line Chart
  const deficiencyTrendData = useMemo<RetrospectiveTimelinePoint[]>(() => {
    const currentDeficient = metrics.deficientCount;
    const currentPending = metrics.pendingEvidenceCount;
    const currentCompliant = metrics.compliantCount;
    const currentReadiness = metrics.avgReadiness;
    const immediateBridgingPotential = immediateWins.length;
    const projectedDeficient = Math.max(0, currentDeficient - immediateBridgingPotential);
    const projectedPending = Math.max(0, currentPending - Math.round(immediateBridgingPotential * 0.5));
    const projectedReadiness = Math.min(100, currentReadiness + (gapExecutiveSummary.projectedAverageReadinessIncrease || 8));

    const enrichWithVelocity = (pts: RetrospectiveTimelinePoint[]) => {
      return pts.map((pt) => {
        const vel = getPeriodRegulatoryVelocity(pt.period, pt.dateLabel, pt.timestamp);
        return {
          ...pt,
          improvementRate: vel.improvementRate,
          newRequirementsVolume: vel.newRequirementsVolume,
          netVelocitySpread: vel.netVelocity,
          velocityRatio: vel.velocityRatio,
          velocityStatus: vel.velocityStatus,
          releasedRequirementsDetails: vel.releasedRequirements
        };
      });
    };

    if (trendTimeHorizon === '12_MONTHS') {
      return enrichWithVelocity([
        {
          period: 'Apr 2025',
          dateLabel: "Apr '25",
          timestamp: '2025-04-30',
          deficient: Math.max(currentDeficient + 13, 16),
          pendingEvidence: Math.max(currentPending + 10, 15),
          compliant: Math.max(0, currentCompliant - 24),
          overallReadiness: Math.max(38, currentReadiness - 34),
          target: 2,
          milestone: 'Initial MAS TRM Gap Assessment',
          auditStage: 'Supervisory Baseline Audit',
          snapshotDescription: 'Supervisory baseline audit: widespread gaps across privileged identity access, threat telemetry, and disaster recovery.',
          eventAnnotation: {
            eventTitle: 'Baseline Audit',
            eventSubtext: 'Initial Supervisory Gap Assessment',
            category: 'AUDIT',
            badgeColor: '#f59e0b',
            icon: 'flag',
            impactText: '16 Baseline Gaps',
            detailedNotes: 'Initial supervisory baseline evaluation identified 16 deficient and 15 pending controls requiring immediate remediation.'
          }
        },
        {
          period: 'Jun 2025',
          dateLabel: "Jun '25",
          timestamp: '2025-06-30',
          deficient: Math.max(currentDeficient + 9, 12),
          pendingEvidence: Math.max(currentPending + 8, 12),
          compliant: Math.max(0, currentCompliant - 20),
          overallReadiness: Math.max(45, currentReadiness - 27),
          target: 2,
          milestone: 'Q2 IT Steering Committee Review',
          auditStage: 'IT Steering Review',
          snapshotDescription: 'Mid-year review: network segmentation verified; third-party vendor risk controls and IAM remain deficient.',
          eventAnnotation: {
            eventTitle: 'Steering Review',
            eventSubtext: 'Network Micro-Segmentation Cleared',
            category: 'AUDIT',
            badgeColor: '#f59e0b',
            icon: 'award',
            impactText: '-4 Deficiencies (Network Controls)',
            detailedNotes: 'Steering committee signoff on network zoning and perimeter micro-segmentation controls.'
          }
        },
        {
          period: 'Sep 2025',
          dateLabel: "Sep '25",
          timestamp: '2025-09-20',
          deficient: Math.max(currentDeficient + 15, 18),
          pendingEvidence: Math.max(currentPending + 9, 14),
          compliant: Math.max(0, currentCompliant - 18),
          overallReadiness: Math.max(46, currentReadiness - 25),
          target: 2,
          milestone: 'MAS Supervisory Red-Team Audit',
          auditStage: 'MAS Red-Team Finding Influx',
          snapshotDescription: 'Supervisory Red-Team Audit Influx: 6 new gaps uncovered across AWS/Azure IAM delegation, unsegmented service mesh, and missing automated DR failover logs.',
          eventAnnotation: {
            eventTitle: 'Audit Finding Surge',
            eventSubtext: 'MAS Supervisory Influx (+6 Gaps)',
            category: 'AUDIT',
            badgeColor: '#f43f5e',
            icon: 'flag',
            impactText: '+6 Gaps Anomaly Spike',
            detailedNotes: 'MAS joint supervisory on-site inspection and external Mandiant red-team engagement uncovered critical multi-cloud IAM delegation flaws, S3 bucket drift, and container zero-days.'
          },
          spikeAnomaly: SPIKE_ANOMALY_SEP_2025
        },
        {
          period: 'Oct 2025',
          dateLabel: "Oct '25",
          timestamp: '2025-10-31',
          deficient: Math.max(currentDeficient + 7, 11),
          pendingEvidence: Math.max(currentPending + 5, 9),
          compliant: Math.max(0, currentCompliant - 12),
          overallReadiness: Math.max(56, currentReadiness - 16),
          target: 2,
          milestone: 'Notice 655 Hygiene Audit Sprint',
          auditStage: 'Notice 655 Sprint',
          snapshotDescription: 'MAS Notice 655 Hygiene Sprint: mandatory 2FA, admin account segregation, weekly vulnerability patch telemetry.',
          eventAnnotation: {
            eventTitle: 'Policy Updated',
            eventSubtext: 'Notice 655 Hygiene Standards Enforced',
            category: 'POLICY',
            badgeColor: '#38bdf8',
            icon: 'shield',
            impactText: '-2 Deficiencies (Notice 655 2FA)',
            detailedNotes: 'Mandatory 2FA, administrative privilege segregation, and weekly patch hygiene enforced enterprise-wide.'
          }
        },
        {
          period: 'Dec 2025',
          dateLabel: "Dec '25",
          timestamp: '2025-12-31',
          deficient: Math.max(currentDeficient + 4, 8),
          pendingEvidence: Math.max(currentPending + 3, 7),
          compliant: Math.max(0, currentCompliant - 7),
          overallReadiness: Math.max(63, currentReadiness - 9),
          target: 2,
          milestone: 'Central Evidence Vault Rollout',
          auditStage: 'EvidenceVault Rollout',
          snapshotDescription: 'Central Evidence Vault live rollout: cryptographic SHA-256 integrity hashing and live cloud log ingestion.',
          eventAnnotation: {
            eventTitle: 'Vault Launched',
            eventSubtext: 'Central Evidence Vault Rollout',
            category: 'TECH',
            badgeColor: '#a855f7',
            icon: 'lock',
            impactText: '-3 Deficiencies (SHA-256 Vault)',
            detailedNotes: 'Central Evidence Vault launched with automated SHA-256 integrity sealing and continuous cloud log correlation.'
          }
        },
        {
          period: 'Jan 2026',
          dateLabel: "Jan '26",
          timestamp: '2026-01-31',
          deficient: Math.max(currentDeficient + 3, 6),
          pendingEvidence: Math.max(currentPending + 2, 6),
          compliant: Math.max(0, currentCompliant - 5),
          overallReadiness: Math.max(68, currentReadiness - 6),
          target: 2,
          milestone: '2026 Annual Audit Kickoff',
          auditStage: 'Annual Kickoff',
          snapshotDescription: 'Annual audit kickoff: continuous evidence harvesting launched across all 12 domains.',
          eventAnnotation: {
            eventTitle: 'Audit Started',
            eventSubtext: '2026 Annual Supervisory Audit Kickoff',
            category: 'AUDIT',
            badgeColor: '#f59e0b',
            icon: 'flag',
            impactText: 'Supervisory Cycle Initiated',
            detailedNotes: '2026 Annual Audit Kickoff: automated continuous evidence harvesting launched across all 12 domains.'
          }
        },
        {
          period: 'Feb 2026',
          dateLabel: "Feb '26",
          timestamp: '2026-02-28',
          deficient: Math.max(currentDeficient + 2, 5),
          pendingEvidence: Math.max(currentPending + 1, 5),
          compliant: Math.max(0, currentCompliant - 3),
          overallReadiness: Math.max(70, currentReadiness - 4),
          target: 2,
          milestone: 'Pre-Audit Internal Inspection',
          auditStage: 'Pre-Audit Internal Inspection',
          snapshotDescription: 'Critical systems CIS benchmark verification, high availability failover drills, incident simulation.',
          eventAnnotation: {
            eventTitle: 'Audit Passed',
            eventSubtext: 'Pre-Audit Internal Inspection Cleared',
            category: 'AUDIT',
            badgeColor: '#10b981',
            icon: 'award',
            impactText: '-2 Deficiencies (Critical Failover Passed)',
            detailedNotes: 'Critical systems failover drills and independent penetration testing signoffs certified by internal audit.'
          }
        },
        {
          period: 'Mar 2026 (Live)',
          dateLabel: "Mar '26 (Now)",
          timestamp: '2026-03-23',
          deficient: currentDeficient,
          pendingEvidence: currentPending,
          compliant: currentCompliant,
          overallReadiness: currentReadiness,
          target: 2,
          isCurrent: true,
          milestone: 'Current Verified Baseline',
          auditStage: 'Current Live Verification',
          snapshotDescription: 'Active verified baseline with automated EvidenceVault continuous correlation.',
          eventAnnotation: {
            eventTitle: 'Live Baseline',
            eventSubtext: 'Continuous Automated Monitoring',
            category: 'BASELINE',
            badgeColor: '#06b6d4',
            icon: 'check',
            impactText: `${currentDeficient} Active Gaps`,
            detailedNotes: 'Real-time verified compliance baseline synchronized with live Evidence Vault repository.'
          }
        },
        {
          period: 'May 2026 (Projected)',
          dateLabel: "May '26 (Proj)",
          timestamp: '2026-05-31',
          deficient: projectedDeficient,
          pendingEvidence: projectedPending,
          compliant: currentCompliant + (currentDeficient - projectedDeficient),
          overallReadiness: projectedReadiness,
          target: 2,
          isProjected: true,
          milestone: 'Post-Remediation Target',
          auditStage: 'Remediation Clearance',
          snapshotDescription: 'Post-remediation target: zero deficiency gaps across all 104 MAS TRM controls.',
          eventAnnotation: {
            eventTitle: 'Target Cleared',
            eventSubtext: 'Zero-Deficiency Target State',
            category: 'TARGET',
            badgeColor: '#ec4899',
            icon: 'zap',
            impactText: `Target ≤ ${projectedDeficient} Gaps`,
            detailedNotes: 'Projected completion of automated evidence bridging across remaining controls.'
          }
        }
      ]);
    }

    if (trendTimeHorizon === 'YTD') {
      return enrichWithVelocity([
        {
          period: 'Jan 2026',
          dateLabel: "Jan '10",
          timestamp: '2026-01-10',
          deficient: Math.max(currentDeficient + 5, 8),
          pendingEvidence: Math.max(currentPending + 3, 7),
          compliant: Math.max(0, currentCompliant - 8),
          overallReadiness: Math.max(59, currentReadiness - 11),
          target: 2,
          milestone: '2026 Annual Audit Kickoff',
          auditStage: 'Annual Kickoff',
          snapshotDescription: '2026 Annual Audit Kickoff: continuous evidence harvesting launched across all 12 domains.',
          eventAnnotation: {
            eventTitle: 'Audit Started',
            eventSubtext: '2026 Annual Supervisory Audit Kickoff',
            category: 'AUDIT',
            badgeColor: '#f59e0b',
            icon: 'flag',
            impactText: 'Supervisory Cycle Initiated',
            detailedNotes: '2026 Annual Audit Kickoff: continuous evidence harvesting launched across all 12 domains.'
          }
        },
        {
          period: 'Late Jan 2026',
          dateLabel: "Jan '22",
          timestamp: '2026-01-22',
          deficient: Math.max(currentDeficient + 9, 12),
          pendingEvidence: Math.max(currentPending + 4, 8),
          compliant: Math.max(0, currentCompliant - 7),
          overallReadiness: Math.max(58, currentReadiness - 12),
          target: 2,
          milestone: 'GenAI & SaaS Supply Chain Audit',
          auditStage: 'Targeted AI Red-Team Influx',
          snapshotDescription: 'MAS Emerging Tech Audit: 4 new non-conformities identified in unmonitored external LLM API usage, lack of DLP prompt filtering, and static service tokens.',
          eventAnnotation: {
            eventTitle: 'Supply Chain Spike',
            eventSubtext: 'GenAI Audit Influx (+4 Gaps)',
            category: 'AUDIT',
            badgeColor: '#f43f5e',
            icon: 'flag',
            impactText: '+4 Gaps Anomaly Spike',
            detailedNotes: 'Targeted regulatory audit into enterprise Generative AI integrations revealed unauthorized external LLM usage and lack of cryptographic data egress tokenization.'
          },
          spikeAnomaly: SPIKE_ANOMALY_JAN_2026
        },
        {
          period: 'Feb 2026',
          dateLabel: "Feb '26",
          timestamp: '2026-02-28',
          deficient: Math.max(currentDeficient + 3, 6),
          pendingEvidence: Math.max(currentPending + 2, 6),
          compliant: Math.max(0, currentCompliant - 4),
          overallReadiness: Math.max(66, currentReadiness - 6),
          target: 2,
          milestone: 'Critical Systems CIS Verification',
          auditStage: 'Pre-Audit Verification',
          snapshotDescription: 'Critical systems CIS verification & penetration testing review.',
          eventAnnotation: {
            eventTitle: 'Audit Passed',
            eventSubtext: 'Critical Systems CIS Verification Cleared',
            category: 'AUDIT',
            badgeColor: '#10b981',
            icon: 'award',
            impactText: '-1 Deficiency (CIS Benchmarks)',
            detailedNotes: 'Critical systems CIS benchmark audit and automated configuration verification certified.'
          }
        },
        {
          period: 'Mid Feb 2026',
          dateLabel: 'Feb 15',
          timestamp: '2026-02-15',
          deficient: Math.max(currentDeficient + 1, 4),
          pendingEvidence: Math.max(currentPending + 1, 5),
          compliant: Math.max(0, currentCompliant - 2),
          overallReadiness: Math.max(71, currentReadiness - 3),
          target: 2,
          milestone: 'Disaster Recovery & GenAI Policy Enforcement',
          auditStage: 'Policy & Control Validation',
          snapshotDescription: 'Disaster recovery and updated GenAI security policies enforced and verified in EvidenceVault.',
          eventAnnotation: {
            eventTitle: 'Policy Updated',
            eventSubtext: 'DR & GenAI Security Policy Enforced',
            category: 'POLICY',
            badgeColor: '#38bdf8',
            icon: 'shield',
            impactText: '-2 Deficiencies (Policy Enforced)',
            detailedNotes: 'Enterprise disaster recovery testing standard and GenAI usage policies updated and certified.'
          }
        },
        {
          period: 'Mar 2026 (Live)',
          dateLabel: "Mar '26 (Now)",
          timestamp: '2026-03-23',
          deficient: currentDeficient,
          pendingEvidence: currentPending,
          compliant: currentCompliant,
          overallReadiness: currentReadiness,
          target: 2,
          isCurrent: true,
          milestone: 'Current Live State',
          auditStage: 'Current Live State',
          snapshotDescription: 'Active verified baseline with continuous evidence correlation.',
          eventAnnotation: {
            eventTitle: 'Live Baseline',
            eventSubtext: 'Current Verified Baseline',
            category: 'BASELINE',
            badgeColor: '#06b6d4',
            icon: 'check',
            impactText: `${currentDeficient} Active Gaps`,
            detailedNotes: 'Active verified baseline with automated EvidenceVault continuous correlation.'
          }
        },
        {
          period: 'Apr 2026 (Projected)',
          dateLabel: "Apr '26 (Proj)",
          timestamp: '2026-04-30',
          deficient: projectedDeficient,
          pendingEvidence: projectedPending,
          compliant: currentCompliant + (currentDeficient - projectedDeficient),
          overallReadiness: projectedReadiness,
          target: 2,
          isProjected: true,
          milestone: 'Projected Zero-Gap State',
          auditStage: 'Target Clearance',
          snapshotDescription: 'Target milestone: auto-bridging remaining deficiencies.',
          eventAnnotation: {
            eventTitle: 'Target Cleared',
            eventSubtext: 'Projected Zero-Gap State',
            category: 'TARGET',
            badgeColor: '#ec4899',
            icon: 'zap',
            impactText: `Target ≤ ${projectedDeficient} Gaps`,
            detailedNotes: 'Target milestone: auto-bridging remaining deficiencies.'
          }
        }
      ]);
    }

    // Default: 6_MONTHS
    return enrichWithVelocity([
      {
        period: 'Oct 2025',
        dateLabel: "Oct '25",
        timestamp: '2025-10-31',
        deficient: Math.max(currentDeficient + 7, 10),
        pendingEvidence: Math.max(currentPending + 6, 10),
        compliant: Math.max(0, currentCompliant - 11),
        overallReadiness: Math.max(54, currentReadiness - 16),
        target: 2,
        milestone: 'Notice 655 Remediation Sprint',
        auditStage: 'Notice 655 Sprint',
        snapshotDescription: 'Notice 655 Remediation Sprint: administrative account segregation and mandatory 2FA.',
        eventAnnotation: {
          eventTitle: 'Policy Updated',
          eventSubtext: 'Notice 655 Hygiene Standards Enforced',
          category: 'POLICY',
          badgeColor: '#38bdf8',
          icon: 'shield',
          impactText: '-3 Deficiencies (Admin MFA)',
          detailedNotes: 'Notice 655 Hygiene Sprint: mandatory 2FA, administrative account segregation, and vulnerability patch telemetry.'
        }
      },
      {
        period: 'Nov 2025',
        dateLabel: "Nov '25",
        timestamp: '2025-11-20',
        deficient: Math.max(currentDeficient + 12, 15),
        pendingEvidence: Math.max(currentPending + 7, 11),
        compliant: Math.max(0, currentCompliant - 10),
        overallReadiness: Math.max(53, currentReadiness - 17),
        target: 2,
        milestone: 'Subsidiary M&A Influx & Cyber Drill',
        auditStage: 'M&A Infrastructure Influx',
        snapshotDescription: 'Acquisition of subsidiary core banking microservices expanded compliance perimeter by 5 deficient controls across legacy database credentials and unencrypted Direct Connect.',
        eventAnnotation: {
          eventTitle: 'M&A Scope Influx',
          eventSubtext: 'Core Banking Integration (+5 Gaps)',
          category: 'AUDIT',
          badgeColor: '#f43f5e',
          icon: 'flag',
          impactText: '+5 Gaps Anomaly Spike',
          detailedNotes: 'Targeted M&A supervisory inspection following subsidiary acquisition revealed 5 non-compliant legacy controls requiring rapid remediation.'
        },
        spikeAnomaly: SPIKE_ANOMALY_NOV_2025
      },
      {
        period: 'Dec 2025',
        dateLabel: "Dec '25",
        timestamp: '2025-12-31',
        deficient: Math.max(currentDeficient + 4, 8),
        pendingEvidence: Math.max(currentPending + 3, 7),
        compliant: Math.max(0, currentCompliant - 6),
        overallReadiness: Math.max(64, currentReadiness - 9),
        target: 2,
        milestone: 'EvidenceVault Telemetry Linked',
        auditStage: 'EvidenceVault Integration',
        snapshotDescription: 'Cryptographic Evidence Vault live integration with cloud log audit trail.',
        eventAnnotation: {
          eventTitle: 'Vault Launched',
          eventSubtext: 'Central Evidence Vault Live Rollout',
          category: 'TECH',
          badgeColor: '#a855f7',
          icon: 'lock',
          impactText: '-2 Deficiencies (Vault Integrity)',
          detailedNotes: 'Central Evidence Vault live rollout with cryptographic SHA-256 integrity hashing and live cloud log ingestion.'
        }
      },
      {
        period: 'Jan 2026',
        dateLabel: "Jan '26",
        timestamp: '2026-01-31',
        deficient: Math.max(currentDeficient + 3, 6),
        pendingEvidence: Math.max(currentPending + 2, 6),
        compliant: Math.max(0, currentCompliant - 4),
        overallReadiness: Math.max(69, currentReadiness - 6),
        target: 2,
        milestone: '2026 Annual Audit Kickoff',
        auditStage: 'Annual Kickoff',
        snapshotDescription: 'Annual audit kickoff: continuous evidence harvesting launched.',
        eventAnnotation: {
          eventTitle: 'Audit Started',
          eventSubtext: '2026 Annual Audit Kickoff',
          category: 'AUDIT',
          badgeColor: '#f59e0b',
          icon: 'flag',
          impactText: 'Supervisory Cycle Initiated',
          detailedNotes: 'Annual audit kickoff: continuous evidence harvesting launched across all 12 domains.'
        }
      },
      {
        period: 'Feb 2026',
        dateLabel: "Feb '26",
        timestamp: '2026-02-28',
        deficient: Math.max(currentDeficient + 1, 4),
        pendingEvidence: Math.max(currentPending + 1, 5),
        compliant: Math.max(0, currentCompliant - 2),
        overallReadiness: Math.max(73, currentReadiness - 3),
        target: 2,
        milestone: 'Pre-Audit Internal Inspection',
        auditStage: 'Pre-Audit Internal Inspection',
        snapshotDescription: 'Critical systems CIS benchmark verification and failover drill signoffs.',
        eventAnnotation: {
          eventTitle: 'Audit Passed',
          eventSubtext: 'Pre-Audit Internal Inspection Cleared',
          category: 'AUDIT',
          badgeColor: '#10b981',
          icon: 'award',
          impactText: '-2 Deficiencies (Failover & PenTest Cleared)',
          detailedNotes: 'Critical systems CIS benchmark verification, high availability failover drills, and penetration testing signoffs passed.'
        }
      },
      {
        period: 'Mar 2026 (Live)',
        dateLabel: "Mar '26 (Now)",
        timestamp: '2026-03-23',
        deficient: currentDeficient,
        pendingEvidence: currentPending,
        compliant: currentCompliant,
        overallReadiness: currentReadiness,
        target: 2,
        isCurrent: true,
        milestone: 'Current Verification State',
        auditStage: 'Current Verified State',
        snapshotDescription: 'Active verified baseline: 3 deficiencies, 4 pending reviews, 97 compliant.',
        eventAnnotation: {
          eventTitle: 'Live Baseline',
          eventSubtext: 'Current Verified Baseline',
          category: 'BASELINE',
          badgeColor: '#06b6d4',
          icon: 'check',
          impactText: `${currentDeficient} Active Gaps`,
          detailedNotes: 'Active verified baseline with automated continuous correlation.'
        }
      },
      {
        period: 'Apr 2026 (Projected)',
        dateLabel: "Apr '26 (Proj)",
        timestamp: '2026-04-30',
        deficient: projectedDeficient,
        pendingEvidence: projectedPending,
        compliant: currentCompliant + (currentDeficient - projectedDeficient),
        overallReadiness: projectedReadiness,
        target: 2,
        isProjected: true,
        milestone: 'Target Clearance Horizon',
        auditStage: 'Target Clearance Horizon',
        snapshotDescription: 'Projected zero-gap state after batch linking matching EvidenceVault items.',
        eventAnnotation: {
          eventTitle: 'Target Cleared',
          eventSubtext: 'Post-Remediation Target',
          category: 'TARGET',
          badgeColor: '#ec4899',
          icon: 'zap',
          impactText: `Target ≤ ${projectedDeficient} Gaps`,
          detailedNotes: 'Projected zero-gap state after batch linking matching EvidenceVault items.'
        }
      }
    ]);
  }, [
    metrics.deficientCount,
    metrics.pendingEvidenceCount,
    metrics.compliantCount,
    metrics.avgReadiness,
    immediateWins.length,
    gapExecutiveSummary.projectedAverageReadinessIncrease,
    trendTimeHorizon
  ]);

  // Linear Regression on Historical Deficient Requirements to Project Compliance Completion Date
  const linearRegressionModel = useMemo<LinearRegressionResult | null>(() => {
    // Collect historical observations (up to and including the current live baseline)
    const historicalPoints = deficiencyTrendData.filter((pt) => !pt.isProjected);
    if (historicalPoints.length < 2) return null;

    const t0 = new Date(historicalPoints[0].timestamp).getTime();

    // Map each historical point to days from t0 and deficiency count
    const dataPoints = historicalPoints.map((pt) => {
      const time = new Date(pt.timestamp).getTime();
      const x = Math.max(0, (time - t0) / (1000 * 60 * 60 * 24));
      const y = pt.deficient;
      return { x, y, pt };
    });

    const n = dataPoints.length;
    const sumX = dataPoints.reduce((acc, p) => acc + p.x, 0);
    const sumY = dataPoints.reduce((acc, p) => acc + p.y, 0);
    const sumXY = dataPoints.reduce((acc, p) => acc + p.x * p.y, 0);
    const sumX2 = dataPoints.reduce((acc, p) => acc + p.x * p.x, 0);

    const meanX = sumX / n;
    const meanY = sumY / n;

    const denominator = sumX2 - (sumX * sumX) / n;
    if (denominator === 0) return null;

    const slope = (sumXY - (sumX * sumY) / n) / denominator; // Rate of change (deficiencies per day)
    const intercept = meanY - slope * meanX;

    // Pearson correlation / R-squared coefficient
    const ssTotal = dataPoints.reduce((acc, p) => acc + Math.pow(p.y - meanY, 2), 0);
    const ssRes = dataPoints.reduce((acc, p) => {
      const yPred = slope * p.x + intercept;
      return acc + Math.pow(p.y - yPred, 2);
    }, 0);
    const rSquared = ssTotal > 0 ? Math.max(0, Math.min(1, 1 - ssRes / ssTotal)) : 1;

    const currentPt = historicalPoints.find((p) => p.isCurrent) || historicalPoints[historicalPoints.length - 1];
    const currentTime = new Date(currentPt.timestamp).getTime();
    const currentX = (currentTime - t0) / (1000 * 60 * 60 * 24);
    const isDeclining = slope < 0;

    // Projected 0 Gaps (100% Compliance Clearance)
    let zeroDaysFromT0 = 0;
    let zeroDate: Date;
    let daysRemainingToZero = 0;

    if (isDeclining) {
      zeroDaysFromT0 = -intercept / slope;
      zeroDate = new Date(t0 + zeroDaysFromT0 * 86400000);
      daysRemainingToZero = Math.max(1, Math.round(zeroDaysFromT0 - currentX));
    } else {
      zeroDate = new Date(currentTime + 60 * 86400000);
      daysRemainingToZero = 60;
    }

    // Projected MAS Target Milestone (≤ 2 Deficiencies)
    let targetDaysFromT0 = 0;
    let targetDate: Date;
    let daysRemainingToTarget = 0;

    if (isDeclining) {
      targetDaysFromT0 = (2 - intercept) / slope;
      targetDate = new Date(t0 + targetDaysFromT0 * 86400000);
      daysRemainingToTarget = Math.max(0, Math.round(targetDaysFromT0 - currentX));
    } else {
      targetDate = new Date(currentTime + 30 * 86400000);
      daysRemainingToTarget = 30;
    }

    const formatShort = (d: Date) =>
      d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
    const formatFull = (d: Date) =>
      d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    const slopePerMonth = slope * 30.4375;
    const slopePerWeek = slope * 7;
    const formula = `y = ${slope.toFixed(3)}x + ${intercept.toFixed(1)}`;

    return {
      slopePerDay: slope,
      slopePerMonth,
      slopePerWeek,
      intercept,
      rSquared,
      projectedZeroGapDate: zeroDate,
      projectedZeroGapDateLabel: formatShort(zeroDate),
      projectedZeroGapDateFull: formatFull(zeroDate),
      daysRemainingToZero,
      projectedTargetGapDate: targetDate,
      projectedTargetGapDateLabel: formatShort(targetDate),
      projectedTargetGapDateFull: formatFull(targetDate),
      daysRemainingToTarget,
      formula,
      historicalCount: n,
      startDateLabel: historicalPoints[0].dateLabel,
      currentDateLabel: currentPt.dateLabel,
      currentDeficiencies: currentPt.deficient,
      isDeclining
    };
  }, [deficiencyTrendData]);

  // AI-Driven Compliance Forecast Model based on Historical Remediation Speed and Open Task Completion Rates
  const aiTrendModel = useMemo<AITrendProjectionModel | null>(() => {
    const historicalPoints = deficiencyTrendData.filter((pt) => !pt.isProjected);
    const baselineGaps = historicalPoints[0]?.deficient ?? 16;
    const currentGaps = metrics.deficientCount;
    const netClosedGaps = Math.max(0, baselineGaps - currentGaps);

    const t0 = new Date(historicalPoints[0]?.timestamp || '2025-10-31').getTime();
    const currentPt = historicalPoints.find((p) => p.isCurrent) || historicalPoints[historicalPoints.length - 1];
    const tNow = new Date(currentPt?.timestamp || '2026-03-23').getTime();
    const monthsElapsed = Math.max(1, (tNow - t0) / (30.4375 * 86400000));
    const cycleBurnRate = netClosedGaps / monthsElapsed;

    const closedFindings = (findings || []).filter(
      (f) => f.status === 'Closed Verified' || f.status === 'Verification Pending'
    );
    const closedRemediations = (unifiedRemediations || []).filter(
      (r) => r.status === 'CLOSED_VERIFIED' || r.status === 'Closed & Verified'
    );
    const totalClosed = closedFindings.length + closedRemediations.length;
    const microVelocity = totalClosed > 0 ? Math.min(4.0, Math.max(1.0, (totalClosed / monthsElapsed) * 0.8)) : 2.0;
    const historicalRemediationSpeed = Number((cycleBurnRate * 0.7 + microVelocity * 0.3).toFixed(2)) || 2.1;
    const averageResolutionDays = Math.round(30.4375 / Math.max(0.8, historicalRemediationSpeed));

    const allTasks = tasks || [];
    const completedTasksList = allTasks.filter((t) => t.status === 'Done');
    const openTasksList = allTasks.filter((t) => t.status !== 'Done');

    const allRemediations = unifiedRemediations || [];
    const openRemediations = allRemediations.filter((r) => r.status !== 'CLOSED_VERIFIED' && r.status !== 'Closed & Verified');
    const completedRemediations = allRemediations.filter((r) => r.status === 'CLOSED_VERIFIED' || r.status === 'Closed & Verified');

    const totalTrackedTasks = allTasks.length + allRemediations.length;
    const totalCompletedTasks = completedTasksList.length + completedRemediations.length;
    const totalOpenTasks = openTasksList.length + openRemediations.length;

    const rawCompletionRate = totalTrackedTasks > 0 ? totalCompletedTasks / totalTrackedTasks : 0.78;
    const openTaskCompletionRate = Math.min(0.98, Math.max(0.20, rawCompletionRate));

    let scenarioMod = 1.0;
    if (aiVelocityScenario === 'ACCELERATED') scenarioMod = 1.25;
    else if (aiVelocityScenario === 'CONSERVATIVE') scenarioMod = 0.75;

    const baseMomentum = 0.60 + openTaskCompletionRate * 0.70;
    const momentumMultiplier = Number((baseMomentum * scenarioMod).toFixed(2));
    const adjustedVelocity = Number((historicalRemediationSpeed * momentumMultiplier).toFixed(2));

    const monthsToZero = currentGaps > 0 ? currentGaps / Math.max(0.5, adjustedVelocity) : 0;
    const daysRemainingToZero = Math.max(1, Math.round(monthsToZero * 30.4375));
    const projectedZeroGapDate = new Date(tNow + daysRemainingToZero * 86400000);

    const targetGapsRemaining = Math.max(0, currentGaps - 2);
    const monthsToTarget = targetGapsRemaining > 0 ? targetGapsRemaining / Math.max(0.5, adjustedVelocity) : 0;
    const daysRemainingToTarget = Math.max(0, Math.round(monthsToTarget * 30.4375));
    const projectedTargetGapDate = new Date(tNow + daysRemainingToTarget * 86400000);

    const formatShort = (d: Date) =>
      d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
    const formatFull = (d: Date) =>
      d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    const linearDays = linearRegressionModel?.daysRemainingToZero ?? (daysRemainingToZero + 12);
    const varianceVsLinearDays = linearDays - daysRemainingToZero;

    const baseR2 = linearRegressionModel?.rSquared ?? 0.90;
    const sampleWeight = Math.min(1.0, (historicalPoints.length + totalTrackedTasks) / 15);
    const confidenceScore = Number((Math.min(0.98, Math.max(0.70, baseR2 * 0.7 + sampleWeight * 0.25 + 0.05))).toFixed(2));

    const tasksOnTrack = totalCompletedTasks + Math.round(totalOpenTasks * openTaskCompletionRate);
    const tasksAtRisk = Math.max(0, totalOpenTasks - Math.round(totalOpenTasks * openTaskCompletionRate));

    const insights = [
      `Historical remediation speed of ${historicalRemediationSpeed} gaps/mo combined with a ${(openTaskCompletionRate * 100).toFixed(0)}% task completion rate yields a ${momentumMultiplier}x momentum multiplier.`,
      varianceVsLinearDays > 0
        ? `AI forecasts zero-gap compliance ${Math.abs(varianceVsLinearDays)} days earlier than linear OLS regression due to high remediation task throughput.`
        : varianceVsLinearDays < 0
        ? `AI forecasts a ${Math.abs(varianceVsLinearDays)}-day extension vs linear projection to account for open task backlog friction.`
        : `AI forecast aligns with linear regression pace based on steady task delivery velocity.`,
      `Zero non-conformities projected for ${formatFull(projectedZeroGapDate)} (${daysRemainingToZero} calendar days remaining, ${(confidenceScore * 100).toFixed(0)}% confidence).`
    ];

    return {
      historicalRemediationSpeedGapsPerMonth: historicalRemediationSpeed,
      historicalAverageResolutionDays: averageResolutionDays,
      totalHistoricalClosedItems: totalClosed,
      openTasksCount: totalOpenTasks,
      completedTasksCount: totalCompletedTasks,
      openTaskCompletionRate,
      momentumMultiplier,
      adjustedRemediationVelocity: adjustedVelocity,
      projectedZeroGapDate,
      projectedZeroGapDateLabel: formatShort(projectedZeroGapDate),
      projectedZeroGapDateFull: formatFull(projectedZeroGapDate),
      daysRemainingToZero,
      projectedTargetGapDate,
      projectedTargetGapDateLabel: formatShort(projectedTargetGapDate),
      projectedTargetGapDateFull: formatFull(projectedTargetGapDate),
      daysRemainingToTarget,
      confidenceScore,
      varianceVsLinearDays,
      formula: `Deficiencies(t) = Current - (${historicalRemediationSpeed} × ${momentumMultiplier} × Δt)`,
      scenario: aiVelocityScenario,
      insights,
      remediationBreakdown: {
        criticalHighVelocity: Number((adjustedVelocity * 0.65).toFixed(1)),
        mediumLowVelocity: Number((adjustedVelocity * 0.35).toFixed(1)),
        tasksOnTrack,
        tasksAtRisk
      }
    };
  }, [
    deficiencyTrendData,
    metrics.deficientCount,
    findings,
    unifiedRemediations,
    tasks,
    aiVelocityScenario,
    linearRegressionModel
  ]);

  // Augmented Trend Data with Linear Regression & AI Trend Projection Estimates
  const chartTrendData = useMemo<RetrospectiveTimelinePoint[]>(() => {
    const historicalPoints = deficiencyTrendData.filter((pt) => !pt.isProjected);
    const currentPt = historicalPoints.find((p) => p.isCurrent) || historicalPoints[historicalPoints.length - 1];
    const currentTime = new Date(currentPt?.timestamp || '2026-03-23').getTime();
    const t0 = new Date(deficiencyTrendData[0].timestamp).getTime();

    const slopePerDay = linearRegressionModel?.slopePerDay ?? -0.07;
    const intercept = linearRegressionModel?.intercept ?? 16;
    const isDeclining = linearRegressionModel?.isDeclining ?? true;
    const slopePerMonth = linearRegressionModel?.slopePerMonth ?? -2.1;
    const rSquared = linearRegressionModel?.rSquared ?? 0.92;
    const daysRemainingToZero = linearRegressionModel?.daysRemainingToZero ?? 45;
    const projectedZeroGapDate = linearRegressionModel?.projectedZeroGapDate ?? new Date(currentTime + 45 * 86400000);
    const projectedZeroGapDateLabel = linearRegressionModel?.projectedZeroGapDateLabel ?? 'May 07';
    const projectedZeroGapDateFull = linearRegressionModel?.projectedZeroGapDateFull ?? 'May 7, 2026';

    const aiVelocity = aiTrendModel?.adjustedRemediationVelocity ?? 2.4;

    // Calculate regression and AI projected value for each existing point
    const pointsWithEstimates: RetrospectiveTimelinePoint[] = deficiencyTrendData.map((pt) => {
      const time = new Date(pt.timestamp).getTime();
      const x = Math.max(0, (time - t0) / 86400000);
      const rawReg = slopePerDay * x + intercept;
      const regressionDeficient = Math.max(0, Math.round(rawReg * 10) / 10);
      const actualGap = pt.deficient != null ? pt.deficient : null;
      const projectedGap = regressionDeficient;
      const gapVariance = actualGap != null ? Math.round((actualGap - projectedGap) * 10) / 10 : null;

      // AI Projection calculation:
      let aiProjectedDeficient: number | null = null;
      if (pt.isCurrent) {
        aiProjectedDeficient = metrics.deficientCount;
      } else if (!pt.isProjected) {
        // Historical point: reflect historical progression
        aiProjectedDeficient = pt.deficient;
      } else {
        // Future projected point: calculate decay based on momentum-adjusted remediation velocity
        const deltaDays = Math.max(0, (time - currentTime) / 86400000);
        const deltaMonths = deltaDays / 30.4375;
        const rawAi = Math.max(0, metrics.deficientCount - aiVelocity * deltaMonths);
        aiProjectedDeficient = Math.round(rawAi * 10) / 10;
      }

      const aiVarianceVsActual = actualGap != null && aiProjectedDeficient != null
        ? Math.round((actualGap - aiProjectedDeficient) * 10) / 10
        : null;
      const aiVarianceVsLinear = regressionDeficient != null && aiProjectedDeficient != null
        ? Math.round((regressionDeficient - aiProjectedDeficient) * 10) / 10
        : null;

      return {
        ...pt,
        regressionDeficient,
        actualGap,
        projectedGap,
        gapVariance,
        aiProjectedDeficient,
        aiVarianceVsActual,
        aiVarianceVsLinear
      };
    });

    if (!isDeclining) return pointsWithEstimates;

    // Create the projected linear regression zero-gap completion milestone point
    const zeroDateTime = projectedZeroGapDate.getTime();
    const zeroDateIso = projectedZeroGapDate.toISOString().split('T')[0];

    const existingAtSameDate = pointsWithEstimates.some(
      (p) => Math.abs(new Date(p.timestamp).getTime() - zeroDateTime) < 3 * 86400000
    );

    let all: RetrospectiveTimelinePoint[] = pointsWithEstimates;

    if (!existingAtSameDate) {
      const zeroPoint: RetrospectiveTimelinePoint = {
        period: 'Projected Completion',
        dateLabel: `${projectedZeroGapDateLabel} (0 Gaps)`,
        timestamp: zeroDateIso,
        deficient: null as any,
        pendingEvidence: null as any,
        compliant: metrics.compliantCount + metrics.deficientCount,
        overallReadiness: 100,
        target: 2,
        regressionDeficient: 0,
        actualGap: null,
        projectedGap: 0,
        gapVariance: 0,
        aiProjectedDeficient: 0,
        isProjected: true,
        isLinearCompletionPoint: true,
        milestone: `Projected 100% Compliance Clearance (${projectedZeroGapDateFull})`,
        auditStage: 'Target Clearance (0 Gaps)',
        snapshotDescription: `Empirical linear regression target completion: zero non-conformities based on historical remediation rate of ${Math.abs(slopePerMonth).toFixed(1)} gaps/month (R² = ${(rSquared * 100).toFixed(0)}%).`,
        eventAnnotation: {
          eventTitle: 'Compliance Complete',
          eventSubtext: `Projected Clearance: ${projectedZeroGapDateFull}`,
          category: 'TARGET',
          badgeColor: '#10b981',
          icon: 'check',
          impactText: '100% Compliance (0 Gaps)',
          detailedNotes: `Projected completion date determined via Ordinary Least Squares (OLS) regression over historical audit cycles (R² = ${(rSquared * 100).toFixed(1)}%). Estimated ${daysRemainingToZero} days remaining to zero deficiencies.`
        },
        improvementRate: 3.0,
        newRequirementsVolume: 1,
        netVelocitySpread: 2.0,
        velocityRatio: 3.0,
        velocityStatus: 'OUTPACING',
        releasedRequirementsDetails: []
      };

      all = [...pointsWithEstimates, zeroPoint];
    }

    all.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    return all;
  }, [
    deficiencyTrendData,
    linearRegressionModel,
    aiTrendModel,
    metrics.compliantCount,
    metrics.deficientCount
  ]);

  // Comparative Side-by-Side Analytics: Projected Gap vs Actual Gap
  const sideBySideStats = useMemo(() => {
    if (!linearRegressionModel) return null;
    const historicalPoints = chartTrendData.filter(
      (p) => !p.isProjected && p.actualGap != null && p.projectedGap != null
    );
    if (historicalPoints.length === 0) return null;

    const milestonesComparison = historicalPoints.map((p) => {
      const actual = p.actualGap!;
      const projected = p.projectedGap!;
      const variance = Math.round((actual - projected) * 10) / 10;
      const status: 'AHEAD' | 'LAGGING' | 'ALIGNED' =
        variance < -0.2 ? 'AHEAD' : variance > 0.2 ? 'LAGGING' : 'ALIGNED';
      return {
        period: p.period,
        dateLabel: p.dateLabel,
        timestamp: p.timestamp,
        actual,
        projected,
        variance,
        status,
        isCurrent: Boolean(p.isCurrent),
        milestone: p.milestone || p.period,
        auditStage: p.auditStage
      };
    });

    const currentPt = historicalPoints.find((p) => p.isCurrent) || historicalPoints[historicalPoints.length - 1];
    const currentActual = currentPt.actualGap!;
    const currentProjected = currentPt.projectedGap!;
    const currentVariance = Math.round((currentActual - currentProjected) * 10) / 10;
    const currentStatus: 'AHEAD' | 'LAGGING' | 'ALIGNED' =
      currentVariance < -0.2 ? 'AHEAD' : currentVariance > 0.2 ? 'LAGGING' : 'ALIGNED';

    const sumAbsoluteVariance = milestonesComparison.reduce((acc, v) => acc + Math.abs(v.variance), 0);
    const meanAbsoluteError = Math.round((sumAbsoluteVariance / milestonesComparison.length) * 10) / 10;

    const aheadCount = milestonesComparison.filter((v) => v.status === 'AHEAD').length;
    const laggingCount = milestonesComparison.filter((v) => v.status === 'LAGGING').length;
    const alignedCount = milestonesComparison.filter((v) => v.status === 'ALIGNED').length;

    const bestMilestone = [...milestonesComparison].sort((a, b) => a.variance - b.variance)[0];

    return {
      milestonesComparison,
      currentActual,
      currentProjected,
      currentVariance,
      currentStatus,
      meanAbsoluteError,
      aheadCount,
      laggingCount,
      alignedCount,
      bestMilestone,
      projectedZeroGapDateLabel: linearRegressionModel.projectedZeroGapDateLabel,
      projectedZeroGapDateFull: linearRegressionModel.projectedZeroGapDateFull,
      daysRemainingToZero: linearRegressionModel.daysRemainingToZero
    };
  }, [chartTrendData, linearRegressionModel]);

  // Aggregated Regulatory Velocity Model: Rate of Compliance Improvement vs Volume of New Regulatory Requirements
  const regulatoryVelocityStats = useMemo<RegulatoryVelocityAggregateModel | null>(() => {
    const points = chartTrendData.filter((p) => !p.isLinearCompletionPoint && p.improvementRate !== undefined);
    if (points.length === 0) return null;

    const totalImprovements = points.reduce((acc, p) => acc + (p.improvementRate || 0), 0);
    const totalReleases = points.reduce((acc, p) => acc + (p.newRequirementsVolume || 0), 0);
    const overallRatio = Number((totalImprovements / Math.max(1, totalReleases)).toFixed(2));
    const netSpread = Number((totalImprovements - totalReleases).toFixed(1));
    const avgImprovement = Number((totalImprovements / points.length).toFixed(1));
    const avgReleases = Number((totalReleases / points.length).toFixed(1));

    const currentPt = points.find((p) => p.isCurrent) || points[points.length - 1];
    const currentVelocity = getPeriodRegulatoryVelocity(currentPt.period, currentPt.dateLabel, currentPt.timestamp);

    const periods = points.map((p) => getPeriodRegulatoryVelocity(p.period, p.dateLabel, p.timestamp));

    let velocityHealth: 'EXPANDING_LEAD' | 'STABLE_ABSORPTION' | 'REGULATORY_HEADWIND' = 'EXPANDING_LEAD';
    let velocityHealthLabel = 'Remediation Pace Outpacing Regulatory Influx';
    if (overallRatio < 0.95) {
      velocityHealth = 'REGULATORY_HEADWIND';
      velocityHealthLabel = 'Regulatory Influx Exceeding Remediation Capacity';
    } else if (overallRatio < 1.15) {
      velocityHealth = 'STABLE_ABSORPTION';
      velocityHealthLabel = 'Remediation Velocity Parity with Regulatory Mandates';
    }

    return {
      overallVelocityRatio: overallRatio,
      totalRequirementsReleased: totalReleases,
      totalImprovementsRemediated: Math.round(totalImprovements * 10) / 10,
      netSpread,
      averageImprovementRatePerMonth: avgImprovement,
      averageNewRequirementsRatePerMonth: avgReleases,
      currentPeriodVelocity: currentVelocity,
      periods,
      velocityHealth,
      velocityHealthLabel,
      summaryInsight: `Remediation team is clearing deficiencies at ${overallRatio}x the arrival velocity of new regulatory mandates (Net +${netSpread} margin).`
    };
  }, [chartTrendData]);

  // Selected Regulatory Velocity Period Data for Drill-Down Modal
  const activeVelocityPeriodData = useMemo<PeriodRegulatoryVelocityData | null>(() => {
    if (!selectedVelocityPeriod) {
      if (regulatoryVelocityStats && regulatoryVelocityStats.periods.length > 0) {
        return regulatoryVelocityStats.periods[regulatoryVelocityStats.periods.length - 1];
      }
      return null;
    }
    const found = regulatoryVelocityStats?.periods.find((p) => p.period === selectedVelocityPeriod);
    if (found) return found;
    const pt = deficiencyTrendData.find((p) => p.period === selectedVelocityPeriod);
    if (pt) {
      return getPeriodRegulatoryVelocity(pt.period, pt.dateLabel, pt.timestamp);
    }
    return null;
  }, [selectedVelocityPeriod, regulatoryVelocityStats, deficiencyTrendData]);

  // Selected Snapshot Point derived from Line Chart interaction
  const selectedSnapshot = useMemo<RetrospectiveTimelinePoint | null>(() => {
    if (!selectedSnapshotPeriod) return null;
    return (
      (chartTrendData.find(
        (p) => p.period === selectedSnapshotPeriod || p.dateLabel === selectedSnapshotPeriod
      ) as RetrospectiveTimelinePoint) || null
    );
  }, [selectedSnapshotPeriod, chartTrendData]);

  // Active Anomaly Spikes in the current timeline horizon
  const activeHorizonAnomalies = useMemo<ComplianceSpikeAnomaly[]>(() => {
    return chartTrendData
      .filter((pt) => pt.spikeAnomaly != null)
      .map((pt) => pt.spikeAnomaly!);
  }, [chartTrendData]);

  // Retrospective Compliance State & EvidenceVault calculation
  const retrospectiveAnalysis = useMemo(() => {
    if (!selectedSnapshot) return null;

    const isLiveSnapshot = selectedSnapshot.isCurrent;
    const isProj = selectedSnapshot.isProjected;
    const cutoffTime = new Date(selectedSnapshot.timestamp).getTime();
    const targetDeficientCount = selectedSnapshot.deficient ?? 0;

    // Sort requirements to identify which were deficient at this milestone:
    // Current Deficient first, then current Pending, then by risk tier & lowest readiness score
    const sortedReqs = [...enrichedRequirements].sort((a, b) => {
      if (a.complianceStatusBadge === 'Deficient' && b.complianceStatusBadge !== 'Deficient') return -1;
      if (b.complianceStatusBadge === 'Deficient' && a.complianceStatusBadge !== 'Deficient') return 1;
      if (a.riskTier === 'HIGH_RISK' && b.riskTier !== 'HIGH_RISK') return -1;
      if (b.riskTier === 'HIGH_RISK' && a.riskTier !== 'HIGH_RISK') return 1;
      return a.readinessScore - b.readinessScore;
    });

    const snapshotDeficientReqCodes = new Set<string>();
    if (!isProj) {
      sortedReqs.slice(0, targetDeficientCount).forEach((r) => snapshotDeficientReqCodes.add(r.requirementCode));
    }

    const items: RetrospectiveEvidenceItem[] = [];

    enrichedRequirements.forEach((req) => {
      const rec = recommendationsMap[req.requirementCode];
      const template = rec?.prescribedTemplate;
      const topMatch = rec?.topMatch;
      const matchedItems = rec?.matchedVaultItems || [];

      const isReqDeficientAtSnapshot = snapshotDeficientReqCodes.has(req.requirementCode);
      const requiredTitle = template?.title || `${req.requirementCode} Evidentiary Compliance Artifact`;
      const suggestedFileName = template?.suggestedFileName || `${req.requirementCode.toLowerCase().replace(/[^a-z0-9]/g, '_')}_evidence.pdf`;
      const department = template?.department || 'IT & Information Security';

      // Find if an evidence record was uploaded by cutoffTime
      let verifiedRecordBySnapshot: EvidenceRecord | undefined;
      let remediatedLaterRecord: EvidenceRecord | undefined;

      const candidateEvidences = [
        ...matchedItems.map((m) => m.evidence),
        ...evidence.filter((e) =>
          e.controlCode === req.requirementCode ||
          e.title.toLowerCase().includes(req.requirementCode.toLowerCase()) ||
          (req.crossFrameworkMappings?.iso27001 && req.crossFrameworkMappings.iso27001.includes(e.controlCode))
        )
      ];

      for (const ev of candidateEvidences) {
        if (ev.uploadedDate) {
          const evTime = new Date(ev.uploadedDate).getTime();
          if (evTime <= cutoffTime) {
            if (!verifiedRecordBySnapshot || ev.status === 'Verified') {
              verifiedRecordBySnapshot = ev;
            }
          } else {
            if (!remediatedLaterRecord) {
              remediatedLaterRecord = ev;
            }
          }
        }
      }

      let retroStatus: RetrospectiveEvidenceItem['retrospectiveStatus'];
      let retroStatusLabel: string;
      let deficiencyReason: string | undefined;

      if (isProj) {
        retroStatus = 'PROJECTED_BRIDGED';
        retroStatusLabel = 'Projected Verification Target (Auto-Bridged)';
      } else if (isLiveSnapshot) {
        if (req.complianceStatusBadge === 'Deficient') {
          retroStatus = 'MISSING_AT_SNAPSHOT';
          retroStatusLabel = 'Active Live Deficiency (Evidence Missing)';
          deficiencyReason = 'Zero verified auditor-grade artifacts currently mapped in EvidenceVault.';
        } else if (req.complianceStatusBadge === 'Pending Evidence') {
          retroStatus = 'MISSING_AT_SNAPSHOT';
          retroStatusLabel = 'Pending Review / Incomplete Evidence';
          deficiencyReason = 'Artifact uploaded but pending formal multi-party audit verification.';
        } else {
          retroStatus = 'SATISFIED_IN_VAULT';
          retroStatusLabel = 'Verified in Vault (Current Baseline)';
        }
      } else {
        if (isReqDeficientAtSnapshot) {
          if (remediatedLaterRecord) {
            retroStatus = 'REMEDIATED_LATER';
            retroStatusLabel = `Missing at ${selectedSnapshot.dateLabel} • Resolved Later (${remediatedLaterRecord.uploadedDate?.slice(0, 10)})`;
            deficiencyReason = `Required by MAS TRM at ${selectedSnapshot.dateLabel}, but remained absent until ${remediatedLaterRecord.uploadedDate?.slice(0, 10)}.`;
          } else {
            retroStatus = 'MISSING_AT_SNAPSHOT';
            retroStatusLabel = `Missing at ${selectedSnapshot.dateLabel} (Direct Cause of Deficiency)`;
            deficiencyReason = `Required evidentiary proof was absent from the vault as of ${selectedSnapshot.dateLabel}.`;
          }
        } else {
          retroStatus = 'SATISFIED_IN_VAULT';
          retroStatusLabel = `Verified in Vault by ${selectedSnapshot.dateLabel}`;
        }
      }

      items.push({
        id: `retro-${req.requirementCode}-${selectedSnapshot.period}`,
        requirementCode: req.requirementCode,
        requirementTitle: req.title,
        domainNumber: req.domainNumber,
        domainName: req.domainName,
        riskTier: req.riskTier,
        controlCode: req.requirementCode,
        evidenceTitle: requiredTitle,
        suggestedFileName,
        department,
        retrospectiveStatus: retroStatus,
        retrospectiveStatusLabel: retroStatusLabel,
        evidenceRecord: verifiedRecordBySnapshot || remediatedLaterRecord || topMatch?.evidence,
        uploadedDate: verifiedRecordBySnapshot?.uploadedDate,
        remediatedOn: remediatedLaterRecord?.uploadedDate,
        auditHash: verifiedRecordBySnapshot?.sha256Hash || verifiedRecordBySnapshot?.auditHash,
        deficiencyReason,
        mandatorySafeguards: template?.mandatoryKeywords || ['Supervisory Audit Trail', 'Cryptographic Log Verification'],
        recommendedActionText: isReqDeficientAtSnapshot ? 'Requires auditor-certified artifact in EvidenceVault' : 'Compliant with framework mandate',
        canBridgeNow: !isLiveSnapshot && topMatch !== undefined && req.complianceStatusBadge === 'Deficient',
        matchingVaultId: topMatch?.evidence.id
      });
    });

    const missingCount = items.filter((i) => i.retrospectiveStatus === 'MISSING_AT_SNAPSHOT').length;
    const satisfiedCount = items.filter((i) => i.retrospectiveStatus === 'SATISFIED_IN_VAULT' || i.retrospectiveStatus === 'PROJECTED_BRIDGED').length;
    const remediatedLaterCount = items.filter((i) => i.retrospectiveStatus === 'REMEDIATED_LATER').length;

    // Filter items based on active tab, search, domain
    const filteredItems = items.filter((item) => {
      if (retrospectiveEvidenceTab === 'MISSING_GAPS' && item.retrospectiveStatus !== 'MISSING_AT_SNAPSHOT') return false;
      if (retrospectiveEvidenceTab === 'SATISFIED_VAULT' && item.retrospectiveStatus !== 'SATISFIED_IN_VAULT' && item.retrospectiveStatus !== 'PROJECTED_BRIDGED') return false;
      if (retrospectiveEvidenceTab === 'REMEDIATION_PATH' && item.retrospectiveStatus !== 'REMEDIATED_LATER') return false;

      if (retrospectiveDomainFilter !== 'ALL' && item.domainNumber !== retrospectiveDomainFilter) return false;

      if (retrospectiveSearch.trim()) {
        const q = retrospectiveSearch.toLowerCase();
        const matchTitle = item.evidenceTitle.toLowerCase().includes(q);
        const matchReq = item.requirementTitle.toLowerCase().includes(q) || item.requirementCode.toLowerCase().includes(q);
        const matchFile = item.suggestedFileName.toLowerCase().includes(q);
        const matchDept = item.department.toLowerCase().includes(q);
        if (!matchTitle && !matchReq && !matchFile && !matchDept) return false;
      }

      return true;
    });

    return {
      snapshot: selectedSnapshot,
      items,
      filteredItems,
      summary: {
        totalRequiredCount: items.length,
        missingCount,
        satisfiedCount,
        remediatedLaterCount,
        deficientCount: selectedSnapshot.deficient,
        pendingCount: selectedSnapshot.pendingEvidence,
        readinessScore: selectedSnapshot.overallReadiness
      }
    };
  }, [
    selectedSnapshot,
    enrichedRequirements,
    recommendationsMap,
    evidence,
    metrics.deficientCount,
    retrospectiveEvidenceTab,
    retrospectiveSearch,
    retrospectiveDomainFilter
  ]);

  // Summary Metrics on Deficiency Reduction Trend
  const trendMetrics = useMemo(() => {
    if (deficiencyTrendData.length < 2) {
      return { baseline: 0, current: 0, netClosed: 0, reductionPct: 0, monthlyBurnRate: '0.0', projectedZeroDate: 'May 2026' };
    }
    const baselinePoint = deficiencyTrendData[0];
    const currentPoint = deficiencyTrendData.find((p) => p.isCurrent) || deficiencyTrendData[deficiencyTrendData.length - 2];
    const baseline = baselinePoint.deficient;
    const current = currentPoint.deficient;
    const netClosed = Math.max(0, baseline - current);
    const reductionPct = baseline > 0 ? Math.round((netClosed / baseline) * 100) : 0;
    const monthsElapsed = Math.max(1, deficiencyTrendData.indexOf(currentPoint));
    const monthlyBurnRate = (netClosed / monthsElapsed).toFixed(1);

    return {
      baseline,
      current,
      netClosed,
      reductionPct,
      monthlyBurnRate,
      projectedZeroDate: current <= 2 ? 'Target Achieved' : 'May 2026'
    };
  }, [deficiencyTrendData]);

  // Filtered requirements list
  const filteredRequirements = useMemo(() => {
    return enrichedRequirements.filter((r) => {
      // Domain filter
      if (selectedDomain !== 'ALL' && r.domainNumber !== selectedDomain) {
        return false;
      }

      // Risk preset filter
      if (riskFilter === 'HIGH_RISK_ONLY' && r.riskTier !== 'HIGH_RISK') return false;
      if (riskFilter === 'OPEN_FINDINGS_ONLY' && r.openFindings.length === 0) return false;
      if (riskFilter === 'CRITICAL_SYSTEMS' && !r.criticalSystemsMandate) return false;

      // Status badge filter
      if (statusFilter !== 'ALL' && r.complianceStatusBadge !== statusFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesCode = r.requirementCode.toLowerCase().includes(q);
        const matchesTitle = r.title.toLowerCase().includes(q);
        const matchesDomain = r.domainName.toLowerCase().includes(q);
        const matchesFindings = r.openFindings.some(
          (f) => f.title.toLowerCase().includes(q) || f.findingCode.toLowerCase().includes(q)
        );
        const matchesEvidence = r.associatedEvidence.some(
          (e) => e.title.toLowerCase().includes(q) || e.fileName.toLowerCase().includes(q)
        );

        if (!matchesCode && !matchesTitle && !matchesDomain && !matchesFindings && !matchesEvidence) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      // High risk first, then lowest readiness score
      if (a.riskTier === 'HIGH_RISK' && b.riskTier !== 'HIGH_RISK') return -1;
      if (b.riskTier === 'HIGH_RISK' && a.riskTier !== 'HIGH_RISK') return 1;
      return a.readinessScore - b.readinessScore;
    });
  }, [enrichedRequirements, selectedDomain, riskFilter, statusFilter, searchQuery]);

  // Handlers for direct drill-down into Evidence Vault
  const handleDrillDownToEvidenceVault = (requirement: EnrichedMASRequirement) => {
    // 1. Dispatch custom navigation event so Evidence Centre pre-selects/filters for this requirement
    const searchTarget = requirement.crossFrameworkMappings?.iso27001?.[0] || requirement.requirementCode;
    window.dispatchEvent(
      new CustomEvent('skanda:navigate-module', {
        detail: {
          moduleId: 'evidence_centre',
          search: searchTarget,
          filter: 'All'
        }
      })
    );

    // 2. Direct router navigation
    setActiveModule('evidence_centre');
  };

  // Handler for retrospective drill-down into Evidence Vault
  const handleOpenRetrospectiveEvidenceCentre = (snapshot: RetrospectiveTimelinePoint) => {
    window.dispatchEvent(
      new CustomEvent('skanda:navigate-module', {
        detail: {
          moduleId: 'evidence_centre',
          retrospective: {
            period: snapshot.period,
            dateLabel: snapshot.dateLabel,
            timestamp: snapshot.timestamp,
            deficient: snapshot.deficient,
            milestone: snapshot.milestone
          },
          search: '',
          filter: 'All'
        }
      })
    );
    setActiveModule('evidence_centre');
    showToast({
      title: 'Evidence Vault: Retrospective Mode',
      message: `Inspecting Evidence Vault artifacts collected on or before ${snapshot.period} (${snapshot.timestamp}).`,
      type: 'info'
    });
  };

  const handleCopyHash = (hashStr: string) => {
    navigator.clipboard.writeText(hashStr);
    setCopiedHash(hashStr);
    setTimeout(() => setCopiedHash(null), 2500);
  };

  // Render custom SVG callout badge annotation on Recharts ReferenceLine
  const renderMilestoneAnnotationLabel = (
    props: any,
    point: RetrospectiveTimelinePoint,
    index: number
  ) => {
    const x = props?.viewBox?.x ?? props?.x;
    if (typeof x !== 'number' || isNaN(x)) return null;

    const ann = point.eventAnnotation;
    if (!ann) return null;

    if (selectedMilestoneCategory !== 'ALL' && ann.category !== selectedMilestoneCategory) {
      return null;
    }

    const isSelected = selectedSnapshot?.period === point.period;
    const isHovered = hoveredMilestone?.point.period === point.period;
    // Stagger vertical height between 4 and 36 to prevent adjacent badge label collision
    const yPos = index % 2 === 0 ? 4 : 36;
    const title = ann.eventTitle;
    const impactText = ann.impactText || '';
    const badgeTextWidth = Math.max(94, Math.max(title.length * 6.2, impactText.length * 5.4) + 26);
    const halfWidth = badgeTextWidth / 2;
    const badgeHeight = 28;

    // Visual context colors for compliance fluctuations
    const isSpike = impactText.includes('+') || impactText.toLowerCase().includes('spike');
    const isReduction = impactText.includes('-') || impactText.toLowerCase().includes('closed') || impactText.toLowerCase().includes('cleared');
    const impactColor = isSpike ? '#fb7185' : isReduction ? '#34d399' : '#38bdf8';

    return (
      <g
        className="cursor-pointer select-none transition-transform"
        onClick={(e) => {
          e.stopPropagation();
          setSelectedSnapshotPeriod(point.period);
        }}
        onMouseEnter={(e) => {
          const containerRect = chartContainerRef.current?.getBoundingClientRect();
          setHoveredMilestone({
            point,
            x: containerRect ? e.clientX - containerRect.left : x,
            y: containerRect ? e.clientY - containerRect.top : yPos + 32
          });
        }}
        onMouseMove={(e) => {
          const containerRect = chartContainerRef.current?.getBoundingClientRect();
          if (containerRect) {
            setHoveredMilestone({
              point,
              x: e.clientX - containerRect.left,
              y: e.clientY - containerRect.top
            });
          }
        }}
        onMouseLeave={() => {
          setHoveredMilestone(null);
        }}
      >
        {/* Guide connector line from label badge down towards the chart grid */}
        <line
          x1={x}
          y1={yPos + badgeHeight}
          x2={x}
          y2={yPos + badgeHeight + 10}
          stroke={isSelected || isHovered ? '#38bdf8' : ann.badgeColor}
          strokeWidth={isSelected || isHovered ? 2 : 1}
          strokeDasharray="2 2"
          opacity={isSelected || isHovered ? 1 : 0.65}
        />
        {/* Glow drop-shadow halo on hover or selection */}
        {(isHovered || isSelected) && (
          <rect
            x={x - halfWidth - 2}
            y={yPos - 2}
            width={badgeTextWidth + 4}
            height={badgeHeight + 4}
            rx={6}
            fill={ann.badgeColor}
            fillOpacity={0.35}
            className="animate-pulse"
          />
        )}
        {/* Callout pill background */}
        <rect
          x={x - halfWidth}
          y={yPos}
          width={badgeTextWidth}
          height={badgeHeight}
          rx={5}
          fill="#090d16"
          stroke={isSelected ? '#38bdf8' : isHovered ? '#ffffff' : ann.badgeColor}
          strokeWidth={isSelected || isHovered ? 2 : 1.2}
          opacity={0.98}
        />
        {/* Category pip indicator dot */}
        <circle
          cx={x - halfWidth + 8}
          cy={yPos + 9}
          r={isHovered ? 3.5 : 3}
          fill={ann.badgeColor}
        />
        {/* Event Title text (e.g. 'Policy Updated', 'Audit Started') */}
        <text
          x={x - halfWidth + 15}
          y={yPos + 12}
          fill={isSelected || isHovered ? '#ffffff' : '#f1f5f9'}
          fontSize={8.5}
          fontWeight={700}
          letterSpacing="0.01em"
          fontFamily="system-ui, -apple-system, sans-serif"
          style={{ pointerEvents: 'none' }}
        >
          {title}
        </text>
        {/* Fluctuation context readout (e.g. '-3 Deficiencies', '+5 Gaps Anomaly Spike') */}
        <text
          x={x - halfWidth + 15}
          y={yPos + 22.5}
          fill={impactColor}
          fontSize={7.5}
          fontWeight={600}
          fontFamily="system-ui, -apple-system, sans-serif"
          style={{ pointerEvents: 'none' }}
        >
          {impactText}
        </text>
      </g>
    );
  };

  // Render custom SVG Anomaly Spike Callout Badge on Recharts ReferenceLine
  const renderAnomalyCalloutBadge = (
    props: any,
    anom: ComplianceSpikeAnomaly
  ) => {
    const x = props?.viewBox?.x ?? props?.x;
    if (typeof x !== 'number' || isNaN(x)) return null;

    const isSelected = selectedAnomaly?.id === anom.id;
    const badgeText = `⚠️ SPIKE +${anom.gapIncrease} GAPS`;
    const textWidth = 116;
    const halfWidth = textWidth / 2;
    // Staggered Y position slightly below milestone labels
    const yPos = 50;

    return (
      <g
        className="cursor-pointer select-none transition-transform"
        onClick={(e) => {
          e.stopPropagation();
          setSelectedAnomaly(anom);
        }}
      >
        {/* Connector vertical drop */}
        <line
          x1={x}
          y1={yPos + 18}
          x2={x}
          y2={yPos + 28}
          stroke="#f43f5e"
          strokeWidth={1.5}
          strokeDasharray="2 2"
          opacity={0.8}
        />

        {/* Pulsing warning halo */}
        <rect
          x={x - halfWidth - 2}
          y={yPos - 2}
          width={textWidth + 4}
          height={22}
          rx={5}
          fill="#f43f5e"
          fillOpacity={0.25}
          className="animate-pulse"
        />

        {/* Background pill */}
        <rect
          x={x - halfWidth}
          y={yPos}
          width={textWidth}
          height={18}
          rx={4}
          fill="#4c0519"
          stroke={isSelected ? '#ffffff' : '#f43f5e'}
          strokeWidth={isSelected ? 2 : 1.2}
          opacity={0.98}
        />

        {/* Pulsing indicator dot */}
        <circle
          cx={x - halfWidth + 8}
          cy={yPos + 9}
          r={3}
          fill="#fb7185"
        />

        {/* Badge text */}
        <text
          x={x - halfWidth + 15}
          y={yPos + 12.5}
          fill="#ffe4e6"
          fontSize={9}
          fontWeight={800}
          letterSpacing="0.03em"
          fontFamily="system-ui, -apple-system, sans-serif"
          style={{ pointerEvents: 'none' }}
        >
          {badgeText}
        </text>
      </g>
    );
  };

  // Render custom SVG Linear Regression Projected Completion Date Badge
  const renderRegressionCompletionBadge = (props: any) => {
    if (!linearRegressionModel) return null;
    const x = props?.viewBox?.x ?? props?.x;
    if (typeof x !== 'number' || isNaN(x)) return null;

    const title = `🎯 PROJ. ZERO GAPS: ${linearRegressionModel.projectedZeroGapDateLabel}`;
    const subtext = `${linearRegressionModel.daysRemainingToZero}d remaining • 0 Gaps (${Math.abs(linearRegressionModel.slopePerMonth).toFixed(1)}/mo burn)`;
    const textWidth = 158;
    const halfWidth = textWidth / 2;
    const yPos = 14;

    return (
      <g
        className="cursor-pointer select-none transition-transform"
        onClick={(e) => {
          e.stopPropagation();
          const compPt = chartTrendData.find((p) => p.isLinearCompletionPoint || p.regressionDeficient === 0);
          if (compPt) {
            setSelectedSnapshotPeriod(compPt.period);
          }
        }}
      >
        {/* Glow halo */}
        <rect
          x={x - halfWidth - 2}
          y={yPos - 2}
          width={textWidth + 4}
          height={32}
          rx={6}
          fill="#0284c7"
          fillOpacity={0.25}
          className="animate-pulse"
        />

        {/* Background box */}
        <rect
          x={x - halfWidth}
          y={yPos}
          width={textWidth}
          height={28}
          rx={5}
          fill="#082f49"
          stroke="#38bdf8"
          strokeWidth={1.5}
          opacity={0.98}
        />

        {/* Target icon dot */}
        <circle cx={x - halfWidth + 10} cy={yPos + 9} r={3.5} fill="#38bdf8" />

        {/* Title text */}
        <text
          x={x - halfWidth + 18}
          y={yPos + 12}
          fill="#f0f9ff"
          fontSize={8.5}
          fontWeight={800}
          letterSpacing="0.02em"
          fontFamily="system-ui, -apple-system, sans-serif"
          style={{ pointerEvents: 'none' }}
        >
          {title}
        </text>

        {/* Subtext */}
        <text
          x={x - halfWidth + 18}
          y={yPos + 22}
          fill="#7dd3fc"
          fontSize={7.5}
          fontWeight={600}
          fontFamily="system-ui, -apple-system, sans-serif"
          style={{ pointerEvents: 'none' }}
        >
          {subtext}
        </text>
      </g>
    );
  };

  // Render custom SVG AI Trend Projected Completion Date Badge
  const renderAiCompletionBadge = (props: any) => {
    if (!aiTrendModel) return null;
    const x = props?.viewBox?.x ?? props?.x;
    if (typeof x !== 'number' || isNaN(x)) return null;

    const title = `⚡ AI TARGET: ${aiTrendModel.projectedZeroGapDateLabel}`;
    const subtext = `${aiTrendModel.daysRemainingToZero}d remaining • ${aiTrendModel.adjustedRemediationVelocity}/mo (${(aiTrendModel.openTaskCompletionRate * 100).toFixed(0)}% tasks)`;
    const textWidth = 168;
    const halfWidth = textWidth / 2;
    const yPos = 48;

    return (
      <g
        className="cursor-pointer select-none transition-transform"
        onClick={(e) => {
          e.stopPropagation();
          const compPt = chartTrendData.find((p) => p.isAiCompletionPoint || p.isLinearCompletionPoint);
          if (compPt) {
            setSelectedSnapshotPeriod(compPt.period);
          }
        }}
      >
        {/* Glow halo */}
        <rect
          x={x - halfWidth - 2}
          y={yPos - 2}
          width={textWidth + 4}
          height={32}
          rx={6}
          fill="#a855f7"
          fillOpacity={0.25}
          className="animate-pulse"
        />

        {/* Background box */}
        <rect
          x={x - halfWidth}
          y={yPos}
          width={textWidth}
          height={28}
          rx={5}
          fill="#3b0764"
          stroke="#c084fc"
          strokeWidth={1.5}
          opacity={0.98}
        />

        {/* Sparkle icon dot */}
        <circle cx={x - halfWidth + 10} cy={yPos + 9} r={3.5} fill="#c084fc" />

        {/* Title text */}
        <text
          x={x - halfWidth + 18}
          y={yPos + 12}
          fill="#faf5ff"
          fontSize={8.5}
          fontWeight={800}
          letterSpacing="0.02em"
          fontFamily="system-ui, -apple-system, sans-serif"
          style={{ pointerEvents: 'none' }}
        >
          {title}
        </text>

        {/* Subtext */}
        <text
          x={x - halfWidth + 18}
          y={yPos + 22}
          fill="#e9d5ff"
          fontSize={7.5}
          fontWeight={600}
          fontFamily="system-ui, -apple-system, sans-serif"
          style={{ pointerEvents: 'none' }}
        >
          {subtext}
        </text>
      </g>
    );
  };

  // Render custom interactive SVG dot on the Regulatory Velocity Net Spread Line
  const renderVelocitySpreadDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (typeof cx !== 'number' || typeof cy !== 'number' || isNaN(cx) || isNaN(cy)) return null;
    if (payload?.netVelocitySpread === undefined || payload?.netVelocitySpread === null) return null;

    const spread = payload.netVelocitySpread;
    const isOutpacing = spread > 0;
    const isLagging = spread < 0;
    const isSelected = selectedVelocityPeriod === payload.period || selectedSnapshot?.period === payload.period;

    const haloColor = isOutpacing ? '#10b981' : isLagging ? '#f43f5e' : '#eab308';
    const tagBg = isOutpacing ? '#064e3b' : isLagging ? '#881337' : '#713f12';
    const tagStroke = isOutpacing ? '#34d399' : isLagging ? '#fb7185' : '#facc15';
    const textColor = isOutpacing ? '#a7f3d0' : isLagging ? '#fecdd3' : '#fef08a';

    return (
      <g
        className="cursor-pointer select-none"
        onClick={(e) => {
          e.stopPropagation();
          setSelectedVelocityPeriod(payload.period);
          setShowVelocityDetailsModal(true);
        }}
      >
        {/* Glow halo */}
        {isSelected && (
          <circle
            cx={cx}
            cy={cy}
            r={14}
            fill={haloColor}
            fillOpacity={0.4}
            className="animate-pulse"
          />
        )}

        {/* Center core dot */}
        <circle
          cx={cx}
          cy={cy}
          r={isSelected ? 6 : 4.5}
          fill="#eab308"
          stroke="#0f172a"
          strokeWidth={2}
        />

        {/* Spread callout tag above dot */}
        <g transform={`translate(${cx}, ${cy - 14})`}>
          <rect
            x={-18}
            y={-8}
            width={36}
            height={13}
            rx={3}
            fill={tagBg}
            stroke={tagStroke}
            strokeWidth={0.8}
            fillOpacity={0.95}
          />
          <text
            x={0}
            y={0}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={8}
            fontFamily="monospace"
            fontWeight="bold"
            fill={textColor}
          >
            {spread > 0 ? `+${spread}` : `${spread}`}
          </text>
        </g>
      </g>
    );
  };

  // Export Compliance Gap & Burndown Line Chart to PDF Handler
  const handleExportPdf = async () => {
    if (isExportingPdf) return;
    setIsExportingPdf(true);
    try {
      // Collect deficient requirements for Part III register
      const defReqs = enrichedRequirements
        .filter((r) => r.complianceStatusBadge === 'Deficient' || r.riskTier === 'HIGH_RISK')
        .slice(0, 15)
        .map((r) => ({
          id: r.id || r.requirementCode,
          title: r.title || r.statement,
          domainId: r.domainNumber,
          domainName: r.domainName,
          severity: r.riskTier === 'HIGH_RISK' ? 'Critical' : 'High',
          status: r.complianceStatusBadge,
          evidenceCount: r.associatedEvidence?.length || 0,
          remediationOwner: 'Risk & Remediation Lead',
          targetResolutionDate: '2026-10-31'
        }));

      // Collect domain readiness stats for Part II domain table
      const domSummary = domainOverlayChartData.map((d: any) => ({
        id: d.domainNumber,
        name: `${d.domainName} (Sec ${d.domainNumber})`,
        readinessScore: d.readinessScore || Math.round(d.readinessSum / (d.totalReqs || 1)),
        deficientCount: d.majorFindingsCount || d.highRiskCount || 0,
        compliantCount: Math.max(0, d.totalReqs - (d.majorFindingsCount || 0)),
        totalCount: d.totalReqs
      }));

      await exportComplianceGapPDF({
        chartElement: chartContainerRef.current,
        chartElementId: 'compliance-gap-burndown-chart-container',
        tenantName: masRegulatoryProfile?.institutionCategory ? `${masRegulatoryProfile.institutionCategory} Entity` : 'Skanda Financial Services Ltd.',
        entityType: masRegulatoryProfile?.entityType || 'Singapore Financial Institution',
        reportingPeriod: 'MAS TRM Q3 2026 Supervisory Cycle',
        metrics: {
          totalRequirements: metrics.total,
          compliantCount: metrics.compliantCount,
          deficientCount: metrics.deficientCount,
          pendingEvidenceCount: metrics.pendingEvidenceCount,
          overallReadiness: metrics.avgReadiness,
          highRiskCount: metrics.highRiskCount
        },
        trendMetrics: {
          baseline: trendMetrics.baseline,
          current: trendMetrics.current,
          netClosed: trendMetrics.netClosed,
          reductionPct: trendMetrics.reductionPct,
          monthlyBurnRate: Number(trendMetrics.monthlyBurnRate) || 1.8,
          projectedZeroDate: trendMetrics.projectedZeroDate
        },
        linearRegressionModel: linearRegressionModel
          ? {
              slopePerMonth: linearRegressionModel.slopePerMonth,
              projectedZeroGapDateFull: linearRegressionModel.projectedZeroGapDateFull,
              projectedZeroGapDateLabel: linearRegressionModel.projectedZeroGapDateLabel,
              daysRemainingToZero: linearRegressionModel.daysRemainingToZero,
              rSquared: linearRegressionModel.rSquared,
              isDeclining: linearRegressionModel.isDeclining
            }
          : null,
        aiTrendModel: aiTrendModel
          ? {
              historicalRemediationSpeedGapsPerMonth: aiTrendModel.historicalRemediationSpeedGapsPerMonth,
              openTaskCompletionRate: aiTrendModel.openTaskCompletionRate,
              momentumMultiplier: aiTrendModel.momentumMultiplier,
              adjustedRemediationVelocity: aiTrendModel.adjustedRemediationVelocity,
              projectedZeroGapDateFull: aiTrendModel.projectedZeroGapDateFull,
              projectedZeroGapDateLabel: aiTrendModel.projectedZeroGapDateLabel,
              daysRemainingToZero: aiTrendModel.daysRemainingToZero,
              confidenceScore: aiTrendModel.confidenceScore
            }
          : null,
        showAiTrendProjection,
        sideBySideStats: sideBySideStats ? {
          currentActual: sideBySideStats.currentActual,
          currentProjected: sideBySideStats.currentProjected,
          currentVariance: sideBySideStats.currentVariance,
          meanAbsoluteError: sideBySideStats.meanAbsoluteError,
          aheadCount: sideBySideStats.aheadCount,
          alignedCount: sideBySideStats.alignedCount,
          laggingCount: sideBySideStats.laggingCount,
          bestMilestone: sideBySideStats.bestMilestone,
          milestonesComparison: sideBySideStats.milestonesComparison.map((m) => ({
            period: m.period,
            dateLabel: m.dateLabel,
            milestone: m.milestone,
            actual: m.actual,
            projected: m.projected,
            variance: m.variance,
            status: m.status
          }))
        } : null,
        showSideBySideComparison,
        comparisonChartType,
        showKeyEventAnnotations,
        showMilestoneAnnotations: showKeyEventAnnotations,
        showRegulatoryVelocity,
        regulatoryVelocityStats: regulatoryVelocityStats
          ? {
              overallVelocityRatio: regulatoryVelocityStats.overallVelocityRatio,
              totalRequirementsReleased: regulatoryVelocityStats.totalRequirementsReleased,
              totalImprovementsRemediated: regulatoryVelocityStats.totalImprovementsRemediated,
              netSpread: regulatoryVelocityStats.netSpread,
              averageImprovementRatePerMonth: regulatoryVelocityStats.averageImprovementRatePerMonth,
              averageNewRequirementsRatePerMonth: regulatoryVelocityStats.averageNewRequirementsRatePerMonth,
              velocityHealthLabel: regulatoryVelocityStats.velocityHealthLabel,
              summaryInsight: regulatoryVelocityStats.summaryInsight
            }
          : null,
        chartTrendData,
        deficientRequirements: defReqs,
        domainsSummary: domSummary
      });
    } catch (err) {
      console.error('Failed to export Compliance Gap PDF report:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <PageContainer id="compliance-gap-visualization-page">
      <div className="space-y-6 max-w-7xl mx-auto pb-16">
        
        {/* Top Header & Context Banner */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute right-1/3 -bottom-16 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  <Flame className="w-3.5 h-3.5 text-rose-400" />
                  MAS TRM Dual-Layer Gap Analytics
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {masRegulatoryProfile?.entityType || 'Singapore Financial Institution'}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Compliance Gap & Evidence Vault Drill-Down
              </h1>
              <p className="text-sm text-slate-400 max-w-3xl mt-1 leading-relaxed">
                Overlays MAS TRM readiness scores against active non-conformities across all 15 regulatory domains.
                Drill down from any <span className="text-rose-400 font-semibold">High Risk</span> requirement directly into the associated evidence vault with verified SHA-256 artifacts.
              </p>
            </div>

            {/* Quick Actions & View Mode Switcher */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Dual-Mode Toggle: Gap Matrix vs AI Recommendation Engine */}
              <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-700/80 shadow-inner">
                <button
                  onClick={() => setActiveViewMode('ANALYTICS_MATRIX')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    activeViewMode === 'ANALYTICS_MATRIX'
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Gap Matrix</span>
                </button>
                <button
                  onClick={() => setActiveViewMode('AUTOMATED_RECOMMENDATIONS')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    activeViewMode === 'AUTOMATED_RECOMMENDATIONS'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                      : 'text-indigo-300 hover:bg-indigo-950/60'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                  <span>AI Recommendations</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-indigo-950/80 text-indigo-200 border border-indigo-400/40 font-bold">
                    {gapExecutiveSummary.recommendations.length} Gaps
                  </span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleExportPdf}
                disabled={isExportingPdf}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white transition-all flex items-center gap-1.5 shadow-md shadow-rose-950/40 border border-rose-500/40 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed active:scale-95"
                title="Generate and download a formal executive PDF report including the line chart, burndown telemetry, and compliance gap data"
              >
                {isExportingPdf ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-rose-200" />
                    <span>Compiling PDF...</span>
                  </>
                ) : (
                  <>
                    <FileDown className="w-4 h-4 text-rose-200" />
                    <span>Export to PDF</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setActiveModule('evidence_centre')}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-2 shadow-sm"
              >
                <FolderCheck className="w-4 h-4 text-emerald-400" />
                Central Evidence Vault ({evidence.length})
              </button>
              <button
                onClick={() => setActiveModule('mas_dashboard')}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-colors flex items-center gap-1.5 shadow-md shadow-rose-950/40"
              >
                <Building2 className="w-4 h-4" />
                MAS TRM Hub
              </button>
            </div>
          </div>
        </div>

        {/* ApplicabilityRule Configuration & Regulatory Profile State Bar */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg backdrop-blur-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Framework Activation State */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">MAS TRM Activation:</span>
                {ruleConfig?.isFrameworkActive ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ACTIVATED
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    INACTIVE (Filtered)
                  </span>
                )}
                <button
                  onClick={() => ruleConfig?.toggleFrameworkActivation?.()}
                  className={`text-xs px-2.5 py-1 rounded border transition-colors font-medium ${
                    ruleConfig?.isFrameworkActive
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-sm'
                  }`}
                  title={ruleConfig?.isFrameworkActive ? 'Deactivate MAS TRM module routes' : 'Activate MAS TRM framework in navigation'}
                >
                  {ruleConfig?.isFrameworkActive ? 'Deactivate / Filter' : 'Activate Framework'}
                </button>
              </div>

              <div className="h-4 w-px bg-slate-800 hidden sm:block" />

              {/* Discovery Profile */}
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
                <span>Profile:</span>
                <span className="text-slate-200 font-medium bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60 font-mono">
                  {masRegulatoryProfile?.institutionCategory || masRegulatoryProfile?.entityType || 'Commercial Bank'}
                </span>
              </div>

              {/* Active Toggleable Module Keys */}
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span>Active Modules:</span>
                <span className="text-cyan-300 font-mono font-semibold bg-cyan-950/40 border border-cyan-800/50 px-2 py-0.5 rounded">
                  {ruleConfig?.activeModuleIds?.length || 7} Applicable
                </span>
              </div>
            </div>

            {/* Recalculate Trigger & Freshness Indicator */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500 hidden lg:inline">
                Readiness synced at {lastCalculatedAt}
              </span>
              <button
                onClick={handleRecalculateMetrics}
                disabled={isRecalculating}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                title="Recalculate regulatory readiness scores based on criticality, open findings, and evidence artifacts"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRecalculating ? 'animate-spin' : ''}`} />
                {isRecalculating ? 'Calculating...' : 'Recalculate Readiness'}
              </button>
            </div>
          </div>
        </div>

        {/* Real-Time Enterprise Regulatory Suite Tab Navigation */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2 shadow-lg">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              type="button"
              onClick={() => setActiveViewMode('ANALYTICS_MATRIX')}
              className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
                activeViewMode === 'ANALYTICS_MATRIX'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Gap & Velocity Analytics</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveViewMode('AUTOMATED_RECOMMENDATIONS')}
              className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
                activeViewMode === 'AUTOMATED_RECOMMENDATIONS'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : 'text-indigo-300 hover:text-white hover:bg-indigo-950/40'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>AI Evidence Hub</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-indigo-950/90 text-indigo-200 border border-indigo-400/40">
                {gapExecutiveSummary.recommendations.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveViewMode('TELEMETRY_CCM')}
              className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
                activeViewMode === 'TELEMETRY_CCM'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-cyan-300 hover:text-white hover:bg-cyan-950/40'
              }`}
            >
              <Zap className="w-4 h-4 text-cyan-300" />
              <span>1. Telemetry & CCM Engine</span>
              <span className="px-1.5 py-0.2 rounded text-[9.5px] font-mono font-bold bg-cyan-950/90 text-cyan-200 border border-cyan-400/40">
                Notice 655
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveViewMode('NOTICE_644_DOWNTIME')}
              className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
                activeViewMode === 'NOTICE_644_DOWNTIME'
                  ? 'bg-rose-700 text-white shadow-md'
                  : 'text-rose-300 hover:text-white hover:bg-rose-950/40'
              }`}
            >
              <Clock className="w-4 h-4 text-rose-300" />
              <span>2. Notice 644 Downtime Ledger</span>
              <span className="px-1.5 py-0.2 rounded text-[9.5px] font-mono font-bold bg-rose-950/90 text-rose-200 border border-rose-400/40">
                4-Hr Cap
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveViewMode('NOTICE_658_SUPPLY_CHAIN')}
              className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
                activeViewMode === 'NOTICE_658_SUPPLY_CHAIN'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-amber-300 hover:text-white hover:bg-amber-950/40'
              }`}
            >
              <Cloud className="w-4 h-4 text-amber-300" />
              <span>3. Third-Party & Cloud (658)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveViewMode('THREAT_DEFENSE_CAPA')}
              className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
                activeViewMode === 'THREAT_DEFENSE_CAPA'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-purple-300 hover:text-white hover:bg-purple-950/40'
              }`}
            >
              <Target className="w-4 h-4 text-purple-300" />
              <span>4. Threat Defense & CAPA</span>
              <span className="px-1.5 py-0.2 rounded text-[9.5px] font-mono font-bold bg-purple-950/90 text-purple-200 border border-purple-400/40">
                CBEST / TIBER
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveViewMode('AUDITOR_3LOD_PORTAL')}
              className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
                activeViewMode === 'AUDITOR_3LOD_PORTAL'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-indigo-300 hover:text-white hover:bg-indigo-950/40'
              }`}
            >
              <Fingerprint className="w-4 h-4 text-cyan-400" />
              <span>5. 3LoD Auditor & Manifest</span>
              <span className="px-1.5 py-0.2 rounded text-[9.5px] font-mono font-bold bg-indigo-950/90 text-cyan-200 border border-cyan-400/40">
                SHA-256
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveViewMode('FEAT_GENAI_SENTINEL')}
              className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
                activeViewMode === 'FEAT_GENAI_SENTINEL'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-purple-300 hover:text-white hover:bg-purple-950/40'
              }`}
            >
              <Brain className="w-4 h-4 text-purple-400" />
              <span>6. FEAT & GenAI Sentinel</span>
              <span className="px-1.5 py-0.2 rounded text-[9.5px] font-mono font-bold bg-purple-950/90 text-purple-200 border border-purple-400/40">
                Shadow AI
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveViewMode('CROSS_REGULATORY_CROSSWALK')}
              className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
                activeViewMode === 'CROSS_REGULATORY_CROSSWALK'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'text-sky-300 hover:text-white hover:bg-sky-950/40'
              }`}
            >
              <ArrowRightLeft className="w-4 h-4 text-sky-400" />
              <span>7. Harmonization & Deduplication</span>
              <span className="px-1.5 py-0.2 rounded text-[9.5px] font-mono font-bold bg-sky-950/90 text-sky-200 border border-sky-400/40">
                5x Multiplier
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveViewMode('PQC_CRYPTO_MIGRATION')}
              className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
                activeViewMode === 'PQC_CRYPTO_MIGRATION'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-emerald-300 hover:text-white hover:bg-emerald-950/40'
              }`}
            >
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>8. PQC Cryptography Ledger</span>
              <span className="px-1.5 py-0.2 rounded text-[9.5px] font-mono font-bold bg-emerald-950/90 text-emerald-200 border border-emerald-400/40">
                Q-Day
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveViewMode('CYBER_WAR_ROOM')}
              className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
                activeViewMode === 'CYBER_WAR_ROOM'
                  ? 'bg-rose-700 text-white shadow-md'
                  : 'text-rose-300 hover:text-white hover:bg-rose-950/40'
              }`}
            >
              <Flame className="w-4 h-4 text-rose-400 animate-pulse" />
              <span>9. Cyber Crisis War Room</span>
              <span className="px-1.5 py-0.2 rounded text-[9.5px] font-mono font-bold bg-rose-950/90 text-rose-200 border border-rose-400/40">
                1h SLA
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveViewMode('BOARD_RISK_APPETITE')}
              className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
                activeViewMode === 'BOARD_RISK_APPETITE'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-amber-300 hover:text-white hover:bg-amber-950/40'
              }`}
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>10. Board Risk Appetite (RAS)</span>
              <span className="px-1.5 py-0.2 rounded text-[9.5px] font-mono font-bold bg-amber-950/90 text-amber-200 border border-amber-400/40">
                BRC Pack
              </span>
            </button>
          </div>
        </div>

        {/* Main Content Body: Switch between Views */}
        {activeViewMode === 'AUTOMATED_RECOMMENDATIONS' ? (
          <EvidenceGapRecommendationHub
            enrichedRequirements={enrichedRequirements}
            onSelectRequirement={(req) => {
              setSelectedRequirement(req);
              setActiveViewMode('ANALYTICS_MATRIX');
            }}
            onNavigateToVault={() => {
              setActiveModule('evidence_centre');
            }}
            onRefreshCalculations={handleRecalculateMetrics}
          />
        ) : activeViewMode === 'TELEMETRY_CCM' ? (
          <AutomatedTelemetryCCMEngine
            onDriftDetected={(controlCode, reason) => {
              showToast({
                title: 'CCM Live Drift Detected',
                message: `${controlCode}: ${reason}`,
                type: 'error'
              });
            }}
            onNavigateToRequirement={(controlCode) => {
              const found = enrichedRequirements.find((r) => r.requirementCode === controlCode);
              if (found) {
                setSelectedRequirement(found);
                setActiveViewMode('ANALYTICS_MATRIX');
              }
            }}
          />
        ) : activeViewMode === 'NOTICE_644_DOWNTIME' ? (
          <Notice644SystemAvailabilityLedger />
        ) : activeViewMode === 'NOTICE_658_SUPPLY_CHAIN' ? (
          <Notice658SupplyChainTelemetry />
        ) : activeViewMode === 'THREAT_DEFENSE_CAPA' ? (
          <ThreatInformedDefenseCAPADesk />
        ) : activeViewMode === 'AUDITOR_3LOD_PORTAL' ? (
          <Auditor3LoDPortal />
        ) : activeViewMode === 'FEAT_GENAI_SENTINEL' ? (
          <FEATGenAIRiskSentinel />
        ) : activeViewMode === 'CROSS_REGULATORY_CROSSWALK' ? (
          <CrossRegulatoryHarmonizationEngine />
        ) : activeViewMode === 'PQC_CRYPTO_MIGRATION' ? (
          <PQCCryptoMigrationLedger />
        ) : activeViewMode === 'CYBER_WAR_ROOM' ? (
          <CyberCrisisWarRoomEngine />
        ) : activeViewMode === 'BOARD_RISK_APPETITE' ? (
          <BoardRiskAppetiteDashboard />
        ) : (
          <>
            {/* KPI Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* KPI 1: Overall Readiness */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold uppercase tracking-wider">MAS TRM Readiness</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white font-mono">{metrics.avgReadiness}%</span>
              <span className="text-xs text-amber-400 font-medium">Weighted Criticality</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  metrics.avgReadiness >= 80 ? 'bg-emerald-500' : metrics.avgReadiness >= 65 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${metrics.avgReadiness}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 mt-2.5 pt-2 border-t border-slate-800/80">
              <span>Notice 655 (Cyber): <strong className="text-slate-200 font-mono">{metrics.cyberHygieneNotice655Readiness}%</strong></span>
              <span>Notice 644 (CIS): <strong className="text-slate-200 font-mono">{metrics.criticalSystemsReadiness}%</strong></span>
            </div>
          </div>

          {/* KPI 2: High Risk Requirements */}
          <div
            onClick={() => setRiskFilter('HIGH_RISK_ONLY')}
            className={`cursor-pointer bg-slate-900 border rounded-xl p-4 shadow-md transition-all ${
              riskFilter === 'HIGH_RISK_ONLY'
                ? 'border-rose-500 ring-1 ring-rose-500/50'
                : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold uppercase tracking-wider text-rose-400">High Risk Controls</span>
              <Flame className="w-4 h-4 text-rose-400 animate-pulse" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-rose-400 font-mono">{metrics.highRiskCount}</span>
              <span className="text-xs text-slate-400">of {metrics.total} requirements</span>
            </div>
            <div className="flex items-center gap-1.5 mt-3 text-[11px] text-rose-300/90 font-medium">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>Direct Evidence Drill-Down Available</span>
            </div>
          </div>

          {/* KPI 3: Open Findings */}
          <div
            onClick={() => setRiskFilter('OPEN_FINDINGS_ONLY')}
            className={`cursor-pointer bg-slate-900 border rounded-xl p-4 shadow-md transition-all ${
              riskFilter === 'OPEN_FINDINGS_ONLY'
                ? 'border-amber-500 ring-1 ring-amber-500/50'
                : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold uppercase tracking-wider text-amber-400">Active Non-Conformities</span>
              <AlertOctagon className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-amber-400 font-mono">{metrics.totalOpenFindings}</span>
              <span className="text-xs text-rose-400 font-semibold font-mono">({metrics.majorNonConformities} Major NC)</span>
            </div>
            <div className="flex items-center gap-1.5 mt-3 text-[11px] text-slate-400">
              <span>CAPA Plans Active in Remediation Desk</span>
            </div>
          </div>

          {/* KPI 4: Evidence Vault Backing */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold uppercase tracking-wider">Evidence Vault Backing</span>
              <FolderCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-emerald-400 font-mono">{metrics.evidenceCoverageRate}%</span>
              <span className="text-xs text-slate-400">Auditor-Grade</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${metrics.evidenceCoverageRate}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 mt-2">
              <span>Cryptographic Proof</span>
              <span>SHA-256 Sealed</span>
            </div>
          </div>

        </div>

        {/* Automated Evidence Recommendations Banner */}
        {(gapExecutiveSummary.totalDeficientRequirements > 0 || gapExecutiveSummary.totalPendingEvidenceRequirements > 0) && (
          <div className="bg-gradient-to-r from-indigo-950/80 via-slate-900 to-purple-950/80 border border-indigo-500/40 rounded-xl p-4 shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    Automated Evidence Recommendation Engine
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    {gapExecutiveSummary.totalDeficientRequirements} Deficient
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {gapExecutiveSummary.totalPendingEvidenceRequirements} Pending Evidence
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    +{gapExecutiveSummary.projectedAverageReadinessIncrease}% Projected Avg Uplift
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white pt-0.5">
                  {immediateWins.length > 0
                    ? `${immediateWins.length} requirements can be immediately bridged with existing EvidenceVault artifacts!`
                    : `${gapExecutiveSummary.recommendations.length} compliance requirements flagged for evidence remediation.`}
                </h4>
                <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                  Algorithmic correlation identified verified EvidenceVault items with matching control codes, keywords, and tags ready to remediate compliance deficiencies.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                {immediateWins.length > 0 && (
                  <button
                    onClick={handleBulkBridgeAllWins}
                    disabled={isBulkBridging}
                    className="px-3.5 py-2 rounded-lg text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white flex items-center gap-1.5 shadow-md shadow-emerald-950/40 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Zap className={`w-3.5 h-3.5 ${isBulkBridging ? 'animate-spin' : 'text-amber-300'}`} />
                    <span>
                      {isBulkBridging ? 'Auto-Bridging...' : `1-Click Auto-Bridge (${immediateWins.length})`}
                    </span>
                  </button>
                )}

                <button
                  onClick={() => setActiveViewMode('AUTOMATED_RECOMMENDATIONS')}
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 shadow-md shadow-indigo-950/40 transition-all"
                >
                  <span>Open Recommendation Hub</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Analytics & Trends Section: Deficiency Burndown Line Chart & Domain Readiness Overlay */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-5">
          {/* Top Control Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  <TrendingDown className="w-4 h-4" />
                </span>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>
                    {chartDisplayMode === 'BURNDOWN_TREND'
                      ? "Deficiency Reduction & Remediation Velocity Trend"
                      : chartDisplayMode === 'DOMAIN_OVERLAY'
                      ? "Domain Readiness Scores vs. Active Non-Conformities Overlay"
                      : "Regulatory Analytics: Deficiency Burndown & Domain Readiness"}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-500/20 text-rose-300">
                    MAS TRM 2021 / Notice 655
                  </span>
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {chartDisplayMode === 'BURNDOWN_TREND'
                  ? "Recharts temporal tracking measuring the systematic burn-down of 'Deficient' requirements from baseline audit to current live posture."
                  : chartDisplayMode === 'DOMAIN_OVERLAY'
                  ? "Bar height indicates the domain compliance readiness score (0-100%). Red line indicates open non-conformity findings requiring remediation."
                  : "Combined executive views: Longitudinal deficiency burndown velocity alongside domain readiness posture."}
              </p>
            </div>

            {/* Chart View Mode Switcher & PDF Export */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1 shadow-inner">
                <button
                  onClick={() => setChartDisplayMode('BURNDOWN_TREND')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    chartDisplayMode === 'BURNDOWN_TREND'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>Deficiency Burndown</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-rose-950/80 text-rose-200 border border-rose-500/30 font-bold">
                    {metrics.deficientCount}
                  </span>
                </button>

                <button
                  onClick={() => setChartDisplayMode('DOMAIN_OVERLAY')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    chartDisplayMode === 'DOMAIN_OVERLAY'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Domain Readiness</span>
                </button>

                <button
                  onClick={() => setChartDisplayMode('COMBINED')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    chartDisplayMode === 'COMBINED'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Combined View</span>
                </button>
              </div>

              {/* Dedicated Export to PDF Action Button */}
              <button
                type="button"
                onClick={handleExportPdf}
                disabled={isExportingPdf}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white border border-rose-500/50 shadow-md shadow-rose-950/40 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed active:scale-95 shrink-0"
                title="Generate and download a formal multi-page PDF audit report with current chart and compliance data"
              >
                {isExportingPdf ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-200" />
                    <span>Compiling Report...</span>
                  </>
                ) : (
                  <>
                    <FileDown className="w-3.5 h-3.5 text-rose-200" />
                    <span>Export to PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Executive Burndown Stats Strip */}
          {(chartDisplayMode === 'BURNDOWN_TREND' || chartDisplayMode === 'COMBINED') && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Baseline Deficiencies
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-bold font-mono text-slate-300">
                    {trendMetrics.baseline}
                  </span>
                  <span className="text-[11px] text-slate-500">at initial audit</span>
                </div>
              </div>

              <div className="bg-slate-950/70 border border-rose-500/30 rounded-xl p-3 space-y-1">
                <span className="text-[10px] uppercase font-bold text-rose-400 block tracking-wider flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-rose-400" />
                  Active Deficiencies
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-bold font-mono text-rose-300">
                    {metrics.deficientCount}
                  </span>
                  <span className="text-[11px] text-rose-400/80">current gap</span>
                </div>
              </div>

              <div className="bg-slate-950/70 border border-emerald-500/30 rounded-xl p-3 space-y-1">
                <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-wider flex items-center gap-1">
                  <TrendingDown className="w-3 h-3 text-emerald-400" />
                  Net Reduction Rate
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-bold font-mono text-emerald-300">
                    -{trendMetrics.reductionPct}%
                  </span>
                  <span className="text-[11px] text-emerald-400/80">({trendMetrics.netClosed} closed)</span>
                </div>
              </div>

              <div className="bg-slate-950/70 border border-indigo-500/30 rounded-xl p-3 space-y-1">
                <span className="text-[10px] uppercase font-bold text-indigo-400 block tracking-wider flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-300" />
                  Burndown Pace
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-bold font-mono text-indigo-200">
                    ~{trendMetrics.monthlyBurnRate}
                  </span>
                  <span className="text-[11px] text-indigo-300/80">gaps / month</span>
                </div>
              </div>

              <div className="bg-slate-950/70 border border-amber-500/30 rounded-xl p-3 space-y-1 col-span-2 sm:col-span-3 lg:col-span-1">
                <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider flex items-center gap-1">
                  <Target className="w-3 h-3 text-amber-400" />
                  Target Milestone
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-sm font-bold font-mono text-amber-300">
                    &le; 2 Gaps
                  </span>
                  <span className="text-[11px] text-slate-400">({trendMetrics.projectedZeroDate})</span>
                </div>
              </div>
            </div>
          )}

          {/* Burndown Trend Chart Controls */}
          {(chartDisplayMode === 'BURNDOWN_TREND' || chartDisplayMode === 'COMBINED') && (
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-semibold text-[11px]">Time Horizon:</span>
                <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                  <button
                    onClick={() => setTrendTimeHorizon('6_MONTHS')}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                      trendTimeHorizon === '6_MONTHS'
                        ? 'bg-rose-600 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    6-Month Burndown
                  </button>
                  <button
                    onClick={() => setTrendTimeHorizon('YTD')}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                      trendTimeHorizon === 'YTD'
                        ? 'bg-rose-600 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    YTD 2026
                  </button>
                  <button
                    onClick={() => setTrendTimeHorizon('12_MONTHS')}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                      trendTimeHorizon === '12_MONTHS'
                        ? 'bg-rose-600 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    12-Month Financial Year
                  </button>
                </div>
              </div>

              {/* Layer toggles and Milestone filter */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="flex items-center gap-1.5 text-[11px] font-medium text-rose-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                    Deficient Gaps (Burn-down)
                  </span>

                  <label className="flex items-center gap-1.5 text-[11px] text-slate-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showPendingInTrend}
                      onChange={(e) => setShowPendingInTrend(e.target.checked)}
                      className="rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-0 w-3.5 h-3.5"
                    />
                    <span className="text-amber-300">Pending Evidence</span>
                  </label>

                  <label className="flex items-center gap-1.5 text-[11px] text-slate-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showReadinessInTrend}
                      onChange={(e) => setShowReadinessInTrend(e.target.checked)}
                      className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-0 w-3.5 h-3.5"
                    />
                    <span className="text-emerald-300">Readiness % (Dual Axis)</span>
                  </label>

                  <label
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold cursor-pointer select-none transition-all sm:border-l sm:border-slate-800 sm:pl-3 ${
                      showKeyEventAnnotations
                        ? 'bg-sky-950/70 border-sky-500/60 text-sky-200 shadow-sm shadow-sky-950/40'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                    title="Toggle key event annotations directly on the trend chart (e.g. 'Policy Updated', 'Audit Started') providing visual context to compliance fluctuations"
                  >
                    <input
                      type="checkbox"
                      checked={showKeyEventAnnotations}
                      onChange={(e) => setShowKeyEventAnnotations(e.target.checked)}
                      className="rounded bg-slate-800 border-slate-700 text-sky-500 focus:ring-0 w-3.5 h-3.5"
                    />
                    <span className="text-sky-300 flex items-center gap-1.5 font-semibold">
                      <Bookmark className="w-3.5 h-3.5 text-sky-400" />
                      <span>Key Event Annotations</span>
                      <span className="px-1.5 py-0.2 rounded text-[9.5px] font-mono bg-sky-900/80 text-sky-200 border border-sky-500/40 font-bold hidden sm:inline-block">
                        e.g. 'Policy Updated', 'Audit Started'
                      </span>
                    </span>
                  </label>

                  <label className="flex items-center gap-1.5 text-[11px] text-slate-300 cursor-pointer select-none sm:border-l sm:border-slate-800 sm:pl-3">
                    <input
                      type="checkbox"
                      checked={showAnomalyOverlay}
                      onChange={(e) => setShowAnomalyOverlay(e.target.checked)}
                      className="rounded bg-slate-800 border-slate-700 text-rose-500 focus:ring-0 w-3.5 h-3.5"
                    />
                    <span className="text-rose-300 flex items-center gap-1 font-medium">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                      Anomaly Detector
                      {activeHorizonAnomalies.length > 0 && (
                        <span
                          onClick={(e) => {
                            if (activeHorizonAnomalies[0]) {
                              e.stopPropagation();
                              setSelectedAnomaly(activeHorizonAnomalies[0]);
                            }
                          }}
                          className="px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-rose-950 text-rose-200 border border-rose-500/50 hover:bg-rose-900 cursor-pointer transition-colors shadow-sm"
                          title="Click to drill down into active anomaly spikes"
                        >
                          {activeHorizonAnomalies.length} Spike{activeHorizonAnomalies.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </span>
                  </label>

                  <label className="flex items-center gap-1.5 text-[11px] text-slate-300 cursor-pointer select-none sm:border-l sm:border-slate-800 sm:pl-3">
                    <input
                      type="checkbox"
                      checked={showRegressionTrend}
                      onChange={(e) => setShowRegressionTrend(e.target.checked)}
                      className="rounded bg-slate-800 border-slate-700 text-sky-500 focus:ring-0 w-3.5 h-3.5"
                    />
                    <span className="text-sky-300 flex items-center gap-1 font-medium">
                      <TrendingDown className="w-3.5 h-3.5 text-sky-400" />
                      Regression Projection
                      {linearRegressionModel && (
                        <span
                          className="px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-sky-950 text-sky-200 border border-sky-500/50 shadow-sm"
                          title={`Projected 100% Compliance Clearance: ${linearRegressionModel.projectedZeroGapDateFull}`}
                        >
                          Target: {linearRegressionModel.projectedZeroGapDateLabel}
                        </span>
                      )}
                    </span>
                  </label>

                  {/* AI-Driven Trend Projection Line Toggle */}
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-300 cursor-pointer select-none sm:border-l sm:border-slate-800 sm:pl-3">
                    <input
                      type="checkbox"
                      checked={showAiTrendProjection}
                      onChange={(e) => setShowAiTrendProjection(e.target.checked)}
                      className="rounded bg-slate-800 border-slate-700 text-purple-500 focus:ring-0 w-3.5 h-3.5"
                    />
                    <span className="text-purple-300 flex items-center gap-1 font-medium">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      <span>AI Trend Projection</span>
                      {aiTrendModel && (
                        <span
                          className="px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-purple-950 text-purple-200 border border-purple-500/50 shadow-sm"
                          title={`Forecast based on ${aiTrendModel.historicalRemediationSpeedGapsPerMonth} gaps/mo speed and ${(aiTrendModel.openTaskCompletionRate * 100).toFixed(0)}% task completion`}
                        >
                          AI: {aiTrendModel.projectedZeroGapDateLabel} ({aiTrendModel.momentumMultiplier}x)
                        </span>
                      )}
                    </span>
                  </label>

                  {/* AI Scenario Selector (when AI projection is active) */}
                  {showAiTrendProjection && (
                    <div className="flex items-center gap-1 bg-purple-950/40 border border-purple-500/30 rounded-lg p-0.5 sm:border-l sm:border-purple-800/60 sm:pl-1.5">
                      <span className="text-[10px] text-purple-300/80 font-medium px-1 hidden md:inline">Pace Scenario:</span>
                      <button
                        type="button"
                        onClick={() => setAiVelocityScenario('CONSERVATIVE')}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                          aiVelocityScenario === 'CONSERVATIVE'
                            ? 'bg-purple-700 text-white shadow-sm'
                            : 'text-purple-300 hover:text-white'
                        }`}
                        title="Conservative scenario: accounts for task bottlenecks or backlog friction (0.75x modifier)"
                      >
                        <span>Conservative</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setAiVelocityScenario('BALANCED')}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                          aiVelocityScenario === 'BALANCED'
                            ? 'bg-purple-700 text-white shadow-sm'
                            : 'text-purple-300 hover:text-white'
                        }`}
                        title="Balanced empirical scenario: weighted by live task completion rates (1.0x)"
                      >
                        <span>Nominal (Live)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setAiVelocityScenario('ACCELERATED')}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                          aiVelocityScenario === 'ACCELERATED'
                            ? 'bg-purple-700 text-white shadow-sm'
                            : 'text-purple-300 hover:text-white'
                        }`}
                        title="Accelerated sprint scenario: 1.25x momentum boost from prioritized remediation sprint"
                      >
                        <span>Accelerated</span>
                      </button>
                    </div>
                  )}

                  {/* Side-by-Side Comparison Toggle: Projected Gap vs Actual Gap */}
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-300 cursor-pointer select-none sm:border-l sm:border-slate-800 sm:pl-3">
                    <input
                      type="checkbox"
                      checked={showSideBySideComparison}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setShowSideBySideComparison(checked);
                        if (checked) {
                          setShowRegressionTrend(true);
                        }
                      }}
                      className="rounded bg-slate-800 border-slate-700 text-indigo-500 focus:ring-0 w-3.5 h-3.5"
                    />
                    <span className="text-indigo-300 flex items-center gap-1.5 font-medium">
                      <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Side-by-Side: Projected vs Actual Gap</span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[9.5px] font-bold transition-colors ${
                          showSideBySideComparison
                            ? 'bg-indigo-950 text-indigo-200 border border-indigo-500/50 shadow-sm'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {showSideBySideComparison ? 'Active' : 'Off'}
                      </span>
                    </span>
                  </label>

                  {/* Format Sub-Toggle for Side-by-Side Comparison */}
                  {showSideBySideComparison && (
                    <div className="flex items-center gap-1 bg-indigo-950/40 border border-indigo-500/30 rounded-lg p-0.5 sm:border-l sm:border-indigo-800/60 sm:pl-1.5">
                      <button
                        type="button"
                        onClick={() => setComparisonChartType('CLUSTERED_BARS')}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                          comparisonChartType === 'CLUSTERED_BARS'
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-indigo-300 hover:text-white'
                        }`}
                        title="Display side-by-side clustered columns of Actual Gap vs Projected Gap at each milestone"
                      >
                        <BarChart3 className="w-3 h-3" />
                        <span>Clustered Bars</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setComparisonChartType('DUAL_LINES')}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                          comparisonChartType === 'DUAL_LINES'
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-indigo-300 hover:text-white'
                        }`}
                        title="Display dual contrasting lines with variance delta indicators"
                      >
                        <TrendingDown className="w-3 h-3" />
                        <span>Dual Lines</span>
                      </button>
                    </div>
                  )}

                  {/* Interactive Regulatory Velocity Overlay Toggle */}
                  <label
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold cursor-pointer select-none transition-all sm:border-l sm:border-slate-800 sm:pl-3 ${
                      showRegulatoryVelocity
                        ? 'bg-amber-950/70 border-amber-500/60 text-amber-200 shadow-sm shadow-amber-950/40'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                    title="Overlay Regulatory Velocity: Rate of compliance improvement vs volume of new regulatory requirements released within the same period"
                  >
                    <input
                      type="checkbox"
                      checked={showRegulatoryVelocity}
                      onChange={(e) => setShowRegulatoryVelocity(e.target.checked)}
                      className="rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-0 w-3.5 h-3.5"
                    />
                    <span className="text-amber-300 flex items-center gap-1.5 font-semibold">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>Regulatory Velocity</span>
                      <span className="px-1.5 py-0.2 rounded text-[9.5px] font-mono bg-amber-900/80 text-amber-200 border border-amber-500/40 font-bold hidden sm:inline-block">
                        Improvement vs Req Influx
                      </span>
                      {regulatoryVelocityStats && (
                        <span
                          className={`px-1.5 py-0.2 rounded text-[9.5px] font-bold ${
                            regulatoryVelocityStats.overallVelocityRatio >= 1.15
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                              : regulatoryVelocityStats.overallVelocityRatio < 0.95
                              ? 'bg-rose-950 text-rose-300 border border-rose-500/50'
                              : 'bg-amber-950 text-amber-300 border border-amber-500/50'
                          }`}
                          title={`Overall Velocity Ratio: ${regulatoryVelocityStats.overallVelocityRatio}x absorption`}
                        >
                          {regulatoryVelocityStats.overallVelocityRatio}x
                        </span>
                      )}
                    </span>
                  </label>

                  {/* Regulatory Velocity Mode Selector */}
                  {showRegulatoryVelocity && (
                    <div className="flex items-center gap-1 bg-amber-950/40 border border-amber-500/30 rounded-lg p-0.5 sm:border-l sm:border-amber-800/60 sm:pl-1.5">
                      <button
                        type="button"
                        onClick={() => setRegulatoryVelocityMode('CLUSTERED_BARS')}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                          regulatoryVelocityMode === 'CLUSTERED_BARS'
                            ? 'bg-amber-600 text-white shadow-sm'
                            : 'text-amber-300 hover:text-white'
                        }`}
                        title="Display side-by-side clustered columns: Rate of Improvement (Remediated) vs Volume of New Requirements"
                      >
                        <BarChart3 className="w-3 h-3" />
                        <span>Clustered Bars</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setRegulatoryVelocityMode('SPREAD_LINE')}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                          regulatoryVelocityMode === 'SPREAD_LINE'
                            ? 'bg-amber-600 text-white shadow-sm'
                            : 'text-amber-300 hover:text-white'
                        }`}
                        title="Display Net Regulatory Velocity Spread Trendline (+ Lead / - Lag)"
                      >
                        <TrendingUp className="w-3 h-3" />
                        <span>Velocity Spread</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setRegulatoryVelocityMode('COMBINED')}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                          regulatoryVelocityMode === 'COMBINED'
                            ? 'bg-amber-600 text-white shadow-sm'
                            : 'text-amber-300 hover:text-white'
                        }`}
                        title="Display both Clustered Bars and Net Velocity Spread Trendline"
                      >
                        <Layers className="w-3 h-3" />
                        <span>Combined</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Key Event Category Filter (when annotations are enabled) */}
                {showKeyEventAnnotations && (
                  <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 rounded-lg p-0.5">
                    <span className="text-[10px] text-slate-400 font-medium px-1.5 hidden md:inline">Event Filter:</span>
                    <button
                      onClick={() => setSelectedMilestoneCategory('ALL')}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                        selectedMilestoneCategory === 'ALL'
                          ? 'bg-slate-700 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      All Events
                    </button>
                    <button
                      onClick={() => setSelectedMilestoneCategory('POLICY')}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors flex items-center gap-1 ${
                        selectedMilestoneCategory === 'POLICY'
                          ? 'bg-sky-500/25 text-sky-300 border border-sky-500/40 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                      title="Filter to policy updates (e.g. 'Policy Updated', Notice 655 Enforced)"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                      Policies (e.g. Policy Updated)
                    </button>
                    <button
                      onClick={() => setSelectedMilestoneCategory('AUDIT')}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors flex items-center gap-1 ${
                        selectedMilestoneCategory === 'AUDIT'
                          ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                      title="Filter to audit milestones (e.g. 'Audit Started', 'Audit Passed')"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Audits (e.g. Audit Started)
                    </button>
                    <button
                      onClick={() => setSelectedMilestoneCategory('TECH')}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors flex items-center gap-1 ${
                        selectedMilestoneCategory === 'TECH'
                          ? 'bg-purple-500/25 text-purple-300 border border-purple-500/40 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                      title="Filter to technical/platform milestones (e.g. Vault Launched, Telemetry Connected)"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                      Vault/Tech
                    </button>
                  </div>
                )}

                {/* Secondary Quick Export Button */}
                <button
                  type="button"
                  onClick={handleExportPdf}
                  disabled={isExportingPdf}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-rose-300 border border-rose-500/40 hover:border-rose-400 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title="Export Burndown Chart & Compliance Data to PDF Report"
                >
                  {isExportingPdf ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-400" />
                      <span>Exporting PDF...</span>
                    </>
                  ) : (
                    <>
                      <FileDown className="w-3.5 h-3.5 text-rose-400" />
                      <span>Export Chart PDF</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* View 1: Recharts Line Chart for Reduction of Deficient Requirements Over Time */}
          {(chartDisplayMode === 'BURNDOWN_TREND' || chartDisplayMode === 'COMBINED') && (
            <div className="space-y-4 pt-1">
              {/* Executive AI-Driven Compliance Forecast & Momentum Engine Card */}
              {showAiTrendProjection && aiTrendModel && (
                <div className="bg-gradient-to-r from-slate-900 via-purple-950/30 to-slate-900 border border-purple-500/35 rounded-2xl p-4 shadow-xl space-y-3 relative overflow-hidden backdrop-blur-md">
                  <div className="absolute top-0 right-0 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

                  {/* Header Strip */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-800/80">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30 shrink-0">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                            <span>AI-Driven Compliance Forecasting &amp; Remediation Velocity Engine</span>
                          </h4>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                            Task-Weighted AI Forecast • {(aiTrendModel.confidenceScore * 100).toFixed(0)}% Confidence
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-950 text-purple-300 border border-purple-800/60 uppercase">
                            {aiTrendModel.scenario} PACE
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Forecasting compliance clearance by modulating historical remediation speed ({aiTrendModel.historicalRemediationSpeedGapsPerMonth} gaps/mo) against live open task completion rates ({(aiTrendModel.openTaskCompletionRate * 100).toFixed(0)}% throughput)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                      <span className="text-[11px] font-mono text-purple-300 bg-purple-950/70 px-2.5 py-1 rounded-lg border border-purple-500/30">
                        Model: {aiTrendModel.formula}
                      </span>
                    </div>
                  </div>

                  {/* 4 Metric Blocks Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* 1: Historical Remediation Speed */}
                    <div className="bg-slate-950/60 border border-purple-500/30 rounded-xl p-3 space-y-1 relative overflow-hidden">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">
                          Historical Speed
                        </span>
                        <Activity className="w-3.5 h-3.5 text-purple-400" />
                      </div>
                      <div className="text-lg font-bold font-mono text-purple-300 tracking-tight">
                        {aiTrendModel.historicalRemediationSpeedGapsPerMonth.toFixed(1)} Gaps / Mo
                      </div>
                      <div className="text-[11px] text-slate-400">
                        ~{aiTrendModel.historicalAverageResolutionDays} days avg per deficiency closure
                      </div>
                    </div>

                    {/* 2: Open Task Completion Rate */}
                    <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                          Task Completion Rate
                        </span>
                        <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <div className="text-lg font-bold font-mono text-emerald-300 tracking-tight">
                        {(aiTrendModel.openTaskCompletionRate * 100).toFixed(1)}% Completed
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {aiTrendModel.completedTasksCount} closed / {aiTrendModel.openTasksCount} active remediation tasks
                      </div>
                    </div>

                    {/* 3: Velocity Momentum Multiplier */}
                    <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                          Velocity Momentum
                        </span>
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                      </div>
                      <div className="text-lg font-bold font-mono text-amber-300 tracking-tight">
                        {aiTrendModel.momentumMultiplier.toFixed(2)}x Pace Factor
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Adjusted burn: {aiTrendModel.adjustedRemediationVelocity} gaps/mo ({aiTrendModel.scenario.toLowerCase()})
                      </div>
                    </div>

                    {/* 4: AI Projected Zero-Gap Completion Date */}
                    <div className="bg-slate-950/60 border border-purple-500/30 rounded-xl p-3 space-y-1 relative overflow-hidden">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">
                          AI Projected Clearance
                        </span>
                        <Target className="w-3.5 h-3.5 text-purple-400" />
                      </div>
                      <div className="text-base font-bold text-white tracking-tight truncate">
                        {aiTrendModel.projectedZeroGapDateFull}
                      </div>
                      <div className="text-[11px] text-purple-300 font-medium flex items-center justify-between">
                        <span>{aiTrendModel.daysRemainingToZero} Days Remaining</span>
                        <span className="font-mono text-[10px] text-emerald-400">
                          {aiTrendModel.varianceVsLinearDays > 0
                            ? `+${aiTrendModel.varianceVsLinearDays}d faster vs OLS`
                            : aiTrendModel.varianceVsLinearDays < 0
                            ? `${aiTrendModel.varianceVsLinearDays}d vs OLS`
                            : 'Aligned with OLS'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* AI Analytical Insights Strip */}
                  <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-300">
                    <div className="flex items-start sm:items-center gap-2">
                      <Brain className="w-4 h-4 text-purple-400 shrink-0 mt-0.5 sm:mt-0" />
                      <div className="text-[11.5px] leading-relaxed">
                        <span className="text-slate-200">
                          AI Forecast: Based on <strong className="text-white font-mono">{aiTrendModel.historicalRemediationSpeedGapsPerMonth}</strong> gaps/mo speed and <strong className="text-white font-mono">{(aiTrendModel.openTaskCompletionRate * 100).toFixed(0)}%</strong> task completion, zero gaps is forecasted for{' '}
                          <strong className="text-purple-300 underline decoration-purple-400 decoration-dotted underline-offset-2">
                            {aiTrendModel.projectedZeroGapDateFull}
                          </strong>{' '}
                          ({aiTrendModel.daysRemainingToZero} days remaining; {aiTrendModel.varianceVsLinearDays > 0 ? `${aiTrendModel.varianceVsLinearDays} days earlier than linear regression` : 'in line with linear projection'}).
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          const compPt = chartTrendData.find((p) => p.isAiCompletionPoint || p.isLinearCompletionPoint);
                          if (compPt) {
                            setSelectedSnapshotPeriod(compPt.period);
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-500/40 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <span>Inspect Forecast Target</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Executive Linear Regression Forecast Card */}
              {showRegressionTrend && linearRegressionModel && (
                <div className="bg-gradient-to-r from-slate-900 via-sky-950/25 to-slate-900 border border-sky-500/30 rounded-2xl p-4 shadow-xl space-y-3 relative overflow-hidden backdrop-blur-md">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 rounded-full blur-2xl pointer-events-none" />

                  {/* Header Strip */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-800/80">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/30 shrink-0">
                        <TrendingDown className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-white tracking-tight">
                            Linear Regression Projection &amp; Compliance Completion Date
                          </h4>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40">
                            OLS Model • R² = {(linearRegressionModel.rSquared * 100).toFixed(1)}%
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Empirical reduction velocity based on historical burndown across {linearRegressionModel.historicalCount} supervisory cycles ({linearRegressionModel.startDateLabel} &rarr; {linearRegressionModel.currentDateLabel})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                      <span className="text-[11px] font-mono text-sky-300 bg-sky-950/70 px-2.5 py-1 rounded-lg border border-sky-500/30">
                        Model: {linearRegressionModel.formula}
                      </span>
                    </div>
                  </div>

                  {/* Metric Blocks Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* 1: Projected Zero-Gap Completion Date */}
                    <div className="bg-slate-950/60 border border-sky-500/30 rounded-xl p-3 space-y-1 relative overflow-hidden">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider">
                          Projected Completion Date
                        </span>
                        <Target className="w-3.5 h-3.5 text-sky-400" />
                      </div>
                      <div className="text-lg font-bold text-white tracking-tight">
                        {linearRegressionModel.projectedZeroGapDateFull}
                      </div>
                      <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>{linearRegressionModel.daysRemainingToZero} Days Remaining to Zero Gaps</span>
                      </div>
                    </div>

                    {/* 2: Historical Reduction Rate (Burn Rate) */}
                    <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">
                          Historical Burn Rate
                        </span>
                        <Activity className="w-3.5 h-3.5 text-rose-400" />
                      </div>
                      <div className="text-lg font-bold font-mono text-rose-300 tracking-tight">
                        {linearRegressionModel.slopePerMonth.toFixed(1)} Gaps / Mo
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {Math.abs(linearRegressionModel.slopePerWeek).toFixed(2)} deficiencies closed / week
                      </div>
                    </div>

                    {/* 3: MAS Target Benchmark Reached (<= 2 Gaps) */}
                    <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                          MAS Target (≤ 2 Gaps)
                        </span>
                        <Award className="w-3.5 h-3.5 text-amber-400" />
                      </div>
                      <div className="text-lg font-bold text-slate-200 tracking-tight">
                        {linearRegressionModel.currentDeficiencies <= 2
                          ? 'Benchmark Met (Live)'
                          : linearRegressionModel.projectedTargetGapDateFull}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {linearRegressionModel.currentDeficiencies <= 2
                          ? `Live deficiencies (${linearRegressionModel.currentDeficiencies}) are within MAS threshold`
                          : `${linearRegressionModel.daysRemainingToTarget} days until threshold attained`}
                      </div>
                    </div>

                    {/* 4: Statistical Confidence & Model Fit */}
                    <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                          Predictive Fit (R²)
                        </span>
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      </div>
                      <div className="text-lg font-bold font-mono text-indigo-300 tracking-tight">
                        {(linearRegressionModel.rSquared * 100).toFixed(1)}% Correlation
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {linearRegressionModel.rSquared > 0.85
                          ? 'Strong linear burndown trajectory'
                          : 'Moderate trend correlation'}
                      </div>
                    </div>
                  </div>

                  {/* Analytical Narrative Callout */}
                  <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span>
                        Based on the empirical reduction rate of deficient controls (closing at{' '}
                        <strong className="text-white font-mono">{Math.abs(linearRegressionModel.slopePerMonth).toFixed(1)}</strong> gaps/month), full zero-deficiency compliance completion is projected for{' '}
                        <strong className="text-sky-300 underline decoration-sky-400 decoration-dotted underline-offset-2">
                          {linearRegressionModel.projectedZeroGapDateFull}
                        </strong>{' '}
                        ({linearRegressionModel.daysRemainingToZero} calendar days remaining).
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        const compPt = chartTrendData.find((p) => p.isLinearCompletionPoint || p.regressionDeficient === 0);
                        if (compPt) {
                          setSelectedSnapshotPeriod(compPt.period);
                        }
                      }}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-sky-950 hover:bg-sky-900 text-sky-300 border border-sky-500/40 transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Inspect Zero-Gap Target State</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}

              {/* Side-by-Side Comparison Dashboard: Projected Gap vs Actual Gap */}
              {showSideBySideComparison && sideBySideStats && (
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-indigo-500/35 rounded-2xl p-4 shadow-xl space-y-3 relative overflow-hidden backdrop-blur-md">
                  <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

                  {/* Header Strip */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-800/80">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 shrink-0">
                        <ArrowLeftRight className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                            <span>Side-by-Side Gap Analysis: Projected vs Actual</span>
                          </h4>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                            Comparative Delta Mode • {comparisonChartType === 'CLUSTERED_BARS' ? 'Side-by-Side Bars' : 'Dual Lines'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Milestone-by-milestone benchmarking of observed deficiencies (Actual Gap) against Ordinary Least Squares regression burndown (Projected Gap)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                      <button
                        type="button"
                        onClick={() => setShowSideBySideMatrix(!showSideBySideMatrix)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-500/40 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Scale className="w-3 h-3" />
                        <span>{showSideBySideMatrix ? 'Hide Milestone Matrix' : 'View Milestone Matrix'}</span>
                        {showSideBySideMatrix ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  {/* Comparison Summary KPIs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* 1: Current Live State Gap */}
                    <div className="bg-slate-950/70 border border-indigo-500/30 rounded-xl p-3 space-y-1.5 relative overflow-hidden">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                          Current Live Milestone
                        </span>
                        <span className={`px-1.5 py-0.2 rounded text-[9.5px] font-bold ${
                          sideBySideStats.currentVariance < -0.2
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : sideBySideStats.currentVariance > 0.2
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                        }`}>
                          {sideBySideStats.currentVariance < -0.2 ? 'Ahead of Model' : sideBySideStats.currentVariance > 0.2 ? 'Lagging Model' : 'On Track'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-0.5">
                        <div className="bg-rose-950/30 border border-rose-500/30 rounded-lg p-1.5">
                          <span className="text-[9.5px] text-rose-300 block font-medium">Actual Gap</span>
                          <span className="text-base font-bold font-mono text-rose-400">{sideBySideStats.currentActual}</span>
                          <span className="text-[9px] text-slate-500 block">observed</span>
                        </div>
                        <div className="bg-sky-950/30 border border-sky-500/30 rounded-lg p-1.5">
                          <span className="text-[9.5px] text-sky-300 block font-medium">Projected Gap</span>
                          <span className="text-base font-bold font-mono text-sky-300">{sideBySideStats.currentProjected}</span>
                          <span className="text-[9px] text-slate-500 block">regression</span>
                        </div>
                      </div>
                      <div className="text-[10.5px] font-medium flex items-center justify-between pt-0.5">
                        <span className="text-slate-400">Current Variance (Δ):</span>
                        <span className={`font-mono font-bold ${
                          sideBySideStats.currentVariance < 0 ? 'text-emerald-400' : sideBySideStats.currentVariance > 0 ? 'text-rose-400' : 'text-slate-300'
                        }`}>
                          {sideBySideStats.currentVariance > 0 ? `+${sideBySideStats.currentVariance}` : sideBySideStats.currentVariance} gaps
                        </span>
                      </div>
                    </div>

                    {/* 2: Pace Consistency & Milestone Distribution */}
                    <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                        Milestone Trajectory Health
                      </span>
                      <div className="flex items-center gap-1.5 text-xs font-mono font-bold">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" title="Milestones with fewer gaps than projected">
                          {sideBySideStats.aheadCount} Ahead
                        </span>
                        <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30" title="Milestones matching projected trajectory">
                          {sideBySideStats.alignedCount} On Track
                        </span>
                        <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30" title="Milestones with more gaps than projected">
                          {sideBySideStats.laggingCount} Lagging
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 pt-1">
                        Best milestone:{' '}
                        <strong className="text-emerald-400 font-medium">{sideBySideStats.bestMilestone.dateLabel}</strong> ({sideBySideStats.bestMilestone.variance > 0 ? `+${sideBySideStats.bestMilestone.variance}` : sideBySideStats.bestMilestone.variance} gaps vs model)
                      </div>
                    </div>

                    {/* 3: Mean Absolute Error / Variance */}
                    <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-purple-400 block tracking-wider">
                        Mean Absolute Deviation
                      </span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xl font-bold font-mono text-purple-300">
                          ±{sideBySideStats.meanAbsoluteError}
                        </span>
                        <span className="text-xs text-purple-400/80">gaps average variance</span>
                      </div>
                      <div className="text-[11px] text-slate-400 pt-0.5">
                        Indicates average difference between actual deficiencies and linear model estimates across supervisory cycles.
                      </div>
                    </div>

                    {/* 4: Projected Target Clearance Date */}
                    <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-wider flex items-center justify-between">
                        <span>Zero-Gap Model Projection</span>
                        <Target className="w-3.5 h-3.5 text-emerald-400" />
                      </span>
                      <div className="text-base font-bold text-white tracking-tight truncate">
                        {sideBySideStats.projectedZeroGapDateFull}
                      </div>
                      <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>{sideBySideStats.daysRemainingToZero} Days Remaining to Zero Deficiencies</span>
                      </div>
                    </div>
                  </div>

                  {/* Milestone Comparison Matrix Table */}
                  {showSideBySideMatrix && (
                    <div className="pt-2 border-t border-slate-800/80 space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-300">
                        <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                          <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
                          Detailed Milestone Breakdown: Actual Gap vs Projected Gap
                        </span>
                        <span className="text-[10.5px] text-slate-400">
                          Click any row to jump to its audit snapshot in Evidence Vault
                        </span>
                      </div>

                      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-slate-800 bg-slate-900/80 text-[10.5px] uppercase font-semibold tracking-wider text-slate-400">
                              <th className="py-2.5 px-3">Milestone / Cycle</th>
                              <th className="py-2.5 px-3 text-center">Actual Gap</th>
                              <th className="py-2.5 px-3 text-center">Projected Gap</th>
                              <th className="py-2.5 px-3">Side-by-Side Visual Gauge</th>
                              <th className="py-2.5 px-3 text-center">Variance (Δ)</th>
                              <th className="py-2.5 px-3 text-center">Pace Status</th>
                              <th className="py-2.5 px-3 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60 font-medium">
                            {sideBySideStats.milestonesComparison.map((m) => {
                              const maxGaps = Math.max(
                                ...sideBySideStats.milestonesComparison.map((x) => Math.max(x.actual, x.projected)),
                                10
                              );
                              const actualPct = Math.min(100, Math.round((m.actual / maxGaps) * 100));
                              const projPct = Math.min(100, Math.round((m.projected / maxGaps) * 100));
                              const isSelected = selectedSnapshot?.period === m.period;

                              return (
                                <tr
                                  key={m.period}
                                  onClick={() => setSelectedSnapshotPeriod(m.period)}
                                  className={`cursor-pointer transition-colors ${
                                    isSelected
                                      ? 'bg-indigo-950/50 hover:bg-indigo-950/70'
                                      : 'hover:bg-slate-900/60'
                                  }`}
                                >
                                  <td className="py-2.5 px-3">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-bold text-white">{m.dateLabel}</span>
                                      {m.isCurrent && (
                                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                          Live
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[10.5px] text-slate-400 truncate max-w-xs">{m.milestone}</div>
                                  </td>
                                  <td className="py-2.5 px-3 text-center">
                                    <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-rose-950/60 text-rose-300 border border-rose-500/40">
                                      {m.actual} gaps
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 text-center">
                                    <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-sky-950/60 text-sky-300 border border-sky-500/40">
                                      {m.projected} gaps
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 min-w-[150px]">
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-1.5 text-[9.5px]">
                                        <span className="w-12 text-rose-400 font-mono">Act:</span>
                                        <div className="flex-1 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                          <div
                                            className="bg-rose-500 h-full rounded-full transition-all"
                                            style={{ width: `${actualPct}%` }}
                                          />
                                        </div>
                                        <span className="font-mono text-slate-300 w-6 text-right">{m.actual}</span>
                                      </div>
                                      <div className="flex items-center gap-1.5 text-[9.5px]">
                                        <span className="w-12 text-sky-400 font-mono">Proj:</span>
                                        <div className="flex-1 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                          <div
                                            className="bg-sky-400 h-full rounded-full transition-all"
                                            style={{ width: `${projPct}%` }}
                                          />
                                        </div>
                                        <span className="font-mono text-slate-300 w-6 text-right">{m.projected}</span>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-2.5 px-3 text-center font-mono font-bold">
                                    <span className={
                                      m.variance < -0.2
                                        ? 'text-emerald-400'
                                        : m.variance > 0.2
                                        ? 'text-rose-400'
                                        : 'text-slate-300'
                                    }>
                                      {m.variance > 0 ? `+${m.variance}` : m.variance}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 text-center">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                      m.status === 'AHEAD'
                                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                        : m.status === 'LAGGING'
                                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                        : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                                    }`}>
                                      {m.status === 'AHEAD' ? 'Ahead of Schedule' : m.status === 'LAGGING' ? 'Behind Schedule' : 'On Track'}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 text-right">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedSnapshotPeriod(m.period);
                                      }}
                                      className="px-2 py-1 rounded text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 transition-colors inline-flex items-center gap-1 cursor-pointer"
                                    >
                                      <span>Inspect</span>
                                      <ArrowRight className="w-2.5 h-2.5" />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Executive Regulatory Velocity & Requirement Influx Engine Card */}
              {showRegulatoryVelocity && regulatoryVelocityStats && (
                <div className="bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 border border-amber-500/35 rounded-2xl p-4 shadow-xl space-y-3 relative overflow-hidden backdrop-blur-md">
                  <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

                  {/* Header Strip */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-800/80">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 shrink-0">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                            <span>Regulatory Velocity &amp; Requirement Influx Engine</span>
                          </h4>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            Pace Ratio: {regulatoryVelocityStats.overallVelocityRatio}x Absorption
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            regulatoryVelocityStats.velocityHealth === 'EXPANDING_LEAD'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                              : regulatoryVelocityStats.velocityHealth === 'STABLE_ABSORPTION'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                              : 'bg-rose-950 text-rose-300 border border-rose-800/60'
                          }`}>
                            {regulatoryVelocityStats.velocityHealthLabel}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Longitudinal comparison of compliance improvement velocity (remediated controls) against volume of new regulatory requirements published across MAS TRM, Notice 655, and ISO 27001
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                      <button
                        type="button"
                        onClick={() => setShowVelocityEngineCard(!showVelocityEngineCard)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-500/40 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Scale className="w-3 h-3" />
                        <span>{showVelocityEngineCard ? 'Hide Velocity Matrix' : 'View Velocity Matrix'}</span>
                        {showVelocityEngineCard ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  {/* 4 Metric Blocks */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* 1: Rate of Compliance Improvement */}
                    <div className="bg-slate-950/70 border border-cyan-500/30 rounded-xl p-3 space-y-1.5 relative overflow-hidden">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                          Improvement Rate
                        </span>
                        <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                      </div>
                      <div className="text-lg font-bold font-mono text-cyan-300 tracking-tight">
                        ~{regulatoryVelocityStats.averageImprovementRatePerMonth} / Mo
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center justify-between">
                        <span>Cumulative Remediated:</span>
                        <span className="font-mono font-bold text-cyan-400">{regulatoryVelocityStats.totalImprovementsRemediated} items</span>
                      </div>
                    </div>

                    {/* 2: Regulatory Requirements Released */}
                    <div className="bg-slate-950/70 border border-amber-500/30 rounded-xl p-3 space-y-1.5 relative overflow-hidden">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                          New Reqs Released
                        </span>
                        <FileText className="w-3.5 h-3.5 text-amber-400" />
                      </div>
                      <div className="text-lg font-bold font-mono text-amber-300 tracking-tight">
                        ~{regulatoryVelocityStats.averageNewRequirementsRatePerMonth} / Mo
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center justify-between">
                        <span>Total Published:</span>
                        <span className="font-mono font-bold text-amber-400">{regulatoryVelocityStats.totalRequirementsReleased} mandates</span>
                      </div>
                    </div>

                    {/* 3: Net Velocity Spread */}
                    <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-yellow-400 tracking-wider">
                          Net Velocity Spread
                        </span>
                        <Activity className="w-3.5 h-3.5 text-yellow-400" />
                      </div>
                      <div className="text-lg font-bold font-mono text-yellow-300 tracking-tight flex items-baseline gap-1">
                        <span>{regulatoryVelocityStats.netSpread > 0 ? `+${regulatoryVelocityStats.netSpread}` : regulatoryVelocityStats.netSpread}</span>
                        <span className="text-xs text-slate-400 font-sans font-normal">net margin</span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center justify-between">
                        <span>Absorption Ratio:</span>
                        <span className={`font-mono font-bold ${
                          regulatoryVelocityStats.overallVelocityRatio >= 1 ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {regulatoryVelocityStats.overallVelocityRatio}x
                        </span>
                      </div>
                    </div>

                    {/* 4: Absorption Posture & Health */}
                    <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                          Absorption Posture
                        </span>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <div className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>{regulatoryVelocityStats.velocityHealth === 'EXPANDING_LEAD' ? 'Ahead of Mandates' : 'Absorbing Surge'}</span>
                      </div>
                      <div className="text-[10.5px] text-slate-400 leading-tight">
                        {regulatoryVelocityStats.summaryInsight}
                      </div>
                    </div>
                  </div>

                  {/* Period Velocity Matrix Table */}
                  {showVelocityEngineCard && (
                    <div className="pt-2 border-t border-slate-800/80 space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-300">
                        <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                          <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
                          Period Breakdown: Improvement Velocity vs New Requirements Released
                        </span>
                        <span className="text-[10.5px] text-slate-400">
                          Click any row to drill into published circulars &amp; executed remediations
                        </span>
                      </div>

                      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-slate-800 bg-slate-900/80 text-[10.5px] uppercase font-semibold tracking-wider text-slate-400">
                              <th className="py-2.5 px-3">Milestone / Period</th>
                              <th className="py-2.5 px-3 text-center">Improvement Rate</th>
                              <th className="py-2.5 px-3 text-center">New Reqs Released</th>
                              <th className="py-2.5 px-3">Velocity Comparison Gauge</th>
                              <th className="py-2.5 px-3 text-center">Net Spread</th>
                              <th className="py-2.5 px-3 text-center">Velocity Posture</th>
                              <th className="py-2.5 px-3 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60 font-medium">
                            {regulatoryVelocityStats.periods.map((p) => {
                              const maxVal = Math.max(
                                ...regulatoryVelocityStats.periods.map((x) => Math.max(x.improvementRate, x.newRequirementsVolume)),
                                6
                              );
                              const impPct = Math.min(100, Math.round((p.improvementRate / maxVal) * 100));
                              const reqPct = Math.min(100, Math.round((p.newRequirementsVolume / maxVal) * 100));
                              const isSelected = selectedVelocityPeriod === p.period || selectedSnapshot?.period === p.period;

                              return (
                                <tr
                                  key={p.period}
                                  onClick={() => {
                                    setSelectedVelocityPeriod(p.period);
                                    setShowVelocityDetailsModal(true);
                                  }}
                                  className={`cursor-pointer transition-colors ${
                                    isSelected
                                      ? 'bg-amber-950/50 hover:bg-amber-950/70'
                                      : 'hover:bg-slate-900/60'
                                  }`}
                                >
                                  <td className="py-2.5 px-3">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-bold text-white">{p.dateLabel}</span>
                                      <span className="text-[10px] text-slate-400 font-normal">({p.period})</span>
                                    </div>
                                    <div className="text-[10.5px] text-slate-400 flex items-center gap-1 mt-0.5">
                                      {p.releasedRequirements.slice(0, 1).map((rel, idx) => (
                                        <span key={idx} className="truncate text-amber-300/80 font-mono text-[9.5px]">
                                          {rel.authority}: {rel.circularRef}
                                        </span>
                                      ))}
                                    </div>
                                  </td>
                                  <td className="py-2.5 px-3 text-center">
                                    <span className="px-2 py-0.5 rounded font-mono font-bold bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">
                                      +{p.improvementRate} / mo
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 text-center">
                                    <span className="px-2 py-0.5 rounded font-mono font-bold bg-amber-950/60 text-amber-300 border border-amber-500/30">
                                      +{p.newRequirementsVolume} Reqs
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 min-w-[140px]">
                                    <div className="space-y-1">
                                      <div className="flex items-center justify-between text-[9px] text-slate-400">
                                        <span className="text-cyan-400">Imp: {p.improvementRate}</span>
                                        <span className="text-amber-400">Req: {p.newRequirementsVolume}</span>
                                      </div>
                                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden flex">
                                        <div
                                          className="h-full bg-cyan-500 rounded-l-full"
                                          style={{ width: `${(impPct / (impPct + reqPct || 1)) * 100}%` }}
                                          title={`Improvement Rate: ${p.improvementRate}`}
                                        />
                                        <div
                                          className="h-full bg-amber-500 rounded-r-full"
                                          style={{ width: `${(reqPct / (impPct + reqPct || 1)) * 100}%` }}
                                          title={`New Requirements: ${p.newRequirementsVolume}`}
                                        />
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-2.5 px-3 text-center">
                                    <span className={`font-mono font-bold ${
                                      p.netVelocity > 0
                                        ? 'text-emerald-400'
                                        : p.netVelocity < 0
                                        ? 'text-rose-400'
                                        : 'text-amber-400'
                                    }`}>
                                      {p.netVelocity > 0 ? `+${p.netVelocity}` : p.netVelocity}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 text-center">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                      p.velocityStatus === 'OUTPACING'
                                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                        : p.velocityStatus === 'LAGGING'
                                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                    }`}>
                                      {p.velocityStatus === 'OUTPACING' ? 'Outpacing Influx' : p.velocityStatus === 'LAGGING' ? 'Regulatory Lag' : 'Parity'}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 text-right">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedVelocityPeriod(p.period);
                                        setShowVelocityDetailsModal(true);
                                      }}
                                      className="px-2 py-1 rounded text-[10px] font-semibold bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-500/40 transition-colors inline-flex items-center gap-1 cursor-pointer"
                                    >
                                      <span>Inspect Releases</span>
                                      <ArrowRight className="w-2.5 h-2.5" />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div
                id="compliance-gap-burndown-chart-container"
                className="h-80 w-full relative"
                ref={chartContainerRef}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={chartTrendData}
                    margin={{ top: 42, right: 30, left: -10, bottom: 15 }}
                    onClick={(e: any) => {
                      if (e && e.activePayload && e.activePayload.length > 0) {
                        const point = e.activePayload[0].payload;
                        if (point?.period) {
                          setSelectedSnapshotPeriod(point.period);
                        }
                      }
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                    <XAxis
                      dataKey="dateLabel"
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                    />
                    <YAxis
                      yAxisId="left"
                      stroke="#f43f5e"
                      fontSize={11}
                      domain={[0, 'dataMax + 3']}
                      tickLine={false}
                      label={{
                        value: 'Deficient Reqs (Count)',
                        angle: -90,
                        position: 'insideLeft',
                        fill: '#f43f5e',
                        fontSize: 10,
                        offset: 15
                      }}
                    />
                    {showReadinessInTrend && (
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#10b981"
                        fontSize={11}
                        domain={[0, 100]}
                        tickFormatter={(v) => `${v}%`}
                        tickLine={false}
                        label={{
                          value: 'Overall Readiness (%)',
                          angle: 90,
                          position: 'insideRight',
                          fill: '#10b981',
                          fontSize: 10,
                          offset: 15
                        }}
                      />
                    )}
                    <Tooltip
                      content={({ active, payload }) => {
                        // Suppress regular data tooltip when user is specifically hovering a milestone annotation marker
                        if (hoveredMilestone) return null;

                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-slate-900/95 border border-slate-700 rounded-xl p-3.5 shadow-2xl text-xs space-y-2 max-w-xs backdrop-blur-sm">
                              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 gap-2">
                                <span className="font-bold text-white flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5 text-sky-400" />
                                  {data.period}
                                </span>
                                {data.isCurrent && (
                                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                    Live State
                                  </span>
                                )}
                                {data.isProjected && !data.isLinearCompletionPoint && (
                                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                    Projected
                                  </span>
                                )}
                                {data.isLinearCompletionPoint && (
                                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40">
                                    Zero-Gap Target
                                  </span>
                                )}
                              </div>

                              <div className="space-y-1">
                                <div className="flex justify-between items-center text-slate-300">
                                  <span className="flex items-center gap-1.5 text-rose-400 font-semibold">
                                    <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                                    Deficient Requirements:
                                  </span>
                                  <span className="font-mono font-bold text-rose-300 text-sm">
                                    {data.deficient != null ? data.deficient : 0}
                                  </span>
                                </div>

                                {showPendingInTrend && (
                                  <div className="flex justify-between items-center text-slate-300">
                                    <span className="flex items-center gap-1.5 text-amber-400">
                                      <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                                      Pending Evidence:
                                    </span>
                                    <span className="font-mono font-medium text-amber-300">
                                      {data.pendingEvidence != null ? data.pendingEvidence : 0}
                                    </span>
                                  </div>
                                )}

                                <div className="flex justify-between items-center text-slate-300">
                                  <span className="flex items-center gap-1.5 text-emerald-400">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                                    Compliant / Verified:
                                  </span>
                                  <span className="font-mono font-medium text-emerald-300">
                                    {data.compliant}
                                  </span>
                                </div>

                                {showReadinessInTrend && (
                                  <div className="flex justify-between items-center text-slate-300 pt-1 border-t border-slate-800/80">
                                    <span className="flex items-center gap-1.5 text-sky-400">
                                      <ShieldCheck className="w-3 h-3 text-sky-400" />
                                      MAS TRM Readiness:
                                    </span>
                                    <span className="font-mono font-bold text-sky-300">
                                      {data.overallReadiness}%
                                    </span>
                                  </div>
                                )}

                                {showRegressionTrend && data.regressionDeficient !== undefined && data.regressionDeficient !== null && (
                                  <div className="flex justify-between items-center text-slate-300 pt-1 border-t border-slate-800/80">
                                    <span className="flex items-center gap-1.5 text-sky-400 font-semibold text-xs">
                                      <TrendingDown className="w-3 h-3 text-sky-400" />
                                      Linear Regression Trend:
                                    </span>
                                    <span className="font-mono font-bold text-sky-300 text-xs">
                                      {data.regressionDeficient} Gaps
                                    </span>
                                  </div>
                                )}

                                {showAiTrendProjection && data.aiProjectedDeficient !== undefined && data.aiProjectedDeficient !== null && (
                                  <div className="flex justify-between items-center text-slate-300 pt-1 border-t border-purple-900/50">
                                    <span className="flex items-center gap-1.5 text-purple-300 font-semibold text-xs">
                                      <Sparkles className="w-3 h-3 text-purple-400" />
                                      AI Trend Projection:
                                    </span>
                                    <span className="font-mono font-bold text-purple-300 text-xs">
                                      {data.aiProjectedDeficient} Gaps
                                    </span>
                                  </div>
                                )}

                                {/* Side-by-Side Comparison Callout in Tooltip */}
                                {showSideBySideComparison && data.actualGap !== undefined && data.projectedGap !== undefined && (
                                  <div className="pt-2 border-t border-indigo-900/60 bg-indigo-950/40 -mx-3.5 px-3.5 py-2 space-y-1.5 border-y border-indigo-500/30">
                                    <div className="flex items-center justify-between text-[11px] font-bold text-indigo-300">
                                      <span className="flex items-center gap-1">
                                        <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-400" />
                                        Side-by-Side Gap Analysis
                                      </span>
                                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                                        data.gapVariance < -0.2
                                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                          : data.gapVariance > 0.2
                                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                          : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                                      }`}>
                                        {data.gapVariance < -0.2 ? 'Ahead of Model' : data.gapVariance > 0.2 ? 'Lagging Model' : 'On Track'}
                                      </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-1.5 text-center font-mono">
                                      <div className="bg-rose-950/40 border border-rose-500/30 rounded p-1">
                                        <span className="text-[9px] text-rose-300 block font-sans">Actual Gap</span>
                                        <span className="text-xs font-bold text-rose-400">{data.actualGap != null ? data.actualGap : '0'}</span>
                                      </div>
                                      <div className="bg-sky-950/40 border border-sky-500/30 rounded p-1">
                                        <span className="text-[9px] text-sky-300 block font-sans">Projected Gap</span>
                                        <span className="text-xs font-bold text-sky-300">{data.projectedGap != null ? data.projectedGap : '0'}</span>
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-between text-[10px] text-slate-300 pt-0.5">
                                      <span className="text-slate-400">Variance Delta (Δ):</span>
                                      <span className={`font-mono font-bold ${
                                        data.gapVariance < 0 ? 'text-emerald-400' : data.gapVariance > 0 ? 'text-rose-400' : 'text-slate-300'
                                      }`}>
                                        {data.gapVariance != null ? (data.gapVariance > 0 ? `+${data.gapVariance}` : `${data.gapVariance}`) : '0'} gaps
                                      </span>
                                    </div>
                                  </div>
                                )}

                                {/* Regulatory Velocity Callout in Tooltip */}
                                {showRegulatoryVelocity && (data.improvementRate !== undefined || data.newRequirementsVolume !== undefined) && (
                                  <div className="pt-2 border-t border-amber-900/60 bg-amber-950/40 -mx-3.5 px-3.5 py-2 space-y-1.5 border-y border-amber-500/30">
                                    <div className="flex items-center justify-between text-[11px] font-bold text-amber-300">
                                      <span className="flex items-center gap-1">
                                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                                        Regulatory Velocity
                                      </span>
                                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                                        data.velocityStatus === 'OUTPACING'
                                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                          : data.velocityStatus === 'LAGGING'
                                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                      }`}>
                                        {data.velocityStatus === 'OUTPACING' ? 'Outpacing Influx' : data.velocityStatus === 'LAGGING' ? 'Lagging Mandates' : 'Velocity Parity'}
                                      </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-1.5 text-center font-mono">
                                      <div className="bg-cyan-950/40 border border-cyan-500/30 rounded p-1">
                                        <span className="text-[9px] text-cyan-300 block font-sans">Improvement Rate</span>
                                        <span className="text-xs font-bold text-cyan-300">+{data.improvementRate || 0} / mo</span>
                                      </div>
                                      <div className="bg-amber-950/40 border border-amber-500/30 rounded p-1">
                                        <span className="text-[9px] text-amber-300 block font-sans">New Reqs Released</span>
                                        <span className="text-xs font-bold text-amber-300">+{data.newRequirementsVolume || 0} reqs</span>
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-between text-[10px] text-slate-300 pt-0.5">
                                      <span className="text-slate-400">Net Velocity Spread:</span>
                                      <span className={`font-mono font-bold ${
                                        (data.netVelocitySpread || 0) > 0 ? 'text-emerald-400' : (data.netVelocitySpread || 0) < 0 ? 'text-rose-400' : 'text-slate-300'
                                      }`}>
                                        {(data.netVelocitySpread || 0) > 0 ? `+${data.netVelocitySpread}` : (data.netVelocitySpread || 0)} margin
                                      </span>
                                    </div>
                                    {data.releasedRequirementsDetails && data.releasedRequirementsDetails.length > 0 && (
                                      <div className="pt-1 text-[9.5px] text-amber-200/90 leading-tight">
                                        <span className="text-amber-400 font-semibold">{data.releasedRequirementsDetails.length} New Mandate(s):</span>{' '}
                                        {data.releasedRequirementsDetails.map((r: any) => `${r.authority} ${r.circularRef}`).join(', ')}
                                      </div>
                                    )}
                                    <div className="pt-1 text-[9px] text-amber-300/80 font-medium flex items-center gap-1 cursor-pointer">
                                      <Zap className="w-2.5 h-2.5 text-amber-400" />
                                      <span>Click bar or marker to inspect regulatory requirements</span>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Linear Regression Zero-Gap Completion Callout in Tooltip */}
                              {data.isLinearCompletionPoint && linearRegressionModel && (
                                <div className="pt-2 border-t border-sky-900/60 bg-sky-950/40 -mx-3.5 -mb-1 px-3.5 py-2 rounded-b-xl border border-sky-500/30 space-y-1">
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="flex items-center gap-1 font-bold text-sky-300 text-[11px]">
                                      <Target className="w-3.5 h-3.5 text-sky-400" />
                                      Zero-Gap Compliance Target
                                    </span>
                                    <span className="px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-sky-500 text-white shadow-sm">
                                      0 Gaps
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-sky-200/90 leading-tight">
                                    Empirical projected completion date: {linearRegressionModel.projectedZeroGapDateFull} ({linearRegressionModel.daysRemainingToZero} days remaining).
                                  </p>
                                </div>
                              )}

                              {/* Milestone Event Annotation Callout in Tooltip */}
                              {data.eventAnnotation && (
                                <div className="pt-2 border-t border-slate-800 space-y-1">
                                  <div className="flex items-center justify-between gap-1.5">
                                    <span
                                      className="px-1.5 py-0.5 rounded text-[9.5px] font-bold uppercase tracking-wider"
                                      style={{
                                        backgroundColor: `${data.eventAnnotation.badgeColor}25`,
                                        color: data.eventAnnotation.badgeColor,
                                        border: `1px solid ${data.eventAnnotation.badgeColor}40`
                                      }}
                                    >
                                      {data.eventAnnotation.eventTitle}
                                    </span>
                                    <span className="text-[10px] font-semibold text-emerald-400">
                                      {data.eventAnnotation.impactText}
                                    </span>
                                  </div>
                                  {data.eventAnnotation.eventSubtext && (
                                    <div className="text-[11px] font-medium text-slate-200">
                                      {data.eventAnnotation.eventSubtext}
                                    </div>
                                  )}
                                  {data.eventAnnotation.detailedNotes && (
                                    <div className="text-[10px] text-slate-400 leading-relaxed">
                                      {data.eventAnnotation.detailedNotes}
                                    </div>
                                  )}
                                  </div>
                              )}

                              {/* Anomaly Detector Spike Alert in Tooltip */}
                              {data.spikeAnomaly && (
                                <div className="pt-2 border-t border-rose-900/60 bg-rose-950/40 -mx-3.5 -mb-1 px-3.5 py-2 rounded-b-xl border border-rose-500/30 space-y-1.5">
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="flex items-center gap-1 font-bold text-rose-300 text-[11px]">
                                      <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                                      Anomaly Spike Detected
                                    </span>
                                    <span className="px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-rose-500 text-white shadow-sm">
                                      +{data.spikeAnomaly.gapIncrease} Gaps (+{data.spikeAnomaly.percentageSpike}%)
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-rose-200/90 leading-tight">
                                    {data.spikeAnomaly.triggerEventTitle}
                                  </p>
                                  <div className="text-[9.5px] text-rose-300/80 font-medium flex items-center gap-1 pt-0.5">
                                    <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                                    Click marker to drill down into {data.spikeAnomaly.incurredRequirements.length} audit findings
                                  </div>
                                </div>
                              )}

                              {data.milestone && !data.eventAnnotation && !data.spikeAnomaly && (
                                <div className="pt-1.5 border-t border-slate-800 text-[11px] text-amber-300/90 flex items-center gap-1">
                                  <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                                  <span>{data.milestone}</span>
                                </div>
                              )}

                              <div className="pt-1 border-t border-slate-800/80 text-[10px] text-sky-400 flex items-center gap-1">
                                <History className="w-3 h-3 shrink-0" />
                                <span>Click to inspect EvidenceVault at this time</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend
                      verticalAlign="top"
                      height={30}
                      formatter={(value) => {
                        if (value === 'deficient' || value === 'actualGap') {
                          return (
                            <span className="text-xs text-rose-300 font-semibold flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block" />
                              {showSideBySideComparison ? 'Actual Gap (Observed)' : 'Deficient Requirements'}
                            </span>
                          );
                        }
                        if (value === 'pendingEvidence') return <span className="text-xs text-amber-300">Pending Evidence</span>;
                        if (value === 'overallReadiness') return <span className="text-xs text-emerald-300 font-semibold">Overall Readiness (%)</span>;
                        if (value === 'regressionDeficient' || value === 'projectedGap') {
                          return (
                            <span className="text-xs text-sky-300 font-semibold flex items-center gap-1.5">
                              <span className="w-3 h-0.5 bg-sky-400 inline-block border-b border-dashed border-sky-300" />
                              {showSideBySideComparison
                                ? `Projected Gap (OLS Regression • Target: ${linearRegressionModel?.projectedZeroGapDateLabel || 'Target'})`
                                : `Linear Regression Trend (Projected Completion: ${linearRegressionModel?.projectedZeroGapDateLabel || 'Target'})`}
                            </span>
                          );
                        }
                        if (value === 'aiProjectedDeficient') {
                          return (
                            <span className="text-xs text-purple-300 font-semibold flex items-center gap-1.5">
                              <span className="w-3 h-0.5 bg-purple-400 inline-block border-b border-dashed border-purple-300" />
                              {`AI Trend Projection (Pace: ${aiTrendModel?.adjustedRemediationVelocity || '2.4'}/mo • Target: ${aiTrendModel?.projectedZeroGapDateLabel || 'Target'})`}
                            </span>
                          );
                        }
                        if (value === 'improvementRate') {
                          return (
                            <span className="text-xs text-cyan-300 font-semibold flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500 inline-block" />
                              Improvement Rate (+Remediated/mo)
                            </span>
                          );
                        }
                        if (value === 'newRequirementsVolume') {
                          return (
                            <span className="text-xs text-amber-300 font-semibold flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" />
                              New Reqs Released (+Mandates/mo)
                            </span>
                          );
                        }
                        if (value === 'netVelocitySpread') {
                          return (
                            <span className="text-xs text-yellow-300 font-semibold flex items-center gap-1.5">
                              <span className="w-3 h-0.5 bg-yellow-400 inline-block border-b border-dashed border-yellow-300" />
                              Net Velocity Spread (Margin)
                            </span>
                          );
                        }
                        return <span className="text-xs text-slate-300">{value}</span>;
                      }}
                    />

                    {/* MAS Compliance Benchmark Line (<= 2 Deficiencies) */}
                    <ReferenceLine
                      yAxisId="left"
                      y={2}
                      stroke="#f59e0b"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      label={{
                        value: 'MAS Target (≤ 2 Gaps)',
                        fill: '#f59e0b',
                        fontSize: 10,
                        position: 'insideTopLeft'
                      }}
                    />

                    {/* Linear Regression Projected Completion Date Reference Line & SVG Badge */}
                    {showRegressionTrend && linearRegressionModel && (
                      <ReferenceLine
                        yAxisId="left"
                        x={
                          chartTrendData.find((p) => p.isLinearCompletionPoint)?.dateLabel ||
                          chartTrendData[chartTrendData.length - 1].dateLabel
                        }
                        stroke="#38bdf8"
                        strokeDasharray="3 3"
                        strokeWidth={2}
                        strokeOpacity={0.85}
                        label={renderRegressionCompletionBadge}
                      />
                    )}

                    {/* Linear Regression 0 Gaps Completion Dot on the Zero Axis */}
                    {showRegressionTrend && linearRegressionModel && (
                      <ReferenceDot
                        yAxisId="left"
                        x={
                          chartTrendData.find((p) => p.isLinearCompletionPoint)?.dateLabel ||
                          chartTrendData[chartTrendData.length - 1].dateLabel
                        }
                        y={0}
                        shape={(dotProps: any) => {
                          const { cx, cy } = dotProps;
                          if (typeof cx !== 'number' || typeof cy !== 'number' || isNaN(cx) || isNaN(cy)) return null;
                          return (
                            <g
                              className="cursor-pointer select-none"
                              onClick={(e) => {
                                e.stopPropagation();
                                const compPt = chartTrendData.find(
                                  (p) => p.isLinearCompletionPoint || p.regressionDeficient === 0
                                );
                                if (compPt) {
                                  setSelectedSnapshotPeriod(compPt.period);
                                }
                              }}
                            >
                              <circle
                                cx={cx}
                                cy={cy}
                                r={16}
                                fill="none"
                                stroke="#38bdf8"
                                strokeWidth={1.5}
                                opacity={0.7}
                                className="animate-ping"
                              />
                              <circle
                                cx={cx}
                                cy={cy}
                                r={10}
                                fill="#0284c7"
                                fillOpacity={0.35}
                                className="animate-pulse"
                              />
                              <circle
                                cx={cx}
                                cy={cy}
                                r={6}
                                fill="#0284c7"
                                stroke="#ffffff"
                                strokeWidth={2}
                              />
                            </g>
                          );
                        }}
                      />
                    )}

                    {/* AI Trend Projected Completion Date Reference Line & SVG Badge */}
                    {showAiTrendProjection && aiTrendModel && (
                      <ReferenceLine
                        yAxisId="left"
                        x={
                          chartTrendData.find((p) => p.isAiCompletionPoint)?.dateLabel ||
                          chartTrendData.find((p) => p.isLinearCompletionPoint)?.dateLabel ||
                          chartTrendData[chartTrendData.length - 1].dateLabel
                        }
                        stroke="#a855f7"
                        strokeDasharray="2 2"
                        strokeWidth={2}
                        strokeOpacity={0.9}
                        label={renderAiCompletionBadge}
                      />
                    )}

                    {/* AI Trend Projected 0 Gaps Completion Dot on the Zero Axis */}
                    {showAiTrendProjection && aiTrendModel && (
                      <ReferenceDot
                        yAxisId="left"
                        x={
                          chartTrendData.find((p) => p.isAiCompletionPoint)?.dateLabel ||
                          chartTrendData.find((p) => p.isLinearCompletionPoint)?.dateLabel ||
                          chartTrendData[chartTrendData.length - 1].dateLabel
                        }
                        y={0}
                        shape={(dotProps: any) => {
                          const { cx, cy } = dotProps;
                          if (typeof cx !== 'number' || typeof cy !== 'number' || isNaN(cx) || isNaN(cy)) return null;
                          return (
                            <g
                              className="cursor-pointer select-none"
                              onClick={(e) => {
                                e.stopPropagation();
                                const compPt = chartTrendData.find(
                                  (p) => p.isAiCompletionPoint || p.isLinearCompletionPoint || p.aiProjectedDeficient === 0
                                );
                                if (compPt) {
                                  setSelectedSnapshotPeriod(compPt.period);
                                }
                              }}
                            >
                              <circle
                                cx={cx}
                                cy={cy}
                                r={18}
                                fill="none"
                                stroke="#c084fc"
                                strokeWidth={1.5}
                                opacity={0.7}
                                className="animate-ping"
                              />
                              <circle
                                cx={cx}
                                cy={cy}
                                r={11}
                                fill="#7e22ce"
                                fillOpacity={0.35}
                                className="animate-pulse"
                              />
                              <circle
                                cx={cx}
                                cy={cy}
                                r={6}
                                fill="#a855f7"
                                stroke="#ffffff"
                                strokeWidth={2}
                              />
                            </g>
                          );
                        }}
                      />
                    )}

                    {/* Anomaly Detector Overlay: Highlight Spans where Deficiencies Increased */}
                    {showAnomalyOverlay &&
                      activeHorizonAnomalies.map((anom) => (
                        <ReferenceArea
                          key={`anomaly-area-${anom.id}`}
                          yAxisId="left"
                          x1={anom.previousDateLabel}
                          x2={anom.dateLabel}
                          fill="#f43f5e"
                          fillOpacity={0.12}
                          stroke="#f43f5e"
                          strokeOpacity={0.35}
                          strokeDasharray="3 3"
                        />
                      ))}

                    {/* Anomaly Detector: Spike Reference Lines & Top Callout Badges */}
                    {showAnomalyOverlay &&
                      activeHorizonAnomalies.map((anom) => (
                        <ReferenceLine
                          key={`anomaly-line-${anom.id}`}
                          yAxisId="left"
                          x={anom.dateLabel}
                          stroke="#f43f5e"
                          strokeDasharray="4 2"
                          strokeWidth={2}
                          strokeOpacity={selectedAnomaly?.id === anom.id ? 1 : 0.75}
                          label={(props: any) => renderAnomalyCalloutBadge(props, anom)}
                        />
                      ))}

                    {/* Anomaly Detector: Interactive Pulsing Warning Radar Beacons at Peak of Spikes */}
                    {showAnomalyOverlay &&
                      activeHorizonAnomalies.map((anom) => (
                        <ReferenceDot
                          key={`anomaly-dot-${anom.id}`}
                          yAxisId="left"
                          x={anom.dateLabel}
                          y={anom.newDeficient}
                          shape={(dotProps: any) => {
                            const { cx, cy } = dotProps;
                            if (typeof cx !== 'number' || typeof cy !== 'number' || isNaN(cx) || isNaN(cy)) return null;
                            const isSelected = selectedAnomaly?.id === anom.id;
                            return (
                              <g
                                className="cursor-pointer select-none"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedAnomaly(anom);
                                }}
                              >
                                {/* Expanding radar ping animation */}
                                <circle
                                  cx={cx}
                                  cy={cy}
                                  r={18}
                                  fill="none"
                                  stroke="#f43f5e"
                                  strokeWidth={1.5}
                                  opacity={0.6}
                                  className="animate-ping"
                                />

                                {/* Outer glow aura */}
                                <circle
                                  cx={cx}
                                  cy={cy}
                                  r={13}
                                  fill="#f43f5e"
                                  fillOpacity={isSelected ? 0.45 : 0.25}
                                  className="animate-pulse"
                                />

                                {/* Solid core badge */}
                                <circle
                                  cx={cx}
                                  cy={cy}
                                  r={7}
                                  fill="#e11d48"
                                  stroke="#ffffff"
                                  strokeWidth={2}
                                />

                                {/* Exclamation mark glyph */}
                                <text
                                  x={cx}
                                  y={cy + 3}
                                  textAnchor="middle"
                                  fill="#ffffff"
                                  fontSize={9}
                                  fontWeight={900}
                                  fontFamily="system-ui, sans-serif"
                                  style={{ pointerEvents: 'none' }}
                                >
                                  !
                                </text>
                              </g>
                            );
                          }}
                        />
                      ))}

                    {/* Milestone Event Reference Lines & SVG Callout Badges */}
                    {showMilestoneAnnotations &&
                      deficiencyTrendData.map((pt: any, idx: number) => {
                        if (!pt.eventAnnotation) return null;
                        if (selectedMilestoneCategory !== 'ALL' && pt.eventAnnotation.category !== selectedMilestoneCategory) {
                          return null;
                        }
                        const isSelected = selectedSnapshot?.period === pt.period;
                        const isHovered = hoveredMilestone?.point.period === pt.period;
                        return (
                          <ReferenceLine
                            key={`milestone-ann-${pt.period}`}
                            yAxisId="left"
                            x={pt.dateLabel}
                            stroke={isSelected || isHovered ? '#38bdf8' : pt.eventAnnotation.badgeColor}
                            strokeDasharray={isSelected || isHovered ? '2 2' : '3 3'}
                            strokeWidth={isSelected || isHovered ? 2 : 1}
                            strokeOpacity={isSelected || isHovered ? 0.95 : 0.4}
                            label={(props: any) => renderMilestoneAnnotationLabel(props, pt, idx)}
                          />
                        );
                      })}

                    {/* Milestone Event Interactive Data Dots with Category Accents & Direct Hover */}
                    {showMilestoneAnnotations &&
                      deficiencyTrendData.map((pt: any) => {
                        if (!pt.eventAnnotation) return null;
                        if (selectedMilestoneCategory !== 'ALL' && pt.eventAnnotation.category !== selectedMilestoneCategory) {
                          return null;
                        }
                        const isSelected = selectedSnapshot?.period === pt.period;
                        const isHovered = hoveredMilestone?.point.period === pt.period;
                        return (
                          <ReferenceDot
                            key={`milestone-dot-${pt.period}`}
                            yAxisId="left"
                            x={pt.dateLabel}
                            y={pt.deficient}
                            shape={(dotProps: any) => {
                              const { cx, cy } = dotProps;
                              if (typeof cx !== 'number' || typeof cy !== 'number' || isNaN(cx) || isNaN(cy)) return null;
                              return (
                                <g
                                  className="cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedSnapshotPeriod(pt.period);
                                  }}
                                  onMouseEnter={(e) => {
                                    const containerRect = chartContainerRef.current?.getBoundingClientRect();
                                    setHoveredMilestone({
                                      point: pt,
                                      x: containerRect ? e.clientX - containerRect.left : cx,
                                      y: containerRect ? e.clientY - containerRect.top : cy
                                    });
                                  }}
                                  onMouseMove={(e) => {
                                    const containerRect = chartContainerRef.current?.getBoundingClientRect();
                                    if (containerRect) {
                                      setHoveredMilestone({
                                        point: pt,
                                        x: e.clientX - containerRect.left,
                                        y: e.clientY - containerRect.top
                                      });
                                    }
                                  }}
                                  onMouseLeave={() => setHoveredMilestone(null)}
                                >
                                  {/* Invisible expanded hit target area */}
                                  <circle cx={cx} cy={cy} r={16} fill="transparent" />

                                  {/* Outer pulse halo when hovered or selected */}
                                  {(isHovered || isSelected) && (
                                    <circle
                                      cx={cx}
                                      cy={cy}
                                      r={14}
                                      fill={pt.eventAnnotation?.badgeColor || '#38bdf8'}
                                      fillOpacity={0.35}
                                      className="animate-pulse"
                                    />
                                  )}

                                  {/* Center dot core with category color */}
                                  <circle
                                    cx={cx}
                                    cy={cy}
                                    r={isHovered || isSelected ? 7 : 5}
                                    fill={pt.eventAnnotation?.badgeColor || '#38bdf8'}
                                    stroke={isHovered || isSelected ? '#ffffff' : '#0f172a'}
                                    strokeWidth={isHovered || isSelected ? 2.5 : 2}
                                  />
                                </g>
                              );
                            }}
                          />
                        );
                      })}

                    {/* Active Selected Snapshot Reference Guideline & Marker */}
                    {selectedSnapshot && (
                      <ReferenceLine
                        yAxisId="left"
                        x={selectedSnapshot.dateLabel}
                        stroke="#38bdf8"
                        strokeWidth={2}
                        strokeDasharray="3 3"
                        label={{
                          value: `Snapshot: ${selectedSnapshot.dateLabel}`,
                          fill: '#38bdf8',
                          fontSize: 10,
                          position: 'top'
                        }}
                      />
                    )}
                    {selectedSnapshot && (
                      <ReferenceDot
                        yAxisId="left"
                        x={selectedSnapshot.dateLabel}
                        y={selectedSnapshot.deficient}
                        r={7}
                        fill="#38bdf8"
                        stroke="#ffffff"
                        strokeWidth={2}
                      />
                    )}

                    {/* Clustered Bars for Side-by-Side Comparison: Actual Gap vs Projected Gap */}
                    {showSideBySideComparison && comparisonChartType === 'CLUSTERED_BARS' && (
                      <Bar
                        yAxisId="left"
                        dataKey="actualGap"
                        name="actualGap"
                        fill="#f43f5e"
                        fillOpacity={0.45}
                        stroke="#f43f5e"
                        strokeWidth={1.5}
                        radius={[4, 4, 0, 0]}
                        barSize={16}
                      />
                    )}
                    {showSideBySideComparison && comparisonChartType === 'CLUSTERED_BARS' && (
                      <Bar
                        yAxisId="left"
                        dataKey="projectedGap"
                        name="projectedGap"
                        fill="#0284c7"
                        fillOpacity={0.45}
                        stroke="#38bdf8"
                        strokeWidth={1.5}
                        radius={[4, 4, 0, 0]}
                        barSize={16}
                      />
                    )}

                    {/* Clustered Bars for Regulatory Velocity: Improvement Rate vs New Reqs Released */}
                    {showRegulatoryVelocity && (regulatoryVelocityMode === 'CLUSTERED_BARS' || regulatoryVelocityMode === 'COMBINED') && (
                      <Bar
                        yAxisId="left"
                        dataKey="improvementRate"
                        name="improvementRate"
                        fill="#06b6d4"
                        fillOpacity={0.55}
                        stroke="#22d3ee"
                        strokeWidth={1.5}
                        radius={[4, 4, 0, 0]}
                        barSize={14}
                        onClick={(entry: any) => {
                          if (entry?.period) {
                            setSelectedVelocityPeriod(entry.period);
                            setShowVelocityDetailsModal(true);
                          }
                        }}
                        cursor="pointer"
                      />
                    )}
                    {showRegulatoryVelocity && (regulatoryVelocityMode === 'CLUSTERED_BARS' || regulatoryVelocityMode === 'COMBINED') && (
                      <Bar
                        yAxisId="left"
                        dataKey="newRequirementsVolume"
                        name="newRequirementsVolume"
                        fill="#f59e0b"
                        fillOpacity={0.55}
                        stroke="#fbbf24"
                        strokeWidth={1.5}
                        radius={[4, 4, 0, 0]}
                        barSize={14}
                        onClick={(entry: any) => {
                          if (entry?.period) {
                            setSelectedVelocityPeriod(entry.period);
                            setShowVelocityDetailsModal(true);
                          }
                        }}
                        cursor="pointer"
                      />
                    )}

                    {/* Primary Line: Deficient Requirements (Burndown) - Interactive Dots */}
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="deficient"
                      name={showSideBySideComparison ? 'actualGap' : 'deficient'}
                      stroke="#f43f5e"
                      strokeWidth={showSideBySideComparison ? 3.5 : 3}
                      dot={(props: any) => {
                        const { cx, cy, payload } = props;
                        const isSelected = selectedSnapshot?.period === payload?.period;
                        const isHovered = hoveredMilestone?.point.period === payload?.period;
                        return (
                          <g
                            key={`dot-def-${payload?.period}`}
                            className="cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (payload?.period) {
                                setSelectedSnapshotPeriod(payload.period);
                              }
                            }}
                            onMouseEnter={(e) => {
                              if (showMilestoneAnnotations && payload?.eventAnnotation) {
                                const containerRect = chartContainerRef.current?.getBoundingClientRect();
                                setHoveredMilestone({
                                  point: payload,
                                  x: containerRect ? e.clientX - containerRect.left : cx,
                                  y: containerRect ? e.clientY - containerRect.top : cy
                                });
                              }
                            }}
                            onMouseMove={(e) => {
                              if (showMilestoneAnnotations && payload?.eventAnnotation) {
                                const containerRect = chartContainerRef.current?.getBoundingClientRect();
                                if (containerRect) {
                                  setHoveredMilestone({
                                    point: payload,
                                    x: e.clientX - containerRect.left,
                                    y: e.clientY - containerRect.top
                                  });
                                }
                              }
                            }}
                            onMouseLeave={() => {
                              if (hoveredMilestone?.point.period === payload?.period) {
                                setHoveredMilestone(null);
                              }
                            }}
                          >
                            {(isSelected || isHovered) && (
                              <circle
                                cx={cx}
                                cy={cy}
                                r={12}
                                fill={payload?.eventAnnotation?.badgeColor || '#38bdf8'}
                                fillOpacity={0.35}
                                className="animate-pulse"
                              />
                            )}
                            <circle
                              cx={cx}
                              cy={cy}
                              r={isSelected || isHovered ? 7 : 4.5}
                              fill={isSelected || isHovered ? (payload?.eventAnnotation?.badgeColor || '#38bdf8') : '#f43f5e'}
                              stroke={isSelected || isHovered ? '#ffffff' : '#0f172a'}
                              strokeWidth={isSelected || isHovered ? 2.5 : 2}
                            />

                            {/* Side-by-Side Comparison Variance Delta Tag on Dot */}
                            {showSideBySideComparison && payload?.gapVariance !== undefined && payload?.gapVariance !== null && !payload?.isLinearCompletionPoint && (
                              <g transform={`translate(${cx}, ${cy - 14})`} className="pointer-events-none select-none">
                                <rect
                                  x={-16}
                                  y={-8}
                                  width={32}
                                  height={13}
                                  rx={3}
                                  fill={payload.gapVariance < -0.2 ? '#064e3b' : payload.gapVariance > 0.2 ? '#881337' : '#0f172a'}
                                  stroke={payload.gapVariance < -0.2 ? '#10b981' : payload.gapVariance > 0.2 ? '#f43f5e' : '#38bdf8'}
                                  strokeWidth={0.8}
                                  fillOpacity={0.92}
                                />
                                <text
                                  x={0}
                                  y={0}
                                  textAnchor="middle"
                                  dominantBaseline="central"
                                  fontSize={8.5}
                                  fontFamily="monospace"
                                  fontWeight="bold"
                                  fill={payload.gapVariance < -0.2 ? '#6ee7b7' : payload.gapVariance > 0.2 ? '#fca5a5' : '#7dd3fc'}
                                >
                                  {payload.gapVariance > 0 ? `+${payload.gapVariance}` : payload.gapVariance}
                                </text>
                              </g>
                            )}
                          </g>
                        );
                      }}
                      activeDot={{ r: 8, fill: '#38bdf8', stroke: '#ffffff', strokeWidth: 2, cursor: 'pointer' }}
                    />

                    {/* Linear Regression Trend Line (Projected Deficiency Reduction) */}
                    {(showRegressionTrend || showSideBySideComparison) && (
                      <Line
                        yAxisId="left"
                        type="linear"
                        dataKey="regressionDeficient"
                        name={showSideBySideComparison ? 'projectedGap' : 'regressionDeficient'}
                        stroke="#38bdf8"
                        strokeWidth={showSideBySideComparison ? 3 : 2.5}
                        strokeDasharray={showSideBySideComparison ? '6 4' : '5 4'}
                        dot={(props: any) => {
                          const { cx, cy, payload } = props;
                          if (typeof cx !== 'number' || typeof cy !== 'number' || isNaN(cx) || isNaN(cy)) return null;
                          if (payload?.isLinearCompletionPoint) {
                            return null; // Handled by ReferenceDot with radar pulse
                          }
                          return (
                            <circle
                              key={`reg-dot-${payload?.period}`}
                              cx={cx}
                              cy={cy}
                              r={showSideBySideComparison ? 3.5 : 2.5}
                              fill="#38bdf8"
                              stroke="#0f172a"
                              strokeWidth={1.5}
                              opacity={0.9}
                            />
                          );
                        }}
                        activeDot={{ r: 6, fill: '#38bdf8', stroke: '#ffffff', strokeWidth: 2 }}
                        connectNulls={true}
                      />
                    )}

                    {/* AI-Driven Trend Projection Line */}
                    {showAiTrendProjection && (
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="aiProjectedDeficient"
                        name="aiProjectedDeficient"
                        stroke="#a855f7"
                        strokeWidth={3}
                        strokeDasharray="4 3"
                        dot={(props: any) => {
                          const { cx, cy, payload } = props;
                          if (typeof cx !== 'number' || typeof cy !== 'number' || isNaN(cx) || isNaN(cy)) return null;
                          if (payload?.isLinearCompletionPoint || payload?.isAiCompletionPoint) {
                            return null;
                          }
                          return (
                            <circle
                              key={`ai-dot-${payload?.period}`}
                              cx={cx}
                              cy={cy}
                              r={3.5}
                              fill="#a855f7"
                              stroke="#2e1065"
                              strokeWidth={1.5}
                              opacity={0.95}
                            />
                          );
                        }}
                        activeDot={{ r: 7, fill: '#c084fc', stroke: '#ffffff', strokeWidth: 2 }}
                        connectNulls={true}
                      />
                    )}

                    {/* Secondary Line: Pending Evidence Requirements */}
                    {showPendingInTrend && (
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="pendingEvidence"
                        name="pendingEvidence"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        dot={{ r: 3.5, fill: '#f59e0b' }}
                        activeDot={{ r: 5.5, fill: '#f59e0b' }}
                      />
                    )}

                    {/* Tertiary Line: Readiness Score % (Right Axis) */}
                    {showReadinessInTrend && (
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="overallReadiness"
                        name="overallReadiness"
                        stroke="#10b981"
                        strokeWidth={2.5}
                        dot={{ r: 3.5, fill: '#10b981' }}
                        activeDot={{ r: 6, fill: '#10b981' }}
                      />
                    )}

                    {/* Regulatory Velocity Net Spread Line (Spread between Improvement and Reqs Influx) */}
                    {showRegulatoryVelocity && (regulatoryVelocityMode === 'SPREAD_LINE' || regulatoryVelocityMode === 'COMBINED') && (
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="netVelocitySpread"
                        name="netVelocitySpread"
                        stroke="#eab308"
                        strokeWidth={2.5}
                        strokeDasharray="4 2"
                        dot={renderVelocitySpreadDot}
                        activeDot={{ r: 7, fill: '#facc15', stroke: '#ffffff', strokeWidth: 2 }}
                        connectNulls={true}
                      />
                    )}
                  </ComposedChart>
                </ResponsiveContainer>

                {/* Floating Interactive Milestone Tooltip Popover (Displays on Hovering Annotation Markers) */}
                {hoveredMilestone && hoveredMilestone.point.eventAnnotation && (() => {
                  const pt = hoveredMilestone.point;
                  const ann = pt.eventAnnotation!;
                  const containerWidth = chartContainerRef.current?.clientWidth || 800;
                  const tooltipWidth = 350;

                  // Smart horizontal positioning: prevent clipping on right and left edges
                  let left = hoveredMilestone.x + 16;
                  if (left + tooltipWidth > containerWidth - 12) {
                    left = Math.max(12, hoveredMilestone.x - tooltipWidth - 16);
                  }

                  // Smart vertical positioning: place above if cursor is in bottom half of chart
                  let top = hoveredMilestone.y - 12;
                  if (hoveredMilestone.y > 140) {
                    top = Math.max(8, hoveredMilestone.y - 230);
                  }

                  return (
                    <div
                      className="pointer-events-none absolute z-50 transition-all duration-75 ease-out shadow-2xl rounded-xl border border-slate-700/90 bg-slate-950/95 backdrop-blur-md p-4 text-xs space-y-3"
                      style={{
                        left: `${left}px`,
                        top: `${top}px`,
                        width: `${tooltipWidth}px`,
                        boxShadow: `0 20px 25px -5px rgba(0, 0, 0, 0.8), 0 8px 10px -6px rgba(0, 0, 0, 0.8), 0 0 16px 2px ${ann.badgeColor}38`
                      }}
                    >
                      {/* Header: Milestone Category, Title, Period & Full Cut-off Date */}
                      <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2.5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider"
                              style={{
                                backgroundColor: `${ann.badgeColor}25`,
                                color: ann.badgeColor,
                                border: `1px solid ${ann.badgeColor}50`
                              }}
                            >
                              <Award className="w-3 h-3" />
                              {ann.category}: {ann.eventTitle}
                            </span>
                            {pt.isCurrent && (
                              <span className="px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                Live State
                              </span>
                            )}
                            {pt.isProjected && (
                              <span className="px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                Target Projection
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                            {ann.eventSubtext || ann.eventTitle}
                          </h4>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-[11px] font-mono font-bold text-sky-300 flex items-center justify-end gap-1">
                            <Clock className="w-3 h-3 text-sky-400" />
                            {pt.period}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono flex items-center justify-end gap-1 mt-0.5">
                            <Calendar className="w-2.5 h-2.5 text-slate-500" />
                            {pt.timestamp}
                          </div>
                        </div>
                      </div>

                      {/* Impact & Requirement Reduction Callout */}
                      <div className="bg-slate-900/90 rounded-lg p-2.5 border border-slate-800/90 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1">
                            <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                            Requirement Reduction:
                          </span>
                          <span className="text-[11px] font-bold text-emerald-400 font-mono">
                            {ann.impactText}
                          </span>
                        </div>

                        {/* Snapshot Metrics at this Specific Milestone Date */}
                        <div className="grid grid-cols-4 gap-1.5 pt-1 border-t border-slate-800/70 text-center">
                          <div className="bg-rose-950/40 border border-rose-500/30 rounded px-1.5 py-1">
                            <span className="text-[9px] text-rose-300 block font-medium">Deficiencies</span>
                            <span className="text-xs font-bold text-rose-400 font-mono">{pt.deficient}</span>
                          </div>
                          <div className="bg-amber-950/40 border border-amber-500/30 rounded px-1.5 py-1">
                            <span className="text-[9px] text-amber-300 block font-medium">Pending</span>
                            <span className="text-xs font-bold text-amber-400 font-mono">{pt.pendingEvidence}</span>
                          </div>
                          <div className="bg-emerald-950/40 border border-emerald-500/30 rounded px-1.5 py-1">
                            <span className="text-[9px] text-emerald-300 block font-medium">Compliant</span>
                            <span className="text-xs font-bold text-emerald-400 font-mono">{pt.compliant}</span>
                          </div>
                          <div className="bg-sky-950/40 border border-sky-500/30 rounded px-1.5 py-1">
                            <span className="text-[9px] text-sky-300 block font-medium">Readiness</span>
                            <span className="text-xs font-bold text-sky-400 font-mono">{pt.overallReadiness}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Full Event Description & Detailed Context */}
                      <div className="space-y-1">
                        <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          Full Milestone Description:
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed font-normal bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/70">
                          {ann.detailedNotes || pt.snapshotDescription}
                        </p>
                      </div>

                      {/* Audit Stage & Historical Scope */}
                      {pt.auditStage && (
                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                          <span className="flex items-center gap-1 text-slate-400">
                            <Tag className="w-3 h-3 text-slate-500" />
                            Audit Stage: <strong className="text-slate-300 font-medium">{pt.auditStage}</strong>
                          </span>
                          <span className="text-amber-400/90 font-mono text-[9.5px]">
                            MAS Target: ≤ {pt.target} Gaps
                          </span>
                        </div>
                      )}

                      {/* Interactive Time-Travel Call to Action */}
                      <div className="pt-2 border-t border-slate-800 text-[10px] text-sky-400 flex items-center justify-between font-medium">
                        <span className="flex items-center gap-1">
                          <History className="w-3.5 h-3.5 text-sky-400" />
                          Click marker to filter EvidenceVault to this time
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 font-semibold">
                          Click to Inspect
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Key Event Annotations & Fluctuation Context Panel */}
              {showKeyEventAnnotations && (
                <div className="pt-2 border-t border-slate-800/80 mb-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 text-xs text-slate-300">
                      <Bookmark className="w-4 h-4 text-sky-400" />
                      <span className="font-semibold text-white">Key Event Annotations & Fluctuation Drivers:</span>
                      <span className="text-slate-400 hidden sm:inline text-[11px]">
                        Visual context explaining compliance drops, spikes, and milestones on the trend chart
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10.5px]">
                      <span className="flex items-center gap-1 text-sky-300">
                        <span className="w-2 h-2 rounded-full bg-sky-400 inline-block" />
                        Policy Updated
                      </span>
                      <span className="flex items-center gap-1 text-amber-300">
                        <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                        Audit Started
                      </span>
                      <span className="flex items-center gap-1 text-emerald-300">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                        Audit Passed
                      </span>
                      <span className="flex items-center gap-1 text-purple-300">
                        <span className="w-2 h-2 rounded-full bg-purple-400 inline-block" />
                        Vault/Tech
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
                    {deficiencyTrendData
                      .filter((p: any) => p.eventAnnotation)
                      .map((p: any) => {
                        const ann = p.eventAnnotation!;
                        const isSelected = selectedSnapshot?.period === p.period;
                        const isSpike = (ann.impactText || '').includes('+');
                        const isReduction = (ann.impactText || '').includes('-');
                        return (
                          <button
                            key={`ann-card-${p.period}`}
                            type="button"
                            onClick={() => setSelectedSnapshotPeriod(p.period)}
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                              isSelected
                                ? 'bg-slate-800 border-sky-400 shadow-md shadow-sky-950/40 ring-1 ring-sky-400'
                                : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-850'
                            }`}
                            title={`Click to focus chart on ${ann.eventTitle} (${p.dateLabel})`}
                          >
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span
                                className="px-1.5 py-0.5 rounded text-[9.5px] font-bold uppercase tracking-wider"
                                style={{
                                  backgroundColor: `${ann.badgeColor}22`,
                                  color: ann.badgeColor,
                                  border: `1px solid ${ann.badgeColor}44`
                                }}
                              >
                                {ann.eventTitle}
                              </span>
                              <span className="text-[10px] font-mono font-medium text-slate-400">{p.dateLabel}</span>
                            </div>
                            <div
                              className={`text-[10.5px] font-bold font-mono ${
                                isSpike
                                  ? 'text-rose-400'
                                  : isReduction
                                  ? 'text-emerald-400'
                                  : 'text-sky-300'
                              }`}
                            >
                              {ann.impactText}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate mt-0.5" title={ann.eventSubtext || ann.detailedNotes}>
                              {ann.eventSubtext || ann.detailedNotes}
                            </div>
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Interactive Timeline Milestone Bar & Scrubber */}
              <div className="pt-2 border-t border-slate-800/80">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-300">
                    <History className="w-4 h-4 text-sky-400" />
                    <span className="font-semibold text-white">Retrospective Timeline Scrubber:</span>
                    <span className="text-slate-400 hidden sm:inline text-[11px]">
                      Click any point or milestone to inspect the exact EvidenceVault requirements at that date
                    </span>
                  </div>
                  {selectedSnapshot && (
                    <button
                      onClick={() => setSelectedSnapshotPeriod(null)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 transition-colors flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset to Live State</span>
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
                  {chartTrendData.map((pt: any) => {
                    const isSelected = selectedSnapshot?.period === pt.period;
                    return (
                      <button
                        key={pt.period}
                        onClick={() => setSelectedSnapshotPeriod(pt.period)}
                        className={`p-2 rounded-xl border text-left transition-all cursor-pointer relative ${
                          isSelected
                            ? 'bg-sky-950/70 border-sky-500 shadow-md shadow-sky-500/25 ring-2 ring-sky-400/50'
                            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-[11px] font-bold ${isSelected ? 'text-sky-300' : 'text-slate-300'}`}>
                            {pt.dateLabel}
                          </span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
                              pt.isLinearCompletionPoint
                                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                                : pt.deficient > 6
                                ? 'bg-rose-500/20 text-rose-300'
                                : pt.deficient > 0
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-emerald-500/20 text-emerald-300'
                            }`}
                          >
                            {pt.isLinearCompletionPoint ? '0 gaps (Proj)' : `${pt.deficient} gaps`}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate mt-1" title={pt.milestone || pt.period}>
                          {pt.milestone || pt.period}
                        </div>
                        {pt.eventAnnotation && (
                          <div className="mt-1 flex items-center gap-1">
                            <span
                              className="px-1.5 py-0.2 rounded text-[8.5px] font-bold truncate max-w-full"
                              style={{
                                backgroundColor: `${pt.eventAnnotation.badgeColor}20`,
                                color: pt.eventAnnotation.badgeColor,
                                border: `1px solid ${pt.eventAnnotation.badgeColor}35`
                              }}
                              title={pt.eventAnnotation.eventSubtext || pt.eventAnnotation.eventTitle}
                            >
                              {pt.eventAnnotation.eventTitle}
                            </span>
                          </div>
                        )}
                        {pt.spikeAnomaly && (
                          <div className="mt-1">
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAnomaly(pt.spikeAnomaly);
                              }}
                              className="px-1.5 py-0.2 rounded text-[8.5px] font-bold bg-rose-950 text-rose-200 border border-rose-500/60 inline-flex items-center gap-1 hover:bg-rose-900 cursor-pointer transition-colors shadow-sm"
                              title={`Audit Anomaly Spike: +${pt.spikeAnomaly.gapIncrease} Gaps`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                              +{pt.spikeAnomaly.gapIncrease} Spike
                            </span>
                          </div>
                        )}
                        {showSideBySideComparison && pt.actualGap !== undefined && pt.projectedGap !== undefined && (
                          <div className="mt-1 pt-1 border-t border-indigo-900/40 flex items-center justify-between text-[8.5px] font-mono bg-indigo-950/30 -mx-1 px-1 rounded">
                            <span className="text-rose-400" title="Actual Gap">A:{pt.actualGap}</span>
                            <span className="text-sky-400" title="Projected Gap">P:{pt.projectedGap}</span>
                            <span
                              className={`px-1 rounded font-bold ${
                                pt.gapVariance < -0.2
                                  ? 'text-emerald-300 bg-emerald-500/20'
                                  : pt.gapVariance > 0.2
                                  ? 'text-rose-300 bg-rose-500/20'
                                  : 'text-slate-300 bg-slate-800'
                              }`}
                              title={`Variance: ${pt.gapVariance > 0 ? `+${pt.gapVariance}` : pt.gapVariance}`}
                            >
                              Δ {pt.gapVariance > 0 ? `+${pt.gapVariance}` : pt.gapVariance}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-800/60 text-[9px]">
                          <span className="text-slate-400">{pt.overallReadiness}% ready</span>
                          {pt.isCurrent ? (
                            <span className="text-emerald-400 font-bold">Live</span>
                          ) : pt.isLinearCompletionPoint ? (
                            <span className="text-sky-400 font-bold">Target 0</span>
                          ) : pt.isProjected ? (
                            <span className="text-purple-400 font-bold">Target</span>
                          ) : (
                            <span className="text-slate-400">Past</span>
                          )}
                        </div>
                        {isSelected && (
                          <div className="absolute -top-1.5 -right-1 w-3 h-3 bg-sky-400 rounded-full border-2 border-slate-900 shadow" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Retrospective Compliance & EvidenceVault Inspection Desk */}
              {selectedSnapshot && retrospectiveAnalysis ? (
                <div className="mt-4 bg-slate-900/90 border border-sky-500/40 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4 relative overflow-hidden backdrop-blur-md">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

                  {/* Header & Milestone Snapshot Overview */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 shrink-0">
                        <History className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-base font-bold text-white flex items-center gap-2">
                            <span>Retrospective EvidenceVault Audit:</span>
                            <span className="text-sky-300 font-mono">{selectedSnapshot.period}</span>
                          </h4>
                          <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            {selectedSnapshot.deficient} Deficiencies Active
                          </span>
                          <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {selectedSnapshot.pendingEvidence} Pending
                          </span>
                          <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {selectedSnapshot.overallReadiness}% Readiness
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1 max-w-3xl">
                          {selectedSnapshot.snapshotDescription ||
                            `Reconstructing the state of compliance and EvidenceVault artifacts as of ${selectedSnapshot.period} (${selectedSnapshot.timestamp}).`}
                        </p>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1.5 flex-wrap">
                          <span className="flex items-center gap-1 font-mono text-slate-300">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            Cut-off Date: {selectedSnapshot.timestamp}
                          </span>
                          {selectedSnapshot.milestone && (
                            <span className="flex items-center gap-1 text-amber-300 font-medium">
                              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                              Milestone: {selectedSnapshot.milestone}
                            </span>
                          )}
                        </div>
                        {selectedSnapshot.eventAnnotation && (
                          <div className="mt-2 flex items-center gap-2 flex-wrap">
                            <span
                              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold"
                              style={{
                                backgroundColor: `${selectedSnapshot.eventAnnotation.badgeColor}20`,
                                color: selectedSnapshot.eventAnnotation.badgeColor,
                                border: `1px solid ${selectedSnapshot.eventAnnotation.badgeColor}40`
                              }}
                            >
                              <Award className="w-3.5 h-3.5" />
                              Event: {selectedSnapshot.eventAnnotation.eventTitle}
                            </span>
                            <span className="text-xs font-semibold text-emerald-400">
                              {selectedSnapshot.eventAnnotation.impactText}
                            </span>
                            {selectedSnapshot.eventAnnotation.detailedNotes && (
                              <span className="text-xs text-slate-300">
                                — {selectedSnapshot.eventAnnotation.detailedNotes}
                              </span>
                            )}
                          </div>
                        )}
                        {selectedSnapshot.spikeAnomaly && (
                          <div className="mt-2.5 flex items-center justify-between gap-3 p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/40 shadow-sm flex-wrap">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/50">
                                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                                Audit Anomaly: +{selectedSnapshot.spikeAnomaly.gapIncrease} Deficiencies Incurred
                              </span>
                              <span className="text-xs text-rose-200">
                                {selectedSnapshot.spikeAnomaly.triggerEventTitle}
                              </span>
                            </div>
                            <button
                              onClick={() => setSelectedAnomaly(selectedSnapshot.spikeAnomaly)}
                              className="px-3 py-1 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer ml-auto"
                            >
                              <span>Inspect Audit Non-Conformities ({selectedSnapshot.spikeAnomaly.incurredRequirements.length})</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-start lg:self-center">
                      <button
                        onClick={() => handleOpenRetrospectiveEvidenceCentre(selectedSnapshot)}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white shadow-lg shadow-sky-600/20 transition-all flex items-center gap-2"
                      >
                        <FileCheck className="w-4 h-4" />
                        <span>Inspect in Full Evidence Centre</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setSelectedSnapshotPeriod(null)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors"
                        title="Close Retrospective View"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Summary Metric Ribbon for this Snapshot */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-slate-950/60 border border-rose-500/30 rounded-xl p-3">
                      <span className="text-[11px] uppercase tracking-wider font-bold text-rose-400 block">
                        Missing Required Proof
                      </span>
                      <div className="flex items-baseline gap-1.5 mt-1">
                        <span className="text-xl font-mono font-bold text-rose-300">
                          {retrospectiveAnalysis.summary.missingCount}
                        </span>
                        <span className="text-xs text-rose-400/80">artifacts missing</span>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        Direct cause of Deficient rating at this snapshot
                      </span>
                    </div>

                    <div className="bg-slate-950/60 border border-emerald-500/30 rounded-xl p-3">
                      <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-400 block">
                        Satisfied in Vault
                      </span>
                      <div className="flex items-baseline gap-1.5 mt-1">
                        <span className="text-xl font-mono font-bold text-emerald-300">
                          {retrospectiveAnalysis.summary.satisfiedCount}
                        </span>
                        <span className="text-xs text-emerald-400/80">verified before cut-off</span>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        Certified with cryptographic SHA-256 hash
                      </span>
                    </div>

                    <div className="bg-slate-950/60 border border-amber-500/30 rounded-xl p-3">
                      <span className="text-[11px] uppercase tracking-wider font-bold text-amber-400 block">
                        Subsequent Remediations
                      </span>
                      <div className="flex items-baseline gap-1.5 mt-1">
                        <span className="text-xl font-mono font-bold text-amber-300">
                          {retrospectiveAnalysis.summary.remediatedLaterCount}
                        </span>
                        <span className="text-xs text-amber-400/80">resolved in later sprints</span>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        Collected after {selectedSnapshot.dateLabel} to bridge gaps
                      </span>
                    </div>

                    <div className="bg-slate-950/60 border border-sky-500/30 rounded-xl p-3">
                      <span className="text-[11px] uppercase tracking-wider font-bold text-sky-400 block">
                        Total Framework Mandate
                      </span>
                      <div className="flex items-baseline gap-1.5 mt-1">
                        <span className="text-xl font-mono font-bold text-sky-300">
                          {retrospectiveAnalysis.summary.totalRequiredCount}
                        </span>
                        <span className="text-xs text-sky-400/80">MAS TRM requirements</span>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        Active regulatory scope for MAS TRM
                      </span>
                    </div>
                  </div>

                  {/* Filter Sub-Tabs and Search/Domain Controls */}
                  <div className="space-y-3 pt-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Tabs */}
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
                        <button
                          onClick={() => setRetrospectiveEvidenceTab('MISSING_GAPS')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                            retrospectiveEvidenceTab === 'MISSING_GAPS'
                              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                          }`}
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Missing Required Proof (Gaps)</span>
                          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-black/30">
                            {retrospectiveAnalysis.summary.missingCount}
                          </span>
                        </button>

                        <button
                          onClick={() => setRetrospectiveEvidenceTab('ALL_REQUIRED')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                            retrospectiveEvidenceTab === 'ALL_REQUIRED'
                              ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                          }`}
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>All Mandated Artifacts</span>
                          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-black/30">
                            {retrospectiveAnalysis.summary.totalRequiredCount}
                          </span>
                        </button>

                        <button
                          onClick={() => setRetrospectiveEvidenceTab('SATISFIED_VAULT')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                            retrospectiveEvidenceTab === 'SATISFIED_VAULT'
                              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Satisfied by {selectedSnapshot.dateLabel}</span>
                          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-black/30">
                            {retrospectiveAnalysis.summary.satisfiedCount}
                          </span>
                        </button>

                        <button
                          onClick={() => setRetrospectiveEvidenceTab('REMEDIATION_PATH')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                            retrospectiveEvidenceTab === 'REMEDIATION_PATH'
                              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                          }`}
                        >
                          <History className="w-3.5 h-3.5" />
                          <span>Subsequent Remediations</span>
                          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-black/30">
                            {retrospectiveAnalysis.summary.remediatedLaterCount}
                          </span>
                        </button>
                      </div>

                      {/* Search and Domain Filter */}
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            placeholder="Filter evidence or code..."
                            value={retrospectiveSearch}
                            onChange={(e) => setRetrospectiveSearch(e.target.value)}
                            className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 w-44 sm:w-56"
                          />
                          {retrospectiveSearch && (
                            <button
                              onClick={() => setRetrospectiveSearch('')}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                        <select
                          value={retrospectiveDomainFilter}
                          onChange={(e) => setRetrospectiveDomainFilter(e.target.value)}
                          aria-label="Filter by MAS Domain"
                          className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-sky-500"
                        >
                          <option value="ALL">All Domains</option>
                          <option value="1">Domain 1: IT Governance</option>
                          <option value="2">Domain 2: IT Risk Management</option>
                          <option value="3">Domain 3: IT Project & Change</option>
                          <option value="4">Domain 4: IT Service & Ops</option>
                          <option value="5">Domain 5: Third Party Risk</option>
                          <option value="8">Domain 8: Access Control & IAM</option>
                          <option value="9">Domain 9: Threat & Sec Ops</option>
                          <option value="11">Domain 11: Data Loss Prev</option>
                          <option value="12">Domain 12: Business Continuity</option>
                        </select>
                      </div>
                    </div>

                    {/* Filtered Evidence Table / Cards */}
                    <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1 scrollbar-thin">
                      {retrospectiveAnalysis.filteredItems.length === 0 ? (
                        <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-8 text-center space-y-2">
                          <FileQuestion className="w-8 h-8 text-slate-500 mx-auto" />
                          <p className="text-sm font-semibold text-slate-300">
                            No evidence artifacts matching active filters
                          </p>
                          <p className="text-xs text-slate-500">
                            Try resetting search query or selecting a different tab above.
                          </p>
                        </div>
                      ) : (
                        retrospectiveAnalysis.filteredItems.map((item) => {
                          const req = enrichedRequirements.find((r) => r.requirementCode === item.requirementCode);
                          const isMissing = item.retrospectiveStatus === 'MISSING_AT_SNAPSHOT';
                          const isSatisfied = item.retrospectiveStatus === 'SATISFIED_IN_VAULT';
                          const isRemediatedLater = item.retrospectiveStatus === 'REMEDIATED_LATER';

                          return (
                            <div
                              key={item.id}
                              className={`p-3.5 rounded-xl border transition-all ${
                                isMissing
                                  ? 'bg-rose-950/20 border-rose-500/30 hover:border-rose-500/50'
                                  : isSatisfied
                                  ? 'bg-slate-950/40 border-slate-800/90 hover:border-slate-700'
                                  : 'bg-amber-950/20 border-amber-500/30 hover:border-amber-500/50'
                              }`}
                            >
                              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                                <div className="space-y-1.5 min-w-0 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-800 text-sky-300 border border-slate-700">
                                      {item.requirementCode}
                                    </span>
                                    <span className="text-xs font-semibold text-slate-300 truncate">
                                      {item.requirementTitle}
                                    </span>
                                    <span className="text-[11px] text-slate-400">
                                      (Domain {item.domainNumber}: {item.domainName})
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2 text-xs font-medium text-white">
                                    <FileText className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                                    <span className="font-semibold">{item.evidenceTitle}</span>
                                    <span className="text-slate-400 font-mono text-[11px]">
                                      [{item.suggestedFileName}]
                                    </span>
                                  </div>

                                  {item.deficiencyReason && (
                                    <p className="text-xs text-rose-300/90 bg-rose-500/10 border border-rose-500/20 rounded-lg p-2 mt-1">
                                      <span className="font-semibold text-rose-200">Historical Gap Context: </span>
                                      {item.deficiencyReason}
                                    </p>
                                  )}

                                  <div className="flex items-center gap-2 flex-wrap pt-1 text-[10px]">
                                    <span className="text-slate-400">Department: <strong className="text-slate-200">{item.department}</strong></span>
                                    <span className="text-slate-600">•</span>
                                    <span className="text-slate-400">Risk Tier: </span>
                                    <span
                                      className={`px-1.5 py-0.2 rounded font-semibold ${
                                        item.riskTier === 'HIGH_RISK'
                                          ? 'bg-rose-500/20 text-rose-300'
                                          : item.riskTier === 'MEDIUM_RISK'
                                          ? 'bg-amber-500/20 text-amber-300'
                                          : 'bg-emerald-500/20 text-emerald-300'
                                      }`}
                                    >
                                      {item.riskTier}
                                    </span>

                                    {item.uploadedDate && (
                                      <>
                                        <span className="text-slate-600">•</span>
                                        <span className="text-slate-400 font-mono">
                                          Uploaded: {item.uploadedDate.slice(0, 10)}
                                        </span>
                                      </>
                                    )}

                                    {item.auditHash && (
                                      <>
                                        <span className="text-slate-600">•</span>
                                        <span className="text-slate-400 font-mono flex items-center gap-1">
                                          <Hash className="w-2.5 h-2.5 text-slate-400" />
                                          {item.auditHash.slice(0, 12)}...
                                        </span>
                                      </>
                                    )}
                                  </div>

                                  {/* Mandatory Keywords / Safeguards */}
                                  {item.mandatorySafeguards && item.mandatorySafeguards.length > 0 && (
                                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                                      <span className="text-[10px] text-slate-400 font-medium">Mandated Criteria:</span>
                                      {item.mandatorySafeguards.map((kw, i) => (
                                        <span
                                          key={i}
                                          className="px-1.5 py-0.2 rounded text-[10px] bg-slate-800/80 text-slate-300 border border-slate-700/80"
                                        >
                                          {kw}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* Status Badge & Actions */}
                                <div className="flex flex-col items-end gap-2 shrink-0">
                                  {isMissing && (
                                    <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5">
                                      <AlertTriangle className="w-3.5 h-3.5" />
                                      <span>Missing at {selectedSnapshot.dateLabel}</span>
                                    </span>
                                  )}
                                  {isSatisfied && (
                                    <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      <span>Verified by {selectedSnapshot.dateLabel}</span>
                                    </span>
                                  )}
                                  {isRemediatedLater && (
                                    <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                                      <History className="w-3.5 h-3.5" />
                                      <span>Resolved Post-{selectedSnapshot.dateLabel}</span>
                                    </span>
                                  )}

                                  <div className="flex items-center gap-1.5 mt-1">
                                    {req && (
                                      <button
                                        onClick={() => {
                                          setSelectedRequirement(req);
                                          setDrillDownTab('REQUIREMENT_DETAILS');
                                        }}
                                        className="px-2.5 py-1 rounded text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                                      >
                                        Inspect MAS Req
                                      </button>
                                    )}

                                    {item.canBridgeNow && (
                                      <button
                                        onClick={() => {
                                          const rec = recommendationsMap[item.requirementCode];
                                          if (rec?.topMatch) {
                                            handleQuickLinkEvidence(item.requirementCode, rec.topMatch);
                                          }
                                        }}
                                        className="px-2.5 py-1 rounded text-[11px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 transition-all shadow-sm"
                                      >
                                        <Zap className="w-3 h-3 text-amber-300" />
                                        <span>Bridge Now</span>
                                      </button>
                                    )}

                                    <button
                                      onClick={() => {
                                        if (req) {
                                          handleDrillDownToEvidenceVault(req);
                                        }
                                      }}
                                      className="px-2.5 py-1 rounded text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 transition-colors flex items-center gap-1"
                                    >
                                      <span>Evidence Vault</span>
                                      <ArrowUpRight className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* Hint card when no point is selected */
                <div className="bg-slate-900/50 border border-slate-800/90 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 shrink-0">
                      <History className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">
                        Interactive Retrospective Time Travel Available
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Click on any point or milestone along the Deficient Requirements Burndown chart above to filter the EvidenceVault to exactly what was required at that specific time.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-slate-400 font-medium">Quick Jump:</span>
                    <button
                      onClick={() => setSelectedSnapshotPeriod('Oct 2025')}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 transition-colors"
                    >
                      Oct &apos;25 (Sprint)
                    </button>
                    <button
                      onClick={() => setSelectedSnapshotPeriod('Dec 2025')}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 transition-colors"
                    >
                      Dec &apos;25 (Vault Launch)
                    </button>
                    <button
                      onClick={() => setSelectedSnapshotPeriod('Feb 2026')}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 transition-colors"
                    >
                      Feb &apos;26 (Pre-Audit)
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Divider between charts if in COMBINED mode */}
          {chartDisplayMode === 'COMBINED' && (
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-sky-400" />
                <span>Domain Readiness vs. Open Non-Conformities Breakdown</span>
              </h4>
              <div className="flex items-center gap-2 text-xs">
                <span className="flex items-center gap-1 text-slate-400">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block" /> &ge; 80%
                </span>
                <span className="flex items-center gap-1 text-slate-400">
                  <span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block" /> 60-79%
                </span>
                <span className="flex items-center gap-1 text-slate-400">
                  <span className="w-2.5 h-2.5 rounded bg-rose-500 inline-block" /> &lt; 60%
                </span>
              </div>
            </div>
          )}

          {/* View 2: Dual-Axis ComposedChart for Domain Readiness */}
          {(chartDisplayMode === 'DOMAIN_OVERLAY' || chartDisplayMode === 'COMBINED') && (
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={domainOverlayChartData}
                  margin={{ top: 10, right: 30, left: -10, bottom: 25 }}
                  onClick={(e: any) => {
                    if (e && e.activePayload && e.activePayload.length > 0) {
                      const data = e.activePayload[0].payload;
                      if (data?.domainNumber) {
                        setSelectedDomain(data.domainNumber);
                      }
                    }
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="label"
                    stroke="#94a3b8"
                    fontSize={11}
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="left"
                    stroke="#94a3b8"
                    fontSize={11}
                    domain={[0, 100]}
                    tickFormatter={(v) => `${v}%`}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#f43f5e"
                    fontSize={11}
                    domain={[0, 'dataMax + 2']}
                    tickLine={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 shadow-xl text-xs space-y-1.5 max-w-xs">
                            <p className="font-bold text-white border-b border-slate-800 pb-1">
                              Domain {data.domainNumber}: {data.fullName}
                            </p>
                            <div className="flex justify-between text-slate-300">
                              <span>Readiness Score:</span>
                              <span className="font-mono font-bold text-emerald-400">{data.readinessScore}%</span>
                            </div>
                            <div className="flex justify-between text-slate-300">
                              <span>Open Findings:</span>
                              <span className="font-mono font-bold text-rose-400">{data.openFindings}</span>
                            </div>
                            {data.majorFindings > 0 && (
                              <div className="flex justify-between text-rose-400 font-semibold">
                                <span>Major Non-Conformities:</span>
                                <span className="font-mono">{data.majorFindings}</span>
                              </div>
                            )}
                            <div className="flex justify-between text-slate-300">
                              <span>High Risk Requirements:</span>
                              <span className="font-mono font-semibold text-amber-300">{data.highRiskReqs}</span>
                            </div>
                            <p className="text-[10px] text-sky-400 pt-1 border-t border-slate-800">
                              Click bar to filter requirements list below &rarr;
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    height={30}
                    formatter={(value) => (
                      <span className="text-xs text-slate-300">
                        {value === 'readinessScore' ? 'Readiness Score (%)' : 'Open Findings (Count)'}
                      </span>
                    )}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="readinessScore"
                    name="readinessScore"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                  >
                    {domainOverlayChartData.map((entry, index) => {
                      let fill = '#10b981'; // emerald
                      if (entry.readinessScore < 60 || entry.majorFindings > 0) fill = '#f43f5e'; // rose
                      else if (entry.readinessScore < 80) fill = '#f59e0b'; // amber
                      return <Cell key={`cell-${index}`} fill={fill} cursor="pointer" />;
                    })}
                  </Bar>
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="openFindings"
                    name="openFindings"
                    stroke="#fb7185"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#f43f5e', stroke: '#ffffff', strokeWidth: 1.5 }}
                    activeDot={{ r: 6, fill: '#f43f5e' }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Synchronized Audit Records, Policy Versions & Evidence Ledger Table */}
        <ComplianceAuditDataTable
          selectedSnapshot={selectedSnapshot}
          onResetSnapshot={() => setSelectedSnapshotPeriod(null)}
          timeHorizon={trendTimeHorizon}
          filteredRequirements={filteredRequirements}
          allEnrichedRequirements={enrichedRequirements}
          selectedDomain={selectedDomain}
          onSelectDomain={setSelectedDomain}
          riskFilter={riskFilter}
          onSelectRiskFilter={setRiskFilter}
          statusFilter={statusFilter}
          onSelectStatusFilter={setStatusFilter}
          parentSearchQuery={searchQuery}
          onSelectRequirement={(req) => {
            setSelectedRequirement(req);
            setDrillDownTab('REQUIREMENT_DETAILS');
            const el = document.getElementById('requirement-drilldown-panel');
            if (el) {
              el.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          generatedDocs={generatedDocs}
          evidence={evidence}
        />

        {/* Filter & Control Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Filter:
              </span>
              <button
                onClick={() => setRiskFilter('HIGH_RISK_ONLY')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  riskFilter === 'HIGH_RISK_ONLY'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                High Risk Only ({metrics.highRiskCount})
              </button>

              <button
                onClick={() => setRiskFilter('OPEN_FINDINGS_ONLY')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  riskFilter === 'OPEN_FINDINGS_ONLY'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <AlertOctagon className="w-3.5 h-3.5 text-amber-300" />
                With Open Findings ({metrics.totalOpenFindings})
              </button>

              <button
                onClick={() => setRiskFilter('CRITICAL_SYSTEMS')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  riskFilter === 'CRITICAL_SYSTEMS'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Server className="w-3.5 h-3.5 text-sky-300" />
                Critical Systems Mandate
              </button>

              <button
                onClick={() => setRiskFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  riskFilter === 'ALL'
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                Show All ({metrics.total})
              </button>
            </div>

            {/* Domain Dropdown & Search */}
            <div className="flex items-center gap-2">
              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-rose-500"
              >
                <option value="ALL">All 15 TRM Domains</option>
                {domainOverlayChartData.map((d) => (
                  <option key={d.domainNumber} value={d.domainNumber}>
                    Dom {d.domainNumber}: {d.fullName.length > 28 ? d.fullName.slice(0, 28) + '...' : d.fullName}
                  </option>
                ))}
              </select>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search requirement, finding, evidence..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg pl-8 pr-3 py-1.5 w-52 sm:w-64 focus:outline-none focus:ring-1 focus:ring-rose-500 placeholder-slate-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Status Filter Row */}
            <div className="flex flex-wrap items-center gap-2 pt-2.5 border-t border-slate-800/80">
              <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
                Status Filter:
              </span>
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  statusFilter === 'ALL'
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                All Statuses ({metrics.total})
              </button>
              <button
                onClick={() => setStatusFilter('Compliant')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  statusFilter === 'Compliant'
                    ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400'
                    : 'bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/20'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Compliant ({metrics.compliantCount})
              </button>
              <button
                onClick={() => setStatusFilter('Under Review')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  statusFilter === 'Under Review'
                    ? 'bg-sky-600 text-white shadow-sm ring-1 ring-sky-400'
                    : 'bg-sky-500/10 text-sky-300 hover:bg-sky-500/20 border border-sky-500/20'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                Under Review ({metrics.underReviewCount})
              </button>
              <button
                onClick={() => setStatusFilter('Pending Evidence')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  statusFilter === 'Pending Evidence'
                    ? 'bg-amber-600 text-white shadow-sm ring-1 ring-amber-400'
                    : 'bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/20'
                }`}
              >
                <FileQuestion className="w-3.5 h-3.5 text-amber-400" />
                Pending Evidence ({metrics.pendingEvidenceCount})
              </button>
              <button
                onClick={() => setStatusFilter('Deficient')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  statusFilter === 'Deficient'
                    ? 'bg-rose-600 text-white shadow-sm ring-1 ring-rose-400'
                    : 'bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border border-rose-500/20'
                }`}
              >
                <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
                Deficient ({metrics.deficientCount})
              </button>
            </div>

          </div>

          {/* Active Filter Notification */}
          {(selectedDomain !== 'ALL' || riskFilter !== 'ALL' || statusFilter !== 'ALL' || searchQuery) && (
            <div className="flex items-center justify-between text-xs bg-slate-800/60 rounded-lg px-3 py-1.5 border border-slate-700/50">
              <span className="text-slate-300 flex items-center gap-1.5 flex-wrap">
                <span>Showing <strong>{filteredRequirements.length}</strong> matching requirements</span>
                {selectedDomain !== 'ALL' && <span className="text-rose-400">&bull; Domain {selectedDomain}</span>}
                {riskFilter !== 'ALL' && <span className="text-amber-400">&bull; {riskFilter.replace(/_/g, ' ')}</span>}
                {statusFilter !== 'ALL' && <span className="text-sky-400">&bull; Status: {statusFilter}</span>}
              </span>
              <button
                onClick={() => {
                  setSelectedDomain('ALL');
                  setRiskFilter('ALL');
                  setStatusFilter('ALL');
                  setSearchQuery('');
                }}
                className="text-rose-400 hover:text-rose-300 font-medium"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Requirements Grid & Interactive Drill-Down Matrix */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>MAS Requirements & Findings Overlay Matrix</span>
                <span className="text-[11px] text-slate-400 font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                  {filteredRequirements.length} requirements
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Click any requirement's <strong>Expand Drilldown</strong> button to inspect linked Evidence Vault artifacts, Audit Findings, and CAPA records.
              </p>
            </div>

            {/* Matrix Controls: Expand All & Layout Switcher */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={
                  filteredRequirements.length > 0 &&
                  filteredRequirements.every((r) => expandedReqCodes.has(r.requirementCode))
                    ? collapseAllRequirements
                    : expandAllRequirements
                }
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                {filteredRequirements.length > 0 &&
                filteredRequirements.every((r) => expandedReqCodes.has(r.requirementCode)) ? (
                  <>
                    <ChevronUp className="w-3.5 h-3.5 text-rose-400" />
                    <span>Collapse All</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Expand All ({filteredRequirements.length})</span>
                  </>
                )}
              </button>

              <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg p-0.5">
                <button
                  onClick={() => setViewLayout('GRID')}
                  className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    viewLayout === 'GRID'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Card Matrix View"
                >
                  <Grid className="w-3.5 h-3.5" />
                  <span>Cards</span>
                </button>
                <button
                  onClick={() => setViewLayout('TABLE')}
                  className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    viewLayout === 'TABLE'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Detailed Table View"
                >
                  <List className="w-3.5 h-3.5" />
                  <span>Table</span>
                </button>
              </div>
            </div>
          </div>

          {filteredRequirements.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center space-y-3">
              <FolderCheck className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm text-slate-300 font-semibold">No requirements match the selected filters</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try switching the risk filter to "Show All" or clearing search terms to inspect the full regulatory scope.
              </p>
              <button
                onClick={() => {
                  setSelectedDomain('ALL');
                  setRiskFilter('ALL');
                  setStatusFilter('ALL');
                  setSearchQuery('');
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg"
              >
                Reset Filters
              </button>
            </div>
          ) : viewLayout === 'GRID' ? (
            /* =============================================================== */
            /* CARDS VIEW WITH IN-PLACE DRILLDOWN EXPANSION                    */
            /* =============================================================== */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRequirements.map((req) => {
                const isSelected = selectedRequirement?.requirementCode === req.requirementCode;
                const isExpanded = expandedReqCodes.has(req.requirementCode);
                const isHighRisk = req.riskTier === 'HIGH_RISK';
                const isMediumRisk = req.riskTier === 'MEDIUM_RISK';
                const reqRecommendation = recommendationsMap.get(req.requirementCode);

                return (
                  <div
                    key={req.id}
                    className={`rounded-xl p-4 transition-all relative border ${
                      isExpanded
                        ? 'col-span-1 md:col-span-2 lg:col-span-3 bg-slate-900 border-rose-500/80 ring-2 ring-rose-500/30 shadow-2xl'
                        : isSelected
                        ? 'bg-slate-800/90 border-rose-500 ring-2 ring-rose-500/40 shadow-lg'
                        : isHighRisk
                        ? 'bg-slate-900 border-rose-500/30 hover:border-rose-500/60 shadow-sm'
                        : isMediumRisk
                        ? 'bg-slate-900 border-amber-500/30 hover:border-amber-500/60 shadow-sm'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Top Row: Code, Status Badge & Risk Badge */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-xs font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                          {req.requirementCode}
                        </span>
                        {req.criticalSystemsMandate && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30 flex items-center gap-1">
                            <Server className="w-2.5 h-2.5" />
                            CIS
                          </span>
                        )}
                        <ComplianceStatusBadge status={req.complianceStatusBadge} size="sm" />
                      </div>

                      {/* Risk Tier Badge */}
                      {isHighRisk ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1 shrink-0">
                          <Flame className="w-3 h-3 text-rose-400" />
                          HIGH RISK
                        </span>
                      ) : isMediumRisk ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
                          MEDIUM RISK
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 shrink-0">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          LOW RISK
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h4
                      onClick={() => setSelectedRequirement(req)}
                      className="text-sm font-semibold text-slate-100 hover:text-white cursor-pointer line-clamp-2 mb-1.5 transition-colors"
                    >
                      {req.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mb-3">
                      {req.domainName}
                    </p>

                    {/* Readiness Score Progress Bar */}
                    <div className="space-y-1 mb-3">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">Readiness Score</span>
                        <span className={`font-mono font-bold ${
                          req.readinessScore >= 80 ? 'text-emerald-400' : req.readinessScore >= 60 ? 'text-amber-400' : 'text-rose-400'
                        }`}>
                          {req.readinessScore}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            req.readinessScore >= 80 ? 'bg-emerald-500' : req.readinessScore >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${req.readinessScore}%` }}
                        />
                      </div>
                    </div>

                    {/* Automated Evidence Vault Recommendation Callout */}
                    {reqRecommendation && (
                      <div className="mb-3 p-2.5 rounded-lg bg-indigo-950/50 border border-indigo-500/30 text-xs space-y-1.5 shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1 font-semibold text-indigo-300 text-[11px]">
                            <Sparkles className="w-3 h-3 text-amber-300" />
                            <span>Vault Bridge Recommendation</span>
                          </span>
                          {reqRecommendation.topMatch ? (
                            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-500/30">
                              {reqRecommendation.topMatch.confidenceScore}% Match &bull; +{reqRecommendation.topMatch.projectedReadinessUplift}%
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono text-purple-300 bg-purple-950/60 px-1.5 py-0.2 rounded border border-purple-500/30">
                              Template Ready
                            </span>
                          )}
                        </div>

                        {reqRecommendation.topMatch ? (
                          <div className="flex items-center justify-between gap-2 pt-0.5">
                            <span className="text-slate-200 text-[11px] truncate font-medium" title={reqRecommendation.topMatch.evidence.title}>
                              {reqRecommendation.topMatch.evidence.title}
                            </span>
                            {reqRecommendation.topMatch.recommendedAction === 'LINK_EXISTING_EVIDENCE' ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuickLinkEvidence(req.requirementCode, reqRecommendation.topMatch!);
                                }}
                                disabled={linkingEvidenceId === reqRecommendation.topMatch.evidence.id}
                                className="px-2 py-0.5 rounded text-[10px] font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white flex items-center gap-1 shrink-0 transition-all shadow-sm cursor-pointer disabled:opacity-50"
                              >
                                <Zap className={`w-2.5 h-2.5 ${linkingEvidenceId === reqRecommendation.topMatch.evidence.id ? 'animate-spin' : 'text-amber-300'}`} />
                                <span>{linkingEvidenceId === reqRecommendation.topMatch.evidence.id ? 'Linking...' : 'Bridge Gap'}</span>
                              </button>
                            ) : reqRecommendation.topMatch.recommendedAction === 'ALREADY_LINKED' ? (
                              <span className="text-[10px] text-emerald-400 font-medium shrink-0 flex items-center gap-0.5">
                                <CheckCircle2 className="w-2.5 h-2.5" /> Linked
                              </span>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDrillDownToEvidenceVault(req);
                                }}
                                className="text-[10px] text-amber-400 hover:text-amber-300 font-medium shrink-0"
                              >
                                Verify in Vault
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-2 pt-0.5">
                            <span className="text-slate-300 text-[11px] truncate" title={reqRecommendation.prescribedTemplate.title}>
                              {reqRecommendation.prescribedTemplate.title}
                            </span>
                            <span className="text-[10px] text-purple-300 font-mono font-semibold shrink-0">
                              +{reqRecommendation.prescribedTemplate.potentialReadinessUplift}%
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Open Findings Overlay Pill */}
                    <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                      {req.openFindings.length > 0 ? (
                        <div className="flex items-center gap-1.5 text-rose-400 font-semibold">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          <span>{req.openFindings.length} Open Finding{req.openFindings.length > 1 ? 's' : ''}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-slate-400">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>No Open Findings</span>
                        </div>
                      )}

                      {/* Evidence Count */}
                      <div className="flex items-center gap-1 text-slate-400">
                        <FolderCheck className="w-3.5 h-3.5 text-sky-400" />
                        <span>{req.associatedEvidence.length} in Vault</span>
                      </div>
                    </div>

                    {/* Interactive Drill-down prompt footer with Expansion Toggle */}
                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={(e) => toggleRequirementExpansion(req.requirementCode, e)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 ${
                          isExpanded
                            ? 'bg-rose-600 text-white border-rose-500 shadow-md'
                            : 'bg-slate-800 hover:bg-slate-700 text-rose-300 border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-3.5 h-3.5" />
                            <span>Collapse Drilldown</span>
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3.5 h-3.5 text-rose-400" />
                            <span>Expand Drilldown ({req.associatedEvidence.length} Evid &bull; {req.openFindings.length} Fnd)</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedRequirement(req)}
                        className="text-xs text-slate-400 hover:text-white font-medium flex items-center gap-1 py-1 px-1.5 rounded hover:bg-slate-800 transition-colors"
                        title="Open Full Detail Panel below"
                      >
                        <span>Full Inspector</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    {/* In-Place Interactive Drilldown View */}
                    {isExpanded && (
                      <div className="mt-4 pt-3 border-t border-slate-800">
                        <MASRequirementDrilldownView
                          requirement={req}
                          onOpenEvidenceVault={handleDrillDownToEvidenceVault}
                          onUploadProof={(r) => {
                            setSelectedRequirement(r);
                            setUploadProofModalOpen(true);
                          }}
                          onNavigateToFindingCAPA={(findingCode) => {
                            setFindingFilterQuery(findingCode);
                            setActiveModule('findings_capa');
                          }}
                          onCopyHash={handleCopyHash}
                          copiedHash={copiedHash}
                          unifiedRemediations={INITIAL_UNIFIED_REMEDIATIONS}
                          allFindings={findings}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* =============================================================== */
            /* DETAILED TABLE VIEW WITH ACCORDION ROW DRILLDOWNS               */
            /* =============================================================== */
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-800/80 border-b border-slate-700/80 text-slate-400 uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-3 w-10 text-center">Expand</th>
                      <th className="py-3 px-3">Req Code</th>
                      <th className="py-3 px-4">Title & Domain</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3">Readiness</th>
                      <th className="py-3 px-3">Risk Tier</th>
                      <th className="py-3 px-3">Vault Items</th>
                      <th className="py-3 px-3">Findings</th>
                      <th className="py-3 px-3">AI Vault Match</th>
                      <th className="py-3 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredRequirements.map((req) => {
                      const isExpanded = expandedReqCodes.has(req.requirementCode);
                      const isSelected = selectedRequirement?.requirementCode === req.requirementCode;
                      const isHighRisk = req.riskTier === 'HIGH_RISK';
                      const isMediumRisk = req.riskTier === 'MEDIUM_RISK';

                      return (
                        <React.Fragment key={req.id}>
                          <tr
                            className={`transition-colors ${
                              isExpanded
                                ? 'bg-slate-800/60'
                                : isSelected
                                ? 'bg-slate-800/40'
                                : 'hover:bg-slate-800/30'
                            }`}
                          >
                            {/* Expand Chevron Toggle */}
                            <td className="py-3 px-3 text-center">
                              <button
                                onClick={(e) => toggleRequirementExpansion(req.requirementCode, e)}
                                className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                                title={isExpanded ? 'Collapse Drilldown' : 'Expand Drilldown'}
                              >
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4 text-rose-400" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-slate-400" />
                                )}
                              </button>
                            </td>

                            {/* Req Code */}
                            <td className="py-3 px-3 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-xs font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                                  {req.requirementCode}
                                </span>
                                {req.criticalSystemsMandate && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                                    CIS
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Title & Domain */}
                            <td className="py-3 px-4">
                              <div
                                onClick={() => setSelectedRequirement(req)}
                                className="cursor-pointer font-semibold text-slate-200 hover:text-white line-clamp-1"
                              >
                                {req.title}
                              </div>
                              <div className="text-[11px] text-slate-400 line-clamp-1">
                                Domain {req.domainNumber}: {req.domainName}
                              </div>
                            </td>

                            {/* Compliance Status Badge */}
                            <td className="py-3 px-3 whitespace-nowrap">
                              <ComplianceStatusBadge status={req.complianceStatusBadge} size="sm" />
                            </td>

                            {/* Readiness */}
                            <td className="py-3 px-3 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      req.readinessScore >= 80 ? 'bg-emerald-500' : req.readinessScore >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                                    }`}
                                    style={{ width: `${req.readinessScore}%` }}
                                  />
                                </div>
                                <span className={`font-mono font-bold ${
                                  req.readinessScore >= 80 ? 'text-emerald-400' : req.readinessScore >= 60 ? 'text-amber-400' : 'text-rose-400'
                                }`}>
                                  {req.readinessScore}%
                                </span>
                              </div>
                            </td>

                            {/* Risk Tier */}
                            <td className="py-3 px-3 whitespace-nowrap">
                              {isHighRisk ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1 w-fit">
                                  <Flame className="w-3 h-3 text-rose-400" />
                                  HIGH
                                </span>
                              ) : isMediumRisk ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 w-fit">
                                  MEDIUM
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 w-fit">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                  LOW
                                </span>
                              )}
                            </td>

                            {/* Evidence Vault items */}
                            <td className="py-3 px-3 whitespace-nowrap">
                              <button
                                onClick={() => handleDrillDownToEvidenceVault(req)}
                                className="inline-flex items-center gap-1 text-slate-300 hover:text-emerald-300 font-mono text-xs transition-colors"
                              >
                                <FolderCheck className="w-3.5 h-3.5 text-emerald-400" />
                                <span>{req.associatedEvidence.length} items</span>
                              </button>
                            </td>

                            {/* Findings */}
                            <td className="py-3 px-3 whitespace-nowrap">
                              {req.openFindings.length > 0 ? (
                                <span className="inline-flex items-center gap-1 text-rose-400 font-semibold font-mono text-xs">
                                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                                  <span>{req.openFindings.length} Open</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-slate-400 text-xs">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>Clean</span>
                                </span>
                              )}
                            </td>

                            {/* AI Vault Recommendation */}
                            <td className="py-3 px-3 whitespace-nowrap">
                              {(() => {
                                const rec = recommendationsMap.get(req.requirementCode);
                                if (!rec) {
                                  return (
                                    <span className="text-[11px] text-slate-500 font-mono">
                                      Compliant
                                    </span>
                                  );
                                }
                                if (rec.topMatch) {
                                  return (
                                    <div className="flex items-center gap-1.5">
                                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold font-mono bg-indigo-950/80 text-indigo-300 border border-indigo-500/30">
                                        {rec.topMatch.confidenceScore}% Match
                                      </span>
                                      {rec.topMatch.recommendedAction === 'LINK_EXISTING_EVIDENCE' ? (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleQuickLinkEvidence(req.requirementCode, rec.topMatch!);
                                          }}
                                          disabled={linkingEvidenceId === rec.topMatch.evidence.id}
                                          className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                        >
                                          <Zap className="w-2.5 h-2.5 text-amber-300" />
                                          <span>Bridge</span>
                                        </button>
                                      ) : rec.topMatch.recommendedAction === 'ALREADY_LINKED' ? (
                                        <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5">
                                          <CheckCircle2 className="w-2.5 h-2.5" /> Linked
                                        </span>
                                      ) : (
                                        <span className="text-[10px] text-amber-400 font-semibold">
                                          In Vault
                                        </span>
                                      )}
                                    </div>
                                  );
                                }
                                return (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-purple-300 bg-purple-950/60 border border-purple-500/30">
                                    Template +{rec.prescribedTemplate.potentialReadinessUplift}%
                                  </span>
                                );
                              })()}
                            </td>

                            {/* Action Button */}
                            <td className="py-3 px-3 text-right whitespace-nowrap">
                              <button
                                onClick={(e) => toggleRequirementExpansion(req.requirementCode, e)}
                                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                              >
                                {isExpanded ? 'Hide' : 'Drilldown'}
                              </button>
                            </td>
                          </tr>

                          {/* Expanded Table Row with Interactive Drilldown */}
                          {isExpanded && (
                            <tr className="bg-slate-950/70 border-b border-slate-800">
                              <td colSpan={10} className="p-4">
                                <MASRequirementDrilldownView
                                  requirement={req}
                                  onOpenEvidenceVault={handleDrillDownToEvidenceVault}
                                  onUploadProof={(r) => {
                                    setSelectedRequirement(r);
                                    setUploadProofModalOpen(true);
                                  }}
                                  onNavigateToFindingCAPA={(findingCode) => {
                                    setFindingFilterQuery(findingCode);
                                    setActiveModule('findings_capa');
                                  }}
                                  onCopyHash={handleCopyHash}
                                  copiedHash={copiedHash}
                                  unifiedRemediations={INITIAL_UNIFIED_REMEDIATIONS}
                                  allFindings={findings}
                                />
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Drill-Down Slide-Over / Modal Detail Section for High Risk Requirement */}
        {selectedRequirement && (
          <div id="requirement-drilldown-panel" className="mt-8 bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-2xl space-y-6">
            
            {/* Top Bar of the Drill-Down */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-slate-800 text-white border border-slate-700">
                    {selectedRequirement.requirementCode}
                  </span>
                  <ComplianceStatusBadge status={selectedRequirement.complianceStatusBadge} size="md" />
                  <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                    selectedRequirement.riskTier === 'HIGH_RISK'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : selectedRequirement.riskTier === 'MEDIUM_RISK'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}>
                    {selectedRequirement.riskTier.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {selectedRequirement.domainNumber} {selectedRequirement.domainName}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {selectedRequirement.title}
                </h2>
                <p className="text-xs text-slate-400 max-w-4xl">
                  {selectedRequirement.statement}
                </p>
              </div>

              {/* Primary Drill-Down Action: Directly into Evidence Vault */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                <button
                  onClick={() => handleDrillDownToEvidenceVault(selectedRequirement)}
                  className="px-4 py-2.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40"
                >
                  <FolderCheck className="w-4 h-4" />
                  Drill Down into Evidence Vault &rarr;
                </button>
                <button
                  onClick={() => setUploadProofModalOpen(true)}
                  className="px-3.5 py-2.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5 text-sky-400" />
                  Upload Vault Proof
                </button>
              </div>
            </div>

            {/* Drill-Down Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
              <button
                onClick={() => setDrillDownTab('RECOMMENDED_EVIDENCE')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0 ${
                  drillDownTab === 'RECOMMENDED_EVIDENCE'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm'
                    : selectedRequirementRec
                    ? 'bg-indigo-950/60 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-900/60'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>AI Vault Recommendations</span>
                {selectedRequirementRec && selectedRequirementRec.matchedVaultItems.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-indigo-900 text-indigo-200 border border-indigo-400/30 font-bold">
                    {selectedRequirementRec.matchedVaultItems.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setDrillDownTab('EVIDENCE_VAULT')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0 ${
                  drillDownTab === 'EVIDENCE_VAULT'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                <FolderCheck className="w-3.5 h-3.5 text-emerald-400" />
                Associated Evidence Vault ({selectedRequirement.associatedEvidence.length})
              </button>

              <button
                onClick={() => setDrillDownTab('OPEN_FINDINGS')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0 ${
                  drillDownTab === 'OPEN_FINDINGS'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                Open Non-Conformities & CAPA ({selectedRequirement.openFindings.length})
              </button>

              <button
                onClick={() => setDrillDownTab('REQUIREMENT_DETAILS')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0 ${
                  drillDownTab === 'REQUIREMENT_DETAILS'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-sky-400" />
                Statutory Intent & Guidance
              </button>
            </div>

            {/* Tab Content 0: AI Recommended Evidence */}
            {drillDownTab === 'RECOMMENDED_EVIDENCE' && (
              <div className="space-y-4">
                {selectedRequirementRec ? (
                  <>
                    {/* Recommendation Overview Card */}
                    <div className="bg-gradient-to-r from-indigo-950/60 via-slate-900 to-purple-950/60 border border-indigo-500/30 rounded-xl p-4 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            Remediation Engine
                          </span>
                          <span className="text-xs text-slate-300 font-medium">
                            Current Status: <strong className="text-white">{selectedRequirement.complianceStatusBadge}</strong> ({selectedRequirement.readinessScore}%)
                          </span>
                        </div>
                        {selectedRequirementRec.topMatch && (
                          <div className="flex items-center gap-1.5 font-mono text-xs text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                            <Zap className="w-3.5 h-3.5 text-amber-300" />
                            <span>Projected Uplift: +{selectedRequirementRec.topMatch.projectedReadinessUplift}% &rarr; {Math.min(100, selectedRequirement.readinessScore + selectedRequirementRec.topMatch.projectedReadinessUplift)}%</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-slate-300">
                        {selectedRequirementRec.primaryDeficiencyReason}
                      </p>
                    </div>

                    {/* Matched Vault Items */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                        <span>Matched Evidence Vault Items ({selectedRequirementRec.matchedVaultItems.length})</span>
                        <span className="text-[11px] text-slate-500 normal-case">Ranked by Algorithmic Confidence</span>
                      </h4>

                      {selectedRequirementRec.matchedVaultItems.length === 0 ? (
                        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-center space-y-2">
                          <FolderCheck className="w-6 h-6 text-slate-500 mx-auto" />
                          <p className="text-xs text-slate-300 font-medium">No direct artifact matches currently found in EvidenceVault</p>
                          <p className="text-[11px] text-slate-500">
                            Use the prescribed evidence collection template below to request and upload auditor-grade proof.
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-3">
                          {selectedRequirementRec.matchedVaultItems.map((match) => (
                            <div
                              key={match.evidence.id}
                              className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 space-y-3 hover:border-slate-600 transition-all"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                <div className="space-y-1 flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900 text-slate-200 border border-slate-700">
                                      {match.evidence.controlCode}
                                    </span>
                                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-950/80 text-indigo-300 border border-indigo-500/40">
                                      {match.confidenceScore}% Match Confidence
                                    </span>
                                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                                      +{match.projectedReadinessUplift}% Uplift
                                    </span>
                                    {match.evidence.status === 'Verified' && (
                                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300">
                                        Verified Auditor-Grade
                                      </span>
                                    )}
                                  </div>
                                  <h5 className="text-sm font-bold text-white pt-1">{match.evidence.title}</h5>
                                  <p className="text-xs text-slate-400 font-mono">
                                    {match.evidence.fileName} &bull; {match.evidence.department}
                                  </p>
                                </div>

                                <div className="shrink-0">
                                  {match.recommendedAction === 'LINK_EXISTING_EVIDENCE' ? (
                                    <button
                                      onClick={() => handleQuickLinkEvidence(selectedRequirement.requirementCode, match)}
                                      disabled={linkingEvidenceId === match.evidence.id}
                                      className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                                    >
                                      <Zap className={`w-3 h-3 ${linkingEvidenceId === match.evidence.id ? 'animate-spin' : 'text-amber-300'}`} />
                                      <span>{linkingEvidenceId === match.evidence.id ? 'Linking...' : 'Link to Bridge Gap'}</span>
                                    </button>
                                  ) : match.recommendedAction === 'ALREADY_LINKED' ? (
                                    <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                                      <CheckCircle2 className="w-3.5 h-3.5" /> Currently Linked
                                    </span>
                                  ) : (
                                    <button
                                      onClick={() => handleDrillDownToEvidenceVault(selectedRequirement)}
                                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
                                    >
                                      Verify in Vault
                                    </button>
                                  )}
                                </div>
                              </div>

                              {match.evidence.documentExcerpt && (
                                <p className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded border border-slate-800 italic">
                                  "{match.evidence.documentExcerpt}"
                                </p>
                              )}

                              {/* Matching Factors */}
                              <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px]">
                                <span className="text-slate-500">Matching Factors:</span>
                                {match.matchingFactors.controlCodeMatch && (
                                  <span className="px-1.5 py-0.2 rounded bg-slate-900 text-sky-300 border border-slate-700">Control Match</span>
                                )}
                                {match.matchingFactors.isoControlMatched && (
                                  <span className="px-1.5 py-0.2 rounded bg-slate-900 text-purple-300 border border-slate-700">ISO Crosswalk ({match.matchingFactors.isoControlMatched})</span>
                                )}
                                {match.matchingFactors.departmentAlignment && (
                                  <span className="px-1.5 py-0.2 rounded bg-slate-900 text-amber-300 border border-slate-700">Dept Aligned</span>
                                )}
                                {match.matchingFactors.keywordMatches.slice(0, 3).map((kw) => (
                                  <span key={kw} className="px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-700">#{kw}</span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Prescribed Template */}
                    <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-4 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 block mb-1">
                            Prescribed Evidence Collection Template
                          </span>
                          <h5 className="text-sm font-bold text-white">
                            {selectedRequirementRec.prescribedTemplate.title}
                          </h5>
                          <p className="text-xs text-slate-400">
                            Assigned Department: <strong className="text-slate-200">{selectedRequirementRec.prescribedTemplate.department}</strong> &bull; Recommended Cadence: <strong className="text-slate-200">{selectedRequirementRec.prescribedTemplate.recommendedCadence}</strong>
                          </p>
                        </div>
                        <button
                          onClick={() => handleScaffoldTemplate(selectedRequirement.requirementCode, selectedRequirementRec.prescribedTemplate)}
                          disabled={scaffoldingTemplateId === selectedRequirementRec.prescribedTemplate.templateId}
                          className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-1.5 shadow-sm transition-all shrink-0 cursor-pointer disabled:opacity-50"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>
                            {scaffoldingTemplateId === selectedRequirementRec.prescribedTemplate.templateId ? 'Scaffolding...' : 'Scaffold Request in Vault'}
                          </span>
                        </button>
                      </div>

                      <div className="text-xs space-y-1 pt-2 border-t border-slate-800">
                        <span className="text-slate-400 font-semibold block">Mandatory Auditor Safeguards:</span>
                        <ul className="list-disc list-inside text-slate-300 space-y-1 pl-1">
                          {selectedRequirementRec.prescribedTemplate.mandatorySafeguards.map((sg, idx) => (
                            <li key={idx}>{sg}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-6 text-center space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                    <h4 className="text-sm font-semibold text-white">Fully Compliant - No Evidence Gap</h4>
                    <p className="text-xs text-slate-400">
                      This requirement has verified auditor-grade evidence and meets regulatory criteria.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Tab Content 1: Associated Evidence Vault */}
            {drillDownTab === 'EVIDENCE_VAULT' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                  <div className="text-xs text-slate-300">
                    <span className="font-semibold text-white">Cryptographic Vault Traceability:</span> Artifacts mapped to{' '}
                    <code className="text-rose-400 font-mono">{selectedRequirement.requirementCode}</code> & ISO Crosswalk{' '}
                    <code className="text-sky-400 font-mono">
                      {selectedRequirement.crossFrameworkMappings?.iso27001?.join(', ') || 'A.5.1'}
                    </code>
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    {selectedRequirement.associatedEvidence.filter((e) => e.verificationState === 'Verified' || e.status === 'Verified').length} Verified Artifacts
                  </div>
                </div>

                {selectedRequirement.associatedEvidence.length === 0 ? (
                  <div className="bg-rose-950/20 border border-rose-500/30 rounded-xl p-6 text-center space-y-3">
                    <ShieldAlert className="w-10 h-10 text-rose-400 mx-auto" />
                    <h4 className="text-sm font-bold text-white">Evidence Gap Detected for High Risk Requirement</h4>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Zero verified auditor-grade artifacts are currently linked to this requirement in the Evidence Vault.
                      To remediate this supervisory gap, upload or attach evidence artifacts immediately.
                    </p>
                    <div className="flex justify-center gap-3 pt-2">
                      <button
                        onClick={() => setUploadProofModalOpen(true)}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Upload Required Artifact
                      </button>
                      <button
                        onClick={() => handleDrillDownToEvidenceVault(selectedRequirement)}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                      >
                        <FolderCheck className="w-3.5 h-3.5 text-emerald-400" />
                        Search Evidence Vault
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedRequirement.associatedEvidence.map((art) => {
                      const isVerified = art.verificationState === 'Verified' || art.status === 'Verified';

                      return (
                        <div
                          key={art.id}
                          className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 space-y-3 relative hover:border-slate-600 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                                isVerified
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              }`}>
                                {isVerified ? (
                                  <>
                                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                    Verified Auditor-Grade
                                  </>
                                ) : (
                                  <>
                                    <Clock className="w-3 h-3 text-amber-400" />
                                    Pending Independent Review
                                  </>
                                )}
                              </span>
                              <h4 className="text-sm font-bold text-white leading-snug">
                                {art.title}
                              </h4>
                              <p className="text-xs text-slate-400 font-mono">
                                {art.fileName} &bull; {art.fileSize}
                              </p>
                            </div>

                            <button
                              onClick={() => handleDrillDownToEvidenceVault(selectedRequirement)}
                              title="Inspect in Evidence Vault"
                              className="p-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors"
                            >
                              <ExternalLink className="w-4 h-4 text-sky-400" />
                            </button>
                          </div>

                          {art.documentExcerpt && (
                            <p className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded border border-slate-800 italic">
                              "{art.documentExcerpt}"
                            </p>
                          )}

                          {/* Cryptographic Hash Seal */}
                          <div className="space-y-1 pt-1">
                            <div className="flex items-center justify-between text-[10px] text-slate-400">
                              <span className="flex items-center gap-1 font-mono">
                                <Hash className="w-3 h-3 text-emerald-400" /> SHA-256 Digest Seal
                              </span>
                              <button
                                onClick={() => handleCopyHash(art.sha256Hash || art.auditHash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855')}
                                className="text-sky-400 hover:text-sky-300 flex items-center gap-1"
                              >
                                {copiedHash === (art.sha256Hash || art.auditHash) ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-400" /> Copied
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" /> Copy Hash
                                  </>
                                )}
                              </button>
                            </div>
                            <div className="font-mono text-[10px] text-slate-400 bg-slate-900 px-2 py-1 rounded truncate border border-slate-800">
                              {art.sha256Hash || art.auditHash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-700/60">
                            <span>Uploaded: {art.uploadedBy}</span>
                            <span>Exp: {art.expiryDate || '2027-08-15'}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Tab Content 2: Open Non-Conformities & CAPA */}
            {drillDownTab === 'OPEN_FINDINGS' && (
              <div className="space-y-4">
                {selectedRequirement.openFindings.length === 0 ? (
                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                    <h4 className="text-sm font-semibold text-white">Zero Open Non-Conformities</h4>
                    <p className="text-xs text-slate-400">
                      All audit findings previously logged against this requirement have been remediated and verified closed.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedRequirement.openFindings.map((finding) => (
                      <div
                        key={finding.id}
                        className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-rose-300 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/60">
                              {finding.findingCode}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              finding.severity === 'Major Non-Conformity'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            }`}>
                              {finding.severity}
                            </span>
                            <span className="text-xs text-slate-400">
                              Status: <strong className="text-white">{finding.status}</strong>
                            </span>
                          </div>

                          <button
                            onClick={() => {
                              setFindingFilterQuery(finding.findingCode);
                              setActiveModule('findings_capa');
                            }}
                            className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1"
                          >
                            Open in CAPA Desk &rarr;
                          </button>
                        </div>

                        <h4 className="text-sm font-bold text-white">
                          {finding.title}
                        </h4>
                        <p className="text-xs text-slate-300">
                          {finding.description}
                        </p>

                        {/* CAPA Plan */}
                        {finding.capaPlan && (
                          <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-2 text-xs">
                            <div className="font-semibold text-slate-200">
                              Corrective & Preventive Action Plan:
                            </div>
                            <div className="text-slate-300">
                              <span className="text-rose-400 font-medium">Corrective: </span>
                              {finding.capaPlan.correctiveAction}
                            </div>
                            <div className="text-slate-300">
                              <span className="text-emerald-400 font-medium">Preventive: </span>
                              {finding.capaPlan.preventiveAction}
                            </div>
                            <div className="flex justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                              <span>Owner: {finding.capaPlan.owner}</span>
                              <span>Target Completion: {finding.capaPlan.targetDate}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab Content 3: Requirement Details */}
            {drillDownTab === 'REQUIREMENT_DETAILS' && (
              <div className="space-y-4 text-xs">
                <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 space-y-2">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider block">
                    Statutory Intent & Supervisory Guidance
                  </span>
                  <p className="text-slate-200 leading-relaxed">
                    {selectedRequirement.intentAndGuidance}
                  </p>
                  <p className="text-[11px] text-rose-400 font-mono pt-1">
                    Regulatory Reference: {selectedRequirement.regulatorySourceRef}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-800/40 p-3.5 rounded-lg border border-slate-700/60 space-y-1">
                    <span className="text-slate-400 block font-semibold">Responsible Governance Roles:</span>
                    <p className="text-slate-200">
                      {selectedRequirement.responsibleRoles.join(', ')}
                    </p>
                  </div>

                  <div className="bg-slate-800/40 p-3.5 rounded-lg border border-slate-700/60 space-y-1">
                    <span className="text-slate-400 block font-semibold">Cross-Framework ISO 27001 Mapping:</span>
                    <p className="text-sky-300 font-mono">
                      {selectedRequirement.crossFrameworkMappings?.iso27001?.join(', ') || 'A.5.1'}
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}
      </>
    )}

        {/* Quick Upload Evidence Modal */}
        {uploadProofModalOpen && selectedRequirement && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-lg w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4 text-sky-400" />
                  <h3 className="text-base font-bold text-white">
                    Upload Artifact for {selectedRequirement.requirementCode}
                  </h3>
                </div>
                <button
                  onClick={() => setUploadProofModalOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-400">
                Upload and seal an auditor-grade evidence artifact directly into the Evidence Vault for{' '}
                <strong className="text-white">{selectedRequirement.title}</strong>.
              </p>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Document / Artifact Title</label>
                  <input
                    type="text"
                    value={proofTitle || `${selectedRequirement.title} - Operational Audit Pack 2026`}
                    onChange={(e) => setProofTitle(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">File Name</label>
                  <input
                    type="text"
                    value={proofFile}
                    onChange={(e) => setProofFile(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Department</label>
                  <select
                    value={proofDept}
                    onChange={(e) => setProofDept(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-xs"
                  >
                    <option value="IT & Infrastructure">IT & Infrastructure</option>
                    <option value="Software Engineering & DevOps">Software Engineering & DevOps</option>
                    <option value="Information Security & Compliance">Information Security & Compliance</option>
                    <option value="Procurement & Vendor Management">Procurement & Vendor Management</option>
                    <option value="Operations & Business Continuity">Operations & Business Continuity</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => setUploadProofModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setUploadProofModalOpen(false);
                    // Navigate to Evidence Centre with success intent
                    handleDrillDownToEvidenceVault(selectedRequirement);
                  }}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-md"
                >
                  <Check className="w-3.5 h-3.5" />
                  Save to Vault & Inspect
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Anomaly Detector Drill-Down Modal: Specific Audit Events & Incurred Deficiencies */}
        {selectedAnomaly && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-rose-500/50 rounded-2xl max-w-4xl w-full p-6 shadow-2xl space-y-6 relative my-8 max-h-[90vh] overflow-y-auto">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/50">
                      <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />
                      ANOMALY DETECTOR &bull; {selectedAnomaly.severity} SPIKE
                    </span>
                    <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-rose-950 text-rose-200 border border-rose-500/40">
                      +{selectedAnomaly.gapIncrease} Deficiencies (+{selectedAnomaly.percentageSpike}%)
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {selectedAnomaly.dateLabel} ({selectedAnomaly.timestamp})
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                    <span>{selectedAnomaly.triggerEventTitle}</span>
                  </h3>

                  <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                    Longitudinal anomaly detection identified an abrupt expansion in regulatory non-conformities from{' '}
                    <strong className="text-slate-200 font-mono">{selectedAnomaly.previousDeficient}</strong> to{' '}
                    <strong className="text-rose-400 font-mono">{selectedAnomaly.newDeficient} Deficiencies</strong>{' '}
                    following the <span className="text-white font-medium">{selectedAnomaly.auditEntity}</span> inspection.
                  </p>
                </div>

                <button
                  onClick={() => setSelectedAnomaly(null)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Audit Metadata Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 text-xs">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Supervisory Entity</span>
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span className="truncate">{selectedAnomaly.auditEntity}</span>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Audit Inspection Date</span>
                  <div className="font-semibold text-slate-200 flex items-center gap-1.5 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span>{selectedAnomaly.auditDate}</span>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Supervisory Report Ref</span>
                  <div className="font-semibold text-amber-300 flex items-center gap-1.5 font-mono">
                    <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate">{selectedAnomaly.auditReportRef}</span>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Remediation Status</span>
                  <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">Remediated & Verified</span>
                  </div>
                </div>
              </div>

              {/* Root Cause & Narrative Card */}
              <div className="bg-rose-950/20 border border-rose-500/30 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-300">
                  <AlertOctagon className="w-4 h-4 text-rose-400" />
                  <span>Supervisory Finding & Root Cause Narrative</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {selectedAnomaly.rootCauseDescription}
                </p>
                <div className="pt-2 border-t border-rose-950/60 flex items-center justify-between text-[11px] text-slate-300 flex-wrap gap-2">
                  <span><strong>Immediate Action Taken:</strong> {selectedAnomaly.immediateActionTaken}</span>
                  <span className="text-emerald-400 font-mono text-[10px] font-semibold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                    Remediation Track: {selectedAnomaly.remediationMilestoneRef}
                  </span>
                </div>
              </div>

              {/* Incurred Audit Requirements / Non-Conformities */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-rose-400" />
                    <span>Incurred Deficiencies & Findings Breakdown ({selectedAnomaly.incurredRequirements.length})</span>
                  </h4>
                  <span className="text-xs text-slate-400">
                    Specific MAS TRM requirements that incurred findings during this audit
                  </span>
                </div>

                <div className="space-y-3">
                  {selectedAnomaly.incurredRequirements.map((req) => (
                    <div
                      key={req.requirementCode}
                      className="bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-xl p-4 space-y-3 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                              {req.requirementCode}
                            </span>
                            <span className="text-xs font-semibold text-slate-300">
                              {req.domainName}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                req.riskTier === 'HIGH_RISK'
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              }`}
                            >
                              {req.riskTier === 'HIGH_RISK' ? 'High Risk' : 'Medium Risk'}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              Status: {req.remediationStatus}
                            </span>
                          </div>
                          <h5 className="text-sm font-bold text-white pt-1">
                            {req.requirementTitle}
                          </h5>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => {
                              setSelectedAnomaly(null);
                              const target = enrichedRequirements.find((r) => r.requirementCode === req.requirementCode);
                              if (target) {
                                setSelectedRequirement(target);
                              }
                            }}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
                          >
                            <ExternalLink className="w-3 h-3 text-sky-400" />
                            <span>View Requirement</span>
                          </button>
                        </div>
                      </div>

                      {/* Detail Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-2 border-t border-slate-800/80 text-xs">
                        <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 space-y-1">
                          <span className="text-[10px] uppercase font-bold text-rose-400 block tracking-wider">
                            Auditor Non-Conformity Finding
                          </span>
                          <p className="text-slate-300 text-[11px] leading-relaxed">
                            {req.findingSummary}
                          </p>
                        </div>

                        <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 space-y-1">
                          <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">
                            Missing Evidence Deficit
                          </span>
                          <p className="text-slate-300 text-[11px] leading-relaxed">
                            {req.evidenceDeficit}
                          </p>
                        </div>

                        <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 space-y-1">
                          <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-wider">
                            Remediation Action Executed
                          </span>
                          <p className="text-slate-300 text-[11px] leading-relaxed">
                            {req.remediationAction}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Actions Footer */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-800">
                <div className="text-xs text-slate-400">
                  Anomaly Period: <span className="text-slate-200 font-mono font-medium">{selectedAnomaly.period}</span> &bull; Current Posture: <strong className="text-emerald-400">Remediated</strong>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => {
                      const snapshot = deficiencyTrendData.find((p) => p.period === selectedAnomaly.period);
                      setSelectedAnomaly(null);
                      if (snapshot) {
                        handleOpenRetrospectiveEvidenceCentre(snapshot as RetrospectiveTimelinePoint);
                      }
                    }}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white flex items-center gap-1.5 shadow-md shadow-sky-950/40 transition-all cursor-pointer"
                  >
                    <FolderCheck className="w-3.5 h-3.5 text-sky-200" />
                    <span>Inspect Evidence Vault at {selectedAnomaly.dateLabel}</span>
                  </button>

                  <button
                    onClick={() => setSelectedAnomaly(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Regulatory Velocity Drill-Down Modal: Released Mandates & Improvement Breakdown */}
        {showVelocityDetailsModal && activeVelocityPeriodData && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-amber-500/50 rounded-2xl max-w-4xl w-full p-6 shadow-2xl space-y-6 relative my-8 max-h-[90vh] overflow-y-auto">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/50">
                      <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
                      REGULATORY VELOCITY &bull; {activeVelocityPeriodData.velocityStatus}
                    </span>
                    <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-cyan-950 text-cyan-200 border border-cyan-500/40">
                      +{activeVelocityPeriodData.improvementRate} / mo Improvement Rate
                    </span>
                    <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-amber-950 text-amber-200 border border-amber-500/40">
                      +{activeVelocityPeriodData.newRequirementsVolume} Reqs Influx
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {activeVelocityPeriodData.dateLabel} ({activeVelocityPeriodData.period})
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                    <span>Regulatory Influx vs Compliance Remediation Velocity</span>
                  </h3>

                  <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                    Detailed analysis of incoming regulatory requirements from MAS, ISO, and NIST baselines during{' '}
                    <strong className="text-slate-200">{activeVelocityPeriodData.period}</strong> alongside the internal engineering remediation velocity executed to bridge compliance gaps.
                  </p>
                </div>

                <button
                  onClick={() => setShowVelocityDetailsModal(false)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 4 Metric KPI Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 text-xs">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-cyan-400 block tracking-wider">Improvement Rate</span>
                  <div className="font-semibold text-white flex items-center gap-1.5 font-mono text-sm">
                    <TrendingUp className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>+{activeVelocityPeriodData.improvementRate} / mo</span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    +{activeVelocityPeriodData.readinessDeltaPct}% Readiness uplift
                  </span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">New Reqs Released</span>
                  <div className="font-semibold text-slate-200 flex items-center gap-1.5 font-mono text-sm">
                    <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>+{activeVelocityPeriodData.newRequirementsVolume} Mandates</span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {activeVelocityPeriodData.releasedRequirements.length} Circular releases
                  </span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-yellow-400 block tracking-wider">Net Velocity Spread</span>
                  <div className={`font-semibold flex items-center gap-1.5 font-mono text-sm ${
                    activeVelocityPeriodData.netVelocity > 0 ? 'text-emerald-400' : activeVelocityPeriodData.netVelocity < 0 ? 'text-rose-400' : 'text-amber-400'
                  }`}>
                    <span>{activeVelocityPeriodData.netVelocity > 0 ? `+${activeVelocityPeriodData.netVelocity}` : activeVelocityPeriodData.netVelocity}</span>
                    <span className="text-[10px] text-slate-400 font-sans font-normal">margin</span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {activeVelocityPeriodData.velocityRatio}x Absorption ratio
                  </span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Velocity Posture</span>
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">
                      {activeVelocityPeriodData.velocityStatus === 'OUTPACING' ? 'Ahead of Mandates' : activeVelocityPeriodData.velocityStatus === 'LAGGING' ? 'Lagging Volume' : 'Parity'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {activeVelocityPeriodData.verifiedControlsCount} Verified controls
                  </span>
                </div>
              </div>

              {/* Narrative Insight */}
              <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Velocity Analysis & Influx Narrative</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {activeVelocityPeriodData.velocityStatusLabel}: During {activeVelocityPeriodData.period}, the organization recorded an improvement rate of {activeVelocityPeriodData.improvementRate} remediations/mo against {activeVelocityPeriodData.newRequirementsVolume} new requirements, achieving an absorption rate of {activeVelocityPeriodData.absorptionRatePct}% with net velocity spread of {activeVelocityPeriodData.netVelocity > 0 ? `+${activeVelocityPeriodData.netVelocity}` : activeVelocityPeriodData.netVelocity}.
                </p>
              </div>

              {/* Released Regulatory Requirements List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-400" />
                    <span>Regulatory Requirements Published in this Period ({activeVelocityPeriodData.releasedRequirements.length})</span>
                  </h4>
                  <span className="text-xs text-slate-400">
                    Formal circulars, notices, and mandates issued requiring organizational compliance
                  </span>
                </div>

                {activeVelocityPeriodData.releasedRequirements.length === 0 ? (
                  <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 text-center text-xs text-slate-400">
                    No new external regulatory mandates published during this financial cycle period.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeVelocityPeriodData.releasedRequirements.map((rel) => (
                      <div
                        key={rel.id}
                        className="bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-xl p-4 space-y-3 transition-all"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                {rel.authority}: {rel.circularRef}
                              </span>
                              <span className="text-xs font-semibold text-slate-300">
                                Domain {rel.domainNumber}: {rel.domainName}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  rel.severity === 'HIGH'
                                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                }`}
                              >
                                {rel.severity} Severity &bull; {rel.mandatoryClausesCount} Clauses
                              </span>
                            </div>
                            <h5 className="text-sm font-bold text-white pt-1">
                              {rel.title}
                            </h5>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                              Effective: {rel.effectiveDate}
                            </span>
                          </div>
                        </div>

                        {/* Summary & Remediation Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-2 border-t border-slate-800/80 text-xs">
                          <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 space-y-1">
                            <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">
                              Regulatory Mandate Summary
                            </span>
                            <p className="text-slate-300 text-[11px] leading-relaxed">
                              {rel.summary}
                            </p>
                          </div>

                          <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 space-y-1">
                            <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-wider">
                              Remediation Action & Controls
                            </span>
                            <p className="text-slate-300 text-[11px] leading-relaxed">
                              {rel.remediationActionSummary}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Actions Footer */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-800">
                <div className="text-xs text-slate-400">
                  Velocity Ratio: <strong className="text-amber-300 font-mono">{activeVelocityPeriodData.velocityRatio}x</strong> &bull; Posture: <strong className="text-emerald-400">{activeVelocityPeriodData.velocityStatus}</strong>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => {
                      const snapshot = deficiencyTrendData.find((p) => p.period === activeVelocityPeriodData.period);
                      setShowVelocityDetailsModal(false);
                      if (snapshot) {
                        handleOpenRetrospectiveEvidenceCentre(snapshot as RetrospectiveTimelinePoint);
                      }
                    }}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-600 to-teal-600 hover:from-amber-500 hover:to-teal-500 text-white flex items-center gap-1.5 shadow-md shadow-amber-950/40 transition-all cursor-pointer"
                  >
                    <FolderCheck className="w-3.5 h-3.5 text-amber-200" />
                    <span>Inspect Evidence Vault at {activeVelocityPeriodData.dateLabel}</span>
                  </button>

                  <button
                    onClick={() => setShowVelocityDetailsModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </PageContainer>
  );
};
