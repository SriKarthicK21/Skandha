// Skanda GRC — Compliance Overlay Service
// Bridges ReportsAnalyticsModule domain maturity scores & benchmarks
// into the Departmental Compliance Heatmap matrix.

import type { HeatmapCellData } from './complianceHeatmapService';

export interface ReportsDomainMaturityBenchmark {
  domain: string;
  short: string;
  implemented: number; // 0 - 100
  inProgress: number;
  benchmark: number; // e.g. 85
  totalControls: number;
  evidenceCount: number;
}

// Authoritative Domain Maturity Benchmarks from ReportsAnalyticsModule
export const REPORTS_DOMAIN_MATURITY_BENCHMARKS: Record<string, ReportsDomainMaturityBenchmark> = {
  'A.5': {
    domain: 'Annex A.5 Organizational Controls',
    short: 'A.5 Org',
    implemented: 88,
    inProgress: 12,
    benchmark: 85,
    totalControls: 37,
    evidenceCount: 42
  },
  'A.6': {
    domain: 'Annex A.6 People Security',
    short: 'A.6 People',
    implemented: 75,
    inProgress: 25,
    benchmark: 85,
    totalControls: 8,
    evidenceCount: 14
  },
  'A.7': {
    domain: 'Annex A.7 Physical Security',
    short: 'A.7 Physical',
    implemented: 92,
    inProgress: 8,
    benchmark: 85,
    totalControls: 14,
    evidenceCount: 18
  },
  'A.8': {
    domain: 'Annex A.8 Technological Controls',
    short: 'A.8 Tech',
    implemented: 78,
    inProgress: 22,
    benchmark: 85,
    totalControls: 34,
    evidenceCount: 56
  },
  'CORE': {
    domain: 'Clauses 4-10 ISMS Governance Core',
    short: 'Clauses 4-10',
    implemented: 90,
    inProgress: 10,
    benchmark: 85,
    totalControls: 7,
    evidenceCount: 22
  },
  'VENDOR': {
    domain: 'Vendor Risk & Third-Party Management',
    short: 'Vendor Risk',
    implemented: 82,
    inProgress: 18,
    benchmark: 85,
    totalControls: 6,
    evidenceCount: 15
  },
  'MAS_GOV': {
    domain: 'MAS TRM Domain 01: IT Governance',
    short: 'MAS Gov',
    implemented: 84,
    inProgress: 16,
    benchmark: 80,
    totalControls: 12,
    evidenceCount: 20
  },
  'MAS_ACCESS': {
    domain: 'MAS TRM Domain 06: Access Control & Identity',
    short: 'MAS Access',
    implemented: 86,
    inProgress: 14,
    benchmark: 85,
    totalControls: 18,
    evidenceCount: 30
  },
  'MAS_CYBER': {
    domain: 'MAS TRM Domain 08: Cyber Threat Defense',
    short: 'MAS Cyber',
    implemented: 76,
    inProgress: 24,
    benchmark: 85,
    totalControls: 16,
    evidenceCount: 25
  },
  'MAS_CLOUD': {
    domain: 'MAS TRM Domain 14: Cloud & Outsourcing Security',
    short: 'MAS Cloud',
    implemented: 80,
    inProgress: 20,
    benchmark: 80,
    totalControls: 14,
    evidenceCount: 22
  },
  'PIMS': {
    domain: 'ISO 27701 Privacy Information Management System',
    short: 'PIMS Core',
    implemented: 81,
    inProgress: 19,
    benchmark: 80,
    totalControls: 31,
    evidenceCount: 38
  }
};

export interface ComplianceOverlayResult {
  maturityScore: number; // 0 - 100
  rawRiskScore: number; // 0 - 100
  variance: number; // maturityScore - rawRiskScore
  maturityLevel: string; // e.g. "Level 4: Quantitatively Managed"
  maturityTier: 1 | 2 | 3 | 4 | 5;
  domainBenchmark: number;
  reportsDomainTitle: string;
  auditReadinessStatus: 'AUDIT_READY' | 'ON_TRACK' | 'ATTENTION_REQUIRED' | 'NON_COMPLIANT';
  bgClass: string;
  badgeClass: string;
}

export class ComplianceOverlayService {
  /**
   * Resolves the corresponding ReportsAnalyticsModule domain for a given Heatmap cell target code
   */
  public static mapTargetCodeToReportsDomain(
    dimensionType: 'ISO_27001' | 'MAS_TRM' | 'ISO_27701',
    targetCode: string
  ): ReportsDomainMaturityBenchmark {
    if (dimensionType === 'ISO_27701' || targetCode.includes('PIMS') || targetCode.includes('7.')) {
      return REPORTS_DOMAIN_MATURITY_BENCHMARKS['PIMS'];
    }

    if (dimensionType === 'MAS_TRM' || targetCode.startsWith('DOM-') || targetCode.startsWith('MAS-')) {
      if (targetCode.includes('01') || targetCode.includes('02') || targetCode.includes('03')) {
        return REPORTS_DOMAIN_MATURITY_BENCHMARKS['MAS_GOV'];
      }
      if (targetCode.includes('06') || targetCode.includes('07')) {
        return REPORTS_DOMAIN_MATURITY_BENCHMARKS['MAS_ACCESS'];
      }
      if (targetCode.includes('08') || targetCode.includes('09') || targetCode.includes('10')) {
        return REPORTS_DOMAIN_MATURITY_BENCHMARKS['MAS_CYBER'];
      }
      return REPORTS_DOMAIN_MATURITY_BENCHMARKS['MAS_CLOUD'];
    }

    // ISO 27001 clauses
    if (targetCode.startsWith('A.5') || targetCode.includes('5.')) {
      return REPORTS_DOMAIN_MATURITY_BENCHMARKS['A.5'];
    }
    if (targetCode.startsWith('A.6') || targetCode.includes('6.')) {
      return REPORTS_DOMAIN_MATURITY_BENCHMARKS['A.6'];
    }
    if (targetCode.startsWith('A.7') || targetCode.includes('7.')) {
      return REPORTS_DOMAIN_MATURITY_BENCHMARKS['A.7'];
    }
    if (targetCode.startsWith('A.8') || targetCode.includes('8.')) {
      return REPORTS_DOMAIN_MATURITY_BENCHMARKS['A.8'];
    }
    if (targetCode.includes('CL-') || targetCode.includes('Clause') || targetCode.includes('4.') || targetCode.includes('9.') || targetCode.includes('10.')) {
      return REPORTS_DOMAIN_MATURITY_BENCHMARKS['CORE'];
    }

    return REPORTS_DOMAIN_MATURITY_BENCHMARKS['VENDOR'];
  }

