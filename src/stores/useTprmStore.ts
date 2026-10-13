/**
 * SKANDA ENTERPRISE TPRM REACT STATE STORE
 * Path: src/stores/useTprmStore.ts
 * 
 * Manages reactive tenant-scoped state for:
 * - Master Vendor Inventory & Vendor 360 Records
 * - 17-Stage Lifecycle State Machine Transitions
 * - Dynamic Due Diligence Questionnaires & Responses
 * - Evidence Items & 5-Tier Assurance Hierarchy
 * - Continuous Monitoring Signals & Alerts
 * - Fourth-Party Concentration Graph & Blast Radius
 * - Findings & Closed-Loop CAPA Remediation with Retesting
 * - Versioned 14-Factor Risk Methodologies
 */

import { useState, useEffect, useCallback } from 'react';
import {
  MasterVendorRecord,
  TprmVendorAssessment,
  TprmEvidenceItem,
  TprmMonitoringSignal,
  FourthPartyNode,
  TprmFindingItem,
  TprmContractRecord,
  TprmRiskSnapshot,
  TprmMethodology,
  VendorLifecycleStatus,
  AssuranceTier
} from '../types/tprmTypes';
import {
  MASTER_ENTERPRISE_VENDORS,
  MASTER_FOURTH_PARTY_NODES,
  DEFAULT_TPRM_METHODOLOGY_5X5
} from '../data/tprmMasterData';
import { tprmIntelligenceEngine } from '../services/grc/TprmIntelligenceEngine';

// In-Memory Multi-Tenant Store Cache
const tenantVendorsCache: Map<string, MasterVendorRecord[]> = new Map();
const tenantSignalsCache: Map<string, TprmMonitoringSignal[]> = new Map();
const tenantMethodologiesCache: Map<string, TprmMethodology[]> = new Map();

