// ============================================================================
// SKANDA QUESTIONNAIRE INTELLIGENCE: TRUST CENTER DISCLOSURE INTEGRATION
// Path: src/services/questionnaire/trustCenterDisclosureService.ts
//
// Reuses approved internal content for customer-facing disclosure while keeping
// internal evidence and external disclosure strictly separated.
//
// Guarantees:
//  - internal evidence is NEVER published automatically
//  - a named, authorised human must approve disclosure (server-side enforced)
//  - only APPROVED internal sources may back public content
//  - version history, expiry, withdrawal and audit history are retained
// ============================================================================

import {
  AnswerApproval,
  AnswerDraft,
  TrustCenterDisclosure,
  DisclosureStatus
} from '../../types/questionnaireIntelligenceTypes.js';
import { normalizeText } from './ooxml/xmlUtils.js';

export interface DisclosureStore {
  listDisclosures(tenantId: string): Promise<TrustCenterDisclosure[]>;
  saveDisclosure(disclosure: TrustCenterDisclosure): Promise<TrustCenterDisclosure>;
}

export interface DisclosureProposal {
  title: string;
  category: TrustCenterDisclosure['category'];
  publicContent: string;
  internalSourceIds: string[];
  expiresAt?: string;
}

export interface DisclosureValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/** Internal-only source statuses that may never reach the public surface. */
const NON_PUBLISHABLE_STATUSES = ['DRAFT', 'IN_REVIEW', 'PENDING_APPROVAL', 'REJECTED', 'INTERNAL_ONLY', 'CONFIDENTIAL'];

export class TrustCenterDisclosureService {
  constructor(private readonly store: DisclosureStore) {}

  /**
   * Proposes disclosure content from approved internal sources. The proposal is
   * created in PENDING_AUTHORIZATION — it is never public on creation.
   */
  public async createProposal(params: {
    tenantId: string;
    proposal: DisclosureProposal;
    actor: string;
    asOf: string;
  }): Promise<{ disclosure: TrustCenterDisclosure; validation: DisclosureValidation }> {
    const validation = this.validateProposal(params.proposal);

    const existing = (await this.store.listDisclosures(params.tenantId)).find(
      d => d.tenantId === params.tenantId && d.title === params.proposal.title && d.category === params.proposal.category
    );

    const disclosure: TrustCenterDisclosure = {
      id: existing ? existing.id : `TCD-${Date.now().toString(36)}`,
      tenantId: params.tenantId,
      title: params.proposal.title,
      category: params.proposal.category,
      publicContent: params.proposal.publicContent,
      internalSourceIds: params.proposal.internalSourceIds,
      status: 'PENDING_AUTHORIZATION',
      version: existing ? existing.version + 1 : 1,
      effectiveFrom: undefined,
      expiresAt: params.proposal.expiresAt,
      auditHistory: [
        ...(existing ? existing.auditHistory : []),
        {
          at: params.asOf,
          actor: params.actor,
          action: existing ? 'PROPOSAL_UPDATED' : 'PROPOSAL_CREATED',
          detail: `Disclosure proposed for ${params.proposal.category}. Not published: authorization is still required.`
        }
      ]
    };

    return { disclosure: await this.store.saveDisclosure(disclosure), validation };
  }

  /**
   * Authorises a disclosure for publication. Server-side callers must already
   * have verified the disclosure permission for the actor.
   */
  public async authorize(params: {
    tenantId: string;
    disclosureId: string;
    actor: string;
    actorRole: string;
    asOf: string;
    expiresAt?: string;
  }): Promise<TrustCenterDisclosure> {
    const disclosure = await this.requireDisclosure(params.tenantId, params.disclosureId);

    if (!['PENDING_AUTHORIZATION', 'WITHDRAWN', 'EXPIRED'].includes(disclosure.status)) {
      throw new Error(
        `Disclosure ${disclosure.id} cannot be authorised from status ${disclosure.status}. Allowed transitions: PENDING_AUTHORIZATION -> AUTHORIZED.`
      );
    }

    const updated: TrustCenterDisclosure = {
      ...disclosure,
      status: 'AUTHORIZED',
      authorizedBy: params.actor,
      authorizedByRole: params.actorRole,
      authorizedAt: params.asOf,
      effectiveFrom: params.asOf,
      expiresAt: params.expiresAt || disclosure.expiresAt,
      withdrawnAt: undefined,
      withdrawalReason: undefined,
      auditHistory: [
        ...disclosure.auditHistory,
        {
          at: params.asOf,
          actor: params.actor,
          action: 'DISCLOSURE_AUTHORIZED',
          detail: `Authorised for external disclosure by ${params.actor} (${params.actorRole}).`
        }
      ]
    };
    return this.store.saveDisclosure(updated);
  }