  /**
   * Calculates the exact compliance maturity overlay score for a heatmap cell,
   * harmonizing department execution with ReportsAnalyticsModule domain benchmarks.
   */
  public static calculateOverlayScore(
    cell: HeatmapCellData,
    theme: 'light' | 'dark' = 'dark'
  ): ComplianceOverlayResult {
    const domainMeta = this.mapTargetCodeToReportsDomain(cell.dimensionType, cell.targetCode);
    const rawScore = cell.score;

    // Weighting: 65% domain benchmark maturity from ReportsAnalyticsModule + 35% localized departmental execution
    const weightedMaturity = Math.round(domainMeta.implemented * 0.65 + rawScore * 0.35);

    // Maturity Tier (CMMI Level 1 to 5)
    let maturityTier: 1 | 2 | 3 | 4 | 5 = 3;
    let maturityLevel = 'Level 3: Defined';
    let auditReadinessStatus: 'AUDIT_READY' | 'ON_TRACK' | 'ATTENTION_REQUIRED' | 'NON_COMPLIANT' = 'ON_TRACK';

    if (weightedMaturity >= 90) {
      maturityTier = 5;
      maturityLevel = 'Level 5: Optimizing';
      auditReadinessStatus = 'AUDIT_READY';
    } else if (weightedMaturity >= 82) {
      maturityTier = 4;
      maturityLevel = 'Level 4: Quantitatively Managed';
      auditReadinessStatus = 'AUDIT_READY';
    } else if (weightedMaturity >= 70) {
      maturityTier = 3;
      maturityLevel = 'Level 3: Defined';
      auditReadinessStatus = 'ON_TRACK';
    } else if (weightedMaturity >= 55) {
      maturityTier = 2;
      maturityLevel = 'Level 2: Managed';
      auditReadinessStatus = 'ATTENTION_REQUIRED';
    } else {
      maturityTier = 1;
      maturityLevel = 'Level 1: Initial';
      auditReadinessStatus = 'NON_COMPLIANT';
    }

    // Color styles for maturity overlay
    let bgClass = '';
    let badgeClass = '';

    if (maturityTier >= 4) {
      // Level 4 & 5 (High Maturity)
      bgClass = theme === 'light'
        ? 'bg-indigo-50/95 text-indigo-950 border-indigo-300 hover:bg-indigo-100 shadow-xs'
        : 'bg-indigo-950/60 text-indigo-200 border-indigo-500/50 hover:bg-indigo-900/70 hover:border-indigo-400';
      badgeClass = 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30';
    } else if (maturityTier === 3) {
      // Level 3 (Defined / On Track)
      bgClass = theme === 'light'
        ? 'bg-sky-50/95 text-sky-950 border-sky-300 hover:bg-sky-100 shadow-xs'
        : 'bg-sky-950/50 text-sky-200 border-sky-500/40 hover:bg-sky-900/60 hover:border-sky-400';
      badgeClass = 'bg-sky-500/20 text-sky-300 border border-sky-500/30';
    } else if (maturityTier === 2) {
      // Level 2 (Managed / Needs Attention)
      bgClass = theme === 'light'
        ? 'bg-amber-50/95 text-amber-950 border-amber-300 hover:bg-amber-100 shadow-xs'
        : 'bg-amber-950/50 text-amber-200 border-amber-500/40 hover:bg-amber-900/60 hover:border-amber-400';
      badgeClass = 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
    } else {
      // Level 1 (Initial / Non-Compliant)
      bgClass = theme === 'light'
        ? 'bg-rose-50 text-rose-950 border-rose-300 hover:bg-rose-100 shadow-xs'
        : 'bg-rose-950/60 text-rose-200 border-rose-500/60 hover:bg-rose-900/80 hover:border-rose-400';
      badgeClass = 'bg-rose-500/20 text-rose-300 border border-rose-500/30';
    }

    return {
      maturityScore: weightedMaturity,
      rawRiskScore: rawScore,
      variance: weightedMaturity - rawScore,
      maturityLevel,
      maturityTier,
      domainBenchmark: domainMeta.benchmark,
      reportsDomainTitle: domainMeta.domain,
      auditReadinessStatus,
      bgClass,
      badgeClass
    };
  }
}
