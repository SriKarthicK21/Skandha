// Skanda Enterprise GRC — Enterprise Risk Engine
// Domain-Driven Core Engine for Technology Risk Management & Multi-Framework Exposure
// Authoritative Grounding: MAS Technology Risk Management (TRM) Guidelines 2021, Notice 644, Notice 655, ISO 27005:2022
// Integrates Technology Risks with MAS TRM Requirement IDs to calculate Exposure Metrics and Heatmap Overlays.

import {
  RiskRecord,
  RiskFrameworkMapping,
  MASTrmRiskExposure,
  MASDomainExposureMetrics,
  MASEnterpriseRiskProfile,
  MASRiskExposureTier
} from '../types';
import { RegulatoryRequirement } from '../types/regulatoryTypes';
import { MASTechnologyRiskItem } from '../types/masTrmFrameworkTypes';
import { MAS_TRM_REQUIREMENTS_2021 } from '../data/masTRMRequirements2021';

export interface MASRequirementMappingSuggestion {
  requirementId: string;
  requirementCode: string;
  domainNumber: string;
  domainName: string;
  title: string;
  confidence: number; // 0 - 100%
  rationale: string;
  isStatutoryMandate: boolean;
}

export interface RiskExposureEvaluationOptions {
  includeInactive?: boolean;
  applyStatutoryWeighting?: boolean;
  customStatutoryMultiplier?: number;
}

/**
 * MAS-Specific Exposure Metrics for an individual cell in a 5x5 Risk Heatmap (Likelihood x Impact)
 */
export interface HeatmapCellMasExposure {
  likelihood: number; // 1-5
  impact: number;     // 1-5
  score: number;      // likelihood * impact (1-25)
  totalRisks: number;
  technologyRisksCount: number;
  mappedTechnologyRisksCount: number;
  unmappedTechnologyRisksCount: number;
  masExposureScore: number; // 0-100 normalized MAS exposure score
  exposureTier: MASRiskExposureTier;
  isStatutoryNotice644Exposed: boolean; // MAS Notice 644 Critical Systems
  isStatutoryNotice655Exposed: boolean; // MAS Notice 655 Cyber Hygiene
  isStatutoryExposed: boolean;
  mappedRequirementCodes: string[];
  mappedRequirementIds: string[];
  mappedRequirementTitles: string[];
  affectedDomainNumbers: string[];
  topRiskCodes: string[];
  unmitigatedCount: number;
}

/**
 * Full 5x5 Heatmap Matrix MAS Exposure Grid
 */
export interface HeatmapMasExposureGrid {
  matrix: Record<string, HeatmapCellMasExposure>; // Key: `${likelihood}-${impact}`
  criticalExposureCellsCount: number;
  highExposureCellsCount: number;
  statutoryExposedCellsCount: number;
  totalRisksInGrid: number;
  totalTechnologyRisks: number;
  totalMappedTechnologyRisks: number;
  gridAverageExposureScore: number;
  maxCellExposureScore: number;
}

export class RiskEngine {
  private static requirementsCache: Map<string, RegulatoryRequirement> = new Map(
    MAS_TRM_REQUIREMENTS_2021.map(req => [req.id, req])
  );

  /**
   * Retrieves all available MAS TRM Requirements
   */
  public static getAllMasRequirements(): RegulatoryRequirement[] {
    return MAS_TRM_REQUIREMENTS_2021;
  }

  /**
   * Retrieves a specific MAS TRM Requirement by ID or Requirement Code,
   * supporting both REQ-MAS-X.Y and MAS-TRM-X.Y formats.
   */
  public static getMasRequirementById(idOrCode: string): RegulatoryRequirement | undefined {
    if (!idOrCode) return undefined;
    const direct = this.requirementsCache.get(idOrCode);
    if (direct) return direct;

    const trimmed = idOrCode.trim();
    // Direct match
    const found = MAS_TRM_REQUIREMENTS_2021.find(
      r => r.id.toLowerCase() === trimmed.toLowerCase() ||
           r.requirementCode.toLowerCase() === trimmed.toLowerCase()
    );
    if (found) return found;

    // Normalize REQ-MAS-X.Y <-> MAS-TRM-X.Y
    const normalizedAsReq = trimmed.replace(/^MAS-TRM-/, 'REQ-MAS-');
    const normalizedAsCode = trimmed.replace(/^REQ-MAS-/, 'MAS-TRM-');
    const matchedNorm = MAS_TRM_REQUIREMENTS_2021.find(
      r => r.id.toLowerCase() === normalizedAsReq.toLowerCase() ||
           r.requirementCode.toLowerCase() === normalizedAsCode.toLowerCase()
    );
    if (matchedNorm) return matchedNorm;

    // Check by section number e.g. "8.2" or "TRM 8.2"
    const sectionMatch = trimmed.match(/(\d+\.\d+)/);
    if (sectionMatch) {
      const secNum = sectionMatch[1];
      const matchSec = MAS_TRM_REQUIREMENTS_2021.find(r => r.sectionNumber === secNum);
      if (matchSec) return matchSec;
    }

    return undefined;
  }

