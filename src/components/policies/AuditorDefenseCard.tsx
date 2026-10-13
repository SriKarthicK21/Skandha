import React, { useState } from 'react';
import { GeneratedDocument } from '../../types';
import { useGRC } from '../../context/GRCContext';
import {
  ShieldCheck,
  FileCheck,
  HelpCircle,
  Clock,
  AlertTriangle,
  Download,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface AuditorDefenseCardProps {
  document: GeneratedDocument;
  onLogCAPA?: (findingTitle: string, clause: string, description: string) => void;
}

export const AuditorDefenseCard: React.FC<AuditorDefenseCardProps> = ({ document, onLogCAPA }) => {
  const { currentTenant } = useGRC();
  const [copiedArtifact, setCopiedArtifact] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'artifacts' | 'questions' | 'slas'>('artifacts');

  // Compute document-specific auditor metadata
  const docCode = document.docCode;
  const isAccessControl = docCode.includes('ACC') || docCode.includes('P11') || document.title.toLowerCase().includes('access');
  const isIncident = docCode.includes('INC') || docCode.includes('PR07') || document.title.toLowerCase().includes('incident');
  const isVulnerability = docCode.includes('VUL') || document.title.toLowerCase().includes('vulnerability');
  const isBCP = docCode.includes('BCP') || document.title.toLowerCase().includes('continuity');
  const isSDLC = docCode.includes('CHG') || docCode.includes('SDLC') || document.title.toLowerCase().includes('software');
  const isSupplier = docCode.includes('SUP') || document.title.toLowerCase().includes('supplier');
  const isAsset = docCode.includes('AST') || document.title.toLowerCase().includes('asset');

  // Get specific artifacts
  const getArtifacts = () => {
    if (isAccessControl) {
      return [
        {
          title: 'Quarterly Access Recertification Sign-off Sheet',
          source: 'Okta / IdP Campaign Export',
          description: 'Signed certificates from all department heads confirming quarterly review of active user entitlements.',
          sampleCount: '4 Quarters'
        },
        {
          title: 'Leaver Deprovisioning Timestamp Diff Log',
          source: 'HR System vs. IdP Suspension Audit Log',
          description: 'Cryptographic proof that terminated staff accounts were deactivated <= 24 hours from HR separation date.',
          sampleCount: '5 Sampled Leavers'
        },
        {
          title: 'Cloud Root Account MFA & Break-Glass Register',
          source: 'AWS IAM / Cloud Console Audit',
          description: 'Evidence that root account has hardware MFA enabled and zero active access keys.',
          sampleCount: 'All Cloud Accounts'
        }
      ];
    }
    if (isIncident) {
      return [
        {
          title: 'Central Security Incident Register',
          source: 'Skanda GRC / Jira Service Management',
          description: 'End-to-end audit log of all security events with triage timestamp, severity rating, and resolution.',
          sampleCount: '12 Months'
        },
        {
          title: 'P1/P2 Post-Incident Review (PIR) with 5-Whys',
          source: 'Incident Response Documentation',
          description: 'Documented post-mortems showing root cause analysis and resulting CAPA action tracking.',
          sampleCount: 'All P1/P2 Events'
        },
        {
          title: 'Annual Cyber Incident Tabletop Simulation Report',
          source: 'Executive IR Tabletop Minutes',
          description: 'Formal simulation drill report signed by CISO and participants detailing scenario and response metrics.',
          sampleCount: '1 Annual Report'
        }
      ];
    }
    if (isVulnerability) {
      return [
        {
          title: 'Weekly Vulnerability Trend Scan Reports',
          source: 'Snyk & Trivy / AWS Inspector',
          description: 'Reports demonstrating continuous discovery, triage, and patch tracking across applications and containers.',
          sampleCount: 'Past 90 Days'
        },
        {
          title: 'Critical CVE Remediation Jira Tickets',
          source: 'Engineering Issue Tracker',
          description: 'Verified timestamps proving Critical (CVSS >= 9.0) flaws were resolved within the 72-hour SLA window.',
          sampleCount: '5 Sampled CVEs'
        },
        {
          title: 'Independent Third-Party Penetration Test & Re-Test',
          source: 'CREST Certified Pentest Firm',
          description: 'Executive summary and closure letter confirming all Critical/High findings were remediated.',
          sampleCount: 'Latest Annual Test'
        }
      ];
    }
    if (isBCP) {
      return [
        {
          title: 'Daily Automated Database Backup Execution Logs',
          source: 'AWS RDS / Cloud Backup Vault',
          description: '30-day continuous log verifying successful snapshot creation and cross-region replication.',
          sampleCount: '30 Days'
        },
        {
          title: 'Sandbox Restoration Test Results',
          source: 'DevOps Staging Restore Log',
          description: 'Monthly test restoring production snapshot into an isolated sandbox, confirming zero data corruption.',
          sampleCount: 'Past 3 Months'
        },
        {
          title: 'Annual Disaster Recovery Failover Report',
          source: 'Engineering Post-Drill Report',
          description: 'Documented failover test verifying actual RTO <= 4 hours and RPO <= 15 minutes.',
          sampleCount: 'Latest Annual Drill'
        }
      ];
    }
    if (isSDLC) {
      return [
        {
          title: 'Production Pull Request Peer Approvals',
          source: 'GitHub / GitLab PR Audit Log',
          description: 'Audit trail showing every production release PR had >= 2 independent peer approvals and CodeOwner sign-off.',
          sampleCount: '5 Random PRs'
        },
        {
          title: 'CI/CD Automated Security Gate Build Logs',
          source: 'GitHub Actions / CI Runner',
          description: 'Proof that automated SAST, SCA, and test suites passed green prior to merge authorization.',
          sampleCount: '5 Deployment Runs'
        },
        {
          title: 'Branch Protection Rules Configuration Export',
          source: 'Repository Settings JSON',
          description: 'Verification that direct commits and force-pushes are blocked on production release branches.',
          sampleCount: 'All Repositories'
        }
      ];
    }
    // Default fallback
    return [
      {
        title: 'Executive Board Approval Sign-Off Record',
        source: 'Executive Board Minutes / Skanda GRC',
        description: 'Documented approval of this policy by Top Management in accordance with Clause 5.2.',
        sampleCount: 'Current Version'
      },
      {
        title: 'Workforce Policy Acknowledgment Audit Log',
        source: 'Cryptographic SHA-256 Attestation Log',
        description: 'Proof that in-scope staff read and acknowledged this policy within 30 days of hire/revision.',
        sampleCount: '100% In-Scope Staff'
      },
      {
        title: 'Management Review / Internal Audit Verification',
        source: 'Internal Audit Working Papers',
        description: 'Independent evaluation proving operational conformity with the stated policy requirements.',
        sampleCount: 'Annual Audit Cycle'
      }
    ];
  };

  // Get interview questions
  const getInterviewQuestions = () => {
    if (isAccessControl) {
      return [
        {
          q: "How do you ensure terminated employees or contractors do not retain access to systems?",
          a: "HR initiates an automated webhook upon employee separation. IT suspends all Okta directory sessions, invalidates API keys, and triggers Jamf/Intune remote wipe within <= 24 hours (immediate for hostile exits). We maintain timestamped deprovisioning diff logs for auditor inspection."
        },
        {
          q: "Can you show me evidence of your latest quarterly access recertification?",
          a: "Every 90 days, department heads receive an automated recertification campaign in Skanda GRC. They must re-authorize or revoke permissions for all direct reports. Uncertified access is automatically flagged and escalated after 10 business days."
        },
        {
          q: "How do you protect cloud administrator and root credentials?",
          a: "Zero standing privileges in production. Root cloud accounts have hardware FIDO2 MFA enabled and are locked in an executive physical vault. Daily operations use Just-In-Time (JIT) role elevation with temporary STS tokens expiring after 4 hours."
        }
      ];
    }
    if (isIncident) {
      return [
        {
          q: "What is your process when an employee reports a suspected security breach?",
          a: "Reports to security@... immediately alert the on-call Incident Response Team. The on-call engineer triages severity (P1 to P4) within 15 minutes. For P1/P2 incidents, an incident commander is appointed, containment commences within <= 2 hours, and evidence is preserved using cryptographic disk snapshots."
        },
        {
          q: "What are your statutory regulatory notification timeframes for data breaches?",
          a: "For confirmed PII breaches, GDPR and privacy regulations require formal notification to Supervisory Authorities within 72 hours. Enterprise customers are notified within 24 hours under our master service agreements."
        }
      ];
    }
    if (isVulnerability) {
      return [
        {
          q: "What are your remediation SLAs for Critical vulnerabilities?",
          a: "Critical vulnerabilities (CVSS 9.0+) must be remediated or mitigated with a compensating WAF rule within <= 72 hours. High vulnerabilities must be resolved within 14 days. These are tracked via automated Jira webhooks from our scanning tools."
        },
        {
          q: "When was your last external penetration test performed?",
          a: "We conduct gray-box penetration tests annually through an independent CREST-accredited vendor. All Critical and High findings must be patched and formally re-tested within 30 days."
        }
      ];
    }
    return [
      {
        q: "How do you communicate this policy to employees and ensure compliance?",
        a: "All new hires must review and digitally sign this policy within 30 days of onboarding via Skanda GRC. Annual re-attestation is mandatory. Completion rates are monitored monthly by HR and reported in Management Reviews."
      },
      {
        q: "What is your process when someone requires an exception to this policy?",
        a: "Exceptions require a formal Security Waiver ticket evaluated by the CISO. The requestor must document business justification and implement compensating controls. Approved waivers expire automatically after maximum 90 days."
      }
    ];
  };

  const artifacts = getArtifacts();
  const questions = getInterviewQuestions();

  const handleCopyArtifact = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedArtifact(text);
    setTimeout(() => setCopiedArtifact(null), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-700/80 rounded-2xl overflow-hidden shadow-xl">
      {/* Header Banner */}
      <div className="p-4 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-100">ISO 27001 Lead Auditor Defense Pack</h3>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {document.docCode}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Evidence artifacts, quantitative SLAs, and interview defense answers for Stage 2 external audit.
            </p>
          </div>
        </div>

        {onLogCAPA && (
          <button
            onClick={() =>
              onLogCAPA(
                `Operational Gap in ${document.title}`,
                document.docCode,
                `Identified operational gap or missing control evidence during internal review of ${document.title} (${document.docCode}).`
              )
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold border border-rose-500/30 transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Log Gap CAPA
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center px-4 pt-2 border-b border-slate-800 bg-slate-950/40 gap-4">
        <button
          onClick={() => setActiveTab('artifacts')}
          className={`pb-2.5 text-xs font-semibold transition-all relative flex items-center gap-1.5 ${
            activeTab === 'artifacts'
              ? 'text-amber-400 border-b-2 border-amber-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" />
          Auditor Sampling Artifacts ({artifacts.length})
        </button>
        <button
          onClick={() => setActiveTab('questions')}
          className={`pb-2.5 text-xs font-semibold transition-all relative flex items-center gap-1.5 ${
            activeTab === 'questions'
              ? 'text-amber-400 border-b-2 border-amber-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          Auditor Interview Q&A ({questions.length})
        </button>
      </div>

      {/* Tab Contents */}
      <div className="p-4">
        {activeTab === 'artifacts' ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Tangible records the external auditor will examine during Stage 2 sampling:</span>
              <span className="text-amber-400 font-mono">100% Objective Evidence Required</span>
            </div>

            <div className="space-y-2.5">
              {artifacts.map((art, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-200">{art.title}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                          {art.source}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {art.description}
                      </p>
                      <div className="text-[10px] text-emerald-400 font-medium">
                        Sampling Expectation: {art.sampleCount}
                      </div>
                    </div>

                    <button
                      onClick={() => handleCopyArtifact(`${art.title} - ${art.source}`)}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors shrink-0"
                      title="Copy artifact specification"
                    >
                      {copiedArtifact === `${art.title} - ${art.source}` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-[11px] text-slate-400">
              Anticipated interview cross-examination questions and compliant auditee defense playbook:
            </div>

            <div className="space-y-3">
              {questions.map((qItem, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 space-y-2"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-black text-amber-400 shrink-0 mt-0.5">Q:</span>
                    <span className="text-xs font-bold text-slate-200">{qItem.q}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800/80 flex items-start gap-2">
                    <span className="text-xs font-black text-emerald-400 shrink-0 mt-0.5">A:</span>
                    <p className="text-[11px] text-slate-300 leading-relaxed">{qItem.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
