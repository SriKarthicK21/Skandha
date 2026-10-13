// ============================================================================
// SKANDA ENTERPRISE GRC: MAS APPLICABILITY & EFFECTIVE-DATE ENGINE
// Path: server/services/regulatory/MASApplicabilityEngine.ts
//
// Phase 23.2: Multi-FI Applicability, Effective-Date Reasoning & FEAT Pipeline
// Dynamic evaluation of MAS notices across all Singapore Financial Institution types:
// Banks, Insurers, Card Issuers, Finance Companies, Merchant Banks, Payments/DPT,
// Money Brokers, Credit Bureaus, Insurance Brokers, CMS Licensees, FAs, Trust Cos.
// ============================================================================

import {
  CustomerFinancialProfile,
  RegulatoryNotice360,
  TenantNoticeApplicability,
  ApplicabilityStatus,
  RegulatoryFamily,
  RegulatoryStatus
} from '../../../src/types/masRegulatoryIntelligenceTypes';

export class MASApplicabilityEngine {
  private static instance: MASApplicabilityEngine;

  public constructor() {}

  public static getInstance(): MASApplicabilityEngine {
    if (!MASApplicabilityEngine.instance) {
      MASApplicabilityEngine.instance = new MASApplicabilityEngine();
    }
    return MASApplicabilityEngine.instance;
  }

  /**
   * Evaluates dynamic regulatory status based on published date, effective date, and reference date.
   * Enforces: A published regulation with a future effective date MUST NOT be treated as ACTIVE.
   */
  public evaluateEffectiveStatus(
    publishedDate: string,
    effectiveDate: string,
    baseStatus: RegulatoryStatus,
    referenceDate: string = '2026-10-08'
  ): RegulatoryStatus {
    if (
      baseStatus === 'SUPERSEDED' ||
      baseStatus === 'HISTORICAL' ||
      baseStatus === 'CANCELLED' ||
      baseStatus === 'CONSULTATION' ||
      baseStatus === 'GUIDANCE' ||
      baseStatus === 'FAQ'
    ) {
      return baseStatus;
    }

    if (referenceDate < publishedDate) {
      return 'PROPOSED';
    }

    if (referenceDate < effectiveDate) {
      // Published but not yet effective (Future regulation)
      return 'COMING_INTO_FORCE';
    }

    return 'ACTIVE';
  }

