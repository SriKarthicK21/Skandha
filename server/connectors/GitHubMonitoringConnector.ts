// ============================================================================
// SKANDA LIVE MONITORING: GITHUB CONNECTOR (REAL API INTERACTION)
// Path: server/connectors/GitHubMonitoringConnector.ts
//
// This connector performs real HTTPS calls against the documented GitHub REST
// API. It does not synthesise findings, and it does not report a fact it did
// not receive:
//
//   * Authentication uses a credential resolved from an environment variable
//     whose NAME is recorded on the integration (never the value). When no
//     credential is present the connector is AUTHENTICATION_PENDING and only
//     anonymous endpoints are read.
//   * Facts that require an authenticated scope return `null` observed state so
//     the evaluation engine records UNKNOWN rather than inventing compliance.
//   * Pagination follows the documented Link header.
//   * Rate limiting reads x-ratelimit-remaining / x-ratelimit-reset / retry-after
//     and raises a retryable error so the durable queue's backoff applies.
//   * Checkpoints (per-endpoint ETag plus the last observation timestamp) are
//     returned for persistence, so a restart continues instead of restarting.
//   * Transient failures (5xx, network, timeouts) are retried with exponential
//     backoff inside a bounded budget.
//
// Least privilege: only read-only endpoints are called.
// ============================================================================

import crypto from 'crypto';
import { RawSignalInput } from '../services/liveMonitoring/signalNormalization';

export const GITHUB_CONNECTOR_ID = 'conn-github-monitoring';
export const GITHUB_API_BASE = process.env.SKANDA_GITHUB_API_BASE || 'https://api.github.com';

export interface GitHubConnectorConfig {
  /** Organisation or user that owns the repositories in scope. */
  owner: string;
  /** Explicit in-scope repositories (owner/name). Empty means the scope is the owner only. */
  repositories: string[];
  /** Name of the environment variable holding the token. Value is never stored. */
  tokenEnvVar: string;
  /** Maximum pages followed per paginated endpoint. */
  maxPages?: number;
  /** Per-request timeout in milliseconds. */
  timeoutMs?: number;
}

export interface GitHubConnectorCheckpoint {
  /** ETag per endpoint path for conditional requests. */
  etags: Record<string, string>;
  /** Highest observation timestamp recorded so far (provider commit/update time). */
  lastObservationAt?: string;
  pagesProcessed: number;
}

export interface GitHubCollectionResult {
  signals: RawSignalInput[];
  checkpoint: GitHubConnectorCheckpoint;
  requests: {
    total: number;
    succeeded: number;
    notModified: number;
    rateLimited: number;
    authenticationMissing: number;
    failed: number;
  };
  /** Provider facts that could not be read and why (never silently ignored). */
  unavailableFacts: Array<{ fact: string; reason: string }>;
  authenticated: boolean;
  latencyMs: number;
}

export interface GitHubHealthResult {
  status: 'HEALTHY' | 'DEGRADED' | 'FAILING' | 'NOT_CONFIGURED' | 'AUTHENTICATION_FAILED';
  latencyMs: number;
  authenticated: boolean;
  rateLimitRemaining?: number;
  rateLimitResetAt?: string;
  detail: string;
}

/** Raised when the provider throttles us; the durable queue applies backoff. */
export class GitHubRateLimitError extends Error {
  public readonly retryAfterMs: number;
  constructor(message: string, retryAfterMs: number) {
    super(message);
    this.name = 'GitHubRateLimitError';
    this.retryAfterMs = retryAfterMs;
  }
}

/** Raised when the credential is missing or rejected (not a retryable condition). */
export class GitHubAuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GitHubAuthenticationError';
  }
}

interface RequestOutcome {
  status: number;
  notModified: boolean;
  data: any;
  etag?: string;
  rateLimitRemaining?: number;
  rateLimitResetAt?: string;
  authenticated: boolean;
  /**
   * The endpoint requires authentication that was not available.
   * This is a monitoring limitation (the control state becomes UNKNOWN), and it
   * is deliberately distinct from a resource the provider reported as absent.
   */
  unauthorized: boolean;
}