  /**
   * Identifies whether a given risk is categorized as an enterprise Technology Risk
   */
  public static isTechnologyRisk(risk: Partial<RiskRecord | MASTechnologyRiskItem>): boolean {
    if (!risk) return false;
    const cat = (risk.category || '').toLowerCase();
    const dept = ((risk as RiskRecord).department || '').toLowerCase();
    const code = (risk.riskCode || '').toUpperCase();

    if (
      cat === 'information security' ||
      cat === 'asset' ||
      cat === 'process' ||
      cat === 'vendor' ||
      cat === 'cyber' ||
      cat === 'availability' ||
      cat === 'resilience' ||
      cat === 'infrastructure' ||
      cat === 'application' ||
      cat === 'cloud' ||
      cat === 'data' ||
      cat === 'access' ||
      cat === 'sdlc' ||
      cat === 'operational'
    ) {
      return true;
    }

    if (
      dept.includes('tech') ||
      dept.includes('devops') ||
      dept.includes('it') ||
      dept.includes('cyber') ||
      dept.includes('security') ||
      dept.includes('infrastructure') ||
      dept.includes('engineering') ||
      dept.includes('cloud') ||
      dept.includes('software') ||
      dept.includes('information')
    ) {
      return true;
    }

    if (code.startsWith('TRSK') || code.startsWith('RSK')) {
      return true;
    }

    const fw = (risk as RiskRecord).frameworkMappings;
    if (
      (fw?.masTrmRequirementIds && fw.masTrmRequirementIds.length > 0) ||
      (fw?.masTrmSections && fw.masTrmSections.length > 0) ||
      (fw?.iso27001Controls && fw.iso27001Controls.length > 0)
    ) {
      return true;
    }

    return false;
  }

  /**
   * Filters and returns all existing Technology Risks from an enterprise risk set
   */
  public static filterTechnologyRisks(risks: RiskRecord[]): RiskRecord[] {
    return risks.filter(r => this.isTechnologyRisk(r));
  }

  /**
   * Returns technology risks that do not yet have specific MAS TRM requirement IDs mapped
   */
  public static getUnmappedTechnologyRisks(risks: RiskRecord[]): RiskRecord[] {
    return this.filterTechnologyRisks(risks).filter(r => {
      const ids = r.frameworkMappings?.masTrmRequirementIds || [];
      return ids.length === 0;
    });
  }

  /**
   * Converts a MASTechnologyRiskItem into a full RiskRecord
   */
  public static convertMasTechRiskToRiskRecord(
    masRisk: MASTechnologyRiskItem,
    tenantId: string = 'tenant_apex'
  ): RiskRecord {
    const defaultMasReqs = masRisk.masRequirementIds || (masRisk.masRequirementCodes ? masRisk.masRequirementCodes.map(c => c.replace('MAS-TRM-', 'REQ-MAS-')) : []);
    const sections: string[] = [];
    if (masRisk.masTrmSection) sections.push(masRisk.masTrmSection);
    defaultMasReqs.forEach(reqId => {
      const req = this.getMasRequirementById(reqId);
      if (req) {
        sections.push(`MAS TRM ${req.sectionNumber}`);
        if (req.criticalSystemsMandate) sections.push('MAS Notice 644');
      }
    });

    const isoControls: string[] = [];
    if (masRisk.isoControlMapping) {
      const match = masRisk.isoControlMapping.match(/A\.\d+\.\d+/);
      if (match) isoControls.push(match[0]);
    }

    return {
      id: masRisk.id,
      tenantId,
      riskCode: masRisk.riskCode,
      title: masRisk.title,
      category: 'Information Security',
      linkedItem: masRisk.relatedAssetName || masRisk.relatedBusinessService || 'Core Banking',
      department: 'Technology Risk & Cyber Operations',
      threatDescription: masRisk.threatDescription,
      vulnerabilityDescription: masRisk.vulnerabilityDescription,
      likelihood: masRisk.likelihood,
      impact: masRisk.impact,
      inherentScore: masRisk.inherentScore || (masRisk.likelihood * masRisk.impact),
      treatmentOption: masRisk.treatmentOption,
      mitigationControl: masRisk.mitigationControl,
      treatmentOwner: masRisk.owner,
      targetDate: masRisk.targetDate,
      residualLikelihood: masRisk.residualLikelihood,
      residualImpact: masRisk.residualImpact,
      residualScore: masRisk.residualScore || (masRisk.residualLikelihood * masRisk.residualImpact),
      status: masRisk.status,
      escalatedToSuperAdmin: masRisk.inherentScore >= 16,
      frameworkMappings: {
        iso27001Controls: isoControls,
        iso42001Controls: [],
        masTrmSections: Array.from(new Set(sections)),
        masTrmRequirementIds: Array.from(new Set(defaultMasReqs))
      },
      controlEffectiveness: masRisk.residualScore < masRisk.inherentScore ? 88 : 50
    };
  }