export const useTprmStore = (tenantId: string = 'tenant-acme-corp') => {
  // 1. Initialize State from Cache or Master Data
  const [vendors, setVendors] = useState<MasterVendorRecord[]>(() => {
    if (!tenantVendorsCache.has(tenantId)) {
      tenantVendorsCache.set(tenantId, JSON.parse(JSON.stringify(MASTER_ENTERPRISE_VENDORS)));
    }
    return tenantVendorsCache.get(tenantId)!;
  });

  const [fourthPartyNodes, setFourthPartyNodes] = useState<FourthPartyNode[]>(MASTER_FOURTH_PARTY_NODES);
  const [activeMethodology, setActiveMethodology] = useState<TprmMethodology>(DEFAULT_TPRM_METHODOLOGY_5X5);
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(vendors[0]?.id || null);
  const [activeTab, setActiveTab] = useState<
    'command_center' | 'vendor_360' | 'assessments' | 'monitoring' | 'fourth_party' | 'contracts' | 'findings' | 'methodology'
  >('command_center');

  // Sync cache on changes
  useEffect(() => {
    tenantVendorsCache.set(tenantId, vendors);
  }, [vendors, tenantId]);

  // Selected Vendor Record
  const selectedVendor = vendors.find(v => v.id === selectedVendorId) || vendors[0] || null;

  // --------------------------------------------------------------------------
  // ACTION: Transition Vendor Lifecycle Status (with Governance Guards)
  // --------------------------------------------------------------------------
  const transitionVendorLifecycle = useCallback(
    (vendorId: string, targetStatus: VendorLifecycleStatus): { success: boolean; message: string } => {
      const targetVendor = vendors.find(v => v.id === vendorId);
      if (!targetVendor) {
        return { success: false, message: 'Vendor not found.' };
      }

      const validation = tprmIntelligenceEngine.validateLifecycleTransition(
        targetVendor.lifecycleStatus,
        targetStatus,
        targetVendor
      );

      if (!validation.allowed) {
        return { success: false, message: validation.reason || 'Transition rejected by governance policy.' };
      }

      setVendors(prev =>
        prev.map(v => {
          if (v.id === vendorId) {
            return {
              ...v,
              lifecycleStatus: targetStatus,
              updatedAt: new Date().toISOString(),
              version: v.version + 1
            };
          }
          return v;
        })
      );

      return {
        success: true,
        message: `Successfully transitioned ${targetVendor.profile.legalName} to "${targetStatus}".`
      };
    },
    [vendors]
  );

  // --------------------------------------------------------------------------
  // ACTION: Recalculate Vendor Risk Snapshot (14-Factor)
  // --------------------------------------------------------------------------
  const recalculateVendorRisk = useCallback(
    (vendorId: string, assessorName: string = 'User Risk Assessor'): TprmRiskSnapshot | null => {
      const targetVendor = vendors.find(v => v.id === vendorId);
      if (!targetVendor) return null;

      const newSnapshot = tprmIntelligenceEngine.calculateVendorRiskSnapshot(
        targetVendor,
        targetVendor.latestRiskSnapshot.factorBreakdown,
        activeMethodology,
        assessorName
      );

      setVendors(prev =>
        prev.map(v => {
          if (v.id === vendorId) {
            return {
              ...v,
              latestRiskSnapshot: newSnapshot,
              updatedAt: new Date().toISOString(),
              version: v.version + 1
            };
          }
          return v;
        })
      );

      return newSnapshot;
    },
    [vendors, activeMethodology]
  );

  // --------------------------------------------------------------------------
  // ACTION: Create or Add New Vendor
  // --------------------------------------------------------------------------
  const addVendor = useCallback(
    (newVendorData: Partial<MasterVendorRecord>): MasterVendorRecord => {
      const generatedId = `vnd-${Date.now().toString().slice(-4)}`;
      const vendorCode = `VND-${(vendors.length + 1).toString().padStart(3, '0')}`;

      const initialRecord: MasterVendorRecord = {
        id: generatedId,
        tenantId,
        vendorCode,
        lifecycleStatus: 'VENDOR_REGISTRATION',
        approvalDecision: 'PENDING_EXECUTIVE_APPROVAL',
        profile: {
          legalName: newVendorData.profile?.legalName || 'New Vendor Organization',
          tradingName: newVendorData.profile?.tradingName || newVendorData.profile?.legalName || 'New Vendor',
          vendorIdentifier: vendorCode,
          legalEntityJurisdiction: newVendorData.profile?.legalEntityJurisdiction || 'Singapore (SG)',
          headquartersAddress: newVendorData.profile?.headquartersAddress || 'Not Provided',
          industryCategory: newVendorData.profile?.industryCategory || 'SAAS_COLLABORATION',
          websiteUrl: newVendorData.profile?.websiteUrl || 'https://example.com',
          keyContacts: newVendorData.profile?.keyContacts || {
            relationshipOwner: { name: 'IT & Security Lead', email: 'it.sec@acmegrc.internal', role: 'IT Manager' },
            businessSponsor: { name: 'Business Sponsor', email: 'sponsor@acmegrc.internal', department: 'Operations' },
            procurementOwner: { name: 'Procurement', email: 'procurement@acmegrc.internal' },
            securityContact: { name: 'Vendor Security', email: 'security@vendor.com' },
            privacyOfficer: { name: 'Vendor DPO', email: 'privacy@vendor.com' },
            contractSignatory: { name: 'Legal Counsel', email: 'legal@acmegrc.internal' }
          }
        },
        relationship: {
          servicesProvidedSummary: newVendorData.relationship?.servicesProvidedSummary || 'Third-party SaaS software service',
          businessFunctionsSupported: newVendorData.relationship?.businessFunctionsSupported || ['Business Productivity'],
          criticalityTier: newVendorData.relationship?.criticalityTier || 'TIER_2_MAJOR_OPERATIONAL',
          operationalDependencies: ['Workforce Systems'],
          criticalBusinessServicesAffected: [],
          geographicServiceLocations: ['Singapore'],
          serviceCommencementDate: new Date().toISOString().split('T')[0],
          contractExpiryDate: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
          renewalNoticePeriodDays: 60,
          exitStrategyDocumented: true,
          exitTransitionPeriodDays: 60,
          alternativeSupplierAvailable: true,
          alternativeSupplierNames: ['Alternative Supplier'],
          substitutabilityRating: 'MODERATE_EFFORT'
        },
        technologyAndData: {
          systemsAndApplicationsAccessed: ['Corporate Network'],
          dataClassificationsProcessed: newVendorData.technologyAndData?.dataClassificationsProcessed || ['INTERNAL_BUSINESS'],
          personalDataInvolvement: newVendorData.technologyAndData?.personalDataInvolvement || false,
          specialCategoryOrSensitiveData: false,
          hostingEnvironment: newVendorData.technologyAndData?.hostingEnvironment || 'AWS',
          privilegedAccessGranted: false,
          networkConnectivityType: 'PUBLIC_INTERNET_TLS13',
          apiIntegrationsActive: [],
          primaryStorageLocations: ['Singapore'],
          crossBorderTransfers: false,
          crossBorderTransferMechanisms: ['SCC_2021_914'],
          directSubprocessors: ['AWS'],
          dataRetentionPeriod: '30 Days post termination',
          dataDeletionAssuranceMechanism: 'CRYPTOGRAPHIC_ERASURE_CERTIFICATE'
        },
        assuranceProfile: {
          certifications: [],
          socReports: [],
          penetrationTesting: {
            lastTestDate: new Date().toISOString().split('T')[0],
            nextDueTestDate: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
            testedByThirdParty: true,
            testingFirm: 'Independent QSA',
            remediationOfCriticalFindingsConfirmed: true
          },
          bcpDrTesting: {
            lastExerciseDate: new Date().toISOString().split('T')[0],
            rtoCommittedHours: 4,
            rpoCommittedHours: 1,
            testOutcome: 'PASS'
          },
          securityPoliciesReceived: true,
          privacyNoticeCompliant: true,
          incidentResponseSlaHours: 4
        },
        latestRiskSnapshot: {
          snapshotId: `SNP-${generatedId}-INIT`,
          tenantId,
          vendorId: generatedId,
          methodologyVersion: activeMethodology.version,
          matrixDimension: activeMethodology.matrixDimension,
          calculatedAt: new Date().toISOString(),
          assessedBy: 'Automated Onboarding Initializer',
          factorBreakdown: [
            { factorId: 'F1', factorName: 'Information Security Baseline', factorCategory: 'INFOSEC', weight: 0.25, rawScore: 3, assessedRationale: 'Initial baseline assessment.', groundingEvidenceIds: [] },
            { factorId: 'F2', factorName: 'Data Sensitivity & Privacy', factorCategory: 'PRIVACY_PII', weight: 0.25, rawScore: 3, assessedRationale: 'Initial baseline assessment.', groundingEvidenceIds: [] },
            { factorId: 'F3', factorName: 'Business Criticality', factorCategory: 'BUSINESS_CRITICALITY', weight: 0.25, rawScore: 3, assessedRationale: 'Initial baseline assessment.', groundingEvidenceIds: [] },
            { factorId: 'F4', factorName: 'Operational Resilience', factorCategory: 'RESILIENCE_BCP', weight: 0.25, rawScore: 3, assessedRationale: 'Initial baseline assessment.', groundingEvidenceIds: [] }
          ],
          inherentLikelihood: 3,
          inherentImpact: 3,
          inherentRiskScore: 9,
          inherentRiskLevel: 'MEDIUM',
          controlDesignScore: 70,
          controlOperatingScore: 70,
          evidenceFreshnessScore: 80,
          combinedControlEffectiveness: 72,
          residualLikelihood: 2,
          residualImpact: 3,
          residualRiskScore: 6,
          residualRiskLevel: 'MEDIUM',
          isResidualHigherThanInherent: false,
          riskAppetiteThreshold: 8,
          isOutsideAppetite: false,
          confidenceScorePercent: 75,
          evidenceCompletenessPercent: 60,
          scoringExplanation: 'Initial onboarding baseline risk score evaluated at Inherent 9 (Medium) / Residual 6 (Medium).',
          topRiskContributors: ['Initial Onboarding Baseline', 'Pending Evidence Review']
        },
        activeAssessments: [],
        activeContracts: [],
        evidenceItems: [],
        monitoringSignals: [],
        findings: [],
        regulatoryMappings: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1
      };

      setVendors(prev => [initialRecord, ...prev]);
      setSelectedVendorId(initialRecord.id);
      return initialRecord;
    },
    [tenantId, vendors.length, activeMethodology]
  );

  // --------------------------------------------------------------------------
  // ACTION: Close Finding with Retesting Verification Guard
  // --------------------------------------------------------------------------
  const closeFinding = useCallback(
    (vendorId: string, findingId: string, actorName: string, retestOutcome: 'PASS' | 'FAIL' = 'PASS'): { success: boolean; message: string } => {
      const targetVendor = vendors.find(v => v.id === vendorId);
      if (!targetVendor) return { success: false, message: 'Vendor not found.' };

      const targetFinding = targetVendor.findings.find(f => f.id === findingId);
      if (!targetFinding) return { success: false, message: 'Finding not found.' };

      const closureValidation = tprmIntelligenceEngine.validateFindingClosure(targetFinding, actorName, retestOutcome);

      if (!closureValidation.canClose) {
        if (closureValidation.updatedFinding) {
          // Retest Failed -> Update status to RETEST_FAILED
          setVendors(prev =>
            prev.map(v => {
              if (v.id === vendorId) {
                return {
                  ...v,
                  findings: v.findings.map(f => (f.id === findingId ? closureValidation.updatedFinding! : f)),
                  updatedAt: new Date().toISOString()
                };
              }
              return v;
            })
          );
        }
        return { success: false, message: closureValidation.errorMessage || 'Closure failed validation.' };
      }

      // Retest Passed -> Mark Verified Closed and Recalculate Risk
      setVendors(prev =>
        prev.map(v => {
          if (v.id === vendorId) {
            const updatedFindings = v.findings.map(f => (f.id === findingId ? closureValidation.updatedFinding! : f));
            const updatedVendor = { ...v, findings: updatedFindings };
            const updatedSnapshot = tprmIntelligenceEngine.calculateVendorRiskSnapshot(
              updatedVendor,
              updatedVendor.latestRiskSnapshot.factorBreakdown,
              activeMethodology,
              actorName
            );
            return {
              ...updatedVendor,
              latestRiskSnapshot: updatedSnapshot,
              updatedAt: new Date().toISOString(),
              version: v.version + 1
            };
          }
          return v;
        })
      );

      return {
        success: true,
        message: `Finding ${targetFinding.findingCode} verified closed following successful independent retest.`
      };
    },
    [vendors, activeMethodology]
  );

  // --------------------------------------------------------------------------
  // ACTION: Ingest External Monitoring Signal
  // --------------------------------------------------------------------------
  const ingestMonitoringSignal = useCallback(
    (signalData: Partial<TprmMonitoringSignal>): { success: boolean; message: string } => {
      const vendorId = signalData.vendorId || vendors[0]?.id;
      const targetVendor = vendors.find(v => v.id === vendorId);
      if (!targetVendor) return { success: false, message: 'Target vendor not found for signal.' };

      const completeSignal: TprmMonitoringSignal = {
        id: `SIG-${Date.now()}`,
        tenantId,
        vendorId,
        vendorName: targetVendor.profile.legalName,
        category: signalData.category || 'SECURITY_RATING_CHANGE',
        sourceAttribution: signalData.sourceAttribution || 'SECURITY_SCORECARD_API',
        severity: signalData.severity || 'HIGH',
        eventTimestamp: new Date().toISOString(),
        receivedTimestamp: new Date().toISOString(),
        headline: signalData.headline || 'External Security Signal Detected',
        details: signalData.details || 'Automated sensor detected security observation.',
        observedEvidenceSha256: signalData.observedEvidenceSha256 || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        isActionable: true,
        reassessmentTriggered: false,
        status: 'NEW_UNACKNOWLEDGED'
      };

      const result = tprmIntelligenceEngine.processMonitoringSignal(completeSignal, targetVendor.monitoringSignals);

      if (result.isDuplicate) {
        return { success: false, message: 'Signal skipped: Duplicate event received within 24 hours.' };
      }

      completeSignal.reassessmentTriggered = result.triggerReassessment;

      setVendors(prev =>
        prev.map(v => {
          if (v.id === vendorId) {
            const updatedSignals = [completeSignal, ...v.monitoringSignals];
            let updatedFindings = [...v.findings];

            if (result.suggestedFinding) {
              const newFinding: TprmFindingItem = {
                id: `FND-${Date.now()}`,
                tenantId,
                vendorId: v.id,
                vendorName: v.profile.legalName,
                findingCode: `FND-SIG-${(v.findings.length + 1).toString().padStart(3, '0')}`,
                title: result.suggestedFinding.title || 'Signal Finding',
                description: result.suggestedFinding.description || '',
                severity: result.suggestedFinding.severity || 'HIGH',
                category: result.suggestedFinding.category || 'SECURITY_GAP',
                rootCause: result.suggestedFinding.rootCause || 'External telemetry alert',
                identifiedDate: new Date().toISOString().split('T')[0],
                assignedOwner: 'SecOps Team Lead',
                targetRemediationDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
                status: 'OPEN',
                correctiveActionPlan: 'Investigate telemetry finding and request vendor remediation attestation.',
                compensatingControls: 'Active continuous monitoring and WAF inspection.',
                remediationEvidenceIds: [],
                independentRetestRequired: true
              };
              updatedFindings.unshift(newFinding);
            }

            const updatedVendor = {
              ...v,
              monitoringSignals: updatedSignals,
              findings: updatedFindings
            };

            const updatedSnapshot = tprmIntelligenceEngine.calculateVendorRiskSnapshot(
              updatedVendor,
              updatedVendor.latestRiskSnapshot.factorBreakdown,
              activeMethodology,
              'Automated Signal Engine'
            );

            return {
              ...updatedVendor,
              latestRiskSnapshot: updatedSnapshot,
              updatedAt: new Date().toISOString(),
              version: v.version + 1
            };
          }
          return v;
        })
      );

      return {
        success: true,
        message: `Signal ingested: ${completeSignal.headline}. ${
          result.triggerReassessment ? '⚠️ Automated risk reassessment and finding triggered.' : ''
        }`
      };
    },
    [tenantId, vendors, activeMethodology]
  );

  // --------------------------------------------------------------------------
  // COMPUTED: Executive Command Center Metrics & Concentration Summary
  // --------------------------------------------------------------------------
  const concentrationSummary = tprmIntelligenceEngine.analyzeConcentrationRisk(vendors, fourthPartyNodes);

  const totalVendorsCount = vendors.length;
  const criticalTierVendorsCount = vendors.filter(v => v.relationship.criticalityTier === 'TIER_1_STRATEGIC_CRITICAL').length;
  const vendorsOutsideAppetiteCount = vendors.filter(v => v.latestRiskSnapshot.isOutsideAppetite).length;
  const openFindingsCount = vendors.reduce((acc, v) => acc + v.findings.filter(f => f.status !== 'VERIFIED_CLOSED').length, 0);
  const activeContractsExpiringIn90Days = vendors.reduce(
    (acc, v) => acc + v.activeContracts.filter(c => c.daysUntilExpiry <= 90 && c.status === 'ACTIVE').length,
    0
  );
  const averageControlEffectiveness = Math.round(
    vendors.reduce((acc, v) => acc + v.latestRiskSnapshot.combinedControlEffectiveness, 0) / Math.max(1, vendors.length)
  );

  return {
    vendors,
    selectedVendor,
    selectedVendorId,
    setSelectedVendorId,
    activeTab,
    setActiveTab,
    fourthPartyNodes,
    activeMethodology,
    setActiveMethodology,
    concentrationSummary,
    metrics: {
      totalVendorsCount,
      criticalTierVendorsCount,
      vendorsOutsideAppetiteCount,
      openFindingsCount,
      activeContractsExpiringIn90Days,
      averageControlEffectiveness
    },
    actions: {
      transitionVendorLifecycle,
      recalculateVendorRisk,
      addVendor,
      closeFinding,
      ingestMonitoringSignal
    }
  };
};