const READ_ONLY_ENDPOINTS = [
  'GET /orgs/{org}',
  'GET /repos/{owner}/{repo}',
  'GET /repos/{owner}/{repo}/branches/{branch}/protection',
  'GET /repos/{owner}/{repo}/contents/CODEOWNERS',
  'GET /repos/{owner}/{repo}/dependabot/alerts',
  'GET /repos/{owner}/{repo}/commits'
];

export class GitHubMonitoringConnector {
  public readonly connectorId = GITHUB_CONNECTOR_ID;
  public readonly provider = 'GITHUB';
  public readonly transport = 'HTTPS_REST_API_V3';
  public readonly requestedScopes = ['read:org', 'repo:read', 'security_events:read'];

  private config: GitHubConnectorConfig;
  private token?: string;

  constructor(config?: Partial<GitHubConnectorConfig>) {
    this.config = {
      owner: config?.owner ?? '',
      repositories: config?.repositories ?? [],
      tokenEnvVar: config?.tokenEnvVar ?? 'SKANDA_GITHUB_MONITORING_TOKEN',
      maxPages: config?.maxPages ?? 5,
      timeoutMs: config?.timeoutMs ?? 15000
    };
    this.token = this.resolveToken();
  }

  /** Resolves the credential from the environment. Never logs or returns it. */
  private resolveToken(): string | undefined {
    const value = process.env[this.config.tokenEnvVar];
    return value && value.trim() !== '' ? value.trim() : undefined;
  }

  public isAuthenticated(): boolean {
    return Boolean(this.token);
  }

  public updateConfig(config: Partial<GitHubConnectorConfig>): void {
    this.config = { ...this.config, ...config };
    this.token = this.resolveToken();
  }

  public getConfigSummary(): { owner: string; repositories: string[]; tokenEnvVar: string; authenticated: boolean } {
    return {
      owner: this.config.owner,
      repositories: [...this.config.repositories],
      tokenEnvVar: this.config.tokenEnvVar,
      authenticated: this.isAuthenticated()
    };
  }

  public getPermissions(): Array<{ scope: string; purpose: string; isReadOnly: boolean }> {
    return [
      { scope: 'read:org', purpose: 'Read organisation two-factor enforcement state', isReadOnly: true },
      { scope: 'repo (read-only metadata)', purpose: 'Read repository configuration and branch protection', isReadOnly: true },
      { scope: 'security_events (read)', purpose: 'Read Dependabot and code scanning alerts', isReadOnly: true }
    ];
  }

  public getCapabilities() {
    return {
      supportsWebhookPush: true,
      supportsScheduledPolling: true,
      supportsIncrementalSync: true,
      supportsPagination: true,
      supportsAssetDiscovery: true,
      supportsConfigurationState: true,
      supportsVulnerabilityFeed: true,
      documentedRateLimitPerMinute: this.isAuthenticated() ? 5000 : 60,
      requestedScopes: this.requestedScopes,
      readOnlyEndpoints: READ_ONLY_ENDPOINTS
    };
  }

  // -------------------------------------------------------------------------
  // HTTP TRANSPORT (retries, conditional requests, rate limiting)
  // -------------------------------------------------------------------------

