// Skanda BrandGuard — Credential Spill & Brand Asset Leakage Monitoring Service
// Ingests stealer log dumps, dark web breach compilations, and public code repo leaks.
// Tracks affected corporate email domains (@apexfintech.com) and unauthorized Git repo secrets.

import { LeakedCredentialAlert, CodeRepoLeakAlert } from '../../types/brandguard';
import { safeStorage } from '../../utils/safeStorage';

const CREDS_KEY = 'skanda_brandguard_leaked_creds_v1';
const CODE_LEAKS_KEY = 'skanda_brandguard_code_leaks_v1';

export class BrandGuardLeakageService {
  /**
   * Retrieves or initializes Leaked Corporate Credentials
   */
  public static getLeakedCredentials(): LeakedCredentialAlert[] {
    const saved = safeStorage.getItem(CREDS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // seed
      }
    }

    const defaultCreds: LeakedCredentialAlert[] = [
      {
        id: 'cred_leak_001',
        email: 'marcus.vance@apexfintech.com',
        domain: 'apexfintech.com',
        leakSource: 'RedLine Stealer Dump (Telegram C2 Channel #094)',
        exposureDate: new Date(Date.now() - 36 * 3600000).toISOString(),
        ingestedDate: new Date(Date.now() - 4 * 3600000).toISOString(),
        breachSeverity: 'CRITICAL',
        exposedDataTypes: ['Cleartext Password', 'Okta SSO Session Token', 'AWS Console Cookie'],
        cleartextPasswordMasked: 'ApexVance$2025!••••',
        passwordHashType: 'PLAINTEXT_LOGGED_BY_MALWARE',
        compromisedEmployee: {
          name: 'Marcus Vance',
          department: 'Engineering & Infrastructure',
          role: 'Chief Technology Officer'
        },
        remediationStatus: 'OPEN',
        stealerMalwareFamily: 'RedLine Stealer v24.1'
      },
      {
        id: 'cred_leak_002',
        email: 'priya.sharma@apexfintech.com',
        domain: 'apexfintech.com',
        leakSource: 'Dark Web Aggregator Breach Compilation 2026',
        exposureDate: new Date(Date.now() - 72 * 3600000).toISOString(),
        ingestedDate: new Date(Date.now() - 18 * 3600000).toISOString(),
        breachSeverity: 'HIGH',
        exposedDataTypes: ['Argon2 Password Hash', 'Corporate Email Handle'],
        cleartextPasswordMasked: '••••••••••••••••',
        passwordHashType: 'ARGON2ID_HASH',
        compromisedEmployee: {
          name: 'Priya Sharma',
          department: 'Governance, Risk & Compliance',
          role: 'Chief Information Security Officer'
        },
        remediationStatus: 'PASSWORD_RESET_ENFORCED',
        remediationActionTaken: 'Automated force password expiration on Active Directory & Okta MFA session invalidation',
        resolvedAt: new Date(Date.now() - 16 * 3600000).toISOString()
      },
      {
        id: 'cred_leak_003',
        email: 'trader.desk4@apexfintech.com',
        domain: 'apexfintech.com',
        leakSource: 'Lumma Stealer Telemetry Stream',
        exposureDate: new Date(Date.now() - 12 * 3600000).toISOString(),
        ingestedDate: new Date(Date.now() - 2 * 3600000).toISOString(),
        breachSeverity: 'CRITICAL',
        exposedDataTypes: ['Trading Portal Session Token', 'Browser Autofill Credentials'],
        cleartextPasswordMasked: 'TradingAlpha#98••••',
        passwordHashType: 'CHROME_SQLITE_DECRYPTED',
        compromisedEmployee: {
          name: 'Desk Trader Alpha',
          department: 'Quantitative Trading',
          role: 'Senior Trading Analyst'
        },
        remediationStatus: 'OPEN',
        stealerMalwareFamily: 'LummaC2'
      }
    ];

