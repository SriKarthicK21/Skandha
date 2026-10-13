/**
 * SKANDA SCOPE GENERATION SERVICE
 * File: server/services/ScopeGenerationService.ts
 * 
 * Synthesizes business discovery graph into auditor-grade Compliance Scope statements.
 * Strict AI Governance: AI generates draft proposals; human client approval is strictly required.
 */

import {
  EnterpriseDiscoveryData,
  GeneratedScopeStatement
} from '../../src/types/onboardingTypes.js';

export class ScopeGenerationService {
  /**
   * Generates a comprehensive, auditor-grade draft scope statement
   */
  public generateDraftScope(data: EnterpriseDiscoveryData): GeneratedScopeStatement {
    const org = data.orgProfile;
    const activities = data.businessActivities.map(a => a.name).join(', ') || 'cloud software and technical operations';
    const siteLocations = data.sites.map(s => `${s.name} (${s.city}, ${s.country})`).join('; ');
    const cloudEnv = data.technology.cloudProviders.join(', ') || 'AWS Hyperscale Cloud';
    const primaryApps = data.applications.map(a => a.name).slice(0, 3).join(', ');
    const programsList = data.selectedPrograms.map(p => p.name).join(' and ');

    const physicalLocs = data.sites
      .filter(s => s.siteType !== 'CLOUD_VPC_REGION')
      .map(s => `${s.city}, ${s.country}`);

    const cloudRegions = data.sites
      .filter(s => s.siteType === 'CLOUD_VPC_REGION')
      .map(s => s.name);

    // Auditor-Grade ISMS Scope Formulation (ISO 27001:2022 Clause 4.3 Compliant)
    const draftText = `The Information Security & Integrated Compliance Management System of ${org.legalName} (${org.tradingName || org.legalName}) encompasses the governance, design, development, security testing, deployment, continuous monitoring, and global customer support of its ${activities}.

The operational perimeter covers all personnel, logical access controls, and supporting IT infrastructure across physical facilities in ${physicalLocs.join(' and ') || org.city}, as well as multi-tenant production cloud environments hosted within ${cloudEnv} (${cloudRegions.join(', ') || 'Primary Production VPC'}).

This scope applies to core business platforms including ${primaryApps}, covering the protection of enterprise customer confidentiality, intellectual property, sensitive financial data, and personally identifiable information (PII) in compliance with ${programsList || 'ISO/IEC 27001:2022'}.`;

    const inclusions = [
      `Design, architecture, and software development lifecycle (SDLC) for ${primaryApps || 'SaaS platform'}`,
      `Production cloud infrastructure operations hosted across ${cloudEnv}`,
      `Identity & Access Management, SSO, and MFA enforcement for all internal and contract workforce`,
      `Customer onboarding, data processing, encryption at rest and in transit`,
      `Continuous vulnerability management, EDR telemetry, and 24/7 security incident response`,
      `Third-party supplier and cloud vendor risk governance`
    ];

    const exclusions: Array<{ clause: string; justification: string }> = [];
    if (!data.technology.hasOtIcsSystems) {
      exclusions.push({
        clause: 'Physical Industrial OT/SCADA Controls',
        justification: 'The organization operates purely cloud-native SaaS software without physical industrial machinery, factory automation, or ICS networks.'
      });
    }

    return {
      id: `scope_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      version: 1,
      title: `${org.legalName} — Comprehensive Compliance Scope Statement`,
      draftText,
      inclusions,
      exclusions,
      boundaries: {
        physicalLocations: physicalLocs,
        cloudEnvironments: data.technology.cloudProviders,
        businessUnits: data.departments.map(d => d.name),
        criticalServices: data.criticalServices.map(c => c.serviceName)
      },
      status: 'DRAFT_AI_GENERATED',
      reviewNotes: 'Auto-synthesized from Enterprise Business Discovery graph. Human CISO sign-off required prior to audit lock.'
    };
  }

  /**
   * Human approval execution for the scope statement
   */
  public approveScope(
    currentScope: GeneratedScopeStatement,
    approvedByEmail: string,
    notes?: string
  ): GeneratedScopeStatement {
    return {
      ...currentScope,
      status: 'CLIENT_APPROVED',
      approvedBy: approvedByEmail,
      approvedAt: new Date().toISOString(),
      reviewNotes: notes || currentScope.reviewNotes,
      version: currentScope.version + 1
    };
  }
}

export const scopeGenerationService = new ScopeGenerationService();