  /**
   * Suggests MAS TRM requirement IDs for a given Technology Risk based on threat description,
   * ISO control cross-walks, category, and keywords.
   */
  public static suggestMasRequirementMappings(
    risk: Partial<RiskRecord | MASTechnologyRiskItem>
  ): MASRequirementMappingSuggestion[] {
    const suggestions: MASRequirementMappingSuggestion[] = [];
    const textBlob = `${risk.title || ''} ${risk.threatDescription || ''} ${risk.vulnerabilityDescription || ''} ${risk.mitigationControl || ''} ${risk.category || ''}`.toLowerCase();
    const existingIsoControls = (risk as RiskRecord).frameworkMappings?.iso27001Controls || [];

    for (const req of MAS_TRM_REQUIREMENTS_2021) {
      let score = 0;
      const reasons: string[] = [];

      // 1. Check ISO 27001 Cross-Framework synergies
      if (req.crossFrameworkMappings?.iso27001 && existingIsoControls.length > 0) {
        const overlap = req.crossFrameworkMappings.iso27001.filter(c => existingIsoControls.includes(c));
        if (overlap.length > 0) {
          score += 45;
          reasons.push(`Direct ISO 27001 crosswalk match on controls: ${overlap.join(', ')}`);
        }
      }

      // 2. Keyword heuristics per MAS domain
      const reqKeywords = [
        ...req.title.toLowerCase().split(/\s+/),
        req.domainName.toLowerCase(),
        req.sectionNumber
      ];

      // Domain-specific intelligence
      if (req.domainNumber === '8.0' && (textBlob.includes('privileged') || textBlob.includes('access') || textBlob.includes('iam') || textBlob.includes('mfa') || textBlob.includes('credential') || textBlob.includes('password'))) {
        score += 35;
        reasons.push('Matches Access Control / Privileged IAM keywords (Notice 655)');
      }
      if (req.domainNumber === '12.0' && (textBlob.includes('incident') || textBlob.includes('siem') || textBlob.includes('breach') || textBlob.includes('log') || textBlob.includes('soc') || textBlob.includes('alert'))) {
        score += 35;
        reasons.push('Matches Cyber Incident & Monitoring keywords (Notice 644)');
      }
      if (req.domainNumber === '14.0' && (textBlob.includes('disaster') || textBlob.includes('outage') || textBlob.includes('recovery') || textBlob.includes('rto') || textBlob.includes('rpo') || textBlob.includes('downtime') || textBlob.includes('backup'))) {
        score += 35;
        reasons.push('Matches Operational Resilience & Disaster Recovery keywords');
      }
      if (req.domainNumber === '13.0' && (textBlob.includes('vendor') || textBlob.includes('third-party') || textBlob.includes('supplier') || textBlob.includes('outsourcing') || textBlob.includes('subcontractor'))) {
        score += 35;
        reasons.push('Matches Third-Party & Outsourcing Risk keywords');
      }
      if (req.domainNumber === '9.0' && (textBlob.includes('encrypt') || textBlob.includes('crypto') || textBlob.includes('key management') || textBlob.includes('certificate') || textBlob.includes('tls'))) {
        score += 35;
        reasons.push('Matches Cryptography & Key Management keywords');
      }
      if (req.domainNumber === '6.0' && (textBlob.includes('patch') || textBlob.includes('vulnerability') || textBlob.includes('asset') || textBlob.includes('configuration'))) {
        score += 30;
        reasons.push('Matches Asset, Patch & Configuration keywords');
      }
      if (req.domainNumber === '7.0' && (textBlob.includes('sdlc') || textBlob.includes('code') || textBlob.includes('pipeline') || textBlob.includes('software') || textBlob.includes('sql injection') || textBlob.includes('owasp'))) {
        score += 30;
        reasons.push('Matches Software Security & SDLC keywords');
      }
      if (req.domainNumber === '5.0' && (textBlob.includes('cloud') || textBlob.includes('aws') || textBlob.includes('azure') || textBlob.includes('infrastructure'))) {
        score += 25;
        reasons.push('Matches Cloud & Infrastructure Strategy keywords');
      }

      // Title direct match
      if (textBlob.includes(req.title.toLowerCase().slice(0, 15))) {
        score += 20;
        reasons.push('Direct requirement title correlation');
      }

      if (score >= 35) {
        suggestions.push({
          requirementId: req.id,
          requirementCode: req.requirementCode,
          domainNumber: req.domainNumber,
          domainName: req.domainName,
          title: req.title,
          confidence: Math.min(98, score),
          rationale: reasons.join('; '),
          isStatutoryMandate: Boolean(req.mandatoryForFIs || req.criticalSystemsMandate)
        });
      }
    }

    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Maps a Technology Risk to a specific MAS TRM Requirement ID
   */
  public static mapRiskToMasRequirement(
    risk: RiskRecord,
    requirementId: string
  ): RiskRecord {
    const existingMappings = risk.frameworkMappings || {
      iso27001Controls: [],
      iso42001Controls: [],
      masTrmSections: [],
      masTrmRequirementIds: []
    };

    const currentReqIds = new Set(existingMappings.masTrmRequirementIds || []);
    currentReqIds.add(requirementId);

    // Also synchronize masTrmSections if applicable
    const req = this.getMasRequirementById(requirementId);
    const currentSections = new Set(existingMappings.masTrmSections || []);
    if (req) {
      currentSections.add(`MAS TRM ${req.sectionNumber}`);
      if (req.criticalSystemsMandate) {
        currentSections.add('MAS Notice 644');
      }
      if (req.domainNumber === '8.0' || req.domainNumber === '9.0') {
        currentSections.add('MAS Notice 655 (Cyber Hygiene)');
      }
    }

    return {
      ...risk,
      frameworkMappings: {
        ...existingMappings,
        masTrmRequirementIds: Array.from(currentReqIds),
        masTrmSections: Array.from(currentSections)
      }
    };
  }

  /**
   * Unmaps a Technology Risk from a specific MAS TRM Requirement ID
   */
  public static unmapRiskFromMasRequirement(
    risk: RiskRecord,
    requirementId: string
  ): RiskRecord {
    if (!risk.frameworkMappings || !risk.frameworkMappings.masTrmRequirementIds) {
      return risk;
    }

    const updatedReqIds = risk.frameworkMappings.masTrmRequirementIds.filter(id => id !== requirementId);

    return {
      ...risk,
      frameworkMappings: {
        ...risk.frameworkMappings,
        masTrmRequirementIds: updatedReqIds
      }
    };
  }

  /**
   * Replaces all MAS TRM requirement mappings on a risk
   */
  public static setRiskMasRequirements(
    risk: RiskRecord,
    requirementIds: string[]
  ): RiskRecord {
    const existingMappings = risk.frameworkMappings || {
      iso27001Controls: [],
      iso42001Controls: [],
      masTrmSections: [],
      masTrmRequirementIds: []
    };

    const sections = new Set(existingMappings.masTrmSections || []);
    const canonicalReqIds = new Set<string>();

    for (const reqId of requirementIds) {
      const req = this.getMasRequirementById(reqId);
      if (req) {
        canonicalReqIds.add(req.id);
        sections.add(`MAS TRM ${req.sectionNumber}`);
        if (req.criticalSystemsMandate) sections.add('MAS Notice 644');
        if (req.domainNumber === '8.0' || req.domainNumber === '9.0') {
          sections.add('MAS Notice 655 (Cyber Hygiene)');
        }
      } else {
        canonicalReqIds.add(reqId);
      }
    }

    return {
      ...risk,
      frameworkMappings: {
        ...existingMappings,
        masTrmRequirementIds: Array.from(canonicalReqIds),
        masTrmSections: Array.from(sections)
      }
    };
  }

  /**
   * Maps multiple technology risks to sets of MAS TRM requirement IDs
   */
  public static batchMapTechnologyRisks(
    risks: RiskRecord[],
    mappings: Record<string, string[]> // key: riskId or riskCode, value: array of requirement IDs or codes
  ): RiskRecord[] {
    return risks.map(risk => {
      const reqsToMap = mappings[risk.id] || mappings[risk.riskCode];
      if (!reqsToMap || reqsToMap.length === 0) return risk;

      const existing = risk.frameworkMappings?.masTrmRequirementIds || [];
      const merged = Array.from(new Set([...existing, ...reqsToMap]));
      return this.setRiskMasRequirements(risk, merged);
    });
  }

  /**
   * Intelligently scans existing technology risks and maps them to specific MAS TRM requirement IDs
   * based on threat/vulnerability keywords, ISO 27001 cross-walks, and domain taxonomy.
   */
  public static autoMapTechnologyRisks(
    risks: RiskRecord[],
    options?: { minConfidence?: number; overwrite?: boolean; maxPerRisk?: number }
  ): {
    updatedRisks: RiskRecord[];
    newlyMappedCount: number;
    details: Array<{
      riskId: string;
      riskCode: string;
      title: string;
      mappedRequirements: Array<{ id: string; code: string; title: string; confidence: number }>;
    }>;
  } {
    const minConf = options?.minConfidence ?? 40;
    const maxPerRisk = options?.maxPerRisk ?? 3;
    let newlyMappedCount = 0;
    const details: Array<{
      riskId: string;
      riskCode: string;
      title: string;
      mappedRequirements: Array<{ id: string; code: string; title: string; confidence: number }>;
    }> = [];

    const updatedRisks = risks.map(risk => {
      if (!this.isTechnologyRisk(risk)) return risk;

      const currentReqs = risk.frameworkMappings?.masTrmRequirementIds || [];
      if (currentReqs.length > 0 && !options?.overwrite) {
        return risk;
      }

      const suggestions = this.suggestMasRequirementMappings(risk);
      const topMatches = suggestions
        .filter(s => s.confidence >= minConf)
        .slice(0, maxPerRisk);

      if (topMatches.length === 0) return risk;

      const targetReqIds = Array.from(
        new Set(
          options?.overwrite
            ? topMatches.map(m => m.requirementId)
            : [...currentReqs, ...topMatches.map(m => m.requirementId)]
        )
      );

      const updated = this.setRiskMasRequirements(risk, targetReqIds);
      newlyMappedCount++;

      details.push({
        riskId: risk.id,
        riskCode: risk.riskCode,
        title: risk.title,
        mappedRequirements: topMatches.map(m => ({
          id: m.requirementId,
          code: m.requirementCode,
          title: m.title,
          confidence: m.confidence
        }))
      });

      return updated;
    });

    return {
      updatedRisks,
      newlyMappedCount,
      details
    };
  }

  /**
   * Derives MAS Risk Exposure Tier from a numerical exposure score (0 - 100)
   */
  public static deriveExposureTier(score: number): MASRiskExposureTier {
    if (score >= 70) return 'CRITICAL_EXPOSURE';
    if (score >= 45) return 'HIGH_EXPOSURE';
    if (score >= 20) return 'MEDIUM_EXPOSURE';
    return 'LOW_EXPOSURE';
  }

  /**
   * Evaluates Risk Exposure metrics for a specific MAS TRM Requirement ID
   */
  public static calculateRequirementRiskExposure(
    requirementId: string,
    risks: RiskRecord[],
    options?: RiskExposureEvaluationOptions
  ): MASTrmRiskExposure {
    const req = this.getMasRequirementById(requirementId);
    const domainNum = req ? req.domainNumber : requirementId.replace('REQ-MAS-', '').split('.')[0] + '.0';
    const reqCode = req ? req.requirementCode : requirementId;
    const reqTitle = req ? req.title : `Requirement ${requirementId}`;
    const isStatutory = Boolean(req?.mandatoryForFIs || req?.criticalSystemsMandate);

    // Filter risks mapped to this requirement
    const mappedRisks = risks.filter(r => {
      if (!options?.includeInactive && r.status === 'Closed') return false;
      const reqIds = r.frameworkMappings?.masTrmRequirementIds || [];
      if (reqIds.includes(requirementId) || reqIds.includes(reqCode)) return true;

      // Fallback cross-walk if requirement ID was mapped by section name (e.g. "MAS TRM 8.2")
      if (req?.sectionNumber && r.frameworkMappings?.masTrmSections) {
        const hasSection = r.frameworkMappings.masTrmSections.some(sec => 
          sec.includes(req.sectionNumber) || 
          (req.criticalSystemsMandate && sec.toLowerCase().includes('notice 644')) ||
          (domainNum === '8.0' && sec.toLowerCase().includes('notice 655'))
        );
        if (hasSection) return true;
      }
      return false;
    });

    if (mappedRisks.length === 0) {
      return {
        requirementId,
        requirementCode: reqCode,
        title: reqTitle,
        domainNumber: domainNum,
        domainName: req?.domainName || `MAS Domain ${domainNum}`,
        mappedRisksCount: 0,
        mappedRiskCodes: [],
        maxInherentScore: 0,
        avgInherentScore: 0,
        maxResidualScore: 0,
        avgResidualScore: 0,
        totalInherentExposure: 0,
        totalResidualExposure: 0,
        exposureTier: 'LOW_EXPOSURE',
        isStatutoryMandate: isStatutory,
        exposureScore: 0
      };
    }

    const inherentScores = mappedRisks.map(r => r.inherentScore || (r.likelihood * r.impact));
    const residualScores = mappedRisks.map(r => r.residualScore || (r.residualLikelihood * r.residualImpact));
    const maxInherent = Math.max(...inherentScores, 0);
    const avgInherent = Number((inherentScores.reduce((a, b) => a + b, 0) / inherentScores.length).toFixed(1));
    const maxResidual = Math.max(...residualScores, 0);
    const avgResidual = Number((residualScores.reduce((a, b) => a + b, 0) / residualScores.length).toFixed(1));
    const totalInherent = inherentScores.reduce((a, b) => a + b, 0);
    const totalResidual = residualScores.reduce((a, b) => a + b, 0);

    // Calculate MAS-specific exposure score:
    // Base score = (residual max * 16 + residual avg * 8 + (mappedRisksCount - 1) * 6)
    // If untreated or high status, weight higher.
    let unmitigatedCount = mappedRisks.filter(r => r.status === 'Identified' || r.status === 'Assessment' || r.status === 'Treatment in Progress').length;
    let rawExposure = (maxResidual * 2.8) + (avgResidual * 1.5) + (unmitigatedCount * 8) + (mappedRisks.length * 3);

    // Statutory multiplier (Notice 655 or Notice 644 or statutory mandate)
    if (isStatutory && options?.applyStatutoryWeighting !== false) {
      const multiplier = options?.customStatutoryMultiplier || 1.35;
      rawExposure *= multiplier;
    }

    const exposureScore = Math.min(100, Math.round(rawExposure));
    const exposureTier = this.deriveExposureTier(exposureScore);

    return {
      requirementId,
      requirementCode: reqCode,
      title: reqTitle,
      domainNumber: domainNum,
      domainName: req?.domainName || `MAS Domain ${domainNum}`,
      mappedRisksCount: mappedRisks.length,
      mappedRiskCodes: mappedRisks.map(r => r.riskCode),
      maxInherentScore: maxInherent,
      avgInherentScore: avgInherent,
      maxResidualScore: maxResidual,
      avgResidualScore: avgResidual,
      totalInherentExposure: totalInherent,
      totalResidualExposure: totalResidual,
      exposureTier,
      isStatutoryMandate: isStatutory,
      exposureScore
    };
  }

  /**
   * Evaluates aggregate MAS Domain Exposure Metrics (e.g. Domain 8.0 IAM)
   */
  public static calculateDomainExposureMetrics(
    domainNumber: string,
    risks: RiskRecord[]
  ): MASDomainExposureMetrics {
    const domainReqs = MAS_TRM_REQUIREMENTS_2021.filter(r => r.domainNumber === domainNumber);
    const domainName = domainReqs[0]?.domainName || `MAS TRM Domain ${domainNumber}`;

    const reqExposures = domainReqs.map(req => 
      this.calculateRequirementRiskExposure(req.id, risks)
    );

    const allMappedRiskCodes = new Set<string>();
    reqExposures.forEach(e => e.mappedRiskCodes.forEach(code => allMappedRiskCodes.add(code)));

    const mappedRisksInDomain = risks.filter(r => allMappedRiskCodes.has(r.riskCode));

    let maxInherent = 0;
    let totalInherent = 0;
    let totalResidual = 0;
    let avgResidual = 0;

    if (mappedRisksInDomain.length > 0) {
      const inh = mappedRisksInDomain.map(r => r.inherentScore || (r.likelihood * r.impact));
      const res = mappedRisksInDomain.map(r => r.residualScore || (r.residualLikelihood * r.residualImpact));
      maxInherent = Math.max(...inh, 0);
      totalInherent = inh.reduce((a, b) => a + b, 0);
      totalResidual = res.reduce((a, b) => a + b, 0);
      avgResidual = Number((totalResidual / res.length).toFixed(1));
    }

    // Top exposed requirement
    const sortedReqs = [...reqExposures].sort((a, b) => b.exposureScore - a.exposureScore);
    const topExposed = sortedReqs[0]?.exposureScore > 0 ? sortedReqs[0] : undefined;

    // Calculate Domain Exposure Index
    let domainExposureIndex = 0;
    if (reqExposures.length > 0) {
      const maxReqExposure = sortedReqs[0]?.exposureScore || 0;
      const sumReqExposure = reqExposures.reduce((acc, r) => acc + r.exposureScore, 0);
      const avgReqExposure = sumReqExposure / reqExposures.length;
      domainExposureIndex = Math.min(100, Math.round((maxReqExposure * 0.65) + (avgReqExposure * 0.35)));
    }

    return {
      domainNumber,
      domainName,
      totalMappedRisks: mappedRisksInDomain.length,
      uniqueRiskCodes: Array.from(allMappedRiskCodes),
      maxInherentScore: maxInherent,
      avgResidualScore: avgResidual,
      totalInherentExposure: totalInherent,
      totalResidualExposure: totalResidual,
      domainExposureIndex,
      exposureTier: this.deriveExposureTier(domainExposureIndex),
      topExposedRequirement: topExposed
    };
  }

  /**
   * Generates a complete Enterprise MAS Risk Profile across all 14 domains and requirements
   */
  public static calculateEnterpriseRiskProfile(
    risks: RiskRecord[],
    options?: RiskExposureEvaluationOptions
  ): MASEnterpriseRiskProfile {
    // Collect unique domain numbers
    const domainNumbers = Array.from(
      new Set(MAS_TRM_REQUIREMENTS_2021.map(r => r.domainNumber))
    ).sort((a, b) => parseFloat(a) - parseFloat(b));

    const domainExposures: Record<string, MASDomainExposureMetrics> = {};
    const requirementExposures: Record<string, MASTrmRiskExposure> = {};

    let totalCriticalReqs = 0;
    let totalHighReqs = 0;

    for (const req of MAS_TRM_REQUIREMENTS_2021) {
      const exp = this.calculateRequirementRiskExposure(req.id, risks, options);
      requirementExposures[req.id] = exp;
      if (exp.exposureTier === 'CRITICAL_EXPOSURE') totalCriticalReqs++;
      if (exp.exposureTier === 'HIGH_EXPOSURE') totalHighReqs++;
    }

    for (const domNum of domainNumbers) {
      domainExposures[domNum] = this.calculateDomainExposureMetrics(domNum, risks);
    }

    // Technology Risks stats
    const techRisks = risks.filter(r => 
      r.category === 'Information Security' || 
      r.category === 'Asset' || 
      r.category === 'Process' || 
      r.category === 'Vendor' ||
      r.department?.toLowerCase().includes('tech') ||
      r.department?.toLowerCase().includes('devops') ||
      r.department?.toLowerCase().includes('it')
    );

    const mappedRisks = techRisks.filter(r => 
      (r.frameworkMappings?.masTrmRequirementIds && r.frameworkMappings.masTrmRequirementIds.length > 0) ||
      (r.frameworkMappings?.masTrmSections && r.frameworkMappings.masTrmSections.length > 0)
    );

    // Top risk drivers (ranked by exposure contribution)
    const drivers = techRisks.map(r => {
      const reqIds = r.frameworkMappings?.masTrmRequirementIds || [];
      const score = (r.residualScore || (r.residualLikelihood * r.residualImpact)) * (1 + reqIds.length * 0.2);
      const reqCodes = reqIds.map(id => this.getMasRequirementById(id)?.requirementCode || id);
      return {
        risk: r,
        masRequirementIds: reqIds,
        masRequirementCodes: reqCodes,
        exposureContribution: Math.round(score * 3.5)
      };
    }).sort((a, b) => b.exposureContribution - a.exposureContribution);

    // Overall Enterprise Exposure Score
    const domainScores = Object.values(domainExposures).map(d => d.domainExposureIndex);
    const overallExposureScore = domainScores.length > 0
      ? Math.round(Math.max(...domainScores) * 0.5 + (domainScores.reduce((a, b) => a + b, 0) / domainScores.length) * 0.5)
      : 0;

    const sortedDomains = Object.values(domainExposures).sort((a, b) => b.domainExposureIndex - a.domainExposureIndex);
    const topExposedDomain = sortedDomains[0]?.domainNumber || '8.0';
    const exposureTier = this.deriveExposureTier(overallExposureScore);

    return {
      totalTechnologyRisks: techRisks.length,
      mappedToMasCount: mappedRisks.length,
      unmappedRisksCount: Math.max(0, techRisks.length - mappedRisks.length),
      overallExposureScore,
      exposureTier,
      topExposedDomain,
      criticalExposureRequirementsCount: totalCriticalReqs,
      highExposureRequirementsCount: totalHighReqs,
      domainExposures,
      requirementExposures,
      topRiskDrivers: drivers.slice(0, 10)
    };
  }

  /**
   * Computes Risk-Weighted Compliance Score:
   * Adjusts regulatory compliance readiness % downward when active Technology Risks expose statutory controls.
   */
  public static computeRiskWeightedComplianceScore(
    baseComplianceScore: number,
    enterpriseProfile: MASEnterpriseRiskProfile,
    domainNumber?: string
  ): {
    adjustedScore: number;
    riskPenalty: number;
    exposureTier: MASRiskExposureTier;
  } {
    let exposureScore = enterpriseProfile.overallExposureScore;

    if (domainNumber && enterpriseProfile.domainExposures[domainNumber]) {
      exposureScore = enterpriseProfile.domainExposures[domainNumber].domainExposureIndex;
    }

    // A higher exposure score results in an audit readiness haircut/penalty (up to 30% max penalty)
    const riskPenalty = Math.round((exposureScore / 100) * 28);
    const adjustedScore = Math.max(0, Math.min(100, Math.round(baseComplianceScore - riskPenalty)));
    const exposureTier = this.deriveExposureTier(exposureScore);

    return {
      adjustedScore,
      riskPenalty,
      exposureTier
    };
  }

  /**
   * Computes MAS-specific exposure metrics for a single cell in the 5x5 heatmap matrix (Likelihood x Impact).
   */
  public static calculateHeatmapCellMasExposure(
    likelihood: number,
    impact: number,
    risks: RiskRecord[],
    viewType: 'inherent' | 'residual' = 'residual'
  ): HeatmapCellMasExposure {
    const cellScore = likelihood * impact;

    // Filter risks located in this specific matrix cell
    const cellRisks = risks.filter(r => {
      const l = viewType === 'inherent' ? r.likelihood : r.residualLikelihood;
      const i = viewType === 'inherent' ? r.impact : r.residualImpact;
      return l === likelihood && i === impact;
    });

    const techRisks = cellRisks.filter(r => this.isTechnologyRisk(r));
    const mappedTechRisks = techRisks.filter(r => {
      const ids = r.frameworkMappings?.masTrmRequirementIds || [];
      const secs = r.frameworkMappings?.masTrmSections || [];
      return ids.length > 0 || secs.length > 0;
    });

    const unmappedTechRisks = techRisks.filter(r => {
      const ids = r.frameworkMappings?.masTrmRequirementIds || [];
      const secs = r.frameworkMappings?.masTrmSections || [];
      return ids.length === 0 && secs.length === 0;
    });

    // Collect all MAS requirement IDs and details mapped to risks in this cell
    const reqIdsSet = new Set<string>();
    const reqCodesSet = new Set<string>();
    const reqTitlesSet = new Set<string>();
    const domainsSet = new Set<string>();
    let hasNotice644 = false;
    let hasNotice655 = false;

    mappedTechRisks.forEach(r => {
      const ids = r.frameworkMappings?.masTrmRequirementIds || [];
      ids.forEach(id => {
        reqIdsSet.add(id);
        const req = this.getMasRequirementById(id);
        if (req) {
          reqCodesSet.add(req.requirementCode);
          reqTitlesSet.add(req.title);
          domainsSet.add(req.domainNumber);
          if (req.criticalSystemsMandate) hasNotice644 = true;
          if (req.domainNumber === '8.0' || req.domainNumber === '9.0') hasNotice655 = true;
        } else {
          reqCodesSet.add(id);
        }
      });

      // Also check masTrmSections
      const secs = r.frameworkMappings?.masTrmSections || [];
      secs.forEach(sec => {
        if (sec.toLowerCase().includes('644')) hasNotice644 = true;
        if (sec.toLowerCase().includes('655')) hasNotice655 = true;
      });
    });

    const isStatutory = hasNotice644 || hasNotice655;
    const unmitigatedCount = cellRisks.filter(
      r => r.status === 'Identified' || r.status === 'Assessment' || r.status === 'Treatment in Progress'
    ).length;

    // Calculate MAS-specific exposure score for this cell:
    let rawScore = 0;
    if (techRisks.length > 0) {
      // Base score derived from matrix coordinates (0 - 75)
      const coordinateBase = cellScore * 2.8;

      // Concentration penalty: multiple technology risks in the same cell multiply exposure
      const concentrationWeight = Math.min(25, techRisks.length * 4.5);

      // Unmitigated treatment penalty
      const unmitigatedPenalty = unmitigatedCount * 3.5;

      rawScore = coordinateBase + concentrationWeight + unmitigatedPenalty;

      // Statutory mandate multiplier (Notice 644 Critical Systems or Notice 655 Cyber Hygiene)
      if (isStatutory) {
        rawScore *= 1.35;
      }
    }

    const masExposureScore = Math.min(100, Math.round(rawScore));
    const exposureTier = this.deriveExposureTier(masExposureScore);

    return {
      likelihood,
      impact,
      score: cellScore,
      totalRisks: cellRisks.length,
      technologyRisksCount: techRisks.length,
      mappedTechnologyRisksCount: mappedTechRisks.length,
      unmappedTechnologyRisksCount: unmappedTechRisks.length,
      masExposureScore,
      exposureTier,
      isStatutoryNotice644Exposed: hasNotice644,
      isStatutoryNotice655Exposed: hasNotice655,
      isStatutoryExposed: isStatutory,
      mappedRequirementCodes: Array.from(reqCodesSet),
      mappedRequirementIds: Array.from(reqIdsSet),
      mappedRequirementTitles: Array.from(reqTitlesSet),
      affectedDomainNumbers: Array.from(domainsSet).sort((a, b) => parseFloat(a) - parseFloat(b)),
      topRiskCodes: cellRisks.slice(0, 5).map(r => r.riskCode),
      unmitigatedCount
    };
  }

  /**
   * Generates a complete 5x5 Heatmap Matrix with MAS-specific exposure metrics across all 25 cells
   */
  public static calculateHeatmapExposureGrid(
    risks: RiskRecord[],
    viewType: 'inherent' | 'residual' = 'residual'
  ): HeatmapMasExposureGrid {
    const matrix: Record<string, HeatmapCellMasExposure> = {};
    let criticalCount = 0;
    let highCount = 0;
    let statutoryCount = 0;
    let totalExposureScore = 0;
    let maxCellScore = 0;
    let populatedCellsCount = 0;

    for (let l = 1; l <= 5; l++) {
      for (let i = 1; i <= 5; i++) {
        const key = `${l}-${i}`;
        const cellExposure = this.calculateHeatmapCellMasExposure(l, i, risks, viewType);
        matrix[key] = cellExposure;

        if (cellExposure.exposureTier === 'CRITICAL_EXPOSURE') criticalCount++;
        if (cellExposure.exposureTier === 'HIGH_EXPOSURE') highCount++;
        if (cellExposure.isStatutoryExposed && cellExposure.technologyRisksCount > 0) statutoryCount++;
        if (cellExposure.masExposureScore > maxCellScore) maxCellScore = cellExposure.masExposureScore;

        if (cellExposure.technologyRisksCount > 0) {
          totalExposureScore += cellExposure.masExposureScore;
          populatedCellsCount++;
        }
      }
    }

    const techRisks = this.filterTechnologyRisks(risks);
    const mappedTechRisks = techRisks.filter(r => {
      const ids = r.frameworkMappings?.masTrmRequirementIds || [];
      const secs = r.frameworkMappings?.masTrmSections || [];
      return ids.length > 0 || secs.length > 0;
    });

    const gridAverageExposureScore = populatedCellsCount > 0
      ? Math.round(totalExposureScore / populatedCellsCount)
      : 0;

    return {
      matrix,
      criticalExposureCellsCount: criticalCount,
      highExposureCellsCount: highCount,
      statutoryExposedCellsCount: statutoryCount,
      totalRisksInGrid: risks.length,
      totalTechnologyRisks: techRisks.length,
      totalMappedTechnologyRisks: mappedTechRisks.length,
      gridAverageExposureScore,
      maxCellExposureScore: maxCellScore
    };
  }

  /**
   * Automatically initializes and synchronizes initial technology risks with authoritative MAS TRM requirement IDs
   */
  public static seedDefaultMasRequirementMappings(risks: RiskRecord[]): RiskRecord[] {
    const codeToRequirementsMap: Record<string, string[]> = {
      'RSK-2026-01': ['REQ-MAS-8.2', 'REQ-MAS-8.4', 'REQ-MAS-5.3'], // Cloud Privilege Escalation
      'RSK-2026-02': ['REQ-MAS-9.1', 'REQ-MAS-11.2', 'REQ-MAS-8.1'], // Phishing Attack
      'RSK-2026-03': ['REQ-MAS-14.1', 'REQ-MAS-14.2', 'REQ-MAS-14.3'], // Cloud Regional Outage (4h RTO)
      'RSK-2026-04': ['REQ-MAS-13.2', 'REQ-MAS-13.4', 'REQ-MAS-3.6'], // Third-Party SaaS Breach
      'RSK-2026-05': ['REQ-MAS-6.5', 'REQ-MAS-11.1', 'REQ-MAS-8.2'], // Ransomware via Endpoints
      'RSK-2026-06': ['REQ-MAS-12.2', 'REQ-MAS-14.2', 'REQ-MAS-4.1'], // MAS Notice 644 Sanctions
      'RSK-2026-07': ['REQ-MAS-7.3', 'REQ-MAS-7.4', 'REQ-MAS-7.5'], // Critical SQLi / API Vulnerability
      'RSK-2026-08': ['REQ-MAS-6.1', 'REQ-MAS-8.1', 'REQ-MAS-9.2'], // S3 Bucket Data Leakage
      'RSK-2026-09': ['REQ-MAS-6.4', 'REQ-MAS-6.5', 'REQ-MAS-11.3'], // Unpatched CVEs & Containers
      'RSK-2026-10': ['REQ-MAS-9.1', 'REQ-MAS-9.2'], // Loss of Cryptographic Keys
      'RSK-2026-11': ['REQ-MAS-8.2', 'REQ-MAS-12.3'], // Malicious Insider Access Abuse
      'RSK-2026-12': ['REQ-MAS-10.2', 'REQ-MAS-14.1'], // DDoS Threat
      'RSK-2026-13': ['REQ-MAS-12.3'], // Clock Drift Corrupting SIEM Logs
      'RSK-2026-14': ['REQ-MAS-3.1', 'REQ-MAS-5.3'], // Shadow IT & Unapproved AI
      'RSK-2026-15': ['REQ-MAS-14.1', 'REQ-MAS-14.3'], // DR Replication Gap
      'RSK-2026-16': ['REQ-MAS-13.2', 'REQ-MAS-13.4'], // Subcontractor Supply Chain

      // Support for TRSK codes
      'TRSK-001': ['REQ-MAS-14.1', 'REQ-MAS-14.2', 'REQ-MAS-5.3'],
      'TRSK-002': ['REQ-MAS-8.2', 'REQ-MAS-8.4', 'REQ-MAS-8.5'],
      'TRSK-003': ['REQ-MAS-13.2', 'REQ-MAS-13.4', 'REQ-MAS-3.6'],
      'TRSK-004': ['REQ-MAS-6.5', 'REQ-MAS-12.2', 'REQ-MAS-14.1']
    };

    return risks.map(risk => {
      const defaultReqs = codeToRequirementsMap[risk.riskCode];
      const currentReqs = risk.frameworkMappings?.masTrmRequirementIds || [];

      if (defaultReqs) {
        if (currentReqs.length > 0) return risk; // Already has mappings
        return this.setRiskMasRequirements(risk, defaultReqs);
      }

      // If it's a technology risk with no mappings, use intelligent mapping suggestions
      if (this.isTechnologyRisk(risk) && currentReqs.length === 0) {
        const suggestions = this.suggestMasRequirementMappings(risk);
        const topMatches = suggestions.filter(s => s.confidence >= 40).slice(0, 3);
        if (topMatches.length > 0) {
          return this.setRiskMasRequirements(risk, topMatches.map(m => m.requirementId));
        }
      }

      return risk;
    });
  }
}
