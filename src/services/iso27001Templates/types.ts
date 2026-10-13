import { GeneratedDocument, User, TenantCompany } from '../../types';

export interface AuditorVerificationDossier {
  artifactName: string;
  samplingProtocol: string;
  storageLocation: string;
  retentionSla: string;
  sha256Seal: string;
  clauseOrAnnexA: string;
  riskId: string;
  statutoryMandate: string;
  auditorVerdict: 'CONFORMING' | 'OPPORTUNITY_FOR_IMPROVEMENT' | 'NON_CONFORMITY';
  leadAuditorOrg: string;
}

export interface PolicyTemplateContext {
  companyName: string;
  industry: string;
  framework: string;
  cloudProvider: string;
  identityProvider: string;
  mdmProvider: string;
  vulnerabilityTool: string;
  scmProvider: string;
  departments: string[];
  cisoName: string;
  effectiveDate: string;
  defaultControlStatements: string[];
  defaultRevisionHistory: Array<{
    sNo: string;
    reviewDate: string;
    pageNo: string;
    issueNo: string;
    changeDescription: string;
    approvedBy: string;
  }>;
  users?: User[];
  tenant?: TenantCompany | null;
  customRaciOverrides?: Record<string, { r: boolean; a: boolean; c: boolean; i: boolean }> | null;
}

export type TemplateBuilder = (ctx: PolicyTemplateContext) => GeneratedDocument;