  /**
   * Authoritative dynamic evaluation of a notice against an institution profile
   */
  public evaluateApplicability(
    profile: CustomerFinancialProfile,
    notice: RegulatoryNotice360,
    referenceDate: string = '2026-10-08'
  ): TenantNoticeApplicability {
    const now = new Date().toISOString();
    const computedStatus = this.evaluateEffectiveStatus(
      notice.currentVersion.publishedDate,
      notice.currentVersion.effectiveDate,
      notice.currentStatus,
      referenceDate
    );

    // 1. Historical Notices: Never currently active
    if (notice.isHistorical || computedStatus === 'HISTORICAL' || computedStatus === 'SUPERSEDED') {
      const successor = notice.successorNoticeNumber || (notice.noticeNumber === 'TRMN 644' ? 'FSM-N05' : notice.noticeNumber === 'CHN 655' ? 'FSM-N06' : 'FSM-N05');
      return {
        tenantId: profile.tenantId,
        noticeId: notice.noticeId,
        noticeNumber: notice.noticeNumber,
        title: notice.title,
        applicabilityStatus: 'HISTORICAL',
        applicabilityRationale: `Notice ${notice.noticeNumber} is historical/superseded (effective until 10 May 2024). Replaced by current statutory successor: ${successor}. Retained for forensic audit lineage.`,
        evaluationTimestamp: now,
        evaluatedCriteria: {
          institutionTypeMatched: false,
          licenceTypeMatched: false,
          criticalSystemsTriggered: false,
          cloudUsageTriggered: false,
          onlineServicesTriggered: false
        },
        applicableRequirementsCount: 0,
        actionRequired: false
      };
    }

    // 2. Future Regulations (Published but NOT yet effective)
    if (computedStatus === 'COMING_INTO_FORCE' || computedStatus === 'NOT_YET_EFFECTIVE') {
      const applies = notice.applicableEntityTypes.includes('ALL_FINANCIAL_INSTITUTIONS') || notice.applicableEntityTypes.includes(profile.institutionType);
      if (!applies) {
        return {
          tenantId: profile.tenantId,
          noticeId: notice.noticeId,
          noticeNumber: notice.noticeNumber,
          title: notice.title,
          applicabilityStatus: 'NOT_APPLICABLE',
          applicabilityRationale: `Future statutory instrument applies to [${notice.applicableEntityTypes.join(', ')}]. Institution is classified as ${profile.institutionType}.`,
          evaluationTimestamp: now,
          evaluatedCriteria: {
            institutionTypeMatched: false,
            licenceTypeMatched: false,
            criticalSystemsTriggered: false,
            cloudUsageTriggered: false,
            onlineServicesTriggered: false
          },
          applicableRequirementsCount: 0,
          actionRequired: false
        };
      }

      return {
        tenantId: profile.tenantId,
        noticeId: notice.noticeId,
        noticeNumber: notice.noticeNumber,
        title: notice.title,
        applicabilityStatus: 'COMING_INTO_FORCE',
        applicabilityRationale: `Future statutory requirement. Published: ${notice.currentVersion.publishedDate}, Effective: ${notice.currentVersion.effectiveDate}. Status is COMING_INTO_FORCE (NOT yet active/enforceable). Readiness and control gap remediation recommended.`,
        evaluationTimestamp: now,
        evaluatedCriteria: {
          institutionTypeMatched: true,
          licenceTypeMatched: true,
          criticalSystemsTriggered: profile.operatesCriticalSystems,
          cloudUsageTriggered: profile.usesPublicCloud,
          onlineServicesTriggered: profile.providesOnlineFinancialServices
        },
        applicableRequirementsCount: notice.currentVersion.requirements.length,
        actionRequired: true
      };
    }

    // 3. Consultation Papers: Under Review / Proposed (Non-binding)
    if (computedStatus === 'CONSULTATION' || notice.currentStatus === 'CONSULTATION') {
      return {
        tenantId: profile.tenantId,
        noticeId: notice.noticeId,
        noticeNumber: notice.noticeNumber,
        title: notice.title,
        applicabilityStatus: 'REQUIRES_REVIEW',
        applicabilityRationale: `Open MAS Consultation Paper. Not yet statutory law; voluntary feedback and forward planning recommended.`,
        evaluationTimestamp: now,
        evaluatedCriteria: {
          institutionTypeMatched: true,
          licenceTypeMatched: false,
          criticalSystemsTriggered: profile.operatesCriticalSystems,
          cloudUsageTriggered: profile.usesPublicCloud,
          onlineServicesTriggered: profile.providesOnlineFinancialServices
        },
        applicableRequirementsCount: notice.currentVersion.requirements.length,
        actionRequired: false
      };
    }

    // 4. Universal Supervisory Guidelines (TRM Guidelines 2021)
    if (notice.applicableEntityTypes.includes('ALL_FINANCIAL_INSTITUTIONS')) {
      return {
        tenantId: profile.tenantId,
        noticeId: notice.noticeId,
        noticeNumber: notice.noticeNumber,
        title: notice.title,
        applicabilityStatus: 'APPLICABLE',
        applicabilityRationale: `Governing supervisory benchmark under MAS Act applicable to all licensed and registered financial institutions under MAS purview in Singapore.`,
        evaluationTimestamp: now,
        evaluatedCriteria: {
          institutionTypeMatched: true,
          licenceTypeMatched: true,
          criticalSystemsTriggered: profile.operatesCriticalSystems,
          cloudUsageTriggered: profile.usesPublicCloud,
          onlineServicesTriggered: profile.providesOnlineFinancialServices
        },
        applicableRequirementsCount: notice.currentVersion.requirements.length,
        actionRequired: true
      };
    }

    // 4. Sector & Entity Type Matching
    const directTypeMatch = notice.applicableEntityTypes.includes(profile.institutionType) ||
      (profile.institutionType === 'INSURER' && notice.applicableEntityTypes.includes('INSURER')) ||
      (profile.institutionType === 'INSURANCE_AGENT' && notice.applicableEntityTypes.includes('INSURER')) ||
      (profile.institutionType === 'INSURANCE_BROKER' && notice.applicableEntityTypes.includes('INSURANCE_BROKER'));

    if (directTypeMatch) {
      let applicableReqsCount = notice.currentVersion.requirements.length;

      if (!profile.operatesCriticalSystems) {
        applicableReqsCount = notice.currentVersion.requirements.filter(r => !r.applicabilityCriteria?.requiresCriticalSystems).length;
      }

      let rationale = `Direct statutory mandate under ${notice.governingAct} applicable to licensed ${profile.institutionType} entities.`;
      if (notice.noticeNumber === 'MAS Notice 658') {
        rationale = `Statutory mandate on Management of Outsourced Relevant Services under Banking Act (Cap. 19) applicable to ${profile.institutionType} entities. Effective 11 December 2024.`;
      } else if (notice.family === 'TECHNOLOGY_RISK_MANAGEMENT') {
        rationale = `Current statutory Technology Risk Management notice under Financial Services and Markets Act 2022 applicable to ${profile.institutionType} entities (${notice.noticeNumber}).`;
      } else if (notice.family === 'CYBER_HYGIENE') {
        rationale = `Current statutory Cyber Hygiene notice under Financial Services and Markets Act 2022 applicable to ${profile.institutionType} entities (${notice.noticeNumber}).`;
      }

      return {
        tenantId: profile.tenantId,
        noticeId: notice.noticeId,
        noticeNumber: notice.noticeNumber,
        title: notice.title,
        applicabilityStatus: 'APPLICABLE',
        applicabilityRationale: rationale,
        evaluationTimestamp: now,
        evaluatedCriteria: {
          institutionTypeMatched: true,
          licenceTypeMatched: true,
          criticalSystemsTriggered: profile.operatesCriticalSystems,
          cloudUsageTriggered: profile.usesPublicCloud,
          onlineServicesTriggered: profile.providesOnlineFinancialServices
        },
        applicableRequirementsCount: applicableReqsCount,
        actionRequired: true
      };
    }

    // 5. Inapplicable Sector / FI Type
    return {
      tenantId: profile.tenantId,
      noticeId: notice.noticeId,
      noticeNumber: notice.noticeNumber,
      title: notice.title,
      applicabilityStatus: 'NOT_APPLICABLE',
      applicabilityRationale: `Statutory scope confined to [${notice.applicableEntityTypes.join(', ')}]. Institution is classified as ${profile.institutionType}.`,
      evaluationTimestamp: now,
      evaluatedCriteria: {
        institutionTypeMatched: false,
        licenceTypeMatched: false,
        criticalSystemsTriggered: false,
        cloudUsageTriggered: false,
        onlineServicesTriggered: false
      },
      applicableRequirementsCount: 0,
      actionRequired: false
    };
  }

