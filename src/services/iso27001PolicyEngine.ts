// ISO 27001:2022 Compliance Documentation & Policy Synthesis Engine
// Derived from international compliance specifications, mandatory document specifications,
// 4-tier document hierarchy, and lead auditor Stage 1/Stage 2 fieldwork sampling guidelines.

import { GeneratedDocument, User, TenantCompany } from '../types';
import { enrichDocumentWithConsultancyFeatures } from './consultancyDocumentEngine';
import { ISO27001_POLICY_CATALOG } from './iso27001Templates/catalogData';
import type { StandardTemplateMetadata } from './iso27001Templates/catalogData';
import { PolicyTemplateContext } from './iso27001Templates/types';
import { buildDocMan00, buildPolIsms01, buildDocScp01 } from './iso27001Templates/governanceTemplates';
import { buildDocRsk02, buildDocSoa03 } from './iso27001Templates/riskAndSoaTemplates';
import {
  buildPolAcc04,
  buildPolCls05,
  buildPolAup06,
  buildPolCry07,
  buildPolDev08,
  buildPolVul09,
  buildPolPhy10,
  buildPolSup11
} from './iso27001Templates/securityPoliciesTemplates';
import {
  buildSopInc12,
  buildSopBcp13,
  buildSopBkp14,
  buildSopChg15,
  buildSopAud16,
  buildSopCapa17,
  buildSopRev18,
  buildPolDoc19
} from './iso27001Templates/operationalProceduresTemplates';

import {
  getPredefinedTemplateSections,
  PredefinedTemplateSections,
  PredefinedPurposeSection,
  PredefinedScopeSection,
  PredefinedRaciSection,
  PredefinedAuditorChecklistSection,
  PredefinedArchitecturalStep
} from './iso27001Templates/templateSectionsHelper';

export type {
  StandardTemplateMetadata,
  PredefinedTemplateSections,
  PredefinedPurposeSection,
  PredefinedScopeSection,
  PredefinedRaciSection,
  PredefinedAuditorChecklistSection,
  PredefinedArchitecturalStep
};
export { ISO27001_POLICY_CATALOG, getPredefinedTemplateSections };

export interface PolicyGenerationOptions {
  companyName: string;
  industry?: string;
  framework?: string;
  cloudProvider?: 'AWS' | 'GCP' | 'Azure' | 'Multi-Cloud' | string;
  identityProvider?: 'Okta' | 'Google Workspace' | 'Microsoft Azure AD (Entra ID)' | 'JumpCloud' | string;
  mdmProvider?: 'Jamf Pro' | 'Microsoft Intune' | 'Kandji' | 'Automox' | string;
  vulnerabilityTool?: 'Snyk & Trivy' | 'Wiz & AWS Inspector' | 'CrowdStrike Falcon' | 'Qualys' | string;
  scmProvider?: 'GitHub Enterprise' | 'GitLab SaaS' | 'Bitbucket Data Center' | string;
  departments?: string[];
  cisoName?: string;
  effectiveDate?: string;
  selectedTemplateCodes?: string[]; // If empty or undefined, generates all
  users?: User[];
  tenant?: TenantCompany | null;
  customRaciOverrides?: Record<string, { r: boolean; a: boolean; c: boolean; i: boolean }> | null;
}

export interface StandardStructuralGuideline {
  step: number;
  sectionTitle: string;
  isoRequirement: string;
  standardBestPractice: string;
  auditorVerificationGoal: string;
}

