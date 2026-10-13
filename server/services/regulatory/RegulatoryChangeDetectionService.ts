// ============================================================================
// SKANDA ENTERPRISE GRC: REGULATORY CHANGE DETECTION SERVICE
// Path: server/services/regulatory/RegulatoryChangeDetectionService.ts
//
// Phase 23.1: Continuous Regulatory Delta & Requirement Diff Engine
// Compares upstream versions to compute granular requirement modifications
// Accurately models distinct lifecycles: FSM-N05 (TRM), FSM-N06 (Cyber Hygiene),
// and MAS Notice 658 (Bank Outsourcing).
// ============================================================================

import {
  RegulatoryNotice360,
  RegulatoryVersion,
  RegulatoryChangeEvent,
  RequirementDiff,
  ChangeEventType,
  ImpactLevel
} from '../../../src/types/masRegulatoryIntelligenceTypes';

export class RegulatoryChangeDetectionService {
  private static instance: RegulatoryChangeDetectionService;
  private changeEventLog: RegulatoryChangeEvent[] = [];

  public constructor() {
    this.seedDefaultChangeEvents();
  }

  public static getInstance(): RegulatoryChangeDetectionService {
    if (!RegulatoryChangeDetectionService.instance) {
      RegulatoryChangeDetectionService.instance = new RegulatoryChangeDetectionService();
    }
    return RegulatoryChangeDetectionService.instance;
  }

  /**
   * Compares two versions and returns fine-grained RequirementDiff[]
   */
  public compareVersions(oldVersion: RegulatoryVersion, newVersion: RegulatoryVersion): RequirementDiff[] {
    const diffs: RequirementDiff[] = [];
    const oldMap = new Map(oldVersion.requirements.map(r => [r.requirementId, r]));
    const newMap = new Map(newVersion.requirements.map(r => [r.requirementId, r]));

    for (const [id, nReq] of newMap.entries()) {
      const oReq = oldMap.get(id);
      if (!oReq) {
        diffs.push({
          requirementId: nReq.requirementId,
          sectionCode: nReq.sectionCode,
          title: nReq.title,
          diffType: 'ADDED',
          newText: nReq.description,
          impactLevel: nReq.mandatory ? 'HIGH' : 'MEDIUM',
          affectedControls: nReq.mappedControlCodes,
          affectedPolicies: nReq.mappedPolicyCodes,
          affectedRisks: nReq.mappedRiskCodes,
          affectedEvidenceTypes: ['POLICY_SIGN_OFF', 'TEST_EVIDENCE']
        });
      } else if (oReq.description !== nReq.description || oReq.mandatory !== nReq.mandatory) {
        diffs.push({
          requirementId: nReq.requirementId,
          sectionCode: nReq.sectionCode,
          title: nReq.title,
          diffType: 'MODIFIED',
          oldText: oReq.description,
          newText: nReq.description,
          impactLevel: nReq.mandatory ? 'HIGH' : 'MEDIUM',
          affectedControls: nReq.mappedControlCodes,
          affectedPolicies: nReq.mappedPolicyCodes,
          affectedRisks: nReq.mappedRiskCodes,
          affectedEvidenceTypes: ['POLICY_REVISION', 'EVIDENCE_REFRESH']
        });
      } else {
        diffs.push({
          requirementId: nReq.requirementId,
          sectionCode: nReq.sectionCode,
          title: nReq.title,
          diffType: 'UNCHANGED',
          newText: nReq.description,
          impactLevel: 'LOW',
          affectedControls: nReq.mappedControlCodes,
          affectedPolicies: nReq.mappedPolicyCodes,
          affectedRisks: nReq.mappedRiskCodes,
          affectedEvidenceTypes: []
        });
      }
    }

    for (const [id, oReq] of oldMap.entries()) {
      if (!newMap.has(id)) {
        diffs.push({
          requirementId: oReq.requirementId,
          sectionCode: oReq.sectionCode,
          title: oReq.title,
          diffType: 'REMOVED',
          oldText: oReq.description,
          impactLevel: 'LOW',
          affectedControls: oReq.mappedControlCodes,
          affectedPolicies: oReq.mappedPolicyCodes,
          affectedRisks: oReq.mappedRiskCodes,
          affectedEvidenceTypes: []
        });
      }
    }

    return diffs;
  }