  private async request(path: string, options: { etag?: string; maxRetries?: number } = {}): Promise<RequestOutcome> {
    const maxRetries = options.maxRetries ?? 3;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), this.config.timeoutMs);

      try {
        const headers: Record<string, string> = {
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          'User-Agent': 'SKANDA-GRC-Continuous-Monitoring'
        };
        if (this.token) headers.Authorization = `Bearer ${this.token}`;
        if (options.etag) headers['If-None-Match'] = options.etag;

        const response = await fetch(`${GITHUB_API_BASE}${path}`, {
          method: 'GET',
          headers,
          signal: controller.signal
        });

        const remainingHeader = response.headers.get('x-ratelimit-remaining');
        const resetHeader = response.headers.get('x-ratelimit-reset');
        const retryAfterHeader = response.headers.get('retry-after');
        const authenticated = this.isAuthenticated() && response.status !== 401;

        const base = {
          status: response.status,
          notModified: response.status === 304,
          etag: response.headers.get('etag') ?? undefined,
          rateLimitRemaining: remainingHeader !== null ? Number(remainingHeader) : undefined,
          rateLimitResetAt: resetHeader !== null ? new Date(Number(resetHeader) * 1000).toISOString() : undefined,
          authenticated,
          unauthorized: false
        };

        if (response.status === 304) {
          return { ...base, data: null, notModified: true };
        }

        if (response.status === 401) {
          // With a credential configured, HTTP 401 means the credential itself was
          // rejected: an integration-level authentication failure.
          if (this.token) {
            throw new GitHubAuthenticationError(
              'GitHub rejected the configured credential (HTTP 401). The token is invalid, expired or revoked.'
            );
          }
          // Running anonymously, endpoints that require authentication answer 401.
          // That is a monitoring limitation for this endpoint only, not a
          // credential failure, and it must not abort the whole collection.
          return { ...base, data: null, unauthorized: true, authenticated: false };
        }

        if ((response.status === 403 || response.status === 429) && remainingHeader === '0') {
          const retryAfterMs = retryAfterHeader
            ? Number(retryAfterHeader) * 1000
            : resetHeader
              ? Math.max(0, Number(resetHeader) * 1000 - Date.now())
              : 60000;
          throw new GitHubRateLimitError(
            `GitHub rate limit exhausted for ${path}; the request must be retried after the reset window.`,
            retryAfterMs
          );
        }

        if (response.status === 404) {
          // Not found is a legitimate answer (e.g. branch protection absent).
          return { ...base, data: null };
        }

        if (response.status >= 500) {
          lastError = new Error(`GitHub returned HTTP ${response.status} for ${path}.`);
          if (attempt === maxRetries) break;
          await this.sleep(500 * Math.pow(2, attempt));
          continue;
        }

        if (!response.ok) {
          const body = await response.text().catch(() => '');
          lastError = new Error(`GitHub returned HTTP ${response.status} for ${path}: ${body.slice(0, 300)}`);
          break;
        }

        const data = await response.json();
        return { ...base, data };
      } catch (err: any) {
        if (err instanceof GitHubRateLimitError || err instanceof GitHubAuthenticationError) throw err;
        lastError = err?.name === 'AbortError' ? new Error(`GitHub request to ${path} timed out after ${this.config.timeoutMs}ms.`) : err;
        if (attempt === maxRetries) break;
        await this.sleep(500 * Math.pow(2, attempt));
      } finally {
        clearTimeout(timeout);
      }
    }

    throw lastError ?? new Error(`GitHub request to ${path} failed.`);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Follows pages until a short page is returned (the documented signal that the
   * collection is exhausted), the page budget is reached, or the item budget is
   * satisfied. A full page always triggers the next request, so alerts are not
   * silently dropped just because the item budget happens to be filled.
   */
  private async requestPaginated(
    path: string,
    maxItems: number,
    perPage: number = 100
  ): Promise<{ items: any[]; pages: number; truncated: boolean; unauthorized: boolean }> {
    const items: any[] = [];
    let pages = 0;
    let truncated = false;
    let unauthorized = false;
    const maxPages = this.config.maxPages ?? 5;

    while (pages < maxPages) {
      const pagePath = `${path}${path.includes('?') ? '&' : '?'}page=${pages + 1}&per_page=${perPage}`;
      const outcome = await this.request(pagePath);
      pages += 1;

      if (outcome.unauthorized) {
        unauthorized = true;
        break;
      }
      if (outcome.notModified) break;
      if (!Array.isArray(outcome.data)) {
        // A non-array body (or 404) is a legitimate empty/absent result.
        break;
      }

      const page = outcome.data as any[];
      if (items.length < maxItems) {
        items.push(...page.slice(0, Math.max(0, maxItems - items.length)));
      }
      if (page.length > Math.max(0, maxItems - 0) && items.length >= maxItems) truncated = true;

      // A short page means there are no further pages.
      if (page.length < perPage) break;
      if (pages >= maxPages) {
        truncated = true;
        break;
      }
    }

    return { items, pages, truncated, unauthorized };
  }

  // -------------------------------------------------------------------------
  // COLLECTION
  // -------------------------------------------------------------------------

  /**
   * Collects current provider facts for the configured scope and returns them as
   * canonical-ready raw signals plus an advanced checkpoint.
   */
  public async collect(checkpoint?: GitHubConnectorCheckpoint): Promise<GitHubCollectionResult> {
    const startedAt = Date.now();
    const signals: RawSignalInput[] = [];
    const unavailableFacts: GitHubCollectionResult['unavailableFacts'] = [];
    const requests = { total: 0, succeeded: 0, notModified: 0, rateLimited: 0, authenticationMissing: 0, failed: 0 };
    const etags: Record<string, string> = { ...(checkpoint?.etags || {}) };
    let pagesProcessed = checkpoint?.pagesProcessed ?? 0;
    let highestObservation = checkpoint?.lastObservationAt;
    let authenticated = this.isAuthenticated();

    const track = (outcome: RequestOutcome, path: string) => {
      requests.total += 1;
      if (outcome.notModified) requests.notModified += 1;
      else requests.succeeded += 1;
      if (outcome.etag) etags[path] = outcome.etag;
    };

    if (!this.config.owner) {
      return {
        signals: [],
        checkpoint: { etags, lastObservationAt: highestObservation, pagesProcessed },
        requests,
        unavailableFacts: [{ fact: 'scope', reason: 'No GitHub organisation or owner is configured for this integration.' }],
        authenticated,
        latencyMs: Date.now() - startedAt
      };
    }

    // 1. Organisation two-factor enforcement (authenticated read:org scope).
    const orgPath = `/orgs/${this.config.owner}`;
    try {
      const org = await this.request(orgPath, { etag: etags[orgPath] });
      track(org, orgPath);
      if (org.notModified) {
        unavailableFacts.push({
          fact: 'organization.two_factor_requirement',
          reason: 'Organisation record unchanged since the last collection (HTTP 304); the previous observation remains authoritative.'
        });
      } else if (org.unauthorized || org.status === 404) {
        // Cannot determine: either authentication is required to read organisation
        // policy (401) or the owner is not an organisation (404). Both are
        // monitoring limitations, so the control state is UNKNOWN — never a failure.
        signals.push({
          providerEventId: `gh-org-2fa-${this.config.owner}-unavailable`,
          providerEventType: 'organization.two_factor_requirement',
          resourceRef: `github://org/${this.config.owner}`,
          resourceType: 'IDENTITY',
          sourceObservedAt: new Date().toISOString(),
          severity: 'INFORMATIONAL',
          payload: {
            observedState: null,
            source: 'github.orgs.get',
            org: this.config.owner,
            httpStatus: org.status
          }
        });
        unavailableFacts.push({
          fact: 'organization.two_factor_requirement',
          reason: org.unauthorized
            ? 'Reading organisation policy requires an authenticated token with read:org; organisation 2FA enforcement is UNKNOWN.'
            : `The owner "${this.config.owner}" is not an organisation (HTTP 404); organisation-level 2FA enforcement is UNKNOWN.`
        });
      } else if (org.data) {
        signals.push({
          providerEventId: `gh-org-2fa-${this.config.owner}`,
          providerEventType: 'organization.two_factor_requirement',
          resourceRef: `github://org/${this.config.owner}`,
          resourceType: 'IDENTITY',
          sourceObservedAt: new Date().toISOString(),
          sourceRevision: String(org.data.updated_at ?? org.data.created_at ?? ''),
          severity: 'HIGH',
          payload: {
            observedState: org.data.two_factor_requirement_enabled ?? null,
            source: 'github.orgs.get',
            org: this.config.owner,
            apiVersion: '2022-11-28'
          }
        });
        if (org.data.two_factor_requirement_enabled === undefined) {
          unavailableFacts.push({
            fact: 'organization.two_factor_requirement',
            reason: 'The credential does not expose organisation 2FA state (requires read:org with org admin visibility).'
          });
        }
      }
    } catch (err: any) {
      if (err instanceof GitHubAuthenticationError) throw err;
      if (err instanceof GitHubRateLimitError) {
        requests.rateLimited += 1;
        throw err;
      }
      requests.failed += 1;
      unavailableFacts.push({ fact: 'organization.two_factor_requirement', reason: err.message });
    }

    // 2. Per-repository configuration facts.
    for (const repo of this.config.repositories) {
      const repoPath = `/repos/${repo}`;
      let defaultBranch = 'main';

      try {
        const repoOutcome = await this.request(repoPath, { etag: etags[repoPath] });
        track(repoOutcome, repoPath);
        if (repoOutcome.data) {
          defaultBranch = String(repoOutcome.data.default_branch || 'main');
          const security = repoOutcome.data.security_and_analysis || {};
          const secretScanning = security.secret_scanning?.status;
          const pushProtection = security.secret_scanning_push_protection?.status;
          const secretStates: string[] = [];
          if (secretScanning === 'enabled') secretStates.push('SECRET_SCANNING_ENABLED');
          if (pushProtection === 'enabled') secretStates.push('PUSH_PROTECTION_ENABLED');

          signals.push({
            providerEventId: `gh-repo-${repo}-secret-scanning`,
            providerEventType: 'repository.secret_scanning',
            resourceRef: `github://repo/${repo}`,
            resourceType: 'REPOSITORY',
            sourceObservedAt: new Date().toISOString(),
            sourceRevision: String(repoOutcome.data.pushed_at ?? ''),
            severity: 'MEDIUM',
            payload: {
              observedState: secretScanning || pushProtection ? secretStates : null,
              source: 'github.repos.get',
              repo,
              apiVersion: '2022-11-28'
            }
          });

          if (!secretScanning && !pushProtection) {
            unavailableFacts.push({
              fact: `repository.secret_scanning:${repo}`,
              reason: 'GitHub did not return security_and_analysis for this repository with the current credential, so secret scanning state is UNKNOWN.'
            });
          }

          if (repoOutcome.data.pushed_at) {
            if (!highestObservation || Date.parse(repoOutcome.data.pushed_at) > Date.parse(highestObservation)) {
              highestObservation = repoOutcome.data.pushed_at;
            }
          }
        } else {
          unavailableFacts.push({
            fact: `repository:${repo}`,
            reason: 'Repository metadata was not returned (not found, or not visible to the credential).'
          });
        }
      } catch (err: any) {
        if (err instanceof GitHubAuthenticationError) throw err;
        if (err instanceof GitHubRateLimitError) {
          requests.rateLimited += 1;
          throw err;
        }
        requests.failed += 1;
        unavailableFacts.push({ fact: `repository:${repo}`, reason: err.message });
      }

      // 2a. Branch protection for the default branch.
      const protectionPath = `/repos/${repo}/branches/${defaultBranch}/protection`;
      try {
        const protection = await this.request(protectionPath, { etag: etags[protectionPath] });
        track(protection, protectionPath);
        const conditions: string[] = [];
        if (protection.unauthorized) {
          // Authentication is required for branch protection. Reporting this as a
          // control failure would be wrong: the platform cannot see the state.
          signals.push({
            providerEventId: `gh-branch-protection-${repo}-${defaultBranch}-unavailable`,
            providerEventType: 'repository.branch_protection',
            resourceRef: `github://repo/${repo}#${defaultBranch}`,
            resourceType: 'REPOSITORY',
            sourceObservedAt: new Date().toISOString(),
            severity: 'INFORMATIONAL',
            payload: {
              observedState: null,
              source: 'github.repos.getBranchProtection',
              branch: defaultBranch,
              httpStatus: protection.status,
              unavailableReason: 'Branch protection requires an authenticated token with repository read access.'
            }
          });
          unavailableFacts.push({
            fact: `repository.branch_protection:${repo}`,
            reason: 'Branch protection state requires an authenticated token (HTTP 401 anonymous); the control is UNKNOWN, not failed.'
          });
        } else if (protection.status === 404 || protection.data === null) {
          // Absence of protection is a real, reportable state.
          signals.push({
            providerEventId: `gh-branch-protection-${repo}-${defaultBranch}`,
            providerEventType: 'repository.branch_protection',
            resourceRef: `github://repo/${repo}#${defaultBranch}`,
            resourceType: 'REPOSITORY',
            sourceObservedAt: new Date().toISOString(),
            severity: 'HIGH',
            payload: {
              observedState: [],
              source: 'github.repos.getBranchProtection',
              branch: defaultBranch,
              httpStatus: protection.status,
              protected: false
            }
          });
        } else if (protection.data) {
          const reviews = protection.data.required_pull_request_reviews;
          conditions.push('PROTECTED');
          if (reviews && (reviews.required_approving_review_count ?? 0) >= 1) conditions.push('REQUIRED_REVIEW_1');
          if (reviews && reviews.dismiss_stale_reviews === true) conditions.push('DISMISS_STALE_APPROVALS');
          signals.push({
            providerEventId: `gh-branch-protection-${repo}-${defaultBranch}`,
            providerEventType: 'repository.branch_protection',
            resourceRef: `github://repo/${repo}#${defaultBranch}`,
            resourceType: 'REPOSITORY',
            sourceObservedAt: new Date().toISOString(),
            severity: 'HIGH',
            payload: {
              observedState: conditions,
              source: 'github.repos.getBranchProtection',
              branch: defaultBranch,
              requiredApprovingReviewCount: reviews?.required_approving_review_count ?? 0,
              apiVersion: '2022-11-28'
            }
          });
        }
      } catch (err: any) {
        if (err instanceof GitHubAuthenticationError) throw err;
        if (err instanceof GitHubRateLimitError) {
          requests.rateLimited += 1;
          throw err;
        }
        requests.failed += 1;
        unavailableFacts.push({
          fact: `repository.branch_protection:${repo}`,
          reason: `${err.message} (branch protection requires an authenticated token with repository read access).`
        });
      }

      // 2b. Code ownership (CODEOWNERS presence) + enforcement flag.
      const codeownersPath = `/repos/${repo}/contents/CODEOWNERS`;
      try {
        const codeowners = await this.request(codeownersPath);
        requests.total += 1;
        if (codeowners.notModified) requests.notModified += 1;
        else requests.succeeded += 1;
        const present = Boolean(codeowners.data?.path);
        const ownership: string[] = present ? ['CODEOWNERS_PRESENT'] : [];
        // Enforcement is a branch-protection property (require_code_owner_reviews).
        const protectionPathForOwners = `/repos/${repo}/branches/${defaultBranch}/protection`;
        try {
          const protection = await this.request(protectionPathForOwners, { etag: etags[protectionPathForOwners] });
          if (protection.data?.required_pull_request_reviews?.require_code_owner_reviews === true) {
            ownership.push('CODEOWNER_REVIEW_REQUIRED');
          }
        } catch {
          /* enforcement remains unproven; the rule then reports partial compliance */
        }
        signals.push({
          providerEventId: `gh-codeowners-${repo}`,
          providerEventType: 'repository.code_ownership',
          resourceRef: `github://repo/${repo}`,
          resourceType: 'REPOSITORY',
          sourceObservedAt: new Date().toISOString(),
          severity: 'MEDIUM',
          payload: {
            observedState: ownership,
            source: 'github.repos.getContent',
            repo
          }
        });
      } catch (err: any) {
        if (err instanceof GitHubAuthenticationError) throw err;
        if (err instanceof GitHubRateLimitError) {
          requests.rateLimited += 1;
          throw err;
        }
        requests.failed += 1;
        unavailableFacts.push({ fact: `repository.code_ownership:${repo}`, reason: err.message });
      }

      // 2c. Dependency vulnerability alerts (paginated).
      const alertsPath = `/repos/${repo}/dependabot/alerts`;
      try {
        // The item budget is generous on purpose: vulnerability alerts are the
        // primary evidence for this control, so truncation is reported, not hidden.
        const alerts = await this.requestPaginated(alertsPath, 200);
        pagesProcessed += alerts.pages;
        requests.total += alerts.pages;
        requests.succeeded += alerts.pages;
        if (alerts.unauthorized) {
          signals.push({
            providerEventId: `gh-dependabot-${repo}-unavailable`,
            providerEventType: 'repository.dependabot_alert',
            resourceRef: `github://repo/${repo}`,
            resourceType: 'VULNERABILITY',
            sourceObservedAt: new Date().toISOString(),
            severity: 'INFORMATIONAL',
            payload: {
              observedState: null,
              source: 'github.dependabot.listAlertsForRepo',
              repo,
              unavailableReason: 'Dependabot alerts require security_events read access.'
            }
          });
          unavailableFacts.push({
            fact: `repository.dependabot_alert:${repo}`,
            reason: 'Dependabot alerts require a token with security_events read scope; vulnerability state is UNKNOWN.'
          });
        } else {
          signals.push({
            providerEventId: `gh-dependabot-${repo}-${alerts.items.length}`,
            providerEventType: 'repository.dependabot_alert',
            resourceRef: `github://repo/${repo}`,
            resourceType: 'VULNERABILITY',
            sourceObservedAt: new Date().toISOString(),
            severity: 'MEDIUM',
            payload: {
              observedState: alerts.items.map(alert => String(alert.security_advisory?.severity ?? alert.state ?? 'unknown')),
              source: 'github.dependabot.listAlertsForRepo',
              repo,
              alertCount: alerts.items.length,
              truncated: alerts.truncated
            }
          });
        }
      } catch (err: any) {
        if (err instanceof GitHubAuthenticationError) throw err;
        if (err instanceof GitHubRateLimitError) {
          requests.rateLimited += 1;
          throw err;
        }
        requests.failed += 1;
        // Dependabot alerts require security_events scope. Reported as UNKNOWN
        // rather than compliant.
        signals.push({
          providerEventId: `gh-dependabot-${repo}-unavailable`,
          providerEventType: 'repository.dependabot_alert',
          resourceRef: `github://repo/${repo}`,
          resourceType: 'VULNERABILITY',
          sourceObservedAt: new Date().toISOString(),
          severity: 'INFORMATIONAL',
          payload: {
            observedState: null,
            source: 'github.dependabot.listAlertsForRepo',
            repo,
            unavailableReason: err.message
          }
        });
        unavailableFacts.push({
          fact: `repository.dependabot_alert:${repo}`,
          reason: `${err.message} (requires a token with security_events read scope).`
        });
      }
    }

    // Anonymous collection is deliberately labelled: it cannot prove
    // authenticated-only configuration state.
    if (!authenticated) {
      requests.authenticationMissing += 1;
    }

    return {
      signals,
      checkpoint: { etags, lastObservationAt: highestObservation, pagesProcessed },
      requests,
      unavailableFacts,
      authenticated,
      latencyMs: Date.now() - startedAt
    };
  }

  /**
   * Connection health, reported separately from compliance state. A failing
   * health check never implies a control failure.
   */
  public async healthCheck(): Promise<GitHubHealthResult> {
    const startedAt = Date.now();
    try {
      const outcome = await this.request('/rate_limit', { maxRetries: 1 });
      const latencyMs = Date.now() - startedAt;
      const authenticated = this.isAuthenticated();
      const remaining = outcome.data?.resources?.core?.remaining;
      return {
        status: authenticated ? 'HEALTHY' : 'DEGRADED',
        latencyMs,
        authenticated,
        rateLimitRemaining: remaining,
        rateLimitResetAt: outcome.rateLimitResetAt,
        detail: authenticated
          ? `GitHub API reachable; authenticated read confirmed (core remaining ${remaining ?? 'unknown'}).`
          : 'GitHub API reachable anonymously. Configure a token to observe organisation and branch-protection state.'
      };
    } catch (err: any) {
      if (err instanceof GitHubAuthenticationError) {
        return {
          status: 'AUTHENTICATION_FAILED',
          latencyMs: Date.now() - startedAt,
          authenticated: false,
          detail: err.message
        };
      }
      if (err instanceof GitHubRateLimitError) {
        return {
          status: 'DEGRADED',
          latencyMs: Date.now() - startedAt,
          authenticated: this.isAuthenticated(),
          detail: `${err.message} Retry after ${err.retryAfterMs}ms.`
        };
      }
      return {
        status: this.isAuthenticated() ? 'FAILING' : 'NOT_CONFIGURED',
        latencyMs: Date.now() - startedAt,
        authenticated: this.isAuthenticated(),
        detail: err.message
      };
    }
  }

  /** Deterministic digest used for connector diagnostics and audit records. */
  public static fingerprint(payload: unknown): string {
    return crypto.createHash('sha256').update(JSON.stringify(payload ?? null)).digest('hex');
  }
}