export const STANDARD_STRUCTURAL_GUIDELINES: StandardStructuralGuideline[] = [
  {
    step: 1,
    sectionTitle: 'Document Control, Metadata & Version History',
    isoRequirement: 'ISO/IEC 27001:2022 Clause 7.5 (Documented Information)',
    standardBestPractice: 'Standardized header containing unique document code, owner, approver, effective date, classification, and change history table with explicit justification.',
    auditorVerificationGoal: 'Confirm formal authorization, avoid uncontrolled copies, and verify annual review cycle.'
  },
  {
    step: 2,
    sectionTitle: 'Executive Mandate & Purpose',
    isoRequirement: 'ISO/IEC 27001:2022 Clause 5.1 (Leadership) & 5.2 (Policy)',
    standardBestPractice: 'Clear declaration from Top Management and the Board establishing zero tolerance for deliberate bypasses and aligning security with business goals.',
    auditorVerificationGoal: 'Verify executive commitment and that policy is not merely written by IT without board sponsorship.'
  },
  {
    step: 3,
    sectionTitle: 'Scope Boundaries & Technological Context',
    isoRequirement: 'ISO/IEC 27001:2022 Clause 4.3 (Scope of the ISMS)',
    standardBestPractice: 'Explicit boundary declaration listing physical premises, cloud accounts, remote workforce endpoints, and integrated third-party SaaS.',
    auditorVerificationGoal: 'Ensure that core customer data repositories and production infrastructure are not deliberately omitted from scope.'
  },
  {
    step: 4,
    sectionTitle: 'Normative References & ISO 27001:2022 Control Mapping',
    isoRequirement: 'ISO/IEC 27001:2022 Clause 6.1.3 (Information Security Risk Treatment)',
    standardBestPractice: 'Direct cross-reference to relevant ISO 27001 clauses (4-10) and Annex A control domains (Organizational, People, Physical, Technological).',
    auditorVerificationGoal: 'Facilitates rapid cross-examination during Stage 1 document review and links policies to Statement of Applicability (SoA).'
  },
  {
    step: 5,
    sectionTitle: 'RACI Governance & Accountability Matrix',
    isoRequirement: 'ISO/IEC 27001:2022 Clause 5.3 (Organizational Roles & Responsibilities)',
    standardBestPractice: 'Tabular RACI model defining Responsible, Accountable, Consulted, and Informed stakeholders across business and technical functions.',
    auditorVerificationGoal: 'Validates that security roles are distributed organization-wide, not concentrated entirely on a single individual.'
  },
  {
    step: 6,
    sectionTitle: 'Specific Policy Statements & Quantitative Baselines',
    isoRequirement: 'ISO/IEC 27001:2022 Clause 6.2 (Information Security Objectives)',
    standardBestPractice: 'Concrete, verifiable rules with numeric metrics and SLAs (e.g. 72h critical patching, 24h leaver deprovisioning, 99.9% uptime, 4h RTO). Vague adjectives are strictly forbidden.',
    auditorVerificationGoal: 'Enables objective testing during Stage 2 audit; eliminates ambiguous policy claims.'
  },
  {
    step: 7,
    sectionTitle: 'Technical Infrastructure & Tooling Guardrails',
    isoRequirement: 'ISO/IEC 27001:2022 Annex A.8 (Technological Controls)',
    standardBestPractice: 'Explicit naming and configuration binding of in-scope technologies (e.g., AWS KMS, Okta FIDO2 MFA, Jamf Pro FileVault, Snyk container scans).',
    auditorVerificationGoal: 'Prevents "shelfware" documentation; proves policy directly governs real operational environments.'
  },
  {
    step: 8,
    sectionTitle: 'Step-by-Step Implementation Workflows & Runbooks',
    isoRequirement: 'ISO/IEC 27001:2022 Clause 8.1 (Operational Planning and Control)',
    standardBestPractice: 'Structured operational flowcharts and numbered procedural steps guiding day-to-day workforce execution.',
    auditorVerificationGoal: 'Demonstrates repeatable processes that do not rely on unwritten tribal knowledge.'
  },
  {
    step: 9,
    sectionTitle: 'Formal Security Exception & Waiver Governance',
    isoRequirement: 'ISO/IEC 27001:2022 Clause 8.1 & Clause 6.1.3',
    standardBestPractice: 'Standardized exception request procedure requiring CISO written approval, documented compensating controls, and automatic 90-day sunset expiration.',
    auditorVerificationGoal: 'Ensures unmanaged technical deviations do not slip through as uncontrolled audit non-conformities.'
  },
  {
    step: 10,
    sectionTitle: 'KPIs, Monitoring & Continuous Evaluation',
    isoRequirement: 'ISO/IEC 27001:2022 Clause 9.1 (Monitoring, Measurement & Evaluation)',
    standardBestPractice: 'Documented measurement cadences, telemetry collection methods, and CISO quarterly review targets.',
    auditorVerificationGoal: 'Verifies the organization evaluates the actual performance and effectiveness of the ISMS.'
  },
  {
    step: 11,
    sectionTitle: 'Lead Auditor Evidence Artifacts & Sampling Checklist',
    isoRequirement: 'ISO/IEC 27001:2022 Clause 9.2 (Internal Audit) & Stage 2 Audit Protocols',
    standardBestPractice: 'Explicit enumeration of tangible evidence artifacts (logs, exports, minutes, hashes) the external auditor will sample during certification.',
    auditorVerificationGoal: 'Pre-arms internal teams with exact verification artifacts, dramatically accelerating audit fieldwork.'
  },
  {
    step: 12,
    sectionTitle: 'Enforcement, CAPA Linkage & Executive Ratification',
    isoRequirement: 'ISO/IEC 27001:2022 Clause 10.1 (Continual Improvement) & 10.2 (Nonconformity & CAPA)',
    standardBestPractice: 'Clear disciplinary consequence statements, mandatory 5-Whys root cause analysis for violations, distribution records, and CEO/Board digital sign-off.',
    auditorVerificationGoal: 'Establishes legal authority and proves non-conformities feed systematically into corrective actions.'
  }
];