  /**
   * Generates or retrieves change events across all indexed notices
   */
  public generateChangeEvents(notices: RegulatoryNotice360[]): RegulatoryChangeEvent[] {
    const events: RegulatoryChangeEvent[] = [...this.changeEventLog];

    for (const notice of notices) {
      if (notice.historicalVersions && notice.historicalVersions.length > 0) {
        const latestHist = notice.historicalVersions[0];
        const diffs = this.compareVersions(latestHist, notice.currentVersion);
        const hasDiff = diffs.some(d => d.diffType !== 'UNCHANGED');

        if (hasDiff && !events.some(e => e.noticeId === notice.noticeId && e.newVersionId === notice.currentVersion.versionId)) {
          events.push({
            eventId: `EVT-AUTO-${notice.noticeId}-${Date.now()}`,
            noticeId: notice.noticeId,
            noticeNumber: notice.noticeNumber,
            title: notice.title,
            authority: notice.authority,
            family: notice.family,
            eventType: 'NOTICE_AMENDED',
            publishedDate: notice.currentVersion.publishedDate,
            effectiveDate: notice.currentVersion.effectiveDate,
            oldVersionId: latestHist.versionId,
            newVersionId: notice.currentVersion.versionId,
            changeSummary: notice.currentVersion.changeSummary || `Version amendment for ${notice.noticeNumber}`,
            impactLevel: 'HIGH',
            affectedEntityTypes: notice.applicableEntityTypes,
            requirementDiffs: diffs,
            sourceUrl: notice.officialSourceUrl,
            documentSha256: notice.currentVersion.documentHash,
            detectedAt: new Date().toISOString()
          });
        }
      }
    }

    return events;
  }

  public diffNoticeVersions(
    notice: RegulatoryNotice360,
    oldVersion: RegulatoryVersion,
    newVersion: RegulatoryVersion
  ): RegulatoryChangeEvent {
    const now = new Date().toISOString();
    const diffs = this.compareVersions(oldVersion, newVersion);
    const hasCritical = diffs.some(d => d.impactLevel === 'CRITICAL');
    const hasHigh = diffs.some(d => d.impactLevel === 'HIGH');
    const overallImpact: ImpactLevel = hasCritical ? 'CRITICAL' : hasHigh ? 'HIGH' : 'MEDIUM';

    return {
      eventId: `EVT-DIFF-${notice.noticeId}-${Date.now()}`,
      noticeId: notice.noticeId,
      noticeNumber: notice.noticeNumber,
      title: notice.title,
      authority: notice.authority,
      family: notice.family,
      eventType: 'REQUIREMENT_CHANGED',
      publishedDate: newVersion.publishedDate,
      effectiveDate: newVersion.effectiveDate,
      oldVersionId: oldVersion.versionId,
      newVersionId: newVersion.versionId,
      changeSummary: newVersion.changeSummary || `Version diff between ${oldVersion.versionId} and ${newVersion.versionId}`,
      impactLevel: overallImpact,
      affectedEntityTypes: notice.applicableEntityTypes,
      requirementDiffs: diffs,
      sourceUrl: newVersion.sourceUrl,
      documentSha256: newVersion.documentHash,
      detectedAt: now
    };
  }