    safeStorage.setItem(CREDS_KEY, JSON.stringify(defaultCreds));
    return defaultCreds;
  }

  public static saveLeakedCredentials(creds: LeakedCredentialAlert[]): void {
    safeStorage.setItem(CREDS_KEY, JSON.stringify(creds));
  }

  public static enforceCredentialRemediation(
    alertId: string,
    action: 'PASSWORD_RESET_ENFORCED' | 'SESSION_REVOKED' | 'RESOLVED_FALSE_POSITIVE',
    details: string
  ): LeakedCredentialAlert | null {
    const creds = this.getLeakedCredentials();
    const target = creds.find(c => c.id === alertId);
    if (!target) return null;

    target.remediationStatus = action;
    target.remediationActionTaken = details;
    target.resolvedAt = new Date().toISOString();

    this.saveLeakedCredentials(creds);
    return target;
  }

  /**
   * Retrieves or initializes Public Code Repo Leaks
   */
  public static getCodeRepoLeaks(): CodeRepoLeakAlert[] {
    const saved = safeStorage.getItem(CODE_LEAKS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // seed
      }
    }

    const defaultLeaks: CodeRepoLeakAlert[] = [
      {
        id: 'code_leak_001',
        repoPlatform: 'GitHub',
        repoUrl: 'https://github.com/apex-contractor-test/fintech-trading-bot',
        authorHandle: 'contractor_dev_88',
        repoName: 'apex-contractor-test/fintech-trading-bot',
        matchedSecretType: 'STRIPE_SECRET',
        secretMasked: 'sk_live_51Pq••••••••••••••••••••••••92kA',
        commitHash: '7c9812bfa45d1',
        filePath: 'src/config/paymentService.ts:34',
        exposureDate: new Date(Date.now() - 14 * 3600000).toISOString(),
        severity: 'CRITICAL',
        status: 'ACTIVE_EXPOSED',
        riskScore: 95,
        takedownNoticeDispatched: false
      },
      {
        id: 'code_leak_002',
        repoPlatform: 'GitHub',
        repoUrl: 'https://github.com/ex-employee-lab/skanda-internal-scripts',
        authorHandle: 'former-infra-engineer',
        repoName: 'ex-employee-lab/skanda-internal-scripts',
        matchedSecretType: 'INTERNAL_DATABASE_URL',
        secretMasked: 'postgres://skanda_admin:••••••••••••@db.internal.apexfintech.com:5432/grc_prod',
        commitHash: '0ef941209cc1b',
        filePath: 'scripts/backup_snapshot.sh:12',
        exposureDate: new Date(Date.now() - 48 * 3600000).toISOString(),
        severity: 'CRITICAL',
        status: 'REPO_TAKEDOWN_REQUESTED',
        riskScore: 92,
        takedownNoticeDispatched: true
      },
      {
        id: 'code_leak_003',
        repoPlatform: 'Public Gist',
        repoUrl: 'https://gist.github.com/anonymous/8f102bb381a9',
        authorHandle: 'anonymous',
        repoName: 'gist.github.com/anonymous/8f102bb381a9',
        matchedSecretType: 'API_KEY',
        secretMasked: 'AIzaSyA••••••••••••••••••••••••4N-8',
        commitHash: '3d8102a9918b',
        filePath: 'gemini_test.py:8',
        exposureDate: new Date(Date.now() - 8 * 3600000).toISOString(),
        severity: 'HIGH',
        status: 'ACTIVE_EXPOSED',
        riskScore: 84,
        takedownNoticeDispatched: false
      }
    ];

    safeStorage.setItem(CODE_LEAKS_KEY, JSON.stringify(defaultLeaks));
    return defaultLeaks;
  }

  public static saveCodeRepoLeaks(leaks: CodeRepoLeakAlert[]): void {
    safeStorage.setItem(CODE_LEAKS_KEY, JSON.stringify(leaks));
  }

  public static dispatchRepoTakedown(leakId: string): CodeRepoLeakAlert | null {
    const leaks = this.getCodeRepoLeaks();
    const leak = leaks.find(l => l.id === leakId);
    if (!leak) return null;

    leak.status = 'REPO_TAKEDOWN_REQUESTED';
    leak.takedownNoticeDispatched = true;

    this.saveCodeRepoLeaks(leaks);
    return leak;
  }

  public static getLeaks(): { credentials: LeakedCredentialAlert[]; codeLeaks: CodeRepoLeakAlert[] } {
    return {
      credentials: this.getLeakedCredentials(),
      codeLeaks: this.getCodeRepoLeaks()
    };
  }
}