export class Iso27001PolicyEngine {
  /**
   * Retrieves the comprehensive catalog of 21 standardized ISO 27001:2022 document templates
   */
  static getCatalog(): StandardTemplateMetadata[] {
    return ISO27001_POLICY_CATALOG;
  }

  /**
   * Retrieves specific ISO 27001 template metadata by document code
   */
  static getTemplateByCode(code: string): StandardTemplateMetadata | undefined {
    return ISO27001_POLICY_CATALOG.find(t => t.code.toUpperCase() === code.toUpperCase());
  }

  /**
   * Retrieves the 12-step architectural formula required for TÜV/BSI auditor-grade compliance
   */
  static getStructuralGuidelines(): StandardStructuralGuideline[] {
    return STANDARD_STRUCTURAL_GUIDELINES;
  }

  /**
   * Generates a fully audit-ready compliance document suite tailored to the tenant
   */
  static generateSuite(options: PolicyGenerationOptions): GeneratedDocument[] {
    const {
      companyName,
      industry = 'Technology, Cloud SaaS & FinTech',
      framework = 'ISO/IEC 27001:2022 & ISO/IEC 27002:2022',
      cloudProvider = 'AWS',
      identityProvider = 'Okta',
      mdmProvider = 'Jamf Pro',
      vulnerabilityTool = 'Snyk & Trivy',
      scmProvider = 'GitHub Enterprise',
      departments = ['Executive Leadership', 'Software Engineering & DevOps', 'IT & Cloud Infrastructure', 'Product & QA', 'People Operations & HR', 'Finance & Procurement'],
      cisoName = 'Chief Information Security Officer (CISO)',
      effectiveDate = '15 January 2026',
      selectedTemplateCodes
    } = options;

    const defaultControlStatements = [
      `This document is the official, confidential property of ${companyName} and shall not be reproduced, copied, or distributed, in whole or in part, without prior written approval from the ${cisoName}.`,
      `This document is maintained under formal revision control pursuant to ISO/IEC 27001:2022 Clause 7.5. Manual or unauthorized penciled alterations invalidate this record.`,
      `All amendments, periodic updates, or exceptions to this document must be reviewed by the ISMS Working Group and formally ratified by the ${cisoName} and Executive Management.`
    ];

    const defaultRevisionHistory = [
      {
        sNo: '01',
        reviewDate: effectiveDate,
        pageNo: 'All Pages',
        issueNo: '1.0',
        changeDescription: 'Initial comprehensive synthesis compliant with Standards and Training ISO/IEC 27001:2022 guidelines for Stage 1 & Stage 2 certification.',
        approvedBy: cisoName
      }
    ];

    const ctx: PolicyTemplateContext = {
      companyName,
      industry,
      framework,
      cloudProvider,
      identityProvider,
      mdmProvider,
      vulnerabilityTool,
      scmProvider,
      departments,
      cisoName,
      effectiveDate,
      defaultControlStatements,
      defaultRevisionHistory,
      users: options.users,
      tenant: options.tenant,
      customRaciOverrides: options.customRaciOverrides
    };

    const allDocs: GeneratedDocument[] = [];

    // Helper filter
    const shouldInclude = (code: string) => {
      if (!selectedTemplateCodes || selectedTemplateCodes.length === 0) return true;
      return selectedTemplateCodes.map(c => c.toUpperCase()).includes(code.toUpperCase());
    };

    // LEVEL 1: GOVERNANCE & SCOPE
    if (shouldInclude('DOC-MAN-00')) allDocs.push(buildDocMan00(ctx));
    if (shouldInclude('POL-ISMS-01')) allDocs.push(buildPolIsms01(ctx));
    if (shouldInclude('DOC-SCP-01')) allDocs.push(buildDocScp01(ctx));
    if (shouldInclude('DOC-RSK-02')) allDocs.push(buildDocRsk02(ctx));
    if (shouldInclude('DOC-SOA-03')) allDocs.push(buildDocSoa03(ctx));

    // LEVEL 2: TOPIC-SPECIFIC SECURITY POLICIES
    if (shouldInclude('POL-ACC-04')) allDocs.push(buildPolAcc04(ctx));
    if (shouldInclude('POL-CLS-05')) allDocs.push(buildPolCls05(ctx));
    if (shouldInclude('POL-AUP-06')) allDocs.push(buildPolAup06(ctx));
    if (shouldInclude('POL-CRY-07')) allDocs.push(buildPolCry07(ctx));
    if (shouldInclude('POL-DEV-08')) allDocs.push(buildPolDev08(ctx));
    if (shouldInclude('POL-VUL-09')) allDocs.push(buildPolVul09(ctx));
    if (shouldInclude('POL-PHY-10')) allDocs.push(buildPolPhy10(ctx));
    if (shouldInclude('POL-SUP-11')) allDocs.push(buildPolSup11(ctx));

    // LEVEL 3: OPERATIONAL PROCEDURES & SOPS
    if (shouldInclude('SOP-INC-12')) allDocs.push(buildSopInc12(ctx));
    if (shouldInclude('SOP-BCP-13')) allDocs.push(buildSopBcp13(ctx));
    if (shouldInclude('SOP-BKP-14')) allDocs.push(buildSopBkp14(ctx));
    if (shouldInclude('SOP-CHG-15')) allDocs.push(buildSopChg15(ctx));
    if (shouldInclude('SOP-AUD-16')) allDocs.push(buildSopAud16(ctx));
    if (shouldInclude('SOP-CAPA-17')) allDocs.push(buildSopCapa17(ctx));
    if (shouldInclude('SOP-REV-18')) allDocs.push(buildSopRev18(ctx));
    if (shouldInclude('POL-DOC-19')) allDocs.push(buildPolDoc19(ctx));

    return allDocs.map(d => enrichDocumentWithConsultancyFeatures(d, {
      companyName,
      cisoName,
      effectiveDate,
      users: options.users,
      tenant: options.tenant,
      customOverrides: options.customRaciOverrides
    }));
  }