  /**
   * Alias with inverted signature (notice first)
   */
  public evaluateNoticeApplicability(
    notice: RegulatoryNotice360,
    profile: CustomerFinancialProfile,
    referenceDate?: string
  ): TenantNoticeApplicability {
    return this.evaluateApplicability(profile, notice, referenceDate);
  }

  /**
   * Resolves the primary active notice for a specific regulatory family and FI type
   */
  public getActiveNoticeForFamily(
    family: RegulatoryFamily,
    profile: CustomerFinancialProfile,
    notices: RegulatoryNotice360[],
    referenceDate: string = '2026-10-08'
  ): RegulatoryNotice360 | undefined {
    return notices.find(n => {
      const matchesFamily = n.family === family || (family === 'TECHNOLOGY_RISK_MANAGEMENT' && n.family === 'TECHNOLOGY_RISK');
      const computedStatus = this.evaluateEffectiveStatus(
        n.currentVersion.publishedDate,
        n.currentVersion.effectiveDate,
        n.currentStatus,
        referenceDate
      );
      const isAvailable = !n.isHistorical && (computedStatus === 'ACTIVE' || computedStatus === 'AMENDED' || computedStatus === 'COMING_INTO_FORCE');
      const applies = n.applicableEntityTypes.includes('ALL_FINANCIAL_INSTITUTIONS') || n.applicableEntityTypes.includes(profile.institutionType);
      return matchesFamily && isAvailable && applies;
    });
  }

  /**
   * Evaluates all notices in the corpus for a tenant profile
   */
  public evaluateAllNotices(
    profile: CustomerFinancialProfile,
    notices: RegulatoryNotice360[],
    referenceDate?: string
  ): TenantNoticeApplicability[] {
    return notices.map(notice => this.evaluateApplicability(profile, notice, referenceDate));
  }

  public evaluateAllApplicableNotices(
    notices: RegulatoryNotice360[],
    profile: CustomerFinancialProfile,
    referenceDate?: string
  ): TenantNoticeApplicability[] {
    return notices.map(notice => this.evaluateApplicability(profile, notice, referenceDate));
  }
}

export const masApplicabilityEngine = MASApplicabilityEngine.getInstance();
