/**
 * SKANDA ONBOARDING CLIENT SERVICE
 * File: src/services/onboardingClientService.ts
 * 
 * Frontend client service interfacing with `/api/v1/onboarding/*`.
 * Provides autosave debouncing, optimistic state updates, role assignment,
 * AI draft scope generation, live metrics retrieval, and workspace activation.
 */

import {
  OnboardingSession,
  EnterpriseDiscoveryData,
  QuestionDefinition,
  GeneratedScopeStatement,
  WorkspaceActivationSummary,
  OnboardingRole,
  ProcessTemplateItem,
  DiscoveryCompletenessReport,
  DiscoveryQualityGap,
  ImportPreviewResult,
  DiscoveredDocument,
  OnboardingStatus,
  SectionPriorityItem,
  OnboardingComment
} from '../types/onboardingTypes';

class OnboardingClientService {
  private baseUrl = '/api/v1/onboarding';

  /**
   * Fetch current tenant onboarding session
   */
  public async getSession(tenantId?: string, tenantName?: string): Promise<OnboardingSession> {
    try {
      const url = `${this.baseUrl}/session?tenantId=${encodeURIComponent(tenantId || 'tenant-default')}&tenantName=${encodeURIComponent(tenantName || 'Enterprise Client')}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.warn('[OnboardingClientService] Failed to fetch session from API, falling back to local initialization:', err);
      // Fallback local session if offline or initial state
      return {
        id: `local_onb_${Date.now()}`,
        tenantId: tenantId || 'tenant-default',
        organizationId: 'org_primary',
        status: 'IN_PROGRESS',
        currentStep: 1,
        completionPercentage: 10,
        startedAt: new Date().toISOString(),
        lastSavedAt: new Date().toISOString(),
        assignments: [],
        discoveryData: {
          orgProfile: {
            legalName: tenantName || 'Enterprise Client Inc.',
            registrationNumber: 'REG-2026-001',
            industry: 'SaaS, Cloud & Enterprise Software',
            website: 'https://www.example.com',
            country: 'US',
            state: 'California',
            city: 'San Francisco',
            addressLine1: '500 Howard Street',
            postalCode: '94105',
            headquarters: 'San Francisco HQ',
            operatingModel: 'HYBRID',
            organizationSize: '201-1000',
            totalEmployeeCount: 350,
            primaryContactName: 'Alex Mercer',
            primaryContactEmail: 'alex@example.com',
            primaryContactPhone: '+1-415-555-0100',
            cisoName: 'Sarah Chen',
            cisoEmail: 'ciso@example.com'
          },
          selectedPrograms: [
            {
              frameworkCode: 'ISO_27001_2022',
              programCode: 'PROG-SEC-01',
              name: 'Enterprise Information Security Management System',
              type: 'INFORMATION_SECURITY',
              executiveSponsor: 'CISO',
              programLead: 'Head of GRC',
              isPrimary: true
            }
          ],
          businessActivities: [],
          businessProcesses: [],
          departments: [],
          sites: [],
          workforce: {
            fullTimeEmployees: 300,
            partTimeEmployees: 10,
            contractors: 40,
            remoteWorkforceCount: 150,
            onSiteWorkforceCount: 200,
            shifts: [],
            departmentAllocations: [],
            securityBackgroundChecksRequired: true,
            securityTrainingFrequency: 'QUARTERLY'
          },
          applications: [],
          assets: [],
          dataAssets: [],
          vendors: [],
          technology: {
            cloudProviders: ['AWS'],
            containerization: ['KUBERNETES'],
            databases: ['PostgreSQL'],
            securityStack: {
              backupFrequency: 'CONTINUOUS_REPLICATION',
              drTestingFrequency: 'SEMI_ANNUAL'
            },
            hasOtIcsSystems: false,
            remoteAccessSecurity: ['MFA_VPN', 'ZTNA_ZERO_TRUST']
          },
          criticalServices: []
        },
        questionnaireResponses: {},
        auditTrail: [],
        version: 1,
        completenessScore: 10,
        stageProgress: {},
        discoveredDocuments: [],
        questionnaireVersion: '2026.1'
      };
    }
  }

  /**
   * Autosave session progress to backend with optimistic concurrency version check
   */
  public async saveSession(
    tenantId: string,
    stepNumber: number,
    discoveryUpdates?: Partial<EnterpriseDiscoveryData>,
    responsesUpdates?: Record<string, any>,
    actorEmail: string = 'ciso@enterprise.io',
    actorRole: OnboardingRole = 'ADMIN',
    expectedVersion?: number
  ): Promise<OnboardingSession> {
    const res = await fetch(`${this.baseUrl}/session/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenantId,
        stepNumber,
        discoveryUpdates,
        responsesUpdates,
        actorEmail,
        actorRole,
        expectedVersion
      })
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || `Autosave failed with status ${res.status}`);
    }

    const json = await res.json();
    return json.data;
  }

  /**
   * Update onboarding session lifecycle status
   */
  public async updateStatus(
    tenantId: string,
    targetStatus: OnboardingStatus,
    reason?: string
  ): Promise<OnboardingSession> {
    const res = await fetch(`${this.baseUrl}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId, targetStatus, reason })
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || 'Failed to update status');
    }
    const json = await res.json();
    return json.data;
  }

  /**
   * Delegate section to role
   */
  public async delegateSection(
    tenantId: string,
    stepNumber: number,
    stepKey: string,
    stepTitle: string,
    role: OnboardingRole,
    userEmail: string,
    userName: string
  ): Promise<OnboardingSession> {
    const res = await fetch(`${this.baseUrl}/session/delegate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenantId,
        stepNumber,
        stepKey,
        stepTitle,
        role,
        userEmail,
        userName
      })
    });

    if (!res.ok) throw new Error('Failed to delegate section');
    const json = await res.json();
    return json.data;
  }

  /**
   * Fetch process starter templates
   */
  public async getProcessTemplates(industry?: string, framework?: string): Promise<ProcessTemplateItem[]> {
    try {
      const params = new URLSearchParams();
      if (industry) params.set('industry', industry);
      if (framework) params.set('framework', framework);
      const res = await fetch(`${this.baseUrl}/templates?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch templates');
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  }

  /**
   * Apply process template to tenant session
   */
  public async applyProcessTemplate(tenantId: string, templateId: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/templates/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId, templateId })
    });
    if (!res.ok) throw new Error('Failed to apply process template');
    const json = await res.json();
    return json.data;
  }

  /**
   * Fetch discovery completeness & deterministic quality gaps
   */
  public async getCompleteness(tenantId: string): Promise<{
    completeness: DiscoveryCompletenessReport;
    qualityGaps: DiscoveryQualityGap[];
    sessionStatus: OnboardingStatus;
    version: number;
  }> {
    const res = await fetch(`${this.baseUrl}/completeness?tenantId=${encodeURIComponent(tenantId)}`);
    if (!res.ok) throw new Error('Failed to fetch completeness');
    const json = await res.json();
    return json.data;
  }

  /**
   * Preview CSV data import
   */
  public async previewDataImport(tenantId: string, entityType: string, csvContent: string): Promise<ImportPreviewResult> {
    const res = await fetch(`${this.baseUrl}/import/preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId, entityType, csvContent })
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || 'Failed to preview CSV import');
    }
    const json = await res.json();
    return json.data;
  }

  /**
   * Confirm CSV data import
   */
  public async confirmDataImport(tenantId: string, entityType: string, validRecords: any[]): Promise<number> {
    const res = await fetch(`${this.baseUrl}/import/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId, entityType, validRecords })
    });
    if (!res.ok) throw new Error('Failed to commit imported records');
    const json = await res.json();
    return json.count;
  }

  /**
   * Upload and classify discovery document
   */
  public async uploadDiscoveryDocument(
    tenantId: string,
    fileName: string,
    fileSize: number,
    mimeType: string,
    rawContent: string
  ): Promise<DiscoveredDocument> {
    const res = await fetch(`${this.baseUrl}/documents/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId, fileName, fileSize, mimeType, rawContent })
    });
    if (!res.ok) throw new Error('Failed to upload discovery document');
    const json = await res.json();
    return json.data;
  }

  /**
   * Get dynamic visible questionnaire definitions
   */
  public async getQuestions(tenantId?: string): Promise<QuestionDefinition[]> {
    try {
      const res = await fetch(`${this.baseUrl}/questions?tenantId=${encodeURIComponent(tenantId || 'tenant-default')}`);
      if (!res.ok) throw new Error('Failed to fetch questions');
      const json = await res.json();
      return json.data;
    } catch {
      return [];
    }
  }

  /**
   * Regenerate AI draft scope statement
   */
  public async generateDraftScope(tenantId: string): Promise<GeneratedScopeStatement> {
    const res = await fetch(`${this.baseUrl}/scope/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId })
    });
    if (!res.ok) throw new Error('Failed to generate draft scope');
    const json = await res.json();
    return json.data;
  }

  /**
   * CISO human approval of scope statement
   */
  public async approveScope(tenantId: string, notes?: string): Promise<GeneratedScopeStatement> {
    const res = await fetch(`${this.baseUrl}/scope/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId, notes })
    });
    if (!res.ok) throw new Error('Failed to approve scope');
    const json = await res.json();
    return json.data;
  }

  /**
   * Get verified metrics for review screen
   */
  public async getSummaryMetrics(tenantId: string) {
    const res = await fetch(`${this.baseUrl}/summary-metrics?tenantId=${encodeURIComponent(tenantId)}`);
    if (!res.ok) throw new Error('Failed to fetch summary metrics');
    const json = await res.json();
    return json.data;
  }

  /**
   * Activate SKANDA workspace
   */
  public async activateWorkspace(tenantId: string, actorEmail?: string): Promise<WorkspaceActivationSummary> {
    const res = await fetch(`${this.baseUrl}/activate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId, actorEmail })
    });
    if (!res.ok) throw new Error('Failed to activate workspace');
    const json = await res.json();
    return json.data;
  }

  /**
   * Get dynamic section priorities
   */
  public async getSectionPriorities(tenantId: string): Promise<SectionPriorityItem[]> {
    try {
      const res = await fetch(`${this.baseUrl}/priorities?tenantId=${encodeURIComponent(tenantId)}`);
      if (!res.ok) throw new Error('Failed to fetch priorities');
      const json = await res.json();
      return json.data;
    } catch {
      return [];
    }
  }

  /**
   * Get business discovery workshop suggestions
   */
  public async getWorkshopSuggestions(activities: string[]) {
    try {
      const res = await fetch(`${this.baseUrl}/workshop/suggestions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activities })
      });
      if (!res.ok) throw new Error('Failed to fetch workshop suggestions');
      const json = await res.json();
      return json.data;
    } catch {
      return { suggestedProcesses: [], suggestedApplications: [], suggestedDataAssets: [], suggestedVendors: [] };
    }
  }

  /**
   * Save primary activities from Workshop
   */
  public async savePrimaryActivities(tenantId: string, activities: string[]) {
    const res = await fetch(`${this.baseUrl}/workshop/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId, activities })
    });
    if (!res.ok) throw new Error('Failed to save primary activities');
    const json = await res.json();
    return json.data;
  }

  /**
   * Process Builder: Duplicate process
   */
  public async duplicateProcess(tenantId: string, processId: string) {
    const res = await fetch(`${this.baseUrl}/processes/duplicate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId, processId })
    });
    if (!res.ok) throw new Error('Failed to duplicate process');
    const json = await res.json();
    return json.data;
  }

  /**
   * Process Builder: Archive process
   */
  public async archiveProcess(tenantId: string, processId: string) {
    const res = await fetch(`${this.baseUrl}/processes/archive`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId, processId })
    });
    if (!res.ok) throw new Error('Failed to archive process');
    const json = await res.json();
    return json.data;
  }

  /**
   * Contextual Comments API
   */
  public async getComments(tenantId: string): Promise<OnboardingComment[]> {
    try {
      const res = await fetch(`${this.baseUrl}/comments?tenantId=${encodeURIComponent(tenantId)}`);
      if (!res.ok) throw new Error('Failed to fetch comments');
      const json = await res.json();
      return json.data;
    } catch {
      return [];
    }
  }

  public async addComment(tenantId: string, commentData: {
    stepNumber: number;
    stepKey: string;
    fieldId?: string;
    authorName: string;
    authorRole: string;
    content: string;
    mentions?: string[];
  }): Promise<OnboardingComment> {
    const res = await fetch(`${this.baseUrl}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId, ...commentData })
    });
    if (!res.ok) throw new Error('Failed to add comment');
    const json = await res.json();
    return json.data;
  }

  public async resolveComment(tenantId: string, commentId: string): Promise<boolean> {
    const res = await fetch(`${this.baseUrl}/comments/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId, commentId })
    });
    if (!res.ok) throw new Error('Failed to resolve comment');
    const json = await res.json();
    return json.data.resolved;
  }
}

export const onboardingClientService = new OnboardingClientService();