  /**
   * Generates a single audit-ready compliance document by code
   */
  static generateDocument(code: string, options: PolicyGenerationOptions): GeneratedDocument | undefined {
    const docs = this.generateSuite({
      ...options,
      selectedTemplateCodes: [code]
    });
    return docs[0];
  }

  /**
   * Generates an in-depth, full-length auditor-grade document powered by Gemini AI
   * with automated fallback to the UKAS/BSI Lead Auditor Master standard.
   */
  static async generateAuditorGradeDocumentAsync(
    code: string,
    options: PolicyGenerationOptions & { customFocusArea?: string }
  ): Promise<{ document: GeneratedDocument; isAI: boolean; modelUsed?: string }> {
    const templateMeta = this.getTemplateByCode(code);
    const title = templateMeta?.title || `${code} Compliance Specification`;

    // 1. Build master local document baseline first (guarantees complete 14+ pages)
    const baseDoc = this.generateDocument(code, options);
    if (!baseDoc) {
      throw new Error(`Invalid template code: ${code}`);
    }

    // 2. Query server AI generation endpoint
    try {
      const resp = await fetch('/api/ai/iso-auditor-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          title,
          companyName: options.companyName,
          industry: options.industry,
          framework: options.framework,
          cloudProvider: options.cloudProvider,
          identityProvider: options.identityProvider,
          mdmProvider: options.mdmProvider,
          vulnerabilityTool: options.vulnerabilityTool,
          scmProvider: options.scmProvider,
          cisoName: options.cisoName,
          effectiveDate: options.effectiveDate,
          customFocusArea: options.customFocusArea
        })
      });

      if (resp.ok) {
        const data = await resp.json();
        if (data.success && data.isAI && data.synthesizedData?.fullMarkdownProse) {
          // Merge AI-synthesized prose with auditor structure
          const aiProse = data.synthesizedData.fullMarkdownProse;
          const enhancedDoc: GeneratedDocument = {
            ...baseDoc,
            content: aiProse.length > 500 ? aiProse : baseDoc.content
          };
          return {
            document: enrichDocumentWithConsultancyFeatures(enhancedDoc, {
              companyName: options.companyName,
              cisoName: options.cisoName,
              effectiveDate: options.effectiveDate,
              users: options.users,
              tenant: options.tenant,
              customOverrides: options.customRaciOverrides
            }),
            isAI: true,
            modelUsed: data.model || 'Gemini 3.8 Flash Lead Auditor'
          };
        }
      }
    } catch (e) {
      console.warn('AI Auditor generation request fell back to master auditor standard:', e);
    }

    return {
      document: baseDoc,
      isAI: false,
      modelUsed: 'Master ISO 27001:2022 Lead Auditor Engine'
    };
  }

  /**
   * Retrieves high-end pre-defined sections for Purpose, Scope, RACI, and Auditor Evidence Checklist

   * adhering strictly to the 12-step architectural standard defined by the senior GRC consultant.
   */
  static getTemplateSections(code: string, options: Partial<PolicyGenerationOptions>): PredefinedTemplateSections {
    const ctx: PolicyTemplateContext = {
      companyName: options.companyName || options.tenant?.name || 'Skanda Enterprise',
      industry: options.industry || 'Technology & Cloud SaaS',
      framework: options.framework || 'ISO/IEC 27001:2022',
      cloudProvider: options.cloudProvider || 'AWS',
      identityProvider: options.identityProvider || 'Okta',
      mdmProvider: options.mdmProvider || 'Jamf Pro',
      vulnerabilityTool: options.vulnerabilityTool || 'Snyk & Trivy',
      scmProvider: options.scmProvider || 'GitHub Enterprise',
      departments: options.departments || ['Executive Leadership', 'Software Engineering', 'IT & Cloud SecOps', 'People Operations', 'Legal'],
      cisoName: options.cisoName || 'Chief Information Security Officer (CISO)',
      effectiveDate: options.effectiveDate || new Date().toISOString().split('T')[0],
      defaultControlStatements: [],
      defaultRevisionHistory: [],
      users: options.users,
      tenant: options.tenant,
      customRaciOverrides: options.customRaciOverrides
    };

    return getPredefinedTemplateSections(code, ctx);
  }
}

export * from './iso27001Templates/stage2AuditorEvidence';
export * from './consultancyDocumentEngine';
export * from './isoAuditorMasterEngine';