  private seedDefaultChangeEvents(): void {
    const now = new Date().toISOString();
    this.changeEventLog = [
      {
        eventId: 'EVT-MAS-2026-AI-001',
        noticeId: 'mas-ai-gov-guidelines-2026',
        noticeNumber: 'MAS AI Guidelines',
        title: 'Guidelines on Artificial Intelligence Risk Management and FEAT Governance for Financial Institutions',
        authority: 'MAS',
        family: 'ARTIFICIAL_INTELLIGENCE',
        eventType: 'NEW_NOTICE',
        publishedDate: '2026-10-07',
        effectiveDate: '2027-10-07',
        newVersionId: 'MAS-AI-GOV-V2026.1',
        changeSummary: 'MAS published Guidelines on Artificial Intelligence Risk Management & FEAT Governance (Status: COMING_INTO_FORCE; Effective: 07 Oct 2027). Mandates FEAT governance, GenAI hallucination guardrails, and deterministic AI kill-switches.',
        impactLevel: 'CRITICAL',
        affectedEntityTypes: ['ALL_FINANCIAL_INSTITUTIONS', 'BANK', 'INSURER', 'PAYMENT_SERVICE_PROVIDER', 'CAPITAL_MARKETS_SERVICES'],
        requirementDiffs: [
          {
            requirementId: 'AI-FEAT-REQ-01',
            sectionCode: 'Section 3.1',
            title: 'FEAT Principles Governance & Algorithmic Fairness Assurances',
            diffType: 'ADDED',
            newText: 'FIs must establish documented algorithmic fairness criteria, demographic parity testing, and bias detection for all credit and underwriting AI models.',
            impactLevel: 'HIGH',
            affectedControls: ['FEAT-FAIR-01', 'CTRL-AI-01', 'ISO-A.5.1'],
            affectedPolicies: ['POL-AI-GOV', 'POL-FEAT-01'],
            affectedRisks: ['RSK-AI-BIAS', 'RSK-ETHICS-01'],
            affectedEvidenceTypes: ['AI_FAIRNESS_AUDIT_REPORT', 'FEAT_ATTESTATION']
          },
          {
            requirementId: 'AI-FEAT-REQ-02',
            sectionCode: 'Section 4.2',
            title: 'Generative AI Prompt Injection & Hallucination Guardrails',
            diffType: 'ADDED',
            newText: 'Implement real-time input sanitization, prompt firewalling, output verification, and human-in-the-loop review for high-impact LLM customer advisory workflows.',
            impactLevel: 'CRITICAL',
            affectedControls: ['FEAT-SEC-01', 'CTRL-AI-LLM-01', 'ISO-A.8.28'],
            affectedPolicies: ['POL-GENAI-01'],
            affectedRisks: ['RSK-AI-HALLUCINATION', 'RSK-PROMPT-INJ'],
            affectedEvidenceTypes: ['PROMPT_FIREWALL_LOGS', 'RED_TEAM_GENAI_REPORT']
          }
        ],
        sourceUrl: 'https://www.mas.gov.sg/regulation/guidelines/ai-risk-management-feat-guidelines',
        documentSha256: '6f8e7d6c5b4a3928170e9f8e7d6c5b4a3928170e9f8e7d6c5b4a3928170e9f8e',
        detectedAt: now
      },
      {
        eventId: 'EVT-MAS-2024-FSM05-002',
        noticeId: 'mas-notice-fsm-n05',
        noticeNumber: 'FSM-N05',
        title: 'Notice on Technology Risk Management under FSM Act 2022',
        authority: 'MAS',
        family: 'TECHNOLOGY_RISK_MANAGEMENT',
        eventType: 'NEW_NOTICE',
        publishedDate: '2024-04-10',
        effectiveDate: '2024-05-10',
        newVersionId: 'FSM-N05-V2024.1',
        changeSummary: 'Enacted under Financial Services and Markets Act 2022 to establish binding technology risk management requirements for banks, succeeding TRMN 644.',
        impactLevel: 'HIGH',
        affectedEntityTypes: ['ALL_FINANCIAL_INSTITUTIONS', 'BANK', 'MERCHANT_BANK', 'PAYMENT_SERVICE_PROVIDER', 'DIGITAL_TOKEN_SERVICE'],
        requirementDiffs: [
          {
            requirementId: 'FSM-REQ-01',
            sectionCode: 'Section 4.1',
            title: 'Oversight of Technology Risk by Board of Directors & Senior Management',
            diffType: 'ADDED',
            newText: 'The Board of Directors and senior management must maintain comprehensive oversight of technology risk governance, risk appetite, and independent risk management reviews.',
            impactLevel: 'HIGH',
            affectedControls: ['MAS-TRM-1.1', 'MAS-TRM-1.2', 'CTRL-GOV-01', 'ISO-A.5.1'],
            affectedPolicies: ['POL-GOV-01', 'POL-TECH-RISK'],
            affectedRisks: ['RSK-GOV-01', 'RSK-STRAT-02'],
            affectedEvidenceTypes: ['BOARD_MINUTES', 'TRM_APPETITE_DOC']
          },
          {
            requirementId: 'FSM-REQ-02',
            sectionCode: 'Section 5.1',
            title: 'High Availability & Maximum Unscheduled Downtime Limit (4h / 12m)',
            diffType: 'ADDED',
            newText: 'The financial institution must ensure that the total unscheduled downtime for each critical system does not exceed 4 hours within any 12-month period.',
            impactLevel: 'HIGH',
            affectedControls: ['MAS-TRM-8.1', 'MAS-TRM-8.2', 'CTRL-BCP-01', 'ISO-A.8.14'],
            affectedPolicies: ['POL-BCP-01', 'POL-DR-01'],
            affectedRisks: ['RSK-OPS-01', 'RSK-AVAIL-01'],
            affectedEvidenceTypes: ['UPTIME_REPORTS', 'SLA_LOGS']
          }
        ],
        sourceUrl: 'https://www.mas.gov.sg/regulation/notices/fsm-n05-technology-risk-management',
        documentSha256: 'a89c72e411b4395e9f878f1498b2cd78a87c1409c9164b387e0766b1d4289871',
        detectedAt: now
      },
      {
        eventId: 'EVT-MAS-2024-FSM06-003',
        noticeId: 'mas-notice-fsm-n06',
        noticeNumber: 'FSM-N06',
        title: 'Notice on Cyber Hygiene under FSM Act 2022',
        authority: 'MAS',
        family: 'CYBER_HYGIENE',
        eventType: 'NEW_NOTICE',
        publishedDate: '2024-04-10',
        effectiveDate: '2024-05-10',
        newVersionId: 'FSM-N06-V2024.1',
        changeSummary: 'Enacted under FSM Act 2022 to establish binding baseline cyber hygiene for banks, formally succeeding CHN 655.',
        impactLevel: 'HIGH',
        affectedEntityTypes: ['ALL_FINANCIAL_INSTITUTIONS', 'BANK', 'MERCHANT_BANK'],
        requirementDiffs: [
          {
            requirementId: 'FSM6-REQ-01',
            sectionCode: 'Clause 4(a)',
            title: 'Administrative Account Security & Least Privilege',
            diffType: 'ADDED',
            newText: 'Establish strong administrative account controls, secure privileged access workstations, and restrict administrative access.',
            impactLevel: 'HIGH',
            affectedControls: ['MAS-TRM-5.1', 'CTRL-IAM-01', 'ISO-A.8.2'],
            affectedPolicies: ['POL-IAM-01'],
            affectedRisks: ['RSK-PRIV-01'],
            affectedEvidenceTypes: ['IAM_ADMIN_AUDIT', 'PAM_EVIDENCE']
          }
        ],
        sourceUrl: 'https://www.mas.gov.sg/regulation/notices/fsm-n06-cyber-hygiene',
        documentSha256: 'b381a9947c01fe2a8b9401928374918273948172938471928374918273948172',
        detectedAt: now
      },
      {
        eventId: 'EVT-MAS-2024-N658-004',
        noticeId: 'mas-notice-658',
        noticeNumber: 'MAS Notice 658',
        title: 'Notice on Management of Outsourced Relevant Services for Banks',
        authority: 'MAS',
        family: 'THIRD_PARTY_RISK',
        eventType: 'NEW_NOTICE',
        publishedDate: '2024-03-11',
        effectiveDate: '2024-12-11',
        newVersionId: 'NOTICE-658-V2024.1',
        changeSummary: 'Mandates comprehensive governance, due diligence, register maintenance, and audit rights for outsourced relevant services in banks under Banking Act (Effective 11 December 2024).',
        impactLevel: 'CRITICAL',
        affectedEntityTypes: ['BANK', 'MERCHANT_BANK'],
        requirementDiffs: [
          {
            requirementId: 'N658-REQ-01',
            sectionCode: 'Section 4',
            title: 'Register of Outsourced Relevant Services',
            diffType: 'ADDED',
            newText: 'A bank must establish and maintain an up-to-date register of all outsourced relevant services, classifying material versus non-material arrangements.',
            impactLevel: 'CRITICAL',
            affectedControls: ['MAS-TRM-12.1', 'CTRL-TPRM-01'],
            affectedPolicies: ['POL-OUTSOURCE-01'],
            affectedRisks: ['RSK-TPRM-01'],
            affectedEvidenceTypes: ['OUTSOURCING_REGISTER', 'TPRM_ASSESSMENT']
          }
        ],
        sourceUrl: 'https://www.mas.gov.sg/regulation/notices/notice-658-outsourcing',
        documentSha256: 'c94f0898687b6495e865882645b91b874457a1b5c8294719b524795271849182',
        detectedAt: now
      },
      {
        eventId: 'EVT-MAS-2025-RES-005',
        noticeId: 'mas-consult-op-res-2025',
        noticeNumber: 'MAS Consultation P004-2025',
        title: 'Consultation Paper on Operational Resilience for Financial Institutions',
        authority: 'MAS',
        family: 'OPERATIONAL_RESILIENCE',
        eventType: 'CONSULTATION_PUBLISHED',
        publishedDate: '2025-06-01',
        effectiveDate: '2026-12-31',
        newVersionId: 'MAS-CONSULT-P004-2025-V1',
        changeSummary: 'MAS opened formal public consultation on setting binding impact tolerances and severe disruption scenario testing.',
        impactLevel: 'MEDIUM',
        affectedEntityTypes: ['ALL_FINANCIAL_INSTITUTIONS', 'BANK', 'INSURER'],
        requirementDiffs: [
          {
            requirementId: 'CONS-OPR-01',
            sectionCode: 'Proposal 1',
            title: 'Impact Tolerances for Critical Business Services',
            diffType: 'ADDED',
            newText: 'FIs must define quantifiable impact tolerances (maximum acceptable disruption time and data loss) for all core business functions.',
            impactLevel: 'HIGH',
            affectedControls: ['MAS-TRM-8.2', 'CTRL-BCP-02'],
            affectedPolicies: ['POL-BCP-01'],
            affectedRisks: ['RSK-OPS-02'],
            affectedEvidenceTypes: ['BCP_IMPACT_TOLERANCE_STUDY']
          }
        ],
        sourceUrl: 'https://www.mas.gov.sg/publications/consultations/2025/consultation-on-operational-resilience',
        documentSha256: '5819283749182739481729384719283749182739481729384719283749182739',
        detectedAt: now
      }
    ];
  }

  public recordChangeEvent(event: RegulatoryChangeEvent): void {
    if (!this.changeEventLog.some(e => e.eventId === event.eventId)) {
      this.changeEventLog.unshift(event);
    }
  }

  public getChangeEvents(): RegulatoryChangeEvent[] {
    return [...this.changeEventLog];
  }
}

export const regulatoryChangeDetectionService = RegulatoryChangeDetectionService.getInstance();