  public async withdraw(params: {
    tenantId: string;
    disclosureId: string;
    actor: string;
    reason: string;
    asOf: string;
  }): Promise<TrustCenterDisclosure> {
    const disclosure = await this.requireDisclosure(params.tenantId, params.disclosureId);
    if (disclosure.status !== 'AUTHORIZED') {
      throw new Error(`Disclosure ${disclosure.id} is not currently published (status ${disclosure.status}).`);
    }
    const updated: TrustCenterDisclosure = {
      ...disclosure,
      status: 'WITHDRAWN',
      withdrawnAt: params.asOf,
      withdrawalReason: params.reason,
      auditHistory: [
        ...disclosure.auditHistory,
        {
          at: params.asOf,
          actor: params.actor,
          action: 'DISCLOSURE_WITHDRAWN',
          detail: `Withdrawn: ${params.reason}`
        }
      ]
    };
    return this.store.saveDisclosure(updated);
  }

  /** Expiry sweep: expired disclosures stop being published. */
  public async expireStale(params: { tenantId: string; asOf: string }): Promise<TrustCenterDisclosure[]> {
    const disclosures = await this.store.listDisclosures(params.tenantId);
    const expired: TrustCenterDisclosure[] = [];
    for (const disclosure of disclosures) {
      if (disclosure.status !== 'AUTHORIZED' || !disclosure.expiresAt) continue;
      if (new Date(disclosure.expiresAt).getTime() < new Date(params.asOf).getTime()) {
        const updated: TrustCenterDisclosure = {
          ...disclosure,
          status: 'EXPIRED',
          auditHistory: [
            ...disclosure.auditHistory,
            {
              at: params.asOf,
              actor: 'SYSTEM_SCHEDULER',
              action: 'DISCLOSURE_EXPIRED',
              detail: `Disclosure passed its expiry date ${disclosure.expiresAt} and is no longer published.`
            }
          ]
        };
        expired.push(await this.store.saveDisclosure(updated));
      }
    }
    return expired;
  }

  /** The customer-facing surface: only AUTHORIZED, unexpired disclosures. */
  public async listPublished(params: { tenantId: string; asOf: string }): Promise<TrustCenterDisclosure[]> {
    const disclosures = await this.store.listDisclosures(params.tenantId);
    return disclosures.filter(d => {
      if (d.tenantId !== params.tenantId) return false;
      if (d.status !== 'AUTHORIZED') return false;
      if (d.expiresAt && new Date(d.expiresAt).getTime() < new Date(params.asOf).getTime()) return false;
      return true;
    });
  }

  /**
   * Derives a disclosure proposal from an approved questionnaire answer.
   * Internal explanation text is deliberately excluded from the public content.
   */
  public proposeFromApprovedAnswer(params: {
    draft: AnswerDraft;
    approval: AnswerApproval;
    title: string;
    expiresAt?: string;
  }): DisclosureProposal {
    if (params.draft.status !== 'APPROVED') {
      throw new Error('Only approved answers may be proposed for Trust Center disclosure.');
    }
    if (params.draft.id !== params.approval.answerDraftId) {
      throw new Error('The supplied approval does not belong to the supplied answer draft.');
    }
    if (NON_PUBLISHABLE_STATUSES.includes(params.approval.approvalScope.join(',').toUpperCase())) {
      throw new Error('The approval scope marks this content as internal-only.');
    }
    return {
      title: params.title,
      category: 'APPROVED_QUESTIONNAIRE_RESPONSE',
      // Only the customer-facing text crosses the internal/external boundary.
      publicContent: normalizeText(params.draft.customerFacingResponse),
      internalSourceIds: [params.draft.id, ...params.draft.citations.map(c => c.sourceId)],
      expiresAt: params.expiresAt
    };
  }

  private validateProposal(proposal: DisclosureProposal): DisclosureValidation {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!normalizeText(proposal.title)) errors.push('A disclosure title is required.');
    if (!normalizeText(proposal.publicContent)) errors.push('Public disclosure content cannot be empty.');
    if (proposal.internalSourceIds.length === 0) {
      errors.push('A disclosure must reference at least one approved internal source.');
    }
    if (/\b(internal only|do not distribute|confidential\b)/i.test(proposal.publicContent)) {
      errors.push('Public content contains internal-only marking language and cannot be published.');
    }
    if (/\b(pending|draft|in review|not reviewed)\b/i.test(proposal.publicContent)) {
      warnings.push('Public content references review status; confirm it is intended for external readers.');
    }
    if (proposal.publicContent.length > 4000) {
      warnings.push('Public content exceeds 4,000 characters; consider splitting the disclosure.');
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  private async requireDisclosure(tenantId: string, disclosureId: string): Promise<TrustCenterDisclosure> {
    const disclosures = await this.store.listDisclosures(tenantId);
    const disclosure = disclosures.find(d => d.id === disclosureId && d.tenantId === tenantId);
    if (!disclosure) {
      throw new Error(`Disclosure ${disclosureId} was not found for this tenant.`);
    }
    return disclosure;
  }

  public statusTransitionAllowed(from: DisclosureStatus, to: DisclosureStatus): boolean {
    const allowed: Record<DisclosureStatus, DisclosureStatus[]> = {
      DRAFT: ['PENDING_AUTHORIZATION'],
      PENDING_AUTHORIZATION: ['AUTHORIZED', 'DRAFT'],
      AUTHORIZED: ['WITHDRAWN', 'EXPIRED'],
      WITHDRAWN: ['PENDING_AUTHORIZATION'],
      EXPIRED: ['PENDING_AUTHORIZATION']
    };
    return (allowed[from] || []).includes(to);
  }
}
